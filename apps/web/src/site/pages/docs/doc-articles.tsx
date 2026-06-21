import type { ReactNode } from "react";
import { CodeBlock } from "@/site/components/code-block";

function DocHeading({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-10 border-b border-ink/10 pb-8">
      <h1 className="font-serif text-4xl tracking-tight">{title}</h1>
      {description ? <p className="mt-4 text-lg text-ink-muted">{description}</p> : null}
    </header>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 leading-relaxed text-ink-muted">{children}</p>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 mt-10 font-serif text-2xl text-ink">{children}</h2>;
}

export function DocOverviewPage() {
  return (
    <div>
      <DocHeading
        title="Overview"
        description="KINKEEPER Guardian Mesh is a local fraud firewall for families."
      />
      <P>
        Guardian Mesh transcribes suspicious calls, reads fraudulent documents, searches family safety notes,
        and returns ALLOW, WARN, or BLOCK — with a hash-linked evidence chain and optional Telegram caregiver alerts.
      </P>
      <H2>What it is not</H2>
      <P>
        It is not a cloud chatbot, not a bank fraud guarantee, and not live phone interception. The shipped path
        analyzes audio files and document images on localhost using QVAC in-process inference.
      </P>
      <H2>Core path</H2>
      <P>
        Run the local server at <code className="rounded bg-canvas-muted px-1.5 py-0.5 text-sm">127.0.0.1:8787</code> via{" "}
        <code className="rounded bg-canvas-muted px-1.5 py-0.5 text-sm">npm run dev:guardian-mesh</code> or the Windows launcher.
      </P>
    </div>
  );
}

export function DocGettingStartedPage() {
  return (
    <div>
      <DocHeading title="Getting Started" description="From clone to first verdict." />
      <CodeBlock
        title="Developer quick start"
        code={`git clone https://github.com/mohamedwael201193/KINKEEPER.git
cd KINKEEPER
npm install
copy .env.example .env
npm run build:guardian-mesh
npm run dev:guardian-mesh`}
      />
      <P>Open http://127.0.0.1:8787/ in your browser. First run downloads QVAC models (~2–4 GB).</P>
    </div>
  );
}

export function DocInstallationPage() {
  return (
    <div>
      <DocHeading title="Installation" description="Verified install paths per platform." />
      <H2>Windows (recommended)</H2>
      <P>Double-click `release/GuardianMesh-Judge/Start-Guardian-Mesh.bat` after cloning.</P>
      <H2>macOS / Linux</H2>
      <P>
        Use the developer path above. Electron portable/installer builds are Windows-only today. Node ≥ 22.17 required.
      </P>
    </div>
  );
}

export function DocFirstRunPage() {
  return (
    <div>
      <DocHeading title="First Run" />
      <P>First inference triggers QVAC model download. Set QVAC_MODELS_CACHE_DIR in .env to persist models.</P>
      <P>Run npm run guardian:verify to produce evidence/guardian-mesh-verify.json with BLOCK verdicts and valid chain.</P>
    </div>
  );
}

export function DocArchitecturePage() {
  return (
    <div>
      <DocHeading title="Architecture" />
      <P>apps/guardian-mesh — Judge HTTP server + UI. packages/guardian-mesh — engine, rules, RAG, Telegram.</P>
      <P>packages/qvac — QVAC client wrapper. Inference runs in-process, not via apps/qvac-node.</P>
    </div>
  );
}

export function DocThreatDetectionPage() {
  return (
    <div>
      <DocHeading title="Threat Detection" />
      <P>Three tiers: ALLOW, WARN, BLOCK — merged from deterministic-rules.ts and risk-analyzer.ts.</P>
      <P>Prompt injection sanitizer strips adversarial phrases. LLM cannot override BLOCK floors.</P>
    </div>
  );
}

export function DocEvidenceChainPage() {
  return (
    <div>
      <DocHeading title="Evidence Chain" />
      <P>LocalArchivist writes SHA-256 linked bundles. verifyChain() validates ordering and integrity.</P>
      <P>Default storage: guardian-mesh-data/evidence/ (configurable via GUARDIAN_MESH_DATA_DIR).</P>
    </div>
  );
}

export function DocTelegramPage() {
  return (
    <div>
      <DocHeading title="Telegram" />
      <P>Optional. Requires TELEGRAM_BOT_TOKEN and chat ID in .env. Without it, telegram stage is skipped.</P>
      <P>Run npm run telegram:discover after messaging your bot. Only one process may poll a token (409 conflict).</P>
    </div>
  );
}

export function DocTroubleshootingPage() {
  return (
    <div>
      <DocHeading title="Troubleshooting" />
      <H2>Telegram 409</H2>
      <P>Stop other pollers (dev:api, Render, duplicate verify scripts) using the same bot token.</P>
      <H2>Models re-download</H2>
      <P>Set QVAC_MODELS_CACHE_DIR and ensure disk space (~2–4 GB).</P>
      <H2>SmartScreen on Windows</H2>
      <P>Electron builds are unsigned. Rebuild locally with CSC_IDENTITY_AUTO_DISCOVERY=false.</P>
    </div>
  );
}

export function DocFaqPage() {
  return (
    <div>
      <DocHeading title="FAQ" description="See also /faq for the full public FAQ." />
      <P>Does Guardian Mesh send data to the cloud? No remote LLM in the core apps/guardian-mesh path.</P>
      <P>Is Telegram required? No — pipeline completes locally without it.</P>
    </div>
  );
}

export function DocQvacPage() {
  return (
    <div>
      <DocHeading title="QVAC Integration" />
      <P>Models: WHISPER_TINY, OCR_LATIN_RECOGNIZER_1, GTE_LARGE_FP16, QWEN3_600M_INST_Q4, MedPsy 1.7B, TTS_EN_SUPERTONIC_Q8_0.</P>
      <P>Provider public key exposed at GET /api/proof on the local server.</P>
    </div>
  );
}

export function DocDeveloperPage() {
  return (
    <div>
      <DocHeading title="Developer Guide" />
      <CodeBlock
        title="Quality gates"
        code={`npm run lint
npm run typecheck
npm run test:unit
npm run build:guardian-mesh
npm run guardian:verify
npm run guardian:scenarios`}
      />
    </div>
  );
}

export function DocContributingPage() {
  return (
    <div>
      <DocHeading title="Contributing" />
      <P>Fork, branch, run quality gates, open a PR. Do not commit .env or Telegram tokens.</P>
      <P>License: Apache-2.0</P>
    </div>
  );
}

export const DOC_PAGE_COMPONENTS: Record<string, () => ReactNode> = {
  "": DocOverviewPage,
  "getting-started": DocGettingStartedPage,
  installation: DocInstallationPage,
  "first-run": DocFirstRunPage,
  architecture: DocArchitecturePage,
  "threat-detection": DocThreatDetectionPage,
  "evidence-chain": DocEvidenceChainPage,
  telegram: DocTelegramPage,
  troubleshooting: DocTroubleshootingPage,
  faq: DocFaqPage,
  "qvac-integration": DocQvacPage,
  "developer-guide": DocDeveloperPage,
  contributing: DocContributingPage,
};

export function DocArticlePage({ slug }: { slug: string }) {
  const Component = DOC_PAGE_COMPONENTS[slug];
  if (!Component) {
    return <p className="text-ink-muted">Page not found.</p>;
  }
  return <Component />;
}
