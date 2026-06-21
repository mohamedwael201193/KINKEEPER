import { Link, useRouterState } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE_NAME } from "@/site/content/navigation";
import { cn } from "@/lib/utils";

export function MarketingNav() {
  const ref = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 80], [0.92, 0.98]);
  const bgColor = useTransform(navOpacity, (v) => `rgba(26, 26, 26, ${v})`);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <motion.header ref={ref} className="sticky top-0 z-40 px-4 pt-4">
      <motion.div
        style={{ backgroundColor: bgColor }}
        className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 px-4 py-2.5 text-canvas shadow-card backdrop-blur-xl"
      >
        <Link to="/" className="flex items-center gap-2 pl-2">
          <span className="font-serif text-lg tracking-tight">{SITE_NAME.split(" ")[0]}</span>
          <span className="hidden text-xs text-canvas/50 sm:inline">Guardian Mesh</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.to || pathname.startsWith(`${link.to}/`);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 transition-colors",
                  active ? "text-canvas" : "text-canvas/70 hover:text-canvas",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden text-canvas hover:bg-white/10 sm:inline-flex">
            <Link to="/docs">Docs</Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="bg-canvas text-ink hover:bg-canvas/90">
            <Link to="/download">Download</Link>
          </Button>
        </div>
      </motion.div>
    </motion.header>
  );
}
