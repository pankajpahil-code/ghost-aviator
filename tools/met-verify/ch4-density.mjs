// Meteorology Ch.4 (Air Density) — VERIFIED. IC = IC Joshi QB.
export const CH4 = [
  { src:"IC", q:"Air density near the surface is ____ at the poles than at the Equator:", opts:["Higher","Lower","Same"], ans:0, status:"VERIFIED", cite:"Cold polar air is denser than warm equatorial air." },
  { src:"IC", q:"Above about 8 km, air density is ____ at the poles than at the Equator:", opts:["Higher","Lower","Same"], ans:1, status:"VERIFIED", cite:"The reversal: above ~8 km the equatorial column is deeper, so density is lower over the poles." },
  { src:"IC", q:"The altitude in the ISA at which the air density equals the observed density is called the:", opts:["Density altitude","ISA density","Real density"], ans:0, status:"VERIFIED", cite:"Definition of density altitude." },
  { src:"IC", q:"Density is usually expressed in:", opts:["kg per square metre","grams per cubic metre","newtons per square metre"], ans:1, status:"VERIFIED", cite:"Density = mass/volume (e.g. g/m³)." },
  { src:"IC", q:"A higher density altitude means a ____ air density:", opts:["Higher","Lower","Same"], ans:1, status:"VERIFIED", cite:"High density altitude corresponds to low actual air density." },
  { src:"IC", q:"For a given pressure and temperature, moist air has a ____ density than dry air:", opts:["Higher","Lower","Same"], ans:1, status:"VERIFIED", cite:"Water vapour is lighter than dry air, so moist air is less dense." },
  { src:"IC", q:"Air is less dense in:", opts:["High altitudes","Warm air","High humidity","All of these"], ans:3, status:"VERIFIED", cite:"Altitude, heat and humidity each reduce density." },
  { src:"IC", q:"Density altitude may be defined as:", opts:["The ISA altitude at which the prevailing pressure occurs","The ISA altitude at which the prevailing density occurs","A constant-pressure surface referenced to 1013.2 hPa"], ans:1, status:"VERIFIED", cite:"Density altitude = ISA altitude matching the actual density." },
  { src:"IC", q:"Air is least dense in conditions of:", opts:["Low altitude","High pressure","High altitude, high temperature and high humidity"], ans:2, status:"VERIFIED", cite:"All three factors lower density (reworded from a duplicate)." },

  // ── corrected / flagged ───────────────────────────────────────────────────
  { src:"IC", q:"If pressure increases (temperature unchanged), the density altitude:", opts:["Increases","Lowers","Remains the same"], ans:1, status:"CORRECTED", cite:"Higher pressure gives higher density, so the density altitude lowers." },
  { src:"IC", q:"For every 1°C rise in temperature above ISA, the density altitude changes by about:", opts:["33 ft","100 ft","120 ft","210 ft"], ans:2, status:"CORRECTED", cite:"≈120 ft per °C (density altitude ≈ pressure altitude + 118 ft × ISA-deviation). IC Joshi marked 33 ft — incorrect." },
];
