/**
 * Generates lib/generated/lastmod.ts — the real last-modified date of every URL
 * the sitemap submits, keyed by route path.
 *
 * WHY THIS EXISTS
 *
 * app/sitemap.ts opened with `const now = new Date()` and stamped it onto every
 * entry. Measured against the live sitemap on 2026-08-23: 603 of 609 URLs
 * carried the same timestamp, the moment of the build. So every deploy told
 * Google that six hundred pages had just changed, and almost none of them had.
 *
 * That is the same defect this codebase already fixed once for `datePublished`,
 * where six guide dates were fabricated and two announced May 2024 for files
 * created in July 2026. The rule written down then was "ground truth is
 * `git log`, never filesystem mtime, because a fresh Vercel checkout makes
 * every page look modified today". The sitemap was doing precisely that with a
 * different clock.
 *
 * It is not a cosmetic problem. Google's documented behaviour is to use lastmod
 * only while it stays verifiably accurate and to ignore it once it does not —
 * so a sitemap that cries wolf on 603 URLs per deploy loses the one signal that
 * could tell Google which pages are genuinely new. On a domain where 633 URLs
 * sit in "Discovered - currently not indexed", that signal is worth having.
 *
 * WHY IT IS GENERATED AND COMMITTED RATHER THAN COMPUTED AT BUILD TIME
 *
 * Vercel builds from a shallow clone, so `git log` there cannot see the commit
 * that last touched a file and would silently return nothing — which would put
 * us back to guessing. Same pattern as lib/generated/video-metadata.ts and
 * lib/gini/generated/corpus-stats.ts: a tool run here, output committed.
 *
 * A path this tool cannot date is simply absent from the map, and the sitemap
 * then omits lastmod for that URL. An absent lastmod is honest; a wrong one is
 * the thing being fixed.
 *
 *   npx tsx tools/build-lastmod.mts
 *
 * Re-run it after publishing notes, adding questions, or editing a page — and
 * in any case before a release, since a stale entry is a quietly wrong date.
 */

import fs from "node:fs";
import path from "node:path";
import cp from "node:child_process";
import { pathToFileURL } from "node:url";

import { CPL_SUBJECTS, ATPL_SUBJECTS, type Subject } from "../lib/subjects";
import { isIndexableChapterRoute } from "../lib/indexability";
import { ALL_PAST_PAPERS } from "../lib/past-papers";
import { QB_LANDINGS } from "../lib/landing-pages";
import { pqRoutes } from "../lib/previous-questions";

const ROOT = process.cwd();

// ─── One pass over history, not one git call per file ────────────────────────
//
// 300+ `git log -1 -- <file>` invocations is minutes on Windows. Walk the whole
// log once instead, newest first, and keep the FIRST date seen for each path —
// which is by definition the most recent commit that touched it.

function lastCommitDates(): Map<string, string> {
  const out = cp.execSync(
    'git log --no-merges --date-order --format="%x01%cI" --name-only',
    { cwd: ROOT, maxBuffer: 512 * 1024 * 1024 },
  ).toString();

  const dates = new Map<string, string>();
  let current: string | null = null;
  for (const line of out.split("\n")) {
    const l = line.replace(/\r$/, "");
    if (l.startsWith("\x01")) { current = l.slice(1).trim(); continue; }
    if (!l || !current) continue;
    if (!dates.has(l)) dates.set(l, current);      // newest wins — we see it first
  }
  return dates;
}

const HISTORY = lastCommitDates();

/** Most recent commit date across the given repo-relative paths, or null. */
function newestOf(...paths: (string | null | undefined)[]): string | null {
  let best: string | null = null;
  for (const p of paths) {
    if (!p) continue;
    const d = HISTORY.get(p.split(path.sep).join("/"));
    if (d && (!best || d > best)) best = d;
  }
  return best;
}

const exists = (p: string) => fs.existsSync(path.join(ROOT, p));

/** The later of two ISO dates (either may carry Z or an offset), or null. */
function later(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(b) > Date.parse(a) ? b : a;
}

// ─── Line-level dates for files that hold many pages' data ───────────────────
//
// Ticket #8 (2026-10-25): every /video route was dated by the newest commit to
// lib/chapter-videos.ts, and every subject hub by the newest commit to
// lib/subjects.ts — so adding one lecture re-dated ~150 video pages and editing
// one chapter blurb re-dated every hub. `git blame` gives each line the commit
// that last changed it, so a page can be dated by the lines that describe it.

