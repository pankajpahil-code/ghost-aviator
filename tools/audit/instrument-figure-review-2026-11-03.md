# Instrument figure repair, 3 November 2026

Filled 42 missing, intentionally withheld figure positions in instrument chapters 18-23 with 44 original SVG teaching schematics. The owner's manual was used privately to compare facts, controls and display behaviour. Its artwork is not included in this branch. The new captions explicitly identify teaching schematics; they do not claim to show exact operational layouts.

The author compared the diagrams with existing lesson text and source figures. This is an author comparison, not an independent aviation-content certification. The record in instrument-figures.json retains the reference figure's printed/PDF page and private crop coordinates for follow-up, along with the published SVG's dimensions, checksum, caption and readable text. PDF page 1 means the first file page.

Changes:

- Included the second integration stage (18.6) after the first (18.5).
- Distinguished XTK displacement from TKE angular error.
- Replaced a wrongly labelled Airbus example with a schematic of the lesson's Airbus-style colour change; put the Boeing presentation states in the Boeing section. Display examples are labelled as examples.
- Included both states of 22.4: below 1000 ft and at decision height.
- Corrected four existing flowchart captions that inherited unrelated headings.
- Added full-size SVG links, readable label disclosures and explicit image dimensions. No new script or webfont is required.

The command python tools/diagrams/instruments.py REVIEW_OUTPUT_FOLDER regenerates candidate artwork into a requested review folder. It does not update the integrity record or publish anything. Inspect a changed diagram before replacing its public SVG.

The release guard checks the artwork/caption pairs, readable labels, dimensions, full-size links and absence of stale missing-image references. The separate static-diagram guard still checks all 245 notes' local image paths. Other withheld figures remain withheld under the existing inspection policy.

The complete chapter text and the full aviation library have not received a fresh qualified independent factual review. Browser layout and integrity checks do not replace that review.
