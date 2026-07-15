import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE, CREATOR } from "@/lib/site";
import {
  LOCALES,
  getDictionary,
  isLocale,
  localePath,
  OG_LOCALE,
} from "@/lib/i18n";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  const path = "/a-projektrol";

  return {
    title: dict.about.title,
    description: dict.about.description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        hu: `/hu${path}`,
        en: `/en${path}`,
        "x-default": `/en${path}`,
      },
    },
    openGraph: {
      title: dict.about.title,
      description: dict.about.description,
      url: `/${locale}${path}`,
      siteName: dict.meta.siteName,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === "hu" ? "en" : "hu"],
      type: "article",
    },
  };
}

const linkStyle = {
  color: "var(--accent-color)",
  textDecoration: "none",
} as const;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const workHrefs = [
    CREATOR.portfolio,
    CREATOR.bonvoSki,
    CREATOR.bonvoBusiness,
    CREATOR.appStore,
    CREATOR.linkedin,
    CREATOR.instagram,
  ];

  return (
    <div
      className="table-container detail-container"
      style={{ maxWidth: "800px", margin: "0 auto" }}
    >
      <Link href={localePath(locale, "/")} className="back-link">
        {dict.nav.backToMap}
      </Link>

      <div className="glass-panel" style={{ padding: "32px", marginTop: "20px" }}>
        <h1 style={{ marginBottom: "16px", color: "var(--accent-color)" }}>
          {dict.about.h1}
        </h1>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "16px" }}>
          {dict.about.intro1}
        </p>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
          {dict.about.intro2}{" "}
          <a href={SITE.githubRepo} target="_blank" rel="noopener" style={linkStyle}>
            GitHub →
          </a>
        </p>
      </div>

      <div className="glass-panel" style={{ padding: "32px", marginTop: "24px" }}>
        <h2 style={{ marginBottom: "16px" }}>{dict.about.howTitle}</h2>
        <div className="section">
          {dict.about.howRows.map((row) => (
            <div className="stat-row" key={row.label}>
              <span className="stat-name">{row.label}</span>
              <span style={{ color: "var(--text-muted)", textAlign: "right" }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <p
          style={{
            color: "var(--text-muted)",
            lineHeight: 1.7,
            marginTop: "16px",
            fontSize: "0.9rem",
          }}
        >
          {dict.about.disclaimer}
        </p>
      </div>

      <div className="glass-panel consulting-cta" style={{ padding: "32px", marginTop: "24px" }}>
        <h2 style={{ marginBottom: "12px" }}>{dict.about.ctaTitle}</h2>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "12px" }}>
          {dict.about.ctaBody}
        </p>
        <ul
          style={{
            color: "var(--text-muted)",
            lineHeight: 1.8,
            marginBottom: "20px",
            paddingLeft: "20px",
          }}
        >
          {dict.about.ctaList.map((li) => (
            <li key={li}>{li}</li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a href={`mailto:${CREATOR.email}`} className="cta-btn">
            {dict.about.ctaButton}
          </a>
          <a href={CREATOR.linkedin} target="_blank" rel="noopener" className="cta-btn cta-btn-ghost">
            LinkedIn
          </a>
          <a href={CREATOR.portfolio} target="_blank" rel="noopener" className="cta-btn cta-btn-ghost">
            {locale === "hu" ? "Portfólió" : "Portfolio"}
          </a>
        </div>
      </div>

      <div
        className="glass-panel"
        style={{ padding: "32px", marginTop: "24px", marginBottom: "40px" }}
      >
        <h2 style={{ marginBottom: "16px" }}>{dict.about.worksTitle}</h2>
        <div className="section">
          {dict.about.works.map((work, i) => (
            <div className="stat-row" key={work.label}>
              <a href={workHrefs[i]} target="_blank" rel="noopener" style={linkStyle}>
                {work.label}
              </a>
              <span style={{ color: "var(--text-muted)", textAlign: "right" }}>
                {work.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
