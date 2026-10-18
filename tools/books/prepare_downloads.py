"""Prepare approved authored PDFs. Usage: python prepare_downloads.py SOURCES_JSON QA_DIR.

Requires PyMuPDF. Originals are never modified. Source paths stay in the local
input manifest, outside the public catalog. Permissions are deterrents, not DRM.
"""
from pathlib import Path
import hashlib, json, re, secrets, sys
import fitz

ROOT = Path(__file__).resolve().parents[2]
ALL_SOURCE = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8-sig"))
only = sys.argv[4] if len(sys.argv) == 5 and sys.argv[3] == "--only" else None
SOURCE = [b for b in ALL_SOURCE if not only or b["slug"] == only]
QA = Path(sys.argv[2]); QA.mkdir(parents=True, exist_ok=True)
OUT = ROOT / "public/downloads/books"; OUT.mkdir(parents=True, exist_ok=True)
SITE = (ROOT / "lib/site.ts").read_text(encoding="utf-8")
def site_url(name):
    return re.search(rf'const {name} = "([^"]+)"', SITE)[1]

def outline(doc, slug):
    old = doc.get_toc()
    if old:
        if slug == "air-regulations":
            # The delivery outline mistook the contents entries for headings.
            for entry in old:
                if entry[1] not in ("Glossary", "Index"): continue
                hits=[]
                for i,page in enumerate(doc):
                    if any(s["text"].strip()==entry[1] and s["size"]>=16 for b in page.get_text("dict")["blocks"] if "lines" in b for line in b["lines"] for s in line["spans"]): hits.append(i+1)
                if len(hits)!=1: raise ValueError(f"Ambiguous heading: {entry[1]}")
                entry[2]=hits[0]
            old.sort(key=lambda e:e[2])
        return old
    toc = [[1, "Cover", 1]]; seen = set()
    for i, page in enumerate(doc):
        lines = [x.strip() for x in page.get_text().splitlines() if x.strip()]
        text = "\n".join(lines)
        if slug == "rtra-mastery":
            m = re.search(r"CHAPTER (\d+)[^\n]*\n([^\n]+)", text[:650])
            item = (int(m[1]), m[2]) if m else None
        elif slug == "human-performance":
            m = re.search(r"Chapter (\d+)\s*[—–-]", text)
            if m:
                before = text[:m.start()].splitlines()
                item = (int(m[1]), before[-1].strip())
            else: item = None
        elif slug == "radio-navigation":
            m = re.search(r"^CHAPTER (\d+)$", "\n".join(lines[:18]), re.M)
            item = (int(m[1]), lines[0]) if m else None
        else:
            toc.append([1, f"Page {i+1} — {next((l for l in lines if len(l)>20), 'Flight-plan guide')[:100]}", i+1])
            continue
        if item and item[0] not in seen:
            seen.add(item[0]); toc.append([1, f"Chapter {item[0]} — {item[1]}", i+1])
    expected = {"rtra-mastery":24, "human-performance":26, "radio-navigation":21}.get(slug)
    if expected and len(seen) != expected:
        raise ValueError(f"{slug}: found {len(seen)} chapter starts, expected {expected}; inspect before publication")
    return toc

