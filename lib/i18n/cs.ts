// Čeština — stejná struktura klíčů jako en.ts (zdroj pravdy). Právní stránky
// (privacy/terms) zde nejsou přeloženy; použije se angličtina.
import type { LangMessages } from "./en";

export const cs: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Sejděte se na půli cesty",
    heroSubtitle:
      "Každý letí z domova a vy se setkáte na třetí destinaci — přílet během hodin od sebe, ne dnů. Seřazeno podle rozdílu příletů, pak podle ceny, ve vašem rozpočtu.",
    heroPoints: [
      "2–8 cestovatelů, každý letí ze svého města",
      "Setkáte se v destinaci — ne u sebe doma",
      "Rozdíl příletů nejprve (max. 24 h), pak cena",
      "Flexibilní termíny — nebo vyberte celý měsíc",
    ],
    heroExample:
      "Příklad: ty letíš z Bukurešti, kamarád z Berlína → setkáte se v Barceloně, přílet s odstupem 2 h — ne 3 dny.",
  },
  form: {
    title: "Naplánujte cestu",
    originsLabel: "Odkud každý letí?",
    originsHint: "2–8 domovských letišť, jedno pro každého cestovatele",
    originPlaceholder: "Hledat město nebo letiště…",
    originSelectedPlaceholder: "Vyberte letiště",
    addOrigin: "Přidat cestovatele",
    removeOrigin: "Odebrat",
    maxOriginsReached: "Maximum 8 cestovatelů",
    minOriginsHint: "Alespoň 2 cestovatelé",
    locationButton: "Použít mou polohu",
    locationLocating: "Zjišťuji vaši polohu…",
    locationFailed: "Polohu se nepodařilo zjistit — vyberte letiště ručně",
    locationNoEmptyRow: "Všechna místa pro cestovatele jsou už obsazená",
    autocomplete: {
      searching: "Hledám letiště…",
      minChars: "Napište alespoň 2 znaky…",
      empty: "Nebyla nalezena žádná letiště.",
    },
    datesLabel: "Termín cesty",
    datesPlaceholder: "Vyberte odlet a návrat",
    datesHint: "Odlet → návrat — počet nocí se odvodí automaticky",
    flexLabel: "Flexibilita odletu",
    flexDays: (days: number) =>
      days === 0
        ? "±0 dní (přesné datum)"
        : `±${days} ${days === 1 ? "den" : days >= 2 && days <= 4 ? "dny" : "dní"}`,
    monthMode: "Celý měsíc",
    monthLabel: "Měsíc",
    monthHint: "Prohledáváme celý měsíc a automaticky vybereme nejlevnějších 14 dní",
    nightsLabel: "Noci",
    nightsHint: "1–30",
    nightsLabelMonth: "Noci (dle výběru)",
    nightsAutoHint: "Odvozeno automaticky z termínu cesty",
    monthSampling: (month: string) => `vybíráme nejlevnějších 14 dní v měsíci ${month}…`,
    fewerNights: "Méně nocí",
    moreNights: "Více nocí",
    budgetLabel: "Rozpočet na osobu",
    budgetHint: (cur: string) => `Pokrývá let tam i zpět, v ${cur}`,
    maxFlightLabel: "Max. doba letu (volitelné)",
    maxFlightAny: "Libovolná délka",
    maxFlightHours: (h: number) => `Do ${h} h`,
    submit: "Najít místa na půli cesty",
    submitting: "Spouštím vyhledávání…",
    errors: {
      originsRequired: "Vyberte alespoň 2 domovská letiště",
      originsUnique: "Každý cestovatel potřebuje jiné domovské letiště",
      datesRequired: "Vyberte termín odletu a návratu",
      nightsRequired: "Vyberte počet nocí (1–30)",
      budgetRequired: (min: string, max: string) =>
        `Rozpočet musí být mezi ${min} a ${max} na osobu`,
      validationFailed: "Zkontrolujte formulář — některá pole jsou neplatná",
      rateLimited: (retryAfterSeconds?: number) =>
        `Příliš mnoho vyhledávání — počkejte${retryAfterSeconds ? ` ${retryAfterSeconds} s` : " chvíli"} a zkuste to znovu`,
      generic: "Něco se pokazilo. Zkuste to prosím znovu.",
      network: "Server je nedostupný. Zkontrolujte připojení a zkuste to znovu.",
    },
  },
  waiting: {
    title: "Hledáme vaši půli cesty…",
    subtitle:
      "Prohledáváme lety ze všech domovských letišť do kandidátských destinací. Obvykle to trvá méně než minutu.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Krok ${done} z ${total}` : "Zahřívání…",
    partialTitle: "Zatím nalezeno",
    cancel: "Zrušit vyhledávání",
    cancelling: "Rušení…",
    cancelDialogTitle: "Zrušit toto vyhledávání?",
    cancelDialogBody:
      "Vyhledávání se zastaví, ale již nalezené destinace zůstanou viditelné níže.",
    cancelDialogConfirm: "Ano, zrušit",
    cancelDialogDismiss: "Pokračovat ve vyhledávání",
  },
  history: {
    title: "Nedávná vyhledávání",
    clear: "Vymazat",
    chipAria: (label: string) => `Otevřít vyhledávání: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    title: "Vaše místa na půli cesty",
    subtitle: "Seřazeno podle toho, jak blízko u sebe všichni přiletí, poté podle celkové ceny.",
    empty: "Zatím žádná destinace neodpovídá vašemu rozpočtu a limitu rozdílu příletů.",
    gapBadge: (text: string) => `Všichni přiletí do ${text} od sebe`,
    gapRelaxed: (hours: number) =>
      `Žádná shoda ve standardním limitu 24 h — rozdíl příletů byl rozšířen na ${hours} h`,
    outbound: (date: string) => `Odlet · ${date}`,
    returnLeg: (date: string) => `Návrat · ${date}`,
    perPersonTotal: "na osobu",
    groupTotal: "Celkem pro skupinu",
    bookOutbound: "Rezervovat odlet",
    bookReturn: "Rezervovat návrat",
    stay: (city: string) => `Ubytování v ${city}`,
    stayNote: "Affiliate odkaz",
    extras: {
      title: "Doplňkové služby",
      transfer: "Transfer z letiště",
      car: "Půjčovna aut",
      esim: "eSIM",
      activities: "Aktivity",
    },
    priceNote: "Ceny jsou z okamžiku vyhledávání — rezervační server ukazuje aktuální cenu.",
    share: "Kopírovat odkaz pro sdílení",
    copied: "Odkaz pro sdílení zkopírován!",
    copyFailed: "Kopírování se nezdařilo — vyberte adresu URL ručně",
    shareCard: "Stáhnout kartu pro sdílení",
    shareCardDownloaded: "Karta pro sdílení stažena — najdete ji ve stahování!",
    shareCardFailed: "Kartu pro sdílení se nepodařilo vytvořit — zkuste to prosím znovu",
    invite: "Kopírovat pozvánku",
    inviteCopied: "Pozvánka zkopírována — vložte ji do skupinového chatu!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `Sejděme se v ${city} (${country}), ${dep} → ${ret}! Našli jsme lety, díky kterým všichni přiletí do ${gap} od sebe: ${url}`,
    cancelledBanner: "Vyhledávání zrušeno — zobrazujeme zatím nalezené destinace.",
    failedTitle: "Vyhledávání selhalo",
    failedRetry: "Spusťte nové vyhledávání z úvodní stránky",
    rank: (n: number) => `#${n}`,
    nights: (n: number) =>
      `${n} ${n === 1 ? "noc" : n >= 2 && n <= 4 ? "noci" : "nocí"}`,
    usageLimited: "Měsíční limit vyhledávání byl dosažen — zobrazují se pouze výsledky z mezipaměti.",
    map: {
      title: "Mapa",
      origins: "Domovská letiště",
      destinations: "Destinace",
      airports: "Všechna kandidátská letiště",
      tooltip: {
        gap: (text: string) => `přílety do ${text} od sebe`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Celkem pro skupinu",
        perPerson: "na osobu",
      },
    },
    toolbar: {
      sortLabel: "Řadit podle",
      sortGap: "Nejbližší přílety",
      sortPrice: "Nejnižší cena",
      sortDestination: "Destinace A–Z",
      gapLabel: "Max. rozdíl příletů",
      gapAny: "Libovolný",
      gapHours: (h: number) => `≤ ${h} h`,
      priceLabel: "Max. cena / osoba",
      priceAny: "Libovolná",
      showing: (shown: number, total: number) => `Zobrazeno ${shown} z ${total}`,
    },
    timeline: {
      title: "Rozptyl příletů",
      arriveWithin: (text: string) => `přiletí do ${text} od sebe`,
    },
    relax: {
      title: "Zatím žádné shody",
      body: "Rozšiřte vyhledávání a spusťte ho znovu — opakovaná vyhledávání znovu používají ceny letů z mezipaměti.",
      gap30: "Rozšířit rozdíl na 30 h",
      budget50: (amount: string) => `+${amount} rozpočtu`,
      days3: "+3 dny okno",
      running: "Spouštím nové vyhledávání…",
    },
  },
  weather: {
    title: (city: string) => `Počasí v ${city} — příštích 7 dní`,
    rain: (pct: number) => `déšť ${pct} %`,
    source: "Předpověď: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "Jasná obloha",
      partlyCloudy: "Polojasno",
      cloudy: "Zataženo",
      fog: "Mlha",
      rain: "Déšť",
      snow: "Sníh",
      showers: "Přeháňky",
      thunderstorm: "Bouřka",
    },
  },
  hero: {
    title: (city: string, country: string) => `Nejlepší půli cesty pro vás: ${city}, ${country}`,
    gap: (text: string) => `všichni přiletí do ${text} od sebe`,
    from: (price: string) => `od ${price} / osoba`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "Zobrazit tuto možnost",
  },
  surprise: {
    button: "Překvap mě",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ${gap} od sebe, ${total}`,
  },
  popular: {
    title: "Oblíbená místa na půli cesty",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Zatím žádná oblíbená místa",
  },
  ads: {
    label: "Sponzorováno",
  },
  share: {
    pageTitle: "vyhledávání midspot",
    loading: "Načítání vyhledávání…",
    notFoundTitle: "Tento odkaz na vyhledávání není dostupný",
    notFoundBody:
      "Možná vypršel (vyhledávání se uchovávají 7 dní) nebo je odkaz špatný.",
    backHome: "Zpět na midspot",
    errorPrefix: "Chyba vyhledávání: ",
  },
  notFound: {
    title: "Stránka nenalezena",
    body: "Stránka, kterou hledáte, neexistuje nebo byla přesunuta.",
    backHome: "Zpět na midspot",
  },
  common: {
    loading: "Načítání…",
  },
  consent: {
    title: "Soubory cookie",
    body: "Používáme nezbytné soubory cookie k zapamatování vašeho jazyka a vašeho rozhodnutí zde. Reklamní soubory cookie (EthicalAds / CarbonAds) se načtou jen tehdy, když zvolíte „Přijmout vše“.",
    acceptAll: "Přijmout vše",
    essentialOnly: "Pouze nezbytné",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "Destinace",
      indexDescription:
        "Procházejte evropská města, která midspot může prohledat jako půli cesty pro vaši skupinu — seřazená podle toho, jak často si je cestovatelé vybírají.",
      cityTitle: (city: string) => `Setkání v ${city}`,
      cityDescription: (city: string, country: string) =>
        `Setkání v ${city}, ${country} — podívejte se, proč funguje jako půli cesty pro přátele a rodinu létající z různých měst, a pak najděte vlastní půli cesty.`,
    },
    index: {
      eyebrow: "Destinace",
      title: "Kde by se měla sejít vaše skupina?",
      subtitle:
        "Každé město níže je destinace, kterou midspot může prohledat jako možnou půli cesty pro 2–8 cestovatelů letících z různých domovských letišť. Vyberte jedno, abyste viděli, proč funguje — nebo se vraťte a nechte vyhledávání najít vaši půli cesty.",
      searchPlaceholder: "Hledat město, zemi nebo kód letiště…",
      empty: "Žádné destinace neodpovídají vašemu hledání.",
      showing: (shown: number, total: number) => `Zobrazuji ${shown} z ${total} destinací`,
      airports: (codes: string) => `Letiště: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Zatím nevybráno jako půli cesty"
          : count === 1
            ? "Jednou vybráno jako půli cesty"
            : `Vybráno ${count}× jako půli cesty`,
    },
    city: {
      back: "Všechny destinace",
      pitch: (city: string) => `Setkání v ${city} — půli cesty, která funguje pro všechny.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) je jedna z destinací, které midspot prohledává, když se skupina přátel nebo rodina chce sejít. Každý letí ze svého domovského letiště; destinace řadíme podle toho, jak blízko u sebe všichni přiletí, pak podle ceny — ve vašem rozpočtu.`,
      airportsLabel: "Obsluhovaná letiště",
      statsLabel: "Počet výběrů jako půli cesty (posledních 90 dní)",
      statsEmpty: "Zatím žádná vyhledávání — buďte první skupina, která se zde sejde.",
      howTitle: "Jak to funguje",
      howSteps: [
        {
          title: "Přidejte domovské letiště každého",
          body: "2–8 cestovatelů, každý ze svého města — hledáme reálné ceny letů ze všech.",
        },
        {
          title: "Nastavte termíny, noci a rozpočet",
          body: "Flexibilní termíny nebo celý měsíc; rozpočet na osobu pokrývající let tam i zpět.",
        },
        {
          title: "My seřadíme půli cesty",
          body: "Destinace jsou seřazeny podle rozdílu příletů (všichni přiletí do 24 h od sebe), pak podle celkové ceny.",
        },
      ],
      faqTitle: "Často kladené otázky",
      // „{city}“ se při zobrazení nahradí městem stránky
      faqs: [
        {
          q: "Proč je {city} dobrá půli cesty?",
          a: "{city} je dostupné krátkými a častými lety z celé Evropy, takže cestovatelé z různých měst často přilétají jen pár hodin po sobě — za nízkou celkovou cenu. Spusťte vyhledávání a midspot ji porovná se všemi ostatními možnostmi.",
        },
        {
          q: "Rezervuji lety přes midspot?",
          a: "Ne. midspot najde a seřadí půli cesty; rezervace probíhá na webu partnera (např. Kiwi.com) přes affiliate odkaz, za stejnou cenu pro vás.",
        },
        {
          q: "Jsou ceny reálné?",
          a: "Ceny pocházejí z živých dat o letech v okamžiku vyhledávání a mohou se měnit — rezervační web vždy zobrazuje konečnou cenu.",
        },
      ],
      cta: "Najděte svou půli cesty",
    },
  },
  blog: {
    meta: {
      title: "Blog",
      description:
        "Příběhy a poznámky týmu midspot — jak nacházíme půli cesty pro skupiny cestovatelů letících z různých měst.",
    },
    title: "Příběhy z půli cesty",
    subtitle:
      "Poznámky o setkávání na půli cesty: jak vyhledávání funguje, kde se skupiny skutečně sešly a co se učíme z živých dat o letech.",
    latest: "Nejnovější příběhy",
    empty: "Zatím žádné příspěvky — vraťte se brzy.",
    readingTime: (minutes: number) => `${minutes} min čtení`,
    published: (date: string) => `Publikováno ${date}`,
    back: "Všechny příspěvky",
    prev: "Novější příspěvek",
    next: "Starší příspěvek",
    share: "Kopírovat odkaz",
    copied: "Odkaz zkopírován!",
    copyFailed: "Kopírování se nezdařilo — vyberte adresu URL ručně",
    rss: "RSS kanál",
  },
  stats: {
    title: "Statistiky webu",
    subtitle: "Vlastní analytika midspot šetrná k soukromí — pouze agregáty, nikdy IP adresy.",
    secretLabel: "Tajný kód statistik",
    secretPlaceholder: "Vložte tajný kód statistik",
    unlock: "Načíst statistiky",
    loading: "Načítání…",
    unauthorized:
      "Špatný nebo chybějící kód (401). Kód nikdy není součástí této stránky — požádejte o něj vlastníka webu.",
    error: "Statistiky se nepodařilo načíst.",
    retry: "Zkusit znovu",
    totals: { searches: "Vyhledávání", results: "Výsledky", pageviews: "Zobrazení" },
    searchesChart: "Vyhledávání za den — posledních 30 dní",
    pageviewsChart: "Zobrazení za den — posledních 30 dní",
    popularRoutes: "Oblíbené dvojice výchozích letišť — posledních 30 dní",
    providerUsage: "Využití poskytovatelů — aktuální měsíc",
    table: {
      day: "Den",
      count: "Počet",
      total: "Celkem",
      route: "Trasa",
      searches: "Vyhledávání",
      provider: "Poskytovatel",
      calls: "Volání",
      cap: "Měsíční limit",
      pctUsed: "% limitu",
    },
    noData: "Zatím žádná data.",
    cloudflareNote:
      "Panel Cloudflare také ukazuje provoz na hraně sítě (všechny požadavky přicházející do CDN, včetně botů a uložených zdrojů) — tato stránka ukazuje jen to, co sám midspot poskytuje a ukládá ve své vlastní databázi.",
  },
  footer: {
    destinations: "Destinace",
    blog: "Blog",
    privacy: "Soukromí",
    terms: "Podmínky",
    cookieSettings: "Nastavení souborů cookie",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Jazyk",
  },
  currency: {
    label: "Měna",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · kurz ECB ze dne ${date}`,
  },
  theme: {
    label: "Motiv",
    light: "Světlý",
    dark: "Tmavý",
    system: "Systémový",
  },
};
