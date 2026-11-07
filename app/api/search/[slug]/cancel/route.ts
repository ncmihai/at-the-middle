// POST /api/search/[slug]/cancel — mark the job cancelled; the worker checks the flag
// between phases/destinations and stops cleanly, keeping partial results visible.
// 200 { ok, status: "cancelled" }, 409 if already terminal, 404 if unknown. app-spec §3.
import { eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/db/client";
import { searchJobs, searches } from "@/db/schema";
import { cancelJob } from "@/lib/jobs/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TERMINAL = new Set(["completed", "failed", "cancelled"]);

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = getDb();
  const where = UUID_RE.test(slug) ? or(eq(searches.slug, slug), eq(searches.id, slug)) : eq(searches.slug, slug);
  const [search] = await db.select().from(searches).where(where).limit(1);
  if (!search) return json({ error: "not_found" }, 404);

  if (TERMINAL.has(search.status)) {
    return json({ error: "already_terminal", status: search.status }, 409);
  }

  const now = new Date();
  await db
    .update(searches)
    .set({ status: "cancelled", updatedAt: now })
    .where(eq(searches.id, search.id));
  const [job] = await db
    .select()
    .from(searchJobs)
    .where(eq(searchJobs.searchId, search.id))
    .limit(1);
  if (job) {
    await db
      .update(searchJobs)
      .set({ status: "cancelled", finishedAt: now, updatedAt: now })
      .where(eq(searchJobs.id, job.id));
    cancelJob(job.id); // in-memory flag so a running job stops between steps
  }
  return json({ ok: true, status: "cancelled" });
}
