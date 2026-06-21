import { QVAC_CAPABILITIES } from "@/content/guardian-mesh";
import { CodeBlock } from "@/site/components/code-block";
import { Callout, GlassCard, PageHeader, SiteLayout } from "@/site/layout/site-layout";

export default function QvacProofPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="QVAC proof"
        title="Every inference step is local"
        description="No marketing fluff — each row maps to shipped code verified by guardian:verify and guardian:scenarios."
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <Callout variant="success">
          Provider public key exposed at <code>GET /api/proof</code> on the Judge Console when running locally.
          Run <code>npm run guardian:verify</code> to emit proof in evidence/guardian-mesh-verify.json.
        </Callout>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-zinc-500">
              <tr>
                <th className="px-4 py-3">Capability</th>
                <th className="px-4 py-3">QVAC model</th>
                <th className="px-4 py-3">Implementation</th>
                <th className="px-4 py-3">Verified by</th>
              </tr>
            </thead>
            <tbody>
              {QVAC_CAPABILITIES.map((cap) => (
                <tr key={cap.id} className="border-b border-white/5">
                  <td className="px-4 py-4 font-medium text-zinc-200">{cap.label}</td>
                  <td className="px-4 py-4 font-mono text-xs text-violet-200">{cap.model}</td>
                  <td className="px-4 py-4 font-mono text-xs text-zinc-500">{cap.implementation}</td>
                  <td className="px-4 py-4 text-zinc-400">{cap.verifiedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 font-serif text-2xl text-white">Without QVAC</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            "No local STT — scam calls cannot be transcribed on-device",
            "No local OCR — fake invoices stay unread",
            "No embeddings + RAG — family safety patterns not retrieved",
            "No local LLM + MedPsy — risk reasoning falls back to heuristics or cloud",
            "No local TTS — WARN/BLOCK lose spoken warnings",
            "No profiler / provider proof — judges cannot verify which stack ran",
          ].map((item) => (
            <GlassCard key={item} className="text-sm text-zinc-400">
              {item}
            </GlassCard>
          ))}
        </div>

        <h2 className="mt-12 font-serif text-2xl text-white">Proof commands</h2>
        <CodeBlock
          className="mt-4"
          code={`npm run guardian:verify
npm run guardian:scenarios
npm run guardian:telegram`}
        />

        <h2 className="mt-12 font-serif text-2xl text-white">Security layers</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            { title: "Prompt injection sanitizer", file: "content-sanitizer.ts" },
            { title: "Deterministic rules", file: "deterministic-rules.ts" },
            { title: "Verdict merge", file: "mergeVerdict() in risk-analyzer.ts" },
            { title: "Firewall allowlist", file: "GUARDIAN_FIREWALL_ALLOWLIST in config.ts" },
          ].map((item) => (
            <GlassCard key={item.title}>
              <p className="font-medium text-zinc-200">{item.title}</p>
              <p className="mt-1 font-mono text-xs text-zinc-500">{item.file}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
