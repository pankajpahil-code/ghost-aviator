/**
 * GINI SELLING — and the rules that stop him becoming the thing everyone hates.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * THE JOB. The notes, the question bank, the mock tests, the simulator and the
 * Captain's books are free and stay free. He also teaches live batches, and a
 * receptionist who never mentions them is not doing his job. Both halves are
 * true at once and Gini says both.
 *
 * THE HONESTY GUARDS, which are enforced by tools/audit/gini-selftest.mts and
 * are not style preferences:
 *
 *   1. NO FABRICATED URGENCY. No "only 2 seats left", no countdown, no "offer
 *      ends". The batch size of ten is a real fact from lib/live-classes.ts;
 *      invented scarcity is a lie told to a student about money.
 *   2. NO PRICE TYPED BY HAND. Every figure is imported from lib/live-classes.ts,
 *      so what Gini quotes and what the page charges cannot drift apart.
 *   3. NEVER IMPLY THE FREE THINGS WILL STOP BEING FREE. That is the oldest
 *      trick in this market and it is not available here.
 *   4. NO CLAIM THAT IS NOT ALREADY ON THE SITE. Every pitch below describes
 *      something a student can go and check in one click.
 *
 * THE FREQUENCY DISCIPLINE, which is the real difference between a guide and
 * an ad: he waits out a warm-up before the first pitch, leaves a long gap
 * between pitches, caps them per session, never repeats one, and says nothing
 * at all in a quiet zone — a running exam, the simulator, signup, or the
 * pricing page he would be pitching.
 * ────────────────────────────────────────────────────────────────────────────
 */

import type { GiniContext } from "./context";
import type { GiniMoodName } from "./persona";
import { answer, type GiniReply } from "./types";
import { Index } from "./match";
import { CORPUS } from "./generated/corpus-stats";
import {
  LIVE_PRICE, LIVE_LIST_PRICE, LIVE_COMBO_PRICE, LIVE_COMBO_LIST_PRICE,
  LIVE_CLASS_SUBJECTS, LIVE_COMBO_SUBJECTS,
} from "@/lib/live-classes";
import { TELEGRAM_GROUP, WHATSAPP_GROUP, YOUTUBE_PERSONAL } from "@/lib/site";

export type PitchKind = "paid" | "free" | "community" | "trust";

export type Pitch = {
  id: string;
  kind: PitchKind;
  /** Built from context so a subject page gets its own subject named. */
  say: (ctx: GiniContext) => string;
  href: (ctx: GiniContext) => string;
  /** Where this is worth saying at all. */
  fits: (ctx: GiniContext) => boolean;
  /** Ties are broken by weight; higher goes first. */
  weight: number;
  mood: GiniMoodName;
  /** What a student would have to type for this to be the direct answer. */
  ask: string;
};

const anywhere = () => true;

/** The subject in play, if the student is standing in one that has a batch. */
const liveSubject = (ctx: GiniContext) =>
  ctx.subjectId && LIVE_CLASS_SUBJECTS[ctx.subjectId]
    ? LIVE_CLASS_SUBJECTS[ctx.subjectId]
    : null;

