# Ghost Aviator — "Gini" 3D Model Specification

**Client:** Capt. Pankaj Pahil — Ghost Aviator (https://ghostaviator.com)
**Purpose:** A real-time 3D character that flies around a website, talks, shows
expressions, and can be dismissed. It runs **in a web browser on budget Android
phones**, not in a game engine or a render farm.

**This is a real-time web asset.** Film/VFX or high-poly game specs will not work
here. Please read the budgets below before quoting — they are hard limits, not
preferences.

---

## 1. The character

Match the existing artwork **exactly** — same character, same costume, same
colours. Reference files supplied with this brief:

- `mascot-hero-poster.webp` — the master look (front view, full body)
- `mascot-hero.mp4` — motion/lighting reference
- `ghost-captain.webp` — alternate art

**Character:** a winged aviator — leather flight jacket with fur collar, flying
goggles worn on the brow, horns, membrane wings, a segmented tail, heavy boots.
Carries a **trident** in one hand and a **book** in the other.

**The book must be included and must keep its cover text as it appears in the
reference art.** Do not redesign, relabel, or omit it.

---

## 2. Delivery format

| Item | Requirement |
|---|---|
| **Primary deliverable** | **glTF 2.0 binary — a single `.glb` file** |
| Textures | **Embedded** in the `.glb` |
| Compression | Geometry compressed with **Draco** *or* **meshopt** |
| Also deliver | Editable source (`.blend` or `.fbx`) **with the rig intact**, plus texture source files |

**Do not deliver** FBX/OBJ/USD as the primary asset, and do not deliver a scene
with cameras, lights, backgrounds or the mountain environment. Character only.

---

## 3. Hard budgets (these decide whether the site is usable)

| Budget | Limit | Ideal |
|---|---|---|
| **Final `.glb` file size** | **≤ 8 MB** | 3–5 MB |
| **Triangles** | **≤ 60,000** | 35,000–45,000 |
| **Materials** | **≤ 4** | 3 |
| **Texture resolution** | **≤ 2048 × 2048** | 1024 for body, 2048 only if needed for the head |
| **Texture sets** | ≤ 3 | 2 |

Wing membranes, and any smoke/ghost wisps, should be **low-poly planes with
alpha textures**, not modelled geometry.

---

## 4. Scene setup (non-negotiable — glTF conventions)

- **Up axis: +Y. Forward: −Z.** (Standard glTF. Blender users: use the glTF
  exporter's default axis conversion — do not hand-rotate the mesh.)
- **Units: metres.** Character approx. **1.8 m** tall.
- **Origin at the character's feet, centred on X and Z.** The model must sit at
  world origin `(0,0,0)`.
- **Apply all transforms** before export — no leftover object-level scale or rotation.
- No baked lighting or shadows in the base colour texture. The character is
  composited over many different page backgrounds and must be lit by our scene.
- PBR **metallic-roughness** workflow (glTF standard). Not specular-glossiness.
- Emissive map for the **trident gem** and the **eyes** so they can glow.

---

## 5. Rig

A clean skinned rig, exported with the mesh.

- Standard humanoid bone hierarchy (hips → spine → chest → neck → head; arms;
  legs), **plus**:
  - **Wings:** 3–4 bones per wing
  - **Tail:** 4–6 bones
  - **Jaw:** 1 bone (for speech)
- **Max 4 bone influences per vertex.**
- Total bone count **≤ 80**.
- Bind pose: **A-pose or T-pose**.
- Bones clearly named in English (e.g. `wing_L_01`, `tail_03`, `jaw`).
- No IK constraints, drivers, or physics in the exported `.glb` — bake all
  motion into keyframes.

---

## 6. Animation clips (baked into the `.glb`, named EXACTLY as below)

30 fps. Clips marked **loop** must loop seamlessly (first and last frame match).

| Clip name | Length | Loop | Description |
|---|---|---|---|
| `idle` | 3–4 s | ✅ | Hovering in place, wings beating slowly, subtle breathing/bob |
| `fly` | 2 s | ✅ | Purposeful forward flight, stronger wingbeat |
| `talk` | 3 s | ✅ | Speaking gestures, relaxed hover |
| `point` | 2 s | ❌ | Points forward/down at something, then holds |
| `happy` | 2 s | ❌ | Pleased — smile, confident wing flare |
| `surprised` | 1.5 s | ❌ | Startled — recoil, wings snap wide, eyes wide |
| `sad` | 2 s | ❌ | Dejected — wings droop, head lowers |
| `present_book` | 3 s | ❌ | Offers/hands the book forward toward the viewer |
| `vanish` | 1.5 s | ❌ | Dissolves into smoke and disappears |
| `appear` | 1.5 s | ❌ | Materialises out of smoke (may be `vanish` reversed) |

---

## 7. Facial expressions & lip-sync (morph targets / blend shapes)

Required as **morph targets on the head mesh**, each 0→1:

**Expressions:** `smile`, `frown`, `surprise`, `angry`, `blinkLeft`, `blinkRight`

**Visemes for lip-sync** — use **Oculus/ARKit viseme naming**:
`viseme_sil`, `viseme_PP`, `viseme_FF`, `viseme_TH`, `viseme_DD`, `viseme_kk`,
`viseme_CH`, `viseme_SS`, `viseme_nn`, `viseme_RR`, `viseme_aa`, `viseme_E`,
`viseme_I`, `viseme_O`, `viseme_U`

If a full viseme set is out of scope, deliver **at minimum**: `viseme_aa`,
`viseme_E`, `viseme_O`, `viseme_U`, `viseme_PP` (closed lips), `viseme_sil`.

---

## 8. Props as separate named nodes

The **trident** and the **book** must be **separate named meshes**
(`prop_trident`, `prop_book`) parented to the correct hand bones — so they can
be shown or hidden independently in code.

---

## 9. Acceptance checklist

The model is accepted when all of the following pass:

1. `.glb` loads without errors or warnings in **https://gltf-viewer.donmccurdy.com**
2. File size, triangle, material and texture budgets in §3 are all met
3. Character stands at origin, +Y up, −Z forward, ~1.8 m tall
4. All 10 animation clips present, correctly named, and loop clips are seamless
5. Morph targets present and correctly named
6. `prop_trident` and `prop_book` exist as separately named nodes
7. Editable source file with rig is delivered
8. Renders recognisably as the reference character, book text intact

---

## 10. Notes for the artist

- The character will usually be seen **small (150–300 px on screen)** and often
  from the front or three-quarter view. Prioritise a **readable silhouette,
  clear face and expressive wings** over fine surface detail.
- Detail spent on boot buckles and jacket stitching will not be visible.
  Detail spent on **face, eyes, goggles and wing shape** will.
- The character must read clearly against both **light and dark** backgrounds.
