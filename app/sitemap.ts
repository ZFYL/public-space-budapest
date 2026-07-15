import type { MetadataRoute } from "next";
import { loadPermits } from "@/lib/og";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const permits = loadPermits();

  const listings: MetadataRoute.Sitemap = permits.map((item) => ({
    url: `${SITE.url}/helyszin/${item.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    {
      url: SITE.url,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE.url}/a-projektrol`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/varhato/30-nap`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE.url}/varhato/3-honap`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...listings,
  ];
}
