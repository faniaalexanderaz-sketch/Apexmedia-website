# apex-bar-menu: "Questo bar ha tolto metà dei prodotti dal menù. I clienti avevano meno scelta. Eppure adesso vende di più, e lavora meglio."
# Triple hook (context -> curiosity -> reversal), the jam study, the bar maths, a comment question, the lesson, keyword MENÙ and a loop line.
# Facts: Iyengar & Lepper (2000, Journal of Personality and Social Psychology), the jam study at a California supermarket:
# 24 jams drew 60% of passers-by, 6 jams 40%; 3% of those who stopped at 24 bought, against 30% at 6.
# The bar (40 -> 12 items, 3 seconds) is an example. Flat motion graphics; the first second is all motion and sound.
import sys
sys.path.insert(0, '.'); sys.path.insert(0, '../../apex-kit')
from kit import *
from ui import *
from times import T
from salon import INK, CORAL, TEAL, SUN, CREAM, NAVY, SKIN1, SKIN2, HAIR1
from bar import board, board_fly_js, steam, steam_js, cup, machine, barista, jar, COFFEE, CREMA, BOARD, CHALK
BED = 0.07; ROOT = CREAM
GRN = '#2a9d55'; RED = '#e63946'; GREY = '#7a746b'
THEME = f'''
    .st.cr {{ background: {CREAM}; color: {INK}; }}
    .cr .bgfx i:nth-child(1) {{ background: radial-gradient(closest-side, rgba(255,90,95,0.16), rgba(255,90,95,0)); }}
    .cr .bgfx i:nth-child(2) {{ background: radial-gradient(closest-side, rgba(46,196,182,0.18), rgba(46,196,182,0)); }}
    .cr .mq {{ -webkit-text-stroke: 4px rgba(27,27,31,0.06); }}
    .st.cf {{ background: {COFFEE}; color: #fff; }}
    .cf .bgfx i:nth-child(1) {{ background: radial-gradient(closest-side, rgba(212,163,115,0.35), rgba(212,163,115,0)); }}
    .cf .bgfx i:nth-child(2) {{ background: radial-gradient(closest-side, rgba(27,27,31,0.25), rgba(27,27,31,0)); }}
    .cf .mq {{ -webkit-text-stroke: 4px rgba(255,255,255,0.14); }}
    .stk {{ position: absolute; padding: 26px 50px; border-radius: 30px; background: {SUN}; color: {INK}; font: 800 130px/1 "SF Pro Display"; letter-spacing: -0.04em; border: 10px solid {INK}; box-shadow: 14px 14px 0 {INK}; white-space: nowrap; }}
    .cd {{ position: absolute; border-radius: 40px; background: #fff; border: 10px solid {INK}; box-shadow: 16px 16px 0 {INK}; box-sizing: border-box; }}
    .bt {{ position: absolute; border-radius: 75px; border: 10px solid {INK}; box-shadow: 12px 12px 0 {INK}; font: 800 66px/130px "SF Pro Display"; text-align: center; box-sizing: border-box; }}
    .pp {{ position: absolute; width: 120px; height: 150px; }}
    .jr {{ position: absolute; width: 70px; height: 84px; }}
    .counter {{ position: absolute; left: -40px; right: -40px; top: 1500px; height: 520px; background: {COFFEE}; border-top: 12px solid {INK}; }}
    .counter::before {{ content: ""; position: absolute; left: 0; right: 0; top: 0; height: 60px; background: {CREMA}; border-bottom: 10px solid {INK}; }}
'''
R = Reel(T, THEME, grounds={'cream': (' cr', CREAM), 'coffee': (' cf', COFFEE)})
add = R.add
def Hd(i, html, top, size, color=INK, extra=''):
    return big(i, html, top, size, color, extra)
PCOL = [(CORAL, HAIR1), (TEAL, '#e9c46a'), (SUN, INK), (NAVY, '#9c6644'), ('#8338ec', HAIR1)]
def person(i, x, y, k=0, s=1.0):
    body, hair = PCOL[k % 5]
    return (f'<div class="pp" id="{i}" data-layout-allow-overlap style="left:{x}px;top:{y}px;transform:scale({s});transform-origin:50% 100%">'
            f'<svg viewBox="0 0 120 150" width="120" height="150"><path class="bd" d="M10 150 Q10 86 60 86 Q110 86 110 150 Z" fill="{body}" stroke="{INK}" stroke-width="7"/>'
            f'<circle cx="60" cy="44" r="30" fill="{SKIN1 if k % 2 == 0 else SKIN2}" stroke="{INK}" stroke-width="7"/>'
            f'<path d="M30 40 Q34 10 60 12 Q88 12 90 40 Q74 26 60 28 Q44 28 30 40 Z" fill="{hair}"/></svg></div>')
