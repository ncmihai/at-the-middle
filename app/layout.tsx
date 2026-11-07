import type { Metadata } from "next";
import Script from "next/script";

import DriveScript from "@/components/DriveScript";

import "./globals.css";

// System font stack only — never next/font/google (build-time fetch made CI flaky,
// deploy-midspot.md lesson 4).
const systemFontStack =
  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3005";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "midspot — meet in the middle",
    template: "%s · midspot",
  },
  description:
    "One destination, everyone flies from home, everyone arrives within a day of each other — inside your budget. midspot finds the middle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ads are env-gated and baked at build (NEXT_PUBLIC_*); off in dev and until the
  // ad account is approved. EthicalAds primary, CarbonAds fallback (app-spec §9).
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
  const ethicalAdsId = process.env.NEXT_PUBLIC_ETHICALADS_ID;
  const carbonAdsServeId = process.env.NEXT_PUBLIC_CARBONADS_SERVE_ID;

  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: systemFontStack }}>
        {/* beforeInteractive scripts are hoisted into <head> by Next — required for
            the Travelpayouts Drive server-side verification */}
        <DriveScript />
        {children}
        {adsEnabled && ethicalAdsId ? (
          <Script
            src={`https://cdn.ethicalads.io/script.js?pid=${encodeURIComponent(ethicalAdsId)}`}
            strategy="afterInteractive"
          />
        ) : null}
        {adsEnabled && !ethicalAdsId && carbonAdsServeId ? (
          <Script
            src={`https://cdn.carbonads.com/carbon.js?serve=${encodeURIComponent(carbonAdsServeId)}&placement=midspotncmihaidev`}
            strategy="afterInteractive"
            id="carbonads-fallback"
          />
        ) : null}
      </body>
    </html>
  );
}
