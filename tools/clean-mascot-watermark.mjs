// Remove the generator's sparkle watermark from the mascot artwork.
//
//   node tools/clean-mascot-watermark.mjs <src> <out>
//
// The mark sits over soft, dark, low-detail rock at the lower right. It is
// removed by cloning a neighbouring patch of the SAME background over it
// through a feathered (radial) alpha mask, so there is no hard seam and no
// smeared bright pixels. Nothing else in the frame is touched.
import sharp from "sharp";
import fs from "node:fs";

const SRC = process.argv[2] ?? "public/mascot-source.png";
const OUT = process.argv[3] ?? "public/mascot-clean.png";

const m = await sharp(SRC).metadata();
console.log(`source ${m.width}x${m.height} (alpha=${m.hasAlpha})`);

// Measured from a 4x zoom of the corner: the sparkle spans about
// x 1266-1310, y 624-673 on the 1408x768 plate. Box it with margin.
const BOX = { left: 1252, top: 610, width: 76, height: 80 };
// Clone source. First attempt pulled from 86 px LEFT and dragged pale mist over
// the rock ridge — worse than the watermark. Directly BELOW is the same dark
// rock with the same ridge direction, so the fill continues the terrain instead
// of contradicting it.
const CLONE_DX = 0;
const CLONE_DY = 78;

const scaleX = m.width / 1408, scaleY = m.height / 768;
const box = {
  left: Math.round(BOX.left * scaleX),
  top: Math.round(BOX.top * scaleY),
  width: Math.round(BOX.width * scaleX),
  height: Math.round(BOX.height * scaleY),
};
const from = {
  ...box,
  left: box.left + Math.round(CLONE_DX * scaleX),
  top: box.top + Math.round(CLONE_DY * scaleY),
};

const patch = await sharp(SRC).flatten({ background: "#000" }).removeAlpha()
  .extract(from).blur(1.1).png().toBuffer();

// Feathered radial mask: opaque in the middle, transparent at the edges.
const mask = Buffer.from(
  `<svg width="${box.width}" height="${box.height}">
     <defs><radialGradient id="g" cx="50%" cy="50%" r="50%">
       <stop offset="0%"   stop-color="#fff" stop-opacity="1"/>
       <stop offset="62%"  stop-color="#fff" stop-opacity="1"/>
       <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
     </radialGradient></defs>
     <rect width="100%" height="100%" fill="url(#g)"/>
   </svg>`);

const feathered = await sharp(patch)
  .composite([{ input: mask, blend: "dest-in" }])
  .png().toBuffer();

await sharp(SRC).flatten({ background: "#000" }).removeAlpha()
  .composite([{ input: feathered, left: box.left, top: box.top }])
  .png().toFile(OUT);

console.log(`patched ${box.width}x${box.height} at (${box.left},${box.top}) cloned from x${from.left}`);
console.log(`wrote ${OUT}  ${(fs.statSync(OUT).size / 1024 / 1024).toFixed(2)} MB`);

// Zoom both before and after so the result is actually looked at.
const z = { left: Math.round(1200 * scaleX), top: Math.round(560 * scaleY), width: Math.round(200 * scaleX), height: Math.round(170 * scaleY) };
await sharp(SRC).extract(z).resize(800, null, { kernel: "nearest" }).png().toFile("tools/photo-variants/wm-before.png");
await sharp(OUT).extract(z).resize(800, null, { kernel: "nearest" }).png().toFile("tools/photo-variants/wm-after.png");
console.log("wrote tools/photo-variants/wm-before.png and wm-after.png");
