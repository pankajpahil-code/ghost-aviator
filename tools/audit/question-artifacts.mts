// tools/audit/question-artifacts.mts
//
// BUILD GUARD: internal editing notes must never reach a student.
//
// The 2026-10-25 pass found explanations such as "Options de-garbled",
// "Fixed 'tropopau se'" and "with a typo in the stem", plus a stem that read
// "The diameter of and Macroburst". Those are provenance notes from the
// question-cleaning workflow, not teaching content. This guard fails the build
// if any of them (or the known broken stems) come back.
//
// Run directly: npx tsx tools/audit/question-artifacts.mts

import { ALL_QUESTIONS } from "../../lib/questions";

const ARTIFACT_PATTERNS: { name: string; re: RegExp }[] = [
  { name: "de-garbled", re: /\bde-?garbled\b/i },
  { name: "garbled", re: /\bgarbled\b/i },
  { name: "tropopau se", re: /\btropopau se\b/i },
  { name: "options tidied", re: /\boptions? tidied\b/i },
  { name: "fixed missing", re: /\bfixed missing\b/i },
  { name: "original options were garbled", re: /\boriginal options were garbled\b/i },
  { name: "repaired duplicated", re: /\brepaired duplicated\b/i },
  { name: "typo in the stem", re: /\bwith a typo in the stem\b/i },
  { name: "1824 hr", re: /\b1824 hr\b/i },
  { name: "diameter of and", re: /\bdiameter of and\b/i },
];

type Finding = {
  stem: string;
  subjectIds: string[];
  issues: string[];
};

const findings: Finding[] = [];

for (const q of ALL_QUESTIONS) {
  const text = [q.q, q.exp ?? "", ...q.opts].join("\n");
  const issues = ARTIFACT_PATTERNS.filter(({ re }) => re.test(text)).map(({ name }) => name);

  if (!Array.isArray(q.opts) || q.opts.length < 2) issues.push("fewer than 2 options");
  if (typeof q.ans !== "number" || q.ans < 0 || q.ans >= (q.opts?.length ?? 0)) {
    issues.push("answer index out of range");
  }

  if (issues.length > 0) {
    findings.push({ stem: q.q, subjectIds: q.subjectIds, issues });
  }
}

if (findings.length > 0) {
  console.error(`QUESTION ARTIFACT GUARD: ${findings.length} question(s) contain internal notes or broken data.`);
  for (const f of findings.slice(0, 40)) {
    console.error(`- [${f.subjectIds.join(", ")}] ${f.stem}`);
    console.error(`  ${f.issues.join("; ")}`);
  }
  if (findings.length > 40) console.error(`...and ${findings.length - 40} more.`);
  process.exit(1);
}

console.log(`Question artifact guard: clean (${ALL_QUESTIONS.length} questions).`);
