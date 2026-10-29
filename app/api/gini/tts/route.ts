/**
 * GINI'S VOICE — POST { text, lang, token } -> audio/wav.
 *
 * Speaks only Gini's own replies: `token` is the HMAC /api/gini returned with
 * the reply (lib/gini/tts.ts speakToken). Anything else is refused before a
 * provider is called, so this cannot be used as a free text-to-speech service.
 *
 * Providers, quota and what is and is not tested are documented in
 * lib/gini/tts.ts. Every failure is a clean JSON error; the browser then
 * decides what it can do locally, and never reads Indian script with an
 * English voice.
 */

import { synthesize, tokenMatches, textForSpeech, shortLang, MAX_TTS_CHARS, providerError } from "@/lib/gini/tts";

export const dynamic = "force-dynamic";
/** One provider call of up to 20 s, plus headroom so the function itself always answers. */
export const maxDuration = 30;

/* Per-instance limits, the same reasoning as /api/gini: they stop a casual
   flood from one address, and the token already stops strangers' text. */
const WINDOW_MS = 60_000;
const PER_IP_PER_MIN = 12;
const DAY_MS = 86_400_000;
const SOFT_DAILY_CAP = 600;
type Bucket = { count: number; resetAt: number };
const perIp = new Map<string, Bucket>();
let daily: Bucket = { count: 0, resetAt: Date.now() + DAY_MS };

function overLimit(ip: string, now: number): boolean {
  if (now > daily.resetAt) daily = { count: 0, resetAt: now + DAY_MS };
  if (daily.count >= SOFT_DAILY_CAP) return true;
  const b = perIp.get(ip);
  if (!b || now > b.resetAt) perIp.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  else if (b.count >= PER_IP_PER_MIN) return true;
  else b.count++;
  if (perIp.size > 5000) for (const [k, v] of perIp) if (now > v.resetAt) perIp.delete(k);
  daily.count++;
  return false;
}

const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

export async function POST(req: Request) {
  let body: { text?: unknown; lang?: unknown; token?: unknown };
  try { body = await req.json(); } catch { return Response.json({ ok: false, why: "bad-body" }, { status: 400 }); }

  const original = typeof body.text === "string" ? body.text.trim() : "";
  if (!original || original.length > 2000) return Response.json({ ok: false, why: "bad-text" }, { status: 400 });
  if (!tokenMatches(original, body.token)) return Response.json({ ok: false, why: "not-a-gini-reply" }, { status: 403 });
  if (overLimit(clientIp(req), Date.now())) return Response.json({ ok: false, why: "rate-limited" }, { status: 429 });

  const text = textForSpeech(original).slice(0, MAX_TTS_CHARS);
  if (!text) return Response.json({ ok: false, why: "nothing-to-say" }, { status: 400 });
  const lang = shortLang(typeof body.lang === "string" ? body.lang : "en-IN");

  const audio = await synthesize(text, lang);
  if (!audio) {
    const why = providerError();
    return Response.json({ ok: false, why }, { status: why === "quota" || why === "daily-quota" ? 429 : 503 });
  }

  return new Response(new Uint8Array(audio.bytes), {
    status: 200,
    headers: {
      "Content-Type": audio.type,
      "Content-Length": String(audio.bytes.length),
      "Cache-Control": "private, max-age=3600",
      "X-Gini-Voice": audio.provider,
    },
  });
}
