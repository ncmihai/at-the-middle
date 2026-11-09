// scripts/fetch-city-images.ts — Faza 8A pipeline: free city photos from
// Wikimedia Commons → mirrored on Digi Storage → db/city-images.ts (GENERATED).
//
// For every city in DESTINATION_CITIES (app/destinations/cities.ts):
//   1. GET https://<lang>.wikipedia.org/api/rest_v1/page/summary/<City_Name>
//      (en first, then the local-language wiki from the country code) with a
//      descriptive User-Agent → thumbnail / originalimage URL. Skip on 404.
//   2. Commons API imageinfo (iiprop=url|extmetadata) for the file name →
//      license = extmetadata.LicenseShortName, artist = extmetadata.Artist
//      (HTML stripped). ACCEPT only free licenses (contains CC0 / CC BY /
//      "Public domain" / PD) — else skip the city (recorded).
//   3. Download a 1600px-wide thumbnail (rewrite the /NNNpx- segment of the
//      thumb.wikimedia.org URL; fall back to originalimage) → upload to Digi
//      Storage at <basePath>/cities/<slug>.jpg via lib/digi.ts → public URL →
//      verify it returns 200 image/jpeg.
//   4. Write db/city-images.ts (CITY_IMAGES keyed by city name,
//      CITY_IMAGES_BY_SLUG keyed by slug). Cities whose stored URL still
//      verifies are kept as-is.
//
// NOTE: the stored Digi URLs are SIGNED and their signature expires (~24h).
// The app never serves them directly — lib/city-photo.ts rewrites them to the
// stable /city-photo/<slug>.jpg proxy (app/city-photo/[file]/route.ts), which
// mints a FRESH signed URL on every fetch. So re-running this script is only
// needed to ADD new cities (or re-upload photos), NOT to refresh expiring
// links — the live site keeps working regardless of the stored signatures.
//
// Rate-limited politely: 300 ms between cities, max 2 retries per request.
//
// Usage (DIGI_STORAGE_* from Infisical midspot/prod, or passed as env):
//   DIGI_STORAGE_EMAIL=... DIGI_STORAGE_PASSWORD=... npx tsx scripts/fetch-city-images.ts
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { DESTINATION_CITIES, type DestinationCity } from "../app/destinations/cities";
import { uploadCityImage } from "../lib/digi";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = path.join(ROOT, "db", "city-images.ts");

const USER_AGENT = "midspot-city-images/1.0 (https://midspot.ncmihai.dev; contact: ops@ncmihai.dev)";
const THUMB_WIDTH = 1600;
const GAP_MS = 300;
const MAX_RETRIES = 2;

/** countryCode → wikipedia edition used as fallback when en has no page. */
const WIKI_LANG_BY_COUNTRY: Record<string, string> = {
  AL: "sq", AT: "de", BA: "bs", BE: "nl", BG: "bg", CH: "de", CY: "el", CZ: "cs",
  DE: "de", DK: "da", EE: "et", ES: "es", FI: "fi", FR: "fr", GB: "en", GR: "el",
  HR: "hr", HU: "hu", IE: "en", IS: "is", IT: "it", LI: "de", LT: "lt", LU: "de",
  LV: "lv", MD: "ro", ME: "sr", MK: "mk", MT: "mt", NL: "nl", NO: "no", PL: "pl",
  PT: "pt", RO: "ro", RS: "sr", SE: "sv", SI: "sl", SK: "sk", TR: "tr", UA: "uk",
};

type CityImageEntry = { url: string; credit: string; license: string; source: string };

type Skip = { slug: string; city: string; reason: string };

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

