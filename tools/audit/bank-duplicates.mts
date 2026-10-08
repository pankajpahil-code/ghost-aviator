// What the bank loader (lib/questions.ts) does to the raw sources, listed for the owner.
//
//   npx tsx tools/audit/bank-duplicates.mts            print the counts
//   npx tsx tools/audit/bank-duplicates.mts <out.md>   also write the full lists
//
// Nothing here changes a key or picks a winner. It reports:
//   1. same stem, DIFFERENT keyed answer: the first copy is live, the later one is hidden
//      (as it was before 8 Oct 2026). Both option sets are printed.
//   1c. copies held back because a declared correction already rules on their stem
//   2. copies dropped as true duplicates, and the subjects the kept copy gained
//   3. questions left out because they need a figure the site cannot show
//   4. short-stem questions the old loader deleted, which are live again
//   5. live questions with a repeated or empty option
//   6. (subject, chapterId) pairs that match no chapter in lib/subjects.ts
//
// Exits 1 if the live bank holds two copies of one stem: that is the state this report
// exists to prevent.
import { writeFileSync } from "node:fs";
import {
  ALL_QUESTIONS,
  BANK_BEFORE_DEDUPE,
  BANK_ELIGIBLE,
  collapseWithReport,
  hasBrokenOptions,
  needsMissingFigure,
  type DemoQuestion,
} from "../../lib/questions";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "../../lib/subjects";

const alnum = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
const tag = (q: DemoQuestion) => `${q.subjectIds.join("+")} / ${q.chapterId ?? "(no chapter)"}`;
const optSet = (q: DemoQuestion) => q.opts.map(alnum).sort().join("|");
const options = (q: DemoQuestion) =>
  q.opts.map((o, i) => `${i === q.ans ? "[x]" : "[ ]"} ${cell(o) || "(empty)"}`).join(" ; ");

const figure = BANK_BEFORE_DEDUPE.filter(needsMissingFigure);
const eligible = BANK_ELIGIBLE;
// Copies of a stem Capt. Pahil has ruled on that key something other than the ruled answer.
const heldBack = BANK_BEFORE_DEDUPE.filter((q) => !needsMissingFigure(q) && !eligible.includes(q));

// The script must describe the loader that pages use, not a copy of it.
const replay = collapseWithReport(eligible);
if (
  replay.live.length !== ALL_QUESTIONS.length ||
  replay.live.some((q, i) => q.q !== ALL_QUESTIONS[i].q || q.opts[q.ans] !== ALL_QUESTIONS[i].opts[ALL_QUESTIONS[i].ans])
) {
  console.error(`replay of the loader does not match ALL_QUESTIONS (${replay.live.length} vs ${ALL_QUESTIONS.length}): this report is not about the live bank`);
  process.exit(1);
}
const live = replay.live;

// 1. same stem, different keyed answer: one live copy, the later copies hidden
const pairs = replay.otherKey;
const hiddenSet = new Set(pairs.map((p) => p.hidden));
const groups = new Map<DemoQuestion, DemoQuestion[]>(); // live copy -> hidden copies
for (const p of pairs) groups.set(p.live, [...(groups.get(p.live) ?? []), p.hidden]);
const sameOptions = [...groups].filter(([l, hs]) => hs.some((h) => optSet(h) === optSet(l)));

// The state the loader must never produce: two live copies of one stem.
const liveByStem = new Map<string, DemoQuestion[]>();
for (const q of live) {
  const k = alnum(q.q);
  if (k) liveByStem.set(k, [...(liveByStem.get(k) ?? []), q]);
}
const twiceLive = [...liveByStem.values()].filter((g) => g.length > 1);

// 2. true duplicates dropped, and subjects gained
const rawByStem = new Map<string, DemoQuestion[]>();
for (const q of eligible) {
  const k = alnum(q.q);
  rawByStem.set(k, [...(rawByStem.get(k) ?? []), q]);
}
const dropped = eligible.length - live.length - pairs.length;
const gained: { q: DemoQuestion; from: DemoQuestion[]; subjects: string[] }[] = [];
for (const q of live) {
  const g = rawByStem.get(alnum(q.q)) ?? [];
  // A kept copy that gained a subject is a NEW object, so find the raw copy it came from.
  const original = g.find((r) => r.opts === q.opts && r.chapterId === q.chapterId);
  if (!original || original === q) continue;
  const subjects = q.subjectIds.filter((s) => !original.subjectIds.includes(s));
  const from = g.filter((r) => r !== original && !hiddenSet.has(r));
  if (subjects.length) gained.push({ q, from, subjects });
}
const droppedDifferentOptions = (() => {
  let n = 0;
  for (const q of live) {
    for (const r of rawByStem.get(alnum(q.q)) ?? []) {
      if (r.opts === q.opts || hiddenSet.has(r)) continue;
      if (optSet(r) !== optSet(q)) n++;
    }
  }
  return n;
})();

