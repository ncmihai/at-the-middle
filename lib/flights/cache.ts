// Read-through flight cache over the flight_cache table (app-spec §2/§4).
// Canonical key: sha256(provider|origin|dest|dateFrom|dateTo|adults|currency), lowercased;
// for phase-1 multi-destination calls dest = __multi__<sha1(codes)>, date = dateFrom, and the
// payload covers the whole range (dateTo in payload meta) — one range call serves all window days.
// Every external provider call goes through here, wrapped in the concurrency semaphore
// (FLIGHTS_MAX_CONCURRENCY) and the 429 backoff.
import { createHash } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";

import { getDb } from "@/db/client";
import { flightCache, type FlightCachePayload } from "@/db/schema";
import { getConfig } from "@/lib/env";
import type { FlightOption } from "@/lib/types";
import {
  callWithBackoff,
  withConcurrency,
  type CityOption,
  type RankingFlightProvider,
} from "./provider";

const sha256hex = (s: string) => createHash("sha256").update(s).digest("hex");
const sha1hex = (s: string) => createHash("sha1").update(s).digest("hex");

export function rangeCacheKey(
  provider: string,
  origin: string,
  dest: string,
  dateFrom: string,
  dateTo: string,
  adults: number,
  currency = "EUR"
): string {
  return sha256hex(
    [provider, origin, dest, dateFrom, dateTo, String(adults), currency]
      .map((p) => p.toLowerCase())
      .join("|")
  );
}

export function multiDestKey(codes: string[]): string {
  return `__multi__${sha1hex(codes.map((c) => c.toLowerCase()).sort().join(","))}`;
}

async function readCache(cacheKey: string): Promise<FlightCachePayload | null> {
  const rows = await getDb()
    .select({ payload: flightCache.payload })
    .from(flightCache)
    .where(and(eq(flightCache.cacheKey, cacheKey), gt(flightCache.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.payload ?? null;
}

async function writeCache(args: {
  cacheKey: string;
  origin: string;
  dest: string;
  date: string;
  adults: number;
  currency: string;
  payload: FlightCachePayload;
  minPriceEur: number | null;
}): Promise<void> {
  const cfg = getConfig();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + cfg.flightsCacheTtlSeconds * 1000);
  await getDb()
    .insert(flightCache)
    .values({
      cacheKey: args.cacheKey,
      origin: args.origin.toUpperCase(),
      dest: args.dest,
      date: args.date,
      adults: args.adults,
      currency: args.currency,
      payload: args.payload,
      minPriceEur: args.minPriceEur,
      fetchedAt: now,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: flightCache.cacheKey,
      set: {
        payload: args.payload,
        minPriceEur: args.minPriceEur,
        fetchedAt: now,
        expiresAt,
      },
    });
}

/**
 * Cached searchOneWayRange: one provider call per (origin, dest, range, adults) within the
 * TTL, across jobs. Returns options tagged with their departure date.
 */
export async function cachedRange(
  provider: RankingFlightProvider,
  origin: string,
  dest: string,
  dateFrom: string,
  dateTo: string,
  adults: number
): Promise<FlightOption[]> {
  const key = rangeCacheKey(provider.name, origin, dest, dateFrom, dateTo, adults);
  const hit = await readCache(key);
  if (hit && hit.kind === "range") return hit.options;
  const options = await withConcurrency(() =>
    callWithBackoff(() => provider.searchOneWayRange(origin, dest, dateFrom, dateTo, adults), {
      label: `range ${origin}→${dest} ${dateFrom}..${dateTo}`,
    })
  );
  const minPriceEur = options.length > 0 ? Math.min(...options.map((o) => o.priceEur)) : null;
  await writeCache({
    cacheKey: key,
    origin,
    dest,
    date: dateFrom,
    adults,
    currency: "EUR",
    payload: { kind: "range", dateFrom, dateTo, options },
    minPriceEur: Number.isFinite(minPriceEur) ? minPriceEur : null,
  });
  return options;
}

/**
 * Cached phase-1 ranking call: one provider call per (origin, candidate set, range).
 * Returns the cheapest option per destination city.
 */
export async function cachedPerCity(
  provider: RankingFlightProvider,
  origin: string,
  destCodes: string[],
  dateFrom: string,
  dateTo: string,
  adults: number
): Promise<CityOption[]> {
  if (typeof provider.searchCheapestPerCity !== "function" || destCodes.length === 0) return [];
  const dest = multiDestKey(destCodes);
  const key = rangeCacheKey(provider.name, origin, dest, dateFrom, dateTo, adults);
  const hit = await readCache(key);
  if (hit && hit.kind === "per-city") return hit.entries;
  const entries = await withConcurrency(() =>
    callWithBackoff(
      () => provider.searchCheapestPerCity!(origin, destCodes, dateFrom, dateTo, adults),
      { label: `per-city ${origin}→${destCodes.length} cities`, }
    )
  );
  const minPriceEur = entries.length > 0 ? Math.min(...entries.map((e) => e.option.priceEur)) : null;
  await writeCache({
    cacheKey: key,
    origin,
    dest,
    date: dateFrom,
    adults,
    currency: "EUR",
    payload: { kind: "per-city", dateFrom, dateTo, entries },
    minPriceEur: Number.isFinite(minPriceEur) ? minPriceEur : null,
  });
  return entries;
}
