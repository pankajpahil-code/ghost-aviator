REP = "Repeats another question in this book in substance; one copy kept."
GAR = "Question or options are garbled in the source text."
AMB = "References differ on the intended answer; not safe to key."
FIG = "Needs a display diagram the site does not show."
TX = "TCAS works by interrogating the transponders of other aircraft and timing their replies. An aircraft with no transponder is invisible to it; a Mode A reply (no altitude) gives a traffic advisory only; Mode C or Mode S altitude replies allow vertical resolution advisories as well, and two Mode S equipped TCAS II aircraft coordinate their manoeuvres."
SYM = "TCAS symbols: other (non-threat) traffic is a hollow cyan or white diamond; proximate traffic a solid cyan or white diamond; a traffic advisory a solid yellow (amber) circle; a resolution advisory a solid red square."
RA = "TCAS II gives resolution advisories in the vertical plane only. A corrective RA asks for a change of vertical speed (climb, descend, increase or reduce rate); a preventive RA asks the pilot to avoid certain vertical speeds without changing the present one (e.g. monitor vertical speed)."
LSS = "Local speed of sound (kt) = 38.94 x square root of absolute temperature (K). ISA temperature = 15 - 1.98 C per 1000 ft."
SECS = {}
SECS['TCAS'] = ({}, {
 1: dict(ans='a', exp=TX),
 2: dict(ans='b', exp=TX + " So there is no protection against aircraft without a serviceable transponder."),
 3: dict(ans='c', exp=RA),
 4: dict(ans='d', exp=RA),
 5: dict(drop=REP),
 6: dict(ans='b', exp=TX),
 8: dict(ans='d', exp="TCAS II information can be shown on a dedicated display, the weather radar screen, a VSI-type liquid crystal display (with TA and RA) or an EFIS screen: all four."),
 9: dict(ans='c', exp="Traffic that is close but not a threat is shown as an empty (hollow) cyan or white diamond. A traffic advisory is a solid yellow circle and a resolution advisory a solid red square."),
 10: dict(ans='c', exp=SYM),
 11: dict(ans='b', exp=SYM),
 12: dict(ans='a', exp=RA),
 13: dict(ans='b', exp=TX),
 14: dict(ans='c', exp=TX),
 15: dict(drop=AMB),
 16: dict(ans='c', exp=RA + " TCAS II therefore gives traffic advisories (1) and vertical resolution advisories (3)."),
 17: dict(drop=GAR),
 18: dict(ans='a', exp=RA),
 19: dict(drop=REP), 20: dict(drop=REP),
 21: dict(ans='a', exp=TX),
 22: dict(ans='c', exp="An RA must be followed promptly and smoothly (climb or descend as commanded), and ATC told as soon as possible. The pilot does not wait for ATC approval."),
 23: dict(drop=REP), 24: dict(drop=AMB), 25: dict(ans='b', exp=RA),
 26: dict(drop=REP), 27: dict(drop=REP),
 28: dict(ans='d', exp=TX + " The intruder does not need TCAS itself: with an altitude-reporting transponder it can still produce TAs and RAs."),
 29: dict(ans='a', exp=TX),
 30: dict(drop=REP), 31: dict(drop=REP), 32: dict(drop=REP), 33: dict(drop=REP), 34: dict(drop=REP), 35: dict(drop=REP),
 36: dict(ans='b', exp=RA + " Corrective and preventive commands are all vertical: climb or descend (2), increase rate (3), stop climb or descent (4) and monitor vertical speed (5)."),
 37: dict(drop=REP), 38: dict(drop=AMB), 39: dict(drop=REP), 40: dict(drop=FIG), 42: dict(drop=FIG),
 47: dict(drop=REP),
 48: dict(ans='a', exp="On a TCAS VSI, symbols show the relative position (1) and arrows the vertical motion (2) of traffic, and coloured arcs show the rates to avoid (3) and the rate to fly (4). Track and CAS of the traffic are not shown."),
 49: dict(drop=REP),
 50: dict(ans='b', exp=TX),
 56: dict(drop=GAR), 57: dict(drop=AMB), 58: dict(drop=REP), 59: dict(drop=REP),
})
SECS['CRP5'] = ({}, {
 1: dict(ans='c', exp="At 15,000 ft the ISA temperature is -15 C, so the air is ISA. Relative density there is about 0.629, so TAS = CAS / sqrt(0.629) = 145 / 0.793 = 183 kt.", status='CORRECTED', note="Scan key read as b (148 kt); worked as 183 kt."),
 2: dict(ans='b', exp="At 20,000 ft, OAT -20 C is ISA +5. Relative density is about 0.52, so 200 / 0.723 = 277 kt, less a few knots of compressibility correction: about 273 kt.", status='CORRECTED', note="Scan key read as c (239 kt); worked as about 273 kt."),
 5: dict(ans='c', exp=LSS + " At sea level ISA (288.15 K): 38.94 x 16.98 = 661 kt."),
 6: dict(ans='c', exp=LSS + " At -40 C (233.15 K): 38.94 x 15.27 = 595 kt, nearest 596 kt."),
 7: dict(ans='b', exp=LSS + " At FL290 ISA is -42.4 C, so ISA -6 is -48.4 C (224.75 K): 38.94 x 14.99 = 584 kt, nearest 583 kt."),
 8: dict(ans='a', exp="Mach number follows from CAS and pressure altitude alone. At FL310 (static pressure 287 hPa), 280 kt CAS gives an impact pressure of about 133 hPa, which corresponds to Mach 0.76. The temperature is not needed."),
 9: dict(ans='c', exp=LSS + " At 23 C (296.15 K): 38.94 x 17.21 = 670 kt, nearest 671 kt."),
 10: dict(ans='c', exp=LSS + " 0.1 M = 57 kt, so the speed of sound is 570 kt and T = (570 / 38.94)^2 = 214.3 K = -58.9 C. ISA at FL650 is -56.5 C, so the deviation is about -2.5."),
 11: dict(ans='a', exp=LSS + " LSS = 500 / 0.86 = 581 kt, so T = (581 / 38.94)^2 = 222.9 K = -50.2 C. ISA at FL290 is -42.4 C, so the deviation is about -8."),
 12: dict(ans='b', exp=LSS + " LSS = 93 / 0.15 = 620 kt, so T = (620 / 38.94)^2 = 253.5 K = -19.6 C. At ISA +9 the ISA temperature is -28.6 C, which is at (15 + 28.6) / 1.98 = 22,000 ft: FL220."),
 13: dict(ans='c', exp=LSS + " At -56.5 C (216.65 K) LSS = 573 kt, so TAS = 0.85 x 573 = 487 kt, nearest 485 kt."),
 14: dict(drop="Repeats the first step of the next question."),
 15: dict(ans='a', exp=LSS + " LSS = 93 / 0.15 = 620 kt, so T = -19.6 C. At ISA +5 the ISA temperature is -24.6 C, at (15 + 24.6) / 1.98 = 20,000 ft: FL200."),
})
