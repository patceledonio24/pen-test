# Website Load Testing Project (k6)

This project runs load tests directly against your staging site/server using **k6**.

> ⚠️ Only run tests against systems you own or have written permission to test.

## Answer to your question

Yes — your logs show page 1 is reached and submitted.
Failures mean the server did not advance your submission to next pages (likely validation/data mismatch).

## macOS: run again with all fields filled

### 1) Install + verify

```bash
brew install k6
cd /workspace/pen-test
k6 version
chmod +x run-loadtest.sh
```

### 2) Refresh field inventory from live page

```bash
python tools/extract_registration_fields.py > registration-fields.json
```

### 3) Build full payload template (all detected fields)

```bash
python tools/generate_full_payload_template.py
open sample-registration-full.json
```

Update values in `sample-registration-full.json` to valid staging values, especially dropdown + `*_VI` fields.

### 4) Test register mode with full payload

```bash
MODE=register FORM_DATA_FILE=sample-registration-full.json VUS=1 DURATION=30s \
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```

### 5) Enforce multi-page progression

```bash
MODE=register FORM_DATA_FILE=sample-registration-full.json \
REQUIRE_NEXT_PAGE=YES MIN_PAGES_REACHED=3 NEXT_PAGE_MARKER="Confirmation" \
MAX_REDIRECT_STEPS=6 VUS=1 DURATION=30s \
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```

If this still fails, the remaining issue is usually invalid value combinations required by server-side business rules.


## Interpreting your latest log output

Your run is healthy at HTTP/network level, but flow checks show the app is still not advancing:

- `submit accepted (200/302)` passed: the POST call itself worked.
- `redirect target present when 302` failed: server returned `302` but no usable `Location`/client redirect target was found.
- `next page observed` failed: the submission stayed on page 1 for that iteration.
- `minimum pages reached` failed: the flow never reached your configured page depth.
- `no page-1 validation errors detected` failed: server likely returned required-field messages (e.g., "Please select..." / "Please input...").
- `configured marker found on final reached page` failed: the final reached page did not contain your `NEXT_PAGE_MARKER`.

This usually means page-1 server validation/business rules rejected the payload, even if transport-level requests were successful.

By default, `STRICT_SAVE_SIGNAL=YES` so `response indicates save/success` only passes when page progression is actually observed (or when you intentionally set `MIN_PAGES_REACHED=1` and rely on a success marker).

Use debug mode to print redirect/body hints from k6:

```bash
MODE=register FORM_DATA_FILE=sample-registration-full.json \
REQUIRE_NEXT_PAGE=YES MIN_PAGES_REACHED=3 NEXT_PAGE_MARKER="Confirmation" \
DEBUG_RESPONSE=YES STRICT_SAVE_SIGNAL=YES VUS=1 DURATION=30s \
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```

If you only want a direct yes/no for page-2 reachability, run with `REQUIRE_NEXT_PAGE=YES`; then `next page reached when required` will fail immediately when page 2 is not reached.

If your output **does not** show `[info] DEBUG_RESPONSE=...` from the runner, your local copy is outdated; pull latest changes before re-running.

## Quick reference

```bash
# smoke only
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG

# full registration submit payload
MODE=register FORM_DATA_FILE=sample-registration-full.json VUS=1 DURATION=30s \
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG

# optional: relax save/success check (not recommended)
MODE=register STRICT_SAVE_SIGNAL=NO VUS=1 DURATION=30s \
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```


## If page 2 is still not reached

Use a low-noise debug run and send these outputs:

```bash
MODE=register VUS=1 DURATION=30s REQUIRE_NEXT_PAGE=YES MIN_PAGES_REACHED=2 \
DEBUG_RESPONSE=YES STRICT_SAVE_SIGNAL=YES FORM_DATA_FILE=sample-registration-full.json \
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```

From your screenshot, these fields are visibly required on page 1 and must be valid in payload values: `LevelCode(+_VI)`, `Lastname`, `Firstname`, `ReligionCode(+_VI)`, `Birthdate`, `GenderCode(+_VI)`, `NationalityCode(+_VI)`.


## Quick version sanity check

Before troubleshooting payload values, verify your local scripts are updated:

```bash
./run-loadtest.sh --doctor
```

Expected doctor output should include:
- `runner_version=...`
- `register_script_check=ok (validation check present)`
- `runner_flags=ok (DEBUG_RESPONSE/STRICT_SAVE_SIGNAL supported)`

If these do not appear, your local copy is stale (wrong branch or pull target).
