# midspot — application spec (rebuild from zero)

**Product.** N travelers (start 2, max 8 origins at MVP, 1 adult each) in different European cities
enter their home location, a travel date window (≤ 14 days), a trip length in nights and a
per-person budget (EUR). midspot finds "in the middle" destinations: for each candidate destination
it searches flights for every traveler and ranks the combinations where (a) the price per person is
within budget and (b) the **arrival gap** (max `utc_arrival` − min `utc_arrival`, epoch UTC —
DST-safe) is ≤ 24 h, automatically relaxed to 30 h if nothing is found. Results are shared via an
unguessable link (`/r/<slug>`), no login at MVP. Monetization: non-intrusive ads (EthicalAds
primary, CarbonAds fallback) + affiliate links (the user buys at the **same** price on
Kiwi/Skyscanner via Travelpayouts markers).

**Infra (canonical: `docs/deploy-midspot.md`, itself derived from `cumsevoteaza/docs/deployment.md`
+ `ncm/.github/workflows/deploy-box.yml`).** BC250 box behind Cloudflare tunnel `87e40a55`;
`systemd --user` unit `midspot-web.service` serving a Next.js standalone build on `127.0.0.1:3003`
(`PORT=3003`, `HOSTNAME=127.0.0.1` from the unit), ingress hostname `midspot.ncmihai.dev` **before
the catch-all** in `/etc/cloudflared/config.yml`; secrets in Infisical project `midspot-prod` /
env `prod`; deploy = push to `main` → GitHub Actions (verify job, then build with
`STANDALONE_OUTPUT=1` + prod env from Infisical) → rsync through `ssh.ncmihai.dev` → restart unit →
live check (loopback `/api/health` first, then the public domain). Postgres is **self-hosted on the
box** (docker `midspot-postgres` on `127.0.0.1:5433` — 5432 is cumsevoteaza's),
`DATABASE_URL=postgres://midspot:…@127.0.0.1:5433/midspot`. Cloudflare free kills proxied requests at
100 s ⇒ all long work is async: create a job, the client polls. Vercel is retired. **Known port
conflict:** the sofronesti plan reserves 3003 for `elena-web.service` — per `deploy-midspot.md`, if
sofronesti lands on the box first, it moves to 3004 before midspot's first deploy (owner action,
§10 Q12).

**Flight data (canonical: `docs/flight-data-spec.md`, values reconciled in cross-review §7.3/§8).**
Primary provider **Kiwi Tequila** (`FLIGHTS_PROVIDER=tequila`, `GET /locations/query` +
`GET /v2/search`, header `apikey`, base `https://tequila-api.kiwi.com`); Travelpayouts Data API for
cached price ranking only (no itinerary times); affiliate deep links via the
`c111.travelpayouts.com/click?shmarker=…&promo_id=3791&custom_url=<kiwi /deep link>` template.
Canonical caps/TTLs: ≤ **30** candidate destinations (`FLIGHTS_MAX_CANDIDATE_DESTINATIONS=30`),
≤ **14** window days, **2–8** origins (`FLIGHTS_MAX_ORIGINS=8`), top-K = **10**
(`FLIGHTS_TOP_K_DEEP_SEARCH=10`), flight cache TTL **1800 s** (`FLIGHTS_CACHE_TTL_SECONDS=1800`),
airport rows TTL **30 d** (`AIRPORT_CACHE_TTL_DAYS=30`, lazy) with the OurAirports source refreshed
by a weekly cron (7 d — intentionally different), max **4** concurrent provider calls
(`FLIGHTS_MAX_CONCURRENCY=4`), gap limits 24 h / 30 h
(`FLIGHTS_ARRIVAL_GAP_LIMIT_HOURS` / `FLIGHTS_ARRIVAL_GAP_RELAXED_HOURS`).

**Hard constraint for this repo.** The existing `app/**` is an old RapidAPI fly-scraper prototype
and is **not** reused — no RapidAPI (`RAPIDAPI_KEY` is deleted at rebuild), no scraping. Nothing in
the existing tree is modified; this doc is a new file in `docs/`. When implementation starts, the
app is rebuilt from zero (the prototype files get replaced, not patched).

**Stack.** Next.js 16 App Router (Next 16 uses `proxy.ts`, not `middleware.ts`), React 19,
TypeScript, Tailwind 4 (`@theme` tokens in `globals.css`), shadcn/ui components, Drizzle ORM +
Postgres (`postgres-js` driver), standalone build served by one Node process on the box.
Zod for validation. English UI at MVP (Romanian later — see §6 and §10).

---

## 1. Folder structure

