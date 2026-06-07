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
    const blocks = region.split(/<div class="qa-block">/).slice(1);
    let n = 0;
    for (const b of blocks) {
      const q = parseBlock(b, { ...cfg, chapterId, subtopic });
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
