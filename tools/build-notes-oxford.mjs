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
    chapters: Array.from({ length: 40 }, (_, i) => [
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
    name: "REGS_NOTES",
    out: "regs-notes.ts",
    subjectIds: ["air-regulations"],
    source: "Air Regulations — chapter study notes",
    srcBase: join("C:", "Users", "Admin", "Downloads", "regs"),
    chapters: [
      ["22/HPL_Chapter23_Human_Factors.html", "ar-22", "Human Performance and Limitations"],
      ["23/CRM_TEM_LOFT_StudyNotes.html",     "ar-23", "CRM, TEM & LOFT"],
    ],
  },
  {
    // Oxford General Navigation — merged into the Air Navigation subject
    // (user direction 2026-06-11: GN and Air Navigation are the same paper).
    name: "OXFORD_GEN_NAV",
    out: "oxford-gen-nav.ts",
    subjectIds: ["air-navigation"],
    source: "Oxford ATPL — General Navigation",
    srcBase: join("C:", "Users", "Admin", "Downloads", "radio navigation antigravity"),
    chapters: [
      ["GN_Chapter_01_Direction_Lat_Long.html",  "nav-13", "Direction, Latitude & Longitude"],
      ["GN_Chapter_02_GC_Rhumb_Lines.html",      "nav-14", "Great Circles, Rhumb Lines & Directions"],
      ["GN_Chapter_03_Earth_Magnetism.html",     "nav-15", "Earth Magnetism"],
      ["GN_Chapter_10_1in60_Rule.html",          "nav-16", "The 1 in 60 Rule"],
      ["GN_Chapter_11_1in60_Navigation.html",    "nav-17", "Navigation Using the 1 in 60 Rule"],
      ["GN_Chapter_12_1in60_Applications.html",  "nav-18", "Other Applications of the 1 in 60 Rule"],
      ["GN_Chapter_13_Topo_Maps.html",           "nav-19", "Topographical Maps & Map Reading"],
      ["GN_Chapter_14_Convergency.html",         "nav-20", "Convergency & Conversion Angle"],
      ["GN_Chapter_15_Departure.html",           "nav-21", "Departure"],
      ["GN_Chapter_16_Scale.html",               "nav-22", "Scale"],
      ["GN_Chapter_17_Chart_Properties.html",    "nav-23", "General Chart Properties"],
      ["GN_Chapter_18_Mercator.html",            "nav-24", "Mercator Charts"],
      ["GN_Chapter_21_Lamberts.html",            "nav-25", "Lambert's Conformal Chart"],
      ["GN_Chapter_23_Polar_Stereo.html",        "nav-26", "Polar Stereographic Chart"],
      ["GN_Chapter_24_Time1.html",               "nav-27", "Time (1) — Solar System & Time Basics"],
      ["GN_Chapter_25_Time2.html",               "nav-28", "Time (2) — Conversions & the Dateline"],
      ["GN_Chapter_26_Time3.html",               "nav-29", "Sunrise, Sunset & Twilight"],
      ["GN_Chapter_29_DI_Compass.html",          "nav-30", "Direct Indicating Compass"],
      ["GN_Chapter_30_Aircraft_Magnetism.html",  "nav-31", "Aircraft Magnetism"],
      ["GN_Chapter_31_GenNav_Problems.html",     "nav-32", "General Navigation Problems"],
      ["GN_Chapter_32_Revision_Questions.html",  "nav-33", "Revision Questions"],
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

// ── Parse the June-2026 GN details/summary template ──────────────────────────
//   <div class="qa-block"><details class="qa-details">
//     <summary class="qa-toggle"><span class="qa-num">Q1</span><span class="qa-stem">…</span></summary>
//     <div class="qa-opts"><span class="qa-opt"><strong>a.</strong> …</span>…</div>
//     <div class="qa-answer"><div class="ans-label">Answer: c</div><div class="qstep">…workings…</div></div>
//   </details></div>
// Worked-problem chapters share the shape but have no qa-opts → correctly skipped.
function parseBlockV4(block, ctx) {
  const sm = block.match(/<span class="qa-stem[^"]*">([\s\S]*?)<\/span>/i);
  if (!sm) return null;
  const stem = htmlToText(sm[1]).trim();
  if (stem.length < 8) return null;
  // Question needs an unseen figure/map/appendix → not answerable standalone.
  if (/appendix|figure (?:below|above|\d)|map extract|diagram (?:below|above)|in the (?:figure|diagram|illustration)|jeppesen|E\(LO\)/i.test(stem)) return null;

  const om = block.match(/<div class="qa-opts[^"]*">([\s\S]*?)<\/div>/i);
  if (!om) return null;
  const opts = [];
  for (const m of om[1].matchAll(/<span class="qa-opt[^"]*">([\s\S]*?)<\/span>/gi)) {
    const txt = htmlToText(m[1]);
    const lm = txt.match(/^\(?\s*([a-e])\s*[.)]\s*(.*)$/i);
    if (!lm) continue;
    opts[lm[1].toLowerCase().charCodeAt(0) - 97] = lm[2].trim();
  }
  const clean = opts.filter(Boolean);
  if (clean.length < 2 || clean.length !== opts.length) return null;

  const al = block.match(/<div class="ans-label[^"]*">([\s\S]*?)<\/div>/i);
  if (!al) return null;
  const am = htmlToText(al[1]).match(/Answer[:\s]*\(?\s*([a-e])\b/i);
  if (!am) return null;
  const ans = am[1].toLowerCase().charCodeAt(0) - 97;
  if (ans < 0 || ans >= clean.length) return null;

  const qs = block.match(/<div class="qstep[^"]*">([\s\S]*?)<\/div>/i);
  let exp = qs ? htmlToText(qs[1]).trim() : "";
  if (exp.length > 600) exp = exp.slice(0, 597).trimEnd() + "…";
  if (!exp) exp = `Correct answer: ${"ABCDE"[ans]}.`;

  return { subjectIds: ctx.subjectIds, chapterId: ctx.chapterId, subtopic: ctx.subtopic, source: ctx.source, q: stem, opts: clean, ans, exp };
}

// ── Parse the GN revision-question card template (nav-33) ────────────────────
//   <div class="qa-card" id="qN"><p class="q-text">…</p>
//     <div class="q-options"><div class="opt-item correct-opt"><span class="opt-label">C</span><span class="opt-text">…</span></div>…</div>
//     …<div class="answer-letter">Correct Answer: <strong>C</strong></div><div class="explanation">…</div></div>
// The answer is marked TWICE (correct-opt class + answer letter) — both must agree.
function parseBlockV5(block, ctx) {
  const qm = block.match(/<p class="q-text[^"]*">([\s\S]*?)<\/p>/i);
  if (!qm) return null;
  // Figure-dependent (appendix chart) or incomplete-source questions stay notes-only.
  if (/class="(?:app-ref|missing-opt|instructor-note)"/i.test(block)) return null;
  const stem = htmlToText(qm[1]).trim();
  if (stem.length < 8) return null;
  if (/appendix|figure (?:below|above|\d)|map extract|diagram (?:below|above)|in the (?:figure|diagram|illustration)|jeppesen|E\(LO\)/i.test(stem)) return null;

  const opts = [];
  let ansFromClass = -1;
  for (const m of block.matchAll(/<div class="opt-item([^"]*)"><span class="opt-label">([A-E])<\/span><span class="opt-text">([\s\S]*?)<\/span><\/div>/gi)) {
    const idx = m[2].charCodeAt(0) - 65;
    opts[idx] = htmlToText(m[3]).trim();
    if (/correct-opt/.test(m[1])) ansFromClass = idx;
  }
  const clean = opts.filter(Boolean);
  if (clean.length < 2 || clean.length !== opts.length) return null;

  const lm = block.match(/Correct Answer:\s*<strong>\s*([A-E])\b/i);
  const ansFromLetter = lm ? lm[1].charCodeAt(0) - 65 : -1;
  if (ansFromClass < 0 || ansFromLetter < 0) return null;
  if (ansFromClass !== ansFromLetter) {
    console.warn(`  ⚠ ${ctx.chapterId}: answer marks disagree (class=${"ABCDE"[ansFromClass]} vs letter=${"ABCDE"[ansFromLetter]}) — skipped: ${stem.slice(0, 70)}`);
    return null;
  }
  const ans = ansFromClass;
  if (ans >= clean.length) return null;

  const em = block.match(/<div class="explanation[^"]*">([\s\S]*?)<\/div>/i);
  let exp = em ? htmlToText(em[1]).trim() : "";
  if (exp.length > 600) exp = exp.slice(0, 597).trimEnd() + "…";
  if (!exp) exp = `Correct answer: ${"ABCDE"[ans]}.`;

  return { subjectIds: ctx.subjectIds, chapterId: ctx.chapterId, subtopic: ctx.subtopic, source: ctx.source, q: stem, opts: clean, ans, exp };
}

// ── Hand-verified overrides ──────────────────────────────────────────────────
// Applied after parsing, keyed by the dedup key of the question text.
// { drop: true } removes a question; { ans, exp } corrects one. Every entry
// must carry a `note` saying why (verification trail).
const OVERRIDES = {
  // ── nav-19: options are bare numbers referencing an unseen symbol plate ────
  whichofthefollowingisthesymbolforanexceptionallyhighover1000feetagllightedobstru:
    { drop: true, note: "options reference numbered symbols on a plate the quiz cannot show" },
  whatsymbolisusedtoshowavortaconamapchart:
    { drop: true, note: "options reference numbered symbols on a plate the quiz cannot show" },
  whichisthesymbolforavor:
    { drop: true, note: "options reference numbered symbols on a plate the quiz cannot show" },
  whatdoessymbol3represent:
    { drop: true, note: "references numbered symbol on a plate the quiz cannot show" },
  // ── nav-33: source-markup corruption (question tail leaked into option a) ──
  youareheading080twhenyougetarangeandbearingfixfromyourawron:
    { drop: true, note: "option (a) text corrupted in source — stem tail merged into it" },
  anaircraftatposition2700n17000wtravels3000kmonatrackof180tthen3000kmonatrackof09:
    { drop: true, note: "option (a) text corrupted in source — stem tail merged into it" },
  // ── nav-33: needs sunrise tables that are not part of the quiz ─────────────
  whatistheutctimeofsunriseinvancouverbritishcolumbiacanada49n12330wonthe6thdecemb:
    { drop: true, note: "requires almanac sunrise tables the quiz cannot supply" },
  // ── nav-33: marked answer fails independent computation ────────────────────
  anaircraftdepartsapoint0400n17000wandflies240nmsouthfollowedby240nmeastthen240nm:
    { drop: true, note: "marked answer 170°35.9′W contradicts computation (~170°00.6′W); explanation copied from the 600 NM variant" },
  onapolarstereographicmapastraightlineisdrawnfrompositiona70n102wtopositionb80n00:
    { drop: true, note: "as worded (track B→A at B) the answer is ≈310°T; marked 131° is the A→B arrival track — defective" },
  givenrunwaydirection083msurfacewv04535ktcalculatetheeffectiveheadwindcomponent:
    { drop: true, note: "35 × cos38° = 27.6 kt → option (b) 27, but source marks (a) 29 — unverifiable" },
  // ── nav-33: radial/position questions needing chart variation not given ────
  youareonthe205radialfromtheshannonvorsha5243n00853wandonthe317radialfromcorkvorc:
    { drop: true, note: "answer requires local variation from the chart, not given" },
  whatistheradialanddmedistancefromconnaughtvordmecon5355n00849wtooverheadabbeyshr:
    { drop: true, note: "answer requires local variation from the chart, not given" },
  whatistheaveragemagnetictrackanddistancebetweenkerryndbker5211n00932wandcarnmore:
    { drop: true, note: "answer requires local variation from the chart, not given" },
  whatistheradialanddmedistancefromcrkvor5151n00830wtoposition5220n00910w:
    { drop: true, note: "options 322 vs 330 differ only by variation, which is not given" },
  whatistheradialanddmedistancefromshavor5243n00853wtobirrairport5304n00755w:
    { drop: true, note: "computed distance 40.8 NM sits between options 40 and 42; marked 42 unverifiable without the chart" },
  whatisthelatandlongoftheshavor5243n00853w239m36nmradialrange:
    { drop: true, note: "answer requires local variation from the chart, not given" },
  // ── kept questions whose explanation text was garbled or wrong ─────────────
  aircraftstarts0410s17822wheadstruenorth2950nmthen90leftfor314kmrlfinalposition: {
    exp: "2950 NM north from 04°10′S: 2950/60 = 49°10′ change of latitude, so final latitude = 49°10′ − 4°10′ = 45°00′N. 90° left of a northerly heading = due west. 314 km = 169.5 NM. Ch.long = 169.5/cos 45° = 239.7 min ≈ 4°00′ west. Going 4° west of 178°22′W crosses the Date Line: final longitude = 177°38′E. Final position 4500N 17738E.",
    note: "source explanation tail was garbled",
  },
  at65nmfromavoryoucommenceadescentfromfl330inordertoarriveoverthevoratfl80yourmea: {
    exp: "65 NM at 240 kt ground speed takes 16.25 minutes. You must lose 25 000 ft in that time: 25 000 / 16.25 ≈ 1540 feet per minute.",
    note: "source explanation had an arithmetic typo (1338 instead of 1538)",
  },
  anaircraftisat10nandisflyingnorthat444kmhourafter3hoursthelatitudeis: {
    exp: "3 × 444 = 1332 km. Divide by 1.852 to get 719 NM ≈ 720 NM, which is 12° change of latitude. Flying north from 10°N: 10° + 12° = 22°N.",
    note: "source explanation quoted the southbound variant's answer (02°S)",
  },
  whatistheapproximatecoursetanddistancebetweenwaterfordndbwtd5212n00705wandsligon: {
    exp: "Change of latitude = 54°17′ − 52°12′ = 2°05′ = 125 NM north. Change of longitude = 1°31′ = 91 min; departure = 91 × cos 53° ≈ 55 NM west. Track = 360° − tan⁻¹(55/125) ≈ 336°(T); distance = √(125² + 55²) ≈ 137 NM.",
    note: "answerable by departure math — replaced 'solve by chart measurement' explanation",
  },
  anaircraftisonthe025radialfromshannonvorsha5243n00853wat49dmewhatisitsposition: {
    exp: "Radials are magnetic bearings FROM the station, so the 025 radial puts you north-east of the VOR. Only one option lies north-east of 5243N 00853W: 5329N 00830W (higher latitude, longitude further east). Check: 49 NM up the radial ≈ 46′ of latitude north and ≈ 22′ of longitude east.",
    note: "answerable by elimination — replaced 'solve by chart measurement' explanation",
  },
  whatistheshortestdistancebetweenpointa3543n00841eandpointb5417n17119w: {
    exp: "Note the longitudes: 008°41′E and 171°19′W add up to exactly 180° — A and B are on a meridian and its anti-meridian, so the shortest route runs over the pole. Distance = (90° − 35°43′) + (90° − 54°17′) = 54°17′ + 35°43′ = 90° = 5400 NM.",
    note: "over-the-pole trick — replaced 'solve by chart measurement' explanation",
  },
};

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
    const blocks = region.split(/<div class="(?:qa-block|qa-card)[^"]*"[^>]*>/).slice(1);
    let n = 0;
    for (const b of blocks) {
      const q = parseBlock(b, { ...cfg, chapterId, subtopic })
             ?? parseBlockV2(b, { ...cfg, chapterId, subtopic })
             ?? parseBlockV3(b, { ...cfg, chapterId, subtopic })
             ?? parseBlockV4(b, { ...cfg, chapterId, subtopic })
             ?? parseBlockV5(b, { ...cfg, chapterId, subtopic });
      if (!q) continue;
      const k = key(q.q);
      if (k.length < 8 || seen.has(k)) continue;
      const o = OVERRIDES[k];
      if (o?.drop) continue;
      if (o) { if (o.ans !== undefined) q.ans = o.ans; if (o.exp) q.exp = o.exp; }
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
