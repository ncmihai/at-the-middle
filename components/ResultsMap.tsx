"use client";

// ResultsMap — stylized SVG map of Europe on /r/[slug] (PLAN.md Faza 4 lot 1).
// No external libs/tiles: a compact low-poly Europe outline is embedded as
// [lon, lat] polygons and projected equirectangularly into a fixed viewBox.
// Pins: home airports (amber) + one pin per result destination (sky);
// the selected result's destination is highlighted and linked to every origin
// with a dashed route line. Selection state is lifted to the page.
import * as React from "react";
import { MapPinIcon } from "lucide-react";

import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
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
const LON_MIN = -32;
const LON_MAX = 45;
const LAT_MIN = 27;
const LAT_MAX = 72;
const VIEW_W = 360;
const VIEW_H = 400;

function project(lon: number, lat: number): { x: number; y: number } {
  return {
    x: ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * VIEW_W,
    y: ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VIEW_H,
  };
}

/** [lon, lat][] -> closed SVG path */
function polyPath(points: [number, number][]): string {
  return (
    points
      .map((p, i) => {
        const { x, y } = project(p[0], p[1]);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z"
  );
}

/* ---- stylized low-poly Europe outline ([lon, lat], hand-simplified) ---- */
const LAND_MAINLAND: [number, number][] = [
  [-5.4, 36.1], [-6.3, 36.5], [-9.1, 38.7], [-8.6, 41.1], [-8.4, 43.4],
  [-2.9, 43.3], [-1.2, 45.6], [-4.7, 48.4], [-1.6, 49.6], [1.9, 50.9],
  [2.9, 51.2], [4.9, 52.4], [4.8, 53.0], [9.9, 53.6], [8.5, 55.5],
  [10.6, 57.7], [7.0, 58.0], [5.7, 59.0], [5.3, 60.4], [10.4, 63.4],
  [14.4, 67.3], [18.9, 69.6], [25.8, 71.0], [33.0, 69.5], [42.0, 66.0],
  [42.0, 44.0], [36.9, 36.8], [30.7, 36.9], [27.1, 38.4], [26.5, 40.0],
  [29.0, 41.0], [23.5, 40.6], [23.7, 38.0], [21.5, 38.2], [20.3, 39.8],
  [19.4, 42.2], [18.0, 43.5], [16.5, 44.3], [13.5, 45.6], [13.5, 44.8],
  [16.0, 42.5], [17.5, 41.5], [18.4, 40.1], [15.7, 38.0], [14.3, 40.8],
  [12.5, 41.9], [8.9, 44.4], [5.4, 43.3], [3.0, 42.4], [2.2, 41.4],
  [-0.4, 39.5], [-1.0, 37.6],
];
const LAND_UK: [number, number][] = [
  [-5.7, 50.1], [-3.0, 51.5], [-5.0, 53.0], [-4.7, 55.0], [-5.5, 56.5],
  [-5.0, 57.5], [-3.0, 58.5], [-2.0, 57.5], [-1.5, 55.5], [0.5, 53.5],
  [1.4, 52.5], [1.8, 51.0], [-1.5, 50.7],
];
const LAND_IRELAND: [number, number][] = [
  [-6.0, 52.2], [-8.0, 51.8], [-10.0, 51.9], [-9.8, 53.3], [-8.0, 55.3],
  [-6.2, 55.2], [-5.8, 54.0],
];
const LAND_ICELAND: [number, number][] = [
  [-22.5, 63.8], [-18.0, 63.4], [-14.5, 64.5], [-15.5, 66.0], [-21.0, 66.5],
  [-24.0, 65.0],
];
/** inland seas painted over the landmass with the sea color */
const SEA_BALTIC: [number, number][] = [
  [10.6, 57.7], [12.6, 55.7], [13.0, 55.6], [16.4, 56.7], [18.1, 59.3],
  [17.1, 60.7], [20.3, 63.8], [22.1, 65.6], [25.5, 65.8], [24.0, 63.5],
  [21.6, 63.1], [22.3, 60.5], [24.9, 60.2], [30.3, 59.9], [28.0, 59.0],
  [24.8, 59.4], [24.1, 57.0], [21.0, 55.7], [18.6, 54.4], [14.6, 53.4],
  [10.0, 53.8], [8.5, 55.5],
];
const SEA_BLACK: [number, number][] = [
  [27.9, 43.2], [30.7, 46.5], [33.5, 45.5], [36.5, 45.8], [39.5, 44.5],
  [41.5, 43.5], [41.0, 42.0], [38.5, 42.5], [36.0, 43.5], [33.0, 44.5],
];
const SEA_ADRIATIC: [number, number][] = [
  [12.6, 45.5], [14.0, 45.0], [16.0, 43.8], [18.5, 42.8], [19.4, 42.2],
  [18.5, 41.0], [17.5, 40.5], [18.4, 40.1], [16.5, 40.8], [15.0, 41.8],
  [13.8, 42.8], [12.3, 44.2],
];
const SEA_AEGEAN: [number, number][] = [
  [23.5, 40.5], [26.5, 40.0], [27.5, 38.5], [26.0, 37.5], [24.5, 37.5],
  [23.0, 38.5],
];
const LAND_POLYS = [LAND_MAINLAND, LAND_UK, LAND_IRELAND, LAND_ICELAND];
const SEA_POLYS = [SEA_BALTIC, SEA_BLACK, SEA_ADRIATIC, SEA_AEGEAN];

export type ResultsMapProps = {
  origins: MapOriginPin[];
  destinations: MapDestinationPin[];
  /** destination IATA currently highlighted (card hover/select) */
  selectedIata?: string | null;
  /** clicking/hovering a destination pin lifts the selection to the page */
  onSelectIata?: (iata: string | null) => void;
};

export default function ResultsMap({
  origins,
  destinations,
  selectedIata = null,
  onSelectIata,
}: ResultsMapProps) {
  const messages = useMessages();
  const selected = destinations.find((d) => d.iata === selectedIata) ?? null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">{messages.results.map.title}</h2>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full rounded-xl border border-border bg-sky-50"
          role="img"
          aria-label={messages.results.map.title}
        >
          {/* landmass */}
          {LAND_POLYS.map((poly, i) => (
            <path
              key={i}
              d={polyPath(poly)}
              className="fill-white stroke-sky-200"
              strokeWidth={1}
              strokeLinejoin="round"
            />
          ))}
          {/* inland seas */}
          {SEA_POLYS.map((poly, i) => (
            <path key={i} d={polyPath(poly)} className="fill-sky-50" />
          ))}
          {/* dashed routes from every origin to the selected destination */}
          {selected &&
            origins.map((o) => {
              const a = project(o.longitude, o.latitude);
              const b = project(selected.longitude, selected.latitude);
              return (
                <line
                  key={o.iata}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="stroke-sky-400"
                  strokeWidth={1.2}
                  strokeDasharray="3 3"
                  opacity={0.7}
                />
              );
            })}
          {/* destination pins */}
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
                  <circle cx={p.x} cy={p.y} r={10} className="fill-sky-600/20" />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 5.5 : 3.5}
                  className={cn(
                    "stroke-white",
                    isSelected ? "fill-sky-600" : "fill-sky-500/80"
                  )}
                  strokeWidth={1.5}
                />
                {isSelected && (
                  <text
                    x={p.x + 8}
                    y={p.y + 3}
                    fontSize={9}
                    className="fill-slate-700 font-semibold"
                  >
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
          {/* origin pins */}
          {origins.map((o) => {
            const p = project(o.longitude, o.latitude);
            return (
              <g key={o.iata}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  className="fill-amber-500 stroke-white"
                  strokeWidth={1.5}
                />
                <text x={p.x + 6} y={p.y - 4} fontSize={7.5} className="fill-slate-500">
                  {o.iata}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            {messages.results.map.origins}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            {messages.results.map.destinations}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
