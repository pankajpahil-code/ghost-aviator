import { NAV_ONE_IN_SIXTY } from "./nav-one-in-sixty";
import { ATPL_TO_CPL } from "./atpl-syllabus";
import { AIR_REGS_BANK_DEFAULT, AIR_REGS_SITE_CHAPTER } from "./generated/air-regs-site-chapters";
import { NAV_SITE_CHAPTER } from "./generated/nav-site-chapters";
import type { DemoQuestion } from "./demo-questions";
import { DEMO_QUESTIONS } from "./demo-questions";
import { NAV_QUESTIONS } from "./nav-questions";
import { OXFORD_NAV_QUESTIONS } from "./oxford-nav-questions";
import { RK_BALI_REGULATIONS_QUESTIONS } from "./rk-bali-regulations-questions";
import { AIR_REGS_CH1_QUESTIONS } from "./air-regs-ch1-questions";
import { SAR_QUESTIONS } from "./sar-questions";
import { TECHBOOK_QUESTIONS_1 } from "./techbook-questions-1";
import { TECHBOOK_QUESTIONS_2 } from "./techbook-questions-2";
import { ECQB_061_NAVIGATION } from "./generated/ecqb-061-navigation";
import { ICJOSHI_MET } from "./generated/icjoshi-met";
import { ICJOSHI_NOTES_MET } from "./generated/icjoshi-notes-met";
import { OXFORD_INSTRUMENTATION } from "./generated/oxford-instrumentation";
import { OXFORD_RADIO_NAV } from "./generated/oxford-radio-nav";
import { OXFORD_GEN_NAV } from "./generated/oxford-gen-nav";
import { GEN_NAV_PRACTICE } from "./generated/gen-nav-practice";
import { INS_PRACTICE } from "./generated/ins-practice";
import { REGS_NOTES } from "./generated/regs-notes";
import { AR25_PHYSIOLOGY_QUESTIONS } from "./generated/ar25-physiology-questions";
import { RTF_QUESTIONS } from "./generated/rtf-questions";
import { MET_VERIFIED, VERIFIED_MET_CHAPTERS } from "./generated/met-verified";
import { DA42_QUESTIONS } from "./generated/da42-questions";
import { ANSWER_CORRECTIONS, applyAnswerCorrections, sameOption } from "./answer-corrections";

export type { DemoQuestion };

// For any Meteorology chapter that has been fully re-verified (answers checked
// against the reference ATPL manual + standard meteorology, book errors fixed,
// duplicates removed), the old auto-extracted met banks are dropped entirely so
// the verified bank is the single source of truth for that chapter.
const dropVerifiedMet = (q: DemoQuestion) =>
  !(q.chapterId && VERIFIED_MET_CHAPTERS.has(q.chapterId) &&
    q.subjectIds.some((s) => s === "meteorology" || s === "atpl-meteorology"));

// Curated sources first (hand-written explanations win on duplicates),
// auto-generated banks last.
// Declared answer-key corrections (lib/answer-corrections.ts) are applied to
// every source before de-dupe, so a regenerated bank cannot undo them.
// Exported for tools/audit only (the duplicate and figure reports replay the steps below).
// Pages read ALL_QUESTIONS.
export const BANK_BEFORE_DEDUPE: DemoQuestion[] = applyAnswerCorrections([
  ...NAV_ONE_IN_SIXTY,
  ...MET_VERIFIED,         // ✅ verified Meteorology chapters — highest priority
  ...DEMO_QUESTIONS,
  ...NAV_QUESTIONS,
  ...OXFORD_NAV_QUESTIONS,
  ...RK_BALI_REGULATIONS_QUESTIONS,
  ...AIR_REGS_CH1_QUESTIONS,
  ...SAR_QUESTIONS,
  ...TECHBOOK_QUESTIONS_1, // Technical General — own book Q&A (tg-1..18)
  ...TECHBOOK_QUESTIONS_2, // Technical General — own book Q&A (tg-19..36)
  ...DA42_QUESTIONS,       // Technical Specific — DA-42 NG (Austro) type bank (da42-1..10)
  ...ICJOSHI_NOTES_MET.filter(dropVerifiedMet),   // rich HTML-notes Q&A (unverified met chapters only)
  ...OXFORD_INSTRUMENTATION, // Instrumentation HTML-notes Q&A (inst-1..23)
  ...OXFORD_RADIO_NAV,       // Radio Navigation HTML-notes Q&A (rnav-1..20)
  ...OXFORD_GEN_NAV,         // Gen-Nav notes Q&A (air-navigation nav-13..20)
  ...REGS_NOTES,             // Air Regulations HTML-notes Q&A (ar-2, ar-22, ar-23)
  ...AR25_PHYSIOLOGY_QUESTIONS, // Aviation Physiology Q&A (ar-25)
  ...RTF_QUESTIONS,              // Radio Telephony Q&A (rtf-1..24, 779 questions)
  ...GEN_NAV_PRACTICE,        // General Navigation practice bank, keys re-worked 2026-10-23 (nav + inst chapters)
  ...INS_PRACTICE,            // Instruments practice bank, keys checked 2026-10-25 (inst chapters + nav-cx3-6)
  ...ECQB_061_NAVIGATION,
  ...ICJOSHI_MET.filter(dropVerifiedMet), // font-extracted met bank (unverified met chapters only)
]);

