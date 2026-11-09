// GET /city-photo/[file] — stable, never-expiring proxy for the city photos
// mirrored on Digi Storage (db/city-images.ts embeds SIGNED Digi URLs whose
// signature expires ~24h, which broke all city photos on the live site).
//
// This route is the permanent fix: clients and OG/share cards only ever see
// /city-photo/<slug>.jpg (see cityPhotoProxyPath in lib/city-photo.ts). On each
// request we ask lib/digi.ts for a FRESH signed URL (publicUrlFor) and fetch
// the bytes, so the expiring signature never reaches the outside world.
//
// Bytes are cached in a module-level Map (TTL 1h, max 600 entries, oldest
// evicted when over) and served with `cache-control: public, max-age=31536000,
// immutable` + an ETag, so browsers/CDNs cache them effectively forever.
// No auth — the photos are public, free-licensed images.
import { publicUrlFor } from "@/lib/digi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = false;

/** <slug>.jpg / <slug>.jpeg only — no path separators, no traversal. */
const FILE_RE = /^[a-z0-9-]+\.(jpg|jpeg)$/i;

const FETCH_TIMEOUT_MS = 15_000;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h
const CACHE_MAX_ENTRIES = 600;

type CacheEntry = {
  body: Uint8Array<ArrayBuffer>;
  contentType: string;
  at: number;
};

/** file → cached bytes. Map preserves insertion order → oldest entry is first. */
const cache = new Map<string, CacheEntry>();

function cacheGet(file: string): CacheEntry | undefined {
  const entry = cache.get(file);
  if (!entry) return undefined;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(file);
    return undefined;
  }
  return entry;
}

function cacheSet(file: string, entry: CacheEntry): void {
  if (cache.size >= CACHE_MAX_ENTRIES && !cache.has(file)) {
    // LRU-ish: evict the oldest inserted entry when full
    const oldest = cache.keys().next();
    if (!oldest.done) cache.delete(oldest.value);
  }
  cache.delete(file); // refresh insertion order on re-set
  cache.set(file, entry);
}

/** Fresh signed Digi URL for cities/<file> → bytes. Throws on any failure. */
async function fetchPhotoBytes(file: string): Promise<{ body: Uint8Array<ArrayBuffer>; contentType: string }> {
  const objectPath = `cities/${file}`;
  const signedUrl = await publicUrlFor(objectPath);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(signedUrl, {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Digi Storage fetch failed (${response.status})`);
    }
    const body = new Uint8Array(await response.arrayBuffer());
    if (body.byteLength === 0) throw new Error("Digi Storage returned an empty body");
    const contentType = response.headers.get("content-type")?.split(";")[0].trim() || "image/jpeg";
    return { body, contentType };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
): Promise<Response> {
  const { file } = await params;

  if (!FILE_RE.test(file)) {
    return new Response("Bad file name", {
      status: 400,
      headers: { "cache-control": "no-store" },
    });
  }

  const cached = cacheGet(file);
  if (cached) {
    return new Response(cached.body, {
      status: 200,
      headers: {
        "content-type": cached.contentType,
        "cache-control": "public, max-age=31536000, immutable",
        etag: `${file}-${cached.body.byteLength}`,
      },
    });
  }

  try {
    const { body, contentType } = await fetchPhotoBytes(file);
    cacheSet(file, { body, contentType, at: Date.now() });
    return new Response(body, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=31536000, immutable",
        etag: `${file}-${body.byteLength}`,
      },
    });
  } catch (err) {
    console.warn(`[city-photo] fetch failed for ${file}:`, err);
    return new Response("Photo not found", {
      status: 404,
      headers: { "cache-control": "no-store" },
    });
  }
}
