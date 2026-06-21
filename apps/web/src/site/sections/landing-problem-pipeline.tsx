import { motion } from "framer-motion";
import { PROBLEMS } from "@/content/guardian-mesh";
import { GlassCard, SectionLabel } from "@/site/layout/site-layout";
import { Stagger, StaggerItem } from "@/features/motion/motion-system";

export function ProblemSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
      <SectionLabel>The problem</SectionLabel>
      <h2 className="mt-3 max-w-2xl font-serif text-3xl text-white md:text-4xl">
        Attack patterns generic filters miss
      </h2>
      <p className="mt-4 max-w-2xl text-zinc-400">
        Fraud targets isolation and urgency. Guardian Mesh is built for the moment a call or letter arrives —
        before panic becomes payment.
      </p>
      <Stagger className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PROBLEMS.map((item) => (
          <StaggerItem key={item.title}>
            <GlassCard className="h-full">
              <h3 className="font-medium text-zinc-100">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.body}</p>
            </GlassCard>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-y border-white/5 bg-zinc-900/20 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionLabel>How Guardian Mesh works</SectionLabel>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl text-white md:text-4xl">
          One local pipeline from input to caregiver alert
        </h2>

        <div className="mt-12 flex flex-col items-center gap-3 md:flex-row md:flex-wrap md:justify-center">
          {[
            "Audio / Image",
            "STT / OCR",
            "RAG",
            "Risk Analysis",
            "Evidence Chain",
            "Telegram Alert",
          ].map((stage, index, arr) => (
            <div key={stage} className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-5 py-4 text-center backdrop-blur-md"
              >
                <p className="text-sm font-medium text-violet-100">{stage}</p>
              </motion.div>
              {index < arr.length - 1 ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 + 0.04 }}
                  className="hidden text-violet-400 md:inline"
                >
                  ↓
                </motion.span>
              ) : null}
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-zinc-500">
          Implemented in <code className="text-zinc-300">packages/guardian-mesh/src/pipeline/guardian-mesh-engine.ts</code>.
          Every stage runs in-process via QVAC on localhost — not a remote API demo.
        </p>
      </div>
    </section>
  );
}
