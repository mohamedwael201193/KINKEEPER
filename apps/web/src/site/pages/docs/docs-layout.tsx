import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { DOC_PAGES, DOC_SECTIONS, docsBySection } from "@/site/content/docs-tree";
import { MarketingShell } from "@/site/layout/marketing-shell";
import { SeoHead } from "@/site/components/seo-head";
import { cn } from "@/lib/utils";

export function DocsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const slug = pathname.replace(/^\/docs\/?/, "") || "";

  return (
    <MarketingShell>
      <SeoHead title="Documentation" path="/docs" description="Guardian Mesh documentation — installation, architecture, and developer guides." />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[240px_1fr] md:px-8">
        <aside className="hidden md:block">
          <nav className="sticky top-28 space-y-8">
            {DOC_SECTIONS.map((section) => (
              <div key={section}>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{section}</p>
                <ul className="mt-3 space-y-1">
                  {docsBySection(section).map((page) => {
                    const active = slug === page.slug;
                    return (
                      <li key={page.slug || "index"}>
                        {page.slug ? (
                          <Link
                            to="/docs/$slug"
                            params={{ slug: page.slug }}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm transition-colors",
                              active ? "bg-accent-soft font-medium text-accent" : "text-ink-muted hover:bg-canvas-muted hover:text-ink",
                            )}
                          >
                            {page.title}
                          </Link>
                        ) : (
                          <Link
                            to="/docs"
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm transition-colors",
                              active ? "bg-accent-soft font-medium text-accent" : "text-ink-muted hover:bg-canvas-muted hover:text-ink",
                            )}
                          >
                            {page.title}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
        <article className="min-w-0">
          <Outlet />
        </article>
      </div>
    </MarketingShell>
  );
}

export function DocsHomePage() {
  return (
    <div className="prose-site">
      <h1 className="font-serif text-4xl tracking-tight">Documentation</h1>
      <p className="mt-4 text-lg text-ink-muted">
        Everything you need to install, run, and extend KINKEEPER Guardian Mesh.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {DOC_PAGES.filter((p) => p.slug).slice(0, 6).map((page) => (
          <Link
            key={page.slug}
            to="/docs/$slug"
            params={{ slug: page.slug }}
            className="rounded-2xl border border-ink/10 bg-white/70 p-5 shadow-soft transition-shadow hover:shadow-card"
          >
            <p className="font-serif text-xl">{page.title}</p>
            <p className="mt-2 text-sm text-ink-muted">{page.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