// Questions that cannot be answered without a figure the site does not hold. DemoQuestion
// has no image field and every runner prints the stem and options only, so a stem that
// says "(Refer to figure 061-12)" was being asked, marked right or wrong and counted
// toward a pass mark with nothing to look at (found 2026-10-08). They are left out of
// ALL_QUESTIONS. They return when the figure exists and the runners can show it: at that
// point narrow or delete this predicate, do not work around it.
// A stem that describes its own picture in words ("Figure 1 [aircraft symbol aligned with
// the left Rate 1 mark]") is answerable and is NOT matched. Words like "chart" or "Annex"
// alone are not matched either: "On a Mercator chart..." and "Annex 14 contains..." need
// no figure. Same idea as NEEDS_FIGURE in lib/gini/deep.ts, which tests the explanation;
// kept separate so this file does not import lib/gini.
const MISSING_FIGURE =
  /\brefer\s+to\b[^)]{0,60}\b(?:figures?|annex|appendix|diagram|chart)\b|\bdiagram below\b|\(in the symbol diagram\)|\(appendix [a-z]\)|\bthe drawing shows\b/i;
// A lettered display ("Refer to display E (expanded ILS)", "On display D (Plan mode) the
// track from ZAPPO to BANTU is") is one panel of a printed sheet of EFIS screens. Matched
// with the capital letter only, so "the display a pilot sees" is not caught.
const LETTERED_DISPLAY = /\b[Dd]isplays?\s+[A-F]\b/;
export const needsMissingFigure = (q: Pick<DemoQuestion, "q">) =>
  MISSING_FIGURE.test(q.q) || LETTERED_DISPLAY.test(q.q);

// De-dupe: two copies are the same question only when the WHOLE normalised stem matches
// and both key the same answer text.
// Until 2026-10-08 the key was the first 100 letters and digits of the stem, with anything
// under 10 thrown away. That deleted 18 valid short questions ("A gale is:", "UTC means"),
// and merged different questions that share a long opening (two point-of-safe-return questions
// vanished behind the point-of-equal-time ones).
const stemKey = (q: Pick<DemoQuestion, "q">) => q.q.toLowerCase().replace(/[^a-z0-9]/g, "");

// The keyed option, compared after removing the spelling differences between sources:
// "90°" / "90 deg" / "90 degrees", "8 min" / "8 mins", "5000 meters" / "5000 metres",
// "132°(T)" / "132 T". A decimal point and a sign or comparison in front of a number are
// kept, so "1.5" never equals "15" and "-5" never equals "+5". Anything this does not
// equate is treated as a different keyed answer and goes on the list for Capt. Pahil.
const answerKey = (q: DemoQuestion) =>
  (q.opts[q.ans] ?? "")
    .toLowerCase()
    .replace(/\b(?:degrees?|deg)\b/g, "")
    .replace(/\b(?:minutes?|mins)\b/g, "min")
    .replace(/\b(?:hours?|hrs)\b/g, "hr")
    .replace(/\bmet(?:er|re)s?\b/g, "metre")
    .replace(/(?<![a-z0-9])[-−–](?=\d)/g, "~")
    .replace(/(?<!\d)\.|\.(?!\d)/g, "")
    .replace(/[^a-z0-9.~+<>]/g, "");
const sameKeyedAnswer = (a: DemoQuestion, b: DemoQuestion) =>
  answerKey(a) === answerKey(b) || sameOption(a.opts[a.ans], b.opts[b.ans] ?? "");

