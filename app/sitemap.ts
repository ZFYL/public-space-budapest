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
    ...listings,
  ];
}
