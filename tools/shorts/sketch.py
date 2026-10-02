"""Sketchy whiteboard Shorts (his ask, 27 Sep 2026: "whiteboard drawing style, colourful, vibrant ... like sketchy
animation").

    python tools/shorts/sketch.py thunderstorm        # -> tools/shorts/out/sketch-thunderstorm.mp4 (+ .txt caption)

WHY THIS STYLE: in a controlled study (Turkay 2016, Computers & Education 98:102-114) whiteboard animation gave
significantly better retention than slides, audio or text, and was rated more engaging and enjoyable.

HOW IT LOOKS HAND-MADE
  * every stroke is DRAWN over time, with a marker at the tip;
  * "line boil": every line is re-jittered ~10 times a second (rough, bowed, doubled strokes), the classic look of
    hand-drawn animation;
  * colour comes from pencil HATCHING, not flat fills; text is handwriting (Ink Free) written left to right.

THE RULES FROM explainer.py STILL HOLD: facts are verified verbatim against the Captain's chapter before a frame is
drawn (explainer.verify), the music and sound effects are synthesised here (nobody else's audio), and everything
readable stays inside the Shorts safe area.
"""
import math
import random
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

import explainer

HERE = Path(__file__).parent
OUT = HERE / "out"
W, H, FPS, SR = 1080, 1920, 30, 44100
FONTS = Path("C:/Windows/Fonts")
BOIL = 3                                     # frames per line-boil tick (10 per second)

PAPER = (252, 250, 244)
INK = (30, 41, 59); RED = (239, 68, 68); ORANGE = (249, 115, 22); YELLOW = (250, 204, 21); BLUE = (37, 99, 235)
SKY = (56, 189, 248); GREEN = (22, 163, 74); PURPLE = (147, 51, 234); GREY = (100, 116, 139); PINK = (236, 72, 153)

_fonts = {}
def hand(size):
    if size not in _fonts:
        _fonts[size] = ImageFont.truetype(str(FONTS / "Inkfree.ttf"), size)
    return _fonts[size]

def ease(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)

def prog(t, t0, t1):
    return 1.0 if t >= t1 else 0.0 if t <= t0 else (t - t0) / (t1 - t0)

