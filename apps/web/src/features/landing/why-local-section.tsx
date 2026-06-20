import {
  Brain,
  Gauge,
  Lock,
  Mic,
  Network,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Stagger, StaggerItem } from "@/features/motion/motion-system";
import { LandingSection, SectionEyebrow, SectionLead, SectionTitle } from "./section-primitives";

const LOCAL_AI_PILLARS = [
  {
    icon: Mic,
    title: "Whisper",
    body: "On-device transcription keeps call audio in your home. No cloud upload required for scam detection.",
  },
  {
    icon: Sparkles,
    title: "Qwen",
    body: "Sentinel runs Qwen3 locally through QVAC — classifying scam patterns with cited red flags and confidence scores.",
  },
  {
    icon: Brain,
    title: "MedPsy",
    body: "Cognoscente uses MedPsy for clinical-grade cognitive check-ins — word-finding latency, drift, and baselines.",
  },
  {
    icon: Network,
    title: "Delegation",
    body: "Mesh delegation lets cognition nodes share load while preserving family-controlled provider keys.",
  },
  {
    icon: Lock,
    title: "Privacy",
    body: "Inference logs, evidence bundles, and alerts stay on infrastructure you control — not a vendor black box.",
  },
  {
    icon: Gauge,
    title: "Speed",
    body: "Sub-second Whisper TTFT and hundreds of tokens per second on local GPU — responsive enough for live calls.",
  },
] as const;

export function WhyLocalSection() {
  return (
    <LandingSection id="why-local" withBg>
      <Stagger>
        <StaggerItem>
          <SectionEyebrow>Why local AI</SectionEyebrow>
          <SectionTitle>Trust is earned when data never leaves.</SectionTitle>
          <SectionLead>
            KINKEEPER is built for families who need protection without surrendering privacy — local models, verifiable
            chains, and autonomous caregiver workflows.
          </SectionLead>
        </StaggerItem>

        <StaggerItem>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LOCAL_AI_PILLARS.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="relative overflow-hidden bg-white/75">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-accent/15 bg-accent-soft text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-xl">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="mt-10 overflow-hidden rounded-2xl border border-ink/10 bg-white/60 p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Architecture</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-medium">
              {["Call audio", "Whisper", "Qwen / MedPsy", "Evidence chain", "Telegram", "Caregiver"].map(
                (node, index, arr) => (
                  <div key={node} className="flex items-center gap-3">
                    <span className="rounded-full border border-ink/10 bg-canvas px-4 py-2">{node}</span>
                    {index < arr.length - 1 ? (
                      <span className="hidden text-accent sm:inline" aria-hidden>
                        →
                      </span>
                    ) : null}
                  </div>
                ),
              )}
            </div>
          </div>
        </StaggerItem>
      </Stagger>
    </LandingSection>
  );
}
