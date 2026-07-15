/**
 * Bilingual content (hu / en).
 *
 * Hungarian is served to visitors in Hungary (detected in `proxy.ts`);
 * English is the default for everyone else. An explicit choice via the
 * language switcher wins over geo detection and is remembered in a cookie.
 */

export const LOCALES = ["hu", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** BCP-47 / OG locale tags. */
export const OG_LOCALE: Record<Locale, string> = {
  hu: "hu_HU",
  en: "en_US",
};

export const HTML_LANG: Record<Locale, string> = {
  hu: "hu",
  en: "en",
};

/**
 * The permit categories come from the official records in Hungarian. Map the
 * ones that actually occur in the dataset to English; anything unmapped falls
 * back to the original Hungarian term (better than dropping information).
 */
const CATEGORY_EN: Record<string, string> = {
  "vendéglátó terasz": "restaurant terrace",
  "napvédő ponyva reklám nélkül": "sun awning (no advertising)",
  "Egyéb": "other",
  "kereskedelmi pavilon ( 6 - 12 m2 )": "retail pavilion (6–12 m²)",
  "kereskedelmi pavilon ( - 6 m2 )": "retail pavilion (under 6 m²)",
  "üzemanyag-töltőállomás": "petrol station",
  "kereskedelmi épület   (18 m2 - )": "retail building (18 m² and over)",
  "kereskedelmi épület (12 m2 - 18 m2)": "retail building (12–18 m²)",
  "rendezvényterület, építmény, berendezés": "event area, structure, equipment",
  "védőtető, előtető reklám nélkül": "canopy / porch roof (no advertising)",
  "árubemutatás (virág)": "goods display (flowers)",
  "közszolgáltatási személyhajó-kikötő": "public passenger boat pier",
  "Virágláda": "flower planter",
  "rendezvény (terület és elhelyezett építmény)":
    "event (area and installed structure)",
  "üzemanyag-egységárat jelző berendezés": "fuel price display sign",
  "vendéglátó épület (18 m2 - )": "catering building (18 m² and over)",
  "vendéglátó épület (12 m2 - 18 m2)": "catering building (12–18 m²)",
  "vendéglátó pavilon ( - 6 m2 )": "catering pavilion (under 6 m²)",
  "építési terület": "construction site",
  "építési terület (betonpumpa)": "construction site (concrete pump)",
  "építési állványzat": "construction scaffolding",
  "építési védőtető reklám nélkül": "construction canopy (no advertising)",
  "árusító automata": "vending machine",
  "egyéb automata": "other vending machine",
  "rendezvényhez kapcsolódó vendéglátó tevékenység":
    "event-related catering activity",
  "rendezvényhez kapcsolódó kereskedelmi tevékenység":
    "event-related retail activity",
  "gyümölcs, zöldség árusítása": "fruit and vegetable sales",
  "árubemutatás": "goods display",
  "árubemutatás (zöldség-gyümölcs)": "goods display (fruit and vegetables)",
  "árubemutatás (könyv)": "goods display (books)",
  "virág-ajándék árusító épület (12 m2 - 18 m2)":
    "flower & gift shop building (12–18 m²)",
  "virág-ajándék árusító épület (18 m2 - )":
    "flower & gift shop building (18 m² and over)",
  "virág-ajándék árusító pavilon ( - 6 m2 )":
    "flower & gift pavilion (under 6 m²)",
  "virág-ajándék árusító pavilon ( 6 - 12 m2 )":
    "flower & gift pavilion (6–12 m²)",
  "virágárusító épület (12 m2 - 18 m2)": "flower shop building (12–18 m²)",
  "virágárusító épület (18 m2 - )": "flower shop building (18 m² and over)",
  "virágárusító pavilon ( - 6 m2 )": "flower pavilion (under 6 m²)",
  "virágárusító pavilon ( 6 - 12 m2 )": "flower pavilion (6–12 m²)",
  "konténer": "container",
  "bringó-hintó": "pedal carriage rental",
  "Ünnepekhez kapcsolódó árusítás": "holiday season sales",
  "vattacukor árusítása": "candy floss sales",
  "reklámtábla": "advertising board",
  "reklámzászló": "advertising flag",
  "rendezvény (vendéglátó tevékenység)": "event (catering activity)",
  "rendezvény (kereskedelmi tevékenység)": "event (retail activity)",
  "rendezvény (karitatív tevékenység)": "event (charity activity)",
  "sétatricikli": "tricycle rental",
  "köztéri óra reklámmal": "public clock with advertising",
  "Köztéri óra reklám nélkül": "public clock (no advertising)",
  "jégkrém árusítása": "ice cream sales",
  "fagylaltárusítás": "ice cream sales",
  "utcazenélés": "street music",
  "elektromos miniautó": "electric mini car rental",
  "Rakodás, költözés": "loading and moving",
  "Megállítótábla": "A-frame sign",
  "Kisvonat": "tourist train",
  "roller, kerékpár": "scooter and bicycle",
  "közforgalmú személyhajó-kikötő": "public passenger boat pier",
  "óriásplakát (normál, 8-20 m2 felülettel)":
    "billboard (standard, 8–20 m² surface)",
  "óriásplakát (világított, 8-20 m2 felülettel)":
    "billboard (illuminated, 8–20 m² surface)",
  "szórólap": "flyer distribution",
  "csomagolt édesség árusítása": "packaged confectionery sales",
  "vitrin": "display case",
  "álló rendezvényhajó": "moored event boat",
  "tároló és karbantartó kikötő": "storage and maintenance pier",
};

export function translateCategory(
  category: string | null,
  locale: Locale
): string {
  if (!category) return locale === "hu" ? "Közterület-használat" : "Public space use";
  if (locale === "hu") return category;
  return CATEGORY_EN[category] ?? category;
}

/**
 * Addresses are official free text ("8. ker. Múzeum körút 10. szám előtti
 * járdán"). Translating them wholesale would corrupt street names, so only the
 * recurring boilerplate is localized for English readers.
 */
export function translateAddress(address: string, locale: Locale): string {
  if (locale === "hu") return address;
  return address
    .replace(/(\d+)\.\s*ker\./gi, "District $1,")
    .replace(/\s+szám előtti járdán/gi, " — on the pavement in front")
    .replace(/\s+szám előtt/gi, " — in front of no.")
    .replace(/\s+előtti járdán/gi, " — on the pavement in front")
    .replace(/\s+járdán/gi, " — on the pavement")
    .replace(/\s+úttesten/gi, " — on the roadway")
    .replace(/\s+parkolóban/gi, " — in the car park")
    .replace(/\s+parkolósávban/gi, " — in the parking lane");
}

export interface Dictionary {
  meta: {
    title: string;
    description: string;
    twitterTitle: string;
    twitterDescription: string;
    siteName: string;
    keywords: string[];
  };
  nav: {
    map: string;
    list: string;
    upcoming: string;
    upcomingTitle: string;
    backToMap: string;
    about: string;
    langLabel: string;
    switchTo: string;
  };
  home: {
    h1: string;
    loadingMap: string;
    loading: string;
    showFilters: string;
    close: string;
    filtersAndStats: string;
  };
  sidebar: {
    title: string;
    subtitle: string;
    mapSettings: string;
    mapStyle: string;
    styleDark: string;
    styleLight: string;
    styleSatellite: string;
    styleTerrain: string;
    colorBy: string;
    colorDefault: string;
    colorCategory: string;
    colorCompany: string;
    colorSize: string;
    colorStartDate: string;
    heatmap: string;
    filters: string;
    district: string;
    allDistricts: string;
    usagePurpose: string;
    allTypes: string;
    searchCompany: string;
    status: string;
    statusAll: string;
    statusActive: string;
    statusExpiring: string;
    statusExpired: string;
    stats: string;
    topCompanies: string;
    topCategories: string;
    shownLocations: string;
    pieces: string;
    ctaQuestion: string;
    ctaLink: string;
    otherDistrict: string;
    districtSuffix: string;
  };
  map: {
    applicant: string;
    location: string;
    size: string;
    period: string;
    details: string;
    expiringSoon: string;
    unknown: string;
  };
  table: {
    refNumber: string;
    applicant: string;
    purpose: string;
    location: string;
    size: string;
    startDate: string;
    endDate: string;
    empty: string;
    ariaLabel: string;
  };
  permit: {
    notFound: string;
    permitHolder: string;
    permittedSize: string;
    validFrom: string;
    validUntil: string;
    decisionId: string;
    warningTitle: string;
    warningBody: string;
    faqTitle: string;
    /** Templates — interpolate with `fill()`. The dictionary has to stay
     *  JSON-serializable because it is handed to Client Components. */
    faqQ1: string;
    faqA1: string;
    faqQ2: string;
    faqA2: string;
    faqQ3: string;
    faqA3: string;
    metaTitle: string;
    metaDescription: string;
  };
  upcoming: {
    label30: string;
    label3m: string;
    title30: string;
    title3m: string;
    description30: string;
    description3m: string;
    h1: string;
    intro: string;
    permitsStarting: string;
    totalArea: string;
    whyTitle: string;
    whyItems: { title: string; body: string }[];
    emptyState: string;
    ctaTitle: string;
    ctaBody: string;
    ctaButton: string;
    ctaAbout: string;
  };
  about: {
    title: string;
    description: string;
    h1: string;
    intro1: string;
    intro2: string;
    howTitle: string;
    howRows: { label: string; value: string }[];
    disclaimer: string;
    ctaTitle: string;
    ctaBody: string;
    ctaList: string[];
    ctaButton: string;
    worksTitle: string;
    works: { label: string; desc: string }[];
  };
  footer: {
    madeBy: string;
    cta: string;
    disclaimer: string;
  };
  common: {
    unknown: string;
    na: string;
  };
}

const hu: Dictionary = {
  meta: {
    title: "Ki foglalja el a közterületet Budapesten? | Közterület-térkép",
    description:
      "Interaktív térkép és kereshető adatbázis Budapest közterület-használati engedélyeiről: vendéglátó teraszok, építkezések, filmforgatások és lezárások — hivatalos önkormányzati határozatok alapján, nyílt forráskóddal.",
    twitterTitle: "Ki foglalja el a közterületet Budapesten?",
    twitterDescription:
      "Térképen a budapesti teraszok, építkezések és lezárások hivatalos engedélyei. Nyílt adat, nyílt forráskód.",
    siteName: "Budapest Közterület Térkép",
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
      "térkép",
    ],
  },
  nav: {
    map: "Térkép",
    list: "Lista",
    upcoming: "Közelgő ✨",
    upcomingTitle: "Mi indul Budapesten a következő 30 napban?",
    backToMap: "← Vissza a térképre",
    about: "A projektről",
    langLabel: "Nyelv",
    switchTo: "Switch to English",
  },
  home: {
    h1: "Ki foglalja el a közterületet Budapesten? Nézze meg a hivatalos térképet!",
    loadingMap: "Térkép betöltése...",
    loading: "Betöltés...",
    showFilters: "Szűrők megjelenítése",
    close: "Bezárás",
    filtersAndStats: "Szűrés & Statisztika",
  },
  sidebar: {
    title: "Budapest Közterület",
    subtitle: "Közterület-használati határozatok",
    mapSettings: "Térkép Beállítások",
    mapStyle: "Térkép Stílusa",
    styleDark: "Sötét (Dark)",
    styleLight: "Világos (Light)",
    styleSatellite: "Műhold (Satellite)",
    styleTerrain: "Domborzat (Terrain)",
    colorBy: "Színezés Alapján",
    colorDefault: "Alapértelmezett (Lejárat)",
    colorCategory: "Használat célja (Típus)",
    colorCompany: "Kérelmező (Cég)",
    colorSize: "Méret (nm)",
    colorStartDate: "Kezdés dátuma",
    heatmap: "Hőtérkép bekapcsolása",
    filters: "Szűrők",
    district: "Kerület",
    allDistricts: "Minden Kerület",
    usagePurpose: "Használati Cél",
    allTypes: "Minden Típus",
    searchCompany: "Cég keresése",
    status: "Státusz (Lejárat)",
    statusAll: "Összes",
    statusActive: "Érvényes",
    statusExpiring: "Hamarosan lejár",
    statusExpired: "Lejárt",
    stats: "Statisztika (Top 5)",
    topCompanies: "Top Cégek",
    topCategories: "Top Célok",
    shownLocations: "Megjelenített helyszínek:",
    pieces: "db",
    ctaQuestion: "Hasonló elemzést szeretne a saját piacáról?",
    ctaLink: "Bonvo Consulting →",
    otherDistrict: "Egyéb",
    districtSuffix: ". kerület",
  },
  map: {
    applicant: "Kérelmező:",
    location: "Hely:",
    size: "Méret:",
    period: "Időszak:",
    details: "Részletek és GYIK →",
    expiringSoon: "🔥 Hamarosan lejár vagy lejárt!",
    unknown: "Egyéb",
  },
  table: {
    refNumber: "Iktatószám",
    applicant: "Kérelmező",
    purpose: "Cél",
    location: "Hely",
    size: "Méret (nm)",
    startDate: "Kezdete",
    endDate: "Vége",
    empty: "Nincs megjeleníthető adat a kiválasztott szűrőkkel.",
    ariaLabel: "Közterület táblázat",
  },
  permit: {
    notFound: "A keresett helyszín nem található.",
    permitHolder: "Engedélyes",
    permittedSize: "Engedélyezett méret",
    validFrom: "Érvényesség kezdete",
    validUntil: "Érvényesség vége",
    decisionId: "Határozat azonosító (HRZ)",
    warningTitle: "Fontos figyelmeztetés:",
    warningBody:
      "Ez az oldal automatikusan generált adatokat tartalmaz a hivatalos közterület-használati adatbázisból. A geolokáció (térképi elhelyezkedés) pontatlan lehet, és a határozati státusz időközben változhatott.",
    faqTitle: "Gyakran Ismételt Kérdések (GYIK)",
    faqQ1: "Ki felel a(z) {category} engedélyezéséért ezen a címen?",
    faqA1:
      "A közterület-használati engedélyeket Budapest Főváros Önkormányzata, illetve az adott kerületi önkormányzat bocsátja ki. A jelenlegi engedélyes: {company}.",
    faqQ2: "Mekkora területet foglal el a(z) {category}?",
    faqA2:
      "A hivatalos határozat alapján az engedélyezett terület nagysága {size} négyzetméter.",
    faqQ3: "Meddig érvényes az engedély?",
    faqA3: "A területfoglalás {start}-től {end}-ig tart hivatalosan.",
    metaTitle: "{company} – {category}, {address}",
    metaDescription:
      "Közterület-használati engedély a(z) {address} címen. Engedélyes: {company}, terület: {size} m². Érvényes: {start} – {end}. Hivatalos önkormányzati határozat térképen.",
  },
  upcoming: {
    label30: "Következő 30 nap",
    label3m: "Következő 3 hónap",
    title30: "Közelgő közterület-foglalások – a következő 30 nap",
    title3m: "Közelgő közterület-foglalások – a következő 3 hónap",
    description30:
      "Milyen új terasz, építkezés, rendezvény vagy filmforgatás indul Budapesten a következő 30 napban? Tervezzen előre: lezárások, korlátozások és forgalmasabb utcák egy helyen, hivatalos engedélyek alapján.",
    description3m:
      "Budapest következő 3 hónapja előre: minden közterület-használati engedély, amely mostantól lép életbe — építkezések, rendezvények, filmforgatások és teraszok, hivatalos határozatok alapján.",
    h1: "Mi indul Budapesten? — {period}",
    intro:
      "Budapest kilátásai előre: az alábbi közterület-használati engedélyek a mai naptól számított {days} napon belül lépnek életbe. Új építkezések, rendezvények, filmforgatások és teraszok — mielőtt még az utcán találkozna velük.",
    permitsStarting: "Életbe lépő engedélyek",
    totalArea: "Összes lefoglalt terület",
    whyTitle: "Miért érdemes előre nézni?",
    whyItems: [
      {
        title: "Közlekedés és parkolás:",
        body: "az induló építkezések és felvonulási területek járdát, parkolósávot vagy teljes útszakaszt zárhatnak le — jobb útvonalat még előtte tervezni.",
      },
      {
        title: "Rendezvények és forgatások:",
        body: "ahol esemény vagy filmforgatás indul, ott időszakos lezárásra és nagyobb forgalomra érdemes számítani.",
      },
      {
        title: "Vállalkozásoknak:",
        body: "a környéken nyíló teraszok és munkaterületek befolyásolják a gyalogosforgalmat, a kirakati láthatóságot és az áruszállítást.",
      },
      {
        title: "Lakóknak:",
        body: "zajosabb időszakok, korlátozott kapubejárók, magasabb terheltség — kevesebb meglepetés, ha időben látszik.",
      },
    ],
    emptyState:
      "A jelenlegi adatbázisban nincs olyan engedély, amely ebben az időszakban lépne életbe. Nézzen vissza az adatok következő frissítése után!",
    ctaTitle: "Előrejelzés a saját piacára?",
    ctaBody:
      "Ez az oldal nyilvános adatokból számol előre. A Bonvo Consulting Kft. ugyanezt megcsinálja az Ön adataiból is: trendek, előrejelzések, versenytárs-figyelés és egyedi dashboardok.",
    ctaButton: "Beszéljünk",
    ctaAbout: "A projektről",
  },
  about: {
    title: "A projektről – nyílt adat, nyílt forráskód",
    description:
      "Hogyan készült a budapesti közterület-használati térkép: hivatalos önkormányzati határozatokból, geokódolással, nyílt forráskóddal. A projekt a Bonvo Consulting Kft. munkája.",
    h1: "Ki foglalja el a közterületet Budapesten?",
    intro1:
      "Budapest utcáin nap mint nap tűnnek fel teraszok, építési konténerek, filmforgatási lezárások — de ki, mire és meddig kapott engedélyt? Ez az oldal a fővárosi közterület-használati határozatok nyilvános adatait teszi mindenki számára böngészhetővé: interaktív térképen, kereshető listában, kerületenként és kategóriánként szűrhetően.",
    intro2:
      "A projekt nyílt forráskódú — a teljes kód, az adatfeldolgozó szkriptek és az eredeti hivatalos táblázat is elérhető a GitHubon.",
    howTitle: "Hogyan készült?",
    howRows: [
      { label: "Adatforrás", value: "Hivatalos önkormányzati határozatok (XLSX)" },
      { label: "Feldolgozás", value: "Python — tisztítás, kategorizálás, slug-generálás" },
      { label: "Geokódolás", value: "Photon / Nominatim (OpenStreetMap)" },
      { label: "Frontend", value: "Next.js, React, Leaflet, MUI" },
    ],
    disclaimer:
      "Fontos: az adatok tájékoztató jellegűek. A térképi pozíció a cím alapján, automatikus geokódolással készült, ezért pontatlan lehet, és a határozatok státusza időközben változhatott.",
    ctaTitle: "Önnek is van adata — csak még nem beszél?",
    ctaBody:
      "Ez az oldal néhány nap alatt készült egy nyers Excel-táblából. A Bonvo Consulting Kft. pontosan ilyen munkákra szakosodott: mélyreható adatelemzés és kutatás, amivel bármilyen piacon versenyelőnyt találunk — valamint teljes körű IT-fejlesztés bérmunkában is: webes és mobil alkalmazások, adatplatformok, marketing.",
    ctaList: [
      "Piac- és versenytárs-elemzés nyilvános és saját adatokból",
      "Egyedi dashboardok, térképes és kereshető adatplatformok",
      "Web- és mobilalkalmazás-fejlesztés (React, Next.js, React Native)",
      "SEO, growth és adatvezérelt marketing",
    ],
    ctaButton: "Beszéljünk a projektjéről",
    worksTitle: "További munkáink",
    works: [
      { label: "gregorysmith.eu", desc: "Portfólió és esettanulmányok" },
      { label: "bonvo.ski", desc: "3D sítérkép app — 1400+ síterep" },
      { label: "business.bonvo.ski", desc: "Bonvo üzleti megoldások" },
      { label: "Bonvo Ski az App Store-ban", desc: "iOS alkalmazás" },
      { label: "LinkedIn", desc: "Kovács Gergely" },
      { label: "Instagram", desc: "@bonvo.ski" },
    ],
  },
  footer: {
    madeBy: "Készítette:",
    cta: "Egyedi adatelemzést szeretne? →",
    disclaimer: "Minden adat tájékoztató jellegű",
  },
  common: {
    unknown: "Ismeretlen",
    na: "n/a",
  },
};

