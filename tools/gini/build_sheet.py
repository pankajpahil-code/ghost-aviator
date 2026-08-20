"""
Build ANIMATED sprite sheets for Gini from the Captain's cinematic footage.

    python tools/gini/build_sheet.py

Static poses were not enough: the character has to breathe, the smoke has to
drift, the lightning has to strike. All of that already exists in the source
videos — this walks a run of consecutive frames, mattes each one, and lays them
out as a horizontal strip that CSS animates with `steps()`.

CRITICAL DETAIL: every frame in a strip uses the SAME fixed crop window and the
SAME output size. Trimming each frame to its own bounding box (which is right
for a single still) would make the character jitter and pulse between frames,
because the camera drifts and the wings move.

Output: public/gini/sprites/seq_<name>.webp + seq-manifest.json
"""

import json
import os
import subprocess

HERE = os.path.dirname(os.path.realpath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
DL = os.path.join(os.path.expanduser("~"), "Downloads")
WORK = os.path.join(HERE, "seqwork")
OUT_DIR = os.path.join(REPO, "public", "gini", "sprites")

CINEMATIC = os.path.join(DL, "Cinematic_effects_i_wanna_use.mp4")
FLYING    = os.path.join(DL, "same_charcter_flying_around_.mp4")
REGEN = os.path.join(DL, "Regenerate_the_video.mp4")

# 1280x720 source. Crop windows keep the character centred with room for the
# full wingspan and the trident above his head.
CROP_BODY = (210, 20, 1075, 720)     # full body + wings + trident
CROP_FACE = (330, 0, 1010, 640)      # close-up

# name        video       start  count  step  crop        fps  what it is
SEQS = [
    # The flying video is the richest source: it has genuine airborne poses AND
    # the trident throwing lightning, which no other footage has.
    ("fly",     FLYING,     12,  12,  3,  CROP_BODY,  12, "airborne, wings beating"),
    ("thunder", FLYING,     96,  12,  3,  CROP_BODY,  12, "LIGHTNING FROM THE TRIDENT"),
    # HARD LIMIT: the source montage (split-screen panels, and an unrelated
    # anime character) starts at frame 204. Anything at or past it must never
    # enter a strip. Measured, not guessed — an earlier range ran to 213 and
    # put four panels on screen in production.
    ("idle",    FLYING,    180,  10,  2,  CROP_BODY,  10, "standing, wings spread, smoke"),
]

FRAME_H = 200          # every strip renders at this height


# Frame at which the flying video stops showing the character and starts showing
# a split-screen montage (including an unrelated anime character). Any strip that
# reaches it ships four panels to production, which is exactly what happened.
MONTAGE_STARTS_AT = 204


def extract(video, start, count, step, dst_dir):
    # Clear first. ffmpeg writes %03d.png, so a shorter run leaves the tail of a
    # previous run behind and the strip silently ends up containing frames from
    # TWO different videos — which is exactly what happened on the first pass.
    if os.path.isdir(dst_dir):
        for f in os.listdir(dst_dir):
            os.remove(os.path.join(dst_dir, f))
    os.makedirs(dst_dir, exist_ok=True)
    wanted = [start + i * step for i in range(count)]
    expr = "+".join(f"eq(n\\,{n})" for n in wanted)
    subprocess.run(
        f'ffmpeg -v error -i "{video}" -vf "select=\'{expr}\'" -vsync 0 '
        f'"{dst_dir}/%03d.png" -y', shell=True)
    got = sorted(f for f in os.listdir(dst_dir) if f.endswith(".png"))
    return [os.path.join(dst_dir, f) for f in got]


def build():
    from PIL import Image
    from rembg import new_session, remove

    # isnet-general-use: u2net is person-segmentation and cuts the wings off.
    session = new_session("isnet-general-use")
    os.makedirs(OUT_DIR, exist_ok=True)
    manifest = {}

    for name, video, start, count, step, crop, fps, desc in SEQS:
        if not os.path.exists(video):
            print(f"  skip {name}: source video missing")
            continue

        last = start + (count - 1) * step
        if video == FLYING and last >= MONTAGE_STARTS_AT:
            raise SystemExit(
                f"REFUSING to build '{name}': frames run to {last}, but the montage "
                f"starts at {MONTAGE_STARTS_AT}. Shorten count/step.")

        work = os.path.join(WORK, name)
        frames = extract(video, start, count, step, work)
        if not frames:
            print(f"  skip {name}: no frames extracted")
            continue

        cw, ch = crop[2] - crop[0], crop[3] - crop[1]
        fw = int(FRAME_H * cw / ch)          # uniform frame size for the strip
        cut_frames = []

        for fp in frames:
            im = Image.open(fp).convert("RGB").crop(crop)
            cut = remove(im.convert("RGBA"), session=session)
            r, g, b, a = cut.split()
            a = a.point(lambda v: 0 if v < 24 else 255)   # harden partial alpha
            cut = Image.merge("RGBA", (r, g, b, a))
            cut_frames.append(cut.resize((fw, FRAME_H), Image.LANCZOS))

        sheet = Image.new("RGBA", (fw * len(cut_frames), FRAME_H), (0, 0, 0, 0))
        for i, f in enumerate(cut_frames):
            sheet.paste(f, (i * fw, 0), f)

        dst = os.path.join(OUT_DIR, f"seq_{name}.webp")
        sheet.save(dst, "WEBP", quality=84, method=6)
        kb = os.path.getsize(dst) / 1024
        manifest[name] = {"src": f"/gini/sprites/seq_{name}.webp",
                          "frames": len(cut_frames), "fw": fw, "fh": FRAME_H, "fps": fps}
        print(f"  seq_{name:8s} {len(cut_frames):2d} frames  {fw}x{FRAME_H}  {kb:6.1f} KB  ({desc})")

    with open(os.path.join(OUT_DIR, "seq-manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=1)
    print(f"\n{len(manifest)} animated sequences -> {OUT_DIR}")


if __name__ == "__main__":
    build()
