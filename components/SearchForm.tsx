"use client";

import * as React from "react";
import { createPortal } from "react-dom";
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
  SlidersHorizontalIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { toast } from "sonner";

import { searchRequestSchema } from "@/lib/validation";
import type { AirportSuggestion } from "@/lib/types";
import { currencyInfo, rateFor, useCurrency } from "@/lib/currency";
import { useLanguage, useMessages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Popover removed for the date range — custom dropdown (radix closed it mid-range)

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
// The calendar range is now TRIP DATES (departure -> return): nights = to - from,
// capped at MAX_NIGHTS. The departure window sent to the API is windowStart = departure,
// windowEnd = departure + flexDays (see FLEX_OPTIONS).
const MIN_NIGHTS = 1;
const MAX_NIGHTS = 30;
/** "Flexibilitate plecare" options (±days): windowEnd = departure + flexDays */
const FLEX_OPTIONS = [0, 1, 2, 3, 5, 7] as const;
const DEFAULT_FLEX_DAYS = 3;
type SearchMode = "dates" | "month";
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
  // display currency: the budget INPUT is entered in the selected currency and
  // converted to EUR for the request (internal bounds stay 20–5000 EUR)
  const { code: curCode, rates: curRates, fmt: fmtCur } = useCurrency();
  const curRate = rateFor(curCode, curRates);
  const curSymbol = currencyInfo(curCode).symbol;
  const [rows, setRows] = React.useState<OriginRow[]>([
    { id: 0, value: null },
    { id: 1, value: null },
  ]);
  const nextRowId = React.useRef(2);
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  const [mode, setMode] = React.useState<SearchMode>("dates");
  const [flexDays, setFlexDays] = React.useState<number>(DEFAULT_FLEX_DAYS);
  const [month, setMonth] = React.useState<string>(() => format(new Date(), "yyyy-MM"));
  const [dateOpen, setDateOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Escape closes the date dropdown (unless mid-range: from picked, to not yet picked)
  React.useEffect(() => {
    if (!dateOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && rangeComplete(range)) setDateOpen(false);
      else if (e.key === "Escape" && !range?.from) setDateOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dateOpen, range]);

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

  // The budget text field shows the EUR value converted to the selected currency.
  // `budgetInputSrc` remembers which (EUR, rate) pair the current text was derived
  // from, so typing in the field is not overwritten by its own round-trip, while
  // slider changes and currency switches re-display the converted amount.
  const [budgetInput, setBudgetInput] = React.useState<string>("");
  const budgetInputSrc = React.useRef<{ eur: number; rate: number } | null>(null);
  React.useEffect(() => {
    const src = budgetInputSrc.current;
    if (src && src.eur === budget && src.rate === curRate) {
      budgetInputSrc.current = null;
      return;
    }
    budgetInputSrc.current = null;
    setBudgetInput(
      Number.isFinite(budget) ? String(Math.round(Number(budget) * curRate * 100) / 100) : ""
    );
  }, [budget, curRate]);

  // compact header readout (0 decimals, like the previous "€250")
  const budgetHeader = React.useMemo(() => {
    const amount = (Number(budget) || 0) * curRate;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: curCode,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${curSymbol}${amount.toFixed(0)}`;
    }
  }, [budget, curCode, curRate, curSymbol]);

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

  // rdp v10 returns {from: date, to: date} on the FIRST range click (single-day range),
  // so "complete" means to is strictly after from — otherwise we'd close after one click
  const rangeComplete = (r: DateRange | undefined) =>
    !!r?.from && !!r.to && differenceInCalendarDays(r.to, r.from) > 0;

  // Normal mode: the calendar range is TRIP DATES (departure -> return).
  // windowStart = departure, windowEnd = departure + flexDays, nights = to - from.
  // The schema requires windowEnd > windowStart, so a 0-flex window is emitted with a
  // minimum 1-day span (flex is clamped to >= 1 when computing windowEnd).
  const applyDatesMode = (r: DateRange | undefined, flex: number) => {
    if (!r?.from) {
      setValue("windowStart", "", { shouldDirty: true });
      setValue("windowEnd", "", { shouldDirty: true });
      return;
    }
    setValue("windowStart", format(r.from, "yyyy-MM-dd"), { shouldDirty: true });
    setValue("windowEnd", format(addDays(r.from, Math.max(flex, 1)), "yyyy-MM-dd"), {
      shouldDirty: true,
    });
    if (r.to && differenceInCalendarDays(r.to, r.from) > 0) {
      setValue("nights", differenceInCalendarDays(r.to, r.from), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  // Month mode ("Doar luna"): windowStart = first day of the month, windowEnd = last day
  // of the month. windowStart is clamped to today because the API requires
  // windowStart >= today (UTC); windowEnd is kept > windowStart for the same reason.
  const applyMonthMode = (m: string) => {
    if (!m) {
      setValue("windowStart", "", { shouldDirty: true });
      setValue("windowEnd", "", { shouldDirty: true });
      return;
    }
    const [y, mo] = m.split("-").map(Number);
    const first = new Date(y, mo - 1, 1);
    const last = new Date(y, mo, 0);
    let ws = format(first, "yyyy-MM-dd");
    const todayStr = format(today, "yyyy-MM-dd");
    if (ws < todayStr) ws = todayStr;
    let we = format(last, "yyyy-MM-dd");
    if (we <= ws) we = format(addDays(new Date(`${ws}T00:00:00`), 1), "yyyy-MM-dd");
    setValue("windowStart", ws, { shouldDirty: true });
    setValue("windowEnd", we, { shouldDirty: true });
  };

  const switchMode = (next: SearchMode) => {
    setMode(next);
    if (next === "dates") applyDatesMode(range, flexDays);
    else applyMonthMode(month);
  };

  const onFlexChange = (v: string) => {
    const f = Number(v);
    setFlexDays(f);
    if (mode === "dates") applyDatesMode(range, f);
  };

  const onMonthChange = (v: string) => {
    setMonth(v);
    if (mode === "month") applyMonthMode(v);
  };

  const onRangeSelect = (next: DateRange | undefined) => {
    if (!next?.from) {
      setRange(undefined);
      setValue("windowStart", "", { shouldDirty: true });
      setValue("windowEnd", "", { shouldDirty: true });
      return;
    }
    const { from } = next;
    let { to } = next;
    // trip dates: departure -> return; nights = to - from, capped at MAX_NIGHTS
    if (from && to && differenceInCalendarDays(to, from) > MAX_NIGHTS) {
      to = addDays(from, MAX_NIGHTS);
    }
    setRange({ from, to });
    if (mode === "dates") applyDatesMode({ from, to }, flexDays);
    if (to && differenceInCalendarDays(to, from) > 0) {
      setDateOpen(false);
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

            {/* trip dates (departure -> return) / whole month */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-primary" />
                <div className="flex gap-1 rounded-lg border border-border p-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={mode === "dates" ? "default" : "ghost"}
                    onClick={() => switchMode("dates")}
                    aria-pressed={mode === "dates"}
                  >
                    {messages.form.datesLabel}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={mode === "month" ? "default" : "ghost"}
                    onClick={() => switchMode("month")}
                    aria-pressed={mode === "month"}
                  >
                    {messages.form.monthMode}
                  </Button>
                </div>
              </div>
              {mode === "dates" ? (
                <>
                  {/* Custom dropdown (NOT radix Popover): radix closed the calendar after
                      the first range click. Here it closes only on backdrop click when the
                      range is complete, on Escape, or after `to` is picked (onRangeSelect). */}
                  <div className="relative flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal text-muted-foreground sm:w-96"
                      onClick={() => setDateOpen((o) => !o)}
                      aria-expanded={dateOpen}
                    >
                      <CalendarDaysIcon className="h-4 w-4" />
                      {messages.form.datesPlaceholder}
                    </Button>
                    {range?.from && (
                      <span className="whitespace-nowrap text-sm text-foreground">
                        {rangeComplete(range)
                          ? `${format(range.from, "MMM d")} → ${format(range.to!, "MMM d, yyyy")} · ${messages.results.nights(differenceInCalendarDays(range.to!, range.from))}`
                          : `${format(range.from, "MMM d, yyyy")} → …`}
                      </span>
                    )}
                    {/* portaled to body so the panel always sits above the consent banner
                        (z-[60] at body level beats the banner's z-50) */}
                    {dateOpen &&
                      createPortal(
                        <>
                          <div
                            className="fixed inset-0 z-[55] cursor-default"
                            onClick={() => {
                              if (!range?.from || rangeComplete(range)) setDateOpen(false);
                            }}
                            aria-hidden
                          />
                          <div className="fixed z-[60] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-3 shadow-lg max-sm:inset-x-2 max-sm:top-auto max-sm:bottom-2 max-sm:translate-x-0 max-sm:translate-y-0">
                            <Calendar
                              mode="range"
                              selected={range}
                              onSelect={onRangeSelect}
                              disabled={[{ before: today }]}
                              defaultMonth={range?.from ?? today}
                              numberOfMonths={1}
                            />
                          </div>
                        </>,
                        document.body
                      )}
                  </div>
                  <p className="text-xs text-muted-foreground">{messages.form.datesHint}</p>
                </>
              ) : (
                <>
                  <Input
                    type="month"
                    value={month}
                    min={format(today, "yyyy-MM")}
                    onChange={(e) => onMonthChange(e.target.value)}
                    className="sm:w-96"
                    aria-label={messages.form.monthLabel}
                  />
                  <p className="text-xs text-muted-foreground">{messages.form.monthHint}</p>
                </>
              )}
              {/* departure flexibility — normal (trip dates) mode only; in month mode the
                  window is the whole month, so there is nothing to flex */}
              {mode === "dates" && (
                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-2">
                    <SlidersHorizontalIcon className="h-4 w-4 text-primary" />
                    {messages.form.flexLabel}
                  </Label>
                  <Select value={String(flexDays)} onValueChange={onFlexChange}>
                    <SelectTrigger className="sm:w-96" aria-label={messages.form.flexLabel}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FLEX_OPTIONS.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {messages.form.flexDays(d)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {(errors.windowStart ?? errors.windowEnd) && (
                <p className="text-sm text-destructive">{messages.form.errors.datesRequired}</p>
              )}
            </div>

            {/* nights — stepper only in month mode; in trip-dates mode nights = return - departure */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2">
                <BedDoubleIcon className="h-4 w-4 text-primary" />
                {mode === "month" ? messages.form.nightsLabelMonth : messages.form.nightsLabel}
              </Label>
              {mode === "month" ? (
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
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {messages.results.nights(nights ?? MIN_NIGHTS)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {messages.form.nightsAutoHint}
                  </span>
                </div>
              )}
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
                  {budgetHeader}
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
                    {curSymbol}
                  </span>
                  <Input
                    type="number"
                    min={Math.round(20 * curRate)}
                    max={Math.round(5000 * curRate)}
                    step={curRate >= 100 ? 50 : 10}
                    className="w-24 pl-6"
                    placeholder={curCode}
                    value={budgetInput}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setBudgetInput(raw);
                      const n = Number(raw);
                      if (raw !== "" && !Number.isNaN(n)) {
                        // entered in the selected currency → store EUR
                        const eur = n / curRate;
                        budgetInputSrc.current = { eur, rate: curRate };
                        setValue("budgetPerPersonEur", eur, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    aria-label={messages.form.budgetLabel}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{messages.form.budgetHint(curCode)}</p>
              {errors.budgetPerPersonEur && (
                <p className="text-sm text-destructive">
                  {messages.form.errors.budgetRequired(fmtCur(20), fmtCur(5000))}
                </p>
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
