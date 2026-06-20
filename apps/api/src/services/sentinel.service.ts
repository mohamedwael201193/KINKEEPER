import type { PrismaClient, Prisma } from "@kinkeeper/db";
import { resolveMedPsyModelSource, parseJsonFromModelOutput, type QvacClient } from "@kinkeeper/qvac";
import type { SentinelClassification } from "@kinkeeper/shared";
import type { ArchivistService } from "./archivist.service.js";
import type { CaregiverWorkflowService } from "./caregiver-workflow.service.js";
import {
  buildAgentDecisionAudit,
  buildSentinelEvidenceRefs,
  type InferenceTiming,
} from "./decision-audit.js";

const SENTINEL_FAST_PROMPT = (elderName: string, transcript: string) => `You are Sentinel, an AI agent protecting ${elderName} from scams. Analyze this call transcript and classify it.

TRANSCRIPT:
${transcript}

Classify as one of:
- SCAM (confidence > 0.85): This is definitely a scam.
- UNCERTAIN (confidence 0.5-0.85): This might be a scam but I'm not sure. Escalate to deep analysis.
- LEGITIMATE (confidence < 0.5): This is not a scam.

Respond with JSON only: { "classification": "SCAM|UNCERTAIN|LEGITIMATE", "confidence": 0.XX, "scamType": "...", "reasoning": "..." }`;

const SENTINEL_DEEP_PROMPT = (
  transcript: string,
  initial: SentinelClassification,
) => `You are Sentinel-Deep, analyzing a call that was flagged as potentially fraudulent.

CALL TRANSCRIPT:
${transcript}

INITIAL CLASSIFICATION:
${initial.classification}

INITIAL REASONING:
${initial.reasoning}

Respond with JSON only: {
  "classification": "SCAM" | "LEGITIMATE",
  "confidence": 0.XX,
  "scamType": "government_impersonation" | "tech_support" | "romance" | "grandparent" | "investment" | "other",
  "techniquesIdentified": ["..."],
  "informationRequested": ["..."],
  "redFlags": ["..."],
  "reasoning": "..."
}`;

function buildSentinelAlertSummary(classification: SentinelClassification): string {
  const disclaimer =
    "This is not legal advice. Review the transcript and contact authorities if needed.";
  if (classification.reasoning?.trim()) {
    return `${classification.reasoning.trim()} ${disclaimer}`;
  }
  const scamLabel = classification.scamType
    ? classification.scamType.replace(/_/g, " ")
    : classification.classification.toLowerCase();
  const confidencePct = Math.round(classification.confidence * 100);
  return `Classified as ${scamLabel} with ${confidencePct}% confidence. ${disclaimer}`;
}

function timingFromCompletion(
  startedAt: number,
  stats?: { timeToFirstToken?: number; tokensPerSecond?: number },
): InferenceTiming {
  return {
    latencyMs: Math.round(performance.now() - startedAt),
    ttftSec: stats?.timeToFirstToken,
    tps: stats?.tokensPerSecond,
  };
}

