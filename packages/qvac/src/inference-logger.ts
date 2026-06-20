import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@kinkeeper/db";
import {
  INFERENCE_LOG_CSV_HEADER,
  type InferenceLogEntry,
  type InferenceOperation,
} from "@kinkeeper/shared";

function resolveEvidenceDir(): string {
  return process.env.EVIDENCE_DIR ?? join(process.cwd(), "evidence");
}

function csvEscape(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function formatInferenceLogCsvRow(entry: InferenceLogEntry): string {
  return [
    entry.timestamp,
    entry.familyId ?? "",
    entry.deviceId ?? "",
    entry.modelSrc,
    entry.operation,
    entry.promptTokens,
    entry.completionTokens,
    entry.ttftSec ?? "",
    entry.tps ?? "",
    entry.delegateProvider ?? "",
    entry.delegateFallbackUsed,
    entry.bundleId ?? "",
  ]
    .map(csvEscape)
    .join(",");
}

export class InferenceLogger {
  private readonly csvPath: string;
  private readonly metadataPath: string;

  constructor(private readonly prisma?: PrismaClient) {
    const evidenceDir = resolveEvidenceDir();
    if (!existsSync(evidenceDir)) {
      mkdirSync(evidenceDir, { recursive: true });
    }
    this.csvPath = join(evidenceDir, "inference-log.csv");
    this.metadataPath = join(evidenceDir, "inference-metadata.jsonl");
    if (!existsSync(this.csvPath)) {
      appendFileSync(this.csvPath, `${INFERENCE_LOG_CSV_HEADER}\n`, "utf8");
    }
  }

  async log(
    entry: Omit<InferenceLogEntry, "timestamp"> & { timestamp?: string },
  ): Promise<InferenceLogEntry> {
    const fullEntry: InferenceLogEntry = {
      timestamp: entry.timestamp ?? new Date().toISOString(),
      familyId: entry.familyId ?? null,
      deviceId: entry.deviceId ?? null,
      modelSrc: entry.modelSrc,
      operation: entry.operation,
      promptTokens: entry.promptTokens,
      completionTokens: entry.completionTokens,
      ttftSec: entry.ttftSec,
      tps: entry.tps,
      delegateProvider: entry.delegateProvider ?? null,
      delegateFallbackUsed: entry.delegateFallbackUsed,
      bundleId: entry.bundleId ?? null,
      stopReason: entry.stopReason ?? null,
      backendDevice: entry.backendDevice ?? null,
      transcribeStats: entry.transcribeStats ?? null,
    };

    appendFileSync(this.csvPath, `${formatInferenceLogCsvRow(fullEntry)}\n`, "utf8");

    const metadataFields = {
      stopReason: fullEntry.stopReason,
      backendDevice: fullEntry.backendDevice,
      transcribeStats: fullEntry.transcribeStats,
    };
    if (
      metadataFields.stopReason ||
      metadataFields.backendDevice ||
      metadataFields.transcribeStats
    ) {
      appendFileSync(
        this.metadataPath,
        `${JSON.stringify({
          timestamp: fullEntry.timestamp,
          modelSrc: fullEntry.modelSrc,
          operation: fullEntry.operation,
          ...metadataFields,
        })}\n`,
        "utf8",
      );
    }

    if (this.prisma) {
      await this.prisma.inferenceLog.create({
        data: {
          familyId: fullEntry.familyId,
          deviceId: fullEntry.deviceId,
          timestamp: new Date(fullEntry.timestamp),
          modelSrc: fullEntry.modelSrc,
          operation: fullEntry.operation,
          promptTokens: fullEntry.promptTokens,
          completionTokens: fullEntry.completionTokens,
          ttftSec: fullEntry.ttftSec,
          tps: fullEntry.tps,
          delegateProvider: fullEntry.delegateProvider,
          delegateFallbackUsed: fullEntry.delegateFallbackUsed,
          bundleId: fullEntry.bundleId,
        },
      });
    }

    return fullEntry;
  }

  getCsvPath(): string {
    return this.csvPath;
  }

  getMetadataPath(): string {
    return this.metadataPath;
  }
}

export interface CompletionStatsLike {
  timeToFirstToken?: number;
  tokensPerSecond?: number;
  promptTokens?: number;
  completionTokens?: number;
  generatedTokens?: number;
  totalTokens?: number;
  backendDevice?: string;
}

export function statsFromCompletion(finalStats: CompletionStatsLike | undefined): {
  ttftSec: number | null;
  tps: number | null;
  promptTokens: number;
  completionTokens: number;
} {
  const promptTokens = finalStats?.promptTokens ?? 0;
  const completionTokens =
    finalStats?.completionTokens ??
    finalStats?.generatedTokens ??
    (finalStats?.totalTokens ? Math.max(0, finalStats.totalTokens - promptTokens) : 0);

  return {
    ttftSec:
      finalStats?.timeToFirstToken !== undefined
        ? finalStats.timeToFirstToken / 1000
        : null,
    tps: finalStats?.tokensPerSecond ?? null,
    promptTokens,
    completionTokens,
  };
}

export type { InferenceOperation };
