"""
Build Gini's TALKING mouth cycle from the Captain's own footage.

    python tools/gini/build_talk_sprite.py

WHY THIS EXISTS
---------------
Until 2026-08-21 Gini could not actually talk. The original hero video is a wide
cinematic shot where the face is small and never articulates, so "speaking" was
faked with a small articulation bob on a still — honest, but not what the
Captain asked for. He then supplied real close-up footage of the character
talking, which is the one thing that makes a genuine mouth cycle possible.

WHAT IT PRODUCES
----------------
public/gini/sprites/seq_talk.webp — a horizontal strip of N equal cells, the
same convention as seq_fly / seq_thunder, so GiniSprite.tsx animates it with the
existing steps() keyframes and nothing else has to change.

LESSONS FROM THE EARLIER SPRITE BUILDS, ENCODED HERE RATHER THAN RELEARNED
--------------------------------------------------------------------------
1. MODEL CHOICE IS LOAD-BEARING. `u2net` is PERSON segmentation: on this
   character it ran happily and amputated the wings, tail and trident while
   reporting success. Use `isnet-general-use`.
2. CLEAR THE WORK DIR between runs. ffmpeg writes %03d.png, so a shorter run
   leaves the previous run's tail behind and the strip silently mixes two
   different takes.
3. ALWAYS OPEN THE OUTPUT before trusting it. Two earlier images came back with
   invented banner text that nobody asked for, caught only by looking.
4. A LOOP NEEDS A STABLE CAMERA. The source slowly pushes in, so every frame is
   re-centred on the subject's own alpha bounding box instead of being cropped
   at fixed pixel coordinates — otherwise the head drifts across the loop and
   reads as a wobble rather than as speech.
"""

import glob
import os
import subprocess
import sys

from PIL import Image

