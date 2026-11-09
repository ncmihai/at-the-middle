// Türkçe — en.ts ile aynı anahtar yapısı (kaynak). Yasal sayfalar (privacy/terms)
// burada çevrilmemiştir; İngilizceye geri düşer.
import type { LangMessages } from "./en";

export const tr: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Ortada buluşun",
    heroSubtitle:
      "Herkes evden uçar ve siz üçüncü bir destinasyonda buluşursunuz — birbirinize günler değil, saatler içinde varırsınız. Önce varış farkına, sonra fiyata göre sıralanır — bütçeniz dahilinde.",
    heroPoints: [
      "2–8 gezgin, her biri kendi şehrinden uçar",
      "Destinasyonda buluşursunuz — birbirinizin evinde değil",
      "Önce varış farkı (maks. 24 sa), sonra fiyat",
      "Esnek tarihler — ya da tüm bir ayı seçin",
    ],
    heroExample:
      "Örnek: sen Bükreş'ten, bir arkadaşın Berlin'den uçuyor → Barselona'da buluşuyorsunuz, varışlar arasında 2 saat farkla — 3 gün değil.",
  },
  form: {
    title: "Seyahati planla",
    originsLabel: "Herkes nereden uçuyor?",
    originsHint: "2–8 kalkış havalimanı, her biri bir gezgin için",
    originPlaceholder: "Şehir veya havalimanı ara…",
    originSelectedPlaceholder: "Bir havalimanı seçin",
    addOrigin: "Gezgin ekle",
    removeOrigin: "Kaldır",
    maxOriginsReached: "Maksimum 8 gezgin",
    minOriginsHint: "En az 2 gezgin",
    locationButton: "Konumumu kullan",
    locationLocating: "Konumunuz algılanıyor…",
    locationFailed: "Konumunuz algılanamadı — havalimanınızı elle seçin",
    locationNoEmptyRow: "Tüm gezgin yuvaları zaten dolu",
    autocomplete: {
      searching: "Havalimanları aranıyor…",
      minChars: "En az 2 karakter yazın…",
      empty: "Havalimanı bulunamadı.",
    },
    datesLabel: "Seyahat tarihleri",
    datesPlaceholder: "Gidiş ve dönüşü seçin",
    datesHint: "Gidiş → dönüş — gece sayısı otomatik hesaplanır",
    flexLabel: "Gidiş esnekliği",
    flexDays: (days: number) =>
      days === 0 ? "±0 gün (tam tarih)" : `±${days} gün`,
    monthMode: "Tüm ay",
    monthLabel: "Ay",
    monthHint: "Tüm ayı tarayıp otomatik olarak en ucuzu 14 günü seçeriz",
    nightsLabel: "Gece",
    nightsHint: "1–30",
    nightsLabelMonth: "Gece (seçiminiz)",
    nightsAutoHint: "Seyahat tarihlerinizden otomatik türetilir",
    monthSampling: (month: string) => `${month} ayının en ucuzu 14 günü seçiliyor…`,
    fewerNights: "Daha az gece",
    moreNights: "Daha fazla gece",
    budgetLabel: "Kişi başı bütçe",
    budgetHint: (cur: string) => `Gidiş + dönüş uçuşunu kapsar, ${cur} cinsinden`,
    maxFlightLabel: "Maks. uçuş süresi (isteğe bağlı)",
    maxFlightAny: "Herhangi bir süre",
    maxFlightHours: (h: number) => `${h} saate kadar`,
    submit: "Orta noktaları bul",
    submitting: "Arama başlatılıyor…",
    errors: {
      originsRequired: "En az 2 kalkış havalimanı seçin",
      originsUnique: "Her gezginin farklı bir kalkış havalimanı olmalı",
      datesRequired: "Gidiş ve dönüş tarihlerini seçin",
      nightsRequired: "Kaç gece olduğunu seçin (1–30)",
      budgetRequired: (min: string, max: string) =>
        `Bütçe kişi başına ${min} ile ${max} arasında olmalı`,
      validationFailed: "Lütfen formu kontrol edin — bazı alanlar geçersiz",
      rateLimited: (retryAfterSeconds?: number) =>
        `Çok fazla arama — lütfen${retryAfterSeconds ? ` ${retryAfterSeconds} sn` : " bir süre"} bekleyip tekrar deneyin`,
      generic: "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
      network: "Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.",
    },
  },
  waiting: {
    title: "Ortanızı buluyoruz…",
    subtitle:
      "Her kalkış havalimanından aday rotalara uçuşları tarıyoruz. Bu genellikle bir dakikadan kısa sürer.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Adım ${done} / ${total}` : "Isınıyor…",
    partialTitle: "Şu ana kadar bulunanlar",
    cancel: "Aramayı iptal et",
    cancelling: "İptal ediliyor…",
    cancelDialogTitle: "Bu arama iptal edilsin mi?",
    cancelDialogBody:
      "Arama duracak, ancak şu ana kadar bulunan rotalar aşağıda görünmeye devam eder.",
    cancelDialogConfirm: "Evet, iptal et",
    cancelDialogDismiss: "Aramaya devam et",
  },
  history: {
    title: "Son aramalar",
    clear: "Temizle",
    chipAria: (label: string) => `Aramayı aç: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `Fotoğraf: ${credit} · ${license} (Wikimedia Commons)`,
    title: "Orta noktalarınız",
    subtitle: "Herkesin ne kadar yakın vardığına, sonra toplam fiyata göre sıralanır.",
    empty: "Henüz bütçenize ve varış farkı sınırınıza uyan rota yok.",
    gapBadge: (text: string) => `Herkes ${text} içinde varıyor`,
    gapRelaxed: (hours: number) =>
      `Standart 24 saat içinde eşleşme yok — varış farkı ${hours} saate çıkarıldı`,
    outbound: (date: string) => `Gidiş · ${date}`,
    returnLeg: (date: string) => `Dönüş · ${date}`,
    perPersonTotal: "kişi başına",
    groupTotal: "Grup toplamı",
    bookOutbound: "Gidişi ayırt",
    bookReturn: "Dönüşü ayırt",
    stay: (city: string) => `${city} içinde konakla`,
    stayNote: "Bağlı kuruluş bağlantısı",
    extras: {
      title: "Ekstralar",
      transfer: "Havalimanı transferi",
      car: "Araç kiralama",
      esim: "eSIM",
      activities: "Aktiviteler",
    },
    priceNote: "Fiyatlar arama anından kalmadır — rezervasyon sitesi canlı fiyatı gösterir.",
    share: "Paylaşım bağlantısını kopyala",
    copied: "Paylaşım bağlantısı kopyalandı!",
    copyFailed: "Kopyalanamadı — URL'yi elle seçin",
    shareCard: "Paylaşım kartını indir",
    shareCardDownloaded: "Paylaşım kartı indirildi — indirilenlere göz atın!",
    shareCardFailed: "Paylaşım kartı oluşturulamadı — lütfen tekrar deneyin",
    invite: "Daveti kopyala",
    inviteCopied: "Davet kopyalandı — grup sohbetinize yapıştırın!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `${city} (${country}) içinde buluşalım, ${dep} → ${ret}! Herkesi birbirinden ${gap} içinde indiren uçuşlar bulduk: ${url}`,
    cancelledBanner: "Arama iptal edildi — şu ana kadar bulunan rotalar gösteriliyor.",
    failedTitle: "Arama başarısız oldu",
    failedRetry: "Ana sayfadan yeni bir arama başlatın",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} gece`,
    usageLimited: "Aylık arama sınırına ulaşıldı — yalnızca önbellekteki sonuçlar gösteriliyor.",
    map: {
      title: "Harita",
      origins: "Kalkış havalimanları",
      destinations: "Rotalar",
      airports: "Tüm aday havalimanları",
      tooltip: {
        gap: (text: string) => `${text} içinde varışlar`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Grup toplamı",
        perPerson: "kişi başına",
      },
    },
    toolbar: {
      sortLabel: "Sırala",
      sortGap: "En yakın varışlar",
      sortPrice: "En düşük fiyat",
      sortDestination: "Rota A–Z",
      gapLabel: "Maks. varış farkı",
      gapAny: "Herhangi biri",
      gapHours: (h: number) => `≤ ${h} sa`,
      priceLabel: "Maks. fiyat / kişi",
      priceAny: "Herhangi biri",
      showing: (shown: number, total: number) => `${total} sonuçtan ${shown} gösteriliyor`,
    },
    timeline: {
      title: "Varış yayılımı",
      arriveWithin: (text: string) => `${text} içinde varıyorlar`,
    },
    relax: {
      title: "Henüz eşleşme yok",
      body: "Aramayı genişletip yeniden çalıştırın — yinelenen aramalar önbellekteki uçuş fiyatlarını yeniden kullanır.",
      gap30: "Farkı 30 saate çıkar",
      budget50: (amount: string) => `+${amount} bütçe`,
      days3: "+3 gün penceresi",
      running: "Yeni arama başlatılıyor…",
    },
  },
  weather: {
    title: (city: string) => `${city} hava durumu — sonraki 7 gün`,
    rain: (pct: number) => `yağmur %${pct}`,
    source: "Tahmin: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "Açık gökyüzü",
      partlyCloudy: "Parçalı bulutlu",
      cloudy: "Bulutlu",
      fog: "Sis",
      rain: "Yağmur",
      snow: "Kar",
      showers: "Sağanak",
      thunderstorm: "Gök gürültülü fırtına",
    },
  },
  hero: {
    title: (city: string, country: string) => `Sizin için en iyi orta nokta: ${city}, ${country}`,
    gap: (text: string) => `herkes ${text} içinde varıyor`,
    from: (price: string) => `${price} / kişiden itibaren`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "Bu seçeneği gör",
  },
  surprise: {
    button: "Beni şaşırt",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ${gap} farkla, ${total}`,
  },
  popular: {
    title: "Popüler orta noktalar",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Henüz popüler rota yok",
  },
  ads: {
    label: "Sponsorlu",
  },
  share: {
    pageTitle: "midspot araması",
    loading: "Arama yükleniyor…",
    notFoundTitle: "Bu arama bağlantısı kullanılamıyor",
    notFoundBody:
      "Süresi dolmuş olabilir (aramalar 7 gün saklanır) veya bağlantı hatalı.",
    backHome: "midspot'a dön",
    errorPrefix: "Arama hatası: ",
  },
  notFound: {
    title: "Sayfa bulunamadı",
    body: "Aradığınız sayfa yok ya da taşınmış.",
    backHome: "midspot'a dön",
  },
  common: {
    loading: "Yükleniyor…",
  },
  consent: {
    title: "Çerezler",
    body: "Dilinizi ve buradaki seçiminizi hatırlamak için temel çerezler kullanıyoruz. Reklam çerezleri (EthicalAds / CarbonAds) yalnızca “Tümünü kabul et”i seçerseniz yüklenir.",
    acceptAll: "Tümünü kabul et",
    essentialOnly: "Yalnızca temel",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `Fotoğraf: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "Rotalar",
      indexDescription:
        "Grubunuz için orta nokta olarak midspot'un arayabileceği Avrupa şehirlerine göz atın — gezginlerin ne sıklıkla seçtiğine göre sıralı.",
      cityTitle: (city: string) => `${city} buluşma`,
      cityDescription: (city: string, country: string) =>
        `${city}, ${country} buluşma — farklı şehirlerden uçan arkadaş ve aile için neden orta nokta olarak çalıştığını görün, sonra kendi orta noktanızı bulun.`,
    },
    index: {
      eyebrow: "Rotalar",
      title: "Grubunuz nerede buluşmalı?",
      subtitle:
        "Aşağıdaki her şehir, farklı kalkış havalimanlarından uçan 2–8 gezgin için olası bir orta nokta olarak midspot'un arayabileceği bir rotadır. Neden çalıştığını görmek için birini seçin — ya da geri dönün ve aramanın orta noktanızı bulmasına izin verin.",
      searchPlaceholder: "Şehir, ülke veya havalimanı kodu ara…",
      empty: "Aramanızla eşleşen rota yok.",
      showing: (shown: number, total: number) => `${total} rotadan ${shown} gösteriliyor`,
      airports: (codes: string) => `Havalimanları: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Henüz orta nokta olarak seçilmedi"
          : count === 1
            ? "Bir kez orta nokta olarak seçildi"
            : `${count} kez orta nokta olarak seçildi`,
    },
    city: {
      back: "Tüm rotalar",
      pitch: (city: string) => `${city} buluşma — herkese uyan orta nokta.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}), bir arkadaş veya aile grubunun buluşmak istediğinde midspot'un aradığı rotalardan biridir. Herkes kendi kalkış havalimanından uçar; rotaları herkesin ne kadar yakın vardığına, sonra fiyata göre sıralarız — bütçeniz dahilinde.`,
      airportsLabel: "Hizmet veren havalimanları",
      statsLabel: "Son 90 günde orta nokta olarak seçilme sayısı",
      statsEmpty: "Henüz arama yok — burada buluşan ilk grup siz olun.",
      howTitle: "Nasıl çalışır",
      howSteps: [
        {
          title: "Herkesin kalkış havalimanını ekleyin",
          body: "2–8 gezgin, her biri kendi şehrinden — hepsinden gerçek uçuş fiyatlarını ararız.",
        },
        {
          title: "Tarihleri, gece sayısını ve bütçeyi ayarlayın",
          body: "Esnek tarihler veya tüm bir ay; gidiş + dönüşü kapsayan kişi başı bütçe.",
        },
        {
          title: "Orta noktaları biz sıralarız",
          body: "Rotalar varış farkına (herkes birbirinden 24 saat içinde iner), sonra toplam fiyata göre sıralanır.",
        },
      ],
      faqTitle: "Sık sorulan sorular",
      // “{city}” sayfanın şehriyle çalışma zamanında değiştirilir
      faqs: [
        {
          q: "{city} neden iyi bir orta nokta?",
          a: "{city}, tüm Avrupa'dan kısa ve sık uçuşlarla ulaşılabilir, bu yüzden farklı şehirlerden gelen gezginler genellikle birbirlerinden saatler içinde varır — düşük toplam fiyatla. Bir arama çalıştırın, midspot onu diğer tüm seçeneklerle karşılaştırır.",
        },
        {
          q: "Uçuşları midspot üzerinden mi ayırtıyorum?",
          a: "Hayır. midspot orta noktayı bulur ve sıralar; rezervasyon iş ortağı sitenin (ör. Kiwi.com) kendi sayfasında, bağlı kuruluş bağlantısıyla sizin için aynı fiyata yapılır.",
        },
        {
          q: "Fiyatlar gerçek mi?",
          a: "Fiyatlar arama anındaki canlı uçuş verilerinden gelir ve değişebilir — rezervasyon sitesi her zaman son fiyatı gösterir.",
        },
      ],
      cta: "Orta noktanızı bulun",
    },
  },
  blog: {
    meta: {
      title: "Blog",
      description:
        "midspot ekibinden hikâyeler ve notlar — farklı şehirlerden uçan gezgin grupları için orta noktayı nasıl bulduğumuz.",
    },
    title: "Ortadan hikâyeler",
    subtitle:
      "Yarı yolda buluşma notları: arama nasıl çalışır, gruplar gerçekte nerede buluştu ve canlı uçuş verilerinden neler öğreniyoruz.",
    latest: "Son hikâyeler",
    empty: "Henüz gönderi yok — yakında tekrar kontrol edin.",
    readingTime: (minutes: number) => `${minutes} dk okuma`,
    published: (date: string) => `${date} tarihinde yayınlandı`,
    back: "Tüm gönderiler",
    prev: "Daha yeni gönderi",
    next: "Daha eski gönderi",
    share: "Bağlantıyı kopyala",
    copied: "Bağlantı kopyalandı!",
    copyFailed: "Kopyalanamadı — URL'yi elle seçin",
    rss: "RSS akışı",
  },
  stats: {
    title: "Site istatistikleri",
    subtitle: "midspot'un kendi gizlilik dostu analitiği — yalnızca toplamlar, asla IP adresleri.",
    secretLabel: "İstatistik anahtarı",
    secretPlaceholder: "İstatistik anahtarını yapıştırın",
    unlock: "İstatistikleri yükle",
    loading: "Yükleniyor…",
    unauthorized:
      "Yanlış veya eksik anahtar (401). Anahtar bu sayfaya asla dahil edilmez — site sahibinden isteyin.",
    error: "İstatistikler yüklenemedi.",
    retry: "Yeniden dene",
    totals: { searches: "Aramalar", results: "Sonuçlar", pageviews: "Görüntülenme" },
    searchesChart: "Günde aramalar — son 30 gün",
    pageviewsChart: "Günde görüntülenme — son 30 gün",
    popularRoutes: "Popüler kalkış çiftleri — son 30 gün",
    providerUsage: "Sağlayıcı kullanımı — cari ay",
    table: {
      day: "Gün",
      count: "Sayı",
      total: "Toplam",
      route: "Rota",
      searches: "Aramalar",
      provider: "Sağlayıcı",
      calls: "Çağrı",
      cap: "Aylık sınır",
      pctUsed: "Sınırın %'si",
    },
    noData: "Henüz veri yok.",
    cloudflareNote:
      "Cloudflare paneli ayrıca edge trafiğini de gösterir (botlar ve önbelleğe alınmış varlıklar dahil CDN ucuna ulaşan tüm istekler) — bu sayfa yalnızca midspot'un kendisinin sunduğu ve kendi veritabanında sakladığı şeyleri gösterir.",
  },
  footer: {
    destinations: "Rotalar",
    blog: "Blog",
    privacy: "Gizlilik",
    terms: "Şartlar",
    cookieSettings: "Çerez ayarları",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Dil",
  },
  currency: {
    label: "Para birimi",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · ${date} tarihli ECB kuru`,
  },
  theme: {
    label: "Tema",
    light: "Açık",
    dark: "Koyu",
    system: "Sistem",
  },
};
