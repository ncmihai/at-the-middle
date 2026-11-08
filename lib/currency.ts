// lib/currency.ts — multi-currency DISPLAY support (owner-approved spec).
//
// All flight prices are stored and processed internally in EUR; only the
// DISPLAY converts to the visitor's selected currency. Default = EUR.
//
// Rates come from the free Frankfurter API (ECB reference rates, no API key):
//   https://api.frankfurter.dev/v1/latest?base=EUR&symbols=<our 15 codes>
// getRates() caches the response in module memory for 24 h and falls back to
// an embedded static approximate map when the API is unreachable, so the app
// never breaks offline.
//
// This module is server-safe (no "use client", no browser APIs at module
// scope): server code imports CURRENCIES/getRates/convertEur/formatMoneyCur,
// client components additionally use the useCurrency() hook below (same
// pattern as lib/i18n/index.ts — the hooks are only ever called from client
// components).
import * as React from "react";

// ---------------------------------------------------------------------------
// Currency list — the 15 supported display currencies, EUR first.
// ---------------------------------------------------------------------------

export const CURRENCY_CODES = [
  "EUR",
  "RON",
  "USD",
  "GBP",
  "CHF",
  "PLN",
  "CZK",
  "SEK",
  "HUF",
  "DKK",
  "NOK",
  "BGN",
  "TRY",
  "ILS",
  "AED",
] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "EUR";

export type CurrencyInfo = { code: CurrencyCode; symbol: string; name: string };

/** Ordered list of the 15 supported currencies (EUR first) with symbol + English name. */
export const CURRENCIES: CurrencyInfo[] = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "RON", symbol: "lei", name: "Romanian leu" },
  { code: "USD", symbol: "$", name: "US dollar" },
  { code: "GBP", symbol: "£", name: "British pound" },
  { code: "CHF", symbol: "CHF", name: "Swiss franc" },
  { code: "PLN", symbol: "zł", name: "Polish złoty" },
  { code: "CZK", symbol: "Kč", name: "Czech koruna" },
  { code: "SEK", symbol: "kr", name: "Swedish krona" },
  { code: "HUF", symbol: "Ft", name: "Hungarian forint" },
  { code: "DKK", symbol: "kr", name: "Danish krone" },
  { code: "NOK", symbol: "kr", name: "Norwegian krone" },
  { code: "BGN", symbol: "лв", name: "Bulgarian lev" },
  { code: "TRY", symbol: "₺", name: "Turkish lira" },
  { code: "ILS", symbol: "₪", name: "Israeli new shekel" },
  { code: "AED", symbol: "Dh", name: "UAE dirham" },
];

const CURRENCY_BY_CODE: Record<CurrencyCode, CurrencyInfo> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c])
) as Record<CurrencyCode, CurrencyInfo>;

export function isCurrencyCode(value: string | null | undefined): value is CurrencyCode {
  return !!value && (CURRENCY_CODES as readonly string[]).includes(value);
}

/** Info (symbol + name) for a code — falls back to EUR info for unknown codes. */
export function currencyInfo(code: string): CurrencyInfo {
  return (CURRENCY_BY_CODE as Record<string, CurrencyInfo>)[code] ?? CURRENCY_BY_CODE.EUR;
}

// ---------------------------------------------------------------------------
// Rates — Frankfurter (ECB reference) with 24 h in-memory cache + static fallback.
// ---------------------------------------------------------------------------

/** Plain map code -> units per 1 EUR (e.g. RON: 4.97). */
export type RateMap = Record<string, number>;

export type Rates = {
  base: "EUR";
  /** YYYY-MM-DD of the ECB reference rates */
  date: string;
  rates: RateMap;
};

/**
 * FALLBACK ONLY — static approximate ECB reference rates (units per 1 EUR),
 * used when api.frankfurter.dev is unreachable so the app never breaks offline.
 * Real rates always come from getRates(); these are just a safety net.
 */
export const FALLBACK_RATES: RateMap = {
  EUR: 1,
  RON: 4.97,
  USD: 1.16,
  GBP: 0.85,
  CHF: 0.94,
  PLN: 4.32,
  CZK: 24.3,
  SEK: 11.3,
  HUF: 390,
  DKK: 7.46,
  NOK: 11.6,
  BGN: 1.9558,
  TRY: 48,
  ILS: 3.8,
  AED: 4.27,
};