function blameDates(rel: string): string[] {
  if (!exists(rel)) return [];
  const out = cp.execSync(`git blame --line-porcelain -- "${rel}"`,
    { cwd: ROOT, maxBuffer: 256 * 1024 * 1024 }).toString();
  const lines: string[] = [];
  let time = 0;
  for (const raw of out.split("\n")) {
    const l = raw.replace(/\r$/, "");
    if (l.startsWith("committer-time ")) time = Number(l.slice(15));
    else if (l.startsWith("\t")) lines.push(new Date(time * 1000).toISOString());
  }
  return lines;
}

function newestInRange(dates: string[], from: number, to: number): string | null {
  let best: string | null = null;
  for (let i = from; i <= to && i < dates.length; i++) best = later(best, dates[i]);
  return best;
}

/** "<subject>/<chapter>" -> newest blame date of that key's entry in chapter-videos.ts. */
function videoBlockDates(): Map<string, string> {
  const rel = "lib/chapter-videos.ts";
  const text = fs.readFileSync(path.join(ROOT, rel), "utf8").split(/\r?\n/);
  const dates = blameDates(rel);
  const out = new Map<string, string>();
  for (let i = 0; i < text.length; i++) {
    const m = text[i].match(/^\s*"([a-z0-9-]+\/[a-z0-9-]+)":\s*\[/);
    if (!m) continue;
    let end = i;
    // A one-line entry closes on its own line; otherwise run to the closing "],".
    if (!/\]\s*,?\s*(\/\/.*)?$/.test(text[i])) {
      while (end + 1 < text.length && !/^\s*\]\s*,?\s*(\/\/.*)?$/.test(text[end])) end++;
      end++;
    }
    const d = newestInRange(dates, i, end);
    if (d) out.set(m[1], d);
  }
  return out;
}

/** Subject id -> newest blame date of its block in lib/subjects.ts. */
function subjectBlockDates(): Map<string, string> {
  const rel = "lib/subjects.ts";
  const text = fs.readFileSync(path.join(ROOT, rel), "utf8").split(/\r?\n/);
  const dates = blameDates(rel);
  const starts: { id: string; line: number }[] = [];
  text.forEach((l, i) => { const m = l.match(/^    id: "([a-z0-9-]+)"/); if (m) starts.push({ id: m[1], line: i }); });
  const out = new Map<string, string>();
  starts.forEach((st, k) => {
    const end = k + 1 < starts.length ? starts[k + 1].line - 1 : text.length - 1;
    const d = newestInRange(dates, Math.max(0, st.line - 2), end);
    if (d) out.set(st.id, d);
  });
  return out;
}

// ─── Which source file actually decides each kind of page ────────────────────

/**
 * The question banks that feed a chapter.
 *
 * A chapter's questions can come from several of the twenty bank modules, so
 * the honest date is the newest among the ones that actually contain a question
 * tagged with this chapter. Attribution is done by reading each module rather
 * than by keeping a hand-written table beside it, because a hand-written table
 * is the drift Iron Rule 5 exists to stop.
 */
async function questionBankIndex(): Promise<Map<string, string[]>> {
  const dir = path.join(ROOT, "lib");
  const candidates: string[] = [];
  const scan = (rel: string) => {
    for (const name of fs.readdirSync(path.join(dir, rel))) {
      const r = rel ? `${rel}/${name}` : name;
      const full = path.join(dir, r);
      if (fs.statSync(full).isDirectory()) { if (r === "generated") scan(r); continue; }
      if (/questions|met-verified|regs-notes|ecqb|icjoshi|oxford|techbook/i.test(name) && name.endsWith(".ts")) {
        candidates.push(`lib/${r}`);
      }
    }
  };
  scan("");

  // chapterKey -> the bank files that contain at least one of its questions
  const byChapter = new Map<string, string[]>();
  const failedImports: string[] = [];
  for (const rel of candidates) {
    let mod: Record<string, unknown>;
    try {
      // pathToFileURL, not a bare absolute path. On Windows `import("D:/...")`
      // throws ERR_UNSUPPORTED_ESM_URL_SCHEME, and the first version of this
      // tool swallowed that in a bare `catch { continue }` — so every bank
      // failed to load, BANKS came back empty, and all 187 question routes
      // silently lost their date while the tool reported success. A broken
      // import must not be indistinguishable from an empty one.
      mod = await import(pathToFileURL(path.join(ROOT, rel)).href);
    } catch (err) {
      failedImports.push(`${rel}: ${(err as Error).message.split(/\r?\n/)[0]}`);
      continue;
    }
    for (const value of Object.values(mod)) {
      if (!Array.isArray(value)) continue;
      for (const q of value) {
        if (!q || typeof q !== "object") continue;
        const item = q as { chapterId?: string; subjectIds?: string[] };
        if (!item.chapterId || !Array.isArray(item.subjectIds)) continue;
        for (const s of item.subjectIds) {
          const key = `${s}/${item.chapterId}`;
          const list = byChapter.get(key) ?? [];
          if (!list.includes(rel)) { list.push(rel); byChapter.set(key, list); }
        }
      }
    }
  }
  if (failedImports.length) {
    console.warn(`  ! ${failedImports.length} bank module(s) could not be read:`);
    failedImports.slice(0, 5).forEach(f => console.warn(`      ${f}`));
  }
  console.log(`  question banks: ${candidates.length} scanned, ${byChapter.size} chapters attributed`);
  return byChapter;
}

