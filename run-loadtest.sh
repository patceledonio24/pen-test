#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="${1:-${TARGET_URL:-}}"
MODE="${MODE:-smoke}"
VUS="${VUS:-10}"
DURATION="${DURATION:-60s}"
FORM_DATA_FILE="${FORM_DATA_FILE:-sample-registration-full.json}"
REQUIRE_NEXT_PAGE="${REQUIRE_NEXT_PAGE:-NO}"
NEXT_PAGE_MARKER="${NEXT_PAGE_MARKER:-}"
MIN_PAGES_REACHED="${MIN_PAGES_REACHED:-2}"
MAX_REDIRECT_STEPS="${MAX_REDIRECT_STEPS:-5}"
DEBUG_RESPONSE="${DEBUG_RESPONSE:-NO}"
STRICT_SAVE_SIGNAL="${STRICT_SAVE_SIGNAL:-YES}"

if [[ -z "${TARGET_URL}" ]]; then
  cat <<'USAGE'
Usage:
  ./run-loadtest.sh <target-url>

Modes:
  MODE=smoke        # GET load only (default)
  MODE=register     # GET + POST submit registration form

Examples:
  ./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
  MODE=register VUS=1 DURATION=30s ./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
  MODE=register REQUIRE_NEXT_PAGE=YES NEXT_PAGE_MARKER="Upload" ./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
  MODE=register FORM_DATA_FILE=sample-registration-full.json MIN_PAGES_REACHED=3 NEXT_PAGE_MARKER="Confirmation" DEBUG_RESPONSE=YES STRICT_SAVE_SIGNAL=YES ./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
USAGE
  exit 1
fi

if ! command -v k6 >/dev/null 2>&1; then
  echo "[error] 'k6' is not installed."
  echo "Install it first: https://k6.io/docs/get-started/installation/"
  exit 1
fi

export TARGET_URL
export CONFIRM_AUTHORIZATION="YES"
export VUS
export DURATION

if [[ "${MODE}" == "register" ]]; then
  if [[ ! -f "${FORM_DATA_FILE}" ]]; then
    echo "[error] FORM_DATA_FILE not found: ${FORM_DATA_FILE}"
    exit 1
  fi
  export FORM_DATA_JSON
  FORM_DATA_JSON="$(cat "${FORM_DATA_FILE}")"
  export REQUIRE_NEXT_PAGE
  export NEXT_PAGE_MARKER
  export MIN_PAGES_REACHED
  export MAX_REDIRECT_STEPS
  export DEBUG_RESPONSE
  export STRICT_SAVE_SIGNAL
  echo "[info] Running registration submit test against: ${TARGET_URL}"
  echo "[info] MODE=${MODE}, VUS=${VUS}, DURATION=${DURATION}, FORM_DATA_FILE=${FORM_DATA_FILE}"
  echo "[info] REQUIRE_NEXT_PAGE=${REQUIRE_NEXT_PAGE}, NEXT_PAGE_MARKER=${NEXT_PAGE_MARKER:-<none>}"
  echo "[info] MIN_PAGES_REACHED=${MIN_PAGES_REACHED}, MAX_REDIRECT_STEPS=${MAX_REDIRECT_STEPS}"
  echo "[info] DEBUG_RESPONSE=${DEBUG_RESPONSE}, STRICT_SAVE_SIGNAL=${STRICT_SAVE_SIGNAL}"
  k6 run loadtest/register-submit.js
else
  echo "[info] Running smoke test against: ${TARGET_URL}"
  echo "[info] MODE=${MODE}, VUS=${VUS}, DURATION=${DURATION}"
  k6 run loadtest/smoke.js
fi
