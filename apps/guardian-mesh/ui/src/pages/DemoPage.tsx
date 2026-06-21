import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Loader2, ArrowRight } from "lucide-react";
import { api, verdictColor } from "@/lib/api";
import type { GuardianIncidentResult, Scenario } from "@/lib/types";
import { PremiumAnalysisResult } from "@/components/PremiumAnalysisResult";
import { PipelineProgress } from "@/components/PipelineProgress";
import { usePipelineAnalysis } from "@/lib/usePipelineAnalysis";
import { cn } from "@/lib/cn";
import { DemoFlowNav } from "@/components/DemoFlowNav";

export function DemoPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoSteps, setDemoSteps] = useState<{ id: string; label: string; result: GuardianIncidentResult }[]>([]);
  const [providerKey, setProviderKey] = useState<string | null>(null);
  const { steps, running, error, result, analyzeScenario, reset } = usePipelineAnalysis(api.uploadAudio);

  useEffect(() => {
    api.scenarios().then((r) => setScenarios(r.scenarios)).catch(console.error);
    api.status().then((s) => setProviderKey(s.providerPublicKey)).catch(console.error);
  }, []);

  const runScenario = async (id: string) => {
    setRunningId(id);
    setDemoSteps([]);
    await analyzeScenario(() => api.runScenario(id));
    setRunningId(null);
  };

  const runJudgeDemo = async () => {
    setDemoRunning(true);
    reset();
    setDemoSteps([]);
    try {
      const res = await api.judgeDemo();
      setDemoSteps(res.steps.map((s) => ({ id: s.id, label: s.label, result: s.result })));
    } catch (e) {
      console.error(e);
    } finally {
      setDemoRunning(false);
    }
  };

  const displayResult = result ?? demoSteps[demoSteps.length - 1]?.result ?? null;

  return (
    <div className="page-shell">
      <p className="section-eyebrow">Demo recording</p>
      <h1 className="page-title mt-2">Demo Center</h1>
      <p className="page-subtitle">
        One-click path for judges: Home → Demo → Scenario A → Result → Telegram → Evidence → Proof.
      </p>

      <div className="mt-8 glass-card p-6">
        <p className="text-sm font-medium text-white">Recommended demo flow</p>
        <p className="mt-2 text-sm text-steel">Scenario A (BLOCK) → Family Safety Center → Evidence → QVAC Proof</p>
        <button type="button" className="btn-primary mt-5" onClick={() => runScenario("A")} disabled={running || demoRunning}>
          {runningId === "A" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run Scenario A — IRS scam call
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <button type="button" className="btn-secondary mt-6" onClick={runJudgeDemo} disabled={demoRunning || running}>
        {demoRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        Full judge demo (A → B → G)
      </button>

      {error && <p className="mt-4 rounded-xl border border-block/30 bg-block/10 p-4 text-sm text-block">{error}</p>}

      {running && steps.length > 0 && <div className="mt-8"><PipelineProgress steps={steps} /></div>}

      {demoSteps.length > 0 && (
        <div className="mt-8 glass-card p-6">
          <p className="section-eyebrow">Multi-step demo</p>
          <div className="mt-4 space-y-2">
            {demoSteps.map((step) => (
              <div key={step.id} className="flex justify-between text-sm">
                <span className="text-steel-bright">{step.id} · {step.label}</span>
                <span className={cn("font-bold", verdictColor(step.result.risk.verdict))}>{step.result.risk.verdict}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="section-eyebrow mt-14">All scenarios</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((s) => (
          <motion.button
            key={s.id}
            type="button"
            whileHover={{ scale: 1.01 }}
            disabled={!!runningId || demoRunning}
            onClick={() => runScenario(s.id)}
            className="glass-card-hover p-5 text-left disabled:opacity-50"
          >
            <div className="flex justify-between">
              <span className="font-mono text-lg font-bold text-accent-soft">{s.id}</span>
              <span className={cn("text-xs font-semibold", verdictColor(s.expectedVerdict))}>expect {s.expectedVerdict}</span>
            </div>
            <p className="mt-2 font-medium text-white">{s.name}</p>
            <p className="mt-1 text-xs text-steel line-clamp-2">{s.description}</p>
          </motion.button>
        ))}
      </div>

      {displayResult && (
        <div className="mt-14 space-y-8">
          <h2 className="section-title">Analysis result</h2>
          <PremiumAnalysisResult result={displayResult} providerKey={providerKey} />
          <DemoFlowNav incidentId={displayResult.incidentId} />
        </div>
      )}
    </div>
  );
}
