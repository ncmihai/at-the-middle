// Dynamic OG image for /destinations/[city] — the city photo (Faza 8A, Digi
// Storage mirror of a free Wikimedia Commons image) as background with a
// brand-tinted overlay, plus the city name, country and airport codes.
// Same ImageResponse pattern as app/r/[slug]/opengraph-image.tsx. The city
// model comes from db/candidates.ts (no DB); the photo fetch is no-store, so
// the card renders on demand with the freshest mirror URL and falls back to
// the plain brand gradient when the city has no photo (or the fetch fails).
// No external fonts — self-contained, like the /r card.
import { ImageResponse } from "next/og";

import { CITY_IMAGES_BY_SLUG } from "@/db/city-images";
import { cityPhotoProxyPath } from "@/lib/city-photo";
import { getConfig } from "@/lib/env";
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

/**
 * Faza 8A: fetch the city photo (Digi Storage mirror of a free Wikimedia
 * Commons image) and return it as a base64 data URL for ImageResponse.
 * Null on any failure → the card falls back to the plain brand gradient.
 */
async function loadPhotoDataUrl(url: string): Promise<string | null> {
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
  // Faza 8A: city photo as card background (brand-tinted overlay keeps text legible).
  // The stored Digi URL is signed and expires — go through our own stable
  // /city-photo/<file> proxy (absolute URL, this route fetches it over HTTP).
  const rawPhotoUrl = city ? (CITY_IMAGES_BY_SLUG[slug]?.url ?? "") : "";
  const photoSrc = rawPhotoUrl
    ? await loadPhotoDataUrl(
        new URL(cityPhotoProxyPath(rawPhotoUrl), getConfig().siteUrl).toString()
      )
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
      </div>
    ),
    { width: SHARE_CARD_SIZE.width, height: SHARE_CARD_SIZE.height }
  );
}
