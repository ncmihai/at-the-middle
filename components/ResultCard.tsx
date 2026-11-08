"use client";

import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CarIcon,
  CarTaxiFrontIcon,
  ClockIcon,
  CloudDrizzleIcon,
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudSunIcon,
  ExternalLinkIcon,
  HotelIcon,
  MapPinIcon,
  SmartphoneIcon,
  SunIcon,
  TicketIcon,
  UmbrellaIcon,
  type LucideIcon,
} from "lucide-react";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";

import type {
  PersonLeg,
  ResultEntry,
  ResultExtraKey,
  ResultWeatherDay,
  WeatherCondition,
  WeatherIconName,
} from "@/lib/types";
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

/** ADDITIVE (Faza 7): icon per affiliate "extra" kind (ResultEntry.extras) */
const EXTRA_ICONS: Record<ResultExtraKey, LucideIcon> = {
  transfer: CarTaxiFrontIcon,
  car: CarIcon,
  esim: SmartphoneIcon,
  activities: TicketIcon,
};

/** ADDITIVE (Faza 8B): lucide icon per weather condition (ResultWeatherDay.icon) */
const WEATHER_ICONS: Record<WeatherIconName, LucideIcon> = {
  sun: SunIcon,
  cloudSun: CloudSunIcon,
  cloud: CloudIcon,
  cloudFog: CloudFogIcon,
  cloudRain: CloudRainIcon,
  cloudSnow: CloudSnowIcon,
  cloudDrizzle: CloudDrizzleIcon,
  cloudLightning: CloudLightningIcon,
};

/** ADDITIVE (Faza 8B): dot color per weather condition (per-day dots in the strip) */
const WEATHER_DOT: Record<WeatherCondition, string> = {
  clear: "bg-amber-400",
  partlyCloudy: "bg-sky-300",
  cloudy: "bg-slate-400",
  fog: "bg-gray-400",
  rain: "bg-blue-500",
  snow: "bg-cyan-200",
  showers: "bg-blue-400",
  thunderstorm: "bg-violet-500",
};

/** "2026-11-19"→"2026-11-22" renders as "Nov 19–22" (same month) or "Nov 19 – Dec 2" */
function formatRangeShort(startDate: string, endDate: string): string {
  try {
    const s = parseISO(`${startDate}T00:00:00`);
    const e = parseISO(`${endDate}T00:00:00`);
    if (format(s, "yyyy-MM") === format(e, "yyyy-MM")) {
      return `${format(s, "MMM d")}–${format(e, "d")}`;
    }
    return `${format(s, "MMM d")} – ${format(e, "MMM d")}`;
  } catch {
    return `${startDate}–${endDate}`;
  }
}

function dayDate(startDate: string | undefined, i: number): string | undefined {
  if (!startDate) return undefined;
  try {
    return format(addDays(parseISO(`${startDate}T00:00:00`), i), "yyyy-MM-dd");
  } catch {
    return undefined;
  }
}

export type WeatherStripProps = {
  days: ResultWeatherDay[];
  /** first forecast day (YYYY-MM-DD); day i is startDate + i — used for dot tooltips */
  startDate?: string;
  /** display range end (defaults to startDate + days.length - 1) */
  endDate?: string;
  /** set → page variant: titled 7-day widget for /destinations/[city] ("Weather in {city}") */
  city?: string;
};

/**
 * ADDITIVE (Faza 8B): destination forecast strip, shared by the result cards (compact:
 * "Nov 19–22 · 6–9°C · rain 20%" + per-day dots) and the destination pages (city variant:
 * 7-day widget). All copy via the weather.* i18n namespace. Renders nothing without days.
 */
