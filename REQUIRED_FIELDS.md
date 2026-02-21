# Registration fields identified from live form

Source checked: `https://nsdga.evolvesoftware.com.ph/REG`.

## Important clarification

You **are passing through page 1** (the first registration form loads and POST is sent).
When checks fail for next page/page 3, it means the server likely kept you on page 1 due to validation/data rules.

## Required hints from HTML (`data-val-required`)

These controls expose required hints:

- `LevelCode`
- `StrandCode`
- `ReligionCode`
- `Birthdate`
- `GenderCode`
- `NationalityCode`
- `OneSchoolFundTypeCode`

## Full-field template added

Use `sample-registration-full.json` to send nearly all detected form fields (excluding UI-only/internal fields such as `btnSubmit`, `btnCancel`, and `*$DDD$*`).

Generate/update this file from current live field inventory:

```bash
python tools/generate_full_payload_template.py
```

## Notes

- Dropdown fields often require both visible text and hidden `*_VI` code value.
- If values are not valid for the current staging configuration, server may not advance to next page.
