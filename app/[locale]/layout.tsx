import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import SiteFooter from "@/components/SiteFooter";
import ClarityAnalytics from "@/components/ClarityAnalytics";
import { SITE, CREATOR } from "@/lib/site";
import {
  LOCALES,
  HTML_LANG,
  OG_LOCALE,
  getDictionary,
  isLocale,
  type Locale,
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

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: dict.meta.title,
      template: `%s | ${dict.meta.siteName}`,
    },
    description: dict.meta.description,
    keywords: [...dict.meta.keywords],
    authors: [{ name: CREATOR.name, url: CREATOR.portfolio }],
    creator: CREATOR.company,
    publisher: CREATOR.company,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        hu: "/hu",
        en: "/en",
        "x-default": "/en",
      },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      url: `/${locale}`,
      siteName: dict.meta.siteName,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === "hu" ? "en" : "hu"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.twitterTitle,
      description: dict.meta.twitterDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

function buildJsonLd(locale: Locale) {
  const dict = getDictionary(locale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website-${locale}`,
        url: `${SITE.url}/${locale}`,
        name: dict.meta.siteName,
        description: dict.meta.description,
        inLanguage: HTML_LANG[locale],
        publisher: { "@id": `${SITE.url}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#organization`,
        name: CREATOR.company,
        url: CREATOR.portfolio,
        founder: {
          "@type": "Person",
          name: CREATOR.name,
          url: CREATOR.portfolio,
          sameAs: [CREATOR.linkedin, CREATOR.threads],
        },
        sameAs: [
          CREATOR.linkedin,
          CREATOR.bonvoSki,
          CREATOR.bonvoBusiness,
          CREATOR.instagram,
          CREATOR.tiktok,
        ],
      },
      {
        "@type": "Dataset",
        "@id": `${SITE.url}/#dataset-${locale}`,
        name:
          locale === "hu"
            ? "Budapest közterület-használati határozatok"
            : "Budapest public-space usage permits",
        description:
          locale === "hu"
            ? "Budapest Főváros Önkormányzata által kiadott közterület-használati határozatok geokódolt, strukturált adatbázisa: engedélyes, cím, terület, kategória és érvényesség."
            : "A geocoded, structured database of public-space usage decisions issued by the Municipality of Budapest: permit holder, address, area, category and validity.",
        url: `${SITE.url}/${locale}`,
        inLanguage: HTML_LANG[locale],
        isAccessibleForFree: true,
        license: `${SITE.githubRepo}/blob/main/LICENSE`,
        creator: { "@id": `${SITE.url}/#organization` },
        distribution: [
          {
            "@type": "DataDownload",
            encodingFormat: "application/json",
            contentUrl: `${SITE.url}/data.json`,
          },
        ],
      },
    ],
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={HTML_LANG[locale]}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildJsonLd(locale)),
          }}
        />
        <ClarityAnalytics />
        <ThemeRegistry>
          <main className="app-container">{children}</main>
          <SiteFooter locale={locale} />
        </ThemeRegistry>
      </body>
    </html>
  );
}
