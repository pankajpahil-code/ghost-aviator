// tools/audit/apply-content-fixes-2026-10-17.mjs
//
// Applies the fixes for every conflict / defect flagged by the answer-key
// program on 2026-10-17 (full evidence: tools/audit/content-fixes-2026-10-17.md).
//
// Byte-exact discipline: every `find` must occur EXACTLY ONCE in its file; all
// edits are computed and asserted BEFORE anything is written (atomic). Encoding
// (BOM) and line endings (CRLF/LF) of each file are detected and preserved.
// Re-runs are safe: an edit whose `find` is gone and whose `replace` is present
// is reported as already applied, never as a failure.
// Dry-run by default; --apply writes the files and dumps the quarantine archive
// to tools/audit/answer-key-archive/content-fixes-2026-10-17.json.
//
// Run from the repo root:  node tools/audit/apply-content-fixes-2026-10-17.mjs [--apply]

import fs from "node:fs";
import path from "node:path";

const APPLY = process.argv.includes("--apply");
const ARCHIVE = "tools/audit/answer-key-archive/content-fixes-2026-10-17.json";

// ---------------------------------------------------------------------------
// The edits. `find`/`replace` use \n; the file's own EOL style is substituted.
// ---------------------------------------------------------------------------
const EDITS = [
  {
    id: "inst40-D-Q10-grid",
    file: "public/content/instrumentation/inst-40/notes.html",
    find: "<td>9</td><td>c</td><td>10</td><td>c</td><td>11</td><td>d</td>",
    replace: "<td>9</td><td>c</td><td>10</td><td>b</td><td>11</td><td>d</td>",
    note:
      "Engine Instruments source key, Q10 (EPR during take-off run): grid said c; the page's own explained answer is (b) and the dataset " +
      "(lib/generated/oxford-instrumentation.ts, 'During the take-off run, the effect of increasing airspeed...' ans: 1 = b) keys b. Grid corrected c -> b.",
  },
  {
    id: "inst40-F-Q11-grid",
    file: "public/content/instrumentation/inst-40/notes.html",
    find: "<td>11</td><td>c</td><td>w1</td>",
    replace: "<td>11</td><td>b</td><td>w1</td>",
    note:
      "Specimen Examination Paper source key, Q11 ('What correction is given by TCAS?'): grid said c; the inline explained answer is (b) " +
      "'Climb or descend' and the dataset (oxford-instrumentation.ts, same stem, ans: 1) keys b. Grid corrected c -> b.",
  },
  {
    id: "ar3-Q3-highlight-to-A",
    file: "public/content/air-regulations/ar-3/notes.html",
    find: '<li class="correct-ans">\u2713 C) Landing, take-off and taxiing is allowed on runway and/or taxiway only</li>',
    replace: "<li>C) Landing, take-off and taxiing is allowed on runway and/or taxiway only</li>",
    note:
      "Q3 (white dumb-bell WITH black perpendicular bar): ICAO Annex 2 App 1 4.2.3.2 = 'land and take off on runways only, but other " +
      "manoeuvres need not be confined' -> option A, matching the source key (grid 3-A) and the rk-bali bank ('black bar placed perpendicular " +
      "to the shaft', ans = runways for landing & take off family). The old highlight (C) described the PLAIN dumb-bell. Highlight moved C -> A (part 1).",
  },
  {
    id: "ar3-Q3-highlight-to-A-2",
    file: "public/content/air-regulations/ar-3/notes.html",
    find: "<li>A) Taxiing need not be confined to the taxiways</li>",
    replace: '<li class="correct-ans">\u2713 A) Taxiing need not be confined to the taxiways</li>',
    note: "Q3 highlight moved C -> A (part 2).",
  },
  {
    id: "ar3-Q6-highlight-to-C",
    file: "public/content/air-regulations/ar-3/notes.html",
    find: '<li class="correct-ans">\u2713 A) Not land for the moment regardless of previous instructions</li>',
    replace: "<li>A) Not land for the moment regardless of previous instructions</li>",
    note:
      "Q6 (series of red flashes to an aircraft in the circuit): the ICAO light-signal table = 'Aerodrome unsafe, do not land' -> option C; the " +
      "source key (grid 6-C) and all four rk-bali printings of this question key the 'aerodrome unsafe' option over the 'notwithstanding any " +
      "previous instructions' (red-pyrotechnic) wording. The old highlight (A) was the pyrotechnic answer. Highlight moved A -> C (part 1).",
  },
  {
    id: "ar3-Q6-highlight-to-C-2",
    file: "public/content/air-regulations/ar-3/notes.html",
    find: "<li>C) Not land because the airport is not available for landing</li>",
    replace: '<li class="correct-ans">\u2713 C) Not land because the airport is not available for landing</li>',
    note: "Q6 highlight moved A -> C (part 2).",
  },
  {
    id: "ar16-tip-Q7-letter",
    file: "public/content/air-regulations/ar-16/notes.html",
    find: "<strong>Q7 / Q16 (C):</strong>",
    replace: "<strong>Q7 (B) / Q16 (C):</strong>",
    note:
      "Tip mini-key: Q7 ('The maximum duty time limit per day extension for a scheduled flight is' - 1.5/2/3 hrs) is keyed B (2 hrs) by the grid " +
      "above and by the corrections registry (FDP extension = 2 hrs, lib/answer-corrections.ts). The tip wrongly printed (C). Fixed to Q7 (B) / Q16 (C); " +
      "Q16 = C remains correct (FT +1 hr, FDP +2 hrs).",
  },
  {
    id: "ar19-Q1-highlight-to-A",
    file: "public/content/air-regulations/ar-19/notes.html",
    find:
      '<div class="correct">\u2713 B) Prevention of accidents or incidents and to help the manufacturers in design ' +
      '<span style="font-size:11px; font-weight: normal;">\u2014 <i>per textbook answer key</i></span></div>',
    replace: "<div>B) Prevention of accidents or incidents and to help the manufacturers in design</div>",
    note:
      "Q1 (objective of the investigation): the source key grid says A and the explanation text says 'Textbook Answer: A' - the highlight (B) was the " +
      "outlier. Highlight moved B -> A (part 1: B unmarked).",
  },
  {
    id: "ar19-Q1-highlight-to-A-2",
    file: "public/content/air-regulations/ar-19/notes.html",
    find: "<div>A) Prevention of accidents or incidents and to help the judges</div>",
    replace:
      '<div class="correct">\u2713 A) Prevention of accidents or incidents and to help the judges ' +
      '<span style="font-size:11px; font-weight: normal;">\u2014 <i>per textbook answer key</i></span></div>',
    note: "Q1 highlight moved B -> A (part 2: A marked, 'per textbook answer key' tag moved with it).",
  },
  {
    id: "ar18-heading-reword",
    file: "public/content/air-regulations/ar-18/notes.html",
    find: "32. Exam-Prep Quick Cards \u2014 Answer Key Highlights",
    replace: "32. Exam-Prep Quick Cards",
    note:
      "Orphan heading: no grid exists anywhere in ar-18; 'Answer Key' in the heading was misleading (recon: 'orphan heading - reword').",
  },
  {
    id: "rnav15-Q3-note",
    file: "public/content/radio-navigation/rnav-15/notes.html",
    find:
      "<b>Answer: (b)</b><br>Range = (1290 &minus; 50) / 12.36 = 1240 / 12.36 = <span class='rv'>100.3 NM</span>. " +
      "(Note: 100.3 NM applies the 50 &micro;s delay correction; the intended answer (b) 104.3 NM uses the raw 1290 &micro;s.)",
    replace:
      "<b>Answer: (b)</b> &mdash; as per the source key. Raw echo time: 1290 / 12.36 = <span class='rv'>104.3 NM</span> &rarr; option (b). " +
      "With the standard 50 &micro;s transponder-delay correction: (1290 &minus; 50) / 12.36 = 100.3 NM &rarr; option (a). " +
      "Answer in the exam: (b).",
    note:
      "Q3 note rewrite: the old text showed 'Answer: (b)' above a computation that yields 100.3 NM (option a) - the muddle. Keyed answer (b) preserved " +
      "(dataset ans: 1); both derivations now stated cleanly. KEY-FLIP RULING still open for the Captain (page + dataset exp).",
  },
  {
    id: "rnav19-Q3-note",
    file: "public/content/radio-navigation/rnav-19/notes.html",
    find:
      "<b>Ans: (c)</b> &mdash; 1.23\u00d7(\u221a400+\u221a9000)=1.23\u00d7(20+94.9)=1.23\u00d7114.9=<span class='rv'>141 NM</span>. " +
      "Nearest = 140 NM (d). [For the variant with 325/8000 ft: 1.23\u00d7(18+89)=134 NM]",
    replace:
      "<b>Ans: (c)</b> &mdash; as per the source key. 1.23\u00d7(\u221a400+\u221a9000)=1.23\u00d7(20+94.9)=1.23\u00d7114.9=<span class='rv'>141 NM</span> " +
      "&rarr; nearest option (d) 140 NM. The source key's (c) 134 NM matches the 325 ft / 8000 ft variant: 1.23\u00d7(18+89)=134 NM. " +
      "Answer in the exam: (c).",
    note:
      "Q3 note rewrite: 'Ans: (c)' above a computation yielding 141 NM (option d) - the muddle. Keyed answer (c) preserved (dataset ans: 2); both " +
      "derivations now stated cleanly. KEY-FLIP RULING still open for the Captain (page + dataset exp).",
  },
  {
    id: "rnav3-stray-div",
    file: "public/content/radio-navigation/rnav-3/notes.html",
    find: '</div>\n</div>\n\n<div class="watermark"',
    replace: '</div>\n\n<div class="watermark"',
    note:
      "Source hygiene: one surplus </div> before the watermark block (open 117 / close 118; stack says line 705 closes nothing). Browser already ignores " +
      "it, so the DOM is unchanged; counts now balance 117/117.",
  },
  {
    id: "navcx39-css-comment",
    file: "public/content/air-navigation/nav-cx3-9/notes.html",
    find: "applied per <tr>, which",
    replace: "applied per table row, which",
    note:
      "Source hygiene: the tag-balance 'imbalance' (tr 45/44) was a false positive - the literal <tr> sat inside a CSS comment (L505). Comment reworded so " +
      "counts read clean (44/44); zero render impact.",
  },
  {
    id: "ar25-final-newline",
    file: "public/content/air-regulations/ar-25/notes.html",
    find: null,
    replace: null,
    kind: "append-eol",
    note: "Encoding hygiene: file did not end with a newline; a final CRLF is appended (ar-25 cosmetic finding).",
  },
];

