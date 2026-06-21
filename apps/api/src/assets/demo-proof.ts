/**
 * Sanitized hackathon demo proof — ships with the API so /public/proof works on Render
 * without local evidence/ files. Live EVIDENCE_DIR files override these when present.
 */
export const demoSentinelProof = {
  recording: {
    transcript:
      "Hello Margaret, this is Officer Smith from the IRS. Your social security number has been suspended due to suspicious activity. You must pay five thousand dollars in gift cards today or we will send police to your home.",
    finalClassification: "SCAM",
    finalConfidence: 0.94,
  },
  alert: {
    title: "Possible scam call targeting Margaret",
    summary:
      "IRS impersonation with urgency, gift-card payment demand, and threats of arrest — classic government-impersonation fraud pattern.",
    severity: "critical",
    type: "Threat Detection",
  },
  bundle: {
    hash: "19494d3f38c8c40125a06820a8b2e4f1c9d7a3e6b5f4c2d1e0a9b8c7d6e5f4a3",
    reasoning: {
      confidence: 0.94,
      classification: "SCAM",
      modelSrc: "QWEN3_600M_INST_Q4",
      thinkingText:
        "Caller claims IRS authority, demands immediate gift-card payment, and threatens law enforcement — three high-weight scam indicators with no verifiable case reference.",
    },
  },
};

export const demoCognoscenteProof = {
  checkIn: {
    transcript:
      "Good morning. I had my coffee, walked the dog, and remembered my doctor appointment on Tuesday. The word for that kitchen thing — the colander — took me a second, but I got it.",
    wordFindingLatencySec: 2.4,
    compositeDeviation: 0.18,
    alertTriggered: false,
  },
  baselines: [
    { metric: "word_finding_latency", baselineValue: 1.8, stddev: 0.4, sampleCount: 5 },
    { metric: "composite_deviation", baselineValue: 0.12, stddev: 0.06, sampleCount: 5 },
  ],
  trends: [
    { date: "2026-06-18", wordFindingLatencySec: 1.9, compositeDeviation: 0.11, alertTriggered: false },
    { date: "2026-06-19", wordFindingLatencySec: 2.1, compositeDeviation: 0.14, alertTriggered: false },
    { date: "2026-06-20", wordFindingLatencySec: 2.4, compositeDeviation: 0.18, alertTriggered: false },
  ],
  bundle: {
    reasoning: {
      modelSrc: "MedPsy-1.7B-Q4",
      classification: "STABLE",
      confidence: 0.82,
    },
  },
};

export const demoEvidenceSystemProof = {
  chain: { valid: true, length: 4 },
  bundles: [
    {
      id: "bundle-1",
      agent: "cognoscente",
      hash: "849e61d4b39a4cd01c2d69b8a7f6e5d4c3b2a1908f7e6d5c4b3a291807f6e5d4",
      previousHash: "0",
      trigger: "cognoscente.check-in",
    },
    {
      id: "bundle-2",
      agent: "sentinel",
      hash: "80c87712dd403f5d40e7b10b9a8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0",
      previousHash: "849e61d4b39a4cd01c2d69b8a7f6e5d4c3b2a1908f7e6d5c4b3a291807f6e5d4",
      trigger: "sentinel.process-call",
    },
    {
      id: "bundle-3",
      agent: "cognoscente",
      hash: "976b9836a7335cbf7d23272b1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1",
      previousHash: "80c87712dd403f5d40e7b10b9a8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0",
      trigger: "cognoscente.check-in",
    },
    {
      id: "bundle-4",
      agent: "sentinel",
      hash: "19494d3f38c8c40125a06820a8b2e4f1c9d7a3e6b5f4c2d1e0a9b8c7d6e5f4a3",
      previousHash: "976b9836a7335cbf7d23272b1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1",
      trigger: "sentinel.process-call",
    },
  ],
};

export const demoQvacRuntimeProof = {
  sdkVersion: "0.13.3",
  providerPublicKey: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
  steps: [
    { name: "health_endpoint", ok: true, durationMs: 42, details: { status: "healthy" } },
    {
      name: "qwen3_completion",
      ok: true,
      durationMs: 890,
      details: { ttftMs: 189, tps: 255, stopReason: "eos", backendDevice: "gpu" },
    },
    {
      name: "medpsy_completion",
      ok: true,
      durationMs: 4200,
      details: { ttftMs: 116, tps: 204, stopReason: "eos", backendDevice: "gpu" },
    },
    {
      name: "whisper_transcribe",
      ok: true,
      durationMs: 510,
      details: { segmentCount: 4, backendDevice: "gpu" },
    },
  ],
};

export const demoDelegationProof = {
  ok: true,
  providerPublicKey: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
  fallbackUsed: false,
  completionPreview: "delegated inference verified",
};
