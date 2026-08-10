// ADAPT — attempt history, the pure half.
//
// Storage and React live in history.ts; everything that can be reasoned about
// without a browser lives here so it can be tested.
//
// ── What is recorded, and what is deliberately not ─────────────────────────
//
// A record holds a stanine per module and nothing else. It does NOT hold the
// questions, the answers, the tracking samples, or a single thing from the
// attitudes questionnaire. Two reasons, and both are binding:
//
//   1. The page tells students "the whole test is generated and scored in your
//      browser; your answers and your results are yours; we do not collect
//      them." Storing responses — even locally — inches toward making that
//      sentence untrue, and the sentence is the promise.
//   2. A hazardous-attitude profile is the most sensitive thing this feature
//      touches, and a good share of these students are under 18. The safest
//      record of it is no record of it. History notes only that the
//      questionnaire was completed.

/** Records older than this are dropped, newest kept. Bounds localStorage growth. */
export const MAX_ATTEMPTS = 40;

/**
 * Turn a finished session into the one record we keep.
 * `results` is the mixed list the runner produces; `at` is an ISO timestamp
 * passed in rather than read from the clock, so this stays pure and testable.
 */
export function summariseSession(seed, results, at) {
  if (!Number.isInteger(seed)) throw new RangeError("an attempt needs its seed, so the paper can be re-sat");
  const modules = (results ?? [])
    .filter((r) => r && typeof r.moduleId === "string")
    .map((r) => {
      const base = { id: r.moduleId, name: r.moduleName, kind: r.kind };
      if (r.kind === "behavioural") {
        // Completion only. Never the profile — see the note at the top.
        return { ...base, completed: Boolean(r.profile?.complete) };
      }
      if (r.kind === "knowledge") {
        return { ...base, stanine: r.stanine, headline: `${r.correct}/${r.total}` };
      }
      if (r.kind === "psychomotor") {
        return { ...base, stanine: r.stanine, headline: r.cancellation == null ? "not completed" : `${Math.round(r.cancellation)}% cancelled` };
      }
      if (r.kind === "divided-attention") {
        return { ...base, stanine: r.stanine, headline: `${Math.round(r.composite)}%` };
      }
      return base;
    });

  const scored = modules.filter((m) => Number.isInteger(m.stanine));
  return {
    id: `${seed}-${at}`,
    seed,
    at,
    modules,
    /** Mean stanine across the scored modules — a headline, not a composite. */
    mean: scored.length ? Math.round((scored.reduce((s, m) => s + m.stanine, 0) / scored.length) * 10) / 10 : null,
  };
}

/** Newest first, capped. Pure — the caller owns storage. */
export function addAttempt(attempts, attempt, max = MAX_ATTEMPTS) {
  return [attempt, ...(attempts ?? []).filter((a) => a && a.id !== attempt.id)].slice(0, max);
}

/**
 * Best stanine ever reached per module, with how many times it has been sat.
 * "Best" rather than "latest" because a student's ceiling is the more
 * motivating number, and a bad night should not erase a good one.
 */
export function bestByModule(attempts) {
  const out = {};
  for (const a of attempts ?? []) {
    for (const m of a.modules ?? []) {
      if (!Number.isInteger(m.stanine)) continue;
      const cur = out[m.id];
      out[m.id] = {
        id: m.id,
        name: m.name,
        best: cur ? Math.max(cur.best, m.stanine) : m.stanine,
        latest: cur ? cur.latest : m.stanine, // attempts arrive newest first
        sittings: (cur?.sittings ?? 0) + 1,
      };
    }
  }
  return out;
}

/**
 * Stanines for one module over time, oldest first, for a sparkline.
 * Attempts where the module was not sat are skipped rather than zero-filled —
 * a module you did not attempt is not a score of zero.
 */
export function trendFor(attempts, moduleId) {
  return (attempts ?? [])
    .slice()
    .reverse()
    .map((a) => (a.modules ?? []).find((m) => m.id === moduleId))
    .filter((m) => m && Number.isInteger(m.stanine))
    .map((m) => m.stanine);
}

/**
 * Direction of travel over the last few sittings of a module.
 * Needs at least three points: two readings are noise, not a trend.
 */
export function movement(trend) {
  if (!trend || trend.length < 3) return null;
  const recent = trend.slice(-3);
  const earlier = trend.slice(0, -3);
  if (earlier.length === 0) return null;
  const avg = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const delta = avg(recent) - avg(earlier);
  if (delta >= 0.7) return "up";
  if (delta <= -0.7) return "down";
  return "steady";
}
