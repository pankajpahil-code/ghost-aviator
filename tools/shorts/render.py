"""Render tools/shorts/_spec.json into a 1080x1920 YouTube Short.

    npx tsx tools/shorts/pick.mts     # choose a verified question
    python tools/shorts/render.py     # -> tools/shorts/out/<chapter>-<slug>.mp4

Needs ffmpeg and Pillow, both already on this machine.

WHY A SHORT AND NOT A LECTURE. Measured 2026-09-06: @PankajPahil has 273 videos,
exactly ONE of them a Short, median length 8m58s, on a channel with 53
subscribers and a median of 1 view per video. YouTube does not push a nine-minute
lecture from an unknown channel to strangers. Shorts are the one surface it
shows to people who have never heard of him - free, needing nobody's permission,
and impossible for a Telegram admin to block.

NOTHING ON THE CARD IS COMPOSED. Every line is lifted verbatim from a question
already published on the site. This file draws text; it never writes any.

THE SAFE AREA IS NOT DECORATION. The Shorts player puts the title, channel name
and description over the bottom of the frame, and the like/comment/share rail
down the right. Anything drawn there is covered on a real phone even though it
looks perfect in the PNG. First render put the site name at y=1790, i.e. behind
the channel bar, and left 60% of the frame empty above it. Content is now
centred inside SAFE_TOP..SAFE_BOT and kept clear of the right rail.
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
SPEC = HERE / "_spec.json"
WORK = HERE / "_frames"
OUT = HERE / "out"

NL = chr(10)   # never a typed escape: the authoring heredoc eats backslashes
W, H = 1080, 1920
SAFE_TOP, SAFE_BOT = 250, 1450     # below the badge, above the Shorts chrome
MARGIN_X = 80
CONTENT_W = 860                    # clear of the right-hand action rail

BG = (11, 18, 32)
PANEL = (19, 29, 47)
EDGE = (38, 52, 74)
WHITE = (245, 248, 252)
MUTED = (148, 163, 184)
AMBER = (240, 180, 41)
GREEN = (52, 199, 123)

FONTS = Path("C:/Windows/Fonts")
_cache: dict = {}


def font(name, size):
    key = (name, size)
    if key not in _cache:
        p = FONTS / name
        if not p.exists():
            raise SystemExit(f"font not found: {p}")
        _cache[key] = ImageFont.truetype(str(p), size)
    return _cache[key]


def bold(s): return font("arialbd.ttf", s)
def reg(s): return font("arial.ttf", s)


_measure = ImageDraw.Draw(Image.new("RGB", (10, 10)))


def wrap(text, fnt, max_w):
    """Greedy wrap on measured width - PIL will not wrap for you."""
    lines, cur = [], ""
    for w in text.split():
        trial = f"{cur} {w}".strip()
        if _measure.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


# ---- a tiny layout engine, so every card can be vertically centred ----------
#
# Each row measures itself, the card sums them, and the whole block is placed at
# the middle of the safe area. That is the fix for the 60% of dead frame the
# first render left under every card.

def row_text(text, fnt, fill, gap=0, centre=False, leading=1.30):
    lines = wrap(text, fnt, CONTENT_W)
    return {"kind": "text", "lines": lines, "font": fnt, "fill": fill,
            "gap": gap, "centre": centre,
            "h": len(lines) * int(fnt.size * leading), "leading": leading}


def row_rule(gap=0):
    return {"kind": "rule", "gap": gap, "h": 4}


def row_options(opts, ans, reveal, gap=0):
    fnt = reg(46)
    boxes = []
    total = 0
    for i, o in enumerate(opts):
        lines = wrap(o, fnt, CONTENT_W - 120)
        h = 40 + len(lines) * int(fnt.size * 1.30)
        boxes.append({"i": i, "lines": lines, "h": h})
        total += h + 26
    return {"kind": "options", "boxes": boxes, "font": fnt, "ans": ans,
            "reveal": reveal, "gap": gap, "h": total - 26}


def draw_card(spec, rows, footer=True):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 8], fill=AMBER)
    d.text((MARGIN_X, 66), f"DGCA {spec['subjectShort'].upper()}", font=bold(34), fill=AMBER)

    total = sum(r["h"] + r["gap"] for r in rows)
    y = SAFE_TOP + max(0, (SAFE_BOT - SAFE_TOP - total) // 2)

    for r in rows:
        y += r["gap"]
        if r["kind"] == "text":
            lh = int(r["font"].size * r["leading"])
            for line in r["lines"]:
                x = MARGIN_X
                if r["centre"]:
                    x += (CONTENT_W - _measure.textlength(line, font=r["font"])) / 2
                d.text((x, y), line, font=r["font"], fill=r["fill"])
                y += lh
        elif r["kind"] == "rule":
            d.rectangle([MARGIN_X, y, MARGIN_X + CONTENT_W, y + 4], fill=EDGE)
            y += 4
        elif r["kind"] == "options":
            fnt = r["font"]
            for b in r["boxes"]:
                ok = r["reveal"] and b["i"] == r["ans"]
                d.rounded_rectangle(
                    [MARGIN_X, y, MARGIN_X + CONTENT_W, y + b["h"]], radius=22,
                    fill=(24, 48, 38) if ok else PANEL,
                    outline=GREEN if ok else EDGE, width=4 if ok else 2)
                d.text((MARGIN_X + 34, y + 20), f"{'ABCDEFGH'[b['i']]}.",
                       font=bold(46), fill=GREEN if ok else AMBER)
                ty = y + 20
                for line in b["lines"]:
                    d.text((MARGIN_X + 110, ty), line, font=fnt,
                           fill=WHITE if ok else MUTED)
                    ty += int(fnt.size * 1.30)
                y += b["h"] + 26

    if footer:
        t = "ghostaviator.com"
        d.text(((W - _measure.textlength(t, font=bold(36))) / 2, SAFE_BOT + 40),
               t, font=bold(36), fill=MUTED)
    return img


def card_hook(spec):
    return draw_card(spec, [
        row_text("Most student pilots", bold(94), WHITE, centre=True),
        row_text("get this wrong.", bold(94), AMBER, gap=10, centre=True),
        row_text(f"Chapter {spec['chapterNumber']} - {spec['chapterTitle']}",
                 reg(40), MUTED, gap=80, centre=True),
    ], footer=False)


def card_question(spec, reveal=False):
    return draw_card(spec, [
        row_text(spec["q"], bold(62), WHITE),
        row_options(spec["opts"], spec["ans"], reveal, gap=60),
    ])


def card_count(spec, n):
    return draw_card(spec, [row_text(str(n), bold(340), AMBER, centre=True)], footer=False)


def card_why(spec):
    return draw_card(spec, [
        row_text(f"{spec['answerLetter']}. {spec['answerText']}", bold(64), GREEN),
        row_rule(gap=50),
        row_text("WHY", bold(38), AMBER, gap=50),
        row_text(spec["exp"], reg(46), WHITE, gap=18),
    ])


def card_cta(spec):
    return draw_card(spec, [
        row_text("Free DGCA notes and", bold(74), WHITE, centre=True),
        row_text("4,414 practice questions", bold(74), AMBER, gap=6, centre=True),
        row_text("No sign-up. No paywall. No ads.", reg(44), MUTED, gap=54, centre=True),
        row_text("ghostaviator.com", bold(84), WHITE, gap=76, centre=True),
        row_text("Capt. Pankaj Pahil - DGCA approved instructor",
                 reg(36), MUTED, gap=64, centre=True),
    ], footer=False)


def encode(seq, out):
    """PNG frames + durations -> an H.264 Short. Shared with correction.py, so
    there is ONE encode path and one place the concat quirk is handled."""
    if not shutil.which("ffmpeg"):
        raise SystemExit("ffmpeg not on PATH")
    # A fresh work dir every run. Leaving old frames behind is how a shorter run
    # silently mixes two videos together - that exact bug is on record in
    # CLAUDE.md from the Gini sprite pipeline.
    if WORK.exists():
        shutil.rmtree(WORK)
    WORK.mkdir(parents=True)
    OUT.mkdir(parents=True, exist_ok=True)

    lines = []
    for i, (img, dur) in enumerate(seq):
        img.save(WORK / f"f{i:02d}.png")
        lines.append(f"file 'f{i:02d}.png'")
        lines.append(f"duration {dur}")
    lines.append(f"file 'f{len(seq) - 1:02d}.png'")   # concat needs the last repeated
    (WORK / "list.txt").write_text(NL.join(lines) + NL, encoding="utf-8")

    r = subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(WORK / "list.txt"),
        "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "medium",
        "-crf", "20", "-movflags", "+faststart", str(out),
    ], capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-2500:])
        raise SystemExit("ffmpeg failed")
    return out


def slug(s, n=44):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:n]


def main():
    if not SPEC.exists():
        raise SystemExit("No spec. Run: npx tsx tools/shorts/pick.mts")
    spec = json.loads(SPEC.read_text(encoding="utf-8"))

    seq = [
        (card_hook(spec), 2.4),
        (card_question(spec), 7.5),
        (card_count(spec, 3), 0.8),
        (card_count(spec, 2), 0.8),
        (card_count(spec, 1), 0.8),
        (card_question(spec, reveal=True), 4.0),
        (card_why(spec), 9.0),
        (card_cta(spec), 3.5),
    ]

    name = f"{spec['chapterId']}-{slug(spec['q'])}.mp4"
    out = OUT / name
    encode(seq, out)

    caption = (
        f"{spec['q']}\n\n"
        f"Answer: {spec['answerLetter']}. {spec['answerText']}\n\n"
        f"{spec['exp']}\n\n"
        f"Full chapter, free: {spec['url']}\n"
        f"234 chapters and 4,414 practice questions, no sign-up: ghostaviator.com\n\n"
        f"#DGCA #DGCAExam #CPL #ATPL #PilotTraining #StudentPilot #IndianPilot #Shorts"
    )
    out.with_suffix(".txt").write_text(caption, encoding="utf-8")

    # Burn the question ONLY after a successful encode. Marking it used in
    # pick.mts would lose a question every time ffmpeg failed, and there is no
    # way to tell afterwards which ones were spent on nothing.
    ledger = HERE / "_used.json"
    used = json.loads(ledger.read_text(encoding="utf-8")) if ledger.exists() else []
    if spec["key"] not in used:
        used.append(spec["key"])
        ledger.write_text(json.dumps(used, indent=2, ensure_ascii=False), encoding="utf-8")

    total = sum(d for _, d in seq)
    print(f"used     : {len(used)} questions burned so far")
    print(f"frames   : {len(seq)}")
    print(f"duration : {total:.1f}s  (Shorts must be 60s or under)")
    print(f"video    : {out}   {out.stat().st_size / 1024:.0f} KB")
    print(f"caption  : {out.with_suffix('.txt')}")
    if total > 60:
        print("WARNING: over 60s, YouTube will not treat this as a Short")


if __name__ == "__main__":
    sys.exit(main())
