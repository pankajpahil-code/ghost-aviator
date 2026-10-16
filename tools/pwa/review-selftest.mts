// Builder's self-check for Phase 2's review mode — NOT an audit.
// (CONTRACT clause 4: the builder cannot certify its own work. This is a
// pre-delivery self-check against the real bank, reported as such.)
//
//   npx tsx tools/pwa/review-selftest.mts
//
// What it proves, and why each one matters:
//   1. stemKey is a UNIQUE identity among live questions — the whole
//      resolution scheme of a saved answer trace depends on it.
//   2. Every question of every Exam paper resolves back to itself through the
//      trace matcher (entries recorded exactly as ExamRunner records them).
//   3. A question that leaves the bank degrades to a labelled `missing` item
//      while its neighbours stay resolvable.
//   4. Air Regs bank-id inversion round-trips per track: each site chapter's
//      own bank id maps back to it (CPL and ATPL — the two maps differ).
//   5. Every chapter of both tracks has a notes route + label in
//      lib/chapter-links.ts.
//   6. A trace survives JSON round-trip (localStorage) with identical results.
// Exits 1 if any check fails.
import { ALL_QUESTIONS, stemKey } from "../../lib/questions";
import { EXAM_PAPERS } from "../../lib/exam-papers-meta";
import { getPaperQuestionPool } from "../../lib/exam-papers";
import { matchReviewEntries, reviewStats } from "../../lib/exam-review.mjs";
import type { ReviewEntry } from "../../lib/exam-review.mjs";
import {
  airRegsSiteToBank,
  atplAirRegsSiteToBank,
  siteChaptersServedByBankId,
  type SiteToBank,
} from "../../lib/air-regs-chapter-label";
import { CPL_SUBJECTS, ATPL_SUBJECTS, type Subject } from "../../lib/subjects";
import { directChapterHref, directChapterLabel } from "../../lib/chapter-links";

let problems = 0;
const ok = (msg: string) => console.log("  ok   " + msg);
const fail = (msg: string) => {
  problems += 1;
  console.log("  FAIL " + msg);
};

