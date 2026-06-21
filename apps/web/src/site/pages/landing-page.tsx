import { Link } from "@tanstack/react-router";
import {
  Bell,
  Brain,
  Eye,
  FileSearch,
  Link2,
  Mic,
  ScanText,
  Shield,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/features/motion/motion-system";
import { FRAUD_STATS, THREAT_CATEGORIES } from "@/site/content/fraud-stats";
import { CapabilityCard, VerdictFlowDemo } from "@/site/components/interactive-cards";
import {
  EvidenceTimeline,
  PipelineStepsVisual,
  TelegramFlowVisual,
} from "@/site/components/landing-visuals";
import { MeshHeroBackground } from "@/site/components/mesh-hero-background";
import { JsonLd, SeoHead } from "@/site/components/seo-head";
import { SectionShell } from "@/site/components/section-shell";
import { MarketingShell } from "@/site/layout/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";

const CAPABILITIES = [
  {
    icon: Mic,
    title: "Audio intelligence",
    description: "Whisper Tiny transcribes scam calls locally — no audio leaves the device.",
  },
  {
    icon: ScanText,
    title: "OCR intelligence",
    description: "Latin OCR reads fake invoices and official-looking letters from images.",
  },
  {
    icon: Brain,
    title: "Family knowledge layer",
    description: "Embeddings search seeded safety notes at decision time via HyperDB RAG.",
  },
  {
    icon: Link2,
    title: "Evidence chain",
    description: "SHA-256 linked bundles provide tamper-evident incident history.",
  },
  {
    icon: Shield,
    title: "Risk engine",
    description: "Deterministic rules merge with Qwen3 and MedPsy for ALLOW/WARN/BLOCK.",
  },
  {
    icon: Bell,
    title: "Telegram alerts",
    description: "Optional caregiver notifications with one-tap acknowledge.",
  },
  {
    icon: Eye,
    title: "Privacy protection",
    description: "Core inference binds to localhost — family data stays under family control.",
  },
  {
    icon: Sparkles,
    title: "QVAC inference",
    description: "STT, OCR, embeddings, LLM, TTS, and profiler run in-process via @qvac/sdk.",
  },
] as const;

const QVAC_STACK = [
  { name: "Speech-to-Text", detail: "WHISPER_TINY — local transcription of call audio." },
  { name: "OCR", detail: "OCR_LATIN_RECOGNIZER_1 — document text extraction." },
  { name: "RAG", detail: "HyperDB ingest/search over family safety documents." },
  { name: "Embeddings", detail: "GTE_LARGE_FP16 — semantic retrieval for context." },
  { name: "LLMs", detail: "QWEN3_600M_INST_Q4 — primary risk classification." },
  { name: "MedPsy", detail: "1.7B escalation when fast LLM returns UNCERTAIN." },
  { name: "TTS", detail: "TTS_EN_SUPERTONIC_Q8_0 — spoken WARN/BLOCK warnings." },
  { name: "Profiler", detail: "Verbose profiler export for runtime proof." },
  { name: "Provider verification", detail: "Public key exposed at /api/proof on the local server." },
] as const;

const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "KINKEEPER Guardian Mesh",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Windows, macOS, Linux",
  description: "Local AI fraud detection for families.",
};

