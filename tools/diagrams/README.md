# Editing notes diagrams

Public diagrams are static SVG files. Lessons require no Mermaid runtime or JavaScript to show them.

`inline-manifest.json` tracks the 111 isolated teaching diagrams (110 converted inline drawings and one replacement composition chart). Their editable SVG fragments and captured page styles are in `inline-sources/`. `manifest.json` tracks the 139 flowcharts; their Mermaid source is in `sources/`. Asset and source hashes use UTF-8 text with LF line endings.

Render candidates into a separate review folder, from the repository root:

```text
python tools/diagrams/render-inline.py --output REVIEW_FOLDER --only nav-1-12
python tools/diagrams/render-flowcharts.py --mermaid-script PATH_TO_LOCAL_MERMAID_JS --output REVIEW_FOLDER --only content/meteorology/met-1/figs/diagram-01.svg
```

Python Playwright and installed Chrome are required. The flowchart renderer also needs a local Mermaid browser bundle; it does not fetch one or add a public runtime dependency. Omit `--only` to stage the complete respective set. These commands never replace approved public assets, lesson HTML or manifests.

Review the staged SVG in isolation and inside the lesson at phone and desktop widths. Check labels, units, arrows, clipping, scientific meaning, intrinsic dimensions, the full-size target and the readable label transcript. Only after review, copy the SVG to its public path and update the appropriate manifest hashes, dimensions and lesson reference/transcript together. Preserve source-backed content and all question answer keys unless separately reviewed.

```text
node tools/audit/static-diagrams.mjs
node tools/audit/instrument-figures.mjs
node tools/audit/portable-diagrams.mjs
```

All three guards run automatically in `npm run cf:build`. See `../audit/diagram-layout-2026-11-03.md` for scope and sources of the current repair. Do not restore raw teaching SVG blocks to lesson HTML: page typography and duplicate IDs can corrupt their appearance.
