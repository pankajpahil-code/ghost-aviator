// ─────────────────────────────────────────────────────────────────────────────
// Oxford "DGCA Study Notes" HTML → chapter-tagged practice questions.
//
// These notes (Instrumentation, Radio Navigation, …) all share one Q&A template:
//   <div class="qa-block">
//     <div class="qa-question">
//       <span class="q-number">Q1.</span><span class="q-text">…question…</span>
//       <ol class="q-options" type="a"><li>opt a</li>…<li>opt d</li></ol>
//     </div>
//     <div class="qa-answer">
//       <div class="answer-reveal">✓ Correct Answer: <strong>(c)</strong> …</div>
//       <div class="answer-explanation"><strong>Explanation:</strong> …</div>
//       <div class="instructor-note">…</div>
//     </div>
//   </div>
//
// This tool EXTRACTS questions only. The notes themselves are published with:
//   cp -r "<src>/<chap>/." public/content/<subject>/<chap>/   (notes.html + figs)
//   node tools/protect-notes.mjs                              (inject protection)
//
// Run from ghost-aviator dir:  node tools/build-notes-oxford.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ── What to build ────────────────────────────────────────────────────────────
// Each config emits one lib/generated/<out>.ts bank.
const CONFIGS = [
  {
    name: "OXFORD_INSTRUMENTATION",
    out: "oxford-instrumentation.ts",
    subjectIds: ["instrumentation"],
    source: "Oxford ATPL — Instrumentation",
    srcBase: join(ROOT, "..", "oxford instrumentation notes claude", "DGCA Study Notes"),
    // [ source notes.html (relative to srcBase), chapterId, subtopic ]
    chapters: Array.from({ length: 23 }, (_, i) => [
      `inst-${i + 1}/notes.html`, `inst-${i + 1}`, `Instrumentation Ch.${i + 1}`,
    ]),
  },
  {
    name: "OXFORD_RADIO_NAV",
    out: "oxford-radio-nav.ts",
    subjectIds: ["radio-navigation"],
    source: "Oxford ATPL — Radio Navigation",
    srcBase: join("C:", "Users", "Admin", "Downloads", "radio navigation antigravity"),
    chapters: [
      ["Chapter_01_Properties_of_Radio_Waves.html", "rnav-1", "Properties of Radio Waves"],
      ["Chapter_02_Radio_Propagation_Theory.html",  "rnav-2", "Radio Propagation Theory"],
      ["Chapter_03_Modulation.html",                "rnav-3", "Modulation"],
      ["Chapter_04_Antennae.html",                  "rnav-4", "Antennae"],
      ["Chapter_05_Doppler_Radar_Systems.html",     "rnav-5", "Doppler Radar Systems"],
      ["Chapter_06_VDF.html",                       "rnav-6", "VHF Direction Finder (VDF)"],
      ["Chapter_07_ADF.html",                       "rnav-7", "ADF"],
      ["Chapter_08_VOR.html",                       "rnav-8", "VOR"],
      ["Chapter_09_ILS.html",                       "rnav-9", "ILS"],
      ["Chapter_10_MLS.html",                       "rnav-10", "MLS"],
      ["Chapter_11_Radar_Principles.html",          "rnav-11", "Radar Principles"],
      ["Chapter_12_Ground_Radar.html",              "rnav-12", "Ground Radar"],
      ["Chapter_13_AWR.html",                       "rnav-13", "Airborne Weather Radar"],
      ["Chapter_14_SSR.html",                       "rnav-14", "SSR"],
      ["Chapter_15_DME.html",                       "rnav-15", "DME"],
      ["Chapter_16_RNAV.html",                      "rnav-16", "Area Navigation (RNAV)"],
      ["Chapter_17_EFIS.html",                      "rnav-17", "EFIS"],
      ["Chapter_18_GNSS.html",                      "rnav-18", "GNSS"],
      ["Chapter_19_Revision_Questions.html",        "rnav-19", "Revision Questions"],
      ["Chapter_20_Quick_Reference.html",           "rnav-20", "Quick Reference"],
    ],
  },
  {
    name: "OXFORD_GEN_NAV",
    out: "oxford-gen-nav.ts",
    subjectIds: ["general-navigation"],
    source: "Oxford ATPL — General Navigation",
    srcBase: join("C:", "Users", "Admin", "Downloads", "radio navigation antigravity"),
    chapters: [
      ["GN_Chapter_01_Direction_Lat_Long.html",  "gnav-1",  "Direction, Latitude & Longitude"],
      ["GN_Chapter_02_GC_Rhumb_Lines.html",      "gnav-2",  "Great Circles, Rhumb Lines & Directions"],
      ["GN_Chapter_03_Earth_Magnetism.html",     "gnav-3",  "Earth Magnetism"],
      ["GN_Chapter_10_1in60_Rule.html",          "gnav-10", "The 1 in 60 Rule"],
      ["GN_Chapter_11_1in60_Navigation.html",    "gnav-11", "Navigation Using the 1 in 60 Rule"],
      ["GN_Chapter_12_1in60_Applications.html",  "gnav-12", "Other Applications of the 1 in 60 Rule"],
      ["GN_Chapter_13_Topo_Maps.html",           "gnav-13", "Topographical Maps & Map Reading"],
      ["GN_Chapter_14_Convergency.html",         "gnav-14", "Convergency & Conversion Angle"],
    ],
  },
];

