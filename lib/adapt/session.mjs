// ADAPT — session assembly and scoring.
//
// A session is an ordered run of modules. Each module rolls its own paper from
// the session seed, runs against its own clock, and scores to a stanine; the
// session then reports a weighted composite. Same seed -> same session, so a
// student can re-sit the exact paper to beat their score and any result can be
// reproduced if it is ever disputed.

import { subSeed } from "./rng.mjs";
import { buildPaper } from "./items/paper.mjs";
import { stanineFor, compositeStanine, detectAnomalies, bandFor } from "./stanine.mjs";
import * as mathsBank from "./items/maths.mjs";
import * as physicsBank from "./items/physics.mjs";
import * as spatialBank from "./items/spatial.mjs";
import * as englishBank from "./items/english.mjs";
import { passiveRmse, cancellationPercent, CANCELLATION_NORM, SAMPLE_HZ } from "./tracking.mjs";
import { buildRun as buildDividedRun, scoreRun as scoreDividedRun, DIVIDED_NORM } from "./divided-attention.mjs";
import { SCENARIOS as ATTITUDE_SCENARIOS, scoreProfile } from "./personality.mjs";

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
  "english-language": {
    id: "english-language",
    name: "English Language",
    kind: "knowledge",
    blurb: "Sentence structure, agreement, quantifiers and reading a briefing for detail — the ICAO language skills.",
    itemCount: 20,
    timeLimitSec: 20 * 60,
    weight: 1,
    bank: englishBank,
  },
  "control-coordination": {
    id: "control-coordination",
    name: "Control & Co-ordination",
    kind: "psychomotor",
    blurb: "Hold a drifting marker on the centre for one minute. Measures the see-decide-move loop manual flight is made of.",
    // A psychomotor run has no items; it has a clock and a seeded disturbance.
    durationSec: 60,
    timeLimitSec: 60,
    weight: 1,
    bank: null,
  },
  "divided-attention": {
    id: "divided-attention",
    name: "Divided Attention",
    kind: "divided-attention",
    blurb: "Monitor a gauge, work the radio and answer sums — all at the same time, for three minutes.",
    durationSec: 180,
    timeLimitSec: 180,
    weight: 1,
    bank: null,
  },
  "attitudes-airmanship": {
    id: "attitudes-airmanship",
    name: "Attitudes & Airmanship",
    kind: "behavioural",
    blurb: "Six situations with no clock. Which response is most like you, and which least — mapped to the five hazardous attitudes.",
    // Untimed, exactly as the real personality questionnaire is.
    timeLimitSec: 0,
    // WEIGHT ZERO, AND DELIBERATELY SO. A hazardous-attitude tally is not an
    // aptitude score, and folding one into a stanine composite would be
    // precisely the invented psychometrics this module refuses to do. It
    // reports a profile beside the aptitude result, never inside it.
    weight: 0,
    bank: null,
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

    // A psychomotor module carries a seeded disturbance and a clock instead of
    // a paper. Everything downstream branches on `kind`, never on the presence
    // or absence of `items`.
    if (def.kind === "psychomotor") {
      return {
        id: def.id,
        name: def.name,
        kind: def.kind,
        blurb: def.blurb,
        timeLimitSec: def.timeLimitSec,
        run: { seed: subSeed(seed, id), durationSec: def.durationSec, sampleHz: SAMPLE_HZ },
      };
    }

    if (def.kind === "behavioural") {
      return {
        id: def.id,
        name: def.name,
        kind: def.kind,
        blurb: def.blurb,
        timeLimitSec: def.timeLimitSec,
        // The scenarios are authored and fixed — a personality item that
        // shuffled its wording per session would not be the same instrument
        // twice, which is the one thing a questionnaire must be.
        scenarios: ATTITUDE_SCENARIOS,
      };
    }

    if (def.kind === "divided-attention") {
      return {
        id: def.id,
        name: def.name,
        kind: def.kind,
        blurb: def.blurb,
        timeLimitSec: def.timeLimitSec,
        run: buildDividedRun(subSeed(seed, id), def.durationSec),
      };
    }

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
    kind: "knowledge",
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

/**
 * Score a completed tracking run.
 *
 * The raw RMSE is meaningless on its own — it depends entirely on how violent
 * the rolled disturbance was — so it is expressed as the share of that
 * disturbance the student cancelled, measured against the RMSE they would have
 * scored by leaving the control centred. That baseline is computed from the
 * disturbance itself, so the score needs no normative population to be true.
 */
export function scoreTracking(module, { rmse, sampleCount = 0, inputClass = "pointer", worstError = null } = {}) {
  if (module?.kind !== "psychomotor") throw new RangeError("scoreTracking expects a psychomotor module");

  const { seed, durationSec } = module.run;
  const baseline = passiveRmse(seed, durationSec);
  const cancellation = cancellationPercent(rmse, baseline);
  const result = cancellation == null ? null : stanineFor(cancellation, CANCELLATION_NORM);

  const anomalies = detectAnomalies({ trackingRmse: rmse });
  // A run that recorded far fewer samples than its clock allows was not really
  // flown — the tab was hidden, or the loop never started. Better to say so
  // than to publish a flattering score built on three seconds of data.
  const expected = durationSec * (module.run.sampleHz ?? SAMPLE_HZ);
  if (sampleCount < expected * 0.75) {
    anomalies.push({
      code: "run-incomplete",
      detail: `Only ${sampleCount} of about ${Math.round(expected)} expected samples were recorded — the run was interrupted.`,
    });
  }

  return {
    moduleId: module.id,
    moduleName: module.name,
    kind: "psychomotor",
    rmse,
    baseline,
    worstError,
    cancellation,
    sampleCount,
    inputClass,
    durationSec,
    stanine: result?.stanine ?? 1,
    band: result?.band ?? bandFor(1),
    basis: result?.basis ?? "criterion",
    cuts: CANCELLATION_NORM.cuts,
    rationale: CANCELLATION_NORM.rationale,
    anomalies,
  };
}

/**
 * Score a completed divided-attention run.
 *
 * The composite already carries the fixation penalty — see divided-attention.mjs
 * for why abandoning one stream costs more than being merely average at all
 * three. This wrapper turns it into a stanine and names the stream to train.
 */
export function scoreDividedAttention(module, responses = []) {
  if (module?.kind !== "divided-attention") throw new RangeError("scoreDividedAttention expects a divided-attention module");

  const detail = scoreDividedRun(module.run, responses);
  const result = detail ? stanineFor(detail.composite, DIVIDED_NORM) : null;

  const anomalies = [];
  if (detail && detail.monitor.total === 0) {
    anomalies.push({ code: "no-excursions", detail: "The gauge never entered the red band, so monitoring could not be scored." });
  }

  return {
    moduleId: module.id,
    moduleName: module.name,
    kind: "divided-attention",
    durationSec: module.run.durationSec,
    detail,
    composite: detail?.composite ?? 0,
    weakest: detail?.weakest ?? null,
    stanine: result?.stanine ?? 1,
    band: result?.band ?? bandFor(1),
    basis: result?.basis ?? "criterion",
    cuts: DIVIDED_NORM.cuts,
    rationale: DIVIDED_NORM.rationale,
    anomalies,
  };
}

/**
 * Score the attitudes questionnaire.
 *
 * Returns a PROFILE, not a grade. There is no stanine here and there is no
 * pass mark, because a hazardous-attitude inventory is a mirror used in a
 * debrief — not a sift. See personality.mjs for the whole reasoning.
 */
export function scorePersonality(module, responses = []) {
  if (module?.kind !== "behavioural") throw new RangeError("scorePersonality expects a behavioural module");
  const profile = scoreProfile(responses);
  return {
    moduleId: module.id,
    moduleName: module.name,
    kind: "behavioural",
    profile,
    /** No stanine and no band: this module is not an aptitude score. */
    stanine: null,
    anomalies: [],
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