export default function LandingPage() {
  return (
    <MarketingShell>
      <SeoHead path="/" />
      <JsonLd data={HOME_JSON_LD} />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-10 md:px-8 md:pb-28 md:pt-16">
        <MeshHeroBackground />
        <div className="relative mx-auto max-w-6xl">
          <Stagger>
            <StaggerItem>
              <Badge className="mb-6">Local AI · Family Safety</Badge>
              <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] tracking-tight md:text-7xl">
                Protect Families Before Money Is Lost
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
                KINKEEPER Guardian Mesh uses local AI to detect scam calls, fraudulent invoices, and social
                engineering attempts before they become financial losses.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/download">Download Guardian Mesh</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link to="/docs">Read Documentation</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/demo">See it in action</Link>
                </Button>
              </div>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      {/* Problem */}
      <SectionShell
        id="problem"
        eyebrow="The threat landscape"
        title="Fraud targets the people who can least afford it"
        description="Generic spam filters miss calm impersonators and document fraud. Families need analysis at the moment of decision."
      >
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {FRAUD_STATS.map((stat) => (
            <Card key={stat.label} className="border-ink/10 bg-white/80">
              <CardContent className="p-6">
                <p className="font-serif text-4xl text-accent">{stat.value}</p>
                <p className="mt-2 text-sm text-ink-muted">{stat.label}</p>
                <a
                  href={stat.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs text-ink-faint underline-offset-2 hover:text-accent hover:underline"
                >
                  Source: {stat.source}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {THREAT_CATEGORIES.map((cat) => (
            <Card key={cat.title} className="h-full border-ink/10 transition-shadow hover:shadow-soft">
              <CardContent className="p-6">
                <p className="font-serif text-xl">{cat.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{cat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      {/* How it works */}
      <SectionShell
        id="how-it-works"
        eyebrow="How it works"
        title="From suspicious input to family protection"
        description="Six stages. One local pipeline. No cloud LLM in the core path."
        className="bg-canvas-muted/30"
      >
        <PipelineStepsVisual />
      </SectionShell>

      {/* Capabilities */}
      <SectionShell
        id="capabilities"
        eyebrow="Capabilities"
        title="Enterprise-grade detection, built for households"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((cap, i) => (
            <CapabilityCard key={cap.title} {...cap} index={i} />
          ))}
        </div>
      </SectionShell>

      {/* Live product flow */}
      <SectionShell
        id="product-flow"
        eyebrow="Verdict tiers"
        title="Clear outcomes when every minute counts"
        description="Three deterministic tiers merged with local LLM analysis."
        className="bg-canvas-muted/30"
      >
        <VerdictFlowDemo />
      </SectionShell>

      {/* QVAC */}
      <SectionShell id="qvac" eyebrow="QVAC technology" title="Local inference stack" description="Real models. Real profiler output. Not a remote API wrapper.">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {QVAC_STACK.map((item) => (
            <div key={item.name} className="rounded-xl border border-ink/10 bg-white/70 p-5 shadow-soft">
              <p className="font-medium text-ink">{item.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* Privacy */}
      <SectionShell
        id="privacy"
        eyebrow="Privacy"
        title="Private by design"
        description="Everything runs locally. No cloud inference in the Guardian Mesh core path."
        dark
      >
        <div className="grid gap-6 md:grid-cols-2">
          {[
            "Voice recordings stay on the household machine.",
            "Medical and pharmacy language never becomes vendor training data.",
            "Family safety notes power RAG on-device.",
            "Invoices and letters are OCR'd without upload to a remote LLM.",
          ].map((line) => (
            <div key={line} className="rounded-xl border border-white/10 bg-white/5 p-5 text-canvas/85">
              {line}
            </div>
          ))}
        </div>
      </SectionShell>

      {/* Evidence */}
      <SectionShell
        id="evidence"
        eyebrow="Evidence chain"
        title="Proof caregivers can trust"
        description="Hash-linked bundles. Ordered verification. Incident tracking."
      >
        <EvidenceTimeline />
      </SectionShell>

      {/* Telegram */}
      <SectionShell
        id="telegram"
        eyebrow="Caregiver layer"
        title="Telegram alerts when you cannot be on every call"
        className="bg-canvas-muted/30"
      >
        <TelegramFlowVisual />
      </SectionShell>

      {/* CTA */}
      <SectionShell id="cta" title="Protect your family today" dark>
        <p className="-mt-8 max-w-xl text-lg text-canvas/70">
          Download Guardian Mesh, run the local pipeline, and give caregivers evidence-backed alerts.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary" className="bg-canvas text-ink">
            <Link to="/download">Download Guardian Mesh</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-canvas/30 text-canvas hover:bg-white/10">
            <Link to="/install">Installation guide</Link>
          </Button>
        </div>
      </SectionShell>
    </MarketingShell>
  );
}
