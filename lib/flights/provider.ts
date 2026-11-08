// Flight provider abstraction — docs/flight-data-spec.md §0/§8 and app-spec §8.
// The whole app depends only on the FlightProvider type from lib/types.ts; the
// provider is selected by FLIGHTS_PROVIDER. lib/types.ts is a fixed contract.
import { getConfig } from "@/lib/env";
import type { FlightOption, FlightProvider } from "@/lib/types";
import { tequilaProvider } from "./tequila";
import { travelpayoutsDataProvider } from "./travelpayouts-data";
import { duffelProvider } from "./duffel";
import { serpApiProvider } from "./serpapi";
import { apifyProvider } from "./apify";
import { fastflightsProvider } from "./fastflights";
import { mockProvider } from "./mock";

export type { FlightOption, FlightProvider };

/** One destination city's cheapest option over a range (phase-1 ranking). */
export type CityOption = { destCode: string; option: FlightOption };

/**
 * Optional ranking surface (app-spec §8 `searchCheapestPerCity`): one call per origin
 * returns the cheapest itinerary per candidate city over the whole window.
 * Providers that cannot rank (e.g. travelpayouts-data without a token) may return [].
 */
export interface RankingFlightProvider extends FlightProvider {
  searchCheapestPerCity?(
    origin: string,
    destCodes: string[],
    dateFrom: string,
    dateTo: string,
    adults: number
  ): Promise<CityOption[]>;
}

// ---------------------------------------------------------------------------
// Small typed accessors for untyped external API payloads (avoids `any`).
// ---------------------------------------------------------------------------
export type JsonObject = Record<string, unknown>;
export const asObj = (v: unknown): JsonObject =>
  typeof v === "object" && v !== null && !Array.isArray(v) ? (v as JsonObject) : {};
export const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
export const asNum = (v: unknown): number =>
  typeof v === "number" && Number.isFinite(v) ? v : Number.NaN;
export const asStr = (v: unknown): string => (typeof v === "string" ? v : "");

/** Provider-side error. `status` is the HTTP status when there was one. */
export class ProviderError extends Error {
  status?: number;
  /** false = do not retry (4xx other than 429) */
  transient: boolean;
  constructor(message: string, status?: number, transient = true) {
    super(message);
    this.name = "ProviderError";
    this.status = status;
    this.transient = transient;
  }
}

