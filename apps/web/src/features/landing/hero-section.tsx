import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PipelineNode, Stagger, StaggerItem } from "@/features/motion/motion-system";
import { BgRhythm } from "./section-primitives";

const PIPELINE_STEPS = [
  "Call",
  "Whisper",
  "Sentinel",
  "Cognoscente",
  "Evidence Chain",
  "Telegram",
  "Caregiver",
] as const;

export function HeroSection() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-10 md:px-8 md:pb-24 md:pt-16">
      <BgRhythm className="top-0 opacity-30" />
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <Stagger>
          <StaggerItem>
            <Badge variant="outline" className="mb-6 border-accent/20 bg-accent-soft text-accent">
              Local AI · Family Safety
            </Badge>
            <h1 className="max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight md:text-7xl">
              Protecting families using local AI
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
              KINKEEPER listens for scam phone calls and voice changes in your parent — on your home computer, not the
              cloud. You get a plain-English alert on Telegram with one-tap buttons.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/register">Start protecting your family</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </StaggerItem>
        </Stagger>

        <Stagger className="relative">
          <StaggerItem>
            <div className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white/60 p-6 shadow-card backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Live pipeline</p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {PIPELINE_STEPS.map((label, index) => (
                  <PipelineNode
                    key={label}
                    label={label}
                    active={index === activeStep}
                    done={index < activeStep}
                  />
                ))}
              </div>
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-6 rounded-xl border border-accent/15 bg-accent-soft/50 px-4 py-3 text-sm text-ink-muted"
              >
                <span className="font-medium text-accent">{PIPELINE_STEPS[activeStep]}</span>
                {" · "}
                {activeStep === 0 && "Incoming call audio captured on the cognition node."}
                {activeStep === 1 && "Whisper transcribes locally — no cloud upload."}
                {activeStep === 2 && "Sentinel classifies scam patterns with cited reasoning."}
                {activeStep === 3 && "Cognoscente tracks cognitive baselines over time."}
                {activeStep === 4 && "Archivist seals a hash-linked decision bundle."}
                {activeStep === 5 && "Telegram notifies caregivers with evidence context."}
                {activeStep === 6 && "Family acknowledges and resolves with full audit trail."}
              </motion.div>
            </div>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
