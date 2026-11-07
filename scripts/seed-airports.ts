// Seed the `airports` table and regenerate the static EU candidate list
// `db/candidates.ts` (EEA + UK + CH + NO/IS + Western Balkans).
//
// Primary source: Travelpayouts/Aviasales JSON data files (support category
// "API and data" → "Flight data by Aviasales"), no token needed, HTTPS only
// (http 301-redirects to https):
//   https://api.travelpayouts.com/data/en/airports.json   (iata_type, flightable, city_code, ...)
//   https://api.travelpayouts.com/data/en/cities.json      (city_code → city name)
//   https://api.travelpayouts.com/data/en/countries.json   (country_code → country name)
// Fallback: OurAirports CSV (flight-data-spec §7.1).
//
// Usage:
//   DATABASE_URL=... npm run db:seed-airports   # upsert into Postgres AND rewrite db/candidates.ts
//   npm run db:seed-airports                    # only rewrite db/candidates.ts (no DB needed)
import { writeFileSync } from "node:fs";
import path from "node:path";

const TP_AIRPORTS_JSON = "https://api.travelpayouts.com/data/en/airports.json";
const TP_CITIES_JSON = "https://api.travelpayouts.com/data/en/cities.json";
const TP_COUNTRIES_JSON = "https://api.travelpayouts.com/data/en/countries.json";
const AIRPORTS_CSV = "https://davidmegginson.github.io/ourairports-data/airports.csv";
const COUNTRIES_CSV = "https://davidmegginson.github.io/ourairports-data/countries.csv";

// EEA (EU27 + IS, LI, NO) + UK + CH + Western Balkans — the candidate-destination set
// (app-spec §10 Q4).
const CANDIDATE_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT", "RO",
  "SK", "SI", "ES", "SE", "CH", "GB",
  "AL", "BA", "ME", "MK", "RS", "XK",
]);

const CANDIDATE_TYPES = new Set(["large_airport", "medium_airport"]);

type CsvRow = Record<string, string>;

/** Minimal CSV parser that handles quoted fields with embedded commas/quotes. */
function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const header = rows[0];
  return rows.slice(1).map((r) => {
    const rec: CsvRow = {};
    header.forEach((h, i) => {
      rec[h] = r[i] ?? "";
    });
    return rec;
  });
}

async function fetchCsv(url: string): Promise<CsvRow[]> {
  const res = await fetch(url, { headers: { "user-agent": "midspot-seed/1.0" } });
  if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`);
  return parseCsv(await res.text());
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "user-agent": "midspot-seed/1.0" } });
  if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`);
  return (await res.json()) as T;
}

export type SeedAirport = {
  iata: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  isEu: boolean;
  kind: string;
};

type TpAirport = {
  code: string;
  iata_type: string;
  flightable?: boolean;
  city_code?: string;
  country_code: string;
  name: string;
  name_translations?: { en?: string };
  coordinates?: { lat: number; lon: number };
};
type TpCity = { code: string; name: string; name_translations?: { en?: string } };
type TpCountry = { code: string; name: string; name_translations?: { en?: string } };

