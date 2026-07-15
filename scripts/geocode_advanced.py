import json
import time
import requests
import re
import random

# Load data
with open('public/data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('scripts/district_bounds.json', 'r', encoding='utf-8') as f:
    bounds = json.load(f)

def parse_district(address):
    # Parse roman numerals or digits
    match = re.search(r'(?:Budapest\s+)?([IVXLCDM0-9]+)\.\s*ker', address, re.IGNORECASE)
    if match:
        return match.group(1).upper()
    if 'Margitsziget' in address:
        return 'XIII'
    return None

def is_in_bounding_box(lat, lon, bbox):
    # bbox format from Nominatim: [minLat, maxLat, minLon, maxLon]
    lat_min, lat_max, lon_min, lon_max = bbox
    return (lat_min <= lat <= lat_max) and (lon_min <= lon <= lon_max)

def clean_address_for_query(address):
    # Remove district numbers and words that confuse free geocoders
    addr = re.sub(r'(?:Budapest\s+)?([IVXLCDM0-9]+)\.\s*kerületi?\s*', '', address, flags=re.IGNORECASE)
    addr = re.sub(r'(?:Budapest\s+)?([IVXLCDM0-9]+)\.\s*ker\.\s*', '', address, flags=re.IGNORECASE)
    # Get just the street part before commas or parentheses
    addr = addr.split(',')[0].split('(')[0].strip()
    return addr

def geocode_item(item):
    address = item.get('address', '')
    district = parse_district(address)
    query_addr = clean_address_for_query(address)
    
    district_data = bounds.get(district) if district else None
    
    # We will try to search via Photon
    # Query: "query_addr, Budapest"
    q = f"{query_addr}, Budapest"
    url = f"https://photon.komoot.io/api/?q={q}&limit=5"
    
    try:
        headers = {"User-Agent": "BudapestGeo/1.0 (test@example.com)"}
        res = requests.get(url, headers=headers, timeout=5)
        if res.status_code == 200:
            res_data = res.json()
            
            # Look for the first result that falls inside the district bounding box
            if district_data and 'features' in res_data:
                for feature in res_data['features']:
                    geom = feature['geometry']['coordinates'] # [lon, lat]
                    g_lon, g_lat = geom[0], geom[1]
                    if is_in_bounding_box(g_lat, g_lon, district_data['boundingbox']):
                        return g_lat, g_lon, "Exact Match in Bbox"
        
        # If no exact match inside bbox, or no district known, fallback
        if district_data:
            # Fallback to district center with jitter
            lat = district_data['lat'] + random.uniform(-0.005, 0.005)
            lon = district_data['lon'] + random.uniform(-0.005, 0.005)
            return lat, lon, "Fallback to District Center"
        
        # Ultimate fallback to Budapest center
        lat = 47.4979 + random.uniform(-0.02, 0.02)
        lon = 19.0402 + random.uniform(-0.02, 0.02)
        return lat, lon, "Fallback to Budapest Center"

    except Exception as e:
        print(f"Error querying {q}: {e}")
        if district_data:
            return district_data['lat'], district_data['lon'], "Error Fallback to District"
        return 47.4979, 19.0402, "Error Fallback to Budapest"


# Test Mode: Pick 20 problem addresses (Margitsziget and XIII ker)
problem_items = [d for d in data if 'Margitsziget' in d.get('address', '') or 'XIII' in d.get('address', '')]
test_sample = problem_items[:20]

if not test_sample:
    test_sample = data[:20]

print(f"Running test on {len(test_sample)} items...")
results = []
for item in test_sample:
    addr = item.get('address')
    lat, lon, status = geocode_item(item)
    print(f"Address: {addr}")
    print(f" -> Lat: {lat:.5f}, Lon: {lon:.5f} | Status: {status}")
    print("-" * 50)
    item['lat'] = lat
    item['lon'] = lon
    item['geostatus'] = status
    results.append(item)
    time.sleep(1) # rate limit

with open('public/data_test.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Test run complete. See public/data_test.json for results.")
