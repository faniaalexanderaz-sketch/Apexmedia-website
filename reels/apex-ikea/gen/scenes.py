# apex-ikea: "Entri da IKEA per comprare una lampadina. Ed esci con 200 euro di roba. Non è colpa tua. È colpa del pavimento."
# Classic Apex marketing reel: the one-way store layout and the IKEA effect, a one-word comment question, the lesson for whoever
# runs a shop, the keyword (PERCORSO) and a loop line. Brand named in plain text only, no logo.
# Facts: Alan Penn (professor of architecture, University College London) studied IKEA's layout and said about 60% of what people
# buy there was not on their list; the arrows on the floor lead along one route through every department.
# Norton, Mochon & Ariely (2012, Journal of Consumer Psychology): people value things more when they assemble them ("IKEA effect").
# The 200 euro in the hook is an example, not a statistic.
import sys
sys.path.insert(0, '.'); sys.path.insert(0, '../../apex-kit')
from kit import *
from ui import *
from times import T
BED = 0.07; ROOT = '#0058a3'
IB = '#0058a3'; IY = '#ffdb00'; INK = '#111111'; GREY = '#6e6e73'; RED = '#e30000'; GRN = '#1d8a3c'
THEME = f'''
    .st.ikb {{ background: {IB}; color: #fff; }}
    .st.iky {{ background: {IY}; color: {INK}; }}
    .ikb .mq {{ -webkit-text-stroke: 4px rgba(255,255,255,0.13); }}
    .ikb .bgfx i:nth-child(1) {{ background: radial-gradient(closest-side, rgba(255,219,0,0.22), rgba(255,219,0,0)); }}
    .ikb .bgfx i:nth-child(2) {{ background: radial-gradient(closest-side, rgba(0,0,0,0.25), rgba(0,0,0,0)); }}
    .iky .bgfx i:nth-child(1) {{ background: radial-gradient(closest-side, rgba(255,255,255,0.45), rgba(255,255,255,0)); }}
    .iky .bgfx i:nth-child(2) {{ background: radial-gradient(closest-side, rgba(0,88,163,0.18), rgba(0,88,163,0)); }}
    .tg {{ position: absolute; padding: 20px 38px; border-radius: 22px; background: #fff; color: {INK}; font: 700 50px/1 "SF Pro Display"; letter-spacing: -0.02em; white-space: nowrap; box-shadow: 0 24px 60px -20px rgba(0,0,0,0.35); }}
    .ck {{ display: inline-block; width: 54px; height: 54px; border-radius: 12px; border: 6px solid {INK}; vertical-align: -8px; margin-right: 22px; box-sizing: border-box; }}
'''
R = Reel(T, THEME, grounds={'blue': (' ikb', IB), 'yellow': (' iky', IY)})
add = R.add
BULB = (f'<svg viewBox="0 0 200 300" width="200" height="300"><circle cx="100" cy="100" r="86" fill="{IY}"/>'
        f'<path d="M62 160 Q100 200 138 160 L132 210 H68 Z" fill="{IY}"/><rect x="66" y="214" width="68" height="22" rx="8" fill="#c7c7cc"/>'
        f'<rect x="70" y="240" width="60" height="20" rx="8" fill="#aeaeb2"/><rect x="82" y="264" width="36" height="16" rx="8" fill="#8e8e93"/>'
        f'<path d="M80 150 L92 110 L108 110 L120 150" fill="none" stroke="#d4a900" stroke-width="7" stroke-linejoin="round"/></svg>')

# ================================================================ HOOK
HOOK = (f'<div id="@-t" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:250px;text-align:center;font:800 190px/1 {SF};letter-spacing:-0.04em;color:#fff">IKEA</div>'
        f'<div id="@-glow" data-layout-allow-overlap style="position:absolute;left:640px;top:640px;width:420px;height:420px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,219,0,0.55),rgba(255,219,0,0))"></div>'
        f'<div class="card" id="@-l" data-layout-allow-overlap style="left:110px;top:620px;width:620px;height:520px;border-radius:36px;transform:rotate(-4deg)">'
        f'<div style="position:absolute;left:56px;top:56px;font:600 40px/1 {SF};color:{GREY}">Lista della spesa</div>'
        f'<div style="position:absolute;left:56px;top:150px;font:700 72px/1 {SF};letter-spacing:-0.03em;color:{INK}"><span class="ck"></span>1 lampadina</div>'
        f'<div style="position:absolute;left:56px;right:56px;top:280px;height:5px;background:#e5e5ea"></div><div style="position:absolute;left:56px;right:56px;top:380px;height:5px;background:#e5e5ea"></div></div>'
        f'<div id="@-b" data-layout-allow-overlap style="position:absolute;left:750px;top:700px;transform:rotate(12deg)">{BULB}</div>')
