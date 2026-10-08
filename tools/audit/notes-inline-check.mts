// Proof that getInlineNotes() hands the page a chapter that works in-page.
//
//   npx tsx tools/audit/notes-inline-check.mts
//
// The chapter files in public/content/<subject>/<chapter>/notes.html were
// authored as standalone documents. lib/notes-inline.ts lifts the body out of
// them and renders it inside /cpl|/atpl/<subject>/<chapter>/notes, where
// everything the standalone file took for granted stops being true:
//
//   * relative URLs resolve against the app route, not the chapter folder
//   * <head> is discarded, so <link rel="stylesheet"> never arrives
//   * <script> is discarded, so inline onclick="fn()" calls an undefined fn
//
// This runs getInlineNotes() over EVERY chapter that has a notes.html and
// counts what is still wrong in what it returns. It scans the OUTPUT with its
// own patterns, deliberately not reusing the rewriting code under test, so a
// bug in that code cannot also hide itself here.
//
// Exit 1 if any count other than "assets missing on disk" is non-zero.
// Missing assets are listed and do not fail the run: they are files the
// chapter references that do not exist in the repo, which no URL rewrite can
// fix and which are the owner's to supply or remove.
import fs from "node:fs";
import path from "node:path";
import * as inline from "../../lib/notes-inline";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "public", "content");
const PAGE_SRC = fs.readFileSync(
  path.join(ROOT, "app", "components", "content", "HtmlNotesPage.tsx"),
  "utf-8",
);

// What the page claims to understand. Absent before the fix exists.
const KNOWN_ACTIONS: string[] = (inline as { NOTE_ACTIONS?: readonly string[] }).NOTE_ACTIONS
  ? [...(inline as { NOTE_ACTIONS: readonly string[] }).NOTE_ACTIONS]
  : [];

const isLocalRelative = (v: string) => v !== "" && !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(v.trim());

type FileReport = {
  id: string;
  nullResult: boolean;
  relAttrs: string[];
  relCssUrls: string[];
  linkNotInlined: string[];
  externalLinks: string[];
  onclick: number;
  otherInline: Record<string, number>;
  unscoped: string[];
  strayTags: number;
  unknownActs: string[];
  droppedHandlers: number;
  missing: string[];
};

// ── Independent CSS walker: every selector must start with .ga-notes ─────────
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function splitBlocks(css: string): { prelude: string; body: string }[] {
  const out: { prelude: string; body: string }[] = [];
  let i = 0;
  const n = css.length;
  while (i < n) {
    while (i < n && /\s/.test(css[i])) i++;
    if (i >= n) break;
    let j = i;
    let q: string | null = null;
    while (j < n) {
      const c = css[j];
      if (q) { if (c === "\\") { j += 2; continue; } if (c === q) q = null; }
      else if (c === '"' || c === "'") q = c;
      else if (c === "{" || c === ";") break;
      j++;
    }
    if (j >= n) break;
    if (css[j] === ";") { out.push({ prelude: css.slice(i, j).trim(), body: "" }); i = j + 1; continue; }
    let depth = 0;
    let k = j;
    q = null;
    for (; k < n; k++) {
      const c = css[k];
      if (q) { if (c === "\\") { k++; continue; } if (c === q) q = null; continue; }
      if (c === '"' || c === "'") { q = c; continue; }
      if (c === "{") depth++;
      else if (c === "}") { depth--; if (depth === 0) break; }
    }
    out.push({ prelude: css.slice(i, j).trim(), body: css.slice(j + 1, k) });
    i = k + 1;
  }
  return out;
}

function splitTopLevelCommas(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const c of s) {
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    if (c === "," && depth === 0) { parts.push(cur); cur = ""; } else cur += c;
  }
  parts.push(cur);
  return parts.map(p => p.trim()).filter(Boolean);
}

