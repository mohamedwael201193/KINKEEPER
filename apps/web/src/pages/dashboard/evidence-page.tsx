import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Download, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { PageHeader } from "@/layouts/app-shell";
import { PageTransition } from "@/components/motion/primitives";
import { api } from "@/services/api-client";
import { formatDate, truncateHash } from "@/lib/utils";

export function EvidencePage() {
  const chainQuery = useQuery({ queryKey: ["evidence-chain"], queryFn: api.verifyChain });
  const bundlesQuery = useQuery({ queryKey: ["bundles"], queryFn: api.listBundles });
  const packetsQuery = useQuery({ queryKey: ["evidence-packets"], queryFn: api.listEvidencePackets });

  const isLoading = chainQuery.isLoading || bundlesQuery.isLoading || packetsQuery.isLoading;
  const error = chainQuery.error ?? bundlesQuery.error ?? packetsQuery.error;

  if (isLoading) {
    return (
      <PageTransition>
        <PageHeader title="Evidence" />
        <Skeleton className="h-96" />
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <PageHeader title="Evidence" />
        <ErrorState
          message={error instanceof Error ? error.message : "Failed to load evidence"}
          retry={() => {
            void chainQuery.refetch();
            void bundlesQuery.refetch();
            void packetsQuery.refetch();
          }}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageHeader
        title="Evidence"
        description="Tamper-proof records of every AI decision — like a receipt for each alert."
        action={
          chainQuery.data?.valid ? (
            <Badge variant="success">Chain valid · {chainQuery.data.length} bundles</Badge>
          ) : (
            <Badge variant="critical">Chain invalid</Badge>
          )
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Decision bundles</CardTitle>
            <CardDescription>Hash-linked agent decisions</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[520px] space-y-3 overflow-auto">
            {!bundlesQuery.data?.length ? (
              <EmptyState
                title="No decision records yet"
                description="Run a baseline scan or upload a test call — evidence is created automatically."
                action={
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/app/family">Run baseline scan</Link>
                  </Button>
                }
              />
            ) : (
              bundlesQuery.data.map((bundle) => (
                <div key={bundle.id} className="rounded-xl border border-ink/8 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">{bundle.agent}</Badge>
                    <span className="text-xs text-ink-faint">{formatDate(bundle.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm">{bundle.trigger}</p>
                  <p className="mt-2 font-mono text-xs text-ink-faint">{truncateHash(bundle.hash, 24)}</p>
                  <p className="mt-1 font-mono text-xs text-ink-faint">prev {truncateHash(bundle.previousHash, 16)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence packets</CardTitle>
            <CardDescription>Caregiver-ready exports</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[520px] space-y-3 overflow-auto">
            {!packetsQuery.data?.length ? (
              <EmptyState
                title="No evidence packets yet"
                description="Packets are created when Sentinel flags a scam call."
                action={
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/app/incidents">Upload test audio</Link>
                  </Button>
                }
              />
            ) : (
              packetsQuery.data.map((packet) => (
                <div key={packet.id} className="rounded-xl border border-ink/8 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Alert {packet.alertId.slice(-8)}</p>
                      <p className="mt-1 font-mono text-xs text-ink-faint">{truncateHash(packet.contentHash, 24)}</p>
                      <p className="mt-2 text-xs text-ink-muted">{formatDate(packet.createdAt)}</p>
                    </div>
                    <Button asChild variant="secondary" size="sm">
                      <Link to="/app/incidents/$incidentId" params={{ incidentId: packet.alertId }}>
                        <Link2 className="h-4 w-4" />
                        Open
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Proof drawer
          </CardTitle>
          <CardDescription>Verification metadata for judges and caregivers</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 md:grid-cols-3">
            <div>
              <dt className="text-sm text-ink-muted">Chain length</dt>
              <dd className="mt-1 font-serif text-2xl">{chainQuery.data?.length ?? 0}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Verification</dt>
              <dd className="mt-1">{chainQuery.data?.valid ? "Valid" : "Broken"}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Broken at</dt>
              <dd className="mt-1 font-mono text-xs">{chainQuery.data?.brokenAt ?? "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
