# midspot — runbook de ziua 1: adăugare pe box-ul BC250

**Public:** https://midspot.ncmihai.dev · **Port loopback:** 3005 · **Artefact:** `~/projects/midspot-web/` · **Unit:** `midspot-web.service` (systemd `--user`) · **Secrete:** Infisical `midspot-prod` / env `prod`

Surse canonice pentru reteta: `cumsevoteaza/docs/deployment.md` (arhitectura + lecțiile), `ncm/.github/workflows/deploy-box.yml` + `mereya_star/.github/workflows/deploy-box.yml` (șablonul de deploy), `bc250-monitor/server/bc250-stats.service` (hardening), planul sofronesti Task 13 (pattern `ops/`).

Lanțul (identic cu celelalte site-uri de pe box):

```
Internet → Cloudflare (zona ncmihai.dev, DNS + WAF) → tunnel 87e40a55 (cloudflared, /etc/cloudflared/config.yml)
              ▼
           BC250, systemd --user (linger on)
              ├─ cumvoteaza-web.service → 127.0.0.1:3000
              ├─ ncm-web.service        → 127.0.0.1:3001
              ├─ mereya-web.service     → 127.0.0.1:3002
              └─ midspot-web.service    → 127.0.0.1:3005   ← NOU
           DB: Neon (ca la celelalte proiecte) — nimic local pe box
           Tunnel: dedicat user-level `d2d3de1a` (pattern sofronesti, fără sudo) — vezi §1/§2
```

> **Alocarea porturilor (regula finală):** 3000 cumvoteaza, 3001 ncm, 3002 mereya, **3003 sofronesti/elena-web** (deja rezervat în planul ei, Task 13), **3004 rezervat**, **3005 midspot**. **Fiecare site nou ia următorul port liber** — vezi registrul de mai jos (`Port registry`).

---

## Port registry (anti-coliziune)

- **Sursa unică de adevăr: `~/projects/PORTS.md` pe box** — tabel `port | service | host | artefact`, păstrat la zi de fiecare echipă înainte de deploy.
- **Regula:** site nou = **max+1**, înregistrat în `PORTS.md` **înainte de primul deploy** (cine ia portul, îl trece în registru înainte de primul rsync; dacă două echipe iau același port, cine a înregistrat primul rămâne, celălalt ia max+1).
- **PORT e env-driven în unitatea systemd** (`Environment=PORT=3005`), nu hardcodat în aplicație — app-ul citește `process.env.PORT` (`server.js` standalone). Așa mutarea unui site pe alt port = doar editare de unit + ingress + intrare în registru, fără rebuild.

**Tabelul curent (sincron cu `~/projects/PORTS.md` de pe box):**

| Port | Service / container | Host | Artefact |
|---|---|---|---|
| 3000 | `cumvoteaza-web.service` | cumvoteaza.ncmihai.dev | `~/projects/cumvoteaza-web` |
| 3001 | `ncm-web.service` | www.ncmihai.dev, ncmihai.dev | `~/projects/ncm-web` |
| 3002 | `mereya-web.service` | mereya.eu, www.mereya.eu | `~/projects/mereya-web` |
| 3003 | `elena-web.service` (sofronesti — rezervat în plan, Task 13) | sofronesti.ncmihai.dev | `~/projects/elena-web` |
| 3004 | *rezervat* | — | — |
| **3005** | **`midspot-web.service`** | **midspot.ncmihai.dev** | **`~/projects/midspot-web`** |
| 5432 | `cumsevoteaza-postgres` (docker, bind all) | — loopback | volum `cumsevoteaza-postgres-data` |
| 8250 | `bc250-stats.service` | — loopback | `/opt/bc250-stats` |

---

## 1. Pas DNS — comanda exactă

Pe laptop (unde există login-ul Cloudflare pe zona `ncmihai.dev`), **fără sudo**:

```bash
# VARIANTA IMPLEMENTATĂ (2026-11-07, fără sudo pe box) — tunnel user-level dedicat, ca sofronesti:
TID=$(cloudflared tunnel create midspot | grep -oE '[0-9a-f-]{36}' | head -1)   # pe box: d2d3de1a-b427-4cd5-af63-8a22cd79e3c2
echo "$TID" > ~/.cloudflared/midspot-tunnel-id
cloudflared tunnel route dns "$TID" midspot.ncmihai.dev
# config: ~/.cloudflared/midspot-config.yml (vezi ops/midspot-config.yml), unit: ops/cloudflared-midspot.service

# VARIANTĂ alternativă: același tunnel existent 87e40a55 (cumvoteaza), dacă preferi un singur tunnel:
cloudflared tunnel route dns --overwrite-dns 87e40a55 midspot.ncmihai.dev
```

