import { motion } from "framer-motion";
import { Check, Loader2, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ProcessingStep } from "@/lib/types";

export function PipelineProgress({ steps }: { steps: ProcessingStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="glass-card p-8">
      <p className="section-eyebrow">Live pipeline</p>
      <p className="mt-2 text-lg font-medium text-white">Analysis in progress</p>
      <div className="mt-8 space-y-1">
        {steps.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-start gap-4 rounded-xl px-3 py-3"
          >
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                step.status === "complete" && "border-allow/40 bg-allow/15 text-allow",
                step.status === "active" && "border-accent/40 bg-accent/15 text-accent-soft",
                step.status === "pending" && "border-white/10 bg-navy-hover text-steel",
                step.status === "failed" && "border-block/40 bg-block/15 text-block",
                step.status === "skipped" && "border-white/10 bg-navy-hover text-steel",
              )}
            >
              {step.status === "active" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-label="In progress" />
              ) : step.status === "complete" ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : step.status === "skipped" ? (
                <Minus className="h-4 w-4" aria-hidden />
              ) : (
                <span className="text-xs font-mono">{i + 1}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={cn("text-sm font-medium", step.status === "active" ? "text-white" : "text-steel-bright")}>
                  {step.label}
                  {step.status === "active" ? "…" : ""}
                </p>
                {step.latencyMs !== undefined && step.status === "complete" && (
                  <span className="font-mono text-[10px] text-steel">{step.latencyMs}ms</span>
                )}
              </div>
              {step.detail && step.status === "complete" && (
                <p className="mt-1 truncate font-mono text-[10px] text-steel">{step.detail}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
