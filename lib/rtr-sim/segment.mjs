// Ghost Tower VoiceBank — shared segmenter.
// Splits an ATC transmission into an ordered list of speakable fragments:
//   - "atom"   : a spelled phonetic letter or a spoken digit/multiplier
//   - "phrase" : a maximal run of fixed phraseology words
// The SAME function runs offline (to enumerate + render the sprite) and in the
// browser (to stitch playback), so what we render is exactly what we play.
// Pure, dependency-free — importable by Node and by Next client code.

// Words rendered individually: phonetic alphabet + numbers. These are the
// "spelled/counted" content that recombines infinitely; everything else is
// finite fixed phraseology and renders as a natural phrase.
const ATOMS = new Set([
  "alfa", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel",
  "india", "juliett", "kilo", "lima", "mike", "november", "oscar", "papa",
  "quebec", "romeo", "sierra", "tango", "uniform", "victor", "whiskey",
  "xray", "yankee", "zulu",
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "decimal", "hundred", "thousand",
]);

// Classification key for a word: lowercase, drop everything but a-z.
// "X-ray" and "x-ray," both → "xray".
function bare(word) {
  return word.toLowerCase().replace(/[^a-z]/g, "");
}

// Canonical fragment id — used as both the manifest key and the sprite slot.
export function fragmentId(seg) {
  const norm = seg.key.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return (seg.type === "atom" ? "a_" : "p_") + norm;
}

export function segmentLine(text) {
  const words = String(text ?? "").trim().split(/\s+/).filter(Boolean);
  const segs = [];
  let buf = [];
  const flush = () => {
    if (!buf.length) return;
    // Phrase key/text: strip outer punctuation, keep internal commas for prosody.
    const raw = buf.join(" ");
    const clean = raw.replace(/^[^A-Za-z0-9]+/, "").replace(/[^A-Za-z0-9%]+$/, "");
    if (clean) segs.push({ type: "phrase", key: clean, text: clean });
    buf = [];
  };
  for (const w of words) {
    const b = bare(w);
    if (ATOMS.has(b)) {
      flush();
      segs.push({ type: "atom", key: b, text: b });
    } else {
      buf.push(w);
    }
  }
  flush();
  return segs;
}

// Collect the distinct fragments a set of ATC lines needs. Returns a Map of
// fragmentId -> { id, type, text } for rendering, deterministic in insertion.
export function collectFragments(lines) {
  const out = new Map();
  for (const line of lines) {
    for (const seg of segmentLine(line)) {
      const id = fragmentId(seg);
      if (!out.has(id)) out.set(id, { id, type: seg.type, text: seg.text });
    }
  }
  return out;
}
