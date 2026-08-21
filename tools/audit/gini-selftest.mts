/**
 * Self-test for Gini.
 *
 *   npx tsx tools/audit/gini-selftest.mts
 *
 * Exits non-zero on any failure, so it can gate a commit.
 *
 * It proves the things that matter more than any feature:
 *   1. How many questions he can explain — measured, not claimed.
 *   2. That he REFUSES when there is nothing verified to say.
 *   3. That nothing he would speak carries a third-party attribution (Rule 2).
 *   4. That the baked corpus counts have not drifted from the real bank.
 *   5. That he answers "hi" like a person rather than refusing it.
 *   6. That the marketing layer cannot manufacture urgency, threaten the free
 *      material, or hand-type a price.
 *   7. That every wisdom line asserting a FACT names where the fact is
 *      already confirmed in this repository.
 *   8. That the matcher answers what was asked — measured against a fixed
 *      probe table, so the confidence floors can be tuned on evidence.
 */

import {
  ask, askDeep, findChapter, describeSubject, answerFromFaq,
  readContext, greeting, smallTalk, WISDOM, partOfDay, suggestionsFor,
  PITCHES, choosePitch, offerFor, PITCH_RULES,
} from "../../lib/gini/knowledge";
import { explainQuestion, isSpeakable, speakableStats } from "../../lib/gini/deep";
import { FAKE_URGENCY, FREE_THREAT } from "../../lib/gini/marketing";
import { guardModelProse } from "../../lib/gini/guard";
import { isOffTopic, DECLINES } from "../../lib/gini/persona";
import { CORPUS } from "../../lib/gini/generated/corpus-stats";
import { ALL_QUESTIONS } from "../../lib/questions";
import { CPL_SUBJECTS } from "../../lib/subjects";

