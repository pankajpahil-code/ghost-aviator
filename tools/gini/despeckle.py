"""
Remove matte speckles from Gini's sprites.

    python tools/gini/despeckle.py            # report only
    python tools/gini/despeckle.py --write    # clean them in place

THE PROBLEM. `isnet-general-use` keeps the wings (unlike u2net, which amputates
them), but around the far wing it leaves scattered fragments of dark background.
The alpha-hardening step then promotes those to fully opaque, so they render as
black ink-flecks floating beside the character.

THE FIX. Label the connected components of the alpha channel and keep only the
ones big enough to be part of him. A speck is, by definition, a small island far
from the body — so this removes them without eroding thin features the way a
morphological opening would (an erode/dilate pass eats the membrane edge, which
is exactly the detail worth keeping).

Everything is reported before it is changed, and nothing is written without
--write, because silently altering the Captain's artwork is not acceptable.
"""

import os
import sys

HERE = os.path.dirname(os.path.realpath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
SPRITES = os.path.join(REPO, "public", "gini", "sprites")

# A component smaller than this fraction of the largest one is a speck.
MIN_FRACTION = 0.02

# HARD SAFETY CEILING. In an animation strip every frame is its own island, so a
# careless threshold could delete a whole frame of the Captain's artwork. Nothing
# above this many pixels is ever removed, whatever the fraction says. Measured on
# the real sprites: largest genuine speck 831 px, smallest real frame ~24,000 px —
# a 65x gap, so 2,000 sits safely in the middle.
MAX_SPECK_PX = 2000


def clean(path: str, write: bool) -> tuple[int, int]:
    import numpy as np
    from PIL import Image
    from scipy import ndimage

    im = Image.open(path).convert("RGBA")
    a = np.array(im.split()[-1])
    mask = a > 127
    if not mask.any():
        return 0, 0

    labels, n = ndimage.label(mask)
    if n <= 1:
        return 0, n

    sizes = ndimage.sum(mask, labels, range(1, n + 1))
    biggest = sizes.max()
    keep = {i + 1 for i, s in enumerate(sizes)
            if s >= biggest * MIN_FRACTION or s > MAX_SPECK_PX}
    drop = [i + 1 for i in range(n) if (i + 1) not in keep]
    removed_px = int(sum(sizes[i - 1] for i in drop))

    if write and drop:
        for lbl in drop:
            a[labels == lbl] = 0
        r, g, b, _ = im.split()
        Image.merge("RGBA", (r, g, b, Image.fromarray(a))).save(
            path, "WEBP", quality=88, method=6)

    return removed_px, len(drop)


def main():
    write = "--write" in sys.argv
    files = sorted(f for f in os.listdir(SPRITES) if f.endswith(".webp"))
    print(f"{'sprite':<22} {'islands':>8} {'px removed':>11}")
    print("-" * 44)
    total_px = 0
    for f in files:
        px, n = clean(os.path.join(SPRITES, f), write)
        total_px += px
        flag = "" if n == 0 else ("  cleaned" if write else "  (would clean)")
        print(f"{f:<22} {n:>8} {px:>11,}{flag}")
    print("-" * 44)
    print(f"{'TOTAL':<22} {'':>8} {total_px:>11,} px")
    if not write and total_px:
        print("\nreport only — re-run with --write to apply")


if __name__ == "__main__":
    main()
