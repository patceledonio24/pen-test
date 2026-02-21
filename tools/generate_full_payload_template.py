#!/usr/bin/env python3
import json
from pathlib import Path

src = Path('registration-fields.json')
out = Path('sample-registration-full.json')

fields = json.loads(src.read_text())['fields']

# Base defaults for common known fields
preset = {
    'LevelCode': 'Senior High School',
    'LevelCode_VI': '14',
    'StrandCode': 'STEM',
    'StrandCode_VI': '1',
    'Lastname': 'Loadtest',
    'Firstname': 'User',
    'Middlename': 'Sample',
    'MiddleInitial': 'S',
    'Nickname': 'LT',
    'ReligionCode': 'Roman Catholic',
    'ReligionCode_VI': '1',
    'Birthdate': '2008-01-15',
    'Birthplace': 'Manila',
    'GenderCode': 'Male',
    'GenderCode_VI': '1',
    'NationalityCode': 'Filipino',
    'NationalityCode_VI': '1',
    'EmailAddress': '',
    'ReEmailAddress': '',
    'MobileNo': '',
    'PrimaryTelNo': '',
    'PrimaryAddress': '123 Sample St., Manila',
    'MothersLastname': 'Loadtest',
    'MothersFirstname': 'Mother',
    'MothersContactNo': '09170000002',
    'MothersOccupation': 'Teacher',
    'MothersEmailAddress': 'mother@example.test',
    'FathersLastname': 'Loadtest',
    'FathersFirstName': 'Father',
    'FathersContactNo': '09170000003',
    'FathersOccupation': 'Engineer',
    'FathersEmailAddress': 'father@example.test',
    'IDGuardianName': 'Loadtest Guardian',
    'IDRelationshipCode': 'Parent',
    'IDRelationshipCode_VI': '1',
    'IDMobileNo': '09170000004',
    'IDEmailAddress': 'guardian@example.test',
    'IDPrimaryAddress': '123 Sample St., Manila',
    'hasSiblings': 'N',
    'OneLastname': '',
    'OneFirstname': '',
    'TwoLastName': '',
    'TwoFirstName': '',
    'ThreeLastName': '',
    'ThreeFirstName': '',
    'FourLastName': '',
    'FourFirstName': '',
    'FiveLastName': '',
    'FiveFirstName': '',
    'OneSchool': 'Sample Junior High School',
    'OneDivision': 'Sample City',
    'OneSchoolFundTypeCode': 'Private',
    'OneSchoolFundTypeCode_VI': '2',
    'LRN': '123456789012',
}

payload = {}
for f in fields:
    name = f['name']
    if name in ('btnSubmit', 'btnCancel', '__RequestVerificationToken'):
        continue
    if '$DDD$' in name:
        continue
    payload[name] = preset.get(name, '')

out.write_text(json.dumps(payload, indent=2) + '\n')
print(f'Wrote {out} with {len(payload)} fields')