// ---------------------------------------------------------------------------

function readFilePreserving(file) {
  const buf = fs.readFileSync(file);
  const bom = buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  let text = buf.toString("utf8");
  if (bom) text = text.slice(1); // strip BOM char
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  return { bom, eol, text };
}

function writeFilePreserving(file, { bom, text }) {
  const out = bom ? "\ufeff" + text : text;
  fs.writeFileSync(file, Buffer.from(out, "utf8"));
}

const results = [];
let failures = 0;

for (const edit of EDITS) {
  const rec = { id: edit.id, file: edit.file, note: edit.note, kind: edit.kind ?? "replace" };
  if (!fs.existsSync(edit.file)) {
    rec.status = "FAIL: file missing";
    failures++;
    results.push(rec);
    continue;
  }
  const state = readFilePreserving(edit.file);
  if (edit.kind === "append-eol") {
    rec.before = "</html>";
    rec.after = "</html>" + state.eol;
    if (/\r?\n$/.test(state.text)) {
      rec.status = "SKIP: already ends with newline";
    } else if (!state.text.endsWith("</html>")) {
      rec.status = "FAIL: does not end with </html>";
      failures++;
    } else {
      rec.status = "OK (append " + (state.eol === "\r\n" ? "CRLF" : "LF") + ")";
      if (APPLY) {
        state.text += state.eol;
        writeFilePreserving(edit.file, state);
      }
    }
    results.push(rec);
    continue;
  }
  const find = edit.find.replace(/\n/g, state.eol);
  const replace = edit.replace.replace(/\n/g, state.eol);
  const count = state.text.split(find).length - 1;
  if (count !== 1) {
    const already = state.text.split(replace).length - 1;
    if (count === 0 && already === 1) {
      rec.status = "SKIP: already applied";
      rec.before = find;
      rec.after = replace;
      results.push(rec);
      continue;
    }
    rec.status = `FAIL: find occurs ${count} time(s), expected exactly 1`;
    failures++;
    results.push(rec);
    continue;
  }
  rec.status = "OK (1 match)";
  rec.before = find;
  rec.after = replace;
  if (APPLY) {
    state.text = state.text.replace(find, replace);
    writeFilePreserving(edit.file, state);
  }
  results.push(rec);
}

