import fs from "node:fs";
import path from "node:path";

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

/**
 * Prefixes one selector list ("h1, .box p" -> ".ga-notes h1, .ga-notes .box p").
 * A selector that targets the document root becomes the container itself, so
 * `body { background: #f8f9fc }` still paints the chapter's paper background.
 */
function scopeSelectorList(selectors: string): string {
  return selectors
    .split(",")
    .map(sel => {
      const s = sel.trim();
      if (!s) return "";
      // The document root, in any of its spellings, IS the container.
      if (/^(html|body|:root)$/i.test(s)) return SCOPE;
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

export type InlineNotes = { css: string; html: string };

export function getInlineNotes(subjectId: string, chapterId: string): InlineNotes | null {
  try {
    const notesPath = path.join(process.cwd(), "public", "content", subjectId, chapterId, "notes.html");
    if (!fs.existsSync(notesPath)) return null;

    const raw = fs.readFileSync(notesPath, "utf-8");

    const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (!bodyMatch) return null;
    let html = bodyMatch[1];

    // Collect the chapter's own CSS, then scope it.
    const css = [...raw.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
      .map(m => m[1])
      .join("\n");

    // Scripts never come across. The only script in these files is the
    // protection snippet, which is reimplemented on the React side for the
    // in-page container (tools/_protect-snippet.mjs still covers the standalone
    // /content/ file, which remains reachable directly).
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

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

    // Figures are real files since tools/extract-notes-images.mjs; lazy-load
    // everything below the fold rather than blocking first paint on 26 PNGs.
    html = html.replace(/<img\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi, (whole, attrs: string) => {
      if (/\bloading\s*=/i.test(attrs)) return whole;
      return `<img${attrs} loading="lazy" decoding="async">`;
    });

    return { css: scopeCss(css), html: html.trim() };
  } catch (error) {
    console.error(`Failed to inline notes for ${subjectId}/${chapterId}:`, error);
    return null;
  }
}
