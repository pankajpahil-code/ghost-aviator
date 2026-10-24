import json, re, sys, math, os
W = sys.argv[1]
kw = json.load(open(W + r'\kwgn_q.json', encoding='utf-8'))
sol = json.load(open(W + r'\pet_solved.json'))


def hm(h):
    m = round(h * 60)
    return f"{m // 60} h {m % 60:02d} min"


OV = {
    12: dict(kind='pet_eta', start='1435'), 37: dict(kind='pet_eta', start='1700'),
    62: dict(kind='pet_eta', start='1735'), 87: dict(kind='pet_eta', start='1600'),
    26: dict(kind='psr_dist', O=300, H=400, E=10),
    27: dict(kind='psr_time', O=350, H=460, E=8.5), 52: dict(kind='psr_time', O=375, H=480, E=9.5),
    77: dict(kind='psr_time', O=380, H=430, E=8.5),
    28: dict(kind='psr_dist', O=390, H=555, E=10),
    31: dict(kind='radius', TAS=260), 34: dict(kind='radius', TAS=380), 56: dict(kind='radius', TAS=280),
    59: dict(kind='radius', TAS=250), 84: dict(kind='radius', TAS=345),
    81: dict(kind='radius', TAS=350, status='CORRECTED',
             note='Book keyed c (180 NM). Worked by wind components and by the full wind triangle, the answer is 173 NM (b).'),
    32: dict(kind='psr_dist', O=390, H=450, E=8), 57: dict(kind='psr_dist', O=375, H=475, E=8),
    82: dict(kind='psr_dist', O=365, H=435, E=8),
    33: dict(kind='pet_dist', D=1200, O=460, H=520, opt={'d': '637 NM.'}, status='CORRECTED',
             note='Book keyed 624 NM, which divides by TAS (480) instead of the outbound groundspeed (460). Correct PET = 1200 x 520 / 980 = 637 NM; option d rewritten to 637 NM.'),
    83: dict(kind='pet_dist', D=1300, O=465, H=525, status='CORRECTED',
             note='Book keyed 676 NM by dividing by TAS (485) instead of groundspeed out (465). Correct PET = 1300 x 525 / 990 = 689 NM, option c (690 NM).'),
    58: dict(drop='Options a and b are blank in the source; the question cannot be asked as printed.'),
    40: dict(O=480, q_sub=[('420 kt', '480 kt')],
             note='Word copy had 420 kt; the book works it with 480 kt, the only value consistent with its options.'),
    43: dict(opt={'d': '1448 NM.'}, status='CORRECTED',
             note='Book keyed 1228 NM by multiplying the PSR time by the HOMEBOUND groundspeed. Correct = 3.37 h x 430 kt = 1448 NM; option d rewritten to 1448 NM.'),
    50: dict(H=450, q_sub=[("‘back’ 500 kt", "‘back’ 450 kt"), ("back' 500 kt", "back' 450 kt")],
             note='Word copy had groundspeed back 500 kt; the book works it with 450 kt, the only value consistent with its options.'),
    102: dict(kind='psr_time_h', O=250, H=350, E=4, q_sub=[('40 hours', '4 hours')],
              note='Word copy said 40 hours; the book works it with 4 hours.'),
    118: dict(q_sub=[('65 knots headwind', '20 knots headwind')],
              note='Word copy said 65 kt; the book works it with 20 kt, the only value consistent with its options.'),
    114: dict(status='CORRECTED', note='Book keyed a (4.32 h). 7 x 365 / (235 + 365) = 4.26 h, option b.'),
    99: dict(kind='psr_time_h', O=280, H=320, E=4),
}
WINDSIGN = ('On the flight between A and B the equivalent headwind is -20 kt. On the return leg between B and A, the equivalent headwind is +40 kt.',
            'From A to B the headwind component is 20 kt. On the return leg from B to A there is a tailwind component of 40 kt.')
