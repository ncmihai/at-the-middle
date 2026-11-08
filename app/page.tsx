import type { Metadata } from "next";

import { en } from "@/lib/i18n";
import { listPosts } from "@/lib/blog";
import HomePage from "@/components/HomePage";
import PopularSpots from "@/components/PopularSpots";
import LatestStories from "@/app/blog/LatestStories";

export const metadata: Metadata = {
  title: `${en.brand.heroTitle} — ${en.brand.name}`,
  description: en.brand.heroSubtitle,
};

// The page itself is a client view (components/HomePage) so the language switcher
// re-renders all copy live via useMessages(); metadata stays here, server-side.
export default function Home() {
  // Faza 7 blog: top 3 posts for the "Latest stories" section (hidden when empty).
  const latestPosts = listPosts().slice(0, 3);
  return (
    <>
      <HomePage />
      {/* Faza 6: "Popular middle spots" — aggregated top destinations from the DB
          (privacy-safe), in the same landing column, under the form/history. */}
      <div className="mx-auto -mt-4 flex w-full max-w-md px-4 pb-10 md:-mt-8 md:max-w-2xl md:pb-16">
        <PopularSpots />
      </div>
      {/* Faza 7: "Latest stories" from the blog (top 3 posts). */}
      <LatestStories posts={latestPosts} />
    </>
  );
}
