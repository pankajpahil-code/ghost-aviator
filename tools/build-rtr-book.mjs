// build-rtr-book.mjs
// Publishes Capt. Pankaj Pahil's "Complete RTR(A) Examination Book" (24 self-
// contained HTML chapters) into public/content/radio-telephony/ so the CPL
// [type] route can serve each chapter as HtmlNotes.
//
// What it does per run (idempotent):
//   1. Copies the shared assets ONCE  → _assets/{book_layout.css, images/}
//      (FontAwesome is already self-hosted under _assets/vendor/fa/.)
//   2. For each chapter_N.html:
//        • drops the Google-Fonts + cdnjs FontAwesome CDN <link>s (CSP blocks
//          external styles/fonts on /content/*) and points FA at the local copy
//        • rewrites book_layout.css + images/ refs to absolute /content paths
//          (so the file works from public/content/radio-telephony/rtf-N/)
//        • removes the book's own .nav-buttons (the site frame gives prev/next)
//        • rewrites any remaining chapter_/index cross-links to site routes
//          that break OUT of the iframe (target="_top")
//      → writes public/content/radio-telephony/rtf-N/notes.html
//
// Re-run:  node tools/build-rtr-book.mjs

import fs from "node:fs";
import path from "node:path";

const SRC = "D:/antigravity/rtr a";
const OUT = path.join(process.cwd(), "public", "content", "radio-telephony");
const ASSETS_URL = "/content/radio-telephony/_assets";
const CHAPTERS = 24;

const rmrf = (p) => fs.rmSync(p, { recursive: true, force: true });
const mkdirp = (p) => fs.mkdirSync(p, { recursive: true });

// ── 1. shared assets ───────────────────────────────────────────────────────
mkdirp(OUT);
const assetsDir = path.join(OUT, "_assets");
mkdirp(assetsDir);

// book_layout.css (verbatim — its own font-families already fall back cleanly)
fs.copyFileSync(path.join(SRC, "book_layout.css"), path.join(assetsDir, "book_layout.css"));

// images/ (54 MB, copied once and shared by all chapters)
const imgSrc = path.join(SRC, "images");
const imgOut = path.join(assetsDir, "images");
rmrf(imgOut);
fs.cpSync(imgSrc, imgOut, { recursive: true });
console.log(`images: ${fs.readdirSync(imgOut).length} files`);

// ── 2. transform each chapter ──────────────────────────────────────────────
function transform(html, n) {
  let out = html;

  // Drop the external font/icon CDN <link>s + preconnects (CSP blocks them).
  out = out
    .replace(/^\s*<link rel="preconnect"[^>]*>\s*$/gim, "")
    .replace(/^\s*<link[^>]*fonts\.googleapis\.com[^>]*>\s*$/gim, "")
    .replace(/^\s*<link[^>]*font-awesome[^>]*>\s*$/gim, "");

  // Point the book_layout.css link at the self-hosted FontAwesome + the shared
  // stylesheet, using absolute /content URLs so depth no longer matters.
  out = out.replace(
    /<link rel="stylesheet" href="book_layout\.css">/i,
    `<link rel="stylesheet" href="${ASSETS_URL}/vendor/fa/css/all.min.css">\n  ` +
    `<link rel="stylesheet" href="${ASSETS_URL}/book_layout.css">`,
  );

  // Asset references → absolute shared paths.
  out = out
    .replace(/src="images\//g, `src="${ASSETS_URL}/images/`)
    .replace(/url\(images\//g, `url(${ASSETS_URL}/images/`)
    .replace(/url\('images\//g, `url('${ASSETS_URL}/images/`)
    .replace(/url\("images\//g, `url("${ASSETS_URL}/images/`);

  // Remove the book's in-page prev/next bar (the site reader supplies its own).
  out = out.replace(/<div class="nav-buttons">[\s\S]*?<\/div>\s*/gi, "");

  // Any remaining cross-references break out of the iframe into the app route.
  out = out.replace(
    /href="chapter_(\d+)\.html"/gi,
    (_m, c) => `href="/cpl/radio-telephony/rtf-${c}/notes" target="_top"`,
  );
  out = out.replace(
    /href="(?:index|front_matter)\.html"/gi,
    `href="/cpl/radio-telephony" target="_top"`,
  );

  return out;
}

for (let n = 1; n <= CHAPTERS; n++) {
  const srcFile = path.join(SRC, `chapter_${n}.html`);
  if (!fs.existsSync(srcFile)) {
    console.warn(`!! missing ${srcFile}`);
    continue;
  }
  const html = fs.readFileSync(srcFile, "utf8");
  const outDir = path.join(OUT, `rtf-${n}`);
  mkdirp(outDir);
  fs.writeFileSync(path.join(outDir, "notes.html"), transform(html, n), "utf8");
}
console.log(`chapters: rtf-1..rtf-${CHAPTERS} written to ${OUT}`);
