#!/usr/bin/env python3
"""fast-flights bridge for midspot.

Wraps the open-source Google Flights scraper `fast-flights`
(github.com/Mohamed3on/flights, fork of AWeirdDev/flights — base64-protobuf,
no API key, EU consent cookie built in) behind a tiny loopback HTTP API:

  GET /health
  GET /flights?from=OTP&to=BER&date_from=2026-11-18&date_to=2026-11-21
    -> {"options": [{date, flightNumber, departLocal, arriveLocal,
                     departUtc, arriveUtc, durationMinutes, priceEur}, ...]}

Times from Google are local wall-clock per airport; we convert to UTC epochs
using tz_map.json (IATA -> IANA tz, generated from the Aviasales airports.json).

Run:  python3 service.py            (binds 127.0.0.1:8850)
Prod: systemd --user unit fastflights.service (see ops/fastflights.service).

Note: gray-area scraping of Google — for local testing / fallback only;
production should prefer the official Tequila API once approved.
"""
import json
import os
import sys
import threading
import time
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
from zoneinfo import ZoneInfo

PORT = int(os.environ.get("PORT", "8850"))
HOST = os.environ.get("HOST", "127.0.0.1")
MIN_SECONDS_BETWEEN_QUERIES = float(os.environ.get("MIN_QUERY_INTERVAL", "1.2"))

HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(HERE, "tz_map.json")) as f:
    TZ_MAP = json.load(f)

from fast_flights import FlightQuery, Passengers, create_query, get_flights  # noqa: E402

_last_query_lock = threading.Lock()
_last_query_at = 0.0


_err_lock = threading.Lock()
_consec_errors = 0


def note_error():
    global _consec_errors
    with _err_lock:
        _consec_errors += 1


def note_ok():
    global _consec_errors
    with _err_lock:
        _consec_errors = 0


def effective_interval():
    """Triple the spacing while Google is refusing us (error 13 / blocks)."""
    with _err_lock:
        return MIN_SECONDS_BETWEEN_QUERIES * (3.0 if _consec_errors >= 3 else 1.0)


def throttle():
    global _last_query_at
    with _last_query_lock:
        wait = effective_interval() - (time.monotonic() - _last_query_at)
        if wait > 0:
            time.sleep(wait)
        _last_query_at = time.monotonic()


def local_to_utc(iata, date_arr, time_arr):
    """[y,m,d],[h,m] local wall clock at airport -> (utc_epoch, iso_local_with_offset)."""
    tz_name = TZ_MAP.get(iata, "UTC")
    tz = ZoneInfo(tz_name)
    y, m, d = date_arr
    h, mi = time_arr
    local = datetime(y, m, d, h, mi, tzinfo=tz)
    return int(local.timestamp()), local.isoformat()


def query_date(from_iata, to_iata, date_iso, retries=2):
    """One date query with backoff retries. Returns None if all attempts fail."""
    for attempt in range(retries + 1):
        throttle()
        q = create_query(
            flights=[FlightQuery(date=date_iso, from_airport=from_iata, to_airport=to_iata)],
            trip="one-way",
            passengers=Passengers(adults=1),
            seat="economy",
            currency="EUR",
            language="en",
        )
        try:
            result = get_flights(q)
            note_ok()
            return result
        except Exception as e:
            note_error()
            sys.stderr.write(
                f"[fastflights] {from_iata}->{to_iata} {date_iso} attempt {attempt + 1} failed: {e}\n"
            )
            if attempt < retries:
                time.sleep(4.0 * (attempt + 1))  # backoff: 4s, 8s
    return None


def normalize(from_iata, to_iata, date_iso, flight):
    legs = flight.flights
    if not legs:
        return None
    # Google sometimes returns flights without a price — skip them (we rank by price).
    price = getattr(flight, "price", None)
    if price is None:
        return None
    try:
        price_eur = float(price)
    except (TypeError, ValueError):
        return None
    if price_eur <= 0:
        return None
    first, last = legs[0], legs[-1]
    dep_utc, dep_local = local_to_utc(first.from_airport.code, first.departure.date, first.departure.time)
    arr_utc, arr_local = local_to_utc(last.to_airport.code, last.arrival.date, last.arrival.time)
    return {
        "date": date_iso,
        "flightNumber": " ".join(flight.airlines) if flight.airlines else "",
        "departLocal": dep_local,
        "arriveLocal": arr_local,
        "departUtc": dep_utc,
        "arriveUtc": arr_utc,
        "durationMinutes": int(sum(l.duration for l in legs)),
        "priceEur": price_eur,
    }


def search(from_iata, to_iata, date_from, date_to):
    from datetime import date, timedelta
    d0 = date.fromisoformat(date_from)
    d1 = date.fromisoformat(date_to)
    options = []
    cur = d0
    while cur <= d1:
        date_iso = cur.isoformat()
        try:
            result = query_date(from_iata, to_iata, date_iso)
            if result is None:
                raise RuntimeError("all query attempts failed")
            # one retry on empty (transient consent/block hiccups)
            if len(result) == 0:
                time.sleep(2)
                result = query_date(from_iata, to_iata, date_iso, retries=1)
                if result is None:
                    result = []
            for f in result:
                opt = normalize(from_iata, to_iata, date_iso, f)
                if opt:
                    options.append(opt)
        except Exception as e:
            sys.stderr.write(f"[fastflights] {from_iata}->{to_iata} {date_iso} failed: {e}\n")
        cur += timedelta(days=1)
    return options


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def _send_json(self, obj, status=200):
        body = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        u = urlparse(self.path)
        if u.path == "/health":
            self._send_json({"ok": True, "tz": len(TZ_MAP)})
            return
        if u.path == "/flights":
            qs = parse_qs(u.query)
            try:
                from_iata = qs["from"][0].upper()
                to_iata = qs["to"][0].upper()
                date_from = qs["date_from"][0]
                date_to = qs.get("date_to", [date_from])[0]
            except (KeyError, IndexError):
                self._send_json({"error": "need from,to,date_from[,date_to]"}, 400)
                return
            options = search(from_iata, to_iata, date_from, date_to)
            self._send_json({"options": options})
            return
        self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    sys.stderr.write(f"[fastflights] listening on http://{HOST}:{PORT}\n")
    server.serve_forever()
