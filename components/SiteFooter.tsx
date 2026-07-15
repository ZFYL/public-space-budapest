import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { SITE, CREATOR } from "@/lib/site";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

export default function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <footer className="global-footer">
      <span>
        {dict.footer.madeBy} <strong>{CREATOR.company}</strong>
      </span>
      <span className="footer-sep">·</span>
      <Link href={localePath(locale, "/a-projektrol")} className="footer-link footer-cta">
        {dict.footer.cta}
      </Link>
      <span className="footer-sep footer-optional">·</span>
      <a
        href={CREATOR.portfolio}
        target="_blank"
        rel="noopener"
        className="footer-link footer-optional"
      >
        gregorysmith.eu
      </a>
      <span className="footer-sep footer-optional">·</span>
      <a
        href={CREATOR.linkedin}
        target="_blank"
        rel="noopener"
        className="footer-link footer-optional"
      >
        LinkedIn
      </a>
      <span className="footer-sep footer-optional">·</span>
      <a
        href={SITE.githubRepo}
        target="_blank"
        rel="noopener"
        className="footer-link footer-optional"
      >
        GitHub
      </a>
      <span className="footer-sep footer-optional">·</span>
      <span className="footer-optional">{dict.footer.disclaimer}</span>
      <span className="footer-sep">·</span>
      <LanguageSwitcher
        locale={locale}
        label={dict.nav.langLabel}
        switchTo={dict.nav.switchTo}
      />
    </footer>
  );
}
