"use client";

import * as React from "react";
import Script from "next/script";

import { CONSENT_CHANGE_EVENT, readConsent } from "@/lib/i18n";

/**
 * Ad-network loader scripts (EthicalAds primary, CarbonAds fallback), rendered ONLY
 * when the visitor chose "Accept all" (localStorage "midspot-consent" === "all") AND
 * ads are baked at build with NEXT_PUBLIC_ADS_ENABLED=true. SSR default = no ads:
 * consent is read client-side after mount (PLAN.md Faza 3 — cookie consent gates
 * Drive/ads; the Travelpayouts Drive script itself stays server-rendered in layout).
 */
export default function ConsentAds() {
  const [consent, setConsent] = React.useState<"all" | "essential" | null>(null);

  React.useEffect(() => {
    setConsent(readConsent());
    const onChange = () => setConsent(readConsent());
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
  const ethicalAdsId = process.env.NEXT_PUBLIC_ETHICALADS_ID;
  const carbonAdsServeId = process.env.NEXT_PUBLIC_CARBONADS_SERVE_ID;

  if (!adsEnabled || consent !== "all") return null;

  return (
    <>
      {ethicalAdsId ? (
        <Script
          src={`https://cdn.ethicalads.io/script.js?pid=${encodeURIComponent(ethicalAdsId)}`}
          strategy="afterInteractive"
        />
      ) : null}
      {!ethicalAdsId && carbonAdsServeId ? (
        <Script
          src={`https://cdn.carbonads.com/carbon.js?serve=${encodeURIComponent(carbonAdsServeId)}&placement=midspotncmihaidev`}
          strategy="afterInteractive"
          id="carbonads-fallback"
        />
      ) : null}
    </>
  );
}
