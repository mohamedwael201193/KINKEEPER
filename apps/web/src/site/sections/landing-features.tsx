import { Link } from "@tanstack/react-router";
import { QVAC_CAPABILITIES } from "@/content/guardian-mesh";
import { GlassCard, SectionLabel } from "@/site/layout/site-layout";
import { ChainLink, Stagger, StaggerItem } from "@/features/motion/motion-system";

export function QvacNativeSection() {
  return (
    <section className="border-y border-white/5 bg-zinc-900/20 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionLabel>QVAC native</SectionLabel>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl text-white md:text-4xl">
          Not a remote API wrapper — core infrastructure
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Every capability below maps to shipped code in{" "}
          <code className="text-zinc-300">packages/guardian-mesh</code> and{" "}
          <code className="text-zinc-300">packages/qvac</code>.
        </p>

        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QVAC_CAPABILITIES.map((cap) => (
            <StaggerItem key={cap.id}>
              <GlassCard>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-zinc-100">{cap.label}</h3>
                  <span className="font-mono text-[10px] text-violet-300">{cap.model}</span>
                </div>
                <p className="mt-2 font-mono text-xs text-zinc-500">{cap.implementation}</p>
                <p className="mt-3 text-xs text-zinc-600">Verified: {cap.verifiedBy}</p>
              </GlassCard>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-8">
          <Link to="/qvac-proof" className="text-sm text-violet-300 hover:text-violet-200">
            Full QVAC proof portal →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function EvidenceSection() {
  const demoHashes = [
    {
      hash: "a3f2…8c1e",
      previousHash: "genesis",
      agent: "guardian-mesh-engine",
    },
    {
      hash: "7b91…4d02",
      previousHash: "a3f2…8c1e",
      agent: "risk-analyzer",
    },
    {
      hash: "c4e8…9f77",
      previousHash: "7b91…4d02",
      agent: "local-archivist",
    },
  ];

  return (
    <section id="evidence" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-20 md:py-28">
      <SectionLabel>Evidence chain</SectionLabel>
      <h2 className="mt-3 max-w-2xl font-serif text-3xl text-white md:text-4xl">
        Tamper-evident proof caregivers can trust
      </h2>
      <p className="mt-4 max-w-2xl text-zinc-400">
        Each incident writes a SHA-256 bundle linked to the previous hash.{" "}
        <code className="text-zinc-300">verifyChain()</code> in LocalArchivist validates ordering and integrity —
        exercised by <code className="text-zinc-300">npm run guardian:verify</code>.
      </p>

      <div className="mt-10 space-y-4">
        {demoHashes.map((link, index) => (
          <ChainLink key={link.hash} index={index} {...link} />
        ))}
      </div>

      <p className="mt-6 text-xs text-zinc-600">
        Illustrative truncated hashes. Full bundles stored under{" "}
        <code className="text-zinc-500">guardian-mesh-data/evidence/bundles/</code>.
      </p>
    </section>
  );
}

export function TelegramSection() {
  return (
    <section className="border-y border-white/5 bg-zinc-900/20 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionLabel>Telegram alerts</SectionLabel>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl text-white md:text-4xl">
          Caregiver loop with one-tap acknowledge
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          When <code className="text-zinc-300">TELEGRAM_BOT_TOKEN</code> and a chat ID are configured, WARN and BLOCK
          incidents send an alert with an Acknowledge button. Verified by{" "}
          <code className="text-zinc-300">npm run guardian:telegram</code> →{" "}
          <code className="text-zinc-300">ackReceived: true</code>.
        </p>

        <GlassCard className="mt-10 max-w-xl">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-300">Example alert structure</p>
          <div className="mt-4 space-y-2 font-mono text-xs text-zinc-400">
            <p>🛡 Guardian Mesh · BLOCK</p>
            <p>Margaret — IRS scam call detected</p>
            <p>Evidence hash: [bundle SHA-256]</p>
            <p className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-violet-200">
              [ Acknowledge ]
            </p>
          </div>
        </GlassCard>

        <p className="mt-6 text-sm text-zinc-500">
          Implementation: <code className="text-zinc-400">packages/guardian-mesh/src/telegram/notifier.ts</code>
        </p>
      </div>
    </section>
  );
}

export function JudgeSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
      <SectionLabel>Judge experience</SectionLabel>
      <h2 className="mt-3 max-w-2xl font-serif text-3xl text-white md:text-4xl">
        Three-minute demo flow
      </h2>
      <ol className="mt-8 space-y-4">
        {[
          "Double-click release/GuardianMesh-Judge/Start-Guardian-Mesh.bat",
          "Open http://127.0.0.1:8787/",
          "Click ▶ 3-Min Judge Demo (scenarios A, B, G)",
          "Click Verify Chain and Refresh QVAC Proof",
        ].map((step, i) => (
          <li key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-sm font-medium text-violet-200">
              {i + 1}
            </span>
            <span className="font-mono text-sm text-zinc-300">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-white/5 bg-zinc-900/20 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4">
        <SectionLabel>FAQ</SectionLabel>
        <h2 className="mt-3 font-serif text-3xl text-white md:text-4xl">Common questions</h2>
        <div className="mt-8 space-y-4">
          {[
            {
              q: "Does Guardian Mesh send my data to the cloud?",
              a: "The Judge demo runs QVAC inference in-process on localhost. No remote LLM API is called. Telegram is optional.",
            },
            {
              q: "Are demo assets real elder recordings?",
              a: "No — synthetic WAV/PNG from npm run guardian:assets. Inference is real QVAC, not mocked JSON.",
            },
            {
              q: "What verdicts exist?",
              a: "ALLOW, WARN, and BLOCK — merged from deterministic rules and local LLM output.",
            },
            {
              q: "How do I verify everything works?",
              a: "Run npm run guardian:verify, guardian:scenarios, and guardian:telegram from the repo root.",
            },
          ].map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 open:bg-white/[0.04]"
            >
              <summary className="cursor-pointer list-none font-medium text-zinc-100 marker:content-none">
                {item.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DownloadSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
      <GlassCard className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <SectionLabel>Download</SectionLabel>
          <h2 className="mt-3 font-serif text-2xl text-white md:text-3xl">Run Guardian Mesh on your machine</h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Clone from GitHub, configure .env, build the Judge Console, or rebuild the Windows Electron portable locally.
          </p>
        </div>
        <Link
          to="/download"
          className="inline-flex h-11 items-center rounded-full bg-violet-600 px-6 text-sm font-medium text-white hover:bg-violet-500"
        >
          Installation guide
        </Link>
      </GlassCard>
    </section>
  );
}
