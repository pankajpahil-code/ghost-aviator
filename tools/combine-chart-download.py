from pathlib import Path
import fitz,json
ROOT=Path(__file__).resolve().parents[1]
ids=['nav-19','nav-20','nav-22','nav-23','nav-24','nav-25','nav-26']
base=ROOT/'public/downloads/notes/air-navigation'
cover=base/'nav-3.pdf'
doc=fitz.open(cover)
toc=[[1,'Aeronautical Charts - study collection',1]]
for cid in ids:
 child=fitz.open(base/(cid+'.pdf'));start=len(doc)+1
 title=child.metadata.get('title','').removesuffix(' | Ghost Aviator') or cid
 toc.append([1,title,start]);doc.insert_pdf(child);child.close()
doc.set_toc(toc)
temp=ROOT/'.notes-build/charts-collection.pdf'
doc.save(temp,garbage=4,deflate=True);doc.close()
cover.write_bytes(temp.read_bytes())
print('Combined charts PDF:',len(fitz.open(cover)),'pages')
