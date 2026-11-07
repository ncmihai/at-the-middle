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
import { eq, inArray } from "drizzle-orm";

import { CANDIDATES_BY_IATA, CANDIDATE_DESTINATIONS, type CandidateDestination } from "@/db/candidates";
import { getDb } from "@/db/client";
import { airports, results, searchJobs, searches, type OriginInput, type ResultLeg } from "@/db/schema";
import { getConfig } from "@/lib/env";
import type { FlightOption } from "@/lib/types";
import { cachedPerCity, cachedRange } from "@/lib/flights/cache";
import { getRankingProvider } from "@/lib/flights/provider";
import { getUsage } from "@/lib/flights/usage";

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
  const ws = search.windowStart;
  const we = search.windowEnd;
  const nights = search.nights;
  const budget = Number(search.budgetEur);
  const maxFlight = search.maxFlightMinutes ?? null;
  const topK = Math.max(1, Math.min(search.topK || cfg.topKDeepSearch, cfg.topKDeepSearch));
  const gapLimitHours = search.maxGapHours || cfg.gapLimitHours;
  const relaxedHours = cfg.gapRelaxedHours;
  const windowDays = listDates(ws, we);

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
  //         When usageLimited, cachedPerCity reads only flight_cache (no external call).
  const priceByDest = new Map<string, Map<string, number>>(); // dest → origin → cheapest one-way
  await Promise.all(
    origins.map(async (o) => {
      const entries = await cachedPerCity(
        provider,
        o.iata,
        candidates.map((c) => c.iata),
        ws,
        we,
        1,
        { cacheOnly: usageLimited }
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
  for (const destCode of ranked) {
    if (await ctx.isCancelled()) return;
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
            cachedRange(provider, o.iata, destCode, ws, we, 1, { cacheOnly: usageLimited }),
            cachedRange(provider, destCode, o.iata, addDays(ws, nights), addDays(we, nights), 1, {
              cacheOnly: usageLimited,
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
    usageLimited
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
