import { SiteLayout } from "@/site/layout/site-layout";
import { LandingHero, LandingCtaStrip } from "@/site/sections/landing-hero";
import { ProblemSection, HowItWorksSection } from "@/site/sections/landing-problem-pipeline";
import { ScenariosSection } from "@/site/sections/landing-scenarios";
import {
  QvacNativeSection,
  EvidenceSection,
  TelegramSection,
  JudgeSection,
  FaqSection,
  DownloadSection,
} from "@/site/sections/landing-features";

export default function LandingPage() {
  return (
    <SiteLayout>
      <LandingHero />
      <ProblemSection />
      <HowItWorksSection />
      <ScenariosSection />
      <QvacNativeSection />
      <EvidenceSection />
      <TelegramSection />
      <JudgeSection />
      <FaqSection />
      <DownloadSection />
      <LandingCtaStrip />
    </SiteLayout>
  );
}
