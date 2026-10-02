"""fixes_build.py - the Met notes Q&A corrections, one entry per block.

Every entry here was decided against (1) the answer key printed in the IC Joshi 7th ed. chapter
question pages, read from the page image, (2) the CAE/Oxford ATPL Meteorology text, and (3) for the
METAR/TAF/ROFOR decode sets, by decoding the message itself. The evidence per item is in
MET_NOTES_AUDIT_2026-10-02.md. Student-facing text names no source (Iron Rule 2).

    python tools/met-notes-audit/fixes_build.py <notes_qa.json> > fixes.json
"""
import json, sys

notes = json.load(open(sys.argv[1], encoding="utf-8"))
byl = {}
import re
for o in notes:
    m = re.match(r"\s*(?:Question\s*)?Q?\s*(\d+)", o["q"] or "")
    if m:
        byl.setdefault((o["ch"], int(m.group(1))), o["idx"])

F = []


def R(ch, idx, a, e=None, d=None, t=None, q=None):
    f = {"ch": ch, "idx": idx, "action": "replace", "a": a}
    for k, v in (("q", q), ("e", e), ("d", d), ("t", t)):
        if v is not None:
            f[k] = v
    F.append(f)


def DROP(ch, idx):
    F.append({"ch": ch, "idx": idx, "action": "drop"})


def BEFORE(ch, idx, html):
    F.append({"ch": ch, "idx": idx, "action": "raw_before", "html": html})


BOX = ('<div style="background:#f3f6fb;border:1px solid #9db4d6;border-left:5px solid #2c5aa0;'
       'border-radius:8px;padding:12px 16px;margin:18px 0;font-family:\'Courier New\',monospace;'
       'font-size:0.95em;line-height:1.55;page-break-inside:avoid;"><div style="font-family:Arial,sans-serif;'
       'font-weight:bold;color:#1a237e;margin-bottom:6px;">{title}</div>{body}</div>')

# ---------------------------------------------------------------- met-1  Atmosphere
R(1, 6, "(a) Equator",
  e="Above the low polar tropopause (about 8 km) the polar air is already in the stratosphere, where temperature stops falling and begins to rise. Over the Equator the troposphere is still 16–18 km deep and keeps cooling, reaching about −75 to −80 °C at its top, against −40 to −50 °C at the Poles. So above 8 km it is colder over the Equator.",
  d="(b) Mid-latitudes lie between the two extremes. (c) Poles: above 8 km the polar air is the warmer of the two.",
  t="At the surface the Equator is warmest; at tropopause level the Equator is coldest. The picture turns over at about 8 km.")
R(1, 31, "(a) 20,000 ft",
  e="Half of the mass of the atmosphere lies below about 5.5–6 km, roughly 18,000–20,000 ft. Of the three options, 20,000 ft is the closest.",
  d="(b) 15,000 ft (about 4.6 km) and (c) 10,000 ft (about 3 km) are too low: well over half of the air is still above those levels.",
  t="Half the air is below about FL180, which is why the 500 hPa level sits near FL180.")
R(1, 35, "(c) 16–16.5 km",
  e="The tropical tropopause lies near the 100 hPa level, roughly 16–16.5 km, and extends from the equator to about 35°–40° latitude. It is the tropopause over most of India in the summer.",
  d="(a) 20–21 km is higher than any tropopause. (b) 14–15 km is lower than the ~100 hPa tropical level.",
  t="Tropical tropopause: about 100 hPa, 16 km. Polar tropopause: about 300 hPa, 8–10 km.")
R(1, 37, "(b) 30,000 ft",
  e="Water vapour is held in the lowest part of the troposphere and falls off quickly with height. Above about 30,000 ft the amount is negligible, so that is the limit up to which it is confined.",
  d="(a) The stratosphere holds almost no water vapour. (c) and (d): most of the vapour is in the lower troposphere, but the level asked for is the upper limit of its presence.",
  t="Water vapour: troposphere only, mostly in the lowest few km, negligible above 30,000 ft.")
R(1, 45,
  q="Q45 There is reversal of temperature in the atmosphere at 8 km because: (a) Lapse rate at poles is always higher than at equator (b) Lapse rate at equator is always higher than at poles (c) Lapse rate at equator is the same as at poles even above the poles (d) Lapse rate reverses at poles and becomes negative",
  a="(d) Lapse rate reverses at poles and becomes negative",
  e="The polar tropopause is only about 8 km high. Above it the temperature stops falling and rises with height (a negative lapse rate), while over the equator the air is still cooling. That is why the Pole-to-Equator temperature contrast reverses at about 8 km.",
  d="(a) and (b) compare lapse rates in the wrong way: below the tropopause the lapse rate is similar in both regions. (c) The lapse rate is not the same above the poles; it reverses there.",
  t="Below 8 km poles are colder. Above 8 km the polar stratosphere is warmer than the equatorial troposphere.")
R(1, 32, "(a) 2°C/1000 ft",
  e="The Jet Standard Atmosphere assumes a constant lapse rate of 2 °C per 1000 ft and has no tropopause.",
  d="(b) 2 °C/km is far too small a lapse rate. (c) 5 °C/km is not a standard rate.",
  t="JSA: 2 °C/1000 ft, no tropopause. ISA: 6.5 °C/km (about 2 °C/1000 ft) up to 11 km, then isothermal.")

# ---------------------------------------------------------------- met-2  Pressure
R(2, 3, "(c) Weak",
  e="In a high (anticyclone) the isobars are widely spaced, so the pressure gradient is slack and the winds are light.",
  d="(a) 'Normal' is not a description of wind strength. (b) Strong winds go with closely packed isobars, as in a deep low.",
  t="High = light winds, sinking air, fair weather. Low = stronger winds, rising air, bad weather.")
R(2, 4, "(b) Under",
  e="Flying from low towards high pressure with the subscale unchanged, the altimeter under-reads: the aircraft is higher than the altimeter shows.",
  d="(a) Over-reading is the error when flying from high to low pressure. (c) The reading does not stay correct: the error grows as the pressure changes.",
  t="High to Low, look out below (the altimeter over-reads). Low to High, you are higher than indicated (it under-reads).")
