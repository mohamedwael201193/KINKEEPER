import { describe, expect, it } from "vitest";
import {
  buildAgentDecisionAudit,
  buildSentinelEvidenceRefs,
} from "./decision-audit.js";
import type { DecisionBundle, SentinelClassification } from "@kinkeeper/shared";

describe("decision-audit", () => {
  const bundle: DecisionBundle = {
    bundleId: "b1",
    timestamp: "2026-06-20T00:00:00.000Z",
    agent: "sentinel",
    trigger: "test",
    inputs: { transcript: "pay gift cards now" },
    reasoning: {
      modelSrc: "QWEN3_600M_INST_Q4",
      modelVersion: "QWEN3_600M_INST_Q4",
      thinkingText: "thinking",
      evidenceReferences: [{ type: "transcript", ref: "inputs.transcript", excerpt: "pay gift" }],
    },
    toolCalls: [],
    action: "emit_scam_alert",
    device: "cognition_node",
    hash: "abc123",
    previousHash: "0",
  };

  it("builds sentinel evidence refs with red flags", () => {
    const classification: SentinelClassification = {
      classification: "SCAM",
      confidence: 0.95,
      reasoning: "IRS impersonation",
      redFlags: ["gift cards", "urgency"],
      scamType: "government_impersonation",
    };
    const refs = buildSentinelEvidenceRefs({
      transcript: "Send gift cards",
      audioHash: "hash1",
      classification,
    });
    expect(refs.some((r) => r.type === "red_flag" && r.ref === "gift cards")).toBe(true);
    expect(refs.some((r) => r.type === "audio_hash")).toBe(true);
  });

  it("builds agent decision audit with chain hash and latency", () => {
    const audit = buildAgentDecisionAudit({
      bundle,
      reasoning: "Scam detected",
      classification: "SCAM",
      confidence: 0.95,
      timing: { latencyMs: 1200, ttftSec: 0.4, tps: 12 },
    });
    expect(audit.chainHash).toBe("abc123");
    expect(audit.previousChainHash).toBe("0");
    expect(audit.latencyMs).toBe(1200);
    expect(audit.modelUsed).toBe("QWEN3_600M_INST_Q4");
    expect(audit.evidenceReferences).toHaveLength(1);
  });
});
