// The two-phase, range-collapsed search algorithm — docs/app-spec.md §5 (canonical).
//
// Phase 1 (N calls): per origin, ONE call fly_to=<candidates>&one_for_city=1 → cheapest
//   per city over the whole window; budget prefilter (any origin's cheapest > B → drop);
//   top K = FLIGHTS_TOP_K_DEEP_SEARCH.
// Phase 2 (≤ 2·N·K calls): per (top destination, origin) ONE outbound range call
//   (date_from=ws, date_to=we, one_per_date=1) + ONE return range call (ws+k..we+k), cached.
// Per (destination, departure day t): per-person price = outbound+return ≤ B; gap from the
//   outbound utc_arrival epochs; valid if gap ≤ 24 h. If zero entries after everything,
//   re-evaluate with 30 h — ZERO new external calls (payloads are already in flight_cache).
// Ranking: gap asc, then total price asc; top 20 persisted incrementally into `results`
//   so polling clients see partial results. Soft per-job time budget (JOB_TIME_BUDGET_MS,
//   ~10 min) → completed with partial results.
//
// Month mode (window span > 14 days, e.g. a whole month): before phases 1-2 we pick the
//   CHEAPEST contiguous 14-day sub-window via the Travelpayouts Data API
//   /v2/prices/month-matrix (currency=eur, origin, month=YYYY-MM, one call per origin)
//   and run phases 1-2 on that sub-window. Fallback (API error / no token / no data):
//   the first 14 days of the window.
//
// Anti dynamic-pricing guards: repeated identical searches against a flight provider can
//   trigger dynamic price increases (fare bucketing), so alongside the 30-min flight_cache,
//   the 5/min POST /api/search rate limit and PROVIDER_MONTHLY_CAP, every job also has a
//   hard budget of external provider calls (MAX_CALLS_PER_JOB, default 400). The counter
//   below is threaded through the cache layer — cachedPerCity/cachedRange call the provider
//   only on a cache MISS — so wrapping the provider counts exactly those external calls
//   (plus the month-matrix sampling calls). When the budget is exhausted the deep-search
//   loop stops and the job completes with partial results + a progress note.
import { eq, inArray } from "drizzle-orm";

import { CANDIDATES_BY_IATA, CANDIDATE_DESTINATIONS, type CandidateDestination } from "@/db/candidates";
import { getDb } from "@/db/client";
import { airports, results, searchJobs, searches, type OriginInput, type ResultLeg } from "@/db/schema";
import { getConfig } from "@/lib/env";
import type { FlightOption } from "@/lib/types";
import { cachedPerCity, cachedRange } from "@/lib/flights/cache";
import {
  asNum,
  asObj,
  callWithBackoff,
  getRankingProvider,
  ProviderError,
  ProviderRateLimitedError,
  withConcurrency,
  type RankingFlightProvider,
} from "@/lib/flights/provider";
import { bumpUsage, getUsage } from "@/lib/flights/usage";
import { en } from "@/lib/i18n/en";

export interface RunSearchContext {
  isCancelled: () => Promise<boolean>;
  startedAtMs: number;
}

interface CandidateEntry {
  dest: CandidateDestination;
  departureDate: string;
  returnDate: string;
  gapMinutes: number;
  totalPriceEur: number;
  maxPricePerPersonEur: number;
  legs: ResultLeg[];
}

const TOP_RESULTS = 20;
/** month mode: phases 1-2 run on the cheapest contiguous SUB_WINDOW_DAYS-day sub-window */
const SUB_WINDOW_DAYS = 14;
const round2 = (n: number) => Math.round(n * 100) / 100;

