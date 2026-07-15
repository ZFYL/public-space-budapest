import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/i18n";

/**
 * Locale routing.
 *
 * Hungarian is served to visitors in Hungary; English is the default for
 * everyone else. Priority:
 *   1. an explicit choice from the language switcher (cookie) — always wins,
 *      otherwise a Hungarian reading in English would be bounced back on
 *      every navigation;
 *   2. the request's country (Vercel's geo header) — "the region";
 *   3. Accept-Language, which is all we have off-Vercel (local dev, other
 *      hosts) and is still a strong signal for a Hungarian speaker;
 *   4. English.
 */
function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && isLocale(cookie)) return cookie;

  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry");
  if (country) return country.toUpperCase() === "HU" ? "hu" : DEFAULT_LOCALE;

  const accept = request.headers.get("accept-language");
  if (accept && /(^|,|\s)hu\b/i.test(accept)) return "hu";

  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return;

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  const response = NextResponse.redirect(url);
  // Remember the resolved locale so the next request skips detection and a
  // switcher choice survives navigation.
  if (!request.cookies.get(LOCALE_COOKIE)) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  // Everything except Next internals, API routes and files with an extension
  // (data.json, sitemap.xml, robots.txt, favicon.ico, images…).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
