// GET /api/search/[slug] — polling target. [slug] accepts the share slug OR the uuid id.
// Returns the SearchResponse shape (lib/types.ts): status, progress, results (ranked),
// relaxedGapHours, error. Opportunistic cleanup of expired searches (SEARCH_RETENTION_DAYS).
// docs/app-spec.md §3.
import { eq, lt, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { CANDIDATES_BY_IATA } from "@/db/candidates";
import { getDb } from "@/db/client";
import { results, searchJobs, searches, type ResultLeg } from "@/db/schema";
import { getConfig } from "@/lib/env";
import type { PersonLeg, ResultEntry, SearchResponse, SearchStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

function toPersonLeg(f: ResultLeg["outbound"], origin: string): PersonLeg {
  return {
    origin,
    flightNumber: f.flightNumber,
    departLocal: f.departLocal,
    arriveLocal: f.arriveLocal,
    durationMinutes: f.durationMinutes,
    priceEur: f.priceEur,
    bookingUrl: f.bookingUrl,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = getDb();

  // opportunistic retention cleanup (indexed sweep; cheap)
  try {
    await db.delete(searches).where(lt(searches.expiresAt, new Date()));
  } catch (err) {
    console.warn("[api/search] retention cleanup failed:", err);
  }

  const where = UUID_RE.test(slug) ? or(eq(searches.slug, slug), eq(searches.id, slug)) : eq(searches.slug, slug);
  const [search] = await db.select().from(searches).where(where).limit(1);
  if (!search) return json({ error: "not_found" }, 404);

  const [job] = await db
    .select()
    .from(searchJobs)
    .where(eq(searchJobs.searchId, search.id))
    .limit(1);
  const resultRows = await db
    .select()
    .from(results)
    .where(eq(results.searchId, search.id))
    .orderBy(results.rank);

  const cfg = getConfig();
  const resultEntries: ResultEntry[] = resultRows.map((r) => {
    const legs = r.legs as ResultLeg[];
    const dest = CANDIDATES_BY_IATA[r.destinationIata];
    return {
      rank: r.rank,
      destinationIata: r.destinationIata,
      destinationCity: dest?.city ?? r.destinationIata,
      destinationCountry: dest?.country ?? "",
      departureDate: r.departureDate,
      returnDate: r.returnDate,
      gapMinutes: r.gapMinutes,
      totalPriceEur: Number(r.totalPriceEur),
      outbound: legs.map((l) => toPersonLeg(l.outbound, l.origin.iata)),
      return: legs.map((l) => toPersonLeg(l.return, l.origin.iata)),
    };
  });

  const status = (job?.status === "done" ? "completed" : search.status) as SearchStatus;
  const response: SearchResponse & { id: string } = {
    id: search.id,
    slug: search.slug,
    status,
    progress: {
      doneSteps: job?.doneSteps ?? 0,
      totalSteps: job?.totalSteps ?? 0,
      currentStep: job?.currentStep ?? "",
    },
    results: resultEntries,
    relaxedGapHours: search.maxGapHours > cfg.gapLimitHours ? search.maxGapHours : undefined,
    usageLimited: search.usageLimited ? true : undefined,
    createdAt: search.createdAt.toISOString(),
    error: job?.error ?? undefined,
  };
  return json(response);
}