- Creează/overwrite în zona `ncmihai.dev` un record **proxied CNAME → tunnel**-ul ales pentru `midspot.ncmihai.dev`.
- `--overwrite-dns` suprascrie liniștit un record vechi pe același hostname.
- **Lecția 8 din deployment.md:** `cert.pem` al cloudflared e zone-scoped — `route dns` scrie doar în zona pe care a ales login-ul. `midspot.ncmihai.dev` e în aceeași zonă `ncmihai.dev` ca celelalte, deci comanda e corectă. Pentru altă zonă (ex. un domeniu propriu) recordul se pune manual în dashboard.
- Verificare: în dashboard-ul Cloudflare → zona `ncmihai.dev` → DNS, `midspot` apare ca Tunnel record, proxied (norul portocaliu).

## 2. Regula ingress — VARIANTA IMPLEMENTATĂ: tunnel user-level (fără sudo)

Pe box s-a folosit un **tunnel cloudflared user-level dedicat** (pattern `cloudflared-sofronesti.service`), deci **nu e nevoie de sudo**: config `~/.cloudflared/midspot-config.yml` (șablon în `ops/midspot-config.yml`) + unit `~/.config/systemd/user/cloudflared-midspot.service` (șablon în `ops/cloudflared-midspot.service`):

```yaml
tunnel: <TUNNEL_ID>
credentials-file: /home/ncm/.cloudflared/<TUNNEL_ID>.json
ingress:
  - hostname: midspot.ncmihai.dev
    service: http://localhost:3005
  - service: http_status:404
```

```bash
systemctl --user daemon-reload
systemctl --user enable --now cloudflared-midspot.service
```

> **Alternativă (mai jos):** regulă în `/etc/cloudflared/config.yml` pe tunnel-ul principal `87e40a55` — ⚠️ **necesită sudo pe box + `sudo systemctl restart cloudflared`**. Fișierul e root-owned; regula nouă se pune **înainte de catch-all** (`http_status:404` trebuie să rămână ultimul).

```yaml
# /etc/cloudflared/config.yml  — editare cu sudo
tunnel: 87e40a55-....
credentials-file: /root/.cloudflared/<uuid>.json

ingress:
  - hostname: cumvoteaza.ncmihai.dev
    service: http://127.0.0.1:3000
  - hostname: www.ncmihai.dev
    service: http://127.0.0.1:3001
  - hostname: ncmihai.dev
    service: http://127.0.0.1:3001
  - hostname: mereya.eu
    service: http://127.0.0.1:3002
  - hostname: www.mereya.eu
    service: http://127.0.0.1:3002
  # --- midspot (NOU) — vezi și „Viitor: wildcard ingress” mai jos ---
  - hostname: midspot.ncmihai.dev
    service: http://127.0.0.1:3005
  # catch-all — TREBUIE să rămână ultimul:
  - service: http_status:404
```

```bash
sudo systemctl restart cloudflared
# verificare: în log apare noul ingress; din exterior:
curl -sI https://midspot.ncmihai.dev   # după primul deploy → 200; înainte → 404/5xx de la catch-all
```

- **Lecția 1:** cloudflared atinge `localhost` peste **::1** — de aceea regulile de mai sus folosesc `127.0.0.1` explicit, iar unitatea de mai jos face bind pe `HOSTNAME=127.0.0.1` (Next standalone cu `HOSTNAME=127.0.0.1` ascultă doar IPv4 loopback, deci potrivirea e garantată). La fel și în `authorized_keys`: restricția deploy key-ului e `from="127.0.0.1,::1"` — ambele forme trebuie permise.

### 2b. Viitor: wildcard ingress + reverse proxy local (Caddy)

Când box-ul ajunge la **~6–8 site-uri**, se trece de la câte o regulă ingress per host la **o singură regulă wildcard + un reverse proxy local pe box**:

```yaml
# /etc/cloudflared/config.yml — o singură regulă în loc de N (sudo, o singură dată la migrare)
ingress:
  - hostname: "*.ncmihai.dev"
    service: http://127.0.0.1:8080      # Caddy pe box
  - service: http_status:404            # catch-all rămâne ultimul
```

