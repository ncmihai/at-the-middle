// External provider call accounting — the monthly cost guard (PLAN.md Faza 3 #2).
// One row per (ym, provider) in the provider_usage table; ym = YYYY-MM UTC.
// bumpUsage() is called at the top of every external HTTP call an adapter makes
// and is FIRE-AND-FORGET: it catches its own errors and never rejects, so usage
// tracking can never break a search. getUsage() reads the counter for the cap
// check in lib/jobs/run-search.ts (PROVIDER_MONTHLY_CAP, default 200/month).
import { sql } from "drizzle-orm";
import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { providerUsage } from "@/db/schema";

/** Current UTC month as YYYY-MM. */
export function currentYm(now: Date = new Date()): string {
  return now.toISOString().slice(0, 7);
}

/**
 * Increment calls+1 for (ym, provider). Never throws — on DB error it logs a
 * warning and resolves, so callers can fire-and-forget it safely.
 */
export async function bumpUsage(provider: string, ym: string = currentYm()): Promise<void> {
  try {
    await getDb()
      .insert(providerUsage)
      .values({ ym, provider, calls: 1 })
      .onConflictDoUpdate({
        target: [providerUsage.ym, providerUsage.provider],
        set: { calls: sql`${providerUsage.calls} + 1` },
      });
  } catch (err) {
    console.warn(`[flights/usage] bumpUsage(${provider}, ${ym}) failed:`, err);
  }
}

/**
 * External calls made by `provider` in month `ym` (defaults to the current UTC
 * month). Never throws — returns 0 on DB error (fail-open: a broken counter must
 * not take the site down; the cap check then simply passes).
 */
export async function getUsage(provider: string, ym: string = currentYm()): Promise<number> {
  try {
    const rows = await getDb()
      .select({ calls: providerUsage.calls })
      .from(providerUsage)
      .where(and(eq(providerUsage.ym, ym), eq(providerUsage.provider, provider)))
      .limit(1);
    return rows[0]?.calls ?? 0;
  } catch (err) {
    console.warn(`[flights/usage] getUsage(${provider}, ${ym}) failed:`, err);
    return 0;
  }
}
