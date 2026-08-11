import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildResultRows } from "./results-core.mjs";
import { buildSession, scoreModule } from "./session.mjs";

// ── Why this file exists ───────────────────────────────────────────────────
//
// The one failure mode that survives every other test in this feature: the code
// writes a column the table does not have. `buildResultRows` is tested against
// its own output, and the DDL is just text in a document — until something
// compares them, they can drift apart silently, and the first anyone hears of
// it is every signed-in student seeing "could not be saved".
//
// It cannot be caught by typechecking (the Supabase client accepts any object)
// and it cannot be caught by running it locally: the Supabase values in
// .env.local are empty strings, so auth is switched off on a developer machine
// and no insert can even be attempted. So it is caught by parsing the migration
// and checking the rows we build against it.

const ROOT = process.cwd();
const MIGRATION_PATH = path.join(ROOT, "supabase/migrations/20260811000000_adapt_results.sql");
const SECURITY = fs.readFileSync(path.join(ROOT, "SECURITY.md"), "utf8");
const MIGRATION = fs.readFileSync(MIGRATION_PATH, "utf8");

/**
 * The SQL block in SECURITY.md that declares `adapt_results`.
 *
 * The fence pattern tolerates a carriage return before the newline. These files
 * are CRLF on this machine, and a pattern expecting only a bare newline after
 * the fence matched nothing and returned null — which then read as "the two
 * files differ" when in fact they were byte-identical.
 */
function documentedSql() {
  const blocks = SECURITY.match(/```sql\r?\n([\s\S]*?)```/g) ?? [];
  const found = blocks
    .map((b) => b.replace(/```sql\r?\n|```/g, ""))
    .find((b) => b.includes("create table if not exists public.adapt_results"));
  assert.ok(found, "SECURITY.md no longer contains the adapt_results DDL — §3e has moved or been removed");
  return found;
}

/** Column names declared in the `create table public.adapt_results (...)` block. */
function declaredColumns() {
  const m = documentedSql().match(/create table if not exists public\.adapt_results \(([\s\S]*?)\r?\n\);/);
  assert.ok(m, "the adapt_results create-table statement could not be parsed");
  return m[1]
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("--"))
    .map((l) => l.split(/\s+/)[0])
    .filter(Boolean);
}

function sampleRow() {
  const session = buildSession(20260810, ["aviation-maths"]);
  const mod = session.modules[0];
  const result = scoreModule(mod, mod.items.map((it) => it.answerIndex), 900);
  const rows = buildResultRows(session.seed, [result], "8f14e45f-ceea-467a-9c1e-6f1a1a1b2c3d");
  assert.equal(rows.length, 1);
  return rows[0];
}

/** Statements only — comments and the re-run guards are noise for comparison. */
const statements = (sql) =>
  sql
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("--") && !l.startsWith("drop policy"))
    .join("\n");

/**
 * SQL with every comment line removed.
 *
 * Needed for counting statements: a header explaining that "Postgres has no
 * `create policy if not exists`" contains the words `create policy`, and
 * counting raw matches made a correct script look like it had one more policy
 * than drops. Count what runs, not what is written about it.
 */
const codeOnly = (sql) =>
  sql.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");

// ── The contract between the code and the table ────────────────────────────

test("the DDL declares the columns the code depends on", () => {
  const cols = declaredColumns();
  for (const required of ["id", "user_id", "session_seed", "module_id", "module_kind", "detail", "created_at"]) {
    assert.ok(cols.includes(required), `the migration is missing ${required}`);
  }
});

test("every field the code writes exists as a column", () => {
  const cols = new Set(declaredColumns());
  for (const key of Object.keys(sampleRow())) {
    assert.ok(cols.has(key), `buildResultRows writes "${key}", which adapt_results has no column for`);
  }
});

test("the detail column is jsonb — the breakdown is an object, not a string", () => {
  assert.match(documentedSql(), /detail\s+jsonb/, "detail must be jsonb or the analysis queries cannot run");
  const detail = sampleRow().detail;
  assert.equal(typeof detail, "object");
  assert.ok(!Array.isArray(detail));
});

test("user_id cascades on delete, so removing an account removes its results", () => {
  assert.match(
    documentedSql(),
    /user_id\s+uuid not null references auth\.users\(id\) on delete cascade/,
    "without the cascade, deleting a student's account would strand their results"
  );
});

// ── The lockdown ───────────────────────────────────────────────────────────

