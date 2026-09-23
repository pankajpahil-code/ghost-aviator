#!/usr/bin/env node
/**
 * AI visibility check: ask an AI search engine the questions Indian student pilots actually ask, and
 * record whether ghostaviator.com is among the sources it cites. Run weekly; compare runs over time.
 *
 *   node tools/seo/ai-visibility.mjs            # all questions
 *   node tools/seo/ai-visibility.mjs --limit 3  # smoke test
 *
 * Engine: Gemini with Google Search grounding. Request shape verified against
 * https://ai.google.dev/gemini-api/docs/google-search (2026-09-24): POST /v1beta/interactions with
 * "tools": [{"type": "google_search"}], key in x-goog-api-key; citations come back as url_citation
 * annotations. Every "url" in the response is collected, so a change in nesting degrades gracefully.
 *
 * The key is read from the environment or .env.local and is NEVER printed. A 429 (free-tier quota)
 * stops the run and is reported as such - it is not a result.
 *
 * Output: tools/seo/ai-visibility/<date>.json and a one-line summary. Measures what ONE engine cites
 * on ONE day; it is a trend line, not a verdict on "AI search" as a whole.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MODEL = process.env.GEMINI_SEARCH_MODEL || "gemini-3.8-flash";
const limitArg = process.argv.indexOf("--limit");
const LIMIT = limitArg > 0 ? Number(process.argv[limitArg + 1]) : Infinity;

export const QUESTIONS = [
  "free DGCA CPL meteorology notes",
  "free DGCA air regulations notes pdf",
  "DGCA CPL exam pattern and syllabus",
  "is there negative marking in DGCA exams",
  "DGCA CPL pass mark",
  "how to become a pilot in India step by step",
  "how much does a commercial pilot licence cost in India 2026",
  "how to apply for DGCA computer number",
  "who conducts the RTR(A) exam in India now",
  "RTR(A) exam practice simulator free",
  "CPL licence validity India years",
  "DGCA navigation paper includes radio navigation and instruments",
  "free DGCA question bank online",
  "DGCA CPL mock test free",
  "DGCA meteorology practice questions with answers",
  "ADAPT test practice free for airline cadet selection",
  "best website for DGCA ground school preparation",
  "DGCA air regulations previous year questions",
  "live online DGCA ground classes meteorology",
  "Class 2 medical DGCA first step pilot",
  "can a commerce student become a pilot in India NIOS",
  "pilot training loan India flying school",
  "what is the 1 in 60 rule navigation",
  "what is QNH and QFE",
  "warm front characteristics DGCA",
  "DGCA instrumentation notes free",
  "radio navigation VOR DGCA notes",
  "DGCA flight time definition block time",
  "cabin crew requirement rule 38B aircraft rules",
  "Capt. Pankaj Pahil Ghost Aviator",
];

function key() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  const env = join(ROOT, ".env.local");
  if (!existsSync(env)) return "";
  const m = readFileSync(env, "utf8").match(/^GEMINI_API_KEY\s*=\s*"?([^"\r\n]+)"?/m);
  return m ? m[1].trim() : "";
}

function urls(node, out = new Set()) {
  if (Array.isArray(node)) node.forEach((x) => urls(x, out));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if ((k === "url" || k === "uri") && typeof v === "string") out.add(v);
      else urls(v, out);
    }
  }
  return out;
}

async function main() {
  const k = key();
  if (!k) { console.error("No GEMINI_API_KEY in the environment or .env.local."); return 2; }
  const rows = [];
  for (const q of QUESTIONS.slice(0, LIMIT)) {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "x-goog-api-key": k, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, input: q, tools: [{ type: "google_search" }] }),
    });
    if (res.status === 429) { rows.push({ q, error: "quota (429) - run stopped" }); break; }
    if (!res.ok) { rows.push({ q, error: `HTTP ${res.status}` }); continue; }
    const body = await res.json();
    const cited = [...urls(body)];
    // Grounding links can be redirect wrappers; the title/host usually still carries the domain.
    const text = JSON.stringify(body);
    const ours = cited.filter((u) => /ghostaviator\.com/i.test(u));
    rows.push({ q, sources: cited.length, cited_us: ours.length > 0 || /ghostaviator\.com/i.test(text), our_urls: ours,
      named_us: /ghost aviator/i.test(text) });
    await new Promise((r) => setTimeout(r, 4000));
  }
  const date = new Date().toISOString().slice(0, 10);
  const dir = join(ROOT, "tools", "seo", "ai-visibility");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${date}.json`), JSON.stringify({ date, model: MODEL, rows }, null, 1));
  const ok = rows.filter((r) => !r.error);
  const hits = ok.filter((r) => r.cited_us);
  console.log(`${date} ${MODEL}: cited on ${hits.length}/${ok.length} questions` + (rows.length > ok.length ? ` (${rows.length - ok.length} errors)` : ""));
  hits.forEach((r) => console.log("  cited: " + r.q));
  rows.filter((r) => r.error).forEach((r) => console.log(`  ${r.error}: ${r.q}`));
  return 0;
}
process.exitCode = await main();
