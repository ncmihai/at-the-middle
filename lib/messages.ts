// All user-facing English copy in one module — swap this file for Romanian later
// without touching components (docs/app-spec.md §6.5).

export const messages = {
  brand: {
    name: "midspot",
    heroTitle: "Meet in the middle",
    heroSubtitle:
      "One destination, everyone flies from home, and everyone arrives within a day of each other — inside your budget.",
    heroPoints: [
      "2–8 travelers, each from their own city",
      "Any departure window of up to 14 days",
      "Ranked by arrival gap, then by price",
    ] as string[],
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
    datesLabel: "Departure window",
    datesPlaceholder: "Select departure window",
    datesHint: "Up to 14 departure days — the return is departure + nights",
    nightsLabel: "Nights",
    nightsHint: "1–30",
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
      datesRequired: "Select a departure window",
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
    priceNote: "Prices are from the moment of search — the booking site shows the live price.",
    share: "Copy share link",
    copied: "Share link copied!",
    copyFailed: "Could not copy — select the URL manually",
    cancelledBanner: "Search cancelled — showing the destinations found so far.",
    failedTitle: "The search failed",
    failedRetry: "Start a new search from the home page",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} night${n === 1 ? "" : "s"}`,
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
} as const;

export type Messages = typeof messages;
