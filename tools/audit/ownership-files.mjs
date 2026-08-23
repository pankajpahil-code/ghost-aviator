/**
 * FILES THAT PROVE THIS SITE IS THE CAPTAIN'S, AND MUST NEVER BE DELETED.
 *
 *   node tools/audit/ownership-files.mjs
 *
 * Runs as the first step of `npm run build`, so a deploy FAILS rather than
 * silently shipping a site that has lost its ownership proofs.
 * ────────────────────────────────────────────────────────────────────────────
 * WHY THIS IS A BUILD STEP AND NOT A COMMENT.
 *
 * A search engine verification token is not content — it is the evidence that
 * Capt. Pahil owns ghostaviator.com. Remove the file and the property silently
 * becomes unverified: Search Console access is lost, and with it the coverage
 * and performance data that every SEO decision in CLAUDE.md was made from.
 * Nothing breaks visibly. No page 404s. No test goes red. You find out weeks
 * later, from Google, in an email.
 *
 * These files are also exactly the kind that get swept. They sit at the root of
 * public/, they have machine-generated names, they contain one line, and they
 * look like debris to anyone tidying up. This repository has a standing rule
 * that nothing is ever deleted — only moved to _quarantine/ — and this is the
 * mechanism for the handful of files where even that is not good enough.
 *
 * THE CONTENT IS HASHED, NOT JUST THE PATH. Google compares the file's contents
 * byte for byte; a file that still exists but has been "helpfully" reformatted,
 * commented, or given a trailing newline fails verification exactly as if it
 * had been deleted. So do not add anything to these files — not a comment, not
 * a license header, not a newline.
 *
 * TO ADD ONE: put the file in public/, run this script, and paste the sha256 it
 * prints. Never paste a hash you have not seen this script produce.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const REQUIRED = [
  {
    path: "public/google03c67855fee92810.html",
    sha256: "0670c1b0c983ce3599306df409788a5f1c820112f264abe9d9b2c257c1cedb99",
    what: "Google Search Console verification for ghostaviator.com",
    added: "2026-08-23, at the Captain's instruction: upload it and never remove it",
  },
];

let bad = 0;
const printed = [];

for (const f of REQUIRED) {
  if (!existsSync(f.path)) {
    bad++;
    console.error(`\nMISSING: ${f.path}`);
    console.error(`  ${f.what}`);
    console.error(`  Added ${f.added}`);
    console.error(`  Deleting it does not break a page — it silently un-verifies the domain.`);
    console.error(`  Restore it from git history: git checkout HEAD -- ${f.path}`);
    continue;
  }

  const actual = createHash("sha256").update(readFileSync(f.path)).digest("hex");
  printed.push({ path: f.path, actual });

  if (f.sha256 && actual !== f.sha256) {
    bad++;
    console.error(`\nCHANGED: ${f.path}`);
    console.error(`  ${f.what}`);
    console.error(`  expected sha256 ${f.sha256}`);
    console.error(`  actual   sha256 ${actual}`);
    console.error(`  Verification compares the contents byte for byte. Even adding a`);
    console.error(`  trailing newline or a comment breaks it as surely as deleting it.`);
  }
}

if (bad) {
  console.error(`\n${bad} ownership file(s) missing or altered — build stopped.\n`);
  process.exit(1);
}

console.log(`Ownership files OK (${REQUIRED.length}).`);
for (const p of printed) console.log(`  ${p.path}\n    sha256 ${p.actual}`);
