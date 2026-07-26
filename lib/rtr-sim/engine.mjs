// RTR(A) simulator — deterministic scoring engine (Phase A).
// Pure functions only: no DOM, no network, no state. Consumed by the future
// simulator UI (voice transcript or tap-composer output) and by node --test.
// Design contract: RTR_SIMULATOR_DESIGN.md §5; scenario semantics in
// tools/rtr-sim/SCENARIO_DRAFTS.md. Phraseology normalization rules follow
// ICAO number/phonetic conventions as taught in the site's RTR book.

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

// Spoken digits, incl. ICAO-altered forms and common recognizer spellings.
const DIGIT_WORDS = {
  zero: "0", wun: "1", one: "1", two: "2", three: "3", tree: "3",
  four: "4", fower: "4", five: "5", fife: "5", six: "6", seven: "7",
  eight: "8", ait: "8", nine: "9", niner: "9",
};

// Digit words that double as ordinary English words — counted as digits only
// when adjacent to other numeric tokens ("one to one tree" → 1213, but
// "cleared to the field" keeps its "to").
const GATED_DIGIT_WORDS = { to: "2", too: "2", for: "4", oh: "0" };

// "decimal" is always a decimal separator; "point" only when digits flank it
// ("one two one point five" → 121.5) — never in "holding point".
const DECIMAL_WORDS = new Set(["decimal", "dayseemal"]);
const GATED_DECIMAL_WORDS = new Set(["point"]);
const MULTIPLIER_WORDS = { hundred: 100, thousand: 1000 };

const PHONETIC = {
  alfa: "a", alpha: "a", bravo: "b", charlie: "c", delta: "d", echo: "e",
  foxtrot: "f", golf: "g", hotel: "h", india: "i", juliett: "j", juliet: "j",
  kilo: "k", lima: "l", mike: "m", november: "n", oscar: "o", papa: "p",
  quebec: "q", romeo: "r", sierra: "s", tango: "t", uniform: "u", victor: "v",
  whiskey: "w", whisky: "w", xray: "x", yankee: "y", zulu: "z",
};

// Single-token repairs for frequent speech-recognition confusions. Grows from
// real usage — keep it data, not logic.
const CONFUSIONS = {
  clime: "climb", wilko: "wilco", "wil-co": "wilco", rodger: "roger",
  squark: "squawk", squak: "squawk", takeoff: "take off", pushback: "push back",
};

// ---------------------------------------------------------------------------
// Tokenization & normalization
// ---------------------------------------------------------------------------

export function tokenize(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9.\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter(Boolean)
    .flatMap((t) => (CONFUSIONS[t] ? CONFUSIONS[t].split(" ") : [t]));
}

const isFigure = (t) => /^\d+(\.\d+)?$/.test(t);

function isNumericWord(t) {
  return t in DIGIT_WORDS || DECIMAL_WORDS.has(t) || t in MULTIPLIER_WORDS || isFigure(t);
}

// A gated word joins a numeric group only when true numeric tokens flank it on
// BOTH sides ("one to one tree" → 1213). One-sided adjacency must NOT count:
// in "descend to two thousand five hundred" the "to" is English, and folding
// it in would turn 2500 into 22500 — the exact ambiguity ICAO phraseology
// exists to prevent.
function isNumericAt(tokens, i) {
  const t = tokens[i];
  if (isNumericWord(t)) return true;
  if (t in GATED_DIGIT_WORDS || GATED_DECIMAL_WORDS.has(t)) {
    const prev = tokens[i - 1], next = tokens[i + 1];
    return prev !== undefined && isNumericWord(prev) &&
           next !== undefined && isNumericWord(next);
  }
  return false;
}

// Parse one run of numeric tokens into a canonical value string.
// Pure digit runs concatenate and KEEP leading zeros (heading "zero eight zero"
// → "080"); hundred/thousand switch the run to arithmetic ("two thousand five
// hundred" → "2500"); "decimal" splits integer/fraction ("one two one decimal
// nine" → "121.9").
function parseNumericGroup(group) {
  let total = 0, usedMultiplier = false;
  let intDigits = "", fracDigits = "", inFraction = false;

  for (const t of group) {
    if (DECIMAL_WORDS.has(t) || GATED_DECIMAL_WORDS.has(t)) { inFraction = true; continue; }
    if (t in MULTIPLIER_WORDS) {
      usedMultiplier = true;
      total += Number(intDigits === "" ? "1" : intDigits) * MULTIPLIER_WORDS[t];
      intDigits = "";
      continue;
    }
    const d = DIGIT_WORDS[t] ?? GATED_DIGIT_WORDS[t] ?? (isFigure(t) ? t : null);
    if (d === null) continue;
    if (inFraction) fracDigits += d; else intDigits += d;
  }

  if (usedMultiplier) {
    total += intDigits === "" ? 0 : Number(intDigits);
    return String(total);
  }
  if (inFraction) return `${intDigits || "0"}.${fracDigits}`;
  return intDigits;
}

