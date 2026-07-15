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

// The "upcoming" window shifts daily — cache for a day, serve stale while
// the CDN refreshes in the background.
const CACHE = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400";

const PERIODS: Record<string, { days: number; label: string }> = {
  "30-nap": { days: 30, label: "a következő 30 napban" },
  "3-honap": { days: 90, label: "a következő 3 hónapban" },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ period: string }> }
) {
  const { period } = await params;
  const cfg = PERIODS[period];
  if (!cfg) {
    return new Response("Not found", { status: 404 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + cfg.days);

  const upcoming = loadPermits().filter((p) => {
    if (!p.startDate) return false;
    const start = new Date(p.startDate);
    return start >= today && start <= horizon;
  });

  const totalSize = Math.round(
    upcoming.reduce((s, p) => s + (p.size || 0), 0)
  );

  const byCategory = new Map<string, number>();
  for (const p of upcoming) {
    const c = p.category || "egyéb";
    byCategory.set(c, (byCategory.get(c) || 0) + 1);
  }
  const topCategories = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: OG_WIDTH,
          height: OG_HEIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: C.bg,
          fontFamily: "Inter",
          position: "relative",
          overflow: "hidden",
          padding: "56px 64px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -300,
            right: -220,
            width: 800,
            height: 800,
            background:
              "radial-gradient(circle, rgba(167, 139, 250, 0.22) 0%, rgba(167, 139, 250, 0) 65%)",
          }}
        />
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: C.purple,
            marginBottom: 20,
          }}
        >
          Budapest kilátásai · tervezzen előre
        </div>
        <div
          style={{
            fontFamily: "Bricolage",
            fontWeight: 800,
            fontSize: 62,
            lineHeight: 1.08,
            color: C.text,
            maxWidth: 1000,
            marginBottom: 22,
          }}
        >
          {`Mi indul Budapesten ${cfg.label}?`}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            lineHeight: 1.4,
            color: C.muted,
            maxWidth: 920,
            marginBottom: 40,
          }}
        >
          Új építkezések, rendezvények, filmforgatások és teraszok — a
          hivatalos engedélyek alapján, mielőtt az utcán találkozna velük.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                fontFamily: "Bricolage",
                fontWeight: 800,
                fontSize: 52,
                color: C.text,
                lineHeight: 1,
              }}
            >
              {String(upcoming.length)}
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
              Új foglalás
            </div>
          </div>
          <div style={{ display: "flex", width: 1, height: 60, backgroundColor: C.line }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                fontFamily: "Bricolage",
                fontWeight: 800,
                fontSize: 52,
                color: C.text,
                lineHeight: 1,
              }}
            >
              {`${totalSize.toLocaleString("hu-HU")} m²`}
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
              Lefoglalt terület
            </div>
          </div>
          <div style={{ display: "flex", width: 1, height: 60, backgroundColor: C.line }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topCategories.map(([cat, count]) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    display: "flex",
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    backgroundColor: categoryColor(cat),
                  }}
                />
                <div style={{ display: "flex", fontSize: 20, fontWeight: 500, color: C.muted }}>
                  {`${cat} — ${count} db`}
                </div>
              </div>
            ))}
          </div>
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
          {`${SITE.url.replace(/^https?:\/\//, "")}/varhato/${period}`}
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts: ogFonts(),
      headers: { "Cache-Control": CACHE },
    }
  );
}
