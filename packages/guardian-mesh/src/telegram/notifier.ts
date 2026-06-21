import { join } from "node:path";
import { Bot, InlineKeyboard } from "grammy";
import type { GuardianIncidentResult } from "../types.js";
import { summarizeForCaregiver } from "../evidence/packet-writer.js";
import { appendTelegramAckLog } from "./ack-log.js";
import {
  registerGuardianTelegramMessageHandlers,
  sendGuardianTelegramAlerts,
  sendGuardianTelegramHelp,
  sendGuardianTelegramStatus,
} from "./menu-handlers.js";
import {
  deleteTelegramWebhook,
  isTelegramPollConflict,
  stopLocalTelegramPollers,
  telegramAckListenerEnabled,
} from "./poll-guard.js";

const ACK_RETRY_DELAYS_MS = [5_000, 15_000, 30_000, 60_000];

/** One poller per bot token — shared across GuardianMeshEngine instances and hot reload. */
let sharedAckBot: Bot | null = null;
let ackListenerRunning = false;
let ackRetryTimer: ReturnType<typeof setTimeout> | null = null;
let ackRetryAttempt = 0;
let sharedEvidenceDir = join(process.cwd(), "guardian-mesh-data", "evidence");
let sharedElderName = "Margaret";

function resolveCallbackChatId(ctx: { chatId?: number; callbackQuery: { message?: { chat?: { id: number } } } }): string | null {
  const id = ctx.chatId ?? ctx.callbackQuery.message?.chat?.id;
  return id != null ? id.toString() : null;
}

export class GuardianTelegramNotifier {
  private bot: Bot | null = null;

  constructor(
    private readonly token: string | undefined,
    private readonly chatId: string | undefined,
    private readonly appUrl: string,
    evidenceDir?: string,
    elderName?: string,
  ) {
    if (evidenceDir) {
      sharedEvidenceDir = evidenceDir;
    }
    if (elderName) {
      sharedElderName = elderName;
    }
  }

  isConfigured(): boolean {
    return Boolean(this.token && this.chatId);
  }

  private getBot(): Bot {
    if (!this.token) {
      throw new Error("TELEGRAM_BOT_TOKEN not configured");
    }
    if (!this.bot) {
      this.bot = new Bot(this.token);
    }
    return this.bot;
  }

  private logPollConflict(retryInMs?: number): void {
    const retryHint = retryInMs ? ` Retrying in ${Math.round(retryInMs / 1000)}s.` : "";
    process.stderr.write(
      `[guardian-mesh] Telegram bot listener paused — another process may be polling this token.${retryHint} Alerts still send.\n`,
    );
  }

  private async stopSharedAckBot(): Promise<void> {
    if (!sharedAckBot) return;
    try {
      await sharedAckBot.stop();
    } catch {
      /* ignore */
    }
    sharedAckBot = null;
    ackListenerRunning = false;
  }

  private scheduleAckRetry(): void {
    if (ackRetryTimer || !this.token) return;
    const delay = ACK_RETRY_DELAYS_MS[Math.min(ackRetryAttempt, ACK_RETRY_DELAYS_MS.length - 1)]!;
    ackRetryAttempt += 1;
    this.logPollConflict(delay);
    ackRetryTimer = setTimeout(() => {
      ackRetryTimer = null;
      void this.startAckListener();
    }, delay);
  }

  private registerBotHandlers(bot: Bot): void {
    registerGuardianTelegramMessageHandlers(bot, sharedEvidenceDir, sharedElderName);

    bot.on("callback_query:data", async (ctx) => {
      const data = ctx.callbackQuery.data;
      const chatId = resolveCallbackChatId(ctx);

      if (data.startsWith("ack:")) {
        const incidentId = data.slice("ack:".length);
        try {
          await ctx.answerCallbackQuery({ text: "Acknowledged ✓" });
        } catch (err) {
          process.stderr.write(`[guardian-mesh] answerCallbackQuery failed: ${String(err)}\n`);
        }
        if (!chatId) {
          process.stderr.write("[guardian-mesh] Ack callback missing chat id\n");
          return;
        }
        appendTelegramAckLog(sharedEvidenceDir, incidentId, chatId, "guardian_mesh_listener");
        process.stderr.write(`[guardian-mesh] Telegram ack: ${incidentId.slice(0, 8)}… chat=${chatId}\n`);
        try {
          await ctx.reply(
            `✅ Guardian Mesh incident ${incidentId.slice(0, 8)}… acknowledged. Evidence remains hash-linked on device.`,
          );
        } catch (err) {
          process.stderr.write(`[guardian-mesh] Ack reply failed: ${String(err)}\n`);
        }
        return;
      }

      try {
        await ctx.answerCallbackQuery();
      } catch {
        /* ignore */
      }
      if (!chatId) return;
      if (data === "status") {
        await sendGuardianTelegramStatus(bot, chatId, sharedEvidenceDir, sharedElderName);
      } else if (data === "alerts") {
        await sendGuardianTelegramAlerts(bot, chatId, sharedEvidenceDir);
      } else if (data === "help") {
        await sendGuardianTelegramHelp(bot, chatId);
      }
    });
  }

  /**
   * Polls Telegram for button taps and menu messages when no other process uses getUpdates.
   */
  async startAckListener(): Promise<void> {
    if (!this.token || ackListenerRunning || sharedAckBot) return;

    if (!telegramAckListenerEnabled()) {
      process.stderr.write(
        "[guardian-mesh] Telegram listener disabled (GUARDIAN_TELEGRAM_ACK_LISTENER=false). Remove that Windows env var or set true in .env.\n",
      );
      return;
    }

    stopLocalTelegramPollers();
    await deleteTelegramWebhook(this.token);

    ackListenerRunning = true;
    sharedAckBot = new Bot(this.token);
    this.registerBotHandlers(sharedAckBot);

    sharedAckBot.catch((err) => {
      if (isTelegramPollConflict(err.error)) {
        void this.stopSharedAckBot();
        this.scheduleAckRetry();
        return;
      }
      process.stderr.write(`[guardian-mesh] Telegram bot error: ${String(err.error)}\n`);
    });

    void sharedAckBot
      .start({
        allowed_updates: ["callback_query", "message"],
        onStart: () => {
          ackRetryAttempt = 0;
          process.stderr.write("[guardian-mesh] Telegram bot listener active (Acknowledge + menu)\n");
        },
      })
      .catch((error: unknown) => {
        void this.stopSharedAckBot();
        if (isTelegramPollConflict(error)) {
          this.scheduleAckRetry();
          return;
        }
        process.stderr.write(`[guardian-mesh] Telegram bot listener failed: ${String(error)}\n`);
      });
  }

  async sendIncidentAlert(params: {
    result: GuardianIncidentResult;
    elderName: string;
  }): Promise<{ sent: boolean; messageId?: number }> {
    if (!this.isConfigured()) {
      return { sent: false };
    }

    const bot = this.getBot();
    const summary = summarizeForCaregiver(params.result, params.elderName);
    const keyboard = new InlineKeyboard();
    const incidentUrl = `${this.appUrl}/incidents/${params.result.incidentId}`;
    if (incidentUrl.startsWith("https://") && !incidentUrl.includes("localhost")) {
      keyboard.url("View in KINKEEPER", incidentUrl).row();
    }
    keyboard.text("Acknowledge", `ack:${params.result.incidentId}`);

    const message = await bot.api.sendMessage(this.chatId!, summary, {
      reply_markup: keyboard,
    });

    return { sent: true, messageId: message.message_id };
  }
}
