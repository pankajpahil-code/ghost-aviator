REP = "Repeats another question in this book in substance; one copy kept."
FIG = "Needs a display diagram the site does not show."
GAR = "Question or options are garbled in the source text."
CMD = "The flight director command bars show the manoeuvre needed to reach or hold the selected flight condition; the pilot flies the aircraft symbol onto the bars."
SECS = {'FLIGHT DIRECTOR': ({}, {
 1: dict(ans='b', exp="Flight director (and autopilot and auto-throttle) modes are shown on the flight mode annunciator strip at the top of the PFD."),
 2: dict(ans='c', exp="A flight director needs a computer (1) to calculate the commands and command bars (4) to show them. It does not need an autopilot or auto-throttle."),
 3: dict(ans='c', exp=CMD + " The computed path returns the aircraft to the desired path in an optimal way, not at a fixed intercept angle."),
 4: dict(ans='a', exp="The command bars are displayed on the attitude indicator: the ADI, or the PFD on EFIS aircraft."),
 5: dict(drop=REP),
 6: dict(ans='c', exp="The flight director bars can be shown in manual flight and, on some installations, also during automatic flight, so they are sometimes visible in automatic flight."),
 7: dict(drop=FIG), 8: dict(drop=REP),
 9: dict(ans='b', exp=CMD + " Selecting 360 from 270 makes the vertical bar deviate right; it centres as soon as the aircraft is rolled to the bank angle the flight director has calculated."),
 10: dict(ans='d', exp=CMD + " It shows the optimum instantaneous path to reach the selected radial, recomputed continuously."),
 11: dict(ans='a', exp=CMD),
 12: dict(drop=FIG), 13: dict(drop=FIG), 16: dict(drop=GAR), 17: dict(drop=REP), 18: dict(drop=FIG),
 19: dict(ans='b', exp="On EFIS aircraft the flight director bars are shown on the PFD."),
 20: dict(ans='a', exp=CMD + " With 180 selected while flying 160, the vertical bar centres once the aircraft is at the bank attitude needed to turn onto 180."),
 21: dict(drop=FIG),
 23: dict(ans='b', exp="Selecting 180 while steady on 160 needs a right turn, so the vertical bar moves right."),
 24: dict(drop=REP), 25: dict(drop=GAR),
})}
