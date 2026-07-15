import requests
import json
import time

districts = [
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", 
    "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "X8", "XIX", "XX", 
    "XXI", "XXII", "XXIII"
]

results = {}

for d in districts:
    if d == "X8":
        d_str = "XVIII"
    else:
        d_str = d
    query = f"Budapest {d_str}. kerület, Hungary"
    print(f"Fetching {query}...")
    try:
        url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=1"
        res = requests.get(url, headers={"User-Agent": "BudapestGeo/1.0"})
        data = res.json()
        if data:
            results[d_str] = {
                "lat": float(data[0]["lat"]),
                "lon": float(data[0]["lon"]),
                "boundingbox": [float(x) for x in data[0]["boundingbox"]]
            }
        else:
            print(f"Failed {d_str}")
    except Exception as e:
        print(f"Error {d_str}: {e}")
    time.sleep(1.5)

with open("scripts/district_bounds.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("Done!")