const en: Dictionary = {
  meta: {
    title: "Who occupies Budapest's public spaces? | Public Space Map",
    description:
      "Interactive map and searchable database of every public-space usage permit in Budapest: restaurant terraces, construction sites, film shoots and street closures — from official municipal records, fully open source.",
    twitterTitle: "Who occupies Budapest's public spaces?",
    twitterDescription:
      "Every terrace, construction site and street closure in Budapest on one map. Open data, open source.",
    siteName: "Budapest Public Space Map",
    keywords: [
      "Budapest",
      "public space",
      "public space permits",
      "street occupancy",
      "terrace permit",
      "restaurant terrace",
      "construction site",
      "street closure",
      "municipality",
      "open data",
      "civic tech",
      "map",
    ],
  },
  nav: {
    map: "Map",
    list: "List",
    upcoming: "Upcoming ✨",
    upcomingTitle: "What's starting in Budapest in the next 30 days?",
    backToMap: "← Back to the map",
    about: "About",
    langLabel: "Language",
    switchTo: "Váltás magyarra",
  },
  home: {
    h1: "Who occupies Budapest's public spaces? Explore the official map!",
    loadingMap: "Loading map...",
    loading: "Loading...",
    showFilters: "Show filters",
    close: "Close",
    filtersAndStats: "Filters & Stats",
  },
  sidebar: {
    title: "Budapest Public Space",
    subtitle: "Public-space usage permits",
    mapSettings: "Map Settings",
    mapStyle: "Map Style",
    styleDark: "Dark",
    styleLight: "Light",
    styleSatellite: "Satellite",
    styleTerrain: "Terrain",
    colorBy: "Color By",
    colorDefault: "Default (Expiry)",
    colorCategory: "Purpose of use (Type)",
    colorCompany: "Applicant (Company)",
    colorSize: "Size (m²)",
    colorStartDate: "Start date",
    heatmap: "Enable heatmap",
    filters: "Filters",
    district: "District",
    allDistricts: "All Districts",
    usagePurpose: "Purpose of Use",
    allTypes: "All Types",
    searchCompany: "Search company",
    status: "Status (Expiry)",
    statusAll: "All",
    statusActive: "Active",
    statusExpiring: "Expiring soon",
    statusExpired: "Expired",
    stats: "Statistics (Top 5)",
    topCompanies: "Top Companies",
    topCategories: "Top Purposes",
    shownLocations: "Locations shown:",
    pieces: "",
    ctaQuestion: "Want this kind of analysis for your own market?",
    ctaLink: "Bonvo Consulting →",
    otherDistrict: "Other",
    districtSuffix: "",
  },
  map: {
    applicant: "Applicant:",
    location: "Location:",
    size: "Size:",
    period: "Period:",
    details: "Details and FAQ →",
    expiringSoon: "🔥 Expiring soon or already expired!",
    unknown: "Other",
  },
  table: {
    refNumber: "Reference no.",
    applicant: "Applicant",
    purpose: "Purpose",
    location: "Location",
    size: "Size (m²)",
    startDate: "Start",
    endDate: "End",
    empty: "No data matches the selected filters.",
    ariaLabel: "Public space permits table",
  },
  permit: {
    notFound: "The requested location was not found.",
    permitHolder: "Permit holder",
    permittedSize: "Permitted area",
    validFrom: "Valid from",
    validUntil: "Valid until",
    decisionId: "Decision ID",
    warningTitle: "Important notice:",
    warningBody:
      "This page contains automatically generated data from the official public-space usage database. The geolocation (map position) may be imprecise, and the status of the decision may have changed since publication.",
    faqTitle: "Frequently Asked Questions (FAQ)",
    faqQ1: "Who is responsible for authorising the {category} at this address?",
    faqA1:
      "Public-space usage permits are issued by the Municipality of Budapest or the relevant district council. The current permit holder is: {company}.",
    faqQ2: "How much space does the {category} occupy?",
    faqA2:
      "According to the official decision, the permitted area is {size} square metres.",
    faqQ3: "How long is the permit valid?",
    faqA3: "The occupancy officially runs from {start} until {end}.",
    metaTitle: "{company} – {category}, {address}",
    metaDescription:
      "Public-space usage permit at {address}. Permit holder: {company}, area: {size} m². Valid: {start} – {end}. Official municipal decision on the map.",
  },
  upcoming: {
    label30: "Next 30 days",
    label3m: "Next 3 months",
    title30: "Upcoming public-space occupancies – the next 30 days",
    title3m: "Upcoming public-space occupancies – the next 3 months",
    description30:
      "Which new terraces, construction sites, events or film shoots start in Budapest in the next 30 days? Plan ahead: closures, restrictions and busier streets in one place, based on official permits.",
    description3m:
      "Budapest's next 3 months in advance: every public-space usage permit coming into effect from today — construction sites, events, film shoots and terraces, based on official decisions.",
    h1: "What's starting in Budapest? — {period}",
    intro:
      "Budapest's outlook: the public-space usage permits below come into effect within {days} days from today. New construction sites, events, film shoots and terraces — before you run into them on the street.",
    permitsStarting: "Permits coming into effect",
    totalArea: "Total area reserved",
    whyTitle: "Why look ahead?",
    whyItems: [
      {
        title: "Traffic and parking:",
        body: "new construction sites and staging areas can close pavements, parking lanes or entire road sections — better to plan your route before it happens.",
      },
      {
        title: "Events and film shoots:",
        body: "where an event or a shoot begins, expect temporary closures and heavier foot traffic.",
      },
      {
        title: "For businesses:",
        body: "terraces and work sites opening nearby affect footfall, shop-window visibility and deliveries.",
      },
      {
        title: "For residents:",
        body: "noisier periods, restricted gateways, higher congestion — fewer surprises when you can see it coming.",
      },
    ],
    emptyState:
      "There are no permits in the current dataset coming into effect in this window. Check back after the next data refresh!",
    ctaTitle: "A forecast for your own market?",
    ctaBody:
      "This page projects ahead from public data. Bonvo Consulting Kft. does exactly the same with your data: trends, forecasts, competitor monitoring and custom dashboards.",
    ctaButton: "Let's talk",
    ctaAbout: "About the project",
  },
  about: {
    title: "About the project – open data, open source",
    description:
      "How the Budapest public-space map was built: from official municipal decisions, via geocoding, fully open source. A project by Bonvo Consulting Kft.",
    h1: "Who occupies Budapest's public spaces?",
    intro1:
      "Terraces, construction containers and film-shoot closures appear on Budapest's streets every day — but who got a permit, for what, and until when? This site makes the public data of the capital's public-space usage decisions browsable for everyone: on an interactive map, in a searchable list, filterable by district and category.",
    intro2:
      "The project is open source — the full code, the data-processing scripts and the original official spreadsheet are all available on GitHub.",
    howTitle: "How was it built?",
    howRows: [
      { label: "Data source", value: "Official municipal decisions (XLSX)" },
      { label: "Processing", value: "Python — cleaning, categorisation, slug generation" },
      { label: "Geocoding", value: "Photon / Nominatim (OpenStreetMap)" },
      { label: "Frontend", value: "Next.js, React, Leaflet, MUI" },
    ],
    disclaimer:
      "Important: all data is informational only. Map positions are derived from addresses via automated geocoding and may be imprecise, and the status of decisions may have changed since publication.",
    ctaTitle: "You have data too — it just isn't talking yet?",
    ctaBody:
      "This site was built in a few days from a raw Excel sheet. Bonvo Consulting Kft. specialises in exactly this kind of work: deep data analysis and research that finds a competitive edge in any market — plus full-service contract IT development: web and mobile apps, data platforms, and marketing.",
    ctaList: [
      "Market and competitor analysis from public and proprietary data",
      "Custom dashboards, map-based and searchable data platforms",
      "Web and mobile app development (React, Next.js, React Native)",
      "SEO, growth and data-driven marketing",
    ],
    ctaButton: "Let's talk about your project",
    worksTitle: "More of our work",
    works: [
      { label: "gregorysmith.eu", desc: "Portfolio and case studies" },
      { label: "bonvo.ski", desc: "3D ski map app — 1,400+ resorts" },
      { label: "business.bonvo.ski", desc: "Bonvo business solutions" },
      { label: "Bonvo Ski on the App Store", desc: "iOS app" },
      { label: "LinkedIn", desc: "Gergely Kovács" },
      { label: "Instagram", desc: "@bonvo.ski" },
    ],
  },
  footer: {
    madeBy: "Built by",
    cta: "Need custom data analysis? →",
    disclaimer: "All data is informational only",
  },
  common: {
    unknown: "Unknown",
    na: "n/a",
  },
};

