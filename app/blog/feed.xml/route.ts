// /blog/feed.xml — RSS 2.0 feed of all live posts (content/blog/*.md via
// lib/blog.ts). force-dynamic + Cache-Control: no-store: the feed is
// regenerated on every request (the post list itself is cached in memory for
// 5 min inside lib/blog.ts, so this is cheap). No DB, no env beyond
// NEXT_PUBLIC_SITE_URL for absolute links.
import { listPosts } from "@/lib/blog";
import { getSiteUrl } from "@/lib/share";
import { en } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** "2026-11-08" → RFC-822 pubDate ("Sat, 08 Nov 2026 00:00:00 GMT"). */
function rssDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, d ?? 1)).toUTCString();
}

export async function GET(): Promise<Response> {
  const site = getSiteUrl();
  const posts = listPosts();
  const latest = posts[0];

  const items = posts
    .map((post) => {
      const url = `${site}/blog/${post.slug}`;
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${rssDate(post.date)}</pubDate>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        `      <category>${escapeXml(post.lang)}</category>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${en.brand.name} — ${en.blog.meta.title}`)}</title>
    <link>${escapeXml(site)}</link>
    <description>${escapeXml(en.blog.meta.description)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(`${site}/blog/feed.xml`)}" rel="self" type="application/rss+xml"/>
${latest ? `    <lastBuildDate>${rssDate(latest.date)}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
