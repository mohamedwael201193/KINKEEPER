import { motion } from "framer-motion";
import type { GuardianIncidentResult } from "@/lib/types";
import { verdictBg, verdictColor } from "@/lib/api";
import { cn } from "@/lib/cn";
import { CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

const icons = { ALLOW: CheckCircle2, WARN: AlertTriangle, BLOCK: ShieldAlert };

export function VerdictHero({ result }: { result: GuardianIncidentResult }) {
  const v = result.risk.verdict;
  const Icon = icons[v];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("overflow-hidden rounded-3xl border p-10 md:p-12", verdictBg(v))}
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-eyebrow">Analysis complete</p>
          <p className={cn("mt-4 font-serif text-6xl tracking-tight md:text-7xl", verdictColor(v))}>{v}</p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-steel-bright">{result.risk.reasoning}</p>
          {result.risk.scamType && (
            <p className="mt-3 text-sm font-medium text-white">{result.risk.scamType}</p>
          )}
        </div>
        <div className={cn("flex h-24 w-24 items-center justify-center rounded-3xl border md:h-28 md:w-28", verdictBg(v))}>
          <Icon className={cn("h-12 w-12 md:h-14 md:w-14", verdictColor(v))} aria-hidden />
        </div>
      </div>
      {result.risk.whatToDo.length > 0 && (
        <ul className="mt-8 grid gap-2 border-t border-white/10 pt-6 text-sm text-steel-bright md:grid-cols-2">
          {result.risk.whatToDo.map((a) => (
            <li key={a}>→ {a}</li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

// Keep VerdictCard for backward compat
export { VerdictHero as VerdictCard };
