SYM = "Needs the chart-symbol sheet the source refers to ('page 58'); the site cannot show it, so the question is unanswerable as published."
LINE = "Asks the student to pick a chart line style drawn in text characters; the symbols do not survive reliably as text and need the figure."
CH = {3: 'nav-15', 21: 'nav-24', 25: 'nav-23', 50: 'nav-26'}
D = {
 3: dict(ans='b', exp="Variation is named for where magnetic north lies relative to true north. Easterly (positive) variation means magnetic north is east of true north, which is the same as saying true north is west of magnetic north."),
 21: dict(ans='a', exp="A rhumb line cuts every meridian at the same angle. On a direct Mercator the meridians are parallel straight lines, so a rhumb line is a straight line."),
 22: dict(ans='c', exp="On a Lambert chart the meridians are drawn as straight lines converging toward the pole, so a meridian is perfectly straight. A great circle is only approximately straight, parallels are arcs and rhumb lines are curves."),
 23: dict(ans='d', exp="On a direct Mercator the meridians are spread apart to stay parallel, by a factor of sec(latitude), and the north-south scale is stretched by the same factor to keep the chart conformal. Scale therefore expands with the secant of the latitude."),
 25: dict(ans='b', status='CORRECTED', exp="A transverse Mercator touches the earth along its datum meridian. Its chart convergency matches earth convergency only at the poles and at the equator, not elsewhere, so the answer is the Equator and Poles.", note="Captain's ruling 2026-10-24: follow the reference book (convergency correct at the Poles and the Equator). The source book keyed a."),
 30: dict(drop=LINE), 31: dict(drop="Options a to c are blank in the source."), 32: dict(drop=LINE),
 33: dict(drop=SYM), 34: dict(drop=SYM), 35: dict(drop=SYM), 36: dict(drop=SYM), 37: dict(drop=SYM), 38: dict(drop=SYM),
 40: dict(drop=SYM), 41: dict(drop=SYM), 42: dict(drop=SYM), 43: dict(drop=SYM), 44: dict(drop=SYM), 45: dict(drop=SYM),
 46: dict(drop=SYM), 47: dict(drop=SYM),
 50: dict(ans='b', opt={'a': "Lambert's Conformal."}, exp="Near the poles a polar stereographic chart is conformal, its meridians are straight lines from the pole, great circles are almost straight and scale varies least there. It is the standard choice for polar navigation."),
}
