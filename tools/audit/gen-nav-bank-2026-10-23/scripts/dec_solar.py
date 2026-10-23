ALM = "Needs an Air Almanac extract (sunrise/twilight tables or standard-time list) that the site does not show; standard-time and daylight-saving rules also change over time."
ARC = "Sunrise at a given latitude happens at the same local mean time on the same day, so only the longitude changes the UTC. 15 deg of longitude = 1 hour (1 deg = 4 min); going west makes the event later in UTC, going east earlier."
CH = {3: 'nav-28', 6: 'nav-28', 8: 'nav-28', 21: 'nav-28', 43: 'nav-28', 44: 'nav-28', 45: 'nav-28',
      37: 'nav-13', 39: 'nav-13', 40: 'nav-13', 41: 'nav-21', 46: 'nav-21', 47: 'nav-21', 48: 'nav-21', 49: 'nav-21', 50: 'nav-21'}
CIRC = "Going once round the earth means covering 360 deg of longitude at each latitude. The length of a parallel is proportional to cos(latitude), so for the same journey time the groundspeeds are in the ratio of cos(latitude)."
D = {
 3: dict(ans='b', exp="Standard time is the legal time a country or zone keeps. It is set at a whole number of hours (sometimes half hours) different from UTC, so that a whole region shares one clock instead of each place keeping its own local mean time."),
 6: dict(ans='c', exp=ARC + " 025E to 040W is 65 deg west = 4 h 20 min later: 0254 + 4 h 20 = 0714 UTC."),
 8: dict(ans='a', exp=ARC + " 020W to 075W is 55 deg west = 3 h 40 min later: 0250 + 3 h 40 = 0630 UTC."),
 14: dict(drop=ALM), 15: dict(drop=ALM), 17: dict(drop=ALM),
 21: dict(ans='a', exp=ARC + " 034W to 040E is 74 deg east = 4 h 56 min earlier: 0743 - 4 h 56 = 0247 UTC, nearest option 0243 UTC."),
 23: dict(drop=ALM), 24: dict(drop=ALM), 25: dict(drop=ALM), 26: dict(drop=ALM), 35: dict(drop=ALM),
 37: dict(ans='c', exp="Ellipticity = (major axis - minor axis) / major axis. So minor axis = 6956 x (1 - 1/297) = 6956 - 23.4 = 6932.6 km, option c."),
 39: dict(ans='a', exp="At the South Pole every direction along the surface leads away from the pole toward the north, so whichever way you face, you face north."),
 40: dict(ans='c', exp="A great circle has 360 deg x 60 = 21 600 minutes of arc, and one minute of arc of a great circle is one nautical mile, so the circumference is about 21 600 NM."),
 41: dict(ans='c', exp=CIRC + " B = 240 x cos 0 / cos 60 = 240 / 0.5 = 480 kt."),
 43: dict(ans='a', exp=ARC + " 050E to 040W is 90 deg west = 6 h later: 0254 + 6 h = 0854 UTC."),
 44: dict(ans='d', q_sub=[('what time does it rise at', 'what time does it set at')], status='CORRECTED',
          exp="Sunset at a given latitude happens at the same local mean time on the same day, so only the longitude matters. 025E to 060W is 85 deg west = 5 h 40 min later: 1633 + 5 h 40 = 2213 UTC.",
          note="Stem asked for sunrise at the second place after giving sunset at the first; the source works it as sunset, so the stem now says set."),
 45: dict(ans='c', exp=ARC + " 025W to 040E is 65 deg east = 4 h 20 min earlier: 0654 - 4 h 20 = 0234 UTC."),
 46: dict(ans='a', exp=CIRC + " B = 340 / cos 50 = 340 / 0.643 = 529 kt."),
 47: dict(ans='b', exp=CIRC + " B = 300 / cos 45 = 424 kt."),
 48: dict(ans='c', exp=CIRC + " B = 240 x cos 20 / cos 60 = 240 x 0.940 / 0.5 = 451 kt."),
 49: dict(ans='c', exp=CIRC + " B = 300 x cos 45 / cos 75 = 300 x 0.707 / 0.259 = 820 kt."),
 50: dict(ans='b', exp=CIRC + " B = 400 / cos 30 = 462 kt."),
}
