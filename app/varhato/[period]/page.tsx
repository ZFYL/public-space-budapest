import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { loadPermits, categoryColor, type PermitRecord } from "@/lib/og";
import { SITE, CREATOR } from "@/lib/site";

// "Upcoming" is relative to today — regenerate hourly so the window is fresh.
export const revalidate = 3600;

const PERIODS = {
  "30-nap": {
    days: 30,
    label: "Következő 30 nap",
    title: "Közelgő közterület-foglalások – a következő 30 nap",
    description:
      "Milyen új terasz, építkezés, rendezvény vagy filmforgatás indul Budapesten a következő 30 napban? Tervezzen előre: lezárások, korlátozások és forgalmasabb utcák egy helyen, hivatalos engedélyek alapján.",
  },
  "3-honap": {
    days: 90,
    label: "Következő 3 hónap",
    title: "Közelgő közterület-foglalások – a következő 3 hónap",
    description:
      "Budapest következő 3 hónapja előre: minden közterület-használati engedély, amely mostantól lép életbe — építkezések, rendezvények, filmforgatások és teraszok, hivatalos határozatok alapján.",
  },
} as const;

type PeriodKey = keyof typeof PERIODS;

export function generateStaticParams() {
  return Object.keys(PERIODS).map((period) => ({ period }));
}

function getUpcoming(days: number): PermitRecord[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + days);

  return loadPermits()
    .filter((p) => {
      if (!p.startDate) return false;
      const start = new Date(p.startDate);
      return start >= today && start <= horizon;
    })
    .sort((a, b) => (a.startDate! < b.startDate! ? -1 : 1));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ period: string }>;
}): Promise<Metadata> {
  const { period } = await params;
  const cfg = PERIODS[period as PeriodKey];
  if (!cfg) return { title: "Nem található" };

  const ogImage = `/api/og/varhato/${period}`;
  return {
    title: cfg.title,
    description: cfg.description,
    alternates: { canonical: `/varhato/${period}` },
    openGraph: {
      title: cfg.title,
      description: cfg.description,
      url: `/varhato/${period}`,
      siteName: SITE.name,
      locale: "hu_HU",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: cfg.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: cfg.title,
      description: cfg.description,
      images: [ogImage],
    },
  };
}

