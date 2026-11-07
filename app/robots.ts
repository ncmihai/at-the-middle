import type { MetadataRoute } from "next";

// /r/ (share links) and /api/ are not for search engines — the only public read path
// is the unguessable /r/<slug> itself. app-spec §7.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: ["/r/", "/api/"] }],
  };
}
