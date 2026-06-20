import type { PublicProofData } from "@/services/api-client";

export interface SentinelProof {
  recording: {
    transcript: string;
    finalClassification: string;
    finalConfidence: number;
  };
  alert: {
    title: string;
    summary: string;
    severity: string;
    type: string;
  };
  bundle: {
    hash: string;
    reasoning: {
      confidence: number;
      classification: string;
      thinkingText?: string;
      modelSrc?: string;
    };
  };
}

export interface CognoscenteProof {
  checkIn: {
    transcript: string;
    wordFindingLatencySec: number;
    compositeDeviation: number;
    alertTriggered: boolean;
  };
  baselines: Array<{
    metric: string;
    baselineValue: number;
    stddev: number;
    sampleCount: number;
  }>;
  trends: Array<{
    date: string;
    wordFindingLatencySec: number;
    compositeDeviation: number;
    alertTriggered: boolean;
  }>;
  bundle: {
    reasoning: {
      modelSrc?: string;
      classification?: string;
      confidence?: number;
    };
  };
}

export interface EvidenceSystemProof {
  chain: { valid: boolean; length: number };
  bundles: Array<{
    id: string;
    agent: string;
    hash: string;
    previousHash: string;
    trigger: string;
  }>;
}

export interface QvacRuntimeProof {
  sdkVersion: string;
  providerPublicKey: string;
  steps: Array<{
    name: string;
    ok: boolean;
    durationMs?: number;
    details?: Record<string, unknown>;
  }>;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function parseSentinel(raw: unknown): SentinelProof | null {
  const root = asRecord(raw);
  const recording = asRecord(root?.recording);
  const alert = asRecord(root?.alert);
  const bundle = asRecord(root?.bundle);
  const reasoning = asRecord(bundle?.reasoning);

  const transcript = asString(recording?.transcript);
  const finalConfidence = asNumber(recording?.finalConfidence);
  const title = asString(alert?.title);
  const summary = asString(alert?.summary);
  const hash = asString(bundle?.hash);
  const confidence = asNumber(reasoning?.confidence);

  if (!transcript || finalConfidence === null || !title || !summary || !hash || confidence === null) {
    return null;
  }

  return {
    recording: {
      transcript,
      finalClassification: asString(recording?.finalClassification) ?? "SCAM",
      finalConfidence,
    },
    alert: {
      title,
      summary,
      severity: asString(alert?.severity) ?? "critical",
      type: asString(alert?.type) ?? "Threat Detection",
    },
    bundle: {
      hash,
      reasoning: {
        confidence,
        classification: asString(reasoning?.classification) ?? "SCAM",
        thinkingText: asString(reasoning?.thinkingText) ?? undefined,
        modelSrc: asString(reasoning?.modelSrc) ?? undefined,
      },
    },
  };
}

export function parseCognoscente(raw: unknown): CognoscenteProof | null {
  const root = asRecord(raw);
  const checkIn = asRecord(root?.checkIn);
  const bundle = asRecord(root?.bundle);
  const reasoning = asRecord(bundle?.reasoning);

  const transcript = asString(checkIn?.transcript);
  const wordFindingLatencySec = asNumber(checkIn?.wordFindingLatencySec);
  const compositeDeviation = asNumber(checkIn?.compositeDeviation);

  if (!transcript || wordFindingLatencySec === null || compositeDeviation === null) {
    return null;
  }

  const baselines = asArray(root?.baselines)
    .map((item) => {
      const row = asRecord(item);
      const metric = asString(row?.metric);
      const baselineValue = asNumber(row?.baselineValue);
      if (!metric || baselineValue === null) return null;
      return {
        metric,
        baselineValue,
        stddev: asNumber(row?.stddev) ?? 0,
        sampleCount: asNumber(row?.sampleCount) ?? 0,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const trends = asArray(root?.trends)
    .map((item) => {
      const row = asRecord(item);
      const date = asString(row?.date);
      const latency = asNumber(row?.wordFindingLatencySec);
      const deviation = asNumber(row?.compositeDeviation);
      if (!date || latency === null || deviation === null) return null;
      return {
        date,
        wordFindingLatencySec: latency,
        compositeDeviation: deviation,
        alertTriggered: asBoolean(row?.alertTriggered) ?? false,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  return {
    checkIn: {
      transcript,
      wordFindingLatencySec,
      compositeDeviation,
      alertTriggered: asBoolean(checkIn?.alertTriggered) ?? false,
    },
    baselines,
    trends,
    bundle: {
      reasoning: {
        modelSrc: asString(reasoning?.modelSrc) ?? undefined,
        classification: asString(reasoning?.classification) ?? undefined,
        confidence: asNumber(reasoning?.confidence) ?? undefined,
      },
    },
  };
}

export function parseEvidenceSystem(raw: unknown): EvidenceSystemProof | null {
  const root = asRecord(raw);
  const chain = asRecord(root?.chain);
  const valid = asBoolean(chain?.valid);
  const length = asNumber(chain?.length);

  if (valid === null || length === null) return null;

  const bundles = asArray(root?.bundles)
    .map((item) => {
      const row = asRecord(item);
      const id = asString(row?.id);
      const agent = asString(row?.agent);
      const hash = asString(row?.hash);
      const previousHash = asString(row?.previousHash);
      const trigger = asString(row?.trigger);
      if (!id || !agent || !hash || previousHash === null || !trigger) return null;
      return { id, agent, hash, previousHash, trigger };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  return { chain: { valid, length }, bundles };
}

export function parseQvacRuntime(raw: unknown): QvacRuntimeProof | null {
  const root = asRecord(raw);
  const sdkVersion = asString(root?.sdkVersion);
  const providerPublicKey = asString(root?.providerPublicKey);

  if (!sdkVersion || !providerPublicKey) return null;

  const steps = asArray(root?.steps)
    .map((item) => {
      const row = asRecord(item);
      const name = asString(row?.name);
      const ok = asBoolean(row?.ok);
      if (!name || ok === null) return null;
      const details = asRecord(row?.details);
      const durationMs = asNumber(row?.durationMs);
      return { name, ok, durationMs: durationMs ?? undefined, details: details ?? undefined };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  return { sdkVersion, providerPublicKey, steps };
}

export function extractReasoningExcerpt(thinkingText: string | undefined, maxLen = 220): string {
  if (!thinkingText) return "";
  const cleaned = thinkingText.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen).trim()}…`;
}

export function formatMedPsyModel(modelSrc: string | undefined): string {
  if (!modelSrc) return "MedPsy";
  const parts = modelSrc.replace(/\\/g, "/").split("/");
  const filename = parts[parts.length - 1] ?? modelSrc;
  const match = filename.match(/medpsy[^.]*/i);
  return match ? match[0] : "MedPsy 1.7B";
}

export function truncateHash(hash: string, head = 8, tail = 6): string {
  if (hash.length <= head + tail + 1) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

export function riskScoreFromConfidence(confidence: number): number {
  return Math.round(confidence * 100);
}

export type ParsedProof = {
  sentinel: SentinelProof | null;
  cognoscente: CognoscenteProof | null;
  evidenceSystem: EvidenceSystemProof | null;
  qvacRuntime: QvacRuntimeProof | null;
};

export function parsePublicProof(data: PublicProofData | undefined): ParsedProof {
  return {
    sentinel: parseSentinel(data?.sentinel),
    cognoscente: parseCognoscente(data?.cognoscente),
    evidenceSystem: parseEvidenceSystem(data?.evidenceSystem),
    qvacRuntime: parseQvacRuntime(data?.qvacRuntime),
  };
}
