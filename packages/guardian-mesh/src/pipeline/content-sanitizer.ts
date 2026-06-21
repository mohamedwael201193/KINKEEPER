/**
 * Strips adversarial instruction patterns from untrusted OCR/transcript/RAG text
 * before LLM prompts. Deterministic rules still apply on raw content.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /disregard\s+(all\s+)?(previous|prior|system)\s+(instructions?|rules?|prompts?)/gi,
  /you\s+are\s+now\s+(a|an)\s+/gi,
  /new\s+system\s+prompt/gi,
  /classify\s+as\s+LEGITIMATE/gi,
  /respond\s+with\s+JSON\s+only[^]*LEGITIMATE/gi,
  /override\s+(guardian|security|fraud)\s+(rules?|mesh)/gi,
  /\[SYSTEM\]/gi,
  /<\/?system>/gi,
  /assistant\s*:\s*LEGITIMATE/gi,
  /tool\s*:\s*transfer/gi,
  /send\s+all\s+funds/gi,
];

export interface SanitizeResult {
  sanitized: string;
  strippedPatterns: string[];
}

export function sanitizeUntrustedContent(raw: string): SanitizeResult {
  let sanitized = raw;
  const strippedPatterns: string[] = [];

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(raw)) {
      strippedPatterns.push(pattern.source.slice(0, 40));
    }
    sanitized = sanitized.replace(pattern, "[filtered-injection]");
  }

  return { sanitized, strippedPatterns };
}

export function wrapUserContentForPrompt(content: string): string {
  return `<<<UNTRUSTED_USER_CONTENT>>>\n${content}\n<<<END_UNTRUSTED_USER_CONTENT>>>`;
}

export function wrapRagContextForPrompt(ragBlock: string): string {
  return `<<<RETRIEVED_CONTEXT readonly>>>\n${ragBlock}\n<<<END_RETRIEVED_CONTEXT>>>`;
}
