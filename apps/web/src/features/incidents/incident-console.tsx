import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  FileCheck2,
  MessageCircle,
  Shield,
} from "lucide-react";
import { DataProof } from "@/components/data-proof";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { ChainLink, ease, PageShell, TelegramFlyout } from "@/features/motion/motion-system";
import { Breadcrumb, PageHeader } from "@/layouts/app-shell";
import { api, type AuditLogRecord } from "@/services/api-client";
import { cn, formatDate, formatRelative, severityColor, truncateHash } from "@/lib/utils";

function filterTelegramForAlert(logs: AuditLogRecord[] | undefined, alertId: string) {
  return (
    logs?.filter((log) => {
      if (log.entityId === alertId) return true;
      const meta = log.metadata as { alertId?: string } | null;
      return meta?.alertId === alertId;
    }) ?? []
  );
}

function AnimatedTimeline({
  stages,
}: {
  stages: Array<{
    id: string;
    label: string;
    status: "completed" | "pending" | "skipped";
    timestamp: string | null;
    metadata?: Record<string, unknown>;
  }>;
}) {
  return (
    <div className="relative">
      {stages.map((stage, index) => {
        const isLast = index === stages.length - 1;
        const statusStyles = {
          completed: "border-trust-ok bg-trust-ok text-white shadow-[0_0_0_4px_rgba(45,106,79,0.12)]",
          pending: "border-accent bg-accent text-white shadow-[0_0_0_4px_rgba(148,120,252,0.15)]",
          skipped: "border-ink/10 bg-canvas-muted text-ink-faint",
        }[stage.status];

        return (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07, duration: 0.45, ease }}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {!isLast ? (
              <motion.div
                className={cn(
                  "absolute left-[15px] top-8 w-px origin-top",
                  stage.status === "completed" ? "bg-trust-ok/50" : "bg-ink/10",
                )}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.07 + 0.1, duration: 0.4 }}
                style={{ height: "calc(100% - 8px)" }}
              />
            ) : null}
            <motion.div
              className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold", statusStyles)}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.07, type: "spring", stiffness: 320, damping: 22 }}
            >
              {stage.status === "completed" ? "✓" : index + 1}
            </motion.div>
            <div className="min-w-0 flex-1 rounded-xl border border-ink/8 bg-white/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{stage.label}</p>
                <Badge
                  variant={
                    stage.status === "completed"
                      ? "success"
                      : stage.status === "pending"
                        ? "warning"
                        : "outline"
                  }
                >
                  {stage.status}
                </Badge>
              </div>
              {stage.timestamp ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                  <Clock className="h-3 w-3" />
                  {formatDate(stage.timestamp)} · {formatRelative(stage.timestamp)}
                </p>
              ) : null}
              {stage.metadata?.excerpt ? (
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                  {String(stage.metadata.excerpt)}
                </p>
              ) : null}
              {stage.metadata?.hash ? (
                <p className="mt-2 font-mono text-[10px] text-ink-faint">
                  {truncateHash(String(stage.metadata.hash), 24)}
                </p>
              ) : null}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function AuditRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink/5 py-2.5 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-ink-faint">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export function IncidentConsole({ incidentId }: { incidentId: string }) {
  const queryClient = useQueryClient();

  const alertQuery = useQuery({
    queryKey: ["alert", incidentId],
    queryFn: () => api.getAlert(incidentId),
  });
  const timelineQuery = useQuery({
    queryKey: ["alert-timeline", incidentId],
    queryFn: () => api.getAlertTimeline(incidentId),
  });
  const packetQuery = useQuery({
    queryKey: ["evidence-packet", incidentId],
    queryFn: () => api.getEvidencePacket(incidentId),
    retry: false,
  });
  const telegramQuery = useQuery({
    queryKey: ["telegram-notifications"],
    queryFn: api.telegramNotifications,
  });

  const resolveMutation = useMutation({
    mutationFn: () => api.resolveAlert(incidentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alert", incidentId] });
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["timeline"] });
      void queryClient.invalidateQueries({ queryKey: ["alert-timeline", incidentId] });
    },
  });

  if (alertQuery.isLoading) {
    return (
      <PageShell>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-[520px]" />
      </PageShell>
    );
  }

  if (alertQuery.error || !alertQuery.data) {
    return (
      <PageShell>
        <ErrorState
          message={alertQuery.error instanceof Error ? alertQuery.error.message : "Incident not found"}
          retry={() => void alertQuery.refetch()}
        />
      </PageShell>
    );
  }

  const alert = alertQuery.data;
  const metadata = alert.metadata ?? {};
  const decisionAudit = metadata.decisionAudit as Record<string, unknown> | undefined;
  const reasoning = alert.bundle?.reasoning;
  const transcript =
    (alert.bundle?.inputs as { transcript?: string } | undefined)?.transcript ??
    (metadata.transcript as string | undefined) ??
    packetQuery.data?.transcript ??
    null;

  const evidenceRefs =
    (decisionAudit?.evidenceReferences as Array<{ type: string; excerpt?: string; ref: string }> | undefined) ??
    reasoning?.evidenceReferences ??
    [];

  const telegramLogs = filterTelegramForAlert(telegramQuery.data, incidentId);
  const latestTelegram = telegramLogs[telegramLogs.length - 1];
  const telegramMessage =
    (latestTelegram?.metadata as { message?: string; preview?: string } | null)?.message ??
    (latestTelegram?.metadata as { preview?: string } | null)?.preview ??
    latestTelegram?.action ??
    "";

  const bundleHash = alert.bundle?.hash ?? String(decisionAudit?.chainHash ?? packetQuery.data?.chainVerification.bundleHash ?? "—");
  const previousHash =
    alert.bundle?.previousHash ??
    String(decisionAudit?.previousChainHash ?? packetQuery.data?.chainVerification.previousHash ?? "—");

  const confidence =
    decisionAudit?.confidence != null
      ? Number(decisionAudit.confidence)
      : reasoning?.confidence ?? packetQuery.data?.decision.confidence;

  return (
    <PageShell>
      <Breadcrumb
        items={[
          { label: "Incidents", to: "/app/incidents" },
          { label: truncateHash(incidentId, 10) },
        ]}
      />

      <PageHeader
        eyebrow={`${alert.agent} · ${alert.type}`}
        title={alert.title}
        description={alert.summary}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={severityColor(alert.severity)}>{alert.severity}</Badge>
            {alert.resolved ? (
              <Badge variant="success">Resolved</Badge>
            ) : alert.agent === "sentinel" ? (
              <Button
                onClick={() => resolveMutation.mutate()}
                disabled={resolveMutation.isPending}
                size="sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                Resolve alert
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(280px,0.85fr)]">
        {/* Left — transcript, reasoning, red flags */}
        <div className="space-y-5">
          <Card className="border-ink/10">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                <h2 className="font-serif text-xl">Signal & reasoning</h2>
              </div>

              {transcript ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">Transcript</p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="mt-3 rounded-xl border border-ink/8 bg-canvas-muted/40 p-4"
                  >
                    <p className="font-mono text-sm leading-relaxed text-ink">{transcript}</p>
                  </motion.div>
                  <DataProof endpoint={`GET /families/current/alerts/${incidentId}`} value="transcript" />
                </div>
              ) : (
                <EmptyState title="No transcript" description="Transcript will appear after audio processing." />
              )}

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">Model reasoning</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {(decisionAudit?.reasoning as string | undefined) ??
                    reasoning?.thinkingText ??
                    alert.summary}
                </p>
              </div>

              {evidenceRefs.length ? (
                <div>
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="h-4 w-4 text-trust-warn" />
                    <p className="text-xs font-medium uppercase tracking-wider text-trust-warn">Red flags</p>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {evidenceRefs.map((ref, i) => (
                      <motion.li
                        key={`${ref.ref}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl border border-trust-warn/25 bg-trust-warn/5 px-4 py-3 text-sm"
                      >
                        <span className="font-medium capitalize">{ref.type.replace(/_/g, " ")}</span>
                        {ref.excerpt ? (
                          <span className="text-ink-muted"> — {ref.excerpt}</span>
                        ) : null}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Center — animated timeline */}
        <Card className="relative border-ink/10 xl:row-span-1">
          <CardContent className="p-6">
            <h2 className="font-serif text-xl">Safety pipeline</h2>
            <p className="mt-1 text-sm text-ink-muted">
              End-to-end stages for this incident — from capture to resolution.
            </p>
            <div className="mt-6">
              {timelineQuery.isLoading ? (
                <Skeleton className="h-64" />
              ) : timelineQuery.data?.stages.length ? (
                <>
                  <AnimatedTimeline stages={timelineQuery.data.stages} />
                  <DataProof
                    endpoint={`GET /families/current/alerts/${incidentId}/timeline`}
                    value={timelineQuery.data.stages.filter((s) => s.status === "completed").length}
                  />
                </>
              ) : (
                <ErrorState message="Timeline unavailable" retry={() => void timelineQuery.refetch()} />
              )}
            </div>
          </CardContent>
          <TelegramFlyout message={telegramMessage} visible={Boolean(telegramMessage && !alert.resolved)} />
        </Card>

        {/* Right rail — audit, chain, packet, telegram */}
        <div className="space-y-5">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-serif text-lg">Decision audit</h3>
              <dl className="mt-4">
                <AuditRow
                  label="Confidence"
                  value={confidence != null ? `${Math.round(confidence * 100)}%` : "—"}
                />
                <AuditRow
                  label="Classification"
                  value={String(
                    decisionAudit?.classification ??
                      reasoning?.classification ??
                      packetQuery.data?.decision.classification ??
                      "—",
                  )}
                />
                <AuditRow
                  label="Model"
                  value={String(
                    decisionAudit?.modelUsed ??
                      reasoning?.modelSrc ??
                      packetQuery.data?.decision.modelUsed ??
                      "—",
                  )}
                />
                <AuditRow
                  label="Latency"
                  value={
                    decisionAudit?.latencyMs != null
                      ? `${decisionAudit.latencyMs}ms`
                      : reasoning?.latencyMs != null
                        ? `${reasoning.latencyMs}ms`
                        : packetQuery.data?.decision.latencyMs != null
                          ? `${packetQuery.data.decision.latencyMs}ms`
                          : "—"
                  }
                />
                <AuditRow
                  label="Created"
                  value={formatRelative(alert.createdAt)}
                />
              </dl>
              <DataProof endpoint={`GET /families/current/alerts/${incidentId}`} value={alert.agent} />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <ChainLink
              hash={bundleHash}
              previousHash={previousHash}
              index={0}
              agent={alert.agent}
            />
            <DataProof
              endpoint={`GET /families/current/evidence/bundles/${alert.bundleId ?? "—"}`}
              value={truncateHash(String(bundleHash), 16)}
            />
          </div>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-accent" />
                <h3 className="font-serif text-lg">Evidence packet</h3>
              </div>
              {packetQuery.isLoading ? (
                <Skeleton className="mt-4 h-20" />
              ) : packetQuery.data ? (
                <div className="mt-4 space-y-3">
                  <Badge variant={packetQuery.data.chainVerification.chainValid ? "success" : "critical"}>
                    {packetQuery.data.chainVerification.chainValid ? "Chain verified" : "Invalid chain"}
                  </Badge>
                  <p className="text-xs text-ink-muted">
                    Generated {formatDate(packetQuery.data.timestamps.packetGeneratedAt)}
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/app/evidence">View all evidence</Link>
                  </Button>
                  <DataProof
                    endpoint={`GET /families/current/alerts/${incidentId}/evidence-packet`}
                    value={truncateHash(packetQuery.data.chainVerification.bundleHash, 14)}
                  />
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-muted">Evidence packet not yet available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-accent" />
                <h3 className="font-serif text-lg">Telegram audit</h3>
              </div>
              {telegramQuery.isLoading ? (
                <Skeleton className="mt-4 h-16" />
              ) : telegramLogs.length ? (
                <ul className="mt-4 space-y-2">
                  {telegramLogs.map((log) => (
                    <li
                      key={log.id}
                      className="rounded-lg border border-ink/8 bg-white/50 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{log.action}</span>
                        <span className="text-ink-faint">{formatRelative(log.createdAt)}</span>
                      </div>
                      {log.metadata ? (
                        <p className="mt-1 text-ink-muted">
                          {JSON.stringify(log.metadata).slice(0, 120)}
                          {JSON.stringify(log.metadata).length > 120 ? "…" : ""}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-ink-muted">No Telegram deliveries for this alert.</p>
              )}
              <DataProof endpoint="GET /telegram/notifications" value={telegramLogs.length} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