# 1. "Entri da IKEA per comprare una lampadina."
add('i01', 'start', 'ed', f'''      {HOOK.replace('@', 'a')}''', '''    tl.fromTo("#a-t", { scale: 1.08 }, { scale: 1, duration: 0.5, ease: "expo.out" }, 0);
    tl.fromTo("#a-l", { rotation: -4, y: 0 }, { rotation: -2, y: -20, duration: DUR, ease: "sine.inOut" }, 0);
    tl.fromTo("#a-b", { rotation: 12 }, { rotation: 4, duration: DUR, ease: "sine.inOut" }, 0);
    tl.fromTo("#a-glow", { scale: 1 }, { scale: 1.25, duration: 0.3, yoyo: true, repeat: 1 }, «lampadina»);''', ground='blue', cam=False,
    fx=[('whoosh', 'start', 0.0, 0.3), ('pop', 'start', 0.05, 0.24), ('ding', 'lampadina', 0.0, 0.22)])

# 2. "Ed esci con 200 euro di roba." (things fly into the blue bag, the total climbs)
ITEMS = ['candele', 'cuscino', 'pianta', 'padella', 'cornice', 'tappeto']
items = ''.join(f'<div class="tg" id="b-i{k}" style="left:{[110, 560, 300, 640, 140, 470][k]}px;top:{[560, 600, 700, 760, 820, 880][k]}px">{n}</div>' for k, n in enumerate(ITEMS))
BAG = (f'<svg id="b-bag" viewBox="0 0 700 600" width="700" height="600" style="position:absolute;left:190px;top:1060px" data-layout-allow-overlap>'
       f'<path d="M190 150 Q190 20 350 20 Q510 20 510 150" fill="none" stroke="{IB}" stroke-width="34" stroke-linecap="round"/>'
       f'<path d="M60 150 H640 L590 580 H110 Z" fill="{IB}"/><path d="M60 150 H640 L630 230 H70 Z" fill="#004a8a"/></svg>')
add('i02', 'ed', 'non', f'''      {big('b-n', '<span id="b-v">0</span> €', 280, 230, INK)}
      {items}
      {BAG}''', '''    tl.fromTo("#b-bag", { y: 700 }, { y: 0, duration: 0.3, ease: "expo.out" }, 0.0);
    tl.fromTo("#b-i0, #b-i1, #b-i2, #b-i3, #b-i4, #b-i5", { y: -1100, opacity: 1, rotation: -12 }, { y: 0, rotation: 0, duration: 0.3, ease: "power3.in", stagger: 0.13 }, 0.05);
    tl.to("#b-i0, #b-i1, #b-i2, #b-i3, #b-i4, #b-i5", { y: 560, scale: 0.4, opacity: 0, duration: 0.28, ease: "power2.in", stagger: 0.06 }, 1.05);
    count(tl, "#b-v", 0, 200, 0.05, «duecento» - 0.1, function (v) { return String(Math.round(v)); }, "power1.in");
    punch(tl, "#b-n", «duecento», 1.15);
    shake(tl, "#b-bag", 1.4, 10);''',
    fx=[('swipe', 'ed', -0.1, 0.24), ('pop', 'ed', 0.2, 0.18), ('pop', 'ed', 0.33, 0.18), ('pop', 'ed', 0.46, 0.18), ('pop', 'ed', 0.59, 0.18),
        ('register', 'duecento', 0.0, 0.32), ('thud', 'duecento', 0.6, 0.26)])

# 3. "Non è colpa tua. È colpa del pavimento." (yellow arrows on the floor)
ARROW = f'<svg viewBox="0 0 200 240" width="200" height="240"><path d="M100 10 L190 120 H135 V230 H65 V120 H10 Z" fill="{IY}"/></svg>'
arrows = ''.join(f'<div class="fa" style="left:{1300}px;top:{k * 420 - 420}px">{ARROW}</div>' for k in range(11))
add('i03', 'non', 'resta', f'''      <div id="c-fl" data-layout-allow-overlap style="position:absolute;left:-860px;top:-2280px;width:2800px;height:4200px;background:linear-gradient(#8f8a81,#c2bdb4);transform:perspective(1100px) rotateX(47deg);transform-origin:50% 100%">
        <div id="c-ar" style="position:absolute;inset:0">{arrows}</div>
      </div>
      {small('c-a', 'non è colpa tua', 300, 70, GREY)}
      {big('c-b', 'è colpa del', 430, 110, INK)}
      {big('c-c', 'pavimento.', 560, 170, IB)}''', '''    tl.fromTo("#c-ar", { y: 0 }, { y: 420, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#c-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.22 }, 0.0);
    tl.fromTo("#c-b", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «pavimento» - 0.5);
    tl.fromTo("#c-c", { scale: 1.7, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, «pavimento» - 0.05);
    shake(tl, "#i03-cam", «pavimento» + 0.15, 16);''', '''
    .fa { position: absolute; }''', ground='grey', mq='PAVIMENTO',
    fx=[('swoosh', 'non', 0.0, 0.2), ('thud', 'pavimento', -0.05, 0.32)])

