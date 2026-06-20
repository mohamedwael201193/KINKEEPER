import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { DataProof } from "@/components/data-proof";
import { DashboardGuide } from "@/components/dashboard-guide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { ease, PageShell, PipelineNode, Stagger, StaggerItem } from "@/features/motion/motion-system";
import { PageHeader } from "@/layouts/app-shell";
import { usePublicProof } from "@/hooks/use-public-proof";
import { OnboardingProgressWidget, NextStepBanner } from "@/components/onboarding-progress";
import { QuickActionsBar } from "@/components/quick-actions";
import { api, type TimelineStage, type TimelineSummaryItem } from "@/services/api-client";
import { cn, formatDate, formatRelative, severityColor, truncateHash } from "@/lib/utils";

const VERIFIED_SOURCE = "evidence/sentinel-e2e.json";

type SentinelProof = {
  recording?: {
    createdAt?: string;
    processedAt?: string;
    transcript?: string;
    finalClassification?: string;
  };
  alert?: {
    id?: string;
    title?: string;
    severity?: string;
    agent?: string;
    summary?: string;
    createdAt?: string;
    resolved?: boolean;
  };
  bundle?: {
    hash?: string;
    previousHash?: string;
    createdAt?: string;
    reasoning?: { classification?: string; confidence?: number };
  };
};

function buildVerifiedStages(proof: SentinelProof): TimelineStage[] {
  const recording = proof.recording;
  const alert = proof.alert;
  const bundle = proof.bundle;
  const transcript = recording?.transcript;

  return [
    {
      id: "audio_uploaded",
      label: "Audio Uploaded",
      status: recording ? "completed" : "skipped",
      timestamp: recording?.createdAt ?? null,
    },
    {
      id: "transcribed",
      label: "Transcribed",
      status: transcript ? "completed" : "pending",
      timestamp: recording?.processedAt ?? null,
      metadata: transcript ? { excerpt: transcript.slice(0, 120) } : undefined,
    },
    {
      id: "sentinel_analysis",
      label: "Sentinel Analysis",
      status: bundle ? "completed" : "pending",
      timestamp: bundle?.createdAt ?? null,
      metadata: bundle?.reasoning
        ? {
            classification: bundle.reasoning.classification,
            confidence: bundle.reasoning.confidence,
          }
        : undefined,
    },
    {
      id: "evidence_created",
      label: "Evidence Created",
      status: bundle?.hash ? "completed" : "pending",
      timestamp: bundle?.createdAt ?? null,
      metadata: bundle?.hash ? { hash: bundle.hash } : undefined,
    },
    {
      id: "telegram_sent",
      label: "Telegram Sent",
      status: "skipped",
      timestamp: null,
    },
    {
      id: "resolved",
      label: "Resolved",
      status: alert?.resolved ? "completed" : "pending",
      timestamp: null,
    },
  ];
}

function verifiedSummaryItem(proof: SentinelProof): TimelineSummaryItem | null {
  const alert = proof.alert;
  if (!alert?.id && !alert?.title) return null;
  return {
    alertId: alert.id ?? "verified-sentinel-e2e",
    title: alert.title ?? "Verified Sentinel E2E",
    severity: alert.severity ?? "critical",
    agent: alert.agent ?? "sentinel",
    resolved: Boolean(alert.resolved),
    createdAt: alert.createdAt ?? proof.recording?.createdAt ?? new Date().toISOString(),
    hasBundle: Boolean(proof.bundle?.hash),
    hasPacket: false,
    chainHash: proof.bundle?.hash ?? null,
  };
}

function StatCard({
  label,
  value,
  endpoint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  endpoint: string;
  tone?: "default" | "warn" | "ok";
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <p className="text-sm text-ink-muted">{label}</p>
        <p
          className={cn(
            "mt-2 font-serif text-4xl tracking-tight",
            tone === "warn" && "text-trust-warn",
            tone === "ok" && "text-trust-ok",
          )}
        >
          {value}
        </p>
        <DataProof endpoint={endpoint} value={value} />
      </CardContent>
    </Card>
  );
}

