import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GuardianMeshConfig } from "./config.js";
import { getGuardianScenarios, resolveScenarioPath } from "./scenarios.js";
import type { GuardianMeshEngine } from "./pipeline/guardian-mesh-engine.js";

export function buildProofSnapshot(params: {
  engine: GuardianMeshEngine;
  config: GuardianMeshConfig;
  repoRoot: string;
  lastProfilerSummary?: string;
}): Record<string, unknown> {
  const chain = params.engine.verifyChain();
  const bundlesDir = join(params.config.evidenceDir, "bundles");
  let bundleCount = 0;
  if (existsSync(bundlesDir)) {
    bundleCount = readdirSync(bundlesDir).filter((f) => f.endsWith(".json")).length;
  }

  const ackPath = join(params.config.evidenceDir, "telegram", "telegram-acks.jsonl");
  let ackCount = 0;
  if (existsSync(ackPath)) {
    ackCount = readFileSync(ackPath, "utf8").trim().split("\n").filter(Boolean).length;
  }

  const scenarios = getGuardianScenarios(params.repoRoot).map((s) => ({
    id: s.id,
    name: s.name,
    expectedVerdict: s.expectedVerdict,
    assetExists: existsSync(resolveScenarioPath(params.repoRoot, s)),
  }));

  return {
    localExecution: true,
    qvacInProcess: true,
    providerPublicKey: params.engine.getProviderPublicKey(),
    evidenceChain: chain,
    bundleCount,
    telegramConfigured: Boolean(params.config.telegramBotToken && params.config.telegramChatId),
    telegramAckCount: ackCount,
    firewallAllowlist: params.config.firewallAllowlist ?? [],
    models: {
      whisper: "WHISPER_TINY",
      llm: "QWEN3_600M_INST_Q4",
      medPsy: "MedPsy (escalation)",
      embeddings: "GTE_LARGE_FP16",
      ocr: "OCR_LATIN_RECOGNIZER_1",
      tts: "TTS_EN_SUPERTONIC_Q8_0",
    },
    capabilities: ["STT", "OCR", "RAG", "LLM", "MedPsy", "TTS", "Profiler", "Provider", "Firewall"],
    scenarios,
    profilerSummary: params.lastProfilerSummary ?? null,
    timestamp: new Date().toISOString(),
  };
}
