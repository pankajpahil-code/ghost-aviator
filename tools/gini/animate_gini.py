"""
Gini — rigging pass 2: expressions, visemes, the 10 animation clips, and glTF export.

Run headless (after build_gini.py):
    blender --background tools/gini/gini.blend --python tools/gini/animate_gini.py

Outputs public/gini/gini.glb — the asset the website loads.

Clip names, morph-target names and budgets all follow
docs/GINI_3D_MODEL_SPEC.md, so a hand-made replacement model from a 3D artist
can drop into the same code with no changes.
"""

import bpy
import math
import os
from mathutils import Vector

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
OUT_GLB = os.path.join(REPO_ROOT, "public", "gini", "gini.glb")

R = math.radians
FPS = 30


def rig():
    return bpy.data.objects["gini_rig"]


def body():
    return bpy.data.objects["gini_body"]


# ─────────────────────────────────────────────────────────────────────────────
# Morph targets (spec §7)
#
# The head is joined into one body mesh, so face shape keys are built by
# selecting vertices spatially (near the mouth / near each eye) and displacing
# them. Crude next to a hand-sculpted blendshape, but it is reproducible and it
# gives the renderer real morph targets with the correct names.
# ─────────────────────────────────────────────────────────────────────────────
MOUTH = Vector((0, -0.105, 1.575))
EYE_L = Vector((0.052, -0.092, 1.648))
EYE_R = Vector((-0.052, -0.092, 1.648))


def ensure_basis(ob):
    if not ob.data.shape_keys:
        ob.shape_key_add(name="Basis", from_mix=False)


def add_shape(ob, name, centre, radius, fn):
    """Displace verts within `radius` of `centre` using fn(v, falloff)."""
    ensure_basis(ob)
    key = ob.shape_key_add(name=name, from_mix=False)
    for i, v in enumerate(ob.data.vertices):
        d = (v.co - centre).length
        if d < radius:
            f = 1.0 - (d / radius)          # linear falloff
            key.data[i].co = v.co + fn(v.co, f)
    return key


def build_morphs():
    ob = body()
    ensure_basis(ob)

    # Expressions
    add_shape(ob, "smile", MOUTH, 0.075,
              lambda co, f: Vector((0, -0.004 * f, 0.011 * f)))
    add_shape(ob, "frown", MOUTH, 0.075,
              lambda co, f: Vector((0, -0.002 * f, -0.012 * f)))
    add_shape(ob, "surprise", MOUTH, 0.070,
              lambda co, f: Vector((0, -0.008 * f, -0.017 * f)))
    add_shape(ob, "angry", EYE_L, 0.060,
              lambda co, f: Vector((0, 0, -0.008 * f)))

    for nm, c in (("blinkLeft", EYE_L), ("blinkRight", EYE_R)):
        add_shape(ob, nm, c, 0.042,
                  lambda co, f: Vector((0, -0.003 * f, -0.010 * f)))

    # Visemes — the reduced set the spec allows as a minimum, plus a few more.
    visemes = {
        "viseme_sil": 0.000,
        "viseme_PP": -0.004,   # lips closed / pressed
        "viseme_aa":  0.020,   # open
        "viseme_E":   0.011,
        "viseme_I":   0.007,
        "viseme_O":   0.016,
        "viseme_U":   0.010,
    }
    for nm, drop in visemes.items():
        add_shape(ob, nm, MOUTH, 0.062,
                  lambda co, f, d=drop: Vector((0, -abs(d) * 0.35 * f, -d * f)))

    print(f"[gini] morph targets = {len(ob.data.shape_keys.key_blocks) - 1}")


# ─────────────────────────────────────────────────────────────────────────────
# Animation helpers
# ─────────────────────────────────────────────────────────────────────────────
def new_action(name):
    arm = rig()
    if not arm.animation_data:
        arm.animation_data_create()
    act = bpy.data.actions.new(name)
    act.use_fake_user = True          # exporter must keep it
    arm.animation_data.action = act
    return act


def key(bone, frame, rot=None, loc=None):
    pb = rig().pose.bones[bone]
    pb.rotation_mode = "XYZ"
    if rot is not None:
        pb.rotation_euler = [R(a) for a in rot]
        pb.keyframe_insert("rotation_euler", frame=frame)
    if loc is not None:
        pb.location = Vector(loc)
        pb.keyframe_insert("location", frame=frame)


