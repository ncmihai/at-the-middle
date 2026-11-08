// Dynamic OG image for /blog/[slug] — brand card with the post title, its date
// and reading time. Same ImageResponse pattern as app/destinations/[city]/
// opengraph-image.tsx: the post model comes from content/blog via lib/blog.ts
// (no DB), generateStaticParams + revalidate = 3600 prerender all cards at
// build and refresh them hourly with the pages. No external fonts/images.
import { ImageResponse } from "next/og";

import { en } from "@/lib/i18n";
import { getPost, listPostSlugs } from "@/lib/blog";
import {
  SHARE_CARD_COLORS as C,
  SHARE_CARD_SIZE,
  formatCardDate,
} from "@/lib/share";

export const alt = "midspot — blog";
export const size = { width: SHARE_CARD_SIZE.width, height: SHARE_CARD_SIZE.height };
export const contentType = "image/png";
export const runtime = "nodejs";
export const revalidate = 3600;

export function generateStaticParams() {
  return listPostSlugs().map((slug) => ({ slug }));
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const url = siteUrl();
  // Unknown slug should not happen (dynamicParams = false on the page), but the
  // OG route can still be hit directly — fall back to a generic brand card.
  const title = post?.title ?? en.blog.title;
  const metaLine = post
    ? `${formatCardDate(post.date)} · ${en.blog.readingTime(post.readingMinutes)} · ${post.lang.toUpperCase()}`
    : en.blog.subtitle;
  const titleSize = title.length > 70 ? 52 : title.length > 40 ? 64 : 80;

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
            fontSize: titleSize,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.08,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              background: C.pillBg,
              borderRadius: 999,
              padding: "10px 22px",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {metaLine}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
