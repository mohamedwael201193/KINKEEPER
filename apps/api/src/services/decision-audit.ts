import type {
  AgentDecisionAudit,
  CognoscenteAnalysis,
  DecisionBundle,
  DecisionBundleEvidenceRef,
  SentinelClassification,
} from "@kinkeeper/shared";

export interface InferenceTiming {
  latencyMs: number;
  ttftSec?: number;
  tps?: number;
}

export function buildSentinelEvidenceRefs(params: {
  transcript: string;
  audioHash: string;
  classification: SentinelClassification;
}): DecisionBundleEvidenceRef[] {
  const refs: DecisionBundleEvidenceRef[] = [
    { type: "audio_hash", ref: params.audioHash },
    {
      type: "transcript",
      ref: "inputs.transcript",
      excerpt: params.transcript.slice(0, 280),
    },
  ];

  for (const flag of params.classification.redFlags ?? []) {
    refs.push({ type: "red_flag", ref: flag, excerpt: flag });
  }

  for (const technique of params.classification.techniquesIdentified ?? []) {
    refs.push({ type: "red_flag", ref: technique, excerpt: technique });
  }

  return refs;
}

export function buildCognoscenteEvidenceRefs(params: {
  transcript: string;
  audioHash: string;
  analysis: CognoscenteAnalysis;
}): DecisionBundleEvidenceRef[] {
  const refs: DecisionBundleEvidenceRef[] = [
    { type: "audio_hash", ref: params.audioHash },
    {
      type: "transcript",
      ref: "inputs.transcript",
      excerpt: params.transcript.slice(0, 280),
    },
    {
      type: "metric",
      ref: "composite_deviation",
      excerpt: String(params.analysis.compositeDeviation),
    },
  ];

  for (const marker of params.analysis.confabulationMarkers ?? []) {
    refs.push({ type: "red_flag", ref: marker, excerpt: marker });
  }

  return refs;
}

export function buildAgentDecisionAudit(params: {
  bundle: DecisionBundle;
  reasoning: string;
  classification: string;
  confidence: number;
  timing: InferenceTiming;
}): AgentDecisionAudit {
  return {
    agent: params.bundle.agent,
    bundleId: params.bundle.bundleId,
    chainHash: params.bundle.hash,
    previousChainHash: params.bundle.previousHash,
    confidence: params.confidence,
    reasoning: params.reasoning,
    classification: params.classification,
    modelUsed: params.bundle.reasoning.modelSrc,
    modelVersion: params.bundle.reasoning.modelVersion,
    latencyMs: params.timing.latencyMs,
    ttftSec: params.timing.ttftSec,
    tps: params.timing.tps,
    evidenceReferences: params.bundle.reasoning.evidenceReferences ?? [],
    decidedAt: params.bundle.timestamp,
  };
}
