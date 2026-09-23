#!/usr/bin/env node
/**
 * IndexNow: tell Bing (which ChatGPT search and Copilot draw on) the moment a page changes,
 * instead of waiting to be crawled. Free, no account needed - ownership is proved by the key
 * file at the site root.
 *
 *   node tools/seo/indexnow.mjs            # submit URLs whose sitemap <lastmod> changed since the last run
 *   node tools/seo/indexnow.mjs --all      # first run: submit every URL in the live sitemap
 *   node tools/seo/indexnow.mjs --dry      # show what would be submitted, send nothing
 *
 * Run it AFTER a deploy has gone live (the key file and the new pages must be reachable).
 * Protocol: https://www.indexnow.org/documentation - POST {host,key,keyLocation,urlList},
 * up to 10,000 URLs, 200 OK / 202 Accepted on success.
 *
 * The key is in public/<key>.txt. Never edit or delete that file: it proves ownership, the same
 * way the Google verification file does (see tools/audit/ownership-files.mjs).
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const HOST = "ghostaviator.com";
const SITE = `https://${HOST}`;
const STATE = join(ROOT, "tools", "seo", ".indexnow-state.json");
const args = new Set(process.argv.slice(2));

async function main() {
  const keyFile = readdirSync(join(ROOT, "public")).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (!keyFile) throw new Error("IndexNow key file public/<32-hex>.txt not found");
  const key = readFileSync(join(ROOT, "public", keyFile), "utf8").trim();
  if (`${key}.txt` !== keyFile) throw new Error("Key file content must equal its name");

  const UA = { "User-Agent": "Mozilla/5.0 (compatible; GhostAviator-IndexNow/1.0)" };
  const live = await fetch(`${SITE}/${keyFile}`, { headers: UA });
  if (!live.ok || (await live.text()).trim() !== key) {
    console.error(`The key file is not live at ${SITE}/${keyFile} yet - deploy first, then run this.`);
    return 2;
  }

  const xml = await (await fetch(`${SITE}/sitemap.xml`, { headers: UA })).text();
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: (m[1].match(/<loc>(.*?)<\/loc>/) || [])[1],
    lastmod: (m[1].match(/<lastmod>(.*?)<\/lastmod>/) || [])[1] || "",
  })).filter((e) => e.loc && e.loc.startsWith(SITE));

  const before = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
  const changed = args.has("--all") ? entries : entries.filter((e) => before[e.loc] !== e.lastmod);
  console.log(`${entries.length} URLs in the live sitemap; ${changed.length} to submit.`);
  if (!changed.length || args.has("--dry")) {
    changed.slice(0, 20).forEach((e) => console.log("  " + e.loc));
    return 0;
  }

  for (let i = 0; i < changed.length; i += 10000) {
    const batch = changed.slice(i, i + 10000);
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${keyFile}`, urlList: batch.map((e) => e.loc) }),
    });
    console.log(`IndexNow: HTTP ${res.status} for ${batch.length} URLs` + (res.status === 200 || res.status === 202 ? "" : " - NOT accepted"));
    if (res.status !== 200 && res.status !== 202) return 1;
  }
  const next = Object.fromEntries(entries.map((e) => [e.loc, e.lastmod]));
  writeFileSync(STATE, JSON.stringify(next, null, 1));
  console.log("State saved; the next run submits only what changes.");
  return 0;
}

// exitCode, not process.exit(): exiting with a fetch socket open trips a libuv assertion on Windows.
process.exitCode = await main();
