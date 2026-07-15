import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SITE, CREATOR } from '@/lib/site';
import { loadPermits } from '@/lib/og';
import {
  LOCALES,
  getDictionary,
  isLocale,
  localePath,
  translateCategory,
  translateAddress,
  formatDate,
  fill,
  OG_LOCALE,
} from '@/lib/i18n';

export async function generateStaticParams() {
  const permits = loadPermits();
  return LOCALES.flatMap((locale) =>
    permits.map((item) => ({ locale, slug: item.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  const item = loadPermits().find((d) => d.slug === slug);

  if (!item) {
    return { title: dict.permit.notFound };
  }

  const company = item.company || dict.common.unknown;
  const category = translateCategory(item.category, locale);
  const address = translateAddress(item.address, locale);
  const title = fill(dict.permit.metaTitle, { company, category, address });
  const desc = fill(dict.permit.metaDescription, {
    address,
    company,
    size: String(item.size ?? '?'),
    start: formatDate(item.startDate, locale),
    end: formatDate(item.endDate, locale),
  });
  const ogImage = `/api/og/${locale}/${item.slug}`;
  const path = `/helyszin/${item.slug}`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        hu: `/hu${path}`,
        en: `/en${path}`,
        'x-default': `/en${path}`,
      },
    },
    openGraph: {
      title,
      description: desc,
      url: `/${locale}${path}`,
      siteName: dict.meta.siteName,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === 'hu' ? 'en' : 'hu'],
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

export default async function ListingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const item = loadPermits().find((d) => d.slug === slug);

  if (!item) {
    return (
      <div className="table-container detail-container">
        <h1>{dict.permit.notFound}</h1>
      </div>
    );
  }

  const company = item.company || dict.common.unknown;
  const category = translateCategory(item.category, locale);
  const address = translateAddress(item.address, locale);
  const size = String(item.size ?? '?');
  const start = formatDate(item.startDate, locale);
  const end = formatDate(item.endDate, locale);

  return (
    <div
      className="table-container detail-container"
      style={{ maxWidth: '800px', margin: '0 auto' }}
    >
      <Link href={localePath(locale, '/')} className="back-link">
        {dict.nav.backToMap}
      </Link>

      <div className="glass-panel" style={{ padding: '32px', marginTop: '20px' }}>
        <h1 style={{ marginBottom: '8px', color: 'var(--accent-color)' }}>{category}</h1>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '24px' }}>{address}</h2>

        <div className="section" style={{ marginBottom: '32px' }}>
          <div className="stat-row">
            <span className="stat-name">{dict.permit.permitHolder}</span>
            <span className="stat-value">{company}</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">{dict.permit.permittedSize}</span>
            <span className="stat-value">{size} m²</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">{dict.permit.validFrom}</span>
            <span className="stat-value">{start}</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">{dict.permit.validUntil}</span>
            <span className="stat-value">{end}</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">{dict.permit.decisionId}</span>
            <span className="stat-value">{item.id}</span>
          </div>
        </div>

        <div className="card" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--text-main)', marginBottom: '32px' }}>
          <strong>{dict.permit.warningTitle}</strong> {dict.permit.warningBody}
        </div>

        {item.lat && item.lon && (
          <div style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)' }}>
            <iframe
              title={address}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${item.lon - 0.002}%2C${item.lat - 0.002}%2C${item.lon + 0.002}%2C${item.lat + 0.002}&layer=mapnik&marker=${item.lat}%2C${item.lon}`}
            ></iframe>
          </div>
        )}
      </div>

      <div className="glass-panel consulting-cta" style={{ marginTop: '32px', padding: '24px 28px' }}>
        <h3 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>{dict.upcoming.ctaTitle}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          {dict.about.ctaBody}
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href={`mailto:${CREATOR.email}`} className="cta-btn">{dict.upcoming.ctaButton}</a>
          <a href={CREATOR.linkedin} target="_blank" rel="noopener" className="cta-btn cta-btn-ghost">LinkedIn</a>
          <Link href={localePath(locale, '/a-projektrol')} className="cta-btn cta-btn-ghost">{dict.nav.about}</Link>
        </div>
      </div>

      <div style={{ marginTop: '40px', paddingBottom: '40px' }}>
        <h3 style={{ marginBottom: '16px' }}>{dict.permit.faqTitle}</h3>

        <div style={{ marginBottom: '16px' }}>
          <strong>{fill(dict.permit.faqQ1, { category })}</strong>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{fill(dict.permit.faqA1, { company })}</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <strong>{fill(dict.permit.faqQ2, { category })}</strong>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{fill(dict.permit.faqA2, { size })}</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <strong>{dict.permit.faqQ3}</strong>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{fill(dict.permit.faqA3, { start, end })}</p>
        </div>
      </div>

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": `${SITE.url}/${locale}/helyszin/${item.slug}#faq`,
            inLanguage: locale,
            mainEntity: [
              {
                "@type": "Question",
                name: fill(dict.permit.faqQ1, { category }),
                acceptedAnswer: { "@type": "Answer", text: fill(dict.permit.faqA1, { company }) },
              },
              {
                "@type": "Question",
                name: fill(dict.permit.faqQ2, { category }),
                acceptedAnswer: { "@type": "Answer", text: fill(dict.permit.faqA2, { size }) },
              },
              {
                "@type": "Question",
                name: dict.permit.faqQ3,
                acceptedAnswer: { "@type": "Answer", text: fill(dict.permit.faqA3, { start, end }) },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
