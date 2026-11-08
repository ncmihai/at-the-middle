// GET /api/search/[slug] — polling target. [slug] accepts the share slug OR the uuid id.
// Returns the SearchResponse shape (lib/types.ts): status, progress, results (ranked),
// relaxedGapHours, error. Opportunistic cleanup of expired searches (SEARCH_RETENTION_DAYS).
// docs/app-spec.md §3.
import { eq, inArray, lt, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { CANDIDATES_BY_IATA } from "@/db/candidates";
import { getDb } from "@/db/client";
import { airports, results, searchJobs, searches, type ResultLeg } from "@/db/schema";
import { bookingAffiliateLink, extrasAffiliateLinks } from "@/lib/affiliate";
import { getConfig } from "@/lib/env";
import type {
  AirportCoords,
  PersonLeg,
  ResultEntry,
  SearchRequest,
  SearchResponse,
  SearchStatus,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** ADDITIVE (Faza 7): affiliate "extras" are attached to the top N results only. */
const EXTRAS_TOP_RESULTS = 10;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

function toPersonLeg(f: ResultLeg["outbound"], origin: string): PersonLeg {
  return {
    origin,
    flightNumber: f.flightNumber,
    departLocal: f.departLocal,
    arriveLocal: f.arriveLocal,
    durationMinutes: f.durationMinutes,
    priceEur: f.priceEur,
    bookingUrl: f.bookingUrl,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = getDb();

  // opportunistic retention cleanup (indexed sweep; cheap)
  try {
    await db.delete(searches).where(lt(searches.expiresAt, new Date()));
  } catch (err) {
    console.warn("[api/search] retention cleanup failed:", err);
  }

  const where = UUID_RE.test(slug) ? or(eq(searches.slug, slug), eq(searches.id, slug)) : eq(searches.slug, slug);
  const [search] = await db.select().from(searches).where(where).limit(1);
  if (!search) return json({ error: "not_found" }, 404);

  const [job] = await db
    .select()
    .from(searchJobs)
    .where(eq(searchJobs.searchId, search.id))
    .limit(1);
  const resultRows = await db
    .select()
    .from(results)
    .where(eq(results.searchId, search.id))
    .orderBy(results.rank);

  const cfg = getConfig();
  const resultEntries: ResultEntry[] = await Promise.all(
    resultRows.map(async (r) => {
    const legs = r.legs as ResultLeg[];
    const dest = CANDIDATES_BY_IATA[r.destinationIata];
    const destinationCity = dest?.city ?? r.destinationIata;
    return {
      rank: r.rank,
      destinationIata: r.destinationIata,
      destinationCity,
      destinationCountry: dest?.country ?? "",
      departureDate: r.departureDate,
      returnDate: r.returnDate,
      gapMinutes: r.gapMinutes,
      totalPriceEur: Number(r.totalPriceEur),
      // ADDITIVE (Faza 4 lot 3): Booking.com stay link per result — city + trip dates as
      // checkin/checkout. Now via the Travelpayouts Links API at runtime (lib/affiliate.ts,
      // cached 1 h) with a static c84-template fallback; computed at read time so no
      // results-table migration is needed and older searches get a stay link too.
      stayUrl: await bookingAffiliateLink(destinationCity, r.departureDate, r.returnDate),
      outbound: legs.map((l) => toPersonLeg(l.outbound, l.origin.iata)),
      return: legs.map((l) => toPersonLeg(l.return, l.origin.iata)),
    };
    })
  );

  // ADDITIVE (Faza 7): affiliate "extras" (airport transfer / car rental / eSIM /
  // activities — Welcome Pickups, QEEQ, Airalo, Tiqets, all connected to trs 597282)
  // for the TOP 10 results only. Per result the 4 brand URLs go through the Links API
  // in ONE batched call (lib/affiliate.ts extrasAffiliateLinks); the loop is sequential
  // and convertViaLinksApi spaces real API calls ≥650 ms apart (100 req/min per marker
  // limit), with every converted URL cached 1 h so repeat polls are free. Any failure
  // just omits that extra — extras must never break the search response.
  for (const entry of resultEntries.slice(0, EXTRAS_TOP_RESULTS)) {
    try {
      entry.extras = await extrasAffiliateLinks({
        city: entry.destinationCity,
        country: entry.destinationCountry,
        checkin: entry.departureDate,
        checkout: entry.returnDate,
      });
    } catch (err) {
      console.warn(`[api/search] extras conversion failed for rank ${entry.rank}:`, err);
    }
  }

  const status = (job?.status === "done" ? "completed" : search.status) as SearchStatus;

  // ADDITIVE (Faza 4): echo the stored search params so the results page can offer
  // one-click "relax" re-searches (gap 30h / +50€ / +3 days).
  const request: SearchRequest = {
    origins: search.origins.map((o) => o.iata),
    windowStart: search.windowStart,
    windowEnd: search.windowEnd,
    nights: search.nights,
    budgetPerPersonEur: Number(search.budgetEur),
    maxFlightMinutes: search.maxFlightMinutes ?? null,
  };

  // ADDITIVE (Faza 4): origin coordinates for the results map — airports table first,
  // candidate shortlist as fallback (origins are usually EU airports in both).
  const originIatas = search.origins.map((o) => o.iata);
  const originCoords: Record<string, AirportCoords | null> = {};
  try {
    const rows = await db
      .select({ iata: airports.iata, latitude: airports.latitude, longitude: airports.longitude })
      .from(airports)
      .where(inArray(airports.iata, originIatas));
    for (const iata of originIatas) {
      const row = rows.find((r) => r.iata === iata);
      const cand = CANDIDATES_BY_IATA[iata];
      const latitude = row?.latitude ?? cand?.latitude ?? null;
      const longitude = row?.longitude ?? cand?.longitude ?? null;
      originCoords[iata] =
        latitude != null && longitude != null
          ? { latitude: Number(latitude), longitude: Number(longitude) }
          : null;
    }
  } catch (err) {
    console.warn("[api/search] origin coords lookup failed:", err);
  }

  const response: SearchResponse & { id: string } = {
    id: search.id,
    slug: search.slug,
    status,
    progress: {
      doneSteps: job?.doneSteps ?? 0,
      totalSteps: job?.totalSteps ?? 0,
      currentStep: job?.currentStep ?? "",
    },
    results: resultEntries,
    relaxedGapHours: search.maxGapHours > cfg.gapLimitHours ? search.maxGapHours : undefined,
    usageLimited: search.usageLimited ? true : undefined,
    createdAt: search.createdAt.toISOString(),
    error: job?.error ?? undefined,
    request,
    originCoords,
  };
  return json(response);
}
