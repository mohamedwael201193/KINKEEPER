export type RiskVerdict = "ALLOW" | "WARN" | "BLOCK";

export interface GuardianIncidentResult {
  incidentId: string;
  inputType: "audio" | "image" | "document";
  inputPath: string;
  inputHash: string;
  transcript?: string;
  extractedText?: string;
  ragContext: { id: string; content: string; score: number }[];
  risk: {
    verdict: RiskVerdict;
    classification: string;
    confidence: number;
    scamType?: string;
    reasoning: string;
    redFlags: string[];
    whatToDo: string[];
    modelUsed: string;
    latencyMs: number;
  };
  bundleHash: string;
  previousHash: string;
  chainValid: boolean;
  evidencePacketPath: string;
  ttsWarningPath?: string;
  telegramSent: boolean;
  telegramMessageId?: number;
  stages: { stage: string; status: string; latencyMs: number; detail?: string }[];
  profilerSummary?: string;
  createdAt: string;
}

export interface IncidentSummary {
  incidentId: string;
  inputType: string;
  verdict: string;
  confidence: number;
  scamType?: string;
  bundleHash: string;
  chainValid: boolean;
  telegramSent: boolean;
  telegramMessageId?: number;
  createdAt: string;
  inputPath: string;
}

export interface AppStatus {
  product: string;
  local: boolean;
  providerPublicKey: string | null;
  chain: { valid: boolean; count: number; errors: string[] };
  lastIncident: string | null;
  incidentCount: number;
  stats: {
    totalIncidents: number;
    blockCount: number;
    warnCount: number;
    allowCount: number;
    chainValid: boolean;
    telegramConfigured: boolean;
    scamCallsDetected: number;
    fraudAttemptsBlocked: number;
    evidencePackagesGenerated: number;
    telegramAlertsSent: number;
  };
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: "pending" | "active" | "complete" | "failed" | "skipped";
  latencyMs?: number;
  detail?: string;
}

export interface ProcessingState {
  active: boolean;
  inputType: "audio" | "image" | null;
  steps: ProcessingStep[];
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
}

export interface ProofSnapshot {
  localExecution: boolean;
  qvacInProcess: boolean;
  providerPublicKey: string | null;
  evidenceChain: { valid: boolean; count: number; errors: string[] };
  bundleCount: number;
  telegramConfigured: boolean;
  telegramAckCount: number;
  firewallAllowlist: string[];
  models: Record<string, string>;
  capabilities: string[];
  profilerSummary: string | null;
  timestamp: string;
}

export interface Scenario {
  id: string;
  name: string;
  type: "audio" | "image";
  relativePath: string;
  expectedVerdict: RiskVerdict;
  description: string;
}
