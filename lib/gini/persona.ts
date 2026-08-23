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

import { answer, type GiniReply, type GiniMood, type GiniSource } from "./types";
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

/* ────────────────────────── staying in his lane ────────────────────────── */

/**
 * OFF THE PREMISES.
 *
 * The Captain's instruction, 2026-08-21: Gini talks about DGCA, aviation, this
 * website and the classes. Nothing else. Not politics, not cricket, not films,
 * not general knowledge, not somebody's homework.
 *
 * Two reasons, and the second is the real one. The obvious one is focus. The
 * important one is that every sentence outside this scope is a sentence nobody
 * verified, on a site whose entire claim is that it does not publish unverified
 * sentences. A mascot cheerfully rating cricket teams is a mascot the student
 * has been taught to believe about airspace too.
 *
 * The decline is WARM and it always offers the door back. Being told "that's
 * not something I do" by a polite host is fine; being stonewalled is not.
 */
const OFF_TOPIC =
  /\b(cricket|ipl|football|match score|movie|film|bollywood|song|lyrics|politic|election|modi|stock|crypto|bitcoin|recipe|joke|poem|homework|assignment|essay|code|python|javascript|girlfriend|boyfriend|love|marriage|horoscope|astrolog|medicine|doctor|symptom|lawyer|legal advice|weather (today|tomorrow) in)\b/i;

/** Concepts that mean the question IS our business after all. */
const IN_SCOPE =
  /\b(dgca|cpl|atpl|ppl|pilot|aviation|aircraft|aeroplane|airplane|flying|flight|exam|paper|syllabus|licence|license|met|meteorolog|navigation|regulation|instrument|technical|rtr|radio|simulator|chapter|notes|question|class|batch|fee|price|captain|pahil|ghost aviator|site|website|book|lecture|video|weather)\b/i;

/**
 * Is this outside the house? Deliberately conservative: an off-topic word only
 * counts when nothing in the sentence is our business, so "what is the weather
 * like at altitude" stays in scope while "weather today in Delhi" does not.
 */
export const isOffTopic = (query: string) =>
  OFF_TOPIC.test(query) && !IN_SCOPE.test(query);

/** Stored, so a decline is always in his voice — never improvised. */
export const DECLINES: string[] = [
  "That's outside what I do, I'm afraid — I look after Capt. Pahil's flying school and nothing else. Ask me about the DGCA papers, any chapter here, or his classes.",
  "I'll be honest and stay in my lane: I only know aviation, these exams and this site. Anything on those, and I'm genuinely useful.",
  "Not my department. I keep the library here — DGCA subjects, the question bank, the simulator, the Captain's classes. What are you preparing for?",
];

/** One decline, chosen without repeating the previous one. */
export function declineOffTopic(seed: number): GiniReply {
  return answer(DECLINES[Math.abs(seed) % DECLINES.length], { type: "captain" });
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

/* ────────────────────────── carrying on a conversation ────────────────────── */

/**
 * WHAT A HOST SAYS NEXT.
 *
 * A receptionist who answers your question, falls silent and waits for you to
 * think of another one is technically correct and useless. After every answer
 * Gini offers two or three things worth asking next, chosen for what he just
 * said rather than for the page.
 *
 * THE HARD RULE, and it is the same one suggestionsFor() obeys: every string
 * returned here must be a question the layers below can genuinely answer. A
 * suggestion that lands on "I don't have a verified answer for that" is worse
 * than no suggestion, because Gini offered it himself — he would be walking a
 * student into his own refusal. tools/audit/gini-selftest.mts asks every one of
 * these and fails if any of them refuses.
 *
 * So the pool is drawn only from shapes already proven to answer: a subject's
 * structure, the FAQ entries the probe table covers, the study wisdom, and the
 * Captain's own offers.
 */
export function followUpsFor(
  source: GiniSource | null,
  ctx: GiniContext,
  subjectName?: string,
): string[] {
  const out: string[] = [];
  const subject = subjectName ?? ctx.subjectName;

  // What he just talked about comes first — that is what "following up" means.
  if (source?.type === "chapter-topic" || source?.type === "explanation" || source?.type === "key-fact") {
    if (subject) out.push(`How many questions in ${subject}?`);
    out.push("How should I study?");
  }

  if (source?.type === "faq") {
    out.push("Are the answers verified?");
    out.push("Is this site free?");
  }

  if (source?.type === "captain") {
    out.push("How much are the live classes?");
    out.push("Is there a WhatsApp group?");
  }

  if (source?.type === "structure") {
    /**
     * NOT "Does the Captain teach <subject> live?", which reads better and
     * which the self-test caught him being unable to answer: that phrasing
     * shares only the concept {classes} with the offer index and scores 0.25
     * against a 0.5 floor. Lowering that floor to rescue one suggestion would
     * loosen how every question about the courses is matched, to fix a sentence
     * nobody had to write this way. The pool's contract is that it only offers
     * what is PROVEN to answer, so the phrasing gives way, not the floor.
     */
    out.push("How much are the live classes?");
  }

  // A refusal is exactly when a student most needs somewhere else to go.
  if (!source) {
    out.push("What can you do?");
    out.push("How should I study?");
  }

  // Always worth knowing, and always answerable.
  out.push("Is there negative marking?");

  return [...new Set(out)].slice(0, 3);
}

/** The mood a wisdom entry should be delivered with, if the caller wants it. */
export const moodForWisdom = (id: string): GiniMoodName =>
  WISDOM.find(w => w.id === id)?.mood ?? "talk";

/** Exposed for the self-test: is this string one Gini could ever say? */
export const isPersonaLine = (text: string) =>
  WISDOM.some(w => normalise(w.text) === normalise(text));
