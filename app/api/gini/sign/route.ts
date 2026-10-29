/**
 * VOICE PERMISSION FOR GINI'S OWN LOCAL ANSWERS (2026-10-29).
 *
 * When Gemini is down or slow, the browser answers from Gini's verified corpus
 * (askDeep). Those answers carried no speak token, so the server voice refused
 * them and the device's own voice read them instead (an American English voice
 * on the Captain's machine, which he heard as a poor accent).
 *
 * This route re-derives the same answer on the server and signs it only when the
 * text matches word for word. So it still speaks nothing but what Gini himself
 * would say to that question on that page; arbitrary text gets no token.
 */
import { askDeep, readContext } from "@/lib/gini/knowledge";
import { speakToken } from "@/lib/gini/tts";

export const maxDuration = 10;

const MAX_Q = 500;
const MAX_TEXT = 2000;
const PATH_SHAPE = /^\/[A-Za-z0-9/._~-]{0,199}$/;
const SUBJECT_SHAPE = /^[a-z0-9-]{1,40}$/;

export async function POST(req: Request) {
  let body: { q?: unknown; path?: unknown; subjectId?: unknown; text?: unknown };
  try { body = await req.json(); } catch { return Response.json({ ok: false, why: "bad-body" }, { status: 400 }); }

  const q = typeof body.q === "string" ? body.q.trim() : "";
  const text = typeof body.text === "string" ? body.text : "";
  if (!q || q.length > MAX_Q || !text || text.length > MAX_TEXT) return Response.json({ ok: false, why: "bad-input" }, { status: 400 });
  const path = typeof body.path === "string" && PATH_SHAPE.test(body.path) ? body.path : "/";

  const ctx = readContext(path);
  // The browser may stand in the subject the student was last talking about when the page names none.
  const asked = !ctx.subjectId && typeof body.subjectId === "string" && SUBJECT_SHAPE.test(body.subjectId)
    ? { ...ctx, subjectId: body.subjectId }
    : ctx;

  let reply;
  try { reply = await askDeep(q, asked); } catch { return Response.json({ ok: false, why: "lookup-failed" }); }
  if (reply.kind !== "answer" || reply.text !== text) return Response.json({ ok: false, why: "not-a-gini-reply" }, { status: 403 });
  return Response.json({ ok: true, speak: speakToken(text) });
}
