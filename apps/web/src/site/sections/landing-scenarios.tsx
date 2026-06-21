import { Link } from "@tanstack/react-router";
import { SCENARIOS } from "@/content/guardian-mesh";
import { VerdictBadge } from "@/site/components/verdict-badge";
import { GlassCard, SectionLabel } from "@/site/layout/site-layout";
import { Stagger, StaggerItem } from "@/features/motion/motion-system";

export function ScenariosSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <SectionLabel>Real scenarios</SectionLabel>
          <h2 className="mt-3 max-w-xl font-serif text-3xl text-white md:text-4xl">
            Nine verified cases — BLOCK, WARN, and ALLOW
          </h2>
          <p className="mt-4 max-w-xl text-zinc-400">
            Synthetic assets, real QVAC inference. Automated via{" "}
            <code className="text-zinc-300">npm run guardian:scenarios</code> with{" "}
            <code className="text-zinc-300">mismatches: []</code>.
          </p>
        </div>
        <Link to="/demo" className="text-sm text-violet-300 hover:text-violet-200">
          Explore demo center →
        </Link>
      </div>

      <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((scenario) => (
          <StaggerItem key={scenario.id}>
            <GlassCard className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs text-zinc-500">{scenario.id}</span>
                <VerdictBadge verdict={scenario.expectedVerdict} />
              </div>
              <h3 className="mt-3 font-medium text-zinc-100">{scenario.name}</h3>
              <p className="mt-2 flex-1 text-sm text-zinc-400">{scenario.description}</p>
              <p className="mt-4 text-xs uppercase tracking-wider text-zinc-600">
                {scenario.type} · {scenario.threat}
              </p>
            </GlassCard>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
