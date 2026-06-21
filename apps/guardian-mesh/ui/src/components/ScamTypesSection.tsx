import { motion } from "framer-motion";
import { SCAM_TYPES } from "@/lib/content";

export function ScamTypesSection() {
  return (
    <section className="mt-24">
      <p className="section-eyebrow">Threat coverage</p>
      <h2 className="section-title mt-3">What We Protect Against</h2>
      <p className="page-subtitle mt-3">Guardian Mesh is trained on real scam patterns — not generic spam filters.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SCAM_TYPES.map((s, i) => (
          <motion.article
            key={s.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="glass-card-hover flex flex-col p-6"
          >
            <h3 className="text-lg font-medium text-white">{s.title}</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-steel">Attack pattern</p>
                <p className="mt-1 leading-relaxed text-steel-bright">{s.pattern}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-steel">Why dangerous</p>
                <p className="mt-1 leading-relaxed text-steel-bright">{s.danger}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-accent-soft">How we detect it</p>
                <p className="mt-1 leading-relaxed text-steel-bright">{s.detection}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
