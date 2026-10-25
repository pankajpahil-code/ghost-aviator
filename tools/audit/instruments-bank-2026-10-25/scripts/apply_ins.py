"""Apply the instrument-bank decision files (ins/dec/*.py) to ins/kwins_q.json -> ins/final_all.json."""
import json, re, sys, os, glob, importlib.util, collections
W = sys.argv[1]
kw = json.load(open(os.path.join(W, 'kwins_q.json'), encoding='utf-8'))
bk = json.load(open(os.path.join(W, 'book_keys.json'), encoding='utf-8'))

DEC = {}   # sec -> (CH overrides, D)
POST = {}  # (sec, n) -> drop reason, applied last
for f in sorted(glob.glob(os.path.join(W, 'dec', 'd*.py'))):
    spec = importlib.util.spec_from_file_location(os.path.basename(f)[:-3], f)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    if hasattr(m, 'POST_DROP'):
        POST.update(m.POST_DROP); continue
    if hasattr(m, 'SECS'):
        for sec, (ch, d) in m.SECS.items():
            assert sec not in DEC, sec
            DEC[sec] = (ch, d)
    else:
        assert m.SEC not in DEC, m.SEC
        DEC[m.SEC] = (getattr(m, 'CH', {}), m.D)

out, missing, disagree, seen, bad = [], [], [], set(), []
for k in kw:
    sec, n = k['sec_hdr'], k['n']
    base = {'sec': sec, 'n': n}
    if k.get('site_dup'):
        out.append(dict(base, status='DROPPED', reason='Repeats a question already on the site.', match=k.get('site_match'))); continue
    if k.get('internal_dup'):
        out.append(dict(base, status='DROPPED', reason='Exact repeat inside the book.')); continue
    if (sec, n) in seen:
        out.append(dict(base, status='DROPPED', reason='Second item with the same number in the source; repeat.')); continue
    seen.add((sec, n))
    if sec not in DEC:
        missing.append((sec, n)); continue
    CH, D = DEC[sec]
    d = D.get(n)
    if d is None:
        missing.append((sec, n)); continue
    rec = dict(base, ch=CH.get(n, k['ch']), notes=[d['note']] if d.get('note') else [])
    if (sec, n) in POST:
        d = dict(drop=POST[(sec, n)])
    if d.get('drop'):
        out.append(dict(rec, status='DROPPED', reason=d['drop'])); continue
    q = d.get('q', k['q'].strip())
    for a, b in d.get('q_sub', []):
        assert a in q, (sec, n, a)
        q = q.replace(a, b)
    opts = dict(k['opts']); opts.update(d.get('opt', {}))
    for i, c in enumerate('bcd'):
        if not (opts.get(c) or '').strip():
            prev = 'abc'[i]
            mm = re.search(r'^(.*?[.?])\s+' + c + r'[.)]?\s+([A-Z0-9].*)$', opts.get(prev) or '')
            if mm:
                opts[prev], opts[c] = mm.group(1), mm.group(2)
                rec['notes'].append(f'Options {prev} and {c} ran together in the text copy; separated.')
    if len([c for c in 'abcd' if (opts.get(c) or '').strip()]) != 4:
        bad.append((sec, n, opts)); continue
    ans = d['ans']
    b = bk.get(f'{sec}|{n}')
    bt = b and b.get('top')
    status = d.get('status', 'VERIFIED')
    if bt and bt != ans and status != 'CORRECTED':
        disagree.append((sec, n, bt, ans))
        rec['notes'].append(f'Scan key read as {bt} (single reading); keyed on the worked explanation in the source.')
    out.append(dict(rec, q=re.sub(r'\s+', ' ', q), opts=[re.sub(r'\s+', ' ', opts[x]).strip() for x in 'abcd'],
                    ans='abcd'.index(ans), exp=d['exp'], status=status, book=bt))
if bad:
    for x in bad: print('BAD OPTIONS', x)
    raise SystemExit(len(bad))
if missing:
    print('MISSING decisions:', missing)
json.dump(out, open(os.path.join(W, 'final_all.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
c = collections.Counter(r['status'] for r in out)
print(len(out), dict(c))
print('book key differs from decision (not marked CORRECTED):', len(disagree))
for x in disagree:
    print('  ', x)
