// tools/audit/oxford-tech-general.mts
//
// Guard for the Oxford Technical General imports. The source PDF supplies
// answer letters but no explanations, so these banks were assembled locally:
// every answer was checked against the Oxford grid, every explanation was
// written for Ghost Aviator, and every stem was checked against the live bank.
// All three batches are checked together, including cross-batch duplicates.
//
// This script fails if a later edit reintroduces a duplicate, a broken answer
// index, a missing explanation, a figure-dependent question, or an OCR/page
// header artifact.
//
// Run directly: npx tsx tools/audit/oxford-tech-general.mts

import { ALL_QUESTIONS, BANK_BEFORE_DEDUPE, needsMissingFigure } from "../../lib/questions";
import { OXFORD_TECH_GENERAL_QUESTIONS } from "../../lib/generated/oxford-tech-general";
import { OXFORD_TECH_GENERAL_QUESTIONS_2 } from "../../lib/generated/oxford-tech-general-2";
import { OXFORD_TECH_GENERAL_QUESTIONS_3 } from "../../lib/generated/oxford-tech-general-3";
import type { DemoQuestion } from "../../lib/demo-questions";

// All three Oxford batches are guarded together so a later edit cannot
// reintroduce a duplicate between them, or a question the live de-dupe drops.
const NEW = [
  ...OXFORD_TECH_GENERAL_QUESTIONS,
  ...OXFORD_TECH_GENERAL_QUESTIONS_2,
  ...OXFORD_TECH_GENERAL_QUESTIONS_3,
];
const NEW_SET = new Set<DemoQuestion>(NEW);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const fail: string[] = [];
const check = (ok: boolean, message: string) => {
  if (!ok) fail.push(message);
};

const ARTIFACT_PATTERNS: { name: string; re: RegExp }[] = [
  { name: "page header", re: /\b(?:Questions|Answers)\b/ },
  { name: "answer grid", re: /\b[abcd]\b(?:\s+\b[abcd]\b){5,}/i },
  { name: "engine components footer", re: /\bEngine Components\b/i },
  { name: "terms footer", re: /\bTerms and Definitions\b/i },
  { name: "garbled", re: /\bgarbled\b/i },
  { name: "de-garbled", re: /\bde-?garbled\b/i },
  { name: "options tidied", re: /\boptions? tidied\b/i },
  { name: "fixed missing", re: /\bfixed missing\b/i },
  { name: "typo in the stem", re: /\bwith a typo in the stem\b/i },
];

const existing = BANK_BEFORE_DEDUPE.filter((q) => !NEW_SET.has(q));
const existingStems = new Map<string, DemoQuestion>();
for (const q of existing) {
  const k = norm(q.q);
  if (k && !existingStems.has(k)) existingStems.set(k, q);
}

const seen = new Map<string, number>();
const byChapter = new Map<string, number>();
const bySource = new Map<string, number>();

for (const [index, q] of NEW.entries()) {
  const where = `#${index + 1} ${q.chapterId ?? "(no chapter)"} :: ${q.q.slice(0, 80)}`;
  check(q.subjectIds.includes("technical-general"), `${where}: missing technical-general subject id`);
  check(Boolean(q.chapterId), `${where}: missing chapterId`);
  check(Boolean(q.subtopic), `${where}: missing subtopic`);
  check(Boolean(q.source), `${where}: missing source`);
  check(q.opts.length === 4, `${where}: expected 4 options, got ${q.opts.length}`);
  check(q.ans >= 0 && q.ans < q.opts.length, `${where}: answer index ${q.ans} out of range`);
  check(q.opts.every((o) => o.trim().length > 0), `${where}: empty option`);
  check(new Set(q.opts.map((o) => o.trim().toLowerCase())).size === q.opts.length, `${where}: repeated option`);
  check(q.exp.trim().length >= 60, `${where}: explanation shorter than 60 characters`);
  check(!needsMissingFigure(q), `${where}: needs a figure the site does not hold`);
  check(!ARTIFACT_PATTERNS.some((p) => p.re.test(`${q.q} ${q.opts.join(" ")} ${q.exp}`)), `${where}: OCR/page-header artifact`);

  const key = norm(q.q);
  check(key.length > 0, `${where}: empty normalised stem`);
  const first = seen.get(key);
  check(first === undefined, `${where}: duplicate stem inside the import (first at #${first})`);
  if (first === undefined) seen.set(key, index + 1);

  const clash = existingStems.get(key);
  check(clash === undefined, `${where}: duplicates existing stem: ${clash?.q.slice(0, 100) ?? ""}`);

  byChapter.set(q.chapterId ?? "(none)", (byChapter.get(q.chapterId ?? "(none)") ?? 0) + 1);
  bySource.set(q.source ?? "(none)", (bySource.get(q.source ?? "(none)") ?? 0) + 1);
}

// Every imported question must survive the live de-dupe unchanged. If a copy is
// dropped, a duplicate slipped past the checks above or an answer key conflicts.
const liveImported = ALL_QUESTIONS.filter((q) => NEW_SET.has(q));
check(
  liveImported.length === NEW.length,
  `only ${liveImported.length}/${NEW.length} imported questions survived ALL_QUESTIONS de-dupe`,
);

console.log(`Oxford Technical General import: ${NEW.length} questions`);
console.log("By chapter:");
for (const [chapter, count] of [...byChapter.entries()].sort()) {
  console.log(`  ${chapter}: ${count}`);
}
console.log("By source:");
for (const [source, count] of [...bySource.entries()].sort()) {
  console.log(`  ${source}: ${count}`);
}
console.log(`Live copies after ALL_QUESTIONS de-dupe: ${liveImported.length}/${NEW.length}`);

if (fail.length > 0) {
  console.error("\nFAILED:");
  for (const message of fail) console.error(`  - ${message}`);
  process.exit(1);
}

console.log("\nPASS: answers, explanations, options, chapter mapping and duplicate checks are clean.");
