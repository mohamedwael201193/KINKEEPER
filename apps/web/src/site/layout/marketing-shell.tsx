import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { MarketingFooter } from "@/site/components/marketing-footer";
import { MarketingNav } from "@/site/components/marketing-nav";
import { PageTransition, ScrollProgress, SiteShell } from "@/features/motion/motion-system";

function topLevelRoute(pathname: string) {
  if (pathname.startsWith("/docs")) return "docs";
  if (pathname.startsWith("/install")) return "install";
  if (pathname.startsWith("/architecture")) return "architecture";
  if (pathname.startsWith("/demo")) return "demo";
  if (pathname.startsWith("/security")) return "security";
  if (pathname.startsWith("/download")) return "download";
  if (pathname.startsWith("/faq")) return "faq";
  return "home";
}

export function MarketingShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const routeKey = topLevelRoute(pathname);
  const isDocs = routeKey === "docs";

  return (
    <SiteShell>
      <ScrollProgress />
      <MarketingNav />
      <main>
        {isDocs ? children : <PageTransition routeKey={routeKey}>{children}</PageTransition>}
      </main>
      <MarketingFooter />
    </SiteShell>
  );
}