export const PITCHES: Pitch[] = [
  /* ─────────────────────────── the paid path ─────────────────────────── */
  {
    id: "live-subject",
    kind: "paid",
    ask: "live classes batch coaching for this subject price fees join",
    fits: ctx => !!liveSubject(ctx),
    weight: 10,
    mood: "present_book",
    say: ctx =>
      `Capt. Pahil teaches ${liveSubject(ctx)} live himself — ten students in a batch, so every question gets ` +
      `answered. ${LIVE_PRICE} for the subject, down from ${LIVE_LIST_PRICE}. Everything you're reading here stays free either way.`,
    href: () => "/live-classes",
  },
  {
    id: "live-combo",
    kind: "paid",
    ask: "navigation combo three subjects together package",
    fits: ctx => !!ctx.subjectId && LIVE_COMBO_SUBJECTS.includes(ctx.subjectId),
    weight: 9,
    mood: "present_book",
    say: () =>
      `The DGCA Navigation paper is really three subjects — General Navigation, Radio Navigation and ` +
      `Instrumentation. The Captain teaches all three live as one course, ${LIVE_COMBO_PRICE} instead of ` +
      `${LIVE_COMBO_LIST_PRICE}.`,
    href: () => "/live-classes",
  },
  {
    id: "live-general",
    kind: "paid",
    ask: "live classes online coaching batch price fees join admission",
    fits: ctx => !liveSubject(ctx),
    weight: 4,
    mood: "present_book",
    say: () =>
      `If a subject is fighting you, the Captain runs live batches of ten — ${LIVE_PRICE} a subject, or ` +
      `${LIVE_COMBO_PRICE} for the whole Navigation combo. The free material here doesn't change either way.`,
    href: () => "/live-classes",
  },

  /* ──────────────────────── the free flagship assets ──────────────────── */
  {
    id: "simulator",
    kind: "free",
    ask: "rtr simulator practice atc calls radiotelephony phraseology",
    fits: ctx => ctx.area !== "simulator",
    weight: 8,
    mood: "thunder",
    say: () =>
      "There's a live R/T simulator on this site — you fly a sequence and talk to an ATC that answers back. " +
      "Speak your calls or type them; both are scored the same way. Free, and there is nothing else like it in India.",
    href: () => "/rtr-simulator",
  },
  {
    id: "question-bank",
    kind: "free",
    ask: "question bank practice questions mcq free how many",
    fits: ctx => ctx.area !== "question-bank",
    weight: 6,
    mood: "point",
    say: () =>
      `The question bank is ${CORPUS.total.toLocaleString("en-IN")} questions, chapter by chapter, free and with no sign-up. ` +
      `I can read you the worked explanation on ${CORPUS.speakable.toLocaleString("en-IN")} of them.`,
    href: () => "/question-bank",
  },
  {
    id: "mock-tests",
    kind: "free",
    ask: "mock test full paper timed exam practice",
    fits: ctx => ctx.area !== "exam",
    weight: 6,
    mood: "point",
    say: () =>
      "Full mock papers on the real DGCA pattern and the real clock, free. Sitting one timed paper teaches you " +
      "more about your pace than another evening of notes.",
    href: () => "/exam",
  },
  {
    id: "books",
    kind: "free",
    ask: "books written by captain pahil study material read",
    fits: ctx => ctx.area !== "books",
    weight: 5,
    mood: "present_book",
    say: () =>
      "The Captain writes his own books — Air Regulations, Meteorology, Navigation, Radio Navigation, RTR(A) and " +
      "Human Performance — and every one of them is on this site to read, free.",
    href: () => "/books",
  },
  {
    id: "video",
    kind: "free",
    ask: "video lectures youtube channel watch",
    fits: anywhere,
    weight: 4,
    mood: "point",
    say: () =>
      "He teaches on YouTube too: @PankajPahil carries the Radio Navigation series, @Capt.GhostAviator covers " +
      "Air Regulations and Meteorology. Both free.",
    href: () => YOUTUBE_PERSONAL,
  },

  /* ───────────────────────────── the community ────────────────────────── */
  {
    id: "whatsapp",
    kind: "community",
    ask: "whatsapp group helpline doubt ask captain contact",
    fits: anywhere,
    weight: 7,
    mood: "point",
    say: () =>
      "When something won't go in, ask a human. The WhatsApp group — D.G.C.A Exams HelpLine — is where the " +
      "Captain answers doubts himself.",
    href: () => WHATSAPP_GROUP,
  },
  {
    id: "telegram",
    kind: "community",
    ask: "telegram group updates notes channel",
    fits: anywhere,
    weight: 5,
    mood: "point",
    say: () => "New notes and exam updates land in the Telegram group before anywhere else.",
    href: () => TELEGRAM_GROUP,
  },

  /* ────────────────────────────── the trust asset ─────────────────────── */
  {
    id: "verification",
    kind: "trust",
    ask: "are the answers verified accurate can I trust this source",
    fits: ctx => ctx.area !== "verification",
    weight: 6,
    mood: "point",
    say: () =>
      "Before you trust a single answer here, read what has actually been checked and what hasn't — it's written " +
      "down honestly, subject by subject. Most sites in this market will not tell you that.",
    href: () => "/how-answers-are-verified",
  },
  {
    id: "guides",
    kind: "free",
    ask: "guide computer number how to become pilot paperwork process",
    fits: ctx => ctx.area !== "guide" && ctx.area !== "guides-index",
    weight: 3,
    mood: "point",
    say: () =>
      "The paperwork questions — computer number, exam pattern, what the training actually costs — are answered " +
      "in the guides rather than buried in a forum thread.",
    href: () => "/guides",
  },
];

