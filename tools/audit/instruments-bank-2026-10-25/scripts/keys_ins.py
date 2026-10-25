import json, re, sys, os, collections
W = sys.argv[1]
D = os.path.join(W, 'ins')
MID = 995
RULES = [(r'^P[I1]?[OH]?T?O?T?\s*(STA|$)|^PITOT|^PIOT|^PIHOT', 'PITOT STATICS'), (r'^ALT\.?$', 'ALTEMETER'),
         (r'^[RB]AD[I1]?[O0Q]?\s*AL', 'RADIO ALTIMETERS'), (r'^(VSI|VSL|YSL|VN)$', 'VSI'), (r'^(ASI|ASL|AS1|AS)$', 'ASI'),
         (r'^AIRSPE', 'AIRSPEEDS'), (r'^MACH', 'MACH'), (r'^GYRO', 'GYRO'), (r'^ATTITUDE', 'ATTITUDE'),
         (r'^TURN', 'TURN/SLIP'), (r'^[I1]NS', '1NS/IRS/FMS'), (r'^EFIS', 'EFIS'), (r'^AUT[OQ]', 'AUTOFLIGHT'),
         (r'^FLIGHT\s*DIR', 'FLIGHT DIRECTOR'), (r'^E?ICAS', 'EICAS/ECAM'), (r'^EN[GC]', 'ENGINE'), (r'^TEMP', 'TEMP'),
         (r'^FUEL', 'FUEL'), (r'^COMPAS', 'COMPASS'), (r'^WARN', 'WARN/REC'), (r'^TCAS', 'TCAS'), (r'^CRP', 'CRP5')]
HDR = re.compile(r'^\s*([A-Z][A-Z0-9 /&,.\-]{0,30}?)\s*(\d{1,3})\s*[.,:]?\s*([abcd])?\s*[.,]?\s*$')
OPT = re.compile(r'\(?\s*option\s*([abcd])\s*\)', re.I)


def sec_of(name):
    n = name.strip().rstrip('.').strip()
    for p, s in RULES:
        if re.search(p, n):
            return s
    return None


stream = []
for p in range(149, 346):
    items = []
    f = os.path.join(D, 'ocr', f'hd{p:03d}.json')
    if os.path.exists(f):
        for b, t, sc in json.load(open(f, encoding='utf-8')):
            m = HDR.match(t)
            if m and sec_of(m.group(1)):
                items.append((b[0] >= MID, b[1], 'H', (sec_of(m.group(1)), int(m.group(2)), (m.group(3) or ''), p)))
            else:
                o = OPT.search(t)
                if o:
                    items.append((b[0] >= MID, b[1], 'O', o.group(1).lower()))
    wf = os.path.join(D, 'w2', f'w{p:03d}.txt')
    if os.path.exists(wf):
        for ln in open(wf, encoding='utf-8-sig').read().split('\n'):
            parts = ln.split('\t', 2)
            if len(parts) < 3:
                continue
            x, y, t = int(parts[0]), int(parts[1]), parts[2]
            if HDR.match(t):
                continue
            items.append((x >= MID, y, 'T', t))
    items.sort(key=lambda i: (i[0], i[1]))
    stream += items
keys = {}; ex = collections.defaultdict(list); cur = None
for it in stream:
    if it[2] == 'H':
        sec, n, let, p = it[3]
        cur = f'{sec}|{n}'
        keys.setdefault(cur, {'hdr': [], 'opt': [], 'sheet': p})
        if let:
            keys[cur]['hdr'].append(let)
    elif it[2] == 'O' and cur:
        keys[cur]['opt'].append(it[3])
    elif it[2] == 'T' and cur:
        ex[cur].append(it[3])
        o = OPT.search(it[3])
        if o:
            keys[cur]['opt'].append(o.group(1).lower() + '*')
for k, v in keys.items():
    votes = v['hdr'] + [x.rstrip('*') for x in v['opt']]
    c = collections.Counter(votes)
    v['top'] = c.most_common(1)[0][0] if c else None
    v['agree'] = len(c) == 1 and sum(c.values()) >= 2
json.dump(keys, open(os.path.join(D, 'book_keys.json'), 'w'), indent=0)
json.dump({k: ' '.join(v) for k, v in ex.items()}, open(os.path.join(D, 'explain.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
cnt = collections.Counter(k.split('|')[0] for k in keys)
print(cnt)
print('keys', len(keys), 'with letter', sum(1 for v in keys.values() if v['top']), 'agree>=2', sum(1 for v in keys.values() if v['agree']))
