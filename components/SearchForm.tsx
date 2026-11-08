"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  BedDoubleIcon,
  CalendarDaysIcon,
  ClockIcon,
  Loader2Icon,
  MapPinIcon,
  MinusIcon,
  PlaneIcon,
  PlusIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { toast } from "sonner";

import { searchRequestSchema } from "@/lib/validation";
import type { AirportSuggestion } from "@/lib/types";
import { useLanguage, useMessages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import OriginAutocomplete from "@/components/OriginAutocomplete";
import RecentSearches, { recordSearch } from "@/components/RecentSearches";

type FormInput = z.input<typeof searchRequestSchema>;
type FormOutput = z.output<typeof searchRequestSchema>;

const MIN_ORIGINS = 2;
const MAX_ORIGINS = 8;
const MAX_WINDOW_DAYS = 14; // windowEnd - windowStart <= 13
const MIN_NIGHTS = 1;
const MAX_NIGHTS = 30;
const BUDGET_SLIDER_MIN = 50;
const BUDGET_SLIDER_MAX = 1000;

type OriginRow = { id: number; value: AirportSuggestion | null };

/** RHF nests array errors as { message?, [index]: { message } } — flatten to the first message. */
function firstErrorMessage(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const rec = err as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message) return rec.message;
  for (const key of Object.keys(rec)) {
    const msg = firstErrorMessage(rec[key]);
    if (msg) return msg;
  }
  return undefined;
}