// Stems Capt. Pahil has already ruled on (lib/answer-corrections.ts), with the answer(s)
// ruled right.
// Where a ruling exists and a copy carrying it is live, another source's copy of that stem
// keyed to something else contradicts the ruling, so it stays out, as it did before
// 8 Oct 2026 (tools/audit/check-corrections.mts fails if one gets through). It is never
// the last copy of its stem that goes, and tools/audit/bank-duplicates.mts lists each one.
const RULED_ANSWERS = new Map<string, string[]>();
for (const c of ANSWER_CORRECTIONS) {
  if (c.hide) continue;
  const k = stemKey({ q: c.edit?.q ?? c.q });
  RULED_ANSWERS.set(k, [...(RULED_ANSWERS.get(k) ?? []), c.now]);
}
const keysRuledAnswer = (q: DemoQuestion) =>
  (RULED_ANSWERS.get(stemKey(q)) ?? []).some((now) => sameOption(q.opts[q.ans], now));
export function contradictsRuling(q: DemoQuestion, all: DemoQuestion[]): boolean {
  const k = stemKey(q);
  if (!RULED_ANSWERS.has(k) || keysRuledAnswer(q)) return false;
  return all.some((x) => stemKey(x) === k && keysRuledAnswer(x));
}

// A repeated or empty option: the mark of a copy damaged when it was extracted.
export const hasBrokenOptions = (q: Pick<DemoQuestion, "opts">) => {
  const t = q.opts.map((o) => o.trim().toLowerCase());
  return t.some((o) => o === "") || new Set(t).size < t.length;
};

// Keeps the first (highest-priority) copy of each stem, as the loader always has.
// A later copy that keys the SAME answer is a true duplicate: it is dropped, but any subject
// it carries that the kept copy lacks is added to the kept copy, so a question filed under
// two subjects by two sources stays in both subject pools. (The kept copy keeps its own
// chapterId: DemoQuestion holds one chapter.)
// A later copy that keys a DIFFERENT answer stays hidden, exactly as it was before
// 8 Oct 2026, and gives the kept copy nothing. Which of the two keys is right is
// Capt. Pahil's ruling, not the loader's: putting the second copy live would show students
// two opposite keys for one question, and some of those copies cannot be answered at all.
// Every such pair is returned in `otherKey` and printed, with both option sets, by
// tools/audit/bank-duplicates.mts.
export function collapseWithReport(qs: DemoQuestion[]): {
  live: DemoQuestion[];
  otherKey: { hidden: DemoQuestion; live: DemoQuestion }[];
} {
  const byStem = new Map<string, number>(); // stem key -> position in `out`
  const out: DemoQuestion[] = [];
  const held: { hidden: DemoQuestion; at: number }[] = [];
  for (const q of qs) {
    const k = stemKey(q);
    // A stem with no letter or digit cannot be compared, so it is never treated as a copy.
    const at = k ? byStem.get(k) : undefined;
    if (at === undefined) {
      if (k) byStem.set(k, out.length);
      out.push(q);
      continue;
    }
    if (!sameKeyedAnswer(out[at], q)) {
      held.push({ hidden: q, at });
      continue;
    }
    const gained = q.subjectIds.filter((s) => !out[at].subjectIds.includes(s));
    if (gained.length > 0) {
      out[at] = { ...out[at], subjectIds: [...out[at].subjectIds, ...gained] };
    }
  }
  return { live: out, otherKey: held.map((h) => ({ hidden: h.hidden, live: out[h.at] })) };
}
export const collapseDuplicates = (qs: DemoQuestion[]): DemoQuestion[] => collapseWithReport(qs).live;

// The copies the de-dupe is run over: everything except the two declared exclusions.
export const BANK_ELIGIBLE: DemoQuestion[] = (() => {
  const shown = BANK_BEFORE_DEDUPE.filter((q) => !needsMissingFigure(q));
  const ruledCopies = shown.filter(keysRuledAnswer);
  return shown.filter((q) => !contradictsRuling(q, ruledCopies));
})();

