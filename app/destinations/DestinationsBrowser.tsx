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
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/destinations/${c.slug}`}
                className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/60 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {c.photoUrl && (
                      <img
                        src={c.photoUrl}
                        alt={c.city}
                        loading="lazy"
                        className="h-14 w-14 shrink-0 rounded-xl border border-border object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-foreground group-hover:text-primary">
                        {c.city}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{c.country}</span>
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {c.iatas.join(" · ")}
                  </span>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">
                    {t.airports(c.iatas.join(", "))}
                  </span>
                  <span className="font-medium text-primary">
                    {t.chosen(counts[c.slug] ?? 0)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
