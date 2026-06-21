import { Link } from "@tanstack/react-router";
import { AlertTriangle, Terminal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QvacSetupBannerProps {
  qvacStatus?: string | null;
  compact?: boolean;
}

export function QvacSetupBanner({ qvacStatus, compact = false }: QvacSetupBannerProps) {
  const offline = qvacStatus != null && qvacStatus !== "healthy" && qvacStatus !== "configured";

  if (!offline) return null;

  return (
    <Card className="mb-6 border-trust-warning/30 bg-trust-warning/5">
      <CardContent className={compact ? "space-y-2 p-4 text-sm" : "space-y-3 p-5 text-sm"}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-trust-warning" />
          <div className="space-y-2">
            <p className="font-medium text-ink">Local AI is offline — voice scans need your home computer</p>
            <p className="text-ink-muted">
              KINKEEPER keeps inference on your device. Start the QVAC node on your PC, then expose port{" "}
              <code className="rounded bg-canvas-muted px-1 text-xs">3001</code> to the cloud API (ngrok or Tailscale).
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-ink-muted">
              <li>
                Run <code className="rounded bg-canvas-muted px-1 text-xs">npm run dev:qvac-node</code>
              </li>
              <li>
                Run <code className="rounded bg-canvas-muted px-1 text-xs">ngrok http 3001</code>
              </li>
              <li>Set Render <code className="rounded bg-canvas-muted px-1 text-xs">QVAC_NODE_URL</code> to the tunnel URL</li>
            </ol>
            <Link
              to="/app/system"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              <Terminal className="h-4 w-4" />
              Check system health
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
