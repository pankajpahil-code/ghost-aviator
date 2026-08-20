/**
 * Self-test for Gini's truth layer.
 *
 *   npx tsx tools/audit/gini-selftest.mts
 *
 * Proves three things that matter more than any feature:
 *   1. How many questions Gini can explain, per subject — measured, not claimed.
 *   2. That he REFUSES when there is nothing verified to say.
 *   3. That nothing he would speak carries a third-party attribution (Iron Rule 2).
 */

import {
  ask,
  explainQuestion,
  isSpeakable,
  speakableStats,
  describeSubject,
  findChapter,
} from "../../lib/gini/knowledge";
import { ALL_QUESTIONS } from "../../lib/questions";
import { CPL_SUBJECTS } from "../../lib/subjects";

const line = (s = "") => console.log(s);

line("=".repeat(64));
line("GINI TRUTH LAYER — SELF TEST");
line("=".repeat(64));

const all = speakableStats();
line(`\nCorpus: ${all.total} questions`);
line(`  speakable : ${all.speakable} (${((100 * all.speakable) / all.total).toFixed(1)}%)`);
line(`  silent    : ${all.silent}`);

line("\nPer subject (top 8 by bank size):");
const rows = CPL_SUBJECTS.map(s => ({ id: s.id, name: s.shortName, ...speakableStats(s.id) }))
  .filter(r => r.total > 0)
  .sort((a, b) => b.total - a.total)
  .slice(0, 8);
for (const r of rows) {
  const pct = r.total ? ((100 * r.speakable) / r.total).toFixed(0) : "0";
  line(`  ${r.name.padEnd(22)} ${String(r.speakable).padStart(5)} / ${String(r.total).padStart(5)}  (${pct}%)`);
}

line("\n--- REFUSAL BEHAVIOUR (the important half) ---");
const probes = [
  "is there negative marking",
  "how much does a CPL cost in India",
  "what is the vertical speed indicator",
  "what is the airspeed limit of a Boeing 747",
  "who will win the cricket match",
  "",
];
for (const p of probes) {
  const r = ask(p);
  const tag = r.kind === "answer" ? "ANSWER " : `REFUSE(${(r as any).reason})`;
  line(`  ${tag}  "${p}" -> ${r.text.slice(0, 72)}...`);
}

line("\n--- STRUCTURE ---");
const d = describeSubject("meteorology");
line(`  describeSubject(meteorology): ${d.kind === "answer" ? d.text : d.text}`);
const f = findChapter("where is the 1 in 60 rule");
line(`  findChapter(1 in 60): ${f.kind === "answer" ? f.text + " -> " + f.href : f.text}`);

line("\n--- IRON RULE 2 SWEEP over everything Gini could speak ---");
const BANNED = /\b(oxford|cae|nordian|redbird|jeppesen|ic\s*joshi|rk\s*bali)\b/i;
let leaks = 0;
for (const q of ALL_QUESTIONS) {
  if (!isSpeakable(q)) continue;
  const r = explainQuestion(q);
  if (r.kind === "answer" && BANNED.test(r.text)) {
    if (leaks < 3) line(`  LEAK: ${r.text.slice(0, 90)}`);
    leaks++;
  }
}
line(`  attribution leaks: ${leaks}  ${leaks === 0 ? "(clean)" : "*** FIX REQUIRED ***"}`);

line("\n--- PLACEHOLDER SWEEP: would he ever read a stub aloud? ---");
let stubs = 0;
for (const q of ALL_QUESTIONS) {
  const r = explainQuestion(q);
  if (r.kind === "answer" && /^\s*correct answer\s*[:\-]?\s*[A-D]?\s*\.?\s*$/i.test(q.exp.trim())) stubs++;
}
line(`  placeholders spoken: ${stubs}  ${stubs === 0 ? "(clean)" : "*** FIX REQUIRED ***"}`);
line("");
