import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { Bot, InlineKeyboard } from "grammy";
import type { GuardianIncidentResult } from "../types.js";
import { summarizeForCaregiver } from "../evidence/packet-writer.js";

function logGuardianAck(incidentId: string, chatId: string, via: string): void {
  const evidenceDir = process.env.EVIDENCE_DIR ?? join(process.cwd(), "evidence");
  const dir = join(evidenceDir, "guardian-mesh");
  mkdirSync(dir, { recursive: true });
  appendFileSync(
    join(dir, "telegram-acks.jsonl"),
    `${JSON.stringify({ at: new Date().toISOString(), incidentId, chatId, via })}\n`,
  );
}

export class GuardianTelegramNotifier {
  private bot: Bot | null = null;
  private ackBot: Bot | null = null;
  private ackListenerStarted = false;

  constructor(
    private readonly token: string | undefined,
    private readonly chatId: string | undefined,
    private readonly appUrl: string,
  ) {}

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

  /**
   * Polls Telegram for Acknowledge button taps when the API bot is not running.
   * If dev:api is also polling the same token, this logs a 409 and exits quietly.
   */
  async startAckListener(): Promise<void> {
    if (!this.token || this.ackListenerStarted) return;
    this.ackListenerStarted = true;

    this.ackBot = new Bot(this.token);
    this.ackBot.on("callback_query:data", async (ctx) => {
      const data = ctx.callbackQuery.data;
      if (!data.startsWith("ack:") || !ctx.chat) return;
      const incidentId = data.slice("ack:".length);
      await ctx.answerCallbackQuery({ text: "Acknowledged ✓" });
      const chatId = ctx.chat.id.toString();
      logGuardianAck(incidentId, chatId, "guardian_mesh_listener");
      await ctx.reply(
        `✅ Guardian Mesh incident ${incidentId.slice(0, 8)}… acknowledged. Evidence remains hash-linked on device.`,
      );
    });

    this.ackBot.catch((err) => {
      const code = (err.error as { error_code?: number })?.error_code;
      if (code === 409) {
        process.stderr.write(
          "[guardian-mesh] Telegram ack listener skipped (API bot already polling). Restart dev:api with latest code.\n",
        );
        return;
      }
      process.stderr.write(`[guardian-mesh] Telegram ack error: ${String(err.error)}\n`);
    });

    void this.ackBot.start({
      allowed_updates: ["callback_query"],
      onStart: () => {
        process.stderr.write("[guardian-mesh] Telegram ack listener active\n");
      },
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
