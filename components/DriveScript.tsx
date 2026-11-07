import Script from "next/script";

// Travelpayouts Drive loader — REQUIRED by the Travelpayouts dashboard onboarding
// verification (support.travelpayouts.com "How to install Drive on your website"):
// they fetch the site HTML and look for this code in <head>. next/script with
// strategy="beforeInteractive" injects it into the initial server-rendered HTML head.
// Keep the exact loader body from the dashboard snippet (the emrldco.com URL is what
// they detect). Env-gated: NEXT_PUBLIC_DRIVE_ENABLED=true only in prod (baked at build).
//
// Non-intrusive setup: in the Travelpayouts dashboard (Drive settings) disable
// interstitials/popups and keep only automatic link affiliation.
export default function DriveScript() {
  if (process.env.NEXT_PUBLIC_DRIVE_ENABLED !== "true") return null;
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- App Router: beforeInteractive is the supported way to inject into <head>; verified in served HTML
    <Script
      id="travelpayouts-drive"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function () {
  var script = document.createElement("script");
  script.async = 1;
  script.setAttribute("data-cmp-ab","2");
  script.src = 'https://emrldco.com/NTk3Mjgy.js?t=597282';
  document.head.appendChild(script);
})();`,
      }}
    />
  );
}