for n in (33, 83):
    OV[n]['q_sub'] = [WINDSIGN]
    OV[n]['note'] += ' Stem reworded: the source signs (-20 headwind, +40 headwind) only fit the key if read as 20 kt head out and 40 kt tail back.'
for n in (30, 55, 80):
    OV.setdefault(n, {})['q_sub'] = [('if the wind component is 60 knots head?', 'if the wind component on the leg from the first airfield to the second is 60 knots head?')]
    OV[n]['note'] = 'Stem now states which leg has the headwind; read the other way round, one option (350 NM in Q80) would also fit.'
for n, (o, h, e) in {106: (270, 330, 5), 110: (155, 245, 10), 114: (235, 365, 7), 118: (80, 120, 5),
                     121: (280, 320, 10), 122: (280, 320, 6)}.items():
    OV.setdefault(n, {}).update(kind='psr_time_h', O=o, H=h, E=e)
for n, (o, h, e) in {1: (250, 350, 10), 76: (325, 425, 10), 108: (270, 330, 10), 116: (350, 250, 10),
                     120: (185, 215, 10), 124: (115, 285, 10), 125: (325, 475, 10)}.items():
    OV.setdefault(n, {}).update(kind='psr_dist', O=o, H=h, E=e)


def num(v):
    m = re.findall(r'\d+(?:\.\d+)?', v.replace(',', ''))
    return float(m[0]) if m else None


