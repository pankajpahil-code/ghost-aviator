// Classify what a change to the bank loader did to the live bank, from two dumps written
// by tools/audit/dump-keys.mts (one on the commit before, one on the commit after).
//
//   npx tsx tools/audit/loader-proof.mts <before.json> <after.json> [--list]
//
// Bank rows only, compared as (stem, keyed text). Reports:
//   restored  - live after, not before: short stems, stems the old 100-character prefix
//               merged into another question, and anything else (which wants explaining)
//   removed   - live before, not after: figure-dependent, and anything else
//   re-keyed  - a stem live on both sides whose keyed text changed            (must be 0)
//   new copy  - a restored row whose stem another live row also carries with a
//               different key: a second opinion that was never live before    (must be 0)
// Exits 1 if either "must be 0" count is not 0.
import { readFileSync } from "node:fs";
import { needsMissingFigure } from "../../lib/questions";

type Row = { where: string; i: number; q: string; key: string };
const [beforePath, afterPath] = process.argv.slice(2);
if (!beforePath || !afterPath) {
  console.error("usage: npx tsx tools/audit/loader-proof.mts <before.json> <after.json> [--list]");
  process.exit(2);
}
const list = process.argv.includes("--list");
const bank = (p: string): Row[] => (JSON.parse(readFileSync(p, "utf8")) as Row[]).filter((r) => r.where === "bank");
const before = bank(beforePath), after = bank(afterPath);

const alnum = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const id = (r: Row) => `${r.q}\u0001${r.key}`;
const tally = (rows: Row[], f: (r: Row) => string) => {
  const m = new Map<string, Row[]>();
  for (const r of rows) m.set(f(r), [...(m.get(f(r)) ?? []), r]);
  return m;
};
const bIds = tally(before, id), aIds = tally(after, id);
const bStems = tally(before, (r) => alnum(r.q)), aStems = tally(after, (r) => alnum(r.q));
const bPrefix = tally(before, (r) => alnum(r.q).slice(0, 100));

const added: Row[] = [], removed: Row[] = [];
for (const [k, rows] of aIds) for (let j = bIds.get(k)?.length ?? 0; j < rows.length; j++) added.push(rows[j]);
for (const [k, rows] of bIds) for (let j = aIds.get(k)?.length ?? 0; j < rows.length; j++) removed.push(rows[j]);

// re-keyed: a stem on both sides whose set of keyed texts differs
const rekeyed: string[] = [];
for (const [stem, rows] of aStems) {
  const b = bStems.get(stem);
  if (!b) continue;
  const ka = [...new Set(rows.map((r) => r.key))].sort().join(" / ");
  const kb = [...new Set(b.map((r) => r.key))].sort().join(" / ");
  if (ka !== kb) rekeyed.push(`${rows[0].q.slice(0, 100)} | before: ${kb} | after: ${ka}`);
}

const short = added.filter((r) => alnum(r.q).length < 10);
const prefix = added.filter((r) => {
  const s = alnum(r.q);
  return s.length >= 10 && !bStems.has(s) && (bPrefix.get(s.slice(0, 100)) ?? []).length > 0;
});
const addedOther = added.filter((r) => !short.includes(r) && !prefix.includes(r));
const newCopies = added.filter((r) => (aStems.get(alnum(r.q)) ?? []).some((x) => x !== r && x.key !== r.key));
const twice = [...aStems].filter(([s, rows]) => s && new Set(rows.map((r) => r.key)).size > 1);

const figure = removed.filter((r) => needsMissingFigure(r));
const removedOther = removed.filter((r) => !figure.includes(r));
// A removed row whose (stem) is still live is a true duplicate the old loader showed twice.
const removedStillLive = removedOther.filter((r) => aStems.has(alnum(r.q)));

console.log(`bank before: ${before.length}   bank after: ${after.length}`);
console.log(`restored: ${added.length}`);
console.log(`  short stems (under 10 letters and digits): ${short.length}`);
console.log(`  stems the old 100-character prefix merged into another question: ${prefix.length}`);
console.log(`  other: ${addedOther.length}`);
console.log(`removed: ${removed.length}`);
console.log(`  figure-dependent (needsMissingFigure): ${figure.length}`);
console.log(`  other: ${removedOther.length} (of which the stem is still live in another copy: ${removedStillLive.length})`);
console.log(`re-keyed (must be 0): ${rekeyed.length}`);
console.log(`restored rows that are a second, differently keyed copy of a live stem (must be 0): ${newCopies.length}`);
console.log(`stems live after with more than one keyed answer (must be 0): ${twice.length}`);
for (const r of rekeyed) console.log(`  RE-KEYED ${r}`);
for (const r of newCopies) console.log(`  NEW COPY ${r.q.slice(0, 100)} | ${r.key}`);
for (const r of addedOther) console.log(`  RESTORED, UNEXPLAINED ${r.q.slice(0, 110)} | ${r.key}`);
for (const r of removedOther) console.log(`  REMOVED, NOT A FIGURE ${r.q.slice(0, 110)} | ${r.key}`);
if (list) {
  for (const r of short) console.log(`  + short   ${r.q} | ${r.key}`);
  for (const r of prefix) console.log(`  + prefix  ${r.q.slice(0, 160)} | ${r.key}`);
  for (const r of figure) console.log(`  - figure  ${r.q.slice(0, 160)}`);
}
const failed = rekeyed.length > 0 || newCopies.length > 0 || twice.length > 0;
console.log(failed ? "\nFAIL" : "\nOK");
process.exit(failed ? 1 : 0);
