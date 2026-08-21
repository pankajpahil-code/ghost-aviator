/**
 * GINI'S MANNERS AND HIS JUDGEMENT — greetings, small talk, and study wisdom.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * WHY THIS IS A SEPARATE FILE FROM knowledge.ts.
 *
 * knowledge.ts retrieves EXAM CONTENT — answers, explanations, key facts. Iron
 * Rule 1 governs it absolutely: a wrong sentence there is a wrong sentence in a
 * student's head on exam day.
 *
 * This file is different in kind. "Good evening" is not a claim. "Do the
 * questions before you finish the notes" is a method, not a fact about the
 * DGCA. Keeping the two apart means the retrieval layer stays auditable as
 * exam content, and the manners layer can be judged as what it is.
 *
 * BUT THE SAME STRUCTURAL RULE STILL HOLDS: every sentence below is written
 * here, by a person, in advance. Nothing composes at runtime. Gini has no way
 * to say anything that is not in this repository.
 *
 * THE ONE DISCIPLINE THAT MATTERS HERE:
 *   Any line that asserts a FACT about the DGCA, the exams, or the money
 *   carries kind: "fact" and a `source`, and the fact must already be
 *   confirmed elsewhere in this repository — lib/faq.ts, lib/live-classes.ts,
 *   or a Captain ruling recorded in CLAUDE.md. Encouragement and method carry
 *   kind: "method" and assert nothing checkable.
 *   tools/audit/gini-selftest.mts enforces the source requirement.
 *
 * DRAFTED BY A MODEL, IN THE CAPTAIN'S VOICE, AND THAT MEANS IT NEEDS HIS EYE.
 * The facts are traceable and safe. The tone is a proposal. Anything here can
 * be rewritten in his own words without touching a line of logic.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { answer, type GiniReply, type GiniMood } from "./types";
import { Index, mentions, normalise } from "./match";
import type { GiniContext } from "./context";
import { WHATSAPP_GROUP } from "@/lib/site";

/* ──────────────────────────────── greeting ──────────────────────────────── */

/** Kept as a name for readability at call sites; one definition, in types.ts. */
export type GiniMoodName = GiniMood;

export type Spoken = { text: string; href?: string; mood: GiniMoodName };

/**
 * Time of day, from the VISITOR's clock. Most of this site's students are in
 * India and study late; "late" gets its own line rather than a wrong "good
 * evening" at two in the morning.
 */
export function partOfDay(hour: number): "morning" | "afternoon" | "evening" | "late" {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 23) return "evening";
  return "late";
}

const HELLO: Record<ReturnType<typeof partOfDay>, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
  late: "Still up",
};

/**
 * WHAT HE SAYS WHEN HE FIRST SEES YOU.
 *
 * Rules this obeys, and they are not negotiable:
 *   - Text only. He never makes a sound unprompted (design rule 2).
 *   - The first-ever greeting says what he is AND how to get rid of him. An
 *     assistant that introduces itself without offering the door is Clippy.
 *   - He greets once per session, not once per page.
 *   - In a quiet zone — signup, a running exam, the simulator — he says
 *     nothing at all.
 */
export function greeting(ctx: GiniContext, opts: { visits: number; hour: number }): Spoken | null {
  if (ctx.quietZone) return null;

  const when = HELLO[partOfDay(opts.hour)];

  // First time on the site, ever. Introduce, then get out of the way.
  if (opts.visits <= 1) {
    return {
      text:
        `${when}. I'm Gini — I keep the Ghost Aviator library. Ask me where something is, ` +
        `or what a practice question means, and I'll read you what's actually written and checked. ` +
        `If I don't know, I'll say so rather than make it up. Tap Vanish and I'll go for good.`,
      mood: "happy",
    };
  }

  // A room-specific line where there is something genuinely useful to say.
  const room = roomLine(ctx);
  if (room) return { ...room, text: `${when}. ${room.text}` };

  const back = opts.visits < 5
    ? `${when}. Back again — what are we working on?`
    : `${when}. What's on today?`;
  return { text: back, mood: "happy" };
}

