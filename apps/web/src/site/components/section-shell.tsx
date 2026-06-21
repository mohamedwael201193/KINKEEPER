import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RevealSection } from "@/features/motion/motion-system";

export function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  dark,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24 overflow-hidden px-4 py-24 md:px-8 md:py-32",
        dark ? "bg-ink text-canvas" : "bg-canvas text-ink",
        className,
      )}
    >
      {dark ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(148,120,252,0.12),transparent_55%)]" />
      ) : null}
      <div className="relative mx-auto max-w-6xl">
        <RevealSection>
          {eyebrow ? (
            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.22em]", dark ? "text-accent-muted" : "text-accent")}>
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.08] tracking-tight md:text-6xl">{title}</h2>
          {description ? (
            <p className={cn("mt-5 max-w-2xl text-lg leading-relaxed md:text-xl", dark ? "text-canvas/70" : "text-ink-muted")}>
              {description}
            </p>
          ) : null}
        </RevealSection>
        <div className="mt-14">{children}</div>
      </div>
    </section>
  );
}
