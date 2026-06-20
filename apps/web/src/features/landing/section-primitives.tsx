import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs uppercase tracking-[0.18em] text-accent">{children}</p>;
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("mt-3 max-w-2xl font-serif text-4xl leading-tight md:text-5xl", className)}>{children}</h2>;
}

export function SectionLead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted", className)}>{children}</p>;
}

export function BgRhythm({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-x-0 -z-10 overflow-hidden opacity-40", className)} aria-hidden>
      <img src="/bgsection.svg" alt="" className="mx-auto h-auto w-full max-w-6xl object-cover" />
    </div>
  );
}

export function LandingSection({
  id,
  children,
  className,
  withBg = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  withBg?: boolean;
}) {
  return (
    <section id={id} className={cn("relative px-4 py-20 md:px-8", className)}>
      {withBg ? <BgRhythm className="top-1/2 -translate-y-1/2" /> : null}
      <div className="relative mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