- DNS: un singur record wildcard `*.ncmihai.dev` → tunnel `87e40a55` (proxied) înlocuiește recordurile per-host din zona `ncmihai.dev` (atenție la lecția 8: `route dns` e zone-scoped; wildcard-ul se poate pune și manual în dashboard).
- **Caddy pe box** (unit `systemd --user` `caddy.service`, ascultă pe `127.0.0.1:8080` plain HTTP — TLS e terminat la Cloudflare) rutează după header-ul `Host`:

  ```caddyfile
  # Caddyfile pe box (ex. ~/projects/caddy/Caddyfile)
  :8080 {
    @midspot host midspot.ncmihai.dev
    reverse_proxy @midspot 127.0.0.1:3005
    @cumvoteaza host cumvoteaza.ncmihai.dev
    reverse_proxy @cumvoteaza 127.0.0.1:3000
    # ... câte un bloc @host per site, înregistrat în PORTS.md
    respond 404
  }
  ```

- **Atunci adăugarea unui site nou = doar:** DNS (acoperit de wildcard) + rută Caddy (fără sudo pe `/etc/cloudflared/config.yml`) + unitate systemd + intrare în `PORTS.md`. Migrarea inițială a regulilor per-host existente e un singur edit sudo + `sudo systemctl restart cloudflared`.
- Până atunci (MVP, 4–5 site-uri) păstrăm regulile per-host din §2 — mai simple de citit și de debugat.

## 3. Unitate systemd `--user` + wrapper Infisical

### 3a. `~/.config/systemd/user/midspot-web.service`

```ini
[Unit]
Description=midspot web (Next.js standalone) — midspot.ncmihai.dev
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=%h/projects/midspot-web
# DOAR valori nenule aici — systemd EnvironmentFile respinge valorile goale (lecția 3),
# deci secretele NU vin din EnvironmentFile, ci din wrapper-ul Infisical de mai jos.
Environment=PORT=3005        # env-driven — vezi „Port registry”; nu hardcodat în app
Environment=HOSTNAME=127.0.0.1
Environment=NODE_ENV=production
# credentialele machine identity „bc250" (universal-auth), toate nenule:
EnvironmentFile=%h/.config/cumvoteaza/infisical.env
ExecStart=%h/bin/start-midspot-web.sh
Restart=on-failure
RestartSec=3
# același pattern ca celelalte unit-uri de pe box:
MemoryMax=2G
CPUQuota=200%
OOMScoreAdjust=500
RuntimeMaxSec=7d
# hardening suplimentar (pattern bc250-stats.service):
NoNewPrivileges=yes
PrivateTmp=yes

[Install]
WantedBy=default.target
```

- `RuntimeMaxSec=7d` repornește serviciul săptămânal — token-ul Infisical de machine identity trăiește 30 de zile, deci restart-ul săptămânal îl păstrează proaspăt (wrapper-ul face login fresh la fiecare start).
- `MemoryMax=2G / CPUQuota=200%` ca la `cumvoteaza-web.service` (căutările de zboruri pt. N călători sunt joburi în proces).

### 3b. `~/bin/start-midspot-web.sh` (wrapper Infisical)

```bash
#!/usr/bin/env bash
# start-midspot-web.sh — token Infisical proaspăt, apoi serverul standalone cu secretele prod.
set -euo pipefail
cd "$HOME/projects/midspot-web"

# ID-ul proiectului Infisical midspot-prod (copiat din dashboard după pasul 4):
MIDSPOT_PROJECT_ID="<id-proiect-midspot-prod>"

infisical login --method universal-auth --plain \
  --client-id "$INFISICAL_CLIENT_ID" \
  --client-secret "$INFISICAL_CLIENT_SECRET" \
  --domain https://eu.infisical.com >/dev/null

exec infisical run \
  --projectId "$MIDSPOT_PROJECT_ID" \
  --env=prod \
  --domain https://eu.infisical.com \
  -- node server.js
```

```bash
chmod +x ~/bin/start-midspot-web.sh
systemctl --user daemon-reload
systemctl --user enable --now midspot-web.service
systemctl --user status midspot-web.service
journalctl --user -u midspot-web.service -f
```

- **Regula veche:** directorul de deploy (`~/projects/midspot-web/`) nu trebuie să conțină NICIODATĂ fișiere `.env` — un `rsync --delete` a șters odată un `production.env`; env-ul trăiește doar în `~/.config/` (machine identity) și în Infisical.
- `loginctl enable-linger ncm` e deja activ pe box, deci unitatea pornește și fără sesiune login.

## 4. Infisical — proiect nou `midspot-prod`

Dashboard: https://eu.infisical.com (owner). Pași:

