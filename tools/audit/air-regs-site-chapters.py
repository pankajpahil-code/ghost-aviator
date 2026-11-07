"""Air Regulations: place each bank question in the SITE chapter its topic and cited source belong to.

Why: the Air Regs bank was classified into the source book's old 13 chapters, and the site has 26.
Until 2026-11-07 lib/questions.ts served each site chapter a whole old chapter, so several site
chapters showed one identical pool (ar-5/6/8 all served altimetry + separation + transponder;
ar-2/14/15 all served registration + licensing + airworthiness; ar-11 Visual Aids served AIS).

How: banks whose old chapter IS one site chapter keep it (KEEP below). The six merged banks, and the
old ATS bank (it held the separation and surveillance material the site now teaches separately),
are split question by question with RULES, matched on stem + keyed answer + the source the
2026-09-21 audit cited for that question. First rule that matches wins; order is deliberate.

Usage: python -I tools/audit/air-regs-site-chapters.py <dump.json> lib/generated/air-regs-site-chapters.ts [--print]
  dump.json from: npx tsx tools/audit/_ar-dump-for-map.mts <dump.json>   (reads BANK chapter ids)
Writes {stemKey: siteChapter} as a TS module. --print lists every question a rule moved, for review.
"""
import json, re, sys

KEEP = {  # bank chapter -> site chapter, one to one
    "ar-1": "ar-1", "ar-3": "ar-3", "ar-9": "ar-13", "ar-13": "ar-18",
    "sar": "ar-10", "ar-10": "ar-26", "ar-11": "ar-24",
}
SPLIT_DEFAULT = {  # bank chapter -> site chapter used when no rule matches
    "ar-2": "ar-14", "ar-4": "ar-12", "ar-5": "ar-5", "ar-6": "ar-4",
    "ar-7": "ar-9", "ar-8": "ar-19", "ar-12": "ar-16",
}

R = lambda p: re.compile(p, re.I)
RULES = [
    # (site chapter, pattern over "stem || answer", pattern over cited source or None)
    ("ar-9", R(r"\|\| *aip\b"), None),  # "... are given in / published in => AIP": where-to-find questions
    ("ar-13", R(r"slaughter"), None),
    ("ar-2", R(r"registration|nationality|registered"), R(r"Annex 7|Series F")),
    ("ar-11", R(r"instrument runway|cat i runway|over yellow|yellow back ?ground|red square|yellow diagonal"), None),
    ("ar-4", R(r"special air|aircraft observations|air-?report|^[^|]*(class [a-g] airspace|class of (controlled )?airspace|in class [a-g])"), None),
    ("ar-16", R(r"fuel"), None),
    ("ar-3", R(r"mountainous"), None),
    ("ar-21", R(r"7500|unlawful interference|hijack|sabotage|annex 17|\bavsec\b|screening"), None),
    ("ar-7", R(r"immediate take-?off|hold short|aerodrome local flying area|atz|r/t failure|rescue (&|and) fire services are alerted|taxy behind|blinking runway|flashing runway|marshall|either arm|arms extended|patting gesture|hand down and waves|light signal|red flash|white flash|flashing (green|white|red)|steady (red|green)|continuous red|red beam|projectile|red and green proj|maneuvering area|manoeuvring area|movement area|^apron is|pyrotechnic"), R(r"Doc 4444 7\.")),
    ("ar-19", R(r"accident|\bincident|wreckage|investigat|\bfdr\b|\bcvr\b|flight (data |voice )?recorder|data recorder|notifiable"), None),
    ("ar-10", R(r"alert phase|uncertaint?i?y phase|distress phase|incerfa|alerfa|detresfa|\brcc\b|survivor|emergency locator|\belt\b|apprehension exists|apprension exits|fails to (land|arrive)|does not land within|symbol|ground-air|ground to air"), None),
    ("ar-20", R(r"quarantin|public health|incubation|disinsect|customs|immigration|general declaration|manifest|yellow fever"), None),
    ("ar-6", R(r"(separation|spacing|minutes?\b|mins?\b).*(depart|take[- ]?off|taking off|arriv|\bland)|(depart|take[- ]?off|taking off|arriv|\bland).*(separation|spacing|minutes?\b)"), R(r"Doc 4444 (5\.8|6\.)")),
    ("ar-17", R(r"behind a (large|heavy|jet)|vortic|vortex|wake|turbulence(?!.*(separation|categor))|wind ?shear|microburst|volcanic|bird|de-?ic|dangerous goods|laser"), None),
    ("ar-8", R(r"transponder|\bssr\b|squawk|mode a\b|mode c\b|mode s\b|radar|\bacas\b|\btcas\b|ads-b|7600|7700|vector"), None),
    ("ar-5", R(r"separation|rvsm|crossing a point|reports at a point|wants to descend|wishes to descen|reciprocal traffic|climbing a/?c is crossing|crossing track|wake turbulence categ"), R(r"Doc 4444 5\.")),
    ("ar-16", R(r"\brvr\b|minima|cat ?ii|category iii|\bhat\b|take[- ]?off alternate|\bfuel\b|etops|\bedto\b|operations? manual|\boperator\b|flight time limitation|flight time .?means|required to carry|documents|pic of an aeroplane|flt\.? ?engg|flight engineer"), None),
    ("ar-11", R(r"papi|vasi|marking|stripe|threshold|taxi ?way|taxy track|beacon|\bsigns?\b|touchdown|\btdzl?\b|centre ?line|center ?line|aiming point|rapid exit|runway (direction|number)|runaway direction|numbered|oriented|\bclosed\b|close part|aerodrome elevation|airfield elevation|highest point on the landing|\barp\b|rescue and fire|annex 14|instrument runway|cat i runway|signal area|signals area|signal square|dumbbell|red square|yellow diagonal|landing direction|white t\b|double white cross|runway lighting|lights (are|will be|shall be)"), R(r"CAR Sec 4 Series B|Annex 14")),
    ("ar-12", R(r"altimeter|\bqnh\b|\bqne\b|\bqfe\b|1013|29\.92|transition (altitude|level|layer)|pressure altitude|report (its|their) height|reported as|reports? its height|height .* reported|enroute flt levels|holding (pattern|procedure|entry|fix)|racetrack|\bmsa\b|sector safety|safety altitude|\boc[ah]\b|\bmd[ah]\b|\bmdh\b|decision (altitude|height)|\bd[ah]\b|circling|missed approach|\bsids?\b|\bstar\b|straight out departure|en-?route altitude|\bmea\b|obstacle clearance|procedure turn|precision app|non-?precision|glide ?slope|glide path"), R(r"Doc 8168|PANS-OPS|ENR 1\.7")),
    ("ar-3", R(r"danger area|prohibited area|restricted area|military aero ?plane|intercept|mountainous|circuit pattern|alternate aerodrome means|right of way|cruising level"), R(r"^Annex 2(?! App 1)")),
    ("ar-9", R(r"notam|\baip\b|airac|\baic\b|aeronautical information|watch hours|deviations? from|differences|snowtam|jeppesen|air routes|flight plan is|flt plan is"), R(r"GEN 3\.1|GEN 1\.7|Annex 15")),
    ("ar-15", R(r"airworth|c of a\b|\bcoa\b|flight manual|modif|maintenance|\bmel\b"), R(r"Annex 8")),
    ("ar-14", R(r"licen[cs]|medical|rating|log ?books?|instrument (flying )?time|cross-country|renew|revalidat|revived|co-?pilot flying|hospitali|aerial work|\bcpl\b|\batpl\b|\bppl\b"), R(r"Annex 1\b|CAR Sec 7")),
    ("ar-4", R(r"advisory service|air traffic control service|air traffic service|\bclass [a-g]\b|airspace|\bfir\b|flight information|\btma\b|\butc\b|clearance"), R(r"Annex 11|ENR 1\.4")),
]

