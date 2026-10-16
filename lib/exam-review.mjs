// ─────────────────────────────────────────────────────────────────────────────
// Exam review — the pure half. A saved answer trace (ExamAttempt.review) is
// matched against the live question pool so a past sitting can be reviewed
// question by question. No imports at all: the trace shape lives in
// lib/exam-review.d.mts, storage in lib/exam-history.ts, the bank in
// lib/questions.ts, and the UI in app/dashboard/review/.
//
// WHY KEYS, NOT SNAPSHOTS: the bank corrects answer keys over time (see
// lib/answer-corrections.ts), and a review must show TODAY's verified key, not
// the one in force on exam day. Identity is the bank's own normalised-stem key
// (stemKey, lib/questions.ts), which collapseWithReport guarantees is unique
// among live questions. A question that has left the bank resolves to `null`
// and renders as a labelled placeholder — never silently dropped.
// ─────────────────────────────────────────────────────────────────────────────

// Storage is student-writable (localStorage), so everything read from it is
// untrusted: only a finite integer ≥ 0 is a real option index. A hand-edited
// or corrupt value degrades to "not answered", never to a broken render.
export function normaliseChosen(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}

/**
 * Match a saved trace against the live pool, preserving sitting order.
 * @param {ReadonlyMap<string, unknown>} byKey  stemKey → live question
 * @param {unknown} review  the stored trace (untrusted)
 */
export function matchReviewEntries(byKey, review) {
  if (!Array.isArray(review)) return [];
  return review.map((raw, index) => {
    const entry = raw && typeof raw === "object" ? raw : {};
    const question =
      typeof entry.k === "string" && entry.k ? byKey.get(entry.k) ?? null : null;
    return {
      index,
      question,
      chosen: normaliseChosen(entry.a),
      flagged: entry.f === true,
      missing: question === null,
    };
  });
}

/** Keep only the items a dashboard filter should show. */
export function filterReviewItems(items, filter) {
  if (filter === "wrong") {
    return items.filter(it => !it.missing && it.chosen !== null && it.chosen !== it.question.ans);
  }
  if (filter === "unanswered") {
    return items.filter(it => !it.missing && it.chosen === null);
  }
  if (filter === "flagged") {
    return items.filter(it => it.flagged);
  }
  return items;
}

/**
 * Counts for the filter pills and the honesty notes. `missing` items are
 * counted separately: they can't be scored, so they are excluded from every
 * other count and never change `scorePct`.
 */
export function reviewStats(items) {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  let flagged = 0;
  let missing = 0;
  for (const it of items) {
    if (it.flagged) flagged += 1;
    if (it.missing) {
      missing += 1;
      continue;
    }
    if (it.chosen === null) unanswered += 1;
    else if (it.chosen === it.question.ans) correct += 1;
    else wrong += 1;
  }
  const total = items.length;
  return {
    total,
    correct,
    wrong,
    unanswered,
    flagged,
    missing,
    scorePct: total > 0 ? Math.round((correct / total) * 100) : 0,
  };
}
