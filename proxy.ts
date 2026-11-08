// Next 16 proxy (replaces middleware.ts) — rate limiting per client IP.
// Pattern from cumsevoteaza apps/web/lib/rate-limit.ts (docs/app-spec.md §7):
// in-memory fixed windows keyed by CF-Connecting-IP (fallback: first X-Forwarded-For),
// IPv6 grouped per /64, bounded map, 429 + Retry-After, no-store. No proxy header ⇒
// not counted (local dev / direct box access).
//   general            240/min/IP  (RATE_LIMIT_PER_MIN)
//   POST /api/search     5/min/IP  (RATE_LIMIT_SEARCH_PER_MIN — costs external API calls)
//   GET  /api/airports  30/min/IP  (RATE_LIMIT_AIRPORTS_PER_MIN)
//   GET  /api/popular   60/min/IP  (Faza 6 — landing "popular middle spots", aggregated read)
import { NextRequest, NextResponse } from "next/server";

import { getConfig } from "@/lib/env";
import { clientKeyFrom, takeRequestSlot } from "@/lib/rate-limit";

export function proxy(request: NextRequest) {
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
