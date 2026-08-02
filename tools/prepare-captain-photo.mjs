// Prepare the Captain's real photograph for the About page.
//
//   node tools/prepare-captain-photo.mjs <source-image>            # make variants
//   node tools/prepare-captain-photo.mjs <source-image> --pick 2   # commit variant 2
//
// Produces two assets:
//   public/captain-banner.webp  — wide banner behind the About hero
//   public/captain-real.webp    — square face crop for the circular portrait
//
// WHY VARIANTS: a circular mask is unforgiving, and this is the Captain's face.
// A portrait once shipped from this repo with a chin cut off because a preview
// was glanced at rather than looked at. So the default run writes numbered
// candidates to tools/photo-variants/ for a human to compare, and only --pick
// promotes one into public/. Nothing reaches the site un-chosen.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const srcArg = process.argv[2];
const pickIdx = process.argv.indexOf("--pick");
const pick = pickIdx !== -1 ? Number(process.argv[pickIdx + 1]) : null;

if (!srcArg || !fs.existsSync(srcArg)) {
  console.error("usage: node tools/prepare-captain-photo.mjs <source-image> [--pick N]");
  console.error(srcArg ? `not found: ${srcArg}` : "");
  process.exit(1);
}

const OUT_DIR = "tools/photo-variants";
fs.mkdirSync(OUT_DIR, { recursive: true });

const meta = await sharp(srcArg).metadata();
const W = meta.width, H = meta.height;
console.log(`source: ${srcArg}  ${W}x${H}`);

// Face-crop candidates, expressed as fractions of the source so they hold for
// any resolution. cx/cy = centre of the crop, size = side length as a fraction
// of the SHORTER edge. Tune these if the framing is off — that is the whole
// point of the variant step.
const CANDIDATES = [
  { name: "1-tight",   cx: 0.265, cy: 0.60, size: 0.30, note: "tight — head fills the circle" },
  { name: "2-balanced", cx: 0.265, cy: 0.62, size: 0.38, note: "balanced — head and shoulders, epaulettes just visible" },
  { name: "3-wide",    cx: 0.270, cy: 0.66, size: 0.48, note: "wider — shoulders, epaulettes and rank clearly visible" },
];

const shorter = Math.min(W, H);
async function makeSquare(c, outPath, px = 640) {
  const side = Math.round(shorter * c.size);
  let left = Math.round(W * c.cx - side / 2);
  let top = Math.round(H * c.cy - side / 2);
  left = Math.max(0, Math.min(left, W - side));
  top = Math.max(0, Math.min(top, H - side));
  await sharp(srcArg)
    .extract({ left, top, width: side, height: side })
    .resize(px, px, { fit: "cover" })
    .webp({ quality: 90 })
    .toFile(outPath);
  return { left, top, side };
}

if (pick === null) {
  for (const c of CANDIDATES) {
    const out = path.join(OUT_DIR, `portrait-${c.name}.webp`);
    const box = await makeSquare(c, out);
    console.log(`  ${out}   crop ${box.side}px at (${box.left},${box.top})  — ${c.note}`);
  }
  // Banner preview too, so both can be judged together.
  const bannerOut = path.join(OUT_DIR, "banner.webp");
  await sharp(srcArg).resize(2000, null, { withoutEnlargement: true }).webp({ quality: 82 }).toFile(bannerOut);
  console.log(`  ${bannerOut}  — full-width banner`);
  console.log(`\nOpen ${OUT_DIR} and look at all three, then rerun with --pick 1|2|3.`);
  process.exit(0);
}

const chosen = CANDIDATES[pick - 1];
if (!chosen) { console.error(`--pick must be 1..${CANDIDATES.length}`); process.exit(1); }

const box = await makeSquare(chosen, "public/captain-real.webp", 640);
await sharp(srcArg).resize(2000, null, { withoutEnlargement: true }).webp({ quality: 82 }).toFile("public/captain-banner.webp");

const p = fs.statSync("public/captain-real.webp").size;
const b = fs.statSync("public/captain-banner.webp").size;
console.log(`picked variant ${pick} (${chosen.name} — ${chosen.note})`);
console.log(`  public/captain-real.webp    ${(p / 1024).toFixed(0)} KB   crop ${box.side}px at (${box.left},${box.top})`);
console.log(`  public/captain-banner.webp  ${(b / 1024).toFixed(0)} KB`);
console.log(`\nNow: npm run build, then LOOK at /about before pushing.`);
