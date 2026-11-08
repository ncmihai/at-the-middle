// Canonical Drizzle schema — docs/app-spec.md §2 (cross-reviewed, do not drift).
// All tables use timestamptz with timezone + defaultNow(); money is numeric(10,2), never float.
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { FlightOption } from "@/lib/types";

/** One traveler origin as submitted: IATA + display label. Stored in searches.origins. */
export type OriginInput = { iata: string; label: string };

/** One person's legs inside a result row (results.legs jsonb element). */
export type ResultLeg = {
  origin: OriginInput;
  outbound: FlightOption;
  return: FlightOption;
  /** outbound.priceEur + return.priceEur for this person */
  priceEur: number;
};

/** Normalized payload stored in flight_cache.payload. */
export type FlightCachePayload =
  | { kind: "range"; dateFrom: string; dateTo: string; options: FlightOption[] }
  | {
      kind: "per-city";
      dateFrom: string;
      dateTo: string;
      entries: { destCode: string; option: FlightOption }[];
    };

const ts = (name: string) =>
  timestamp(name, { withTimezone: true, mode: "date" }).notNull().defaultNow();
const money = (name: string) =>
  numeric(name, { precision: 10, scale: 2, mode: "number" });

export const airports = pgTable(
  "airports",
  {
    iata: text("iata").primaryKey(),
    name: text("name").notNull(),
    city: text("city").notNull(),
    country: text("country").notNull(),
    countryCode: text("country_code").notNull(),
    latitude: numeric("latitude", { precision: 9, scale: 6, mode: "number" }),
    longitude: numeric("longitude", { precision: 9, scale: 6, mode: "number" }),
    isEu: boolean("is_eu").notNull().default(false),
    kind: text("kind"),
    searchText: text("search_text").notNull(),
    fetchedAt: ts("fetched_at"),
  },
  (t) => [
    // GIN trgm index for ILIKE autocomplete (needs pg_trgm — created in migration 0000).
    index("airports_search_text_trgm_idx").using(
      "gin",
      sql`${t.searchText} gin_trgm_ops`
    ),
    index("airports_is_eu_idx").on(t.isEu),
  ]
);

export const searches = pgTable(
  "searches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** unguessable share id: 72-bit base64url (12 chars) — share path /r/<slug> */
    slug: text("slug").notNull().unique(),
    status: text("status").notNull().default("queued"),
    origins: jsonb("origins").$type<OriginInput[]>().notNull(),
    windowStart: date("window_start", { mode: "string" }).notNull(),
    windowEnd: date("window_end", { mode: "string" }).notNull(),
    nights: integer("nights").notNull(),
    /** per person, EUR, includes outbound + return */
    budgetEur: money("budget_eur").notNull(),
    currency: text("currency").notNull().default("EUR"),
    /** arrival-gap limit in hours; relaxed to FLIGHTS_ARRIVAL_GAP_RELAXED_HOURS by the worker */
    maxGapHours: integer("max_gap_hours").notNull().default(24),
    maxFlightMinutes: integer("max_flight_minutes"),
    topK: integer("top_k").notNull().default(10),
    /** sha256(ip + salt) — raw IPs are never stored */
    ipHash: text("ip_hash"),
    /** true when the job ran cache-only because the provider hit PROVIDER_MONTHLY_CAP this month */
    usageLimited: boolean("usage_limited").notNull().default(false),
    createdAt: ts("created_at"),
    updatedAt: ts("updated_at"),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [
    check(
      "searches_status_check",
      sql`${t.status} in ('queued','running','completed','failed','cancelled')`
    ),
    index("searches_created_at_idx").on(t.createdAt),
  ]
);

export const searchJobs = pgTable(
  "search_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    searchId: uuid("search_id")
      .notNull()
      .unique()
      .references(() => searches.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("queued"),
    totalSteps: integer("total_steps").notNull().default(0),
    doneSteps: integer("done_steps").notNull().default(0),
    currentStep: text("current_step"),
    attempts: integer("attempts").notNull().default(0),
    /** worker lock; stale if older than 10 min */
    lockedAt: timestamp("locked_at", { withTimezone: true, mode: "date" }),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }),
    finishedAt: timestamp("finished_at", { withTimezone: true, mode: "date" }),
    error: text("error"),
    createdAt: ts("created_at"),
    updatedAt: ts("updated_at"),
  },
  (t) => [
    check(
      "search_jobs_status_check",
      sql`${t.status} in ('queued','running','done','failed','cancelled')`
    ),
    index("search_jobs_status_locked_idx").on(t.status, t.lockedAt),
  ]
);

