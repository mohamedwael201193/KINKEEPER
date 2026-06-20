import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, FileStack } from "lucide-react";
import { FadeIn } from "@/components/motion/primitives";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { PageHeader } from "@/layouts/app-shell";
import { PageTransition } from "@/components/motion/primitives";
import { api } from "@/services/api-client";
import { cn, formatDate, formatRelative, severityColor, truncateHash } from "@/lib/utils";

function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warn" | "ok";
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-ink-muted">{label}</p>
        <p
          className={cn(
            "mt-2 font-serif text-4xl",
            tone === "warn" && "text-trust-warn",
            tone === "ok" && "text-trust-ok",
          )}
        >
          {value}
        </p>
        {hint ? <p className="mt-2 text-xs text-ink-faint">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function OverviewPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: api.dashboard,
  });

  if (isLoading) {
    return (
      <PageTransition>
        <PageHeader title="Overview" description="Live family safety status from your local AI pipeline." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <PageHeader title="Overview" />
        <ErrorState message={error instanceof Error ? error.message : "Failed to load dashboard"} retry={() => void refetch()} />
      </PageTransition>
    );
  }

  if (!data) return null;

  return (
    <PageTransition>
      <PageHeader
        title="Overview"
        description="Live family safety status from your local AI pipeline."
        action={
          data.chainVerification.valid ? (
            <Badge variant="success">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Chain verified · {data.chainVerification.length} bundles
            </Badge>
          ) : (
            <Badge variant="critical">Chain verification failed</Badge>
          )
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FadeIn>
          <StatCard label="Active alerts" value={data.activeAlerts} tone={data.activeAlerts > 0 ? "warn" : "default"} />
        </FadeIn>
        <FadeIn delay={0.05}>
          <StatCard label="Resolved alerts" value={data.resolvedAlerts} tone="ok" />
        </FadeIn>
        <FadeIn delay={0.1}>
          <StatCard label="Risk score" value={data.riskScore} hint="Based on open alert severity" tone={data.riskScore > 50 ? "warn" : "default"} />
        </FadeIn>
        <FadeIn delay={0.15}>
          <StatCard label="Evidence bundles" value={data.chainVerification.length} hint="Hash-chained decision records" />
        </FadeIn>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Recent incidents</CardTitle>
              <CardDescription>Latest alerts requiring caregiver attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentAlerts.length === 0 ? (
                <EmptyState title="No incidents yet" description="When Sentinel or Cognoscente detect risk, alerts appear here." />
              ) : (
                data.recentAlerts.map((alert) => (
                  <Link
                    key={alert.id}
                    to="/app/incidents/$incidentId"
                    params={{ incidentId: alert.id }}
                    className="flex items-start justify-between gap-4 rounded-xl border border-ink/8 bg-white/50 p-4 transition hover:border-accent/30 hover:bg-white"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={severityColor(alert.severity)}>{alert.severity}</Badge>
                        <span className="text-xs text-ink-faint">{alert.agent}</span>
                      </div>
                      <p className="mt-2 font-medium">{alert.title}</p>
                      <p className="mt-1 text-sm text-ink-muted">{formatRelative(alert.createdAt)}</p>
                    </div>
                    {!alert.resolved ? <AlertTriangle className="h-4 w-4 text-trust-warn" /> : null}
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle>Latest analyses</CardTitle>
              <CardDescription>Recent local QVAC agent decisions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentAnalyses.length === 0 ? (
                <EmptyState title="No analyses yet" description="Agent decisions will appear after audio is processed." />
              ) : (
                data.recentAnalyses.map((analysis) => (
                  <div key={analysis.bundleId} className="rounded-xl border border-ink/8 bg-white/50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">{analysis.agent}</Badge>
                      <span className="text-xs text-ink-faint">{formatDate(analysis.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm">{analysis.classification ?? analysis.trigger}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-muted">
                      {analysis.confidence != null ? <span>Confidence {Math.round(analysis.confidence * 100)}%</span> : null}
                      {analysis.modelSrc ? <span>{analysis.modelSrc}</span> : null}
                      {analysis.latencyMs != null ? <span>{analysis.latencyMs}ms</span> : null}
                    </div>
                    <p className="mt-2 font-mono text-xs text-ink-faint">{truncateHash(analysis.hash, 16)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.2} className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileStack className="h-5 w-5" />
              Recent evidence packets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentEvidencePackets.length === 0 ? (
              <EmptyState title="No evidence packets" description="Packets are generated automatically for high-risk alerts." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {data.recentEvidencePackets.map((packet) => (
                  <Link
                    key={packet.id}
                    to="/app/incidents/$incidentId"
                    params={{ incidentId: packet.alertId }}
                    className="rounded-xl border border-ink/8 p-4 hover:border-accent/30"
                  >
                    <p className="text-sm font-medium">Alert {packet.alertId.slice(-8)}</p>
                    <p className="mt-1 font-mono text-xs text-ink-faint">{truncateHash(packet.contentHash, 20)}</p>
                    <p className="mt-2 text-xs text-ink-muted">{formatDate(packet.createdAt)}</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </PageTransition>
  );
}
