// Prepare the mascot hero assets from the source artwork.
//
//   node tools/prepare-mascot.mjs public/mascot-source.png
//
// Produces:
//   public/mascot-hero.webp         wide cinematic plate, 2x resampled
//   public/mascot-hero-mobile.webp  taller crop centred on the figure, because a
//                                   16:9 plate on a 375px phone renders the
//                                   mascot too small to read
//   public/mascot-poster.webp       small blurred placeholder for instant paint
//
// Same resampling discipline as the About banner: the hero spans the viewport,
// so give next/image a source LARGER than the display width or the browser
// upscales and everything goes soft.
import fs from "node:fs";
import sharp from "sharp";

const src = process.argv[2] ?? "public/mascot-source.png";
if (!fs.existsSync(src)) { console.error(`not found: ${src}`); process.exit(1); }

const m = await sharp(src).metadata();
console.log(`source ${m.width}x${m.height}`);

// --- wide plate -------------------------------------------------------------
const wide = Math.min(2816, m.width * 2);
await sharp(src)
  .resize(wide, null, { kernel: "lanczos3" })
  .sharpen({ sigma: 0.7, m1: 0.4, m2: 1.8 })
  .webp({ quality: 86 })
  .toFile("public/mascot-hero.webp");

// --- mobile crop ------------------------------------------------------------
// A phone viewport is about 0.46 wide-to-tall. A 4:5 crop is far too square for
// that: object-cover then zooms in hard and eats the trident, which is half the
// point of the mascot. So the crop is a TALL, narrow slice holding the figure
// AND the trident (source x ~570-1010) over the full frame height, giving ~0.57
// — close enough to the phone that cover barely trims the sides.
const cx = 0.561;
const cropW = Math.round(m.width * 0.3125);
const cropH = m.height;
const left = Math.max(0, Math.min(Math.round(m.width * cx - cropW / 2), m.width - cropW));
const top = 0;
await sharp(src)
  .extract({ left, top, width: cropW, height: cropH })
  .resize(Math.round(cropW * 1.8), null, { kernel: "lanczos3" })
  .sharpen({ sigma: 0.7 })
  .webp({ quality: 88 })
  .toFile("public/mascot-hero-mobile.webp");

// --- poster -----------------------------------------------------------------
await sharp(src).resize(32, null).blur(2).webp({ quality: 40 }).toFile("public/mascot-poster.webp");

for (const f of ["mascot-hero.webp", "mascot-hero-mobile.webp", "mascot-poster.webp"]) {
  const meta = await sharp(`public/${f}`).metadata();
  console.log(`  ${f.padEnd(26)} ${meta.width}x${meta.height}  ${(fs.statSync(`public/${f}`).size / 1024).toFixed(0)} KB`);
}
console.log(`\nmobile crop taken at (${left},${top}) ${cropW}x${cropH}`);
