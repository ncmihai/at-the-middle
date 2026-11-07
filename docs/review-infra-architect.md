# Cross-review — infra-architect (deploy-midspot.md)

**Runda:** cross-review midspot · **Spec review-uit de mine:** `docs/deploy-midspot.md`
**Spec-uri cross-ificate:** `docs/flight-data-spec.md`, `docs/app-spec.md`
**Realitate verificată:** `cumsevoteaza/docs/deployment.md`, `cumsevoteaza/docker-compose.yml` (bind `5432:5432`), `ncm/.github/workflows/deploy-box.yml`, `mereya_star/.github/workflows/deploy-box.yml`, `sofronesti/docs/superpowers/plans/2026-11-07-elena-alexa-site.md` + `.superpowers/sdd/.../global-constraints.md` (port 3003), `bc250-monitor/server/bc250-stats.service`, conținutul repo-ului `at_the_middle` (prototip RapidAPI).

**Regula respectată:** am modificat DOAR `docs/deploy-midspot.md` + acest fișier. Celelalte spec-uri nu au fost atinse.

---

## 1. Neconcordanțe găsite (cu referințe)

| # | Problemă | Unde |
|---|---|---|
| 1 | Nume env provider: `FLIGHT_PROVIDER` vs canonical `FLIGHTS_PROVIDER`; și setul de valori diferă (`travelpayouts\|tequila` vs `tequila\|travelpayouts-data\|duffel\|serpapi\|amadeus`) | app-spec §8 vs flight-data-spec §0/§8 |
| 2 | Cheie Tequila: `TEQUILA_API_KEY` vs canonical `KIWI_TEQUILA_API_KEY` (+ `KIWI_TEQUILA_BASE_URL` lipsă) | app-spec §8 vs flight-data-spec §8 |
| 3 | TTL cache zboruri: `FLIGHT_CACHE_TTL_HOURS=6` vs canonical `FLIGHTS_CACHE_TTL_SECONDS=1800` — și nume, și valoare (6 h vs 30 min) | app-spec §2/§8 vs flight-data-spec §7.3/§8 |
| 4 | Concurență apeluri externe: `MAX_EXTERNAL_CONCURRENCY=2` vs canonical `FLIGHTS_MAX_CONCURRENCY=8` (flight-data §7.3 zice 5–10) | app-spec §4/§8 vs flight-data-spec §7.3/§8 |
| 5 | Cap destinații candidate: 60 (cod) vs `FLIGHTS_MAX_CANDIDATE_DESTINATIONS=30` | app-spec §5 pas 1 vs flight-data-spec §7.3/§8 |
| 6 | Cap călători: 2–8 (cod) vs `FLIGHTS_MAX_TRAVELERS=6` | app-spec §3 vs flight-data-spec §7.3/§8 |
| 7 | Top-K per origine: 8 (cod) vs `FLIGHTS_TOP_K_DEEP_SEARCH=10` | app-spec §5 pas 2 vs flight-data-spec §7.3/§8 |
| 8 | Tabela mea de env vars (§7 vechi) **lipsea** cheile canonice: `TRAVELPAYOUTS_TRS`, `TRAVELPAYOUTS_SUB_ID`, `TRAVELPAYOUTS_KIWI_PROMO_ID`, `KIWI_TEQUILA_BASE_URL`, `DUFFEL_ACCESS_TOKEN`, `DUFFEL_MODE`, `SERPAPI_API_KEY`, `AMADEUS_*`, toate `FLIGHTS_*` | deploy-midspot.md §7 (vechi) vs flight-data-spec §8 |
| 9 | Rețea ads greșită în tabela mea: AdSense (`NEXT_PUBLIC_ADSENSE_CLIENT`, `ADSENSE_SLOT_*`) vs decizia app-spec §9: **EthicalAds primar + CarbonAds fallback** (CSP pe `cdn.ethicalads.io`/`cdn.carbonads.com`) | deploy-midspot.md §7 (vechi) vs app-spec §9/§7 |
| 10 | `DATABASE_URL` exemplu din app-spec pe **port 5432** (coliziune cu `cumsevoteaza-postgres` care publică `5432:5432`) și fără parolă | app-spec §8 vs cumsevoteaza/docker-compose.yml |
| 11 | **Conflict port 3003:** planul sofronesti rezervă 3003 pentru `elena-web.service`; brief-ul midspot + ambele spec-uri midspot cer 3003 | sofronesti plan Task 13 + global-constraints vs brief midspot, app-spec §8, flight-data-spec header |
| 12 | Live check-ul meu verifica doar domeniul public; app-spec §8 cere și loopback `/api/health` | deploy-midspot.md §6 (vechi) vs app-spec §3/§8 |
| 13 | `CRON_SECRET` ambiguu: app-spec nu are rută cron (refresh lazy), flight-data-spec §7.2 propune cron săptămânal OurAirports | app-spec §3 vs flight-data-spec §7.2 |

