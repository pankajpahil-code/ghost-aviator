// What the bank loader (lib/questions.ts) does to the raw sources, listed for the owner.
//
//   npx tsx tools/audit/bank-duplicates.mts            print the counts
//   npx tsx tools/audit/bank-duplicates.mts <out.md>   also write the full lists
//
// Nothing here changes a key or picks a winner. It reports:
//   1. groups with the same stem and DIFFERENT keyed answers (all copies are live)
//   2. copies dropped as true duplicates, and the subjects the kept copy gained
//   1c. copies held back because a declared correction already rules on their stem
//   3. questions left out because they need a figure the site cannot show
//   4. short-stem questions the old loader deleted, which are live again
//   5. live questions with a repeated or empty option
//   6. (subject, chapterId) pairs that match no chapter in lib/subjects.ts
import { writeFileSync } from "node:fs";
import {
  ALL_QUESTIONS,
  BANK_BEFORE_DEDUPE,
  BANK_ELIGIBLE,
  collapseDuplicates,
  hasBrokenOptions,
  needsMissingFigure,
  type DemoQuestion,
} from "../../lib/questions";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "../../lib/subjects";

const alnum = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
const tag = (q: DemoQuestion) => `${q.subjectIds.join("+")} / ${q.chapterId ?? "(no chapter)"}`;
const optSet = (q: DemoQuestion) => q.opts.map(alnum).sort().join("|");

const figure = BANK_BEFORE_DEDUPE.filter(needsMissingFigure);
const eligible = BANK_ELIGIBLE;
// Copies of a stem Capt. Pahil has ruled on that key something other than the ruled answer.
const heldBack = BANK_BEFORE_DEDUPE.filter((q) => !needsMissingFigure(q) && !eligible.includes(q));

// The script must describe the loader that pages use, not a copy of it.
const replay = collapseDuplicates(eligible);
if (replay.length !== ALL_QUESTIONS.length) {
  console.error(`replay ${replay.length} != ALL_QUESTIONS ${ALL_QUESTIONS.length}: this report is not about the live bank`);
  process.exit(1);
}

// 1. same stem, different keyed answer
const liveByStem = new Map<string, DemoQuestion[]>();
for (const q of ALL_QUESTIONS) {
  const k = alnum(q.q);
  liveByStem.set(k, [...(liveByStem.get(k) ?? []), q]);
}
const conflicts = [...liveByStem.values()].filter((g) => g.length > 1);
const sameOptions = conflicts.filter((g) => new Set(g.map(optSet)).size < g.length);

// 2. true duplicates dropped, and subjects gained
const liveSet = new Set(ALL_QUESTIONS);
// Later copies with a repeated or empty option whose stem already has a live copy keyed differently.
const damaged = eligible.filter(
  (q) =>
    hasBrokenOptions(q) &&
    !ALL_QUESTIONS.some((x) => x.opts === q.opts) &&
    !(liveByStem.get(alnum(q.q)) ?? []).some((x) => alnum(x.opts[x.ans] ?? "") === alnum(q.opts[q.ans] ?? "")),
);
const rawByStem = new Map<string, DemoQuestion[]>();
for (const q of eligible) {
  const k = alnum(q.q);
  rawByStem.set(k, [...(rawByStem.get(k) ?? []), q]);
}
const dropped = eligible.length - ALL_QUESTIONS.length - damaged.length;
const gained: { q: DemoQuestion; from: DemoQuestion[]; subjects: string[] }[] = [];
for (const q of ALL_QUESTIONS) {
  const copies = (rawByStem.get(alnum(q.q)) ?? []).filter((r) => r !== q && !liveSet.has(r));
  // A kept copy that gained a subject is a NEW object, so find the raw copy it came from.
  const original = (rawByStem.get(alnum(q.q)) ?? []).find(
    (r) => r.opts === q.opts && r.chapterId === q.chapterId,
  );
  if (!original || original === q) continue;
  const subjects = q.subjectIds.filter((s) => !original.subjectIds.includes(s));
  if (subjects.length) gained.push({ q, from: copies.filter((c) => c !== original), subjects });
}
const droppedDifferentOptions = (() => {
  let n = 0;
  for (const q of ALL_QUESTIONS) {
    const g = rawByStem.get(alnum(q.q)) ?? [];
    for (const r of g) {
      if (liveSet.has(r) || r.opts === q.opts) continue;
      if (alnum(r.opts[r.ans] ?? "") === alnum(q.opts[q.ans] ?? "") && optSet(r) !== optSet(q)) n++;
    }
  }
  return n;
})();

