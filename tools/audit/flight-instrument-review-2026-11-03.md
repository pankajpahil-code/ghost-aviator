# Flight instrument figure review, 3 November 2026

Nineteen original drawings accompany nine lessons. Eighteen fill withheld figure positions. The companion Mach descent chart was replaced to keep its values consistent with the worked example. The rejected originals stay on the suppression list. See `instrument-figures.json` for the precise figure, lesson, asset, caption, labels, checksum and reference. The navigation crossing uses the lesson's stated 10 NM distance and 10 kt speed through still water.

The pressure lessons distinguish impact pressure from dynamic pressure and identify when the low-speed approximation applies. The pitot heat example directs students to the aircraft checklist and removes the instruction to feel an energised probe. The altimetry lesson uses the FAA's worked cold-temperature example. Two instrument practice questions now distinguish the low-speed approximation and the capsule pressure ratio. The keyed option indices are preserved. Recall item CPLMET-307 distinguishes its historical CO₂ option from the contemporary rounded value in Meteorology 1.

## Checking the Mach example

For the ISA calculation use sea-level pressure 101325 Pa, temperature 288.15 K, dry-air gas constant 287.05287 J/(kg K), standard gravity 9.80665 m/s² and heat-capacity ratio 1.4. Below 11 km use the 0.0065 K/m lapse rate and the standard pressure relation. Above 11 km the example uses the first isothermal layer. Compute impact pressure from CAS using the standard sea-level speed of sound. At the local static pressure, solve the subsonic total-to-static pressure relation for Mach and multiply by the local speed of sound for TAS. At 330 kt CAS this gives Mach 0.4989 at sea level and 0.9689 at FL360. The latter corresponds to 556 kt TAS. At Mach 0.80 and FL400 it gives 459 kt TAS and 242 kt CAS. These are rounded teaching examples.

- [NASA Glenn, isentropic flow equations](https://www.grc.nasa.gov/www/k-12/airplane/isentrop.html)
- [NASA, standard atmosphere properties and hydrostatic relation](https://ntrs.nasa.gov/api/citations/20060053240/downloads/20060053240.pdf)
- [FAA, Flight Instruments](https://www.faa.gov/regulationspolicies/handbooksmanuals/aviation/phak/chapter-8-flight-instruments)
- [FAA, Aviation Maintenance Technician Handbook, Airframe Volume 2](https://www.faa.gov/sites/faa.gov/files/2022-06/amt_airframe_hb_vol_2.pdf)
- [FAA AIM, cold-temperature procedures and worked example](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap7_section_3.html)
- [NOAA JetStream, dry-air composition](https://www.noaa.gov/jetstream/atmosphere)
