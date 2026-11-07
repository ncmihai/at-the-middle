// Node-runtime boot logic for instrumentation.ts (worker recovery + prod migrations).
//   1. Boot recovery for the in-process job worker: re-enqueue queued jobs and reset
//      running jobs whose lock is older than 10 min (crashed mid-run); start the 30 s
//      sweeper (same recovery + TTL/retention cleanup). docs/app-spec.md §4.
//   2. In production, auto-run pending drizzle migrations (drizzle-orm migrator) when
//      the migrations folder ships with the artefact; otherwise log a clear warning —
//      the owner runs `npm run db:migrate` per the house rule (never an agent vs prod).
import fs from "node:fs";
import path from "node:path";

import { getDatabaseUrl, runMigrations } from "@/db/client";
import { recoverStaleJobs, startSweeper } from "@/lib/jobs/worker";

export async function registerNode(): Promise<void> {
  try {
    startSweeper();
    await recoverStaleJobs();
  } catch (err) {
    // DB may be unreachable at boot — the sweeper retries every 30 s; never crash boot.
    console.error("[instrumentation] worker recovery failed (will retry via sweeper):", err);
  }

  if (process.env.NODE_ENV === "production") {
    await runMigrationsBestEffort();
  }
}

async function runMigrationsBestEffort(): Promise<void> {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn("[instrumentation] DATABASE_URL not set — skipping auto-migrate");
      return;
    }
    void getDatabaseUrl();
    const candidates = [
      path.join(process.cwd(), "drizzle"),
      path.join(process.cwd(), "db", "drizzle"),
      path.join(process.cwd(), ".next", "standalone", "drizzle"),
    ];
    const folder = candidates.find((p) => fs.existsSync(path.join(p, "meta", "_journal.json")));
    if (!folder) {
      console.warn(
        "[instrumentation] drizzle migrations folder not found next to the server — skipping auto-migrate (owner runs `npm run db:migrate`)"
      );
      return;
    }
    await runMigrations(folder);
    console.log(`[instrumentation] drizzle migrations applied from ${folder}`);
  } catch (err) {
    console.error("[instrumentation] auto-migrate failed (owner runs `npm run db:migrate`):", err);
  }
}