R(2, 6, "(a) Aneroid",
  e="An altimeter is an aneroid barometer: a sealed, partly evacuated capsule that expands and contracts with pressure, with its scale marked in height.",
  d="(b) A mercury barometer is a fixed, fragile laboratory instrument, not used in aircraft. (c) Alcohol is not used as a barometer liquid in aviation.",
  t="Altimeter = aneroid capsule. Mercury barometers are the station-level standard.")
R(2, 8, "(b) Low",
  e="A low brings cloud, rain and strong winds, yet the rain washes dust and haze out of the air, so visibility between showers can be good. A high gives fair weather but, with sinking air and light winds, haze and smoke are trapped under the inversion.",
  d="(a) High: fair weather and often poor visibility, the opposite pairing.",
  t="Low = bad weather, good visibility. High = fair weather, poor visibility.")
R(2, 9, "(a) Altimeter",
  e="The altimeter senses static pressure and converts it to height using the pressure–height relationship of the standard atmosphere.",
  d="(b) The ASI works from the difference between pitot and static pressure, not from height. (c) The VSI works from the rate of change of static pressure.",
  t="Altimeter: pressure to height. ASI: pitot minus static. VSI: rate of change of static.")
R(2, 11, "(a) Aircraft flying over warm air mass",
  e="Warm air is less dense, so pressure falls more slowly with height and a given pressure level lies higher. With 1013.2 hPa set, both aircraft are on the same pressure surface, but over warm air that surface is higher, so the aircraft over the warm air mass has the greater true altitude.",
  d="(b) Over cold air the pressure levels are squashed downwards, so the same indication means a lower true altitude.",
  t="Warm air: true altitude above indicated. Cold air: true altitude below indicated.")
R(2, 16, "(b) 985 hPa",
  e="Height difference 160 m ÷ 8 m per hPa = 20 hPa. QFE = QNH − 20 = 1005 − 20 = 985 hPa. The aerodrome is above sea level, so the pressure at the aerodrome is lower than QNH.",
  d="(c) 1005 hPa is the QNH itself; QFE equals QNH only at sea level. (d) 990 hPa would be correct for an elevation of 200 m. (a) 1010 hPa is above QNH, which cannot be right for an elevated aerodrome.",
  t="QFE = QNH − (elevation ÷ 8 m per hPa), using the 1 hPa = 8 m the question gives.")
R(2, 18, "(c) Subsidence",
  e="In a high-pressure area the air sinks, is compressed and warms, forming a warm layer above cooler air below: a subsidence inversion. It traps haze and smoke and is a key cause of poor visibility.",
  d="(a) 'Negative' is not a type of inversion. (b) A radiation inversion forms on clear nights by ground cooling, not by sinking air.",
  t="High pressure + sinking air = subsidence inversion = haze and low cloud under it.")
R(2, 19,
  q="Q39. Which of the following would cause true altitude to increase when the altimeter indicates a constant altitude? (a) Warm/Low (b) Cold/Low (c) Hot/High (d) Cool/Low",
  a="(c) Hot/High",
  e="True altitude is greater than indicated when the air is warmer than standard (the pressure levels are pushed up) and when you fly into higher pressure than the subscale setting (the altimeter under-reads). Hot and High together raise the true altitude.",
  d="Cold and Low both work the other way and make the true altitude lower than indicated.",
  t="Hot/High: true above indicated. Cold/Low: true below indicated, the dangerous direction over high ground.")

# ---------------------------------------------------------------- met-3  Temperature
R(3, 1, "(a) calm",
  e="The diurnal range is largest with clear skies and calm or very light winds: the ground heats strongly by day and radiates freely at night, and there is no mixing to even out the temperature.",
  d="(c) A strong wind mixes the air and reduces the range. (b) Even a light wind begins to blur the extremes; the largest range is in clear, calm conditions.",
  t="Biggest daily swing: clear sky + calm. Cloud or wind shrinks it.")
R(3, 5, "(a) Lower",
  e="By day the ground heats faster than the air above it, so the air (screen) temperature is lower than the ground surface temperature. At night the ground cools faster and the air is the warmer of the two.",
  d="(b) Higher and (c) Same: the ground absorbs the sunshine first and passes heat up to the air, so it is hotter than the air by day.",
  t="Day: ground warmer than the air. Night: ground colder than the air.")
R(3, 7, "(a) Wind direction",
  e="At a coastal station the daily temperature range depends mainly on the wind direction: with a wind off the sea the range is small, with a wind off the land it can be large.",
  d="(b) Wind speed and (c) radiation matter everywhere, but at the coast it is the direction, sea or land, that decides the range.",
  t="Coast: sea wind = small range, land wind = large range.")
R(3, 12, "(a) Lower",
  e="The specific heat of land (about 0.2) is much lower than that of water (about 1.0), so land heats up and cools down much faster than water.",
  d="(b) Same and (c) Higher are wrong: if land had the higher specific heat it would warm more slowly than the sea, the opposite of what we see.",
  t="Low specific heat = heats and cools quickly (land). High specific heat = slow (sea).")
R(3, 16, "(b) shorter",
  e="By Wien's law the wavelength of the most intense radiation is inversely proportional to the absolute temperature: the hotter the body, the shorter the wavelength. The Sun (about 6000 °C) emits short waves; the Earth emits long waves.",
  d="(a) Longer is the opposite: it describes cooler bodies.",
  t="Hot = short wave. Cool = long wave.")
R(3, 19,
  q="Q39. If temperature does not change in a layer with height, it indicates: (a) Isothermal layer (b) Inversion (c) Instability (d) Uniform lapse rate",
  a="(a) Isothermal layer",
  e="An isothermal layer is one in which the temperature is constant with height. If temperature falls with height it is a lapse; if it rises with height it is an inversion.",
  d="(b) An inversion has temperature increasing with height. (c) Instability is about how a rising parcel behaves, not a constant temperature. (d) A uniform lapse rate means the temperature falls steadily.",
  t="Constant = isothermal. Falling = lapse. Rising = inversion.")
