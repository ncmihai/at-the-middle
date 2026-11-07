# midspot — Flight Data API Spec

- **Proiect:** midspot (`midspot.ncmihai.dev`, port 3003, Next.js 16 standalone + Postgres self-hosted pe BC250). *Nota infra:* portul 3003 e revendicat și de planul sofronesti (`elena-web.service`, vezi `sofronesti/docs/superpowers/plans/2026-11-07-elena-alexa-site.md` linia 28) — rezoluția e în `deploy-midspot.md` (unul dintre cele două trece pe 3004 înainte de primul deploy); Postgres midspot e pe **127.0.0.1:5433** (5432 e ocupat pe box).
- **Data research-ului:** 2026-11-07 (toate URL-urile citate au fost verificate la aceasta data)
- **Caz de uzare:** N calatori (start 2) din orase diferite din Europa introduc locatia de acasa + o fereastra de date + durata (nopti) + buget/persoana (EUR). midspot gaseste destinatii "la mijloc": pentru fiecare destinatie candidata cauta zboruri one-way pentru fiecare calator si rank-uieste combinatiile unde (a) pretul/persoana e in buget si (b) **gap-ul de sosire** (max sosire − min sosire, din timestamp-urile reale ale itinerariilor) este ≤ 24h, relaxat automat la 30h daca nu gaseste nimic.
- **Monetizare:** reclame ne-intrusive + linkuri afiliate (userul cumpara la ACELASI pret pe Kiwi/Skyscanner).
- **Regula repo:** acest fisier e nou, in `docs/`; nu s-a modificat cod existent.

---

## 0. Recomandare pe scurt

| Rol | Provider | De ce |
|---|---|---|
| **MVP — sursa principala de date** | **Kiwi Tequila `/v2/search` + `/locations`** (programul Kiwi.com din Travelpayouts) | Singurul provider care returneaza itinerarii reale one-way cu `local_departure`/`local_arrival`/`utc_departure`/`utc_arrival` + `price` + `deep_link` per itinerariu — exact ce ne trebuie pentru gap-ul de sosire. Acopera LCC-urile din Europa (virtual interlining). Deep link-ul catre kiwi.com poate fi impachetat cu marker-ul Travelpayouts, iar pretul pentru user ramane identic (comision 3% platit de Kiwi). |
| **MVP — disponibil imediat, fara gate** | **Travelpayouts Data API (Aviasales Data API)** `api.travelpayouts.com` cu token de partner | Orice partener Travelpayouts il primeste la `travelpayouts.com/developers/api`. Date cache-uite (ultimele ~48h) — bun pentru **rank-uirea initiala a oraselor candidate** (`/v1/prices/cheap`, `/v3/get_popular_directions`, `/v1/city-directions`), nu pentru itinerarii cu ore reale. |
| **MVP — monetizare (linkuri)** | **Travelpayouts affiliate deep links** (Kiwi `promo_id=3791`; Skyscanner via Tools→Links) | Disponibil imediat dupa join la program, fara MAU gate. Format documentat mai jos (§4). |
| **Dev — sandbox** | **Duffel test mode** (gratuit) + fallback **SerpApi free tier** (250 cautari/luna) | Amadeus Self-Service **a fost decommissionat pe 2026-07-17** (vezi §3.4) — nu mai exista sandbox gratuit Amadeus. Duffel test mode e acum sandbox-ul practic pentru dev. |
| **Optiuni viitoare** | Duffel productie; Aviasales Flight Search API real-time (la ≥50k MAU); SerpApi Google Flights (ultim fallback); Amadeus Enterprise/AQC | Vezi §3, §5, §6. |

**Provider abstraction obligatorie:** toata logica de cautare zboruri sta in spatele unui adapter `FLIGHTS_PROVIDER ∈ {tequila, travelpayouts-data, duffel, serpapi, amadeus}` (env var), pentru ca accesul Tequila/Kiwi API are gate (vezi riscuri §8).

**Aliniere cu `app-spec.md` (interfața canonică `lib/flights/provider.ts`).** Indiferent de provider, aplicația apelează doar:
`searchAirports(query) → AirportSuggestion[] {iata, name, city, country, countryCode}`;
`searchOneWay(origin, dest, date /*YYYY-MM-DD*/, adults) → FlightOption[] {flightNumber, departLocal, arriveLocal (ISO cu offset), durationMinutes, priceEur, bookingUrl}`;
`affiliateLink({origin, dest, date, returnDate?, adults}) → string`.
Mapping-ul exact către aceste tipuri este în §1.2 (mai jos). **Semantica round-trip** (decisă în app-spec §5): pentru fiecare (origine, destinație, zi de plecare `t`) se caută **outbound** `o→d` pe `t` și **return** `d→o` pe `t+nights` (ambele prin `searchOneWay`); prețul per persoană = outbound ales + cel mai ieftin return; **gap-ul de sosire se calculează DOAR din sosirile outbound**, convertite în UTC (`arriveLocal` cu offset → ms UTC; la Tequila echivalent direct `utc_arrival` epoch). Relaxare 24h → 30h doar pe componenta de gap, fără apeluri noi (datele sunt deja în cache).

---

## 1. Kiwi Tequila API via Travelpayouts

### 1.1 Cum obtii cheia API

- Cont pe **Travelpayouts** → conectezi programul **Kiwi.com** → pentru API-ul Kiwi (Tequila) Travelpayouts cere ca proiectul sa aiba **≥ 50.000 MAU**; altfel folosesti doar Data API (vezi §1.5) si linkurile afiliate.
  - Doc: https://support.travelpayouts.com/hc/en-us/articles/360019237899-Kiwi-com-affiliate-program-API ("To access the API, your Project must have at least 50,000 MAU")
- Alternativ direct la Kiwi: portal **Tequila** https://tequila.kiwi.com/ — **din mai 2024 inregistrarea self-serve e inchisa (invite-only)**; contact `affiliates@kiwi.com`. Vezi https://www.vervotech.com/hub/integrations/kiwi-com-api/ si https://flightpowers.com/compare/kiwi-tequila.
- Cheia Tequila (la parteneri existenti): cont Tequila → *My applications* → *+ Add application* → cheia din sectiunea *Detail*. Vezi https://kiwicom.github.io/margarita/docs/guide-tequila-api-key (repo-ul open-source de referinta Kiwi: https://kiwicom.github.io/margarita/docs/tequila-api).
- **Header de auth pentru fiecare apel: `apikey: <CHEIE>`** (eroare `400 {"message":"Use 'apikey' in header"}` daca lipseste). TLS 1.2+ obligatoriu.
- **Base URL:** `https://tequila-api.kiwi.com/` (in unele exemple vechi si `https://api.tequila.kiwi.com/`). Răspunsurile sunt **G-zip** (`Content-Encoding: gzip`) — cere `Accept-Encoding: gzip`.

