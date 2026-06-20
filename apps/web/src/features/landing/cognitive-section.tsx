import { useState } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { DataProof } from "@/components/data-proof";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/states";
import { Stagger, StaggerItem } from "@/features/motion/motion-system";
import { formatMedPsyModel, type CognoscenteProof } from "./proof-helpers";
import { LandingSection, SectionEyebrow, SectionLead, SectionTitle } from "./section-primitives";

function formatMetricLabel(metric: string): string {
  return metric.replace(/_/g, " ");
}

interface CognitiveSectionProps {
  cognoscente: CognoscenteProof | null;
  isLoading: boolean;
}

export function CognitiveSection({ cognoscente, isLoading }: CognitiveSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trends = cognoscente?.trends ?? [];
  const activeTrend = trends[activeIndex] ?? trends[0];
  const medPsyModel = formatMedPsyModel(cognoscente?.bundle.reasoning.modelSrc);

  return (
    <LandingSection id="cognoscente" withBg>
      <Stagger>
        <StaggerItem>
          <SectionEyebrow>Cognitive decline</SectionEyebrow>
          <SectionTitle>Cognoscente tracks subtle drift over time.</SectionTitle>
          <SectionLead>
            MedPsy-powered check-ins measure word-finding latency, semantic drift, and composite deviation against
            rolling baselines — surfacing signals caregivers can act on.
          </SectionLead>
        </StaggerItem>

        <StaggerItem>
          {isLoading ? (
            <Skeleton className="mt-12 h-80" />
          ) : cognoscente ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <Card className="bg-white/80">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-serif text-xl">Check-in metrics</p>
                      <p className="text-sm text-ink-muted">{medPsyModel}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MetricTile
                      label="Word-finding latency"
                      value={`${cognoscente.checkIn.wordFindingLatencySec}s`}
                    />
                    <MetricTile
                      label="Composite deviation"
                      value={cognoscente.checkIn.compositeDeviation.toFixed(2)}
                    />
                    <MetricTile
                      label="Classification"
                      value={cognoscente.bundle.reasoning.classification ?? "within_range"}
                    />
                    <MetricTile
                      label="Alert triggered"
                      value={cognoscente.checkIn.alertTriggered ? "Yes" : "No"}
                    />
                  </div>

                  <div className="rounded-xl bg-canvas/80 p-4 text-sm leading-relaxed text-ink-muted">
                    &ldquo;{cognoscente.checkIn.transcript}&rdquo;
                  </div>

                  <DataProof
                    endpoint="GET /public/proof → cognoscente"
                    value={`latency ${cognoscente.checkIn.wordFindingLatencySec}s · deviation ${cognoscente.checkIn.compositeDeviation}`}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white/80">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-center justify-between">
                    <p className="font-serif text-xl">Baseline timeline</p>
                    <Badge variant={cognoscente.checkIn.alertTriggered ? "warning" : "success"}>
                      {cognoscente.checkIn.alertTriggered ? "Watch" : "Stable"}
                    </Badge>
                  </div>

                  {trends.length > 0 ? (
                    <>
                      <div className="relative pl-6">
                        <div className="absolute bottom-2 left-[11px] top-2 w-px bg-accent/30" />
                        {trends.map((trend, index) => {
                          const isActive = index === activeIndex;
                          return (
                            <button
                              key={trend.date}
                              type="button"
                              onClick={() => setActiveIndex(index)}
                              className="relative mb-4 flex w-full items-start gap-4 text-left last:mb-0"
                            >
                              <motion.span
                                animate={{ scale: isActive ? 1.2 : 1 }}
                                className={`relative z-10 mt-1 h-3 w-3 rounded-full border-2 ${
                                  isActive ? "border-accent bg-accent" : "border-ink/20 bg-white"
                                }`}
                              />
                              <div className={`flex-1 rounded-xl border p-3 transition-colors ${isActive ? "border-accent/30 bg-accent-soft/40" : "border-ink/8 bg-canvas/50"}`}>
                                <p className="text-xs text-ink-faint">
                                  {new Date(trend.date).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                                <p className="mt-1 text-sm">
                                  Latency {trend.wordFindingLatencySec}s · Deviation{" "}
                                  {trend.compositeDeviation.toFixed(2)}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {activeTrend ? (
                        <motion.div
                          key={activeTrend.date}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border border-ink/8 bg-canvas/60 p-4 text-sm text-ink-muted"
                        >
                          Selected check-in: word-finding {activeTrend.wordFindingLatencySec}s, composite deviation{" "}
                          {activeTrend.compositeDeviation.toFixed(2)}.
                        </motion.div>
                      ) : null}
                    </>
                  ) : null}

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-ink-faint">Rolling baselines</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {cognoscente.baselines.map((baseline) => (
                        <div
                          key={baseline.metric}
                          className="rounded-lg border border-ink/8 bg-white/70 px-3 py-2 text-xs"
                        >
                          <p className="capitalize text-ink-faint">{formatMetricLabel(baseline.metric)}</p>
                          <p className="mt-1 font-mono text-sm text-ink">
                            {baseline.baselineValue}
                            <span className="text-ink-faint"> · n={baseline.sampleCount}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="mt-12">
              <CardContent className="p-8 text-sm text-ink-muted">
                Cognoscente proof data unavailable.
              </CardContent>
            </Card>
          )}
        </StaggerItem>
      </Stagger>
    </LandingSection>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink/8 bg-canvas/70 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="mt-1 font-mono text-lg text-ink">{value}</p>
    </div>
  );
}
