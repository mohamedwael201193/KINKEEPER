import { MarketingShell } from "@/site/layout/marketing-shell";
import { SeoHead } from "@/site/components/seo-head";
import { SectionShell } from "@/site/components/section-shell";

const SECURITY_LAYERS = [
  { title: "Localhost binding", detail: "Guardian Mesh demo server runs at 127.0.0.1:8787 — no remote LLM in core path." },
  { title: "Prompt injection sanitizer", detail: "Strips adversarial phrases from OCR/transcript before LLM prompts." },
  { title: "Deterministic rules", detail: "BLOCK/WARN floors independent of LLM output — mergeVerdict() enforces ceilings." },
  { title: "Content delimiters", detail: "Untrusted user content wrapped in <<<UNTRUSTED_USER_CONTENT>>> markers." },
  { title: "Evidence chain", detail: "SHA-256 linked bundles; verifyChain() detects tampering." },
  { title: "Provider verification", detail: "QVAC public key exposed in Proof Center for runtime attestation." },
  { title: "Firewall allowlist", detail: "Optional GUARDIAN_FIREWALL_ALLOWLIST for QVAC provider keys." },
] as const;

const PRIVACY_POINTS = [
  "Voice and document analysis runs on-device via QVAC.",
  "Family RAG documents stay in local HyperDB storage.",
  "Telegram sends summary alerts only when configured — not required.",
  "First-run model download is the primary network dependency.",
  "Legacy cloud API (apps/api) is separate and not required for Guardian Mesh.",
] as const;

export default function SecurityPage() {
  return (
    <MarketingShell>
      <SeoHead title="Security & Privacy" path="/security" />
      <SectionShell eyebrow="Trust center" title="Security & privacy" description="Defense in depth for a local family safety product.">
        <h3 className="mb-6 font-serif text-2xl">Security layers</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {SECURITY_LAYERS.map((layer) => (
            <div key={layer.title} className="rounded-xl border border-ink/10 bg-white/70 p-5 shadow-soft">
              <p className="font-medium text-ink">{layer.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{layer.detail}</p>
            </div>
          ))}
        </div>

        <h3 className="mb-6 mt-16 font-serif text-2xl">Privacy principles</h3>
        <ul className="space-y-3">
          {PRIVACY_POINTS.map((point) => (
            <li key={point} className="flex gap-3 text-ink-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-xl border border-ink/10 bg-canvas-muted/50 p-6 text-sm text-ink-muted">
          <strong className="text-ink">Scope note:</strong> Guardian Mesh is not a hardware security module, not formally
          verified like a wallet signing firewall, and not third-party penetration tested. Automated unit tests cover
          prompt injection and evidence chain integrity.
        </div>
      </SectionShell>
    </MarketingShell>
  );
}
