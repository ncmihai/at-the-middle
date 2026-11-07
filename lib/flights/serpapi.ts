// SerpApi Google Flights adapter — the UNGATED real-time source for MVP (free tier:
// 250 searches/month, instant key, no approval/email — flight-data-spec §6).
// Real itineraries with departure/arrival ISO times → the arrival-gap algorithm works.
// One call per day (no range collapse), one-way (type=2), currency=EUR.
// Phase-1 ranking is delegated to the Travelpayouts Data API (real prices, no gate).
// Caveats: ToS gray (SerpApi handles the scraping), paid per search beyond the free
// tier ($0.01–0.025) — our 30-min cache + rate limits keep cost near zero at low traffic.
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
import { travelpayoutsDataProvider } from "./travelpayouts-data";
import { bumpUsage } from "./usage";

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

/**
 * SerpApi google_flights item shape: { price, total_duration, flights: [segment, ...] }
 * where each segment has departure_airport.time / arrival_airport.time (ISO), flight_number.
 * Gap uses first-segment departure → last-segment arrival (UTC epochs).
 */
function mapFlight(itemRaw: unknown, origin: string, dest: string, date: string): FlightOption | null {
  const item = asObj(itemRaw);
  const segs = asArr(item.flights);
  if (segs.length === 0) return null;
  const first = asObj(segs[0]);
  const last = asObj(segs[segs.length - 1]);
  const dep = asStr(asObj(first.departure_airport).time);
  const arr = asStr(asObj(last.arrival_airport).time);
  const price = asNum(item.price);
  if (!dep || !arr || !Number.isFinite(price) || price <= 0) return null;
  const departUtc = Math.floor(Date.parse(dep) / 1000);
  const arriveUtc = Math.floor(Date.parse(arr) / 1000);
  if (!departUtc || !arriveUtc) return null;
  const totalMin = asNum(item.total_duration);
  return {
    date,
    flightNumber: asStr(first.flight_number),
    departLocal: dep,
    arriveLocal: arr,
    departUtc,
    arriveUtc,
    durationMinutes:
      Number.isFinite(totalMin) && totalMin > 0 ? Math.round(totalMin) : Math.round((arriveUtc - departUtc) / 60),
    priceEur: price,
    // Google Flights JSON has no per-flight booking URL — the Book button goes to the
    // Kiwi deep link wrapped in our Travelpayouts marker (our commission path).
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
      void bumpUsage("serpapi"); // cost guard: one external call per day (fire-and-forget)
      const url = new URL("https://serpapi.com/search.json");
      url.searchParams.set("engine", "google_flights");
      url.searchParams.set("departure_id", origin);
      url.searchParams.set("arrival_id", dest);
      url.searchParams.set("outbound_date", d);
      url.searchParams.set("type", "2"); // one-way
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

  // Phase-1 ranking with REAL prices via the Travelpayouts Data API (no gate).
  async searchCheapestPerCity(origin, destCodes, dateFrom, dateTo, adults) {
    const fn = travelpayoutsDataProvider.searchCheapestPerCity;
    if (!fn) return [];
    return fn.call(travelpayoutsDataProvider, origin, destCodes, dateFrom, dateTo, adults);
  },

  affiliateLink,
};
