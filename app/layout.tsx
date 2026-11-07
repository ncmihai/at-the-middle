import type { Metadata } from "next";

import { en } from "@/lib/i18n";
import ConsentAds from "@/components/ConsentAds";
import ConsentBanner from "@/components/ConsentBanner";
import DriveScript from "@/components/DriveScript";
import Footer from "@/components/Footer";

import "./globals.css";

// System font stack only — never next/font/google (build-time fetch made CI flaky,
// deploy-midspot.md lesson 4).
const systemFontStack =
  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3005";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${en.brand.name} — ${en.brand.heroTitle}`,
    template: "%s · midspot",
  },
  description: en.brand.heroSubtitle,
  openGraph: {
    title: `${en.brand.name} — ${en.brand.heroTitle}`,
    description: en.brand.heroSubtitle,
    url: siteUrl,
    siteName: en.brand.name,
    type: "website",
    locale: "en",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the language hook sets document.documentElement.lang
    // from the midspot-lang cookie right after hydration (SSR renders lang="en").
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased" style={{ fontFamily: systemFontStack }}>
        {/* beforeInteractive scripts are hoisted into <head> by Next — required for
            the Travelpayouts Drive server-side verification. Drive stays
            server-rendered ALWAYS (their onboarding check requires it in <head>;
            its data-cmp-ab attribute lets their CMP handle their own consent) —
            documented on /privacy. */}
        <DriveScript />
        <div className="flex-1">{children}</div>
        <Footer />
        {/* GDPR consent: EthicalAds/CarbonAds scripts render ONLY after "Accept all"
            (read client-side from localStorage "midspot-consent"; SSR default = no ads).
            NEXT_PUBLIC_ADS_ENABLED still gates ads at build. */}
        <ConsentBanner />
        <ConsentAds />
      </body>
    </html>
  );
}
