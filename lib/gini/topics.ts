/**
 * WHAT THE CAPTAIN ACTUALLY TEACHES — searchable.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * THE GAP THIS CLOSES.
 *
 * Gini could search 3,041 worked exam explanations and a 12-entry FAQ. Both are
 * excellent at what they are, and neither is a definition. So:
 *
 *   "what is QNH"  ->  an aerodrome-elevation calculation
 *   "what is drift" ->  "In the NH, if you experience port drift, the altimeter
 *                        will read:"
 *
 * Verified, correct, and answers to questions nobody asked. Meanwhile 234
 * chapters of the Captain's own teaching sat on the site, unreachable unless
 * the student already knew which page to open.
 *
 * This module searches those chapters — by the Captain's own section headings,
 * generated into lib/gini/generated/topics.ts by tools/gini/build-topics.mts.
 *
 * TWO ANSWERS, TWO FLOORS, AND THE DIFFERENCE IS WHAT BEING WRONG COSTS:
 *
 *   - A POINTER ("that is covered under <heading> in <chapter>") asserts
 *     nothing about aviation. Getting it slightly wrong costs one click on a
 *     link that is visibly not what you wanted. Low floor.
 *   - A QUOTE reads one of his sentences out. Getting that wrong puts a real
 *     sentence about the wrong topic in a student's head. Higher floor, and it
 *     is always spoken WITH its heading and a link, so the student can see in
 *     one click what was matched and where it came from.
 *
 * NOTHING HERE IS COMPOSED. Every quoted sentence is verbatim from a chapter
 * already published on ghostaviator.com. The generator's gates decide what is
 * quotable; this file only decides what is relevant.
 *
 * LAZY, LIKE deep.ts. The generated index is ~460 KB, and Gini renders from the
 * root layout on every route. Reach it with `await import("./topics")` — a
 * static import from the client path puts it in every page's bundle and nothing
 * will fail to tell you.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import { GUIDES } from "@/lib/guides";
import { TOPICS, type Topic } from "./generated/topics";
import { Index } from "./match";
import { answer, refuse, type GiniReply } from "./types";

const SUBJECT_NAME: Record<string, string> = Object.fromEntries(
  [...CPL_SUBJECTS, ...ATPL_SUBJECTS].map(s => [s.id, s.name]),
);

const trackOf = (subjectId: string) =>
  CPL_SUBJECTS.some(s => s.id === subjectId) ? "cpl" : "atpl";

const GUIDE_TITLE: Record<string, string> = Object.fromEntries(
  GUIDES.map(g => [g.slug, g.title]),
);

export const topicHref = (t: Topic) =>
  t.g ? `/guides/${t.c}` : `/${trackOf(t.s)}/${t.s}/${t.c}/notes`;

/**
 * How Gini names the place a quoted sentence came from. A guide is not a
 * chapter and must not be announced as one — "from the notes on..." about a
 * page called "How to Apply for a DGCA Computer Number" would be a small lie
 * about where the student is being sent.
 */
const kindOf = (t: Topic) => (t.g ? "the guide" : "the notes");

/** "Air Navigation, Chapter 13", or the guide's own title. */
const whereItLives = (t: Topic) => {
  if (t.g) return `the guide "${GUIDE_TITLE[t.c] ?? t.c}"`;
  const name = SUBJECT_NAME[t.s] ?? t.s;
  return t.n ? `${name}, Chapter ${t.n}` : name;
};

/* ─────────────────────────────── the index ─────────────────────────────── */

/**
 * Built once, on first use — the module is only ever loaded because a student
 * asked something, so there is no cost to a visitor who never types.
 *
 * The heading and its aliases are the TITLE, so a match must be on what the
 * section is called. The subject name and the opener sit in the body, where a
 * match counts for less: a chapter that merely mentions a word in one sentence
 * is not a chapter about that word.
 */
let index: Index<Topic> | null = null;

function getIndex(): Index<Topic> {
  if (index) return index;
  index = new Index<Topic>(
    TOPICS.map(t => ({
      item: t,
      title: [t.t, ...(t.a ?? [])].join(" "),
      body: `${SUBJECT_NAME[t.s] ?? ""} ${t.o ?? ""}`,
    })),
  );
  return index;
}

