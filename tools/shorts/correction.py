"""Render a CORRECTION from corrections.json into a 1080x1920 Short.

    python tools/shorts/correction.py                 # list the available ids
    python tools/shorts/correction.py licence-validity

A different card from render.py on purpose. That one asks a question. This one
says: what you were taught is out of date, here is the rule, here is its number.

WHY IT EXISTS. The Captain, 2026-09-06: "posting right path and helping others is
not spam, shouting tiger to save life is not spam or wrong". He is right, and
this is the shape of it. A correction with a statute number beside it is not
promotion - it is the one thing a student forwards to their own batch unprompted,
which is how it reaches rooms nobody can be invited into.

NOTHING HERE IS COMPOSED. Every field comes from corrections.json, and every
entry there is a correction already recorded as verified in CLAUDE.md or in
verify-repair.mjs INTENTIONAL, with its citation. The renderer refuses any entry
that has no `cite`.
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))

import render as R  # noqa: E402  - reuse the layout engine, fonts and safe area

DATA = HERE / "corrections.json"


def cards(c):
    """The five frames of a correction Short."""
    spec = {"subjectShort": c["subject"]}
    return [
        (R.draw_card(spec, [
            R.row_text("Your notes are", R.bold(92), R.WHITE, centre=True),
            R.row_text("out of date.", R.bold(92), R.AMBER, gap=8, centre=True),
            R.row_text(c["subject"], R.reg(40), R.MUTED, gap=80, centre=True),
        ], footer=False), 2.4),

        (R.draw_card(spec, [
            R.row_text("WHAT YOU WERE TAUGHT", R.bold(38), R.MUTED),
            R.row_text(c["common"], R.bold(58), (239, 110, 110), gap=26),
        ]), 6.5),

        (R.draw_card(spec, [
            R.row_text("WHAT THE RULE ACTUALLY SAYS", R.bold(38), R.AMBER),
            R.row_text(c["correct"], R.bold(58), R.GREEN, gap=26),
        ]), 9.0),

        (R.draw_card(spec, [
            R.row_text("THE SOURCE", R.bold(38), R.AMBER),
            R.row_text(c["cite"], R.reg(42), R.WHITE, gap=26),
        ] + ([R.row_text(c["note"], R.reg(36), R.MUTED, gap=40)] if c.get("note") else [])), 8.5),

        (R.draw_card(spec, [
            R.row_text("Check it yourself.", R.bold(72), R.WHITE, centre=True),
            R.row_text("234 chapters, 4,414 questions,", R.reg(44), R.MUTED, gap=54, centre=True),
            R.row_text("every answer sourced. Free.", R.reg(44), R.MUTED, gap=8, centre=True),
            R.row_text("ghostaviator.com", R.bold(80), R.AMBER, gap=70, centre=True),
            R.row_text("Capt. Pankaj Pahil - DGCA approved instructor",
                       R.reg(36), R.MUTED, gap=60, centre=True),
        ], footer=False), 4.0),
    ]


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))["corrections"]
    ids = [c["id"] for c in data]

    if len(sys.argv) < 2:
        print("usage: python tools/shorts/correction.py <id>\n")
        for c in data:
            print(f"  {c['id']:<28} [{c['strength'].split(' ')[0]:<7}] {c['common'][:58]}")
        return 0

    want = sys.argv[1]
    c = next((x for x in data if x["id"] == want), None)
    if not c:
        raise SystemExit(f"no such correction: {want}\navailable: {', '.join(ids)}")
    if not c.get("cite"):
        raise SystemExit(f"REFUSING: '{want}' has no citation. A correction without a "
                         "source is exactly the thing being corrected.")

    seq = cards(c)
    out = R.OUT / f"correction-{c['id']}.mp4"
    R.encode(seq, out)

    caption = (
        f"{c['common']}\n\nThat is out of date.\n\n"
        f"{c['correct']}\n\n"
        f"Source: {c['cite']}\n\n"
        + (f"{c['note']}\n\n" if c.get("note") else "")
        + "Check it yourself. 234 chapters and 4,414 practice questions, every answer "
          "sourced, free and no sign-up: ghostaviator.com\n\n"
          "#DGCA #DGCAExam #CPL #ATPL #PilotTraining #StudentPilot #IndianPilot #Shorts"
    )
    out.with_suffix(".txt").write_text(caption, encoding="utf-8")
    total = sum(d for _, d in seq)
    print(f"duration : {total:.1f}s")
    print(f"video    : {out}   {out.stat().st_size / 1024:.0f} KB")
    print(f"caption  : {out.with_suffix('.txt')}")
    print("\nDRAFT. Watch it, and read the caption, before anything goes up.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
