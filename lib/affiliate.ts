// Affiliate links for midspot — Booking.com "stay" per result (PLAN.md Faza 4 lot 3) and
// the per-result "extras" (Faza 7: airport transfer / car rental / eSIM / activities).
//
// SERVER-ONLY: this module reads the Travelpayouts marker / promo ids via lib/env
// (getConfig) — never import it from a client component. The marker/subId are
// public-by-design (they appear in every affiliate link), but we keep them
// server-side where possible: links are computed on the server and shipped on
// ResultEntry.stayUrl / ResultEntry.extras; the client only renders them.
//
// Primary path for every brand: the Travelpayouts **Links API** (POST /links/v1/create)
// converts a full brand URL into the correct partner_url for OUR project (trs) — it fails
// cleanly with "trs is not subscribed for brand" until that program is connected to the
// Midspot project in the dashboard (owner action). Booking.com is NOT connected yet
// (review pending), so the stay link falls back to the static click template (§2.4 of
// docs/flight-data-spec.md); the Faza 7 extras brands (Welcome Pickups, QEEQ, Airalo,
// Tiqets) ARE connected to trs 597282 and go through the Links API only — on any
// failure that extra is simply omitted.
//
// Links API limits (docs/flight-data-spec.md §2.2/§2.3): max 10 links per call, 100
// req/min per marker → convertViaLinksApi() batches into calls of ≤10 links and spaces
// real API calls ≥650 ms apart; every converted URL is cached in-memory for 1 h
// (linkCache) so repeat polls don't re-hit the API.
//
// Kiwi.com flight links are the exception: Kiwi is on the Links API exclusion list, those
// keep using the manual c111 click template (lib/flights/provider.ts affiliateLink).
import { getConfig } from "@/lib/env";
import { isCurrencyCode } from "@/lib/currency";
import type { ResultExtra, ResultExtraKey } from "@/lib/types";

/**
 * booking.com search URL for a destination city and a date range.
 * Dates are YYYY-MM-DD (checkin / checkout). `currency` is the display currency
 * passed as booking's selected_currency — only codes from our 15 supported
 * currencies are accepted, anything else falls back to EUR.
 */
