// lib/blog.ts — content engine for /blog (PLAN.md Faza 7: "Blog /blog — infra").
//
// Posts are plain markdown files in content/blog/<slug>.md with gray-matter
// frontmatter:
//   ---
//   title: "…"          (required)
//   date: 2026-11-08    (required, YYYY-MM-DD)
//   excerpt: "…"        (required, used in lists, metadata and the RSS feed)
//   lang: en            (required-ish, defaults to "en"; shown as a badge)
//   cover: /images/…    (optional)
//   draft: true         (optional; drafts are skipped everywhere)
//   ---
// Body = markdown, rendered to HTML server-side with marked (gfm).
//
// SECURITY NOTE: the rendered HTML is injected with dangerouslySetInnerHTML.
// That is safe here because content/blog/ is repo-owned — only the site owner
// (via git) can add or edit posts; there is no user-supplied markdown anywhere.
//
// Reading time = words / 200, rounded, minimum 1 minute.
//
// The post list is cached in memory for 5 minutes so the many routes that read
// it (/blog, /blog/[slug], OG images, sitemap, RSS, landing) don't re-read and
// re-parse the filesystem on every request.
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { marked } from "marked";

export type BlogPostMeta = {
  /** URL slug = file name without .md */
  slug: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  excerpt: string;
  /** ISO language code of the post itself, e.g. "en" / "ro" */
  lang: string;
  /** optional cover image path, e.g. "/images/blog/x.jpg" */
  cover?: string;
  /** reading time in whole minutes (words / 200, min 1) */
  readingMinutes: number;
};

export type BlogPost = BlogPostMeta & {
  /** markdown body rendered to HTML (marked, gfm) */
  html: string;
  /** newer post (list is sorted date desc) or null at the top */
  prev: BlogPostMeta | null;
  /** older post or null at the end */
  next: BlogPostMeta | null;
};

const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { at: number; posts: BlogPost[] } | null = null;

// Candidate locations for content/blog — literal path segments so Next's output
// file tracing (nft) picks the folder up into the standalone artefact, same
// pattern as the drizzle migrations folder in instrumentation.node.ts.
const CONTENT_DIR_CANDIDATES = [
  path.join(process.cwd(), "content", "blog"),
  path.join(process.cwd(), ".next", "standalone", "content", "blog"),
  path.join(process.cwd(), "..", "content", "blog"),
];

function contentDir(): string {
  for (const dir of CONTENT_DIR_CANDIDATES) {
    try {
      if (fs.statSync(dir).isDirectory()) return dir;
    } catch {
      // try next candidate
    }
  }
  return CONTENT_DIR_CANDIDATES[0];
}

marked.setOptions({ gfm: true, breaks: false });

/** words in an HTML string → reading minutes (200 wpm, min 1). */
function readingMinutesOf(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Frontmatter date → "YYYY-MM-DD". Accepts a string as-is, or a Date (js-yaml
 *  parses an unquoted `date: 2026-11-08` into a UTC-midnight Date object). */
function normalizeDate(value: unknown): string | null {
  if (typeof value === "string" && DATE_RE.test(value)) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return null;
}

function parsePost(slug: string, raw: string): BlogPost | null {
  const { data, content } = matter(raw);
  if (typeof data.title !== "string" || !data.title.trim()) return null;
  const date = normalizeDate(data.date);
  if (!date) return null;
  if (data.draft === true) return null; // drafts never go live
  const html = marked.parse(content.trim(), { async: false });
  const meta: BlogPostMeta = {
    slug,
    title: data.title.trim(),
    date,
    excerpt: typeof data.excerpt === "string" ? data.excerpt.trim() : "",
    lang: typeof data.lang === "string" && data.lang.trim() ? data.lang.trim() : "en",
    cover: typeof data.cover === "string" && data.cover.trim() ? data.cover.trim() : undefined,
    readingMinutes: readingMinutesOf(html),
  };
  return { ...meta, html, prev: null, next: null };
}

/** Read + parse all posts, sorted by date desc (ties: slug asc). Cached 5 min. */
function getCachedPosts(): BlogPost[] {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.posts;

  const posts: BlogPost[] = [];
  try {
    const dir = contentDir();
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort();
    for (const file of files) {
      const slug = file.replace(/\.md$/, "");
      try {
        const post = parsePost(slug, fs.readFileSync(path.join(dir, file), "utf8"));
        if (post) posts.push(post);
      } catch (err) {
        // one broken post must not take the whole blog down
        console.warn(`[blog] skipping unreadable post ${file}:`, err);
      }
    }
  } catch (err) {
    console.warn("[blog] content dir not readable:", err);
  }

  posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  // prev = newer (previous in the desc list), next = older
  for (let i = 0; i < posts.length; i++) {
    posts[i].prev = i > 0 ? toMeta(posts[i - 1]) : null;
    posts[i].next = i < posts.length - 1 ? toMeta(posts[i + 1]) : null;
  }

  cache = { at: now, posts };
  return posts;
}

function toMeta(p: BlogPost): BlogPostMeta {
  return {
    slug: p.slug,
    title: p.title,
    date: p.date,
    excerpt: p.excerpt,
    lang: p.lang,
    cover: p.cover,
    readingMinutes: p.readingMinutes,
  };
}

/** All live posts (no drafts), newest first — metadata only, safe to serialize. */
export function listPosts(): BlogPostMeta[] {
  return getCachedPosts().map(toMeta);
}

/** Slugs of all live posts — for generateStaticParams. */
export function listPostSlugs(): string[] {
  return getCachedPosts().map((p) => p.slug);
}

/** One live post by slug (with rendered HTML + prev/next), or null. */
export function getPost(slug: string): BlogPost | null {
  return getCachedPosts().find((p) => p.slug === slug) ?? null;
}
