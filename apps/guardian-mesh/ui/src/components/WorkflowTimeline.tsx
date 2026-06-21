import { motion } from "framer-motion";
import { WORKFLOW_STEPS } from "@/lib/content";

export function WorkflowTimeline() {
  return (
    <div className="relative mt-10">
      <div className="absolute left-[19px] top-4 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-accent/50 via-accent/20 to-transparent md:block" />
      <div className="space-y-4">
        {WORKFLOW_STEPS.map((t, i) => (
          <motion.div
            key={t.step}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="glass-card-hover relative flex gap-5 p-5 md:ml-10"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-mono text-sm font-semibold text-accent-soft">
              {t.step}
            </div>
            <div>
              <p className="font-medium text-white">{t.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-steel">{t.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
