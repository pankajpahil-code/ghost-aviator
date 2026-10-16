// Builds lib/generated/previous-questions.ts from the DGCA recall banks kept outside the repo:
//   D:\pk\CPL Met Question Papers\CPL_Met_Bank.json
//   D:\pk\CPL Air Regs Question Papers\CPL_Regs_Bank.json
//   D:\pk\CPL Navigation Question Papers\CPL_Navigation_Bank.json
// Those banks are candidates' recollections of real DGCA sittings, deduplicated and keyed, each
// question listing every sitting it was recalled from. Vercel cannot read D:\, so the output is
// generated here and committed (same reason as lib/generated/lastmod.ts).
//
//   npx tsx tools/previous-questions/build.mts            (writes the file)
//   npx tsx tools/previous-questions/build.mts --check    (exit 1 if the committed file is stale)
//
// What it guarantees, and refuses to write otherwise:
//  - no field starting with "_" (the builders' provenance notes) reaches the site;
//  - no source or author name (Iron Rule 2, the one compiler in tools/forbidden-source-names.mjs);
//  - every question has 2+ distinct options, a key inside them and a real explanation;
//  - every correction in corrections.json matches its question's CURRENT keyed text before it is
//    applied (an entry written against an older bank cannot silently re-key something else);
//  - a subject is published only when config.json says so, which is set after an independent
//    key check, never before.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = path.join(ROOT, "tools", "previous-questions");
const OUT = path.join(ROOT, "lib", "generated", "previous-questions.ts");
const { findForbidden } = await import(pathToFileURL(path.join(ROOT, "tools", "forbidden-source-names.mjs")).href);

type Raw = Record<string, unknown> & { uid: string; topic: string; stem: string; opts: string[]; ans: number; exp: string; seen_in: string[]; times_seen: number };
type Correction = { was: string; now?: string; exp?: string; note?: string; hide?: boolean; why: string };
type SubjectCfg = { slug: string; subjectId: string; title: string; short: string; file: string; published: boolean; checked: string };

const config: { subjects: SubjectCfg[] } = JSON.parse(fs.readFileSync(path.join(HERE, "config.json"), "utf8"));
const corrections: Record<string, Correction> = JSON.parse(fs.readFileSync(path.join(HERE, "corrections.json"), "utf8")).corrections;

const errors: string[] = [];
const fail = (m: string) => errors.push(m);
const SESSION_NOT_STATED = "Previous papers · session not stated";
const usedCorrections = new Set<string>();

function yearOf(label: string): number | null {
  const m = label.match(/\b(19|20)\d{2}\b/);
  return m ? Number(m[0]) : null;
}

const subjects = config.subjects.map(cfg => {
  const bank = JSON.parse(fs.readFileSync(cfg.file, "utf8")) as { sittings: string[]; questions: Raw[] };
  const sittings = bank.sittings.filter(s => s !== SESSION_NOT_STATED);
  const questions = [];
  for (const q of bank.questions) {
    let ans = Number(q.ans);
    let exp = String(q.exp ?? "").trim();
    let note: string | undefined;
    const opts = q.opts.map(o => String(o).trim());
    const c = corrections[q.uid];
    if (c) {
      usedCorrections.add(q.uid);
      if (opts[ans] !== c.was) { fail(`${q.uid}: correction expects keyed "${c.was}" but the bank keys "${opts[ans]}"`); continue; }
      if (c.hide) continue;
      if (c.now !== undefined) {
        const i = opts.indexOf(c.now);
        if (i < 0) { fail(`${q.uid}: correction target "${c.now}" is not one of the options`); continue; }
        ans = i;
      }
      if (c.exp !== undefined) exp = c.exp;
      if (c.note !== undefined) note = c.note;
    }
    if (opts.length < 2 || new Set(opts.map(o => o.toLowerCase())).size !== opts.length) fail(`${q.uid}: options missing or repeated`);
    if (!(ans >= 0 && ans < opts.length)) fail(`${q.uid}: key ${ans} outside the options`);
    if (exp.length < 20) fail(`${q.uid}: explanation missing or too short`);
    const text = [q.stem, ...opts, exp, q.topic, ...q.seen_in].join("\n");
    const hit = findForbidden(text);
    if (hit) fail(`${q.uid}: names a source (${hit})`);
    const kind = q.reconstructed ? "rebuilt" : q.from_topic ? "topic" : "asked";
    const seenIn = q.seen_in.map(String);
    const dated = seenIn.filter(s => s !== SESSION_NOT_STATED);
    questions.push({
      id: q.uid,
      topic: String(q.topic),
      stem: String(q.stem).trim(),
      opts,
      ans,
      exp,
      seenIn: dated,
      undated: seenIn.length !== dated.length,
      // Only real sittings earn credit. A question written from a topic mention does not.
      times: kind === "topic" ? 0 : dated.length,
      years: [...new Set(dated.map(yearOf).filter((y): y is number => y !== null))].sort(),
      kind,
      optionsWritten: Boolean(q.options_rebuilt),
      ...(note ? { note } : {}),
    });
  }
  const years = [...new Set(sittings.map(yearOf).filter((y): y is number => y !== null))].sort();
  return {
    slug: cfg.slug, subjectId: cfg.subjectId, title: cfg.title, short: cfg.short, published: cfg.published,
    checked: cfg.checked, sittings, firstYear: years[0], lastYear: years[years.length - 1], questions,
  };
});

for (const uid of Object.keys(corrections)) if (!usedCorrections.has(uid)) fail(`correction ${uid} matched no question`);

if (errors.length) {
  console.error(`REFUSED: ${errors.length} problem(s)`);
  for (const e of errors.slice(0, 60)) console.error("  " + e);
  process.exit(1);
}

const json = JSON.stringify(subjects);
const body = `// GENERATED by tools/previous-questions/build.mts from the DGCA recall banks. Do not edit.
// Regenerate after any change to a bank, to corrections.json or to config.json.
import type { PQSubject } from "../previous-questions-types";
export const PQ_DATA: PQSubject[] = JSON.parse(${JSON.stringify(json)});
`;

if (process.argv.includes("--check")) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (cur !== body) { console.error("lib/generated/previous-questions.ts is stale: run the build"); process.exit(1); }
  console.log("previous-questions data is current");
} else {
  fs.writeFileSync(OUT, body);
}
for (const s of subjects) {
  const hidden = s.questions.length;
  console.log(`${s.slug.padEnd(22)} ${String(hidden).padStart(4)} questions  ${s.sittings.length} sittings ${s.firstYear}-${s.lastYear}  published=${s.published}`);
}
console.log(`corrections applied: ${usedCorrections.size}`);
