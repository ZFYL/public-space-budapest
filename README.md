<div align="center">

# 🗺️ Budapest Public Space Map

### *Ki foglalja el a közterületet Budapesten?*

**An open-source civic-tech map of every public-space usage permit in Budapest** — restaurant terraces, construction sites, film shoots and street closures, built from official municipal decision records.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Leaflet](https://img.shields.io/badge/Leaflet-maps-199900?logo=leaflet)](https://leafletjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Open Data](https://img.shields.io/badge/open-data-orange)](data/)

![Share card preview](docs/og-preview.png)

</div>

---

## What is this?

Budapest's streets fill up every day with terraces, construction containers and film-shoot closures — but **who got a permit, for what, and until when?**

This project takes the official public-space usage decisions (*közterület-használati határozatok*) published by the Municipality of Budapest as a raw Excel sheet, and turns them into something citizens can actually use:

- 🗺️ **Interactive map** of ~1,500 geocoded permits (Leaflet, marker clustering, heatmap overlay)
- 🔍 **Filters** by district, usage category, company and permit status (active / expiring / expired)
- 🎨 **Color modes** — color the map by expiry, category, company, size or start date
- 📋 **Sortable table view** of the full dataset
- 🔮 **Upcoming outlook** — what comes into effect in the next 30 days / 3 months, grouped by start date
- 📄 **A dedicated SEO page for every permit** with structured data (FAQ JSON-LD), unique metadata and a **generated Open Graph share card**
- 🌍 **Fully bilingual (HU / EN)** — content, metadata and share images, with geo-based language selection
- 🌗 Dark / light / satellite / terrain base maps

**The full data pipeline is included** — from the original XLSX (in [`data/`](data/)) through the Python cleaning/geocoding scripts (in [`scripts/`](scripts/)) to the final [`public/data.json`](public/data.json).

## Tech stack

| Layer | Tools |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Map | Leaflet, react-leaflet, marker clustering, leaflet.heat |
| UI | MUI v9, Tailwind CSS v4 |
| i18n | Locale-prefixed routes (`/hu`, `/en`), geo-based selection in `proxy.ts`, typed dictionaries in `lib/i18n.ts` — no i18n library |
| Share images | `next/og` (Satori) — generated 1200×630 cards per locale for the home page, every permit and each outlook window |
| SEO | Per-locale metadata, canonical + `hreflang` (incl. `x-default`), `sitemap.xml` (~2,950 URLs with language alternates), `robots.txt`, JSON-LD (WebSite, Organization, Dataset, FAQ, ItemList) |
| Data pipeline | Python (pandas-free, stdlib + requests), Photon & Nominatim geocoding |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Configuration

Copy `.env.example` to `.env.local` and set your domain:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.hu
```

Everything domain-dependent — canonical URLs, Open Graph images, `sitemap.xml`, `robots.txt`, JSON-LD — derives from this single variable (see [`lib/site.ts`](lib/site.ts)). No other change is needed to go live on any domain.

Optional: `NEXT_PUBLIC_CLARITY_PROJECT_ID` points analytics at your own Microsoft Clarity project (set it empty to disable).

## Languages

The site is fully bilingual and serves **Hungarian to visitors in Hungary, English to everyone else**:

| Layer | Where |
|---|---|
| Language detection | [`proxy.ts`](proxy.ts) — cookie → geo (`x-vercel-ip-country`) → `Accept-Language` → English |
| Translations | [`lib/i18n.ts`](lib/i18n.ts) — one typed `Dictionary` per locale, including English labels for all 60+ official permit categories |
| Routes | `/hu/…` and `/en/…`; unprefixed URLs redirect to the detected locale |

An explicit choice via the language switcher is stored in a cookie and **always** beats geo detection — a Hungarian reading in English stays in English. Every page carries `hreflang` alternates plus an `x-default`, so Google serves the right language per region.

To add a locale: add it to `LOCALES`, write its `Dictionary`, and everything else (routes, sitemap, share cards, hreflang) follows automatically.

## Deploying on a .hu domain

The site is a standard Next.js app — Vercel is the zero-config path:

1. Import the GitHub repo into [Vercel](https://vercel.com/new) → deploy (no settings needed).
2. Buy your `.hu` domain at any Hungarian registrar (e.g. forpsi.hu, rackhost.hu, tarhely.eu).
3. In Vercel → Project → Settings → Domains, add the domain, then at the registrar set the DNS records Vercel shows you (an `A` record for the apex + a `CNAME` for `www`).
4. Set `NEXT_PUBLIC_SITE_URL=https://your-domain.hu` in Vercel → Settings → Environment Variables and redeploy.

Full step-by-step guide (including registrar specifics and Google Search Console setup): [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Data pipeline

```
data/kozterulet-hasznalati-hatarozatok.xlsx     ← original official records
        │  parse + clean + categorize
        ▼
scripts/get_districts.py                        ← district bounding boxes (Nominatim)
scripts/geocode_advanced.py                     ← address → lat/lon (Photon + bbox validation)
scripts/fix_script.py                           ← manual geo corrections (e.g. Margitsziget)
scripts/generate_slugs.py                       ← SEO-friendly URL slugs
        ▼
public/data.json                                ← what the app renders
```

Run the scripts from the repository root, e.g. `python3 scripts/generate_slugs.py`.

### ⚠️ Data disclaimer

All data is **informational only**. Coordinates come from automated geocoding of free-text addresses and may be imprecise; permit statuses may have changed since publication. The dataset reflects the official records at the time of export.

## Hungarian summary / Magyar összefoglaló

Nyílt forráskódú civic-tech projekt, amely Budapest hivatalos közterület-használati határozatait teszi böngészhetővé: interaktív térkép, szűrők kerület / kategória / cég / státusz szerint, kereshető lista, valamint minden engedélyhez saját, keresőbarát aloldal. Az eredeti hivatalos táblázat és a teljes adatfeldolgozó kód is része a repónak. Az adatok tájékoztató jellegűek.

## About the author

Built by **[Gergely Kovács](https://gregorysmith.eu)** — founder of **Bonvo Consulting Kft.**, a Budapest-based consulting studio.

> **This site went from a raw Excel sheet to a production, SEO-optimized data product in days.** We do this for clients too: deep data analysis and research to find a competitive edge in any market, plus full-service contract development — web & mobile apps, data platforms, and data-driven marketing. **[Get in touch →](mailto:kovigerri@gmail.com)**

| | |
|---|---|
| 🌐 Portfolio | [gregorysmith.eu](https://gregorysmith.eu) |
| 💼 LinkedIn | [linkedin.com/in/kovacsgeri](https://www.linkedin.com/in/kovacsgeri/) |
| 🎿 Bonvo Ski (app) | [bonvo.ski](https://bonvo.ski) · [App Store](https://apps.apple.com/app/bonvo-ski-3d-ski-snowboard/id6753033871) |
| 🏢 Bonvo for Business | [business.bonvo.ski](https://business.bonvo.ski) |
| 📸 Instagram | [@bonvo.ski](https://www.instagram.com/bonvo.ski/) |

## License

Code is released under the [MIT License](LICENSE). The underlying permit records are public municipal data; map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
