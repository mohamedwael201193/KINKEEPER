import type { CoreAgentName } from "../constants/agents.js";

export interface DecisionBundleDelegation {
  providerPublicKey: string;
  consumerPublicKey: string;
  inputHash: string;
  outputHash: string;
  providerSignature: string | null;
  fallbackToLocal: boolean;
  fallbackUsed: boolean;
}

export interface DecisionBundleToolCall {
  name: string;
  arguments: Record<string, unknown>;
  result: unknown;
}

export interface DecisionBundleEvidenceRef {
  type: "transcript" | "audio_hash" | "inference_log" | "red_flag" | "metric";
  ref: string;
  excerpt?: string;
}

export interface DecisionBundleReasoning {
  modelSrc: string;
  modelVersion: string;
  thinkingText: string;
  rawDeltas?: string[];
  classification?: string;
  confidence?: number;
  latencyMs?: number;
  ttftSec?: number;
  tps?: number;
  evidenceReferences?: DecisionBundleEvidenceRef[];
}

export interface DecisionBundleInputs {
  audioClipHash?: string;
  audioClipUrl?: string;
  transcript?: string;
  userMessage?: string;
  priorContext?: unknown;
}

export interface DecisionBundle {
  bundleId: string;
  timestamp: string;
  agent: CoreAgentName;
  trigger: string;
  inputs: DecisionBundleInputs;
  reasoning: DecisionBundleReasoning;
  delegation?: DecisionBundleDelegation;
  toolCalls: DecisionBundleToolCall[];
  action: string;
  device: string;
  hash: string;
  previousHash: string;
}

export interface DecisionBundleRecord extends DecisionBundle {
  familyId: string;
  createdAt: Date;
}
