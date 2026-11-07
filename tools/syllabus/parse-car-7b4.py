"""Parse DGCA CAR Section 7 Series B Part IV (CPL/IR syllabus) into structured JSON.

Input : the CAR PDF as downloaded from dgca.gov.in (Issue III, 16 June 2011).
Output: tools/syllabus/car-7b4.json  -> read by tools/syllabus/build-syllabus.mts

The syllabus text is reproduced as published by DGCA. Nothing is paraphrased here:
headings and items are the CAR's own words, with only line-wrap joins and the
page furniture (running header, page numbers) removed.

Usage: python tools/syllabus/parse-car-7b4.py <CAR pdf> [out.json]
"""
import json
import re
import subprocess
import sys
from pathlib import Path

pdf = sys.argv[1]
out = Path(sys.argv[2] if len(sys.argv) > 2 else Path(__file__).with_name("car-7b4.json"))
text = subprocess.run(["pdftotext", "-enc", "UTF-8", "-layout", pdf, "-"], capture_output=True).stdout.decode("utf-8", "replace")

# Typographic clean-up that the PDF's Word export introduced.
text = text.replace("`", "'").replace("’", "'").replace("‘", "'").replace("", "-")

FURNITURE = re.compile(
    r"^\s*(CIVIL AVIATION REQUIREMENT\b.*|SERIES 'B', PART IV\b.*|\d{1,3}|THE SYLLABUS OF .* IS AS FOLLOWS\s*:?)\s*$",
    re.I,
)
APPENDIX = re.compile(r"^\s*APPENDIX\s+'([A-D])'\s*$")
SECTION = re.compile(r"^\s*(\d{1,2}(?:\.\d{1,2}){0,2})\.?\s+([A-Z(].*)$")
SUB = re.compile(r"^\s*([a-z])\)\s*(.*)$")
ITEM = re.compile(r"^\s*[-–•]\s*(.*)$")

appendices: dict[str, dict] = {}
cur_app = None
sec = sub = item = None
last = None  # the element a continuation line belongs to
pending_title = False

def clean(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()

for raw in text.splitlines():
    line = raw.rstrip()
    if not line.strip() or FURNITURE.match(line):
        continue
    m = APPENDIX.match(line)
    if m:
        cur_app = {"appendix": m.group(1), "title": None, "sections": []}
        appendices[m.group(1)] = cur_app
        sec = sub = item = last = None
        pending_title = True
        continue
    if cur_app is None:
        continue
    if pending_title:
        cur_app["title"] = clean(line)
        pending_title = False
        continue
    m = SECTION.match(line)
    if m and len(m.group(2)) < 120:
        sec = {"num": m.group(1), "title": clean(m.group(2)), "subs": [], "items": []}
        cur_app["sections"].append(sec)
        sub = item = None
        last = sec
        continue
    m = SUB.match(line)
    if m and sec is not None:
        sub = {"letter": m.group(1), "title": clean(m.group(2)), "items": []}
        sec["subs"].append(sub)
        last = sub
        continue
    m = ITEM.match(line)
    if m and sec is not None:
        target = sub if sub is not None else sec
        # The CAR marks a child item only by indentation: the column where its
        # text starts. Keep that column; nesting is decided per list below.
        col = len(line) - len(line.lstrip(" -–•"))
        target["items"].append([col, clean(m.group(1))])
        last = ("item", target)
        continue
    # Continuation of a wrapped line.
    if last is None:
        continue
    if isinstance(last, tuple):
        tgt = last[1]["items"]
        if tgt:
            tgt[-1][1] = clean(tgt[-1][1] + " " + line)
    else:
        last["title"] = clean(last["title"] + " " + line)


def nest(raw_items):
    """[[col, text], ...] -> [{"text", "children"}]. The leftmost text column in a
    list is the top level; anything starting 2+ columns further right is a child."""
    raw_items = [r for r in raw_items if r[1]]  # a trailing "-" with nothing after it
    if not raw_items:
        return []
    base = min(c for c, _ in raw_items)
    out_items = []
    for col, txt in raw_items:
        if col >= base + 2 and out_items:
            out_items[-1]["children"].append(txt)
        else:
            out_items.append({"text": txt, "children": []})
    return out_items


for app in appendices.values():
    seen: dict[str, int] = {}
    for s in app["sections"]:
        # The CAR itself numbers two Technical General sections "2.4" (Control,
        # then Limitations). Keep the printed number; give each a unique key.
        seen[s["num"]] = seen.get(s["num"], 0) + 1
        s["key"] = s["num"] if seen[s["num"]] == 1 else f'{s["num"]}#{seen[s["num"]]}'
        s["items"] = nest(s["items"])
        for b in s["subs"]:
            b["items"] = nest(b["items"])

out.write_text(json.dumps(appendices, ensure_ascii=False, indent=1), encoding="utf-8")


def count(items):
    return sum(1 + len(i["children"]) for i in items)


for k, a in appendices.items():
    n_items = sum(count(s["items"]) + sum(count(b["items"]) for b in s["subs"]) for s in a["sections"])
    print(k, a["title"], "sections", len(a["sections"]), "items", n_items)