1. Project nou **`midspot-prod`**, environment **`prod`**. Copiază **Project ID**-ul (va intra în wrapper-ul de la 3b).
2. Creează cheile (env `prod`) — lista canonică e în tabelul din §7; la ziua 1 populezi:

   | Cheie | Valoare la ziua 1 |
   |---|---|
   | `DATABASE_URL` | connection string **Neon** (proiectul tău Neon, ex. branch dedicat `midspot`) — vezi pasul 5 |
   | `NEXT_PUBLIC_SITE_URL` | `https://midspot.ncmihai.dev` (se bake-uiește la build — lecția 5) |
   | `FLIGHTS_PROVIDER` | `tequila` la start (adapter default; vezi flight-data-spec §0/§8) |
   | `TRAVELPAYOUTS_API_KEY` | token de la travelpayouts.com/developers/api (placeholder până la aprobarea contului) |
   | `TRAVELPAYOUTS_MARKER` | partner ID numeric din cont (partea `{PARTNER_ID}` din `shmarker`) |
   | `TRAVELPAYOUTS_TRS` | project ID (`trs`) pentru Links API |
   | `TRAVELPAYOUTS_SUB_ID` | `midspot` |
   | `TRAVELPAYOUTS_KIWI_PROMO_ID` | `3791` (programul Kiwi.com în template-ul c111.travelpayouts.com/click) |
   | `KIWI_TEQUILA_API_KEY` | placeholder până la aprobarea Tequila (gate 50k MAU / invite-only) |
   | `DUFFEL_ACCESS_TOKEN` / `DUFFEL_MODE` | gol / `test` la MVP (doar pentru dev-sandbox) |
   | `SERPAPI_API_KEY` | gol la MVP (fallback de urgență; free tier 250/lună) |
   | `NEXT_PUBLIC_ADS_ENABLED` | `false` până la aprobarea contului de ads |
   | `NEXT_PUBLIC_ETHICALADS_ID` | gol până la aprobare (EthicalAds e rețeaua primară; CarbonAds fallback) |
   | `CRON_SECRET` | doar dacă activăm ruta protejată de refresh săptămânal OurAirports (flight-data-spec §7.2) — ex. `openssl rand -base64 32` |

3. **Machine identities:** acordă acces la proiectul nou identității **`bc250`** (Admin; credentialele ei sunt deja pe box în `~/.config/cumvoteaza/machine-auth` + `infisical.env`) și identității **`github`** (Viewer; credentialele ei sunt în secretele GitHub Actions, vezi pasul 6). Rotație = creezi identitate nouă, o schimbi, o revoci pe cea veche din dashboard.

## 5. Baza de date: Neon (decizie owner, 2026-11-07 — NU Postgres local pe box)

Ca la celelalte proiecte (ncm, cumsevoteaza, mereya), DB-ul midspot e pe **Neon**: creează în consola Neon un proiect (sau branch) dedicat `midspot` și pune connection string-ul în Infisical:

```
DATABASE_URL=postgres://<user>:<password>@<host>.eu-central-1.aws.neon.tech/midspot?sslmode=require
```

- **Nimic local pe box:** fără container Postgres pentru midspot (unitatea `midspot-postgres.service` a fost scoasă de pe box; păstrăm doar `cumsevoteaza-postgres` pe 5432, neatins). Backup-urile sunt treaba Neon (PITR/branching), deci nici timer de pg_dump local.
- `pg_trgm` (folosit de migrarea 0000 pentru autocomplete aeroporturi) e disponibil pe Neon.
- **Migrări:** regula casei — migrările de producție le rulează **owner-ul**, niciodată un agent. Înainte de primul deploy: `DATABASE_URL=<neon> npm run db:migrate` (sau `drizzle-kit migrate`). La boot, aplicația rulează automat migrațiile dacă găsește folderul `drizzle/` în artefact (instrumentation), altfel loghează warning.
- **Fără URL-uri absolute de loopback în aplicație** (lecția 7): `DATABASE_URL` e doar connection string pentru pg/Drizzle, niciodată folosit ca base URL pentru fetch-uri interne. Next's `NextURL` normalizează `127.0.0.1` → `localhost` și un rewrite absolut construit din `request.url` a produs 500-uri silențioase; păstrăm toate redirecturile/rewrite-urile **relative**.

## 6. GitHub Actions — `.github/workflows/deploy-box.yml`

Adaptat din `ncm/.github/workflows/deploy-box.yml` (cu gate-ul CI portat în același fișier; alternativă: `workflow_run` pe un workflow `CI` separat, ca la cumsevoteaza):

