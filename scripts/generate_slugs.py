import hashlib
import json
import re

# Next.js writes build artifacts named "<slug>.prerender-config.json" into
# .next/output/functions/helyszin/, so the slug must stay well under the
# 255-byte filename limit.
MAX_SLUG_LENGTH = 150
HASH_LENGTH = 8

def slugify(text):
    text = text.lower()
    text = re.sub(r'[áä]', 'a', text)
    text = re.sub(r'[é]', 'e', text)
    text = re.sub(r'[í]', 'i', text)
    text = re.sub(r'[óöő]', 'o', text)
    text = re.sub(r'[úüű]', 'u', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def shorten(base):
    if len(base) <= MAX_SLUG_LENGTH:
        return base
    # A digest of the full text keeps truncated slugs unique and stable across runs.
    digest = hashlib.sha1(base.encode('utf-8')).hexdigest()[:HASH_LENGTH]
    head = base[:MAX_SLUG_LENGTH - HASH_LENGTH - 1]
    if '-' in head:
        head = head[:head.rfind('-')]
    return f"{head.strip('-')}-{digest}"

with open('public/data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

seen_slugs = set()
for item in data:
    base = slugify(f"{item.get('category', 'egyeb')} {item.get('address', 'ismeretlen')}")
    slug = shorten(base)
    counter = 1
    while slug in seen_slugs:
        slug = shorten(f"{base}-{counter}")
        counter += 1
    seen_slugs.add(slug)
    item['slug'] = slug

with open('public/data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Generated slugs for {len(data)} items.")