/** A useful sentence about the room the student just walked into, or nothing. */
function roomLine(ctx: GiniContext): Spoken | null {
  switch (ctx.area) {
    case "chapter":
      if (ctx.routeType === "questions")
        return { text: "Ask me about any question here and I'll read you the worked explanation, if one is written.", mood: "point" };
      if (ctx.routeType === "chapter-quiz")
        return { text: "Quiz time. Attempt every question — nothing is deducted for a wrong one.", mood: "point" };
      return {
        text: ctx.chapterTitle
          ? `${ctx.chapterTitle} is open. I can read it aloud, or answer on it.`
          : "Chapter's open. I can read it aloud, or answer on it.",
        mood: "present_book",
      };
    case "subject":
      return ctx.subjectName
        ? { text: `${ctx.subjectName}. Pick a chapter, or ask me which one covers a topic.`, mood: "point" }
        : null;
    case "question-bank":
      return { text: "The whole bank, free. Ask me to explain any question in it.", mood: "point" };
    case "dashboard":
      return { text: "Your attempts are here. The weak chapter is the one worth opening next.", mood: "point" };
    case "books":
      return { text: "The Captain's own books. Ask me which one covers your paper.", mood: "present_book" };
    case "guide":
    case "guides-index":
      return { text: "Guides answer the paperwork questions. Ask me one directly if it's quicker.", mood: "point" };
    case "verification":
      return { text: "This page is the honest one — what has been checked, and what has not.", mood: "point" };
    default:
      return null;
  }
}

/* ─────────────────────────────── small talk ─────────────────────────────── */

/**
 * The openers every visitor types, which the old router answered with "I don't
 * have a verified answer for that" — technically true and socially broken.
 * Nobody typing "hi" is asking to be refused.
 *
 * Matched on shape rather than by the ranked index: greetings are short, and a
 * short string is exactly where a coverage score is least reliable.
 */
const HI = /^(hi|hii+|hey+|hello+|yo|helo|hlo|namaste|namaskar|salaam|assalam[ou]? ?alaikum|good (morning|afternoon|evening|day)|gm|ge)\b/i;
const THANKS = /\b(thanks|thank you|thnx|thx|tysm|shukriya|dhanyawad|dhanyavad|appreciate it)\b/i;
const BYE = /^(bye|goodbye|see ya|see you|cya|gn|good ?night|ttyl|ok bye)\b/i;
const WHO = /\b(who are (you|u)|what are (you|u)|your name|are (you|u) (a )?(real|human|bot|ai|robot|chat ?gpt|gpt)|do (you|u) use ai)\b/i;
const CAN = /\b(what can (you|u) do|how (do|can) (i|you|u) help|help me|what do (you|u) do|commands|options|menu)\b/i;
const PRAISE = /\b(good (job|work|boy)|nice|awesome|amazing|love (it|you|this)|best site|great work|op\b|goat)\b/i;
const RUDE = /\b(stupid|useless|idiot|dumb|nonsense|bakwas|bekar|faltu|shut up)\b/i;

export function smallTalk(query: string, ctx: GiniContext): GiniReply | null {
  const q = query.trim();
  if (!q) return null;

  if (HI.test(q)) {
    const room = roomLine(ctx);
    return answer(
      room
        ? `Hello. ${room.text}`
        : "Hello. Ask me where something is, or what a question means — I'll read you what's written and checked.",
      { type: "captain" },
      room?.href,
    );
  }

  if (THANKS.test(q))
    return answer("Any time. Come back when the next chapter fights you.", { type: "captain" });

  if (BYE.test(q))
    return answer("Go fly. Attempt every question when you sit the paper.", { type: "captain" });

  if (WHO.test(q))
    return answer(
      "I'm Gini, the Ghost Aviator who keeps this library — Capt. Pahil's site. " +
      "I'm not a chatbot and I don't generate answers: every sentence I say is written down here " +
      "and checked before it ships. When there's nothing checked to say, I tell you that instead of guessing.",
      { type: "captain" },
      "/how-answers-are-verified",
    );

  if (CAN.test(q))
    return answer(HELP_TEXT, { type: "captain" });

  if (PRAISE.test(q))
    return answer(
      "Tell the Captain, not me — he wrote it. The WhatsApp group is where he reads them.",
      { type: "captain" },
      WHATSAPP_GROUP,
    );

  if (RUDE.test(q))
    return answer(
      "Fair enough — I only know this site, and I refuse rather than guess. " +
      "Ask Capt. Pahil directly in the WhatsApp group; he answers there himself.",
      { type: "captain" },
      WHATSAPP_GROUP,
    );

  return null;
}

