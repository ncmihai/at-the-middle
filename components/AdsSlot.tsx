"use client";

import * as React from "react";

import { CONSENT_CHANGE_EVENT, readConsent, useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type AdsSlotProps = {
  /** "home" = below the search form on /, "results" = after the results list on /r/[slug]. */
  position: "home" | "results";
  className?: string;
};

/**
 * Non-intrusive ad slot — EthicalAds primary, CarbonAds fallback.
 * Renders only when BOTH hold: ads baked at build (NEXT_PUBLIC_ADS_ENABLED=true,
 * an id present) AND the visitor chose "Accept all" (localStorage "midspot-consent").
 * SSR default = nothing; the loader scripts themselves live in <ConsentAds/> in the
 * layout, gated by the same consent value. Never above the fold, never between result
 * cards, never near Book buttons. Reserved min-h to avoid layout shift (app-spec §9).
 */
export default function AdsSlot({ position, className }: AdsSlotProps) {
  const messages = useMessages();
  const [consented, setConsented] = React.useState(false);

  React.useEffect(() => {
    const update = () => setConsented(readConsent() === "all");
    update();
    window.addEventListener(CONSENT_CHANGE_EVENT, update);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, update);
  }, []);

  const enabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
  const ethicalAdsId = process.env.NEXT_PUBLIC_ETHICALADS_ID;
  const carbonAdsId = process.env.NEXT_PUBLIC_CARBONADS_SERVE_ID;

  if (!enabled || !consented) return null;

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
      {network === "ethicalads" && (
        <div data-ea-publisher="midspotncmihaidev" data-ea-type="text" />
      )}
      {network === "carbonads" && <div id="carbonads" />}
    </div>
  );
}
