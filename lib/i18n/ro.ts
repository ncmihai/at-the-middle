// Română — aceeași structură de chei ca en.ts (sursa de truth). Paginile legale
// (privacy/terms) sunt traduse doar în en + ro; celelalte limbi revin la engleză.
import type { LangMessages } from "./en";

export const ro: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Întâlnește-vă la mijloc",
    heroSubtitle:
      "O singură destinație, fiecare zboară din orașul lui și toți ajung la mai puțin de o zi unul de altul — în bugetul vostru.",
    heroPoints: [
      "2–8 călători, fiecare din orașul lui",
      "Orice fereastră de plecare de până la 14 zile",
      "Sortate după diferența de sosire, apoi după preț",
    ],
  },
  form: {
    title: "Planifică călătoria",
    originsLabel: "De unde zboară fiecare?",
    originsHint: "2–8 aeroporturi de acasă, câte un călător fiecare",
    originPlaceholder: "Caută oraș sau aeroport…",
    originSelectedPlaceholder: "Alege un aeroport",
    addOrigin: "Adaugă călător",
    removeOrigin: "Elimină",
    maxOriginsReached: "Maximum 8 călători",
    minOriginsHint: "Minimum 2 călători",
    locationButton: "Folosește locația mea",
    locationLocating: "Detectăm locația…",
    locationFailed: "Nu am putut detecta locația — alege aeroportul manual",
    locationNoEmptyRow: "Toate locurile de călători sunt deja ocupate",
    autocomplete: {
      searching: "Căutăm aeroporturi…",
      minChars: "Scrie cel puțin 2 caractere…",
      empty: "Niciun aeroport găsit.",
    },
    datesLabel: "Fereastra de plecare",
    datesPlaceholder: "Selectează fereastra de plecare",
    datesHint: "Până la 14 zile de plecare — returul e plecare + nopți",
    nightsLabel: "Nopți",
    nightsHint: "1–30",
    fewerNights: "Mai puține nopți",
    moreNights: "Mai multe nopți",
    budgetLabel: "Buget per persoană",
    budgetHint: "Acoperă zborul dus + întors, în EUR",
    maxFlightLabel: "Timp maxim de zbor (opțional)",
    maxFlightAny: "Orice durată",
    maxFlightHours: (h: number) => `Până la ${h} h`,
    submit: "Găsește locuri la mijloc",
    submitting: "Pornim căutarea…",
    errors: {
      originsRequired: "Alege cel puțin 2 aeroporturi de acasă",
      originsUnique: "Fiecare călător trebuie să aibă alt aeroport de acasă",
      datesRequired: "Selectează o fereastră de plecare",
      nightsRequired: "Alege câte nopți (1–30)",
      budgetRequired: "Bugetul trebuie să fie între 20 € și 5.000 € per persoană",
      validationFailed: "Verifică formularul — câteva câmpuri sunt invalide",
      rateLimited: (retryAfterSeconds?: number) =>
        `Prea multe căutări — așteaptă${retryAfterSeconds ? ` ${retryAfterSeconds} s` : " puțin"} și reîncearcă`,
      generic: "Ceva nu a mers. Încearcă din nou.",
      network: "Nu am putut contacta serverul. Verifică conexiunea și reîncearcă.",
    },
  },
  waiting: {
    title: "Căutăm mijlocul…",
    subtitle:
      "Scanăm zboruri de la fiecare aeroport de acasă către destinații candidate. De obicei durează sub un minut.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Pasul ${done} din ${total}` : "Pregătim…",
    partialTitle: "Găsite până acum",
    cancel: "Anulează căutarea",
    cancelling: "Se anulează…",
    cancelDialogTitle: "Anulezi această căutare?",
    cancelDialogBody:
      "Căutarea se oprește, dar destinațiile găsite până acum rămân vizibile mai jos.",
    cancelDialogConfirm: "Da, anulează",
    cancelDialogDismiss: "Continuă căutarea",
  },
  results: {
    title: "Destinațiile voastre la mijloc",
    subtitle: "Sortate după cât de aproape ajunge toată lumea, apoi după prețul total.",
    empty: "Nicio destinație nu s-a potrivit încă cu bugetul și limita de sosire.",
    gapBadge: (text: string) => `Toată lumea ajunge în ${text}`,
    gapRelaxed: (hours: number) =>
      `Nicio potrivire în limita standard de 24 h — diferența de sosire a fost lărgită la ${hours} h`,
    outbound: (date: string) => `Dus · ${date}`,
    returnLeg: (date: string) => `Întors · ${date}`,
    perPersonTotal: "per persoană",
    groupTotal: "Total pentru grup",
    bookOutbound: "Rezervă dus",
    bookReturn: "Rezervă întors",
    priceNote:
      "Prețurile sunt din momentul căutării — site-ul de rezervare arată prețul live.",
    share: "Copiază linkul de partajare",
    copied: "Link de partajare copiat!",
    copyFailed: "Nu am putut copia — selectează URL-ul manual",
    cancelledBanner: "Căutare anulată — afișăm destinațiile găsite până acum.",
    failedTitle: "Căutarea a eșuat",
    failedRetry: "Pornește o căutare nouă de pe pagina principală",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} ${n === 1 ? "noapte" : "nopți"}`,
  },
  ads: {
    label: "Sponsorizat",
  },
  share: {
    pageTitle: "căutare midspot",
    loading: "Se încarcă căutarea…",
    notFoundTitle: "Acest link de căutare nu este disponibil",
    notFoundBody:
      "S-ar putea să fi expirat (căutările se păstrează 7 zile) sau linkul e greșit.",
    backHome: "Înapoi la midspot",
    errorPrefix: "Eroare de căutare: ",
  },
  notFound: {
    title: "Pagina nu a fost găsită",
    body: "Pagina pe care o cauți nu există sau s-a mutat.",
    backHome: "Înapoi la midspot",
  },
  common: {
    loading: "Se încarcă…",
  },
  consent: {
    title: "Cookie-uri",
    body: "Folosim cookie-uri esențiale pentru limbă și pentru alegerea ta de aici. Cookie-urile de reclamă (EthicalAds / CarbonAds) se încarcă doar dacă alegi „Acceptă toate”.",
    acceptAll: "Acceptă toate",
    essentialOnly: "Doar esențiale",
  },
  footer: {
    privacy: "Confidențialitate",
    terms: "Termeni",
    cookieSettings: "Setări cookie-uri",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Limbă",
  },
  legal: {
    privacy: {
      title: "Politica de confidențialitate",
      updated: "Ultima actualizare: 2026-11-07",
      intro:
        "midspot („noi”) este un ajutor gratuit de căutare de zboruri care găsește destinații „la mijloc” pentru grupuri de călători. Acest document explică ce stocăm, ce cookie-uri folosim, ce terți sunt implicați și ce drepturi ai conform GDPR.",
      sections: [
        {
          heading: "1. Ce stocăm",
          body: [
            "Parametrii de căutare introduși (aeroporturile de acasă, fereastra de plecare, nopțile, bugetul) sunt salvați împreună cu căutarea, ca linkul de partajare (/r/…) să funcționeze. Căutările și rezultatele se șterg automat după 7 zile.",
            "Pentru protecție împotriva abuzurilor păstrăm doar un hash SHA-256 cu sare al adresei IP (searches.ip_hash). Nu stocăm niciodată adrese IP brute.",
            "Nu creăm conturi și nu îți cerem niciodată numele, adresa de email sau date de plată.",
          ],
        },
        {
          heading: "2. Cookie-uri și stocare locală",
          body: [
            "midspot-lang — limba aleasă de tine. Esențial, mereu activ.",
            "midspot-consent — alegerea ta („all” sau „essential”), păstrată în localStorage. Esențial, mereu activ.",
            "Cookie-urile de reclamă de la EthicalAds / CarbonAds sunt setate doar după ce apeși „Acceptă toate” în bannerul de consimțământ. Cu „Doar esențiale”, nu se încarcă niciun script de reclamă.",
          ],
        },
        {
          heading: "3. Terți",
          body: [
            "Travelpayouts Drive: scriptul Drive este mereu prezent în <head> deoarece verificarea de onboarding Travelpayouts îl cere (site-ul lor descarcă HTML-ul nostru și îl caută). Atributul data-cmp-ab lasă managerul lor de consimțământ să gestioneze cookie-urile lor. Este folosit pentru etichetarea automată a linkurilor afiliate.",
            "Rețele de reclamă (EthicalAds principal, CarbonAds rezervă): doar cu consimțământ „all”.",
            "Travelpayouts „whereami”: doar când apeși „Folosește locația mea”, IP-ul tău este trimis o singură dată către Travelpayouts pentru a rezolva cel mai apropiat aeroport (cod IATA, oraș, țară). Noi nu stocăm IP-ul; păstrăm doar aeroportul/orașul/țara în formular.",
            "Furnizori de date de zbor (ex. Kiwi/Tequila prin Travelpayouts, Duffel, SerpApi) primesc doar parametrii căutării (coduri IATA, date, buget) — niciodată IP-ul tău.",
          ],
        },
        {
          heading: "4. Linkuri afiliate și rezervări",
          body: [
            "Butoanele „Rezervă” deschid site-uri partenere (ex. Kiwi.com) prin linkuri afiliate Travelpayouts. Prețul pentru tine este exact același; comisionul ni-l plătește partenerul. Rezervarea se face pe site-ul partenerului, după termenii și politica lui de confidențialitate — noi nu vindem bilete și nu procesăm plăți.",
          ],
        },
        {
          heading: "5. Păstrarea datelor",
          body: [
            "Căutările și rezultatele se păstrează 7 zile (SEARCH_RETENTION_DAYS), apoi se șterg automat. Prețurile de zbor cache-uite se păstrează 30 de minute. Datele de referință despre aeroporturi se păstrează 30 de zile.",
          ],
        },
        {
          heading: "6. Drepturile tale (GDPR)",
          body: [
            "Ai dreptul de acces, rectificare, ștergere, restricționare a prelucrării, portabilitatea datelor și dreptul de opoziție, precum și dreptul de a depune o plângere la autoritatea de supraveghere (în România: ANSPDCP).",
            "Pentru a-ți exercita orice drept, trimite-ne un email — răspundem în 30 de zile.",
          ],
        },
        {
          heading: "7. Contact",
          body: ["privacy@midspot.ncmihai.dev — pentru orice întrebare legată de confidențialitate."],
        },
      ],
    },
    terms: {
      title: "Termeni și condiții",
      updated: "Ultima actualizare: 2026-11-07",
      intro:
        "Folosind midspot, ești de acord cu acești termeni. midspot este un ajutor gratuit care găsește destinații „la mijloc” pentru grupuri de călători. Nu vinde zboruri și nu este parte în nicio rezervare.",
      sections: [
        {
          heading: "1. Serviciul",
          body: [
            "midspot caută date publice de zbor și sugerează destinații unde un grup se poate întâlni, sortate după diferența de sosire și apoi după preț. Rezultatele sunt sugestii indicative, nu oferte.",
          ],
        },
        {
          heading: "2. Prețurile sunt indicative",
          body: [
            "Prețurile afișate sunt din momentul căutării și se pot schimba oricând. Prețul real este cel afișat pe site-ul de rezervare în momentul în care dai click.",
          ],
        },
        {
          heading: "3. Rezervarea se face pe site-urile partenere",
          body: [
            "Butonul „Rezervă” deschide un site partener (ex. Kiwi.com) printr-un link afiliat Travelpayouts. Contractul de transport este între tine și acel partener; se aplică termenii și politica lui. Noi nu suntem parte în el și nu îți gestionăm plata.",
          ],
        },
        {
          heading: "4. Fără garanții",
          body: [
            "Serviciul este oferit „ca atare” și „cum este disponibil”. Nu garantăm căutări mereu reușite, prețuri sau ore exacte, ori disponibilitate neîntreruptă. Datele de zbor vin de la furnizori terți și pot fi incomplete sau vechi.",
          ],
        },
        {
          heading: "5. Limitarea răspunderii",
          body: [
            "În măsura maximă permisă de lege, midspot și operatorul său nu răspund pentru daune indirecte, incidentale sau consecințiale, pierderi de profit sau decizii luate pe baza rezultatelor. Nimic din acești termeni nu limitează răspunderea care nu poate fi limitată prin lege (ex. culpă gravă sau intenție).",
          ],
        },
        {
          heading: "6. Utilizare corectă",
          body: [
            "Utilizarea automată sau excesivă este limitată (ex. maximum 5 căutări pe minut per IP). Linkurile de partajare sunt imposibil de ghicuit — te rugăm să nu încerci să le enumeri.",
          ],
        },
        {
          heading: "7. Modificări și contact",
          body: [
            "Putem actualiza acești termeni din când în când; data „ultimei actualizări” de mai sus se modifică în consecință. Întrebări: legal@midspot.ncmihai.dev.",
          ],
        },
      ],
    },
  },
};
