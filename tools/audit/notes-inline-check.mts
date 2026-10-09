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
// Also checked, added after an independent review of the first version:
//
//   * "watermark-tile" must not appear in any chapter's output, and no
//     .cpp-watermark element may survive. hf_book.css tiles the owner's personal
//     name across the page background and he has ordered it off the public site.
//   * vendor sheets (Font Awesome) are returned as a URL list, never inlined.
//   * every chapter-authored linked sheet is inlined: tested against the rules
//     that exist ONLY in that sheet (not in any <style> the chapter carries), so
//     a chapter's own <style> cannot satisfy the test by accident.
//   * relative URLs inside onerror="...this.src='../x'" strings.
//
// And it WRITES tools/audit/notes-newly-visible-images-2026-10-08.txt: every
// image URL that resolves to a file on disk now but was a relative path that
// 404ed before this branch. That list is informational and does not fail the
// run; a human is meant to open every file on it.
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

const RESOLVE_BASE = "https://x.invalid";
const isLocalRelative =(v: string) => v !== "" && !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(v.trim());

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
  vendorBad: string[];
  watermark: string[];
  onerrorRel: string[];
  onerrorUrls: number;
  cssBytes: number;
  vendorLinked: string[];
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

/** Every rule in a sheet, @media/@supports/@layer/@container flattened. */
function rulesIn(css: string, into: { prelude: string; body: string }[] = []) {
  for (const b of splitBlocks(stripComments(css))) {
    if (b.prelude.startsWith("@")) {
      if (/^@(media|supports|layer|container)\b/i.test(b.prelude)) rulesIn(b.body, into);
      continue;
    }
    into.push(b);
  }
  return into;
}

const normCss = (s: string) => s.replace(/\s+/g, " ").trim();
const classesOf = (prelude: string) => [...prelude.matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)].map(m => m[1]);

/**
 * Rules that exist ONLY in `sheet`: a rule whose selector uses a class that no
 * other source in `others` (the chapter's own <style> blocks and its other
 * sheets) mentions anywhere. A chapter's own CSS therefore cannot make these
 * appear in the output; only the linked sheet can. Rules whose body names a
 * url(...) are skipped (the rewrite changes those on purpose).
 */
function rulesOnlyIn(sheet: string, others: string[]) {
  const seen = new Set<string>();
  for (const o of others) for (const r of rulesIn(o)) for (const c of classesOf(r.prelude)) seen.add(c);
  const out: { prelude: string; body: string; uniq: string[] }[] = [];
  for (const r of rulesIn(sheet)) {
    if (/url\(/i.test(r.body) || normCss(r.body) === "") continue;
    const uniq = classesOf(r.prelude).filter(c => !seen.has(c));
    if (uniq.length > 0) out.push({ ...r, uniq });
  }
  return out;
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
  try {
    const base = new URL(`https://x.invalid/content/${subject}/${chapter}/notes.html`);
    const u = new URL(clean, base);
    return decodeURIComponent(u.pathname);
  } catch {
    return null; // a value that is not a URL at all cannot be a file we serve
  }
}

function existsUnderPublic(urlPath: string): boolean {
  if (!urlPath.startsWith("/content/")) return true; // an app route, not a file
  return fs.existsSync(path.join(ROOT, "public", urlPath));
}

/** `.src = '...'` style assignments inside an inline handler's JavaScript. */
const HANDLER_URL_RE = /\.(?:src|href|srcset|poster)\s*=\s*(?:'([^']*)'|"([^"]*)")/gi;

/** Every tag's attributes, scanned the same way for source and output. */
const TAG_SCAN = /<[a-zA-Z][\w:-]*\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

type ImageRef = { value: string; base: string; kind: string };

/**
 * Every image reference in a chapter's SOURCE, with the URL it resolved against
 * in the standalone file: <img>/<source>/poster/srcset and onerror fallbacks
 * against the chapter folder, url(...) in a linked sheet against the sheet's
 * own folder. Own scan, own regexes: independent of the code under test.
 */