export default async function UpcomingPage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const { period } = await params;
  const cfg = PERIODS[period as PeriodKey];
  if (!cfg) notFound();

  const upcoming = getUpcoming(cfg.days);
  const totalSize = upcoming.reduce((s, p) => s + (p.size || 0), 0);

  const byCategory = new Map<string, number>();
  for (const p of upcoming) {
    const c = p.category || "egyéb";
    byCategory.set(c, (byCategory.get(c) || 0) + 1);
  }
  const topCategories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);

  // Group chronologically by start day
  const byDay = new Map<string, PermitRecord[]>();
  for (const p of upcoming) {
    const list = byDay.get(p.startDate!) || [];
    list.push(p);
    byDay.set(p.startDate!, list);
  }

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: cfg.title,
    description: cfg.description,
    numberOfItems: upcoming.length,
    itemListElement: upcoming.slice(0, 50).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${p.category || "Közterület-használat"} – ${p.address}`,
      url: `${SITE.url}/helyszin/${p.slug}`,
    })),
  };

  return (
    <div
      className="table-container"
      style={{
        padding: "80px 24px 40px",
        maxWidth: "900px",
        margin: "0 auto",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <Link
        href="/"
        style={{
          color: "var(--accent-color)",
          textDecoration: "none",
          marginBottom: "20px",
          display: "inline-block",
        }}
      >
        &larr; Vissza a térképre
      </Link>

      <div className="glass-panel" style={{ padding: "32px", marginTop: "20px" }}>
        <h1 style={{ marginBottom: "12px", color: "var(--accent-color)" }}>
          Mi indul Budapesten? — {cfg.label.toLowerCase()}
        </h1>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "20px" }}>
          Budapest kilátásai előre: az alábbi közterület-használati engedélyek
          a mai naptól számított {cfg.days} napon belül lépnek életbe. Új
          építkezések, rendezvények, filmforgatások és teraszok — mielőtt még
          az utcán találkozna velük.
        </p>

        <div className="toggle-group" style={{ maxWidth: "420px", marginBottom: "24px" }}>
          <Link
            href="/varhato/30-nap"
            className={`toggle-btn ${period === "30-nap" ? "active" : ""}`}
            style={{ textAlign: "center", textDecoration: "none" }}
          >
            Következő 30 nap
          </Link>
          <Link
            href="/varhato/3-honap"
            className={`toggle-btn ${period === "3-honap" ? "active" : ""}`}
            style={{ textAlign: "center", textDecoration: "none" }}
          >
            Következő 3 hónap
          </Link>
        </div>

        <div className="section">
          <div className="stat-row">
            <span className="stat-name">Életbe lépő engedélyek</span>
            <span className="stat-value">{upcoming.length} db</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Összes lefoglalt terület</span>
            <span className="stat-value">{Math.round(totalSize).toLocaleString("hu-HU")} m²</span>
          </div>
          {topCategories.slice(0, 4).map(([cat, count]) => (
            <div className="stat-row" key={cat}>
              <span className="stat-name" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: categoryColor(cat),
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {cat}
              </span>
              <span className="stat-value">{count} db</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "24px 28px", marginTop: "24px" }}>
        <h2 style={{ marginBottom: "12px", fontSize: "1.1rem" }}>Miért érdemes előre nézni?</h2>
        <ul style={{ color: "var(--text-muted)", lineHeight: 1.8, paddingLeft: "20px" }}>
          <li>
            <strong style={{ color: "var(--text-main)" }}>Közlekedés és parkolás:</strong>{" "}
            az induló építkezések és felvonulási területek járdát, parkolósávot
            vagy teljes útszakaszt zárhatnak le — jobb útvonalat még előtte tervezni.
          </li>
          <li>
            <strong style={{ color: "var(--text-main)" }}>Rendezvények és forgatások:</strong>{" "}
            ahol esemény vagy filmforgatás indul, ott időszakos lezárásra és
            nagyobb forgalomra érdemes számítani.
          </li>
          <li>
            <strong style={{ color: "var(--text-main)" }}>Vállalkozásoknak:</strong>{" "}
            a környéken nyíló teraszok és munkaterületek befolyásolják a
            gyalogosforgalmat, a kirakati láthatóságot és az áruszállítást.
          </li>
          <li>
            <strong style={{ color: "var(--text-main)" }}>Lakóknak:</strong>{" "}
            zajosabb időszakok, korlátozott kapubejárók, magasabb terheltség —
            kevesebb meglepetés, ha időben látszik.
          </li>
        </ul>
      </div>

      <div style={{ marginTop: "32px" }}>
        {upcoming.length === 0 && (
          <div className="glass-panel" style={{ padding: "32px", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)" }}>
              A jelenlegi adatbázisban nincs olyan engedély, amely ebben az
              időszakban lépne életbe. Nézzen vissza az adatok következő
              frissítése után!
            </p>
          </div>
        )}

        {[...byDay.entries()].map(([day, items]) => (
          <div key={day} style={{ marginBottom: "28px" }}>
            <h2
              style={{
                fontSize: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--accent-color)",
                margin: "0 0 12px 4px",
              }}
            >
              {format(new Date(day), "yyyy. MMMM d., EEEE", { locale: hu })}
            </h2>
            <div className="glass-panel" style={{ padding: "8px 20px" }}>
              {items.map((p) => (
                <div className="stat-row" key={p.slug}>
                  <Link
                    href={`/helyszin/${p.slug}`}
                    style={{
                      textDecoration: "none",
                      color: "var(--text-main)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      minWidth: 0,
                      flexGrow: 1,
                      paddingRight: "12px",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: categoryColor(p.category),
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <strong>{p.company || "Ismeretlen"}</strong>
                      <span style={{ color: "var(--text-muted)" }}>
                        {" "}— {p.category || "közterület-használat"}, {p.address}
                      </span>
                    </span>
                  </Link>
                  <span className="stat-value" style={{ flexShrink: 0 }}>
                    {p.size ?? "?"} m²
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel consulting-cta" style={{ padding: "24px 28px", margin: "8px 0 40px" }}>
        <h3 style={{ marginBottom: "8px" }}>Előrejelzés a saját piacára?</h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.5 }}>
          Ez az oldal nyilvános adatokból számol előre. A{" "}
          <strong style={{ color: "var(--text-main)" }}>{CREATOR.company}</strong>{" "}
          ugyanezt megcsinálja az Ön adataiból is: trendek, előrejelzések,
          versenytárs-figyelés és egyedi dashboardok.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a href={`mailto:${CREATOR.email}`} className="cta-btn">Beszéljünk</a>
          <Link href="/a-projektrol" className="cta-btn cta-btn-ghost">A projektről</Link>
        </div>
      </div>
    </div>
  );
}
