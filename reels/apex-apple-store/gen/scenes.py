# apex-apple-store: "Entra in un Apple Store e guarda i portatili. Sono tutti aperti allo stesso angolo. E non è un caso."
# Classic Apex marketing reel in the white Apple style: a real case explained step by step, a one-word comment question,
# the lesson for whoever runs a shop, the keyword (NEGOZIO) and a loop line.
# Verified facts: in 2012 it was reported (Carmine Gallo, Forbes; Gizmodo) that Apple Store staff set every laptop screen to 70 degrees
# each morning with an iPhone level app, so customers adjust (touch) the screen; later reports (2015) say the angle became 76 degrees.
# Peck & Shu (2009, Journal of Consumer Research): merely touching an object increases perceived ownership and willingness to pay.
import sys
sys.path.insert(0, '.'); sys.path.insert(0, '../../apex-kit')
from kit import *
from ui import *
from times import T
BED = 0.07; ROOT = '#ffffff'
INK = '#1d1d1f'; GREY = '#86868b'; BLUE = '#0071e3'; GRN = '#1d8a3c'; RED = '#e30000'; PAPER = '#f5f5f7'
THEME = f'''
    .lp {{ position: absolute; width: 900px; height: 1250px; perspective: 2600px; }}
    .lp-g {{ position: absolute; left: 0; top: 640px; width: 900px; height: 0; transform-style: preserve-3d; }}
    .lp-s {{ position: absolute; left: 0; top: -580px; width: 900px; height: 580px; border-radius: 34px 34px 8px 8px; background: #1d1d1f; padding: 22px; box-sizing: border-box; transform-origin: 50% 100%; }}
    .lp-s i {{ display: block; width: 100%; height: 100%; border-radius: 16px; background: linear-gradient(135deg, #64d2ff 0%, #0a84ff 35%, #5e5ce6 65%, #bf5af2 100%); }}
    .lp-b {{ position: absolute; left: 0; top: 0; width: 900px; height: 620px; transform-origin: 50% 0%; border-radius: 8px 8px 34px 34px; background: linear-gradient(#e3e3e8, #c7c7cc); }}
    .lp-b .kb {{ position: absolute; left: 90px; right: 90px; top: 50px; height: 300px; border-radius: 14px; background: repeating-linear-gradient(90deg, #2c2c2e 0 52px, #c7c7cc 52px 58px), #2c2c2e; }}
    .lp-b .tp {{ position: absolute; left: 290px; width: 320px; top: 390px; height: 190px; border-radius: 18px; background: #d1d1d6; box-shadow: inset 0 0 0 2px #b8b8bd; }}
    .mul {{ mix-blend-mode: multiply; }}
'''
R = Reel(T, THEME)
add = R.add
def laptop(i, left, top, scale=1.0):
    return (f'<div class="lp" id="{i}" data-layout-allow-overlap style="left:{left}px;top:{top}px;transform:scale({scale});transform-origin:50% 50%">'
            f'<div class="lp-g" id="{i}-g"><div class="lp-b" id="{i}-b"><div class="kb"></div><div class="tp"></div></div><div class="lp-s" id="{i}-s"><i></i></div></div></div>')
def lp_js(i, angle, ry=-28, rx=-18):
    return (f'    gsap.set("#{i}-b", {{ rotationX: 90 }}); gsap.set("#{i}-s", {{ rotationX: {angle - 90} }}); gsap.set("#{i}-g", {{ rotationY: {ry}, rotationX: {rx} }});\n')
def lp_to(i, angle, t, d=0.5, ease='back.out(1.6)'):
    return f'    tl.to("#{i}-s", {{ rotationX: {angle - 90}, duration: {d}, ease: "{ease}" }}, {t});\n'
# side-profile diagram of a laptop: base line, screen line on a hinge, the angle arc and its label
def profile(p, top=620, arc=True, left=0, width=1080):
    # side view: base, screen on a hinge (rotation set in JS: 90 - angle), the 70 degree arc
    return (f'<svg viewBox="180 100 740 600" width="{width}" height="{width * 600 / 740:.0f}" style="position:absolute;left:{left}px;top:{top}px;overflow:visible" data-layout-allow-overlap>'
            f'<rect x="240" y="640" width="640" height="34" rx="17" fill="#c7c7cc"/>'
            f'<g id="{p}-scr" style="transform-origin:260px 650px;transform-box:view-box"><rect x="246" y="140" width="30" height="520" rx="15" fill="{INK}"/></g>'
            f'<circle cx="260" cy="650" r="18" fill="{GREY}"/>'
            + (f'<path id="{p}-arc" d="M 520 650 A 260 260 0 0 0 349 405" fill="none" stroke="{BLUE}" stroke-width="12" stroke-linecap="round"/>' if arc else '') + '</svg>')
