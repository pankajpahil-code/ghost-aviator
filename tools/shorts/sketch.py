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

# ------------------------------------------------------------------------------------------ sound: bright music + scribbles
def audio(length):
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
        storm = 0.6 if 14 <= at < 22 else 1.0
        out[a:a + L] += 0.10 * storm * pluck
        if k % 2 == 0 and at >= 3.2:
            Lk = min(int(0.25 * SR), n - a); sk = np.arange(Lk) / SR
            out[a:a + Lk] += (0.28 if 14 <= at < 22 else 0.18) * np.sin(2 * np.pi * (50 * sk + 70 * (1 - np.exp(-sk * 35)) / 35)) * np.exp(-sk * 12)
        k += 1
    rng = np.random.default_rng(3)
    for a, b in DRAW_SPANS:                                   # marker scribble while drawing
        i0, i1 = int(a * SR), min(n, int(b * SR))
        noise = explainer.lowpass(rng.standard_normal(i1 - i0), 5000) - explainer.lowpass(rng.standard_normal(i1 - i0), 900) * 0
        mod = 0.5 + 0.5 * np.sin(2 * np.pi * 11 * np.arange(i1 - i0) / SR + rng.uniform(0, 6)) ** 2
        env = np.minimum(1, np.arange(i1 - i0) / (0.05 * SR)) * np.minimum(1, (i1 - i0 - np.arange(i1 - i0)) / (0.05 * SR))
        out[i0:i1] += 0.045 * noise / (np.abs(noise).max() + 1e-9) * mod * env
    for i, f in enumerate(FLASHES):                           # thunder
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
    explainer.write_wav(wav, audio(spec["length"]))
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                           "-i", "-", "-i", str(wav), "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
                           "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), "-c:a", "aac", "-b:a", "192k", "-shortest",
                           "-movflags", "+faststart", str(mp4)], stdin=subprocess.PIPE)
    frames = int(spec["length"] * FPS)
    for i in range(frames):
        ff.stdin.write(scene(i / FPS, i // BOIL).tobytes())
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