Single Next.js app at the repo root (same shape as the current `at_the_middle`, not a monorepo;
the DB code lives in `db/` inside the app, following amdedat's `packages/db` conventions):

```
at_the_middle/
├── app/
│   ├── layout.tsx                 # root layout: local font files, metadata, ads script, globals.css
│   ├── page.tsx                   # landing + <SearchForm/>
│   ├── globals.css                # Tailwind 4 @theme design tokens (light travel theme, §6)
│   ├── robots.ts                  # disallow /r/ and /api/
│   ├── r/[slug]/page.tsx          # share page (deploy-midspot lesson 9: /r/<id>): waiting while running, results when done
│   └── api/
│       ├── health/route.ts        # GET /api/health
│       ├── airports/route.ts      # GET /api/airports?q=
│       ├── search/route.ts        # POST /api/search
│       └── search/[id]/
│           ├── route.ts           # GET /api/search/[id]  (id = uuid or slug)
│           └── cancel/route.ts    # POST /api/search/[id]/cancel
├── components/
│   ├── ui/                        # shadcn/ui: button, input, label, card, badge, calendar,
│   │                              #   popover, command, select, slider, progress, skeleton,
│   │                              #   separator, dialog, sonner (toasts), form
│   ├── search-form.tsx            # dynamic origin rows + window + nights + budget
│   ├── origin-autocomplete.tsx    # Command+Popover over GET /api/airports?q= (debounced)
│   ├── waiting-screen.tsx         # progress bar, current step, partial results, cancel
│   ├── results-list.tsx           # ranked result cards
│   ├── result-card.tsx            # one option: destination, dates, per-person legs, gap badge, book buttons
│   └── ads-slot.tsx               # env-gated EthicalAds/CarbonAds slot (§9)
├── lib/
│   ├── rate-limit.ts              # in-memory per-IP limiter, pattern from cumsevoteaza apps/web/lib/rate-limit.ts
│   ├── validation.ts              # zod schemas for all API input
│   ├── slug.ts                    # unguessable share slug (§2)
│   ├── utils.ts                   # cn() (clsx + tailwind-merge)
│   ├── db.ts                      # postgres-js + drizzle singleton (pattern from amdedat packages/db/src/client.ts)
│   ├── flights/
│   │   ├── types.ts               # AirportSuggestion, FlightOption (utc/local ts, priceEur, deep link), normalized types
│   │   ├── provider.ts            # FlightProvider interface — mirrors the real Tequila endpoints (§8)
│   │   ├── tequila.ts             # primary adapter: /locations/query + /v2/search + affiliate wrapping
│   │   ├── travelpayouts-data.ts  # cached price ranking helper (Data API) — no itinerary times
│   │   ├── duffel.ts / serpapi.ts # future/fallback adapters — TODO(provider-mapping) where their fields land
│   │   └── index.ts               # FLIGHTS_PROVIDER selection + cached lookup wrapper (flight_cache)
│   └── jobs/
│       ├── worker.ts              # in-process worker: queue, semaphore, 429 backoff, stale recovery, sweeper (§4)
│       ├── run-search.ts          # the two-phase search algorithm (§5)
│       └── progress.ts            # throttled progress writes to search_jobs
├── db/
│   ├── schema.ts                  # Drizzle schema (§2) — canonical table shapes
│   ├── drizzle.config.ts          # like amdedat packages/db/drizzle.config.ts
│   ├── migrations/                # drizzle-kit generate output (0000_*.sql + meta/)
│   ├── refresh-airports.ts        # OurAirports CSV download+upsert — weekly infra cron (7 d), `npm run airports:refresh`
│   └── candidates.ts              # curated shortlist of EU destination cities (derived from OurAirports, §5)
├── instrumentation.ts             # register(): boot-time recovery of stale jobs (§4)
├── proxy.ts                       # Next 16 proxy: rate limiting + security headers (§7)
├── next.config.ts                 # output: STANDALONE_OUTPUT === "1" ? "standalone" : undefined (deploy-midspot §6)
├── package.json                   # scripts: dev/build/lint/test + db:generate, db:migrate, airports:refresh
└── docs/
    ├── app-spec.md                # this file
    ├── flight-data-spec.md        # canonical flight-provider research, caps/TTLs, provider env var names
    ├── deploy-midspot.md          # canonical runbook (box, ports, Infisical, env table)
    └── review-*.md                # cross-review rounds
```

Conventions borrowed from the sibling repos:

- **cumsevoteaza**: `lib/rate-limit.ts` + `proxy.ts` pattern (in-memory, per `CF-Connecting-IP`,
  IPv6 grouped per /64, 429 + `Retry-After`, bounded maps), "no proxy header ⇒ not counted"
  (dev/direct box access), `npm run verify` = typecheck + test + build as pre-commit gate.
- **amdedat**: `db/drizzle.config.ts` shape, `drizzle-kit generate` / `drizzle-kit migrate` via npm
  scripts with `DATABASE_URL` from env, lazy `postgres-js` singleton in `lib/db.ts`, text PKs and
  `timestamptz` with `defaultNow()`.
- **meelmusic**: Tailwind 4 `@theme` custom color tokens in the CSS entry, `clsx`+`tailwind-merge`,
  lucide-react icons, mobile-first layouts.
- **deployment lessons that change the code** (`cumsevoteaza/docs/deployment.md`, mirrored in
  `deploy-midspot.md` §8): **local font files, not `next/font/google`** (build-time fetch made CI
  flaky); `NEXT_PUBLIC_*` is baked at build time; never hand the box an absolute URL of its own
  loopback (all rewrites stay relative); the deploy dir must never hold env files; ingress rules and
  the unit bind `127.0.0.1` explicitly (cloudflared reaches localhost over ::1).

---

## 2. Drizzle schema (`db/schema.ts`) — canonical table shapes

(These five tables are the canonical schema — `flight-data-spec.md` §7.2 references this section.)
All tables use `timestamptz` with timezone, `defaultNow()` for created/updated. Money as
`numeric(10,2)` (never float).

### `airports` — airport reference + autocomplete cache (row TTL 30 d, lazy; source cron 7 d)

| column | type | notes |
|---|---|---|
| `iata` | text PK | |
| `name`, `city`, `country` | text not null | |
| `country_code` | text not null | ISO-3166 alpha-2 |
| `latitude`, `longitude` | numeric(9,6) | for the "middle" centroid ordering and flight-time estimate |
| `is_eu` | boolean not null default false | candidate-destination filter (EEA + UK + CH + …, §10 Q4) |
| `kind` | text | provider/ourairports kind ('airport', `large_airport`, …) |
| `search_text` | text not null | `lower(name ‖ ' ' ‖ city ‖ ' ' ‖ iata)`; GIN trgm index (pg_trgm in migration 0000) — ILIKE fallback for autocomplete |
| `fetched_at` | timestamptz not null default now() | rows older than `AIRPORT_CACHE_TTL_DAYS` (30 d) are refreshed lazily from the provider on miss |

Indexes: PK on `iata`; GIN trgm on `search_text`; index on `(is_eu)`.
Initial population + weekly source refresh: `db/refresh-airports.ts` downloads the OurAirports CSV
(`scheduled_service='yes' AND iata_code<>'' AND iso_country IN (EEA+UK+CH+…) AND type IN
(large_airport, medium_airport)` → ~150–250 rows), upsert; the **source** cron runs every 7 days
(infra), the **row** TTL is 30 d (lazy) — intentionally two different TTLs (flight-data-spec §7.2).
Runtime autocomplete: provider `searchAirports` (Tequila `/locations/query`) results are upserted
into `airports`; fallback `ILIKE '%q%'` on `search_text`.

### `searches` — one row per submitted search; owns the shareable slug

| column | type | notes |
|---|---|---|
| `id` | uuid PK default gen_random_uuid() | returned by POST; also the polling id |
| `slug` | text not null **unique** | unguessable share id — see below |
| `status` | text not null default 'queued' | check: queued / running / completed / failed / cancelled |
| `origins` | jsonb not null | `[{ "iata": "OTP", "label": "Bucharest" }, …]`, 2–8 entries (`FLIGHTS_MAX_ORIGINS=8`, 1 adult each) |
| `window_start`, `window_end` | date not null | departure-date window, `windowEnd − windowStart ≤ 13` (≤ 14 dates, `FLIGHTS_MAX_WINDOW_DAYS`) |
| `nights` | integer not null | 1–30 |
| `budget_eur` | numeric(10,2) not null | per person, EUR (currency fixed) |
| `currency` | text not null default 'EUR' | forced `curr=EUR` at the provider |
| `max_gap_hours` | integer not null default 24 | from `FLIGHTS_ARRIVAL_GAP_LIMIT_HOURS`; relaxed to `FLIGHTS_ARRIVAL_GAP_RELAXED_HOURS` (30) by the worker if empty |
| `max_flight_minutes` | integer | nullable, optional user filter |
| `top_k` | integer not null default 10 | deep-search width, `FLIGHTS_TOP_K_DEEP_SEARCH` |
| `ip_hash` | text | sha256(ip + salt) for abuse forensics only — raw IPs are never stored |
| `created_at`, `updated_at` | timestamptz | |
| `expires_at` | timestamptz | retention, default created_at + `SEARCH_RETENTION_DAYS` (7 d) |

Indexes: unique on `slug`; index on `created_at` (retention cleanup).

**Slug generation** (`lib/slug.ts`): `crypto.randomBytes(9).toString('base64url')` → 12 chars,
72 bits of entropy, unguessable; insert with retry on unique violation. Share URL =
`${NEXT_PUBLIC_SITE_URL}/r/${slug}` (path `/r/<id>` per `deploy-midspot.md` lesson 9).

### `search_jobs` — async job row, one per search (drives polling + recovery)

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `search_id` | uuid not null **unique** references `searches.id` on delete cascade | one job per search |
| `status` | text not null default 'queued' | queued / running / done / failed / cancelled |
| `total_steps` | integer not null default 0 | = 1 (cold ranking phase) + number of deep-searched destinations (hot phase) |
| `done_steps` | integer not null default 0 | |
| `current_step` | text | e.g. `"phase 2/2 · LIS"` |
| `attempts` | integer not null default 0 | |
| `locked_at` | timestamptz | worker lock; stale if older than 10 min |
| `started_at`, `finished_at` | timestamptz | |
| `error` | text | nullable |
| `created_at`, `updated_at` | timestamptz | |

Indexes: on `(status, locked_at)` for the recovery query.

### `flight_cache` — normalized provider responses (TTL `FLIGHTS_CACHE_TTL_SECONDS` = 1800 s)

| column | type | notes |
|---|---|---|
| `cache_key` | text PK | sha256 hex of `provider|origin|dest|date|adults|currency` (lowercased). For range calls (`date_from`/`date_to`), `date` = `date_from` and the payload covers the whole range (date_to in payload meta) — one range call serves all window days |
| `origin`, `dest` | text not null | IATA (phase-1 multi-destination calls use `dest = __multi__<sha1(codes)>`) |
| `date` | date not null | |
| `adults` | integer not null default 1 | |
| `currency` | text not null default 'EUR' | |
| `payload` | jsonb not null | normalized `FlightOption[]` + meta (search_id, date_to) |
| `min_price_eur` | numeric(10,2) | denormalized for cheap pruning |
| `fetched_at` | timestamptz not null default now() | |
| `expires_at` | timestamptz not null | fetched_at + `FLIGHTS_CACHE_TTL_SECONDS` (1800 s) |

Index on `expires_at` (cleanup sweep).

### `results` — ranked options per search, written incrementally (partial results for polling)

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `search_id` | uuid not null references `searches.id` on delete cascade | |
| `rank` | integer not null | 1 = best |
| `destination_iata` | text not null | |
| `departure_date`, `return_date` | date not null | return = departure + nights |
| `gap_minutes` | integer not null | max(`utc_arrival`) − min(`utc_arrival`) across travelers, in UTC |
| `total_price_eur` | numeric(10,2) not null | sum over persons |
| `max_price_per_person_eur` | numeric(10,2) not null | must be ≤ budget |
| `legs` | jsonb not null | per person: `{ origin: {iata,label}, outbound: FlightOption, return: FlightOption, price_eur }` |
| `created_at` | timestamptz | |

Unique `(search_id, rank)`; index on `(search_id, gap_minutes)`.

**Migrations flow** (amdedat pattern): `npm run db:generate` → `drizzle-kit generate --config db/drizzle.config.ts`;
`npm run db:migrate` → `drizzle-kit migrate` against `DATABASE_URL`. Production migrations are run by
the owner, never by an agent against prod (house rule).

---

## 3. API routes

All routes are `export const runtime = 'nodejs'`, `dynamic = 'force-dynamic'`, `Cache-Control:
no-store`. Validation with zod (`lib/validation.ts`); errors as `{ "error": code, ... }`.

### `POST /api/search` — validate, create search + job, return id

Request:

```json
{
  "origins": [
    { "iata": "OTP", "label": "Bucharest" },
    { "iata": "NRN", "label": "Nuremberg" }
  ],
  "windowStart": "2026-09-01",
  "windowEnd": "2026-09-14",
  "nights": 4,
  "budgetEur": 250,
  "maxFlightMinutes": 180
}
```

Zod constraints: `origins` 2–8 entries (`FLIGHTS_MAX_ORIGINS`), unique, IATA format `[A-Z]{3}`;
`windowStart` ≥ today; `windowEnd − windowStart` ≤ 13 days (≤ 14 dates, `FLIGHTS_MAX_WINDOW_DAYS`);
`nights` 1–30; `budgetEur` 20–5000; `maxFlightMinutes` optional 30–960.

Response `202 Accepted`:

```json
{
  "id": "9b1c…-uuid",
  "slug": "Kx9f2…12chars",
  "status": "queued",
  "pollUrl": "/api/search/9b1c…-uuid",
  "sharePath": "/r/Kx9f2…12chars"
}
```

The route inserts `searches` + `search_jobs`, enqueues the job into the in-process worker
(non-blocking — fire-and-forget, §4), and returns. Errors: `400` validation
`{ "error": "validation_failed", "issues": […] }`; `429` `{ "error": "rate_limited", "retryAfterSeconds": n }`
(POST /api/search is strictly limited, §7).

### `GET /api/search/[id]` — status + partial results + progress (polling target)

`[id]` accepts the uuid **or** the slug. Poll every 2–3 s.

```json
{
  "id": "9b1c…",
  "slug": "Kx9f2…",
  "status": "running",
  "progress": { "doneSteps": 4, "totalSteps": 11, "currentStep": "phase 2/2 · LIS" },
  "results": [ ResultEntry ],
  "createdAt": "2026-…",
  "error": null
}
```

`ResultEntry`:

```json
{
  "rank": 1,
  "destination": { "iata": "LIS", "city": "Lisbon", "country": "Portugal" },
  "departureDate": "2026-09-03",
  "returnDate": "2026-09-07",
  "gapMinutes": 95,
  "totalPriceEur": 812.4,
  "maxPricePerPersonEur": 210.0,
  "legs": [
    {
      "origin": { "iata": "OTP", "label": "Bucharest" },
      "outbound": {
        "flightNumber": "W6 3101",
        "departLocal": "2026-09-03T06:40:00+03:00",
        "arriveLocal": "2026-09-03T08:05:00+02:00",
        "departUtc": 1772387200,
        "arriveUtc": 1772391900,
        "durationMinutes": 205,
        "priceEur": 89.0,
        "bookingUrl": "https://c111.travelpayouts.com/click?shmarker=…&promo_id=3791&…&custom_url=…"
      },
      "return": { "…": "same shape, dest→origin on returnDate" },
      "priceEur": 198.5
    }
  ]
}
```

`FlightOption` (normalized provider shape, stored in `flight_cache.payload` and `results.legs`):
`flightNumber`, `departLocal`/`arriveLocal` (ISO with offset — **display only**), `departUtc`/
`arriveUtc` (**epoch seconds from Tequila `utc_departure`/`utc_arrival` — the gap is computed from
these, never from local times**), `durationMinutes` (`duration.total/60`), `priceEur` (`price` with
`curr=EUR`, or `conversion.EUR`), `bookingUrl` (the itinerary's `deep_link` wrapped in the
Travelpayouts click template, §8). `results` contains the best-so-far (the worker upserts ranks as
destinations finish ⇒ partial results stream in); empty while nothing qualifies yet.

### `POST /api/search/[id]/cancel`

Marks the job `cancelled` (worker checks between steps and stops; partial results stay visible).
`200 { "ok": true, "status": "cancelled" }`, `409` if already terminal.

### `GET /api/airports?q=buc`

`200 { "results": [{ "iata": "OTP", "name": "Henri Coandă Intl", "city": "Bucharest", "country": "Romania", "countryCode": "RO" }] }`
(max 8–10). Lookup: `ILIKE '%q%'` on `airports.search_text` (trgm) → on miss,
`provider.searchAirports(q)` (Tequila `/locations/query?term=q&location_types=airport&limit=8`),
upsert results into `airports` (rows lazily expire after `AIRPORT_CACHE_TTL_DAYS=30`), return.
Strict rate limit (§7).

### `GET /api/health`

`{ "ok": true, "db": true, "worker": "up", "time": "ISO" }` — runs `select 1`, never cached; `503`
with `"ok": false` if the DB is down. Used by the deploy workflow's live check (loopback first, then
public) and monitoring.

