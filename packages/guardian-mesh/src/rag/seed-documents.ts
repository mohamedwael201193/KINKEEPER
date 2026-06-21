/** Local RAG seed — trusted family context, scam patterns, safety instructions. */
export const GUARDIAN_RAG_SEED_DOCUMENTS: string[] = [
  "Trusted bank contact for Margaret: First National Bank customer service is 1-800-555-0100. The bank will never ask for gift cards or wire transfers by phone.",
  "Trusted family contacts: caregiver Ben (+1-555-0142), daughter Sarah (+1-555-0199). Call them before sending money to anyone unknown.",
  "Known scam pattern IRS impersonation: callers claim Social Security suspension, demand immediate payment via gift cards or wire transfer. Real IRS never calls demanding instant payment.",
  "Known scam pattern tech support: unsolicited calls claiming computer virus, requesting remote access or payment. Hang up and call your trusted technician.",
  "Known scam pattern grandparent emergency: caller pretends to be grandchild in jail needing bail money. Verify by calling the family member directly on a known number.",
  "Safety instruction for Margaret: If a caller pressures you to act immediately, say you will call your caregiver first. Never share Social Security, bank PIN, or wire money to strangers.",
  "Prior incident note: February 2026 — Margaret received suspicious IRS voicemail. Family confirmed it was fraud; no payment made.",
  "Medication context: Margaret takes daily blood pressure medication. Cognitive check-ins are for caregiver awareness only — not medical diagnosis.",
];

export const GUARDIAN_RAG_WORKSPACE = "guardian-mesh-family";
