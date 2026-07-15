import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  // The OG share-card routes read fonts + the dataset from disk at runtime —
  // make sure they are bundled into the serverless function on Vercel.
  outputFileTracingIncludes: {
    "/api/og/[locale]/[slug]": ["./assets/og/*.ttf", "./public/data.json"],
    "/api/og/[locale]/varhato/[period]": [
      "./assets/og/*.ttf",
      "./public/data.json",
    ],
  },
};

export default nextConfig;
