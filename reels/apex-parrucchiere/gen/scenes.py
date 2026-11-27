# apex-parrucchiere: "Questo parrucchiere ha alzato i prezzi del 40%. E ha perso un cliente su cinque. Eppure adesso lavora di meno, e guadagna di più."
# Triple hook (context -> curiosity -> reversal), then the maths on screen, a SÌ/NO question, the lesson, keyword PREZZI and a loop line.
# The numbers are a worked example (200 clients x 25 euro vs 160 x 35 euro), not a real salon's accounts.
# Look: dark luxury salon, gold accents, photoreal generated objects (chair, scissors, dryer, cash, planner) with sheen, floor reflections and 3D float.
import sys
sys.path.insert(0, '.'); sys.path.insert(0, '../../apex-kit')
from kit import *
from ui import *
from times import T
BED = 0.07; ROOT = '#0a0a0a'
W = '#f5f5f7'; GOLD = '#e3c27a'; GRN = '#30d158'; RED = '#ff453a'; GREY = '#8e8e93'
THEME = f'''
    .st.lux {{ background: radial-gradient(120% 75% at 50% 32%, #221d16 0%, #0d0c0b 55%, #070707 100%); color: {W}; }}
    .lux .bgfx i:nth-child(1) {{ background: radial-gradient(closest-side, rgba(227,194,122,0.22), rgba(227,194,122,0)); }}
    .lux .bgfx i:nth-child(2) {{ background: radial-gradient(closest-side, rgba(255,255,255,0.06), rgba(255,255,255,0)); }}
    .lux .mq {{ -webkit-text-stroke: 4px rgba(227,194,122,0.10); }}
    .ob {{ position: absolute; transform-style: preserve-3d; }}
    .ob img {{ display: block; width: 100%; filter: drop-shadow(0 60px 50px rgba(0,0,0,0.65)); }}
    .ob .sh {{ position: absolute; inset: 0; -webkit-mask-size: 100% 100%; mask-size: 100% 100%; background: linear-gradient(105deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 58%); background-size: 300% 100%; background-position: 120% 0; mix-blend-mode: screen; }}
    .rf {{ position: absolute; transform: scaleY(-1); opacity: 0.16; -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0) 40%); mask-image: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0) 40%); }}
    .rf img {{ display: block; width: 100%; }}
    .fl {{ position: absolute; height: 120px; border-radius: 50%; background: radial-gradient(closest-side, rgba(0,0,0,0.7), rgba(0,0,0,0)); }}
    .tag {{ position: absolute; padding: 34px 56px 34px 92px; border-radius: 26px 90px 90px 26px; background: linear-gradient(135deg, #f3dc9e, #c9a14f); color: #1a1408; font: 700 120px/1 "SF Pro Display"; letter-spacing: -0.04em; box-shadow: 0 40px 70px -20px rgba(0,0,0,0.7), inset 0 2px 0 rgba(255,255,255,0.6); white-space: nowrap; }}
    .tag::before {{ content: ""; position: absolute; left: 34px; top: 50%; width: 30px; height: 30px; margin-top: -15px; border-radius: 50%; background: #0d0c0b; box-shadow: inset 0 3px 6px rgba(0,0,0,0.6); }}
    .pp {{ position: absolute; width: 120px; height: 150px; }}
    .gd {{ color: {GOLD}; }}
'''
R = Reel(T, THEME, grounds={'lux': (' lux', '#0a0a0a')})
add = R.add
EUR = 'function (v) { return String(Math.round(v)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, "."); }'

def obj(i, name, left, top, w, refl=True, sheen=True):
    m = f'-webkit-mask-image:url(assets/img/{name}.png);mask-image:url(assets/img/{name}.png)'
    s = f'<div class="sh" id="{i}-sh" style="{m}"></div>' if sheen else ''
    r = (f'<div class="rf" id="{i}-rf" data-layout-allow-overlap style="left:{left}px;top:{top + w * 0.96:.0f}px;width:{w}px"><img src="assets/img/{name}.png"></div>') if refl else ''
    return r + f'<div class="ob" id="{i}" data-layout-allow-overlap style="left:{left}px;top:{top}px;width:{w}px"><img src="assets/img/{name}.png">{s}</div>'
def sheen(i, t, d=0.9):
    return f'    tl.fromTo("#{i}-sh", {{ backgroundPosition: "120% 0" }}, {{ backgroundPosition: "-20% 0", duration: {d}, ease: "power2.inOut" }}, {t});\n'
def floatjs(i, ry0=-14, ry1=14, y=24):
    return f'    tl.fromTo("#{i}", {{ rotationY: {ry0}, y: 0 }}, {{ rotationY: {ry1}, y: -{y}, duration: DUR, ease: "sine.inOut" }}, 0);\n'
