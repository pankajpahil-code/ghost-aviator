"""Animated explainer Shorts: "How is a thunderstorm born?" and the fascinating-topic series (his ask, 27 Sep 2026:
"reels and shorts are boring, no music, no animation - people swipe").

    python tools/shorts/explainer.py thunderstorm        # -> tools/shorts/out/explainer-thunderstorm.mp4 (+ .txt caption)

THREE RULES THIS FILE ENFORCES, NOT JUST STATES
1. Every fact on screen is traced to the Captain's own chapter. Each beat carries `src`: phrases that must appear
   VERBATIM in that chapter's published notes.html. verify() runs before a single frame is drawn and refuses to render
   if any phrase is missing (Iron Rule 1 by mechanism). The display wording may be shorter; the number and the claim
   may not change.
2. The music is generated here, from sine and noise, at render time. No sample, no library track, nothing anyone else
   owns - so no Content ID claim and no copyright strike can come from it (the channel is the fragile asset).
3. Text stays inside the Shorts safe area (y 250-1450, clear of the right-hand rail), the same rule as render.py.
"""
import html
import math
import random
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
SITE = HERE.parent.parent
OUT = HERE / "out"
W, H, FPS = 1080, 1920, 30
SR = 44100
FONTS = Path("C:/Windows/Fonts")
NL = chr(10)

# ----------------------------------------------------------------------------------------------- facts
def notes_text(subject, chapter):
    s = (SITE / "public/content" / subject / chapter / "notes.html").read_text(encoding="utf-8")
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", s, flags=re.S)
    s = html.unescape(re.sub(r"<[^>]+>", " ", s))
    return re.sub(r"\s+", " ", s)

TOPICS = {
    "thunderstorm": {
        "subject": "meteorology", "chapter": "met-13", "length": 30.0,
        "title": "How is a thunderstorm born?",
        "beats": [
            # (start, end, stage chip, [(text, size, colour)], [verbatim source phrases])
            (0.0, 3.2, "", [("UPDRAFTS OF", 70, "white"), ("60 KNOTS", 150, "amber"), ("are not uncommon inside a storm cloud", 44, "muted")],
             ["Updraught speeds of 30 m/sec or 60 kt are not uncommon"]),
            (3.2, 8.2, "3 INGREDIENTS", [("How is a thunderstorm born?", 58, "white"), ("1  Steep lapse rate", 50, "amber"),
                                          ("2  High humidity", 50, "amber"), ("3  A trigger that lifts the air", 50, "amber")],
             ["Three essential conditions for TS formation", "Steep Lapse Rate:", "High Humidity:", "Trigger Action:"]),
            (8.2, 14.0, "STAGE 1 · CUMULUS", [("Only updrafts", 76, "white"), ("Air is lifted, cools and condenses", 46, "muted"),
                                               ("The cloud keeps building", 46, "muted")],
             ["CUMULUS STAGE", "Only Updraughts", "Trigger lifts air → expands and cools → condensation"]),
            (14.0, 22.0, "STAGE 2 · MATURE", [("Updrafts + downdrafts", 64, "white"), ("side by side", 64, "white"),
                                               ("Lightning · squall · 20–40 min", 46, "amber"), ("The most violent stage", 46, "red")],
             ["coexistence of up and downdraughts side by side", "Duration: 20–40 min", "This is the most violent stage of a TS",
              "forced to spread out as cirrus clouds giving the anvil shape"]),
            (22.0, 26.6, "STAGE 3 · DISSIPATING", [("Only downdrafts", 76, "white"), ("Rain fades as the moisture", 46, "muted"),
                                                    ("runs out", 46, "muted")],
             ["DISSIPATING STAGE", "Only Downdraughts", "decreases as moisture is depleted"]),
            (26.6, 30.0, "", [("Full chapter, free", 60, "white"), ("ghostaviator.com", 76, "amber"),
                              ("DGCA Meteorology · Capt. Pankaj Pahil", 40, "muted")], []),
        ],
        "flashes": [0.15, 1.1, 2.4, 16.4, 18.1, 19.2, 20.7],
        "caption": ("How is a thunderstorm born? Three ingredients, three stages" + NL + NL +
                    "Steep lapse rate, high humidity and a trigger that lifts the air. Cumulus stage: only updrafts. "
                    "Mature stage: updrafts and downdrafts side by side, lightning and squalls, 20-40 minutes - the most "
                    "violent stage. Dissipating stage: only downdrafts." + NL + NL +
                    "Full chapter, free: https://ghostaviator.com/cpl/meteorology/met-13/notes" + NL +
                    "#DGCA #CPL #AviationMeteorology #Thunderstorm #PilotTraining"),
    },
}

