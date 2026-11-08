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
