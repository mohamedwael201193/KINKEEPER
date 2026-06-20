import { MarketingNav } from "@/layouts/marketing-layout";
import { usePublicProof } from "@/hooks/use-public-proof";
import { PageShell, ScrollProgress } from "@/features/motion/motion-system";
import { parsePublicProof } from "./proof-helpers";
import { HeroSection } from "./hero-section";
import { ScamDemoSection } from "./scam-demo-section";
import { CognitiveSection } from "./cognitive-section";
import { EvidenceSection } from "./evidence-section";
import { QvacSection } from "./qvac-section";
import { TelegramSection } from "./telegram-section";
import { WhyLocalSection } from "./why-local-section";
import { FaqCtaSection } from "./faq-cta-section";

export default function LandingPage() {
  const { data, isLoading, isError } = usePublicProof();
  const proof = parsePublicProof(data);

  return (
    <PageShell>
      <div className="min-h-screen bg-canvas text-ink">
        <ScrollProgress />
        <MarketingNav />

        <HeroSection />

        <section id="how-it-works" className="scroll-mt-24">
          <ScamDemoSection sentinel={proof.sentinel} isLoading={isLoading} />
        </section>
        <CognitiveSection cognoscente={proof.cognoscente} isLoading={isLoading} />
        <EvidenceSection evidenceSystem={proof.evidenceSystem} isLoading={isLoading} />
        <QvacSection qvacRuntime={proof.qvacRuntime} isLoading={isLoading} />
        <TelegramSection sentinel={proof.sentinel} isLoading={isLoading} />
        <WhyLocalSection />
        <FaqCtaSection />

        {isError ? (
          <p className="px-4 pb-8 text-center text-xs text-ink-faint">
            Live proof API unavailable — sections show cached or empty state.
          </p>
        ) : null}
      </div>
    </PageShell>
  );
}
