from pathlib import Path
import argparse,json,os,hashlib
from playwright.sync_api import sync_playwright

# Candidate renderer only: never changes public assets or approved manifests.
render=r'''async ({id,source,old})=>{
    const visibleLabels=root=>{
     const nodes=[...root.querySelectorAll('text')];
     const readable=n=>{
      const leaves=[...n.querySelectorAll('tspan')].filter(t=>!t.querySelector('tspan'));
      return leaves.length?leaves.map(t=>t.textContent.trim()).filter(Boolean).join(' '):n.textContent.trim();
     };
     return nodes.map(readable).filter(Boolean);
    };
    const before=new DOMParser().parseFromString(old,'image/svg+xml').documentElement;
    const {svg}=await mermaid.render(id,source.replace(/<\/?(?:i|b|em|strong)>/gi,''));
    const root=new DOMParser().parseFromString(svg,'image/svg+xml').documentElement;
    if(root.tagName==='parsererror')throw new Error(root.textContent);
    // Mermaid 10's non-HTML label renderer double-escapes entities such as
    // ampersands and comparisons. Decode text nodes once, preserving SVG
    // structure, so the visible characters match the original labels.
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const textNodes=[];while(walker.nextNode())textNodes.push(walker.currentNode);
    for(const node of textNodes)if(node.parentElement?.closest('text')){
      const decoder=document.createElement('textarea');decoder.innerHTML=node.nodeValue;
      node.nodeValue=decoder.value;
    }
    const vb=root.getAttribute('viewBox').split(/\s+/).map(Number);
    root.setAttribute('width',Math.ceil(vb[2]));root.setAttribute('height',Math.ceil(vb[3]));
    root.style.maxWidth='none';root.style.fontFamily='Arial, sans-serif';
    return {svg:new XMLSerializer().serializeToString(root),width:Math.ceil(vb[2]),height:Math.ceil(vb[3]),oldLabels:visibleLabels(before),labels:visibleLabels(root),foreignObjects:root.querySelectorAll('foreignObject').length};
   }'''

def main():
 p=argparse.ArgumentParser();p.add_argument('--output',required=True,type=Path);p.add_argument('--mermaid-script',required=True,type=Path);p.add_argument('--only');args=p.parse_args()
 repo=Path(__file__).resolve().parents[2];out=args.output.resolve();out.mkdir(parents=True,exist_ok=True)
 temp=repo/'.tmp-audit/diagram-browser-temp';temp.mkdir(parents=True,exist_ok=True)
 for key in ('TEMP','TMP','TMPDIR'):os.environ[key]=str(temp)
 items=json.loads((repo/'tools/diagrams/manifest.json').read_text('utf-8'));results=[]
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel='chrome',headless=True);context=browser.new_context(offline=True,viewport={'width':2400,'height':2000});page=context.new_page()
  page.set_content('<!doctype html><html><body></body></html>');page.add_script_tag(path=str(args.mermaid_script.resolve()))
  page.evaluate('mermaid.initialize({startOnLoad:false,securityLevel:"strict",htmlLabels:false,deterministicIds:true,deterministicIDSeed:"ghost-aviator",theme:"default",themeVariables:{fontFamily:"Arial, sans-serif",fontSize:"16px"},flowchart:{htmlLabels:false,curve:"basis",padding:20,nodeSpacing:40,rankSpacing:50}})')
  for i,item in enumerate(items):
   if args.only and args.only not in (item['image'],item['source']):continue
   source=(repo/item['source']).read_text('utf-8');old=(repo/'public'/item['image']).read_text('utf-8');data=page.evaluate(render,{'id':f'gaPortable{i}','source':source,'old':old})
   if data['foreignObjects']:raise ValueError('HTML labels must not be published.')
   dest=out/item['image'];dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(data['svg'],encoding='utf-8')
   results.append({**item,'width':data['width'],'height':data['height'],'labels':data['labels'],'oldLabels':data['oldLabels'],'svgSha256':hashlib.sha256(data['svg'].replace('\r\n','\n').encode()).hexdigest(),'sha256':hashlib.sha256(source.replace('\r\n','\n').encode()).hexdigest()})
  browser.close()
 if not results:raise SystemExit('No matching diagram.')
 (out/'rendered-flowcharts.json').write_text(json.dumps(results,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 print(f'Rendered {len(results)} candidate flowcharts to {out}. Review labels, layout and dimensions before updating public assets or checksums.')

if __name__=='__main__':main()
