// Travelpayouts Data API (Aviasales) adapter — RANKING HELPER ONLY.
// The Data API returns cached (~48 h) aggregate prices per route+date with NO
// per-itinerary times (flight-data-spec §1.5), so it CANNOT serve searchOneWayRange
// faithfully — that method returns []. It is used for phase-1 candidate ranking via
// /v1/prices/cheap (cheapest destinations from an origin, one call per origin).
// Affiliate links are built by the shared affiliateLink() regardless of provider.
import { getConfig } from "@/lib/env";
import type { AirportSuggestion, FlightOption } from "@/lib/types";
import {
  affiliateLink,
  asArr,
  asNum,
  asObj,
  asStr,
  ProviderError,
  ProviderRateLimitedError,
  type CityOption,
  type RankingFlightProvider,
} from "./provider";
import { bumpUsage } from "./usage";

const DATA_API_BASE = "https://api.travelpayouts.com";

async function dataApiFetch(
  path: string,
  params: Record<string, string>
): Promise<Record<string, unknown>> {
  void bumpUsage("travelpayouts-data"); // cost guard: count every external call (fire-and-forget)
  const token = getConfig().travelpayoutsApiKey;
  if (!token) throw new ProviderError("TRAVELPAYOUTS_API_KEY is not set", 401, false);
  const url = new URL(`${DATA_API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("token", token);
  const res = await fetch(url.toString(), {
    headers: { "X-Access-Token": token, accept: "application/json" },
    cache: "no-store",
  });
  const body: unknown = await res.json().catch(() => null);
  if (res.status === 429) {
    // Travelpayouts blocks until the minute resets; X-Rate-Limit-Reset is epoch seconds.
    const reset = Number(res.headers.get("x-rate-limit-reset"));
    const seconds =
      Number.isFinite(reset) && reset > 0
        ? Math.max(1, reset - Math.floor(Date.now() / 1000))
        : 30;
    throw new ProviderRateLimitedError(`Travelpayouts ${path} rate limited (429)`, seconds);
  }
  if (res.status < 200 || res.status >= 300) {
    throw new ProviderError(`Travelpayouts ${path} failed: HTTP ${res.status}`, res.status, res.status >= 500);
  }
  return asObj(body);
}

/** Synthetic FlightOption carrying only a price — ranking data has no times. */
function priceOnlyOption(origin: string, dest: string, date: string, priceEur: number): FlightOption {
  return {
    date,
    flightNumber: "",
    departLocal: "",
    arriveLocal: "",
    departUtc: 0,
    arriveUtc: 0,
    durationMinutes: 0,
    priceEur,
    bookingUrl: affiliateLink({ origin, dest, date, adults: 1 }),
  };
}

export const travelpayoutsDataProvider: RankingFlightProvider = {
  name: "travelpayouts-data",

  async searchAirports(query: string): Promise<AirportSuggestion[]> {
    void query;
    // No locations endpoint in the Data API — the airports table (OurAirports seed +
    // Tequila upserts) is the autocomplete source; /api/airports falls back to ILIKE.
    return [];
  },

  async searchOneWayRange(
    origin: string,
    dest: string,
    dateFrom: string,
    dateTo: string,
    adults: number
  ): Promise<FlightOption[]> {
    void origin;
    void dest;
    void dateFrom;
    void dateTo;
    void adults;
    // Data API has no per-itinerary times — cannot produce gap-valid options.
    return [];
  },

  async searchCheapestPerCity(
    origin: string,
    destCodes: string[],
    dateFrom: string,
    dateTo: string,
    adults: number
  ): Promise<CityOption[]> {
    void dateTo;
    void adults;
    const wanted = new Set(destCodes.map((c) => c.toUpperCase()));
    const body = await dataApiFetch("/v1/prices/cheap", {
      currency: "eur",
      origin,
      limit: String(Math.max(wanted.size, 30)),
    });
    const out: CityOption[] = [];
    for (const rowRaw of asArr(body.data)) {
      const row = asObj(rowRaw);
      const dest = asStr(row.destination).toUpperCase();
      const value = asNum(row.price);
      if (!wanted.has(dest) || !Number.isFinite(value)) continue;
      out.push({ destCode: dest, option: priceOnlyOption(origin, dest, dateFrom, value) });
    }
    return out;
  },

  affiliateLink,
};
