"""
Generate a real 3D mesh of the Ghost Aviator from the hero artwork, using a
GPU-backed Hugging Face Space (this machine has no CUDA).

    python tools/gini/gen_3d.py                # baseline, front image only
    python tools/gini/gen_3d.py --quality      # slower, higher detail
    python tools/gini/gen_3d.py --mv           # use multi-view images if present

Auth: ZeroGPU Spaces give anonymous users a small quota. If you hit a quota
error, set a token in the environment FIRST (never hard-code it here):
    $env:HF_TOKEN = "hf_..."
The token is read from the environment only.

Output: tools/gini/out/gini_raw.glb  (unrigged mesh — rigging happens in Blender)
"""

import argparse
import os
import shutil
import sys
import time

HERE = os.path.dirname(os.path.realpath(__file__))
IN_DIR = os.path.join(HERE, "input")
OUT_DIR = os.path.join(HERE, "out")

SPACE = "tencent/Hunyuan3D-2"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quality", action="store_true",
                    help="higher steps + octree resolution (slower, more detail)")
    ap.add_argument("--mv", action="store_true",
                    help="also send back/left/right views from input/mv_*.png")
    ap.add_argument("--image", default=os.path.join(IN_DIR, "char_1024.png"))
    args = ap.parse_args()

    from gradio_client import Client, handle_file

    if not os.path.exists(args.image):
        sys.exit(f"input image not found: {args.image}")
    os.makedirs(OUT_DIR, exist_ok=True)

    token = os.environ.get("HF_TOKEN") or None
    print(f"space   : {SPACE}")
    print(f"image   : {args.image}")
    print(f"token   : {'set' if token else 'anonymous'}")

    steps = 50 if args.quality else 30
    octree = 384 if args.quality else 256
    print(f"steps={steps} octree={octree} mv={args.mv}")

    # gradio_client 2.x renamed this parameter from hf_token -> token.
    client = Client(SPACE, token=token, verbose=False)

    def mv(name):
        """Optional extra view; None when we have not generated it yet."""
        p = os.path.join(IN_DIR, f"mv_{name}.png")
        return handle_file(p) if (args.mv and os.path.exists(p)) else None

    t0 = time.time()
    # caption="" not None: the Space raised a server-side NameError when caption
    # was null, which smells like their handler branching on caption/image and
    # then referencing a mesh variable that was never assigned.
    result = client.predict(
        caption="",
        image=handle_file(args.image),
        mv_image_front=mv("front"),
        mv_image_back=mv("back"),
        mv_image_left=mv("left"),
        mv_image_right=mv("right"),
        steps=steps,
        guidance_scale=5.0,
        seed=1234,
        octree_resolution=octree,
        check_box_rembg=True,      # the Space isolates the character for us
        num_chunks=8000,
        randomize_seed=False,
        api_name="/generation_all",
    )
    dt = time.time() - t0
    print(f"\ngenerated in {dt:.0f}s")

    # Result is a tuple; the first entries are mesh files (white mesh + textured).
    saved = []
    for i, item in enumerate(result):
        path = item.get("value") if isinstance(item, dict) else item
        if isinstance(path, str) and os.path.exists(path) and path.lower().endswith((".glb", ".obj")):
            ext = os.path.splitext(path)[1]
            dest = os.path.join(OUT_DIR, f"gini_raw_{i}{ext}")
            shutil.copy(path, dest)
            mb = os.path.getsize(dest) / 1_000_000
            print(f"  saved {dest}  ({mb:.2f} MB)")
            saved.append(dest)
        elif isinstance(item, dict):
            print(f"  [{i}] {list(item)[:4]}")
        else:
            print(f"  [{i}] {str(item)[:120]}")

    if not saved:
        sys.exit("no mesh file returned — inspect the output above")
    print(f"\n{len(saved)} mesh file(s) in {OUT_DIR}")


if __name__ == "__main__":
    main()
