// Dynamic OG image for /destinations/[city] — a brand card with the city name,
// country and its airport codes. Same ImageResponse pattern as
// app/r/[slug]/opengraph-image.tsx, but fully static (the city model comes from
// db/candidates.ts, no DB): generateStaticParams + revalidate = 3600, so all
// cards are prerendered at build and refreshed hourly with the pages.
// No external fonts/images — self-contained, like the /r card.
import { ImageResponse } from "next/og";

import { en } from "@/lib/i18n";
import { SHARE_CARD_COLORS as C, SHARE_CARD_SIZE } from "@/lib/share";

import { DESTINATIONS_BY_SLUG, DESTINATION_SLUGS } from "../cities";

export const alt = "midspot — meet in the middle";
export const size = { width: SHARE_CARD_SIZE.width, height: SHARE_CARD_SIZE.height };
export const contentType = "image/png";
export const runtime = "nodejs";
export const revalidate = 3600;

export function generateStaticParams() {
  return DESTINATION_SLUGS.map((slug) => ({ city: slug }));
}

// Same stack as app/layout.tsx (system fonts only — never next/font/google).
const FONT_STACK =
  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3005").replace(/\/+$/, "");
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
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
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = DESTINATIONS_BY_SLUG[slug];
  const url = siteUrl();
  // Unknown slug should not happen (dynamicParams = false on the page), but the
  // OG route can still be hit directly — fall back to a generic brand card.
  const title = city ? en.destinations.meta.cityTitle(city.city) : en.brand.heroTitle;
  const subtitle = city
    ? `${city.city}, ${city.country} — ${city.iatas.join(" · ")}`
    : en.brand.heroSubtitle;

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
          <div style={{ fontSize: 24, opacity: 0.85 }}>{hostOf(url)}</div>
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            fontSize: title.length > 28 ? 64 : 84,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: subtitle.length > 60 ? 28 : 36,
            opacity: 0.92,
            lineHeight: 1.3,
          }}
        >
          {subtitle}
        </div>
        <div style={{ marginTop: 44, display: "flex", alignItems: "center" }}>
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
            {en.destinations.index.eyebrow}
          </div>
        </div>
        <div style={{ marginTop: 24, fontSize: 22, opacity: 0.75 }}>
          {`${url}/destinations/${slug}`}
        </div>
      </div>
    ),
    { width: SHARE_CARD_SIZE.width, height: SHARE_CARD_SIZE.height }
  );
}
