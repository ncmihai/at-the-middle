# midspot — plan integrat (aprobat de subagenți în cross-review)

Nume intern: **midspot**. Domeniu: **https://midspot.ncmihai.dev** (box BC250, port **3005** — vezi §4 port registry).
Repo: `at_the_middle` (păstrăm folderul, numele intern de cod e midspot; numele public îl decidem la lansare).

Spec-uri de detaliu (toate cross-review-uite, 13+22 neconcordanțe găsite și rezolvate între ele):
- `docs/flight-data-spec.md` — API-uri de zboruri, env vars canonice, cap-uri, deep links afiliate
- `docs/deploy-midspot.md` — runbook ziua 1 pe BC250 (DNS, tunnel, systemd, Postgres, Infisical, GH Actions)
- `docs/app-spec.md` — arhitectura aplicației (schema, rute, joburi async, algoritm, UI)
- `docs/review-*.md` — rapoartele de cross-review

---

## 1. Decizii cheie (rezolvate în cross-review)

| # | Decizie | Detaliu |
|---|---|---|
| 1 | **Fără RapidAPI, fără scrapere** | Cheia veche e compromisă (în git history) → owner o revocă. Ștergem `RAPIDAPI_KEY` din proiect și Infisical. |
| 2 | **Provider de zboruri: abstracție obligatorie** `FLIGHTS_PROVIDER ∈ {tequila, travelpayouts-data, duffel, serpapi}` | Kiwi Tequila are **gate (≥50.000 MAU)** și self-serve e invite-only din mai 2024 → la MVP pornim cu Travelpayouts Data API (fără gate) pentru ranking-ul candidaților + Duffel test / SerpApi free pentru demo; owner aplică la Kiwi (`affiliates@kiwi.com`) de la signup. Amadeus Self-Service e **decommissionat (2026-07-17)** — nu mai e opțiune. |
| 3 | **Monetizare** | Linkuri afiliate Travelpayouts (Kiwi `promo_id=3791`, template `c111.travelpayouts.com/click?shmarker=...&custom_url=kiwi.com/deep?...`) — **preț identic pentru user**, comision 3% plătit de Kiwi. Plus reclame ne-intrusive: EthicalAds primary, CarbonAds fallback, env-gated, niciodată peste fold / între rezultate / lângă butoanele Book. Fără vânzare de bilete (fără Duffel prod) la MVP. |
| 4 | **Constrângerea de 24h = gap de sosire** | `gap = max(utc_arrival) − min(utc_arrival)` al sosirilor **outbound**, calculat în UTC din timestamp-urile reale ale itinerariilor. Hard cap **24h**, relaxare automată la **30h** dacă nu găsește nimic (fără apeluri noi — datele sunt deja în cache). |
| 5 | **Hosting: BC250 + Cloudflare tunnel**, nu Vercel | `midspot.ncmihai.dev` → tunnel `87e40a55` → `127.0.0.1:3005`, unit `midspot-web.service`, build standalone, deploy prin GH Actions (rsync via `ssh.ncmihai.dev`). Porturi alocate secvențial: 3000 cumvoteaza, 3001 ncm, 3002 mereya, 3003 sofronesti (elena-web), 3004 rezervat, **3005 midspot** — registru pe box `~/projects/PORTS.md` (vezi §4). |
| 6 | **DB: Neon** (decizie owner, ca la celelalte proiecte) — nimic local pe box | `DATABASE_URL` = connection string Neon (branch/proiect dedicat `midspot`) în Infisical proiect `midspot` (id `71ef14fc-263d-46f9-9fe7-002930ca63d3`), env `prod`. Drizzle ORM; backup-urile sunt treaba Neon (PITR). |
| 7 | **Secrete: Infisical** proiect `midspot-prod`, env `prod`, machine identity `bc250` existentă; wrapper `infisical run --env=prod -- node server.js` la fiecare start. | |
| 8 | **Stack app** | Next.js 16 App Router standalone + React 19 + TS + Tailwind 4 + shadcn/ui + Drizzle. Fără `next/font/google` (fonturi locale — lecție build CI). UI în engleză la MVP, mesaje într-un singur modul (RO mai târziu). |
| 9 | **Cloudflare taie request-urile la 100s** → căutările sunt **async**: `POST /api/search` → job în Postgres → client poll-uiește `GET /api/search/[slug]` la 2–3s cu rezultate parțiale. Worker in-process, concurență max 4, recovery joburi stale la boot. | |
| 10 | **Cap-uri canonice** (env-driven) | 30 destinații candidate (top-K 10 deep search), fereastră ≤14 zile, 2–8 origini, cache zboruri 1800s, aeroporturi 30z, gap 24h→30h, `POST /api/search` max 5/min/IP, general 240/min/IP. |

