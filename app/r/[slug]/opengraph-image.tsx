// Dynamic OG image for /r/[slug] — PLAN.md Faza 4 lot 5.
//
// Next serves this file at /r/<slug>/opengraph-image and references it
// automatically in the route's OpenGraph metadata (the page itself is a client
// component, so it cannot export metadata — this file convention is the way).
//
// 1200x630 PNG, Node runtime, rendered on demand (force-dynamic) because it
// reads the search + its best result from Postgres per request. No external
// fonts (ImageResponse default font only). Faza 8A: when the best result's
// city has a photo in db/city-images.ts, it is fetched (no-store) and drawn as
// the card background with a brand-tinted overlay; any failure → the plain
// brand gradient. Unknown/expired slug or DB hiccup → static brand fallback card.
import { ImageResponse } from "next/og";
import { asc, eq } from "drizzle-orm";

import { CANDIDATES_BY_IATA } from "@/db/candidates";
import { getDb, isDatabaseConfigured } from "@/db/client";
import { CITY_IMAGES } from "@/db/city-images";
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

/** Best (rank 1) result for the slug → card model + city name; null when unknown/expired/DB down. */
async function loadCardModel(
  slug: string
): Promise<{ model: ShareCardModel; cityName: string } | null> {
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
    const cityName = dest?.city ?? top.destinationIata;
    return {
      model: cardModel(
        {
          destinationCity: cityName,
          destinationCountry: dest?.country ?? "",
          departureDate: top.departureDate,
          returnDate: top.returnDate,
          gapMinutes: top.gapMinutes,
          pricePerPersonEur: Number(top.maxPricePerPersonEur),
        },
        siteUrl(),
        slug
      ),
      cityName,
    };
  } catch (err) {
    console.warn("[opengraph-image] DB lookup failed, rendering fallback card:", err);
    return null;
  }
}

/**
 * Faza 8A: fetch the destination city's photo (Digi Storage mirror of a free
 * Wikimedia Commons image) as a base64 data URL for ImageResponse.
 * Null on any failure → the card falls back to the plain brand gradient.
 */
async function loadPhotoDataUrl(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("image/")) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const mime = contentType.split(";")[0].trim() || "image/jpeg";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
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
  const loaded = await loadCardModel(slug);
  const model: ShareCardModel = loaded?.model ?? {
    // static fallback: brand + tagline
    title: en.brand.heroTitle,
    subtitle: en.brand.heroSubtitle,
    gapText: "",
    priceText: "",
    url: siteUrl(),
  };
  const hasResult = Boolean(model.gapText);
  // Faza 8A: city photo as card background (brand-tinted overlay keeps text legible)
  const photoSrc = loaded
    ? await loadPhotoDataUrl(CITY_IMAGES[loaded.cityName]?.url ?? "")
    : null;

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
          position: "relative",
        }}
      >
        {photoSrc && (
          <img
            src={photoSrc}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        {photoSrc && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg, rgba(56,189,248,0.82) 0%, rgba(37,99,235,0.90) 100%)",
            }}
          />
        )}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
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
      </div>
    ),
    { width: SHARE_CARD_SIZE.width, height: SHARE_CARD_SIZE.height }
  );
}
