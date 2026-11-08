// /blog — index of all live posts (content/blog/*.md, see lib/blog.ts).
// ISR: revalidate 3600 regenerates the list hourly when posts change.
// Metadata follows the existing pattern and stays English (like / and
// /destinations); all visible copy is localized client-side via the blog.*
// i18n namespace in ./BlogList.
import type { Metadata } from "next";

import { en } from "@/lib/i18n";
import { listPosts } from "@/lib/blog";

import BlogList from "./BlogList";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: en.blog.meta.title,
  description: en.blog.meta.description,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `${en.blog.meta.title} · midspot`,
    description: en.blog.meta.description,
    url: "/blog",
    type: "website",
  },
};

export default function BlogPage() {
  const posts = listPosts();
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10 md:max-w-2xl md:py-14">
      <BlogList posts={posts} />
    </main>
  );
}
