import { randomUUID } from "node:crypto";
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient, Alert } from "@kinkeeper/db";
import type { AgentDecisionAudit } from "@kinkeeper/shared";
import { Bot, InlineKeyboard, Keyboard } from "grammy";

const LINK_TTL_DEFAULT_SEC = 900;

function shortHash(hash: string): string {
  return hash.slice(0, 12);
}

function alertDeepLink(appUrl: string, alertId: string): string {
  return `${appUrl}/incidents/${alertId}`;
}

/** Telegram rejects localhost / non-https URLs on inline keyboard buttons. */
function isTelegramSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return host !== "localhost" && host !== "127.0.0.1" && host !== "0.0.0.0";
  } catch {
    return false;
  }
}

function alertIdSuffix(alertId: string): string {
  return alertId.slice(-8);
}

const GUARDIAN_INCIDENT_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function logGuardianMeshAck(incidentId: string, chatId: string): void {
  const evidenceDir = process.env.EVIDENCE_DIR ?? join(process.cwd(), "evidence");
  const dir = join(evidenceDir, "guardian-mesh");
  mkdirSync(dir, { recursive: true });
  appendFileSync(
    join(dir, "telegram-acks.jsonl"),
    `${JSON.stringify({ at: new Date().toISOString(), incidentId, chatId, via: "api_telegram_bot" })}\n`,
  );
}

/** Guardian Mesh incidents are not stored in Postgres — any unmatched ack: is a local incident. */
function isLikelyGuardianMeshAckId(id: string): boolean {
  if (GUARDIAN_INCIDENT_UUID.test(id)) return true;
  // Full UUID without strict RFC variant check (Node randomUUID always qualifies above)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return true;
  return false;
}

async function replyGuardianMeshAck(
  bot: Bot,
  chatId: string,
  incidentId: string,
  replyMarkup?: ReturnType<typeof Keyboard.from>,
): Promise<void> {
  logGuardianMeshAck(incidentId, chatId);
  console.info(`[telegram] Guardian Mesh ack: ${incidentId.slice(0, 8)}… chat=${chatId}`);
  await bot.api.sendMessage(
    chatId,
    `✅ Guardian Mesh incident ${incidentId.slice(0, 8)}… acknowledged. Evidence remains hash-linked on device.`,
    replyMarkup ? { reply_markup: replyMarkup } : {},
  );
}

