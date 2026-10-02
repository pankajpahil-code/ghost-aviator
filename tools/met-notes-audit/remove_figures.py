"""remove_figures.py - take named figures out of the Met notes (site + D: copies) and clean up their files.

    python tools/met-notes-audit/remove_figures.py            # uses DROP below
A figure block is found by its caption, so only the intended <figure> goes. Plans are edited so a re-run of
insert_figures.py cannot put them back.
"""
import glob, html, os, re, sys

sys.path.insert(0, os.path.dirname(__file__))
import figure_plan as fp

# Europe / UK / North America / Caribbean specific charts and maps (Captain: "i dont want europe images")
DROP = {("met-13", "14.6"), ("met-13", "14.7"), ("met-14", "17.13"), ("met-14", "17.22"), ("met-14", "18.2"),
        ("met-14", "18.4"), ("met-14", "18.6"), ("met-15", "11.2"), ("met-15", "11.12"), ("met-02", "2.10"),
        ("met-06", "4.1"), ("met-06", "4.4"), ("met-18", "J275"), ("met-18", "J276"), ("met-22", "14.9"),
        ("met-22", "24.2"), ("met-22", "24.4"), ("met-22", "24.6"), ("met-27", "27.1"), ("met-14", "J128")}

SITE = "public/content/meteorology/met-%d/notes.html"
DDIR = "D:/04 Meteorology/Notes/IC Joshi met  notes claude/DGCA Notes"

caps = {}
for c, f, rx, cap, alt in fp.P:
    if (c, f) in DROP:
        caps.setdefault(c, []).append(html.escape(cap, quote=False))
print(sum(len(v) for v in caps.values()), "planned of", len(DROP))

removed = 0
for c, cl in caps.items():
    n = int(c.split("-")[1])
    d = [f for f in os.listdir(DDIR) if f.startswith("Ch%02d_" % n)][0]
    for p in (SITE % n, os.path.join(DDIR, d)):
        s = open(p, encoding="utf-8", newline="").read()
        for cap in cl:
            pat = re.compile(r'\n?<figure class="ga-fig"(?:(?!</figure>).)*?<figcaption[^>]*>' + re.escape(cap)
                             + r"</figcaption></figure>\n?", re.S)
            s, k = pat.subn("\n", s)
            removed += k
        open(p, "w", encoding="utf-8", newline="").write(s)
print("figure blocks removed (site + D:):", removed)

for pf in ("tools/met-notes-audit/figure_plan.py", "tools/met-notes-audit/jep_plan.py"):
    out = []
    for l in open(pf, encoding="utf-8").read().split("\n"):
        m = re.match(r'\s*\(\s*(?:"(met-\d+)",\s*"([^"]+)"|(\d+),\s*"(met-\d+)")', l)
        if m:
            key = (m.group(1), m.group(2)) if m.group(1) else (m.group(4), "J" + m.group(3))
            if key in DROP:
                continue
        out.append(l)
    open(pf, "w", encoding="utf-8").write("\n".join(out))

ref = set()
for f in glob.glob("public/content/meteorology/met-*/notes.html"):
    ch = os.path.basename(os.path.dirname(f))
    for m in re.finditer(r"/img/(fig-[0-9a-f]+\.\w+)", open(f, encoding="utf-8").read()):
        ref.add((ch, m.group(1)))
gone = 0
for d in glob.glob("public/content/meteorology/met-*/img"):
    ch = os.path.basename(os.path.dirname(d))
    for x in os.listdir(d):
        if x.startswith("fig-") and (ch, x) not in ref:
            os.remove(os.path.join(d, x))
            gone += 1
print("unreferenced site image files deleted:", gone)
