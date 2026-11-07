#!/usr/bin/env bash
# start-midspot-web.sh — fresh Infisical token, then the Next.js standalone server with
# the prod secrets injected. Installed on the BC250 box as ~/bin/start-midspot-web.sh
# (chmod +x); started by the systemd --user unit midspot-web.service.
set -euo pipefail

cd "$HOME/projects/midspot-web"

# PLACEHOLDER — Infisical Project ID of "midspot-prod"
# (copy it from the dashboard: https://eu.infisical.com → project midspot-prod):
MIDSPOT_PROJECT_ID="<INFISICAL_PROJECT_ID_OF_midspot-prod>"

# Machine identity "bc250" (universal-auth) credentials are provided by the systemd
# unit's EnvironmentFile (~/.config/midspot/infisical.env) — non-empty values only:
: "${INFISICAL_CLIENT_ID:?missing INFISICAL_CLIENT_ID (machine identity bc250)}"
: "${INFISICAL_CLIENT_SECRET:?missing INFISICAL_CLIENT_SECRET (machine identity bc250)}"

# Fresh login on every start; --plain prints the token on stdout so it never touches disk.
INFISICAL_TOKEN=$(infisical login --method universal-auth --plain \
  --client-id "$INFISICAL_CLIENT_ID" \
  --client-secret "$INFISICAL_CLIENT_SECRET" \
  --domain https://eu.infisical.com)

# PLACEHOLDER — if your CLI version needs the token explicitly, it is passed via --token
# below; otherwise it uses the just-logged-in session.
exec infisical run \
  --projectId "$MIDSPOT_PROJECT_ID" \
  --env=prod \
  --domain https://eu.infisical.com \
  --token "$INFISICAL_TOKEN" \
  -- node server.js
