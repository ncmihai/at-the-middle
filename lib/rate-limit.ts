// In-memory per-IP fixed-window rate limiter — pattern from
// cumsevoteaza apps/web/lib/rate-limit.ts, adapted for midspot (docs/app-spec.md §7).
//
// The visitor key is Cloudflare's CF-Connecting-IP (set at the edge, not spoofable
// through the proxy), falling back to the first X-Forwarded-For entry (direct box
// access). Without either header there is nothing to count and the request passes —
// local dev and the box's loopback live-check have no proxy headers.
// IPv6 is grouped per /64 (the unit a household rotates within); IPv4 is counted whole.
// State is one bounded Map that dies with the process; past the ceiling the oldest
// entries drop, so a flood can never make the map the box's next problem.

export const RATE_WINDOW_MS = 60_000;

/** Worst-case tracked keys; past it the oldest entries drop. */
const MAX_TRACKED_KEYS = 10_000;

interface WindowState {
  count: number;
  windowStart: number;
}

const windows = new Map<string, WindowState>();

/** Test hook. */
export function resetRateLimitsForTests(): void {
  windows.clear();
}

/**
 * The visitor's key, or null when no proxy vouches for an address (local dev,
 * direct box access): such requests are not counted.
 */
export function clientKeyFrom(headers: Headers): string | null {
  const cfIp = headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return normalizeIp(cfIp);
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return normalizeIp(forwarded);
  return null;
}

function normalizeIp(ip: string): string {
  // IPv4-mapped IPv6 (::ffff:203.0.113.7) is the IPv4 address.
  if (ip.toLowerCase().startsWith("::ffff:")) ip = ip.slice(7);
  if (!ip.includes(":")) return ip;
  return ipv6Prefix(ip);
}

/** The /64 half of an IPv6 address: the part a single connection rotates within. */
function ipv6Prefix(ip: string): string {
  const shorthand = ip.split("::");
  const head = shorthand[0] ? shorthand[0].split(":").filter(Boolean) : [];
  const tail =
    shorthand.length > 1 && shorthand[1] ? shorthand[1].split(":").filter(Boolean) : [];
  const missing = 8 - head.length - tail.length;
  const groups =
    missing > 0 ? [...head, ...Array<string>(missing).fill("0"), ...tail] : head;
  return groups.slice(0, 4).join(":");
}

export interface RateLimitDecision {
  ok: boolean;
  retryAfterMs: number;
}

/**
 * One fixed window per (limit-class, key): the first request opens it, requests inside
 * it count up, and past `limit` every request until the window expires answers not-ok
 * with the wait left. A fresh key never waits. The limit is part of the bucket key so
 * general traffic (240/min) never pollutes the strict endpoint buckets (5/min search,
 * 30/min airports).
 */
export function takeRequestSlot(
  key: string,
  now: number,
  limit: number,
  windowMs: number = RATE_WINDOW_MS
): RateLimitDecision {
  prune(now, windowMs);
  const bucket = `${limit}|${key}`;
  const state = windows.get(bucket);
  if (!state || now - state.windowStart >= windowMs) {
    windows.set(bucket, { count: 1, windowStart: now });
    return { ok: true, retryAfterMs: 0 };
  }
  state.count += 1;
  if (state.count > limit) {
    return { ok: false, retryAfterMs: Math.max(1, state.windowStart + windowMs - now) };
  }
  return { ok: true, retryAfterMs: 0 };
}

/** Bounded memory: once the map is at the ceiling, expired entries go first, then oldest. */
function prune(now: number, windowMs: number): void {
  if (windows.size <= MAX_TRACKED_KEYS) return;
  for (const [key, state] of windows) {
    if (now - state.windowStart >= windowMs) windows.delete(key);
  }
  while (windows.size > MAX_TRACKED_KEYS) {
    const oldest = windows.keys().next().value;
    if (oldest === undefined) break;
    windows.delete(oldest);
  }
}