async function fetchRetry(url: string, init: RequestInit = {}, what: string): Promise<Response> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: { "user-agent": USER_AGENT, accept: "application/json, */*", ...init.headers },
      });
      // 4xx (except 429) are not retried — 404 means "no page", that is a result.
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }
      lastError = new Error(`${what}: HTTP ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
    if (attempt < MAX_RETRIES) await sleep(500 * (attempt + 1));
  }
  throw lastError ?? new Error(`${what}: failed after ${MAX_RETRIES + 1} attempts`);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Wikipedia / Commons
// ---------------------------------------------------------------------------

type WikiSummary = {
  thumbnail?: { source: string };
  originalimage?: { source: string; width: number; height: number };
};

async function wikiSummary(city: DestinationCity, lang: string): Promise<WikiSummary | null> {
  const title = encodeURIComponent(city.city.replace(/ /g, "_"));
  const response = await fetchRetry(
    `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${title}`,
    { headers: { accept: "application/json" } },
    `wikipedia ${lang} summary ${city.city}`
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`wikipedia ${lang} summary ${city.city}: HTTP ${response.status}`);
  return (await response.json()) as WikiSummary;
}

/** Last path segment of a wikimedia upload URL, minus any "NNNpx-" thumb prefix. */
function fileNameFromImageUrl(imageUrl: string): string | null {
  try {
    const { pathname } = new URL(imageUrl);
    const last = decodeURIComponent(pathname.split("/").filter(Boolean).pop() ?? "");
    const name = last.replace(/^\d+px-/, "");
    return name || null;
  } catch {
    return null;
  }
}

/** thumb.wikimedia.org URL with the /NNNpx- segment rewritten to 1600px. */
function thumbUrlAtWidth(thumbUrl: string, width: number): string {
  return thumbUrl.replace(/\/\d+px-/, `/${width}px-`);
}

type CommonsInfo = {
  license: string;
  artist: string;
  /** Commons description page of the file (https://commons.wikimedia.org/wiki/File:…) */
  source: string;
};

const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

async function commonsInfo(fileName: string): Promise<CommonsInfo | null> {
  const title = `File:${fileName}`;
  const api =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2" +
    `&prop=imageinfo&iiprop=${encodeURIComponent("url|extmetadata")}&titles=${encodeURIComponent(title)}`;
  const response = await fetchRetry(api, {}, `commons imageinfo ${title}`);
  if (!response.ok) throw new Error(`commons imageinfo ${title}: HTTP ${response.status}`);
  const body = (await response.json()) as {
    query?: { pages?: Array<{ imageinfo?: Array<{ url?: string; descriptionurl?: string; extmetadata?: Record<string, { value?: string }> }> }> };
  };
  const info = body.query?.pages?.[0]?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  return {
    license: stripHtml(meta.LicenseShortName?.value ?? "") || "Unknown",
    artist: stripHtml(meta.Artist?.value ?? "") || "Unknown",
    source: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
  };
}

const FREE_LICENSE = /CC0|CC BY|Public domain|PD/i;

async function downloadImage(url: string): Promise<{ data: Uint8Array; contentType: string } | null> {
  const response = await fetchRetry(url, { headers: { accept: "image/*" } }, `image ${url}`);
  if (!response.ok) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("image/jpeg")) return null;
  return { data: new Uint8Array(await response.arrayBuffer()), contentType: "image/jpeg" };
}

// ---------------------------------------------------------------------------
// Public URL verification (also used for the idempotent cache check)
// ---------------------------------------------------------------------------

async function urlServesJpeg(url: string): Promise<boolean> {
  try {
    const response = await fetchRetry(url, { headers: { accept: "image/*" } }, `verify ${url}`);
    if (!response.ok) return false;
    const contentType = response.headers.get("content-type") ?? "";
    void response.body?.cancel().catch(() => undefined);
    return contentType.includes("image/jpeg");
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// db/city-images.ts writer
// ---------------------------------------------------------------------------

function renderModule(entries: Map<string, CityImageEntry>): string {
  const bySlug: Record<string, CityImageEntry> = {};
  const byCity: Record<string, CityImageEntry> = {};
  for (const city of DESTINATION_CITIES) {
    const entry = entries.get(city.slug);
    if (!entry) continue;
    bySlug[city.slug] = entry;
    byCity[city.city] = entry;
  }
  const sorted = (obj: Record<string, CityImageEntry>) =>
    Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
  return `// GENERATED by scripts/fetch-city-images.ts — DO NOT EDIT BY HAND.
// City photos mirrored from Wikimedia Commons to Digi Storage (free licenses
// only: CC0 / CC BY / Public domain / PD). The stored URLs are SIGNED and
// expire (~24h) — the app serves photos via the stable /city-photo/<slug>.jpg
// proxy (app/city-photo/[file]/route.ts), so re-running is only needed to ADD
// new cities, not to refresh links:
//   DIGI_STORAGE_EMAIL=... DIGI_STORAGE_PASSWORD=... npx tsx scripts/fetch-city-images.ts
// Pure data module (no env, no I/O) — safe to import from server components,
// OG image routes and client components.

export type CityImage = {
  /** public URL of the 1600px JPEG on Digi Storage (verified 200 image/jpeg at generation time) */
  url: string;
  /** author, from Wikimedia Commons extmetadata.Artist (HTML stripped) */
  credit: string;
  /** short license name, from extmetadata.LicenseShortName */
  license: string;
  /** Wikimedia Commons file page (attribution source) */
  source: string;
};

/** city display name ("Krakow") → photo */
export const CITY_IMAGES: Record<string, CityImage> = ${JSON.stringify(sorted(byCity), null, 2)};

/** URL slug ("krakow") → photo */
export const CITY_IMAGES_BY_SLUG: Record<string, CityImage> = ${JSON.stringify(sorted(bySlug), null, 2)};
`;
}

async function loadExisting(): Promise<Map<string, CityImageEntry>> {
  if (!existsSync(OUT_FILE)) return new Map();
  try {
    const mod = (await import(OUT_FILE)) as { CITY_IMAGES_BY_SLUG?: Record<string, CityImageEntry> };
    const map = new Map<string, CityImageEntry>();
    for (const [slug, entry] of Object.entries(mod.CITY_IMAGES_BY_SLUG ?? {})) map.set(slug, entry);
    return map;
  } catch {
    return new Map();
  }
}

// ---------------------------------------------------------------------------
// Per-city pipeline
// ---------------------------------------------------------------------------

async function processCity(city: DestinationCity, existing: Map<string, CityImageEntry>): Promise<{ entry?: CityImageEntry; skip?: string }> {
  const citySlug = city.slug;

  // Idempotent: keep entries whose public URL still serves a JPEG.
  const cached = existing.get(citySlug);
  if (cached && (await urlServesJpeg(cached.url))) {
    return { entry: cached };
  }

  // 1. Wikipedia summary — en first, then the local-language edition.
  const langs = ["en", WIKI_LANG_BY_COUNTRY[city.countryCode] ?? "en"].filter(
    (v, i, arr) => arr.indexOf(v) === i
  );
  let summary: WikiSummary | null = null;
  for (const lang of langs) {
    summary = await wikiSummary(city, lang);
    if (summary) break;
  }
  if (!summary) return { skip: "no-wikipedia-page" };

  const imageUrl = summary.originalimage?.source ?? summary.thumbnail?.source;
  if (!imageUrl) return { skip: "no-image-on-page" };

  // 2. Commons license + artist.
  const fileName = fileNameFromImageUrl(imageUrl);
  if (!fileName) return { skip: "unparseable-image-url" };
  const info = await commonsInfo(fileName);
  if (!info) return { skip: "no-commons-file" };
  if (!FREE_LICENSE.test(info.license)) return { skip: `license:${info.license}` };

  // 3. Download a 1600px thumbnail (fall back to the original image).
  let image: { data: Uint8Array; contentType: string } | null = null;
  if (summary.thumbnail?.source && /\/\d+px-/.test(summary.thumbnail.source)) {
    image = await downloadImage(thumbUrlAtWidth(summary.thumbnail.source, THUMB_WIDTH));
  }
  if (!image && summary.originalimage?.source) {
    image = await downloadImage(summary.originalimage.source);
  }
  if (!image) return { skip: "no-jpeg-image" };

  // Upload to Digi Storage + public URL + verify.
  const { publicUrl } = await uploadCityImage(citySlug, image.data, image.contentType);
  if (!(await urlServesJpeg(publicUrl))) return { skip: "public-url-not-jpeg" };

  return { entry: { url: publicUrl, credit: info.artist, license: info.license, source: info.source } };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Test hooks: CITY_IMAGES_ONLY="krakow,budapest,lisbon" / CITY_IMAGES_LIMIT=10
  const only = process.env.CITY_IMAGES_ONLY?.split(",").map((s) => s.trim()).filter(Boolean);
  const limit = process.env.CITY_IMAGES_LIMIT ? Number(process.env.CITY_IMAGES_LIMIT) : undefined;
  const cities = DESTINATION_CITIES.filter(
    (c) => (!only || only.includes(c.slug)) && (limit === undefined || true)
  ).slice(0, limit);

  const existing = await loadExisting();
  console.log(`[city-images] ${cities.length} cities (of ${DESTINATION_CITIES.length}), ${existing.size} already mirrored`);

  const entries = new Map<string, CityImageEntry>();
  const skips: Skip[] = [];
  let ok = 0;
  let cachedCount = 0;
  let sinceWrite = 0;

  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    const label = `${city.slug} (${city.city}, ${city.countryCode})`;
    try {
      const result = await processCity(city, existing);
      if (result.entry) {
        const wasCached = existing.get(city.slug)?.url === result.entry.url;
        entries.set(city.slug, result.entry);
        if (wasCached) cachedCount++;
        else ok++;
        console.log(`[city-images] ${i + 1}/${cities.length} ${label} → photo ${result.entry.license} by ${result.entry.credit.slice(0, 60)}${wasCached ? " (cached)" : ""}`);
      } else {
        skips.push({ slug: city.slug, city: city.city, reason: result.skip ?? "unknown" });
        console.log(`[city-images] ${i + 1}/${cities.length} ${label} → SKIP ${result.skip}`);
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      skips.push({ slug: city.slug, city: city.city, reason: `error:${reason.slice(0, 120)}` });
      console.log(`[city-images] ${i + 1}/${cities.length} ${label} → ERROR ${reason.slice(0, 160)}`);
    }

    sinceWrite++;
    if (sinceWrite >= 20) {
      writeFileSync(OUT_FILE, renderModule(entries));
      sinceWrite = 0;
    }
    if (i < cities.length - 1) await sleep(GAP_MS);
  }

  writeFileSync(OUT_FILE, renderModule(entries));

  const byReason = new Map<string, number>();
  for (const s of skips) byReason.set(s.reason, (byReason.get(s.reason) ?? 0) + 1);
  console.log("\n===== city-images report =====");
  console.log(`cities total:        ${cities.length}`);
  console.log(`photos uploaded:     ${ok}`);
  console.log(`kept from cache:     ${cachedCount}`);
  console.log(`with photo (total):  ${entries.size}`);
  console.log(`skipped:             ${skips.length}`);
  for (const [reason, n] of [...byReason.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n}\t${reason}`);
  }
  console.log(`written:             ${path.relative(ROOT, OUT_FILE)}`);
}

main().catch((error) => {
  console.error("[city-images] fatal:", error);
  process.exit(1);
});