def iphone(p, left, top, inner, w=420, h=860, bg='#000'):
    return (f'<div id="{p}-ph" data-layout-allow-overlap style="position:absolute;left:{left}px;top:{top}px;width:{w}px;height:{h}px;border-radius:70px;background:{bg};box-shadow:0 0 0 14px #1d1d1f, 0 50px 120px -30px rgba(0,0,0,0.5);overflow:hidden">'
            f'<div style="position:absolute;left:{w / 2 - 60}px;top:18px;width:120px;height:34px;border-radius:17px;background:#000"></div>{inner}</div>')

# ================================================================ HOOK
TAB = (f'<div id="@-tab" data-layout-allow-overlap style="position:absolute;left:-200px;top:1180px;width:1480px;height:900px;background:linear-gradient(180deg,#e9dccb,#d9c6ad);transform:perspective(1200px) rotateX(62deg);transform-origin:50% 0"></div>')
HOOKT = f'<div id="@-t" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:290px;text-align:center;font:700 150px/1.05 {SF};letter-spacing:-0.045em;color:{INK}">Apple Store</div>'
HOOKC = f'<div class="chip" id="@-c" data-layout-allow-overlap style="left:430px;top:600px;background:{BLUE};font-size:64px;padding:18px 40px;opacity:1">70°</div>'
def hookset(p): return TAB.replace('@', p) + HOOKT.replace('@', p) + laptop(p + 'l1', -230, 560, 0.42) + laptop(p + 'l2', 90, 520, 0.5) + laptop(p + 'l3', 410, 560, 0.42) + HOOKC.replace('@', p)
def hookjs(p): return ''.join(lp_js(p + n, 70, ry=-30, rx=-20) for n in ('l1', 'l2', 'l3'))
# 1. "Entra in un Apple Store e guarda i portatili." (three laptops on a store table)
add('a01', 'start', 'sono', f'''      {hookset('h')}''', hookjs('h') + '''    tl.fromTo("#hl2", { y: 30 }, { y: 0, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#h-t", { scale: 1.08 }, { scale: 1, duration: 0.5, ease: "expo.out" }, 0);
    tl.to("#hl1-g, #hl2-g, #hl3-g", { rotationY: -18, duration: DUR, ease: "sine.inOut" }, 0);''', cam=False,
    fx=[('whoosh', 'start', 0.0, 0.3), ('pop', 'start', 0.05, 0.24), ('ding', 'start', 0.4, 0.2)])

# 2. "Sono tutti aperti allo stesso angolo." (three side profiles, same arc, same number)
add('a02', 'sono', 'enon', f'''      {''.join(profile(f'b{k}', 330 + k * 400, True, 60, 560) for k in range(3))}
      {''.join(f'<div class="chip" id="b-c{k}" style="left:690px;top:{560 + k * 400}px;background:{BLUE};font-size:70px;padding:20px 44px">70°</div>' for k in range(3))}
      {small('b-a', 'stesso angolo', 190, 80, INK)}''', '''    gsap.set("#b0-scr, #b1-scr, #b2-scr", { rotation: 20 });
    tl.fromTo("#b0-scr, #b1-scr, #b2-scr", { rotation: -15 }, { rotation: 20, duration: 0.4, ease: "back.out(2)", stagger: 0.12 }, 0.0);
    draw(tl, "#b0-arc", 0.25, 0.25); draw(tl, "#b1-arc", 0.37, 0.25); draw(tl, "#b2-arc", 0.49, 0.25);
    tl.fromTo("#b-c0, #b-c1, #b-c2", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.24, ease: "back.out(2.4)", stagger: 0.12 }, «stesso» - 0.5);
    tl.fromTo("#b-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, «stesso» - 0.2);''', ground='grey',
    fx=[('swipe', 'sono', -0.1, 0.24), ('hinge', 'sono', 0.0, 0.3), ('pop', 'stesso', -0.5, 0.2), ('pop', 'stesso', -0.38, 0.2), ('pop', 'stesso', -0.26, 0.2)])

