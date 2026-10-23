import re,json,sys
src,out=sys.argv[1],sys.argv[2]
SECS=['CRP5','CHART THEORY','CIRCLES','MAGNETISM & COMPASSES','DESCENTS','INS IRS FMS EFIS','PLOTTING','PSR & PET','SCALE','SOLAR SYSTEM & TIME']
lines=open(src,encoding='utf-8').read().split('\n')
sec=None; qs=[]; cur=None
def flush():
    if cur: qs.append(cur)
for ln in lines:
    s=ln.strip()
    if s.rstrip() in SECS: sec=s.rstrip(); continue
    m=re.match(r'^Q\.?\s*(\d+)\s*[\.:]?\s*(.*)$',s)
    if m:
        flush(); cur={'sec':sec,'n':int(m.group(1)),'q':m.group(2).strip(),'opts':{},'raw':[s]}; continue
    if cur is None: continue
    m=re.match(r'^([a-dA-D])\s*[\.\)]\s*(.*)$',s)
    if m and len(cur['opts'])<4 and m.group(1).lower() not in cur['opts']:
        cur['opts'][m.group(1).lower()]=m.group(2).strip(); cur['raw'].append(s); continue
    if s:
        cur['raw'].append(s)
        if cur['opts']: 
            k=list(cur['opts'])[-1]; cur['opts'][k]+=' '+s
        else: cur['q']+=' '+s
flush()
json.dump(qs,open(out,'w',encoding='utf-8'),ensure_ascii=False,indent=0)
import collections
print(collections.Counter(q['sec'] for q in qs))
bad=[(q['sec'],q['n'],len(q['opts'])) for q in qs if len(q['opts'])!=4]; print('bad opts',len(bad),bad[:20])
for sec in SECS:
    ns=[q['n'] for q in qs if q['sec']==sec]; miss=sorted(set(range(1,max(ns)+1))-set(ns)); dup=[n for n,c in collections.Counter(ns).items() if c>1]
    print(sec,len(ns),max(ns),'miss',miss,'dup',dup)