// 4. short stems (the old loader deleted every stem under 10 letters and digits)
const shortStems = ALL_QUESTIONS.filter((q) => alnum(q.q).length < 10);

// 5. repeated or empty options
const badOptions = ALL_QUESTIONS.filter(hasBrokenOptions);

// 6. chapter ids that match no chapter of the subject
const chapters = new Map<string, Set<string>>();
for (const s of [...CPL_SUBJECTS, ...ATPL_SUBJECTS]) chapters.set(s.id, new Set(s.chapters.map((c) => c.id)));
const unmatched = new Map<string, number>();
let noChapter = 0;
for (const q of ALL_QUESTIONS) {
  if (!q.chapterId) { noChapter++; continue; }
  for (const s of q.subjectIds) {
    if (chapters.get(s)?.has(q.chapterId)) continue;
    const k = `${s} | ${q.chapterId}`;
    unmatched.set(k, (unmatched.get(k) ?? 0) + 1);
  }
}

const summary = [
  `raw copies after declared corrections: ${BANK_BEFORE_DEDUPE.length}`,
  `left out, need a figure: ${figure.length}`,
  `held back, contradict a declared correction on the same stem: ${heldBack.length}`,
  `held back, damaged later copy of a stem that is already live: ${damaged.length}`,
  `dropped as true duplicates (same stem, same keyed answer): ${dropped}`,
  `  of which the dropped copy had a different set of options: ${droppedDifferentOptions}`,
  `live bank (ALL_QUESTIONS): ${ALL_QUESTIONS.length}`,
  `same stem, different keyed answer: ${conflicts.length} groups, ${conflicts.reduce((n, g) => n + g.length, 0)} live questions`,
  `  of which the options are the same set (one of the keys must be wrong): ${sameOptions.length}`,
  `kept copies that gained a subject from a dropped duplicate: ${gained.length}`,
  `live short-stem questions (under 10 letters and digits): ${shortStems.length}`,
  `live questions with a repeated or empty option: ${badOptions.length}`,
  `(subject, chapterId) pairs matching no chapter: ${unmatched.size} (${[...unmatched.values()].reduce((a, b) => a + b, 0)} question-subject pairs); questions with no chapterId: ${noChapter}`,
];
console.log(summary.join("\n"));

