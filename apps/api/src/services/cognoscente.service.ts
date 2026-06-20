import type { PrismaClient, Prisma } from "@kinkeeper/db";
import { resolveMedPsyModelSource, parseJsonFromModelOutput, type QvacClient } from "@kinkeeper/qvac";
import type { CognoscenteAnalysis } from "@kinkeeper/shared";
import type { ArchivistService } from "./archivist.service.js";
import type { CaregiverWorkflowService } from "./caregiver-workflow.service.js";
import {
  buildAgentDecisionAudit,
  buildCognoscenteEvidenceRefs,
  type InferenceTiming,
} from "./decision-audit.js";

const COGNOSCENTE_PROMPT = (
  elderName: string,
  transcript: string,
  baselineSummary: string,
) => `You are Cognoscente, an AI agent monitoring ${elderName}'s cognitive health. Analyze this morning's voice check-in.

CHECK-IN TRANSCRIPT:
${transcript}

ELDER BASELINE SUMMARY:
${baselineSummary}

Extract metrics and respond with JSON only: {
  "wordFindingLatencySec": float,
  "semanticDrift": float,
  "repetition": int,
  "sentiment": float,
  "confabulationMarkers": ["..."],
  "compositeDeviation": float,
  "alert": boolean,
  "reasoning": "Clinical reasoning for the scores. This is not a diagnosis."
}`;

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

