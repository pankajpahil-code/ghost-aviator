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
// Measured against the source (1080x1045): his face centres near x=0.265,
// eyes sit at about y=0.565, chin near y=0.635.
const CANDIDATES = [
  { name: "1-tight",    cx: 0.265, cy: 0.585, size: 0.32, note: "tight — head fills the circle" },
  { name: "2-balanced", cx: 0.265, cy: 0.620, size: 0.42, note: "balanced — head and shoulders, epaulettes just visible" },
  { name: "3-wide",     cx: 0.268, cy: 0.660, size: 0.54, note: "wider — shoulders, epaulettes and rank clearly visible" },
];

const shorter = Math.min(W, H);
async function makeSquare(c, outPath, px = 768) {
  const side = Math.round(shorter * c.size);
  let left = Math.round(W * c.cx - side / 2);
  let top = Math.round(H * c.cy - side / 2);
  left = Math.max(0, Math.min(left, W - side));
  top = Math.max(0, Math.min(top, H - side));
  await sharp(srcArg)
    .extract({ left, top, width: side, height: side })
    .resize(px, px, { fit: "cover", kernel: "lanczos3" })
    .sharpen({ sigma: 0.7 })
    .webp({ quality: 94 })
    .toFile(outPath);
  return { left, top, side };
}

// The banner spans the full viewport — up to ~2560 px on a desktop — while the
// source is only ~1080 px wide. Left alone, next/image can offer nothing larger
// than the source and the BROWSER upscales, which is what "blurry" looks like.
// Resampling here with lanczos3 plus a light unsharp gives next/image a genuine
// 2x asset to build its srcset from, so the browser scales DOWN rather than up.
// This cannot invent detail the source never had; it removes the soft mush that
// naive upscaling adds on top of it.
async function makeBanner(outPath) {
  const target = Math.min(2400, W * 2);
  await sharp(srcArg)
    .resize(target, null, { kernel: "lanczos3" })
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 2 })
    .webp({ quality: 90 })
    .toFile(outPath);
  const m2 = await sharp(outPath).metadata();
  return { w: m2.width, h: m2.height };
}

if (pick === null) {
  for (const c of CANDIDATES) {
    const out = path.join(OUT_DIR, `portrait-${c.name}.webp`);
    const box = await makeSquare(c, out);
    console.log(`  ${out}   crop ${box.side}px at (${box.left},${box.top})  — ${c.note}`);
  }
  // Banner preview too, so both can be judged together.
  const bannerOut = path.join(OUT_DIR, "banner.webp");
  const b = await makeBanner(bannerOut);
  console.log(`  ${bannerOut}  — full-width banner ${b.w}x${b.h}`);
  console.log(`\nOpen ${OUT_DIR} and look at all three, then rerun with --pick 1|2|3.`);
  process.exit(0);
}

const chosen = CANDIDATES[pick - 1];
if (!chosen) { console.error(`--pick must be 1..${CANDIDATES.length}`); process.exit(1); }

const box = await makeSquare(chosen, "public/captain-real.webp", 768);
const banner = await makeBanner("public/captain-banner.webp");
console.log(`  banner rendered at ${banner.w}x${banner.h}`);

const p = fs.statSync("public/captain-real.webp").size;
const b = fs.statSync("public/captain-banner.webp").size;
console.log(`picked variant ${pick} (${chosen.name} — ${chosen.note})`);
console.log(`  public/captain-real.webp    ${(p / 1024).toFixed(0)} KB   crop ${box.side}px at (${box.left},${box.top})`);
console.log(`  public/captain-banner.webp  ${(b / 1024).toFixed(0)} KB`);
console.log(`\nNow: npm run build, then LOOK at /about before pushing.`);