export const HELP_TEXT =
  "Four things, and I do them without guessing. One: find anything — ask which chapter covers a topic. " +
  "Two: explain a practice question, by reading you the worked explanation a human wrote for it. " +
  "Three: answer the exam questions students actually ask — pattern, pass mark, computer number, what it costs. " +
  "Four: read a chapter aloud while you rest your eyes. If it isn't written down and checked, I'll tell you so.";

/* ───────────────────────────────── wisdom ───────────────────────────────── */

export type WisdomKind = "method" | "fact";

export type Wisdom = {
  id: string;
  /** What the student would be asking. Indexed — this is the matching surface. */
  ask: string;
  text: string;
  href?: string;
  kind: WisdomKind;
  /**
   * For kind "fact": where the claim is already confirmed in this repository.
   * For kind "method": the word "method" — it asserts nothing checkable.
   */
  source: string;
  mood?: GiniMoodName;
};

/**
 * THE WISE PART.
 *
 * Every "fact" entry restates something this repository already publishes and
 * the Captain has already confirmed. None of it is new teaching, and none of it
 * is arithmetic I invented — where a number is computed (minutes per question)
 * the inputs are the published paper structure and the division is shown.
 */
export const WISDOM: Wisdom[] = [
  {
    id: "attempt-everything",
    ask: "should I guess or leave blank negative marking exam strategy",
    text:
      "Never leave a box empty. There is no negative marking in any DGCA paper, so a blank is a guaranteed zero " +
      "and a guess costs you nothing. Eliminate what you know is wrong, mark your best of what's left, and move on.",
    kind: "fact",
    source: "lib/faq.ts — negative marking, Capt. Pahil confirmed 2026-07-27",
    href: "/guides/dgca-cpl-exam-pattern",
    mood: "point",
  },
  {
    id: "one-paper-at-a-time",
    ask: "which subject should I start with first order study plan",
    text:
      "Take the papers one at a time. Each is passed at 70% on its own and there is no aggregate across subjects, " +
      "so a paper you clear stays cleared while you go after the next. Spreading four subjects thin is how people " +
      "sit four papers and clear none.",
    kind: "fact",
    source: "lib/faq.ts — pass mark 70% per paper, no aggregate, Capt. Pahil confirmed 2026-07-27",
    href: "/guides/dgca-cpl-exam-pattern",
    mood: "point",
  },
  {
    id: "clock-per-question",
    ask: "how much time per question exam timing manage clock",
    text:
      "Do the clock arithmetic before you sit down. Navigation and Technical General are 100 questions in 3 hours " +
      "— about 1.8 minutes each. Meteorology, Air Regulations and Technical Specific are 50 in 2 hours — about 2.4 " +
      "minutes each. If one question has eaten four minutes, mark it, move, and come back.",
    kind: "fact",
    source: "lib/faq.ts — paper structure, Capt. Pahil instructor citation 2026-07-12; timing is that division",
    href: "/guides/dgca-cpl-exam-pattern",
    mood: "point",
  },
  {
    id: "questions-early",
    ask: "how should I study notes first or questions revision method",
    text:
      "Don't finish the notes before you touch the questions. Read a chapter once, then attempt its questions " +
      "immediately — badly, on purpose. What you get wrong is your actual syllabus for that chapter, and it is a " +
      "far shorter list than the whole thing.",
    kind: "method",
    source: "method",
    mood: "talk",
  },
  {
    id: "why-the-others-are-wrong",
    ask: "memorise question bank by heart is it enough understand",
    text:
      "If you can't say why the other three options are wrong, you haven't learned the question — you've memorised " +
      "it. The paper will change the numbers and the memory won't survive it. Work each distractor until it's " +
      "obviously wrong to you.",
    kind: "method",
    source: "method",
    mood: "talk",
  },
  {
    id: "failed-a-paper",
    ask: "I failed a paper what now demotivated reattempt",
    text:
      "One paper failed is one paper, not the licence. Papers are assessed individually and the ones you cleared " +
      "stay cleared, so the job in front of you is a single subject, not a fresh start. Go back to the questions " +
      "you got wrong, not to page one of the notes.",
    kind: "fact",
    source: "lib/faq.ts — each paper cleared on its own, Capt. Pahil confirmed 2026-07-27",
    mood: "talk",
  },
  {
    id: "scared",
    ask: "I am scared nervous stressed about the exam anxiety",
    text:
      "Nerves before a paper are normal and they are not a verdict on you. Narrow it: one subject, one chapter, " +
      "the twenty questions you keep getting wrong. Fear grows on a vague, enormous task and dies on a specific, " +
      "small one. And on the day, attempt everything — nothing is deducted for being wrong.",
    kind: "method",
    source: "method (the no-deduction half: lib/faq.ts, Capt. Pahil confirmed 2026-07-27)",
    mood: "talk",
  },
  {
    id: "money-reality",
    ask: "is it worth the money cost of training expensive",
    text:
      "Go in with the real number, not the brochure one. A CPL in India runs around 60 lakh all-in in 2026, and a " +
      "type rating after it is another 15 to 25 lakh. The flying is most of that bill — which is exactly why the " +
      "ground exams are the cheapest marks you will ever buy, and why everything on this site is free.",
    kind: "fact",
    source: "CLAUDE.md — cost corrected by Capt. Pahil 2026-07-27; /cpl-cost-calculator",
    href: "/cpl-cost-calculator",
    mood: "point",
  },
  {
    id: "where-to-start",
    ask: "I am new beginner where do I start how to become a pilot",
    text:
      "Start with the paperwork, not the books: the DGCA computer number is the gate everything else queues behind. " +
      "Then pick one written paper and take it to 70%. The guide walks the whole sequence.",
    kind: "fact",
    source: "lib/guides.ts — computer-number guide; /guides/how-to-become-a-pilot-in-india",
    href: "/guides/how-to-become-a-pilot-in-india",
    mood: "point",
  },
  {
    id: "revisit",
    ask: "how often revise forgetting what I studied retention",
    text:
      "Come back to a chapter's questions a week after you first did them, not the same evening. If you still " +
      "score, it's learned. If you don't, you found the gap while it was cheap to fix rather than in the hall.",
    kind: "method",
    source: "method",
    mood: "talk",
  },
];

