import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // The generated share cards live under /api/og/ and must stay crawlable:
      // LinkedIn's and Facebook's scrapers honour robots.txt, and a blocked
      // og:image means a link with no preview. The longer Allow wins over the
      // Disallow below.
      allow: ["/", "/api/og/"],
      disallow: "/api/",
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
