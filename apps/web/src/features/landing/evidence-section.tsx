import { CheckCircle2 } from "lucide-react";
import { DataProof } from "@/components/data-proof";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/states";
import { ChainLink, Stagger, StaggerItem } from "@/features/motion/motion-system";
import { truncateHash, type EvidenceSystemProof } from "./proof-helpers";
import { LandingSection, SectionEyebrow, SectionLead, SectionTitle } from "./section-primitives";

interface EvidenceSectionProps {
  evidenceSystem: EvidenceSystemProof | null;
  isLoading: boolean;
}

export function EvidenceSection({ evidenceSystem, isLoading }: EvidenceSectionProps) {
  return (
    <LandingSection id="evidence" className="border-t border-ink/8 bg-white/30">
      <Stagger>
        <StaggerItem>
          <SectionEyebrow>Evidence chain</SectionEyebrow>
          <SectionTitle>Every decision is hash-linked and auditable.</SectionTitle>
          <SectionLead>
            Archivist seals Sentinel and Cognoscente outputs into tamper-evident bundles. Caregivers receive evidence
            packets — not black-box alerts.
          </SectionLead>
        </StaggerItem>

        <StaggerItem>
          {isLoading ? (
            <Skeleton className="mt-12 h-72" />
          ) : evidenceSystem ? (
            <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="h-fit bg-white/80">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-trust-ok" />
                    <p className="font-serif text-xl">Chain verification</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success">valid: {String(evidenceSystem.chain.valid)}</Badge>
                    <Badge variant="outline">length: {evidenceSystem.chain.length}</Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    Each bundle references the previous hash. Export the full chain for compliance review or family
                    dispute resolution.
                  </p>
                  <DataProof
                    endpoint="GET /public/proof → evidenceSystem.chain"
                    value={`valid ${evidenceSystem.chain.valid} · length ${evidenceSystem.chain.length}`}
                  />
                </CardContent>
              </Card>

              <div className="space-y-8">
                {evidenceSystem.bundles.map((bundle, index) => (
                  <ChainLink
                    key={bundle.id}
                    index={index}
                    agent={bundle.agent}
                    hash={truncateHash(bundle.hash, 12, 8)}
                    previousHash={bundle.previousHash === "0" ? "genesis" : truncateHash(bundle.previousHash, 12, 8)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Card className="mt-12">
              <CardContent className="p-8 text-sm text-ink-muted">
                Evidence system proof data unavailable.
              </CardContent>
            </Card>
          )}
        </StaggerItem>
      </Stagger>
    </LandingSection>
  );
}
