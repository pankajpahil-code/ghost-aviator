import json, re, sys, math, os
W = sys.argv[1]
kw = json.load(open(W + r'\kwgn_q.json', encoding='utf-8'))
CM_PER_NM = 185200.0


def sp(x):
    return f"{x:,.0f}".replace(',', ' ')


def fmt_scale(x):
    return f"1 : {x:,.0f}".replace(',', ' ')


def _unused(x):
    return f"1 : {x:,.0f}"


def cosd(a):
    return math.cos(math.radians(a))


QSUB = {
    33: [('1 :  400  000', '1 : 4 000 000')],
    38: [('1: 2 000 000', '1: 200 000')],
    27: [(' 1 : 26 050 000.', '')],
}
OPTFIX = {27: {'a': '1 : 26 050 000.'}, 32: {'c': '444 mm.'}, 59: {'d': '270 nm.'}, 72: {'d': '1 : 3 800 000.'}}
NOTES = {
    33: 'Word copy printed the scale as 1 : 400 000; the book works it at 1 : 4 000 000, the only value consistent with its options.',
    38: 'Word copy printed the scale as 1 : 2 000 000; the book works it at 1 : 200 000, the only value consistent with its options.',
    27: 'Option a had been run into the end of the question text in the Word copy; restored as option a.',
    32: 'Option c printed 444 cm; the book keys c and its own working gives 444 mm, so the unit is corrected.',
    59: 'Options a and d were both 256 NM; d changed to 270 NM so the options are distinct.',
    72: 'Options b and d were both 1 : 6 200 000; d changed to 1 : 3 800 000 so the options are distinct.',
    26: 'The book key reads ambiguously in the scan; computed answer is d.',
}


def solve(q):
    t = q.replace('’', "'")
    tl = t.lower()
    sc = re.search(r'1\s*:\s*([\d ]+\d)', t)
    sc = float(sc.group(1).replace(' ', '')) if sc else None
    m = re.search(r'total\s+length of the (\d+)o?\s*([ns]) parallel.*?is (\d+(?:\.\d+)?)\s*cm.*?latitude (\d+)o?\s*([ns])', tl)
    if m:
        L, lat2 = float(m.group(3)), float(m.group(4))
        earth_cm = 21600 * cosd(lat2) * CM_PER_NM
        v = earth_cm / L
        return 'scale', v, (f"On a Mercator chart every parallel is drawn the same length, so the {m.group(1)}{m.group(2).upper()} parallel and the {m.group(4)}{m.group(5).upper()} parallel are both {L:g} cm long. "
                            f"Earth length of the {m.group(4)}{m.group(5).upper()} parallel = 21 600 x cos {m.group(4)} = {21600 * cosd(lat2):.0f} NM = {sp(earth_cm)} cm. "
                            f"Scale = {L:g} : {sp(earth_cm)}, about {fmt_scale(v)}.")
    m = re.search(r'latitude (?:of )?(\d+)o?\s*([ns])(?:orth|outh)?.*?(?:distance of|represents)\s*(\d+(?:\.\d+)?)\s*nm.*?latitude (\d+)o?\s*([ns])', tl)
    if m:
        a, d, b = float(m.group(1)), float(m.group(3)), float(m.group(4))
        v = d * cosd(b) / cosd(a)
        return 'nm', v, (f"On a Mercator chart scale varies with sec(latitude), so the same chart length covers ground in proportion to cos(latitude). "
                         f"Distance at {m.group(4)}{m.group(5).upper()} = {d:g} x cos {b:g} / cos {a:g} = {v:.1f} NM.")
    m = re.search(r'correspond to (\d+(?:\.\d+)?)\s*cm', tl) or re.search(r'(\d+(?:\.\d+)?)\s*(?:centimet\w*|cm)\b', tl)
    if m and sc and ('earth distance' in tl or 'correspond' in tl or 'distance from' in tl):
        c = float(m.group(1)); v = c * sc / CM_PER_NM
        return 'nm', v, f"Earth distance = chart distance x scale denominator = {c:g} cm x {sp(sc)} = {sp(c * sc)} cm. Divide by 185 200 cm per NM: {v:.1f} NM."
    m = re.search(r'longitudes? (\d+)o?\s*([ew])\s*and (\d+)o?\s*([ew])', tl)
    if m and sc:
        a = float(m.group(1)) * (1 if m.group(2) == 'e' else -1); b = float(m.group(3)) * (1 if m.group(4) == 'e' else -1)
        dl = abs(a - b); dl = min(dl, 360 - dl); nm = dl * 60; v = nm * CM_PER_NM * 10 / sc
        return 'mm', v, (f"The two meridians are {dl:g} deg apart across the 180 deg meridian = {nm:g} min of longitude = {nm:g} NM along the equator. "
                         f"Chart distance = {nm:g} x 185 200 cm / {sp(sc)} = {v / 10:.1f} cm = {v:.0f} mm.")
    m = re.search(r'(?:at|latitude) (\d+)o?\s*([ns]) the scale.*?1\s*:\s*([\d ]+\d).*?scale at the equator', tl)
    if m:
        v = float(m.group(3).replace(' ', '')) / cosd(float(m.group(1)))
        return 'scale', v, f"Mercator scale is proportional to sec(latitude), so the scale denominator at the equator = {m.group(3).strip()} / cos {m.group(1)} = {sp(v)}, i.e. {fmt_scale(v)}."
    m = re.search(r'scale at the equator\s*=?\s*1\s*:\s*([\d ]+\d).*?latitude (\d+)', tl)
    if m:
        den = float(m.group(1).replace(' ', '')); v = den * cosd(float(m.group(2)))
        return 'scale', v, f"Mercator scale is proportional to sec(latitude), so the denominator at {m.group(2)} deg = {sp(den)} x cos {m.group(2)} = {sp(v)}, i.e. {fmt_scale(v)}."
    m = re.search(r'(?:measures?|line on a chart|chart)\s*(\d+(?:\.\d+)?)\s*cm.*?represents?\s*(\d+)\s*nm', tl) or re.search(r'(\d+(?:\.\d+)?)\s*cm long represents\s*(\d+)\s*nm', tl)
    if m:
        c, nm = float(m.group(1)), float(m.group(2)); v = nm * CM_PER_NM / c
        return 'scale', v, f"Scale = chart distance / earth distance = {c:g} cm / ({nm:g} x 185 200 cm) = 1 : {sp(v)}."
    m = re.search(r'distance of (\d+)\s*nm is equal to (\d+(?:\.\d+)?)\s*cm', tl)
    if m:
        nm, c = float(m.group(1)), float(m.group(2)); v = nm * CM_PER_NM / c
        return 'scale', v, f"Scale = {c:g} cm / ({nm:g} x 185 200 cm) = 1 : {sp(v)}."
    m = re.search(r'meridians? (?:space[ds]? )?(\d+)o? apart (?:at|along) latitude (\d+)o?\s*([ns])\w* is (\d+(?:\.\d+)?)\s*cm', tl)
    if m:
        dl, lat, c = float(m.group(1)), float(m.group(2)), float(m.group(4))
        dep = dl * 60 * cosd(lat); v = dep * CM_PER_NM / c
        return 'scale', v, (f"Earth distance = departure = {dl * 60:g} min x cos {lat:g} = {dep:.1f} NM = {sp(dep * CM_PER_NM)} cm. "
                            f"Scale = {c:g} / {sp(dep * CM_PER_NM)} = 1 : {sp(v)}.")
    m = re.search(r'at (\d+)o?\s*north the chart distance between meridians (\d+)o? apart is (\d+) inches', tl)
    if m:
        lat, dl, inch = float(m.group(1)), float(m.group(2)), float(m.group(3))
        dep = dl * 60 * cosd(lat); earth_in = dep * 1852 / 0.0254; v = earth_in / inch
        return 'scale', v, f"Departure = {dl * 60:g} x cos {lat:g} = {dep:.1f} NM = {sp(earth_in)} inches. Scale = {inch:g} / {sp(earth_in)} = 1 : {sp(v)}."
    return None, None, None


