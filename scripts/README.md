# Data pipeline

All scripts run from the **repository root** with Python 3 (only `requests`
needed beyond the stdlib: `pip install requests`).

| Script | What it does |
|---|---|
| `get_districts.py` | Fetches bounding boxes + centers for all 23 Budapest districts from Nominatim → `scripts/district_bounds.json` |
| `geocode_advanced.py` | Geocodes permit addresses via Photon, validating hits against the district bounding box; falls back to district center with jitter |
| `fix_script.py` | Manual geo corrections (e.g. relocates mis-geocoded Margitsziget entries) |
| `generate_slugs.py` | Generates unique, SEO-friendly URL slugs for every permit → written back into `public/data.json` |

Source of truth: `data/kozterulet-hasznalati-hatarozatok.xlsx` (official
municipal export). The app renders `public/data.json`.

Geocoding etiquette: both Nominatim and Photon are free community services —
the scripts sleep between requests; keep it that way.
