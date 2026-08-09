// ADAPT — Physics and Mechanical Reasoning item generators.
//
// Same contract as items/maths.mjs: the generator rolls the inputs, COMPUTES
// the result, and emits the worked solution, so items are correct by
// construction. Every distractor is a named common error.
//
// Only unambiguous relationships are used, and every constant or approximation
// a question depends on is STATED IN THE STEM. A physics item whose answer
// changes depending on which value of g or which lapse figure the student was
// taught is not a test of physics, it is a coin toss — and on this site it
// would be an Iron Rule 1 failure dressed up as a question.
//
// Relationships used, all standard:
//   F = ma          W = mg  (g = 9.81 m/s², stated)
//   KE = ½mv²       v = u + at
//   L ∝ V²          at constant angle of attack, density and wing area (stated)
//   moments balance w₁d₁ = w₂d₂
//   1 hPa ≈ 30 ft   near sea level (stated in the stem, so it cannot be ambiguous)

import { makeRng, irange, istep, pick } from "../rng.mjs";
import { num, mcq } from "./mcq.mjs";

/** Standard gravity, and it is always written into the stem. */
const G = 9.81;

export const FAMILIES = [
  "newton-force",
  "weight-from-mass",
  "net-acceleration",
  "kinetic-energy",
  "lift-speed-change",
  "moment-balance",
  "pressure-altitude-lapse",
  "kinematics-velocity",
];

// ── Families ───────────────────────────────────────────────────────────────

function newtonForce(rnd, id) {
  const mass = istep(rnd, 200, 4000, 100);
  const accel = irange(rnd, 2, 12);
  const force = mass * accel;
  return mcq(rnd, {
    id,
    family: "newton-force",
    stem: `A body of mass ${num(mass)} kg is accelerated at ${num(accel)} m/s². What force is acting on it?`,
    answer: force,
    unit: "N",
    errors: [
      { value: mass * G, why: `This is the body's WEIGHT (mass × 9.81), not the force producing this acceleration.` },
      { value: (mass * accel) / 2, why: "Halved. The ½ belongs to kinetic energy, not to Newton's second law." },
      { value: mass / accel, why: "Mass divided by acceleration. Force = mass × acceleration." },
    ],
    solution: `F = m × a = ${num(mass)} × ${num(accel)} = ${num(force)} N.`,
    meta: { mass, accel, force },
  });
}

function weightFromMass(rnd, id) {
  const mass = istep(rnd, 300, 5000, 100);
  const weight = Math.round(mass * G);
  return mcq(rnd, {
    id,
    family: "weight-from-mass",
    stem: `An aircraft component has a mass of ${num(mass)} kg. Taking g as 9.81 m/s², what is its weight?`,
    answer: weight,
    unit: "N",
    errors: [
      { value: mass * 10, why: "g rounded to 10. The question specifies 9.81 m/s²." },
      { value: mass, why: "A mass in kilograms is not a force — it must be multiplied by g." },
      { value: Math.round(mass / G), why: "Divided by g instead of multiplied." },
    ],
    solution: `W = m × g = ${num(mass)} × ${G} = ${num(weight)} N.`,
    meta: { mass, weight },
  });
}

function netAcceleration(rnd, id) {
  const mass = istep(rnd, 1000, 6000, 500);
  const accel = irange(rnd, 1, 6);
  const net = mass * accel;
  const drag = istep(rnd, 500, 4000, 100);
  const thrust = net + drag;
  return mcq(rnd, {
    id,
    family: "net-acceleration",
    stem: `An aircraft of mass ${num(mass)} kg has ${num(thrust)} N of thrust and ${num(drag)} N of drag. What is its acceleration?`,
    answer: accel,
    unit: "m/s²",
    errors: [
      { value: thrust / mass, why: "Only the thrust used. The accelerating force is thrust MINUS drag." },
      { value: (thrust + drag) / mass, why: "Drag added to thrust. Drag opposes motion, so it is subtracted." },
      { value: mass / net, why: "Mass divided by force. Acceleration = force ÷ mass." },
    ],
    solution: `Net force = ${num(thrust)} − ${num(drag)} = ${num(net)} N. a = F ÷ m = ${num(net)} ÷ ${num(mass)} = ${num(accel)} m/s².`,
    meta: { mass, accel, net, drag, thrust },
  });
}

function kineticEnergy(rnd, id) {
  const mass = istep(rnd, 500, 5000, 100);
  const speed = istep(rnd, 20, 80, 2);
  const ke = 0.5 * mass * speed * speed;
  return mcq(rnd, {
    id,
    family: "kinetic-energy",
    stem: `An aircraft of mass ${num(mass)} kg is moving at ${num(speed)} m/s. What is its kinetic energy?`,
    answer: ke,
    unit: "J",
    errors: [
      { value: mass * speed * speed, why: "The ½ has been left out of ½mv²." },
      { value: 0.5 * mass * speed, why: "The speed has not been squared." },
      { value: 0.5 * (mass * speed) * (mass * speed), why: "Mass and speed multiplied first, then squared. Only the speed is squared." },
    ],
    solution: `KE = ½mv² = 0.5 × ${num(mass)} × ${num(speed)}² = ${num(ke)} J.`,
    meta: { mass, speed, ke },
  });
}

