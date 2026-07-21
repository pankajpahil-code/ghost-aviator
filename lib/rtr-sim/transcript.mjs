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
