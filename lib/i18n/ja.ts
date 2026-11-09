// 日本語 — en.ts（ソース）と完全に同じキー構造。法的ページ（privacy/terms）は
// この言語では省略され、英語で表示されます。
import type { LangMessages } from "./en";

export const ja: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "真ん中で会いましょう",
    heroSubtitle:
      "みんなが自宅から飛び、3つ目の目的地で会います——到着は日単位ではなく時間単位の差。到着時間の差を優先し、次に料金で並べ替え、予算内で絞り込みます。",
    heroPoints: [
      "2〜8人の旅行者、それぞれが自分の街から出発",
      "目的地で会う——お互いの自宅ではなく",
      "到着時間の差を優先（最大24時間）、次に料金",
      "出発日は柔軟に——月まるごとの指定もOK",
    ],
    heroExample:
      "例：あなたはブカレストから、友人はベルリンから出発 → バルセロナで合流。到着の差は2時間——3日ではありません。",
  },
  form: {
    title: "旅行を計画する",
    originsLabel: "みんなはどこから飛びますか？",
    originsHint: "2〜8つの出発空港、1人につき1つ",
    originPlaceholder: "都市または空港を検索…",
    originSelectedPlaceholder: "空港を選択",
    addOrigin: "旅行者を追加",
    removeOrigin: "削除",
    maxOriginsReached: "最大8人まで",
    minOriginsHint: "最低2人必要です",
    locationButton: "現在地を使う",
    locationLocating: "現在地を検出中…",
    locationFailed: "現在地を検出できませんでした——空港を手動で選んでください",
    locationNoEmptyRow: "旅行者の枠はすべて埋まっています",
    autocomplete: {
      searching: "空港を検索中…",
      minChars: "2文字以上入力してください…",
      empty: "空港が見つかりませんでした。",
    },
    datesLabel: "旅行の日程",
    datesPlaceholder: "出発日と帰国日を選択",
    datesHint: "出発 → 帰国 — 泊数は自動で計算されます",
    flexLabel: "出発日の柔軟性",
    flexDays: (days: number) =>
      days === 0 ? "±0日（日付を固定）" : `±${days}日`,
    monthMode: "月まるごと",
    monthLabel: "月",
    monthHint: "月全体をスキャンして、最安の14日間を自動で選びます",
    nightsLabel: "泊数",
    nightsHint: "1〜30",
    nightsLabelMonth: "泊数（自由に選択）",
    nightsAutoHint: "旅行日程から自動で計算されます",
    monthSampling: (month: string) => `${month}の最安14日間を選定中…`,
    fewerNights: "泊数を減らす",
    moreNights: "泊数を増やす",
    budgetLabel: "1人あたりの予算",
    budgetHint: (cur: string) => `往復フライト代を含む（${cur}建て）`,
    maxFlightLabel: "最大フライト時間（任意）",
    maxFlightAny: "制限なし",
    maxFlightHours: (h: number) => `最大${h}時間`,
    submit: "中間地点を探す",
    submitting: "検索を開始中…",
    errors: {
      originsRequired: "出発空港を2つ以上選んでください",
      originsUnique: "旅行者ごとに異なる出発空港を選んでください",
      datesRequired: "出発日と帰国日を選択してください",
      nightsRequired: "泊数を選んでください（1〜30）",
      budgetRequired: (min: string, max: string) =>
        `予算は1人あたり${min}〜${max}の範囲で指定してください`,
      validationFailed: "フォームを確認してください——無効な項目があります",
      rateLimited: (retryAfterSeconds?: number) =>
        `検索回数が多すぎます——${retryAfterSeconds ? `${retryAfterSeconds}秒` : "しばらく"}待ってからもう一度お試しください`,
      generic: "問題が発生しました。もう一度お試しください。",
      network: "サーバーに接続できませんでした。接続を確認して再試行してください。",
    },
  },
  waiting: {
    title: "あなたの中間地点を探しています…",
    subtitle:
      "各出発空港から候補地へのフライトをスキャン中です。通常1分もかかりません。",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `ステップ ${done} / ${total}` : "準備中…",
    partialTitle: "これまでに見つかった候補",
    cancel: "検索をキャンセル",
    cancelling: "キャンセル中…",
    cancelDialogTitle: "この検索をキャンセルしますか？",
    cancelDialogBody:
      "検索は停止しますが、これまでに見つかった目的地は下に表示されたままです。",
    cancelDialogConfirm: "はい、キャンセル",
    cancelDialogDismiss: "検索を続ける",
  },
  history: {
    title: "最近の検索",
    clear: "クリア",
    chipAria: (label: string) => `検索を開く: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `写真: ${credit} · ${license}（Wikimedia Commons）`,
    title: "あなたたちの中間地点",
    subtitle: "みんなの到着がどれだけ近いかで順位付けし、次に合計金額で並べ替えます。",
    empty: "予算と到着時間差の条件にまだ合う目的地がありません。",
    gapBadge: (text: string) => `全員が${text}以内に到着`,
    gapRelaxed: (hours: number) =>
      `標準の24時間以内に一致するものがなかったため、到着時間差を${hours}時間に広げました`,
    outbound: (date: string) => `往路 · ${date}`,
    returnLeg: (date: string) => `復路 · ${date}`,
    perPersonTotal: "1人あたり",
    groupTotal: "グループ合計",
    bookOutbound: "往路を予約",
    bookReturn: "復路を予約",
    stay: (city: string) => `${city}に宿泊`,
    stayNote: "アフィリエイトリンク",
    extras: {
      title: "追加サービス",
      transfer: "空港送迎",
      car: "レンタカー",
      esim: "eSIM",
      activities: "アクティビティ",
    },
    priceNote: "料金は検索時点のものです——予約サイトにライブ価格が表示されます。",
    share: "共有リンクをコピー",
    copied: "共有リンクをコピーしました！",
    copyFailed: "コピーできませんでした——URLを手動で選択してください",
    shareCard: "共有カードをダウンロード",
    shareCardDownloaded: "共有カードをダウンロードしました——ダウンロードを確認してください！",
    shareCardFailed: "共有カードを作成できませんでした——もう一度お試しください",
    invite: "招待をコピー",
    inviteCopied: "招待をコピーしました——グループチャットに貼り付けてください！",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `${city}（${country}）で会いましょう、${dep} → ${ret}！みんなが互いに${gap}以内に到着できるフライトが見つかりました: ${url}`,
    cancelledBanner: "検索はキャンセルされました——これまでに見つかった目的地を表示しています。",
    failedTitle: "検索に失敗しました",
    failedRetry: "トップページから新しい検索を始める",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n}泊`,
    usageLimited: "月間の検索上限に達しました——キャッシュされた結果のみ表示しています。",
    map: {
      title: "地図",
      origins: "出発空港",
      destinations: "目的地",
      airports: "すべての候補空港",
      tooltip: {
        gap: (text: string) => `${text}以内に到着`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "グループ合計",
        perPerson: "1人あたり",
      },
    },
    toolbar: {
      sortLabel: "並び替え",
      sortGap: "到着が近い順",
      sortPrice: "料金が安い順",
      sortDestination: "目的地名 A〜Z",
      gapLabel: "到着時間差の上限",
      gapAny: "指定なし",
      gapHours: (h: number) => `≤ ${h}時間`,
      priceLabel: "1人あたりの上限価格",
      priceAny: "指定なし",
      showing: (shown: number, total: number) => `${total}件中${shown}件を表示`,
    },
    timeline: {
      title: "到着時間のばらつき",
      arriveWithin: (text: string) => `${text}以内に到着`,
    },
    relax: {
      title: "まだ一致する結果がありません",
      body: "検索範囲を広げて再実行してください——繰り返しの検索ではキャッシュされた航空券の価格が再利用されます。",
      gap30: "時間差を30時間に緩和",
      budget50: (amount: string) => `予算を+${amount}上乗せ`,
      days3: "+3日の幅",
      running: "新しい検索を開始中…",
    },
  },
  weather: {
    title: (city: string) => `${city}の天気 — 今後7日間`,
    rain: (pct: number) => `降水確率 ${pct}%`,
    source: "天気予報: Open-Meteo（CC BY 4.0）",
    labels: {
      clear: "快晴",
      partlyCloudy: "晴れ時々くもり",
      cloudy: "くもり",
      fog: "霧",
      rain: "雨",
      snow: "雪",
      showers: "にわか雨",
      thunderstorm: "雷雨",
    },
  },
  hero: {
    title: (city: string, country: string) => `あなたたちに最適な中間地点: ${city}、${country}`,
    gap: (text: string) => `全員が${text}以内に到着`,
    from: (price: string) => `1人あたり ${price}〜`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "この候補を見る",
  },
  surprise: {
    button: "おまかせで選ぶ",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — 到着差 ${gap}、${total}`,
  },
  popular: {
    title: "人気の中間地点",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "まだ人気の地点がありません",
  },
  ads: {
    label: "スポンサー",
  },
  share: {
    pageTitle: "midspot検索",
    loading: "検索を読み込み中…",
    notFoundTitle: "この検索リンクは利用できません",
    notFoundBody:
      "有効期限が切れたか（検索は7日間保存されます）、リンクが間違っている可能性があります。",
    backHome: "midspotに戻る",
    errorPrefix: "検索エラー: ",
  },
  notFound: {
    title: "ページが見つかりません",
    body: "お探しのページは存在しないか、移動しました。",
    backHome: "midspotに戻る",
  },
  common: {
    loading: "読み込み中…",
  },
  consent: {
    title: "Cookie",
    body: "言語とここでの選択を覚えておくために必要なCookieを使用しています。「すべて許可」を選んだ場合のみ、広告Cookie（EthicalAds / CarbonAds）が読み込まれます。",
    acceptAll: "すべて許可",
    essentialOnly: "必要なもののみ",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `写真: ${credit} · ${license}（Wikimedia Commons）`,
    meta: {
      indexTitle: "目的地",
      indexDescription:
        "midspotがグループの中間地点として検索できるヨーロッパの都市を見て回りましょう——旅行者に選ばれた回数順に並んでいます。",
      cityTitle: (city: string) => `${city}で会う`,
      cityDescription: (city: string, country: string) =>
        `${city}、${country}で会いましょう——異なる都市から出発する友人や家族の中間地点としてなぜ適しているかを見て、自分たちの中間地点を見つけてください。`,
    },
    index: {
      eyebrow: "目的地",
      title: "グループはどこで会うべき？",
      subtitle:
        "以下の各都市は、異なる出発空港から飛ぶ2〜8人の旅行者の潜在的な中間地点としてmidspotが検索できる目的地です。どれか1つ選んで、なぜそれが機能するのかを確認——あるいは戻って、検索に中間地点を見つけてもらいましょう。",
      searchPlaceholder: "都市、国、または空港コードで検索…",
      empty: "検索に一致する目的地がありません。",
      showing: (shown: number, total: number) => `${total}件中${shown}件を表示`,
      airports: (codes: string) => `空港: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "まだ中間地点として選ばれていません"
          : count === 1
            ? "中間地点として1回選ばれました"
            : `中間地点として${count}回選ばれました`,
    },
    city: {
      back: "すべての目的地",
      pitch: (city: string) => `${city}で会う——みんなにちょうどいい中間地点。`,
      pitchBody: (city: string, country: string) =>
        `${city}（${country}）は、友人や家族のグループが集まりたいときにmidspotが検索する目的地のひとつです。みんながそれぞれの出発空港から飛びます。到着時間の近さで目的地を順位付けし、次に料金で並べ替えます——予算内で。`,
      airportsLabel: "就航している空港",
      statsLabel: "過去90日間に中間地点として選ばれた回数",
      statsEmpty: "まだ検索がありません——ここで会う最初のグループになりましょう。",
      howTitle: "仕組み",
      howSteps: [
        {
          title: "みんなの出発空港を追加",
          body: "2〜8人、それぞれ別の街から——すべての空港から実際の航空券価格を検索します。",
        },
        {
          title: "日程・泊数・予算を設定",
          body: "柔軟な日程または月まるごと。往復を含む1人あたりの予算。",
        },
        {
          title: "中間地点を順位付け",
          body: "目的地は到着時間差（全員が互いに24時間以内に到着）で並べ替え、次に合計金額で並べ替えます。",
        },
      ],
      faqTitle: "よくある質問",
      // 「{city}」は表示時にページの都市名に置き換えられます
      faqs: [
        {
          q: "なぜ{city}は良い中間地点なの？",
          a: "{city}はヨーロッパ各地から短くて便数の多いフライトで行けるため、異なる都市から来る旅行者も互いに数時間以内に到着することが多く、合計金額も安く済みます。検索を実行すると、midspotが他のすべての選択肢と比較します。",
        },
        {
          q: "midspotでフライトを予約するの？",
          a: "いいえ。midspotは中間地点を見つけて順位付けするだけです。予約はアフィリエイトリンク経由でパートナーサイト（例: Kiwi.com）で行われ、料金はあなたにとって変わりません。",
        },
        {
          q: "料金は本物？",
          a: "料金は検索時点のライブフライトデータによるもので、変動する場合があります——予約サイトには常に最終価格が表示されます。",
        },
      ],
      cta: "自分たちの中間地点を探す",
    },
  },
  blog: {
    meta: {
      title: "ブログ",
      description:
        "midspotチームからのストーリーとメモ——異なる都市から出発する旅行グループの中間地点をどう見つけるか。",
    },
    title: "中間からのストーリー",
    subtitle:
      "中途で会うことについてのメモ: 検索の仕組み、グループが実際に会った場所、そしてライブフライトデータから学んだこと。",
    latest: "最新のストーリー",
    empty: "まだ記事がありません——また近日中にお越しください。",
    readingTime: (minutes: number) => `${minutes}分で読めます`,
    published: (date: string) => `${date}に公開`,
    back: "すべての記事",
    prev: "新しい記事",
    next: "古い記事",
    share: "リンクをコピー",
    copied: "リンクをコピーしました！",
    copyFailed: "コピーできませんでした——URLを手動で選択してください",
    rss: "RSSフィード",
  },
  stats: {
    title: "サイト統計",
    subtitle: "midspot独自のプライバシーに配慮した分析——集計データのみで、IPアドレスは一切記録しません。",
    secretLabel: "統計シークレット",
    secretPlaceholder: "統計シークレットを貼り付け",
    unlock: "統計を読み込む",
    loading: "読み込み中…",
    unauthorized:
      "シークレットが間違っているか未入力です（401）。このページにはシークレットが埋め込まれていません——サイト所有者に尋ねてください。",
    error: "統計を読み込めませんでした。",
    retry: "再試行",
    totals: { searches: "検索", results: "結果", pageviews: "ページビュー" },
    searchesChart: "1日ごとの検索数 — 過去30日間",
    pageviewsChart: "1日ごとのページビュー — 過去30日間",
    popularRoutes: "人気の出発ペア — 過去30日間",
    providerUsage: "プロバイダー使用状況 — 今月",
    table: {
      day: "日付",
      count: "件数",
      total: "合計",
      route: "ルート",
      searches: "検索",
      provider: "プロバイダー",
      calls: "呼び出し",
      cap: "月間上限",
      pctUsed: "上限に対する%",
    },
    noData: "まだデータがありません。",
    cloudflareNote:
      "Cloudflareダッシュボードにはエッジトラフィック（ボットやキャッシュされたアセットを含む、CDNエッジに届いたすべてのリクエスト）も表示されます。このページに表示されるのは、midspot自身が提供し独自のデータベースに保存しているものだけです。",
  },
  footer: {
    destinations: "目的地",
    blog: "ブログ",
    privacy: "プライバシー",
    terms: "利用規約",
    cookieSettings: "Cookie設定",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "言語",
  },
  currency: {
    label: "通貨",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · ECBレート（${date}）`,
  },
  theme: {
    label: "テーマ",
    light: "ライト",
    dark: "ダーク",
    system: "システム",
  },
};