/** HTTP 429 (or Travelpayouts per-minute block) — the worker backs off exponentially. */
export class ProviderRateLimitedError extends ProviderError {
  retryAfterSeconds: number;
  constructor(message: string, retryAfterSeconds = 1) {
    super(message, 429, true);
    this.name = "ProviderRateLimitedError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// ---------------------------------------------------------------------------
// Affiliate deep links — flight-data-spec §2.1/§4 (Kiwi program, promo_id 3791).
// The user books at the SAME price; commission is paid by Kiwi. Only URLs with
// /deep are attributed, so a Tequila deep_link is used as custom_url only when it
// starts with https://www.kiwi.com/deep, otherwise we build the brand URL ourselves.
// ---------------------------------------------------------------------------

export function kiwiDeepUrl(args: {
  origin: string;
  dest: string;
  date: string;
  returnDate?: string;
}): string {
  let url = `https://www.kiwi.com/deep?from=${args.origin}&to=${args.dest}&departure=${args.date}`;
  if (args.returnDate) url += `&return=${args.returnDate}`;
  return url;
}

/** Wrap an arbitrary kiwi.com /deep URL in the Travelpayouts click template. */
export function wrapAffiliateDeepLink(deepUrl: string): string {
  const cfg = getConfig();
  if (!cfg.travelpayoutsMarker) return deepUrl; // no marker configured → plain deep link
  return (
    `https://c111.travelpayouts.com/click?shmarker=${cfg.travelpayoutsMarker}.` +
    `${cfg.travelpayoutsSubId}&promo_id=${cfg.travelpayoutsKiwiPromoId}` +
    `&source_type=customlink&type=click&custom_url=${encodeURIComponent(deepUrl)}`
  );
}

/** Provider-independent affiliateLink implementation (all adapters share it). */
export function affiliateLink(args: {
  origin: string;
  dest: string;
  date: string;
  returnDate?: string;
  adults: number;
}): string {
  // the kiwi /deep URL has no `adults` param — MVP: 1 adult per link, everyone books
  // their own ticket (flight-data-spec §1.2 note).
  return wrapAffiliateDeepLink(kiwiDeepUrl(args));
}

// ---------------------------------------------------------------------------
// Provider selection
// ---------------------------------------------------------------------------

let providerSingleton: FlightProvider | undefined;
let warnedNoKey = false;

/** The active provider, selected by FLIGHTS_PROVIDER (lazy, cached per process). */
export function getProvider(): FlightProvider {
  if (providerSingleton) return providerSingleton;
  const name = getConfig().flightsProvider;
  let provider: FlightProvider;
  switch (name) {
    case "tequila": {
      // Tequila is gated (≥50k MAU / invite-only). Without a key we fall back to the
      // deterministic mock so dev/build/e2e work without secrets; with a key the real
      // adapter is used. Production always sets KIWI_TEQUILA_API_KEY.
      if (!getConfig().kiwiTequilaApiKey) {
        if (!warnedNoKey) {
          warnedNoKey = true;
          console.warn(
            "[flights] FLIGHTS_PROVIDER=tequila but KIWI_TEQUILA_API_KEY is not set — falling back to the mock provider (dev only)"
          );
        }
        provider = createMockProvider();
      } else {
        provider = createTequilaProvider();
      }
      break;
    }
    case "travelpayouts-data":
      provider = createTravelpayoutsDataProvider();
      break;
    case "duffel":
      provider = createDuffelProvider();
      break;
    case "serpapi": {
      if (!getConfig().serpapiApiKey) {
        if (!warnedNoKey) {
          warnedNoKey = true;
          console.warn(
            "[flights] FLIGHTS_PROVIDER=serpapi but SERPAPI_API_KEY is not set — falling back to the mock provider"
          );
        }
        provider = createMockProvider();
      } else {
        provider = createSerpApiProvider();
      }
      break;
    }
    case "apify": {
      // Apify actor provider (real Kiwi results). Without APIFY_TOKEN we fall back to
      // the deterministic mock so the site stays functional; set APIFY_TOKEN to go live.
      if (!getConfig().apifyToken) {
        if (!warnedNoKey) {
          warnedNoKey = true;
          console.warn(
            "[flights] FLIGHTS_PROVIDER=apify but APIFY_TOKEN is not set — falling back to the mock provider"
          );
        }
        provider = createMockProvider();
      } else {
        provider = createApifyProvider();
      }
      break;
    }
    case "fastflights":
      provider = createFastflightsProvider();
      break;
    case "mock":
    default:
      provider = createMockProvider();
      break;
  }
  providerSingleton = provider;
  return provider;
}

/** The provider as a ranking provider, when it supports phase-1 ranking. */
export function getRankingProvider(): RankingFlightProvider {
  return getProvider() as RankingFlightProvider;
}

/** Test hook. */
export function resetProviderForTests(): void {
  providerSingleton = undefined;
  warnedNoKey = false;
}

// Static imports are safe: every adapter reads env lazily inside functions, so
// `next build` works without secrets.
function createTequilaProvider(): FlightProvider {
  return tequilaProvider;
}
function createTravelpayoutsDataProvider(): FlightProvider {
  return travelpayoutsDataProvider;
}
function createDuffelProvider(): FlightProvider {
  return duffelProvider;
}
function createSerpApiProvider(): FlightProvider {
  return serpApiProvider;
}
function createApifyProvider(): FlightProvider {
  return apifyProvider;
}
function createFastflightsProvider(): FlightProvider {
  return fastflightsProvider;
}
function createMockProvider(): FlightProvider {
  return mockProvider;
}

// ---------------------------------------------------------------------------
// Concurrency semaphore + 429 backoff around every external provider call
// (FLIGHTS_MAX_CONCURRENCY=4; exponential backoff 1s→2s→4s… capped at 30s,
// honoring Retry-After / X-Rate-Limit-Reset — flight-data-spec §1.4/§2.3).
// ---------------------------------------------------------------------------

const gate = { active: 0, waiters: [] as (() => void)[] };

export async function withConcurrency<T>(fn: () => Promise<T>): Promise<T> {
  const max = Math.max(1, getConfig().maxConcurrency);
  while (gate.active >= max) {
    await new Promise<void>((resolve) => gate.waiters.push(resolve));
  }
  gate.active++;
  try {
    return await fn();
  } finally {
    gate.active--;
    const next = gate.waiters.shift();
    if (next) next();
  }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Call a provider with exponential backoff on 429 (and transient 5xx/network errors).
 * Honors ProviderRateLimitedError.retryAfterSeconds (Retry-After / X-Rate-Limit-Reset).
 */
export async function callWithBackoff<T>(
  fn: () => Promise<T>,
  opts: { maxAttempts?: number; label?: string } = {}
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 5;
  let delayMs = 1000;
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is429 =
        err instanceof ProviderRateLimitedError ||
        (err instanceof ProviderError && err.status === 429);
      const transient =
        is429 ||
        (err instanceof ProviderError && err.transient) ||
        (err instanceof TypeError && err.message.includes("fetch"));
      if (!transient || attempt >= maxAttempts) throw err;
      const retryAfterMs =
        err instanceof ProviderRateLimitedError ? err.retryAfterSeconds * 1000 : 0;
      const waitMs = Math.min(30_000, Math.max(delayMs, retryAfterMs));
      console.warn(
        `[flights] ${opts.label ?? "provider call"} attempt ${attempt}/${maxAttempts} failed` +
          ` (${is429 ? "429" : "transient"}), backing off ${waitMs}ms`
      );
      await sleep(waitMs);
      delayMs = Math.min(30_000, delayMs * 2);
    }
  }
}