# 3. "E non è un caso."
add('a03', 'enon', 'resta', f'''      {big('c-a', 'non è un', 640, 140, GREY)}
      {big('c-b', 'caso.', 800, 280, INK)}''', '''    tl.fromTo("#c-b", { scale: 1.8, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, 0.25);
    shake(tl, "#a03-cam", 0.4, 18);''', mq='non è un caso',
    fx=[('thud', 'enon', 0.25, 0.3)])

# 4. "Resta fino alla fine, perché questo trucco funziona..." (progress bar)
add('a04', 'resta', 'qualsiasi', f'''      {small('d-a', 'resta fino', 420, 80, GREY)}
      {big('d-b', 'alla <span style="color:{BLUE}">fine.</span>', 510, 170, INK)}
      {progress('d', 830, BLUE, dark=False)}''', '''    blurIn(tl, "#d-b", 0.05, 0.24);
''' + progress_js('d', 0.15, 2.0),
    fx=[('swoosh', 'resta', 0.15, 0.25)])

# 5. "...in qualsiasi negozio, anche nel tuo." (shop fronts, then yours)
SHOPS = [('Bar', '#ff9f0a'), ('Moda', '#bf5af2'), ('Pizzeria', '#ff3b30'), ('Il tuo', BLUE)]
shops = ''.join(f'<div class="sh" id="e-s{k}" style="left:{90 + (k % 2) * 470}px;top:{470 + (k // 2) * 460}px"><div class="aw" style="background:repeating-linear-gradient(90deg,{c} 0 60px,#fff 60px 120px)"></div><div class="dr"></div><b>{n}</b></div>' for k, (n, c) in enumerate(SHOPS))
add('a05', 'qualsiasi', 'nel', f'''      {shops}''', '''    tl.fromTo(".sh", { opacity: 0, y: 120, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: "back.out(1.8)", stagger: 0.12 }, 0.05);
    tl.to("#e-s3", { scale: 1.12, boxShadow: "0 0 0 10px #0071e3, 0 40px 100px -30px rgba(0,0,0,0.3)", duration: 0.3, ease: "back.out(2)" }, «tuo» - 0.2);''', '''
    .sh { position: absolute; width: 430px; height: 420px; border-radius: 30px; background: #fff; box-shadow: 0 40px 100px -30px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.05); overflow: hidden; opacity: 0; }
    .sh .aw { height: 90px; }
    .sh .dr { position: absolute; left: 150px; top: 170px; width: 130px; height: 250px; border-radius: 12px 12px 0 0; background: #e5e5ea; }
    .sh b { position: absolute; left: 0; right: 0; top: 108px; text-align: center; font: 700 50px/1 "SF Pro Display"; color: #1d1d1f; }''', ground='grey',
    fx=[('pop', 'qualsiasi', 0.05, 0.2), ('pop', 'qualsiasi', 0.17, 0.2), ('pop', 'qualsiasi', 0.29, 0.2), ('pop', 'qualsiasi', 0.41, 0.2), ('ding', 'tuo', -0.2, 0.24)])

# ================================================================ THE CASE
# 6. "Nel 2012 si è scoperto che ogni mattina i dipendenti..." (2012, an alarm every morning)
add('a06', 'nel', 'mettono', f'''      {big('f-y', '2012', 340, 220, INK)}
      <div class="card" id="f-al" style="left:110px;top:720px;width:860px;height:260px;border-radius:50px" data-layout-allow-overlap>
        <div style="position:absolute;left:56px;top:46px;font:300 130px/1 {SF};letter-spacing:-0.03em">8:00</div>
        <div style="position:absolute;left:60px;top:190px;font:500 38px/1 {SF};color:{GREY}">Sveglia · ogni mattina</div>
        <div style="position:absolute;right:56px;top:96px;width:130px;height:78px;border-radius:39px;background:#34c759"><i style="position:absolute;right:6px;top:6px;width:66px;height:66px;border-radius:50%;background:#fff;display:block"></i></div>
      </div>
      {small('f-a', 'prima di aprire il negozio', 1060, 56, GREY)}''', '''    tl.fromTo("#f-y", { scale: 1.6, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, «y2012» - 0.15);
    tl.fromTo("#f-al", { y: -900, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.4)" }, «mattina» - 0.3);
    tl.fromTo("#f-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, «dipendenti» - 0.1);''',
    fx=[('thud', 'y2012', -0.15, 0.3), ('notif', 'mattina', -0.2, 0.28)])

