// ADAPT — building the rows saved to a signed-in student's account.
//
// The pure half of lib/adapt/results.ts. Everything here can be reasoned about
// and tested without a browser or a database, which matters because this is the
// module that decides WHAT LEAVES THE DEVICE.
//
// ── The one rule ───────────────────────────────────────────────────────────
//
// A row may carry a score and the breakdown of a score. It may never carry:
//
//   * a question or an answer;
//   * a tracking sample or a reaction time;
//   * anything at all from the attitudes questionnaire beyond the bare fact
//     that it was completed — no attitude, no tally, no profile, no scenario.
//
// The last of those is the important one. A hazardous-attitude profile is the
// most sensitive thing this feature touches and a good share of these students
// are 17 or 18. Signing in does not change that; an account makes the data more
// identifying, not less. `results-core.test.mjs` fails if a row ever contains
// one of these, and that test is the guarantee — not this comment, and not care.
//
// ── Why the breakdown IS included ─────────────────────────────────────────
//
// Capt. Pahil's purpose for this data is improving the simulator, and a bare
// stanine cannot do that. Per-family accuracy shows which generators produce
// questions that are too hard; per-tier accuracy shows whether the difficulty
// ramp is real or imagined; the per-phase composites show where students
// actually run out of capacity. None of those is an answer, and all of them are
// aggregates over a paper the student has already finished.

import { reportLine } from "./bands.mjs";

/** Fields that must never appear anywhere in a saved row, at any depth. */
export const FORBIDDEN_KEYS = [
  "answers", "answer", "responses", "chosen", "items", "item", "stem", "options",
  "attitude", "attitudes", "tally", "profile", "scenario", "scenarios",
  "samples", "reactionTimes", "rt",
];

const pct = (v) => (Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : null);

/**
 * The breakdown stored alongside a knowledge score.
 * Counts only — `{correct, total}` per bucket, never which items.
 */
function knowledgeDetail(r) {
  const tiers = {};
  for (const t of r.tiers ?? []) {
    tiers[t.tier] = { label: t.label, correct: t.correct, total: t.total };
  }
  const families = {};
  for (const [name, f] of Object.entries(r.byFamily ?? {})) {
    families[name] = { correct: f.correct, total: f.total };
  }
  return {
    correct: r.correct,
    total: r.total,
    unanswered: r.unanswered,
    tiers,
    families,
    ...(r.ceiling ? { ceiling: { tier: r.ceiling.tier, correct: r.ceiling.correct, total: r.ceiling.total } } : {}),
  };
}

/**
 * The breakdown stored alongside a multitasking score.
 *
 * `scoreDividedAttention` nests the stream figures one level down, under
 * `detail`. Reading them off the wrapper instead produced a row that saved
 * successfully with every stream null and no phases — a silent data loss that
 * only a test against a genuinely scored session catches, which is why the
 * fixture in results-core.test.mjs scores a real one rather than hand-writing
 * a result object.
 */
function dividedDetail(wrapper) {
  const r = wrapper.detail ?? {};
  return {
    composite: pct(r.composite ?? wrapper.composite),
    monitor: pct(r.monitor?.accuracy == null ? null : r.monitor.accuracy * 100),
    radio: pct(r.radio?.accuracy == null ? null : r.radio.accuracy * 100),
    arithmetic: pct(r.arithmetic?.accuracy == null ? null : r.arithmetic.accuracy * 100),
    weakest: r.weakest ?? wrapper.weakest ?? null,
    collapsePhase: r.collapsePhase ?? null,
    phases: (r.phases ?? []).map((p) => ({ key: p.key, composite: pct(p.composite) })),
  };
}

/** The breakdown stored alongside a tracking score: the SHAPE of the run, not its samples. */
function trackingDetail(r) {
  return {
    cancellation: pct(r.cancellation),
    fade: Number.isFinite(r.fade) ? r.fade : null,
    endurance: r.endurance ?? null,
    minutes: (r.segments ?? []).map((s) => pct(s.cancellation)),
    anomalies: (r.anomalies ?? []).map((a) => a.code),
  };
}

/**
 * Turn one finished session into the rows to save.
 *
 * Returns [] when there is no user — never a row with a null user_id, which RLS
 * would reject anyway but which should not be constructed in the first place.
 */
export function buildResultRows(seed, results, userId) {
  if (!userId || !Number.isInteger(seed)) return [];

  return (results ?? [])
    .filter((r) => r && typeof r.moduleId === "string")
    .map((r) => {
      const base = {
        user_id: userId,
        session_seed: seed,
        module_id: r.moduleId,
        module_kind: r.kind,
        stanine: null,
        sten: null,
        band: null,
        headline_pct: null,
        detail: {},
        input_class: null,
        duration_sec: Number.isFinite(r.durationSec) ? Math.round(r.durationSec) : null,
        completed: true,
      };

      // The questionnaire records COMPLETION AND NOTHING ELSE. Deliberately the
      // first branch, and deliberately returning `base` rather than spreading
      // anything from `r` — so no future field added to a personality result
      // can be swept along by accident.
      if (r.kind === "behavioural") {
        return { ...base, completed: Boolean(r.profile?.complete), duration_sec: null };
      }

      const line = Number.isInteger(r.stanine) ? reportLine(r.stanine, r.basis) : null;
      const scored = {
        ...base,
        stanine: line?.stanine ?? null,
        sten: line?.sten ?? null,
        band: line?.band?.key ?? null,
      };

      if (r.kind === "knowledge") {
        return { ...scored, headline_pct: pct((r.correct / r.total) * 100), detail: knowledgeDetail(r) };
      }
      if (r.kind === "psychomotor") {
        return { ...scored, headline_pct: pct(r.cancellation), detail: trackingDetail(r), input_class: r.inputClass ?? null };
      }
      if (r.kind === "divided-attention") {
        return { ...scored, headline_pct: pct(r.composite), detail: dividedDetail(r) };
      }
      return scored;
    });
}

/**
 * Deep scan for anything a row must never carry.
 *
 * Exported so the test can assert the guarantee against REAL results rather
 * than against a hand-written fixture, and so the sync layer can refuse to send
 * a row that somehow acquired one. A guarantee checked only in a test is a
 * guarantee that holds only in the test.
 */
export function findForbidden(value, path = "") {
  if (value === null || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const hit = findForbidden(value[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  for (const [k, v] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.includes(k)) return `${path}.${k}`;
    const hit = findForbidden(v, `${path}.${k}`);
    if (hit) return hit;
  }
  return null;
}