## 2. Algoritmul (rezumat, detaliu în app-spec §5)

```
Input: N origini (IATA), fereastră [ws, we] ≤14 zile, k nopți, buget B EUR/persoană
1. Candidați C: shortlist OurAirports UE (EEA+UK+CH+...), fără origini, ordonați după
   distanța la centroidul originelor, cap 30.
2. Fază 1 (N apeluri): per origine, 1 apel Tequila fly_to=<C>&one_for_city=1 → cel mai ieftin
   per oraș pe toată fereastra; prefilter buget (max preț peste oricare origine > B → drop); top K=10.
3. Fază 2 (≤ 2·N·K apeluri, range-collapse): per (destinație top-K, origine): 1 apel outbound
   (date_from=ws, date_to=we, one_per_date=1) + 1 apel return (ws+k..we+k). Cache 30 min.
4. Per (destinație, zi plecare t): per persoană preț = outbound + return ≤ B; gap din utc_arrival.
   Valid dacă gap ≤ 24h. Dacă niciun entry după toate → re-evaluare cu gap ≤ 30h (0 apeluri noi).
5. Ranking: gap ↑, apoi cost total ↑; top 20 salvate incremental în `results` (polling vede rezultate
   parțiale). Retur = t + k pentru toată lumea.
Worst case cold cache: 480 apeluri (~2–4 min la concurență 4); cu top-K: ~168 apeluri; căutări
repetate în 30 min: 0 apeluri.
```

## 3. Roadmap

### Faza 0 — sanitar (înainte de orice cod)
- [ ] Owner: revocă cheia RapidAPI veche (compromisă), șterge din Infisical dacă e acolo
- [ ] Git: `.gitignore` corect (`.env*`, `node_modules/`, `.next/`), `git rm --cached` pentru `.env.local` + `node_modules`, commit; opțional history purge după revocare
- [ ] Commit docs/ (spec-urile de mai sus)