R(3, 20, "(b) Latent Heat",
  e="Latent heat (evaporation, condensation, sublimation) carries about 77% of the heat that flows from the Earth's surface to the atmosphere; sensible heat carries about 23%.",
  d="(a) Sensible heat is only about 23% of the total.",
  t="Latent 77%, sensible 23%.")
R(3, 21, "(a) True",
  e="The Celsius and Fahrenheit scales cross at −40: F = (9/5)(−40) + 32 = −40. So −40 °C = −40 °F.",
  d="(b) False would be correct only if the scales never met; they meet at −40.",
  t="−40 is the one temperature that is the same in both scales.")
R(3, 25, "(d) 293K",
  e="C = 5/9 × (68 − 32) = 5/9 × 36 = 20 °C. K = 20 + 273 = 293 K.",
  d="(b) 294 K and (c) 283 K do not follow from 20 °C; (a) 233 K is −40 °C.",
  t="K = °C + 273 (273.15 exactly). Convert °F to °C first.")

# ---------------------------------------------------------------- met-4  Density
R(4, 9, "(b) lowers",
  e="At constant temperature a higher pressure means denser air (ρ = P/RT). Denser air corresponds to a lower altitude in the standard atmosphere, so the density altitude lowers.",
  d="(a) Increases would need the air to become thinner. (c) Density altitude changes whenever density changes.",
  t="More density = lower density altitude. Less density (hot, high, humid) = higher density altitude = worse performance.")

# ---------------------------------------------------------------- met-5  Humidity
R(5, 4, "(a) More",
  e="A wet runway gives poorer braking action, and standing water adds aquaplaning risk, so both take-off and landing distances increase. This outweighs the small gain from cooler, denser air.",
  d="(b) Less and (c) Same ignore the effect of the wet surface.",
  t="Wet runway = longer distances. Treat a rainy day as a performance penalty.")
R(5, 8, "(c) Absolute Humidity",
  e="Absolute humidity is the actual mass of water vapour in a given volume of air, in g/m³.",
  d="(a) Relative humidity is a ratio in per cent, not an amount. (b) Specific humidity is the mass of vapour per unit mass of moist air, in g/kg.",
  t="Absolute: g per m³. Specific/mixing ratio: g per kg. Relative: per cent.")
R(5, 9, "(b) remains constant",
  e="When unsaturated air is lifted adiabatically no water is added or removed, so the humidity mixing ratio stays constant. What changes is the relative humidity, which rises as the air cools, until it reaches 100% at the condensation level.",
  d="(a) Relative humidity is not what the question asks about. (c) The mixing ratio does not increase unless moisture is added.",
  t="Lifting unsaturated air: mixing ratio constant, relative humidity increases.")

# ---------------------------------------------------------------- met-6  Winds
R(6, 17, "(b) Strong and parallel to isobars",
  e="Closely packed isobars mean a steep pressure gradient, so the wind is strong, and on a surface chart the wind is drawn along the isobars. Strictly, friction turns the real surface wind about 30° over land and 10–15° over sea across the isobars towards low pressure.",
  d="(a) Light is wrong: a steep gradient gives a strong wind. (c) Across the isobars describes the friction effect in detail, but the usual exam answer is parallel.",
  t="Close isobars = strong wind. Above the friction layer the wind is parallel to the isobars.")
R(6, 25,
  q="Q25. The wind blows clockwise around a low in S-hemisphere (a) True (b) False",
  a="(a) True",
  e="In the southern hemisphere the Coriolis force acts to the left, so the winds blow clockwise around a low and anticlockwise around a high.",
  t="Low: anticlockwise in the North, clockwise in the South.")
R(6, 31, "(b) 23015kt",
  e="The thermal wind is the vector difference between the upper and lower winds (upper − lower). Lower 050/10 kt and upper 230/05 kt are in opposite directions, so subtract: 5 kt from 230 plus 10 kt from 230 gives 230/15 kt.",
  d="(a) 050/05 and (c) 050/15 have the direction reversed: the thermal wind blows with the colder air on its left in the Northern Hemisphere.",
  t="Draw it: thermal wind = upper minus lower. Opposite directions add their speeds.")
R(6, 34, "(a) Gust",
  e="A rise from 10 to 30 kt that quickly falls back to 15 kt is a gust: a short-lived increase of at least 10 kt above the mean speed, lasting under a minute.",
  d="(b) A squall lasts a minute or more at the higher speed. (c) A gale needs a sustained speed above 33 kt.",
  t="Gust = short, under a minute. Squall = a minute or more.")
R(6, 45, "(b) 24040kt",
  e="Thermal wind = upper − lower. Upper 240/25 kt; lower 060/15 kt blows from the opposite direction. Subtracting a wind from 060 is the same as adding the same speed from 240: 25 + 15 = 40 kt from 240.",
  d="(a) 160/10 and (c) 240/10 do not follow from the vector subtraction.",
  t="Opposite directions: speeds add when you subtract.")

# ---------------------------------------------------------------- met-7  Fog
R(7, 18, "(c) Warm Front",
  q="Q18. Frontal fog is more common with a: (a) Western Disturbance (b) Cyclone (c) Warm Front (d) Cold Front",
  e="Frontal fog forms at a warm front (or an occlusion): the rain falling from the warm air saturates the cold air near the ground and the cloud base lowers to the surface. The fog is mainly ahead of the front.",
  d="(a) A Western Disturbance brings fog mostly after its passage, as radiation fog. (b) A cyclone is a wider system. (d) The cold front is a narrow, fast-moving feature and rarely holds fog.",
  t="Frontal fog = ahead of a warm front, in the drizzle belt.")
R(7, 19,
  q="Q19. The favourable pressure system for formation of fog is: (a) Lows and Cols (b) High and Trough (c) Lows and Ridges (d) Highs and Cols",
  a="(d) Highs and Cols",
  e="In highs and cols the pressure gradient is slack, the wind is light, the air sinks and is stable, and skies are often clear: ideal for radiation fog.",
  d="(a), (b) and (c) include lows or troughs, where winds are stronger and the air is unstable or cloudy.",
  t="Fog loves light winds: Highs and Cols.")

