import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Copy, ExternalLink, MessageCircle } from "lucide-react";
import { SuccessBanner } from "@/components/audio-upload-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { PageHeader } from "@/layouts/app-shell";
import { PageTransition } from "@/components/motion/primitives";
import { api } from "@/services/api-client";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

export function TelegramPage() {
  const queryClient = useQueryClient();
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);
  const statusQuery = useQuery({ queryKey: ["telegram-status"], queryFn: api.telegramStatus });
  const notificationsQuery = useQuery({ queryKey: ["telegram-notifications"], queryFn: api.telegramNotifications });

  const linkMutation = useMutation({
    mutationFn: api.telegramLink,
    onSuccess: (data) => {
      setLinkSuccess(data.deepLinkUrl ? "Tap Open in Telegram below — then use the menu buttons." : "Copy the link code into Telegram.");
      void queryClient.invalidateQueries({ queryKey: ["telegram-status"] });
      void queryClient.invalidateQueries({ queryKey: ["onboarding"] });
    },
  });

  const copyToken = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  if (statusQuery.isLoading) {
    return (
      <PageTransition>
        <PageHeader title="Telegram alerts" />
        <Skeleton className="h-64" />
      </PageTransition>
    );
  }

  if (statusQuery.error) {
    return (
      <PageTransition>
        <PageHeader title="Telegram alerts" />
        <ErrorState message={statusQuery.error.message} retry={() => void statusQuery.refetch()} />
      </PageTransition>
    );
  }

  const status = statusQuery.data;

  return (
    <PageTransition>
      <PageHeader
        title="Telegram alerts"
        description="Get scam warnings on your phone with one-tap Acknowledge and Evidence buttons — no commands to memorize."
      />

      {linkSuccess && !status?.linked ? (
        <SuccessBanner message={linkSuccess} onDismiss={() => setLinkSuccess(null)} />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Connection
            </CardTitle>
            <CardDescription>Link this Telegram chat to your KINKEEPER account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant={status?.linked ? "success" : "outline"}>
                {status?.linked ? "Connected" : "Not connected"}
              </Badge>
              <Badge variant={status?.botEnabled ? "success" : "warning"}>
                Bot {status?.botEnabled ? "running" : "offline"}
              </Badge>
            </div>
            {status?.botUsername ? <p className="text-sm text-ink-muted">Bot: @{status.botUsername}</p> : null}
            {status?.linkedAt ? <p className="text-sm text-ink-muted">Connected {formatDate(status.linkedAt)}</p> : null}

            {status?.linked ? (
              <div className="rounded-xl border border-trust-safe/25 bg-trust-safe/5 p-4 text-sm">
                ✅ You're connected. Open Telegram and tap <strong>📊 Status</strong> or wait for the next alert.
              </div>
            ) : (
              <div className="space-y-3">
                {!status?.botEnabled ? (
                  <p className="text-sm text-trust-warn">
                    Telegram bot is not running on the server. Ask your administrator to set TELEGRAM_ENABLED.
                  </p>
                ) : null}
                <Button onClick={() => linkMutation.mutate()} disabled={linkMutation.isPending || !status?.botEnabled}>
                  Connect Telegram
                </Button>
                {linkMutation.data ? (
                  <div className="rounded-xl border border-ink/8 bg-canvas-muted/40 p-4 text-sm space-y-3">
                    {linkMutation.data.deepLinkUrl ? (
                      <Button asChild className="w-full">
                        <a href={linkMutation.data.deepLinkUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open in Telegram
                        </a>
                      </Button>
                    ) : null}
                    <p className="text-ink-muted">{linkMutation.data.instructions}</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-white px-2 py-1 text-xs">/link {linkMutation.data.token}</code>
                      <Button variant="ghost" size="icon" onClick={() => void copyToken(linkMutation.data!.token)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-ink-faint">Link expires in {Math.round(linkMutation.data.expiresInSeconds / 60)} minutes</p>
                  </div>
                ) : null}
                {!status?.linked ? (
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/app/family">Back to family setup</Link>
                  </Button>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent notifications</CardTitle>
            <CardDescription>Alerts sent to Telegram and acknowledgements</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[480px] space-y-3 overflow-auto">
            {notificationsQuery.isLoading ? (
              <Skeleton className="h-32" />
            ) : notificationsQuery.error ? (
              <ErrorState message={notificationsQuery.error.message} retry={() => void notificationsQuery.refetch()} />
            ) : !notificationsQuery.data?.length ? (
              <EmptyState
                title="No notifications yet"
                description="When Sentinel detects a scam, you'll see a delivery record here."
                action={
                  !status?.linked ? (
                    <Button size="sm" onClick={() => linkMutation.mutate()} disabled={!status?.botEnabled}>
                      Connect Telegram
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              notificationsQuery.data.map((log) => (
                <div key={log.id} className="rounded-xl border border-ink/8 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">{log.action.replace("telegram.", "")}</Badge>
                    <span className="text-xs text-ink-faint">{formatDate(log.createdAt)}</span>
                  </div>
                  {log.user ? (
                    <p className="mt-2 text-sm">
                      {log.user.firstName} {log.user.lastName}
                    </p>
                  ) : null}
                  {log.entityId ? <p className="mt-1 font-mono text-xs text-ink-faint">Alert {log.entityId.slice(-8)}</p> : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
