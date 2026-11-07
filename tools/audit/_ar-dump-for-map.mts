// Reads the de-duplicated bank BEFORE site chapters are applied, so `bank` is the old bank chapter id.
// Feeds tools/audit/air-regs-site-chapters.py.
import { BANK_ELIGIBLE, collapseDuplicates } from "../../lib/questions";
import { readFileSync, writeFileSync } from "fs";
const tsv = readFileSync("tools/audit/air-regs-full-audit-2026-09-21.tsv", "utf8").split("\n").slice(1).map(l => l.split("\t"));
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const src = new Map<string, string>();
for (const r of tsv) if (r[10]) src.set(norm(r[10]).slice(0, 120), r[8]);
const rows = collapseDuplicates(BANK_ELIGIBLE).filter(q => q.subjectIds.some(s => s === "air-regulations" || s === "atpl-air-regulations"))
  .map(q => ({ bank: q.chapterId ?? "", src: src.get(norm(q.q).slice(0,120)) ?? "", q: q.q.replace(/\s+/g," "), a: (q.opts[q.ans]??"").replace(/\s+/g," ") }));
writeFileSync(process.argv[2], JSON.stringify(rows, null, 0));
console.log(rows.length, rows.filter(r=>!r.src).length, "without audit source");
