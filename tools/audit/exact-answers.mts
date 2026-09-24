import { getChapterSpecificQuestions } from "../../lib/questions";
import { isRealExplanation } from "../../lib/explanation";

const placeholder = (e?: string) => !isRealExplanation(e);

const want = (process.argv[2] || "").split(",").map(Number);
const qs = getChapterSpecificQuestions(process.argv[4] || "air-regulations", process.argv[3] || "ar-3")
  .filter(q => placeholder(q.exp));

for (const n of want) {
  const q = qs[n - 1];
  if (!q) { console.log(`# ${n}: OUT OF RANGE`); continue; }
  console.log(JSON.stringify({ n, stem: q.q, expect: q.opts[q.ans] }));
}
