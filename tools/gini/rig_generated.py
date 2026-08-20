"""
Rig the AI-generated Ghost Aviator mesh with the Gini armature.

    blender --background --python tools/gini/rig_generated.py -- <path-to.glb>

Then animate + export exactly as before:
    blender --background tools/gini/gini_rigged.blend --python tools/gini/animate_gini.py

WHAT THIS DOES, AND WHY EACH STEP EXISTS
1. Import the generated .glb. Image-to-3D output arrives in an arbitrary scale,
   arbitrary orientation, and centred on its own bounding box - never on the
   convention the spec requires.
2. NORMALISE: rotate upright, scale to 1.8 m tall, drop feet to Z=0, centre on
   X/Y. The armature in build_gini.py has bone positions expressed in metres for
   a 1.8 m figure, so the mesh must be brought to that frame - not the reverse.
3. Clean: merge doubles and recalculate normals. Marching-cubes output is watertight
   but frequently has coincident verts that make automatic weighting behave oddly.
4. Bind with automatic weights, reusing the SAME bone names the animation clips
   and the website code expect.

The armature, bone names and clip names are imported from build_gini so there is
exactly one definition of the rig in this repo. If the rig changes, it changes in
one place and both the procedural and the generated character follow.
"""

import bpy
import bmesh
import math
import os
import sys

