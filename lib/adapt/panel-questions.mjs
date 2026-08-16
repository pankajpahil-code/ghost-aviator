// ADAPT — the questions a selection panel may build from your questionnaire.
//
// ── Why this exists ────────────────────────────────────────────────────────
//
// From a candidate who published a walkthrough of his own real ADAPT report
// (2026-08-12, recorded in ADAPT_COMPETITIVE_AUDIT.md §6.1): the personality
// questionnaire's answers are used to generate questions for the final
// interview panel. His words — the questionnaire "automatically generates tough
// questions for your final interview panel".
//
// If that is right, and it matches how competency-based airline selection
// generally works, then the questionnaire is NOT a pass/fail gate. It is the
// raw material for the human conversation that follows. A student who
// understands that stops trying to guess "correct" answers and starts preparing
// to defend honest ones — which is both better preparation and better ethics.
//
// Nothing free in India tells a student this. That is why it is worth building.
//
// ── What this is, and what it is NOT ──────────────────────────────────────
//
// NOT the real test's questions. We have never seen them, and inventing some
// and implying they are real would be exactly the fabrication Iron Rule 1
// forbids. These are ORIGINAL competency-interview questions written against
// the published FAA hazardous-attitude model — the same model the questionnaire
// itself is scored on — so a student meets the SHAPE of the conversation their
// answers invite.
//
// The `listeningFor` line is the part that actually teaches. Anyone can guess a
// likely question; almost nobody tells a candidate what a panel is listening
// for underneath it. That is the difference between a question bank and
// coaching, and it is the half a student cannot get anywhere else for free.

/**
 * Questions per hazardous attitude, keyed to ATTITUDES in personality.mjs.
 *
 * Two each, deliberately: one asking for a past example, one asking for a
 * judgement. Panels use both, and a candidate rehearsed on only one is caught
 * out by the other.
 */
export const BY_ATTITUDE = {
  "anti-authority": [
    {
      question: "Tell me about a time you disagreed with a procedure, a checklist, or an instruction from someone senior to you. What did you do?",
      listeningFor:
        "Whether you raised it through a proper channel or simply worked around it. A panel is not looking for obedience — it is looking for someone who challenges correctly, at the right moment, and complies while the challenge is unresolved.",
    },
    {
      question: "When, if ever, is it right to depart from a standard operating procedure?",
      listeningFor:
        "That you can name the narrow case — an emergency where the SOP does not fit the situation in front of you — and that you treat it as rare and reportable. An answer with no limits, or one that says never under any circumstance, both read badly.",
    },
  ],
  impulsivity: [
    {
      question: "Describe a decision you made quickly that you later wished you had taken more time over.",
      listeningFor:
        "Whether you can identify the moment the decision was actually made, and what you have changed since. Panels are wary of candidates who cannot produce a single example — it usually means the reflection has not happened, not that the mistake has not.",
    },
    {
      question: "How do you tell the difference between a situation that needs immediate action and one that needs you to slow down?",
      listeningFor:
        "A method rather than an instinct. Naming memory items, a rate of change, or how much fuel or altitude you have in hand shows you have a rule you can apply under pressure, which is what survives when you are frightened.",
    },
  ],
  invulnerability: [
    {
      question: "Tell me about a time you were closer to a limit than you realised at the time.",
      listeningFor:
        "That you have one at all. Every honest pilot does. Claiming none reads as either inexperience or a lack of self-examination, and the second is the one that worries a panel.",
    },
    {
      question: "What is the most dangerous thing about the way you fly?",
      listeningFor:
        "A specific, current weakness and what you do to contain it. A rehearsed non-answer — \"I am too much of a perfectionist\" — is heard as evasion and usually invites a harder follow-up.",
    },
  ],
  macho: [
    {
      question: "Describe a time you turned back, diverted, or said no when others around you were continuing.",
      listeningFor:
        "Whether you can be the one who stops. Panels want evidence that social pressure does not move you, and that you made the call early rather than after it became unavoidable.",
    },
    {
      question: "Tell me about a time you were the least experienced person in the room and knew something was wrong.",
      listeningFor:
        "Whether you spoke, how you spoke, and whether you kept going when the first attempt was brushed aside. This is the assertiveness half of crew resource management, and it is scored as a skill rather than a personality trait.",
    },
  ],
  resignation: [
    {
      question: "Tell me about a situation that felt genuinely out of your control. What did you actually do?",
      listeningFor:
        "That you kept acting on the part you could still influence. Panels are listening for someone who narrows to what is controllable rather than someone who waits for the situation to resolve itself.",
    },
    {
      question: "Describe a time you changed an outcome that others had already accepted.",
      listeningFor:
        "Initiative under low authority — that you pushed when it would have been easier and entirely forgivable not to.",
    },
  ],
};

