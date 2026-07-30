// Suggest chapter ↔ YouTube lecture pairings for lib/chapter-videos.ts.
//
// Run:  node tools/suggest-chapter-videos.mjs
//
// Reads the public RSS feed of the Captain's two channels (no API key, no
// scraping, no auth) and prints, for every recent upload:
//   • the chapter it most likely belongs to, scored by TITLE similarity, and
//   • a paste-ready line for lib/chapter-videos.ts.
//
// It NEVER writes to that file. Every pairing is confirmed by a human, because
// a mis-paired lecture teaches the wrong topic to a student who trusted the
// page — and lecture numbering does NOT track this site's chapter numbering
// (the Radio Nav series' "Ch.14" is MLS; this site's rnav-14 is SSR).
//
// Feeds return only the ~15 newest uploads per channel. For older videos, open
// the channel, copy the watch?v= id, and add the line by hand.

import { CPL_SUBJECTS, ATPL_SUBJECTS } from "../lib/subjects.ts";
import { CHAPTER_VIDEOS } from "../lib/chapter-videos.ts";

const CHANNELS = [
  { handle: "@PankajPahil",       id: "UCKTxHMHDfh2jBb7rrdTCMkg" },
  { handle: "@Capt.GhostAviator", id: "UCliKc6qVcGs5tnI03yNg6Lg" },
];

// Words that carry no topic signal — they appear in almost every title.
const STOP = new Set([
  "the", "a", "an", "and", "or", "of", "for", "to", "in", "on", "with", "by",
  "dgca", "cpl", "atpl", "free", "ch", "chapter", "part", "masterclass",
  "aviation", "lecture", "class", "exam", "principles", "systems", "system",
  "operation", "purpose", "components", "supplement", "equipment",
]);

const words = (s) =>
  new Set(
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)),
  );

/** Jaccard-style overlap, biased toward covering the chapter's own words. */
function similarity(videoTitle, chapterTitle) {
  const a = words(videoTitle), b = words(chapterTitle);
  if (b.size === 0) return 0;
  let hit = 0;
  for (const w of b) {
    if (a.has(w)) { hit++; continue; }
    // Allow a prefix match so "radar"~"radars", "navigation"~"nav" score.
    for (const x of a) {
      if (x.length >= 4 && (x.startsWith(w) || w.startsWith(x))) { hit++; break; }
    }
  }
  return hit / b.size;
}

const CHAPTERS = [...CPL_SUBJECTS, ...ATPL_SUBJECTS].flatMap(s =>
  s.chapters.map(c => ({
    key: `${s.id}/${c.id}`,
    subject: s.shortName,
    number: c.number,
    title: c.title,
  })),
);

// YouTube 404s the feed for a short/absent User-Agent — it needs a full
// browser UA string plus an XML Accept header. Verified: bare fetch and
// "Mozilla/5.0" both return 404; the pair below returns 200.
const FEED_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  Accept: "application/atom+xml,text/xml,*/*",
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function feed(channelId) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  // YouTube throttles repeated feed hits from one IP and answers 404 (not 429)
  // while throttled — a 404 here usually means "too many requests just now",
  // not "no such channel". Back off and retry before giving up.
  let last = 0;
  for (const wait of [0, 3000, 8000, 20000]) {
    if (wait) await sleep(wait);
    const res = await fetch(url, { headers: FEED_HEADERS });
    if (res.ok) return parseFeed(await res.text());
    last = res.status;
  }
  throw new Error(
    `feed HTTP ${last} for ${channelId} after 4 tries — YouTube is rate-limiting this IP. ` +
    `Wait a few minutes and run again, or add the video line by hand.`,
  );
}

function parseFeed(xml) {
  const out = [];
  const re = /<entry>[\s\S]*?<yt:videoId>(.*?)<\/yt:videoId>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<\/entry>/g;
  let m;
  while ((m = re.exec(xml))) {
    out.push({
      id: m[1],
      title: m[2].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim(),
    });
  }
  return out;
}

const mappedIds = new Set(
  Object.values(CHAPTER_VIDEOS).flat().map(v => v.id),
);

let newCount = 0;
for (const ch of CHANNELS) {
  console.log(`\n═══ ${ch.handle} ═══`);
  let videos;
  try {
    videos = await feed(ch.id);
  } catch (err) {
    console.log(`  ! could not read feed: ${err.message}`);
    continue;
  }
  for (const v of videos) {
    if (mappedIds.has(v.id)) continue;      // already wired
    newCount++;
    const ranked = CHAPTERS
      .map(c => ({ ...c, score: similarity(v.title, c.title) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter(c => c.score > 0);

    console.log(`\n  ${v.id}  ${v.title}`);
    if (!ranked.length) {
      console.log("     no chapter resembles this title — decide by hand");
      continue;
    }
    for (const c of ranked) {
      const pct = Math.round(c.score * 100);
      const already = CHAPTER_VIDEOS[c.key] ? "  (chapter already has a lecture)" : "";
      console.log(`     ${String(pct).padStart(3)}%  ${c.key}  — ${c.subject} Ch.${c.number} ${c.title}${already}`);
    }
    // A paste-ready line is only offered on a STRONG title match. Word overlap
    // is a hint, not understanding: it once scored "DGCA Computer Number" (the
    // eGCA registration number) against "Basic Computers" at 50%. Weak matches
    // print no shortcut, so nobody pastes a wrong pairing on autopilot.
    const top = ranked[0];
    if (top.score >= 0.6 && !CHAPTER_VIDEOS[top.key]) {
      console.log(`     paste:  "${top.key}": [{ id: "${v.id}" }],`);
    } else if (top.score >= 0.6) {
      console.log(`     that chapter already has a lecture — add as another part if this continues the series`);
    } else {
      console.log(`     no confident match — read the titles above and decide by hand`);
    }
  }
}

console.log(
  newCount === 0
    ? "\nEvery video in both feeds is already mapped.\n"
    : `\n${newCount} unmapped video(s) above. Check each % match against the chapter title, then add the confirmed lines to lib/chapter-videos.ts.\n`,
);