def wingbeat(frames, up, down, phase=0):
    """Symmetric wing flap keys across the 3 bones per side."""
    for f, amt in frames:
        for side, sx in (("L", 1), ("R", -1)):
            key(f"wing_{side}_01", f, rot=(0, 0, sx * amt))
            key(f"wing_{side}_02", f, rot=(0, 0, sx * amt * 0.7))
            key(f"wing_{side}_03", f, rot=(0, 0, sx * amt * 0.4))


def tail_wave(frames, amp):
    for f, phase in frames:
        for i in range(5):
            a = amp * math.sin(phase + i * 0.7)
            key(f"tail_{i+1:02d}", f, rot=(a, 0, 0))


def bob(frames):
    for f, dz in frames:
        key("hips", f, loc=(0, 0, dz))


# ─────────────────────────────────────────────────────────────────────────────
# The 10 clips (spec §6)
# ─────────────────────────────────────────────────────────────────────────────
def clip_idle():
    """3 s hover, seamless loop."""
    new_action("idle")
    wingbeat([(1, 14), (23, -10), (45, 14), (68, -10), (90, 14)], 14, -10)
    bob([(1, 0.0), (23, 0.022), (45, 0.0), (68, 0.022), (90, 0.0)])
    tail_wave([(1, 0.0), (45, 1.2), (90, 0.0)], 7)
    for f in (1, 45, 90):
        key("head", f, rot=(0, 0, 0))


def clip_fly():
    """2 s forward flight, stronger beat, body pitched forward."""
    new_action("fly")
    wingbeat([(1, 38), (15, -26), (30, 38), (45, -26), (60, 38)], 38, -26)
    bob([(1, 0.0), (15, 0.05), (30, 0.0), (45, 0.05), (60, 0.0)])
    for f in (1, 30, 60):
        key("spine", f, rot=(14, 0, 0))
        key("head", f, rot=(-12, 0, 0))
    tail_wave([(1, 0.0), (30, 1.6), (60, 0.0)], 12)


def clip_talk():
    """3 s speaking gestures + jaw motion."""
    new_action("talk")
    wingbeat([(1, 12), (45, -6), (90, 12)], 12, -6)
    for f, a in ((1, 0), (10, -13), (20, -3), (32, -15), (44, -4),
                 (56, -12), (70, -3), (82, -10), (90, 0)):
        key("jaw", f, rot=(a, 0, 0))
    for f, a in ((1, 0), (30, -16), (60, 8), (90, 0)):
        key("arm_R", f, rot=(0, 0, a))
        key("forearm_R", f, rot=(0, 0, a * 0.6))
    bob([(1, 0.0), (45, 0.015), (90, 0.0)])


def clip_point():
    """2 s — points forward, then holds."""
    new_action("point")
    key("arm_R", 1, rot=(0, 0, 0)); key("arm_R", 20, rot=(-64, 0, 0)); key("arm_R", 60, rot=(-64, 0, 0))
    key("forearm_R", 1, rot=(0, 0, 0)); key("forearm_R", 20, rot=(-16, 0, 0)); key("forearm_R", 60, rot=(-16, 0, 0))
    key("head", 1, rot=(0, 0, 0)); key("head", 24, rot=(-8, 0, 0)); key("head", 60, rot=(-8, 0, 0))
    wingbeat([(1, 12), (30, -4), (60, 12)], 12, -4)


def clip_happy():
    new_action("happy")
    wingbeat([(1, 10), (14, 46), (34, 30), (60, 34)], 46, 30)
    bob([(1, 0.0), (14, 0.07), (34, 0.02), (60, 0.03)])
    key("spine", 1, rot=(0, 0, 0)); key("spine", 16, rot=(-9, 0, 0)); key("spine", 60, rot=(-6, 0, 0))
    key("head", 1, rot=(0, 0, 0)); key("head", 16, rot=(-12, 0, 0)); key("head", 60, rot=(-8, 0, 0))


