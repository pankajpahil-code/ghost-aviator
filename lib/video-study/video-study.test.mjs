import { test } from "node:test";
import assert from "node:assert/strict";
import { AIR_REGULATIONS } from "./air-regulations.ts";
import { AIR_NAVIGATION } from "./air-navigation.ts";
import { METEOROLOGY } from "./meteorology.ts";
import { INSTRUMENTATION } from "./instrumentation.ts";
import { RADIO_NAVIGATION } from "./radio-navigation.ts";
import { RADIO_TELEPHONY } from "./radio-telephony.ts";
import { TECHNICAL_GENERAL } from "./technical-general.ts";

const MAPS = { "air-regulations": AIR_REGULATIONS, "air-navigation": AIR_NAVIGATION, meteorology: METEOROLOGY, instrumentation: INSTRUMENTATION, "radio-navigation": RADIO_NAVIGATION, "radio-telephony": RADIO_TELEPHONY, "technical-general": TECHNICAL_GENERAL };
const entries = Object.entries(MAPS).flatMap(([s, m]) => Object.entries(m).map(([c, study]) => ({ key: `${s}/${c}`, study })));
const words = (t) => t.split(/\s+/).filter(Boolean).length;
const BANNED = /\b(oxford|bali|joshi)\b/i;

test("there are study guides", () => assert.ok(entries.length >= 20));

for (const { key, study } of entries) {
  test(`${key}: structure and length`, () => {
    assert.ok(study.summary.length >= 2 && study.summary.length <= 3, "2–3 summary paragraphs");
    assert.ok(study.keyPoints.length >= 5 && study.keyPoints.length <= 8, "5–8 key points");
    assert.ok(study.traps.length >= 2, "at least 2 traps");
    const all = [...study.summary, ...study.keyPoints, ...study.traps].join(" ");
    assert.ok(words(all) >= 330, `guide is substantial (${words(all)} words)`);
    assert.ok(!BANNED.test(all), "no textbook names");
  });
}

test("no sentence is reused across guides", () => {
  const seen = new Map();
  for (const { key, study } of entries) {
    for (const s of [...study.summary, ...study.keyPoints, ...study.traps].join(" ").split(/(?<=[.!?])\s+/)) {
      if (words(s) < 6) continue;
      const k = s.toLowerCase();
      assert.ok(!seen.has(k) || seen.get(k) === key, `"${s}" appears in ${seen.get(k)} and ${key}`);
      seen.set(k, key);
    }
  }
});
