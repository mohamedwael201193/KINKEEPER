import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/features/motion/motion-system";
import { LandingSection, SectionTitle } from "./section-primitives";

const FAQ_ITEMS = [
  {
    question: "Is this a diagnosis tool?",
    answer:
      "No. Cognoscente surfaces cognitive signals for caregivers to discuss with clinicians. It is not medical advice or a substitute for professional evaluation.",
  },
  {
    question: "Does audio leave my home?",
    answer:
      "Inference runs locally via QVAC on your cognition node. Your family controls the hardware, models, and evidence archive.",
  },
  {
    question: "What happens when a scam is detected?",
    answer:
      "Sentinel explains why with confidence and reasoning. Archivist locks an evidence bundle, and caregivers are notified autonomously via Telegram.",
  },
  {
    question: "Can I verify the AI decisions?",
    answer:
      "Yes. Every agent action is hash-linked in the evidence chain. Export bundles with chain verification for audit or dispute resolution.",
  },
  {
    question: "How fast is local inference?",
    answer:
      "Verified runtime data shows sub-second Whisper TTFT and 200+ TPS on Qwen3 — fast enough for live call protection.",
  },
] as const;

export function FaqCtaSection() {
  return (
    <>
      <LandingSection id="faq">
        <Stagger>
          <StaggerItem>
            <SectionTitle>FAQ</SectionTitle>
          </StaggerItem>
          <StaggerItem>
            <div className="mt-8 space-y-0 divide-y divide-ink/8">
              {FAQ_ITEMS.map((item) => (
                <div key={item.question} className="py-6 first:pt-0">
                  <h3 className="font-medium text-ink">{item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.answer}</p>
                </div>
              ))}
            </div>
          </StaggerItem>
        </Stagger>
      </LandingSection>

      <section className="px-4 pb-24 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-ink px-8 py-16 text-canvas md:px-12"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            aria-hidden
            style={{
              backgroundImage: "url(/bgsection.svg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative">
            <h2 className="max-w-2xl font-serif text-4xl md:text-5xl">
              Your parents protected. Your peace of mind restored.
            </h2>
            <p className="mt-4 max-w-xl text-canvas/75">
              Launch your family workspace and connect Telegram in under two minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary" className="bg-canvas text-ink hover:bg-canvas/90">
                <Link to="/register">Get started</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-canvas hover:bg-white/10 hover:text-canvas"
              >
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
