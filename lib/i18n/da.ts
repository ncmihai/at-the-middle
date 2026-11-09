// Dansk — samme nøgglestruktur som en.ts (kilden). De juridiske sider
// (privacy/terms) forbliver på engelsk (fallback), indtil de oversættes.
import type { InviteArgs, LangMessages } from "./en";

export const da: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Mød hinanden i midten",
    heroSubtitle:
      "Alle flyver hjemmefra, og I mødes på en tredje destination — inden for få timer af hinanden, ikke dage. Rangeret efter ankomstforskel først, derefter efter pris, inden for jeres budget.",
    heroPoints: [
      "2–8 rejsende, hver flyver fra sin egen by",
      "I mødes på destinationen — ikke hjemme hos hinanden",
      "Ankomstforskel først (maks. 24 t), derefter pris",
      "Fleksible rejsedatoer — eller vælg en hel måned",
    ],
    heroExample:
      "Eksempel: du flyver fra Bukarest, en ven fra Berlin → I mødes i Barcelona, med 2 timers forskel på ankomsten — ikke 3 dage.",
  },
  form: {
    title: "Planlæg rejsen",
    originsLabel: "Hvor flyver alle fra?",
    originsHint: "2–8 hjemlufthavne, én rejsende hver",
    originPlaceholder: "Søg by eller lufthavn…",
    originSelectedPlaceholder: "Vælg en lufthavn",
    addOrigin: "Tilføj rejsende",
    removeOrigin: "Fjern",
    maxOriginsReached: "Maksimum 8 rejsende",
    minOriginsHint: "Minimum 2 rejsende",
    locationButton: "Brug min placering",
    locationLocating: "Finder din placering…",
    locationFailed: "Kunne ikke finde din placering — vælg lufthavn manuelt",
    locationNoEmptyRow: "Alle rejsende-pladser er allerede udfyldt",
    autocomplete: {
      searching: "Søger lufthavne…",
      minChars: "Skriv mindst 2 tegn…",
      empty: "Ingen lufthavne fundet.",
    },
    datesLabel: "Rejsedatoer",
    datesPlaceholder: "Vælg afgang & retur",
    datesHint: "Afgang → retur — antallet nætter beregnes automatisk",
    flexLabel: "Fleksibilitet ved afgang",
    flexDays: (days: number) =>
      days === 0 ? "±0 dage (præcis dato)" : `±${days} ${days === 1 ? "dag" : "dage"}`,
    monthMode: "Hel måned",
    monthLabel: "Måned",
    monthHint: "Vi skanner hele måneden og vælger automatisk den billigste 14-dages periode",
    nightsLabel: "Nætter",
    nightsHint: "1–30",
    nightsLabelMonth: "Nætter (dit valg)",
    nightsAutoHint: "Beregnes automatisk ud fra dine rejsedatoer",
    monthSampling: (month: string) => `vælger de billigste 14 dage i ${month}…`,
    fewerNights: "Færre nætter",
    moreNights: "Flere nætter",
    budgetLabel: "Budget pr. person",
    budgetHint: (cur: string) => `Dækker ud- og hjemrejse, i ${cur}`,
    maxFlightLabel: "Maks. flyvetid (valgfrit)",
    maxFlightAny: "Valgfri varighed",
    maxFlightHours: (h: number) => `Op til ${h} t`,
    submit: "Find midterpunkter",
    submitting: "Starter søgning…",
    errors: {
      originsRequired: "Vælg mindst 2 hjemlufthavne",
      originsUnique: "Hver rejsende skal have en anden hjemlufthavn",
      datesRequired: "Vælg afgangs- og returdatoer",
      nightsRequired: "Vælg antal nætter (1–30)",
      budgetRequired: (min: string, max: string) =>
        `Budgettet skal være mellem ${min} og ${max} pr. person`,
      validationFailed: "Tjek formularen — nogle felter er ugyldige",
      rateLimited: (retryAfterSeconds?: number) =>
        `For mange søgninger — vent${retryAfterSeconds ? ` ${retryAfterSeconds} sek` : " et øjeblik"} og prøv igen`,
      generic: "Noget gik galt. Prøv igen.",
      network: "Kunne ikke nå serveren. Tjek din forbindelse, og prøv igen.",
    },
  },
  waiting: {
    title: "Finder din midte…",
    subtitle:
      "Vi skanner fly fra hver hjemlufthavn til kandidatdestinationer. Det tager som regel under et minut.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Trin ${done} af ${total}` : "Varmere op…",
    partialTitle: "Fundet indtil videre",
    cancel: "Annuller søgning",
    cancelling: "Annullerer…",
    cancelDialogTitle: "Annuller denne søgning?",
    cancelDialogBody:
      "Søgningen stopper, men destinationer, der allerede er fundet, forbliver synlige nedenfor.",
    cancelDialogConfirm: "Ja, annuller",
    cancelDialogDismiss: "Fortsæt søgning",
  },
  history: {
    title: "Seneste søgninger",
    clear: "Ryd",
    chipAria: (label: string) => `Åbn søgning: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    title: "Dine midterpunkter",
    subtitle: "Rangeret efter, hvor tæt alle ankommer på hinanden, derefter efter samlet pris.",
    empty: "Ingen destinationer matchede dit budget og din ankomstforskel endnu.",
    gapBadge: (text: string) => `Alle ankommer inden for ${text}`,
    gapRelaxed: (hours: number) =>
      `Ingen match inden for de standard 24 t — ankomstforskellen blev udvidet til ${hours} t`,
    outbound: (date: string) => `Ud · ${date}`,
    returnLeg: (date: string) => `Retur · ${date}`,
    perPersonTotal: "pr. person",
    groupTotal: "I alt for gruppen",
    bookOutbound: "Book udrejse",
    bookReturn: "Book retur",
    stay: (city: string) => `Overnat i ${city}`,
    stayNote: "Affiliatelink",
    // ADDITIVE (Faza 7): labels for the per-result affiliate "extras" buttons
    extras: {
      title: "Ekstra",
      transfer: "Lufthavnstransfer",
      car: "Biludlejning",
      esim: "eSIM",
      activities: "Aktiviteter",
    },
    priceNote: "Priserne er fra søgetidspunktet — bookningssiden viser den aktuelle pris.",
    share: "Kopiér delingslink",
    copied: "Delingslink kopieret!",
    copyFailed: "Kunne ikke kopiere — vælg URL'en manuelt",
    shareCard: "Download delingskort",
    shareCardDownloaded: "Delingskort downloadet — tjek dine downloads!",
    shareCardFailed: "Kunne ikke oprette delingskortet — prøv igen",
    invite: "Kopiér invitation",
    inviteCopied: "Invitation kopieret — indsæt den i jeres gruppechat!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }: InviteArgs) =>
      `Lad os mødes i ${city} (${country}), ${dep} → ${ret}! Vi fandt fly, der lander alle inden for ${gap} af hinanden: ${url}`,
    cancelledBanner: "Søgning annulleret — viser de destinationer, der er fundet indtil videre.",
    failedTitle: "Søgningen mislykkedes",
    failedRetry: "Start en ny søgning fra forsiden",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} ${n === 1 ? "nat" : "nætter"}`,
    usageLimited: "Den månedlige søgegrænse er nået — viser kun cachede resultater.",
    map: {
      title: "Kort",
      origins: "Hjemlufthavne",
      destinations: "Destinationer",
      airports: "Alle kandidatlufthavne",
      tooltip: {
        gap: (text: string) => `ankomster inden for ${text}`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "I alt for gruppen",
        perPerson: "pr. person",
      },
    },
    toolbar: {
      sortLabel: "Sortér efter",
      sortGap: "Tætteste ankomster",
      sortPrice: "Laveste pris",
      sortDestination: "Destination A–Å",
      gapLabel: "Maks. ankomstforskel",
      gapAny: "Alle",
      gapHours: (h: number) => `≤ ${h} t`,
      priceLabel: "Maks. pris / person",
      priceAny: "Alle",
      showing: (shown: number, total: number) => `${shown} af ${total} vist`,
    },
    timeline: {
      title: "Ankomstspredning",
      arriveWithin: (text: string) => `ankommer inden for ${text}`,
    },
    relax: {
      title: "Ingen match endnu",
      body: "Udvid søgningen og kør den igen — gentagne søgninger genbruger cachede flypriser.",
      gap30: "Lemp forskel til 30 t",
      budget50: (amount: string) => `+${amount} budget`,
      days3: "+3 dages vindue",
      running: "Starter ny søgning…",
    },
  },
  // ADDITIVE (Faza 8B): destinationsvejr (open-meteo) — stribe på resultatkort + widget på /destinations
  weather: {
    title: (city: string) => `Vejret i ${city} — næste 7 dage`,
    rain: (pct: number) => `regn ${pct} %`,
    source: "Prognose: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "Klar himmel",
      partlyCloudy: "Delvist skyet",
      cloudy: "Overskyet",
      fog: "Tåge",
      rain: "Regn",
      snow: "Sne",
      showers: "Byger",
      thunderstorm: "Tordenvejr",
    },
  },
  hero: {
    title: (city: string, country: string) => `Bedste midte for dig: ${city}, ${country}`,
    gap: (text: string) => `alle ankommer inden for ${text}`,
    from: (price: string) => `fra ${price} / person`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "Se denne mulighed",
  },
  surprise: {
    button: "Overrask mig",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ${gap} fra hinanden, ${total}`,
  },
  popular: {
    title: "Populære midterpunkter",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Ingen populære steder endnu",
  },
  ads: {
    label: "Sponsoreret",
  },
  share: {
    pageTitle: "midspot-søgning",
    loading: "Indlæser søgning…",
    notFoundTitle: "Dette søgelink er ikke tilgængeligt",
    notFoundBody:
      "Det kan være udløbet (søgninger gemmes i 7 dage), eller også er linket forkert.",
    backHome: "Tilbage til midspot",
    errorPrefix: "Søgefejl: ",
  },
  notFound: {
    title: "Siden blev ikke fundet",
    body: "Siden, du leder efter, findes ikke eller er flyttet.",
    backHome: "Tilbage til midspot",
  },
  common: {
    loading: "Indlæser…",
  },
  consent: {
    title: "Cookies",
    body: "Vi bruger nødvendige cookies til at huske dit sprog og dit valg her. Annonceringscookies (EthicalAds / CarbonAds) indlæses kun, hvis du vælger ”Acceptér alle”.",
    acceptAll: "Acceptér alle",
    essentialOnly: "Kun nødvendige",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "Destinationer",
      indexDescription:
        "Gennemse de europæiske byer, som midspot kan søge som midte for din gruppe — rangeret efter, hvor ofte rejsende har valgt dem.",
      cityTitle: (city: string) => `Mød hinanden i ${city}`,
      cityDescription: (city: string, country: string) =>
        `Mød hinanden i ${city}, ${country} — se hvorfor det fungerer som midte for venner og familie, der flyver fra forskellige byer, og find så jeres eget midterpunkt.`,
    },
    index: {
      eyebrow: "Destinationer",
      title: "Hvor skal jeres gruppe mødes?",
      subtitle:
        "Hver by nedenfor er en destination, som midspot kan søge som mulig midte for 2–8 rejsende, der flyver fra forskellige hjemlufthavne. Vælg én for at se, hvorfor den fungerer — eller gå tilbage, og lad søgningen finde jeres midte.",
      searchPlaceholder: "Søg by, land eller lufthavnskode…",
      empty: "Ingen destinationer matcher din søgning.",
      showing: (shown: number, total: number) => `Viser ${shown} af ${total} destinationer`,
      airports: (codes: string) => `Lufthavne: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Ikke valgt som midte endnu"
          : count === 1
            ? "Valgt én gang som midte"
            : `Valgt ${count}× som midte`,
    },
    city: {
      back: "Alle destinationer",
      pitch: (city: string) => `Mød hinanden i ${city} — midten, der fungerer for alle.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) er én af de destinationer, som midspot søger, når en gruppe venner eller familie vil mødes. Alle flyver fra deres egen hjemlufthavn; vi rangerer destinationer efter, hvor tæt alle ankommer, derefter efter pris — inden for jeres budget.`,
      airportsLabel: "Betjente lufthavne",
      statsLabel: "Gange valgt som midte (seneste 90 dage)",
      statsEmpty: "Ingen søgninger endnu — vær den første gruppe, der mødes her.",
      howTitle: "Sådan virker det",
      howSteps: [
        {
          title: "Tilføj alles hjemlufthavn",
          body: "2–8 rejsende, hver fra sin egen by — vi søger reelle flypriser fra dem alle.",
        },
        {
          title: "Angiv datoer, nætter og budget",
          body: "Fleksible datoer eller en hel måned; et budget pr. person, der dækker ud- og hjemrejse.",
        },
        {
          title: "Vi rangerer midterpunkterne",
          body: "Destinationer sorteres efter ankomstforskel (alle lander inden for 24 t af hinanden), derefter efter samlet pris.",
        },
      ],
      faqTitle: "Ofte stillede spørgsmål",
      // "{city}" erstattes med sidens by ved visning
      faqs: [
        {
          q: "Hvorfor er {city} et godt midterpunkt?",
          a: "{city} er nåbart med korte, hyppige fly fra hele Europa, så rejsende fra forskellige byer ankommer ofte inden for få timer af hinanden — til en lav samlet pris. Kør en søgning, og midspot rangerer det mod alle andre muligheder.",
        },
        {
          q: "Booker jeg fly gennem midspot?",
          a: "Nej. midspot finder og rangerer midten; bookingen sker på partnerens hjemmeside (f.eks. Kiwi.com) via et affiliatelink, til samme pris for dig.",
        },
        {
          q: "Er priserne ægte?",
          a: "Priserne kommer fra live flydata i søgeøjeblikket og kan ændre sig — bookningssiden viser altid den endelige pris.",
        },
      ],
      cta: "Find jeres midte",
    },
  },
  blog: {
    meta: {
      title: "Blog",
      description:
        "Historier og noter fra midspot-teamet — hvordan vi finder midten for grupper af rejsende, der flyver fra forskellige byer.",
    },
    title: "Historier fra midten",
    subtitle:
      "Noter om at mødes halvvejs: hvordan søgningen virker, hvor grupper rent faktisk har mødtes, og hvad vi lærer af live flydata.",
    latest: "Seneste historier",
    empty: "Ingen indlæg endnu — kom tilbage snart.",
    readingTime: (minutes: number) => `${minutes} min. læsning`,
    published: (date: string) => `Udgivet ${date}`,
    back: "Alle indlæg",
    prev: "Nyere indlæg",
    next: "Ældre indlæg",
    share: "Kopiér link",
    copied: "Link kopieret!",
    copyFailed: "Kunne ikke kopiere — vælg adressen manuelt",
    rss: "RSS-feed",
  },
  stats: {
    title: "Sidestatistik",
    subtitle: "midspots egen privatlivssikre analyse — kun aggregerede data, aldrig IP'er.",
    secretLabel: "Statistikhemmelighed",
    secretPlaceholder: "Indsæt statistikhemmeligheden",
    unlock: "Indlæs statistik",
    loading: "Indlæser…",
    unauthorized:
      "Forkert eller manglende hemmelighed (401). Hemmeligheden er aldrig indbygget i denne side — spørg sidens ejer.",
    error: "Kunne ikke indlæse statistikken.",
    retry: "Prøv igen",
    totals: { searches: "Søgninger", results: "Resultater", pageviews: "Sidevisninger" },
    searchesChart: "Søgninger pr. dag — seneste 30 dage",
    pageviewsChart: "Sidevisninger pr. dag — seneste 30 dage",
    popularRoutes: "Populære udgangspunkt-par — seneste 30 dage",
    providerUsage: "Udbyderbrug — aktuel måned",
    table: {
      day: "Dag",
      count: "Antal",
      total: "I alt",
      route: "Rute",
      searches: "Søgninger",
      provider: "Udbyder",
      calls: "Kald",
      cap: "Månedligt loft",
      pctUsed: "% af loft",
    },
    noData: "Ingen data endnu.",
    cloudflareNote:
      "Cloudflare-panelet viser også edge-trafik (alle anmodninger, der rammer CDN'ens kant, inklusive bots og cachede ressourcer) — denne side viser kun det, som midspot selv leverer og gemmer i sin egen database.",
  },
  footer: {
    destinations: "Destinationer",
    blog: "Blog",
    privacy: "Privatliv",
    terms: "Vilkår",
    cookieSettings: "Cookieindstillinger",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Sprog",
  },
  currency: {
    label: "Valuta",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · ECB-kurs fra ${date}`,
  },
  theme: {
    label: "Tema",
    light: "Lyst",
    dark: "Mørkt",
    system: "System",
  },
};