# 4. "Resta fino alla fine, perché lo stesso trucco lo puoi usare nel tuo negozio."
add('i04', 'resta', 'guarda', f'''      {small('d-a', 'resta fino', 420, 80, 'rgba(255,255,255,0.7)')}
      {big('d-b', 'alla <span style="color:{IY}">fine.</span>', 510, 170, '#fff')}
      {progress('d', 830, IY, dark=True)}
      <div class="chip" id="d-c" style="left:250px;top:1060px;background:{IY};color:{INK}">funziona nel tuo negozio</div>''', '''    blurIn(tl, "#d-b", 0.05, 0.24);
''' + progress_js('d', 0.15, 2.6) + '''    pop(tl, "#d-c", «trucco» + 0.2);''', ground='blue',
    fx=[('swoosh', 'resta', 0.15, 0.25), ('pop', 'trucco', 0.2, 0.22)])

# ================================================================ TRICK 1: THE ROUTE
ROOMS = [('Divani', 30, 40), ('Soggiorni', 30, 290), ('Cucine', 30, 540), ('Camere', 30, 790),
         ('Bambini', 330, 40), ('Bagni', 330, 290), ('Tessili', 330, 540), ('Cucina', 330, 790),
         ('Casse', 630, 40), ('Self-service', 630, 290), ('Piante', 630, 540), ('Luci', 630, 790)]
def floormap(p):
    rooms = ''.join(f'<rect x="{x}" y="{y}" width="240" height="230" rx="22" fill="{"#fff4b8" if n == "Casse" else "#ffffff"}" stroke="#c9d6e6" stroke-width="4"/>'
                    f'<text x="{x + 18}" y="{y + 46}" font-family="SF Pro Display" font-weight="700" font-size="28" fill="{IB}">{n}</text>' for n, x, y in ROOMS)
    route = 'M235 1090 V155 H535 V905 H835 V170'
    return (f'<svg viewBox="0 0 900 1100" width="900" height="1100" style="position:absolute;left:90px;top:520px" data-layout-allow-overlap>'
            f'<rect x="0" y="0" width="900" height="1100" rx="30" fill="#e8eef5"/>{rooms}'
            f'<path id="{p}-r0" d="{route}" fill="none" stroke="{INK}" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path id="{p}-r1" d="{route}" fill="none" stroke="{IY}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path id="{p}-hd" d="M795 230 L835 160 L875 230" fill="none" stroke="{INK}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/></svg>')
# 5. "Guarda le frecce per terra. Ti portano in un percorso unico che passa da tutte le stanze."
add('i05', 'guarda', 'uscite', f'''      {small('e-a', 'un solo percorso', 300, 76, IB)}
      {small('e-b', 'tutte le stanze', 400, 60, GREY)}
      {floormap('e')}''', '''    draw(tl, "#e-r0", 0.2, «stanze» - 0.3); draw(tl, "#e-r1", 0.2, «stanze» - 0.3);
    tl.fromTo("#e-hd", { opacity: 0 }, { opacity: 1, duration: 0.1 }, «stanze» - 0.1);
    tl.fromTo("#e-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, «percorso» - 0.2);
    tl.fromTo("#e-b", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, «stanze» - 0.3);''', ground='grey',
    fx=[('swipe', 'guarda', -0.1, 0.24), ('scan', 'frecce', 0.0, 0.16), ('tick', 'percorso', 0.0, 0.2), ('tick', 'stanze', -0.4, 0.2), ('ding', 'stanze', 0.0, 0.22)])

# 6. "Le uscite? Ci sono, ma non le vedi." (a green exit sign that blurs away)
add('i06', 'uscite', 'prof', f'''      {big('f-a', 'le uscite?', 330, 130, INK)}
      <div id="f-s" data-layout-allow-overlap style="position:absolute;left:190px;top:700px;width:700px;height:300px;border-radius:30px;background:#00843d;color:#fff;font:800 120px/300px {SF};text-align:center;box-shadow:0 0 120px rgba(0,200,90,0.45)">USCITA →</div>
      {big('f-b', 'ma non le vedi', 1160, 100, GREY)}''', '''    tl.fromTo("#f-a", { scale: 1.5, opacity: 0, filter: "blur(14px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }, 0.0);
    tl.fromTo("#f-s", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, 0.25);
    tl.to("#f-s", { filter: "blur(26px)", opacity: 0.18, scale: 0.92, duration: 0.45, ease: "power2.in" }, «vedi» - 0.35);
    tl.fromTo("#f-b", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.22 }, «vedi» - 0.25);''',
    fx=[('pop', 'uscite', 0.25, 0.24), ('glitch', 'vedi', -0.35, 0.22)])

