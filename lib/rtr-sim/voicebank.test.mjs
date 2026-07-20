// node --test — VoiceBank segmentation + shipped-bank coverage.
// The coverage test is the important one: if a new ATC phrase is added to the
// DialogueDirector and the bank isn't regenerated, this fails loudly instead
// of the radio silently falling back to a robotic voice for students.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { segmentLine, fragmentId, collectFragments } from "./segment.mjs";
import { rollWorld } from "./world.mjs";
import {
  buildVfrDeparture, buildIfrFlight, buildEmergencyFlight, buildRadioFailureFlight,
} from "./director.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANK = resolve(HERE, "../../public/rtr-voice/manifest.json");

test("segmenter: spelled letters and digits become atoms, fixed text stays a phrase", () => {
  const segs = segmentLine("Victor Bravo Charlie, runway two seven, cleared to land.");
  assert.deepEqual(segs.map(s => s.type),
    ["atom", "atom", "atom", "phrase", "atom", "atom", "phrase"]);
  assert.deepEqual(segs.map(s => s.key),
    ["victor", "bravo", "charlie", "runway", "two", "seven", "cleared to land"]);
});

test("segmenter: long fixed runs stay one phrase (prosody survives)", () => {
  const segs = segmentLine("All stations, Delhi Approach — DISTRESS TRAFFIC ENDED");
  assert.equal(segs.length, 1);
  assert.equal(segs[0].type, "phrase");
});

test("segmenter: punctuation and case never change a fragment id", () => {
  assert.equal(fragmentId(segmentLine("X-ray")[0]), fragmentId(segmentLine("xray,")[0]));
  assert.equal(fragmentId({ type: "phrase", key: "Cleared to land!" }),
               fragmentId({ type: "phrase", key: "cleared to land" }));
});

test("segmenter: ids are filesystem/URL safe", () => {
  const frags = collectFragments([
    "Victor Bravo Charlie, QNH one zero one three.",
    "All stations — STOP TRANSMITTING, MAYDAY.",
  ]);
  for (const id of frags.keys()) assert.match(id, /^[ap]_[a-z0-9_]+$/, id);
});

test("segmenter: every word of a line is preserved in order", () => {
  const line = "Ghostair two two four, climb to flight level nine zero, squawk four three two one.";
  const rebuilt = segmentLine(line).map(s => s.text).join(" ").toLowerCase().replace(/[^a-z0-9 ]/g, "");
  const original = line.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  assert.equal(rebuilt.replace(/\s+/g, " ").trim(), original);
});

test("shipped bank covers every ATC line the simulator can generate", { skip: !existsSync(BANK) }, () => {
  const bank = JSON.parse(readFileSync(BANK, "utf8"));
  const have = new Set(Object.keys(bank.fragments));
  const missing = new Set();
  for (const build of [buildVfrDeparture, buildIfrFlight, buildEmergencyFlight, buildRadioFailureFlight]) {
    for (let s = 1; s <= 120; s++) {
      for (const step of build(rollWorld(s)).steps) {
        const lines = [step.atcBefore, step.atcAfter,
          ...Object.values(step.probes ?? {}), ...Object.values(step.corrections ?? {})].filter(Boolean);
        for (const line of lines) {
          for (const seg of segmentLine(line)) {
            const id = fragmentId(seg);
            if (!have.has(id)) missing.add(`${id}  ←  "${seg.text}"`);
          }
        }
      }
    }
  }
  assert.deepEqual([...missing], [],
    `Bank is missing fragments — re-run:\n  node tools/rtr-sim/voicebank/enumerate.mjs\n  node tools/rtr-sim/voicebank/generate.mjs\n`);
});
