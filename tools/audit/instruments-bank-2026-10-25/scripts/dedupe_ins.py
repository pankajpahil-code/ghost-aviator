import json, re, sys, collections
W = sys.argv[1]
kw = json.load(open(W + r'\ins\kwins_q.json', encoding='utf-8'))
site = json.load(open(W + r'\site_all2.json', encoding='utf-8'))
STOP = set('the a an of to is in on at for and if by with what which are be as it its this that from given following will when nm kt kts o'.split())
toks = lambda t: set(w for w in re.findall(r'[a-z]+', t.lower()) if w not in STOP and len(w) > 1)
nums = lambda t: set(n.lstrip('0') or '0' for n in re.findall(r'\d+(?:\.\d+)?', t))
J = lambda a, b: len(a & b) / len(a | b) if (a or b) else 1.0
SS = [(toks(x['q']), nums(x['q'])) for x in site]
kept = []
for k in kw:
    tq, nq = toks(k['q']), nums(k['q'])
    best = (0, None)
    for i, (sq, sn) in enumerate(SS):
        jw = J(tq, sq)
        if jw < 0.5:
            continue
        if (nq or sn) and J(nq, sn) < 0.75:
            continue
        if not (nq or sn) and jw < 0.75:
            continue
        if jw > best[0]:
            best = (jw, i)
    k['site_dup'] = best[1] is not None and best[0] >= 0.55
    k['site_match'] = best[1]
    k['internal_dup'] = None
    if k['site_dup']:
        continue
    for o in kept:
        if J(tq, toks(o['q'])) >= 0.9 and nq == nums(o['q']):
            k['internal_dup'] = f"{o['sec_hdr']}|{o['n']}"
            break
    if not k['internal_dup']:
        kept.append(k)
json.dump(kw, open(W + r'\ins\kwins_q.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
c = collections.Counter((k['sec_hdr'], 'dup' if k['site_dup'] else ('int' if k['internal_dup'] else 'new')) for k in kw)
for s in dict.fromkeys(k['sec_hdr'] for k in kw):
    print(f"{s:18}", {t: c[(s, t)] for t in ('dup', 'int', 'new')})
print('site dup', sum(k['site_dup'] for k in kw), 'internal', sum(bool(k['internal_dup']) for k in kw), 'new', len(kept))
