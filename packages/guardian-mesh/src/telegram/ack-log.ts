import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export function appendTelegramAckLog(
  evidenceDir: string,
  incidentId: string,
  chatId: string,
  via: string,
): void {
  const dir = join(evidenceDir, "telegram");
  mkdirSync(dir, { recursive: true });
  appendFileSync(
    join(dir, "telegram-acks.jsonl"),
    `${JSON.stringify({ at: new Date().toISOString(), incidentId, chatId, via })}\n`,
  );
}
