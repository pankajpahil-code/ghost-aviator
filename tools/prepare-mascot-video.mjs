// Turn the supplied cinematic clip into web hero video.
//
//   node tools/prepare-mascot-video.mjs "C:/path/to/clip.mp4"
//
// TWO NON-NEGOTIABLE EDITS ARE BAKED INTO THE CROP:
//   1. Iron Rule 2 — the book in the source close-ups reads "OXFORD", a
//      publisher name that must never appear in student-facing content. It sits
//      low-centre and MOVES as the camera pushes in, so a fixed patch cannot
//      cover it; the crop removes it outright.
//   2. The generator's sparkle watermark sits bottom-right and goes with it.
// Any change to these crop values must be re-checked against both.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const SRC = process.argv[2] ?? "C:/Users/Admin/Downloads/Cinematic_effects_i_wanna_use.mp4";
if (!fs.existsSync(SRC)) { console.error(`not found: ${SRC}`); process.exit(1); }

const run = (args) => execFileSync("ffmpeg", ["-y", "-v", "error", ...args], { stdio: "inherit" });
const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0) + " KB";

// Desktop: wide cinematic band from the top of the frame.
const DESK = "crop=1280:400:0:0,scale=1600:500:flags=lanczos";
// Mobile: ALSO a top band, not a portrait slice. The first attempt cropped
// 620x560 and the "OXFORD" cover was plainly legible at phone size — verified
// by zooming the encoded output, which is the only way to catch it. The book
// never rises above y=300 in any shot, so a band ending there is compliant by
// geometry rather than by blur, and geometry cannot drift.
// 470 wide keeps him and the trident with a 1.57:1 band — a 760-wide band came
// out only ~154px tall on a 390px phone, too slight to carry a hero.
// Dimensions must be EVEN: h264 with yuv420p subsamples chroma 2x2, so an odd
// width (705 was tried) aborts the encode and leaves a truncated file with no
// moov atom.
const MOB = "crop=470:300:415:0,scale=704:450:flags=lanczos";

for (const [label, vf, out] of [
  ["desktop", DESK, "public/mascot-hero"],
  ["mobile", MOB, "public/mascot-hero-m"],
]) {
  // h264 for universal support; -an strips audio (a hero must be silent, and
  // muted autoplay is the only autoplay browsers allow); faststart puts the
  // index first so playback can begin before the file finishes downloading.
  run(["-i", SRC, "-vf", vf, "-an", "-c:v", "libx264", "-profile:v", "high",
       "-crf", "26", "-preset", "slow", "-pix_fmt", "yuv420p",
       "-movflags", "+faststart", `${out}.mp4`]);
  // VP9 is a good deal smaller where it is supported.
  run(["-i", SRC, "-vf", vf, "-an", "-c:v", "libvpx-vp9",
       "-crf", "38", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
       `${out}.webm`]);
  // Poster: first frame, for instant paint and for reduced-motion visitors.
  run(["-i", SRC, "-vf", `${vf},select=eq(n\\,0)`, "-frames:v", "1", `${out}-poster.png`]);
  execFileSync("node", ["-e", `require('sharp')('${out}-poster.png').webp({quality:82}).toFile('${out}-poster.webp').then(()=>require('fs').unlinkSync('${out}-poster.png'))`]);
  console.log(`${label}: ${out}.mp4 ${kb(out + ".mp4")}, ${out}.webm ${kb(out + ".webm")}, poster ${kb(out + "-poster.webp")}`);
}
