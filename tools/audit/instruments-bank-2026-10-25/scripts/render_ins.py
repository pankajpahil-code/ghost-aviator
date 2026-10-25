import sys,os,subprocess
from multiprocessing import Pool
from PIL import Image
pdf=sys.argv[2]; out=sys.argv[1]  # second argument: path to the source PDF
def r(p):
    b=os.path.join(out,f"pg{p:03d}")
    if os.path.exists(b+".png"): return
    subprocess.run(["pdftoppm","-f",str(p),"-l",str(p),"-r","170","-gray","-png","-singlefile",pdf,b+"_t"],check=True)
    Image.open(b+"_t.png").rotate(-90,expand=True).save(b+".png"); os.remove(b+"_t.png")
if __name__=="__main__":
    with Pool(4) as pool: pool.map(r,range(int(sys.argv[2]),int(sys.argv[3])+1))
