import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Shield, Link2, CheckCircle2 } from "lucide-react";
import { api, verdictColor } from "@/lib/api";
import type { IncidentSummary } from "@/lib/types";

export function EvidencePage() {
  const [params] = useSearchParams();
  const selectedId = params.get("id");
  const [items, setItems] = useState<IncidentSummary[]>([]);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [chain, setChain] = useState<{ valid: boolean; count: number } | null>(null);
  const [providerKey, setProviderKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.history().then((r) => setItems(r.items)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.evidence(selectedId).then((r) => {
      setDetail(r.packet);
      setChain(r.chain as { valid: boolean; count: number });
      setProviderKey(r.providerPublicKey);
    }).catch(console.error).finally(() => setLoading(false));
  }, [selectedId]);

  const risk = detail?.risk as Record<string, unknown> | undefined;
  const chainInfo = detail?.chainVerification as Record<string, unknown> | undefined;
  const timestamps = detail?.timestamps as Record<string, string> | undefined;
  const integrityScore = chain?.valid ? 100 : 0;

  return (
    <div className="page-shell">
      <p className="section-eyebrow">Forensic evidence</p>
      <h1 className="page-title mt-2">Evidence Center</h1>
      <p className="page-subtitle">Tamper-evident incident records with chain verification and export.</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <p className="metric-label">Incident timeline</p>
          <ul className="mt-4 max-h-[520px] space-y-2 overflow-y-auto">
            {items.map((item, i) => (
              <motion.li key={item.incidentId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                <Link
                  to={`/evidence?id=${item.incidentId}`}
                  className={`block rounded-xl border p-4 text-sm transition ${
                    selectedId === item.incidentId ? "border-accent/40 bg-accent/10" : "border-white/5 bg-navy-card hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${verdictColor(item.verdict)}`}>{item.verdict}</span>
                    <span className="text-[10px] text-steel">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-steel">{item.incidentId.slice(0, 16)}…</p>
                </Link>
              </motion.li>
            ))}
          </ul>
        </aside>

        <div className="lg:col-span-8">
          {!selectedId && (
            <div className="glass-card flex flex-col items-center p-16 text-center">
              <Shield className="h-14 w-14 text-accent-soft" aria-hidden />
              <p className="mt-4 text-steel-bright">Select an incident to inspect forensic evidence</p>
            </div>
          )}

          {selectedId && loading && <p className="text-steel">Loading evidence packet…</p>}

          {selectedId && detail && !loading && (
            <div className="space-y-6">
              <div className="glass-card p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="section-eyebrow">Incident record</p>
                    <p className="mt-2 font-mono text-sm text-white">{selectedId}</p>
                    <p className="mt-1 text-xs text-steel">{timestamps?.packetGeneratedAt ? new Date(timestamps.packetGeneratedAt).toLocaleString() : "—"}</p>
                  </div>
                  <span className={`text-3xl font-bold ${verdictColor(String(risk?.verdict ?? ""))}`}>{String(risk?.verdict ?? "—")}</span>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: "Incident type", value: String(detail.inputType ?? "—").toUpperCase() },
                    { label: "Risk score", value: `${Math.round(Number(risk?.confidence ?? 0) * 100)}%` },
                    { label: "Chain integrity", value: `${integrityScore}%` },
                    { label: "Verification", value: chain?.valid ? "Passed" : "Failed" },
                    { label: "Chain links", value: chain?.count ?? 0 },
                  ].map((f) => (
                    <div key={f.label} className="rounded-xl border border-white/5 bg-navy-hover/50 p-4">
                      <p className="text-xs text-steel">{f.label}</p>
                      <p className="mt-1 font-medium text-white">{f.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-white/5 bg-navy p-4">
                  <p className="flex items-center gap-2 text-xs text-steel"><Link2 className="h-3 w-3" /> Evidence hash</p>
                  <p className="mt-2 break-all font-mono text-xs text-steel-bright">{String(chainInfo?.bundleHash ?? "—")}</p>
                </div>

                {providerKey && (
                  <div className="mt-4 rounded-xl border border-white/5 bg-navy p-4">
                    <p className="text-xs text-steel">Provider proof</p>
                    <p className="mt-2 break-all font-mono text-[10px] text-steel-bright">{providerKey}</p>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={`/api/evidence/export/${selectedId}`} className="btn-primary text-sm" download>
                    <Download className="h-4 w-4" aria-hidden /> Export evidence JSON
                  </a>
                  {chain?.valid && (
                    <span className="inline-flex items-center gap-2 rounded-xl border border-allow/30 bg-allow/10 px-4 py-2 text-sm text-allow">
                      <CheckCircle2 className="h-4 w-4" /> Chain verified
                    </span>
                  )}
                </div>
              </div>

              {Boolean(detail.transcript || detail.extractedText) && (
                <div className="glass-card p-6">
                  <p className="section-eyebrow">Captured content</p>
                  <p className="mt-4 whitespace-pre-wrap font-mono text-sm leading-relaxed text-steel-bright">
                    {String(detail.transcript ?? detail.extractedText)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
