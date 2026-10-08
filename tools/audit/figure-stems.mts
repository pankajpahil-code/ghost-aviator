// Every raw bank stem that mentions a picture, with whether the loader leaves it out.
//
//   npx tsx tools/audit/figure-stems.mts
//
// Read the whole list after any change to needsMissingFigure in lib/questions.ts: the
// predicate was written from these stems, and a new source can bring a wording it misses.
import { BANK_BEFORE_DEDUPE, needsMissingFigure } from "../../lib/questions";

const MENTIONS = /refer to|display|diagram|figure|annex|shown below|the picture|illustrat|appendix|shown in|as shown|see fig|\bfig\b|attached|the chart|below\b|above\b|sketch|image|graph\b|table\b/i;
const seen = new Set<string>();
let out = 0, kept = 0;
for (const q of BANK_BEFORE_DEDUPE) {
  if (!MENTIONS.test(q.q)) continue;
  const id = q.q + "\u0001" + q.opts.join("|");
  if (seen.has(id)) continue;
  seen.add(id);
  const x = needsMissingFigure(q);
  if (x) out++; else kept++;
  console.log(`${x ? "OUT " : "KEEP"} [${q.subjectIds.join("+")}/${q.chapterId ?? "-"}] ${q.q.replace(/\s+/g, " ")}\n       opts: ${q.opts.join(" ; ")}`);
}
console.log(`\n${out} left out, ${kept} kept (distinct stem+options that mention a picture word)`);
