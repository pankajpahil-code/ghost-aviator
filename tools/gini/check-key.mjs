/**
 * Is the Gemini key set up correctly?
 *
 *   node tools/gini/check-key.mjs
 *
 * Reports the SHAPE of the key and whether Google accepts it. It never prints
 * the key, never logs it, and never sends it anywhere except Google.
 *
 * This exists because setting an API key by pasting a shell command into a text
 * file is a genuinely easy mistake to make, and the failure is silent: Gini just
 * keeps falling back to his offline answers and nothing tells you why.
 */

import fs from "node:fs";
import path from "node:path";

const ENV_FILE = path.join(process.cwd(), ".env.local");
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const say = (s = "") => console.log(s);

/** Minimal .env parser — node does not load .env.local the way Next does. */
function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const k = line.slice(0, eq).trim();
    if (!/^[A-Z_][A-Z0-9_]*$/i.test(k)) continue;      // skip pasted commands
    out[k] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

/**
 * Everything lives in main() so a failure can `return` and stop.
 *
 * It did not, briefly, and the bug is worth remembering: swapping
 * `process.exit(1)` for `process.exitCode = 1` to silence a noisy libuv
 * teardown ALSO removed the halt those calls were providing, so the success
 * path fell straight through into the failure path and reported a working key
 * as rejected. Setting an exit code is not a control-flow statement.
 */
async function main() {
  const fileEnv = readEnvFile(ENV_FILE);
  const key = process.env.GEMINI_API_KEY || fileEnv.GEMINI_API_KEY;

  say("=".repeat(60));
  say("GEMINI KEY CHECK");
  say("=".repeat(60));
  say(`env file : ${fs.existsSync(ENV_FILE) ? ENV_FILE : "NOT FOUND"}`);

  if (!key) {
    say("\nGEMINI_API_KEY: NOT SET");
    say("\nFix: open the file and add ONE line, then save:");
    say("     GEMINI_API_KEY=AQ.Ab...your-key...");
    say("\nGet a key at https://aistudio.google.com/apikey (click Create API key).");
    say("New keys start 'AQ.' — that is the current format and it is correct.");
    say("Do not paste a shell command into the file — just the line above.");
    return 1;
  }

  say(`\nGEMINI_API_KEY: set (${key.length} characters)`);

  /**
   * KEY FORMATS, and this block previously had it exactly backwards.
   *
   * Google is mid-migration. `AQ.Ab…` are the new "Auth keys" and are what AI
   * Studio issues now. `AIza…` are the legacy "Standard keys" — unrestricted
   * ones started being rejected in June 2026 and the format is scheduled to
   * stop working in September 2026.
   *
   * An earlier version of this script hard-failed on `AQ.` as "not an API key",
   * written from stale knowledge, and would have rejected the only key format a
   * new account can create. THE LESSON IS THE STRUCTURE, NOT THE PREFIXES:
   * never gate a real test behind a guess about format. The live call below is
   * the only thing that actually knows, so it always runs.
   */
  if (key.startsWith("AQ.")) {
    say("format   : Auth key (AQ.) — the current format AI Studio issues.");
  } else if (key.startsWith("AIza")) {
    say("format   : Standard key (AIza) — LEGACY. Google is retiring this format;");
    say("           unrestricted ones are already rejected. If the call below fails,");
    say("           create a new key and you will get an AQ. one.");
  } else {
    say("format   : unrecognised prefix. Testing it anyway — Google decides, not me.");
  }

  say(`model    : ${MODEL}`);
  say("\nCalling Google (one tiny request)…");

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15000);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: ctl.signal,
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, input: "Reply with the single word: ok" }),
    });

    if (res.ok) {
      const body = await res.json();
      const text =
        body?.output_text ??
        body?.steps?.at(-1)?.content?.find?.(c => typeof c?.text === "string")?.text ??
        body?.candidates?.[0]?.content?.parts?.[0]?.text ??
        null;
      say(`\nHTTP ${res.status} — Google accepted the key.`);
      say(`Model replied: ${text ? JSON.stringify(String(text).slice(0, 60)) : "(could not read the text field)"}`);
      if (!text) {
        say("\nThe call worked but the reply field was not where expected — the API");
        say("shape may have changed. Gini will fall back safely; tell Claude to");
        say("re-check the response format in lib/gini/gemini.ts.");
      }
      say("\nGini's smart mode is ready. Restart the dev/prod server to pick it up.");
      return 0;
    }

    const detail = await res.text().catch(() => "");
    say(`\nHTTP ${res.status} — Google REJECTED the request.`);
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      say("That usually means the key is wrong, revoked, or not enabled for the");
      say("Gemini API. Create a fresh one at https://aistudio.google.com/apikey");
      if (key.startsWith("AIza")) {
        say("This is a legacy AIza key and Google is retiring that format — a new");
        say("key (AQ.) is the most likely fix.");
      }
      if (key.startsWith("AQ.")) {
        say("Note: AQ. keys are rejected by OpenAI-compatible endpoints and some");
        say("third-party transports. Gini does NOT use those — it calls Google's own");
        say("/v1beta/interactions with an x-goog-api-key header — so if this fails,");
        say("suspect the key or the project, not the format.");
      }
    } else if (res.status === 429) {
      say("Rate limited or out of free-tier quota. The key itself is probably fine —");
      say("try again later. Gini falls back to his offline answers meanwhile.");
    } else if (res.status === 404) {
      say(`The model id "${MODEL}" was not found. Set GEMINI_MODEL in .env.local to`);
      say("a current model, or ask Claude to check the model list.");
    }
    // Google's error bodies do not echo the key, but trim hard just in case.
    if (detail) say(`\nDetail: ${detail.split(key).join("<key>").slice(0, 300)}`);
    return 1;
  } catch (e) {
    const aborted = e?.name === "AbortError";
    say(`\nCould not reach Google: ${aborted ? "timed out" : e?.message || e}`);
    say("Check your internet connection and try again.");
    return 1;
  } finally {
    clearTimeout(timer);
  }
}

process.exitCode = await main();
