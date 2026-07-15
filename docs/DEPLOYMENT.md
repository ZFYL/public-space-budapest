# Deployment guide — going live on a .hu domain

The app is a standard Next.js 16 project with no database and no server-side
secrets: all data ships as a static `public/data.json`. Any Node-capable host
works; Vercel is the zero-configuration path and is what this guide assumes.

## 1. Deploy to Vercel

1. Push the repo to GitHub (already done if you're reading this there).
2. Go to [vercel.com/new](https://vercel.com/new), import the repository.
3. Accept the defaults (framework: Next.js) and click **Deploy**.
4. You get a working `*.vercel.app` URL in ~2 minutes.

The per-permit share cards (`/api/og/<slug>`) render on demand and are cached
on Vercel's CDN for a month (`s-maxage=2592000`), so they cost effectively
nothing.

## 2. Buy the .hu domain

`.hu` domains are sold through Hungarian registrars accredited by
[domain.hu](https://www.domain.hu). Popular choices:

- [forpsi.hu](https://www.forpsi.hu)
- [rackhost.hu](https://www.rackhost.hu)
- [tarhely.eu](https://tarhely.eu)
- [dotroll.com](https://dotroll.com)

Notes specific to `.hu`:

- Registration requires an EU citizen / EU-registered company as registrant
  (a Hungarian Kft. qualifies).
- New registrations go through a ~1-day publication window before becoming
  fully active — don't panic if DNS isn't instant.

## 3. Point the domain at Vercel

In **Vercel → your project → Settings → Domains**, add both
`your-domain.hu` and `www.your-domain.hu`. Vercel will show you the exact
records; as of writing they are:

At your registrar's DNS panel:

| Type | Host | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Vercel provisions HTTPS (Let's Encrypt) automatically once DNS propagates.
Set the apex (non-www) as the primary domain and let Vercel redirect www.

## 4. Set the site URL

In **Vercel → Settings → Environment Variables** add:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.hu
```

Redeploy. This single variable drives every canonical URL, OG image URL,
`sitemap.xml` entry and `robots.txt` line (see `lib/site.ts`).

Also update `githubRepo` in `lib/site.ts` if you fork the project.

## 5. After launch: search engines

1. **Google Search Console** — add the domain property, verify via DNS TXT
   record, then submit `https://your-domain.hu/sitemap.xml`. The sitemap
   contains ~1,500 permit pages; expect indexing to ramp over a few weeks.
2. **Bing Webmaster Tools** — import from Search Console with two clicks.
3. Check the share cards with
   [opengraph.xyz](https://www.opengraph.xyz) or LinkedIn's
   [Post Inspector](https://www.linkedin.com/post-inspector/) — the home page
   card is at `/opengraph-image`, per-permit cards at `/api/og/<slug>`.

## Alternative hosts

- **Netlify** — works with the official Next.js runtime; same env var.
- **Self-hosted / VPS** — `npm run build && npm run start` behind nginx or
  Caddy; the app is stateless, a single small instance is plenty.
- **Cloudflare Pages** — needs the `@cloudflare/next-on-pages` adapter; the
  `next/og` image routes run on workers, verify them after deploy.

## Refreshing the data

When a new official XLSX export is available:

1. Replace `data/kozterulet-hasznalati-hatarozatok.xlsx`.
2. Re-run the pipeline (see `scripts/`) to regenerate `public/data.json`.
3. Commit and push — Vercel redeploys, and the sitemap, permit pages and
   share cards all regenerate from the new data automatically.
