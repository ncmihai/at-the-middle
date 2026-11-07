// POST /api/search — validate, insert searches + search_jobs, enqueue the job
// (fire-and-forget), return { id, slug, status, pollUrl, sharePath } with 202.
// docs/app-spec.md §3. Strictly rate limited (RATE_LIMIT_SEARCH_PER_MIN=5/min/IP —
// proxy.ts enforces the same limit at the edge; this is defense in depth).
import { randomBytes, createHash } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/db/client";
import { searches, searchJobs } from "@/db/schema";
import { getConfig } from "@/lib/env";
import { enqueueJob } from "@/lib/jobs/worker";
import { clientKeyFrom, takeRequestSlot } from "@/lib/rate-limit";
import { validateSearchRequest } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store", ...extraHeaders },
  });
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}

export async function POST(request: NextRequest) {
  const cfg = getConfig();

  // rate limit: 5/min per IP (only counted when a proxy vouches for the address)
  const key = clientKeyFrom(request.headers);
  if (key) {
    const slot = takeRequestSlot(key, Date.now(), cfg.rateLimitSearchPerMin);
    if (!slot.ok) {
      const retryAfterSeconds = Math.max(1, Math.ceil(slot.retryAfterMs / 1000));
      return json(
        { error: "rate_limited", retryAfterSeconds },
        429,
        { "retry-after": String(retryAfterSeconds) }
      );
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const parsed = validateSearchRequest(body);
  if (!parsed.success) {
    return json(
      {
        error: "validation_failed",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      400
    );
  }
  const v = parsed.data;

  // windowStart must be today or later (UTC)
  const todayUtc = new Date().toISOString().slice(0, 10);
  if (v.windowStart < todayUtc) {
    return json(
      {
        error: "validation_failed",
        issues: [{ path: "windowStart", message: "windowStart must be today or later" }],
      },
      400
    );
  }

  const db = getDb();
  const ip = key ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ipHash = createHash("sha256").update(ip + cfg.ipHashSalt).digest("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + cfg.searchRetentionDays * 24 * 60 * 60 * 1000);

  // unguessable share slug: 72-bit base64url (12 chars), retry on unique violation
  let searchId = "";
  let slug = "";
  for (let attempt = 0; attempt < 5 && !searchId; attempt++) {
    slug = randomBytes(9).toString("base64url");
    try {
      const rows = await db
        .insert(searches)
        .values({
          slug,
          status: "queued",
          origins: v.origins.map((iata) => ({ iata, label: iata })),
          windowStart: v.windowStart,
          windowEnd: v.windowEnd,
          nights: v.nights,
          budgetEur: v.budgetPerPersonEur,
          currency: "EUR",
          maxGapHours: cfg.gapLimitHours,
          maxFlightMinutes: v.maxFlightMinutes ?? null,
          topK: cfg.topKDeepSearch,
          ipHash,
          createdAt: now,
          updatedAt: now,
          expiresAt,
        })
        .returning({ id: searches.id });
      searchId = rows[0].id;
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
    }
  }
  if (!searchId) {
    return json({ error: "slug_collision" }, 500);
  }

  const jobRows = await db
    .insert(searchJobs)
    .values({ searchId, status: "queued", createdAt: now, updatedAt: now })
    .returning({ id: searchJobs.id });
  const jobId = jobRows[0].id;

  enqueueJob(jobId); // fire-and-forget; the worker picks it up in-process

  return json(
    {
      id: searchId,
      slug,
      status: "queued",
      pollUrl: `/api/search/${slug}`,
      sharePath: `/r/${slug}`,
    },
    202
  );
}
