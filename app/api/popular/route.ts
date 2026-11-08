// GET /api/popular — "Popular middle spots" for the landing page (PLAN.md Faza 6).
// Top destinations by search volume over the last 30 days, minimum 3 searches each,
// aggregated over results ⨝ searches (privacy-safe: counts only, no per-user data).
// Enriched with CANDIDATES_BY_IATA for city/country. In-memory cache 5 min.
// Response: { spots: [{ iata, city, country, count }] } — always no-store.
// Rate-limited in proxy.ts (dedicated 60/min/IP bucket for /api/popular).
import { desc, eq, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { CANDIDATES_BY_IATA } from "@/db/candidates";
import { getDb, isDatabaseConfigured } from "@/db/client";
import { results, searches } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_DAYS = 30;
const MIN_SEARCHES = 3;
const LIMIT = 6;
const CACHE_MS = 5 * 60 * 1000;

type PopularSpot = { iata: string; city: string; country: string; count: number };
type PopularResponse = { spots: PopularSpot[] };

let cache: { at: number; body: PopularResponse } | null = null;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) {
    return json(cache.body);
  }
  if (!isDatabaseConfigured()) {
    // no DB (e.g. build/preview) — the landing hides the section on empty
    return json({ spots: [] });
  }

  const since = new Date(now - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const rows = await getDb()
    .select({
      iata: results.destinationIata,
      count: sql<number>`count(*)::int`,
    })
    .from(results)
    .innerJoin(searches, eq(results.searchId, searches.id))
    .where(gte(searches.createdAt, since))
    .groupBy(results.destinationIata)
    .having(sql`count(*) >= ${MIN_SEARCHES}`)
    .orderBy(desc(sql`count(*)`))
    .limit(LIMIT);

  const spots: PopularSpot[] = rows.map((r) => {
    const cand = CANDIDATES_BY_IATA[r.iata];
    return {
      iata: r.iata,
      city: cand?.city ?? r.iata,
      country: cand?.country ?? "",
      count: Number(r.count),
    };
  });
  const body: PopularResponse = { spots };
  cache = { at: now, body };
  return json(body);
}
