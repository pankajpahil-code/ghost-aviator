from pathlib import Path
import math, html, re, json, hashlib

INK='#17304d'; BLUE='#1d5eb1'; TEAL='#087e8b'; LIGHT='#edf4fc'; GOLD='#a35c00'; AMBER='#f4bb43'

def text(x,y,s,size=25,fill=INK,anchor='middle',weight=400):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}">{html.escape(str(s))}</text>'
def line(x1,y1,x2,y2,color=INK,width=3,dash=None):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>'
def arrow(x1,y1,x2,y2,color=BLUE,both=False):
    return f'<path d="M{x1} {y1} L{x2} {y2}" fill="none" stroke="{color}" stroke-width="3" marker-end="url(#arrow)"'+(' marker-start="url(#back)"' if both else '')+'/>'
def rect(x,y,w,h,fill=LIGHT,stroke=BLUE,radius=14):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
def circle(x,y,r,fill='none',stroke=INK,width=3):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
def card(x,y,w,h,labels,fill=LIGHT,color=BLUE,size=26):
    out=rect(x,y,w,h,fill,color)
    if isinstance(labels,str):labels=[labels]
    first=y+h/2-(len(labels)-1)*18+9
    return out+''.join(text(x+w/2,first+i*36,s,size) for i,s in enumerate(labels))
def rows(labels,x=65,y=55,w=770,h=66,gap=15):
    return ''.join(card(x,y+i*(h+gap),w,h,label) for i,label in enumerate(labels))
def flow(labels,notes=None):
    out=''; n=len(labels); w=(800-(n-1)*40)/n
    for i,label in enumerate(labels):
        x=50+i*(w+40);out+=card(x,95,w,105,label,size=25)
        if i<n-1:out+=arrow(x+w+5,147,x+w+34,147)
    if notes:
        for i,note in enumerate(notes):out+=text(450,275+i*40,note,25)
    return out
def panel_readout(left,right,footer):
    out=rect(70,45,760,265,'#f4f8fc',INK)
    out+=card(100,82,330,145,left,size=28)+card(470,82,330,145,right,size=28)
    return out+text(450,275,footer,25)
def nodes(inputs,center,outputs,bidirectional_first=False):
    out=''; left=50; right=610; h=65; gap=18
    for i,label in enumerate(inputs):
        y=42+i*(h+gap);out+=card(left,y,240,h,label,size=24)+arrow(295,y+h/2,350,200)
    out+=card(355,145,190,110,center,size=27)
    for i,label in enumerate(outputs):
        y=42+i*(h+gap);out+=card(right,y,240,h,label,size=24)+arrow(550,200,605,y+h/2,both=(bidirectional_first and i==0))
    return out
def heading_dial(mode,expanded=False,weather=False):
    cx,cy=450,245;r0=165;out=''
    if expanded:
        out+=f'<path d="M185 300 Q450 -20 715 300" fill="none" stroke="{INK}" stroke-width="3"/>'
        for t,x in [('120',320),('150',450),('180',580)]:out+=text(x,128,t,24)
        out+=text(450,390,'Expanded arc • heading up',25)
    else:
        out+=circle(cx,cy,r0)
        for a,label in [(0,'N'),(90,'E'),(180,'S'),(270,'W')]:
            th=math.radians(a-90);out+=text(cx+140*math.cos(th),cy+140*math.sin(th)+8,label,25)
        out+=text(450,450,'Full compass rose',25)
    out+=f'<path d="M450 200 L435 270 L450 258 L465 270 Z" fill="{INK}"/>'
    out+=line(410,155,410,335,'#a12b79',5)+line(485,155,485,335,'#a12b79',3)
    out+=text(120,70,mode+' mode',29,anchor='start',weight=600)
    out+=text(760,225,'Course',23)+text(760,258,'deviation',23)
    out+=arrow(680,244,500,244)
    if mode=='ILS':
        out+=line(730,300,730,390)+f'<path d="M715 335 L730 321 L745 335 L730 349 Z" fill="#a12b79"/>'
        out+=text(735,425,'Glide slope',23)
    else:out+=text(155,330,'TO / FROM',23)+text(155,365,'indication',23)
    if weather:
        out+=f'<path d="M240 165 Q265 130 305 165 Q330 195 280 220 Q235 210 240 165" fill="#d4d63c" stroke="{GOLD}"/>'
        out+=text(160,455,'Weather overlay available',23,anchor='start')
    return out
