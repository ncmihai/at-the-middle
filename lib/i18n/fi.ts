// Suomi — sama avainten rakenne kuin en.ts (lähde). Oikeudelliset sivut
// (privacy/terms) jätetään pois tästä kielestä; ne näytetään englanniksi.
import type { LangMessages } from "./en";

export const fi: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Tavataan puolivälissä",
    heroSubtitle:
      "Yksi määränpää, jokainen lentää kotoaan ja kaikki saapuvat vuorokauden sisällä toisistaan — budjetissanne.",
    heroPoints: [
      "2–8 matkustajaa, jokainen omasta kaupungistaan",
      "Joustavat matkapäivät — tai valitse koko kuukausi",
      "Järjestettynä saapumisvajeen ja sitten hinnan mukaan",
    ],
  },
  form: {
    title: "Suunnittele matka",
    originsLabel: "Mistä jokainen lentää?",
    originsHint: "2–8 kotikenttää, yksi matkustaja kukin",
    originPlaceholder: "Hae kaupunkia tai lentokenttää…",
    originSelectedPlaceholder: "Valitse lentokenttä",
    addOrigin: "Lisää matkustaja",
    removeOrigin: "Poista",
    maxOriginsReached: "Enintään 8 matkustajaa",
    minOriginsHint: "Vähintään 2 matkustajaa",
    locationButton: "Käytä sijaintiani",
    locationLocating: "Tunnistetaan sijaintia…",
    locationFailed: "Sijaintia ei voitu tunnistaa — valitse lentokenttä käsin",
    locationNoEmptyRow: "Kaikki matkustajapaikat ovat jo täynnä",
    autocomplete: {
      searching: "Haetaan lentokenttiä…",
      minChars: "Kirjoita vähintään 2 merkkiä…",
      empty: "Lentokenttiä ei löytynyt.",
    },
    datesLabel: "Matkan päivämäärät",
    datesPlaceholder: "Valitse lähtö ja paluu",
    datesHint: "Lähtö → paluu — öiden määrä lasketaan automaattisesti",
    flexLabel: "Lähdön joustavuus",
    flexDays: (days: number) =>
      days === 0 ? "±0 päivää (tarkka päivä)" : `±${days} ${days === 1 ? "päivä" : "päivää"}`,
    monthMode: "Koko kuukausi",
    monthLabel: "Kuukausi",
    monthHint: "Skannaamme koko kuukauden ja valitsemme automaattisesti halvimman 14 päivän jakson",
    nightsLabel: "Yöt",
    nightsHint: "1–30",
    nightsLabelMonth: "Yöt (valintasi mukaan)",
    nightsAutoHint: "Lasketaan automaattisesti matkapäivistäsi",
    monthSampling: (month: string) => `valitaan kuukauden ${month} halvimmat 14 päivää…`,
    fewerNights: "Vähemmän öitä",
    moreNights: "Enemmän öitä",
    budgetLabel: "Budjetti per henkilö",
    budgetHint: (cur: string) => `Kattaa meno- ja paluulennon, valuutassa ${cur}`,
    maxFlightLabel: "Maksimilentäaika (valinnainen)",
    maxFlightAny: "Mikä tahansa kesto",
    maxFlightHours: (h: number) => `Enintään ${h} h`,
    submit: "Etsi puolivälejä",
    submitting: "Aloitetaan haku…",
    errors: {
      originsRequired: "Valitse vähintään 2 kotikenttää",
      originsUnique: "Jokaisella matkustajalla pitää olla eri kotikenttä",
      datesRequired: "Valitse lähtö- ja paluupäivät",
      nightsRequired: "Valitse öiden määrä (1–30)",
      budgetRequired: (min: string, max: string) =>
        `Budjetin pitää olla ${min}–${max} per henkilö`,
      validationFailed: "Tarkista lomake — joissakin kentissä on virheitä",
      rateLimited: (retryAfterSeconds?: number) =>
        `Liian monta hakua — odota${retryAfterSeconds ? ` ${retryAfterSeconds} s` : " hetki"} ja yritä uudelleen`,
      generic: "Jokin meni pieleen. Yritä uudelleen.",
      network: "Palvelimeen ei saatu yhteyttä. Tarkista yhteys ja yritä uudelleen.",
    },
  },
  waiting: {
    title: "Etsitään puoliväliäsi…",
    subtitle:
      "Skannaamme lentoja jokaiselta kotikentältä kohdekohteisiin. Tämä kestää yleensä alle minuutin.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Vaihe ${done} / ${total}` : "Lämmitellään…",
    partialTitle: "Tähän mennessä löydetty",
    cancel: "Peruuta haku",
    cancelling: "Peruutetaan…",
    cancelDialogTitle: "Peruutetaanko tämä haku?",
    cancelDialogBody:
      "Haku pysähtyy, mutta jo löydetyt kohteet näkyvät edelleen alla.",
    cancelDialogConfirm: "Kyllä, peruuta",
    cancelDialogDismiss: "Jatka hakua",
  },
  history: {
    title: "Viimeisimmät haut",
    clear: "Tyhjennä",
    chipAria: (label: string) => `Avaa haku: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `Kuva: ${credit} · ${license} (Wikimedia Commons)`,
    title: "Puolivälipisteenne",
    subtitle: "Järjestettynä sen mukaan, kuinka lähekkäin kaikki saapuvat, sitten kokonaishinnan mukaan.",
    empty: "Mikään kohde ei vielä vastannut budjettiasi ja saapumisvajeen rajaa.",
    gapBadge: (text: string) => `Kaikki saapuvat ${text} sisällä`,
    gapRelaxed: (hours: number) =>
      `Ei osumia normaalin 24 h rajan sisällä — saapumisvaje levennettiin ${hours} tuntiin`,
    outbound: (date: string) => `Menolento · ${date}`,
    returnLeg: (date: string) => `Paluulento · ${date}`,
    perPersonTotal: "per henkilö",
    groupTotal: "Koko ryhmän yhteensä",
    bookOutbound: "Varaa menolento",
    bookReturn: "Varaa paluulento",
    stay: (city: string) => `Yövy kaupungissa ${city}`,
    stayNote: "Affiliate-linkki",
    extras: {
      title: "Lisät",
      transfer: "Lentokenttäkuljetus",
      car: "Autovuokra",
      esim: "eSIM",
      activities: "Aktiviteetit",
    },
    priceNote: "Hinnat ovat hakuhetkeltä — varaussivusto näyttää ajantasaisen hinnan.",
    share: "Kopioi jakolinkki",
    copied: "Jakolinkki kopioitu!",
    copyFailed: "Kopiointi ei onnistunut — valitse URL manuaalisesti",
    shareCard: "Lataa jakokortti",
    shareCardDownloaded: "Jakokortti ladattu — katso latauksistasi!",
    shareCardFailed: "Jakokorttia ei voitu luoda — yritä uudelleen",
    invite: "Kopioi kutsu",
    inviteCopied: "Kutsu kopioitu — liitä se ryhmäkeskusteluun!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `Nähdään kaupungissa ${city} (${country}), ${dep} → ${ret}! Löysimme lennot, joilla kaikki laskeutuvat ${gap} sisällä toisistaan: ${url}`,
    cancelledBanner: "Haku peruutettu — näytetään tähän mennessä löydetyt kohteet.",
    failedTitle: "Haku epäonnistui",
    failedRetry: "Aloita uusi haku etusivulta",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} ${n === 1 ? "yö" : "yötä"}`,
    usageLimited: "Kuukausittainen hakuraja saavutettu — näytetään vain välimuistissa olevat tulokset.",
    map: {
      title: "Kartta",
      origins: "Kotikentät",
      destinations: "Kohteet",
      airports: "Kaikki kohdekentät",
      tooltip: {
        gap: (text: string) => `saapuvat ${text} sisällä`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Koko ryhmän yhteensä",
        perPerson: "per henkilö",
      },
    },
    toolbar: {
      sortLabel: "Lajittelu",
      sortGap: "Lähimmät saapumiset",
      sortPrice: "Halvin hinta",
      sortDestination: "Kohde A–Ö",
      gapLabel: "Maks. saapumisvaje",
      gapAny: "Mikä tahansa",
      gapHours: (h: number) => `≤ ${h} h`,
      priceLabel: "Maks. hinta / henkilö",
      priceAny: "Mikä tahansa",
      showing: (shown: number, total: number) => `${shown} / ${total} näytetään`,
    },
    timeline: {
      title: "Saapumisten hajonta",
      arriveWithin: (text: string) => `saapuvat ${text} sisällä`,
    },
    relax: {
      title: "Ei vielä osumia",
      body: "Laajenna hakua ja suorita se uudelleen — toistuvat haut käyttävät välimuistissa olevia lentohintoja.",
      gap30: "Löysennä vaje 30 tuntiin",
      budget50: (amount: string) => `+${amount} budjetti`,
      days3: "+3 päivän ikkuna",
      running: "Aloitetaan uusi haku…",
    },
  },
  weather: {
    title: (city: string) => `Sää kaupungissa ${city} — seuraavat 7 päivää`,
    rain: (pct: number) => `sade ${pct} %`,
    source: "Ennuste: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "Selkeää",
      partlyCloudy: "Puolipilvistä",
      cloudy: "Pilvistä",
      fog: "Sumu",
      rain: "Sade",
      snow: "Lumisade",
      showers: "Kuurot",
      thunderstorm: "Ukkonen",
    },
  },
  hero: {
    title: (city: string, country: string) => `Paras puoliväli teille: ${city}, ${country}`,
    gap: (text: string) => `kaikki saapuvat ${text} sisällä`,
    from: (price: string) => `alkaen ${price} / henkilö`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "Näytä tämä vaihtoehto",
  },
  surprise: {
    button: "Yllätä minut",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ${gap} ero, ${total}`,
  },
  popular: {
    title: "Suosittuja puolivälipisteitä",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Ei vielä suosittuja kohteita",
  },
  ads: {
    label: "Sponsoroitu",
  },
  share: {
    pageTitle: "midspot-haku",
    loading: "Ladataan hakua…",
    notFoundTitle: "Tämä hakulinkki ei ole käytettävissä",
    notFoundBody:
      "Se on saattanut vanhentua (haut säilyvät 7 päivää) tai linkki on väärä.",
    backHome: "Takaisin midspotiin",
    errorPrefix: "Hakuvirhe: ",
  },
  notFound: {
    title: "Sivua ei löytynyt",
    body: "Etsimääsi sivua ei ole olemassa tai se on siirtynyt.",
    backHome: "Takaisin midspotiin",
  },
  common: {
    loading: "Ladataan…",
  },
  consent: {
    title: "Evästeet",
    body: "Käytämme välttämättömiä evästeitä kielesi ja tämän valintasi muistamiseen. Mainosevästeet (EthicalAds / CarbonAds) latautuvat vain, jos valitset ”Hyväksy kaikki”.",
    acceptAll: "Hyväksy kaikki",
    essentialOnly: "Vain välttämättömät",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `Kuva: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "Kohteet",
      indexDescription:
        "Selaa eurooppalaisia kaupunkeja, joita midspot voi hakea ryhmäsi puoliväliksi — järjestettynä sen mukaan, kuinka usein matkustajat ovat valinneet ne.",
      cityTitle: (city: string) => `Tapaa kaupungissa ${city}`,
      cityDescription: (city: string, country: string) =>
        `Tapaa kaupungissa ${city}, ${country} — katso, miksi se toimii puolivälinä ystäville ja perheille, jotka lentävät eri kaupungeista, ja löydä sitten oma puolivälipisteesi.`,
    },
    index: {
      eyebrow: "Kohteet",
      title: "Missä ryhmänne pitäisi tavata?",
      subtitle:
        "Jokainen alla oleva kaupunki on kohde, jota midspot voi hakea mahdollisena puolivälinä 2–8 matkustajalle, jotka lentävät eri kotikentiltä. Valitse yksi nähdäksesi, miksi se toimii — tai palaa takaisin ja anna haun löytää puolivälisi.",
      searchPlaceholder: "Hae kaupunkia, maata tai lentokenttäkoodia…",
      empty: "Mikään kohde ei vastaa hakuasi.",
      showing: (shown: number, total: number) => `Näytetään ${shown} / ${total} kohteesta`,
      airports: (codes: string) => `Lentokentät: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Ei vielä valittu puoliväliksi"
          : count === 1
            ? "Valittu kerran puoliväliksi"
            : `Valittu ${count}× puoliväliksi`,
    },
    city: {
      back: "Kaikki kohteet",
      pitch: (city: string) => `Tapaa kaupungissa ${city} — puoliväli, joka toimii kaikille.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) on yksi kohteista, joita midspot hakee, kun ystävä- tai perheryhmä haluaa tavata. Jokainen lentää omalta kotikentältään; järjestämme kohteet sen mukaan, kuinka lähekkäin kaikki saapuvat, sitten hinnan mukaan — budjetissanne.`,
      airportsLabel: "Palvellut lentokentät",
      statsLabel: "Kuinka monta kertaa valittu puoliväliksi (viimeiset 90 päivää)",
      statsEmpty: "Ei vielä hakuja — olkaa ensimmäinen ryhmä, joka tapaa täällä.",
      howTitle: "Näin se toimii",
      howSteps: [
        {
          title: "Lisää jokaisen kotikenttä",
          body: "2–8 matkustajaa, jokainen omasta kaupungistaan — haemme todellisia lentohintoja kaikilta.",
        },
        {
          title: "Aseta päivämäärät, yöt ja budjetti",
          body: "Joustavat päivämäärät tai koko kuukausi; budjetti per henkilö, joka kattaa menon ja paluun.",
        },
        {
          title: "Me järjestämme puolivälit",
          body: "Kohteet järjestetään saapumisvajeen mukaan (kaikki laskeutuvat alle 24 tunnin sisällä toisistaan), sitten kokonaishinnan mukaan.",
        },
      ],
      faqTitle: "Usein kysytyt kysymykset",
      // ”{city}” korvataan sivun kaupungilla näyttöhetkellä
      faqs: [
        {
          q: "Miksi {city} on hyvä puoliväli?",
          a: "{city} on saavutettavissa lyhyillä, tiheillä lennoilla kaikkialta Euroopasta, joten eri kaupungeista tulevat matkustajat saapuvat usein vain tunteja toisistaan — usein edulliseen kokonaishintaan. Suorita haku, niin midspot vertaa sitä kaikkiin muihin vaihtoehtoihin.",
        },
        {
          q: "Varanko lennot midspotin kautta?",
          a: "Ei. midspot löytää ja järjestää puolivälin; varaus tehdään kumppanisivustolla (esim. Kiwi.com) affiliate-linkin kautta, sinulle samaan hintaan.",
        },
        {
          q: "Ovatko hinnat todellisia?",
          a: "Hinnat tulevat reaaliaikaisesta lentodatasta hakuhetkellä ja voivat muuttua — varaussivusto näyttää aina lopullisen hinnan.",
        },
      ],
      cta: "Etsi oma puolivälisi",
    },
  },
  blog: {
    meta: {
      title: "Blogi",
      description:
        "Tarinoita ja muistiinpanoja midspot-tiimiltä — näin löydämme puolivälin eri kaupungeista lentäville ryhmille.",
    },
    title: "Tarinoita puolivälistä",
    subtitle:
      "Huomioita puolivälissä tapaamisesta: näin haku toimii, missä ryhmät todella tapasivat ja mitä opimme reaaliaikaisesta lentodatasta.",
    latest: "Uusimmat tarinat",
    empty: "Ei vielä kirjoituksia — palaa pian.",
    readingTime: (minutes: number) => `${minutes} min lukuaika`,
    published: (date: string) => `Julkaistu ${date}`,
    back: "Kaikki kirjoitukset",
    prev: "Uudempi kirjoitus",
    next: "Vanhempi kirjoitus",
    share: "Kopioi linkki",
    copied: "Linkki kopioitu!",
    copyFailed: "Kopiointi ei onnistunut — valitse URL manuaalisesti",
    rss: "RSS-syöte",
  },
  stats: {
    title: "Sivuston tilastot",
    subtitle: "midspotin oma tietosuojattu analytiikka — vain koosteita, ei koskaan IP-osoitteita.",
    secretLabel: "Tilastojen salaisuus",
    secretPlaceholder: "Liitä tilastojen salaisuus",
    unlock: "Lataa tilastot",
    loading: "Ladataan…",
    unauthorized:
      "Väärä tai puuttuva salaisuus (401). Salaisuutta ei sisällytetä tähän sivuun — kysy sivuston omistajalta.",
    error: "Tilastoja ei voitu ladata.",
    retry: "Yritä uudelleen",
    totals: { searches: "Haut", results: "Tulokset", pageviews: "Sivunäytöt" },
    searchesChart: "Haut päivässä — viimeiset 30 päivää",
    pageviewsChart: "Sivunäytöt päivässä — viimeiset 30 päivää",
    popularRoutes: "Suositut lähtöparit — viimeiset 30 päivää",
    providerUsage: "Palveluntarjoajien käyttö — kuluva kuukausi",
    table: {
      day: "Päivä",
      count: "Määrä",
      total: "Yhteensä",
      route: "Reitti",
      searches: "Haut",
      provider: "Palveluntarjoaja",
      calls: "Kutsut",
      cap: "Kuukausiraja",
      pctUsed: "% rajasta",
    },
    noData: "Ei vielä tietoja.",
    cloudflareNote:
      "Cloudflare-paneeli näyttää myös reunaliikenteen (kaikki CDN-reunaan tulleet pyynnöt, mukaan lukien botit ja välimuistissa olevat resurssit) — tämä sivu näyttää vain sen, mitä midspot itse palvelee ja tallentaa omaan tietokantaansa.",
  },
  footer: {
    destinations: "Kohteet",
    blog: "Blogi",
    privacy: "Tietosuoja",
    terms: "Ehdot",
    cookieSettings: "Evästeasetukset",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Kieli",
  },
  currency: {
    label: "Valuutta",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · EKP:n kurssi ${date}`,
  },
  theme: {
    label: "Teema",
    light: "Vaalea",
    dark: "Tumma",
    system: "Järjestelmä",
  },
};
