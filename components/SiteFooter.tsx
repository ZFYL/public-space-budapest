import Link from "next/link";
import { SITE, CREATOR } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="global-footer">
      <span>
        Készítette: <strong>{CREATOR.company}</strong>
      </span>
      <span className="footer-sep">·</span>
      <Link href="/a-projektrol" className="footer-link footer-cta">
        Egyedi adatelemzést szeretne? →
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
      <span className="footer-optional">Minden adat tájékoztató jellegű</span>
    </footer>
  );
}
