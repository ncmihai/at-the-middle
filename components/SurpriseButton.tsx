"use client";

// components/SurpriseButton.tsx — dice button on /r/[slug] (PLAN.md Faza 6
// "surprinde-mă"): picks a RANDOM result from the top 10 by rank, calls
// onSelectIata(iata) so the map pin highlights + tooltip shows, scrolls the
// corresponding card into view (smooth) and fires a sonner toast
// "🎲 {city} — {gap} apart, €{total}".
import * as React from "react";
import { DicesIcon } from "lucide-react";
import { toast } from "sonner";

import type { ResultEntry } from "@/lib/types";
import { useMessages } from "@/lib/i18n";
import { formatGap, formatMoney } from "@/lib/utils";
import { entryKey } from "@/components/ResultCard";
import { cardDomId } from "@/components/ResultsList";
import { Button } from "@/components/ui/button";

/** the surprise pool = the top 10 results by rank */
const TOP_N = 10;

export type SurpriseButtonProps = {
  /** all results of this search — the top 10 by rank form the surprise pool */
  results: ResultEntry[];
  /** highlight the picked destination's map pin + tooltip (page maps iata → selectedKey) */
  onSelectIata: (iata: string | null) => void;
  className?: string;
};

export default function SurpriseButton({
  results,
  onSelectIata,
  className,
}: SurpriseButtonProps) {
  const messages = useMessages();

  const surprise = () => {
    const top = [...results].sort((a, b) => a.rank - b.rank).slice(0, TOP_N);
    if (top.length === 0) return;
    const pick = top[Math.floor(Math.random() * top.length)];
    // highlight the map pin + tooltip (and the card, via the page's selectedKey)
    onSelectIata(pick.destinationIata);
    // scroll the corresponding card into view
    document
      .getElementById(cardDomId(entryKey(pick)))
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    toast.success(
      messages.surprise.toast(
        pick.destinationCity,
        formatGap(pick.gapMinutes),
        formatMoney(pick.totalPriceEur)
      )
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={surprise}
      className={className}
    >
      <DicesIcon className="h-4 w-4" />
      {messages.surprise.button}
    </Button>
  );
}
