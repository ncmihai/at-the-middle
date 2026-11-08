"use client";

// ResultsMap — full-width SVG map of Europe on /r/[slug] (PLAN.md Faza 4 lot 1, map v2).
//
// Basemap: vendored public-domain Natural Earth 110m country polygons
// (public/maps/europe.json, EEA + UK + CH + NO/IS + Western Balkans + UA/BY/MD),
// fetched once client-side with cache and rendered as SVG <path>s through an
// equirectangular projection over a fixed Europe bbox — no runtime CDN/tiles.
//
// Layers (bottom → top): country polygons → blurred "all candidate airports" dot
// layer (CANDIDATE_DESTINATIONS, feGaussianBlur) → dashed routes origin→selected
// destination → sky destination pins (selected = bigger + halo + city label) →
// amber origin pins with white ring + IATA label. Only origins + result
// destinations are colored; everything else stays muted.
//
// Hovering a destination pin OR its result card lifts the selection to the page
// (selectedIata/onSelectIata, same selectedKey as the cards) and shows an HTML
// tooltip next to the pin with city, country, dates, arrival gap, total price
// and price/person — absolutely positioned, pointer-events-none, clamped to
// the map container.
import * as React from "react";
import { MapPinIcon } from "lucide-react";

import type { ResultEntry } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { useMessages } from "@/lib/i18n";
import { cn, formatDateDay, formatGap } from "@/lib/utils";
import { CANDIDATE_DESTINATIONS } from "@/db/candidates";
import { maxPricePerPerson } from "@/components/ResultCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export type MapOriginPin = {
  iata: string;
  latitude: number;
  longitude: number;
};

export type MapDestinationPin = {
  /** destination IATA — the pin id; selection is keyed by this */
  iata: string;
  label: string;
  latitude: number;
  longitude: number;
};

/* ---- projection: equirectangular over a fixed Europe bbox ---- */
const LON0 = -25;
const LON1 = 45;
const LAT0 = 34;
const LAT1 = 72;
const K = 10; // viewBox units per degree
const VIEW_W = (LON1 - LON0) * K; // 700
const VIEW_H = (LAT1 - LAT0) * K; // 380

function project(lon: number, lat: number): { x: number; y: number } {
  return {
    x: (lon - LON0) * K,
    y: (LAT1 - lat) * K,
  };
}

/* ---- vendored basemap (public/maps/europe.json) ---- */
type Ring = [number, number][];
type BasemapFeature = {
  id: string;
  properties: { name: string };
  geometry:
    | { type: "Polygon"; coordinates: Ring[] }
    | { type: "MultiPolygon"; coordinates: Ring[][] };
};
type Basemap = { type: "FeatureCollection"; features: BasemapFeature[] };

let basemapPromise: Promise<Basemap> | null = null;
function loadBasemap(): Promise<Basemap> {
  if (!basemapPromise) {
    basemapPromise = fetch("/maps/europe.json", { cache: "force-cache" }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<Basemap>;
    });
    // allow a retry on failure instead of caching the rejection forever
    basemapPromise.catch(() => {
      basemapPromise = null;
    });
  }
  return basemapPromise;
}

/** GeoJSON feature → one SVG path `d` (all rings/polygons as subpaths) */
function featurePath(feature: BasemapFeature): string {
  const polys =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;
  return polys
    .map((rings) =>
      rings
        .map((ring) => {
          const pts = ring.map((pt, i) => {
            const { x, y } = project(pt[0], pt[1]);
            return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
          });
          return pts.join(" ") + " Z";
        })
        .join(" ")
    )
    .join(" ");
}

/** all candidate airports as projected dots, clipped to the view bounds */
const AIRPORT_DOTS = CANDIDATE_DESTINATIONS.filter(
  (c) => c.longitude >= LON0 && c.longitude <= LON1 && c.latitude >= LAT0 && c.latitude <= LAT1
).map((c) => ({ iata: c.iata, ...project(c.longitude, c.latitude) }));

