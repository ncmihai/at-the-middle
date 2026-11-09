// Canonical env access for midspot — names are the canonical union of
// docs/flight-data-spec.md §8 and docs/deploy-midspot.md §7 (cross-reviewed).
//
// EVERYTHING is read lazily inside getConfig(), never at module top-level, so
// `next build` works without any secrets. Server-only secrets are never
// NEXT_PUBLIC_*.
export type FlightsProviderName =
  | "tequila"
  | "travelpayouts-data"
  | "duffel"
  | "serpapi"
  | "apify"
  | "fastflights"
  | "mock";

export type MidspotConfig = {
  databaseUrl?: string;
  siteUrl: string;
  flightsProvider: FlightsProviderName;
  kiwiTequilaApiKey?: string;
  kiwiTequilaBaseUrl: string;
  travelpayoutsApiKey?: string;
  travelpayoutsMarker?: string;
  travelpayoutsTrs?: string;
  travelpayoutsSubId: string;
  travelpayoutsKiwiPromoId: string;
  /** promo_id of the Booking.com program on Travelpayouts, for the stay links (c111 click template) */
  travelpayoutsBookingPromoId: string;
  duffelAccessToken?: string;
  duffelMode: "test" | "prod";
  serpapiApiKey?: string;
  apifyToken?: string;
  fastflightsBaseUrl: string;
  flightsCacheTtlSeconds: number;
  airportCacheTtlDays: number;
  maxCandidateDestinations: number;
  maxWindowDays: number;
  maxOrigins: number;
  topKDeepSearch: number;
  maxConcurrency: number;
  gapLimitHours: number;
  gapRelaxedHours: number;
  rateLimitPerMin: number;
  rateLimitSearchPerMin: number;
  rateLimitAirportsPerMin: number;
  searchRetentionDays: number;
  /** hard monthly cap on external provider calls (per provider, UTC month); beyond it searches run cache-only (PLAN.md Faza 3 #2) */
  providerMonthlyCap: number;
  /** soft per-job time budget: stop scanning destinations past this and keep partial results */
  jobTimeBudgetMs: number;
  /** hard per-job cap on external provider calls (cache misses in cachedPerCity/cachedRange + month-matrix sampling); past it the deep-search loop stops and the job completes with partial results — anti dynamic-pricing guard */
  maxCallsPerJob: number;
  adsEnabled: boolean;
  ethicalAdsId?: string;
  carbonAdsServeId?: string;
  cronSecret?: string;
  /** salt for searches.ip_hash = sha256(ip + salt); raw IPs are never stored */
  ipHashSalt: string;
  /** Faza 8E: shared secret for GET /api/stats (header x-stats-secret); the /stats page never bundles it — the owner types it in (sessionStorage) */
  statsSecret?: string;
};

const num = (value: string | undefined, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

function buildConfig(): MidspotConfig {
  const providerRaw = (process.env.FLIGHTS_PROVIDER ?? "tequila").trim().toLowerCase();
  const flightsProvider: FlightsProviderName = (
    ["tequila", "travelpayouts-data", "duffel", "serpapi", "apify", "fastflights", "mock"].includes(providerRaw)
      ? providerRaw
      : "tequila"
  ) as FlightsProviderName;
  return {
    databaseUrl: process.env.DATABASE_URL,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3005",
    flightsProvider,
    kiwiTequilaApiKey: process.env.KIWI_TEQUILA_API_KEY,
    kiwiTequilaBaseUrl:
      process.env.KIWI_TEQUILA_BASE_URL ?? "https://tequila-api.kiwi.com",
    travelpayoutsApiKey: process.env.TRAVELPAYOUTS_API_KEY,
    travelpayoutsMarker: process.env.TRAVELPAYOUTS_MARKER,
    travelpayoutsTrs: process.env.TRAVELPAYOUTS_TRS,
    travelpayoutsSubId: process.env.TRAVELPAYOUTS_SUB_ID ?? "midspot",
    travelpayoutsKiwiPromoId:
      process.env.TRAVELPAYOUTS_KIWI_PROMO_ID ?? process.env.KIWI_PROMO_ID ?? "3791",
    // Booking.com program on Travelpayouts — promo_id shown on the official offer page
    // (travelpayouts.com/en/offers/bookingcom-affiliate-program/): 3650.
    travelpayoutsBookingPromoId: process.env.TRAVELPAYOUTS_BOOKING_PROMO_ID ?? "3650",
    duffelAccessToken: process.env.DUFFEL_ACCESS_TOKEN,
    duffelMode: process.env.DUFFEL_MODE === "prod" ? "prod" : "test",
    serpapiApiKey: process.env.SERPAPI_API_KEY,
    apifyToken: process.env.APIFY_TOKEN,
    fastflightsBaseUrl: process.env.FASTFLIGHTS_BASE_URL ?? "http://127.0.0.1:8850",
    flightsCacheTtlSeconds: num(process.env.FLIGHTS_CACHE_TTL_SECONDS, 3600),
    airportCacheTtlDays: num(process.env.AIRPORT_CACHE_TTL_DAYS, 30),
    maxCandidateDestinations: num(process.env.FLIGHTS_MAX_CANDIDATE_DESTINATIONS, 30),
    maxWindowDays: num(process.env.FLIGHTS_MAX_WINDOW_DAYS, 14),
    maxOrigins: num(process.env.FLIGHTS_MAX_ORIGINS, 8),
    topKDeepSearch: num(process.env.FLIGHTS_TOP_K_DEEP_SEARCH, 6),
    maxConcurrency: num(process.env.FLIGHTS_MAX_CONCURRENCY, 4),
    gapLimitHours: num(process.env.FLIGHTS_ARRIVAL_GAP_LIMIT_HOURS, 24),
    gapRelaxedHours: num(process.env.FLIGHTS_ARRIVAL_GAP_RELAXED_HOURS, 30),
    rateLimitPerMin: num(process.env.RATE_LIMIT_PER_MIN, 240),
    rateLimitSearchPerMin: num(process.env.RATE_LIMIT_SEARCH_PER_MIN, 5),
    rateLimitAirportsPerMin: num(process.env.RATE_LIMIT_AIRPORTS_PER_MIN, 30),
    searchRetentionDays: num(process.env.SEARCH_RETENTION_DAYS, 7),
    providerMonthlyCap: num(process.env.PROVIDER_MONTHLY_CAP, 200),
    jobTimeBudgetMs: num(process.env.JOB_TIME_BUDGET_MS, 10 * 60 * 1000),
    maxCallsPerJob: num(process.env.MAX_CALLS_PER_JOB, 400),
    adsEnabled: process.env.NEXT_PUBLIC_ADS_ENABLED === "true",
    ethicalAdsId: process.env.NEXT_PUBLIC_ETHICALADS_ID,
    carbonAdsServeId: process.env.NEXT_PUBLIC_CARBONADS_SERVE_ID,
    cronSecret: process.env.CRON_SECRET,
    ipHashSalt: process.env.IP_HASH_SALT ?? "midspot",
    statsSecret: process.env.STATS_SECRET,
  };
}

let cached: MidspotConfig | undefined;

/** Lazily-built, process-cached config snapshot. */
export function getConfig(): MidspotConfig {
  cached ??= buildConfig();
  return cached;
}

/** Test hook: force a rebuild on next getConfig(). */
export function resetConfigForTests(): void {
  cached = undefined;
}
