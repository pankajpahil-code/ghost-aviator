// Extract inlined base64 images out of public/content/**/notes.html into real
// .png files alongside the chapter, and rewrite each <img src> to point at the
// extracted file.
//
// WHY THIS EXISTS
// ---------------
// The notes were generated as self-contained HTML with every figure inlined as
// a `data:image/png;base64,...` URI. Measured 2026-08-08: 39 of 234 chapters
// carry 363 such images totalling 70.4 MB, and one chapter alone
// (radio-navigation/rnav-8) is 10.09 MB of which 10.04 MB — 99.5% — is base64.
//
// That cost the site three ways:
//   1. /cpl/radio-navigation/rnav-8/notes answered **502 in production** while
//      sitting in the sitemap, because the server-rendered page inlined the
//      whole 10 MB body. rnav-9 survived only by being smaller: 8.6 MB and
//      ~10 s to first byte.
//   2. A data: URI is invisible to search engines. 363 of the Captain's
//      diagrams could never appear in Google Images, which is a real discovery
//      channel for "VOR radial diagram", "ILS glide path" and the like.
//   3. Base64 is ~33% larger than the bytes it encodes, is re-downloaded with
//      every page view, and cannot be cached, lazy-loaded or served in a
//      modern format. A real file is cached once and skipped thereafter.
//
// Identical images are written once and shared — the same figure often repeats
// across chapters of a subject, and content-hashing collapses those.
//
// Idempotent: an <img> already pointing at /content/... is left alone, so this
// is safe to re-run after a notes rebuild. Run it BEFORE tools/protect-notes.mjs.
//
// Usage:  node tools/extract-notes-images.mjs [--dry]

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "public", "content");
const DRY = process.argv.includes("--dry");

// data:image/<type>;base64,<payload>  — captured inside an src="" or src=''.
const DATA_URI = /(<img\b[^>]*?\ssrc\s*=\s*)(["'])(data:image\/([a-z+]+);base64,([A-Za-z0-9+/=\s]+?))\2/gi;

let files = 0, rewritten = 0, extracted = 0, reused = 0, bytesBefore = 0, bytesAfter = 0;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name === "notes.html") out.push(p);
  }
  return out;
}

for (const file of walk(CONTENT)) {
  files++;
  const html = readFileSync(file, "utf8");
  const before = Buffer.byteLength(html);
  bytesBefore += before;

  if (!DATA_URI.test(html)) { bytesAfter += before; continue; }
  DATA_URI.lastIndex = 0;

  // public/content/<subject>/<chapter>/notes.html  ->  .../img/
  const chapterDir = dirname(file);
  const imgDir = join(chapterDir, "img");
  // URL path the browser will request, e.g. /content/radio-navigation/rnav-8/img
  const urlBase = "/" + relative(join(ROOT, "public"), imgDir).split(/[\\/]/).join("/");

  let n = 0;
  const out = html.replace(DATA_URI, (whole, prefix, quote, _uri, ext, payload) => {
    n++;
    // Whitespace inside a data: URI is legal and some generators wrap it.
    const clean = payload.replace(/\s+/g, "");
    let buf;
    try {
      buf = Buffer.from(clean, "base64");
    } catch {
      return whole; // not decodable — leave the original alone rather than break the figure
    }
    if (buf.length === 0) return whole;

    // Content-hash the bytes, not the position: the same diagram reused in
    // three chapters becomes one file on disk and one download for the student.
    const hash = createHash("sha1").update(buf).digest("hex").slice(0, 16);
    const name = `fig-${hash}.${ext === "jpeg" ? "jpg" : ext}`;
    const dest = join(imgDir, name);

    if (existsSync(dest)) {
      reused++;
    } else if (!DRY) {
      mkdirSync(imgDir, { recursive: true });
      writeFileSync(dest, buf);
      extracted++;
    } else {
      extracted++;
    }
    return `${prefix}${quote}${urlBase}/${name}${quote}`;
  });

  if (out !== html) {
    rewritten++;
    bytesAfter += Buffer.byteLength(out);
    if (!DRY) writeFileSync(file, out, "utf8");
    const mb = (b) => (b / 1048576).toFixed(2) + "MB";
    console.log(`  ${relative(CONTENT, file).padEnd(46)} ${n} images  ${mb(before)} -> ${mb(Buffer.byteLength(out))}`);
  } else {
    bytesAfter += before;
  }
}

const mb = (b) => (b / 1048576).toFixed(1) + "MB";
console.log(`\n${DRY ? "[dry run] " : ""}${rewritten}/${files} notes files rewritten`);
console.log(`images written: ${extracted}   deduped (already on disk): ${reused}`);
console.log(`notes HTML total: ${mb(bytesBefore)} -> ${mb(bytesAfter)}`);