const dictionaries: Record<Locale, Dictionary> = { hu, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * The slice the interactive map UI needs. Passing the whole dictionary to a
 * Client Component would ship the permit/about/outlook prose to the browser on
 * every page for nothing.
 */
export type ClientDictionary = Pick<
  Dictionary,
  "nav" | "home" | "sidebar" | "map" | "table" | "common"
>;

export function getClientDictionary(locale: Locale): ClientDictionary {
  const d = dictionaries[locale];
  return {
    nav: d.nav,
    home: d.home,
    sidebar: d.sidebar,
    map: d.map,
    table: d.table,
    common: d.common,
  };
}

/** Interpolate a dictionary template: fill("Hi {name}", { name: "Geri" }). */
export function fill(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match
  );
}

/** Build a locale-prefixed path: localePath("en", "/helyszin/x") -> "/en/helyszin/x" */
export function localePath(locale: Locale, path = ""): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Strip the locale prefix from a pathname: "/en/helyszin/x" -> "/helyszin/x" */
export function stripLocale(pathname: string): string {
  for (const l of LOCALES) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

/** Format an ISO date for display in the given locale. */
export function formatDate(iso: string | null, locale: Locale): string {
  if (!iso) return locale === "hu" ? "n/a" : "n/a";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "hu" ? "hu-HU" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/** Format an ISO date with weekday, for the upcoming-outlook day headers. */
export function formatDateLong(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "hu" ? "hu-HU" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(d);
}

export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "hu" ? "hu-HU" : "en-GB").format(n);
}