// 4. short stems (the old loader deleted every stem under 10 letters and digits)
const shortStems = live.filter((q) => alnum(q.q).length < 10);

// 5. repeated or empty options
const badOptions = live.filter(hasBrokenOptions);

// 6. chapter ids that match no chapter of the subject
const chapters = new Map<string, Set<string>>();
for (const s of [...CPL_SUBJECTS, ...ATPL_SUBJECTS]) chapters.set(s.id, new Set(s.chapters.map((c) => c.id)));
const unmatched = new Map<string, number>();
let noChapter = 0;
for (const q of live) {
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
  `hidden, same stem as a live copy but a different keyed answer: ${pairs.length} copies of ${groups.size} live questions`,
  `  of which the hidden copy has the same set of options as the live one (the two keys contradict): ${sameOptions.length}`,
  `dropped as true duplicates (same stem, same keyed answer): ${dropped}`,
  `  of which the dropped copy had a different set of options: ${droppedDifferentOptions}`,
  `live bank (ALL_QUESTIONS): ${live.length}`,
  `stems with more than one live copy (must be 0): ${twiceLive.length}`,
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
  L.push("Two sources carry the same question and key it differently. The copy marked LIVE is the one students");
  L.push("see, and it is the one they saw before 8 Oct 2026 (the first copy in source order). The copy marked");
  L.push("HIDDEN is not shown anywhere and was not shown before. Nothing here was decided by the loader: for each");
  L.push("pair the ruling needed is which key is right. If the hidden key is the right one, the live copy needs a");
  L.push("declared correction in lib/answer-corrections.ts.");
  L.push("");
  const printGroup = ([l, hs]: [DemoQuestion, DemoQuestion[]]) => {
    L.push(`**${cell(l.q)}**`);
    L.push("");
    L.push(`- LIVE, ${tag(l)}: keyed **${cell(l.opts[l.ans] ?? "")}**`);
    L.push(`  - options: ${options(l)}`);
    for (const h of hs) {
      L.push(`- HIDDEN, ${tag(h)}: keyed **${cell(h.opts[h.ans] ?? "")}**${hasBrokenOptions(h) ? " (this copy has a repeated or empty option)" : ""}`);
      L.push(`  - options: ${options(h)}`);
      if (h.q !== l.q) L.push(`  - stem as printed in this copy: ${cell(h.q)}`);
    }
    L.push("");
  };
  L.push("### 1a. Options are the same set: the two keys contradict each other");
  L.push("");
  sameOptions.forEach(printGroup);
  L.push("### 1b. Options differ between the copies");
  L.push("");
  [...groups].filter((g) => !sameOptions.some((s) => s[0] === g[0])).forEach(printGroup);

  L.push("### 1c. Held back: a declared correction already rules on this stem");
  L.push("");
  L.push("These copies are NOT live. lib/answer-corrections.ts carries a ruling for the stem, a copy keyed to the");
  L.push("ruled answer is live, and this other copy keys something else. They were not live before 8 Oct either.");
  L.push("");
  for (const q of heldBack) {
    const ruled = live.filter((x) => alnum(x.q) === alnum(q.q));
    L.push(`**${cell(q.q)}**`);
    L.push("");
    for (const x of ruled) {
      L.push(`- LIVE, ${tag(x)}: keyed **${cell(x.opts[x.ans] ?? "")}**`);
      L.push(`  - options: ${options(x)}`);
    }
    L.push(`- HIDDEN, ${tag(q)}: keyed **${cell(q.opts[q.ans] ?? "")}**`);
    L.push(`  - options: ${options(q)}`);
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
  L.push("Predicate: `needsMissingFigure` in lib/questions.ts. They return when the figure exists and the");
  L.push("question pages can show it. `npx tsx tools/audit/figure-stems.mts` prints every stem that mentions a");
  L.push("picture, kept or left out, for re-reading after a new source is added.");
  L.push("");
  L.push("| Filed under | Stem |");
  L.push("|---|---|");
  for (const q of figure) L.push(`| ${tag(q)} | ${cell(q.q)} |`);
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
    L.push(`  - options: ${options(q)}`);
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

if (twiceLive.length) {
  console.error(`\nFAIL: ${twiceLive.length} stems have more than one live copy`);
  for (const g of twiceLive) console.error(`  ${g[0].q.slice(0, 100)}`);
  process.exit(1);
}