/**
 * Asked when a student answered two deliberately paired situations differently.
 *
 * A panel that sees an inconsistent profile does not conclude the candidate is
 * dishonest — it asks. This is the question they ask, and a student who has
 * never met it usually starts explaining the questionnaire instead of the
 * decision, which is the wrong instinct and reads as defensive.
 */
export const CONSISTENCY_QUESTION = {
  question: "Two situations in your questionnaire were close to identical, and you answered them differently. Walk me through how you would actually decide.",
  listeningFor:
    "The reasoning, not a defence of the questionnaire. Panels expect people to be inconsistent under different framings — what they are testing is whether you can explain your own thinking clearly when it is challenged.",
};

/** Below this, the paired answers disagreed enough to be worth asking about. */
export const CONSISTENCY_FLOOR = 0.6;

/** Most questions ever shown. More than this stops being preparation and becomes a wall. */
export const MAX_QUESTIONS = 5;

/**
 * The questions this student's own answers invite.
 *
 * Driven by the attitudes that actually showed up, strongest first — so two
 * students who answered differently get different sheets, which is the whole
 * point. A questionnaire that produces the same advice for everyone has not
 * read anything.
 *
 * Returns [] for an incomplete profile rather than guessing from a partial
 * one: a panel-question sheet built on three answered situations would look
 * authoritative and be close to meaningless.
 */
export function panelQuestionsFor(profile) {
  if (!profile || !profile.complete) return [];

  const ranked = (profile.ranked ?? [])
    .filter((r) => r && r.key && BY_ATTITUDE[r.key])
    .filter((r) => (r.net ?? r.most ?? 0) > 0);

  const out = [];
  // One from each attitude that showed up, before a second from any of them —
  // breadth first, so a student who leans two ways is asked about both rather
  // than drilled twice on the strongest.
  for (const depth of [0, 1]) {
    for (const r of ranked) {
      const q = BY_ATTITUDE[r.key][depth];
      if (q && out.length < MAX_QUESTIONS) out.push({ ...q, attitude: r.key });
    }
  }

  if (
    profile.consistency !== null &&
    profile.consistency !== undefined &&
    profile.consistency < CONSISTENCY_FLOOR &&
    out.length < MAX_QUESTIONS
  ) {
    out.push({ ...CONSISTENCY_QUESTION, attitude: null });
  }

  return out.slice(0, MAX_QUESTIONS);
}

/**
 * The sentence printed above the questions.
 *
 * Load-bearing, and not decoration. It has to do three things at once: explain
 * why these questions exist, make clear they are ours and not the real test's,
 * and stop a student memorising answers — because a rehearsed answer to a
 * competency question is the single most obvious thing in an interview room.
 */
export const PANEL_PREAMBLE =
  "In a real selection process your questionnaire answers do not pass or fail you on their own — they give the interview panel something to ask you about. These are not the real assessment's questions; they are ours, written against the same published attitude model your answers were read with, so the shape of the conversation is familiar. Do not memorise answers. Work out what is true for you, and be able to say it plainly.";
