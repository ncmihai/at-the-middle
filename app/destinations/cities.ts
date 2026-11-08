// City model for /destinations — derived at module load from db/candidates.ts
// (CANDIDATE_DESTINATIONS): airports are grouped by the lowercase ASCII slug of
// the city name ("Krakow" → "krakow", "A Coruña" → "a-coruna") and all IATA
// codes of the same city are merged into one destination page. The top
// MAX_DESTINATION_CITIES cities by number of airports (alphabetical on ties)
// are kept, so the static build stays fast.
//
// Pure module (no DB, no env) — safe to import from server components, the
// sitemap and the OG image route.
import { CANDIDATE_DESTINATIONS, type CandidateDestination } from "@/db/candidates";

export const MAX_DESTINATION_CITIES = 120;

export type DestinationCity = {
  /** URL slug, derived from the city name (ASCII, lowercase, dashes) */
  slug: string;
  /** display name as in the candidates data ("Krakow") */
  city: string;
  country: string;
  countryCode: string;
  /** all IATA codes serving this city, sorted */
  iatas: string[];
  airportCount: number;
  /** mean coordinates of the city's airports (for future map use) */
  latitude: number;
  longitude: number;
};

/** "A Coruña" → "a-coruna", "Angelholm/Helsingborg" → "angelholm-helsingborg". */
export function slugifyCity(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildCities(): DestinationCity[] {
  const groups = new Map<string, CandidateDestination[]>();
  for (const c of CANDIDATE_DESTINATIONS) {
    const slug = slugifyCity(c.city);
    const arr = groups.get(slug);
    if (arr) arr.push(c);
    else groups.set(slug, [c]);
  }

  const cities: DestinationCity[] = [];
  for (const [slug, arr] of groups) {
    // Majority country of the group (current data has no cross-country city
    // slugs — e.g. Basel groups BSL+MLH as Switzerland — this just keeps the
    // merge deterministic if that ever changes).
    const byCountry = new Map<string, { country: string; countryCode: string; n: number }>();
    for (const c of arr) {
      const entry = byCountry.get(c.countryCode);
      if (entry) entry.n += 1;
      else byCountry.set(c.countryCode, { country: c.country, countryCode: c.countryCode, n: 1 });
    }
    const top = [...byCountry.values()].sort(
      (a, b) => b.n - a.n || a.countryCode.localeCompare(b.countryCode)
    )[0];
    cities.push({
      slug,
      city: arr[0].city,
      country: top.country,
      countryCode: top.countryCode,
      iatas: arr.map((c) => c.iata).sort(),
      airportCount: arr.length,
      latitude: arr.reduce((sum, c) => sum + c.latitude, 0) / arr.length,
      longitude: arr.reduce((sum, c) => sum + c.longitude, 0) / arr.length,
    });
  }

  // Most airports first; alphabetical on ties (deterministic build output).
  cities.sort((a, b) => b.airportCount - a.airportCount || a.slug.localeCompare(b.slug));
  return cities.slice(0, MAX_DESTINATION_CITIES);
}

/** The ~120 destination cities, sorted by airport count then slug. */
export const DESTINATION_CITIES: DestinationCity[] = buildCities();

/** Slugs in the same order — used by generateStaticParams and the sitemap. */
export const DESTINATION_SLUGS: string[] = DESTINATION_CITIES.map((c) => c.slug);

/** slug → city lookup for the [city] route. */
export const DESTINATIONS_BY_SLUG: Record<string, DestinationCity> = Object.fromEntries(
  DESTINATION_CITIES.map((c) => [c.slug, c])
);
