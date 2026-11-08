// Next 16 proxy (replaces middleware.ts) — rate limiting per client IP.
// Pattern from cumsevoteaza apps/web/lib/rate-limit.ts (docs/app-spec.md §7):
// in-memory fixed windows keyed by CF-Connecting-IP (fallback: first X-Forwarded-For),
// IPv6 grouped per /64, bounded map, 429 + Retry-After, no-store. No proxy header ⇒
// not counted (local dev / direct box access).
//   general            240/min/IP  (RATE_LIMIT_PER_MIN)
//   POST /api/search     5/min/IP  (RATE_LIMIT_SEARCH_PER_MIN — costs external API calls)
//   GET  /api/airports  30/min/IP  (RATE_LIMIT_AIRPORTS_PER_MIN)
//   GET  /api/popular   60/min/IP  (Faza 6 — landing "popular middle spots", aggregated read)
//
// Faza 8E — privacy-safe own pageview counter:
//   Public GET page routes only (/, /destinations*, /blog*, /r/*, /privacy, /terms);
//   /api/* is NEVER counted. Dynamic segments are bucketed (/r/<slug> → "/r/[slug]")
//   so cardinality stays tiny. Only aggregates are kept — an in-memory
//   Map<"day|path", count> (UTC day), never IPs or per-user data. The buffer is
//   flushed to the pageviews table every 60 s (upsert count = count + delta) and
//   best-effort on process exit. Flushing is fire-and-forget and never blocks a
//   response.
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getDb, isDatabaseConfigured } from "@/db/client";
import { pageviews } from "@/db/schema";
import { getConfig } from "@/lib/env";
import { clientKeyFrom, takeRequestSlot } from "@/lib/rate-limit";

/** Public GET page routes whose views we count; dynamic segments bucket to a placeholder. */
const PAGEVIEW_PATH_PATTERNS: [RegExp, string][] = [
  [/^\/$/, "/"],
  [/^\/destinations\/[^/]+$/, "/destinations/[city]"],
  [/^\/destinations(?:\/|$)/, "/destinations"],
  [/^\/blog\/[^/]+$/, "/blog/[slug]"],
  [/^\/blog(?:\/|$)/, "/blog"],
  [/^\/r\/[^/]+$/, "/r/[slug]"],
  [/^\/privacy$/, "/privacy"],
  [/^\/terms$/, "/terms"],
];

/** Worst-case buffered (day|path) keys; past it the oldest day-buckets drop. */
const MAX_PAGEVIEW_KEYS = 5_000;
const FLUSH_INTERVAL_MS = 60_000;

const pageviewBuffer = new Map<string, number>();
let flushing = false;

/** UTC calendar day (YYYY-MM-DD) of `now`. */
function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** Normalized path bucket for a pathname, or null when the route is not counted. */
function pageviewPath(pathname: string): string | null {
  if (pathname.startsWith("/api/")) return null; // NEVER count API routes
  for (const [pattern, bucket] of PAGEVIEW_PATH_PATTERNS) {
    if (pattern.test(pathname)) return bucket;
  }
  return null;
}

/** Increment the in-memory buffer — synchronous, bounded, never throws. */
function countPageview(pathname: string, now: Date): void {
  const path = pageviewPath(pathname);
  if (!path) return;
  const key = `${utcDay(now)}|${path}`;
  pageviewBuffer.set(key, (pageviewBuffer.get(key) ?? 0) + 1);
  if (pageviewBuffer.size > MAX_PAGEVIEW_KEYS) {
    // drop the oldest keys (Map iterates in insertion order)
    for (const key of pageviewBuffer.keys()) {
      pageviewBuffer.delete(key);
      if (pageviewBuffer.size <= MAX_PAGEVIEW_KEYS) break;
    }
  }
}

/**
 * Flush the buffer to the pageviews table (upsert count = count + delta).
 * Fire-and-forget by callers: it catches its own errors and never rejects.
 */
async function flushPageviews(): Promise<void> {
  if (flushing || pageviewBuffer.size === 0) return;
  if (!isDatabaseConfigured()) {
    pageviewBuffer.clear();
    return;
  }
  flushing = true;
  // Snapshot + clear first so concurrent increments land in the next flush.
  const entries = [...pageviewBuffer.entries()];
  pageviewBuffer.clear();
  try {
    const rows = entries.map(([key, count]) => {
      const [day, path] = key.split("|");
      return { day, path, count };
    });
    await getDb()
      .insert(pageviews)
      .values(rows)
      .onConflictDoUpdate({
        target: [pageviews.day, pageviews.path],
        // excluded.count = the value we tried to insert (the delta)
        set: { count: sql`${pageviews.count} + excluded.count` },
      });
  } catch (err) {
    // Never break a request over analytics: re-buffer the deltas (bounded) and retry next tick.
    console.warn("[proxy/pageviews] flush failed, re-buffering:", err);
    for (const [key, count] of entries) {
      pageviewBuffer.set(key, (pageviewBuffer.get(key) ?? 0) + count);
    }
  } finally {
    flushing = false;
  }
}

// One interval + exit hooks per process, guarded on globalThis (dev HMR reloads modules).
const globalForPageviews = globalThis as unknown as {
  __midspotPageviewFlusher?: boolean;
};
if (!globalForPageviews.__midspotPageviewFlusher) {
  globalForPageviews.__midspotPageviewFlusher = true;
  const timer = setInterval(() => {
    void flushPageviews();
  }, FLUSH_INTERVAL_MS);
  timer.unref?.();
  const onExit = () => {
    void flushPageviews(); // best-effort: the process may exit before the upsert lands
  };
  process.once("SIGTERM", onExit);
  process.once("SIGINT", onExit);
  process.once("beforeExit", onExit);
}

export function proxy(request: NextRequest) {
  if (request.method === "GET") {
    countPageview(request.nextUrl.pathname, new Date());
  }
  const key = clientKeyFrom(request.headers);
  if (!key) return NextResponse.next(); // no proxy header → not counted (local dev)

  const cfg = getConfig();
  const path = request.nextUrl.pathname;
  let limit = cfg.rateLimitPerMin;
  if (path === "/api/search" && request.method === "POST") {
    limit = cfg.rateLimitSearchPerMin;
  } else if (path === "/api/airports" && request.method === "GET") {
    limit = cfg.rateLimitAirportsPerMin;
  } else if (path === "/api/popular" && request.method === "GET") {
    // Faza 6: /api/popular — cheap aggregated read powering the landing chips
    limit = 60;
  }

  const slot = takeRequestSlot(key, Date.now(), limit);
  if (!slot.ok) {
    return new NextResponse("Too many requests. Come back later.", {
      status: 429,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "retry-after": String(Math.max(1, Math.ceil(slot.retryAfterMs / 1000))),
      },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
