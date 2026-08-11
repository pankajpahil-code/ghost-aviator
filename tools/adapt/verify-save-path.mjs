// Verify the ADAPT signed-in save path end to end, against a stand-in endpoint.
//
// Run:  node tools/adapt/mock-supabase.mjs 54321 /tmp/adapt-mock-rows.json &
//       node tools/adapt/verify-save-path.mjs
//
// ── What this covers ───────────────────────────────────────────────────────
//
// It scores a REAL session (four modules, real generated papers, real scoring),
// builds the rows exactly as the app does, and sends them with the REAL
// supabase-js client — the same createClient/from/insert calls lib/adapt/
// results.ts makes. So it exercises the client construction, the table name,
// the HTTP method, the headers, and the exact JSON body that would reach
// Supabase, and then reads the rows back the way the dashboard does.
//
// ── What it deliberately does NOT claim ───────────────────────────────────
//
// It does not prove Postgres accepts the schema, and it does not prove the RLS
// policies behave — a stand-in cannot test either. The column contract is
// covered by results-schema.test.mjs, which parses the migration in SECURITY.md.
// RLS can only be verified against the real project once the SQL is run.

import { createClient } from "@supabase/supabase-js";
import { buildSession, scoreModule, scoreTracking, scoreDividedAttention, scorePersonality } from "../../lib/adapt/session.mjs";
import { SCENARIOS } from "../../lib/adapt/personality.mjs";
import { buildResultRows, findForbidden } from "../../lib/adapt/results-core.mjs";
import { learningFor } from "../../lib/adapt/learning.mjs";

const URL_ = process.env.MOCK_URL ?? "http://localhost:54321";
const KEY = "mock-anon-key-for-local-verification";
const USER = "11111111-2222-4333-8444-555555555555";

const ok = (label, cond, detail = "") => {
  console.log(`${cond ? "  PASS" : "  FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!cond) process.exitCode = 1;
};

/** Score a real session the way a student's browser would. */
function scoreRealSession(seed, quality) {
  const session = buildSession(seed, ["aviation-maths", "control-coordination", "divided-attention", "attitudes-airmanship"]);
  const results = [];
  for (const mod of session.modules) {
    if (mod.kind === "knowledge") {
      results.push(scoreModule(mod, mod.items.map((it, i) => (i % quality === 0 ? null : it.answerIndex)), 900));
    } else if (mod.kind === "psychomotor") {
      results.push(scoreTracking(mod, {
        rmse: 0.12 * quality,
        sampleCount: mod.run.durationSec * mod.run.sampleHz,
        inputClass: "pointer",
        segmentRmse: [0, 1, 2, 3, 4].map((index) => ({ index, rmse: 0.10 * quality + index * 0.01, samples: 3000 })),
      }));
    } else if (mod.kind === "divided-attention") {
      results.push(scoreDividedAttention(
        mod,
        mod.run.arithmetic.filter((_, i) => i % quality !== 0).map((i) => ({ stream: "arithmetic", id: i.id, chosen: i.answerIndex })),
        mod.run.durationSec
      ));
    } else if (mod.kind === "behavioural") {
      results.push(scorePersonality(mod, SCENARIOS.map((s) => {
        const a = Object.keys(s.options);
        return { id: s.id, most: a[0], least: a[1] };
      })));
    }
  }
  return { seed: session.seed, results };
}

const sb = createClient(URL_, KEY, { auth: { persistSession: false, autoRefreshToken: false } });

console.log(`\nADAPT signed-in save path — against ${URL_}\n`);

// ── 1. One sitting saves ───────────────────────────────────────────────────
// `quality` is how many items in N are ANSWERED — higher is better. The first
// version of this script ran 3 → 2 → 1 and then asserted the curve should be
// improving; it correctly reported "slipping", and the fixture was what was
// wrong. Kept in mind here: the series below deliberately gets better.
const first = scoreRealSession(20260810, 2);
const rows = buildResultRows(first.seed, first.results, USER);

ok("rows are built for every module sat", rows.length === 4, `${rows.length} rows`);
ok("the privacy guard finds nothing to block", findForbidden(rows) === null, String(findForbidden(rows)));

const { error } = await sb.from("adapt_results").insert(rows);
ok("insert accepted by the endpoint", !error, error?.message ?? "");

// ── 2. What actually went over the wire ────────────────────────────────────
const { data: saved, error: readErr } = await sb
  .from("adapt_results")
  .select("module_id, module_kind, stanine, sten, band, headline_pct, input_class, created_at")
  .eq("user_id", USER);

ok("rows read back", !readErr && Array.isArray(saved), readErr?.message ?? "");
ok("every scored module carries a stanine AND a sten",
  saved.filter((r) => r.module_kind !== "behavioural").every((r) => Number.isInteger(r.stanine) && Number.isInteger(r.sten)));
ok("the questionnaire row carries no grade",
  saved.filter((r) => r.module_kind === "behavioural").every((r) => r.stanine === null && r.headline_pct === null));
ok("the tracking row carries its input device so norms cannot pool devices",
  saved.find((r) => r.module_kind === "psychomotor")?.input_class === "pointer");

// ── 3. The breakdown that makes the data worth having ──────────────────────
const knowledge = rows.find((r) => r.module_kind === "knowledge");
ok("per-tier accuracy was saved", Object.keys(knowledge.detail.tiers).length >= 2, Object.keys(knowledge.detail.tiers).join("/"));
ok("per-family accuracy was saved", Object.keys(knowledge.detail.families).length >= 3);
const divided = rows.find((r) => r.module_kind === "divided-attention");
ok("per-phase composites were saved", divided.detail.phases.length === 3);
const tracking = rows.find((r) => r.module_kind === "psychomotor");
ok("per-minute shape was saved", tracking.detail.minutes.length === 5);

// ── 4. Nothing forbidden reached the endpoint ──────────────────────────────
const wire = JSON.stringify(rows);
for (const forbidden of ["stem", "options", "answerIndex", "tally", "profile", "scenario", "chosen"]) {
  ok(`no "${forbidden}" anywhere in the payload`, !wire.includes(`"${forbidden}"`));
}

// ── 5. Repeat sittings accumulate into a learning curve ────────────────────
for (const [i, q] of [[1, 3], [2, 5]]) {
  const s = scoreRealSession(20260810 + i, q);
  await sb.from("adapt_results").insert(buildResultRows(s.seed, s.results, USER));
}
const { data: series } = await sb.from("adapt_results").select("module_id, stanine").eq("user_id", USER);
const maths = series.filter((r) => r.module_id === "aviation-maths").map((r) => r.stanine);
const learning = learningFor(maths);

ok("three sittings are on record", maths.length === 3, maths.join(" → "));
ok("a learning curve is now readable", learning.readable);
ok("improving practice reads as improving", learning.direction === "improving", `slope ${learning.slope?.toFixed(2)}`);

// And the same curve read backwards must read as slipping — a slope that only
// ever says "improving" would be worse than no slope at all.
const reversed = learningFor([...maths].reverse());
ok("the same series reversed reads as slipping", reversed.direction === "slipping", `slope ${reversed.slope?.toFixed(2)}`);
ok("a flat series reads as neither", learningFor([5, 5, 5]).direction === "flat");

console.log(`\n${process.exitCode ? "FAILURES ABOVE" : "All checks passed."}\n`);
