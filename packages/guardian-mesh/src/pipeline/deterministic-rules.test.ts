import { describe, expect, it } from "vitest";
import { applyDeterministicRules, mergeVerdict } from "./deterministic-rules.js";

describe("deterministic-rules", () => {
  it("forces BLOCK on IRS gift card scam", () => {
    const rules = applyDeterministicRules(
      "IRS officer says social security suspended pay gift cards today",
    );
    expect(rules.floorVerdict).toBe("BLOCK");
    expect(mergeVerdict("ALLOW", rules)).toBe("BLOCK");
  });

  it("allows benign check-in", () => {
    const rules = applyDeterministicRules(
      "Good morning I slept well had oatmeal garden walk memory feels fine caregiver Ben",
    );
    expect(rules.ceilingVerdict).toBe("ALLOW");
    expect(mergeVerdict("WARN", rules)).toBe("ALLOW");
  });

  it("caps ambiguous utility verify at WARN even if LLM says BLOCK", () => {
    const rules = applyDeterministicRules(
      "electric company urgent verification confirm your date of birth call 1-800-555-0199",
    );
    expect(rules.ceilingVerdict).toBe("WARN");
    expect(mergeVerdict("BLOCK", rules)).toBe("WARN");
  });
});
