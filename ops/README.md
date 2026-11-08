# midspot — ops runbook (pașii făcuți efectiv pe BC250, 2026-11-07)

Public: **https://midspot.ncmihai.dev** · loopback port **3005** · artefact `~/projects/midspot-web/`
· unit `midspot-web.service` (systemd --user) · **DB pe Neon** (nimic local) · secrete în Infisical
proiect **`midspot`** (id `71ef14fc-263d-46f9-9fe7-002930ca63d3`), env `prod`, machine identity `bc250`.
Tunnel: user-level dedicat **`d2d3de1a-b427-4cd5-af63-8a22cd79e3c2`** (fără sudo).
Detalii canonice: `docs/deploy-midspot.md`, `docs/PLAN.md`.

## Stare curentă (deja făcut)

- [x] `~/projects/PORTS.md` — registru porturi (3005 = midspot-web)
- [x] Tunnel user-level: `cloudflared tunnel create midspot` → id în `~/.cloudflared/midspot-tunnel-id`,
      config `~/.cloudflared/midspot-config.yml`, unit `cloudflared-midspot.service` (enable --now, active)
- [x] DNS: `cloudflared tunnel route dns <TID> midspot.ncmihai.dev` → CNAME proxied în zona ncmihai.dev
- [x] Artefact: `rsync .next/standalone/ → ~/projects/midspot-web/` (+ `.next/static`, `public`)
      — **atenție:** `next.config.ts` are `outputFileTracingRoot` setat; fără el, standalone-ul vine
      nestuit sub `at_the_middle/` cu symlink-uri relative rupte la mutarea la rădăcină
- [x] Wrapper `~/bin/start-midspot-web.sh` + unit `midspot-web.service` (PORT=3005, HOSTNAME=127.0.0.1)
- [x] Infisical `midspot`/prod populat cu 18 chei (vezi mai jos ce mai lipsește)
- [x] Verificat live: `https://midspot.ncmihai.dev` → 200, `/api/health` → ok, căutare mock E2E → rezultate

## Ce mai lipsește în Infisical `midspot` / prod (owner)

| Cheie | De pus |
|---|---|
| `DATABASE_URL` | connection string **Neon** (branch/proiect `midspot`): `postgres://...@....aws.neon.tech/midspot?sslmode=require` |
| `TRAVELPAYOUTS_API_KEY` | token de la travelpayouts.com/developers/api (header `X-Access-Token`) |
| `TRAVELPAYOUTS_MARKER` | partner ID numeric (din `shmarker`) |
| `TRAVELPAYOUTS_TRS` | project id (`trs`) pt Links API |
| `KIWI_TEQUILA_API_KEY` | după aprobarea programului Kiwi.com API (gate 50k MAU; contact `affiliates@kiwi.com`) |
| `FLIGHTS_PROVIDER` | acum `mock`; se schimbă pe `tequila` când avem cheia Kiwi |
| `NEXT_PUBLIC_ETHICALADS_ID` / `NEXT_PUBLIC_CARBONADS_SERVE_ID` | după aprobarea conturilor de ads |
| `NEXT_PUBLIC_ADS_ENABLED` | `false` → `true` când ads sunt live |

După ce pui `DATABASE_URL`: `systemctl --user restart midspot-web.service` și
`curl -s http://127.0.0.1:3005/api/health` trebuie să răspundă `{"ok":true,"db":true,...}`.
Migrațiile: la boot aplicația le rulează automat din `drizzle/` (vezi log `journalctl --user -u midspot-web.service`);
la nevoie manual: `cd ~/projects/midspot-web && DATABASE_URL=<neon> npx drizzle-kit migrate` (din repo, cu env local).

## Deploy automat

Push pe `main` → `.github/workflows/deploy-box.yml` (build standalone cu env prod din Infisical,
rsync prin `ssh.ncmihai.dev` → Cloudflare Access, restart unit, live check pe
`https://midspot.ncmihai.dev` + fallback `http://127.0.0.1:3005/api/health`).
Secrete GH necesare (Actions → Secrets): `INFISICAL_CLIENT_ID`, `INFISICAL_CLIENT_SECRET`,
`INFISICAL_PROJECT_ID` (= `71ef14fc-263d-46f9-9fe7-002930ca63d3`), `BOX_SSH_KEY`,
`CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`.

## Verificări rapide

```bash
systemctl --user status midspot-web.service cloudflared-midspot.service
curl -s http://127.0.0.1:3005/api/health
curl -sI https://midspot.ncmihai.dev
journalctl --user -u midspot-web.service --no-pager | tail -20
```

## Health monitoring (midspot-health.timer, every 5 min)

On the box: `cp ops/midspot-health.{sh,service,timer} ~/.config/systemd/user/ && chmod +x ~/.config/systemd/user/midspot-health.sh`,
then `systemctl --user daemon-reload && systemctl --user enable --now midspot-health.timer`.
FAIL lines (loopback `:3005` + public `/api/health`): `journalctl --user -u midspot-health.service --no-pager`.

## Travelpayouts Drive (verificat Active — setări recomandate non-intrusive)

Loader instalat în `<head>` (components/DriveScript.tsx, `NEXT_PUBLIC_DRIVE_ENABLED=true` în prod).
În dashboard app.travelpayouts.com/drive pentru midspot.ncmihai.dev:
- Monetization boost: **Low/Off** (nu Maximum)
- Switch Links to Travelpayouts: **ON**; "Switch links from affiliate networks": **OFF**
- Link Relevant Keywords / Insert Recommendations / Display Smart Previews / Show Targeted Offers: **OFF**
- Exclude pages: `https://midspot.ncmihai.dev/r/*` (paginile de rezultate cu butoane Book rămân neatinse)

## fastflights bridge (flight provider service, port 8850)

```bash
pip3 install --user "git+https://github.com/Mohamed3on/flights.git"
rsync -a services/fastflights/ box:projects/fastflights/   # from the repo
cp ops/fastflights.service ~/.config/systemd/user/
systemctl --user daemon-reload && systemctl --user enable --now fastflights.service
curl -s http://127.0.0.1:8850/health    # {"ok":true,"tz":10378}
# Infisical midspot/prod: FLIGHTS_PROVIDER=fastflights, FASTFLIGHTS_BASE_URL=http://127.0.0.1:8850
systemctl --user restart midspot-web.service
```
