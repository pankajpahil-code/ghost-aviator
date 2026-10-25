import sys,os,json
from multiprocessing import Pool
from PIL import Image
import numpy as np
D=sys.argv[1]
eng=None
def work(p):
    global eng
    if os.path.exists(os.path.join(D,f"pg{p:03d}.json")) or os.path.exists(os.path.join(D,f"hd{p:03d}.json")): return
    if eng is None:
        from rapidocr_onnxruntime import RapidOCR
        eng=RapidOCR(intra_op_num_threads=1)
    im=np.array(Image.open(os.path.join(D,f"pg{p:03d}.png")).convert("RGB")); H,W=im.shape[:2]
    det,_=eng(im,use_det=True,use_cls=False,use_rec=False)
    out=[]
    for box in (det or []):
        xs=[pt[0] for pt in box]; ys=[pt[1] for pt in box]
        x0,x1,y0,y1=int(min(xs)),int(max(xs)),int(min(ys)),int(max(ys))
        if x1-x0>0.22*W: continue
        r,_=eng(im[max(0,y0-3):y1+3,max(0,x0-3):x1+3],use_det=False,use_cls=False,use_rec=True)
        if r: out.append([[x0,y0,x1,y1],r[0][0],float(r[0][1])])
    json.dump(out,open(os.path.join(D,f"hd{p:03d}.json"),"w",encoding="utf-8"),ensure_ascii=False)
    print("done",p,flush=True)
if __name__=="__main__":
    with Pool(4) as pool: pool.map(work,range(int(sys.argv[2]),int(sys.argv[3])),chunksize=1)