---

## 4. Async job pipeline (in-process worker)

Cloudflare free cuts proxied requests at 100 s, so the search never runs inside the POST request.
One Node process on the box (`midspot-web.service`) owns everything:

- **Enqueue.** `POST /api/search` inserts the rows and calls `enqueueJob(jobId)` — a synchronous
  push onto an in-memory queue (`globalThis`-guarded singleton so Next dev HMR doesn't double-run
  it); the worker loop starts if idle. Fire-and-forget: the response is already sent.
- **Worker loop** (`lib/jobs/worker.ts`): pop next `queued` job → mark `running` with
  `locked_at` → run `runSearchJob` (§5) with a progress callback → on success `done`, on error
  `failed` (with `error` text, `attempts+1`, one automatic retry for transient provider errors) →
  loop. Cancel = set `cancelled`; the runner checks the flag between phases/destinations and stops
  cleanly, keeping partial results.
- **Boot recovery** (`instrumentation.ts` → `register()`, once per process start in the standalone
  server): requeue every `queued` job (the in-memory queue died with the process) and reset every
  `running` job whose `locked_at` is older than 10 min (crashed mid-run). A 30 s in-process sweeper
  repeats the same query as a safety net and does TTL/retention cleanup: delete `flight_cache`
  where `expires_at < now()`; delete `searches` (cascade) where `expires_at < now()`.
