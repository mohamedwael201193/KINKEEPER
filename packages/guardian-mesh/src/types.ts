export type RiskVerdict = "ALLOW" | "WARN" | "BLOCK";

export interface RiskAnalysis {
  verdict: RiskVerdict;
  classification: string;
  confidence: number;
  scamType?: string;
  reasoning: string;
  redFlags: string[];
  whatToDo: string[];
  modelUsed: string;
  latencyMs: number;
}

export interface RagContextHit {
  id: string;
  content: string;
  score: number;
}

export interface PipelineStageResult {
  stage: string;
  status: "complete" | "failed" | "skipped";
  latencyMs: number;
  detail?: string;
}

export interface PipelineHooks {
  onStage?: (stage: PipelineStageResult) => void;
}

export interface GuardianIncidentResult {
  incidentId: string;
  inputType: "audio" | "image" | "document";
  inputPath: string;
  inputHash: string;
  transcript?: string;
  extractedText?: string;
  ragContext: RagContextHit[];
  risk: RiskAnalysis;
  bundleHash: string;
  previousHash: string;
  chainValid: boolean;
  evidencePacketPath: string;
  ttsWarningPath?: string;
  telegramSent: boolean;
  telegramMessageId?: number;
  stages: PipelineStageResult[];
  profilerSummary?: string;
  createdAt: string;
}

export type GuardianUiMode = "judge" | "caregiver";
