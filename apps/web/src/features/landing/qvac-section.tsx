import type { ComponentType } from "react";
import { Cpu, Zap } from "lucide-react";
import { DataProof } from "@/components/data-proof";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/states";
import { Stagger, StaggerItem } from "@/features/motion/motion-system";
import { truncateHash, type QvacRuntimeProof } from "./proof-helpers";
import { LandingSection, SectionEyebrow, SectionLead, SectionTitle } from "./section-primitives";

function findStep(proof: QvacRuntimeProof, name: string) {
  return proof.steps.find((step) => step.name === name);
}

function formatTtft(ms: number | undefined): string {
  if (ms === undefined) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms.toFixed(0)}ms`;
}

function formatTps(tps: number | undefined): string {
  if (tps === undefined) return "—";
  return tps.toFixed(1);
}

interface QvacSectionProps {
  qvacRuntime: QvacRuntimeProof | null;
  isLoading: boolean;
}

export function QvacSection({ qvacRuntime, isLoading }: QvacSectionProps) {
  const qwenStep = qvacRuntime ? findStep(qvacRuntime, "qwen3_completion") : null;
  const whisperStep = qvacRuntime ? findStep(qvacRuntime, "whisper_transcribe") : null;
  const medpsyStep = qvacRuntime ? findStep(qvacRuntime, "medpsy_completion") : null;

  const qwenDetails = qwenStep?.details;
  const whisperDetails = whisperStep?.details;
  const medpsyDetails = medpsyStep?.details;

  const qwenTtft = typeof qwenDetails?.ttftMs === "number" ? qwenDetails.ttftMs : undefined;
  const qwenTps = typeof qwenDetails?.tps === "number" ? qwenDetails.tps : undefined;
  const whisperTtft =
    typeof whisperDetails?.ttftMs === "number"
      ? whisperDetails.ttftMs
      : typeof whisperStep?.durationMs === "number"
        ? whisperStep.durationMs
        : undefined;
  const medpsyTtft = typeof medpsyDetails?.ttftMs === "number" ? medpsyDetails.ttftMs : undefined;
  const medpsyTps = typeof medpsyDetails?.tps === "number" ? medpsyDetails.tps : undefined;

  return (
    <LandingSection id="qvac" withBg>
      <Stagger>
        <StaggerItem>
          <SectionEyebrow>QVAC runtime</SectionEyebrow>
          <SectionTitle>Private by architecture, measured by proof.</SectionTitle>
          <SectionLead>
            Qwen, MedPsy, and Whisper run on your cognition node. TTFT, TPS, SDK version, and provider keys are
            verified from runtime evidence — because trust requires proof.
          </SectionLead>
        </StaggerItem>

        <StaggerItem>
          {isLoading ? (
            <Skeleton className="mt-12 h-72" />
          ) : qvacRuntime ? (
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              <RuntimeCard
                icon={Zap}
                title="Qwen3 completion"
                ttft={formatTtft(qwenTtft)}
                tps={formatTps(qwenTps)}
                model={String(qwenDetails?.modelSrc ?? "QWEN3_600M_INST_Q4")}
                ok={qwenStep?.ok ?? false}
              />
              <RuntimeCard
                icon={Cpu}
                title="MedPsy completion"
                ttft={formatTtft(medpsyTtft)}
                tps={formatTps(medpsyTps)}
                model="MedPsy 1.7B"
                ok={medpsyStep?.ok ?? false}
              />
              <RuntimeCard
                icon={Zap}
                title="Whisper transcribe"
                ttft={formatTtft(whisperTtft)}
                tps="—"
                model={String(whisperDetails?.modelSrc ?? "WHISPER_TINY")}
                ok={whisperStep?.ok ?? false}
              />
            </div>
          ) : (
            <Card className="mt-12">
              <CardContent className="p-8 text-sm text-ink-muted">QVAC runtime proof data unavailable.</CardContent>
            </Card>
          )}
        </StaggerItem>

        {qvacRuntime ? (
          <StaggerItem>
            <Card className="mt-4 bg-white/80">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline">SDK {qvacRuntime.sdkVersion}</Badge>
                  <Badge variant="success">All steps verified</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-ink/8 bg-canvas/70 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-wider text-ink-faint">Provider public key</p>
                    <p className="mt-1 break-all font-mono text-xs text-ink">{qvacRuntime.providerPublicKey}</p>
                    <p className="mt-1 font-mono text-xs text-accent">
                      {truncateHash(qvacRuntime.providerPublicKey, 10, 8)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-ink/8 bg-canvas/70 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-wider text-ink-faint">Verification steps</p>
                    <ul className="mt-2 space-y-1 text-sm text-ink-muted">
                      {qvacRuntime.steps.map((step) => (
                        <li key={step.name} className="flex items-center gap-2">
                          <span className={step.ok ? "text-trust-ok" : "text-trust-critical"}>
                            {step.ok ? "✓" : "✗"}
                          </span>
                          {step.name.replace(/_/g, " ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <DataProof
                  endpoint="GET /public/proof → qvacRuntime"
                  value={`sdk ${qvacRuntime.sdkVersion} · key ${truncateHash(qvacRuntime.providerPublicKey)}`}
                />
              </CardContent>
            </Card>
          </StaggerItem>
        ) : null}
      </Stagger>
    </LandingSection>
  );
}

function RuntimeCard({
  icon: Icon,
  title,
  ttft,
  tps,
  model,
  ok,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  ttft: string;
  tps: string;
  model: string;
  ok: boolean;
}) {
  return (
    <Card className="bg-white/80">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <Icon className="h-5 w-5 text-accent" />
          <Badge variant={ok ? "success" : "critical"}>{ok ? "OK" : "Fail"}</Badge>
        </div>
        <p className="font-serif text-xl">{title}</p>
        <p className="text-xs text-ink-faint">{model}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-faint">TTFT</p>
            <p className="font-mono text-lg">{ttft}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-faint">TPS</p>
            <p className="font-mono text-lg">{tps}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
