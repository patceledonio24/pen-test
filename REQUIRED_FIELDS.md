# Registration fields identified from live form

Source checked: `https://nsdga.evolvesoftware.com.ph/REG`.

## Required hints from the HTML (`data-val-required`)

These controls expose required validation hints on the page:

- `LevelCode`
- `StrandCode`
- `ReligionCode`
- `Birthdate`
- `GenderCode`
- `NationalityCode`
- `OneSchoolFundTypeCode`

## Common fields you should fill for successful save

Based on the current live form structure, fill at least:

- School level: `LevelCode`, `LevelCode_VI`
- Strand: `StrandCode`, `StrandCode_VI` (for SHS level)
- Name: `Lastname`, `Firstname`, `Middlename` (or `MiddleInitial`)
- Birth details: `Birthdate`, `Birthplace`
- Demographics: `GenderCode`, `GenderCode_VI`, `NationalityCode`, `NationalityCode_VI`, `ReligionCode`, `ReligionCode_VI`
- Contact: `EmailAddress`, `ReEmailAddress`, `MobileNo`, `PrimaryAddress`
- Parent/guardian basics: `MothersLastname`, `MothersFirstname`, `MothersContactNo`, `FathersLastname`, `FathersFirstName`, `FathersContactNo`
- Previous school: `OneSchool`, `OneDivision`, `OneSchoolFundTypeCode`, `OneSchoolFundTypeCode_VI`
- Learner ref: `LRN`

> Note: dropdowns in this form often use both visible text fields and hidden `*_VI` values.
> Use valid code values from your environment to avoid server-side validation errors.

## Regenerate field inventory

Run:

```bash
python tools/extract_registration_fields.py > registration-fields.json
```

This produces an inventory of all detected input names from the live page.
