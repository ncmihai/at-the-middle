"use client";

// ArrivalTimeline — per ResultCard (PLAN.md Faza 4 lot 1): a horizontal bar showing
// each traveler's outbound arrival time (sorted), with the min..max span highlighted
// as the arrival gap. Pure divs + brand colors. Arrival instants come from
// arriveLocal (ISO with offset → exact epoch ms), so no extra API fields are needed.
import * as React from "react";
import { parseISO } from "date-fns";

import type { PersonLeg } from "@/lib/types";
import { useMessages } from "@/lib/i18n";
import { cn, formatGap, formatLocalTime } from "@/lib/utils";

const PAD_MS = 30 * 60 * 1000; // half-hour padding around the first/last arrival

export default function ArrivalTimeline({
  legs,
  dark = false,
}: {
  legs: PersonLeg[];
  /** Faza 9: true on photo-background result cards — white text variant */
  dark?: boolean;
}) {
  const messages = useMessages();

  const arrivals = React.useMemo(
    () =>
      legs
        .map((l) => ({
          origin: l.origin,
          arriveLocal: l.arriveLocal,
          t: parseISO(l.arriveLocal).getTime(),
        }))
        .sort((a, b) => a.t - b.t),
    [legs]
  );

  if (arrivals.length === 0) return null;

  const min = arrivals[0].t;
  const max = arrivals[arrivals.length - 1].t;
  const lo = min - PAD_MS;
  const hi = max + PAD_MS;
  const span = hi - lo || 1;
  const pct = (t: number) => ((t - lo) / span) * 100;
  const gapMinutes = Math.round((max - min) / 60000);
  const first = arrivals[0];
  const last = arrivals[arrivals.length - 1];

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          "flex items-center justify-between gap-2 text-xs",
          dark ? "text-white/80" : "text-muted-foreground"
        )}
      >
        <span className="font-semibold uppercase tracking-wide">
          {messages.results.timeline.title}
        </span>
        <span className={cn("shrink-0 font-medium", dark ? "text-white" : "text-foreground")}>
          {messages.results.timeline.arriveWithin(formatGap(gapMinutes))}
        </span>
      </div>
      <div
        className={cn("relative h-2 w-full rounded-full", dark ? "bg-white/25" : "bg-muted")}
      >
        {/* the gap: highlighted span from first to last arrival */}
        <div
          className={cn(
            "absolute h-full rounded-full",
            dark ? "bg-sky-300/60" : "bg-primary/25"
          )}
          style={{
            left: `${pct(min)}%`,
            width: `${Math.max(2, pct(max) - pct(min))}%`,
          }}
        />
        {arrivals.map((a) => (
          <div
            key={a.origin}
            title={`${a.origin} · ${formatLocalTime(a.arriveLocal)}`}
            className={cn(
              "absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-sm",
              // on a photo the dot ring is white; on a plain card it follows the card bg
              dark ? "border-white bg-sky-300" : "border-card bg-primary"
            )}
            style={{ left: `${pct(a.t)}%` }}
          />
        ))}
      </div>
      <div
        className={cn(
          "flex items-center justify-between text-[10px]",
          dark ? "text-white/70" : "text-muted-foreground"
        )}
      >
        <span>
          {first.origin} · {formatLocalTime(first.arriveLocal)}
        </span>
        <span>
          {last.origin} · {formatLocalTime(last.arriveLocal)}
        </span>
      </div>
    </div>
  );
}
