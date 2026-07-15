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
import {
  isLocale,
  translateCategory,
  formatNumber,
  type Locale,
} from "@/lib/i18n";

export const runtime = "nodejs";

// The "upcoming" window shifts daily — cache for a day, serve stale while
// the CDN refreshes in the background.
const CACHE = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400";

const PERIOD_DAYS: Record<string, number> = {
  "30-nap": 30,
  "3-honap": 90,
};

const COPY: Record<
  Locale,
  {
    eyebrow: string;
    headline: (period: string) => string;
    sub: string;
    newPermits: string;
    areaReserved: string;
    periodLabel: Record<string, string>;
  }
> = {
  hu: {
    eyebrow: "Budapest kilátásai · tervezzen előre",
    headline: (p) => `Mi indul Budapesten ${p}?`,
    sub: "Új építkezések, rendezvények, filmforgatások és teraszok — a hivatalos engedélyek alapján, mielőtt az utcán találkozna velük.",
    newPermits: "Új foglalás",
    areaReserved: "Lefoglalt terület",
    periodLabel: { "30-nap": "a következő 30 napban", "3-honap": "a következő 3 hónapban" },
  },
  en: {
    eyebrow: "Budapest's outlook · plan ahead",
    headline: (p) => `What's starting in Budapest ${p}?`,
    sub: "New construction sites, events, film shoots and terraces — from the official permits, before you meet them on the street.",
    newPermits: "New permits",
    areaReserved: "Area reserved",
    periodLabel: { "30-nap": "in the next 30 days", "3-honap": "in the next 3 months" },
  },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; period: string }> }
) {
  const { locale, period } = await params;
  const days = PERIOD_DAYS[period];
  if (!isLocale(locale) || !days) {
    return new Response("Not found", { status: 404 });
  }

  const copy = COPY[locale];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + days);

  const upcoming = loadPermits().filter((p) => {
    if (!p.startDate) return false;
    const start = new Date(p.startDate);
    return start >= today && start <= horizon;
  });

  const totalSize = Math.round(upcoming.reduce((s, p) => s + (p.size || 0), 0));

  const byCategory = new Map<string, number>();
  for (const p of upcoming) {
    const c = p.category || "Egyéb";
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
          {copy.eyebrow}
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
          {copy.headline(copy.periodLabel[period])}
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
          {copy.sub}
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
              {copy.newPermits}
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
              {`${formatNumber(totalSize, locale)} m²`}
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
              {copy.areaReserved}
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
                  {`${translateCategory(cat, locale)} — ${count}`}
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
          {`${SITE.url.replace(/^https?:\/\//, "")}/${locale}/varhato/${period}`}
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
