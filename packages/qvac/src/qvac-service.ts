import type { PrismaClient } from "@kinkeeper/db";
import type { CoreAgentName } from "@kinkeeper/shared";
import type { ModelProgressUpdate } from "@qvac/sdk";
import {
  InferenceLogger,
  statsFromCompletion,
  type CompletionStatsLike,
} from "./inference-logger.js";
import {
  getQvacSdk,
  getDefaultLlmModel,
  getDefaultWhisperModel,
  resolveMedPsyModelSource,
  modelLabel,
  type ModelSource,
  type ProvideParams,
} from "./models.js";
import { setupQvacEnvironment } from "./setup.js";

export interface TranscribeSegmentLike {
  text: string;
  startMs: number;
  endMs: number;
  append: boolean;
  id: number;
}

export interface TranscribeStatsLike {
  audioDuration?: number;
  realTimeFactor?: number;
  tokensPerSecond?: number;
  totalTokens?: number;
  totalSegments?: number;
  whisperEncodeTime?: number;
  whisperDecodeTime?: number;
  backendDevice?: number;
  gpuMemTotalMb?: number;
  gpuMemFreeMb?: number;
}

export interface QvacCompletionResult {
  contentText: string;
  thinkingText: string;
  stats: CompletionStatsLike | undefined;
  stopReason: string | undefined;
  modelSrc: string;
  modelId: string;
}

export interface QvacTranscribeResult {
  text: string;
  segments: TranscribeSegmentLike[];
  stats: TranscribeStatsLike | undefined;
  modelSrc: string;
  modelId: string;
}

export interface QvacProviderState {
  publicKey: string;
}

export class QvacService {
  private readonly logger: InferenceLogger;
  private readonly loadedModels = new Map<string, string>();
  private readonly lastDownloadPct = new Map<string, number>();
  private providerPublicKey: string | null = null;

  constructor(prisma?: PrismaClient) {
    setupQvacEnvironment();
    this.logger = new InferenceLogger(prisma);
  }

  getInferenceLogger(): InferenceLogger {
    return this.logger;
  }

  getProviderPublicKey(): string | null {
    return this.providerPublicKey;
  }

  async startProvider(params?: ProvideParams): Promise<QvacProviderState> {
    const { startQVACProvider } = await getQvacSdk();
    const result = await startQVACProvider(params ?? {});

    if (!result.success || !result.publicKey) {
      throw new Error(result.error ?? "Failed to start QVAC provider");
    }

    this.providerPublicKey = result.publicKey;
    return { publicKey: result.publicKey };
  }

  async stopProvider(): Promise<void> {
    const { stopQVACProvider } = await getQvacSdk();
    await stopQVACProvider();
    this.providerPublicKey = null;
  }

  async ensureModel(
    modelSrc: ModelSource,
    modelType?: "llm" | "whisper" | "embeddings",
    delegate?: {
      providerPublicKey: string;
      fallbackToLocal?: boolean;
      timeout?: number;
      forceNewConnection?: boolean;
    },
  ): Promise<string> {
    const label = modelLabel(modelSrc);
    const cacheKey = `${label}:${delegate?.providerPublicKey ?? "local"}`;
    const existing = this.loadedModels.get(cacheKey);
    if (existing) {
      return existing;
    }

    const { loadModel } = await getQvacSdk();
    const loadStarted = Date.now();

    const explicitType =
      modelType ??
      (typeof modelSrc === "string" && (modelSrc.startsWith("http") || modelSrc.endsWith(".gguf"))
        ? "llm"
        : undefined);

    const modelId = await loadModel({
      modelSrc,
      ...(explicitType ? { modelType: explicitType } : {}),
      ...(delegate
        ? {
            delegate: {
              providerPublicKey: delegate.providerPublicKey,
              fallbackToLocal: delegate.fallbackToLocal ?? false,
              timeout: delegate.timeout ?? 30_000,
              forceNewConnection: delegate.forceNewConnection ?? false,
            },
          }
        : {}),
      modelConfig: explicitType === "llm" ? { ctx_size: 4096 } : undefined,
      onProgress: (progress: ModelProgressUpdate) => {
        const pct = Math.floor(progress.percentage);
        const downloadedMb = ((progress as { downloaded?: number }).downloaded ?? 0) / (1024 * 1024);
        const totalMb = ((progress as { total?: number }).total ?? 0) / (1024 * 1024);
        const prev = this.lastDownloadPct.get(label) ?? -1;
        if (pct >= 100 || pct >= prev + 5 || (pct === 0 && prev < 0)) {
          this.lastDownloadPct.set(label, pct);
          const sizeHint =
            totalMb > 0 ? ` (${downloadedMb.toFixed(0)}/${totalMb.toFixed(0)} MB)` : "";
          process.stderr.write(`[qvac] ${label} download ${pct}%${sizeHint}\n`);
        }
      },
    });

    this.loadedModels.set(cacheKey, modelId);

    await this.logger.log({
      modelSrc: label,
      operation: "loadModel",
      promptTokens: 0,
      completionTokens: 0,
      ttftSec: (Date.now() - loadStarted) / 1000,
      tps: null,
      delegateProvider: delegate?.providerPublicKey ?? null,
      delegateFallbackUsed: false,
      familyId: null,
      deviceId: null,
      bundleId: null,
    });

    return modelId;
  }

