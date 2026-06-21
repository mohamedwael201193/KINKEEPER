import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";

export const ease = [0.22, 1, 0.36, 1] as const;

/** Stable site shell — does NOT remount on route changes. */
export function SiteShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-canvas text-ink">{children}</div>;
}

/** Top-level page fade — use only for main route segments, not docs sub-nav. */
export function PageTransition({ routeKey, children }: { routeKey: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Docs content crossfade — sidebar stays mounted. */
export function DocsContentTransition({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={slug || "overview"}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.28, ease }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function RevealSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 28 },
        show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <motion.div
      style={{ scaleX }}
      className={`fixed left-0 top-0 z-50 h-[2px] origin-left bg-gradient-to-r from-accent via-accent-muted to-accent ${className ?? ""}`}
    />
  );
}

export function PipelineNode({
  label,
  active,
  done,
}: {
  label: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <motion.div
      layout
      animate={{
        scale: active ? 1.05 : 1,
        opacity: done || active ? 1 : 0.45,
      }}
      className={`rounded-2xl border px-4 py-3 text-center text-sm font-medium ${
        done
          ? "border-trust-ok/30 bg-trust-ok/10 text-trust-ok"
          : active
            ? "border-accent bg-accent-soft text-accent shadow-soft"
            : "border-ink/10 bg-white/60 text-ink-muted"
      }`}
    >
      {label}
    </motion.div>
  );
}

export function ChainLink({
  hash,
  previousHash,
  index,
  agent,
}: {
  hash: string;
  previousHash: string;
  index: number;
  agent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5, ease }}
      className="relative"
    >
      {index > 0 ? (
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.15 - 0.05, duration: 0.4 }}
          className="absolute -top-6 left-6 h-6 w-px origin-top bg-accent/40"
        />
      ) : null}
      <div className="flex gap-4 rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft backdrop-blur">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-canvas font-serif text-lg">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-accent">{agent}</p>
          <p className="mt-1 break-all font-mono text-xs text-ink">{hash}</p>
          <p className="mt-1 break-all font-mono text-[10px] text-ink-faint">prev {previousHash}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function TelegramFlyout({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="absolute bottom-6 right-6 max-w-sm rounded-2xl border border-ink/10 bg-white p-4 shadow-card"
        >
          <p className="text-xs font-medium text-accent">Telegram · Caregiver</p>
          <p className="mt-2 text-sm leading-relaxed text-ink">{message}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** @deprecated Use SiteShell + PageTransition instead */
export function PageShell({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