/**
 * MEASURED AGAINST THE PROBE TABLE IN tools/audit/gini-selftest.mts, not chosen
 * by taste. Change either and re-run it.
 *
 * POINTER_FLOOR is low for the same reason knowledge.ts uses 0.42 for chapter
 * lookup: headings are two or three words, so one filler word in the query
 * halves the coverage score, and the cost of a near-miss is a link.
 *
 * QUOTE_FLOOR is higher because a quote is speech. Between the two floors Gini
 * points instead of speaking, which is the honest middle answer and the one
 * this corpus should give most often.
 */
const POINTER_FLOOR = 0.45;
const QUOTE_FLOOR = 0.62;

/**
 * A SINGLE MATCHED WORD IS ONLY ENOUGH IF IT WAS THE WHOLE QUESTION.
 *
 * The same rule deep.ts applies to the question bank, and it is here for a
 * regression this module caused on the day it was written: "how does a VOR
 * work" came back as *"Communication & Team Work", Air Regulations Chapter 24*.
 * The query's concepts are {vor, work}; that heading shares exactly one of
 * them, "work", and on a coverage score one-of-two is 0.5 — comfortably over
 * the pointer floor. Before this module existed the chapter-title lookup
 * answered that question correctly with Radio Navigation Chapter 8: VOR.
 *
 * So: two or more distinct concepts, or one concept that accounts for
 * essentially the entire query. "What is QNH" reduces to the single concept
 * {qnh} and scores 1.0, so it still answers; "how does a VOR work" no longer
 * answers on "work" alone and falls through to the coarser net that gets it
 * right.
 */
const SOLO_CONCEPT_FLOOR = 0.9;

const admissible = (h: { matched: string[]; inTitle: number; score: number }) =>
  h.inTitle > 0 && (new Set(h.matched).size >= 2 || h.score >= SOLO_CONCEPT_FLOOR);

const SEMICIRCULAR_RULE_QUERY =
  /\bsemi[-\s]?circular\b.*\b(rule|system|cruising|level)\b|\b(rule|system|cruising|level)\b.*\bsemi[-\s]?circular\b/i;
const PHYSIOLOGY_TOPIC = /\b(vestibular|otoliths?|canals?)\b/i;

/** Do not confuse cruising-level rules with the inner-ear semi-circular canals. */
const compatibleWithQuery = (query: string, topic: Topic) =>
  !SEMICIRCULAR_RULE_QUERY.test(query) ||
  !PHYSIOLOGY_TOPIC.test([topic.t, ...(topic.a ?? [])].join(" "));

/** Prefer the subject the student is standing in, without excluding the rest. */
function pick<T extends { item: Topic; score: number }>(hits: T[], subjectId?: string) {
  if (!hits.length) return null;
  const mine = subjectId ? hits.find(h => h.item.s === subjectId) : undefined;
  return mine ?? hits[0];
}

function ranked(query: string, subjectId?: string) {
  // .filter(inTitle > 0), inside admissible(), is the codebase idiom for
  // "matched on what this entry is CALLED, not on a passing mention in its
  // text" — the same guard knowledge.ts uses for chapter lookup.
  return pick(
    getIndex().search(query, POINTER_FLOOR, 8)
      .filter(admissible)
      .filter(h => compatibleWithQuery(query, h.item)),
    subjectId,
  );
}

/**
 * A SENTENCE, in the Captain's own words, or nothing.
 *
 * Separated from the pointer deliberately. These are two different answers with
 * two different costs, and the router wants them at two different points in its
 * order: a quote is worth more than a chapter-title match, and a pointer into a
 * section is worth LESS than one, because a chapter title is a coarser but far
 * more reliable statement of what a chapter is about.
 */
export function quoteTopic(query: string, subjectId?: string): GiniReply {
  const best = ranked(query, subjectId);
  if (!best || !best.item.o || best.score < QUOTE_FLOOR) return refuse("not-verified");

  const t = best.item;
  return answer(
    `From ${kindOf(t)} on "${t.t}" — ${t.o}`,
    { type: "chapter-topic", subjectId: t.s, chapterId: t.c, heading: t.t },
    topicHref(t),
  );
}