function findUnscoped(css: string, into: string[]) {
  for (const { prelude, body } of splitBlocks(stripComments(css))) {
    if (prelude.startsWith("@")) {
      if (/^@(keyframes|-webkit-keyframes|font-face|counter-style|property)\b/i.test(prelude)) continue;
      if (/^@(media|supports|layer|container)\b/i.test(prelude)) { findUnscoped(body, into); continue; }
      into.push(prelude.slice(0, 60)); // @import / @page / anything else left in
      continue;
    }
    for (const sel of splitTopLevelCommas(prelude)) {
      if (!sel.startsWith(".ga-notes")) into.push(sel.slice(0, 80));
    }
  }
}

// ── URL helpers (own copy, on purpose) ───────────────────────────────────────
function resolveToContentPath(value: string, subject: string, chapter: string): string | null {
  const clean = value.trim();
  if (/^([a-z][a-z0-9+.-]*:|#)/i.test(clean) || clean.startsWith("//")) return null;
  const base = new URL(`https://x.invalid/content/${subject}/${chapter}/notes.html`);
  const u = new URL(clean, base);
  return decodeURIComponent(u.pathname);
}

function existsUnderPublic(urlPath: string): boolean {
  if (!urlPath.startsWith("/content/")) return true; // an app route, not a file
  return fs.existsSync(path.join(ROOT, "public", urlPath));
}

function check(subject: string, chapter: string): FileReport {
  const id = `${subject}/${chapter}`;
  const rep: FileReport = {
    id, nullResult: false, relAttrs: [], relCssUrls: [], linkNotInlined: [], externalLinks: [],
    onclick: 0, otherInline: {}, unscoped: [], strayTags: 0, unknownActs: [], droppedHandlers: 0, missing: [],
  };
  const raw = fs.readFileSync(path.join(CONTENT, subject, chapter, "notes.html"), "utf-8");
  const res = inline.getInlineNotes(subject, chapter);
  if (!res) { rep.nullResult = true; return rep; }
  const { html, css } = res;

  // 1. relative src / href / poster / srcset still in the markup
  const referenced: string[] = [];
  for (const m of html.matchAll(/\s(?:src|href|poster|xlink:href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    const v = (m[1] ?? m[2] ?? m[3] ?? "").trim();
    referenced.push(v);
    if (isLocalRelative(v)) rep.relAttrs.push(v);
  }
  for (const m of html.matchAll(/\ssrcset\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    for (const part of (m[1] ?? m[2] ?? "").split(",")) {
      const v = part.trim().split(/\s+/)[0] ?? "";
      referenced.push(v);
      if (isLocalRelative(v)) rep.relAttrs.push(v);
    }
  }

  // 2. relative url(...) in the css or in inline style="" attributes
  const urlRe = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)/gi;
  for (const src of [css, html]) {
    for (const m of src.matchAll(urlRe)) {
      const v = (m[1] ?? m[2] ?? m[3] ?? "").trim();
      referenced.push(v);
      if (isLocalRelative(v)) rep.relCssUrls.push(v);
    }
  }

  // 3. stylesheets linked from the source file
  const sheetMarkers: { href: string; ok: boolean }[] = [];
  for (const m of raw.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/\brel\s*=\s*["']?[^"'>]*stylesheet/i.test(tag)) continue;
    const href = (tag.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i) ?? []).slice(1).find(Boolean) ?? "";
    if (/^(https?:)?\/\//i.test(href)) { rep.externalLinks.push(href.slice(0, 70)); continue; }
    const target = resolveToContentPath(href, subject, chapter);
    if (!target) { rep.linkNotInlined.push(href); continue; }
    const file = path.join(ROOT, "public", target);
    if (!fs.existsSync(file)) { rep.linkNotInlined.push(`${href} (file missing)`); continue; }
    const text = stripComments(fs.readFileSync(file, "utf-8"));
    const classes = [...text.matchAll(/\.(-?[a-zA-Z_][\w-]*)\s*[{,:]/g)].map(x => x[1]);
    const picks = [0, Math.floor(classes.length / 2), classes.length - 1].map(i => classes[i]).filter(Boolean);
    const ok = picks.length > 0 && picks.every(c => css.includes(`.ga-notes .${c}`) || css.includes(`.ga-notes.${c}`) || css.includes(`.${c}`));
    sheetMarkers.push({ href, ok });
    if (!ok) rep.linkNotInlined.push(href);
  }

  // 4. inline handlers
  // Looked for inside real tags only: prose such as "only = ..." in a worked
  // example must not count as a handler attribute.
  for (const t of html.matchAll(/<[a-zA-Z][\w:-]*\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g)) {
    for (const m of t[1].matchAll(/\s(on[a-z]+)\s*=/gi)) {
      const ev = m[1].toLowerCase();
      if (ev === "onclick") { rep.onclick++; continue; }
      rep.otherInline[ev] = (rep.otherInline[ev] ?? 0) + 1;
    }
  }

  // 4b. every onclick/oninput in the SOURCE body must have come out as a
  // data-ga-act. One that did not was dropped with no replacement: a button
  // that now does nothing, or an answer that stays hidden. Counted from the raw
  // file with its own scan, so it cannot agree with the code under test by
  // construction.
  const rawBody = (raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i) ?? [])[1] ?? "";
  const rawNoScript = rawBody.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  let rawHandlers = 0;
  for (const t of rawNoScript.matchAll(/<[a-zA-Z][\w:-]*\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g)) {
    rawHandlers += (t[1].match(/\s(?:onclick|oninput)\s*=/gi) ?? []).length;
  }
  const acts = (html.match(/\sdata-ga-act\s*=/g) ?? []).length;
  rep.droppedHandlers = Math.max(0, rawHandlers - acts);

  // 5. selectors that escaped the scope
  findUnscoped(css, rep.unscoped);

  // 6. markup that must not cross over
  rep.strayTags = (html.match(/<(script|style|link)\b/gi) ?? []).length;

  // 7. actions the markup asks for must be ones the page implements
  for (const m of html.matchAll(/\sdata-ga-act\s*=\s*"([^"]*)"/g)) {
    const act = m[1];
    if (!KNOWN_ACTIONS.includes(act) || !new RegExp(`case\\s+"${act}"`).test(PAGE_SRC)) rep.unknownActs.push(act);
  }

  // 8. every local file the output points at must exist on disk. Relative
  // values are resolved against the chapter folder here, so the BEFORE run
  // reports the same missing files the AFTER run does.
  for (const v of referenced) {
    if (!v) continue;
    const p = resolveToContentPath(v, subject, chapter);
    if (!p) continue;
    if (!p.startsWith("/content/")) continue;
    if (/\/notes\.html$/.test(p)) continue; // a page link; checked as a route elsewhere
    if (!existsUnderPublic(p)) rep.missing.push(p);
  }
  return rep;
}

// ── run over every chapter ───────────────────────────────────────────────────
const reports: FileReport[] = [];
for (const subject of fs.readdirSync(CONTENT).sort()) {
  const sd = path.join(CONTENT, subject);
  if (!fs.statSync(sd).isDirectory() || subject.startsWith("_")) continue;
  for (const chapter of fs.readdirSync(sd).sort()) {
    if (chapter.startsWith("_")) continue;
    if (fs.existsSync(path.join(sd, chapter, "notes.html"))) reports.push(check(subject, chapter));
  }
}

const sum = (f: (r: FileReport) => number) => reports.reduce((a, r) => a + f(r), 0);
const files = (f: (r: FileReport) => number) => reports.filter(r => f(r) > 0).length;
const allMissing = [...new Set(reports.flatMap(r => r.missing))].sort();
const other: Record<string, number> = {};
for (const r of reports) for (const [k, v] of Object.entries(r.otherInline)) other[k] = (other[k] ?? 0) + v;
const extLinks = [...new Set(reports.flatMap(r => r.externalLinks))];

const rows: [string, number, number][] = [
  ["chapters checked", reports.length, 0],
  ["getInlineNotes returned null", sum(r => (r.nullResult ? 1 : 0)), files(r => (r.nullResult ? 1 : 0))],
  ["relative src/href/poster/srcset remaining", sum(r => r.relAttrs.length), files(r => r.relAttrs.length)],
  ["relative url(...) remaining (css + style attrs)", sum(r => r.relCssUrls.length), files(r => r.relCssUrls.length)],
  ["local <link rel=stylesheet> not inlined", sum(r => r.linkNotInlined.length), files(r => r.linkNotInlined.length)],
  ["onclick attributes remaining", sum(r => r.onclick), files(r => r.onclick)],
  ["selectors not prefixed .ga-notes", sum(r => r.unscoped.length), files(r => r.unscoped.length)],
  ["<script>/<style>/<link> tags left in markup", sum(r => r.strayTags), files(r => r.strayTags)],
  ["data-ga-act the page does not implement", sum(r => r.unknownActs.length), files(r => r.unknownActs.length)],
  ["onclick/oninput dropped with no replacement action", sum(r => r.droppedHandlers), files(r => r.droppedHandlers)],
  ["referenced assets missing on disk (listed, not failing)", sum(r => r.missing.length), files(r => r.missing.length)],
];

console.log("notes-inline check over", reports.length, "chapters with a notes.html\n");
console.log("count".padStart(7), "files".padStart(6), " check");
for (const [label, n, f] of rows.slice(1)) console.log(String(n).padStart(7), String(f).padStart(6), " " + label);

console.log("\ninformational (not failures):");
console.log("  other inline handlers left in markup:", JSON.stringify(other));
console.log("  external stylesheets that cannot be inlined (CSP style-src is 'self'):", extLinks.length);
console.log("  declared actions:", KNOWN_ACTIONS.length ? KNOWN_ACTIONS.join(", ") : "(none)");

if (allMissing.length) {
  console.log(`\nassets referenced but absent from public/ (${allMissing.length} distinct):`);
  const byDir = new Map<string, string[]>();
  for (const m of allMissing) {
    const d = path.posix.dirname(m);
    byDir.set(d, [...(byDir.get(d) ?? []), path.posix.basename(m)]);
  }
  for (const [d, names] of byDir) {
    console.log(`  ${d}/  ${names.length} missing: ${names.slice(0, 3).join(", ")}${names.length > 3 ? ", ..." : ""}`);
  }
}

const detail = (label: string, pick: (r: FileReport) => string[]) => {
  const bad = reports.filter(r => pick(r).length);
  if (!bad.length) return;
  console.log(`\n${label}:`);
  for (const r of bad.slice(0, 12)) console.log(`  ${r.id}: ${[...new Set(pick(r))].slice(0, 4).join(" | ")}`);
  if (bad.length > 12) console.log(`  ... and ${bad.length - 12} more chapters`);
};
detail("relative src/href", r => r.relAttrs);
detail("relative url()", r => r.relCssUrls);
detail("stylesheets not inlined", r => r.linkNotInlined);
detail("unscoped selectors", r => r.unscoped);
detail("unknown actions", r => r.unknownActs);

const failing =
  sum(r => (r.nullResult ? 1 : 0)) + sum(r => r.relAttrs.length) + sum(r => r.relCssUrls.length) +
  sum(r => r.linkNotInlined.length) + sum(r => r.onclick) + sum(r => r.unscoped.length) +
  sum(r => r.strayTags) + sum(r => r.unknownActs.length) + sum(r => r.droppedHandlers);
console.log(failing === 0 ? "\nRESULT: all counts 0 (missing assets listed above)" : `\nRESULT: ${failing} failing item(s)`);
process.exit(failing === 0 ? 0 : 1);
