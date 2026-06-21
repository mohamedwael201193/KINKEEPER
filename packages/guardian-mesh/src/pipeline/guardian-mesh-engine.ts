import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getDefaultEmbeddingModel,
  getDefaultOcrModel,
  getDefaultTtsModel,
  type QvacService,
} from "@kinkeeper/qvac";
import type { GuardianMeshConfig } from "../config.js";
import { LocalArchivist } from "../evidence/local-archivist.js";
import { hashFileContents, writeEvidencePacket } from "../evidence/packet-writer.js";
import { writePcmAsWav } from "../evidence/wav-writer.js";
import { FamilyRagService } from "../rag/family-rag.js";
import { GuardianTelegramNotifier } from "../telegram/notifier.js";
import type { GuardianIncidentResult, PipelineHooks, PipelineStageResult } from "../types.js";
import { RiskAnalyzer } from "./risk-analyzer.js";

export class GuardianMeshEngine {
  private readonly archivist: LocalArchivist;
  private readonly rag: FamilyRagService;
  private readonly risk: RiskAnalyzer;
  private readonly telegram: GuardianTelegramNotifier;
  private readonly modelVersions: Record<string, string> = {};
  private preloaded = false;

  constructor(
    private readonly qvac: QvacService,
    private readonly config: GuardianMeshConfig,
  ) {
    this.archivist = new LocalArchivist(config.evidenceDir);
    this.rag = new FamilyRagService(qvac, config.ragWorkspace);
    this.risk = new RiskAnalyzer(qvac, config.elderName);
    this.telegram = new GuardianTelegramNotifier(
      config.telegramBotToken,
      config.telegramChatId,
      config.appUrl,
      config.evidenceDir,
      config.elderName,
    );
  }

  getProviderPublicKey(): string | null {
    return this.qvac.getProviderPublicKey();
  }

  async preload(): Promise<void> {
    if (this.preloaded) return;
    await this.qvac.enableProfiler({ mode: "verbose" });
    await this.qvac.preloadAgentModels({ includeMedPsy: true });
    await this.qvac.ensureModel(await getDefaultEmbeddingModel(), "embeddings");
    await this.qvac.ensureModel(await getDefaultOcrModel(), "ocr");
    await this.qvac.ensureModel(await getDefaultTtsModel(), "tts");
    await this.rag.ensureSeeded();
    try {
      await this.qvac.startProvider({
        firewall:
          this.config.firewallAllowlist && this.config.firewallAllowlist.length > 0
            ? { mode: "allow", publicKeys: this.config.firewallAllowlist }
            : undefined,
      });
    } catch {
      /* provider optional for local-only demo */
    }
    this.preloaded = true;
  }

  async processAudio(audioPath: string, hooks?: PipelineHooks): Promise<GuardianIncidentResult> {
    await this.preload();
    const stages: PipelineStageResult[] = [];
    const pushStage = (stage: PipelineStageResult) => {
      stages.push(stage);
      hooks?.onStage?.(stage);
    };
    const incidentId = randomUUID();
    const inputBuffer = readFileSync(audioPath);
    const inputHash = hashFileContents(inputBuffer);

    const t0 = performance.now();
    const transcribed = await this.qvac.runTranscribe({ audioPath });
    this.modelVersions[transcribed.modelSrc] = transcribed.modelId;
    pushStage({
      stage: "stt",
      status: "complete",
      latencyMs: Math.round(performance.now() - t0),
      detail: transcribed.text.slice(0, 120),
    });

    const t1 = performance.now();
    const ragHits = await this.rag.searchContext(transcribed.text);
    pushStage({
      stage: "rag",
      status: "complete",
      latencyMs: Math.round(performance.now() - t1),
      detail: `${ragHits.length} hits`,
    });

    const t2 = performance.now();
    const risk = await this.risk.analyze({ content: transcribed.text, ragContext: ragHits });
    this.modelVersions[risk.modelUsed] = risk.modelUsed;
    pushStage({
      stage: "risk",
      status: "complete",
      latencyMs: Math.round(performance.now() - t2),
      detail: risk.verdict,
    });

    const bundle = this.archivist.commitBundle({
      agent: "sentinel",
      trigger: "guardian_mesh_audio",
      inputs: {
        audioClipHash: inputHash,
        transcript: transcribed.text,
      },
      reasoning: {
        modelSrc: risk.modelUsed,
        modelVersion: "local",
        thinkingText: "",
        classification: risk.classification,
        confidence: risk.confidence,
      },
      toolCalls: [],
      action: risk.verdict === "BLOCK" ? "block_and_alert" : "review_and_alert",
      device: "guardian-mesh-local",
    });
    pushStage({ stage: "evidence_bundle", status: "complete", latencyMs: 0, detail: bundle.hash.slice(0, 12) });

    const chain = this.archivist.verifyChain();
    const { packetPath } = writeEvidencePacket({
      evidenceDir: this.config.evidenceDir,
      incidentId,
      inputType: "audio",
      inputHash,
      bundle,
      chainValid: chain.valid,
      risk,
      transcript: transcribed.text,
      ragContext: ragHits,
      modelVersions: this.modelVersions,
    });
    pushStage({ stage: "evidence_packet", status: "complete", latencyMs: 0 });

    let ttsWarningPath: string | undefined;
    if (risk.verdict !== "ALLOW") {
      const t3 = performance.now();
      const warningText =
        "Warning. This request appears suspicious. Contact your caregiver before taking action.";
      const tts = await this.qvac.runTextToSpeech({ text: warningText });
      this.modelVersions[tts.modelSrc] = tts.modelId;
      mkdirSync(join(this.config.evidenceDir, "tts"), { recursive: true });
      ttsWarningPath = join(this.config.evidenceDir, "tts", `${incidentId}.wav`);
      writePcmAsWav({
        outputPath: ttsWarningPath,
        samples: tts.samples,
        sampleRate: tts.sampleRate,
      });
      pushStage({
        stage: "tts",
        status: "complete",
        latencyMs: Math.round(performance.now() - t3),
        detail: ttsWarningPath,
      });
    }

    const result: GuardianIncidentResult = {
      incidentId,
      inputType: "audio",
      inputPath: audioPath,
      inputHash,
      transcript: transcribed.text,
      ragContext: ragHits,
      risk,
      bundleHash: bundle.hash,
      previousHash: bundle.previousHash,
      chainValid: chain.valid,
      evidencePacketPath: packetPath,
      ttsWarningPath,
      telegramSent: false,
      stages,
      profilerSummary: await this.qvac.exportProfilerSummary(),
      createdAt: new Date().toISOString(),
    };

    const tg = await this.telegram.sendIncidentAlert({ result, elderName: this.config.elderName });
    result.telegramSent = tg.sent;
    result.telegramMessageId = tg.messageId;
    if (tg.sent) {
      pushStage({ stage: "telegram", status: "complete", latencyMs: 0 });
    } else {
      pushStage({ stage: "telegram", status: "skipped", latencyMs: 0, detail: "not configured" });
    }

    return result;
  }

