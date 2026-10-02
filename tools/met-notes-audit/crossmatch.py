import json,re,sys,difflib
SP=sys.argv[1]
notes=json.load(open(f'{SP}/notes_qa.json',encoding='utf-8'))
ver=json.load(open(f'{SP}/verified.json',encoding='utf-8'))
cae=json.load(open('D:/pk/ATPL Met Question Papers/_ref/cae_pool.json',encoding='utf-8'))
def norm(s): return re.sub(r'[^a-z0-9 ]','',re.sub(r'\s+',' ',s.lower())).strip()
def stem_of(q):
    q=re.sub(r'^(question\s*)?q?\s*\d+[.:]?\s*','',q,flags=re.I)
    q=re.sub(r'^Q\d+\s*','',q)
    m=re.search(r'\(a\)',q)
    return (q[:m.start()] if m else q).strip(), q
def opts_of(q):
    parts=re.split(r'\(([a-d])\)',q)
    o={}
    for i in range(1,len(parts)-1,2): o[parts[i]]=parts[i+1].strip(' ;&nbsp')
    return o
def marked(a):
    m=re.search(r'\(([a-d])\)\s*([^—\-–]*)',a)
    return (m.group(1),m.group(2).strip()) if m else ('?',a)
vidx=[(norm(v['q']),v) for v in ver]
cidx=[(norm(c['stem']),c) for c in cae]
rows=[]
for n in notes:
    stem,full=stem_of(n['q'])
    ns=norm(stem); L,txt=marked(n['a'] or '')
    best=(0,None);
    for k,v in vidx:
        r=difflib.SequenceMatcher(None,ns,k).quick_ratio()
        if r>best[0]-0.0 and r>0.7:
            r=difflib.SequenceMatcher(None,ns,k).ratio()
            if r>best[0]: best=(r,v)
    cb=(0,None)
    for k,c in cidx:
        if abs(len(k)-len(ns))>len(ns)*0.4: continue
        r=difflib.SequenceMatcher(None,ns,k).ratio()
        if r>cb[0]: cb=(r,c)
    row=dict(ch=n['ch'],idx=n['idx'],stem=stem,marked=f'({L}) {txt}',vr=round(best[0],2),cr=round(cb[0],2))
    if best[1] and best[0]>=0.85:
        v=best[1]; row['ver_ans']=v['opts'][v['ans']]
        row['ver_agree']=norm(row['ver_ans'])[:25] in norm(txt) or norm(txt)[:25] in norm(row['ver_ans'])
    if cb[1] and cb[0]>=0.85:
        c=cb[1]; row['cae_ans']=c['opts'][c['key']]
        row['cae_agree']=norm(row['cae_ans'])[:25] in norm(txt) or norm(txt)[:25] in norm(row['cae_ans'])
    rows.append(row)
json.dump(rows,open(f'{SP}/crossmatch.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
mv=sum(1 for r in rows if 'ver_agree' in r); mc=sum(1 for r in rows if 'cae_agree' in r)
dv=[r for r in rows if r.get('ver_agree') is False]; dc=[r for r in rows if r.get('cae_agree') is False]
none=[r for r in rows if 'ver_agree' not in r and 'cae_agree' not in r]
print('total',len(rows),'matched verified',mv,'matched cae',mc,'DISAGREE ver',len(dv),'DISAGREE cae',len(dc),'unmatched either',len(none))
