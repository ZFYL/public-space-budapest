import { ImageResponse } from "next/og";
import {
  OG_WIDTH,
  OG_HEIGHT,
  OG_COLORS as C,
  ogFonts,
  loadPermits,
  projectDots,
} from "@/lib/og";
import { SITE } from "@/lib/site";

export const alt =
  "Budapest közterület-használati engedélyek interaktív térképe — teraszok, építkezések, lezárások";
export const size = { width: OG_WIDTH, height: OG_HEIGHT };
export const contentType = "image/png";

export default async function Image() {
  const permits = loadPermits();

  // Addresses use both Roman ("VIII.") and Arabic ("8.") district notation —
  // normalize to numbers so each district is only counted once.
  const romanToInt = (s: string): number => {
    const vals: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };
    let n = 0;
    for (let i = 0; i < s.length; i++) {
      const cur = vals[s[i]] ?? 0;
      const next = vals[s[i + 1]] ?? 0;
      n += cur < next ? -cur : cur;
    }
    return n;
  };
  const districts = new Set(
    permits
      .map((p) => p.address.match(/([IVXLCDM0-9]+)\.\s*ker/i)?.[1])
      .filter((d): d is string => Boolean(d))
      .map((d) =>
        /^\d+$/.test(d) ? parseInt(d, 10) : romanToInt(d.toUpperCase())
      )
      .filter((n) => n >= 1 && n <= 23)
  );
  const terraces = permits.filter((p) =>
    (p.category || "").includes("terasz")
  ).length;

  // The card's right half is a real miniature map drawn from the dataset.
  const MAP_W = 560;
  const MAP_H = 500;
  const dots = projectDots(permits, MAP_W, MAP_H, 420);

  return new ImageResponse(
    (
      <div
        style={{
          width: OG_WIDTH,
          height: OG_HEIGHT,
          display: "flex",
          backgroundColor: C.bg,
          fontFamily: "Inter",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* soft accent glow */}
        <div
          style={{
            position: "absolute",
            top: -300,
            left: -200,
            width: 800,
            height: 800,
            background:
              "radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0) 65%)",
          }}
        />

        {/* left: text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 620,
            padding: "56px 8px 56px 64px",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: C.accentLight,
              marginBottom: 20,
            }}
          >
            Hivatalos engedélyek · nyílt adat
          </div>
          <div
            style={{
              fontFamily: "Bricolage",
              fontWeight: 800,
              fontSize: 64,
              lineHeight: 1.08,
              color: C.text,
              marginBottom: 24,
            }}
          >
            Ki foglalja el a közterületet Budapesten?
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              lineHeight: 1.4,
              color: C.muted,
              marginBottom: 40,
            }}
          >
            Teraszok, építkezések, filmforgatások és lezárások — minden
            közterület-használati határozat egy interaktív térképen.
          </div>

          <div style={{ display: "flex", gap: 36 }}>
            {[
              { v: String(permits.length), l: "Engedély" },
              { v: String(districts.size), l: "Kerület" },
              { v: String(terraces), l: "Terasz" },
            ].map((s) => (
              <div
                key={s.l}
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <div
                  style={{
                    fontFamily: "Bricolage",
                    fontWeight: 800,
                    fontSize: 44,
                    color: C.text,
                    lineHeight: 1,
                  }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: C.faint,
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 44,
              fontSize: 20,
              fontWeight: 700,
              color: C.accentLight,
            }}
          >
            {SITE.url.replace(/^https?:\/\//, "")}
          </div>
        </div>

        {/* right: the dataset itself, drawn as a mini map */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 20,
            top: 65,
            width: MAP_W,
            height: MAP_H,
          }}
        >
          {dots.map((d, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: d.x,
                top: d.y,
                width: 7,
                height: 7,
                borderRadius: 999,
                backgroundColor: d.color,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: ogFonts() }
  );
}
