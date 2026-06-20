import { describe, expect, it } from "vitest";
import { formatInferenceLogCsvRow } from "./inference-logger.js";

describe("InferenceLogger CSV format", () => {
  it("matches hackathon header columns", () => {
    const row = formatInferenceLogCsvRow({
      timestamp: "2026-06-20T12:00:00.000Z",
      familyId: "fam_1",
      deviceId: null,
      modelSrc: "QWEN3_600M",
      operation: "completion",
      promptTokens: 10,
      completionTokens: 5,
      ttftSec: 0.31,
      tps: 32.4,
      delegateProvider: null,
      delegateFallbackUsed: false,
      bundleId: "bundle_1",
    });

    expect(row.split(",")).toHaveLength(12);
    expect(row).toContain("2026-06-20T12:00:00.000Z");
    expect(row).toContain("completion");
  });
});