/** Approximate date stamped on the fallback map (so the UI can still show a date). */
export const FALLBACK_RATES_DATE = "2026-11-01";

const RATES_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 h in-memory cache
const FALLBACK_CACHE_TTL_MS = 15 * 60 * 1000; // retry the API soon after a failure
const FETCH_TIMEOUT_MS = 6000;

let ratesCache: { at: number; data: Rates } | null = null;

function normalizeRates(json: unknown): Rates | null {
  if (!json || typeof json !== "object") return null;
  const rec = json as { base?: unknown; date?: unknown; rates?: unknown };
  if (typeof rec.rates !== "object" || rec.rates === null) return null;
  const raw = rec.rates as Record<string, unknown>;
  const rates: RateMap = { EUR: 1 };
  for (const code of CURRENCY_CODES) {
    const v = Number(raw[code]);
    if (Number.isFinite(v) && v > 0) rates[code] = v;
  }
  // every supported code must be present — fill gaps from the fallback map
  for (const code of CURRENCY_CODES) {
    if (!rates[code]) rates[code] = FALLBACK_RATES[code] ?? 1;
  }
  const date =
    typeof rec.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rec.date)
      ? rec.date
      : new Date().toISOString().slice(0, 10);
  return { base: "EUR", date, rates };
}

/**
 * Latest ECB reference rates (via Frankfurter) for all 15 currencies, base EUR.
 * Cached in module memory for 24 h; on fetch failure returns the embedded
 * static approximate map (FALLBACK_RATES) so the app never breaks offline.
 * Never throws.
 */