- **Concurrency limiter + provider politeness.** A semaphore around every external provider call:
  `FLIGHTS_MAX_CONCURRENCY = 4` in flight (canonical, flight-data-spec §7.3). On **HTTP 429** the
  worker backs off exponentially (1 s → 2 s → 4 s … capped at 30 s) and, for Travelpayouts
  endpoints, honors `X-Rate-Limit-Remaining` / `X-Rate-Limit-Reset` (wait until the minute resets)
  — per `flight-data-spec.md` §1.4/§2.3. The runner wraps every provider call through the cache:
  `cache_key = sha256(provider|origin|dest|date|adults|currency)` → `SELECT` from `flight_cache`
  where not expired → on miss, acquire semaphore → call provider → normalize → upsert with
  `expires_at = now() + FLIGHTS_CACHE_TTL_SECONDS` (1800 s). Identical calls within a job and across
  jobs (30 min TTL) collapse to one external call.
- **Progress.** One step = the phase-1 ranking call (1 step) or one deep-searched destination (hot
  phase). `progress.ts` throttles writes (≤ 1/s) to `search_jobs.done_steps / current_step /
  total_steps` and mirrors `searches.status`; the client reads them via `GET /api/search/[id]`.
- **TTLs.** `flight_cache` 1800 s (`FLIGHTS_CACHE_TTL_SECONDS`); `airports` rows 30 d
  (`AIRPORT_CACHE_TTL_DAYS`, lazy refresh on miss); the OurAirports **source** file is refreshed by
  a separate weekly cron (`npm run airports:refresh`, 7 d) — two intentionally different TTLs.

