/**
 * GINI'S SPOKEN VOICE — server-side text-to-speech (2026-10-22).
 *
 * ────────────────────────────────────────────────────────────────────────────
 * WHY SERVER-SIDE. The browser's own speechSynthesis reads with whatever voices
 * the device has installed. On the Captain's desktop that is three English
 * voices, so a Tamil reply was read by an English voice and came out as
 * gibberish. Audio made on the server sounds the same on every phone.
 *
 * TWO PROVIDERS, tried in this order:
 *
 *   1. BHASHINI (Government of India, ULCA / Dhruva pipeline). Used when its
 *      keys are set. Either BHASHINI_INFERENCE_KEY (the compute key, with an
 *      optional BHASHINI_INFERENCE_URL), or BHASHINI_USER_ID + BHASHINI_ULCA_API_KEY
 *      + BHASHINI_PIPELINE_ID, from which the documented config call fetches the
 *      compute URL, key and serviceId. Request shape from bhashini.gitbook.io (pipeline-compute-call),
 *      read 2026-10-22. NOT YET TESTED AGAINST THE LIVE SERVICE: no key exists
 *      yet. It falls through to Gemini on any failure, so a wrong guess costs
 *      a slower answer, never silence.
 *
 *   2. GEMINI TTS on the existing GEMINI_API_KEY. Interactions API with
 *      response_format {type:"audio"}, shape from ai.google.dev speech-generation
 *      (updated 2026-10-12), and tested live 2026-10-22: 200, a RIFF/WAVE file,
 *      24 kHz mono 16-bit. Its language list covers Hindi, Marathi, Punjabi,
 *      Tamil, Telugu, Gujarati, Kannada, Malayalam, Assamese, Bangla, Odia,
 *      Sindhi, Kashmiri and English. Urdu is NOT on Google's list.
 *
 * Deliberately NOT used: the undocumented translate.google.com/translate_tts
 * endpoint. It is not offered for third-party use and can be blocked without
 * notice, which would silence Gini for every student at once.
 *
 * SERVER ONLY. Holds keys.
 * ────────────────────────────────────────────────────────────────────────────
 */

if (typeof window !== "undefined") {
  throw new Error("lib/gini/tts.ts is server-only — it holds API keys.");
}

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const MAX_TTS_CHARS = 700;

/* ─────────────────────────────── languages ──────────────────────────────── */

/** BCP-47 from the browser (hi-IN) -> the short code both providers use. */
export function shortLang(lang: string): string {
  const l = (lang || "").toLowerCase();
  if (l.startsWith("en")) return "en-IN";
  const base = l.split(/[-_]/)[0];
  return ["hi", "mr", "pa", "ta", "te", "bn", "gu", "kn", "ml", "or", "as", "ur", "sd", "ks", "ne", "kok", "mai"].includes(base) ? base : "en-IN";
}

/** Gemini takes the language from the text itself; this names it in the style hint. */
const LANGUAGE_NAME: Record<string, string> = {
  hi: "Hindi", mr: "Marathi", pa: "Punjabi", ta: "Tamil", te: "Telugu", bn: "Bangla", gu: "Gujarati",
  kn: "Kannada", ml: "Malayalam", or: "Odia", as: "Assamese", ur: "Urdu", sd: "Sindhi", ks: "Kashmiri",
  ne: "Nepali", kok: "Konkani", mai: "Maithili", "en-IN": "Indian English",
};

/* ──────────────────────────── text for speaking ─────────────────────────── */

/**
 * What a voice should actually say. Units and symbols are spoken as words, so
 * neither provider stumbles on "60 kt" or "15 °C" in the middle of a Tamil
 * sentence. Links, markdown and the "AI explanation" label are removed.
 */
