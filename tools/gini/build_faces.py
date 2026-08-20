"""
Cut Gini's facial expressions out of the flying video.

    python tools/gini/build_faces.py

That one clip contains the full emotional range the Captain asked for —
laughing, snarling, smiling — in close-up, with the glowing eyes. These are
held single frames rather than strips: an expression reads better still.
"""

import os
import subprocess

HERE = os.path.dirname(os.path.realpath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
DL = os.path.join(os.path.expanduser("~"), "Downloads")
VIDEO = os.path.join(DL, "same_charcter_flying_around_.mp4")
WORK = os.path.join(HERE, "facework")
OUT_DIR = os.path.join(REPO, "public", "gini", "sprites")

# 1280x720. Close-ups fill the frame, so the window is generous.
CROP = (250, 0, 1030, 720)          # close-ups fill the frame
CROP_BODY = (210, 20, 1075, 720)    # full body + wingspan + trident

# name        frame  what it is
# (name, frame, description, crop)
FACES = [
    # A STILL idle, deliberately. Playing the 10-frame idle strip on a loop read
    # as "a video is playing in a box" — the camera drifts between source frames,
    # so consecutive cells differ enough to look like footage rather than a
    # character breathing. Standing still is a still; only events animate.
    ("idle",     189,  "standing, wings spread, trident and book", CROP_BODY),
    ("laugh",     60,  "open-mouth laugh, teeth, eyes blazing", CROP),
    ("angry",     80,  "snarling, bared teeth", CROP),
    ("happy",    148,  "warm smile", CROP),
    ("talk",     164,  "relaxed, mouth open mid-word", CROP),
    ("surprised", 44,  "eyes wide", CROP),
]


def main():
    from PIL import Image
    from rembg import new_session, remove

    os.makedirs(WORK, exist_ok=True)
    os.makedirs(OUT_DIR, exist_ok=True)
    session = new_session("isnet-general-use")

    for name, n, desc, crop in FACES:
        src = os.path.join(WORK, f"{name}.png")
        subprocess.run(
            f'ffmpeg -v error -i "{VIDEO}" -vf "select=eq(n\\,{n})" -frames:v 1 "{src}" -y',
            shell=True)
        if not os.path.exists(src):
            print(f"  skip {name}: extraction failed")
            continue

        im = Image.open(src).convert("RGB").crop(crop)
        cut = remove(im.convert("RGBA"), session=session)
        r, g, b, a = cut.split()
        a = a.point(lambda v: 0 if v < 24 else 255)
        cut = Image.merge("RGBA", (r, g, b, a))
        box = cut.getbbox()
        if box:
            cut = cut.crop(box)
        cut.thumbnail((520, 520), Image.LANCZOS)

        dst = os.path.join(OUT_DIR, f"{name}.webp")
        cut.save(dst, "WEBP", quality=88, method=6)
        print(f"  {name:10s} frame {n:3d}  {cut.size}  {os.path.getsize(dst)/1024:5.1f} KB  ({desc})")


if __name__ == "__main__":
    main()