## 2. Decizii propuse (rezolvate în cross-review)

- **Numele canonice sunt cele din `flight-data-spec.md` §8** pentru tot ce ține de provideri/cap-uri (`FLIGHTS_PROVIDER`, `FLIGHTS_*`, `TRAVELPAYOUTS_*`, `KIWI_TEQUILA_*`, `DUFFEL_*`, `SERPAPI_API_KEY`, `AMADEUS_*`). Motiv: flight-data-spec §8 spune explicit „spec-ul de infra trebuie să le folosească identic”.
- **Cache TTL:** canonical `FLIGHTS_CACHE_TTL_SECONDS=1800` (30 min — prețurile se mișcă; flight-data-spec §7.3: 15–30 min pentru rezultatele afișate). Valoarea de 6 h din app-spec e prea lungă pentru un MVP cu buget real.
- **Concurență:** canonical `FLIGHTS_MAX_CONCURRENCY=8` (în banda 5–10 din flight-data-spec §7.3; Travelpayouts permite 300 req/min per endpoint, deci 8 paralel e safe).
- **Cap-uri:** valori conduse din env, default flight-data-spec: 30 destinații / 6 călători / 14 zile fereastră / top-K 10. (Fereastra de 14 zile era deja consistentă între cele două spec-uri.)
- **Ads:** EthicalAds primar + CarbonAds fallback, cu `NEXT_PUBLIC_ADS_ENABLED`, `NEXT_PUBLIC_ETHICALADS_ID`, `NEXT_PUBLIC_CARBONADS_SERVE_ID` — după app-spec §9.
- **DATABASE_URL final:** `postgres://midspot:<parola>@127.0.0.1:5433/midspot` — 5432 e ocupat de `cumsevoteaza-postgres` (`"5432:5432"` pe toate interfețele); midspot ia **127.0.0.1:5433**.
- **Port 3003:** **midspot păstrează 3003** (canonical în brief-ul midspot și în ambele spec-uri midspot); **sofronesti trece pe 3004** când ajunge pe box.
- **Gap 24h/30h:** consistent între toate cele 3 spec-uri — gap = max(sosire UTC) − min(sosire UTC) din timestamp-urile reale (`utc_arrival` epoch, NU `local_arrival` — DST), prag 24 h, relaxare automată 30 h. Env: `FLIGHTS_ARRIVAL_GAP_LIMIT_HOURS=24`, `FLIGHTS_ARRIVAL_GAP_RELAXED_HOURS=30`. **Nicio neconcordanță.**
- **CRON_SECRET:** rămâne **opțional** în Infisical; la MVP refresh-ul aeroportilor e lazy (app-spec), deci nu e nevoie de rută protejată. Dacă se activează cron-ul săptămânal OurAirports (flight-data-spec §7.2), atunci se adaugă ruta `/api/cron/...` + timerul `midspot-airports-refresh.timer` pe box, cu `CRON_SECRET`.
- **Live check:** workflow-ul verifică întâi loopback `http://127.0.0.1:3003/api/health` prin ssh, apoi domeniul public (pattern mereya).

## 3. Ce am modificat EU în `docs/deploy-midspot.md`

1. **Nota de port** de sus: decizia finală — midspot păstrează 3003, sofronesti → 3004; harta porturilor ocupate (3000/3001/3002/3003, 5432 luat de cumsevoteaza-postgres ⇒ 5433 pentru midspot).
2. **§4 (Infisical):** lista de chei extinsă la setul canonic complet (FLIGHTS_PROVIDER, TRAVELPAYOUTS_API_KEY/MARKER/TRS/SUB_ID/KIWI_PROMO_ID, KIWI_TEQUILA_API_KEY, DUFFEL_*, SERPAPI_API_KEY, ads EthicalAds/CarbonAds, CRON_SECRET opțional).
3. **§5c:** `DATABASE_URL` final pe **5433** + motivația (5432 ocupat); nota că `postgres:16-alpine` are contrib ⇒ `CREATE EXTENSION pg_trgm` din migrarea 0000 merge (POSTGRES_USER e superuser); nota că migrările prod le rulează owner-ul (`infisical run … npm run db:migrate`).
4. **§6 (workflow):** pasul de live check acum face și `ssh box 'curl -fsS http://127.0.0.1:3003/api/health'` înainte de URL-ul public.
5. **§7:** tabela rescrisă în 7a–7f — toate cheile canonice flight-data-spec §8 + DATABASE_URL + NEXT_PUBLIC_SITE_URL + knob-urile app (rate limits, retenție, ads) + DIGI_STORAGE_* opțional (backup pg_dump) + RAPIDAPI_KEY marcat legacy/de șters.
6. **§9 (checklist):** adăugat pasul owner de migrări înainte de primul deploy, coordonarea portului 3003 cu sofronesti, și verificarea `/api/health` pe loopback.