# ------------------------------------------------------------------------------------------ rough drawing
class Pen:
    """Rough strokes in the style of hand-drawn sketches: each line is two slightly different, slightly bowed strokes,
    re-randomised every boil tick."""
    def __init__(self, img, seed):
        self.img = img
        self.d = ImageDraw.Draw(img, "RGBA")
        self.seed = seed
        self.tip = None

    def _r(self, *k):
        return random.Random(hash((self.seed,) + k) & 0xFFFFFFFF)

    def line(self, p0, p1, col, w=7, rough=3.0, key=0, alpha=255):
        (x0, y0), (x1, y1) = p0, p1
        L = math.hypot(x1 - x0, y1 - y0) or 1
        for s in range(2):
            r = self._r(key, s, round(x0), round(y0))
            j = lambda: r.uniform(-rough, rough)
            a = (x0 + j(), y0 + j()); b = (x1 + j(), y1 + j())
            bow = r.uniform(-1, 1) * min(L * 0.03, 6)
            nx, ny = -(y1 - y0) / L, (x1 - x0) / L
            pts = []
            for i in range(9):
                u = i / 8
                bx = a[0] + (b[0] - a[0]) * u + nx * bow * math.sin(math.pi * u)
                by = a[1] + (b[1] - a[1]) * u + ny * bow * math.sin(math.pi * u)
                pts.append((bx, by))
            self.d.line(pts, fill=col + (alpha if s == 0 else int(alpha * 0.55),), width=w if s == 0 else max(2, w - 3), joint="curve")

    def path(self, pts, col, w=7, p=1.0, rough=3.0, key=0, closed=False, alpha=255):
        """Draw the first fraction p of the path (by length). Returns the pen tip."""
        if closed:
            pts = list(pts) + [pts[0]]
        segs = [(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]
        lens = [math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in segs]
        total = sum(lens) or 1
        left = total * min(max(p, 0), 1)
        tip = pts[0]
        for i, ((a, b), l) in enumerate(zip(segs, lens)):
            if left <= 0:
                break
            if left >= l:
                self.line(a, b, col, w, rough, (key, i), alpha); tip = b
            else:
                u = left / l
                tip = (a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)
                self.line(a, tip, col, w, rough, (key, i), alpha)
            left -= l
        if 0 < p < 1:
            self.tip = tip
        return tip

    def hatch(self, poly, col, p=1.0, gap=20, angle=-40, w=4, key=0, alpha=200):
        """Pencil hachure inside a polygon; the first fraction p of the strokes."""
        ang = math.radians(angle)
        ca, sa = math.cos(ang), math.sin(ang)
        rot = [(x * ca + y * sa, -x * sa + y * ca) for x, y in poly]
        ys = [q[1] for q in rot]
        lines = []
        y = min(ys) + gap / 2
        while y < max(ys):
            xs = []
            for i in range(len(rot)):
                (x0, y0), (x1, y1) = rot[i], rot[(i + 1) % len(rot)]
                if (y0 <= y < y1) or (y1 <= y < y0):
                    xs.append(x0 + (y - y0) * (x1 - x0) / (y1 - y0))
            xs.sort()
            for k in range(0, len(xs) - 1, 2):
                lines.append(((xs[k], y), (xs[k + 1], y)))
            y += gap
        n = int(len(lines) * min(max(p, 0), 1))
        back = lambda q: (q[0] * ca - q[1] * sa, q[0] * sa + q[1] * ca)
        for i, (a, b) in enumerate(lines[:n]):
            self.line(back(a), back(b), col, w, 2.5, (key, 'h', i), alpha)
        if 0 < p < 1 and n:
            self.tip = back(lines[n - 1][1])

    def write(self, text, cx, y, size, col, p=1.0, tick=0):
        """Handwritten text, revealed left to right like a marker writing it; a small wobble each boil tick."""
        f = hand(size)
        box = f.getbbox(text)
        tw, th = box[2] - box[0] + 20, box[3] - box[1] + 24
        layer = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
        ImageDraw.Draw(layer).text((10 - box[0], 10 - box[1]), text, font=f, fill=col + (255,), stroke_width=2, stroke_fill=col + (255,))
        r = random.Random(hash((text, tick)) & 0xFFFFFFFF)
        layer = layer.rotate(r.uniform(-0.8, 0.8), resample=Image.BICUBIC, expand=True)
        cut = int(layer.size[0] * min(max(p, 0), 1))
        if cut <= 0:
            return
        layer = layer.crop((0, 0, cut, layer.size[1]))
        x = int(cx - tw / 2)
        self.img.paste(layer, (x, int(y)), layer)
        if p < 1:
            self.tip = (x + cut, y + th * 0.7)
        return (x, int(y), x + tw, int(y) + th)

    def marker(self, col=INK):
        """The marker pen at the drawing tip - the whiteboard signature."""
        if not self.tip:
            return
        x, y = self.tip
        a = math.radians(-50)
        dx, dy = math.cos(a), math.sin(a)
        body = [(x + dx * 30 - dy * 16, y + dy * 30 + dx * 16), (x + dx * 190 - dy * 16, y + dy * 190 + dx * 16),
                (x + dx * 190 + dy * 16, y + dy * 190 - dx * 16), (x + dx * 30 + dy * 16, y + dy * 30 - dx * 16)]
        self.d.polygon(body, fill=(55, 65, 81, 235))
        self.d.polygon([(x, y), (x + dx * 30 - dy * 10, y + dy * 30 + dx * 10), (x + dx * 30 + dy * 10, y + dy * 30 - dx * 10)],
                       fill=col + (255,))
        cap = [(x + dx * 150 - dy * 17, y + dy * 150 + dx * 17), (x + dx * 190 - dy * 17, y + dy * 190 + dx * 17),
               (x + dx * 190 + dy * 17, y + dy * 190 - dx * 17), (x + dx * 150 + dy * 17, y + dy * 150 - dx * 17)]
        self.d.polygon(cap, fill=col + (255,))

# ------------------------------------------------------------------------------------------ shapes
def cloud(cx, base, top, half, bumps=7, flat=True):
    """A puffy cumulus outline: bumpy dome over a flat base."""
    pts = []
    n = 72
    for i in range(n + 1):
        th = math.pi * i / n
        b = 1 + 0.11 * abs(math.sin(bumps * th))
        pts.append((cx - half * math.cos(th) * b, base - (base - top) * math.sin(th) * b))
    return pts                                  # closed by the caller with the flat base

def anvil(cx, top, half, neck=150, depth=120):
    """The anvil: a puffy, flat-topped sheet at the tropopause whose underside curves back into the tower."""
    pts = []
    for i in range(41):                                   # top edge, left to right, gently bumpy
        u = i / 40
        pts.append((cx - half + 2 * half * u, top + 6 * abs(math.sin(u * 17))))
    for i in range(1, 12):                                # rounded right end
        a = -math.pi / 2 + math.pi * i / 12
        pts.append((cx + half + 34 * math.cos(a), top + 34 + 34 * math.sin(a)))
    for i in range(21):                                   # underside, right to left, dipping into the tower
        u = i / 20
        x = cx + half - (2 * half) * u
        near = max(0.0, 1 - abs(x - cx) / half)
        pts.append((x, top + 68 + depth * near ** 2 * (1 if abs(x - cx) > neck else 1.2)))
    for i in range(1, 12):                                # rounded left end
        a = math.pi / 2 + math.pi * i / 12
        pts.append((cx - half + 34 * math.cos(a), top + 34 + 34 * math.sin(a)))
    return pts

def arrow(x, y, length, up=True):
    s = -1 if up else 1
    tip = (x, y + s * length)
    return [(x, y), tip], [(x - 20, tip[1] - s * 26), tip, (x + 20, tip[1] - s * 26)]

def bolt(x, y0, y1, seed):
    r = random.Random(seed)
    pts, y, xx = [(x, y0)], y0, x
    while y < y1:
        y += r.uniform(45, 80); xx += r.uniform(-45, 45)
        pts.append((xx, min(y, y1)))
    return pts

# ------------------------------------------------------------------------------------------ the thunderstorm, sketched
TROP, BASE, GROUND, CX = 820, 1270, 1400, 470
FLASHES = [0.35, 1.6, 2.6, 16.4, 18.1, 19.2, 20.7]
DRAW_SPANS = []                                  # (t0, t1) of every stroke, for the scribble sound

def span(t0, t1):
    DRAW_SPANS.append((t0, t1)); return (t0, t1)

def caption(pen, t, lines, t0, tick, y0=330):
    """Handwritten caption lines at the top, each written in turn."""
    y, tops = y0, []
    for i, (txt, size, col) in enumerate(lines):
        a = t0 + i * 0.55
        b = a + 0.25 + 0.022 * len(txt)
        y += 22 if i == len(lines) - 1 and col == RED else 0      # breathing room above a line that gets circled
        pen.write(txt, 490, y, size, col, prog(t, a, b), tick)
        tops.append((y, size))
        y += size + 18
    return tops

def chip(pen, t, text, col, t0, tick):
    p = prog(t, t0, t0 + 0.5)
    if p <= 0:
        return
    f = hand(44); wdt = f.getbbox(text)[2] + 60
    box = [(70, 250), (70 + wdt, 250), (70 + wdt, 312), (70, 312)]
    pen.hatch(box, col, p, gap=11, w=5, key=('chip', text), alpha=160)
    pen.path(box, col, 5, p, 2, key=('chipb', text), closed=True)
    pen.write(text, 70 + wdt / 2, 248, 44, INK, p, tick)

def scene(t, tick):
    img = Image.new("RGB", (W, H), PAPER)
    pen = Pen(img, tick)
    d = pen.d
    # faint dot grid: paper, not a screen
    for gy in range(40, H, 60):
        for gx in range(40, W, 60):
            d.point((gx, gy), fill=(226, 222, 210))
    flash = any(0 <= t - f < 0.08 for f in FLASHES)
    if flash:
        d.rectangle([0, 0, W, H], fill=(254, 249, 195, 170))

    # ---------------------------------------------------------------- 0 - 3.2  hook
    if t < 3.2:
        pen.write("UPDRAFTS OF", 490, 420, 86, INK, prog(t, 0.0, 0.5), tick)
        pen.write("60 KNOTS!", 490, 520, 190, RED, prog(t, 0.3, 1.1), tick)
        pen.path([(160, 760), (820, 740)], ORANGE, 10, prog(t, 1.0, 1.4), key='ul1')
        pen.write("are not uncommon", 490, 800, 64, BLUE, prog(t, 1.3, 1.9), tick)
        pen.write("inside a storm cloud", 490, 880, 64, BLUE, prog(t, 1.6, 2.3), tick)
        c = cloud(CX, 1330, 1030, 300)
        pen.hatch(c, GREY, prog(t, 0.2, 1.4), gap=22, key='hc', alpha=150)
        pen.path(c, INK, 8, prog(t, 0.0, 1.0), key='hcloud')
        for x in (CX - 120, CX, CX + 120):
            shaft, head = arrow(x, 1330, 220 + 60 * math.sin(t * 5 + x), up=True)
            pen.path(shaft, ORANGE, 11, prog(t, 0.6, 1.2), key=('ha', x)); pen.path(head, ORANGE, 11, prog(t, 1.0, 1.3), key=('hh', x))
        for f in FLASHES[:3]:
            if 0 <= t - f < 0.25:
                b = bolt(CX + 160, 1180, 1450, int(f * 10))
                pen.path(b, YELLOW, 22, 1, 4, key=('b', f)); pen.path(b, INK, 6, 1, 3, key=('bo', f))
        pen.marker(RED)
        return img

    # ---------------------------------------------------------------- 3.2 - 8.2  three ingredients
    if t < 8.2:
        chip(pen, t, "3 INGREDIENTS", YELLOW, 3.25, tick)
        pen.write("How is a thunderstorm born?", 490, 345, 74, INK, prog(t, 3.3, 4.2), tick)
        pen.path([(120, 440), (860, 430)], PINK, 8, prog(t, 4.0, 4.4), key='ul2')
        cols = [(200, "Steep", "lapse rate", RED), (490, "High", "humidity", BLUE), (780, "A trigger", "lifts the air", GREEN)]
        for i, (x, l1, l2, col) in enumerate(cols):
            a = 4.3 + i * 1.15
            pen.write(str(i + 1), x, 520, 90, col, prog(t, a, a + 0.2), tick)
            if i == 0:   # a steep line on axes
                pen.path([(x - 90, 640), (x - 90, 860), (x + 100, 860)], INK, 6, prog(t, a + 0.1, a + 0.5), key='ax')
                pen.path([(x - 70, 850), (x + 80, 660)], RED, 10, prog(t, a + 0.4, a + 0.8), key='lr')
            if i == 1:   # a drop
                drop = [(x, 640)] + [(x + 72 * math.sin(th), 790 + 72 * math.cos(th)) for th in np.linspace(2.4, -2.4, 24)] + [(x, 640)]
                pen.hatch(drop, SKY, prog(t, a + 0.4, a + 0.9), gap=14, key='drop', alpha=190)
                pen.path(drop, BLUE, 8, prog(t, a + 0.1, a + 0.5), key='dropo')
            if i == 2:   # a hill and rising air
                hill = [(x - 110, 860), (x - 20, 700), (x + 110, 860)]
                pen.hatch(hill, GREEN, prog(t, a + 0.4, a + 0.9), gap=14, key='hill', alpha=170)
                pen.path(hill, INK, 7, prog(t, a + 0.1, a + 0.4), key='hillo', closed=True)
                shaft, head = arrow(x - 70, 820, 170)
                pen.path(shaft, ORANGE, 10, prog(t, a + 0.5, a + 0.8), key='ta'); pen.path(head, ORANGE, 10, prog(t, a + 0.7, a + 0.9), key='th')
            pen.write(l1, x, 900, 54, col, prog(t, a + 0.6, a + 0.9), tick)
            pen.write(l2, x, 965, 54, col, prog(t, a + 0.7, a + 1.05), tick)
        pen.marker(INK)
        return img

    # ---------------------------------------------------------------- 8.2 - 30  the storm diagram (persists) + captions
    if t < 26.6:
        # ground and sun
        gpoly = [(40, GROUND), (1000, GROUND), (1000, GROUND + 50), (40, GROUND + 50)]
        pen.hatch(gpoly, GREEN, prog(t, 8.4, 8.9), gap=12, key='g', alpha=200)
        pen.path([(40, GROUND), (1000, GROUND)], INK, 8, prog(t, 8.25, 8.6), key='gl')
        if t < 14.5:
            sun = [(860 + 60 * math.cos(a), 900 + 60 * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 24)]
            pen.hatch(sun, YELLOW, prog(t, 8.8, 9.3), gap=12, key='sun', alpha=220)
            pen.path(sun, ORANGE, 7, prog(t, 8.6, 9.0), key='suno')
            for k in range(8):
                a = k * math.pi / 4
                pen.path([(860 + 78 * math.cos(a), 900 + 78 * math.sin(a)), (860 + 108 * math.cos(a), 900 + 108 * math.sin(a))],
                         ORANGE, 6, prog(t, 9.0, 9.3), key=('ray', k))
        # the cloud grows: small cumulus -> tower -> anvil -> fading
        grow = ease(prog(t, 9.2, 15.5))
        top = BASE - 180 - (BASE - 180 - (TROP + 60)) * grow
        half = 150 + 150 * ease(prog(t, 9.2, 13.5))
        fade = 1 - 0.55 * ease(prog(t, 22.2, 26))
        c = cloud(CX, BASE, top, half)
        dark = ease(prog(t, 12, 16))
        fill = tuple(int(a + (b - a) * dark) for a, b in zip(SKY, (71, 85, 105)))
        pen.hatch(c, fill, prog(t, 9.6, 11.0), gap=int(20 + 14 * (1 - fade)), key='cf', alpha=int(190 * fade))
        pen.path(c, INK, 8, prog(t, 9.2, 10.4), key='co', alpha=int(255 * fade))
        pen.path([c[-1], c[0]], INK, 6, prog(t, 10.3, 10.5), key='cb', alpha=int(255 * fade))
        if t >= 13.8:
            pen.path([(40, TROP - 10), (1000, TROP - 10)], PURPLE, 5, prog(t, 13.8, 14.5), key='trop')
            for k in range(0, 960, 70):
                pass
            if t < 22.5:
                pen.write("tropopause", 830, TROP - 78, 44, PURPLE, prog(t, 14.2, 14.8), tick)
        if t >= 15.0:
            an = anvil(CX, TROP, 90 + 360 * ease(prog(t, 15.0, 17.0)), depth=55)
            if prog(t, 15.0, 16.2) >= 1:
                d.polygon(an, fill=PAPER + (255,))                   # paper behind the anvil hides the tower lines under it
            pen.hatch(an, fill, prog(t, 15.3, 16.8), gap=int(20 + 14 * (1 - fade)), key='anf', alpha=int(190 * fade))
            pen.path(an, INK, 8, prog(t, 15.0, 16.2), key='ano', alpha=int(255 * fade))
            if t < 22.5:
                pen.write("anvil", CX + 420, TROP + 110, 50, INK, prog(t, 16.3, 16.8), tick)
        # updrafts (yellow, left) - cumulus and mature
        if 9.8 <= t < 22.2:
            for k, x in enumerate((CX - 150, CX - 60)):
                off = (t * 120 + k * 70) % 140
                y0 = BASE + 40 - off
                shaft, head = arrow(x, y0, 190)
                pen.path(shaft, ORANGE, 12, prog(t, 9.8, 10.4), key=('ua', k)); pen.path(head, ORANGE, 12, prog(t, 10.2, 10.5), key=('uh', k))
        # downdrafts (blue, right) and rain - mature and dissipating
        if t >= 15.6:
            for k, x in enumerate((CX + 80, CX + 170)):
                off = (t * 120 + k * 70) % 140
                shaft, head = arrow(x, BASE - 260 + off, 190, up=False)
                pen.path(shaft, BLUE, 12, prog(t, 15.6, 16.2), key=('da', k)); pen.path(head, BLUE, 12, prog(t, 16.0, 16.3), key=('dh', k))
            n = int(22 * (1 - 0.65 * ease(prog(t, 22.5, 26))))
            r = random.Random(7)
            for i in range(n):
                x = CX + 30 + r.uniform(0, 260)
                y = BASE + 20 + ((r.uniform(0, 1) + t * 1.4) % 1.0) * (GROUND - BASE - 60)
                pen.line((x, y), (x - 10, y + 36), BLUE, 5, 1.5, ('r', i))
        for f in FLASHES[3:]:
            if 0 <= t - f < 0.25:
                b = bolt(CX - 30 + int(f * 13) % 120, BASE - 260, GROUND, int(f * 10))   # from inside the cloud to the ground
                pen.path(b, YELLOW, 24, 1, 4, key=('b', f)); pen.path(b, INK, 6, 1, 3, key=('bo', f))
                for k in range(6):
                    a = k * math.pi / 3
                    bx, by = b[-1]
                    pen.line((bx + 30 * math.cos(a), by - 20 + 30 * math.sin(a)), (bx + 60 * math.cos(a), by - 20 + 60 * math.sin(a)),
                             ORANGE, 6, 2, ('burst', f, k))
        # captions for each stage (the verified wording from explainer.TOPICS)
        if t < 14.0:
            chip(pen, t, "STAGE 1 · CUMULUS", SKY, 8.25, tick)
            caption(pen, t, [("Only updrafts", 96, INK), ("Air is lifted, cools", 66, BLUE), ("and condenses", 66, BLUE)], 8.4, tick)
        elif t < 22.0:
            chip(pen, t, "STAGE 2 · MATURE", ORANGE, 14.05, tick)
            tops = caption(pen, t, [("Updrafts + downdrafts", 80, INK), ("side by side!", 80, INK),
                                    ("lightning · squall · 20–40 min", 60, BLUE), ("THE MOST VIOLENT STAGE", 62, RED)], 14.2, tick)
            ly, ls = tops[-1]
            gb = hand(ls).getbbox("THE MOST VIOLENT STAGE")            # measured, not guessed: the glyphs sit at y+10
            gw, gh = gb[2] - gb[0], gb[3] - gb[1]
            ring = [(490 + (gw / 2 + 55) * math.cos(a), ly + 10 + gh / 2 + (gh / 2 + 26) * math.sin(a))
                    for a in np.linspace(0.2, 2 * math.pi + 0.5, 40)]
            pen.path(ring, RED, 6, prog(t, 17.5, 18.2), key='ring')
        else:
            chip(pen, t, "STAGE 3 · DISSIPATING", PURPLE, 22.05, tick)
            caption(pen, t, [("Only downdrafts", 96, INK), ("Rain fades as the", 66, BLUE), ("moisture runs out", 66, BLUE)], 22.2, tick)
        pen.marker(INK)
        return img

    # ---------------------------------------------------------------- 26.6 - 30  call to action
    pen.write("Full chapter,", 490, 520, 96, INK, prog(t, 26.65, 27.1), tick)
    pen.write("FREE!", 490, 630, 160, RED, prog(t, 26.9, 27.4), tick)
    pen.write("ghostaviator.com", 490, 860, 96, BLUE, prog(t, 27.3, 28.0), tick)
    pen.path([(170, 990), (820, 980)], ORANGE, 10, prog(t, 27.9, 28.2), key='cu1')
    pen.path([(200, 1012), (790, 1004)], ORANGE, 8, prog(t, 28.0, 28.3), key='cu2')
    pen.write("DGCA Meteorology · Capt. Pankaj Pahil", 490, 1070, 50, INK, prog(t, 28.2, 28.9), tick)
    c = cloud(490, 1360, 1180, 180)
    pen.hatch(c, SKY, prog(t, 28.5, 29.2), gap=18, key='ecf', alpha=190)
    pen.path(c, INK, 7, prog(t, 28.4, 29.0), key='eco')
    pen.marker(BLUE)
    return img

for a, b in [(0.0, 2.3), (3.3, 8.0), (8.25, 11.0), (13.8, 18.3), (22.05, 23.8), (26.65, 29.2)]:
    span(a, b)

# ------------------------------------------------------------------------------------------ the tropical revolving storm
TRS_SPANS = [(0.0, 2.6), (3.45, 10.4), (11.05, 15.8), (17.55, 22.5), (25.55, 29.6), (30.55, 33.2)]

def cyclone(pen, cx, cy, R, t, p=1.0, key='cy', labels=False, tick=0):
    """A tropical cyclone from above: a clear eye, a dark eye wall, spiral bands turning anticlockwise (the northern
    hemisphere view). Drawn as spiral arms so it reads as a whirl, not a target."""
    spin = -0.55 * t
    eye, wall = R * 0.13, R * 0.30
    ring = [(cx + wall * math.cos(a), cy + wall * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 40)]
    hole = [(cx + eye * math.cos(a), cy + eye * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 30)]
    mass = [(cx + R * 0.92 * math.cos(a), cy + R * 0.92 * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 48)]
    pen.hatch(mass, (203, 213, 225), p, gap=24, w=3, key=(key, 'mass'), alpha=150)       # the cloud mass under the bands
    pen.hatch(ring, (71, 85, 105), p, gap=11, w=5, key=(key, 'wall'), alpha=210)
    pen.d.polygon(hole, fill=PAPER + (255,))
    pen.hatch(hole, SKY, p, gap=14, w=4, key=(key, 'eye'), alpha=150)
    pen.path(hole, INK, 6, p, key=(key, 'eyeo'), closed=True)
    for arm in range(4):
        base = spin + arm * math.pi / 2
        pts = [(cx + (wall + (R - wall) * u) * math.cos(base + 2.4 * u), cy + (wall + (R - wall) * u) * math.sin(base + 2.4 * u))
               for u in np.linspace(0, 1, 26)]
        pen.path(pts, BLUE if arm % 2 else SKY, 16 - arm % 2 * 4, p, 3, key=(key, 'arm', arm))
        pen.path([(x + 18 * math.cos(base), y + 18 * math.sin(base)) for x, y in pts[:18]], GREY, 6, p, 3, key=(key, 'arm2', arm))
    if labels:
        pen.path([(cx + eye * 0.7, cy - eye * 0.7), (cx + 300, cy - 330)], RED, 5, prog(t, 18.6, 19.0), key='l1')
        pen.write("EYE: 30–65 km", cx + 230, cy - 430, 58, RED, prog(t, 18.9, 19.5), tick)
        pen.write("light winds, often clear skies", cx + 120, cy - 364, 44, RED, prog(t, 19.3, 20.1), tick)
        pen.path([(cx - wall * 0.5, cy + wall * 0.85), (cx - 90, cy + 340)], PURPLE, 5, prog(t, 20.6, 21.0), key='l2')
        pen.write("EYE WALL: winds >64 kt", cx + 20, cy + 345, 58, PURPLE, prog(t, 20.9, 21.6), tick)
        pen.write("the most hazardous part!", cx + 20, cy + 412, 52, RED, prog(t, 21.4, 22.1), tick)
        pen.write("spiral bands", cx + 270, cy + 250, 44, BLUE, prog(t, 22.3, 22.8), tick)

def scene_trs(t, tick):
    img = Image.new("RGB", (W, H), PAPER)
    pen = Pen(img, tick)
    d = pen.d
    for gy in range(40, H, 60):
        for gx in range(40, W, 60):
            d.point((gx, gy), fill=(226, 222, 210))

    if t < 3.4:                                                    # hook
        pen.write("A vast violent whirl", 490, 330, 80, INK, prog(t, 0.0, 0.6), tick)
        pen.write("150 to 800 km!", 490, 430, 132, RED, prog(t, 0.4, 1.2), tick)
        pen.path([(150, 600), (830, 590)], ORANGE, 10, prog(t, 1.1, 1.4), key='hu')
        cyclone(pen, 490, 1050, 330, t, prog(t, 0.2, 1.6), key='hook')
        pen.write("a Tropical Revolving Storm", 490, 1440, 56, BLUE, prog(t, 1.5, 2.4), tick)
        pen.marker(RED)
        return img

    if t < 11.0:                                                   # four ingredients, 2 x 2
        chip(pen, t, "4 INGREDIENTS", YELLOW, 3.45, tick)
        pen.write("How is a cyclone born?", 490, 345, 80, INK, prog(t, 3.5, 4.3), tick)
        pen.path([(170, 445), (810, 435)], PINK, 8, prog(t, 4.2, 4.5), key='u')
        cells = [(265, 560, "Warm sea >26°C", "60 m deep", RED), (715, 560, "High humidity", "above 7000 m", BLUE),
                 (265, 1000, "Coriolis force", "spirals it inward", PURPLE), (715, 1000, "Little wind shear", "below 20 kt", GREEN)]
        for i, (x, y, l1, l2, col) in enumerate(cells):
            a = 4.5 + i * 1.45
            if i == 0:   # sea with a thermometer
                for k in range(3):
                    wave_ = [(x - 150 + u * 300, y + 150 + k * 34 + 10 * math.sin(u * 12 + t * 3)) for u in np.linspace(0, 1, 30)]
                    pen.path(wave_, BLUE, 7, prog(t, a + 0.1 * k, a + 0.4 + 0.1 * k), key=('w', k))
                th = [(x + 90, y + 20), (x + 90, y + 120)]
                pen.path(th, INK, 18, prog(t, a + 0.4, a + 0.7), key='therm')
                pen.path(th, RED, 9, prog(t, a + 0.6, a + 0.9), key='therm2')
                bulb = [(x + 90 + 22 * math.cos(q), y + 136 + 22 * math.sin(q)) for q in np.linspace(0, 2 * math.pi, 18)]
                pen.hatch(bulb, RED, prog(t, a + 0.6, a + 0.9), gap=7, w=5, key='bulb', alpha=240)
                pen.path(bulb, INK, 5, prog(t, a + 0.4, a + 0.7), key='bulbo', closed=True)
            if i == 1:   # a moist cloud with drops
                c = cloud(x, y + 150, y + 30, 130)
                pen.hatch(c, SKY, prog(t, a + 0.4, a + 0.9), gap=15, key='hc', alpha=180)
                pen.path(c, INK, 7, prog(t, a, a + 0.5), key='hco')
                for k in range(3):
                    dx = x - 60 + 60 * k
                    drop = [(dx, y + 165)] + [(dx + 14 * math.sin(q), y + 200 + 14 * math.cos(q)) for q in np.linspace(2.4, -2.4, 12)] + [(dx, y + 165)]
                    pen.path(drop, BLUE, 5, prog(t, a + 0.6, a + 0.9), key=('dr', k))
            if i == 2:   # a spiral
                sp = [(x + 12 * q * math.cos(-q * 1.1), y + 120 + 12 * q * math.sin(-q * 1.1)) for q in np.linspace(0.5, 10, 60)]
                pen.path(sp, PURPLE, 9, prog(t, a, a + 0.8), key='sp')
            if i == 3:   # gentle, parallel wind
                for k in range(3):
                    pen.path([(x - 140, y + 60 + k * 50), (x + 110, y + 60 + k * 50)], GREEN, 8, prog(t, a + 0.1 * k, a + 0.5 + 0.1 * k), key=('ws', k))
                    pen.path([(x + 85, y + 42 + k * 50), (x + 112, y + 60 + k * 50), (x + 85, y + 78 + k * 50)], GREEN, 8,
                             prog(t, a + 0.5, a + 0.7), key=('wh', k))
            pen.write(l1, x, y + 270, 52, col, prog(t, a + 0.7, a + 1.1), tick)
            pen.write(l2, x, y + 332, 46, INK, prog(t, a + 0.9, a + 1.3), tick)
        pen.marker(INK)
        return img

    if t < 17.5:                                                   # where: latitude 5-25, both hemispheres
        chip(pen, t, "WHERE?", ORANGE, 11.05, tick)
        pen.write("Only between 5° and 25°", 490, 345, 78, INK, prog(t, 11.1, 12.0), tick)
        cx, cy, R = 470, 900, 300
        globe = [(cx + R * math.cos(a), cy + R * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 60)]
        pen.hatch(globe, SKY, prog(t, 11.6, 12.4), gap=26, w=3, key='gl', alpha=90)
        pen.path(globe, INK, 8, prog(t, 11.3, 12.1), key='glo')
        def lat_y(deg):
            return cy - R * math.sin(math.radians(deg))
        def band(d0, d1):
            top = [(cx - R * math.cos(math.radians(d)) , lat_y(d)) for d in np.linspace(d0, d1, 12)]
            bot = [(cx + R * math.cos(math.radians(d)), lat_y(d)) for d in np.linspace(d1, d0, 12)]
            return top + bot
        for k, (d0, d1) in enumerate(((5, 25), (-25, -5))):
            pen.hatch(band(d0, d1), ORANGE, prog(t, 12.4, 13.2), gap=12, w=5, key=('band', k), alpha=210)
        pen.path([(cx - R, cy), (cx + R, cy)], RED, 5, prog(t, 12.2, 12.6), key='eq')
        for deg, lab in ((25, "25°N"), (5, "5°N"), (-5, "5°S"), (-25, "25°S")):
            half = R * math.cos(math.radians(deg))
            pen.path([(cx - half, lat_y(deg)), (cx + half, lat_y(deg))], INK, 4, prog(t, 12.3, 12.8), key=('lat', deg))
            pen.write(lab, cx + half + 70, lat_y(deg) - 30, 38, INK, prog(t, 12.8, 13.2), tick)
        pen.write("Below 5°: no Coriolis force", 490, 1250, 60, RED, prog(t, 13.6, 14.6), tick)
        pen.write("Above 25°: too cold", 490, 1330, 60, BLUE, prog(t, 14.6, 15.4), tick)
        for k in range(2):
            for sgn in (1, -1):
                xx, yy = cx - 60 + k * 130, cy - sgn * R * 0.26
                pen.path([(xx + 22 * math.cos(q), yy + 22 * math.sin(q)) for q in np.linspace(0, -5.5, 16)], BLUE, 5,
                         prog(t, 13.2, 13.8), key=('mini', k, sgn))
        pen.marker(INK)
        return img

    if t < 25.5:                                                   # inside
        chip(pen, t, "INSIDE A CYCLONE", PURPLE, 17.55, tick)
        pen.write("Calm eye, violent wall", 490, 345, 78, INK, prog(t, 17.6, 18.5), tick)
        cyclone(pen, 470, 920, 320, t, prog(t, 17.7, 18.7), key='in', labels=True, tick=tick)
        pen.marker(INK)
        return img

    if t < 30.5:                                                   # names
        chip(pen, t, "SAME STORM, 3 NAMES", GREEN, 25.55, tick)
        rows = [("Hurricane", "Atlantic", RED), ("Typhoon", "NW Pacific", ORANGE), ("Cyclone", "Bay of Bengal & Arabian Sea", BLUE)]
        for i, (n1, n2, col) in enumerate(rows):
            a = 25.7 + i * 0.9
            y = 420 + i * 230
            pen.write(n1, 490, y, 110, col, prog(t, a, a + 0.5), tick)
            pen.write(n2, 490, y + 120, 50, INK, prog(t, a + 0.4, a + 0.8), tick)
            cyclone(pen, 140, y + 70, 60, t, prog(t, a, a + 0.6), key=('mini', i))
        pen.write("Indian cyclones last", 490, 1190, 64, INK, prog(t, 28.5, 29.1), tick)
        pen.write("3–5 days on average", 490, 1270, 76, RED, prog(t, 28.9, 29.6), tick)
        pen.marker(INK)
        return img

    pen.write("Full chapter,", 490, 520, 96, INK, prog(t, 30.55, 31.0), tick)          # call to action
    pen.write("FREE!", 490, 630, 160, RED, prog(t, 30.8, 31.3), tick)
    pen.write("ghostaviator.com", 490, 860, 96, BLUE, prog(t, 31.2, 31.9), tick)
    pen.path([(170, 990), (820, 980)], ORANGE, 10, prog(t, 31.8, 32.1), key='cu1')
    pen.write("DGCA Meteorology · Capt. Pankaj Pahil", 490, 1070, 50, INK, prog(t, 32.0, 32.7), tick)
    cyclone(pen, 490, 1330, 170, t, prog(t, 32.2, 33.0), key='end')
    pen.marker(BLUE)
    return img

# ------------------------------------------------------------------------------------------ how rain forms
RAIN_SPANS = [(0.0, 2.6), (3.45, 7.2), (8.05, 11.5), (16.85, 19.8), (24.85, 27.8), (30.55, 33.2)]
RAIN_SOUND = [(13.2, 16.8), (21.5, 24.8), (28.2, 30.5)]

def snowflake(pen, cx, cy, r, col, p, key):
    for k in range(3):
        a = k * math.pi / 3
        pen.path([(cx - r * math.cos(a), cy - r * math.sin(a)), (cx + r * math.cos(a), cy + r * math.sin(a))], col, 5, p, 1.5, key=(key, k))
    for k in range(6):
        a = k * math.pi / 3
        mx, my = cx + 0.6 * r * math.cos(a), cy + 0.6 * r * math.sin(a)
        for s in (-1, 1):
            b = a + s * 0.7
            pen.path([(mx, my), (mx + 0.3 * r * math.cos(b), my + 0.3 * r * math.sin(b))], col, 4, p, 1, key=(key, 'b', k, s))

def droplet(pen, cx, cy, r, col, p, key, fill=True):
    pts = [(cx, cy - 1.9 * r)] + [(cx + r * math.sin(q), cy + r * math.cos(q)) for q in np.linspace(2.4, -2.4, 16)] + [(cx, cy - 1.9 * r)]
    if fill and r > 8:
        pen.hatch(pts, SKY, p, gap=max(5, int(r / 3)), w=3, key=(key, 'f'), alpha=200)
    pen.path(pts, BLUE, 4 if r < 14 else 6, p, 1.5 if r < 14 else 2.5, key=(key, 'o'))

def scene_rain(t, tick):
    img = Image.new("RGB", (W, H), PAPER)
    pen = Pen(img, tick)
    d = pen.d
    for gy in range(40, H, 60):
        for gx in range(40, W, 60):
            d.point((gx, gy), fill=(226, 222, 210))

    if t < 3.4:                                                    # hook
        pen.write("Why doesn't every", 490, 330, 84, INK, prog(t, 0.0, 0.5), tick)
        pen.write("cloud rain?", 490, 430, 110, BLUE, prog(t, 0.3, 0.9), tick)
        c = cloud(470, 1050, 720, 300)
        pen.hatch(c, SKY, prog(t, 0.3, 1.2), gap=20, key='hc', alpha=170)
        pen.path(c, INK, 8, prog(t, 0.1, 0.9), key='hco')
        r = random.Random(4)
        for i in range(10):
            x = 280 + r.uniform(0, 380); y = 860 + r.uniform(0, 150) + 18 * math.sin(t * 4 + i)
            droplet(pen, x, y, 8, BLUE, prog(t, 0.6, 1.0), ('hd', i), fill=False)
        for k, x in enumerate((330, 470, 610)):
            shaft, head = arrow(x, 1230, 170)
            pen.path(shaft, ORANGE, 11, prog(t, 0.9, 1.3), key=('ha', k)); pen.path(head, ORANGE, 11, prog(t, 1.2, 1.4), key=('hh', k))
        pen.write("Its drops must grow big enough", 490, 1270, 60, RED, prog(t, 1.5, 2.3), tick)
        pen.write("to beat the updrafts!", 490, 1355, 60, RED, prog(t, 2.0, 2.6), tick)
        pen.marker(BLUE)
        return img

    if t < 8.0:                                                    # sizes
        chip(pen, t, "HOW BIG?", YELLOW, 3.45, tick)
        rows = [("Drizzle", "0.2–0.5 mm", 7, 3.6), ("Rain", "0.5–5 mm", 34, 4.6), ("Hail", "5–50 mm or more", 90, 5.6)]
        for i, (name, size, rad, a) in enumerate(rows):
            y = 520 + i * 300
            if name == "Hail":
                ball = [(300 + rad * math.cos(q), y + 60 + rad * math.sin(q)) for q in np.linspace(0, 2 * math.pi, 30)]
                pen.hatch(ball, (186, 230, 253), prog(t, a + 0.3, a + 0.8), gap=12, key='hail', alpha=220)
                pen.path(ball, INK, 7, prog(t, a, a + 0.5), key='hailo', closed=True)
            else:
                droplet(pen, 300, y + 70, rad, BLUE, prog(t, a, a + 0.5), ('sz', i))
            pen.write(name, 640, y, 80, INK, prog(t, a + 0.2, a + 0.6), tick)
            pen.write(size, 640, y + 90, 60, RED, prog(t, a + 0.4, a + 0.9), tick)
        pen.write("(not to scale)", 490, 1380, 40, GREY, prog(t, 6.6, 7.2), tick)
        pen.marker(INK)
        return img

    if t < 16.8:                                                   # cold cloud: Bergeron
        chip(pen, t, "WAY 1 · COLD CLOUD", PURPLE, 8.05, tick)
        pen.write("Ice + supercooled water together", 490, 345, 58, INK, prog(t, 8.1, 9.0), tick)
        pen.write("ice crystals GROW, water drops shrink", 490, 420, 52, PURPLE, prog(t, 9.2, 10.2), tick)
        if t >= 13.0:
            pen.write("then fall as snow or rain", 490, 490, 52, BLUE, prog(t, 13.0, 13.8), tick)
        c = cloud(470, 1180, 620, 330)
        pen.hatch(c, (203, 213, 225), prog(t, 8.4, 9.4), gap=22, key='cc', alpha=160)
        pen.path(c, INK, 8, prog(t, 8.2, 9.0), key='cco')
        fl = 960
        pen.path([(80, fl), (1000, fl)], RED, 5, prog(t, 9.0, 9.4), key='fz')
        pen.write("0°C  freezing level", 830, fl + 10, 40, RED, prog(t, 9.3, 9.8), tick)
        grow = ease(prog(t, 10.0, 13.0))
        for i, (x, y) in enumerate([(300, 760), (470, 700), (640, 770), (400, 880), (570, 870)]):
            fall = max(0.0, t - 13.2 - i * 0.25) * 260
            yy = y + fall
            if yy > 1420:
                continue
            if yy > fl:          # below the 0°C level the crystal melts: it falls on as rain
                droplet(pen, x, yy, 18, BLUE, 1, ('fd', i))
            else:
                snowflake(pen, x, yy, 14 + 26 * grow, PURPLE, prog(t, 9.6, 10.2), ('sf', i))
        r = random.Random(8)
        for i in range(12):
            x = 220 + r.uniform(0, 500); y = 690 + r.uniform(0, 240)
            rad = 11 * (1 - 0.8 * grow)
            if rad > 2.5 and t < 14:
                droplet(pen, x, y, rad, BLUE, prog(t, 9.8, 10.3), ('wd', i), fill=False)
        pen.marker(INK)
        return img

    if t < 24.8:                                                   # warm cloud: coalescence
        chip(pen, t, "WAY 2 · WARM CLOUD", ORANGE, 16.85, tick)
        pen.write("Tops below the freezing level", 490, 345, 60, INK, prog(t, 16.9, 17.8), tick)
        pen.write("droplets collide and coalesce", 490, 425, 56, ORANGE, prog(t, 18.0, 18.9), tick)
        pen.write("(common in tropical areas)", 490, 500, 44, GREY, prog(t, 18.8, 19.5), tick)
        sun = [(880 + 55 * math.cos(a), 660 + 55 * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 24)]
        pen.hatch(sun, YELLOW, prog(t, 17.2, 17.6), gap=12, key='sun', alpha=220)
        pen.path(sun, ORANGE, 6, prog(t, 17.0, 17.4), key='suno')
        c = cloud(450, 1130, 760, 330)
        pen.hatch(c, (224, 242, 254), prog(t, 17.2, 18.0), gap=20, key='wc', alpha=180)
        pen.path(c, INK, 8, prog(t, 17.0, 17.8), key='wco')
        for i, (x0, y0) in enumerate([(260, 920), (400, 880), (560, 930), (330, 1030), (620, 1040)]):
            m = ease(prog(t, 19.2 + i * 0.35, 20.2 + i * 0.35))           # two droplets drift together and merge
            ax, bx = x0 - 50 * (1 - m), x0 + 50 * (1 - m)
            if m < 1:
                droplet(pen, ax, y0, 12, BLUE, 1, ('m1', i), fill=False); droplet(pen, bx, y0, 12, BLUE, 1, ('m2', i), fill=False)
            else:
                droplet(pen, x0, y0, 20, BLUE, 1, ('mm', i))
        if t > 21.5:                                               # a big drop falls, sweeping small ones on its way
            y = 1000 + (t - 21.5) * 180
            if y < 1420:
                droplet(pen, 450, y, 30, BLUE, 1, 'big')
                for k in range(4):
                    sy = 1180 + k * 50
                    if sy > y + 20:
                        droplet(pen, 450 + (-1) ** k * 26, sy, 7, BLUE, 1, ('sm', k), fill=False)
        pen.marker(INK)
        return img

    if t < 30.5:                                                   # sea salt: giant nucleus
        chip(pen, t, "WAY 3 · SEA SALT", GREEN, 24.85, tick)
        pen.write("Near the sea, salt from", 490, 345, 64, INK, prog(t, 24.9, 25.8), tick)
        pen.write("sea spray starts the drops", 490, 425, 64, GREEN, prog(t, 25.6, 26.6), tick)
        for k in range(3):
            wv = [(60 + u * 900, 1330 + k * 40 + 12 * math.sin(u * 14 + t * 3)) for u in np.linspace(0, 1, 40)]
            pen.path(wv, BLUE, 8, prog(t, 25.0 + 0.1 * k, 25.6 + 0.1 * k), key=('sw', k))
        c = cloud(470, 900, 640, 260)
        pen.hatch(c, (224, 242, 254), prog(t, 25.5, 26.2), gap=20, key='sc', alpha=180)
        pen.path(c, INK, 8, prog(t, 25.3, 26.0), key='sco')
        r = random.Random(12)
        for i in range(9):
            x = 250 + r.uniform(0, 440); ph = r.uniform(0, 1)
            y = 1300 - ((t * 0.25 + ph) % 1.0) * 480
            if t < 26.2:
                continue
            if y > 900:
                pen.path([(x - 7, y - 7), (x + 7, y - 7), (x + 7, y + 7), (x - 7, y + 7)], GREEN, 4, 1, 1.5, key=('salt', i), closed=True)
            else:
                droplet(pen, x, y - 40, 16, BLUE, 1, ('sd', i))
        pen.write("salt", 820, 1180, 48, GREEN, prog(t, 26.5, 27.0), tick)
        if t > 28.2:
            for i in range(14):
                x = 320 + (i * 37) % 300; y = 930 + ((t * 1.3 + i * 0.13) % 1.0) * 330
                pen.line((x, y), (x - 8, y + 30), BLUE, 5, 1.5, ('rr', i))
        pen.marker(INK)
        return img

    pen.write("Full chapter,", 490, 520, 96, INK, prog(t, 30.55, 31.0), tick)          # call to action
    pen.write("FREE!", 490, 630, 160, RED, prog(t, 30.8, 31.3), tick)
    pen.write("ghostaviator.com", 490, 860, 96, BLUE, prog(t, 31.2, 31.9), tick)
    pen.path([(170, 990), (820, 980)], ORANGE, 10, prog(t, 31.8, 32.1), key='cu1')
    pen.write("DGCA Meteorology · Capt. Pankaj Pahil", 490, 1070, 50, INK, prog(t, 32.0, 32.7), tick)
    c = cloud(490, 1330, 1170, 170)
    pen.hatch(c, SKY, prog(t, 32.2, 32.9), gap=18, key='ecf', alpha=190)
    pen.path(c, INK, 7, prog(t, 32.1, 32.8), key='eco')
    for i in range(6):
        droplet(pen, 400 + i * 36, 1370 + (i % 2) * 30 + ((t * 120) % 40), 9, BLUE, prog(t, 32.6, 33.0), ('ed', i), fill=False)
    pen.marker(BLUE)
    return img

# ------------------------------------------------------------------------------------------ fog (met-7), 28 Sep 2026
FOG_SPANS = [(0.0, 2.6), (3.45, 8.6), (10.55, 13.4), (16.55, 18.4), (21.55, 25.0), (27.85, 29.4), (30.85, 33.2)]
FOG_GROUND = 1300

def fog_band(pen, top, bottom, t, p, key, x0=60, x1=940):
    """A soft fog layer: pale grey hachure between a wavy top edge and the ground."""
    edge = [(x, top + 14 * math.sin(x / 70 + t * 0.8)) for x in np.linspace(x0, x1, 28)]
    poly = edge + [(x1, bottom), (x0, bottom)]
    pen.hatch(poly, (148, 163, 184), p, gap=16, angle=-8, w=4, key=(key, 'h'), alpha=120)
    pen.path(edge, GREY, 5, p, 2, key=(key, 'e'))

def ground(pen, t, p, key='gr', grass=True):
    pen.path([(40, FOG_GROUND), (960, FOG_GROUND)], INK, 8, p, key=key)
    if grass:
        for i, x in enumerate(range(90, 940, 70)):
            pen.path([(x, FOG_GROUND), (x - 8, FOG_GROUND - 26)], GREEN, 5, p, 1.5, key=(key, 'g', i))
            pen.path([(x, FOG_GROUND), (x + 10, FOG_GROUND - 30)], GREEN, 5, p, 1.5, key=(key, 'h', i))

def hwind(pen, x, y, length, p, key, col=SKY):
    pen.path([(x, y), (x + length, y)], col, 8, p, 2, key=(key, 's'))
    pen.path([(x + length - 26, y - 18), (x + length, y), (x + length - 26, y + 18)], col, 8, prog(p, 0.6, 1.0), 2, key=(key, 'h'))

def moon(pen, cx, cy, r, p, key):
    # A crescent: the lit limb outside, the shadowed limb as an inner arc - pale, so it never reads as the sun.
    outer = [(cx + r * math.cos(a), cy + r * math.sin(a)) for a in np.linspace(-1.9, 1.9, 26)]
    inner = [(cx + 0.45 * r + 0.8 * r * math.cos(a), cy + 0.95 * r * math.sin(a)) for a in np.linspace(1.75, -1.75, 26)]
    pen.hatch(outer + inner, (226, 232, 240), p, gap=8, key=(key, 'f'), alpha=230)
    pen.path(outer + inner, GREY, 5, p, 1.5, key=(key, 'o'), closed=True)

def star(pen, x, y, s, p, key):
    pen.path([(x - s, y), (x + s, y)], YELLOW, 4, p, 1, key=(key, 'a'))
    pen.path([(x, y - s), (x, y + s)], YELLOW, 4, p, 1, key=(key, 'b'))

def scene_fog(t, tick):
    img = Image.new("RGB", (W, H), PAPER)
    pen = Pen(img, tick)
    d = pen.d
    for gy in range(40, H, 60):
        for gx in range(40, W, 60):
            d.point((gx, gy), fill=(226, 222, 210))

    if t < 3.4:                                                    # hook: a cloud sitting on the ground
        pen.write("Fog is a cloud", 490, 330, 100, INK, prog(t, 0.0, 0.6), tick)
        pen.write("sitting on the ground", 490, 450, 80, GREY, prog(t, 0.4, 1.1), tick)
        ground(pen, t, prog(t, 0.2, 0.6), grass=False)
        rw = [(330, FOG_GROUND), (650, FOG_GROUND), (560, 1010), (420, 1010)]              # a runway vanishing into it
        pen.path(rw, INK, 6, prog(t, 0.4, 0.9), key='rw', closed=True)
        for i in range(5):
            y = FOG_GROUND - 40 - i * 55
            pen.path([(490, y), (490, y - 25)], YELLOW, 7, prog(t, 0.7 + i * 0.05, 0.9 + i * 0.05), 1, key=('cl', i))
        fog_band(pen, 900, FOG_GROUND, t, prog(t, 1.0, 1.8), 'hf')
        pen.write("visibility below 1000 m", 490, 1350, 56, RED, prog(t, 1.9, 2.6), tick)
        pen.marker(GREY)
        return img

    if t < 10.5:                                                   # radiation fog: the four conditions
        chip(pen, t, "RADIATION FOG", PURPLE, 3.45, tick)
        pen.write("Clear night: the ground cools", 490, 345, 62, INK, prog(t, 3.5, 4.4), tick)
        pen.write("and the air on it cools too", 490, 420, 54, GREY, prog(t, 4.2, 5.0), tick)
        moon(pen, 820, 590, 50, prog(t, 4.0, 4.5), 'mn')
        for i, (x, y) in enumerate([(160, 560), (300, 640), (620, 540), (700, 700)]):
            star(pen, x, y, 14, prog(t, 4.3 + i * 0.1, 4.6 + i * 0.1), ('st', i))
        rows = [("1  High humidity", BLUE, 5.2), ("2  Clear sky", ORANGE, 5.9), ("3  Light wind, 3–7 kt", SKY, 6.6), ("4  Stable air", GREEN, 7.3)]
        for i, (txt, col, a) in enumerate(rows):
            pen.write(txt, 490, 780 + i * 95, 62, col, prog(t, a, a + 0.6), tick)
        ground(pen, t, prog(t, 4.6, 5.1))
        for k in range(3):                                         # the ground loses heat upward, into the clear sky
            shaft, head = arrow(260 + k * 240, FOG_GROUND - 40, 110)
            pen.path(shaft, RED, 7, prog(t, 5.0 + 0.15 * k, 5.4 + 0.15 * k), key=('ha', k))
            pen.path(head, RED, 7, prog(t, 5.3 + 0.15 * k, 5.5 + 0.15 * k), key=('hh', k))
        fog_band(pen, FOG_GROUND - 120 + 60 * (1 - ease(prog(t, 8.2, 10.0))), FOG_GROUND, t, prog(t, 8.2, 9.2), 'rf')
        pen.marker(INK)
        return img

    if t < 16.5:                                                   # too calm / too windy
        chip(pen, t, "TOO CALM? TOO WINDY?", ORANGE, 10.55, tick)
        pen.write("Calm:", 260, 390, 70, INK, prog(t, 10.6, 11.0), tick)
        pen.write("only DEW", 260, 470, 64, BLUE, prog(t, 10.9, 11.5), tick)
        pen.write("Strong wind:", 720, 390, 62, INK, prog(t, 12.6, 13.1), tick)
        pen.write("mixed away", 720, 470, 64, RED, prog(t, 13.0, 13.6), tick)
        pen.path([(490, 380), (490, 1320)], GREY, 4, prog(t, 10.6, 11.0), 1.5, key='div')
        pen.path([(40, FOG_GROUND), (470, FOG_GROUND)], INK, 7, prog(t, 10.7, 11.1), key='gl')
        pen.path([(510, FOG_GROUND), (960, FOG_GROUND)], INK, 7, prog(t, 12.7, 13.1), key='grr')
        for i, x in enumerate(range(80, 460, 60)):                 # left: grass beaded with dew
            pen.path([(x, FOG_GROUND), (x - 6, FOG_GROUND - 40)], GREEN, 5, prog(t, 11.1, 11.5), 1.5, key=('lg', i))
            droplet(pen, x - 6, FOG_GROUND - 52, 9, BLUE, prog(t, 11.6 + i * 0.08, 12.0 + i * 0.08), ('dew', i))
        pen.write("drops settle on the grass", 260, 1360, 42, GREY, prog(t, 12.0, 12.6), tick)
        for k in range(3):                                         # right: wind churns the layer
            hwind(pen, 540, 820 + k * 150, 300, prog(t, 13.2 + 0.2 * k, 13.8 + 0.2 * k), ('sw', k), RED)
            sp = [(740 + (6 + 40 * u) * math.cos(u * 2 * math.pi * 2.2 + t * 3), 900 + k * 150 + (6 + 40 * u) * math.sin(u * 2 * math.pi * 2.2 + t * 3))
                  for u in np.linspace(0, 1, 44)]
            pen.path(sp, GREY, 4, prog(t, 13.8 + 0.2 * k, 14.4 + 0.2 * k), 1.5, key=('sp', k))
        pen.write("no layer cools enough", 720, 1360, 42, GREY, prog(t, 14.2, 14.8), tick)
        pen.marker(INK)
        return img

    if t < 21.5:                                                   # after sunrise: lifts into stratus, then goes
        chip(pen, t, "AFTER SUNRISE", YELLOW, 16.55, tick)
        pen.write("Clears 2–3 hours after sunrise", 490, 345, 60, INK, prog(t, 16.6, 17.5), tick)
        pen.write("usually lifting into low stratus first", 490, 420, 48, GREY, prog(t, 17.4, 18.3), tick)
        rise = ease(prog(t, 16.6, 20.0))
        sy = FOG_GROUND - 40 - 420 * rise
        sun = [(820 + 70 * math.cos(a), sy + 70 * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 30)]
        pen.hatch(sun, YELLOW, prog(t, 16.6, 17.0), gap=12, key='sun', alpha=220)
        pen.path(sun, ORANGE, 6, prog(t, 16.6, 17.0), key='suno', closed=True)
        ground(pen, t, 1.0)
        lift = ease(prog(t, 17.6, 20.6))
        top = FOG_GROUND - 200 - 380 * lift
        bottom = FOG_GROUND - 360 * lift
        fog_band(pen, top, bottom, t, 1.0, 'lf', 60, 700)
        if lift > 0.5:
            pen.write("low stratus", 380, top - 80, 52, GREY, prog(t, 19.2, 19.8), tick)
        pen.marker(ORANGE)
        return img

    if t < 27.8:                                                   # advection fog
        chip(pen, t, "ADVECTION FOG", SKY, 21.55, tick)
        pen.write("Warm moist air moves over", 490, 345, 62, INK, prog(t, 21.6, 22.5), tick)
        pen.write("a COLD surface", 490, 425, 70, BLUE, prog(t, 22.3, 23.0), tick)
        for k in range(3):                                         # warm sea on the left
            wv = [(40 + u * 380, 1290 + k * 36 + 10 * math.sin(u * 16 + t * 3)) for u in np.linspace(0, 1, 30)]
            pen.path(wv, BLUE, 7, prog(t, 21.7 + 0.1 * k, 22.2 + 0.1 * k), key=('sea', k))
        pen.write("warm", 230, 1390, 48, ORANGE, prog(t, 22.2, 22.6), tick)
        pen.path([(440, FOG_GROUND), (960, FOG_GROUND)], INK, 8, prog(t, 22.0, 22.4), key='cl')
        pen.hatch([(440, FOG_GROUND), (960, FOG_GROUND), (960, FOG_GROUND + 60), (440, FOG_GROUND + 60)], SKY,
                  prog(t, 22.2, 22.8), gap=12, key='cold', alpha=200)
        pen.write("cold land", 700, 1390, 48, BLUE, prog(t, 22.4, 22.9), tick)
        for k in range(2):
            hwind(pen, 120, 1020 + k * 110, 360, prog(t, 22.8 + 0.3 * k, 23.6 + 0.3 * k), ('aw', k), ORANGE)
        spread = ease(prog(t, 23.6, 25.6))
        fog_band(pen, FOG_GROUND - 190, FOG_GROUND, t, prog(t, 23.6, 24.4), 'af', 440, 440 + 520 * spread + 1)
        pen.write("day OR night", 300, 620, 60, PURPLE, prog(t, 25.0, 25.6), tick)
        pen.write("more persistent", 680, 700, 56, RED, prog(t, 25.6, 26.3), tick)
        pen.marker(INK)
        return img

    if t < 30.8:                                                   # India
        chip(pen, t, "IN INDIA", GREEN, 27.85, tick)
        pen.write("A winter hazard", 490, 360, 80, INK, prog(t, 27.9, 28.6), tick)
        pen.write("usually after a Western Disturbance", 490, 470, 50, PURPLE, prog(t, 28.5, 29.4), tick)
        snowflake(pen, 490, 640, 60, SKY, prog(t, 28.0, 28.6), 'wf')
        ground(pen, t, 1.0, grass=False)
        fog_band(pen, FOG_GROUND - 260, FOG_GROUND, t, prog(t, 28.8, 29.8), 'if')
        pen.write("rain, then the sky clears...", 490, 800, 52, BLUE, prog(t, 29.4, 30.0), tick)
        pen.write("...and fog by morning", 490, 880, 52, RED, prog(t, 29.9, 30.5), tick)
        pen.marker(INK)
        return img

    pen.write("Full chapter,", 490, 520, 96, INK, prog(t, 30.85, 31.3), tick)          # call to action
    pen.write("FREE!", 490, 630, 160, RED, prog(t, 31.1, 31.6), tick)
    pen.write("ghostaviator.com", 490, 860, 96, BLUE, prog(t, 31.5, 32.2), tick)
    pen.path([(170, 990), (820, 980)], ORANGE, 10, prog(t, 32.1, 32.4), key='cu1')
    pen.write("DGCA Meteorology · Capt. Pankaj Pahil", 490, 1070, 50, INK, prog(t, 32.3, 33.0), tick)
    ground(pen, t, prog(t, 32.2, 32.6), grass=False)
    fog_band(pen, FOG_GROUND - 120, FOG_GROUND, t, prog(t, 32.4, 33.0), 'ef')
    pen.marker(BLUE)
    return img

# ------------------------------------------------------------------------------------------ icing (met-12), 2 Oct 2026
ICING_SPANS = [(0.0, 2.6), (3.45, 6.0), (10.55, 13.0), (17.05, 19.5), (22.05, 25.0), (27.85, 29.8), (30.85, 33.2)]
ICE = (224, 242, 254)                                              # pale ice blue

def aerofoil(cx, cy, chord, tc=0.15):
    """A symmetric aerofoil, leading edge on the LEFT (the air comes from the left). Returns (upper, lower) point lists."""
    up, lo = [], []
    for u in np.linspace(0, 1, 40) ** 1.8:
        yt = 5 * tc * chord * (0.2969 * math.sqrt(u) - 0.126 * u - 0.3516 * u ** 2 + 0.2843 * u ** 3 - 0.1036 * u ** 4)
        x = cx - chord / 2 + chord * u
        up.append((x, cy - yt)); lo.append((x, cy + yt))
    return up, lo

def wing(pen, cx, cy, chord, p, key):
    up, lo = aerofoil(cx, cy, chord)
    outline = up + lo[::-1]
    pen.hatch(outline, (203, 213, 225), p, gap=18, w=3, key=(key, 'f'), alpha=150)
    pen.path(outline, INK, 7, p, 2, key=(key, 'o'), closed=True)
    return up, lo

def drops_in(pen, t, t0, x_le, cy, r, n, key, spread=150, speed=520):
    """Supercooled drops streaming in from the left toward the leading edge; each vanishes as it reaches it."""
    rr = random.Random(key)
    for i in range(n):
        y = cy + rr.uniform(-spread, spread)
        start = t0 + i * 0.22
        if t < start:
            continue
        x = 60 + ((t - start) * speed) % (x_le - 60 - r * 2)
        droplet(pen, x, y, r, BLUE, 1.0, (key, i), fill=r > 8)

def rime_lump(pen, x_le, cy, grow, p, key):
    """Rough, opaque rime growing FORWARD from the leading edge into the airstream."""
    rr = random.Random(7)
    pts = []
    for k, a in enumerate(np.linspace(-1.25, 1.25, 23)):
        reach = grow * (90 + rr.uniform(0, 70)) * math.cos(a) ** 0.6
        pts.append((x_le + 8 - reach * math.cos(a) - (14 if k % 2 else 0) * grow, cy + 44 * math.sin(a) * (1 + 0.35 * grow)))
    poly = [(x_le + 45, cy - 40)] + pts + [(x_le + 45, cy + 40)]
    if p > 0.3 and grow > 0.05:                                     # milky-white body: opaque, so it hides the wing
        pen.d.polygon(poly, fill=(241, 245, 249, 255))
    pen.hatch(poly, GREY, p, gap=15, angle=-50, w=3, key=(key, 'g'), alpha=120)
    for k in range(0, len(pts) - 1, 3):                             # rough, crusty texture
        pen.path([pts[k], ((pts[k][0] + x_le) / 2, pts[k][1])], GREY, 3, p, 2.5, key=(key, 'c', k), alpha=150)
    pen.path(pts, GREY, 5, p, 3.5, key=(key, 'o'))

def glaze_sheet(pen, up, lo, reach, thick, p, key):
    """Clear ice: a glassy sheet that has run BACK along both surfaces, lumpy at its trailing edge."""
    for side, pts, s in (('u', up, -1), ('l', lo, 1)):
        n = max(2, int(len(pts) * reach))
        inner = pts[:n]
        outer = [(x, y + s * thick * (1.0 + 0.3 * math.sin(i * 0.9)) * (1 - 0.4 * i / n)) for i, (x, y) in enumerate(inner)]
        poly = inner + outer[::-1]
        if p > 0.3:
            pen.d.polygon(poly, fill=SKY + (90,))
        pen.hatch(poly, SKY, p, gap=9, angle=20, w=3, key=(key, side, 'f'), alpha=170)
        pen.path(outer, BLUE, 5, p, 1.5, key=(key, side, 'o'))
        for i in range(0, n, 6):                                       # glints: it is glossy
            x, y = outer[i]
            pen.path([(x - 6, y - s * 4), (x + 8, y - s * 12)], (255, 255, 255), 4, p, 0.5, key=(key, side, 'g', i))

def fern(pen, x, y, h, p, key):
    """A feathery hoar-frost crystal standing on a surface."""
    pen.path([(x, y), (x, y - h)], SKY, 4, p, 1, key=(key, 's'))
    for k in range(1, 5):
        yy = y - h * k / 5; L = h * 0.32 * (1 - k / 6)
        for s in (-1, 1):
            pen.path([(x, yy), (x + s * L, yy - L * 0.7)], SKY, 3, p, 1, key=(key, k, s))

def scene_icing(t, tick):
    img = Image.new("RGB", (W, H), PAPER)
    pen = Pen(img, tick)
    d = pen.d
    for gy in range(40, H, 60):
        for gx in range(40, W, 60):
            d.point((gx, gy), fill=(226, 222, 210))
    CX, CY, CH = 600, 1000, 640
    XLE = CX - CH / 2

    if t < 3.4:                                                    # hook
        pen.write("How does ice grow", 490, 330, 92, INK, prog(t, 0.0, 0.6), tick)
        pen.write("on a wing?", 490, 450, 84, GREY, prog(t, 0.4, 1.0), tick)
        drops_in(pen, t, 0.8, XLE, CY, 9, 8, 'hd')
        rime_lump(pen, XLE, CY, ease(prog(t, 1.4, 3.2)), prog(t, 1.4, 1.9), 'hr')
        wing(pen, CX, CY, CH, prog(t, 0.2, 0.8), 'hw')
        pen.write("supercooled drops: liquid below 0°C", 490, 1250, 46, BLUE, prog(t, 1.9, 2.7), tick)
        pen.marker(INK)
        return img

    if t < 10.5:                                                   # rime
        chip(pen, t, "RIME ICE", GREY, 3.45, tick)
        pen.write("SMALL drops", 490, 345, 80, INK, prog(t, 3.5, 4.1), tick)
        pen.write("freeze INSTANTLY on impact", 490, 445, 58, BLUE, prog(t, 4.0, 4.8), tick)
        drops_in(pen, t, 4.2, XLE, CY, 7, 12, 'rd')
        rime_lump(pen, XLE, CY, ease(prog(t, 4.6, 8.0)), prog(t, 4.6, 5.2), 'rl')
        wing(pen, CX, CY, CH, 1.0, 'rw')
        pen.write("grows FORWARD,", 300, 640, 50, GREY, prog(t, 6.2, 6.8), tick)
        pen.write("into the airstream", 300, 700, 50, GREY, prog(t, 6.6, 7.2), tick)
        rows = [("opaque, milky-white", GREY, 7.6), ("rough", GREY, 8.3), ("light and porous", GREEN, 9.0)]
        for i, (txt, col, a) in enumerate(rows):
            pen.write(txt, 490, 1230 + i * 80, 58, col, prog(t, a, a + 0.6), tick)
        pen.marker(INK)
        return img

    if t < 17.0:                                                   # clear / glaze
        chip(pen, t, "CLEAR ICE (GLAZE)", BLUE, 10.55, tick)
        pen.write("LARGE drops", 490, 345, 80, INK, prog(t, 10.6, 11.2), tick)
        pen.write("spread BACK, then freeze", 490, 445, 58, BLUE, prog(t, 11.1, 11.9), tick)
        up, lo = wing(pen, CX, CY, CH, 1.0, 'gw')
        drops_in(pen, t, 11.2, XLE, CY, 17, 7, 'gd', spread=60, speed=440)
        glaze_sheet(pen, up, lo, 0.15 + 0.45 * ease(prog(t, 11.8, 14.5)), 42, prog(t, 11.8, 12.3), 'gs')
        rows = [("clear, hard, dense, HEAVY", BLUE, 13.6), ("breaks off in dangerous lumps", ORANGE, 14.4)]
        for i, (txt, col, a) in enumerate(rows):
            pen.write(txt, 490, 1220 + i * 80, 56, col, prog(t, a, a + 0.7), tick)
        pen.write("MOST HAZARDOUS", 490, 1420, 92, RED, prog(t, 15.2, 15.9), tick)
        pen.path([(150, 1540), (830, 1530)], RED, 9, prog(t, 15.9, 16.3), key='mh')
        pen.marker(RED)
        return img

    if t < 22.0:                                                   # hoar frost
        chip(pen, t, "HOAR FROST", SKY, 17.05, tick)
        pen.write("Moist, CLOUDLESS air", 490, 345, 68, INK, prog(t, 17.1, 17.8), tick)
        pen.write("vapour turns straight to ice", 490, 430, 54, BLUE, prog(t, 17.7, 18.5), tick)
        pen.write("(sublimation)", 490, 500, 46, GREY, prog(t, 18.3, 18.8), tick)
        for i, (x, y) in enumerate([(160, 640), (330, 720), (650, 620), (850, 700)]):
            star(pen, x, y, 14, prog(t, 17.2 + i * 0.1, 17.5 + i * 0.1), ('hs', i))
        sy = 1010                                                  # a wing's upper skin, seen side-on
        pen.path([(80, sy + 40), (300, sy), (900, sy + 20)], INK, 8, prog(t, 17.3, 17.9), key='skin')
        pen.hatch([(80, sy + 40), (300, sy), (900, sy + 20), (900, sy + 90), (80, sy + 90)], (203, 213, 225),
                  prog(t, 17.5, 18.0), gap=18, w=3, key='skf', alpha=150)
        for i, x in enumerate(range(130, 880, 52)):
            yy = sy + 40 - (x - 80) * 40 / 220 if x < 300 else sy + (x - 300) * 20 / 600
            fern(pen, x, yy, 34 + 22 * random.Random(i).random(), prog(t, 18.6 + i * 0.07, 19.0 + i * 0.07), ('fe', i))
        pen.write("feathery ice crystals", 490, 1110, 56, SKY, prog(t, 19.4, 20.0), tick)
        pen.write("also: a cold-soaked aircraft", 490, 1260, 52, INK, prog(t, 20.2, 20.8), tick)
        pen.write("descending into warm, moist air", 490, 1330, 52, ORANGE, prog(t, 20.7, 21.4), tick)
        pen.marker(SKY)
        return img

    if t < 27.8:                                                   # effects
        chip(pen, t, "WHAT ICE DOES", RED, 22.05, tick)
        rime_lump(pen, XLE, 780, 1.0, 1.0, 'el')
        up, lo = wing(pen, CX, 780, CH, 1.0, 'ew')
        for name, (x, y, L, upw, col), a in (("LIFT", (CX, 700, 150, True, GREEN), 22.3),
                                             ("WEIGHT", (CX - 60, 860, 150, False, ORANGE), 22.8),
                                             ("DRAG", (CX + 335, 780, 0, None, PURPLE), 23.3)):
            if upw is None:
                pen.path([(x, y), (x + 100, y)], col, 9, prog(t, a, a + 0.4), key=(name, 's'))
                pen.path([(x + 76, y - 20), (x + 100, y), (x + 76, y + 20)], col, 9, prog(t, a + 0.3, a + 0.5), key=(name, 'h'))
                pen.write(name, x + 40, y + 34, 42, col, prog(t, a + 0.3, a + 0.7), tick)
            else:
                shaft, head = arrow(x, y, L, up=upw)
                pen.path(shaft, col, 9, prog(t, a, a + 0.4), key=(name, 's'))
                pen.path(head, col, 9, prog(t, a + 0.3, a + 0.5), key=(name, 'h'))
                pen.write(name, x + 120, (y - L - 30) if upw else (y + L - 30), 42, col, prog(t, a + 0.3, a + 0.7), tick)
        rows = [("weight UP, lift DOWN", INK, 24.0), ("drag UP", PURPLE, 24.7), ("stalling speed UP", RED, 25.4),
                ("iced pitot: ASI can read wrong", BLUE, 26.2)]
        for i, (txt, col, a) in enumerate(rows):
            pen.write(txt, 490, 1150 + i * 92, 60 if i < 3 else 52, col, prog(t, a, a + 0.6), tick)
        pen.marker(RED)
        return img

    if t < 30.8:                                                   # carburettor icing
        chip(pen, t, "CARB ICING", ORANGE, 27.85, tick)
        pen.write("Hot day? Still possible.", 490, 345, 70, INK, prog(t, 27.9, 28.6), tick)
        tx, ty = 220, 640                                          # thermometer at +30
        tube = [(tx - 22, ty), (tx + 22, ty), (tx + 22, ty + 420), (tx - 22, ty + 420)]
        pen.path(tube, INK, 6, prog(t, 27.9, 28.3), key='th', closed=True)
        bulb = [(tx + 46 * math.cos(a), ty + 470 + 46 * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 26)]
        pen.hatch(bulb, RED, prog(t, 28.1, 28.4), gap=8, key='tb', alpha=230)
        pen.path(bulb, INK, 6, prog(t, 28.1, 28.4), key='tbo', closed=True)
        lvl = ty + 420 - 300 * ease(prog(t, 28.2, 28.9))
        pen.hatch([(tx - 12, lvl), (tx + 12, lvl), (tx + 12, ty + 440), (tx - 12, ty + 440)], RED, 1.0, gap=6, key='tl', alpha=230)
        pen.write("+30°C", tx, ty - 90, 70, RED, prog(t, 28.6, 29.0), tick)
        vx = 560                                                   # the carburettor venturi, with ice at the throat
        lw = [(vx - 180, 640), (vx - 60, 820), (vx - 60, 960), (vx - 180, 1140)]
        rw = [(vx + 180, 640), (vx + 60, 820), (vx + 60, 960), (vx + 180, 1140)]
        pen.path(lw, INK, 7, prog(t, 28.0, 28.5), key='vl'); pen.path(rw, INK, 7, prog(t, 28.0, 28.5), key='vr')
        for k, (s, x0) in enumerate(((1, vx - 60), (-1, vx + 60))):
            ice = [(x0, 800), (x0 + s * 34, 850), (x0 + s * 22, 890), (x0 + s * 38, 930), (x0, 980)]
            pen.hatch(ice, ICE, prog(t, 29.0, 29.4), gap=6, key=('ci', k), alpha=255)
            pen.path(ice, SKY, 5, prog(t, 29.0, 29.4), 1.5, key=('co', k), closed=True)
        pen.write("air in", vx, 560, 44, GREY, prog(t, 28.4, 28.7), tick)
        pen.write("if humidity is HIGH", 490, 1260, 62, BLUE, prog(t, 29.3, 29.9), tick)
        pen.write("not only a cold-weather problem", 490, 1350, 50, INK, prog(t, 29.8, 30.5), tick)
        pen.marker(ORANGE)
        return img

    pen.write("Full chapter,", 490, 520, 96, INK, prog(t, 30.85, 31.3), tick)          # call to action
    pen.write("FREE!", 490, 630, 160, RED, prog(t, 31.1, 31.6), tick)
    pen.write("ghostaviator.com", 490, 860, 96, BLUE, prog(t, 31.5, 32.2), tick)
    pen.path([(170, 990), (820, 980)], ORANGE, 10, prog(t, 32.1, 32.4), key='cu1')
    pen.write("DGCA Meteorology · Capt. Pankaj Pahil", 490, 1070, 50, INK, prog(t, 32.3, 33.0), tick)
    wing(pen, CX, 1350, 520, prog(t, 32.2, 32.8), 'cw')
    pen.marker(BLUE)
    return img

SCENES = {'thunderstorm': (lambda t, k: scene(t, k), FLASHES, DRAW_SPANS),
          'trs': (scene_trs, [], TRS_SPANS),
          'rain': (scene_rain, [], RAIN_SPANS),
          'fog': (scene_fog, [], FOG_SPANS),
          'icing': (scene_icing, [], ICING_SPANS)}

# ------------------------------------------------------------------------------------------ sound: bright music + scribbles
def audio(length, flashes=FLASHES, spans=DRAW_SPANS, wind=None, quiet=(14, 22), rain=None):
    n = int(SR * length); t = np.arange(n) / SR; out = np.zeros(n)
    bpm = 104; beat = 60 / bpm
    chords = [(60, 64, 67), (55, 59, 62), (57, 60, 64), (53, 57, 60)]          # C G Am F - bright, not ominous
    k = 0
    while k * beat / 2 < length - 1.2:
        at = k * beat / 2
        ch = chords[int(at // (beat * 4)) % 4]
        m = ch[k % 3] + (12 if (k // 3) % 2 else 0)
        a = int(at * SR); L = min(int(0.5 * SR), n - a)
        s = np.arange(L) / SR
        f = explainer.note(m)
        pluck = (np.sin(2 * np.pi * f * s) + 0.35 * np.sin(4 * np.pi * f * s)) * np.exp(-s * 7)
        storm = 0.6 if quiet[0] <= at < quiet[1] else 1.0
        out[a:a + L] += 0.10 * storm * pluck
        if k % 2 == 0 and at >= 3.2:
            Lk = min(int(0.25 * SR), n - a); sk = np.arange(Lk) / SR
            out[a:a + Lk] += (0.28 if quiet[0] <= at < quiet[1] else 0.18) * np.sin(2 * np.pi * (50 * sk + 70 * (1 - np.exp(-sk * 35)) / 35)) * np.exp(-sk * 12)
        k += 1
    rng = np.random.default_rng(3)
    for a, b in spans:                                        # marker scribble while drawing
        i0, i1 = int(a * SR), min(n, int(b * SR))
        noise = explainer.lowpass(rng.standard_normal(i1 - i0), 5000) - explainer.lowpass(rng.standard_normal(i1 - i0), 900) * 0
        mod = 0.5 + 0.5 * np.sin(2 * np.pi * 11 * np.arange(i1 - i0) / SR + rng.uniform(0, 6)) ** 2
        env = np.minimum(1, np.arange(i1 - i0) / (0.05 * SR)) * np.minimum(1, (i1 - i0 - np.arange(i1 - i0)) / (0.05 * SR))
        out[i0:i1] += 0.045 * noise / (np.abs(noise).max() + 1e-9) * mod * env
    for a, b in (wind or []):                                 # wind roar (cyclone): slow swells of filtered noise
        i0, i1 = int(a * SR), min(n, int(b * SR)); L = i1 - i0
        roar = explainer.lowpass(rng.standard_normal(L), 700)
        swell = 0.55 + 0.45 * np.sin(2 * np.pi * 0.35 * np.arange(L) / SR) * np.sin(2 * np.pi * 0.11 * np.arange(L) / SR)
        env = np.minimum(1, np.arange(L) / (0.6 * SR)) * np.minimum(1, (L - np.arange(L)) / (0.6 * SR))
        out[i0:i1] += 0.30 * roar / (np.abs(roar).max() + 1e-9) * swell * env
    for a, b in (rain or []):                                 # rainfall: soft high hiss with a slow swell
        i0, i1 = int(a * SR), min(n, int(b * SR)); L = i1 - i0
        hiss = rng.standard_normal(L); hiss = hiss - explainer.lowpass(hiss, 2500)
        env = np.minimum(1, np.arange(L) / (0.8 * SR)) * np.minimum(1, (L - np.arange(L)) / (0.8 * SR))
        out[i0:i1] += 0.09 * hiss / (np.abs(hiss).max() + 1e-9) * env
    for i, f in enumerate(flashes):                           # thunder
        a = int((f + 0.2) * SR); L = min(int(2.6 * SR), n - a)
        s = np.arange(L) / SR
        brown = np.cumsum(np.random.default_rng(20 + i).standard_normal(L))
        brown -= np.convolve(brown, np.ones(2000) / 2000, mode="same")
        rum = explainer.lowpass(brown, 240) * np.minimum(1, s / 0.02) * np.exp(-s * 1.6)
        out[a:a + L] += 0.75 * rum / (np.abs(rum).max() + 1e-9)
    out *= np.clip((length - t) / 1.2, 0, 1)
    return out / (np.abs(out).max() + 1e-9) * 0.89

# ------------------------------------------------------------------------------------------ render
def render(topic="thunderstorm"):
    checked = explainer.verify(topic)             # same facts, same verbatim check
    spec = explainer.TOPICS[topic]
    OUT.mkdir(exist_ok=True)
    wav, mp4 = OUT / f"sketch-{topic}.wav", OUT / f"sketch-{topic}.mp4"
    draw, flashes, spans = SCENES[topic]
    wind = [(0.0, 3.4), (17.5, 25.5)] if topic == 'trs' else None
    explainer.write_wav(wav, audio(spec["length"], flashes, spans, wind, (14, 22) if topic == 'thunderstorm' else (99, 99),
                                   RAIN_SOUND if topic == 'rain' else None))
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                           "-i", "-", "-i", str(wav), "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
                           "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), "-c:a", "aac", "-b:a", "192k", "-shortest",
                           "-movflags", "+faststart", str(mp4)], stdin=subprocess.PIPE)
    frames = int(spec["length"] * FPS)
    for i in range(frames):
        ff.stdin.write(draw(i / FPS, i // BOIL).tobytes())
        if i % 150 == 0:
            print(f"  frame {i}/{frames}", flush=True)
    ff.stdin.close()
    if ff.wait() != 0:
        raise SystemExit("ffmpeg failed")
    wav.unlink()
    mp4.with_suffix(".txt").write_text(spec["caption"] + "\n", encoding="utf-8")
    print(f"{mp4}  ({checked} source phrases verified verbatim in {spec['chapter']})")

if __name__ == "__main__":
    render(sys.argv[1] if len(sys.argv) > 1 else "thunderstorm")
