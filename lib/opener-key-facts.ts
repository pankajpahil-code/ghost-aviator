/**
 * Server-only key facts from the Captain's own chapter sentences (lib/generated/opener-key-facts.ts).
 *
 * GATED ON HIS REVIEW: a subject's chapters show these only when its id is in
 * APPROVED_OPENER_SUBJECTS. Empty until he rules on TOPIC_OPENERS_FOR_REVIEW.tsv, so today no page
 * changes. Hand-written entries in lib/chapter-key-facts.ts always take precedence.
 *
 * Import this ONLY from server components (the notes routes). It must never reach
 * lib/chapter-key-facts.ts, which Gini bundles into every page.
 */
// (Not using the "server-only" package: it is not installed, and package.json carries another agent's
// uncommitted edits. The routes pass ONE chapter's facts to the client component as a prop instead.)
import { OPENER_FACTS } from "./generated/opener-key-facts";
import type { ChapterKeyFacts } from "./chapter-key-facts";

/** Subject ids whose chapter sentences Capt. Pahil has approved as key facts, e.g. "meteorology". */
export const APPROVED_OPENER_SUBJECTS: string[] = [];

export function openerFactsFor(subjectId: string, chapterId: string): ChapterKeyFacts | undefined {
  if (!APPROVED_OPENER_SUBJECTS.includes(subjectId)) return undefined;
  const facts = OPENER_FACTS[`${subjectId}/${chapterId}`];
  return facts?.length
    ? { facts, source: "Verbatim sentences from this chapter as published (TOPIC_OPENERS_FOR_REVIEW.tsv), approved by Capt. Pahil" }
    : undefined;
}
