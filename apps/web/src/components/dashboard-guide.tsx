import { Link } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  FileStack,
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const GUIDE_ITEMS = [
  { to: "/app", label: "Timeline", hint: "See every step from audio to caregiver alert", icon: Activity },
  { to: "/app/incidents", label: "Alerts", hint: "Scam calls and cognitive warnings", icon: Bell },
  { to: "/app/evidence", label: "Evidence", hint: "Tamper-proof decision records", icon: FileStack },
  { to: "/app/telegram", label: "Telegram", hint: "Instant messages to caregivers", icon: MessageCircle },
  { to: "/app/family", label: "Family setup", hint: "Add elder, invite helpers, finish onboarding", icon: Heart },
  { to: "/app/caregivers", label: "Caregivers", hint: "Who gets alerts and has access", icon: Users },
  { to: "/app/qvac", label: "AI engine", hint: "Local AI that analyzes voice on your device", icon: Sparkles },
  { to: "/app/system", label: "Health", hint: "Check that everything is running", icon: Shield },
] as const;

export function DashboardGuide() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem("kinkeeper-guide-dismissed") !== "1";
    } catch {
      return true;
    }
  });

  if (!open) return null;

  return (
    <Card className="mb-8 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
      <CardContent className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Quick guide</p>
            <h2 className="mt-1 font-display text-xl">KINKEEPER in 30 seconds</h2>
            <p className="mt-1 text-sm text-ink-muted">
              <strong>Timeline</strong> = activity feed · <strong>Alerts</strong> = scam &amp; health warnings ·{" "}
              <strong>Evidence</strong> = proof records · <strong>Family setup</strong> = finish protecting your parent
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Dismiss guide"
            onClick={() => {
              setOpen(false);
              try {
                localStorage.setItem("kinkeeper-guide-dismissed", "1");
              } catch {
                /* ignore */
              }
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {GUIDE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex gap-3 rounded-xl border border-ink/8 bg-white/80 p-3 transition hover:border-accent/30 hover:shadow-soft"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink/5">
                  <Icon className="h-4 w-4 text-ink" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs leading-snug text-ink-muted">{item.hint}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
