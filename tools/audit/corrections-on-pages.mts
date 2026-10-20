// Which declared trusted-content corrections are VISIBLE on the notes pages, and
// do those pages show the corrected answer or the superseded one?
//
//   npx tsx tools/audit/corrections-on-pages.mts
//
// lib/answer-corrections.ts is the single place a bank answer is changed on
// purpose (DGCA CARs / ICAO / FAA / Aircraft Rules citations in every entry).
// The corrections apply to the quiz bank and past papers; the notes pages are
// static HTML authored from the source books. This tool finds every correction
// whose question also appears on a notes page, extracts the page's marked
// answer, and classifies it:
//
//   UPDATED  page shows the corrected option
//   STALE    page still shows the superseded option
//   OTHER    page answer could not be matched to either text (manual review)
//   NOT-ON-PAGES  question is not present in any notes page (nothing to do)
//
// Read-only. Exit code 1 lists STALE/OTHER counts but does not modify anything.
import fs from "node:fs";
import path from "node:path";
import { ANSWER_CORRECTIONS } from "../../lib/answer-corrections";

const CONTENT = path.resolve("public/content");

const decode = (s: string) =>
  s.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&mdash;/g, "\u2014").replace(/&ndash;/g, "\u2013").replace(/&minus;/g, "\u2212")
    .replace(/&micro;/g, "\u00b5").replace(/&times;/g, "\u00d7").replace(/&deg;/g, "\u00b0")
    .replace(/&rsquo;|&lsquo;/g, "'").replace(/&rdquo;|&ldquo;/g, '"')
    .replace(/&frac12;/g, "\u00bd").replace(/&plusmn;/g, "\u00b1").replace(/&rarr;/g, "\u2192");

const visibleText = (s: string) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const norm = (s: string) => visibleText(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const compact = (s: string) => norm(s).replace(/ /g, "");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name === "notes.html") out.push(p);
  }
  return out;
}

// Compact searchable text with a map back to raw offsets (tags keep their length).
function indexPage(html: string) {
  const spaced = html.replace(/<[^>]+>/g, (m) => " ".repeat(m.length));
  let compactText = "";
  const map: number[] = [];
  for (let i = 0; i < spaced.length; i++) {
    const ch = spaced[i].toLowerCase();
    if (/[a-z0-9]/.test(ch)) { compactText += ch; map.push(i); }
  }
  return { compactText, map };
}

type Candidate = { kind: string; text: string };
function answerCandidates(html: string): Candidate[] {
  const out: Candidate[] = [];
  // elements whose class marks the correct option / answer area
  const elRe = /<(li|div|td|tr|span|p)\b[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = elRe.exec(html))) {
    const classes = m[2].toLowerCase().split(/\s+/);
    if (classes.some((c) => ["correct", "opt-correct", "ans", "ans-tag", "correct-ans", "answer-correct", "answer", "qa-answer", "answer-reveal"].includes(c))) {
      out.push({ kind: "marked", text: m[3] });
    }
  }
  // explicit reveal blocks even when their class list did not match above
  const revRe = /<div[^>]*class="[^"]*answer-reveal[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  while ((m = revRe.exec(html))) out.push({ kind: "reveal", text: m[1] });
  // plain "Answer: (x) text" / "Correct Answer: (x) text" runs
  const ansRe = /(?:Correct\s+)?Answer\s*:?\s*(?:<strong>)?\s*\(?([a-d])\)?\s*(?:<\/strong>)?\s*([^<]{0,160})/gi;
  while ((m = ansRe.exec(html))) out.push({ kind: "plain", text: m[1] + " " + m[2] });
  return out;
}

const contains = (hay: string, needle: string) => {
  const nh = norm(hay), nd = norm(needle);
  if (!nd) return false;
  if (nd.length <= 4) {
    return nh.split(" ").includes(nd) || nh.replace(/ /g, "").includes(nd);
  }
  return nh.includes(nd) || nh.replace(/ /g, "").includes(nd.replace(/ /g, ""));
};

