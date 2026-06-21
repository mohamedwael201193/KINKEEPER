import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE_NAME } from "@/site/content/navigation";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-ink/10 bg-ink/95 px-4 py-2 text-canvas shadow-card backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 pl-2">
          <span className="font-serif text-lg tracking-tight">{SITE_NAME.split(" ")[0]}</span>
          <span className="hidden text-xs text-canvas/60 sm:inline">Guardian Mesh</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-canvas/75 transition-colors hover:text-canvas"
              activeProps={{ className: "text-canvas" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden text-canvas hover:bg-white/10 sm:inline-flex">
            <Link to="/docs">Docs</Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="bg-canvas text-ink hover:bg-canvas/90">
            <Link to="/download">Download</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