test("row level security is enabled and both policies pin the row to its owner", () => {
  const sql = documentedSql();
  assert.match(sql, /alter table public\.adapt_results enable row level security/,
    "RLS is not enabled — every student could read every other student's results");
  assert.match(sql, /for insert to authenticated with check \(auth\.uid\(\) = user_id\)/,
    "the insert policy does not pin user_id to the caller — one account could write rows as another");
  assert.match(sql, /for select to authenticated using \(auth\.uid\(\) = user_id\)/,
    "the select policy does not pin user_id to the caller — one account could read another's results");
});

test("no policy grants anon access to the account-linked table", () => {
  // adapt_attempts (§3d) is deliberately anon-insertable; adapt_results must
  // never be. An anon policy here would make the RLS above decorative.
  for (const p of documentedSql().match(/create policy[\s\S]*?;/g) ?? []) {
    assert.doesNotMatch(p, /\bto anon\b/, `an anon policy on adapt_results: ${p.slice(0, 80)}`);
  }
});

// ── The migration file and the document must not drift ─────────────────────

test("the runnable migration matches the DDL documented in SECURITY.md", () => {
  // Two copies of a schema is two chances to be wrong. The migration was
  // generated from SECURITY.md; this is what stops someone editing one and not
  // the other, which would leave the Captain applying a table that the document
  // — and therefore the published analysis queries — no longer describe.
  assert.equal(
    statements(MIGRATION),
    statements(documentedSql()),
    "supabase/migrations/…_adapt_results.sql and SECURITY.md §3e have drifted apart"
  );
});

test("the migration is safe to run twice", () => {
  assert.match(MIGRATION, /create table if not exists/, "a second run would fail on the table");
  assert.match(MIGRATION, /create index if not exists/, "a second run would fail on the index");
  // Postgres has no `create policy if not exists`, so each policy must be
  // dropped first or a re-run dies partway through — leaving the table created
  // and the policies half-applied, which is the worst state to be in.
  const sql = codeOnly(MIGRATION);
  const policies = (sql.match(/create policy/g) ?? []).length;
  const drops = (sql.match(/drop policy if exists/g) ?? []).length;
  assert.equal(drops, policies, `${policies} policies but ${drops} drops — a re-run would fail`);
});

test("the published analysis queries reference columns that exist", () => {
  // These are what the Captain will actually run to read the data. A query
  // naming a renamed column is a broken promise in a document he will trust.
  const cols = declaredColumns();
  const queries = (SECURITY.match(/```sql\r?\n([\s\S]*?)```/g) ?? [])
    .map((b) => b.replace(/```sql\r?\n|```/g, ""))
    .find((b) => b.includes("jsonb_each") || b.includes("mean_stanine"));
  if (!queries) return;
  for (const named of ["module_kind", "module_id", "stanine", "detail"]) {
    if (queries.includes(named)) assert.ok(cols.includes(named), `a published query uses ${named}, which is not a column`);
  }
});

// ── The stand-in endpoint used for local verification ──────────────────────

test("the mock Supabase server is clearly marked as verification-only", () => {
  // It authenticates nobody. If it ever reads as a legitimate backend, someone
  // will eventually point something real at it.
  const mock = fs.readFileSync(path.join(ROOT, "tools/adapt/mock-supabase.mjs"), "utf8");
  assert.match(mock, /NEVER point the deployed site at this/i);
  assert.match(mock, /localhost/i);
  assert.doesNotMatch(mock, /eyJ[A-Za-z0-9_-]{20,}/, "the mock contains something shaped like a real JWT");
});

test("no tool in this feature asks for a service-role key", () => {
  // A service_role key bypasses RLS entirely. Nothing here needs one, and a
  // script that asks for one is a script someone will eventually paste one into.
  for (const f of ["mock-supabase.mjs", "verify-save-path.mjs", "verify-rls.mjs"]) {
    const src = fs.readFileSync(path.join(ROOT, "tools/adapt", f), "utf8");
    assert.doesNotMatch(src, /SERVICE_ROLE_KEY|service_role_key/, `${f} references a service-role key`);
  }
});

// ── The deploy-order window ────────────────────────────────────────────────