export const flightCache = pgTable(
  "flight_cache",
  {
    /** sha256 hex of provider|origin|dest|dateFrom|dateTo|adults|currency (lowercased) */
    cacheKey: text("cache_key").primaryKey(),
    origin: text("origin").notNull(),
    /** IATA, or __multi__<sha1(codes)> for phase-1 multi-destination calls */
    dest: text("dest").notNull(),
    /** dateFrom of the range call */
    date: date("date", { mode: "string" }).notNull(),
    adults: integer("adults").notNull().default(1),
    currency: text("currency").notNull().default("EUR"),
    payload: jsonb("payload").$type<FlightCachePayload>().notNull(),
    /** denormalized for cheap pruning */
    minPriceEur: money("min_price_eur"),
    fetchedAt: ts("fetched_at"),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [index("flight_cache_expires_idx").on(t.expiresAt)]
);

export const results = pgTable(
  "results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    searchId: uuid("search_id")
      .notNull()
      .references(() => searches.id, { onDelete: "cascade" }),
    /** 1 = best */
    rank: integer("rank").notNull(),
    destinationIata: text("destination_iata").notNull(),
    departureDate: date("departure_date", { mode: "string" }).notNull(),
    /** departure + nights for everyone */
    returnDate: date("return_date", { mode: "string" }).notNull(),
    /** max(utc_arrival) − min(utc_arrival) of outbound legs, in minutes, UTC */
    gapMinutes: integer("gap_minutes").notNull(),
    totalPriceEur: money("total_price_eur").notNull(),
    /** must be ≤ budget */
    maxPricePerPersonEur: money("max_price_per_person_eur").notNull(),
    legs: jsonb("legs").$type<ResultLeg[]>().notNull(),
    createdAt: ts("created_at"),
  },
  (t) => [
    uniqueIndex("results_search_rank_uidx").on(t.searchId, t.rank),
    index("results_search_gap_idx").on(t.searchId, t.gapMinutes),
  ]
);

/**
 * provider_usage — external provider call counter per UTC month (cost guard,
 * PLAN.md Faza 3 #2). ym = YYYY-MM (UTC). One row per (ym, provider); bumped by
 * lib/flights/usage.ts on every external HTTP call an adapter makes.
 */
export const providerUsage = pgTable(
  "provider_usage",
  {
    /** YYYY-MM, UTC */
    ym: text("ym").notNull(),
    /** adapter name: tequila | travelpayouts-data | duffel | serpapi | apify */
    provider: text("provider").notNull(),
    /** external HTTP calls made in this month */
    calls: integer("calls").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.ym, t.provider] })]
);

/**
 * pageviews — privacy-safe own traffic counter (Faza 8E). One row per
 * (day, path): aggregates only, NO IPs, no per-user data — incremented by
 * proxy.ts for public GET page routes and flushed from an in-memory buffer
 * every 60 s (upsert count = count + delta). day is a UTC calendar date.
 */
export const pageviews = pgTable(
  "pageviews",
  {
    /** UTC calendar day, YYYY-MM-DD */
    day: date("day", { mode: "string" }).notNull(),
    /** public page path, e.g. /, /destinations, /blog, /r/<slug> */
    path: text("path").notNull(),
    /** aggregated pageview count for (day, path) */
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.day, t.path] })]
);

export type SearchRow = typeof searches.$inferSelect;
export type SearchJobRow = typeof searchJobs.$inferSelect;
export type ResultRow = typeof results.$inferSelect;
export type AirportRow = typeof airports.$inferSelect;
export type FlightCacheRow = typeof flightCache.$inferSelect;
export type ProviderUsageRow = typeof providerUsage.$inferSelect;
export type PageviewRow = typeof pageviews.$inferSelect;