### Faza 1 — infrastructură pe BC250 (runbook: deploy-midspot.md)
- [ ] Owner: `cloudflared tunnel route dns --overwrite-dns 87e40a55 midspot.ncmihai.dev`
- [ ] Owner: regula ingress în `/etc/cloudflared/config.yml` → 127.0.0.1:3003 (sudo + restart cloudflared)
- [ ] Owner: rezolvă conflictul de port 3003 cu sofronesti (sofronesti → 3004)
- [ ] Box: docker compose `midspot-postgres` pe 127.0.0.1:5433 + unit oneshot la boot + nightly pg_dump
- [ ] Infisical: proiect `midspot-prod` / env `prod` cu toate cheile canonice (flight-data-spec §8 + `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, ads)
- [ ] Owner: signup Travelpayouts (token Data API + marker), aplică la programul Kiwi.com API (50k MAU gate) + `affiliates@kiwi.com`; EthicalAds/CarbonAds account
- [ ] Repo: `.github/workflows/deploy-box.yml` (șablon ncm), secretele GH (nume în deploy-midspot §6)
- [ ] Unit `midspot-web.service` + wrapper `~/bin/start-midspot-web.sh` pe box

### Faza 2 — aplicația (spec: app-spec.md)
- [ ] Schelet Next 16 + Tailwind 4 + shadcn/ui, `proxy.ts` rate-limit, CSP, `instrumentation.ts` recovery
- [ ] Drizzle schema + migrații: `airports`, `searches` (slug 72-bit, share path `/r/[slug]`), `search_jobs`, `flight_cache`, `results`
- [ ] `lib/flights/provider.ts` (adapter `FLIGHTS_PROVIDER`) + implementări: tequila, travelpayouts-data, duffel(test), serpapi
- [ ] Rute: `POST /api/search`, `GET /api/search/[slug]`, `POST /api/search/[slug]/cancel`, `GET /api/airports?q=`, `GET /api/health`
- [ ] Worker async + algoritmul în 2 faze + relaxare 30h + cache
- [ ] UI: landing + form (autocomplete origini 2–8, range ≤14z, nopți, buget EUR, max flight time), waiting cu progress/cancel, rezultate `/r/[slug]` (carduri: gap badge, per-persoană zboruri, prețuri, butoane Book afiliate, copy share link)
- [ ] Ads slot-uri ne-intrusive, env-gated
- [ ] Seed `airports` din OurAirports + cron săptămânal refresh (CRON_SECRET)
- [ ] Test end-to-end: căutare reală cu provider disponibil, share link, deploy pe box, live check

### Faza 3 — lansare
- [ ] Ads live (după aprobare), afiliere Travelpayouts live
- [ ] Monitorizare: health endpoint în bc250-monitor dacă vrei, loguri systemd
- [ ] Decizie nume public (midspot vs altceva) + eventual alias atthemiddle.ncmihai.dev

## 4. Port registry (anti-coliziune pe box)

- Sursa unică de adevăr: **`~/projects/PORTS.md` pe BC250** — tabel `port | service | host | artefact dir`. Îl actualizezi ÎNAINTE de fiecare deploy nou.
- Regulă: site nou = următorul port liber (max+1). `PORT` e env-driven în unitatea systemd, niciodată hardcodat în codul aplicației.
- Registru curent: 3000 cumvoteaza-web, 3001 ncm-web, 3002 mereya-web, 3003 elena-web (sofronesti), 3004 rezervat, **3005 midspot-web**.
- Când avem ~6-8 site-uri: trecem pe **wildcard ingress** `*.ncmihai.dev → 127.0.0.1:8080` + reverse proxy local (Caddy) pe box care rutează după Host header → adăugarea unui site devine doar DNS + rută Caddy + unit, fără sudo pe config-ul cloudflared.

## 5. Riscuri principale (din flight-data-spec §9)

1. **Gate Kiwi API (50k MAU)** — mitigat prin abstracție provider + pornire fără el (Data API + linkuri + demo Duffel/SerpApi). Owner aplică la Kiwi de la început.
2. **Prețurile se mișcă între căutare și click** — afișăm „preț la momentul căutării”, fără garanție; linkul afiliat e sursa de adevăr.
3. **429/rate limits** — coadă + backoff + cache 30 min + concurență 4.
4. **Timeout 100s Cloudflare** — rezolvat prin joburi async + polling.
5. **Cost apeluri la trafic mare** — cache + cap-uri + rate limit pe POST /api/search (5/min/IP) + retention 7 zile.

---

## Faza 3 — consens cu owner-ul (2026-11-07)

Decizii luate (Q&A):
1. **Toate workstream-urile**, site-ul e simplu și le facem pe toate: ads+SEO, UX/i18n, cost guard, monitorizare.
2. **SerpApi guard**: cap hard lunar la **200 căutări** (`PROVIDER_MONTHLY_CAP=200`); după cap, căutările răspund doar din cache (flag `usageLimited` pe răspuns). Owner se ocupă separat de aprobarea Kiwi → când vine cheia, `FLIGHTS_PROVIDER=tequila` (fără rescriere). Prewarm cache se activează când aterizează Kiwi (limite mai mari); până atunci doar cap + cache 30 min.
3. **Fără login** la MVP și pe viitor apropiat — doar linkuri shareabile `/r/[slug]`.
4. **Obligatoriu înainte de lansare publică**: pagini legale (Privacy + Termeni, GDPR + cookie consent care gatează Drive/ads) + SEO de bază (sitemap, OG).
5. **Limbi**: EN + top limbi UE — `en, ro, de, fr, es, it` (prin modulul de mesaje existent, comutator de limbă, fără schimbare de rutare).

Ordinea de implementare: (1) cost guard [protejează banii], (2) legal + consent + SEO [GDPR înainte de ads], (3) ads live când ai contul, (4) i18n + detectează locația (IP→IATA), (5) monitorizare health pe box.

---

## Faza 4 — UI/UX & monetizare (brainstorming cu owner-ul, 2026-11-07)

Marketing: TikTok (mai târziu). Până atunci: produs bun, de revisitat. Ads EthicalAds: mai târziu (după consent deja în vigoare).

**Backlog incremental, în ordinea votată de owner:**
1. **Hartă SVG + timeline sosiri** pe `/r/[slug]` (pin-uri origini+destinație, gap vizual) — cel mai bun asset și pentru TikTok
2. **Sort/filter rezultate + butoane relax** one-click (gap 30h / +50€ / +3 zile) când nu găsește
3. **Cazare afiliată (Booking.com)** per rezultat, cu date — prin Travelpayouts (comisie mai mare decât la zbor)
4. **Share card PNG** descărcabil (cel mai bun rezultat, canvas client-side) pt TikTok
5. **OG image dinamic** per `/r/[slug]` (thumbnail bun la share)
6. **Istoric local** (localStorage) + buton „copiază invitația” cu text precompletat

Notă: login rămâne „mai târziu” (link-only). Car/transfer affiliate: nu acum, doar Booking.

---

## Faza 6 — anywhere UX + social proof (DONE 2026-11-08, commit f83f88a, CI green)

- /r/[slug] hero banner "Best middle for you: {city}" (rank-1, gap badge, price/person, dates)
- 🎲 "Surprise me" dice — random top-10 result, map pin highlight + tooltip, smooth scroll, toast
  (verified live: "🎲 Budapest — 2 h 15 min apart, €373.00")
- Landing "Popular middle spots" — /api/popular (aggregate counts, last 30d, min 3 searches,
  5-min cache, 60/min/IP) → verified: Budapest ×37, Maribor ×14, Krakow ×14, …
- Note: the search was already "anywhere" (no destination field) — this made it visible + fun.

## Remaining roadmap (owner-approved order)
1. TikTok content using share cards / OG images / map / gap-0 results
2. Ads (EthicalAds) when account approved → IDs in Infisical + NEXT_PUBLIC_ADS_ENABLED=true
3. Kiwi approval → FLIGHTS_PROVIDER=tequila (no code change); then cache prewarm
4. Health alerting (webhook/Telegram) on top of the 5-min health timer
5. Price alerts / saved searches — needs login/email (later)

---

## Faza 7 — destinations SEO + affiliate extras (DONE 2026-11-08)

- /destinations + /destinations/[city]: ALL candidate cities (485 urls in sitemap, ISR 1h,
  per-city OG cards, i18n 6 langs). Verified: /destinations/krakow → 200 "Meet in Krakow · midspot".
- Per-result affiliate extras via Travelpayouts Links API (batched ≤10/call, 1h cache, top-10 results):
  transfer (Welcome Pickups), car (QEEQ), eSIM (Airalo), activities (Tiqets) — verified live:
  302 → brand URL with aff_track_id=…-802224 (attribution works).
- Kiwi.com flights program (3%) is CONNECTED → Book links attribute already.
- Booking.com NOT connected (review: needs 3 months stable traffic + travel content) → re-apply after 9 Nov.

## Travelpayouts review unblock plan (owner: traffic + content)
1. Blog /blog DONE (infra live, commit 926165e) — owner adds 3-5 real posts in content/blog/*.md (frontmatter: title,date,excerpt,lang). Seed posts exist (en+ro), rewrite them.
2. TikTok start after blog exists (assets ready: share cards, OG, map, gap-0 results)
3. Destination pages already live (this faja) — count as content base
4. Re-submit Midspot project for review after 9 Nov with traffic stats + blog
5. Meanwhile use connected programs only (list in Q&A 2026-11-08): Kiwi, Aviasales(hot 40%),
   WelcomePickups, QEEQ, Airalo, Tiqets, Klook, GetTransfer, Kiwitaxi, Localrent, AutoEurope, ...

---

## Faza 8 — DONE 2026-11-08 (commits 6bfb1c5, f45699f, 26d8a1d, CI green)

- **A. Poze orașe**: 378/485 orașe cu poze free (Wikimedia Commons, doar licențe CC0/CC-BY/PD,
  cu credit foto pe pagină) → mirror în Digi Storage (midspot/cities/<slug>.jpg) → hero pe
  /destinations/[city], thumbs în index, fundal pe OG cards + share card + HeroAnswer.
  Pipeline: scripts/fetch-city-images.ts (idempotent; re-run pentru a reînnoi linkurile semnate Digi).
- **B. Vremea la destinație**: open-meteo (free, fără cheie) — pe cardurile de rezultate (zilele
  călătoriei) și pe paginile orașelor (următoarele 7 zile), cache 30 min, iconițe WMO, 6 limbi.
- **E. Analytics proprii**: tabel pageviews + contor în proxy (fără IP-uri) + /stats protejat cu
  STATS_SECRET (în Infisical) + /api/stats JSON — dovadă de trafic pt re-review TP (+ dashboard CF).
- **F. Edge cache**: paginile sunt ISR; rețeta Cache Rule Cloudflare pt /destinations+/blog e în ops/README (owner o lipește în dashboard).

## Faza 9 — DONE 2026-11-08 (commit 863a0d2, CI green, playwright-verified)

- **Poza orașului ca fundal peste tot**: hero „Best middle" + FIECARE card de rezultat +
  rândurile din /destinations au poza orașului full-bleed, cu scrim gradient dark bottom-up
  (`.photo-scrim`) → text alb lizibil (rezolvat problema cu overlay-ul albastru care îneca textul).
- Cardurile /destinations nu mai trunchiază numele („Lon...") — layout refăcut pe 2 coloane de conținut.
- Orașele fără poză (ex. Basel) păstrează fallback-ul light cu iconiță pin.
- Acelasi tratament pe OG cards + share card PNG. Credit foto păstrat pe imagine.
- Verificat playwright: 5 carduri cu poză pe rezultate, 0 nume trunchiate, 0 pageerrors.

## Faza 10 — DONE 2026-11-08 (commits 92b4c0e valută, 01295bb dark, e817e87 limbi, 21f7a95 blog; CI green, playwright-verified)

- **A. Valută (top 15)**: EUR RON USD GBP CHF PLN CZK SEK HUF DKK NOK BGN TRY ILS AED. Curs ECB via
  frankfurter.app (free, cache 24h + fallback static rates), `/api/rates` pt client, cookie `midspot-cur`,
  switcher în footer lângă limbă. Prețurile interne rămân EUR; doar afișarea convertește. Bugetul din
  formular se introduce în moneda aleasă (placeholder = codul), relax „+50” afișează echivalentul în
  moneda curentă (adaugă tot 50 EUR intern), pe rezultate apare linia „1 EUR = 5.3403 RON · ECB rate from …”,
  iar linkurile Booking primesc `selected_currency=<cod>` (param `?cur=` pe API). OG/share server rămân EUR.
- **B. Dark mode**: toggle Light/Dark/System în footer (cookie `midspot-theme`, default system =
  prefers-color-scheme), paletă slate (bg slate-950, carduri slate-900) prin override pe aceiași tokeni
  `@theme` într-un block `.dark` + `@custom-variant dark (class)`, script inline no-flash în `<head>`
  (CSP existent permite deja inline). Fix-uri dark: pe hartă, carduri, badge-uri, pop-up-uri.
  Verificat: persistă după reload, cardurile cu poză rămân lizibile (scrim dark peste poză).
- **C. 23 limbi**: adăugate pt nl pl cs tr sv da fi no el uk hu zh ja ko th vi (fără RTL încă).
  Fiecare fișier `lib/i18n/<cod>.ts` are structura identică cu en (241 chei leaf; `legal` opțional,
  fallback EN). Paritate enforced by `npm run i18n:check` (scripts/check-i18n.ts). Switcher automat pe
  toate cele 23; `/api/location` mapează limbile noi către locale whereami (fallback en).
  Verificat live: JA → H1 „真ん中で会いましょう”, PL → „Wasze miejsca pośrodku”.
- **D. Blog — primele 3 postări reale EN** (~900-1000 cuv, conținut original pt review TP):
  `prague-one-weekend-is-not-enough` (inclusiv unghiul „Viena mai ieftină”: muzee, metroul cu scări
  rulante de 87 m Náměstí Míru), `tallinn-the-quiet-nordic-capital`,
  `bologna-why-groups-keep-landing-there`. Fiecare post are card affiliate la final
  (frontmatter `city:` → components/BlogAffiliateCard.tsx, server-side: zbor Kiwi + transfer
  Welcome Pickups + activități Tiqets, `sub_id=midspot-blog-card`, dezvăluire afiliere, link
  `rel="noopener sponsored"`). Sitemap + RSS le preiau automat. Verificat live: 5 postări în /blog,
  card cu 3 linkuri sponsorizate pe fiecare post nou, RSS/sitemap OK.

## Faza 10e — DONE 2026-11-09 (commits 4d2891b, 5edd97d; deploy green via manual run 42673480288, playwright-verified EN/RO/JA/PL)

- **Hero copy spune povestea gap-ului de sosire** (clarificarea owner-ului: "at the middle" = intervalul
  dintre sosiri, nu doar mijlocul geografic — fiecare zboară de acasă, întâlnirea e într-un al treilea loc,
  la ore apropiate, nu la zile distanță). heroSubtitle + 4 heroPoints + heroExample nou
  („tu din București, prieten din Berlin → Barcelona, 2 h diferență, nu 3 zile”) — traduse în toate
  cele 23 de limbi. `npm run lint` = eslint + `i18n:check`, rulat și în CI (în build step).
- Notă: două run-uri push consecutive au eșuat cu 0 joburi (parse race GitHub, fără eroare reală) —
  același commit rulat manual a fost verde; push-urile ulterioare au revenit normale.

## Rămas din brainstorm (nealese încă)
C vot pe rezultate · D badge „mai ieftin decât de obicei" · G mai multe limbi · H valută · I dark mode ·
J PWA · K prefill origine din IP · L compară 2 rezultate · M alerte preț pe email (după review) · N webhook.
