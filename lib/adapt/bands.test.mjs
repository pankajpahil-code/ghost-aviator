import { test } from "node:test";
import assert from "node:assert/strict";
import {
  STEN_MEAN,
  STEN_SD,
  stenFromZ,
  stenFromStanine,
  COLOUR_BANDS,
  colourBandForSten,
  reportLine,
  BAND_PROVENANCE,
} from "./bands.mjs";
import { STANINE_MEAN, STANINE_SD } from "./stanine.mjs";

// ── The scale itself ───────────────────────────────────────────────────────

test("sten is the standard-ten scale: mean 5.5, sd 2", () => {
  assert.equal(STEN_MEAN, 5.5);
  assert.equal(STEN_SD, 2);
});

test("z of 0 lands mid-scale, and the scale is bounded 1-10", () => {
  assert.equal(stenFromZ(0), 6); // round(5.5) — the scale has no middle bin
  assert.equal(stenFromZ(-99), 1);
  assert.equal(stenFromZ(99), 10);
});

test("stenFromZ rejects a non-finite z rather than returning a number", () => {
  assert.throws(() => stenFromZ(NaN), RangeError);
  assert.throws(() => stenFromZ(Infinity), RangeError);
});

// ── Conversion from the scale this site scores in ──────────────────────────

test("every stanine 1-9 maps into the sten range", () => {
  for (let s = 1; s <= 9; s++) {
    const sten = stenFromStanine(s);
    assert.ok(Number.isInteger(sten) && sten >= 1 && sten <= 10, `stanine ${s} -> ${sten}`);
  }
});

test("the conversion goes through z, not through a range stretch", () => {
  // Both scales are linear maps of the same z, so converting must agree with
  // computing z from the stanine and reading the sten off it. A naive
  // 9-into-10 stretch would fail this at the ends.
  for (let s = 1; s <= 9; s++) {
    const z = (s - STANINE_MEAN) / STANINE_SD;
    assert.equal(stenFromStanine(s), stenFromZ(z), `stanine ${s}`);
  }
});

test("the conversion is monotonic — a better stanine never reports a worse sten", () => {
  let prev = 0;
  for (let s = 1; s <= 9; s++) {
    const sten = stenFromStanine(s);
    assert.ok(sten >= prev, `stanine ${s} produced ${sten} after ${prev}`);
    prev = sten;
  }
});

test("stenFromStanine rejects anything that is not a stanine", () => {
  assert.throws(() => stenFromStanine(0), RangeError);
  assert.throws(() => stenFromStanine(10), RangeError);
  assert.throws(() => stenFromStanine(5.5), RangeError);
  assert.throws(() => stenFromStanine("6"), RangeError);
});

// ── Colour bands ───────────────────────────────────────────────────────────

test("the band table covers sten 1-10 with no gap and no overlap", () => {
  const seen = new Set();
  for (const b of COLOUR_BANDS) {
    for (let s = b.sten[0]; s <= b.sten[1]; s++) {
      assert.ok(!seen.has(s), `sten ${s} is claimed by two bands`);
      seen.add(s);
    }
  }
  for (let s = 1; s <= 10; s++) assert.ok(seen.has(s), `sten ${s} has no band`);
  assert.equal(seen.size, 10);
});

test("every sten resolves to a band, and the bands run worst to best", () => {
  for (let s = 1; s <= 10; s++) {
    const band = colourBandForSten(s);
    assert.ok(band.key && band.label && band.advice, `sten ${s} band is incomplete`);
  }
  const order = COLOUR_BANDS.map((b) => b.sten[0]);
  assert.deepEqual(order, [...order].sort((a, b) => a - b), "bands are not in ascending order");
});

test("colourBandForSten rejects an off-scale score", () => {
  assert.throws(() => colourBandForSten(0), RangeError);
  assert.throws(() => colourBandForSten(11), RangeError);
  assert.throws(() => colourBandForSten(null), RangeError);
});

test("every band carries a colour the report can actually paint", () => {
  for (const b of COLOUR_BANDS) {
    assert.match(b.hex, /^#[0-9a-f]{6}$/i, `${b.key} has no usable hex`);
    assert.equal(b.colour, b.hex, `${b.key} colour and hex disagree`);
  }
});

// ── The report line ────────────────────────────────────────────────────────

test("reportLine returns the stanine, the sten and the band together", () => {
  const line = reportLine(7, "criterion");
  assert.equal(line.stanine, 7);
  assert.equal(line.sten, stenFromStanine(7));
  assert.equal(line.band.key, colourBandForSten(line.sten).key);
  assert.equal(line.basis, "criterion");
});

test("reportLine carries the basis through unchanged and never invents one", () => {
  assert.equal(reportLine(5).basis, null);
  assert.equal(reportLine(5, "observed").basis, "observed");
});

test("a bottom and a top stanine land in the extreme bands", () => {
  assert.equal(reportLine(1).band.key, "well-below");
  assert.equal(reportLine(9).band.key, "well-above");
});

// ── The promise the page makes ─────────────────────────────────────────────

test("the provenance sentence says the boundaries are ours, not the publisher's", () => {
  // This string is a factual claim printed to students. If someone softens it
  // into implying the real bands are reproduced here, that is a lie about a
  // score, and this test is the thing that catches it.
  assert.match(BAND_PROVENANCE, /our own/i);
  assert.match(BAND_PROVENANCE, /does not publish/i);
});

test("no source or publisher name leaks into student-facing band text", () => {
  // Iron Rule 2 — nothing user-visible may name the vendor or a textbook.
  const banned = /symbiotic|adapt2|oxford|cae|indigo|joshi|bali/i;
  assert.doesNotMatch(BAND_PROVENANCE, banned);
  for (const b of COLOUR_BANDS) {
    assert.doesNotMatch(b.label, banned, b.key);
    assert.doesNotMatch(b.advice, banned, b.key);
  }
});
