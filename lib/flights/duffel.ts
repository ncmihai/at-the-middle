// Duffel adapter — minimal working stub, FALLBACK for dev/test mode only.
// Duffel has no "anywhere" search and charges per confirmed order in prod, so it is
// not the MVP primary (flight-data-spec §5). Test mode is free: with DUFFEL_ACCESS_TOKEN
// set and DUFFEL_MODE=test, offer requests return synthetic-but-real-shaped offers.
// TODO(provider-mapping): Duffel offer fields → FlightOption are mapped here
// (slices[].segments[] departure.at/arrival.at ISO, duration PT..H..M, total_amount EUR).
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

const DUFFEL_BASE = "https://api.duffel.com"; // test and prod share the base; the token selects the mode

function token(): string {
  const t = getConfig().duffelAccessToken;
  if (!t) throw new ProviderError("DUFFEL_ACCESS_TOKEN is not set", 401, false);
  return t;
}

function addDays(dateIso: string, days: number): string {
  const d = new Date(`${dateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function parseIsoDuration(iso: string): number {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?$/i.exec(iso);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0);
}

function mapOffer(offerRaw: unknown, origin: string, dest: string, date: string): FlightOption | null {
  const offer = asObj(offerRaw);
  const slice = asObj(asArr(offer.slices)[0]);
  const segment = asObj(asArr(slice.segments)[0]);
  const departure = asObj(segment.departure);
  const arrival = asObj(segment.arrival);
  const depAt = asStr(departure.at);
  const arrAt = asStr(arrival.at);
  if (!depAt || !arrAt) return null;
  const total = asNum(offer.total_amount);
  const currency = asStr(offer.total_currency).toUpperCase();
  if (!Number.isFinite(total) || currency !== "EUR") return null; // MVP: EUR only
  const departUtc = Math.floor(Date.parse(depAt) / 1000);
  const arriveUtc = Math.floor(Date.parse(arrAt) / 1000);
  const carrier = asObj(segment.operating_carrier);
  const sliceDuration = parseIsoDuration(asStr(slice.duration));
  return {
    date,
    flightNumber: `${asStr(carrier.iata_code)} ${asStr(segment.flight_number)}`.trim(),
    departLocal: depAt,
    arriveLocal: arrAt,
    departUtc,
    arriveUtc,
    durationMinutes: sliceDuration > 0 ? sliceDuration : Math.round((arriveUtc - departUtc) / 60),
    priceEur: total,
    // Duffel offers carry no kiwi.com deep link — the Book button goes to kiwi.com/deep
    // with our affiliate marker; the price shown is the one at search time.
    bookingUrl: affiliateLink({ origin, dest, date, adults: 1 }),
  };
}

export const duffelProvider: RankingFlightProvider = {
  name: "duffel",

  async searchAirports(query: string): Promise<AirportSuggestion[]> {
    void query;
    return []; // Duffel has no location autocomplete — DB fallback covers it
  },

  async searchOneWayRange(
    origin: string,
    dest: string,
    dateFrom: string,
    dateTo: string,
    adults: number
  ): Promise<FlightOption[]> {
    // Duffel has no date-range search — one offer request per day (note: NOT
    // range-collapsed like Tequila; cache still collapses repeats within the TTL).
    const out: FlightOption[] = [];
    for (let d = dateFrom; d <= dateTo; d = addDays(d, 1)) {
      const res = await fetch(`${DUFFEL_BASE}/air/offer_requests`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token()}`,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          data: {
            slices: [{ origin, destination: dest, departure_date: d }],
            passengers: Array.from({ length: adults }, () => ({ type: "adult" })),
            cabin_class: "economy",
          },
        }),
        cache: "no-store",
      });
      if (res.status === 429) {
        const ra = Number(res.headers.get("retry-after"));
        throw new ProviderRateLimitedError("Duffel 429", Number.isFinite(ra) && ra > 0 ? ra : 5);
      }
      if (!res.ok) {
        throw new ProviderError(`Duffel offer_requests failed: HTTP ${res.status}`, res.status, res.status >= 500);
      }
      const body: unknown = await res.json();
      for (const offer of asArr(asObj(body).data)) {
        const mapped = mapOffer(offer, origin, dest, d);
        if (mapped) out.push(mapped);
      }
    }
    return out.slice(0, 200);
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
    // Ranking via per-destination calls would be expensive; probe only the first
    // candidate and otherwise return [] (runner falls back to centroid-ordered top-K).
    if (destCodes.length === 0) return [];
    const first = await this.searchOneWayRange(origin, destCodes[0], dateFrom, dateFrom, 1).catch(() => []);
    return first.length > 0 ? [{ destCode: destCodes[0], option: first[0] }] : [];
  },

  affiliateLink,
};
