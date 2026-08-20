"""
Build Gini's sprite set from the Captain's OWN hero video.

    python tools/gini/build_sprites.py

WHY THIS EXISTS, AND WHY IT REPLACED THE 3D ROUTE
-------------------------------------------------
The generated 3D mesh was a degraded copy of the mascot: no face, no texture,
60k polys of approximation. Meanwhile `public/mascot-hero.mp4` already contains
240 frames of the real character at 1600x900 — full-body poses, close-ups with
the glowing eyes and grin, and the book-handover beat.

Clippy was never 3D. It was sprite animation. Using the real frames gives exact
brand fidelity, a real face with real expressions, and a fraction of the weight
(2.2 MB glb + 1.8 MB Draco decoder -> a few hundred KB of WebP).

Output: public/gini/sprites/*.webp  + a manifest the component imports.
"""

import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.realpath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
VIDEO = os.path.join(REPO, "public", "mascot-hero.mp4")
FRAME_DIR = os.path.join(HERE, "frames")
OUT_DIR = os.path.join(REPO, "public", "gini", "sprites")

# Frames chosen by eye from a contact sheet of the whole video.
# name          frame  what it is                            crop mode
POSES = [
    ("idle",         36,  "full body, wings spread, sunset",     "body"),
    ("fly",          24,  "full body, wings wide, lightning",    "body"),
    ("talk",         84,  "close-up, grinning",                  "face"),
    ("happy",        96,  "close-up, broad grin",                "face"),
    ("surprised",    72,  "close-up, trident raised",            "face"),
    ("point",        144, "full body, temple pillars",           "body"),
    ("present_book", 204, "offering the book to a student",      "right"),
]

# Crop windows in the 1600x900 frame, chosen from a 20-frame contact sheet
# rather than guessed. The handover shots put the mascot on the RIGHT with a
# student on the left, so they need their own window or the sprite would come
# out as two people.
CROPS = {
    # Wide enough for the FULL wingspan: an earlier 690px window
    # amputated his right wing, which is half the silhouette.
    "body":  (250, 10, 1360, 900),
    "face":  (520, 0, 1180, 760),
    "right": (790, 40, 1420, 900),
}


def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        print("  ! ", r.stderr.strip()[:200])
    return r.returncode == 0


def extract():
    os.makedirs(FRAME_DIR, exist_ok=True)
    for name, n, _desc, _mode in POSES:
        dst = os.path.join(FRAME_DIR, f"src_{name}.png")
        run(f'ffmpeg -v error -i "{VIDEO}" -vf "select=eq(n\\,{n})" -frames:v 1 "{dst}" -y')
    print(f"extracted {len(POSES)} source frames")


def cut():
    from PIL import Image
    from rembg import new_session, remove

    # isnet-general-use, NOT u2net: u2net is person-segmentation and amputates
    # the wings, tail and trident. Learned the hard way on the still art.
    session = new_session("isnet-general-use")
    os.makedirs(OUT_DIR, exist_ok=True)
    manifest = {}

    for name, n, desc, mode in POSES:
        src = os.path.join(FRAME_DIR, f"src_{name}.png")
        if not os.path.exists(src):
            print(f"  skip {name}: no source frame")
            continue

        im = Image.open(src).convert("RGB").crop(CROPS[mode])
        cut_im = remove(im.convert("RGBA"), session=session)

        # Harden partial alpha — the far wing membrane comes back semi
        # transparent and reads as a pale ghost otherwise.
        r, g, b, a = cut_im.split()
        a = a.point(lambda v: 0 if v < 24 else 255)
        cut_im = Image.merge("RGBA", (r, g, b, a))

        # Trim to the actual character so every sprite is tightly framed and the
        # component does not have to guess where he is inside the image.
        box = cut_im.getbbox()
        if box:
            cut_im = cut_im.crop(box)

        cut_im.thumbnail((520, 520), Image.LANCZOS)
        dst = os.path.join(OUT_DIR, f"{name}.webp")
        cut_im.save(dst, "WEBP", quality=88, method=6)

        kb = os.path.getsize(dst) / 1024
        opaque = sum(cut_im.split()[-1].histogram()[200:])
        pct = 100.0 * opaque / (cut_im.size[0] * cut_im.size[1])
        manifest[name] = {"src": f"/gini/sprites/{name}.webp",
                          "w": cut_im.size[0], "h": cut_im.size[1], "mode": mode}
        print(f"  {name:14s} frame {n:3d}  {cut_im.size}  {kb:6.1f} KB  {pct:4.1f}% opaque  ({desc})")

    with open(os.path.join(OUT_DIR, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=1)
    total = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in os.listdir(OUT_DIR))
    print(f"\n{len(manifest)} sprites, {total/1024:.0f} KB total -> {OUT_DIR}")


if __name__ == "__main__":
    extract()
    cut()
