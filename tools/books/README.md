# Free book publishing

Every PDF in `public/downloads/books` must come through this preparation step.
Originals stay outside the repository and are never overwritten.

Run with Python and PyMuPDF:

```
python tools/books/prepare_downloads.py <local-source-manifest.json> <local-QA-folder>
node tools/books/check-downloads.mjs
```

Each manifest item contains `slug`, `title`, `subject`, and the absolute `source`
PDF path. An existing approved `backCover: "simple"` choice replaces only the
Radio Navigation back cover. A cover change requires the Captain's choice.
To regenerate one registered book, append `--only <slug>`.

Preparation preserves original study-page text and artwork, imports original
URI/internal links, retains or derives chapter bookmarks, adds a watermark in
page content, and adds clickable website/YouTube/Instagram/Telegram links below
every page. The footer adds space, rather than covering the source page. PDFs
open without a password and allow reading, printing and accessible text copying.
Editing restrictions deter casual edits in complying readers. Neither permissions,
watermarks nor bookmarks are permanently unremovable by PDF editing tools.

Open the rendered QA samples before publication. Review source edition and any
outstanding content holds separately; these mechanical checks do not certify
teaching accuracy. The generated catalog and preparation record are committed
with the PDFs. The build guard checks every PDF against that exact record, so an
unregistered or changed book blocks publication rather than silently bypassing
the every-page treatment.
