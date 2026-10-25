import json, re, sys, os, collections
W, outts, outjson = sys.argv[1], sys.argv[2], sys.argv[3]
allr = json.load(open(os.path.join(W, 'final_all.json'), encoding='utf-8'))
SUBTOPIC = {
    'PITOT STATICS': 'Pitot-Static System', 'ALTEMETER': 'Altimeter', 'RADIO ALTIMETERS': 'Radio Altimeter', 'VSI': 'Vertical Speed Indicator',
    'ASI': 'Airspeed Indicator', 'AIRSPEEDS': 'Airspeeds', 'MACH': 'Machmeter', 'GYRO': 'Gyroscopes', 'ATTITUDE': 'Attitude Indicator',
    'TURN/SLIP': 'Turn and Slip Indicator', '1NS/IRS/FMS': 'INS, IRS and FMS', 'EFIS': 'EFIS', 'AUTOFLIGHT': 'Autopilot and Autoflight',
    'FLIGHT DIRECTOR': 'Flight Director', 'EICAS/ECAM': 'EICAS and ECAM', 'ENGINE': 'Engine Instruments', 'TEMP': 'Temperature Measurement',
    'FUEL': 'Fuel Gauging and Flow', 'COMPASS': 'Compasses and Directional Gyros', 'WARN/REC': 'Warning Systems', 'TCAS': 'TCAS',
    'CRP5': 'Flight Computer (CX-3)',
}
DEG = re.compile(r'(?<=\d)\s?o(?=\s|[.,;:)/\\\-–NSEWTMRLCF(]|$)')
TYPO = [
        ('Decerase', 'Decrease'), ('Statir', 'Static'), ('+/-7S', '+/-75'), ('1020 nib', '1020 hPa'), ('1000 inh.', '1000 hPa,'),
        ('85SI.8', '8551.8'), ('7348.2ft', '7348.2 ft'), ('(VS1)', '(VSI)'), ('wil......', 'will......'), ('lQ.5', '10.5'), ('I80', '180'),
        ('centra)', 'central'), ('and EAV', 'and E/W'), ('the EAV', 'the E/W'), ('/ero', 'zero'), ('liii', '(ii)'), ('OH lamp', 'DH lamp'),
        ('autopilt', 'autopilot'), ('EFSI', 'EHSI'), ('EAD1', 'EADI'), ('ERSI', 'EHSI'), ('NI,', 'N1,'), ('NI or', 'N1 or'),
        ('Do nothings', 'Do nothing'), ('see beck', 'Seebeck'), ('The misters', 'Thermistors'), ('Lbfft', 'lbf ft'),
        ('15° C to 4i»" C', '15° C to 5° C'), ('Deci metric', 'Decimetric'), ('Cent metric', 'Centimetric'), ('Mill metric', 'Millimetric'),
        ('Not change not', 'Not change, not change'), ('Not change change,', 'Not change, change'), ('Increase increase', 'Increase, increase'),
        ('Decrease decrease', 'Decrease, decrease'), ('Decrease Decreas', 'Decrease, decrease'), ('Not change Increase', 'Not change, increase'),
        ('Not change Decreas', 'Not change, decrease'), ('override RA', 'overrides RA'),
        ('VN0', 'VNO'), ('VM0', 'VMO'), ('VF0', 'VFO'), ('VL0', 'VLO'), ('VS0', 'VSO'), ('MMo', 'MMO'), ('1AS', 'IAS'), ('l AS', 'IAS'),
        ('autopiJot', 'autopilot'), ('advison\'"', 'advisory"'), ('advisor)\'"', 'advisory"'), ('od board', 'on board'), ('pilo9t', 'pilot'),
        ('Desengage', 'Disengage'), ('the immediately', 'then immediately'), ('thet rate', 'that rate'), ('cu\\p', 'cup'), ('S\\V', 'SW'),
        ('KM I rose', 'RMI rose'), ('R1MC', 'RIMC'), ('E1CAS', 'EICAS'), ('EFISPFD', 'EFIS PFD'), ('EiCAS', 'EICAS'), ('Pie/o', 'Piezo'),
        ('Ratioraeters', 'Ratiometers'), ('Bourden', 'Bourdon'), ('Tow dissimilar', 'Two dissimilar'), ('theyconnected', 'they connected'),
        ('Ron-mount', 'Rosemount'), ('total ait', 'total air'), ('Acceleration son', 'Accelerations on'), ('aquare', 'square'),
        ('mach', 'Mach'), ('Sat plus', 'SAT plus'), ('A uto Trim', 'Auto Trim'), ('V OR', 'VOR'), ('W ill', 'Will'), ('T here', 'There'),
        ('front an automatic', 'from an automatic'), ('altitude old', 'altitude hold'), ('et to VOR', 'set to VOR'), ('Dutch rol!', 'Dutch roll'),
        ('u> reduce', 'to reduce'), ('GHdeslope', 'Glideslope'), ('LOG ARMED', 'LOC ARMED'), ('ail the correct', 'all the correct'),
        ('I, 2, 3.', '1, 2, 3.'), ('statements I?', 'statements is?'), ('statements is\'', 'statements is?'), ('crow n', 'crown'),
        ('OH pressure', 'Oil pressure'), ('twp outputs', 'two outputs'), ('directlv', 'directly'), ('PS1', 'PSI'), ('Nl', 'N1'),
        ('Plight Director', 'Flight Director'), ('aero plane', 'aeroplane'), ('autopiot', 'autopilot'), ('I hi- measurement', 'The measurement'),
        ('(L 3,5', ''), ('Us indicator', 'its indicator'), ('Stili', 'Still'), ('Kts', 'kt'), ('kts', 'kt')]


