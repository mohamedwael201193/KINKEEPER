import type { FastifyInstance } from "fastify";
import type { AgentServices } from "../services/factory.js";

export async function registerTelegramRoutes(
  app: FastifyInstance,
  services: AgentServices,
): Promise<void> {
  app.post(
    "/telegram/link",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { token, expiresInSeconds } = await services.telegram.createLinkToken(request.user.sub);
      const botUsername = services.telegram.getBotUsername();
      const deepLinkUrl = services.telegram.buildDeepLink(token) ?? undefined;
      return {
        token,
        expiresInSeconds,
        botUsername: botUsername ?? undefined,
        deepLinkUrl,
        instructions: deepLinkUrl
          ? `Tap "Open in Telegram" — no typing required.`
          : botUsername
            ? `Open Telegram and tap Start, or send /link ${token} to @${botUsername}`
            : `Send /link ${token} to the KINKEEPER caregiver bot once it is running`,
      };
    },
  );

  app.get(
    "/telegram/status",
    { preHandler: [app.authenticate] },
    async (request) => {
      const chat = await app.prisma.telegramChat.findUnique({
        where: { userId: request.user.sub },
      });
      return {
        linked: Boolean(chat),
        chatId: chat?.chatId ?? null,
        linkedAt: chat?.linkedAt ?? null,
        botEnabled: services.telegram.isEnabled(),
        botUsername: services.telegram.getBotUsername(),
      };
    },
  );
}
