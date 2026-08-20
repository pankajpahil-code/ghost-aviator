"""
Gini — the Ghost Aviator mascot, built / rigged / animated procedurally in Blender.

Run headless:
    blender --background --python tools/gini/build_gini.py

Outputs:
    public/gini/gini.glb          (the web asset)
    tools/gini/gini.blend         (editable source, per the model spec)

WHY A SCRIPT AND NOT HAND-MODELLING: this has to be re-runnable. Every tweak to
proportions, colours or an animation curve is a code change we can diff and
re-export, rather than a one-off .blend nobody can reproduce. Same reasoning as
every other tool in this repo.

Targets the budgets in docs/GINI_3D_MODEL_SPEC.md — the character is seen at
150-300 px on screen, so silhouette, face and wings carry the read, not surface
detail.
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Euler

# ─────────────────────────────────────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
OUT_GLB = os.path.join(REPO_ROOT, "public", "gini", "gini.glb")
OUT_BLEND = os.path.join(SCRIPT_DIR, "gini.blend")

# Character scale: ~1.8 m tall, feet at origin, +Y up is Blender's +Z.
# (Blender is Z-up; the glTF exporter converts to the Y-up/-Z-forward the spec
# requires. Do NOT hand-rotate the mesh — let the exporter do it.)
FPS = 30


# ─────────────────────────────────────────────────────────────────────────────
# Scene helpers
# ─────────────────────────────────────────────────────────────────────────────
def reset_scene():
    """Wipe everything so the script is idempotent."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.render.fps = FPS
    bpy.context.scene.unit_settings.system = "METRIC"