function addDays(dateIso: string, days: number): string {
  const d = new Date(`${dateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function listDates(dateFrom: string, dateTo: string): string[] {
  const out: string[] = [];
  for (let d = dateFrom; d <= dateTo; d = addDays(d, 1)) out.push(d);
  return out;
}

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Flight-time estimate: distance/800 km·h⁻¹ × 60 + 60 min overhead (app-spec §5 step 1). */
function estimateFlightMinutes(
  from: { lat: number; lon: number } | undefined,
  to: { lat: number; lon: number }
): number {
  if (!from) return 0;
  return (haversineKm(from, to) / 800) * 60 + 60;
}

function groupByDate(options: FlightOption[]): Map<string, FlightOption[]> {
  const m = new Map<string, FlightOption[]>();
  for (const o of options) {
    const arr = m.get(o.date) ?? [];
    arr.push(o);
    m.set(o.date, arr);
  }
  return m;
}

const cheapest = (opts: FlightOption[]): FlightOption =>
  opts.reduce((a, b) => (b.priceEur < a.priceEur ? b : a));

// ---------------------------------------------------------------------------
// Month-mode sampling: Travelpayouts Data API /v2/prices/month-matrix
// ---------------------------------------------------------------------------

const DATA_API_BASE = "https://api.travelpayouts.com";

/** Extract a price from a month-matrix cell: number | {price|value} | array of those. */
function matrixPrice(v: unknown): number {
  if (typeof v === "number") return v;
  if (Array.isArray(v)) {
    let min = Infinity;
    for (const item of v) {
      const p = matrixPrice(item);
      if (Number.isFinite(p) && p < min) min = p;
    }
    return min;
  }
  const o = asObj(v);
  return asNum(o.price ?? o.value);
}

/**
 * ONE Travelpayouts Data API /v2/prices/month-matrix call per origin+month
 * (currency=eur, origin, month=YYYY-MM). Returns date -> cheapest price over all
 * destinations that day (EUR). Counts toward the per-job external-call budget
 * (callCounter) and the monthly provider usage (PROVIDER_MONTHLY_CAP accounting).
 * Returns an empty map when TRAVELPAYOUTS_API_KEY is not set (caller falls back).
 */
async function fetchMonthMatrix(
  callCounter: { calls: number },
  origin: string,
  month: string
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const token = getConfig().travelpayoutsApiKey;
  if (!token) return out;
  callCounter.calls++; // external provider call — anti dynamic-pricing budget
  void bumpUsage("travelpayouts-data"); // keep the monthly cap accounting consistent
  const url = new URL(`${DATA_API_BASE}/v2/prices/month-matrix`);
  url.searchParams.set("currency", "eur");
  url.searchParams.set("origin", origin.toUpperCase());
  url.searchParams.set("month", month);
  url.searchParams.set("token", token);
  const body = await withConcurrency(() =>
    callWithBackoff(
      async () => {
        const res = await fetch(url.toString(), {
          headers: { "X-Access-Token": token, accept: "application/json" },
          cache: "no-store",
        });
        if (res.status === 429) {
          const reset = Number(res.headers.get("x-rate-limit-reset"));
          const seconds =
            Number.isFinite(reset) && reset > 0
              ? Math.max(1, reset - Math.floor(Date.now() / 1000))
              : 30;
          throw new ProviderRateLimitedError(`month-matrix ${origin} ${month} 429`, seconds);
        }
        if (res.status < 200 || res.status >= 300) {
          throw new ProviderError(
            `month-matrix ${origin} ${month} HTTP ${res.status}`,
            res.status,
            res.status >= 500
          );
        }
        return (await res.json().catch(() => null)) as unknown;
      },
      { label: `month-matrix ${origin} ${month}` }
    )
  );
  // Response shape is data[dest][date] = cell or data[date][dest] = cell (cell may be an
  // array grouped by transfers) — handle both, keeping the cheapest price per date.
  const data = asObj(asObj(body).data);
  const add = (date: string, price: number) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(price)) return;
    const prev = out.get(date);
    if (prev == null || price < prev) out.set(date, price);
  };
  for (const [k, v] of Object.entries(data)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k)) {
      const direct = matrixPrice(v);
      if (Number.isFinite(direct)) add(k, direct);
      else {
        for (const dv of Object.values(asObj(v))) {
          const p = matrixPrice(dv);
          if (Number.isFinite(p)) add(k, p);
        }
      }
    } else {
      for (const [date, dv] of Object.entries(asObj(v))) add(date, matrixPrice(dv));
    }
  }
  return out;
}


async function coordsForOrigins(
  origins: OriginInput[]
): Promise<Map<string, { lat: number; lon: number } | undefined>> {
  const iatas = origins.map((o) => o.iata);
  const map = new Map<string, { lat: number; lon: number } | undefined>();
  if (iatas.length > 0) {
    const rows = await getDb()
      .select({ iata: airports.iata, lat: airports.latitude, lon: airports.longitude })
      .from(airports)
      .where(inArray(airports.iata, iatas));
    for (const r of rows) {
      if (r.lat != null && r.lon != null) map.set(r.iata, { lat: Number(r.lat), lon: Number(r.lon) });
    }
  }
  for (const o of origins) {
    if (!map.has(o.iata)) {
      const c = CANDIDATES_BY_IATA[o.iata];
      if (c) map.set(o.iata, { lat: c.latitude, lon: c.longitude });
    }
  }
  return map;
}

export async function runSearchJob(jobId: string, ctx: RunSearchContext): Promise<void> {
  const cfg = getConfig();
  const db = getDb();
  const [job] = await db.select().from(searchJobs).where(eq(searchJobs.id, jobId)).limit(1);
  if (!job) throw new Error(`job ${jobId} not found`);
  const [search] = await db.select().from(searches).where(eq(searches.id, job.searchId)).limit(1);
  if (!search) throw new Error(`search ${job.searchId} not found`);

  // dedupe origins (duplicate cities collapse to one origin)
  const seen = new Set<string>();
  const origins = search.origins.filter((o) => {
    if (seen.has(o.iata)) return false;
    seen.add(o.iata);
    return true;
  });
  const originSet = new Set(origins.map((o) => o.iata));
  // ws/we may be narrowed to the cheapest 14-day sub-window in month mode (see 0c below)
  let ws = search.windowStart;
  let we = search.windowEnd;
  const nights = search.nights;
  const budget = Number(search.budgetEur);
  const maxFlight = search.maxFlightMinutes ?? null;
  const topK = Math.max(1, Math.min(search.topK || cfg.topKDeepSearch, cfg.topKDeepSearch));
  const gapLimitHours = search.maxGapHours || cfg.gapLimitHours;
  const relaxedHours = cfg.gapRelaxedHours;

  let lastProgressWrite = 0;
  const writeProgress = async (done: number, total: number, step: string, force = false) => {
    const nowMs = Date.now();
    if (!force && nowMs - lastProgressWrite < 1000) return; // throttle to ≤ 1 write/s
    lastProgressWrite = nowMs;
    await db
      .update(searchJobs)
      .set({ doneSteps: done, totalSteps: total, currentStep: step, updatedAt: new Date() })
      .where(eq(searchJobs.id, jobId));
  };

  await db
    .update(searches)
    .set({ status: "running", updatedAt: new Date() })
    .where(eq(searches.id, search.id));

  // ---- 0. Monthly provider cost guard (PLAN.md Faza 3 #2): if the active provider
  //         already made PROVIDER_MONTHLY_CAP external calls this UTC month, the whole
  //         job runs cache-only — phase 1 and phase 2 read ONLY flight_cache, zero new
  //         external calls (results may be empty/partial). Never throws because of the cap.
  const provider = getRankingProvider();
  const providerCap = cfg.providerMonthlyCap;
  const providerCalls = await getUsage(provider.name);
  const usageLimited = providerCalls >= providerCap;
  if (usageLimited) {
    await db
      .update(searches)
      .set({ usageLimited: true, updatedAt: new Date() })
      .where(eq(searches.id, search.id));
    console.warn(
      `[run-search] job ${jobId}: ${provider.name} monthly cap reached (${providerCalls}/${providerCap} calls) — running cache-only`
    );
  }
  await writeProgress(
    0,
    1,
    usageLimited
      ? `monthly provider limit reached (${providerCalls}/${providerCap} calls this month) — serving cached results only`
      : "phase 1/2 · ranking candidates",
    true
  );

  // ---- 0b. Per-job external-call budget (anti dynamic-pricing guard — see the header
  //         comment). The counter is threaded through the cache layer: cachedPerCity /
  //         cachedRange invoke the provider ONLY on a cache miss, so wrapping the provider
  //         counts exactly those external calls (plus the month-matrix calls in 0c).
  const callCounter = { calls: 0 };
  const maxCallsPerJob = cfg.maxCallsPerJob;
  const capReached = () => callCounter.calls >= maxCallsPerJob;
  const countingProvider: RankingFlightProvider = {
    ...provider,
    searchOneWayRange: (origin, dest, dateFrom, dateTo, adults) => {
      callCounter.calls++; // cache miss in cachedRange → one external provider call
      return provider.searchOneWayRange(origin, dest, dateFrom, dateTo, adults);
    },
  };
  if (typeof provider.searchCheapestPerCity === "function") {
    countingProvider.searchCheapestPerCity = (origin, destCodes, dateFrom, dateTo, adults) => {
      callCounter.calls++; // cache miss in cachedPerCity → one external provider call
      return provider.searchCheapestPerCity!(origin, destCodes, dateFrom, dateTo, adults);
    };
  }

  // ---- 0c. Month mode (window span > 14 days, e.g. a whole month): pick the CHEAPEST
  //         contiguous 14-day sub-window before phases 1-2. One month-matrix call per
  //         origin (Travelpayouts Data API /v2/prices/month-matrix, currency=eur,
  //         month=YYYY-MM); per day we take each origin's cheapest destination price and
  //         aggregate across origins (max = the bottleneck traveler). The sub-window with
  //         the lowest max-over-origins price wins; fallback: the first 14 days.
  const allWindowDays = listDates(ws, we);
  if (allWindowDays.length > SUB_WINDOW_DAYS) {
    const month = ws.slice(0, 7);
    await writeProgress(0, 1, en.form.monthSampling(month), true);
    const matrices = await Promise.all(
      origins.map((o) =>
        fetchMonthMatrix(callCounter, o.iata, month).catch((err) => {
          console.warn(`[run-search] month-matrix failed for ${o.iata} ${month}:`, err);
          return new Map<string, number>();
        })
      )
    );
    let bestStart: string | null = null;
    let bestScore = Infinity;
    for (let i = 0; i + SUB_WINDOW_DAYS <= allWindowDays.length; i++) {
      const win = allWindowDays.slice(i, i + SUB_WINDOW_DAYS);
      let score = -Infinity;
      let ok = true;
      for (const m of matrices) {
        let min = Infinity;
        for (const d of win) {
          const p = m.get(d);
          if (p != null && Number.isFinite(p) && p < min) min = p;
        }
        if (!Number.isFinite(min)) {
          ok = false; // this origin has no price anywhere in the window
          break;
        }
        score = Math.max(score, min); // max over origins of the in-window cheapest
      }
      if (ok && score < bestScore) {
        bestScore = score;
        bestStart = win[0];
      }
    }
    if (bestStart) {
      ws = bestStart;
      we = addDays(bestStart, SUB_WINDOW_DAYS - 1);
      console.log(
        `[run-search] job ${jobId}: month mode — cheapest ${SUB_WINDOW_DAYS}-day sub-window ${ws}..${we} (max-over-origins €${round2(bestScore)})`
      );
    } else {
      // fallback: API failed / no token / no usable data → first 14 days of the window
      we = addDays(ws, SUB_WINDOW_DAYS - 1);
      console.warn(
        `[run-search] job ${jobId}: month-matrix unusable — falling back to the first ${SUB_WINDOW_DAYS} days ${ws}..${we}`
      );
    }
  }
  const windowDays = listDates(ws, we);

  // ---- 1. Candidate destinations: EU shortlist minus origins, ordered by haversine
  //         distance to the origins' centroid ascending, capped at FLIGHTS_MAX_CANDIDATE_DESTINATIONS.
  const originCoords = await coordsForOrigins(origins);
  const known = origins
    .map((o) => originCoords.get(o.iata))
    .filter((c): c is { lat: number; lon: number } => Boolean(c));
  const centroid =
    known.length > 0
      ? {
          lat: known.reduce((s, c) => s + c.lat, 0) / known.length,
          lon: known.reduce((s, c) => s + c.lon, 0) / known.length,
        }
      : { lat: 0, lon: 0 };
  let candidates = CANDIDATE_DESTINATIONS.filter((c) => !originSet.has(c.iata))
    .map((c) => ({ c, d: haversineKm(centroid, { lat: c.latitude, lon: c.longitude }) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, cfg.maxCandidateDestinations)
    .map((x) => x.c);
  if (maxFlight) {
    candidates = candidates.filter((c) =>
      origins.every((o) => estimateFlightMinutes(originCoords.get(o.iata), { lat: c.latitude, lon: c.longitude }) <= maxFlight!)
    );
  }

  // ---- 2. Phase 1 — cold ranking: ONE call per origin (fly_to=<C>&one_for_city=1).
  //         When usageLimited (or the per-job call budget is already spent), cachedPerCity
  //         reads only flight_cache (no external call).
  const priceByDest = new Map<string, Map<string, number>>(); // dest → origin → cheapest one-way
  await Promise.all(
    origins.map(async (o) => {
      const entries = await cachedPerCity(
        countingProvider,
        o.iata,
        candidates.map((c) => c.iata),
        ws,
        we,
        1,
        { cacheOnly: usageLimited || capReached() }
      ).catch((err) => {
        console.warn(`[run-search] phase-1 ranking failed for ${o.iata}:`, err);
        return [];
      });
      for (const e of entries) {
        if (!Number.isFinite(e.option.priceEur)) continue;
        let m = priceByDest.get(e.destCode);
        if (!m) {
          m = new Map();
          priceByDest.set(e.destCode, m);
        }
        m.set(o.iata, Math.min(m.get(o.iata) ?? Infinity, e.option.priceEur));
      }
    })
  );

  let ranked: string[];
  if (priceByDest.size > 0) {
    ranked = [...priceByDest.entries()]
      // budget prefilter: drop when any origin has no option or its cheapest > budget
      .filter(
        ([, m]) =>
          origins.every((o) => m.has(o.iata)) &&
          Math.max(...origins.map((o) => m.get(o.iata)!)) <= budget
      )
      .map(([dest, m]) => ({ dest, score: Math.max(...origins.map((o) => m.get(o.iata)!)) }))
      .sort((a, b) => a.score - b.score)
      .map((x) => x.dest)
      .slice(0, topK);
  } else {
    // provider cannot rank (e.g. travelpayouts-data without a token) → centroid order
    ranked = candidates.slice(0, topK).map((c) => c.iata);
  }

  const totalSteps = 1 + ranked.length;
  await writeProgress(1, totalSteps, `phase 2/2 · ${ranked.length} destinations`, true);

  // ---- 3. Phase 2 — hot deep search: per (dest, origin) one outbound + one return range call.
  const allEntries: CandidateEntry[] = [];
  let doneSteps = 1;
  let callCapHit = false;
  for (const destCode of ranked) {
    if (await ctx.isCancelled()) return;
    if (capReached()) {
      // per-job external-call budget exhausted (MAX_CALLS_PER_JOB) → stop the deep-search
      // loop and complete with the partial results gathered so far
      callCapHit = true;
      console.warn(
        `[run-search] job ${jobId}: per-job call budget reached (${callCounter.calls}/${maxCallsPerJob} external calls) — completing with partial results`
      );
      break;
    }
    if (Date.now() - ctx.startedAtMs > cfg.jobTimeBudgetMs) {
      console.warn(`[run-search] job ${jobId} hit the time budget — completing with partial results`);
      break;
    }
    const dest: CandidateDestination = CANDIDATES_BY_IATA[destCode] ?? {
      iata: destCode,
      city: destCode,
      country: "",
      countryCode: "",
      latitude: 0,
      longitude: 0,
    };
    try {
      const outboundByOrigin = new Map<string, Map<string, FlightOption[]>>();
      const returnByOrigin = new Map<string, Map<string, FlightOption[]>>();
      await Promise.all(
        origins.map(async (o) => {
          const [out, ret] = await Promise.all([
            cachedRange(countingProvider, o.iata, destCode, ws, we, 1, {
              cacheOnly: usageLimited || capReached(),
            }),
            cachedRange(countingProvider, destCode, o.iata, addDays(ws, nights), addDays(we, nights), 1, {
              cacheOnly: usageLimited || capReached(),
            }),
          ]);
          outboundByOrigin.set(o.iata, groupByDate(out));
          returnByOrigin.set(o.iata, groupByDate(ret));
        })
      );

      for (const t of windowDays) {
        const r = addDays(t, nights); // return = departure + nights for everyone
        const legs: ResultLeg[] = [];
        let ok = true;
        let maxPrice = 0;
        let total = 0;
        let minArrive = Infinity;
        let maxArrive = -Infinity;
        for (const o of origins) {
          const outOpts = (outboundByOrigin.get(o.iata)?.get(t) ?? []).filter(
            (x) => !maxFlight || x.durationMinutes <= maxFlight
          );
          const retOpts = returnByOrigin.get(o.iata)?.get(r) ?? [];
          if (outOpts.length === 0 || retOpts.length === 0) {
            ok = false;
            break;
          }
          const out = cheapest(outOpts);
          const ret = cheapest(retOpts);
          const price = round2(out.priceEur + ret.priceEur);
          if (price > budget) {
            ok = false; // per-person price (incl. return) must be ≤ budget
            break;
          }
          maxPrice = Math.max(maxPrice, price);
          total += price;
          // gap from the OUTBOUND utc_arrival epochs only (UTC, DST-safe)
          minArrive = Math.min(minArrive, out.arriveUtc);
          maxArrive = Math.max(maxArrive, out.arriveUtc);
          legs.push({ origin: o, outbound: out, return: ret, priceEur: price });
        }
        if (!ok) continue;
        allEntries.push({
          dest,
          departureDate: t,
          returnDate: r,
          gapMinutes: Math.round((maxArrive - minArrive) / 60),
          totalPriceEur: round2(total),
          maxPricePerPersonEur: round2(maxPrice),
          legs,
        });
      }
    } catch (err) {
      console.warn(`[run-search] destination ${destCode} failed:`, err);
      // keep partial results, continue with the next destination
    }
    doneSteps++;
    // incremental persist: top-20 so far at the current gap limit (partial results stream in)
    await persistResults(search.id, allEntries, gapLimitHours);
    await writeProgress(doneSteps, totalSteps, `phase 2/2 · ${destCode}`);
  }

  // ---- 4. Gap relaxation: zero valid entries at the strict limit → re-evaluate at the
  //         relaxed limit. ZERO extra external calls — payloads are already cached.
  let effectiveGapHours = gapLimitHours;
  if (!allEntries.some((e) => e.gapMinutes <= gapLimitHours * 60) && relaxedHours > gapLimitHours) {
    if (allEntries.some((e) => e.gapMinutes <= relaxedHours * 60)) {
      effectiveGapHours = relaxedHours;
      await db
        .update(searches)
        .set({ maxGapHours: relaxedHours, updatedAt: new Date() })
        .where(eq(searches.id, search.id));
    }
  }

  // ---- 5. Final ranking: gap asc, then total price asc; top 20.
  await persistResults(search.id, allEntries, effectiveGapHours);
  await writeProgress(
    totalSteps,
    totalSteps,
    callCapHit
      ? `done — per-job call budget reached (${callCounter.calls}/${maxCallsPerJob} external calls), partial results`
      : usageLimited
        ? `done — monthly provider limit reached (${providerCalls}/${providerCap}), cache-only results`
        : "done",
    true
  );
}

/** Rank valid entries (gap ≤ limit) by gap asc then total asc, keep top 20, replace rows. */
async function persistResults(
  searchId: string,
  entries: CandidateEntry[],
  gapLimitHours: number
): Promise<void> {
  const valid = entries
    .filter((e) => e.gapMinutes <= gapLimitHours * 60)
    .sort((a, b) => a.gapMinutes - b.gapMinutes || a.totalPriceEur - b.totalPriceEur)
    .slice(0, TOP_RESULTS);
  const db = getDb();
  await db.delete(results).where(eq(results.searchId, searchId));
  for (let i = 0; i < valid.length; i++) {
    const e = valid[i];
    await db.insert(results).values({
      searchId,
      rank: i + 1,
      destinationIata: e.dest.iata,
      departureDate: e.departureDate,
      returnDate: e.returnDate,
      gapMinutes: e.gapMinutes,
      totalPriceEur: e.totalPriceEur,
      maxPricePerPersonEur: e.maxPricePerPersonEur,
      legs: e.legs,
    });
  }
}
