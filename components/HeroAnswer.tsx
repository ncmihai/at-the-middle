"use client";

// components/HeroAnswer.tsx — rank-1 hero banner at the top of /r/[slug]
// (PLAN.md Faza 6 "surprinde-mă"): "Best middle for you: {city}, {country}"
// + arrival-gap badge ("everyone arrives within X h Y min") + "from €X / person"
// + dep→ret dates + the two primary actions (scroll to the rank-1 card /
// open the first outbound booking link). Rendered only when bestResult exists.
import * as React from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  ExternalLinkIcon,
  MapPinIcon,
  SparklesIcon,
} from "lucide-react";

import type { ResultEntry } from "@/lib/types";
import { useMessages } from "@/lib/i18n";
import { formatDateDay, formatGap, formatMoney } from "@/lib/utils";
import { entryKey, maxPricePerPerson } from "@/components/ResultCard";
import { cardDomId } from "@/components/ResultsList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** gap badge is green when everyone arrives within 6 h (same rule as ResultCard) */
const GREEN_GAP_MINUTES = 6 * 60;

export type HeroAnswerProps = {
  /** the best (rank 1) result of the whole search */
  bestResult: ResultEntry;
  /** lift selection to the page so the card + map pin highlight in sync */
  onSelect: (key: string | null) => void;
};

export default function HeroAnswer({ bestResult, onSelect }: HeroAnswerProps) {
  const messages = useMessages();
  const key = entryKey(bestResult);
  const green = bestResult.gapMinutes <= GREEN_GAP_MINUTES;
  const firstOutbound = bestResult.outbound[0];

  const showOnCard = () => {
    onSelect(key);
    document
      .getElementById(cardDomId(key))
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <Card className="border-primary/40 bg-gradient-to-br from-sky-50 to-background dark:from-sky-950/40">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start gap-2.5">
          <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 className="text-lg font-bold tracking-tight">
              {messages.hero.title(bestResult.destinationCity, bestResult.destinationCountry)}
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4" />
                {bestResult.destinationIata}
              </span>
              <Badge variant={green ? "success" : "warning"}>
                <ClockIcon className="h-3 w-3" />
                {messages.hero.gap(formatGap(bestResult.gapMinutes))}
              </Badge>
              <Badge variant="secondary">
                {messages.hero.from(formatMoney(maxPricePerPerson(bestResult)))}
              </Badge>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDaysIcon className="h-4 w-4" />
                {messages.hero.dates(
                  formatDateDay(bestResult.departureDate),
                  formatDateDay(bestResult.returnDate)
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={showOnCard}>
            {messages.hero.cta}
          </Button>
          {firstOutbound && (
            <Button asChild size="sm" variant="outline">
              <a href={firstOutbound.bookingUrl} target="_blank" rel="noopener sponsored">
                <ExternalLinkIcon className="h-3.5 w-3.5" />
                {messages.results.bookOutbound}
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