def num(v, kind):
    s = v.replace(',', '')
    if kind == 'scale':
        m = re.search(r'1\s*:\s*([\d ]+\d)', s)
        return float(m.group(1).replace(' ', '')) if m else None
    m = re.search(r'(\d+(?:\.\d+)?)\s*(mm|cm|nm|NM)?', s)
    if not m:
        return None
    x = float(m.group(1))
    if kind == 'mm' and m.group(2) == 'cm':
        x *= 10
    return x


out = []
for k in kw:
    if k['sec'] != 'SCALE' or k['site_dup'] or k['internal_dup']:
        continue
    n = k['n']; q = k['q'].strip(); opts = dict(k['opts'])
    for a, b in QSUB.get(n, []):
        assert a in q, (n, a)
        q = q.replace(a, b)
    for c, v in OPTFIX.get(n, {}).items():
        opts[c] = v
    q = re.sub(r'\s+', ' ', q)
    kind, val, exp = solve(q)
    rec = {'sec': 'SCALE', 'n': n, 'ch': k['ch'], 'subj': k['subj'], 'notes': [NOTES[n]] if n in NOTES else []}
    if n == 36:
        rec.update(status='DROPPED', reason='Same data as question 23 of this section; one copy kept.'); out.append(rec); continue
    if kind is None:
        rec.update(status='UNSOLVED', q=q, opts=opts); out.append(rec); continue
    best = None
    for c in 'abcd':
        x = num(opts.get(c, ''), kind)
        if x is None:
            continue
        d = abs(x - val) / val
        if best is None or d < best[1]:
            best = (c, d)
    rec.update(q=q, opts=[opts[c].strip() for c in 'abcd'], ans='abcd'.index(best[0]), gap=round(best[1], 4),
               exp=exp + (f" Answer: {opts[best[0]].strip().rstrip('.')}." if best[1] <= 0.004 else f" The nearest option is {opts[best[0]].strip().rstrip('.')}."), status='CORRECTED' if n in (33, 38, 27, 32) else 'VERIFIED')
    out.append(rec)
json.dump(out, open(os.path.join(W, 'final', 'scale.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out), 'unsolved', [r['n'] for r in out if r['status'] == 'UNSOLVED'],
      'gap>5%', [(r['n'], r['gap']) for r in out if r.get('gap', 0) > 0.05])
