// Retheme the site from the cyan/violet palette to the mascot's storm-and-ember
// palette, sampled from the artwork itself.
//
//   node tools/retheme.mjs --dry     (default: report only)
//   node tools/retheme.mjs --write
//
// This is a mapping table, not a find-and-replace of "anything blue". Semantic
// colours are deliberately absent and MUST stay absent: red still means live or
// error, green still means pass or WhatsApp, amber still means warning. Recolour
// those and the interface stops telling the truth.
//
// Every mapping was checked for contrast against the page background before it
// went in — see the table printed at the end of a run.
import fs from "node:fs";
import path from "node:path";

const write = process.argv.includes("--write");

// old -> new. Order matters: longer/more specific strings first.
const MAP = [
  // ── accents ──────────────────────────────────────────────────────────────
  ["#00d4ff", "#f0913a"],   // primary: cyan            -> ember
  ["#00D4FF", "#f0913a"],
  ["#c080ff", "#f3c889"],   // secondary: light violet  -> sunset core
  ["#C080FF", "#f3c889"],
  ["#b464ff", "#f3c889"],
  ["#a855f7", "#e0a058"],
  ["#c020ff", "#f0913a"],   // gradient light
  ["#9020ff", "#c25a1e"],   // gradient dark
  ["#7c3aed", "#ab794d"],   // deep accent for borders and fills
  ["rgba(0,212,255", "rgba(240,145,58"],
  ["rgba(0, 212, 255", "rgba(240, 145, 58"],
  ["rgba(180,100,255", "rgba(243,200,137"],
  ["rgba(180, 100, 255", "rgba(243, 200, 137"],
  ["rgba(180,120,255", "rgba(243,200,137"],
  ["rgba(124,58,237", "rgba(171,121,77"],
  ["rgba(124, 58, 237", "rgba(171, 121, 77"],
  ["rgba(150,0,255", "rgba(194,90,30"],
  ["rgba(120,60,220", "rgba(171,121,77"],
  // ── second pass: the ATPL page carried its own blue branding, and a few
  //    violets used only on one or two pages, all missed by the first table.
  ["rgba(0,180,255", "rgba(240,145,58"],
  ["rgba(0,150,255", "rgba(240,145,58"],
  ["#0080ff", "#c25a1e"],
  ["#c084fc", "#f3c889"],
  ["#a78bfa", "#e0a058"],
  ["rgba(168,85,247", "rgba(243,200,137"],
  ["rgba(139,92,246", "rgba(171,121,77"],
  ["rgba(192,128,255", "rgba(243,200,137"],
  // Pink was only ever the far end of two headline gradients; ember-deep keeps
  // those gradients inside the palette instead of veering magenta.
  ["#ff2060", "#c25a1e"],
  ["#ff0080", "#c25a1e"],
  // ── surfaces: purple-black -> storm-blue-black ───────────────────────────
  ["#06040e", "#0b1117"],
  ["#050510", "#0a0f14"],
  ["#0f081e", "#111a22"],
  ["rgba(15,8,30", "rgba(17,24,32"],
  ["rgba(15, 8, 30", "rgba(17, 24, 32"],
  ["rgba(6,4,14", "rgba(11,17,23"],
  ["rgba(6, 4, 14", "rgba(11, 17, 23"],
  ["rgba(5,5,16", "rgba(10,15,20"],
  ["rgba(20,10,40", "rgba(22,30,38"],
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "node_modules") walk(p, out); }
    else if (/\.(tsx|ts|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

// lib/subjects.ts is deliberately EXCLUDED. Its `color` fields are per-subject
// identity — a rainbow so Meteorology never looks like Air Regs — not theme.
// A first run recoloured two of them and flattened that distinction.
const files = walk("app");
let touched = 0, total = 0;
const perToken = new Map();

for (const f of files) {
  const before = fs.readFileSync(f, "utf8");
  let after = before;
  for (const [from, to] of MAP) {
    if (!after.includes(from)) continue;
    const n = after.split(from).length - 1;
    after = after.split(from).join(to);
    perToken.set(from, (perToken.get(from) ?? 0) + n);
    total += n;
  }
  if (after !== before) {
    touched++;
    if (write) fs.writeFileSync(f, after, "utf8");
  }
}

console.log(`${write ? "REWROTE" : "would rewrite"} ${touched} files, ${total} replacements\n`);
for (const [k, v] of [...perToken.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(v).padStart(4)}  ${k}`);
}

// ── contrast report ────────────────────────────────────────────────────────
// Accents are used as text on the dark page background, so each one has to
// clear WCAG AA (4.5:1) there or the retheme quietly makes the site less
// legible — the exact kind of regression no build step can catch.
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const BG = "#0b1117";
console.log(`\ncontrast against the page background ${BG}:`);
for (const c of ["#f0913a", "#f3c889", "#e0a058", "#ab794d", "#c25a1e"]) {
  const r = ratio(c, BG);
  console.log(`  ${c}  ${r.toFixed(2)}:1  ${r >= 4.5 ? "AA text" : r >= 3 ? "AA large/UI only" : "FAILS"}`);
}
if (!write) console.log("\n(dry run — pass --write to apply)");
