import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CapabilityCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      <Card className="group h-full border-ink/10 transition-all duration-300 hover:border-accent/25 hover:shadow-card">
        <CardHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="leading-relaxed">{description}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function VerdictFlowDemo() {
  const tiers = [
    {
      id: "allow",
      label: "ALLOW",
      color: "border-trust-ok/30 bg-trust-ok/10 text-trust-ok",
      example: "Safe pharmacy receipt · family check-in",
      detail: "Low-risk patterns pass through with evidence still recorded.",
    },
    {
      id: "warn",
      label: "WARN",
      color: "border-trust-warn/30 bg-trust-warn/10 text-trust-warn",
      example: "Utility verification request · ambiguous urgency",
      detail: "Suspicious signals without definitive scam markers — caregiver notified.",
    },
    {
      id: "block",
      label: "BLOCK",
      color: "border-trust-critical/30 bg-trust-critical/10 text-trust-critical",
      example: "IRS gift-card demand · fake wire invoice",
      detail: "Deterministic rules and LLM merge to stop the incident path.",
    },
  ] as const;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {tiers.map((tier, i) => (
        <motion.button
          key={tier.id}
          type="button"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "rounded-2xl border p-6 text-left shadow-soft transition-shadow hover:shadow-card",
            tier.color,
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-wider">{tier.label}</p>
          <p className="mt-3 font-serif text-xl text-ink">{tier.example}</p>
          <p className="mt-2 text-sm text-ink-muted">{tier.detail}</p>
        </motion.button>
      ))}
    </div>
  );
}
