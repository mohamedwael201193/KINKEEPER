import { SCENARIOS, SITE } from "@/content/guardian-mesh";
import { CodeBlock } from "@/site/components/code-block";
import { VerdictBadge } from "@/site/components/verdict-badge";
import { Callout, GlassCard, PageHeader, SiteLayout } from "@/site/layout/site-layout";

export default function DemoPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Demo center"
        title="Verified scenarios & judge flow"
        description="Nine scenarios with expected ALLOW/WARN/BLOCK outcomes. Synthetic assets, real QVAC inference — verified by npm run guardian:scenarios."
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <Callout variant="info">
          No hosted demo video in this repository. Run the Judge Console locally at{" "}
          <a href={SITE.judgeUrl} className="underline">
            {SITE.judgeUrl}
          </a>{" "}
          or follow the quick flow below.
        </Callout>

        <h2 className="mt-12 font-serif text-2xl text-white">Quick judge flow</h2>
        <CodeBlock
          className="mt-4"
          code={`${SITE.judgeLauncher}
# Browser → ${SITE.judgeUrl}
# Click ▶ 3-Min Judge Demo
# Click Verify Chain + Refresh QVAC Proof`}
        />

        <h2 className="mt-12 font-serif text-2xl text-white">Scenario cards</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {SCENARIOS.map((s) => (
            <GlassCard key={s.id} className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg text-violet-300">{s.id}</span>
                <VerdictBadge verdict={s.expectedVerdict} />
              </div>
              <h3 className="mt-2 text-lg font-medium text-zinc-100">{s.name}</h3>
              <p className="mt-2 text-sm text-zinc-400">{s.description}</p>
              <div className="mt-4 space-y-2 border-t border-white/5 pt-4 text-xs text-zinc-500">
                <p>
                  <span className="text-zinc-400">Type:</span> {s.type}
                </p>
                <p>
                  <span className="text-zinc-400">Threat:</span> {s.threat}
                </p>
                <p>
                  <span className="text-zinc-400">Risk tier:</span>{" "}
                  {s.expectedVerdict === "BLOCK"
                    ? "Hard block — deterministic scam patterns or dual signals"
                    : s.expectedVerdict === "WARN"
                      ? "Ambiguous — capped at WARN even if LLM suggests BLOCK"
                      : "Benign — ALLOW ceiling for safe daily contact"}
                </p>
                <p>
                  <span className="text-zinc-400">Evidence:</span>{" "}
                  <code className="text-zinc-400">evidence/guardian-scenarios/scenario-{s.id}.json</code>
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        <h2 className="mt-12 font-serif text-2xl text-white">Automated verification</h2>
        <CodeBlock className="mt-4" code="npm run guardian:scenarios" />
        <p className="mt-3 text-sm text-zinc-500">
          Expect <code className="text-zinc-400">mismatches: []</code> in{" "}
          <code className="text-zinc-400">evidence/guardian-scenarios/scenario-results.json</code>.
        </p>
      </div>
    </SiteLayout>
  );
}
