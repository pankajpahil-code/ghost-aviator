// Sums the files each server route traces (.next/server/app/**/*.nft.json) and fails when a route
// would exceed Vercel's 250 MB uncompressed function limit. A local `next build` passes regardless
// of this size; the deploy does not. Run after `npm run build`:  node tools/audit/function-size.mjs
//
// Why it exists: on 2026-10-09 lib/notes-inline.ts joined a runtime value onto the public folder
// (path.join(PUBLIC_DIR, x)). The tracer cannot know which file that is, so it packed all of
// public/ (661 MB) into every chapter route and the production deploy failed at 687 MB.
import fs from "node:fs";
import path from "node:path";

const LIMIT_MB = 250;
const WARN_MB = 150;
const root = path.join(process.cwd(), ".next", "server", "app");
if (!fs.existsSync(root)) {
  console.error("no .next/server/app: run `npm run build` first");
  process.exit(2);
}

const sizeOf = new Map();
function bytes(file) {
  if (!sizeOf.has(file)) {
    let n = 0;
    try { const st = fs.statSync(file); n = st.isFile() ? st.size : 0; } catch { n = 0; }
    sizeOf.set(file, n);
  }
  return sizeOf.get(file);
}

const rows = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".nft.json")) {
      const files = JSON.parse(fs.readFileSync(p, "utf8")).files ?? [];
      let total = 0, pub = 0;
      for (const f of files) {
        const abs = path.resolve(dir, f);
        const b = bytes(abs);
        total += b;
        if (abs.includes(path.sep + "public" + path.sep)) pub += b;
      }
      rows.push({ route: path.relative(root, p).replace(/\\/g, "/").replace(/\.nft\.json$/, ""), mb: total / 1048576, pubMb: pub / 1048576, files: files.length });
    }
  }
})(root);

rows.sort((a, b) => b.mb - a.mb);
console.log("largest traced routes (MB total / MB from public / files):");
for (const r of rows.slice(0, 8)) console.log(`  ${r.mb.toFixed(1).padStart(7)} ${r.pubMb.toFixed(1).padStart(7)} ${String(r.files).padStart(6)}  ${r.route}`);
const over = rows.filter(r => r.mb > LIMIT_MB);
const near = rows.filter(r => r.mb > WARN_MB && r.mb <= LIMIT_MB);
console.log(`${rows.length} traced routes; over ${LIMIT_MB} MB: ${over.length}; over ${WARN_MB} MB: ${near.length}`);
process.exit(over.length ? 1 : 0);
