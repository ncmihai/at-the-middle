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
import { cityPhotoForCity, cityPhotoForIata } from "@/lib/city-photo";
import { useCurrency } from "@/lib/currency";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  formatDateDay,
  formatDateShort,
  formatDuration,
  formatGap,
  formatLocalTime,
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
  /** Faza 9: true when rendered on a photo card (result cards) — white text variant */
  dark?: boolean;
};

/**
 * ADDITIVE (Faza 8B): destination forecast strip, shared by the result cards (compact:
 * "Nov 19–22 · 6–9°C · rain 20%" + per-day dots) and the destination pages (city variant:
 * 7-day widget). All copy via the weather.* i18n namespace. Renders nothing without days.
 */
export function WeatherStrip({ days, startDate, endDate, city, dark = false }: WeatherStripProps) {
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
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs",
        dark ? "text-white/85" : "text-muted-foreground"
      )}
    >
      <span
        className="inline-flex items-center gap-1"
        title={messages.weather.labels[headline.label]}
      >
        <HeadlineIcon className={cn("h-3.5 w-3.5", dark ? "text-sky-300" : "text-primary")} />
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

/** Faza 9: `dark` renders the leg row as a dark chip for photo-background cards. */
function LegRow({
  leg,
  bookLabel,
  dark = false,
}: {
  leg: PersonLeg;
  bookLabel: string;
  dark?: boolean;
}) {
  const { fmt } = useCurrency();
  const tMuted = dark ? "text-white/80" : "text-muted-foreground";
  const tStrong = dark ? "text-white" : "text-foreground";
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between",
        dark ? "border-white/15 bg-slate-950/45" : "border-border bg-background"
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(dark && "border-white/30 bg-white/10 text-white")}
          >
            {leg.origin}
          </Badge>
          <span className={cn("text-sm font-medium", tStrong)}>{leg.flightNumber}</span>
        </div>
        <div className={cn("flex items-center gap-1.5 text-sm", tMuted)}>
          <span className={cn("font-medium", tStrong)}>
            {formatLocalTime(leg.departLocal)}
          </span>
          <ArrowRightIcon className="h-3.5 w-3.5" />
          <span className={cn("font-medium", tStrong)}>
            {formatLocalTime(leg.arriveLocal)}
          </span>
          <span>· {formatDuration(leg.durationMinutes)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
        <span className="text-sm font-semibold">{fmt(leg.priceEur)}</span>
        <Button
          asChild
          size="sm"
          variant="outline"
          className={cn(
            dark &&
              "border-white/40 bg-white/10 text-white hover:bg-white/25 hover:text-white"
          )}
        >
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
  const { fmt } = useCurrency();
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
  // Faza 9: EVERY result card gets its city photo as background (bottom-up dark
  // scrim + white text); cards without a photo keep the light card style.
  const photo =
    cityPhotoForIata(entry.destinationIata) ?? cityPhotoForCity(entry.destinationCity);
  const onPhoto = Boolean(photo);
  const tMuted = onPhoto ? "text-white/80" : "text-muted-foreground";
  const iconAccent = onPhoto ? "text-sky-300" : "text-primary";
  const outlineBtn = onPhoto
    ? "border-white/40 bg-white/10 text-white hover:bg-white/25 hover:text-white"
    : "";
  const solidBadge = onPhoto
    ? "border-transparent bg-white text-slate-900 dark:bg-slate-900/90 dark:text-slate-100"
    : "";
  const gapBadge = onPhoto
    ? green
      ? "border-transparent bg-emerald-600 text-white"
      : "border-transparent bg-amber-500 text-amber-950"
    : "";

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl transition-shadow",
        onPhoto ? "border-white/25 text-white" : "",
        selected && "ring-2 ring-primary"
      )}
      onMouseEnter={() => onSelect?.(key)}
      onMouseLeave={() => onSelect?.(null)}
      onClick={() => onSelect?.(key)}
    >
      {photo && (
        <>
          <img
            src={photo.url}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* bottom-up dark scrim — white text below stays legible on any photo */}
          <div className="photo-scrim absolute inset-0" />
        </>
      )}
      <CardHeader className={cn("relative gap-3", onPhoto && "drop-shadow-sm")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <MapPinIcon className={cn("h-5 w-5 shrink-0", iconAccent)} />
            <h3
              className={cn(
                "truncate text-lg font-semibold",
                onPhoto && "text-white drop-shadow-sm"
              )}
            >
              {entry.destinationCity}, {entry.destinationCountry}
            </h3>
            <Badge
              variant="outline"
              className={cn(onPhoto && "border-white/30 bg-slate-950/50 text-white")}
            >
              {entry.destinationIata}
            </Badge>
          </div>
          <Badge variant="secondary" className={cn("shrink-0", solidBadge)}>
            {messages.results.rank(entry.rank)}
          </Badge>
        </div>
        <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 text-sm", tMuted)}>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDaysIcon className="h-4 w-4" />
            {formatDateDay(entry.departureDate)} → {formatDateDay(entry.returnDate)}
            <span className="text-xs">· {messages.results.nights(nights)}</span>
          </span>
          <Badge variant={green ? "success" : "warning"} className={gapBadge}>
            <ClockIcon className="h-3 w-3" />
            {messages.results.gapBadge(formatGap(entry.gapMinutes))}
          </Badge>
        </div>
      </CardHeader>
      <CardContent
        className={cn("relative flex flex-col gap-4", onPhoto && "drop-shadow-sm")}
      >
        {entry.weather && entry.weather.length > 0 && (
          <WeatherStrip
            days={entry.weather}
            startDate={entry.departureDate}
            endDate={entry.returnDate}
            dark={onPhoto}
          />
        )}
        <ArrivalTimeline legs={entry.outbound} dark={onPhoto} />
        <div className="flex flex-col gap-2">
          <p className={cn("text-xs font-semibold uppercase tracking-wide", tMuted)}>
            {messages.results.outbound(formatDateShort(entry.departureDate))}
          </p>
          {entry.outbound.map((leg) => (
            <LegRow
              key={leg.origin}
              leg={leg}
              bookLabel={messages.results.bookOutbound}
              dark={onPhoto}
            />
          ))}
        </div>
        <Separator className={cn(onPhoto && "bg-white/20")} />
        <div className="flex flex-col gap-2">
          <p className={cn("text-xs font-semibold uppercase tracking-wide", tMuted)}>
            {messages.results.returnLeg(formatDateShort(entry.returnDate))}
          </p>
          {entry.return.map((leg) => (
            <LegRow
              key={leg.origin}
              leg={leg}
              bookLabel={messages.results.bookReturn}
              dark={onPhoto}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter
        className={cn(
          "relative flex flex-col items-stretch gap-3 border-t",
          onPhoto ? "border-white/15 bg-slate-950/40 pb-7" : "border-border bg-muted/40"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          {perPerson.map((p) => (
            <Badge key={p.origin} variant="secondary" className={solidBadge}>
              {p.origin}: {fmt(p.total)} {messages.results.perPersonTotal}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={cn("text-sm", tMuted)}>{messages.results.groupTotal}</span>
          <span className={cn("text-xl font-bold", onPhoto ? "text-white" : "text-primary")}>
            {fmt(entry.totalPriceEur)}
          </span>
        </div>
        {entry.stayUrl && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button asChild size="sm" variant="outline" className={outlineBtn}>
              <a href={entry.stayUrl} target="_blank" rel="noopener sponsored">
                <HotelIcon className="h-3.5 w-3.5" />
                {messages.results.stay(entry.destinationCity)}
              </a>
            </Button>
            <span className={cn("text-[11px]", tMuted)}>
              {messages.results.stayNote}
            </span>
          </div>
        )}
        {entry.extras && entry.extras.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn("text-[11px] font-semibold uppercase tracking-wide", tMuted)}
            >
              {messages.results.extras.title}
            </span>
            {entry.extras.map((extra) => {
              const ExtraIcon = EXTRA_ICONS[extra.key];
              return (
                <Button
                  key={extra.key}
                  asChild
                  size="sm"
                  variant="outline"
                  className={outlineBtn}
                >
                  <a href={extra.url} target="_blank" rel="noopener sponsored">
                    <ExtraIcon className="h-3.5 w-3.5" />
                    {messages.results.extras[extra.key]}
                  </a>
                </Button>
              );
            })}
          </div>
        )}
        <p className={cn("text-xs", tMuted)}>{messages.results.priceNote}</p>
      </CardFooter>
      {photo && (
        <a
          href={photo.source}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-1.5 right-3 z-10 max-w-[80%] truncate text-[10px] leading-snug text-white/80 hover:text-white hover:underline"
        >
          {messages.results.photoCredit(photo.credit, photo.license)}
        </a>
      )}
    </Card>
  );
}
