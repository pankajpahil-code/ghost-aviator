/**
 * Restore explanations whose first character was eaten by a de-prefixing script.
 *
 *   npx tsx tools/audit/repair-truncated-explanations.mts            # dry run
 *   npx tsx tools/audit/repair-truncated-explanations.mts --write    # apply
 *
 * THE BUG. Found 2026-09-06 when the Shorts renderer put an explanation on a
 * card verbatim and it read "cted on at once and read back". Something once
 * stripped a leading option label ("A. ", "B) ") from explanations and, when the
 * explanation simply STARTED with that letter, took the letter instead:
 *
 *     answer A, "Aircraft stations and..."  ->  "ircraft stations and..."
 *     answer B, "Both the theory and..."    ->  "oth the theory and..."
 *     answer C, "Clearing the siting of..." ->  "learing the siting of..."
 *
 * Invisible in the drill UI, where the explanation is one grey line most
 * students skim. Unmissable at 46px on a phone.
 *
 * WHY THIS IS A RESTORATION AND NOT A GUESS. The repair is only applied when it
 * can be PROVED, by one of two independent tests:
 *
 *   1. RESTATEMENT. Most explanations open by restating the correct option.
 *      If answerLetter + exp begins with the correct option's own opening words,
 *      the missing character is established by the question's own data, not by
 *      anything this file believes about aviation.
 *   2. DICTIONARY. The restored first token is a real word, checked against a
 *      wordlist built from the rest of the bank itself - i.e. a word the
 *      Captain has already used elsewhere in his own published text.
 *
 * Anything that passes neither is FLAGGED, never touched. Reconstructing a cut
 * sentence by inventing the missing words is exactly the failure Iron Rule 1
 * exists to prevent.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_QUESTIONS } from "../../lib/questions";
// ALL_QUESTIONS, not getChapterSpecificQuestions. The latter returns [] for a
// bank that only serves a subject as a fallback, so the first version of this
// scan could not see lib/generated/icjoshi-notes-met.ts at all and reported
// the Met bank as clean while 33 truncations sat in it.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LIB = join(ROOT, "lib");
const WRITE = process.argv.includes("--write");

const placeholder = (e?: string) =>
  !e || !e.trim() || /^\s*correct answer\s*[:\-]?\s*[A-D]?\s*\.?\s*$/i.test(e.trim());

// ---- collect every distinct question that looks truncated -------------------
type Cand = {
  q: string; exp: string; letter: string; option: string; where: string;
  fixed: string; proof: "restatement" | "dictionary" | null;
};

const seen = new Set<string>();
const cands: Cand[] = [];
const words = new Set<string>();

// TWO PASSES, DELIBERATELY. The first version built the wordlist in the same
// loop that consulted it, so every candidate was tested against however much of
// the dictionary happened to exist at that moment - and the earliest questions
// were tested against an empty one. It reported 5 provable of 73 while the
// flagged list was visibly the same defect. Collect everything first.
type Raw = { q: string; exp: string; ans: number; opts: string[]; where: string };
const all: Raw[] = [];
for (const q of ALL_QUESTIONS) {
  if (seen.has(q.q)) continue;
  seen.add(q.q);
  if (placeholder(q.exp)) continue;
  all.push({ q: q.q, exp: q.exp.trim(), ans: q.ans, opts: q.opts,
             where: (q.subjectIds?.[0] ?? "?") + "/" + (q.chapterId ?? "?") });
}

// PASS 1 - the dictionary, from healthy explanations AND every option text, so
// it is built only from words the Captain has already published himself.
for (const r of all) {
  if (/^[A-Z]/.test(r.exp))
    for (const w of r.exp.match(/\b[A-Za-z][a-z]{2,}\b/g) ?? []) words.add(w.toLowerCase());
  for (const o of r.opts)
    for (const w of o.match(/\b[A-Za-z][a-z]{2,}\b/g) ?? []) words.add(w.toLowerCase());
}

// PASS 2 - the candidates.
for (const r of all) {
  if (!/^[a-z]/.test(r.exp)) continue;
  if (/^(e\.g\.|i\.e\.|kt|kts|ft|nm|hPa|mb|deg|km|m\/s)/i.test(r.exp)) continue;
  const letter = "ABCDEFGH"[r.ans];
  if (!letter) continue;
  cands.push({
    q: r.q, exp: r.exp, letter, option: (r.opts[r.ans] ?? "").trim(),
    where: r.where, fixed: letter + r.exp, proof: null,
  });
}

// ---- prove each one, or refuse it ------------------------------------------
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

// THE MISSING CHARACTER IS NOT THE ANSWER LETTER. My first hypothesis was that
// a script stripped the answer's own label, and the debug output refuted it in
// one line: a candidate whose answer is B had lost an "A" (option "Aircraft
// stations...", explanation "ircraft stations..."). What actually happened is a
// de-prefixing regex of roughly /^[A-D][.)]?\s*/ eating the first letter of the
// SENTENCE whenever that letter happened to fall in A-D - Aircraft, Both,
// Clearing, Does, Acted, Bharatiya. So try all four and accept only when exactly
// one of them can be proved, which is what makes this a restoration rather than
// a choice.
for (const c of cands) {
  // A single lower-case letter followed by a maths operator is a variable, not
  // a truncation: "d = 1.23 x sqrt(h)" is exactly how the Captain writes a
  // formula. Excluded before anything else, or the repair invents an "A".
  if (/^[a-z]\s*[=≈<>×x*/+-]/.test(c.exp)) continue;

  const opt = norm(c.option);
  const firstWords = opt.split(" ").slice(0, 3).join(" ");
  const brokenToken = (c.exp.match(/^[A-Za-z]+/) ?? [""])[0].toLowerCase();
  const wins: { letter: string; text: string; proof: "restatement" | "dictionary" }[] = [];

  // Two shapes, because the same regex ate two different things:
  //   /^[A-D][.)]?\s*/  on "Blocks the whole..."   -> "locks the whole..."
  //   the same regex    on "A land station in..."  -> "land station in..."
  // The second lost the space as well, so both have to be tried.
  for (const L of ["A", "B", "C", "D"]) {
    for (const cand of [L + c.exp, `${L} ${c.exp}`]) {
      if (opt && firstWords.length > 3 && norm(cand).startsWith(firstWords)) {
        wins.push({ letter: L, text: cand, proof: "restatement" });
      }
    }
  }

  // RESTATEMENT IS THE ONLY STRONG PROOF and it must be unambiguous - the
  // restored sentence has to begin with the correct option's own opening words,
  // which is the question's own data rather than anything this file believes.
  const strong = wins.filter(w => w.proof === "restatement");
  const distinct = new Set(strong.map(w => w.text));
  if (distinct.size === 1) {
    c.letter = strong[0].letter;
    c.fixed = strong[0].text;
    c.proof = "restatement";
    continue;
  }

  // Weak fallback, and ONLY where the broken remainder is not itself a word -
  // so "locks"/"land"/"point" never qualify here, they need restatement.
  if (!words.has(brokenToken)) {
    const dict = ["A", "B", "C", "D"]
      .map(L => ({ L, text: L + c.exp }))
      .filter(x => {
        const tok = (x.text.match(/^[A-Za-z]+/) ?? [""])[0].toLowerCase();
        return tok.length > 2 && words.has(tok);
      });
    if (dict.length === 1) {
      c.letter = dict[0].L;
      c.fixed = dict[0].text;
      c.proof = "dictionary";
    }
  }
}

