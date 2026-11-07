"""Check tools/syllabus/chapter-map.json against the chapters' own text.

For every syllabus topic, take the distinctive words of its CAR heading and items,
and measure how many appear in each mapped chapter's notes (the plain text that
cf:build writes to out/_gini/notes/<subject>/<chapter>.txt). A mapped chapter
that mentions few of them is printed as WEAK and must be read before it stays.
For topics with no mapping, the best-scoring chapters are printed as suggestions.

Usage (after a cf:build): python tools/syllabus/check-map.py
Exit 1 if a mapped chapter has no notes text at all, or scores under the floor.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
car = json.loads((ROOT / "tools/syllabus/car-7b4.json").read_text(encoding="utf-8"))
cmap = {k: v for k, v in json.loads((ROOT / "tools/syllabus/chapter-map.json").read_text(encoding="utf-8")).items() if not k.startswith("_")}
NOTES = ROOT / "out/_gini/notes"
CPL = {"air-navigation", "meteorology", "air-regulations", "technical-general", "radio-telephony",
       "instrumentation", "radio-navigation", "human-performance", "flight-planning"}

STOP = set("""about above after again against among and any are aircraft aeroplane aeroplanes between both
cause causes concept concepts conditions definition definitions effect effects factors general
including influence their there these this those through types under using which while with within
without basic basics principle principles procedures relation relevant application operation operating
system systems""".split())

def words(s: str) -> set[str]:
    return {w for w in re.findall(r"[a-z][a-z\-]{4,}", s.lower()) if w not in STOP}

texts = {}
for sub in NOTES.iterdir():
    if sub.name in CPL:
        for f in sub.glob("*.txt"):
            texts[f"{sub.name}/{f.stem}"] = f.read_text(encoding="utf-8", errors="ignore").lower()

topics = {}
for app, a in car.items():
    for s in a["sections"]:
        def flat(items):
            out = []
            for i in items:
                out.append(i["text"]); out.extend(i["children"])
            return " ".join(out)
        if s["subs"]:
            for b in s["subs"]:
                topics[f'{app}:{s["key"]}.{b["letter"]}'] = (b["title"], b["title"] + " " + flat(b["items"]))
        elif s["items"]:
            topics[f'{app}:{s["key"]}'] = (s["title"], s["title"] + " " + flat(s["items"]))
        elif re.fullmatch(r"\d+\.\d+(\.\d+)?", s["num"]) and not any(
                o["num"].startswith(s["num"] + ".") for o in a["sections"]):
            # A heading-only section is a topic, unless it only groups numbered
            # children (e.g. "3.2 Communications" over "3.2.1 VFR Communications").
            topics[f'{app}:{s["key"]}'] = (s["title"], s["title"])

def score(kw: set[str], chap: str) -> float:
    t = texts.get(chap)
    if not t or not kw:
        return 0.0
    return sum(1 for w in kw if w in t) / len(kw)

FLOOR = 0.25        # a topic taught by one or two chapters
SPLIT_FLOOR = 0.10  # a topic spread over 3+ chapters: each covers only its share

# Read by hand and kept, with the reason. Anything not listed here must pass the
# score. Add to this only after opening the chapter.
REVIEWED = {
    ("A:1.c", "air-navigation/nav-22"): "Scale: 31 mentions of scale; the CAR's chart items are mostly projections",
    ("A:4.a", "air-navigation/nav-cp-pnr"): "CP/PNR is the fuel-plan arithmetic of a cross-country plan",
    ("C:1.6.b", "air-regulations/ar-12"): "topic heading has no content words (definitions and abbreviations)",
    ("C:1.14", "air-regulations/ar-14"): "Personnel Licensing is CAR Section 7; heading has no content words",
    ("D:2.3.b", "technical-general/tg-9"): "tg-9 covers the tailplane's contribution to balance (5 mentions); no trim/ballast",
    ("D:2.1.j", "technical-general/tg-10"): "tg-10 covers spoilers (4) and speedbrakes (1)",
    ("D:1.1", "technical-general/tg-31"): "the CAR's Airframe list ends with 'Fuel system' and 'Fuel system monitoring'",
    ("D:2.4.a", "technical-general/tg-10"): "tg-10 opens with the three axes and the primary controls",
}
# Chapters whose notes are a React component, not a notes.html, so cf:build writes
# no text for them. Checked by reading the live page.
NO_TEXT_OK = {"air-regulations/ar-1"}
bad = 0
unknown = [k for k in cmap if k not in topics]
if unknown:
    print("MAP KEYS WITH NO SUCH TOPIC:", unknown); bad += 1
for key, (title, body) in topics.items():
    kw = words(body)
    if key in cmap:
        floor = SPLIT_FLOOR if len(cmap[key]) >= 3 else FLOOR
        for chap in cmap[key]:
            if chap not in texts:
                if chap in NO_TEXT_OK:
                    continue
                # The page skips a chapter with no notes, so this is not an error,
                # but it is worth seeing: the topic has no readable chapter yet.
                print(f"NO NOTES  {key:12} {chap:40} ({title[:50]}) - not linked")
                continue
            sc = score(kw, chap)
            if sc < floor and (key, chap) not in REVIEWED:
                print(f"WEAK {sc:.2f} {key:12} {chap:40} ({title[:50]})"); bad += 1
    else:
        best = sorted(((score(kw, c), c) for c in texts), reverse=True)[:3]
        print(f"UNMAPPED  {key:12} {title[:45]:45} suggest: " + ", ".join(f"{c} {s:.2f}" for s, c in best))

print(f"\n{len(topics)} topics, {len(cmap)} mapped, problems: {bad}")
sys.exit(1 if bad else 0)
