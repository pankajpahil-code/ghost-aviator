import json, re, sys, math, os
W = sys.argv[1]
kw = json.load(open(W + r'\kwgn_q.json', encoding='utf-8'))
FT = 6076.12
FPM_PER_KT = FT / 60  # 101.27

DROP = {
    11: 'Rule of thumb (5 ft/min per kt) gives 125 ft/min, exact 3 deg geometry gives 133 ft/min; options offer both 125 and 135, so two answers are defensible.',
    77: 'Rule of thumb gives 110 ft/min, exact geometry 117 ft/min; options offer both 110 and 120, so two answers are defensible.',
    51: 'At 8 deg the 1 in 60 rule (3.1 NM) and exact trigonometry (2.9 NM, nearer 2.8) point to different options.',
    58: 'At 10 deg the 1 in 60 rule gives 6753 ft/min (option d) and exact trigonometry 7143 ft/min (nearer option b); two answers are defensible.',
    62: 'Exact ROD on a 5.5% slope at 450 kt is 2506 ft/min; the book keys 2390 using a double approximation, and no option matches the exact value.',
    34: 'Options b (2757) and c (2755) differ by 2 ft/min; the question cannot discriminate between them.',
    37: 'Same data as question 3 of this section (10 kt increase in headwind); one copy kept.',
    64: 'Exact height on a 5.5% gradient at 9 NM is about 3008 ft; no option is near it (the book reaches 2870 by an approximation).',
}
QSUB = {
    5: [('approximating 1 nm to 6000 ft', 'approximating 1 nm to 6080 ft')],
    100: [('the approximation 6000 feet = 1 nautical mile', 'the approximation 6080 feet = 1 nautical mile')],
    49: [('At 75 nm from a VOR', 'At 65 nm from a VOR')],
    67: [('when 105 NM from a VOR', 'when 85 NM from a VOR')],
    78: [('At what approximate distance from THR', 'Using the 1 in 60 rule, at what approximate distance from THR')],
    95: [('interception of a 3o ILS glide path will occur at approximately?', 'interception of a 3o ILS glide path will occur at approximately (use the 1 in 60 rule)?')],
}
OPTFIX = {66: {'c': '4170 ft/min.', 'd': '3020 ft/min'}}
NOTES = {
    5: 'The stem said 1 nm = 6000 ft, but the options are built on 6080 ft (7650 ft); stem aligned to 6080 ft.',
    100: 'The stem said 6000 ft = 1 NM, but the options are built on 6080 ft (5522 ft); stem aligned to 6080 ft.',
    49: 'The Word copy said 75 NM; the book works it with 65 NM, the only value consistent with its options.',
    67: 'The Word copy said 105 NM; the book works it with 85 NM, the only value consistent with its options.',
    78: 'Exact trigonometry (9.4 NM) and the 1 in 60 rule (9.9 NM) point to different options; stem now names the 1 in 60 rule, which the source uses.',
    95: 'Exact trigonometry (4.7 NM) and the 1 in 60 rule (4.9 NM) point to different options; stem now names the 1 in 60 rule, which the source uses.',
    66: 'Option d was printed as a second "b" in the source; relabelled.',
    18: 'The book header reads d, but its own working (increase by 75 ft/min) is option c.',
    98: 'The book header reads c, but its own working (1533 ft/min) is option d.',
    27: 'Keyed d (increase by 100 ft/min), matching the book working; the scanned header letter is unreliable.',
    31: 'Keyed c (increase by 85 ft/min), matching the book working; the scanned header letter is unreliable.',
}


def hhmm_add(st, mins):
    t = int(st[:2]) * 60 + int(st[2:]) + mins
    return f"{t // 60 % 24:02d}{t % 60:02d}"