---

## 5. The algorithm (`lib/jobs/run-search.ts`) — two-phase, range-collapsed per flight-data-spec §7.3

Inputs: unique origins `O` (|O| = N, 2–8, 1 adult each; duplicate cities dedupe to one origin),
departure dates `D` = every day in `[windowStart, windowEnd]` (≤ 14), `nights k`, per-person budget
`B` EUR, optional max flight minutes `F`, gap limit `G` = `FLIGHTS_ARRIVAL_GAP_LIMIT_HOURS` (24 h,
relaxed to `FLIGHTS_ARRIVAL_GAP_RELAXED_HOURS` = 30 h).

1. **Candidate destinations** `C`: the curated EU shortlist (`db/candidates.ts`, derived from
   OurAirports: scheduled, large/medium airports, EEA+UK+CH+…), excluding the origins, ordered by
   haversine distance to the centroid of the origins ascending (the "middle" spirit), capped at
   `FLIGHTS_MAX_CANDIDATE_DESTINATIONS` = **30** (extensible to 50). If `F` is set, prefilter with a
   flight-time estimate per origin→candidate (distance/800 km·h⁻¹ × 60 + 60 min overhead; keep
   max-over-origins ≤ F) — no external calls.
2. **Phase 1 — cold ranking (N calls).** Per origin `o ∈ O`, ONE Tequila call:
   `/v2/search?fly_from=o&fly_to=<C codes comma-separated>&date_from=ws&date_to=we&flight_type=oneway&one_for_city=1&adults=1&curr=EUR&limit=200`
   → cheapest itinerary **per destination city** over the whole window. Cached in `flight_cache`
   under `dest = __multi__<sha1(codes)>`, `date = ws`. Rank destinations by max over origins of the
   one-way price; drop those where any origin's cheapest > `B` (budget prefilter); keep
   **top K = `FLIGHTS_TOP_K_DEEP_SEARCH` = 10**.
3. **Phase 2 — hot deep search (≤ 2·N·K calls).** Per top destination `d`, per origin `o`:
   - outbound: ONE range call
     `/v2/search?fly_from=o&fly_to=d&date_from=ws&date_to=we&flight_type=oneway&one_per_date=1&adults=1&curr=EUR&limit=200&sort=price`
     → the cheapest itinerary **per day** for the whole window (the `date_from/date_to` range
     collapses all 14 days into one call); cached under `date = ws`;
   - return: ONE range call `fly_from=d&fly_to=o&date_from=ws+k&date_to=we+k&one_per_date=1…`
     (return date = departure + nights for everyone).
   Then per departure date `t ∈ D` (return date `r = t + k`): per origin the adapter gives the
   day's chosen itinerary (canonical: `one_per_date=1` ⇒ cheapest per day, exactly one option);
   per-person price = `outbound.priceEur + return.priceEur` must be ≤ `B`, outbound
   `durationMinutes ≤ F` if `F` set; `gapMinutes = (max utc_arrival − min utc_arrival) / 60` across
   origins. Entry valid iff every origin has an option and `gap ≤ G`.
   *Enrichment (optional, same call count):* dropping `one_per_date` (`limit=200`) returns up to
   200 itineraries per range, giving several options per origin per day — then the combination
   minimizing the gap under budget is chosen per `(d, t)` with a sliding window over the merged
   options sorted by `arriveUtc` (first window covering all origins = minimal gap; pick cheapest
   per origin inside it). Default = canonical `one_per_date=1`.
4. **Gap relaxation.** After scanning all `(d, t)` with `G = 24` h: if zero entries were produced,
   re-run only the combination/evaluation step with `G = 30` h. **Zero extra external calls** — all
   payloads are already in `flight_cache` (30 min TTL).
5. **Ranking.** Sort all entries by `gapMinutes` ascending, then `totalPriceEur` ascending; keep
   **top 20**; upsert into `results` (`rank` 1..20) incrementally after each destination so polling
   clients see partial results. Update `searches.status = 'completed'` (or `'failed'` /
   `'cancelled'`).

**Worst-case external-call estimate** (cold cache):

```
canonical (flight-data-spec §7.3):  |C| × |O| × 2 directions  =  30 × 8 × 2  =  480 calls
   (range-collapse: 1 call per (origin, destination, direction) covers the whole 14-day window;
    the window does NOT multiply calls). At FLIGHTS_MAX_CONCURRENCY=4 and ~0.5–1 s/call → ~2–4 min.
with top-K pruning (default flow):  N + 2·N·K  =  8 + 160  =  168 calls  at N=8, K=10
                                     (phase-1 ranking: N calls with fly_to=<C>&one_for_city=1)
repeat searches within 30 min over the same pairs (incl. the 30 h relaxation pass): 0 calls.
```

Further mitigations: duplicate origins dedupe; the phase-1 budget prefilter drops destinations
before any hot call; results stream per destination; a soft per-job time budget (stop scanning
further destinations after ~10 min, mark `completed` with partial results) bounds worst-case latency.

