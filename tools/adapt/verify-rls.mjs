// Prove the ADAPT tables are locked down, against the REAL Supabase project.
//
// Run this once the migration in supabase/migrations/ has been applied:
//
//   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co \
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key> \
//   node tools/adapt/verify-rls.mjs
//
// (Or just `npm run verify:adapt-rls` if those are already in your shell.)
//
// ── What it checks, and why with only the anon key ────────────────────────
//
// The dangerous failure is not "saving is broken" — that shows up immediately
// and loudly. It is "the table is readable by anyone", which shows up never,
// because nothing in the product would look different. So this runs as a
// STRANGER: no account, just the public anon key that every visitor's browser
// already has, and checks the stranger can neither read nor write results.
//
// It needs no service_role key, which means it is safe to run and safe to hand
// to anyone. The anon key is public by design; it is in the site's JavaScript.
//
// What it cannot check with only an anon key: that one SIGNED-IN student cannot
// read another's rows. That needs two accounts. The policies are written as
// `auth.uid() = user_id` for both select and insert, so the same mechanism
// governs both cases — but if you want it proven, sign in on two accounts and
// confirm each dashboard shows only its own sittings.

import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

/**
 * Read the two public values from .env.local if they are not already in the
 * environment, so `vercel env pull` is enough and nothing has to be exported
 * by hand. Values are used in-process and never printed.
 *
 * Only these two keys are read. Both are public by design — they are compiled
 * into the site's client JavaScript and every visitor's browser already has
 * them. Nothing here reads, wants, or would accept a service-role key.
 */
function fromEnvFile(name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = fs
      .readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith(`${name}=`));
    if (!line) return undefined;
    const raw = line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
    return raw || undefined;
  } catch {
    return undefined;
  }
}

const url = fromEnvFile("NEXT_PUBLIC_SUPABASE_URL");
const key = fromEnvFile("NEXT_PUBLIC_SUPABASE_ANON_KEY");

if (!url || !key) {
  console.error(
    "\nNEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not set,\n" +
      "and .env.local does not carry them (its values are empty strings).\n\n" +
      "Easiest fix — pull them from Vercel, which already has them:\n\n" +
      "    npx vercel link       (once, if not already linked)\n" +
      "    npx vercel env pull\n" +
      "    npm run verify:adapt-rls\n\n" +
      "Or copy them from the Supabase dashboard under Project Settings > API.\n" +
      "Both values are public — they are already in the site's JavaScript.\n"
  );
  process.exit(2);
}

const sb = createClient(url, key, { auth: { persistSession: false } });
let failed = 0;

const check = (label, pass, detail = "") => {
  console.log(`${pass ? "  PASS" : "  FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!pass) failed++;
};

console.log(`\nADAPT table lockdown — ${new URL(url).host}\n`);

// ── 1. The table exists at all ─────────────────────────────────────────────
const probe = await sb.from("adapt_results").select("id").limit(1);
const missing = probe.error && /does not exist|schema cache|not find the table/i.test(probe.error.message);

if (missing) {
  console.log("  adapt_results does not exist yet.\n");
  console.log("  Apply supabase/migrations/20260811000000_adapt_results.sql first —");
  console.log("  either `supabase db push`, or paste it into the SQL editor.\n");
  process.exit(3);
}
check("adapt_results exists", true);

// ── 2. A stranger cannot READ results ──────────────────────────────────────
//
// With RLS on and no select policy for anon, PostgREST returns an empty set
// rather than an error — so "no error" is NOT the same as "allowed". The test
// is that no rows come back.
const read = await sb.from("adapt_results").select("user_id, module_id, stanine").limit(5);
check(
  "a signed-out stranger reads no results",
  Boolean(read.error) || (Array.isArray(read.data) && read.data.length === 0),
  read.error ? `blocked: ${read.error.code ?? read.error.message}` : `${read.data.length} rows returned`
);

// ── 3. A stranger cannot WRITE results ─────────────────────────────────────
const forged = {
  user_id: "00000000-0000-4000-8000-000000000000",
  session_seed: 1,
  module_id: "rls-probe",
  module_kind: "knowledge",
  detail: {},
};
const write = await sb.from("adapt_results").insert(forged);
check(
  "a signed-out stranger cannot insert a result",
  Boolean(write.error),
  write.error ? `blocked: ${write.error.code ?? write.error.message}` : "THE INSERT SUCCEEDED — the insert policy is wrong"
);

// ── 4. The anonymous counts table still works, because it is meant to ─────
//
// adapt_attempts (SECURITY.md 3d) is deliberately anon-insertable and carries
// no user_id. If this ever starts failing, signed-out students stop being
// counted and the norms stop accumulating — a silent regression.
const anonRow = {
  device_id: "00000000-0000-4000-8000-000000000001",
  session_seed: 1,
  module_id: "rls-probe",
  module_kind: "knowledge",
  stanine: 5,
  headline_pct: 50,
  completed: true,
};
const anonWrite = await sb.from("adapt_attempts").insert(anonRow);
check(
  "the anonymous attempts table still accepts a row (by design)",
  !anonWrite.error,
  anonWrite.error ? anonWrite.error.message : "inserted a probe row — delete it if you like"
);

const anonRead = await sb.from("adapt_attempts").select("device_id").limit(1);
check(
  "...but nobody can read it back",
  Boolean(anonRead.error) || (Array.isArray(anonRead.data) && anonRead.data.length === 0),
  anonRead.error ? "blocked" : `${anonRead.data.length} rows returned`
);

console.log(
  failed
    ? `\n${failed} check(s) FAILED — do not ship until these pass.\n`
    : "\nAll checks passed. Signed-out visitors can neither read nor write results.\n" +
        "Note the probe row left in adapt_attempts (module_id 'rls-probe').\n"
);
process.exit(failed ? 1 : 0);
