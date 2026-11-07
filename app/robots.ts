import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3005";

// /r/ (share links) and /api/ are not for search engines — the only public read path
// is the unguessable /r/<slug> itself. app-spec §7. Sitemap reference for crawlers.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: ["/r/", "/api/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