function liftSpeedChange(rnd, id) {
  const v1 = istep(rnd, 60, 200, 10);
  const k = pick(rnd, [2, 3]);
  const v2 = v1 * k;
  const factor = k * k;
  return mcq(rnd, {
    id,
    family: "lift-speed-change",
    stem: `An aeroplane's speed increases from ${num(v1)} kt to ${num(v2)} kt. With angle of attack, air density and wing area unchanged, the lift becomes how many times its original value?`,
    answer: factor,
    unit: "times",
    errors: [
      { value: k, why: "Lift varies with the SQUARE of the speed, not directly with it." },
      { value: k * k * k, why: "Cubed. Lift varies with the square of the speed." },
      { value: 1 / (k * k), why: "Inverted — the speed increased, so the lift increases too." },
    ],
    solution: `Lift ∝ V². The speed is ${num(k)}× greater, so the lift becomes ${num(k)}² = ${num(factor)} times its original value.`,
    meta: { v1, v2, k, factor },
  });
}

function momentBalance(rnd, id) {
  const d1 = irange(rnd, 2, 9);
  let d2 = irange(rnd, 2, 9);
  if (d2 === d1) d2 = d1 === 9 ? 2 : d1 + 1; // equal arms make the answer trivially equal to the load
  const k = istep(rnd, 20, 400, 20);
  const w1 = k * d2;
  const w2 = k * d1;
  return mcq(rnd, {
    id,
    family: "moment-balance",
    stem: `A beam is pivoted at its centre of rotation. A load of ${num(w1)} kg sits ${num(d1)} m from the pivot on one side. What load, placed ${num(d2)} m from the pivot on the other side, will balance it?`,
    answer: w2,
    unit: "kg",
    errors: [
      { value: (w1 * d2) / d1, why: "The arms have been used the wrong way round. The load is multiplied by ITS OWN arm." },
      { value: w1, why: "Equal loads only balance at equal arms — here the arms differ." },
      { value: w1 * d1 * d2, why: "Both arms multiplied in. Set moment equal to moment: w₁d₁ = w₂d₂." },
    ],
    solution: `w₁d₁ = w₂d₂ → ${num(w1)} × ${num(d1)} = w₂ × ${num(d2)} → w₂ = ${num(w1 * d1)} ÷ ${num(d2)} = ${num(w2)} kg.`,
    meta: { w1, d1, w2, d2 },
  });
}

function pressureAltitudeLapse(rnd, id) {
  const hpa = irange(rnd, 4, 40);
  const feet = hpa * 30;
  return mcq(rnd, {
    id,
    family: "pressure-altitude-lapse",
    stem: `Near sea level, take 1 hPa as equivalent to 30 ft. If the pressure setting changes by ${num(hpa)} hPa, by how much does the indicated altitude change?`,
    answer: feet,
    unit: "ft",
    errors: [
      { value: hpa * 27, why: "27 ft per hPa used. The question specifies 30 ft per hPa." },
      { value: hpa * 100, why: "100 ft per hPa used — that is roughly the figure at high altitude, not near sea level." },
      { value: hpa / 30, why: "Divided by 30 instead of multiplied." },
    ],
    solution: `Height change = ${num(hpa)} hPa × 30 ft/hPa = ${num(feet)} ft.`,
    meta: { hpa, feet },
  });
}

function kinematicsVelocity(rnd, id) {
  const accel = irange(rnd, 2, 9);
  const timeSec = istep(rnd, 10, 60, 5);
  const speed = accel * timeSec;
  return mcq(rnd, {
    id,
    family: "kinematics-velocity",
    stem: `An aircraft starts its take-off roll from rest and accelerates uniformly at ${num(accel)} m/s² for ${num(timeSec)} seconds. What speed has it reached?`,
    answer: speed,
    unit: "m/s",
    errors: [
      { value: (accel * timeSec) / 2, why: "This is the AVERAGE speed over the roll. The question asks for the speed reached." },
      { value: accel * timeSec * 2, why: "Doubled. v = u + at, and here u is zero." },
      { value: accel * timeSec * timeSec, why: "Time squared — that belongs to the distance formula, not to the speed." },
    ],
    solution: `v = u + at, with u = 0 → v = ${num(accel)} × ${num(timeSec)} = ${num(speed)} m/s.`,
    meta: { accel, timeSec, speed },
  });
}

const GENERATORS = {
  "newton-force": newtonForce,
  "weight-from-mass": weightFromMass,
  "net-acceleration": netAcceleration,
  "kinetic-energy": kineticEnergy,
  "lift-speed-change": liftSpeedChange,
  "moment-balance": momentBalance,
  "pressure-altitude-lapse": pressureAltitudeLapse,
  "kinematics-velocity": kinematicsVelocity,
};

/** Generate one item of a named family. Same (family, seed) -> identical item. */
export function generateItem(family, seed) {
  const gen = GENERATORS[family];
  if (!gen) throw new RangeError(`unknown physics family: ${family}`);
  return gen(makeRng(seed), `${family}-${seed >>> 0}`);
}