catalog_path=ROOT/"lib/generated/book-downloads.json"
record_path=QA/"book-download-checks.json"
catalog=[b for b in json.loads(catalog_path.read_text(encoding="utf-8")) if b["slug"]!=only] if only else []
records=[b for b in json.loads(record_path.read_text(encoding="utf-8")) if b["slug"]!=only] if only else []
for book in SOURCE:
    src=fitz.open(book["source"])
    if src.is_encrypted: raise ValueError("Supply an approved readable source")
    toc=outline(src,book["slug"])
    group={"meteorology":"TG_MET","air-regulations":"TG_REGS","radio-telephony":"TG_RTR","radio-navigation":"TG_NAV"}.get(book["subject"])
    links=[("Website","https://ghostaviator.com"),("YouTube",site_url("YOUTUBE_BRAND")),("Instagram",site_url("INSTAGRAM")),("Telegram channel",site_url("TELEGRAM_CHANNEL")),("Telegram community",site_url("TELEGRAM_GROUP"))]
    if group: links.append(("Subject study group",site_url(group)))
    dest=fitz.open(); original_links=0
    for i, page in enumerate(src):
        if list(page.widgets()): raise ValueError("Source contains form fields; inspect first")
        w,h=page.rect.width,page.rect.height
        target=dest.new_page(width=w,height=h+48)
        if book.get("backCover") == "simple" and i == len(src)-1:
            # Captain-selected replacement for placeholder publisher/ISBN art.
            target.draw_rect(fitz.Rect(0,0,w,h),color=None,fill=(.035,.065,.09))
            target.insert_textbox(fitz.Rect(40,(h+48)*.3,w-40,h*.8),"GHOST AVIATOR\n\nRadio Navigation\n\nStudy freely. Keep learning.\n\nghostaviator.com",fontsize=24,fontname="hebo",color=(.96,.78,.5),align=1)
        else:
            target.show_pdf_page(fitz.Rect(0,0,w,h),src,i)
        # Page-content text, not a removable watermark annotation. It remains
        # editable by sufficiently capable PDF tools; never claim otherwise.
        text="GHOST AVIATOR · ghostaviator.com"
        fs=min(26,w/23); center=fitz.Point(w/2,h/2)
        target.insert_text((center.x-fitz.get_text_length(text,fontname="hebo",fontsize=fs)/2,center.y),text,fontname="hebo",fontsize=fs,color=(.16,.3,.4),fill_opacity=.12,morph=(center,fitz.Matrix(30)),overlay=True)
        target.draw_rect(fitz.Rect(0,h,w,h+48),color=None,fill=(.035,.065,.09))
        target.insert_text((16,h+12),f"GHOST AVIATOR  |  Free study edition  |  {i+1} / {len(src)}",fontsize=7,fontname="hebo",color=(.97,.78,.5))
        # Two rows keep labels legible even on compact pages; source art is
        # unchanged and the footer occupies newly added space below it.
        for n,(label,url) in enumerate(links):
            col,row=n%3,n//3; x=16+col*(w-32)/3; y=h+26+row*12
            target.insert_text((x,y),label,fontsize=7,fontname="helv",color=(.8,.9,1))
            target.insert_link({"kind":fitz.LINK_URI,"from":fitz.Rect(x,y-8,x+fitz.get_text_length(label,fontsize=7)+4,y+2),"uri":url})
    # Import original clickable references after every target page exists.
    for i,page in enumerate(src):
        if book.get("backCover") == "simple" and i == len(src)-1: continue
        for link in page.get_links():
            data={k:v for k,v in link.items() if k not in ("xref","id")}
            if link["kind"] in (fitz.LINK_URI,fitz.LINK_GOTO) and (link["kind"]!=fitz.LINK_GOTO or 0<=link.get("page",-1)<len(src)):
                dest[i].insert_link(data); original_links+=1
    dest.set_toc(toc);dest.set_metadata({"title":book["title"],"author":"Capt. Pankaj Pahil · Ghost Aviator","subject":"Free DGCA study edition","keywords":"Ghost Aviator, DGCA, free study book, chapter bookmarks","creator":"Ghost Aviator book publishing"})
    dest.set_page_labels(src.get_page_labels());dest.set_pagemode("UseOutlines")
    # No password to open, download, read or print. Respecting readers prevent
    # editing outlines/content. Owner password is random and never published.
    permissions=fitz.PDF_PERM_PRINT|fitz.PDF_PERM_PRINT_HQ|fitz.PDF_PERM_COPY|fitz.PDF_PERM_ACCESSIBILITY
    path=OUT/(book["slug"]+"-ghost-aviator.pdf")
    dest.save(path,garbage=4,deflate=True,encryption=fitz.PDF_ENCRYPT_AES_256,owner_pw=secrets.token_urlsafe(24),user_pw="",permissions=permissions)
    dest.close();check=fitz.open(path)
    assert not check.is_encrypted and len(check)==len(src)
    assert check.get_toc()==toc and not(check.permissions & fitz.PDF_PERM_MODIFY)
    for i,p in enumerate(check):
        text=p.get_text();assert "GHOST AVIATOR" in text and "Free study edition" in text
        assert set(u for _,u in links)<=set(l.get("uri","") for l in p.get_links()),(book["slug"],i)
        assert abs(p.rect.height-src[i].rect.height-48)<.1
        # Importing the original page must preserve its searchable words.
        original=set(src[i].get_text().split()) if not(book.get("backCover")=="simple" and i==len(src)-1) else set()
        assert original<=set(text.split()),(book["slug"],i,"source text changed")
    if path.stat().st_size>=99_000_000:raise ValueError(f"{path.name} exceeds repository file budget")
    samples=sorted(set([0,min(6,len(check)-1),len(check)//2,len(check)-1]))
    for i in samples:check[i].get_pixmap(matrix=fitz.Matrix(.85,.85)).save(QA/f'{book["slug"]}-p{i+1}.png')
    entry={"slug":book["slug"],"title":book["title"],"subject":book["subject"],"url":"/downloads/books/"+path.name,"pages":len(check),"bookmarks":len(toc),"bytes":path.stat().st_size,"sha256":hashlib.sha256(path.read_bytes()).hexdigest()}
    catalog.append(entry);records.append({**entry,"sourceSha256":hashlib.sha256(Path(book["source"]).read_bytes()).hexdigest(),"footerPages":len(check),"watermarkPages":len(check),"footerLinksPerPage":len(links),"originalLinksRetained":original_links,"chapterOutline":toc,"permissions":check.permissions,"backCover":book.get("backCover","original")})
    print(json.dumps(entry),flush=True);check.close();src.close()
order={b["slug"]:i for i,b in enumerate(ALL_SOURCE)}
catalog.sort(key=lambda b:order[b["slug"]]);records.sort(key=lambda b:order[b["slug"]])
catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
record_path.write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding="utf-8")
(ROOT/"lib/generated/book-download-checks.json").write_text(json.dumps(records,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
