import fs from "node:fs";
import path from "node:path";

/** Shared constants + assets for the generated share cards (next/og / Satori). */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const OG_COLORS = {
  bg: "#0f1115",
  panel: "rgba(255, 255, 255, 0.04)",
  line: "rgba(255, 255, 255, 0.1)",
  text: "#f8f9fa",
  muted: "#a1a1aa",
  faint: "#71717a",
  accent: "#2563eb",
  accentLight: "#60a5fa",
  purple: "#a78bfa",
  green: "#10b981",
  orange: "#f59e0b",
  red: "#ef4444",
} as const;

let assetCache: {
  inter500: Buffer;
  inter700: Buffer;
  bricolage800: Buffer;
} | null = null;

export function loadOgAssets() {
  if (!assetCache) {
    const fontDir = path.join(process.cwd(), "assets", "og");
    assetCache = {
      inter500: fs.readFileSync(path.join(fontDir, "inter-500.ttf")),
      inter700: fs.readFileSync(path.join(fontDir, "inter-700.ttf")),
      bricolage800: fs.readFileSync(path.join(fontDir, "bricolage-800.ttf")),
    };
  }
  return assetCache;
}

export function ogFonts() {
  const assets = loadOgAssets();
  return [
    { name: "Inter", data: assets.inter500, weight: 500 as const },
    { name: "Inter", data: assets.inter700, weight: 700 as const },
    { name: "Bricolage", data: assets.bricolage800, weight: 800 as const },
  ];
}

export interface PermitRecord {
  id: string;
  company: string | null;
  address: string;
  parcel?: string;
  size: number | null;
  category: string | null;
  startDate: string | null;
  endDate: string | null;
  lat: number | null;
  lon: number | null;
  slug: string;
}

let dataCache: PermitRecord[] | null = null;

export function loadPermits(): PermitRecord[] {
  if (!dataCache) {
    const filePath = path.join(process.cwd(), "public", "data.json");
    dataCache = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  return dataCache!;
}

/** Color a permit dot by its usage category — mirrors the map legend. */
export function categoryColor(category: string | null): string {
  const c = (category || "").toLowerCase();
  if (c.includes("terasz") || c.includes("vendéglát")) return OG_COLORS.green;
  if (c.includes("épít") || c.includes("konténer") || c.includes("felvonulás"))
    return OG_COLORS.orange;
  if (c.includes("film") || c.includes("forgat")) return OG_COLORS.purple;
  if (c.includes("rendezvény")) return OG_COLORS.red;
  return OG_COLORS.accentLight;
}

/**
 * Project permit coordinates into a WIDTH x HEIGHT box — used to draw a real
 * miniature "map" of Budapest out of the dataset itself on the share card.
 */
export function projectDots(
  permits: PermitRecord[],
  boxW: number,
  boxH: number,
  maxDots = 400
) {
  const valid = permits.filter(
    (p) =>
      p.lat !== null &&
      p.lon !== null &&
      p.lat > 47.35 &&
      p.lat < 47.65 &&
      p.lon > 18.9 &&
      p.lon < 19.35
  );
  const step = Math.max(1, Math.floor(valid.length / maxDots));
  const sample = valid.filter((_, i) => i % step === 0);

  const lats = sample.map((p) => p.lat!) ;
  const lons = sample.map((p) => p.lon!);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  return sample.map((p) => ({
    x: ((p.lon! - minLon) / (maxLon - minLon || 1)) * boxW,
    y: (1 - (p.lat! - minLat) / (maxLat - minLat || 1)) * boxH,
    color: categoryColor(p.category),
  }));
}