## 4. ACTIUNE pentru alții (nu am atins celelalte spec-uri)

- **ACTIUNE pentru app-spec** (`docs/app-spec.md` §8 și §2/§4/§5):
  1. Renumește `FLIGHT_PROVIDER` → `FLIGHTS_PROVIDER` și `TEQUILA_API_KEY` → `KIWI_TEQUILA_API_KEY`; adaugă `KIWI_TEQUILA_BASE_URL`, `TRAVELPAYOUTS_TRS`, `TRAVELPAYOUTS_SUB_ID`, `TRAVELPAYOUTS_KIWI_PROMO_ID`, `DUFFEL_ACCESS_TOKEN`/`DUFFEL_MODE`, `SERPAPI_API_KEY`, `AMADEUS_*`.
  2. Înlocuiește `FLIGHT_CACHE_TTL_HOURS=6` cu `FLIGHTS_CACHE_TTL_SECONDS=1800` (și citește secunde, nu ore, în `flight_cache.expires_at`).
  3. Înlocuiește `MAX_EXTERNAL_CONCURRENCY=2` cu `FLIGHTS_MAX_CONCURRENCY=8`.
  4. Fă cap-urile să citească env în loc de hardcod: 60→`FLIGHTS_MAX_CANDIDATE_DESTINATIONS` (30), 8 origini→`FLIGHTS_MAX_TRAVELERS` (6), K=8→`FLIGHTS_TOP_K_DEEP_SEARCH` (10); păstrează `FLIGHTS_MAX_WINDOW_DAYS=14` (deja consistent).
  5. Adaugă în tabel și `FLIGHTS_ARRIVAL_GAP_LIMIT_HOURS=24` / `FLIGHTS_ARRIVAL_GAP_RELAXED_HOURS=30` (worker-ul face relaxarea la 30h).
  6. Corectează exemplul `DATABASE_URL` din §8: `postgres://midspot@127.0.0.1:5432/midspot` → `postgres://midspot:<parola>@127.0.0.1:5433/midspot` (5432 e ocupat de cumsevoteaza-postgres pe box).
  7. Ads: păstrează `NEXT_PUBLIC_ADS_ENABLED` / `NEXT_PUBLIC_ETHICALADS_ID` și adaugă `NEXT_PUBLIC_CARBONADS_SERVE_ID` pt. fallback (§9); nimic de schimbat în CSP.
  8. Clarifică în §8 că providerul default la MVP rămâne de ales între `tequila` (flight-data-spec) și `travelpayouts` (app-spec) — decizia de produs; infra setează doar `FLIGHTS_PROVIDER` în Infisical.
- **ACTIUNE pentru owner / echipa sofronesti:** planul sofronesti rezervă portul 3003 pentru `elena-web.service` (`sofronesti/docs/superpowers/plans/2026-11-07-elena-alexa-site.md` Task 13 + `global-constraints.md`). Decizie: **midspot păstrează 3003; sofronesti trece pe 3004** (PORT=3004, ingress `http://127.0.0.1:3004`, live check pe 3004) când ajunge pe box.
- **ACTIUNE opțională pentru flight-data-spec + app-spec:** dacă se păstrează cron-ul săptămânal OurAirports (§7.2), app-spec trebuie să adauge ruta protejată `/api/cron/refresh-airports` cu `CRON_SECRET` și infra va adăuga unitatea `midspot-airports-refresh.timer` pe box (pattern `mereya-revalidate.timer`). La MVP, refresh lazy (app-spec §3) e suficient — `CRON_SECRET` rămâne opțional în Infisical.

## 5. Verificat ca fiind CONSISTENT între cele 3 spec-uri + realitatea din repo

