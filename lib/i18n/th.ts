// ไทย — โครงสร้างคีย์เหมือนกับ en.ts (ต้นฉบับ) ทุกประการ หน้ากฎหมาย
// (privacy/terms) ไม่รวมในภาษานี้ จะแสดงเป็นภาษาอังกฤษแทน
import type { LangMessages } from "./en";

export const th: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "พบกันที่ตรงกลาง",
    heroSubtitle:
      "หนึ่งจุดหมาย ทุกคนบินออกจากบ้านตัวเอง และทุกคนมาถึงห่างกันไม่เกินหนึ่งวัน — อยู่ในงบประมาณของคุณ",
    heroPoints: [
      "นักเดินทาง 2–8 คน แต่ละคนมาจากเมืองของตัวเอง",
      "วันเดินทางยืดหยุ่นได้ — หรือเลือกทั้งเดือน",
      "เรียงตามช่วงเวลาที่มาถึง แล้วจึงเรียงตามราคา",
    ],
  },
  form: {
    title: "วางแผนทริป",
    originsLabel: "ทุกคนจะบินออกจากไหน?",
    originsHint: "2–8 สนามบินต้นทาง หนึ่งคนต่อหนึ่งแห่ง",
    originPlaceholder: "ค้นหาเมืองหรือสนามบิน…",
    originSelectedPlaceholder: "เลือกสนามบิน",
    addOrigin: "เพิ่มนักเดินทาง",
    removeOrigin: "ลบ",
    maxOriginsReached: "สูงสุด 8 คน",
    minOriginsHint: "อย่างน้อย 2 คน",
    locationButton: "ใช้ตำแหน่งของฉัน",
    locationLocating: "กำลังตรวจหาตำแหน่ง…",
    locationFailed: "ตรวจหาตำแหน่งไม่ได้ — กรุณาเลือกสนามบินด้วยตนเอง",
    locationNoEmptyRow: "ช่องนักเดินทางเต็มหมดแล้ว",
    autocomplete: {
      searching: "กำลังค้นหาสนามบิน…",
      minChars: "พิมพ์อย่างน้อย 2 ตัวอักษร…",
      empty: "ไม่พบสนามบิน",
    },
    datesLabel: "วันที่เดินทาง",
    datesPlaceholder: "เลือกวันไปและวันกลับ",
    datesHint: "ไป → กลับ — จำนวนคืนจะคำนวณอัตโนมัติ",
    flexLabel: "ความยืดหยุ่นของวันไป",
    flexDays: (days: number) =>
      days === 0 ? "±0 วัน (วันที่แน่นอน)" : `±${days} วัน`,
    monthMode: "ทั้งเดือน",
    monthLabel: "เดือน",
    monthHint: "เราสแกนทั้งเดือนและเลือกช่วง 14 วันที่ถูกที่สุดโดยอัตโนมัติ",
    nightsLabel: "จำนวนคืน",
    nightsHint: "1–30",
    nightsLabelMonth: "จำนวนคืน (เลือกเอง)",
    nightsAutoHint: "คำนวณอัตโนมัติจากวันที่เดินทางของคุณ",
    monthSampling: (month: string) => `กำลังเลือก 14 วันที่ถูกที่สุดใน${month}…`,
    fewerNights: "ลดจำนวนคืน",
    moreNights: "เพิ่มจำนวนคืน",
    budgetLabel: "งบประมาณต่อคน",
    budgetHint: (cur: string) => `รวมตั๋วขาไป + ขากลับ เป็น ${cur}`,
    maxFlightLabel: "เวลาบินสูงสุด (ไม่บังคับ)",
    maxFlightAny: "เท่าไรก็ได้",
    maxFlightHours: (h: number) => `สูงสุด ${h} ชม.`,
    submit: "หาสถานที่ตรงกลาง",
    submitting: "กำลังเริ่มค้นหา…",
    errors: {
      originsRequired: "เลือกสนามบินต้นทางอย่างน้อย 2 แห่ง",
      originsUnique: "นักเดินทางแต่ละคนต้องมีสนามบินต้นทางต่างกัน",
      datesRequired: "เลือกวันไปและวันกลับ",
      nightsRequired: "เลือกจำนวนคืน (1–30)",
      budgetRequired: (min: string, max: string) =>
        `งบประมาณต้องอยู่ระหว่าง ${min} ถึง ${max} ต่อคน`,
      validationFailed: "โปรดตรวจสอบแบบฟอร์ม — มีบางช่องไม่ถูกต้อง",
      rateLimited: (retryAfterSeconds?: number) =>
        `ค้นหาบ่อยเกินไป — โปรดรอ${retryAfterSeconds ? ` ${retryAfterSeconds} วินาที` : "สักครู่"}แล้วลองอีกครั้ง`,
      generic: "มีบางอย่างผิดพลาด โปรดลองอีกครั้ง",
      network: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ โปรดตรวจสอบการเชื่อมต่อและลองใหม่",
    },
  },
  waiting: {
    title: "กำลังหาจุดกึ่งกลางของคุณ…",
    subtitle:
      "เรากำลังสแกนเที่ยวบินจากทุกสนามบินต้นทางไปยังจุดหมายที่เป็นไปได้ โดยปกติใช้เวลาไม่ถึงหนึ่งนาที",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `ขั้นตอนที่ ${done} จาก ${total}` : "กำลังเตรียม…",
    partialTitle: "พบแล้วจนถึงตอนนี้",
    cancel: "ยกเลิกการค้นหา",
    cancelling: "กำลังยกเลิก…",
    cancelDialogTitle: "ยกเลิกการค้นหานี้?",
    cancelDialogBody:
      "การค้นหาจะหยุด แต่จุดหมายที่พบแล้วจะยังแสดงอยู่ด้านล่าง",
    cancelDialogConfirm: "ใช่ ยกเลิก",
    cancelDialogDismiss: "ค้นหาต่อ",
  },
  history: {
    title: "การค้นหาล่าสุด",
    clear: "ล้าง",
    chipAria: (label: string) => `เปิดการค้นหา: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `รูปภาพ: ${credit} · ${license} (Wikimedia Commons)`,
    title: "สถานที่ตรงกลางของคุณ",
    subtitle: "เรียงตามช่วงเวลาที่ทุกคนมาถึงใกล้กันมากที่สุด แล้วจึงเรียงตามราคารวม",
    empty: "ยังไม่มีจุดหมายที่ตรงกับงบประมาณและขีดจำกัดช่วงเวลามาถึงของคุณ",
    gapBadge: (text: string) => `ทุกคนมาถึงภายใน ${text}`,
    gapRelaxed: (hours: number) =>
      `ไม่มีผลลัพธ์ในขีดจำกัดมาตรฐาน 24 ชม. — ขยายช่วงเวลามาถึงเป็น ${hours} ชม.`,
    outbound: (date: string) => `ขาไป · ${date}`,
    returnLeg: (date: string) => `ขากลับ · ${date}`,
    perPersonTotal: "ต่อคน",
    groupTotal: "รวมทั้งกลุ่ม",
    bookOutbound: "จองขาไป",
    bookReturn: "จองขากลับ",
    stay: (city: string) => `พักที่ ${city}`,
    stayNote: "ลิงก์พันธมิตร",
    extras: {
      title: "บริการเสริม",
      transfer: "รถรับส่งสนามบิน",
      car: "เช่ารถ",
      esim: "eSIM",
      activities: "กิจกรรม",
    },
    priceNote: "ราคาคือราคาตอนค้นหา — เว็บจองจะแสดงราคาสด",
    share: "คัดลอกลิงก์แชร์",
    copied: "คัดลอกลิงก์แชร์แล้ว!",
    copyFailed: "คัดลอกไม่ได้ — โปรดเลือก URL ด้วยตนเอง",
    shareCard: "ดาวน์โหลดการ์ดแชร์",
    shareCardDownloaded: "ดาวน์โหลดการ์ดแชร์แล้ว — ตรวจสอบในดาวน์โหลดของคุณ!",
    shareCardFailed: "สร้างการ์ดแชร์ไม่ได้ — โปรดลองอีกครั้ง",
    invite: "คัดลอกคำเชิญ",
    inviteCopied: "คัดลอกคำเชิญแล้ว — แปะในแชตกลุ่มของคุณเลย!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `มาเจอกันที่ ${city} (${country}) ช่วง ${dep} → ${ret}! เราพบเที่ยวบินที่ทำให้ทุกคนมาถึงห่างกันไม่เกิน ${gap}: ${url}`,
    cancelledBanner: "ยกเลิกการค้นหาแล้ว — กำลังแสดงจุดหมายที่พบจนถึงตอนนี้",
    failedTitle: "การค้นหาล้มเหลว",
    failedRetry: "เริ่มการค้นหาใหม่จากหน้าแรก",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} คืน`,
    usageLimited: "ถึงขีดจำกัดการค้นหารายเดือนแล้ว — แสดงเฉพาะผลลัพธ์ที่แคชไว้",
    map: {
      title: "แผนที่",
      origins: "สนามบินต้นทาง",
      destinations: "จุดหมาย",
      airports: "สนามบินที่เป็นไปได้ทั้งหมด",
      tooltip: {
        gap: (text: string) => `มาถึงภายใน ${text}`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "รวมทั้งกลุ่ม",
        perPerson: "ต่อคน",
      },
    },
    toolbar: {
      sortLabel: "เรียงตาม",
      sortGap: "มาถึงใกล้กันที่สุด",
      sortPrice: "ราคาต่ำที่สุด",
      sortDestination: "จุดหมาย ก–ฮ",
      gapLabel: "ช่วงเวลามาถึงสูงสุด",
      gapAny: "เท่าไรก็ได้",
      gapHours: (h: number) => `≤ ${h} ชม.`,
      priceLabel: "ราคาสูงสุด / คน",
      priceAny: "เท่าไรก็ได้",
      showing: (shown: number, total: number) => `แสดง ${shown} จาก ${total}`,
    },
    timeline: {
      title: "การกระจายของเวลามาถึง",
      arriveWithin: (text: string) => `มาถึงภายใน ${text}`,
    },
    relax: {
      title: "ยังไม่มีผลลัพธ์",
      body: "ขยายการค้นหาแล้วรันอีกครั้ง — การค้นหาซ้ำจะใช้ราคาตั๋วที่แคชไว้",
      gap30: "ขยายช่วงเวลาเป็น 30 ชม.",
      budget50: (amount: string) => `+${amount} งบประมาณ`,
      days3: "+3 วันหน้าต่าง",
      running: "กำลังเริ่มการค้นหาใหม่…",
    },
  },
  weather: {
    title: (city: string) => `สภาพอากาศที่ ${city} — 7 วันข้างหน้า`,
    rain: (pct: number) => `ฝน ${pct}%`,
    source: "พยากรณ์อากาศ: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "ท้องฟ้าแจ่มใส",
      partlyCloudy: "มีเมฆบางส่วน",
      cloudy: "เมฆมาก",
      fog: "หมอก",
      rain: "ฝน",
      snow: "หิมะ",
      showers: "ฝนโปรยปราย",
      thunderstorm: "พายุฝนฟ้าคะนอง",
    },
  },
  hero: {
    title: (city: string, country: string) => `จุดกึ่งกลางที่ดีที่สุดสำหรับคุณ: ${city}, ${country}`,
    gap: (text: string) => `ทุกคนมาถึงภายใน ${text}`,
    from: (price: string) => `เริ่มที่ ${price} / คน`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "ดูตัวเลือกนี้",
  },
  surprise: {
    button: "ให้ฉันประหลาดใจ",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ห่างกัน ${gap}, ${total}`,
  },
  popular: {
    title: "สถานที่ตรงกลางยอดนิยม",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "ยังไม่มีสถานที่ยอดนิยม",
  },
  ads: {
    label: "ผู้สนับสนุน",
  },
  share: {
    pageTitle: "การค้นหา midspot",
    loading: "กำลังโหลดการค้นหา…",
    notFoundTitle: "ลิงก์การค้นหานี้ไม่สามารถใช้ได้",
    notFoundBody:
      "อาจหมดอายุแล้ว (การค้นหาเก็บไว้ 7 วัน) หรือลิงก์ไม่ถูกต้อง",
    backHome: "กลับไปที่ midspot",
    errorPrefix: "ข้อผิดพลาดในการค้นหา: ",
  },
  notFound: {
    title: "ไม่พบหน้า",
    body: "หน้าที่คุณกำลังมองหาไม่มีอยู่หรือถูกย้ายแล้ว",
    backHome: "กลับไปที่ midspot",
  },
  common: {
    loading: "กำลังโหลด…",
  },
  consent: {
    title: "คุกกี้",
    body: "เราใช้คุกกี้ที่จำเป็นเพื่อจดจำภาษาและตัวเลือกของคุณที่นี่ คุกกี้โฆษณา (EthicalAds / CarbonAds) จะโหลดเฉพาะเมื่อคุณเลือก “ยอมรับทั้งหมด” เท่านั้น",
    acceptAll: "ยอมรับทั้งหมด",
    essentialOnly: "เฉพาะที่จำเป็น",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `รูปภาพ: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "จุดหมาย",
      indexDescription:
        "เรียกดูเมืองในยุโรปที่ midspot สามารถค้นหาเป็นจุดกึ่งกลางให้กลุ่มของคุณ — เรียงตามความถี่ที่นักเดินทางเลือก",
      cityTitle: (city: string) => `พบกันที่ ${city}`,
      cityDescription: (city: string, country: string) =>
        `พบกันที่ ${city}, ${country} — ดูว่าทำไมเมืองนี้จึงเหมาะเป็นจุดกึ่งกลางให้เพื่อนและครอบครัวที่บินจากเมืองต่างกัน แล้วค้นหาจุดกึ่งกลางของคุณเอง`,
    },
    index: {
      eyebrow: "จุดหมาย",
      title: "กลุ่มของคุณควรเจอกันที่ไหน?",
      subtitle:
        "แต่ละเมืองด้านล่างเป็นจุดหมายที่ midspot สามารถค้นหาเป็นจุดกึ่งกลางที่เป็นไปได้สำหรับนักเดินทาง 2–8 คนที่บินจากสนามบินต้นทางต่างกัน เลือกเมืองหนึ่งเพื่อดูว่าทำไมจึงเวิร์ก — หรือกลับไปแล้วให้การค้นหาหาจุดกึ่งกลางของคุณ",
      searchPlaceholder: "ค้นหาเมือง ประเทศ หรือรหัสสนามบิน…",
      empty: "ไม่มีจุดหมายที่ตรงกับการค้นหาของคุณ",
      showing: (shown: number, total: number) => `กำลังแสดง ${shown} จาก ${total} จุดหมาย`,
      airports: (codes: string) => `สนามบิน: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "ยังไม่เคยถูกเลือกเป็นจุดกึ่งกลาง"
          : count === 1
            ? "ถูกเลือกเป็นจุดกึ่งกลาง 1 ครั้ง"
            : `ถูกเลือกเป็นจุดกึ่งกลาง ${count} ครั้ง`,
    },
    city: {
      back: "จุดหมายทั้งหมด",
      pitch: (city: string) => `พบกันที่ ${city} — จุดกึ่งกลางที่เหมาะกับทุกคน`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) เป็นหนึ่งในจุดหมายที่ midspot ค้นหาเมื่อกลุ่มเพื่อนหรือครอบครัวอยากเจอกัน ทุกคนบินจากสนามบินต้นทางของตัวเอง เราเรียงจุดหมายตามช่วงเวลาที่ทุกคนมาถึง แล้วจึงเรียงตามราคา — ภายในงบประมาณของคุณ`,
      airportsLabel: "สนามบินที่มีเที่ยวบิน",
      statsLabel: "จำนวนครั้งที่ถูกเลือกเป็นจุดกึ่งกลาง (90 วันที่ผ่านมา)",
      statsEmpty: "ยังไม่มีการค้นหา — เป็นกลุ่มแรกที่มาเจอกันที่นี่สิ",
      howTitle: "วิธีการทำงาน",
      howSteps: [
        {
          title: "เพิ่มสนามบินต้นทางของทุกคน",
          body: "นักเดินทาง 2–8 คน แต่ละคนจากเมืองของตัวเอง — เราค้นหาราคาตั๋วจริงจากทุกแห่ง",
        },
        {
          title: "ตั้งวันที่ จำนวนคืน และงบประมาณ",
          body: "วันที่ยืดหยุ่นหรือทั้งเดือน; งบประมาณต่อคนที่รวมขาไปและขากลับ",
        },
        {
          title: "เราจัดอันดับจุดกึ่งกลาง",
          body: "จุดหมายเรียงตามช่วงเวลามาถึง (ทุกคนลงจอดห่างกันไม่เกิน 24 ชม.) แล้วจึงเรียงตามราคารวม",
        },
      ],
      faqTitle: "คำถามที่พบบ่อย",
      // “{city}” จะถูกแทนที่ด้วยชื่อเมืองของหน้านี้ตอนแสดงผล
      faqs: [
        {
          q: "ทำไม {city} ถึงเป็นจุดกึ่งกลางที่ดี?",
          a: "{city} เดินทางได้สะดวกด้วยเที่ยวบินสั้นและถี่จากทั่วยุโรป นักเดินทางจากเมืองต่างกันจึงมาถึงห่างกันเพียงไม่กี่ชั่วโมง — ด้วยราคารวมที่ต่ำ รันการค้นหา แล้ว midspot จะเปรียบเทียบ {city} กับทุกตัวเลือกอื่นให้",
        },
        {
          q: "จองตั๋วผ่าน midspot หรือเปล่า?",
          a: "ไม่ midspot แค่หาและเรียงจุดกึ่งกลาง การจองเกิดขึ้นบนเว็บพาร์ทเนอร์ (เช่น Kiwi.com) ผ่านลิงก์พันธมิตร ในราคาเดียวกันสำหรับคุณ",
        },
        {
          q: "ราคาเป็นของจริงไหม?",
          a: "ราคามาจากข้อมูลเที่ยวบินแบบเรียลไทม์ตอนค้นหาและอาจเปลี่ยนได้ — เว็บจองจะแสดงราคาสุดท้ายเสมอ",
        },
      ],
      cta: "หาจุดกึ่งกลางของคุณ",
    },
  },
  blog: {
    meta: {
      title: "บล็อก",
      description:
        "เรื่องราวและบันทึกจากทีม midspot — เราหาจุดกึ่งกลางให้กลุ่มนักเดินทางที่บินจากเมืองต่างกันได้อย่างไร",
    },
    title: "เรื่องราวจากตรงกลาง",
    subtitle:
      "บันทึกเกี่ยวกับการเจอกันครึ่งทาง: การค้นหาทำงานอย่างไร กลุ่มต่างๆ เจอกันจริงที่ไหน และสิ่งที่เราเรียนรู้จากข้อมูลเที่ยวบินแบบเรียลไทม์",
    latest: "เรื่องล่าสุด",
    empty: "ยังไม่มีโพสต์ — แวะมาใหม่เร็วๆ นี้",
    readingTime: (minutes: number) => `อ่าน ${minutes} นาที`,
    published: (date: string) => `เผยแพร่เมื่อ ${date}`,
    back: "โพสต์ทั้งหมด",
    prev: "โพสต์ใหม่กว่า",
    next: "โพสต์เก่ากว่า",
    share: "คัดลอกลิงก์",
    copied: "คัดลอกลิงก์แล้ว!",
    copyFailed: "คัดลอกไม่ได้ — โปรดเลือก URL ด้วยตนเอง",
    rss: "ฟีด RSS",
  },
  stats: {
    title: "สถิติเว็บไซต์",
    subtitle: "การวิเคราะห์ของ midspot ที่รักษาความเป็นส่วนตัว — เฉพาะข้อมูลรวม ไม่มี IP",
    secretLabel: "รหัสลับสถิติ",
    secretPlaceholder: "วางรหัสลับสถิติ",
    unlock: "โหลดสถิติ",
    loading: "กำลังโหลด…",
    unauthorized:
      "รหัสลับผิดหรือไม่มี (401) รหัสลับไม่ได้รวมอยู่ในหน้านี้ — ถามเจ้าของเว็บไซต์",
    error: "โหลดสถิติไม่ได้",
    retry: "ลองใหม่",
    totals: { searches: "การค้นหา", results: "ผลลัพธ์", pageviews: "การเข้าชม" },
    searchesChart: "การค้นหาต่อวัน — 30 วันที่ผ่านมา",
    pageviewsChart: "การเข้าชมต่อวัน — 30 วันที่ผ่านมา",
    popularRoutes: "คู่ต้นทางยอดนิยม — 30 วันที่ผ่านมา",
    providerUsage: "การใช้งานผู้ให้บริการ — เดือนนี้",
    table: {
      day: "วัน",
      count: "จำนวน",
      total: "รวม",
      route: "เส้นทาง",
      searches: "การค้นหา",
      provider: "ผู้ให้บริการ",
      calls: "การเรียก",
      cap: "ขีดจำกัดรายเดือน",
      pctUsed: "% ของขีดจำกัด",
    },
    noData: "ยังไม่มีข้อมูล",
    cloudflareNote:
      "แดชบอร์ด Cloudflare ยังแสดงทราฟฟิกที่ edge ด้วย (ทุกคำขอที่ถึง CDN edge รวมถึงบอตและแอสเซ็ตที่แคช) — หน้านี้แสดงเฉพาะสิ่งที่ midspot ให้บริการและเก็บในฐานข้อมูลของตัวเองเท่านั้น",
  },
  footer: {
    destinations: "จุดหมาย",
    blog: "บล็อก",
    privacy: "ความเป็นส่วนตัว",
    terms: "ข้อกำหนด",
    cookieSettings: "การตั้งค่าคุกกี้",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "ภาษา",
  },
  currency: {
    label: "สกุลเงิน",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · อัตรา ECB ณ ${date}`,
  },
  theme: {
    label: "ธีม",
    light: "สว่าง",
    dark: "มืด",
    system: "ตามระบบ",
  },
};
