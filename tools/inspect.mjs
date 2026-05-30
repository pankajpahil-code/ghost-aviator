// Dump a source PDF's extracted text to inspect its question format.
// Usage: node tools/inspect.mjs "<file.pdf>" [startChar] [len]
import { PDFParse } from "pdf-parse";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const SOURCES = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const file = process.argv[2];
const start = parseInt(process.argv[3] || "0", 10);
const len = parseInt(process.argv[4] || "2500", 10);

const buf = readFileSync(join(SOURCES, file));
const parser = new PDFParse({ data: new Uint8Array(buf), verbosity: 0 });
const r = await parser.getText();
const cache = join(SOURCES, file.replace(/\.pdf$/i, ".extracted.txt"));
writeFileSync(cache, r.text, "utf8");
console.log(`PAGES ${r.total} | LEN ${r.text.length} | cached → ${cache}`);
console.log("─".repeat(60));
console.log(r.text.slice(start, start + len));