// Post-apply verification: every `after` present, every `before` gone.
if (APPLY && failures === 0) {
  for (const rec of results) {
    const state = readFilePreserving(rec.file);
    if (rec.kind === "append-eol") {
      if (/\r?\n$/.test(state.text)) rec.status += " | post-check clean";
      else {
        rec.status += " | POST-CHECK FAILED";
        failures++;
      }
      continue;
    }
    if (!rec.before) continue;
    const afterCount = state.text.split(rec.after).length - 1;
    const beforeCount = state.text.split(rec.before).length - 1;
    if (afterCount < 1 || beforeCount !== 0) {
      rec.status += " | POST-CHECK FAILED";
      failures++;
    } else {
      rec.status += " | post-check clean";
    }
  }
}

console.log(`${APPLY ? "APPLY" : "DRY-RUN"} - ${EDITS.length} edit(s), ${failures} failure(s)`);
for (const rec of results) {
  console.log(`  [${rec.status}] ${rec.id}  (${rec.file})`);
}
if (!APPLY) {
  console.log("\nRe-run with --apply to write files + archive.");
} else if (failures === 0) {
  const archive = {
    generatedAt: new Date().toISOString(),
    purpose: "Content fixes for the answer-key program's flagged conflicts + structural hygiene items (2026-10-17).",
    report: "tools/audit/content-fixes-2026-10-17.md",
    edits: results.map(({ id, file, note, before, after }) => ({ id, file, note, before, after })),
  };
  fs.mkdirSync(path.dirname(ARCHIVE), { recursive: true });
  fs.writeFileSync(ARCHIVE, JSON.stringify(archive, null, 2) + "\n");
  console.log(`\nArchive written: ${ARCHIVE}`);
} else {
  console.error("\nFailures present - archive NOT written.");
  process.exit(1);
}
