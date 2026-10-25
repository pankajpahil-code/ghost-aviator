REP = "Repeats another question in this book in substance; one copy kept."
GAR = "Question or options are garbled in the source text."
AMB = "References differ on the intended answer; not safe to key."
NS = "Not stated in the source text; cannot be confirmed."
TAT = "TAT = SAT x (1 + 0.2 x K x M^2), temperatures in kelvin, where K is the ram recovery factor (about 1.0 for a Rosemount probe)."
TC = "A thermocouple uses the Seebeck effect: two dissimilar metals joined at a hot and a cold junction produce an EMF that depends on the temperature difference; it is self-powered."
FLOAT = "A float-type fuel gauge measures fuel level (volume), so it is affected by aircraft attitude and acceleration, and by fuel expansion and density changes with temperature or grade. Its only real advantage is that it is simple and cheap."
SECS = {}
SECS['TEMP'] = ({}, {
 1: dict(ans='b', exp="TAT is higher than the static air temperature because of the ram rise, which depends on TAS (it is proportional to TAS squared)."),
 3: dict(ans='b', exp="A Rosemount (TAT) probe has a ram recovery factor of about 1.0: it recovers almost all of the ram temperature rise."),
 4: dict(ans='a', exp=TAT),
 6: dict(drop="The source itself calls this question badly worded."),
 7: dict(ans='b', exp="TAT is SAT plus the ram rise caused by adiabatic compression of the air brought to rest in the probe."),
 8: dict(drop=AMB), 9: dict(drop=REP), 10: dict(drop="Repeats a question in the Engine section of this bank."),
 11: dict(ans='a', exp=TAT + " At 36,000 ft ISA, SAT = -56.5 C = 216.65 K. TAT = 216.65 x (1 + 0.2 x 1 x 1) = 260 K = about -13 C."),
 12: dict(drop=GAR), 13: dict(drop=REP),
 14: dict(ans='c', exp=TC + " The circuit is two dissimilar metals joined at both ends, read on a moving coil (millivolt) instrument."),
 15: dict(ans='b', exp="Resistive temperature sensing uses the fact that the electrical resistance of a metal increases as its temperature rises."),
 16: dict(ans='c', exp="Bi-metallic strips bend with temperature and are used mainly in thermostatic switches."),
 17: dict(ans='d', exp="Aircraft temperatures are sensed by resistive probes (1), expansion of liquids and solids (4) and thermocouples using the Seebeck effect (5)."),
 18: dict(ans='b', exp=TAT + " SAT = 45 / (1 + 0.2 x 0.85 x 2^2) = 45 / 1.68 = 26.78 K."),
 19: dict(drop=GAR),
 20: dict(ans='c', exp="The Rosemount TAT probe has an electrical heater to prevent icing; the probe design keeps the heating error small."),
})
SECS['FUEL'] = ({}, {
 1: dict(ans='b', exp=FLOAT + " So statements 1, 2 and 4 are disadvantages; ambient pressure has no effect."),
 2: dict(drop=AMB), 4: dict(drop=NS), 5: dict(drop=NS),
 6: dict(ans='a', exp="A volumetric flow meter measures volume only; a mass flow meter also compensates for changes in fuel density."),
 7: dict(ans='a', exp="A compensated capacitive system measures fuel mass. When the fuel cools it contracts and its density rises but the mass is unchanged, so the indication does not change."),
 8: dict(ans='d', exp="Fuel flow meters measure either mass flow or volumetric flow, depending on the type of system."),
 9: dict(drop=REP), 10: dict(drop=REP),
 11: dict(ans='b', exp="The energy available from fuel (its calorific value) is proportional to its mass, not its volume, so mass flow is what matters to engine performance."),
 12: dict(ans='b', exp="Modern turbine aircraft use mass fuel flow meters."),
 13: dict(drop=AMB),
 14: dict(ans='d', exp="Water has a far higher dielectric constant than fuel, so a capacitive system with water in the tanks reads a mass that is not zero but is not accurate."),
 15: dict(ans='b', exp=FLOAT),
 16: dict(ans='a', exp="A float gauge using a simple galvanometer indicator is sensitive to supply voltage variations; a ratiometer indicator removes that sensitivity."),
 17: dict(ans='b', exp="A paddle wheel in the fuel line turns at a speed proportional to the flow; counting its pulses gives the volumetric flow, which is then corrected for density to get mass flow."),
})
