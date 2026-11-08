"use client";

// Client part of /blog: header (title/subtitle/RSS link) + the post cards.
// All copy comes from the blog.* i18n namespace via useMessages(), so the
// language switcher re-renders it in place; dates are formatted with Intl in
// the active language (./postDate). Posts arrive as plain serializable
// metadata from the server page (lib/blog.listPosts).
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, ClockIcon, RssIcon } from "lucide-react";

import { useLanguage, useMessages } from "@/lib/i18n";
import type { BlogPostMeta } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";

import { formatPostDate } from "./postDate";

export default function BlogList({ posts }: { posts: BlogPostMeta[] }) {
  const messages = useMessages();
  const [lang] = useLanguage();
  const t = messages.blog;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t.meta.title}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t.title}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          {t.subtitle}
        </p>
        <Link
          href="/blog/feed.xml"
          className="mt-1 flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          <RssIcon className="h-3.5 w-3.5" />
          {t.rss}
        </Link>
      </header>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
              >
                {post.cover ? (
                  <div className="relative mb-1 aspect-[2/1] w-full overflow-hidden rounded-xl border border-border">
                    <Image
                      src={post.cover}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 672px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary group-hover:underline md:text-xl">
                  {post.title}
                </h2>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <time dateTime={post.date}>{formatPostDate(post.date, lang)}</time>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {t.readingTime(post.readingMinutes)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <Badge variant="secondary" className="px-1.5 py-0 uppercase">
                    {post.lang}
                  </Badge>
                </p>
                {post.excerpt ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                ) : null}
                <span className="mt-1 flex items-center gap-1 text-xs font-medium text-primary">
                  <ArrowRightIcon
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
