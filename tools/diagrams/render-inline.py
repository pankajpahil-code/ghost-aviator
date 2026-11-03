from pathlib import Path
import argparse,json,os,re,math,hashlib
from playwright.sync_api import sync_playwright

# Authoring tool: writes candidate images/metadata to a review folder only.
# It never changes public assets, notes, or the approved integrity manifest.
freeze=r'''root=>{
 const properties=['color','fill','fill-opacity','fill-rule','stroke','stroke-width','stroke-opacity','stroke-dasharray','stroke-linecap','stroke-linejoin','opacity','font-size','font-family','font-weight','font-style','text-anchor','dominant-baseline','letter-spacing','visibility','paint-order','marker-start','marker-mid','marker-end'];
 const elements=[root,...root.querySelectorAll('*')];
 const styles=elements.map(el=>{const c=getComputedStyle(el);return properties.map(p=>[p,c.getPropertyValue(p)]);});
 elements.forEach((el,i)=>styles[i].forEach(([p,value])=>{
  if(p==='font-family')value=/Georgia|Times|(^|[^-])serif/i.test(value)&&!/sans-serif/i.test(value)?'Georgia, serif':/mono|courier/i.test(value)?'Courier New, monospace':'Arial, sans-serif';
  el.style.setProperty(p,value.replace(/about:blank#/g,'#'));
 }));
 const box=root.getBBox();const original=root.viewBox.baseVal;
 const x=Math.floor(Math.min(original.x,box.x)-12),y=Math.floor(Math.min(original.y,box.y)-12);
 const w=Math.ceil(Math.max(original.x+original.width,box.x+box.width)-x+12),h=Math.ceil(Math.max(original.y+original.height,box.y+box.height)-y+12);
 root.setAttribute('viewBox',[x,y,w,h].join(' '));root.setAttribute('width',w);root.setAttribute('height',h);
 root.style.width=w+'px';root.style.height=h+'px';root.style.maxWidth='none';
 const labels=[...root.querySelectorAll('text')].map(el=>el.textContent.trim()).filter(Boolean);
 const sizes=[...root.querySelectorAll('text')].filter(el=>el.textContent.trim()).map(el=>parseFloat(getComputedStyle(el).fontSize));
 return {svg:new XMLSerializer().serializeToString(root),viewBox:[x,y,w,h],width:w,height:h,labels,minFont:Math.min(...sizes)};
}'''

def main():
 p=argparse.ArgumentParser();p.add_argument('--output',required=True,type=Path);p.add_argument('--only');args=p.parse_args()
 repo=Path(__file__).resolve().parents[2];out=args.output.resolve();out.mkdir(exist_ok=True,parents=True)
 temp=repo/'.tmp-audit/diagram-browser-temp';temp.mkdir(exist_ok=True,parents=True)
 for key in ('TEMP','TMP','TMPDIR'):os.environ[key]=str(temp)
 items=json.loads((repo/'tools/diagrams/inline-manifest.json').read_text('utf-8'))
 if args.only:items=[x for x in items if x['key']==args.only]
 if not items:raise SystemExit('No matching diagram.')
 results=[]
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel='chrome',headless=True);context=browser.new_context(offline=True,viewport={'width':2400,'height':2000});page=context.new_page()
  for item in items:
   source=(repo/item['source']).read_text('utf-8');css=(repo/item['stylesheet']).read_text('utf-8');css=re.sub(r'@import[^;]+;','',css)
   page.set_content('<!doctype html><html><head><style>'+css+'</style></head><body>'+source+'</body></html>')
   svg=page.locator('svg').first;vb=svg.get_attribute('viewBox').split();w=math.ceil(float(vb[2]));h=math.ceil(float(vb[3]))
   svg.evaluate("(s,v)=>{document.body.style.margin='0';document.body.style.padding='0';s.setAttribute('width',v.w);s.setAttribute('height',v.h);s.style.width=v.w+'px';s.style.height=v.h+'px';s.style.maxWidth='none';}",{'w':w,'h':h})
   data=svg.evaluate(freeze);dest=out/item['image'];dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(data['svg'],encoding='utf-8')
   results.append({**item,**{k:data[k] for k in ['width','height','labels']},'svgSha256':hashlib.sha256(data['svg'].replace('\r\n','\n').encode()).hexdigest(),'sourceSha256':hashlib.sha256(source.replace('\r\n','\n').encode()).hexdigest()})
  browser.close()
 (out/'rendered-inline.json').write_text(json.dumps(results,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 print(f'Rendered {len(results)} candidate diagrams into {out}. Inspect before publishing or updating the approved manifest.')

if __name__=='__main__':main()
