import json,re,sys,collections
W=sys.argv[1]
kw=json.load(open(W+r'\kwgn_q.json',encoding='utf-8'))
def has(t,*ws): return any(re.search(w,t) for w in ws)
def cls(k):
    s=k['sec']; t=(k['q']+' '+' '.join(k['opts'].values())).lower(); q=k['q'].lower()
    if s=='PSR & PET': return 'air-navigation','nav-cp-pnr'
    if s=='SCALE': return 'air-navigation','nav-22'
    if s=='CRP5':
        if has(q,r'cross.?wind|head.?wind component|tail.?wind component|wind component'): return 'air-navigation','nav-cx3-9'
        if has(q,r'calculate the w/v|find the w/v|w/v (being|is)\b.*\?|what is the w/v|the w/v\?|w/v experienced|wind velocity'): return 'air-navigation','nav-9'
        if has(q,r'\beta\b|eta at|flight plan|fuel (used|required|remaining)|endurance'): return 'air-navigation','nav-9'
        if has(q,r'\btas\b.*\?|mach|density alt|pressure alt|\bias\b|\bcas\b|\boat\b|isa|temperature|speed of sound|\blss\b'): return 'air-navigation','nav-cx3-6'
        if has(q,r'us.?gal|imp|litre|liter|kg|lbs?\b|specific gravity|ft/min|m/s|statute|km|feet|metres|meters|how long|how many nm|how far|time'): return 'air-navigation','nav-cx3-5'
        if has(q,r'heading (required|to)|true h(ea)?d?g? and gs|hdg and gs|heading and (gs|ground)|course'): return 'air-navigation','nav-cx3-8a'
        if has(q,r'track|drift|gs\b|ground ?speed|heading'): return 'air-navigation','nav-cx3-7'
        return 'air-navigation','nav-cx3-5'
    if s in('CHART THEORY','CIRCLES'):
        if has(t,r'convergen|conversion angle'): return 'air-navigation','nav-20'
        if has(t,r'mercator'): return 'air-navigation','nav-24'
        if has(t,r'lambert|conic|cone'): return 'air-navigation','nav-25'
        if has(t,r'polar|stereographic'): return 'air-navigation','nav-26'
        if has(q,r'symbol|relief|contour|topograph|spot height|layer tint|hachur'): return 'air-navigation','nav-19'
        if s=='CHART THEORY': return 'air-navigation','nav-23'
        if has(q,r'departure|along the parallel|along a parallel|westward along|eastward along|due (east|west)'): return 'air-navigation','nav-21'
        if has(q,r'great circle|rhumb|vertex|vertices|initial (track|course)|shortest'): return 'air-navigation','nav-14'
        return 'air-navigation','nav-13'
    if s=='MAGNETISM & COMPASSES':
        if has(t,r'deviation|hard iron|soft iron|coefficient|compass swing|swing'): return 'instrumentation','inst-16'
        if has(t,r'remote|flux|slav|gyro|synchro|precession'): return 'instrumentation','inst-17'
        if has(t,r'turning error|acceleration error|aperiodic|liquid|swirl|pendulous|direct (reading|indicating)|compass needle|magnet system|accelerat|turn'): return 'instrumentation','inst-10'
        return 'air-navigation','nav-15'
    if s=='DESCENTS':
        if has(t,r'descen|glide|rate of descent|ft/min|rod\b|ils|gradient|climb'): return 'air-navigation','nav-18'
        if has(t,r'closing angle|track error|off track|regain|1 in 60|one in sixty'): return 'air-navigation','nav-17'
        return 'air-navigation','nav-18'
    if s=='INS IRS FMS EFIS':
        if has(t,r'\befis\b|display|\bnd\b|\bpfd\b|\beadi\b|\behsi\b|map mode|plan mode|symbol|colou?r|weather radar|arc mode|rose'): return 'instrumentation','inst-22'
        if has(t,r'\bfms\b|\bcdu\b|\bmcdu\b|data ?base|flight management|airac|lnav|vnav'): return 'instrumentation','inst-21'
        if has(t,r'\birs\b|ring laser|laser|strap ?down|dither|lock.?in|\bmsu\b|reference system'): return 'instrumentation','inst-19'
        return 'instrumentation','inst-18'
    if s=='PLOTTING': return 'air-navigation','PLOTTING'
    if s=='SOLAR SYSTEM & TIME':
        if has(t,r'sunrise|sunset|twilight|daylight'): return 'air-navigation','nav-29'
        if has(t,r'utc|lmt|standard time|zone time|date line|arc to time|local mean|time difference|clock'): return 'air-navigation','nav-28'
        return 'air-navigation','nav-27'
for k in kw: k['subj'],k['ch']=cls(k)
json.dump(kw,open(W+r'\kwgn_q.json','w',encoding='utf-8'),ensure_ascii=False,indent=0)
print(collections.Counter((k['sec'],k['ch']) for k in kw))