export type ResultsMapProps = {
  origins: MapOriginPin[];
  destinations: MapDestinationPin[];
  /** destination IATA currently highlighted (card hover/select or pin hover) */
  selectedIata?: string | null;
  /** clicking/hovering a destination pin lifts the selection to the page */
  onSelectIata?: (iata: string | null) => void;
  /** the selected result entry — powers the tooltip (dates, gap, prices) */
  selectedEntry?: ResultEntry | null;
};

export default function ResultsMap({
  origins,
  destinations,
  selectedIata = null,
  onSelectIata,
  selectedEntry = null,
}: ResultsMapProps) {
  const messages = useMessages();
  const { fmt } = useCurrency();
  const [basemap, setBasemap] = React.useState<Basemap | null>(null);

  React.useEffect(() => {
    let alive = true;
    loadBasemap()
      .then((b) => {
        if (alive) setBasemap(b);
      })
      .catch(() => {
        // map still renders pins/routes without the land layer
      });
    return () => {
      alive = false;
    };
  }, []);

  const landPaths = React.useMemo(
    () =>
      basemap?.features.map((f) => ({
        id: f.id,
        name: f.properties.name,
        d: featurePath(f),
      })) ?? [],
    [basemap]
  );

  const selected = destinations.find((d) => d.iata === selectedIata) ?? null;

  /* rendered <-> viewBox transform: the svg letterboxes inside the container
   * (preserveAspectRatio="xMidYMid meet"), so the tooltip position must account
   * for the uniform scale + centering offset */
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState({ w: 0, h: 0 });
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tipRef = React.useRef<HTMLDivElement>(null);
  const [tipSize, setTipSize] = React.useState({ w: 0, h: 0 });
  React.useLayoutEffect(() => {
    const el = tipRef.current;
    if (el) setTipSize({ w: el.offsetWidth, h: el.offsetHeight });
  }, [selectedEntry, selectedIata, box, messages]);

  const tooltipPos = React.useMemo(() => {
    if (!selected || box.w === 0 || box.h === 0) return null;
    const scale = Math.min(box.w / VIEW_W, box.h / VIEW_H);
    const ox = (box.w - VIEW_W * scale) / 2;
    const oy = (box.h - VIEW_H * scale) / 2;
    const p = project(selected.longitude, selected.latitude);
    let left = ox + p.x * scale + 14;
    let top = oy + p.y * scale - tipSize.h - 14; // default: above-right of the pin
    if (tipSize.w > 0) {
      if (left + tipSize.w > box.w - 8) left = ox + p.x * scale - tipSize.w - 14; // flip left
      if (left < 8) left = 8;
      if (top < 8) top = oy + p.y * scale + 16; // flip below
      if (top + tipSize.h > box.h - 8) top = box.h - tipSize.h - 8;
      if (top < 8) top = 8;
    }
    return { left, top };
  }, [selected, box, tipSize]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">{messages.results.map.title}</h2>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div
          ref={containerRef}
          className="relative aspect-[4/3] w-full max-h-[70vh] overflow-hidden rounded-xl border border-border bg-sky-50 dark:bg-sky-950/50 md:aspect-[16/10]"
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label={messages.results.map.title}
          >
            <defs>
              <filter id="midspot-soft" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation={2.2} />
              </filter>
            </defs>
            {/* vendored Natural Earth basemap */}
            {landPaths.map((f) => (
              <path
                key={f.id}
                d={f.d}
                className="fill-[#f1f5f9] stroke-[#cbd5e1] dark:fill-slate-800 dark:stroke-slate-700"
                strokeWidth={0.7}
                strokeLinejoin="round"
              />
            ))}
            {/* blurred layer of ALL candidate airports ("punct difuz") */}
            <g filter="url(#midspot-soft)" className="pointer-events-none">
              {AIRPORT_DOTS.map((d) => (
                <circle
                  key={d.iata}
                  cx={d.x}
                  cy={d.y}
                  r={2.4}
                  className="fill-slate-400 dark:fill-slate-500"
                  opacity={0.38}
                />
              ))}
            </g>
            {/* dashed routes from every origin to the selected destination (under pins) */}
            {selected && (
              <g className="pointer-events-none">
                {origins.map((o) => {
                  const a = project(o.longitude, o.latitude);
                  const b = project(selected.longitude, selected.latitude);
                  return (
                    <line
                      key={o.iata}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      className="stroke-sky-500 dark:stroke-sky-400"
                      strokeWidth={1.4}
                      strokeDasharray="4 3"
                      opacity={0.75}
                    />
                  );
                })}
              </g>
            )}
            {/* destination pins (result destinations) */}
            {destinations.map((d) => {
              const p = project(d.longitude, d.latitude);
              const isSelected = d.iata === selectedIata;
              return (
                <g
                  key={d.iata}
                  className="cursor-pointer"
                  onClick={() => onSelectIata?.(isSelected ? null : d.iata)}
                  onMouseEnter={() => onSelectIata?.(d.iata)}
                  onMouseLeave={() => onSelectIata?.(null)}
                >
                  {isSelected && (
                    <circle cx={p.x} cy={p.y} r={11} className="fill-sky-500/25" />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 5.5 : 3.5}
                    className={cn(
                      "stroke-white dark:stroke-slate-900",
                      isSelected ? "fill-sky-600 dark:fill-sky-400" : "fill-sky-500/90 dark:fill-sky-400/90"
                    )}
                    strokeWidth={1.6}
                  />
                  {isSelected && (
                    <text
                      x={p.x + 9}
                      y={p.y + 3}
                      fontSize={9.5}
                      className="fill-slate-700 font-semibold dark:fill-slate-200"
                    >
                      {d.label}
                    </text>
                  )}
                </g>
              );
            })}
            {/* origin pins (home airports): solid amber + white ring + IATA label */}
            {origins.map((o) => {
              const p = project(o.longitude, o.latitude);
              return (
                <g key={o.iata} className="pointer-events-none">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={4.2}
                    className="fill-amber-500 stroke-white dark:stroke-slate-900"
                    strokeWidth={1.6}
                  />
                  <text
                    x={p.x + 6}
                    y={p.y - 5}
                    fontSize={8}
                    className="fill-slate-600 font-medium dark:fill-slate-300"
                  >
                    {o.iata}
                  </text>
                </g>
              );
            })}
          </svg>
          {/* tooltip near the selected destination pin — clamped to the map */}
          {tooltipPos && selected && selectedEntry && (
            <div
              ref={tipRef}
              className="pointer-events-none absolute z-10 w-56 rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur-sm"
              style={{ left: tooltipPos.left, top: tooltipPos.top }}
            >
              <p className="text-sm font-semibold leading-tight">
                {selectedEntry.destinationCity}, {selectedEntry.destinationCountry}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {selectedEntry.destinationIata} ·{" "}
                {messages.results.map.tooltip.dates(
                  formatDateDay(selectedEntry.departureDate),
                  formatDateDay(selectedEntry.returnDate)
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {messages.results.map.tooltip.gap(formatGap(selectedEntry.gapMinutes))}
              </p>
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {messages.results.map.tooltip.total}
                </span>
                <span className="font-semibold">
                  {fmt(selectedEntry.totalPriceEur)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {messages.results.map.tooltip.perPerson}
                </span>
                <span className="font-medium">
                  {fmt(maxPricePerPerson(selectedEntry))}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
            {messages.results.map.origins}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 ring-2 ring-white dark:ring-slate-900" />
            {messages.results.map.destinations}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400/50 blur-[1.5px]" />
            {messages.results.map.airports}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
