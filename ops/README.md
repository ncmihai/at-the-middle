# midspot — ops runbook (owner steps on the BC250 box, IN ORDER)

Public: **https://midspot.ncmihai.dev** · loopback port **3005** · artefact dir `~/projects/midspot-web/`
· systemd `--user` unit `midspot-web.service` · Postgres container `midspot-postgres` on `127.0.0.1:5433`
· secrets in Infisical project `midspot-prod`, env `prod` (machine identity `bc250`).
Full context: `docs/deploy-midspot.md` (canonical runbook) and `docs/PLAN.md` §4 (port registry).
Files in this `ops/` directory are copied to the box verbatim.

## 1. Register the port (before anything else)

Add a line to `~/projects/PORTS.md` on the box (single source of truth for port allocation):

```bash
# append to ~/projects/PORTS.md — format: port | service | host | artefact dir
echo "3005 | midspot-web | midspot.ncmihai.dev | ~/projects/midspot-web" >> ~/projects/PORTS.md
cat ~/projects/PORTS.md
```

## 2. DNS — Cloudflare tunnel record (run on the laptop, no sudo)

```bash
cloudflared tunnel route dns --overwrite-dns 87e40a55 midspot.ncmihai.dev
# verify in the Cloudflare dashboard: zone ncmihai.dev → DNS → "midspot" is a proxied Tunnel record
```

## 3. Ingress rule on the box (sudo) — BEFORE the catch-all

Edit `/etc/cloudflared/config.yml` with sudo and add, before the final `- service: http_status:404`:

```yaml
  # --- midspot ---
  - hostname: midspot.ncmihai.dev
    service: http://127.0.0.1:3005
```

Then:

```bash
sudo systemctl restart cloudflared
# verify the rule is loaded in the cloudflared log; before the first deploy the public URL answers 404 from the catch-all
```

(`127.0.0.1` explicit, not `localhost` — cloudflared resolves localhost over `::1`, while the app binds IPv4 loopback via `HOSTNAME=127.0.0.1`.)

## 4. Install the units + wrapper + compose file on the box (as the box user)

```bash
# directories
mkdir -p ~/projects/midspot-web ~/projects/midspot-postgres ~/bin ~/.config/systemd/user ~/.config/midspot

# from this repo, copy the ops files to the box (adjust the scp/rsync path to your checkout):
#   ops/midspot-web.service              -> ~/.config/systemd/user/midspot-web.service
#   ops/midspot-postgres-boot.service    -> ~/.config/systemd/user/midspot-postgres-boot.service
#   ops/start-midspot-web.sh             -> ~/bin/start-midspot-web.sh
#   ops/midspot-postgres.compose.yml     -> ~/projects/midspot-postgres/midspot-postgres.compose.yml

# machine identity "bc250" credentials (universal-auth) — NON-EMPTY values only,
# systemd EnvironmentFile rejects empty values:
cat > ~/.config/midspot/infisical.env <<'EOF'
INFISICAL_CLIENT_ID=<client-id-of-machine-identity-bc250>
INFISICAL_CLIENT_SECRET=<client-secret-of-machine-identity-bc250>
EOF
chmod 600 ~/.config/midspot/infisical.env

# fill in the Infisical project ID placeholder in the wrapper:
#   ~/bin/start-midspot-web.sh  →  MIDSPOT_PROJECT_ID="<id of midspot-prod>"
chmod +x ~/bin/start-midspot-web.sh

# start Postgres (compose) and enable it at boot
cd ~/projects/midspot-postgres
POSTGRES_PASSWORD="$(openssl rand -base64 32)" \
  docker compose -f midspot-postgres.compose.yml up -d
# store that password — DATABASE_URL in Infisical must be:
#   postgres://midspot:<that-password>@127.0.0.1:5433/midspot

systemctl --user daemon-reload
systemctl --user enable --now midspot-postgres-boot.service midspot-web.service
systemctl --user status midspot-postgres-boot.service midspot-web.service

# checks
docker ps --format '{{.Names}} {{.Ports}}' | grep midspot-postgres   # 127.0.0.1:5433->5432
pg_isready -h 127.0.0.1 -p 5433 -U midspot -d midspot

# migrations are run by the OWNER, never by an agent, before the first deploy:
cd ~/projects/midspot-web
infisical run --projectId <id-of-midspot-prod> --env=prod --domain https://eu.infisical.com \
  -- npm run db:migrate

# linger so the --user units start without a login session
loginctl enable-linger "$(whoami)"
```

## 5. Nightly pg_dump backup (systemd timer, to a mounted volume)

Assumes a backup volume mounted at `~/volumes/midspot-backups` (adjust `BACKUP_DIR` if yours is elsewhere).

```bash
mkdir -p ~/volumes/midspot-backups

cat > ~/bin/midspot-pg-backup.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
BACKUP_DIR="$HOME/volumes/midspot-backups"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$BACKUP_DIR"
docker exec midspot-postgres pg_dump -U midspot -d midspot | gzip > "$BACKUP_DIR/midspot-$STAMP.sql.gz"
# keep the newest 14 dumps
ls -1t "$BACKUP_DIR"/midspot-*.sql.gz | tail -n +15 | xargs -r rm --
EOF
chmod +x ~/bin/midspot-pg-backup.sh

cat > ~/.config/systemd/user/midspot-pg-backup.service <<'EOF'
[Unit]
Description=midspot nightly pg_dump backup

[Service]
Type=oneshot
ExecStart=%h/bin/midspot-pg-backup.sh
EOF

cat > ~/.config/systemd/user/midspot-pg-backup.timer <<'EOF'
[Unit]
Description=midspot nightly pg_dump backup (03:30 UTC)

[Timer]
OnCalendar=*-*-* 03:30:00 UTC
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now midspot-pg-backup.timer
systemctl --user list-timers midspot-pg-backup.timer
```

## 6. Post-deploy checks

```bash
# on the box — loopback health (this is also what the GH Actions workflow polls):
curl -s http://127.0.0.1:3005/api/health        # expect {"ok":true,"db":true,...}

# from anywhere — public URL through the tunnel:
curl -sI https://midspot.ncmihai.dev             # expect 200

# service state + logs:
systemctl --user status midspot-web.service midspot-postgres-boot.service
journalctl --user -u midspot-web.service --no-pager | tail -20
docker ps --format '{{.Names}} {{.Ports}} {{.Status}}' | grep midspot-postgres
```

Deploy itself is fully automated: push to `main` → `.github/workflows/deploy-box.yml`
builds the standalone artefact with the prod env from Infisical, rsyncs it to
`~/projects/midspot-web/` through `ssh.ncmihai.dev`, restarts `midspot-web.service`
and live-checks the site. Required GH Actions secrets are listed in the header comment
of that workflow.
