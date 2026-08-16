// Renders the debrief screen to static HTML from a REAL run, so the component
// is proven to mount and print the right questions without a fifteen-minute
// flight. Not a substitute for flying it — no clicks, no state transitions —
// but it turns "never rendered" into "renders, with the right content".
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import RecallDebrief from "../../app/adapt-test/RecallDebrief";
import { buildRun } from "../../lib/adapt/divided-attention.mjs";

const run = buildRun(20260816, 900);
const html = renderToStaticMarkup(
  React.createElement(RecallDebrief, { items: run.recall, onComplete: () => {} })
);

const first = run.recall[0];
const problems: string[] = [];
if (!html.includes(first.stem)) problems.push(`first question stem missing: "${first.stem}"`);
for (const o of first.options) if (!html.includes(o)) problems.push(`option missing: "${o}"`);
if (!html.includes(`1 of ${run.recall.length}`)) problems.push("progress counter missing");
// The answer must not be marked in the markup — a debrief that ships its own
// answer key in the DOM is not a memory test.
if (/answerIndex|data-correct/.test(html)) problems.push("the markup leaks which option is correct");

console.log(`rendered ${html.length} bytes; ${run.recall.length} questions`);
console.log(`Q1: ${first.stem}`);
console.log(`   options: ${first.options.join(" | ")}`);
console.log(problems.length ? `FAIL:\n - ${problems.join("\n - ")}` : "OK — stem, all options and the counter are present, no answer key in the DOM");
process.exit(problems.length ? 1 : 0);