# 7. "...mettono ogni schermo a 70 gradi." (side profile: the screen snaps to 70°)
add('a07', 'mettono', 'con', f'''      {big('g-n', '<span id="g-v">105</span>°', 300, 230, INK)}
      {profile('g', 640, True, 60, 960)}''', '''    gsap.set("#g-scr", { rotation: -15 });
    tl.to("#g-scr", { rotation: 20, duration: 0.45, ease: "back.out(2.2)" }, «settanta» - 0.25);
    draw(tl, "#g-arc", «settanta» - 0.05, 0.3);
    count(tl, "#g-v", 105, 70, «settanta» - 0.25, 0.45, function (v) { return String(Math.round(v)); }, "power2.out");
    tl.to("#g-n", { color: "#0071e3", duration: 0.2 }, «settanta» + 0.2);
    punch(tl, "#g-n", «settanta» + 0.2, 1.14);''',
    fx=[('swipe', 'mettono', -0.1, 0.24), ('hinge', 'settanta', -0.25, 0.4), ('ding', 'settanta', 0.2, 0.26)])

# 8. "Con un'app, come una livella. 70, non uno di più." (a level app on an iPhone)
lvl = (f'<div style="position:absolute;left:0;right:0;top:300px;text-align:center;font:200 190px/1 {SF};color:#fff"><span id="h-v">0</span>°</div>'
       f'<div id="h-line" style="position:absolute;left:-60px;right:-60px;top:560px;height:6px;background:#34c759"></div>')
add('a08', 'con', 'perche', f'''      {iphone('h', 330, 380, lvl)}
      <div class="chip" id="h-c" style="left:330px;top:1330px;background:{INK}">non uno di più</div>''', '''    tl.fromTo("#h-ph", { y: 900, rotation: 8 }, { y: 0, rotation: 0, duration: 0.4, ease: "back.out(1.3)" }, 0.0);
    tl.fromTo("#h-line", { rotation: 0 }, { rotation: -20, duration: 0.9, ease: "power2.inOut" }, 0.4);
    count(tl, "#h-v", 0, 70, 0.4, «settanta2» - 0.4, function (v) { return String(Math.round(v)); }, "power2.out");
    punch(tl, "#h-ph", «settanta2», 1.06);
    pop(tl, "#h-c", «nonuno» - 0.05);''', ground='grey',
    fx=[('swipe', 'con', -0.1, 0.24), ('tick', 'livella', 0.0, 0.18), ('tick', 'livella', 0.2, 0.18), ('ding', 'settanta2', 0.0, 0.26), ('pop', 'nonuno', -0.05, 0.24)])

# 9. "Perché? Perché uno schermo un po' troppo chiuso ti dà fastidio." (the screen leans at you)
add('a09', 'perche', 'etu', f'''      {big('i-q', 'perché?', 300, 150, INK)}
      {laptop('il', 90, 360, 0.95)}
      <div class="chip" id="i-c" style="left:290px;top:1350px;background:{RED}">troppo chiuso</div>''', lp_js('il', 105, ry=-38, rx=-12) + lp_to('il', 70, '«chiuso» - 0.3', 0.4) + '''    tl.fromTo("#i-q", { scale: 1.6, opacity: 0, filter: "blur(14px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }, 0.0);
    pop(tl, "#i-c", «chiuso» + 0.1);
    shake(tl, "#a09-cam", «fastidio», 14);''',
    fx=[('pop', 'perche', 0.0, 0.22), ('hinge', 'chiuso', -0.3, 0.36), ('glitch', 'fastidio', 0.0, 0.24)])

