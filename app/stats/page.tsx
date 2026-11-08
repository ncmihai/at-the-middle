"use client";

// /stats — Faza 8E own analytics dashboard (secret-protected).
// The STATS_SECRET is NEVER in the client bundle: the owner types it once, it lives
// only in sessionStorage for the tab, and is sent as the x-stats-secret header to
// GET /api/stats. Wrong secret → 401 → message below. All chrome is driven by the
// stats.* i18n keys (all 6 languages), even though this page is effectively EN-first.
import * as React from "react";

import { useMessages } from "@/lib/i18n";

const SECRET_STORAGE_KEY = "midspot-stats-secret";

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

type Status = "idle" | "loading" | "ok" | "unauthorized" | "error";

/** Pure CSS bar chart — no chart library. `points` are {label, value}. */
function BarChart({
  points,
  labelEvery = 5,
  barClassName = "bg-primary",
}: {
  points: { label: string; value: number }[];
  labelEvery?: number;
  barClassName?: string;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  if (points.length === 0) return null;
  return (
    <div>
      <div className="flex h-36 items-end gap-[3px]">
        {points.map((p, i) => (
          <div
            key={p.label + i}
            className={`min-w-[6px] flex-1 rounded-t-sm ${barClassName}`}
            style={{ height: `${Math.max(p.value > 0 ? 2 : 0, (p.value / max) * 100)}%` }}
            title={`${p.label}: ${p.value}`}
          />
        ))}
      </div>
      <div className="mt-1 flex gap-[3px] text-[10px] text-muted-foreground">
        {points.map((p, i) => (
          <div key={p.label + i} className="min-w-[6px] flex-1 truncate">
            {i % labelEvery === 0 ? p.label.slice(5) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const m = useMessages().stats;
  const [secret, setSecret] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [data, setData] = React.useState<StatsResponse | null>(null);

  const load = React.useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/stats", {
        headers: { "x-stats-secret": trimmed },
        cache: "no-store",
      });
      if (res.status === 401) {
        setStatus("unauthorized");
        setData(null);
        return;
      }
      if (!res.ok) {
        setStatus("error");
        setData(null);
        return;
      }
      setData((await res.json()) as StatsResponse);
      setStatus("ok");
      try {
        window.sessionStorage.setItem(SECRET_STORAGE_KEY, trimmed);
      } catch {
        /* sessionStorage unavailable — the secret just won't persist for the tab */
      }
    } catch {
      setStatus("error");
      setData(null);
    }
  }, []);

  // Re-use the secret stored for this tab (if any).
  React.useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(SECRET_STORAGE_KEY);
      if (saved) {
        setSecret(saved);
        void load(saved);
      }
    } catch {
      /* ignore */
    }
  }, [load]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">{m.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{m.subtitle}</p>

      <form
        className="mt-6 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void load(secret);
        }}
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">{m.secretLabel}</span>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder={m.secretPlaceholder}
            autoComplete="off"
            className="w-72 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          disabled={status === "loading" || !secret.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {status === "loading" ? m.loading : m.unlock}
        </button>
        {status === "ok" && (
          <button
            type="button"
            onClick={() => void load(secret)}
            className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {m.retry}
          </button>
        )}
      </form>

      {status === "unauthorized" && (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {m.unauthorized}
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {m.error}
        </p>
      )}

      {data && (
        <div className="mt-8 space-y-10">
          {/* totals */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(
              [
                [m.totals.searches, data.totals.searches],
                [m.totals.results, data.totals.results],
                [m.totals.pageviews, data.totals.pageviews],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">
                  {value.toLocaleString()}
                </div>
              </div>
            ))}
          </section>

          {/* searches per day */}
          <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">{m.searchesChart}</h2>
            <div className="mt-3">
              {data.searchesPerDay.length === 0 ? (
                <p className="text-sm text-muted-foreground">{m.noData}</p>
              ) : (
                <BarChart points={data.searchesPerDay.map((d) => ({ label: d.day, value: d.count }))} />
              )}
            </div>
          </section>

          {/* pageviews per day */}
          <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">{m.pageviewsChart}</h2>
            <div className="mt-3">
              {data.pageviewsPerDay.length === 0 ? (
                <p className="text-sm text-muted-foreground">{m.noData}</p>
              ) : (
                <BarChart
                  points={data.pageviewsPerDay.map((d) => ({ label: d.day, value: d.total }))}
                  barClassName="bg-emerald-500"
                />
              )}
            </div>
            {data.pageviewsPerDay.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="py-1 pr-4 font-medium">{m.table.day}</th>
                      <th className="py-1 pr-4 font-medium">{m.table.total}</th>
                      <th className="py-1 font-medium">path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.pageviewsPerDay].reverse().map((d) => (
                      <tr key={d.day} className="border-b border-border/60">
                        <td className="py-1 pr-4 text-muted-foreground">{d.day}</td>
                        <td className="py-1 pr-4 text-foreground">{d.total.toLocaleString()}</td>
                        <td className="py-1 text-muted-foreground">
                          {d.byPath.map((p) => `${p.path} (${p.count})`).join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* popular routes */}
          <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">{m.popularRoutes}</h2>
            {data.popularRoutes.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">{m.noData}</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="py-1 pr-4 font-medium">{m.table.route}</th>
                      <th className="py-1 font-medium">{m.table.searches}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.popularRoutes.map((r) => (
                      <tr key={r.route} className="border-b border-border/60">
                        <td className="py-1 pr-4 text-foreground">{r.route}</td>
                        <td className="py-1 text-muted-foreground">{r.count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* provider usage vs cap */}
          <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">{m.providerUsage}</h2>
            {data.providerUsage.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">{m.noData}</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="py-1 pr-4 font-medium">{m.table.provider}</th>
                      <th className="py-1 pr-4 font-medium">{m.table.calls}</th>
                      <th className="py-1 pr-4 font-medium">{m.table.cap}</th>
                      <th className="py-1 font-medium">{m.table.pctUsed}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.providerUsage.map((p) => (
                      <tr key={p.provider} className="border-b border-border/60">
                        <td className="py-1 pr-4 text-foreground">{p.provider}</td>
                        <td className="py-1 pr-4 text-muted-foreground">{p.calls.toLocaleString()}</td>
                        <td className="py-1 pr-4 text-muted-foreground">{p.cap.toLocaleString()}</td>
                        <td className="py-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${p.pctUsed >= 100 ? "bg-destructive" : "bg-primary"}`}
                                style={{ width: `${Math.min(100, p.pctUsed)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{p.pctUsed}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="border-t border-border pt-4 text-xs text-muted-foreground">
            {m.cloudflareNote}
          </p>
        </div>
      )}
    </main>
  );
}
