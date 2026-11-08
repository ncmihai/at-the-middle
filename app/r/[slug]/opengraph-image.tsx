// Dynamic OG image for /r/[slug] — PLAN.md Faza 4 lot 5.
//
// Next serves this file at /r/<slug>/opengraph-image and references it
// automatically in the route's OpenGraph metadata (the page itself is a client
// component, so it cannot export metadata — this file convention is the way).
//
// 1200x630 PNG, Node runtime, rendered on demand (force-dynamic) because it
// reads the search + its best result from Postgres per request. No external
// fonts (ImageResponse default font only) and no external images, so the route
// is fully self-contained. Unknown/expired slug or DB hiccup → static brand
// fallback card.
import { ImageResponse } from "next/og";
import { asc, eq } from "drizzle-orm";

import { CANDIDATES_BY_IATA } from "@/db/candidates";
import { getDb, isDatabaseConfigured } from "@/db/client";
import { results, searches } from "@/db/schema";
import { en } from "@/lib/i18n";
import {
  SHARE_CARD_COLORS as C,
  SHARE_CARD_SIZE,
  cardModel,
  hostOf,
  type ShareCardModel,
} from "@/lib/share";

export const alt = "midspot — meet in the middle";
export const size = { width: SHARE_CARD_SIZE.width, height: SHARE_CARD_SIZE.height };
export const contentType = "image/png";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Same stack as app/layout.tsx (system fonts only — never next/font/google).
const FONT_STACK =
  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3005").replace(/\/+$/, "");
}

/** Best (rank 1) result for the slug → card model; null when unknown/expired/DB down. */
async function loadCardModel(slug: string): Promise<ShareCardModel | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const db = getDb();
    const [search] = await db
      .select({ id: searches.id })
      .from(searches)
      .where(eq(searches.slug, slug))
      .limit(1);
    if (!search) return null;
    const [top] = await db
      .select()
      .from(results)
      .where(eq(results.searchId, search.id))
      .orderBy(asc(results.rank))
      .limit(1);
    if (!top) return null;
    const dest = CANDIDATES_BY_IATA[top.destinationIata];
    return cardModel(
      {
        destinationCity: dest?.city ?? top.destinationIata,
        destinationCountry: dest?.country ?? "",
        departureDate: top.departureDate,
        returnDate: top.returnDate,
        gapMinutes: top.gapMinutes,
        pricePerPersonEur: Number(top.maxPricePerPersonEur),
      },
      siteUrl(),
      slug
    );
  } catch (err) {
    console.warn("[opengraph-image] DB lookup failed, rendering fallback card:", err);
    return null;
  }
}

/** Paper-plane glyph drawn with clip-path — no external images/fonts. */
function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: C.wordmarkBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: C.text,
            clipPath: "polygon(0% 50%, 100% 0%, 62% 100%, 50% 66%)",
          }}
        />
      </div>
      <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>{en.brand.name}</div>
    </div>
  );
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model: ShareCardModel = (await loadCardModel(slug)) ?? {
    // static fallback: brand + tagline
    title: en.brand.heroTitle,
    subtitle: en.brand.heroSubtitle,
    gapText: "",
    priceText: "",
    url: siteUrl(),
  };
  const hasResult = Boolean(model.gapText);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 64,
          background: `linear-gradient(135deg, ${C.gradientFrom} 0%, ${C.gradientTo} 100%)`,
          color: C.text,
          fontFamily: FONT_STACK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Wordmark />
          <div style={{ fontSize: 24, opacity: 0.85 }}>{hostOf(model.url)}</div>
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            fontSize: hasResult ? 84 : 96,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.05,
          }}
        >
          {model.title}
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: model.subtitle.length > 60 ? 28 : 36,
            opacity: 0.92,
            lineHeight: 1.3,
          }}
        >
          {model.subtitle}
        </div>
        <div
          style={{
            marginTop: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {hasResult ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: C.pillBg,
                borderRadius: 999,
                padding: "12px 26px",
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              {model.gapText}
            </div>
          ) : (
            <div />
          )}
          {hasResult ? (
            <div style={{ fontSize: 40, fontWeight: 700 }}>{model.priceText}</div>
          ) : (
            <div />
          )}
        </div>
        <div style={{ marginTop: 24, fontSize: 22, opacity: 0.75 }}>{model.url}</div>
      </div>
    ),
    { width: SHARE_CARD_SIZE.width, height: SHARE_CARD_SIZE.height }
  );
}
