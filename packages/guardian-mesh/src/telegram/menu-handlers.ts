import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Bot } from "grammy";
import { listRecentIncidents } from "../incident-index.js";

function readAckIncidentIds(evidenceDir: string): Set<string> {
  const ids = new Set<string>();
  for (const file of [
    join(evidenceDir, "telegram", "telegram-acks.jsonl"),
    join(evidenceDir, "guardian-mesh", "telegram-acks.jsonl"),
  ]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      if (!line.trim()) continue;
      try {
        const row = JSON.parse(line) as { incidentId?: string };
        if (row.incidentId) ids.add(row.incidentId);
      } catch {
        /* skip */
      }
    }
  }
  return ids;
}

export async function sendGuardianTelegramStatus(
  bot: Bot,
  chatId: string | number,
  evidenceDir: string,
  elderName: string,
): Promise<void> {
  const recent = listRecentIncidents(evidenceDir, 20);
  const acked = readAckIncidentIds(evidenceDir);
  const pending = recent.filter((i) => !acked.has(i.incidentId) && i.verdict !== "ALLOW");
  const lines = [
    `*KINKEEPER Guardian Mesh* — ${elderName}`,
    "",
    `Recent incidents: ${recent.length}`,
    `Pending caregiver ack: ${pending.length}`,
    `Acknowledged: ${recent.filter((i) => acked.has(i.incidentId)).length}`,
    "",
    pending.length
      ? `Open: ${pending
          .slice(0, 3)
          .map((i) => `${i.verdict} \`${i.incidentId.slice(0, 8)}…\``)
          .join(", ")}`
      : "No open BLOCK/WARN incidents awaiting ack.",
  ];
  await bot.api.sendMessage(chatId, lines.join("\n"), { parse_mode: "Markdown" });
}

export async function sendGuardianTelegramAlerts(
  bot: Bot,
  chatId: string | number,
  evidenceDir: string,
): Promise<void> {
  const recent = listRecentIncidents(evidenceDir, 6);
  if (recent.length === 0) {
    await bot.api.sendMessage(chatId, "No Guardian Mesh incidents yet. Run an analysis in the Judge UI.");
    return;
  }
  const acked = readAckIncidentIds(evidenceDir);
  const lines = recent.map(
    (i, n) =>
      `${n + 1}. *${i.verdict}* — ${i.createdAt.slice(0, 16).replace("T", " ")} — \`${i.incidentId.slice(0, 8)}…\`${acked.has(i.incidentId) ? " ✓" : ""}`,
  );
  await bot.api.sendMessage(chatId, `*Recent alerts*\n\n${lines.join("\n")}`, { parse_mode: "Markdown" });
}

export async function sendGuardianTelegramHelp(bot: Bot, chatId: string | number): Promise<void> {
  await bot.api.sendMessage(
    chatId,
    [
      "*KINKEEPER Guardian Mesh caregiver bot*",
      "",
      "• Tap *Acknowledge* on an alert when you have reviewed it.",
      "• *Status* — open vs acknowledged incidents.",
      "• *Recent alerts* — latest local analyses.",
      "",
      "Alerts come from your local Judge UI at http://127.0.0.1:8787/",
    ].join("\n"),
    { parse_mode: "Markdown" },
  );
}

export function registerGuardianTelegramMessageHandlers(
  bot: Bot,
  evidenceDir: string,
  elderName: string,
): void {
  bot.command("start", async (ctx) => {
    if (!ctx.chat) return;
    await sendGuardianTelegramHelp(bot, ctx.chat.id);
    await sendGuardianTelegramStatus(bot, ctx.chat.id, evidenceDir, elderName);
  });

  bot.command("status", async (ctx) => {
    if (!ctx.chat) return;
    await sendGuardianTelegramStatus(bot, ctx.chat.id, evidenceDir, elderName);
  });

  bot.command("help", async (ctx) => {
    if (!ctx.chat) return;
    await sendGuardianTelegramHelp(bot, ctx.chat.id);
  });

  bot.hears(/^📊\s*Status$/i, async (ctx) => {
    if (!ctx.chat) return;
    await sendGuardianTelegramStatus(bot, ctx.chat.id, evidenceDir, elderName);
  });

  bot.hears(/^🚨\s*Recent alerts$/i, async (ctx) => {
    if (!ctx.chat) return;
    await sendGuardianTelegramAlerts(bot, ctx.chat.id, evidenceDir);
  });

  bot.hears(/^❓\s*Help$/i, async (ctx) => {
    if (!ctx.chat) return;
    await sendGuardianTelegramHelp(bot, ctx.chat.id);
  });

  bot.hears(/recent alerts/i, async (ctx) => {
    if (!ctx.chat) return;
    await sendGuardianTelegramAlerts(bot, ctx.chat.id, evidenceDir);
  });

  bot.hears(/^status$/i, async (ctx) => {
    if (!ctx.chat) return;
    await sendGuardianTelegramStatus(bot, ctx.chat.id, evidenceDir, elderName);
  });
}
