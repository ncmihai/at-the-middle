// Svenska — samma nyckelstruktur som en.ts (källan). De juridiska sidorna
// (privacy/terms) ligger kvar på engelska (fallback) tills de översätts.
import type { InviteArgs, LangMessages } from "./en";

export const sv: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Mötas i mitten",
    heroSubtitle:
      "En destination, alla flyger hemifrån, och alla anländer inom en dag från varandra — inom din budget.",
    heroPoints: [
      "2–8 resenärer, var och en från sin egen stad",
      "Flexibla resedatum — eller välj en hel månad",
      "Rankade efter ankomstskillnad, sedan efter pris",
    ],
  },
  form: {
    title: "Planera resan",
    originsLabel: "Varifrån flyger alla?",
    originsHint: "2–8 hemflygplatser, en resenär vardera",
    originPlaceholder: "Sök stad eller flygplats…",
    originSelectedPlaceholder: "Välj en flygplats",
    addOrigin: "Lägg till resenär",
    removeOrigin: "Ta bort",
    maxOriginsReached: "Max 8 resenärer",
    minOriginsHint: "Minst 2 resenärer",
    locationButton: "Använd min plats",
    locationLocating: "Hittar din plats…",
    locationFailed: "Kunde inte hitta din plats — välj flygplats manuellt",
    locationNoEmptyRow: "Alla resenärsplatser är redan ifyllda",
    autocomplete: {
      searching: "Söker flygplatser…",
      minChars: "Skriv minst 2 tecken…",
      empty: "Inga flygplatser hittades.",
    },
    datesLabel: "Resedatum",
    datesPlaceholder: "Välj avresa & retur",
    datesHint: "Avresa → retur — antalet nätter beräknas automatiskt",
    flexLabel: "Flexibilitet för avresa",
    flexDays: (days: number) =>
      days === 0 ? "±0 dagar (exakt datum)" : `±${days} ${days === 1 ? "dag" : "dagar"}`,
    monthMode: "Hel månad",
    monthLabel: "Månad",
    monthHint: "Vi skannar hela månaden och väljer automatiskt den billigaste 14-dagarsperioden",
    nightsLabel: "Nätter",
    nightsHint: "1–30",
    nightsLabelMonth: "Nätter (ditt val)",
    nightsAutoHint: "Beräknas automatiskt från dina resedatum",
    monthSampling: (month: string) => `väljer de billigaste 14 dagarna i ${month}…`,
    fewerNights: "Färre nätter",
    moreNights: "Fler nätter",
    budgetLabel: "Budget per person",
    budgetHint: (cur: string) => `Täcker ut- + returflyg, i ${cur}`,
    maxFlightLabel: "Max flygtid (valfritt)",
    maxFlightAny: "Valfri längd",
    maxFlightHours: (h: number) => `Upp till ${h} h`,
    submit: "Hitta mittpunkter",
    submitting: "Startar sökning…",
    errors: {
      originsRequired: "Välj minst 2 hemflygplatser",
      originsUnique: "Varje resenär behöver en egen hemflygplats",
      datesRequired: "Välj avresa- och returdatum",
      nightsRequired: "Välj antal nätter (1–30)",
      budgetRequired: (min: string, max: string) =>
        `Budgeten måste vara mellan ${min} och ${max} per person`,
      validationFailed: "Kontrollera formuläret — några fält är ogiltiga",
      rateLimited: (retryAfterSeconds?: number) =>
        `För många sökningar — vänta${retryAfterSeconds ? ` ${retryAfterSeconds} s` : " en stund"} och försök igen`,
      generic: "Något gick fel. Försök igen.",
      network: "Kunde inte nå servern. Kontrollera anslutningen och försök igen.",
    },
  },
  waiting: {
    title: "Hittar din mitt…",
    subtitle:
      "Vi skannar flyg från varje hemflygplats till kandidatdestinationer. Det tar vanligtvis under en minut.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Steg ${done} av ${total}` : "Värmer upp…",
    partialTitle: "Hittade hittills",
    cancel: "Avbryt sökning",
    cancelling: "Avbryter…",
    cancelDialogTitle: "Avbryta sökningen?",
    cancelDialogBody:
      "Sökningen stoppas, men alla destinationer som redan hittats finns kvar nedan.",
    cancelDialogConfirm: "Ja, avbryt",
    cancelDialogDismiss: "Fortsätt söka",
  },
  history: {
    title: "Senaste sökningar",
    clear: "Rensa",
    chipAria: (label: string) => `Öppna sökning: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    title: "Dina mittpunkter",
    subtitle: "Rankade efter hur nära alla anländer varandra, sedan efter totalt pris.",
    empty: "Inga destinationer matchade din budget och ankomstskillnad ännu.",
    gapBadge: (text: string) => `Alla anländer inom ${text}`,
    gapRelaxed: (hours: number) =>
      `Inga träffar inom standardgränsen 24 h — ankomstskillnaden utökades till ${hours} h`,
    outbound: (date: string) => `Utresa · ${date}`,
    returnLeg: (date: string) => `Retur · ${date}`,
    perPersonTotal: "per person",
    groupTotal: "Totalt för gruppen",
    bookOutbound: "Boka utresa",
    bookReturn: "Boka retur",
    stay: (city: string) => `Bo i ${city}`,
    stayNote: "Affiliatelänk",
    // ADDITIVE (Faza 7): etiketter för affiliatelänkade "extra"-knappar per resultat
    extras: {
      title: "Tillägg",
      transfer: "Flygplatstransfer",
      car: "Hyrbil",
      esim: "eSIM",
      activities: "Aktiviteter",
    },
    priceNote: "Priserna är från söktillfället — bokningssidan visar aktuellt pris.",
    share: "Kopiera delningslänk",
    copied: "Delningslänk kopierad!",
    copyFailed: "Kunde inte kopiera — markera URL:en manuellt",
    shareCard: "Ladda ner delningskort",
    shareCardDownloaded: "Delningskort nedladdat — kolla dina nedladdningar!",
    shareCardFailed: "Kunde inte skapa delningskortet — försök igen",
    invite: "Kopiera inbjudan",
    inviteCopied: "Inbjudan kopierad — klistra in den i gruppchatten!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }: InviteArgs) =>
      `Vi ses i ${city} (${country}), ${dep} → ${ret}! Vi hittade flyg som får alla att anlända inom ${gap} från varandra: ${url}`,
    cancelledBanner: "Sökning avbruten — visar destinationerna som hittats hittills.",
    failedTitle: "Sökningen misslyckades",
    failedRetry: "Starta en ny sökning från startsidan",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} ${n === 1 ? "natt" : "nätter"}`,
    usageLimited: "Månadsgränsen för sökningar är nådd — visar bara cachade resultat.",
    map: {
      title: "Karta",
      origins: "Hemflygplatser",
      destinations: "Destinationer",
      airports: "Alla kandidatflygplatser",
      tooltip: {
        gap: (text: string) => `ankomster inom ${text}`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Totalt för gruppen",
        perPerson: "per person",
      },
    },
    toolbar: {
      sortLabel: "Sortera efter",
      sortGap: "Närmaste ankomster",
      sortPrice: "Lägsta pris",
      sortDestination: "Destination A–Ö",
      gapLabel: "Max ankomstskillnad",
      gapAny: "Valfri",
      gapHours: (h: number) => `≤ ${h} h`,
      priceLabel: "Max pris / person",
      priceAny: "Valfri",
      showing: (shown: number, total: number) => `${shown} av ${total} visade`,
    },
    timeline: {
      title: "Ankomstspridning",
      arriveWithin: (text: string) => `anländer inom ${text}`,
    },
    relax: {
      title: "Inga träffar än",
      body: "Vidga sökningen och kör den igen — upprepade sökningar återanvänder cachade flygpriser.",
      gap30: "Öka skillnaden till 30 h",
      budget50: (amount: string) => `+${amount} i budget`,
      days3: "+3 dagars fönster",
      running: "Startar ny sökning…",
    },
  },
  // ADDITIVE (Faza 8B): destinationsväder (open-meteo) — strip på resultatkort + widget på /destinations
  weather: {
    title: (city: string) => `Väder i ${city} — kommande 7 dagar`,
    rain: (pct: number) => `regn ${pct} %`,
    source: "Prognos: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "Klart",
      partlyCloudy: "Delvis molnigt",
      cloudy: "Mulet",
      fog: "Dimma",
      rain: "Regn",
      snow: "Snö",
      showers: "Skurar",
      thunderstorm: "Åska",
    },
  },
  hero: {
    title: (city: string, country: string) => `Bästa mitt för dig: ${city}, ${country}`,
    gap: (text: string) => `alla anländer inom ${text}`,
    from: (price: string) => `från ${price} / person`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "Se det här alternativet",
  },
  surprise: {
    button: "Överraska mig",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ${gap} isär, ${total}`,
  },
  popular: {
    title: "Populära mittpunkter",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Inga populära ställen än",
  },
  ads: {
    label: "Sponsrat",
  },
  share: {
    pageTitle: "midspot-sökning",
    loading: "Laddar sökning…",
    notFoundTitle: "Den här söklänken är inte tillgänglig",
    notFoundBody:
      "Den kan ha gått ut (sökningar sparas i 7 dagar) eller så är länken fel.",
    backHome: "Tillbaka till midspot",
    errorPrefix: "Sökfel: ",
  },
  notFound: {
    title: "Sidan hittades inte",
    body: "Sidan du letar efter finns inte eller har flyttats.",
    backHome: "Tillbaka till midspot",
  },
  common: {
    loading: "Laddar…",
  },
  consent: {
    title: "Cookies",
    body: "Vi använder nödvändiga cookies för att komma ihåg ditt språk och ditt val här. Annonscookies (EthicalAds / CarbonAds) laddas bara om du väljer ”Acceptera alla”.",
    acceptAll: "Acceptera alla",
    essentialOnly: "Endast nödvändiga",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "Destinationer",
      indexDescription:
        "Bläddra bland de europeiska städer som midspot kan söka som mittpunkt för din grupp — rankade efter hur ofta resenärer har valt dem.",
      cityTitle: (city: string) => `Mötas i ${city}`,
      cityDescription: (city: string, country: string) =>
        `Mötas i ${city}, ${country} — se varför det fungerar som mittpunkt för vänner och familj som flyger från olika städer, och hitta sedan din egen mittpunkt.`,
    },
    index: {
      eyebrow: "Destinationer",
      title: "Var ska din grupp mötas?",
      subtitle:
        "Varje stad nedan är en destination som midspot kan söka som möjlig mittpunkt för 2–8 resenärer som flyger från olika hemflygplatser. Välj en för att se varför den fungerar — eller gå tillbaka och låt sökningen hitta din mittpunkt.",
      searchPlaceholder: "Sök stad, land eller flygplatskod…",
      empty: "Inga destinationer matchar din sökning.",
      showing: (shown: number, total: number) => `Visar ${shown} av ${total} destinationer`,
      airports: (codes: string) => `Flygplatser: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Inte vald som mittpunkt än"
          : count === 1
            ? "Vald en gång som mittpunkt"
            : `Vald ${count}× som mittpunkt`,
    },
    city: {
      back: "Alla destinationer",
      pitch: (city: string) => `Mötas i ${city} — mittpunkten som fungerar för alla.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) är en av destinationerna som midspot söker när en grupp vänner eller familj vill mötas. Alla flyger från sin egen hemflygplats; vi rankar destinationer efter hur nära alla anländer, sedan efter pris — inom din budget.`,
      airportsLabel: "Betjänade flygplatser",
      statsLabel: "Antal gånger vald som mittpunkt (senaste 90 dagarna)",
      statsEmpty: "Inga sökningar än — bli den första gruppen som möts här.",
      howTitle: "Så fungerar det",
      howSteps: [
        {
          title: "Lägg till allas hemflygplats",
          body: "2–8 resenärer, var och en från sin egen stad — vi söker riktiga flygpriser från alla.",
        },
        {
          title: "Ange datum, nätter och budget",
          body: "Flexibla datum eller en hel månad; en budget per person som täcker ut- + returflyg.",
        },
        {
          title: "Vi rankar mittpunkterna",
          body: "Destinationer sorteras efter ankomstskillnad (alla landar inom 24 h från varandra), sedan efter totalt pris.",
        },
      ],
      faqTitle: "Vanliga frågor",
      // "{city}" ersätts med sidans stad vid rendering
      faqs: [
        {
          q: "Varför är {city} en bra mittpunkt?",
          a: "{city} är lätt att nå med korta, täta flyg från hela Europa, så resenärer från olika städer anländer ofta inom några timmar från varandra — till ett lågt totalt pris. Kör en sökning så rankar midspot den mot alla andra alternativ.",
        },
        {
          q: "Bokar jag flyg via midspot?",
          a: "Nej. midspot hittar och rankar mittpunkten; bokningen sker på partnerns webbplats (t.ex. Kiwi.com) via en affiliatelänk, till samma pris för dig.",
        },
        {
          q: "Är priserna verkliga?",
          a: "Priserna kommer från live flygdata i sökögonblicket och kan ändras — bokningssidan visar alltid slutpriset.",
        },
      ],
      cta: "Hitta din mittpunkt",
    },
  },
  blog: {
    meta: {
      title: "Blogg",
      description:
        "Berättelser och anteckningar från midspot-teamet — hur vi hittar mittpunkten för grupper som flyger från olika städer.",
    },
    title: "Historier från mitten",
    subtitle:
      "Anteckningar om att mötas halvvägs: hur sökningen fungerar, var grupper faktiskt har mötts och vad vi lär oss av live flygdata.",
    latest: "Senaste inlägg",
    empty: "Inga inlägg än — kom tillbaka snart.",
    readingTime: (minutes: number) => `${minutes} min läsning`,
    published: (date: string) => `Publicerad ${date}`,
    back: "Alla inlägg",
    prev: "Nyare inlägg",
    next: "Äldre inlägg",
    share: "Kopiera länk",
    copied: "Länk kopierad!",
    copyFailed: "Kunde inte kopiera — markera adressen manuellt",
    rss: "RSS-flöde",
  },
  stats: {
    title: "Sidstatistik",
    subtitle: "midspots egen integritetsvänliga analys — bara aggregerad data, aldrig IP-adresser.",
    secretLabel: "Statistikhemlighet",
    secretPlaceholder: "Klistra in statistikhemligheten",
    unlock: "Ladda statistik",
    loading: "Laddar…",
    unauthorized:
      "Fel eller saknad hemlighet (401). Hemligheten paketeras aldrig i denna sida — fråga sidägaren.",
    error: "Kunde inte ladda statistiken.",
    retry: "Försök igen",
    totals: { searches: "Sökningar", results: "Resultat", pageviews: "Sidvisningar" },
    searchesChart: "Sökningar per dag — senaste 30 dagarna",
    pageviewsChart: "Sidvisningar per dag — senaste 30 dagarna",
    popularRoutes: "Populära ursprung-par — senaste 30 dagarna",
    providerUsage: "Leverantörsanvändning — aktuell månad",
    table: {
      day: "Dag",
      count: "Antal",
      total: "Totalt",
      route: "Rutt",
      searches: "Sökningar",
      provider: "Leverantör",
      calls: "Anrop",
      cap: "Månadsgräns",
      pctUsed: "% av gräns",
    },
    noData: "Ingen data än.",
    cloudflareNote:
      "Cloudflare-panelen visar också edge-trafik (alla förfrågningar som når CDN-egden, inklusive bottar och cachade resurser) — denna sida visar bara det som midspot själv levererar och lagrar i sin egen databas.",
  },
  footer: {
    destinations: "Destinationer",
    blog: "Blogg",
    privacy: "Integritet",
    terms: "Villkor",
    cookieSettings: "Cookie-inställningar",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Språk",
  },
  currency: {
    label: "Valuta",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · ECB-kurs från ${date}`,
  },
  theme: {
    label: "Tema",
    light: "Ljust",
    dark: "Mörkt",
    system: "System",
  },
};
