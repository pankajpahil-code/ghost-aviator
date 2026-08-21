/**
 * THE CLIENT SIDE OF THE SMART ROUTE.
 *
 * Tries the server (which asks Gemini to pick from verified answers) and
 * returns null the moment anything is not perfect, because null means "use the
 * Gini that has always worked".
 *
 * THE FALLBACK IS THE FEATURE, not the error path. The Captain is on Gemini's
 * free tier with billing off, so the daily quota running out is an ordinary
 * event — most likely in the evening, which is exactly when Indian students are
 * studying. On that day Gini quietly goes back to being the deterministic
 * assistant that shipped on 2026-08-20: greetings, FAQ, course answers, chapter
 * lookup and bank search all still work. Nobody sees a failure.
 *
 * Once the server says it has no key, this stops asking for the rest of the
 * page's life — there is no point paying a round trip per question to be told
 * the same thing.
 */

import type { GiniReply } from "./types";
import type { GiniContext } from "./context";

let disabled = false;

/** Reset by a full page load; exported for tests and for a manual retry. */
export const smartDisabled = () => disabled;

/** Longer than the server's own 9s deadline, so the server always gives up first. */
const TIMEOUT_MS = 12000;

export async function askSmart(query: string, ctx: GiniContext): Promise<GiniReply | null> {
  if (disabled) return null;

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("/api/gini", {
      method: "POST",
      signal: ctl.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, path: ctx.pathname }),
    });
    if (!res.ok && res.status !== 429) {
      if (res.status >= 500) disabled = true;   // the route is broken, stop trying
      return null;
    }
    const data = await res.json() as {
      ok?: boolean; kind?: string; text?: string; href?: string | null; why?: string;
    };

    if (data?.why === "not-configured") { disabled = true; return null; }
    if (!data?.ok || data.kind !== "answer" || typeof data.text !== "string" || !data.text.trim()) {
      return null;
    }

    return {
      kind: "answer",
      text: data.text,
      source: { type: "captain" },
      href: data.href ?? undefined,
    } satisfies GiniReply;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
