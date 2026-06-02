// ─────────────────────────────────────────────────────────────────────────────
// IC Joshi Meteorology HTML notes → (1) chapter notes pages, (2) questions.
//
//  (1) Copies each Ch0N_*.html to public/content/meteorology/met-N/notes.html
//      so the site serves it as the chapter's Notes (via HtmlNotesPage iframe).
//  (2) Parses the "Practice Q&A" blocks (.qa-block) — question + options + the
//      inline answer + explanation/tip — into chapter-tagged DemoQuestion data.
//      De-duped by question stem (within + across chapters).
//
// Run from ghost-aviator dir:  node tools/build-notes-met.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { injectProtection } from "./_protect-snippet.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NOTES_DIR = join(ROOT, "..", "IC Joshi", "DGCA Notes");
const PUBLIC_DIR = join(ROOT, "public", "content", "meteorology");
const OUT = join(ROOT, "lib", "generated", "icjoshi-notes-met.ts");

// Ch file → { chapterId, subtopic }
const CHAPTERS = [
  ["Ch01_Atmosphere.html",                               "met-1",  "Atmosphere"],
  ["Ch02_Atmospheric_Pressure.html",                     "met-2",  "Atmospheric Pressure"],
  ["Ch03_Temperature.html",                              "met-3",  "Temperature"],
  ["Ch04_Air_Density.html",                              "met-4",  "Air Density"],
  ["Ch05_Humidity.html",                                 "met-5",  "Humidity"],
  ["Ch06_Winds.html",                                    "met-6",  "Winds"],
  ["Ch07_Visibility_and_Fog.html",                       "met-7",  "Visibility and Fog"],
  ["Ch08_Vertical_Motion_and_Clouds.html",               "met-8",  "Vertical Motion and Clouds"],
  ["Ch09_Stability_and_Instability_of_Atmosphere.html",  "met-9",  "Stability and Instability"],
  ["Ch10_Optical_Phenomena.html",                        "met-10", "Optical Phenomena"],
  ["Ch11_Precipitation.html",                            "met-11", "Precipitation"],
  ["Ch12_Ice_Accretion.html",                            "met-12", "Ice Accretion"],
  ["Ch13_Thunderstorm.html",                             "met-13", "Thunderstorm"],
  ["Ch14_Air_Masses_Fronts_Western_Disturbances.html",   "met-14", "Air Masses, Fronts & Western Disturbances"],
  ["Ch15_Jet_Streams.html",                              "met-15", "Jet Streams"],
  ["Ch16_Clear_Air_Turbulence.html",                     "met-16", "Clear Air Turbulence"],
  ["Ch17_Mountain_Waves.html",                           "met-17", "Mountain Waves"],
  ["Ch18_Tropical_Systems.html",                         "met-18", "Tropical Systems"],
  ["Ch19_Climatology_of_India.html",                     "met-19", "Climatology of India"],
  ["Ch20_General_Circulation.html",                      "met-20", "General Circulation"],
  ["Ch21_Meteorological_Services_for_Aviation.html",     "met-21", "Meteorological Services for Aviation"],
  ["Ch22_Weather_Radar_and_Met_Satellites.html",         "met-22", "Weather Radar & Met Satellites"],
  ["Ch23_Met_Instruments.html",                          "met-23", "Met Instruments"],
];

const SUBJECT_IDS = ["meteorology", "atpl-meteorology"];
const SOURCE = "IC Joshi — Aviation Meteorology";

