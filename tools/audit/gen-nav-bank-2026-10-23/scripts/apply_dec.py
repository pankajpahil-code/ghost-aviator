import json, re, sys, os, importlib.util, collections
W, sec, decfile, outname = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
kw = json.load(open(W + r'\kwgn_q.json', encoding='utf-8'))
bk = json.load(open(W + r'\book_keys.json'))
spec = importlib.util.spec_from_file_location('dec', decfile)
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
D = mod.D
CH = getattr(mod, 'CH', {})
out = []; missing = []; disagree = []
for k in kw:
    if k['sec'] != sec or k['site_dup'] or k['internal_dup']:
        continue
    n = k['n']
    d = D.get(n)
    if d is None:
        missing.append(n); continue
    rec = {'sec': sec, 'n': n, 'ch': CH.get(n, k['ch']), 'subj': k['subj'], 'notes': [d['note']] if d.get('note') else []}
    if rec['ch'].startswith('inst-'):
        rec['subj'] = 'instrumentation'
    elif rec['ch'].startswith('nav'):
        rec['subj'] = 'air-navigation'
    if d.get('drop'):
        rec.update(status='DROPPED', reason=d['drop']); out.append(rec); continue
    q = k['q'].strip()
    if 'q' in d:
        q = d['q']
    for a, b in d.get('q_sub', []):
        if a in q:
            q = q.replace(a, b)
    opts = dict(k['opts'])
    opts.update(d.get('opt', {}))
    if len([c for c in 'abcd' if opts.get(c, '').strip()]) != 4:
        raise SystemExit(f'{sec} {n}: not 4 options {opts}')
    ans = d['ans']
    b = bk.get(f'{sec}|{n}')
    c = b and collections.Counter(x[1] for x in b['votes'] if x[0] != 'win-opt').most_common()
    bt = c[0][0] if c else None
    status = d.get('status', 'VERIFIED')
    if bt and bt != ans and status != 'CORRECTED':
        disagree.append((n, bt, ans))
    rec.update(q=re.sub(r'\s+', ' ', q), opts=[re.sub(r'\s+', ' ', opts[x]).strip() for x in 'abcd'], ans='abcd'.index(ans),
               exp=d['exp'], status=status, book=bt)
    out.append(rec)
if missing:
    raise SystemExit(f'missing decisions: {missing}')
json.dump(out, open(os.path.join(W, 'final', outname), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(sec, len(out), 'dropped', sum(r['status'] == 'DROPPED' for r in out), 'corrected', sum(r['status'] == 'CORRECTED' for r in out),
      'book-disagree (not marked CORRECTED):', disagree)
