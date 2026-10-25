import re, sys, json, collections
src, out = sys.argv[1], sys.argv[2]
lines = open(src, encoding='utf-8').read().replace('\x0c', '\n').split('\n')
QRE = re.compile(r'^\s*Q\s*\.?\s*(\d{1,3})\s*[.:]?\s+(.*)$')
ORE = re.compile(r'^\s*([a-dA-D])\s*[.)]\s*(.*)$')
HDR = re.compile(r'^\s*([A-Z0-9][A-Z0-9 /&,()-]{2,40}?)\.?\s*$')
qs = []; cur = None; last_hdr = None; sec_idx = 0; prev_n = 10**6
for ln in lines:
    s = ln.rstrip()
    if not s.strip():
        continue
    h = HDR.match(s)
    if h and not QRE.match(s) and not ORE.match(s) and len(h.group(1).strip()) > 2 and not h.group(1).strip().isdigit():
        last_hdr = h.group(1).strip()
        continue
    m = QRE.match(s)
    if m:
        n = int(m.group(1))
        if n <= 2 and prev_n > n:
            sec_idx += 1
            sec_name = last_hdr
        cur = {'sec_idx': sec_idx, 'sec_hdr': sec_name, 'n': n, 'q': m.group(2).strip(), 'opts': {}, 'extra': []}
        qs.append(cur); prev_n = n
        continue
    if cur is None:
        continue
    o = ORE.match(s)
    if o and o.group(1).lower() not in cur['opts'] and len(cur['opts']) < 4 and (not cur['opts'] or o.group(1).lower() > max(cur['opts'])):
        cur['opts'][o.group(1).lower()] = o.group(2).strip()
        continue
    t = s.strip()
    if cur['opts']:
        k = max(cur['opts']); cur['opts'][k] += ' ' + t
    else:
        cur['q'] += ' ' + t
json.dump(qs, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
by = collections.OrderedDict()
for q in qs:
    by.setdefault(q['sec_idx'], [q['sec_hdr'], 0, 0])
    by[q['sec_idx']][1] += 1
    if len(q['opts']) != 4:
        by[q['sec_idx']][2] += 1
for k, v in by.items():
    print(k, v)
print('total', len(qs), 'bad opts', sum(1 for q in qs if len(q['opts']) != 4))
