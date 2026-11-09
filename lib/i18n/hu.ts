// Magyar — ugyanaz a kulcsstruktúra, mint az en.ts (forrás). A jogi oldalak
// (privacy/terms) egyelőre angolul maradnak (fallback), amíg le nem fordítják.
import type { InviteArgs, LangMessages } from "./en";

export const hu: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Találkozzatok félúton",
    heroSubtitle:
      "Mindenki otthonról repül, és egy harmadik úticélnál találkoztok — órákra egymástól, nem napokra. Rendezés érkezési különbség szerint először, aztán ár szerint — a keretetekben.",
    heroPoints: [
      "2–8 utazó, mindegyik a saját városából repül",
      "Az úticélnál találkoztok — nem egymás otthonában",
      "Érkezési különbség először (max. 24 óra), aztán ár",
      "Rugalmas dátumok — vagy válasszatok egy egész hónapot",
    ],
    heroExample:
      "Példa: te Bukarestből repülsz, egy barátod Berlinből → Barcelonában találkoztok, 2 óra különbséggel az érkezésben — nem 3 nap.",
  },
  form: {
    title: "Utazás tervezése",
    originsLabel: "Honnan repül mindenki?",
    originsHint: "2–8 induló repülőtér, utazónként egy",
    originPlaceholder: "Város vagy repülőtér keresése…",
    originSelectedPlaceholder: "Válassz egy repülőteret",
    addOrigin: "Utazó hozzáadása",
    removeOrigin: "Eltávolítás",
    maxOriginsReached: "Maximum 8 utazó",
    minOriginsHint: "Legalább 2 utazó",
    locationButton: "Saját hely használata",
    locationLocating: "Helyzet felismerése…",
    locationFailed: "Nem sikerült felismerni a helyzeted — válassz repülőteret kézzel",
    locationNoEmptyRow: "Minden utazói hely már foglalt",
    autocomplete: {
      searching: "Repülőterek keresése…",
      minChars: "Írj be legalább 2 karaktert…",
      empty: "Nem találtunk repülőteret.",
    },
    datesLabel: "Utazás dátumai",
    datesPlaceholder: "Válassz indulást és visszatérést",
    datesHint: "Indulás → visszatérés — az éjszakák száma automatikusan adódik",
    flexLabel: "Indulási rugalmasság",
    flexDays: (days: number) =>
      days === 0 ? "±0 nap (pontos dátum)" : `±${days} nap`,
    monthMode: "Egész hónap",
    monthLabel: "Hónap",
    monthHint: "Végigfutjuk az egész hónapot, és automatikusan kiválasztjuk a legolcsóbb 14 napos időszakot",
    nightsLabel: "Éjszakák",
    nightsHint: "1–30",
    nightsLabelMonth: "Éjszakák (saját választás)",
    nightsAutoHint: "Automatikusan adódik az utazás dátumaiból",
    monthSampling: (month: string) => `a(z) ${month} legolcsóbb 14 napjának kiválasztása…`,
    fewerNights: "Kevesebb éjszaka",
    moreNights: "Több éjszaka",
    budgetLabel: "Keret személyenként",
    budgetHint: (cur: string) => `Fedezi az oda- és visszautat, ${cur}-ban`,
    maxFlightLabel: "Max. repülési idő (opcionális)",
    maxFlightAny: "Bármennyi időtartam",
    maxFlightHours: (h: number) => `Legfeljebb ${h} óra`,
    submit: "Közepek keresése",
    submitting: "Keresés indítása…",
    errors: {
      originsRequired: "Válassz legalább 2 induló repülőteret",
      originsUnique: "Minden utazónak más induló repülőtere kell",
      datesRequired: "Válassz indulási és visszatérési dátumot",
      nightsRequired: "Válaszd ki, hány éjszaka (1–30)",
      budgetRequired: (min: string, max: string) =>
        `A keretnek ${min} és ${max} között kell lennie személyenként`,
      validationFailed: "Ellenőrizd az űrlapot — néhány mező érvénytelen",
      rateLimited: (retryAfterSeconds?: number) =>
        `Túl sok keresés — kérlek várj${retryAfterSeconds ? ` ${retryAfterSeconds} másodpercet` : " egy kicsit"} és próbáld újra`,
      generic: "Valami hiba történt. Próbáld újra.",
      network: "Nem sikerült elérni a szervert. Ellenőrizd a kapcsolatot, és próbáld újra.",
    },
  },
  waiting: {
    title: "Keressük a közepét…",
    subtitle:
      "Repülőjáratokat keresünk minden induló repülőtérről a jelölt úticélokra. Ez általában egy percnél kevesebb ideig tart.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `${done}. lépés a(z) ${total}-ból` : "Bemelegítés…",
    partialTitle: "Eddig megtalált",
    cancel: "Keresés megszakítása",
    cancelling: "Megszakítás…",
    cancelDialogTitle: "Megszakítod ezt a keresést?",
    cancelDialogBody:
      "A keresés leáll, de a már megtalált úticélok lent továbbra is láthatók maradnak.",
    cancelDialogConfirm: "Igen, megszakítás",
    cancelDialogDismiss: "Keresés folytatása",
  },
  history: {
    title: "Legutóbbi keresések",
    clear: "Törlés",
    chipAria: (label: string) => `Keresés megnyitása: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `Fotó: ${credit} · ${license} (Wikimedia Commons)`,
    title: "A közepeitek",
    subtitle: "Érkezési különbség szerint, majd összár szerint rendezve — hogy milyen közel érkezik mindenki egymáshoz.",
    empty: "Még egy úticél sem felel meg a keretednek és az érkezési különbség korlátjának.",
    gapBadge: (text: string) => `Mindenki ${text}-n belül érkezik`,
    gapRelaxed: (hours: number) =>
      `Nincs találat a szokásos 24 órán belül — az érkezési különbséget ${hours} órára bővítettük`,
    outbound: (date: string) => `Indulás · ${date}`,
    returnLeg: (date: string) => `Visszatérés · ${date}`,
    perPersonTotal: "személyenként",
    groupTotal: "Összesen a csoportnak",
    bookOutbound: "Indulás foglalása",
    bookReturn: "Visszatérés foglalása",
    stay: (city: string) => `Szállás: ${city}`,
    stayNote: "Partnerlink",
    // ADDITIVE (Faza 7): partneri „extra” gombok feliratai eredményenként
    extras: {
      title: "Extrák",
      transfer: "Reptéri transzfer",
      car: "Autóbérlés",
      esim: "eSIM",
      activities: "Programok",
    },
    priceNote: "Az árak a keresés pillanatából valók — a foglalási oldal az élő árat mutatja.",
    share: "Megosztási link másolása",
    copied: "Megosztási link kimásolva!",
    copyFailed: "Nem sikerült másolni — jelöld ki kézzel az URL-t",
    shareCard: "Megosztókártya letöltése",
    shareCardDownloaded: "Megosztókártya letöltve — nézd meg a letöltéseid között!",
    shareCardFailed: "Nem sikerült létrehozni a megosztókártyát — próbáld újra",
    invite: "Meghívó másolása",
    inviteCopied: "Meghívó kimásolva — illeszd be a csoportos csevegésbe!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }: InviteArgs) =>
      `Találkozzunk itt: ${city} (${country}), ${dep} → ${ret}! Olyan járatokat találtunk, amelyek mindenkit ${gap}-n belül érkeztetnek egymáshoz: ${url}`,
    cancelledBanner: "Keresés megszakítva — a már megtalált úticélokat mutatjuk.",
    failedTitle: "A keresés sikertelen",
    failedRetry: "Indíts új keresést a főoldalról",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} éjszaka`,
    usageLimited: "Elértük a havi keresési limitet — csak gyorsítótárazott eredményeket mutatunk.",
    map: {
      title: "Térkép",
      origins: "Induló repülőterek",
      destinations: "Úticélok",
      airports: "Összes jelölt repülőtér",
      tooltip: {
        gap: (text: string) => `érkezések ${text}-n belül`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Összesen a csoportnak",
        perPerson: "személyenként",
      },
    },
    toolbar: {
      sortLabel: "Rendezés",
      sortGap: "Legközelebbi érkezések",
      sortPrice: "Legalacsonyabb ár",
      sortDestination: "Úticél A–Z",
      gapLabel: "Max. érkezési különbség",
      gapAny: "Bármely",
      gapHours: (h: number) => `≤ ${h} óra`,
      priceLabel: "Max. ár / fő",
      priceAny: "Bármely",
      showing: (shown: number, total: number) => `${shown} / ${total} látható`,
    },
    timeline: {
      title: "Érkezések szórása",
      arriveWithin: (text: string) => `${text}-n belül érkeznek`,
    },
    relax: {
      title: "Még nincs találat",
      body: "Bővítsd a keresést és futtasd újra — az ismételt keresések újrahasznosítják a gyorsítótárazott repülőjegyárakat.",
      gap30: "Különbség bővítése 30 órára",
      budget50: (amount: string) => `+${amount} keret`,
      days3: "+3 napos időablak",
      running: "Új keresés indítása…",
    },
  },
  // ADDITIVE (Faza 8B): úticél időjárása (open-meteo) — sáv az eredménykártyán + widget a /destinations oldalon
  weather: {
    title: (city: string) => `Időjárás: ${city} — következő 7 nap`,
    rain: (pct: number) => `eső ${pct}%`,
    source: "Előrejelzés: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "Derült ég",
      partlyCloudy: "Részben felhős",
      cloudy: "Borult",
      fog: "Köd",
      rain: "Eső",
      snow: "Hó",
      showers: "Záporok",
      thunderstorm: "Vihar",
    },
  },
  hero: {
    title: (city: string, country: string) => `A legjobb közép neked: ${city}, ${country}`,
    gap: (text: string) => `mindenki ${text}-n belül érkezik`,
    from: (price: string) => `már ${price} / főtől`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "E lehetőség megtekintése",
  },
  surprise: {
    button: "Lepj meg",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ${gap} eltérés, ${total}`,
  },
  popular: {
    title: "Népszerű közepek",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Még nincsenek népszerű helyek",
  },
  ads: {
    label: "Szponzorált",
  },
  share: {
    pageTitle: "midspot keresés",
    loading: "Keresés betöltése…",
    notFoundTitle: "Ez a keresési link nem érhető el",
    notFoundBody:
      "Lehet, hogy lejárt (a keresések 7 napig őrződnek meg), vagy rossz a link.",
    backHome: "Vissza a midspothoz",
    errorPrefix: "Keresési hiba: ",
  },
  notFound: {
    title: "Az oldal nem található",
    body: "A keresett oldal nem létezik, vagy áthelyezték.",
    backHome: "Vissza a midspothoz",
  },
  common: {
    loading: "Betöltés…",
  },
  consent: {
    title: "Cookie-k",
    body: "Alapvető cookie-kat használunk, hogy megjegyezzük a nyelved és az itt hozott választásod. A hirdetési cookie-k (EthicalAds / CarbonAds) csak akkor töltődnek be, ha az „Összes elfogadása” lehetőséget választod.",
    acceptAll: "Összes elfogadása",
    essentialOnly: "Csak az alapvetők",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `Fotó: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "Úticélok",
      indexDescription:
        "Böngéssz az európai városok között, amelyeket a midspot a csoportod közepének kereshet — gyakoriság szerint rendezve, ahogy az utazók választották őket.",
      cityTitle: (city: string) => `Találkozó: ${city}`,
      cityDescription: (city: string, country: string) =>
        `Találkozó itt: ${city}, ${country} — tudd meg, miért működik közepként barátoknak és családoknak, akik különböző városokból repülnek, aztán találd meg a saját közepedet.`,
    },
    index: {
      eyebrow: "Úticélok",
      title: "Hol találkozzon a csoportotok?",
      subtitle:
        "Az alábbi városok mindegyike olyan úticél, amelyet a midspot lehetséges közepként kereshet 2–8 utazónak, akik különböző induló repülőterekről repülnek. Válassz egyet, hogy lásd, miért működik — vagy menj vissza, és hagyd, hogy a keresés megtalálja a közepeteket.",
      searchPlaceholder: "Város, ország vagy repülőtéri kód keresése…",
      empty: "Nincs a keresésnek megfelelő úticél.",
      showing: (shown: number, total: number) => `${shown} / ${total} úticél látható`,
      airports: (codes: string) => `Repülőterek: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Még nem választották közepként"
          : count === 1
            ? "Egyszer választották közepként"
            : `${count}× választották közepként`,
    },
    city: {
      back: "Összes úticél",
      pitch: (city: string) => `Találkozó itt: ${city} — a közép, ami mindenkinek jó.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) egyike azon úticéloknak, amelyeket a midspot keres, amikor baráti vagy családi társaság szeretne találkozni. Mindenki a saját induló repülőteréről repül; az úticélokat érkezési különbség szerint, majd ár szerint rangsoroljuk — a keretetekhez igazítva.`,
      airportsLabel: "Kiszolgált repülőterek",
      statsLabel: "Hányszor választották közepként (utolsó 90 nap)",
      statsEmpty: "Még nincs keresés — legyetek az első csoport, amely itt találkozik.",
      howTitle: "Hogyan működik",
      howSteps: [
        {
          title: "Add hozzá mindenki induló repülőterét",
          body: "2–8 utazó, mindegyik a saját városából — valódi repülőjegyárakat keresünk mindegyikből.",
        },
        {
          title: "Állítsd be a dátumokat, éjszakákat és keretet",
          body: "Rugalmas dátumok vagy egy egész hónap; személyenkénti keret, amely fedezi az oda- és visszautat.",
        },
        {
          title: "Rangsoroljuk a közepeket",
          body: "Az úticélok érkezési különbség szerint rendeződnek (mindenki 24 órán belül érkezik egymáshoz), majd összár szerint.",
        },
      ],
      faqTitle: "Gyakori kérdések",
      // A „{city}” az oldal városára cserélődik megjelenítéskor
      faqs: [
        {
          q: "Miért jó közép {city}?",
          a: "{city} rövid, gyakori járatokkal érhető el egész Európából, így a különböző városokból érkező utazók gyakran órákon belül érkeznek egymáshoz — alacsony összáron. Indíts egy keresést, és a midspot minden más lehetőséggel összehasonlítja.",
        },
        {
          q: "A midspoton keresztül foglalok járatot?",
          a: "Nem. A midspot megtalálja és rangsorolja a középpontot; a foglalás a partner oldalán (pl. Kiwi.com) történik partnerlinken keresztül, neked ugyanazon az áron.",
        },
        {
          q: "Valósak az árak?",
          a: "Az árak a keresés pillanatában érvényes élő repülési adatokból származnak, és változhatnak — a foglalási oldal mindig a végső árat mutatja.",
        },
      ],
      cta: "Találd meg a közepét",
    },
  },
  blog: {
    meta: {
      title: "Blog",
      description:
        "Történetek és jegyzetek a midspot csapatától — hogyan találjuk meg a középpontot különböző városokból repülő csoportoknak.",
    },
    title: "Történetek a középből",
    subtitle:
      "Jegyzetek a félúton való találkozásról: hogyan működik a keresés, hol találkoztak valójában a csoportok, és mit tanulunk az élő repülési adatokból.",
    latest: "Legfrissebb történetek",
    empty: "Még nincs bejegyzés — nézz vissza később.",
    readingTime: (minutes: number) => `${minutes} perc olvasás`,
    published: (date: string) => `Közzétéve: ${date}`,
    back: "Összes bejegyzés",
    prev: "Újabb bejegyzés",
    next: "Régebbi bejegyzés",
    share: "Link másolása",
    copied: "Link kimásolva!",
    copyFailed: "Nem sikerült másolni — jelöld ki kézzel a címet",
    rss: "RSS-hírcsatorna",
  },
  stats: {
    title: "Oldalstatisztika",
    subtitle: "A midspot saját, adatvédelmi szempontból biztonságos analitikája — csak összesített adatok, soha IP-címek.",
    secretLabel: "Statisztikai titok",
    secretPlaceholder: "Illeszd be a statisztikai titkot",
    unlock: "Statisztika betöltése",
    loading: "Betöltés…",
    unauthorized:
      "Rossz vagy hiányzó titok (401). A titok soha nem kerül bele ebbe az oldalba — kérdezd meg az oldal tulajdonosát.",
    error: "Nem sikerült betölteni a statisztikát.",
    retry: "Újrapróbálkozás",
    totals: { searches: "Keresések", results: "Eredmények", pageviews: "Oldalmegtekintések" },
    searchesChart: "Keresések naponta — utolsó 30 nap",
    pageviewsChart: "Oldalmegtekintések naponta — utolsó 30 nap",
    popularRoutes: "Népszerű induló párok — utolsó 30 nap",
    providerUsage: "Szolgáltató-használat — aktuális hónap",
    table: {
      day: "Nap",
      count: "Darab",
      total: "Összesen",
      route: "Útvonal",
      searches: "Keresések",
      provider: "Szolgáltató",
      calls: "Hívások",
      cap: "Havi limit",
      pctUsed: "A limit %-a",
    },
    noData: "Még nincs adat.",
    cloudflareNote:
      "A Cloudflare irányítópult az edge-forgalmat is mutatja (minden kérés, amely eléri a CDN-t, beleértve a botokat és a gyorsítótárazott erőforrásokat) — ez az oldal csak azt mutatja, amit maga a midspot szolgál ki és tárol a saját adatbázisában.",
  },
  footer: {
    destinations: "Úticélok",
    blog: "Blog",
    privacy: "Adatvédelem",
    terms: "Feltételek",
    cookieSettings: "Cookie-beállítások",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Nyelv",
  },
  currency: {
    label: "Pénznem",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · EKB árfolyam innen: ${date}`,
  },
  theme: {
    label: "Téma",
    light: "Világos",
    dark: "Sötét",
    system: "Rendszer",
  },
};
