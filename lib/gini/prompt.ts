/**
 * THE PROMPT, DEFINED ONCE.
 *
 * It lived in app/api/gini/route.ts, and tools/audit/gini-live-probe.mts kept a
 * copy so it could test "the same thing". That is the shape of a test that
 * quietly stops testing production: tighten the wording in one file and the
 * probe goes on measuring the old behaviour while reporting green.
 *
 * This repository has been bitten by exactly that before — a sitemap condition
 * drifting from the route's own render condition, twice — so the rule is the
 * same one lib/indexability.ts follows: state it once, import it everywhere.
 */

import type { GiniContext } from "./context";
import { renderMenu, type Candidate } from "./candidates";

export function buildPrompt(q: string, ctx: GiniContext, candidates: Candidate[]): string {
  const where = ctx.subjectName
    ? `The student is reading ${ctx.subjectName}${ctx.chapterTitle ? `, chapter "${ctx.chapterTitle}"` : ""}.`
    : `The student is on the page ${ctx.pathname}.`;

  return [
    where,
    "",
    `The student typed: "${q}"`,
    "",
    candidates.length
      ? "Answers that already exist on this site. Pick the ONE that genuinely answers what was asked:"
      : "Nothing on this site matches what was asked.",
    renderMenu(candidates),
    "",
    'Reply as JSON. PREFER PICKING. If any numbered entry above covers what was asked, use {"mode":"pick","id":"<number>"} — do not write the answer yourself, just choose it. Those entries are written in Capt. Pahil\'s own words and carry the right links, so a pick is almost always better than your paraphrase.',
    'Use {"mode":"talk","reply":"<your own words>","href":"<a site path>"} ONLY when nothing in the list fits — a greeting, small talk, or a question about this site that no entry covers. Always set href when you mention a page.',
    'If it is an aviation question and no entry above genuinely answers it, use {"mode":"none"} — never answer it yourself.',
  ].join("\n");
}