### 1.2 Endpoint-uri de care avem nevoie

Spec-ul complet (mirror oficial pastrat de Travelpayouts): https://support.travelpayouts.com/hc/en-us/articles/360019237899-Kiwi-com-affiliate-program-API ; doc-ul Kiwi: https://tequila.kiwi.com/docs/tequila_api/search_api si `/locations_api` (acum in spatele login-ului).

#### a) Autocomplete locatii — `GET /locations/query`

```
GET https://tequila-api.kiwi.com/locations/query?term=PRG&location_types=airport&location_types=city&limit=10&active_only=true&sort=name&locale=en-US
Headers: apikey: $KIWI_TEQUILA_API_KEY
```

- Parametri: `apikey` (required), `term` (required; IATA complet sau fragment de nume), `locale` (en-US etc.), `location_types` (repetabil: `airport`, `city`, `station`, `bus_station`, `country`, `region`, `continent`, `subdivision`, `autonomous_territory`), `limit` (default 10), `active_only` (default true), `sort` (`name` / `-name`).
- Alte endpoint-uri locations utile: `GET /locations/radius?lat=..&lon=..&radius=..`, `GET /locations/box?...`, `GET /locations/subentity?type=subentity&term=london_gb` (toate aeroporturile dintr-un oras).
- Raspuns: `{"locations":[{ "id":"LCY", "code":"LCY", "name":"London City Airport", "timezone":"Europe/London", "city":{"id":"london_gb","name":"London","code":"LON","country":{"code":"GB"}}, ...}], "meta":{...}}`
- Pentru midspot: la input-ul userului apelam `/locations/query?term=<text>&location_types=airport&location_types=city`; alegem `code` (IATA) sau `city.code` pentru cautari. Rezultatele se cache-uiesc 24h (vezi §7).

#### b) Cautare zbor one-way — `GET /v2/search`

```
GET https://tequila-api.kiwi.com/v2/search
  ?fly_from=OTP
  &fly_to=BCN,LIS,MAD,PRG          (lista de coduri, vezi one_for_city mai jos)
  &date_from=05/12/2026&date_to=12/12/2026   (format dd/mm/YYYY, interval de plecare)
  &flight_type=oneway              (sau omiti return_from/return_to/nights_in_dst_*)
  &adults=1&curr=EUR
  &selected_cabins=economy
  &one_per_date=1                  (cel mai ieftin zbor per fiecare zi din interval — doar one-way)
  &sort=price&limit=200            (limit max 200)
Headers: apikey: $KIWI_TEQUILA_API_KEY
```

- Parametri relevanti (din spec): `fly_from` (required; accepta IATA, coduri de oras/metropola, coduri de tara pe 2 litere, `city:DUS`, `airport:DUS`, radius `lat-lon-xkm`, valori multiple separate prin virgula), `fly_to` (la fel; **daca lipseste returneaza rezultate agregate pentru cateva aeroporturi**), `date_from`/`date_to` (required, `dd/mm/YYYY`, interval pentru plecare), `return_from`/`return_to`, `nights_in_dst_from`/`nights_in_dst_to`, `flight_type` = `round`|`oneway`, `adults` (default 1), `children`, `infants`, `curr` (valuta raspunsului, ex. `EUR`), `selected_cabins` (`economy`, `premium_economy`, `business`, `first`), `one_per_date` (0/1 — doar one-way), `one_for_city` (0/1 — cu `fly_to` multiplu returneaza cel mai ieftin zbor **per fiecare oras**), `max_stopovers`, `max_fly_duration` (ore), `vehicle_type` (default `aircraft`), `sort` = `quality` (default) | `price` | `date` | `duration` (+ `asc`/`desc`), `limit` (max 200), `locale`, `market`.
- **Campuri raspuns pe itinerariu** (`data[]`): `id`, `price` (in valuta `curr`), `conversion` (ex. `{"EUR": 123}`), `booking_token`, `deep_link` (link kiwi.com catre itinerariu, **fara marker** — il impachetam noi, vezi §4), `duration: {departure, return, total}` (secunde), `flyFrom`, `flyTo`, `cityFrom`, `cityTo`, `countryFrom`, `countryTo`, `distance`, `airlines`, `route[]` (fiecare segment: `flyFrom`, `flyTo`, `local_departure`, `local_arrival` (ISO 8601 cu offset), `utc_departure`, `utc_arrival` (**epoch secunde**), `duration`, `airline`, `flight_no`, `vehicle_type`), plus la nivel de itinerariu: **`local_departure`, `local_arrival`** (ISO cu offset, locale) si **`utc_departure`, `utc_arrival`** (epoch). Top-level: `search_id`, `status`, `currency`, `data`, `all_stopover_data`.
- **Mapping pentru midspot:** `departure_ts = utc_departure` (epoch), `arrival_ts = utc_arrival` (epoch) → gap de sosire se calculeaza in UTC (evitam DST); `local_departure`/`local_arrival` doar pentru afisare; `price_eur = price` cu `curr=EUR` (sau `conversion.EUR`); `duration_min = duration.total/60`; `booking_link = deep_link` (de impachetat cu afiliat).

#### Mapping către `FlightProvider` (app-spec §8) — tabel canonic

