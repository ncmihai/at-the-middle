import type { MetadataRoute } from "next";

import { DESTINATION_SLUGS } from "./destinations/cities";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3005";

// Basic SEO sitemap (PLAN.md Faza 3): only the public, indexable routes —
// /r/ share links and /api/ are disallowed in robots.ts and deliberately absent.
// /destinations + every /destinations/[city] SEO page (top 120 cities from
// db/candidates.ts) are included; the city pages are ISR (revalidate 3600).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/destinations`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...DESTINATION_SLUGS.map((slug) => ({
      url: `${siteUrl}/destinations/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
