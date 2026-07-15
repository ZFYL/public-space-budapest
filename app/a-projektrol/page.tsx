import type { Metadata } from "next";
import Link from "next/link";
import { SITE, CREATOR } from "@/lib/site";

export const metadata: Metadata = {
  title: "A projektről – nyílt adat, nyílt forráskód",
  description:
    "Hogyan készült a budapesti közterület-használati térkép: hivatalos önkormányzati határozatokból, geokódolással, nyílt forráskóddal. A projekt a Bonvo Consulting Kft. munkája.",
  alternates: {
    canonical: "/a-projektrol",
  },
  openGraph: {
    title: "A projektről – Budapest Közterület Térkép",
    description:
      "Hivatalos közterület-használati határozatokból épült nyílt adatprojekt. Készítette: Bonvo Consulting Kft.",
    url: "/a-projektrol",
    type: "article",
    locale: "hu_HU",
  },
};

const linkStyle = {
  color: "var(--accent-color)",
  textDecoration: "none",
} as const;

export default function AboutPage() {
  return (
    <div
      className="table-container"
      style={{
        padding: "80px 24px 40px",
        maxWidth: "800px",
        margin: "0 auto",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <Link href="/" style={{ ...linkStyle, marginBottom: "20px", display: "inline-block" }}>
        &larr; Vissza a térképre
      </Link>

      <div className="glass-panel" style={{ padding: "32px", marginTop: "20px" }}>
        <h1 style={{ marginBottom: "16px", color: "var(--accent-color)" }}>
          Ki foglalja el a közterületet Budapesten?
        </h1>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "16px" }}>
          Budapest utcáin nap mint nap tűnnek fel teraszok, építési konténerek,
          filmforgatási lezárások — de ki, mire és meddig kapott engedélyt?
          Ez az oldal a fővárosi <strong style={{ color: "var(--text-main)" }}>
          közterület-használati határozatok</strong> nyilvános adatait teszi
          mindenki számára böngészhetővé: interaktív térképen, kereshető
          listában, kerületenként és kategóriánként szűrhetően.
        </p>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
          A projekt <strong style={{ color: "var(--text-main)" }}>nyílt forráskódú</strong> —
          a teljes kód, az adatfeldolgozó szkriptek és az eredeti hivatalos
          táblázat is elérhető a{" "}
          <a href={SITE.githubRepo} target="_blank" rel="noopener" style={linkStyle}>
            GitHubon
          </a>.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: "32px", marginTop: "24px" }}>
        <h2 style={{ marginBottom: "16px" }}>Hogyan készült?</h2>
        <div className="section">
          <div className="stat-row">
            <span className="stat-name">Adatforrás</span>
            <span style={{ color: "var(--text-muted)" }}>Hivatalos önkormányzati határozatok (XLSX)</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Feldolgozás</span>
            <span style={{ color: "var(--text-muted)" }}>Python — tisztítás, kategorizálás, slug-generálás</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Geokódolás</span>
            <span style={{ color: "var(--text-muted)" }}>Photon / Nominatim (OpenStreetMap)</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Frontend</span>
            <span style={{ color: "var(--text-muted)" }}>Next.js, React, Leaflet, MUI</span>
          </div>
        </div>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginTop: "16px", fontSize: "0.9rem" }}>
          Fontos: az adatok tájékoztató jellegűek. A térképi pozíció a cím
          alapján, automatikus geokódolással készült, ezért pontatlan lehet, és
          a határozatok státusza időközben változhatott.
        </p>
      </div>

      <div className="glass-panel consulting-cta" style={{ padding: "32px", marginTop: "24px" }}>
        <h2 style={{ marginBottom: "12px" }}>
          Önnek is van adata — csak még nem beszél?
        </h2>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "12px" }}>
          Ez az oldal néhány nap alatt készült egy nyers Excel-táblából. A{" "}
          <strong style={{ color: "var(--text-main)" }}>{CREATOR.company}</strong>{" "}
          pontosan ilyen munkákra szakosodott: mélyreható adatelemzés és
          kutatás, amivel bármilyen piacon versenyelőnyt találunk —
          valamint teljes körű IT-fejlesztés bérmunkában is: webes és mobil
          alkalmazások, adatplatformok, marketing.
        </p>
        <ul style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "20px", paddingLeft: "20px" }}>
          <li>Piac- és versenytárs-elemzés nyilvános és saját adatokból</li>
          <li>Egyedi dashboardok, térképes és kereshető adatplatformok</li>
          <li>Web- és mobilalkalmazás-fejlesztés (React, Next.js, React Native)</li>
          <li>SEO, growth és adatvezérelt marketing</li>
        </ul>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a href={`mailto:${CREATOR.email}`} className="cta-btn">
            Beszéljünk a projektjéről
          </a>
          <a href={CREATOR.linkedin} target="_blank" rel="noopener" className="cta-btn cta-btn-ghost">
            LinkedIn
          </a>
          <a href={CREATOR.portfolio} target="_blank" rel="noopener" className="cta-btn cta-btn-ghost">
            Portfólió
          </a>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "32px", marginTop: "24px", marginBottom: "40px" }}>
        <h2 style={{ marginBottom: "16px" }}>További munkáink</h2>
        <div className="section">
          <div className="stat-row">
            <a href={CREATOR.portfolio} target="_blank" rel="noopener" style={linkStyle}>
              gregorysmith.eu
            </a>
            <span style={{ color: "var(--text-muted)" }}>Portfólió és esettanulmányok</span>
          </div>
          <div className="stat-row">
            <a href={CREATOR.bonvoSki} target="_blank" rel="noopener" style={linkStyle}>
              bonvo.ski
            </a>
            <span style={{ color: "var(--text-muted)" }}>3D sítérkép app — 1400+ síterep</span>
          </div>
          <div className="stat-row">
            <a href={CREATOR.bonvoBusiness} target="_blank" rel="noopener" style={linkStyle}>
              business.bonvo.ski
            </a>
            <span style={{ color: "var(--text-muted)" }}>Bonvo üzleti megoldások</span>
          </div>
          <div className="stat-row">
            <a href={CREATOR.appStore} target="_blank" rel="noopener" style={linkStyle}>
              Bonvo Ski az App Store-ban
            </a>
            <span style={{ color: "var(--text-muted)" }}>iOS alkalmazás</span>
          </div>
          <div className="stat-row">
            <a href={CREATOR.linkedin} target="_blank" rel="noopener" style={linkStyle}>
              LinkedIn
            </a>
            <span style={{ color: "var(--text-muted)" }}>Kovács Gergely</span>
          </div>
          <div className="stat-row">
            <a href={CREATOR.instagram} target="_blank" rel="noopener" style={linkStyle}>
              Instagram
            </a>
            <span style={{ color: "var(--text-muted)" }}>@bonvo.ski</span>
          </div>
        </div>

        <h2 style={{ margin: "28px 0 12px" }}>About this project (EN)</h2>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
          An open-source civic-tech map of every public-space usage permit in
          Budapest — terraces, construction sites, film shoots and street
          closures — built from official municipal decision records. Created by{" "}
          <a href={CREATOR.portfolio} target="_blank" rel="noopener" style={linkStyle}>
            Gergely Kovács
          </a>{" "}
          ({CREATOR.company}), a consulting studio for data analysis, research,
          software development and marketing. Source code on{" "}
          <a href={SITE.githubRepo} target="_blank" rel="noopener" style={linkStyle}>
            GitHub
          </a>.
        </p>
      </div>
    </div>
  );
}
