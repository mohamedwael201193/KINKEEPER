import { MERMAID, SITE } from "@/content/guardian-mesh";
import { MermaidDiagram } from "@/site/components/mermaid-diagram";
import { PageHeader, SiteLayout } from "@/site/layout/site-layout";

const DIAGRAMS = [
  { key: "systemArchitecture", title: "System architecture" },
  { key: "dataFlow", title: "Data flow" },
  { key: "fraudDetection", title: "Fraud detection flow" },
  { key: "evidenceChain", title: "Evidence chain flow" },
  { key: "telegramFlow", title: "Telegram flow" },
  { key: "judgeDemo", title: "Judge demo flow" },
] as const;

export default function ArchitecturePage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Architecture"
        title="Technical architecture"
        description="Mermaid diagrams mapped to the shipped Guardian Mesh monorepo — apps/guardian-mesh, packages/guardian-mesh, packages/qvac."
      />

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="font-medium text-zinc-200">Monorepo layout</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-500">
                <tr>
                  <th className="pb-2 pr-4">Path</th>
                  <th className="pb-2">Role</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs text-violet-200">apps/guardian-mesh</td>
                  <td>Judge HTTP server + UI (:8787)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs text-violet-200">packages/guardian-mesh</td>
                  <td>Engine, rules, RAG, Telegram, evidence</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs text-violet-200">packages/qvac</td>
                  <td>QVAC SDK wrapper</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs text-violet-200">apps/guardian-desktop</td>
                  <td>Optional Electron shell (Windows)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {DIAGRAMS.map(({ key, title }) => (
          <MermaidDiagram key={key} title={title} chart={MERMAID[key]} />
        ))}

        <p className="text-sm text-zinc-500">
          Judge console:{" "}
          <a href={SITE.judgeUrl} className="text-violet-300 hover:underline">
            {SITE.judgeUrl}
          </a>
        </p>
      </div>
    </SiteLayout>
  );
}
