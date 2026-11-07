"""Air Navigation: give a live chapter to every question whose chapter no longer exists.

Why: on 2026-10-16 (3b2a765) the subject's old chapters nav-1 Basics of Navigation, nav-2 Magnetism &
Compasses, nav-4 Dead Reckoning, nav-5 In-Flight Navigation, nav-10 Radio Navigation Aids, nav-11 Flight
Instruments and nav-12 Power Plant Instruments were removed from lib/subjects.ts. Their ~620 questions kept
the old ids, so no chapter page served them; they surfaced only in subject-wide mock tests.

How: each question goes to the live chapter its topic belongs to, decided by the topic label the source gives
(ECQB 061 "subtopic") and by the question + keyed answer wording. Instrument and radio-aid questions go to
the Instrumentation / Radio Navigation chapter that teaches them; they KEEP air-navigation as a subject, so
the Navigation mock tests do not lose them (the same pattern the Gen Nav practice bank already uses).

Usage: python -I tools/audit/nav-site-chapters.py <dump.json> lib/generated/nav-site-chapters.ts [--print]
  dump.json from: npx tsx tools/audit/_nav-orphans-dump.mts <dump.json>
"""
import json, re, sys

R = lambda p: re.compile(p, re.I)


# Topic label (ECQB 061 subtopic) -> chapter, when the label alone settles it.
BY_SUBTOPIC = [
    (R(r"^The Solar System"), "air-navigation/nav-27"),
    (R(r"^Navigation in climb and descent"), "air-navigation/nav-18"),
    (R(r"^Use of visual observations"), "air-navigation/nav-19"),
    (R(r"^Flight Log"), "air-navigation/nav-9"),
    (R(r"^Name range specifics of maximum range and radius"), "air-navigation/nav-cp-pnr"),
    (R(r"^Purposes of \(FMS\)|^Flight deck equipment"), "instrumentation/inst-21"),
]
INS_SUBTOPIC = R(r"^(Alignment Procedures|INS operation|Accuracy, reliability, errors|Principles and Practical application)")
COMPASS_SUBTOPIC = R(r"^(Principles; Direct & Remote|Aircraft Magnetism)")
CRUISE = R(r"^Navigation in Cruising Flight")

# Heading conversions (compass <-> magnetic <-> true) are taught in Earth Magnetism (nav-15), whatever the label.
CONVERSION = ("air-navigation/nav-15", R(r"cdmvt|heading \(c\)|(compass|magnetic|true) (hdg|heading)[^?]*(deviation|variation|\bvar\b)|(deviation|variation|\bvar\b)[^?]*(compass|magnetic|true) (hdg|heading)|what is (the )?magnetic heading"))
COMPASS_TURN_ACCEL = ("instrumentation/inst-10", R(r"accelerat|decelerat|turning error|turn(s|ing)? (right|left)|rate one turn|rate 1 turn|aperiodic|dead beat|sensitivity of a direct|force acting on the needle"))
REMOTE = ("instrumentation/inst-17", R(r"remote (reading |indicating )?(magnetic )?compass|flux (valve|detector|gate)|detector unit|gyro-?magnetic|slav(ed|ing)|annunciator"))
AIRCRAFT_MAG = ("instrumentation/inst-16", R(r"deviation|swing|swung|calibration|hard iron|soft iron|aircraft magnetism|permanent magnetism|compensat|coefficient"))

