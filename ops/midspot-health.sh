#!/usr/bin/env bash
# midspot health probe — run every 5 min by midspot-health.timer (systemd --user).
# Checks the loopback (the app itself on 127.0.0.1:3005) and the public domain
# (through the Cloudflare tunnel). On failure it echoes a timestamped FAIL line to
# stdout/stderr, which lands in the journal:
#   journalctl --user -u midspot-health.service --no-pager
# Exit code 0 = all checks passed, 1 = at least one FAIL.
set -u

ts() { date -u +%Y-%m-%dT%H:%M:%SZ; }

fail=0

if ! curl -fsS --max-time 10 http://127.0.0.1:3005/api/health >/dev/null 2>&1; then
  echo "$(ts) FAIL loopback http://127.0.0.1:3005/api/health"
  fail=1
fi

if ! curl -fsS --max-time 15 -o /dev/null https://midspot.ncmihai.dev/api/health 2>/dev/null; then
  echo "$(ts) FAIL public https://midspot.ncmihai.dev/api/health"
  fail=1
fi

exit "$fail"