// Normalize an utterance to canonical tokens: numeric runs become value
// strings, phonetic runs become fused letter strings, "flight level" → "fl".
export function normalize(text) {
  const tokens = tokenize(text);
  const out = [];
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i] === "flight" && tokens[i + 1] === "level") {
      out.push("fl");
      i += 2;
      continue;
    }
    if (isNumericAt(tokens, i)) {
      // Collect one numeric group. Two guards keep adjacent numbers from
      // fusing ("…decimal three five, one one eight decimal five three"):
      // (1) a number has at most ONE decimal point — a dotted figure is a
      //     complete number by itself;
      // (2) if ANOTHER decimal-word lies ahead in this same numeric run, the
      //     three digits before it are the next number's integer part (VHF
      //     frequencies always speak three integer digits), so the current
      //     fraction takes only the digits before those.
      const group = [];
      let sawDecimal = false;
      let fracBudget = Infinity;
      while (i < tokens.length && isNumericAt(tokens, i)) {
        const t = tokens[i];
        const isDec = DECIMAL_WORDS.has(t) || GATED_DECIMAL_WORDS.has(t);
        const isDottedFigure = /^\d+\.\d+$/.test(t);
        if ((isDec && sawDecimal) || (isDottedFigure && group.length > 0)) break;
        if (sawDecimal) {
          if (fracBudget <= 0) break;
          fracBudget--;
        }
        if (isDec) {
          sawDecimal = true;
          // Lookahead: digits between here and the run's next decimal-word.
          let ahead = 0, j = i + 1, nextDec = -1;
          while (j < tokens.length && isNumericAt(tokens, j)) {
            const u = tokens[j];
            if (DECIMAL_WORDS.has(u) || GATED_DECIMAL_WORDS.has(u)) { nextDec = j; break; }
            ahead++; j++;
          }
          if (nextDec !== -1) fracBudget = Math.max(1, ahead - 3);
        }
        if (isDottedFigure) sawDecimal = true;
        group.push(tokens[i++]);
        if (isDottedFigure) break;
      }
      const value = parseNumericGroup(group);
      if (value !== "") out.push(value);
      continue;
    }
    if (PHONETIC[tokens[i]]) {
      let letters = "";
      while (i < tokens.length && PHONETIC[tokens[i]]) letters += PHONETIC[tokens[i++]];
      out.push(letters);
      continue;
    }
    out.push(tokens[i++]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Sequence helpers
// ---------------------------------------------------------------------------

function findSeq(haystack, needle, from = 0) {
  if (needle.length === 0) return -1;
  for (let i = from; i <= haystack.length - needle.length; i++) {
    let ok = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) { ok = false; break; }
    }
    if (ok) return i;
  }
  return -1;
}

export function containsPhrase(normTokens, phrase) {
  return findSeq(normTokens, normalize(phrase)) !== -1;
}

// ---------------------------------------------------------------------------
// Slot matching
// ---------------------------------------------------------------------------

// Slot shapes (see engine.d.ts):
//  value slot:  { key, critical?, value, anchor?, window? }
//  phrase slot: { key, critical?, phrases: [variants...] }
// Statuses: "ok" | "wrong" | "missing".

function matchValueSlot(norm, slot) {
  const value = String(slot.value);
  const anchor = slot.anchor ? normalize(slot.anchor) : null;
  const window = slot.window ?? 4;

  if (anchor) {
    const at = findSeq(norm, anchor);
    if (at !== -1) {
      const start = at + anchor.length;
      const zone = norm.slice(start, start + window);
      if (zone.includes(value)) return "ok";
      // Anchor spoken but a different numeric value follows → read back wrong.
      if (zone.some((t) => isFigure(t) && t !== value)) return "wrong";
      // Anchor spoken with no value in the window; fall through to bare search.
    }
  }
  return norm.includes(value) ? "ok" : "missing";
}

function matchPhraseSlot(norm, slot) {
  return slot.phrases.some((p) => containsPhrase(norm, p)) ? "ok" : "missing";
}

export function matchSlot(normTokens, slot) {
  return slot.value !== undefined
    ? matchValueSlot(normTokens, slot)
    : matchPhraseSlot(normTokens, slot);
}

// Callsign matching runs on SQUASHED strings (tokens joined without spaces) so
// the written form "VT-ABC" (tokens "vt","abc") and the spoken form "victor
// tango alfa bravo charlie" (fused token "vtabc") compare equal. "ok-end" when
// the last occurrence closes the transmission.
export function matchCallsign(normTokens, callsign) {
  const target = normalize(callsign).join("");
  const squashed = normTokens.join("");
  const at = squashed.lastIndexOf(target);
  if (at === -1) return "missing";
  const tailStart = Math.max(0, squashed.length - target.length - 6);
  return at >= tailStart ? "ok-end" : "ok";
}

