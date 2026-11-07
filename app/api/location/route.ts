// GET /api/location?locale=en — resolve the visitor's nearest airport (IATA) from
// their IP via the Travelpayouts "whereami" endpoint (support.travelpayouts.com
// article 205895898, "How to determine the user's location by IP address"):
//   GET https://www.travelpayouts.com/whereami?locale=en&ip=<visitor-ip>
//   → { iata, name, country_name, country_code, coordinates, accuracy }
// Only accuracy "city" / "nearest_city" are trusted; "country"/"default" are
// fallbacks (VPN/datacenter IPs) → we answer { iata: null } so the client leaves
// the field empty. The raw IP is read from CF-Connecting-IP (edge-set) and sent
// ONCE to Travelpayouts for this lookup — it is never stored or logged by us
// (privacy page §3). TRAVELPAYOUTS_API_KEY is sent as X-Access-Token when present.
//
// Rate limited at 10/min/IP with the shared in-memory limiter (the limit value is
// part of the bucket key, so this is its own bucket without touching proxy.ts).
import { NextRequest, NextResponse } from "next/server";

import { getConfig } from "@/lib/env";
import { isLanguage, SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { clientKeyFrom, takeRequestSlot } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCATION_LIMIT_PER_MIN = 10;
const WHEREAMI_URL = "https://www.travelpayouts.com/whereami";
const WHEREAMI_TIMEOUT_MS = 5000;
/** loose IPv4 / IPv6 check — the value is also encodeURIComponent'd before use */
const IP_RE = /^[0-9a-fA-F:.]{7,45}$/;

/** our UI languages → whereami `locale` values (ro is not offered by Aviasales → en) */
const WHEREAMI_LOCALE: Record<(typeof SUPPORTED_LANGUAGES)[number], string> = {
  en: "en",
  ro: "en",
  de: "de",
  fr: "fr",
  es: "es",
  it: "it",
};

type WhereamiResponse = {
  iata?: string;
  name?: string;
  country_name?: string;
  country_code?: string;
  coordinates?: string;
  accuracy?: string;
};

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store", ...extraHeaders },
  });
}

/** Raw client IP (unlike clientKeyFrom, no /64 grouping — geolocation needs the address). */
function rawClientIp(headers: Headers): string | null {
  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const fwd = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || null;
}

export async function GET(request: NextRequest) {
  const key = clientKeyFrom(request.headers);
  if (key) {
    const slot = takeRequestSlot(key, Date.now(), LOCATION_LIMIT_PER_MIN);
    if (!slot.ok) {
      const retryAfterSeconds = Math.max(1, Math.ceil(slot.retryAfterMs / 1000));
      return json({ error: "rate_limited", retryAfterSeconds }, 429, {
        "retry-after": String(retryAfterSeconds),
      });
    }
  }

  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale = isLanguage(localeParam) ? WHEREAMI_LOCALE[localeParam] : "en";

  const ip = rawClientIp(request.headers);
  if (!ip || !IP_RE.test(ip)) {
    // no proxy header (local dev / loopback) or malformed → nothing to geolocate
    return json({ iata: null });
  }

  const cfg = getConfig();
  try {
    const url = `${WHEREAMI_URL}?locale=${encodeURIComponent(locale)}&ip=${encodeURIComponent(ip)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WHEREAMI_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: cfg.travelpayoutsApiKey
        ? { "X-Access-Token": cfg.travelpayoutsApiKey }
        : undefined,
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.warn(`[api/location] whereami answered HTTP ${res.status}`);
      return json({ iata: null });
    }
    const data = (await res.json()) as WhereamiResponse;
    const trusted = data.accuracy === "city" || data.accuracy === "nearest_city";
    if (trusted && typeof data.iata === "string" && /^[A-Z]{3}$/.test(data.iata)) {
      return json({
        iata: data.iata,
        city: data.name ?? null,
        country: data.country_name ?? null,
        countryCode: data.country_code ?? null,
        accuracy: data.accuracy,
      });
    }
    return json({ iata: null });
  } catch (err) {
    console.warn("[api/location] whereami lookup failed:", err instanceof Error ? err.message : err);
    return json({ iata: null });
  }
}