# 7. "Un professore di architettura di Londra, Alan Penn, l'ha studiato."
add('i07', 'prof', 'secondo', f'''      <div class="card" id="g-c" style="left:110px;top:480px;width:860px;height:780px;border-radius:50px" data-layout-allow-overlap>
        <div style="position:absolute;left:330px;top:70px;width:200px;height:200px;border-radius:50%;background:{IB};color:#fff;font:700 84px/200px {SF};text-align:center">AP</div>
        <div id="g-n" style="position:absolute;left:0;right:0;top:320px;text-align:center;font:700 110px/1 {SF};letter-spacing:-0.04em;color:{INK}">Alan Penn</div>
        <div style="position:absolute;left:0;right:0;top:470px;text-align:center;font:600 50px/1.25 {SF};color:{GREY}">professore di architettura</div>
        <div id="g-u" style="position:absolute;left:0;right:0;top:590px;text-align:center;font:700 46px/1.25 {SF};color:{IB}">University College London</div>
      </div>''', '''    tl.fromTo("#g-c", { y: 1100, rotation: 6 }, { y: 0, rotation: 0, duration: 0.42, ease: "back.out(1.2)" }, 0.0);
    tl.fromTo("#g-u", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «londra» - 0.2);
    tl.fromTo("#g-n", { opacity: 0, scale: 1.3, filter: "blur(12px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, «penn» - 0.35);''', ground='blue', mq='LONDRA',
    fx=[('swipe', 'prof', 0.0, 0.26), ('pop', 'londra', -0.2, 0.2), ('ding', 'penn', -0.35, 0.22)])

# 8. "Secondo lui, il 60% di quello che compri da IKEA non era nella tua lista."
add('i08', 'secondo', 'candele', f'''      {small('h-a', 'secondo lui', 290, 66, 'rgba(255,255,255,0.7)')}
      <svg viewBox="0 0 1080 900" width="1080" height="900" style="position:absolute;left:0;top:450px" data-layout-allow-overlap>
        <circle cx="540" cy="450" r="300" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="56"/>
        <path id="h-ring" d="M540 150 A300 300 0 1 1 363.7 692.7" fill="none" stroke="{IY}" stroke-width="56" stroke-linecap="round"/>
      </svg>
      {big('h-n', '<span id="h-v">0</span>%', 780, 210, '#fff')}
      {big('h-b', 'non era nella <span style="color:{IY}">lista</span>', 1430, 90, '#fff')}''', '''    draw(tl, "#h-ring", «sessanta» - 0.5, 0.8);
    count(tl, "#h-v", 0, 60, «sessanta» - 0.5, 0.8, function (v) { return String(Math.round(v)); }, "power2.inOut");
    punch(tl, "#h-n", «sessanta» + 0.3, 1.12);
    tl.fromTo("#h-b", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.26, ease: "expo.out" }, «lista» - 0.85);''', ground='blue',
    fx=[('riser', 'sessanta', -0.7, 0.12), ('counter', 'sessanta', -0.5, 0.3), ('ding', 'sessanta', 0.3, 0.26), ('pop', 'lista', -0.85, 0.22)])

