// 한국어 — en.ts(원본 소스)와 완전히 동일한 키 구조. 법적 페이지(privacy/terms)는
// 이 언어에서 생략되며 영어로 표시됩니다.
import type { LangMessages } from "./en";

export const ko: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "중간에서 만나요",
    heroSubtitle:
      "모두가 집에서 출발해 제3의 목적지에서 만납니다 — 며칠이 아니라 몇 시간 차이로 도착해요. 도착 시간 차이를 먼저, 그다음 가격순으로 정렬하며 예산 범위 안에서 찾습니다.",
    heroPoints: [
      "2–8명의 여행자, 각자 자신의 도시에서 출발",
      "목적지에서 만납니다 — 서로의 집에서가 아니라",
      "도착 시간 차이 우선 (최대 24시간), 그다음 가격",
      "유연한 출발 날짜 — 또는 한 달 전체를 선택",
    ],
    heroExample:
      "예: 당신은 부쿠레슈티에서, 친구는 베를린에서 출발 → 바르셀로나에서 만납니다. 도착 시간 차이는 2시간 — 3일이 아닙니다.",
  },
  form: {
    title: "여행 계획 세우기",
    originsLabel: "모두 어디에서 출발하나요?",
    originsHint: "2–8개의 출발 공항, 한 명당 하나씩",
    originPlaceholder: "도시 또는 공항 검색…",
    originSelectedPlaceholder: "공항 선택",
    addOrigin: "여행자 추가",
    removeOrigin: "제거",
    maxOriginsReached: "최대 8명까지",
    minOriginsHint: "최소 2명 필요합니다",
    locationButton: "내 위치 사용",
    locationLocating: "위치 감지 중…",
    locationFailed: "위치를 감지하지 못했습니다 — 공항을 직접 선택하세요",
    locationNoEmptyRow: "모든 여행자 자리가 이미 채워져 있습니다",
    autocomplete: {
      searching: "공항 검색 중…",
      minChars: "2글자 이상 입력하세요…",
      empty: "공항을 찾지 못했습니다.",
    },
    datesLabel: "여행 날짜",
    datesPlaceholder: "출발일 및 귀국일 선택",
    datesHint: "출발 → 귀국 — 숙박 일수는 자동으로 계산됩니다",
    flexLabel: "출발 날짜 유연성",
    flexDays: (days: number) =>
      days === 0 ? "±0일 (날짜 고정)" : `±${days}일`,
    monthMode: "한 달 전체",
    monthLabel: "월",
    monthHint: "해당 월 전체를 스캔해 가장 저렴한 14일 구간을 자동으로 선택합니다",
    nightsLabel: "숙박 일수",
    nightsHint: "1–30",
    nightsLabelMonth: "숙박 일수 (직접 선택)",
    nightsAutoHint: "여행 날짜에서 자동으로 계산됩니다",
    monthSampling: (month: string) => `${month}에서 가장 저렴한 14일을 선택하는 중…`,
    fewerNights: "일수 줄이기",
    moreNights: "일수 늘리기",
    budgetLabel: "1인당 예산",
    budgetHint: (cur: string) => `왕복 항공편 포함, ${cur} 기준`,
    maxFlightLabel: "최대 비행 시간 (선택 사항)",
    maxFlightAny: "제한 없음",
    maxFlightHours: (h: number) => `최대 ${h}시간`,
    submit: "중간 지점 찾기",
    submitting: "검색을 시작하는 중…",
    errors: {
      originsRequired: "출발 공항을 2개 이상 선택하세요",
      originsUnique: "각 여행자는 서로 다른 출발 공항을 선택해야 합니다",
      datesRequired: "출발일과 귀국일을 선택하세요",
      nightsRequired: "숙박 일수를 선택하세요 (1–30)",
      budgetRequired: (min: string, max: string) =>
        `예산은 1인당 ${min}~${max} 사이여야 합니다`,
      validationFailed: "양식을 확인하세요 — 일부 항목이 올바르지 않습니다",
      rateLimited: (retryAfterSeconds?: number) =>
        `검색이 너무 많습니다 — ${retryAfterSeconds ? `${retryAfterSeconds}초` : "잠시"} 기다린 후 다시 시도하세요`,
      generic: "문제가 발생했습니다. 다시 시도하세요.",
      network: "서버에 연결할 수 없습니다. 연결을 확인하고 다시 시도하세요.",
    },
  },
  waiting: {
    title: "여러분의 중간 지점을 찾는 중…",
    subtitle:
      "각 출발 공항에서 후보 목적지로 가는 항공편을 스캔하고 있습니다. 보통 1분도 걸리지 않습니다.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `단계 ${done} / ${total}` : "준비 중…",
    partialTitle: "지금까지 찾은 결과",
    cancel: "검색 취소",
    cancelling: "취소하는 중…",
    cancelDialogTitle: "이 검색을 취소할까요?",
    cancelDialogBody:
      "검색은 중단되지만, 이미 찾은 목적지는 아래에 그대로 표시됩니다.",
    cancelDialogConfirm: "예, 취소",
    cancelDialogDismiss: "계속 검색",
  },
  history: {
    title: "최근 검색",
    clear: "지우기",
    chipAria: (label: string) => `검색 열기: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `사진: ${credit} · ${license} (Wikimedia Commons)`,
    title: "여러분의 중간 지점",
    subtitle: "모두의 도착이 얼마나 가까운지순으로 정렬한 다음, 총액순으로 정렬합니다.",
    empty: "아직 예산과 도착 시간 차이 조건에 맞는 목적지가 없습니다.",
    gapBadge: (text: string) => `모두 ${text} 이내에 도착`,
    gapRelaxed: (hours: number) =>
      `표준 24시간 이내에 일치하는 항목이 없어 도착 시간 차이를 ${hours}시간으로 넓혔습니다`,
    outbound: (date: string) => `출발편 · ${date}`,
    returnLeg: (date: string) => `귀국편 · ${date}`,
    perPersonTotal: "1인당",
    groupTotal: "그룹 전체 합계",
    bookOutbound: "출발편 예약",
    bookReturn: "귀국편 예약",
    stay: (city: string) => `${city}에서 숙박`,
    stayNote: "제휴 링크",
    extras: {
      title: "부가 서비스",
      transfer: "공항 교통편",
      car: "렌터카",
      esim: "eSIM",
      activities: "액티비티",
    },
    priceNote: "가격은 검색 시점 기준입니다 — 예약 사이트에서 실시간 가격이 표시됩니다.",
    share: "공유 링크 복사",
    copied: "공유 링크가 복사되었습니다!",
    copyFailed: "복사할 수 없습니다 — URL을 직접 선택하세요",
    shareCard: "공유 카드 다운로드",
    shareCardDownloaded: "공유 카드가 다운로드되었습니다 — 다운로드 폴더를 확인하세요!",
    shareCardFailed: "공유 카드를 만들 수 없습니다 — 다시 시도하세요",
    invite: "초대 복사",
    inviteCopied: "초대가 복사되었습니다 — 그룹 채팅에 붙여넣으세요!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `${city}(${country})에서 만나요, ${dep} → ${ret}! 모두가 서로 ${gap} 이내에 도착할 수 있는 항공편을 찾았어요: ${url}`,
    cancelledBanner: "검색이 취소되었습니다 — 지금까지 찾은 목적지를 표시합니다.",
    failedTitle: "검색에 실패했습니다",
    failedRetry: "홈페이지에서 새 검색 시작하기",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n}박`,
    usageLimited: "월간 검색 한도에 도달했습니다 — 캐시된 결과만 표시합니다.",
    map: {
      title: "지도",
      origins: "출발 공항",
      destinations: "목적지",
      airports: "모든 후보 공항",
      tooltip: {
        gap: (text: string) => `${text} 이내에 도착`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "그룹 전체 합계",
        perPerson: "1인당",
      },
    },
    toolbar: {
      sortLabel: "정렬 기준",
      sortGap: "도착 시간이 가장 가까운 순",
      sortPrice: "가격이 가장 낮은 순",
      sortDestination: "목적지 가나다순",
      gapLabel: "최대 도착 시간 차이",
      gapAny: "제한 없음",
      gapHours: (h: number) => `≤ ${h}시간`,
      priceLabel: "최대 가격 / 1인",
      priceAny: "제한 없음",
      showing: (shown: number, total: number) => `${total}개 중 ${shown}개 표시`,
    },
    timeline: {
      title: "도착 시간 분포",
      arriveWithin: (text: string) => `${text} 이내에 도착`,
    },
    relax: {
      title: "아직 일치하는 항목이 없습니다",
      body: "검색 범위를 넓혀 다시 실행하세요 — 반복 검색에서는 캐시된 항공권 가격을 재사용합니다.",
      gap30: "시간 차이를 30시간으로 완화",
      budget50: (amount: string) => `예산 +${amount}`,
      days3: "+3일 범위",
      running: "새 검색을 시작하는 중…",
    },
  },
  weather: {
    title: (city: string) => `${city}의 향후 7일 날씨`,
    rain: (pct: number) => `강수 확률 ${pct}%`,
    source: "예보: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "맑음",
      partlyCloudy: "구름 조금",
      cloudy: "흐림",
      fog: "안개",
      rain: "비",
      snow: "눈",
      showers: "소나기",
      thunderstorm: "천둥번개",
    },
  },
  hero: {
    title: (city: string, country: string) => `여러분에게 딱 맞는 중간 지점: ${city}, ${country}`,
    gap: (text: string) => `모두 ${text} 이내에 도착`,
    from: (price: string) => `1인당 ${price}부터`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "이 옵션 보기",
  },
  surprise: {
    button: "랜덤으로 골라줘",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ${gap} 차이, ${total}`,
  },
  popular: {
    title: "인기 중간 지점",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "아직 인기 지점이 없습니다",
  },
  ads: {
    label: "스폰서",
  },
  share: {
    pageTitle: "midspot 검색",
    loading: "검색을 불러오는 중…",
    notFoundTitle: "이 검색 링크를 사용할 수 없습니다",
    notFoundBody:
      "만료되었거나(검색은 7일간 보관됩니다) 링크가 잘못되었을 수 있습니다.",
    backHome: "midspot으로 돌아가기",
    errorPrefix: "검색 오류: ",
  },
  notFound: {
    title: "페이지를 찾을 수 없습니다",
    body: "찾으시는 페이지가 존재하지 않거나 이동했습니다.",
    backHome: "midspot으로 돌아가기",
  },
  common: {
    loading: "로딩 중…",
  },
  consent: {
    title: "쿠키",
    body: "언어와 여기서의 선택을 기억하기 위해 필수 쿠키를 사용합니다. 광고 쿠키(EthicalAds / CarbonAds)는 “모두 허용”을 선택한 경우에만 로드됩니다.",
    acceptAll: "모두 허용",
    essentialOnly: "필수만 허용",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `사진: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "목적지",
      indexDescription:
        "midspot이 여러분의 그룹을 위해 중간 지점으로 검색할 수 있는 유럽 도시들을 둘러보세요 — 여행자들이 얼마나 자주 선택했는지순으로 정렬되어 있습니다.",
      cityTitle: (city: string) => `${city}에서 만나기`,
      cityDescription: (city: string, country: string) =>
        `${city}, ${country}에서 만나세요 — 서로 다른 도시에서 출발하는 친구와 가족의 중간 지점으로 왜 적합한지 확인하고, 나만의 중간 지점을 찾아보세요.`,
    },
    index: {
      eyebrow: "목적지",
      title: "그룹은 어디에서 만날까요?",
      subtitle:
        "아래의 각 도시는 서로 다른 출발 공항에서 출발하는 2–8명의 여행자를 위한 잠재적 중간 지점으로 midspot이 검색할 수 있는 목적지입니다. 하나를 선택해 왜 적합한지 확인하거나 — 돌아가서 검색이 중간 지점을 찾아주도록 하세요.",
      searchPlaceholder: "도시, 국가 또는 공항 코드 검색…",
      empty: "검색과 일치하는 목적지가 없습니다.",
      showing: (shown: number, total: number) => `${total}개 목적지 중 ${shown}개 표시`,
      airports: (codes: string) => `공항: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "아직 중간 지점으로 선택된 적 없음"
          : count === 1
            ? "중간 지점으로 1회 선택됨"
            : `중간 지점으로 ${count}회 선택됨`,
    },
    city: {
      back: "모든 목적지",
      pitch: (city: string) => `${city}에서 만나기 — 모두에게 맞는 중간 지점.`,
      pitchBody: (city: string, country: string) =>
        `${city}(${country})는 친구나 가족 그룹이 모이길 원할 때 midspot이 검색하는 목적지 중 하나입니다. 모두 각자의 출발 공항에서 출발하며, 도착 시간의 근접도순으로 목적지를 정렬한 다음 가격순으로 정렬합니다 — 예산 범위 내에서요.`,
      airportsLabel: "취항 공항",
      statsLabel: "지난 90일간 중간 지점으로 선택된 횟수",
      statsEmpty: "아직 검색 기록이 없습니다 — 이곳에서 만나는 첫 번째 그룹이 되어 보세요.",
      howTitle: "작동 방식",
      howSteps: [
        {
          title: "모두의 출발 공항 추가",
          body: "각자 다른 도시에서 출발하는 2–8명 — 모든 출발지에서 실제 항공권 가격을 검색합니다.",
        },
        {
          title: "날짜, 숙박 일수, 예산 설정",
          body: "유연한 날짜 또는 한 달 전체; 왕복을 포함하는 1인당 예산.",
        },
        {
          title: "중간 지점 순위 매기기",
          body: "목적지는 도착 시간 차이(모두 서로 24시간 이내에 도착)순으로, 그다음 총액순으로 정렬됩니다.",
        },
      ],
      faqTitle: "자주 묻는 질문",
      // “{city}”는 렌더링 시 해당 페이지의 도시 이름으로 교체됩니다
      faqs: [
        {
          q: "{city}이(가) 왜 좋은 중간 지점인가요?",
          a: "{city}은(는) 유럽 전역에서 짧고 빈번한 항공편으로 갈 수 있어, 서로 다른 도시에서 온 여행자들이 종종 몇 시간 차이로 도착합니다 — 총액도 저렴한 편이에요. 검색을 실행하면 midspot이 다른 모든 옵션과 비교해 줍니다.",
        },
        {
          q: "midspot을 통해 항공편을 예약하나요?",
          a: "아니요. midspot은 중간 지점을 찾아 정렬할 뿐입니다; 예약은 제휴 링크를 통해 파트너 사이트(예: Kiwi.com)에서 이루어지며, 가격은 동일합니다.",
        },
        {
          q: "가격은 실제인가요?",
          a: "가격은 검색 시점의 실시간 항공 데이터 기준이며 변경될 수 있습니다 — 예약 사이트에 항상 최종 가격이 표시됩니다.",
        },
      ],
      cta: "나의 중간 지점 찾기",
    },
  },
  blog: {
    meta: {
      title: "블로그",
      description:
        "midspot 팀의 이야기와 노트 — 서로 다른 도시에서 출발하는 여행 그룹의 중간 지점을 찾는 방법.",
    },
    title: "중간에서 전하는 이야기",
    subtitle:
      "중간에서 만나기에 대한 노트: 검색이 어떻게 작동하는지, 그룹들이 실제로 어디에서 만났는지, 그리고 실시간 항공 데이터에서 무엇을 배웠는지.",
    latest: "최신 스토리",
    empty: "아직 게시물이 없습니다 — 곧 다시 들러주세요.",
    readingTime: (minutes: number) => `읽는 데 ${minutes}분`,
    published: (date: string) => `${date}에 게시됨`,
    back: "모든 게시물",
    prev: "더 새로운 글",
    next: "더 오래된 글",
    share: "링크 복사",
    copied: "링크가 복사되었습니다!",
    copyFailed: "복사할 수 없습니다 — URL을 직접 선택하세요",
    rss: "RSS 피드",
  },
  stats: {
    title: "사이트 통계",
    subtitle: "midspot 자체의 프라이버시를 보호하는 분석 — 집계 데이터만, IP는 절대 기록하지 않습니다.",
    secretLabel: "통계 시크릿",
    secretPlaceholder: "통계 시크릿을 붙여넣으세요",
    unlock: "통계 불러오기",
    loading: "로딩 중…",
    unauthorized:
      "시크릿이 틀렸거나 없습니다(401). 시크릿은 이 페이지에 포함되어 있지 않습니다 — 사이트 소유자에게 문의하세요.",
    error: "통계를 불러올 수 없습니다.",
    retry: "다시 시도",
    totals: { searches: "검색", results: "결과", pageviews: "페이지뷰" },
    searchesChart: "일별 검색 수 — 최근 30일",
    pageviewsChart: "일별 페이지뷰 — 최근 30일",
    popularRoutes: "인기 출발 쌍 — 최근 30일",
    providerUsage: "제공업체 사용량 — 이번 달",
    table: {
      day: "날짜",
      count: "횟수",
      total: "합계",
      route: "노선",
      searches: "검색",
      provider: "제공업체",
      calls: "호출",
      cap: "월간 한도",
      pctUsed: "한도의 %",
    },
    noData: "아직 데이터가 없습니다.",
    cloudflareNote:
      "Cloudflare 대시보드에는 엣지 트래픽(봇과 캐시된 에셋을 포함한, CDN 엣지에 도달한 모든 요청)도 표시됩니다 — 이 페이지는 midspot 자체가 제공하고 자체 데이터베이스에 저장하는 것만 보여줍니다.",
  },
  footer: {
    destinations: "목적지",
    blog: "블로그",
    privacy: "개인정보 처리방침",
    terms: "이용약관",
    cookieSettings: "쿠키 설정",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "언어",
  },
  currency: {
    label: "통화",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · ECB 환율 (${date})`,
  },
  theme: {
    label: "테마",
    light: "라이트",
    dark: "다크",
    system: "시스템",
  },
};
