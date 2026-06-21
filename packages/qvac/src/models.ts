import { existsSync } from "node:fs";
import { join } from "node:path";
import type { startQVACProvider } from "@qvac/sdk";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- SDK module shape for dynamic import cache
export type QvacSdkModule = typeof import("@qvac/sdk");

export type ModelSource = string | { readonly name: string };

export function modelLabel(modelSrc: ModelSource): string {
  return typeof modelSrc === "string" ? modelSrc : modelSrc.name;
}

let sdkModule: QvacSdkModule | null = null;

export async function getQvacSdk(): Promise<QvacSdkModule> {
  if (!sdkModule) {
    sdkModule = await import("@qvac/sdk");
  }
  return sdkModule;
}

async function getRegistryModels(): Promise<{
  QWEN3_600M_INST_Q4: ModelSource;
  WHISPER_TINY: ModelSource;
  GTE_LARGE_FP16: ModelSource;
  OCR_LATIN_RECOGNIZER_1: ModelSource;
  TTS_EN_SUPERTONIC_Q8_0: ModelSource;
}> {
  const sdk = await getQvacSdk();
  const models = sdk as Record<string, ModelSource | undefined>;
  const qwen = models.QWEN3_600M_INST_Q4;
  const whisper = models.WHISPER_TINY;
  const embed = models.GTE_LARGE_FP16;
  const ocr = models.OCR_LATIN_RECOGNIZER_1;
  const tts = models.TTS_EN_SUPERTONIC_Q8_0;
  if (!qwen || !whisper || !embed || !ocr || !tts) {
    throw new Error(
      "QVAC SDK model constants missing (QWEN3_600M, WHISPER_TINY, GTE_LARGE_FP16, OCR_LATIN_RECOGNIZER_1, TTS_EN_SUPERTONIC_Q8_0)",
    );
  }
  return {
    QWEN3_600M_INST_Q4: qwen,
    WHISPER_TINY: whisper,
    GTE_LARGE_FP16: embed,
    OCR_LATIN_RECOGNIZER_1: ocr,
    TTS_EN_SUPERTONIC_Q8_0: tts,
  };
}

export async function getDefaultLlmModel(): Promise<ModelSource> {
  const models = await getRegistryModels();
  return models.QWEN3_600M_INST_Q4;
}

export async function getDefaultWhisperModel(): Promise<ModelSource> {
  const models = await getRegistryModels();
  return models.WHISPER_TINY;
}

export async function getDefaultEmbeddingModel(): Promise<ModelSource> {
  const models = await getRegistryModels();
  return models.GTE_LARGE_FP16;
}

export async function getDefaultOcrModel(): Promise<ModelSource> {
  const models = await getRegistryModels();
  return models.OCR_LATIN_RECOGNIZER_1;
}

export async function getDefaultTtsModel(): Promise<ModelSource> {
  const models = await getRegistryModels();
  return models.TTS_EN_SUPERTONIC_Q8_0;
}

/** MedPsy GGUF via Hugging Face (official QVAC model repos). */
export const MEDPSY_4B_Q4_K_M =
  "https://huggingface.co/qvac/MedPsy-4B-GGUF/resolve/main/medpsy-4b-q4_k_m-imat.gguf";

export const MEDPSY_1_7B_Q4_K_M =
  "https://huggingface.co/qvac/MedPsy-1.7B-GGUF/resolve/main/medpsy-1.7b-q4_k_m-imat.gguf";

export const MEDPSY_4B_FILENAME = "medpsy-4b-q4_k_m-imat.gguf";
export const MEDPSY_1_7B_FILENAME = "medpsy-1.7b-q4_k_m-imat.gguf";

/** Prefer 1.7B unless MEDPSY_MODEL=4B — smaller/faster first download. */
export function medPsyVariant(): "1.7B" | "4B" {
  return process.env.MEDPSY_MODEL === "4B" ? "4B" : "1.7B";
}

export function medPsyDownloadUrl(variant: "1.7B" | "4B" = medPsyVariant()): string {
  return variant === "4B" ? MEDPSY_4B_Q4_K_M : MEDPSY_1_7B_Q4_K_M;
}

export function medPsyFilename(variant: "1.7B" | "4B" = medPsyVariant()): string {
  return variant === "4B" ? MEDPSY_4B_FILENAME : MEDPSY_1_7B_FILENAME;
}

/** Use cached local GGUF if present; otherwise HF URL for SDK download. */
export function resolveMedPsyModelSource(): string {
  const variant = medPsyVariant();
  const cacheDir = process.env.QVAC_MODELS_CACHE_DIR;
  if (cacheDir) {
    const localPath = join(cacheDir, medPsyFilename(variant));
    if (existsSync(localPath)) {
      return localPath;
    }
  }
  return medPsyDownloadUrl(variant);
}

/** Expected byte sizes from HuggingFace (for integrity check). */
export const MEDPSY_EXPECTED_BYTES: Record<"1.7B" | "4B", number> = {
  "1.7B": 1_282_178_995, // ~1223 MiB per HF Content-Length
  "4B": 2_716_068_640,
};

export function medPsyExpectedBytes(variant: "1.7B" | "4B" = medPsyVariant()): number {
  return MEDPSY_EXPECTED_BYTES[variant];
}

export type ProvideParams = NonNullable<Parameters<typeof startQVACProvider>[0]>;