# ---------------------------------------------------------------- met-10
R(10, 11, "(d) Any one of all these",
  e="A corona forms when light is diffracted by very small, uniform water droplets, whether they are in mist, in fog or in thin cloud such as altostratus.",
  d="(a), (b) and (c) are each only part of the answer: all of them can produce a corona.",
  t="Corona = diffraction by small water drops. Halo = refraction by ice crystals.")
R(10, 19, "(b) 42°",
  e="The small halo has a radius of about 22°; the large halo is the bigger ring at roughly 46°. Of the options offered, 42° is the nearest to that larger ring.",
  d="(a) 32° and (c) 22°: 22° is the small halo.",
  t="Small halo 22°. Large halo about 46°. Rainbow about 42°.")

# ---------------------------------------------------------------- met-11
R(11, 7,
  q="Q7. Very heavy precipitation as showers over a short period is called: (a) Flash floods (b) Cloud burst (c) Orographic Rain",
  a="(b) Cloud burst",
  e="A cloud burst is a very heavy shower of rain falling over a small area in a short time. A sudden rise in river level that follows is a flash flood.",
  d="(a) Flash floods are the result, not the rainfall itself. (c) Orographic rain is rain caused by air being forced up a mountain slope.",
  t="Cloud burst = the rain. Flash flood = what follows downstream.")
R(11, 17, "(b) Cloud seeding",
  e="Artificial rain-making is called cloud seeding: freezing nuclei such as silver iodide, or dry ice, are introduced into a cloud to start the Bergeron process.",
  d="(a) Simulation is not the term used. (c) Nucleation is the physical process the seeding agents encourage, not the name of the practice.",
  t="Cloud seeding agents: silver iodide, potassium chloride, dry ice.")

# ---------------------------------------------------------------- met-13  Thunderstorms
R(13, 11, "(b) 30 to 45 min",
  e="The mature stage of a heat (air-mass) thunderstorm lasts about 30 to 45 minutes. It is the most violent stage, with updraughts and downdraughts side by side.",
  d="(a) 2 hr and (c) 3–4 hr are far too long for a single cell.",
  t="Single-cell TS: life about 1–1.5 hours, mature stage 30–45 min.")
R(13, 16, "(b) Afternoons",
  e="Norwesters are heat-driven thunderstorms of the pre-monsoon hot weather and are most frequent in the afternoon and evening, when surface heating is at its peak.",
  d="(a) Mornings and (c) Nights: the surface is cool then and convection is weak.",
  t="Norwester = hot weather, afternoon/evening.")
R(13, 17, "(a) Chota-Nagpur hills",
  e="Norwesters originate over the Chota Nagpur plateau and move south-eastwards across Bengal and Bangladesh.",
  d="(b) The Deccan plateau and (c) the Khasi hills are not the usual starting region.",
  t="Chota Nagpur → West Bengal, Bihar, Orissa, Assam (Kalbaisakhi).")
R(13, 22, "(a) 30 to 200 mm",
  e="Weather radars used for precipitation work in the 3–20 cm band (30–200 mm), which is the range of X, C and S band radars. Longer wavelengths (400 mm and more) are not used for rain detection.",
  d="(b) and (c) are far too long to be reflected by raindrops.",
  t="Rain detection radars: roughly 3–10 cm wavelength.")
DROP(13, 23)
R(13, 24, "(c) 30 mm",
  e="An X-band radar works at a wavelength of about 3 cm (30 mm) and is used for storm detection.",
  d="(a) 10 mm and (b) 20 mm are shorter wavelengths (K band).",
  t="X = 3 cm, C = 5 cm, S = 10 cm.")
R(13, 30,
  q="Q30. Loud peals of thunder, frequent flashes of lightning, moderate or heavy showers accompanied by light hail, and a wind speed of 15–40 kt are characteristic of a TS of intensity: (a) Light TS (b) Moderate TS (c) Severe TS",
  a="(b) Moderate TS",
  e="Moderate TS: loud peals and frequent lightning, moderate or heavy showers, light hail, and maximum wind speed of 15–40 kt.",
  d="(a) A light TS has distant thunder and light showers. (c) A severe TS has almost continuous thunder and lightning, large hail and winds above 40 kt.",
  t="15–40 kt = Moderate. Above 40 kt = Severe.")
R(13, 32, "(a) in vertical",
  e="Severe TS cells are tilted in the vertical: vertical wind shear carries the top of the cloud away from its base, so the updraught leans downwind. The direction of the lean depends on the shear, not on a fixed compass direction.",
  d="(b) South and (c) North give a fixed direction, which the shear does not guarantee.",
  t="Severe TS = leaning, tilted updraught, long-lived.")
R(13, 33, "(c) In the temperature band between +10° and −10°C",
  e="Lightning is most likely within about 5000 ft of the freezing level, in the temperature band from +10 °C to −10 °C, where the electric charges separate most strongly.",
  d="(a) and (b) are not the most likely zone for a strike on an aircraft.",
  t="Lightning risk: +10 to −10 °C, around the freezing level.")
R(13, 34, "(b) Icing, microburst and WS",
  e="The mature thunderstorm cell contains supercooled water that gives icing, and its downdraughts produce microbursts and wind shear, along with turbulence and lightning.",
  d="(a) The anvil is a cloud feature, not a separate hazard in this list.",
  t="CB hazards: turbulence, lightning, icing, hail, microburst, wind shear.")

# ---------------------------------------------------------------- met-14  Fronts
R(14, 12, "(c) Extra-tropical cyclones",
  q="Q12. Fronts are associated with: (a) Tropical cyclones (b) Monsoon depressions (c) Extra-tropical cyclones",
  e="Fronts form between air masses of different temperature and humidity, which is the situation in extra-tropical (mid-latitude) cyclones. Tropical cyclones and monsoon depressions have no fronts.",
  d="(a) and (b) are non-frontal systems with a uniform warm, moist air mass.",
  t="Tropical = no fronts. Mid-latitude lows = fronts.")
R(14, 15, "(b) Warm and Moist",
  e="An air mass that originates over the sea in low latitudes is maritime tropical: warm from the low latitude and moist from the sea.",
  d="(a) Warm and Dry is a continental tropical air mass. (c) Cold and Moist is a polar maritime air mass.",
  t="Maritime = moist. Tropical = warm.")
