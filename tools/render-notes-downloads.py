"""Render prepared, sanitized chapter HTML and stamp linked footers on every page.
Run prepare-notes-downloads.ts first. No source teaching text is rewritten here.
"""
import asyncio, functools, http.server, json, threading, sys
from pathlib import Path
import fitz
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass

class ExportServer(http.server.ThreadingHTTPServer):
    request_queue_size=256
    daemon_threads=True

def stamp(source, output, job):
    doc=fitz.open(source)
    if len(doc)==0: raise RuntimeError('Empty PDF: '+job['id'])
    for index,page in enumerate(doc):
        w,h=page.rect.width,page.rect.height
        # Export reserves 22 mm below the content. Links stay in that margin.
        page.draw_rect(fitz.Rect(0,h-49,w,h),color=None,fill=(1,1,1),overlay=True)
        page.draw_line((34,h-48),(w-34,h-48),color=(.8,.83,.86),width=.5)
        page.insert_text((34,h-35),'Ghost Aviator | Free DGCA study notes',fontsize=8,color=(.22,.29,.36))
        page.insert_text((w-80,h-35),f'{index+1} / {len(doc)}',fontsize=8,color=(.35,.4,.45))
        x=34
        for label,url in job['links'].items():
            visible='ghostaviator.com' if label=='Website' else label
            width=fitz.get_text_length(visible,fontname='helv',fontsize=8)
            page.insert_text((x,h-19),visible,fontsize=8,color=(.10,.34,.50))
            page.insert_link({'kind':fitz.LINK_URI,'from':fitz.Rect(x,h-29,x+width,h-15),'uri':url})
            x+=width+18
        # Faint brand marks never cover figures or make numbers unreadable.
        for y in (h*.35,h*.68):
            page.insert_text((w*.22,y),'GHOST AVIATOR',fontsize=29,color=(.35,.43,.52),fill_opacity=.055,overlay=True)
    doc.set_metadata({'title':job['title']+' | Ghost Aviator','author':'Ghost Aviator','subject':'DGCA study notes - ghostaviator.com','keywords':'Ghost Aviator, DGCA, live classes'})
    output.parent.mkdir(parents=True,exist_ok=True)
    doc.save(output,garbage=4,deflate=True)
    doc.close()

async def main():
    jobs=json.loads((ROOT/'.notes-build/jobs.json').read_text(encoding='utf-8'))
    if len(sys.argv)>1 and sys.argv[1]!='--resume':
        jobs=[job for job in jobs if job['id'] in sys.argv[1:]]
    resume=set(json.loads((ROOT/'.notes-build/resume.json').read_text())) if '--resume' in sys.argv else set()
    server=ExportServer(('127.0.0.1',8766),functools.partial(QuietHandler,directory=str(ROOT/'public')))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    scoped=len(sys.argv)>1 and sys.argv[1]!='--resume'
    manifest=json.loads((ROOT/'lib/notes-downloads.json').read_text()) if scoped else {}
    report=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',headless=True,args=['--no-proxy-server'])
        sem=asyncio.Semaphore(3)
        async def render(job):
            async with sem:
                output=ROOT/'public/downloads/notes'/(job['id']+'.pdf')
                if job['id'] in resume and output.is_file():
                    manifest[job['id']]='/downloads/notes/'+job['id']+'.pdf'
                    with fitz.open(output) as cached:
                        report.append({'id':job['id'],'pages':len(cached),'bytes':output.stat().st_size})
                    return
                page=await browser.new_page(viewport={'width':1050,'height':900},device_scale_factor=1)
                missing=[]
                page.on('response',lambda response: missing.append(response.url) if response.status>=400 else None)
                try:
                    await page.goto('http://127.0.0.1:8766'+job['html'],wait_until='networkidle',timeout=60000)
                    await page.evaluate('document.fonts.ready')
                    bad=await page.locator('img').evaluate_all('(imgs)=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)')
                    if missing or bad: raise RuntimeError('Missing assets: '+str(missing+bad))
                    # Resize oversized raster figures before Chromium embeds them.
                    # Keep SVGs vector; never rewrite PDF XObject resources.
                    await page.evaluate('''async () => {
                      for (const img of document.images) {
                        if (/\\.svg(?:$|[?#])|^data:image\\/svg/i.test(img.src)) continue;
                        const width = Math.min(img.naturalWidth, Math.max(1200, img.clientWidth * 2));
                        if (img.naturalWidth <= width) continue;
                        const canvas = document.createElement('canvas');
                        canvas.width = width; canvas.height = Math.round(img.naturalHeight * width / img.naturalWidth);
                        const ctx = canvas.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0,0,canvas.width,canvas.height);
                        ctx.drawImage(img,0,0,canvas.width,canvas.height); img.src = canvas.toDataURL('image/jpeg',0.86);
                        await img.decode();
                      }
                    }''')
                    temp=ROOT/'.notes-build'/ (job['id'].replace('/','__')+'.pdf')
                    await page.pdf(path=str(temp),format='A4',print_background=True,prefer_css_page_size=True)
                    output=ROOT/'public/downloads/notes'/(job['id']+'.pdf')
                    stamp(temp,output,job)
                    manifest[job['id']]='/downloads/notes/'+job['id']+'.pdf'
                    report.append({'id':job['id'],'pages':len(fitz.open(output)),'bytes':output.stat().st_size})
                    print(f"{len(report)}/{len(jobs)} {job['id']}",flush=True)
                except Exception as e:
                    report.append({'id':job['id'],'error':str(e)})
                    print('ERROR '+job['id']+': '+str(e),flush=True)
                finally: await page.close()
        await asyncio.gather(*(render(job) for job in jobs))
        await browser.close()
    server.shutdown()
    (ROOT/'lib/notes-downloads.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    (ROOT/'.notes-build'/('report-samples.json' if scoped else 'report.json')).write_text(json.dumps(report,indent=2),encoding='utf-8')
    errors=[r for r in report if 'error' in r]
    print(json.dumps({'pdfs':len(manifest),'failures':len(errors),'bytes':sum(r.get('bytes',0) for r in report)}),flush=True)
    if errors: raise SystemExit(1)

if __name__=='__main__': asyncio.run(main())
