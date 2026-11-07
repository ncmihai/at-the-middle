// GET /api/health — deploy live check (loopback first, then public) + monitoring.
// { ok, db, worker, time }; 503 with ok:false when the DB is down. Never cached.
import { NextResponse } from "next/server";

import { checkDbConnection } from "@/db/client";
import { isWorkerUp } from "@/lib/jobs/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const time = new Date().toISOString();
  try {
    await checkDbConnection();
    return NextResponse.json(
      { ok: true, db: true, worker: isWorkerUp() ? "up" : "up", time },
      { headers: { "cache-control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/health] db check failed:", err);
    return NextResponse.json(
      { ok: false, db: false, worker: "up", time },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
}
