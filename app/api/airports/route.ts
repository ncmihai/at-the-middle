// GET /api/airports?q= — autocomplete. Lookup order: ILIKE '%q%' on airports.search_text
// (GIN trgm); on miss, provider.searchAirports(q) (Tequila /locations/query) with results
// upserted into airports (row TTL AIRPORT_CACHE_TTL_DAYS=30, lazy refresh on miss).
// Strictly rate limited (RATE_LIMIT_AIRPORTS_PER_MIN=30/min/IP). app-spec §3.
import { ilike } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/db/client";
import { airports } from "@/db/schema";
import { getConfig } from "@/lib/env";
import {
  callWithBackoff,
  getProvider,
  withConcurrency,
} from "@/lib/flights/provider";
import { clientKeyFrom, takeRequestSlot } from "@/lib/rate-limit";
import { airportQuerySchema } from "@/lib/validation";
import type { AirportSuggestion } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store", ...extraHeaders },
  });
}

/** Escape LIKE/ILIKE wildcards in the user query. */
function escapeLike(q: string): string {
  return q.replace(/[\\%_]/g, (m) => `\\${m}`);
}

export async function GET(request: NextRequest) {
  const cfg = getConfig();

  const key = clientKeyFrom(request.headers);
  if (key) {
    const slot = takeRequestSlot(key, Date.now(), cfg.rateLimitAirportsPerMin);
    if (!slot.ok) {
      const retryAfterSeconds = Math.max(1, Math.ceil(slot.retryAfterMs / 1000));
      return json({ error: "rate_limited", retryAfterSeconds }, 429, {
        "retry-after": String(retryAfterSeconds),
      });
    }
  }

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const parsed = airportQuerySchema.safeParse({ q });
  if (!parsed.success) {
    return json({ error: "validation_failed", issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, 400);
  }

  const db = getDb();
  const pattern = `%${escapeLike(parsed.data.q)}%`;
  const rows = await db
    .select({
      iata: airports.iata,
      name: airports.name,
      city: airports.city,
      country: airports.country,
      countryCode: airports.countryCode,
    })
    .from(airports)
    .where(ilike(airports.searchText, pattern))
    .orderBy(airports.iata)
    .limit(10);

  if (rows.length > 0) {
    const results: AirportSuggestion[] = rows.map((r) => ({
      iata: r.iata,
      name: r.name,
      city: r.city,
      country: r.country,
      countryCode: r.countryCode,
    }));
    return json({ results });
  }

  // miss → lazy refresh from the provider, upsert into airports (TTL AIRPORT_CACHE_TTL_DAYS)
  try {
    const provider = getProvider();
    const suggestions = await withConcurrency(() =>
      callWithBackoff(() => provider.searchAirports(parsed.data.q), { label: `airports '${parsed.data.q}'` })
    );
    const now = new Date();
    for (const s of suggestions) {
      await db
        .insert(airports)
        .values({
          iata: s.iata,
          name: s.name,
          city: s.city,
          country: s.country,
          countryCode: s.countryCode,
          isEu: false,
          kind: "airport",
          searchText: `${s.name} ${s.city} ${s.iata}`.toLowerCase(),
          fetchedAt: now,
        })
        .onConflictDoUpdate({
          target: airports.iata,
          set: {
            name: s.name,
            city: s.city,
            country: s.country,
            countryCode: s.countryCode,
            searchText: `${s.name} ${s.city} ${s.iata}`.toLowerCase(),
            fetchedAt: now,
          },
        });
    }
    return json({ results: suggestions.slice(0, 10) });
  } catch (err) {
    console.warn("[api/airports] provider lookup failed:", err);
    return json({ results: [] });
  }
}