function TimelineStageRail({ stages, index }: { stages: TimelineStage[]; index: number }) {
  const completedCount = stages.filter((s) => s.status === "completed").length;
  const activeIndex = stages.findIndex((s) => s.status === "pending");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5, ease }}
      className="mt-4 overflow-x-auto pb-1"
    >
      <div className="flex min-w-max items-center gap-2">
        {stages.slice(0, 6).map((stage, stageIndex) => {
          const done = stage.status === "completed";
          const active = stage.status === "pending" && stageIndex === activeIndex;
          return (
            <div key={stage.id} className="flex items-center gap-2">
              <PipelineNode label={stage.label} done={done} active={active} />
              {stageIndex < Math.min(stages.length, 6) - 1 ? (
                <motion.div
                  className={cn("h-px w-4", done ? "bg-trust-ok/40" : "bg-ink/10")}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 + stageIndex * 0.04, duration: 0.35 }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-ink-faint">
        {completedCount}/{stages.length} stages complete
      </p>
    </motion.div>
  );
}

function TimelineAlertCard({
  item,
  stages,
  index,
  verified,
}: {
  item: TimelineSummaryItem;
  stages: TimelineStage[];
  index: number;
  verified?: boolean;
}) {
  return (
    <Card className="overflow-hidden border-ink/8 transition hover:border-accent/25 hover:shadow-card">
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={severityColor(item.severity)}>{item.severity}</Badge>
              <Badge variant="outline">{item.agent}</Badge>
              {verified ? (
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified runtime
                </Badge>
              ) : item.resolved ? (
                <Badge variant="success">Resolved</Badge>
              ) : (
                <Badge variant="warning">Open</Badge>
              )}
            </div>
            {!verified ? (
              <Link to="/app/incidents/$incidentId" params={{ incidentId: item.alertId }}>
                <h2 className="mt-3 font-serif text-2xl tracking-tight transition hover:text-accent">
                  {item.title}
                </h2>
              </Link>
            ) : (
              <h2 className="mt-3 font-serif text-2xl tracking-tight">{item.title}</h2>
            )}
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-muted">
              <span>{formatDate(item.createdAt)}</span>
              <span>{formatRelative(item.createdAt)}</span>
              {item.chainHash ? (
                <span className="font-mono">{truncateHash(item.chainHash, 16)}</span>
              ) : null}
            </div>
          </div>
          {!verified ? (
            <Button asChild variant="secondary" size="sm">
              <Link to="/app/incidents/$incidentId" params={{ incidentId: item.alertId }}>
                Open console
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="secondary" size="sm">
              <Link to="/app/evidence">
                View evidence
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>

        <TimelineStageRail stages={stages} index={index} />

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={item.hasBundle ? "success" : "outline"}>
            Evidence {item.hasBundle ? "chained" : "pending"}
          </Badge>
          <Badge variant={item.hasPacket ? "success" : "outline"}>
            Packet {item.hasPacket ? "ready" : "pending"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertTimelineStages({ alertId, index }: { alertId: string; index: number }) {
  const { data } = useQuery({
    queryKey: ["alert-timeline", alertId],
    queryFn: () => api.getAlertTimeline(alertId),
  });

  if (!data?.stages.length) return null;
  return <TimelineStageRail stages={data.stages} index={index} />;
}

export function TimelineHome() {
  const timelineQuery = useQuery({
    queryKey: ["timeline"],
    queryFn: api.getTimeline,
    refetchOnMount: "always",
  });
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: api.dashboard,
    refetchOnMount: "always",
  });
  const onboardingQuery = useQuery({ queryKey: ["onboarding"], queryFn: api.getOnboarding });
  const eldersQuery = useQuery({ queryKey: ["elders"], queryFn: api.listElders });
  const proofQuery = usePublicProof();

  const isLoading = timelineQuery.isLoading || dashboardQuery.isLoading;
  const error = timelineQuery.error ?? dashboardQuery.error;

  if (isLoading) {
    return (
      <PageShell>
        <PageHeader title="Family Safety Timeline" eyebrow="Workflow home" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="mt-6 h-96" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <PageHeader title="Family Safety Timeline" />
        <ErrorState
          message={error instanceof Error ? error.message : "Failed to load timeline"}
          retry={() => {
            void timelineQuery.refetch();
            void dashboardQuery.refetch();
          }}
        />
      </PageShell>
    );
  }

  const dashboard = dashboardQuery.data;
  const liveItems = timelineQuery.data ?? [];
  const onboarding = onboardingQuery.data;
  const onboardingComplete = (onboarding?.progress ?? 100) >= 100;
  const sentinelProof = proofQuery.data?.sentinel as SentinelProof | null | undefined;
  const useVerifiedFallback =
    liveItems.length === 0 &&
    onboardingComplete &&
    Boolean(sentinelProof?.alert || sentinelProof?.recording);
  const verifiedItem = useVerifiedFallback && sentinelProof ? verifiedSummaryItem(sentinelProof) : null;
  const verifiedStages =
    useVerifiedFallback && sentinelProof ? buildVerifiedStages(sentinelProof) : [];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Workflow home"
        title="Family Safety Timeline"
        description="Every alert your family receives — from phone call to Telegram ping — shown step by step."
        action={
          dashboard?.activeAlerts ? (
            <Button asChild variant="accent" size="sm">
              <Link to="/app/incidents">
                <AlertTriangle className="h-4 w-4" />
                {dashboard.activeAlerts} active
              </Link>
            </Button>
          ) : undefined
        }
      />

      <DashboardGuide />

      <OnboardingProgressWidget onboarding={onboarding} />
      <NextStepBanner onboarding={onboarding} />
      <QuickActionsBar
        hasElder={(eldersQuery.data?.length ?? 0) > 0}
        onboardingComplete={onboardingComplete}
      />

      {dashboard ? (
        <Stagger className="mb-8 grid gap-4 md:grid-cols-3">
          <StaggerItem>
            <StatCard
              label="Active alerts"
              value={dashboard.activeAlerts}
              endpoint="GET /families/current/dashboard → activeAlerts"
              tone={dashboard.activeAlerts > 0 ? "warn" : "default"}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Risk score"
              value={dashboard.riskScore}
              endpoint="GET /families/current/dashboard → riskScore"
              tone={dashboard.riskScore > 50 ? "warn" : "default"}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Chain length"
              value={dashboard.chainVerification.length}
              endpoint="GET /families/current/dashboard → chainVerification.length"
              tone={dashboard.chainVerification.valid ? "ok" : "warn"}
            />
          </StaggerItem>
        </Stagger>
      ) : null}

      {useVerifiedFallback ? (
        <div className="mb-6 rounded-2xl border border-trust-ok/20 bg-trust-ok/5 px-4 py-3">
          <p className="text-sm font-medium text-trust-ok">
            Verified runtime ({VERIFIED_SOURCE})
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Your family timeline is empty. Showing the verified E2E Sentinel pipeline from public
            proof — same data judges evaluate at hackathon runtime.
          </p>
          <DataProof endpoint="GET /public/proof → sentinel" value={VERIFIED_SOURCE} className="border-trust-ok/10" />
        </div>
      ) : null}

      {!liveItems.length && !useVerifiedFallback ? (
        <EmptyState
          title="No alerts yet"
          description="Upload a test phone recording to see how scam detection works, or finish family setup."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild variant="accent">
                <Link to="/app/family">Finish setup</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/app/incidents">Upload test audio</Link>
              </Button>
            </div>
          }
        />
      ) : null}

      {liveItems.length > 0 ? (
        <div className="space-y-5">
          {liveItems.map((item, index) => (
            <Card key={item.alertId} className="overflow-hidden">
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={severityColor(item.severity)}>{item.severity}</Badge>
                      <Badge variant="outline">{item.agent}</Badge>
                      {item.resolved ? (
                        <Badge variant="success">Resolved</Badge>
                      ) : (
                        <Badge variant="warning">Open</Badge>
                      )}
                    </div>
                    <Link to="/app/incidents/$incidentId" params={{ incidentId: item.alertId }}>
                      <h2 className="mt-3 font-serif text-2xl tracking-tight hover:text-accent">
                        {item.title}
                      </h2>
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-muted">
                      <span>{formatDate(item.createdAt)}</span>
                      <span>{formatRelative(item.createdAt)}</span>
                      {item.chainHash ? (
                        <span className="font-mono">{truncateHash(item.chainHash, 16)}</span>
                      ) : null}
                    </div>
                  </div>
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/app/incidents/$incidentId" params={{ incidentId: item.alertId }}>
                      Open console
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
                <AlertTimelineStages alertId={item.alertId} index={index} />
                <DataProof
                  endpoint={`GET /families/current/alerts/${item.alertId}/timeline`}
                  value={`${item.alertId.slice(-8)} · ${item.agent}`}
                  className="mt-4"
                />
              </CardContent>
            </Card>
          ))}
          <DataProof endpoint="GET /families/current/timeline" value={liveItems.length} />
        </div>
      ) : null}

      {verifiedItem && verifiedStages.length ? (
        <TimelineAlertCard
          item={verifiedItem}
          stages={verifiedStages}
          index={0}
          verified
        />
      ) : null}
    </PageShell>
  );
}
