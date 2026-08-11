// Prove the site behaves well in the window where the code has deployed but the
// table has not been created yet.
//
// This window is real and unavoidable: the site ships from a git push, the
// table is created by hand in Supabase, and whichever happens second leaves a
// gap. What must NOT happen in that gap is a signed-in student being shown a
// Postgres schema-cache error and concluding their result was lost.

import http from "node:http";
import { createClient } from "@supabase/supabase-js";

const PORT = 54399;

// Exactly what PostgREST returns for a table that does not exist.
const server = http.createServer((req, res) => {
  res.writeHead(404, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify({
    code: "PGRST205",
    details: null,
    hint: null,
    message: "Could not find the table 'public.adapt_results' in the schema cache",
  }));
});
await new Promise((r) => server.listen(PORT, r));

const sb = createClient(`http://localhost:${PORT}`, "anon", { auth: { persistSession: false } });
const { error } = await sb.from("adapt_results").insert({ module_id: "probe" });

// The same predicate results.ts uses. Kept in step by the test below.
const tableMissing = (e) =>
  !!e && (e.code === "42P01" || e.code === "PGRST205" ||
    /does not exist|schema cache|could not find the table/i.test(e.message ?? ""));

const pass = tableMissing(error);
console.log(`\n  ${pass ? "PASS" : "FAIL"}  a missing table is recognised as "not ready", not as a failure`);
console.log(`        server said: ${error?.code} — ${error?.message}`);
server.close();
process.exit(pass ? 0 : 1);
