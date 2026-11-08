// Canonical domain types shared by backend and frontend.
// Aligned with docs/app-spec.md §2/§3 and docs/flight-data-spec.md §0.

export type AirportSuggestion = {
  iata: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
};

export type FlightOption = {
  /** YYYY-MM-DD departure date this option belongs to */
  date: string;
  flightNumber: string;
  /** ISO 8601 with offset, for display */
  departLocal: string;
  arriveLocal: string;
  /** epoch seconds, UTC — the arrival gap is computed from arriveUtc */
  departUtc: number;
  arriveUtc: number;
  durationMinutes: number;
  priceEur: number;
  bookingUrl: string;
};

export type FlightProvider = {
  name: string;
  searchAirports(query: string): Promise<AirportSuggestion[]>;
  /**
   * One-way search over a date range (range-collapse: one provider call can
   * cover [dateFrom, dateTo]). Returns options tagged with their departure date.
   */
  searchOneWayRange(
    origin: string,
    dest: string,
    dateFrom: string,
    dateTo: string,
    adults: number
  ): Promise<FlightOption[]>;
  /** Affiliate deep link — user books at the SAME price on the partner site. */
  affiliateLink(args: {
    origin: string;
    dest: string;
    date: string;
    returnDate?: string;
    adults: number;
  }): string;
};

export type SearchRequest = {
  origins: string[]; // 2–8 unique IATA codes, 1 adult each
  windowStart: string; // YYYY-MM-DD, earliest departure
  windowEnd: string; // YYYY-MM-DD, latest departure (windowEnd - windowStart <= 30; whole-month mode = first..last day of month)
  nights: number; // 1–30, return = departure + nights for everyone
  budgetPerPersonEur: number; // 20–5000, includes outbound + return
  maxFlightMinutes?: number | null; // optional per-leg cap
};

export type SearchStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export type PersonLeg = {
  origin: string;
  flightNumber: string;
  departLocal: string;
  arriveLocal: string;
  durationMinutes: number;
  priceEur: number;
  bookingUrl: string;
};

/** ADDITIVE (Faza 7): kinds of affiliate "extras" offered per result. */
export type ResultExtraKey = "transfer" | "car" | "esim" | "activities";

/** ADDITIVE (Faza 7): one converted affiliate "extra" link (see ResultEntry.extras). */
export type ResultExtra = { key: ResultExtraKey; url: string };

/**
 * ADDITIVE (Faza 8B): WMO weathercode group — localized via weather.labels.* and mapped
 * to a lucide icon in the UI (lib/weather.ts weatherCondition()).
 */
export type WeatherCondition =
  | "clear"
  | "partlyCloudy"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "showers"
  | "thunderstorm";

/**
 * ADDITIVE (Faza 8B): lucide icon name for a weather condition — a string (not the
 * component) so it survives JSON serialization from the API route to the client.
 */
export type WeatherIconName =
  | "sun"
  | "cloudSun"
  | "cloud"
  | "cloudFog"
  | "cloudRain"
  | "cloudSnow"
  | "cloudDrizzle"
  | "cloudLightning";

/** ADDITIVE (Faza 8B): one day of the destination forecast attached to a result (lib/weather.ts, open-meteo). */
export type ResultWeatherDay = {
  /** °C */
  tMin: number;
  /** °C */
  tMax: number;
  /** max precipitation probability for the day, 0–100 */
  rainPct: number;
  label: WeatherCondition;
  icon: WeatherIconName;
};

export type ResultEntry = {
  rank: number;
  destinationIata: string;
  destinationCity: string;
  destinationCountry: string;
  departureDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  /** max(arriveUtc) - min(arriveUtc) of outbound legs, in minutes */
  gapMinutes: number;
  totalPriceEur: number;
  outbound: PersonLeg[];
  return: PersonLeg[];
  /**
   * ADDITIVE (Faza 4 lot 3): Booking.com affiliate search URL for this destination
   * (city + departure/return dates as checkin/checkout), computed server-side by
   * lib/affiliate.ts bookingAffiliateLink — the "Stay in <city>" button opens it.
   */
  stayUrl?: string;
  /**
   * ADDITIVE (Faza 7): per-result affiliate "extras" — airport transfer (Welcome Pickups),
   * car rental (QEEQ), eSIM (Airalo), activities (Tiqets) — converted server-side via the
   * Travelpayouts Links API (lib/affiliate.ts extrasAffiliateLinks: one batched call of 4
   * links per result, converted URLs cached 1 h). Present only for the top-10 results and
   * only for the extras that converted successfully; absent otherwise.
   */
  extras?: ResultExtra[];
  /**
   * ADDITIVE (Faza 8B): destination forecast for the trip days (open-meteo, computed
   * server-side in app/api/search/[slug]/route.ts for the top-10 results) — one entry
   * per trip day, capped at 7, in trip order (day 0 = departureDate). Absent when the
   * destination has no coordinates or the forecast fetch failed.
   */
  weather?: ResultWeatherDay[];
};

export type SearchProgress = {
  doneSteps: number;
  totalSteps: number;
  currentStep: string;
};

/** lat/lon of an airport (airports table / candidate shortlist) — used by the results map */
export type AirportCoords = { latitude: number; longitude: number };

export type SearchResponse = {
  slug: string;
  status: SearchStatus;
  progress: SearchProgress;
  results: ResultEntry[];
  error?: string;
  /** set when the 24h gap found nothing and the search was re-evaluated at 30h */
  relaxedGapHours?: number;
  /** true when the search ran cache-only because the provider hit PROVIDER_MONTHLY_CAP this month */
  usageLimited?: boolean;
  createdAt: string;
  /** ADDITIVE (Faza 4): the stored search params, echoed back so the results page can offer one-click "relax" re-searches */
  request?: SearchRequest;
  /** ADDITIVE (Faza 4): resolved coordinates for request.origins (airports table, candidate shortlist fallback), keyed by IATA — for the results map pins */
  originCoords?: Record<string, AirportCoords | null>;
};
