import type { DecisionBundleEvidenceRef } from "./decision-bundle.js";

/** Standard audit record attached to every Sentinel / Cognoscente decision. */
export interface AgentDecisionAudit {
  agent: string;
  bundleId: string;
  chainHash: string;
  previousChainHash: string;
  confidence: number;
  reasoning: string;
  classification: string;
  modelUsed: string;
  modelVersion: string;
  latencyMs: number;
  ttftSec?: number;
  tps?: number;
  evidenceReferences: DecisionBundleEvidenceRef[];
  decidedAt: string;
  [key: string]: unknown;
}

export interface EvidencePacketContent {
  packetId: string;
  alertId: string;
  familyId: string;
  elderId: string | null;
  agent: string;
  severity: string;
  title: string;
  summary: string;
  transcript: string | null;
  decision: AgentDecisionAudit;
  chainVerification: {
    bundleHash: string;
    previousHash: string;
    chainValid: boolean;
  };
  timestamps: {
    alertCreatedAt: string;
    bundleCreatedAt: string;
    packetGeneratedAt: string;
  };
  deepLink: string;
  apiLink: string;
}