# Instruments and radio aids. Applied only to questions with NO source topic label (the removed nav-10/11/12
# chapters and the hand-written sets): in the ECQB 061 dead-reckoning topics a VOR, DME or INS is only the
# setting of a navigation sum.
INSTR = [
    ("air-navigation/nav-18", R(r"rate of descent|height above|ft/min|feet per (minute|nm)")),
    ("instrumentation/inst-21", R(r"\bfms\b|flight management|\bcdu\b|\bmcdu\b|navigation database")),
    ("instrumentation/inst-19", R(r"\birs\b|inertial reference|strap ?down|ring laser|\brlg\b")),
    ("instrumentation/inst-18", R(r"\bins\b|inertial|alignment (phase|mode|time)|gyro-?compassing|schuler|platform|accelerometer")),
    ("instrumentation/inst-12", R(r"directional gyro|heading indicator|\bdgi?\b")),
    ("radio-navigation/rnav-8", R(r"\bvor\b|radial")),
    ("radio-navigation/rnav-15", R(r"\bdme\b|distance measuring")),
    ("radio-navigation/rnav-7", R(r"\badf\b|\bndb\b|relative bearing indicator|\brbi\b|\brmi\b")),
    ("radio-navigation/rnav-9", R(r"\bils\b|localiser|localizer|glide ?slope|glidepath|marker beacon")),
    ("radio-navigation/rnav-18", R(r"\bgps\b|\bgnss\b|satellite|ads-b")),
    ("radio-navigation/rnav-14", R(r"transponder|\bssr\b|squawk|7700|7600|7500|mode c\b|mode s\b")),
    ("instrumentation/inst-35", R(r"\btcas\b|\bacas\b|collision avoidance")),
    ("instrumentation/inst-34", R(r"\bgpws\b|ground proximity")),
    ("instrumentation/inst-38", R(r"\begt\b|\bcht\b|exhaust gas|cylinder head|oil (pressure|temperature)|manifold pressure|\brpm\b|tachometer|fuel flow ?meter|fuel (flow|pressure|quantity) (gauge|indicat)|engine (instrument|gauge)")),
    ("instrumentation/inst-2", R(r"blocked|blockage|static vent|static port|pitot (tube|head)")),
    ("instrumentation/inst-7", R(r"machmeter")),
    ("instrumentation/inst-5", R(r"altimeter|1013")),
    ("instrumentation/inst-4", R(r"airspeed indicator|\basi\b")),
    ("instrumentation/inst-6", R(r"vertical speed indicator|\bvsi\b(?!\))")),
    ("instrumentation/inst-13", R(r"artificial horizon|attitude indicator")),
    ("instrumentation/inst-15", R(r"turn co-?ordinator")),
    ("instrumentation/inst-14", R(r"turn and slip|turn and bank|slip ball|rate (one|1) turn|standard rate turn")),
    ("instrumentation/inst-2", R(r"pitot|static")),
]