out = []
for k in kw:
    if k['sec'] != 'PSR & PET' or k['site_dup'] or k['internal_dup']:
        continue
    n = k['n']; ov = OV.get(n, {}); s = sol[str(n)]
    q = k['q'].strip(); opts = dict(k['opts'])
    rec = {'sec': k['sec'], 'n': n, 'ch': k['ch'], 'subj': k['subj'], 'notes': []}
    if ov.get('drop'):
        rec.update(status='DROPPED', reason=ov['drop']); out.append(rec); continue
    for a, b in ov.get('q_sub', []):
        q = q.replace(a, b)
    for c, v in ov.get('opt', {}).items():
        opts[c] = v
    tl = q.lower()
    kind = ov.get('kind')
    D = ov.get('D', s['D']); O = ov.get('O', s['O']); H = ov.get('H', s['H']); E = ov.get('E', s['E'])
    if not kind:
        if s['pet']:
            kind = 'pet_toB' if re.search(r'distance to b from', tl) else ('pet_time' if s['time'] else 'pet_dist')
        else:
            kind = 'psr_time' if s['time'] else 'psr_dist'
    TAS = None
    if kind == 'pet_eta':
        TAS = float(re.search(r'True airspeed (\d+)', q).group(1)); O = TAS + 55; H = TAS - 75
        D = float(re.search(r'(\d{4}) NM', q).group(1))
    if kind == 'radius':
        TAS = ov['TAS']; comp = 50 * math.cos(math.radians(45)); xw = 50 * math.sin(math.radians(45)); along = math.sqrt(TAS ** 2 - xw ** 2); O = along - comp; H = along + comp; E = 1
    if kind.startswith('pet'):
        X = D * H / (O + H)
        if kind == 'pet_dist':
            val, unit = X, 'NM'
            work = f"PET distance from departure = D x H / (O + H) = {D:g} x {H:g} / ({O:g} + {H:g}) = {X:.0f} NM."
        elif kind == 'pet_toB':
            val, unit = D - X, 'NM'
            work = f"Distance from A to the PET = {D:g} x {H:g} / ({O:g} + {H:g}) = {X:.0f} NM, so the PET is {D:g} - {X:.0f} = {D - X:.0f} NM from B."
        elif kind == 'pet_time':
            val, unit = X / O * 60, 'MIN'
            work = f"PET distance = {D:g} x {H:g} / ({O:g} + {H:g}) = {X:.0f} NM. Time = {X:.0f} / {O:g} = {X / O:.2f} h = {X / O * 60:.0f} min."
        else:
            st = ov['start']; t = X / O; mins = int(st[:2]) * 60 + int(st[2:]) + round(t * 60); val = mins; unit = 'ETA'
            work = (f"O = {TAS:g} + 55 = {O:g} kt, H = {TAS:g} - 75 = {H:g} kt. PET distance = {D:g} x {H:g} / ({O:g} + {H:g}) = {X:.0f} NM. "
                    f"Time = {X:.0f} / {O:g} = {hm(t)}. ETA = {st} + {hm(t)} = {mins // 60 % 24:02d}{mins % 60:02d}.")
    else:
        T = E * H / (O + H)
        if kind == 'psr_dist':
            val, unit = T * O, 'NM'
            work = f"Time to PSR = E x H / (O + H) = {E:g} x {H:g} / ({O:g} + {H:g}) = {T:.3f} h. Distance = {T:.3f} x {O:g} = {T * O:.0f} NM."
        elif kind == 'psr_time':
            val, unit = T * 60, 'MIN'
            work = f"Time to PSR = E x H / (O + H) = {E:g} h x {H:g} / ({O:g} + {H:g}) = {T:.3f} h = {T * 60:.0f} min. The A-to-B distance is not needed for a PSR."
        elif kind == 'psr_time_h':
            val, unit = T * 60, 'H'
            work = f"O = {O:g} kt, H = {H:g} kt. Time to PSR = {E:g} x {H:g} / ({O:g} + {H:g}) = {T:.2f} h."
        else:
            val, unit = T * O, 'NM'
            work = (f"Wind 045/50 on a track of 090 is 45 deg off the track: headwind component out = 50 cos 45 = {comp:.1f} kt and crosswind = 50 sin 45 = {xw:.1f} kt. "
                    f"Heading into the crosswind leaves sqrt({TAS}^2 - {xw:.1f}^2) = {along:.1f} kt along track, so O = {along:.1f} - {comp:.1f} = {O:.1f} kt and H = {along:.1f} + {comp:.1f} = {H:.1f} kt. With 1 h available: time out = {H:.1f} / ({O:.1f} + {H:.1f}) = {T:.3f} h, "
                    f"distance = {T:.3f} x {O:.1f} = {T * O:.0f} NM.")
    for c in list(opts):
        v = opts[c].strip().rstrip('.').strip()
        if unit == 'NM':
            opts[c] = re.sub(r'\s*(MIN|min|nm|NM)\.?$', '', v) + ' NM'
        elif unit == 'MIN':
            opts[c] = re.sub(r'\s*(MIN|min|nm|NM)\.?$', '', v) + ' min'
        elif unit == 'H':
            opts[c] = re.sub(r'\s*hours?\.?$', '', v) + ' h'
        elif unit == 'ETA':
            opts[c] = v if 'UTC' in v else v + ' UTC'
    best = None
    for c, v in opts.items():
        x = num(v)
        if x is None:
            continue
        if unit == 'H':
            x *= 60
        if unit == 'ETA':
            x = int(v[:2]) * 60 + int(v[2:4])
        d = abs(x - val)
        if best is None or d < best[1]:
            best = (c, d)
    rel = best[1] / max(val, 1)
    rec.update(q=q, opts=[opts[c] for c in 'abcd'], ans='abcd'.index(best[0]),
               exp=work + (f" Answer: {opts[best[0]]}." if rel <= 0.004 else f" The nearest option is {opts[best[0]]}."), computed=round(val, 2), gap=round(rel, 4),
               status=ov.get('status', 'CORRECTED' if ov.get('q_sub') or ov.get('q') else 'VERIFIED'), notes=[ov['note']] if ov.get('note') else [])
    out.append(rec)
json.dump(out, open(os.path.join(W, 'final', 'pet.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
bad = [(r['n'], r['gap'], r['computed']) for r in out if r.get('gap', 0) > 0.02]
print(len(out), 'dropped', sum(1 for r in out if r['status'] == 'DROPPED'),
      'corrected', sum(1 for r in out if r['status'] == 'CORRECTED'), 'gap>2%', bad)
