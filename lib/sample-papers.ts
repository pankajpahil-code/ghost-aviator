// Sample papers composed from the site's own verified question bank.
// Unlike /mock-test (randomised), these are FIXED exam-style papers — every
// student gets the same paper, so results are comparable and shareable.
//
// Composition is deterministic: the subject's pool is ordered by a stable
// text hash, then sliced into consecutive 50-question papers (max 3/subject).
import { ALL_QUESTIONS } from "./questions";
import { CPL_SUBJECTS } from "./subjects";
import { AIR_REGULATIONS_PAPERS } from "./generated/past-papers-air-regulations";
import type { PastPaper } from "./past-papers";

const PAPER_SIZE = 50;
const MAX_PAPERS_PER_SUBJECT = 3;

// Questions already published inside a Previous Year Paper must never appear
// again in a sample paper — students would meet the same question twice.
const dedupeKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 100);
const IN_PYP = new Set(
  AIR_REGULATIONS_PAPERS.flatMap(p => p.questions.map(q => dedupeKey(q.q))),
);

// Small stable string hash (FNV-1a) — keeps paper composition identical
// across builds unless the underlying question pool itself changes.
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function buildSamplePapers(): PastPaper[] {
  const papers: PastPaper[] = [];
  for (const s of CPL_SUBJECTS) {
    const pool = ALL_QUESTIONS.filter(
      q => q.subjectIds.includes(s.id) && !IN_PYP.has(dedupeKey(q.q)),
    );
    if (pool.length < PAPER_SIZE) continue;

    const ordered = [...pool].sort((a, b) => hash(a.q) - hash(b.q));
    const count = Math.min(MAX_PAPERS_PER_SUBJECT, Math.floor(ordered.length / PAPER_SIZE));
    for (let n = 1; n <= count; n++) {
      const slice = ordered.slice((n - 1) * PAPER_SIZE, n * PAPER_SIZE);
      papers.push({
        id: `${s.id}-sample-${n}`,
        subjectId: s.id,
        track: "cpl",
        title: `${s.name} — Sample Paper ${n}`,
        questions: slice.map(q => ({ q: q.q, opts: q.opts, ans: q.ans, exp: q.exp })),
      });
    }
  }
  return papers;
}

export const SAMPLE_PAPERS: PastPaper[] = buildSamplePapers();
