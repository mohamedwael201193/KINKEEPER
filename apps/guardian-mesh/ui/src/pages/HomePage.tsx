import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Play, Shield, Lock, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import type { AppStatus } from "@/lib/types";
import { StatCard } from "@/components/PremiumAnalysisResult";
import { WorkflowTimeline } from "@/components/WorkflowTimeline";
import { ScamTypesSection } from "@/components/ScamTypesSection";

export function HomePage() {
  const [status, setStatus] = useState<AppStatus | null>(null);

  useEffect(() => {
    api.status().then(setStatus).catch(console.error);
  }, []);

  return (
    <div className="page-shell">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-navy-card via-navy-light to-navy p-8 md:p-14"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" aria-hidden />
        <p className="section-eyebrow">KINKEEPER Guardian Mesh</p>
        <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
          Protect Your Family Before Scammers Do
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-steel-bright">
          Guardian Mesh uses fully local AI powered by QVAC to detect scam calls, fake invoices,
          impersonation attempts, and suspicious payment requests before money is lost.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/analyze/recording" className="btn-primary">
            <Mic className="h-4 w-4" aria-hidden />
            Analyze Recording
          </Link>
          <Link to="/demo" className="btn-secondary">
            <Play className="h-4 w-4" aria-hidden />
            View Live Demo
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-6 text-xs text-steel">
          <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" aria-hidden /> 100% local execution</span>
          <span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5" aria-hidden /> Evidence chain verified</span>
        </div>
      </motion.section>

      {status && (
        <section className="mt-20">
          <p className="section-eyebrow">Real impact</p>
          <h2 className="section-title mt-3">Protection Statistics</h2>
          <p className="page-subtitle mt-2">Live metrics from your local evidence chain — not estimates.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Scam calls detected" value={status.stats.scamCallsDetected} sub="Audio · BLOCK or WARN" delay={0} />
            <StatCard label="Fraud attempts blocked" value={status.stats.fraudAttemptsBlocked} sub="BLOCK verdicts" delay={0.05} />
            <StatCard label="Evidence packages generated" value={status.stats.evidencePackagesGenerated} sub="SHA-256 linked bundles" delay={0.1} />
            <StatCard
              label="Telegram alerts sent"
              value={status.stats.telegramConfigured ? status.stats.telegramAlertsSent : "—"}
              sub={status.stats.telegramConfigured ? "Threat notifications" : "Not configured"}
              delay={0.15}
            />
          </div>
        </section>
      )}

      <section className="mt-24">
        <p className="section-eyebrow">Product workflow</p>
        <h2 className="section-title mt-3">How Guardian Mesh Works</h2>
        <WorkflowTimeline />
      </section>

      <ScamTypesSection />

      <section className="mt-24 rounded-3xl border border-white/[0.08] bg-navy-card/50 p-8 text-center md:p-12">
        <h2 className="font-serif text-2xl text-white md:text-3xl">Ready to protect your family?</h2>
        <p className="mx-auto mt-3 max-w-lg text-steel">Run a live demo or upload a recording — every analysis uses the real QVAC pipeline.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/demo" className="btn-primary">
            Start demo flow
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link to="/analyze/recording" className="btn-secondary">Analyze recording</Link>
        </div>
      </section>
    </div>
  );
}