const out = process.argv[2];
if (out) {
  const L: string[] = [];
  L.push("# Question bank: items for Capt. Pahil to rule on (8 Oct 2026)");
  L.push("");
  L.push("Written by `npx tsx tools/audit/bank-duplicates.mts <this file>`. Regenerate it, do not edit it by hand.");
  L.push("No key was changed and no winner was picked to produce this list. PENDING INDEPENDENT AUDIT.");
  L.push("");
  L.push("```");
  L.push(...summary);
  L.push("```");
  L.push("");
  L.push("## 1. Same stem, different keyed answer");
  L.push("");
  L.push("Every copy below is live. Before 8 Oct 2026 only the first copy of each group was shown and the");
  L.push("others were silently dropped. For each group the ruling needed is one of: both are right (different");
  L.push("questions that happen to share a stem), one key is wrong, or they are the same answer spelt two ways");
  L.push("and one copy should go.");
  L.push("");
  L.push("### 1a. Options are the same set: the two keys contradict each other");
  L.push("");
  const printGroup = (g: DemoQuestion[]) => {
    L.push(`**${cell(g[0].q)}**`);
    L.push("");
    for (const q of g) {
      L.push(`- ${tag(q)}: keyed **${cell(q.opts[q.ans] ?? "")}**`);
      L.push(`  - options: ${q.opts.map((o, i) => `${i === q.ans ? "[x]" : "[ ]"} ${cell(o)}`).join(" ; ")}`);
      if (q.q !== g[0].q) L.push(`  - stem as printed in this copy: ${cell(q.q)}`);
    }
    L.push("");
  };
  sameOptions.forEach(printGroup);
  L.push("### 1b. Options differ between the copies");
  L.push("");
  conflicts.filter((g) => !sameOptions.includes(g)).forEach(printGroup);

  L.push("### 1c. Held back: a declared correction already rules on this stem");
  L.push("");
  L.push("These copies are NOT live. lib/answer-corrections.ts carries a ruling for the stem, a copy keyed to the");
  L.push("ruled answer is live, and this other copy keys something else. They were not live before 8 Oct either.");
  L.push("");
  for (const q of heldBack) {
    const ruled = ALL_QUESTIONS.filter((x) => alnum(x.q) === alnum(q.q));
    L.push(`**${cell(q.q)}**`);
    L.push("");
    L.push(`- held back, ${tag(q)}: keyed **${cell(q.opts[q.ans] ?? "")}**`);
    L.push(`  - options: ${q.opts.map((o, i) => `${i === q.ans ? "[x]" : "[ ]"} ${cell(o)}`).join(" ; ")}`);
    for (const x of ruled) L.push(`- live, ${tag(x)}: keyed **${cell(x.opts[x.ans] ?? "")}**`);
    L.push("");
  }

  L.push("### 1d. Held back: a damaged later copy of a stem that is already live");
  L.push("");
  L.push("These copies are NOT live. Each has a repeated or empty option and keys a different answer from the");
  L.push("copy that is live. They were not live before 8 Oct either.");
  L.push("");
  for (const q of damaged) {
    L.push(`**${cell(q.q)}**`);
    L.push("");
    L.push(`- held back, ${tag(q)}: keyed **${cell(q.opts[q.ans] ?? "")}**`);
    L.push(`  - options: ${q.opts.map((o, i) => `${i === q.ans ? "[x]" : "[ ]"} ${cell(o) || "(empty)"}`).join(" ; ")}`);
    for (const x of liveByStem.get(alnum(q.q)) ?? []) L.push(`- live, ${tag(x)}: keyed **${cell(x.opts[x.ans] ?? "")}**`);
    L.push("");
  }

  L.push("## 2. Kept copies that gained a subject from a dropped duplicate");
  L.push("");
  L.push("The kept copy now also counts toward the gained subject (subject pool, mock tests). It keeps its own");
  L.push("chapter id, so it does not appear in the dropped copy's chapter. Where the two chapters differ and the");
  L.push("gained subject has its own chapter bank, that chapter is still one question short.");
  L.push("");
  L.push("| Stem | Kept copy | Gained subject(s) | Dropped copy was filed under |");
  L.push("|---|---|---|---|");
  for (const g of gained) {
    L.push(`| ${cell(g.q.q).slice(0, 110)} | ${g.q.chapterId ?? ""} | ${g.subjects.join(", ")} | ${[...new Set(g.from.map(tag))].join(" ; ")} |`);
  }
  L.push("");

  L.push("## 3. Left out because the question needs a figure the site cannot show");
  L.push("");
  L.push("Predicate: `needsMissingFigure` in lib/questions.ts. They return when the figure exists.");
  L.push("");
  L.push("| Filed under | Stem |");
  L.push("|---|---|");
  for (const q of figure) L.push(`| ${tag(q)} | ${cell(q.q).slice(0, 170)} |`);
  L.push("");

  L.push("## 4. Short-stem questions that are live again");
  L.push("");
  L.push("The old loader deleted every stem under 10 letters and digits. Most of these are sound. A few read");
  L.push("like a stem that was cut short when it was extracted: those want a look.");
  L.push("");
  L.push("| Filed under | Stem | Keyed answer | Options |");
  L.push("|---|---|---|---|");
  for (const q of shortStems) L.push(`| ${tag(q)} | ${cell(q.q)} | ${cell(q.opts[q.ans] ?? "")} | ${q.opts.map(cell).join(" ; ")} |`);
  L.push("");

  L.push("## 5. Live questions with a repeated or empty option");
  L.push("");
  L.push("Not edited: the missing distractor has to come from the source paper, and inventing one is not allowed.");
  L.push("");
  for (const q of badOptions) {
    L.push(`- ${tag(q)}: **${cell(q.q)}**`);
    L.push(`  - options: ${q.opts.map((o, i) => `${i === q.ans ? "[x]" : "[ ]"} ${cell(o) || "(empty)"}`).join(" ; ")}`);
  }
  L.push("");

  L.push("## 6. (subject, chapterId) pairs that match no chapter in lib/subjects.ts");
  L.push("");
  L.push("Not remapped. For the Air Regulations subjects the bank uses the old 13-chapter ids on purpose and");
  L.push("lib/questions.ts routes site chapters to them, so those rows are expected. The ATPL Meteorology and");
  L.push("ATPL Navigation rows mean every chapter of those subjects is served the whole subject pool.");
  L.push("Rows with a chapter id from another subject (instrumentation | nav-2, radio-telephony | tg-34) and the");
  L.push("atpl-navigation rows for nav-15 and nav-33 come from section 2: a kept copy gained that subject.");
  L.push("");
  L.push("| Subject | chapterId in the bank | Questions |");
  L.push("|---|---|---|");
  for (const [k, n] of [...unmatched].sort()) L.push(`| ${k} | ${n} |`);
  L.push("");
  L.push(`Questions with no chapterId at all: ${noChapter}.`);
  L.push("");
  writeFileSync(out, L.join("\n"));
  console.log(`\nwritten: ${out}`);
}
