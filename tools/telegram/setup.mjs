/**
 * One-time setup for the Ghost Aviator Telegram bot.
 *
 *   node tools/telegram/setup.mjs --gen-secret   print a fresh webhook secret
 *   node tools/telegram/setup.mjs --check        who is the bot? where does it point?
 *   node tools/telegram/setup.mjs                register webhook + command menu
 *
 * Reads TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET from the environment,
 * falling back to .env.local. NEVER prints either value — only their shape.
 * (Two API keys were burned in this workspace by a script that echoed one.)
 */

import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || "https://ghostaviator.com/api/telegram";

if (process.argv.includes("--gen-secret")) {
  // Telegram allows A-Z a-z 0-9 _ - , 1..256 chars.
  console.log(randomBytes(32).toString("base64url"));
  process.exit(0);
}

function fromEnvLocal(key) {
  try {
    const line = readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .find(l => l.startsWith(key + "="));
    return line ? line.slice(key.length + 1).trim().replace(/^["']|["']$/g, "") : "";
  } catch {
    return "";
  }
}

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || fromEnvLocal("TELEGRAM_BOT_TOKEN");
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || fromEnvLocal("TELEGRAM_WEBHOOK_SECRET");

const shape = s => (s ? `set (${s.length} chars)` : "MISSING");
console.log(`TELEGRAM_BOT_TOKEN      ${shape(TOKEN)}`);
console.log(`TELEGRAM_WEBHOOK_SECRET ${shape(SECRET)}`);
if (!TOKEN) {
  console.log("\nCreate the bot in @BotFather (/newbot), then put its token in .env.local as TELEGRAM_BOT_TOKEN=...");
  process.exit(1);
}

async function tg(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!json.ok) throw new Error(`${method} failed: ${json.description || res.status}`);
  return json.result;
}

const me = await tg("getMe");
console.log(`\nBot: @${me.username}  (${me.first_name})  https://t.me/${me.username}`);

if (process.argv.includes("--check")) {
  const info = await tg("getWebhookInfo");
  console.log(`Webhook: ${info.url || "(none)"}`);
  console.log(`Pending updates: ${info.pending_update_count}`);
  if (info.last_error_message) console.log(`Last error: ${info.last_error_message}`);
  process.exit(0);
}

if (!SECRET) {
  console.log("\nNo TELEGRAM_WEBHOOK_SECRET. Generate one with --gen-secret, put it in .env.local AND in Vercel env.");
  process.exit(1);
}

await tg("setWebhook", {
  url: WEBHOOK_URL,
  secret_token: SECRET,
  allowed_updates: ["message", "edited_message"],
  drop_pending_updates: true,
});
console.log(`Webhook set -> ${WEBHOOK_URL}`);

await tg("setMyCommands", {
  commands: [
    { command: "start", description: "What this bot can do" },
    { command: "free", description: "Free notes, question bank, simulators" },
    { command: "classes", description: "Live batches and fees" },
    { command: "rtr", description: "RTR(A) exam and simulator" },
    { command: "adapt", description: "Airline screening aptitude test" },
    { command: "talk", description: "Talk to our instructor" },
  ],
});
await tg("setMyDescription", {
  description:
    "Free DGCA CPL & ATPL ground school. Ask any syllabus question — answers come only from verified notes and a 4,400-question bank. No guessing.",
});
await tg("setMyShortDescription", {
  short_description: "Free DGCA CPL/ATPL study help — verified answers, no guessing.",
});
console.log("Commands and description set.");

const info = await tg("getWebhookInfo");
console.log(`\nConfirmed webhook: ${info.url}   pending: ${info.pending_update_count}`);
