import "dotenv/config";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN not set");
  process.exit(1);
}

const chats = new Map<number, string>();

const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=20`);
const body = (await res.json()) as {
  ok: boolean;
  result: Array<{ message?: { chat: { id: number; type: string; username?: string } } }>;
};

if (body.ok) {
  for (const update of body.result) {
    const chat = update.message?.chat;
    if (chat) {
      chats.set(chat.id, chat.type + (chat.username ? ` @${chat.username}` : ""));
    }
  }
}

try {
  const prisma = new PrismaClient();
  const dbChats = await prisma.telegramChat.findMany({ take: 10 });
  for (const row of dbChats) {
    chats.set(Number(row.chatId), "db-linked caregiver");
  }
  await prisma.$disconnect();
} catch {
  /* DB optional */
}

if (chats.size === 0) {
  console.log("No chats found. Message @KINKEEPERxbot on Telegram or link via API, then re-run.");
  process.exit(2);
}

console.log("Discovered chat IDs:");
for (const [id, meta] of chats) {
  console.log(`  TELEGRAM_DEMO_CHAT_ID=${id}  (${meta})`);
}

const first = [...chats.keys()][0];
mkdirSync(join(process.cwd(), "evidence"), { recursive: true });
writeFileSync(
  join(process.cwd(), "evidence", "telegram-discovered-chats.json"),
  JSON.stringify({ discoveredAt: new Date().toISOString(), chats: Object.fromEntries(chats), suggested: first }, null, 2),
);
console.log(`\nSuggested: add to .env → TELEGRAM_DEMO_CHAT_ID=${first}`);
