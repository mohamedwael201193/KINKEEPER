import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { DataProof } from "@/components/data-proof";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/states";
import { Stagger, StaggerItem, TelegramFlyout } from "@/features/motion/motion-system";
import { truncateHash, type SentinelProof } from "./proof-helpers";
import { LandingSection, SectionEyebrow, SectionLead, SectionTitle } from "./section-primitives";

const WORKFLOW_STEPS = [
  "Incident detected",
  "Reasoning",
  "Packet",
  "Notify",
  "Ack",
  "Resolved",
] as const;

interface TelegramSectionProps {
  sentinel: SentinelProof | null;
  isLoading: boolean;
}

export function TelegramSection({ sentinel, isLoading }: TelegramSectionProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!sentinel) return;
    const timer = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % WORKFLOW_STEPS.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [sentinel]);

  const flyoutVisible = activeStep >= 3 && activeStep <= 4;
  const flyoutMessage = sentinel
    ? `🚨 ${sentinel.alert.title}\n\n${sentinel.alert.summary}\n\nChain ${truncateHash(sentinel.bundle.hash)} · Confidence ${(sentinel.bundle.reasoning.confidence * 100).toFixed(0)}%`
    : "";

  return (
    <LandingSection id="telegram" className="border-t border-ink/8 bg-white/30">
      <Stagger>
        <StaggerItem>
          <SectionEyebrow>Telegram autonomy</SectionEyebrow>
          <SectionTitle>Caregivers notified without opening a dashboard.</SectionTitle>
          <SectionLead>
            When risk is high, KINKEEPER autonomously packages reasoning, confidence, and chain hash — then delivers
            it to linked caregivers via Telegram.
          </SectionLead>
        </StaggerItem>

        <StaggerItem>
          {isLoading ? (
            <Skeleton className="mt-12 h-80" />
          ) : sentinel ? (
            <div className="relative mt-12">
              <Card className="overflow-hidden bg-white/80">
                <CardContent className="space-y-6 p-6 md:p-8">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-accent" />
                    <span>Autonomous workflow · {sentinel.alert.severity}</span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    {WORKFLOW_STEPS.map((step, index) => (
                      <motion.div
                        key={step}
                        animate={{
                          opacity: index <= activeStep ? 1 : 0.35,
                          y: index === activeStep ? -2 : 0,
                        }}
                        className={`rounded-xl border px-3 py-3 text-center text-xs font-medium ${
                          index === activeStep
                            ? "border-accent bg-accent-soft text-accent"
                            : index < activeStep
                              ? "border-trust-ok/30 bg-trust-ok/10 text-trust-ok"
                              : "border-ink/10 bg-canvas/60 text-ink-muted"
                        }`}
                      >
                        {step}
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="min-h-[8rem] rounded-2xl border border-ink/8 bg-canvas/70 p-5"
                  >
                    {activeStep === 0 ? (
                      <div>
                        <Badge variant="critical" className="mb-3">
                          {sentinel.recording.finalClassification}
                        </Badge>
                        <p className="font-medium">{sentinel.alert.title}</p>
                        <p className="mt-2 text-sm text-ink-muted">{sentinel.alert.type}</p>
                      </div>
                    ) : null}
                    {activeStep === 1 ? (
                      <p className="text-sm leading-relaxed text-ink-muted">{sentinel.alert.summary}</p>
                    ) : null}
                    {activeStep === 2 ? (
                      <div className="space-y-2 font-mono text-xs">
                        <p className="text-ink-faint">Evidence packet sealed</p>
                        <p className="break-all text-ink">{sentinel.bundle.hash}</p>
                      </div>
                    ) : null}
                    {activeStep === 3 ? (
                      <p className="text-sm text-ink-muted">
                        Telegram bot delivers alert with reasoning excerpt and chain hash to linked caregivers.
                      </p>
                    ) : null}
                    {activeStep === 4 ? (
                      <p className="text-sm text-ink-muted">
                        Caregiver acknowledges via inline action — incident stays auditable in the dashboard.
                      </p>
                    ) : null}
                    {activeStep === 5 ? (
                      <p className="text-sm text-trust-ok">
                        Incident archived with full decision bundle. Family retains exportable evidence.
                      </p>
                    ) : null}
                  </motion.div>

                  <DataProof
                    endpoint="GET /public/proof → sentinel.alert"
                    value={sentinel.alert.title}
                  />
                </CardContent>
              </Card>

              <TelegramFlyout message={flyoutMessage} visible={flyoutVisible} />
            </div>
          ) : (
            <Card className="mt-12">
              <CardContent className="p-8 text-sm text-ink-muted">
                Telegram workflow requires sentinel proof data.
              </CardContent>
            </Card>
          )}
        </StaggerItem>
      </Stagger>
    </LandingSection>
  );
}
