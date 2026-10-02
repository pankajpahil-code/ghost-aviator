import json,sys,re
from bs4 import BeautifulSoup
out=[]
base='public/content/meteorology'
def t(e): return re.sub(r'\s+',' ',e.get_text(' ')).strip()
for n in range(1,30):
    soup=BeautifulSoup(open(f'{base}/met-{n}/notes.html',encoding='utf-8').read(),'html.parser')
    for i,b in enumerate(soup.select('div.qa-block'),1):
        ch=[c for c in b.find_all('div',recursive=False)]
        d={}
        for c in ch:
            cls=[x for x in c.get('class',[]) if x.startswith('qa-')]
            if cls: d.setdefault(cls[0],t(c))
        q=d.pop('qa-q',None) or d.pop('qa-question',None); a=d.pop('qa-a',None) or d.pop('qa-answer',None)
        out.append(dict(ch=n,idx=i,q=q,a=a,rest=d))
json.dump(out,open(sys.argv[1],'w',encoding='utf-8'),ensure_ascii=False,indent=0)
bad=[o for o in out if not o['q'] or not o['a']]
print(len(out),'blocks;',len(bad),'unparsed',[(o['ch'],o['idx']) for o in bad][:20])