def attitude(radio='RADIO 200',failure=False):
    out=rect(245,55,410,370,'#132334',INK)
    out+=f'<path d="M275 110 H625 V235 H275 Z" fill="#3299b8"/><path d="M275 235 H625 V360 H275 Z" fill="#9c813a"/>'
    out+=line(280,235,620,235,'white',3)
    for y,label in [(155,'20'),(195,'10'),(275,'10'),(315,'20')]:
        out+=line(390,y,510,y,'white',2)+text(540,y+8,label,21,'white')
    out+=line(355,235,430,235,'#f6d452',6)+line(470,235,545,235,'#f6d452',6)+line(450,220,450,250,'#f6d452',5)
    out+=text(450,95,'ATTITUDE',24,'white')+text(450,397,radio,28,'#73d68b')
    out+=card(60,155,145,85,['Airspeed','kt'],size=24)+card(695,155,145,85,['Altitude','ft'],size=24)
    if failure:
        out+=card(45,310,150,65,'SPD',fill='#fff6df',color=GOLD)+card(700,310,150,65,'RA',fill='#fff6df',color=GOLD)
        out+=card(700,395,150,65,'GS',fill='#fff6df',color=GOLD)+card(375,445,150,65,'LOC',fill='#fff6df',color=GOLD)
    return out

