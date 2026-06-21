export const SITE = {
  name: "Guardian Mesh",
  product: "KINKEEPER Guardian Mesh",
  tagline: "Local-first fraud & social engineering firewall for families.",
  github: "https://github.com/mohamedwael201193/KINKEEPER",
  judgeUrl: "http://127.0.0.1:8787/",
  judgeLauncher: "release/GuardianMesh-Judge/Start-Guardian-Mesh.bat",
  nodeVersion: ">=22.17.0",
  npmVersion: ">=10.9.0",
} as const;

export type Verdict = "ALLOW" | "WARN" | "BLOCK";

export interface Scenario {
  id: string;
  name: string;
  type: "audio" | "image";
  expectedVerdict: Verdict;
  description: string;
  threat: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "A",
    name: "IRS scam call",
    type: "audio",
    expectedVerdict: "BLOCK",
    description: "Government impersonation demanding gift cards",
    threat: "IRS / government impersonation",
  },
  {
    id: "B",
    name: "Fake bank invoice",
    type: "image",
    expectedVerdict: "BLOCK",
    description: "Urgent wire/gift-card payment notice",
    threat: "Fake invoice / wire fraud",
  },
  {
    id: "C",
    name: "Tech support scam",
    type: "audio",
    expectedVerdict: "BLOCK",
    description: "Remote access demand",
    threat: "Tech support social engineering",
  },
  {
    id: "D",
    name: "Grandparent scam",
    type: "audio",
    expectedVerdict: "BLOCK",
    description: "Fake grandchild bail request",
    threat: "Grandparent / bail fraud",
  },
  {
    id: "E",
    name: "Crypto scam",
    type: "audio",
    expectedVerdict: "BLOCK",
    description: "Guaranteed crypto returns",
    threat: "Crypto investment fraud",
  },
  {
    id: "F",
    name: "Fake healthcare notice",
    type: "image",
    expectedVerdict: "BLOCK",
    description: "Medicare suspension + gift card fee",
    threat: "Healthcare impersonation",
  },
  {
    id: "G",
    name: "Safe family check-in",
    type: "audio",
    expectedVerdict: "ALLOW",
    description: "Benign daily wellness check-in",
    threat: "Benign daily contact",
  },
  {
    id: "H",
    name: "Safe pharmacy receipt",
    type: "image",
    expectedVerdict: "ALLOW",
    description: "Paid pharmacy receipt — no urgency",
    threat: "Benign document",
  },
  {
    id: "W",
    name: "Suspicious utility verify",
    type: "audio",
    expectedVerdict: "WARN",
    description: "Urgent account verify — ambiguous, not confirmed fraud",
    threat: "Ambiguous verification request",
  },
];

export const PROBLEMS = [
  {
    title: "IRS & government scams",
    body: "Callers impersonate the IRS, Social Security, or Medicare. They create urgency and demand gift cards or wire transfers before a caregiver can intervene.",
  },
  {
    title: "Grandparent scams",
    body: "A panicked voice claims a grandchild is in jail or hospital. The elder is told to stay quiet and send money immediately.",
  },
  {
    title: "Fake invoices",
    body: "Official-looking letters demand urgent payment by wire or gift card. OCR-readable fraud that generic spam filters never see.",
  },
  {
    title: "Crypto fraud",
    body: "Guaranteed returns and pressure to move funds quickly — social engineering tuned for fear and greed.",
  },
  {
    title: "Social engineering",
    body: "“Don’t tell the bank.” “Act now.” Attackers exploit trust and isolation, not just technical vulnerabilities.",
  },
];

export const PIPELINE_STAGES = [
  { id: "input", label: "Audio / Image", detail: "WAV call recording or PNG/JPEG document" },
  { id: "stt-ocr", label: "STT / OCR", detail: "Whisper transcription or Latin OCR via QVAC" },
  { id: "rag", label: "RAG", detail: "Family safety notes via GTE embeddings + HyperDB" },
  { id: "risk", label: "Risk analysis", detail: "Qwen3-600M + MedPsy escalation + deterministic rules" },
  { id: "evidence", label: "Evidence chain", detail: "SHA-256 linked bundles in LocalArchivist" },
  { id: "alert", label: "Telegram alert", detail: "Optional caregiver message with Acknowledge" },
];

