// 中文（简体）— 与 en.ts（信源）保持完全相同的键结构。法律页面（privacy/terms）
// 在本语言中省略，回退显示英文。
import type { LangMessages } from "./en";

export const zh: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "在中间相会",
    heroSubtitle:
      "一个目的地，每个人都从自己的家乡出发，所有人都在彼此一天之内到达——而且不超出你的预算。",
    heroPoints: [
      "2–8 位旅客，每人来自不同的城市",
      "出行日期灵活——也可以直接选一整个月",
      "先按到达时间差排序，再按价格排序",
    ],
  },
  form: {
    title: "规划行程",
    originsLabel: "大家分别从哪里出发？",
    originsHint: "2–8 个出发机场，每人一个",
    originPlaceholder: "搜索城市或机场…",
    originSelectedPlaceholder: "选择一个机场",
    addOrigin: "添加旅客",
    removeOrigin: "移除",
    maxOriginsReached: "最多 8 位旅客",
    minOriginsHint: "至少 2 位旅客",
    locationButton: "使用我的位置",
    locationLocating: "正在检测你的位置…",
    locationFailed: "无法检测你的位置——请手动选择机场",
    locationNoEmptyRow: "所有旅客名额都已填满",
    autocomplete: {
      searching: "正在搜索机场…",
      minChars: "至少输入 2 个字符…",
      empty: "未找到机场。",
    },
    datesLabel: "出行日期",
    datesPlaceholder: "选择出发和返程日期",
    datesHint: "出发 → 返程——住宿天数会自动计算",
    flexLabel: "出发日期灵活度",
    flexDays: (days: number) =>
      days === 0 ? "±0 天（确切日期）" : `±${days} 天`,
    monthMode: "整个月",
    monthLabel: "月份",
    monthHint: "我们会扫描整个月，并自动挑选最便宜的 14 天行程",
    nightsLabel: "住宿天数",
    nightsHint: "1–30",
    nightsLabelMonth: "住宿天数（自选）",
    nightsAutoHint: "根据你的出行日期自动计算",
    monthSampling: (month: string) => `正在挑选 ${month} 中最便宜的 14 天…`,
    fewerNights: "减少天数",
    moreNights: "增加天数",
    budgetLabel: "人均预算",
    budgetHint: (cur: string) => `包含去程 + 返程机票，以 ${cur} 计`,
    maxFlightLabel: "最长飞行时间（可选）",
    maxFlightAny: "任意时长",
    maxFlightHours: (h: number) => `最长 ${h} 小时`,
    submit: "查找中间地点",
    submitting: "正在开始搜索…",
    errors: {
      originsRequired: "请至少选择 2 个出发机场",
      originsUnique: "每位旅客的出发机场必须不同",
      datesRequired: "请选择出发和返程日期",
      nightsRequired: "请选择住宿天数（1–30）",
      budgetRequired: (min: string, max: string) =>
        `预算必须在每人 ${min} 到 ${max} 之间`,
      validationFailed: "请检查表单——有些字段无效",
      rateLimited: (retryAfterSeconds?: number) =>
        `搜索次数过多——请稍等${retryAfterSeconds ? ` ${retryAfterSeconds} 秒` : "片刻"}后重试`,
      generic: "出错了，请重试。",
      network: "无法连接服务器，请检查网络后重试。",
    },
  },
  waiting: {
    title: "正在寻找你们的中间地点…",
    subtitle:
      "我们正在扫描从每个出发机场飞往候选目的地的航班。通常不到一分钟。",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `第 ${done} / ${total} 步` : "正在准备…",
    partialTitle: "目前已找到",
    cancel: "取消搜索",
    cancelling: "正在取消…",
    cancelDialogTitle: "取消这次搜索？",
    cancelDialogBody: "搜索将停止，但已找到的目的地仍会显示在下方。",
    cancelDialogConfirm: "是的，取消",
    cancelDialogDismiss: "继续搜索",
  },
  history: {
    title: "最近搜索",
    clear: "清除",
    chipAria: (label: string) => `打开搜索：${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `图片：${credit} · ${license}（Wikimedia Commons）`,
    title: "你们的中间地点",
    subtitle: "按大家到达时间的接近程度排序，再按总价排序。",
    empty: "还没有符合你的预算和到达时间差限制的目的地。",
    gapBadge: (text: string) => `所有人都在 ${text} 内到达`,
    gapRelaxed: (hours: number) =>
      `标准 24 小时范围内没有匹配项——到达时间差已放宽至 ${hours} 小时`,
    outbound: (date: string) => `去程 · ${date}`,
    returnLeg: (date: string) => `返程 · ${date}`,
    perPersonTotal: "每人",
    groupTotal: "团体总计",
    bookOutbound: "预订去程",
    bookReturn: "预订返程",
    stay: (city: string) => `入住 ${city}`,
    stayNote: "联盟链接",
    extras: {
      title: "附加服务",
      transfer: "机场接送",
      car: "租车",
      esim: "eSIM",
      activities: "活动体验",
    },
    priceNote: "价格为搜索时刻的价格——预订网站会显示实时价格。",
    share: "复制分享链接",
    copied: "分享链接已复制！",
    copyFailed: "无法复制——请手动选择网址",
    shareCard: "下载分享卡片",
    shareCardDownloaded: "分享卡片已下载——请查看你的下载内容！",
    shareCardFailed: "无法创建分享卡片——请重试",
    invite: "复制邀请",
    inviteCopied: "邀请已复制——粘贴到你的群聊中吧！",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `我们在 ${city}（${country}）见面吧，${dep} → ${ret}！我们找到了让所有人都在彼此 ${gap} 内到达的航班：${url}`,
    cancelledBanner: "搜索已取消——显示目前已找到的目的地。",
    failedTitle: "搜索失败",
    failedRetry: "从首页重新开始搜索",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} 晚`,
    usageLimited: "已达到每月搜索次数限制——仅显示缓存结果。",
    map: {
      title: "地图",
      origins: "出发机场",
      destinations: "目的地",
      airports: "所有候选机场",
      tooltip: {
        gap: (text: string) => `在 ${text} 内到达`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "团体总计",
        perPerson: "每人",
      },
    },
    toolbar: {
      sortLabel: "排序方式",
      sortGap: "到达时间最接近",
      sortPrice: "价格最低",
      sortDestination: "目的地 A–Z",
      gapLabel: "最大到达时间差",
      gapAny: "任意",
      gapHours: (h: number) => `≤ ${h} 小时`,
      priceLabel: "最高价格 / 人",
      priceAny: "任意",
      showing: (shown: number, total: number) => `显示 ${total} 个中的 ${shown} 个`,
    },
    timeline: {
      title: "到达时间分布",
      arriveWithin: (text: string) => `在 ${text} 内到达`,
    },
    relax: {
      title: "还没有匹配项",
      body: "扩大搜索范围后重新运行——重复搜索会复用缓存的机票价格。",
      gap30: "将时间差放宽至 30 小时",
      budget50: (amount: string) => `+${amount} 预算`,
      days3: "+3 天窗口期",
      running: "正在开始新搜索…",
    },
  },
  weather: {
    title: (city: string) => `${city} 天气——未来 7 天`,
    rain: (pct: number) => `降雨概率 ${pct}%`,
    source: "天气预报：Open-Meteo（CC BY 4.0）",
    labels: {
      clear: "晴朗",
      partlyCloudy: "多云间晴",
      cloudy: "阴天",
      fog: "雾",
      rain: "雨",
      snow: "雪",
      showers: "阵雨",
      thunderstorm: "雷暴",
    },
  },
  hero: {
    title: (city: string, country: string) => `最适合你们的中间地点：${city}，${country}`,
    gap: (text: string) => `所有人在 ${text} 内到达`,
    from: (price: string) => `人均低至 ${price}`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "查看此选项",
  },
  surprise: {
    button: "给我一个惊喜",
    toast: (city: string, gap: string, total: string) => `🎲 ${city}——相差 ${gap}，合计 ${total}`,
  },
  popular: {
    title: "热门中间地点",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "还没有热门地点",
  },
  ads: {
    label: "赞助内容",
  },
  share: {
    pageTitle: "midspot 搜索",
    loading: "正在加载搜索…",
    notFoundTitle: "此搜索链接不可用",
    notFoundBody: "它可能已过期（搜索仅保存 7 天）或链接有误。",
    backHome: "返回 midspot",
    errorPrefix: "搜索错误：",
  },
  notFound: {
    title: "页面未找到",
    body: "你寻找的页面不存在或已被移动。",
    backHome: "返回 midspot",
  },
  common: {
    loading: "加载中…",
  },
  consent: {
    title: "Cookie",
    body: "我们使用必要的 Cookie 来记住你的语言和你在此处的选择。只有当你选择“接受全部”时，才会加载广告 Cookie（EthicalAds / CarbonAds）。",
    acceptAll: "接受全部",
    essentialOnly: "仅必要 Cookie",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `图片：${credit} · ${license}（Wikimedia Commons）`,
    meta: {
      indexTitle: "目的地",
      indexDescription:
        "浏览 midspot 可以为你的团队搜索的欧洲城市中间地点——按旅客选择频率排序。",
      cityTitle: (city: string) => `在 ${city} 相会`,
      cityDescription: (city: string, country: string) =>
        `在 ${city}，${country} 相会——看看为什么它适合作为从不同城市出发的朋友和家人的中间碰面点，然后找到属于你们自己的中间地点。`,
    },
    index: {
      eyebrow: "目的地",
      title: "你的团队应该在哪里碰面？",
      subtitle:
        "下面的每个城市都是 midspot 可以搜索的目的地，适合 2–8 位从不同出发机场出发的旅客作为可能的中间地点。选择一个城市，看看为什么它合适——或者返回，让搜索为你找到中间地点。",
      searchPlaceholder: "搜索城市、国家或机场代码…",
      empty: "没有符合你搜索的目的地。",
      showing: (shown: number, total: number) => `正在显示 ${total} 个目的地中的 ${shown} 个`,
      airports: (codes: string) => `机场：${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "还未被选为中间地点"
          : count === 1
            ? "被选为中间地点 1 次"
            : `被选为中间地点 ${count} 次`,
    },
    city: {
      back: "所有目的地",
      pitch: (city: string) => `在 ${city} 相会——适合所有人的中间地点。`,
      pitchBody: (city: string, country: string) =>
        `${city}（${country}）是 midspot 在朋友或家人想要聚会时会搜索的目的地之一。每个人都从自己的出发机场出发；我们按大家到达的接近程度对目的地排序，再按价格排序——不超出你的预算。`,
      airportsLabel: "通航机场",
      statsLabel: "过去 90 天被选为中间地点的次数",
      statsEmpty: "还没有搜索记录——成为第一个在这里碰面的团队吧。",
      howTitle: "使用方法",
      howSteps: [
        {
          title: "添加每个人的出发机场",
          body: "2–8 位旅客，每人来自自己的城市——我们搜索所有出发地的真实票价。",
        },
        {
          title: "设置日期、天数和预算",
          body: "灵活的日期或一整个月；人均预算需包含去程和返程。",
        },
        {
          title: "我们为你排序中间地点",
          body: "目的地按到达时间差排序（所有人在彼此 24 小时内到达），再按总价排序。",
        },
      ],
      faqTitle: "常见问题",
      // “{city}”在渲染时会被替换为当前页面的城市名
      faqs: [
        {
          q: "为什么 {city} 是一个好的中间地点？",
          a: "{city} 从欧洲各地都有短途、班次密集的航班可达，因此来自不同城市的旅客通常只相差几小时就能到达——而且总价往往较低。运行一次搜索，midspot 就会把它与所有其他选项进行比较。",
        },
        {
          q: "我需要通过 midspot 订票吗？",
          a: "不用。midspot 只负责寻找并排序中间地点；预订在合作伙伴网站（如 Kiwi.com）通过联盟链接完成，你支付的价格完全一样。",
        },
        {
          q: "价格是真实的吗？",
          a: "价格来自搜索时刻的实时航班数据，可能会变动——预订网站始终显示最终价格。",
        },
      ],
      cta: "找到你的中间地点",
    },
  },
  blog: {
    meta: {
      title: "博客",
      description:
        "来自 midspot 团队的故事与笔记——我们如何为从不同城市出发的旅行团找到中间地点。",
    },
    title: "来自中间的故事",
    subtitle:
      "关于在中途碰面的笔记：搜索如何运作、大家实际在哪里相聚，以及我们从实时航班数据中学到了什么。",
    latest: "最新故事",
    empty: "还没有文章——敬请期待。",
    readingTime: (minutes: number) => `阅读约 ${minutes} 分钟`,
    published: (date: string) => `发布于 ${date}`,
    back: "所有文章",
    prev: "较新的文章",
    next: "较旧的文章",
    share: "复制链接",
    copied: "链接已复制！",
    copyFailed: "无法复制——请手动选择网址",
    rss: "RSS 订阅源",
  },
  stats: {
    title: "网站统计",
    subtitle: "midspot 自有的隐私安全分析——仅聚合数据，绝不记录 IP 地址。",
    secretLabel: "统计密钥",
    secretPlaceholder: "粘贴统计密钥",
    unlock: "加载统计",
    loading: "加载中…",
    unauthorized:
      "密钥错误或缺失（401）。密钥不会打包进此页面——请向网站所有者索取。",
    error: "无法加载统计数据。",
    retry: "重试",
    totals: { searches: "搜索量", results: "结果数", pageviews: "浏览量" },
    searchesChart: "每日搜索量——最近 30 天",
    pageviewsChart: "每日浏览量——最近 30 天",
    popularRoutes: "热门出发地组合——最近 30 天",
    providerUsage: "数据提供商用量——本月",
    table: {
      day: "日期",
      count: "数量",
      total: "合计",
      route: "航线",
      searches: "搜索",
      provider: "提供商",
      calls: "调用次数",
      cap: "每月上限",
      pctUsed: "已用比例",
    },
    noData: "还没有数据。",
    cloudflareNote:
      "Cloudflare 面板还会显示边缘流量（所有到达 CDN 边缘的请求，包括机器人和缓存资源）——本页只显示 midspot 自身提供并存储在自己数据库中的内容。",
  },
  footer: {
    destinations: "目的地",
    blog: "博客",
    privacy: "隐私政策",
    terms: "服务条款",
    cookieSettings: "Cookie 设置",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "语言",
  },
  currency: {
    label: "货币",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 欧元 = ${rate} ${cur} · 欧洲央行 ${date} 汇率`,
  },
  theme: {
    label: "主题",
    light: "浅色",
    dark: "深色",
    system: "跟随系统",
  },
};
