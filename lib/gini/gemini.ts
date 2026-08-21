/**
 * THE GEMINI CLIENT — deliberately small, deliberately paranoid.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * WHAT THIS IS ALLOWED TO RETURN: a routing decision. An id from a menu, or a
 * short conversational line about the site. It is never the source of an
 * aviation sentence — see lib/gini/candidates.ts for why that is a property of
 * the wiring rather than of the prompt.
 *
 * EVERY FAILURE PATH ENDS IN null. No key, bad key, quota exhausted, timeout,
 * network down, malformed JSON, unexpected response shape, a future change to
 * Google's API — all of it returns null, and the caller falls back to the
 * deterministic Gini that shipped on 2026-08-20. The Captain chose the free
 * tier and no billing, so running out of quota is an EXPECTED daily event, not
 * an error condition. A student must never see a broken mascot because of it.
 *
 * THE REQUEST SHAPE IS VERIFIED, NOT REMEMBERED. Checked against
 * ai.google.dev on 2026-08-21: POST /v1beta/interactions with `model`, `input`,
 * `system_instruction`, `response_format`, and the key in an `x-goog-api-key`
 * header. This is NOT the older `models/{id}:generateContent` + `contents` +
 * `generationConfig` shape that a model trained before the change will produce
 * from memory. The response reader below accepts several plausible shapes on
 * purpose, so a Google-side change degrades to the fallback rather than to a
 * crash — but if it starts always falling back, re-read the current docs before
 * assuming the key is at fault.
 * ────────────────────────────────────────────────────────────────────────────
 */

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";

/**
 * Fastest and cheapest of the current line, which is right for this job: the
 * hard part is understanding one short question, not composing an essay.
 * Overridable so the model can be changed without a code edit.
 */
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

/**
 * A student is waiting. Past this, the local answer is better than a slow one.
 *
 * MEASURED, NOT GUESSED (2026-08-21, from India): a trivial call to this model
 * returns in 3.2-4.3s, median 3.7s. A real request carries the site brief and a
 * candidate menu on top of that. The first value here was 6s and it timed out on
 * 3 of 10 live probes — every one of them a timeout rather than a wrong answer,
 * which is the cheapest possible failure but still a wasted call and a student
 * who got the offline answer when a better one existed.
 *
 * 9s is chosen so that a normal call has clear headroom while a genuinely stuck
 * one still hands back before the student gives up. The client waits longer than
 * this on purpose (lib/gini/smart.ts), so the server's deadline is always the
 * one that fires first and the browser never gives up on a call still in flight.
 */
const TIMEOUT_MS = 9000;

export const geminiConfigured = (): boolean => !!process.env.GEMINI_API_KEY;

/** What the router is allowed to decide. Anything else is treated as "none". */
export type RouterDecision = {
  /** "pick" = use stored answer `id`. "talk" = the model's own words. "none" = fall back. */
  mode: "pick" | "talk" | "none";
  id?: string | null;
  reply?: string | null;
  href?: string | null;
};

const SCHEMA = {
  type: "object",
  properties: {
    mode: { type: "string", enum: ["pick", "talk", "none"] },
    id: { type: "string", description: "The number of the chosen menu entry, when mode is pick." },
    reply: { type: "string", description: "Your own words, ONLY when mode is talk." },
    href: { type: "string", description: "Optional site path from the allowed list." },
  },
  required: ["mode"],
} as const;

/**
 * Pull the text out of whatever Google sent back. Written against the documented
 * `output_text` convenience and the `steps[].content[].text` path, with the
 * older `candidates[].content.parts[].text` accepted too — cheap insurance.
 */
function extractText(body: unknown): string | null {
  const b = body as Record<string, unknown> | null;
  if (!b || typeof b !== "object") return null;

  if (typeof b.output_text === "string" && b.output_text.trim()) return b.output_text;

  const fromBlocks = (blocks: unknown): string | null => {
    if (!Array.isArray(blocks)) return null;
    const parts = blocks
      .map(x => (x && typeof x === "object" ? (x as Record<string, unknown>).text : null))
      .filter((t): t is string => typeof t === "string" && !!t.trim());
    return parts.length ? parts.join("") : null;
  };

  const steps = b.steps;
  if (Array.isArray(steps) && steps.length) {
    const last = steps[steps.length - 1] as Record<string, unknown> | undefined;
    const t = fromBlocks(last?.content);
    if (t) return t;
  }

  const candidates = b.candidates;
  if (Array.isArray(candidates) && candidates.length) {
    const c = candidates[0] as Record<string, unknown>;
    const content = c?.content as Record<string, unknown> | undefined;
    const t = fromBlocks(content?.parts);
    if (t) return t;
  }

  return null;
}

/** Tolerate a model that wraps its JSON in prose or a code fence. */
function parseDecision(text: string): RouterDecision | null {
  const raw = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const o = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
    const mode = o.mode;
    if (mode !== "pick" && mode !== "talk" && mode !== "none") return null;
    return {
      mode,
      id: typeof o.id === "string" ? o.id : null,
      reply: typeof o.reply === "string" ? o.reply : null,
      href: typeof o.href === "string" ? o.href : null,
    };
  } catch {
    return null;
  }
}

export type RouteOutcome =
  | { decision: RouterDecision; error?: undefined }
  | { decision: null; error: string };

/**
 * One call. Never throws. `error` is for the server log, never for the student.
 */
export async function routeWithGemini(
  systemInstruction: string,
  userPrompt: string,
): Promise<RouteOutcome> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { decision: null, error: "no-key" };

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: ctl.signal,
      headers: {
        "x-goog-api-key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        input: userPrompt,
        system_instruction: systemInstruction,
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: SCHEMA,
        },
        generation_config: { temperature: 0.3 },
      }),
    });

    if (!res.ok) {
      // 429 is the expected steady state on the free tier once the day's quota
      // is gone. It is not a fault and it is not worth alarming about.
      const detail = res.status === 429 ? "quota" : `http-${res.status}`;
      return { decision: null, error: detail };
    }

    const text = extractText(await res.json());
    if (!text) return { decision: null, error: "unreadable-response" };

    const decision = parseDecision(text);
    if (!decision) return { decision: null, error: "unparseable-json" };

    return { decision };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return { decision: null, error: aborted ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}
