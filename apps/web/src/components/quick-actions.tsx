import { Link } from "@tanstack/react-router";
import { Brain, Heart, MessageCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function QuickActionsBar({
  hasElder,
  onboardingComplete,
}: {
  hasElder: boolean;
  onboardingComplete: boolean;
}) {
  return (
    <Card className="mb-6 border-ink/8">
      <CardContent className="p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Quick actions</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button asChild variant="outline" className="h-auto justify-start gap-2 px-3 py-3">
            <Link to="/app/family">
              <Heart className="h-4 w-4 shrink-0 text-accent" />
              <span className="text-left text-sm">
                <span className="block font-medium">Add elder</span>
                <span className="block text-xs font-normal text-ink-faint">Who we protect</span>
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto justify-start gap-2 px-3 py-3">
            <Link to="/app/telegram">
              <MessageCircle className="h-4 w-4 shrink-0 text-accent" />
              <span className="text-left text-sm">
                <span className="block font-medium">Connect Telegram</span>
                <span className="block text-xs font-normal text-ink-faint">Phone alerts</span>
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto justify-start gap-2 px-3 py-3" disabled={!hasElder}>
            <Link to={hasElder ? "/app/family" : "/app/family"} hash={hasElder ? "baseline" : undefined}>
              <Brain className="h-4 w-4 shrink-0 text-accent" />
              <span className="text-left text-sm">
                <span className="block font-medium">Run baseline scan</span>
                <span className="block text-xs font-normal text-ink-faint">Voice check-in</span>
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto justify-start gap-2 px-3 py-3" disabled={!hasElder}>
            <Link to={hasElder ? "/app/incidents" : "/app/family"}>
              <Upload className="h-4 w-4 shrink-0 text-accent" />
              <span className="text-left text-sm">
                <span className="block font-medium">Upload audio</span>
                <span className="block text-xs font-normal text-ink-faint">Test scam detection</span>
              </span>
            </Link>
          </Button>
        </div>
        {!onboardingComplete ? (
          <p className="mt-3 text-xs text-ink-faint">Complete setup checklist above for full protection.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
