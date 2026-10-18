// Prevent publishing raw, missing or changed PDFs outside the prepared catalog.
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
const root = process.cwd();
const catalog = JSON.parse(readFileSync(resolve(root, "lib/generated/book-downloads.json"), "utf8"));
const audit = JSON.parse(readFileSync(resolve(root, "lib/generated/book-download-checks.json"), "utf8"));
const files = new Set(readdirSync(resolve(root, "public/downloads/books")));
let pages = 0;
for (const book of catalog) {
  const record = audit.find(r => r.slug === book.slug);
  if (!/^\/downloads\/books\/[a-z0-9-]+\.pdf$/.test(book.url)) throw Error(`Invalid PDF URL: ${book.slug}`);
  const name = book.url.split("/").at(-1);
  if (!files.delete(name)) throw Error(`Missing or duplicate PDF: ${book.slug}`);
  const data = readFileSync(resolve(root, "public" + book.url));
  const hash = createHash("sha256").update(data).digest("hex");
  if (data.subarray(0, 5).toString() !== "%PDF-" || hash !== book.sha256 || data.length !== book.bytes || data.length >= 99_000_000) throw Error(`PDF differs from prepared edition: ${book.slug}`);
  if (!record || record.sha256 !== hash || record.footerPages !== book.pages || record.watermarkPages !== book.pages || record.footerLinksPerPage < 5 || record.bookmarks !== book.bookmarks || book.bookmarks < 1 || (record.permissions & 8)) throw Error(`Preparation record missing or invalid: ${book.slug}`);
  if (record.chapterOutline.some(([, , page]) => page < 1 || page > book.pages)) throw Error(`Invalid bookmark destination: ${book.slug}`);
  pages += book.pages;
}
if ([...files].some(f => f.toLowerCase().endsWith(".pdf"))) throw Error("Unregistered book PDF: prepare every book before publishing");
console.log(`Prepared free books: ${catalog.length}; pages with watermark/footer: ${pages}; file hashes match.`);