def solve(q):
    t = q.lower()
    gs = re.search(r'(?:ground ?speed|gs)\D{0,30}?(\d{2,3})', t)
    gs = float(gs.group(1)) if gs else None
    m = re.search(r'(\d+(?:\.\d+)?)\s*m(?:eters|etres)?\s*/\s*s', t)
    if m and ('knot' in t or 'equivalent' in t):
        v = float(m.group(1)); r = v * 3600 / 1852
        return 'num', r, f"1 m/s = 3600 / 1852 = 1.944 kt, so {v:g} m/s x 1.944 = {r:.0f} kt."
    m = re.search(r'(\d+)\s*ft\s*/\s*min\s*equals', t)
    if m:
        v = float(m.group(1)); r = v * 0.3048 / 60
        return 'num', r, f"{v:g} ft/min x 0.3048 m/ft / 60 s = {r:.2f} m/s."
    m = re.search(r'(\d+)\s*knot (increase|decrease) in headwind', t) or re.search(r'(increase|decrease) in headwind of (\d+)', t)
    if m:
        if m.group(1).isdigit():
            v, d = float(m.group(1)), m.group(2)
        else:
            d, v = m.group(1), float(m.group(2))
        sign = -1 if d == 'increase' else 1
        r = 5 * v
        word = 'decreased' if sign < 0 else 'increased'
        return ('rod', r, sign), None, (f"On a 3 deg glideslope ROD is about 5 x groundspeed (exactly 5.3 x GS). A {v:g} kt {d} in headwind "
                                        f"{'reduces' if sign < 0 else 'raises'} groundspeed by {v:g} kt, so ROD must be {word} by about 5 x {v:g} = {r:.0f} ft/min (5.3 x {v:g} = {v*FPM_PER_KT*math.tan(math.radians(3)):.0f} ft/min exactly). The nearest option in the right direction is the answer.")
    m = re.search(r'(\d+(?:\.\d+)?)\s*%', t)
    if m and gs:
        p = float(m.group(1)); r = gs * p * FPM_PER_KT / 100
        r60 = gs * math.degrees(math.atan(p / 100)) / 60 * FPM_PER_KT
        return 'num', r, f"ROD = groundspeed in ft/min x gradient = {gs:g} kt x 101.3 ft/min per kt x {p:g}/100 = {r:.0f} ft/min (converting {p:g}% to {math.degrees(math.atan(p / 100)):.2f} deg and using the 1 in 60 rule gives {r60:.0f} ft/min)."
    m = re.search(r'(\d+(?:\.\d+)?)\s*o\s*glide', t) or re.search(r'angle\s*=\s*(\d+(?:\.\d+)?)', t)
    if m and gs and 'height' not in t:
        a = float(m.group(1)); r = gs * a / 60 * FPM_PER_KT; ex = gs * FPM_PER_KT * math.tan(math.radians(a))
        return 'num', r, f"By the 1 in 60 rule ROD = GS x angle / 60 x 101.3 = {gs:g} x {a:g} / 60 x 101.3 = {r:.0f} ft/min (exact tan {a:g} deg gives {ex:.0f} ft/min; the same option is closest either way)."
    m = re.search(r'at (\d+) nm dme', t) or re.search(r'dme range is (\d+) nm', t)
    if m and 'threshold' in t:
        d = float(m.group(1)); ftnm = 6080 if '6080' in t else 6000
        h = d * ftnm * 3 / 60; r = h + 50
        return 'num', r, f"Height change on a 3 deg slope = range x 3/60 = {d:g} x {ftnm} ft x 3/60 = {h:.0f} ft. Add the 50 ft threshold crossing height: {r:.0f} ft."
    m = re.search(r'height (?:of |is )?(\d+) f(?:ee)?t', t) or re.search(r'aircraft height (\d+)\s*ft', t)
    if m and ('glide path' in t or 'gp' in t):
        h = float(m.group(1)); an = float(re.search(r'(\d+(?:\.\d+)?)\s*o\b', t).group(1)); r = h * 60 / an / 6080
        return 'num', r, f"By the 1 in 60 rule, range = height x 60 / angle = {h:g} x 60 / {an:g} = {h * 60 / an:.0f} ft = {r:.1f} NM."
    m = re.search(r'descending (\d+) ft with a tas of (\d+).*?(\d+) ft/min', t)
    if m:
        h, tas, rod = map(float, m.groups()); tm = h / rod; r = tas * tm / 60
        return 'num', r, f"Descent time = {h:g} / {rod:g} = {tm:g} min. In still air distance = {tas:g} x {tm:g}/60 = {r:.2f} NM."
    fl = re.search(r'fl\s*(\d+).+?fl\s*(\d+)', t)
    if fl:
        f1, f2 = float(fl.group(1)), float(fl.group(2)); dh = abs(f1 - f2) * 100
        mrod = re.search(r'rate of descent (?:is |of )?(\d+)', t) or re.search(r'(?:mean )?rate of (?:descent of )?(\d+)\s*f', t)
        if 'latest time' in t:
            rod = float(re.search(r'(\d{4})\s*f', t).group(1))
            st = re.search(r'at (\d{4})', t).group(1)
            dist0 = float(re.search(r'(\d+)\s*nm (?:from|distant)', t).group(1))
            cgs = float(re.search(r'groundspeed of (\d+)|gs (\d+)', t).group(1) or re.search(r'gs (\d+)', t).group(1))
            dgs = float(re.findall(r'(\d+)\s*(?:knots|kt)', t)[-1])
            tdesc = dh / rod; ddesc = dgs * tdesc / 60; lev = dist0 - ddesc; tlev = lev / cgs * 60
            r = int(st[:2]) * 60 + int(st[2:]) + round(tlev)
            return 'eta', r, (f"Height to lose = {dh:.0f} ft; at {rod:g} ft/min that takes {tdesc:.1f} min, covering {dgs:g} x {tdesc:.1f}/60 = {ddesc:.1f} NM. "
                              f"So descent starts {ddesc:.1f} NM out, leaving {dist0:g} - {ddesc:.1f} = {lev:.1f} NM of level flight at {cgs:g} kt = {tlev:.1f} min. "
                              f"Latest start = {st} + {round(tlev)} min = {hhmm_add(st, round(tlev))}.")
        if 'minimum range' in t:
            rod = float(re.search(r'maximum rate of descent is (\d+)', t).group(1))
            tm = dh / rod; r = gs * tm / 60
            return 'num', r, f"Height to lose = {dh:.0f} ft. At {rod:g} ft/min that takes {tm:.1f} min. Distance = {gs:g} x {tm:.1f}/60 = {r:.1f} NM."
        d = float(re.search(r'(\d+)\s*nm', t).group(1)); tm = d / gs * 60; r = dh / tm
        return 'num', r, f"Height to lose = {dh:.0f} ft. Time available = {d:g} NM / {gs:g} kt = {tm:.2f} min. ROD = {dh:.0f} / {tm:.2f} = {r:.0f} ft/min."
    return None, None, None


