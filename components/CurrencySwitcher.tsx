"use client";

import { CoinsIcon } from "lucide-react";

import { CURRENCIES, useCurrency, type CurrencyCode } from "@/lib/currency";
import { useMessages } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Currency switcher — sets the "midspot-cur" cookie (default EUR) and re-renders
 * the page in place (no routing change); every useCurrency() hook follows the
 * "midspot:cur" window event. SSR + first client render are always EUR, so no
 * hydration mismatch — same pattern as <LangSwitcher/>.
 */
export default function CurrencySwitcher({ className }: { className?: string }) {
  const { code, setCode } = useCurrency();
  const messages = useMessages();

  return (
    <Select value={code} onValueChange={(v) => setCode(v as CurrencyCode)}>
      <SelectTrigger
        className={`h-8 w-auto gap-1.5 px-2 text-xs ${className ?? ""}`}
        aria-label={messages.currency.label}
        title={messages.currency.label}
      >
        <CoinsIcon className="h-3.5 w-3.5" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.code} · {c.symbol} — {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
