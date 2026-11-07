# Cross-review — app-architect (round 1)

**Reviewer:** app-architect · **Spec under review:** `docs/app-spec.md`
**Compared against:** `docs/flight-data-spec.md` (flight-data team), `docs/deploy-midspot.md`
(deploy team), and repo reality (`cumsevoteaza/docs/deployment.md`, `cumsevoteaza/docker-compose.yml`,
`ncm/.github/workflows/deploy-box.yml`, `mereya_star/.github/workflows/deploy-box.yml`,
`bc250-monitor/server/bc250-stats.service`, sofronesti plan `docs/superpowers/plans/2026-11-07-elena-alexa-site.md`
+ `.superpowers/sdd/.../global-constraints.md`).
**Rules honored:** only `docs/app-spec.md` and this file were modified; the other two specs are
untouched.

## Findings

| # | Severity | Neconcordanță (referințe) | Decizie propusă | Status |
|---|---|---|---|---|
| 1 | high | **Provider identity + chei.** app-spec vechi: provider primar Travelpayouts, `FLIGHT_PROVIDER=travelpayouts\|tequila`, `TEQUILA_API_KEY`. flight-data-spec §0/§8: primar = **Kiwi Tequila** (`FLIGHTS_PROVIDER ∈ {tequila, travelpayouts-data, duffel, serpapi, amadeus}`, default `tequila`), chei `KIWI_TEQUILA_API_KEY` (header `apikey`), `KIWI_TEQUILA_BASE_URL=https://tequila-api.kiwi.com`; Travelpayouts Data API doar pt. ranking (`TRAVELPAYOUTS_API_KEY`), afiliere prin `TRAVELPAYOUTS_MARKER`/`TRAVELPAYOUTS_SUB_ID`/`TRAVELPAYOUTS_TRS`/`TRAVELPAYOUTS_KIWI_PROMO_ID=3791`. | app-spec §8 aliniat la numele canonice din flight-data-spec §8; dublă cu deploy-midspot §7 (care păstrează doar `TRAVELPAYOUTS_API_KEY` + `TRAVELPAYOUTS_MARKER` — celelalte chei Travelpayouts/Tequila trebuie adăugate în Infisical, vezi #12). | ✅ rezolvat în app-spec §8 |
| 2 | high | **Interfața `lib/flights/` vs endpoint-urile reale.** app-spec vechi avea doar `searchAirports/searchOneWay(origin,dest,date,adults)/affiliateLink` cu TODO-uri. flight-data-spec §1.2: Tequila expune `GET /locations/query` și `GET /v2/search` cu `fly_to` listă + `one_for_city=1`, `date_from/date_to` (dd/mm/YYYY), `one_per_date`, `limit≤200`; câmpuri `utc_departure/utc_arrival` (epoch), `local_*`, `price`/`conversion.EUR`, `duration.total`, `deep_link`; afilierea = template `c111.travelpayouts.com/click?shmarker=…&promo_id=3791&custom_url=<encodeURIComponent(kiwi /deep)>`. | Interfața din app-spec §8 acum include `searchOneWayRange`, `searchCheapestPerCity`, mapping-ul câmpurilor și template-ul de link afiliat; rămân TODO doar pentru Duffel/SerpApi. | ✅ rezolvat în app-spec §8 |
| 3 | high | **Gap-ul de sosire.** app-spec vechi calcula din ora locală + offset convertit la UTC; flight-data-spec §9.8 cere explicit `utc_arrival` (epoch) — protecție DST. | app-spec §3/§5: gap = max(`utc_arrival`) − min(`utc_arrival`) în UTC; `local_*` doar pentru afișare. | ✅ rezolvat în app-spec §3, §5 |
| 4 | high | **Cap-uri algoritm.** app-spec vechi: 60 destinații, N=2–8, concurență 2, cache zboruri 6 h, cache aeroporturi 30 zile lazy. flight-data-spec §7.3: **30 destinații** (ext. 50), **N≤6**, fereastră ≤14 zile (ok), **concurență 8** (5–10), **TTL cache 15–30 min** (`FLIGHTS_CACHE_TTL_SECONDS=1800`), autocomplete 24 h, OurAirports refresh 7 zile. | Toate cap-urile din app-spec §2/§3/§4/§5/§10 aliniate la flight-data-spec §7.3/§8. | ✅ rezolvat în app-spec |
| 5 | high | **Worst-case apeluri.** app-spec vechi: per (destinație, zi, origine) × 2 direcții = 60×14×4×2 = **6 720 apeluri**. flight-data-spec §7.3: model în două faze — faza rece N apeluri (`fly_to=<30 coduri>&one_for_city=1` + interval de date), faza caldă N×K per direcție (K=10, un apel range pe toată fereastra) ⇒ **N·(1+2K) = 84 (N=4) / 126 (N=6)**. | Algoritmul din app-spec §5 rescris în două faze; worst-case recalculat; relaxarea 30 h costă 0 apeluri (cache). | ✅ rezolvat în app-spec §5 |
| 6 | medium | **Tabela de cache.** app-spec vechi: `flight_cache(cache_key, …)` TTL 6 h. flight-data-spec §7.2: `flight_search_cache(provider, origin, destination, date, adults, currency, cabin, payload, fetched_at)` TTL 15–30 min. | Redenumită + coloane canonice (PK compusă); `date` = `date_from` al apelului range (payload-ul acoperă toată fereastra) — notat explicit în app-spec §2. | ✅ rezolvat în app-spec §2, §4 |
| 7 | medium | **Tabela `airports` + autocomplete.** app-spec vechi: cache provider lazy, TTL 30 zile, `is_eu`. flight-data-spec §7.1/§7.3: sursa = **OurAirports CSV** (schema `type/scheduled/lat/lon/source/updated_at`), refresh săptămânal (7 zile), autocomplete din Tequila `/locations/query` cache-uit 24 h cu fallback ILIKE pe tabel. | app-spec §2: `airports` după schema OurAirports + `airport_query_cache` (24 h); script `db/refresh-airports.ts` + cron săptămânal; `GET /api/airports` = cache 24 h → ILIKE → provider. | ✅ rezolvat în app-spec §2, §3 |
| 8 | medium | **Calea share-link-ului.** app-spec vechi: `/s/[slug]`. deploy-midspot §8 (lecția 9): share-link-ul este **`/r/<id>`**. | app-spec aliniat la `/r/[slug]` (pagină, robots, copy-link, §10). | ✅ rezolvat în app-spec §1, §3, §6, §7 |
| 9 | high | **Ads: EthicalAds/CarbonAds vs AdSense.** brief + app-spec vechi: EthicalAds/CarbonAds, `NEXT_PUBLIC_ADS_ENABLED`, `NEXT_PUBLIC_ETHICALADS_ID`. deploy-midspot §7 (declarată „sursa unică de adevăr" pt. env vars): **AdSense** — `NEXT_PUBLIC_ADSENSE_CLIENT` + `ADSENSE_SLOT_*`. | app-spec §8/§9 urmează deploy-midspot (AdSense, CSP cu domeniile pagead2/doubleclick). Dacă owner vrea EthicalAds, tabela din deploy-midspot §7 trebuie schimbată întâi. | ✅ rezolvat în app-spec §8, §9; ⚠️ ACTIUNE pentru owner/deploy — vezi #13 |
| 10 | high | **`DATABASE_URL` port.** app-spec vechi: exemplu `127.0.0.1:5432`. Realitate: cumsevoteaza-postgres ocupă 5432 (`cumsevoteaza/docker-compose.yml`); deploy-midspot §5: midspot-postgres pe **5433**. | app-spec §8: `postgres://midspot:…@127.0.0.1:5433/midspot`. | ✅ rezolvat în app-spec §8 |
| 11 | high | **Conflict port 3003.** sofronesti plan + global-constraints rezervă **3003 pentru `elena-web.service`** (verificat în repo). deploy-midspot header: dacă sofronesti ajunge primul pe box, se mută pe 3004 înainte de primul deploy midspot. | app-spec §8 + §10 Q12 menționează conflictul și rezoluția; midspot rămâne pe 3003 (`midspot-web.service`). | ✅ notat în app-spec; ⚠️ **ACTIUNE pentru owner** înainte de primul deploy — vezi #14 |
| 12 | medium | **Env vars lipsă în tabela deploy.** flight-data-spec §8 cere și `KIWI_TEQUILA_API_KEY`, `KIWI_TEQUILA_BASE_URL`, `TRAVELPAYOUTS_MARKER`, `TRAVELPAYOUTS_TRS`, `TRAVELPAYOUTS_SUB_ID`, `TRAVELPAYOUTS_KIWI_PROMO_ID`, `FLIGHTS_*`; deploy-midspot §7 are doar `TRAVELPAYOUTS_API_KEY` + `TRAVELPAYOUTS_MARKER` (+ `CRON_SECRET`). | app-spec §8 listează uniunea corectă; cele lipsă trebuie create în Infisical `midspot-prod`. | ⚠️ **ACTIUNE pentru deploy-midspot** — adaugă cheile lipsă în §4/§7 și în checklist |
| 13 | low | **AdSense vs EthicalAds — decizie de owner.** (legat de #9) | app-spec urmează AdSense (deploy-midspot = sursă de adevăr). | ⚠️ **ACTIUNE pentru owner** — confirmă AdSense sau cere schimbarea în deploy-midspot §7 |
| 14 | low | **Port 3003 — acțiune operațională.** (legat de #11) | Rezoluție conform deploy-midspot: sofronesti → 3004 dacă ajunge primul. | ⚠️ **ACTIUNE pentru owner** înainte de primul deploy midspot |
| 15 | low | **Lipsuri minore din app-spec vechi.** `next.config.ts` fără switch-ul standalone; fără `CRON_SECRET`; fără mențiunea `RAPIDAPI_KEY` șters; worker fără backoff pe 429 / `X-Rate-Limit-Remaining` (flight-data-spec §1.4/§2.3); validare origins 2–8 în loc de 2–6. | Toate adăugate: switch `STANDALONE_OUTPUT==="1" → standalone`, `CRON_SECRET` în tabela env, `RAPIDAPI_KEY` marcat șters, backoff exponential pe 429 + header-e `X-Rate-Limit-*` în worker (§4), origins 2–6 în validare. | ✅ rezolvat în app-spec §1, §3, §4, §7, §8 |
| 16 | info | **App-only env extras.** app-spec folosește `SEARCH_RETENTION_DAYS` (default 7) și `RATE_LIMIT_*` (240/5/30) cu default-uri în cod — nu sunt în cele două tabele canonice. | Păstrate ca default-uri în cod; override doar dacă sunt setate în Infisical. | ⚠️ **ACTIUNE pentru deploy-midspot** (opțional): adaugă-le în Infisical `midspot-prod` dacă vrem override fără rebuild |

## Verificări făcute împotriva realității din repo

- `cumsevoteaza/docker-compose.yml` → postgres pe **5432** ⇒ 5433 pentru midspot e corect (deploy-midspot §5 confirmat).
- sofronesti `2026-11-07-elena-alexa-site.md` linia 28 + `global-constraints.md` linia 24 → **3003 rezervat pentru `elena-web.service`**; conflictul e real, rezoluția din deploy-midspot e singura fezabilă.
- `ncm/.github/workflows/deploy-box.yml` + `mereya_star/.github/workflows/deploy-box.yml` există și sunt șablonul pentru workflow-ul midspot din deploy-midspot §6 (rsync prin `ssh.ncmihai.dev`, `STANDALONE_OUTPUT=1`, Infisical Viewer identity `github`).
- `bc250-monitor/server/bc250-stats.service` există (hardening pattern citat de deploy-midspot §3a).
- `cumsevoteaza/docs/deployment.md` — lecțiile 1–8 (cloudflared ::1, EnvironmentFile valori goale, dotenv single-quote, next/font/google, NEXT_PUBLIC baked, Vary, loopback absolut, zone-scoped cert.pem) sunt toate reflectate în app-spec §1/§8.

## Ce am modificat în `docs/app-spec.md` (rezumat)

1. §8: interfața provider rescrisă pe endpoint-urile Tequila reale (`/locations/query`, `/v2/search`, `one_for_city`, range de date, `utc_*` pentru gap, template `c111.travelpayouts.com/click` pentru afiliere); tabela env aliniată la uniunea deploy-midspot §7 + flight-data-spec §8 (inclusiv `DATABASE_URL` pe **5433**, `CRON_SECRET`, `RAPIDAPI_KEY` șters, AdSense).
2. §2/§3/§4/§5: cap-urile canonice (30 destinații, N≤6, fereastră ≤14 zile, K=10, concurență 8, TTL cache 1800 s, autocomplete 24 h, OurAirports 7 zile); tabela `flight_search_cache` cu PK compusă canonicală; `airports` după schema OurAirports + `airport_query_cache`; algoritm în două faze cu worst-case **84/126** apeluri; gap din `utc_arrival`; validare origins 2–6.
3. §1/§3/§6/§7: share path **`/r/[slug]`**; robots `/r/` + `/api/`; switch-ul `STANDALONE_OUTPUT` în `next.config.ts`; script `airports:refresh`.
4. §4: backoff exponential pe 429 + `X-Rate-Limit-Remaining/Reset` în worker.
5. §8/§9/§10: AdSense în loc de EthicalAds/CarbonAds; conflictul de port 3003 cu sofronesti documentat (Q12); întrebările actualizate.

## Rămase pentru alții

- **ACTIUNE pentru deploy-midspot (#12, #16):** adaugă în Infisical `midspot-prod` și în §4/§7 cheile lipsă: `KIWI_TEQUILA_API_KEY`, `KIWI_TEQUILA_BASE_URL`, `FLIGHTS_PROVIDER`, `TRAVELPAYOUTS_TRS`, `TRAVELPAYOUTS_SUB_ID`, `TRAVELPAYOUTS_KIWI_PROMO_ID`, `FLIGHTS_*` (și opțional `SEARCH_RETENTION_DAYS`, `RATE_LIMIT_*`).
- **ACTIUNE pentru owner (#13):** confirmă AdSense (urmărit de app-spec) sau alege EthicalAds — atunci deploy-midspot §7 trebuie modificat înainte de implementare.
- **ACTIUNE pentru owner (#14):** rezolvă conflictul de port 3003 cu sofronesti înainte de primul deploy midspot (sofronesti → 3004 dacă ajunge primul).
- **ACTIUNE pentru flight-data (info, opțional):** nimic blocant; dacă vrea, poate nota în §7.2 că app-ul folosește `date = date_from` ca parte a cheii de cache pentru apelurile range (decizia e deja în app-spec §2).

**Total pass 1: 16 findings — 12 rezolvate de mine în `app-spec.md`, 4 acțiuni pentru alții (2 deploy-midspot, 2 owner), 0 blocante rămase pe app-spec.**

---

## Pass 2 — după ce colegii și-au rulat propriile review-uri

Am re-citit `flight-data-spec.md` și `deploy-midspot.md` **în versiunea curentă** (au fost editate
între timp de `review-flights-researcher.md` și `review-infra-architect.md`) și am re-aliniat
`app-spec.md` la valorile reconiliate. Diferențe noi găsite și rezoluții:

| # | Neconcordanță (referințe) | Decizie | Status |
|---|---|---|---|
| 17 | **Concurență: 8 vs 4.** flight-data-spec §8 original zicea `FLIGHTS_MAX_CONCURRENCY=8` (banda 5–10 în §7.3); după reconcilierea colegului, §7.3+§8 curente zic **4** („sub 8 ca să nu izbim în limitele per-minut Travelpayouts / 429 Tequila"). deploy-midspot §7c încă zice `8` + „§7.3: 5–10” — **stale**. | Urmez flight-data-spec §7.3/§8 reconciheat: **4** în app-spec §4/§5/§8. | ✅ rezolvat în app-spec; ⚠️ **ACTIUNE pentru infra-architect** — deploy-midspot §7c rândul `FLIGHTS_MAX_CONCURRENCY` să devină `4` |
| 18 | **Călători: 6 vs 8.** flight-data-spec §8 vechi: `FLIGHTS_MAX_TRAVELERS=6`; după reconciliere: **`FLIGHTS_MAX_ORIGINS=8`** (origini 2–8, câte 1 adult/origine). deploy-midspot §7c încă zice `FLIGHTS_MAX_TRAVELERS=6` — **stale**. | Urmez flight-data-spec: `FLIGHTS_MAX_ORIGINS=8`, validare origins 2–8 în app-spec §2/§3/§7/§8/§10. | ✅ rezolvat în app-spec; ⚠️ **ACTIUNE pentru infra-architect** — deploy-midspot §7c să redenumească în `FLIGHTS_MAX_ORIGINS=8` |
| 19 | **Ads: AdSense vs EthicalAds/CarbonAds.** În pass 1 am urmat deploy-midspot §7 vechi (AdSense). infra-architect a schimbat între timp deploy-midspot §4/§7 la **EthicalAds primar + CarbonAds fallback** cu `NEXT_PUBLIC_ADS_ENABLED`, `NEXT_PUBLIC_ETHICALADS_ID`, `NEXT_PUBLIC_CARBONADS_SERVE_ID` (CSP pe `cdn.ethicalads.io`/`cdn.carbonads.com`) — adică decizia din brief-ul original. | app-spec §8/§9/§7 (CSP) re-aliniate la **EthicalAds + CarbonAds** cu cele 3 env vars canonice. AdSense dispare complet. | ✅ rezolvat în app-spec; decizia finală rămâne la owner (§10 Q8) |
| 20 | **Schema tabelelor: am redenumit eu `flight_cache`→`flight_search_cache` + `airport_query_cache` în pass 1; flight-data-spec §7.2 curent declară canonicală schema **app-spec §2 originală** (`airports` cu `is_eu`/`kind`/`search_text` TTL 30 zile lazy; `flight_cache` cu `cache_key=sha256(provider\|origin\|dest\|date\|adults\|currency)`), autocomplete cache-uit prin upsert în `airports`, fallback ILIKE; plus cron sursă OurAirports 7 zile separat de TTL-ul rândurilor 30 zile. | Am revertit în app-spec §2 la schema canonicală: `flight_cache(cache_key…)`, `airports(is_eu, kind, search_text trgm, fetched_at, AIRPORT_CACHE_TTL_DAYS=30)`, fără tabel separat de autocomplete; păstrat `db/refresh-airports.ts` ca cron sursă 7 zile (infra), diferit intenționat de TTL-ul rândurilor. | ✅ rezolvat în app-spec §2/§3/§4 |
| 21 | **Worst-case apeluri.** flight-data-spec §7.3 curent (canonical): cu range-collapse (`date_from/date_to` + `one_per_date=1` = 1 apel per (origine, destinație, direcție) pe toată fereastra) worst-case cold = **\|C\|×\|O\|×2 = 30×8×2 = 480 apeluri** (~2–4 min la concurență 4), nu 6720. | app-spec §5 rescris: faza 1 = N apeluri `fly_to=<C>&one_for_city=1`; faza 2 = 2·N·K range calls cu `one_per_date=1`; worst-case 480 canonical, 168 cu pruning top-K (8+2·8·10); relaxarea 30 h = 0 apeluri. | ✅ rezolvat în app-spec §5 |
| 22 | **Share path ambiguu în deploy-midspot:** §7a linia ~388 zice `/s/<slug>`, lecția 9 zice `/r/<id>`. | app-spec păstrează **`/r/[slug]`** (lecția 9 e propoziția de design explicită). | ✅ păstrat în app-spec; ⚠️ **ACTIUNE pentru infra-architect** — armonizare `/s/<slug>` din §7a cu `/r/<id>` din lecția 9 |

**Total general: 22 findings — 18 rezolvate de mine în `app-spec.md`, 4 acțiuni pentru alții
(3 infra-architect: §7c concurență/travelers stale + armonizare share path; 1 owner: conflict port
3003 / decizii Q8). 0 blocante rămase pe app-spec.**
