/**
 * Offline test for the Telegram bot brain. No network, no token.
 *
 *   npx tsx tools/telegram/test-brain.mts
 *
 * Runs representative student messages through replyFor() and FAILS on:
 *   - a reply over Telegram's length limit
 *   - a button URL that is not absolute https
 *   - a placeholder explanation leaking out ("Correct answer: B")
 *   - a third-party source name reaching the student (Iron Rule 2)
 *   - a price that is not one of the four live-classes.ts exports
 */

import { readFileSync } from "node:fs";
import { replyFor } from "../../lib/telegram-bot/brain";
import {
  LIVE_PRICE, LIVE_LIST_PRICE, LIVE_COMBO_PRICE, LIVE_COMBO_LIST_PRICE,
} from "../../lib/live-classes";

const PROBES = [
  "/start",
  "/classes",
  "/fees@GhostAviatorBot",
  "/free",
  "/rtr",
  "/adapt",
  "/talk",
  "/unknowncommand",
  "how much are the live classes",
  "what is QNH",
  "explain the 1 in 60 rule",
  "how does a VOR work",
  "what is a temperature inversion",
  "when is the next RTR exam",
  "who won the cricket match",
  "",
];

let forbidden: string[] = [];
try {
  const raw = JSON.parse(readFileSync("tools/forbidden-source-names.json", "utf8"));
  forbidden = (Array.isArray(raw) ? raw : raw.names || []).map((s: string) => s.toLowerCase());
} catch {
  forbidden = ["ic joshi", "rk bali", "oxford", "cae", "nordian", "jeppesen"];
}

const PRICES = new Set([LIVE_PRICE, LIVE_LIST_PRICE, LIVE_COMBO_PRICE, LIVE_COMBO_LIST_PRICE]);
let failures = 0;
const fail = (probe: string, why: string) => {
  failures++;
  console.log(`  FAIL [${probe}] ${why}`);
};

for (const probe of PROBES) {
  const r = await replyFor(probe);
  const firstLine = r.text.split("\n")[0].slice(0, 90);
  console.log(`\n> ${probe || "(empty)"}\n  ${firstLine}${r.text.length > 90 ? "…" : ""}`);
  console.log(`  buttons: ${r.buttons.flat().map(b => b.text).join(" | ")}`);

  if (r.text.length > 4096) fail(probe, `text ${r.text.length} chars > 4096`);
  if (!r.text.trim()) fail(probe, "empty text");
  if (/correct answer\s*:?\s*[a-d]\s*$/im.test(r.text)) fail(probe, "placeholder explanation leaked");

  for (const b of r.buttons.flat()) {
    if (!/^https:\/\//.test(b.url)) fail(probe, `non-https button url: ${b.url}`);
  }

  const blob = (r.text + " " + r.buttons.flat().map(b => b.text).join(" ")).toLowerCase();
  for (const name of forbidden) {
    if (new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(blob)) {
      fail(probe, `source name "${name}" reached the student`);
    }
  }

  for (const m of r.text.matchAll(/₹\s?[\d,]+/g)) {
    const p = m[0].replace(/\s/, "");
    if (!PRICES.has(p)) fail(probe, `price ${p} is not from live-classes.ts`);
  }
}

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} FAILURE(S)`} — ${PROBES.length} probes`);
process.exit(failures === 0 ? 0 : 1);
