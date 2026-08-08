import { getChapterSpecificQuestions } from "../../lib/questions";

const chapter = process.argv[2];       // e.g. "ar-3"
const subject = process.argv[3] || "air-regulations";
const placeholder = (e?: string) =>
  !e || !e.trim() || /^\s*correct answer\s*[:\-]?\s*[A-D]?\s*\.?\s*$/i.test(e.trim());

const qs = getChapterSpecificQuestions(subject, chapter).filter(q => placeholder(q.exp));
console.log(`# ${subject}/${chapter}: ${qs.length} placeholder explanations\n`);
qs.forEach((q, i) => {
  console.log(`--- ${i + 1} ---`);
  console.log(`Q: ${q.q}`);
  q.opts.forEach((o, oi) => console.log(`   ${String.fromCharCode(65 + oi)}. ${o}${oi === q.ans ? "   <== MARKED CORRECT" : ""}`));
  console.log("");
});