def clean(s):
    s = s.replace('\t', ' ').replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"').replace('…', '...')
    for a, b in TYPO:
        s = s.replace(a, b)
    s = DEG.sub('°', s)
    s = re.sub(r'(?<=\d)o C\b', '°C', s)
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'\s+([.,?])', r'\1', s)
    s = re.sub(r'\?+$', '?', s)
    return s


def opt(s):
    s = clean(s)
    s = re.sub(r'\.$', '', s)
    return s


def tl(s):
    return '`' + s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${') + '`'


live = [r for r in allr if r['status'] in ('VERIFIED', 'CORRECTED')]
live.sort(key=lambda r: (int(r['ch'].split('-')[-1]) if r['ch'].startswith('inst-') else 999, r['ch'], r['sec'], r['n']))
rows = []
BAD = 0
for r in live:
    subj = ['instrumentation'] if r['ch'].startswith('inst-') else ['air-navigation', 'atpl-navigation']
    q = clean(r['q'])
    opts = [opt(o) for o in r['opts']]
    if len(set(o.lower() for o in opts)) != 4:
        print('DUP OPTIONS', r['sec'], r['n'], opts); BAD += 1; continue
    rows.append(dict(subjectIds=subj, chapterId=r['ch'], subtopic=SUBTOPIC[r['sec']], q=q, opts=opts, ans=r['ans'], exp=clean(r['exp']),
                     _sec=r['sec'], _n=r['n'], _status=r['status'], _notes=r.get('notes', []), _book=r.get('book')))
assert BAD == 0, BAD
by = collections.Counter(x['chapterId'] for x in rows)
lines = ['import type { DemoQuestion } from "../demo-questions";', '',
         '// AUTO-GENERATED by tools/audit/instruments-bank-2026-10-25/build - do not edit by hand.',
         '// Instruments practice bank, checked 2026-10-25: every key reasoned against the source working or worked',
         '// from the question data; explanations written fresh. Repeats of questions already on the site were left out.',
         f'// {len(rows)} questions . per chapter: {json.dumps(dict(sorted(by.items())))}',
         'export const INS_PRACTICE: DemoQuestion[] = [']
for x in rows:
    lines += ['  {',
              f'    subjectIds: {json.dumps(x["subjectIds"])},',
              f'    chapterId: "{x["chapterId"]}",',
              f'    subtopic: {tl(x["subtopic"])},',
              f'    source: `Instruments practice bank`,',
              f'    q: {tl(x["q"])},',
              f'    opts: [{", ".join(tl(o) for o in x["opts"])}],',
              f'    ans: {x["ans"]},',
              f'    exp: {tl(x["exp"])},',
              '  },']
lines += ['];', '']
open(outts, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))
json.dump(rows, open(outjson, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(rows), dict(sorted(by.items())))
