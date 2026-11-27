# apex-parrucchiere: "Questo parrucchiere ha alzato i prezzi del 40%. E ha perso un cliente su cinque. Eppure adesso lavora di meno, e guadagna di più."
# Triple hook (context -> curiosity -> reversal), the maths on screen, a SÌ/NO question, the lesson, keyword PREZZI and a loop line.
# The numbers are a worked example (200 clients x 25 euro vs 160 x 35 euro), not a real salon's accounts.
# Look: flat motion graphics on cream, a hairdresser cutting a client's hair from the very first frame (salon.py), bold colour, everything moving.
import sys
sys.path.insert(0, '.'); sys.path.insert(0, '../../apex-kit')
from kit import *
from ui import *
from times import T
from salon import salon, salon_js, scissors, INK, CORAL, TEAL, SUN, CREAM, NAVY, SKIN1, SKIN2, HAIR1
BED = 0.07; ROOT = CREAM
GRN = '#2a9d55'; RED = '#e63946'; GREY = '#7a746b'; NOTE = '#f4a261'
THEME = f'''
    .st.cr {{ background: {CREAM}; color: {INK}; }}
    .cr .bgfx i:nth-child(1) {{ background: radial-gradient(closest-side, rgba(255,90,95,0.16), rgba(255,90,95,0)); }}
    .cr .bgfx i:nth-child(2) {{ background: radial-gradient(closest-side, rgba(46,196,182,0.18), rgba(46,196,182,0)); }}
    .cr .mq {{ -webkit-text-stroke: 4px rgba(27,27,31,0.06); }}
    .st.co {{ background: {CORAL}; color: #fff; }}
    .co .bgfx i:nth-child(1) {{ background: radial-gradient(closest-side, rgba(255,190,11,0.35), rgba(255,190,11,0)); }}
    .co .bgfx i:nth-child(2) {{ background: radial-gradient(closest-side, rgba(27,27,31,0.18), rgba(27,27,31,0)); }}
    .co .mq {{ -webkit-text-stroke: 4px rgba(255,255,255,0.18); }}
    .tag {{ position: absolute; padding: 30px 52px 30px 90px; border-radius: 26px 90px 90px 26px; background: {SUN}; color: {INK}; font: 700 120px/1 "SF Pro Display"; letter-spacing: -0.04em; border: 10px solid {INK}; box-shadow: 14px 14px 0 {INK}; white-space: nowrap; }}
    .tag::before {{ content: ""; position: absolute; left: 30px; top: 50%; width: 30px; height: 30px; margin-top: -15px; border-radius: 50%; background: {CREAM}; border: 7px solid {INK}; box-sizing: border-box; }}
    .nt {{ position: absolute; width: 330px; height: 170px; border-radius: 18px; background: {NOTE}; border: 8px solid {INK}; box-shadow: 10px 10px 0 {INK}; box-sizing: border-box; }}
    .nt::before {{ content: ""; position: absolute; left: 18px; right: 18px; top: 18px; bottom: 18px; border-radius: 10px; border: 5px solid rgba(27,27,31,0.35); }}
    .nt b {{ position: absolute; left: 34px; top: 34px; font: 700 70px/1 "SF Pro Display"; color: {INK}; }}
    .nt i {{ position: absolute; right: 44px; top: 40px; width: 80px; height: 80px; border-radius: 50%; background: #ffd6a5; border: 5px solid rgba(27,27,31,0.35); display: block; }}
    .pp {{ position: absolute; width: 120px; height: 150px; }}
    .cd {{ position: absolute; border-radius: 40px; background: #fff; border: 10px solid {INK}; box-shadow: 16px 16px 0 {INK}; box-sizing: border-box; }}
    .bt {{ position: absolute; height: 150px; border-radius: 75px; border: 10px solid {INK}; box-shadow: 12px 12px 0 {INK}; font: 800 66px/130px "SF Pro Display"; text-align: center; box-sizing: border-box; }}
'''
R = Reel(T, THEME, grounds={'cream': (' cr', CREAM), 'coral': (' co', CORAL)})
add = R.add
EUR = 'function (v) { return String(Math.round(v)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, "."); }'
def H(i, html, top, size, color=INK, extra=''):
    return big(i, html, top, size, color, extra)

def note(i, left, top, rot=0, z=0):
    return f'<div class="nt" id="{i}" data-layout-allow-overlap style="left:{left}px;top:{top}px;transform:rotate({rot}deg);z-index:{z}"><b>50</b><i></i></div>'
def pile(p, n, left, top, dy=46):
    return ''.join(note(f'{p}{k}', left + (k % 2) * 16 - 8, top - k * dy, [-3, 2, -1, 3, -2, 1, 0][k % 7], k) for k in range(n))
def pile_js(p, n, t, st=0.1):
    ids = ', '.join(f'#{p}{k}' for k in range(n))
    return f'    tl.fromTo("{ids}", {{ y: -2400, rotation: -20 }}, {{ y: 0, rotation: 0, duration: 0.34, ease: "power3.in", stagger: {st} }}, {t});\n'
