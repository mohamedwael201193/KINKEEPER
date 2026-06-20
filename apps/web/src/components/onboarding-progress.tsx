import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { OnboardingStatus } from "@/services/api-client";
import { cn } from "@/lib/utils";

const CHECKLIST = [
  { key: "elder" as const, label: "Add who you protect", hint: "Parent or grandparent" },
  { key: "caregiver" as const, label: "Invite a helper", hint: "Someone who gets alerts" },
  { key: "telegram" as const, label: "Connect Telegram", hint: "Instant phone alerts" },
  { key: "baselineScan" as const, label: "Record baseline voice", hint: "30-second check-in" },
  { key: "protectionActivated" as const, label: "Protection live", hint: "Pipeline armed" },
];

export function getNextStep(onboarding: OnboardingStatus | undefined): {
  title: string;
  description: string;
  to: string;
  label: string;
} | null {
  if (!onboarding || onboarding.progress >= 100) return null;

  switch (onboarding.currentStep) {
    case "elder":
      return {
        title: "Add your parent or grandparent",
        description: "Tell us who KINKEEPER protects — takes about one minute.",
        to: "/app/family",
        label: "Add elder",
      };
    case "caregiver":
      return {
        title: "Invite someone who can respond",
        description: "Add a sibling, spouse, or trusted contact to receive alerts.",
        to: "/app/family",
        label: "Invite caregiver",
      };
    case "telegram":
      return {
        title: "Connect Telegram for instant alerts",
        description: "Tap one button — no commands to type.",
        to: "/app/telegram",
        label: "Connect Telegram",
      };
    case "baselineScan":
      return {
        title: "Record a baseline voice check-in",
        description: "Upload a short voice sample so we can spot future changes.",
        to: "/app/family",
        label: "Run baseline scan",
      };
    default:
      return null;
  }
}

export function OnboardingProgressWidget({ onboarding }: { onboarding: OnboardingStatus | undefined }) {
  if (!onboarding || onboarding.progress >= 100) return null;

  const next = getNextStep(onboarding);

  return (
    <Card className="mb-6 border-accent/25 bg-gradient-to-br from-accent/5 to-white">
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Setup checklist</p>
            <p className="mt-1 font-display text-xl">Finish protecting your family</p>
            <p className="mt-1 text-sm text-ink-muted">
              {onboarding.progress}% complete — {5 - Object.values(onboarding.steps).filter(Boolean).length} steps left
            </p>
          </div>
          <Badge variant="outline" className="tabular-nums">
            {onboarding.progress}%
          </Badge>
        </div>

        <ul className="mt-5 space-y-2">
          {CHECKLIST.map((item) => {
            const done = onboarding.steps[item.key];
            const active = onboarding.currentStep === item.key;
            return (
              <li
                key={item.key}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm",
                  done ? "border-trust-safe/25 bg-trust-safe/5" : active ? "border-ink/15 bg-white" : "border-ink/8 bg-white/50",
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-trust-safe" />
                ) : (
                  <Circle className={cn("h-4 w-4 shrink-0", active ? "text-accent" : "text-ink-faint")} />
                )}
                <div className="min-w-0 flex-1">
                  <p className={cn("font-medium", done && "text-ink-muted line-through")}>{item.label}</p>
                  <p className="text-xs text-ink-faint">{item.hint}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {next ? (
          <Button asChild className="mt-5 w-full sm:w-auto">
            <Link to={next.to}>
              Next: {next.label}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function NextStepBanner({ onboarding }: { onboarding: OnboardingStatus | undefined }) {
  const next = getNextStep(onboarding);
  if (!next) return null;

  return (
    <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 px-4 py-4 md:flex md:items-center md:justify-between md:gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Your next step</p>
        <p className="mt-1 font-medium">{next.title}</p>
        <p className="mt-0.5 text-sm text-ink-muted">{next.description}</p>
      </div>
      <Button asChild variant="secondary" size="sm" className="mt-3 shrink-0 md:mt-0">
        <Link to={next.to}>{next.label}</Link>
      </Button>
    </div>
  );
}