export class CognoscenteService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly qvacClient: QvacClient,
    private readonly archivist: ArchivistService,
    private readonly caregiverWorkflow: CaregiverWorkflowService,
  ) {}

  private async buildBaselineSummary(elderId: string): Promise<string> {
    const baselines = await this.prisma.cognoscenteBaseline.findMany({ where: { elderId } });
    if (baselines.length === 0) {
      return "No baseline yet — this may be the first check-in.";
    }
    return baselines
      .map((b) => `${b.metric}: ${b.baselineValue} (stddev ${b.stddev}, n=${b.sampleCount})`)
      .join("\n");
  }

  private async updateBaselines(elderId: string, analysis: CognoscenteAnalysis): Promise<void> {
    const metrics: Array<{ metric: string; value: number }> = [
      { metric: "word_finding_latency_sec", value: analysis.wordFindingLatencySec },
      { metric: "semantic_drift", value: analysis.semanticDrift },
      { metric: "repetition", value: analysis.repetition },
      { metric: "sentiment", value: analysis.sentiment },
      { metric: "composite_deviation", value: analysis.compositeDeviation },
    ];

    for (const item of metrics) {
      const existing = await this.prisma.cognoscenteBaseline.findUnique({
        where: { elderId_metric: { elderId, metric: item.metric } },
      });

      if (!existing) {
        await this.prisma.cognoscenteBaseline.create({
          data: {
            elderId,
            metric: item.metric,
            baselineValue: item.value,
            stddev: 0,
            sampleCount: 1,
          },
        });
        continue;
      }

      const n = existing.sampleCount + 1;
      const delta = item.value - existing.baselineValue;
      const mean = existing.baselineValue + delta / n;
      const variance =
        existing.sampleCount <= 1
          ? 0
          : (existing.stddev ** 2 * (existing.sampleCount - 1) + delta * (item.value - mean)) / (n - 1);

      await this.prisma.cognoscenteBaseline.update({
        where: { id: existing.id },
        data: {
          baselineValue: mean,
          stddev: Math.sqrt(Math.max(variance, 0)),
          sampleCount: n,
        },
      });
    }
  }

  async processCheckIn(params: {
    familyId: string;
    elderId: string;
    checkInId: string;
    audioPath: string;
    audioHash: string;
  }) {
    const pipelineStarted = performance.now();
    const elder = await this.prisma.elder.findFirst({
      where: { id: params.elderId, familyId: params.familyId },
    });
    if (!elder) {
      throw new Error("ELDER_NOT_FOUND");
    }

    const transcribeStart = performance.now();
    const transcribed = await this.qvacClient.transcribe({
      audioPath: params.audioPath,
      familyId: params.familyId,
    });
    const transcribeTiming = timingFromCompletion(transcribeStart, {
      tokensPerSecond: transcribed.stats?.tokensPerSecond,
    });

    const baselineSummary = await this.buildBaselineSummary(params.elderId);

    const completionStart = performance.now();
    const completion = await this.qvacClient.completion({
      modelSrc: resolveMedPsyModelSource(),
      familyId: params.familyId,
      captureThinking: true,
      history: [
        {
          role: "user",
          content: COGNOSCENTE_PROMPT(
            `${elder.firstName} ${elder.lastName}`,
            transcribed.text,
            baselineSummary,
          ),
        },
      ],
    });
    const inferenceTiming = timingFromCompletion(completionStart, {
      timeToFirstToken: completion.stats?.timeToFirstToken,
      tokensPerSecond: completion.stats?.tokensPerSecond,
    });

    const analysis = parseJsonFromModelOutput<CognoscenteAnalysis>(completion.contentText);

    await this.updateBaselines(params.elderId, analysis);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await this.prisma.cognoscenteTrend.upsert({
      where: { elderId_date: { elderId: params.elderId, date: today } },
      create: {
        elderId: params.elderId,
        date: today,
        wordFindingLatencySec: analysis.wordFindingLatencySec,
        semanticDrift: analysis.semanticDrift,
        repetition: analysis.repetition,
        sentiment: analysis.sentiment,
        compositeDeviation: analysis.compositeDeviation,
        alertTriggered: analysis.alert,
      },
      update: {
        wordFindingLatencySec: analysis.wordFindingLatencySec,
        semanticDrift: analysis.semanticDrift,
        repetition: analysis.repetition,
        sentiment: analysis.sentiment,
        compositeDeviation: analysis.compositeDeviation,
        alertTriggered: analysis.alert,
      },
    });

    const evidenceReferences = buildCognoscenteEvidenceRefs({
      transcript: transcribed.text,
      audioHash: params.audioHash,
      analysis,
    });

    const totalLatencyMs = Math.round(performance.now() - pipelineStarted);

    const bundle = await this.archivist.commitBundle(params.familyId, {
      agent: "cognoscente",
      trigger: "cognoscente.check-in",
      inputs: {
        audioClipHash: params.audioHash,
        audioClipUrl: params.audioPath,
        transcript: transcribed.text,
      },
      reasoning: {
        modelSrc: completion.modelSrc,
        modelVersion: completion.modelSrc,
        thinkingText: completion.thinkingText,
        classification: analysis.alert ? "deviation_detected" : "within_range",
        confidence: analysis.compositeDeviation,
        latencyMs: totalLatencyMs,
        ttftSec: inferenceTiming.ttftSec,
        tps: inferenceTiming.tps,
        evidenceReferences,
      },
      toolCalls: [],
      action: analysis.alert ? "emit_cognitive_alert" : "record_check_in",
      device: "cognition_node",
    });

    const decisionAudit = buildAgentDecisionAudit({
      bundle,
      reasoning: analysis.reasoning,
      classification: analysis.alert ? "deviation_detected" : "within_range",
      confidence: analysis.compositeDeviation,
      timing: {
        latencyMs: totalLatencyMs,
        ttftSec: inferenceTiming.ttftSec ?? transcribeTiming.ttftSec,
        tps: inferenceTiming.tps,
      },
    });

    await this.prisma.cognoscenteCheckIn.update({
      where: { id: params.checkInId },
      data: {
        transcript: transcribed.text,
        wordFindingLatencySec: analysis.wordFindingLatencySec,
        semanticDrift: analysis.semanticDrift,
        repetition: analysis.repetition,
        sentiment: analysis.sentiment,
        compositeDeviation: analysis.compositeDeviation,
        alertTriggered: analysis.alert,
        bundleId: bundle.bundleId,
      },
    });

    let alert = null;
    let workflow = null;
    if (analysis.alert) {
      alert = await this.prisma.alert.create({
        data: {
          familyId: params.familyId,
          elderId: params.elderId,
          agent: "cognoscente",
          severity: "warning",
          type: "cognitive_deviation",
          title: `Cognitive check-in change for ${elder.firstName}`,
          summary: `${analysis.reasoning} This is not a diagnosis. Consult a clinician.`,
          metadata: {
            analysis,
            transcript: transcribed.text,
            decisionAudit: JSON.parse(JSON.stringify(decisionAudit)) as Prisma.InputJsonValue,
            pipelineLatencyMs: totalLatencyMs,
          } as Prisma.InputJsonValue,
          bundleId: bundle.bundleId,
        },
      });

      workflow = await this.caregiverWorkflow.runHighRiskPipeline({
        alert,
        bundle,
        decision: decisionAudit,
      });
    }

    return {
      analysis,
      bundle,
      alert,
      transcript: transcribed.text,
      decisionAudit,
      workflow,
    };
  }
}
