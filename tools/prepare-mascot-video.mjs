// Turn the supplied cinematic clip into web hero video.
//
//   node tools/prepare-mascot-video.mjs "C:/path/to/clip.mp4"
//
// NO CROP — the full 16:9 frame is used, on Capt. Pahil's explicit decision of
// 2026-08-02. An earlier version cropped to a band to remove the word "OXFORD"
// from the book. He overruled that: a place name is not a trademark claim, the
// artwork is his, and cropping cost the best storytelling beat in the clip (the
// book being handed to a student). His site, his call. Iron Rule 2 in
// D:\pk\CLAUDE.md has been annotated so no future session silently re-crops it.
//
// The generator's sparkle watermark IS still removed — that one is not a name,
// it is another product's branding on his page — using delogo, which
// interpolates from the box edges rather than blurring.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const SRC = process.argv[2] ?? "C:/Users/Admin/Downloads/Cinematic_effects_i_wanna_use.mp4";
if (!fs.existsSync(SRC)) { console.error(`not found: ${SRC}`); process.exit(1); }

const run = (args) => execFileSync("ffmpeg", ["-y", "-v", "error", ...args], { stdio: "inherit" });
const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0) + " KB";

// The sparkle watermark sits bottom-right, roughly x1132-1198 / y572-634 on the
// 1280x720 source. delogo rebuilds from the surrounding pixels rather than
// smearing, which is what it exists for.
const DELOGO = "delogo=x=1132:y=572:w=68:h=64";
// FULL FRAME at both sizes — nothing is cropped. Dimensions must be EVEN: h264
// with yuv420p subsamples chroma 2x2, so an odd width aborts the encode and
// leaves a truncated file with no moov atom (705 was tried and did exactly
// that). Mobile is a smaller encode of the same framing, purely to save data.
const DESK = `${DELOGO},scale=1600:900:flags=lanczos`;
const MOB = `${DELOGO},scale=960:540:flags=lanczos`;

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
