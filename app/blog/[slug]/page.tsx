// /blog/[slug] — one full post from content/blog/<slug>.md (lib/blog.ts).
//
// ISR: generateStaticParams prerenders every live post at build; revalidate =
// 3600 refreshes hourly; dynamicParams = false → unknown slugs 404.
//
// Metadata is per post and stays English (same pattern as /destinations/[city]);
// all visible copy is localized client-side via the blog.* i18n namespace in
// ./PostView. The markdown body is rendered to HTML server-side (lib/blog.ts)
// and injected in PostView with dangerouslySetInnerHTML — safe because
// content/blog/ is repo-owned, only the owner can add posts (see lib/blog.ts).
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPost, listPostSlugs } from "@/lib/blog";

import PostView from "./PostView";

export const revalidate = 3600;
export const dynamicParams = false;

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} · midspot`,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: ["midspot"],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10 md:max-w-2xl md:py-14">
      <PostView post={post} />
    </main>
  );
}