PERSON = '<svg viewBox="0 0 120 150" width="120" height="150"><circle cx="60" cy="38" r="30" fill="@"/><path d="M8 150 Q8 82 60 82 Q112 82 112 150 Z" fill="@"/></svg>'
def person(i, x, y, col=W, s=1.0):
    return f'<div class="pp" id="{i}" data-layout-allow-overlap style="left:{x}px;top:{y}px;transform:scale({s});transform-origin:50% 100%">{PERSON.replace("@", col)}</div>'
def grid(p, cols=10, rows=5, x0=95, y0=760, dx=90, dy=120, s=0.62):
    return ''.join(person(f'{p}{k}', x0 + (k % cols) * dx, y0 + (k // cols) * dy, W, s) for k in range(cols * rows))
def pile(p, n, left, top, w, dy):
    # a pile of cash bricks; brick k sits dy pixels above brick k-1
    return ''.join(f'<div class="ob" id="{p}{k}" data-layout-allow-overlap style="left:{left + (k % 2) * 14 - 7}px;top:{top - k * dy}px;width:{w}px;z-index:{k}"><img src="assets/img/cash.png"></div>' for k in range(n))
def pile_js(p, n, t, st=0.12):
    ids = ', '.join(f'#{p}{k}' for k in range(n))
    return f'    tl.fromTo("{ids}", {{ y: -1300, rotation: -8 }}, {{ y: 0, rotation: 0, duration: 0.34, ease: "power3.in", stagger: {st} }}, {t});\n'

# ================================================================ TRIPLE HOOK
HOOK = (f'<div class="fl" data-layout-allow-overlap style="left:190px;top:1500px;width:700px"></div>'
        + obj('@-ch', 'chair', 150, 640, 780)
        + f'<div id="@-u" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:250px;text-align:center;font:600 64px/1 {SF};letter-spacing:0.02em;color:{GREY}">prezzi</div>'
        + f'<div id="@-n" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:330px;text-align:center;font:700 250px/1 {SF};letter-spacing:-0.05em;color:{GOLD}">+40%</div>')
# 1. CONTEXT: "Questo parrucchiere ha alzato i prezzi del 40%."
add('p01', 'start', 'perso', f'''      {HOOK.replace('@', 'a')}''', floatjs('a-ch', -10, 8, 20) + sheen('a-ch', 0.3) + '''    tl.fromTo("#a-n", { scale: 1.06 }, { scale: 1, duration: 0.5, ease: "expo.out" }, 0);
    punch(tl, "#a-n", «quaranta», 1.12);''', ground='lux', cam=False,
    fx=[('whoosh', 'start', 0.0, 0.3), ('register', 'start', 0.05, 0.3), ('ding', 'quaranta', 0.0, 0.24)])

# 2. CURIOSITY: "E ha perso un cliente su cinque." (five clients, one walks off)
add('p02', 'perso', 'eppure', f'''      {''.join(person(f'b-p{k}', 130 + k * 170, 820, W, 1.05) for k in range(5))}
      {big('b-n', '1 su 5', 360, 200, RED)}
      {small('b-a', 'clienti persi', 590, 66, GREY)}''', '''    tl.fromTo("#b-p0, #b-p1, #b-p2, #b-p3, #b-p4", { scale: 0, opacity: 0 }, { scale: 1.05, opacity: 1, duration: 0.2, ease: "back.out(2)", stagger: 0.06 }, 0.0);
    tl.to("#b-p4 path, #b-p4 circle", { fill: "#ff453a", duration: 0.12 }, «cinque» - 0.35);
    tl.to("#b-p4", { x: 500, rotation: 18, opacity: 0, duration: 0.45, ease: "power3.in" }, «cinque» - 0.1);
    tl.fromTo("#b-n", { scale: 1.6, opacity: 0, filter: "blur(14px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }, «cinque» - 0.35);
    tl.fromTo("#b-a", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «cinque» - 0.2);''', ground='lux',
    fx=[('pop', 'perso', 0.0, 0.16), ('pop', 'perso', 0.12, 0.16), ('pop', 'perso', 0.24, 0.16), ('glitch', 'cinque', -0.35, 0.2), ('whoosh-short', 'cinque', -0.1, 0.2)])

# 3. REVERSAL: "Eppure adesso lavora di meno, e guadagna di più." (hours shrink, cash rises)
add('p03', 'eppure', 'resta', f'''      {small('c-e', 'eppure', 300, 70, GREY)}
      <div class="card" id="c-l" style="left:80px;top:440px;width:440px;height:900px;border-radius:44px;background:#16140f;box-shadow:0 0 0 2px rgba(227,194,122,0.25)" data-layout-allow-overlap>
        <div style="position:absolute;left:0;right:0;top:50px;text-align:center;font:700 64px/1.05 {SF};color:{W}">lavora<br><span style="color:{GRN}">di meno</span></div>
        <div style="position:absolute;left:150px;top:300px;width:140px;height:520px;border-radius:22px;background:rgba(255,255,255,0.08)"></div>
        <div id="c-h" style="position:absolute;left:150px;top:300px;width:140px;height:520px;border-radius:22px;background:{RED};transform-origin:50% 100%"></div>
      </div>
      <div class="card" id="c-r" style="left:560px;top:440px;width:440px;height:900px;border-radius:44px;background:#16140f;box-shadow:0 0 0 2px rgba(227,194,122,0.25)" data-layout-allow-overlap>
        <div style="position:absolute;left:0;right:0;top:50px;text-align:center;font:700 64px/1.05 {SF};color:{W}">guadagna<br><span style="color:{GOLD}">di più</span></div>
      </div>
      {pile('c-m', 4, 600, 1040, 360, 110)}''', '''    tl.fromTo("#c-l", { rotationY: -90, opacity: 0, transformPerspective: 1600 }, { rotationY: 0, opacity: 1, duration: 0.4, ease: "expo.out" }, 0.1);
    tl.fromTo("#c-r", { rotationY: 90, opacity: 0, transformPerspective: 1600 }, { rotationY: 0, opacity: 1, duration: 0.4, ease: "expo.out" }, «guadagna» - 0.45);
    tl.fromTo("#c-h", { scaleY: 1 }, { scaleY: 0.45, backgroundColor: "#30d158", duration: 0.6, ease: "power3.inOut" }, «meno» - 0.3);
''' + pile_js('c-m', 4, '«guadagna» - 0.15', 0.13), ground='lux',
    fx=[('swoosh', 'eppure', 0.1, 0.24), ('tick', 'meno', -0.2, 0.2), ('swoosh', 'guadagna', -0.45, 0.2), ('flutter', 'guadagna', 0.15, 0.3), ('thud', 'guadagna', 0.2, 0.18),
        ('flutter', 'guadagna', 0.42, 0.3), ('cash', 'guadagna', 0.62, 0.3)])

# 4. "Resta fino alla fine, perché questo vale per qualsiasi lavoro, anche il tuo."
JOBS = ['parrucchiere', 'estetista', 'personal trainer', 'ristorante', 'consulente', 'il tuo']
add('p04', 'resta', 'facciamo', f'''      {small('d-a', 'resta fino', 400, 80, GREY)}
      {big('d-b', 'alla <span class="gd">fine.</span>', 490, 170, W)}
      {progress('d', 810, GOLD, dark=True)}
      {''.join(f'<div class="chip" id="d-c{k}" style="left:{[90, 560, 120, 600, 160, 540][k]}px;top:{1000 + (k // 2) * 140}px;background:{GOLD if k == 5 else "#1c1a16"};color:{"#1a1408" if k == 5 else W};box-shadow:0 0 0 2px rgba(227,194,122,0.3)">{j}</div>' for k, j in enumerate(JOBS))}''', '''    blurIn(tl, "#d-b", 0.05, 0.24);
''' + progress_js('d', 0.15, 2.0) + '''    tl.fromTo("#d-c0, #d-c1, #d-c2, #d-c3, #d-c4", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)", stagger: 0.14 }, «qualsiasi» - 0.1);
    tl.fromTo("#d-c5", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1.15, duration: 0.26, ease: "back.out(2.6)" }, «tuo» - 0.15);''', ground='lux',
    fx=[('swoosh', 'resta', 0.15, 0.22), ('pop', 'qualsiasi', -0.1, 0.16), ('pop', 'qualsiasi', 0.04, 0.16), ('pop', 'qualsiasi', 0.18, 0.16), ('pop', 'qualsiasi', 0.32, 0.16),
        ('pop', 'qualsiasi', 0.46, 0.16), ('ding', 'tuo', -0.15, 0.22)])

# ================================================================ THE MATHS
# 5. "Facciamo i conti." (a till receipt prints)
add('p05', 'facciamo', 'prima', f'''      {big('e-a', 'facciamo i <span class="gd">conti</span>', 330, 120, W)}
      <div id="e-r" data-layout-allow-overlap style="position:absolute;left:290px;top:560px;width:500px;height:900px;background:#f4efe4;border-radius:8px;transform-origin:50% 0;box-shadow:0 50px 80px -30px rgba(0,0,0,0.8)">
        {''.join(f'<div style="position:absolute;left:50px;right:50px;top:{80 + k * 110}px;height:16px;border-radius:8px;background:#d9d1c1;width:{[380, 300, 360, 240, 330, 280, 360][k]}px"></div>' for k in range(7))}
      </div>''', '''    tl.fromTo("#e-a", { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.22, ease: "expo.out" }, 0.0);
    tl.fromTo("#e-r", { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: "power1.out" }, 0.1);''', ground='lux',
    fx=[('register', 'facciamo', 0.0, 0.26), ('typing', 'facciamo', 0.1, 0.18)])

# 6. "Prima: 200 clienti al mese, a 25 euro." (the client wall fills up, the 25 euro tag)
add('p06', 'prima', 'cinquemila', f'''      {small('f-a', 'prima', 290, 64, GREY)}
      {big('f-n', '<span id="f-v">0</span> <span style="font-size:90px;color:{GREY}">clienti/mese</span>', 370, 190, W)}
      {grid('f')}
      <div class="tag" id="f-t" style="left:330px;top:1420px">25 €</div>''', '''    count(tl, "#f-v", 0, 200, 0.05, 1.0, function (v) { return String(Math.round(v)); }, "power2.out");
    tl.fromTo(".pp[id^=\"f\"]", { scale: 0, opacity: 0 }, { scale: 0.62, opacity: 1, duration: 0.14, ease: "back.out(2)", stagger: 0.016 }, 0.05);
    tl.fromTo("#f-t", { y: -1500, rotation: -25 }, { y: 0, rotation: -6, duration: 0.45, ease: "back.out(1.3)" }, «venticinque» - 0.35);''', ground='lux',
    fx=[('counter', 'duecento', -0.4, 0.26), ('ding', 'venticinque', 0.05, 0.22)])

# 7. "5.000 euro." (the counter and the cash pile)
add('p07', 'cinquemila', 'sempre', f'''      {big('g-n', '<span id="g-v">0</span> €', 330, 200, GOLD)}
      {small('g-a', 'al mese', 560, 64, GREY)}
      <div class="fl" data-layout-allow-overlap style="left:240px;top:1430px;width:600px"></div>
      {pile('g-m', 4, 330, 1150, 420, 120)}''', '''    count(tl, "#g-v", 0, 5000, 0.0, 0.7, ''' + EUR + ''', "power2.out");
''' + pile_js('g-m', 4, '0.0', 0.1), ground='lux',
    fx=[('flutter', 'cinquemila', 0.15, 0.26), ('flutter', 'cinquemila', 0.45, 0.26), ('cash', 'cinquemila', 0.7, 0.3)])

# 8. "Sempre pieno, sempre di corsa, mai un giorno libero." (a full planner, the dryer rushing by, a week with no day off)
DAYS = 'LMMGVSD'
add('p08', 'sempre', 'poi', f'''      {obj('h-ag', 'agenda', 190, 330, 700, refl=False)}
      <div id="h-st" class="tw" data-layout-allow-overlap style="position:absolute;left:250px;top:560px;padding:20px 40px;border:10px solid {RED};border-radius:18px;font:800 96px/1 {SF};color:{RED};transform:rotate(-10deg);opacity:0">COMPLETO</div>
      {obj('h-dr', 'dryer', 700, 1050, 520, refl=False)}
      <div id="h-wk" data-layout-allow-overlap style="position:absolute;left:90px;top:1500px;width:900px;height:130px">
        {''.join(f'<div class="dy" style="left:{k * 130}px"><b>{d}</b><i id="h-x{k}"></i></div>' for k, d in enumerate(DAYS))}
      </div>''', floatjs('h-ag', -8, 8, 16) + '''    stamp(tl, "#h-st", 0.35, -10);
    tl.fromTo("#h-dr", { x: -1400, rotation: 8 }, { x: 0, rotation: -6, duration: 0.45, ease: "expo.out" }, «corsa» - 0.5);
    shake(tl, "#h-ag", «corsa», 12);
    tl.fromTo("#h-wk", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.22 }, «libero» - 0.7);
    tl.fromTo("#h-x0, #h-x1, #h-x2, #h-x3, #h-x4, #h-x5, #h-x6", { scale: 0 }, { scale: 1, duration: 0.12, ease: "back.out(3)", stagger: 0.06 }, «libero» - 0.45);''', '''
    .dy { position: absolute; top: 0; width: 110px; height: 130px; border-radius: 24px; background: #1c1a16; box-shadow: 0 0 0 2px rgba(255,255,255,0.08); }
    .dy b { position: absolute; left: 0; right: 0; top: 36px; text-align: center; font: 700 56px/1 "SF Pro Display"; color: #f5f5f7; }
    .dy i { position: absolute; inset: 0; border-radius: 24px; background: rgba(255,69,58,0.85); display: block; }''', ground='lux',
    fx=[('stamp', 'sempre', 0.35, 0.4), ('dryer', 'corsa', -0.55, 0.55), ('tick', 'libero', -0.45, 0.14), ('tick', 'libero', -0.33, 0.14), ('tick', 'libero', -0.21, 0.14),
        ('tick', 'libero', -0.09, 0.14), ('tick', 'libero', 0.03, 0.14), ('glitch', 'libero', 0.2, 0.16)])

# 9. "Poi alza il taglio a 35 euro." (the scissors cut the old tag, the new one drops)
add('p09', 'poi', 'esi', f'''      {small('i-a', 'poi alza il taglio a', 300, 66, GREY)}
      <div id="i-o" data-layout-allow-overlap style="position:absolute;left:330px;top:820px;width:420px;height:190px">
        <div class="tag" id="i-t1" style="left:0;top:0;clip-path:inset(0 50% 0 0)">25 €</div>
        <div class="tag" id="i-t2" style="left:0;top:0;clip-path:inset(0 0 0 50%)">25 €</div>
      </div>
      {obj('i-sc', 'scissors', 380, 520, 420, refl=False)}
      <div class="tag" id="i-n" style="left:300px;top:1120px;font-size:150px">35 €</div>''', '''    tl.fromTo("#i-sc", { x: 700, y: -300, rotation: 30 }, { x: 0, y: 0, rotation: 0, duration: 0.4, ease: "expo.out" }, 0.0);
    tl.to("#i-sc", { y: 260, duration: 0.18, ease: "power3.in" }, «taglio» - 0.15);
    tl.to("#i-t1", { x: -260, y: 500, rotation: -40, opacity: 0, duration: 0.5, ease: "power2.in" }, «taglio» + 0.05);
    tl.to("#i-t2", { x: 260, y: 500, rotation: 40, opacity: 0, duration: 0.5, ease: "power2.in" }, «taglio» + 0.05);
    tl.to("#i-sc", { x: 800, y: -200, rotation: -20, duration: 0.35, ease: "power2.in" }, «taglio» + 0.3);
    tl.fromTo("#i-n", { y: -1600, rotation: 20 }, { y: 0, rotation: -5, duration: 0.45, ease: "back.out(1.4)" }, «trentacinque» - 0.4);
    punch(tl, "#i-n", «trentacinque» + 0.1, 1.1);''', ground='lux', mq='35 €',
    fx=[('whoosh-short', 'poi', 0.0, 0.2), ('snip', 'taglio', 0.0, 0.5), ('snip', 'taglio', 0.12, 0.4), ('tear', 'taglio', 0.05, 0.16), ('thud', 'trentacinque', 0.05, 0.28), ('ding', 'trentacinque', 0.12, 0.22)])

# 10. "E sì, 40 clienti se ne vanno." (one client in five leaves the wall)
GONE = [k for k in range(50) if k % 5 == 4]
add('p10', 'esi', 'ma', f'''      {big('j-n', '−40', 330, 200, RED)}
      {small('j-a', 'clienti', 560, 64, GREY)}
      {grid('j')}''', '''    gsap.set(".pp[id^=\"j\"]", { scale: 0.62 });
    tl.to("''' + ', '.join(f'#j{k} path, #j{k} circle' for k in GONE) + '''", { fill: "#ff453a", duration: 0.12, stagger: 0.02 }, «quaranta2» - 0.2);
    tl.to("''' + ', '.join(f'#j{k}' for k in GONE) + '''", { y: 900, rotation: 30, opacity: 0, duration: 0.5, ease: "power3.in", stagger: 0.04 }, «vanno» - 0.4);
    tl.fromTo("#j-n", { scale: 1.6, opacity: 0, filter: "blur(14px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }, «quaranta2» - 0.25);''', ground='lux',
    fx=[('glitch', 'quaranta2', -0.2, 0.2), ('whoosh-short', 'vanno', -0.4, 0.22)])

# 11. "Ma guarda: 160 per 35 fa 5.600 euro." (the sum builds, the pile grows taller)
add('p11', 'ma', 'seicento', f'''      {small('k-a', 'ma guarda', 290, 66, GREY)}
      <div id="k-eq" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:380px;text-align:center;font:700 120px/1 {SF};letter-spacing:-0.04em;color:{W}"><span id="k-1">160</span> <span id="k-2" class="gd">× 35</span></div>
      {big('k-n', '<span id="k-v">0</span> €', 540, 200, GOLD)}
      <div class="fl" data-layout-allow-overlap style="left:240px;top:1560px;width:600px"></div>
      {pile('k-m', 5, 330, 1280, 420, 120)}''', '''    tl.fromTo("#k-1", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.2 }, «centosessanta» - 0.15);
    tl.fromTo("#k-2", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.2 }, «trentacinque2» - 0.15);
    tl.fromTo("#k-n", { opacity: 0 }, { opacity: 1, duration: 0.1 }, «cinquemilasei» - 0.3);
    count(tl, "#k-v", 0, 5600, «cinquemilasei» - 0.3, 0.9, ''' + EUR + ''', "power2.out");
''' + pile_js('k-m', 5, '«cinquemilasei» - 0.3', 0.12), ground='lux',
    fx=[('key-press', 'centosessanta', -0.15, 0.24), ('key-press', 'trentacinque2', -0.15, 0.24), ('counter', 'cinquemilasei', -0.3, 0.24), ('flutter', 'cinquemilasei', 0.0, 0.26),
        ('flutter', 'cinquemilasei', 0.3, 0.26), ('cash', 'cinquemilasei', 0.7, 0.32)])

# 12. "600 euro in più. E 40 appuntamenti in meno." (the gain, then the empty slots)
add('p12', 'seicento', 'circa', f'''      {big('l-n', '+<span id="l-v">0</span> €', 380, 260, GRN)}
      {small('l-a', 'in più, ogni mese', 660, 64, GREY)}
      {''.join(f'<div class="ob" id="l-b{k}" data-layout-allow-overlap style="left:{[60, 640, 120, 700, 380][k]}px;top:{[860, 900, 1180, 1220, 1020][k]}px;width:300px"><img src="assets/img/cash.png"></div>' for k in range(5))}
      <div class="chip" id="l-c" style="left:240px;top:1500px;background:#1c1a16;color:{W};font-size:56px;box-shadow:0 0 0 2px rgba(227,194,122,0.35)">−40 appuntamenti</div>''', '''    count(tl, "#l-v", 0, 600, 0.0, 0.6, function (v) { return String(Math.round(v)); }, "power2.out");
    punch(tl, "#l-n", 0.65, 1.12);
    tl.fromTo("#l-b0, #l-b1, #l-b2, #l-b3, #l-b4", { y: 700, rotation: 0, scale: 0.4, opacity: 0 }, { y: 0, rotation: function (i) { return [-24, 18, -10, 26, 4][i]; }, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.6)", stagger: 0.07 }, 0.1);
    pop(tl, "#l-c", «quaranta3» - 0.2);''', ground='lux', mq='+600 €',
    fx=[('cash', 'seicento', 0.0, 0.32), ('sparkle', 'seicento', 0.2, 0.2), ('flutter', 'seicento', 0.15, 0.3), ('pop', 'quaranta3', -0.2, 0.22)])

# 13. "Circa 30 ore libere al mese." (the clock spins back, 30 hours)
add('p13', 'circa', 'chi', f'''      <svg viewBox="0 0 600 600" width="600" height="600" style="position:absolute;left:240px;top:330px" data-layout-allow-overlap>
        <circle cx="300" cy="300" r="270" fill="#16140f" stroke="{GOLD}" stroke-width="14"/>
        {''.join(f'<rect x="294" y="48" width="12" height="44" rx="6" fill="{GOLD}" transform="rotate({k * 30} 300 300)"/>' for k in range(12))}
        <g id="m-hh" style="transform-origin:300px 300px;transform-box:view-box"><rect x="292" y="140" width="16" height="170" rx="8" fill="{W}"/></g>
        <g id="m-mm" style="transform-origin:300px 300px;transform-box:view-box"><rect x="295" y="80" width="10" height="230" rx="5" fill="{GOLD}"/></g>
        <circle cx="300" cy="300" r="18" fill="{GOLD}"/>
      </svg>
      {big('m-n', '<span id="m-v">0</span> ore', 1010, 200, W)}
      {small('m-a', 'libere al mese', 1240, 70, GRN)}''', '''    tl.fromTo("#m-mm", { rotation: 0 }, { rotation: -1080, duration: 1.4, ease: "power2.inOut" }, 0.1);
    tl.fromTo("#m-hh", { rotation: 0 }, { rotation: -90, duration: 1.4, ease: "power2.inOut" }, 0.1);
    count(tl, "#m-v", 0, 30, «trenta» - 0.3, 0.8, function (v) { return String(Math.round(v)); }, "power2.out");
    tl.fromTo("#m-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.22 }, «trenta» + 0.4);''', ground='lux',
    fx=[('whoosh-short', 'circa', 0.0, 0.2), ('tick', 'circa', 0.2, 0.14), ('tick', 'circa', 0.45, 0.14), ('tick', 'circa', 0.7, 0.14), ('tick', 'circa', 0.95, 0.14), ('ding', 'trenta', 0.5, 0.22)])

# ================================================================ WHO LEFT, WHO STAYED
# 14. "Chi se n'è andato? Quelli che sceglievano solo il prezzo." (bargain hunters walk off with their discount tags)
add('p14', 'chi', 'chi2', f'''      {small('n-a', 'chi se n’è andato?', 300, 76, GREY)}
      {''.join(person(f'n-p{k}', 170 + k * 260, 760, '#6e6e73', 1.6) + f'<div class="chip" id="n-t{k}" style="left:{150 + k * 260}px;top:1040px;background:{RED};opacity:1">-20%</div>' for k in range(3))}
      {big('n-b', 'solo il <span style="color:{RED}">prezzo</span>', 1260, 120, W)}''', '''    tl.fromTo("#n-p0, #n-p1, #n-p2, #n-t0, #n-t1, #n-t2", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.22, stagger: 0.05 }, 0.1);
    tl.fromTo("#n-b", { opacity: 0, filter: "blur(14px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.24 }, «prezzo» - 0.8);
    tl.to("#n-p0, #n-t0, #n-p1, #n-t1, #n-p2, #n-t2", { x: 1100, duration: 0.6, ease: "power3.in", stagger: 0.04 }, «prezzo» - 0.05);''', ground='lux',
    fx=[('pop', 'chi', 0.1, 0.18), ('swipe', 'prezzo', -0.05, 0.24)])

# 15. "Chi è rimasto? Quelli che vengono per lui." (the chair in gold light, loyal clients around it)
add('p15', 'chi2', 'tu', f'''      {small('o-a', 'chi è rimasto?', 300, 76, GREY)}
      <div id="o-gl" data-layout-allow-overlap style="position:absolute;left:90px;top:520px;width:900px;height:900px;border-radius:50%;background:radial-gradient(closest-side,rgba(227,194,122,0.45),rgba(227,194,122,0))"></div>
      {obj('o-ch', 'chair', 260, 640, 560)}
      {''.join(person(f'o-p{k}', [90, 870, 130, 830][k], [700, 700, 1100, 1100][k], GOLD, 0.9) for k in range(4))}
      {big('o-b', 'vengono <span class="gd">per lui</span>', 1460, 110, W)}''', floatjs('o-ch', 10, -10, 18) + sheen('o-ch', 0.2) + '''    tl.fromTo("#o-gl", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "expo.out" }, 0.0);
    tl.fromTo("#o-p0, #o-p1, #o-p2, #o-p3", { scale: 0, opacity: 0 }, { scale: 0.9, opacity: 1, duration: 0.24, ease: "back.out(2)", stagger: 0.08 }, «vengono» - 0.5);
    tl.fromTo("#o-b", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.24 }, «vengono» - 0.1);''', ground='lux',
    fx=[('sparkle', 'chi2', 0.0, 0.2), ('pop', 'vengono', -0.5, 0.16), ('pop', 'vengono', -0.42, 0.16), ('pop', 'vengono', -0.34, 0.16), ('pop', 'vengono', -0.26, 0.16)])

# ================================================================ QUESTION + LESSON
# 16. "Tu li alzeresti? Scrivi SÌ, o NO."
add('p16', 'tu', 'lezione', f'''      {small('q-a', 'tu li alzeresti?', 330, 84, W)}
      <div id="q-y" style="position:absolute;left:110px;top:560px;width:860px;height:260px;border-radius:60px;background:{GRN};color:#04210c;font:800 150px/260px {SF};text-align:center" data-layout-allow-overlap>SÌ</div>
      <div id="q-n" style="position:absolute;left:110px;top:880px;width:860px;height:260px;border-radius:60px;background:{RED};color:#fff;font:800 150px/260px {SF};text-align:center" data-layout-allow-overlap>NO</div>
      {small('q-b', 'scrivilo nei commenti', 1220, 56, GREY)}''', '''    tl.fromTo("#q-y", { x: -1100 }, { x: 0, duration: 0.3, ease: "expo.out" }, «si» - 0.3);
    tl.fromTo("#q-n", { x: 1100 }, { x: 0, duration: 0.3, ease: "expo.out" }, «no» - 0.25);
    tl.fromTo("#q-b", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «no» + 0.1);''', ground='lux',
    fx=[('whoosh-short', 'si', -0.3, 0.22), ('pop', 'si', 0.0, 0.24), ('whoosh-short', 'no', -0.25, 0.22), ('pop', 'no', 0.05, 0.24)])

# 17. "La lezione: se hai sempre l'agenda piena, non sei bravo." (the full planner, crossed: not a skill)
add('p17', 'lezione', 'sei', f'''      <div class="eyebrow" id="r-e" style="top:300px;opacity:1;color:{GOLD};font-size:40px;letter-spacing:0.2em">LA LEZIONE</div>
      {big('r-a', 'agenda piena', 380, 130, W)}
      {obj('r-ag', 'agenda', 240, 600, 600, refl=False)}
      {big('r-b', '≠ bravo', 1300, 170, RED)}''', floatjs('r-ag', 8, -8, 14) + sheen('r-ag', 0.4) + '''    tl.fromTo("#r-a", { opacity: 0, filter: "blur(14px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.24 }, «piena» - 0.5);
    tl.fromTo("#r-b", { scale: 1.8, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }, «bravo» - 0.3);
    shake(tl, "#p17-cam", «bravo», 14);''', ground='lux',
    fx=[('key-press', 'lezione', 0.0, 0.16), ('swoosh', 'piena', -0.5, 0.2), ('thud', 'bravo', -0.1, 0.32)])

# 18. "Sei troppo economico." (the cheap tag shakes)
add('p18', 'sei', 'cta', f'''      {small('s-a', 'sei', 360, 90, GREY)}
      {big('s-b', 'troppo', 470, 200, W)}
      {big('s-c', 'economico.', 680, 180, GOLD)}
      <div class="tag" id="s-t" style="left:330px;top:1080px">25 €</div>''', '''    tl.fromTo("#s-b", { opacity: 0, scale: 2 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power4.in" }, «economico» - 0.4);
    tl.fromTo("#s-c", { opacity: 0, scale: 2 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power4.in" }, «economico»);
    tl.fromTo("#s-t", { y: 900, rotation: 0 }, { y: 0, rotation: -6, duration: 0.3, ease: "back.out(1.6)" }, 0.1);
    shake(tl, "#s-t", «economico» + 0.2, 20);''', ground='lux', mq='ECONOMICO',
    fx=[('thud', 'economico', -0.24, 0.3), ('thud', 'economico', 0.16, 0.34), ('glitch', 'economico', 0.25, 0.18)])

# ================================================================ KEYWORD + LOOP
# 19. "Scrivi PREZZI nei commenti" (comment bar + dark keyboard)
add('p19', 'cta', 'mando', f'''      {small('t-a', 'scrivi nei commenti', 330, 66, GREY)}
      {big('t-w', 'PREZZI', 420, 200, GOLD)}
      {commentbar('t', 'PREZZI', 780, dark=True)}
      {keyboard('t', 1230, dark=True)}''', '''    tl.fromTo("#t-kb", { y: 700 }, { y: 0, duration: 0.3, ease: "expo.out" }, 0.0);
    tl.fromTo("#t-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.26, ease: "expo.out" }, 0.0);
    tl.fromTo("#t-w", { scale: 1.5, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, «prezziK» - 0.2);
''' + commentbar_js('t', '«prezziK» - 0.2', 0.07) + keys_js('t', 'PREZZI', '«prezziK» - 0.2', 0.07) + '''    tl.fromTo("#t-pub", { scale: 1 }, { scale: 1.25, duration: 0.08, yoyo: true, repeat: 1 }, «prezziK» + 0.35);''', KBCSS, ground='lux',
    fx=[('swipe', 'cta', -0.15, 0.24), ('typing', 'prezziK', -0.2, 0.24), ('click', 'prezziK', 0.35, 0.4)])

# 20. "...e ti mando come alzarli senza perdere i clienti migliori." (the DM)
add('p20', 'mando', 'epensa', f'''      {small('u-a', 'ti arriva in DM', 330, 66, GREY)}
      {dmcard('u', 470, 'Come alzare i prezzi', 'senza perdere i clienti migliori', dark=True, icon='#c9a14f')}
      {pile('u-m', 3, 330, 1250, 420, 120)}''', '''    tl.fromTo("#u-dm", { y: -900, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.3)" }, 0.0);
    tl.fromTo("#u-doc", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, 0.45);
''' + pile_js('u-m', 3, '1.0', 0.12), ground='lux',
    fx=[('notif', 'mando', 0.0, 0.26), ('pop', 'mando', 0.45, 0.22), ('flutter', 'mando', 1.2, 0.24), ('cash', 'mando', 1.5, 0.26)])

# 21. loop: "E pensa che questo parrucchiere..." -> "Questo parrucchiere ha alzato i prezzi del 40%." (back to the first frame)
add('p21', 'epensa', 'END', f'''      {HOOK.replace('@', 'z')}''', '''    tl.fromTo("#z-ch", { rotationY: -30, y: 80, scale: 0.9 }, { rotationY: -10, y: 0, scale: 1, duration: DUR - 0.1, ease: "power2.out" }, 0);
    tl.fromTo("#z-n", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1.06, duration: DUR - 0.15, ease: "power2.in" }, 0);
    tl.fromTo("#z-u", { opacity: 0 }, { opacity: 1, duration: 0.3 }, DUR - 0.5);''', ground='lux', cam=False,
    fx=[('riser', 'epensa', 0.0, 0.12), ('whoosh-short', 'epensa', 1.4, 0.2)])
