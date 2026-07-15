import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { SITE, CREATOR } from '@/lib/site';

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'public', 'data.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data.map((item: any) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'public', 'data.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const item = data.find((d: any) => d.slug === slug);

  if (!item) {
    return { title: 'Nem található | Budapest Közterület' };
  }

  const title = `${item.company || 'Ismeretlen'} – ${item.category || 'Közterület-használat'}, ${item.address}`;
  const desc = `Közterület-használati engedély a(z) ${item.address} címen. Engedélyes: ${item.company || 'ismeretlen'}, terület: ${item.size} m². Érvényes: ${item.startDate} – ${item.endDate}. Hivatalos önkormányzati határozat térképen.`;
  const ogImage = `/api/og/${item.slug}`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: `/helyszin/${item.slug}`,
    },
    openGraph: {
      title,
      description: desc,
      url: `/helyszin/${item.slug}`,
      siteName: SITE.name,
      locale: 'hu_HU',
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [ogImage],
    },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'public', 'data.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const item = data.find((d: any) => d.slug === slug);

  if (!item) {
    return <div className="table-container"><h1>A keresett helyszín nem található.</h1></div>;
  }

  return (
    <div className="table-container" style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto', height: '100%', overflowY: 'auto' }}>
      <Link href="/" style={{ color: 'var(--accent-color)', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
        &larr; Vissza a térképre
      </Link>
      
      <div className="glass-panel" style={{ padding: '32px', marginTop: '20px' }}>
        <h1 style={{ marginBottom: '8px', color: 'var(--accent-color)' }}>{item.category || 'Közterület-használat'}</h1>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '24px' }}>{item.address}</h2>

        <div className="section" style={{ marginBottom: '32px' }}>
          <div className="stat-row">
            <span className="stat-name">Engedélyes</span>
            <span className="stat-value">{item.company || 'Ismeretlen'}</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Engedélyezett méret</span>
            <span className="stat-value">{item.size} m²</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Érvényesség kezdete</span>
            <span className="stat-value">{item.startDate || 'N/A'}</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Érvényesség vége</span>
            <span className="stat-value">{item.endDate || 'N/A'}</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Határozat azonosító (HRZ)</span>
            <span className="stat-value">{item.id}</span>
          </div>
        </div>

        <div className="card" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--text-main)', marginBottom: '32px' }}>
          <strong>Fontos figyelmeztetés:</strong> Ez az oldal automatikusan generált adatokat tartalmaz a hivatalos közterület-használati adatbázisból. A geolokáció (térképi elhelyezkedés) pontatlan lehet, és a határozati státusz időközben változhatott.
        </div>

        {item.lat && item.lon && (
          <div style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)' }}>
             <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${item.lon-0.002}%2C${item.lat-0.002}%2C${item.lon+0.002}%2C${item.lat+0.002}&layer=mapnik&marker=${item.lat}%2C${item.lon}`}
              ></iframe>
          </div>
        )}
      </div>

      <div className="glass-panel consulting-cta" style={{ marginTop: '32px', padding: '24px 28px' }}>
        <h3 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Mélyebb elemzésre van szüksége?</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Ez az oldal egy nyilvános adathalmazból épült — pár nap alatt. A{' '}
          <strong style={{ color: 'var(--text-main)' }}>{CREATOR.company}</strong> ugyanígy alakít nyers adatot
          versenyelőnnyé: piackutatás, egyedi adatelemzés, alkalmazás- és webfejlesztés, marketing.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href={`mailto:${CREATOR.email}`} className="cta-btn">Írjon nekünk</a>
          <a href={CREATOR.linkedin} target="_blank" rel="noopener" className="cta-btn cta-btn-ghost">LinkedIn</a>
          <Link href="/a-projektrol" className="cta-btn cta-btn-ghost">A projektről</Link>
        </div>
      </div>

      <div style={{ marginTop: '40px', paddingBottom: '40px' }}>
        <h3 style={{ marginBottom: '16px' }}>Gyakran Ismételt Kérdések (FAQ)</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <strong>Ki felel a {item.category} engedélyezéséért ezen a címen?</strong>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>A közterület-használati engedélyeket Budapest Főváros Önkormányzata, illetve az adott kerületi önkormányzat bocsátja ki. A jelenlegi engedélyes: {item.company}.</p>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <strong>Mekkora területet foglal el a {item.category}?</strong>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>A hivatalos határozat alapján a engedélyezett terület nagysága {item.size} négyzetméter.</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <strong>Meddig érvényes az engedély?</strong>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>A területfoglalás {item.startDate}-től {item.endDate}-ig tart hivatalosan.</p>
        </div>
      </div>
      
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `Ki felel a ${item.category} engedélyezéséért ezen a címen?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `A közterület-használati engedélyeket Budapest Főváros Önkormányzata, illetve az adott kerületi önkormányzat bocsátja ki. A jelenlegi engedélyes: ${item.company}.`
                }
              },
              {
                "@type": "Question",
                "name": `Mekkora területet foglal el a ${item.category}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `A hivatalos határozat alapján a engedélyezett terület nagysága ${item.size} négyzetméter.`
                }
              }
            ]
          })
        }}
      />
    </div>
  );
}