/** Primary source: Travelpayouts/Aviasales JSON data files. */
async function fetchAviasales(): Promise<SeedAirport[]> {
  const [airports, cities, countries] = await Promise.all([
    fetchJson<TpAirport[]>(TP_AIRPORTS_JSON),
    fetchJson<TpCity[]>(TP_CITIES_JSON),
    fetchJson<TpCountry[]>(TP_COUNTRIES_JSON),
  ]);
  const cityNames = new Map(cities.map((c) => [c.code, c.name_translations?.en ?? c.name]));
  const countryNames = new Map(countries.map((c) => [c.code, c.name_translations?.en ?? c.name]));

  const selected: SeedAirport[] = [];
  const seen = new Set<string>();
  for (const a of airports) {
    if (a.iata_type !== "airport" || a.flightable === false) continue;
    const iata = (a.code ?? "").trim().toUpperCase();
    const countryCode = (a.country_code ?? "").trim().toUpperCase();
    if (iata.length !== 3 || seen.has(iata)) continue;
    if (!CANDIDATE_COUNTRIES.has(countryCode)) continue;
    const lat = a.coordinates?.lat;
    const lon = a.coordinates?.lon;
    if (lat === undefined || lon === undefined || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    seen.add(iata);
    selected.push({
      iata,
      name: a.name_translations?.en ?? a.name,
      city: cityNames.get((a.city_code ?? "").toUpperCase()) ?? "",
      country: countryNames.get(countryCode) ?? countryCode,
      countryCode,
      latitude: lat,
      longitude: lon,
      isEu: true,
      kind: "airport",
    });
  }
  return selected;
}

/** Fallback source: OurAirports CSV. */
async function fetchOurAirports(): Promise<SeedAirport[]> {
  const [airportRows, countryRows] = await Promise.all([
    fetchCsv(AIRPORTS_CSV),
    fetchCsv(COUNTRIES_CSV),
  ]);
  const countryNames = new Map(countryRows.map((c) => [c.code, c.name]));
  const selected: SeedAirport[] = [];
  const seen = new Set<string>();
  for (const r of airportRows) {
    const iata = (r.iata_code ?? "").trim().toUpperCase();
    const countryCode = (r.iso_country ?? "").trim().toUpperCase();
    if (!iata || iata.length !== 3) continue;
    if (!CANDIDATE_COUNTRIES.has(countryCode)) continue;
    if (!CANDIDATE_TYPES.has((r.type ?? "").trim())) continue;
    if ((r.scheduled_service ?? "").trim() !== "yes") continue;
    if (seen.has(iata)) continue;
    seen.add(iata);
    const lat = Number(r.latitude_deg);
    const lon = Number(r.longitude_deg);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    selected.push({
      iata,
      name: r.name?.trim() || iata,
      city: r.municipality?.trim() || "",
      country: countryNames.get(countryCode) ?? countryCode,
      countryCode,
      latitude: lat,
      longitude: lon,
      isEu: true,
      kind: r.type.trim(),
    });
  }
  return selected;
}

async function main() {
  let selected: SeedAirport[];
  try {
    console.log("[seed-airports] downloading", TP_AIRPORTS_JSON);
    selected = await fetchAviasales();
    console.log(`[seed-airports] aviasales source: ${selected.length} EU flightable airports`);
  } catch (err) {
    console.warn("[seed-airports] aviasales source failed, falling back to OurAirports CSV:", err);
    console.log("[seed-airports] downloading", AIRPORTS_CSV);
    selected = await fetchOurAirports();
  }
  selected.sort((a, b) => a.iata.localeCompare(b.iata));
  console.log(`[seed-airports] ${selected.length} candidate airports selected`);

  // 1) Regenerate the static candidate list used by the search algorithm.
  const candidatesPath = path.join(process.cwd(), "db", "candidates.ts");
  const lines = selected.map(
    (a) =>
      `  { iata: ${JSON.stringify(a.iata)}, city: ${JSON.stringify(a.city)}, country: ${JSON.stringify(a.country)}, countryCode: ${JSON.stringify(a.countryCode)}, latitude: ${a.latitude}, longitude: ${a.longitude} },`
  );
  writeFileSync(
    candidatesPath,
    `// GENERATED by scripts/seed-airports.ts — primary source: Travelpayouts/Aviasales JSON
// (api.travelpayouts.com/data/en/airports.json, iata_type=airport, flightable=true),
// fallback: OurAirports CSV. EEA + UK + CH + NO/IS + Western Balkans.
// Do not edit by hand; re-run \`npm run db:seed-airports\`.
// Used by lib/jobs/run-search.ts as the candidate-destination shortlist; at runtime it is
// ordered by haversine distance to the origins' centroid and capped at
// FLIGHTS_MAX_CANDIDATE_DESTINATIONS.

export type CandidateDestination = {
  iata: string;
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
};

export const CANDIDATE_DESTINATIONS: CandidateDestination[] = [
${lines.join("\n")}
];

/** Fast IATA → destination lookup for result enrichment. */
export const CANDIDATES_BY_IATA: Record<string, CandidateDestination> =
  Object.fromEntries(CANDIDATE_DESTINATIONS.map((c) => [c.iata, c]));
`
  );
  console.log(`[seed-airports] wrote ${candidatesPath}`);

  // 2) Upsert into the airports table (only when DATABASE_URL is available).
  if (!process.env.DATABASE_URL) {
    console.log("[seed-airports] DATABASE_URL not set — skipped DB upsert");
    return;
  }
  const { getDb, closeDb } = await import("../db/client");
  const { airports } = await import("../db/schema");
  const db = getDb();
  const now = new Date();
  let upserted = 0;
  for (const a of selected) {
    const searchText = `${a.name} ${a.city} ${a.country} ${a.iata}`.toLowerCase();
    await db
      .insert(airports)
      .values({
        iata: a.iata,
        name: a.name,
        city: a.city,
        country: a.country,
        countryCode: a.countryCode,
        latitude: a.latitude,
        longitude: a.longitude,
        isEu: a.isEu,
        kind: a.kind,
        searchText,
        fetchedAt: now,
      })
      .onConflictDoUpdate({
        target: airports.iata,
        set: {
          name: a.name,
          city: a.city,
          country: a.country,
          countryCode: a.countryCode,
          latitude: a.latitude,
          longitude: a.longitude,
          isEu: a.isEu,
          kind: a.kind,
          searchText,
          fetchedAt: now,
        },
      });
    upserted++;
  }
  await closeDb();
  console.log(`[seed-airports] upserted ${upserted} rows into airports`);
}

main().catch((err) => {
  console.error("[seed-airports] failed:", err);
  process.exit(1);
});
