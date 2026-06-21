import { Link, useRouterState } from "@tanstack/react-router";
import { Github, Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/content/guardian-mesh";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/docs", label: "Docs" },
  { to: "/architecture", label: "Architecture" },
  { to: "/demo", label: "Demo" },
  { to: "/qvac-proof", label: "QVAC Proof" },
  { to: "/download", label: "Download" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30">
            <Shield className="h-4 w-4" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold text-zinc-100">{SITE.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Local AI safety</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === item.to || pathname.startsWith(`${item.to}/`)
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm" className="text-zinc-300 hover:bg-white/10 hover:text-white">
            <a href={SITE.github} target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </Button>
          <Button asChild variant="accent" size="sm">
            <Link to="/download">Download</Link>
          </Button>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-zinc-300 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/5 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={SITE.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"
            >
              GitHub
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-lg text-zinc-100">{SITE.product}</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">{SITE.tagline}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="hover:text-zinc-100">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Judge console</p>
          <p className="mt-3 text-sm text-zinc-400">
            Local demo at{" "}
            <a href={SITE.judgeUrl} className="text-violet-300 hover:underline">
              {SITE.judgeUrl}
            </a>
          </p>
          <p className="mt-2 font-mono text-xs text-zinc-600">{SITE.judgeLauncher}</p>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-zinc-600">
        Apache-2.0 · QVAC local inference · Hash-linked evidence
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-white/5 bg-zinc-950/80">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 max-w-3xl font-serif text-4xl tracking-tight text-white md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">{description}</p>
      </div>
    </div>
  );
}

export function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">{children}</p>
  );
}

export function Callout({
  variant = "info",
  children,
  className,
}: {
  variant?: "info" | "warning" | "success";
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    info: "border-violet-500/30 bg-violet-500/10 text-violet-100",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-100",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
  }[variant];

  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm leading-relaxed", styles, className)}>{children}</div>
  );
}
