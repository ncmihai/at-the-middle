"use client";

import {
  ArrowRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExternalLinkIcon,
  MapPinIcon,
} from "lucide-react";
import { differenceInCalendarDays, parseISO } from "date-fns";

import type { PersonLeg, ResultEntry } from "@/lib/types";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  formatDateDay,
  formatDateShort,
  formatDuration,
  formatGap,
  formatLocalTime,
  formatMoney,
} from "@/lib/utils";
import ArrivalTimeline from "@/components/ArrivalTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/** gap badge is green when everyone arrives within 6 h (docs/app-spec.md §6.3) */
const GREEN_GAP_MINUTES = 6 * 60;

/** stable id for a result entry — used to lift hover/select state to the page and the map */
export function entryKey(entry: ResultEntry): string {
  return `${entry.rank}-${entry.destinationIata}-${entry.departureDate}`;
}

/** max over travelers of (outbound + return price) — the per-person price of this option */
export function maxPricePerPerson(entry: ResultEntry): number {
  const returnByOrigin = new Map(entry.return.map((l) => [l.origin, l.priceEur]));
  return entry.outbound.reduce(
    (m, o) => Math.max(m, o.priceEur + (returnByOrigin.get(o.origin) ?? 0)),
    0
  );
}

function LegRow({ leg, bookLabel }: { leg: PersonLeg; bookLabel: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{leg.origin}</Badge>
          <span className="text-sm font-medium">{leg.flightNumber}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatLocalTime(leg.departLocal)}
          </span>
          <ArrowRightIcon className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">
            {formatLocalTime(leg.arriveLocal)}
          </span>
          <span>· {formatDuration(leg.durationMinutes)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
        <span className="text-sm font-semibold">{formatMoney(leg.priceEur)}</span>
        <Button asChild size="sm" variant="outline">
          <a href={leg.bookingUrl} target="_blank" rel="noopener sponsored">
            <ExternalLinkIcon className="h-3.5 w-3.5" />
            {bookLabel}
          </a>
        </Button>
      </div>
    </div>
  );
}

export type ResultCardProps = {
  entry: ResultEntry;
  /** highlighted because its map pin (or the card itself) is hovered/selected */
  selected?: boolean;
  /** lift hover/select to the page so the map pin can highlight in sync */
  onSelect?: (key: string | null) => void;
};

export default function ResultCard({ entry, selected = false, onSelect }: ResultCardProps) {
  const messages = useMessages();
  const green = entry.gapMinutes <= GREEN_GAP_MINUTES;
  const returnByOrigin = new Map(entry.return.map((l) => [l.origin, l]));
  const perPerson = entry.outbound.map((o) => ({
    origin: o.origin,
    total: o.priceEur + (returnByOrigin.get(o.origin)?.priceEur ?? 0),
  }));
  const nights = differenceInCalendarDays(
    parseISO(`${entry.returnDate}T00:00:00`),
    parseISO(`${entry.departureDate}T00:00:00`)
  );
  const key = entryKey(entry);

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow",
        selected && "ring-2 ring-primary"
      )}
      onMouseEnter={() => onSelect?.(key)}
      onMouseLeave={() => onSelect?.(null)}
      onClick={() => onSelect?.(key)}
    >
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <MapPinIcon className="h-5 w-5 shrink-0 text-primary" />
            <h3 className="truncate text-lg font-semibold">
              {entry.destinationCity}, {entry.destinationCountry}
            </h3>
            <Badge variant="outline">{entry.destinationIata}</Badge>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {messages.results.rank(entry.rank)}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDaysIcon className="h-4 w-4" />
            {formatDateDay(entry.departureDate)} → {formatDateDay(entry.returnDate)}
            <span className="text-xs">· {messages.results.nights(nights)}</span>
          </span>
          <Badge variant={green ? "success" : "warning"}>
            <ClockIcon className="h-3 w-3" />
            {messages.results.gapBadge(formatGap(entry.gapMinutes))}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ArrivalTimeline legs={entry.outbound} />
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {messages.results.outbound(formatDateShort(entry.departureDate))}
          </p>
          {entry.outbound.map((leg) => (
            <LegRow key={leg.origin} leg={leg} bookLabel={messages.results.bookOutbound} />
          ))}
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {messages.results.returnLeg(formatDateShort(entry.returnDate))}
          </p>
          {entry.return.map((leg) => (
            <LegRow key={leg.origin} leg={leg} bookLabel={messages.results.bookReturn} />
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 border-t border-border bg-muted/40">
        <div className="flex flex-wrap items-center gap-2">
          {perPerson.map((p) => (
            <Badge key={p.origin} variant="secondary">
              {p.origin}: {formatMoney(p.total)} {messages.results.perPersonTotal}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">{messages.results.groupTotal}</span>
          <span className="text-xl font-bold text-primary">
            {formatMoney(entry.totalPriceEur)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{messages.results.priceNote}</p>
      </CardFooter>
    </Card>
  );
}