R(14, 17, "(c) Winters",
  e="Western Disturbances are a winter feature. They arrive at 5–7 a month in winter and are almost absent in the monsoon months.",
  d="(a) Summer and (b) post-monsoon: far fewer WDs than in winter.",
  t="WD = winter (December–February).")
R(14, 20, "(a) Warm",
  e="The sequence Ci, Cs, As, Ns, St is the classic approach of a warm front: the cloud thickens and lowers steadily as the front nears.",
  d="(b) A cold front gives Cu and Cb with no gradual build-up. (c) An occlusion combines both.",
  t="Warm front: Ci → Cs → As → Ns → St, getting lower.")
R(14, 22, "(b) Ahead & During",
  e="Visibility is poor ahead of a warm front, in the drizzle, low stratus and frontal fog, and it stays poor while the front passes. It improves in the warm sector behind.",
  d="(a) Ahead alone leaves out the passage itself. (c) After passage visibility improves.",
  t="Warm front: poor visibility ahead and during.")
R(14, 23, "(c) After",
  e="Fog is expected after the passage of a cold front, when the cold air behind it is moist and the skies clear and winds ease.",
  d="(a) Ahead of the cold front the warm sector is windy and cloudy. (b) During the passage the rain and showers are heavy.",
  t="Cold front: weather during, fog possible after.")
R(14, 26, "(b) Warm",
  e="After a warm front passes, the rain and drizzle stop and the sky clears. After a cold front showers can continue behind the front from the cumulus and cumulonimbus.",
  d="(a) Cold: showers may continue behind the cold front. (c) Occluded: bad weather can persist.",
  t="Warm front: rain stops after passage. Cold front: showers may linger.")

# ---------------------------------------------------------------- met-15  Jet streams
R(15, 1, "(a) 60 kt",
  e="The WMO lower limit of jet core speed is 60 kt, which is 30 m/s. Anything slower is not classed as a jet stream.",
  d="(b) 60 m/s would be about 117 kt, far above the minimum. (c) 70 m/s is higher still.",
  t="Jet stream: at least 60 kt (30 m/s).")
R(15, 2, "(b) one or more maxima",
  e="The wind speed along a jet axis is not uniform: there are one or more maxima, called jet streaks.",
  d="(a) and (c) set a fixed number of maxima, which the jet does not have.",
  t="Jet streaks = the fast patches along the axis.")
R(15, 4,
  q="Q4. Compared to horizontal wind shear, the vertical wind shear in a jet stream is: (a) Weaker (b) Stronger (c) Same",
  a="(b) Stronger",
  e="Vertical shear in a jet stream is about 5–6 m/s per km. Horizontal shear is much smaller per km (about 100 kt per 100 NM, roughly 0.3 m/s per km), so the vertical shear is numerically much the stronger.",
  d="(a) Weaker and (c) Same: converting both to the same units shows the vertical shear is many times larger.",
  t="Jet: vertical shear about 5 m/s per km.")
R(15, 5,
  q="Q5. In a jet stream, the path of maximum speed is known as: (a) Core (b) Axis (c) Jet streak",
  a="(b) Axis",
  e="The line along which the speed is greatest is the jet axis. The tube of fast air surrounding it is the core.",
  d="(a) The core is the tubular volume around the axis. (c) A jet streak is a local maximum of speed along the axis.",
  t="Axis = the path. Core = the tube. Streak = a fast patch.")
R(15, 9,
  q="Q9. In a wavy jet the jet streaks are located over or near the: (a) Ridge (b) Trough (c) Between trough and ridge",
  a="(a) Ridge",
  e="In a wavy jet stream the jet streaks are located over or near the ridge.",
  d="(b) and (c) are not where the streaks are found.",
  t="Streaks sit at the ridges.")
R(15, 10,
  q="Q10. The normal position of the Sub-tropical Jet Stream is: (a) 30°N (b) 27°N (c) 35°N",
  a="(b) 27°N",
  e="Over India the mean position of the STJ is about 27°N at a height of 12 km. Its southern-most position is about 22°N in February.",
  d="(a) and (c) are not the mean position over India.",
  t="STJ: mean 27°N, southern-most 22°N in February, north of 35°N in summer.")
R(15, 21,
  q="Q21. A jet stream can be recognised by: (a) High level dust (b) High pressure (c) Streaks of Ci (d) Lenticular clouds",
  a="(c) Streaks of Ci",
  e="A jet stream shows up as long streaks and sheets of cirrus lined up along the axis, with a sharply defined edge on the warm side.",
  d="(a) Dust and (b) high pressure do not mark a jet. (d) Lenticular clouds mark mountain waves.",
  t="Jet: streaky Ci along the axis.")
R(15, 22,
  q="Q22. Flying at right angles to a jet stream with falling pressure, you will experience: (a) Wind from left (b) Increasing head wind (c) Increasing tail wind (d) Wind from right",
  a="(a) Wind from left",
  e="In the Northern Hemisphere, with your back to the wind low pressure is on your left. Flying towards falling pressure therefore means the wind comes from your left, giving starboard drift.",
  d="(d) Wind from the right is the case flying towards rising pressure. (b) and (c) apply when flying along the jet.",
  t="Towards low: wind from the left (North). Towards high: wind from the right.")
DROP(15, 24)
R(15, 25,
  q="Q25. When and where does the tropical jet stream occur? (a) All year along the equator (b) In the Middle East in summers (c) In winters over Russia (d) In summers over SE Asia and Central Africa",
  a="(d) In summers over SE Asia and Central Africa",
  e="The tropical (easterly) jet stream occurs in the summer monsoon months over Asia and Africa only, not over the Atlantic or the Pacific.",
  d="(a) It is seasonal, not all year. (b) and (c) are the wrong place and season.",
  t="TJ: June to August, Asia and Africa, easterly.")

# ---------------------------------------------------------------- met-18
R(18, 2, "(b) Extra-tropical depressions",
  q="Q2. Fronts are characteristic of: (a) Tropical cyclone (b) Extra-tropical depressions (c) Monsoon depressions",
  e="Fronts are a feature of extra-tropical (mid-latitude) depressions. Tropical cyclones and monsoon depressions form in a uniform warm, moist air mass and have no fronts.",
  d="(a) and (c) are non-frontal.",
  t="Tropical = no front.")
