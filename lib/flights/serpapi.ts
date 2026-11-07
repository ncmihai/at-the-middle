// SerpApi Google Flights adapter — LAST-RESORT fallback only (ToS risk, 250 searches/mo
// free tier — flight-data-spec §6). Minimal working stub for the free tier: one call per
// day (no range collapse), one-way, currency=EUR.
// TODO(provider-mapping): best_flights/other_flights → FlightOption mapped here
// (departure_airport.time / arrival_airport.time ISO, price, flight_number).
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
  type RankingFlightProvider,
} from "./provider";

function apiKey(): string {
  const k = getConfig().serpapiApiKey;
  if (!k) throw new ProviderError("SERPAPI_API_KEY is not set", 401, false);
  return k;
}

function addDays(dateIso: string, days: number): string {
  const d = new Date(`${dateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function mapFlight(fRaw: unknown, origin: string, dest: string, date: string): FlightOption | null {
  const f = asObj(fRaw);
  const dep = asStr(asObj(f.departure_airport).time);
  const arr = asStr(asObj(f.arrival_airport).time);
  const price = asNum(f.price);
  if (!dep || !arr || !Number.isFinite(price)) return null;
  const departUtc = Math.floor(Date.parse(dep) / 1000);
  const arriveUtc = Math.floor(Date.parse(arr) / 1000);
  return {
    date,
    flightNumber: asStr(f.flight_number),
    departLocal: dep,
    arriveLocal: arr,
    departUtc,
    arriveUtc,
    durationMinutes: Math.round((arriveUtc - departUtc) / 60),
    priceEur: price,
    bookingUrl: affiliateLink({ origin, dest, date, adults: 1 }),
  };
}

export const serpApiProvider: RankingFlightProvider = {
  name: "serpapi",

  async searchAirports(query: string): Promise<AirportSuggestion[]> {
    void query;
    return []; // no autocomplete — DB fallback covers it
  },

  async searchOneWayRange(
    origin: string,
    dest: string,
    dateFrom: string,
    dateTo: string,
    adults: number
  ): Promise<FlightOption[]> {
    void adults;
    const out: FlightOption[] = [];
    for (let d = dateFrom; d <= dateTo; d = addDays(d, 1)) {
      const url = new URL("https://serpapi.com/search.json");
      url.searchParams.set("engine", "google_flights");
      url.searchParams.set("departure_id", origin);
      url.searchParams.set("arrival_id", dest);
      url.searchParams.set("outbound_date", d);
      url.searchParams.set("currency", "EUR");
      url.searchParams.set("hl", "en");
      url.searchParams.set("api_key", apiKey());
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (res.status === 429) {
        const ra = Number(res.headers.get("retry-after"));
        throw new ProviderRateLimitedError("SerpApi 429", Number.isFinite(ra) && ra > 0 ? ra : 30);
      }
      if (!res.ok) {
        throw new ProviderError(`SerpApi failed: HTTP ${res.status}`, res.status, res.status >= 500);
      }
      const body = asObj(await res.json());
      const flights = [...asArr(body.best_flights), ...asArr(body.other_flights)];
      for (const f of flights) {
        const mapped = mapFlight(f, origin, dest, d);
        if (mapped) out.push(mapped);
      }
    }
    return out;
  },

  affiliateLink,
};
