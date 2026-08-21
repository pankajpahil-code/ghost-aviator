/**
 * GINI'S SMART ROUTE — where Gemini is allowed to help, and where it is not.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * THE CONTRACT, decided by the Captain on 2026-08-21:
 *
 *   Gemini ROUTES. The corpus SPEAKS.
 *
 * The model is handed a numbered menu of answers that already exist in this
 * repository and picks one; the server then returns THAT STORED TEXT, verbatim.
 * The model's own prose is accepted only for the conversational half — hello,
 * small talk, what this site is, what the Captain teaches — and every word of
 * that is run through lib/gini/guard.ts before it leaves.
 *
 * So Iron Rule 1 is not being trusted to a prompt. A jailbroken model, a bad
 * day, a future model swap: none of them can put an invented aviation fact in
 * front of a student, because the aviation text never comes from the model.
 *
 * FREE TIER, NO BILLING. The Captain chose not to enable billing, so the worst
 * case is a 429 and there is no possible bill. That makes quota, not money, the
 * thing worth protecting: a scraper could burn a day's requests in minutes and
 * lock real students out. Hence the limits below.
 *
 * EVERY FAILURE RETURNS ok:false, and the browser answers locally instead. No
 * key, no quota, timeout, garbled reply, guard rejection — the student simply
 * gets the deterministic Gini and never sees an error.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { readContext } from "@/lib/gini/context";
import { buildCandidates } from "@/lib/gini/candidates";
import { buildPrompt } from "@/lib/gini/prompt";
import { systemBrief, ALLOWED_HREFS } from "@/lib/gini/brief";
import { geminiConfigured, routeWithGemini } from "@/lib/gini/gemini";
import { guardModelProse, isAllowedHref } from "@/lib/gini/guard";

/** Never prerendered, never cached — every request is a different question. */
export const dynamic = "force-dynamic";

/* ──────────────────────────── protecting the quota ──────────────────────── */

/**
 * In-memory and therefore per-instance, which is a real limitation worth
 * stating plainly rather than papering over: on a serverless platform these
 * counters reset when an instance recycles and are not shared between
 * instances. They stop a casual flood from one address, not a determined
 * distributed one.
 *
 * That is deliberately not over-engineered, because with billing off the
 * downside is bounded — Google stops answering and the site falls back to the
 * deterministic Gini. If a real abuse pattern shows up, the durable version
 * belongs in the database this project already has (lib/supabase.ts), not here.
 */
const WINDOW_MS = 60_000;
const PER_IP_PER_MIN = 8;
const DAY_MS = 86_400_000;
const SOFT_DAILY_CAP = 1_200;

type Bucket = { count: number; resetAt: number };
const perIp = new Map<string, Bucket>();
let daily: Bucket = { count: 0, resetAt: Date.now() + DAY_MS };

function overLimit(ip: string, now: number): string | null {
  if (now > daily.resetAt) daily = { count: 0, resetAt: now + DAY_MS };
  if (daily.count >= SOFT_DAILY_CAP) return "daily-cap";
  const b = perIp.get(ip);
  if (!b || now > b.resetAt) {
    perIp.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else if (b.count >= PER_IP_PER_MIN) {
    return "per-ip";
  } else {
    b.count++;
  }
  // Keep the map from growing without bound on a long-lived instance.
  if (perIp.size > 5000) {
    for (const [k, v] of perIp) if (now > v.resetAt) perIp.delete(k);
  }
  daily.count++;
  return null;
}

const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";

/* ─────────────────────────────── the handler ────────────────────────────── */

const MAX_Q = 300;

export async function POST(req: Request) {
  // Nothing configured: answer instantly and cheaply so the client stops asking.
  if (!geminiConfigured()) return Response.json({ ok: false, why: "not-configured" });

  let body: { q?: unknown; path?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, why: "bad-body" }, { status: 400 });
  }

  const q = typeof body.q === "string" ? body.q.trim() : "";
  const path = typeof body.path === "string" ? body.path : "/";
  if (!q || q.length > MAX_Q) return Response.json({ ok: false, why: "bad-query" }, { status: 400 });

  const limited = overLimit(clientIp(req), Date.now());
  if (limited) return Response.json({ ok: false, why: limited }, { status: 429 });

  const ctx = readContext(path);
  const candidates = buildCandidates(q, ctx);
  const byId = new Map(candidates.map(c => [c.id, c]));

  const prompt = buildPrompt(q, ctx, candidates);

  const { decision, error } = await routeWithGemini(systemBrief(), prompt);

  if (!decision) {
    // Expected on the free tier once the day's quota is gone. Not an error the
    // student should ever see; the browser answers locally.
    return Response.json({ ok: false, why: error });
  }

  if (decision.mode === "pick") {
    const chosen = decision.id ? byId.get(String(decision.id).trim()) : undefined;
    // A hallucinated id is a fallback, never a guess at what it meant.
    if (!chosen || chosen.reply.kind !== "answer") {
      return Response.json({ ok: false, why: "bad-pick" });
    }
    return Response.json({
      ok: true,
      kind: "answer",
      text: chosen.reply.text,          // STORED text, verbatim. Not the model's.
      href: chosen.reply.href ?? null,
      via: chosen.kind,
    });
  }

  if (decision.mode === "talk") {
    const verdict = guardModelProse(decision.reply ?? "");
    if (!verdict.ok) {
      // One bad sentence discredits the repaired one too — drop it entirely.
      return Response.json({ ok: false, why: `guard:${verdict.why}` });
    }
    // A path written into the prose but not returned as `href` leaves the
    // student reading "…at /live-classes" with nothing to click. Recover it —
    // but only if it is a real page, so this can never manufacture a link.
    const declared = decision.href && isAllowedHref(decision.href, ALLOWED_HREFS)
      ? decision.href
      : null;
    const mentioned = (decision.reply ?? "").match(/\/[a-z0-9-]+(?:\/[a-z0-9-]+)*/gi)
      ?.find(p => ALLOWED_HREFS.has(p)) ?? null;
    const href = declared ?? mentioned;
    return Response.json({
      ok: true,
      kind: "answer",
      text: (decision.reply ?? "").trim(),
      href,
      via: "talk",
    });
  }

  return Response.json({ ok: false, why: "none" });
}
