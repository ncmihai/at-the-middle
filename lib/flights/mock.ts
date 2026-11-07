// Deterministic synthetic provider (FLIGHTS_PROVIDER=mock) — no network.
// Essential for dev/tests/end-to-end without API keys: 2–5 options per day with
// stable pseudo-random prices/times seeded from origin+dest+date, so repeat calls
// (and the 30 h gap relaxation, which costs 0 new calls) are perfectly stable.
import { createHash } from "node:crypto";
import { CANDIDATE_DESTINATIONS } from "@/db/candidates";
import type { AirportSuggestion, FlightOption } from "@/lib/types";
import {
  affiliateLink,
  type CityOption,
  type RankingFlightProvider,
} from "./provider";

/** mulberry32 PRNG from a 32-bit seed. */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFor(...parts: string[]): number {
  const h = createHash("sha256").update(parts.join("|")).digest();
  return h.readUInt32BE(0);
}

function addDays(dateIso: string, days: number): string {
  const d = new Date(`${dateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function listDates(dateFrom: string, dateTo: string): string[] {
  const out: string[] = [];
  for (let d = dateFrom; d <= dateTo; d = addDays(d, 1)) out.push(d);
  return out;
}

const AIRLINES = ["W6", "FR", "U2", "VY", "TK", "LH", "KL", "BA", "OS", "LO"];

/** Stable synthetic options for one (origin, dest, date). */
function optionsForDay(origin: string, dest: string, date: string): FlightOption[] {
  const rand = prng(seedFor("day", origin, dest, date));
  const count = 2 + Math.floor(rand() * 4); // 2–5 options
  const [y, m, d] = date.split("-").map(Number);
  const options: FlightOption[] = [];
  for (let i = 0; i < count; i++) {
    const departHour = 5 + Math.floor(rand() * 16); // 05:00–20:59 UTC
    const departMin = Math.floor(rand() * 60);
    const durationMinutes = 60 + Math.floor(rand() * 260); // 1h–5h20
    const departUtc = Date.UTC(y, m - 1, d, departHour, departMin) / 1000;
    const arriveUtc = departUtc + durationMinutes * 60;
    const priceEur = Math.round((30 + rand() * 370) * 100) / 100; // €30–400
    const airline = AIRLINES[Math.floor(rand() * AIRLINES.length)];
    const flightNo = 1000 + Math.floor(rand() * 9000);
    const toLocalIso = (utcSec: number) => new Date(utcSec * 1000).toISOString();
    options.push({
      date,
      flightNumber: `${airline} ${flightNo}`,
      departLocal: toLocalIso(departUtc), // display only; gap uses utc fields
      arriveLocal: toLocalIso(arriveUtc),
      departUtc,
      arriveUtc,
      durationMinutes,
      priceEur,
      bookingUrl: affiliateLink({ origin, dest, date, adults: 1 }),
    });
  }
  return options.sort((a, b) => a.priceEur - b.priceEur);
}

export const mockProvider: RankingFlightProvider = {
  name: "mock",

  async searchAirports(query: string): Promise<AirportSuggestion[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return CANDIDATE_DESTINATIONS.filter(
      (c) =>
        c.iata.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    )
      .slice(0, 8)
      .map((c) => ({
        iata: c.iata,
        name: `${c.city} Airport`,
        city: c.city,
        country: c.country,
        countryCode: c.countryCode,
      }));
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
    for (const date of listDates(dateFrom, dateTo)) {
      out.push(...optionsForDay(origin.toUpperCase(), dest.toUpperCase(), date));
    }
    return out;
  },

  async searchCheapestPerCity(
    origin: string,
    destCodes: string[],
    dateFrom: string,
    dateTo: string,
    adults: number
  ): Promise<CityOption[]> {
    const out: CityOption[] = [];
    for (const code of destCodes) {
      const options = await this.searchOneWayRange(origin, code, dateFrom, dateTo, adults);
      if (options.length === 0) continue;
      const cheapest = options.reduce((a, b) => (b.priceEur < a.priceEur ? b : a));
      out.push({ destCode: code.toUpperCase(), option: cheapest });
    }
    return out;
  },

  affiliateLink,
};