// ─── Build the map ───────────────────────────────────────────────────────────

const BANKS = await questionBankIndex();

const map: Record<string, string> = {};
const put = (route: string, date: string | null) => { if (date) map[route] = date; };

// Static routes: the page's own source, plus the data module it renders from
// where that is what actually changes.
const STATIC_SOURCES: Record<string, string[]> = {
  "/":                        ["app/page.tsx"],
  "/live-classes":            ["app/live-classes/page.tsx", "lib/live-classes.ts"],
  "/about":                   ["app/about/page.tsx"],
  "/cpl":                     ["app/cpl/page.tsx", "lib/subjects.ts"],
  "/atpl":                    ["app/atpl/page.tsx", "lib/subjects.ts"],
  "/notes":                   ["app/notes/page.tsx", "lib/subjects.ts"],
  "/video-lectures":          ["app/video-lectures/page.tsx", "lib/chapter-videos.ts", "lib/video-index.ts"],
  "/question-bank":           ["app/question-bank/page.tsx", "lib/questions.ts"],
  "/resources":               ["app/resources/page.tsx"],
  "/exam":                    ["app/exam/page.tsx", "lib/past-papers.ts"],
  "/rtr-simulator":           ["app/rtr-simulator/page.tsx"],
  "/adapt-test":              ["app/adapt-test/page.tsx"],
  "/books":                   ["app/books/page.tsx"],
  "/past-papers":             ["app/past-papers/page.tsx", "lib/past-papers.ts"],
  "/guides":                  ["app/guides/page.tsx", "lib/guides.ts"],
  "/how-answers-are-verified":["app/how-answers-are-verified/page.tsx", "lib/verification-status.ts"],
  "/faq":                     ["app/faq/page.tsx", "lib/faq.ts"],
  "/cpl-cost-calculator":     ["app/cpl-cost-calculator/page.tsx", "app/components/Calculator.tsx"],
  // Ticket #8: submitted by the sitemap but never dated.
  "/free-dgca-mock-test":     ["app/free-dgca-mock-test/page.tsx", "lib/exam-papers-meta.ts", "lib/landing-pages.ts"],
  "/corrections":             ["app/corrections/page.tsx", "lib/corrections.ts"],
};

for (const [route, sources] of Object.entries(STATIC_SOURCES)) {
  const present = sources.filter(exists);
  if (present.length !== sources.length) {
    // Loud, not silent: a renamed page would otherwise quietly lose its date.
    console.warn(`  ! ${route}: missing source ${sources.filter(s => !exists(s)).join(", ")}`);
  }
  put(route, newestOf(...present));
}

// /metar-taf-practice renders the met-25 and met-26 question sets.
put("/metar-taf-practice", newestOf("app/metar-taf-practice/page.tsx",
  ...(BANKS.get("meteorology/met-25") ?? []), ...(BANKS.get("meteorology/met-26") ?? [])));

// /question-bank/<subject>: the landing page plus the banks behind the subject.
for (const l of QB_LANDINGS) {
  const subject = CPL_SUBJECTS.find(s => s.id === l.subjectId);
  const banks = (subject?.chapters ?? []).flatMap(ch => BANKS.get(`${l.subjectId}/${ch.id}`) ?? []);
  put(`/question-bank/${l.subjectId}`,
      newestOf("app/question-bank/[subject]/page.tsx", "lib/landing-pages.ts", ...banks));
}

