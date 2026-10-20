// Source-fidelity check: instrumentation notes pages vs the source question bank.
//
//   npx tsx tools/audit/source-fidelity-inst.mts
//
// The notes pages (public/content/instrumentation/inst-N/notes.html) present the
// source chapter's questions with the answers shown inline. The quiz bank
// (lib/generated/oxford-instrumentation.ts, served through ALL_QUESTIONS with
// the declared corrections layer applied) is what students are graded on. This
// tool parses both sides and compares the keyed ANSWER TEXT.
//
// Answer TEXT, not letter, is the truth: option order may differ between the
// printed notes and the bank, so letters alone can disagree while the answer is
// identical. Some pages paraphrase the stem, so a conservative token-similarity
// fallback pairs paraphrases and marks them PARAPHRASE-PAIR for review; it never
// silently treats an unpaired question as matched.
//
// Markup variants handled (all found in the content tree):
//   * <span class="q-text">stem</span>            (most chapters)
//   * stem text directly after the q-number span   (inst-22/23)
//   * Correct Answer: <strong>(b)</strong> text    (answer text after strong)
//   * Correct Answer: <strong>(b) text</strong>    (answer text inside strong)
//   * Correct Answer: <strong>D</strong>           (bare letter, no parens)
//
// Pages without qa-block markup (inst-20/21 have no questions; inst-31 is a
// paper-based section) are listed as NOT-CHECKED rather than silently skipped.
import fs from "node:fs";
import path from "node:path";
import { ALL_QUESTIONS } from "../../lib/questions";

const SUBJECT = "instrumentation";
const ROOT = path.resolve("public/content", SUBJECT);

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&mdash;/g, "\u2014").replace(/&ndash;/g, "\u2013").replace(/&minus;/g, "\u2212")
    .replace(/&micro;/g, "\u00b5").replace(/&times;/g, "\u00d7").replace(/&deg;/g, "\u00b0")
    .replace(/&frac12;/g, "\u00bd").replace(/&frac14;/g, "\u00bc").replace(/&plusmn;/g, "\u00b1")
    .replace(/&rarr;/g, "\u2192").replace(/&asymp;/g, "\u2248").replace(/&le;/g, "\u2264").replace(/&ge;/g, "\u2265")
    .replace(/&rsquo;|&lsquo;/g, "'").replace(/&rdquo;|&ldquo;/g, '"');
}
const clean = (s: string) =>
  decodeEntities(s)
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const norm = (s: string) => clean(s.replace(/<[^>]+>/g, " "));      // tags -> space
const normTight = (s: string) => clean(s.replace(/<[^>]+>/g, ""));   // tags -> nothing (subscripts)

