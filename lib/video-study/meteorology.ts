import type { VideoStudyMap } from "./types";

// Chapter summaries written from the site's own notes for each chapter.
// Shown on the matching /cpl/<subject>/<chapter>/video page.
export const METEOROLOGY: VideoStudyMap = {
  "met-1": {
    summary: [
      "Every weather topic later in the syllabus happens somewhere in the structure this chapter describes. By volume, dry air is about 78% nitrogen, 21% oxygen, 0.93% argon and a small, variable share of carbon dioxide. Water vapour is left out because it varies so much. Nitrogen to oxygen is 4 : 1 by volume and 3 : 1 by weight. Up to about 80 km the mix is uniform (the homosphere). Above that, the gases separate by molecular weight (the heterosphere).",
      "The vertical divisions follow the temperature profile. The troposphere reaches about 16–18 km over the Equator and 8–10 km over the poles. Temperature falls by about 6.5°C per km, and the layer holds three-quarters of the atmosphere's mass and nearly all its water vapour, so this is where the weather is. The tropopause caps it, higher over the tropics and higher in summer. In the stratosphere above, temperature is first constant and then rises, because ozone at around 25 km absorbs the Sun's ultraviolet. Higher still come the mesosphere, with the coldest air at the mesopause, and the thermosphere.",
      "The chapter ends with the reference atmospheres used for design, performance and altimeter calibration. ICAO ISA is dry air at 15°C and 1013.25 hPa at mean sea level, with a lapse rate of 1.98°C per 1,000 ft up to a tropopause at 11 km. The Jet Standard Atmosphere was introduced because ISA is less suitable above about 30,000 ft.",
    ],
    keyPoints: [
      "Dry air: N₂ 78.08%, O₂ 20.95%, Ar 0.93%, CO₂ about 0.04% (variable). N₂ : O₂ is 4 : 1 by volume and 3 : 1 by weight.",
      "Supplementary oxygen is needed above 10,000 ft.",
      "The troposphere reaches 16–18 km at the Equator and 8–10 km at the poles. It holds about 75% of the atmosphere's mass and 99% of its water vapour.",
      "The tropopause is highest over the tropics, and higher in summer than in winter.",
      "The stratosphere is isothermal at first, then warms with height because ozone (around 25 km) absorbs UV.",
      "The mesopause is the coldest part of the atmosphere, about −100°C near 80 km. Noctilucent clouds appear there occasionally over polar regions.",
      "ISA at MSL: 15°C (288.15 K), 1013.25 hPa, 1.225 kg/m³. Lapse rate 6.5°C/km (1.98°C/1000 ft) up to 11 km (36,090 ft), where it is −56.5°C.",
      "JSA: lapse rate 2°C/1000 ft and no tropopause. It is used above the range where ISA is suitable (about 30,000 ft).",
    ],
    traps: [
      "The tropopause is a boundary, not a layer. Options calling it a layer of the atmosphere are wrong.",
      "Temperature in the lower stratosphere doesn't fall. It stays constant and then rises (an inversion), so a ‘positive lapse rate in the stratosphere’ is a distractor.",
      "Nacreous (mother-of-pearl) clouds are in the stratosphere. Noctilucent clouds are near the mesopause. Don't swap them.",
      "The 4 : 1 nitrogen-to-oxygen ratio is by volume. By weight it is 3 : 1.",
    ],
  },
  "met-3": {
    summary: [
      "Temperature drives almost everything in meteorology, so this chapter covers how it is measured and how the Earth heats up and cools down. It begins with the scales and conversions: F = 9C/5 + 32, K = C + 273, and the crossover point where −40°C equals −40°F. Surface air temperature is measured in a Stevenson screen about 1.25 m (4 ft) above the ground. The chapter separates heat from temperature and explains specific heat and latent heat. Water's specific heat of 1.0, against about 0.2 for soil, is why land heats and cools far faster than the sea.",
      "Most of the chapter is about radiation. Stefan–Boltzmann says emitted energy rises with the fourth power of absolute temperature. Wien's law says hotter bodies radiate at shorter wavelengths, so the Sun's radiation is short-wave and the Earth's is long-wave. Solar radiation is about 46% infrared, 45% visible and 9% ultraviolet. Of what arrives, about 70% is absorbed (51% by the surface) and about 30% is reflected or scattered back, which is the Earth's albedo. Heat also moves by conduction, convection and advection.",
      "The final sections bring this down to the airfield. They explain the daily temperature cycle and its timing over land and sea, and why cloud cover changes it. A cloudy night stays warmer because cloud traps outgoing long-wave radiation, while a clear night lets it escape freely.",
    ],
    keyPoints: [
      "F = 9C/5 + 32, C = 5(F − 32)/9, K = C + 273. −40°C = −40°F, and absolute zero is −273.15°C.",
      "Surface temperature is measured in a Stevenson screen about 1.25 m (4 ft) above ground.",
      "Specific heat: water 1.0, ice 0.5, soil 0.2. Land therefore warms and cools much faster than water.",
      "Stefan–Boltzmann: E ∝ T⁴. Wien: peak wavelength ∝ 1/T, so the Sun radiates short-wave and the Earth long-wave.",
      "Solar radiation is about 46% IR, 45% visible and 9% UV.",
      "Heat budget: about 70% absorbed (51% surface, 16% atmosphere, 3% clouds) and about 30% reflected or scattered. The Earth's albedo is about 30%, and fresh snow's about 80%.",
      "Diurnal range is under 1°C over the oceans and up to about 20°C over land.",
    ],
    traps: [
      "Minimum temperature comes about ½–1 hour AFTER sunrise, not at sunrise.",
      "Maximum temperature comes about 2–3 hours after noon, in the early afternoon, not at noon.",
      "Cloudy nights are warmer and clear nights colder. Options that reverse this mix up the cloud's effect by day and by night.",
      "Wien's law is ‘hot = short, cold = long’. The Earth's outgoing radiation is long-wave infrared, not short-wave.",
    ],
  },
  "met-4": {
    summary: [
      "Air density decides how much lift a wing makes, how much thrust an engine gives and how long the take-off run will be, which is why it gets a chapter of its own. Everything starts from the gas equation: density equals pressure divided by the gas constant times absolute temperature (ρ = P/RT). Higher pressure raises density, and higher temperature lowers it. In ISA at mean sea level, dry air at 15°C and 1013.25 hPa has a density of 1,225 g/m³, with R = 287 J/(kg·K) for dry air.",
      "The chapter then shows why moist air is less dense than dry air at the same pressure and temperature: water vapour is lighter than the air it replaces, which the moist-air form of the equation expresses. It gives a quick rule of thumb: a 10 hPa fall in pressure, a 3°C rise in temperature or a 300 ft climb each lower density by about 1%. With height, density roughly halves every 5–6 km, to half at 6 km, a quarter at 11 km and an eighth at 17 km.",
      "The last sections turn this into performance. Below about 8 km the poles have denser air than the Equator, and above 8 km it is the other way round. Density altitude, the altitude in ISA with the same density, differs from pressure altitude by about 120 ft per °C of ISA deviation. Hot, high and humid conditions give the highest density altitude and the worst take-off and climb performance.",
    ],
    keyPoints: [
      "ρ = P/RT. Density rises with pressure and falls with temperature. Dry air R = 287 J/(kg·K).",
      "ISA surface density is 1,225 g/m³ (1.225 kg/m³) at 15°C and 1013.25 hPa.",
      "At the same pressure and temperature, moist air is less dense than dry air.",
      "A 1% density drop comes from any one of: 10 hPa fall, 3°C rise or 300 ft gain.",
      "Density is ½ at about 6 km, ¼ at about 11 km and ⅛ at about 17 km. In the lower atmosphere it falls about 3% per 1,000 ft.",
      "Below 8 km the poles are denser than the Equator. Above 8 km the Equator is denser.",
      "DA = PA ± (ISA deviation × 120 ft).",
      "In high humidity, add about 10% to the computed take-off distance and expect a reduced climb rate.",
    ],
    traps: [
      "Humid air is LESS dense, not more. Water vapour (M ≈ 18) is lighter than dry air, so ‘moist air is heavier’ is wrong.",
      "The latitudinal density pattern reverses at about 8 km. Piston aircraft cruising low do better near the poles, and jets cruising high do better over the tropics.",
      "On a hot day density altitude is ABOVE pressure altitude. Add 120 ft per °C above ISA, don't subtract it.",
      "Density decreases with each of altitude, temperature and humidity. An option that names only one as the factor is incomplete.",
    ],
  },
};