R(18, 3, "(c) calm wind, little clouding and practically no rainfall",
  e="The eye of a mature tropical cyclone has calm or light winds, little cloud and almost no rain. The worst weather is in the eye wall surrounding it.",
  d="(a) and (b) describe the eye wall and the rain bands, not the eye.",
  t="Eye = calm. Eye wall = violent.")
R(18, 4,
  q="Q4. Cyclonic storms cross the Tamil Nadu coast during: (a) Oct–Nov (b) Jul–Aug (c) Feb–May",
  a="(a) Oct–Nov",
  e="Tamil Nadu is hit by post-monsoon cyclones from the Bay of Bengal, mainly in October and November.",
  d="(b) Jul–Aug is the monsoon, when depressions rather than cyclones form. (c) Feb–May is a quiet period for cyclones on this coast.",
  t="Tamil Nadu cyclones: October–November (north-east monsoon).")

# ---------------------------------------------------------------- met-19
R(19, 4,
  q="Q4. During the summer season: (a) WDs cause TS/DS over Punjab & Rajasthan (b) No WD affects the northern parts of the country (c) The track of WD is southern most",
  a="(a) WDs cause TS/DS over Punjab & Rajasthan",
  e="In summer the Western Disturbances are fewer and track farther north, but they can still cause thunderstorms and dust storms over Punjab and Rajasthan.",
  d="(b) WDs do still affect the north in summer. (c) In summer the track moves north, not south.",
  t="Summer WD: weaker, further north, may trigger TS/DS over Punjab and Rajasthan.")
R(19, 7,
  q="Q7. The monsoon advances with: (a) Bay of Bengal current only (b) Arabian Sea current only (c) Bay of Bengal and Arabian Sea currents",
  a="(c) Bay of Bengal and Arabian Sea currents",
  e="The south-west monsoon advances in two branches: the Arabian Sea branch up the west coast and the Bay of Bengal branch towards Bengal and the north-east.",
  d="(a) and (b) each name only one branch.",
  t="Two branches: Arabian Sea and Bay of Bengal.")

# ---------------------------------------------------------------- met-20
R(20, 12,
  q="Q14. Rising air creates calms or doldrums in the equatorial region, called: (a) ITCZ (b) Horse Latitudes (c) Equatorial Doldrums",
  a="(c) Equatorial Doldrums",
  e="Near the equator the air rises and the surface winds are light or calm. These calms are the doldrums.",
  d="(a) The ITCZ is the convergence zone itself. (b) The Horse Latitudes are the calms at about 30° where air sinks.",
  t="Doldrums = equator, rising air. Horse latitudes = 30°, sinking air.")
R(20, 13,
  q="Q15. Steady NE winds in the Northern Hemisphere and SE winds in the Southern Hemisphere are called: (a) Easterly winds (b) Trade Winds (c) Tropical Winds",
  a="(b) Trade Winds",
  e="The steady surface winds blowing from the sub-tropical highs towards the equator are the Trade Winds: north-easterly in the north and south-easterly in the south.",
  d="(a) 'Easterly winds' is a general term. (c) 'Tropical Winds' is not a technical name.",
  t="NE Trades in the north, SE Trades in the south.")

# ---------------------------------------------------------------- met-21
R(21, 1, "(a) 3 hr",
  q="Q1. For non-scheduled National Flights, advance notice (before ETD) is required to be given to AMOs: (a) 3 hr (b) 18–24 hr (c) 6 hr",
  e="For non-scheduled national flights the notice to an Aerodrome Met Office is 3 hours before departure; an Aeronautical Met Station needs 18–24 hours.",
  d="(b) is the notice for an AMS. (c) 6 hr is not the AMO requirement.",
  t="AMO: 3 hr. AMS: 18–24 hr.")
R(21, 3, "(a) high-quality en-route forecasts of winds and temperature",
  q="Q3. The World Area Forecast System (WAFS) provides the Met Offices with: (a) High-quality en-route forecasts of winds and temperature (b) SIGMET (c) TREND",
  e="WAFS supplies global forecasts of upper winds and temperature, and significant weather charts, to Met Offices.",
  d="(b) SIGMET is issued by Met Watch Offices. (c) TREND is a landing forecast appended to a METAR.",
  t="WAFS: upper winds, temperature and SIGWX charts.")
R(21, 4, "(c) 6",
  e="IMD has six Regional Met Offices: Delhi, Mumbai, Kolkata, Chennai, Guwahati and Nagpur.",
  d="(a) 4 and (b) 5 are too few.",
  t="6 Regional Met Offices.")
R(21, 5, "(b) 18",
  e="There are 18 Aerodrome Met Offices (AMOs).",
  d="(a) 17 and (c) 19 are not the number.",
  t="18 AMOs, 54 Aeronautical Met Stations.")
R(21, 6, "(b) 54",
  e="There are 54 Aeronautical Met Stations (AMS).",
  d="(a) 56 and (c) 52 are not the number.",
  t="54 Aeronautical Met Stations.")
R(21, 10,
  q="Q10. The Landing Forecast (TREND) is appended to: (a) METAR and SPECI (b) TAF (c) AIREP",
  a="(a) METAR and SPECI",
  e="The landing forecast, called TREND, is appended to a METAR or SPECI and is valid for two hours after the time of the report.",
  d="(b) A TAF is a separate aerodrome forecast. (c) An AIREP is an aircraft report.",
  t="TREND = METAR/SPECI + 2 hours.")
R(21, 20, "(a) low level flights",
  q="Q24. GAMET is an area forecast in abbreviated plain language for: (a) low level flights (b) high level flights (c) all level flights",
  e="GAMET is an area forecast in abbreviated plain language for low-level flights in a FIR or sub-area, up to FL100.",
  d="(b) and (c): high-level flights are served by SIGWX charts and SIGMET.",
  t="GAMET = low-level area forecast.")

