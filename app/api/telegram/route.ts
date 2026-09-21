/**
 * POST /api/telegram — webhook for the Ghost Aviator Telegram bot.
 *
 * Telegram delivers each message a student sends the bot here; we answer it
 * with lib/telegram-bot/brain.ts and post the reply back through the Bot API.
 *
 * SECURITY
 *  - Every request must carry X-Telegram-Bot-Api-Secret-Token equal to
 *    TELEGRAM_WEBHOOK_SECRET (set when the webhook is registered). Without it
 *    anyone could POST fake updates and make the bot message arbitrary chats.
 *  - TELEGRAM_BOT_TOKEN lives only in server env (Vercel + .env.local). It is
 *    never sent to the browser and never logged.
 *
 * BEHAVIOUR
 *  - Private chats: answers every message.
 *  - Groups: answers ONLY explicit /commands. It never chimes into group
 *    conversation and never messages anyone who did not write to it.
 *  - Always returns 200 to Telegram once the secret is valid. A non-2xx makes
 *    Telegram re-deliver the same update repeatedly.
 */

import { timingSafeEqual } from "node:crypto";
import { replyFor, commandOf } from "@/lib/telegram-bot/brain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Retrieval may lazily load the question bank on a cold start.
export const maxDuration = 15;

// ---------------------------------------------------------------- limits

/** Per-chat: enough for a real conversation, too few for a flood. In-memory,
 *  so per-instance — the same accepted limitation as /api/gini. */
const PER_MIN = 12;
const hits = new Map<number, number[]>();

function overLimit(chatId: number, now: number): boolean {
  const recent = (hits.get(chatId) ?? []).filter(t => now - t < 60_000);
  recent.push(now);
  hits.set(chatId, recent);
  if (hits.size > 5000) hits.clear(); // crude bound on memory
  return recent.length > PER_MIN;
}

function secretOk(req: Request): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET || "";
  const got = req.headers.get("x-telegram-bot-api-secret-token") || "";
  if (!expected || got.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

type TgChat = { id: number; type: "private" | "group" | "supergroup" | "channel" };
type TgMessage = { message_id: number; chat: TgChat; text?: string };
type TgUpdate = { update_id: number; message?: TgMessage; edited_message?: TgMessage };

async function send(token: string, chatId: number, replyTo: number, text: string, buttons: { text: string; url: string }[][]) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
      reply_parameters: { message_id: replyTo, allow_sending_without_reply: true },
      reply_markup: { inline_keyboard: buttons },
    }),
    signal: AbortSignal.timeout(8000),
  });
}

export async function POST(req: Request) {
  if (!secretOk(req)) return new Response("forbidden", { status: 401 });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  // Misconfigured: acknowledge so Telegram does not retry forever.
  if (!token) return Response.json({ ok: true, skipped: "no-token" });

  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return Response.json({ ok: true, skipped: "bad-json" });
  }

  const msg = update.message ?? update.edited_message;
  const text = msg?.text;
  if (!msg || !text) return Response.json({ ok: true, skipped: "no-text" });

  // In groups, speak only when explicitly commanded.
  if (msg.chat.type !== "private" && !commandOf(text)) {
    return Response.json({ ok: true, skipped: "group-chatter" });
  }
  if (msg.chat.type === "channel") return Response.json({ ok: true, skipped: "channel" });

  if (overLimit(msg.chat.id, Date.now())) {
    return Response.json({ ok: true, skipped: "rate-limited" });
  }

  try {
    const reply = await replyFor(text);
    await send(token, msg.chat.id, msg.message_id, reply.text, reply.buttons);
  } catch {
    // Swallow: a failed send must not become a Telegram retry loop.
  }
  return Response.json({ ok: true });
}

export async function GET() {
  return Response.json({ ok: true, service: "ghost-aviator-telegram-webhook" });
}
