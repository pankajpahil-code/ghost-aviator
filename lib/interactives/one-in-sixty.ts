// The 1 in 60 rule, as taught in Air Navigation Ch.11 (nav-17). Every function
// here reproduces a formula printed in that chapter, so the interactive can
// never teach a number the notes do not:
//
//   TEA            = distance off / distance gone   x 60      (section 3)
//   Closing angle  = distance off / distance to go  x 60      (section 4)
//   Direct turn    = TEA + CA                                 (section 4)
//   Combined turn  = CA x (total distance / distance gone)    (section 5)
//   Double TEA     = 2 x TEA, regain track after the same distance again (section 3)
//
// tools/audit/one-in-sixty-check.mts asserts the chapter's own worked
// examples against these functions. Change a formula and that check fails.

export type Side = "left" | "right";

/** Track error angle in degrees, by the 1 in 60 rule. */
export function trackErrorAngle(off: number, gone: number): number {
  return (off / gone) * 60;
}

/** Closing angle to the destination in degrees, by the 1 in 60 rule. */
export function closingAngle(off: number, toGo: number): number {
  return (off / toGo) * 60;
}

/** Turn to fly direct to the destination: TEA + CA. */
export function directTurn(off: number, gone: number, total: number): number {
  return trackErrorAngle(off, gone) + closingAngle(off, total - gone);
}

/** The single-calculation form: CA x (total / gone). Algebraically equal to directTurn. */
export function combinedTurn(off: number, gone: number, total: number): number {
  return closingAngle(off, total - gone) * (total / gone);
}

/** Double track error method: the turn, and where track is regained (distance from start). */
export function doubleTea(off: number, gone: number) {
  return { turn: 2 * trackErrorAngle(off, gone), regainAt: 2 * gone };
}

/** The angle trigonometry gives, for comparison with the rule's approximation. */
export function exactAngle(off: number, dist: number): number {
  return (Math.atan(off / dist) * 180) / Math.PI;
}

/** A pilot turns AWAY from the side on which they are displaced. */
export function turnDirection(side: Side): "right" | "left" {
  return side === "left" ? "right" : "left";
}

/** One decimal, trailing ".0" dropped: 8 -> "8", 7.62 -> "7.6". */
export function fmt(n: number): string {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}
