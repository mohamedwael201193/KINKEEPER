import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("No TELEGRAM_BOT_TOKEN");
  process.exit(1);
}

const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
const me = await meRes.json();
console.log("getMe:", me);

const updatesRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`);
const updates = await updatesRes.json();
console.log("getUpdates count:", updates.result?.length ?? 0);

const prisma = new PrismaClient();
try {
  const chats = await prisma.telegramChat.findMany({ take: 10 });
  console.log("DB telegram_chats:", chats.map((c) => ({ chatId: c.chatId, userId: c.userId })));
} catch (e) {
  console.log("DB error:", e instanceof Error ? e.message : e);
} finally {
  await prisma.$disconnect();
}
