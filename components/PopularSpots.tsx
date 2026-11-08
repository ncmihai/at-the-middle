"use client";

// components/PopularSpots.tsx — "Popular middle spots" chips on the landing
// (PLAN.md Faza 6): top destinations by search volume (last 30 days, min 3
// searches) from GET /api/popular — aggregated counts only, no per-user data.
// Fetched on mount; loading skeleton while pending; hidden when empty/error.
import * as React from "react";
import { FlameIcon } from "lucide-react";

import { useMessages } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";

type PopularSpot = { iata: string; city: string; country: string; count: number };

export default function PopularSpots() {
  const messages = useMessages();
  const [spots, setSpots] = React.useState<PopularSpot[] | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/popular", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: { spots?: PopularSpot[] }) => {
        if (!cancelled) setSpots(Array.isArray(data?.spots) ? data.spots : []);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // hide on error or when there is nothing popular yet
  if (failed || (spots !== null && spots.length === 0)) return null;

  return (
    <section aria-label={messages.popular.title} className="flex flex-col gap-2">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <FlameIcon className="h-4 w-4" />
        {messages.popular.title}
      </h2>
      {spots === null ? (
        <div className="flex flex-wrap gap-2" aria-label={messages.popular.empty}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-6 w-24 rounded-full" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {spots.map((spot) => (
            <li
              key={spot.iata}
              title={`${spot.city}, ${spot.country} — ${spot.iata}`}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm"
            >
              {messages.popular.chip(spot.city, spot.count)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
