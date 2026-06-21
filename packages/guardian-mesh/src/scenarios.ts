import { join } from "node:path";

export interface GuardianScenarioDef {
  id: string;
  name: string;
  type: "audio" | "image";
  relativePath: string;
  expectedVerdict: "ALLOW" | "WARN" | "BLOCK";
  description: string;
}

export function getGuardianScenarios(rootDir: string): GuardianScenarioDef[] {
  void rootDir;
  return [
    {
      id: "A",
      name: "IRS scam call",
      type: "audio",
      relativePath: join("test-data", "sentinel-scam-call.wav"),
      expectedVerdict: "BLOCK",
      description: "Government impersonation demanding gift cards",
    },
    {
      id: "B",
      name: "Fake bank invoice",
      type: "image",
      relativePath: join("samples", "fake-bank-invoice.png"),
      expectedVerdict: "BLOCK",
      description: "Urgent wire/gift-card payment notice",
    },
    {
      id: "C",
      name: "Tech support scam",
      type: "audio",
      relativePath: join("test-data", "scenario-c-support-call.wav"),
      expectedVerdict: "BLOCK",
      description: "Remote access demand",
    },
    {
      id: "D",
      name: "Grandparent scam",
      type: "audio",
      relativePath: join("test-data", "scenario-d-grandparent.wav"),
      expectedVerdict: "BLOCK",
      description: "Fake grandchild bail request",
    },
    {
      id: "E",
      name: "Crypto scam",
      type: "audio",
      relativePath: join("test-data", "scenario-e-crypto.wav"),
      expectedVerdict: "BLOCK",
      description: "Guaranteed crypto returns",
    },
    {
      id: "F",
      name: "Fake healthcare notice",
      type: "image",
      relativePath: join("samples", "scenario-f-healthcare.png"),
      expectedVerdict: "BLOCK",
      description: "Medicare suspension + gift card fee",
    },
    {
      id: "G",
      name: "Safe family check-in",
      type: "audio",
      relativePath: join("test-data", "scenario-g-safe-checkin.wav"),
      expectedVerdict: "ALLOW",
      description: "Benign daily wellness check-in",
    },
    {
      id: "H",
      name: "Safe pharmacy receipt",
      type: "image",
      relativePath: join("samples", "scenario-h-safe-receipt.png"),
      expectedVerdict: "ALLOW",
      description: "Paid pharmacy receipt — no urgency",
    },
    {
      id: "W",
      name: "Suspicious utility verify",
      type: "audio",
      relativePath: join("test-data", "scenario-w-suspicious-verify.wav"),
      expectedVerdict: "WARN",
      description: "Urgent account verify — ambiguous, not confirmed fraud",
    },
  ];
}

export function resolveScenarioPath(repoRoot: string, scenario: GuardianScenarioDef): string {
  return join(repoRoot, scenario.relativePath);
}
