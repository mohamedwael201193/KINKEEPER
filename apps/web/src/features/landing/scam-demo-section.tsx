import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Mic, ShieldAlert } from "lucide-react";
import { DataProof } from "@/components/data-proof";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/states";
import { Stagger, StaggerItem } from "@/features/motion/motion-system";
import {
  extractReasoningExcerpt,
  riskScoreFromConfidence,
  truncateHash,
  type SentinelProof,
} from "./proof-helpers";
import { LandingSection, SectionEyebrow, SectionLead, SectionTitle } from "./section-primitives";

const DEMO_STAGES = ["Transcript", "Classification", "Reasoning", "Evidence"] as const;

interface ScamDemoSectionProps {
  sentinel: SentinelProof | null;
  isLoading: boolean;
}

export function ScamDemoSection({ sentinel, isLoading }: ScamDemoSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!inView || !sentinel) return;
    const timer = window.setInterval(() => {
      setStage((prev) => (prev + 1) % DEMO_STAGES.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [inView, sentinel]);

  const riskScore = sentinel ? riskScoreFromConfidence(sentinel.bundle.reasoning.confidence) : null;
  const reasoningExcerpt = sentinel
    ? extractReasoningExcerpt(sentinel.bundle.reasoning.thinkingText)
    : "";

  return (
    <LandingSection id="sentinel" className="border-t border-ink/8 bg-white/30">
      <Stagger>
        <StaggerItem>
          <SectionEyebrow>Scam protection</SectionEyebrow>
          <SectionTitle>Sentinel catches fraud before money moves.</SectionTitle>
          <SectionLead>
            Verified end-to-end pipeline data from a real IRS impersonation call — transcript, confidence, reasoning,
            and bundle hash pulled live from the public proof API.
          </SectionLead>
        </StaggerItem>

        <StaggerItem>
          <div ref={ref} className="mt-12">
            {isLoading ? (
              <Skeleton className="h-[28rem]" />
            ) : sentinel ? (
              <Card className="overflow-hidden bg-white/80">
                <CardContent className="space-y-6 p-6 md:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mic className="h-4 w-4 text-accent" />
                      <span>Live simulation · {sentinel.alert.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="critical">{sentinel.recording.finalClassification}</Badge>
                      <div className="rounded-xl border border-trust-critical/20 bg-trust-critical/5 px-4 py-2 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-ink-faint">Risk score</p>
                        <p className="font-serif text-3xl text-trust-critical">{riskScore}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {DEMO_STAGES.map((label, index) => (
                      <motion.span
                        key={label}
                        animate={{
                          opacity: index === stage ? 1 : 0.45,
                          scale: index === stage ? 1 : 0.98,
                        }}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          index === stage
                            ? "bg-accent text-white"
                            : index < stage
                              ? "bg-trust-ok/10 text-trust-ok"
                              : "bg-canvas-muted text-ink-muted"
                        }`}
                      >
                        {label}
                      </motion.span>
                    ))}
                  </div>

                  <motion.div
                    key={stage}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="min-h-[10rem] rounded-2xl border border-ink/8 bg-canvas/80 p-5"
                  >
                    {stage === 0 ? (
                      <p className="text-sm leading-relaxed text-ink">&ldquo;{sentinel.recording.transcript}&rdquo;</p>
                    ) : null}
                    {stage === 1 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-5 w-5 text-trust-critical" />
                          <p className="font-medium">{sentinel.alert.title}</p>
                        </div>
                        <p className="text-sm text-ink-muted">
                          Confidence{" "}
                          <span className="font-mono text-ink">
                            {(sentinel.bundle.reasoning.confidence * 100).toFixed(0)}%
                          </span>{" "}
                          · Model {sentinel.bundle.reasoning.modelSrc ?? "QWEN3_600M_INST_Q4"}
                        </p>
                      </div>
                    ) : null}
                    {stage === 2 ? (
                      <p className="text-sm leading-relaxed text-ink-muted">{reasoningExcerpt}</p>
                    ) : null}
                    {stage === 3 ? (
                      <div className="space-y-2 font-mono text-xs">
                        <p className="text-ink-faint">Bundle hash</p>
                        <p className="break-all text-ink">{sentinel.bundle.hash}</p>
                        <p className="text-ink-faint">Short</p>
                        <p className="text-accent">{truncateHash(sentinel.bundle.hash)}</p>
                      </div>
                    ) : null}
                  </motion.div>

                  <DataProof
                    endpoint="GET /public/proof → sentinel"
                    value={`confidence ${sentinel.bundle.reasoning.confidence} · hash ${truncateHash(sentinel.bundle.hash)}`}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-sm text-ink-muted">
                  Proof data unavailable. Start the API with evidence files to populate this demo.
                </CardContent>
              </Card>
            )}
          </div>
        </StaggerItem>
      </Stagger>
    </LandingSection>
  );
}
