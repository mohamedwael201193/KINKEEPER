import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "@/site/components/hero-background";
import { ease, ScrollProgress } from "@/features/motion/motion-system";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <ScrollProgress className="bg-violet-500" />
      <HeroBackground />
      <div className="relative mx-auto flex max-w-6xl flex-col px-4 pb-24 pt-20 md:pb-32 md:pt-28">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          QVAC-native · Local-first · Evidence chain
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.05, ease }}
          className="mt-8 max-w-4xl font-serif text-5xl leading-[1.05] tracking-tight text-white md:text-7xl"
        >
          Protect Families Before Money Is Lost
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl"
        >
          Guardian Mesh detects scam calls, fake invoices, social engineering attempts, and suspicious
          communications locally using QVAC-powered AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.18, ease }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Button asChild variant="accent" size="lg" className="bg-violet-600 hover:bg-violet-500">
            <Link to="/demo">
              <Play className="h-4 w-4" />
              Watch Demo
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
          >
            <Link to="/docs">
              <BookOpen className="h-4 w-4" />
              Read Docs
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
          >
            <Link to="/download">
              <Download className="h-4 w-4" />
              Download App
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-16 grid gap-3 sm:grid-cols-3"
        >
          {[
            { label: "Verdict tiers", value: "ALLOW · WARN · BLOCK" },
            { label: "Scenarios verified", value: "A–H + W automated" },
            { label: "Judge console", value: "127.0.0.1:8787" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-md"
            >
              <p className="text-[11px] uppercase tracking-wider text-zinc-500">{item.label}</p>
              <p className="mt-1 text-sm font-medium text-zinc-200">{item.value}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function LandingCtaStrip() {
  return (
    <section className="border-y border-white/5 bg-gradient-to-r from-violet-950/40 via-zinc-950 to-cyan-950/20">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 md:flex-row md:items-center">
        <div>
          <h2 className="font-serif text-2xl text-white md:text-3xl">Run the Judge Console locally</h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Double-click the launcher, open the console, and run the 3-Min Judge Demo with real QVAC inference.
          </p>
        </div>
        <Button asChild variant="accent" className="bg-violet-600 hover:bg-violet-500">
          <Link to="/download">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
