"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon, MapPinIcon, XIcon } from "lucide-react";

import type { AirportSuggestion } from "@/lib/types";
import { messages } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type OriginAutocompleteProps = {
  value: AirportSuggestion | null;
  onChange: (value: AirportSuggestion | null) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
};

const DEBOUNCE_MS = 250;

export default function OriginAutocomplete({
  value,
  onChange,
  placeholder,
  disabled,
  id,
}: OriginAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<AirportSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqRef = React.useRef(0);

  React.useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      void (async () => {
        const reqId = ++reqRef.current;
        try {
          const res = await fetch(`/api/airports?q=${encodeURIComponent(q)}`, {
            cache: "no-store",
          });
          if (!res.ok) {
            if (reqId === reqRef.current) setResults([]);
            return;
          }
          const data = (await res.json()) as { results?: AirportSuggestion[] };
          if (reqId === reqRef.current) setResults(data.results ?? []);
        } catch {
          if (reqId === reqRef.current) setResults([]);
        } finally {
          if (reqId === reqRef.current) setLoading(false);
        }
      })();
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  const select = (s: AirportSuggestion) => {
    onChange(s);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <MapPinIcon className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">
              {value
                ? `${value.iata} — ${value.city}, ${value.country}`
                : (placeholder ?? messages.form.originSelectedPlaceholder)}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {value && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                aria-label={messages.form.removeOrigin}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onChange(null);
                  }
                }}
              >
                <XIcon className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={messages.form.originPlaceholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && <CommandLoading>Searching airports…</CommandLoading>}
            {!loading && query.trim().length < 2 && (
              <CommandEmpty>Type at least 2 characters…</CommandEmpty>
            )}
            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <CommandEmpty>No airports found.</CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup>
                {results.map((s) => (
                  <CommandItem
                    key={s.iata}
                    value={s.iata}
                    onSelect={() => select(s)}
                  >
                    <CheckIcon
                      className={cn(
                        "h-4 w-4",
                        value?.iata === s.iata ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">
                      {s.iata} — {s.city}, {s.country}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
