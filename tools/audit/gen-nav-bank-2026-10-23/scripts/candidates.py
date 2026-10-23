import json,re,sys,collections
W=sys.argv[1]
kw=json.load(open(W+r'\kwgn_q.json',encoding='utf-8'))
dd={(r['sec'],r['n']):r for r in json.load(open(W+r'\dedupe2.json'))}
STOP=set('the a an of to is in on at for and if by with what which are be as it its this that from given following will when nm kt kts o'.split())
toks=lambda t:set(w for w in re.findall(r'[a-z]+',t.lower()) if w not in STOP and len(w)>1)
nums=lambda t:set(n.lstrip('0') or '0' for n in re.findall(r'\d+(?:\.\d+)?',t))
J=lambda a,b: len(a&b)/len(a|b) if (a or b) else 1.0
kept=[]; internal=[]
for k in kw:
    k['site_dup']=dd[(k['sec'],k['n'])]['cls']=='dup'
    k['site_match']=dd[(k['sec'],k['n'])]['match']
    k['internal_dup']=None
    if k['site_dup']: continue
    for o in kept:
        if J(toks(k['q']),toks(o['q']))>=0.9 and nums(k['q'])==nums(o['q']):
            k['internal_dup']=f"{o['sec']}|{o['n']}"; break
    if not k['internal_dup']: kept.append(k)
json.dump(kw,open(W+r'\kwgn_q.json','w',encoding='utf-8'),ensure_ascii=False,indent=0)
c=collections.Counter(k['sec'] for k in kept)
print('candidates',len(kept),dict(c)); print('internal dups',sum(1 for k in kw if k['internal_dup']))