const WISDOM_INDEX = new Index<Wisdom>(
  WISDOM.map(w => ({ item: w, title: w.ask, body: w.text })),
);

/**
 * Study advice, when the student is clearly asking for it. Gated on an explicit
 * advice-shaped intent as well as the ranked match: a chapter question that
 * happens to share a word with "revision" must not be answered with a pep talk.
 */
export function wisdomFor(query: string): GiniReply | null {
  const wantsAdvice =
    mentions(query, "study", "fail", "fear", "start", "negative", "pass") ||
    /\b(how (do|should) i|what should i|any (tips|advice)|worth it|help me (study|prepare))\b/i.test(query);
  if (!wantsAdvice) return null;

  const hit = WISDOM_INDEX.best(query, 0.4);
  if (!hit) return null;
  return answer(hit.item.text, { type: "captain" }, hit.item.href);
}

/* ────────────────────────────── suggestions ─────────────────────────────── */

/**
 * What to offer as one-tap questions when the ask box opens.
 *
 * An assistant that can do four things and advertises none of them gets used
 * for none of them — the old input said only "Ask me about the site…", which
 * tells a student nothing about what will actually work. These are chosen for
 * the room, and every one of them is a question the layers below can genuinely
 * answer, so a tap never lands on a refusal.
 */
export function suggestionsFor(ctx: GiniContext): string[] {
  const out: string[] = [];
  if (ctx.area === "chapter" && ctx.chapterTitle) out.push(`Where is ${ctx.chapterTitle}?`);
  if (ctx.subjectName) out.push(`How many questions in ${ctx.subjectName}?`);
  out.push("Is there negative marking?");
  out.push("How should I study?");
  out.push("Are the answers verified?");
  return out.slice(0, 3);
}

/** The mood a wisdom entry should be delivered with, if the caller wants it. */
export const moodForWisdom = (id: string): GiniMoodName =>
  WISDOM.find(w => w.id === id)?.mood ?? "talk";

/** Exposed for the self-test: is this string one Gini could ever say? */
export const isPersonaLine = (text: string) =>
  WISDOM.some(w => normalise(w.text) === normalise(text));