```yaml
name: Deploy to the BC250

# midspot (D-1): push pe main → CI (audit/lint/typecheck/test) → build standalone
# CU env-ul prod din Infisical (NEXT_PUBLIC_SITE_URL se bake-uiește, lecția 5) →
# rsync prin tunelul Cloudflare → restart midspot-web.service → live check.
on:
  push:
    branches: [main]
  workflow_dispatch: {}

concurrency:
  group: deploy-bc250-midspot
  cancel-in-progress: false

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm audit --omit=dev --audit-level=high
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test -- --run   # dacă există teste; șterge pasul dacă nu
      - run: npm run build

  deploy:
    needs: verify
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install cloudflared and the Infisical CLI
        run: |
          curl -sL -o cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
          sudo install -m 755 cloudflared /usr/local/bin/cloudflared
          VER=$(curl -s https://api.github.com/repos/Infisical/cli/releases/latest | grep -o '"tag_name": *"[^"]*"' | cut -d'"' -f4)
          curl -sL -o cli.tgz "https://github.com/Infisical/cli/releases/download/$VER/cli_${VER#v}_linux_amd64.tar.gz"
          tar xzf cli.tgz && sudo install -m 755 infisical /usr/local/bin/infisical

      - name: Pull the production environment from Infisical (identitatea github, Viewer)
        run: |
          TOKEN=$(infisical login --method universal-auth \
            --client-id "${{ secrets.INFISICAL_CLIENT_ID }}" \
            --client-secret "${{ secrets.INFISICAL_CLIENT_SECRET }}" \
            --domain https://eu.infisical.com --plain 2>/dev/null | tail -1)
          infisical export --format dotenv --projectId <id-proiect-midspot-prod> \
            --env prod --token "$TOKEN" --domain https://eu.infisical.com --silent > prod.env

      - name: Build the standalone artefact
        run: |
          set -a
          . prod.env          # lecția 2: exportul dotenv e single-quoted; shell-ul le parsează corect aici
          set +a
          rm prod.env
          npm run build
        env:
          STANDALONE_OUTPUT: "1"

      - name: Configure SSH through the tunnel
        run: |
          mkdir -p ~/.ssh && chmod 700 ~/.ssh
          echo "${{ secrets.BOX_SSH_KEY }}" > ~/.ssh/id_ed25519 && chmod 600 ~/.ssh/id_ed25519
          cat > ~/.ssh/config <<EOF
          Host box
            HostName ssh.ncmihai.dev
            User ncm
            StrictHostKeyChecking accept-new
            ProxyCommand /usr/local/bin/cloudflared access ssh --hostname %h --service-token-id ${{ secrets.CF_ACCESS_CLIENT_ID }} --service-token-secret ${{ secrets.CF_ACCESS_CLIENT_SECRET }}
          EOF

      - name: Rsync the artefact to the box (fără fișiere .env — doar artefactul)
        run: |
          rsync -az --delete .next/standalone/ box:projects/midspot-web/
          rsync -az .next/static/ box:projects/midspot-web/.next/static/
          rsync -az public/ box:projects/midspot-web/public/

      - name: Restart the web service
        run: ssh box 'XDG_RUNTIME_DIR=/run/user/1000 systemctl --user restart midspot-web.service'

      - name: Check the live site (loopback /api/health + public URL)
        run: |
          for i in 1 2 3 4 5 6; do
            if ssh box 'curl -fsS -o /dev/null http://127.0.0.1:3005/api/health'; then
              echo "up on the box's loopback"
              if curl -fsS -o /dev/null https://midspot.ncmihai.dev; then echo live; exit 0; fi
            fi
            sleep 10
          done
          echo "the site did not answer after the deploy" >&2
          exit 1
```

Note pentru aplicație: `next.config.ts` trebuie să mapeze switch-ul, pattern mereya/sofronesti:

```ts
const nextConfig: NextConfig = {
  output: process.env.STANDALONE_OUTPUT === "1" ? "standalone" : undefined,
};
```

**Secrete GitHub Actions (doar numele), în repo-ul `at_the_middle`:**

| Secret | Conținut |
|---|---|
| `INFISICAL_CLIENT_ID` | client ID machine identity `github` (Viewer) |
| `INFISICAL_CLIENT_SECRET` | client secret machine identity `github` |
| `BOX_SSH_KEY` | cheia privată de deploy (cea cu `from="127.0.0.1,::1"` în `authorized_keys`) |
| `CF_ACCESS_CLIENT_ID` | service token Cloudflare Access pt. `ssh.ncmihai.dev` |
| `CF_ACCESS_CLIENT_SECRET` | secret-ul aceluiași service token |

