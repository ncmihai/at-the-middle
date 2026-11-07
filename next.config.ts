import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Standalone artefact for the BC250 box (set STANDALONE_OUTPUT=1 at build time there).
  output: process.env.STANDALONE_OUTPUT === "1" ? "standalone" : undefined,
  // The parent "SITE CWN" dir has its own package-lock.json, so Next would otherwise
  // treat it as the workspace root and emit broken relative symlinks in standalone.
  outputFileTracingRoot: path.resolve(process.cwd()),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://cdn.ethicalads.io https://cdn.carbonads.com https://*.ethicalads.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "connect-src 'self'",
              "font-src 'self' data:",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