export function textForSpeech(raw: string): string {
  return raw
    .replace(/AI explanation based on the Captain'?s notes\.?[^.]*\.?/gi, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[*_#`~>|]+/g, " ")
    .replace(/(\d)\s*°\s*C\b/g, "$1 degrees Celsius")
    .replace(/(\d)\s*°/g, "$1 degrees")
    .replace(/\bkts?\b/g, "knots")
    .replace(/\bhPa\b/g, "hectopascals")
    .replace(/\bNM\b/g, "nautical miles")
    .replace(/(\d)\s*%/g, "$1 percent")
    .replace(/[→←↑↓★⚠✓✗]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TTS_CHARS);
}

/* ─────────────────────────── the speak token ────────────────────────────── */

/**
 * Only Gini's own replies are spoken. /api/gini returns a token with each reply
 * (an HMAC of the exact text), and /api/gini/tts refuses text without a valid
 * one. Without this the route is a free text-to-speech service for anyone,
 * paid for out of the quota students need. The secret never leaves the server:
 * GINI_TTS_SECRET if set, else one derived from the Gemini key.
 */
function secret(): string | null {
  if (process.env.GINI_TTS_SECRET) return process.env.GINI_TTS_SECRET;
  if (process.env.GEMINI_API_KEY) return createHash("sha256").update(`gini-tts:${process.env.GEMINI_API_KEY}`).digest("hex");
  return null;
}

export function speakToken(text: string): string | undefined {
  const s = secret();
  if (!s || !text) return undefined;
  return createHmac("sha256", s).update(text.trim()).digest("base64url");
}

export function tokenMatches(text: string, token: unknown): boolean {
  const want = speakToken(text);
  if (!want || typeof token !== "string") return false;
  const a = Buffer.from(want), b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

/* ─────────────────────────────── providers ──────────────────────────────── */

export type Audio = { bytes: Buffer; type: string; provider: "bhashini" | "gemini" };

const TIMEOUT_MS = 20_000;

async function withTimeout<T>(ms: number, run: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try { return await run(ctl.signal); } finally { clearTimeout(timer); }
}

/** Default AI4Bharat TTS services by language family, as named in the Bhashini docs. */
const BHASHINI_SERVICE: Record<string, string> = {
  hi: "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", mr: "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
  pa: "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", bn: "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
  gu: "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", or: "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
  as: "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
  ta: "ai4bharat/indic-tts-coqui-dravidian-gpu--t4", te: "ai4bharat/indic-tts-coqui-dravidian-gpu--t4",
  kn: "ai4bharat/indic-tts-coqui-dravidian-gpu--t4", ml: "ai4bharat/indic-tts-coqui-dravidian-gpu--t4",
  en: "ai4bharat/indic-tts-coqui-misc-gpu--t4", ur: "ai4bharat/indic-tts-coqui-misc-gpu--t4",
};

type BhashiniTarget = { url: string; header: string; key: string; serviceId?: string };
let bhashiniConfig: { at: number; byLang: Map<string, BhashiniTarget> } | null = null;

export const bhashiniConfigured = () =>
  !!process.env.BHASHINI_INFERENCE_KEY ||
  (!!process.env.BHASHINI_USER_ID && !!process.env.BHASHINI_ULCA_API_KEY && !!process.env.BHASHINI_PIPELINE_ID);

/** Where to send a Bhashini TTS call for this language, using the config call when only ULCA keys are set. */
async function bhashiniTarget(lang: string): Promise<BhashiniTarget | null> {
  if (process.env.BHASHINI_INFERENCE_KEY) {
    return {
      url: process.env.BHASHINI_INFERENCE_URL || "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
      header: "Authorization", key: process.env.BHASHINI_INFERENCE_KEY.trim(),
    };
  }
  // The pipeline id comes from the Captain's own Bhashini profile; there is no
  // safe default to hardcode, so without it the config call is not attempted.
  if (!process.env.BHASHINI_USER_ID || !process.env.BHASHINI_ULCA_API_KEY || !process.env.BHASHINI_PIPELINE_ID) return null;
  const fresh = bhashiniConfig && Date.now() - bhashiniConfig.at < 6 * 3600_000;
  if (!fresh || !bhashiniConfig!.byLang.has(lang)) {
    const res = await withTimeout(8000, signal => fetch("https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline", {
      method: "POST", signal,
      headers: { "Content-Type": "application/json", userID: process.env.BHASHINI_USER_ID!, ulcaApiKey: process.env.BHASHINI_ULCA_API_KEY! },
      body: JSON.stringify({
        pipelineTasks: [{ taskType: "tts", config: { language: { sourceLanguage: lang } } }],
        pipelineRequestConfig: { pipelineId: process.env.BHASHINI_PIPELINE_ID },
      }),
    }));
    if (!res.ok) return null;
    const j = await res.json() as {
      pipelineInferenceAPIEndPoint?: { callbackUrl?: string; callbackURL?: string; inferenceApiKey?: { name?: string; value?: string } };
      pipelineResponseConfig?: { taskType?: string; config?: { serviceId?: string }[] }[];
    };
    const ep = j.pipelineInferenceAPIEndPoint;
    const url = ep?.callbackUrl ?? ep?.callbackURL;
    const key = ep?.inferenceApiKey?.value;
    if (!url || !key) return null;
    const serviceId = j.pipelineResponseConfig?.find(c => c.taskType === "tts")?.config?.[0]?.serviceId;
    bhashiniConfig = { at: Date.now(), byLang: new Map([...(fresh ? bhashiniConfig!.byLang : []), [lang, { url, header: ep?.inferenceApiKey?.name || "Authorization", key, serviceId }]]) };
  }
  return bhashiniConfig!.byLang.get(lang) ?? null;
}

async function bhashini(text: string, lang: string): Promise<Audio | null> {
  const code = lang === "en-IN" ? "en" : lang;
  const target = await bhashiniTarget(code);
  if (!target) return null;
  const serviceId = target.serviceId ?? BHASHINI_SERVICE[code];
  if (!serviceId) return null;
  const res = await withTimeout(TIMEOUT_MS, signal => fetch(target.url, {
    method: "POST", signal,
    headers: { "Content-Type": "application/json", [target.header]: target.key },
    body: JSON.stringify({
      pipelineTasks: [{ taskType: "tts", config: { language: { sourceLanguage: code }, serviceId, gender: "female" } }],
      inputData: { input: [{ source: text }], audio: [{ audioContent: null }] },
    }),
  }));
  // Bhashini's own reply text goes to the server log so a refusal can be diagnosed; it never echoes the key.
  if (!res.ok) {
    // Length and the five characters the Bhashini dashboard itself shows unmasked: enough to tell which key was pasted.
    console.warn(`[gini-tts] bhashini ${code} ${serviceId} -> HTTP ${res.status} (key ${target.key.length} chars, starts ${target.key.slice(0, 5)}): ${(await res.text().catch(() => "")).slice(0, 300)}`);
    return null;
  }
  const j = await res.json() as { pipelineResponse?: { taskType?: string; audio?: { audioContent?: string }[] }[] };
  const b64 = j.pipelineResponse?.find(p => p.taskType === "tts")?.audio?.[0]?.audioContent;
  if (!b64) {
    console.warn(`[gini-tts] bhashini ${code} ${serviceId} -> no audio: ${JSON.stringify(j).slice(0, 300)}`);
    return null;
  }
  const bytes = toPcm16Wav(Buffer.from(b64, "base64"));
  return bytes.length > 100 ? { bytes, type: "audio/wav", provider: "bhashini" } : null;
}

/**
 * Bhashini returns 32-bit float WAV (format 3, measured 2026-10-29): 2.5 MB for 30 s, and not every
 * phone browser plays float WAV. Rewrite it as ordinary 16-bit PCM, which every browser plays, at half
 * the size. Anything that is not float WAV is returned untouched.
 */
export function toPcm16Wav(src: Buffer): Buffer {
  if (src.length < 44 || src.toString("ascii", 0, 4) !== "RIFF" || src.toString("ascii", 8, 12) !== "WAVE") return src;
  let fmt = -1, data = -1, dataLen = 0;
  for (let o = 12; o + 8 <= src.length;) {
    const id = src.toString("ascii", o, o + 4), len = src.readUInt32LE(o + 4);
    if (id === "fmt ") fmt = o + 8;
    if (id === "data") { data = o + 8; dataLen = Math.min(len, src.length - data); break; }
    o += 8 + len + (len & 1);
  }
  if (fmt < 0 || data < 0) return src;
  let tag = src.readUInt16LE(fmt);
  if (tag === 0xfffe) tag = src.readUInt16LE(fmt + 24);        // WAVE_FORMAT_EXTENSIBLE: real format is in the sub-format GUID
  const channels = src.readUInt16LE(fmt + 2), rate = src.readUInt32LE(fmt + 4), bits = src.readUInt16LE(fmt + 14);
  if (tag !== 3 || bits !== 32) return src;
  const n = Math.floor(dataLen / 4), out = Buffer.alloc(44 + n * 2);
  out.write("RIFF", 0, "ascii"); out.writeUInt32LE(36 + n * 2, 4); out.write("WAVE", 8, "ascii");
  out.write("fmt ", 12, "ascii"); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(channels, 22);
  out.writeUInt32LE(rate, 24); out.writeUInt32LE(rate * channels * 2, 28); out.writeUInt16LE(channels * 2, 32); out.writeUInt16LE(16, 34);
  out.write("data", 36, "ascii"); out.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, src.readFloatLE(data + i * 4)));
    out.writeInt16LE(Math.round(v < 0 ? v * 0x8000 : v * 0x7fff), 44 + i * 2);
  }
  return out;
}