/** Where on the site this is taught. Asserts nothing about aviation. */
export function pointToTopic(query: string, subjectId?: string): GiniReply {
  const best = ranked(query, subjectId);
  if (!best) return refuse("not-verified");
  const t = best.item;
  return answer(
    `That's covered under "${t.t}", in ${whereItLives(t)}.`,
    { type: "structure" },
    topicHref(t),
  );
}

/**
 * SHORTLIST FOR THE SERVER ROUTER — see lib/gini/candidates.ts.
 *
 * Loose, like every other candidate builder: a poor entry on the menu is
 * harmless because the model simply will not pick it, while a good answer
 * missing from the menu can never be given. Only topics carrying an opener are
 * offered, since a pointer is something the deterministic layer already does
 * perfectly well without spending a model call on it.
 */
export function topTopics(query: string, subjectId: string | undefined, n = 5): Topic[] {
  const hits = getIndex().search(query, 0.3, n * 3)
    .filter(h => h.inTitle > 0 && h.item.o)
    .filter(h => compatibleWithQuery(query, h.item));
  const mine = subjectId ? hits.filter(h => h.item.s === subjectId) : [];
  const rest = hits.filter(h => !mine.includes(h));
  return [...mine, ...rest].slice(0, n).map(h => h.item);
}

/**
 * THE NEAREST THING HE HAS, FOR WHEN THE ANSWER IS NO.
 *
 * A refusal that dead-ends is honest and unhelpful. Gini already tells the
 * student he will not guess; a good host adds where to look next instead of
 * leaving them at a closed door.
 *
 * Deliberately BELOW the pointer floor: this is never presented as an answer,
 * only as "the closest I have", attached to a refusal that has already said it
 * does not know.
 *
 * BUT NOT FAR BELOW, AND THE NUMBER IS MEASURED. At 0.32 a student asking
 * "what is the maximum crosswind limit for a Cessna 152" was told the closest
 * thing was "Maximum Age Limit for Professional Pilots" — a match on the two
 * most generic words in the query, scoring 0.35. A refusal is a promise being
 * kept; following it with something absurd spends the credibility the refusal
 * just earned.
 *
 * Measured against the live index: that nonsense scores 0.35, while genuinely
 * near topics score 0.48-0.73 ("wake turbulence separation" 0.69, "semi
 * circular" 0.73). So the suggestion band sits just under the answer band —
 * close enough to have nearly been an answer, and nothing looser. Offering
 * nothing is the correct outcome for a query with no near neighbour, and the
 * refusal stands perfectly well on its own.
 */
const NEAREST_FLOOR = 0.4;

export function nearestTopic(query: string, subjectId?: string): { label: string; href: string } | null {
  const hits = getIndex().search(query, NEAREST_FLOOR, 6)
    .filter(h => h.inTitle > 0)
    .filter(h => compatibleWithQuery(query, h.item));
  const best = pick(hits, subjectId);
  if (!best) return null;
  return { label: `"${best.item.t}" in ${whereItLives(best.item)}`, href: topicHref(best.item) };
}

/** The stored reply for one topic, so the route never re-searches after a pick. */
export function replyForTopic(t: Topic): GiniReply {
  if (!t.o) {
    return answer(
      `That's covered under "${t.t}", in ${whereItLives(t)}.`,
      { type: "structure" },
      topicHref(t),
    );
  }
  return answer(
    `From ${kindOf(t)} on "${t.t}" — ${t.o}`,
    { type: "chapter-topic", subjectId: t.s, chapterId: t.c, heading: t.t },
    topicHref(t),
  );
}

/** How much of the Captain's teaching is reachable this way. Honest counts. */
export const topicStats = () => ({
  topics: TOPICS.length,
  quotable: TOPICS.filter(t => t.o).length,
  chapters: new Set(TOPICS.map(t => `${t.s}/${t.c}`)).size,
});
