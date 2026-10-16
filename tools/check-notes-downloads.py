"""Add a quiet invitation in the reserved PDF margin; check every page's links."""
import json
from pathlib import Path
from urllib.parse import urlsplit
import fitz

ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'lib/notes-downloads.json').read_text(encoding='utf-8'))
jobs={j['id']:j for j in json.loads((ROOT/'.notes-build/jobs.json').read_text(encoding='utf-8'))}
invitation='Join live classes for guided practice and doubt clearing.'
errors=[]; pages=0; total=0; small=[]
for key,url in manifest.items():
 file=ROOT/'public'/url.lstrip('/')
 if not file.is_file(): errors.append([key,'missing PDF']);continue
 with fitz.open(file) as doc:
  changed=False
  for i,page in enumerate(doc):
   text=page.get_text()
   for link in page.get_links():
    uri=link.get('uri','')
    if uri.startswith(('http://127.0.0.1:8766','http://localhost:8766')):
     parsed=urlsplit(uri)
     route=parsed.path
     if route.startswith('/_notes-export/'):
      track='atpl' if key.split('/')[0] in {'human-performance','atpl-navigation','atpl-meteorology','atpl-air-regulations','atpl-radio-aids'} else 'cpl'
      route='/'+track+'/'+route.removeprefix('/_notes-export/').removesuffix('.html')+'/notes'
     link['uri']='https://ghostaviator.com'+route+('?' + parsed.query if parsed.query else '')+('#'+parsed.fragment if parsed.fragment else '')
     page.update_link(link);changed=True
    elif uri.startswith('file:'):
     errors.append([key,i+1,'local file link',uri])
   if invitation not in text:
    x,y=34,page.rect.height-55
    page.insert_text((x,y),invitation,fontsize=7,color=(.28,.36,.42))
    width=fitz.get_text_length(invitation,fontname='helv',fontsize=7)
    page.insert_link({'kind':fitz.LINK_URI,'from':fitz.Rect(x,y-8,x+width,y+2),'uri':'https://ghostaviator.com/live-classes'})
    changed=True
   expected=set(jobs[key]['links'].values())
   found={link.get('uri') for link in page.get_links()}
   if not expected.issubset(found): errors.append([key,i+1,'missing footer links',list(expected-found)])
   if 'GHOST AVIATOR' not in text: errors.append([key,i+1,'missing watermark'])
   if 'Ghost Aviator | Free DGCA study notes' not in text: errors.append([key,i+1,'missing footer'])
   if len(text)<200: small.append([key,i+1,len(text)])
   pages+=1
  if changed: doc.saveIncr()
 total+=file.stat().st_size
report={'pdfs':len(manifest),'pages':pages,'bytes':total,'errors':errors,'short_pages_for_visual_review':small}
(ROOT/'.notes-build/download-check.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='short_pages_for_visual_review'},indent=2))
if errors:raise SystemExit(1)
