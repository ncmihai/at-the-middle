// lib/share.ts — pure, client-safe helpers shared by the dynamic OG image
// (app/r/[slug]/opengraph-image.tsx, server), the downloadable canvas share
// card (components/ShareCardButton.tsx, client) and the copy-invite button
// (components/InviteButton.tsx, client). PLAN.md Faza 4 lot 4+5+6.
//
// No node-only or browser-only APIs at module scope: safe to import from both
// a server route and a "use client" component.
import { getMessages, type Language } from "@/lib/i18n";

/** Canonical share-card canvas size (OG standard). */
export const SHARE_CARD_SIZE = { width: 1200, height: 630 } as const;

/** Brand gradient (sky-400 → blue-600) + card chrome, shared by OG and canvas. */
export const SHARE_CARD_COLORS = {
  gradientFrom: "#38bdf8",
  gradientTo: "#2563eb",
  wordmarkBg: "rgba(255,255,255,0.20)",
  pillBg: "rgba(255,255,255,0.18)",
  text: "#ffffff",
} as const;

/** Everything needed to render a card — a DB row or a ResultEntry both map onto it. */
export type ShareCardInput = {
  destinationCity: string;
  destinationCountry: string;
  /** YYYY-MM-DD */
  departureDate: string;
  /** YYYY-MM-DD */
  returnDate: string;
  /** max(arriveUtc) − min(arriveUtc) of outbound legs, minutes */
  gapMinutes: number;
  /** outbound + return for the most expensive traveler, EUR */
  pricePerPersonEur: number;
};

export type ShareCardModel = {
  /** big line: "Lisbon, Portugal" */
  title: string;
  /** dates line: "Sep 3 → Sep 10" */
  subtitle: string;
  /** badge: "arrivals within 1 h 35 min" */
  gapText: string;
  /** price line: "from €198.50 / person" */
  priceText: string;
  /** full share URL shown small on the card */
  url: string;
};

/** "1 h 35 min" / "45 min" / "2 h" (same wording as lib/utils.formatDuration). */
export function formatGap(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h <= 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** EUR money, e.g. "€198.50" (same format as lib/utils.formatMoney). */
export function formatPrice(eur: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(eur);
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-09-03" → "Sep 3" (no date-fns — must stay dependency-free for the OG route). */
export function formatCardDate(iso: string): string {
  const parts = iso.split("-");
  const month = MONTHS[Number(parts[1]) - 1];
  if (!month || parts.length < 3) return iso;
  return `${month} ${Number(parts[2])}`;
}

/** Canonical site URL: env on server + client bundle, window origin in the browser. */
export function getSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "http://localhost:3005";
}

/** Full share URL for a search slug. */
export function shareUrlFor(slug: string, siteUrl: string = getSiteUrl()): string {
  return `${siteUrl.replace(/\/+$/, "")}/r/${encodeURIComponent(slug)}`;
}

/** What inviteText() needs — a ResultEntry maps directly onto it. */
export type InviteInput = {
  destinationCity: string;
  destinationCountry: string;
  /** YYYY-MM-DD */
  departureDate: string;
  /** YYYY-MM-DD */
  returnDate: string;
  /** max(arriveUtc) − min(arriveUtc) of outbound legs, minutes */
  gapMinutes: number;
};

/**
 * Prefilled invite message for the best result, localized in `lang`
 * (PLAN.md Faza 4 lot 6 — the "Copy invite" button on /r/[slug]).
 * Dates/gap use the same dependency-free formatters as the share card
 * ("Nov 20", "1 h 35 min"); the sentence template itself is per-language,
 * from lib/i18n (results.inviteTemplate).
 */
export function inviteText(result: InviteInput, url: string, lang: Language): string {
  const template = getMessages(lang).results.inviteTemplate;
  return template({
    city: result.destinationCity,
    country: result.destinationCountry,
    dep: formatCardDate(result.departureDate),
    ret: formatCardDate(result.returnDate),
    gap: formatGap(result.gapMinutes),
    url,
  });
}

/** "https://midspot.ncmihai.dev/r/x" → "midspot.ncmihai.dev" (never throws). */
export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/**
 * The share-card content model — identical for the OG image and the canvas PNG.
 * Card copy is brand-level English (a share asset for social, like the wordmark);
 * all surrounding UI chrome stays localized via lib/i18n.
 */
export function cardModel(
  result: ShareCardInput,
  siteUrl: string,
  slug?: string
): ShareCardModel {
  const base = siteUrl.replace(/\/+$/, "");
  return {
    title: result.destinationCountry
      ? `${result.destinationCity}, ${result.destinationCountry}`
      : result.destinationCity,
    subtitle: `${formatCardDate(result.departureDate)} → ${formatCardDate(result.returnDate)}`,
    gapText: `arrivals within ${formatGap(result.gapMinutes)}`,
    priceText: `from ${formatPrice(result.pricePerPersonEur)} / person`,
    url: slug ? `${base}/r/${encodeURIComponent(slug)}` : base,
  };
}
