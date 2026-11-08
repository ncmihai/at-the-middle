// English — source of truth for ALL user-facing copy (docs/app-spec.md §6.5,
// PLAN.md "Faza 3 — consens"). The other files in this folder (ro/de/fr/es/it)
// must keep the exact same key structure; only `legal` (the long-form Privacy /
// Terms pages) is required for en + ro — other languages fall back to English
// (PLAN.md: legal pages "EN + RO at minimum").

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};
export type LegalContent = { privacy: LegalDoc; terms: LegalDoc };

/** Placeholders of the prefilled invite message (PLAN.md Faza 4 lot 6) — lib/share.ts inviteText() fills them. */
export type InviteArgs = {
  city: string;
  country: string;
  /** short departure date, e.g. "Nov 20" */
  dep: string;
  /** short return date, e.g. "Nov 24" */
  ret: string;
  /** arrival gap, e.g. "1 h 35 min" */
  gap: string;
  url: string;
};

export const en = {
  brand: {
    name: "midspot",
    heroTitle: "Meet in the middle",
    heroSubtitle:
      "One destination, everyone flies from home, and everyone arrives within a day of each other — inside your budget.",
    heroPoints: [
      "2–8 travelers, each from their own city",
      "Flexible trip dates — or pick a whole month",
      "Ranked by arrival gap, then by price",
    ],
  },
  form: {
    title: "Plan the trip",
    originsLabel: "Where is everyone flying from?",
    originsHint: "2–8 home airports, one traveler each",
    originPlaceholder: "Search city or airport…",
    originSelectedPlaceholder: "Pick an airport",
    addOrigin: "Add traveler",
    removeOrigin: "Remove",
    maxOriginsReached: "Maximum 8 travelers",
    minOriginsHint: "At least 2 travelers",
    locationButton: "Use my location",
    locationLocating: "Detecting your location…",
    locationFailed: "Couldn't detect your location — pick your airport manually",
    locationNoEmptyRow: "All traveler slots are already filled",
    autocomplete: {
      searching: "Searching airports…",
      minChars: "Type at least 2 characters…",
      empty: "No airports found.",
    },
    datesLabel: "Trip dates",
    datesPlaceholder: "Select departure & return",
    datesHint: "Departure → return — the number of nights is derived automatically",
    flexLabel: "Departure flexibility",
    flexDays: (days: number) =>
      days === 0 ? "±0 days (exact date)" : `±${days} day${days === 1 ? "" : "s"}`,
    monthMode: "Whole month",
    monthLabel: "Month",
    monthHint: "We scan the whole month and automatically pick the cheapest 14-day stretch",
    nightsLabel: "Nights",
    nightsHint: "1–30",
    nightsLabelMonth: "Nights (your choice)",
    nightsAutoHint: "Derived automatically from your trip dates",
    monthSampling: (month: string) => `picking the cheapest 14 days of ${month}…`,
    fewerNights: "Fewer nights",
    moreNights: "More nights",
    budgetLabel: "Budget per person",
    budgetHint: "Covers outbound + return flight, in EUR",
    maxFlightLabel: "Max flight time (optional)",
    maxFlightAny: "Any duration",
    maxFlightHours: (h: number) => `Up to ${h} h`,
    submit: "Find middle spots",
    submitting: "Starting search…",
    errors: {
      originsRequired: "Pick at least 2 home airports",
      originsUnique: "Each traveler needs a different home airport",
      datesRequired: "Select departure and return dates",
      nightsRequired: "Choose how many nights (1–30)",
      budgetRequired: "Budget must be between €20 and €5,000 per person",
      validationFailed: "Please check the form — some fields are invalid",
      rateLimited: (retryAfterSeconds?: number) =>
        `Too many searches — please wait${retryAfterSeconds ? ` ${retryAfterSeconds}s` : " a moment"} and try again`,
      generic: "Something went wrong. Please try again.",
      network: "Could not reach the server. Check your connection and retry.",
    },
  },
  waiting: {
    title: "Finding your middle…",
    subtitle:
      "We're scanning flights from every home airport to candidate destinations. This usually takes under a minute.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Step ${done} of ${total}` : "Warming up…",
    partialTitle: "Found so far",
    cancel: "Cancel search",
    cancelling: "Cancelling…",
    cancelDialogTitle: "Cancel this search?",
    cancelDialogBody:
      "The search will stop, but any destinations already found stay visible below.",
    cancelDialogConfirm: "Yes, cancel",
    cancelDialogDismiss: "Keep searching",
  },
  history: {
    title: "Recent searches",
    clear: "Clear",
    chipAria: (label: string) => `Open search: ${label}`,
  },
  results: {
    title: "Your middle spots",
    subtitle: "Ranked by how close together everyone arrives, then by total price.",
    empty: "No destinations matched your budget and arrival-gap limit yet.",
    gapBadge: (text: string) => `Everyone arrives within ${text}`,
    gapRelaxed: (hours: number) =>
      `No matches within the standard 24 h — the arrival gap was widened to ${hours} h`,
    outbound: (date: string) => `Outbound · ${date}`,
    returnLeg: (date: string) => `Return · ${date}`,
    perPersonTotal: "per person",
    groupTotal: "Total for the group",
    bookOutbound: "Book outbound",
    bookReturn: "Book return",
    stay: (city: string) => `Stay in ${city}`,
    stayNote: "Affiliate link",
    priceNote: "Prices are from the moment of search — the booking site shows the live price.",
    share: "Copy share link",
    copied: "Share link copied!",
    copyFailed: "Could not copy — select the URL manually",
    shareCard: "Download share card",
    shareCardDownloaded: "Share card downloaded — check your downloads!",
    shareCardFailed: "Could not create the share card — please try again",
    invite: "Copy invite",
    inviteCopied: "Invitation copied — paste it to your group chat!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }: InviteArgs) =>
      `Let's meet in ${city} (${country}), ${dep} → ${ret}! We found flights that land everyone within ${gap} of each other: ${url}`,
    cancelledBanner: "Search cancelled — showing the destinations found so far.",
    failedTitle: "The search failed",
    failedRetry: "Start a new search from the home page",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} night${n === 1 ? "" : "s"}`,
    usageLimited: "Monthly search limit reached — showing cached results only.",
    map: {
      title: "Map",
      origins: "Home airports",
      destinations: "Destinations",
      airports: "All candidate airports",
      tooltip: {
        gap: (text: string) => `arrivals within ${text}`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Total for the group",
        perPerson: "per person",
      },
    },
    toolbar: {
      sortLabel: "Sort by",
      sortGap: "Closest arrivals",
      sortPrice: "Lowest price",
      sortDestination: "Destination A–Z",
      gapLabel: "Max arrival gap",
      gapAny: "Any",
      gapHours: (h: number) => `≤ ${h} h`,
      priceLabel: "Max price / person",
      priceAny: "Any",
      showing: (shown: number, total: number) => `${shown} of ${total} shown`,
    },
    timeline: {
      title: "Arrival spread",
      arriveWithin: (text: string) => `arrive within ${text}`,
    },
    relax: {
      title: "No matches yet",
      body: "Widen the search and run it again — repeat searches reuse cached flight prices.",
      gap30: "Relax gap to 30 h",
      budget50: "+€50 budget",
      days3: "+3 days window",
      running: "Starting new search…",
    },
  },
  hero: {
    title: (city: string, country: string) => `Best middle for you: ${city}, ${country}`,
    gap: (text: string) => `everyone arrives within ${text}`,
    from: (price: string) => `from ${price} / person`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "See this option",
  },
  surprise: {
    button: "Surprise me",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ${gap} apart, ${total}`,
  },
  popular: {
    title: "Popular middle spots",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "No popular spots yet",
  },
  ads: {
    label: "Sponsored",
  },
  share: {
    pageTitle: "midspot search",
    loading: "Loading search…",
    notFoundTitle: "This search link is not available",
    notFoundBody:
      "It may have expired (searches are kept for 7 days) or the link is wrong.",
    backHome: "Back to midspot",
    errorPrefix: "Search error: ",
  },
  notFound: {
    title: "Page not found",
    body: "The page you're looking for doesn't exist or has moved.",
    backHome: "Back to midspot",
  },
  common: {
    loading: "Loading…",
  },
  consent: {
    title: "Cookies",
    body: "We use essential cookies to remember your language and your choice here. Advertising cookies (EthicalAds / CarbonAds) load only if you choose “Accept all”.",
    acceptAll: "Accept all",
    essentialOnly: "Essential only",
  },
  footer: {
    privacy: "Privacy",
    terms: "Terms",
    cookieSettings: "Cookie settings",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Language",
  },
  legal: {
    privacy: {
      title: "Privacy policy",
      updated: "Last updated: 2026-11-07",
      intro:
        "midspot (“we”, “us”) is a free flight-search helper that finds “middle” destinations for groups of travelers. This policy explains what we store, which cookies we use, which third parties are involved, and which rights you have under the GDPR.",
      sections: [
        {
          heading: "1. What we store",
          body: [
            "The search parameters you enter (home airports, departure window, nights, budget) are stored together with your search so that the share link (/r/…) keeps working. Searches and results are automatically deleted after 7 days.",
            "For abuse protection we store only a salted SHA-256 hash of your IP address (searches.ip_hash). We never store raw IP addresses.",
            "We do not create accounts and we never ask for your name, email address or payment details.",
          ],
        },
        {
          heading: "2. Cookies and local storage",
          body: [
            "midspot-lang — your chosen language. Essential, always active.",
            "midspot-consent — your cookie choice (“all” or “essential”), kept in localStorage. Essential, always active.",
            "Advertising cookies from EthicalAds / CarbonAds are set only after you press “Accept all” on the consent banner. With “Essential only”, no ad scripts are loaded at all.",
          ],
        },
        {
          heading: "3. Third parties",
          body: [
            "Travelpayouts Drive: the Drive loader script is always present in the page <head> because Travelpayouts' own onboarding verification requires it (their site fetches our HTML and looks for it). Its data-cmp-ab attribute lets Travelpayouts' consent manager handle their cookies. It is used for automatic affiliate-link tagging of booking links.",
            "Ad networks (EthicalAds primary, CarbonAds fallback): loaded only with consent “all”.",
            "Travelpayouts “whereami”: only when you click “Use my location”, your IP is sent once to Travelpayouts to resolve the nearest airport (IATA code, city, country). We never store the IP; we keep only the airport/city/country in the form.",
            "Flight-data providers (e.g. Kiwi/Tequila via Travelpayouts, Duffel, SerpApi) receive only search parameters (IATA codes, dates, budget) — never your IP.",
          ],
        },
        {
          heading: "4. Affiliate links and booking",
          body: [
            "“Book” buttons open partner sites (e.g. Kiwi.com) through Travelpayouts affiliate links. The price for you is exactly the same; the commission is paid to us by the partner. The booking itself happens on the partner's website under their own terms and privacy policy — we never sell tickets and never process payments.",
          ],
        },
        {
          heading: "5. Retention",
          body: [
            "Searches and results are kept for 7 days (SEARCH_RETENTION_DAYS) and then deleted automatically. Cached flight prices are kept for 30 minutes. Airport reference data is kept for 30 days.",
          ],
        },
        {
          heading: "6. Your rights (GDPR)",
          body: [
            "You have the right of access, rectification, erasure, restriction of processing, data portability and the right to object, as well as the right to lodge a complaint with your supervisory authority (in Romania: ANSPDCP).",
            "To exercise any of these rights, just email us — we answer within 30 days.",
          ],
        },
        {
          heading: "7. Contact",
          body: ["privacy@midspot.ncmihai.dev — for any privacy question or request."],
        },
      ],
    },
    terms: {
      title: "Terms of service",
      updated: "Last updated: 2026-11-07",
      intro:
        "By using midspot you agree to these terms. midspot is a free helper that finds “middle” destinations for groups of travelers. It does not sell flights and is not a party to any booking.",
      sections: [
        {
          heading: "1. The service",
          body: [
            "midspot searches public flight data and suggests destinations where a group can meet, ranked by arrival gap and then by price. Results are indicative suggestions, not offers.",
          ],
        },
        {
          heading: "2. Prices are indicative",
          body: [
            "Prices shown are from the moment of the search and can change at any time. The binding price is always the live one shown on the booking site when you click through.",
          ],
        },
        {
          heading: "3. Booking happens on partner sites",
          body: [
            "Clicking a “Book” button opens a partner site (e.g. Kiwi.com) via a Travelpayouts affiliate link. The contract of carriage is between you and that partner; their terms and privacy policy apply. We are not a party to it and never handle your payment.",
          ],
        },
        {
          heading: "4. No warranty",
          body: [
            "The service is provided “as is” and “as available”. We do not warrant that searches always succeed, that prices or times are exact, or that the service is uninterrupted. Flight data comes from third-party providers and may be incomplete or outdated.",
          ],
        },
        {
          heading: "5. Limitation of liability",
          body: [
            "To the maximum extent permitted by law, midspot and its operator are not liable for indirect, incidental or consequential damages, lost profits, or decisions made based on the results. Nothing in these terms limits liability that cannot be limited by law (e.g. for gross negligence or wilful misconduct).",
          ],
        },
        {
          heading: "6. Fair use",
          body: [
            "Automated or excessive use is rate-limited (e.g. max 5 searches per minute per IP address). Share links are unguessable by design — please do not try to enumerate them.",
          ],
        },
        {
          heading: "7. Changes and contact",
          body: [
            "We may update these terms from time to time; the “last updated” date above changes accordingly. Questions: legal@midspot.ncmihai.dev.",
          ],
        },
      ],
    },
  },
};

export type Messages = typeof en;

/**
 * Shape every language file must satisfy. `legal` (long-form pages) may be omitted —
 * languages without it fall back to English at render time.
 */
export type LangMessages = Omit<Messages, "legal"> & { legal?: LegalContent };