// /dgca-exam-questions/*: one generated data module feeds every page.
const PQ_PAGE: Record<number, string> = {
  1: "app/dgca-exam-questions/page.tsx",
  2: "app/dgca-exam-questions/[subject]/page.tsx",
  3: "app/dgca-exam-questions/[subject]/[topic]/page.tsx",
};
for (const route of pqRoutes()) {
  const depth = route.split("/").filter(Boolean).length;
  put(route, newestOf(PQ_PAGE[depth], "lib/previous-questions.ts", "lib/generated/previous-questions.ts"));
}

const VIDEO_DATES = videoBlockDates();
const SUBJECT_DATES = subjectBlockDates();

function chapterRoutes(track: "cpl" | "atpl", subjects: Subject[]) {
  for (const s of subjects) {
    put(`/${track}/${s.id}`, track === "cpl"
      ? later(SUBJECT_DATES.get(s.id) ?? newestOf("lib/subjects.ts"), newestOf("app/cpl/[subject]/page.tsx"))
      : newestOf("app/atpl/[subject]/page.tsx", "lib/atpl-syllabus.ts", "lib/atpl-study-topics.ts"));
    for (const ch of s.chapters) {
      if (isIndexableChapterRoute(s.id, ch.id, "notes")) {
        // Air Regs ch.1 renders from a React component, not a published file.
        const notesFile = s.id === "air-regulations" && ch.id === "ar-1"
          ? "app/components/content/AirRegsChapter1Notes.tsx"
          : `public/content/${s.id}/${ch.id}/notes.html`;
        put(`/${track}/${s.id}/${ch.id}/notes`, newestOf(notesFile));
      }
      if (isIndexableChapterRoute(s.id, ch.id, "questions")) {
        // CPL Air Regs chapters (26) are mapped onto the older bank chapter IDs in
        // lib/questions.ts, so a chapter with no directly tagged bank is dated by
        // that mapping plus every Air Regs bank it can draw from.
        const direct = BANKS.get(`${s.id}/${ch.id}`) ?? [];
        const banks = direct.length || s.id !== "air-regulations" ? direct : [
          "lib/questions.ts",
          ...new Set([...BANKS].filter(([k]) => k.startsWith("air-regulations/")).flatMap(([, v]) => v)),
        ];
        put(`/${track}/${s.id}/${ch.id}/questions`, newestOf(...banks));
      }
      if (isIndexableChapterRoute(s.id, ch.id, "video")) {
        // This chapter's own entry in chapter-videos.ts, and the notes whose
        // headings the video page lists (ticket #4) — not the whole file.
        const src = ch.notesSource ?? { subjectId: s.id, chapterId: ch.id };
        const entry = VIDEO_DATES.get(`${s.id}/${ch.id}`) ?? VIDEO_DATES.get(`${src.subjectId}/${src.chapterId}`) ?? null;
        put(`/${track}/${s.id}/${ch.id}/video`,
            later(entry, newestOf(`public/content/${src.subjectId}/${src.chapterId}/notes.html`)));
      }
    }
  }
}
chapterRoutes("cpl", CPL_SUBJECTS);
chapterRoutes("atpl", ATPL_SUBJECTS);

for (const p of ALL_PAST_PAPERS) {
  put(`/past-papers/${p.id}`, newestOf("lib/past-papers.ts"));
}

// ─── Write ───────────────────────────────────────────────────────────────────

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a < b ? -1 : 1));
const body = `// GENERATED by tools/build-lastmod.mts — do not edit by hand.
//
// The real last-modified date of each submitted URL, from git history. Read by
// app/sitemap.ts. A route absent from this map gets NO lastmod in the sitemap,
// which is the honest answer when we cannot date it — see the tool for why the
// previous behaviour (stamping the build time on all 603) was worse than
// saying nothing.
//
// Regenerate after publishing content:  npx tsx tools/build-lastmod.mts

export const LASTMOD: Readonly<Record<string, string>> = ${JSON.stringify(sorted, null, 2)};
`;

const outPath = path.join(ROOT, "lib", "generated", "lastmod.ts");
fs.writeFileSync(outPath, body, "utf8");

const dates = Object.values(sorted).sort();
console.log(`lastmod: ${Object.keys(sorted).length} routes dated`);
console.log(`  oldest ${dates[0]?.slice(0, 10)}   newest ${dates[dates.length - 1]?.slice(0, 10)}`);
console.log(`  distinct dates: ${new Set(dates.map(d => d.slice(0, 10))).size}`);
console.log(`  written to lib/generated/lastmod.ts`);