// ---------------------------------------------------------------------------
// Transmission scoring
// ---------------------------------------------------------------------------

export const DEFAULT_WEIGHTS = {
  criticalOk: 2,
  minorOk: 1,
  callsignOk: 1,
  callsignMisplacedPenalty: 0, // still earns 0 of 1; position noted in detail
};

// expect: { slots: [...], callsign?: string, forbidden?: [phrases] }
// Returns per-slot detail plus points/maxPoints and the branch triggers the
// scenario runner acts on (probe on missing critical, correction on wrong).
export function scoreTransmission(expect, utterance, weights = DEFAULT_WEIGHTS) {
  const norm = normalize(utterance);
  const slots = (expect.slots ?? []).map((slot) => ({
    key: slot.key,
    critical: !!slot.critical,
    status: matchSlot(norm, slot),
  }));

  const forbidden = (expect.forbidden ?? []).filter((p) => containsPhrase(norm, p));

  let points = 0, maxPoints = 0;
  for (const s of slots) {
    const worth = s.critical ? weights.criticalOk : weights.minorOk;
    maxPoints += worth;
    if (s.status === "ok") points += worth;
  }

  let callsign = null;
  if (expect.callsign) {
    callsign = matchCallsign(norm, expect.callsign);
    maxPoints += weights.callsignOk;
    if (callsign === "ok-end") points += weights.callsignOk;
  }

  return {
    norm,
    slots,
    callsign,
    forbidden,
    points,
    maxPoints,
    wrongCritical: slots.filter((s) => s.critical && s.status === "wrong").map((s) => s.key),
    missingCritical: slots.filter((s) => s.critical && s.status === "missing").map((s) => s.key),
  };
}

/**
 * Score several candidate readings of ONE transmission and return the best.
 *
 * Speech recognition on Indian-accented R/T frequently ranks the correct
 * reading second or third ("niner" heard as "minor", "hotel" as "hostel").
 * Judging only the top hypothesis fails students for the recognizer's mistake,
 * which is the single most demoralising thing this simulator can do.
 *
 * The chosen candidate is used WHOLE — its own forbidden-phrase list included.
 * Mixing the slot verdicts of one reading with the forbidden verdicts of
 * another would produce a judgement of something the student never said.
 *
 * Ordering: candidates are compared on points, then fewer missing criticals,
 * then fewer wrong criticals, then no forbidden phrase, then callsign. Ties
 * keep the EARLIER candidate, so callers that pass the recognizer's top guess
 * first (see candidateTranscripts) default to what it actually thought it heard.
 *
 * @param expect the step's expectation object, as for scoreTransmission
 * @param utterances candidate transcripts, best-guess first
 * @returns { ...scoreTransmission result, chosenText, candidatesTried }
 */
export function scoreBestOf(expect, utterances, weights = DEFAULT_WEIGHTS) {
  const texts = (utterances ?? []).filter((t) => typeof t === "string" && t.trim());
  if (!texts.length) {
    return { ...scoreTransmission(expect, "", weights), chosenText: "", candidatesTried: 0 };
  }

  // Higher is better on every component, so one comparable tuple works.
  const rank = (r) => [
    r.points,
    -r.missingCritical.length,
    -r.wrongCritical.length,
    r.forbidden.length === 0 ? 1 : 0,
    r.callsign === "ok-end" ? 2 : r.callsign === "ok" ? 1 : 0,
  ];
  const better = (a, b) => {
    const ra = rank(a), rb = rank(b);
    for (let i = 0; i < ra.length; i++) {
      if (ra[i] !== rb[i]) return ra[i] > rb[i];
    }
    return false;   // equal — keep the earlier candidate
  };

  let bestText = texts[0];
  let best = scoreTransmission(expect, bestText, weights);
  for (let i = 1; i < texts.length; i++) {
    const res = scoreTransmission(expect, texts[i], weights);
    if (better(res, best)) { best = res; bestText = texts[i]; }
  }
  return { ...best, chosenText: bestText, candidatesTried: texts.length };
}

// Scenario aggregate: percentage over every scored transmission.
export function scoreScenario(transmissionResults) {
  const points = transmissionResults.reduce((a, r) => a + r.points, 0);
  const maxPoints = transmissionResults.reduce((a, r) => a + r.maxPoints, 0);
  const percent = maxPoints === 0 ? 0 : Math.round((points / maxPoints) * 100);
  return { points, maxPoints, percent, pass: percent >= 50 };
}