# ---------------------------------------------------------------- met-28
R(28, 10, "(a) 600, 1500 and 3000 m",
  q="Question 10 For National Flights the winds and temperatures are provided for LL Flights for altitudes: (a) 600, 1500 and 3000 m (b) 3000 ft, 5000 ft, 10,000 ft (c) 600, 1000 and 500 m",
  e="The levels are 600, 1500 and 3000 m, equivalent to 2000, 5000 and 10,000 ft.",
  d="(b) 3000 ft is not one of the levels. (c) has the wrong middle and lower values.",
  t="600 / 1500 / 3000 m = 2000 / 5000 / 10,000 ft.")

# ---------------------------------------------------------------- met-24  Station model
STN = ('<div style="text-align:center;margin:18px 0;page-break-inside:avoid;">'
       '<img src="/content/meteorology/met-24/img/{fig}" style="max-width:360px;width:100%;height:auto;'
       'display:block;margin:0 auto;" alt="Worked station model plot used by the questions below: wind staff '
       'from the north-west with barbs, temperature 34, visibility code 95, dew point 30, pressure 962, change 14, '
       'total cloud circle, low-cloud group 3/2, ship arrow to the north-east with speed 5."><div style="font-size:'
       '0.9em;color:#555;margin-top:6px;">Figure 24.A Station model for Questions 1–20</div></div>')
q24 = lambda n: byl[(24, n)]
BEFORE(24, q24(1), STN)
R(24, q24(2), "(c) 18–22 kt",
  e="The staff carries barbs that add up to 20 kt. A plotted wind speed is read as a band of about ±2 kt, so the speed lies in 18–22 kt.",
  d="(a) 20–25 kt and (b) 16–22 kt are not centred on the plotted 20 kt.",
  t="Count the barbs, then give the band around that speed.")
R(24, q24(3), "(a) AC",
  e="The curved symbol above the circle is the altocumulus symbol for the medium cloud (CM) group.",
  d="(b) AS and (c) AC & AS have different symbols in the CM table.",
  t="Read the symbol, then find it in the CM table.")
R(24, q24(4), "(c) ST",
  e="The dashed line under the circle is the stratus (ST) symbol for the low cloud (CL) group.",
  d="(a) CU and (b) SC have their own symbols (a dome and a bar with scallops).",
  t="Dashed line = stratus.")
R(24, q24(8), "(a) 29.5 to 30.4°C",
  e="The dew point is plotted as 30. A plotted whole degree stands for the range from half a degree below to just under half a degree above: 29.5 to 30.4 °C.",
  d="(b) 29.1 to 30.4 and (c) 30.6 to 30.4 are not valid rounding ranges.",
  t="A reported whole degree covers −0.5 to +0.4.")
R(24, q24(14), "(c) 1.6 to 2.4 mm",
  e="The rainfall is plotted as 2 mm, which stands for the band 1.6 to 2.4 mm.",
  d="(a) a single value of 2 mm and (b) 1.5 mm are not the reported band.",
  t="Plotted values stand for a band, not an exact figure.")
R(24, q24(17), "(c) NE",
  e="The arrow shows the direction in which the ship is moving, drawn towards the north-east.",
  d="(a) NW and (b) SW do not match the arrow.",
  t="The ship arrow points where the ship is going; the wind staff points where the wind comes from.")
R(24, q24(18), "(a) 3 hr",
  e="The ship's speed is the average over the last 3 hours.",
  d="(b) 6 hr and (c) 12 hr are not the averaging period.",
  t="Ship speed: 3-hour average.")
R(24, q24(19), "(c) 2000 to <4000 m",
  e="The visibility code 95 stands for 2000 m to under 4000 m (code 94 is 1000–2000 m, 96 is 4000–10,000 m).",
  d="(a) and (b) belong to codes 93 and 94.",
  t="VV: 90 <50 m · 91 50–200 · 92 200–500 · 93 500–1000 · 94 1–2 km · 95 2–4 km · 96 4–10 km.")
R(24, q24(7), "(c) 3/8",
  e="The group under the circle reads 3/2: 3 is the amount of the lowest cloud in eighths (3/8) and 2 is its height code.",
  d="(a) 2/8 uses the height code as the amount. (b) 4/8 is not plotted.",
  t="Nh/h: amount first, then height code.")

# ---------------------------------------------------------------- met-25  METAR set
METAR = BOX.format(title="Use this METAR / TREND for Questions 1–22",
                   body="METAR VIDP 160230Z 30005KT 290V050 1500S 5000N R15/P1500U BR FEW020 FEW025CB SCT120 BKN300 32/29 Q1003 REFG<br>TEMPO FM0330 22015G25KT 3000 +TSRA FEW010 SCT025CB BKN150 BECMG AT0415 27008KT CAVOK=")
BEFORE(25, byl[(25, 1)], METAR)
R(25, byl[(25, 13)], "(c) 2500 ft",
  e="FEW025CB: the cloud base is 025 × 100 = 2,500 ft above the aerodrome.",
  d="(a) 2500 m confuses feet with metres. (b) 3000 ft does not match the group.",
  t="Cloud heights in METAR and TAF are in hundreds of feet.")
DROP(25, byl[(25, 3)])
R(25, byl[(25, 28)], "(c) M12",
  e="−12.5 °C is rounded to the next higher value, −12 °C, and a negative temperature carries the prefix M: M12.",
  d="(a) −12 is the value without the M prefix. (b) −13 rounds the wrong way.",
  t="Round .5 upwards (towards zero for negatives), and use M for minus.")
R(25, byl[(25, 38)], "(a) Any one condition",
  e="Each cloud criterion for a SPECI is a trigger on its own: any one of them is enough.",
  d="(b) and (c) wrongly require two or all of the conditions to occur together.",
  t="SPECI criteria are alternatives: any one triggers a report.")
R(25, byl[(25, 17)],
  q="Q17. Expected visibility after 0415 UTC is: (a) 6000 m (b) 3000 m (c) 10 km or more",
  a="(c) 10 km or more",
  e="After BECMG AT0415 the trend gives CAVOK, which means visibility of 10 km or more, no significant cloud and no significant weather.",
  d="(a) 6000 m and (b) 3000 m are not forecast by the trend.",
  t="CAVOK = 10 km or more + no significant cloud + no significant weather.")
