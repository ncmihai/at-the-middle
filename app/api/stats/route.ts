// GET /api/stats — Faza 8E privacy-safe own analytics (JSON for the /stats page).
// Auth: header `x-stats-secret` must equal STATS_SECRET (from Infisical, server-only —
// never in the client bundle; the /stats page sends the value typed by the owner from
// sessionStorage). Wrong/missing secret → 401. No secret configured → always 401.
//
// Response (always no-store, in-memory cached 60 s):
//   { generatedAt, windowDays,
//     totals: { searches, results, pageviews },
//     searchesPerDay: [{ day, count }]                    — last 30 d, from searches
//     resultsCount: { total, last30d },
//     popularRoutes: [{ route, origins, count }]          — origins pair counts, last 30 d
//     providerUsage: [{ provider, ym, calls, cap, remaining, pctUsed }] — current UTC month vs PROVIDER_MONTHLY_CAP
//     pageviewsPerDay: [{ day, total, byPath: [{ path, count }] }] } — last 30 d, from pageviews
//
// Aggregates only — no IPs, no per-user rows leave this endpoint.
import { timingSafeEqual } from "node:crypto";

import { desc, eq, gte, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getDb, isDatabaseConfigured } from "@/db/client";
import { pageviews, providerUsage, results, searches, type OriginInput } from "@/db/schema";
import { getConfig } from "@/lib/env";
import { currentYm } from "@/lib/flights/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_DAYS = 30;
const POPULAR_ROUTES_LIMIT = 20;
const CACHE_MS = 60_000;

type DayCount = { day: string; count: number };
type PathCount = { path: string; count: number };
type PageviewsDay = { day: string; total: number; byPath: PathCount[] };
type PopularRoute = { route: string; origins: [string, string]; count: number };
type ProviderUsageEntry = {
  provider: string;
  ym: string;
  calls: number;
  cap: number;
  remaining: number;
  pctUsed: number;
};
type StatsResponse = {
  generatedAt: string;
  windowDays: number;
  totals: { searches: number; results: number; pageviews: number };
  searchesPerDay: DayCount[];
  resultsCount: { total: number; last30d: number };
  popularRoutes: PopularRoute[];
  providerUsage: ProviderUsageEntry[];
  pageviewsPerDay: PageviewsDay[];
};

let cache: { at: number; body: StatsResponse } | null = null;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

/** Constant-time comparison that also handles unequal lengths. */
function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** UTC day (YYYY-MM-DD) `n` days before `now`. */
function utcDayMinus(now: Date, n: number): string {
  return new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function buildStats(): Promise<StatsResponse> {
  const db = getDb();
  const cfg = getConfig();
  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const sinceDay = utcDayMinus(now, WINDOW_DAYS);
  const ym = currentYm(now);

  // searches per day (last 30 d, UTC day of created_at)
  const searchesRows = await db
    .select({ day: sql<string>`date(${searches.createdAt} at time zone 'utc')`, count: sql<number>`count(*)::int` })
    .from(searches)
    .where(gte(searches.createdAt, since))
    .groupBy(sql`date(${searches.createdAt} at time zone 'utc')`)
    .orderBy(sql`date(${searches.createdAt} at time zone 'utc')`);

  // totals
  const [searchTotalRow, resultTotalRow, pageviewTotalRow, result30Row] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(searches),
    db.select({ n: sql<number>`count(*)::int` }).from(results),
    db.select({ n: sql<number>`coalesce(sum(${pageviews.count}), 0)::int` }).from(pageviews),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(results)
      .innerJoin(searches, sql`${results.searchId} = ${searches.id}`)
      .where(gte(searches.createdAt, since)),
  ]);

  // popular routes: origins pair counts over searches of the last 30 d
  const originRows = await db
    .select({ origins: searches.origins })
    .from(searches)
    .where(gte(searches.createdAt, since));
  const pairCounts = new Map<string, { origins: [string, string]; count: number }>();
  for (const row of originRows) {
    const codes = (row.origins as OriginInput[])
      .map((o) => o.iata.toUpperCase())
      .filter(Boolean)
      .sort();
    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        const key = `${codes[i]}|${codes[j]}`;
        const entry = pairCounts.get(key) ?? { origins: [codes[i], codes[j]], count: 0 };
        entry.count += 1;
        pairCounts.set(key, entry);
      }
    }
  }
  const popularRoutes: PopularRoute[] = [...pairCounts.values()]
    .map((e) => ({ route: `${e.origins[0]}–${e.origins[1]}`, origins: e.origins, count: e.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, POPULAR_ROUTES_LIMIT);

  // provider usage this UTC month vs PROVIDER_MONTHLY_CAP
  const usageRows = await db
    .select({ provider: providerUsage.provider, calls: providerUsage.calls })
    .from(providerUsage)
    .where(eq(providerUsage.ym, ym))
    .orderBy(desc(providerUsage.calls));
  const seen = new Set(usageRows.map((r) => r.provider));
  if (!seen.has(cfg.flightsProvider)) {
    usageRows.push({ provider: cfg.flightsProvider, calls: 0 });
  }
  const providerUsageEntries: ProviderUsageEntry[] = usageRows.map((r) => ({
    provider: r.provider,
    ym,
    calls: Number(r.calls),
    cap: cfg.providerMonthlyCap,
    remaining: Math.max(0, cfg.providerMonthlyCap - Number(r.calls)),
    pctUsed: Math.min(999, Math.round((Number(r.calls) / Math.max(1, cfg.providerMonthlyCap)) * 100)),
  }));

  // pageviews per day by path (last 30 d)
  const pageviewRows = await db
    .select({ day: pageviews.day, path: pageviews.path, count: pageviews.count })
    .from(pageviews)
    .where(gte(pageviews.day, sinceDay))
    .orderBy(pageviews.day, pageviews.path);
  const byDay = new Map<string, PageviewsDay>();
  for (const row of pageviewRows) {
    const entry = byDay.get(row.day) ?? { day: row.day, total: 0, byPath: [] };
    entry.total += Number(row.count);
    entry.byPath.push({ path: row.path, count: Number(row.count) });
    byDay.set(row.day, entry);
  }
  const pageviewsPerDay = [...byDay.values()].map((d) => ({
    ...d,
    byPath: d.byPath.sort((a, b) => b.count - a.count),
  }));

  return {
    generatedAt: now.toISOString(),
    windowDays: WINDOW_DAYS,
    totals: {
      searches: Number(searchTotalRow[0]?.n ?? 0),
      results: Number(resultTotalRow[0]?.n ?? 0),
      pageviews: Number(pageviewTotalRow[0]?.n ?? 0),
    },
    searchesPerDay: searchesRows.map((r) => ({ day: r.day, count: Number(r.count) })),
    resultsCount: { total: Number(resultTotalRow[0]?.n ?? 0), last30d: Number(result30Row[0]?.n ?? 0) },
    popularRoutes,
    providerUsage: providerUsageEntries,
    pageviewsPerDay,
  };
}

export async function GET(request: NextRequest) {
  const cfg = getConfig();
  if (!cfg.statsSecret || !secretMatches(request.headers.get("x-stats-secret"), cfg.statsSecret)) {
    return json({ error: "unauthorized" }, 401);
  }
  if (!isDatabaseConfigured()) {
    return json({ error: "database not configured" }, 503);
  }
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) {
    return json(cache.body);
  }
  try {
    const body = await buildStats();
    cache = { at: now, body };
    return json(body);
  } catch (err) {
    console.error("[api/stats] failed:", err);
    return json({ error: "failed to build stats" }, 500);
  }
}
