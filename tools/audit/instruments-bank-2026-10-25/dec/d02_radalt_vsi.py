REP = "Repeats another question in this section in substance; one copy kept."
FM = "A radio altimeter transmits a continuous frequency-modulated carrier (about 4.2 to 4.4 GHz) down to the ground and compares the frequency of the returning echo with the frequency being transmitted; the difference is proportional to the time taken and so to height."
SECS = {}
SECS['RADIO ALTIMETERS'] = ({}, {
 1: dict(ans='a', exp="The radio altimeter is calibrated so that it reads zero with the main wheels on the ground; in the approach it therefore shows the height of the lowest (main) wheels above the ground directly below."),
 2: dict(ans='a', exp="On a system failure the radio altimeter pointer or readout is removed from view and a warning flag appears, so the crew cannot use a false height."),
 3: dict(ans='c', exp="A radio altimeter is self-contained equipment carried in the aircraft. It measures true height above the ground immediately below, not altitude above sea level."),
 4: dict(ans='a', exp="The radio altimeter gives the distance between the aircraft and the ground beneath it. Its output is used by several systems (GPWS, autoland, decision height alerting), not only its own indicator, and altitude hold uses barometric data."),
 5: dict(drop="The required combination depends on figures (range, accuracy) that differ between references; cannot be keyed with confidence."),
 6: dict(ans='b', exp="To read zero at touchdown the system subtracts the residual height of the antennas above the wheels and the signal path length in the cables (aircraft installation delay).", note="Scan key read as c (single reading); keyed b, consistent with question 26 and the book's own explanation of zero setting."),
 7: dict(ans='c', exp="Low-altitude radio altimeters operate between 4200 and 4400 MHz."),
 8: dict(ans='c', exp="4200 to 4400 MHz lies in the SHF (super high frequency) band."),
 9: dict(ans='c', exp=FM),
 10: dict(ans='b', exp=FM),
 11: dict(ans='c', exp="4400 MHz is in the 4200 to 4400 MHz band reserved for radio altimeters."),
 12: dict(drop=REP), 13: dict(drop=REP),
 14: dict(drop=REP),
 15: dict(ans='c', exp="At about 4.3 GHz the wavelength is roughly 7 cm, so radio altimeters use centimetric waves."),
 16: dict(drop=REP), 17: dict(ans='a', exp="On a fault the needle or digits are removed from view and a failure flag appears; some installations add an aural warning.") ,
 18: dict(ans='d', exp="A radio altimeter measures height above the ground or water directly below the aircraft."),
 19: dict(drop=REP), 20: dict(drop=REP),
 21: dict(ans='d', exp="The radio altimeter is the source of true height above the surface, so its failure loses height data; pressure and density altitude come from the air data system."),
 22: dict(ans='d', exp="The system compares transmitted and received frequency over a repeating sweep. Beyond a certain height the echo returns from an earlier sweep cycle, the cycles overlap and the measurement becomes ambiguous, which sets the maximum usable height."),
 23: dict(drop=REP), 24: dict(drop=REP), 25: dict(drop=REP),
 26: dict(ans='b', exp="Zero at touchdown is obtained by allowing for the signal path through the aircraft wiring (2) and for the height of the antennas above the main wheels (3)."),
 27: dict(ans='d', exp="Low-altitude radio altimeters are accurate from zero up to about 2500 ft."),
 28: dict(drop=REP), 29: dict(drop=REP),
})
SECS['RADIO ALTIMETERS'][1][17] = dict(drop=REP)
SECS['VSI'] = ({}, {
 1: dict(ans='c', exp="The VSI uses static pressure only, so a blocked pitot pipe does not affect it."),
 2: dict(ans='c', exp="A partly blocked static pipe slows the pressure change reaching the instrument, so the rate it senses is too small: the VSI under-reads in both climb and descent."),
 3: dict(ans='a', exp="An instantaneous VSI adds an accelerometer unit (two small dashpots) that responds at once to vertical acceleration, removing most of the lag of the basic instrument."),
 4: dict(ans='d', exp="The choke (metering unit) restricts flow into the case. If it is partly blocked, the case pressure lags further behind the capsule pressure, so the difference, and the indication, is too large in both climb and descent."),
 5: dict(ans='b', exp="The correct first action is to select the alternate (standby) static source. Breaking the VSI glass is a last resort if no alternate source is fitted."),
 6: dict(drop="The effect of a leak into cabin pressure depends on how cabin pressure changes during the climb or descent; the options cannot be decided from the stem."),
 7: dict(ans='c', exp="The VSI measures the difference between the pressure inside its capsule (direct static) and the pressure in the case around it (static through a restriction)."),
 8: dict(ans='a', exp="A descent is shown below the zero line; as the rate of descent increases the needle moves further downwards."),
 9: dict(ans='a', exp="Close to the ground the airflow and pressure around the static source change (ground effect), so the VSI can become inaccurate during landing."),
 10: dict(ans='d', exp="On a 3 deg slope ROD = TAS x 101.3 x tan 3 = 100 x 101.3 x 0.0524 = about 531 ft/min (the 1 in 60 rule gives 506). The nearest option is 524 fpm descent."),
 11: dict(drop="Option a is missing (merged into the stem) in the source text."),
 13: dict(drop=REP),
 14: dict(drop="A steady sideslip gives a constant pressure offset, which a VSI does not show, but the transient while entering it does; the stem does not say which is meant."),
})
