import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataProof } from "@/components/data-proof";
import { QvacSetupBanner } from "@/components/qvac-setup-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { PageHeader } from "@/layouts/app-shell";
import { PageShell } from "@/features/motion/motion-system";
import { usePublicProof, usePublicRuntime } from "@/hooks/use-public-proof";
import { api } from "@/services/api-client";
import { formatDate, truncateHash } from "@/lib/utils";

function formatModelLabel(modelSrc: string): string {
  if (!modelSrc.includes("/") && !modelSrc.includes("\\")) return modelSrc;
  const parts = modelSrc.replace(/\\/g, "/").split("/");
  const filename = parts[parts.length - 1] ?? modelSrc;
  if (/medpsy/i.test(filename)) return "MedPsy 1.7B";
  if (/qwen/i.test(filename)) return "Qwen3 600M";
  if (/whisper/i.test(filename)) return "Whisper Tiny";
  return filename;
}

export function QvacPage() {
  const familyQuery = useQuery({ queryKey: ["qvac-runtime"], queryFn: api.qvacRuntime });
  const proofQuery = usePublicProof();
  const runtimeQuery = usePublicRuntime();

  const isLoading = familyQuery.isLoading || proofQuery.isLoading;
  const error = familyQuery.error;

  if (isLoading) {
    return (
      <PageShell>
        <PageHeader title="AI engine" />
        <Skeleton className="h-96" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <PageHeader title="AI engine" />
        <ErrorState message={error.message} retry={() => void familyQuery.refetch()} />
      </PageShell>
    );
  }

  const data = familyQuery.data;
  const verified = proofQuery.data?.qvacRuntime as {
    sdkVersion?: string;
    providerPublicKey?: string;
    steps?: Array<{ name: string; ok: boolean; details?: Record<string, unknown> }>;
  } | null;

  const qwenStep = verified?.steps?.find((s) => s.name === "qwen3_completion");
  const medpsyStep = verified?.steps?.find((s) => s.name === "medpsy_completion");

  const useVerified = (data?.stats.totalInferences ?? 0) === 0 && verified;
  const providerKey =
    data?.providerPublicKey ?? runtimeQuery.data?.live?.providerPublicKey ?? verified?.providerPublicKey ?? null;

  const chartData = useVerified
    ? [
        { model: "QWEN3", count: 1 },
        { model: "MedPsy", count: 1 },
        { model: "Whisper", count: 1 },
      ]
    : Object.entries(data?.stats.modelUsage ?? {}).map(([model, count]) => ({ model, count }));

  return (
    <PageShell>
      <PageHeader
        title="AI engine"
        description="The local AI on your computer that listens to voice and detects scams — nothing is sent to the cloud."
        action={
          <Badge variant={runtimeQuery.data?.live?.status === "healthy" || useVerified ? "success" : "warning"}>
            {runtimeQuery.data?.live?.status === "healthy" ? "Node live" : useVerified ? "Verified runtime" : "Node offline"}
          </Badge>
        }
      />

      <QvacSetupBanner qvacStatus={runtimeQuery.data?.live?.status ?? "unhealthy"} />

      {useVerified ? (
        <Card className="mb-6 border-accent/20 bg-accent-soft/30">
          <CardContent className="p-5 text-sm text-ink-muted">
            Family inference logs empty — showing verified metrics from{" "}
            <code className="text-xs">evidence/qvac-runtime-verify.json</code> (npm run qvac:runtime).
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-ink-muted">Total inferences</p>
            <p className="mt-2 font-serif text-3xl">{useVerified ? verified?.steps?.length ?? 0 : data?.stats.totalInferences}</p>
            <DataProof endpoint={useVerified ? "GET /public/proof" : "GET /families/current/qvac/runtime"} value={useVerified ? "verified steps" : data?.stats.totalInferences} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-ink-muted">Qwen TTFT</p>
            <p className="mt-2 font-serif text-3xl">
              {useVerified
                ? `${((qwenStep?.details?.ttftMs as number) / 1000).toFixed(2)}s`
                : data?.stats.avgTtftSec != null
                  ? `${data.stats.avgTtftSec.toFixed(2)}s`
                  : "—"}
            </p>
            <DataProof endpoint="evidence/qvac-runtime-verify.json" value={qwenStep?.details?.tps ? `${Number(qwenStep.details.tps).toFixed(0)} TPS` : undefined} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-ink-muted">MedPsy TPS</p>
            <p className="mt-2 font-serif text-3xl">
              {useVerified && medpsyStep?.details?.tps
                ? Number(medpsyStep.details.tps).toFixed(0)
                : data?.stats.avgTps != null
                  ? data.stats.avgTps.toFixed(1)
                  : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-ink-muted">SDK</p>
            <p className="mt-2 font-serif text-3xl">{verified?.sdkVersion ?? "0.13.3"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Provider key</CardTitle>
            <CardDescription>QVAC mesh public key for delegation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="break-all font-mono text-xs text-ink">{providerKey ?? "Not available"}</p>
            <DataProof endpoint="GET /public/runtime" value={providerKey ? truncateHash(providerKey, 16) : null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model usage</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {chartData.length === 0 ? (
              <EmptyState title="No inference logs yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6E0DB" />
                  <XAxis dataKey="model" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#9478FC" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent inference logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!data?.recentLogs.length && !useVerified ? (
            <EmptyState title="No logs" />
          ) : useVerified ? (
            verified?.steps?.map((step) => (
              <div key={step.name} className="grid gap-2 rounded-xl border border-ink/8 p-4 md:grid-cols-4">
                <div>
                  <p className="text-sm font-medium">{step.name}</p>
                  <Badge variant={step.ok ? "success" : "critical"}>{step.ok ? "ok" : "fail"}</Badge>
                </div>
                <p className="text-xs text-ink-muted">{JSON.stringify(step.details ?? {}).slice(0, 80)}…</p>
              </div>
            ))
          ) : (
            data?.recentLogs.map((log) => (
              <div key={log.id} className="grid gap-2 rounded-xl border border-ink/8 p-4 md:grid-cols-4">
                <div>
                  <p className="text-sm font-medium">{log.operation}</p>
                  <p className="text-xs text-ink-muted">{formatModelLabel(log.modelSrc)}</p>
                </div>
                <p className="text-xs text-ink-muted">{formatDate(log.timestamp)}</p>
                <p className="text-xs">TTFT {log.ttftSec ?? "—"} · TPS {log.tps ?? "—"}</p>
                <p className="font-mono text-xs text-ink-faint">{log.bundleId ? truncateHash(log.bundleId, 12) : "—"}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

export function SystemHealthPage() {
  const healthQuery = useQuery({ queryKey: ["system-health"], queryFn: api.systemHealth });
  const publicHealthQuery = useQuery({ queryKey: ["health"], queryFn: api.health });

  if (healthQuery.isLoading) {
    return (
      <PageShell>
        <PageHeader title="Health" />
        <Skeleton className="h-64" />
      </PageShell>
    );
  }

  if (healthQuery.error) {
    return (
      <PageShell>
        <PageHeader title="Health" />
        <ErrorState message={healthQuery.error.message} retry={() => void healthQuery.refetch()} />
      </PageShell>
    );
  }

  const data = healthQuery.data;
  if (!data) return null;

  return (
    <PageShell>
      <PageHeader title="Health" description="Is everything running? Green means your family protection is online and ready." />

      <QvacSetupBanner qvacStatus={data.checks.qvacNode} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(data.checks).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="p-6">
              <p className="text-sm capitalize text-ink-muted">{key}</p>
              <Badge className="mt-3" variant={value.includes("healthy") || value === "enabled" || value === "configured" ? "success" : "warning"}>
                {value}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Family status</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Open alerts: {data.family.openAlerts}</p>
            <p>Evidence chain: {data.family.chainVerification.valid ? "valid" : "invalid"} ({data.family.chainVerification.length})</p>
            <p>Last evidence: {data.family.lastEvidenceAt ? formatDate(data.family.lastEvidenceAt) : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Agents</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.family.agents.map((agent) => (
              <div key={agent.name} className="flex items-center justify-between rounded-xl border border-ink/8 px-4 py-3">
                <span className="capitalize">{agent.name}</span>
                <Badge variant={agent.status === "active" ? "success" : "warning"}>{agent.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {publicHealthQuery.data ? (
        <Card className="mt-6">
          <CardHeader><CardTitle>API health</CardTitle></CardHeader>
          <CardContent className="text-sm text-ink-muted">
            Status {publicHealthQuery.data.status} · Version {publicHealthQuery.data.version} · Checked {formatDate(publicHealthQuery.data.timestamp)}
          </CardContent>
        </Card>
      ) : null}
    </PageShell>
  );
}

export function SettingsPage() {
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const familyQuery = useQuery({ queryKey: ["family"], queryFn: api.getFamily });

  return (
    <PageShell>
      <PageHeader title="Settings" description="Account and workspace preferences." />
      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <p className="text-sm text-ink-muted">Account</p>
            <p className="mt-1 font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-ink-muted">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-ink-muted">Role</p>
            <p className="mt-1 capitalize">{user?.role ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-ink-muted">Family</p>
            <p className="mt-1">{familyQuery.data?.name ?? "No family"}</p>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
