#!/usr/bin/env bash
# start-midspot-web.sh — installed on the BC250 box as ~/bin/start-midspot-web.sh (chmod 700),
# started by the systemd --user unit midspot-web.service.
# Pattern D-094: fresh Infisical access token at every start (machine identity "bc250",
# credentials from ~/.config/cumvoteaza/infisical.env), secrets injected from the
# Infisical project midspot-prod (env prod) into the standalone server.
# The project id is read from ~/.config/midspot/project-id (one line, no newline issues).
set -euo pipefail

set -a
. /home/ncm/.config/cumvoteaza/infisical.env
set +a

TOKEN=$(/home/ncm/bin/infisical login --method universal-auth \
  --client-id "$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" \
  --client-secret "$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" \
  --domain https://eu.infisical.com --plain 2>/dev/null | tail -1)
if [ -z "$TOKEN" ]; then echo "could not obtain Infisical token" >&2; exit 1; fi

PROJECT_ID=$(cat /home/ncm/.config/midspot/project-id 2>/dev/null || true)
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "PUT_MIDSPOT_PROD_PROJECT_ID_HERE" ]; then
  echo "midspot-prod project id missing — put it in ~/.config/midspot/project-id" >&2
  exit 1
fi

exec /home/ncm/bin/infisical run --projectId "$PROJECT_ID" --env=prod \
  --token "$TOKEN" --domain https://eu.infisical.com -- /usr/bin/node server.js
