"use client";

// Client part of /blog/[slug]: back link, header (title, published date,
// reading time, lang badge, copy-link share button), optional cover, the
// rendered markdown body (hand-styled prose — no typography plugin), and the
// prev/next post navigation. All copy comes from the blog.* i18n namespace
// via useMessages(); dates via ./postDate.
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon } from "lucide-react";

import { useLanguage, useMessages } from "@/lib/i18n";
import type { BlogPost } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";

import { formatPostDate } from "../postDate";
import CopyLinkButton from "./CopyLinkButton";

/** Hand-rolled prose styling (no @tailwindcss/typography): style the rendered
 *  markdown elements through arbitrary child variants on the wrapper. */
const PROSE =
  "flex flex-col gap-5 text-[15px] leading-relaxed text-foreground md:text-base " +
  "[&_h2]:mt-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground " +
  "[&_h3]:mt-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground " +
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary-hover " +
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:pl-1 [&_li]:my-1 " +
  "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground " +
  "[&_img]:my-2 [&_img]:rounded-xl [&_img]:border [&_img]:border-border " +
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.85em] " +
  "[&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:text-sm [&_pre_code]:bg-transparent [&_pre_code]:p-0 " +
  "[&_hr]:border-border [&_strong]:font-semibold";

export default function PostView({ post }: { post: BlogPost }) {
  const messages = useMessages();
  const [lang] = useLanguage();
  const t = messages.blog;

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/blog"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t.back}
      </Link>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {post.title}
        </h1>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <time dateTime={post.date}>{t.published(formatPostDate(post.date, lang))}</time>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            {t.readingTime(post.readingMinutes)}
          </span>
          <span aria-hidden="true">·</span>
          <Badge variant="secondary" className="px-1.5 py-0 uppercase">
            {post.lang}
          </Badge>
        </p>
        <div className="mt-1">
          <CopyLinkButton path={`/blog/${post.slug}`} />
        </div>
      </header>

      {post.cover ? (
        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl border border-border">
          <Image
            src={post.cover}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />
        </div>
      ) : null}

      {/* Rendered markdown. Content is repo-owned (content/blog/), never
          user-supplied — see the security note in lib/blog.ts. */}
      <article
        className={PROSE}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <nav
        aria-label={t.back}
        className="mt-4 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
      >
        {post.prev ? (
          <Link
            href={`/blog/${post.prev.slug}`}
            className="group flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="flex flex-col">
              <span className="text-xs font-normal text-muted-foreground">{t.prev}</span>
              <span className="group-hover:underline">{post.prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {post.next ? (
          <Link
            href={`/blog/${post.next.slug}`}
            className="group flex items-center gap-1 text-right text-sm font-medium text-muted-foreground hover:text-foreground sm:justify-end"
          >
            <span className="flex flex-col">
              <span className="text-xs font-normal text-muted-foreground">{t.next}</span>
              <span className="group-hover:underline">{post.next.title}</span>
            </span>
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