const line = (s = "") => console.log(s);
let failures = 0;
const check = (ok: boolean, label: string, detail = "") => {
  if (!ok) failures++;
  line(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
};

line("=".repeat(72));
line("GINI SELF TEST");
line("=".repeat(72));

/* ─────────────────────────────── 1. corpus ─────────────────────────────── */

const all = speakableStats();
line(`\nCorpus: ${all.total} questions`);
line(`  speakable : ${all.speakable} (${((100 * all.speakable) / all.total).toFixed(1)}%)`);
line(`  silent    : ${all.silent}`);

line("\nPer subject (top 8 by bank size):");
const rows = CPL_SUBJECTS.map(s => ({ id: s.id, name: s.shortName, ...speakableStats(s.id) }))
  .filter(r => r.total > 0)
  .sort((a, b) => b.total - a.total)
  .slice(0, 8);
for (const r of rows) {
  const pct = r.total ? ((100 * r.speakable) / r.total).toFixed(0) : "0";
  line(`  ${r.name.padEnd(22)} ${String(r.speakable).padStart(5)} / ${String(r.total).padStart(5)}  (${pct}%)`);
}

/* ──────────────────── 4. the baked counts must not lie ─────────────────── */

line("\n--- GENERATED CORPUS STATS vs THE LIVE BANK ---");
line("  (a baked count is a claim; regenerate with tools/gini/build-corpus-stats.mts)");
check(CORPUS.total === all.total, "total", `baked ${CORPUS.total}, live ${all.total}`);
check(CORPUS.speakable === all.speakable, "speakable", `baked ${CORPUS.speakable}, live ${all.speakable}`);
let subjectDrift = 0;
for (const s of CPL_SUBJECTS) {
  const live = speakableStats(s.id);
  if (live.total === 0) continue;
  const baked = CORPUS.bySubject[s.id];
  if (!baked || baked.total !== live.total || baked.speakable !== live.speakable) {
    subjectDrift++;
    line(`     drift: ${s.id} baked ${baked ? `${baked.total}/${baked.speakable}` : "MISSING"} live ${live.total}/${live.speakable}`);
  }
}
check(subjectDrift === 0, "per-subject counts", `${subjectDrift} drifted`);

/* ───────────────────────── 2. refusal behaviour ────────────────────────── */

line("\n--- REFUSAL BEHAVIOUR (the important half) ---");
const mustRefuse = [
  "what is the airspeed limit of a Boeing 747",
  "should I bribe the examiner",
  "",
];
for (const p of mustRefuse) {
  const r = ask(p);
  check(r.kind === "refusal", `refuses "${p}"`, r.kind === "answer" ? r.text.slice(0, 60) : "");
}
// Off-topic is now a WARM DECLINE rather than a bare refusal, so it comes back
// as an answer — but it must still never actually answer the question. That is
// the Captain's scope rule working, not the refusal rule breaking.
{
  const r = ask("who will win the cricket match");
  const declined = r.kind === "refusal" ||
    (r.kind === "answer" && DECLINES.includes(r.text));
  check(declined, 'declines "who will win the cricket match"',
    r.kind === "answer" && !DECLINES.includes(r.text) ? r.text.slice(0, 60) : "");
}

/* ───────────────────────── 5. manners, not refusals ────────────────────── */

line("\n--- MANNERS ---");
const home = readContext("/");
for (const hi of ["hi", "hello", "hey there", "good morning", "namaste", "thanks!", "who are you?", "what can you do"]) {
  const r = ask(hi, home);
  check(r.kind === "answer", `answers "${hi}"`, r.kind === "refusal" ? "refused" : "");
}
check(smallTalk("hi", readContext("/cpl/meteorology/met-1/notes"))?.kind === "answer", "greets inside a chapter");

line("\n--- GREETING ---");
check(greeting(readContext("/"), { visits: 1, hour: 9 })?.text.includes("Vanish") === true,
  "first-ever greeting offers the door");
check(greeting(readContext("/login"), { visits: 1, hour: 9 }) === null,
  "silent on signup/login (quiet zone)");
check(greeting(readContext("/exam/nav"), { visits: 3, hour: 9 }) === null,
  "silent during an exam");
check(partOfDay(2) === "late" && partOfDay(9) === "morning" && partOfDay(19) === "evening",
  "time of day");
// A student who lands on /signup and then walks into the site must still be
// greeted — the quiet zone must not spend the one greeting he gets per tab.
check(greeting(readContext("/cpl/meteorology"), { visits: 2, hour: 11 }) !== null,
  "a quiet-zone arrival does not consume the greeting");
const chapterGreet = greeting(readContext("/cpl/meteorology/met-1/notes"), { visits: 4, hour: 15 });
check(!!chapterGreet && /read it aloud|open/i.test(chapterGreet.text), "names the room on a chapter page");

/* ──────────────────── 8. the matcher answers what was asked ─────────────── */

line("\n--- MATCHER PRECISION (fixed probes) ---");
type Probe = { q: string; want: "faq" | "captain" | "structure" | "refusal"; ctx?: string };
const probes: Probe[] = [
  { q: "is there negative marking",                 want: "faq" },
  { q: "what is the pass mark",                     want: "faq" },
  { q: "how much does a CPL cost in India",         want: "faq" },
  { q: "is this site free",                         want: "faq" },
  { q: "who conducts the RTR exam",                 want: "faq" },
  { q: "how much are the live classes",             want: "captain" },
  { q: "I want to join a batch",                    want: "captain" },
  { q: "is there a whatsapp group",                 want: "captain" },
  { q: "do you have video lectures",                want: "captain" },
  { q: "how should I study for the exam",           want: "captain" },
  { q: "I failed my meteorology paper",             want: "captain" },
  { q: "how many questions are in meteorology",     want: "structure" },
  { q: "how many meteorology questions do you have", want: "structure" },
  { q: "where is the 1 in 60 rule",                 want: "structure" },
];
for (const p of probes) {
  const r = ask(p.q, p.ctx ? readContext(p.ctx) : home);
  const got = r.kind === "refusal" ? "refusal" : r.source.type;
  check(got === p.want, `"${p.q}"`, `wanted ${p.want}, got ${got}`);
}

// Context must steer the answer, not just decorate it.
const metOffer = offerFor("how much are classes", readContext("/cpl/meteorology/met-1/notes"));
check(!!metOffer && metOffer.kind === "answer" && /Meteorology/i.test(metOffer.text),
  "classes question on a Met page names the Met batch");

/* ─────────────────────── 6. marketing honesty guards ───────────────────── */

line("\n--- MARKETING HONESTY ---");
const everyPitchText = PITCHES.map(p => p.say(readContext("/cpl/meteorology/met-1/notes"))).join(" \n ")
  + PITCHES.map(p => p.say(home)).join(" \n ");
check(!FAKE_URGENCY.test(everyPitchText), "no manufactured urgency or scarcity");
check(!FREE_THREAT.test(everyPitchText), "never suggests the free material will end");
check(PITCHES.every(p => !!p.href(home)), "every pitch has somewhere to go");
check(new Set(PITCHES.map(p => p.id)).size === PITCHES.length, "pitch ids are unique");
// Prices must be imported, never typed. Any rupee figure in a pitch has to be
// one of the four that lib/live-classes.ts exports.
// \d at the end, so a sentence comma right after the figure is not eaten:
// "ten a batch, ₹7,999, and he teaches it" was matching "₹7,999,".
const priced = everyPitchText.match(/₹\s?\d[\d,]*\d|₹\s?\d/g) ?? [];
const allowed = new Set(["₹12,999", "₹7,999", "₹23,999", "₹14,999"]);
check(priced.every(p => allowed.has(p)), "every price comes from lib/live-classes.ts", priced.join(" "));

line("\n--- PITCH DISCIPLINE ---");
const t0 = 1_000_000;
const fresh = { shown: [] as string[], lastAt: 0, startedAt: t0 };
check(choosePitch(home, fresh, t0 + 10_000, 0.1) === null, "nothing during the warm-up");
check(choosePitch(home, fresh, t0 + PITCH_RULES.WARMUP_MS + 1, 0.1) !== null, "offers something after it");
check(choosePitch(readContext("/rtr-simulator"), fresh, t0 + 10 * 60_000, 0.1) === null, "silent in the simulator");
check(choosePitch(readContext("/live-classes"), fresh, t0 + 10 * 60_000, 0.1) === null, "silent on the pricing page");
check(
  choosePitch(home, { shown: ["a", "b", "c"], lastAt: 0, startedAt: t0 }, t0 + 10 * 60_000, 0.1) === null,
  `capped at ${PITCH_RULES.MAX_PER_SESSION} per session`,
);
check(
  choosePitch(home, { shown: [], lastAt: t0 + 9 * 60_000, startedAt: t0 }, t0 + 10 * 60_000, 0.1) === null,
  "respects the gap between offers",
);
// It must never repeat itself, and must eventually run dry rather than loop.
let st = { shown: [] as string[], lastAt: 0, startedAt: t0 };
const picked: string[] = [];
for (let i = 0; i < PITCH_RULES.MAX_PER_SESSION; i++) {
  const now = t0 + PITCH_RULES.WARMUP_MS + (i + 1) * (PITCH_RULES.GAP_MS + 1000);
  const p = choosePitch(home, st, now, (i * 0.37) % 1);
  if (!p) break;
  picked.push(p.id);
  st = { shown: [...st.shown, p.id], lastAt: now, startedAt: t0 };
}
check(new Set(picked).size === picked.length, "never repeats an offer", picked.join(", "));

/* ──────────────────────── 7. wisdom must be sourced ────────────────────── */

line("\n--- SCOPE: DGCA, aviation, this site, the classes. Nothing else. ---");
// The Captain's rule, 2026-08-21. The interesting cases are the near-misses:
// an off-topic word inside an aviation question must NOT throw the question away.
const SCOPE_CASES: { q: string; off: boolean }[] = [
  { q: "who will win the cricket match", off: true },
  { q: "write me a python function", off: true },
  { q: "what do you think of the election", off: true },
  { q: "suggest a movie for tonight", off: true },
  // ...and these are ours, despite sharing words with the list above:
  { q: "how does weather affect takeoff performance", off: false },
  { q: "what is in the meteorology syllabus", off: false },
  { q: "how much are the classes", off: false },
  { q: "where is the chapter on jet streams", off: false },
];
for (const c of SCOPE_CASES) {
  const got = isOffTopic(c.q);
  check(got === c.off, `${c.off ? "declines" : "keeps"} "${c.q}"`, got === c.off ? "" : `got off=${got}`);
}
check(DECLINES.length >= 2, "more than one way to say no");
check(DECLINES.every(d => /ask|what|dgca|aviation|exam|class|chapter|prepar/i.test(d)),
  "every decline offers the door back rather than stonewalling");

line("\n--- OUTPUT GUARDS (what a model is allowed to say) ---");
// Each case was either caught in production or is the exact thing the guard
// exists to stop. A guard with no test is a comment.
const GUARD_CASES: { text: string; ok: boolean; label: string }[] = [
  { text: "Ask me about the chapter and I will read what is written.", ok: true, label: "ordinary sentence" },
  { text: "Tell me if you need help finding anything.আন্তরিত", ok: false, label: "stray Bengali script (seen live 2026-08-21)" },
  { text: "The notes are based on the Oxford ATPL manual.", ok: false, label: "names a source" },
  { text: "Only 2 seats left, book now before it fills!", ok: false, label: "manufactured urgency" },
  { text: "It is free for a limited time, so join today.", ok: false, label: "threatens the free material" },
  { text: "The batch costs ₹8,000 per subject.", ok: false, label: "a price we do not charge" },
  { text: "Capt. Pahil teaches live batches at ₹7,999 a subject.", ok: true, label: "a real price" },
  { text: "We guarantee you will pass the DGCA exam.", ok: false, label: "promises an outcome" },
];
for (const g of GUARD_CASES) {
  const v = guardModelProse(g.text);
  check(v.ok === g.ok, g.label, v.ok ? "allowed" : `blocked: ${(v as { ok: false; why: string }).why}`);
}

line("\n--- WISDOM PROVENANCE ---");
const unsourced = WISDOM.filter(w => w.kind === "fact" && (!w.source || w.source === "method"));
check(unsourced.length === 0, "every factual line names its source", unsourced.map(w => w.id).join(", "));
check(new Set(WISDOM.map(w => w.id)).size === WISDOM.length, "wisdom ids are unique");

/* ─────────────────────── 3. Iron Rule 2 + placeholders ─────────────────── */

line("\n--- IRON RULE 2 SWEEP over everything Gini could speak ---");
const BANNED = /\b(oxford|cae|nordian|redbird|jeppesen|ic\s*joshi|rk\s*bali)\b/i;
let leaks = 0;
for (const q of ALL_QUESTIONS) {
  if (!isSpeakable(q)) continue;
  const r = explainQuestion(q);
  if (r.kind === "answer" && BANNED.test(r.text)) {
    if (leaks < 3) line(`     LEAK: ${r.text.slice(0, 90)}`);
    leaks++;
  }
}
check(leaks === 0, "no attribution leaks in the bank", `${leaks} found`);

// The persona and marketing layers are hand-written, so sweep them too.
const spokenPersona = [
  ...WISDOM.map(w => w.text),
  ...PITCHES.map(p => p.say(home)),
  greeting(home, { visits: 1, hour: 9 })?.text ?? "",
  greeting(home, { visits: 9, hour: 21 })?.text ?? "",
].join(" ");
check(!BANNED.test(spokenPersona), "no attribution leaks in the hand-written lines");

line("\n--- PLACEHOLDER SWEEP: would he ever read a stub aloud? ---");
let stubs = 0;
for (const q of ALL_QUESTIONS) {
  const r = explainQuestion(q);
  if (r.kind === "answer" && /^\s*correct answer\s*[:\-]?\s*[A-D]?\s*\.?\s*$/i.test((q.exp ?? "").trim())) stubs++;
}
check(stubs === 0, "no placeholder ever spoken", `${stubs} found`);

/* ───────────────────────── the deep layer, end to end ──────────────────── */

line("\n--- DEEP LAYER (question-bank search) ---");
const deepProbes = [
  "what is QNH", "what is the transition altitude", "what does an altimeter measure",
  "what is a jet stream", "explain the semi circular rule", "what is drift",
  "how does a VOR work", "what is the speed of sound",
];
for (const p of deepProbes) {
  const r = await askDeep(p, home);
  line(`  ${r.kind === "answer" ? "ANSWER" : "REFUSE"}  "${p}" -> ${r.text.slice(0, 90)}…`);
}

/* ──────────────────────────────── structure ────────────────────────────── */

line("\n--- STRUCTURE ---");
const d = describeSubject("meteorology");
line(`  describeSubject(meteorology): ${d.text}`);
const f = findChapter("where is the 1 in 60 rule");
line(`  findChapter(1 in 60): ${f.kind === "answer" ? `${f.text} -> ${f.href}` : f.text}`);
line(`  suggestions on a Met chapter: ${suggestionsFor(readContext("/cpl/meteorology/met-1/notes")).join(" | ")}`);
line(`  FAQ direct: ${answerFromFaq("pass mark").text.slice(0, 70)}…`);

line("\n" + "=".repeat(72));
line(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
line("=".repeat(72));
process.exit(failures === 0 ? 0 : 1);