HERE = os.path.dirname(os.path.realpath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
WORK = os.path.join(HERE, "talkwork")
FRAMES = os.path.join(WORK, "frames")
CUTOUT = os.path.join(WORK, "cutout")
OUT = os.path.join(REPO, "public", "gini", "sprites", "seq_talk.webp")

# The Captain supplied two takes. This is the usable one: the other is framed so
# tight that the horns are cut off by the top of frame in EVERY frame, and a
# talking cycle that loses the horns does not match the idle still, which has
# them. Check what the source actually contains before building from it.
SOURCE = os.environ.get(
    "GINI_TALK_VIDEO",
    r"C:\Users\Admin\Downloads\him_talking_politly_guiding (1).mp4",
)

# The close-up talking beat, chosen by eye from a contact sheet of all 240
# frames: before this the shot is wide, after it cuts away. Step 2 at 24 fps
# gives a 12-cell strip that plays back at a natural speaking rate.
# Before FIRST the shot is wide; at 88 it cuts to him flying. Step 2 at 24 fps
# gives a 16-cell strip that plays back at a natural speaking rate.
#
# Getting the END right matters and is easy to miss: an earlier build ran two
# frames past the cut and the last cell of the strip was a tiny full-body figure
# instead of a face. It took OPENING the strip to see it.
FIRST, LAST, STEP = 56, 88, 2

# Output cell size. MEASURED, not guessed: with the horn-tip anchoring below,
# content lands at y=20..226 in every cell, so a 340px cell carried 114px of
# dead transparent space that just made the head look small on the page.
CELL_W, CELL_H = 300, 240

# How much of the cell the head should occupy, and where the top of the head
# sits. Tuned so the talking cycle lines up with the idle still rather than
# jumping in scale when he starts speaking.
HEAD_TOP_FRAC = 0.06


def run(cmd):
    print("  $", " ".join(str(c) for c in cmd[:6]), "...")
    subprocess.run(cmd, check=True, capture_output=True)


def extract():
    if os.path.isdir(FRAMES) and len(glob.glob(os.path.join(FRAMES, "*.png"))) >= LAST:
        print(f"frames: reusing {FRAMES}")
        return
    # Lesson 2: never append to a previous run.
    if os.path.isdir(FRAMES):
        for f in glob.glob(os.path.join(FRAMES, "*.png")):
            os.remove(f)
    os.makedirs(FRAMES, exist_ok=True)
    print(f"frames: extracting from {os.path.basename(SOURCE)}")
    run(["ffmpeg", "-v", "error", "-i", SOURCE, "-vsync", "0",
         os.path.join(FRAMES, "t%03d.png")])


def harden_alpha(im, lo=105, hi=215):
    """
    Push soft matte edges to fully transparent or fully opaque.

    rembg leaves a haze of half-transparent pixels around fur collars and
    shoulders. Composited over a dark page that haze reads as a dirty grey
    halo around the character, which is the giveaway that a cutout is a
    cutout. Everything below `lo` is dropped, everything above `hi` is made
    solid, and the narrow band between is stretched so the true edge stays
    smooth rather than becoming a jagged 1-bit mask.

    `lo` is high because this footage has drifting smoke and cloud around the
    character that rembg keeps at low alpha; at 70 it survived as grey wisps.
    """
    a = im.getchannel("A").point(
        lambda v: 0 if v < lo else (255 if v > hi else int((v - lo) * 255 / (hi - lo)))
    )
    im.putalpha(a)
    return im


def cut_out(paths):
    """Background removal, one frame at a time, with the right model."""
    from rembg import new_session, remove

    os.makedirs(CUTOUT, exist_ok=True)
    for f in glob.glob(os.path.join(CUTOUT, "*.png")):
        os.remove(f)

    session = new_session("isnet-general-use")   # lesson 1
    out = []
    for i, p in enumerate(paths):
        src = Image.open(p).convert("RGBA")
        cut = harden_alpha(remove(src, session=session))
        dst = os.path.join(CUTOUT, f"c{i:02d}.png")
        cut.save(dst)
        out.append(dst)
        print(f"  cut {i + 1}/{len(paths)}", end="\r")
    print()
    return out


def recentre(paths):
    """
    Lesson 4: align on the subject, not on the frame.

    Each cutout is cropped to a window of the SAME size, positioned from that
    frame's own alpha bounding box, so a slow camera push does not turn into a
    drifting head over the loop.
    """
    boxes = []
    for p in paths:
        im = Image.open(p)
        bbox = im.getchannel("A").getbbox()
        if not bbox:
            raise SystemExit(f"no subject found in {p} — check the rembg model")
        boxes.append((im, bbox))

    # ONE scale for the whole strip, never per-frame.
    #
    # The obvious idea — normalise each frame by its own bounding box — is wrong
    # here, and measuring showed why: the subject touches the top and bottom of
    # the source in every frame, so bbox HEIGHT is a constant 720 and carries no
    # scale information at all, while bbox WIDTH swings 43% as the wings enter
    # and leave. Per-frame scaling on either would make the head pulse.
    #
    # So the strip takes a single scale from the median shoulder width, and the
    # slow camera push is left alone: across one cycle it reads as him leaning
    # in slightly while he speaks, which is a good thing rather than a defect.
    widths = sorted(b[2] - b[0] for _, b in boxes)
    median_w = widths[len(widths) // 2]
    scale = (CELL_W * 0.92) / median_w

    cells = []
    for im, (x0, y0, x1, y1) in boxes:
        w = int(im.width * scale)
        h = int(im.height * scale)
        big = im.resize((w, h), Image.LANCZOS)
        cx = int((x0 + x1) / 2 * scale)          # subject centre, horizontally
        top = int(y0 * scale)                    # top of the head

        cell = Image.new("RGBA", (CELL_W, CELL_H), (0, 0, 0, 0))
        ox = CELL_W // 2 - cx
        oy = int(CELL_H * HEAD_TOP_FRAC) - top
        cell.paste(big, (ox, oy), big)
        cells.append(cell)
    return cells


def main():
    extract()
    allf = sorted(glob.glob(os.path.join(FRAMES, "t*.png")))
    if len(allf) < LAST:
        raise SystemExit(f"only {len(allf)} frames extracted, need {LAST}")

    picks = allf[FIRST:LAST:STEP]
    print(f"using frames {FIRST}..{LAST} step {STEP} -> {len(picks)} cells")

    cells = recentre(cut_out(picks))

    strip = Image.new("RGBA", (CELL_W * len(cells), CELL_H), (0, 0, 0, 0))
    for i, c in enumerate(cells):
        strip.paste(c, (i * CELL_W, 0), c)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    strip.save(OUT, "WEBP", quality=88, method=6)
    kb = os.path.getsize(OUT) / 1024
    print(f"\nwrote {os.path.relpath(OUT, REPO)}")
    print(f"  {len(cells)} cells of {CELL_W}x{CELL_H}, {kb:.0f} KB")
    print("\nNow OPEN IT and look at it (lesson 3) before trusting it:")
    print(f"  {OUT}")
    print("\nGiniSprite.tsx needs a SEQS entry:")
    print(f'  talk_seq: {{ src: "/gini/sprites/seq_talk.webp", frames: {len(cells)},'
          f' fw: {CELL_W}, fh: {CELL_H}, fps: 12 }},')


if __name__ == "__main__":
    sys.exit(main())
