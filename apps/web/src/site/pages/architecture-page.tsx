import { MarketingShell } from "@/site/layout/marketing-shell";
import { SeoHead } from "@/site/components/seo-head";
import { SectionShell } from "@/site/components/section-shell";
import {
  EvidenceFlowDiagram,
  PipelineDiagram,
  SystemArchitectureDiagram,
  TelegramFlowDiagram,
} from "@/site/components/architecture-diagrams";

const SECTIONS = [
  { title: "System architecture", Component: SystemArchitectureDiagram },
  { title: "Detection pipeline", Component: PipelineDiagram },
  { title: "Evidence flow", Component: EvidenceFlowDiagram },
  { title: "Telegram flow", Component: TelegramFlowDiagram },
  { title: "QVAC integration", Component: SystemArchitectureDiagram },
] as const;

export default function ArchitecturePage() {
  return (
    <MarketingShell>
      <SeoHead title="Architecture" path="/architecture" description="Guardian Mesh system architecture and data flows." />
      <SectionShell
        eyebrow="Architecture"
        title="Architecture explorer"
        description="Responsive diagrams for the local fraud firewall stack."
      >
        <div className="space-y-16">
          {SECTIONS.map(({ title, Component }) => (
            <div key={title}>
              <h3 className="mb-6 font-serif text-2xl text-ink">{title}</h3>
              <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white/50 p-4 shadow-soft md:p-6">
                <Component />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-12 text-sm text-ink-muted">
          Implementation: packages/guardian-mesh/src/pipeline/guardian-mesh-engine.ts · apps/guardian-mesh
        </p>
      </SectionShell>
    </MarketingShell>
  );
}
