// Cut the mascot plate into an animatable rig.
//
//   node tools/rig-mascot.mjs
//
// Produces, from public/mascot-clean.png:
//   public/mascot-base.webp     the plate with the TRIDENT painted out
//   public/mascot-trident.webp  the trident alone, transparent, ready to swing
//
// WHY ONLY THE TRIDENT IS CUT.
// A full limb rig needs the background rebuilt behind every part that moves.
// Behind the wings sits the sunset, the mountain ridge and the castle — cloning
// that convincingly is not possible from this plate alone, and a bad matte reads
// as a torn sticker. The trident is the one part that CAN be cut cleanly: it is
// a thin, hard-edged object, and the strip of sky, ridge and rock behind it is
// near-vertical, so neighbouring columns are honest replacements. So the trident
// gets real articulated motion about the hand, and the rest of the body is
// driven by whole-figure motion (weight shift, wing beat, stride bob) which is
// artefact-free because nothing is cut at all.
//
// All coordinates are MEASURED off a 50px grid render of the plate, not guessed.
import sharp from "sharp";
import fs from "node:fs";

const SRC = "public/mascot-clean.png";
const m = await sharp(SRC).metadata();
const W = m.width, H = m.height;
console.log(`plate ${W}x${H}`);

// Trident silhouette, traced off the grid render in three overlapping pieces.
// A single loose box was tried first and dragged wing membrane, sky and a
// lightning bolt along with it — all of which would then rotate with the
// weapon. The mask now hugs the prongs, the shaft and the butt spike.
const HEAD = [
  [856, 258], [862, 96], [886, 152], [898, 82], [914, 152],
  [928, 78], [942, 152], [958, 84], [980, 152], [998, 96],
  [994, 258], [952, 308], [898, 308],
];
// The shaft LEANS — a vertical box leaves sky down both sides of it.
const SHAFT = [[890, 286], [914, 286], [894, 660], [870, 660]];
const BUTT  = [[856, 638], [942, 638], [928, 718], [876, 720]];
const poly = (p) => `<polygon points="${p.map(q => q.join(",")).join(" ")}" fill="#fff"/>`;
const shapes = [HEAD, SHAFT, BUTT].map(poly).join("");

// --- 1. the trident, alone, on transparency --------------------------------
const cutMask = Buffer.from(`<svg width="${W}" height="${H}">${shapes}</svg>`);
// Kept in memory: sharp refuses to read and write the same path, and this gets
// upscaled to match the base plate below before it is written once.
// ensureAlpha, NOT removeAlpha: "dest-in" keeps the destination only where the
// mask is opaque, so the destination must HAVE an alpha channel to cut. With
// removeAlpha the layer came out fully opaque — the cutout silently did nothing.
// A luminance key was tried here to finish the cut that geometry cannot — the
// gaps between the three prongs. It was abandoned on evidence, not on taste:
// sampling the plate shows the wing membrane behind the prongs at luma 18, i.e.
// as dark as the forged metal itself. No threshold can separate them. Instead
// the matte edge is FEATHERED, so whatever background the polygon does carry
// fades out instead of presenting a hard moving edge, and the swing is kept
// small with its fastest frames timed under the impact flash.
const softMask = await sharp(cutMask).blur(3.2).png().toBuffer();
const tridentBuf = await sharp(SRC).flatten({ background: "#000" }).ensureAlpha()
  .composite([{ input: softMask, blend: "dest-in" }])
  .png().toBuffer();

// --- 2. the plate with the trident removed ----------------------------------
// Rebuild the strip by cloning the columns immediately to the LEFT of the
// trident and mirroring them in. Left is chosen deliberately: to the right sit
// the castle towers, and cloning those would duplicate a landmark. To the left
// is open sky above and plain ridge below, which repeats without telling.
const STRIP = { left: 846, top: 70, width: 160, height: 645 };
// Donor: the strip immediately to the RIGHT. It carries the same vertical
// stack — storm sky, castle, ridge, rock — at the same heights, which is what
// actually sits behind the trident. An earlier version sampled 168px LEFT and
// cloned his own torso over the shaft; caught by looking at the result.
const donor = { left: 1020, top: STRIP.top, width: STRIP.width, height: STRIP.height };
const patch = await sharp(SRC).flatten({ background: "#000" }).removeAlpha()
  .extract(donor).blur(1.6).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

// Feather as RAW pixel alpha. The first attempt built this as an SVG with a
// gradient fill inside a gradient mask; sharp rendered it to zero alpha, so the
// composite silently did nothing and the trident stayed in the plate. Writing
// the alpha ramp directly removes every bit of that ambiguity.
{
  const { data, info } = patch;
  const fx = 0.16, fy = 0.09;               // feather widths as a fraction
  for (let y = 0; y < info.height; y++) {
    const ty = Math.min(y / (info.height * fy), (info.height - 1 - y) / (info.height * fy), 1);
    for (let x = 0; x < info.width; x++) {
      const tx = Math.min(x / (info.width * fx), (info.width - 1 - x) / (info.width * fx), 1);
      const a = Math.max(0, Math.min(1, Math.min(tx, ty)));
      data[(y * info.width + x) * info.channels + 3] = Math.round(a * 255);
    }
  }
}
const feathered = await sharp(patch.data, {
  raw: { width: patch.info.width, height: patch.info.height, channels: patch.info.channels },
}).png().toBuffer();

// TWO PASSES, and this is not stylistic. sharp runs its pipeline in a FIXED
// order — resize happens BEFORE composite, whatever order you chain them in. In
// one pass the patch was placed at x=846 of the already-2x image, i.e. source
// x≈423, painting over the wing while the trident stayed untouched. The patch
// is therefore composited at source scale first, and only then upscaled.
const patched = await sharp(SRC).flatten({ background: "#000" }).removeAlpha()
  .composite([{ input: feathered, left: STRIP.left, top: STRIP.top }])
  .png().toBuffer();

await sharp(patched)
  .resize(Math.min(2816, W * 2), null, { kernel: "lanczos3" })
  .sharpen({ sigma: 0.7, m1: 0.4, m2: 1.8 })
  .webp({ quality: 86 })
  .toFile("public/mascot-base.webp");

// upscale the trident to match the base's 2x scale
await sharp(tridentBuf)
  .resize(Math.min(2816, W * 2), null, { kernel: "lanczos3" })
  .webp({ quality: 94, alphaQuality: 100 })
  .toFile("public/mascot-trident.webp");

for (const f of ["mascot-base.webp", "mascot-trident.webp"]) {
  const mm = await sharp(`public/${f}`).metadata();
  console.log(`  ${f.padEnd(24)} ${mm.width}x${mm.height}  ${(fs.statSync(`public/${f}`).size / 1024).toFixed(0)} KB`);
}
// Pivot = the hand grip, as a fraction of the plate, so CSS can use percentages.
console.log(`\npivot (hand grip) = ${(893 / W * 100).toFixed(2)}% ${(318 / H * 100).toFixed(2)}%`);
