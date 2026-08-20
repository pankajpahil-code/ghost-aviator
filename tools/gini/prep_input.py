"""
Prepare a clean, isolated character image to feed AI image-to-3D.

Input quality decides output quality: the hero poster is a full scene (mountains,
sunset, clouds) and a 3D generator will happily reconstruct the mountains too.
So we crop to the character and knock the background out to alpha.

    python tools/gini/prep_input.py

Writes tools/gini/input/*.png
"""

import os
from PIL import Image

HERE = os.path.dirname(os.path.realpath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(HERE, "input")
os.makedirs(OUT, exist_ok=True)


def save(im, name):
    p = os.path.join(OUT, name)
    im.save(p)
    print(f"  {name}: {im.size} {im.mode}")
    return p


def main():
    poster = Image.open(os.path.join(REPO, "public", "mascot-hero-poster.webp")).convert("RGB")
    print(f"poster: {poster.size}")

    # The character stands centre-frame in the 1600x900 poster. Generous crop —
    # we would rather include a little scenery than clip a wingtip; the matte
    # step removes the rest.
    crop = poster.crop((520, 40, 1120, 900))
    save(crop, "char_crop.png")

    # Upscale to give the 3D model more to work with (most image-to-3D models
    # take ~1024px square input).
    w, h = crop.size
    scale = 1024 / max(w, h)
    big = crop.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    square = Image.new("RGB", (1024, 1024), (255, 255, 255))
    square.paste(big, ((1024 - big.size[0]) // 2, (1024 - big.size[1]) // 2))
    save(square, "char_1024.png")

    other = Image.open(os.path.join(REPO, "public", "ghost-mascot.png")).convert("RGB")
    print(f"ghost-mascot.png: {other.size}")
    save(other, "ghost_mascot_full.png")


if __name__ == "__main__":
    main()