test("a missing table is treated as not-ready, and never as a failure", () => {
  // The code and the table ship separately, so there is always a window where
  // one exists and the other does not. In that window a signed-in student must
  // not be shown a Postgres error and left thinking their result was lost.
  // The predicate itself lives in results-core.mjs — ONE copy, imported by both
  // the client that saves and the probe that verifies. It was written out twice
  // at first, which meant the probe could keep passing after the real check had
  // changed.
  const core = fs.readFileSync(path.join(ROOT, "lib/adapt/results-core.mjs"), "utf8");
  assert.match(core, /PGRST205/, "PostgREST's schema-cache code is not recognised");
  assert.match(core, /42P01/, "Postgres' undefined-table code is not recognised");

  const src = fs.readFileSync(path.join(ROOT, "lib/adapt/results.ts"), "utf8");
  assert.match(src, /"not-ready"/, "there is no not-ready outcome to return");
  assert.match(src, /import \{[^}]*tableMissing[^}]*\} from "@\/lib\/adapt\/results-core\.mjs"/,
    "results.ts does not import the shared predicate — it has grown its own copy again");

  // And the report must render that outcome WITHOUT the raw database message.
  const report = fs.readFileSync(path.join(ROOT, "app/adapt-test/ReportBlocks.tsx"), "utf8");
  assert.match(report, /not-ready/, "the report does not handle the not-ready outcome");
  const branch = report.slice(report.indexOf('outcome.status === "not-ready"'));
  const shown = branch.slice(0, branch.indexOf("</div>"));
  assert.doesNotMatch(shown, /outcome\.reason/, "the not-ready message leaks the database error text");
});

test("the not-ready predicate is exercised against a real PostgREST error", () => {
  // tools/adapt/verify-not-ready.mjs stands up a server returning exactly what
  // PostgREST returns for a missing table. This asserts that check still exists
  // and still asserts what it claims to.
  const probe = fs.readFileSync(path.join(ROOT, "tools/adapt/verify-not-ready.mjs"), "utf8");
  assert.match(probe, /PGRST205/, "the probe no longer simulates the real PostgREST error");
  assert.match(probe, /Could not find the table/);
  assert.match(probe, /process\.exit\(pass \? 0 : 1\)/, "the probe does not fail the build when it fails");
  // And it must IMPORT the predicate rather than restate it, or it is testing
  // its own copy and proving nothing about the code that actually runs.
  assert.match(probe, /import \{ tableMissing \} from "\.\.\/\.\.\/lib\/adapt\/results-core\.mjs"/,
    "the probe does not import the shared predicate");
  assert.doesNotMatch(probe, /const tableMissing\s*=/, "the probe has grown its own copy of the predicate again");
});

// ── The older, anonymous table ─────────────────────────────────────────────

test("the adapt_attempts repair script exists and is safe to run twice", () => {
  // adapt_attempts (§3d) shipped in code on 2026-08-10 but may never have been
  // created in the database — the project reports "No migrations". If it does
  // not exist, the anonymous telemetry has been failing silently and the norms
  // that are meant to replace the provisional grade bands are not accumulating.
  const repair = fs.readFileSync(path.join(ROOT, "tools/adapt/repair-adapt-attempts.sql"), "utf8");
  assert.match(repair, /create table if not exists public\.adapt_attempts/);
  assert.match(repair, /create index if not exists/);
  // Postgres has no `create policy if not exists`, so a re-run needs the drop.
  const body = codeOnly(repair);
  const policies = (body.match(/create policy/g) ?? []).length;
  const drops = (body.match(/drop policy if exists/g) ?? []).length;
  assert.equal(drops, policies, "a second run of the repair script would fail");
  // It must never drop or truncate anything.
  assert.doesNotMatch(repair, /drop table|truncate|delete from/i, "the repair script destroys data");
});

test("the repair script's columns match what telemetry actually writes", () => {
  // The same class of bug as adapt_results: code writing a column the table
  // does not have. telemetry-core builds these rows, so they must line up.
  const repair = fs.readFileSync(path.join(ROOT, "tools/adapt/repair-adapt-attempts.sql"), "utf8");
  const m = repair.match(/create table if not exists public\.adapt_attempts \(([\s\S]*?)\r?\n\);/);
  assert.ok(m, "the adapt_attempts create-table statement could not be parsed");
  const cols = new Set(
    m[1].split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("--")).map((l) => l.split(/\s+/)[0])
  );
  for (const required of ["device_id", "session_seed", "module_id", "module_kind", "stanine", "headline_pct", "input_class", "completed"]) {
    assert.ok(cols.has(required), `the repair script is missing ${required}, which telemetry writes`);
  }
});