art={}
def put(number,caption,body,height=400):art[number]=(caption,body,height)
put('18.1','Information available from an INS',nodes(['Accelerometers','Gyroscopes','Initial position'],['INS','computing'],['Position / velocity','Track / heading','Distance / time','Wind information']),410)
put('18.3','Accelerometer principle',rect(90,100,720,155,'#f4f8fc',INK)+line(110,180,250,180)+f'<path d="M250 180 l15 -28 l30 56 l30 -56 l30 56 l30 -56 l15 28" fill="none" stroke="{BLUE}" stroke-width="4"/>'+card(400,135,150,90,'Mass')+line(550,180,760,180)+text(260,300,'Spring / restoring force',25)+text(650,300,'Displacement sensing',25)+arrow(160,65,360,65)+text(590,73,'Aircraft acceleration',26)+text(450,365,'Measured specific force → electrical signal',26),410)
put('18.5','First integration: acceleration to velocity',flow([['Acceleration','N/S and E/W'],['Integrate','over time'],['Velocity','N/S and E/W']],['The velocity components give ground speed and track.']),350)
put('18.6','Second integration: velocity to position',flow([['Velocity','components'],['Integrate','over time'],['Distance','components']],['North/south distance → change of latitude','East/west departure + latitude → change of longitude','Add the changes to the initial position.']),420)
put('18.7','Stabilised INS platform and sensors',card(240,145,420,130,['Mechanically stabilised','platform'],size=30)+card(40,35,330,75,'N/S accelerometer')+card(530,35,330,75,'E/W accelerometer')+arrow(205,115,320,140)+arrow(695,115,580,140)+card(60,330,210,80,'Pitch gyro')+card(345,330,210,80,'Roll gyro')+card(630,330,210,80,'Azimuth gyro')+arrow(165,325,320,280)+arrow(450,325,450,280)+arrow(735,325,580,280),460)
put('18.8','INS present-position information',panel_readout(['Latitude','N / S'],['Longitude','E / W'],'Present position combines an initial fix with measured motion.'),350)
put('18.9','Gravity contamination when a platform is tilted',line(180,280,660,280,'#94a3b8',2,'9 8')+line(230,295,640,160,BLUE,7)+arrow(450,220,450,380)+text(500,365,'Gravity',26,anchor='start')+arrow(300,270,570,180)+text(430,110,'Tilted accelerometer axis',28)+text(450,445,'A gravity component along the axis creates a false acceleration signal.',24)+text(450,485,'Levelling and feedback keep the platform horizontal.',24),530)
put('18.10','Rate-integrating gyroscope: sensing rotation',circle(210,220,110,fill=LIGHT,stroke=BLUE)+circle(210,220,58)+line(110,220,310,220)+text(210,390,'Gyroscope',28)+card(420,70,390,90,['Input angular rate'])+arrow(615,165,615,225)+card(420,230,390,90,['Integrating response'])+arrow(615,325,615,385)+card(420,390,390,90,['Output angular displacement'],size=24),530)
put('18.11','INS platform: sensors and stabilisation loop',card(55,140,235,100,['Gyroscopes','sense rotation'])+arrow(295,190,350,190)+card(355,140,190,100,['Servo','correction'])+arrow(550,190,605,190)+card(610,140,235,100,['Stabilised','platform'])+f'<path d="M730 245 V320 H170 V245" fill="none" stroke="{BLUE}" stroke-width="3" marker-end="url(#arrow)"/>'+text(450,365,'Accelerometers on the platform measure horizontal motion.',25),410)
put('18.12','Earth orientation: latitude and changing local vertical',circle(330,220,155,fill=LIGHT,stroke=BLUE)+line(145,220,515,220,'#9bb4d5',2,'7 6')+line(330,45,330,395,'#9bb4d5',2,'7 6')+line(330,220,440,110)+arrow(440,110,505,45)+text(585,70,'Local vertical',26)+text(330,430,'Earth',27)+card(570,170,275,150,['Earth rotation','and aircraft motion','require compensation'],size=24),475)
put('18.15','Schuler tuning: the approximately 84.4-minute period',circle(270,265,140,fill=LIGHT,stroke=BLUE)+line(270,125,270,265)+circle(270,265,13,fill=INK)+text(270,80,'Earth-radius pendulum model',25)+text(450,460,'Ideal Schuler period ≈ 84.4 minutes',31,weight=600)+card(510,155,330,150,['INS levelling loop','tuned to this period'],size=27),510)
put('18.16','INS mode selector: functions',rows([['OFF • power off'],['STBY • initial position entry'],['ALIGN • level and align'],['NAV • navigation computation'],['ATT REF • attitude reference']])+text(450,510,'Annunciators include READY NAV and battery warning.',25),555)
put('18.17','INS control and display unit: controls',card(185,40,530,115,['Numerical displays','Position / navigation data'],size=29)+card(55,215,240,110,['Display','selector'])+card(330,215,240,110,['Waypoint','selector'])+card(605,215,240,110,['Data-entry','keyboard'])+card(100,385,300,85,'INSERT / HOLD')+card(500,385,300,85,'Track-change control')+arrow(175,210,330,160)+arrow(450,210,450,160)+arrow(725,210,570,160),520)
put('18.18','TK/GS display: track and ground speed',panel_readout(['TK','Track in degrees true'],['GS','Ground speed in knots'],'Track is the direction of motion over the ground.'),350)
put('18.19','HDG/DA display: heading and drift angle',panel_readout(['HDG','Aircraft heading'],['DA','Left / right drift angle'],'Heading describes the nose direction; drift relates heading to track.'),350)
put('18.20','XTK/TKE: displacement versus angular error',line(55,145,425,145,BLUE,4)+text(240,95,'Desired track',26)+circle(230,300,9,fill=TEAL)+arrow(230,290,230,155,GOLD,both=True)+text(125,230,'XTK',28,GOLD)+text(240,365,'Distance from the track',25)+arrow(560,300,820,300)+arrow(560,300,785,155,TEAL)+text(730,345,'Desired direction',22)+text(695,110,'Actual track direction',22)+text(710,245,'TKE',28,TEAL)+text(690,405,'Angle between directions',25),465)
put('18.21','POS display: present latitude and longitude',panel_readout(['Present latitude','N / S'],['Present longitude','E / W'],'POS refers to the aircraft’s computed present position.'),350)
put('18.22','WPT display: stored waypoint coordinates',panel_readout(['Waypoint latitude','N / S'],['Waypoint longitude','E / W'],'WPT refers to the selected stored waypoint, not present position.'),350)
put('18.24','DIS/TIME display: distance and time',panel_readout(['DIS','Distance to waypoint'],['TIME','Time to waypoint'],'The selected leg / waypoint determines the displayed destination.'),350)
put('18.25','WIND display: wind direction and speed',panel_readout(['Wind direction','Degrees true'],['Wind speed','Knots'],'Computed from the aircraft’s air and ground motion.'),350)
put('18.26','DSR TK/STS display: desired track and status',panel_readout(['DSR TK','Desired track'],['STS','System status code'],'Read the desired track and system status in this selector position.'),350)
put('18.27','TEST display: checking illuminated segments',rect(100,60,700,190,'#132334',INK)+text(450,185,'888888   888888',58,'#eae593')+text(450,320,'The test illuminates display segments to reveal failed elements.',25)+text(450,365,'A segment test does not establish navigation accuracy.',25),410)
put('19.1','Inertial reference unit: strap-down sensors and computing',rect(70,45,760,285)+text(450,88,'Inertial reference unit',30,weight=600)+card(110,115,300,145,['Three gyroscopes','Three accelerometers'],fill='white',size=26)+arrow(415,185,475,185)+card(480,115,300,145,['Digital','computation'],fill='white',size=26)+text(450,390,'Sensors are fixed to the airframe; attitude is computed.',27),435)
put('19.2','Ring laser gyro: counter-propagating light',f'<path d="M200 310 L450 65 L700 310 Z" fill="{LIGHT}" stroke="{BLUE}" stroke-width="4"/>'+f'<path d="M240 310 L450 105 L660 310" fill="none" stroke="{TEAL}" stroke-width="4" marker-end="url(#arrow)"/>'+f'<path d="M620 280 L450 145 L280 280" fill="none" stroke="#a12b79" stroke-width="4" marker-end="url(#arrow)"/>'+text(450,380,'Light travels around the same ring in opposite directions.',26)+text(450,430,'Rotation produces a measurable frequency difference.',26),480)
put('20.1','FMCW radio altimeter: delay and beat frequency',line(90,330,800,330)+line(90,330,90,55)+text(75,35,'Frequency',25,anchor='start')+text(800,375,'Time',25)+f'<path d="M100 300 L310 95 L310 300 L520 95 L520 300 L730 95" fill="none" stroke="{BLUE}" stroke-width="4"/>'+f'<path d="M145 300 L355 95 L355 300 L565 95 L565 300 L775 95" fill="none" stroke="{TEAL}" stroke-width="4" stroke-dasharray="9 6"/>'+text(450,425,'Blue: transmitted sweep • Teal: delayed received sweep',24)+text(450,470,'For a fixed sweep rate, beat frequency increases with height.',24),515)
put('20.2','Radio-altimeter indicator: principal controls',circle(320,220,145,fill='#132334',stroke=INK)+text(320,160,'RAD ALT',27,'white')+text(320,230,'500 ft',48,'white')+text(320,290,'DH selector',24,'#f6d452')+card(560,70,280,85,['Height above','terrain'],size=25)+card(560,190,280,85,['Failure / low-height','warning'],size=25)+card(560,310,280,85,['Press to test /','height selection'],size=25)+arrow(555,113,455,160)+arrow(555,232,465,232)+arrow(555,352,420,325),450)
put('20.3','EFIS radio altitude: Boeing-style teaching example',attitude()+text(450,485,'Radio altitude is distinct from the barometric altitude scale.',25),535)
put('20.4-20.5','Boeing-style radio altitude: approach to decision height',card(55,60,365,240,['Below 1000 ft','White radio-altitude scale','Magenta DH marker'],size=25)+card(480,60,365,240,['At selected DH','Amber / yellow alert','Scale and marker flash'],fill='#fff7e4',color=GOLD,size=25)+arrow(425,180,475,180)+text(450,375,'Illustrative presentation states; details vary by installation.',24),420)
put('20.6','Airbus-style radio-altitude colour change',rect(55,65,365,230)+text(237,115,'Above decision height',25)+text(237,160,'Radio altitude at PFD base',24)+text(237,255,'200',52,'#00844c')+rect(480,65,365,230,'#fff7e4',GOLD)+text(662,115,'Below decision height',25)+text(662,160,'Larger amber numerals',24)+text(662,262,'80',64,GOLD)+text(450,355,'Example: selected decision height 100 ft.',25)+text(450,400,'The illustrated system provides configured height callouts.',24),450)
put('20.7','Radio-altimeter installation: residual height at touchdown',line(80,345,820,345,'#50724f',5)+text(780,390,'Ground',26)+f'<path d="M160 180 Q145 165 185 160 H520 L615 105 H660 L630 160 L730 175 Q760 185 730 195 H225 L150 220 H110 L160 185 Z" fill="{LIGHT}" stroke="{INK}" stroke-width="3"/>'+line(340,185,325,320,INK,6)+circle(325,330,15,fill=INK)+line(615,185,630,320,INK,6)+circle(630,330,15,fill=INK)+circle(450,190,7,fill=TEAL)+arrow(450,205,450,335,TEAL,both=True)+text(625,270,'Antenna height',26)+text(625,307,'with wheels on ground',23)+text(450,455,'Installation compensation allows a zero indication at touchdown.',24),500)
put('21.1','FMS: inputs, computing and guidance',nodes(['Air data','Inertial / GPS data','Navigation database'],['FMC','Computing'],['Control/display unit','Flight guidance','Autothrottle'],True)+text(450,405,'The CDU provides the pilot’s data-entry and display interface.',25),450)
put('21.2','FMS CDU: display, line-select keys and keypad',rect(240,35,420,440,'#e8eef6',INK)+rect(290,65,320,175,'#132334',INK)+text(450,115,'ROUTE / PERFORMANCE',22,'white')+text(450,165,'Data fields and prompts',23,'white')+text(450,210,'Scratchpad',22,'#80d2d4')+''.join(rect(x,85+i*35,23,18,'white',INK,3) for x in [255,622] for i in range(4))+card(275,270,350,55,'Function / page keys',size=23)+card(275,345,350,100,['Alphanumeric keypad','Data entry'],size=24)+text(105,145,'Line-select',23)+text(105,180,'keys',23)+arrow(180,155,250,155)+text(760,395,'Keyboard',24)+arrow(690,390,630,390),520)
put('22.1','Multi-crew EFIS: signal generation and displays',card(330,35,240,85,['Aircraft / navigation','sensor inputs'],size=24)+arrow(385,125,235,195)+arrow(515,125,665,195)+card(70,200,330,85,['Captain’s','symbol generator'],size=26)+card(500,200,330,85,['First officer’s','symbol generator'],size=26)+arrow(235,290,235,345)+arrow(665,290,665,345)+card(70,350,330,95,['EADI + EHSI','Flight and navigation displays'],size=23)+card(500,350,330,95,['EADI + EHSI','Flight and navigation displays'],size=23),490)
put('22.2','EFIS control panel: typical selections',rows([['RANGE • navigation display range'],['MODE • VOR / ILS / MAP / PLAN'],['BRT • display brightness'],['MAP • navigation aids / airports / route data / waypoints'],['WXR • weather-radar display'],['EXP ARC • expanded VOR / ILS presentation']],x=40,w=820,h=60,gap=14),530)
put('22.3','EFIS attitude-display elements: illustrative layout',attitude()+text(450,485,'Attitude, airspeed, altitude and radio-height information',25),535)
put('22.4','Radio altitude below 1000 ft and at decision height',card(55,60,365,240,['Below 1000 ft','White circular scale','Magenta DH reference'],size=25)+card(480,60,365,240,['At decision height','Amber / yellow alert','Flashing DH reference'],fill='#fff7e4',color=GOLD,size=25)+arrow(425,180,475,180)+text(450,375,'Both states refer to radio height above the surface.',25),420)
put('22.6','EHSI full VOR mode',heading_dial('VOR'),495)
put('22.7','EHSI expanded VOR mode',heading_dial('VOR',True,True),505)
put('22.8','EHSI full ILS mode',heading_dial('ILS'),495)
put('22.9','EHSI expanded ILS mode',heading_dial('ILS',True,True),505)
route=f'<path d="M290 365 L420 255 L610 160 L560 70" fill="none" stroke="#a12b79" stroke-width="4"/>'
for x,y,s in [(290,365,'A'),(420,255,'B'),(610,160,'C'),(560,70,'D')]:route+=f'<path d="M{x} {y-10} L{x+10} {y} L{x} {y+10} L{x-10} {y} Z" fill="white" stroke="#a12b79" stroke-width="3"/>'+text(x+28,y+6,s,23)
put('22.10','EHSI MAP mode: route and selected map data',route+f'<path d="M450 375 L435 410 L450 400 L465 410 Z" fill="{INK}"/>'+card(55,65,265,140,['Route / waypoints','Selected map data','Weather overlay'],size=24)+text(450,470,'Moving-map navigation presentation',27),520)
put('22.11','EHSI PLAN mode: north-up route review',route+arrow(760,180,760,75)+text(760,50,'N',30)+text(450,470,'North-up route review • weather radar not displayed',25),520)
put('22.12','EFIS failure indications: example flags',attitude(radio='',failure=True)+text(450,555,'SPD: speed computer • RA: radio altimeter',25)+text(450,595,'GS: glide-slope signal • LOC: localizer signal',25),645)
put('23.1','Digital computer: processing, memory and buses',card(50,170,210,100,['Input','devices'])+arrow(265,220,335,220)+card(340,145,220,150,['CPU','ALU / registers','Control unit'],size=25)+arrow(565,220,635,220)+card(640,170,210,100,['Output','devices'])+card(340,25,220,75,'Memory')+arrow(450,105,450,140,both=True)+text(450,370,'Data bus: values • Address bus: location • Control bus: commands',23),420)


if __name__ == '__main__':
    import sys
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python tools/diagrams/instruments.py REVIEW_OUTPUT_FOLDER')
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    for number, (title, body, height) in art.items():
        svg=(f'<svg xmlns="http://www.w3.org/2000/svg" width="900" height="{height}" viewBox="0 0 900 {height}" role="img" aria-labelledby="title desc">'
             f'<title id="title">{html.escape(title)}</title><desc id="desc">Original teaching schematic for this lesson; the image simplifies the illustrated system.</desc>'
             '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#1d5eb1"/></marker>'
             '<marker id="back" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#1d5eb1"/></marker></defs>'
             f'<rect width="900" height="{height}" fill="white"/><g font-family="Arial, sans-serif">{body}</g></svg>')
        dest = out / ('lesson-' + number.replace('.', '-') + '.svg')
        dest.write_text(svg, encoding='utf-8')
    print(f'Wrote {len(art)} original diagrams to {out}. Visually review them before changing the published assets or integrity record.')
