/**
 * End-to-end Telegram verification for Guardian Mesh.
 * Sends a real scam alert and waits for the caregiver to tap Acknowledge.
 * Uses a dedicated short-lived getUpdates listener (stop dev:api first to avoid 409).
 */
import "dotenv/config";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { Bot } from "grammy";
import { QvacService } from "@kinkeeper/qvac";
import { GuardianMeshEngine, loadGuardianMeshConfig } from "@kinkeeper/guardian-mesh";

const root = join(import.meta.dirname, "..");
const reportPath = join(root, "evidence", "telegram-verify.json");
const ackPath = join(root, "evidence", "guardian-mesh", "telegram-acks.jsonl");
const audioPath = join(root, "test-data", "sentinel-scam-call.wav");

function logAck(incidentId: string, chatId: string, via: string): Record<string, string> {
  const record = {
    at: new Date().toISOString(),
    incidentId,
    chatId,
    via,
  };
  mkdirSync(join(root, "evidence", "guardian-mesh"), { recursive: true });
  appendFileSync(ackPath, `${JSON.stringify(record)}\n`, "utf8");
  return record;
}

async function resolveChatId(): Promise<string | undefined> {
  let chatId = process.env.TELEGRAM_DEMO_CHAT_ID ?? process.env.TELEGRAM_CAREGIVER_CHAT_ID;
  if (!chatId) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      const row = await prisma.telegramChat.findFirst({ orderBy: { linkedAt: "desc" } });
      await prisma.$disconnect();
      if (row) chatId = row.chatId;
    } catch {
      /* optional */
    }
  }
  return chatId;
}

function stopLocalApiTelegramPollers(): void {
  if (process.platform !== "win32") return;
  try {
    execSync(
      `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='node.exe'\\" | Where-Object { $_.CommandLine -match 'apps/api/src/main|dev:api' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`,
      { stdio: "ignore" },
    );
    console.log("[telegram-verify] Stopped local dev:api pollers to avoid Telegram 409 conflict");
  } catch {
    /* best effort */
  }
}

async function deleteWebhook(token: string): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=false`);
  const body = (await res.json()) as { ok?: boolean };
  if (!body.ok) {
    console.warn("[telegram-verify] deleteWebhook returned not ok — continuing");
  }
}

async function waitForAckTap(token: string, incidentId: string, timeoutMs: number): Promise<Record<string, string> | null> {
  return new Promise((resolve) => {
    const bot = new Bot(token);
    let settled = false;

    const finish = (record: Record<string, string> | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void bot.stop().catch(() => undefined);
      resolve(record);
    };

    bot.on("callback_query:data", async (ctx) => {
      if (ctx.callbackQuery.data !== `ack:${incidentId}`) return;
      await ctx.answerCallbackQuery({ text: "Acknowledged ✓" });
      const chatId = ctx.chat?.id.toString() ?? "unknown";
      const record = logAck(incidentId, chatId, "guardian_verify");
      await ctx.reply(
        `✅ Guardian Mesh incident ${incidentId.slice(0, 8)}… acknowledged. Evidence remains hash-linked on device.`,
      );
      finish(record);
    });

    bot.catch((err) => {
      const code = (err.error as { error_code?: number })?.error_code;
      const desc = (err.error as { description?: string })?.description ?? String(err.error);
      console.error("[telegram-verify] Bot error:", desc);
      if (code === 409) {
        console.error(
          "Telegram 409: another process is polling this bot token (Render deploy or dev:api). Stop it and retry.",
        );
        finish(null);
      }
    });

    const timer = setTimeout(() => finish(null), timeoutMs);

    void bot.start({
      allowed_updates: ["callback_query"],
      onStart: () => console.log("[telegram-verify] Ack listener active — tap Acknowledge on the alert"),
    });
  });
}

async function main(): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = await resolveChatId();
  if (!token || !chatId) {
    console.error("BLOCKED: Set TELEGRAM_BOT_TOKEN and TELEGRAM_DEMO_CHAT_ID");
    process.exit(2);
  }

  process.env.TELEGRAM_DEMO_CHAT_ID = chatId;

  stopLocalApiTelegramPollers();
  await deleteWebhook(token);
  await new Promise((r) => setTimeout(r, 1500));

  const config = loadGuardianMeshConfig({
    dataDir: join(root, "guardian-mesh-data-telegram"),
    evidenceDir: join(root, "guardian-mesh-data-telegram", "evidence"),
  });

  const qvac = new QvacService();
  const engine = new GuardianMeshEngine(qvac, config);
  await engine.preload();

  console.log("Sending Guardian Mesh alert to Telegram chat", chatId);
  console.log(">>> TAP Acknowledge on @KINKEEPERxbot within 90 seconds <<<");

  const result = await engine.processAudio(audioPath);
  if (!result.telegramSent) {
    console.error("FAIL: Telegram message not sent");
    process.exit(1);
  }

  console.log("Alert sent. messageId:", result.telegramMessageId, "incidentId:", result.incidentId);

  const ackRecord = await waitForAckTap(token, result.incidentId, 90_000);

  const report = {
    verifiedAt: new Date().toISOString(),
    chatId,
    alertSent: result.telegramSent,
    messageId: result.telegramMessageId,
    incidentId: result.incidentId,
    bundleHash: result.bundleHash,
    ackReceived: Boolean(ackRecord),
    ackRecord,
    verdict: result.risk.verdict,
  };

  mkdirSync(join(root, "evidence"), { recursive: true });
  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  await qvac.unloadAll().catch(() => undefined);

  if (!ackRecord) {
    console.error("PARTIAL: Alert delivered. Ack not received — tap Acknowledge on the latest alert in Telegram.");
    process.exit(3);
  }

  console.log("PASS — Telegram E2E verified:", reportPath);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
