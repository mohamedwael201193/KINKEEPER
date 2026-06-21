import { MarketingShell } from "@/site/layout/marketing-shell";
import { SeoHead } from "@/site/components/seo-head";
import { SectionShell } from "@/site/components/section-shell";

const FAQ_ITEMS = [
  {
    q: "Does Guardian Mesh send my data to the cloud?",
    a: "The core path in apps/guardian-mesh runs QVAC inference in-process on localhost. No cloud LLM API is called. Telegram optionally uses the Bot API when configured.",
  },
  {
    q: "What verdicts can it return?",
    a: "Three tiers: ALLOW, WARN, and BLOCK — merged from deterministic rules and local LLM output.",
  },
  {
    q: "Is Telegram required?",
    a: "No. Without TELEGRAM_BOT_TOKEN and chat ID, the pipeline completes locally and the telegram stage is skipped.",
  },
  {
    q: "What Node version is required?",
    a: "Node ≥ 22.17 and npm ≥ 10.9 per root package.json engines.",
  },
  {
    q: "Can it run offline?",
    a: "After QVAC models are cached, yes for the core pipeline. First download requires internet.",
  },
  {
    q: "What QVAC models are used?",
    a: "WHISPER_TINY, OCR_LATIN_RECOGNIZER_1, GTE_LARGE_FP16, QWEN3_600M_INST_Q4, MedPsy 1.7B (escalation), TTS_EN_SUPERTONIC_Q8_0.",
  },
  {
    q: "Are demo assets real recordings?",
    a: "No — synthetic assets from npm run guardian:assets. Inference on them is real QVAC.",
  },
  {
    q: "Windows only?",
    a: "Node server is cross-platform. Electron portable/installer builds are Windows-only today.",
  },
  {
    q: "How is evidence tampering detected?",
    a: "Each incident commits a SHA-256 bundle linked to the previous hash. verifyChain() validates ordering.",
  },
  {
    q: "Why Telegram error 409?",
    a: "Two processes polling the same bot token. Stop dev:api or cloud pollers before verify scripts.",
  },
] as const;

export default function FaqPage() {
  return (
    <MarketingShell>
      <SeoHead title="FAQ" path="/faq" />
      <SectionShell eyebrow="FAQ" title="Frequently asked questions">
        <div className="divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white/70">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="group px-6 py-5">
              <summary className="cursor-pointer list-none font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-accent transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </SectionShell>
    </MarketingShell>
  );
}