export function bookingSearchUrl(
  city: string,
  checkin: string,
  checkout: string,
  currency: string = "EUR"
): string {
  const params = new URLSearchParams({
    ss: city,
    checkin,
    checkout,
    group_adults: "2",
    no_rooms: "1",
    group_children: "0",
    selected_currency: isCurrencyCode(currency) ? currency : "EUR",
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

// in-memory cache of converted links (per brand URL), 1 h TTL — also protects the
// Links API rate limit and avoids re-asking for the same URL
const linkCache = new Map<string, { url: string; at: number }>();
const LINK_CACHE_TTL_MS = 60 * 60 * 1000;

// Links API limits: ≤10 links per call, 100 req/min per marker (one call per 600 ms)
const LINKS_API_MAX_PER_CALL = 10;
const LINKS_API_MIN_INTERVAL_MS = 650;
let lastLinksApiCallAt = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Space out real Links API calls so we stay under 100 req/min per marker. */
async function throttleLinksApi(): Promise<void> {
  const wait = LINKS_API_MIN_INTERVAL_MS - (Date.now() - lastLinksApiCallAt);
  if (wait > 0) await sleep(wait);
  lastLinksApiCallAt = Date.now();
}

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

/**
 * Convert brand URLs via the Travelpayouts Links API, batched into calls of ≤10 links
 * (the per-call limit). Returns one entry per input URL, aligned by index: the
 * partner_url on success, null when not possible/failed. Each converted URL is cached
 * in-memory for 1 h (linkCache); cached URLs are not sent to the API again.
 */
export async function convertViaLinksApi(urls: string[], subId: string): Promise<(string | null)[]> {
  const result: (string | null)[] = new Array(urls.length).fill(null);
  const todo: number[] = [];
  urls.forEach((u, i) => {
    const cached = linkCache.get(u);
    if (cached && Date.now() - cached.at < LINK_CACHE_TTL_MS) result[i] = cached.url;
    else todo.push(i);
  });
  if (todo.length === 0) return result;

  const cfg = getConfig();
  if (!cfg.travelpayoutsApiKey || !cfg.travelpayoutsTrs || !cfg.travelpayoutsMarker) return result;

  for (let start = 0; start < todo.length; start += LINKS_API_MAX_PER_CALL) {
    const batch = todo.slice(start, start + LINKS_API_MAX_PER_CALL);
    await throttleLinksApi();
    try {
      const res = await fetch("https://api.travelpayouts.com/links/v1/create", {
        method: "POST",
        headers: { "X-Access-Token": cfg.travelpayoutsApiKey, "content-type": "application/json" },
        body: JSON.stringify({
          trs: Number(cfg.travelpayoutsTrs),
          marker: Number(cfg.travelpayoutsMarker),
          shorten: false,
          links: batch.map((i) => ({ url: urls[i], sub_id: subId })),
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue; // leave this batch as nulls
      const body = (await res.json()) as {
        result?: { links?: Array<{ code?: string; partner_url?: string; message?: string }> };
      };
      const links = body.result?.links;
      if (!Array.isArray(links) || links.length !== batch.length) continue;
      batch.forEach((urlIdx, j) => {
        const link = links[j];
        if (link?.code === "success" && link.partner_url) {
          result[urlIdx] = link.partner_url;
          linkCache.set(urls[urlIdx], { url: link.partner_url, at: Date.now() });
        }
      });
    } catch {
      // network/timeout — leave this batch as nulls
    }
  }
  return result;
}

/**
 * Affiliate link for a stay in `city` between `checkin` and `checkout`.
 * Uses the Links API (correct partner_url for our project) with a 1 h cache,
 * falling back to the static c84 click template, then to the plain search URL.
 * `currency` (one of our 15 display codes) is forwarded as booking's
 * selected_currency so the partner page opens in the visitor's currency.
 */
export async function bookingAffiliateLink(
  city: string,
  checkin: string,
  checkout: string,
  currency: string = "EUR"
): Promise<string> {
  const searchUrl = bookingSearchUrl(city, checkin, checkout, currency);
  const cached = linkCache.get(searchUrl);
  if (cached && Date.now() - cached.at < LINK_CACHE_TTL_MS) return cached.url;
  const [viaApi] = await convertViaLinksApi([searchUrl], "midspot-stay");
  const finalUrl = viaApi ?? staticClickLink(searchUrl);
  linkCache.set(searchUrl, { url: finalUrl, at: Date.now() });
  return finalUrl;
}

// ---------------------------------------------------------------------------
// Faza 7 — per-result "extras" brand deep links (programs already connected to
// the Midspot project, trs 597282). URL formats verified against the live brand
// sites (docs/flight-data-spec.md §2.5): the Links API converts any full brand URL.
// ---------------------------------------------------------------------------

/** URL-safe slug: lowercase, diacritics stripped, runs of non-alphanumerics → "-". */
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Welcome Pickups — airport-transfer search page for the destination city, with the
 * form prefilled "From: <destination airport>" (verified: /barcelona/airport-transfer/,
 * /paris/airport-transfer/). Note: /en/search?location=… does NOT exist (404) — the
 * city page is the real entry point.
 */
export function welcomePickupsUrl(city: string): string {
  const slug = slugify(city);
  return slug
    ? `https://www.welcomepickups.com/${slug}/airport-transfer/`
    : "https://www.welcomepickups.com/";
}

/** QEEQ — car-rental search results for the city and the trip dates (checkin/checkout). */
export function qeeqUrl(city: string, checkin: string, checkout: string): string {
  const params = new URLSearchParams({
    location: city,
    pickUpDate: checkin,
    dropOffDate: checkout,
  });
  return `https://www.qeeq.com/en/search?${params.toString()}`;
}

/**
 * Airalo — country eSIM page. Airalo uses country-NAME slugs, not ISO codes (verified:
 * /spain-esim, /germany-esim, /united-kingdom-esim are real pages; /es-esim is an error
 * page) → `https://www.airalo.com/<country-name-slug>-esim`, falling back to the eSIM
 * store when no country is known.
 */
export function airaloUrl(country: string): string {
  const slug = slugify(country);
  return slug ? `https://www.airalo.com/${slug}-esim` : "https://www.airalo.com/esim";
}

/** Tiqets — "things to do" search for the city (verified: /en/search?q=barcelona). */
export function tiqetsUrl(city: string): string {
  return `https://www.tiqets.com/en/search?q=${encodeURIComponent(city)}`;
}

export type ExtrasInput = {
  city: string;
  country: string;
  /** YYYY-MM-DD — trip departure, used as rental/transfer date */
  checkin: string;
  /** YYYY-MM-DD — trip return */
  checkout: string;
};

/** The 4 brand deep links offered as "extras" for one result destination. */
export function buildExtrasUrls(input: ExtrasInput): { key: ResultExtraKey; url: string }[] {
  return [
    { key: "transfer", url: welcomePickupsUrl(input.city) },
    { key: "car", url: qeeqUrl(input.city, input.checkin, input.checkout) },
    { key: "esim", url: airaloUrl(input.country) },
    { key: "activities", url: tiqetsUrl(input.city) },
  ];
}

/**
 * Convert the 4 extras brand URLs of ONE result in a single batched Links API call
 * (4 links ≤ 10/call). Returns only the extras that converted successfully; on any
 * failure the affected extra is omitted — this never throws.
 */
export async function extrasAffiliateLinks(input: ExtrasInput): Promise<ResultExtra[]> {
  try {
    const brandUrls = buildExtrasUrls(input);
    const converted = await convertViaLinksApi(
      brandUrls.map((b) => b.url),
      "midspot-extras"
    );
    return brandUrls
      .map((b, i) => ({ key: b.key, url: converted[i] }))
      .filter((e): e is ResultExtra => e.url != null);
  } catch {
    return [];
  }
}