const tokens = (s: string) => {
  const NUM: Record<string, string> = { zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10", eleven: "11", twelve: "12" };
  return new Set(
    norm(s).split(" ")
      .filter((t) => t.length >= 1)
      .filter((t) => !/^(i|ii|iii|iv|v|vi)$/.test(t))
      .map((t) => NUM[t] ?? t)
  );
};
const squash = (s: string) => normTight(s).replace(/ /g, "");
function similarity(a: string, b: string): { jaccard: number; shared: number } {
  const A = tokens(a), B = tokens(b);
  let shared = 0;
  for (const t of A) if (B.has(t)) shared++;
  const union = A.size + B.size - shared;
  return { jaccard: union ? shared / union : 0, shared };
}

type PageQ = { n: string; stem: string; opts: string[]; letter: string; keyText: string };

function parsePage(html: string): PageQ[] {
  const out: PageQ[] = [];
  const parts = html.split(/<div class="qa-block"/).slice(1);
  for (const part of parts) {
    let stem = "";
    const qm = part.match(/<span class="q-text">([\s\S]*?)<\/span>/);
    if (qm) stem = qm[1];
    else {
      const m2 = part.match(/<span class="q-number">[\s\S]*?<\/span>([\s\S]*?)<ol class="q-options"/);
      if (m2) stem = m2[1];
    }
    const om = part.match(/<ol class="q-options"[^>]*>([\s\S]*?)<\/ol>/);
    const am = part.match(/Correct Answer:\s*(?:[^<]*)?<strong>\s*\(?([a-dA-D])\)?\s*([\s\S]*?)<\/strong>([\s\S]*?)<\/div>/);
    if (!stem || !om || !am) continue;
    const opts = [...om[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
    const letter = am[1].toLowerCase();
    const idx = letter.charCodeAt(0) - 97;
    const inside = am[2].trim();
    const after = am[3].trim();
    let keyText = inside || after || opts[idx] || "";
    // Annotations after the letter ("(reference key: b)") are not the answer
    // text; when they do not resemble the keyed option, use the option itself.
    if (opts[idx] && similarity(keyText, opts[idx]).jaccard < 0.5) keyText = opts[idx];
    out.push({
      n: (part.match(/<span class="q-number">\s*Q(\d+)\.?/) || [, "?"])[1] as string,
      stem, opts, letter, keyText,
    });
  }
  return out;
}

type Finding = { chapter: string; kind: string; detail: string };
const findings: Finding[] = [];
const summary: string[] = [];
const keyEq = (a: string, b: string) =>
  norm(a) === norm(b) || normTight(a) === normTight(b) || squash(a) === squash(b);

const dirs = fs.readdirSync(ROOT).filter((d) => /^inst-\d+$/.test(d)).sort((a, b) => +a.slice(5) - +b.slice(5));
let totalBlocks = 0, totalParsed = 0, totalMatched = 0, totalKeyEqual = 0, totalReordered = 0, totalPara = 0, totalBank = 0;

for (const ch of dirs) {
  const file = path.join(ROOT, ch, "notes.html");
  if (!fs.existsSync(file)) { summary.push(`${ch}: NO notes.html`); continue; }
  const html = fs.readFileSync(file, "utf8");
  const pageQs = parsePage(html);
  const bank = ALL_QUESTIONS.filter((q) => q.subjectIds.includes(SUBJECT) && q.chapterId === ch);
  totalBank += bank.length;
  const blocks = (html.match(/<div class="qa-block"/g) || []).length;
  totalBlocks += blocks;
  if (pageQs.length === 0) {
    summary.push(`${ch}: NOT-CHECKED (qa-blocks=${blocks}, parsed=0)`);
    continue;
  }
  totalParsed += pageQs.length;
  const byStem = new Map<string, typeof bank>();
  const byTight = new Map<string, typeof bank>();
  for (const q of bank) {
    byStem.set(norm(q.q), [...(byStem.get(norm(q.q)) ?? []), q]);
    byTight.set(normTight(q.q), [...(byTight.get(normTight(q.q)) ?? []), q]);
  }
  let matched = 0, equal = 0, reordered = 0, para = 0;
  for (const pq of pageQs) {
    let cands = byStem.get(norm(pq.stem)) ?? byTight.get(normTight(pq.stem));
    let kind = "exact";
    if (!cands) {
      for (const [k, v] of byStem) {
        if (k.length > 20 && norm(pq.stem).length > 20 && (k.includes(norm(pq.stem)) || norm(pq.stem).includes(k))) { cands = v; kind = "contains"; break; }
      }
    }
    if (!cands) {
      // conservative paraphrase pairing: best Jaccard over the chapter bank
      let best: { q: (typeof bank)[number]; j: number; shared: number } | null = null;
      for (const q of bank) {
        const s = similarity(pq.stem, q.q);
        if (!best || s.jaccard > best.j) best = { q, j: s.jaccard, shared: s.shared };
      }
      if (best && best.j >= 0.6 && best.shared >= 5) { cands = [best.q]; kind = "paraphrase"; }
    }
    if (!cands || cands.length === 0) {
      // cross-chapter fallback (page-only question that also lives elsewhere)
      let cross: (typeof bank)[number] | null = null;
      for (const q of ALL_QUESTIONS) {
        if (!q.subjectIds.includes(SUBJECT)) continue;
        if (q.chapterId === ch) continue;
        if (norm(q.q) === norm(pq.stem) || normTight(q.q) === normTight(pq.stem)) { cross = q; break; }
      }
      findings.push({
        chapter: ch, kind: cross ? "CROSS-CHAPTER" : "NO-BANK-MATCH",
        detail: cross
          ? `Q${pq.n} matches ${cross.chapterId} ("${norm(cross.q).slice(0, 80)}") page key "${norm(pq.keyText).slice(0, 60)}" bank "${norm(cross.opts[cross.ans]).slice(0, 60)}"`
          : `Q${pq.n}: ${norm(pq.stem).slice(0, 110)}`,
      });
      continue;
    }
    matched++;
    if (kind === "paraphrase") para++;
    const setSim = (q: (typeof bank)[number]) =>
      pq.opts.reduce((s, po) => s + Math.max(...q.opts.map((bo) => similarity(po, bo).jaccard)), 0);
    const cand = cands.reduce((a, b) => (setSim(b) > setSim(a) ? b : a));
    // Compare the option the page keys with the option the bank keys.
    // 1. equal text (or >=0.90 token overlap)                 -> agrees
    // 2. page key equals a DIFFERENT bank option exactly      -> real divergence
    // 3. bank key text contained in page text / >=0.60 overlap -> agrees (expanded wording)
    // 4. otherwise map to the best bank option (>=0.60)       -> agrees iff it is the keyed option
    const bankKeyText = cand.opts[cand.ans];
    const ksim = similarity(pq.keyText, bankKeyText).jaccard;
    const keyExact = keyEq(pq.keyText, bankKeyText) || ksim >= 0.9;
    const matchesOther = cand.opts.some((bo, bi) => bi !== cand.ans && keyEq(pq.keyText, bo));
    const contained =
      normTight(pq.keyText).includes(normTight(bankKeyText)) || normTight(bankKeyText).includes(normTight(pq.keyText));
    let agrees = false, bestKey = -1, bestSim = -1;
    if (keyExact) agrees = true;
    else if (!matchesOther && (contained || ksim >= 0.6)) agrees = true;
    else {
      cand.opts.forEach((bo, bi) => {
        const s = similarity(pq.keyText, bo);
        if (s.jaccard > bestSim) { bestSim = s.jaccard; bestKey = bi; }
      });
      agrees = bestSim >= 0.6 && bestKey === cand.ans;
    }
    if (agrees) {
      equal++;
      const bankLetter = String.fromCharCode(97 + cand.ans);
      if (bankLetter !== pq.letter) reordered++;
    } else if (bestSim >= 0 && bestSim < 0.6 && !matchesOther) {
      findings.push({
        chapter: ch, kind: "UNMAPPED-KEY",
        detail: `Q${pq.n}: page (${pq.letter}) "${norm(pq.keyText).slice(0, 90)}" has no close bank option (best ${bestSim.toFixed(2)}); bank (${String.fromCharCode(97 + cand.ans)}) "${norm(bankKeyText).slice(0, 90)}"`,
      });
    } else {
      findings.push({
        chapter: ch, kind: kind === "paraphrase" ? "PARAPHRASE-ANSWER-DIVERGENCE" : "ANSWER-DIVERGENCE",
        detail: `Q${pq.n}: page (${pq.letter}) "${norm(pq.keyText).slice(0, 90)}" maps to bank option (${bestKey >= 0 ? String.fromCharCode(97 + bestKey) : "?"}) "${bestKey >= 0 ? norm(cand.opts[bestKey]).slice(0, 90) : ""}" but bank keys (${String.fromCharCode(97 + cand.ans)}) "${norm(bankKeyText).slice(0, 90)}"` +
          (kind === "paraphrase" ? ` [stem paired: "${norm(pq.stem).slice(0, 60)}" ~ "${norm(cand.q).slice(0, 60)}"]` : ""),
      });
    }
  }
  totalMatched += matched; totalKeyEqual += equal; totalReordered += reordered; totalPara += para;
  const extra = pageQs.length - matched;
  summary.push(
    `${ch}: blocks=${blocks} parsed=${pageQs.length} bank=${bank.length} matched=${matched} key-equal=${equal}` +
    (para ? ` paraphrase-paired=${para}` : "") + (reordered ? ` reordered-letter=${reordered}` : "") + (extra ? ` unmatched=${extra}` : "")
  );
}

console.log("SOURCE FIDELITY — instrumentation notes pages vs effective quiz bank");
console.log("(bank = ALL_QUESTIONS with declared corrections applied; answer TEXT is the truth)\n");
for (const s of summary) console.log("  " + s);
console.log(
  `\nTOTAL: blocks=${totalBlocks} parsed=${totalParsed} matched=${totalMatched}/${totalParsed} ` +
  `key-equal=${totalKeyEqual}/${totalMatched} paraphrase-paired=${totalPara} reordered-letter=${totalReordered} bank-questions=${totalBank}`
);
const pageOnly = findings.filter((f) => f.kind === "NO-BANK-MATCH" || f.kind === "CROSS-CHAPTER");
const divergences = findings.filter((f) => !pageOnly.includes(f));
if (pageOnly.length) {
  console.log(`\nPAGE-ONLY / NOT-IN-CHAPTER-BANK (${pageOnly.length}) — no bank counterpart to verify; source-book check required:`);
  for (const f of pageOnly) console.log(`  [${f.kind}] ${f.chapter} ${f.detail}`);
}
if (divergences.length) {
  console.log(`\nDIVERGENCES (${divergences.length}):`);
  for (const f of divergences) console.log(`  [${f.kind}] ${f.chapter} ${f.detail}`);
  process.exitCode = 1;
} else {
  console.log("\nVERDICT: every bank-matched inline answer agrees with the effective source bank.");
}