export async function getRates(): Promise<Rates> {
  if (ratesCache && Date.now() - ratesCache.at < RATES_CACHE_TTL_MS) return ratesCache.data;
  const symbols = CURRENCY_CODES.join(",");
  try {
    const res = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${symbols}`,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), cache: "no-store" }
    );
    if (!res.ok) throw new Error(`frankfurter HTTP ${res.status}`);
    const data = normalizeRates(await res.json());
    if (!data) throw new Error("frankfurter: unexpected payload");
    ratesCache = { at: Date.now(), data };
    return data;
  } catch {
    const data: Rates = {
      base: "EUR",
      date: FALLBACK_RATES_DATE,
      rates: { ...FALLBACK_RATES },
    };
    // cache the fallback briefly so we retry the API soon instead of hammering it
    ratesCache = { at: Date.now() - RATES_CACHE_TTL_MS + FALLBACK_CACHE_TTL_MS, data };
    return data;
  }
}

/** Units per 1 EUR for `code` — falls back to the static map, then 1. */
export function rateFor(code: string, rates: RateMap | Rates): number {
  const map = rates && typeof rates === "object" && "rates" in rates ? rates.rates : rates;
  return (
    (map as RateMap | undefined)?.[code] ??
    FALLBACK_RATES[code] ??
    1
  );
}

/** Convert an EUR amount to `code` (display only — storage stays EUR). */
export function convertEur(eur: number, code: string, rates: RateMap | Rates): number {
  return eur * rateFor(code, rates);
}

/**
 * Format an EUR amount in `code` for display, 2 decimals.
 * EUR formatting is byte-identical to the historical formatMoney (en-IE) so
 * existing tests/screenshots don't regress; other currencies use the
 * browser/default locale (or `locale` when given).
 */
export function formatMoneyCur(
  eur: number,
  code: string,
  rates: RateMap | Rates,
  locale?: string
): string {
  if (!isCurrencyCode(code) || code === "EUR") {
    // byte-identical to lib/utils.formatMoney (en-IE, EUR, 2 decimals)
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(eur);
  }
  return new Intl.NumberFormat(locale ?? undefined, {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertEur(eur, code, rates));
}

// ---------------------------------------------------------------------------
// Client side — cookie + window event + rates fetch, mirroring lib/i18n.
// ---------------------------------------------------------------------------

/** Cookie that stores the chosen currency (read client-side, set by <CurrencySwitcher/>). */
export const CUR_COOKIE = "midspot-cur";
/** window event dispatched on every currency change so all useCurrency() hooks re-render. */
export const CUR_CHANGE_EVENT = "midspot:cur";
/** localStorage key for the cached rates payload ({ fetchedAt, date, rates }). */
export const RATES_STORAGE_KEY = "midspot-rates";

const CLIENT_RATES_TTL_MS = 24 * 60 * 60 * 1000;

/** Client-side cookie read (null on the server). */
export function readCurCookie(): string | null {
  if (typeof document === "undefined") return null;
  try {
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${CUR_COOKIE}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

/** Persist the currency choice and notify every useCurrency() on the page (re-render only). */
export function setCurrency(code: CurrencyCode): void {
  if (typeof document !== "undefined") {
    document.cookie = `${CUR_COOKIE}=${encodeURIComponent(code)}; path=/; max-age=31536000; samesite=lax`;
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<CurrencyCode>(CUR_CHANGE_EVENT, { detail: code }));
  }
}

type StoredRates = { fetchedAt: number; date: string; rates: RateMap };

// one in-flight fetch shared by every useCurrency() instance on the page
let ratesFetch: Promise<Rates | null> | null = null;

async function fetchClientRates(): Promise<Rates | null> {
  if (ratesFetch) return ratesFetch;
  ratesFetch = (async () => {
    try {
      const res = await fetch("/api/rates", { cache: "no-store" });
      if (!res.ok) return null;
      const data = normalizeRates(await res.json());
      if (data) {
        try {
          const stored: StoredRates = { fetchedAt: Date.now(), date: data.date, rates: data.rates };
          window.localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(stored));
        } catch {
          // storage full/blocked — best-effort
        }
      }
      return data;
    } catch {
      return null;
    } finally {
      ratesFetch = null;
    }
  })();
  return ratesFetch;
}

function readStoredRates(): StoredRates | null {
  try {
    const raw = window.localStorage.getItem(RATES_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const rec = parsed as { fetchedAt?: unknown; date?: unknown; rates?: unknown };
    if (
      typeof rec.fetchedAt === "number" &&
      Date.now() - rec.fetchedAt < CLIENT_RATES_TTL_MS &&
      rec.rates && typeof rec.rates === "object"
    ) {
      return {
        fetchedAt: rec.fetchedAt,
        date: typeof rec.date === "string" ? rec.date : "",
        rates: rec.rates as RateMap,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export type UseCurrency = {
  code: CurrencyCode;
  rates: RateMap;
  /** YYYY-MM-DD of the rates currently in use ("" until loaded) */
  rateDate: string;
  /** format an EUR amount in the selected currency */
  fmt: (eur: number) => string;
  setCode: (code: CurrencyCode) => void;
};

/**
 * Current display currency + rates + formatter.
 * SSR and the FIRST client render always use EUR (no hydration mismatch); after
 * mount the cookie value is applied and every CUR_CHANGE_EVENT switches live —
 * same pattern as useLanguage(). Rates are fetched once from /api/rates and
 * cached in localStorage for 24 h.
 */
export function useCurrency(): UseCurrency {
  const [code, setCodeState] = React.useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [rates, setRates] = React.useState<RateMap>({ EUR: 1 });
  const [rateDate, setRateDate] = React.useState<string>("");

  React.useEffect(() => {
    const cookie = readCurCookie();
    if (isCurrencyCode(cookie)) setCodeState(cookie);
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (isCurrencyCode(detail)) setCodeState(detail);
    };
    window.addEventListener(CUR_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CUR_CHANGE_EVENT, onChange);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const stored = readStoredRates();
    if (stored) {
      setRates(stored.rates);
      setRateDate(stored.date);
      return () => {
        cancelled = true;
      };
    }
    void fetchClientRates().then((data) => {
      if (cancelled || !data) return;
      setRates(data.rates);
      setRateDate(data.date);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const fmt = React.useCallback((eur: number) => formatMoneyCur(eur, code, rates), [code, rates]);

  const setCode = React.useCallback((next: CurrencyCode) => {
    setCurrency(next);
    setCodeState(next);
  }, []);

  return { code, rates, rateDate, fmt, setCode };
}
