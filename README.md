# midspot

**Meet in the middle.** Tell midspot where each traveler starts (2–8 origin cities), a
travel window (up to 14 days), the trip length in nights and a per-person budget in EUR —
and it finds the destinations that are cheapest and most *synchronized* for everyone:
flights are ranked so that the **arrival gap** (latest minus earliest arrival, in UTC) stays
within 24 h (auto-relaxed to 30 h when nothing fits), within budget. Results are shareable
via `/r/[slug]` and monetized through affiliate deep links (same price for the user) plus
non-intrusive, env-gated ads.

Live at **https://midspot.ncmihai.dev** (self-hosted on the BC250 box behind a Cloudflare
tunnel, port 3005 loopback).

## Stack

Next.js 16 (App Router, standalone output) + React 19 + TypeScript + Tailwind CSS 4 +
shadcn-style components + Drizzle ORM + PostgreSQL (self-hosted, `127.0.0.1:5433`).
Flight data goes through a provider adapter (`FLIGHTS_PROVIDER`: `tequila` |
`travelpayouts-data` | `duffel` | `serpapi` | `mock`). System fonts only (no
`next/font/google`). Secrets live in Infisical, never in the repo.

## Development

```bash
cp .env.example .env.local   # fill in local values; .env* is gitignored
npm run dev                  # http://localhost:3000
```

Common commands:

```bash
npm run build                # production build (STANDALONE_OUTPUT=1 for the box deploy)
npm run lint                 # eslint
npm run typecheck            # tsc --noEmit
npm run db:generate          # drizzle-kit generate (after schema changes)
npm run db:migrate           # drizzle-kit migrate (owner-only against prod)
npm run db:seed-airports     # seed the airports table from OurAirports
```

## Structure

- `app/` — routes and UI (`/`, `/r/[slug]`, `app/api/*`: search, airports, health)
- `lib/` — domain types (`lib/types.ts`), validation (`lib/validation.ts`), flights providers
- `docs/` — canonical specs: `PLAN.md`, `app-spec.md`, `flight-data-spec.md`,
  `deploy-midspot.md` (+ cross-review reports)
- `ops/` — box runbook and systemd/compose files (see `ops/README.md`)
- `.github/workflows/deploy-box.yml` — CI/deploy to the BC250 box on push to `main`

## Configuration

All env var names are canonical and documented in `docs/flight-data-spec.md` §8; a template
with no secret values is in `.env.example`. Server-only keys are never `NEXT_PUBLIC_*`.

## Deploy (BC250 box)

Push to `main` triggers `.github/workflows/deploy-box.yml`: build standalone with the prod
env pulled from Infisical → rsync through the Cloudflare Access SSH tunnel → restart
`midspot-web.service` → live check. The owner-side day-1 steps (DNS, tunnel ingress, units,
Postgres, backups) are in **`docs/deploy-midspot.md`** and **`ops/README.md`**.
