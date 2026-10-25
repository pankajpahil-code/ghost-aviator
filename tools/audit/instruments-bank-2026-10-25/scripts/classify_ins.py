import json, re, sys, collections
W = sys.argv[1]
kw = json.load(open(W + r'\ins\kwins_q.json', encoding='utf-8'))
SEC = {'PITOT STATICS': 'inst-2', 'ALTEMETER': 'inst-5', 'RADIO ALTIMETERS': 'inst-20', 'VSI': 'inst-6', 'ASI': 'inst-4',
       'AIRSPEEDS': 'inst-4', 'MACH': 'inst-7', 'ATTITUDE': 'inst-13', 'EFIS': 'inst-22', 'FLIGHT DIRECTOR': 'inst-25',
       'EICAS/ECAM': 'inst-39', 'ENGINE': 'inst-38', 'FUEL': 'inst-38', 'TCAS': 'inst-35', 'CRP5': 'nav-cx3-6'}


def has(t, *ps):
    return any(re.search(p, t) for p in ps)


def cls(k):
    s = k['sec_hdr']; t = (k['q'] + ' ' + ' '.join(k['opts'].values())).lower()
    if s in SEC:
        return SEC[s]
    if s == 'GYRO':
        if has(t, r'directional gyro|\bdgi\b|direction indicator|heading indicator'): return 'inst-12'
        if has(t, r'artificial horizon|attitude indicator|vertical gyro|vertical reference'): return 'inst-13'
        if has(t, r'turn co-?ordinator'): return 'inst-15'
        if has(t, r'turn (and|&) slip|turn indicator|rate gyro|needle and ball|rate of turn'): return 'inst-14'
        return 'inst-11'
    if s == 'TURN/SLIP':
        return 'inst-15' if has(t, r'turn co-?ordinator') else 'inst-14'
    if s == '1NS/IRS/FMS':
        if has(t, r'\bfms\b|\bfmc\b|\bcdu\b|data ?base|flight management'): return 'inst-21'
        if has(t, r'\birs\b|ring laser|laser|strap ?down|dither|lock.?in'): return 'inst-19'
        return 'inst-18'
    if s == 'AUTOFLIGHT':
        if has(t, r'auto ?land|flare|roll.?out|fail.?(passive|operational|soft)|alert height|category iii|cat iii'): return 'inst-27'
        if has(t, r'auto.?throttle|thrust (management|computer)|a/t\b'): return 'inst-28'
        if has(t, r'yaw damp|dutch roll'): return 'inst-29'
        if has(t, r'control law|fly.?by.?wire|normal law|alternate law|direct law|envelope protection'): return 'inst-30'
        return 'inst-26'
    if s == 'TEMP':
        return 'inst-3' if has(t, r'total air|\btat\b|\bsat\b|ram rise|recovery|outside air|air temperature') else 'inst-38'
    if s == 'COMPASS':
        if has(t, r'deviation|hard iron|soft iron|coefficient|compass swing|swing'): return 'inst-16'
        if has(t, r'remote|flux|slav|gyro.?magnetic|synchro|precession|rmi'): return 'inst-17'
        if has(t, r'turning error|acceleration error|aperiodic|liquid|swirl|pendulous|direct (reading|indicating)|accelerat|turn'): return 'inst-10'
        return 'inst-9'
    if s == 'WARN/REC':
        if has(t, r'\bgpws\b|ground proximity|mode [1-7]|terrain'): return 'inst-34'
        if has(t, r'\bfdr\b|flight data recorder'): return 'inst-36'
        if has(t, r'\bcvr\b|cockpit voice'): return 'inst-37'
        if has(t, r'stall|overspeed|stick shaker|vmo|mmo'): return 'inst-33'
        return 'inst-32'
    return 'inst-40'


for k in kw:
    k['ch'] = cls(k)
    k['subj'] = 'air-navigation' if k['ch'].startswith('nav') else 'instrumentation'
json.dump(kw, open(W + r'\ins\kwins_q.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
new = [k for k in kw if not k['site_dup'] and not k['internal_dup']]
print(sorted(collections.Counter(k['ch'] for k in new).items(), key=lambda x: int(x[0].split('-')[-1]) if x[0].startswith('inst') else 99))
