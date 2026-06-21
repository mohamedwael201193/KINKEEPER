import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { DOC_PAGES, DOC_SECTIONS, docsBySection } from "@/site/content/docs-tree";
import { MarketingShell } from "@/site/layout/marketing-shell";
import { SeoHead } from "@/site/components/seo-head";
import { DocsContentTransition } from "@/features/motion/motion-system";
import { cn } from "@/lib/utils";

function DocsSidebarLink({ slug, title, active }: { slug: string; title: string; active: boolean }) {
  const linkProps = {
    resetScroll: false as const,
    className: cn(
      "relative block rounded-lg px-3 py-2 text-sm transition-colors duration-200",
      active ? "font-medium text-accent" : "text-ink-muted hover:text-ink",
    ),
  };

  const inner = (
    <>
      {active ? (
        <motion.span
          layoutId="docs-active-pill"
          className="absolute inset-0 rounded-lg bg-accent-soft"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      ) : null}
      <span className="relative z-10">{title}</span>
    </>
  );

  if (slug) {
    return (
      <Link to="/docs/$slug" params={{ slug }} {...linkProps}>
        {inner}
      </Link>
    );
  }

  return (
    <Link to="/docs" {...linkProps}>
      {inner}
    </Link>
  );
}

export function DocsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const slug = pathname.replace(/^\/docs\/?/, "") || "";

  return (
    <MarketingShell>
      <SeoHead title="Documentation" path="/docs" description="Guardian Mesh documentation — installation, architecture, and developer guides." />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[260px_1fr] md:px-8 md:py-16">
          <aside className="hidden md:block">
            <nav className="sticky top-28 space-y-8">
              {DOC_SECTIONS.map((section) => (
                <div key={section}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">{section}</p>
                  <ul className="mt-3 space-y-0.5">
                    {docsBySection(section).map((page) => (
                      <li key={page.slug || "index"}>
                        <DocsSidebarLink slug={page.slug} title={page.title} active={slug === page.slug} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
          <article className="min-w-0 rounded-2xl border border-ink/8 bg-white/50 p-6 shadow-soft backdrop-blur-sm md:p-10">
            <DocsContentTransition slug={slug}>
              <Outlet />
            </DocsContentTransition>
          </article>
        </div>
      </div>
    </MarketingShell>
  );
}

export function DocsHomePage() {
  return (
    <div>
      <h1 className="font-serif text-4xl tracking-tight md:text-5xl">Documentation</h1>
      <p className="mt-4 text-lg text-ink-muted">
        Everything you need to install, run, and extend KINKEEPER Guardian Mesh.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {DOC_PAGES.filter((p) => p.slug).slice(0, 6).map((page, i) => (
          <motion.div
            key={page.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <Link
              to="/docs/$slug"
              params={{ slug: page.slug }}
              resetScroll={false}
              className="group block rounded-2xl border border-ink/10 bg-white/70 p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-accent/25 hover:shadow-card"
            >
              <p className="font-serif text-xl transition-colors group-hover:text-accent">{page.title}</p>
              <p className="mt-2 text-sm text-ink-muted">{page.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
