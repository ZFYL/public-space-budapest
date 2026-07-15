import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPermits, categoryColor, type PermitRecord } from "@/lib/og";
import { SITE, CREATOR } from "@/lib/site";
import {
  LOCALES,
  getDictionary,
  isLocale,
  localePath,
  translateCategory,
  translateAddress,
  formatDateLong,
  formatNumber,
  fill,
  OG_LOCALE,
  type Dictionary,
} from "@/lib/i18n";

// "Upcoming" is relative to today — regenerate hourly so the window is fresh.
export const revalidate = 3600;

const PERIODS = {
  "30-nap": { days: 30 },
  "3-honap": { days: 90 },
} as const;

type PeriodKey = keyof typeof PERIODS;

function periodCopy(period: PeriodKey, dict: Dictionary) {
  return period === "30-nap"
    ? {
        label: dict.upcoming.label30,
        title: dict.upcoming.title30,
        description: dict.upcoming.description30,
      }
    : {
        label: dict.upcoming.label3m,
        title: dict.upcoming.title3m,
        description: dict.upcoming.description3m,
      };
}

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    Object.keys(PERIODS).map((period) => ({ locale, period }))
  );
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
  params: Promise<{ locale: string; period: string }>;
}): Promise<Metadata> {
  const { locale, period } = await params;
  if (!isLocale(locale) || !(period in PERIODS)) return { title: "Not found" };
  const dict = getDictionary(locale);
  const cfg = periodCopy(period as PeriodKey, dict);

  const ogImage = `/api/og/${locale}/varhato/${period}`;
  const path = `/varhato/${period}`;

  return {
    title: cfg.title,
    description: cfg.description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        hu: `/hu${path}`,
        en: `/en${path}`,
        "x-default": `/en${path}`,
      },
    },
    openGraph: {
      title: cfg.title,
      description: cfg.description,
      url: `/${locale}${path}`,
      siteName: dict.meta.siteName,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === "hu" ? "en" : "hu"],
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
  params: Promise<{ locale: string; period: string }>;
}) {
  const { locale, period } = await params;
  if (!isLocale(locale) || !(period in PERIODS)) notFound();

  const dict = getDictionary(locale);
  const days = PERIODS[period as PeriodKey].days;
  const cfg = periodCopy(period as PeriodKey, dict);

  const upcoming = getUpcoming(days);
  const totalSize = upcoming.reduce((s, p) => s + (p.size || 0), 0);

  const byCategory = new Map<string, number>();
  for (const p of upcoming) {
    const c = p.category || "Egyéb";
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
    inLanguage: locale,
    numberOfItems: upcoming.length,
    itemListElement: upcoming.slice(0, 50).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${translateCategory(p.category, locale)} – ${translateAddress(p.address, locale)}`,
      url: `${SITE.url}/${locale}/helyszin/${p.slug}`,
    })),
  };

  return (
    <div
      className="table-container detail-container"
      style={{ maxWidth: "900px", margin: "0 auto" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <Link href={localePath(locale, "/")} className="back-link">
        {dict.nav.backToMap}
      </Link>

      <div className="glass-panel" style={{ padding: "32px", marginTop: "20px" }}>
        <h1 style={{ marginBottom: "12px", color: "var(--accent-color)" }}>
          {fill(dict.upcoming.h1, { period: cfg.label.toLowerCase() })}
        </h1>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "20px" }}>
          {fill(dict.upcoming.intro, { days })}
        </p>

        <div className="toggle-group" style={{ maxWidth: "420px", marginBottom: "24px" }}>
          <Link
            href={localePath(locale, "/varhato/30-nap")}
            className={`toggle-btn ${period === "30-nap" ? "active" : ""}`}
          >
            {dict.upcoming.label30}
          </Link>
          <Link
            href={localePath(locale, "/varhato/3-honap")}
            className={`toggle-btn ${period === "3-honap" ? "active" : ""}`}
          >
            {dict.upcoming.label3m}
          </Link>
        </div>

        <div className="section">
          <div className="stat-row">
            <span className="stat-name">{dict.upcoming.permitsStarting}</span>
            <span className="stat-value">
              {upcoming.length} {dict.sidebar.pieces}
            </span>
          </div>
          <div className="stat-row">
            <span className="stat-name">{dict.upcoming.totalArea}</span>
            <span className="stat-value">
              {formatNumber(Math.round(totalSize), locale)} m²
            </span>
          </div>
          {topCategories.slice(0, 4).map(([cat, count]) => (
            <div className="stat-row" key={cat}>
              <span
                className="stat-name"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
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
                {translateCategory(cat, locale)}
              </span>
              <span className="stat-value">
                {count} {dict.sidebar.pieces}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "24px 28px", marginTop: "24px" }}>
        <h2 style={{ marginBottom: "12px", fontSize: "1.1rem" }}>
          {dict.upcoming.whyTitle}
        </h2>
        <ul style={{ color: "var(--text-muted)", lineHeight: 1.8, paddingLeft: "20px" }}>
          {dict.upcoming.whyItems.map((item) => (
            <li key={item.title}>
              <strong style={{ color: "var(--text-main)" }}>{item.title}</strong>{" "}
              {item.body}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "32px" }}>
        {upcoming.length === 0 && (
          <div className="glass-panel" style={{ padding: "32px", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)" }}>{dict.upcoming.emptyState}</p>
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
              {formatDateLong(day, locale)}
            </h2>
            <div className="glass-panel" style={{ padding: "8px 20px" }}>
              {items.map((p) => (
                <div className="stat-row" key={p.slug}>
                  <Link
                    href={localePath(locale, `/helyszin/${p.slug}`)}
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
                    <span
                      style={{
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <strong>{p.company || dict.common.unknown}</strong>
                      <span style={{ color: "var(--text-muted)" }}>
                        {" "}
                        — {translateCategory(p.category, locale)},{" "}
                        {translateAddress(p.address, locale)}
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

      <div
        className="glass-panel consulting-cta"
        style={{ padding: "24px 28px", margin: "8px 0 40px" }}
      >
        <h3 style={{ marginBottom: "8px" }}>{dict.upcoming.ctaTitle}</h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.5 }}>
          {dict.upcoming.ctaBody}
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a href={`mailto:${CREATOR.email}`} className="cta-btn">
            {dict.upcoming.ctaButton}
          </a>
          <Link href={localePath(locale, "/a-projektrol")} className="cta-btn cta-btn-ghost">
            {dict.upcoming.ctaAbout}
          </Link>
        </div>
      </div>
    </div>
  );
}
