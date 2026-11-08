// Destination weather via Open-Meteo (https://open-meteo.com — free, no API key,
// CC BY 4.0; the UI shows the attribution via weather.source). Used by:
//   - app/api/search/[slug]/route.ts  → per-trip forecast on the top-10 result cards
//   - app/destinations/[city]/page.tsx → "Weather in {city} — next 7 days" widget
//
// fetchForecast() normalizes the daily endpoint to Forecast { days: WeatherDay[] } and
// NEVER throws: any network/parse/range error returns null and callers simply omit the
// weather UI. Results (including failures) are cached in memory for 30 min, keyed by
// rounded coordinates + date range, so repeated polls of the same search cost zero
// upstream calls. Next to the in-memory cache, static destination pages are additionally
// cached by the page-level ISR (revalidate = 3600).
import { addDays, format, parseISO } from "date-fns";

import type { ResultWeatherDay, WeatherCondition, WeatherIconName } from "@/lib/types";

/** One normalized forecast day. */
export type WeatherDay = ResultWeatherDay & {
  /** YYYY-MM-DD — local date at the destination (timezone=auto) */
  date: string;
  /** raw WMO weathercode (-1 when the API returned null) */
  code: number;
};

export type Forecast = { days: WeatherDay[] };

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
/** in-memory cache TTL — matches the flight-price cache cadence (1800 s) */
const CACHE_TTL_MS = 30 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;
/** open-meteo daily forecast horizon is 16 days */
const MAX_FORECAST_DAYS = 16;
/**
 * Upstream rate-limit smoothing: the free open-meteo tier answers bursts with HTTP 429
 * (seen when ~500 destination pages are prerendered at once across build workers).
 * A per-process queue spaces the START of upstream calls; 429/5xx are retried with
 * backoff (honoring Retry-After, capped). The in-memory cache above already absorbs
 * repeat polls, so this only paces genuine upstream calls.
 */
const MIN_CALL_INTERVAL_MS = 600;
const MAX_RETRIES = 2;

type CacheEntry = { at: number; value: Forecast | null };
const cache = new Map<string, CacheEntry>();

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let lastCallStart = 0;
let queue: Promise<unknown> = Promise.resolve();

/** Serialize upstream calls per process and keep MIN_CALL_INTERVAL_MS between starts. */
function schedule<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = MIN_CALL_INTERVAL_MS - (Date.now() - lastCallStart);
    if (wait > 0) await sleep(wait);
    lastCallStart = Date.now();
    return task();
  });
  queue = run.catch(() => undefined);
  return run;
}

/** One upstream GET with timeout + retry on 429/5xx. Throws on final failure. */
async function fetchJson(url: string): Promise<unknown> {
  let lastStatus = 0;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, {
        signal: controller.signal,
        headers: { accept: "application/json" },
      });
    } finally {
      clearTimeout(timer);
    }
    if (res.ok) return await res.json();
    lastStatus = res.status;
    if (res.status === 429 || res.status >= 500) {
      if (attempt < MAX_RETRIES) {
        const retryAfter = Number(res.headers.get("retry-after"));
        const backoff = Number.isFinite(retryAfter) && retryAfter > 0
          ? Math.min(retryAfter, 5) * 1000
          : (attempt + 1) * 1000;
        await sleep(backoff);
        continue;
      }
    }
    throw new Error(`open-meteo HTTP ${res.status}`);
  }
  throw new Error(`open-meteo HTTP ${lastStatus}`);
}

/**
 * WMO weathercode → short condition label (i18n key weather.labels.*) + lucide icon name.
 * Groups per the Faza 8B spec: 0 clear, 1–3 partly cloudy, 45/48 fog, 51–67 rain,
 * 71–77 snow, 80–82 showers, 95–99 thunderstorm; anything unknown → overcast.
 */
export function weatherCondition(code: number): { label: WeatherCondition; icon: WeatherIconName } {
  if (code === 0) return { label: "clear", icon: "sun" };
  if (code >= 1 && code <= 3) return { label: "partlyCloudy", icon: "cloudSun" };
  if (code === 45 || code === 48) return { label: "fog", icon: "cloudFog" };
  if (code >= 51 && code <= 67) return { label: "rain", icon: "cloudRain" };
  if (code >= 71 && code <= 77) return { label: "snow", icon: "cloudSnow" };
  if (code >= 80 && code <= 82) return { label: "showers", icon: "cloudDrizzle" };
  if (code >= 95 && code <= 99) return { label: "thunderstorm", icon: "cloudLightning" };
  return { label: "cloudy", icon: "cloud" };
}

