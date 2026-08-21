/**
 * THE MENU — what the router is allowed to choose from.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * This is the heart of the safe design. The model never receives a blank page
 * and a question; it receives a NUMBERED LIST of answers that already exist,
 * verified, in this repository, and its entire job is to return the number of
 * the one that fits. The reply the student sees is then the STORED text of that
 * entry, byte for byte, never the model's rendering of it.
 *
 * Two consequences worth being explicit about:
 *
 *   1. The model cannot state an aviation fact that is not already published
 *      here, because it does not author the aviation half of the reply at all.
 *      This holds even if the model is confidently wrong, jailbroken, swapped
 *      for a different model, or has a bad day — it is a property of the wiring,
 *      not of the prompt.
 *   2. Recall is what matters when building this list, not precision. A poor
 *      candidate on the menu is harmless because the model simply will not pick
 *      it. A good answer MISSING from the menu can never be given. So the floors
 *      here are far looser than the ones the deterministic router answers on.
 *
 * SERVER ONLY. It reaches into deep.ts and therefore the whole question bank.
 * Importing this from a client component would silently undo the bundle split
 * that keeps megabytes of questions off every page — so the guard below fails
 * loudly in a browser instead. (The `server-only` package would be the idiomatic
 * way to say this, but it is not a dependency of this project and one line of
 * runtime check is not worth adding one.)
 * ────────────────────────────────────────────────────────────────────────────
 */

if (typeof window !== "undefined") {
  throw new Error(
    "lib/gini/candidates.ts is server-only — importing it in the browser ships the whole question bank to every page.",
  );
}

import { answer, type GiniReply } from "./types";
import type { GiniContext } from "./context";
import { topFaq, topChapters } from "./knowledge";
import { topPitches } from "./marketing";
import { topBank, explainQuestion } from "./deep";

export type CandidateKind = "bank" | "faq" | "chapter" | "offer";

export type Candidate = {
  /** Short id the model returns. Valid only within this one request. */
  id: string;
  kind: CandidateKind;
  /** What the model reads — the question or topic, never the whole answer. */
  label: string;
  /**
   * The reply resolved UP FRONT, so the pick is a lookup in a map built in this
   * same request. Nothing is re-searched after the model answers, which means
   * there is no window in which an index could shift under us.
   */
  reply: GiniReply;
};

const BANK_N = 6;
const FAQ_N = 3;
const CHAPTER_N = 3;
const OFFER_N = 3;

export function buildCandidates(query: string, ctx: GiniContext): Candidate[] {
  const out: Candidate[] = [];
  let n = 0;
  const add = (kind: CandidateKind, label: string, reply: GiniReply) => {
    if (reply.kind !== "answer") return;      // never offer a refusal as a choice
    out.push({ id: String(++n), kind, label, reply });
  };

  // The Captain's own offers first — they are short, and a question about
  // classes or the WhatsApp group should not be crowded out by exam questions.
  for (const p of topPitches(query, ctx, OFFER_N)) {
    add("offer", `About Ghost Aviator: ${p.ask}`, answer(p.say(ctx), { type: "captain" }, p.href(ctx)));
  }

  for (const f of topFaq(query, FAQ_N)) {
    add("faq", f.q, answer(f.a, { type: "faq", question: f.q }, f.href));
  }

  for (const q of topBank(query, ctx.subjectId, BANK_N)) {
    const reply = explainQuestion(q);
    // Prefix kept identical to the deterministic path, so a student sees the
    // same "here is what I matched" framing however the pick was made.
    if (reply.kind === "answer") {
      add("bank", `Exam question: ${q.q.trim()}`, answer(
        `From the bank, on "${q.q.trim()}" — ${reply.text}`,
        reply.source,
        q.chapterId && q.subjectIds[0] ? `/cpl/${q.subjectIds[0]}/${q.chapterId}/questions` : undefined,
      ));
    }
  }

  for (const c of topChapters(query, CHAPTER_N)) {
    add("chapter", `Chapter that teaches this: ${c.label}`, answer(
      `That's taught in ${c.label}.`, { type: "structure" }, c.href,
    ));
  }

  return out;
}

/** Render the menu for the prompt. Labels only — answers are never sent. */
export const renderMenu = (cands: Candidate[]): string =>
  cands.map(c => `${c.id}. ${c.label}`).join("\n");
