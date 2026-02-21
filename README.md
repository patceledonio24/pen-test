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

## Quick reference

```bash
# smoke only
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG

# full registration submit payload
MODE=register FORM_DATA_FILE=sample-registration-full.json VUS=1 DURATION=30s \
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```
