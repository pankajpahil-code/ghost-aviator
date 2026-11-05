import type { VideoStudyMap } from "./types";

// Chapter summaries written from the site's own notes for each chapter.
// Shown on the matching /cpl/<subject>/<chapter>/video page.
export const AIR_NAVIGATION: VideoStudyMap = {
  "nav-6": {
    summary: [
      "Every flight has to answer two loading questions: is the aeroplane too heavy, and is its centre of gravity inside limits? This chapter works through both. It starts with the mass ladder from basic empty mass up to ramp mass. Dry operating mass plus traffic load gives zero fuel mass. Adding take-off fuel gives take-off mass, and taxi fuel brings it to ramp mass. Landing mass is take-off mass minus the trip fuel actually burnt. Each step is a definition the paper tests directly.",
      "Balance is the arithmetic of datum, arm and moment. Moment equals mass times arm, and CG equals total moment divided by total mass. On a light aeroplane the CG is quoted as an arm aft of the datum. On a transport aeroplane it is quoted as a percentage of the mean aerodynamic chord, measured from LEMAC. Loadsheet indices are just scaled-down moments. The notes also cover the unit conversions behind most mistakes, especially turning fuel volume into mass with specific gravity or density.",
      "The last section explains why the limits exist. A forward CG makes the aeroplane stable but heavy in pitch. It raises the stalling speed and drag and, at worst, can leave too little elevator for the flare. An aft CG lowers drag and stalling speed but erodes stability and can make stall and spin recovery difficult or impossible. That is why the aft limit sits well forward of the neutral point.",
    ],
    keyPoints: [
      "ZFM = DOM + traffic load. TOM = ZFM + take-off fuel. Ramp mass = TOM + taxi fuel. Landing mass = TOM − trip fuel.",
      "Traffic load (ZFM − DOM) is passengers, baggage and freight only. Useful load (TOM − DOM) is traffic load plus usable fuel.",
      "Moment = mass × arm, and CG = total moment ÷ total mass.",
      "%MAC = (CG arm − LEMAC arm) ÷ MAC length × 100. For example, CG at 530 in, LEMAC at 500 in and MAC 120 in gives 25% MAC.",
      "Specific gravity 0.79 means 0.79 kg per litre. A density of 780 kg/m³ is 0.78 kg/l.",
      "Conversions: 1 US gallon = 3.785 l, 1 imperial gallon = 4.546 l, 1 lb = 0.454 kg.",
      "A forward CG raises stalling speed, drag and fuel burn, and can leave too little elevator authority at the flare.",
      "An aft CG lowers stalling speed and drag but reduces stability. A grossly aft CG can make a spin flat and unrecoverable.",
    ],
    traps: [
      "3,800 US gal at SG 0.79 is 14,383 litres, which is 11,364 kg. The litre figure always appears among the options to catch anyone who stops one step early.",
      "When asked for useful load, don't give the traffic load. That leaves out the whole fuel load.",
      "An aft CG's lower stalling speed and better range sound like advantages, but the exam treats aft-of-limit loading as the dangerous case for stall and spin recovery.",
      "An unexpectedly rapid rotation on take-off for a normal control input is a classic clue to an aft CG.",
    ],
  },
  "nav-13": {
    summary: [
      "Navigation starts with describing where you are and which way you are pointing, and this opening chapter sets up that language. The Earth is an oblate spheroid, flattened by about 0.3%, with a polar diameter roughly 23 NM shorter than the equatorial one. Because its true shape is irregular, the accurate term is a geoid. Different national geoids can place the same point up to about 200 m apart, which is why ICAO mandated WGS 84 as the world standard. For DGCA calculations, though, the Earth is treated as a sphere with a circumference of 21,600 NM.",
      "Direction is measured clockwise from north in three-figure groups, and the leading zero is never dropped. A reciprocal is found by adding or subtracting 180°. The chapter explains the Earth's rotation: anticlockwise seen from above the North Pole and clockwise from above the South Pole, so east is always the direction of rotation. It also covers great circles and small circles, the Equator, meridians, the Prime Meridian, the 180° anti-meridian and parallels of latitude.",
      "Latitude and longitude are then defined properly, including the difference between geocentric and geodetic latitude on a spheroid. The nautical mile is tied to arc: one minute of latitude is 1 NM anywhere, but one minute of longitude is 1 NM only at the Equator. Finer positions use decimal minutes, as on INS and FMS entry, or degrees, minutes and seconds.",
    ],
    keyPoints: [
      "ICAO uses WGS 84. For the exam, treat the Earth as a sphere with a circumference of 21,600 NM, or 40,000 km.",
      "The Earth's flattening is about 0.3%, and the polar diameter is about 23 NM shorter than the equatorial.",
      "Seen from above the North Pole the Earth rotates anticlockwise. Seen from above the South Pole it rotates clockwise.",
      "Always write directions as three figures (027°, not 27°). Reciprocal = direction ± 180°.",
      "Only one great circle joins two points that are not antipodal. Every meridian crosses the Equator at 90°.",
      "1 NM = 1,852 m (ICAO). One minute of latitude = 1 NM everywhere, while one minute of longitude = 1 NM only at the Equator.",
      "Geodetic latitude uses the normal to the spheroid surface. Geocentric latitude uses the line to the Earth's centre.",
      "A decimal minute (0.1′) is about 600 ft. One second of arc is about 100 ft (30 m).",
    ],
    traps: [
      "‘The Earth rotates clockwise’ is true only when viewed from above the South Pole. Read the viewpoint in the question.",
      "Runway designators are rounded to the nearest 10° and normally refer to magnetic north. Don't apply the three-figure true-direction rule to them.",
      "Don't assume a minute of longitude is a nautical mile. It shrinks with latitude, and the d-long to distance conversion depends on it.",
      "Mixed geoids can put positions about 200 m apart, so a GPS position in WGS 84 may not match a chart drawn on an older local datum.",
    ],
  },
  "nav-14": {
    summary: [
      "Two kinds of line join any two places on the globe, and much of the navigation paper depends on telling them apart. A great circle is the shortest route between two points, but its direction changes continuously along the way. A rhumb line cuts every meridian at the same angle, so it can be flown on a constant heading, but it is longer. This chapter sets out the properties of each, where they lie relative to each other, and which special lines are both at once.",
      "The DIID rule captures how a great circle track changes direction. A great circle always curves towards the nearer pole, so in the northern hemisphere its track angle increases when flying east and decreases when flying west. In the southern hemisphere it is the reverse. The chapter then works through meridian, anti-meridian and over-the-pole cases. A typical one: from 72°N 002°30′E to 72°N 177°30′W, the shortest route starts on 360°(T) and comes down the other side on 180°(T) after the pole.",
      "The second half deals with distance. It defines the nautical mile as the great-circle arc subtending one minute at the centre of curvature, and explains why its length varies with latitude on an oblate Earth. The chapter also gives the conversion factors and the mean-latitude method used later for departure.",
    ],
    keyPoints: [
      "A great circle is the shortest distance between two points. A rhumb line has constant direction, crossing all meridians at the same angle.",
      "The Equator and any meridian with its anti-meridian are both great circles and rhumb lines. A meridian is a rhumb line at 0° or 180°.",
      "In either hemisphere the rhumb line lies nearer the Equator than the great circle, because the great circle bows towards the pole.",
      "DIID: northern hemisphere, the great circle track angle increases going east and decreases going west. Southern hemisphere, the opposite.",
      "Two points on a meridian and its anti-meridian: the shortest route goes over the pole, so the track is 360° then 180° (or the reverse).",
      "The NM is about 6,048 ft at the Equator and about 6,108 ft at the poles. The international NM is 1,852 m (6,076.1 ft).",
      "Mean latitude for points in the same hemisphere is the simple average. Across the Equator, halve the sum and subtract it from the higher latitude.",
    ],
    traps: [
      "‘A line of constant direction’ describes a rhumb line, not the shortest route. Options that call it the shortest distance are wrong.",
      "A rhumb line CAN be a great circle track (meridians and the Equator), so ‘could never be a great circle’ is a distractor.",
      "Over-the-pole routes between points at the same latitude on a meridian and anti-meridian don't fly east or west. The initial track is due north (in the northern hemisphere).",
      "The NM is shortest at the Equator, where curvature is greatest, not at the poles.",
    ],
  },
  "nav-15": {
    summary: [
      "A magnetic compass points to magnetic north, not true north, and inside an aircraft it doesn't even point there exactly. This chapter explains the two corrections that link what the compass reads to what the chart shows. Variation is the angle between true and magnetic north at a place. Charts show it with isogonals, and the agonic line marks zero variation. Deviation is the error caused by the aircraft's own magnetism, measured between magnetic north and compass north.",
      "The chapter also covers the field itself. The total magnetic force splits into a horizontal component H, which directs the compass, and a vertical component Z, which causes dip. At the magnetic equator the field is horizontal, so dip is zero and H is at its maximum. Towards the magnetic poles dip increases and H weakens. Below about 6 µT, H can no longer be relied on to drive a magnetic compass. Variation also changes over time: daily, in magnetic storms, and slowly as the poles move, which is why isogonals on charts are updated.",
      "The practical part is the conversion chain C, D, M, V, T: apply deviation to the compass heading to get magnetic, then variation to get true. The memory lines ‘variation west, magnetic best’ and ‘variation east, magnetic least’ tell you which way each correction goes.",
    ],
    keyPoints: [
      "Variation is the angle between true north and magnetic north. Deviation is the angle between magnetic north and compass north.",
      "Isogonals join places of equal variation, and the agonic line joins places of zero variation. Isoclinals join places of equal dip, and the aclinic line (the magnetic equator) has zero dip.",
      "Isogonals converge at both the magnetic poles and the geographic poles.",
      "At the magnetic equator Z = 0 and H = T, its maximum. Dip at a UK mid-latitude location is about 66°.",
      "Below H ≈ 6 µT a magnetic compass is unreliable.",
      "Variation west, magnetic best (magnetic > true). Variation east, magnetic least. Deviation west, compass best (compass > magnetic).",
      "Daily change in variation is up to about 0.1°. A magnetic storm can change it by up to about 7°.",
    ],
    traps: [
      "Isogonals converge at the geographic poles as well as the magnetic poles. ‘Magnetic poles only’ is the tempting wrong answer.",
      "Variation may increase or decrease over time at a given place. It is not always one or the other.",
      "Pendulous suspension does not remove dip entirely. About 2° remains, and that leftover dip causes the turning and acceleration errors.",
      "With easterly deviation the compass reads LESS than magnetic (C < M). Get the sign wrong and the true heading is off by twice the deviation.",
    ],
  },
  "nav-9": {
    summary: [
      "This is where the separate computer skills come together into a working flight plan. A flight plan row is five conversions in a chain. Calibrated airspeed and temperature give true airspeed. Track and wind give heading and ground speed. True heading becomes magnetic, magnetic becomes compass, and distance and ground speed become time. The chapter's core discipline is to work across each row, leg by leg, and never down a column.",
      "The only new arithmetic is applying variation and deviation, and the notes treat it as a sign trap rather than a sum. ‘Variation west, magnetic best’ adds westerly variation. The worked leg shows it: 095°(T) with 5°W gives 100°(M), and 1°W deviation gives 101°(C). The danger is the CX-3's sign convention, where + means west, while the exercise tables use + for east. Type a signed number straight across and the error is twice the variation, 68° on a 34° variation row. The safe habit is to say ‘five west’ aloud, decide whether the heading gets bigger or smaller, and only then press a key.",
      "The second half covers wind finding in flight. Measuring the actual wind at your level over the last twenty minutes gives a more recent and more local value than the forecast, and it improves every remaining leg. The notes also show why a light wind found at high speed has a poorly determined direction.",
    ],
    keyPoints: [
      "A flight plan row runs CAS → TAS, track → heading and GS, true → magnetic → compass, then distance → time. Work across the row.",
      "Variation west, magnetic best. Variation east, magnetic least. Deviation follows the same rule one step further on.",
      "Worked leg: 095°(T), 5°W variation → 100°(M). 1°W deviation → 101°(C).",
      "On the CX-3, + means WEST variation (Magnetic = True + Var). The exercise tables in this chapter use + for east.",
      "A leftover 3° of deviation means 3° of track error for the whole leg.",
      "Wind finding uses FLT → Wind Correction. Heading and ground speed come from the PLAN menu.",
      "The wind is the vector from the tip of the air vector to the tip of the ground vector. Reverse the order and you get the exact reciprocal.",
      "With a light wind and a fast aeroplane, a 1° track error can shift the computed wind direction by up to about TAS ÷ wind speed degrees.",
    ],
    traps: [
      "Copying the book's signed variation straight into the CX-3 doesn't give a small error. It doubles the variation in the wrong direction.",
      "A computed wind exactly 180° from the expected one almost always means the vector order was reversed.",
      "Don't skip deviation because it is small. It applies to every minute of the leg.",
      "The CX-3 function names describe what they take, not what they give. Wind finding is not done in PLAN.",
    ],
  },
  "nav-20": {
    summary: [
      "Meridians are parallel at the Equator and meet at the poles. The angle at which two meridians are inclined to each other is called convergency, and this chapter shows how to calculate it. Between the Equator and the pole it varies with the sine of latitude. That gives the working formula: convergency equals change of longitude × sin(mean latitude). At 30°N, two meridians 40° apart converge by 20°. At the pole the convergency equals the full change of longitude, and at the Equator it is zero.",
      "Convergency matters because a great circle crosses each meridian at a different angle. The great circle track at one end differs from the track at the other end by exactly the convergency between them. A rhumb line keeps one direction throughout, so it lies between the two great circle tracks. The difference between the great circle and rhumb line directions at either end is the conversion angle, equal to half the convergency.",
      "The practical use is radio bearings. VOR, NDB and VDF bearings travel along great circles, but a Mercator chart draws rhumb lines as straight lines. Before plotting a radio bearing on a Mercator chart, apply the conversion angle. The chapter's worked examples practise finding the initial great circle track, the rhumb line track and the reverse great circle track from one another.",
    ],
    keyPoints: [
      "Convergency = change of longitude × sin(mean latitude). It is 0 at the Equator and equals the change of longitude at the pole.",
      "Sin values to know: sin 30° = 0.5, sin 45° ≈ 0.707, sin 60° ≈ 0.866.",
      "Example: meridians 40° apart at 30°N have a convergency of 40 × 0.5 = 20°.",
      "The great circle track changes by the convergency between the departure and destination meridians.",
      "Conversion angle = ½ × change of longitude × sin(mean latitude), half the convergency.",
      "The rhumb line track lies midway between the initial and final great circle tracks.",
      "Radio bearings are great circle directions. Apply the conversion angle before plotting them as straight lines on a Mercator chart.",
    ],
    traps: [
      "Convergency uses sin of the MEAN latitude, not cos. Cos belongs to departure calculations.",
      "In the northern hemisphere, going east, the great circle starts on a smaller track angle than the rhumb line and finishes on a larger one, because it bows towards the nearer pole.",
      "Conversion angle is half the convergency. Using the full convergency puts a plotted bearing twice as far out.",
      "When finding the reverse great circle track, convert to the rhumb line first, then apply the conversion angle at the other end. Don't just take the reciprocal of the initial great circle track.",
    ],
  },
};
