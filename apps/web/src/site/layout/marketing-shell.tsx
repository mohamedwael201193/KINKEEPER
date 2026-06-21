import type { ReactNode } from "react";
import { MarketingFooter } from "@/site/components/marketing-footer";
import { MarketingNav } from "@/site/components/marketing-nav";
import { PageShell, ScrollProgress } from "@/features/motion/motion-system";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <PageShell>
      <div className="min-h-screen bg-canvas text-ink">
        <ScrollProgress />
        <MarketingNav />
        <main>{children}</main>
        <MarketingFooter />
      </div>
    </PageShell>
  );
}