  async processImage(imagePath: string, hooks?: PipelineHooks): Promise<GuardianIncidentResult> {
    await this.preload();
    const stages: PipelineStageResult[] = [];
    const pushStage = (stage: PipelineStageResult) => {
      stages.push(stage);
      hooks?.onStage?.(stage);
    };
    const incidentId = randomUUID();
    const inputBuffer = readFileSync(imagePath);
    const inputHash = hashFileContents(inputBuffer);

    const t0 = performance.now();
    const ocr = await this.qvac.runOcr({ imagePath });
    this.modelVersions[ocr.modelSrc] = ocr.modelId;
    pushStage({
      stage: "ocr",
      status: "complete",
      latencyMs: Math.round(performance.now() - t0),
      detail: ocr.text.slice(0, 120),
    });

    const t1 = performance.now();
    const ragHits = await this.rag.searchContext(ocr.text);
    pushStage({
      stage: "rag",
      status: "complete",
      latencyMs: Math.round(performance.now() - t1),
      detail: `${ragHits.length} hits`,
    });

    const t2 = performance.now();
    const risk = await this.risk.analyze({ content: ocr.text, ragContext: ragHits });
    pushStage({
      stage: "risk",
      status: "complete",
      latencyMs: Math.round(performance.now() - t2),
      detail: risk.verdict,
    });

    const bundle = this.archivist.commitBundle({
      agent: "sentinel",
      trigger: "guardian_mesh_ocr",
      inputs: {
        transcript: ocr.text,
        priorContext: { imagePath, inputHash, inputType: "image" },
      },
      reasoning: {
        modelSrc: risk.modelUsed,
        modelVersion: "local",
        thinkingText: "",
        classification: risk.classification,
        confidence: risk.confidence,
      },
      toolCalls: [],
      action: risk.verdict === "BLOCK" ? "block_and_alert" : "review_and_alert",
      device: "guardian-mesh-local",
    });

    const chain = this.archivist.verifyChain();
    const { packetPath } = writeEvidencePacket({
      evidenceDir: this.config.evidenceDir,
      incidentId,
      inputType: "image",
      inputHash,
      bundle,
      chainValid: chain.valid,
      risk,
      extractedText: ocr.text,
      ragContext: ragHits,
      modelVersions: this.modelVersions,
    });
    pushStage({ stage: "evidence_packet", status: "complete", latencyMs: 0 });

    let ttsWarningPath: string | undefined;
    if (risk.verdict !== "ALLOW") {
      const t3 = performance.now();
      const warningText =
        "Warning. This document appears suspicious. Contact your caregiver before taking action.";
      const tts = await this.qvac.runTextToSpeech({ text: warningText });
      this.modelVersions[tts.modelSrc] = tts.modelId;
      mkdirSync(join(this.config.evidenceDir, "tts"), { recursive: true });
      ttsWarningPath = join(this.config.evidenceDir, "tts", `${incidentId}.wav`);
      writePcmAsWav({
        outputPath: ttsWarningPath,
        samples: tts.samples,
        sampleRate: tts.sampleRate,
      });
      pushStage({
        stage: "tts",
        status: "complete",
        latencyMs: Math.round(performance.now() - t3),
        detail: ttsWarningPath,
      });
    }

    const result: GuardianIncidentResult = {
      incidentId,
      inputType: "image",
      inputPath: imagePath,
      inputHash,
      extractedText: ocr.text,
      ragContext: ragHits,
      risk,
      bundleHash: bundle.hash,
      previousHash: bundle.previousHash,
      chainValid: chain.valid,
      evidencePacketPath: packetPath,
      ttsWarningPath,
      telegramSent: false,
      stages,
      profilerSummary: await this.qvac.exportProfilerSummary(),
      createdAt: new Date().toISOString(),
    };

    const tg = await this.telegram.sendIncidentAlert({ result, elderName: this.config.elderName });
    result.telegramSent = tg.sent;
    result.telegramMessageId = tg.messageId;
    if (tg.sent) {
      pushStage({ stage: "telegram", status: "complete", latencyMs: 0 });
    } else {
      pushStage({ stage: "telegram", status: "skipped", latencyMs: 0, detail: "not configured" });
    }

    return result;
  }

  verifyChain() {
    return this.archivist.verifyChain();
  }

  async startTelegramListener(): Promise<void> {
    await this.telegram.startAckListener();
  }
}