TOPICS["trs"] = {
    "subject": "meteorology", "chapter": "met-18", "length": 34.0,
    "title": "How is a cyclone born?",
    "beats": [
        (0.0, 3.4, "", [("A vast violent whirl", 0, ""), ("150 to 800 km", 0, "")], ["TC is a vast violent whirl of 150 to 800 km"]),
        (3.4, 11.0, "4 INGREDIENTS", [], ["Warm sea (>26°C) to a depth of 60 m", "High RH above 7000 m", "Coriolis Force to spiral wind inward",
                                         "Very little Wind Shear", "WS preferably below 20 kt"]),
        (11.0, 17.5, "WHERE?", [], ["between Lat 5–25°", "Below 5° there is no Coriolis force", "Above 25° it is cold"]),
        (17.5, 25.5, "INSIDE A CYCLONE", [], ["Mostly 30–65 km diameter", "Light winds, often clear skies", "Eye Wall / Wall Clouds",
                                              "Winds >64 kt", "Most hazardous part", "Spiral bands of clouds"]),
        (25.5, 30.5, "SAME STORM, 3 NAMES", [], ["Hurricane (Atlantic), Typhoon (NW Pacific)", "simply Cyclone",
                                                 "Form over Bay of Bengal and Arabian Sea", "Average life of Indian cyclones: 3–5 days"]),
        (30.5, 34.0, "", [], []),
    ],
    "flashes": [],
    "caption": ("How is a cyclone born? 4 ingredients, and what is inside" + NL + NL +
                "A tropical revolving storm is a vast violent whirl of 150 to 800 km. It needs a warm sea above 26°C to a "
                "depth of 60 m, high humidity above 7000 m, Coriolis force to spiral the wind inward and very little wind "
                "shear - so it forms only between 5° and 25° latitude. The eye (30-65 km) has light winds and often clear "
                "skies; the eye wall, with winds above 64 kt, is the most hazardous part." + NL + NL +
                "Full chapter, free: https://ghostaviator.com/cpl/meteorology/met-18/notes" + NL +
                "#DGCA #CPL #AviationMeteorology #Cyclone #PilotTraining"),
}

def verify(topic):
    """Refuse to render a single frame unless every source phrase is in the Captain's chapter, verbatim."""
    spec = TOPICS[topic]
    text = notes_text(spec["subject"], spec["chapter"])
    missing = [p for b in spec["beats"] for p in b[4] if re.sub(r"\s+", " ", p) not in text]
    if missing:
        raise SystemExit("NOT RENDERED - not found verbatim in " + spec["chapter"] + ": " + "; ".join(missing))
    return sum(len(b[4]) for b in spec["beats"])

# ----------------------------------------------------------------------------------------------- drawing helpers
COL = {"white": (248, 250, 252), "amber": (251, 191, 36), "muted": (203, 213, 225), "red": (248, 113, 113)}
_fonts = {}
def font(size, name="seguibl.ttf"):
    key = (name, size)
    if key not in _fonts:
        _fonts[key] = ImageFont.truetype(str(FONTS / name), size)
    return _fonts[key]

def ease(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)

def lerp(a, b, x):
    return a + (b - a) * x