// ── HTML helpers ─────────────────────────────────────────────────────────────
const ENTITIES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&nbsp;": " ", "&deg;": "°",
  "&times;": "×", "&minus;": "−", "&le;": "≤", "&ge;": "≥", "&plusmn;": "±",
  "&rarr;": "→", "&ndash;": "–", "&mdash;": "—", "&quot;": '"', "&#39;": "'",
  "&rsquo;": "'", "&lsquo;": "'", "&ldquo;": '"', "&rdquo;": '"', "&hellip;": "…",
};
function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&[a-z]+;/gi, m => ENTITIES[m] ?? m);
}
function htmlToText(html) {
  return decode(
    html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ")
  )
    .replace(/[✅❌💡🎯📌⚠️📘⚡🧠✈️🔢✓✗]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const firstClass = (block, cls) => {
  const m = block.match(new RegExp(`<div class="${cls}[^"]*">([\\s\\S]*?)</div>`, "i"));
  return m ? m[1] : null;
};

// ── Parse one Q&A block ──────────────────────────────────────────────────────
function parseBlock(block, ctx) {
  // Question stem — two template variants:
  //   A) <span class="q-text">…question…</span>
  //   B) question text inline in qa-question after the Q-number span, before <ol>
  let stem;
  const qm = block.match(/<span class="q-text[^"]*">([\s\S]*?)<\/span>/i);
  if (qm) {
    stem = htmlToText(qm[1]);
  } else {
    const qq = block.match(/<div class="qa-question[^"]*">([\s\S]*?)<ol class="q-options/i);
    if (!qq) return null;
    stem = htmlToText(qq[1].replace(/<span class="q-number[^"]*">[\s\S]*?<\/span>/i, " "));
  }
  stem = stem.replace(/^Q\.?\s*\d+\.?\s*/i, "").trim();
  if (stem.length < 8) return null;

  // Options (ordered <li> inside <ol class="q-options">)
  const ol = block.match(/<ol class="q-options[^"]*"[^>]*>([\s\S]*?)<\/ol>/i);
  if (!ol) return null;
  const opts = [...ol[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map(m => htmlToText(m[1]))
    .filter(Boolean);
  if (opts.length < 2 || opts.length > 5) return null;

  // Correct answer letter from the answer-reveal line. Variants:
  //   "Correct Answer: (c) …"   → parenthesised letter
  //   "Correct Answer: B"        → bare letter (often <strong>B</strong>)
  const reveal = firstClass(block, "answer-reveal");
  if (!reveal) return null;
  const revealText = htmlToText(reveal);
  const am = revealText.match(/\(\s*([a-e])\s*\)/i)
          ?? revealText.match(/Answer[:\s]*([a-e])\b/i);
  if (!am) return null;
  const ans = am[1].toLowerCase().charCodeAt(0) - 97;
  if (ans < 0 || ans >= opts.length) return null;

  // Explanation (+ instructor note), trimmed.
  const expHtml = firstClass(block, "answer-explanation");
  const tipHtml = firstClass(block, "instructor-note");
  let exp = [expHtml && htmlToText(expHtml), tipHtml && htmlToText(tipHtml)]
    .filter(Boolean).join(" ")
    .replace(/^(?:Explanation|Why):\s*/i, "")
    .replace(/Instructor['']?s Note:?\s*/i, "— ")
    .trim();
  if (exp.length > 600) exp = exp.slice(0, 597).trimEnd() + "…";
  if (!exp) exp = `Correct answer: ${"ABCDE"[ans]}.`;

  return { subjectIds: ctx.subjectIds, chapterId: ctx.chapterId, subtopic: ctx.subtopic, source: ctx.source, q: stem, opts, ans, exp };
}

// ── Parse the alternate "show-answer" template ───────────────────────────────
//   <div class="q">Q1. …</div>
//   <div class="opts"><div class="opt"><b>(a)</b> …</div>…</div>
//   <div class="answer">…<b>Answer: (b)</b><br>explanation</div>
function parseBlockV2(block, ctx) {
  const qm = block.match(/<div class="q">([\s\S]*?)<\/div>/i);
  if (!qm) return null;
  const stem = htmlToText(qm[1]).replace(/^Q\.?\s*\d+\.?\s*/i, "").trim();
  if (stem.length < 8) return null;

  const opts = [];
  for (const m of block.matchAll(/<div class="opt">([\s\S]*?)<\/div>/gi)) {
    const txt = htmlToText(m[1]);
    const lm = txt.match(/^\(?\s*([a-e])\s*\)?[.)]?\s*(.*)$/i);
    if (!lm) continue;
    opts[lm[1].toLowerCase().charCodeAt(0) - 97] = lm[2].trim();
  }
  const clean = opts.filter(Boolean);
  if (clean.length < 2 || clean.length !== opts.length) return null;

  const an = block.match(/<div class="answer"[^>]*>([\s\S]*?)<\/div>/i);
  if (!an) return null;
  const ansText = htmlToText(an[1]);
  const am = ansText.match(/Ans(?:wer)?[:\s]*\(\s*([a-e])\s*\)/i)
          ?? ansText.match(/\(\s*([a-e])\s*\)/i)
          ?? ansText.match(/Ans(?:wer)?[:\s]*([a-e])\b/i);
  if (!am) return null;
  const ans = am[1].toLowerCase().charCodeAt(0) - 97;
  if (ans < 0 || ans >= clean.length) return null;

  let exp = ansText.replace(/^.*?Ans(?:wer)?[:\s]*\(?\s*[a-e]\s*\)?\s*/i, "").trim();
  if (exp.length > 600) exp = exp.slice(0, 597).trimEnd() + "…";
  if (!exp) exp = `Correct answer: ${"ABCDE"[ans]}.`;

  return { subjectIds: ctx.subjectIds, chapterId: ctx.chapterId, subtopic: ctx.subtopic, source: ctx.source, q: stem, opts: clean, ans, exp };
}

// ── Parse the General-Navigation template ────────────────────────────────────
//   <div class="qa-q"><strong>Q1.</strong> question… <div…><em>Anchor: …</em></div></div>
//   <div class="qa-opts"><div class="qa-opt">(a) …</div><div class="qa-opt correct">(c) … ✓</div>…</div>
//   <details><summary>…</summary><div class="qa-answer"><div class="answer-box">Ans… explanation</div>…</details>
// The correct option is marked by the `correct` class on its qa-opt div.
function parseBlockV3(block, ctx) {
  const qm = block.match(/<div class="qa-q"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>)?\s*<div class="qa-opts/i)
          ?? block.match(/<div class="qa-q"[^>]*>([\s\S]*?)<div class="qa-opts/i);
  if (!qm) return null;
  // Drop the inline "Anchor: …" sub-div (and anything after the first nested div).
  const stem = htmlToText(qm[1].split(/<div/i)[0]).replace(/^Q\.?\s*\d+\.?\s*/i, "").trim();
  if (stem.length < 8) return null;

  const opts = [];
  let ans = -1;
  for (const m of block.matchAll(/<div class="qa-opt((?!s)[^"]*)">([\s\S]*?)<\/div>/gi)) {
    const txt = htmlToText(m[2]).replace(/✓\s*$/, "").trim();
    const lm = txt.match(/^\(?\s*([a-e])\s*\)?[.)]?\s*(.*)$/i);
    if (!lm) continue;
    const idx = lm[1].toLowerCase().charCodeAt(0) - 97;
    opts[idx] = lm[2].trim();
    if (/\bcorrect\b/i.test(m[1])) ans = idx;
  }
  const clean = opts.filter(Boolean);
  if (clean.length < 2 || clean.length !== opts.length) return null;
  if (ans < 0 || ans >= clean.length) return null;

  const an = block.match(/<div class="answer-box"[^>]*>([\s\S]*?)<\/div>/i)
          ?? block.match(/<div class="qa-answer"[^>]*>([\s\S]*?)<\/div>/i);
  let exp = an ? htmlToText(an[1]).replace(/^Ans(?:wer)?[:\s]*\(?\s*[a-e]\s*\)?[.\s—-]*/i, "").trim() : "";
  if (exp.length > 600) exp = exp.slice(0, 597).trimEnd() + "…";
  if (!exp) exp = `Correct answer: ${"ABCDE"[ans]}.`;

  return { subjectIds: ctx.subjectIds, chapterId: ctx.chapterId, subtopic: ctx.subtopic, source: ctx.source, q: stem, opts: clean, ans, exp };
}

// ── Build each config ────────────────────────────────────────────────────────
const tsStr = s => "`" + String(s).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";

for (const cfg of CONFIGS) {
  const all = [];
  const seen = new Set();
  const perChapter = {};
  const key = s => s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 80);

  for (const [file, chapterId, subtopic] of cfg.chapters) {
    const src = join(cfg.srcBase, file);
    if (!existsSync(src)) { console.log("  (missing)", file); continue; }
    const html = readFileSync(src, "utf8");
    const i = html.indexOf('id="qa-section"');
    const region = i === -1 ? html : html.slice(i);
    const blocks = region.split(/<div class="qa-block[^"]*"[^>]*>/).slice(1);
    let n = 0;
    for (const b of blocks) {
      const q = parseBlock(b, { ...cfg, chapterId, subtopic })
             ?? parseBlockV2(b, { ...cfg, chapterId, subtopic })
             ?? parseBlockV3(b, { ...cfg, chapterId, subtopic });
      if (!q) continue;
      const k = key(q.q);
      if (k.length < 8 || seen.has(k)) continue;
      seen.add(k);
      all.push(q);
      n++;
    }
    perChapter[chapterId] = n;
  }

  const lines = [
    `import type { DemoQuestion } from "../demo-questions";`,
    ``,
    `// AUTO-GENERATED by tools/build-notes-oxford.mjs — do not edit by hand.`,
    `// Source: ${cfg.source} (HTML study-notes Q&A)`,
    `// ${all.length} questions · per chapter: ${JSON.stringify(perChapter)}`,
    `export const ${cfg.name}: DemoQuestion[] = [`,
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
  const outPath = join(ROOT, "lib", "generated", cfg.out);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`✓ ${cfg.name}: ${all.length} questions → lib/generated/${cfg.out}`);
  console.log(`  per chapter:`, perChapter);
}
