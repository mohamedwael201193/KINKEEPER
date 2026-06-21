import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

function formatStatValue(value: string, v: number, prefix: string, suffix: string): string {
  if (value.includes("B")) return `${prefix}${v.toFixed(1)}${suffix}`;
  if (value.includes("K")) return `${Math.round(v)}${suffix}`;
  return `${prefix}${Math.round(v)}${suffix}`;
}

export function AnimatedStat({ value, label }: { value: string; label: string }) {
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
  const prefix = value.startsWith("$") ? "$" : "";
  const suffix = value.includes("B") ? "B+" : value.includes("K") ? "K+" : value.includes("%") ? "%" : "+";
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-10% 0px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = useState(() => formatStatValue(value, numeric, prefix, suffix));

  useEffect(() => {
    if (!inView) return;
    const format = (v: number) => formatStatValue(value, v, prefix, suffix);
    const unsub = spring.on("change", (v) => setDisplay(format(v)));
    motionVal.set(0);
    motionVal.set(numeric);
    return unsub;
  }, [inView, motionVal, numeric, prefix, spring, suffix, value]);

  return (
    <div ref={containerRef}>
      <motion.p className="font-serif text-4xl text-accent md:text-5xl" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
        {display}
      </motion.p>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{label}</p>
    </div>
  );
}

export function ThreatMarquee() {
  const items = ["Scam calls", "Fake invoices", "IRS impersonation", "Gift-card fraud", "Wire transfer scams", "Grandparent scams", "Tech support fraud"];
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-ink/10 bg-ink py-4 text-canvas">
      <motion.div
        className="flex w-max gap-12 whitespace-nowrap text-sm font-medium tracking-wide"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-12">
            <span>{item}</span>
            <span className="text-accent-muted">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
