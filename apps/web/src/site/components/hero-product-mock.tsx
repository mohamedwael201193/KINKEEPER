import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const SIGNALS = ["IRS gift-card demand detected", "Wire transfer invoice flagged", "Social Security impersonation", "Grandparent bail scam"];

export function HeroProductMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative perspective-[1200px]"
    >
      <div className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white/80 p-6 shadow-card backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-ink-faint">
          <Shield className="h-3.5 w-3.5 text-accent" />
          Guardian Mesh · Local analysis
        </div>
        <div className="mt-5 rounded-2xl border border-ink/10 bg-canvas-muted/50 p-4">
          <p className="text-sm text-ink-muted">Incoming call transcript</p>
          <p className="mt-2 font-serif text-lg leading-snug text-ink">
            &ldquo;This is the IRS. Your Social Security is suspended. Pay in gift cards today.&rdquo;
          </p>
        </div>
        <motion.div
          className="mt-4 flex items-center justify-between rounded-xl border border-trust-critical/30 bg-trust-critical/10 px-4 py-3"
          animate={{ boxShadow: ["0 0 0 rgba(155,44,44,0)", "0 0 24px rgba(155,44,44,0.15)", "0 0 0 rgba(155,44,44,0)"] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-trust-critical">Verdict</p>
            <p className="font-serif text-2xl text-trust-critical">BLOCK</p>
          </div>
          <p className="max-w-[140px] text-right text-xs text-ink-muted">Evidence bundle sealed · caregiver alerted</p>
        </motion.div>
        <div className="mt-4 space-y-2">
          {SIGNALS.map((signal, i) => (
            <motion.div
              key={signal}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.12 }}
              className="flex items-center gap-2 text-xs text-ink-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {signal}
            </motion.div>
          ))}
        </div>
      </div>
      <motion.div
        className="absolute -right-4 -top-4 rounded-2xl border border-accent/20 bg-accent-soft px-4 py-2 text-xs font-medium text-accent shadow-soft"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        100% local QVAC inference
      </motion.div>
    </motion.div>
  );
}
