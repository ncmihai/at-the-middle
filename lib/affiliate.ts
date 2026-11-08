// Booking.com "stay" affiliate links, one per search result — PLAN.md Faza 4 lot 3.
//
// SERVER-ONLY: this module reads the Travelpayouts marker / promo ids via lib/env
// (getConfig) — never import it from a client component. The marker/subId are
// public-by-design (they appear in every affiliate link), but we keep them
// server-side where possible: stayUrl is computed on the server and shipped on
// ResultEntry.stayUrl; the client only renders it.
//
// Link template = the same c111.travelpayouts.com/click shape as
// lib/flights/provider.ts wrapAffiliateDeepLink (docs/flight-data-spec.md §2/§4),
// but promo_id is the **Booking.com program on Travelpayouts = 3650**, as shown on
// the official offer page https://www.travelpayouts.com/en/offers/bookingcom-affiliate-program/
// ("PAGE ADDRESS LINK": https://c84.travelpayouts.com/click?shmarker=…&promo_id=3650
// &source_type=customlink&type=click&custom_url=https://booking.com — the cNN click
// host is interchangeable; we use c111 like the Kiwi links).
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

/**
 * Travelpayouts click link (c111 template) wrapping the booking.com search URL
 * for `city` + `checkin`/`checkout`. Falls back to the plain search URL when the
 * marker or the Booking promo id is not configured.
 */
export function bookingAffiliateLink(city: string, checkin: string, checkout: string): string {
  const searchUrl = bookingSearchUrl(city, checkin, checkout);
  const cfg = getConfig();
  const promoId = cfg.travelpayoutsBookingPromoId;
  if (!cfg.travelpayoutsMarker || !promoId) return searchUrl; // no tracking configured → plain URL
  return (
    `https://c111.travelpayouts.com/click?shmarker=${cfg.travelpayoutsMarker}.` +
    `${cfg.travelpayoutsSubId}&promo_id=${promoId}` +
    `&source_type=customlink&type=click&custom_url=${encodeURIComponent(searchUrl)}`
  );
}
