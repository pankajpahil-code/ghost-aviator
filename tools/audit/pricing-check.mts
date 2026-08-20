/**
 * Pricing consistency check.
 *
 *   npx tsx tools/audit/pricing-check.mts
 *
 * A price that appears in two places WILL eventually disagree. CLAUDE.md
 * already records this happening once: the cost calculator and the cost guide
 * contradicted each other and under-quoted students by ~22 lakh. This asserts
 * that lib/live-classes.ts is the only place any live-class figure is written,
 * and that Gini quotes exactly what the pages charge.
 */

import fs from "node:fs";
import path from "node:path";
import {
  LIVE_PRICE, LIVE_LIST_PRICE, LIVE_COMBO_PRICE, LIVE_COMBO_LIST_PRICE,
  LIVE_PRICE_VALUE, LIVE_COMBO_PRICE_VALUE,
} from "../../lib/live-classes";
import { ask } from "../../lib/gini/knowledge";
import { CAPTAIN_PROFILES } from "../../lib/site";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const SOURCE = "lib/live-classes.ts";

console.log("PRICING CONSISTENCY");
console.log("=".repeat(60));
console.log(`  per subject : ${LIVE_LIST_PRICE} -> ${LIVE_PRICE}   (schema ${LIVE_PRICE_VALUE})`);
console.log(`  Nav combo   : ${LIVE_COMBO_LIST_PRICE} -> ${LIVE_COMBO_PRICE}  (schema ${LIVE_COMBO_PRICE_VALUE})`);

// Any hard-coded rupee figure outside the source file is a future contradiction.
const FIGURES = [LIVE_PRICE, LIVE_LIST_PRICE, LIVE_COMBO_PRICE, LIVE_COMBO_LIST_PRICE];
const STALE = ["₹2,999", "₹7,999 founding", "₹5,999", "founding price"];

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".next" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = [...walk(path.join(ROOT, "app")), ...walk(path.join(ROOT, "lib"))];
let hardcoded = 0, stale = 0;

for (const f of files) {
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  const src = fs.readFileSync(f, "utf8");
  if (rel !== SOURCE) {
    for (const fig of FIGURES) {
      if (src.includes(fig)) {
        console.log(`  HARDCODED ${fig} in ${rel} — import it from ${SOURCE} instead`);
        hardcoded++;
      }
    }
  }
  for (const s of STALE) {
    if (src.includes(s) && rel !== "tools/audit/pricing-check.mts") {
      console.log(`  STALE "${s}" in ${rel}`);
      stale++;
    }
  }
}

console.log(`\n  hardcoded figures outside the source : ${hardcoded} ${hardcoded === 0 ? "(clean)" : "*** FIX ***"}`);
console.log(`  stale price strings                  : ${stale} ${stale === 0 ? "(clean)" : "*** FIX ***"}`);

// Gini must quote the same numbers the pages charge.
console.log("\nGINI QUOTES");
console.log("=".repeat(60));
for (const q of ["how much are the live classes", "whatsapp group", "telegram", "youtube channel"]) {
  const r = ask(q);
  const ok = r.kind === "answer";
  console.log(`  ${ok ? "ANSWER" : "REFUSE"}  "${q}"`);
  console.log(`          ${r.text.slice(0, 96)}`);
  if (ok && r.href) console.log(`          -> ${r.href}`);
}

const priceAnswer = ask("what do the classes cost");
const quotesPrice = priceAnswer.kind === "answer" && priceAnswer.text.includes(LIVE_PRICE);
console.log(`\n  Gini quotes ${LIVE_PRICE} : ${quotesPrice ? "yes" : "*** NO — DRIFT ***"}`);
console.log(`  profiles in sameAs   : ${CAPTAIN_PROFILES.length}`);
for (const p of CAPTAIN_PROFILES) console.log(`     ${p}`);
console.log("");
