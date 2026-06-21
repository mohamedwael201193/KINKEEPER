import { Link } from "@tanstack/react-router";
import { FOOTER_GROUPS, SITE_NAME } from "@/site/content/navigation";

export function MarketingFooter() {
  return (
    <footer className="border-t border-ink/10 bg-canvas-muted/40 px-4 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_repeat(3,1fr)]">
        <div>
          <p className="font-serif text-2xl text-ink">{SITE_NAME}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
            Local AI fraud detection for families. Private by design. Evidence you can trust.
          </p>
        </div>
        {FOOTER_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{group.title}</p>
            <ul className="mt-4 space-y-2">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-2 border-t border-ink/10 pt-6 text-xs text-ink-faint sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} KINKEEPER. Apache-2.0.</p>
        <p>Built with QVAC local inference · No cloud LLM in the core path</p>
      </div>
    </footer>
  );
}