// ── HTML helpers ─────────────────────────────────────────────────────────────
const ENTITIES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&nbsp;": " ", "&deg;": "°",
  "&times;": "×", "&minus;": "−", "&le;": "≤", "&ge;": "≥", "&plusmn;": "±",
  "&rarr;": "→", "&ndash;": "–", "&mdash;": "—", "&quot;": '"', "&#39;": "'",
};
function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&[a-z]+;/gi, m => ENTITIES[m] ?? m);
}
function htmlToText(html) {
  return decode(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    // drop decorative leading marks
    .replace(/[✅❌💡🎯📌⚠️📘⚡🧠✈️🔢]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const firstClass = (block, ...classes) => {
  for (const c of classes) {
    const m = block.match(new RegExp(`<div class="${c}[^"]*">([\\s\\S]*?)</div>`, "i"));
    if (m) return m[1];
  }
  return null;
};

// ── Parse one Q&A block ──────────────────────────────────────────────────────
function parseBlock(block, ctx) {
  const qHtml = firstClass(block, "qa-question", "qa-q");
  const aHtml = firstClass(block, "qa-answer", "qa-a");
  if (!qHtml || !aHtml) return null;

  let qText = htmlToText(qHtml).replace(/^Q\.?\s*\d+\.?\s*/i, "");
  const aIdx = qText.search(/\(\s*a\s*\)/i);
  if (aIdx === -1) return null;
  const stem = qText.slice(0, aIdx).replace(/[:\-–—\s]+$/, "").trim();
  const optsPart = qText.slice(aIdx);

  const opts = [];
  const optRe = /\(\s*([a-d])\s*\)\s*([\s\S]*?)(?=\(\s*[a-d]\s*\)|$)/gi;
  let m;
  while ((m = optRe.exec(optsPart))) {
    opts[m[1].toLowerCase().charCodeAt(0) - 97] = m[2].replace(/[.\s]+$/, "").trim();
  }
  const cleanOpts = opts.filter(o => o && o.length);
  if (cleanOpts.length < 2 || cleanOpts.length !== opts.length) return null; // gaps → skip

  const ansText = htmlToText(aHtml);
  const am = ansText.match(/Answer[^():]*:?\s*\(\s*([a-d])\s*\)/i);
  if (!am) return null;
  const ans = am[1].toLowerCase().charCodeAt(0) - 97;
  if (ans >= cleanOpts.length) return null;

  // Build a rich explanation. Some templates have a separate explanation div;
  // others embed the explanation in the answer block after "Answer: (x) ...".
  const expHtml = firstClass(block, "qa-explanation", "qa-exp");
  const tipHtml = firstClass(block, "qa-tip");
  const body = expHtml
    ? htmlToText(expHtml)
    : ansText.replace(/^Answer[^:]*:\s*\(\s*[a-d]\s*\)\s*/i, "");
  let exp = [body, tipHtml && htmlToText(tipHtml)]
    .filter(Boolean).join(" ").replace(/^Explanation:\s*/i, "").trim();
  if (exp.length > 600) exp = exp.slice(0, 597).trimEnd() + "…";
  if (!exp) exp = `Correct answer: ${"ABCD"[ans]}.`;

  return {
    subjectIds: SUBJECT_IDS,
    chapterId: ctx.chapterId,
    subtopic: ctx.subtopic,
    source: SOURCE,
    q: stem,
    opts: cleanOpts,
    ans,
    exp,
  };
}

// ── Build ────────────────────────────────────────────────────────────────────
const all = [];
const seen = new Set();
const perChapter = {};
const key = s => s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 80);

for (const [file, chapterId, subtopic] of CHAPTERS) {
  const src = join(NOTES_DIR, file);
  if (!existsSync(src)) { console.log("  (missing)", file); continue; }
  const html = readFileSync(src, "utf8");

  // (1) copy note to public (with content-protection injected)
  const dest = join(PUBLIC_DIR, chapterId);
  mkdirSync(dest, { recursive: true });
  writeFileSync(join(dest, "notes.html"), injectProtection(html), "utf8");

  // (2) extract questions
  const qaStart = html.search(/id="qa"/);
  const region = qaStart === -1 ? html : html.slice(qaStart);
  const blocks = region.split(/<div class="qa-block">/).slice(1);
  let n = 0;
  for (const b of blocks) {
    const q = parseBlock(b, { chapterId, subtopic });
    if (!q) continue;
    const k = key(q.q);
    if (k.length < 8 || seen.has(k)) continue;
    seen.add(k);
    all.push(q);
    n++;
  }
  perChapter[chapterId] = n;
}

// ── Emit ─────────────────────────────────────────────────────────────────────
const tsStr = s => "`" + String(s).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";
const lines = [
  `import type { DemoQuestion } from "../demo-questions";`,
  ``,
  `// AUTO-GENERATED by tools/build-notes-met.mjs — do not edit by hand.`,
  `// Source: ${SOURCE} (HTML study-notes Q&A, answers from textbook key)`,
  `// ${all.length} questions · per chapter: ${JSON.stringify(perChapter)}`,
  `export const ICJOSHI_NOTES_MET: DemoQuestion[] = [`,
];
for (const q of all) {
  lines.push(`  {`);
  lines.push(`    subjectIds: ${JSON.stringify(q.subjectIds)},`);
  lines.push(`    chapterId: ${JSON.stringify(q.chapterId)},`);
  lines.push(`    subtopic: ${tsStr(q.subtopic)},`);
  lines.push(`    source: ${tsStr(q.source)},`);
  lines.push(`    q: ${tsStr(q.q)},`);
  lines.push(`    opts: [${q.opts.map(tsStr).join(", ")}],`);
  lines.push(`    ans: ${q.ans},`);
  lines.push(`    exp: ${tsStr(q.exp)},`);
  lines.push(`  },`);
}
lines.push(`];`, ``);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, lines.join("\n"), "utf8");
console.log(`\n✓ ${all.length} questions → lib/generated/icjoshi-notes-met.ts`);
console.log(`  per chapter:`, perChapter);
console.log(`  notes copied → public/content/meteorology/met-1..met-11/notes.html`);
