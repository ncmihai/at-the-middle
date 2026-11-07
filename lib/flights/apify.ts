// Apify actor provider — REAL Kiwi.com search results (itineraries with times, prices,
// deep links) via the community actor `ecomscrape~kiwi-flight-search-scraper`.
// Pay-per-usage; Apify free tier includes $5/month (no card). Used as
// FLIGHTS_PROVIDER=apify until the gated Tequila API (≥50k MAU) is approved.
//
// Actor input (apify.com/ecomscrape/kiwi-flight-search-scraper/input-schema):
//   { "urls": ["https://www.kiwi.com/en/search/results/<from>/<to>/<date>/"],
//     "ignore_url_failures": true, "max_items_per_url": 30, "max_retries_per_url": 2,
//     "proxy": { "useApifyProxy": false } }
// We use the synchronous endpoint run-sync-get-dataset-items (one run per
// origin→destination covering all dates of the window as separate URLs).
// Phase-1 candidate ranking is delegated to the Travelpayouts Data API (real prices).
import { getConfig } from "@/lib/env";
import type { AirportSuggestion, FlightOption } from "@/lib/types";
import {
  affiliateLink,
  asArr,
  asNum,
  asObj,
  asStr,
  wrapAffiliateDeepLink,
  ProviderError,
  ProviderRateLimitedError,
  type RankingFlightProvider,
} from "./provider";
import { travelpayoutsDataProvider } from "./travelpayouts-data";
import { bumpUsage } from "./usage";

const ACTOR = "ecomscrape~kiwi-flight-search-scraper";
const APIFY_API = "https://api.apify.com/v2";
const RUN_TIMEOUT_MS = 180_000;
const MAX_URLS_PER_RUN = 14; // one URL per departure date in the window (≤14 days)

function kiwiSearchUrl(origin: string, dest: string, date: string): string {
  return `https://www.kiwi.com/en/search/results/${origin.toLowerCase()}/${dest.toLowerCase()}/${date}/`;
}

function listDates(from: string, to: string): string[] {
  const out: string[] = [];
  const cur = new Date(from + "T00:00:00Z");
  const end = new Date(to + "T00:00:00Z");
  while (cur <= end && out.length < MAX_URLS_PER_RUN) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

async function runActor(urls: string[], token: string): Promise<unknown[]> {
  void bumpUsage("apify"); // cost guard: count every external actor run (fire-and-forget)
  const url = `${APIFY_API}/actors/${ACTOR}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RUN_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        urls,
        ignore_url_failures: true,
        max_items_per_url: 30,
        max_retries_per_url: 2,
        proxy: { useApifyProxy: false },
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (res.status === 429) throw new ProviderRateLimitedError("apify rate limited (429)", 5);
    if (res.status === 402)
      throw new ProviderError("apify payment required — usage credits exhausted", 402, false);
    if (!res.ok)
      throw new ProviderError(`apify actor run failed: HTTP ${res.status}`, res.status, res.status >= 500);
    const body: unknown = await res.json().catch(() => null);
    return asArr(body);
  } finally {
    clearTimeout(timer);
  }
}

/** epoch seconds — accepts epoch s/ms or ISO string. */
function toEpochSec(v: unknown): number {
  const n = asNum(v);
  if (Number.isFinite(n) && n > 0) return n > 1e12 ? Math.floor(n / 1000) : Math.floor(n);
  const t = Date.parse(asStr(v));
  return Number.isFinite(t) ? Math.floor(t / 1000) : 0;
}

/** Tolerant mapping of one actor dataset item → FlightOption. Needs real times (gap). */
function mapItem(origin: string, dest: string, itemRaw: unknown): FlightOption | null {
  const item = asObj(itemRaw);
  let price = asNum(item.price);
  if (!Number.isFinite(price) || price <= 0) price = asNum(asObj(item.conversion).EUR);
  if (!Number.isFinite(price) || price <= 0) price = asNum(item.priceEur);

  const depObj = asObj(item.departure);
  const arrObj = asObj(item.arrival);
  const depUtc =
    toEpochSec(item.utc_departure) ||
    toEpochSec(depObj.timestamp) ||
    toEpochSec(item.local_departure) ||
    toEpochSec(item.departure);
  const arrUtc =
    toEpochSec(item.utc_arrival) ||
    toEpochSec(arrObj.timestamp) ||
    toEpochSec(item.local_arrival) ||
    toEpochSec(item.arrival);
  if (!Number.isFinite(price) || price <= 0 || !depUtc || !arrUtc) return null;

  const date =
    asStr(item.date) ||
    asStr(item.departureDate) ||
    new Date(depUtc * 1000).toISOString().slice(0, 10);

  let durationMinutes = asNum(item.durationMinutes);
  if (!Number.isFinite(durationMinutes)) {
    const totalSec = asNum(asObj(item.duration).total);
    if (Number.isFinite(totalSec) && totalSec > 0) durationMinutes = totalSec / 60;
    else {
      const d = asNum(item.duration);
      if (Number.isFinite(d) && d > 0) durationMinutes = d > 5000 ? d / 60 : d;
    }
  }
  if (!Number.isFinite(durationMinutes)) durationMinutes = Math.max(0, (arrUtc - depUtc) / 60);

  const route0 = asObj(asArr(item.route)[0]);
  const flightNumber =
    asStr(item.flight_no) ||
    asStr(item.flightNumber) ||
    asStr(route0.flight_no) ||
    asStr(asArr(item.airlines)[0]);

  let bookingUrl = asStr(item.deep_link) || asStr(item.deepLink) || asStr(item.bookingUrl) || asStr(item.link);
  if (bookingUrl.startsWith("https://www.kiwi.com/deep")) {
    bookingUrl = wrapAffiliateDeepLink(bookingUrl);
  } else {
    bookingUrl = affiliateLink({ origin, dest, date, adults: 1 });
  }

  return {
    date,
    flightNumber,
    departLocal: asStr(item.local_departure) || new Date(depUtc * 1000).toISOString(),
    arriveLocal: asStr(item.local_arrival) || new Date(arrUtc * 1000).toISOString(),
    departUtc: depUtc,
    arriveUtc: arrUtc,
    durationMinutes: Math.round(durationMinutes),
    priceEur: price,
    bookingUrl,
  };
}

export const apifyProvider: RankingFlightProvider = {
  name: "apify",

  async searchAirports(query: string): Promise<AirportSuggestion[]> {
    void query; // autocomplete comes from the airports table (seeded from Aviasales JSON)
    return [];
  },

  async searchOneWayRange(
    origin: string,
    dest: string,
    dateFrom: string,
    dateTo: string,
    adults: number
  ): Promise<FlightOption[]> {
    void adults;
    const token = getConfig().apifyToken;
    if (!token) throw new ProviderError("APIFY_TOKEN is not set", 401, false);
    const dates = listDates(dateFrom, dateTo);
    const urls = dates.map((d) => kiwiSearchUrl(origin, dest, d));
    const items = await runActor(urls, token);
    const out: FlightOption[] = [];
    for (const it of items) {
      const o = mapItem(origin, dest, it);
      if (o) out.push(o);
    }
    return out;
  },

  // Phase-1 ranking with REAL prices via the Travelpayouts Data API (no gate).
  async searchCheapestPerCity(origin, destCodes, dateFrom, dateTo, adults) {
    const fn = travelpayoutsDataProvider.searchCheapestPerCity;
    if (!fn) return [];
    return fn.call(travelpayoutsDataProvider, origin, destCodes, dateFrom, dateTo, adults);
  },

  affiliateLink,
};