/* ─────────────────── answering a direct question about them ─────────────── */

const PITCH_INDEX = new Index<Pitch>(
  PITCHES.map(p => ({ item: p, title: p.ask })),
);

/**
 * When a student ASKS about classes, groups, videos or the bank, that is not a
 * pitch — it is the answer to their question, and none of the frequency rules
 * apply. Context still chooses which variant: on a Meteorology page, "how much
 * are classes" should name the Meteorology batch.
 */
export function offerFor(query: string, ctx: GiniContext): GiniReply | null {
  const hits = PITCH_INDEX.search(query, 0.5, 4);
  if (!hits.length) return null;
  const fitting = hits.find(h => h.item.fits(ctx)) ?? hits[0];
  const p = fitting.item;
  return answer(p.say(ctx), { type: "captain" }, p.href(ctx));
}

/* ───────────────────────── the unprompted pitch ─────────────────────────── */

/** State the caller keeps for the session. Nothing here is persisted to a server. */
export type PitchState = {
  /** Pitch ids already used this session — never repeated. */
  shown: string[];
  /** ms timestamp of the last unprompted pitch, or 0. */
  lastAt: number;
  /** ms timestamp the session started. */
  startedAt: number;
};

export const PITCH_RULES = {
  /** Nothing is offered until the student has been here this long. Let them read. */
  WARMUP_MS: 90_000,
  /** Minimum gap between two unprompted pitches. */
  GAP_MS: 240_000,
  /** Hard cap per session. Four would be an ad campaign. */
  MAX_PER_SESSION: 3,
} as const;

/**
 * The one Gini may volunteer right now, or null — and null is the common,
 * correct answer. Deterministic given its inputs, so it can be tested.
 *
 * `roll` is a caller-supplied number in [0,1) used only to vary which of the
 * equally-suitable pitches comes up, so the same student does not hear the
 * inventory in the same order every session.
 */
export function choosePitch(
  ctx: GiniContext,
  state: PitchState,
  now: number,
  roll: number,
): Pitch | null {
  if (ctx.quietZone) return null;
  if (state.shown.length >= PITCH_RULES.MAX_PER_SESSION) return null;
  if (now - state.startedAt < PITCH_RULES.WARMUP_MS) return null;
  if (state.lastAt && now - state.lastAt < PITCH_RULES.GAP_MS) return null;

  const eligible = PITCHES.filter(p => p.fits(ctx) && !state.shown.includes(p.id));
  if (!eligible.length) return null;

  // Weight decides the shortlist; the roll decides within it. A student on a
  // Meteorology chapter therefore reliably hears about Meteorology, without
  // hearing the identical line in the identical order next time.
  const top = Math.max(...eligible.map(p => p.weight));
  const shortlist = eligible.filter(p => p.weight >= top - 2);
  return shortlist[Math.floor(roll * shortlist.length) % shortlist.length];
}

/**
 * Exposed for the self-test. Anything matching this is fabricated pressure and
 * must never appear in a pitch.
 */
export const FAKE_URGENCY =
  /\b(only \d+ (seats?|spots?|places?) (left|remaining)|hurry|limited time|last chance|offer ends|act now|don'?t miss out|book now before|selling fast|few seats)\b/i;

/** Exposed for the self-test. Gini must never suggest the free material will end. */
export const FREE_THREAT =
  /\b(free (for a limited|until|till|only until)|won'?t stay free|going paid|before it becomes paid|price goes up)\b/i;