Aceleași valori ca la celelalte repo-uri — se copiază din setările lor de Actions, nu se regenerează.

## 7. Tabela env vars citite de aplicație (sursa unică de adevăr)

Toate trăiesc în Infisical `midspot-prod` / `prod`, **cu excepția** `PORT`/`HOSTNAME`/`NODE_ENV` (din unitatea systemd). Numele cheilor din grupa „provideri/cap-uri” sunt **canonice din `flight-data-spec.md` §8** — app-spec trebuie să le preia identic (vezi `docs/review-infra-architect.md`).

### 7a. Core infra

| Cheie | Citită de | Unde | Note |
|---|---|---|---|
| `DATABASE_URL` | server (Drizzle + postgres-js) + drizzle-kit | Infisical prod | `postgres://midspot:<parola>@127.0.0.1:5433/midspot`; doar pt. DB, niciodată ca base URL de fetch intern (lecția 7) |
| `NEXT_PUBLIC_SITE_URL` | build + runtime | Infisical prod + env de build în CI | **baked la build** (lecția 5) → `https://midspot.ncmihai.dev`; folosit la share links `/r/<slug>` (calea canonică din app-spec) |
| `PORT` | `server.js` standalone | unitatea systemd | `3005` — nu în Infisical; env-driven (vezi Port registry) |
| `HOSTNAME` | `server.js` standalone | unitatea systemd | `127.0.0.1` — vezi lecția 1 (::1) |
| `NODE_ENV` | Next | unitatea systemd | `production` — nu în Infisical |

### 7b. Provideri de zboruri (canonice flight-data-spec §8 — toate server-only, NICIODATĂ `NEXT_PUBLIC_*`)

| Cheie | Valoare default / exemplu | Note |
|---|---|---|
| `FLIGHTS_PROVIDER` | `tequila` | `tequila \| travelpayouts-data \| duffel \| serpapi \| amadeus`; comută adapterul din `lib/flights/` |
| `TRAVELPAYOUTS_API_KEY` | token de la travelpayouts.com/developers/api | header `X-Access-Token` / `?token=` pt. Data API + Links API |
| `TRAVELPAYOUTS_MARKER` | partner ID numeric | `{PARTNER_ID}` din `shmarker={MARKER}.{SUB_ID}` |
| `TRAVELPAYOUTS_TRS` | project ID (`trs`) | pt. Links API `links/v1/create` |
| `TRAVELPAYOUTS_SUB_ID` | `midspot` | sub_id default în shmarker/links |
| `TRAVELPAYOUTS_KIWI_PROMO_ID` | `3791` | promo_id Kiwi.com în template-ul `c111.travelpayouts.com/click?...&custom_url=...` |
| `KIWI_TEQUILA_API_KEY` | cheia din portal Tequila | header `apikey`; gate 50k MAU / invite-only |
| `KIWI_TEQUILA_BASE_URL` | `https://tequila-api.kiwi.com` | |
| `DUFFEL_ACCESS_TOKEN` | gol la MVP | viitor; test mode gratuit |
| `DUFFEL_MODE` | `test` | `test \| prod` |
| `SERPAPI_API_KEY` | gol la MVP | ultim fallback (risc ToS; free 250/lună) |
| `AMADEUS_CLIENT_ID` / `AMADEUS_CLIENT_SECRET` | gol | doar varianta Enterprise (self-service decommissionat 2026-07-17) |
| `AMADEUS_ENV` | `test` | istoric |

### 7c. Cap-uri și TTL-uri (canonice flight-data-spec §7.3/§8)

| Cheie | Default | Note |
|---|---|---|
| `FLIGHTS_CACHE_TTL_SECONDS` | `1800` (30 min) | TTL cache rezultate zbor pe cheie `(provider, origin, dest, date, adults, curr, cabin)` — NU 6h |
| `AIRPORT_CACHE_TTL_DAYS` | `30` | TTL rânduri tabel `airports` în Postgres (refresh lazy); cache-ul autocomplete provider e 24h (flight-data-spec §7.3, intern); cron sursă OurAirports e separat, la 7 zile |
| `FLIGHTS_MAX_CANDIDATE_DESTINATIONS` | `30` (extensibil la 50) | cap destinații candidate per căutare |
| `FLIGHTS_MAX_WINDOW_DAYS` | `14` | = 14 date de plecare (windowEnd−windowStart ≤ 13 zile) |
| `FLIGHTS_MAX_ORIGINS` | `8` | origins 2–8 unice, câte 1 adult/origine (înlocuiește vechiul `FLIGHTS_MAX_TRAVELERS`) |
| `FLIGHTS_TOP_K_DEEP_SEARCH` | `10` | top-K destinații pentru căutările „calde” cu ore reale |
| `FLIGHTS_MAX_CONCURRENCY` | `4` | apeluri externe în paralel — sub 8 ca să nu izbim în limitele per-minut Travelpayouts / 429 Tequila (flight-data-spec §7.3/§8 reconciheat); coada + backoff pe 429 |
| `FLIGHTS_ARRIVAL_GAP_LIMIT_HOURS` | `24` | gap de sosire max pe sosirile outbound, în UTC (max − min din `utc_arrival` epoch) |
| `FLIGHTS_ARRIVAL_GAP_RELAXED_HOURS` | `30` | relaxare automată dacă la 24h nu găsește nimic |

