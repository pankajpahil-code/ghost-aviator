"""
Produce the isolated character PNG locally, so the GPU notebook does not have to.

WHY: installing rembg + opencv + pymeshlab inside Colab drags in numpy/pillow
builds that conflict with Colab's preinstalled stack. Two runs died on exactly
that ("cannot import name '_Ink' from 'PIL._typing'", then "cannot import name
'_center' from 'numpy._core.umath'"). Doing the matte here removes four packages
from the notebook and with them the whole class of failure.

    python tools/gini/make_cutout.py

Writes tools/gini/input/char_cut.png (RGBA, background removed).
"""

import io
import os
from PIL import Image

HERE = os.path.dirname(os.path.realpath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
IN_DIR = os.path.join(HERE, "input")
os.makedirs(IN_DIR, exist_ok=True)

POSTER = os.path.join(REPO, "public", "mascot-hero-poster.webp")
CROP_BOX = (520, 40, 1120, 900)      # same box the Colab run used
OUT = os.path.join(IN_DIR, "char_cut.png")


def main():
    from rembg import new_session, remove

    poster = Image.open(POSTER).convert("RGB")
    crop = poster.crop(CROP_BOX)
    print(f"poster {poster.size} -> crop {crop.size}")

    # MODEL CHOICE IS LOAD-BEARING HERE — two failures taught this:
    #   bria-rmbg-2.0 (rembg's default): 1 GB net, tried to allocate a single
    #     822 MB buffer on this machine and died (ONNXRuntime BFCArena failure).
    #   u2net: ran fine, but it is PERSON-segmentation. It kept the pilot and
    #     amputated the wings, tail and trident — i.e. it silently destroyed the
    #     most distinctive parts of the character while reporting success.
    # isnet-general-use segments general objects rather than people, so the
    # non-human anatomy survives. ALWAYS eyeball the result before using it.
    model = os.environ.get("REMBG_MODEL", "isnet-general-use")
    print(f"matte model: {model}")
    session = new_session(model)
    cut = remove(crop.convert("RGBA"), session=session)

    # HARDEN THE ALPHA. isnet keeps the wings but gives the thin membrane of the
    # far wing only partial opacity, so it reads as a pale ghost. Image-to-3D
    # treats low alpha as "not part of the subject" and will generate a thin or
    # missing wing from it. A near-binary mask removes that ambiguity; slightly
    # harsher edges cost nothing at the resolution the generator works at.
    r, g, b, a = cut.split()
    a = a.point(lambda v: 0 if v < 20 else 255)
    cut = Image.merge("RGBA", (r, g, b, a))
    cut.save(OUT)

    # Report how much actually survived the matte. A near-empty alpha channel
    # means the matte ate the character, and we would rather know now than
    # after burning ten minutes of GPU time on a blank image.
    alpha = cut.split()[-1]
    hist = alpha.histogram()
    opaque = sum(hist[200:])
    total = cut.size[0] * cut.size[1]
    print(f"saved {OUT}  {cut.size}")
    print(f"opaque pixels: {opaque:,} / {total:,} = {100*opaque/total:.1f}%")
    if opaque / total < 0.05:
        raise SystemExit("MATTE FAILED - almost nothing left, do not upload this")


if __name__ == "__main__":
    main()
