import type { RiskVerdict } from "../types.js";

export interface DeterministicRuleResult {
  floorVerdict?: RiskVerdict;
  ceilingVerdict?: RiskVerdict;
  redFlags: string[];
  ruleHits: string[];
}

const BLOCK_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /gift\s*card/i, label: "gift_card_demand" },
  { pattern: /wire\s+(transfer|money)|send\s+money\s+now/i, label: "wire_urgency" },
  { pattern: /social\s+security.*suspend/i, label: "ssn_suspension" },
  { pattern: /irs|internal revenue/i, label: "irs_impersonation" },
  { pattern: /remote\s+access|anydesk|teamviewer/i, label: "remote_access" },
  { pattern: /do\s+not\s+tell\s+(your\s+)?bank/i, label: "secrecy_from_bank" },
  { pattern: /bitcoin.*guaranteed|wallet\s+address/i, label: "crypto_scam" },
  { pattern: /in\s+jail.*bail|grandson.*wire/i, label: "grandparent_scam" },
  { pattern: /account\s+seizure|police.*send/i, label: "coercive_threat" },
];

const WARN_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /confirm\s+your\s+(ssn|social|date of birth)|date of birth.*payment/i, label: "pii_payment_combo" },
  { pattern: /urgent.*verif/i, label: "urgent_account_verify" },
  { pattern: /click\s+this\s+link|bit\.ly|tinyurl/i, label: "suspicious_link" },
  { pattern: /1[- ]?800[- ]?555[- ]?0199|5555[- ]?0199/i, label: "unknown_hotline" },
];

const ALLOW_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /slept well|oatmeal|garden|memory feels fine/i, label: "benign_checkin" },
  { pattern: /pharmacy receipt|thank you for your visit|copay paid/i, label: "legitimate_receipt" },
  { pattern: /caregiver ben|dinner tomorrow|daughter sarah/i, label: "trusted_family_context" },
];

/** Adversarial prompt-injection — always floor to at least WARN; dual signals → BLOCK */
const INJECTION_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i, label: "ignore_instructions" },
  { pattern: /disregard\s+(all\s+)?(previous|prior|system)/i, label: "disregard_system" },
  { pattern: /classify\s+as\s+LEGITIMATE/i, label: "force_legitimate" },
  { pattern: /you\s+are\s+now\s+(a|an)\s+/i, label: "role_swap" },
  { pattern: /override\s+(guardian|security|fraud)/i, label: "override_rules" },
  { pattern: /\[filtered-injection\]/i, label: "sanitizer_hit" },
  { pattern: /<<<UNTRUSTED_USER_CONTENT>>>/i, label: "delimiter_leak" },
];

export function applyDeterministicRules(content: string): DeterministicRuleResult {
  const normalized = content.toLowerCase();
  const redFlags: string[] = [];
  const ruleHits: string[] = [];

  for (const { pattern, label } of BLOCK_PATTERNS) {
    if (pattern.test(normalized)) {
      ruleHits.push(label);
      redFlags.push(label.replace(/_/g, " "));
    }
  }

  const injectionHits: string[] = [];
  for (const { pattern, label } of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      injectionHits.push(label);
      ruleHits.push(label);
      redFlags.push(`injection:${label.replace(/_/g, " ")}`);
    }
  }

  if (injectionHits.length >= 2) {
    return { floorVerdict: "BLOCK", redFlags, ruleHits };
  }
  if (injectionHits.length === 1) {
    return { floorVerdict: "WARN", ceilingVerdict: "WARN", redFlags, ruleHits };
  }

  if (ruleHits.length >= 2 || ruleHits.some((h) => ["gift_card_demand", "irs_impersonation", "grandparent_scam"].includes(h))) {
    return { floorVerdict: "BLOCK", redFlags, ruleHits };
  }

  for (const { pattern, label } of ALLOW_PATTERNS) {
    if (pattern.test(normalized)) {
      ruleHits.push(label);
    }
  }

  const hasBlockSignal = ruleHits.some((h) =>
    ["gift_card_demand", "wire_urgency", "ssn_suspension", "irs_impersonation", "remote_access"].includes(h),
  );
  const hasAllowSignal = ruleHits.some((h) =>
    ["benign_checkin", "legitimate_receipt", "trusted_family_context"].includes(h),
  );

  if (hasAllowSignal && !hasBlockSignal && ruleHits.filter((h) => ALLOW_PATTERNS.some((p) => p.label === h)).length >= 1) {
    const allowOnly = ruleHits.every((h) =>
      ["benign_checkin", "legitimate_receipt", "trusted_family_context"].includes(h),
    );
    if (allowOnly) {
      return { ceilingVerdict: "ALLOW", redFlags: [], ruleHits };
    }
  }

  for (const { pattern, label } of WARN_PATTERNS) {
    if (pattern.test(normalized)) {
      ruleHits.push(label);
      redFlags.push(label.replace(/_/g, " "));
    }
  }

  const blockHitLabels = ruleHits.filter((h) =>
    BLOCK_PATTERNS.some((p) => p.label === h),
  );
  const warnHitLabels = ruleHits.filter((h) => WARN_PATTERNS.some((p) => p.label === h));

  if (blockHitLabels.length === 0 && warnHitLabels.length > 0) {
    return { floorVerdict: "WARN", ceilingVerdict: "WARN", redFlags, ruleHits };
  }

  if (blockHitLabels.length > 0) {
    return { floorVerdict: "BLOCK", redFlags, ruleHits };
  }

  return { redFlags, ruleHits };
}

export function mergeVerdict(llmVerdict: RiskVerdict, rules: DeterministicRuleResult): RiskVerdict {
  if (rules.ceilingVerdict === "ALLOW") return "ALLOW";
  if (rules.floorVerdict === "BLOCK") return "BLOCK";
  if (rules.ceilingVerdict === "WARN") return "WARN";
  if (rules.floorVerdict === "WARN" && llmVerdict === "ALLOW") return "WARN";
  if (llmVerdict === "BLOCK") return "BLOCK";
  if (llmVerdict === "WARN" || rules.floorVerdict === "WARN") return "WARN";
  return llmVerdict;
}
