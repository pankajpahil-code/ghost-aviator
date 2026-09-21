"""
Ghost Aviator - question card generator.

Turns the verified question bank into shareable PNG cards:
  card A = the question + options   (the hook)
  card B = the answer + explanation (the payoff)

The viral unit is a QUESTION, not a chapter (see VIRAL.md). There are
thousands of questions with worked explanations already written and
verified, which is years of daily posts with nothing new to author.

IRON RULE 1: nothing is composed here. Every word on a card is text that
already exists in the bank.
IRON RULE 2: any question whose text names a third-party source is dropped,
not edited.

Usage:
    python tools/viral/build-question-cards.py --count 30
    python tools/viral/build-question-cards.py --count 10 --subject meteorology
"""

import argparse
import json
import os
import random
import re
import sys
import textwrap

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIB = os.path.join(ROOT, "lib")
OUT = os.path.join(ROOT, "..", "viral-cards")

# Iron Rule 2 - attribution. Loaded from the single shared definition when
# present so this file cannot drift from the scrubber.
FORBIDDEN_FALLBACK = [
    "ic joshi", "icjoshi", "joshi", "rk bali", "r k bali", "bali",
    "oxford", "cae", "nordian", "jeppesen", "sahil", "surender", "redbird",
]


def load_forbidden():
    path = os.path.join(ROOT, "tools", "forbidden-source-names.json")
    try:
        with open(path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        names = data if isinstance(data, list) else data.get("names", [])
        if names:
            return [str(n).lower() for n in names]
    except Exception:
        pass
    return FORBIDDEN_FALLBACK


FORBIDDEN = load_forbidden()

# ---------------------------------------------------------------- parsing

# Matches one question object in the TS banks. The banks use backtick
# template strings throughout, which is what makes this tractable.
#
# NOTE: every field uses a NEGATED CHARACTER CLASS, never `.*?` with DOTALL.
# A backtick string cannot contain a backtick, so [^`]* matches it exactly
# and in linear time. The first version of this used `.*?` and backtracked
# catastrophically - 200s of CPU on a 378 KB file without emitting a single
# card. If you "simplify" these back to .*? you will reintroduce that.
Q_RE = re.compile(
    r"q:\s*`(?P<q>[^`]*)`\s*,\s*"
    r"opts:\s*\[(?P<opts>[^\]]*)\]\s*,\s*"
    r"ans:\s*(?P<ans>\d+)\s*,\s*"
    r"exp:\s*`(?P<exp>[^`]*)`"
)
OPT_RE = re.compile(r"`([^`]*)`")
CHAP_RE = re.compile(r'chapterId:\s*"([^"]+)"')
SUBJ_RE = re.compile(r'subjectIds:\s*\[(.*?)\]', re.DOTALL)

PLACEHOLDER_RE = re.compile(r"^correct answer\s*:?\s*[a-d]?\.?\s*$", re.I)


def is_real_explanation(exp):
    """The bank carries many stub explanations. Those teach nothing and must
    never reach a card."""
    e = exp.strip()
    if len(e) < 120:
        return False
    if PLACEHOLDER_RE.match(e):
        return False
    if e.lower().startswith("correct answer") and len(e) < 200:
        return False
    return True


# Codepoints the card fonts (Arial / Segoe / DejaVu) cannot draw. Left in,
# they render as a tofu box on the card - which is exactly what shipped in
# the first run: "dark grey or black. [] IR imagery rule". Caught by opening
# the PNG, not by any check, so do not remove this without looking at output.
UNRENDERABLE = re.compile(
    "[\U0001F000-\U0001FAFF"   # emoji & pictographs
    "☀-➿"            # misc symbols, dingbats
    "⬀-⯿"            # misc symbols and arrows
    "️︎"             # variation selectors
    "‍​"             # zero-width joiner / space
    "�]"                  # REPLACEMENT CHARACTER - see note below
)

# On U+FFFD: lib/generated/icjoshi-notes-met.ts contains 63 of them, baked in
# as valid UTF-8 (ef bf bd). The characters were destroyed upstream when that
# file was generated, not by reading it here. Stripping them keeps the cards
# clean, but the source file is still carrying 63 holes in live Meteorology
# content and wants a regeneration from the original.


def clean(s):
    s = s.replace("\\`", "`").replace("\\$", "$")
    s = UNRENDERABLE.sub("", s)
    s = re.sub(r"\s*\n\s*", " ", s)
    return re.sub(r"\s{2,}", " ", s).strip()


def strip_echoed_answer(exp, answer):
    """Many explanations open by restating the correct option verbatim. The
    answer is already printed in bold immediately above it on the card, so
    the repeat just wastes the reader's first line."""
    a = answer.strip().rstrip(".").strip()
    if not a:
        return exp
    if exp[:len(a)].lower() == a.lower():
        rest = exp[len(a):].lstrip(" .:-–—")
        if len(rest) > 60:
            return rest[0].upper() + rest[1:] if rest else exp
    return exp


def names_a_source(*texts):
    blob = " ".join(texts).lower()
    for name in FORBIDDEN:
        if re.search(r"\b" + re.escape(name) + r"\b", blob):
            return name
    return None


def harvest():
    files = []
    for d in (LIB, os.path.join(LIB, "generated")):
        if not os.path.isdir(d):
            continue
        for fn in sorted(os.listdir(d)):
            if fn.endswith(".ts"):
                files.append(os.path.join(d, fn))

    seen = set()
    out = []
    stats = {"scanned": 0, "stub": 0, "attribution": 0, "dupe": 0, "kept": 0}

    for path in files:
        try:
            src = open(path, "r", encoding="utf-8", errors="replace").read()
        except Exception:
            continue
        if "opts:" not in src:
            continue

        for m in Q_RE.finditer(src):
            stats["scanned"] += 1
            q = clean(m.group("q"))
            exp = clean(m.group("exp"))
            opts = [clean(o) for o in OPT_RE.findall(m.group("opts"))]
            try:
                ans = int(m.group("ans"))
            except ValueError:
                continue

            if len(opts) < 2 or ans >= len(opts):
                continue
            if not is_real_explanation(exp):
                stats["stub"] += 1
                continue

            hit = names_a_source(q, exp, " ".join(opts))
            if hit:
                stats["attribution"] += 1
                continue

            key = q.lower()[:120]
            if key in seen:
                stats["dupe"] += 1
                continue
            seen.add(key)

            # chapterId / subjectIds sit just above `q:` in the object, so
            # look back a short fixed window rather than capturing a
            # variable-length head (which is what made this quadratic).
            head = src[max(0, m.start() - 500):m.start()]
            chap = CHAP_RE.search(head)
            subj = SUBJ_RE.search(head)
            subjects = re.findall(r'"([^"]+)"', subj.group(1)) if subj else []

            out.append({
                "q": q,
                "opts": opts,
                "ans": ans,
                "exp": exp,
                "chapterId": chap.group(1) if chap else "",
                "subjects": subjects,
                "source_file": os.path.basename(path),
            })
            stats["kept"] += 1

    return out, stats


# ---------------------------------------------------------------- drawing

W, H = 1080, 1350
INK = (14, 22, 36)
PAPER = (247, 249, 252)
ACCENT = (222, 170, 60)
MUTED = (110, 124, 145)
GOOD = (32, 140, 92)

FONT_DIRS = [r"C:\Windows\Fonts", "/usr/share/fonts/truetype/dejavu"]
FONT_CANDIDATES = {
    "bold": ["arialbd.ttf", "segoeuib.ttf", "DejaVuSans-Bold.ttf"],
    "regular": ["arial.ttf", "segoeui.ttf", "DejaVuSans.ttf"],
}


def font(kind, size):
    for d in FONT_DIRS:
        for name in FONT_CANDIDATES[kind]:
            p = os.path.join(d, name)
            if os.path.exists(p):
                try:
                    return ImageFont.truetype(p, size)
                except Exception:
                    pass
    return ImageFont.load_default()


def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def draw_block(draw, text, fnt, x, y, max_w, fill, leading=10):
    for line in wrap(draw, text, fnt, max_w):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + leading
    return y


def chrome(img, draw, label):
    draw.rectangle([0, 0, W, 14], fill=ACCENT)
    draw.text((64, 58), "GHOST AVIATOR", font=font("bold", 30), fill=INK)
    draw.text((64, 98), label, font=font("regular", 24), fill=MUTED)
    draw.line([(64, 146), (W - 64, 146)], fill=(226, 231, 238), width=2)
    draw.line([(64, H - 108), (W - 64, H - 108)], fill=(226, 231, 238), width=2)
    draw.text((64, H - 86), "ghostaviator.com", font=font("bold", 28), fill=INK)
    draw.text((64, H - 50), "Free DGCA CPL & ATPL notes, question bank and simulators",
              font=font("regular", 21), fill=MUTED)


def card_question(item, label):
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    chrome(img, d, label)
    y = 210
    y = draw_block(d, item["q"], font("bold", 44), 64, y, W - 128, INK, 14)
    y += 46
    for i, opt in enumerate(item["opts"][:4]):
        letter = "ABCD"[i]
        d.ellipse([64, y + 2, 64 + 44, y + 46], outline=MUTED, width=2)
        d.text((78, y + 8), letter, font=font("bold", 26), fill=MUTED)
        y = draw_block(d, opt, font("regular", 32), 128, y + 4, W - 200, INK, 8)
        y += 22
    d.text((64, H - 190), "Answer in the next card", font=font("regular", 26), fill=ACCENT)
    return img


def card_answer(item, label):
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    chrome(img, d, label)
    y = 210
    letter = "ABCD"[item["ans"]] if item["ans"] < 4 else "?"
    d.text((64, y), "ANSWER  " + letter, font=font("bold", 46), fill=GOOD)
    y += 74
    y = draw_block(d, item["opts"][item["ans"]], font("bold", 34), 64, y, W - 128, INK, 10)
    y += 40
    d.text((64, y), "WHY", font=font("bold", 26), fill=ACCENT)
    y += 44
    exp = strip_echoed_answer(item["exp"], item["opts"][item["ans"]])
    # Long explanations are truncated at a sentence boundary rather than
    # mid-word; the full version lives on the site.
    if len(exp) > 700:
        cut = exp[:700]
        dot = max(cut.rfind(". "), cut.rfind("? "), cut.rfind("! "))
        exp = (cut[:dot + 1] if dot > 380 else cut.rstrip() + "...")
    draw_block(d, exp, font("regular", 29), 64, y, W - 128, INK, 9)
    return img


SUBJECT_LABEL = {
    "meteorology": "Aviation Meteorology",
    "air-regulations": "Air Regulations",
    "air-navigation": "Air Navigation",
    "technical-general": "Technical General",
    "instruments": "Instruments",
    "radio-navigation": "Radio Navigation",
    "radio-telephony": "Radio Telephony (RTR)",
}


def label_for(item):
    for s in item.get("subjects", []):
        base = s.replace("atpl-", "")
        if base in SUBJECT_LABEL:
            return SUBJECT_LABEL[base] + "  |  DGCA CPL / ATPL"
    return "DGCA CPL / ATPL"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--count", type=int, default=30)
    ap.add_argument("--subject", default=None)
    ap.add_argument("--seed", type=int, default=20260921)
    ap.add_argument("--out", default=OUT)
    args = ap.parse_args()

    items, stats = harvest()
    print("scanned      %d" % stats["scanned"])
    print("stub exp     %d  (dropped - teaches nothing)" % stats["stub"])
    print("attribution  %d  (dropped - Iron Rule 2)" % stats["attribution"])
    print("duplicate    %d" % stats["dupe"])
    print("USABLE       %d" % stats["kept"])

    if args.subject:
        want = args.subject.lower()
        items = [i for i in items
                 if any(want in s.lower() for s in i.get("subjects", []))]
        print("after subject filter %r: %d" % (args.subject, len(items)))

    if not items:
        print("nothing to draw")
        return 1

    os.makedirs(args.out, exist_ok=True)
    random.Random(args.seed).shuffle(items)
    picked = items[:args.count]

    manifest = []
    for n, item in enumerate(picked, 1):
        label = label_for(item)
        a = os.path.join(args.out, "card%02d_a_question.png" % n)
        b = os.path.join(args.out, "card%02d_b_answer.png" % n)
        card_question(item, label).save(a, "PNG", optimize=True)
        card_answer(item, label).save(b, "PNG", optimize=True)
        manifest.append({
            "n": n, "question": a, "answer": b, "label": label,
            "q": item["q"], "correct": item["opts"][item["ans"]],
            "chapterId": item["chapterId"], "source_file": item["source_file"],
        })

    with open(os.path.join(args.out, "manifest.json"), "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, ensure_ascii=False)

    print("\nwrote %d cards (%d PNGs) to %s" % (len(picked), len(picked) * 2, args.out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
