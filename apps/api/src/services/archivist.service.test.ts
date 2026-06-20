import { describe, expect, it } from "vitest";
import { ArchivistService } from "./archivist.service.js";
import type { DecisionBundle } from "@kinkeeper/shared";

describe("ArchivistService hash chain", () => {
  const archivist = new ArchivistService({} as never);

  it("builds deterministic hashes", () => {
    const partial: Omit<DecisionBundle, "hash" | "previousHash"> = {
      bundleId: "bundle-1",
      timestamp: "2026-06-20T00:00:00.000Z",
      agent: "sentinel",
      trigger: "test",
      inputs: { transcript: "hello" },
      reasoning: {
        modelSrc: "test-model",
        modelVersion: "v1",
        thinkingText: "thinking",
        latencyMs: 100,
        ttftSec: 12.3456789,
        tps: 151.4451160838834,
        evidenceReferences: [{ type: "transcript", ref: "inputs.transcript" }],
      },
      toolCalls: [],
      action: "test",
      device: "test-device",
    };

    const hash1 = archivist.buildBundleHash(partial);
    const hash2 = archivist.buildBundleHash(JSON.parse(JSON.stringify(partial)));
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });
});