def classify(r, by_tsv):
    bank = r["bank"]
    if bank in KEEP:
        return KEEP[bank], "keep"
    if bank not in SPLIT_DEFAULT:
        return bank, "own"  # ar-14+ own site banks (ar-22/23/25): already site ids
    text = f'{r["q"]} || {r["a"]}'
    src = r["src"]
    m = re.match(r"as #(\d+)", src)
    if m and m.group(1) in by_tsv:
        src = by_tsv[m.group(1)]
    for ch, tp, sp in RULES:
        # The ATS bank is matched on wording only: its cited sources are mostly ATS documents
        # whose section numbers do not separate the topics the site splits out.
        if tp.search(text) or (sp is not None and bank != "ar-6" and sp.search(src)):
            # The old ATS bank stays in ATS unless the rule names a chapter the site
            # teaches separately from ATS.
            if bank == "ar-6" and ch not in {"ar-5", "ar-6", "ar-7", "ar-8", "ar-10", "ar-11", "ar-12", "ar-17", "ar-19", "ar-21"}:
                return "ar-4", "keep-ats"
            return ch, "rule"
    return SPLIT_DEFAULT[bank], "default"

def main():
    rows = json.load(open(sys.argv[1], encoding="utf8"))
    tsv = {}
    for line in open("tools/audit/air-regs-full-audit-2026-09-21.tsv", encoding="utf8").read().split("\n")[1:]:
        c = line.split("\t")
        if len(c) > 8:
            tsv[c[0]] = c[8]
    out, report = {}, []
    for r in rows:
        if not r["bank"]:
            continue
        ch, why = classify(r, tsv)
        key = re.sub(r"[^a-z0-9]", "", r["q"].lower())
        out[key] = ch
        report.append((ch, r["bank"], why, r["src"][:40], r["q"][:100], r["a"][:30]))
    body = json.dumps(out, sort_keys=True, separators=(",", ":"))
    assert "`" not in body and "\\" not in body and "${" not in body
    defaults = json.dumps({**KEEP, **SPLIT_DEFAULT}, sort_keys=True)
    with open(sys.argv[2], "w", encoding="utf8", newline="\n") as f:
        f.write(
            "// GENERATED by tools/audit/air-regs-site-chapters.py, do not edit by hand.\n"
            "// Air Regulations: the SITE chapter each bank question belongs to, keyed by its normalised\n"
            "// stem (lowercase letters and digits only, the key lib/questions.ts de-dupes on).\n"
            "// Regenerate:\n"
            "//   npx tsx tools/audit/_ar-dump-for-map.mts <dump.json>\n"
            "//   python -I tools/audit/air-regs-site-chapters.py <dump.json> lib/generated/air-regs-site-chapters.ts\n"
            f"export const AIR_REGS_SITE_CHAPTER: Record<string, string> = JSON.parse(`{body}`);\n"
            "// Old bank chapter -> site chapter, for a question added to the bank after this file was generated.\n"
            f"export const AIR_REGS_BANK_DEFAULT: Record<string, string> = {defaults};\n"
        )
    if "--print" in sys.argv:
        for row in sorted(report, key=lambda x: (int(x[0].split("-")[1]), x[1])):
            if row[2] in ("rule", "default", "keep-ats"):
                print(" | ".join(row))
    counts = {}
    for ch in out.values():
        counts[ch] = counts.get(ch, 0) + 1
    print(sorted(counts.items(), key=lambda kv: int(kv[0].split("-")[1])), file=sys.stderr)

main()
