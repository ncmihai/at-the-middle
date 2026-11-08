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
      "Date flexibile pentru călătorie — sau alege o întreagă lună",
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
    datesLabel: "Datele călătoriei",
    datesPlaceholder: "Selectează plecarea și întoarcerea",
    datesHint: "Plecare → întoarcere — numărul de nopți rezultă automat",
    flexLabel: "Flexibilitate plecare",
    flexDays: (days: number) =>
      days === 0 ? "±0 zile (dată exactă)" : `±${days} ${days === 1 ? "zi" : "zile"}`,
    monthMode: "Doar luna",
    monthLabel: "Luna",
    monthHint: "Scanăm întreaga lună și alegem automat cele mai ieftine 14 zile",
    nightsLabel: "Nopți",
    nightsHint: "1–30",
    nightsLabelMonth: "Nopți (la alegere)",
    nightsAutoHint: "Rezultă automat din datele călătoriei",
    monthSampling: (month: string) => `aleg cele mai ieftine 14 zile din luna ${month}…`,
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
      datesRequired: "Selectează plecarea și întoarcerea",
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
  history: {
    title: "Căutări recente",
    clear: "Șterge",
    chipAria: (label: string) => `Deschide căutarea: ${label}`,
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
    stay: (city: string) => `Cazare în ${city}`,
    stayNote: "Link afiliat",
    priceNote:
      "Prețurile sunt din momentul căutării — site-ul de rezervare arată prețul live.",
    share: "Copiază linkul de partajare",
    copied: "Link de partajare copiat!",
    copyFailed: "Nu am putut copia — selectează URL-ul manual",
    shareCard: "Descarcă cardul de partajare",
    shareCardDownloaded: "Card de partajare descărcat — îl găsești la descărcări!",
    shareCardFailed: "Nu am putut crea cardul de partajare — mai încearcă o dată",
    invite: "Copiază invitația",
    inviteCopied: "Invitație copiată — lipește-o în grupul vostru!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `Ne vedem în ${city} (${country}), ${dep} → ${ret}! Am găsit zboruri care ne fac să aterizăm la ${gap} diferență: ${url}`,
    cancelledBanner: "Căutare anulată — afișăm destinațiile găsite până acum.",
    failedTitle: "Căutarea a eșuat",
    failedRetry: "Pornește o căutare nouă de pe pagina principală",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} ${n === 1 ? "noapte" : "nopți"}`,
    usageLimited: "Limita lunară de căutări a fost atinsă — afișăm doar rezultate din cache.",
    map: {
      title: "Hartă",
      origins: "Aeroporturi de acasă",
      destinations: "Destinații",
      airports: "Toate aeroporturile candidate",
      tooltip: {
        gap: (text: string) => `toți sosesc în interval de ${text}`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Total pentru grup",
        perPerson: "per persoană",
      },
    },
    toolbar: {
      sortLabel: "Sortează după",
      sortGap: "Cele mai apropiate sosiri",
      sortPrice: "Preț total mai mic",
      sortDestination: "Destinație A–Z",
      gapLabel: "Diferență max. de sosire",
      gapAny: "Oricare",
      gapHours: (h: number) => `≤ ${h} h`,
      priceLabel: "Preț max. / persoană",
      priceAny: "Oricare",
      showing: (shown: number, total: number) => `${shown} din ${total} afișate`,
    },
    timeline: {
      title: "Împrăștierea sosirilor",
      arriveWithin: (text: string) => `ajung în ${text}`,
    },
    relax: {
      title: "Nicio potrivire încă",
      body: "Lărgește căutarea și ruleaz-o din nou — căutările repetate refolosesc prețurile din cache.",
      gap30: "Relaxează diferența la 30 h",
      budget50: "+50 € buget",
      days3: "+3 zile fereastră",
      running: "Pornim o căutare nouă…",
    },
  },
  hero: {
    title: (city: string, country: string) => `Cel mai bun mijloc pentru voi: ${city}, ${country}`,
    gap: (text: string) => `toată lumea ajunge în ${text}`,
    from: (price: string) => `de la ${price} / persoană`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "Vezi această opțiune",
  },
  surprise: {
    button: "Surprinde-mă",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — la ${gap} diferență, ${total}`,
  },
  popular: {
    title: "Destinații mijloc populare",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Încă nicio destinație populară",
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
  destinations: {
    meta: {
      indexTitle: "Destinații",
      indexDescription:
        "Parcurge orașele europene pe care midspot le poate căuta ca mijloc pentru grupul tău — sortate după cât de des le-au ales călătorii.",
      cityTitle: (city: string) => `Întâlnire în ${city}`,
      cityDescription: (city: string, country: string) =>
        `Întâlnire în ${city}, ${country} — vezi de ce funcționează ca mijloc pentru prieteni și familie care zboară din orașe diferite, apoi găsește-ți propriul mijloc.`,
    },
    index: {
      eyebrow: "Destinații",
      title: "Unde ar trebui să se întâlnească grupul tău?",
      subtitle:
        "Fiecare oraș de mai jos este o destinație pe care midspot o poate căuta ca posibil mijloc pentru 2–8 călători care zboară din diferite aeroporturi de acasă. Alege unul ca să vezi de ce funcționează — sau întoarce-te și lasă căutarea să-ți găsească mijlocul.",
      searchPlaceholder: "Caută oraș, țară sau cod de aeroport…",
      empty: "Nicio destinație nu corespunde căutării tale.",
      showing: (shown: number, total: number) => `Afișez ${shown} din ${total} destinații`,
      airports: (codes: string) => `Aeroporturi: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Încă neales ca mijloc"
          : count === 1
            ? "Ales o dată ca mijloc"
            : `Ales de ${count}× ca mijloc`,
    },
    city: {
      back: "Toate destinațiile",
      pitch: (city: string) => `Întâlnire în ${city} — mijlocul care funcționează pentru toată lumea.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) este una dintre destinațiile pe care midspot le caută când un grup de prieteni sau familie vrea să se întâlnească. Toată lumea zboară din propriul aeroport de acasă; sortăm destinațiile după cât de aproape sosesc toți, apoi după preț — în limita bugetului vostru.`,
      airportsLabel: "Aeroporturi deservite",
      statsLabel: "De câte ori ales ca mijloc (ultimele 90 de zile)",
      statsEmpty: "Încă nicio căutare — fiți primul grup care se întâlnește aici.",
      howTitle: "Cum funcționează",
      howSteps: [
        {
          title: "Adaugă aeroportul de acasă al fiecăruia",
          body: "2–8 călători, fiecare din orașul lui — căutăm prețuri reale de zboruri de la toate.",
        },
        {
          title: "Setează datele, nopțile și bugetul",
          body: "Date flexibile sau o lună întreagă; un buget pe persoană care acoperă dus + întors.",
        },
        {
          title: "Noi clasăm mijloacele",
          body: "Destinațiile sunt sortate după decalajul de sosire (toți aterizează la mai puțin de 24 h unul de celălalt), apoi după prețul total.",
        },
      ],
      faqTitle: "Întrebări frecvente",
      // „{city}” este înlocuit cu orașul paginii la afișare
      faqs: [
        {
          q: "De ce {city} este un mijloc bun?",
          a: "{city} este accesibil cu zboruri scurte și dese din toată Europa, așa că de obicei călătorii din orașe diferite sosesc la doar câteva ore unul de celălalt — adesea la un preț total mic. Rulează o căutare și midspot îl va compara cu toate celelalte opțiuni.",
        },
        {
          q: "Rezerv zborurile prin midspot?",
          a: "Nu. midspot găsește și sortează mijlocul; rezervarea se face pe site-ul partenerului (ex. Kiwi.com) printr-un link de afiliere, la același preț pentru tine.",
        },
        {
          q: "Prețurile sunt reale?",
          a: "Prețurile vin din date live de zboruri în momentul căutării și se pot schimba — site-ul de rezervare afișează întotdeauna prețul final.",
        },
      ],
      cta: "Găsește-ți mijlocul",
    },
  },
  footer: {
    destinations: "Destinații",
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