export interface QvacCapability {
  id: string;
  label: string;
  model: string;
  implementation: string;
  verifiedBy: string;
}

export const QVAC_CAPABILITIES: QvacCapability[] = [
  {
    id: "stt",
    label: "STT",
    model: "WHISPER_TINY",
    implementation: "QvacService.runTranscribe → guardian-mesh-engine.ts",
    verifiedBy: "Scenario A",
  },
  {
    id: "ocr",
    label: "OCR",
    model: "OCR_LATIN_RECOGNIZER_1",
    implementation: "QvacService.runOcr → guardian-mesh-engine.ts",
    verifiedBy: "Scenario B",
  },
  {
    id: "embeddings",
    label: "Embeddings",
    model: "GTE_LARGE_FP16",
    implementation: "FamilyRagService → packages/guardian-mesh/src/rag/",
    verifiedBy: "RAG hits in evidence bundles",
  },
  {
    id: "rag",
    label: "RAG",
    model: "HyperDB search",
    implementation: "QvacService rag ingest/search",
    verifiedBy: "Seeded family safety documents",
  },
  {
    id: "llm",
    label: "LLM",
    model: "QWEN3_600M_INST_Q4",
    implementation: "RiskAnalyzer → risk-analyzer.ts",
    verifiedBy: "All scenarios",
  },
  {
    id: "medpsy",
    label: "MedPsy",
    model: "MedPsy 1.7B GGUF (escalation)",
    implementation: "Escalation on UNCERTAIN / low-confidence SCAM",
    verifiedBy: "preload({ includeMedPsy: true })",
  },
  {
    id: "tts",
    label: "TTS",
    model: "TTS_EN_SUPERTONIC_Q8_0",
    implementation: "runTextToSpeech for WARN/BLOCK verdicts",
    verifiedBy: "Scenarios A–F",
  },
  {
    id: "profiler",
    label: "Profiler",
    model: "QVAC verbose profiler",
    implementation: "enableProfiler / exportProfilerSummary",
    verifiedBy: "Proof snapshot / Judge UI",
  },
  {
    id: "provider",
    label: "Provider key",
    model: "QVAC provider public key",
    implementation: "getProviderPublicKey() → GET /api/proof",
    verifiedBy: "guardian:verify",
  },
];

export interface VerifiedCommand {
  command: string;
  description: string;
  output?: string;
}

export const VERIFIED_COMMANDS: VerifiedCommand[] = [
  { command: "npm install", description: "Install monorepo dependencies from repository root." },
  { command: "copy .env.example .env", description: "Create local environment file (Windows). Use cp on macOS/Linux." },
  { command: "npm run build:guardian-mesh", description: "Build shared, QVAC wrapper, engine, and Judge HTTP app." },
  { command: "npm run dev:guardian-mesh", description: "Start Judge Console at http://127.0.0.1:8787/." },
  { command: "npm run guardian:assets", description: "Generate synthetic scenario WAV/PNG assets (PowerShell)." },
  { command: "npm run guardian:verify", description: "End-to-end STT + OCR + chain verify → evidence/guardian-mesh-verify.json" },
  { command: "npm run guardian:scenarios", description: "Run scenarios A–H + W; expect mismatches: []" },
  { command: "npm run guardian:telegram", description: "Send alert + verify Acknowledge → evidence/telegram-verify.json" },
  { command: "npm run telegram:discover", description: "Discover Telegram chat ID after messaging your bot." },
  { command: "npm run lint", description: "ESLint across the monorepo." },
  { command: "npm run typecheck", description: "TypeScript check all workspaces." },
  { command: "npm run test:unit", description: "14 unit tests (vitest)." },
  { command: "npm run test:integration", description: "1 integration test (vitest)." },
  {
    command: "npm run pack -w @kinkeeper/guardian-desktop",
    description: "Build unsigned Windows portable EXE (set CSC_IDENTITY_AUTO_DISCOVERY=false).",
  },
];

