import { describe, expect, it } from "vitest";
import {
  isValidEvidencePacket,
  matchOrderedGetApiPrefix,
  parseIncidentIdFromPath,
} from "./routes.js";

const SAMPLE_ID = "2354ffba-f387-4afe-a42f-1158f47d28fd";

describe("guardian-mesh API route order", () => {
  it("matches export before generic evidence (no shadowing)", () => {
    expect(matchOrderedGetApiPrefix(`/api/evidence/export/${SAMPLE_ID}`)).toBe("/api/evidence/export/");
    expect(matchOrderedGetApiPrefix(`/api/evidence/${SAMPLE_ID}`)).toBe("/api/evidence/");
    expect(matchOrderedGetApiPrefix("/api/incident/x")).toBe("/api/incident/");
  });

  it("parses incident UUID from export path", () => {
    expect(parseIncidentIdFromPath(`/api/evidence/export/${SAMPLE_ID}`, "/api/evidence/export/")).toBe(
      SAMPLE_ID,
    );
    expect(parseIncidentIdFromPath(`/api/evidence/${SAMPLE_ID}`, "/api/evidence/")).toBe(SAMPLE_ID);
    expect(parseIncidentIdFromPath("/api/evidence/export/not-a-uuid", "/api/evidence/export/")).toBeNull();
    expect(parseIncidentIdFromPath("/api/evidence/export/../secret", "/api/evidence/export/")).toBeNull();
  });

  it("validates exported evidence packet shape", () => {
    expect(
      isValidEvidencePacket({
        incidentId: SAMPLE_ID,
        risk: { verdict: "BLOCK" },
        chainVerification: { bundleHash: "abc", chainValid: true },
      }),
    ).toBe(true);
    expect(isValidEvidencePacket({ incidentId: SAMPLE_ID })).toBe(false);
  });
});