### 7d. Knob-uri runtime ale aplicației (app-spec §2/§4/§7/§8)

| Cheie | Default | Note |
|---|---|---|
| `NEXT_PUBLIC_ADS_ENABLED` | `false` | `true` doar în prod cu cont aprobat; baked la build |
| `NEXT_PUBLIC_ETHICALADS_ID` | gol | EthicalAds (rețea primară, `cdn.ethicalads.io` în CSP); baked la build |
| `NEXT_PUBLIC_CARBONADS_SERVE_ID` | gol | fallback CarbonAds (`cdn.carbonads.com` în CSP); baked la build |
| `SEARCH_RETENTION_DAYS` | `7` | retenție `searches`/`results` (`expires_at`) |
| `RATE_LIMIT_SEARCH_PER_MIN` | `5` | pe IP (`CF-Connecting-IP`), POST /api/search |
| `RATE_LIMIT_AIRPORTS_PER_MIN` | `30` | pe IP, GET /api/airports |
| *(general)* | `240/min/IP` | hardcoded în `proxy.ts` (pattern cumsevoteaza), nu e env |
| `CRON_SECRET` | opțional | necesar doar dacă activăm ruta protejată de refresh săptămânal OurAirports (flight-data-spec §7.2) — atunci adăugăm și unit `midspot-airports-refresh.timer` pe box |

### 7e. Opțional — backup pg_dump către Digi Storage (app-spec §10 Q12; naming după cumsevoteaza/mereya)

| Cheie | Note |
|---|---|
| `DIGI_STORAGE_EMAIL` / `DIGI_STORAGE_PASSWORD` | cont Digi Storage |
| `DIGI_STORAGE_MOUNT_ID` | |
| `DIGI_STORAGE_BASE_PATH` | ex. `midspot-backups` |
| `DIGI_STORAGE_BASE_URL` / `DIGI_STORAGE_API_URL` | `https://storage.rcs-rds.ro` / `.../api/v2.1` |

### 7f. Legacy — de șters

| Cheie | De ce dispare |
|---|---|
| ~~`RAPIDAPI_KEY`~~ | doar în `.env.local` local, **prototip vechi** fly-scraper; la rebuild dispare — fără RapidAPI, fără niciun scraper. `.env*` rămâne în `.gitignore` și NU ajunge niciodată pe box (rsync-ul de deploy nu trimite env-uri). |

**Reguli:** niciun secret în repo, în chat sau în `.env` pe box; `NEXT_PUBLIC_*` doar pentru valori cu adevărat publice și mereu setate în env-ul de **build** din CI (pull Infisical); cheile API de provideri rămân doar pe server.

## 8. Lecții aplicabile direct din `cumsevoteaza/docs/deployment.md`