/** Clamp the requested end date to the open-meteo horizon (start + 15 days). */
function clampEndDate(startDate: string, endDate: string): string {
  const start = parseISO(`${startDate}T00:00:00`);
  const maxEnd = addDays(start, MAX_FORECAST_DAYS - 1);
  const end = parseISO(`${endDate}T00:00:00`);
  return end > maxEnd ? format(maxEnd, "yyyy-MM-dd") : endDate;
}

/**
 * Fetch the daily forecast for [startDate, endDate] (YYYY-MM-DD, inclusive) at
 * (latitude, longitude). Never throws — returns null on any error or empty range.
 */
export async function fetchForecast(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<Forecast | null> {
  let cacheKey = "";
  try {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    if (!DAY_RE.test(startDate) || !DAY_RE.test(endDate)) return null;
    const end = endDate < startDate ? startDate : clampEndDate(startDate, endDate);
    // rounded coords: nearby airports/city centroids share one upstream call
    cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}:${startDate}:${end}`;
    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;

    const url =
      `${OPEN_METEO_URL}?latitude=${latitude}&longitude=${longitude}` +
      "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode" +
      `&timezone=auto&start_date=${startDate}&end_date=${end}`;

    // no explicit fetch cache option: fresh on every render beyond the in-memory
    // cache; static destination pages are still cached by the page-level ISR revalidate
    const json = (await schedule(() => fetchJson(url))) as {
      daily?: {
        time?: unknown;
        temperature_2m_max?: unknown;
        temperature_2m_min?: unknown;
        precipitation_probability_max?: unknown;
        weathercode?: unknown;
      };
    };
    const daily = json?.daily;
    if (!daily || !Array.isArray(daily.time)) throw new Error("open-meteo: no daily block");

    const times = daily.time as unknown[];
    const tMaxArr = (daily.temperature_2m_max ?? []) as unknown[];
    const tMinArr = (daily.temperature_2m_min ?? []) as unknown[];
    const rainArr = (daily.precipitation_probability_max ?? []) as unknown[];
    const codeArr = (daily.weathercode ?? []) as unknown[];

    const days: WeatherDay[] = [];
    for (let i = 0; i < times.length && days.length < MAX_FORECAST_DAYS; i++) {
      const tMax = Number(tMaxArr[i]);
      const tMin = Number(tMinArr[i]);
      if (!Number.isFinite(tMax) || !Number.isFinite(tMin)) continue; // day without temps → skip
      const rain = Number(rainArr[i]);
      const code = Number(codeArr[i]);
      const { label, icon } = weatherCondition(Number.isFinite(code) ? code : -1);
      days.push({
        date: String(times[i]),
        tMin: Math.round(tMin),
        tMax: Math.round(tMax),
        rainPct: Number.isFinite(rain) ? Math.max(0, Math.min(100, Math.round(rain))) : 0,
        code: Number.isFinite(code) ? code : -1,
        label,
        icon,
      });
    }

    const value: Forecast | null = days.length > 0 ? { days } : null;
    cache.set(cacheKey, { at: Date.now(), value });
    return value;
  } catch (err) {
    console.warn("[weather] fetchForecast failed:", err);
    // cache the failure for the same TTL so an outage doesn't hammer the API on every poll
    if (cacheKey) cache.set(cacheKey, { at: Date.now(), value: null });
    return null;
  }
}

/**
 * YYYY-MM-DD range for the next `days` days starting at `from` (server-local date —
 * the box runs UTC). Used by the /destinations/[city] widget ("next 7 days").
 */
export function nextDaysRange(days: number, from: Date = new Date()): { startDate: string; endDate: string } {
  const n = Math.max(1, Math.min(MAX_FORECAST_DAYS, Math.floor(days)));
  return {
    startDate: format(from, "yyyy-MM-dd"),
    endDate: format(addDays(from, n - 1), "yyyy-MM-dd"),
  };
}