# 10. "E tu cosa fai? Allunghi la mano e lo sistemi." (a hand pushes the screen back)
HAND = f'<svg viewBox="0 0 200 240" width="230" height="276"><path d="M70 230 C40 180 20 150 30 120 C38 100 60 108 66 126 L70 60 C70 40 98 40 98 60 L100 110 L104 40 C104 20 132 20 132 42 L132 112 L138 60 C140 40 166 42 166 62 L164 150 C164 200 140 230 110 236 Z" fill="#f2c9a6" stroke="#c9946c" stroke-width="5" stroke-linejoin="round"/></svg>'
add('a10', 'etu', 'enel', f'''      {laptop('jl', 90, 300, 0.95)}
      <div id="j-h" style="position:absolute;left:720px;top:1200px" data-layout-allow-overlap>{HAND}</div>
      {big('j-a', 'lo sistemi', 1440, 110, INK)}''', lp_js('jl', 70, ry=-38, rx=-12) + '''    tl.fromTo("#j-h", { x: 400, y: 400 }, { x: 0, y: 0, duration: 0.45, ease: "power3.out" }, «allunghi» - 0.2);
    tl.to("#j-h", { x: -60, y: -380, duration: 0.4, ease: "power2.inOut" }, «sistemi» - 0.35);
''' + lp_to('jl', 105, '«sistemi» - 0.1', 0.45, 'power2.out') + '''    tl.fromTo("#j-a", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.24 }, «sistemi»);''', ground='grey',
    fx=[('whoosh-short', 'allunghi', -0.2, 0.22), ('hinge', 'sistemi', -0.1, 0.4), ('click-soft', 'sistemi', 0.2, 0.3)])

# 11. "E nel momento in cui lo tocchi, è già un po' tuo." (a touch ripple and a tag that says TUO)
add('a11', 'enel', 'nonemagia', f'''      {laptop('kl', 90, 300, 0.95)}
      <div id="k-r" data-layout-allow-overlap style="position:absolute;left:470px;top:500px;width:140px;height:140px;border-radius:50%;border:8px solid {BLUE};opacity:0"></div>
      <div id="k-tag" data-layout-allow-overlap style="position:absolute;left:640px;top:330px;padding:24px 48px;border-radius:24px;background:{BLUE};color:#fff;font:800 110px/1 {SF};transform:rotate(-8deg);opacity:0">TUO</div>''', lp_js('kl', 105, ry=-38, rx=-12) + '''    tl.fromTo("#k-r", { opacity: 1, scale: 0.3 }, { opacity: 0, scale: 2.2, duration: 0.6, ease: "power2.out" }, «tocchi» - 0.05);
    stamp(tl, "#k-tag", «tuo2» - 0.15, -8);''',
    fx=[('click', 'tocchi', -0.05, 0.4), ('stamp', 'tuo2', -0.15, 0.45)])

# ================================================================ THE STUDY
# 12. "Non è magia, è uno studio: nel 2009 due ricercatrici americane..." (the paper)
add('a12', 'nonemagia', 'toccare', f'''      <div class="card" id="l-c" style="left:100px;top:380px;width:880px;height:860px;border-radius:50px" data-layout-allow-overlap>
        <div style="position:absolute;left:60px;top:60px;font:600 32px/1 {SF};letter-spacing:0.16em;color:{GREY}">STUDIO · 2009</div>
        <div style="position:absolute;left:60px;right:60px;top:120px;font:700 76px/1.08 {SF};letter-spacing:-0.03em">L’effetto del semplice tocco sul senso di possesso</div>
        <div style="position:absolute;left:60px;top:470px;font:600 46px/1.3 {SF}">Joann Peck<br>Suzanne Shu</div>
        <div style="position:absolute;left:60px;top:640px;font:500 36px/1.3 {SF};color:{GREY}">Journal of Consumer Research</div>
      </div>
      {small('l-a', 'non è magia', 250, 70, GREY)}''', '''    tl.fromTo("#l-a", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.0);
    tl.fromTo("#l-c", { rotationY: -80, opacity: 0, transformPerspective: 1600 }, { rotationY: 0, opacity: 1, duration: 0.5, ease: "expo.out" }, «studio» - 0.3);''', ground='grey', mq='STUDIO',
    fx=[('swipe', 'studio', -0.3, 0.26), ('key-press', 'y2009', 0.0, 0.16), ('typing', 'ricercatrici', 0.0, 0.2)])

