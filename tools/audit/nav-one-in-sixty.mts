import assert from "node:assert/strict";
import { getChapterSpecificQuestions, getQuestionsForChapter } from "../../lib/questions";

const bank = getChapterSpecificQuestions("air-navigation", "nav-16");
assert.deepEqual(getQuestionsForChapter("air-navigation", "nav-16"), bank);
const items = bank.filter(q => q.source === "Ghost Aviator chapter practice");
assert.equal(items.length, 7);
for (const item of items) {
  const match = /After (\d+) NM along track,? (?:a fix lies|the aircraft is) (\d+) NM (left|right)/i.exec(item.q);
  assert.ok(match, item.q);
  const error = 60 * Number(match[2]) / Number(match[1]);
  const course = /planned track is (\d+)° true/i.exec(item.q);
  const expected = course
    ? String(Number(course[1]) + (match[3] === "right" ? error : -error)).padStart(3, "0") + "° true"
    : error + "° " + match[3];
  assert.equal(item.opts[item.ans], expected, item.q);
  assert.equal(new Set(item.opts).size, item.opts.length);
}
console.log("All seven chapter keys recomputed from the question text. Quiz uses the chapter bank.");
