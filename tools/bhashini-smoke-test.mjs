// Bhashini smoke test — verifies the Captain's API credentials work, end to end,
// WITHOUT the credentials ever appearing in a chat, a commit, or this file.
//
// Setup (Captain does this himself, in Notepad — never in any AI chat):
//   1. Log in at bhashini.gov.in and generate/locate your ULCA API key
//      (dashboard → My Profile / API Key section).
//   2. Open ghost-aviator/.env.local in Notepad and replace the two
//      BHASHINI_ placeholder values with your real userID and key.
//
// Run:  node --env-file=.env.local tools/bhashini-smoke-test.mjs
//
// What it does: asks Bhashini's pipeline service for a translation (en→hi) and
// TTS (hi) config, then runs ONE tiny sentence through both, and saves the
// spoken Hindi to D:/pk/voice-samples/6-hindi-bhashini.wav so it can be
// compared by ear against the Edge-voice samples (files 1–5).
//
// NOTE: this uses the ULCA/Dhruva pipeline flow as documented up to early 2026.
// If Bhashini has since changed its API surface, this fails loudly with the
// server's response body — bring that output back and the script gets adapted.
import { writeFileSync, mkdirSync } from "node:fs";

const USER_ID = process.env.BHASHINI_USER_ID;
const API_KEY = process.env.BHASHINI_ULCA_API_KEY;

if (!USER_ID || USER_ID.startsWith("PASTE_") || !API_KEY || API_KEY.startsWith("PASTE_")) {
  console.error("✗ Fill in BHASHINI_USER_ID and BHASHINI_ULCA_API_KEY in .env.local first (in Notepad).");
  process.exit(1);
}

const PIPELINE_ID = "64392f96daac500b55c543cd"; // MeitY public pipeline
const AUTH_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline";

const SAMPLE_EN = "The atmosphere is the layer of air surrounding the Earth.";

async function main() {
  console.log("1/3 Requesting pipeline config (translation en→hi + TTS hi)...");
  const cfgRes = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", userID: USER_ID, ulcaApiKey: API_KEY },
    body: JSON.stringify({
      pipelineTasks: [
        { taskType: "translation", config: { language: { sourceLanguage: "en", targetLanguage: "hi" } } },
        { taskType: "tts", config: { language: { sourceLanguage: "hi" } } },
      ],
      pipelineRequestConfig: { pipelineId: PIPELINE_ID },
    }),
  });
  if (!cfgRes.ok) {
    console.error(`✗ Config request failed: HTTP ${cfgRes.status}`);
    console.error(await cfgRes.text());
    process.exit(1);
  }
  const cfg = await cfgRes.json();

  const endpoint = cfg?.pipelineInferenceAPIEndPoint;
  const callbackUrl = endpoint?.callbackUrl;
  const authName = endpoint?.inferenceApiKey?.name;
  const authValue = endpoint?.inferenceApiKey?.value;
  const tasks = cfg?.pipelineResponseConfig ?? [];
  const translationServiceId = tasks.find(t => t.taskType === "translation")?.config?.[0]?.serviceId;
  const ttsServiceId = tasks.find(t => t.taskType === "tts")?.config?.[0]?.serviceId;

  if (!callbackUrl || !authValue || !translationServiceId || !ttsServiceId) {
    console.error("✗ Unexpected config response shape — API may have changed. Full response:");
    console.error(JSON.stringify(cfg, null, 2));
    process.exit(1);
  }
  console.log(`   ✓ translation service: ${translationServiceId}`);
  console.log(`   ✓ tts service:         ${ttsServiceId}`);

  console.log("2/3 Running translation + TTS on one sentence...");
  const infRes = await fetch(callbackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", [authName]: authValue },
    body: JSON.stringify({
      pipelineTasks: [
        {
          taskType: "translation",
          config: { language: { sourceLanguage: "en", targetLanguage: "hi" }, serviceId: translationServiceId },
        },
        {
          taskType: "tts",
          config: { language: { sourceLanguage: "hi" }, serviceId: ttsServiceId, gender: "female", samplingRate: 22050 },
        },
      ],
      inputData: { input: [{ source: SAMPLE_EN }] },
    }),
  });
  if (!infRes.ok) {
    console.error(`✗ Inference failed: HTTP ${infRes.status}`);
    console.error(await infRes.text());
    process.exit(1);
  }
  const out = await infRes.json();

  const translated = out?.pipelineResponse?.find(t => t.taskType === "translation")?.output?.[0]?.target;
  const audioB64 = out?.pipelineResponse?.find(t => t.taskType === "tts")?.audio?.[0]?.audioContent;

  console.log(`   English: ${SAMPLE_EN}`);
  console.log(`   Hindi:   ${translated ?? "(no translation in response)"}`);

  if (!audioB64) {
    console.error("✗ No audio in response. Full response:");
    console.error(JSON.stringify(out, null, 2).slice(0, 3000));
    process.exit(1);
  }

  console.log("3/3 Saving spoken Hindi sample...");
  mkdirSync("D:/pk/voice-samples", { recursive: true });
  writeFileSync("D:/pk/voice-samples/6-hindi-bhashini.wav", Buffer.from(audioB64, "base64"));
  console.log("✓ PASS — Bhashini credentials work. Listen: D:/pk/voice-samples/6-hindi-bhashini.wav");
  console.log("  Compare it against 2-hindi-swara.mp3 (Edge voice) and pick by ear.");
}

main().catch(e => { console.error("✗ Unexpected error:", e.message); process.exit(1); });