# General navigation, applied to every question. First match wins; order is deliberate.
NAV = [
    # planning problems that merely mention a place or a time: PNR/PET, ETA sums, grid navigation, map reading
    ("air-navigation/nav-cp-pnr", R(r"radius of action|point of no return|\bpnr\b|critical point|\bpet\b|\betp\b|equal time|safe return|ground ?speed (out|back)")),
    ("air-navigation/nav-cx3-5", R(r"\b(etd|eta|tas)\b[^?]*\butc\b")),
    ("air-navigation/nav-26", R(r"\bgrid\b|griv|polar stereographic")),
    ("air-navigation/nav-19", R(r"map reading|landmark|visual (fix|reference|check)|topograph")),
    ("air-navigation/nav-18", R(r"rate of descent|glide ?(slope|path)|descen|rate of climb|climb gradient|top of (climb|descent)")),
    # wind problems that quote variation are triangle-of-velocities sums, not magnetism
    ("air-navigation/nav-cx3-9", R(r"(wind|crosswind|headwind|tailwind) component|crosswind|multi-?drift")),
    ("air-navigation/nav-9", R(r"(calculate|find|determine|what is) (the )?(true )?(w/v|wind velocity)|calculate w/v")),
    ("air-navigation/nav-cx3-8a", R(r"calculate the (true )?hdg|(heading|hdg) \(.{0,6}\) and gs|calculate the heading")),
    ("air-navigation/nav-cx3-7", R(r"(w/v|wind velocity|wind)\s*(=|is|:)?\s*\d{3}|\bgs\b[^?]*\bw/v|flies \d+ nm in")),
    CONVERSION,
    ("air-navigation/nav-cx3-7", R(r"(variation|\bvar\b|magnetic|\(m\))[^|]*?(w/v|\btas\b|\bgs\b|groundspeed|drift)|(w/v|\btas\b|\bgs\b|groundspeed|drift)[^|]*?(variation|\bvar\b|magnetic|\(m\))")),
    REMOTE, AIRCRAFT_MAG,
    ("instrumentation/inst-10", R(r"direct[- ](reading|indicating) (magnetic )?compass|acceleration error|turning error|liquid swirl|northerly turning|compass (card|bowl|needle|errors?)|\bpendulous|\bdrc\b")),
    ("air-navigation/nav-15", R(r"isogon|agonic|variation|\bdip\b|magnetic (pole|field|equator|meridian|north|latitude)|isoclinal|aclinic|horizontal component|vertical component|magnetism|magnetic|compass")),
    # time and the Earth
    ("air-navigation/nav-29", R(r"sunrise|sunset|twilight")),
    ("air-navigation/nav-28", R(r"corresponds to a longitude|longitude difference of|date line|\blmt\b|\butc\b|\bgmt\b|standard time|zone time|arc (to|into) time|local mean time|time conversion|time zone|\beat\b")),
    ("air-navigation/nav-27", R(r"\bsun\b|solar|perihelion|aphelion|equinox|solstice|declination|season|orbit|sidereal|apparent time|mean time|ecliptic|tropic of|polar (day|night)|hour angle")),
    ("air-navigation/nav-20", R(r"convergency|conversion angle|convergence|angle between the (true )?great.circle track and the (true )?rhumb")),
    ("air-navigation/nav-21", R(r"departure (between|is|of|varies)|one degree of longitude|length of .{0,20}longitude|along (a|the) parallel|due (east|west)")),
    ("air-navigation/nav-14", R(r"orthodrom|loxodrom|great circle|\bgc\b|rhumb|vertex|vertices|small circle|radio bearings")),
    ("air-navigation/nav-22", R(r"\bscale\b|1\s*:\s*\d")),
    ("air-navigation/nav-24", R(r"mercator")),
    ("air-navigation/nav-25", R(r"lambert")),
    ("air-navigation/nav-23", R(r"\bchart\b|projection|orthomorph|conformal|graticule")),
    # dead reckoning and the CX-3 (what the question ASKS for decides it: every wind-triangle sum also states a TAS)
    ("air-navigation/nav-16", R(r"1 ?in ?60 rule")),
    ("air-navigation/nav-17", R(r"1 ?in ?60|track error|closing angle|off track|regain (the )?track|revise[ds]? (the )?eta|position line|\bfix\b|fixes|\bqte\b|heading alteration")),
    ("air-navigation/nav-9", R(r"(calculate|find|determine|what is) (the )?(w/v|wind velocity)|calculate w/v")),
    ("air-navigation/nav-cx3-8a", R(r"calculate the (true )?hdg|(heading|hdg) \(.{0,6}\) and gs|calculate the heading")),
    ("air-navigation/nav-cx3-6", R(r"(calculate|determine|what is|find)[^?]{0,40}\b(tas|mach|cas|density altitude|pressure altitude|true altitude|isa temperature)\b|effect on (tas|mach)|(tas|mach number)[^?]{0,20}(increase|decrease)|corrected for|from ias|\bisa\b|true alt|\boat\b[^?]*pressure alt")),
    # positions and distances on the Earth (before the wind triangle: "tracks 180 for 685 km" is a d-lat sum)
    ("air-navigation/nav-13", R(r"latitude|longitude|\bequator|meridian|diameter of the earth|semi-?(major|minor)|compression|ellipticity|flattening|angular distance|north pole|nautical mile|1852|circumference")),
    ("air-navigation/nav-cx3-7", R(r"drift|heading|w/v|wind velocity|\bwind\b|groundspeed|ground speed|\bg/?s\b|triangle of velocit|\btrack\b|\bwca\b")),
    ("air-navigation/nav-cx3-6", R(r"\btas\b|true air ?speed|\bcas\b|\beas\b|\bias\b|mach|density altitude|pressure altitude|temperature")),
    ("air-navigation/nav-17", R(r"\beta\b")),
    ("air-navigation/nav-cx3-5", R(r"\bkg\b|\blbs?\b|litre|liter|gallon|fuel|convert|statute|\bkm\b|feet|time|speed|distance|inches")),
    ("air-navigation/nav-19", R(r"visual|feature|relief|contour|spot height")),
    ("air-navigation/nav-13", R(r"parallel|shape of the earth|oblate|ellipsoid|d-?lat|d-?long|\bpole|earth")),
]
DEFAULT = {"nav-1": "air-navigation/nav-13", "nav-2": "air-navigation/nav-15", "nav-4": "air-navigation/nav-cx3-7",
           "nav-5": "air-navigation/nav-17", "": "air-navigation/nav-33"}