  async runCompletion(params: {
    modelSrc?: ModelSource;
    history: Array<{ role: "user" | "assistant"; content: string }>;
    captureThinking?: boolean;
    familyId?: string | null;
    deviceId?: string | null;
    bundleId?: string | null;
    delegate?: {
      providerPublicKey: string;
      fallbackToLocal?: boolean;
      timeout?: number;
      forceNewConnection?: boolean;
    };
  }): Promise<QvacCompletionResult> {
    const sdk = await getQvacSdk();
    const modelSrc = params.modelSrc ?? (await getDefaultLlmModel());
    const label = modelLabel(modelSrc);
    const modelId = await this.ensureModel(modelSrc, "llm", params.delegate);

    const started = Date.now();
    const result = sdk.completion({
      modelId,
      history: params.history,
      stream: true,
      captureThinking: params.captureThinking ?? true,
    });

    let stopReasonFromEvent: string | undefined;
    for await (const event of result.events) {
      if (event.type === "completionDone") {
        if ("stopReason" in event && typeof event.stopReason === "string") {
          stopReasonFromEvent = event.stopReason;
        }
        break;
      }
    }

    const final = await result.final;
    const stopReason = final.stopReason ?? stopReasonFromEvent;
    const statValues = statsFromCompletion(final.stats);

    await this.logger.log({
      familyId: params.familyId ?? null,
      deviceId: params.deviceId ?? null,
      modelSrc: label,
      operation: "completion",
      promptTokens: statValues.promptTokens,
      completionTokens: statValues.completionTokens,
      ttftSec: statValues.ttftSec ?? (Date.now() - started) / 1000,
      tps: statValues.tps,
      delegateProvider: params.delegate?.providerPublicKey ?? null,
      delegateFallbackUsed: false,
      bundleId: params.bundleId ?? null,
      stopReason: stopReason ?? null,
      backendDevice: final.stats?.backendDevice ?? null,
    });

    return {
      contentText: final.contentText,
      thinkingText: final.thinkingText,
      stats: final.stats,
      stopReason,
      modelSrc: label,
      modelId,
    };
  }

  async runTranscribe(params: {
    audioPath: string;
    modelSrc?: ModelSource;
    familyId?: string | null;
    deviceId?: string | null;
    bundleId?: string | null;
    delegate?: {
      providerPublicKey: string;
      fallbackToLocal?: boolean;
      timeout?: number;
      forceNewConnection?: boolean;
    };
  }): Promise<QvacTranscribeResult> {
    const sdk = await getQvacSdk();
    const modelSrc = params.modelSrc ?? (await getDefaultWhisperModel());
    const label = modelLabel(modelSrc);
    const modelId = await this.ensureModel(modelSrc, "whisper", params.delegate);

    const started = Date.now();
    const segments = await sdk.transcribe({
      modelId,
      audioChunk: params.audioPath,
      metadata: true,
    });
    const text = segments.map((segment: TranscribeSegmentLike) => segment.text).join("").trim();
    const transcribeStats = extractTranscribeStats(segments);

    await this.logger.log({
      familyId: params.familyId ?? null,
      deviceId: params.deviceId ?? null,
      modelSrc: label,
      operation: "transcribe",
      promptTokens: 0,
      completionTokens: text.split(/\s+/).filter(Boolean).length,
      ttftSec: (Date.now() - started) / 1000,
      tps: transcribeStats?.tokensPerSecond ?? null,
      delegateProvider: params.delegate?.providerPublicKey ?? null,
      delegateFallbackUsed: false,
      bundleId: params.bundleId ?? null,
      transcribeStats: transcribeStats as Record<string, unknown> | undefined,
    });

    return { text, segments, stats: transcribeStats, modelSrc: label, modelId };
  }

  async unloadAll(): Promise<void> {
    const { unloadModel } = await getQvacSdk();
    for (const modelId of new Set(this.loadedModels.values())) {
      await unloadModel({ modelId, clearStorage: false });
      await this.logger.log({
        modelSrc: modelId,
        operation: "unloadModel",
        promptTokens: 0,
        completionTokens: 0,
        ttftSec: null,
        tps: null,
        delegateProvider: null,
        delegateFallbackUsed: false,
        familyId: null,
        deviceId: null,
        bundleId: null,
      });
    }
    this.loadedModels.clear();
  }

  async preloadAgentModels(options?: { includeMedPsy?: boolean }): Promise<void> {
    const includeMedPsy = options?.includeMedPsy ?? process.env.PRELOAD_MEDPSY === "true";
    await this.ensureModel(await getDefaultLlmModel(), "llm");
    await this.ensureModel(await getDefaultWhisperModel(), "whisper");
    if (includeMedPsy) {
      const medPsy = resolveMedPsyModelSource();
      process.stderr.write(`[qvac] Preloading MedPsy from ${medPsy}\n`);
      await this.ensureModel(medPsy, "llm");
    } else {
      process.stderr.write(
        "[qvac] Skipping MedPsy preload (set PRELOAD_MEDPSY=true or run npm run download:medpsy)\n",
      );
    }
  }
}

function extractTranscribeStats(segments: TranscribeSegmentLike[]): TranscribeStatsLike | undefined {
  if (segments.length === 0) {
    return undefined;
  }
  const lastSegment = segments[segments.length - 1];
  return {
    totalSegments: segments.length,
    audioDuration: lastSegment ? lastSegment.endMs / 1000 : undefined,
  };
}

export function parseJsonFromModelOutput<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1]?.trim() ?? text.trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Model output did not contain JSON object");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}

export type AgentModelRole = CoreAgentName;

export { MEDPSY_4B_Q4_K_M, MEDPSY_1_7B_Q4_K_M, resolveMedPsyModelSource, medPsyVariant } from "./models.js";
