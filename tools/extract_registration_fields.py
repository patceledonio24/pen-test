#!/usr/bin/env python3
import re
import json
import urllib.request

URL = 'https://nsdga.evolvesoftware.com.ph/REG'

html = urllib.request.urlopen(URL, timeout=30).read().decode('utf-8', 'ignore')
form_match = re.search(r'<form action="/REG" method="post">(.*?)</form>', html, re.S | re.I)
if not form_match:
    raise SystemExit('Could not find registration form with action="/REG"')

form_html = form_match.group(1)
pat = re.compile(r'<(input|select|textarea)\b([^>]*\bname="[^"]+"[^>]*)>', re.I)
required_names = []
fields = []

for tag, attrs in pat.findall(form_html):
    def attr(name):
        m = re.search(rf'\b{name}="([^"]*)"', attrs, re.I)
        return m.group(1) if m else ''

    name = attr('name')
    if not name:
        continue

    row = {
        'name': name,
        'tag': tag.lower(),
        'type': attr('type'),
        'id': attr('id'),
        'value_hint': attr('value'),
        'required_hint': bool(attr('data-val-required')),
    }

    if row['required_hint']:
        required_names.append(name)

    if name not in {f['name'] for f in fields}:
        fields.append(row)

print(json.dumps({'url': URL, 'required_hints': required_names, 'fields': fields}, indent=2))
