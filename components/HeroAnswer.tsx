"use client";

// components/HeroAnswer.tsx — rank-1 hero banner at the top of /r/[slug]
// (PLAN.md Faza 6 "surprinde-mă"): "Best middle for you: {city}, {country}"
// + arrival-gap badge ("everyone arrives within X h Y min") + "from €X / person"
// + dep→ret dates + the two primary actions (scroll to the rank-1 card /
// open the first outbound booking link). Rendered only when bestResult exists.
//
// Faza 9 visual rework: the city photo is the card background with a bottom-up
// dark scrim (.photo-scrim) and ALL text white (drop-shadowed); badges get
// solid backgrounds. No photo → the previous light gradient card.
import * as React from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  ExternalLinkIcon,
  MapPinIcon,
  SparklesIcon,
} from "lucide-react";

import type { ResultEntry } from "@/lib/types";
import { cityPhotoForCity, cityPhotoForIata } from "@/lib/city-photo";
import { useMessages } from "@/lib/i18n";
import { cn, formatDateDay, formatGap, formatMoney } from "@/lib/utils";
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
  // Faza 9: city photo (Wikimedia Commons → Digi Storage mirror) as hero
  // background — via IATA (slug map) with the city-name map as fallback
  const photo =
    cityPhotoForIata(bestResult.destinationIata) ??
    cityPhotoForCity(bestResult.destinationCity);
  const onPhoto = Boolean(photo);

  const showOnCard = () => {
    onSelect(key);
    document
      .getElementById(cardDomId(key))
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl",
        onPhoto
          ? "border-white/25 text-white"
          : "border-primary/40 bg-gradient-to-br from-sky-50 to-background dark:from-sky-950/40"
      )}
    >
      {photo && (
        <>
          <img
            src={photo.url}
            alt=""
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* bottom-up dark scrim — keeps the white text legible on any photo */}
          <div className="photo-scrim absolute inset-0" />
        </>
      )}
      <CardContent
        className={cn("relative flex flex-col gap-3 p-5", onPhoto && "pb-7 drop-shadow-sm")}
      >
        <div className="flex items-start gap-2.5">
          <SparklesIcon
            className={cn("mt-0.5 h-5 w-5 shrink-0", onPhoto ? "text-sky-300" : "text-primary")}
          />
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2
              className={cn(
                "text-lg font-bold tracking-tight",
                onPhoto ? "text-white drop-shadow-md" : ""
              )}
            >
              {messages.hero.title(bestResult.destinationCity, bestResult.destinationCountry)}
            </h2>
            <div
              className={cn(
                "flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm",
                onPhoto ? "text-white/85" : "text-muted-foreground"
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4" />
                {bestResult.destinationIata}
              </span>
              <Badge
                variant={green ? "success" : "warning"}
                className={cn(
                  "border-transparent",
                  onPhoto
                    ? green
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-amber-950"
                    : ""
                )}
              >
                <ClockIcon className="h-3 w-3" />
                {messages.hero.gap(formatGap(bestResult.gapMinutes))}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(onPhoto && "bg-white text-slate-900 border-transparent")}
              >
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
            <Button
              asChild
              size="sm"
              variant="outline"
              className={cn(
                onPhoto &&
                  "border-white/50 bg-white/10 text-white shadow-sm hover:bg-white/25 hover:text-white"
              )}
            >
              <a href={firstOutbound.bookingUrl} target="_blank" rel="noopener sponsored">
                <ExternalLinkIcon className="h-3.5 w-3.5" />
                {messages.results.bookOutbound}
              </a>
            </Button>
          )}
        </div>
      </CardContent>
      {photo && (
        <a
          href={photo.source}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-1.5 right-3 z-10 max-w-[80%] truncate text-[10px] leading-snug text-white/80 hover:text-white hover:underline"
        >
          {messages.results.photoCredit(photo.credit, photo.license)}
        </a>
      )}
    </Card>
  );
}
