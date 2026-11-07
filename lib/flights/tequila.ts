// Kiwi Tequila adapter — primary provider (FLIGHTS_PROVIDER=tequila).
// Endpoints and field mapping are canonical per docs/flight-data-spec.md §1.2:
//   GET /locations/query  (autocomplete, header `apikey`)
//   GET /v2/search        (fly_from/fly_to/date_from/date_to dd/mm/YYYY, one_per_date,
//                          one_for_city, curr=EUR, sort=price, limit<=200)
// FlightOption mapping: utc_departure/utc_arrival (epoch s — the gap is computed from
// these, never from local times), local_departure/local_arrival (display only),
// price with curr=EUR (or conversion.EUR), duration.total/60, route[0] airline+flight_no,
// deep_link wrapped in the Travelpayouts click template (only https://www.kiwi.com/deep*).
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
  wrapAffiliateDeepLink,
  type CityOption,
  type RankingFlightProvider,
} from "./provider";

function baseUrl(): string {
  return getConfig().kiwiTequilaBaseUrl.replace(/\/+$/, "");
}

function apiKey(): string {
  const key = getConfig().kiwiTequilaApiKey;
  if (!key) throw new ProviderError("KIWI_TEQUILA_API_KEY is not set", 401, false);
  return key;
}

/** YYYY-MM-DD → dd/mm/YYYY (Tequila date format). */
function toTequilaDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Throws ProviderRateLimitedError on 429, ProviderError on other non-2xx. */
async function tequilaFetch(
  path: string,
  params: Record<string, string>
): Promise<Record<string, unknown>> {
  const url = new URL(`${baseUrl()}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), {
    headers: {
      apikey: apiKey(),
      accept: "application/json",
      "accept-encoding": "gzip",
    },
    cache: "no-store",
  });
  const body: unknown = await res.json().catch(() => null);
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("retry-after"));
    const reset = Number(res.headers.get("x-rate-limit-reset"));
    const seconds =
      Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter
        : Number.isFinite(reset) && reset > 0
          ? reset
          : 1;
    throw new ProviderRateLimitedError(`Tequila ${path} rate limited (429)`, seconds);
  }
  if (res.status < 200 || res.status >= 300) {
    throw new ProviderError(
      `Tequila ${path} failed: HTTP ${res.status} ${JSON.stringify(body)?.slice(0, 200)}`,
      res.status,
      res.status >= 500
    );
  }
  return asObj(body);
}

function priceEurOf(it: Record<string, unknown>): number {
  const conversion = asObj(it.conversion);
  const fromConversion = asNum(conversion.EUR);
  if (Number.isFinite(fromConversion)) return fromConversion;
  return asNum(it.price); // curr=EUR was requested
}

function mapItinerary(itRaw: unknown, fallbackDate: string): FlightOption {
  const it = asObj(itRaw);
  const route0 = asObj(asArr(it.route)[0]);
  const localDeparture = asStr(it.local_departure) || asStr(route0.local_departure);
  const date = localDeparture.slice(0, 10) || fallbackDate;
  const deepLinkRaw = asStr(it.deep_link);
  const deepLink =
    deepLinkRaw.startsWith("https://www.kiwi.com/deep") ? deepLinkRaw : undefined;
  const airline = asStr(route0.airline);
  const flightNo = asStr(route0.flight_no);
  const duration = asObj(it.duration);
  return {
    date,
    flightNumber: `${airline} ${flightNo}`.trim(),
    departLocal: localDeparture,
    arriveLocal: asStr(it.local_arrival) || asStr(route0.local_arrival),
    departUtc: asNum(it.utc_departure) || asNum(route0.utc_departure),
    arriveUtc: asNum(it.utc_arrival) || asNum(route0.utc_arrival),
    durationMinutes: Math.round(asNum(duration.total) / 60),
    priceEur: priceEurOf(it),
    bookingUrl: deepLink
      ? wrapAffiliateDeepLink(deepLink)
      : affiliateLink({
          origin: asStr(it.flyFrom),
          dest: asStr(it.flyTo),
          date,
          adults: 1,
        }),
  };
}

export const tequilaProvider: RankingFlightProvider = {
  name: "tequila",

  async searchAirports(query: string): Promise<AirportSuggestion[]> {
    const body = await tequilaFetch("/locations/query", {
      term: query,
      location_types: "airport",
      limit: "8",
      active_only: "true",
      locale: "en-US",
      sort: "name",
    });
    return asArr(body.locations)
      .map((l) => {
        const loc = asObj(l);
        const city = asObj(loc.city);
        const country = asObj(city.country ?? loc.country);
        return {
          iata: asStr(loc.code),
          name: asStr(loc.name) || asStr(loc.code),
          city: asStr(city.name),
          country: asStr(country.name),
          countryCode: asStr(country.code),
        };
      })
      .filter((s) => s.iata.length === 3)
      .slice(0, 8);
  },

  async searchOneWayRange(
    origin: string,
    dest: string,
    dateFrom: string,
    dateTo: string,
    adults: number
  ): Promise<FlightOption[]> {
    const body = await tequilaFetch("/v2/search", {
      fly_from: origin,
      fly_to: dest,
      date_from: toTequilaDate(dateFrom),
      date_to: toTequilaDate(dateTo),
      flight_type: "oneway",
      one_per_date: "1", // cheapest itinerary per day — the range collapses all window days into one call
      adults: String(adults),
      curr: "EUR",
      selected_cabins: "economy",
      sort: "price",
      limit: "200",
    });
    return asArr(body.data).map((it) => mapItinerary(it, dateFrom));
  },

  async searchCheapestPerCity(
    origin: string,
    destCodes: string[],
    dateFrom: string,
    dateTo: string,
    adults: number
  ): Promise<CityOption[]> {
    const body = await tequilaFetch("/v2/search", {
      fly_from: origin,
      fly_to: destCodes.join(","),
      date_from: toTequilaDate(dateFrom),
      date_to: toTequilaDate(dateTo),
      flight_type: "oneway",
      one_for_city: "1", // cheapest per city over the whole window — phase 1 in ONE call per origin
      adults: String(adults),
      curr: "EUR",
      selected_cabins: "economy",
      sort: "price",
      limit: "200",
    });
    return asArr(body.data)
      .map((it) => {
        const o = asObj(it);
        return { destCode: asStr(o.flyTo).toUpperCase(), option: mapItinerary(o, dateFrom) };
      })
      .filter((e) => e.destCode.length === 3);
  },

  affiliateLink,
};