# The source's "Navigation in Cruising Flight, Use of Fixes to Revise" topic also holds PNR, great-circle and
# d-lat problems; those go by wording, the rest stay on Navigation Using the 1 in 60 Rule (fixes, revised ETAs).
CRUISE_ELSEWHERE = {"air-navigation/nav-cp-pnr", "air-navigation/nav-14", "air-navigation/nav-13", "air-navigation/nav-21"}

def first(rules, text):
    for ch, pat in rules:
        if pat.search(text):
            return ch
    return None

def classify(r):
    sub = r["sub"]
    qa = f'{r["q"]} || {r["a"]}'  # never the label: "Use of Fixes", "Direct & Remote" would match every question under it
    for pat, ch in BY_SUBTOPIC:
        if pat.search(sub):
            return ch, "subtopic"
    if INS_SUBTOPIC.search(sub):
        return first(INSTR[1:4], qa) or "instrumentation/inst-18", "ins-subtopic"
    if COMPASS_SUBTOPIC.search(sub):
        return first([CONVERSION, REMOTE, COMPASS_TURN_ACCEL, AIRCRAFT_MAG], qa) or "instrumentation/inst-10", "compass-subtopic"
    if not sub:
        ch = first([CONVERSION, COMPASS_TURN_ACCEL if re.search(r"compass", qa, re.I) else ("x", R(r"$^"))] + INSTR, qa)
        if ch:
            return ch, "instrument-wording"
    ch = first(NAV, qa if CRUISE.search(sub) else f"{sub} || {qa}")
    if CRUISE.search(sub):
        return (ch if ch in CRUISE_ELSEWHERE else "air-navigation/nav-17"), "cruise-subtopic"
    if ch:
        return ch, "wording"
    return DEFAULT.get(r["ch"], "air-navigation/nav-33"), "default"
def main():
    d = json.load(open(sys.argv[1], encoding="utf8"))
    live = {f"{s}/{c}" for s, chs in d["chapters"].items() for c, _ in chs}
    out, report = {}, []
    for r in d["rows"]:
        ch, why = classify(r)
        assert ch in live, ch
        key = re.sub(r"[^a-z0-9]", "", r["q"].lower())
        out[key] = ch
        report.append((ch, r["ch"], why, r["sub"][:34], r["q"][:110], r["a"][:30]))
    body = json.dumps(out, sort_keys=True, separators=(",", ":"))
    assert "`" not in body and "\\" not in body and "${" not in body
    with open(sys.argv[2], "w", encoding="utf8", newline="\n") as f:
        f.write(
            "// GENERATED by tools/audit/nav-site-chapters.py, do not edit by hand.\n"
            "// Air Navigation questions whose old chapter (nav-1/2/4/5/10/11/12) was removed on 2026-10-16:\n"
            "// \"subject/chapter\" each one is served on now, keyed by its normalised stem.\n"
            "// Regenerate:\n"
            "//   npx tsx tools/audit/_nav-orphans-dump.mts <dump.json>\n"
            "//   python -I tools/audit/nav-site-chapters.py <dump.json> lib/generated/nav-site-chapters.ts\n"
            f"export const NAV_SITE_CHAPTER: Record<string, string> = JSON.parse(`{body}`);\n"
        )
    if "--print" in sys.argv:
        for row in sorted(report):
            print(" | ".join(row))
    counts = {}
    for ch in out.values():
        counts[ch] = counts.get(ch, 0) + 1
    for k in sorted(counts):
        print(f"{counts[k]:4d}  {k}", file=sys.stderr)

main()