JCOL = [CORAL, SUN, '#8338ec', TEAL, '#ff8fab', '#fb8500']
def table(p, n, x, y, cols, w):
    jars = ''.join(f'<div class="jr" id="{p}-j{k}" style="left:{x + 30 + (k % cols) * (w - 60) / cols:.0f}px;top:{y - 100 - (k // cols) * 92}px">{jar(JCOL[k % 6])}</div>' for k in range(n))
    return jars + f'<div id="{p}-tb" data-layout-allow-overlap style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:60px;border-radius:14px;background:{CREMA};border:9px solid {INK};box-sizing:border-box"></div>'

# ================================================================ TRIPLE HOOK
HALF = [k for k in range(40) if (k // 2) % 2 == 1]
def hookset(p):
    return (board(p, 40, 90, 200, 900, 820) + '<div class="counter"></div>' + machine(f'{p}-mc', 70, 1150, 1.0) + steam(p, 230, 1240, 3, 0.9)
            + cup(f'{p}-cp', 300, 1450, 0.8) + barista(p, 640, 1020, 0.95)
            + f'<div class="stk" id="{p}-k" data-layout-allow-overlap style="left:560px;top:120px;transform:rotate(8deg);opacity:0;background:{CORAL};color:#fff">−50%</div>')
def hookjs(p, t1):
    return steam_js(p, 0.0, t1) + f'''    tl.fromTo("#{p}-ba", {{ rotation: -10 }}, {{ rotation: 12, duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: {int(t1 / 0.35)} }}, 0);
    tl.fromTo("#{p}-bh", {{ rotation: -5 }}, {{ rotation: 5, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: {int(t1 / 0.5)}, svgOrigin: "180 200" }}, 0);
    tl.fromTo("#{p}-cp", {{ y: 0 }}, {{ y: -26, duration: 0.18, ease: "power2.out", yoyo: true, repeat: {int(t1 / 0.18)} }}, 0);
'''
# 1. CONTEXT + CURIOSITY: "Questo bar ha tolto metà dei prodotti dal menù. I clienti avevano meno scelta." (crash zoom in, items fly off the board from frame one)
add('b01', 'start', 'eppure', f'''      <div id="a-w" data-layout-allow-overlap style="position:absolute;inset:0;transform-origin:50% 40%">{hookset('a')}</div>
      <div class="chip" id="a-m" style="left:310px;top:1080px;background:{INK};color:#fff;font-size:58px;opacity:0">meno scelta</div>''', hookjs('a', T['eppure']) + '''    tl.fromTo("#a-w", { scale: 1.3, rotation: -3 }, { scale: 1, rotation: 0, duration: 0.7, ease: "expo.out" }, 0);
    tl.fromTo("#a-bd", { rotation: 0 }, { rotation: 2.5, duration: 0.07, yoyo: true, repeat: 7, ease: "none" }, 0.05);
''' + board_fly_js('a', HALF, 0.25, 0.035) + '''    stamp(tl, "#a-k", «meta» - 0.05, 8);
    shake(tl, "#a-w", «meta» + 0.18, 18);
    pop(tl, "#a-m", «meno» - 0.3);''', ground='cream', cam=False,
    fx=[('hit', 'start', 0.0, 0.5), ('whoosh', 'start', 0.0, 0.3), ('steam', 'start', 0.05, 0.22), ('cards', 'start', 0.25, 0.4), ('cards', 'start', 0.75, 0.35),
        ('cup', 'start', 0.18, 0.3), ('cup', 'start', 0.54, 0.24), ('stamp', 'meta', -0.05, 0.45), ('pop', 'meno', -0.3, 0.2)])

# 2. REVERSAL: "Eppure adesso vende di più, e lavora meglio." (sales bars shoot up, cups stack)
add('b02', 'eppure', 'resta', f'''      {small('b-e', 'eppure', 290, 76, GREY)}
      <div class="cd" id="b-c" style="left:110px;top:430px;width:860px;height:760px" data-layout-allow-overlap>
        <div style="position:absolute;left:60px;top:50px;font:800 70px/1 {SF};color:{INK}">vendite</div>
        {''.join(f'<div id="b-b{k}" style="position:absolute;left:{80 + k * 150}px;bottom:60px;width:110px;height:{[160, 190, 230, 330, 450][k]}px;border-radius:18px 18px 0 0;background:{[GREY, GREY, TEAL, TEAL, GRN][k]};border:8px solid {INK};box-sizing:border-box;transform-origin:50% 100%"></div>' for k in range(5))}
        <svg viewBox="0 0 200 200" width="170" height="170" style="position:absolute;right:40px;top:30px"><path id="b-ar" d="M30 170 L170 30 M80 30 H170 V120" fill="none" stroke="{GRN}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      {Hd('b-t', 'vende <span style="color:{GRN}">di più</span>', 1260, 130)}
      {small('b-u', 'e lavora meglio', 1420, 72, TEAL)}''', '''    tl.fromTo("#b-c", { y: 1200, rotation: 6 }, { y: 0, rotation: 0, duration: 0.4, ease: "back.out(1.4)" }, 0.0);
    tl.fromTo("#b-b0, #b-b1, #b-b2, #b-b3, #b-b4", { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.09 }, 0.35);
    draw(tl, "#b-ar", «piu» - 0.4, 0.35);
    tl.fromTo("#b-t", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.24, ease: "back.out(2)" }, «piu» - 0.5);
    tl.fromTo("#b-u", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.22 }, «meglio» - 0.3);''', ground='cream',
    fx=[('swoosh', 'eppure', 0.0, 0.24), ('pop', 'eppure', 0.35, 0.14), ('pop', 'eppure', 0.44, 0.14), ('pop', 'eppure', 0.53, 0.14), ('pop', 'eppure', 0.62, 0.14), ('pop', 'eppure', 0.71, 0.14),
        ('register', 'piu', -0.3, 0.2), ('ding', 'meglio', -0.2, 0.2)])

# 3. "Resta fino alla fine, perché questo trucco funziona in qualsiasi attività."
JOBS = ['bar', 'pizzeria', 'negozio', 'estetista', 'palestra', 'la tua']
add('b03', 'resta', 'anno', f'''      {small('c-a', 'resta fino', 400, 80, GREY)}
      {Hd('c-b', 'alla <span style="color:{CORAL}">fine.</span>', 490, 170)}
      {progress('c', 810, CORAL, dark=False)}
      {''.join(f'<div class="chip" id="c-c{k}" style="left:{[130, 600, 150, 590, 170, 560][k]}px;top:{1000 + (k // 2) * 140}px;background:{SUN if k == 5 else "#fff"};color:{INK};border:6px solid {INK};box-shadow:8px 8px 0 {INK}">{j}</div>' for k, j in enumerate(JOBS))}''', '''    blurIn(tl, "#c-b", 0.05, 0.24);
''' + progress_js('c', 0.15, 2.2) + '''    tl.fromTo("#c-c0, #c-c1, #c-c2, #c-c3, #c-c4", { opacity: 0, scale: 0.4, rotation: -10 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.22, ease: "back.out(2.4)", stagger: 0.12 }, «qualsiasi» - 0.15);
    tl.fromTo("#c-c5", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1.2, duration: 0.28, ease: "back.out(3)" }, «qualsiasi» + 0.5);''', ground='cream',
    fx=[('swoosh', 'resta', 0.15, 0.22), ('pop', 'qualsiasi', -0.15, 0.15), ('pop', 'qualsiasi', -0.03, 0.15), ('pop', 'qualsiasi', 0.09, 0.15), ('pop', 'qualsiasi', 0.21, 0.15),
        ('pop', 'qualsiasi', 0.33, 0.15), ('ding', 'qualsiasi', 0.5, 0.2)])

# ================================================================ THE JAM STUDY
CART = (f'<svg viewBox="0 0 240 200" width="240" height="200"><path d="M10 20 H50 L80 140 H200 L225 60 H62" fill="none" stroke="{INK}" stroke-width="14" stroke-linejoin="round" stroke-linecap="round"/>'
        f'<path d="M64 60 H225 L200 140 H82 Z" fill="{SUN}" stroke="{INK}" stroke-width="10" stroke-linejoin="round"/><circle cx="95" cy="175" r="18" fill="{INK}"/><circle cx="185" cy="175" r="18" fill="{INK}"/></svg>')
# 4. "Anno 2000. Due ricercatori americani fanno un esperimento in un supermercato."
add('b04', 'anno', 'un1', f'''      {Hd('d-y', '2000', 320, 260, CORAL)}
      {''.join(f'<div id="d-r{k}" data-layout-allow-overlap style="position:absolute;left:{250 + k * 330}px;top:680px;width:250px;text-align:center"><div style="width:200px;height:200px;margin:0 auto;border-radius:50%;background:{[TEAL, SUN][k]};border:10px solid {INK};box-sizing:border-box;font:800 76px/180px {SF};color:{INK}">{["SI", "ML"][k]}</div><div style="margin-top:20px;font:800 46px/1 {SF};color:{INK}">{["Iyengar", "Lepper"][k]}</div></div>' for k in range(2))}
      <div id="d-cart" data-layout-allow-overlap style="position:absolute;left:420px;top:1080px">{CART}</div>
      {small('d-a', 'supermercato', 1320, 70, GREY)}''', '''    tl.fromTo("#d-y", { scale: 2.2, opacity: 0, rotation: -10 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.3, ease: "back.out(2)" }, 0.0);
    tl.fromTo("#d-r0, #d-r1", { scale: 0, y: 80 }, { scale: 1, y: 0, duration: 0.3, ease: "back.out(2.4)", stagger: 0.12 }, «due» - 0.2);
    tl.fromTo("#d-cart", { x: -1200 }, { x: 0, duration: 0.5, ease: "back.out(1.3)" }, «supermercato» - 0.9);
    tl.fromTo("#d-a", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «supermercato» - 0.3);''', ground='cream', mq='2000',
    fx=[('hit', 'anno', 0.0, 0.25), ('pop', 'due', -0.2, 0.18), ('pop', 'due', -0.08, 0.18), ('whoosh-short', 'supermercato', -0.9, 0.2)])

# 5. "Un banco con 24 marmellate. E un banco con 6." (the two tables fill)
add('b05', 'un1', 'quello', f'''      {table('e1', 24, 70, 1000, 6, 460)}
      {table('e2', 6, 560, 1000, 3, 450)}
      {Hd('e-n1', '24', 380, 200, CORAL, 'left:70px;right:auto;width:460px')}
      {Hd('e-n2', '6', 380, 200, TEAL, 'left:560px;right:auto;width:450px')}
      {small('e-a', 'marmellate', 1120, 70, GREY)}''', '''    tl.fromTo("#e1-tb, #e2-tb", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "back.out(1.6)" }, 0.0);
    tl.fromTo("''' + ', '.join(f'#e1-j{k}' for k in range(24)) + '''", { y: -900 }, { y: 0, duration: 0.3, ease: "bounce.out", stagger: 0.03 }, «ventiquattro» - 0.5);
    tl.fromTo("#e-n1", { scale: 0 }, { scale: 1, duration: 0.26, ease: "back.out(2.6)" }, «ventiquattro» - 0.1);
    tl.fromTo("''' + ', '.join(f'#e2-j{k}' for k in range(6)) + '''", { y: -900 }, { y: 0, duration: 0.3, ease: "bounce.out", stagger: 0.05 }, «sei» - 0.6);
    tl.fromTo("#e-n2", { scale: 0 }, { scale: 1, duration: 0.26, ease: "back.out(2.6)" }, «sei» - 0.1);
    tl.fromTo("#e-a", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «ventiquattro» + 0.4);''', ground='cream',
    fx=[('swoosh', 'un1', 0.0, 0.2), ('tick', 'ventiquattro', -0.5, 0.14), ('tick', 'ventiquattro', -0.3, 0.14), ('tick', 'ventiquattro', -0.1, 0.14), ('tick', 'ventiquattro', 0.1, 0.14),
        ('tick', 'ventiquattro', 0.3, 0.14), ('ding', 'ventiquattro', -0.1, 0.18), ('tick', 'sei', -0.6, 0.14), ('tick', 'sei', -0.4, 0.14), ('ding', 'sei', -0.1, 0.18)])

# 6. "Quello da 24 attira più gente. Ma compra solo il 3%." (a crowd gathers, almost nobody buys)
add('b06', 'quello', 'quello2', f'''      {table('f', 24, 270, 1080, 6, 540)}
      {''.join(person(f'f-p{k}', [90, 200, 830, 900, 140, 860, 60, 940][k], [760, 900, 760, 920, 1100, 1120, 1300, 1290][k], k, 1.0) for k in range(8))}
      {Hd('f-n', '<span id="f-v">0</span>%', 330, 260, RED)}
      {small('f-a', 'compra', 600, 70, GREY)}''', '''    tl.fromTo("''' + ', '.join(f'#f-p{k}' for k in range(8)) + '''", { scale: 0, y: 80 }, { scale: 1, y: 0, duration: 0.24, ease: "back.out(2.4)", stagger: 0.07 }, «attira» - 0.3);
    tl.fromTo("#f-n", { opacity: 0 }, { opacity: 1, duration: 0.1 }, «tre» - 0.6);
    count(tl, "#f-v", 0, 3, «tre» - 0.6, 0.5, function (v) { return String(Math.round(v)); }, "power2.out");
    tl.fromTo("#f-a", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «tre» - 0.4);
    tl.to("''' + ', '.join(f'#f-p{k}' for k in range(1, 8)) + '''", { x: function (i) { return i % 2 ? 900 : -900; }, duration: 0.5, ease: "power3.in", stagger: 0.03 }, «tre» + 0.1);''', ground='cream',
    fx=[('pop', 'attira', -0.3, 0.15), ('pop', 'attira', -0.16, 0.15), ('pop', 'attira', -0.02, 0.15), ('pop', 'attira', 0.12, 0.15), ('glitch', 'tre', -0.1, 0.18), ('whoosh-short', 'tre', 0.1, 0.2)])

# 7. "Quello da 6 compra il 30%. Dieci volte di più." (coffee ground, big number, x10)
add('b07', 'quello2', 'troppa', f'''      {table('g', 6, 300, 1100, 3, 480)}
      {''.join(person(f'g-p{k}', [190, 820, 300, 740][k], [900, 900, 1260, 1260][k], k + 1, 1.1) for k in range(4))}
      {Hd('g-n', '<span id="g-v">0</span>%', 330, 280, SUN)}
      <div class="stk" id="g-x" data-layout-allow-overlap style="left:690px;top:640px;font-size:110px;transform:rotate(-8deg);opacity:0;background:{TEAL}">×10</div>''', '''    tl.fromTo("#g-tb", { scaleX: 0 }, { scaleX: 1, duration: 0.24, ease: "back.out(1.6)" }, 0.0);
    tl.fromTo("#g-n", { opacity: 0 }, { opacity: 1, duration: 0.1 }, «trenta» - 0.7);
    count(tl, "#g-v", 0, 30, «trenta» - 0.7, 0.7, function (v) { return String(Math.round(v)); }, "power2.out");
    punch(tl, "#g-n", «trenta» + 0.05, 1.12);
    tl.fromTo("#g-p0, #g-p1, #g-p2, #g-p3", { scale: 0, y: 60 }, { scale: 1.1, y: 0, duration: 0.24, ease: "back.out(2.4)", stagger: 0.08 }, 0.2);
    stamp(tl, "#g-x", «dieci» - 0.1, -8);''', ground='coffee',
    fx=[('swoosh', 'quello2', 0.0, 0.22), ('counter', 'trenta', -0.7, 0.22), ('register', 'trenta', 0.05, 0.22), ('stamp', 'dieci', -0.1, 0.45), ('hit', 'dieci', -0.05, 0.22)])

# 8. "Troppa scelta blocca. E al bar succede uguale." (a frozen client, a spinning wheel)
add('b08', 'troppa', 'davanti', f'''      {Hd('h-a', 'troppa scelta', 330, 120)}
      {Hd('h-b', 'blocca.', 470, 200, RED)}
      {person('h-p', 470, 880, 0, 2.2)}
      <svg viewBox="0 0 200 200" width="200" height="200" style="position:absolute;left:640px;top:760px" data-layout-allow-overlap><g id="h-sp">{''.join(f'<rect x="92" y="10" width="16" height="50" rx="8" fill="{INK}" opacity="{0.15 + k * 0.1}" transform="rotate({k * 45} 100 100)"/>' for k in range(8))}</g></svg>''', '''    tl.fromTo("#h-a", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(2)" }, 0.0);
    tl.fromTo("#h-b", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power4.in" }, «blocca» - 0.15);
    tl.fromTo("#h-p", { scale: 0 }, { scale: 2.2, duration: 0.3, ease: "back.out(2)" }, 0.1);
    tl.fromTo("#h-sp", { rotation: 0 }, { rotation: 720, duration: DUR, ease: "none", svgOrigin: "100 100" }, 0);
    shake(tl, "#h-p", «blocca», 14);''', ground='cream',
    fx=[('pop', 'troppa', 0.0, 0.18), ('thud', 'blocca', -0.05, 0.3), ('glitch', 'blocca', 0.1, 0.16), ('cup', 'bar2', -0.1, 0.3)])

# 9. "Davanti a 40 voci il cliente ci pensa, ti fa domande, e alla fine prende il solito." (a crowded board, question bubbles)
add('b09', 'davanti', 'con', f'''      {board('i', 40, 90, 220, 900, 760)}
      {Hd('i-n', '40 voci', 1030, 130)}
      {person('i-p', 140, 1270, 3, 1.9)}
      {''.join(f'<div class="bt" id="i-q{k}" data-layout-allow-overlap style="left:{[420, 640, 500][k]}px;top:{[1240, 1300, 1460][k]}px;width:{[170, 170, 380][k]}px;height:130px;background:{["#fff", "#fff", SUN][k]};color:{INK};font-size:{[90, 90, 60][k]}px;line-height:110px">{["?", "?", "il solito"][k]}</div>' for k in range(3))}''', '''    tl.fromTo("#i-bd", { scale: 0.6, opacity: 0, rotation: -4 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.35, ease: "back.out(1.6)" }, 0.0);
    tl.fromTo("#i-n", { scale: 0 }, { scale: 1, duration: 0.26, ease: "back.out(2.6)" }, «quaranta» - 0.15);
    tl.fromTo("#i-p", { scale: 0 }, { scale: 1.9, duration: 0.3, ease: "back.out(2)" }, «pensa» - 0.6);
    tl.fromTo("#i-q0", { scale: 0 }, { scale: 1, duration: 0.22, ease: "back.out(3)" }, «pensa» - 0.1);
    tl.fromTo("#i-q1", { scale: 0 }, { scale: 1, duration: 0.22, ease: "back.out(3)" }, «domande» - 0.1);
    tl.to("#i-q0, #i-q1", { scale: 0, duration: 0.15 }, «solito» - 0.4);
    tl.fromTo("#i-q2", { scale: 0 }, { scale: 1, duration: 0.26, ease: "back.out(3)" }, «solito» - 0.3);''', ground='cream',
    fx=[('cards', 'davanti', 0.0, 0.3), ('ding', 'quaranta', -0.15, 0.18), ('pop', 'pensa', -0.1, 0.2), ('pop', 'domande', -0.1, 0.2), ('cup', 'solito', -0.3, 0.3)])

# 10. "Con 12 voci sceglie in 3 secondi." (a short board, a 3-second timer)
add('b10', 'con', 'la', f'''      {board('j', 12, 140, 260, 800, 620)}
      {Hd('j-n', '12 voci', 950, 130, TEAL)}
      <svg viewBox="0 0 300 300" width="300" height="300" style="position:absolute;left:390px;top:1130px" data-layout-allow-overlap>
        <circle cx="150" cy="150" r="130" fill="#fff" stroke="{INK}" stroke-width="12"/>
        <circle id="j-ring" cx="150" cy="150" r="104" fill="none" stroke="{GRN}" stroke-width="26" transform="rotate(-90 150 150)"/>
        <text id="j-t" x="150" y="182" text-anchor="middle" font-family="SF Pro Display" font-weight="800" font-size="96" fill="{INK}">3s</text>
      </svg>''', '''    tl.fromTo("#j-bd", { scale: 0.5, opacity: 0, rotation: 6 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.32, ease: "back.out(1.8)" }, 0.0);
    tl.fromTo("#j-n", { scale: 0 }, { scale: 1, duration: 0.26, ease: "back.out(2.6)" }, «dodici» - 0.1);
    draw(tl, "#j-ring", «tresec» - 0.4, 0.9);
    punch(tl, "#j-t", «tresec» + 0.1, 1.2);''', ground='cream',
    fx=[('swoosh', 'con', 0.0, 0.2), ('ding', 'dodici', -0.1, 0.18), ('tick', 'tresec', -0.4, 0.14), ('tick', 'tresec', -0.1, 0.14), ('tick', 'tresec', 0.2, 0.14), ('ding', 'tresec', 0.5, 0.22)])

# 11. "La fila scorre, butti via meno roba, e restano solo i prodotti che vendono di più." (three quick wins)
BIN = f'<svg viewBox="0 0 160 190" width="160" height="190"><rect x="20" y="30" width="120" height="20" rx="8" fill="{INK}"/><path d="M30 56 H130 L120 180 H40 Z" fill="#c9c9c9" stroke="{INK}" stroke-width="9" stroke-linejoin="round"/></svg>'
STAR = f'<svg viewBox="0 0 100 100" width="110" height="110"><path d="M50 6 L62 38 L96 38 L68 58 L78 92 L50 72 L22 92 L32 58 L4 38 L38 38 Z" fill="{SUN}" stroke="{INK}" stroke-width="7" stroke-linejoin="round"/></svg>'
add('b11', 'la', 'tu', f'''      <div class="cd" id="k-1" style="left:90px;top:300px;width:900px;height:380px" data-layout-allow-overlap>
        <div style="position:absolute;left:50px;top:40px;font:800 70px/1 {SF};color:{INK}">la fila scorre</div>
        {''.join(person(f'k-q{k}', 60 + k * 150, 170, k, 1.0) for k in range(5))}
      </div>
      <div class="cd" id="k-2" style="left:90px;top:730px;width:900px;height:360px" data-layout-allow-overlap>
        <div style="position:absolute;left:50px;top:40px;font:800 70px/1 {SF};color:{INK}">meno sprechi</div>
        <div id="k-bin" style="position:absolute;left:640px;top:120px">{BIN}</div>
        <div style="position:absolute;left:60px;top:170px;font:800 120px/1 {SF};color:{GRN}">−</div>
      </div>
      <div class="cd" id="k-3" style="left:90px;top:1140px;width:900px;height:360px" data-layout-allow-overlap>
        <div style="position:absolute;left:50px;top:40px;font:800 70px/1 {SF};color:{INK}">solo i più venduti</div>
        {''.join(f'<div id="k-s{k}" style="position:absolute;left:{80 + k * 170}px;top:150px">{STAR}</div>' for k in range(4))}
      </div>''', '''    tl.fromTo("#k-1", { x: -1200 }, { x: 0, duration: 0.32, ease: "back.out(1.4)" }, «fila» - 0.2);
    tl.fromTo("#k-q0, #k-q1, #k-q2, #k-q3, #k-q4", { x: 0 }, { x: 260, duration: 0.6, ease: "power2.inOut", stagger: 0.05 }, «fila» + 0.25);
    tl.fromTo("#k-2", { x: 1200 }, { x: 0, duration: 0.32, ease: "back.out(1.4)" }, «butti» - 0.2);
    tl.fromTo("#k-bin", { scaleY: 1.3, transformOrigin: "50% 100%" }, { scaleY: 0.8, duration: 0.4, ease: "back.out(2)" }, «butti» + 0.3);
    tl.fromTo("#k-3", { x: -1200 }, { x: 0, duration: 0.32, ease: "back.out(1.4)" }, «restano» - 0.2);
    tl.fromTo("#k-s0, #k-s1, #k-s2, #k-s3", { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.3, ease: "back.out(2.6)", stagger: 0.1 }, «restano» + 0.3);''', ground='cream',
    fx=[('whoosh-short', 'fila', -0.2, 0.2), ('whoosh-short', 'butti', -0.2, 0.2), ('thud', 'butti', 0.3, 0.2), ('whoosh-short', 'restano', -0.2, 0.2),
        ('pop', 'restano', 0.3, 0.15), ('pop', 'restano', 0.4, 0.15), ('pop', 'restano', 0.5, 0.15), ('sparkle', 'restano', 0.6, 0.18)])

# ================================================================ QUESTION + LESSON
# 12. "Tu quante voci hai nel tuo menù? Scrivilo nei commenti."
add('b12', 'tu', 'lezione', f'''      {small('l-a', 'tu quante voci hai', 340, 80, '#fff')}
      {Hd('l-b', 'nel tuo menù?', 450, 150, SUN)}
      <div class="bt" id="l-c" data-layout-allow-overlap style="left:150px;top:820px;width:780px;height:170px;background:#fff;color:{INK};line-height:150px">scrivilo nei commenti</div>
      {''.join(f'<div class="bt" id="l-n{k}" data-layout-allow-overlap style="left:{[150, 420, 690][k]}px;top:1100px;width:240px;height:150px;background:{[CORAL, TEAL, SUN][k]};color:{INK};font-size:80px">{["12", "25", "40+"][k]}</div>' for k in range(3))}''', '''    tl.fromTo("#l-b", { scale: 1.8, opacity: 0, rotation: -6 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.26, ease: "back.out(2)" }, «menu2» - 0.3);
    tl.fromTo("#l-c", { y: 700, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, ease: "back.out(1.5)" }, «scrivilo» - 0.15);
    tl.fromTo("#l-n0, #l-n1, #l-n2", { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.24, ease: "back.out(3)", stagger: 0.1 }, «scrivilo» + 0.3);''', ground='coffee',
    fx=[('pop', 'menu2', -0.3, 0.2), ('notif', 'scrivilo', -0.15, 0.24), ('pop', 'scrivilo', 0.3, 0.14), ('pop', 'scrivilo', 0.4, 0.14), ('pop', 'scrivilo', 0.5, 0.14)])

# 13. "La lezione: se il cliente deve pensare troppo, non compra." (the thinking client, the cart crossed out)
add('b13', 'lezione', 'scegli', f'''      <div class="eyebrow" id="m-e" style="top:300px;opacity:1;color:{CORAL};font-size:42px;letter-spacing:0.2em;font-weight:800">LA LEZIONE</div>
      {Hd('m-a', 'se deve pensare troppo', 380, 96)}
      {person('m-p', 260, 1000, 2, 2.4)}
      <div id="m-cart" data-layout-allow-overlap style="position:absolute;left:600px;top:860px">{CART}</div>
      <svg viewBox="0 0 300 300" width="300" height="300" style="position:absolute;left:570px;top:810px" data-layout-allow-overlap><path id="m-x" d="M40 40 L260 260 M260 40 L40 260" fill="none" stroke="{RED}" stroke-width="30" stroke-linecap="round"/></svg>
      {Hd('m-b', 'non compra.', 1240, 170, RED)}''', '''    tl.fromTo("#m-a", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(2)" }, «pensare» - 0.5);
    tl.fromTo("#m-p", { scale: 0 }, { scale: 2.4, duration: 0.3, ease: "back.out(2)" }, 0.2);
    tl.fromTo("#m-cart", { x: 600 }, { x: 0, duration: 0.4, ease: "back.out(1.4)" }, 0.4);
    draw(tl, "#m-x", «noncompra» - 0.3, 0.25);
    tl.fromTo("#m-b", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power4.in" }, «noncompra» - 0.3);''', ground='cream',
    fx=[('key-press', 'lezione', 0.0, 0.16), ('whoosh-short', 'lezione', 0.4, 0.18), ('thud', 'noncompra', -0.15, 0.3), ('glitch', 'noncompra', 0.0, 0.16)])

# 14. "Scegli tu per lui." (a chalk board with three picks)
add('b14', 'scegli', 'cta', f'''      {Hd('n-a', 'scegli <span style="color:{CORAL}">tu</span>', 330, 190)}
      {small('n-b', 'per lui', 560, 80, GREY)}
      {cup('n-c0', 150, 900, 1.0, CORAL)}{cup('n-c1', 430, 840, 1.1, TEAL)}{cup('n-c2', 720, 900, 1.0, SUN)}''', '''    tl.fromTo("#n-a", { opacity: 0, scale: 2 }, { opacity: 1, scale: 1, duration: 0.18, ease: "power4.in" }, 0.0);
    tl.fromTo("#n-b", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «scegli» + 0.6);
    tl.fromTo("#n-c0, #n-c1, #n-c2", { y: 900, rotation: -20 }, { y: 0, rotation: 0, duration: 0.34, ease: "back.out(1.8)", stagger: 0.08 }, 0.15);''', ground='cream',
    fx=[('thud', 'scegli', 0.0, 0.3), ('cup', 'scegli', 0.4, 0.3), ('cup', 'scegli', 0.5, 0.26), ('cup', 'scegli', 0.6, 0.24)])

# ================================================================ KEYWORD + LOOP
# 15. "Scrivi MENÙ nei commenti" (comment bar + light keyboard)
add('b15', 'cta', 'mando', f'''      {small('o-a', 'scrivi nei commenti', 330, 66, GREY)}
      {Hd('o-w', 'MENÙ', 420, 220, CORAL)}
      {commentbar('o', 'MENU', 780, dark=False)}
      {keyboard('o', 1230, dark=False)}''', '''    tl.fromTo("#o-kb", { y: 700 }, { y: 0, duration: 0.3, ease: "expo.out" }, 0.0);
    tl.fromTo("#o-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.26, ease: "expo.out" }, 0.0);
    tl.fromTo("#o-w", { scale: 1.6, opacity: 0, rotation: -6 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.26, ease: "back.out(2)" }, «menuK» - 0.2);
''' + commentbar_js('o', '«menuK» - 0.2', 0.08) + keys_js('o', 'MENU', '«menuK» - 0.2', 0.08) + '''    tl.fromTo("#o-pub", { scale: 1 }, { scale: 1.25, duration: 0.08, yoyo: true, repeat: 1 }, «menuK» + 0.4);''', KBCSS, ground='cream',
    fx=[('swipe', 'cta', -0.15, 0.24), ('typing', 'menuK', -0.2, 0.22), ('click', 'menuK', 0.4, 0.4)])

# 16. "...e ti mando come tagliare il tuo menù senza perdere clienti." (the DM)
add('b16', 'mando', 'epensa', f'''      {small('p-a', 'ti arriva in DM', 330, 66, GREY)}
      {dmcard('p', 470, 'Come tagliare il tuo menù', 'senza perdere clienti', dark=False, icon=CORAL)}
      {cup('p-c', 400, 1100, 1.2, TEAL)}{steam('p', 480, 940, 3, 0.9)}''', '''    tl.fromTo("#p-dm", { y: -900, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "back.out(1.4)" }, 0.0);
    tl.fromTo("#p-doc", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2.4)" }, 0.45);
    tl.fromTo("#p-c", { y: 800 }, { y: 0, duration: 0.4, ease: "back.out(1.6)" }, 0.6);
''' + steam_js('p', 1.0, T['epensa'] - T['mando']), ground='cream',
    fx=[('notif', 'mando', 0.0, 0.26), ('pop', 'mando', 0.45, 0.2), ('cup', 'mando', 0.9, 0.3), ('steam', 'mando', 1.1, 0.16)])

# 17. loop: "E pensa che questo bar..." -> "Questo bar ha tolto metà dei prodotti dal menù." (zoom back into the first frame)
add('b17', 'epensa', 'END', f'''      <div id="z-w" data-layout-allow-overlap style="position:absolute;inset:0;transform-origin:50% 40%">{hookset('z')}</div>''', hookjs('z', T['END'] - T['epensa']) + '''    tl.fromTo("#z-w", { scale: 0.85, rotation: 2 }, { scale: 1.3, rotation: -3, duration: DUR, ease: "power2.in" }, 0);''', ground='cream', cam=False,
    fx=[('riser', 'epensa', -0.2, 0.18), ('steam', 'epensa', 0.2, 0.16), ('whoosh-short', 'epensa', 0.9, 0.2)])
