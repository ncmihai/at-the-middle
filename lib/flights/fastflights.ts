// fast-flights bridge provider — real Google Flights data via the open-source
// `fast-flights` scraper (github.com/Mohamed3on/flights), served by our local
// loopback service (services/fastflights/service.py, default 127.0.0.1:8850).
// No API key, no approval, free — gray-area scraping of Google, so it is meant for
// local testing and as a fallback; production should prefer Tequila once approved.
// One bridge call per (origin, dest, window) covers all dates (range collapse).
import { getConfig } from "@/lib/env";
import type { AirportSuggestion, FlightOption } from "@/lib/types";
import {
  affiliateLink,
  asArr,
  asNum,
  asObj,
  asStr,
  ProviderError,
  type RankingFlightProvider,
} from "./provider";
import { travelpayoutsDataProvider } from "./travelpayouts-data";
import { mockProvider } from "./mock";

async function bridgeFetch(from: string, to: string, dateFrom: string, dateTo: string): Promise<unknown[]> {
  const base = getConfig().fastflightsBaseUrl.replace(/\/$/, "");
  const url = `${base}/flights?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date_from=${dateFrom}&date_to=${dateTo}`;
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(120_000) });
  } catch (err) {
    // bridge not running (local dev without the service) -> deterministic mock
    console.warn("[flights] fastflights bridge unreachable, using mock for this call:", (err as Error).message);
    const mock = await mockProvider.searchOneWayRange(from, to, dateFrom, dateTo, 1);
    return mock as unknown[];
  }
  if (!res.ok) throw new ProviderError(`fastflights bridge HTTP ${res.status}`, res.status, res.status >= 500);
  const body = asObj(await res.json());
  return asArr(body.options);
}

function mapOption(origin: string, dest: string, raw: unknown): FlightOption | null {
  const o = asObj(raw);
  const date = asStr(o.date);
  const departUtc = asNum(o.departUtc);
  const arriveUtc = asNum(o.arriveUtc);
  const priceEur = asNum(o.priceEur);
  if (!date || !departUtc || !arriveUtc || !Number.isFinite(priceEur) || priceEur <= 0) return null;
  return {
    date,
    flightNumber: asStr(o.flightNumber),
    departLocal: asStr(o.departLocal) || new Date(departUtc * 1000).toISOString(),
    arriveLocal: asStr(o.arriveLocal) || new Date(arriveUtc * 1000).toISOString(),
    departUtc,
    arriveUtc,
    durationMinutes: Math.round(asNum(o.durationMinutes) || (arriveUtc - departUtc) / 60),
    priceEur,
    bookingUrl: affiliateLink({ origin, dest, date, adults: 1 }),
  };
}

export const fastflightsProvider: RankingFlightProvider = {
  name: "fastflights",

  async searchAirports(query: string): Promise<AirportSuggestion[]> {
    void query;
    return []; // autocomplete from the airports table
  },

  async searchOneWayRange(
    origin: string,
    dest: string,
    dateFrom: string,
    dateTo: string,
    _adults: number
  ): Promise<FlightOption[]> {
    void _adults;
    const raw = await bridgeFetch(origin, dest, dateFrom, dateTo);
    const out: FlightOption[] = [];
    for (const item of raw) {
      const o = mapOption(origin, dest, item);
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