1. **cloudflared ajunge pe `localhost` peste `::1`** — regulile ingress folosesc `127.0.0.1` explicit + unitatea face bind pe `HOSTNAME=127.0.0.1`; restricțiile din `authorized_keys` trebuie să includă ambele (`from="127.0.0.1,::1"`).
2. **`infisical export --format dotenv` single-quotes-uiește valorile** — la parsare în afara unui shell, scoate ghilimelele; în CI le păstrăm și facem `. prod.env` într-un shell (`set -a`), deci e corect.
3. **`EnvironmentFile` de systemd respinge valorile goale** — de aceea secretele vin prin `infisical run` în wrapper, iar în unitate punem doar `Environment=` cu valori nenule.
4. **`next/font/google` fetchează la build și a făcut CI intermitent să pice** — la rebuild, fonturile (Geist din `app/layout.tsx` al prototipului) devin fișiere locale (OFL), ca la portofoliu.
5. **`NEXT_PUBLIC_*` se bake-uiesc la build** — `NEXT_PUBLIC_SITE_URL` (și cele de ads) se setează în env-ul de build din CI (prin pull-ul din Infisical), nu doar la runtime pe box.
6. **Cloudflare free ignoră `Vary`** — regula de edge cache e **per-host** și opțională la MVP pentru midspot; când o activăm, trebuie să excludem requesturile routerului (`rsc: 1`, `next-router-prefetch: 1`) și să nu cache-ăm query-urile; verificăm cu `cf-cache-status: MISS` → `HIT`. Până atunci paginile răspund `DYNAMIC`, ceea ce e corect.
7. **Fără URL-uri absolute de loopback în app** — niciun `https://127.0.0.1:3005/...` construit din `request.url`; rewrite-urile rămân relative, iar proxy-ul răspunde pe path nepotrivite cu 404 direct.
8. **`tunnel route dns` e zone-scoped** — `midspot.ncmihai.dev` e în zona `ncmihai.dev` (aceeași cu login-ul existent), deci pasul 1 funcționează; altă zonă → record manual în dashboard.
9. **Timeout Cloudflare de 100 s** — căutarea de zboruri pentru N călători (N itinerarii, fiecare cu retry) poate depăși 100 s, deci în app căutarea e **job async + polling**: `POST /api/search` → returnează imediat un `jobId`, `GET /api/search/<jobId>` poll-uie starea, rezultatele se păstrează în Postgres; share-link-ul `/r/<id>` citește doar din DB. Astfel niciun request nu ține conexiunea peste 100 s.
10. **Igienă operațională:** directorul de deploy nu conține `.env` (rsync `--delete` le-ar șterge oricum); cheia de deploy funcționează doar prin tunel (`from="127.0.0.1,::1"`); `RuntimeMaxSec=7d` reîmprospătează token-ul Infisical (30 zile); rotația machine identity = creezi nouă, swap, revoci vechea din dashboard.

## 9. Checklist — acțiuni doar-owner

- [ ] **Box, sudo:** editat `/etc/cloudflared/config.yml` (regulă ingress midspot **înainte de catch-all**) + `sudo systemctl restart cloudflared`.
- [ ] **Laptop, fără sudo:** `cloudflared tunnel route dns --overwrite-dns 87e40a55 midspot.ncmihai.dev`.
- [ ] **Dashboard Cloudflare (zona `ncmihai.dev`):** verificat că `midspot` e Tunnel record proxied; (opțional, mai târziu) Cache Rule per-host pentru midspot; Bot Fight Mode/Client-Side Security rămân cele din zonă.
- [ ] **Dashboard Infisical (eu.infisical.com):** proiect `midspot-prod` + env `prod` creat, cheile din tabelul de la pasul 4 completate, Project ID copiat în `~/bin/start-midspot-web.sh` pe box; acces acordat machine identity-lor `bc250` (Admin) și `github` (Viewer).
- [ ] **GitHub (repo `at_the_middle`):** cele 5 secretele Actions din tabelul de la pasul 6 (copiate din alt repo, nu regenerate); Actions enabled pe branch `main`.
- [ ] **Box, ca user ncm:** `~/bin/start-midspot-web.sh` + `~/.config/systemd/user/midspot-web.service` + `midspot-postgres.service` + `~/projects/midspot-postgres/docker-compose.yml` copiate; `systemctl --user daemon-reload && systemctl --user enable --now midspot-postgres.service midspot-web.service`.
- [ ] **Owner rulează migrările înainte de primul deploy** (regula casei: niciodată agentul împotriva prod): pe box, din `~/projects/midspot-web/`, `infisical run --projectId <id-midspot-prod> --env=prod -- npm run db:migrate`.
- [ ] **Port înregistrat în registry:** `3005 | midspot-web.service | midspot.ncmihai.dev | ~/projects/midspot-web` adăugat în `~/projects/PORTS.md` pe box **înainte de primul deploy** (3003 e deja rezervat de sofronesti/elena-web, 3004 rezervat; regula: site nou = max+1).
- [ ] **Verificare post-deploy:** `curl -sI https://midspot.ncmihai.dev` → 200; `curl -s http://127.0.0.1:3005/api/health` pe box → `{"ok":true,"db":true,...}`; `systemctl --user status midspot-web.service midspot-postgres.service`; `journalctl --user -u midspot-web.service --no-pager | tail -20`; `docker ps | grep midspot-postgres` (127.0.0.1:5433->5432); primul push pe `main` → workflow verde end-to-end (CI + deploy + live check public + loopback).
