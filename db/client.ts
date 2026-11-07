// Lazy postgres + drizzle singleton (amdedat packages/db pattern, pg driver).
// Env is read inside functions, never at module top-level, so `next build`
// works without secrets. The instance is guarded on globalThis so Next dev
// HMR / multiple route bundles share one pool per process.
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import * as schema from "./schema";

export type MidspotDb = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __midspotPool?: Pool;
  __midspotDb?: MidspotDb;
};

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set (canonical: postgres://midspot:…@127.0.0.1:5433/midspot)"
    );
  }
  return url;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Raw pg Pool, created lazily on first call. */
export function getPool(): Pool {
  if (!globalForDb.__midspotPool) {
    globalForDb.__midspotPool = new Pool({
      connectionString: getDatabaseUrl(),
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      // behind Cloudflare the 100 s request cap is handled by async jobs; idle
      // sockets must not linger forever though:
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return globalForDb.__midspotPool;
}

/** Drizzle handle bound to the shared pool. */
export function getDb(): MidspotDb {
  if (!globalForDb.__midspotDb) {
    globalForDb.__midspotDb = drizzle(getPool(), { schema });
  }
  return globalForDb.__midspotDb;
}

export async function checkDbConnection(): Promise<void> {
  await getPool().query("select 1");
}

/** Run pending drizzle migrations from a migrations folder (used by instrumentation at boot). */
export async function runMigrations(migrationsFolder: string): Promise<void> {
  const db = drizzle(getPool());
  await migrate(db, { migrationsFolder });
}

export async function closeDb(): Promise<void> {
  if (globalForDb.__midspotPool) {
    await globalForDb.__midspotPool.end();
  }
  globalForDb.__midspotPool = undefined;
  globalForDb.__midspotDb = undefined;
}