export function WeatherStrip({ days, startDate, endDate, city }: WeatherStripProps) {
  const messages = useMessages();
  if (days.length === 0) return null;

  const tMin = Math.min(...days.map((d) => d.tMin));
  const tMax = Math.max(...days.map((d) => d.tMax));
  const maxRain = Math.max(...days.map((d) => d.rainPct));
  // headline icon = the rainiest day's condition (first day wins ties)
  const headline = days.reduce((a, b) => (b.rainPct > a.rainPct ? b : a));
  const HeadlineIcon = WEATHER_ICONS[headline.icon];
  const lastDate = dayDate(startDate, days.length - 1);
  const rangeEnd = endDate ?? lastDate;

  const dotTitle = (d: ResultWeatherDay, i: number) => {
    const date = dayDate(startDate, i);
    const head = `${messages.weather.labels[d.label]}, ${d.tMin}–${d.tMax}°C, ${messages.weather.rain(d.rainPct)}`;
    return date ? `${formatDateDay(date)} — ${head}` : head;
  };

  if (city) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-xs font-semibold tracking-widest text-primary uppercase">
          {messages.weather.title(city)}
        </h2>
        <div className="flex items-start justify-between gap-1">
          {days.map((d, i) => {
            const Icon = WEATHER_ICONS[d.icon];
            const date = dayDate(startDate, i);
            return (
              <div
                key={i}
                className="flex min-w-0 flex-1 flex-col items-center gap-0.5 text-center"
                title={dotTitle(d, i)}
              >
                <span className="text-[10px] text-muted-foreground">
                  {date ? format(parseISO(`${date}T00:00:00`), "EEE") : ""}
                </span>
                <Icon className="h-4 w-4 text-foreground" />
                <span className="text-xs font-semibold text-foreground">{d.tMax}°</span>
                <span className="text-[10px] text-muted-foreground">{d.tMin}°</span>
                <span
                  className={cn(
                    "text-[10px]",
                    d.rainPct > 0 ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground/40"
                  )}
                >
                  {d.rainPct > 0 ? `${d.rainPct}%` : "–"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground">{messages.weather.source}</p>
      </section>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <span
        className="inline-flex items-center gap-1"
        title={messages.weather.labels[headline.label]}
      >
        <HeadlineIcon className="h-3.5 w-3.5 text-primary" />
        {startDate && rangeEnd && <span>{formatRangeShort(startDate, rangeEnd)}</span>}
      </span>
      <span>
        {tMin}–{tMax}°C
      </span>
      <span className="inline-flex items-center gap-1">
        <UmbrellaIcon className="h-3 w-3" />
        {messages.weather.rain(maxRain)}
      </span>
      <span className="inline-flex items-center gap-1" aria-hidden="true">
        {days.map((d, i) => (
          <span
            key={i}
            className={cn("h-1.5 w-1.5 rounded-full", WEATHER_DOT[d.label])}
            title={dotTitle(d, i)}
          />
        ))}
      </span>
    </div>
  );
}

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
        {entry.weather && entry.weather.length > 0 && (
          <WeatherStrip
            days={entry.weather}
            startDate={entry.departureDate}
            endDate={entry.returnDate}
          />
        )}
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
        {entry.stayUrl && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button asChild size="sm" variant="outline">
              <a href={entry.stayUrl} target="_blank" rel="noopener sponsored">
                <HotelIcon className="h-3.5 w-3.5" />
                {messages.results.stay(entry.destinationCity)}
              </a>
            </Button>
            <span className="text-[11px] text-muted-foreground">
              {messages.results.stayNote}
            </span>
          </div>
        )}
        {entry.extras && entry.extras.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {messages.results.extras.title}
            </span>
            {entry.extras.map((extra) => {
              const ExtraIcon = EXTRA_ICONS[extra.key];
              return (
                <Button key={extra.key} asChild size="sm" variant="outline">
                  <a href={extra.url} target="_blank" rel="noopener sponsored">
                    <ExtraIcon className="h-3.5 w-3.5" />
                    {messages.results.extras[extra.key]}
                  </a>
                </Button>
              );
            })}
          </div>
        )}
        <p className="text-xs text-muted-foreground">{messages.results.priceNote}</p>
      </CardFooter>
    </Card>
  );
}
