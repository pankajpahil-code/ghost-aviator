import fs from "node:fs";
import path from "node:path";
// Pure data with no imports of its own (next.config.ts reads it for the same
// reason), so this stays a server-only module with no path to the question bank.
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "./subjects";
import WITHHELD_FIGURES from "./notes-withheld-figures.json";

/**
 * Reads a chapter's notes.html and returns it as an in-page fragment: the body
 * markup plus its own stylesheet, rewritten so it cannot collide with the app.
 *
 * WHY THIS REPLACED THE IFRAME
 * ----------------------------
 * The notes used to render inside a same-origin <iframe> pointing at
 * /content/<subject>/<chapter>/notes.html, and the page separately dumped the
 * whole chapter into a visually-hidden `<article className="sr-only">` so that
 * search engines had something to read. That arrangement failed three ways at
 * once:
 *
 *   1. Content inside an iframe is attributed to the iframe's URL, not the
 *      page's. /content/ is `X-Robots-Tag: noindex` and disallowed in
 *      robots.txt, so the chapter text earned the notes route nothing.
 *   2. The sr-only copy was ~2,500 words per page of text served to crawlers
 *      but reachable by no user — the pattern Google's spam policy calls
 *      hidden text, and the same mistake this codebase already shipped once
 *      (see the SEO rules in CLAUDE.md).
 *   3. It defeated its own purpose: robots.txt closed /content/ to stop AI
 *      crawlers taking the notes, while the identical text sat in the crawlable
 *      notes route for anyone who asked.
 *
 * Rendering the notes visibly, once, in the page itself fixes all three. The
 * Captain chose this deliberately on 2026-08-08: the notes are open.
 *
 * CSS SCOPING
 * -----------
 * The 234 chapters carry ~130 distinct stylesheets, hand-varied per chapter and
 * up to 30 KB each, written for a standalone document — so they style bare
 * `body`, `h1`, `table`, `p`. Dropped into the app as-is they would fight the
 * site's own styles in both directions. Every selector is therefore prefixed
 * with `.ga-notes`, which both confines the notes' rules to their container and
 * — usefully — raises their specificity above Tailwind's element-level preflight,
 * so the chapter renders as its author intended.
 */

const SCOPE = ".ga-notes";

/** Rules that must not be prefixed, and rules we drop outright. */
const PASSTHROUGH_AT = /^@(keyframes|-webkit-keyframes|font-face|counter-style|property)\b/i;
const NESTED_AT = /^@(media|supports|layer|container)\b/i;
const DROP_AT = /^@(import|page|charset|namespace)\b/i;

/** Classes a chapter's script toggles on <body>; they live on the container now. */
const BODY_STATE_CLASS = /^\.(?:self-test-mode)(?![\w-])/;

/**
 * Splits a selector list on the commas that separate selectors, not the ones
 * inside `:is(a, b)` / `:not(.x, .y)` / `[attr="a,b"]`. A plain split(",") cuts
 * those in half and prefixes the second half separately, which silently changes
 * what the rule matches.
 */
function splitTopLevelCommas(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let cur = "";
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    if (quote) {
      cur += c;
      if (c === "\\") { cur += list[++i] ?? ""; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; cur += c; continue; }
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth = Math.max(0, depth - 1);
    if (c === "," && depth === 0) { parts.push(cur); cur = ""; continue; }
    cur += c;
  }
  parts.push(cur);
  return parts;
}

/**
 * Prefixes one selector list ("h1, .box p" -> ".ga-notes h1, .ga-notes .box p").
 * A selector that targets the document root becomes the container itself, so
 * `body { background: #f8f9fc }` still paints the chapter's paper background.
 */