export class SentinelService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly qvacClient: QvacClient,
    private readonly archivist: ArchivistService,
    private readonly caregiverWorkflow: CaregiverWorkflowService,
  ) {}

  async processCallRecording(params: {
    familyId: string;
    elderId: string;
    recordingId: string;
    audioPath: string;
    audioHash: string;
    transcript?: string;
    initialClassification?: string;
    initialConfidence?: number;
    initialReasoning?: string;
  }) {
    const pipelineStarted = performance.now();
    const elder = await this.prisma.elder.findFirst({
      where: { id: params.elderId, familyId: params.familyId },
    });
    if (!elder) {
      throw new Error("ELDER_NOT_FOUND");
    }

    let transcript = params.transcript ?? "";
    let transcribeTiming: InferenceTiming = { latencyMs: 0 };

    if (!transcript) {
      const transcribeStart = performance.now();
      const transcribed = await this.qvacClient.transcribe({
        audioPath: params.audioPath,
        familyId: params.familyId,
      });
      transcript = transcribed.text;
      transcribeTiming = timingFromCompletion(transcribeStart, {
        tokensPerSecond: transcribed.stats?.tokensPerSecond,
      });
    }

    let classification: SentinelClassification;
    let modelSrc = "QWEN3_600M_INST_Q4";
    let thinkingText = "";
    let inferenceTiming: InferenceTiming = { latencyMs: 0 };

    if (params.initialClassification && params.initialConfidence !== undefined) {
      classification = {
        classification: params.initialClassification as SentinelClassification["classification"],
        confidence: params.initialConfidence,
        reasoning: params.initialReasoning ?? "",
      };
    } else {
      const fastStart = performance.now();
      const fast = await this.qvacClient.completion({
        familyId: params.familyId,
        captureThinking: true,
        history: [{ role: "user", content: SENTINEL_FAST_PROMPT(`${elder.firstName} ${elder.lastName}`, transcript) }],
      });
      classification = parseJsonFromModelOutput<SentinelClassification>(fast.contentText);
      thinkingText = fast.thinkingText;
      modelSrc = fast.modelSrc;
      inferenceTiming = timingFromCompletion(fastStart, {
        timeToFirstToken: fast.stats?.timeToFirstToken,
        tokensPerSecond: fast.stats?.tokensPerSecond,
      });
    }

    if (
      classification.classification === "UNCERTAIN" ||
      (classification.classification === "SCAM" && classification.confidence < 0.85)
    ) {
      const deepStart = performance.now();
      const deep = await this.qvacClient.completion({
        modelSrc: resolveMedPsyModelSource(),
        familyId: params.familyId,
        captureThinking: true,
        history: [
          {
            role: "user",
            content: SENTINEL_DEEP_PROMPT(transcript, classification),
          },
        ],
      });
      classification = parseJsonFromModelOutput<SentinelClassification>(deep.contentText);
      thinkingText = deep.thinkingText;
      modelSrc = deep.modelSrc;
      inferenceTiming = timingFromCompletion(deepStart, {
        timeToFirstToken: deep.stats?.timeToFirstToken,
        tokensPerSecond: deep.stats?.tokensPerSecond,
      });
    }

    const isScam =
      classification.classification === "SCAM" && classification.confidence >= 0.85;

    const evidenceReferences = buildSentinelEvidenceRefs({
      transcript,
      audioHash: params.audioHash,
      classification,
    });

    const totalLatencyMs = Math.round(performance.now() - pipelineStarted);

    const bundle = await this.archivist.commitBundle(params.familyId, {
      agent: "sentinel",
      trigger: "sentinel.process-call",
      inputs: {
        audioClipHash: params.audioHash,
        audioClipUrl: params.audioPath,
        transcript,
      },
      reasoning: {
        modelSrc,
        modelVersion: modelSrc,
        thinkingText,
        classification: classification.classification,
        confidence: classification.confidence,
        latencyMs: totalLatencyMs,
        ttftSec: inferenceTiming.ttftSec,
        tps: inferenceTiming.tps,
        evidenceReferences,
      },
      toolCalls: [],
      action: isScam ? "emit_scam_alert" : "log_legitimate_call",
      device: "cognition_node",
    });

    const decisionAudit = buildAgentDecisionAudit({
      bundle,
      reasoning: classification.reasoning,
      classification: classification.classification,
      confidence: classification.confidence,
      timing: {
        latencyMs: totalLatencyMs,
        ttftSec: inferenceTiming.ttftSec ?? transcribeTiming.ttftSec,
        tps: inferenceTiming.tps,
      },
    });

    await this.prisma.sentinelCallRecording.update({
      where: { id: params.recordingId },
      data: {
        transcript,
        finalClassification: classification.classification,
        finalConfidence: classification.confidence,
        bundleId: bundle.bundleId,
        status: "processed",
        processedAt: new Date(),
      },
    });

    if (isScam) {
      const alert = await this.prisma.alert.create({
        data: {
          familyId: params.familyId,
          elderId: params.elderId,
          agent: "sentinel",
          severity: "critical",
          type: classification.scamType ?? "scam_call",
          title: `Possible scam call targeting ${elder.firstName}`,
          summary: buildSentinelAlertSummary(classification),
          metadata: {
            classification,
            transcript,
            decisionAudit: JSON.parse(JSON.stringify(decisionAudit)) as Prisma.InputJsonValue,
            pipelineLatencyMs: totalLatencyMs,
          } as Prisma.InputJsonValue,
          bundleId: bundle.bundleId,
        },
      });

      const workflow = await this.caregiverWorkflow.runHighRiskPipeline({
        alert,
        bundle,
        decision: decisionAudit,
      });

      return { classification, bundle, alert, transcript, decisionAudit, workflow };
    }

    return { classification, bundle, alert: null, transcript, decisionAudit, workflow: null };
  }
}
