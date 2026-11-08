"use client";

// "Latest stories" section on the landing page (app/page.tsx passes the top 3
// posts from lib/blog.listPosts). Hidden entirely when there are no posts.
// All copy comes from the blog.* i18n namespace via useMessages().
import Link from "next/link";
import { ArrowRightIcon, NewspaperIcon } from "lucide-react";

import { useLanguage, useMessages } from "@/lib/i18n";
import type { BlogPostMeta } from "@/lib/blog";

import { formatPostDate } from "./postDate";

export default function LatestStories({ posts }: { posts: BlogPostMeta[] }) {
  const messages = useMessages();
  const [lang] = useLanguage();
  const t = messages.blog;

  if (posts.length === 0) return null;

  return (
    <div className="mx-auto -mt-4 flex w-full max-w-md px-4 pb-10 md:-mt-8 md:max-w-2xl md:pb-16">
      <section aria-label={t.latest} className="flex w-full flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <NewspaperIcon className="h-4 w-4" />
          {t.latest}
        </h2>
        <ul className="flex flex-col gap-2">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-0.5 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-colors hover:border-primary/40"
              >
                <span className="text-sm font-semibold text-foreground group-hover:text-primary group-hover:underline">
                  {post.title}
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <time dateTime={post.date}>{formatPostDate(post.date, lang)}</time>
                  <span aria-hidden="true">·</span>
                  {t.readingTime(post.readingMinutes)}
                </span>
                {post.excerpt ? (
                  <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/blog"
          className="flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {t.back}
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
