// Compare two dumps written by tools/audit/dump-keys.mts.
//
//   npx tsx tools/audit/key-diff.mts <before.json> <after.json> [--list]
//
// Rows are compared as (where, stem, keyed text), ignoring position. A change to the bank
// loader may add or remove questions; it must never leave a question in place with a
// different key. Exits 1 if any question is RE-KEYED: the same stem in the same place
// whose set of keyed answers changed without the stem being new or gone.
//
// Sample papers (ids ending -sample-N) are cut from the bank in a fixed order, so adding or
// removing one bank question moves many rows between them. They are therefore checked
// differently: every sample-paper row after the change must be a (stem, key) that the bank
// itself carries after the change.
import { readFileSync } from "node:fs";

type Row = { where: string; i: number; q: string; key: string; exp: string };
const [beforePath, afterPath] = process.argv.slice(2);
if (!beforePath || !afterPath) {
  console.error("usage: npx tsx tools/audit/key-diff.mts <before.json> <after.json> [--list]");
  process.exit(2);
}
const list = process.argv.includes("--list");
const before: Row[] = JSON.parse(readFileSync(beforePath, "utf8"));
const after: Row[] = JSON.parse(readFileSync(afterPath, "utf8"));

const isSample = (w: string) => /-sample-\d+$/.test(w);
const id = (r: Row) => `${r.where}\u0001${r.q}\u0001${r.key}`;
const stemId = (r: Row) => `${r.where}\u0001${r.q}`;
const count = (rows: Row[], f: (r: Row) => string) => {
  const m = new Map<string, number>();
  for (const r of rows) m.set(f(r), (m.get(f(r)) ?? 0) + 1);
  return m;
};

let failed = false;
const section = (name: string, b: Row[], a: Row[]) => {
  const bc = count(b, id), ac = count(a, id);
  const bStems = count(b, stemId), aStems = count(a, stemId);
  const added: string[] = [], removed: string[] = [], rekeyed: string[] = [];
  for (const [k, n] of ac) {
    const extra = n - (bc.get(k) ?? 0);
    if (extra <= 0) continue;
    const [where, q, key] = k.split("\u0001");
    // A (stem, key) that is new while the stem itself was already there with another key and
    // that other key has gone: the question was re-keyed in place.
    const stemBefore = bStems.get(`${where}\u0001${q}`) ?? 0;
    const lostKeys = [...bc.keys()].filter(
      (x) => x.startsWith(`${where}\u0001${q}\u0001`) && (ac.get(x) ?? 0) < (bc.get(x) ?? 0),
    );
    if (stemBefore > 0 && lostKeys.length > 0) {
      rekeyed.push(`${where} | ${q.slice(0, 90)} | was: ${lostKeys.map((x) => x.split("\u0001")[2]).join(" / ")} | now: ${key}`);
    } else {
      for (let j = 0; j < extra; j++) added.push(`${where} | ${q.slice(0, 110)} | ${key}`);
    }
  }
  for (const [k, n] of bc) {
    const gone = n - (ac.get(k) ?? 0);
    if (gone <= 0) continue;
    const [where, q, key] = k.split("\u0001");
    const stillThere = (aStems.get(`${where}\u0001${q}`) ?? 0) > 0;
    const newKeys = [...ac.keys()].some(
      (x) => x.startsWith(`${where}\u0001${q}\u0001`) && (ac.get(x) ?? 0) > (bc.get(x) ?? 0),
    );
    if (stillThere && newKeys) continue; // already reported as re-keyed above
    for (let j = 0; j < gone; j++) removed.push(`${where} | ${q.slice(0, 110)} | ${key}`);
  }
  console.log(`${name}: before ${b.length}, after ${a.length}, added ${added.length}, removed ${removed.length}, RE-KEYED ${rekeyed.length}`);
  if (rekeyed.length) {
    failed = true;
    for (const r of rekeyed) console.log(`  RE-KEYED ${r}`);
  }
  if (list) {
    for (const r of added) console.log(`  + ${r}`);
    for (const r of removed) console.log(`  - ${r}`);
  }
};

const pick = (rows: Row[], f: (r: Row) => boolean) => rows.filter(f);
section("bank", pick(before, (r) => r.where === "bank"), pick(after, (r) => r.where === "bank"));
section(
  "past papers",
  pick(before, (r) => r.where !== "bank" && !isSample(r.where)),
  pick(after, (r) => r.where !== "bank" && !isSample(r.where)),
);

// Sample papers: membership moves, keys must come from the bank.
const bankAfter = new Set(pick(after, (r) => r.where === "bank").map((r) => `${r.q}\u0001${r.key}`));
const sampleBefore = pick(before, (r) => isSample(r.where));
const sampleAfter = pick(after, (r) => isSample(r.where));
const foreign = sampleAfter.filter((r) => !bankAfter.has(`${r.q}\u0001${r.key}`));
const sb = new Set(sampleBefore.map(id)), sa = new Set(sampleAfter.map(id));
const moved = [...sa].filter((x) => !sb.has(x)).length;
const papers = (rows: Row[]) => new Set(rows.map((r) => r.where)).size;
console.log(
  `sample papers: before ${sampleBefore.length} rows in ${papers(sampleBefore)} papers, after ${sampleAfter.length} rows in ${papers(sampleAfter)} papers, ` +
    `${moved} rows are in a different paper or new, ${foreign.length} rows NOT keyed as the bank keys them`,
);
if (foreign.length) {
  failed = true;
  for (const r of foreign) console.log(`  NOT IN BANK ${r.where} | ${r.q.slice(0, 90)} | ${r.key}`);
}

// Explanations are not part of the comparison key; say so rather than imply they were checked.
const expB = new Map(before.map((r) => [id(r), r.exp]));
const expChanged = after.filter((r) => expB.has(id(r)) && expB.get(id(r)) !== r.exp).length;
console.log(`rows present in both whose explanation text differs: ${expChanged} (where a stem+key occurs twice in one place this compares against the last copy)`);

console.log(failed ? "\nFAIL: a key changed" : "\nOK: no question was re-keyed");
process.exit(failed ? 1 : 0);
