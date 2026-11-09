// Nederlands — dezelfde sleutelsstructuur als en.ts (bron van waarheid). De juridische
// pagina's (privacy/terms) zijn hier niet vertaald; die vallen terug op het Engels.
import type { LangMessages } from "./en";

export const nl: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Ontmoet elkaar in het midden",
    heroSubtitle:
      "Iedereen vliegt vanaf huis en jullie ontmoeten elkaar op een derde bestemming — binnen uren van elkaar, niet dagen. Gesorteerd op aankomstverschil eerst, dan op prijs, binnen je budget.",
    heroPoints: [
      "2–8 reizigers, ieder vliegend vanaf de eigen stad",
      "Jullie ontmoeten elkaar op de bestemming — niet bij elkaar thuis",
      "Aankomstverschil eerst (max. 24 u), dan prijs",
      "Flexibele reisdata — of kies een hele maand",
    ],
    heroExample:
      "Voorbeeld: jij vliegt vanaf Boekarest, een vriend vanaf Berlijn → jullie ontmoeten elkaar in Barcelona, met 2 uur verschil in aankomst — niet 3 dagen.",
  },
  form: {
    title: "Plan de reis",
    originsLabel: "Waar vliegt iedereen vandaan?",
    originsHint: "2–8 thuisluchthavens, één reiziger per haven",
    originPlaceholder: "Zoek stad of luchthaven…",
    originSelectedPlaceholder: "Kies een luchthaven",
    addOrigin: "Reiziger toevoegen",
    removeOrigin: "Verwijderen",
    maxOriginsReached: "Maximaal 8 reizigers",
    minOriginsHint: "Minstens 2 reizigers",
    locationButton: "Gebruik mijn locatie",
    locationLocating: "Je locatie wordt gedetecteerd…",
    locationFailed: "Kon je locatie niet detecteren — kies je luchthaven handmatig",
    locationNoEmptyRow: "Alle reizigersplekken zijn al ingevuld",
    autocomplete: {
      searching: "Luchthavens zoeken…",
      minChars: "Typ minstens 2 tekens…",
      empty: "Geen luchthavens gevonden.",
    },
    datesLabel: "Reisdata",
    datesPlaceholder: "Selecteer vertrek & terugkeer",
    datesHint: "Vertrek → terugkeer — het aantal nachten wordt automatisch bepaald",
    flexLabel: "Flexibiliteit vertrek",
    flexDays: (days: number) =>
      days === 0 ? "±0 dagen (exacte datum)" : `±${days} dag${days === 1 ? "" : "en"}`,
    monthMode: "Hele maand",
    monthLabel: "Maand",
    monthHint: "We scannen de hele maand en kiezen automatisch het goedkoopste stuk van 14 dagen",
    nightsLabel: "Nachten",
    nightsHint: "1–30",
    nightsLabelMonth: "Nachten (zelf te kiezen)",
    nightsAutoHint: "Automatisch afgeleid van je reisdata",
    monthSampling: (month: string) => `het goedkoopste stuk van 14 dagen van ${month} wordt gekozen…`,
    fewerNights: "Minder nachten",
    moreNights: "Meer nachten",
    budgetLabel: "Budget per persoon",
    budgetHint: (cur: string) => `Dekt de vlucht heen + terug, in ${cur}`,
    maxFlightLabel: "Maximale vliegtijd (optioneel)",
    maxFlightAny: "Elke duur",
    maxFlightHours: (h: number) => `Tot ${h} u`,
    submit: "Vind middenplekken",
    submitting: "Zoeken gestart…",
    errors: {
      originsRequired: "Kies minstens 2 thuisluchthavens",
      originsUnique: "Elke reiziger heeft een andere thuisluchthaven nodig",
      datesRequired: "Selecteer vertrek- en terugdata",
      nightsRequired: "Kies het aantal nachten (1–30)",
      budgetRequired: (min: string, max: string) =>
        `Het budget moet tussen ${min} en ${max} per persoon liggen`,
      validationFailed: "Controleer het formulier — sommige velden zijn ongeldig",
      rateLimited: (retryAfterSeconds?: number) =>
        `Te veel zoekopdrachten — wacht${retryAfterSeconds ? ` ${retryAfterSeconds} s` : " even"} en probeer het opnieuw`,
      generic: "Er is iets misgegaan. Probeer het opnieuw.",
      network: "De server is onbereikbaar. Controleer je verbinding en probeer het opnieuw.",
    },
  },
  waiting: {
    title: "We zoeken jullie midden…",
    subtitle:
      "We scannen vluchten vanaf elke thuisluchthaven naar kandidaatbestemmingen. Dit duurt meestal korter dan een minuut.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Stap ${done} van ${total}` : "Opwarmen…",
    partialTitle: "Tot nu toe gevonden",
    cancel: "Zoekopdracht annuleren",
    cancelling: "Annuleren…",
    cancelDialogTitle: "Deze zoekopdracht annuleren?",
    cancelDialogBody:
      "De zoekopdracht stopt, maar alle al gevonden bestemmingen blijven hieronder zichtbaar.",
    cancelDialogConfirm: "Ja, annuleren",
    cancelDialogDismiss: "Doorgaan met zoeken",
  },
  history: {
    title: "Recente zoekopdrachten",
    clear: "Wissen",
    chipAria: (label: string) => `Zoekopdracht openen: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    title: "Jouw middenplekken",
    subtitle: "Gesorteerd op hoe dicht bij elkaar iedereen aankomt, daarna op totale prijs.",
    empty: "Nog geen bestemmingen die voldoen aan je budget en aan de grens voor het aankomstverschil.",
    gapBadge: (text: string) => `Iedereen komt binnen ${text} aan`,
    gapRelaxed: (hours: number) =>
      `Geen matches binnen de standaard 24 u — het aankomstverschil is verruimd naar ${hours} u`,
    outbound: (date: string) => `Heen · ${date}`,
    returnLeg: (date: string) => `Terug · ${date}`,
    perPersonTotal: "per persoon",
    groupTotal: "Totaal voor de groep",
    bookOutbound: "Boek heenreis",
    bookReturn: "Boek terugreis",
    stay: (city: string) => `Verblijf in ${city}`,
    stayNote: "Affiliate-link",
    extras: {
      title: "Extra's",
      transfer: "Luchthaventransfer",
      car: "Huurauto",
      esim: "eSIM",
      activities: "Activiteiten",
    },
    priceNote: "Prijzen zijn van het moment van de zoekopdracht — de boekingssite toont de live prijs.",
    share: "Kopieer de deel-link",
    copied: "Deel-link gekopieerd!",
    copyFailed: "Kopiëren mislukt — selecteer de URL handmatig",
    shareCard: "Deelkaart downloaden",
    shareCardDownloaded: "Deelkaart gedownload — check je downloads!",
    shareCardFailed: "De deelkaart kon niet worden aangemaakt — probeer het opnieuw",
    invite: "Kopieer de uitnodiging",
    inviteCopied: "Uitnodiging gekopieerd — plak deze in de groepschat!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `Laten we afspreken in ${city} (${country}), ${dep} → ${ret}! We vonden vluchten waarmee iedereen binnen ${gap} van elkaar landt: ${url}`,
    cancelledBanner: "Zoekopdracht geannuleerd — we tonen de tot nu toe gevonden bestemmingen.",
    failedTitle: "De zoekopdracht is mislukt",
    failedRetry: "Start een nieuwe zoekopdracht vanaf de homepage",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} nacht${n === 1 ? "" : "en"}`,
    usageLimited: "Maandelijkse zoeklimiet bereikt — alleen gecachte resultaten worden getoond.",
    map: {
      title: "Kaart",
      origins: "Thuisluchthavens",
      destinations: "Bestemmingen",
      airports: "Alle kandidaatluchthavens",
      tooltip: {
        gap: (text: string) => `aankomsten binnen ${text}`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Totaal voor de groep",
        perPerson: "per persoon",
      },
    },
    toolbar: {
      sortLabel: "Sorteer op",
      sortGap: "Dichtstbijzijnde aankomsten",
      sortPrice: "Laagste prijs",
      sortDestination: "Bestemming A–Z",
      gapLabel: "Max. aankomstverschil",
      gapAny: "Geen limiet",
      gapHours: (h: number) => `≤ ${h} u`,
      priceLabel: "Max. prijs / persoon",
      priceAny: "Geen limiet",
      showing: (shown: number, total: number) => `${shown} van ${total} getoond`,
    },
    timeline: {
      title: "Spreiding van aankomsten",
      arriveWithin: (text: string) => `komen binnen ${text} aan`,
    },
    relax: {
      title: "Nog geen matches",
      body: "Verbreed de zoekopdracht en voer deze opnieuw uit — herhaalde zoekopdrachten hergebruiken gecachte vluchtprijzen.",
      gap30: "Aankomstverschil verruimen naar 30 u",
      budget50: (amount: string) => `+${amount} budget`,
      days3: "+3 dagen venster",
      running: "Nieuwe zoekopdracht gestart…",
    },
  },
  weather: {
    title: (city: string) => `Weer in ${city} — komende 7 dagen`,
    rain: (pct: number) => `regen ${pct}%`,
    source: "Voorspelling: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "Onbewolkt",
      partlyCloudy: "Gedeeltelijk bewolkt",
      cloudy: "Bewolkt",
      fog: "Mist",
      rain: "Regen",
      snow: "Sneeuw",
      showers: "Buien",
      thunderstorm: "Onweer",
    },
  },
  hero: {
    title: (city: string, country: string) => `Beste midden voor jullie: ${city}, ${country}`,
    gap: (text: string) => `iedereen komt binnen ${text} aan`,
    from: (price: string) => `vanaf ${price} / persoon`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "Bekijk deze optie",
  },
  surprise: {
    button: "Verras me",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ${gap} uit elkaar, ${total}`,
  },
  popular: {
    title: "Populaire middenplekken",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Nog geen populaire plekken",
  },
  ads: {
    label: "Gesponsord",
  },
  share: {
    pageTitle: "midspot-zoekopdracht",
    loading: "Zoekopdracht laden…",
    notFoundTitle: "Deze zoeklink is niet beschikbaar",
    notFoundBody:
      "Hij kan verlopen zijn (zoekopdrachten worden 7 dagen bewaard) of de link is verkeerd.",
    backHome: "Terug naar midspot",
    errorPrefix: "Zoekfout: ",
  },
  notFound: {
    title: "Pagina niet gevonden",
    body: "De pagina die je zoekt bestaat niet of is verplaatst.",
    backHome: "Terug naar midspot",
  },
  common: {
    loading: "Laden…",
  },
  consent: {
    title: "Cookies",
    body: "We gebruiken essentiële cookies om je taal en je keuze hier te onthouden. Advertentiecookies (EthicalAds / CarbonAds) worden alleen geladen als je “Alles accepteren” kiest.",
    acceptAll: "Alles accepteren",
    essentialOnly: "Alleen essentieel",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "Bestemmingen",
      indexDescription:
        "Blader door de Europese steden die midspot kan doorzoeken als midden voor je groep — gerangschikt op hoe vaak reizigers ze hebben gekozen.",
      cityTitle: (city: string) => `Ontmoet in ${city}`,
      cityDescription: (city: string, country: string) =>
        `Ontmoet in ${city}, ${country} — zie waarom het werkt als midden voor vrienden en familie die vanaf verschillende steden vliegen, en vind daarna je eigen middenplek.`,
    },
    index: {
      eyebrow: "Bestemmingen",
      title: "Waar moet je groep afspreken?",
      subtitle:
        "Elke stad hieronder is een bestemming die midspot kan doorzoeken als mogelijk midden voor 2–8 reizigers die vanaf verschillende thuisluchthavens vliegen. Kies er een om te zien waarom het werkt — of ga terug en laat de zoekopdracht je midden vinden.",
      searchPlaceholder: "Zoek stad, land of luchthavencode…",
      empty: "Geen bestemmingen komen overeen met je zoekopdracht.",
      showing: (shown: number, total: number) => `Toon ${shown} van ${total} bestemmingen`,
      airports: (codes: string) => `Luchthavens: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Nog niet als midden gekozen"
          : count === 1
            ? "Eén keer als midden gekozen"
            : `${count}× als midden gekozen`,
    },
    city: {
      back: "Alle bestemmingen",
      pitch: (city: string) => `Ontmoet in ${city} — het midden dat voor iedereen werkt.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) is een van de bestemmingen die midspot doorzoekt wanneer een groep vrienden of familie wil afspreken. Iedereen vliegt vanaf de eigen thuisluchthaven; we sorteren bestemmingen op hoe dicht bij elkaar iedereen aankomt, daarna op prijs — binnen je budget.`,
      airportsLabel: "Bedienende luchthavens",
      statsLabel: "Aantal keer als midden gekozen (laatste 90 dagen)",
      statsEmpty: "Nog geen zoekopdrachten — wees de eerste groep die hier afspreekt.",
      howTitle: "Hoe het werkt",
      howSteps: [
        {
          title: "Voeg ieders thuisluchthaven toe",
          body: "2–8 reizigers, ieder uit de eigen stad — we zoeken echte vluchtprijzen vanaf allemaal.",
        },
        {
          title: "Stel data, nachten en budget in",
          body: "Flexibele data of een hele maand; een budget per persoon dat heen + terug dekt.",
        },
        {
          title: "Wij rangschikken de middenplekken",
          body: "Bestemmingen worden gesorteerd op aankomstverschil (iedereen landt binnen 24 u van elkaar), daarna op totale prijs.",
        },
      ],
      faqTitle: "Veelgestelde vragen",
      // “{city}” wordt bij weergave vervangen door de stad van de pagina
      faqs: [
        {
          q: "Waarom is {city} een goed midden?",
          a: "{city} is bereikbaar met korte, frequente vluchten vanuit heel Europa, dus reizigers uit verschillende steden komen vaak binnen enkele uren van elkaar aan — tegen een lage totale prijs. Voer een zoekopdracht uit en midspot vergelijkt het met alle andere opties.",
        },
        {
          q: "Boek ik vluchten via midspot?",
          a: "Nee. midspot vindt en sorteert het midden; boeken doe je op de site van de partner (bijv. Kiwi.com) via een affiliate-link, tegen dezelfde prijs voor jou.",
        },
        {
          q: "Zijn de prijzen echt?",
          a: "Prijzen komen uit live vluchtdata op het moment van de zoekopdracht en kunnen wijzigen — de boekingssite toont altijd de definitieve prijs.",
        },
      ],
      cta: "Vind jouw midden",
    },
  },
  blog: {
    meta: {
      title: "Blog",
      description:
        "Verhalen en notities van het midspot-team — hoe we het midden vinden voor groepen reizigers die vanaf verschillende steden vliegen.",
    },
    title: "Verhalen uit het midden",
    subtitle:
      "Notities over halfweg afspreken: hoe de zoekopdracht werkt, waar groepen elkaar echt ontmoetten en wat we leren van live vluchtdata.",
    latest: "Laatste verhalen",
    empty: "Nog geen berichten — kom later terug.",
    readingTime: (minutes: number) => `${minutes} min leestijd`,
    published: (date: string) => `Gepubliceerd op ${date}`,
    back: "Alle berichten",
    prev: "Nieuwer bericht",
    next: "Ouder bericht",
    share: "Kopieer link",
    copied: "Link gekopieerd!",
    copyFailed: "Kopiëren mislukt — selecteer de URL handmatig",
    rss: "RSS-feed",
  },
  stats: {
    title: "Sitestatistieken",
    subtitle: "midspots eigen privacyvriendelijke analytics — alleen aggregaten, nooit IP-adressen.",
    secretLabel: "Statistieken-geheim",
    secretPlaceholder: "Plak het statistieken-geheim",
    unlock: "Statistieken laden",
    loading: "Laden…",
    unauthorized:
      "Verkeerd of ontbrekend geheim (401). Het geheim wordt nooit in deze pagina gebundeld — vraag het de site-eigenaar.",
    error: "Statistieken konden niet worden geladen.",
    retry: "Opnieuw proberen",
    totals: { searches: "Zoekopdrachten", results: "Resultaten", pageviews: "Pageviews" },
    searchesChart: "Zoekopdrachten per dag — laatste 30 dagen",
    pageviewsChart: "Pageviews per dag — laatste 30 dagen",
    popularRoutes: "Populaire vertrekparen — laatste 30 dagen",
    providerUsage: "Providergebruik — huidige maand",
    table: {
      day: "Dag",
      count: "Aantal",
      total: "Totaal",
      route: "Route",
      searches: "Zoekopdrachten",
      provider: "Provider",
      calls: "Calls",
      cap: "Maandelijks plafond",
      pctUsed: "% van plafond",
    },
    noData: "Nog geen data.",
    cloudflareNote:
      "Het Cloudflare-dashboard toont ook edge-verkeer (alle requests die de CDN-edge raken, inclusief bots en gecachte assets) — deze pagina toont alleen wat midspot zelf serveert en opslaat in de eigen database.",
  },
  footer: {
    destinations: "Bestemmingen",
    blog: "Blog",
    privacy: "Privacy",
    terms: "Voorwaarden",
    cookieSettings: "Cookie-instellingen",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Taal",
  },
  currency: {
    label: "Valuta",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · ECB-koers van ${date}`,
  },
  theme: {
    label: "Thema",
    light: "Licht",
    dark: "Donker",
    system: "Systeem",
  },
};
