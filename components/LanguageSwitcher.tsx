"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LOCALES,
  LOCALE_COOKIE,
  stripLocale,
  localePath,
  type Locale,
} from "@/lib/i18n";

type Props = {
  locale: Locale;
  /** Only the two strings this needs — see `getClientDictionary`. */
  label: string;
  switchTo: string;
  variant?: "compact" | "inline";
};

/**
 * Switches language and remembers the choice — the cookie is what makes an
 * explicit choice outrank geo detection in `proxy.ts`.
 */
export default function LanguageSwitcher({
  locale,
  label,
  switchTo,
  variant = "inline",
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const go = (next: Locale) => {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.push(localePath(next, stripLocale(pathname || "/")));
    router.refresh();
  };

  return (
    <div
      className={`lang-switcher ${variant === "compact" ? "lang-switcher-compact" : ""}`}
      role="group"
      aria-label={label}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => go(l)}
          className={`lang-btn ${l === locale ? "active" : ""}`}
          aria-current={l === locale ? "true" : undefined}
          title={l === locale ? undefined : switchTo}
          lang={l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
