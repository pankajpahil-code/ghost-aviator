"""insert_figures.py - place the cropped textbook figures into the Met notes, under the right heading.

    python tools/met-notes-audit/insert_figures.py <final.json> --site            # site copies (absolute /content paths)
    python tools/met-notes-audit/insert_figures.py <final.json> --d <DGCA Notes>  # D: standalone copies (relative img/)
    add --write to change files; default is a dry run that reports unmatched headings.

Each figure goes after the first block that follows its matching <h2> heading. Images are copied to a
content-hashed file (fig-<sha1>.png|jpg). Photographs are stored as JPEG, diagrams as PNG. Re-running is
safe: a figure whose hashed file name is already referenced in the chapter is skipped.
"""
import hashlib, html, io, json, os, re, shutil, sys
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from figure_plan import P

final = {(x["chapter"], x["fig"]): x for x in json.load(open(sys.argv[1], encoding="utf-8"))}
write = "--write" in sys.argv
site = "--site" in sys.argv
dmode = "--d" in sys.argv
dpath = sys.argv[sys.argv.index("--d") + 1] if dmode else None

FIG = ('<figure class="ga-fig" style="margin:18px auto;text-align:center;page-break-inside:avoid;">'
       '<img src="{src}" alt="{alt}" loading="lazy" style="max-width:min(100%,680px);max-height:520px;width:auto;height:auto;'
       'display:block;margin:0 auto;border-radius:6px;">'
       '<figcaption style="font-size:0.9em;color:#555;margin-top:6px;">{cap}</figcaption></figure>')


def stored(fn, outdir):
    """Photographs -> JPEG, line art -> palette PNG; whichever is smaller wins, long side capped at 1300 px."""
    import numpy as np
    im = Image.open(fn).convert("RGB")
    if max(im.size) > 1300:
        r = 1300 / max(im.size)
        im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    a = np.asarray(im.convert("L"))
    white = (a > 245).mean()
    jb = io.BytesIO(); im.save(jb, "JPEG", quality=82, optimize=True, progressive=True)
    pb = io.BytesIO(); im.quantize(colors=96, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(pb, "PNG", optimize=True)
    lineart = white > 0.45
    if lineart and len(pb.getvalue()) <= len(jb.getvalue()) * 1.6:
        data, ext = pb.getvalue(), "png"
    elif len(jb.getvalue()) < len(pb.getvalue()):
        data, ext = jb.getvalue(), "jpg"
    else:
        data, ext = pb.getvalue(), "png"
    name = "fig-%s.%s" % (hashlib.sha1(data).hexdigest()[:16], ext)
    if write:
        os.makedirs(outdir, exist_ok=True)
        open(os.path.join(outdir, name), "wb").write(data)
    return name, len(data)


def block_end(s, i):
    """index just past the first element that starts at/after i (skipping whitespace/comments)."""
    m = re.compile(r"\s*(?:<!--.*?-->\s*)*", re.S).match(s, i)
    j = m.end()
    t = re.match(r"<(\w+)", s[j:])
    if not t:
        return i
    tag = t.group(1).lower()
    if tag in ("h1", "h2", "h3"):
        return i
    if tag in ("hr", "img", "br"):
        return j + s[j:].index(">") + 1
    depth = 0
    for mm in re.finditer(r"<%s\b|</%s>" % (tag, tag), s[j:], re.I):
        depth += 1 if not mm.group(0).startswith("</") else -1
        if depth == 0:
            return j + mm.end()
    return i


total = {}
unmatched = []
for ch in sorted({c for c, *_ in P}):
    n = int(ch.split("-")[1])
    p = ("public/content/meteorology/met-%d/notes.html" % n) if site else os.path.join(
        dpath, [f for f in os.listdir(dpath) if f.startswith("Ch%02d_" % n)][0])
    s = open(p, encoding="utf-8", newline="").read()
    heads = [(m.start(), m.end(), re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", m.group(1)))).strip())
             for m in re.finditer(r"<h2[^>]*>(.*?)</h2>", s, re.S)]
    outdir = ("public/content/meteorology/met-%d/img" % n) if site else os.path.join(dpath, "img")
    edits = []   # (pos, html)
    for c, fig, rx, cap, alt in P:
        if c != ch:
            continue
        x = final[(c, fig)]
        name, size = stored(x["file"].replace("\\", "/") if os.path.isabs(x["file"]) else os.path.join("D:/pk/met-figures", x["file"]), outdir)
        if name in s:
            continue
        hit = next((h for h in heads if re.search(rx, h[2], re.I)), None)
        if not hit:
            unmatched.append((c, fig, rx)); continue
        pos = block_end(s, hit[1])
        src = ("/content/meteorology/met-%d/img/%s" % (n, name)) if site else ("img/" + name)
        edits.append((pos, FIG.format(src=src, alt=html.escape(alt, quote=True), cap=html.escape(cap, quote=False)), fig))
        total[c] = total.get(c, 0) + 1
    # apply from the end; figures with the same anchor keep plan order
    byp = {}
    for pos, h, fig in edits:
        byp.setdefault(pos, []).append(h)
    for pos in sorted(byp, reverse=True):
        s = s[:pos] + "\n" + "\n".join(byp[pos]) + "\n" + s[pos:]
    if write and edits:
        open(p, "w", encoding="utf-8", newline="").write(s)
print("figures placed per chapter:", total, "sum", sum(total.values()))
print("UNMATCHED:", unmatched)