def clip_surprised():
    new_action("surprised")
    wingbeat([(1, 10), (6, 62), (20, 52), (45, 44)], 62, 44)
    key("spine", 1, rot=(0, 0, 0)); key("spine", 7, rot=(11, 0, 0)); key("spine", 45, rot=(6, 0, 0))
    key("head", 1, rot=(0, 0, 0)); key("head", 7, rot=(13, 0, 0)); key("head", 45, rot=(7, 0, 0))
    key("jaw", 1, rot=(0, 0, 0)); key("jaw", 8, rot=(-19, 0, 0)); key("jaw", 45, rot=(-11, 0, 0))
    bob([(1, 0.0), (7, 0.06), (45, 0.03)])


def clip_sad():
    new_action("sad")
    wingbeat([(1, 10), (30, -32), (60, -30)], -32, -30)
    key("spine", 1, rot=(0, 0, 0)); key("spine", 30, rot=(13, 0, 0)); key("spine", 60, rot=(12, 0, 0))
    key("head", 1, rot=(0, 0, 0)); key("head", 30, rot=(19, 0, 0)); key("head", 60, rot=(18, 0, 0))
    bob([(1, 0.0), (30, -0.04), (60, -0.035)])
    tail_wave([(1, 0.0), (60, 0.4)], 3)


def clip_present_book():
    """Offers the book forward — the homepage 'handing over the book' beat."""
    new_action("present_book")
    key("arm_L", 1, rot=(0, 0, 0)); key("arm_L", 30, rot=(-58, 0, 0)); key("arm_L", 90, rot=(-54, 0, 0))
    key("forearm_L", 1, rot=(0, 0, 0)); key("forearm_L", 30, rot=(-24, 0, 0)); key("forearm_L", 90, rot=(-20, 0, 0))
    key("head", 1, rot=(0, 0, 0)); key("head", 34, rot=(6, 0, 0)); key("head", 90, rot=(4, 0, 0))
    wingbeat([(1, 12), (45, 22), (90, 14)], 22, 14)
    bob([(1, 0.0), (45, 0.02), (90, 0.0)])


def clip_vanish():
    """1.5 s — curls up and sinks as the shader dissolves him."""
    new_action("vanish")
    wingbeat([(1, 14), (12, 54), (45, -40)], 54, -40)
    key("spine", 1, rot=(0, 0, 0)); key("spine", 45, rot=(26, 0, 0))
    key("head", 1, rot=(0, 0, 0)); key("head", 45, rot=(22, 0, 0))
    bob([(1, 0.0), (14, 0.09), (45, -0.10)])
    tail_wave([(1, 0.0), (45, 2.4)], 16)


def clip_appear():
    new_action("appear")
    wingbeat([(1, -40), (30, 54), (45, 14)], 54, 14)
    key("spine", 1, rot=(26, 0, 0)); key("spine", 45, rot=(0, 0, 0))
    key("head", 1, rot=(22, 0, 0)); key("head", 45, rot=(0, 0, 0))
    bob([(1, -0.10), (30, 0.07), (45, 0.0)])


CLIPS = [clip_idle, clip_fly, clip_talk, clip_point, clip_happy,
         clip_surprised, clip_sad, clip_present_book, clip_vanish, clip_appear]


# ─────────────────────────────────────────────────────────────────────────────
# Export
# ─────────────────────────────────────────────────────────────────────────────
def export():
    os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=OUT_GLB,
        export_format="GLB",
        export_animation_mode="ACTIONS",   # every action becomes a named clip
        export_animations=True,
        export_morph=True,
        export_skins=True,
        export_apply=True,                 # apply modifiers (solidify on wings)
        export_yup=True,                   # spec §4: +Y up, -Z forward
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )


def main():
    bpy.context.scene.render.fps = FPS
    build_morphs()

    bpy.context.view_layer.objects.active = rig()
    bpy.ops.object.mode_set(mode="POSE")
    for c in CLIPS:
        c()
    bpy.ops.object.mode_set(mode="OBJECT")

    print(f"[gini] actions = {[a.name for a in bpy.data.actions]}")

    # Persist the actions back into the .blend. Without this the clips live only
    # in this process: the .glb gets them, but the saved source file does not —
    # so the preview render (and any later edit) opens a rig with no animation.
    bpy.ops.wm.save_mainfile()
    print("[gini] saved actions into gini.blend")

    export()
    size = os.path.getsize(OUT_GLB) / 1_000_000
    print(f"[gini] exported {OUT_GLB}  ({size:.2f} MB)")


if __name__ == "__main__":
    main()
