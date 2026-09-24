/**
 * GHOST AVIATOR TELEGRAM BOT — the brain.
 *
 * Built 2026-09-21. Turns one incoming Telegram message into one reply.
 *
 * WHAT IT IS: an inbound assistant. It only ever REPLIES to someone who wrote
 * to it. It never starts a conversation, never messages a group member, never
 * reads a member list. Students reach it through its link (groups, channel,
 * YouTube descriptions, the site) and it answers them any hour of the day.
 *
 * WHERE THE WORDS COME FROM: Gini's retrieval layer (lib/gini/knowledge.ts).
 * No model writes an aviation sentence here. An answer is either text that
 * already exists on the site / in the verified bank, or an honest refusal that
 * hands the student to a human. Iron Rule 1 holds by construction, exactly as
 * it does for Gini on the website.
 *
 * PRICES come from lib/live-classes.ts and nowhere else, so the bot can never
 * quote a figure the site does not.
 */

import { askDeep, readContext } from "@/lib/gini/knowledge";
import { SITE_URL } from "@/lib/site";
import {
  LIVE_PRICE,
  LIVE_LIST_PRICE,
  LIVE_COMBO_PRICE,
  LIVE_COMBO_LIST_PRICE,
  LIVE_WHATSAPP,
  LIVE_UPI_VPA,
  LIVE_UPI_PAYEE,
} from "@/lib/live-classes";

export type BotButton = { text: string; url: string };
export type BotReply = { text: string; buttons: BotButton[][] };

/** Telegram rejects messages longer than 4096 characters. */
const MAX_LEN = 4000;

const SITE = SITE_URL.replace(/\/+$/, "");

export const abs = (href: string): string =>
  /^https?:\/\//i.test(href) ? href : SITE + (href.startsWith("/") ? href : "/" + href);

/** Hand-off to a human, with the context already written so nobody has to retype it. */
export const talkLink = (topic?: string): string =>
  `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
    "Hello, I came from the Ghost Aviator Telegram bot." +
      (topic ? ` My question is about: ${topic.slice(0, 120)}` : ""),
  )}`;

const clip = (s: string): string =>
  s.length <= MAX_LEN ? s : s.slice(0, MAX_LEN - 1).replace(/\s+\S*$/, "") + "…";

// ------------------------------------------------------------------ copy

const WELCOME =
  "Welcome to Ghost Aviator — free DGCA CPL & ATPL ground school.\n\n" +
  "Ask me anything from the syllabus in plain words, for example:\n" +
  "• what is QNH\n" +
  "• explain the 1 in 60 rule\n" +
  "• how much are the live classes\n\n" +
  "I answer only from our verified notes and question bank. If I don't have a verified answer, I'll say so and put you in touch with our instructor instead of guessing.";

const FREE =
  "Everything below is free — no login, no payment:\n\n" +
  "• Chapter notes for every CPL/ATPL subject\n" +
  "• Over 4,000 practice questions, most with worked explanations\n" +
  "• Past paper banks\n" +
  "• RTR(A) radio simulator — practise real R/T calls\n" +
  "• ADAPT airline-screening aptitude simulator";

const CLASSES =
  "Live online DGCA ground classes — small batches of 10, taught live, 4–6 weeks per subject.\n\n" +
  `• Per subject: ${LIVE_PRICE} (list ${LIVE_LIST_PRICE})\n` +
  `• Navigation combo — Gen Nav + Radio Nav + Instruments: ${LIVE_COMBO_PRICE} (list ${LIVE_COMBO_LIST_PRICE})\n\n` +
  "Subjects: Meteorology, Air Regulations, General Navigation, Radio Navigation, Instrumentation.\n\n" +
  `Pay any time by UPI: ${LIVE_UPI_VPA} (your app will show the name ${LIVE_UPI_PAYEE}). ` +
  "Scan the QR on the page below — the amount is already filled in — then send the screenshot to our instructor to confirm your seat.\n\n" +
  "The free material stays free whether you join or not.";

const RTR =
  "RTR(A) is conducted by DGCA (it moved from WPC in November 2025), so sittings are far more frequent now.\n\n" +
  "Practise full R/T exchanges in the free simulator — not just reading phraseology.";

const ADAPT =
  "Airline cadet screening (Air India, IndiGo, Akasa and others) includes an aptitude test most candidates walk into cold.\n\n" +
  "The free ADAPT simulator is timed and scored in the same shape. Use it before your date, not after.";

const TALK =
  "Tap below to message our instructor on WhatsApp — your enquiry is already written, just send it.";