# 13. "...toccare un oggetto ti fa sentire più proprietario." (two bars: not touched, touched)
add('a13', 'toccare', 'esei', f'''      {small('m-a', 'senso di possesso', 330, 66, GREY)}
      <div style="position:absolute;left:170px;top:1300px;width:740px;height:4px;background:#d2d2d7" data-layout-allow-overlap></div>
      <div id="m-b1" style="position:absolute;left:230px;top:950px;width:240px;height:350px;border-radius:26px 26px 0 0;background:#d2d2d7;transform-origin:50% 100%" data-layout-allow-overlap></div>
      <div id="m-b2" style="position:absolute;left:610px;top:560px;width:240px;height:740px;border-radius:26px 26px 0 0;background:{BLUE};transform-origin:50% 100%" data-layout-allow-overlap></div>
      <div style="position:absolute;left:170px;top:1330px;width:360px;text-align:center;font:600 50px/1 {SF};color:{GREY}" data-layout-allow-overlap>guardato</div>
      <div style="position:absolute;left:550px;top:1330px;width:360px;text-align:center;font:700 50px/1 {SF};color:{BLUE}" data-layout-allow-overlap>toccato</div>
      <div id="m-h" style="position:absolute;left:640px;top:420px;transform:scale(0.6);transform-origin:0 0" data-layout-allow-overlap>{HAND}</div>''', '''    tl.fromTo("#m-b1", { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: "expo.out" }, 0.1);
    tl.fromTo("#m-b2", { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: "expo.out" }, «proprietario» - 0.5);
    pop(tl, "#m-h", «proprietario» - 0.2);''',
    fx=[('pop', 'toccare', 0.1, 0.2), ('riser', 'proprietario', -0.6, 0.12), ('ding', 'proprietario', 0.1, 0.24)])

# 14. "E sei disposto a pagarlo di più." (the price goes up)
add('a14', 'esei', 'per', f'''      {small('n-a', 'e lo paghi', 470, 80, GREY)}
      {big('n-b', 'di più', 570, 260, GRN)}
      <svg viewBox="0 0 200 200" width="220" height="220" style="position:absolute;left:430px;top:900px" data-layout-allow-overlap><path id="n-ar" d="M100 180 V30 M40 90 L100 30 L160 90" fill="none" stroke="{GRN}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/></svg>''', '''    tl.fromTo("#n-b", { scale: 1.7, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, «pagarlo» - 0.1);
    draw(tl, "#n-ar", «pagarlo», 0.35);''', mq='DI PIÙ',
    fx=[('register', 'pagarlo', 0.0, 0.3)])

# 15. "Per questo da Apple non c'è niente dietro un vetro." (the glass case disappears)
add('a15', 'per', 'tutto', f'''      <div id="o-gl" style="position:absolute;left:190px;top:480px;width:700px;height:820px;border-radius:30px;background:linear-gradient(135deg,rgba(180,210,230,0.55),rgba(255,255,255,0.25));box-shadow:inset 0 0 0 6px rgba(150,180,200,0.7)" data-layout-allow-overlap></div>
      {iphone('o', 390, 600, '<i style="display:block;position:absolute;inset:0;background:linear-gradient(135deg,#64d2ff,#5e5ce6)"></i>', 300, 600)}
      {big('o-a', 'niente vetri', 300, 120, INK)}''', '''    tl.fromTo("#o-a", { opacity: 0, filter: "blur(14px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.24 }, «vetro» - 0.4);
    tl.to("#o-gl", { y: -1200, rotation: -8, opacity: 0, duration: 0.45, ease: "power3.in" }, «vetro» + 0.1);''',
    fx=[('swoosh', 'vetro', 0.1, 0.3), ('whoosh-short', 'vetro', 0.1, 0.2)])