function scopeSelectorList(selectors: string): string {
  return splitTopLevelCommas(selectors)
    .map(sel => {
      const s = sel.trim();
      if (!s) return "";
      // The document root, in any of its spellings, IS the container.
      if (/^(html|body|:root)$/i.test(s)) return SCOPE;
      // "body.foo .bar" / "body[data-x]" — a state class or attribute on the
      // root. The container stands in for <body>, so the state lives on it.
      const rootCompound = s.match(/^(?:html|body)(?=[.[])/i);
      if (rootCompound) return `${SCOPE}${s.slice(rootCompound[0].length)}`;
      // ".self-test-mode .x" — a class the chapter's own script toggles on
      // <body>. The handler now toggles it on the container (see
      // HtmlNotesPage), so the rule has to be anchored there, not to a
      // descendant: ".ga-notes .self-test-mode" could never match.
      if (BODY_STATE_CLASS.test(s)) return `${SCOPE}${s}`;
      // "body .foo" / "html > .foo" — strip the root, keep the rest.
      const rooted = s.replace(/^(html|body|:root)\s*([>+~\s])\s*/i, "");
      if (rooted !== s) return `${SCOPE} ${rooted}`;
      // A bare universal selector must cover the container and its descendants.
      if (s === "*") return `${SCOPE}, ${SCOPE} *`;
      return `${SCOPE} ${s}`;
    })
    .filter(Boolean)
    .join(", ");
}

/**
 * Minimal CSS block walker. Not a full parser — it only needs to find the
 * boundary between a selector/at-rule prelude and its `{ ... }` block, which
 * brace counting handles correctly for the generated stylesheets here. Strings
 * and comments are skipped so a `{` inside content:"{" cannot desync it.
 */
function scopeCss(css: string): string {
  let out = "";
  let i = 0;
  const n = css.length;

  while (i < n) {
    // Comments are dropped rather than carried through.
    if (css.startsWith("/*", i)) {
      const end = css.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (/\s/.test(css[i])) { i++; continue; }

    // Read the prelude up to '{' or ';' (a statement at-rule such as @import).
    let j = i;
    let quote: string | null = null;
    while (j < n) {
      const c = css[j];
      if (quote) {
        if (c === "\\") { j += 2; continue; }
        if (c === quote) quote = null;
      } else if (c === '"' || c === "'") {
        quote = c;
      } else if (c === "{" || c === ";") {
        break;
      }
      j++;
    }

    const prelude = css.slice(i, j).trim();

    if (j >= n) { i = n; break; }

    if (css[j] === ";") {
      // Statement at-rule. Keep nothing we cannot scope or trust.
      if (!DROP_AT.test(prelude) && prelude.startsWith("@")) out += prelude + ";\n";
      i = j + 1;
      continue;
    }

    // Block rule — find its matching close brace.
    let depth = 0;
    let k = j;
    quote = null;
    for (; k < n; k++) {
      const c = css[k];
      if (quote) {
        if (c === "\\") { k++; continue; }
        if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'") { quote = c; continue; }
      if (css.startsWith("/*", k)) { const e = css.indexOf("*/", k + 2); k = e === -1 ? n : e + 1; continue; }
      if (c === "{") depth++;
      else if (c === "}") { depth--; if (depth === 0) break; }
    }
    const body = css.slice(j + 1, k);
    i = k + 1;

    if (DROP_AT.test(prelude)) continue;                 // @page/@import — print & external, both unwanted
    if (PASSTHROUGH_AT.test(prelude)) {                  // @keyframes — its "selectors" are 0%/to, not elements
      out += `${prelude}{${body}}\n`;
      continue;
    }
    if (NESTED_AT.test(prelude)) {                       // @media/@supports — scope what's inside
      out += `${prelude}{\n${scopeCss(body)}}\n`;
      continue;
    }
    out += `${scopeSelectorList(prelude)}{${body}}\n`;
  }

  return out;
}

/**
 * Remove the chapter's `<div class="cover">…</div>` block, nested divs and all.
 *
 * Walks forward from the opening tag counting `<div` against `</div>` until the
 * depth returns to zero, which is the only way to find the real end of a block
 * that contains other blocks. If the depth never closes the markup is already
 * broken, so nothing is removed — leaving a cover visible is a cosmetic fault,
 * while deleting to the end of the document is a destroyed chapter.
 */
function removeCoverBlock(html: string): string {
  // The class must be the exact token `cover`. A word-boundary test is NOT
  // enough: `-` is a boundary in regex, so /\bcover\b/ also matches
  // `cover-page`, `cover-header`, `cover-part`… Those are ordinary content
  // blocks inside the chapter, and matching one would delete it and everything
  // nested in it. Nine chapters (rnav-1..7, ar-7, ar-13) sat behind that
  // difference. Split the attribute into tokens and compare.
  const openTag = /<div\b[^>]*?\bclass\s*=\s*["']([^"']*)["'][^>]*>/gi;
  let open: RegExpExecArray | null = null;
  for (let m = openTag.exec(html); m; m = openTag.exec(html)) {
    if (m[1].trim().split(/\s+/).includes("cover")) { open = m; break; }
  }
  if (!open) return html;

  const start = open.index;
  const tag = /<(\/?)div\b[^>]*>/gi;
  tag.lastIndex = start + open[0].length;

  let depth = 1;
  let m: RegExpExecArray | null;
  while ((m = tag.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(0, start) + html.slice(m.index + m[0].length);
  }
  return html;                       // unbalanced source — leave it alone
}

// ── Relative URLs ────────────────────────────────────────────────────────────
//
// The chapter files were authored as standalone documents at
// /content/<subject>/<chapter>/notes.html, so `figs/a.png`, `../_assets/x.webp`
// and `../hpl-2/notes.html` all resolve against THAT folder. Rendered inside
// /cpl|/atpl/<subject>/<chapter>/notes the same strings resolve against the app
// route and 404 (387 <img> in 64 chapters, measured 2026-10-08). Every relative
// URL is therefore resolved here, once, against the chapter's own folder.

/** Only used so URL() has something to resolve against; never emitted. */
const RESOLVE_ORIGIN = "https://notes.invalid";
const PUBLIC_DIR = path.join(process.cwd(), "public");

/** Anything with a scheme, a leading slash (incl. "//host") or "#" is not relative. */
function isRelativeUrl(value: string): boolean {
  const v = value.trim();
  return v !== "" && !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(v);
}

function resolveAgainst(value: string, basePath: string): URL {
  return new URL(value.trim(), RESOLVE_ORIGIN + basePath);
}

/** subjectId -> its track and chapter ids, so a cross-chapter link lands on a real route. */
const ROUTE_INDEX: Map<string, { track: "cpl" | "atpl"; chapters: Set<string> }> = new Map();
for (const [track, list] of [["cpl", CPL_SUBJECTS], ["atpl", ATPL_SUBJECTS]] as const) {
  for (const s of list) ROUTE_INDEX.set(s.id, { track, chapters: new Set(s.chapters.map(c => c.id)) });
}

/**
 * `/content/<s>/<c>/notes.html` is the raw standalone file, which is redirected
 * (next.config.ts) and never meant to be linked. A link to it means "go to that
 * chapter's notes", so point at the real route on the right track instead.
 * A chapter the subject does not list falls back to the subject's index.
 */
function notesRouteFor(resolved: URL): string | null {
  const m = resolved.pathname.match(/^\/content\/([^/]+)\/([^/]+)\/notes\.html$/);
  if (!m) return null;
  const entry = ROUTE_INDEX.get(m[1]);
  if (!entry) return null;
  const base = `/${entry.track}/${m[1]}`;
  return (entry.chapters.has(m[2]) ? `${base}/${m[2]}/notes` : base) + resolved.hash;
}

function rewriteUrlValue(value: string, basePath: string, isLink: boolean): string {
  if (!isRelativeUrl(value)) return value;
  const resolved = resolveAgainst(value, basePath);
  if (isLink) {
    const route = notesRouteFor(resolved);
    if (route) return route;
  }
  return resolved.pathname + resolved.search + resolved.hash;
}

/** url(...) inside CSS, resolved against the stylesheet's own location. */
const CSS_URL_RE = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s"']*))\s*\)/gi;
function rewriteCssUrls(css: string, basePath: string): string {
  return css.replace(CSS_URL_RE, (whole, dq?: string, sq?: string, bare?: string) => {
    const value = dq ?? sq ?? bare ?? "";
    if (!isRelativeUrl(value)) return whole;
    const r = resolveAgainst(value, basePath);
    return `url("${r.pathname}${r.search}${r.hash}")`;
  });
}

// ── Linked stylesheets ───────────────────────────────────────────────────────
//
// The 28 Human Performance chapters link ../_assets/hf_book.css and the 24
// RTR(A) chapters link book_layout.css and the bundled Font Awesome. Those
// <link>s sit in <head>, which is discarded, so the chapters rendered without
// their layout or their icon font. A chapter-authored sheet is read from disk
// and goes through exactly the same scoping as an inline <style>. A vendor sheet
// (Font Awesome) is NOT copied into the page: it comes back as a same-origin
// URL for HtmlNotesPage to <link>. An external sheet (Google Fonts) can be
// neither, and the site's CSP (style-src 'self' 'unsafe-inline') would refuse
// it anyway, so those are left out as before.

const TAG_ATTR_RE = /([^\s"'<>/=]+)(?:(\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s"'<>=`]+)))?/g;

function tagAttr(tag: string, name: string): string | null {
  const attrs = tag.replace(/^<[a-zA-Z][\w:-]*/, "");
  for (const m of attrs.matchAll(TAG_ATTR_RE)) {
    if (m[1].toLowerCase() === name) return m[3] ?? m[4] ?? m[5] ?? "";
  }
  return null;
}

/**
 * A vendor sheet is a third-party library the chapter bundles under
 * `/content/<subject>/_assets/vendor/` (Font Awesome today, 102 KB). Inlining
 * it would copy it into every page that uses it (24 radio-telephony pages), so
 * it is handed back as a URL for the page to <link> instead. Only same-origin
 * paths under /content/ qualify: the CSP is style-src 'self', and a vendor
 * sheet is never allowed to point anywhere the site does not already serve.
 */
const VENDOR_SHEET_RE = /^\/content\/[^/]+\/_assets\/vendor\/.+\.css$/i;

type LinkedSheet = { kind: "inline"; css: string } | { kind: "vendor"; url: string } | null;

function readLinkedSheet(href: string, basePath: string): LinkedSheet {
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(href.trim())) return null; // external
  const resolved = resolveAgainst(href, basePath);
  let rel: string;
  try { rel = decodeURIComponent(resolved.pathname); } catch { return null; }
  const file = path.join(PUBLIC_DIR, rel);
  // Stay inside public/: a stylesheet href must never read an arbitrary file.
  if (!file.startsWith(PUBLIC_DIR + path.sep) || !/\.css$/i.test(file)) return null;
  try {
    if (VENDOR_SHEET_RE.test(rel)) {
      // Only advertise a sheet that exists: a <link> to a 404 is a wasted request.
      if (!fs.statSync(file).isFile()) return null;
      return { kind: "vendor", url: resolved.pathname };
    }
    return { kind: "inline", css: rewriteCssUrls(fs.readFileSync(file, "utf-8"), resolved.pathname) };
  } catch (error) {
    console.error(`Linked stylesheet ${href} for ${basePath} could not be read:`, error);
    return null;
  }
}

/**
 * The chapter's CSS in document order — chapter-authored linked sheets and
 * <style> blocks, cascade preserved — plus the vendor sheets to <link> rather
 * than inline.
 */
function collectCss(raw: string, basePath: string): { css: string; vendor: string[] } {
  const parts: string[] = [];
  const vendor: string[] = [];
  for (const m of raw.matchAll(/<link\b[^>]*>|<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    if (m[1] !== undefined) { parts.push(rewriteCssUrls(m[1], basePath)); continue; }
    const rel = tagAttr(m[0], "rel");
    const href = tagAttr(m[0], "href");
    if (!href || !rel || !/\bstylesheet\b/i.test(rel)) continue;
    const sheet = readLinkedSheet(href, basePath);
    if (!sheet) continue;
    if (sheet.kind === "inline") parts.push(sheet.css);
    else if (!vendor.includes(sheet.url)) vendor.push(sheet.url);
  }
  return { css: parts.join("\n"), vendor };
}

// ── The owner's name is not on the public pages ──────────────────────────────
//
// hf_book.css (every Human Performance chapter) tiles an image of the author's
// personal name across the page background: `body{background-image:
// url(images/watermark-tile.webp)}`, and again inside @media print. The owner
// has ordered his name off the public site, and the site already draws its own
// brand watermark. Every declaration that references that tile is dropped from
// the inlined CSS, and the chapters' own `.cpp-watermark` element (a fixed,
// full-page diagonal overlay from the same stylesheet) is removed from the
// markup. tools/audit/notes-inline-check.mts fails if "watermark-tile" or a
// .cpp-watermark element survives in any chapter's output.
const WATERMARK_TILE_DECL = /[^;{}]*watermark-tile[^;{}]*(?:;|(?=\}))/gi;
const CPP_WATERMARK_ELEMENT =
  /<div\b[^>]*\bclass\s*=\s*["'][^"']*\bcpp-watermark\b[^"']*["'][^>]*>[^<]*<\/div>/gi;
/** Backstop for a .cpp-watermark the leaf-element regex above cannot match. */
const HIDE_CHAPTER_WATERMARK = "\n.ga-notes .cpp-watermark { display: none !important; }\n";

// ── Inline handlers ──────────────────────────────────────────────────────────
//
// Scripts never cross over, but 43 chapters call functions that are defined
// ONLY in those scripts, from onclick/oninput attributes: Show Answer (24 RTR(A)
// + 12 Radio Navigation chapters), the option-check buttons, Reveal/Hide All
// (Air Navigation and Radio Navigation) and the Nav-1 calculators. Left alone,
// every one throws ReferenceError and the answers stay hidden behind CSS.
//
// Each known call is turned into a data-ga-act attribute and the handler is
// removed. HtmlNotesPage owns the behaviour (one delegated listener on the
// container), so no chapter script ever runs. A handler this table does not
// recognise is dropped, not kept: it could only throw. It is logged, and
// tools/audit/notes-inline-check.mts counts it, so it cannot go unnoticed.

export const NOTE_ACTIONS = [
  "toggle-answer-id",    // toggleAnswer(7)          Radio Navigation: #ans_7 / #btn_7
  "toggle-answer-next",  // toggleAnswer(this)       RTR(A): the sibling after the button
  "check-answer",        // checkAnswer(this, true)  RTR(A): mark one <li> correct/incorrect
  "reveal-value",        // revealValue(this)        RTR(A) self-test: un-blur one value
  "self-test-mode",      // toggleSelfTestMode()     RTR(A) ch.23: blur / reveal all values
  "show-all",            // showAll()                Radio Navigation ch.19
  "hide-all",            // hideAll()                Radio Navigation ch.19
  "set-all-details",     // setAllAnswers(true)      Air Navigation: open/close every <details>
  "calc-chlong",         // calcChLong()             Air Navigation ch.1 calculator
  "calc-recip",          // oninput calcRecip(...)   Air Navigation ch.1 bearing slider
  "show-lat",            // oninput showLat(...)     Air Navigation ch.1 latitude slider
] as const;
export type NoteAction = (typeof NOTE_ACTIONS)[number];

const HANDLER_PATTERNS: { attr: "onclick" | "oninput"; re: RegExp; act: NoteAction; argGroup?: number }[] = [
  { attr: "onclick", re: /^toggleAnswer\(\s*(\d+)\s*\)$/, act: "toggle-answer-id", argGroup: 1 },
  { attr: "onclick", re: /^toggleAnswer\(\s*this\s*\)$/, act: "toggle-answer-next" },
  { attr: "onclick", re: /^checkAnswer\(\s*this\s*,\s*(true|false)\s*\)$/, act: "check-answer", argGroup: 1 },
  { attr: "onclick", re: /^revealValue\(\s*this\s*\)$/, act: "reveal-value" },
  { attr: "onclick", re: /^toggleSelfTestMode\(\s*\)$/, act: "self-test-mode" },
  { attr: "onclick", re: /^showAll\(\s*\)$/, act: "show-all" },
  { attr: "onclick", re: /^hideAll\(\s*\)$/, act: "hide-all" },
  { attr: "onclick", re: /^setAllAnswers\(\s*(true|false)\s*\)$/, act: "set-all-details", argGroup: 1 },
  { attr: "onclick", re: /^calcChLong\(\s*\)$/, act: "calc-chlong" },
  { attr: "oninput", re: /^calcRecip\(\s*this\.value\s*\)$/, act: "calc-recip" },
  { attr: "oninput", re: /^showLat\(\s*this\.value\s*\)$/, act: "show-lat" },
];

// ── URLs assigned inside an inline error handler ─────────────────────────────
//
// hpl-1 carries onerror="if(!this.dataset.f){this.dataset.f=1;
// this.src='../_assets/images/x.webp';}else{...}" — a relative fallback URL
// inside a JavaScript string, which resolves against the app route like any
// other relative URL and 404s. The handler is left as authored; only the URL in
// the string is made absolute. (The other 107 onerror handlers assign no URL.)
const JS_URL_ASSIGN_RE = /(\.(?:src|href|srcset|poster)\s*=\s*)(?:'([^']*)'|"([^"]*)")/gi;

function rewriteHandlerUrls(code: string, basePath: string): string {
  return code.replace(JS_URL_ASSIGN_RE, (whole, pre: string, sq?: string, dq?: string) => {
    const value = sq ?? dq ?? "";
    if (!isRelativeUrl(value)) return whole;
    const q = sq !== undefined ? "'" : '"';
    return `${pre}${q}${rewriteUrlValue(value, basePath, false)}${q}`;
  });
}

// ── One pass over every tag ──────────────────────────────────────────────────

const TAG_RE = /<([a-zA-Z][\w:-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

function transformTags(html: string, basePath: string): string {
  return html.replace(TAG_RE, (whole, name: string, attrs: string) => {
    const lower = name.toLowerCase();
    let act: { act: NoteAction; arg?: string } | null = null;
    let changed = false;

    const next = attrs.replace(
      TAG_ATTR_RE,
      (attr: string, an: string, eq: string | undefined, dq?: string, sq?: string, bare?: string) => {
        const key = an.toLowerCase();
        const value = dq ?? sq ?? bare;
        if (value === undefined) return attr;
        const quote = dq !== undefined ? '"' : sq !== undefined ? "'" : '"';

        if (key === "src" || key === "href" || key === "poster" || key === "xlink:href") {
          if (!isRelativeUrl(value)) return attr;
          changed = true;
          return `${an}${eq}${quote}${rewriteUrlValue(value, basePath, lower === "a" && key === "href")}${quote}`;
        }
        if (key === "srcset") {
          const out = value.split(",").map(part => {
            const t = part.trim();
            if (!t) return t;
            const [u, ...rest] = t.split(/\s+/);
            return [rewriteUrlValue(u, basePath, false), ...rest].join(" ");
          }).join(", ");
          if (out === value) return attr;
          changed = true;
          return `${an}${eq}${quote}${out}${quote}`;
        }
        if (key === "onerror") {
          const out = rewriteHandlerUrls(value, basePath);
          if (out === value) return attr;
          changed = true;
          return `${an}${eq}${quote}${out}${quote}`;
        }
        if (key === "onclick" || key === "oninput") {
          changed = true;
          const code = value.trim().replace(/;$/, "").trim();
          for (const p of HANDLER_PATTERNS) {
            if (p.attr !== key) continue;
            const m = code.match(p.re);
            if (!m) continue;
            if (!act) act = { act: p.act, arg: p.argGroup ? m[p.argGroup] : undefined };
            return "";
          }
          console.warn(`[notes-inline] ${basePath}: dropped unrecognised ${key}="${code.slice(0, 60)}"`);
          return "";
        }
        return attr;
      },
    );

    if (!changed) return whole;
    const found = act as { act: NoteAction; arg?: string } | null;
    const added = found
      ? ` data-ga-act="${found.act}"${found.arg !== undefined ? ` data-ga-arg="${found.arg}"` : ""}`
      : "";
    const tail = next.match(/\s*\/?\s*$/)?.[0] ?? "";
    return `<${name}${next.slice(0, next.length - tail.length)}${added}${tail}>`;
  });
}

/**
 * css         the chapter's own CSS, scoped to `.ga-notes`, to be inlined.
 * html        the chapter body.
 * stylesheets same-origin vendor sheets (absolute URLs under /content/) that the
 *             page links instead of inlining; see VENDOR_SHEET_RE.
 */
export type InlineNotes = { css: string; html: string; stylesheets: string[] };

// ─── Figures that must not render ───────────────────────────────────────────
//
// Until relative URLs were resolved, a chapter's own figures were broken links
// in the page, so nobody had to ask whether each picture was fit to publish.
// Looked at one by one (2026-10-09), some are not: a book cover, an answer-key
// grid, a picture carrying a signature or a "courtesy" line, a crop cut off
// mid-label, and a run of pictures that do not show what their caption says.
// Those are listed in notes-withheld-figures.json and the whole <figure> is
// left out, caption included: a caption under no picture, or under the wrong
// one, teaches nothing. A figure whose file is not on disk goes the same way.
//
// The captions also carried a page reference into the book the figure was
// traced from ("source p.171"). That is attribution of the teaching to someone
// else's book and says nothing a student can use; it is removed from every
// caption. The "pending generation" placeholder some chapters keep beside an
// image is production scaffolding and never belongs in the page.
const WITHHELD = new Set(Object.keys(WITHHELD_FIGURES.withheld));
const FIGURE_RE = /<figure\b[^>]*>[\s\S]*?<\/figure>/gi;
const IMG_SRC_RE = /<img\b[^>]*?\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const FIG_PENDING_RE = /<div\b[^>]*\bclass\s*=\s*["'][^"']*\bfig-pending\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi;
const SOURCE_PAGE_RE = /\s*[([]?\s*\bsources?\s+pp?\.\s*\d+(?:\s*[–-]\s*\d+)?\s*[)\]]?\.?/gi;

function withholdFigures(html: string, basePath: string): string {
  const kept = html.replace(FIGURE_RE, figure => {
    for (const m of figure.matchAll(IMG_SRC_RE)) {
      const src = m[1] ?? m[2] ?? "";
      if (!isRelativeUrl(src)) continue;
      const served = decodeURIComponent(resolveAgainst(src, basePath).pathname);
      if (WITHHELD.has(served) || !fs.existsSync(path.join(PUBLIC_DIR, served))) return "";
    }
    return figure.replace(/(<figcaption\b[^>]*>)([\s\S]*?)(<\/figcaption>)/gi,
      (_all, open: string, text: string, close: string) => open + text.replace(SOURCE_PAGE_RE, "").trim() + close);
  });
  return kept.replace(FIG_PENDING_RE, "");
}

export function getInlineNotes(subjectId: string, chapterId: string): InlineNotes | null {
  try {
    const notesPath = path.join(process.cwd(), "public", "content", subjectId, chapterId, "notes.html");
    if (!fs.existsSync(notesPath)) return null;

    const raw = fs.readFileSync(notesPath, "utf-8");

    const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (!bodyMatch) return null;
    let html = bodyMatch[1];

    // The URL every relative reference in this file resolves against.
    const basePath = `/content/${subjectId}/${chapterId}/notes.html`;

    // Collect the chapter's own CSS (linked sheets and <style> blocks, in
    // document order), then scope it.
    const { css, vendor } = collectCss(raw, basePath);

    // Scripts never come across. Most of these files carry only the protection
    // snippet, which is reimplemented on the React side for the in-page
    // container (tools/_protect-snippet.mjs still covers the standalone
    // /content/ file, which remains reachable directly). The 44 files whose own
    // script powers a button are handled by NOTE_ACTIONS below.
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
    // A <link rel=stylesheet> in the body would load UNSCOPED; its CSS was
    // already collected above.
    html = html.replace(/<link\b[^>]*>/gi, "");
    html = html.replace(CPP_WATERMARK_ELEMENT, "");
    html = withholdFigures(html, basePath);

    // The chapter's cover block repeats the title/author the page header
    // already shows as its <h1>; leaving it in would give the page two
    // competing top headings.
    //
    // THIS USED TO BE `replace(/<div class="cover"[\s\S]*?<\/div>/i, "")` AND
    // IT BROKE 123 OF 234 CHAPTERS. A cover is not a leaf — it holds a title
    // div, an author div, and so on — so the lazy `*?` stopped at the FIRST
    // inner `</div>` and deleted only part of the block. What survived was the
    // cover's own trailing `</div>` with nothing left to close: one orphaned
    // tag at the top of every affected chapter.
    //
    // That single tag closed the React container it was injected into, so the
    // browser hoisted the key-facts section and everything after it OUT of that
    // container. The server HTML therefore parsed into a different shape from
    // the tree React expected, and every one of those pages threw React #418
    // ("Hydration failed...") and re-rendered the subtree on the client.
    // Nesting cannot be matched with a regex — count the depth instead.
    html = removeCoverBlock(html);

    // Demote the chapter's own <h1> to <h2>. These files were authored as
    // standalone documents, so each opens with an <h1> repeating its title —
    // met-1 rendered "Atmosphere" (page header) then "ATMOSPHERE" (notes), and
    // rnav-8 "VOR" then "Chapter 8: VOR VHF Omnidirectional Range". Two h1s on
    // one page split the signal about what the page is about. The page header
    // keeps the h1 because it is consistent across every chapter route and
    // carries the subject and exam context; the chapter's title becomes the
    // first section heading beneath it.
    html = html.replace(/<(\/?)h1(\s|>)/gi, "<$1h2$2");

    // Relative URLs -> absolute paths under /content/<subject>/<chapter>/, links
    // to a sibling chapter's notes.html -> that chapter's route, and the inline
    // handlers whose functions lived in the stripped scripts -> data-ga-act.
    html = transformTags(html, basePath);

    // Figures are real files since tools/extract-notes-images.mjs; lazy-load
    // everything below the fold rather than blocking first paint on 26 PNGs.
    html = html.replace(/<img\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi, (whole, attrs: string) => {
      if (/\bloading\s*=/i.test(attrs)) return whole;
      return `<img${attrs} loading="lazy" decoding="async">`;
    });

    // Scoped first (scopeCss also drops comments), then the watermark tile.
    const scoped = scopeCss(css).replace(WATERMARK_TILE_DECL, "");
    return { css: scoped + HIDE_CHAPTER_WATERMARK, html: html.trim(), stylesheets: vendor };
  } catch (error) {
    console.error(`Failed to inline notes for ${subjectId}/${chapterId}:`, error);
    return null;
  }
}
