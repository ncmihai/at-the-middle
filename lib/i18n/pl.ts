// Polski — ta sama struktura kluczy co en.ts (źródło prawdy). Strony prawne
// (privacy/terms) nie są tu przetłumaczone; obowiązuje wersja angielska.
import type { LangMessages } from "./en";

export const pl: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Spotkajcie się w połowie drogi",
    heroSubtitle:
      "Każdy leci z domu, a Wy spotykacie się w trzecim miejscu docelowym — przylatując w ciągu godzin od siebie, nie dni. Sortowane najpierw według różnicy przylotów, potem według ceny, w Waszym budżecie.",
    heroPoints: [
      "2–8 podróżnych, każdy lecący ze swojego miasta",
      "Spotykacie się w miejscu docelowym — nie u siebie w domach",
      "Najpierw różnica przylotów (maks. 24 h), potem cena",
      "Elastyczne daty — albo wybierzcie cały miesiąc",
    ],
    heroExample:
      "Przykład: ty lecisz z Bukaresztu, znajomy z Berlina → spotykacie się w Barcelonie, przylatując z różnicą 2 h — nie 3 dni.",
  },
  form: {
    title: "Zaplanuj podróż",
    originsLabel: "Skąd każdy wylatuje?",
    originsHint: "2–8 lotnisk macierzystych, po jednym podróżnym",
    originPlaceholder: "Szukaj miasta lub lotniska…",
    originSelectedPlaceholder: "Wybierz lotnisko",
    addOrigin: "Dodaj podróżnego",
    removeOrigin: "Usuń",
    maxOriginsReached: "Maksymalnie 8 podróżnych",
    minOriginsHint: "Co najmniej 2 podróżnych",
    locationButton: "Użyj mojej lokalizacji",
    locationLocating: "Wykrywam Twoją lokalizację…",
    locationFailed: "Nie udało się wykryć lokalizacji — wybierz lotnisko ręcznie",
    locationNoEmptyRow: "Wszystkie miejsca dla podróżnych są już zajęte",
    autocomplete: {
      searching: "Szukam lotnisk…",
      minChars: "Wpisz co najmniej 2 znaki…",
      empty: "Nie znaleziono lotnisk.",
    },
    datesLabel: "Daty podróży",
    datesPlaceholder: "Wybierz wyjazd i powrót",
    datesHint: "Wyjazd → powrót — liczba nocy jest wyliczana automatycznie",
    flexLabel: "Elastyczność wyjazdu",
    flexDays: (days: number) =>
      days === 0 ? "±0 dni (dokładna data)" : `±${days} ${days === 1 ? "dzień" : "dni"}`,
    monthMode: "Cały miesiąc",
    monthLabel: "Miesiąc",
    monthHint: "Przeszukujemy cały miesiąc i automatycznie wybieramy najtańszy okres 14 dni",
    nightsLabel: "Noce",
    nightsHint: "1–30",
    nightsLabelMonth: "Noce (do wyboru)",
    nightsAutoHint: "Wyliczane automatycznie na podstawie dat podróży",
    monthSampling: (month: string) => `wybieramy najtańsze 14 dni miesiąca ${month}…`,
    fewerNights: "Mniej nocy",
    moreNights: "Więcej nocy",
    budgetLabel: "Budżet na osobę",
    budgetHint: (cur: string) => `Obejmuje lot w obie strony, w ${cur}`,
    maxFlightLabel: "Maks. czas lotu (opcjonalnie)",
    maxFlightAny: "Dowolny czas",
    maxFlightHours: (h: number) => `Do ${h} h`,
    submit: "Znajdź miejsca pośrodku",
    submitting: "Rozpoczynam wyszukiwanie…",
    errors: {
      originsRequired: "Wybierz co najmniej 2 lotniska macierzyste",
      originsUnique: "Każdy podróżny musi mieć inne lotnisko macierzyste",
      datesRequired: "Wybierz daty wyjazdu i powrotu",
      nightsRequired: "Wybierz liczbę nocy (1–30)",
      budgetRequired: (min: string, max: string) =>
        `Budżet musi wynosić od ${min} do ${max} na osobę`,
      validationFailed: "Sprawdź formularz — niektóre pola są nieprawidłowe",
      rateLimited: (retryAfterSeconds?: number) =>
        `Za dużo wyszukiwań — poczekaj${retryAfterSeconds ? ` ${retryAfterSeconds} s` : " chwilę"} i spróbuj ponownie`,
      generic: "Coś poszło nie tak. Spróbuj ponownie.",
      network: "Nie można połączyć się z serwerem. Sprawdź połączenie i spróbuj ponownie.",
    },
  },
  waiting: {
    title: "Szukamy Waszego miejsca pośrodku…",
    subtitle:
      "Przeszukujemy loty z każdego lotniska macierzystego do kandydujących celów. Zwykle zajmuje to mniej niż minutę.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Krok ${done} z ${total}` : "Rozgrzewka…",
    partialTitle: "Dotychczas znalezione",
    cancel: "Anuluj wyszukiwanie",
    cancelling: "Anulowanie…",
    cancelDialogTitle: "Anulować to wyszukiwanie?",
    cancelDialogBody:
      "Wyszukiwanie zostanie zatrzymane, ale znalezione już miejsca pozostaną widoczne poniżej.",
    cancelDialogConfirm: "Tak, anuluj",
    cancelDialogDismiss: "Kontynuuj wyszukiwanie",
  },
  history: {
    title: "Ostatnie wyszukiwania",
    clear: "Wyczyść",
    chipAria: (label: string) => `Otwórz wyszukiwanie: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `Zdjęcie: ${credit} · ${license} (Wikimedia Commons)`,
    title: "Wasze miejsca pośrodku",
    subtitle: "Sortowane według tego, jak blisko siebie wszyscy przylatują, a następnie według całkowitej ceny.",
    empty: "Brak jeszcze celów pasujących do budżetu i limitu różnicy przylotów.",
    gapBadge: (text: string) => `Wszyscy przylatują w odstępie ${text}`,
    gapRelaxed: (hours: number) =>
      `Brak wyników w standardowym limicie 24 h — limit różnicy przylotów został zwiększony do ${hours} h`,
    outbound: (date: string) => `Wylot · ${date}`,
    returnLeg: (date: string) => `Powrót · ${date}`,
    perPersonTotal: "na osobę",
    groupTotal: "Razem dla grupy",
    bookOutbound: "Rezerwuj wylot",
    bookReturn: "Rezerwuj powrót",
    stay: (city: string) => `Nocleg w ${city}`,
    stayNote: "Link afiliacyjny",
    extras: {
      title: "Dodatki",
      transfer: "Transfer z lotniska",
      car: "Wynajem samochodu",
      esim: "eSIM",
      activities: "Atrakcje",
    },
    priceNote: "Ceny są z momentu wyszukiwania — strona rezerwacji pokazuje aktualną cenę.",
    share: "Kopiuj link do udostępnienia",
    copied: "Link do udostępnienia skopiowany!",
    copyFailed: "Nie udało się skopiować — zaznacz adres URL ręcznie",
    shareCard: "Pobierz kartę udostępniania",
    shareCardDownloaded: "Karta udostępniania pobrana — sprawdź pobrane!",
    shareCardFailed: "Nie udało się utworzyć karty udostępniania — spróbuj ponownie",
    invite: "Kopiuj zaproszenie",
    inviteCopied: "Zaproszenie skopiowane — wklej je na czacie grupowym!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `Spotkajmy się w ${city} (${country}), ${dep} → ${ret}! Znaleźliśmy loty, dzięki którym wszyscy lądują w odstępie ${gap} od siebie: ${url}`,
    cancelledBanner: "Wyszukiwanie anulowane — pokazujemy dotychczas znalezione cele.",
    failedTitle: "Wyszukiwanie nie powiodło się",
    failedRetry: "Rozpocznij nowe wyszukiwanie ze strony głównej",
    rank: (n: number) => `#${n}`,
    nights: (n: number) =>
      `${n} ${n === 1 ? "noc" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "noce" : "nocy"}`,
    usageLimited: "Osiągnięto miesięczny limit wyszukiwań — pokazujemy tylko wyniki z pamięci podręcznej.",
    map: {
      title: "Mapa",
      origins: "Lotniska macierzyste",
      destinations: "Cele",
      airports: "Wszystkie lotniska kandydujące",
      tooltip: {
        gap: (text: string) => `przyloty w odstępie ${text}`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Razem dla grupy",
        perPerson: "na osobę",
      },
    },
    toolbar: {
      sortLabel: "Sortuj według",
      sortGap: "Najbliższe przyloty",
      sortPrice: "Najniższa cena",
      sortDestination: "Cel A–Z",
      gapLabel: "Maks. różnica przylotów",
      gapAny: "Dowolna",
      gapHours: (h: number) => `≤ ${h} h`,
      priceLabel: "Maks. cena / osoba",
      priceAny: "Dowolna",
      showing: (shown: number, total: number) => `Pokazano ${shown} z ${total}`,
    },
    timeline: {
      title: "Rozpiętość przylotów",
      arriveWithin: (text: string) => `przylatują w odstępie ${text}`,
    },
    relax: {
      title: "Brak wyników",
      body: "Rozszerz wyszukiwanie i uruchom je ponownie — powtórne wyszukiwania korzystają z cen lotów z pamięci podręcznej.",
      gap30: "Zwiększ różnicę do 30 h",
      budget50: (amount: string) => `+${amount} budżetu`,
      days3: "+3 dni okna",
      running: "Rozpoczynam nowe wyszukiwanie…",
    },
  },
  weather: {
    title: (city: string) => `Pogoda w ${city} — kolejne 7 dni`,
    rain: (pct: number) => `deszcz ${pct}%`,
    source: "Prognoza: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "Bezchmurnie",
      partlyCloudy: "Częściowe zachmurzenie",
      cloudy: "Pochmurno",
      fog: "Mgła",
      rain: "Deszcz",
      snow: "Śnieg",
      showers: "Przelotne opady",
      thunderstorm: "Burza",
    },
  },
  hero: {
    title: (city: string, country: string) => `Najlepsze miejsce pośrodku dla Was: ${city}, ${country}`,
    gap: (text: string) => `wszyscy przylatują w odstępie ${text}`,
    from: (price: string) => `od ${price} / osoba`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "Zobacz tę opcję",
  },
  surprise: {
    button: "Zaskocz mnie",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ${gap} różnicy, ${total}`,
  },
  popular: {
    title: "Popularne miejsca pośrodku",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Brak jeszcze popularnych miejsc",
  },
  ads: {
    label: "Sponsorowane",
  },
  share: {
    pageTitle: "wyszukiwanie midspot",
    loading: "Ładowanie wyszukiwania…",
    notFoundTitle: "Ten link do wyszukiwania jest niedostępny",
    notFoundBody:
      "Mógł wygasnąć (wyszukiwania są przechowywane 7 dni) albo link jest błędny.",
    backHome: "Wróć do midspot",
    errorPrefix: "Błąd wyszukiwania: ",
  },
  notFound: {
    title: "Nie znaleziono strony",
    body: "Strona, której szukasz, nie istnieje lub została przeniesiona.",
    backHome: "Wróć do midspot",
  },
  common: {
    loading: "Ładowanie…",
  },
  consent: {
    title: "Ciasteczka",
    body: "Używamy niezbędnych ciasteczek, aby zapamiętać Twój język i wybór dokonany tutaj. Ciasteczka reklamowe (EthicalAds / CarbonAds) są ładowane tylko wtedy, gdy wybierzesz „Akceptuj wszystkie”.",
    acceptAll: "Akceptuj wszystkie",
    essentialOnly: "Tylko niezbędne",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `Zdjęcie: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "Cele podróży",
      indexDescription:
        "Przeglądaj europejskie miasta, które midspot może przeszukać jako miejsce pośrodku dla Twojej grupy — sortowane według tego, jak często wybierają je podróżni.",
      cityTitle: (city: string) => `Spotkanie w ${city}`,
      cityDescription: (city: string, country: string) =>
        `Spotkanie w ${city}, ${country} — zobacz, dlaczego to działa jako miejsce pośrodku dla znajomych i rodziny lecących z różnych miast, a potem znajdź własne miejsce pośrodku.`,
    },
    index: {
      eyebrow: "Cele podróży",
      title: "Gdzie powinna spotkać się Wasza grupa?",
      subtitle:
        "Każde miasto poniżej to cel, który midspot może przeszukać jako możliwe miejsce pośrodku dla 2–8 podróżnych lecących z różnych lotnisk macierzystych. Wybierz jedno, aby zobaczyć, dlaczego działa — lub wróć i pozwól wyszukiwarce znaleźć Wasze miejsce pośrodku.",
      searchPlaceholder: "Szukaj miasta, kraju lub kodu lotniska…",
      empty: "Brak celów pasujących do wyszukiwania.",
      showing: (shown: number, total: number) => `Pokazuję ${shown} z ${total} celów`,
      airports: (codes: string) => `Lotniska: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Jeszcze nie wybrane jako miejsce pośrodku"
          : count === 1
            ? "Wybrane raz jako miejsce pośrodku"
            : `Wybrane ${count}× jako miejsce pośrodku`,
    },
    city: {
      back: "Wszystkie cele",
      pitch: (city: string) => `Spotkanie w ${city} — miejsce pośrodku, które działa dla wszystkich.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) to jedno z miejsc, które midspot przeszukuje, gdy grupa znajomych lub rodzina chce się spotkać. Każdy leci ze swojego lotniska macierzystego; sortujemy cele według tego, jak blisko siebie wszyscy przylatują, a następnie według ceny — w ramach Waszego budżetu.`,
      airportsLabel: "Obsługiwane lotniska",
      statsLabel: "Liczba wyborów jako miejsca pośrodku (ostatnie 90 dni)",
      statsEmpty: "Brak jeszcze wyszukiwań — bądźcie pierwszą grupą, która spotka się tutaj.",
      howTitle: "Jak to działa",
      howSteps: [
        {
          title: "Dodaj lotnisko macierzyste każdego",
          body: "2–8 podróżnych, każdy ze swojego miasta — szukamy rzeczywistych cen lotów ze wszystkich.",
        },
        {
          title: "Ustaw daty, noce i budżet",
          body: "Elastyczne daty albo cały miesiąc; budżet na osobę obejmujący lot w obie strony.",
        },
        {
          title: "My klasyfikujemy miejsca pośrodku",
          body: "Cele są sortowane według różnicy przylotów (wszyscy lądują w ciągu 24 h od siebie), a następnie według całkowitej ceny.",
        },
      ],
      faqTitle: "Często zadawane pytania",
      // „{city}” jest zastępowane nazwą miasta strony podczas wyświetlania
      faqs: [
        {
          q: "Dlaczego {city} to dobre miejsce pośrodku?",
          a: "{city} jest dostępne krótkimi, częstymi lotami z całej Europy, więc podróżni z różnych miast często przylatują zaledwie kilka godzin po sobie — przy niskiej całkowitej cenie. Uruchom wyszukiwanie, a midspot porówna je ze wszystkimi innymi opcjami.",
        },
        {
          q: "Czy rezerwuję loty przez midspot?",
          a: "Nie. midspot znajduje i sortuje miejsca pośrodku; rezerwacja odbywa się na stronie partnera (np. Kiwi.com) przez link afiliacyjny, po tej samej cenie dla Ciebie.",
        },
        {
          q: "Czy ceny są rzeczywiste?",
          a: "Ceny pochodzą z bieżących danych o lotach w momencie wyszukiwania i mogą się zmieniać — strona rezerwacji zawsze pokazuje cenę końcową.",
        },
      ],
      cta: "Znajdź swoje miejsce pośrodku",
    },
  },
  blog: {
    meta: {
      title: "Blog",
      description:
        "Opowieści i notatki zespołu midspot — jak znajdujemy miejsce pośrodku dla grup podróżnych lecących z różnych miast.",
    },
    title: "Opowieści z pośrodka",
    subtitle:
      "Notatki o spotkaniach w połowie drogi: jak działa wyszukiwanie, gdzie grupy naprawdę się spotkały i czego uczymy się z bieżących danych o lotach.",
    latest: "Najnowsze wpisy",
    empty: "Brak jeszcze wpisów — wróć wkrótce.",
    readingTime: (minutes: number) => `${minutes} min czytania`,
    published: (date: string) => `Opublikowano ${date}`,
    back: "Wszystkie wpisy",
    prev: "Nowszy wpis",
    next: "Starszy wpis",
    share: "Kopiuj link",
    copied: "Link skopiowany!",
    copyFailed: "Nie udało się skopiować — zaznacz adres URL ręcznie",
    rss: "Kanał RSS",
  },
  stats: {
    title: "Statystyki strony",
    subtitle: "Własna, przyjazna prywatności analityka midspot — tylko zagregowane dane, nigdy adresy IP.",
    secretLabel: "Klucz statystyk",
    secretPlaceholder: "Wklej klucz statystyk",
    unlock: "Załaduj statystyki",
    loading: "Ładowanie…",
    unauthorized:
      "Błędny lub brakujący klucz (401). Klucz nigdy nie jest osadzony w tej stronie — poproś o niego właściciela witryny.",
    error: "Nie udało się załadować statystyk.",
    retry: "Ponów próbę",
    totals: { searches: "Wyszukiwania", results: "Wyniki", pageviews: "Wyświetlenia" },
    searchesChart: "Wyszukiwania dziennie — ostatnie 30 dni",
    pageviewsChart: "Wyświetlenia dziennie — ostatnie 30 dni",
    popularRoutes: "Popularne pary lotnisk wylotu — ostatnie 30 dni",
    providerUsage: "Użycie dostawców — bieżący miesiąc",
    table: {
      day: "Dzień",
      count: "Liczba",
      total: "Razem",
      route: "Trasa",
      searches: "Wyszukiwania",
      provider: "Dostawca",
      calls: "Wywołania",
      cap: "Limit miesięczny",
      pctUsed: "% limitu",
    },
    noData: "Brak jeszcze danych.",
    cloudflareNote:
      "Panel Cloudflare pokazuje również ruch na krawędzi sieci (wszystkie żądania docierające do CDN, w tym boty i zasoby z pamięci podręcznej) — ta strona pokazuje tylko to, co sam midspot serwuje i przechowuje we własnej bazie danych.",
  },
  footer: {
    destinations: "Cele podróży",
    blog: "Blog",
    privacy: "Prywatność",
    terms: "Regulamin",
    cookieSettings: "Ustawienia ciasteczek",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Język",
  },
  currency: {
    label: "Waluta",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · kurs EBC z dnia ${date}`,
  },
  theme: {
    label: "Motyw",
    light: "Jasny",
    dark: "Ciemny",
    system: "Systemowy",
  },
};