const pages = walk(CONTENT).map((file) => {
  const html = fs.readFileSync(file, "utf8");
  const { compactText, map } = indexPage(html);
  return { file, html, compactText, map };
});

let onPages = 0, updated = 0, stale = 0, other = 0, notFound = 0, editOnly = 0;
const updatedList: string[] = [];
const staleList: string[] = [];
const otherList: string[] = [];

for (const c of ANSWER_CORRECTIONS) {
  if (c.hide) continue;
  // Entries whose keyed text did not change (option/stem rewrites only) cannot
  // be "stale"; they are counted separately.
  if (norm(c.was) === norm(c.now)) { editOnly++; continue; }
  const stems = [c.q, c.edit?.q].filter(Boolean) as string[];
  let hit: { page: (typeof pages)[number]; pos: number; stem: string } | null = null;
  for (const stem of stems) {
    const cs = compact(stem);
    if (cs.length < 12) continue;
    for (const page of pages) {
      const i = page.compactText.indexOf(cs);
      if (i >= 0) { hit = { page, pos: page.map[i], stem }; break; }
    }
    if (hit) break;
  }
  if (!hit) { notFound++; continue; }
  onPages++;
  const from = Math.max(0, hit.pos - 400);
  const window = hit.page.html.slice(from, hit.pos + 9000);
  const cands = answerCandidates(window);
  let verdict: "UPDATED" | "STALE" | "OTHER" = "OTHER";
  let evidence = "";
  for (const cand of cands) {
    const hasNow = contains(cand.text, c.now);
    const hasWas = contains(cand.text, c.was);
    if (hasNow && !hasWas) { verdict = "UPDATED"; evidence = cand.text; break; }
    if (hasWas && !hasNow) { verdict = "STALE"; evidence = cand.text; break; }
    if (hasWas && hasNow && !evidence) { evidence = cand.text; }
  }
  if (verdict === "UPDATED") {
    updated++;
    updatedList.push(`${hit.page.file.replace(CONTENT + path.sep, "")} — ${c.q.slice(0, 80)} → "${c.now}"`);
  } else if (verdict === "STALE") {
    stale++;
    staleList.push(`${hit.page.file.replace(CONTENT + path.sep, "")}\n      Q: ${c.q.slice(0, 90)}\n      page: "${visibleText(evidence).slice(0, 130)}"\n      was: "${c.was}" | now: "${c.now}"`);
  } else {
    other++;
    otherList.push(`${hit.page.file.replace(CONTENT + path.sep, "")}\n      Q: ${c.q.slice(0, 90)}\n      page evidence: "${visibleText(evidence || (cands[0]?.text ?? "")).slice(0, 150)}"\n      was: "${c.was}" | now: "${c.now}"`);
  }
}

console.log("CORRECTIONS vs NOTES PAGES — do the static pages show the corrected answer?");
console.log(`corrections: ${ANSWER_CORRECTIONS.filter((c) => !c.hide).length} declared (hides skipped)`);
console.log(`question found on a notes page: ${onPages}`);
console.log(`UPDATED ${updated} | STALE ${stale} | OTHER ${other} | edit-only ${editOnly} | not-on-notes-pages ${notFound}`);
if (updatedList.length) {
  console.log(`\nUPDATED (${updatedList.length}):`);
  for (const s of updatedList) console.log("  - " + s);
}
if (staleList.length) {
  console.log(`\nSTALE (${staleList.length}) — page still shows the superseded answer:`);
  for (const s of staleList) console.log("  - " + s);
}
if (otherList.length) {
  console.log(`\nOTHER (${otherList.length}) — page answer not matched to either text, manual review:`);
  for (const s of otherList) console.log("  - " + s);
}
process.exitCode = stale > 0 ? 1 : 0;
