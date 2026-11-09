// Norsk — samme nøkkelstruktur som en.ts (kilden). Juridiske sider
// (privacy/terms) utelates i denne språkversjonen; de vises på engelsk.
import type { LangMessages } from "./en";

export const no: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Møt i midten",
    heroSubtitle:
      "Alle flyr hjemmefra, og dere møtes på en tredje destinasjon — innen timer fra hverandre, ikke dager. Rangert etter ankomstforskjell først, deretter etter pris, innenfor budsjettet deres.",
    heroPoints: [
      "2–8 reisende, hver flyr fra sin egen by",
      "Dere møtes på destinasjonen — ikke hjemme hos hverandre",
      "Ankomstforskjell først (maks. 24 t), deretter pris",
      "Fleksible reisedatoer — eller velg en hel måned",
    ],
    heroExample:
      "Eksempel: du flyr fra Bukarest, en venn fra Berlin → dere møtes i Barcelona, med 2 timers mellomrom på ankomst — ikke 3 dager.",
  },
  form: {
    title: "Planlegg turen",
    originsLabel: "Hvor flyr alle fra?",
    originsHint: "2–8 hjemflyplasser, én reisende hver",
    originPlaceholder: "Søk by eller flyplass…",
    originSelectedPlaceholder: "Velg en flyplass",
    addOrigin: "Legg til reisende",
    removeOrigin: "Fjern",
    maxOriginsReached: "Maksimalt 8 reisende",
    minOriginsHint: "Minst 2 reisende",
    locationButton: "Bruk posisjonen min",
    locationLocating: "Finner posisjonen din…",
    locationFailed: "Kunne ikke finne posisjonen din — velg flyplass manuelt",
    locationNoEmptyRow: "Alle reisendeplassene er allerede fylt",
    autocomplete: {
      searching: "Søker etter flyplasser…",
      minChars: "Skriv minst 2 tegn…",
      empty: "Ingen flyplasser funnet.",
    },
    datesLabel: "Reisedatoer",
    datesPlaceholder: "Velg avreise og retur",
    datesHint: "Avreise → retur — antall netter beregnes automatisk",
    flexLabel: "Avreisefleksibilitet",
    flexDays: (days: number) =>
      days === 0 ? "±0 dager (nøyaktig dato)" : `±${days} ${days === 1 ? "dag" : "dager"}`,
    monthMode: "Hel måned",
    monthLabel: "Måned",
    monthHint: "Vi skanner hele måneden og velger automatisk den billigste 14-dagersperioden",
    nightsLabel: "Netter",
    nightsHint: "1–30",
    nightsLabelMonth: "Netter (valgfritt)",
    nightsAutoHint: "Beregnes automatisk fra reisedatoene dine",
    monthSampling: (month: string) => `velger de billigste 14 dagene i ${month}…`,
    fewerNights: "Færre netter",
    moreNights: "Flere netter",
    budgetLabel: "Budsjett per person",
    budgetHint: (cur: string) => `Dekker utreise + retur, i ${cur}`,
    maxFlightLabel: "Maks flytid (valgfritt)",
    maxFlightAny: "Hvilken som helst varighet",
    maxFlightHours: (h: number) => `Opptil ${h} t`,
    submit: "Finn møtesteder i midten",
    submitting: "Starter søket…",
    errors: {
      originsRequired: "Velg minst 2 hjemflyplasser",
      originsUnique: "Hver reisende må ha en annen hjemflyplass",
      datesRequired: "Velg avreise- og returdatoer",
      nightsRequired: "Velg antall netter (1–30)",
      budgetRequired: (min: string, max: string) =>
        `Budsjettet må være mellom ${min} og ${max} per person`,
      validationFailed: "Sjekk skjemaet — noen felt er ugyldige",
      rateLimited: (retryAfterSeconds?: number) =>
        `For mange søk — vent${retryAfterSeconds ? ` ${retryAfterSeconds} s` : " en stund"} og prøv igjen`,
      generic: "Noe gikk galt. Prøv igjen.",
      network: "Kunne ikke nå serveren. Sjekk tilkoblingen og prøv igjen.",
    },
  },
  waiting: {
    title: "Finner møtestedet ditt…",
    subtitle:
      "Vi skanner flyvninger fra hver hjemflyplass til kandidatdestinasjoner. Dette tar vanligvis under ett minutt.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Trinn ${done} av ${total}` : "Varmer opp…",
    partialTitle: "Funnet så langt",
    cancel: "Avbryt søket",
    cancelling: "Avbryter…",
    cancelDialogTitle: "Avbryte dette søket?",
    cancelDialogBody:
      "Søket stoppes, men destinasjoner som allerede er funnet, forblir synlige nedenfor.",
    cancelDialogConfirm: "Ja, avbryt",
    cancelDialogDismiss: "Fortsett søket",
  },
  history: {
    title: "Nylige søk",
    clear: "Tøm",
    chipAria: (label: string) => `Åpne søk: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    title: "Dine møtesteder i midten",
    subtitle: "Rangert etter hvor nær hverandre alle ankommer, deretter etter totalpris.",
    empty: "Ingen destinasjoner passet ennå til budsjettet ditt og grensen for ankomstforskjell.",
    gapBadge: (text: string) => `Alle ankommer innen ${text}`,
    gapRelaxed: (hours: number) =>
      `Ingen treff innen standardgrensen på 24 t — ankomstforskjellen ble utvidet til ${hours} t`,
    outbound: (date: string) => `Utreise · ${date}`,
    returnLeg: (date: string) => `Retur · ${date}`,
    perPersonTotal: "per person",
    groupTotal: "Totalt for gruppen",
    bookOutbound: "Bestill utreise",
    bookReturn: "Bestill retur",
    stay: (city: string) => `Overnatt i ${city}`,
    stayNote: "Affiliate-lenke",
    extras: {
      title: "Ekstra",
      transfer: "Flyplasstransport",
      car: "Leiebil",
      esim: "eSIM",
      activities: "Aktiviteter",
    },
    priceNote: "Prisene er fra søkeøyeblikket — bestillingssiden viser den faktiske prisen.",
    share: "Kopier delingslenke",
    copied: "Delingslenke kopiert!",
    copyFailed: "Kunne ikke kopiere — velg URL-en manuelt",
    shareCard: "Last ned dele-kort",
    shareCardDownloaded: "Dele-kort lastet ned — sjekk nedlastingene dine!",
    shareCardFailed: "Kunne ikke lage dele-kortet — prøv igjen",
    invite: "Kopier invitasjon",
    inviteCopied: "Invitasjon kopiert — lim den inn i gruppechatten!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `La oss møtes i ${city} (${country}), ${dep} → ${ret}! Vi fant flyvninger som får alle til å lande innen ${gap} fra hverandre: ${url}`,
    cancelledBanner: "Søk avbrutt — viser destinasjonene funnet så langt.",
    failedTitle: "Søket mislyktes",
    failedRetry: "Start et nytt søk fra forsiden",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} ${n === 1 ? "natt" : "netter"}`,
    usageLimited: "Månedlig søkegrense nådd — viser bare bufitrede resultater.",
    map: {
      title: "Kart",
      origins: "Hjemflyplasser",
      destinations: "Destinasjoner",
      airports: "Alle kandidatflyplasser",
      tooltip: {
        gap: (text: string) => `ankomst innen ${text}`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Totalt for gruppen",
        perPerson: "per person",
      },
    },
    toolbar: {
      sortLabel: "Sorter etter",
      sortGap: "Tetteste ankomster",
      sortPrice: "Laveste pris",
      sortDestination: "Destinasjon A–Å",
      gapLabel: "Maks ankomstforskjell",
      gapAny: "Alle",
      gapHours: (h: number) => `≤ ${h} t`,
      priceLabel: "Maks pris / person",
      priceAny: "Alle",
      showing: (shown: number, total: number) => `${shown} av ${total} vist`,
    },
    timeline: {
      title: "Ankomstspredning",
      arriveWithin: (text: string) => `ankommer innen ${text}`,
    },
    relax: {
      title: "Ingen treff ennå",
      body: "Utvid søket og kjør det igjen — gjentatte søk gjenbruker bufitrede flypriser.",
      gap30: "Øk forskjellen til 30 t",
      budget50: (amount: string) => `+${amount} budsjett`,
      days3: "+3 dagers vindu",
      running: "Starter nytt søk…",
    },
  },
  weather: {
    title: (city: string) => `Været i ${city} — neste 7 dager`,
    rain: (pct: number) => `regn ${pct} %`,
    source: "Prognose: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "Skyfri himmel",
      partlyCloudy: "Delvis skyet",
      cloudy: "Overskyet",
      fog: "Tåke",
      rain: "Regn",
      snow: "Snø",
      showers: "Byger",
      thunderstorm: "Tordenvær",
    },
  },
  hero: {
    title: (city: string, country: string) => `Beste møtested for dere: ${city}, ${country}`,
    gap: (text: string) => `alle ankommer innen ${text}`,
    from: (price: string) => `fra ${price} / person`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "Se dette alternativet",
  },
  surprise: {
    button: "Overrask meg",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ${gap} fra hverandre, ${total}`,
  },
  popular: {
    title: "Populære møtesteder i midten",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Ingen populære møtesteder ennå",
  },
  ads: {
    label: "Sponset",
  },
  share: {
    pageTitle: "midspot-søk",
    loading: "Laster søk…",
    notFoundTitle: "Denne søkelenken er ikke tilgjengelig",
    notFoundBody:
      "Den kan ha utløpt (søk lagres i 7 dager) eller lenken er feil.",
    backHome: "Tilbake til midspot",
    errorPrefix: "Søkefeil: ",
  },
  notFound: {
    title: "Fant ikke siden",
    body: "Siden du leter etter finnes ikke eller er flyttet.",
    backHome: "Tilbake til midspot",
  },
  common: {
    loading: "Laster…",
  },
  consent: {
    title: "Informasjonskapsler",
    body: "Vi bruker nødvendige informasjonskapsler for å huske språket ditt og valget ditt her. Annonsekapsler (EthicalAds / CarbonAds) lastes bare hvis du velger «Godta alle».",
    acceptAll: "Godta alle",
    essentialOnly: "Kun nødvendige",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "Destinasjoner",
      indexDescription:
        "Bla gjennom europeiske byer midspot kan søke som møtested i midten for gruppen din — rangert etter hvor ofte reisende har valgt dem.",
      cityTitle: (city: string) => `Møt i ${city}`,
      cityDescription: (city: string, country: string) =>
        `Møt i ${city}, ${country} — se hvorfor byen fungerer som møtested i midten for venner og familie som flyr fra forskjellige byer, og finn deretter ditt eget møtested.`,
    },
    index: {
      eyebrow: "Destinasjoner",
      title: "Hvor bør gruppen din møtes?",
      subtitle:
        "Hver by nedenfor er en destinasjon midspot kan søke som et mulig møtested i midten for 2–8 reisende som flyr fra forskjellige hjemflyplasser. Velg én for å se hvorfor den fungerer — eller gå tilbake og la søket finne ditt møtested.",
      searchPlaceholder: "Søk by, land eller flyplasskode…",
      empty: "Ingen destinasjoner samsvarer med søket ditt.",
      showing: (shown: number, total: number) => `Viser ${shown} av ${total} destinasjoner`,
      airports: (codes: string) => `Flyplasser: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Ikke valgt som møtested ennå"
          : count === 1
            ? "Valgt én gang som møtested"
            : `Valgt ${count}× som møtested`,
    },
    city: {
      back: "Alle destinasjoner",
      pitch: (city: string) => `Møt i ${city} — møtestedet i midten som fungerer for alle.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) er én av destinasjonene midspot søker når en vennegjeng eller familie vil møtes. Alle flyr fra sin egen hjemflyplass; vi rangerer destinasjoner etter hvor nær hverandre alle ankommer, deretter etter pris — innenfor budsjettet deres.`,
      airportsLabel: "Betjente flyplasser",
      statsLabel: "Antall ganger valgt som møtested (siste 90 dager)",
      statsEmpty: "Ingen søk ennå — vær den første gruppen som møtes her.",
      howTitle: "Slik fungerer det",
      howSteps: [
        {
          title: "Legg til alles hjemflyplass",
          body: "2–8 reisende, hver fra sin egen by — vi søker etter ekte flypriser fra alle.",
        },
        {
          title: "Sett datoer, netter og budsjett",
          body: "Fleksible datoer eller en hel måned; et budsjett per person som dekker utreise og retur.",
        },
        {
          title: "Vi rangerer møtestedene i midten",
          body: "Destinasjoner sorteres etter ankomstforskjell (alle lander innen 24 t fra hverandre), deretter etter totalpris.",
        },
      ],
      faqTitle: "Ofte stilte spørsmål",
      // „{city}“ erstattes med sidens by ved visning
      faqs: [
        {
          q: "Hvorfor er {city} et godt møtested i midten?",
          a: "{city} er lett å nå med korte, hyppige flyvninger fra hele Europa, så reisende fra forskjellige byer ankommer ofte bare timer fra hverandre — til en lav totalpris. Kjør et søk, så sammenligner midspot byen med alle andre alternativer.",
        },
        {
          q: "Bestiller jeg flyvninger gjennom midspot?",
          a: "Nei. midspot finner og rangerer møtestedet i midten; bestillingen skjer på partnerens nettsted (f.eks. Kiwi.com) via en affiliate-lenke, til samme pris for deg.",
        },
        {
          q: "Er prisene ekte?",
          a: "Prisene kommer fra livedata for flyvninger i søkeøyeblikket og kan endre seg — bestillingssiden viser alltid sluttprisen.",
        },
      ],
      cta: "Finn ditt møtested i midten",
    },
  },
  blog: {
    meta: {
      title: "Blogg",
      description:
        "Historier og notater fra midspot-teamet — hvordan vi finner møtestedet i midten for grupper som flyr fra forskjellige byer.",
    },
    title: "Historier fra midten",
    subtitle:
      "Notater om å møtes på midten: hvordan søket fungerer, hvor grupper faktisk møttes, og hva vi lærer av livedata for flyvninger.",
    latest: "Nyeste historier",
    empty: "Ingen innlegg ennå — kom tilbake snart.",
    readingTime: (minutes: number) => `${minutes} min lesing`,
    published: (date: string) => `Publisert ${date}`,
    back: "Alle innlegg",
    prev: "Nyere innlegg",
    next: "Eldre innlegg",
    share: "Kopier lenke",
    copied: "Lenke kopiert!",
    copyFailed: "Kunne ikke kopiere — velg URL-en manuelt",
    rss: "RSS-feed",
  },
  stats: {
    title: "Nettstedsstatistikk",
    subtitle: "midspots egen personvernvenlige analyse — kun aggregerte data, aldri IP-adresser.",
    secretLabel: "Statistikkhemmelighet",
    secretPlaceholder: "Lim inn statistikkhemmeligheten",
    unlock: "Last statistikk",
    loading: "Laster…",
    unauthorized:
      "Feil eller manglende hemmelighet (401). Hemmeligheten er ikke inkludert i denne siden — spør nettstedseieren.",
    error: "Kunne ikke laste statistikk.",
    retry: "Prøv igjen",
    totals: { searches: "Søk", results: "Resultater", pageviews: "Sidevisninger" },
    searchesChart: "Søk per dag — siste 30 dager",
    pageviewsChart: "Sidevisninger per dag — siste 30 dager",
    popularRoutes: "Populære utreisepar — siste 30 dager",
    providerUsage: "Leverandørbruk — inneværende måned",
    table: {
      day: "Dag",
      count: "Antall",
      total: "Totalt",
      route: "Rute",
      searches: "Søk",
      provider: "Leverandør",
      calls: "Anrop",
      cap: "Månedlig grense",
      pctUsed: "% av grensen",
    },
    noData: "Ingen data ennå.",
    cloudflareNote:
      "Cloudflare-dashbordet viser også kanttrafikken (alle forespørsler som treffer CDN-kanten, inkludert roboter og bufret innhold) — denne siden viser bare det midspot selv betjener og lagrer i sin egen database.",
  },
  footer: {
    destinations: "Destinasjoner",
    blog: "Blogg",
    privacy: "Personvern",
    terms: "Vilkår",
    cookieSettings: "Informasjonskapsel-innstillinger",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Språk",
  },
  currency: {
    label: "Valuta",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · ECB-kurs fra ${date}`,
  },
  theme: {
    label: "Tema",
    light: "Lys",
    dark: "Mørk",
    system: "System",
  },
};
