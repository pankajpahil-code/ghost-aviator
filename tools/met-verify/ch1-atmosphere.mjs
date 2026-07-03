// Meteorology Ch.1 (Atmosphere) — VERIFIED question bank.
// Sources: IC = IC Joshi QB (Met QB ic Joshi.pdf) ; OX = Oxford/CAE ATPL Meteorology.
// Every answer verified against CAE ATPL Met + standard aviation meteorology.
// status: VERIFIED | CORRECTED (book was wrong) | TEXT-FIX (garbled OCR) | FLAG (needs Capt. ruling)
// ans = 0-based index of the correct option.

export const CH1 = [
  // ── IC Joshi (cleaned + verified) ─────────────────────────────────────────
  { src:"IC", q:"The lowest layer of the atmosphere is the:", opts:["Troposphere","Tropopause","Stratosphere"], ans:0, status:"VERIFIED", cite:"Troposphere is the lowest layer (CAE ATPL Met, Ch.1)." },
  { src:"IC", q:"The height of the tropopause at the Equator is approximately:", opts:["10–12 km","16–18 km","12–14 km"], ans:1, status:"TEXT-FIX", cite:"Equatorial tropopause ≈16 km (CAE Q2). Options de-garbled (1012→10–12)." },
  { src:"IC", q:"The height of the tropopause at the Poles is approximately:", opts:["12–14 km","12–13 km","8–10 km"], ans:2, status:"TEXT-FIX", cite:"Polar tropopause ≈8 km (CAE Q19). Options de-garbled." },
  { src:"IC", q:"The higher the surface temperature, the ____ the tropopause:", opts:["Higher","Lower","Same"], ans:0, status:"TEXT-FIX", cite:"Warm surface → deeper troposphere → higher tropopause. Fixed 'tropopau se'." },
  { src:"IC", q:"The height of the tropopause:", opts:["Is constant","Varies with altitude","Varies with latitude"], ans:2, status:"VERIFIED", cite:"Tropopause height decreases from Equator to Poles (CAE Q1)." },
  { src:"IC", q:"Above 8 km, the lower temperatures are found over the:", opts:["Equator","Mid-latitudes","Poles"], ans:0, status:"CORRECTED", cite:"Equatorial tropopause is higher & colder (≈−75°C) than polar (CAE Q10). Live site showed 'Poles' — WRONG." },
  { src:"IC", q:"The atmosphere is heated mainly by:", opts:["Solar radiation directly","Heat from the earth's surface","Radiation from space"], ans:1, status:"VERIFIED", cite:"Atmosphere heated from below by terrestrial radiation (CAE Ch.1)." },
  { src:"IC", q:"The stratosphere is:", opts:["Unstable","Neutral","Stable"], ans:2, status:"CORRECTED", cite:"Stratosphere is STABLE (temperature inversion). IC Joshi book marked 'Neutral' — WRONG (CAE Q11/Q12)." },
  { src:"IC", q:"The tropopause is discontinuous (has breaks) at about:", opts:["30° latitude","40° latitude","60° latitude"], ans:0, status:"VERIFIED", cite:"Main tropopause breaks near 30° (sub-tropical jet); also 60° (polar). IC Joshi answer 30°." },
  { src:"IC", q:"Most of the atmospheric mass is contained in the:", opts:["Troposphere","Stratosphere","Heterosphere"], ans:0, status:"VERIFIED", cite:"≈¾ of atmospheric mass is in the troposphere (CAE Ch.1)." },
  { src:"IC", q:"The stratosphere extends from the tropopause up to about:", opts:["50 km","60 km","40 km"], ans:0, status:"VERIFIED", cite:"Stratosphere ≈11–50 km (CAE Q22)." },
  { src:"IC", q:"The atmospheric layer characterised by a temperature inversion and great stability is the:", opts:["Troposphere","Tropopause","Stratosphere"], ans:2, status:"VERIFIED", cite:"Stratosphere (inversion + stability)." },
  { src:"IC", q:"Mother-of-pearl (nacreous) clouds occur in the:", opts:["Mesosphere","Thermosphere","Stratosphere"], ans:2, status:"VERIFIED", cite:"Nacreous/mother-of-pearl clouds ≈20–30 km, stratosphere. (Merged duplicate Q16/Q29.)" },
  { src:"IC", q:"In the ISA, the temperature at 17 km is:", opts:["−56.5°C","−65.5°C","−35.5°C"], ans:0, status:"TEXT-FIX", cite:"ISA isothermal −56.5°C from 11–20 km (CAE Q20). Fixed missing minus signs." },
  { src:"IC", q:"By weight, the approximate ratio of O₂ to N₂ in the atmosphere is:", opts:["1:3","1:4","1:5"], ans:0, status:"VERIFIED", cite:"By mass O₂≈23%, N₂≈76% → ≈1:3." },
  { src:"IC", q:"By volume, the approximate ratio of O₂ to N₂ in the atmosphere is:", opts:["1:3","1:4","1:5"], ans:1, status:"VERIFIED", cite:"By volume O₂≈21%, N₂≈78% → ≈1:4 (CAE Q13)." },
  { src:"IC", q:"By volume, the proportion of CO₂ in the atmosphere is about:", opts:["3%","0.3%","0.03%"], ans:2, status:"VERIFIED", cite:"CO₂ ≈0.03–0.04% by volume." },
  { src:"IC", q:"In the ISA, the mean sea level temperature is:", opts:["15°C","10°C","25°C"], ans:0, status:"VERIFIED", cite:"ISA MSL temperature = +15°C (CAE)." },
  { src:"IC", q:"The maximum concentration of ozone is at a height of about:", opts:["10–15 km","20–25 km","30–35 km"], ans:1, status:"TEXT-FIX", cite:"Ozone maximum ≈20–25 km. Options de-garbled (1015→10–15)." },
  { src:"IC", q:"Supplemental oxygen is required when flying above about:", opts:["5000 ft","7000 ft","10 000 ft"], ans:2, status:"VERIFIED", cite:"Supplemental O₂ above ≈10 000 ft (physiology/DGCA)." },
  { src:"IC", q:"CO₂ and water vapour keep the atmosphere:", opts:["Warm","Cold","No effect"], ans:0, status:"VERIFIED", cite:"Greenhouse gases warm the atmosphere." },
  { src:"IC", q:"Noctilucent clouds occur in the:", opts:["Thermosphere","Mesosphere","Stratosphere"], ans:1, status:"VERIFIED", cite:"Noctilucent clouds near the mesopause ≈80 km (mesosphere)." },
  { src:"IC", q:"If the temperature at 2 km is +5°C, the ISA deviation (Actual − ISA) is:", opts:["−5°C","+2°C","+3°C"], ans:2, status:"TEXT-FIX", cite:"ISA@2km≈+2°C; +5−(+2)=+3°C. Fixed answer-option sign (was '−03°C')." },
  { src:"IC", q:"If the MSL pressure is 1002.25 hPa, the deviation from the ISA MSL pressure is:", opts:["−11 hPa","+10 hPa","+12 hPa"], ans:0, status:"VERIFIED", cite:"1002.25 − 1013.25 = −11 hPa." },
  { src:"IC", q:"If the temperature at 19 km is −60°C, the ISA deviation is:", opts:["−4.5°C","−5.5°C","−3.5°C"], ans:2, status:"TEXT-FIX", cite:"ISA@19km=−56.5°C (isothermal); −60−(−56.5)=−3.5°C." },
  { src:"IC", q:"The homosphere (up to ≈80 km) has a uniform composition because of:", opts:["Pressure","Gravitation","Turbulent mixing"], ans:2, status:"CORRECTED", cite:"Uniform because turbulent/eddy mixing dominates. IC Joshi marked 'Gravitation' — WRONG." },
  { src:"IC", q:"Approximately half of the atmosphere's mass (by weight) lies below:", opts:["20 000 ft","15 000 ft","10 000 ft"], ans:0, status:"CORRECTED", cite:"50% of mass below ≈5500 m ≈18 000 ft → 20 000 ft closest (CAE Q23). Live notes-bank showed 15 000 ft — WRONG." },
  { src:"IC", q:"In the Jet Standard Atmosphere, the assumed lapse rate is:", opts:["2°C/1000 ft","2°C/km","5°C/km"], ans:0, status:"VERIFIED", cite:"JSA uses 2°C per 1000 ft." },
  { src:"IC", q:"The rate of fall of temperature with height is called the:", opts:["Isothermal rate","Inversion rate","Lapse rate"], ans:2, status:"VERIFIED", cite:"Definition of lapse rate." },
  { src:"IC", q:"In the actual atmosphere, the lapse rate can:", opts:["Assume any value","Only fall up to 8 km","Only rise up to 50 km"], ans:0, status:"VERIFIED", cite:"Real environmental lapse rate varies (can be positive, zero, or inverted)." },
  { src:"IC", q:"The tropical tropopause over India is at about:", opts:["20–21 km","14–15 km","16–16.5 km"], ans:2, status:"TEXT-FIX", cite:"Tropical tropopause ≈16–17 km. Options de-garbled." },
  { src:"IC", q:"The lapse rate in the troposphere is caused by ____ , and the stratospheric inversion by ____:", opts:["Evaporation; condensation","Rising air; solar radiation","Terrestrial radiation; solar radiation (ozone)","Solar radiation; convection"], ans:2, status:"CORRECTED", cite:"Troposphere heated from below (terrestrial radiation); stratosphere warmed by ozone absorbing solar UV. IC Joshi marked 'Rising air…'. (Merged duplicate Q44.)" },
  { src:"IC", q:"A negative lapse rate (temperature rising with height) is known as an:", opts:["Isothermal layer","Temperature fall with height","Inversion","Adiabatic layer"], ans:2, status:"TEXT-FIX", cite:"Inversion = temperature increasing with height. Options tidied." },
  { src:"IC", q:"In the ICAO ISA, the atmosphere is assumed to be isothermal from:", opts:["11 to 16 km","11 to 20 km","11 to 32 km","0 to 11 km"], ans:1, status:"CORRECTED", cite:"ISA is isothermal (−56.5°C) 11→20 km, then rises. IC Joshi marked '11–32 km' — WRONG (CAE Q20/Q22)." },
  { src:"IC", q:"Which is a characteristic of the atmosphere?", opts:["It is a poor conductor of heat and electricity","The Equator is warmer than the poles above 10 km","The stratospheric lapse rate is positive","Density is constant above 8 km"], ans:0, status:"VERIFIED", cite:"Air is a poor conductor; the other options are false." },
  { src:"IC", q:"The knowledge of the tropopause height is important to a pilot because:", opts:["Weather is mainly confined up to this level","Clouds never reach this height","All solar radiation is absorbed here"], ans:0, status:"VERIFIED", cite:"Weather (and most cloud/turbulence) is confined to the troposphere." },
  { src:"IC", q:"In the ISA, the tropopause is at a height of:", opts:["8–10 km","11 km","16–18 km"], ans:1, status:"TEXT-FIX", cite:"ISA tropopause = 11 km (36 090 ft). Options de-garbled." },

  // ── IC Joshi — FLAGGED for Capt. Pankaj's ruling ──────────────────────────
  { src:"IC", q:"Most of the atmospheric water vapour is found:", opts:["In the stratosphere","Up to 30 000 ft","In the mid-troposphere","In the lower troposphere"], ans:3, status:"FLAG-APPLIED", cite:"Applied 'lower troposphere' (standard fact). IC Joshi book marked 'up to 30 000 ft' — logged for your override." },
  { src:"IC", q:"The greatest transfer of heat from the earth's surface to the atmosphere is by:", opts:["Convection","Radiation","Sensible heat","Latent heat"], ans:3, status:"FLAG-APPLIED", cite:"Applied 'latent heat' (largest term in the surface energy budget). IC Joshi marked 'sensible heat' — logged for your override." },
  // DROPPED (flag → my recommendation): "The troposphere is generally stable/unstable/neutral"
  //   — no single correct answer (conditionally unstable); the two banks disagreed. Removed.
  // DROPPED (flag → my recommendation): "'Tropos' means turning/under-current/convection"
  //   — weak etymology question, low DGCA value. Removed.

  // ── Oxford / CAE ATPL Met (unique, all answer-key verified) ───────────────
  { src:"OX", q:"In the ISA, the temperature decrease with height below 11 km is:", opts:["0.5°C/100 m","0.6°C/100 m","0.65°C/100 m","1°C/100 m"], ans:2, status:"VERIFIED", cite:"ISA lapse 6.5°C/km = 0.65°C/100 m (CAE Q3)." },
  { src:"OX", q:"The 200 hPa pressure level, in temperate regions, is at an average height of about:", opts:["FL390","FL300","FL100","FL50"], ans:0, status:"VERIFIED", cite:"200 hPa ≈ 38 700 ft ≈ FL390 (CAE Q4)." },
  { src:"OX", q:"The temperature at FL110 is −12°C. Applying the ICAO standard lapse rate, the temperature at FL140 is:", opts:["−6°C","−18°C","−9°C","−15°C"], ans:1, status:"VERIFIED", cite:"3000 ft × 2°C/1000 ft = 6°C colder → −18°C (CAE Q5)." },
  { src:"OX", q:"At a position the 300 hPa temperature is −54°C and the tropopause is at FL330. The most likely temperature at FL350 is:", opts:["−48°C","−60°C","−56.5°C","−64°C"], ans:1, status:"VERIFIED", cite:"FL300→FL330: −54−6=−60°C; above tropopause isothermal → FL350=−60°C (CAE Q6)." },
  { src:"OX", q:"The boundary between the troposphere and the stratosphere is called the:", opts:["Ionosphere","Stratopause","Atmosphere","Tropopause"], ans:3, status:"VERIFIED", cite:"Tropopause (CAE Q7)." },
  { src:"OX", q:"Which constant-pressure chart is standard for the FL50 (≈4781 ft) level?", opts:["500 hPa","300 hPa","850 hPa","700 hPa"], ans:2, status:"VERIFIED", cite:"850 hPa ≈ 5000 ft (CAE Q8)." },
  { src:"OX", q:"An OAT of −30°C is measured at FL200. The temperature deviation from ISA is:", opts:["5°C colder than ISA","5°C warmer than ISA","10°C colder than ISA","10°C warmer than ISA"], ans:0, status:"VERIFIED", cite:"ISA@FL200=−25°C; −30 is 5°C colder (CAE Q9)." },
  { src:"OX", q:"The most likely temperature at the tropical tropopause is:", opts:["−56.5°C","−75°C","−40°C","−25°C"], ans:1, status:"VERIFIED", cite:"Tropical tropopause ≈−75°C (CAE Q10)." },
  { src:"OX", q:"In the lower part of the stratosphere the temperature:", opts:["Is almost constant","Decreases with altitude","Increases with altitude","Increases then decreases"], ans:0, status:"VERIFIED", cite:"Lower stratosphere is isothermal (CAE Q12)." },
  { src:"OX", q:"An air temperature of −15°C at the 700 hPa level over western Europe would be characterised as:", opts:["Within ±5°C of ISA","20°C below standard","Low","High"], ans:2, status:"VERIFIED", cite:"700 hPa≈FL100, ISA≈−5°C; −15°C is colder than standard = Low (CAE Q15)." },
  { src:"OX", q:"Flying at FL300 in an air mass 15°C warmer than ISA, the outside temperature is likely:", opts:["−15°C","−30°C","−45°C","−60°C"], ans:1, status:"VERIFIED", cite:"ISA@FL300=−45°C; +15 → −30°C (CAE Q16)." },
  { src:"OX", q:"At FL140 the OAT is −8°C. The freezing level is at approximately:", opts:["FL75","FL100","FL130","FL180"], ans:1, status:"VERIFIED", cite:"−8°C→0°C needs +4000 ft descent (2°C/1000 ft); FL140−40=FL100 (CAE Q17)." },
  { src:"OX", q:"The most important constituent in the atmosphere from a weather standpoint is:", opts:["Carbon dioxide","Oxygen","Water vapour","Methane"], ans:2, status:"VERIFIED", cite:"Water vapour drives weather (CAE Q18)." },
  { src:"OX", q:"The average height of the tropopause at latitude 50° is about:", opts:["8 km","11 km","14 km","16 km"], ans:1, status:"VERIFIED", cite:"Mid-latitude tropopause ≈11 km (CAE Q19)." },
  { src:"OX", q:"Between MSL and 20 km, the lowest temperature in the ISA is:", opts:["−273°C","−44.7°C","−56.5°C","−100°C"], ans:2, status:"VERIFIED", cite:"ISA minimum −56.5°C in the 11–20 km isothermal layer (CAE Q20)." },
  { src:"OX", q:"The ISA assumes the temperature reduces at:", opts:["1.98°C/1000 ft up to 36 090 ft, then constant to 65 617 ft","1.98°C/1000 ft up to 36 090 ft, then +0.3°C/1000 ft","2°C/1000 ft up to 65 617 ft","2°C/1000 ft up to 36 090 ft, then +0.3°C/1000 ft"], ans:0, status:"VERIFIED", cite:"ISA: 1.98°C/1000 ft to 36 090 ft then isothermal to 65 617 ft (CAE Q21)." },
  { src:"OX", q:"A temperature of +15°C is recorded at 500 m AMSL. Using the standard lapse rate, the temperature at a 2500 m summit is:", opts:["0°C","+2°C","+4°C","−2°C"], ans:1, status:"VERIFIED", cite:"2000 m × 6.5°C/km = 13°C; 15−13=+2°C (CAE Q24)." },
];
