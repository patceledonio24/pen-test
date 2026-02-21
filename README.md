# Website Load Testing Project (k6)

This project runs load tests directly against your staging site/server using **k6**.

> ⚠️ Only run tests against systems you own or have written permission to test.

## macOS: test this again (step-by-step)

### 1) Install prerequisites

Install Homebrew (if not yet installed):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Install `k6`:

```bash
brew install k6
```

### 2) Verify installation

From your project folder:

```bash
cd /workspace/pen-test
k6 version
chmod +x run-loadtest.sh
```

### 3) Update registration payload values

Open and edit the payload template so values are valid for your staging environment:

```bash
open sample-registration.json
```

Important: ensure dropdown-backed fields and their hidden `*_VI` values are valid in your environment.

### 4) Run a smoke test first (GET only)

```bash
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```

### 5) Run registration submit flow (page 1 save attempt)

```bash
MODE=register VUS=1 DURATION=30s \
FORM_DATA_FILE=sample-registration.json \
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```

### 6) Validate multi-page flow (2nd/3rd page)

If your flow should continue after page 1, enforce it:

```bash
MODE=register REQUIRE_NEXT_PAGE=YES MIN_PAGES_REACHED=3 \
NEXT_PAGE_MARKER="Confirmation" MAX_REDIRECT_STEPS=6 \
FORM_DATA_FILE=sample-registration.json VUS=1 DURATION=30s \
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```

- `REQUIRE_NEXT_PAGE=YES`: must reach at least page 2
- `MIN_PAGES_REACHED=3`: enforce third-page reach
- `NEXT_PAGE_MARKER`: text that should appear on final reached page

### 7) Scale load gradually after successful low-volume run

```bash
MODE=register VUS=5 DURATION=1m ./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
MODE=register VUS=10 DURATION=2m ./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```

---

## Actual fields from the live site

- `REQUIRED_FIELDS.md` → practical list of fields to fill for save attempts
- `registration-fields.json` → extracted field inventory from the live form

Regenerate inventory anytime:

```bash
python tools/extract_registration_fields.py > registration-fields.json
```

## How the register script works

The submit script will:
- load page 1 and extract `__RequestVerificationToken`
- submit your fields
- auto-generate unique `EmailAddress` / `MobileNo` (and sync `ReEmailAddress`) when blank
- follow redirect chain and validate page progression

## Quick reference commands

```bash
# smoke only
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG

# submit form data
MODE=register FORM_DATA_FILE=sample-registration.json VUS=1 DURATION=30s \
./run-loadtest.sh https://nsdga.evolvesoftware.com.ph/REG
```