export default function SearchForm() {
  const router = useRouter();
  const messages = useMessages();
  const [lang] = useLanguage();
  const [rows, setRows] = React.useState<OriginRow[]>([
    { id: 0, value: null },
    { id: 1, value: null },
  ]);
  const nextRowId = React.useRef(2);
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  const [dateOpen, setDateOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(searchRequestSchema),
    defaultValues: {
      origins: ["", ""],
      windowStart: "",
      windowEnd: "",
      nights: 4,
      budgetPerPersonEur: 250,
      maxFlightMinutes: null,
    },
  });
  const { handleSubmit, setValue, watch, setError, clearErrors, formState } = form;
  const { errors } = formState;

  const nights = watch("nights");
  const budget = watch("budgetPerPersonEur");
  const maxFlightMinutes = watch("maxFlightMinutes");

  const syncOrigins = (next: OriginRow[]) => {
    setRows(next);
    setValue(
      "origins",
      next.map((r) => r.value?.iata ?? ""),
      { shouldDirty: true }
    );
  };

  const addOrigin = () => {
    if (rows.length >= MAX_ORIGINS) return;
    syncOrigins([...rows, { id: nextRowId.current++, value: null }]);
  };

  const removeOrigin = (id: number) => {
    if (rows.length <= MIN_ORIGINS) return;
    syncOrigins(rows.filter((r) => r.id !== id));
  };

  const changeOrigin = (id: number, value: AirportSuggestion | null) => {
    syncOrigins(rows.map((r) => (r.id === id ? { ...r, value } : r)));
  };

  /** "Use my location" — GET /api/location resolves the nearest airport from the
      visitor's IP and prefills the first empty origin row. The IP is never stored. */
  const detectLocation = async () => {
    setLocating(true);
    try {
      const res = await fetch(`/api/location?locale=${encodeURIComponent(lang)}`, {
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as {
        iata: string | null;
        city?: string | null;
        country?: string | null;
        countryCode?: string | null;
      } | null;
      if (res.ok && data?.iata) {
        const emptyRow = rows.find((r) => !r.value);
        if (!emptyRow) {
          toast.info(messages.form.locationNoEmptyRow);
          return;
        }
        changeOrigin(emptyRow.id, {
          iata: data.iata,
          name: data.city ?? data.iata,
          city: data.city ?? data.iata,
          country: data.country ?? "",
          countryCode: data.countryCode ?? "",
        });
      } else {
        toast.error(messages.form.locationFailed);
      }
    } catch {
      toast.error(messages.form.locationFailed);
    } finally {
      setLocating(false);
    }
  };

  const originsError = React.useMemo(() => {
    if (!errors.origins) return undefined;
    const iatas = rows.map((r) => r.value?.iata ?? "");
    if (iatas.some((i) => !i)) return messages.form.errors.originsRequired;
    if (new Set(iatas).size !== iatas.length) return messages.form.errors.originsUnique;
    return firstErrorMessage(errors.origins);
  }, [errors.origins, rows, messages]);

  const onRangeSelect = (next: DateRange | undefined) => {
    if (!next?.from) {
      setRange(undefined);
      setValue("windowStart", "", { shouldDirty: true });
      setValue("windowEnd", "", { shouldDirty: true });
      return;
    }
    const { from } = next;
    let { to } = next;
    // max span: 14 departure days => windowEnd - windowStart <= 13 days
    if (from && to && differenceInCalendarDays(to, from) > MAX_WINDOW_DAYS - 1) {
      to = addDays(from, MAX_WINDOW_DAYS - 1);
    }
    setRange({ from, to });
    setValue("windowStart", format(from, "yyyy-MM-dd"), { shouldDirty: true });
    if (to) {
      setValue("windowEnd", format(to, "yyyy-MM-dd"), { shouldDirty: true });
      setDateOpen(false);
    } else {
      setValue("windowEnd", "", { shouldDirty: true });
    }
  };

  const setNights = (n: number) =>
    setValue("nights", Math.min(MAX_NIGHTS, Math.max(MIN_NIGHTS, n)), {
      shouldDirty: true,
      shouldValidate: true,
    });

  const onSubmit = async (values: FormOutput) => {
    setSubmitting(true);
    clearErrors("root");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => null)) as {
        slug?: string;
        sharePath?: string;
        error?: string;
        retryAfterSeconds?: number;
      } | null;
      if (res.status === 202 && data?.slug) {
        // Faza 4 lot 6: remember this search in the local history (localStorage, no login)
        recordSearch(values, data.slug);
        router.push(data.sharePath ?? `/r/${data.slug}`);
        return;
      }
      if (res.status === 429) {
        toast.error(messages.form.errors.rateLimited(data?.retryAfterSeconds));
        return;
      }
      if (res.status === 400) {
        setError("root", {
          type: "server",
          message: messages.form.errors.validationFailed,
        });
        toast.error(messages.form.errors.validationFailed);
        return;
      }
      toast.error(messages.form.errors.generic);
    } catch {
      toast.error(messages.form.errors.network);
    } finally {
      setSubmitting(false);
    }
  };

  const budgetClamped = Math.min(
    BUDGET_SLIDER_MAX,
    Math.max(BUDGET_SLIDER_MIN, Number(budget) || BUDGET_SLIDER_MIN)
  );

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PlaneIcon className="h-5 w-5 text-primary" />
            {messages.form.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="flex flex-col gap-6"
            noValidate
          >
            {/* origins */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-primary" />
                {messages.form.originsLabel}
              </Label>
              <p className="text-xs text-muted-foreground">{messages.form.originsHint}</p>
              <div className="flex flex-col gap-2">
                {rows.map((row, index) => (
                  <div key={row.id} className="flex items-center gap-2">
                    <OriginAutocomplete
                      value={row.value}
                      onChange={(v) => changeOrigin(row.id, v)}
                      placeholder={`${messages.form.originSelectedPlaceholder} ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOrigin(row.id)}
                      disabled={rows.length <= MIN_ORIGINS}
                      aria-label={messages.form.removeOrigin}
                      title={messages.form.removeOrigin}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOrigin}
                  disabled={rows.length >= MAX_ORIGINS}
                >
                  <PlusIcon className="h-4 w-4" />
                  {messages.form.addOrigin}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void detectLocation()}
                  disabled={locating}
                  title={messages.form.locationButton}
                >
                  {locating ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPinIcon className="h-4 w-4" />
                  )}
                  {locating ? messages.form.locationLocating : messages.form.locationButton}
                </Button>
                {rows.length >= MAX_ORIGINS && (
                  <span className="text-xs text-muted-foreground">
                    {messages.form.maxOriginsReached}
                  </span>
                )}
              </div>
              {originsError && <p className="text-sm text-destructive">{originsError}</p>}
            </div>

            {/* departure window */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-primary" />
                {messages.form.datesLabel}
              </Label>
              {/* Trigger content stays STATIC on purpose: changing it after the first
                  date made radix close the popover mid-range. The selected range is
                  shown next to the trigger instead. */}
              <div className="flex items-center gap-2">
                <Popover
                  open={dateOpen}
                  onOpenChange={(o) => {
                    // never close mid-range (from picked, to pending)
                    if (!o && range?.from && !range.to) return;
                    setDateOpen(o);
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal text-muted-foreground sm:w-96"
                    >
                      <CalendarDaysIcon className="h-4 w-4" />
                      {messages.form.datesPlaceholder}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={range}
                      onSelect={onRangeSelect}
                      disabled={[{ before: today }]}
                      defaultMonth={range?.from ?? today}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>
                {range?.from && (
                  <span className="whitespace-nowrap text-sm text-foreground">
                    {range.to
                      ? `${format(range.from, "MMM d")} → ${format(range.to, "MMM d, yyyy")}`
                      : `${format(range.from, "MMM d, yyyy")} → …`}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{messages.form.datesHint}</p>
              {(errors.windowStart ?? errors.windowEnd) && (
                <p className="text-sm text-destructive">{messages.form.errors.datesRequired}</p>
              )}
            </div>

            {/* nights */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2">
                <BedDoubleIcon className="h-4 w-4 text-primary" />
                {messages.form.nightsLabel}
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setNights((nights ?? MIN_NIGHTS) - 1)}
                  disabled={nights <= MIN_NIGHTS}
                  aria-label={messages.form.fewerNights}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="w-20 text-center text-sm font-medium">
                  {messages.results.nights(nights ?? MIN_NIGHTS)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setNights((nights ?? MIN_NIGHTS) + 1)}
                  disabled={nights >= MAX_NIGHTS}
                  aria-label={messages.form.moreNights}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">{messages.form.nightsHint}</span>
              </div>
              {errors.nights && (
                <p className="text-sm text-destructive">{messages.form.errors.nightsRequired}</p>
              )}
            </div>

            {/* budget per person */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="flex items-center gap-2">
                  <WalletIcon className="h-4 w-4 text-primary" />
                  {messages.form.budgetLabel}
                </Label>
                <span className="text-sm font-semibold text-primary">
                  €{Number(budget ?? 0).toFixed(0)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Slider
                  min={BUDGET_SLIDER_MIN}
                  max={BUDGET_SLIDER_MAX}
                  step={5}
                  value={[budgetClamped]}
                  onValueChange={([v]) =>
                    setValue("budgetPerPersonEur", v, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className="flex-1"
                  aria-label={messages.form.budgetLabel}
                />
                <div className="relative w-24 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    €
                  </span>
                  <Input
                    type="number"
                    min={20}
                    max={5000}
                    step={10}
                    className="w-24 pl-6"
                    value={Number.isFinite(budget) ? budget : ""}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (!Number.isNaN(n)) {
                        setValue("budgetPerPersonEur", n, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    aria-label={messages.form.budgetLabel}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{messages.form.budgetHint}</p>
              {errors.budgetPerPersonEur && (
                <p className="text-sm text-destructive">{messages.form.errors.budgetRequired}</p>
              )}
            </div>

            {/* max flight time */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-primary" />
                {messages.form.maxFlightLabel}
              </Label>
              <Select
                value={maxFlightMinutes == null ? "any" : String(maxFlightMinutes)}
                onValueChange={(v) =>
                  setValue(
                    "maxFlightMinutes",
                    v === "any" ? null : Number(v),
                    { shouldDirty: true, shouldValidate: true }
                  )
                }
              >
                <SelectTrigger className="sm:w-96" aria-label={messages.form.maxFlightLabel}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{messages.form.maxFlightAny}</SelectItem>
                  <SelectItem value="120">{messages.form.maxFlightHours(2)}</SelectItem>
                  <SelectItem value="180">{messages.form.maxFlightHours(3)}</SelectItem>
                  <SelectItem value="240">{messages.form.maxFlightHours(4)}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <PlaneIcon className="h-4 w-4" />
              )}
              {submitting ? messages.form.submitting : messages.form.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
      <RecentSearches />
    </>
  );
}