export class TelegramService {
  private bot: Bot | null = null;
  private botUsername: string | null = null;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly token: string | undefined,
    private readonly enabled: boolean,
    private readonly appUrl: string,
    private readonly linkTokenTtlSec: number,
  ) {}

  isEnabled(): boolean {
    return this.enabled && Boolean(this.token);
  }

  buildDeepLink(token: string): string | null {
    if (!this.botUsername) return null;
    return `https://t.me/${this.botUsername}?start=${encodeURIComponent(token)}`;
  }

  async start(): Promise<void> {
    if (!this.isEnabled() || !this.token) {
      return;
    }

    this.bot = new Bot(this.token);
    const me = await this.bot.api.getMe();
    this.botUsername = me.username ?? null;

    await this.bot.api.setMyCommands([
      { command: "menu", description: "Show main menu" },
      { command: "status", description: "Open alerts for your family" },
      { command: "alerts", description: "Recent incidents" },
      { command: "help", description: "How KINKEEPER alerts work" },
    ]);

    this.bot.command("start", async (ctx) => {
      const token = ctx.match?.trim();
      if (token) {
        await this.handleLink(ctx.chat.id.toString(), token, ctx.from?.id);
        return;
      }
      await this.sendMenuMessage(ctx.chat.id.toString(), this.welcomeText());
    });

    this.bot.command("link", async (ctx) => {
      const token = ctx.match?.trim();
      if (!token) {
        await ctx.reply(
          "To connect your account, open KINKEEPER on the web → Telegram → tap **Open in Telegram**.\n\nOr paste the link code here:\n/link YOUR-CODE",
          { reply_markup: this.mainMenuKeyboard() },
        );
        return;
      }
      await this.handleLink(ctx.chat.id.toString(), token, ctx.from?.id);
    });

    this.bot.command("menu", async (ctx) => {
      await this.sendMenuMessage(ctx.chat.id.toString(), "Choose an action:");
    });

    this.bot.command("help", async (ctx) => {
      await this.sendMenuMessage(ctx.chat.id.toString(), this.helpText(), { parseMode: "Markdown" });
    });

    this.bot.command("status", async (ctx) => {
      await this.sendStatus(ctx.chat.id.toString());
    });

    this.bot.command("alerts", async (ctx) => {
      await this.sendAlertsList(ctx.chat.id.toString());
    });

    this.bot.command("evidence", async (ctx) => {
      if (!ctx.chat) return;
      const chat = await this.requireLinkedChat(ctx.chat.id.toString());
      if (!chat) return;
      const partial = ctx.match?.trim();
      if (!partial) {
        await ctx.reply("Tap **Recent alerts** and use the Evidence button on an alert.", {
          reply_markup: this.mainMenuKeyboard(),
        });
        return;
      }
      await this.sendEvidence(chat.userId, ctx.chat.id.toString(), partial);
    });

    this.bot.command("ack", async (ctx) => {
      if (!ctx.chat) return;
      const chat = await this.requireLinkedChat(ctx.chat.id.toString());
      if (!chat) return;
      const partial = ctx.match?.trim();
      if (!partial) {
        await ctx.reply("Tap **Recent alerts** and use the Acknowledge button on an alert.", {
          reply_markup: this.mainMenuKeyboard(),
        });
        return;
      }
      await this.acknowledgeAlert(chat.userId, ctx.chat.id.toString(), partial);
    });

    this.bot.hears(/^📊\s*Status$/i, async (ctx) => {
      await this.sendStatus(ctx.chat.id.toString());
    });

    this.bot.hears(/^🚨\s*Recent alerts$/i, async (ctx) => {
      await this.sendAlertsList(ctx.chat.id.toString());
    });

    this.bot.hears(/^❓\s*Help$/i, async (ctx) => {
      await this.sendMenuMessage(ctx.chat.id.toString(), this.helpText(), { parseMode: "Markdown" });
    });

    this.bot.hears(/recent alerts/i, async (ctx) => {
      await this.sendAlertsList(ctx.chat.id.toString());
    });

    this.bot.hears(/^status$/i, async (ctx) => {
      await this.sendStatus(ctx.chat.id.toString());
    });

    this.bot.on("callback_query:data", async (ctx) => {
      const data = ctx.callbackQuery.data;
      await ctx.answerCallbackQuery();
      if (!ctx.chat) return;

      const chatId = ctx.chat.id.toString();

      if (data.startsWith("ack:")) {
        const incidentId = data.slice("ack:".length);
        const chat = await this.prisma.telegramChat.findUnique({ where: { chatId } });
        if (chat) {
          const alert = await this.resolveAlertForUser(chat.userId, incidentId);
          if (alert) {
            await this.acknowledgeAlert(chat.userId, chatId, incidentId);
            return;
          }
        }
        // Guardian Mesh alerts are never in Postgres — acknowledge any unmatched ack:
        await replyGuardianMeshAck(this.bot!, chatId, incidentId, this.mainMenuKeyboard());
        return;
      }

      const chat = await this.requireLinkedChat(chatId);
      if (!chat) return;

      if (data.startsWith("evidence:")) {
        await this.sendEvidence(chat.userId, chatId, data.slice("evidence:".length));
        return;
      }
      if (data === "status") {
        await this.sendStatus(ctx.chat.id.toString());
        return;
      }
      if (data === "alerts") {
        await this.sendAlertsList(ctx.chat.id.toString());
        return;
      }
      if (data === "help") {
        await this.sendMenuMessage(ctx.chat.id.toString(), this.helpText(), { parseMode: "Markdown" });
      }
    });

    this.bot.catch((err) => {
      console.error(`Telegram error for update ${err.ctx.update.update_id}:`, err.error);
    });

    void this.bot.start({
      onStart: () => {
        console.info(`[telegram] Caregiver bot started as @${this.botUsername ?? "unknown"}`);
      },
    });
  }

  async stop(): Promise<void> {
    if (this.bot) {
      await this.bot.stop();
      this.bot = null;
    }
  }

  getBotUsername(): string | null {
    return this.botUsername;
  }

  async createLinkToken(userId: string): Promise<{ token: string; expiresInSeconds: number }> {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + this.linkTokenTtlSec * 1000);

    await this.prisma.telegramLink.create({
      data: { userId, token, expiresAt },
    });

    return { token, expiresInSeconds: this.linkTokenTtlSec };
  }

  async notifyFamilyCaregivers(params: {
    familyId: string;
    alert: Alert;
    decision: AgentDecisionAudit;
    packetId: string;
  }): Promise<{ sent: number; chatIds: string[] }> {
    if (!this.bot) {
      return { sent: 0, chatIds: [] };
    }

    const members = await this.prisma.familyMember.findMany({
      where: { familyId: params.familyId },
      select: { userId: true },
    });

    const chats = await this.prisma.telegramChat.findMany({
      where: { userId: { in: members.map((m) => m.userId) } },
    });

    const icon = params.alert.agent === "sentinel" ? "🚨" : "📊";
    const suffix = alertIdSuffix(params.alert.id);
    const excerpt =
      params.decision.evidenceReferences.find((r) => r.type === "transcript")?.excerpt ??
      params.alert.summary.slice(0, 180);

    const message = [
      `${icon} *${params.alert.title}*`,
      "",
      params.alert.summary.slice(0, 320),
      "",
      excerpt ? `_"${excerpt.slice(0, 160)}${excerpt.length > 160 ? "…" : ""}"_` : "",
      "",
      `Confidence: ${Math.round(params.decision.confidence * 100)}%`,
    ].join("\n");

    const keyboard = this.buildAlertActionKeyboard(suffix, params.alert.id);

    let sent = 0;
    const chatIds: string[] = [];

    for (const chat of chats) {
      const delivered = await this.sendFormattedMessage(chat.chatId, message, keyboard);
      if (delivered) {
        sent += 1;
        chatIds.push(chat.chatId);
      }
    }

    if (sent > 0) {
      await this.prisma.auditLog.create({
        data: {
          familyId: params.familyId,
          action: "telegram.notify",
          entityType: "alert",
          entityId: params.alert.id,
          metadata: { sent, chatIds, packetId: params.packetId },
        },
      });
    }

    return { sent, chatIds };
  }

  private mainMenuKeyboard(): Keyboard {
    return new Keyboard()
      .text("📊 Status")
      .text("🚨 Recent alerts")
      .row()
      .text("❓ Help")
      .resized()
      .persistent();
  }

  private mainMenuInlineKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
      .text("📊 Status", "status")
      .text("🚨 Recent alerts", "alerts")
      .row()
      .text("❓ Help", "help");
  }

  private mainMenuReplyMarkup() {
    return {
      keyboard: [
        [{ text: "📊 Status" }, { text: "🚨 Recent alerts" }],
        [{ text: "❓ Help" }],
      ],
      resize_keyboard: true,
      is_persistent: true,
    };
  }

  private buildAlertActionKeyboard(suffix: string, alertId: string): InlineKeyboard {
    const keyboard = new InlineKeyboard()
      .text("✅ Acknowledge", `ack:${suffix}`)
      .text("📄 Evidence", `evidence:${suffix}`);

    const deepLink = alertDeepLink(this.appUrl, alertId);
    if (isTelegramSafeUrl(deepLink)) {
      keyboard.row().url("Open in KINKEEPER", deepLink);
    }

    return keyboard;
  }

  private async sendMenuMessage(
    chatId: string,
    text: string,
    options?: { parseMode?: "Markdown" | "HTML" },
  ): Promise<void> {
    if (!this.bot) return;

    try {
      await this.bot.api.sendMessage(chatId, text, {
        parse_mode: options?.parseMode,
        reply_markup: this.mainMenuInlineKeyboard(),
      });
      return;
    } catch (error) {
      console.warn(`[telegram] Inline menu failed for ${chatId}:`, error);
    }

    await this.bot.api.sendMessage(chatId, text.replace(/\*/g, ""), {
      reply_markup: this.mainMenuInlineKeyboard(),
    });
  }

  private async sendFormattedMessage(
    chatId: string,
    text: string,
    keyboard: InlineKeyboard,
  ): Promise<boolean> {
    if (!this.bot) return false;

    try {
      await this.bot.api.sendMessage(chatId, text, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
      return true;
    } catch (error) {
      console.warn(`[telegram] Markdown send failed for ${chatId}:`, error);
    }

    try {
      await this.bot.api.sendMessage(chatId, text.replace(/\*/g, ""), { reply_markup: keyboard });
      return true;
    } catch (error) {
      console.error(`[telegram] Failed to send message to ${chatId}:`, error);
      return false;
    }
  }

  private welcomeText(): string {
    return [
      "👋 Welcome to KINKEEPER",
      "",
      "You'll get instant alerts when a scam call or cognitive change is detected for your family.",
      "",
      "Use the buttons below — no commands to memorize.",
      "",
      "First time? Open KINKEEPER on the web → Telegram → tap Open in Telegram to link your account.",
    ].join("\n");
  }

  private helpText(): string {
    return [
      "*KINKEEPER caregiver alerts*",
      "",
      "• 📊 *Status* — open alerts for your family",
      "• 🚨 *Recent alerts* — last incidents with action buttons",
      "• Alert messages include *Acknowledge*, *Evidence*, and *Open in KINKEEPER*",
      "",
      "Link your account from the KINKEEPER web app (Family setup → Connect Telegram).",
    ].join("\n");
  }

  private async sendStatus(chatId: string): Promise<void> {
    const chat = await this.requireLinkedChat(chatId);
    if (!chat) return;

    const memberships = await this.prisma.familyMember.findMany({
      where: { userId: chat.userId },
      include: { family: true },
    });

    const lines: string[] = ["📊 *Family status*", ""];
    for (const membership of memberships) {
      const openAlerts = await this.prisma.alert.count({
        where: { familyId: membership.familyId, resolved: false },
      });
      lines.push(`• *${membership.family.name}*: ${openAlerts} open alert${openAlerts === 1 ? "" : "s"}`);
    }
    lines.push("", "Tap 🚨 Recent alerts to review incidents.");

    await this.bot!.api.sendMessage(chatId, lines.join("\n"), {
      parse_mode: "Markdown",
      reply_markup: this.mainMenuInlineKeyboard(),
    });
  }

  private async sendAlertsList(chatId: string): Promise<void> {
    const chat = await this.requireLinkedChat(chatId);
    if (!chat) return;

    const familyIds = (
      await this.prisma.familyMember.findMany({
        where: { userId: chat.userId },
        select: { familyId: true },
      })
    ).map((m) => m.familyId);

    const alerts = await this.prisma.alert.findMany({
      where: { familyId: { in: familyIds } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    if (alerts.length === 0) {
      await this.bot!.api.sendMessage(chatId, "No alerts yet. You're all caught up. ✅", {
        reply_markup: this.mainMenuReplyMarkup(),
      });
      return;
    }

    await this.bot!.api.sendMessage(
      chatId,
      `Showing ${alerts.length} recent alert${alerts.length === 1 ? "" : "s"}:`,
      { reply_markup: this.mainMenuReplyMarkup() },
    );

    let sent = 0;
    for (const alert of alerts) {
      const suffix = alertIdSuffix(alert.id);
      const keyboard = this.buildAlertActionKeyboard(suffix, alert.id);

      const text = [
        `${alert.resolved ? "✅" : "🔴"} ${alert.title}`,
        alert.summary.slice(0, 200),
        alert.resolved ? "Acknowledged" : "Open — tap a button below",
      ].join("\n\n");

      if (await this.sendFormattedMessage(chatId, text, keyboard)) {
        sent += 1;
      }
    }

    if (sent === 0) {
      await this.bot!.api.sendMessage(
        chatId,
        "Could not load alert details. Try /alerts again or open KINKEEPER on the web.",
        { reply_markup: this.mainMenuInlineKeyboard() },
      );
    }
  }

  private async sendEvidence(userId: string, chatId: string, partialId: string): Promise<void> {
    const alert = await this.resolveAlertForUser(userId, partialId);
    if (!alert) {
      await this.bot!.api.sendMessage(chatId, "Alert not found. Tap 🚨 Recent alerts to pick one.", {
        reply_markup: this.mainMenuKeyboard(),
      });
      return;
    }

    const packet = await this.prisma.evidencePacket.findUnique({ where: { alertId: alert.id } });
    const metadata = alert.metadata as Record<string, unknown> | null;
    const decision = metadata?.decisionAudit as AgentDecisionAudit | undefined;

    const keyboard = isTelegramSafeUrl(alertDeepLink(this.appUrl, alert.id))
      ? new InlineKeyboard().url("Open full evidence", alertDeepLink(this.appUrl, alert.id))
      : undefined;

    const message = [
      "📄 *Evidence summary*",
      "",
      alert.title,
      "",
      decision ? `Confidence: ${Math.round(decision.confidence * 100)}%` : "",
      packet ? `Packet: \`${shortHash(packet.contentHash)}\`` : "",
      alert.bundleId ? `Chain: \`${shortHash(alert.bundleId)}\`` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await this.bot!.api.sendMessage(chatId, message, {
      parse_mode: "Markdown",
      ...(keyboard ? { reply_markup: keyboard } : {}),
    });
  }

  private async acknowledgeAlert(userId: string, chatId: string, partialId: string): Promise<void> {
    const alert = await this.resolveAlertForUser(userId, partialId);
    if (!alert) {
      if (isLikelyGuardianMeshAckId(partialId)) {
        await replyGuardianMeshAck(this.bot!, chatId, partialId, this.mainMenuKeyboard());
        return;
      }
      await this.bot!.api.sendMessage(chatId, "Alert not found.", { reply_markup: this.mainMenuKeyboard() });
      return;
    }

    if (alert.resolved) {
      await this.bot!.api.sendMessage(chatId, "Already acknowledged. ✅", {
        reply_markup: this.mainMenuKeyboard(),
      });
      return;
    }

    await this.prisma.alert.update({
      where: { id: alert.id },
      data: { resolved: true, resolvedAt: new Date(), resolvedBy: userId },
    });

    await this.prisma.auditLog.create({
      data: {
        familyId: alert.familyId,
        userId,
        action: "telegram.ack",
        entityType: "alert",
        entityId: alert.id,
        metadata: { via: "telegram_button" },
      },
    });

    await this.bot!.api.sendMessage(chatId, `✅ Acknowledged: *${alert.title}*`, {
      parse_mode: "Markdown",
      reply_markup: this.mainMenuKeyboard(),
    });
  }

  private async handleLink(chatId: string, token: string, telegramUserId?: number): Promise<void> {
    if (!this.bot) return;

    const link = await this.prisma.telegramLink.findUnique({ where: { token } });
    if (!link || link.usedAt || link.expiresAt < new Date()) {
      await this.bot.api.sendMessage(
        chatId,
        "This link expired. Open KINKEEPER → Telegram → generate a new link and tap *Open in Telegram*.",
        { reply_markup: this.mainMenuKeyboard() },
      );
      return;
    }

    await this.prisma.$transaction([
      this.prisma.telegramLink.update({
        where: { id: link.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.telegramChat.upsert({
        where: { userId: link.userId },
        create: { userId: link.userId, chatId },
        update: { chatId, linkedAt: new Date() },
      }),
    ]);

    await this.prisma.auditLog.create({
      data: {
        userId: link.userId,
        action: "telegram.link",
        entityType: "telegram_chat",
        entityId: chatId,
        metadata: { telegramUserId },
      },
    });

    await this.bot.api.sendMessage(
      chatId,
      "✅ *Account linked!*\n\nYou'll receive scam and cognitive alerts here with one-tap buttons.\n\nTry 📊 Status or wait for your first alert.",
      { parse_mode: "Markdown", reply_markup: this.mainMenuKeyboard() },
    );
  }

  private async requireLinkedChat(chatId: string) {
    const chat = await this.prisma.telegramChat.findUnique({ where: { chatId } });
    if (!chat) {
      if (this.bot) {
        await this.bot.api.sendMessage(
          chatId,
          "Account not linked yet.\n\nOpen KINKEEPER on the web → *Telegram* → tap *Open in Telegram*.",
          { parse_mode: "Markdown" },
        );
      }
      return null;
    }
    return chat;
  }

  private async resolveAlertForUser(userId: string, partialId: string) {
    const familyIds = (
      await this.prisma.familyMember.findMany({
        where: { userId },
        select: { familyId: true },
      })
    ).map((m) => m.familyId);

    const alerts = await this.prisma.alert.findMany({
      where: {
        familyId: { in: familyIds },
        OR: [{ id: partialId }, { id: { endsWith: partialId } }],
      },
      take: 1,
    });

    return alerts[0] ?? null;
  }
}

export const telegramLinkTtlDefault = LINK_TTL_DEFAULT_SEC;
