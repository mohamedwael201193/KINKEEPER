import { motion } from "framer-motion";
import type { GuardianIncidentResult } from "@/lib/types";
import { formatDuration, totalLatency, verdictBg, verdictColor } from "@/lib/api";
import { VerdictHero } from "./VerdictCard";
import { DemoFlowNav } from "./DemoFlowNav";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function PremiumAnalysisResult({
  result,
  providerKey,
  showDemoFlow = true,
}: {
  result: GuardianIncidentResult;
  providerKey?: string | null;
  showDemoFlow?: boolean;
}) {
  const [showProfiler, setShowProfiler] = useState(false);
  const duration = totalLatency(result.stages);
  const threatLevel =
    result.risk.verdict === "BLOCK" ? "Critical" : result.risk.verdict === "WARN" ? "Elevated" : "Low";

  return (
    <div className="space-y-8">
      <VerdictHero result={result} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Confidence score", value: `${Math.round(result.risk.confidence * 100)}%` },
          { label: "Threat level", value: threatLevel },
          { label: "Processing time", value: formatDuration(duration) },
          { label: "Chain status", value: result.chainValid ? "Verified" : "Invalid" },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <p className="metric-label">{m.label}</p>
            <p className="metric-value mt-2 text-2xl">{m.value}</p>
          </motion.div>
        ))}
      </div>

      {result.risk.redFlags.length > 0 && (
        <div className="glass-card p-6">
          <p className="section-eyebrow">Detected scam signals</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.risk.redFlags.map((f) => (
              <span key={f} className={cnBadge(result.risk.verdict)}>
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {(result.transcript || result.extractedText) && (
        <div className="glass-card p-6">
          <p className="section-eyebrow">{result.transcript ? "Transcript" : "Extracted OCR text"}</p>
          <p className="mt-4 whitespace-pre-wrap font-mono text-sm leading-relaxed text-steel-bright">
            {result.transcript ?? result.extractedText}
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card p-6">
          <p className="section-eyebrow">Evidence</p>
          <dl className="mt-4 space-y-3 font-mono text-xs">
            <div><dt className="text-steel">Bundle hash</dt><dd className="mt-1 break-all text-steel-bright">{result.bundleHash}</dd></div>
            <div><dt className="text-steel">Previous hash</dt><dd className="mt-1 break-all text-steel-bright">{result.previousHash}</dd></div>
            {providerKey && (
              <div><dt className="text-steel">Provider key</dt><dd className="mt-1 break-all text-steel-bright">{providerKey}</dd></div>
            )}
          </dl>
        </div>
        <div className="glass-card p-6">
          <p className="section-eyebrow">Delivery status</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-steel">Telegram</dt><dd className="text-white">{result.telegramSent ? "Alert sent" : "Local only"}</dd></div>
            <div className="flex justify-between"><dt className="text-steel">QVAC model</dt><dd className="font-mono text-xs text-steel-bright">{result.risk.modelUsed}</dd></div>
            <div className="flex justify-between"><dt className="text-steel">Classification</dt><dd className="text-steel-bright">{result.risk.classification}</dd></div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={`/api/evidence/export/${result.incidentId}`} className="btn-secondary text-xs" download>
              <Download className="h-4 w-4" aria-hidden /> Export evidence
            </a>
            {result.ttsWarningPath && (
              <audio controls className="max-w-full" src={`/api/tts/${result.incidentId}`}>
                <track kind="captions" />
              </audio>
            )}
          </div>
        </div>
      </div>

      {result.profilerSummary && (
        <div className="glass-card overflow-hidden">
          <button
            type="button"
            className="flex w-full items-center justify-between p-6 text-left"
            onClick={() => setShowProfiler((v) => !v)}
          >
            <span className="section-eyebrow">QVAC profiler summary</span>
            {showProfiler ? <ChevronUp className="h-4 w-4 text-steel" /> : <ChevronDown className="h-4 w-4 text-steel" />}
          </button>
          {showProfiler && (
            <pre className="max-h-72 overflow-auto border-t border-white/[0.06] p-6 font-mono text-[10px] leading-relaxed text-steel-bright">
              {result.profilerSummary}
            </pre>
          )}
        </div>
      )}

      {showDemoFlow && <DemoFlowNav incidentId={result.incidentId} />}
    </div>
  );
}

function cnBadge(verdict: string) {
  return `rounded-lg border px-3 py-1.5 text-xs font-medium ${verdictBg(verdict)} ${verdictColor(verdict)}`;
}

export function StatCard({
  label,
  value,
  sub,
  delay = 0,
}: {
  label: string;
  value: string | number;
  sub?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card-hover p-6"
    >
      <p className="metric-label">{label}</p>
      <p className="metric-value mt-3">{value}</p>
      {sub && <p className="mt-2 text-xs text-steel">{sub}</p>}
    </motion.div>
  );
}