def mat(name, rgba, rough=0.6, metal=0.0, emit=None, alpha=1.0):
    """A glTF-safe metallic-roughness material."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = rgba
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if emit:
        bsdf.inputs["Emission Color"].default_value = emit
        bsdf.inputs["Emission Strength"].default_value = 2.0
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        m.blend_method = "BLEND"
    return m


def add_mesh(name, verts, faces, material):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.validate()
    ob = bpy.data.objects.new(name, me)
    ob.data.materials.append(material)
    bpy.context.collection.objects.link(ob)
    return ob


def prim(kind, name, material, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), **kw):
    """Add a primitive, then apply loc/rot/scale into the mesh data."""
    if kind == "sphere":
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=kw.get("seg", 16), ring_count=kw.get("ring", 10),
            radius=kw.get("r", 1), location=loc)
    elif kind == "cube":
        bpy.ops.mesh.primitive_cube_add(size=kw.get("size", 1), location=loc)
    elif kind == "cyl":
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=kw.get("seg", 12), radius=kw.get("r", 1),
            depth=kw.get("d", 1), location=loc)
    elif kind == "cone":
        bpy.ops.mesh.primitive_cone_add(
            vertices=kw.get("seg", 10), radius1=kw.get("r1", 1),
            radius2=kw.get("r2", 0), depth=kw.get("d", 1), location=loc)
    elif kind == "torus":
        bpy.ops.mesh.primitive_torus_add(
            major_radius=kw.get("R", 1), minor_radius=kw.get("r", 0.2),
            major_segments=kw.get("mseg", 16), minor_segments=kw.get("nseg", 8),
            location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.rotation_euler = Euler(rot)
    ob.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    ob.data.materials.clear()
    ob.data.materials.append(material)
    return ob


def shade_smooth(ob):
    for p in ob.data.polygons:
        p.use_smooth = True


# ─────────────────────────────────────────────────────────────────────────────
# Materials  (≤4 per the spec)
# ─────────────────────────────────────────────────────────────────────────────
def build_materials():
    # Values pushed well apart after the first render came back as one flat
    # mid-tone: leather, skin and wing were nearly indistinguishable. At the
    # 150-300 px the character is actually seen, tonal separation between
    # materials is what carries the read — not surface detail.
    return {
        "skin":  mat("gini_skin",  (0.66, 0.70, 0.60, 1), rough=0.50),
        "leather": mat("gini_leather", (0.075, 0.060, 0.045, 1), rough=0.80),
        "wing":  mat("gini_wing",  (0.36, 0.145, 0.055, 1), rough=0.85),
        "metal": mat("gini_metal", (0.80, 0.66, 0.28, 1), rough=0.25, metal=1.0,
                     emit=(1.0, 0.35, 0.08, 1)),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Geometry
# ─────────────────────────────────────────────────────────────────────────────
def build_body(M):
    """Torso, head, limbs, horns, goggles, tail, wings. Returns list of objects."""
    parts = []

    # --- Head: slightly elongated sphere, jaw tapered ---
    head = prim("sphere", "head", M["skin"], loc=(0, 0, 1.62),
                r=0.115, seg=20, ring=12, scale=(1.0, 0.92, 1.08))
    shade_smooth(head)
    parts.append(head)

    # Horns — swept back, the character's strongest silhouette cue
    for side, sx in (("L", 1), ("R", -1)):
        horn = prim("cone", "horn_" + side, M["skin"],
                    loc=(sx * 0.072, -0.012, 1.72), r1=0.026, r2=0.004, d=0.15,
                    rot=(math.radians(-28), 0, math.radians(sx * 16)), seg=8)
        shade_smooth(horn)
        parts.append(horn)

    # Goggles on the brow — two rings + a strap
    for side, sx in (("L", 1), ("R", -1)):
        g = prim("torus", "goggle_" + side, M["metal"],
                 loc=(sx * 0.052, -0.088, 1.665), R=0.040, r=0.013,
                 rot=(math.radians(90), 0, 0), mseg=14, nseg=6)
        shade_smooth(g)
        parts.append(g)
    strap = prim("cyl", "goggle_strap", M["leather"], loc=(0, 0.02, 1.668),
                 r=0.121, d=0.030, rot=(math.radians(90), 0, 0), seg=18)
    parts.append(strap)

    # --- Torso: flight jacket, tapered ---
    torso = prim("cyl", "torso", M["leather"], loc=(0, 0, 1.28),
                 r=0.145, d=0.52, seg=16, scale=(1.0, 0.78, 1.0))
    shade_smooth(torso)
    parts.append(torso)

    # Fur collar
    collar = prim("torus", "collar", M["skin"], loc=(0, 0, 1.512),
                  R=0.108, r=0.040, mseg=16, nseg=8, scale=(1.0, 0.82, 0.7))
    shade_smooth(collar)
    parts.append(collar)

    # Hips
    hips = prim("cyl", "hips", M["leather"], loc=(0, 0, 0.98),
                r=0.128, d=0.20, seg=14, scale=(1.0, 0.80, 1.0))
    shade_smooth(hips)
    parts.append(hips)

    # --- Arms & legs ---
    for side, sx in (("L", 1), ("R", -1)):
        # NOTE the sign. Rotating a Z-aligned cylinder about +Y swings its lower
        # end toward -X, so the original +sx tilt folded both arms INWARD across
        # the chest (visible in the first render). Negating splays them outward
        # into a natural hanging pose.
        up = prim("cyl", f"upperarm_{side}", M["leather"],
                  loc=(sx * 0.196, 0, 1.36), r=0.050, d=0.30,
                  rot=(0, math.radians(-sx * 14), 0), seg=10)
        shade_smooth(up); parts.append(up)

        fore = prim("cyl", f"forearm_{side}", M["leather"],
                    loc=(sx * 0.258, 0, 1.10), r=0.042, d=0.28,
                    rot=(0, math.radians(-sx * 8), 0), seg=10)
        shade_smooth(fore); parts.append(fore)

        hand = prim("sphere", f"hand_{side}", M["skin"],
                    loc=(sx * 0.285, 0, 0.945), r=0.050, seg=10, ring=7,
                    scale=(0.85, 1.0, 1.15))
        shade_smooth(hand); parts.append(hand)

        thigh = prim("cyl", f"thigh_{side}", M["leather"],
                     loc=(sx * 0.072, 0, 0.74), r=0.058, d=0.40, seg=10)
        shade_smooth(thigh); parts.append(thigh)

        shin = prim("cyl", f"shin_{side}", M["leather"],
                    loc=(sx * 0.072, 0, 0.36), r=0.048, d=0.40, seg=10)
        shade_smooth(shin); parts.append(shin)

        boot = prim("cube", f"boot_{side}", M["leather"],
                    loc=(sx * 0.072, -0.030, 0.085), size=1,
                    scale=(0.115, 0.185, 0.17))
        parts.append(boot)

    # --- Tail: a CONTINUOUS tapering tail ---
    # The first version placed one sphere per bone (5, spaced 0.105) and the
    # radius tapered to 0.020 — far smaller than the gap, so it rendered as a
    # row of disconnected floating balls. Overlap is what makes it read as a
    # tail, so step finely enough that consecutive spheres always intersect.
    N_TAIL = 18
    for i in range(N_TAIL):
        t = i / (N_TAIL - 1.0)
        seg = prim("sphere", f"tailseg_{i+1:02d}", M["skin"],
                   loc=(0, 0.14 + t * 0.42, 0.98 - t * 0.46),
                   r=0.056 - t * 0.034, seg=8, ring=5)
        shade_smooth(seg)
        parts.append(seg)

    # --- Wings: low-poly membrane planes (alpha-free, per budget) ---
    parts += build_wings(M)
    return parts


def build_wings(M):
    """Bat-style membrane wings built as explicit low-poly meshes."""
    out = []
    for side, sx in (("L", 1), ("R", -1)):
        # Root at the shoulder blade, three finger-struts sweeping out/back.
        rx, rz = sx * 0.11, 1.42
        verts = [
            (rx, 0.06, rz),                        # 0 root
            (sx * 0.52, 0.10, rz + 0.30),          # 1 elbow
            (sx * 0.96, 0.16, rz + 0.40),          # 2 tip
            (sx * 0.86, 0.22, rz - 0.12),          # 3 mid trailing
            (sx * 0.60, 0.26, rz - 0.44),          # 4 lower claw
            (sx * 0.26, 0.18, rz - 0.34),          # 5 inner trailing
        ]
        faces = [(0, 1, 3), (1, 2, 3), (0, 3, 5), (3, 4, 5)]
        w = add_mesh(f"wing_{side}", verts, faces, M["wing"])
        # Thin solidify so the membrane catches light from both sides.
        # It MUST be applied here: join() discards the modifier stack of every
        # source object, keeping only the target's — so leaving it unapplied
        # silently produced single-sided paper wings in the export.
        solid = w.modifiers.new("solid", "SOLIDIFY")
        solid.thickness = 0.012
        bpy.ops.object.select_all(action="DESELECT")
        w.select_set(True)
        bpy.context.view_layer.objects.active = w
        bpy.ops.object.modifier_apply(modifier="solid")
        out.append(w)
    return out


def build_props(M):
    """Trident and book as SEPARATE named nodes (spec §8)."""
    # Trident — shaft + three prongs, held in the right hand
    shaft = prim("cyl", "prop_trident", M["metal"], loc=(-0.30, 0, 1.06),
                 r=0.013, d=1.62, seg=8)
    shade_smooth(shaft)
    for i, dx in enumerate((-0.052, 0.0, 0.052)):
        p = prim("cone", f"_prong{i}", M["metal"],
                 loc=(-0.30 + dx, 0, 1.94), r1=0.017, r2=0.001, d=0.20, seg=6)
        shade_smooth(p)
        join(shaft, [p])

    # Book — held in the left hand, offered forward
    book = prim("cube", "prop_book", M["leather"], loc=(0.30, -0.05, 1.00),
                size=1, scale=(0.10, 0.145, 0.20))
    return shaft, book


def join(target, others):
    bpy.ops.object.select_all(action="DESELECT")
    for o in others:
        o.select_set(True)
    target.select_set(True)
    bpy.context.view_layer.objects.active = target
    bpy.ops.object.join()
    return target


# ─────────────────────────────────────────────────────────────────────────────
# Rig
# ─────────────────────────────────────────────────────────────────────────────
BONES = [
    # (name,           head,                tail,                 parent)
    ("hips",           (0, 0, 0.96),        (0, 0, 1.12),         None),
    ("spine",          (0, 0, 1.12),        (0, 0, 1.34),         "hips"),
    ("chest",          (0, 0, 1.34),        (0, 0, 1.50),         "spine"),
    ("neck",           (0, 0, 1.50),        (0, 0, 1.56),         "chest"),
    ("head",           (0, 0, 1.56),        (0, 0, 1.74),         "neck"),
    ("jaw",            (0, -0.04, 1.60),    (0, -0.11, 1.565),    "head"),
]
for _s, _x in (("L", 1), ("R", -1)):
    BONES += [
        (f"shoulder_{_s}", (_x * 0.06, 0, 1.45),  (_x * 0.15, 0, 1.44), "chest"),
        (f"arm_{_s}",      (_x * 0.15, 0, 1.44),  (_x * 0.23, 0, 1.22), f"shoulder_{_s}"),
        (f"forearm_{_s}",  (_x * 0.23, 0, 1.22),  (_x * 0.28, 0, 0.99), f"arm_{_s}"),
        (f"hand_{_s}",     (_x * 0.28, 0, 0.99),  (_x * 0.30, 0, 0.90), f"forearm_{_s}"),
        (f"thigh_{_s}",    (_x * 0.072, 0, 0.94), (_x * 0.072, 0, 0.56), "hips"),
        (f"shin_{_s}",     (_x * 0.072, 0, 0.56), (_x * 0.072, 0, 0.17), f"thigh_{_s}"),
        (f"foot_{_s}",     (_x * 0.072, 0, 0.17), (_x * 0.072, -0.11, 0.05), f"shin_{_s}"),
        # Wings: 3 bones per side (spec §5)
        (f"wing_{_s}_01",  (_x * 0.11, 0.06, 1.42), (_x * 0.52, 0.10, 1.72), "chest"),
        (f"wing_{_s}_02",  (_x * 0.52, 0.10, 1.72), (_x * 0.96, 0.16, 1.82), f"wing_{_s}_01"),
        (f"wing_{_s}_03",  (_x * 0.96, 0.16, 1.82), (_x * 0.86, 0.22, 1.30), f"wing_{_s}_02"),
    ]
# Tail: 5 bones
for _i in range(5):
    BONES.append((
        f"tail_{_i+1:02d}",
        (0, 0.14 + _i * 0.105, 0.98 - _i * 0.115),
        (0, 0.14 + (_i + 1) * 0.105, 0.98 - (_i + 1) * 0.115),
        "hips" if _i == 0 else f"tail_{_i:02d}",
    ))


def build_armature():
    bpy.ops.object.armature_add(location=(0, 0, 0))
    arm = bpy.context.active_object
    arm.name = "gini_rig"
    arm.data.name = "gini_armature"
    bpy.ops.object.mode_set(mode="EDIT")
    eb = arm.data.edit_bones
    for b in list(eb):
        eb.remove(b)
    made = {}
    for name, head, tail, parent in BONES:
        b = eb.new(name)
        b.head, b.tail = Vector(head), Vector(tail)
        made[name] = b
    for name, _h, _t, parent in BONES:
        if parent:
            made[name].parent = made[parent]
    bpy.ops.object.mode_set(mode="OBJECT")
    return arm


def bind(mesh_obj, arm):
    bpy.ops.object.select_all(action="DESELECT")
    mesh_obj.select_set(True)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")


def parent_to_bone(obj, arm, bone_name):
    """Parent a prop to a bone WITHOUT the prop teleporting.

    Assigning .parent / .parent_type / .parent_bone directly leaves the
    parent-inverse matrix as identity, so the object snaps to the bone's tail
    instead of staying where it was modelled — which is exactly why the trident
    ended up lying on the floor beside the character in the first render.
    The operator with keep_transform=True computes that inverse properly.
    """
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")
    arm.data.bones.active = arm.data.bones[bone_name]
    bpy.ops.object.parent_set(type="BONE", keep_transform=True)
    bpy.ops.object.mode_set(mode="OBJECT")


# ─────────────────────────────────────────────────────────────────────────────
# Build
# ─────────────────────────────────────────────────────────────────────────────
def main():
    reset_scene()
    M = build_materials()

    parts = build_body(M)
    body = join(parts[0], parts[1:])
    body.name = "gini_body"

    trident, book = build_props(M)
    arm = build_armature()

    # Smooth the assembled primitives. Applied at export (export_apply=True),
    # which lifts the mesh out of the faceted low-poly look.
    sub = body.modifiers.new("subsurf", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 1

    bind(body, arm)
    parent_to_bone(trident, arm, "hand_R")
    parent_to_bone(book, arm, "hand_L")

    os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)

    tri = sum(len(p.vertices) - 2 for p in body.data.polygons)
    print(f"[gini] body triangles ≈ {tri}")
    print(f"[gini] bones = {len(arm.data.bones)}")
    print(f"[gini] saved {OUT_BLEND}")


if __name__ == "__main__":
    main()
