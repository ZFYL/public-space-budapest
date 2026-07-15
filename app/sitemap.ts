import type { MetadataRoute } from "next";
import { loadPermits } from "@/lib/og";
import { SITE } from "@/lib/site";
import { LOCALES } from "@/lib/i18n";

/** Every URL is listed per locale and cross-references its translations. */
function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, `${SITE.url}/${l}${path}`])
  );
  return LOCALES.map((locale) => ({
    url: `${SITE.url}/${locale}${path}`,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const permits = loadPermits();

  return [
    ...entry("", "daily", 1),
    ...entry("/varhato/30-nap", "daily", 0.9),
    ...entry("/varhato/3-honap", "daily", 0.9),
    ...entry("/a-projektrol", "monthly", 0.8),
    ...permits.flatMap((item) =>
      entry(`/helyszin/${item.slug}`, "monthly", 0.6)
    ),
  ];
}