- Nume infrastructură identice peste tot: `midspot-web.service`, proiect Infisical `midspot-prod` env `prod`, host `midspot.ncmihai.dev`, ingress `http://127.0.0.1:3003`, artefact `~/projects/midspot-web/`, wrapper `~/bin/start-midspot-web.sh`, tunel `87e40a55`, workflow `.github/workflows/deploy-box.yml` cu `STANDALONE_OUTPUT=1` + rsync prin `ssh.ncmihai.dev` + `systemctl --user restart` + live check — verificat contra `ncm/.github/workflows/deploy-box.yml`, `mereya_star/.github/workflows/deploy-box.yml` și `cumsevoteaza/docs/deployment.md`.
- `NEXT_PUBLIC_SITE_URL=https://midspot.ncmihai.dev`, baked la build (lecția 5) și prezent și în env-ul de build din CI (pull Infisical) — consistent.
- Gap 24h/30h calculat din `utc_arrival`/arrUTC (nu local) — consistent flight-data-spec §1.2/§9.8 vs app-spec §3/§5.
- Rate limits app: 240/min general, 5/min POST /api/search, 30/min GET /api/airports — doar în app-spec §7, acum și în tabela mea §7d; limitele providerilor (Travelpayouts 300/min etc.) rămân în flight-data-spec §2.3, fără env.
- `RAPIDAPI_KEY` marcat legacy/șters peste tot (prototipul fly-scraper nu se refolosește; `.env*` nu ajunge pe box) — consistent.
- Postgres self-hosted pe box (nu Neon), `postgres:16-alpine`, volum named, healthcheck, doar loopback — cerut de brief + app-spec; portul final 5433 (decizie de mai sus).
- Cloudflare 100 s ⇒ job async + polling (`POST /api/search` → 202 + id, `GET /api/search/[id]` poll, worker în proces, recovery la boot în `instrumentation.ts`) — app-spec §4; compatibil cu `RuntimeMaxSec=7d` din unitate (restart săptămânal + recovery reiau joburile blocate >10 min).

---

## 6. Runda finală de curățenie (după review-app-architect.md)

Rezolvate în `deploy-midspot.md` la cererea explicită a celor 3 acțiuni rămase:

1. **§7c aliniat la valorile canonice reconiliate din `flight-data-spec.md` §8:** `FLIGHTS_MAX_CONCURRENCY` **8 → 4** (sub 8, contra limitelor per-minut Travelpayouts / 429 Tequila), `FLIGHTS_MAX_TRAVELERS=6` → **`FLIGHTS_MAX_ORIGINS=8`** (origini 2–8, câte 1 adult/origine), `AIRPORT_CACHE_TTL_DAYS=30` mutat în §7c (e și în §8 flight-data-spec), restul cap-urilor/TTL-urilor erau deja conforme (1800 s, 30 destinații, 14 zile, top-K 10, gap 24/30 h).
2. **Share path armonizat:** §7a acum zice `/r/<slug>` (calea canonică din app-spec), nu `/s/<slug>`; lecția 9 din §8 era deja pe `/r/<id>`.
3. **Port 3003:** nota de sus și checklist-ul §9 spun acum explicit că 3003 e în conflict cu planul sofronesti (`elena-web.service`), că **rezoluția e la owner înainte de primul deploy** (mutare pe 3004 a unuia dintre ele), și că poziția noastră e: midspot păstrează 3003, sofronesti trece pe 3004.

## 7. Update final — midspot trece pe portul 3005

Decizie ulterioară: **3003 rămâne rezervat sofronesti/elena-web** (plan Task 13), **3004 rezervat**, **midspot ia 3005**. În `deploy-midspot.md` am schimbat peste tot 3003→3005 (header, diagramă, regula ingress, `Environment=PORT=3005`, live check + loopback `http://127.0.0.1:3005/api/health`, tabela env, lecția 7, checklist) și am adăugat:
- secțiunea **„Port registry (anti-coliziune)”**: sursa unică de adevăr `~/projects/PORTS.md` pe box (tabel `port | service | host | artefact`), regula **site nou = max+1, înregistrat ÎNAINTE de deploy**, `PORT` env-driven în unit (nu hardcodat în app), cu tabelul curent (3000 cumvoteaza, 3001 ncm, 3002 mereya, 3003 sofronesti, 3004 rezervat, 3005 midspot, 5432/5433 Postgres, 8250 bc250-stats);
- secțiunea **„2b. Viitor: wildcard ingress + reverse proxy local (Caddy)”**: la ~6–8 site-uri se trece pe `*.ncmihai.dev → 127.0.0.1:8080` + Caddy pe box care rutează după `Host`; site nou = doar DNS + rută Caddy + unit systemd, fără sudo pe `/etc/cloudflared/config.yml`.
