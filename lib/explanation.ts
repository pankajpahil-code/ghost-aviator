/**
 * THE ONE DEFINITION of "this explanation actually explains something".
 *
 * Every surface that shows, speaks or publishes `q.exp` imports this: the chapter
 * question list and drill, the chapter quiz and timed test, the exam and mock-test
 * runners, the question bank page and its FAQPage JSON-LD, past papers, the
 * embeddable question of the day, Gini, and the audit / Shorts tools.
 *
 * WHY ONE. Until 2026-09-24 this predicate was copied into two app files and
 * several tools, "duplicated on purpose" with a note asking whoever changed one to
 * change the rest. The copies drifted anyway: four tools kept the old narrow
 * pattern, and six student-facing surfaces never checked at all, so after
 * answering, a student read "💡 Correct answer: C. Topic: Basics of dead
 * reckoning." presented as an explanation. A note is not a mechanism.
 *
 * Three stub shapes are rejected:
 *   "Correct answer: B"                      the original placeholder
 *   "Correct Answer: (b)"                    three of these in nav-15
 *   "Correct answer: C. Topic: <syllabus>."  668 generated ones in
 *                                            lib/generated/ecqb-061-navigation.ts
 * All three name the answer (already shown) and explain nothing. A question
 * without a real explanation shows its marked answer and nothing more; writing
 * replacement text is content work under Iron Rule 1, never a render fallback.
 * On the indexed question lists the stakes are also search: one near-identical
 * sentence under every question is the boilerplate-repetition signal those
 * pages exist to escape. Live count: `npx tsx tools/audit/explanation-gap.mts`.
 *
 * Keep this file free of imports: it is loaded by client components, by the
 * lazily-imported Gini bank, and by tsx tools run with relative paths.
 */
const PLACEHOLDER = /^\s*correct answer\s*[:\-]?\s*\(?[A-D]?\)?\s*\.?\s*(topic\s*:[^\n]*)?$/i;

export function isRealExplanation(exp: string | undefined | null): boolean {
  if (!exp || !exp.trim()) return false;
  return !PLACEHOLDER.test(exp.trim());
}