| Interfață app | Apel Tequila | Mapping răspuns → tip aplicație |
|---|---|---|
| `searchAirports(q)` | `GET /locations/query?term=q&location_types=airport&location_types=city&limit=8&active_only=true&locale=en-US` + `apikey` | `locations[]` → `AirportSuggestion{iata: code, name, city: city.name, country: city.country.name, countryCode: city.country.code}`; se cache-uiește în tabelul `airports` (schema app-spec §2, TTL 30 zile) |
| `searchOneWay(origin, dest, date, adults)` | `GET /v2/search?fly_from={origin}&fly_to={dest}&date_from={dd/mm/yyyy}&date_to={dd/mm/yyyy}&flight_type=oneway&adults={adults}&curr=EUR&selected_cabins=economy&sort=price&limit=200&one_per_date=1` + `apikey` (data `YYYY-MM-DD` se converteste în `dd/mm/YYYY`) | fiecare element din `data[]` → `FlightOption{flightNumber: route[0].airline + ' ' + route[0].flight_no, departLocal: local_departure, arriveLocal: local_arrival, durationMinutes: duration.total/60, priceEur: price (curr=EUR) sau conversion.EUR, bookingUrl: affiliateLink(...)}`; pt. acoperirea întregii ferestre dintr-un apel: `date_from`/`date_to` = capetele ferestrei + `one_per_date=1` (un itinerariu per zi) |
| `affiliateLink({origin, dest, date, returnDate?, adults})` | — (nu e apel API; se construiește local) | template §4: `https://c111.travelpayouts.com/click?shmarker={TRAVELPAYOUTS_MARKER}.{TRAVELPAYOUTS_SUB_ID}&promo_id=3791&source_type=customlink&type=click&custom_url={encodeURIComponent('https://www.kiwi.com/deep?from='+origin+'&to='+dest+'&departure='+date (+ '&return='+returnDate) )}`. **Nota:** template-ul `/deep` kiwi.com nu are parametrul `adults` — la MVP fiecare călător rezerva câte un bilet (adults=1 per link). |

**Important (decizie cross-review):** Travelpayouts Data API NU poate implementa `searchOneWay` fidel (date cache-uite ~48h, agregate pe rută+zi, **fără ore de plecare/sosire per itinerariu**) — vezi §1.5. Deci `FLIGHTS_PROVIDER=tequila` este default-ul pentru `searchOneWay`/`searchAirports`; Travelpayouts rămâne pentru **affiliateLink** (marker) indiferent de providerul de căutare, și ca helper opțional de ranking a candidaților (`travelpayouts-data`).

**Exemplu apel minim:** `https://tequila-api.kiwi.com/v2/search?fly_from=LGA&fly_to=MIA&date_from=01/04/2021&date_to=02/04/2021` (din spec).

### 1.3 Exista cautare "anywhere" (inspiration) in Tequila?

**Nu exista un endpoint documentat de tip "anywhere" in `/v2/search`.** Comportament documentat: daca `fly_to` lipseste, primesti "aggregated results for some airports" (un esantion agregat, nu lista completa). Pe site-ul kiwi.com, deep link-ul `https://www.kiwi.com/deep?from=FCO&to=anywhere&departure=...` **functioneaza** (vezi §4), dar asta e doar link catre UI, nu API.

**Truc pentru noi:** `fly_to` accepta **lista separata prin virgula** + `one_for_city=1` → un singur apel returneaza cel mai ieftin zbor **per fiecare oras** din lista. Deci "cele mai ieftine destinatii dintr-o origine" = 1 apel cu `fly_to=<30 coduri>` + `one_for_city=1`.

**Fallback (recomandat in spec):** lista curata de aeroporturi UE din OurAirports CSV (vezi §7.3) — cache-uită, folosită ca set de candidati; nu depindem de un endpoint "anywhere".

### 1.4 Rate limits si termeni

