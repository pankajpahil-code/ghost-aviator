# Notes diagram repair — 3 November 2026

This batch repairs 250 diagrams in 86 source notes documents: 110 native inline SVGs and one replacement composition chart in 28 documents and 139 Mermaid flowcharts in 69 documents, with 11 documents in both sets. Of these, 85 are currently served lesson pages; Navigation 1 is a retired document whose route redirects to the subject hub. Its source artwork was repaired but its retirement remains in place. The inventory covers all 245 source notes documents. It does not certify every aviation statement, question or raster image in that library.

## What changed

- Native teaching SVGs now live in separate, self-contained image files. Their typography and marker IDs no longer share the containing lesson's CSS and SVG namespace. Computed graphics styles are frozen into each file; dimensions reserve the correct aspect ratio.
- Browser measurements identified 22 native diagrams with clipped or overlapping labels. Label positions, callout leaders and margins were repaired, including Navigation 1, Air Regulations 2/5/6/8/12/24/25 and Meteorology 3/7. Navigation's Bangalore coordinates now have a separate callout clear of the plotted city marker. Existing numeric data and plotted positions were retained.
- Meteorology 1's arbitrary temperature zigzag was replaced with an original, explicitly qualitative thermal profile. Altitude increases upwards; temperature trends and variable boundaries are explained. The ionosphere is an overlapping ionised region, rather than another name for the thermosphere.
- All 139 Mermaid assets were rebuilt with SVG text instead of embedded HTML labels (`foreignObject`). Ampersands and comparison signs are decoded correctly. Existing labels were checked for preservation, except the intentionally corrected Meteorology 1 chart. Boundary layers in that chart use ordinary boxes, rather than decision diamonds.
- All 250 repaired diagrams have explicit dimensions, a full-size link, a visible sideways-scroll cue, a keyboard-focusable viewing region and a readable label transcript. Timeline transcripts also include their headings.
- The legacy dry-air pie chart was replaced with an original composition schematic. Modern approximate CO₂ values are distinguished from the historical multiple-choice option; that question’s answer key remains unchanged. The NOAA composition table is linked in the lesson.
- The notes and five linked Meteorology quiz explanations now qualify weather claims around the tropopause. Most ordinary weather is in the troposphere; strong thunderstorms can overshoot the tropopause, and the stratosphere is not a guarantee of clear or smooth flight. All 555 generated Meteorology question stems, options and answer indices remain unchanged.

## Verification

Chrome opened all 295 distinct SVG teaching assets referenced in the notes (250 in this batch, 44 earlier instrument schematics and one load-shift diagram). Text-bound and overlap checks returned zero remaining candidates after repairs. Contact sheets were visually reviewed for the 22 flagged native diagrams and Meteorology 1. These geometric checks are not an independent factual review.

The `portable-diagrams.mjs` release guard checks source/asset hashes, XML, intrinsic dimensions, unique lesson references, full-size links, complete transcripts, missing inline teaching SVGs, external dependencies and recurrence of the corrected weather guarantee. The existing static-flowchart and instrument-figure guards remain enabled. The 525-test suite passed. Release build and page-level verification results are recorded in the owner's release evidence outside the source tree.

## Sources for the Meteorology correction

- [NOAA: The Atmosphere](https://www.noaa.gov/jetstream/atmosphere): approximate dry-air composition, variable carbon dioxide and exclusion of water vapour.
- [NOAA: Layers of the Atmosphere](https://www.noaa.gov/jetstream/atmosphere/layers-of-atmosphere): five thermal layers, approximate boundaries, temperature trends and most weather in the troposphere.
- [NASA: Earth's Atmospheric Layers](https://www.nasa.gov/image-article/earths-atmospheric-layers-3/): thermal layers and the ionosphere's overlapping classification.
- [NASA Space Place: The Ionosphere](https://spaceplace.nasa.gov/ionosphere/en/): ionisation varies and overlaps upper atmospheric layers.
- [NASA: Spotting Severe Storms with Satellites](https://science.nasa.gov/earth/earth-observatory/spotting-severe-storms-with-satellites-149846/): thunderstorm overshooting tops can extend past the tropopause into the lower stratosphere.

The thermal diagram is a teaching schematic, not a flight-planning atmosphere or a height/temperature lookup chart. Previously withheld textbook or mismatched illustrations remain withheld. The legacy Meteorology generator was not run against its old inputs: doing so would overwrite reviewed explanations. A qualified independent review of the wider lesson library remains outstanding.