export const FAQ = [
  {
    q: "Does Guardian Mesh send my data to the cloud?",
    a: "The Judge demo (apps/guardian-mesh) runs QVAC inference in-process on localhost. No remote LLM API is called. Telegram alerts optionally use the Telegram Bot API when configured.",
  },
  {
    q: "What verdicts can it return?",
    a: "Three tiers: ALLOW, WARN, and BLOCK — merged from deterministic rules and local LLM output in deterministic-rules.ts and risk-analyzer.ts.",
  },
  {
    q: "Do I need Telegram?",
    a: "No. Without TELEGRAM_BOT_TOKEN and a chat ID, the pipeline completes locally and the telegram stage is marked skipped.",
  },
  {
    q: "What Node version is required?",
    a: "Node ≥ 22.17 and npm ≥ 10.9 per root package.json engines (QVAC compatible).",
  },
  {
    q: "Can it run offline?",
    a: "After QVAC models are cached (~2–4 GB first download), core inference runs offline. Telegram requires internet when enabled.",
  },
  {
    q: "Are demo assets real recordings?",
    a: "No. Synthetic WAV/PNG files from npm run guardian:assets. Inference on them is real QVAC — not mocked JSON.",
  },
  {
    q: "What is the 3-Min Judge Demo?",
    a: "One UI button running scenarios A (BLOCK), B (BLOCK), and G (ALLOW) via POST /api/demo/judge-flow on the Judge Console.",
  },
  {
    q: "How is evidence tampering detected?",
    a: "Each incident commits a SHA-256 bundle linked to the previous hash. verifyChain() validates ordering and integrity in LocalArchivist.",
  },
];

export const MERMAID = {
  systemArchitecture: `flowchart TB
  subgraph Device["User device localhost"]
    UI[Judge Console :8787]
    APP[apps/guardian-mesh]
    ENG[GuardianMeshEngine]
    UI --> APP --> ENG
  end
  subgraph QVAC["QVAC in-process"]
    STT[WHISPER_TINY]
    OCR[OCR_LATIN_RECOGNIZER_1]
    EMB[GTE_LARGE_FP16]
    LLM[QWEN3_600M_INST_Q4]
    MED[MedPsy escalation]
    TTS[TTS_EN_SUPERTONIC_Q8_0]
  end
  subgraph Evidence["Local evidence"]
    ARCH[LocalArchivist]
    PKTS[Evidence packets]
  end
  subgraph Notify["Optional"]
    TG[Telegram Bot API]
  end
  ENG --> STT & OCR & EMB & LLM & MED & TTS
  ENG --> ARCH --> PKTS
  ENG --> TG`,

  dataFlow: `flowchart LR
  A[Audio WAV or Image PNG/JPEG] --> B[STT or OCR]
  B --> C[RAG family context]
  C --> D[Risk engine]
  D --> E[Evidence bundle]
  E --> F[TTS if WARN/BLOCK]
  F --> G[Telegram if configured]`,

  fraudDetection: `flowchart TD
  T[Transcript or OCR text] --> S[sanitizeUntrustedContent]
  S --> R[Deterministic rules]
  S --> L[LLM Qwen3-600M]
  L --> M{UNCERTAIN?}
  M -->|yes| P[MedPsy escalation]
  M -->|no| V[mergeVerdict]
  P --> V
  R --> V
  V --> OUT[ALLOW / WARN / BLOCK]`,

  evidenceChain: `flowchart TD
  I[Incident processed] --> B[Build evidence bundle]
  B --> H[SHA-256 hash]
  H --> L[Link to previous bundle hash]
  L --> S[Store in LocalArchivist]
  S --> V[verifyChain on demand]`,

  telegramFlow: `sequenceDiagram
  participant G as Guardian Mesh
  participant T as Telegram
  participant C as Caregiver
  G->>T: Send alert with Acknowledge button
  T->>C: Push notification
  C->>T: Tap Acknowledge
  T->>G: Callback ack:uuid
  G->>G: Record in telegram-acks.jsonl`,

  judgeDemo: `sequenceDiagram
  participant J as Judge
  participant UI as Console :8787
  participant E as Engine
  participant Q as QVAC
  J->>UI: Start-Guardian-Mesh.bat
  J->>UI: 3-Min Judge Demo
  UI->>E: Scenarios A B G
  E->>Q: STT OCR RAG LLM
  Q-->>E: Verdicts
  E-->>UI: Evidence + proof
  J->>UI: Verify Chain
  J->>UI: Refresh QVAC Proof`,
} as const;
