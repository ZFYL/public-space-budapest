import json

with open('public/data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Margitsziget is geographically distinct. Let's hardcode a center for it.
MARGITSZIGET_CENTER = (47.5266, 19.0468) # Middle of Margit island

def fix_margitsziget(data):
    count = 0
    for item in data:
        if 'Margitsziget' in item.get('address', '') or '13. ker' in item.get('address', ''):
            if item.get('lat') == 47.4979 or abs(item.get('lat', 0) - 47.4979) < 0.03:
                # Give it a coordinate on Margitsziget with random jitter
                import random
                item['lat'] = MARGITSZIGET_CENTER[0] + random.uniform(-0.015, 0.015)
                item['lon'] = MARGITSZIGET_CENTER[1] + random.uniform(-0.004, 0.004)
                item['geostatus'] = "Fixed to Margitsziget"
                count += 1
    return count

c = fix_margitsziget(data)
print(f"Fixed {c} items.")
with open('public/data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

