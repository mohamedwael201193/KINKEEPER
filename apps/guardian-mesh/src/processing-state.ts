import type { PipelineStageResult } from "@kinkeeper/guardian-mesh";

export type StepStatus = "pending" | "active" | "complete" | "failed" | "skipped";

export interface ProcessingStep {
  id: string;
  label: string;
  status: StepStatus;
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

const AUDIO_STEPS: ProcessingStep[] = [
  { id: "upload", label: "Uploading", status: "pending" },
  { id: "stt", label: "Transcribing", status: "pending" },
  { id: "rag", label: "Searching Family Context", status: "pending" },
  { id: "risk", label: "Building Risk Assessment", status: "pending" },
  { id: "evidence", label: "Generating Evidence", status: "pending" },
  { id: "alert", label: "Sending Telegram Alert", status: "pending" },
  { id: "done", label: "Completed", status: "pending" },
];

const IMAGE_STEPS: ProcessingStep[] = [
  { id: "upload", label: "Uploading", status: "pending" },
  { id: "ocr", label: "Running OCR", status: "pending" },
  { id: "rag", label: "Searching Family Context", status: "pending" },
  { id: "risk", label: "Building Risk Assessment", status: "pending" },
  { id: "evidence", label: "Generating Evidence", status: "pending" },
  { id: "alert", label: "Sending Telegram Alert", status: "pending" },
  { id: "done", label: "Completed", status: "pending" },
];

let state: ProcessingState = idleState();

function idleState(): ProcessingState {
  return {
    active: false,
    inputType: null,
    steps: [],
    startedAt: null,
    completedAt: null,
    error: null,
  };
}

function cloneSteps(template: ProcessingStep[]): ProcessingStep[] {
  return template.map((s) => ({ ...s }));
}

function setStep(id: string, patch: Partial<ProcessingStep>): void {
  state.steps = state.steps.map((s) => (s.id === id ? { ...s, ...patch } : s));
}

function activateNext(completedId: string): void {
  const idx = state.steps.findIndex((s) => s.id === completedId);
  for (let i = idx + 1; i < state.steps.length; i++) {
    const next = state.steps[i];
    if (next && next.status === "pending") {
      setStep(next.id, { status: "active" });
      return;
    }
  }
}

function mapStageToStepId(stage: string): string {
  if (stage === "stt") return "stt";
  if (stage === "ocr") return "ocr";
  if (stage === "rag") return "rag";
  if (stage === "risk") return "risk";
  if (stage === "evidence_bundle" || stage === "evidence_packet") return "evidence";
  if (stage === "tts" || stage === "telegram") return "alert";
  return stage;
}

export function beginProcessing(inputType: "audio" | "image"): void {
  const template = inputType === "audio" ? AUDIO_STEPS : IMAGE_STEPS;
  state = {
    active: true,
    inputType,
    steps: cloneSteps(template),
    startedAt: new Date().toISOString(),
    completedAt: null,
    error: null,
  };
  setStep("upload", { status: "active" });
}

export function markUploadComplete(): void {
  setStep("upload", { status: "complete" });
  const next = state.inputType === "audio" ? "stt" : "ocr";
  setStep(next, { status: "active" });
}

export function applyEngineStage(stage: PipelineStageResult): void {
  const stepId = mapStageToStepId(stage.stage);
  const status: StepStatus =
    stage.status === "complete" ? "complete" : stage.status === "failed" ? "failed" : "skipped";
  setStep(stepId, { status, latencyMs: stage.latencyMs, detail: stage.detail });
  if (status === "complete") activateNext(stepId);
}

export function completeProcessing(): void {
  setStep("done", { status: "complete" });
  state.active = false;
  state.completedAt = new Date().toISOString();
}

export function failProcessing(error: string): void {
  state.error = error;
  state.active = false;
  state.completedAt = new Date().toISOString();
  state.steps = state.steps.map((s) =>
    s.status === "active" ? { ...s, status: "failed" as StepStatus } : s,
  );
}

export function getProcessingState(): ProcessingState {
  return state;
}
