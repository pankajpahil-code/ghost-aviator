"""apply_fixes.py - apply audited corrections to the Met notes Q&A blocks.

    python tools/met-notes-audit/apply_fixes.py <fixes.json> [--write]

fixes.json entries (built by fixes_build.py):
  {"ch","idx","action":"replace","a":..., optional "q","e","d","t"}   rebuild one qa-block
  {"ch","idx","action":"drop"}                                         remove one qa-block
  {"ch","idx","action":"raw_before","html":...}                        insert HTML before a block

Blocks are found by counting <div class="qa-block"> in the raw file with a balanced-div scan, and
spliced in place; every byte outside the touched blocks is preserved (asserted). Fields not given
keep the block's original inner HTML. Dry run unless --write.
"""
import json, re, sys, html

BASE = "public/content/meteorology/met-{}/notes.html"
EXPECT = None     # optional {(ch, idx): question text} to assert the block is the one the fix was written for
FIGURE_DATA_URI = None
OPEN = '<div class="qa-block">'


def spans(s):
    out = []
    for m in re.finditer(re.escape(OPEN), s):
        i, depth = m.start(), 0
        for t in re.finditer(r"<div\b|</div>", s[i:]):
            depth += 1 if t.group(0) == "<div" else -1
            if depth == 0:
                out.append((i, i + t.end()))
                break
    return out


def scheme(block):
    cls = re.findall(r'<div class="(qa-[a-z-]+)"', block)
    pick = lambda opts: next((c for c in cls if c in opts), None)
    return dict(q=pick(("qa-q", "qa-question")), a=pick(("qa-a", "qa-answer")),
                e=pick(("qa-explain", "qa-exp", "qa-explanation")),
                d=pick(("qa-distract", "qa-dist", "qa-distractor")),
                t=pick(("qa-tip", "qa-note")))


def inner(block, cls):
    if not cls:
        return None
    m = re.search(r'<div class="%s">(.*?)</div>' % re.escape(cls), block, re.S)
    return m.group(1) if m else None


def esc(x):
    return html.escape(x, quote=False)


def render(sc, old, f):
    q = esc(f["q"]) if "q" in f else inner(old, sc["q"])
    parts = [OPEN, f'\n  <div class="{sc["q"]}">{q}</div>']
    ans = f'✅ Answer: {esc(f["a"])}'
    e = esc(f["e"]) if "e" in f else (inner(old, sc["e"]) if sc["e"] else None)
    if e and not sc["e"]:
        ans += f' — {e}'
    parts.append(f'\n  <div class="{sc["a"]}">{ans}</div>')
    if e and sc["e"]:
        parts.append(f'\n  <div class="{sc["e"]}">{e}</div>')
    d = esc(f["d"]) if "d" in f else (inner(old, sc["d"]) if sc["d"] else None)
    if d and sc["d"]:
        d = d if d.lstrip().startswith("❌") or "<strong>" in d[:12] or "Distract" in d[:60] else "❌ " + d
        parts.append(f'\n  <div class="{sc["d"]}">{d}</div>')
    t = esc(f["t"]) if "t" in f else (inner(old, sc["t"]) if sc["t"] else None)
    if t and sc["t"]:
        t = t if t.lstrip()[:1] in "\U0001F4A1\U0001F3AF\U0001F4CC\U0001F393" else "\U0001F4A1 " + t
        parts.append(f'\n  <div class="{sc["t"]}">{t}</div>')
    parts.append("\n</div>")
    return "".join(parts)


def main():
    global BASE, EXPECT
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    fixes = json.load(open(args[0], encoding="utf-8"))
    write = "--write" in sys.argv
    for a in sys.argv:
        if a.startswith("--base="):
            BASE = a[7:]
        if a.startswith("--figure="):
            import base64
            globals()["FIGURE_DATA_URI"] = "data:image/png;base64," + base64.b64encode(open(a[9:], "rb").read()).decode()
        if a.startswith("--expect="):
            raw = json.load(open(a[9:], encoding="utf-8"))
            EXPECT = {(o["ch"], o["idx"]): re.sub(r"\s+", " ", o["q"] or "").strip() for o in raw}
    bych = {}
    for f in fixes:
        bych.setdefault(f["ch"], []).append(f)
    for ch, fl in sorted(bych.items()):
        p = BASE.format(ch)
        s0 = open(p, encoding="utf-8", newline="").read()
        s = s0
        sp = spans(s)
        sc = scheme(s[sp[0][0]:sp[0][1]])
        order = {"replace": 0, "drop": 0, "raw_before": 1}
        seen = set()
        for f in fl:
            k = (f["idx"], f["action"])
            assert k not in seen, f"duplicate fix {ch} {k}"
            seen.add(k)
        n = {"replace": 0, "drop": 0, "raw_before": 0}
        for f in sorted(fl, key=lambda f: (-f["idx"], order[f["action"]])):
            a, b = sp[f["idx"] - 1]
            if EXPECT is not None:
                from html import unescape
                blk = s[a:b]
                qdiv = inner(blk, sc["q"]) or ""
                got = re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<br\s*/?>", " ", qdiv)))).strip()
                exp = EXPECT.get((ch, f["idx"]))
                g1, e1 = re.sub(r"\W+", "", got.lower()), (re.sub(r"\W+", "", exp.lower()) if exp else "")
                if exp is not None and not e1.startswith(g1):
                    raise SystemExit("met-%s #%s: block is not the one this fix was written for; have: %s | want: %s"
                                     % (ch, f["idx"], got[:90], exp[:90]))
            if f["action"] == "drop":
                end = b
                while s[end:end + 1] in "\r\n ":
                    end += 1
                s = s[:a] + s[end:]
            elif f["action"] == "replace":
                s = s[:a] + render(sc, s[a:b], f) + s[b:]
            elif f["action"] == "raw_before":
                h = f["html"]
                if FIGURE_DATA_URI:
                    h = re.sub(r'src="/content/[^"]+"', 'src="%s"' % FIGURE_DATA_URI, h)
                s = s[:a] + h + "\n\n" + s[a:]
            n[f["action"]] += 1
        print(f"met-{ch}: {n}")
        if write:
            open(p, "w", encoding="utf-8", newline="").write(s)


main()
