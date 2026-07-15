import json
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[áä]', 'a', text)
    text = re.sub(r'[é]', 'e', text)
    text = re.sub(r'[í]', 'i', text)
    text = re.sub(r'[óöő]', 'o', text)
    text = re.sub(r'[úüű]', 'u', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

with open('public/data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

seen_slugs = set()
for item in data:
    base = slugify(f"{item.get('category', 'egyeb')} {item.get('address', 'ismeretlen')}")
    slug = base
    counter = 1
    while slug in seen_slugs:
        slug = f"{base}-{counter}"
        counter += 1
    seen_slugs.add(slug)
    item['slug'] = slug

with open('public/data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Generated slugs for {len(data)} items.")