# 16. "Tutto acceso, tutto da toccare." (a table of devices lights up)
devs = ''.join(f'<div class="dv" style="left:{100 + (k % 4) * 225}px;top:{560 + (k // 4) * 320}px;width:{180 if k % 2 else 200}px;height:{280 if k % 2 else 260}px"><i style="background:linear-gradient(135deg,{["#64d2ff", "#bf5af2", "#ff9f0a", "#34c759"][k % 4]},#0a84ff)"></i></div>' for k in range(8))
add('a16', 'tutto', 'tu', f'''      {big('p-a', 'tutto acceso', 300, 110, INK)}
      {devs}''', '''    tl.fromTo(".dv i", { opacity: 0 }, { opacity: 1, duration: 0.12, stagger: 0.08 }, 0.1);
    tl.fromTo(".dv", { scale: 0.9 }, { scale: 1, duration: 0.3, ease: "back.out(2)", stagger: 0.08 }, 0.1);''', '''
    .dv { position: absolute; border-radius: 28px; background: #1d1d1f; padding: 12px; box-sizing: border-box; box-shadow: 0 30px 80px -30px rgba(0,0,0,0.4); }
    .dv i { display: block; width: 100%; height: 100%; border-radius: 18px; }''', ground='grey',
    fx=[('sparkle', 'tutto', 0.1, 0.22), ('click-soft', 'toccare2', 0.0, 0.3)])

# ================================================================ QUESTION + LESSON
# 17. "Tu l'avevi mai notato? Scrivi SÌ o NO."
add('a17', 'tu', 'lezione', f'''      {small('q-a', 'l’avevi mai notato?', 330, 80, GREY)}
      <div id="q-y" style="position:absolute;left:110px;top:520px;width:860px;height:260px;border-radius:60px;background:{GRN};color:#fff;font:800 150px/260px {SF};text-align:center" data-layout-allow-overlap>SÌ</div>
      <div id="q-n" style="position:absolute;left:110px;top:840px;width:860px;height:260px;border-radius:60px;background:{RED};color:#fff;font:800 150px/260px {SF};text-align:center" data-layout-allow-overlap>NO</div>''', '''    tl.fromTo("#q-y", { x: -1100 }, { x: 0, duration: 0.3, ease: "expo.out" }, «si» - 0.3);
    tl.fromTo("#q-n", { x: 1100 }, { x: 0, duration: 0.3, ease: "expo.out" }, «no» - 0.3);''',
    fx=[('whoosh-short', 'si', -0.3, 0.22), ('pop', 'si', 0.0, 0.24), ('whoosh-short', 'no', -0.3, 0.22), ('pop', 'no', 0.0, 0.24)])

# 18. "La lezione: se hai un negozio, non tenere i prodotti lontani dalle mani dei clienti." (a locked shelf opens)
add('a18', 'lezione', 'fai', f'''      <div class="eyebrow" id="r-e" style="top:300px;opacity:1;color:{BLUE};font-size:40px;letter-spacing:0.2em">LA LEZIONE</div>
      {big('r-a', 'non tenerli lontani', 370, 100, INK)}
      <div id="r-sh" style="position:absolute;left:140px;top:640px;width:800px;height:620px;border-radius:30px;background:#e5e5ea" data-layout-allow-overlap>
        {''.join(f'<i style="position:absolute;left:{70 + k * 230}px;top:{120 + (k % 2) * 40}px;width:180px;height:260px;border-radius:24px;background:{c};display:block"></i>' for k, c in enumerate(['#ff9f0a', '#bf5af2', '#34c759']))}
        <div id="r-gl" style="position:absolute;inset:0;border-radius:30px;background:linear-gradient(135deg,rgba(180,210,230,0.7),rgba(255,255,255,0.35));box-shadow:inset 0 0 0 6px rgba(150,180,200,0.8)"></div>
        <svg id="r-lk" viewBox="0 0 120 150" width="120" height="150" style="position:absolute;left:340px;top:440px"><rect x="10" y="62" width="100" height="80" rx="16" fill="{INK}"/><path d="M30 62 V42 C30 6 90 6 90 42 V62" fill="none" stroke="{INK}" stroke-width="12"/></svg>
      </div>''', '''    tl.fromTo("#r-a", { opacity: 0, filter: "blur(14px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.24 }, «negozio2» - 0.1);
    tl.fromTo("#r-sh", { y: 900 }, { y: 0, duration: 0.4, ease: "expo.out" }, 0.1);
    tl.to("#r-lk", { y: 300, rotation: 40, opacity: 0, duration: 0.4, ease: "power2.in" }, «mani» - 0.3);
    tl.to("#r-gl", { y: -700, opacity: 0, duration: 0.45, ease: "power3.in" }, «mani»);''',
    fx=[('key-press', 'lezione', 0.0, 0.16), ('swoosh', 'tenere', 0.0, 0.2), ('click', 'mani', -0.3, 0.4), ('whoosh-short', 'mani', 0.0, 0.2)])

