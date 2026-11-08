// Italiano — stesse chiavi di en.ts. Le pagine legali (privacy/terms) restano in
// inglese (fallback) finché non vengono tradotte.
import type { LangMessages } from "./en";

export const it: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Incontratevi a metà strada",
    heroSubtitle:
      "Una sola destinazione, ognuno vola dalla propria città e tutti arrivano a meno di un giorno di distanza — nel vostro budget.",
    heroPoints: [
      "2–8 viaggiatori, ognuno dalla propria città",
      "Date di viaggio flessibili — oppure scegli un intero mese",
      "Ordinati per differenza di arrivo, poi per prezzo",
    ],
  },
  form: {
    title: "Pianifica il viaggio",
    originsLabel: "Da dove parte ognuno?",
    originsHint: "2–8 aeroporti di partenza, un viaggiatore ciascuno",
    originPlaceholder: "Cerca città o aeroporto…",
    originSelectedPlaceholder: "Scegli un aeroporto",
    addOrigin: "Aggiungi viaggiatore",
    removeOrigin: "Rimuovi",
    maxOriginsReached: "Massimo 8 viaggiatori",
    minOriginsHint: "Almeno 2 viaggiatori",
    locationButton: "Usa la mia posizione",
    locationLocating: "Rilevamento posizione…",
    locationFailed: "Impossibile rilevare la posizione — scegli l'aeroporto manualmente",
    locationNoEmptyRow: "Tutti i posti dei viaggiatori sono già occupati",
    autocomplete: {
      searching: "Ricerca aeroporti…",
      minChars: "Digita almeno 2 caratteri…",
      empty: "Nessun aeroporto trovato.",
    },
    datesLabel: "Date del viaggio",
    datesPlaceholder: "Seleziona partenza e ritorno",
    datesHint: "Partenza → ritorno — le notti vengono calcolate automaticamente",
    flexLabel: "Flessibilità di partenza",
    flexDays: (days: number) =>
      days === 0 ? "±0 giorni (data esatta)" : `±${days} giorn${days === 1 ? "o" : "i"}`,
    monthMode: "Solo mese",
    monthLabel: "Mese",
    monthHint: "Scansioniamo l'intero mese e scegliamo automaticamente i 14 giorni più economici",
    nightsLabel: "Notti",
    nightsHint: "1–30",
    nightsLabelMonth: "Notti (a scelta)",
    nightsAutoHint: "Calcolate automaticamente dalle date del viaggio",
    monthSampling: (month: string) => `scelta dei 14 giorni più economici di ${month}…`,
    fewerNights: "Meno notti",
    moreNights: "Più notti",
    budgetLabel: "Budget a persona",
    budgetHint: "Copre andata + ritorno, in EUR",
    maxFlightLabel: "Tempo max di volo (opzionale)",
    maxFlightAny: "Qualsiasi durata",
    maxFlightHours: (h: number) => `Fino a ${h} h`,
    submit: "Trova posti a metà strada",
    submitting: "Avvio della ricerca…",
    errors: {
      originsRequired: "Scegli almeno 2 aeroporti di partenza",
      originsUnique: "Ogni viaggiatore deve avere un aeroporto di partenza diverso",
      datesRequired: "Seleziona partenza e ritorno",
      nightsRequired: "Scegli quante notti (1–30)",
      budgetRequired: "Il budget deve essere tra 20 € e 5.000 € a persona",
      validationFailed: "Controlla il modulo — alcuni campi non sono validi",
      rateLimited: (retryAfterSeconds?: number) =>
        `Troppe ricerche — attendi${retryAfterSeconds ? ` ${retryAfterSeconds} s` : " un momento"} e riprova`,
      generic: "Qualcosa è andato storto. Riprova.",
      network: "Impossibile raggiungere il server. Controlla la connessione e riprova.",
    },
  },
  waiting: {
    title: "Cerchiamo la vostra metà…",
    subtitle:
      "Analizziamo i voli da ogni aeroporto di partenza verso destinazioni candidate. Di solito meno di un minuto.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Passo ${done} di ${total}` : "Preparazione…",
    partialTitle: "Trovato finora",
    cancel: "Annulla ricerca",
    cancelling: "Annullamento…",
    cancelDialogTitle: "Annullare questa ricerca?",
    cancelDialogBody:
      "La ricerca si fermerà, ma le destinazioni già trovate restano visibili sotto.",
    cancelDialogConfirm: "Sì, annulla",
    cancelDialogDismiss: "Continua la ricerca",
  },
  history: {
    title: "Ricerche recenti",
    clear: "Cancella",
    chipAria: (label: string) => `Apri ricerca: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    title: "I vostri posti a metà strada",
    subtitle: "Ordinati per quanto sono vicini gli arrivi di tutti, poi per prezzo totale.",
    empty: "Nessuna destinazione corrisponde ancora a budget e limite di differenza di arrivo.",
    gapBadge: (text: string) => `Tutti arrivano entro ${text} di differenza`,
    gapRelaxed: (hours: number) =>
      `Nessun risultato entro il limite standard di 24 h — la differenza di arrivo è stata ampliata a ${hours} h`,
    outbound: (date: string) => `Andata · ${date}`,
    returnLeg: (date: string) => `Ritorno · ${date}`,
    perPersonTotal: "a persona",
    groupTotal: "Totale per il gruppo",
    bookOutbound: "Prenota andata",
    bookReturn: "Prenota ritorno",
    stay: (city: string) => `Alloggio a ${city}`,
    stayNote: "Link di affiliazione",
    // ADDITIVE (Faza 7): etichette dei pulsanti affiliati «extra» per risultato
    extras: {
      title: "Extra",
      transfer: "Transfer aeroporto",
      car: "Noleggio auto",
      esim: "eSIM",
      activities: "Attività",
    },
    priceNote:
      "I prezzi sono di quando è stata fatta la ricerca — il sito di prenotazione mostra il prezzo in tempo reale.",
    share: "Copia link di condivisione",
    copied: "Link di condivisione copiato!",
    copyFailed: "Copia non riuscita — seleziona l'URL manualmente",
    shareCard: "Scarica la card di condivisione",
    shareCardDownloaded: "Card di condivisione scaricata — controlla i download!",
    shareCardFailed: "Impossibile creare la card di condivisione — riprova",
    invite: "Copia invito",
    inviteCopied: "Invito copiato — incollalo nella chat del gruppo!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `Ci vediamo a ${city} (${country}), ${dep} → ${ret}! Abbiamo trovato voli che ci fanno atterrare a ${gap} di differenza: ${url}`,
    cancelledBanner: "Ricerca annullata — mostriamo le destinazioni trovate finora.",
    failedTitle: "La ricerca è fallita",
    failedRetry: "Avvia una nuova ricerca dalla home",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} nott${n === 1 ? "e" : "i"}`,
    usageLimited: "Limite mensile di ricerche raggiunto — solo risultati in cache.",
    map: {
      title: "Mappa",
      origins: "Aeroporti di partenza",
      destinations: "Destinazioni",
      airports: "Tutti gli aeroporti candidati",
      tooltip: {
        gap: (text: string) => `arrivi entro ${text}`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Totale del gruppo",
        perPerson: "a persona",
      },
    },
    toolbar: {
      sortLabel: "Ordina per",
      sortGap: "Arrivi più vicini",
      sortPrice: "Prezzo totale più basso",
      sortDestination: "Destinazione A–Z",
      gapLabel: "Differenza max di arrivo",
      gapAny: "Qualsiasi",
      gapHours: (h: number) => `≤ ${h} h`,
      priceLabel: "Prezzo max / persona",
      priceAny: "Qualsiasi",
      showing: (shown: number, total: number) => `${shown} di ${total} mostrati`,
    },
    timeline: {
      title: "Dispersione degli arrivi",
      arriveWithin: (text: string) => `arrivano entro ${text} di differenza`,
    },
    relax: {
      title: "Nessuna corrispondenza ancora",
      body: "Amplia la ricerca e rieseguila — le ricerche ripetute riutilizzano i prezzi in cache.",
      gap30: "Allarga la differenza a 30 h",
      budget50: "+50 € di budget",
      days3: "+3 giorni di finestra",
      running: "Avvio nuova ricerca…",
    },
  },
  hero: {
    title: (city: string, country: string) => `Il miglior punto d'incontro per voi: ${city}, ${country}`,
    gap: (text: string) => `tutti arrivano entro ${text} di differenza`,
    from: (price: string) => `da ${price} / persona`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "Vedi questa opzione",
  },
  surprise: {
    button: "Sorprendimi",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ${gap} di differenza, ${total}`,
  },
  popular: {
    title: "Punti d'incontro popolari",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Nessuna destinazione popolare ancora",
  },
  ads: {
    label: "Sponsorizzato",
  },
  share: {
    pageTitle: "ricerca midspot",
    loading: "Caricamento ricerca…",
    notFoundTitle: "Questo link di ricerca non è disponibile",
    notFoundBody:
      "Potrebbe essere scaduto (le ricerche si conservano per 7 giorni) o non valido.",
    backHome: "Torna a midspot",
    errorPrefix: "Errore di ricerca: ",
  },
  notFound: {
    title: "Pagina non trovata",
    body: "La pagina che cerchi non esiste o è stata spostata.",
    backHome: "Torna a midspot",
  },
  common: {
    loading: "Caricamento…",
  },
  consent: {
    title: "Cookie",
    body: "Usiamo cookie essenziali per la lingua e per la tua scelta qui. I cookie pubblicitari (EthicalAds / CarbonAds) si caricano solo se scegli «Accetta tutti».",
    acceptAll: "Accetta tutti",
    essentialOnly: "Solo essenziali",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "Destinazioni",
      indexDescription:
        "Sfoglia le città europee che midspot può cercare come punto mediano per il tuo gruppo — ordinate per quante volte i viaggiatori le hanno scelte.",
      cityTitle: (city: string) => `Incontro a ${city}`,
      cityDescription: (city: string, country: string) =>
        `Incontro a ${city}, ${country}: scopri perché funziona come punto mediano per amici e famiglia che volano da città diverse, e trova il vostro punto mediano.`,
    },
    index: {
      eyebrow: "Destinazioni",
      title: "Dove dovrebbe incontrarsi il vostro gruppo?",
      subtitle:
        "Ogni città qui sotto è una destinazione che midspot può cercare come possibile punto mediano per 2–8 viaggiatori in partenza da aeroporti diversi. Scegline una per capire perché funziona — oppure tornate alla home e lasciate che la ricerca trovi il vostro punto mediano.",
      searchPlaceholder: "Cerca città, paese o codice aeroporto…",
      empty: "Nessuna destinazione corrisponde alla ricerca.",
      showing: (shown: number, total: number) => `Mostrando ${shown} di ${total} destinazioni`,
      airports: (codes: string) => `Aeroporti: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Non ancora scelto come punto mediano"
          : count === 1
            ? "Scelto 1× come punto mediano"
            : `Scelto ${count}× come punto mediano`,
    },
    city: {
      back: "Tutte le destinazioni",
      pitch: (city: string) => `Incontro a ${city} — il punto mediano che funziona per tutti.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) è una delle destinazioni che midspot cerca quando un gruppo di amici o famiglia vuole incontrarsi. Ognuno parte dal proprio aeroporto; ordiniamo le destinazioni per quanto ravvicinati arrivano tutti, poi per prezzo — entro il vostro budget.`,
      airportsLabel: "Aeroporti serviti",
      statsLabel: "Volte scelto come punto mediano (ultimi 90 giorni)",
      statsEmpty: "Nessuna ricerca ancora — siate il primo gruppo a incontrarsi qui.",
      howTitle: "Come funziona",
      howSteps: [
        {
          title: "Aggiungi l'aeroporto di ciascuno",
          body: "2–8 viaggiatori, ognuno dalla propria città: cerchiamo prezzi reali dei voli da tutti.",
        },
        {
          title: "Date, notti e budget",
          body: "Date flessibili o un mese intero; un budget a persona che copre andata + ritorno.",
        },
        {
          title: "Classifichiamo i punti mediani",
          body: "Destinazioni ordinate per differenza di arrivo (tutti atterrano entro 24 h) e poi per prezzo totale.",
        },
      ],
      faqTitle: "Domande frequenti",
      // "{city}" viene sostituito con la città della pagina al render
      faqs: [
        {
          q: "Perché {city} è un buon punto mediano?",
          a: "{city} è raggiungibile con voli brevi e frequenti da tutta Europa, quindi i viaggiatori da città diverse arrivano spesso a poche ore di distanza — sovente a un prezzo totale basso. Avvia una ricerca e midspot la confronterà con tutte le altre opzioni.",
        },
        {
          q: "Prenoto i voli tramite midspot?",
          a: "No. midspot trova e ordina il punto mediano; la prenotazione avviene sul sito del partner (es. Kiwi.com) tramite un link di affiliazione, allo stesso prezzo per te.",
        },
        {
          q: "I prezzi sono reali?",
          a: "I prezzi arrivano dai dati sui voli in tempo reale al momento della ricerca e possono cambiare — il sito di prenotazione mostra sempre il prezzo finale.",
        },
      ],
      cta: "Trova il vostro punto mediano",
    },
  },
  blog: {
    meta: {
      title: "Blog",
      description:
        "Storie e note dal team di midspot — come encontramos il punto d'incontro per gruppi che volano da città diverse.",
    },
    title: "Storie dal centro",
    subtitle:
      "Note sugli incontri a metà strada: come funziona la ricerca, dove i gruppi si sono incontrati davvero e cosa impariamo dai dati di volo in tempo reale.",
    latest: "Ultimi articoli",
    empty: "Nessun articolo ancora — torna presto.",
    readingTime: (minutes: number) => `${minutes} min di lettura`,
    published: (date: string) => `Pubblicato il ${date}`,
    back: "Tutti gli articoli",
    prev: "Articolo più recente",
    next: "Articolo più vecchio",
    share: "Copia link",
    copied: "Link copiato!",
    copyFailed: "Copia non riuscita — seleziona l'indirizzo manualmente",
    rss: "Feed RSS",
  },
  stats: {
    title: "Statistiche del sito",
    subtitle: "Analitica propria di midspot, rispettosa della privacy — solo aggregati, mai IP.",
    secretLabel: "Chiave delle statistiche",
    secretPlaceholder: "Incolla la chiave delle statistiche",
    unlock: "Carica statistiche",
    loading: "Caricamento…",
    unauthorized:
      "Chiave errata o mancante (401). La chiave non è mai inclusa in questa pagina — chiedila al proprietario del sito.",
    error: "Impossibile caricare le statistiche.",
    retry: "Riprova",
    totals: { searches: "Ricerche", results: "Risultati", pageviews: "Visualizzazioni" },
    searchesChart: "Ricerche al giorno — ultimi 30 giorni",
    pageviewsChart: "Visualizzazioni al giorno — ultimi 30 giorni",
    popularRoutes: "Coppie di origini popolari — ultimi 30 giorni",
    providerUsage: "Utilizzo dei provider — mese corrente",
    table: {
      day: "Giorno",
      count: "Conteggio",
      total: "Totale",
      route: "Rotta",
      searches: "Ricerche",
      provider: "Provider",
      calls: "Chiamate",
      cap: "Limite mensile",
      pctUsed: "% del limite",
    },
    noData: "Nessun dato ancora.",
    cloudflareNote:
      "La dashboard di Cloudflare mostra anche il traffico edge (tutte le richieste che raggiungono il CDN, inclusi bot e asset in cache) — questa pagina mostra solo ciò che midspot stesso serve e salva nel proprio database.",
  },
  footer: {
    destinations: "Destinazioni",
    blog: "Blog",
    privacy: "Privacy",
    terms: "Termini",
    cookieSettings: "Impostazioni cookie",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Lingua",
  },
};
