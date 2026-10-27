// Checks lib/interactives/one-in-sixty.ts against the worked examples printed
// in Air Navigation Ch.11 (public/content/air-navigation/nav-17/notes.html).
// The expected values below are copied from the chapter, not computed.
//   npx tsx tools/audit/one-in-sixty-check.mts      exits 1 on any mismatch

import {
  trackErrorAngle, closingAngle, directTurn, combinedTurn, doubleTea, turnDirection,
} from "../../lib/interactives/one-in-sixty";

type Case = { what: string; got: number | string; want: number | string };
const cases: Case[] = [
  // Section 3: 30 NM gone, 4 NM left
  { what: "s3 TEA 4/30", got: trackErrorAngle(4, 30), want: 8 },
  { what: "s3 double-TEA turn", got: doubleTea(4, 30).turn, want: 16 },
  { what: "s3 turn direction when left of track", got: turnDirection("left"), want: "right" },
  // Section 4: 78 NM leg, 30 gone, 4 left
  { what: "s4 CA 4/48", got: closingAngle(4, 48), want: 5 },
  { what: "s4 TEA + CA", got: directTurn(4, 30, 78), want: 13 },
  // Section 5: same problem, combined method
  { what: "s5 CA x 78/30", got: combinedTurn(4, 30, 78), want: 13 },
  // Q2
  { what: "Q2 TEA 2/40", got: trackErrorAngle(2, 40), want: 3 },
  // Q3: 95 NM, 35 gone, 7 right
  { what: "Q3a TEA", got: trackErrorAngle(7, 35), want: 12 },
  { what: "Q3b direct turn", got: directTurn(7, 35, 95), want: 19 },
  { what: "Q3b direction when right of track", got: turnDirection("right"), want: "left" },
  // Q4: 70 NM, 30 gone, 4 left
  { what: "Q4e direct turn", got: directTurn(4, 30, 70), want: 14 },
  // Q5: 96 NM, 36 gone, 3 right
  { what: "Q5b TEA", got: trackErrorAngle(3, 36), want: 5 },
  { what: "Q5e direct turn", got: directTurn(3, 36, 96), want: 8 },
  { what: "Q5g double-TEA turn", got: doubleTea(3, 36).turn, want: 10 },
  { what: "Q5j track regained after", got: doubleTea(3, 36).regainAt, want: 72 },
];

let bad = 0;
for (const c of cases) {
  const ok = typeof c.want === "number"
    ? Math.abs((c.got as number) - c.want) < 1e-9
    : c.got === c.want;
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "FAIL"}  ${c.what}: got ${c.got}, chapter says ${c.want}`);
}

// directTurn and combinedTurn must agree everywhere, not just on the printed example.
let worst = 0;
for (let total = 20; total <= 200; total += 7)
  for (let gone = 3; gone < total; gone += 5)
    for (let off = 0.5; off <= 10; off += 1.5)
      worst = Math.max(worst, Math.abs(directTurn(off, gone, total) - combinedTurn(off, gone, total)));
const eqOk = worst < 1e-9;
if (!eqOk) bad++;
console.log(`${eqOk ? "ok  " : "FAIL"}  TEA+CA equals CA x total/gone over the slider range (worst diff ${worst})`);

console.log(bad ? `\n${bad} FAILED` : `\nall ${cases.length + 1} checks passed`);
process.exit(bad ? 1 : 0);