---

## 6. UI/UX flow + components (mobile-first, light travel style, English)

Routes: `/` (landing + form) and `/r/[slug]` (waiting while running → results when done). One share
page keeps the flow simple: after `POST /api/search` the client navigates to `/r/[slug]`; that page
polls `GET /api/search/<slug>` every 2–3 s and renders either state. The URL is the share link —
copy button on the results page.

1. **Landing `/`** — hero (headline like "Meet in the middle", sub: "One destination, everyone
   flies from home, everyone arrives within a day of each other — inside your budget"), then
   `<SearchForm/>`:
   - dynamic origin rows (min 2, max 8, add/remove buttons), each an `<OriginAutocomplete/>`
     (shadcn `Command` + `Popover`, debounced `GET /api/airports?q=`, shows `OTP — Bucharest,
     Romania`);
   - date-range picker (shadcn `Calendar` in a `Popover`, max span 14 days);
   - nights (`Select`/stepper 1–30);
   - budget per person in EUR (`Slider` 50–1000 + `Input`, currency fixed to EUR);
   - optional max flight time (`Select`: Any / 2 h / 3 h / 4 h);
   - submit → `POST /api/search` → `router.push(sharePath)`. Validation client-side with the same
     zod schema as the server.
2. **Waiting state** (`<WaitingScreen/>` on `/r/[slug]` while status is queued/running):
   `Progress` bar (`doneSteps/totalSteps`), `currentStep` text, skeleton cards, **partial results
   stream in live**, and a **Cancel** button (`POST …/cancel` → `Dialog` confirm).
3. **Results** (`<ResultsList/>` → `<ResultCard/>` per option, best first):
   - header: destination city + country + IATA badge, dates `dep → ret` (+nights);
   - **gap badge** (e.g. "arrive within 1 h 35 min" — green if ≤ 6 h, amber otherwise);
   - one row per person: origin label, outbound leg (flight no., local depart→arrive times with
     tz, duration, price), return leg, per-person total;
   - footer: max price per person vs budget, total for the group;
   - **Book** buttons per leg → affiliate `bookingUrl` (`target=_blank rel="noopener sponsored"`);
   - **Copy share link** button (copies `NEXT_PUBLIC_SITE_URL + /r/[slug]`), sticky bottom bar on
     mobile.
4. **Style**: clean, light, travel. Tailwind 4 `@theme` tokens in `globals.css` (pattern from
   meelmusic, but light): `--color-primary` (sky/blue), `--color-accent` (amber), background
   `slate-50`, white `rounded-2xl border shadow-sm` cards; lucide-react icons (`Plane`, `MapPin`,
   `CalendarDays`, `Users`, `Wallet`); **local font files or system stack — never
   `next/font/google`** (build-time fetch lesson). Mobile-first: single column `max-w-md` on phones,
   wider grid on `md+`.
5. **Language**: English only at MVP, all copy in one messages module so Romanian can be swapped
   in later without touching components (decision recorded in §10).

shadcn/ui components used: `button, input, label, card, badge, calendar, popover, command, select,
slider, progress, skeleton, separator, dialog, sonner, form` (+ `react-hook-form` with
`zodResolver` on the search form).

---

## 7. Security / abuse

- **Zod validation** on every API input (`lib/validation.ts`), with hard caps: origins 2–8 unique
  IATA, window ≤ 14 days, nights 1–30, budget 20–5000 EUR, q length ≤ 64. No raw SQL (Drizzle only).
- **Unguessable share slug**: 72-bit random base64url (§2); `/r/[slug]` is the only public read path
  and `robots.ts` disallows `/r/` and `/api/`.
- **Rate limiting** in `proxy.ts` (Next 16), pattern from cumsevoteaza `apps/web/lib/rate-limit.ts`:
  in-memory fixed-window maps keyed by `CF-Connecting-IP` (IPv6 per /64, bounded at 10 000 keys,
  `429 + Retry-After`); no proxy header ⇒ not counted (local dev / direct box access). General
  limit **240 req/min/IP** (`RATE_LIMIT_PER_MIN`); much stricter on the expensive endpoints:
  **POST /api/search 5/min/IP** (`RATE_LIMIT_SEARCH_PER_MIN`, costs external API calls) and
  **GET /api/airports 30/min/IP** (`RATE_LIMIT_AIRPORTS_PER_MIN`).
- **No client-side secrets**: `KIWI_TEQUILA_API_KEY`, `TRAVELPAYOUTS_API_KEY`, `TRAVELPAYOUTS_MARKER`
  etc. are server-only, never `NEXT_PUBLIC_*`; affiliate links embed only the public marker. Provider
  keys are never logged in plaintext (flight-data-spec §9 risk 5).
- **Headers** (in `proxy.ts` or `next.config.ts`): CSP — `default-src 'self'`;
  `script-src 'self' https://cdn.ethicalads.io https://cdn.carbonads.com` (ad CDNs, §9);
  `style-src 'self' 'unsafe-inline'`; `img-src 'self' data: https:`; `connect-src 'self'`;
  `frame-ancestors 'none'`; plus `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`.
- **No raw IPs stored** — only sha256(ip + salt) in `searches.ip_hash`.

---

## 8. Env vars + flight provider interface

Env vars below are **exactly** the union of the canonical tables: `deploy-midspot.md` §7 ("sursa
unică de adevăr") and `flight-data-spec.md` §8 (canonical names for everything provider/caps).
All live in Infisical `midspot-prod` / `prod` (pulled at build in CI and at service start via the
wrapper), except `PORT`/`HOSTNAME`/`NODE_ENV` which come from the systemd unit.

| var | scope | purpose |
|---|---|---|
| `DATABASE_URL` | server | `postgres://midspot:<parola>@127.0.0.1:5433/midspot` (5433 — 5432 is cumsevoteaza's); connection string only, never an internal fetch base URL (lesson 7) |
| `NEXT_PUBLIC_SITE_URL` | build + runtime | `https://midspot.ncmihai.dev` — baked at build (lesson 5); share links |
| `FLIGHTS_PROVIDER` | server | `tequila` (default) / `travelpayouts-data` / `duffel` / `serpapi` / `amadeus` |
| `KIWI_TEQUILA_API_KEY` | server only | Tequila header `apikey` |
| `KIWI_TEQUILA_BASE_URL` | server | `https://tequila-api.kiwi.com` |
| `TRAVELPAYOUTS_API_KEY` | server only | Data API token (`X-Access-Token` / `?token=`) + Links API |
| `TRAVELPAYOUTS_MARKER` | server only | numeric partner ID for `shmarker` |
| `TRAVELPAYOUTS_TRS` | server | project id (`trs`) for the Links API |
| `TRAVELPAYOUTS_SUB_ID` | server | default `midspot` |
| `TRAVELPAYOUTS_KIWI_PROMO_ID` | server | `3791` — Kiwi.com program in the click template |
| `DUFFEL_ACCESS_TOKEN`, `DUFFEL_MODE` | server, future | `test` / `prod` |
| `SERPAPI_API_KEY` | server, fallback only | 250 searches/month free tier; ToS risk — never primary |
| `AMADEUS_CLIENT_ID` / `AMADEUS_CLIENT_SECRET` / `AMADEUS_ENV` | server, future | Enterprise only (self-service decommissioned 2026-07-17) |
| `FLIGHTS_CACHE_TTL_SECONDS` | server | `1800` (30 min) |
| `AIRPORT_CACHE_TTL_DAYS` | server | `30` (row TTL, lazy; source cron 7 d is separate infra) |
| `FLIGHTS_MAX_CANDIDATE_DESTINATIONS` | server | `30` (extensible 50) |
| `FLIGHTS_MAX_WINDOW_DAYS` | server | `14` |
| `FLIGHTS_MAX_ORIGINS` | server | `8` (origins 2–8, 1 adult each) |
| `FLIGHTS_TOP_K_DEEP_SEARCH` | server | `10` |
| `FLIGHTS_MAX_CONCURRENCY` | server | `4` (canonical, flight-data-spec §7.3) |
| `FLIGHTS_ARRIVAL_GAP_LIMIT_HOURS` | server | `24` |
| `FLIGHTS_ARRIVAL_GAP_RELAXED_HOURS` | server | `30` |
| `NEXT_PUBLIC_ADS_ENABLED` | build + client | `false` until the ad account is approved; baked at build |
| `NEXT_PUBLIC_ETHICALADS_ID` | build + client | EthicalAds site id (primary network) |
| `NEXT_PUBLIC_CARBONADS_SERVE_ID` | build + client | CarbonAds serve id (fallback) |
| `CRON_SECRET` | server, optional | Bearer for a protected `/api/cron/*` (e.g. airports refresh), if activated |
| `SEARCH_RETENTION_DAYS` | server | default `7` (app-side, listed in flight-data-spec §8 registru parțial) |
| `RATE_LIMIT_PER_MIN` / `RATE_LIMIT_SEARCH_PER_MIN` / `RATE_LIMIT_AIRPORTS_PER_MIN` | server | defaults `240` / `5` / `30` (app-side, §7) |
| `PORT` / `HOSTNAME` / `NODE_ENV` | systemd unit | `3003` / `127.0.0.1` / `production` — not in Infisical |
| ~~`RAPIDAPI_KEY`~~ | — | **deleted at rebuild** — old prototype only, local `.env.local`, never on the box |

Infra wiring (all in `deploy-midspot.md`, owner-run): DNS `cloudflared tunnel route dns
--overwrite-dns 87e40a55 midspot.ncmihai.dev`; ingress rule `midspot.ncmihai.dev →
http://127.0.0.1:3003` **before the catch-all**; unit `midspot-web.service` (`MemoryMax=2G`,
`CPUQuota=200%`, `RuntimeMaxSec=7d`, Infisical wrapper `~/bin/start-midspot-web.sh`); Postgres docker
unit `midspot-postgres.service` on `127.0.0.1:5433`; GitHub Actions `.github/workflows/deploy-box.yml`
(verify job → deploy job; secrets `INFISICAL_CLIENT_ID/SECRET`, `BOX_SSH_KEY`,
`CF_ACCESS_CLIENT_ID/SECRET`; concurrency group `deploy-bc250-midspot`; rsync to
`~/projects/midspot-web/`; live check loopback `/api/health` then public domain). **Port 3003
conflict:** sofronesti's plan reserves 3003 for `elena-web.service` — if sofronesti deploys first,
move it to 3004 before midspot's first deploy (owner action; `deploy-midspot.md` header).
`next.config.ts` uses the standard switch: `output: process.env.STANDALONE_OUTPUT === "1" ?
"standalone" : undefined`.

**Flight provider interface** (`lib/flights/provider.ts`) — mirrors the real Tequila surface from
`flight-data-spec.md` §1.2 (canonical mapping table); the rest of the app depends only on this:

```ts
interface FlightProvider {
  // GET /locations/query?term=&location_types=airport&limit=8&active_only=true  (header: apikey)
  searchAirports(query: string): Promise<AirportSuggestion[]>;
  // GET /v2/search — single destination, date RANGE, real itinerary times:
  //   fly_from, fly_to, date_from/dd/mm/YYYY, date_to, flight_type=oneway, one_per_date=1,
  //   adults, curr=EUR, selected_cabins=economy, sort=price, limit<=200
  searchOneWay(origin: string, dest: string, dateFrom: string, dateTo: string, adults: number)
    : Promise<{ dateTo: string; options: FlightOption[] }>;   // one option per day (one_per_date=1)
  // GET /v2/search with fly_to=<codes>&one_for_city=1 — cheapest per city over the range (phase 1)
  searchCheapestPerCity(origin: string, destCodes: string[], dateFrom: string, dateTo: string, adults: number)
    : Promise<{ destCode: string; option: FlightOption }[]>;
  // local construction, no API call — template flight-data-spec §4:
  //   https://c111.travelpayouts.com/click?shmarker={TRAVELPAYOUTS_MARKER}.{TRAVELPAYOUTS_SUB_ID}
  //     &promo_id={TRAVELPAYOUTS_KIWI_PROMO_ID}&source_type=customlink&type=click
  //     &custom_url={encodeURIComponent('https://www.kiwi.com/deep?from='+origin+'&to='+dest+'&departure='+date (+ '&return='+returnDate))}
  // (the kiwi /deep URL has no `adults` param — MVP: 1 adult per link, everyone books their own ticket;
  //  a Tequila `deep_link` may be used as custom_url only if it starts with https://www.kiwi.com/deep)
  affiliateLink(p: { origin: string; dest: string; date: string; returnDate?: string }): string;
}
```

`FlightOption` mapping from `/v2/search` (TODO(provider-mapping) only for Duffel/SerpApi fields):
`arriveUtc`/`departUtc` ← `utc_arrival`/`utc_departure` (epoch s, **used for the gap**);
`arriveLocal`/`departLocal` ← `local_arrival`/`local_departure` (display);
`priceEur` ← `price` (with `curr=EUR`) or `conversion.EUR`; `durationMinutes` ← `duration.total / 60`;
`flightNumber` ← first `route[]` segment `airline` + `flight_no`; `bookingUrl` ← `deep_link` after
affiliate wrapping. `lib/flights/tequila.ts` is the primary adapter; Travelpayouts Data API cannot
serve `searchOneWay` faithfully (cached ~48 h, no per-itinerary times — flight-data-spec §1.5), so it
is only a ranking helper + the affiliate-link builder; Duffel test mode / SerpApi free tier are the
dev fallbacks.

---

## 9. Ads integration (EthicalAds primary, CarbonAds fallback — per `deploy-midspot.md` §4/§7)

- `<AdsSlot>` client components, loaded via `next/script` (`strategy="afterInteractive"`) so ads
  never block rendering; rendered only when baked at build with `NEXT_PUBLIC_ADS_ENABLED=true` and
  an id present (`NEXT_PUBLIC_ETHICALADS_ID` primary, `NEXT_PUBLIC_CARBONADS_SERVE_ID` fallback) —
  off in dev and until the account is approved.
- EthicalAds markup: `<div data-ea-publisher="midspotncmihaidev" data-ea-type="text"></div>` + the
  `cdn.ethicalads.io` script; CarbonAds (`#carbonads` + `cdn.carbonads.com` script) as fallback.
  Both CDNs are allowlisted in the CSP (§7).
- Positions: one slot **below the search form on `/`** and one **after the results list on
  `/r/[slug]`** — never above the fold, never between result cards, never near the Book buttons;
  reserved `min-h` to avoid layout shift.

---

## 10. Questions / decisions for the owner

1. **Window semantics**: does `windowEnd` bound only the *departure* (return = departure + nights,
   may exceed it) or also the return (old prototype bounded both)? Spec assumes departures only.
2. **Budget**: per person and **including the return flight** (assumed). Confirm.
3. **Kiwi API gate (risk #1 in flight-data-spec §9):** Tequila via Travelpayouts needs ≥ 50 000 MAU;
   self-serve is invite-only since May 2024. MVP starts on the provider abstraction with Duffel test /
   SerpApi free for demo; owner applies to Kiwi (`affiliates@kiwi.com`) at signup. Confirm.
4. **Candidate set**: curated OurAirports shortlist (EEA + UK + CH + NO/IS + Western Balkans),
   cap 30 (extensible 50), ordered by distance to the origins' centroid — OK?
5. **Travelers**: 2–8 origins, `adults = 1` per origin (everyone books their own ticket;
   `FLIGHTS_MAX_ORIGINS=8`). Confirm.
6. **Retention / TTLs**: searches/results `SEARCH_RETENTION_DAYS=7`, `flight_cache` 1800 s,
   `airports` rows 30 d lazy + OurAirports source cron 7 d — confirm.
7. **Cancel mid-run** keeps partial results visible (assumed) — confirm.
8. **Ads**: EthicalAds account approval + `NEXT_PUBLIC_ETHICALADS_ID`, CarbonAds fallback
   (`NEXT_PUBLIC_CARBONADS_SERVE_ID`), `NEXT_PUBLIC_ADS_ENABLED` — confirm per deploy-midspot §4/§7.
9. **i18n**: English-only MVP with a single messages module, Romanian later without a framework —
   confirm.
10. **Currency fixed to EUR** (`curr=EUR` forced) — confirm.
11. **Gap**: strict 24 h from `utc_arrival`, auto-relax to 30 h, then give up (assumed). Confirm.
12. **Port 3003 vs sofronesti (`elena-web.service` also wants 3003):** owner resolves before first
    midspot deploy (sofronesti → 3004 if it lands first), per `deploy-midspot.md`.
13. **Postgres on the box**: `midspot-postgres` docker on 5433; backup cadence (nightly pg_dump) —
    owner-run.
14. **Job time budget**: stop scanning destinations after ~10 min and return partial results
    (assumed, env-tunable) — confirm.

---

*Spec written against: the old `at_the_middle/app/**` prototype (RapidAPI fly-scraper — not reused),
`docs/flight-data-spec.md` (provider endpoints, canonical caps/TTLs §7.3/§8, env var names),
`docs/deploy-midspot.md` (box, port 3003 + sofronesti conflict, Postgres 5433, Infisical `midspot-prod`,
env table §7, EthicalAds/CarbonAds §4, share path `/r/<id>` lesson 9),
`cumsevoteaza` (`lib/rate-limit.ts`, `proxy.ts`, `docs/deployment.md`, CLAUDE.md, docker-compose.yml
port 5432), `amdedat` (`packages/db`: drizzle.config.ts, client.ts, migration flow), `meelmusic`
(Tailwind 4 `@theme` tokens, cn/clsx, lucide), `ncm/.github/workflows/deploy-box.yml` + `ncm/AGENTS.md`,
sofronesti plan (`elena-web.service` port 3003). Cross-review: `docs/review-app-architect.md`.*