// --------------------------------------------------------------- buttons

const B = {
  notes: { text: "📚 Free notes", url: abs("/notes") },
  bank: { text: "📝 Question bank", url: abs("/question-bank") },
  rtr: { text: "🎙️ RTR(A) simulator", url: abs("/rtr-simulator") },
  adapt: { text: "🧠 ADAPT test", url: abs("/adapt-test") },
  live: { text: "🎓 Live classes & fees", url: abs("/live-classes") },
  talk: (topic?: string) => ({ text: "💬 Talk to our instructor", url: talkLink(topic) }),
};

export const MENU: BotButton[][] = [
  [B.notes, B.bank],
  [B.rtr, B.adapt],
  [B.live],
  [B.talk()],
];

// -------------------------------------------------------------- commands

/** "/start", "/start@SomeBot", "/Fees extra" -> "start" / "fees". */
export function commandOf(text: string): string | null {
  const m = /^\/([a-z_]+)(?:@\w+)?(?:\s|$)/i.exec(text.trim());
  return m ? m[1].toLowerCase() : null;
}

function commandReply(cmd: string): BotReply | null {
  switch (cmd) {
    case "start":
    case "help":
    case "menu":
      return { text: WELCOME, buttons: MENU };
    case "free":
    case "notes":
      return { text: FREE, buttons: [[B.notes, B.bank], [B.rtr, B.adapt]] };
    case "classes":
    case "fees":
    case "live":
    case "join":
      return {
        text: CLASSES,
        buttons: [
          [{ text: `💳 Pay by UPI — ${LIVE_PRICE} / ${LIVE_COMBO_PRICE}`, url: abs("/live-classes#pay") }],
          [B.live],
          [B.talk("live classes")],
        ],
      };
    case "rtr":
      return { text: RTR, buttons: [[B.rtr], [B.talk("RTR(A)")]] };
    case "adapt":
      return { text: ADAPT, buttons: [[B.adapt], [B.talk("airline screening")]] };
    case "talk":
    case "contact":
      return { text: TALK, buttons: [[B.talk()]] };
    default:
      return null;
  }
}

// ------------------------------------------------------------ free text

/** The button must say what the link actually is — a sales page labelled
 *  "Read the full chapter" is a small lie a student notices. */
function labelFor(href: string): string {
  if (/wa\.me|whatsapp/i.test(href)) return "💬 Message on WhatsApp";
  if (/\/live-classes/.test(href)) return "🎓 See batches & enrol";
  if (/\/rtr-simulator/.test(href)) return "🎙️ Open the RTR simulator";
  if (/\/adapt-test/.test(href)) return "🧠 Open the ADAPT test";
  if (/\/guides\//.test(href)) return "📖 Read the guide";
  if (/\/(notes|questions)(\/|$|#)/.test(href) || /\/cpl\/|\/atpl\//.test(href)) return "📖 Read the full chapter";
  return "🔗 Open on the site";
}

/**
 * One message in, one reply out. Never throws — a bot that crashes on a bad
 * message gets the same update re-delivered by Telegram until it gives up.
 */
export async function replyFor(rawText: string): Promise<BotReply> {
  const text = (rawText || "").trim();
  if (!text) return { text: WELCOME, buttons: MENU };

  const cmd = commandOf(text);
  if (cmd) {
    const r = commandReply(cmd);
    if (r) return { ...r, text: clip(r.text) };
    return { text: WELCOME, buttons: MENU };
  }

  try {
    const reply = await askDeep(text.slice(0, 500), readContext("/"));

    if (reply.kind === "answer") {
      const rows: BotButton[][] = [];
      if (reply.href) rows.push([{ text: labelFor(reply.href), url: abs(reply.href) }]);
      const alreadyLive = reply.href ? /\/live-classes/.test(reply.href) : false;
      rows.push(alreadyLive ? [B.talk(text)] : [B.live, B.talk(text)]);
      return { text: clip(reply.text), buttons: rows };
    }

    // A refusal is the honest outcome — never dress a guess up as an answer.
    // Out-of-scope still gets the menu so the student knows what IS here.
    if (reply.reason === "out-of-scope") {
      return { text: clip(reply.text), buttons: MENU };
    }
    return {
      text: clip(reply.text + "\n\nOur instructor can answer this one directly:"),
      buttons: [[B.talk(text)], [B.notes, B.bank]],
    };
  } catch {
    return {
      text: "Something went wrong on my side answering that. Our instructor can help directly:",
      buttons: [[B.talk(text)], [B.notes]],
    };
  }
}
