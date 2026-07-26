// Ghost Tower — speech-transcript accumulation.
// Extracted from the simulator so the rule that broke a live transmission can
// never silently break again.
//
// A SpeechRecognition result event carries the CUMULATIVE list of results and
// an index marking where the new ones begin. Re-reading the list from 0 on
// every event re-appends everything already said, which turned a single radio
// call into a repeating paragraph on screen.

/**
 * Pull only the newly-finalised segments out of a recognition event.
 * @param results cumulative SpeechRecognitionResultList (array-like)
 * @param resultIndex index of the first NEW result in that list
 */
export function newFinalSegments(results, resultIndex) {
  const from = typeof resultIndex === "number" && resultIndex >= 0 ? resultIndex : 0;
  const out = [];
  const len = results?.length ?? 0;
  for (let i = from; i < len; i++) {
    const r = results[i];
    if (!r) continue;
    if (r.isFinal === false) continue;          // interim hypothesis — ignore
    const txt = String(r[0]?.transcript ?? "").trim();
    // Deliberately NO de-duplication: "MAYDAY MAYDAY MAYDAY" and "PAN-PAN
    // PAN-PAN PAN-PAN" are required phraseology and must survive verbatim.
    if (txt) out.push(txt);
  }
  return out;
}

/** Join accumulated segments into the transmission text the scorer receives. */
export function joinTranscript(segments) {
  return segments.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Pull the newly-finalised segments WITH all of the recognizer's alternative
 * readings, not just its top guess.
 *
 * Why this exists: with maxAlternatives = 1 the simulator saw only the
 * recognizer's first choice. For Indian-accented R/T the correct reading is
 * very often ranked second or third — "niner" comes back as "minor", "hotel"
 * as "hostel", "tango" as "tengo" — and a student who transmitted a perfect
 * call was told they had missed a slot. Keeping the alternatives lets the
 * scorer find the reading that actually satisfies the expected phraseology.
 *
 * @param results cumulative SpeechRecognitionResultList (array-like)
 * @param resultIndex index of the first NEW result in that list
 * @returns one array of alternative strings per new segment, best-first
 */
export function newFinalAlternatives(results, resultIndex) {
  const from = typeof resultIndex === "number" && resultIndex >= 0 ? resultIndex : 0;
  const out = [];
  const len = results?.length ?? 0;
  for (let i = from; i < len; i++) {
    const r = results[i];
    if (!r) continue;
    if (r.isFinal === false) continue;
    const alts = [];
    const n = r.length ?? 1;
    for (let a = 0; a < n; a++) {
      const txt = String(r[a]?.transcript ?? "").trim();
      if (txt && !alts.includes(txt)) alts.push(txt);
    }
    if (alts.length) out.push(alts);
  }
  return out;
}

/**
 * Build the transmission strings worth scoring from per-segment alternatives.
 *
 * A full cartesian product explodes (5 alternatives over 6 segments = 15,625
 * candidates) for no real benefit: the recognizer rarely mishears more than one
 * stretch of a single radio call. So this produces a LINEAR set — the all-best
 * reading, plus one variant per alternative with every other segment left at
 * its top guess. 6 segments x 5 alternatives yields 25 candidates, not 15,625.
 *
 * The all-best reading is always first, so a caller that breaks ties by order
 * prefers what the recognizer actually thought it heard.
 *
 * @param altsPerSegment output of newFinalAlternatives
 * @param cap hard ceiling on candidates returned (defence against a recognizer
 *            that returns an unexpected number of alternatives)
 */
export function candidateTranscripts(altsPerSegment, cap = 32) {
  const segs = (altsPerSegment ?? []).filter(a => Array.isArray(a) && a.length);
  if (!segs.length) return [];

  const top = segs.map(a => a[0]);
  const seen = new Set();
  const out = [];
  const push = (parts) => {
    const text = joinTranscript(parts);
    if (text && !seen.has(text)) { seen.add(text); out.push(text); }
  };

  push(top);
  for (let i = 0; i < segs.length && out.length < cap; i++) {
    for (let a = 1; a < segs[i].length && out.length < cap; a++) {
      const parts = top.slice();
      parts[i] = segs[i][a];
      push(parts);
    }
  }
  return out;
}
