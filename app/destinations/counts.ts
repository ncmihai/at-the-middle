// Privacy-safe aggregate counts for /destinations: how many distinct searches in
// the last CHOSEN_WINDOW_DAYS had each destination among their results
// (results ⨝ searches on created_at). Counts only — no per-user data, same
// aggregation pattern as /api/popular.
//
// Server-only (uses the pg pool). Without DATABASE_URL (build/preview) or on a
// DB error it resolves to an empty map — pages render with "not chosen yet".
// A short in-module cache keeps the 120 static city renders at build time down
// to a single query per process.
import { eq, gte, sql } from "drizzle-orm";

import { getDb, isDatabaseConfigured } from "@/db/client";
import { results, searches } from "@/db/schema";

import { DESTINATION_CITIES } from "./cities";

export const CHOSEN_WINDOW_DAYS = 90;

const CACHE_MS = 5 * 60 * 1000;
let cache: { at: number; bySlug: Record<string, number> } | null = null;

/**
 * slug → number of distinct searches (last 90 days) in which any of the city's
 * airports appeared in the results. Slugs with zero searches are omitted.
 */
export async function getChosenCountsBySlug(): Promise<Record<string, number>> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) return cache.bySlug;

  const bySlug: Record<string, number> = {};
  if (isDatabaseConfigured()) {
    try {
      const since = new Date(now - CHOSEN_WINDOW_DAYS * 24 * 60 * 60 * 1000);
      const rows = await getDb()
        .select({
          iata: results.destinationIata,
          count: sql<number>`count(distinct ${results.searchId})::int`,
        })
        .from(results)
        .innerJoin(searches, eq(results.searchId, searches.id))
        .where(gte(searches.createdAt, since))
        .groupBy(results.destinationIata);
      const byIata = new Map(rows.map((r) => [r.iata, Number(r.count)]));
      for (const city of DESTINATION_CITIES) {
        // A search that produced results for two airports of the same city
        // (e.g. LGW and LHR) is counted once per airport — an acceptable,
        // documented over-count; distinct-per-city would need a SQL CASE map.
        let sum = 0;
        for (const iata of city.iatas) sum += byIata.get(iata) ?? 0;
        if (sum > 0) bySlug[city.slug] = sum;
      }
    } catch (err) {
      console.warn("[destinations] chosen-counts query failed:", err);
    }
  }

  cache = { at: now, bySlug };
  return bySlug;
}
