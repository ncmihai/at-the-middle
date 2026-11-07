"use client";

import * as React from "react";
import Script from "next/script";

import { messages } from "@/lib/messages";
import { cn } from "@/lib/utils";

type AdsSlotProps = {
  /** "home" = below the search form on /, "results" = after the results list on /r/[slug]. */
  position: "home" | "results";
  className?: string;
};

/**
 * Non-intrusive ad slot — EthicalAds primary, CarbonAds fallback.
 * Active only when baked at build with NEXT_PUBLIC_ADS_ENABLED=true and an id present.
 * Never above the fold, never between result cards, never near Book buttons.
 * Reserved min-h to avoid layout shift (docs/app-spec.md §9).
 */
export default function AdsSlot({ position, className }: AdsSlotProps) {
  const enabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
  const ethicalAdsId = process.env.NEXT_PUBLIC_ETHICALADS_ID;
  const carbonAdsId = process.env.NEXT_PUBLIC_CARBONADS_SERVE_ID;

  if (!enabled) return null;

  const network: "ethicalads" | "carbonads" | null = ethicalAdsId
    ? "ethicalads"
    : carbonAdsId
      ? "carbonads"
      : null;
  if (!network) return null;

  return (
    <div
      className={cn("min-h-28 w-full", className)}
      data-ads-position={position}
      aria-label={messages.ads.label}
    >
      {network === "ethicalads" && ethicalAdsId && (
        <>
          <div data-ea-publisher="midspotncmihaidev" data-ea-type="text" />
          <Script
            src="https://media.ethicalads.io/media/client/ethicalads.min.js"
            strategy="afterInteractive"
          />
        </>
      )}
      {network === "carbonads" && carbonAdsId && (
        <Script
          id="carbonads"
          src={`https://cdn.carbonads.com/carbon.js?serve=${encodeURIComponent(carbonAdsId)}&placement=midspot-ncmihai-dev`}
          strategy="afterInteractive"
        />
      )}
    </div>
  );
}