# 9. "Candele, cuscini, padelle, messi lungo la strada quando sei già stanco." (along the route, battery running low)
add('i09', 'candele', 'epoi', f'''      <svg viewBox="0 0 1080 300" width="1080" height="300" style="position:absolute;left:0;top:900px" data-layout-allow-overlap><path id="k-p" d="M-40 150 C 200 40, 400 260, 600 150 S 960 40, 1120 150" fill="none" stroke="{IY}" stroke-width="22" stroke-dasharray="44 30" stroke-linecap="round"/></svg>
      <div class="tg" id="k-0" style="left:90px;top:760px">candele</div>
      <div class="tg" id="k-1" style="left:400px;top:1080px">cuscini</div>
      <div class="tg" id="k-2" style="left:700px;top:760px">padelle</div>
      <div id="k-bt" data-layout-allow-overlap style="position:absolute;left:390px;top:380px;width:280px;height:140px;border-radius:30px;border:10px solid #fff;box-sizing:border-box;padding:10px">
        <div id="k-fill" style="width:80%;height:100%;border-radius:16px;background:#34c759"></div>
        <i style="position:absolute;right:-30px;top:40px;width:16px;height:44px;border-radius:0 8px 8px 0;background:#fff;display:block"></i></div>
      {big('k-s', 'già stanco', 1360, 120, '#fff')}''', '''    tl.fromTo("#k-p", { strokeDashoffset: 0 }, { strokeDashoffset: -370, duration: DUR, ease: "none" }, 0);
    pop(tl, "#k-0", 0.0); pop(tl, "#k-1", «cuscini» - 0.1); pop(tl, "#k-2", «padelle» - 0.1);
    tl.fromTo("#k-bt", { opacity: 0, y: -60 }, { opacity: 1, y: 0, duration: 0.24 }, «strada» - 0.6);
    tl.fromTo("#k-fill", { width: "80%", backgroundColor: "#34c759" }, { width: "12%", backgroundColor: "#ff3b30", duration: 1.1, ease: "power2.inOut" }, «strada» - 0.4);
    tl.fromTo("#k-s", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.24, ease: "expo.out" }, «stanco» - 0.45);''', ground='blue',
    fx=[('pop', 'candele', 0.0, 0.22), ('pop', 'cuscini', -0.1, 0.22), ('pop', 'padelle', -0.1, 0.22), ('notif', 'stanco', -0.45, 0.22)])

# ================================================================ TRICK 2: THE IKEA EFFECT
BOX = (f'<svg viewBox="0 0 600 460" width="600" height="460"><path d="M60 140 L300 60 L540 140 L300 220 Z" fill="#e2c08d"/>'
       f'<path d="M60 140 L300 220 V440 L60 360 Z" fill="#c9a46c"/><path d="M540 140 L300 220 V440 L540 360 Z" fill="#b58f57"/>'
       f'<path d="M180 100 L420 180" stroke="#a37c45" stroke-width="16"/></svg>')
KEY = f'<svg viewBox="0 0 260 120" width="260" height="120"><path d="M20 30 H200 Q236 30 236 66 V110" fill="none" stroke="#8e8e93" stroke-width="30" stroke-linecap="square" stroke-linejoin="round"/></svg>'
# 10. "E poi c'è il secondo trucco. A casa, i mobili li monti tu." (trick 2, the flat-pack box and the hex key)
add('i10', 'epoi', 'etre', f'''      {big('m-a', 'trucco n. 2', 760, 160, INK)}
      <div id="m-bx" data-layout-allow-overlap style="position:absolute;left:240px;top:820px;transform:scale(1.35);transform-origin:50% 0">{BOX}</div>
      <div id="m-k" data-layout-allow-overlap style="position:absolute;left:640px;top:650px;transform-origin:85% 50%">{KEY}</div>
      {big('m-b', 'li monti tu', 360, 140, IB)}''', '''    tl.fromTo("#m-a", { scale: 1.8, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, «secondo2» - 0.2);
    tl.to("#m-a", { y: -500, opacity: 0, duration: 0.3, ease: "power3.in" }, «casa» - 0.35);
    tl.fromTo("#m-bx", { y: -1300 }, { y: 0, duration: 0.4, ease: "bounce.out" }, «casa» - 0.2);
    tl.fromTo("#m-k", { opacity: 0, rotation: 0 }, { opacity: 1, rotation: 0, duration: 0.15 }, «monti» - 0.3);
    tl.to("#m-k", { rotation: 360, duration: 0.7, ease: "power1.inOut" }, «monti» - 0.15);
    tl.fromTo("#m-b", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.24 }, «monti» - 0.2);''', ground='yellow',
    fx=[('thud', 'secondo2', -0.2, 0.3), ('thud', 'casa', 0.1, 0.3), ('tick', 'monti', 0.0, 0.2), ('tick', 'monti', 0.18, 0.2), ('tick', 'monti', 0.36, 0.2)])

