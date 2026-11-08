"use client";

// components/RecentSearches.tsx — local search history on the landing page
// (PLAN.md Faza 4 lot 6). No login: everything lives in localStorage under
// "midspot-history" (max 8 entries, most-recent-first, deduped by params hash).
// SearchForm records an entry right after POST /api/search returns 202; this
// component renders the entries as clickable chips under the form and resolves
// IATA → city names via /api/airports?q=<iata> (cached in the component).
// localStorage is only touched inside effects/handlers — SSR-safe.
import * as React from "react";
import { useRouter } from "next/navigation";
import { HistoryIcon, XIcon } from "lucide-react";

import type { SearchRequest } from "@/lib/types";
import { useMessages } from "@/lib/i18n";
import { formatDateDay } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const HISTORY_KEY = "midspot-history";
export const HISTORY_MAX = 8;

export type HistoryEntry = {
  slug: string;
  origins: string[]; // IATA codes
  windowStart: string; // YYYY-MM-DD
  windowEnd: string; // YYYY-MM-DD
  nights: number;
  budget: number; // EUR per person at search time
  createdAt: number; // epoch ms
  /** IATA of the rank-1 result, filled in from the results page once known */
  topDestination?: string | null;
};

function isHistoryEntry(v: unknown): v is HistoryEntry {
  if (!v || typeof v !== "object") return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.slug === "string" &&
    Array.isArray(e.origins) &&
    e.origins.every((o) => typeof o === "string") &&
    typeof e.windowStart === "string" &&
    typeof e.windowEnd === "string" &&
    typeof e.nights === "number" &&
    typeof e.budget === "number" &&
    typeof e.createdAt === "number"
  );
}

/** Stable identity of a search = its params (origins order-insensitive). Used for dedupe. */
export function historyHash(req: {
  origins: string[];
  windowStart: string;
  windowEnd: string;
  nights: number;
  budgetPerPersonEur: number;
}): string {
  return JSON.stringify({
    o: req.origins.map((s) => s.toUpperCase()).sort(),
    ws: req.windowStart,
    we: req.windowEnd,
    n: req.nights,
    b: req.budgetPerPersonEur,
  });
}

function entryHash(e: HistoryEntry): string {
  return historyHash({
    origins: e.origins,
    windowStart: e.windowStart,
    windowEnd: e.windowEnd,
    nights: e.nights,
    budgetPerPersonEur: e.budget,
  });
}

export function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry).slice(0, HISTORY_MAX);
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]): void {
  try {
    window.localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(entries.slice(0, HISTORY_MAX))
    );
  } catch {
    // storage full or blocked — history is best-effort
  }
}

/** Record a successful search (POST /api/search → 202). Most-recent-first, dedupe by params hash, max 8. */
export function recordSearch(req: SearchRequest, slug: string): void {
  if (typeof window === "undefined") return;
  const entry: HistoryEntry = {
    slug,
    origins: req.origins,
    windowStart: req.windowStart,
    windowEnd: req.windowEnd,
    nights: req.nights,
    budget: req.budgetPerPersonEur,
    createdAt: Date.now(),
    topDestination: null,
  };
  const hash = historyHash(req);
  const rest = readHistory().filter((e) => entryHash(e) !== hash);
  writeHistory([entry, ...rest]);
}

/** Fill in the rank-1 destination of a history entry (called from the results page once results arrive). */
export function setHistoryTopDestination(slug: string, iata: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = readHistory();
    const idx = all.findIndex((e) => e.slug === slug);
    if (idx < 0 || all[idx].topDestination === iata) return;
    const next = [...all];
    next[idx] = { ...next[idx], topDestination: iata };
    writeHistory(next);
  } catch {
    // best-effort
  }
}

/** "Nov 20" + "Nov 21" → "Nov 20–21" (same month); "Nov 20" + "Dec 2" → "Nov 20–Dec 2". */
function formatWindow(startIso: string, endIso: string): string {
  const s = formatDateDay(startIso);
  const e = formatDateDay(endIso);
  if (s === e) return s;
  const [sm, ...sd] = s.split(" ");
  const [em, ...ed] = e.split(" ");
  if (sm === em && sd.length > 0 && ed.length > 0) return `${s}–${ed.join(" ")}`;
  return `${s}–${e}`;
}

/** "OTP + BER" (IATA codes; collapses to "OTP + LHR+2" style when more than 3 origins). */
function formatOrigins(origins: string[]): string {
  const MAX_SHOWN = 3;
  if (origins.length <= MAX_SHOWN) return origins.join(" + ");
  return `${origins.slice(0, MAX_SHOWN).join(" + ")}+${origins.length - MAX_SHOWN}`;
}

export default function RecentSearches() {
  const messages = useMessages();
  const router = useRouter();
  const [entries, setEntries] = React.useState<HistoryEntry[]>([]);
  const [cities, setCities] = React.useState<Record<string, string>>({});
  const requestedRef = React.useRef(new Set<string>());

  // localStorage only after mount (SSR-safe: first client render matches SSR with [])
  React.useEffect(() => {
    setEntries(readHistory());
  }, []);

  // resolve IATA → city via /api/airports?q=<iata>, cached in the component
  React.useEffect(() => {
    const iatas = new Set<string>();
    for (const e of entries) {
      for (const o of e.origins) iatas.add(o.toUpperCase());
      if (e.topDestination) iatas.add(e.topDestination.toUpperCase());
    }
    let cancelled = false;
    for (const iata of iatas) {
      if (requestedRef.current.has(iata)) continue;
      requestedRef.current.add(iata);
      fetch(`/api/airports?q=${encodeURIComponent(iata)}`, { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { results?: { iata: string; city: string; name: string }[] } | null) => {
          if (cancelled || !data?.results?.length) return;
          const hit = data.results.find((r) => r.iata === iata) ?? data.results[0];
          setCities((prev) =>
            prev[iata] ? prev : { ...prev, [iata]: hit.city || hit.name || iata }
          );
        })
        .catch(() => {
          requestedRef.current.delete(iata); // allow retry on a later render
        });
    }
    return () => {
      cancelled = true;
    };
  }, [entries]);

  if (entries.length === 0) return null;

  const clear = () => {
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      // ignore
    }
    setEntries([]);
  };

  return (
    <section aria-label={messages.history.title} className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <HistoryIcon className="h-4 w-4" />
          {messages.history.title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clear}
          className="h-7 px-2 text-xs text-muted-foreground"
        >
          <XIcon className="h-3.5 w-3.5" />
          {messages.history.clear}
        </Button>
      </div>
      <ul className="flex flex-wrap gap-2">
        {entries.map((entry) => {
          const dest = entry.topDestination
            ? (cities[entry.topDestination.toUpperCase()] ?? entry.topDestination)
            : null;
          const label = [
            dest,
            formatOrigins(entry.origins.map((o) => o.toUpperCase())),
            formatWindow(entry.windowStart, entry.windowEnd),
            messages.results.nights(entry.nights),
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={entry.slug}>
              <button
                type="button"
                onClick={() => router.push(`/r/${encodeURIComponent(entry.slug)}`)}
                aria-label={messages.history.chipAria(label)}
                title={label}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