DROP(25, byl[(25, 19)])

# ---------------------------------------------------------------- met-26  TAF / ROFOR sets
TAF = BOX.format(title="Use this TAF for Questions 1–16",
                 body="TAF VILK 241800Z 2500/2509 09008KT 0800 FG BECMG 2504/2505 09015KT 6000 SCT008 BKN120<br>TEMPO 2506/2508 12015G30KT 3000 TSRA FEW012 FEW025CB BKN100 BECMG AT 25/0800 09010KT 7000 FEW030 SCT120 BKN280=")
ROFOR = BOX.format(title="Use this ROFOR for the ROFOR Questions",
                   body="ROFOR 010000Z 010610 KT VECC VILK 2SC030 2CB030 3AC100 2CI300 7///170<br>621800 541501<br>405022 28015 407010 28020 410005 29030 420M05 27045 440M41 27105<br>11111 12870 380120<br>22222 36140 2825=")
BEFORE(26, byl[(26, 1)], TAF)
R(26, byl[(26, 2)],
  q="Q2. The TAF has been issued at: (a) 2330 IST (b) 1830 UTC (c) 24 UTC",
  a="(a) 2330 IST",
  e="The issue time is 1800 UTC (241800Z). IST is UTC + 5 h 30 min, so 1800 UTC = 2330 IST.",
  d="(b) 1830 UTC misreads the group. (c) 24 UTC is the day, not a time.",
  t="Z = UTC. IST = UTC + 5:30.")
R(26, byl[(26, 3)], "(c) 08 kt",
  e="The initial forecast wind is 09008KT: 090° at 8 kt.",
  d="(a) 9 kt takes the direction digits for the speed. (b) 6 kt is not in the forecast.",
  t="dddff: direction first, speed second.")
R(26, byl[(26, 7)], "(c) 0800 ft",
  e="SCT008 is the lowest cloud: 008 × 100 = 800 ft.",
  d="(a) 1000 m and (b) 1000 ft do not match any cloud group.",
  t="Cloud heights are in hundreds of feet.")
R(26, byl[(26, 8)], "(a) 0600 UTC",
  e="The TEMPO group 2506/2508 forecasts TSRA from 0600 UTC on the 25th (to 0800 UTC).",
  d="(c) 0800 UTC is when the TEMPO period ends and the BECMG AT 0800 begins. (b) is in IST.",
  t="In TEMPO 2506/2508 the first time is when the weather starts.")
R(26, byl[(26, 9)], "(c) 120°",
  e="The gusty wind is in the TEMPO group: 12015G30KT, from 120° at 15 kt gusting 30 kt.",
  d="(a) 090° is the wind in the other groups. (b) 100° is not forecast.",
  t="dddffGfmfm: direction, mean speed, gust.")
R(26, byl[(26, 11)], "(b) 3–4/8",
  e="SCT008 is the lowest layer: SCT means 3–4 oktas.",
  d="(a) FEW is 1–2/8. (c) BKN is 5–7/8.",
  t="FEW 1–2 · SCT 3–4 · BKN 5–7 · OVC 8.")
R(26, byl[(26, 14)], "(c) 28000 ft",
  e="BKN280 is the highest layer in the forecast: 280 × 100 = 28,000 ft.",
  d="(a) 2800 m and (b) 28000 m use metres, but TAF heights are in feet.",
  t="BKN280 = broken at 28,000 ft.")
BEFORE(26, 18, ROFOR)
R(26, 26, "(b) 18,000 ft",
  q="Q9. Height at which Icing is expected: (a) 21,000 ft (b) 18,000 ft (c) 15,000 ft",
  e="The icing group 621800 gives the base of the icing layer: 18 = 18,000 ft.",
  d="(a) 21,000 ft and (c) 15,000 ft are not in the group (541501 is the turbulence group, at 15,000 ft).",
  t="6 L hh t t: icing type, base in thousands of feet, thickness.")
R(26, 29, "(b) 300 m",
  e="The turbulence group 541501 ends in thickness code 1, which stands for 300 m.",
  d="(a) 2000 ft and (c) up to top of cloud: code 0 would mean to the cloud top.",
  t="Thickness code 1 = 300 m (1000 ft).")
R(26, 30, "(b) 280/15 kt",
  e="The group 405022 28015 gives, at 5000 ft: temperature 22 °C and wind 280° at 15 kt.",
  d="(a) 280/10 and (c) 280/20 belong to other heights.",
  t="4 hh TT then dd fff: height, temperature, wind.")
R(26, 38, "(b) 36,000 ft",
  e="The maximum-wind group 22222 36140 2825 places the maximum wind at 36,000 ft, at 140 kt, from 280°, with a wind shear of 25 kt per 300 m.",
  d="(a) 40,000 ft and (c) 38,000 ft: 38 belongs to the jet stream group.",
  t="22222 hh fff, then direction and shear.")
R(26, 39, "(c) 28N70E",
  e="The jet stream group 11111 12870 380120 gives quadrant 1, latitude 28, longitude 70: 28°N 70°E, at 38,000 ft and 120 kt.",
  d="(a) 27N70E and (b) 28N75E do not match the digits 12870.",
  t="11111 Q lat lon, then height and speed.")
R(26, 40, "(a) 25 kt",
  e="In 22222 36140 2825 the last two digits give the vertical wind shear per 300 m: 25 kt.",
  d="(b) 30 kt and (c) 38 kt are not in the group.",
  t="2825: direction 280°, shear 25 kt per 300 m.")
R(26, 41, "(b) 120 kt",
  e="In the jet stream group 11111 12870 380120 the speed of the core is 120 kt, at 38,000 ft.",
  d="(a) 125 kt and (c) 140 kt (the maximum wind) do not match.",
  t="Jet core speed 120 kt; maximum wind 140 kt.")
R(26, 42, "(c) 38,000 ft",
  e="The jet stream group 11111 12870 380120 places the jet core at 38,000 ft.",
  d="(a) 40,000 ft and (b) 36,000 ft (the maximum wind level) do not match.",
  t="Jet at 38,000 ft; maximum wind at 36,000 ft.")

json.dump(F, sys.stdout, ensure_ascii=False, indent=1)