// ── 1. stemKey identity ──────────────────────────────────────────────────────
console.log(`1. stemKey identity over ${ALL_QUESTIONS.length} live questions`);
{
  const counts = new Map<string, number>();
  let empty = 0;
  for (const q of ALL_QUESTIONS) {
    const k = stemKey(q);
    if (!k) {
      empty += 1;
      continue;
    }
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const dups = [...counts.values()].filter((n) => n > 1).length;
  if (dups === 0) ok(`all ${counts.size} non-empty stem keys are unique`);
  else fail(`${dups} stem key(s) appear on more than one live question`);
  if (empty === 0) ok("no punctuation-only stems (every question is matchable)");
  else console.log(`  warn ${empty} punctuation-only stem(s) — those questions cannot resolve in a review and render as placeholders`);
}

// ── 2. every paper's questions resolve back to themselves ───────────────────
console.log("2. every Exam paper question resolves through the trace matcher");
{
  for (const paper of EXAM_PAPERS) {
    const pool = getPaperQuestionPool(paper);
    const byKey = new Map(pool.map((q) => [stemKey(q), q]));
    // Recorded exactly like ExamRunner: one entry per question, in order.
    const trace: ReviewEntry[] = pool.map((q) => ({ k: stemKey(q), a: q.ans }));
    const items = matchReviewEntries(byKey, trace);
    const unresolved = items.filter((it) => it.question === null).length;
    const stats = reviewStats(items);
    if (unresolved === 0 && stats.correct === pool.length) {
      ok(`${paper.id}: ${pool.length} questions, all resolve, all score correct`);
    } else {
      fail(`${paper.id}: ${pool.length} questions, ${unresolved} unresolved, ${stats.correct} correct`);
    }
  }
}

// ── 3. bank drift degrades to a labelled placeholder ────────────────────────
console.log("3. dropped question degrades, neighbours unaffected");
{
  const pool = getPaperQuestionPool(EXAM_PAPERS[0]).slice(0, 5);
  if (pool.length < 2) {
    fail(`EXAM_PAPERS[0] pool too small (${pool.length}) to test drift`);
  } else {
    const byKey = new Map(pool.map((q) => [stemKey(q), q]));
    byKey.delete(stemKey(pool[0]));
    const items = matchReviewEntries(
      byKey,
      pool.map((q) => ({ k: stemKey(q), a: null })),
    );
    if (items[0].missing && !items[1].missing) ok("the dropped question reads missing; the next still resolves");
    else fail(`drift handling wrong: missing=${items[0].missing}, neighbour missing=${items[1].missing}`);
  }
}

// ── 4. Air Regs bank ids invert back per track ──────────────────────────────
console.log("4. Air Regs bank ids invert back to their site chapters (both tracks)");
{
  const check = (pairs: SiteToBank, track: "cpl" | "atpl", label: string) => {
    if (pairs.length === 0) {
      fail(`${label}: no site→bank pairs derived from the bank`);
      return;
    }
    const bad = pairs.filter(([site, bank]) => !siteChaptersServedByBankId(bank, track).includes(site));
    if (bad.length === 0) ok(`${label}: all ${pairs.length} site chapters round-trip`);
    else fail(`${label}: ${bad.length} failed, e.g. ${bad[0][0]} → ${bad[0][1]} not in the inverse`);
  };
  check(airRegsSiteToBank(), "cpl", "CPL air-regulations");
  check(atplAirRegsSiteToBank(), "atpl", "ATPL air-regulations");
}

// ── 5. every chapter has a notes route + label ──────────────────────────────
console.log("5. chapter routes and labels (lib/chapter-links.ts)");
{
  const bad: string[] = [];
  const run = (subjects: Subject[], track: "cpl" | "atpl") => {
    for (const s of subjects) {
      for (const c of s.chapters) {
        const href = directChapterHref(c.id, track);
        const label = directChapterLabel(c.id, track);
        if (!href || !href.startsWith(`/${track}/`) || !label || !label.includes("Ch.")) {
          bad.push(`${track}/${c.id}`);
        }
      }
    }
  };
  run(CPL_SUBJECTS, "cpl");
  run(ATPL_SUBJECTS, "atpl");
  if (bad.length === 0) ok("every CPL and ATPL chapter resolves to a /cpl|/atpl route and a label");
  else fail(`${bad.length} chapter(s) unresolved: ${bad.slice(0, 5).join(", ")}`);
}

// ── 6. JSON round-trip (localStorage) changes nothing ───────────────────────
console.log("6. trace survives JSON round-trip");
{
  const trace: ReviewEntry[] = [
    { k: "abc", a: null },
    { k: "def", a: 2, f: true },
    { k: "ghi", a: 0 },
  ];
  const byKey = new Map<string, { ans: number }>([
    ["abc", { ans: 1 }],
    ["def", { ans: 2 }],
    ["ghi", { ans: 3 }],
  ]);
  const before = reviewStats(matchReviewEntries(byKey, trace));
  const after = reviewStats(matchReviewEntries(byKey, JSON.parse(JSON.stringify(trace))));
  if (JSON.stringify(before) === JSON.stringify(after)) ok("stats identical after JSON round-trip");
  else fail(`round-trip changed stats: ${JSON.stringify(before)} vs ${JSON.stringify(after)}`);
  if (after.correct === 1 && after.unanswered === 1 && after.wrong === 1 && after.flagged === 1) {
    ok("counts as expected (1 correct / 1 unanswered / 1 wrong / 1 flagged)");
  } else {
    fail(`unexpected counts: ${JSON.stringify(after)}`);
  }
}

console.log(`\nreview-selftest: PROBLEMS: ${problems}  (builder's self-check — not an independent audit)`);
process.exitCode = problems === 0 ? 0 : 1;
