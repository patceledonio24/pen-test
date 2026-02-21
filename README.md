# Website Load Testing Project (k6)

This project runs load tests directly against your staging site/server using **k6**.

> ⚠️ Only run tests against systems you own or have written permission to test.

## Quick start

Smoke (GET only):

```bash
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```

Registration submit (GET + POST, attempts to save records):

```bash
MODE=register VUS=1 DURATION=30s ./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```

## Prerequisite

Install `k6`:
- https://k6.io/docs/get-started/installation/

## Actual fields from the live site

- `REQUIRED_FIELDS.md` → practical list of fields to fill for save attempts
- `registration-fields.json` → extracted field inventory from the live form

Regenerate inventory anytime:

```bash
python tools/extract_registration_fields.py > registration-fields.json
```

## Multi-page flow verification (including possible 3rd page)

Yes — the register script now supports checking beyond page 2 by following redirect chains.

It now:
- submits page 1
- follows redirect(s) step-by-step (up to `MAX_REDIRECT_STEPS`)
- tracks how many pages were reached
- optionally validates marker text on the final reached page

Useful flags:
- `REQUIRE_NEXT_PAGE=YES` → require at least page 2
- `MIN_PAGES_REACHED=3` → enforce reaching a third page
- `NEXT_PAGE_MARKER="Confirmation"` → assert expected text on the last reached page
- `MAX_REDIRECT_STEPS=5` → cap number of redirect-follow GETs

Example (strict third-page expectation):

```bash
MODE=register REQUIRE_NEXT_PAGE=YES MIN_PAGES_REACHED=3 \
NEXT_PAGE_MARKER="Confirmation" MAX_REDIRECT_STEPS=6 \
FORM_DATA_FILE=sample-registration.json VUS=1 DURATION=30s \
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```

## Save actual registration data

1. Edit `sample-registration.json` with valid staging values.
2. Start with `VUS=1` to confirm save behavior.
3. Increase load gradually only after flow checks pass.

The submit script will:
- load page 1 and extract `__RequestVerificationToken`
- submit your fields
- auto-generate unique `EmailAddress` / `MobileNo` (and sync `ReEmailAddress`) when blank
- follow redirect chain and validate page progression

## Tuning

```bash
MODE=register VUS=5 DURATION=1m ./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
MODE=register VUS=10 DURATION=2m ./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```