# 11. "E tre ricercatori hanno scoperto che..." (the paper and its three authors)
av = ''.join(f'<div class="av" id="n-a{k}" style="left:{150 + k * 290}px"><b>{i}</b><span>{n}</span></div>' for k, (i, n) in enumerate([('MN', 'Norton'), ('DM', 'Mochon'), ('DA', 'Ariely')]))
add('i11', 'etre', 'valore', f'''      {big('n-t', '3 ricercatori', 330, 130, INK)}
      {av}
      <div class="card" id="n-j" style="left:110px;top:1070px;width:860px;height:200px;border-radius:36px" data-layout-allow-overlap>
        <div style="position:absolute;left:50px;top:50px;font:600 32px/1 {SF};letter-spacing:0.14em;color:{GREY}">STUDIO · 2012</div>
        <div style="position:absolute;left:50px;top:104px;font:700 46px/1 {SF};color:{INK}">Journal of Consumer Psychology</div>
      </div>''', '''    tl.fromTo("#n-t", { opacity: 0, filter: "blur(14px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.24 }, 0.0);
    tl.fromTo("#n-a0, #n-a1, #n-a2", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.28, ease: "back.out(2)", stagger: 0.14 }, 0.2);
    tl.fromTo("#n-j", { y: 700 }, { y: 0, duration: 0.36, ease: "expo.out" }, 1.0);''', '''
    .av { position: absolute; top: 560px; width: 200px; height: 330px; }
    .av b { display: block; width: 200px; height: 200px; border-radius: 50%; background: #0058a3; color: #fff; font: 700 74px/200px "SF Pro Display"; text-align: center; }
    .av span { display: block; margin-top: 26px; text-align: center; font: 700 42px/1 "SF Pro Display"; color: #111; }''', ground='grey',
    fx=[('pop', 'etre', 0.2, 0.2), ('pop', 'etre', 0.34, 0.2), ('pop', 'etre', 0.48, 0.2), ('swoosh', 'etre', 1.0, 0.22)])

# 12. "...diamo più valore alle cose che costruiamo con le nostre mani." (two bars: bought built, built by you)
add('i12', 'valore', 'chiamato', f'''      {small('o-a', 'quanto vale per te', 330, 66, GREY)}
      <div style="position:absolute;left:170px;top:1300px;width:740px;height:4px;background:#d2d2d7" data-layout-allow-overlap></div>
      <div id="o-b1" style="position:absolute;left:230px;top:1000px;width:240px;height:300px;border-radius:26px 26px 0 0;background:#c7c7cc;transform-origin:50% 100%" data-layout-allow-overlap></div>
      <div id="o-b2" style="position:absolute;left:610px;top:580px;width:240px;height:720px;border-radius:26px 26px 0 0;background:{IB};transform-origin:50% 100%" data-layout-allow-overlap></div>
      <div style="position:absolute;left:170px;top:1330px;width:360px;text-align:center;font:600 46px/1.15 {SF};color:{GREY}" data-layout-allow-overlap>già montato</div>
      <div style="position:absolute;left:550px;top:1330px;width:360px;text-align:center;font:700 46px/1.15 {SF};color:{IB}" data-layout-allow-overlap>montato da te</div>
      <div class="chip" id="o-c" style="left:600px;top:470px;background:{IY};color:{INK}">con le tue mani</div>''', '''    tl.fromTo("#o-b1", { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: "expo.out" }, 0.15);
    tl.fromTo("#o-b2", { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: "expo.out" }, 0.9);
    pop(tl, "#o-c", «mani» - 0.3);''', ground='white',
    fx=[('pop', 'valore', 0.15, 0.2), ('riser', 'valore', 0.4, 0.12), ('ding', 'valore', 1.1, 0.22), ('pop', 'mani', -0.3, 0.22)])

HEART = f'<svg viewBox="0 0 200 180" width="170" height="153" style="vertical-align:-14px"><path d="M100 170 C 40 120, 0 90, 0 50 C 0 20, 25 0, 52 0 C 76 0, 92 14, 100 30 C 108 14, 124 0, 148 0 C 175 0, 200 20, 200 50 C 200 90, 160 120, 100 170 Z" fill="{RED}"/></svg>'
# 13. "Lo hanno chiamato effetto IKEA. Fatica uguale amore."
add('i13', 'chiamato', 'tu', f'''      {small('p-a', 'lo hanno chiamato', 330, 70, INK)}
      <div id="p-s" data-layout-allow-overlap style="position:absolute;left:90px;top:470px;width:900px;padding:50px 0;border:14px solid {INK};border-radius:40px;text-align:center;font:800 150px/1 {SF};letter-spacing:-0.04em;color:{INK};transform:rotate(-5deg)">EFFETTO<br>IKEA</div>
      <div id="p-e" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:1060px;text-align:center;font:800 130px/1 {SF};letter-spacing:-0.04em;color:{INK}">fatica = <span id="p-h" style="display:inline-block">{HEART}</span></div>''', '''    tl.fromTo("#p-a", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.0);
    stamp(tl, "#p-s", «effetto» - 0.15, -5);
    tl.fromTo("#p-e", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.24, ease: "expo.out" }, «fatica» - 0.1);
    tl.fromTo("#p-h", { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(3)" }, «amore» - 0.15);
    tl.to("#p-h", { scale: 1.15, duration: 0.12, yoyo: true, repeat: 1 }, «amore» + 0.2);''', ground='yellow',
    fx=[('stamp', 'effetto', -0.15, 0.45), ('pop', 'amore', -0.15, 0.24)])

