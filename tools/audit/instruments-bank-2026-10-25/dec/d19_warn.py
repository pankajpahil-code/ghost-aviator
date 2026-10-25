REP = "Repeats another question in this book in substance; one copy kept."
GAR = "Question or options are garbled in the source text."
AMB = "References differ on the intended answer; not safe to key."
JAR = "Tests a European (JAR-OPS) recorder or certification rule; the Indian requirement has not been checked against a DGCA CAR, so it is not published."
GPWS = "GPWS modes: 1 excessive descent rate; 2 excessive terrain closure rate; 3 altitude loss after take-off or go-around; 4 unsafe terrain clearance when not in landing configuration (gear or flap); 5 excessive deviation below the glideslope; plus altitude call-outs (and windshear on later systems). It works on radio altimeter height, roughly between 50 ft and 2450 ft."
SW = "A basic stall warning senses angle of attack (alpha). Large aircraft add configuration inputs (flap, slat and gear position) and a stick shaker."
ALT = "The altitude alerting system warns the crew when approaching the selected altitude and when deviating from it after capture."
SECS = {'WARN/REC': ({}, {
 1: dict(drop=JAR), 2: dict(drop=JAR), 3: dict(drop=REP), 4: dict(drop=JAR),
 5: dict(ans='d', exp=GPWS),
 6: dict(drop=JAR), 7: dict(drop=JAR), 8: dict(drop=AMB),
 9: dict(drop=REP), 10: dict(drop=JAR), 11: dict(drop=AMB), 12: dict(drop=JAR), 13: dict(drop=JAR),
 14: dict(ans='c', exp=GPWS + " So incorrect flap position (2), glideslope deviation (5), altitude loss after take-off or go-around (6) and excessive sink rate (7)."),
 15: dict(ans='c', exp=GPWS + " Everything listed except excessive bank angle."),
 16: dict(drop=JAR), 18: dict(drop=GAR), 19: dict(drop=AMB), 20: dict(drop=JAR), 21: dict(drop=JAR),
 22: dict(ans='b', exp=ALT),
 23: dict(drop=REP), 24: dict(drop=JAR),
 25: dict(ans='d', exp="An excessive descent rate (mode 1) gives 'SINK RATE', followed by 'WHOOP WHOOP PULL UP' if it continues."),
 26: dict(drop=JAR), 27: dict(drop=REP), 28: dict(drop=GAR),
 30: dict(ans='b', exp="GPWS takes its height above the ground from the radio altimeter."),
 31: dict(ans='b', exp=ALT + " On a typical installation a deviation of more than 300 ft from the selected altitude makes the amber altitude alert lights flash, with an aural tone."),
 32: dict(drop=REP),
 33: dict(ans='a', exp=SW + " So the inputs are alpha (1) and configuration (2)."),
 34: dict(ans='c', exp=SW + " The components are angle of attack sensors (1), the stick shaker (4) and gear and flap sensors (5)."),
 35: dict(drop=REP),
 36: dict(ans='a', exp=GPWS + " Excessive bank angle is not a basic GPWS mode."),
 38: dict(drop=JAR),
 40: dict(ans='d', opt={'c': '1, 5.'}, note="Options b and c were identical in the source; c replaced with a distinct wrong combination.", exp=ALT + " So at least deviation from (4) and approach to (5) the selected altitude."),
 41: dict(drop=GAR), 42: dict(drop=REP), 43: dict(drop=JAR), 44: dict(drop=JAR),
 45: dict(ans='d', exp=SW),
 46: dict(drop=JAR), 47: dict(drop=JAR), 48: dict(drop=REP), 49: dict(drop=JAR), 50: dict(drop=JAR),
})}
