/**
 * Central site configuration.
 *
 * Set NEXT_PUBLIC_SITE_URL in your environment (or .env.local) once you have
 * your production domain — everything (canonical URLs, OG images, sitemap,
 * robots.txt) derives from this single value.
 */

function normalizeUrl(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

export const SITE = {
  url: normalizeUrl(
    process.env.NEXT_PUBLIC_SITE_URL,
    "https://budapest-kozterulet.hu"
  ),
  name: "Budapest Közterület Térkép",
  shortName: "Közterület Térkép",
  title: "Ki foglalja el a közterületet Budapesten? | Közterület-térkép",
  description:
    "Interaktív térkép és kereshető adatbázis Budapest közterület-használati engedélyeiről: vendéglátó teraszok, építkezések, filmforgatások és lezárások — hivatalos önkormányzati határozatok alapján, nyílt forráskóddal.",
  locale: "hu_HU",
  githubRepo: "https://github.com/ZFYL/public-space-budapest",
} as const;

/**
 * Microsoft Clarity project ID. Set NEXT_PUBLIC_CLARITY_PROJECT_ID to point a
 * fork or a staging deploy at its own Clarity project; set it to an empty
 * string to switch Clarity off entirely.
 */
export const ANALYTICS = {
  clarityProjectId:
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "xmvwqogg58",
} as const;

export const CREATOR = {
  company: "Bonvo Consulting Kft.",
  name: "Gergely Kovács",
  email: "kovigerri@gmail.com",
  portfolio: "https://gregorysmith.eu",
  linkedin: "https://www.linkedin.com/in/kovacsgeri/",
  threads: "https://www.threads.net/@kovach.gergo",
  x: "https://x.com/BonvoSki",
  bonvoSki: "https://bonvo.ski",
  bonvoBusiness: "https://business.bonvo.ski",
  appStore:
    "https://apps.apple.com/app/bonvo-ski-3d-ski-snowboard/id6753033871",
  instagram: "https://www.instagram.com/bonvo.ski/",
  tiktok: "https://www.tiktok.com/@bonvo.ski",
} as const;