/** Why the last synthesis failed, for the route's error reply. Never shown with any detail of a key. */
let lastProviderError = "";
export const providerError = () => lastProviderError || "no-provider";

/**
 * THE FREE TIER IS TEN A DAY, PER MODEL — measured 2026-10-22, from Google's own
 * 429: "limit: 10 requests per day on Free Tier". So both TTS models are tried
 * in turn (about twenty a day between them), and a model that has said it is
 * spent is not called again until the time it gave. That is a stopgap, not a
 * voice for a whole school: the real fix is Bhashini (free, needs the Captain's
 * registration) or billing on the Gemini key (his decision).
 */
const GEMINI_TTS_MODELS = (process.env.GEMINI_TTS_MODELS || "gemini-3.8-flash-lite-tts,gemini-3.8-flash-tts")
  .split(",").map(s => s.trim()).filter(Boolean);
const GEMINI_VOICE = process.env.GEMINI_TTS_VOICE || "Kore";
const spentUntil = new Map<string, number>();

/** "Please retry in 1h6m41s" -> milliseconds; a day if the message gives no time. */
function retryAfterMs(message: string): number {
  const m = message.match(/retry in\s*(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+(?:\.\d+)?)s)?/i);
  if (!m || (!m[1] && !m[2] && !m[3])) return 24 * 3600_000;
  return ((+(m[1] ?? 0)) * 3600 + (+(m[2] ?? 0)) * 60 + (+(m[3] ?? 0))) * 1000;
}

