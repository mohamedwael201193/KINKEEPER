import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChainLink } from "@/features/motion/motion-system";

const SAMPLE_CHAIN = [
  { agent: "STT", hash: "a4f1…3dfcc", previousHash: "genesis" },
  { agent: "RAG", hash: "8b2e…91a04", previousHash: "a4f1…3dfcc" },
  { agent: "Risk", hash: "c91d…7721b", previousHash: "8b2e…91a04" },
  { agent: "Archivist", hash: "f03a…558e2", previousHash: "c91d…7721b" },
];

export function EvidenceTimeline() {
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
      <div className="space-y-3">
        {["Incident captured", "Analysis complete", "Verdict sealed", "Chain verified"].map((step, i) => (
          <button
            key={step}
            type="button"
            onClick={() => setActive(i)}
            className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
              active === i
                ? "border-accent bg-accent-soft text-accent shadow-soft"
                : "border-ink/10 bg-white/70 text-ink-muted hover:border-ink/20"
            }`}
          >
            {step}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          className="space-y-6"
        >
          {SAMPLE_CHAIN.slice(0, active + 1).map((link, index) => (
            <ChainLink key={link.hash} {...link} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function TelegramFlowVisual() {
  const steps = [
    { title: "Threat detected", body: "Local pipeline returns BLOCK on IRS gift-card pattern." },
    { title: "Alert generated", body: "Evidence hash, verdict, and summary packaged for caregiver." },
    { title: "Caregiver notified", body: "Telegram message with context and action buttons." },
    { title: "Acknowledged", body: "Caregiver taps Acknowledge — incident marked received." },
  ];
  const [step, setStep] = useState(0);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <div className="space-y-2">
        {steps.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => setStep(i)}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left transition-all ${
              step === i ? "border-accent bg-white shadow-card" : "border-transparent hover:bg-white/60"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                step >= i ? "bg-accent text-white" : "bg-canvas-muted text-ink-faint"
              }`}
            >
              {i + 1}
            </span>
            <span className="font-medium text-ink">{s.title}</span>
          </button>
        ))}
      </div>
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[1.5rem] border border-ink/10 bg-ink p-6 text-canvas shadow-card"
      >
        <p className="text-xs uppercase tracking-wider text-accent-muted">Telegram · Guardian Mesh</p>
        <p className="mt-4 font-serif text-2xl">{steps[step].title}</p>
        <p className="mt-3 text-sm leading-relaxed text-canvas/75">{steps[step].body}</p>
        {step === 3 ? (
          <div className="mt-6 inline-flex rounded-full bg-trust-ok/20 px-4 py-2 text-sm text-trust-ok">
            ✓ Acknowledged
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

export function PipelineStepsVisual() {
  const steps = [
    { n: 1, title: "Audio or document", desc: "WAV call recording or PNG/JPEG letter enters the pipeline." },
    { n: 2, title: "Local AI analysis", desc: "QVAC Whisper or OCR extracts text on-device." },
    { n: 3, title: "Risk assessment", desc: "RAG + Qwen3 + MedPsy escalation merge to ALLOW/WARN/BLOCK." },
    { n: 4, title: "Evidence generation", desc: "SHA-256 linked bundle written by LocalArchivist." },
    { n: 5, title: "Caregiver notification", desc: "Optional Telegram alert with acknowledge callback." },
    { n: 6, title: "Family protection", desc: "Caregiver intervenes with hash-linked proof." },
  ];

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 hidden h-full w-px bg-accent/20 md:block" />
      <div className="space-y-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative flex gap-6 md:pl-12"
          >
            <div className="absolute left-3.5 hidden h-3 w-3 -translate-x-1/2 rounded-full bg-accent md:block" />
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink font-serif text-lg text-canvas">
              {step.n}
            </div>
            <div>
              <p className="font-serif text-xl text-ink">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
