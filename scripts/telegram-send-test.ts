import "dotenv/config";
import { Bot } from "grammy";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_DEMO_CHAT_ID;
if (!token || !chatId) {
  console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_DEMO_CHAT_ID");
  process.exit(1);
}

const bot = new Bot(token);
const msg = await bot.api.sendMessage(chatId, "Guardian Mesh delivery test — you can ignore this message.");
console.log("PASS delivery test message_id:", msg.message_id);
