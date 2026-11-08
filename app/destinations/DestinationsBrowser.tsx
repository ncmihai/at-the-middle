"use client";

// Client part of /destinations: live search/filter over the city list (city,
// country, country code or exact IATA code) + the card grid. All copy comes
// from the destinations.* i18n namespace via useMessages(), so the language
// switcher re-renders it in place. Counts ("times chosen as a middle", last 90
// days) are computed server-side and passed in as props.
import * as React from "react";
import Link from "next/link";
import { MapPinIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import type { DestinationCity } from "./cities";

type CityCard = Pick<
  DestinationCity,
  "slug" | "city" | "country" | "countryCode" | "iatas" | "airportCount"
> & {
  /** Faza 8A: photo thumb URL (Digi Storage mirror), null when the city has no photo */
  photoUrl: string | null;
};

type Props = {
  cities: CityCard[];
  counts: Record<string, number>;
};

export default function DestinationsBrowser({ cities, counts }: Props) {
  const messages = useMessages();
  const t = messages.destinations.index;
  const [query, setQuery] = React.useState("");

  const q = query.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!q) return cities;
    return cities.filter(
      (c) =>
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.countryCode.toLowerCase() === q ||
        c.iatas.some((iata) => iata.toLowerCase() === q)
    );
  }, [cities, q]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t.eyebrow}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t.title}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          {t.subtitle}
        </p>
        <div className="relative mt-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className="pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {t.showing(filtered.length, cities.length)}
        </p>
      </header>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {t.empty}
        </p>
      ) : (
        // Faza 9: horizontal rows — photo thumb left (fixed 96–112px), full city
        // name (wrapping, never truncated) + country + airport chips + count on
        // the right. Photo rows get the dark scrim + white text.
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((c) => {
            const onPhoto = Boolean(c.photoUrl);
            return (
              <li key={c.slug}>
                <Link
                  href={`/destinations/${c.slug}`}
                  className={cn(
                    "group relative flex h-full items-stretch gap-3 overflow-hidden rounded-2xl border p-3 shadow-sm transition-colors",
                    onPhoto
                      ? "border-white/25 text-white hover:border-white/50"
                      : "border-border bg-card hover:border-primary/60 hover:bg-muted/40"
                  )}
                >
                  {c.photoUrl && (
                    <>
                      <img
                        src={c.photoUrl}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="photo-scrim absolute inset-0" />
                    </>
                  )}
                  {c.photoUrl ? (
                    <img
                      src={c.photoUrl}
                      alt={c.city}
                      loading="lazy"
                      className="relative h-24 w-24 shrink-0 rounded-xl border border-white/30 object-cover sm:h-28 sm:w-28"
                    />
                  ) : (
                    <span className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground sm:h-28 sm:w-28">
                      <MapPinIcon className="h-6 w-6" />
                    </span>
                  )}
                  <span className="relative flex min-w-0 flex-1 flex-col gap-1">
                    <span
                      className={cn(
                        "text-base font-semibold leading-snug break-words",
                        onPhoto
                          ? "text-white drop-shadow-sm"
                          : "text-foreground group-hover:text-primary"
                      )}
                    >
                      {c.city}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1 text-xs",
                        onPhoto ? "text-white/85" : "text-muted-foreground"
                      )}
                    >
                      <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>{c.country}</span>
                    </span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      {c.iatas.map((iata) => (
                        <span
                          key={iata}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium",
                            onPhoto
                              ? "border border-white/20 bg-slate-950/55 text-white"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {iata}
                        </span>
                      ))}
                    </span>
                    <span
                      className={cn(
                        "mt-auto pt-1 text-xs",
                        onPhoto ? "text-white/85" : "font-medium text-primary"
                      )}
                    >
                      {t.chosen(counts[c.slug] ?? 0)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
