// Deutsch — gleiche Schlüsselstruktur wie en.ts. Legale Seiten (privacy/terms)
// bleiben auf Englisch (Fallback), bis sie übersetzt sind.
import type { LangMessages } from "./en";

export const de: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Trefft euch in der Mitte",
    heroSubtitle:
      "Ein Ziel, alle fliegen von zu Hause aus, und alle kommen innerhalb eines Tages an — im Budget.",
    heroPoints: [
      "2–8 Reisende, jeder aus seiner eigenen Stadt",
      "Flexible Reisedaten — oder einen ganzen Monat wählen",
      "Sortiert nach Ankunftsdifferenz, dann nach Preis",
    ],
  },
  form: {
    title: "Reise planen",
    originsLabel: "Wo fliegt jeder ab?",
    originsHint: "2–8 Heimatflughäfen, je ein Reisender",
    originPlaceholder: "Stadt oder Flughafen suchen…",
    originSelectedPlaceholder: "Flughafen wählen",
    addOrigin: "Reisenden hinzufügen",
    removeOrigin: "Entfernen",
    maxOriginsReached: "Maximal 8 Reisende",
    minOriginsHint: "Mindestens 2 Reisende",
    locationButton: "Meinen Standort verwenden",
    locationLocating: "Standort wird ermittelt…",
    locationFailed: "Standort konnte nicht ermittelt werden — bitte Flughafen manuell wählen",
    locationNoEmptyRow: "Alle Reisenden-Plätze sind bereits belegt",
    autocomplete: {
      searching: "Flughäfen werden gesucht…",
      minChars: "Mindestens 2 Zeichen eingeben…",
      empty: "Keine Flughäfen gefunden.",
    },
    datesLabel: "Reisedaten",
    datesPlaceholder: "Abflug & Rückkehr wählen",
    datesHint: "Abflug → Rückkehr — die Nächte ergeben sich automatisch",
    flexLabel: "Abflug-Flexibilität",
    flexDays: (days: number) =>
      days === 0 ? "±0 Tage (genaues Datum)" : `±${days} Tag${days === 1 ? "" : "e"}`,
    monthMode: "Nur Monat",
    monthLabel: "Monat",
    monthHint: "Wir scannen den ganzen Monat und wählen automatisch die günstigsten 14 Tage",
    nightsLabel: "Nächte",
    nightsHint: "1–30",
    nightsLabelMonth: "Nächte (frei wählbar)",
    nightsAutoHint: "Werden automatisch aus den Reisedaten ermittelt",
    monthSampling: (month: string) => `die günstigsten 14 Tage im ${month} werden gewählt…`,
    fewerNights: "Weniger Nächte",
    moreNights: "Mehr Nächte",
    budgetLabel: "Budget pro Person",
    budgetHint: (cur: string) => `Deckt Hin- + Rückflug, in ${cur}`,
    maxFlightLabel: "Max. Flugzeit (optional)",
    maxFlightAny: "Jede Dauer",
    maxFlightHours: (h: number) => `Bis ${h} h`,
    submit: "Mittlere Orte finden",
    submitting: "Suche wird gestartet…",
    errors: {
      originsRequired: "Wähle mindestens 2 Heimatflughäfen",
      originsUnique: "Jeder Reisende braucht einen anderen Heimatflughafen",
      datesRequired: "Wähle Abflug- und Rückflugdatum",
      nightsRequired: "Wähle, wie viele Nächte (1–30)",
      budgetRequired: (min: string, max: string) =>
        `Budget muss zwischen ${min} und ${max} pro Person liegen`,
      validationFailed: "Bitte prüfe das Formular — einige Felder sind ungültig",
      rateLimited: (retryAfterSeconds?: number) =>
        `Zu viele Suchen — bitte warte${retryAfterSeconds ? ` ${retryAfterSeconds} s` : " einen Moment"} und versuche es erneut`,
      generic: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
      network: "Server nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.",
    },
  },
  waiting: {
    title: "Wir finden eure Mitte…",
    subtitle:
      "Wir durchsuchen Flüge von jedem Heimatflughafen zu Kandidatenzielen. Das dauert normalerweise unter eine Minute.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Schritt ${done} von ${total}` : "Wird vorbereitet…",
    partialTitle: "Bisher gefunden",
    cancel: "Suche abbrechen",
    cancelling: "Wird abgebrochen…",
    cancelDialogTitle: "Diese Suche abbrechen?",
    cancelDialogBody:
      "Die Suche wird gestoppt, aber bereits gefundene Ziele bleiben unten sichtbar.",
    cancelDialogConfirm: "Ja, abbrechen",
    cancelDialogDismiss: "Weiter suchen",
  },
  history: {
    title: "Zuletzt gesucht",
    clear: "Leeren",
    chipAria: (label: string) => `Suche öffnen: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    title: "Eure Mittleren Orte",
    subtitle: "Sortiert danach, wie nah alle ankommen, dann nach dem Gesamtpreis.",
    empty: "Noch kein Ziel passt zu Budget und Ankunftsdifferenz.",
    gapBadge: (text: string) => `Alle kommen innerhalb von ${text} an`,
    gapRelaxed: (hours: number) =>
      `Kein Treffer innerhalb der Standard-24 h — die Ankunftsdifferenz wurde auf ${hours} h erweitert`,
    outbound: (date: string) => `Hinflug · ${date}`,
    returnLeg: (date: string) => `Rückflug · ${date}`,
    perPersonTotal: "pro Person",
    groupTotal: "Gesamt für die Gruppe",
    bookOutbound: "Hinflug buchen",
    bookReturn: "Rückflug buchen",
    stay: (city: string) => `Unterkunft in ${city}`,
    stayNote: "Affiliate-Link",
    // ADDITIVE (Faza 7): Labels der Affiliate-"Extras"-Buttons pro Ergebnis
    extras: {
      title: "Extras",
      transfer: "Flughafentransfer",
      car: "Mietwagen",
      esim: "eSIM",
      activities: "Aktivitäten",
    },
    priceNote:
      "Preise vom Zeitpunkt der Suche — die Buchungsseite zeigt den Live-Preis.",
    share: "Share-Link kopieren",
    copied: "Share-Link kopiert!",
    copyFailed: "Kopieren nicht möglich — bitte URL manuell markieren",
    shareCard: "Share-Karte herunterladen",
    shareCardDownloaded: "Share-Karte heruntergeladen — schau in deine Downloads!",
    shareCardFailed: "Share-Karte konnte nicht erstellt werden — bitte erneut versuchen",
    invite: "Einladung kopieren",
    inviteCopied: "Einladung kopiert — schick sie an deine Gruppe!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `Wir treffen uns in ${city} (${country}), ${dep} → ${ret}! Wir haben Flüge gefunden, die uns alle innerhalb von ${gap} landen lassen: ${url}`,
    cancelledBanner: "Suche abgebrochen — bisher gefundene Ziele werden angezeigt.",
    failedTitle: "Die Suche ist fehlgeschlagen",
    failedRetry: "Neue Suche über die Startseite starten",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} ${n === 1 ? "Nacht" : "Nächte"}`,
    usageLimited: "Monatliches Suchlimit erreicht — nur gecachte Ergebnisse werden angezeigt.",
    map: {
      title: "Karte",
      origins: "Heimatflughäfen",
      destinations: "Ziele",
      airports: "Alle Kandidaten-Flughäfen",
      tooltip: {
        gap: (text: string) => `Ankünfte innerhalb von ${text}`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Gesamt für die Gruppe",
        perPerson: "pro Person",
      },
    },
    toolbar: {
      sortLabel: "Sortieren nach",
      sortGap: "Geringste Ankunftsdifferenz",
      sortPrice: "Niedrigster Gesamtpreis",
      sortDestination: "Ziel A–Z",
      gapLabel: "Max. Ankunftsdifferenz",
      gapAny: "Beliebig",
      gapHours: (h: number) => `≤ ${h} h`,
      priceLabel: "Max. Preis / Person",
      priceAny: "Beliebig",
      showing: (shown: number, total: number) => `${shown} von ${total} angezeigt`,
    },
    timeline: {
      title: "Ankunftsverteilung",
      arriveWithin: (text: string) => `Ankunft innerhalb von ${text}`,
    },
    relax: {
      title: "Noch keine Treffer",
      body: "Erweitere die Suche und starte sie neu — wiederholte Suchen nutzen zwischengespeicherte Preise.",
      gap30: "Differenz auf 30 h lockern",
      budget50: (amount: string) => `+${amount} Budget`,
      days3: "+3 Tage Fenster",
      running: "Neue Suche wird gestartet…",
    },
  },
  // ADDITIVE (Faza 8B): Wetter am Ziel (open-meteo) — Streifen auf der Karte + Widget auf /destinations
  weather: {
    title: (city: string) => `Wetter in ${city} — die nächsten 7 Tage`,
    rain: (pct: number) => `Regen ${pct} %`,
    source: "Vorhersage: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "Klar",
      partlyCloudy: "Teilweise bewölkt",
      cloudy: "Bewölkt",
      fog: "Nebel",
      rain: "Regen",
      snow: "Schnee",
      showers: "Schauer",
      thunderstorm: "Gewitter",
    },
  },
  hero: {
    title: (city: string, country: string) => `Bester Treffpunkt für euch: ${city}, ${country}`,
    gap: (text: string) => `alle kommen innerhalb von ${text} an`,
    from: (price: string) => `ab ${price} / Person`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "Diese Option ansehen",
  },
  surprise: {
    button: "Überrasch mich",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ${gap} Unterschied, ${total}`,
  },
  popular: {
    title: "Beliebte Treffpunkte",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Noch keine beliebten Ziele",
  },
  ads: {
    label: "Werbung",
  },
  share: {
    pageTitle: "midspot-Suche",
    loading: "Suche wird geladen…",
    notFoundTitle: "Dieser Suchlink ist nicht verfügbar",
    notFoundBody:
      "Er ist möglicherweise abgelaufen (Suchen werden 7 Tage gespeichert) oder falsch.",
    backHome: "Zurück zu midspot",
    errorPrefix: "Suchfehler: ",
  },
  notFound: {
    title: "Seite nicht gefunden",
    body: "Die gesuchte Seite existiert nicht oder wurde verschoben.",
    backHome: "Zurück zu midspot",
  },
  common: {
    loading: "Wird geladen…",
  },
  consent: {
    title: "Cookies",
    body: "Wir verwenden essentielle Cookies für Sprache und deine Auswahl hier. Werbe-Cookies (EthicalAds / CarbonAds) werden nur geladen, wenn du „Alle akzeptieren“ wählst.",
    acceptAll: "Alle akzeptieren",
    essentialOnly: "Nur essentielle",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "Reiseziele",
      indexDescription:
        "Stöbere in den europäischen Städten, die midspot deiner Gruppe als Treffpunkt in der Mitte suchen kann — sortiert danach, wie oft Reisende sie gewählt haben.",
      cityTitle: (city: string) => `Trefft euch in ${city}`,
      cityDescription: (city: string, country: string) =>
        `Trefft euch in ${city}, ${country} — sieh, warum die Stadt als Mitte für Freunde und Familie aus verschiedenen Städten funktioniert, und findet euren eigenen Treffpunkt.`,
    },
    index: {
      eyebrow: "Reiseziele",
      title: "Wo soll sich eure Gruppe treffen?",
      subtitle:
        "Jede Stadt unten ist ein Ziel, das midspot für 2–8 Reisende aus verschiedenen Heimatflughäfen als mögliche Mitte durchsuchen kann. Wähle eine, um zu sehen, warum sie funktioniert — oder geh zurück und lass die Suche eure Mitte finden.",
      searchPlaceholder: "Stadt, Land oder Flughafencore suchen…",
      empty: "Keine Reiseziele passen zu deiner Suche.",
      showing: (shown: number, total: number) => `${shown} von ${total} Reisezielen angezeigt`,
      airports: (codes: string) => `Flughäfen: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Noch nicht als Mitte gewählt"
          : count === 1
            ? "1× als Mitte gewählt"
            : `${count}× als Mitte gewählt`,
    },
    city: {
      back: "Alle Reiseziele",
      pitch: (city: string) => `Trefft euch in ${city} — die Mitte, die für alle funktioniert.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) ist eines der Ziele, die midspot durchsucht, wenn eine Gruppe aus Freunden oder Familie sich treffen möchte. Alle fliegen von ihrem eigenen Heimatflughafen; wir sortieren Ziele nach Ankunftsdifferenz und dann nach Preis — im Rahmen eures Budgets.`,
      airportsLabel: "Angfogene Flughäfen",
      statsLabel: "So oft als Mitte gewählt (letzte 90 Tage)",
      statsEmpty: "Noch keine Suchen — seid die erste Gruppe, die sich hier trifft.",
      howTitle: "So funktioniert's",
      howSteps: [
        {
          title: "Heimatflughafen aller hinzufügen",
          body: "2–8 Reisende, jeder aus seiner Stadt — wir suchen echte Flugpreise von allen.",
        },
        {
          title: "Termine, Nächte und Budget festlegen",
          body: "Flexible Daten oder ein ganzer Monat; ein Pro-Kopf-Budget für Hin- + Rückflug.",
        },
        {
          title: "Wir ranken die Treffpunkte",
          body: "Ziele werden nach Ankunftsdifferenz sortiert (alle landen innerhalb von 24 h), dann nach Gesamtpreis.",
        },
      ],
      faqTitle: "Häufige Fragen",
      // „{city}” wird beim Rendern durch die Stadt der Seite ersetzt
      faqs: [
        {
          q: "Warum ist {city} eine gute Mitte?",
          a: "{city} ist mit kurzen, häufigen Flügen aus ganz Europa erreichbar, sodass Reisende aus verschiedenen Städten oft innerhalb weniger Stunden ankommen — und das zu einem niedrigen Gesamtpreis. Starte eine Suche und midspot vergleicht die Stadt mit allen anderen Optionen.",
        },
        {
          q: "Buche ich Flüge über midspot?",
          a: "Nein. midspot findet und sortiert die Mitte; gebucht wird auf der Partnerseite (z. B. Kiwi.com) über einen Affiliate-Link — zum selben Preis für dich.",
        },
        {
          q: "Sind die Preise echt?",
          a: "Die Preise stammen aus Live-Flugdaten zum Zeitpunkt der Suche und können sich ändern — die Buchungsseite zeigt immer den Endpreis.",
        },
      ],
      cta: "Findet eure Mitte",
    },
  },
  blog: {
    meta: {
      title: "Blog",
      description:
        "Geschichten und Notizen aus dem midspot-Team — wie wir die Mitte für Gruppen finden, die aus verschiedenen Städten anreisen.",
    },
    title: "Geschichten aus der Mitte",
    subtitle:
      "Notizen zum Treffen in der Mitte: wie die Suche funktioniert, wo Gruppen sich tatsächlich trafen und was wir aus Live-Flugdaten lernen.",
    latest: "Neueste Artikel",
    empty: "Noch keine Artikel — schau bald wieder vorbei.",
    readingTime: (minutes: number) => `${minutes} Min. Lesezeit`,
    published: (date: string) => `Veröffentlicht am ${date}`,
    back: "Alle Artikel",
    prev: "Neuerer Artikel",
    next: "Älterer Artikel",
    share: "Link kopieren",
    copied: "Link kopiert!",
    copyFailed: "Kopieren fehlgeschlagen — bitte die Adresse manuell markieren",
    rss: "RSS-Feed",
  },
  stats: {
    title: "Website-Statistiken",
    subtitle: "midspots eigene datenschutzfreundliche Analyse — nur Aggregate, niemals IPs.",
    secretLabel: "Statistik-Schlüssel",
    secretPlaceholder: "Statistik-Schlüssel einfügen",
    unlock: "Statistiken laden",
    loading: "Wird geladen…",
    unauthorized:
      "Falscher oder fehlender Schlüssel (401). Der Schlüssel ist nicht in diese Seite eingebettet — beim Website-Betreiber erfragen.",
    error: "Statistiken konnten nicht geladen werden.",
    retry: "Erneut versuchen",
    totals: { searches: "Suchen", results: "Ergebnisse", pageviews: "Seitenaufrufe" },
    searchesChart: "Suchen pro Tag — letzte 30 Tage",
    pageviewsChart: "Seitenaufrufe pro Tag — letzte 30 Tage",
    popularRoutes: "Beliebte Start-Ziel-Paare — letzte 30 Tage",
    providerUsage: "Anbieternutzung — aktueller Monat",
    table: {
      day: "Tag",
      count: "Anzahl",
      total: "Gesamt",
      route: "Route",
      searches: "Suchen",
      provider: "Anbieter",
      calls: "Aufrufe",
      cap: "Monatslimit",
      pctUsed: "% vom Limit",
    },
    noData: "Noch keine Daten.",
    cloudflareNote:
      "Das Cloudflare-Dashboard zeigt ebenfalls Edge-Traffic (alle Anfragen am CDN-Edge, inkl. Bots und gecachter Assets) — diese Seite zeigt nur, was midspot selbst ausliefert und in der eigenen Datenbank speichert.",
  },
  footer: {
    destinations: "Reiseziele",
    blog: "Blog",
    privacy: "Datenschutz",
    terms: "AGB",
    cookieSettings: "Cookie-Einstellungen",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Sprache",
  },
  currency: {
    label: "Währung",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · EZB-Kurs vom ${date}`,
  },
  theme: {
    label: "Design",
    light: "Hell",
    dark: "Dunkel",
    system: "System",
  },
};
