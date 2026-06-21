import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { GuardianIncidentResult } from "@kinkeeper/guardian-mesh";

export interface IncidentSummary {
  incidentId: string;
  inputType: string;
  verdict: string;
  confidence: number;
  scamType?: string;
  bundleHash: string;
  chainValid: boolean;
  telegramSent: boolean;
  telegramMessageId?: number;
  createdAt: string;
  inputPath: string;
}

function packetToSummary(packet: Record<string, unknown>): IncidentSummary | null {
  const incidentId = String(packet.incidentId ?? packet.packetId ?? "");
  if (!incidentId) return null;
  const risk = packet.risk as Record<string, unknown> | undefined;
  const chain = packet.chainVerification as Record<string, unknown> | undefined;
  return {
    incidentId,
    inputType: String(packet.inputType ?? "unknown"),
    verdict: String(risk?.verdict ?? "UNKNOWN"),
    confidence: Number(risk?.confidence ?? 0),
    scamType: risk?.scamType ? String(risk.scamType) : undefined,
    bundleHash: String(chain?.bundleHash ?? ""),
    chainValid: Boolean(chain?.chainValid),
    telegramSent: Boolean((packet as { telegramSent?: boolean }).telegramSent),
    telegramMessageId: (packet as { telegramMessageId?: number }).telegramMessageId,
    createdAt: String(
      (packet.timestamps as Record<string, string> | undefined)?.packetGeneratedAt ??
        packet.createdAt ??
        new Date().toISOString(),
    ),
    inputPath: String((packet as { inputPath?: string }).inputPath ?? ""),
  };
}

export function listIncidentHistory(evidenceDir: string): IncidentSummary[] {
  const packetsDir = join(evidenceDir, "packets");
  if (!existsSync(packetsDir)) return [];

  const summaries: IncidentSummary[] = [];
  for (const file of readdirSync(packetsDir).filter((f) => f.endsWith(".json"))) {
    try {
      const raw = readFileSync(join(packetsDir, file), "utf8");
      const packet = JSON.parse(raw) as Record<string, unknown>;
      const summary = packetToSummary(packet);
      if (summary) summaries.push(summary);
    } catch {
      /* skip corrupt packets */
    }
  }

  summaries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return summaries;
}

export function loadIncidentPacket(
  evidenceDir: string,
  incidentId: string,
): Record<string, unknown> | null {
  const path = join(evidenceDir, "packets", `${incidentId}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

export function resultToSummary(result: GuardianIncidentResult): IncidentSummary {
  return {
    incidentId: result.incidentId,
    inputType: result.inputType,
    verdict: result.risk.verdict,
    confidence: result.risk.confidence,
    scamType: result.risk.scamType,
    bundleHash: result.bundleHash,
    chainValid: result.chainValid,
    telegramSent: result.telegramSent,
    telegramMessageId: result.telegramMessageId,
    createdAt: result.createdAt,
    inputPath: result.inputPath,
  };
}

export interface TelegramAckEntry {
  at: string;
  incidentId: string;
  chatId: string;
  via: string;
}

export function readTelegramAcks(evidenceDir: string): TelegramAckEntry[] {
  const paths = [
    join(evidenceDir, "telegram", "telegram-acks.jsonl"),
    join(evidenceDir, "guardian-mesh", "telegram-acks.jsonl"),
  ];
  const entries: TelegramAckEntry[] = [];
  for (const path of paths) {
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      if (!line.trim()) continue;
      try {
        entries.push(JSON.parse(line) as TelegramAckEntry);
      } catch {
        /* skip */
      }
    }
  }
  entries.sort((a, b) => b.at.localeCompare(a.at));
  return entries;
}