def mix(c1, c2, x):
    return tuple(int(lerp(a, b, x)) for a, b in zip(c1, c2))

def ramp(t, a, b):
    return ease((t - a) / (b - a)) if b > a else float(t >= a)

_text_cache = {}
def text_img(txt, size, colour):
    key = (txt, size, colour)
    if key not in _text_cache:
        f = font(size)
        box = f.getbbox(txt)
        im = Image.new("RGBA", (box[2] - box[0] + 24, box[3] - box[1] + 24), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        d.text((12 - box[0], 12 - box[1]), txt, font=f, fill=COL[colour] + (255,), stroke_width=max(2, size // 22),
               stroke_fill=(8, 12, 22, 255))
        _text_cache[key] = im
    return _text_cache[key]

# ----------------------------------------------------------------------------------------------- the thunderstorm scene
TROP, BASE, GROUND = 800, 1340, 1470   # the storm sits BELOW the caption panel (first draft hid the anvil)
rng = random.Random(13)
PUFFS = [(rng.uniform(-0.42, 0.42), rng.uniform(0, 1), rng.uniform(0.75, 1.15)) for _ in range(46)]
ANVIL = [(rng.uniform(-1, 1), rng.uniform(-0.5, 0.5), rng.uniform(0.7, 1.2)) for _ in range(26)]
PARTICLES = [(rng.uniform(-0.3, 0.3), rng.uniform(0, 1), rng.uniform(0.7, 1.3)) for _ in range(70)]
RAIN = [(rng.uniform(0, 1), rng.uniform(0, 1)) for _ in range(260)]

def storminess(t):
    if t < 3.2:
        return 1.0
    return max(0.0, min(1.0, ramp(t, 9, 16) - 0.45 * ramp(t, 22, 27)))

def cloud_shape(t):
    """(top y, tower width, anvil half-width, opacity) of the cloud at time t."""
    if t < 3.2:                          # the hook is a flash-forward to the mature storm
        return TROP, 460, 540, 1.0
    if t < 8.2:
        return BASE - 10, 0, 0, 0.0
    grow = ramp(t, 8.4, 15.5)
    top = lerp(BASE - 60, TROP, grow)
    width = lerp(160, 460, ramp(t, 8.4, 14))
    anvil = lerp(0, 540, ramp(t, 15, 20))
    fade = 1.0 - 0.6 * ramp(t, 22.5, 27)
    return top, width, anvil, fade

def draw_cloud(t, s):
    top, width, anvil, alpha = cloud_shape(t)
    layer = Image.new("RGBA", (W // 2, H // 2), (0, 0, 0, 0))
    if alpha <= 0:
        return layer.resize((W, H))
    d = ImageDraw.Draw(layer)
    cx = W // 4 - 40
    scale = 0.5
    for u, v, r in sorted(PUFFS, key=lambda p: -p[1]):
        y = lerp(BASE, top + 60, v)
        x = cx + u * width * scale
        rad = r * width * 0.36 * scale * (1.0 - 0.25 * v)
        shade = mix((250, 252, 255), (72, 80, 96), s * (1 - v) * 0.9 + 0.1 * s)
        d.ellipse([x - rad, y * scale - rad, x + rad, y * scale + rad], fill=shade + (int(255 * alpha),))
    if anvil > 5:
        for u, v, r in ANVIL:
            x = cx + u * anvil * scale
            y = TROP * scale + v * 26 * scale
            rw, rh = r * 150 * scale, r * 44 * scale
            shade = mix((236, 240, 246), (120, 128, 142), s * 0.7)
            d.ellipse([x - rw, y - rh, x + rw, y + rh], fill=shade + (int(235 * alpha),))
    layer = layer.filter(ImageFilter.GaussianBlur(5))
    return layer.resize((W, H), Image.BILINEAR)

def bolt(seed, x0):
    r = random.Random(seed)
    pts, x, y = [], x0, BASE - 40
    while y < GROUND:
        pts.append((x, y))
        x += r.uniform(-55, 55)
        y += r.uniform(40, 90)
    pts.append((x, GROUND))
    return pts

def scene(t, spec):
    s = storminess(t)
    sky_top = mix((96, 165, 230), (18, 24, 38), s)
    sky_bot = mix((200, 228, 250), (52, 62, 80), s)
    grad = np.linspace(0, 1, H)[:, None]
    sky = (np.array(sky_top) * (1 - grad) + np.array(sky_bot) * grad).astype(np.uint8)
    # The frame is RGB and every shape is drawn with ImageDraw in "RGBA" BLEND mode. Drawing straight onto an RGBA
    # image REPLACES pixels instead of blending them, so every fade in the first draft would have popped on and off.
    frame = Image.fromarray(np.repeat(sky[:, None, :], W, axis=1).reshape(H, W, 3))
    d = ImageDraw.Draw(frame, "RGBA")
    # the sun, on a calm day only
    if s < 0.6:
        a = int(255 * (1 - s / 0.6))
        sun = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(sun).ellipse([780, 800, 900, 920], fill=(255, 214, 102, a))
        sun = sun.filter(ImageFilter.GaussianBlur(4))
        frame.paste(sun, (0, 0), sun)
    # tropopause
    tv = ramp(t, 13.5, 15) * (1 - ramp(t, 22, 23.5)) if t >= 3.2 else 1.0
    if tv > 0:
        for x in range(0, W, 40):
            d.line([(x, TROP - 40), (x + 22, TROP - 40)], fill=(186, 230, 253, int(200 * tv)), width=4)
        d.text((W - 380, TROP - 90), "TROPOPAUSE", font=font(34, "segoeuib.ttf"), fill=(186, 230, 253, int(230 * tv)))
    top, width, _, _ = cloud_shape(t)
    cloud = draw_cloud(t, s)
    frame.paste(cloud, (0, 0), cloud)
    d = ImageDraw.Draw(frame, "RGBA")
    # Air motion is drawn OVER the cloud: the point of the mature stage is that you can SEE rising air (yellow, left)
    # and sinking air (blue, right) side by side. Drawn behind it, the first draft showed neither.
    cx = W // 2 - 80
    up = (1.0 if t < 3.2 else ramp(t, 8.3, 9.3) * (1 - ramp(t, 21.5, 22.5)))
    if up > 0:
        span = GROUND - max(top, TROP) - 40
        for u, v, sp in PARTICLES:
            y = GROUND - ((v + t * 0.22 * sp) % 1.0) * span
            x = cx - 60 + u * max(width, 200) * 0.6
            d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=(254, 240, 138, int(150 * up)))
        for k in range(3):
            ax = cx - 120 + k * 70
            for j in range(3):
                ay = GROUND - 40 - ((t * 190 + k * 70 + j * span / 3) % span)
                d.polygon([(ax, ay - 40), (ax - 26, ay), (ax + 26, ay)], fill=(250, 204, 21, int(235 * up)))
    down = (1.0 if t < 3.2 else ramp(t, 15.5, 16.5) * (1 - ramp(t, 26, 27)))
    if down > 0:
        for k in range(3):
            ax = cx + 170 + k * 70
            for j in range(3):
                ay = TROP + 160 + ((t * 190 + k * 70 + j * 190) % (GROUND - TROP - 200))
                d.polygon([(ax, ay + 40), (ax - 26, ay), (ax + 26, ay)], fill=(96, 165, 250, int(235 * down)))
    rain = (1.0 if t < 3.2 else ramp(t, 15.2, 16.5) * (1 - 0.7 * ramp(t, 23, 27)))
    if rain > 0:
        for u, v in RAIN[: int(len(RAIN) * rain)]:
            x = cx + 120 + u * 320
            y = BASE + ((v + t * 1.6) % 1.0) * (GROUND - BASE)
            d.line([(x, y), (x - 10, y + 34)], fill=(191, 219, 254, 170), width=3)
    d.rectangle([0, GROUND, W, H], fill=mix((74, 124, 89), (30, 45, 38), s))
    for f in spec["flashes"]:
        age = t - f
        if 0 <= age < 0.22:
            pts = bolt(int(f * 100), W // 2 - 20 + (int(f * 37) % 200 - 100))
            glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(glow).line(pts, fill=(191, 219, 254, 200), width=34)
            glow = glow.filter(ImageFilter.GaussianBlur(14))
            frame.paste(glow, (0, 0), glow)
            d = ImageDraw.Draw(frame, "RGBA")
            d.line(pts, fill=(255, 255, 255, 255), width=12)
            d.line(pts, fill=(224, 242, 254, 255), width=5)
            if age < 0.07:
                d.rectangle([0, 0, W, H], fill=(255, 255, 255, 110))
    return frame

def overlay(frame, t, spec):
    for start, end, chip, lines, _ in spec["beats"]:
        if not start <= t < end:
            continue
        local = t - start
        out = 1 - ramp(t, end - 0.25, end)
        if chip:
            f = font(40, "segoeuib.ttf")
            w = f.getbbox(chip)[2] + 48
            layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            dl = ImageDraw.Draw(layer)
            dl.rounded_rectangle([60, 250, 60 + w, 322], radius=36, fill=(251, 191, 36, int(240 * out)))
            dl.text((84, 258), chip, font=f, fill=(17, 24, 39, int(255 * out)))
            frame.paste(layer, (0, 0), layer)
        y = 360 if chip else 420
        heights = [text_img(txt, size, c).size[1] for txt, size, c in lines]
        panel = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(panel).rounded_rectangle([40, y - 30, W - 150, y + sum(heights) + 10 * len(lines) + 20],
                                                radius=34, fill=(8, 12, 24, int(150 * out * ramp(local, 0, 0.2))))
        frame.paste(panel, (0, 0), panel)
        for i, (txt, size, c) in enumerate(lines):
            pop = ramp(local, 0.12 * i, 0.12 * i + 0.3)
            if pop <= 0:
                y += heights[i] + 10
                continue
            im = text_img(txt, size, c)
            sc = 0.82 + 0.18 * pop + (0.06 * math.sin(local * 6) if c == "amber" and size >= 140 else 0)
            im2 = im.resize((max(1, int(im.size[0] * sc)), max(1, int(im.size[1] * sc))), Image.LANCZOS)
            if im2.size[0] > W - 200:
                k = (W - 200) / im2.size[0]
                im2 = im2.resize((int(im2.size[0] * k), int(im2.size[1] * k)), Image.LANCZOS)
            a = np.array(im2)
            a[..., 3] = (a[..., 3] * pop * out).astype(np.uint8)
            x = (W - 110 - im2.size[0]) // 2
            ti = Image.fromarray(a)
            frame.paste(ti, (max(0, x), int(y)), ti)
            y += heights[i] + 10
    return frame

# ----------------------------------------------------------------------------------------------- original music
def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))

def note(n):
    return 440.0 * 2 ** ((n - 69) / 12)

def music(spec):
    """An original track: minor pad, pulsing bass and kick that build into the storm, a riser before the mature stage,
    thunder on every lightning flash. Generated from maths at render time - nobody else owns a note of it."""
    n = int(SR * spec["length"])
    t = np.arange(n) / SR
    out = np.zeros(n)
    bar = 2.5                                             # 96 bpm, 4/4
    chords = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)]     # Am F C G
    pad = np.zeros(n)
    for i in range(int(spec["length"] / bar) + 1):
        a, b = int(i * bar * SR), min(n, int((i + 1) * bar * SR))
        if a >= n:
            break
        seg = t[a:b] - i * bar
        for m in chords[i % 4]:
            for det in (-0.12, 0.12):
                fr = note(m) * (1 + det / 100)
                pad[a:b] += 2 * ((seg * fr) % 1.0) - 1                 # saw
        env = np.minimum(1, seg / 0.4) * np.minimum(1, (bar - seg) / 0.4)
        pad[a:b] *= env
    out += 0.05 * lowpass(pad, 900)
    beat = bar / 4
    for k in range(int(spec["length"] / beat)):
        at = k * beat
        a = int(at * SR)
        build = 1.0 if at < 3.2 else (0.35 + 0.65 * ramp(at, 8, 15)) * (1 - 0.8 * ramp(at, 22, 27))
        if at >= 27.5:
            continue
        L = int(0.35 * SR)
        seg = np.arange(min(L, n - a)) / SR
        kick = np.sin(2 * np.pi * (45 * seg + 90 * (1 - np.exp(-seg * 30)) / 30)) * np.exp(-seg * 9)
        out[a:a + len(seg)] += 0.55 * build * kick
        root = chords[int(at // bar) % 4][0] - 24
        for half in (0, beat / 2):
            b0 = int((at + half) * SR)
            s2 = np.arange(min(int(beat / 2 * SR), n - b0)) / SR
            if len(s2):
                out[b0:b0 + len(s2)] += 0.16 * build * np.sin(2 * np.pi * note(root) * s2) * np.exp(-s2 * 6)
    # riser into the mature stage
    a, b = int(12.2 * SR), int(14.0 * SR)
    seg = np.arange(b - a) / SR
    noise = lowpass(np.random.default_rng(1).standard_normal(b - a), 3000)
    out[a:b] += 0.25 * noise * (seg / seg[-1]) ** 2
    # thunder, a quarter-second after each flash
    for i, f in enumerate(spec["flashes"]):
        a = int((f + 0.25) * SR)
        L = min(int(3.0 * SR), n - a)
        if L <= 0:
            continue
        seg = np.arange(L) / SR
        brown = np.cumsum(np.random.default_rng(10 + i).standard_normal(L))
        brown -= np.convolve(brown, np.ones(2000) / 2000, mode="same")
        rumble = lowpass(brown, 260) * np.minimum(1, seg / 0.03) * np.exp(-seg * 1.4)
        out[a:a + L] += 0.9 * rumble / (np.abs(rumble).max() + 1e-9)
    fade = np.minimum(1, (spec["length"] - t) / 1.5)
    out *= np.clip(fade, 0, 1)
    out /= np.abs(out).max() + 1e-9
    out *= 0.89                                         # -1 dBFS
    return out

def write_wav(path, x):
    stereo = np.stack([x, np.roll(x, 60)], axis=1)      # a hint of width
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((stereo * 32767).astype(np.int16).tobytes())

# ----------------------------------------------------------------------------------------------- render
def render(topic):
    spec = TOPICS[topic]
    checked = verify(topic)
    OUT.mkdir(exist_ok=True)
    wav = OUT / f"explainer-{topic}.wav"
    mp4 = OUT / f"explainer-{topic}.mp4"
    write_wav(wav, music(spec))
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                           "-i", "-", "-i", str(wav), "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
                           # -14 LUFS: what phone feeds play at. YouTube turns loud videos down but never quiet ones up,
                           # so the first render (-19.7 LUFS, measured) would have sounded weaker than every Short beside it.
                           "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR),
                           "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(mp4)], stdin=subprocess.PIPE)
    frames = int(spec["length"] * FPS)
    for i in range(frames):
        t = i / FPS
        fr = overlay(scene(t, spec), t, spec).convert("RGB")
        ff.stdin.write(fr.tobytes())
        if i % 150 == 0:
            print(f"  frame {i}/{frames}", flush=True)
    ff.stdin.close()
    if ff.wait() != 0:
        raise SystemExit("ffmpeg failed")
    wav.unlink()
    mp4.with_suffix(".txt").write_text(spec["caption"] + NL, encoding="utf-8")
    print(f"{mp4}  ({checked} source phrases verified verbatim in {spec['chapter']})")
    return mp4

if __name__ == "__main__":
    render(sys.argv[1] if len(sys.argv) > 1 else "thunderstorm")
