// In-process async job worker — docs/app-spec.md §4.
// One Node process owns everything: POST /api/search enqueues fire-and-forget; the worker
// pops queued jobs (semaphore-bounded), marks them running with locked_at, runs
// runSearchJob, and marks done/failed (one automatic retry for transient errors).
// Cancel = a flag checked between phases/destinations; partial results stay visible.
// Boot recovery (instrumentation.ts register()) re-enqueues queued jobs and resets
// running jobs whose lock is older than 10 min; a 30 s sweeper repeats that plus
// TTL/retention cleanup (flight_cache.expires_at, searches.expires_at — cascade).
// The singleton is globalThis-guarded so Next dev HMR doesn't double-run it.
import { and, eq, lt } from "drizzle-orm";

import { getDb } from "@/db/client";
import { flightCache, searchJobs, searches } from "@/db/schema";
import { getConfig } from "@/lib/env";
import { runSearchJob } from "./run-search";

const STALE_LOCK_MS = 10 * 60 * 1000;
const SWEEP_INTERVAL_MS = 30_000;
const MAX_ATTEMPTS = 2;

interface WorkerState {
  queue: string[];
  running: number;
  cancelled: Set<string>;
  sweeper?: NodeJS.Timeout;
}

const g = globalThis as unknown as { __midspotWorker?: WorkerState };

function state(): WorkerState {
  if (!g.__midspotWorker) {
    g.__midspotWorker = { queue: [], running: 0, cancelled: new Set() };
  }
  return g.__midspotWorker;
}

/** Fire-and-forget enqueue (called from POST /api/search after the rows are inserted). */
export function enqueueJob(jobId: string): void {
  const s = state();
  if (!s.queue.includes(jobId)) s.queue.push(jobId);
  pump();
}

/** Mark a job cancelled; the runner checks the flag between phases and stops cleanly. */
export function cancelJob(jobId: string): void {
  state().cancelled.add(jobId);
}

export function isWorkerUp(): boolean {
  return Boolean(g.__midspotWorker);
}

async function isJobCancelled(jobId: string): Promise<boolean> {
  if (state().cancelled.has(jobId)) return true;
  try {
    const [row] = await getDb()
      .select({ status: searchJobs.status })
      .from(searchJobs)
      .where(eq(searchJobs.id, jobId))
      .limit(1);
    return row?.status === "cancelled";
  } catch {
    return false;
  }
}

function pump(): void {
  const s = state();
  const max = Math.max(1, getConfig().maxConcurrency);
  while (s.queue.length > 0 && s.running < max) {
    const jobId = s.queue.shift()!;
    s.running++;
    void processJob(jobId).finally(() => {
      s.running--;
      pump();
    });
  }
}

async function processJob(jobId: string): Promise<void> {
  const db = getDb();
  try {
    const [job] = await db.select().from(searchJobs).where(eq(searchJobs.id, jobId)).limit(1);
    if (!job || job.status !== "queued") return;
    if (await isJobCancelled(jobId)) {
      await markCancelled(jobId);
      return;
    }
    const attempts = job.attempts + 1;
    await db
      .update(searchJobs)
      .set({ status: "running", lockedAt: new Date(), startedAt: new Date(), attempts, updatedAt: new Date() })
      .where(eq(searchJobs.id, jobId));
    await db
      .update(searches)
      .set({ status: "running", updatedAt: new Date() })
      .where(eq(searches.id, job.searchId));
    try {
      await runSearchJob(jobId, { isCancelled: () => isJobCancelled(jobId), startedAtMs: Date.now() });
      if (await isJobCancelled(jobId)) {
        await markCancelled(jobId);
        return;
      }
      await db
        .update(searchJobs)
        .set({ status: "done", finishedAt: new Date(), updatedAt: new Date(), currentStep: "done" })
        .where(eq(searchJobs.id, jobId));
      await db
        .update(searches)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(searches.id, job.searchId));
    } catch (err) {
      if (await isJobCancelled(jobId)) {
        await markCancelled(jobId);
        return;
      }
      const message = err instanceof Error ? err.message : String(err);
      if (attempts < MAX_ATTEMPTS) {
        // one automatic retry for transient provider errors
        console.warn(`[worker] job ${jobId} failed (attempt ${attempts}), re-queueing: ${message}`);
        await db
          .update(searchJobs)
          .set({ status: "queued", lockedAt: null, error: message, updatedAt: new Date() })
          .where(eq(searchJobs.id, jobId));
        enqueueJob(jobId);
      } else {
        await db
          .update(searchJobs)
          .set({ status: "failed", error: message, finishedAt: new Date(), updatedAt: new Date() })
          .where(eq(searchJobs.id, jobId));
        await db
          .update(searches)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(searches.id, job.searchId));
      }
    }
  } catch (err) {
    console.error(`[worker] job ${jobId} crashed:`, err);
  } finally {
    state().cancelled.delete(jobId);
  }
}

async function markCancelled(jobId: string): Promise<void> {
  const db = getDb();
  const [job] = await db.select().from(searchJobs).where(eq(searchJobs.id, jobId)).limit(1);
  if (!job) return;
  await db
    .update(searchJobs)
    .set({ status: "cancelled", finishedAt: new Date(), updatedAt: new Date() })
    .where(eq(searchJobs.id, jobId));
  await db
    .update(searches)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(searches.id, job.searchId));
}

/**
 * Boot recovery + periodic sweep: re-enqueue queued jobs (the in-memory queue died with
 * the process), reset running jobs whose locked_at is older than 10 min (crashed mid-run)
 * to queued (or failed when out of attempts), and delete expired flight_cache rows and
 * expired searches (cascade to results + search_jobs).
 */
export async function recoverStaleJobs(): Promise<void> {
  const db = getDb();
  const staleBefore = new Date(Date.now() - STALE_LOCK_MS);
  const stale = await db
    .select()
    .from(searchJobs)
    .where(and(eq(searchJobs.status, "running"), lt(searchJobs.lockedAt, staleBefore)));
  for (const job of stale) {
    if (job.attempts < MAX_ATTEMPTS) {
      await db
        .update(searchJobs)
        .set({ status: "queued", lockedAt: null, updatedAt: new Date() })
        .where(eq(searchJobs.id, job.id));
      enqueueJob(job.id);
    } else {
      await db
        .update(searchJobs)
        .set({
          status: "failed",
          error: "stale job (lock older than 10 min)",
          finishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(searchJobs.id, job.id));
      await db
        .update(searches)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(searches.id, job.searchId));
    }
  }
  const queued = await db
    .select({ id: searchJobs.id })
    .from(searchJobs)
    .where(eq(searchJobs.status, "queued"));
  for (const q of queued) enqueueJob(q.id);
}

/** 30 s in-process sweeper: same recovery as boot + TTL/retention cleanup. */
export function startSweeper(): void {
  const s = state();
  if (s.sweeper) return;
  s.sweeper = setInterval(() => {
    void (async () => {
      try {
        await recoverStaleJobs();
      } catch (err) {
        console.error("[worker] recovery sweep failed:", err);
      }
      try {
        const db = getDb();
        const now = new Date();
        await db.delete(flightCache).where(lt(flightCache.expiresAt, now));
        await db.delete(searches).where(lt(searches.expiresAt, now)); // cascades
      } catch (err) {
        console.error("[worker] TTL cleanup failed:", err);
      }
    })();
  }, SWEEP_INTERVAL_MS);
  s.sweeper.unref?.();
}
