// lib/city-photo.ts — Faza 9: one safe lookup for "the photo of this city",
// shared by the hero answer, every result card, the /destinations pages and
// the OG / share cards. Reads only the pure data modules (db/city-images.ts,
// db/candidates.ts, app/destinations/cities.ts) — no I/O, no env — and NEVER
// throws: any miss or bad input returns null so callers can fall back to the
// plain light card style.
import { CANDIDATES_BY_IATA } from "@/db/candidates";
import { CITY_IMAGES, CITY_IMAGES_BY_SLUG, type CityImage } from "@/db/city-images";

import { DESTINATION_CITIES, slugifyCity } from "@/app/destinations/cities";

/** IATA code → destination slug, built once from DESTINATION_CITIES (iata→city→slug). */
const IATA_TO_SLUG: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  try {
    for (const city of DESTINATION_CITIES) {
      for (const iata of city.iatas) map[iata] = city.slug;
    }
  } catch {
    // leave the map empty — callers still get the CANDIDATES_BY_IATA fallback below
  }
  return map;
})();

/**
 * Photo for a destination given its airport IATA code ("ZAG" → Zagreb's photo).
 * Resolution order: IATA → slug (DESTINATION_CITIES) → CITY_IMAGES_BY_SLUG,
 * then IATA → candidate city name → slugifyCity → CITY_IMAGES_BY_SLUG, then
 * the city display name → CITY_IMAGES. Null when the city has no accepted
 * photo. Never throws.
 */
export function cityPhotoForIata(iata: string | null | undefined): CityImage | null {
  try {
    if (!iata) return null;
    const code = iata.trim().toUpperCase();
    if (!code) return null;

    const slug = IATA_TO_SLUG[code];
    if (slug) {
      const bySlug = CITY_IMAGES_BY_SLUG[slug];
      if (bySlug) return bySlug;
    }

    const candidate = CANDIDATES_BY_IATA[code];
    if (candidate) {
      const bySlug = CITY_IMAGES_BY_SLUG[slugifyCity(candidate.city)];
      if (bySlug) return bySlug;
      const byName = CITY_IMAGES[candidate.city];
      if (byName) return byName;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Photo for a destination given its /destinations URL slug ("zagreb").
 * Null when unknown or photo-less. Never throws.
 */
export function cityPhotoForSlug(slug: string | null | undefined): CityImage | null {
  try {
    if (!slug) return null;
    const key = slug.trim().toLowerCase();
    if (!key) return null;
    return CITY_IMAGES_BY_SLUG[key] ?? CITY_IMAGES_BY_SLUG[slugifyCity(key)] ?? null;
  } catch {
    return null;
  }
}

/**
 * Photo for a destination given its display name ("Zagreb").
 * Null when unknown or photo-less. Never throws.
 */
export function cityPhotoForCity(city: string | null | undefined): CityImage | null {
  try {
    if (!city) return null;
    const name = city.trim();
    if (!name) return null;
    return CITY_IMAGES[name] ?? CITY_IMAGES_BY_SLUG[slugifyCity(name)] ?? null;
  } catch {
    return null;
  }
}
