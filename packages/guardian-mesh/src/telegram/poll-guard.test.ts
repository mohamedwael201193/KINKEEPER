import { describe, expect, it } from "vitest";
import { grammyErrorCode, isTelegramPollConflict } from "./poll-guard.js";

describe("telegram poll guard", () => {
  it("detects Grammy 409 conflicts", () => {
    expect(isTelegramPollConflict({ error_code: 409 })).toBe(true);
    expect(isTelegramPollConflict({ error: { error_code: 409 } })).toBe(true);
    expect(isTelegramPollConflict(new Error("other"))).toBe(false);
  });

  it("reads nested grammy error codes", () => {
    expect(grammyErrorCode({ error: { error_code: 409, description: "Conflict" } })).toBe(409);
  });
});
