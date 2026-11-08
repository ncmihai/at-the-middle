// Booking.com "stay" affiliate links, one per search result — PLAN.md Faza 4 lot 3.
//
// SERVER-ONLY: this module reads the Travelpayouts marker / promo ids via lib/env
// (getConfig) — never import it from a client component. The marker/subId are
// public-by-design (they appear in every affiliate link), but we keep them
// server-side where possible: stayUrl is computed on the server and shipped on
// ResultEntry.stayUrl; the client only renders it.
//
// Preferred path: the Travelpayouts **Links API** (POST /links/v1/create) converts a
// booking.com URL into the correct partner_url for OUR project (trs) — it fails
// cleanly with "trs is not subscribed for brand" until the Booking.com program is
// connected to the Midspot project in the dashboard (owner action). We cache each
// converted URL in-memory for 1 h (rate limit is 100 req/min per marker; ≤10 links/call).
//
// Fallback: the static click template on the **c84** host (the official offer page
// https://www.travelpayouts.com/en/offers/bookingcom-affiliate-program/ shows
// c84.travelpayouts.com/click?shmarker=…&promo_id=3650&…&custom_url=https://booking.com;
// promo_id 3650 = Booking.com program; the c111 host returns 403 for Booking).
//
// custom_url = a booking.com search URL carrying the destination city + the trip's
// checkin/checkout dates. The user books at the SAME price; the commission is paid
// by Booking.com. Env-overridable via TRAVELPAYOUTS_BOOKING_PROMO_ID (lib/env.ts);
// with no marker or no promo id configured we fall back to the plain booking.com
// search URL (no tracking) — graceful default, the link still works.
import { getConfig } from "@/lib/env";

/**
 * booking.com search URL for a destination city and a date range.
 * Dates are YYYY-MM-DD (checkin / checkout).
 */
export function bookingSearchUrl(city: string, checkin: string, checkout: string): string {
  const params = new URLSearchParams({
    ss: city,
    checkin,
    checkout,
    group_adults: "2",
    no_rooms: "1",
    group_children: "0",
    selected_currency: "EUR",
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

// in-memory cache of converted links (per search URL), 1 h TTL — also protects the
// Links API rate limit and avoids re-asking for the same URL
const linkCache = new Map<string, { url: string; at: number }>();
const LINK_CACHE_TTL_MS = 60 * 60 * 1000;

/** Static c84 click-template fallback (official Booking offer-page format). */
function staticClickLink(searchUrl: string): string {
  const cfg = getConfig();
  const promoId = cfg.travelpayoutsBookingPromoId;
  if (!cfg.travelpayoutsMarker || !promoId) return searchUrl;
  return (
    `https://c84.travelpayouts.com/click?shmarker=${cfg.travelpayoutsMarker}.` +
    `${cfg.travelpayoutsSubId}&promo_id=${promoId}` +
    `&source_type=customlink&type=click&custom_url=${encodeURIComponent(searchUrl)}`
  );
}

/** Convert one URL via the Travelpayouts Links API; null when not possible/failed. */
async function linksApiConvert(url: string): Promise<string | null> {
  const cfg = getConfig();
  if (!cfg.travelpayoutsApiKey || !cfg.travelpayoutsTrs || !cfg.travelpayoutsMarker) return null;
  try {
    const res = await fetch("https://api.travelpayouts.com/links/v1/create", {
      method: "POST",
      headers: { "X-Access-Token": cfg.travelpayoutsApiKey, "content-type": "application/json" },
      body: JSON.stringify({
        trs: Number(cfg.travelpayoutsTrs),
        marker: Number(cfg.travelpayoutsMarker),
        shorten: false,
        links: [{ url, sub_id: "midspot-stay" }],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      result?: { links?: Array<{ code?: string; partner_url?: string; message?: string }> };
    };
    const link = body.result?.links?.[0];
    if (link?.code === "success" && link.partner_url) return link.partner_url;
    return null;
  } catch {
    return null;
  }
}

/**
 * Affiliate link for a stay in `city` between `checkin` and `checkout`.
 * Uses the Links API (correct partner_url for our project) with a 1 h cache,
 * falling back to the static c84 click template, then to the plain search URL.
 */
export async function bookingAffiliateLink(
  city: string,
  checkin: string,
  checkout: string
): Promise<string> {
  const searchUrl = bookingSearchUrl(city, checkin, checkout);
  const cached = linkCache.get(searchUrl);
  if (cached && Date.now() - cached.at < LINK_CACHE_TTL_MS) return cached.url;
  const viaApi = await linksApiConvert(searchUrl);
  const finalUrl = viaApi ?? staticClickLink(searchUrl);
  linkCache.set(searchUrl, { url: finalUrl, at: Date.now() });
  return finalUrl;
}