# ================================================================ QUESTION + LESSON
BUBBLE = f'<svg viewBox="0 0 120 110" width="72" height="66" style="vertical-align:-14px;margin-right:18px"><path d="M60 6 C 28 6, 6 26, 6 52 C 6 66, 12 78, 24 86 L 18 106 L 44 94 C 49 96, 54 97, 60 97 C 92 97, 114 77, 114 52 C 114 26, 92 6, 60 6 Z" fill="none" stroke="{INK}" stroke-width="9"/></svg>'
# 14. "Tu cosa hai comprato senza volerlo, l'ultima volta? Scrivilo nei commenti."
add('i14', 'tu', 'lezione', f'''      {small('q-a', 'tu cosa hai', 340, 80, 'rgba(255,255,255,0.75)')}
      {big('q-b', 'comprato', 450, 170, '#fff')}
      {big('q-c', 'senza volerlo?', 640, 130, IY)}
      <div id="q-d" data-layout-allow-overlap style="position:absolute;left:150px;top:1010px;width:780px;height:160px;border-radius:80px;background:#fff;color:{INK};font:700 56px/160px {SF};text-align:center">{BUBBLE}scrivilo nei commenti</div>''', '''    tl.fromTo("#q-b", { scale: 1.6, opacity: 0, filter: "blur(14px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, «comprato» - 0.15);
    tl.fromTo("#q-c", { x: 1000 }, { x: 0, duration: 0.3, ease: "expo.out" }, «comprato» + 0.35);
    tl.fromTo("#q-d", { y: 700, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, ease: "back.out(1.4)" }, «scrivilo» - 0.15);''', ground='blue',
    fx=[('thud', 'comprato', -0.15, 0.26), ('whoosh-short', 'comprato', 0.35, 0.2), ('notif', 'scrivilo', -0.15, 0.24)])

def shopplan(p, extra=''):
    shelves = [('novità', 90, 110), ('più venduti', 570, 110), ('offerte', 330, 420), ('', 90, 640), ('', 570, 640)]
    sh = ''.join(f'<rect x="{x}" y="{y}" width="200" height="100" rx="18" fill="#dfe8f2"/>'
                 f'<text x="{x + 100}" y="{y + 62}" text-anchor="middle" font-family="SF Pro Display" font-weight="700" font-size="34" fill="{IB}">{n}</text>' for n, x, y in shelves)
    return (f'<svg viewBox="0 0 860 960" width="860" height="960" style="position:absolute;left:110px;top:560px" data-layout-allow-overlap>'
            f'<rect x="10" y="10" width="840" height="880" rx="30" fill="#fff" stroke="{INK}" stroke-width="12"/>{sh}'
            f'<rect x="90" y="870" width="140" height="40" fill="#fff"/><text x="160" y="950" text-anchor="middle" font-family="SF Pro Display" font-weight="700" font-size="36" fill="{INK}">entrata</text>'
            f'<rect x="640" y="800" width="180" height="70" rx="14" fill="{IY}"/><text x="730" y="848" text-anchor="middle" font-family="SF Pro Display" font-weight="800" font-size="34" fill="{INK}">cassa</text>{extra}</svg>')
MESS = 'M160 880 C 330 700, 60 520, 380 600 S 760 330, 520 250 S 160 400, 640 640 S 820 760, 560 820 S 300 560, 460 380'
CLEAN = 'M160 880 V250 H460 V560 H560 V250 H760 V780'
# 15. "La lezione: non lasciare che il cliente scelga il percorso." (a wandering path, crossed out)
add('i15', 'lezione', 'disegnalo', f'''      <div class="eyebrow" id="r-e" style="top:290px;opacity:1;color:{IB};font-size:40px;letter-spacing:0.2em">LA LEZIONE</div>
      {big('r-a', 'non farlo scegliere', 370, 96, INK)}
      {small('r-b', 'al cliente', 480, 70, GREY)}
      {shopplan('r', f'<path id="r-m" d="{MESS}" fill="none" stroke="{RED}" stroke-width="14" stroke-linecap="round" stroke-dasharray="2 26"/><path id="r-x" d="M200 200 L660 660 M660 200 L200 660" fill="none" stroke="{RED}" stroke-width="30" stroke-linecap="round"/>')}''', '''    tl.fromTo("#r-a", { opacity: 0, filter: "blur(14px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.24 }, «lasciare» - 0.2);
    tl.fromTo("#r-b", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «lasciare» + 0.4);
    tl.fromTo("#r-m", { opacity: 0 }, { opacity: 1, duration: 0.1 }, «lasciare»);
    tl.fromTo("#r-m", { strokeDashoffset: 0 }, { strokeDashoffset: -280, duration: DUR, ease: "none" }, 0);
    draw(tl, "#r-x", «percorso2» - 0.1, 0.3);''', ground='grey',
    fx=[('key-press', 'lezione', 0.0, 0.16), ('scan', 'lasciare', 0.0, 0.14), ('glitch', 'percorso2', -0.1, 0.24)])

