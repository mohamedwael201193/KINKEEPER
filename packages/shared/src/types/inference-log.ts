export type InferenceOperation =
  | "completion"
  | "transcribe"
  | "transcribeStream"
  | "embed"
  | "ragIngest"
  | "ragSearch"
  | "ocr"
  | "textToSpeech"
  | "loadModel"
  | "unloadModel";

export interface InferenceLogEntry {
  timestamp: string;
  familyId: string | null;
  deviceId: string | null;
  modelSrc: string;
  operation: InferenceOperation;
  promptTokens: number;
  completionTokens: number;
  ttftSec: number | null;
  tps: number | null;
  delegateProvider: string | null;
  delegateFallbackUsed: boolean;
  bundleId: string | null;
  stopReason?: string | null;
  backendDevice?: string | null;
  transcribeStats?: Record<string, unknown> | null;
}

export const INFERENCE_LOG_CSV_HEADER =
  "timestamp,family_id,device_id,model_src,operation,prompt_tokens,completion_tokens,ttft_sec,tps,delegate_provider,delegate_fallback_used,bundle_id";