// Air Regulations: the bank was classified into the source book's old 13 chapters
// (ar-1..ar-13, sar), while the site teaches 26. Until 2026-11-07 each site chapter
// was handed one WHOLE old chapter, many-to-one, so several site chapters served an
// identical pool (Ch.5, 6 and 8 all showed altimetry + separation + transponder;
// Ch.2, 14 and 15 all showed registration + licensing + airworthiness). Each question
// now carries the site chapter its topic and cited source belong to, from
// tools/audit/air-regs-site-chapters.py. Banks already written per site chapter
// (ar-22, ar-23, ar-25) keep their own id.
function airRegsSiteChapter(q: DemoQuestion): string | undefined {
  if (!q.chapterId) return q.chapterId;
  return AIR_REGS_SITE_CHAPTER[stemKey(q)] ?? AIR_REGS_BANK_DEFAULT[q.chapterId] ?? q.chapterId;
}

// Air Navigation: on 2026-10-16 the old chapters nav-1/2/4/5 (Basics, Magnetism & Compasses, Dead Reckoning,
// In-Flight Navigation) and nav-10/11/12 (radio aids, flight and engine instruments) left lib/subjects.ts,
// and ~620 questions kept those ids, so no chapter page served them. Each now carries the live chapter its
// topic belongs to (tools/audit/nav-site-chapters.py). One that moves to an Instrumentation or Radio
// Navigation chapter gains that subject and keeps air-navigation, so Navigation mock tests still draw on it.
function navPlacement(q: DemoQuestion, subjectIds: string[]): { subjectIds: string[]; chapterId?: string } {
  const placed = NAV_SITE_CHAPTER[stemKey(q)];
  if (!placed || !subjectIds.includes("air-navigation")) return { subjectIds, chapterId: q.chapterId };
  const [subjectId, chapterId] = placed.split("/");
  return { subjectIds: subjectIds.includes(subjectId) ? subjectIds : [...subjectIds, subjectId], chapterId };
}

// Preserve stems, choices, keys and explanations while relocating all ATPL banks.
export const ALL_QUESTIONS: DemoQuestion[] = collapseDuplicates(BANK_ELIGIBLE).map(q => {
  const relocated = [...new Set(q.subjectIds.map(id => ATPL_TO_CPL[id] ?? id))];
  if (relocated.includes("air-regulations")) return { ...q, subjectIds: relocated, chapterId: airRegsSiteChapter(q) };
  return { ...q, ...navPlacement(q, relocated) };
});

// All questions belonging to a subject (across every chapter). Used to build
// subject-wide mock tests (mid / full / sample).
export function getSubjectQuestionPool(subjectId: string): DemoQuestion[] {
  return ALL_QUESTIONS.filter(q => q.subjectIds.includes(subjectId));
}

export function getQuestionsForChapter(
  subjectId: string,
  chapterId: string,
): DemoQuestion[] {
  if (subjectId.startsWith("atpl-")) return [];
  // Exact chapter match (Air Regulations questions already carry their SITE
  // chapter, see airRegsSiteChapter), then the subject-wide fallback.
  const byChapter = ALL_QUESTIONS.filter(
    q => q.chapterId === chapterId && q.subjectIds.includes(subjectId),
  );
  if (byChapter.length > 0) return byChapter;
  return ALL_QUESTIONS.filter(q => q.subjectIds.includes(subjectId));
}

/**
 * The questions that genuinely belong to this chapter — empty when the chapter
 * has none of its own and `getQuestionsForChapter` would hand back the whole
 * subject pool instead.
 *
 * That subject-wide fallback is good for a student (a chapter with no bank of
 * its own still gives you something to practise) and terrible for search.
 * Measured 2026-08-08: **114 of 284 chapter question pages serve a question set
 * identical to at least one other chapter** — 16 Air Navigation chapters return
 * the very same 1,020 questions, 8 Meteorology chapters the same 651, 6 ATPL
 * Navigation the same 865. Across the site 33,043 question-renders draw on only
 * 4,269 distinct questions, a 7.7x duplication factor.
 *
 * Sixteen URLs with byte-identical content is precisely what produces
 * "Crawled - currently not indexed", which Search Console reported for 303 of
 * 343 known pages. So the fallback set still powers the interactive drill, but
 * it is neither rendered as bulk page content nor submitted in the sitemap.
 */
export function getChapterSpecificQuestions(
  subjectId: string,
  chapterId: string,
): DemoQuestion[] {
  if (subjectId.startsWith("atpl-")) return [];
  return ALL_QUESTIONS.filter(
    q => q.chapterId === chapterId && q.subjectIds.includes(subjectId),
  );
}
