import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Lock, Shield, Zap, Cpu, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/lib/api";
import type { ProofSnapshot } from "@/lib/types";

const MODEL_LABELS: Record<string, string> = {
  whisper: "Whisper STT",
  ocr: "Latin OCR",
  embeddings: "Embeddings",
  llm: "Qwen3 LLM",
  medPsy: "MedPsy escalation",
  tts: "TTS warnings",
};

export function ProofPage() {
  const [proof, setProof] = useState<ProofSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfiler, setShowProfiler] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const refresh = () => {
    setLoading(true);
    api.proof().then(setProof).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  if (!proof && loading) return <p className="p-10 text-center text-steel">Loading QVAC Proof Center…</p>;

  return (
    <div className="page-shell">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-eyebrow">Runtime verification</p>
          <h1 className="page-title mt-2">QVAC Proof Center</h1>
          <p className="page-subtitle">Local execution proof for judges — models, provider key, chain, firewall.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
          Refresh proof
        </button>
      </div>

      {proof && (
        <div className="mt-12 space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Lock, label: "Local execution", value: proof.localExecution ? "Verified" : "Remote", sub: "On-device inference" },
              { icon: Shield, label: "Evidence verification", value: proof.evidenceChain.valid ? "Chain valid" : "Invalid", sub: `${proof.evidenceChain.count} bundles` },
              { icon: Zap, label: "QVAC in-process", value: proof.qvacInProcess ? "Active" : "External", sub: "@qvac/sdk" },
              { icon: Cpu, label: "Profiler", value: proof.profilerSummary ? "Available" : "Idle", sub: "Verbose export" },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-6">
                <item.icon className="h-5 w-5 text-accent-soft" aria-hidden />
                <p className="metric-label mt-4">{item.label}</p>
                <p className="metric-value mt-2 text-2xl">{item.value}</p>
                <p className="mt-1 text-xs text-steel">{item.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="glass-card p-8">
            <p className="section-eyebrow">Provider public key</p>
            <p className="mt-4 break-all font-mono text-sm leading-relaxed text-steel-bright">{proof.providerPublicKey ?? "Not available"}</p>
          </div>

          <div>
            <p className="section-eyebrow">Models used</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(proof.models).map(([key, val], i) => (
                <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card-hover p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-accent-soft">{MODEL_LABELS[key] ?? key}</p>
                  <p className="mt-2 font-mono text-sm text-white">{val}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <p className="section-eyebrow">Capabilities & firewall</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {proof.capabilities.map((cap) => (
                <span key={cap} className="rounded-lg border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-soft">{cap}</span>
              ))}
            </div>
            <p className="mt-4 text-sm text-steel">
              Firewall: {proof.firewallAllowlist.length ? proof.firewallAllowlist.join(", ") : "Default local-only binding (127.0.0.1)"}
            </p>
          </div>

          {proof.profilerSummary && (
            <div className="glass-card overflow-hidden">
              <button type="button" className="flex w-full items-center justify-between p-6 text-left" onClick={() => setShowProfiler((v) => !v)}>
                <span className="section-eyebrow">Raw profiler output</span>
                {showProfiler ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showProfiler && (
                <pre className="max-h-96 overflow-auto border-t border-white/[0.06] p-6 font-mono text-[10px] text-steel-bright">{proof.profilerSummary}</pre>
              )}
            </div>
          )}

          <div className="glass-card overflow-hidden">
            <button type="button" className="flex w-full items-center justify-between p-6 text-left" onClick={() => setShowRaw((v) => !v)}>
              <span className="section-eyebrow">Raw JSON snapshot</span>
              {showRaw ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showRaw && (
              <pre className="max-h-96 overflow-auto border-t border-white/[0.06] p-6 font-mono text-[10px] text-steel-bright">{JSON.stringify(proof, null, 2)}</pre>
            )}
          </div>

          <p className="text-xs text-steel">Last verified: {new Date(proof.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
