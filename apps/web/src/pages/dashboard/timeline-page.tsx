import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { PageHeader } from "@/layouts/app-shell";
import { PageTransition } from "@/components/motion/primitives";
import { api } from "@/services/api-client";
import { formatDate, formatRelative, severityColor, truncateHash } from "@/lib/utils";

export function TimelinePage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["timeline"],
    queryFn: api.getTimeline,
  });

  if (isLoading) {
    return (
      <PageTransition>
        <PageHeader title="Family Safety Timeline" />
        <Skeleton className="h-96" />
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <PageHeader title="Family Safety Timeline" />
        <ErrorState message={error instanceof Error ? error.message : "Failed to load timeline"} retry={() => void refetch()} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageHeader
        title="Family Safety Timeline"
        description="Every stage from audio capture to caregiver acknowledgement — powered by real backend events."
      />

      {!data?.length ? (
        <EmptyState title="Timeline is empty" description="Process audio through Sentinel or Cognoscente to populate the timeline." />
      ) : (
        <div className="relative space-y-6 before:absolute before:left-4 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-ink/10 md:before:left-8">
          {data.map((item, index) => (
            <motion.div
              key={item.alertId}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
            >
              <Card className="relative ml-8 md:ml-16">
                <span className="absolute -left-[2.35rem] top-6 hidden h-3 w-3 rounded-full border-2 border-accent bg-white md:block" />
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={severityColor(item.severity)}>{item.severity}</Badge>
                    <Badge variant="outline">{item.agent}</Badge>
                    {item.resolved ? <Badge variant="success">Resolved</Badge> : <Badge variant="warning">Open</Badge>}
                  </div>
                  <Link to="/app/incidents/$incidentId" params={{ incidentId: item.alertId }}>
                    <h2 className="mt-3 font-serif text-2xl hover:text-accent">{item.title}</h2>
                  </Link>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-muted">
                    <span>{formatDate(item.createdAt)}</span>
                    <span>{formatRelative(item.createdAt)}</span>
                    {item.chainHash ? <span className="font-mono">{truncateHash(item.chainHash, 14)}</span> : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant={item.hasBundle ? "success" : "outline"}>Evidence {item.hasBundle ? "created" : "pending"}</Badge>
                    <Badge variant={item.hasPacket ? "success" : "outline"}>Packet {item.hasPacket ? "ready" : "pending"}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