async function gemini(text: string, lang: string): Promise<Audio | null> {
  for (const model of GEMINI_TTS_MODELS) {
    if ((spentUntil.get(model) ?? 0) > Date.now()) { lastProviderError = "daily-quota"; continue; }
    const audio = await geminiModel(model, text, lang);
    if (audio) return audio;
  }
  return null;
}

async function geminiModel(model: string, text: string, lang: string): Promise<Audio | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const style = `a warm, calm Indian flight instructor speaking ${LANGUAGE_NAME[lang] ?? "Indian English"} clearly, at an easy classroom pace`;
  const res = await withTimeout(TIMEOUT_MS, signal => fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST", signal,
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      input: [{ type: "user_input", content: [{ type: "text", text, annotations: [{ type: "speech_metadata", style }] }] }],
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice: GEMINI_VOICE }] },
    }),
  }));
  if (!res.ok) {
    // 429 is either the per-minute limit (seen when nine languages were made
    // back to back) or the daily one. A daily refusal parks the model until the
    // time Google gives, so it is not asked again for nothing.
    const detail = res.status === 429 ? await res.text().catch(() => "") : "";
    if (res.status === 429 && /per day/i.test(detail)) {
      spentUntil.set(model, Date.now() + retryAfterMs(detail));
      lastProviderError = "daily-quota";
    } else {
      lastProviderError = res.status === 429 ? "quota" : `gemini-http-${res.status}`;
    }
    return null;
  }
  const j = await res.json() as { steps?: { content?: { type?: string; data?: string; mime_type?: string }[] }[] };
  const audio = (j.steps ?? []).flatMap(s => s.content ?? []).filter(c => c.type === "audio" && c.data).pop();
  if (!audio?.data) return null;
  const bytes = Buffer.from(audio.data, "base64");
  // The default is a 44-byte-header WAV; anything else is not something a browser can play as-is.
  if (bytes.length < 100 || bytes.subarray(0, 4).toString() !== "RIFF") return null;
  return { bytes, type: "audio/wav", provider: "gemini" };
}

/* ─────────────────────────────── the cache ──────────────────────────────── */

/**
 * The same reply is often heard twice (Listen after Voice Mode, a refresh). A
 * small per-instance cache saves a provider call each time. In-memory, so it
 * resets with the instance, which is fine for a cache.
 */
const CACHE_MAX_BYTES = 24 * 1024 * 1024;
const cache = new Map<string, Audio>();
let cacheBytes = 0;

function remember(k: string, a: Audio) {
  cache.set(k, a);
  cacheBytes += a.bytes.length;
  for (const [old, v] of cache) {
    if (cacheBytes <= CACHE_MAX_BYTES) break;
    cache.delete(old);
    cacheBytes -= v.bytes.length;
  }
}

/** Speak `text` in `lang`. Null only when every provider failed. */
export async function synthesize(text: string, lang: string): Promise<Audio | null> {
  const k = createHash("sha1").update(`${lang}\u0000${text}`).digest("hex");
  const hit = cache.get(k);
  if (hit) return hit;
  let audio: Audio | null = null;
  if (bhashiniConfigured()) {
    try { audio = await bhashini(text, lang); } catch (e) { console.warn(`[gini-tts] bhashini ${lang} threw: ${String(e).slice(0, 200)}`); audio = null; }
  }
  if (!audio) {
    try { audio = await gemini(text, lang); } catch { audio = null; }
  }
  if (audio) remember(k, audio);
  return audio;
}