def first_num(v):
    m = re.findall(r'\d+(?:\.\d+)?', v.replace(',', ''))
    return float(m[0]) if m else None


out = []
for k in kw:
    if k['sec'] != 'DESCENTS' or k['site_dup'] or k['internal_dup']:
        continue
    n = k['n']; rec = {'sec': 'DESCENTS', 'n': n, 'ch': k['ch'], 'subj': k['subj'], 'notes': [NOTES[n]] if n in NOTES else []}
    if n in DROP:
        rec.update(status='DROPPED', reason=DROP[n]); out.append(rec); continue
    q = k['q'].strip(); opts = dict(k['opts'])
    for a, b in QSUB.get(n, []):
        assert a in q, (n, a)
        q = q.replace(a, b)
    for c, v in OPTFIX.get(n, {}).items():
        opts[c] = v
    q = re.sub(r'\s+', ' ', q)
    kind, val, exp = solve(q)
    if kind is None:
        rec.update(status='UNSOLVED', q=q, opts=opts); out.append(rec); continue
    best = None
    for c in 'abcd':
        v = opts.get(c)
        if v is None:
            continue
        if isinstance(kind, tuple):
            if ('increas' in v.lower()) != (kind[2] > 0):
                continue
            x = first_num(v); target = kind[1]
        elif kind == 'eta':
            x = int(re.findall(r'\d{4}', v)[0]); x = x // 100 * 60 + x % 100; target = val
        else:
            x = first_num(v); target = val
        d = abs(x - target) / max(target, 1)
        if best is None or d < best[1]:
            best = (c, d)
    rec.update(q=q, opts=[opts[c].strip() for c in 'abcd'], ans='abcd'.index(best[0]), gap=round(best[1], 4),
               exp=exp + (f" Answer: {opts[best[0]].strip().rstrip('.')}." if best[1] <= 0.004 else f" The nearest option is {opts[best[0]].strip().rstrip('.')}."),
               status='CORRECTED' if n in QSUB or n in OPTFIX else 'VERIFIED')
    out.append(rec)
json.dump(out, open(os.path.join(W, 'final', 'desc.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out), 'dropped', sum(r['status'] == 'DROPPED' for r in out), 'unsolved', [r['n'] for r in out if r['status'] == 'UNSOLVED'],
      'gap>5%', [(r['n'], r['gap']) for r in out if r.get('gap', 0) > 0.05])
