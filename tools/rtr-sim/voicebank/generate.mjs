// Ghost Tower VoiceBank — fragment renderer.
// Reads manifest.json, renders each fragment with a neural Indian-English voice,
// runs it through the VHF radio filter, and writes public/rtr-voice/<id>.mp3
// plus a runtime manifest the browser loads.
//
//   node tools/rtr-sim/voicebank/generate.mjs [--voice en-IN-PrabhatNeural] [--force]
//
// PROVIDER NOTE: default provider is `edge-tts` (free, no API key) which is
// perfect for prototyping the sound. The SAME voices are Azure Speech neural
// voices — set PROVIDER=azure with AZURE_SPEECH_KEY/REGION in .env.local to
// regenerate an identically-voiced, properly-licensed bank (the whole bank is
// ~7k characters = ~1.4% of Azure's free monthly tier).
//
// Filter: band-limit + compression ONLY. Carrier noise and squelch are added
// live in the browser so they run continuously across fragment seams.

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../../..");
const OUT_DIR = resolve(ROOT, "public/rtr-voice");
// Raw TTS lands OUTSIDE public/ — only filtered fragments are ever shipped.
const TMP_DIR = resolve(HERE, ".tmp-raw");

const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : def;
};
const VOICE = arg("voice", "en-IN-PrabhatNeural");
// Real controllers are BRISK — they're working a busy frequency, not narrating.
// A negative rate made transmissions drone; +10% reads as businesslike ATC
// while staying clearly intelligible for a student.
const RATE = arg("rate", "+10%");
const FORCE = argv.includes("--force");
const CONCURRENCY = 5;

const manifest = JSON.parse(readFileSync(resolve(HERE, "manifest.json"), "utf8"));
const fragments = manifest.fragments;

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(TMP_DIR, { recursive: true });

// STEP 1 — strip the silence the TTS pads around every standalone utterance.
// Measured: "Victor" was 0.54s of speech inside a 1.56s file (0.18s lead +
// 0.84s tail). Untrimmed, spelling one callsign injected ~5 SECONDS of dead
// air — the "Alfa … long pause … Bravo" drag. start_periods=1 removes only the
// FIRST silence run, so pauses *inside* a phrase are preserved; areverse does
// the tail the same way.
const TRIM =
  "silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:detection=peak,areverse," +
  "silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:detection=peak,areverse";

// STEP 2 — VHF radio character: 4th-order band-limit 300-2800 Hz + AGC.
// (Verified by spectrogram — gentler single-pole filters leak hiss and sound
// like tape, not a radio.)
const VHF_FILTER =
  TRIM + "," +
  "highpass=f=300:poles=2,highpass=f=300:poles=2," +
  "lowpass=f=2800:poles=2,lowpass=f=2800:poles=2," +
  "acompressor=threshold=-18dB:ratio=6:attack=3:release=60," +
  "alimiter=level_in=1.7:limit=0.85,volume=3dB";

async function renderOne(frag) {
  const outFile = resolve(OUT_DIR, `${frag.id}.mp3`);
  if (!FORCE && existsSync(outFile) && statSync(outFile).size > 0) return "skip";
  const raw = resolve(TMP_DIR, `${frag.id}.raw.mp3`);
  await run("python", [
    "-m", "edge_tts", "--voice", VOICE, `--rate=${RATE}`,
    "--text", frag.text, "--write-media", raw,
  ], { maxBuffer: 1 << 24 });
  await run("ffmpeg", [
    "-y", "-loglevel", "error", "-i", raw,
    "-af", VHF_FILTER,
    "-ar", "16000", "-ac", "1", "-b:a", "32k",
    outFile,
  ], { maxBuffer: 1 << 24 });
  return "made";
}

async function probeDuration(file) {
  const { stdout } = await run("ffprobe", [
    "-v", "error", "-show_entries", "format=duration",
    "-of", "default=nk=1:nw=1", file,
  ]);
  return Math.round(parseFloat(stdout.trim()) * 1000) / 1000;
}

console.log(`voice      : ${VOICE}  (rate ${RATE})`);
console.log(`fragments  : ${fragments.length}`);
console.log(`output     : ${OUT_DIR}`);

let made = 0, skipped = 0, failed = [];
for (let i = 0; i < fragments.length; i += CONCURRENCY) {
  const batch = fragments.slice(i, i + CONCURRENCY);
  const results = await Promise.allSettled(batch.map(renderOne));
  results.forEach((r, k) => {
    if (r.status === "rejected") failed.push({ id: batch[k].id, err: String(r.reason).slice(0, 120) });
    else if (r.value === "made") made++;
    else skipped++;
  });
  process.stdout.write(`\r  ${Math.min(i + CONCURRENCY, fragments.length)}/${fragments.length}  made ${made} skip ${skipped} fail ${failed.length}   `);
}
console.log("");

// Runtime manifest: what the browser needs to stitch.
const durations = {};
let totalBytes = 0, totalSec = 0;
for (const f of fragments) {
  const file = resolve(OUT_DIR, `${f.id}.mp3`);
  if (!existsSync(file)) continue;
  durations[f.id] = await probeDuration(file);
  totalBytes += statSync(file).size;
  totalSec += durations[f.id];
}
writeFileSync(resolve(OUT_DIR, "manifest.json"), JSON.stringify({
  voice: VOICE,
  count: Object.keys(durations).length,
  fragments: durations,
}));

console.log(`rendered   : ${Object.keys(durations).length} files`);
console.log(`total size : ${(totalBytes / 1024 / 1024).toFixed(2)} MB  (${totalSec.toFixed(1)}s audio)`);
console.log(`avg file   : ${(totalBytes / Math.max(1, Object.keys(durations).length) / 1024).toFixed(1)} KB`);
if (failed.length) {
  console.log(`FAILED ${failed.length}:`);
  for (const f of failed.slice(0, 10)) console.log(`   ${f.id}: ${f.err}`);
  process.exitCode = 1;
}
