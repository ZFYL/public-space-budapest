import { ImageResponse } from "next/og";
import {
  OG_WIDTH,
  OG_HEIGHT,
  OG_COLORS as C,
  ogFonts,
  loadPermits,
  categoryColor,
} from "@/lib/og";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";

// Permit data only changes on dataset refresh — let the CDN keep the cards.
const CACHE_LONG =
  "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=2592000";
const CACHE_SHORT = "public, max-age=300, s-maxage=3600";

function clamp(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}

function titleFontSize(t: string): number {
  const n = t.length;
  if (n <= 18) return 76;
  if (n <= 30) return 60;
  if (n <= 46) return 48;
  return 40;
}

function fmtDate(d: string | null): string {
  return d ? d.replace(/-/g, ". ") + "." : "n/a";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const item = loadPermits().find((p) => p.slug === slug);

  if (!item) {
    return new Response("Not found", {
      status: 404,
      headers: { "Cache-Control": CACHE_SHORT },
    });
  }

  const accent = categoryColor(item.category);
  const company = clamp(item.company || "Ismeretlen engedélyes", 60);
  const address = clamp(item.address, 90);
  const category = (item.category || "Közterület-használat").toUpperCase();

  const stats = [
    { v: `${item.size ?? "?"} m²`, l: "Terület" },
    { v: fmtDate(item.startDate), l: "Kezdet" },
    { v: fmtDate(item.endDate), l: "Lejárat" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: OG_WIDTH,
          height: OG_HEIGHT,
          display: "flex",
          flexDirection: "column",
          backgroundColor: C.bg,
          fontFamily: "Inter",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -320,
            right: -200,
            width: 780,
            height: 780,
            background: `radial-gradient(circle, ${accent}33 0%, ${accent}00 65%)`,
          }}
        />
        {/* accent bar */}
        <div
          style={{
            display: "flex",
            width: OG_WIDTH,
            height: 10,
            backgroundColor: accent,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            padding: "48px 64px 44px",
          }}
        >
          {/* header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontFamily: "Bricolage",
                fontWeight: 800,
                fontSize: 28,
                color: C.text,
              }}
            >
              {SITE.name}
            </div>
            <div
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                border: `1px solid ${C.line}`,
                backgroundColor: C.panel,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 2,
                color: accent,
              }}
            >
              {category}
            </div>
          </div>

          <div style={{ display: "flex", flexGrow: 1 }} />

          {/* headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontFamily: "Bricolage",
                fontWeight: 800,
                fontSize: titleFontSize(company),
                lineHeight: 1.06,
                color: C.text,
                maxWidth: 1040,
              }}
            >
              {company}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 26,
                fontWeight: 500,
                color: C.muted,
                maxWidth: 1000,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  backgroundColor: accent,
                }}
              />
              <div style={{ display: "flex" }}>{address}</div>
            </div>
          </div>

          {/* stats footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 40,
              paddingTop: 32,
              borderTop: `1px solid ${C.line}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
              {stats.map((s, i) => (
                <div
                  key={s.l}
                  style={{ display: "flex", alignItems: "center", gap: 40 }}
                >
                  {i > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        width: 1,
                        height: 52,
                        backgroundColor: C.line,
                      }}
                    />
                  ) : null}
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <div
                      style={{
                        fontFamily: "Bricolage",
                        fontWeight: 800,
                        fontSize: 34,
                        color: C.text,
                        lineHeight: 1,
                      }}
                    >
                      {s.v}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        letterSpacing: 2.5,
                        color: C.faint,
                        textTransform: "uppercase",
                      }}
                    >
                      {s.l}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 20, fontWeight: 500, color: C.faint }}>
              {SITE.url.replace(/^https?:\/\//, "")}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: OG_WIDTH, height: OG_HEIGHT, fonts: ogFonts(), headers: { "Cache-Control": CACHE_LONG } }
  );
}
