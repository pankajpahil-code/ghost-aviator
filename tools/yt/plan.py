"""Build the proposed title/description/tags for every video — WRITES NOTHING.

Emits _plan.json (machine) and _plan-review.txt (human). Read the review file
before running apply.py. A title is a public claim about what a lecture teaches,
so the topic is never invented here: it is whatever survives after the known
boilerplate segments are stripped from the Captain's own title. If nothing
survives, or the video is not mapped to a chapter, the video is SKIPPED rather
than guessed at.
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))

SNAP = json.loads((HERE / "_snapshot.json").read_text(encoding="utf-8"))
CHAPTER_MAP = json.loads((ROOT / "tools" / "_video-chapter-map.json").read_text(encoding="utf-8"))

SITE = "https://www.ghostaviator.com"

# Playlist per site subject. Read from the live snapshot so a renamed or
# rebuilt playlist can never leave a stale id baked into this file.
PLAYLIST_BY_TITLE = {p["title"]: p["id"] for p in SNAP["playlists"]}
SUBJECT_PLAYLIST = {
    "air-regulations":  "ATPL & CPL Air Law & Regulations - Complete Free Ground School",
    "radio-navigation": "ATPL & CPL Radio Navigation - Complete Free Ground School",
    "instrumentation":  "ATPL & CPL Flight Instruments - Complete Free Ground School",
    "meteorology":      "ATPL & CPL Meteorology - Complete Free Ground School",
}

# Segments that carry no search value and are stripped from the topic. Matched
# case-insensitively against a whole pipe-separated segment, never a substring —
# stripping substrings would eat real topic words ("Free" is boilerplate as a
# segment; "Free Air Temperature" would not be).
BOILERPLATE = {
    "free", "free course", "free ground school", "atpl & cpl", "cpl & atpl",
    "atpl and cpl", "atpl", "cpl", "youtube", "atpl instruments",
    "air law & regs", "air law", "radio navigation", "meteorology",
    "atpl & cpl meteorology", "atpl & cpl radio navigation",
    "atpl & cpl air law & regulations", "air regulations", "instruments",
}

CH_RE = re.compile(r"^ch\.?\s*0*(\d+)\s*(?:part\s*(\d+))?$", re.I)

# Genuine typos in the Captain's titles. Applied to the extracted topic. These
# are corrections of fact, not restyling: as written, a student searching the
# right term does not find the lecture.
TYPO_FIX = [
    (re.compile(r"\bRising Laser Gyro\b", re.I), "Ring Laser Gyro"),
    (re.compile(r"\bPressure Altitudemeter\b", re.I), "Pressure Altimeter"),
    (re.compile(r"\bAir Reregulation\b", re.I), "Air Regulation"),
    (re.compile(r"\bStanders\b"), "Standards"),
    (re.compile(r"\bCo ordinator\b"), "Co-ordinator"),
    (re.compile(r"\bMarshaling\b"), "Marshalling"),
    (re.compile(r"\bGALLILEO\b", re.I), "Galileo"),
    (re.compile(r"\bAerodro\.\.\.$"), "Aerodrome Traffic"),
]

SUBJECT_LABEL = {
    "air-regulations": "Air Regulations",
    "meteorology": "Meteorology",
    "instrumentation": "Instruments",
    "radio-navigation": "Radio Navigation",
    "air-navigation": "General Navigation",
    "technical-general": "Technical General",
    "radio-telephony": "RTR(A)",
}

SUBJECT_HASHTAG = {
    "air-regulations": "#AirRegulations #AirLaw",
    "meteorology": "#Meteorology #AviationWeather",
    "instrumentation": "#FlightInstruments #Avionics",
    "radio-navigation": "#RadioNavigation #RadioAids",
    "air-navigation": "#GeneralNavigation",
    "technical-general": "#TechnicalGeneral",
    "radio-telephony": "#RTR #Radiotelephony",
}


def split_title(raw):
    """-> (topic, chapter_ref) or (None, None) if nothing survives stripping."""
    raw = raw.replace("|", "|")
    parts = [p.strip() for p in raw.split("|")]
    parts = [p for p in parts if p]

    chapter_ref, topic_parts = None, []
    for p in parts:
        m = CH_RE.match(p)
        if m:
            chapter_ref = f"Ch.{int(m.group(1))}"
            if m.group(2):
                chapter_ref += f" Part {int(m.group(2))}"
            continue
        if p.lower().strip(" .") in BOILERPLATE:
            continue
        topic_parts.append(p)

    if not topic_parts:
        return None, chapter_ref

    topic = " — ".join(topic_parts)
    topic = re.sub(r"\s{2,}", " ", topic).strip(" -—")
    for pat, rep in TYPO_FIX:
        topic = pat.sub(rep, topic)
    return (topic or None), chapter_ref


def build_title(topic, chapter_ref, subject_id):
    """Topic first — the words a student types go in the weighted opening."""
    label = SUBJECT_LABEL.get(subject_id, "Ground School")
    tail = f" | DGCA {label}"
    if chapter_ref:
        tail += f" {chapter_ref}"
    tail += " | CPL & ATPL"
    title = topic + tail
    if len(title) <= 100:
        return title
    title = topic + tail.replace(" | CPL & ATPL", "")
    if len(title) <= 100:
        return title
    # Last resort: trim the topic at a word boundary rather than ship >100 and
    # have YouTube truncate mid-word.
    room = 100 - len(tail)
    return topic[:room].rsplit(" ", 1)[0].rstrip(" -—") + tail


def build_description(topic, chapter_ref, place, subject_id):
    label = SUBJECT_LABEL.get(subject_id, "DGCA ground school")
    url = place["url"]
    ch = place
    pl_title = SUBJECT_PLAYLIST.get(subject_id)
    pl_id = PLAYLIST_BY_TITLE.get(pl_title) if pl_title else None
    pl_line = (f"\n📺 Full {label} playlist: https://www.youtube.com/playlist?list={pl_id}\n"
               if pl_id else "")

    also = ""
    if ch.get("_also"):
        also = "\n".join(f"   • {a['chapterTitle']} — {a['url']}" for a in ch["_also"])
        also = f"\nAlso covered in:\n{also}\n"

    tags = SUBJECT_HASHTAG.get(subject_id, "")
    return (
        f"{topic} — DGCA {ch['subjectName']}, Chapter {ch['chapterNumber']}: "
        f"{ch['chapterTitle']}\n"
        f"\n"
        f"Free {label} ground school for the DGCA CPL and ATPL papers, taught by "
        f"Capt. Pankaj Pahil. This lecture covers {topic}.\n"
        f"\n"
        f"📖 NOTES + PRACTICE QUESTIONS FOR THIS EXACT CHAPTER\n"
        f"   {url}\n"
        f"{also}"
        f"{pl_line}"
        f"\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"📌 ABOUT THIS SERIES\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"A complete {label} course built to the DGCA CPL/ATPL syllabus, and useful "
        f"for the EASA, FAA and ICAO papers too.\n"
        f"✅ Exam-focused explanations, not textbook recital\n"
        f"✅ Written notes and a question bank for every chapter\n"
        f"✅ Free for all student pilots — no sign-up, no paywall\n"
        f"\n"
        f"🎓 Ghost Aviator — free DGCA CPL/ATPL preparation: {SITE}\n"
        f"\n"
        f"⚠️ Educational content for aviation exam preparation only. Always fly and "
        f"study against current official documents.\n"
        f"\n"
        f"#DGCA #DGCAExam #CPL #ATPL {tags} #PilotTraining #GhostAviator "
        f"#StudentPilot #IndianPilot"
    )


def build_tags(topic, subject_id, existing):
    label = SUBJECT_LABEL.get(subject_id, "")
    base = [
        "DGCA", "DGCA exam", f"DGCA {label}", f"CPL {label}", f"ATPL {label}",
        "CPL ground school", "ATPL ground school", "DGCA CPL", "DGCA ATPL",
        "pilot training India", "student pilot India", "Ghost Aviator",
        "Capt Pankaj Pahil", topic[:60],
    ]
    seen, out = set(), []
    for t in base + list(existing):
        t = t.strip()
        k = t.lower()
        if t and k not in seen:
            seen.add(k)
            out.append(t)
    # YouTube caps the tags field at 500 characters total.
    total, kept = 0, []
    for t in out:
        if total + len(t) + 1 > 480:
            break
        kept.append(t)
        total += len(t) + 1
    return kept


def main():
    plan, skipped, truncated = [], [], []
    for v in SNAP["videos"]:
        vid = v["id"]
        entry = CHAPTER_MAP.get(vid)
        if not entry:
            skipped.append((vid, v["title"], "not mapped to a chapter"))
            continue

        topic, chapter_ref = split_title(v["title"])
        if not topic:
            skipped.append((vid, v["title"], "no topic survived boilerplate stripping"))
            continue

        # 21 titles were truncated to exactly 73 chars WITH a literal "..." by
        # whatever tool uploaded them, and the same truncated string was written
        # into the description, so the original wording is not recoverable from
        # anything on record. Completing them would mean inventing a public
        # claim about what a lecture teaches. Held out for the Captain's ruling
        # instead — a separate file, not a silent guess.
        if "..." in topic or "…" in topic:
            truncated.append({
                "id": vid, "views": v["views"],
                "old_title": v["title"],
                "fragment": topic,
                "chapter": f"{entry['primary']['track']}/{entry['primary']['subjectId']}"
                           f"/{entry['primary']['chapterId']}",
                "chapter_title": entry["primary"]["chapterTitle"],
                "chapter_ref": chapter_ref,
            })
            continue

        place = dict(entry["primary"])
        place["_also"] = entry["also"]
        sid = place["subjectId"]

        new_title = build_title(topic, chapter_ref, sid)
        new_desc = build_description(topic, chapter_ref, place, sid)
        new_tags = build_tags(topic, sid, v["tags"])

        changed = (new_title != v["title"] or new_desc != v["description"]
                   or new_tags != v["tags"])
        if not changed:
            continue

        plan.append({
            "id": vid,
            "views": v["views"],
            "categoryId": v.get("categoryId") or "27",
            "old_title": v["title"], "new_title": new_title,
            "old_desc": v["description"], "new_desc": new_desc,
            "old_tags": v["tags"], "new_tags": new_tags,
            "chapter": f"{place['track']}/{sid}/{place['chapterId']}",
            "url": place["url"],
            "had_placeholder": "[PLAYLIST LINK]" in v["description"],
        })

    (HERE / "_plan.json").write_text(json.dumps(plan, indent=2, ensure_ascii=False),
                                     encoding="utf-8")
    (HERE / "_plan-truncated.json").write_text(
        json.dumps(truncated, indent=2, ensure_ascii=False), encoding="utf-8")

    if truncated:
        tl = [
            "TRUNCATED TITLES — NEEDS THE CAPTAIN'S RULING, NOTHING APPLIED",
            "",
            "These titles were cut to exactly 73 characters with a literal '...' by the",
            "tool that uploaded them, and the same cut string was copied into the",
            "description. The original wording survives nowhere on record, so completing",
            "them would mean inventing a public claim about what the lecture teaches.",
            "",
            "Give me the ending for each and I will apply them in the next pass.",
            "=" * 96, "",
        ]
        for t in truncated:
            tl += [
                f"[{t['id']}]  {t['chapter_ref'] or ''}  ->  {t['chapter']}",
                f"  LIVE NOW   {t['old_title']}",
                f"  FRAGMENT   {t['fragment']}",
                f"  CHAPTER    {t['chapter_title']}",
                f"  ENDING?    ______________________________________________",
                "",
            ]
        (HERE / "_truncated-review.txt").write_text("\n".join(tl), encoding="utf-8")

    lines = [
        f"PROPOSED CHANGES — {len(plan)} videos, {len(skipped)} skipped, "
        f"{len(truncated)} held back as truncated",
        f"quota cost: {len(plan)} x 50 units = {len(plan) * 50} "
        f"(daily cap 10,000 -> {-(-len(plan) * 50 // 10000)} day(s))",
        "=" * 100, "",
    ]
    for p in plan:
        lines += [
            f"[{p['id']}]  {p['views']} views  ->  {p['chapter']}"
            + ("   *had [PLAYLIST LINK]*" if p["had_placeholder"] else ""),
            f"  OLD TITLE  {p['old_title']}",
            f"  NEW TITLE  {p['new_title']}   ({len(p['new_title'])} chars)",
            f"  LINK       {p['url']}",
            "",
        ]
    if skipped:
        lines += ["", "SKIPPED (left completely untouched)", "-" * 100]
        lines += [f"  [{i}] {t}   — {why}" for i, t, why in skipped]
    lines += ["", "=" * 100, "SAMPLE FULL DESCRIPTION (first planned video)", "=" * 100]
    if plan:
        lines += [plan[0]["new_desc"], "", "-" * 100, "TAGS: " + ", ".join(plan[0]["new_tags"])]

    (HERE / "_plan-review.txt").write_text("\n".join(lines), encoding="utf-8")
    print(f"planned {len(plan)} updates, skipped {len(skipped)}")
    print(f"quota needed: {len(plan) * 50} units (daily cap 10,000)")
    print(f"review: tools/yt/_plan-review.txt")


if __name__ == "__main__":
    main()