function sourceImageRefs(raw: string, subject: string, chapter: string): ImageRef[] {
  const out: ImageRef[] = [];
  const chapterBase = `/content/${subject}/${chapter}/notes.html`;
  const body = ((raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i) ?? [])[1] ?? "").replace(/<script\b[\s\S]*?<\/script>/gi, "");
  const cssUrls = (css: string, base: string, kind: string) => {
    for (const m of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)/gi)) {
      const v = (m[1] ?? m[2] ?? m[3] ?? "").trim();
      if (v && !v.startsWith("data:")) out.push({ value: v, base, kind });
    }
  };
  for (const t of body.matchAll(TAG_SCAN)) {
    const tag = t[0];
    const name = (tag.match(/^<([a-zA-Z][\w:-]*)/) ?? [])[1]?.toLowerCase() ?? "";
    for (const a of t[1].matchAll(/\s([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      const key = a[1].toLowerCase();
      const v = (a[2] ?? a[3] ?? a[4] ?? "").trim();
      if ((key === "src" && (name === "img" || name === "source")) || key === "poster" || (key === "href" && name === "image")) {
        out.push({ value: v, base: chapterBase, kind: `${name}[${key}]` });
      } else if (key === "srcset") {
        for (const part of v.split(",")) { const u = part.trim().split(/\s+/)[0]; if (u) out.push({ value: u, base: chapterBase, kind: `${name}[srcset]` }); }
      } else if (key === "onerror") {
        for (const h of v.matchAll(HANDLER_URL_RE)) out.push({ value: (h[1] ?? h[2] ?? "").trim(), base: chapterBase, kind: `${name}[onerror]` });
      } else if (key === "style") {
        cssUrls(v, chapterBase, `${name}[style]`);
      }
    }
  }
  for (const m of raw.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) cssUrls(m[1], chapterBase, "style-block");
  for (const m of raw.matchAll(/<link\b[^>]*>/gi)) {
    if (!/\brel\s*=\s*["']?[^"'>]*stylesheet/i.test(m[0])) continue;
    const href = (m[0].match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i) ?? []).slice(1).find(Boolean) ?? "";
    if (!href || /^(https?:)?\/\//i.test(href)) continue;
    const target = resolveToContentPath(href, subject, chapter);
    if (!target || /\/vendor\//i.test(target)) continue;
    const file = path.join(ROOT, "public", target);
    if (fs.existsSync(file)) cssUrls(fs.readFileSync(file, "utf-8"), target, "linked-sheet");
  }
  return out;
}

/** Every image reference in the OUTPUT, resolved to a decoded /content/... path. */
function outputImagePaths(html: string, css: string, subject: string, chapter: string): Set<string> {
  const out = new Set<string>();
  const add = (v: string) => {
    const p = resolveToContentPath(v, subject, chapter);
    if (p) out.add(p);
  };
  for (const t of html.matchAll(TAG_SCAN)) {
    for (const a of t[1].matchAll(/\s([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      const key = a[1].toLowerCase();
      const v = (a[2] ?? a[3] ?? a[4] ?? "").trim();
      if (key === "src" || key === "poster" || key === "href") add(v);
      else if (key === "srcset") for (const part of v.split(",")) { const u = part.trim().split(/\s+/)[0]; if (u) add(u); }
      else if (key === "onerror") for (const h of v.matchAll(HANDLER_URL_RE)) add((h[1] ?? h[2] ?? "").trim());
      else if (key === "style") for (const m of v.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)/gi)) add((m[1] ?? m[2] ?? m[3] ?? "").trim());
    }
  }
  for (const m of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)/gi)) add((m[1] ?? m[2] ?? m[3] ?? "").trim());
  return out;
}

type NewlyVisible = { chapter: string; kind: string; raw: string; url: string; bytes: number; magic: string };
const newlyVisible: NewlyVisible[] = [];
const IMG_MAGIC: [string, (b: Buffer) => boolean][] = [
  ["png", b => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))],
  ["jpeg", b => b[0] === 0xff && b[1] === 0xd8],
  ["webp", b => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP"],
  ["gif", b => b.subarray(0, 3).toString("latin1") === "GIF"],
  ["svg", b => /<svg\b/i.test(b.subarray(0, 512).toString("utf-8"))],
];
function magicOf(file: string): string {
  const b = fs.readFileSync(file);
  return IMG_MAGIC.find(([, f]) => f(b))?.[0] ?? "NOT-AN-IMAGE";
}

function check(subject: string, chapter: string): FileReport {
  const id = `${subject}/${chapter}`;
  const rep: FileReport = {
    id, nullResult: false, relAttrs: [], relCssUrls: [], linkNotInlined: [], externalLinks: [],
    onclick: 0, otherInline: {}, unscoped: [], strayTags: 0, unknownActs: [], droppedHandlers: 0, missing: [],
    vendorBad: [], watermark: [], onerrorRel: [], onerrorUrls: 0, cssBytes: 0, vendorLinked: [],
  };
  const raw = fs.readFileSync(path.join(CONTENT, subject, chapter, "notes.html"), "utf-8");
  const res = inline.getInlineNotes(subject, chapter) as { html: string; css: string; stylesheets?: string[] } | null;
  if (!res) { rep.nullResult = true; return rep; }
  const { html, css } = res;
  const stylesheets = res.stylesheets ?? [];
  rep.cssBytes = css.length;
  rep.vendorLinked = stylesheets;

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

  // 3. stylesheets linked from the source file.
  //    chapter-authored  -> must be inlined: every rule that exists ONLY in that
  //                         sheet (see rulesOnlyIn) must be present, scoped, in css
  //    vendor (/vendor/) -> must be returned in `stylesheets` as a same-origin
  //                         /content/...css URL for a file that exists, and its
  //                         rules must NOT have been copied into css
  const ownStyleBlocks = [...raw.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]);
  const linkedSheets: { href: string; target: string; text: string; vendor: boolean }[] = [];
  for (const m of raw.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/\brel\s*=\s*["']?[^"'>]*stylesheet/i.test(tag)) continue;
    const href = (tag.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i) ?? []).slice(1).find(Boolean) ?? "";
    if (/^(https?:)?\/\//i.test(href)) { rep.externalLinks.push(href.slice(0, 70)); continue; }
    const target = resolveToContentPath(href, subject, chapter);
    if (!target) { rep.linkNotInlined.push(href); continue; }
    const file = path.join(ROOT, "public", target);
    if (!fs.existsSync(file)) { rep.linkNotInlined.push(`${href} (file missing)`); continue; }
    linkedSheets.push({ href, target, text: fs.readFileSync(file, "utf-8"), vendor: /\/vendor\//i.test(target) });
  }
  const outCss = normCss(stripComments(css));
  for (const sheet of linkedSheets) {
    const others = [...ownStyleBlocks, ...linkedSheets.filter(s => s !== sheet).map(s => s.text)];
    const unique = rulesOnlyIn(sheet.text, others);
    if (sheet.vendor) {
      if (!stylesheets.includes(sheet.target)) rep.vendorBad.push(`${sheet.target} not in stylesheets`);
      const outClasses = new Set(rulesIn(css).flatMap(r => classesOf(r.prelude)));
      const leaked = unique.filter(r => r.uniq.some(c => outClasses.has(c)));
      if (unique.length === 0) rep.vendorBad.push(`${sheet.target}: no rule unique to it to test`);
      if (leaked.length > 0) rep.vendorBad.push(`${sheet.target}: ${leaked.length}/${unique.length} of its rules were inlined`);
    } else {
      if (unique.length === 0) { rep.linkNotInlined.push(`${sheet.href} (no rule unique to this sheet to test)`); continue; }
      // The whole `{ body }` must be there, not a fragment that could sit
      // inside some other rule's declaration list.
      const hasBody = (b: string) => ["{ " + b + " }", "{" + b + "}", "{ " + b + "}", "{" + b + " }"].some(w => outCss.includes(w));
      const absent = unique.filter(r => !hasBody(normCss(r.body)));
      if (absent.length > 0) rep.linkNotInlined.push(`${sheet.href} (${absent.length}/${unique.length} of its own rules missing, e.g. ${absent[0].prelude.slice(0, 40)})`);
    }
  }
  // Every vendor URL the output advertises must be a real, same-origin /content/ stylesheet.
  for (const u of stylesheets) {
    if (!/^\/content\/[^/]+\/_assets\/vendor\/.+\.css$/i.test(u) || !fs.existsSync(path.join(ROOT, "public", decodeURIComponent(u)))) {
      rep.vendorBad.push(`${u}: not a /content/.../vendor/*.css file that exists`);
    }
  }

  // 3b. the owner's name must not be on the page: no reference to the tiled
  // watermark image anywhere in what the page receives, and no .cpp-watermark.
  if (/watermark-tile/i.test(css)) rep.watermark.push("watermark-tile in css");
  if (/watermark-tile/i.test(html)) rep.watermark.push("watermark-tile in html");
  if (stylesheets.some(u => /watermark-tile/i.test(u))) rep.watermark.push("watermark-tile in stylesheets");
  if (/class\s*=\s*["'][^"']*\bcpp-watermark\b/i.test(html)) rep.watermark.push("cpp-watermark element in html");

  // 3c. URLs assigned inside onerror="...": counted, and none may stay relative.
  for (const t of html.matchAll(TAG_SCAN)) {
    for (const a of t[1].matchAll(/\sonerror\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
      for (const h of (a[1] ?? a[2] ?? "").matchAll(HANDLER_URL_RE)) {
        rep.onerrorUrls++;
        const v = (h[1] ?? h[2] ?? "").trim();
        referenced.push(v);
        if (isLocalRelative(v)) rep.onerrorRel.push(v);
      }
    }
  }

  // 3d. images that resolve to a file now but were a 404ing relative path before.
  const outPaths = outputImagePaths(html, css, subject, chapter);
  const seenHere = new Set<string>();
  for (const ref of sourceImageRefs(raw, subject, chapter)) {
    if (!isLocalRelative(ref.value)) continue; // an absolute path worked before; not "newly" anything
    let resolved: string;
    try { resolved = decodeURIComponent(new URL(ref.value, new URL(ref.base, RESOLVE_BASE)).pathname); } catch { continue; }
    if (!resolved.startsWith("/content/") || !outPaths.has(resolved)) continue;
    const file = path.join(ROOT, "public", resolved);
    if (!fs.existsSync(file) || seenHere.has(resolved)) continue;
    seenHere.add(resolved);
    newlyVisible.push({
      chapter: id, kind: ref.kind, raw: ref.value, url: resolved,
      bytes: fs.statSync(file).size, magic: magicOf(file),
    });
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

// The page must actually render what lib hands back: a <link rel="stylesheet">
// per entry of notes.stylesheets, with `precedence` (React 19 hoists, dedupes).
const PAGE_LINKS_OK =
  /notes\.stylesheets\.map\(/.test(PAGE_SRC) &&
  /<link\b[^>]*rel="stylesheet"[^>]*precedence=/.test(PAGE_SRC);

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
  ["vendor stylesheet not linked / inlined by mistake / bad URL", sum(r => r.vendorBad.length), files(r => r.vendorBad.length)],
  ["watermark-tile or .cpp-watermark in the output (owner's name)", sum(r => r.watermark.length), files(r => r.watermark.length)],
  ["relative URL left inside an onerror string", sum(r => r.onerrorRel.length), files(r => r.onerrorRel.length)],
  ["HtmlNotesPage does not <link> notes.stylesheets with precedence", PAGE_LINKS_OK ? 0 : 1, PAGE_LINKS_OK ? 0 : 1],
  ["referenced assets missing on disk (listed, not failing)", sum(r => r.missing.length), files(r => r.missing.length)],
];

console.log("notes-inline check over", reports.length, "chapters with a notes.html\n");
console.log("count".padStart(7), "files".padStart(6), " check");
for (const [label, n, f] of rows.slice(1)) console.log(String(n).padStart(7), String(f).padStart(6), " " + label);

console.log("\ninformational (not failures):");
console.log("  other inline handlers left in markup:", JSON.stringify(other));
console.log("  external stylesheets that cannot be inlined (CSP style-src is 'self'):", extLinks.length);
console.log("  declared actions:", KNOWN_ACTIONS.length ? KNOWN_ACTIONS.join(", ") : "(none)");
console.log("  URL assignments inside onerror strings checked:", sum(r => r.onerrorUrls), "in", files(r => r.onerrorUrls), "chapters");
const vendorPages = reports.filter(r => r.vendorLinked.length);
console.log("  chapters returning vendor stylesheet URLs:", vendorPages.length, "->", [...new Set(vendorPages.flatMap(r => r.vendorLinked))].join(", ") || "(none)");
const bySubject = new Map<string, number[]>();
for (const r of reports) bySubject.set(r.id.split("/")[0], [...(bySubject.get(r.id.split("/")[0]) ?? []), r.cssBytes]);
console.log("  inlined CSS bytes per page (min/max) by subject:");
for (const [s, v] of bySubject) console.log(`    ${s.padEnd(20)} ${Math.min(...v)} / ${Math.max(...v)}`);

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
detail("vendor stylesheet problems", r => r.vendorBad);
detail("watermark in output", r => r.watermark);
detail("relative URL in onerror", r => r.onerrorRel);

// ── the list a human must look at before this ships ──────────────────────────
const LIST_PATH = path.join(ROOT, "tools", "audit", "notes-newly-visible-images-2026-10-08.txt");
newlyVisible.sort((a, b) => a.chapter.localeCompare(b.chapter, "en", { numeric: true }) || a.url.localeCompare(b.url));
const distinctUrls = new Set(newlyVisible.map(n => n.url));
const perSubject = new Map<string, { refs: number; urls: Set<string> }>();
for (const n of newlyVisible) {
  const s = n.chapter.split("/")[0];
  const e = perSubject.get(s) ?? { refs: 0, urls: new Set<string>() };
  e.refs++; e.urls.add(n.url); perSubject.set(s, e);
}
const notImages = newlyVisible.filter(n => n.magic === "NOT-AN-IMAGE");
const header = [
  "IMAGES THAT RESOLVE TO A FILE NOW BUT WERE A BROKEN RELATIVE PATH BEFORE lib/notes-inline.ts rewrote URLs",
  "",
  "Generated by:  npx tsx tools/audit/notes-inline-check.mts   (regenerated on every run)",
  "Meaning:       the chapter's source file references the image by a RELATIVE path. Rendered inside",
  "               /cpl|/atpl/<subject>/<chapter>/notes that path resolved against the app route and 404ed;",
  "               it now resolves against the chapter's own folder, the file exists in public/, and the",
  "               page now shows it. Each of these is therefore a picture students will see that they did",
  "               not see before. Open every one. Nothing here has been looked at by the tool: it checks",
  "               that the file exists and that its first bytes are an image, not that the picture is right.",
  "",
  `Total references: ${newlyVisible.length}   distinct files: ${distinctUrls.size}   not-an-image by file header: ${notImages.length}`,
  ...[...perSubject].map(([s, e]) => `  ${s.padEnd(22)} ${String(e.refs).padStart(4)} references, ${String(e.urls.size).padStart(4)} distinct files`),
  "",
  "chapter\tkind\tsource value\tnow served at\tbytes\tfile header",
];
fs.writeFileSync(
  LIST_PATH,
  [...header, ...newlyVisible.map(n => [n.chapter, n.kind, n.raw, n.url, n.bytes, n.magic].join("\t"))].join("\n") + "\n",
  "utf-8",
);
console.log(`\nnewly visible images: ${newlyVisible.length} references / ${distinctUrls.size} distinct files (${notImages.length} not an image by header)`);
for (const [s, e] of perSubject) console.log(`  ${s.padEnd(22)} ${String(e.refs).padStart(4)} references, ${String(e.urls.size).padStart(4)} distinct files`);
console.log("  written to", path.relative(ROOT, LIST_PATH));

const failing =
  sum(r => (r.nullResult ? 1 : 0)) + sum(r => r.relAttrs.length) + sum(r => r.relCssUrls.length) +
  sum(r => r.linkNotInlined.length) + sum(r => r.onclick) + sum(r => r.unscoped.length) +
  sum(r => r.strayTags) + sum(r => r.unknownActs.length) + sum(r => r.droppedHandlers) +
  sum(r => r.vendorBad.length) + sum(r => r.watermark.length) + sum(r => r.onerrorRel.length) +
  (PAGE_LINKS_OK ? 0 : 1) + notImages.length;
console.log(failing === 0 ? "\nRESULT: all counts 0 (missing assets listed above)" : `\nRESULT: ${failing} failing item(s)`);
process.exit(failing === 0 ? 0 : 1);
