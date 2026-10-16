# Branded notes downloads

On 16 October 2026 the Captain requested downloadable notes, per-page branding and channel links, and a site-wide live-class invitation. This authorizes these branded PDF downloads despite the older no-download guidance. Existing in-page copy and drag deterrents remain.

The source is the same sanitized `getInlineNotes()` output used by the reader. Missing or withheld figures are not restored by the PDF exporter. The renderer refuses to publish a file with failed image requests. Availability comes from `lib/notes-downloads.json`.

Rebuild in this order from the repository root:

1. `node tools/extract-notes-images.mjs`
2. `node tools/protect-notes.mjs`
3. `node tools/scrub-source-names.mjs`
4. `npx tsx tools/prepare-notes-downloads.ts`
5. `python tools/render-notes-downloads.py`
6. `python tools/combine-chart-download.py`
7. `python tools/check-notes-downloads.py`
8. Lint, production build, browser checks, then publication within the authorized scope.

The Python renderer uses PyMuPDF, Playwright and a local Chrome installation. Intermediates stay in ignored `.notes-build/` and `public/_notes-export/`; only PDFs under `public/downloads/notes/` ship. Each PDF page has a faint brand watermark, five clickable channel links and a quiet invitation to live classes in the reserved margin. The checker also changes local export-server links to their public website destinations.

For a selective re-render, pass chapter keys to the Python renderer, for example `python tools/render-notes-downloads.py air-navigation/nav-cx3-7`. This preserves the other manifest entries. Re-run the chart combiner only after re-rendering its `nav-3` cover; combining an already combined file would append the chapters twice.

The two newly written Performance drafts are held outside `public/` for the Captain's review. They are not part of this published library and have not received independent academic sign-off.
