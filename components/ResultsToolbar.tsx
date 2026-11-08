"use client";

// ResultsToolbar — sort + filter bar above the results list on /r/[slug]
// (PLAN.md Faza 4 lot 2). Purely client-side over the results: sort by
// gap (default, matches server ranking) / total price / destination A–Z,
// filter by max arrival gap and max price per person (slider).
import * as React from "react";

import { rateFor, useCurrency } from "@/lib/currency";
import { useMessages } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export type SortKey = "gap" | "price" | "destination";

export type ToolbarState = {
  sort: SortKey;
  /** null = any */
  maxGapHours: number | null;
  /** null = any (slider at max) */
  maxPriceEur: number | null;
};

export const DEFAULT_TOOLBAR: ToolbarState = {
  sort: "gap",
  maxGapHours: null,
  maxPriceEur: null,
};

const GAP_OPTIONS = [6, 12, 24] as const;

export type ResultsToolbarProps = {
  value: ToolbarState;
  onChange: (next: ToolbarState) => void;
  /** slider upper bound: max per-person price across the current results (≥ budget fallback handled by caller) */
  priceCap: number;
  shown: number;
  total: number;
};

export default function ResultsToolbar({
  value,
  onChange,
  priceCap,
  shown,
  total,
}: ResultsToolbarProps) {
  const messages = useMessages();
  const { code, rates, rateDate, fmt } = useCurrency();
  const cap = Math.max(1, Math.ceil(priceCap));
  const priceValue = value.maxPriceEur ?? cap;
  const rateLine =
    code !== "EUR"
      ? messages.currency.rateLine({
          rate: new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(
            rateFor(code, rates)
          ),
          cur: code,
          date: rateDate || "—",
        })
      : null;

  return (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">
          {messages.results.toolbar.sortLabel}
        </Label>
        <Select
          value={value.sort}
          onValueChange={(v) => onChange({ ...value, sort: v as SortKey })}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gap">{messages.results.toolbar.sortGap}</SelectItem>
            <SelectItem value="price">{messages.results.toolbar.sortPrice}</SelectItem>
            <SelectItem value="destination">
              {messages.results.toolbar.sortDestination}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">
          {messages.results.toolbar.gapLabel}
        </Label>
        <Select
          value={value.maxGapHours == null ? "any" : String(value.maxGapHours)}
          onValueChange={(v) =>
            onChange({
              ...value,
              maxGapHours: v === "any" ? null : Number(v),
            })
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{messages.results.toolbar.gapAny}</SelectItem>
            {GAP_OPTIONS.map((h) => (
              <SelectItem key={h} value={String(h)}>
                {messages.results.toolbar.gapHours(h)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-w-40 flex-1 flex-col gap-1">
        <Label className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{messages.results.toolbar.priceLabel}</span>
          <span className="font-medium text-foreground">
            {value.maxPriceEur == null
              ? messages.results.toolbar.priceAny
              : fmt(value.maxPriceEur)}
          </span>
        </Label>
        <Slider
          className="mt-1.5"
          min={0}
          max={cap}
          step={10}
          value={[priceValue]}
          onValueChange={([v]) =>
            onChange({ ...value, maxPriceEur: v >= cap ? null : v })
          }
          aria-label={messages.results.toolbar.priceLabel}
        />
      </div>

      {total > 0 && (
        <span className="ml-auto pb-1 text-xs text-muted-foreground">
          {messages.results.toolbar.showing(shown, total)}
        </span>
      )}

      {rateLine && (
        <p className="w-full text-xs text-muted-foreground/70">{rateLine}</p>
      )}
    </div>
  );
}
