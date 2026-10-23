import json,re,sys,collections
W=sys.argv[1]
kw=json.load(open(W+r'\kwgn_q.json',encoding='utf-8'))
site=json.load(open(W+r'\site_all.json',encoding='utf-8'))
STOP=set('the a an of to is in on at for and if by with what which are be as it its this that from given following will when nm kt kts o'.split())
def toks(t): return set(w for w in re.findall(r'[a-z]+',t.lower()) if w not in STOP and len(w)>1)
def nums(t): return set(n.lstrip('0') or '0' for n in re.findall(r'\d+(?:\.\d+)?',t))
def J(a,b): return len(a&b)/len(a|b) if (a or b) else 1.0
SS=[(toks(x['q']),nums(x['q']),toks(' '.join(x['opts'])),nums(' '.join(x['opts']))) for x in site]
res=[]
for k in kw:
    o=' '.join(k['opts'].values())
    tq,nq,to,no=toks(k['q']),nums(k['q']),toks(o),nums(o)
    best=(0,None,'')
    for i,(sq,sn,so,son) in enumerate(SS):
        jw=J(tq,sq)
        if jw<0.5: continue
        jn=J(nq,sn); jo=J(to|no,so|son)
        if nq or sn:
            ok = jn>=0.75 and jw>=0.55
        else:
            ok = jw>=0.75
        sc=jw*0.5+jn*0.3+jo*0.2
        if sc>best[0]: best=(sc,i,'dup' if ok else 'near')
    res.append({'sec':k['sec'],'n':k['n'],'score':round(best[0],3),'match':best[1],'cls':best[2] or 'new'})
json.dump(res,open(W+r'\dedupe2.json','w'),indent=0)
b=collections.Counter((r['sec'],r['cls']) for r in res)
for s in dict.fromkeys(r['sec'] for r in res): print(s, {c:b[(s,c)] for c in ['dup','near','new']})
print(collections.Counter(r['cls'] for r in res))