const provable = cands.filter(c => c.proof);
const flagged = cands.filter(c => !c.proof);

console.log(`candidates (explanation starts lower-case): ${cands.length}`);
console.log(`  provable  : ${provable.length}`);
console.log(`    by restatement of the correct option : ${provable.filter(c => c.proof === "restatement").length}`);
console.log(`    by dictionary from his own text      : ${provable.filter(c => c.proof === "dictionary").length}`);
console.log(`  FLAGGED, untouched : ${flagged.length}\n`);

console.log("sample of provable restorations:");
for (const c of provable.slice(0, 10))
  console.log(`  [${c.letter}] ${c.exp.slice(0, 46)}  ->  ${c.fixed.slice(0, 46)}`);

if (flagged.length) {
  console.log("\nFLAGGED - not repaired, need the Captain:");
  for (const c of flagged.slice(0, 10))
    console.log(`  [${c.where}] ${c.exp.slice(0, 80)}`);
}

if (!WRITE) {
  console.log("\nDRY RUN. Nothing written. Re-run with --write to apply the provable ones.");
  process.exit(0);
}

// ---- apply, by exact string replacement in the source files -----------------
const byExp = new Map(provable.map(c => [c.exp, c.fixed]));
let files = 0, applied = 0;
// WALK lib/ RECURSIVELY. The first version read only the top level and
// reported "applied 0" - every one of these banks lives in lib/generated/.
// A repair tool that silently matches nothing looks exactly like a repair
// tool that found nothing wrong.
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

for (const p of walk(LIB)) {
  let src = readFileSync(p, "utf8");
  const before = src;
  for (const [bad, good] of byExp) {
    // Match the explanation as a whole backtick or quoted string value, so a
    // substring of some other field can never be hit.
    for (const q of ["`", '"', "'"]) {
      const needle = `exp: ${q}${bad}${q}`;
      if (src.includes(needle)) {
        src = src.split(needle).join(`exp: ${q}${good}${q}`);
        applied++;
      }
    }
  }
  if (src !== before) { writeFileSync(p, src, "utf8"); files++; }
}
console.log(`\napplied ${applied} restorations across ${files} files`);
console.log("NOW RUN: node tools/audit/verify-repair.mjs   (must show 0 undeclared answer changes)");