PCOL = [(CORAL, HAIR1), (TEAL, '#e9c46a'), (SUN, INK), (NAVY, '#9c6644'), ('#8338ec', HAIR1)]
def person(i, x, y, k=0, s=1.0):
    body, hair = PCOL[k % 5]
    return (f'<div class="pp" id="{i}" data-layout-allow-overlap style="left:{x}px;top:{y}px;transform:scale({s});transform-origin:50% 100%">'
            f'<svg viewBox="0 0 120 150" width="120" height="150"><path class="bd" d="M10 150 Q10 86 60 86 Q110 86 110 150 Z" fill="{body}" stroke="{INK}" stroke-width="7"/>'
            f'<circle class="fc" cx="60" cy="44" r="30" fill="{SKIN1 if k % 2 == 0 else SKIN2}" stroke="{INK}" stroke-width="7"/>'
            f'<path d="M30 40 Q34 10 60 12 Q88 12 90 40 Q74 26 60 28 Q44 28 30 40 Z" fill="{hair}"/></svg></div>')
def grid(p, cols=10, rows=5, x0=95, y0=800, dx=90, dy=118, s=0.62):
    return ''.join(person(f'{p}{k}', x0 + (k % cols) * dx, y0 + (k // cols) * dy, k, s) for k in range(cols * rows))
AGENDA = (f'<svg viewBox="0 0 700 480" width="700" height="480"><path d="M20 40 Q190 0 350 40 Q510 0 680 40 V440 Q510 400 350 440 Q190 400 20 440 Z" fill="#fff" stroke="{INK}" stroke-width="10" stroke-linejoin="round"/>'
          f'<path d="M350 40 V440" stroke="{INK}" stroke-width="8"/>'
          + ''.join(f'<rect x="{60 if c == 0 else 390}" y="{80 + r * 44}" width="{[230, 200, 250, 180, 240, 210, 230, 190][r]}" height="22" rx="11" fill="{[CORAL, TEAL, SUN, CORAL, TEAL, SUN, CORAL, TEAL][(r + c) % 8]}"/>' for r in range(8) for c in range(2))
          + '</svg>')

# ================================================================ TRIPLE HOOK
HOOKTXT = (f'<div id="@-u" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:250px;text-align:center;font:700 70px/1 {SF};color:{INK}">prezzi</div>'
           f'<div class="tag" id="@-n" data-layout-allow-overlap style="left:300px;top:345px;font-size:150px;transform:rotate(-5deg)">+40%</div>')
# 1. CONTEXT: "Questo parrucchiere ha alzato i prezzi del 40%." (the stylist is already cutting on frame one)
add('p01', 'start', 'perso', f'''      {salon('a', 600)}
      {HOOKTXT.replace('@', 'a')}''', salon_js('a', 0.0, T['perso'] - T['start']) + '''    tl.fromTo("#a-n", { rotation: -5, y: 0 }, { rotation: 3, y: -14, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 6 }, 0);
    punch(tl, "#a-n", «quaranta», 1.15);
    tl.fromTo("#a-sv", { scale: 1 }, { scale: 1.06, duration: DUR, ease: "none", transformOrigin: "50% 40%" }, 0);''', ground='cream', cam=False,
    fx=[('snip', 'start', 0.0, 0.22), ('snip', 'start', 0.32, 0.18), ('snip', 'start', 0.64, 0.18), ('snip', 'start', 0.96, 0.18), ('snip', 'start', 1.28, 0.16),
        ('register', 'quaranta', -0.1, 0.16), ('ding', 'quaranta', 0.1, 0.2)])

# 2. CURIOSITY: "E ha perso un cliente su cinque." (five clients, one walks off)
add('p02', 'perso', 'eppure', f'''      {''.join(person(f'b-p{k}', 110 + k * 180, 860, k, 1.3) for k in range(5))}
      {H('b-n', '1 su 5', 380, 210, RED)}
      {small('b-a', 'clienti persi', 610, 66, GREY)}''', '''    tl.fromTo("#b-p0, #b-p1, #b-p2, #b-p3, #b-p4", { scale: 0, y: 80 }, { scale: 1.3, y: 0, duration: 0.24, ease: "back.out(2.2)", stagger: 0.06 }, 0.0);
    tl.to("#b-p4 .bd", { fill: "#e63946", duration: 0.1 }, «cinque» - 0.4);
    tl.to("#b-p4", { x: 560, rotation: 14, duration: 0.5, ease: "power3.in" }, «cinque» - 0.15);
    tl.fromTo("#b-n", { scale: 1.8, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.26, ease: "back.out(2)" }, «cinque» - 0.4);
    tl.fromTo("#b-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, «cinque» - 0.2);''', ground='cream',
    fx=[('pop', 'perso', 0.0, 0.16), ('pop', 'perso', 0.12, 0.16), ('pop', 'perso', 0.24, 0.16), ('glitch', 'cinque', -0.4, 0.18), ('whoosh-short', 'cinque', -0.15, 0.2)])

# 3. REVERSAL: "Eppure adesso lavora di meno, e guadagna di più." (hours bar drops, notes pile up)
add('p03', 'eppure', 'resta', f'''      {small('c-e', 'eppure', 290, 76, GREY)}
      <div class="cd" id="c-l" style="left:70px;top:430px;width:450px;height:960px;background:#fff" data-layout-allow-overlap>
        <div style="position:absolute;left:0;right:0;top:50px;text-align:center;font:800 66px/1.05 {SF};color:{INK}">lavora<br><span style="color:{TEAL}">di meno</span></div>
        <div style="position:absolute;left:145px;top:300px;width:140px;height:560px;border-radius:24px;background:#efe7dc;border:8px solid {INK};box-sizing:border-box"></div>
        <div id="c-h" style="position:absolute;left:145px;top:300px;width:140px;height:560px;border-radius:24px;background:{RED};border:8px solid {INK};box-sizing:border-box;transform-origin:50% 100%"></div>
      </div>
      <div class="cd" id="c-r" style="left:560px;top:430px;width:450px;height:960px;background:#fff" data-layout-allow-overlap>
        <div style="position:absolute;left:0;right:0;top:50px;text-align:center;font:800 66px/1.05 {SF};color:{INK}">guadagna<br><span style="color:{CORAL}">di più</span></div>
      </div>
      {pile('c-m', 6, 616, 1180)}''', '''    tl.fromTo("#c-l", { y: 1300, rotation: -8 }, { y: 0, rotation: 0, duration: 0.42, ease: "back.out(1.3)" }, 0.05);
    tl.fromTo("#c-r", { y: 1300, rotation: 8 }, { y: 0, rotation: 0, duration: 0.42, ease: "back.out(1.3)" }, «guadagna» - 0.5);
    tl.fromTo("#c-h", { scaleY: 1 }, { scaleY: 0.4, backgroundColor: "#2ec4b6", duration: 0.6, ease: "back.out(1.6)" }, «meno» - 0.3);
''' + pile_js('c-m', 6, '«guadagna» - 0.1', 0.09), ground='cream',
    fx=[('swoosh', 'eppure', 0.05, 0.24), ('tick', 'meno', -0.2, 0.2), ('swoosh', 'guadagna', -0.5, 0.2), ('flutter', 'guadagna', 0.15, 0.3), ('flutter', 'guadagna', 0.4, 0.3), ('cash', 'guadagna', 0.62, 0.22)])

# 4. "Resta fino alla fine, perché questo vale per qualsiasi lavoro, anche il tuo."
JOBS = ['parrucchiere', 'estetista', 'personal trainer', 'ristorante', 'consulente', 'il tuo']
add('p04', 'resta', 'facciamo', f'''      {small('d-a', 'resta fino', 400, 80, GREY)}
      {H('d-b', 'alla <span style="color:{CORAL}">fine.</span>', 490, 170)}
      {progress('d', 810, CORAL, dark=False)}
      {''.join(f'<div class="chip" id="d-c{k}" style="left:{[90, 560, 120, 600, 160, 540][k]}px;top:{1000 + (k // 2) * 140}px;background:{SUN if k == 5 else "#fff"};color:{INK};border:6px solid {INK};box-shadow:8px 8px 0 {INK}">{j}</div>' for k, j in enumerate(JOBS))}''', '''    blurIn(tl, "#d-b", 0.05, 0.24);
''' + progress_js('d', 0.15, 2.0) + '''    tl.fromTo("#d-c0, #d-c1, #d-c2, #d-c3, #d-c4", { opacity: 0, scale: 0.4, rotation: -10 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.22, ease: "back.out(2.4)", stagger: 0.14 }, «qualsiasi» - 0.1);
    tl.fromTo("#d-c5", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1.2, duration: 0.28, ease: "back.out(3)" }, «tuo» - 0.15);''', ground='cream',
    fx=[('swoosh', 'resta', 0.15, 0.22), ('pop', 'qualsiasi', -0.1, 0.16), ('pop', 'qualsiasi', 0.04, 0.16), ('pop', 'qualsiasi', 0.18, 0.16), ('pop', 'qualsiasi', 0.32, 0.16),
        ('pop', 'qualsiasi', 0.46, 0.16), ('ding', 'tuo', -0.15, 0.22)])

# ================================================================ THE MATHS
# 5. "Facciamo i conti." (a receipt prints out of the till)
add('p05', 'facciamo', 'prima', f'''      {H('e-a', 'facciamo i <span style="color:{CORAL}">conti</span>', 330, 120)}
      <div class="cd" id="e-r" style="left:290px;top:560px;width:500px;height:860px;border-radius:14px;transform-origin:50% 0" data-layout-allow-overlap>
        {''.join(f'<div style="position:absolute;left:50px;top:{70 + k * 104}px;height:20px;border-radius:10px;background:{[INK, "#d9d1c1", "#d9d1c1", INK, "#d9d1c1", "#d9d1c1", CORAL][k]};width:{[300, 360, 260, 220, 340, 280, 380][k]}px"></div>' for k in range(7))}
      </div>''', '''    tl.fromTo("#e-a", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(2)" }, 0.0);
    tl.fromTo("#e-r", { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: "power1.out" }, 0.1);''', ground='cream',
    fx=[('register', 'facciamo', 0.0, 0.2), ('typing', 'facciamo', 0.1, 0.18)])

# 6. "Prima: 200 clienti al mese, a 25 euro." (the client wall fills up, the 25 euro tag)
add('p06', 'prima', 'cinquemila', f'''      {small('f-a', 'prima', 290, 64, GREY)}
      {H('f-n', '<span id="f-v">0</span> <span style="font-size:80px;color:{GREY}">clienti al mese</span>', 370, 180)}
      {grid('f')}
      <div class="tag" id="f-t" style="left:330px;top:1440px">25 €</div>''', '''    count(tl, "#f-v", 0, 200, 0.05, 1.0, function (v) { return String(Math.round(v)); }, "power2.out");
    tl.fromTo(".pp[id^='f']", { scale: 0, y: 40 }, { scale: 0.62, y: 0, duration: 0.16, ease: "back.out(2.4)", stagger: 0.016 }, 0.05);
    tl.fromTo("#f-t", { y: -1600, rotation: -25 }, { y: 0, rotation: -6, duration: 0.45, ease: "back.out(1.3)" }, «venticinque» - 0.35);''', ground='cream',
    fx=[('counter', 'prima', 0.05, 0.24), ('ding', 'venticinque', 0.05, 0.22)])

# 7. "5.000 euro." (counter + notes raining into a pile)
add('p07', 'cinquemila', 'sempre', f'''      {H('g-n', '<span id="g-v">0</span> €', 330, 210, GRN)}
      {small('g-a', 'al mese', 570, 64, GREY)}
      {pile('g-m', 7, 375, 1420)}''', '''    count(tl, "#g-v", 0, 5000, 0.0, 0.75, ''' + EUR + ''', "power2.out");
''' + pile_js('g-m', 7, '0.0', 0.07), ground='cream',
    fx=[('flutter', 'cinquemila', 0.1, 0.26), ('flutter', 'cinquemila', 0.4, 0.26), ('cash', 'cinquemila', 0.7, 0.22)])

# 8. "Sempre pieno, sempre di corsa, mai un giorno libero." (the stylist cutting at double speed, a full week)
DAYS = 'LMMGVSD'
add('p08', 'sempre', 'poi', f'''      {salon('h', 300, mirror=False)}
      <div id="h-st" data-layout-allow-overlap style="position:absolute;left:240px;top:330px;padding:20px 40px;border:12px solid {RED};border-radius:18px;font:800 110px/1 {SF};color:{RED};transform:rotate(-10deg);opacity:0;background:rgba(247,240,230,0.85)">PIENO</div>
      <div id="h-wk" data-layout-allow-overlap style="position:absolute;left:90px;top:1600px;width:900px;height:130px">
        {''.join(f'<div class="dy" style="left:{k * 130}px"><b>{d}</b><i id="h-x{k}"></i></div>' for k, d in enumerate(DAYS))}
      </div>''', salon_js('h', 0.0, T['poi'] - T['sempre'], 0.1) + '''    stamp(tl, "#h-st", 0.3, -10);
    shake(tl, "#h-sv", «corsa», 14);
    tl.fromTo("#h-wk", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.22, ease: "back.out(2)" }, «libero» - 0.8);
    tl.fromTo("#h-x0, #h-x1, #h-x2, #h-x3, #h-x4, #h-x5, #h-x6", { scale: 0 }, { scale: 1, duration: 0.12, ease: "back.out(3)", stagger: 0.06 }, «libero» - 0.5);''', '''
    .dy { position: absolute; top: 0; width: 110px; height: 130px; border-radius: 24px; background: #fff; border: 8px solid #1b1b1f; box-sizing: border-box; overflow: hidden; }
    .dy b { position: absolute; left: 0; right: 0; top: 30px; text-align: center; font: 800 56px/1 "SF Pro Display"; color: #1b1b1f; z-index: 2; }
    .dy i { position: absolute; inset: 0; background: #e63946; display: block; }''', ground='cream',
    fx=[('stamp', 'sempre', 0.3, 0.4), ('snip', 'corsa', -0.6, 0.16), ('snip', 'corsa', -0.4, 0.16), ('snip', 'corsa', -0.2, 0.16), ('dryer', 'corsa', 0.0, 0.4),
        ('tick', 'libero', -0.5, 0.14), ('tick', 'libero', -0.38, 0.14), ('tick', 'libero', -0.26, 0.14), ('tick', 'libero', -0.14, 0.14), ('glitch', 'libero', 0.2, 0.16)])

# 9. "Poi alza il taglio a 35 euro." (big scissors cut the old tag in two, the new one drops)
add('p09', 'poi', 'esi', f'''      {small('i-a', 'poi alza il taglio a', 300, 70, GREY)}
      <div id="i-o" data-layout-allow-overlap style="position:absolute;left:330px;top:840px;width:420px;height:190px">
        <div class="tag" id="i-t1" style="left:0;top:0;clip-path:inset(-30px 50% -30px -30px)">25 €</div>
        <div class="tag" id="i-t2" style="left:0;top:0;clip-path:inset(-30px -30px -30px 50%)">25 €</div>
      </div>
      <svg viewBox="-260 -200 520 400" width="780" height="600" style="position:absolute;left:150px;top:420px" data-layout-allow-overlap><g id="i-sc" transform="rotate(90)">{scissors('i', 0, 0, 1.6)}</g></svg>
      <div class="tag" id="i-n" style="left:290px;top:1160px;font-size:160px;background:{CORAL};color:#fff">35 €</div>''', '''    tl.fromTo("#i-sc", { x: 600, y: -300, rotation: 140 }, { x: 0, y: 0, rotation: 90, duration: 0.4, ease: "back.out(1.4)", svgOrigin: "0 0" }, 0.0);
    tl.fromTo("#i-sa", { rotation: -24 }, { rotation: 6, duration: 0.12, ease: "power3.in", svgOrigin: "0 0" }, «taglio» - 0.1);
    tl.fromTo("#i-sb", { rotation: -24 }, { rotation: 6, duration: 0.12, ease: "power3.in", svgOrigin: "0 0" }, «taglio» - 0.1);
    tl.to("#i-t1", { x: -300, y: 700, rotation: -50, duration: 0.6, ease: "power2.in" }, «taglio» + 0.05);
    tl.to("#i-t2", { x: 300, y: 700, rotation: 50, duration: 0.6, ease: "power2.in" }, «taglio» + 0.05);
    tl.to("#i-sc", { x: 900, y: -300, duration: 0.35, ease: "power2.in" }, «taglio» + 0.3);
    tl.fromTo("#i-n", { y: -1700, rotation: 25 }, { y: 0, rotation: -5, duration: 0.5, ease: "back.out(1.5)" }, «trentacinque» - 0.45);
    punch(tl, "#i-n", «trentacinque» + 0.1, 1.12);''', ground='cream', mq='35 €',
    fx=[('whoosh-short', 'poi', 0.0, 0.2), ('snip', 'taglio', -0.05, 0.3), ('tear', 'taglio', 0.05, 0.14), ('thud', 'trentacinque', 0.05, 0.28), ('ding', 'trentacinque', 0.12, 0.2)])

# 10. "E sì, 40 clienti se ne vanno." (one client in five leaves the wall)
GONE = [k for k in range(50) if k % 5 == 4]
add('p10', 'esi', 'ma', f'''      {H('j-n', '−40', 330, 220, RED)}
      {small('j-a', 'clienti', 570, 64, GREY)}
      {grid('j')}''', '''    gsap.set(".pp[id^='j']", { scale: 0.62 });
    tl.to("''' + ', '.join(f'#j{k} .bd' for k in GONE) + '''", { fill: "#e63946", duration: 0.12, stagger: 0.02 }, «quaranta2» - 0.25);
    tl.to("''' + ', '.join(f'#j{k}' for k in GONE) + '''", { x: 1100, rotation: 12, duration: 0.55, ease: "power3.in", stagger: 0.04 }, «vanno» - 0.45);
    tl.fromTo("#j-n", { scale: 1.8, opacity: 0, rotation: 8 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.26, ease: "back.out(2)" }, «quaranta2» - 0.3);''', ground='cream',
    fx=[('glitch', 'quaranta2', -0.25, 0.18), ('whoosh-short', 'vanno', -0.45, 0.22)])

# 11. "Ma guarda: 160 per 35 fa 5.600 euro." (the sum builds, a taller pile)
add('p11', 'ma', 'seicento', f'''      {small('k-a', 'ma guarda', 290, 66, GREY)}
      <div id="k-eq" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:380px;text-align:center;font:800 130px/1 {SF};letter-spacing:-0.04em;color:{INK}"><span id="k-1" style="display:inline-block">160</span> <span id="k-2" style="display:inline-block;color:{CORAL}">× 35</span></div>
      {H('k-n', '<span id="k-v">0</span> €', 550, 210, GRN)}
      {pile('k-m', 9, 375, 1520, 44)}''', '''    tl.fromTo("#k-1", { opacity: 0, y: 80, scale: 0.6 }, { opacity: 1, y: 0, scale: 1, duration: 0.24, ease: "back.out(2.4)" }, «centosessanta» - 0.15);
    tl.fromTo("#k-2", { opacity: 0, y: 80, scale: 0.6 }, { opacity: 1, y: 0, scale: 1, duration: 0.24, ease: "back.out(2.4)" }, «trentacinque2» - 0.15);
    tl.fromTo("#k-n", { opacity: 0 }, { opacity: 1, duration: 0.1 }, «cinquemilasei» - 0.3);
    count(tl, "#k-v", 0, 5600, «cinquemilasei» - 0.3, 0.9, ''' + EUR + ''', "power2.out");
''' + pile_js('k-m', 9, '«cinquemilasei» - 0.3', 0.07), ground='cream',
    fx=[('key-press', 'centosessanta', -0.15, 0.24), ('key-press', 'trentacinque2', -0.15, 0.24), ('counter', 'cinquemilasei', -0.3, 0.22), ('flutter', 'cinquemilasei', 0.0, 0.26),
        ('flutter', 'cinquemilasei', 0.3, 0.26), ('cash', 'cinquemilasei', 0.7, 0.2)])

# 12. "600 euro in più. E 40 appuntamenti in meno." (coral burst, notes flying out)
add('p12', 'seicento', 'circa', f'''      {H('l-n', '+<span id="l-v">0</span> €', 400, 260, '#fff')}
      {small('l-a', 'in più, ogni mese', 680, 66, INK)}
      {''.join(note(f'l-b{k}', [60, 680, 110, 700, 390][k], [880, 920, 1200, 1240, 1050][k]) for k in range(5))}
      <div class="chip" id="l-c" style="left:230px;top:1520px;background:#fff;color:{INK};font-size:58px;border:6px solid {INK};box-shadow:8px 8px 0 {INK}">−40 appuntamenti</div>''', '''    count(tl, "#l-v", 0, 600, 0.0, 0.6, function (v) { return String(Math.round(v)); }, "power2.out");
    punch(tl, "#l-n", 0.65, 1.14);
    tl.fromTo("#l-b0, #l-b1, #l-b2, #l-b3, #l-b4", { y: 800, rotation: 0, scale: 0.3 }, { y: 0, rotation: function (i) { return [-24, 18, -10, 26, 4][i]; }, scale: 1, duration: 0.5, ease: "back.out(1.8)", stagger: 0.07 }, 0.1);
    pop(tl, "#l-c", «quaranta3» - 0.2);''', ground='coral', mq='+600 €',
    fx=[('cash', 'seicento', 0.0, 0.2), ('sparkle', 'seicento', 0.2, 0.2), ('flutter', 'seicento', 0.15, 0.3), ('pop', 'quaranta3', -0.2, 0.22)])

# 13. "Circa 30 ore libere al mese." (the clock spins, 30 hours)
add('p13', 'circa', 'chi', f'''      <svg viewBox="0 0 600 600" width="600" height="600" style="position:absolute;left:240px;top:330px" data-layout-allow-overlap>
        <circle cx="300" cy="300" r="262" fill="#fff" stroke="{INK}" stroke-width="16"/>
        <path id="m-sec" d="M300 300 L300 50 A250 250 0 0 1 516 425 Z" fill="{TEAL}" opacity="0.85"/>
        {''.join(f'<rect x="293" y="52" width="14" height="40" rx="7" fill="{INK}" transform="rotate({k * 30} 300 300)"/>' for k in range(12))}
        <g id="m-hh" style="transform-origin:300px 300px;transform-box:view-box"><rect x="290" y="150" width="20" height="160" rx="10" fill="{INK}"/></g>
        <g id="m-mm" style="transform-origin:300px 300px;transform-box:view-box"><rect x="294" y="90" width="12" height="220" rx="6" fill="{CORAL}"/></g>
        <circle cx="300" cy="300" r="20" fill="{INK}"/>
      </svg>
      {H('m-n', '<span id="m-v">0</span> ore', 1010, 210)}
      {small('m-a', 'libere al mese', 1250, 72, TEAL)}''', '''    tl.fromTo("#m-mm", { rotation: 0 }, { rotation: 1080, duration: 1.5, ease: "power2.inOut" }, 0.05);
    tl.fromTo("#m-hh", { rotation: 0 }, { rotation: 120, duration: 1.5, ease: "power2.inOut" }, 0.05);
    tl.fromTo("#m-sec", { opacity: 0, scale: 0.2, svgOrigin: "300 300" }, { opacity: 0.85, scale: 1, svgOrigin: "300 300", duration: 0.5, ease: "back.out(2)" }, «trenta» - 0.2);
    count(tl, "#m-v", 0, 30, «trenta» - 0.3, 0.8, function (v) { return String(Math.round(v)); }, "power2.out");
    tl.fromTo("#m-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.22 }, «trenta» + 0.4);''', ground='cream',
    fx=[('whoosh-short', 'circa', 0.0, 0.2), ('tick', 'circa', 0.2, 0.14), ('tick', 'circa', 0.45, 0.14), ('tick', 'circa', 0.7, 0.14), ('tick', 'circa', 0.95, 0.14), ('ding', 'trenta', 0.5, 0.22)])

# ================================================================ WHO LEFT, WHO STAYED
# 14. "Chi se n'è andato? Quelli che sceglievano solo il prezzo." (bargain hunters walk off with their discount tags)
add('p14', 'chi', 'chi2', f'''      {small('n-a', 'chi se n’è andato?', 300, 80, INK)}
      {''.join(person(f'n-p{k}', 150 + k * 280, 720, k + 1, 1.8) + f'<div class="chip" id="n-t{k}" style="left:{140 + k * 280}px;top:1040px;background:{RED};opacity:1;border:6px solid {INK}">-20%</div>' for k in range(3))}
      {H('n-b', 'solo il <span style="color:{RED}">prezzo</span>', 1260, 130)}''', '''    tl.fromTo("#n-p0, #n-p1, #n-p2, #n-t0, #n-t1, #n-t2", { y: 120, scale: 0.3 }, { y: 0, scale: function (i) { return i < 3 ? 1.8 : 1; }, duration: 0.26, ease: "back.out(2)", stagger: 0.05 }, 0.1);
    tl.fromTo("#n-b", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.24, ease: "back.out(2)" }, «prezzo» - 0.8);
    tl.to("#n-p0, #n-t0, #n-p1, #n-t1, #n-p2, #n-t2", { x: 1200, duration: 0.6, ease: "power3.in", stagger: 0.04 }, «prezzo» - 0.05);''', ground='cream',
    fx=[('pop', 'chi', 0.1, 0.18), ('swipe', 'prezzo', -0.05, 0.24)])

# 15. "Chi è rimasto? Quelli che vengono per lui." (the stylist at work, the regulars around)
add('p15', 'chi2', 'tu', f'''      {small('o-a', 'chi è rimasto?', 290, 80, INK)}
      {salon('o', 400, True, 0.82)}
      {''.join(person(f'o-p{k}', [40, 920, 60, 900][k], [760, 760, 1180, 1180][k], k, 0.9) for k in range(4))}
      {H('o-b', 'vengono <span style="color:{CORAL}">per lui</span>', 1560, 120)}''', salon_js('o', 0.0, T['tu'] - T['chi2']) + '''    tl.fromTo("#o-p0, #o-p1, #o-p2, #o-p3", { scale: 0, y: 60 }, { scale: 0.9, y: 0, duration: 0.24, ease: "back.out(2.4)", stagger: 0.08 }, «vengono» - 0.6);
    tl.fromTo("#o-b", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.24, ease: "back.out(2)" }, «vengono» - 0.1);''', ground='cream',
    fx=[('snip', 'chi2', 0.0, 0.16), ('snip', 'chi2', 0.32, 0.14), ('sparkle', 'chi2', 0.3, 0.18), ('pop', 'vengono', -0.6, 0.16), ('pop', 'vengono', -0.52, 0.16), ('pop', 'vengono', -0.44, 0.16), ('pop', 'vengono', -0.36, 0.16)])

# ================================================================ QUESTION + LESSON
# 16. "Tu li alzeresti? Scrivi SÌ, o NO."
add('p16', 'tu', 'lezione', f'''      {H('q-a', 'tu li alzeresti?', 330, 110)}
      <div class="bt" id="q-y" style="left:110px;top:580px;width:860px;height:260px;border-radius:60px;background:{GRN};color:#fff;font-size:150px;line-height:240px" data-layout-allow-overlap>SÌ</div>
      <div class="bt" id="q-n" style="left:110px;top:900px;width:860px;height:260px;border-radius:60px;background:{RED};color:#fff;font-size:150px;line-height:240px" data-layout-allow-overlap>NO</div>
      {small('q-b', 'scrivilo nei commenti', 1240, 60, GREY)}''', '''    tl.fromTo("#q-y", { x: -1100, rotation: -6 }, { x: 0, rotation: 0, duration: 0.32, ease: "back.out(1.6)" }, «si» - 0.3);
    tl.fromTo("#q-n", { x: 1100, rotation: 6 }, { x: 0, rotation: 0, duration: 0.32, ease: "back.out(1.6)" }, «no» - 0.25);
    tl.fromTo("#q-b", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «no» + 0.1);''', ground='cream',
    fx=[('whoosh-short', 'si', -0.3, 0.22), ('pop', 'si', 0.0, 0.24), ('whoosh-short', 'no', -0.25, 0.22), ('pop', 'no', 0.05, 0.24)])

# 17. "La lezione: se hai sempre l'agenda piena, non sei bravo." (a packed planner, not a skill)
add('p17', 'lezione', 'sei', f'''      <div class="eyebrow" id="r-e" style="top:300px;opacity:1;color:{CORAL};font-size:42px;letter-spacing:0.2em;font-weight:800">LA LEZIONE</div>
      {H('r-a', 'agenda piena', 380, 130)}
      <div id="r-ag" data-layout-allow-overlap style="position:absolute;left:190px;top:620px">{AGENDA}</div>
      {H('r-b', '≠ bravo', 1220, 190, RED)}''', '''    tl.fromTo("#r-ag", { y: 1200, rotation: 10 }, { y: 0, rotation: -3, duration: 0.45, ease: "back.out(1.4)" }, 0.1);
    tl.fromTo("#r-a", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.24, ease: "back.out(2)" }, «piena» - 0.5);
    tl.fromTo("#r-b", { scale: 2, opacity: 0, rotation: -10 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.26, ease: "back.out(2)" }, «bravo» - 0.3);
    shake(tl, "#p17-cam", «bravo», 14);''', ground='cream',
    fx=[('key-press', 'lezione', 0.0, 0.16), ('swoosh', 'lezione', 0.1, 0.2), ('thud', 'bravo', -0.1, 0.3)])

# 18. "Sei troppo economico." (coral, the cheap tag shakes)
add('p18', 'sei', 'cta', f'''      {small('s-a', 'sei', 360, 90, '#fff')}
      {H('s-b', 'troppo', 470, 210, '#fff')}
      {H('s-c', 'economico.', 690, 180, INK)}
      <div class="tag" id="s-t" style="left:330px;top:1080px">25 €</div>''', '''    tl.fromTo("#s-b", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power4.in" }, «economico» - 0.4);
    tl.fromTo("#s-c", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power4.in" }, «economico»);
    tl.fromTo("#s-t", { y: 900, rotation: 0 }, { y: 0, rotation: -6, duration: 0.32, ease: "back.out(1.8)" }, 0.1);
    shake(tl, "#s-t", «economico» + 0.2, 22);''', ground='coral', mq='ECONOMICO',
    fx=[('thud', 'economico', -0.24, 0.3), ('thud', 'economico', 0.16, 0.34), ('glitch', 'economico', 0.25, 0.16)])

# ================================================================ KEYWORD + LOOP
# 19. "Scrivi PREZZI nei commenti" (comment bar + light keyboard)
add('p19', 'cta', 'mando', f'''      {small('t-a', 'scrivi nei commenti', 330, 66, GREY)}
      {H('t-w', 'PREZZI', 420, 210, CORAL)}
      {commentbar('t', 'PREZZI', 780, dark=False)}
      {keyboard('t', 1230, dark=False)}''', '''    tl.fromTo("#t-kb", { y: 700 }, { y: 0, duration: 0.3, ease: "expo.out" }, 0.0);
    tl.fromTo("#t-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.26, ease: "expo.out" }, 0.0);
    tl.fromTo("#t-w", { scale: 1.6, opacity: 0, rotation: -6 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.26, ease: "back.out(2)" }, «prezziK» - 0.2);
''' + commentbar_js('t', '«prezziK» - 0.2', 0.07) + keys_js('t', 'PREZZI', '«prezziK» - 0.2', 0.07) + '''    tl.fromTo("#t-pub", { scale: 1 }, { scale: 1.25, duration: 0.08, yoyo: true, repeat: 1 }, «prezziK» + 0.35);''', KBCSS, ground='cream',
    fx=[('swipe', 'cta', -0.15, 0.24), ('typing', 'prezziK', -0.2, 0.24), ('click', 'prezziK', 0.35, 0.4)])

# 20. "...e ti mando come alzarli senza perdere i clienti migliori." (the DM, notes raining)
add('p20', 'mando', 'epensa', f'''      {small('u-a', 'ti arriva in DM', 330, 66, GREY)}
      {dmcard('u', 470, 'Come alzare i prezzi', 'senza perdere i clienti migliori', dark=False, icon=CORAL)}
      {pile('u-m', 5, 375, 1500)}''', '''    tl.fromTo("#u-dm", { y: -900, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "back.out(1.4)" }, 0.0);
    tl.fromTo("#u-doc", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2.4)" }, 0.45);
''' + pile_js('u-m', 5, '1.0', 0.09), ground='cream',
    fx=[('notif', 'mando', 0.0, 0.26), ('pop', 'mando', 0.45, 0.22), ('flutter', 'mando', 1.2, 0.24), ('cash', 'mando', 1.5, 0.2)])

# 21. loop: "E pensa che questo parrucchiere..." -> "Questo parrucchiere ha alzato i prezzi del 40%." (back to the first frame)
add('p21', 'epensa', 'END', f'''      {salon('z', 600)}
      {HOOKTXT.replace('@', 'z')}''', salon_js('z', 0.0, T['END'] - T['epensa']) + '''    tl.fromTo("#z-sv", { scale: 0.9, y: 120 }, { scale: 1, y: 0, duration: DUR - 0.05, ease: "power2.out", transformOrigin: "50% 40%" }, 0);
    tl.fromTo("#z-n", { opacity: 0, scale: 1.6, rotation: -20 }, { opacity: 1, scale: 1, rotation: -5, duration: DUR - 0.08, ease: "back.out(1.2)" }, 0);
    tl.fromTo("#z-u", { opacity: 0 }, { opacity: 1, duration: 0.3 }, DUR - 0.5);''', ground='cream', cam=False,
    fx=[('riser', 'epensa', 0.0, 0.12), ('snip', 'epensa', 0.4, 0.16), ('snip', 'epensa', 0.72, 0.16), ('whoosh-short', 'epensa', 1.4, 0.2)])
