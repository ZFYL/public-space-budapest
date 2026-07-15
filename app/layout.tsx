import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import SiteFooter from "@/components/SiteFooter";
import { SITE, CREATOR } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "Budapest",
    "közterület",
    "közterület-használat",
    "közterület-foglalás",
    "terasz engedély",
    "vendéglátó terasz",
    "építkezés",
    "útlezárás",
    "önkormányzat",
    "nyílt adat",
    "open data",
    "térkép",
    "public space",
  ],
  authors: [{ name: CREATOR.name, url: CREATOR.portfolio }],
  creator: CREATOR.company,
  publisher: CREATOR.company,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: "/",
    siteName: SITE.name,
    locale: SITE.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ki foglalja el a közterületet Budapesten?",
    description:
      "Térképen a budapesti teraszok, építkezések és lezárások hivatalos engedélyei. Nyílt adat, nyílt forráskód.",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      inLanguage: "hu",
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
      "@id": `${SITE.url}/#dataset`,
      name: "Budapest közterület-használati határozatok",
      description:
        "Budapest Főváros Önkormányzata által kiadott közterület-használati határozatok geokódolt, strukturált adatbázisa: engedélyes, cím, terület, kategória és érvényesség.",
      url: SITE.url,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeRegistry>
          <main className="app-container">
            {children}
          </main>
          <SiteFooter />
        </ThemeRegistry>
      </body>
    </html>
  );
}