# 19. "Fai in modo che li tocchino. Prima toccano, poi comprano." (touch, then buy)
add('a19', 'fai', 'cta', f'''      {small('s-a', 'fai in modo che li', 330, 76, GREY)}
      {big('s-b', 'tocchino', 420, 190, BLUE)}
      {big('s-c', 'prima <span style="color:{BLUE}">toccano</span>,', 800, 110, INK)}
      {big('s-d', 'poi <span style="color:{GRN}">comprano</span>.', 940, 110, INK)}''', '''    tl.fromTo("#s-b", { scale: 1.7, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, «tocchino» - 0.15);
    tl.fromTo("#s-c", { x: -900 }, { x: 0, duration: 0.3, ease: "expo.out" }, «prima» - 0.1);
    tl.fromTo("#s-d", { x: 900 }, { x: 0, duration: 0.3, ease: "expo.out" }, «comprano» - 0.25);''', mq='TOCCA',
    fx=[('thud', 'tocchino', -0.15, 0.3), ('whoosh-short', 'prima', -0.1, 0.2), ('register', 'comprano', 0.0, 0.3)])

# ================================================================ KEYWORD + LOOP
# 20. "Scrivi NEGOZIO nei commenti" (comment bar + light iOS keyboard)
add('a20', 'cta', 'mando', f'''      {small('t-a', 'scrivi nei commenti', 330, 66, GREY)}
      {big('t-w', 'NEGOZIO', 420, 190, BLUE)}
      {commentbar('t', 'NEGOZIO', 760, dark=False)}
      {keyboard('t', 1230, dark=False)}''', '''    tl.fromTo("#t-kb", { y: 700 }, { y: 0, duration: 0.34, ease: "expo.out" }, 0.0);
    tl.fromTo("#t-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, 0.05);
    tl.fromTo("#t-w", { scale: 1.5, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.28, ease: "expo.out" }, «negozioK» - 0.15);
''' + commentbar_js('t', '«negozioK» - 0.1', 0.08) + keys_js('t', 'NEGOZIO', '«negozioK» - 0.1', 0.08) + '''    tl.fromTo("#t-pub", { scale: 1 }, { scale: 1.25, duration: 0.1, yoyo: true, repeat: 1 }, «negozioK» + 0.55);''', KBCSS,
    fx=[('swipe', 'cta', -0.15, 0.24), ('typing', 'negozioK', -0.1, 0.24), ('click', 'negozioK', 0.55, 0.4)])

# 21. "...e ti mando cinque trucchi da Apple Store da usare nel tuo." (the DM)
add('a21', 'mando', 'quindi', f'''      {small('u-a', 'ti arriva in DM', 330, 66, GREY)}
      {dmcard('u', 470, '5 trucchi da Apple Store', 'da usare nel tuo negozio', dark=False, icon=BLUE)}''', '''    tl.fromTo("#u-dm", { y: -900, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.3)" }, 0.0);
    tl.fromTo("#u-doc", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, «trucchi» - 0.2);''', ground='grey',
    fx=[('notif', 'mando', 0.0, 0.26), ('pop', 'trucchi', -0.2, 0.24)])

# 22. loop: "Quindi, la prossima volta..." -> "Entra in un Apple Store e guarda i portatili." (back to the first frame)
add('a22', 'quindi', 'END', f'''      {hookset('z')}
      {small('z-a', 'la prossima volta…', 160, 70, GREY)}''', hookjs('z') + '''    tl.fromTo("#zl2", { y: -30 }, { y: 30, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#zl1-g, #zl2-g, #zl3-g", { rotationY: -42 }, { rotationY: -30, duration: DUR, ease: "sine.out" }, 0);
    gsap.set("#z-t", { opacity: 0, scale: 1.4 });
    tl.fromTo("#z-a", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.03);
    tl.to("#z-a", { opacity: 0, duration: 0.12 }, DUR - 0.34);
    tl.to("#z-t", { opacity: 1, scale: 1.08, duration: 0.28, ease: "power2.in" }, DUR - 0.3);''', cam=False,
    fx=[('riser', 'quindi', 0.0, 0.12), ('whoosh-short', 'quindi', 0.9, 0.2)])