- Tequila: la depasirea limitelor de plan → **HTTP 429**; limitele exacte sunt per-plan si sunt afisate in documentatia din portalul partenerului (https://tequila.kiwi.com/portal/docs). Recomandare: coada cu limiter + backoff exponential pe 429. (Inainte de inchiderea self-serve, planul gratuit era utilitar; termenii actuali sunt per parteneriat — nu te baza pe ei, vezi §8.)
- **Travelpayouts Data API** (vezi §1.5) are limite **explicite per minut** (tabel oficial, vezi §2.3): ex. `/v1/prices/cheap` 300/min, `/v2/prices/latest` 300/min, `/v3/grouped_prices` 600/min, `/v2/prices/week-matrix` 60/min, statistica 30/min. La depasire → 429, bloc pana la sfarsitul minutului, deblocare automata; header-e `X-Rate-Limit`, `X-Rate-Limit-Remaining`, `X-Rate-Limit-Reset`.
  Doc: https://support.travelpayouts.com/hc/en-us/articles/4402565416594-API-rate-limits

### 1.5 Travelpayouts Data API (Aviasales) — disponibil oricarui partener, fara MAU gate

- Token: https://www.travelpayouts.com/developers/api → se trimite ca header **`X-Access-Token`** sau parametrul `?token=`.
- Base: `http://api.travelpayouts.com/...` (ex. `/v2/prices/latest`, `/v2/prices/month-matrix`, `/v1/prices/cheap`, `/v1/prices/direct`, `/v1/city-directions`, `/aviasales/v3/get_popular_directions`, `/aviasales/v3/get_special_offers`).
- Răspuns standard: `{"success":true,"data":[...],"error":null}`; datele in UTC ISO 8601; preturile in valuta ceruta (default RUB). **Datele sunt din cache (ultimele ~48h)** — doc oficial: https://travelpayouts-data-api.readthedocs.io/en/latest/ si https://support.travelpayouts.com/hc/en-us/articles/203956163-Aviasales-Data-API
- Exemplu: `GET http://api.travelpayouts.com/v2/prices/latest?currency=eur&origin=OTP&destination=BCN&one_way=true&limit=30&sorting=price&token=$TRAVELPAYOUTS_API_KEY` → campuri: `origin`, `destination`, `depart_date`, `return_date`, `number_of_changes`, `value`, `found_at`, `distance`, `actual`. **Atentie:** nu are ore de plecare/sosire per itinerariu — doar pret agregat pe ruta+data; il folosim doar pentru rank-uirea candidatilor, nu pentru gap.
- **Aviasales Flight Search API real-time** (viitor): `POST https://tickets-api.travelpayouts.com/search/affiliate/start` cu header-e `x-signature`, `x-affiliate-user-id`, `x-user-ip`, `marker` in body → `search_id` → results; linkul de rezultate valabil 15 min; **gate: proiect ≥ 50.000 MAU, default 100 req/h per IP**. Doc: https://support.travelpayouts.com/hc/en-us/articles/30565016140434-Aviasales-Flight-Search-API-real-time-and-multi-city-search

---

## 2. Travelpayouts — affiliate deep links (monetizare)

### 2.1 Kiwi.com — format exact (documentat oficial)

Doc: https://support.travelpayouts.com/hc/en-us/articles/360010109719-Kiwi-com-affiliate-links

1. **Brand deep link** catre cautarea kiwi.com:
   `https://www.kiwi.com/deep?from=FCO&to=BOS&departure=2026-12-05&return=2026-12-13`
   - `from` = IATA plecare, `to` = IATA destinatie (**`to=anywhere` = toate zborurile de la plecare**), `departure` = data `YYYY-MM-DD`, `return` optional (daca lipseste → one-way).
   - **Doar linkurile care contin `/deep` sunt luate in statistici** — fara `deep` nu se atribuie comision.
2. URL-encodezi linkul si il pui intr-un template Travelpayouts:

```
https://c111.travelpayouts.com/click?shmarker={PARTNER_ID}.{SUB_ID}&promo_id=3791&source_type=customlink&type=click&custom_url={url-encoded kiwi deep link}
```

**Exemplu concret** (din documentatie, `78606` = partner ID, `kiwicom` = SubID):

```
https://c111.travelpayouts.com/click?shmarker=78606.kiwicom&promo_id=3791&source_type=customlink&type=click&custom_url=https%3A%2F%2Fwww.kiwi.com%2Fdeep%3Ffrom%3DFCO%26to%3DBOS%26departure%3D2026-12-05
```

- `promo_id=3791` = programul Kiwi.com.
- **Marker-ul** = `shmarker={PARTNER_ID}.{SUB_ID}` — PARTNER_ID il gasesti in contul Travelpayouts (Profile / proiect), SUB_ID e optional, il setam noi per pozitie (ex. `midspot_result_1`) pentru statistici. In dashboard se vede si ca `marker` (numar) folosit de Links API.
- **Pretul ramane identic pentru user**: linkul afiliat nu modifica pretul; Kiwi plateste comisia (**3% din rezervarile confirmate**) din propriul marja. Sursa: https://www.travelpayouts.com/blog/kiwi-com-affiliate-program/ ("earn a 3% commission with every confirmed booking").
- Pentru noi (one-way, per calator, per destinatie): `https://www.kiwi.com/deep?from={ORIGIN}&to={DEST}&departure={YYYY-MM-DD}`.
- **Kiwi.com NU poate fi convertit prin Links API** (e pe lista de excluderi) — doar cu template-ul manual de mai sus. Doc Links API: https://support.travelpayouts.com/hc/en-us/articles/25289759198226-API-for-Travelpayouts-partner-links

### 2.2 Links API (pentru celelalte branduri, ex. Skyscanner)

- `POST https://api.travelpayouts.com/links/v1/create`, header `X-Access-Token: <token>`, body:
  `{"trs": <PROJECT_ID>, "marker": <PARTNER_ID>, "shorten": false, "links": [{"url": "<brand URL complet>", "sub_id": "midspot"}]}` (max 10 linkuri/apel).
- Raspuns: `result.links[].partner_url`.
- Limite: **max 100 req/min per marker**, max 10 linkuri/req, doar linkuri lungi (nu short). Kiwi.com e exclus (vezi 2.1).
- Pentru **Skyscanner**: programul exista in Travelpayouts; se creaza deep link din dashboard **Tools → Links** (lipesti URL-ul de cautare skyscanner, ex. `https://www.skyscanner.net/transport/flights/otp/bcn/261205/...`), optional SubID. Doc generic: https://support.travelpayouts.com/hc/en-us/articles/360027634052-How-to-create-an-affiliate-link-to-any-page-on-the-brand-s-website ; programul Skyscanner: https://www.partners.skyscanner.net/product/affiliates (si varianta Travelpayouts: https://www.travelpayouts.com/blog/skyscanner-flights-api/).

### 2.3 Rate limits Travelpayouts (oficial)

Tabel per-minut (din 14.06.2024): `/v1/prices/calendar` 300, `/v1/prices/cheap` 300, `/v1/prices/direct` 180, `/v1/prices/monthly` 60, `/v1/city-directions` 600, `/v2/prices/latest` 300, `/v2/prices/month-matrix` 300, `/v2/prices/nearest-places-matrix` 60, `/v2/prices/week-matrix` 60, `/v2/prices/special-offers` 600, `/data/*.json` 600, `/v3/*` 300–600, `/statistics/v1/execute_query` 30, `/graphql/v1/` 60. Peste limita → **429**, bloc pana la resetul minutului, auto-deblocare; header-e `X-Rate-Limit`, `X-Rate-Limit-Remaining`, `X-Rate-Limit-Reset`. Links API: 100 req/min per marker.
Doc: https://support.travelpayouts.com/hc/en-us/articles/4402565416594-API-rate-limits

---

## 3. Amadeus (alternativa pentru dev / istoric)

### 3.1 STATUS CRITIC (verificat 2026-11-07)

**Portalul Amadeus for Developers Self-Service a fost decommissionat pe 17 iulie 2026** — banner pe https://developers.amadeus.com/: „Amadeus for Developers self-service portal has been decommissioned on July 17th, this website is for Amadeus Enterprise API Portal only”. Acum exista doar **Enterprise API Portal** (acces prin vanzari / AQC). Vezi si https://airlabs.co/amadeus-self-service-api-shutdown si https://www.tripgic.com/playbook/amadeus-api-shutdown-migration/.

### 3.2 Ce oferea Self-Service (pentru referinta si pentru migrare Enterprise)

- **Mediul de test gratuit** `https://test.api.amadeus.com` cu date realiste dar subset (ex. LON, NYC, MAD, PAR; „try big cities/airports like LON or NYC”), OAuth2 `client_credentials` → `access_token` (POST /v1/security/oauth2/token). Productie: `https://api.amadeus.com`.
- **Autocomplete locatii:** `GET /v1/reference-data/locations?keyword=MUC&subType=AIRPORT,CITY&countryCode=DE` → `data[]` cu `iataCode`, `geoCode{latitude,longitude}`, `address{cityCode,countryCode}`, `timeZoneOffset`.
- **Flight Inspiration Search („anywhere”)**: `GET /v1/shopping/flight-destinations?origin=MAD&departureDate=2026-12-05&oneWay=true&viewBy=PRICE&maxPrice=200&currency=EUR` — **acesta este endpoint-ul de inspiration search**: intoarce destinatii dintr-o origine, sortate dupa pret, filtrate dupa `departureDate`, `oneWay`, `duration`, `nonStop`, `maxPrice`, `viewBy` (PRICE/DURATION/DESTINATION). Intoarce **preturi cache-uite (actualizate zilnic)**, „trending” — apoi confirmi cu Flight Offers Search. Doc: https://amadeus4dev.github.io/developer-guides/resources/flights/
- **Flight Offers Search**: `GET /v2/shopping/flight-offers?originLocationCode=MAD&destinationLocationCode=ATH&departureDate=2026-12-05&adults=1&currencyCode=EUR&max=50&nonStop=false` (sau POST cu body pentru cautari avansate). Raspuns: `data[]` cu `itineraries[].segments[]` — fiecare segment are `departure.at` / `arrival.at` (ISO local + `departure.iataCode`/`arrival.iataCode`), `duration`, `carrierCode`; pret: `price.total`, `price.grandTotal`, `price.currency`; `travelerPricings`.
- **Rate limits (self-service, istoric):** 10 TPS test / 40 TPS productie; in plus cotele lunare gratuite per API in productie, peste care se plateste pay-as-you-go per apel (vezi §3.3). Sursa: https://phptravels.com/blog/amadeus-self-service-rest-api-vs-enterprise-rest-api
- SDK-uri oficiale (cod ramas disponibil): https://github.com/amadeus4dev/amadeus-node , https://github.com/amadeus4dev/amadeus-python ; ghiduri: https://amadeus4dev.github.io/developer-guides/resources/flights/

### 3.3 Preturi in productie (self-service, pana la decommissionare)

Model **free-quota lunara + pay-as-you-go** per API: „in the production environment, you will only be charged for API calls that exceed the monthly free limit” — cost per apel de la fractiuni de cent pana la cativa centi, in functie de API. Pagini: https://developers.amadeus.com/pricing ; rezumat: https://phptravels.com/blog/amadeus-self-service-rest-api-vs-enterprise-rest-api . In productie Self-Service, rezervarile (Flight Create Orders) necesitau contract cu un consolidator de bilete.

### 3.4 Concluzie pentru midspot

Amadeus Self-Service **nu mai poate fi folosit acum** (portal inchis). Pentru dev folosim **Duffel test mode** (§5) sau **SerpApi free** (§6). Amadeus ramane optiune viitoare doar prin **Enterprise API Portal / AQC** (contract, pret negociat) — acelasi endpoint-uri de mai sus.

---

## 4. Format deep-link afiliat (rezumat operational)

Pentru fiecare itinerariu afisat, butonul „Rezerva pe Kiwi”:

```
brand  = https://www.kiwi.com/deep?from={ORIGIN_IATA}&to={DEST_IATA}&departure={YYYY-MM-DD}
affil  = https://c111.travelpayouts.com/click?shmarker={TRAVELPAYOUTS_MARKER}.{SUB_ID}&promo_id=3791&source_type=customlink&type=click&custom_url={encodeURIComponent(brand)}
```

Exemplu: brand URL `https://www.kiwi.com/deep?from=OTP&to=BCN&departure=2026-12-05`, `shmarker=123456.midspot_r1` →
`https://c111.travelpayouts.com/click?shmarker=123456.midspot_r1&promo_id=3791&source_type=customlink&type=click&custom_url=https%3A%2F%2Fwww.kiwi.com%2Fdeep%3Ffrom%3DOTP%26to%3DBCN%26departure%3D2026-12-05`

In cod: `custom_url = encodeURIComponent(brand)` — ex. `https://www.kiwi.com/deep?from=OTP&to=BCN&departure=2026-12-05` devine `https%3A%2F%2Fwww.kiwi.com%2Fdeep%3Ffrom%3DOTP%26to%3DBCN%26departure%3D2026-12-05` ( fara spatii; `&` -> `%26`).

- `deep_link` venit din raspunsul Tequila poate fi folosit ca `custom_url` direct (contine deja parametrii), dar **trebuie verificat ca incepe cu `https://www.kiwi.com/deep`**; altfel construim noi brand URL-ul de mai sus. Doar URL-urile cu `/deep` sunt atribuite.
- Daca `FLIGHTS_PROVIDER != tequila` (ex. Duffel/SerpApi), construim manual brand URL-ul kiwi.com/deep (sus) — pretul afisat de noi vine din API, iar userul vede pe kiwi.com pretul real la momentul click-ului; comisia ramane a noastra prin marker.
- Skyscanner: link creat prin Travelpayouts Tools→Links (sau Links API cu `trs` Skyscanner) pornind de la URL-ul de cautare skyscanner.
- **Pret identic pentru user**: comisia (3% Kiwi) e platita de brand, nu se adauga la pret.

---

## 5. Duffel (optiune viitoare)

- **Preturi (duffel.com/pricing, verificat 2026-11):** `$3.00 per confirmed order`; Managed Content `1% din valoarea comenzii`; `$2.00 per ancillary platit`; **„excess search fee” `$0.005 per cautare` doar daca depasesti raportul 1500:1 cautari/comenzi** (ex: 10 comenzi → 15.000 cautari gratis; 25.000 cautari → `(25000-15000)*$0.005 = $50`); FX 2%. **Cautarea in sine e gratuita in productie cat timp mentii raportul** (si gratuita nelimitat in test mode). Nu exista „fee per segment la emitere” in modelul curent — taxa e per order ($3.00) + managed content 1%.
- **Capabilitati:** `POST https://api.duffel.com/air/offer_requests` (Bearer token; test mode gratuit) cu body `{"slices":[{"origin":"OTP","destination":"BCN","departure_date":"2026-12-05"}], "passengers":[{"type":"adult"}], "cabin_class":"economy"}` → `offers[]` cu `slices[].segments[]` fiecare avand `departure.at`/`arrival.at` (ISO + IATA), `duration`, `operating_carrier`; pret `total_amount`/`total_currency`. Doc: https://duffel.com/docs/api/v2/offer-requests , `/partial-offer-requests`, `/batch-offer-requests`, `/offers`. Exista si `supplier_timeout` (default 20s).
- **„Anywhere”: NU exista cautare anywhere nativa** — fiecare slice trebuie sa aiba origin+destination; „oriunde” se obtine doar iterand peste lista de aeroporturi (ca la noi, cu OurAirports). Doc: https://duffel.com/docs/api/v2/offer-requests
- Cont de „travel seller” necesar (nu e pentru price-tracking fara vanzare). Deci pentru midspot: optiune viitoare daca vrem si booking direct, nu doar link afiliat.

---

## 6. SerpApi Google Flights (ultim fallback)

- Engine: https://serpapi.com/google-flights-api — `GET https://serpapi.com/search?engine=google_flights&departure_id=OTP&arrival_id=BCN&outbound_date=2026-12-05&currency=EUR&hl=en&api_key=...`; raspuns cu `best_flights`/`other_flights`, fiecare avand `departure_airport.time` / `arrival_airport.time` (ISO) si `price`. **Round-trip = 2 request-uri** (cautare outbound → `departure_token` → cautare return); one-way = 1 request.
- **Preturi (serpapi.com/pricing, verificat 2026-11):** Free `$0` → **250 cautari/luna** (50/h); Starter `$25/luna` → 1.000 cautari (**$0.025/cautare**, 200/h); Developer `$75` → 5.000 (**$0.015**); Production `$150` → 15.000 (**$0.01**); Big Data `$275` → 30.000 (~$0.0092). Se taxeaza **doar cautarile cu succes** (cache/erori nu se taxeaza); 1 cautare = 1 credit indiferent de nr de rezultate.
- **Risc ToS:** SerpApi face scraping pe rezultatele Google, ceea ce **incalca Google Terms of Service**; Google a actionat in justicea scrapere SERP (si exista procese publice). Riscuri: blocari, schimbari de markup, raspundere legala pe client (Termenii SerpApi pun conformitatea in sarcina clientului), cost variabil. Pentru midspot: **doar ca fallback de urgenta**, cu provider abstraction si cache agresiv; niciodata ca dependenta principala.

---

## 7. Date de referinta aeroporturi + cache

### 7.1 Sursa gratuita recomandata: OurAirports

- Pagina de date: https://ourairports.com/data/ ; fisiere CSV oficiale, regenerate zilnic: **https://davidmegginson.github.io/ourairports-data/airports.csv** (repo: https://github.com/davidmegginson/ourairports-data ; si `countries.csv`, `regions.csv`). Date public domain.
- Schema `airports.csv`: `id, ident, type, name, latitude_deg, longitude_deg, elevation_ft, continent, iso_country, iso_region, municipality, scheduled_service, gps_code, iata_code, local_code, home_link, wikipedia_link, keywords`.
- Filtru pentru midspot (destinatii candidate UE): `scheduled_service == "yes"` AND `iata_code` ne-gol AND `iso_country` in (UE/EEA + UK, CH, NO, IS, Balcani de Vest etc.) AND `type` in (`large_airport`,`medium_airport`) — rezulta ~150–250 aeroporturi; pentru lista scurta de candidati curatori (top ~30–50 de orase) facem un fisier static propriu derivat.

### 7.2 Schema propusa pentru cache (Postgres, Drizzle) — aliniată cu `app-spec.md` §2

Schema **canonică** a tabelelor (`airports`, `flight_cache`, `searches`, `search_jobs`, `results`) este cea din `app-spec.md` §2 — aici doar particularitățile legate de sursa de date:

- `airports` (app-spec §2): `iata` text PK, `name`, `city`, `country`, `country_code`, `latitude`/`longitude` numeric(9,6), `is_eu` bool, `kind`, `search_text` (GIN trgm), `fetched_at`; **TTL 30 zile** (`AIRPORT_CACHE_TTL_DAYS=30`, refresh lazy on miss). Populare inițială din OurAirports CSV (§7.1): filtru `scheduled_service='yes' AND iata_code<>'' AND iso_country IN (EEA+UK+CH+...)`, `type IN (large_airport, medium_airport)`; `is_eu` după lista de țări; `search_text = lower(name || ' ' || city || ' ' || iata)`.
- **Sursa de date (infra, separată de TTL-ul rândurilor):** cron săptămânal (7 zile) care re-descarcă `airports.csv` și face upsert — fișierul e regenerat zilnic de OurAirports, deci snapshot-ul nostru e vechi de max 7 zile. Cele două TTL-uri (30 zile în DB, 7 zile la sursă) sunt intenționat diferite.
- **Autocomplete la runtime:** `provider.searchAirports(q)` = Tequila `/locations/query?term=q&location_types=airport&limit=8` (cache în tabelul `airports`, vezi mai sus), cu fallback pe `ILIKE '%q%'` pe `airports.search_text` (trgm).
- **Cache rezultate căutare zboruri:** tabelul canonic `flight_cache` (app-spec §2): `cache_key = sha256(provider|origin|dest|date|adults|currency)` (lowercased), `payload jsonb` = `FlightOption[]` normalizat, `expires_at = fetched_at + FLIGHTS_CACHE_TTL_SECONDS`.

### 7.3 TTL-uri si limite operationale CANONICE (implicatii rate limit / concurenta)

Valorile de mai jos sunt cele reconiliate în cross-review (vezi `docs/review-flights-researcher.md`); app-spec și deploy-midspot trebuie să le preia identic.

| Resursa / cap | Valoare canonică | Env var | Motiv |
|---|---|---|---|
| TTL cache rezultate zboruri (per provider, origin, dest, date, adults, currency) | **1800 s (30 min)** | `FLIGHTS_CACHE_TTL_SECONDS=1800` | prețurile se mișcă și filtrul de buget trebuie pe date proaspete; 30 min collaps-ează oricum job-urile simultane/repetate. (app-spec avea 6 h — prea stale pt. buget; vezi review.) |
| TTL rânduri `airports` | **30 zile** | `AIRPORT_CACHE_TTL_DAYS=30` | date quasi-statice; refresh lazy la miss |
| Reîmprospătare sursă OurAirports CSV (cron infra) | **7 zile** | — (infra) | fișierul e regenerat zilnic de OurAirports |
| Nr max **destinații candidate** per căutare | **30** | `FLIGHTS_MAX_CANDIDATE_DESTINATIONS=30` | ordonate după distanța la centroidul originelor (app-spec §5); cu apel per pereche + range de date, bugetul de apeluri rămâne rezonabil (vezi mai jos). (app-spec avea 60 — vezi review.) |
| Nr max **zile în fereastră** | **14 zile = 14 date de plecare** (`windowEnd − windowStart ≤ 13`) | `FLIGHTS_MAX_WINDOW_DAYS=14` | identic cu validarea app-spec §3 |
| Nr max **origini unice** (călători, câte 1 adult/origine) | **2–8** | `FLIGHTS_MAX_ORIGINS=8` | identic cu validarea app-spec §3 (`origins` 2–8); redenumit din `FLIGHTS_MAX_TRAVELERS` |
| Top-K destinații pentru căutare detaliată | **10** | `FLIGHTS_TOP_K_DEEP_SEARCH=10` | compromis între acoperire și cost |
| Concurență apeluri externe | **4** | `FLIGHTS_MAX_CONCURRENCY=4` | peste 2 (app-spec) ca să ținem latența job-ului rezonabilă; sub 8 ca să nu izbim în limitele per-minut Travelpayouts (60–600/min) sau 429 Tequila; coadă + backoff exponențial pe 429 + respectăm `X-Rate-Limit-Remaining` |
| Limita gap sosire | **24 h, relaxată automat la 30 h** | `FLIGHTS_ARRIVAL_GAP_LIMIT_HOURS=24`, `FLIGHTS_ARRIVAL_GAP_RELAXED_HOURS=30` | identic cu app-spec (`max_gap_hours` default 24, relaxare în §5); gap = max−min al **sosirilor outbound** în UTC |
| Links API (Travelpayouts) | 100 req/min per marker, ≤10 linkuri/apel → batch | — | doar pentru branduri non-Kiwi (Kiwi e exclus, vezi §2.1) |
| Aviasales Flight Search API (viitor) | 100 req/h per IP → nu poate fi sursa principală la MVP | — | gate MAU 50k oricum |

**Buget apeluri per căutare midspot (Tequila, mod recomandat):** adapter-ul Tequila **colapsează dimensiunea datelor într-un singur apel per (origine, destinație, direcție)**: `date_from`/`date_to` = capetele ferestrei (outbound) resp. ferestrei + `nights` (return), cu `one_per_date=1` → câte un itinerariu per zi. Deci worst-case cold cache = `|C| × |O| × 2 direcții` = **30 × 8 × 2 = 480 apeluri** (nu `30×14×8×2=6720` — app-spec §5 estima per-data; cu range-collapse evităm asta). La `FLIGHTS_MAX_CONCURRENCY=4` și ~0,5–1 s/apel → **~2–4 min worst case**; cu `FLIGHTS_CACHE_TTL_SECONDS=1800` toate căutările repetate pe aceleași perechi (inclusiv pasul de relaxare 30 h) costă 0 apeluri noi. Ranking inițial al candidaților: 1 apel per origine cu `fly_to=<lista C>&one_for_city=1` (sau helper `travelpayouts-data` fără ore).

---

## 8. Env vars propuse (nume canonice — spec-ul de infra trebuie sa le foloseasca identic)

Toate secretele sunt in **Infisical**, expuse catre systemd --user (porturi loopback) ca env vars:

```bash
# Provider curent: tequila | travelpayouts-data | duffel | serpapi | amadeus
FLIGHTS_PROVIDER=tequila

# Travelpayouts (Data API + Links API + statistici)
TRAVELPAYOUTS_API_KEY=...        # token de la travelpayouts.com/developers/api → header X-Access-Token / ?token=
TRAVELPAYOUTS_MARKER=...         # partner ID (marker numeric din cont)
TRAVELPAYOUTS_TRS=...            # project ID (trs) pt Links API
TRAVELPAYOUTS_SUB_ID=midspot     # sub_id default pt shmarker / links API
TRAVELPAYOUTS_KIWI_PROMO_ID=3791 # promo_id program Kiwi.com (pentru template c111.travelpayouts.com/click)

# Kiwi Tequila (apeluri /v2/search, /locations)
KIWI_TEQUILA_API_KEY=...         # header: apikey
KIWI_TEQUILA_BASE_URL=https://tequila-api.kiwi.com

# Duffel (test/prod) — viitor
DUFFEL_ACCESS_TOKEN=...
DUFFEL_MODE=test                 # test | prod

# SerpApi — fallback
SERPAPI_API_KEY=...

# Amadeus — doar daca revenim pe Enterprise (istoric self-service)
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...
AMADEUS_ENV=test                 # test.api.amadeus.com (istoric) | prod

# Cache / limits (vezi §7.3 — valori canonice reconiliate în cross-review)
FLIGHTS_CACHE_TTL_SECONDS=1800            # 30 min (NU 6h — vezi review-flights-researcher.md)
AIRPORT_CACHE_TTL_DAYS=30                 # TTL rânduri tabel `airports` (app-spec §2)
FLIGHTS_MAX_CANDIDATE_DESTINATIONS=30
FLIGHTS_MAX_WINDOW_DAYS=14                # = 14 date de plecare (windowEnd-windowStart ≤ 13)
FLIGHTS_MAX_ORIGINS=8                     # origins 2–8 unice, cate 1 adult/origine (app-spec §3)
FLIGHTS_TOP_K_DEEP_SEARCH=10
FLIGHTS_MAX_CONCURRENCY=4
FLIGHTS_ARRIVAL_GAP_LIMIT_HOURS=24        # gap pe sosirile outbound, în UTC; relaxat automat la 30h
FLIGHTS_ARRIVAL_GAP_RELAXED_HOURS=30
```

**Registru parțial — restul env vars sunt definite de celelalte spec-uri și NU se redefinesc aici:** `DATABASE_URL` (deploy-midspot §5c, canonical `postgres://midspot:<parola>@127.0.0.1:5433/midspot` — **port 5433**, nu 5432, box-ul are deja Postgres pe 5432), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADSENSE_CLIENT`/`ADSENSE_SLOT_*`/`NEXT_PUBLIC_ADS_ENABLED`/`NEXT_PUBLIC_ETHICALADS_ID` (deploy-midspot §4/§7 + app-spec §8/§9), `SEARCH_RETENTION_DAYS=7`, `RATE_LIMIT_SEARCH_PER_MIN=5`, `RATE_LIMIT_AIRPORTS_PER_MIN=30` (app-spec §7/§8), `PORT=3003`/`HOSTNAME=127.0.0.1`/`NODE_ENV=production` (din unitatea systemd, nu din Infisical). **Toate cheile de mai sus trebuie să existe în Infisical `midspot-prod` / env `prod`** — vezi `docs/review-flights-researcher.md` pentru lista completă (ACTIUNE pentru deployer). Numele `FLIGHTS_*`/`TRAVELPAYOUTS_*`/`KIWI_*` de aici sunt **canonice**: app-spec trebuie să renunțe la `FLIGHT_PROVIDER`, `TEQUILA_API_KEY`, `FLIGHT_CACHE_TTL_HOURS`, `MAX_EXTERNAL_CONCURRENCY` (ACTIUNE app-spec, detalii în review).

---

## 9. Open questions / riscuri

1. **Gate de acces Kiwi API prin Travelpayouts (risc #1):** Kiwi.com API cere proiect ≥ **50.000 MAU**; Tequila self-serve e **invite-only din mai 2024**. La MVP pornim fara el: (a) monetizare prin linkuri afiliate (fara gate), (b) ranking candidati prin Travelpayouts Data API (fara gate), (c) provider abstraction ca sa putem comuta pe Duffel test/SerpApi free pentru demo. **Actiune:** aplicam la Kiwi.com program + contactam `affiliates@kiwi.com` inca de la signup.
2. **Amadeus Self-Service decommissionat (2026-07-17):** nu mai exista sandbox gratuit Amadeus; pentru dev ramane Duffel test mode + SerpApi free tier. Daca vrem Amadeus pe viitor → doar Enterprise/AQC (cost negociat).
3. **Tequila nu are „anywhere” documentat:** `fly_to` gol = doar rezultate agregate; noi folosim lista curata OurAirports + `fly_to=<lista>&one_for_city=1`.
4. **Preturile se schimba intre cautare si click:** afisam „pret la momentul cautarii” + link afiliat; nu garantam pretul. `deep_link` din Tequila e ne-taguit → il impachetam obligatoriu cu template-ul `c111.travelpayouts.com/click?...&custom_url=...` (doar URL-urile cu `/deep` sunt atribuite).
5. **429 / bloc per minut (Travelpayouts):** coada + `X-Rate-Limit-Remaining` + backoff; cache 30 min (`FLIGHTS_CACHE_TTL_SECONDS=1800`) pe rezultate; nu logam cheia in plaintext.
6. **SerpApi = risc ToS Google** (scraping ilegal per ToS Google; procese publice); doar fallback, cu cache agresiv.
7. **Duffel necesita cont de travel seller** si nu are anywhere; taxa $3/order + 1% managed content + $0.005/cautare in exces peste 1500:1 — ok doar daca vindem noi biletele, altfel link afiliat ramane modelul.
8. **Gap-ul de sosire:** calculat din `utc_arrival` (epoch) per calator, nu din `local_arrival` (DST/timezone diferit per aeroport); prag 24h, relaxare automata 30h.
9. **Valuta:** fortam `curr=EUR` la Tequila / `currencyCode=EUR` la Amadeus / `currency=EUR` la SerpApi; bugetul userului e in EUR.
10. **Date personale:** cautarile contin doar IATA + date + nr pasageri; totusi pastram `x-user-ip`/Referer doar la Aviasales real-time API (cand il activam), conform cerintelor lor anti-bot.

---

## 10. Surse (toate verificate 2026-11-07)

**Kiwi / Tequila**
- https://support.travelpayouts.com/hc/en-us/articles/360019237899-Kiwi-com-affiliate-program-API (spec mirror: locations + /v2/search, gate 50k MAU, gzip, dd/mm/YYYY, local_departure/local_arrival)
- https://tequila.kiwi.com/ si https://tequila.kiwi.com/docs/tequila_api/search_api (portal docs, acum login)
- https://kiwicom.github.io/margarita/docs/tequila-api si .../docs/guide-tequila-api-key (referinta open-source Kiwi)
- https://www.vervotech.com/hub/integrations/kiwi-com-api/ ; https://flightpowers.com/compare/kiwi-tequila (self-serve inchis mai 2024, invite-only, affiliates@kiwi.com)

**Travelpayouts**
- Data API: https://travelpayouts-data-api.readthedocs.io/en/latest/ ; token: https://www.travelpayouts.com/developers/api ; Aviasales Data API: https://support.travelpayouts.com/hc/en-us/articles/203956163-Aviasales-Data-API
- Rate limits: https://support.travelpayouts.com/hc/en-us/articles/4402565416594-API-rate-limits
- Kiwi affiliate links: https://support.travelpayouts.com/hc/en-us/articles/360010109719-Kiwi-com-affiliate-links
- Links API: https://support.travelpayouts.com/hc/en-us/articles/25289759198226-API-for-Travelpayouts-partner-links ; generic links: https://support.travelpayouts.com/hc/en-us/articles/360027634052-How-to-create-an-affiliate-link-to-any-page-on-the-brand-s-website
- Program Kiwi (3%): https://www.travelpayouts.com/blog/kiwi-com-affiliate-program/
- Aviasales Flight Search API real-time: https://support.travelpayouts.com/hc/en-us/articles/30565016140434-Aviasales-Flight-Search-API-real-time-and-multi-city-search
- Skyscanner: https://www.partners.skyscanner.net/product/affiliates ; https://www.travelpayouts.com/blog/skyscanner-flights-api/

**Amadeus**
- https://developers.amadeus.com/ (banner decommissionare 17 iulie) ; preturi self-service: https://developers.amadeus.com/pricing
- Ghiduri flights: https://amadeus4dev.github.io/developer-guides/resources/flights/ ; SDK: https://github.com/amadeus4dev/amadeus-node , https://github.com/amadeus4dev/amadeus-python
- Shutdown: https://airlabs.co/amadeus-self-service-api-shutdown ; https://www.tripgic.com/playbook/amadeus-api-shutdown-migration/ ; TPS 10 test / 40 prod + PAYG: https://phptravels.com/blog/amadeus-self-service-rest-api-vs-enterprise-rest-api

**Duffel**
- Preturi: https://duffel.com/pricing ; docs: https://duffel.com/docs/api/v2/offer-requests , /partial-offer-requests , /batch-offer-requests , /offers ; API: `https://api.duffel.com/air/offer_requests`

**SerpApi**
- Preturi: https://serpapi.com/pricing ; Google Flights: https://serpapi.com/google-flights-api

**Aeroporturi**
- https://ourairports.com/data/ ; CSV zilnic: https://davidmegginson.github.io/ourairports-data/airports.csv ; repo: https://github.com/davidmegginson/ourairports-data
