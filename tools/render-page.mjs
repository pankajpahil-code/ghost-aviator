// Render a page of a (scanned) PDF to PNG for visual inspection / transcription.
// Usage: node tools/render-page.mjs "<file.pdf>" <page> [outName]
import { PDFParse } from "pdf-parse";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const SOURCES = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(SOURCES, "_render");
mkdirSync(OUT, { recursive: true });

const file = process.argv[2];
const page = parseInt(process.argv[3] || "1", 10);
const outName = process.argv[4] || `${file.replace(/[^a-z0-9]/gi, "_")}_p${page}.png`;

const data = new Uint8Array(readFileSync(join(SOURCES, file)));
const parser = new PDFParse({ data, verbosity: 0 });
// NOTE: getScreenshot ignores the `pages` filter and returns every page,
// so select by page number ourselves.
const r = await parser.getScreenshot({ scale: 2.5, imageBuffer: true, imageDataUrl: false });
const pg = r.pages.find(p => (p.pageNumber ?? p.num) === page) || r.pages[page - 1];
writeFileSync(join(OUT, outName), Buffer.from(pg.data));
console.log("wrote", join(OUT, outName));
