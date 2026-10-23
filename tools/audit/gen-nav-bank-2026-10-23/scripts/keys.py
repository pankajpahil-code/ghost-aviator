import json,re,sys,os,glob,collections
W=sys.argv[1]
SEC=[('CRP5',r'C\s*R\s*P\s*[S5$]'),('CHART THEORY',r'CHART\s*THEOR[YV]'),('CIRCLES',r'C[I1l]RC[L1I]ES'),('MAGNETISM & COMPASSES',r'MAGNET[A-Za-z]*\s*&?\s*COMPAS[A-Za-z]*'),('DESCENTS',r'DESC[A-Za-z]*NTS?'),('INS IRS FMS EFIS',r'[I1l]NS\s*[I1l]RS\s*FMS\s*EF[I1l]S'),('PLOTTING',r'P[L1I]OTT[I1l]NG'),('PSR & PET',r'PSR\s*&?\s*PET'),('SCALE',r'SCA[L1I]E'),('SOLAR SYSTEM & TIME',r'SOLAR\s*SYSTEM\s*&?\s*T[I1l]ME')]
HDR=re.compile(r'^\s*('+'|'.join('(?:%s)'%p for _,p in SEC)+r')\s*[:.,]?\s*(\d{1,3})\s*[.,]?\s*([abcdq])?\b',re.I)
OPT=re.compile(r'\(?option\s*([abcd])\s*\)',re.I)
def secname(s):
    for n,p in SEC:
        if re.fullmatch(p,s.strip(),re.I): return n
def lines_rapid(p):
    f=os.path.join(W,'kwocr',f'pg{p:03d}.json')
    if not os.path.exists(f): f=os.path.join(W,'kwocr',f'hd{p:03d}.json')
    if not os.path.exists(f): return None
    d=json.load(open(f,encoding='utf-8'))
    if not d: return []
    mid=995
    L=[x for x in d if x[0][0]<mid]; R=[x for x in d if x[0][0]>=mid]
    return [x[1] for x in sorted(L,key=lambda x:x[0][1])]+[x[1] for x in sorted(R,key=lambda x:x[0][1])]
def lines_win(p):
    f=os.path.join(W,'w',f'w{p:03d}.txt')
    if not os.path.exists(f): return None
    return open(f,encoding='utf-8-sig').read().split('\n')
votes=collections.defaultdict(list)
for p in range(123,338):
  for name,fn in (('rapid',lines_rapid),('win',lines_win)):
    L=fn(p)
    if L is None: continue
    cur=None
    for ln in L:
        m=HDR.match(ln)
        if m:
            sec=secname(m.group(1)); n=int(m.group(2)); let=(m.group(3) or '').lower()
            if let=='q': let=''
            cur=(sec,n)
            if let: votes[cur].append((name+'-hdr',let,p))
            continue
        if cur:
            o=OPT.search(ln)
            if o: votes[cur].append((name+'-opt',o.group(1).lower(),p)); cur=None
res={}
for k,v in votes.items():
    c=collections.Counter(x[1] for x in v)
    res[f'{k[0]}|{k[1]}']={'votes':v,'top':c.most_common(1)[0][0],'agree':len(c)==1}
json.dump(res,open(os.path.join(W,'book_keys.json'),'w'),indent=0)
cnt=collections.Counter(k.split('|')[0] for k in res)
print(cnt, 'total',len(res),'conflicts',sum(1 for r in res.values() if not r['agree']))