HERE = os.path.dirname(os.path.realpath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

from build_gini import build_armature, bind, OUT_BLEND  # noqa: E402

TARGET_HEIGHT = 1.8          # metres, per docs/GINI_3D_MODEL_SPEC.md
OUT_RIGGED = os.path.join(HERE, "gini_rigged.blend")


def argv_glb():
    """Path to the .glb, passed after a bare `--`."""
    if "--" in sys.argv:
        rest = sys.argv[sys.argv.index("--") + 1:]
        if rest:
            return rest[0]
    default = os.path.join(HERE, "out", "gini_lite.glb")
    return default


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.render.fps = 30
    bpy.context.scene.unit_settings.system = "METRIC"


def import_glb(path):
    if not os.path.exists(path):
        raise SystemExit(f"[gini] no such file: {path}")
    bpy.ops.import_scene.gltf(filepath=path)
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    if not meshes:
        raise SystemExit("[gini] the .glb contained no mesh")
    # Generated output is usually one mesh; join anything extra.
    bpy.ops.object.select_all(action="DESELECT")
    for m in meshes:
        m.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    ob = bpy.context.active_object
    ob.name = "gini_body"
    print(f"[gini] imported {len(ob.data.polygons)} polys from {os.path.basename(path)}")
    return ob


def normalise(ob):
    """Upright, 1.8 m tall, feet at Z=0, centred on X/Y."""
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob

    # glTF is Y-up; Blender's importer converts to Z-up, but generated meshes are
    # frequently still lying down. Decide from the bounding box: the character is
    # taller than it is deep, so whichever axis is longest should become Z.
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    dims = list(ob.dimensions)
    longest = dims.index(max(dims))
    if longest == 1:                       # lying along Y
        ob.rotation_euler = (math.radians(90), 0, 0)
        print("[gini] rotating upright (was lying along Y)")
    elif longest == 0:                     # lying along X
        ob.rotation_euler = (0, math.radians(90), 0)
        print("[gini] rotating upright (was lying along X)")
    bpy.ops.object.transform_apply(rotation=True)

    scale = TARGET_HEIGHT / ob.dimensions.z
    ob.scale = (scale, scale, scale)
    bpy.ops.object.transform_apply(scale=True)

    # Feet to the floor, centred on X/Y.
    xs = [ob.matrix_world @ v.co for v in ob.data.vertices]
    min_z = min(v.z for v in xs)
    cx = (max(v.x for v in xs) + min(v.x for v in xs)) / 2
    cy = (max(v.y for v in xs) + min(v.y for v in xs)) / 2
    ob.location = (-cx, -cy, -min_z)
    bpy.ops.object.transform_apply(location=True)

    print(f"[gini] normalised: dims={tuple(round(d,3) for d in ob.dimensions)}")
    return ob


def clean(ob):
    """Weld coincident verts and fix normals before weighting."""
    me = ob.data
    bm = bmesh.new()
    bm.from_mesh(me)
    before = len(bm.verts)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    me.update()
    print(f"[gini] welded {before - len(me.vertices)} duplicate verts, {len(me.polygons)} polys remain")
    for p in me.polygons:
        p.use_smooth = True


def fit_wing_bones(arm, ob):
    """Move the wing bones onto the mesh's ACTUAL wings.

    build_gini.py places wing bones where the *procedural* character's wings
    were. The generated mesh has its own geometry, so those bones can end up
    outside the wing entirely — automatic weights then assign the wing verts to
    the chest, and the wings never beat no matter what the clips say.

    So derive the bones from the mesh: for each side, take the vertices out
    beyond a quarter-span and above mid-height, and lay three bones from the
    shoulder out to the furthest point.
    """
    import mathutils

    verts = [ob.matrix_world @ v.co for v in ob.data.vertices]
    height = max(v.z for v in verts)
    span = max(abs(v.x) for v in verts)
    print(f"[gini] mesh height={height:.2f} half-span={span:.2f}")

    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")
    eb = arm.data.edit_bones

    for side, sx in (("L", 1), ("R", -1)):
        cand = [v for v in verts if sx * v.x > span * 0.30 and v.z > height * 0.45]
        if len(cand) < 20:
            print(f"[gini] wing_{side}: only {len(cand)} candidate verts - leaving bones as built")
            continue

        tip = max(cand, key=lambda v: sx * v.x)
        shoulder = mathutils.Vector((sx * span * 0.12, 0.04, height * 0.80))
        mid = shoulder.lerp(mathutils.Vector(tip), 0.55)
        mid.z += height * 0.04                      # wings arch up at the elbow
        # Trailing edge: the lowest vert reasonably far out, gives bone 03 something real.
        outer = [v for v in cand if sx * v.x > span * 0.55]
        trail = min(outer, key=lambda v: v.z) if outer else tip

        for name, head, tail in (
            (f"wing_{side}_01", shoulder, mid),
            (f"wing_{side}_02", mid, mathutils.Vector(tip)),
            (f"wing_{side}_03", mathutils.Vector(tip), mathutils.Vector(trail)),
        ):
            b = eb.get(name)
            if b:
                b.head, b.tail = head, tail
        print(f"[gini] wing_{side}: {len(cand)} verts, tip=({tip.x:.2f},{tip.y:.2f},{tip.z:.2f})")

    bpy.ops.object.mode_set(mode="OBJECT")


def report_wing_weights(ob):
    """Prove the wings are actually driven, instead of assuming it."""
    groups = {g.name: g.index for g in ob.vertex_groups}
    wing_idx = {i for n, i in groups.items() if n.startswith("wing_")}
    if not wing_idx:
        print("[gini] WARNING: no wing_* vertex groups exist at all")
        return 0
    n = 0
    for v in ob.data.vertices:
        if any(g.group in wing_idx and g.weight > 0.15 for g in v.groups):
            n += 1
    pct = 100.0 * n / len(ob.data.vertices)
    print(f"[gini] wing-driven verts: {n} / {len(ob.data.vertices)} = {pct:.1f}%")
    if pct < 3:
        print("[gini] WARNING: wings are barely weighted - they will not beat")
    return n


def assign_materials(ob):
    """Colour the generated mesh.

    The shape pass produces untextured geometry — the character renders as white
    marble. Hunyuan's texture stage needs CUDA extensions that would not build on
    the Colab runtime, so instead we colour by REGION, using information we
    already have rather than inventing UVs:

      * wings   - the vertex groups the rig already proved (43% of the mesh)
      * skin    - high and central: head, horns, face
      * leather - everything else: jacket, trousers, boots

    Palette is read off the reference art, not invented: near-black leather,
    pale grey-green skin, warm brown membrane.
    """
    mats = []
    for name, rgba, rough in (
        ("gini_leather", (0.055, 0.045, 0.038, 1), 0.78),
        ("gini_skin",    (0.46, 0.50, 0.43, 1),    0.55),
        ("gini_wing",    (0.30, 0.125, 0.055, 1),  0.85),
    ):
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        b = m.node_tree.nodes["Principled BSDF"]
        b.inputs["Base Color"].default_value = rgba
        b.inputs["Roughness"].default_value = rough
        mats.append(m)

    ob.data.materials.clear()
    for m in mats:
        ob.data.materials.append(m)
    LEATHER, SKIN, WING = 0, 1, 2

    groups = {g.name: g.index for g in ob.vertex_groups}
    wing_idx = {i for n, i in groups.items() if n.startswith("wing_")}

    verts = ob.data.vertices
    height = max((ob.matrix_world @ v.co).z for v in verts)

    is_wing = [any(g.group in wing_idx and g.weight > 0.25 for g in v.groups) for v in verts]
    co = [ob.matrix_world @ v.co for v in verts]
    is_skin = [(c.z > height * 0.80 and abs(c.x) < 0.16) for c in co]

    n_w = n_s = 0
    for p in ob.data.polygons:
        vs = p.vertices
        if sum(is_wing[i] for i in vs) > len(vs) / 2:
            p.material_index = WING
            n_w += 1
        elif sum(is_skin[i] for i in vs) > len(vs) / 2:
            p.material_index = SKIN
            n_s += 1
        else:
            p.material_index = LEATHER
    total = len(ob.data.polygons)
    print(f"[gini] materials: wing={n_w} skin={n_s} leather={total-n_w-n_s} of {total}")


def main():
    path = argv_glb()
    reset()
    ob = import_glb(path)
    normalise(ob)
    clean(ob)

    arm = build_armature()
    fit_wing_bones(arm, ob)
    bind(ob, arm)
    report_wing_weights(ob)
    assign_materials(ob)

    bpy.ops.wm.save_as_mainfile(filepath=OUT_RIGGED)
    print(f"[gini] bones={len(arm.data.bones)}")
    print(f"[gini] saved {OUT_RIGGED}")
    print("[gini] next: blender --background tools/gini/gini_rigged.blend "
          "--python tools/gini/animate_gini.py")


if __name__ == "__main__":
    main()