# 16. "Disegnalo tu. E fagli fare una piccola parte del lavoro." (a clean route from the door to the till)
add('i16', 'disegnalo', 'cta', f'''      {big('s-a', 'disegnalo tu', 330, 130, IB)}
      {shopplan('s', f'<path id="s-r0" d="{CLEAN}" fill="none" stroke="{INK}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/><path id="s-r1" d="{CLEAN}" fill="none" stroke="{IY}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>')}
      <div class="chip" id="s-c" style="left:170px;top:1560px;background:{INK}">+ una piccola parte del lavoro</div>''', '''    tl.fromTo("#s-a", { scale: 1.6, opacity: 0, filter: "blur(14px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, 0.0);
    draw(tl, "#s-r0", 0.25, 1.6); draw(tl, "#s-r1", 0.25, 1.6);
    pop(tl, "#s-c", «lavoro» - 0.5);''', ground='grey',
    fx=[('swipe', 'disegnalo', -0.1, 0.24), ('scan', 'disegnalo', 0.25, 0.16), ('ding', 'disegnalo', 1.85, 0.22), ('pop', 'lavoro', -0.5, 0.22)])

# ================================================================ KEYWORD + LOOP
# 17. "Scrivi PERCORSO" (comment bar + light iOS keyboard)
add('i17', 'cta', 'mando', f'''      {small('t-a', 'scrivi nei commenti', 330, 66, GREY)}
      {big('t-w', 'PERCORSO', 420, 180, IB)}
      {commentbar('t', 'PERCORSO', 760, dark=False)}
      {keyboard('t', 1230, dark=False)}''', '''    tl.fromTo("#t-kb", { y: 700 }, { y: 0, duration: 0.3, ease: "expo.out" }, 0.0);
    tl.fromTo("#t-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.26, ease: "expo.out" }, 0.0);
    tl.fromTo("#t-w", { scale: 1.5, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, «percorsoK» - 0.2);
''' + commentbar_js('t', '«percorsoK» - 0.2', 0.07) + keys_js('t', 'PERCORSO', '«percorsoK» - 0.2', 0.07) + '''    tl.fromTo("#t-pub", { scale: 1 }, { scale: 1.25, duration: 0.08, yoyo: true, repeat: 1 }, «percorsoK» + 0.4);''', KBCSS,
    fx=[('swipe', 'cta', -0.15, 0.24), ('typing', 'percorsoK', -0.2, 0.24), ('click', 'percorsoK', 0.4, 0.4)])

# 18. "...e ti mando come disegnarlo nel tuo negozio." (the DM)
add('i18', 'mando', 'ma', f'''      {small('u-a', 'ti arriva in DM', 330, 66, 'rgba(255,255,255,0.75)')}
      {dmcard('u', 470, 'Come disegnare il percorso', 'del tuo negozio, passo per passo', dark=False, icon=IB)}''', '''    tl.fromTo("#u-dm", { y: -900, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.3)" }, 0.0);
    tl.fromTo("#u-doc", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, 0.45);''', ground='blue',
    fx=[('notif', 'mando', 0.0, 0.26), ('pop', 'mando', 0.45, 0.24)])

# 19. loop: "Ma la prossima volta che..." -> "Entri da IKEA per comprare una lampadina." (back to the first frame)
add('i19', 'ma', 'END', f'''      {HOOK.replace('@', 'z')}
      {small('z-a', 'la prossima volta…', 140, 66, 'rgba(255,255,255,0.75)')}''', '''    gsap.set("#z-t", { opacity: 0, scale: 1.3 });
    tl.fromTo("#z-l", { rotation: -10, y: 120 }, { rotation: -4, y: 0, duration: DUR, ease: "sine.out" }, 0);
    tl.fromTo("#z-b", { rotation: 30 }, { rotation: 12, duration: DUR, ease: "sine.out" }, 0);
    tl.fromTo("#z-a", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.03);
    tl.to("#z-a", { opacity: 0, duration: 0.12 }, DUR - 0.34);
    tl.to("#z-t", { opacity: 1, scale: 1.08, duration: 0.28, ease: "power2.in" }, DUR - 0.3);''', ground='blue', cam=False,
    fx=[('riser', 'ma', 0.0, 0.12), ('whoosh-short', 'ma', 0.95, 0.2)])
