import { Link } from "@tanstack/react-router";
import { FAQ, VERIFIED_COMMANDS } from "@/content/guardian-mesh";
import { CodeBlock } from "@/site/components/code-block";
import { Callout, GlassCard, PageHeader, SiteLayout } from "@/site/layout/site-layout";

const SECTIONS = [
  { id: "overview", title: "Overview" },
  { id: "architecture", title: "Architecture" },
  { id: "features", title: "Features" },
  { id: "installation", title: "Installation" },
  { id: "windows", title: "Windows setup" },
  { id: "local", title: "Running locally" },
  { id: "models", title: "QVAC models" },
  { id: "telegram", title: "Telegram setup" },
  { id: "evidence", title: "Evidence chain" },
  { id: "judge", title: "Judge demo" },
  { id: "troubleshooting", title: "Troubleshooting" },
  { id: "faq", title: "FAQ" },
] as const;

export default function DocsPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Documentation"
        title="Guardian Mesh docs"
        description="Verified commands and setup paths from the shipped monorepo. Every command below exists in package.json and was validated during site build."
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1 text-sm">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block rounded-lg px-3 py-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-16">
          <section id="overview">
            <h2 className="font-serif text-2xl text-white">Overview</h2>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              Guardian Mesh is a local fraud firewall in{" "}
              <code className="text-zinc-300">packages/guardian-mesh</code> with a Judge HTTP UI in{" "}
              <code className="text-zinc-300">apps/guardian-mesh</code> on{" "}
              <code className="text-zinc-300">http://127.0.0.1:8787/</code>. It transcribes calls, reads documents,
              searches family safety notes, returns ALLOW/WARN/BLOCK, writes hash-linked evidence, and optionally
              alerts caregivers on Telegram.
            </p>
            <Callout variant="info" className="mt-4">
              The legacy cloud stack (<code>apps/api</code>, <code>apps/web</code> dashboard) is not required for the
              Guardian Mesh demo path.
            </Callout>
          </section>

          <section id="architecture">
            <h2 className="font-serif text-2xl text-white">Architecture</h2>
            <p className="mt-3 text-zinc-400">
              See the full{" "}
              <Link to="/architecture" className="text-violet-300 hover:underline">
                architecture portal
              </Link>{" "}
              for Mermaid diagrams of system layout, fraud detection, evidence chain, Telegram, and judge flows.
            </p>
          </section>

          <section id="features">
            <h2 className="font-serif text-2xl text-white">Features</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Local STT (Whisper) for scam calls",
                "Local OCR for fake invoices",
                "RAG over seeded family safety docs",
                "Qwen3-600M + MedPsy escalation",
                "Deterministic ALLOW/WARN/BLOCK rules",
                "SHA-256 evidence chain",
                "Local TTS warnings",
                "Telegram alert + Acknowledge",
                "Prompt injection sanitizer",
                "QVAC provider key proof",
              ].map((f) => (
                <li key={f} className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-zinc-300">
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section id="installation">
            <h2 className="font-serif text-2xl text-white">Installation</h2>
            <CodeBlock
              className="mt-4"
              title="Developer setup"
              code={`git clone https://github.com/mohamedwael201193/KINKEEPER
cd KINKEEPER
npm install
copy .env.example .env
npm run build:guardian-mesh
npm run dev:guardian-mesh`}
            />
            <p className="mt-3 text-sm text-zinc-500">Requires Node ≥ 22.17 and npm ≥ 10.9.</p>
          </section>

          <section id="windows">
            <h2 className="font-serif text-2xl text-white">Windows setup</h2>
            <p className="mt-3 text-zinc-400">
              Judges can double-click{" "}
              <code className="text-zinc-300">release/GuardianMesh-Judge/Start-Guardian-Mesh.bat</code>. First run may
              execute npm ci, build, and QVAC model download (~2–4 GB).
            </p>
          </section>

          <section id="local">
            <h2 className="font-serif text-2xl text-white">Running locally</h2>
            <CodeBlock
              className="mt-4"
              code={`npm run dev:guardian-mesh
# Open http://127.0.0.1:8787/`}
            />
          </section>

          <section id="models">
            <h2 className="font-serif text-2xl text-white">QVAC models</h2>
            <p className="mt-3 text-zinc-400">
              Set <code className="text-zinc-300">QVAC_MODELS_CACHE_DIR=./.qvac-models</code> in .env. Models loaded via{" "}
              <code className="text-zinc-300">@qvac/sdk</code>:
            </p>
            <GlassCard className="mt-4 font-mono text-xs text-zinc-400">
              WHISPER_TINY · OCR_LATIN_RECOGNIZER_1 · GTE_LARGE_FP16 · QWEN3_600M_INST_Q4 · MedPsy 1.7B ·
              TTS_EN_SUPERTONIC_Q8_0
            </GlassCard>
          </section>

          <section id="telegram">
            <h2 className="font-serif text-2xl text-white">Telegram setup</h2>
            <CodeBlock
              className="mt-4"
              code={`# .env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_DEMO_CHAT_ID=your_chat_id

npm run telegram:discover
npm run guardian:telegram`}
            />
            <Callout variant="warning" className="mt-4">
              Only one process may poll a bot token at a time. Stop <code>dev:api</code> or Render pollers before{" "}
              <code>guardian:telegram</code> or you may see HTTP 409.
            </Callout>
          </section>

          <section id="evidence">
            <h2 className="font-serif text-2xl text-white">Evidence chain</h2>
            <p className="mt-3 text-zinc-400">
              Bundles stored under <code className="text-zinc-300">guardian-mesh-data/evidence/</code> (configurable via{" "}
              <code className="text-zinc-300">GUARDIAN_MESH_DATA_DIR</code>). Verify with:
            </p>
            <CodeBlock className="mt-4" code="npm run guardian:verify" />
          </section>

          <section id="judge">
            <h2 className="font-serif text-2xl text-white">Judge demo</h2>
            <p className="mt-3 text-zinc-400">
              In the Judge Console, click <strong className="text-zinc-200">▶ 3-Min Judge Demo</strong> — runs scenarios
              A (BLOCK), B (BLOCK), and G (ALLOW) via <code className="text-zinc-300">POST /api/demo/judge-flow</code>.
            </p>
          </section>

          <section id="troubleshooting">
            <h2 className="font-serif text-2xl text-white">Troubleshooting</h2>
            <div className="mt-4 space-y-3">
              <GlassCard>
                <p className="font-medium text-zinc-200">Models downloading slowly</p>
                <p className="mt-1 text-sm text-zinc-400">
                  First inference downloads ~2–4 GB. Set QVAC_MODELS_CACHE_DIR and wait for cache completion.
                </p>
              </GlassCard>
              <GlassCard>
                <p className="font-medium text-zinc-200">Telegram 409 conflict</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Two pollers on the same bot token. Stop dev:api or cloud deployment polling before verify scripts.
                </p>
              </GlassCard>
              <GlassCard>
                <p className="font-medium text-zinc-200">Scenario assets missing</p>
                <p className="mt-1 text-sm text-zinc-400">Run npm run guardian:assets to generate synthetic WAV/PNG files.</p>
              </GlassCard>
            </div>
          </section>

          <section id="faq">
            <h2 className="font-serif text-2xl text-white">FAQ</h2>
            <div className="mt-4 space-y-3">
              {FAQ.map((item) => (
                <GlassCard key={item.q}>
                  <p className="font-medium text-zinc-200">{item.q}</p>
                  <p className="mt-2 text-sm text-zinc-400">{item.a}</p>
                </GlassCard>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-white">Verified commands</h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.03] text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Command</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {VERIFIED_COMMANDS.map((cmd) => (
                    <tr key={cmd.command} className="border-b border-white/5">
                      <td className="px-4 py-3 font-mono text-xs text-violet-200">{cmd.command}</td>
                      <td className="px-4 py-3 text-zinc-400">{cmd.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
