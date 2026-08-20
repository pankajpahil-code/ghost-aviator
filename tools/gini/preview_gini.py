"""
Gini — preview renders, so the look can be judged before anything ships.

Run headless:
    blender --background tools/gini/gini.blend --python tools/gini/preview_gini.py

Writes tools/gini/preview/*.png — one still per key pose, plus a contact sheet.

RENDERER CHOICE: this machine has Intel HD Graphics 520 (integrated, no CUDA),
and Blender 4.2+ EEVEE Next requires a GPU. So we render with CYCLES on CPU at
low samples and small resolution — slow per pixel but entirely reliable here.
Workbench is used for the fast silhouette check.
"""

import bpy
import math
import os

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
OUT_DIR = os.path.join(SCRIPT_DIR, "preview")

RES = 512
SAMPLES = 48

# (clip name, frame to sample) — the poses worth judging.
# `fly` is sampled three times across one wingbeat ON PURPOSE: it is the only
# way to see whether the wings are actually driven by their bones, rather than
# riding along rigid with the chest. Frames 1 / 15 / 30 are up / down / up.
SHOTS = [
    ("fly", 1),
    ("fly", 15),
    ("fly", 30),
    ("idle", 45),
    ("present_book", 45),
    ("surprised", 8),
]


def setup_world():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.render.resolution_x = RES
    scene.render.resolution_y = RES
    scene.render.film_transparent = True          # PNG with alpha, like the site
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"

    world = bpy.data.worlds.new("preview_world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.05, 0.06, 0.09, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 1.2
    scene.world = world


def add_camera():
    """Three-quarter front view framed on the WHOLE character.

    The first version was hand-aimed at a 1.8 m figure with folded arms and
    cropped the generated mesh badly: that character has a ~1.6 m wingspan, so
    the framing has to be derived from the actual bounding box rather than
    guessed. We aim at the mid-height of the mesh and pull back far enough to
    contain its widest dimension.
    """
    import mathutils

    body = bpy.data.objects.get("gini_body")
    if body:
        dims = body.dimensions
        height = dims.z
        widest = max(dims.x, dims.y, dims.z)
    else:
        height, widest = 1.8, 1.8

    target = mathutils.Vector((0, 0, height * 0.55))
    # Distance scaled off the widest axis so wings never fall outside frame.
    dist = widest * 2.1

    cam_data = bpy.data.cameras.new("preview_cam")
    cam_data.lens = 50
    cam = bpy.data.objects.new("preview_cam", cam_data)
    bpy.context.collection.objects.link(cam)

    # 35 degrees off front, slightly above eye level.
    ang = math.radians(35)
    cam.location = (dist * math.sin(ang), -dist * math.cos(ang), height * 0.72)
    direction = target - mathutils.Vector(cam.location)
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()

    bpy.context.scene.camera = cam
    print(f"[gini] framing: height={height:.2f} widest={widest:.2f} dist={dist:.2f}")
    return cam


def add_lights():
    """Key / rim / fill — the rim is what sells wings and silhouette."""
    specs = [
        ("key",  (2.4, -2.6, 3.0), 420, (1.0, 0.94, 0.85)),
        ("rim",  (-2.2, 1.9, 2.4), 380, (1.0, 0.55, 0.22)),   # warm sunset rim
        ("fill", (-1.8, -2.2, 1.2), 120, (0.55, 0.68, 1.0)),  # cool fill
    ]
    for name, loc, power, colour in specs:
        d = bpy.data.lights.new(name, type="AREA")
        d.energy = power
        d.size = 2.5
        d.color = colour
        ob = bpy.data.objects.new(name, d)
        ob.location = loc
        # Aim at the chest
        direction = (0 - loc[0], 0 - loc[1], 1.35 - loc[2])
        import mathutils
        ob.rotation_euler = mathutils.Vector(direction).to_track_quat("-Z", "Y").to_euler()
        bpy.context.collection.objects.link(ob)


def render_shots():
    os.makedirs(OUT_DIR, exist_ok=True)
    rig = bpy.data.objects.get("gini_rig")
    if rig is None:
        raise SystemExit("[gini] no gini_rig in scene — run build_gini.py first")
    if not rig.animation_data:
        rig.animation_data_create()

    made = []
    for clip, frame in SHOTS:
        act = bpy.data.actions.get(clip)
        if act is None:
            print(f"[gini] WARNING: no action '{clip}', skipping")
            continue
        rig.animation_data.action = act
        bpy.context.scene.frame_set(frame)
        path = os.path.join(OUT_DIR, f"gini_{clip}_f{frame:03d}.png")
        bpy.context.scene.render.filepath = path
        bpy.ops.render.render(write_still=True)
        made.append(path)
        print(f"[gini] rendered {path}")
    return made


def main():
    setup_world()
    add_camera()
    add_lights()
    made = render_shots()
    print(f"[gini] {len(made)} preview stills in {OUT_DIR}")


if __name__ == "__main__":
    main()
