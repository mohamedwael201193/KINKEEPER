import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
        "scroll-mt-24 px-4 py-20 md:px-8 md:py-28",
        dark ? "bg-ink text-canvas" : "bg-canvas text-ink",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl">
        {eyebrow ? (
          <p className={cn("text-xs font-semibold uppercase tracking-[0.2em]", dark ? "text-accent-muted" : "text-accent")}>
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-3 max-w-3xl font-serif text-4xl tracking-tight md:text-5xl">{title}</h2>
        {description ? (
          <p className={cn("mt-4 max-w-2xl text-lg leading-relaxed", dark ? "text-canvas/70" : "text-ink-muted")}>
            {description}
          </p>
        ) : null}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
