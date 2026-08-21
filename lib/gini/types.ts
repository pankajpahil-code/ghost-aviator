/**
 * GINI'S REPLY SHAPE — shared by every layer that can put words in his mouth.
 *
 * Split out of knowledge.ts on 2026-08-20 so the persona and marketing layers
 * can produce replies without importing the retrieval layer (and, through it,
 * the whole 4,400-question bank). A circular import between the router and the
 * things it routes to is the other way this ends, and it is worse.
 */

/**
 * THE MOODS HE CAN WEAR. Defined here, in the layer that CHOOSES them, rather
 * than in the sprite component that renders them — persona.ts and marketing.ts
 * both pick a face for what they are about to say, and a second copy of this
 * union in the component would drift the moment a sprite is added or renamed.
 * GiniSprite.tsx re-exports this and maps each name to its frame.
 */
export type GiniMood =
  | "idle" | "fly" | "thunder" | "talk" | "happy"
  | "laugh" | "angry" | "surprised" | "point" | "present_book";

export type GiniSource =
  | { type: "faq"; question: string }
  | { type: "explanation"; subjectId: string; chapterId?: string }
  | { type: "key-fact"; subjectId: string; chapterId: string }
  | { type: "structure" }
  /** The Captain's own words about his own school — greetings, method, offers. */
  | { type: "captain" };

export type GiniReply =
  | { kind: "answer"; text: string; source: GiniSource; href?: string }
  | { kind: "refusal"; text: string; reason: RefusalReason };

export type RefusalReason =
  | "no-explanation"      // the question exists but its explanation is a placeholder
  | "not-verified"        // we hold nothing verified on this
  | "needs-figure"        // the explanation refers to a diagram the student cannot see
  | "out-of-scope";       // not something Gini is allowed to answer at all

/**
 * The refusal sentences. Deliberately plain: they admit the gap and point at
 * the human who can close it, rather than dressing a guess up as an answer.
 *
 * These are the most important strings in the whole feature. Everything else
 * Gini says is a convenience; this is the promise.
 */
export const REFUSALS: Record<RefusalReason, string> = {
  "no-explanation":
    "The answer is marked, but nobody has written the explanation for this one yet — so I won't invent one. Work through it with the notes for this chapter.",
  "not-verified":
    "I don't have a verified answer for that, and I'm not going to guess at it. Ask Capt. Pahil — the WhatsApp group is the fastest way to reach him.",
  "needs-figure":
    "This one depends on a diagram you can't see from here, so reading it out would mislead you. Open the chapter notes instead.",
  "out-of-scope":
    "That's outside what I can answer. I stick to this site, its chapters, and the questions in the bank.",
};

export const refuse = (reason: RefusalReason): GiniReply => ({
  kind: "refusal",
  text: REFUSALS[reason],
  reason,
});

export const answer = (
  text: string,
  source: GiniSource,
  href?: string,
): GiniReply => ({ kind: "answer", text, source, href });
