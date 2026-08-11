// A stand-in Supabase endpoint, for verifying the signed-in ADAPT save path
// on a machine that has no Supabase credentials.
//
// ── Why this exists ────────────────────────────────────────────────────────
//
// `.env.local` in this repo has EMPTY Supabase values — the real URL and keys
// live only in Vercel. So on a developer machine `SUPABASE_ENABLED` is false,
// auth is switched off, and the entire signed-in half of the ADAPT feature is
// unreachable. It cannot be clicked, so it cannot be verified, so it ships on
// the strength of unit tests alone. That is exactly the gap this closes.
//
// It speaks enough GoTrue and PostgREST for the Supabase JS client to believe
// it is signed in and to accept an insert, and it RECORDS every row it is
// given so the payload can be inspected.
//
// ── What it proves, and what it does not ──────────────────────────────────
//
// PROVES: the client is constructed, the user is read, the save fires, the
// table name and HTTP method are right, and the exact JSON body that would
// reach Supabase — plus the whole signed-in UI path (the "saved" notice, the
// dashboard panel, the learning curve).
//
// DOES NOT PROVE: that Postgres accepts the schema, or that the RLS policies
// behave. Those need the real database. The column contract is covered
// separately by results-schema.test.mjs, which parses the migration in
// SECURITY.md and checks every field the code writes against it.
//
// NEVER point the deployed site at this. It authenticates nobody and stores
// nothing. Run it only on localhost, for verification.

import http from "node:http";
import fs from "node:fs";

const PORT = Number(process.argv[2] ?? 54321);
const OUT = process.argv[3] ?? "/tmp/adapt-mock-rows.json";

const USER = {
  id: "11111111-2222-4333-8444-555555555555",
  aud: "authenticated",
  role: "authenticated",
  email: "verification@localhost.invalid",
  app_metadata: { provider: "email" },
  user_metadata: { name: "Verification Run" },
  created_at: new Date(0).toISOString(),
};

const SESSION = {
  access_token: "mock-access-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: "mock-refresh-token",
  user: USER,
};

/** Everything the app tried to write, in order. */
const captured = [];

const send = (res, code, body) => {
  const json = JSON.stringify(body);
  res.writeHead(code, {
    "Content-Type": "application/json",
    // The browser calls this cross-origin from the app's port.
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Expose-Headers": "*",
  });
  res.end(json);
};

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});

  const url = new URL(req.url, `http://localhost:${PORT}`);
  // Log EVERY request. The first version logged only inserts, so an auth call
  // that never arrived and an auth call that arrived and worked looked
  // identical from the outside — which wasted a round of debugging.
  console.log(`[mock] ${req.method} ${req.url}`);

  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    // ── GoTrue: enough for the client to consider itself signed in ────────
    if (url.pathname === "/auth/v1/user") return send(res, 200, USER);
    if (url.pathname.startsWith("/auth/v1/token")) return send(res, 200, SESSION);
    if (url.pathname === "/auth/v1/logout") return send(res, 204, {});

    // ── PostgREST ────────────────────────────────────────────────────────
    if (url.pathname.startsWith("/rest/v1/")) {
      const table = url.pathname.replace("/rest/v1/", "");

      if (req.method === "POST") {
        let rows;
        try {
          rows = JSON.parse(body || "[]");
        } catch {
          return send(res, 400, { message: "the app sent a body that is not JSON" });
        }
        const list = Array.isArray(rows) ? rows : [rows];
        captured.push({ table, at: new Date().toISOString(), rows: list });
        fs.writeFileSync(OUT, JSON.stringify(captured, null, 2));
        console.log(`[mock] INSERT ${table}: ${list.length} row(s)`);
        for (const r of list) {
          console.log(`        ${r.module_id ?? "?"} stanine=${r.stanine} sten=${r.sten} band=${r.band} pct=${r.headline_pct}`);
        }
        return send(res, 201, list);
      }

      if (req.method === "GET") {
        // Reads come back from what was written, so the dashboard and the
        // learning curve have something real to render.
        const rows = captured.filter((c) => c.table === table).flatMap((c) => c.rows);
        return send(res, 200, rows);
      }
    }

    send(res, 404, { message: `mock has no route for ${req.method} ${url.pathname}` });
  });
});

server.listen(PORT, () => {
  console.log(`[mock] stand-in Supabase on http://localhost:${PORT}`);
  console.log(`[mock] user id ${USER.id}`);
  console.log(`[mock] captured rows -> ${OUT}`);
});
