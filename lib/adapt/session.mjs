// ADAPT — session assembly and scoring.
//
// A session is an ordered run of modules. Each module rolls its own paper from
// the session seed, runs against its own clock, and scores to a stanine; the
// session then reports a weighted composite. Same seed -> same session, so a
// student can re-sit the exact paper to beat their score and any result can be
// reproduced if it is ever disputed.

import { subSeed } from "./rng.mjs";
import { buildPaper } from "./items/paper.mjs";
import { stanineFor, compositeStanine, detectAnomalies } from "./stanine.mjs";
import * as mathsBank from "./items/maths.mjs";
import * as physicsBank from "./items/physics.mjs";
import * as spatialBank from "./items/spatial.mjs";

// ── The criterion cut ladder ───────────────────────────────────────────────
//
// Day-one scoring is standards-based (see stanine.mjs). These percentages are
// the raw score needed to REACH each stanine from 2 to 9, and the whole table
// is published to the student on the results page — a scoring rule a student
// cannot inspect is a scoring rule they have no reason to trust.
//
// The ladder is anchored at the two ends and interpolated between: stanine 9 is
// full marks inside the clock, stanine 7 is the 85% that marks a strong
// candidate, stanine 5 sits at the middle of the range. It is a judgement, it
// is stated as one, and it is replaced by measured norms once a module has 500
// attempts behind it.
export const PERCENT_LADDER = [30, 45, 55, 65, 75, 85, 95, 100];

/** Criterion norm for a paper of `total` items. Throws if the paper is too short to separate nine bands. */
export function criterionNormFor(total) {
  const cuts = PERCENT_LADDER.map((p) => Math.ceil((p / 100) * total));
  for (let i = 1; i < cuts.length; i++) {
    if (cuts[i] <= cuts[i - 1]) {
      throw new RangeError(
        `a ${total}-item paper cannot separate nine stanines (cut ${i + 2} would equal cut ${i + 1}); use at least 20 items`
      );
    }
  }
  return {
    mode: "criterion",
    direction: "higher-better",
    cuts,
    rationale: `Standards-based: ${PERCENT_LADDER.map((p, i) => `stanine ${i + 2} at ${p}%`).join(", ")} of ${total} items, answered inside the time limit.`,
  };
}

// ── Module registry ────────────────────────────────────────────────────────
//
// ⚠ ITEM COUNTS AND TIME LIMITS ARE PROVISIONAL.
// The figures commonly quoted for the real screening (20 questions in 30
// minutes for maths, and so on) trace to coaching-company blogs and vendor
// marketing, not to the airline or a published test manual. They are a
// reasonable working shape, and they are deliberately isolated HERE, in one
// table, so that the moment Capt. Pahil reports the real format — from sitting
// the official practice test or debriefing students who have sat the real one
// — this is the only place that changes. Nothing downstream hardcodes a count
// or a clock.

export const MODULES = {
  "aviation-maths": {
    id: "aviation-maths",
    name: "Aviation Maths",
    kind: "knowledge",
    blurb: "Speed, distance and time; fuel; descent rates; crosswind. No calculator.",
    itemCount: 20,
    timeLimitSec: 30 * 60,
    weight: 1,
    bank: mathsBank,
  },
  "physics-mechanical": {
    id: "physics-mechanical",
    name: "Physics & Mechanical Reasoning",
    kind: "knowledge",
    blurb: "Forces, motion, energy, moments and the effect of speed on lift.",
    itemCount: 20,
    timeLimitSec: 25 * 60,
    weight: 1,
    bank: physicsBank,
  },
  "spatial-pattern": {
    id: "spatial-pattern",
    name: "Spatial & Pattern Reasoning",
    kind: "knowledge",
    blurb: "Headings and turns, reading a direction indicator, number series and clock angles.",
    itemCount: 20,
    timeLimitSec: 20 * 60,
    weight: 1,
    bank: spatialBank,
  },
};

export const MODULE_IDS = Object.keys(MODULES);

// ── Assembly ───────────────────────────────────────────────────────────────

/**
 * Build a full session from one seed.
 * Each module derives its own stream from the session seed and its own id, so
 * adding or reordering modules never changes another module's paper.
 */
export function buildSession(seed, moduleIds = MODULE_IDS) {
  if (!Number.isInteger(seed)) throw new RangeError("seed must be an integer");
  if (!Array.isArray(moduleIds) || moduleIds.length === 0) throw new RangeError("a session needs at least one module");

  const modules = moduleIds.map((id) => {
    const def = MODULES[id];
    if (!def) throw new RangeError(`unknown module: ${id}`);
    const paper = buildPaper(def.bank, subSeed(seed, id), def.itemCount);
    return {
      id: def.id,
      name: def.name,
      kind: def.kind,
      blurb: def.blurb,
      timeLimitSec: def.timeLimitSec,
      items: paper.items,
    };
  });

  return { seed, modules };
}

// ── Scoring ────────────────────────────────────────────────────────────────

/**
 * Score one completed module.
 *
 * `responses` is one entry per item: the chosen option index, or null for an
 * item left blank. A blank scores zero and is reported separately, because
 * leaving a box empty is a distinct and correctable habit — there is no
 * negative marking in DGCA papers or in this simulator, so a guess is free and
 * a blank is a guaranteed zero. The debrief says so when it sees blanks.
 */
export function scoreModule(module, responses, durationSec = null) {
  const items = module.items;
  if (!Array.isArray(responses) || responses.length !== items.length) {
    throw new RangeError(`expected ${items.length} responses, got ${Array.isArray(responses) ? responses.length : typeof responses}`);
  }

  const perItem = items.map((item, i) => {
    const chosen = responses[i];
    const answered = Number.isInteger(chosen) && chosen >= 0 && chosen < item.options.length;
    const correct = answered && chosen === item.answerIndex;
    return {
      family: item.family,
      stem: item.stem,
      ...(item.figure ? { figure: item.figure } : {}),
      options: item.options,
      chosen: answered ? chosen : null,
      answerIndex: item.answerIndex,
      correct,
      solution: item.solution,
      // Why THEIR answer was wrong, when the distractor they picked teaches something.
      errorNote: answered && !correct ? item.optionNotes[chosen] : null,
    };
  });

  const correct = perItem.filter((r) => r.correct).length;
  const unanswered = perItem.filter((r) => r.chosen === null).length;
  const total = items.length;
  const norm = criterionNormFor(total);
  const result = stanineFor(correct, norm);

  // Per-family accuracy, so the debrief can point at the actual weak topic
  // rather than at the module as a whole.
  const byFamily = {};
  for (const r of perItem) {
    const f = (byFamily[r.family] ??= { correct: 0, total: 0 });
    f.total++;
    if (r.correct) f.correct++;
  }

  return {
    moduleId: module.id,
    moduleName: module.name,
    correct,
    total,
    unanswered,
    percent: Math.round((correct / total) * 100),
    durationSec,
    overTime: durationSec != null && durationSec > module.timeLimitSec,
    stanine: result.stanine,
    band: result.band,
    basis: result.basis,
    cuts: norm.cuts,
    rationale: result.rationale,
    byFamily,
    perItem,
    anomalies: detectAnomalies({ correct, total, durationSec }),
  };
}

/** Weighted composite across scored modules. Returns null if nothing is scorable. */
export function scoreSession(moduleResults) {
  const parts = moduleResults
    .filter((r) => r && MODULES[r.moduleId])
    .map((r) => ({
      weight: MODULES[r.moduleId].weight,
      result: { stanine: r.stanine, z: null },
    }));
  return compositeStanine(parts);
}
