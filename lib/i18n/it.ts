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
      "Qualsiasi finestra di partenza fino a 14 giorni",
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
    datesLabel: "Finestra di partenza",
    datesPlaceholder: "Seleziona la finestra di partenza",
    datesHint: "Fino a 14 giorni di partenza — il ritorno è partenza + notti",
    nightsLabel: "Notti",
    nightsHint: "1–30",
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
      datesRequired: "Seleziona una finestra di partenza",
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
  results: {
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
    priceNote:
      "I prezzi sono di quando è stata fatta la ricerca — il sito di prenotazione mostra il prezzo in tempo reale.",
    share: "Copia link di condivisione",
    copied: "Link di condivisione copiato!",
    copyFailed: "Copia non riuscita — seleziona l'URL manualmente",
    cancelledBanner: "Ricerca annullata — mostriamo le destinazioni trovate finora.",
    failedTitle: "La ricerca è fallita",
    failedRetry: "Avvia una nuova ricerca dalla home",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} nott${n === 1 ? "e" : "i"}`,
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
  footer: {
    privacy: "Privacy",
    terms: "Termini",
    cookieSettings: "Impostazioni cookie",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Lingua",
  },
};
