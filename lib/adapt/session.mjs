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
import { passiveRmse, passiveSegmentRmse, cancellationPercent, CANCELLATION_NORM, SAMPLE_HZ, SEGMENT_SEC } from "./tracking.mjs";
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

/** How far cancellation must drop from first minute to last to count as fading. */
export const FADE_POINTS = 10;

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
// ITEM COUNTS AND TIME LIMITS — mostly settled, 2026-08-10.
//
// This table used to carry a warning that every figure traced to coaching-blog
// hearsay. Most of them no longer do. The test publisher states the following
// on its own product pages, and those are the figures used below:
//
//   Maths (Progressive)       20 questions / 30 minutes
//   Physics (Progressive)     20 questions / 30 minutes
//   Cognitive Reasoning       36 questions / 30 minutes, reported as an overall
//                             score PLUS one per section
//   Multitasking (FAST)       ~15 minutes per attempt, workload escalating
//                             through the run, and NO joystick required
//   Co-ordination (Ball)      ~5 minutes per attempt, no fixed limit
//   Personality questionnaire 275+ items, ~1 hour, untimed
//
// Full sourcing in ADAPT_COMPETITIVE_AUDIT.md §1.3. Three clocks were wrong
// before that research and are corrected here: physics ran 25 minutes instead
// of 30, the tracking task ran 60 seconds instead of ~5 minutes, and the
// divided-attention run was 3 flat minutes instead of ~15 escalating ones.
//
// CORRECTION, 2026-08-12. An earlier version of this comment said the English
// module was "ours rather than the publisher's", on the reasoning that English
// is not among the six products sold in the cadet PRACTICE bundle. That
// reasoning was wrong, and the conclusion with it: the practice bundle is what
// they sell, not the battery an airline administers. A candidate's real report
// contains an English section (ADAPT_COMPETITIVE_AUDIT.md §6.1). English
// belongs here.
//
// What is still genuinely ours rather than the publisher's: the attitudes
// questionnaire's length, which is deliberately short — see the note on its
// weight below — and our English module has no LISTENING component, which
// theirs does.
//
// Everything downstream reads these fields; nothing hardcodes a count or a
// clock. This remains the only place that changes.

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
    // 30 minutes, not the 25 this ran for two releases — the real Physics
    // Progressive test is 20 questions in 30 minutes, same as its maths twin.
    timeLimitSec: 30 * 60,
    weight: 1,
    bank: physicsBank,
  },
  "spatial-pattern": {
    id: "spatial-pattern",
    name: "Spatial & Pattern Reasoning",
    kind: "knowledge",
    blurb: "Headings and turns, reading a direction indicator, number series and clock angles.",
    // 36 questions in 30 minutes — this one figure is NOT from a coaching blog.
    // The test publisher's own site states its Cognitive Reasoning Test is "36
    // multiple choice questions with a time limit of 30 minutes", and that test
    // is the closest analogue to this module. First-party, so it is used.
    itemCount: 36,
    timeLimitSec: 30 * 60,
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
    blurb: "Hold a drifting marker on the centre for five minutes. Measures the see-decide-move loop manual flight is made of.",
    // A psychomotor run has no items; it has a clock and a seeded disturbance.
    //
    // FIVE minutes, not the 60 seconds this ran for two releases. The real ball
    // game runs about five, and the difference is not cosmetic: a one-minute
    // run scores your first-minute reflexes, while the thing actually being
    // measured — whether you hold the standard once concentration starts to
    // cost something, and how fast you recover after losing it — only appears
    // after the first minute or two. See scoreTracking, which now reports the
    // per-minute breakdown that this length makes meaningful.
    durationSec: 300,
    timeLimitSec: 300,
    weight: 1,
    bank: null,
  },
  "divided-attention": {
    id: "divided-attention",
    name: "Divided Attention",
    kind: "divided-attention",
    blurb: "Fly the aeroplane, monitor a gauge, work the radio and answer sums — all at once, for fifteen minutes, and it gets harder as it runs.",
    // FIFTEEN minutes in three escalating phases, not the 3 flat minutes this
    // ran for two releases. The real multitasking assessment runs about fifteen
    // and climbs throughout; three flat minutes measured a sprint, and the
    // thing being assessed is not a sprint. See PHASES in divided-attention.mjs
    // for what escalates and why the gauge deliberately does not.
    durationSec: 900,
    timeLimitSec: 900,
    weight: 1,
    bank: null,
  },
  "attitudes-airmanship": {
    id: "attitudes-airmanship",
    name: "Attitudes & Airmanship",
    kind: "behavioural",
    blurb: "Situations with no clock. Which response is most like you, and which least — mapped to the five hazardous attitudes.",
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
/**
 * The three difficulty settings, and the honest way to report them.
 *
 * Added 2026-08-16. The competitor torn down in ADAPT_SKYTEST_VIDEO_TEARDOWN.md
 * §1.6 opens on Easy / Medium / Difficult, and its own coaching says "practise
 * on Difficult". A student who can only ever fail stops coming back, and one
 * who only ever practises on Easy walks into the real thing unprepared — so
 * both ends need to exist.
 *
 * HOW THE SCORE IS KEPT HONEST, and this reverses my own earlier note in the
 * teardown, which said to apply "a matching scalar on the reported result".
 * That was wrong. A scalar would be an invented number — exactly what this
 * module refuses to do with norms — and there is no measurement behind any
 * particular multiplier.
 *
 * What is done instead: the criterion ladder is UNCHANGED at every difficulty.
 * It says "answer 85% of the paper inside the clock to reach stanine 7". On
 * Gentle the clock is longer, so more students clear 85% and a stanine 7 there
 * genuinely means less — which is true, and is stated rather than corrected
 * for. Every score therefore CARRIES its difficulty, the report names it, and
 * scores from different settings are never pooled or trended together. A
 * labelled, segregated score invents nothing; a scaled one invents everything.
 */
export const DIFFICULTY = {
  gentle: {
    key: "gentle",
    label: "Gentle",
    blurb: "Half again as long on the clock, and the multitasking run comes at you more slowly. For learning the formats.",
    clockScale: 1.5,
    loadScale: 0.75,
  },
  standard: {
    key: "standard",
    label: "Standard",
    blurb: "The clocks the real screening publishes. This is the setting your result means the most on.",
    clockScale: 1,
    loadScale: 1,
  },
  hard: {
    key: "hard",
    label: "Hard",
    blurb: "A quarter off every clock and a busier multitasking run. Harder than the real thing, on purpose.",
    clockScale: 0.75,
    loadScale: 1.3,
  },
};

export const DIFFICULTY_KEYS = Object.keys(DIFFICULTY);

/** The setting a score means the most on, and the default for every session. */
export const DEFAULT_DIFFICULTY = "standard";

export function buildSession(seed, moduleIds = MODULE_IDS, difficulty = DEFAULT_DIFFICULTY) {
  if (!Number.isInteger(seed)) throw new RangeError("seed must be an integer");
  if (!Array.isArray(moduleIds) || moduleIds.length === 0) throw new RangeError("a session needs at least one module");
  const diff = DIFFICULTY[difficulty];
  if (!diff) throw new RangeError(`unknown difficulty: ${difficulty}`);

  /**
   * Clocks scale with difficulty; item counts never do. A shorter paper is a
   * different test.
   *
   * Applied to the TIMED PAPERS ONLY. For a task defined by its duration — the
   * ball game, the multitasking run — a shorter clock is not a harder task, it
   * is a shorter one, and it would make "Hard" the least fatiguing setting on
   * offer. Those two are handled below on their own terms.
   */
  const clock = (sec) => Math.round(sec * diff.clockScale);

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
        // UNSCALED, and deliberately. Tracking is scored as the percentage of
        // the disturbance you actually cancelled, against a do-nothing baseline
        // computed from that same disturbance — so making the aeroplane wilder
        // moves the baseline by the same amount and barely moves the score.
        // There is no honest difficulty lever here that is not also a scoring
        // change, so this module runs one way at every setting and the report
        // says so rather than pretending otherwise.
        timeLimitSec: def.timeLimitSec,
        difficulty: diff.key,
        difficultyApplies: false,
        run: { seed: subSeed(seed, id), durationSec: def.durationSec, sampleHz: SAMPLE_HZ },
      };
    }

    if (def.kind === "behavioural") {
      return {
        id: def.id,
        name: def.name,
        kind: def.kind,
        blurb: def.blurb,
        // Deliberately NOT scaled. The questionnaire is untimed in the real
        // battery and carries weight 0 here; making it "harder" would be
        // meaningless, and a personality instrument that varies by setting is
        // not the same instrument twice.
        timeLimitSec: def.timeLimitSec,
        difficulty: diff.key,
        difficultyApplies: false,
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
        // The run is the same fifteen minutes at every setting. Difficulty acts
        // on how densely it is filled, which is what "harder" means for a task
        // whose whole point is sustained workload.
        timeLimitSec: def.timeLimitSec,
        difficulty: diff.key,
        difficultyApplies: diff.key !== "standard",
        run: buildDividedRun(subSeed(seed, id), def.durationSec, diff.loadScale),
      };
    }

    const paper = buildPaper(def.bank, subSeed(seed, id), def.itemCount);
    return {
      id: def.id,
      name: def.name,
      kind: def.kind,
      blurb: def.blurb,
      // The clock moves; the ITEM COUNT never does. A twenty-question paper
      // with five questions removed is a different test, not an easier one,
      // and its criterion ladder would no longer separate nine stanines.
      timeLimitSec: clock(def.timeLimitSec),
      difficulty: diff.key,
      difficultyApplies: diff.key !== "standard",
      items: paper.items,
    };
  });

  return { seed, difficulty: diff.key, modules };
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
      ...(item.tier ? { tier: item.tier, tierLabel: item.tierLabel } : {}),
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
  // Named rather than left for the reader to subtract. Missing an item and
  // getting it wrong are different failures needing different advice, and a
  // report that only prints "correct" hides which one happened.
  const wrong = Math.max(0, total - correct - unanswered);
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

  // Per-TIER accuracy, which is what a progressive paper is for. "68%" tells a
  // student nothing they can act on; "you were 9/9 on Foundation, 6/7 on
  // Intermediate and 1/4 on Advanced" tells them exactly where their ceiling
  // is and therefore what to practise next. Absent entirely on an untiered
  // paper rather than reported as one undifferentiated bucket.
  const byTier = {};
  for (const r of perItem) {
    if (!r.tier) continue;
    const t = (byTier[r.tier] ??= { tier: r.tier, label: r.tierLabel, correct: 0, total: 0 });
    t.total++;
    if (r.correct) t.correct++;
  }
  const tiers = Object.values(byTier).sort((a, b) => a.tier - b.tier);

  /**
   * The first tier where the student dropped below half. This is the "ceiling"
   * line on the report. Null when they held every tier — which is the answer
   * we want them chasing, not a consolation.
   */
  const ceiling = tiers.find((t) => t.correct / t.total < 0.5) ?? null;

  return {
    tiers,
    ceiling: ceiling ? { tier: ceiling.tier, label: ceiling.label, correct: ceiling.correct, total: ceiling.total } : null,
    moduleId: module.id,
    // Carried on every result so a score can never be read, stored or trended
    // without the setting it was earned at. The ladder is identical across
    // settings, which is exactly why the label is not optional.
    difficulty: module.difficulty ?? null,
    difficultyApplies: module.difficultyApplies ?? false,
    moduleName: module.name,
    kind: "knowledge",
    correct,
    total,
    unanswered,
    wrong,
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
export function scoreTracking(module, { rmse, sampleCount = 0, inputClass = "pointer", worstError = null, segmentRmse = [] } = {}) {
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

  // ── Minute by minute ─────────────────────────────────────────────────────
  //
  // Each segment is scored against the do-nothing baseline for THAT segment,
  // not the whole run's — the disturbance is rougher in some minutes than
  // others, and a shared baseline would draw a fade that belongs to the seed
  // rather than to the student.
  const segBaselines = new Map(passiveSegmentRmse(seed, durationSec, module.run.sampleHz ?? SAMPLE_HZ).map((b) => [b.index, b.rmse]));
  const segments = (segmentRmse ?? [])
    .filter((s) => segBaselines.has(s.index))
    .map((s) => ({
      index: s.index,
      fromSec: s.index * SEGMENT_SEC,
      toSec: Math.min(durationSec, (s.index + 1) * SEGMENT_SEC),
      cancellation: cancellationPercent(s.rmse, segBaselines.get(s.index)),
      samples: s.samples,
    }))
    .filter((s) => s.cancellation != null);

  /**
   * Did they fade, or hold?
   *
   * The comparison is first segment against last, and it is only reported when
   * there are at least three segments — on two points a "fade" is one bad
   * minute, and telling a student they lose concentration on that evidence
   * would be coaching them against noise. FADE_POINTS is the same 10-point step
   * the divided-attention collapse uses, for the same reason.
   */
  const fade = segments.length >= 3
    ? Math.round(segments[0].cancellation - segments[segments.length - 1].cancellation)
    : null;

  return {
    moduleId: module.id,
    // Carried on every result so a score can never be read, stored or trended
    // without the setting it was earned at. The ladder is identical across
    // settings, which is exactly why the label is not optional.
    difficulty: module.difficulty ?? null,
    difficultyApplies: module.difficultyApplies ?? false,
    moduleName: module.name,
    kind: "psychomotor",
    rmse,
    baseline,
    segments,
    segmentSec: SEGMENT_SEC,
    fade,
    /** Held / faded / built — the one-word read on the shape of the run. */
    endurance: fade == null ? null : fade >= FADE_POINTS ? "faded" : fade <= -FADE_POINTS ? "built" : "held",
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
export function scoreDividedAttention(module, responses = [], elapsedSec = null) {
  if (module?.kind !== "divided-attention") throw new RangeError("scoreDividedAttention expects a divided-attention module");

  const detail = scoreDividedRun(module.run, responses);
  const result = detail ? stanineFor(detail.composite, DIVIDED_NORM) : null;

  const anomalies = [];
  if (detail && detail.monitor.total === 0) {
    anomalies.push({ code: "no-excursions", detail: "The gauge never entered the red band, so monitoring could not be scored." });
  }
  // A run that ended early is FLAGGED, not quietly scored as if the student sat
  // there answering nothing. The task ends itself when the tab is hidden —
  // animation frames stop and it would otherwise freeze — and over a fifteen
  // minute run that is a realistic thing to happen by accident. Scoring the
  // unflown remainder as failure without saying so would be blaming a student
  // for a phone call.
  const full = module.run.durationSec;
  if (Number.isFinite(elapsedSec) && elapsedSec < full * 0.9) {
    anomalies.push({
      code: "run-incomplete",
      detail: `The run ended after about ${Math.round(elapsedSec / 60)} of ${Math.round(full / 60)} minutes, so the later phases were not flown. Sit it again with the tab in front to get a score worth comparing.`,
    });
  }

  return {
    moduleId: module.id,
    // Carried on every result so a score can never be read, stored or trended
    // without the setting it was earned at. The ladder is identical across
    // settings, which is exactly why the label is not optional.
    difficulty: module.difficulty ?? null,
    difficultyApplies: module.difficultyApplies ?? false,
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
    // Carried on every result so a score can never be read, stored or trended
    // without the setting it was earned at. The ladder is identical across
    // settings, which is exactly why the label is not optional.
    difficulty: module.difficulty ?? null,
    difficultyApplies: module.difficultyApplies ?? false,
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
