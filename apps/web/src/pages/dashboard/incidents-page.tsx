import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { AudioUploadPanel, SuccessBanner } from "@/components/audio-upload-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { PageHeader } from "@/layouts/app-shell";
import { PageTransition } from "@/components/motion/primitives";
import { api } from "@/services/api-client";
import { formatDate, formatRelative, severityColor } from "@/lib/utils";
import { useState } from "react";

export function IncidentsPage() {
  const queryClient = useQueryClient();
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["alerts"],
    queryFn: api.listAlerts,
  });
  const eldersQuery = useQuery({ queryKey: ["elders"], queryFn: api.listElders });

  const uploadMutation = useMutation({
    mutationFn: ({ elderId, file }: { elderId: string; file: File }) =>
      api.uploadSentinelRecording(elderId, file),
    onSuccess: () => {
      setUploadSuccess("Audio uploaded. Sentinel is analyzing — a new alert will appear here in about a minute.");
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["timeline"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.resolveAlert(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  if (isLoading) {
    return (
      <PageTransition>
        <PageHeader title="Alerts" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <PageHeader title="Alerts" />
        <ErrorState message={error instanceof Error ? error.message : "Failed to load incidents"} retry={() => void refetch()} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageHeader
        title="Alerts"
        description="When a scam call or voice change is detected, it appears here with plain-English reasoning."
      />

      {uploadSuccess ? (
        <SuccessBanner message={uploadSuccess} onDismiss={() => setUploadSuccess(null)} />
      ) : null}

      {!data?.length ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test scam detection</CardTitle>
            </CardHeader>
            <CardContent>
              {eldersQuery.data?.[0] ? (
                <AudioUploadPanel
                  label="Upload a phone call recording"
                  description="Use a sample scam call MP3 or record a suspicious voicemail. Sentinel flags IRS, gift-card, and verification-code scams."
                  isUploading={uploadMutation.isPending}
                  onUpload={async (file) => {
                    await uploadMutation.mutateAsync({ elderId: eldersQuery.data![0]!.id, file });
                  }}
                />
              ) : (
                <EmptyState
                  title="Add an elder first"
                  description="We need to know who this recording is about."
                  action={
                    <Button asChild>
                      <Link to="/app/family">Go to family setup</Link>
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((alert) => (
            <Card key={alert.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={severityColor(alert.severity)}>{alert.severity}</Badge>
                    <Badge variant="outline">{alert.agent}</Badge>
                    {alert.resolved ? <Badge variant="success">Resolved</Badge> : null}
                  </div>
                  <Link to="/app/incidents/$incidentId" params={{ incidentId: alert.id }} className="mt-2 block">
                    <h2 className="font-serif text-xl hover:text-accent">{alert.title}</h2>
                  </Link>
                  <p className="mt-1 text-sm text-ink-muted">{alert.summary}</p>
                  <p className="mt-2 text-xs text-ink-faint">
                    {formatDate(alert.createdAt)} · {formatRelative(alert.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button asChild variant="secondary">
                    <Link to="/app/incidents/$incidentId" params={{ incidentId: alert.id }}>
                      View details
                    </Link>
                  </Button>
                  {!alert.resolved && alert.agent === "sentinel" ? (
                    <Button
                      variant="outline"
                      disabled={resolveMutation.isPending}
                      onClick={() => resolveMutation.mutate(alert.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Resolve
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
