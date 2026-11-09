// Tiếng Việt — cùng cấu trúc khóa với en.ts (nguồn chuẩn). Các trang pháp lý
// (privacy/terms) không được dịch trong ngôn ngữ này; sẽ hiển thị bằng tiếng Anh.
import type { LangMessages } from "./en";

export const vi: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Gặp nhau ở điểm giữa",
    heroSubtitle:
      "Mọi người đều bay từ nhà và các bạn gặp nhau ở một điểm đến thứ ba — cách nhau hàng giờ thay vì hàng ngày. Xếp theo độ lệch giờ đến trước, rồi theo giá, trong phạm vi ngân sách của bạn.",
    heroPoints: [
      "2–8 du khách, mỗi người bay từ thành phố của riêng mình",
      "Các bạn gặp nhau tại điểm đến — không phải tại nhà nhau",
      "Độ lệch giờ đến trước (tối đa 24 h), rồi đến giá",
      "Ngày đi linh hoạt — hoặc chọn cả một tháng",
    ],
    heroExample:
      "Ví dụ: bạn bay từ Bucharest, một người bạn từ Berlin → các bạn gặp nhau ở Barcelona, giờ đến chênh nhau 2 h — không phải 3 ngày.",
  },
  form: {
    title: "Lên kế hoạch chuyến đi",
    originsLabel: "Mọi người sẽ bay từ đâu?",
    originsHint: "2–8 sân bay quê nhà, mỗi người một sân bay",
    originPlaceholder: "Tìm thành phố hoặc sân bay…",
    originSelectedPlaceholder: "Chọn một sân bay",
    addOrigin: "Thêm du khách",
    removeOrigin: "Xóa",
    maxOriginsReached: "Tối đa 8 du khách",
    minOriginsHint: "Ít nhất 2 du khách",
    locationButton: "Dùng vị trí của tôi",
    locationLocating: "Đang phát hiện vị trí của bạn…",
    locationFailed: "Không phát hiện được vị trí của bạn — hãy chọn sân bay thủ công",
    locationNoEmptyRow: "Tất cả các chỗ du khách đã được điền",
    autocomplete: {
      searching: "Đang tìm sân bay…",
      minChars: "Nhập ít nhất 2 ký tự…",
      empty: "Không tìm thấy sân bay nào.",
    },
    datesLabel: "Ngày đi",
    datesPlaceholder: "Chọn ngày đi & ngày về",
    datesHint: "Đi → Về — số đêm được tính tự động",
    flexLabel: "Độ linh hoạt ngày đi",
    flexDays: (days: number) =>
      days === 0 ? "±0 ngày (ngày chính xác)" : `±${days} ngày`,
    monthMode: "Cả tháng",
    monthLabel: "Tháng",
    monthHint: "Chúng tôi quét cả tháng và tự động chọn khoảng 14 ngày rẻ nhất",
    nightsLabel: "Số đêm",
    nightsHint: "1–30",
    nightsLabelMonth: "Số đêm (tự chọn)",
    nightsAutoHint: "Tự động tính từ ngày đi của bạn",
    monthSampling: (month: string) => `đang chọn 14 ngày rẻ nhất của ${month}…`,
    fewerNights: "Ít đêm hơn",
    moreNights: "Nhiều đêm hơn",
    budgetLabel: "Ngân sách mỗi người",
    budgetHint: (cur: string) => `Bao gồm vé đi + về, tính bằng ${cur}`,
    maxFlightLabel: "Thời gian bay tối đa (không bắt buộc)",
    maxFlightAny: "Bất kỳ thời lượng nào",
    maxFlightHours: (h: number) => `Tối đa ${h} giờ`,
    submit: "Tìm điểm giữa",
    submitting: "Đang bắt đầu tìm kiếm…",
    errors: {
      originsRequired: "Chọn ít nhất 2 sân bay quê nhà",
      originsUnique: "Mỗi du khách cần một sân bay quê nhà khác nhau",
      datesRequired: "Chọn ngày đi và ngày về",
      nightsRequired: "Chọn số đêm (1–30)",
      budgetRequired: (min: string, max: string) =>
        `Ngân sách phải từ ${min} đến ${max} mỗi người`,
      validationFailed: "Vui lòng kiểm tra biểu mẫu — một số trường không hợp lệ",
      rateLimited: (retryAfterSeconds?: number) =>
        `Quá nhiều lần tìm kiếm — vui lòng đợi${retryAfterSeconds ? ` ${retryAfterSeconds} giây` : " một lát"} rồi thử lại`,
      generic: "Đã có lỗi xảy ra. Vui lòng thử lại.",
      network: "Không thể kết nối máy chủ. Kiểm tra kết nối và thử lại.",
    },
  },
  waiting: {
    title: "Đang tìm điểm giữa cho bạn…",
    subtitle:
      "Chúng tôi đang quét các chuyến bay từ mọi sân bay quê nhà đến các điểm đến tiềm năng. Thường mất chưa đến một phút.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Bước ${done} / ${total}` : "Đang khởi động…",
    partialTitle: "Đã tìm thấy đến nay",
    cancel: "Hủy tìm kiếm",
    cancelling: "Đang hủy…",
    cancelDialogTitle: "Hủy tìm kiếm này?",
    cancelDialogBody:
      "Tìm kiếm sẽ dừng, nhưng các điểm đến đã tìm thấy vẫn hiển thị bên dưới.",
    cancelDialogConfirm: "Có, hủy",
    cancelDialogDismiss: "Tiếp tục tìm",
  },
  history: {
    title: "Tìm kiếm gần đây",
    clear: "Xóa",
    chipAria: (label: string) => `Mở tìm kiếm: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `Ảnh: ${credit} · ${license} (Wikimedia Commons)`,
    title: "Điểm giữa của các bạn",
    subtitle: "Xếp theo mức độ mọi người đến gần nhau, sau đó theo tổng giá.",
    empty: "Chưa có điểm đến nào phù hợp với ngân sách và giới hạn độ lệch giờ đến của bạn.",
    gapBadge: (text: string) => `Mọi người đến trong vòng ${text}`,
    gapRelaxed: (hours: number) =>
      `Không có kết quả trong giới hạn chuẩn 24 giờ — đã nới độ lệch giờ đến thành ${hours} giờ`,
    outbound: (date: string) => `Chiều đi · ${date}`,
    returnLeg: (date: string) => `Chiều về · ${date}`,
    perPersonTotal: "mỗi người",
    groupTotal: "Tổng cho cả nhóm",
    bookOutbound: "Đặt chiều đi",
    bookReturn: "Đặt chiều về",
    stay: (city: string) => `Ở tại ${city}`,
    stayNote: "Liên kết affiliate",
    extras: {
      title: "Dịch vụ thêm",
      transfer: "Xe đưa đón sân bay",
      car: "Thuê xe",
      esim: "eSIM",
      activities: "Hoạt động",
    },
    priceNote: "Giá tính tại thời điểm tìm kiếm — trang đặt vé hiển thị giá trực tiếp.",
    share: "Sao chép liên kết chia sẻ",
    copied: "Đã sao chép liên kết chia sẻ!",
    copyFailed: "Không sao chép được — hãy chọn URL thủ công",
    shareCard: "Tải thẻ chia sẻ",
    shareCardDownloaded: "Đã tải thẻ chia sẻ — kiểm tra mục tải xuống của bạn!",
    shareCardFailed: "Không tạo được thẻ chia sẻ — vui lòng thử lại",
    invite: "Sao chép lời mời",
    inviteCopied: "Đã sao chép lời mời — dán vào nhóm chat của bạn nào!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `Gặp nhau tại ${city} (${country}), ${dep} → ${ret}! Chúng tôi tìm được các chuyến bay giúp mọi người đến cách nhau trong vòng ${gap}: ${url}`,
    cancelledBanner: "Đã hủy tìm kiếm — hiển thị các điểm đến đã tìm thấy.",
    failedTitle: "Tìm kiếm thất bại",
    failedRetry: "Bắt đầu tìm kiếm mới từ trang chủ",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} đêm`,
    usageLimited: "Đã đạt giới hạn tìm kiếm hàng tháng — chỉ hiển thị kết quả trong bộ nhớ đệm.",
    map: {
      title: "Bản đồ",
      origins: "Sân bay quê nhà",
      destinations: "Điểm đến",
      airports: "Tất cả sân bay ứng viên",
      tooltip: {
        gap: (text: string) => `đến trong vòng ${text}`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Tổng cho cả nhóm",
        perPerson: "mỗi người",
      },
    },
    toolbar: {
      sortLabel: "Sắp xếp theo",
      sortGap: "Đến gần nhau nhất",
      sortPrice: "Giá thấp nhất",
      sortDestination: "Điểm đến A–Z",
      gapLabel: "Độ lệch giờ đến tối đa",
      gapAny: "Bất kỳ",
      gapHours: (h: number) => `≤ ${h} giờ`,
      priceLabel: "Giá tối đa / người",
      priceAny: "Bất kỳ",
      showing: (shown: number, total: number) => `Hiển thị ${shown} / ${total}`,
    },
    timeline: {
      title: "Độ phân tán giờ đến",
      arriveWithin: (text: string) => `đến trong vòng ${text}`,
    },
    relax: {
      title: "Chưa có kết quả phù hợp",
      body: "Mở rộng tìm kiếm và chạy lại — các lần tìm lặp lại sẽ dùng lại giá vé đã lưu trong bộ nhớ đệm.",
      gap30: "Nới độ lệch lên 30 giờ",
      budget50: (amount: string) => `+${amount} ngân sách`,
      days3: "+3 ngày cửa sổ",
      running: "Đang bắt đầu tìm kiếm mới…",
    },
  },
  weather: {
    title: (city: string) => `Thời tiết tại ${city} — 7 ngày tới`,
    rain: (pct: number) => `mưa ${pct}%`,
    source: "Dự báo: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "Trời quang",
      partlyCloudy: "Có mây",
      cloudy: "Nhiều mây",
      fog: "Sương mù",
      rain: "Mưa",
      snow: "Tuyết",
      showers: "Mưa rào",
      thunderstorm: "Dông bão",
    },
  },
  hero: {
    title: (city: string, country: string) => `Điểm giữa tốt nhất cho các bạn: ${city}, ${country}`,
    gap: (text: string) => `mọi người đến trong vòng ${text}`,
    from: (price: string) => `chỉ từ ${price} / người`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "Xem lựa chọn này",
  },
  surprise: {
    button: "Chọn ngẫu nhiên cho tôi",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — lệch ${gap}, ${total}`,
  },
  popular: {
    title: "Điểm giữa được yêu thích",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Chưa có điểm đến yêu thích nào",
  },
  ads: {
    label: "Được tài trợ",
  },
  share: {
    pageTitle: "tìm kiếm midspot",
    loading: "Đang tải tìm kiếm…",
    notFoundTitle: "Liên kết tìm kiếm này không khả dụng",
    notFoundBody:
      "Có thể đã hết hạn (tìm kiếm được lưu 7 ngày) hoặc liên kết sai.",
    backHome: "Về midspot",
    errorPrefix: "Lỗi tìm kiếm: ",
  },
  notFound: {
    title: "Không tìm thấy trang",
    body: "Trang bạn đang tìm không tồn tại hoặc đã được chuyển.",
    backHome: "Về midspot",
  },
  common: {
    loading: "Đang tải…",
  },
  consent: {
    title: "Cookie",
    body: "Chúng tôi dùng cookie cần thiết để ghi nhớ ngôn ngữ và lựa chọn của bạn tại đây. Cookie quảng cáo (EthicalAds / CarbonAds) chỉ tải khi bạn chọn “Chấp nhận tất cả”.",
    acceptAll: "Chấp nhận tất cả",
    essentialOnly: "Chỉ cần thiết",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `Ảnh: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "Điểm đến",
      indexDescription:
        "Duyệt các thành phố châu Âu mà midspot có thể tìm làm điểm giữa cho nhóm của bạn — xếp theo tần suất được du khách chọn.",
      cityTitle: (city: string) => `Gặp nhau tại ${city}`,
      cityDescription: (city: string, country: string) =>
        `Gặp nhau tại ${city}, ${country} — xem vì sao nơi này phù hợp làm điểm giữa cho bạn bè và gia đình bay từ các thành phố khác nhau, rồi tự tìm điểm giữa của riêng bạn.`,
    },
    index: {
      eyebrow: "Điểm đến",
      title: "Nhóm của bạn nên gặp nhau ở đâu?",
      subtitle:
        "Mỗi thành phố bên dưới là một điểm đến mà midspot có thể tìm làm điểm giữa tiềm năng cho 2–8 du khách bay từ các sân bay quê nhà khác nhau. Chọn một thành phố để xem vì sao nó phù hợp — hoặc quay lại và để tìm kiếm lo điểm giữa cho bạn.",
      searchPlaceholder: "Tìm thành phố, quốc gia hoặc mã sân bay…",
      empty: "Không có điểm đến nào khớp với tìm kiếm của bạn.",
      showing: (shown: number, total: number) => `Đang hiển thị ${shown} / ${total} điểm đến`,
      airports: (codes: string) => `Sân bay: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Chưa từng được chọn làm điểm giữa"
          : count === 1
            ? "Được chọn làm điểm giữa 1 lần"
            : `Được chọn làm điểm giữa ${count} lần`,
    },
    city: {
      back: "Tất cả điểm đến",
      pitch: (city: string) => `Gặp nhau tại ${city} — điểm giữa phù hợp với mọi người.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) là một trong những điểm đến mà midspot tìm khi một nhóm bạn bè hoặc gia đình muốn gặp nhau. Mọi người đều bay từ sân bay quê nhà của mình; chúng tôi xếp các điểm đến theo mức độ mọi người đến gần nhau, rồi theo giá — trong phạm vi ngân sách của bạn.`,
      airportsLabel: "Các sân bay được phục vụ",
      statsLabel: "Số lần được chọn làm điểm giữa (90 ngày qua)",
      statsEmpty: "Chưa có tìm kiếm nào — hãy là nhóm đầu tiên gặp nhau ở đây.",
      howTitle: "Cách hoạt động",
      howSteps: [
        {
          title: "Thêm sân bay quê nhà của mọi người",
          body: "2–8 du khách, mỗi người từ thành phố riêng — chúng tôi tìm giá vé thật từ tất cả các sân bay.",
        },
        {
          title: "Đặt ngày, số đêm và ngân sách",
          body: "Ngày linh hoạt hoặc cả tháng; ngân sách mỗi người bao gồm vé đi và về.",
        },
        {
          title: "Chúng tôi xếp hạng các điểm giữa",
          body: "Điểm đến được sắp xếp theo độ lệch giờ đến (mọi người hạ cánh cách nhau trong vòng 24 giờ), sau đó theo tổng giá.",
        },
      ],
      faqTitle: "Câu hỏi thường gặp",
      // “{city}” sẽ được thay bằng tên thành phố của trang khi hiển thị
      faqs: [
        {
          q: "Vì sao {city} là một điểm giữa tốt?",
          a: "{city} dễ đến bằng các chuyến bay ngắn, tần suất cao từ khắp châu Âu, nên du khách từ các thành phố khác nhau thường đến cách nhau chỉ vài giờ — với tổng chi phí thấp. Chạy một lượt tìm kiếm, midspot sẽ so sánh {city} với mọi lựa chọn khác.",
        },
        {
          q: "Tôi có đặt vé qua midspot không?",
          a: "Không. midspot chỉ tìm và xếp hạng điểm giữa; việc đặt vé diễn ra trên trang của đối tác (ví dụ Kiwi.com) qua liên kết affiliate, với cùng một mức giá cho bạn.",
        },
        {
          q: "Giá có thật không?",
          a: "Giá đến từ dữ liệu vé máy bay trực tiếp tại thời điểm tìm kiếm và có thể thay đổi — trang đặt vé luôn hiển thị giá cuối cùng.",
        },
      ],
      cta: "Tìm điểm giữa của bạn",
    },
  },
  blog: {
    meta: {
      title: "Blog",
      description:
        "Câu chuyện và ghi chép từ đội ngũ midspot — cách chúng tôi tìm điểm giữa cho các nhóm du khách bay từ nhiều thành phố khác nhau.",
    },
    title: "Chuyện từ điểm giữa",
    subtitle:
      "Ghi chép về việc gặp nhau nửa đường: cách tìm kiếm hoạt động, các nhóm đã thực sự gặp nhau ở đâu, và điều chúng tôi học được từ dữ liệu vé máy bay trực tiếp.",
    latest: "Bài mới nhất",
    empty: "Chưa có bài viết nào — quay lại sớm nhé.",
    readingTime: (minutes: number) => `đọc trong ${minutes} phút`,
    published: (date: string) => `Đăng ngày ${date}`,
    back: "Tất cả bài viết",
    prev: "Bài mới hơn",
    next: "Bài cũ hơn",
    share: "Sao chép liên kết",
    copied: "Đã sao chép liên kết!",
    copyFailed: "Không sao chép được — hãy chọn URL thủ công",
    rss: "Nguồn RSS",
  },
  stats: {
    title: "Thống kê trang web",
    subtitle: "Phân tích riêng của midspot, bảo vệ quyền riêng tư — chỉ dữ liệu tổng hợp, không bao giờ lưu IP.",
    secretLabel: "Mã bí mật thống kê",
    secretPlaceholder: "Dán mã bí mật thống kê",
    unlock: "Tải thống kê",
    loading: "Đang tải…",
    unauthorized:
      "Mã bí mật sai hoặc thiếu (401). Mã này không được nhúng trong trang — hãy hỏi chủ trang web.",
    error: "Không tải được thống kê.",
    retry: "Thử lại",
    totals: { searches: "Tìm kiếm", results: "Kết quả", pageviews: "Lượt xem" },
    searchesChart: "Tìm kiếm mỗi ngày — 30 ngày qua",
    pageviewsChart: "Lượt xem mỗi ngày — 30 ngày qua",
    popularRoutes: "Cặp điểm xuất phát phổ biến — 30 ngày qua",
    providerUsage: "Mức dùng nhà cung cấp — tháng này",
    table: {
      day: "Ngày",
      count: "Số lượng",
      total: "Tổng",
      route: "Tuyến",
      searches: "Tìm kiếm",
      provider: "Nhà cung cấp",
      calls: "Lượt gọi",
      cap: "Giới hạn tháng",
      pctUsed: "% giới hạn",
    },
    noData: "Chưa có dữ liệu.",
    cloudflareNote:
      "Bảng điều khiển Cloudflare cũng hiển thị lưu lượng ở edge (mọi yêu cầu đến CDN edge, bao gồm bot và tài nguyên đã lưu đệm) — trang này chỉ hiển thị những gì midspot tự phục vụ và lưu trong cơ sở dữ liệu riêng.",
  },
  footer: {
    destinations: "Điểm đến",
    blog: "Blog",
    privacy: "Quyền riêng tư",
    terms: "Điều khoản",
    cookieSettings: "Cài đặt cookie",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Ngôn ngữ",
  },
  currency: {
    label: "Tiền tệ",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · tỷ giá ECB ngày ${date}`,
  },
  theme: {
    label: "Giao diện",
    light: "Sáng",
    dark: "Tối",
    system: "Theo hệ thống",
  },
};
