# apex-black-friday: "Su questo cartellino c'è un numero che tre negozi online su quattro non ti fanno vedere bene."
# Structure: object (the price tag) in the first frame, promise within 10 s, the law, two studies, a one-word comment question (VERO / FINTO),
# the free fix, the keyword (SCONTO) and a loop line that runs into the first sentence.
# Verified facts: Codice del Consumo art. 17-bis (D.lgs. 26/2023): the "previous price" of a discount is the lowest price of the last 30 days;
# Altroconsumo, Feb 2026, 208 online shops: only 24% showed it correctly; Which? (UK), Black Friday 2024 tracked for a year: 84% of deals
# were the same price or cheaper in the six months before or after; BCG Nov 2026: 55% of Italians believe Black Friday discounts are real.
# The headphones, the 199 / 119 prices and the price history are an illustrative example (said as "guarda", shown as an example shop).
import sys
sys.path.insert(0, '.'); sys.path.insert(0, '../../apex-kit')
from kit import *
from ui import *
from times import T
BED = 0.075; ROOT = '#060606'
RED = '#ff3b30'; YEL = '#ffd60a'; GRN = '#30d158'; WHITE = '#f5f5f7'; GREY = '#8e8e93'
THEME = f'''
    .st.bf {{ background: {ROOT}; color: #fff; }}
    .bf .bgfx i:nth-child(1) {{ background: radial-gradient(closest-side, rgba(255,59,48,0.26), rgba(255,59,48,0)); }}
    .bf .bgfx i:nth-child(2) {{ background: radial-gradient(closest-side, rgba(255,255,255,0.10), rgba(255,255,255,0)); }}
    .bf .mq {{ -webkit-text-stroke: 4px rgba(255,255,255,0.08); }}
    .red {{ color: {RED}; }}
    .eb {{ position: absolute; left: 0; right: 0; text-align: center; font: 700 38px/1 "SF Pro Display"; letter-spacing: 0.22em; color: {RED}; }}
    .wc {{ position: absolute; border-radius: 44px; background: #fff; color: #1d1d1f; box-shadow: 0 40px 120px -30px rgba(0,0,0,0.9); overflow: hidden; }}
    .dk {{ position: absolute; border-radius: 44px; background: #1c1c1e; box-shadow: 0 0 0 2px rgba(255,255,255,0.07), 0 40px 120px -30px rgba(0,0,0,0.9); }}
    .rchip {{ position: absolute; padding: 16px 32px; border-radius: 999px; font: 700 44px/1 "SF Pro Display"; white-space: nowrap; color: #fff; background: {RED}; opacity: 0; }}
    .tag {{ position: absolute; width: 560px; height: 780px; background: #fbf8f1; border-radius: 26px; clip-path: polygon(22% 0, 78% 0, 100% 13%, 100% 100%, 0 100%, 0 13%); box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8); color: #111; }}
    .tag .hole {{ position: absolute; left: 255px; top: 40px; width: 50px; height: 50px; border-radius: 50%; background: {ROOT}; }}
    .strike {{ position: relative; display: inline-block; }}
    .strike > i {{ position: absolute; left: -6px; right: -6px; top: 50%; height: 10px; margin-top: -5px; border-radius: 5px; background: {RED}; transform-origin: 0 50%; }}
'''
R = Reel(T, THEME, grounds={'bf': (' dark bf', ROOT)})
add = R.add
pct = 'function (v) { return Math.round(v) + "%"; }'
EYE = '<svg viewBox="0 0 120 80" width="@W" height="@H" fill="none" stroke="@C" stroke-width="8" stroke-linecap="round"><path d="M6 40 C30 4 90 4 114 40 C90 76 30 76 6 40 Z"/><circle cx="60" cy="40" r="14"/><path d="M14 72 L106 8"/></svg>'
def eye(w, h, c=RED): return EYE.replace('@W', str(w)).replace('@H', str(h)).replace('@C', c)
LENS = '<svg viewBox="0 0 200 200" width="@W" height="@H" fill="none"><circle cx="82" cy="82" r="64" stroke="#fff" stroke-width="14" fill="rgba(255,255,255,0.08)"/><path d="M130 130 L186 186" stroke="#fff" stroke-width="22" stroke-linecap="round"/></svg>'
def lens(w): return LENS.replace('@W', str(w)).replace('@H', str(w))

def tag(p, left, top, extra=''):
    """the price tag: -40%, the struck 199, the 119, and the fine print most shops hide"""
    return (f'<div id="{p}-tg" data-layout-allow-overlap style="position:absolute;left:{left}px;top:{top}px;width:560px;height:900px;transform-origin:280px 0px;{extra}">'
            f'<div style="position:absolute;left:278px;top:-400px;width:4px;height:465px;background:linear-gradient(#777,#ddd)"></div>'
            f'<div class="tag" style="left:0;top:40px"><div class="hole"></div>'
            f'<div style="position:absolute;left:0;right:0;top:130px;text-align:center"><span style="display:inline-block;padding:12px 34px;border-radius:999px;background:{RED};color:#fff;font:800 92px/1 {SF}">−40%</span></div>'
            f'<div style="position:absolute;left:0;right:0;top:290px;text-align:center;font:700 80px/1 {SF};color:#8e8e93"><span class="strike">199 €<i></i></span></div>'
            f'<div style="position:absolute;left:0;right:0;top:400px;text-align:center;font:800 200px/1 {SF};letter-spacing:-0.05em">119 €</div>'
            f'<div style="position:absolute;left:0;right:0;top:650px;text-align:center;font:500 19px/1.3 {SF};color:#9a968c;transform-origin:50% 50%" id="{p}-fine">prezzo più basso 30 gg: 119 €</div>'
            f'</div></div>')
B0 = 2.1            # media time of the falling-bags clip on the very first frame; the loop scene plays the seconds just before it
TAGPOSE = dict(left=260, top=420, rot=-7)
def tag_swing(p, d):
    return (f'    tl.fromTo("#{p}-tg", {{ rotation: {TAGPOSE["rot"]} }}, {{ rotation: 5, duration: {d / 2:.2f}, ease: "sine.inOut", yoyo: true, repeat: 1 }}, 0);\n')

# ================================================================ HOOK
# 1. "Su questo cartellino c'è un numero..." (the tag swings over falling shopping bags; a lens finds the fine print)
add('f01', 'start', 'tre', f'''      {clip('a-bags', 'bags.mp4', T['tre'], B0, 0.35)}
      {tag('a', TAGPOSE['left'], TAGPOSE['top'])}
      <div id="a-lens" style="position:absolute;left:400px;top:960px;opacity:0" data-layout-allow-overlap>{lens(340)}</div>''', tag_swing('a', T['tre']) + '''    tl.fromTo("#a-bags-w", { scale: 1.1 }, { scale: 1.0, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#a-lens", { opacity: 0, scale: 0.4, x: 200, y: 200 }, { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.36, ease: "back.out(1.8)" }, «numero» - 0.3);
    tl.to("#a-fine", { scale: 1.8, color: "#ff3b30", duration: 0.3, ease: "back.out(2)" }, «numero» - 0.05);''', cam=False, ground='bf',
    fx=[('bass-drop', 'start', 0.0, 0.45), ('whoosh', 'start', 0.0, 0.25), ('scan', 'numero', -0.3, 0.3)])

# 2. "...che tre negozi online su quattro non ti fanno vedere bene." (four shop windows, three go blind)
def shop(k, x, y): return (f'<div class="wc sh" id="b-s{k}" style="left:{x}px;top:{y}px;width:440px;height:420px;border-radius:30px">'
                           f'<div style="height:54px;background:#f2f2f7;display:flex;align-items:center;gap:10px;padding-left:20px"><i style="display:block;width:16px;height:16px;border-radius:50%;background:#ff5f57"></i><i style="display:block;width:16px;height:16px;border-radius:50%;background:#febc2e"></i><i style="display:block;width:16px;height:16px;border-radius:50%;background:#28c840"></i></div>'
                           f'<img src="assets/img/cuffie.png" style="position:absolute;left:120px;top:70px;width:200px;height:200px" alt=""/>'
                           f'<div style="position:absolute;left:30px;top:290px;font:800 64px/1 {SF};color:{RED}">119 €</div>'
                           f'<div style="position:absolute;left:30px;top:370px;font:500 15px/1 {SF};color:#aaa">prezzo più basso 30 gg: 119 €</div>'
                           f'<div class="blind" id="b-b{k}" style="position:absolute;inset:54px 0 0 0;background:rgba(10,10,10,0.82);display:flex;align-items:center;justify-content:center;opacity:0">{eye(150, 100)}</div></div>')
add('f02', 'tre', 'venerdi', f'''      {big('b-h', '<span class="red">3</span> su 4', 260, 170, WHITE)}
      {shop(0, 80, 520)}{shop(1, 560, 520)}{shop(2, 80, 980)}{shop(3, 560, 980)}''', '''    tl.fromTo(".sh", { opacity: 0, scale: 0.6, y: 120 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.6)", stagger: 0.07 }, 0.0);
    tl.fromTo("#b-h", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.26, ease: "expo.out" }, «quattro» - 0.3);
    tl.to("#b-b0, #b-b1, #b-b3", { opacity: 1, duration: 0.14, stagger: 0.12 }, «non» - 0.05);
    tl.to("#b-s2", { boxShadow: "0 0 0 8px #30d158, 0 40px 120px -30px rgba(0,0,0,0.9)", duration: 0.3 }, «bene» - 0.4);''', ground='bf',
    fx=[('pop', 'tre', 0.0, 0.2), ('pop', 'tre', 0.14, 0.18), ('thud', 'quattro', -0.3, 0.3), ('glitch', 'non', -0.05, 0.26), ('glitch', 'non', 0.2, 0.2), ('ding', 'bene', -0.4, 0.2)])

# 3. "Venerdì è Black Friday," (November calendar, the 27th circled)
days = ''.join(f'<i class="cd{" cd27" if d == 27 else ""}" style="left:{40 + ((d + 5) % 7) * 118}px;top:{150 + ((d + 5) // 7) * 100}px">{d}</i>' for d in range(1, 31))
add('f03', 'venerdi', 'scommetto', f'''      <div class="dk" id="c-cal" style="left:110px;top:420px;width:860px;height:820px" data-layout-allow-overlap>
        <div style="position:absolute;left:44px;top:50px;font:700 64px/1 {SF}">Novembre <span style="color:{GREY}">2026</span></div>
        {days}
        <div id="c-ring" style="position:absolute;left:{40 + ((27 + 5) % 7) * 118 - 12}px;top:{150 + ((27 + 5) // 7) * 100 - 14}px;width:112px;height:100px;border-radius:50px;border:7px solid {RED}"></div>
      </div>
      <div class="rchip" id="c-c" style="left:330px;top:1290px">BLACK FRIDAY</div>''', '''    tl.fromTo("#c-cal", { y: 900, rotation: -4 }, { y: 0, rotation: 0, duration: 0.3, ease: "expo.out" }, 0);
    tl.fromTo("#c-ring", { scale: 2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.24, ease: "back.out(2)" }, 0.3);
    pop(tl, "#c-c", «black» - 0.05);''', '''
    .cd { position: absolute; display: block; width: 88px; height: 72px; font: 600 50px/72px "SF Pro Display"; font-style: normal; text-align: center; color: #f5f5f7; }
    .cd27 { color: #ff3b30; font-weight: 800; }''', ground='bf',
    fx=[('swipe', 'venerdi', -0.1, 0.24), ('pop', 'venerdi', 0.3, 0.26)])

# 4. "...e scommetto che hai già qualcosa nel carrello." (a cart fills up)
def item(k, name, price, sw): return (f'<div class="ci" id="d-i{k}" style="top:{190 + k * 200}px"><div class="th" style="background:{sw}">'
                                      + (f'<img src="assets/img/cuffie.png" style="width:150px;height:150px" alt=""/>' if k == 0 else '') +
                                      f'</div><div><b>{name}</b><small>{price}</small></div></div>')
add('f04', 'scommetto', 'resta', f'''      <div class="wc" id="d-cart" style="left:90px;top:360px;width:900px;height:880px" data-layout-allow-overlap>
        <div style="position:absolute;left:50px;top:56px;font:700 64px/1 {SF}">Carrello</div>
        <div id="d-n" style="position:absolute;right:50px;top:50px;width:84px;height:84px;border-radius:50%;background:{RED};color:#fff;font:800 48px/84px {SF};text-align:center">0</div>
        {item(0, 'Cuffie wireless', '119 €', '#f2f2f7')}{item(1, 'Friggitrice ad aria', '69 €', '#ffe8d6')}{item(2, 'Sneakers', '89 €', '#e3ecff')}
      </div>''', '''    tl.fromTo("#d-cart", { y: 1000 }, { y: 0, duration: 0.34, ease: "expo.out" }, 0);
    tl.fromTo(".ci", { opacity: 0, x: 600 }, { opacity: 1, x: 0, duration: 0.3, ease: "back.out(1.4)", stagger: 0.3 }, «qualcosa» - 0.4);
    count(tl, "#d-n", 0, 3, «qualcosa» - 0.3, 0.9, function (v) { return String(Math.round(v)); }, "none");
    punch(tl, "#d-n", «carrello», 1.4);''', '''
    .ci { position: absolute; left: 50px; right: 50px; height: 170px; display: flex; align-items: center; gap: 36px; opacity: 0; }
    .ci .th { width: 170px; height: 170px; border-radius: 30px; flex: none; display: flex; align-items: center; justify-content: center; }
    .ci b { display: block; font: 600 52px/1.1 "SF Pro Display"; letter-spacing: -0.02em; }
    .ci small { display: block; font: 700 46px/1.2 "SF Pro Display"; color: #ff3b30; margin-top: 8px; }''', ground='bf', mq='CARRELLO',
    fx=[('pop', 'qualcosa', -0.4, 0.24), ('pop', 'qualcosa', -0.1, 0.22), ('pop', 'qualcosa', 0.2, 0.22), ('cash', 'carrello', 0.0, 0.3)])

# 5. "Resta fino alla fine," (progress bar)
add('f05', 'resta', 'dieci', f'''      {small('e-a', 'resta fino', 420, 80, '#a1a1a6')}
      {big('e-b', 'alla <span class="red">fine.</span>', 510, 170, WHITE)}
      {progress('e', 830, RED)}''', '''    blurIn(tl, "#e-b", 0.05, 0.24);
''' + progress_js('e', 0.15, 1.6), ground='bf',
    fx=[('swoosh', 'resta', 0.15, 0.25)])

# 6. "...ti faccio vedere in dieci secondi se lo sconto è vero." (a 10-second ring counts down)
add('f06', 'dieci', 'guarda', f'''      <svg viewBox="0 0 400 400" width="420" height="420" style="position:absolute;left:330px;top:400px;overflow:visible" data-layout-allow-overlap><circle cx="200" cy="200" r="170" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="24"/><circle id="g-arc" cx="200" cy="200" r="170" fill="none" stroke="{RED}" stroke-width="24" stroke-linecap="round" transform="rotate(-90 200 200)"/></svg>
      <div style="position:absolute;left:330px;top:400px;width:420px;height:420px;display:flex;align-items:center;justify-content:center;font:800 190px/1 {SF};letter-spacing:-0.05em" data-layout-allow-overlap><span id="g-n">10</span></div>
      {big('g-b', 'sconto <span class="red">vero?</span>', 900, 150, WHITE)}''', '''    draw(tl, "#g-arc", 0.0, DUR);
    count(tl, "#g-n", 10, 0, 0.0, DUR, function (v) { return String(Math.ceil(v)); }, "none");
    tl.fromTo("#g-b", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.24, ease: "expo.out" }, «sconto» - 0.25);
    glitch(tl, "#g-b", «vero» + 0.1);''', ground='bf',
    fx=[('tick', 'dieci', 0.1, 0.2), ('tick', 'dieci', 0.5, 0.2), ('tick', 'dieci', 0.9, 0.2), ('tick', 'dieci', 1.3, 0.2), ('glitch', 'vero', 0.1, 0.26)])

# ================================================================ THE EXAMPLE
# 7. "Guarda: 199 euro, barrato." (an online product page)
PAGE = f'''<div class="wc" id="@-pg" style="left:90px;top:330px;width:900px;height:1060px" data-layout-allow-overlap>
        <div style="height:90px;background:#f2f2f7;display:flex;align-items:center;gap:14px;padding-left:34px"><i style="display:block;width:22px;height:22px;border-radius:50%;background:#ff5f57"></i><i style="display:block;width:22px;height:22px;border-radius:50%;background:#febc2e"></i><i style="display:block;width:22px;height:22px;border-radius:50%;background:#28c840"></i><div style="margin-left:24px;height:54px;width:600px;border-radius:27px;background:#fff;font:500 30px/54px {SF};color:#8e8e93;padding-left:28px">negozio-esempio.it/cuffie</div></div>
        <img src="assets/img/cuffie.png" id="@-img" style="position:absolute;left:230px;top:120px;width:440px;height:440px" alt=""/>
        <div style="position:absolute;left:60px;top:600px;font:700 60px/1.1 {SF};letter-spacing:-0.02em">Cuffie wireless</div>
        <div style="position:absolute;left:60px;top:690px;font:500 36px/1 {SF};color:#8e8e93">Black Friday · offerta</div>
        <div id="@-old" style="position:absolute;left:60px;top:790px;font:700 110px/1 {SF};letter-spacing:-0.04em"><span class="strike">199 €<i id="@-st"></i></span></div>
        <div id="@-btn" style="position:absolute;left:60px;right:60px;top:950px;height:80px;border-radius:40px;background:#1d1d1f;color:#fff;font:600 38px/80px {SF};text-align:center">Aggiungi al carrello</div>
      </div>'''
add('f07', 'guarda', 'sotto', f'''      {PAGE.replace('@', 'h')}''', '''    tl.fromTo("#h-pg", { y: 1200, rotation: 4 }, { y: 0, rotation: 0, duration: 0.38, ease: "expo.out" }, 0.0);
    tl.fromTo("#h-img", { scale: 0.6, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.6)" }, 0.1);
    tl.fromTo("#h-old", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.24 }, «p199» - 0.1);
    tl.fromTo("#h-st", { scaleX: 0 }, { scaleX: 1, duration: 0.24, ease: "power2.out" }, «barrato» - 0.05);
    tl.to("#h-old", { color: "#8e8e93", duration: 0.2 }, «barrato»);''', ground='bf',
    fx=[('swipe', 'guarda', -0.1, 0.24), ('key-press', 'p199', -0.1, 0.16), ('tear', 'barrato', -0.05, 0.4)])

# 8. "Sotto, 119. Meno 40%." (the new price and the stamp)
add('f08', 'sotto', 'sembra', f'''      <div class="wc" id="i-card" style="left:90px;top:380px;width:900px;height:900px" data-layout-allow-overlap>
        <div style="position:absolute;left:0;right:0;top:110px;text-align:center;font:700 110px/1 {SF};color:#8e8e93"><span class="strike">199 €<i style="transform:scaleX(1)"></i></span></div>
        <div id="i-new" style="position:absolute;left:0;right:0;top:290px;text-align:center;font:800 300px/1 {SF};letter-spacing:-0.06em;color:{RED}">119 €</div>
        <div id="i-badge" style="position:absolute;left:250px;top:660px;width:400px;height:170px;border-radius:85px;background:{RED};color:#fff;font:800 120px/170px {SF};text-align:center;opacity:0">−40%</div>
      </div>''', '''    tl.fromTo("#i-new", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, «p119» - 0.1);
    stamp(tl, "#i-badge", «meno» - 0.05, -8);
    shake(tl, "#i-card", «meno» + 0.2, 20);''', ground='bf', mq='−40%',
    fx=[('pop', 'p119', -0.1, 0.3), ('stamp', 'meno', -0.05, 0.45), ('cash', 'meno', 0.2, 0.3)])

# 9. "Sembra un affare." (bags fall, the word lands)
add('f09', 'sembra', 'ma', f'''      {clip('j-bags', 'bags.mp4', T['ma'] - T['sembra'], 0.2, 0.45)}
      {small('j-a', 'sembra un', 620, 80, WHITE)}
      {big('j-b', 'affare.', 710, 230, WHITE, 'filter:drop-shadow(0 0 30px rgba(255,59,48,0.6))')}''', '''    tl.fromTo("#j-bags-w", { scale: 1.3 }, { scale: 1.1, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#j-b", { scale: 1.8, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, 0.1);''', cam=False, ground='bf',
    fx=[('whoosh', 'sembra', 0.0, 0.25), ('thud', 'sembra', 0.1, 0.3)])

# ================================================================ THE LAW
# 10. "Ma in Italia quel prezzo barrato non può essere uno qualsiasi." (the struck price under a question)
add('f10', 'ma', 'legge', f'''      <div class="eb" style="top:330px">IN ITALIA</div>
      <div id="k-flag" style="position:absolute;left:390px;top:390px;width:300px;height:12px;border-radius:6px;background:linear-gradient(90deg,#009246 33%,#fff 33% 66%,#ce2b37 66%)" data-layout-allow-overlap></div>
      {big('k-p', '<span class="strike">199 €<i></i></span>', 560, 230, '#a1a1a6')}
      {big('k-q', '?', 820, 300, RED)}
      {small('k-b', 'non può essere uno qualsiasi', 1180, 62, WHITE)}''', '''    tl.fromTo("#k-flag", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.out" }, 0.1);
    tl.fromTo("#k-p", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.8)" }, «barrato2» - 0.3);
    tl.fromTo("#k-q", { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.36, ease: "back.out(2.6)" }, «barrato2» + 0.3);
    tl.fromTo("#k-b", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, «qualsiasi» - 0.4);''', ground='bf', mq='ITALIA',
    fx=[('swoosh', 'ma', 0.1, 0.22), ('pop', 'barrato2', 0.3, 0.3)])

# 11. "Per legge deve essere il prezzo più basso degli ultimi trenta giorni." (the law card and 30 days of prices)
bars = ''.join(f'<i class="db{" dmin" if d == 21 else ""}" style="left:{40 + d * 26}px;height:{[150, 170, 160, 180, 175, 165, 150, 160, 170, 180, 190, 175, 165, 160, 150, 140, 150, 160, 155, 145, 135, 120, 140, 150, 160, 170, 180, 175, 165, 160][d]}px"></i>' for d in range(30))
add('f11', 'legge', 'scritto', f'''      <div class="dk" id="l-card" style="left:90px;top:330px;width:900px;height:1000px" data-layout-allow-overlap>
        <div style="position:absolute;left:56px;top:56px;font:700 32px/1 {SF};letter-spacing:0.18em;color:{GREY}">CODICE DEL CONSUMO · ART. 17-BIS</div>
        <div style="position:absolute;left:56px;top:120px;right:56px;font:700 66px/1.12 {SF};letter-spacing:-0.025em">Il prezzo barrato è il <span class="red">più basso</span> degli ultimi <span id="l-30" style="color:{YEL}">30 giorni</span></div>
        <div style="position:absolute;left:30px;right:30px;top:520px;height:260px">{bars}</div>
        <div id="l-min" style="position:absolute;left:{40 + 21 * 26 - 90}px;top:470px;width:200px;text-align:center;font:800 42px/1 {SF};color:{YEL};opacity:0">minimo</div>
        <div style="position:absolute;left:56px;top:830px;font:500 34px/1 {SF};color:{GREY}">30 giorni fa</div><div style="position:absolute;right:56px;top:830px;font:500 34px/1 {SF};color:{GREY}">oggi</div>
      </div>''', '''    tl.fromTo("#l-card", { scale: 0.7, opacity: 0, rotationX: 40, transformPerspective: 1600 }, { scale: 1, opacity: 1, rotationX: 0, duration: 0.4, ease: "expo.out" }, 0.0);
    tl.fromTo(".db", { scaleY: 0 }, { scaleY: 1, duration: 0.24, ease: "back.out(1.6)", stagger: 0.025 }, «basso» - 0.6);
    tl.to(".dmin", { backgroundColor: "#ffd60a", scaleX: 1.6, duration: 0.2 }, «trenta»);
    tl.fromTo("#l-min", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24, ease: "back.out(2)" }, «trenta» + 0.1);
    punch(tl, "#l-30", «trenta», 1.2);''', '''
    .db { position: absolute; bottom: 0; display: block; width: 18px; border-radius: 9px 9px 0 0; background: rgba(255,255,255,0.28); transform-origin: 50% 100%; }''', ground='bf',
    fx=[('stamp', 'legge', 0.0, 0.3), ('typing', 'basso', -0.6, 0.18), ('ding', 'trenta', 0.0, 0.26)])

# 12. "Ed è scritto. Piccolo. Quando c'è." (the lens on the fine print, then it flickers away)
add('f12', 'scritto', 'altro', f'''      {tag('m', 260, 180, 'transform:scale(1.25)')}
      <div id="m-lens" style="position:absolute;left:390px;top:880px" data-layout-allow-overlap>{lens(380)}</div>
      {big('m-b', 'piccolo.', 1350, 130, WHITE)}''', '''    tl.fromTo("#m-lens", { x: 300, y: 300, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.3, ease: "expo.out" }, 0.0);
    tl.fromTo("#m-fine", { scale: 1 }, { scale: 1.8, color: "#ff3b30", duration: 0.3, ease: "back.out(2)" }, 0.2);
    tl.fromTo("#m-b", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.24, ease: "back.out(2)" }, «piccolo» - 0.1);
    tl.to("#m-fine", { opacity: 0, duration: 0.05, yoyo: true, repeat: 5 }, «quando»);''', ground='bf',
    fx=[('scan', 'scritto', 0.0, 0.3), ('glitch', 'quando', 0.0, 0.3)])

# ================================================================ THE PROOF
# 13. "Altroconsumo ha controllato 208 negozi online:" (208 shop dots)
GREENS = {3, 9, 14, 22, 27, 31, 38, 44, 50, 57, 61, 66, 73, 79, 84, 90, 97, 101, 108, 112, 118, 125, 129, 133, 140, 146, 151, 157, 162, 168, 171, 177, 182, 188, 193, 199, 203, 206, 17, 35, 63, 88, 120, 144, 160, 185, 196, 70, 105, 137}
dots = ''.join(f'<i class="dt {"dg" if k in GREENS else "dr"}" style="left:{(k % 13) * 64}px;top:{(k // 13) * 64}px"></i>' for k in range(208))
add('f13', 'altro', 'solo', f'''      <div class="eb" style="top:280px;color:{WHITE}">INCHIESTA ALTROCONSUMO</div>
      {big('n-n', '<span id="n-v">0</span> negozi', 340, 130, WHITE)}
      <div id="n-grid" style="position:absolute;left:130px;top:560px;width:830px;height:1030px" data-layout-allow-overlap>{dots}</div>''', '''    count(tl, "#n-v", 0, 208, 0.1, «n208» - 0.1, function (v) { return String(Math.round(v)); }, "power1.out");
    tl.fromTo(".dt", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.16, ease: "back.out(2)", stagger: 0.008 }, 0.1);''', '''
    .dt { position: absolute; display: block; width: 46px; height: 46px; border-radius: 12px; background: rgba(255,255,255,0.32); }''', ground='bf',
    fx=[('typing', 'altro', 0.1, 0.2), ('typing', 'altro', 0.6, 0.2), ('ding', 'n208', 0.0, 0.24)])

# 14. "...solo uno su quattro lo mostrava come si deve." (the dots turn green or red: 1 in 4)
add('f14', 'solo', 'inghilterra', f'''      {big('o-h', 'solo <span style="color:{GRN}">1</span> su 4', 300, 150, WHITE)}
      <div id="o-grid" style="position:absolute;left:130px;top:560px;width:830px;height:1030px" data-layout-allow-overlap>{dots}</div>
      {small('o-a', 'lo mostrava come si deve', 470, 56, '#a1a1a6')}''', '''    gsap.set(".dt", { opacity: 1 });
    tl.to(".dr", { backgroundColor: "#ff3b30", opacity: 0.55, duration: 0.2, stagger: 0.002 }, 0.2);
    tl.to(".dg", { backgroundColor: "#30d158", scale: 1.15, duration: 0.2, stagger: 0.01 }, 0.6);
    tl.fromTo("#o-h", { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.26, ease: "expo.out" }, 0.0);
    tl.fromTo("#o-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, «mostrava» - 0.2);''', '''
    .dt { position: absolute; display: block; width: 46px; height: 46px; border-radius: 12px; background: rgba(255,255,255,0.32); }''', ground='bf', mq='1 SU 4',
    fx=[('thud', 'solo', 0.0, 0.3), ('sparkle', 'solo', 0.6, 0.2)])

# 15. "E in Inghilterra hanno seguito le offerte del Black Friday per un anno intero." (a year of prices, a playhead runs through it)
MONTHS = ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D']
mlab = ''.join(f'<i class="mo{" mon" if k == 10 else ""}" style="left:{40 + k * 68}px">{m}</i>' for k, m in enumerate(MONTHS))
add('f15', 'inghilterra', 'otto', f'''      <div class="eb" style="top:330px;color:{WHITE}">IN INGHILTERRA · WHICH?</div>
      {big('p-h', 'un anno intero', 400, 120, WHITE)}
      <div class="dk" id="p-card" style="left:90px;top:640px;width:900px;height:560px" data-layout-allow-overlap>
        <svg viewBox="0 0 900 400" width="900" height="400" style="position:absolute;left:0;top:40px"><path id="p-line" d="M40 250 L108 240 L176 260 L244 230 L312 250 L380 220 L448 240 L516 230 L584 250 L652 235 L720 170 L788 245 L856 238" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/></svg>
        <div id="p-bf" style="position:absolute;left:{40 + 10 * 68 - 4}px;top:20px;width:8px;height:420px;background:{RED};border-radius:4px"></div>
        <div style="position:absolute;left:0;right:0;top:470px">{mlab}</div>
        <div id="p-head" style="position:absolute;left:30px;top:30px;width:4px;height:420px;background:{YEL}"></div>
      </div>''', '''    tl.fromTo("#p-card", { y: 900 }, { y: 0, duration: 0.36, ease: "expo.out" }, 0.0);
    draw(tl, "#p-line", 0.3, DUR - 0.5);
    tl.fromTo("#p-head", { x: 0 }, { x: 830, duration: DUR - 0.5, ease: "none" }, 0.3);
    tl.fromTo("#p-bf", { scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: "back.out(2)" }, «anno» - 0.2);''', '''
    .mo { position: absolute; display: block; width: 60px; text-align: center; font: 600 36px/1 "SF Pro Display"; font-style: normal; color: #8e8e93; }
    .mon { color: #ff3b30; font-weight: 800; }''', ground='bf',
    fx=[('swipe', 'inghilterra', -0.1, 0.24), ('riser', 'inghilterra', 0.4, 0.12), ('pop', 'anno', -0.2, 0.24)])

# 16. "Più di 8 su 10 si trovavano allo stesso prezzo, o meno, nei sei mesi prima o dopo." (ten deals, eight were no deal)
def deal(k): return (f'<div class="dl" id="q-d{k}" style="left:{90 + (k % 5) * 186}px;top:{620 + (k // 5) * 300}px"><div class="dlt">−%</div>'
                     f'<div class="dlv" id="q-v{k}">{"=" if k < 8 else "✓"}</div></div>')
add('f16', 'otto', 'eppure', f'''      {big('q-h', 'più di <span class="red">8</span> su 10', 300, 150, WHITE)}
      {''.join(deal(k) for k in range(10))}
      {small('q-a', 'stesso prezzo, o meno', 1260, 66, WHITE)}
      <div class="rchip" id="q-c" style="left:250px;top:1380px">6 mesi prima o dopo</div>''', '''    tl.fromTo("#q-h", { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.26, ease: "expo.out" }, 0.0);
    tl.fromTo(".dl", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.26, ease: "back.out(1.6)", stagger: 0.05 }, 0.15);
    for (let k = 0; k < 8; k++) tl.to("#q-d" + k, { backgroundColor: "#2c2c2e", color: "#8e8e93", scale: 0.92, duration: 0.14 }, «stesso» - 0.4 + k * 0.08);
    tl.fromTo("#q-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, «stesso» - 0.2);
    pop(tl, "#q-c", «seimesi» - 0.1);''', '''
    .dl { position: absolute; width: 160px; height: 260px; border-radius: 28px; background: #ff3b30; color: #fff; text-align: center; opacity: 0; }
    .dlt { font: 800 56px/1 "SF Pro Display"; margin-top: 50px; }
    .dlv { font: 800 80px/1 "SF Pro Display"; margin-top: 40px; }''', ground='bf', mq='8 SU 10',
    fx=[('thud', 'otto', 0.0, 0.3), ('click-soft', 'stesso', -0.4, 0.3), ('click-soft', 'stesso', -0.1, 0.3), ('click-soft', 'stesso', 0.2, 0.3), ('pop', 'seimesi', -0.1, 0.26)])

# 17. "Eppure più di metà degli italiani crede che gli sconti siano veri." (a ring fills to 55%)
add('f17', 'eppure', 'tu', f'''      {small('r-a', 'eppure', 300, 70, '#a1a1a6')}
      <svg viewBox="0 0 400 400" width="560" height="560" style="position:absolute;left:260px;top:400px;overflow:visible" data-layout-allow-overlap><circle cx="200" cy="200" r="160" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="44"/><circle id="r-arc" cx="200" cy="200" r="160" fill="none" stroke="{YEL}" stroke-width="44" stroke-linecap="round" transform="rotate(-90 200 200)" stroke-dasharray="1005 1100" stroke-dashoffset="1005"/></svg>
      <div style="position:absolute;left:260px;top:400px;width:560px;height:560px;display:flex;align-items:center;justify-content:center;font:800 170px/1 {SF};letter-spacing:-0.05em" data-layout-allow-overlap><span id="r-v">0%</span></div>
      {small('r-b', 'degli italiani ci crede', 1030, 70, WHITE)}''', '''    tl.to("#r-arc", { strokeDashoffset: 1005 * 0.45, duration: 0.9, ease: "power2.out" }, «meta» - 0.3);
    count(tl, "#r-v", 0, 55, «meta» - 0.3, 0.9, PCT, "power2.out");
    tl.fromTo("#r-b", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, «meta» + 0.3);'''.replace('PCT', pct), ground='bf',
    fx=[('counter', 'meta', -0.3, 0.26), ('ding', 'veri', 0.0, 0.22)])

# 18. "Tu? Scrivi VERO o FINTO." (two answer buttons)
add('f18', 'tu', 'modo', f'''      {small('s-a', 'e tu? scrivilo', 330, 76, '#a1a1a6')}
      <div id="s-y" style="position:absolute;left:110px;top:520px;width:860px;height:260px;border-radius:60px;background:{GRN};color:#04210d;font:800 150px/260px {SF};letter-spacing:-0.04em;text-align:center" data-layout-allow-overlap>VERO</div>
      <div id="s-n" style="position:absolute;left:110px;top:840px;width:860px;height:260px;border-radius:60px;background:{RED};color:#fff;font:800 150px/260px {SF};letter-spacing:-0.04em;text-align:center" data-layout-allow-overlap>FINTO</div>''', '''    tl.fromTo("#s-y", { x: -1100 }, { x: 0, duration: 0.3, ease: "expo.out" }, «vero2» - 0.25);
    tl.fromTo("#s-n", { x: 1100 }, { x: 0, duration: 0.3, ease: "expo.out" }, «finto» - 0.25);
    tl.fromTo("#s-n", { scale: 1 }, { scale: 1.07, duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }, «finto» + 0.15);''', ground='bf',
    fx=[('whoosh-short', 'vero2', -0.25, 0.22), ('pop', 'vero2', 0.0, 0.24), ('whoosh-short', 'finto', -0.25, 0.22), ('pop', 'finto', 0.1, 0.26)])

# ================================================================ THE FIX
# 19. "Il modo per scoprirlo c'è, ed è gratis." (GRATIS lands)
add('f19', 'modo', 'siti', f'''      {small('t-a', 'il modo per scoprirlo c’è', 470, 70, '#a1a1a6')}
      {big('t-b', 'GRATIS', 570, 250, GRN, 'filter:drop-shadow(0 0 40px rgba(48,209,88,0.5))')}''', '''    tl.fromTo("#t-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, 0.0);
    tl.fromTo("#t-b", { scale: 2.4, opacity: 0, filter: "blur(18px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.3, ease: "expo.out" }, «gratis» - 0.12);
    shake(tl, "#f19-cam", «gratis» + 0.1, 20);''', ground='bf', mq='GRATIS',
    fx=[('impact-bass-1', 'gratis', -0.1, 0.36), ('sparkle', 'gratis', 0.05, 0.2)])

# 20. "Ci sono siti che ti mostrano la storia del prezzo, giorno per giorno." (a price-history site draws the line day by day)
HIST = 'M40 330 L100 330 L160 330 L220 330 L280 330 L340 330 L400 330 L460 330 L520 330 L580 330 L640 150 L700 330 L760 330 L820 330'
add('f20', 'siti', 'incolli', f'''      <div class="wc" id="u-win" style="left:70px;top:380px;width:940px;height:900px" data-layout-allow-overlap>
        <div style="height:90px;background:#f2f2f7;display:flex;align-items:center;gap:14px;padding-left:34px"><i style="display:block;width:22px;height:22px;border-radius:50%;background:#ff5f57"></i><i style="display:block;width:22px;height:22px;border-radius:50%;background:#febc2e"></i><i style="display:block;width:22px;height:22px;border-radius:50%;background:#28c840"></i><div style="margin-left:24px;font:600 34px/1 {SF};color:#1d1d1f">Storico prezzi</div></div>
        <div style="position:absolute;left:50px;top:130px;font:700 56px/1.1 {SF}">Cuffie wireless</div>
        <svg viewBox="0 0 860 420" width="860" height="420" style="position:absolute;left:40px;top:260px"><path d="M40 360 H840" stroke="#e5e5ea" stroke-width="3"/><path id="u-line" d="{HIST}" fill="none" stroke="#0a84ff" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/></svg>
        <div style="position:absolute;left:80px;top:720px;font:500 34px/1 {SF};color:#8e8e93">giorno per giorno</div>
      </div>''', '''    tl.fromTo("#u-win", { scale: 0.7, opacity: 0, y: 200 }, { scale: 1, opacity: 1, y: 0, duration: 0.36, ease: "back.out(1.4)" }, 0.0);
    draw(tl, "#u-line", «storia» - 0.3, «giorno» - «storia» + 1.0);''', ground='bf',
    fx=[('swipe', 'siti', -0.1, 0.24), ('typing', 'storia', -0.3, 0.2), ('typing', 'giorno', 0.0, 0.2)])

# 21. "Incolli il link e vedi subito..." (paste the link)
add('f21', 'incolli', 'meno40', f'''      <div class="wc" id="v-win" style="left:70px;top:520px;width:940px;height:420px" data-layout-allow-overlap>
        <div style="position:absolute;left:50px;top:56px;font:700 56px/1 {SF}">Incolla il link</div>
        <div style="position:absolute;left:50px;right:50px;top:150px;height:110px;border-radius:24px;border:4px solid #0a84ff;padding-left:30px;font:500 40px/102px {SF};color:#1d1d1f;white-space:nowrap;overflow:hidden"><span id="v-url" class="split">negozio-esempio.it/cuffie</span></div>
        <div id="v-go" style="position:absolute;right:50px;top:300px;width:260px;height:86px;border-radius:43px;background:#0a84ff;color:#fff;font:600 40px/86px {SF};text-align:center">Controlla</div>
      </div>
      <div id="v-cur" class="cur" style="left:820px;top:900px">{CURSOR}</div>''', '''    tl.fromTo("#v-win", { y: 600, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "expo.out" }, 0.0);
    typeIn(tl, "#v-url", 0.3, 0.025);
    tl.fromTo("#v-cur", { opacity: 0, x: 120, y: 160 }, { opacity: 1, x: 0, y: 0, duration: 0.3, ease: "power3.out" }, «subito» - 0.4);
    tl.to("#v-cur", { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1 }, «subito» - 0.05);
    tl.fromTo("#v-go", { scale: 1 }, { scale: 0.92, duration: 0.07, yoyo: true, repeat: 1, immediateRender: false }, «subito» - 0.05);''', ground='bf',
    fx=[('key-press', 'incolli', 0.25, 0.16), ('typing', 'incolli', 0.3, 0.2), ('click', 'subito', -0.05, 0.4)])

# 22. "...se quel meno 40 è vero, o se costava così già da mesi." (the history says: 119 for months, FINTO)
FLAT = 'M40 330 L120 330 L200 330 L280 330 L360 330 L440 330 L520 330 L600 330 L640 120 L700 330 L780 330 L840 330'
add('f22', 'meno40', 'cta', f'''      <div class="wc" id="w-win" style="left:70px;top:360px;width:940px;height:960px" data-layout-allow-overlap>
        <div style="position:absolute;left:50px;top:50px;font:700 52px/1 {SF}">Storico prezzi</div>
        <div style="position:absolute;left:50px;top:120px;font:500 34px/1 {SF};color:#8e8e93">ultimi 6 mesi</div>
        <svg viewBox="0 0 860 420" width="860" height="420" style="position:absolute;left:40px;top:220px"><path d="M40 360 H840" stroke="#e5e5ea" stroke-width="3"/><path id="w-line" d="{FLAT}" fill="none" stroke="#0a84ff" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/></svg>
        <div id="w-l1" style="position:absolute;left:80px;top:470px;font:800 56px/1 {SF};color:#0a84ff;opacity:0">119 € · da mesi</div>
        <div id="w-l2" style="position:absolute;left:560px;top:250px;font:800 44px/1 {SF};color:{RED};opacity:0">199 € per 1 giorno</div>
      </div>
      <div id="w-st" style="position:absolute;left:250px;top:1000px;padding:20px 60px;border:14px solid {RED};border-radius:30px;color:{RED};font:900 150px/1 {SF};letter-spacing:0.02em;background:rgba(255,255,255,0.95);opacity:0" data-layout-allow-overlap>FINTO</div>''', '''    tl.fromTo("#w-win", { rotationY: 70, opacity: 0, transformPerspective: 1600 }, { rotationY: 0, opacity: 1, duration: 0.4, ease: "expo.out" }, 0.0);
    draw(tl, "#w-line", 0.25, 1.0);
    tl.fromTo("#w-l2", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.24 }, 1.0);
    tl.fromTo("#w-l1", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, «costava» - 0.1);
    stamp(tl, "#w-st", «mesi» - 0.05, -10);
    shake(tl, "#f22-cam", «mesi» + 0.2, 22);''', ground='bf',
    fx=[('scan', 'meno40', 0.25, 0.26), ('pop', 'costava', -0.1, 0.24), ('stamp', 'mesi', -0.05, 0.5)])

# ================================================================ KEYWORD + LOOP
# 23. "Scrivi SCONTO nei commenti," (comment bar + dark iOS keyboard)
add('f23', 'cta', 'mando', f'''      {small('x-a', 'scrivi nei commenti', 330, 66, '#a1a1a6')}
      {big('x-w', 'SCONTO', 420, 200, RED, 'filter:drop-shadow(0 0 36px rgba(255,59,48,0.55))')}
      {commentbar('x', 'SCONTO', 760)}
      {keyboard('x', 1230, dark=True)}''', '''    tl.fromTo("#x-kb", { y: 700 }, { y: 0, duration: 0.34, ease: "expo.out" }, 0.0);
    tl.fromTo("#x-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, 0.05);
    tl.fromTo("#x-w", { scale: 1.5, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.28, ease: "expo.out" }, «sconto2» - 0.1);
''' + commentbar_js('x', '«sconto2»', 0.08) + keys_js('x', 'SCONTO', '«sconto2»', 0.08) + '''    tl.fromTo("#x-pub", { scale: 1 }, { scale: 1.25, duration: 0.1, yoyo: true, repeat: 1 }, «sconto2» + 0.75);''', KBCSS, ground='bf',
    fx=[('swipe', 'cta', -0.15, 0.24), ('typing', 'sconto2', -0.05, 0.24), ('typing', 'sconto2', 0.25, 0.2), ('click', 'sconto2', 0.75, 0.4)])

# 24. "...e ti mando i tre strumenti gratis, e come usarli in dieci secondi." (the DM arrives)
add('f24', 'mando', 'prima', f'''      {small('y-a', 'ti arriva in DM', 330, 66, '#a1a1a6')}
      {dmcard('y', 470, '3 strumenti gratis', 'il prezzo vero in 10 secondi', icon=RED)}
      <div style="position:absolute;left:0;right:0;top:1130px;display:flex;justify-content:center;gap:24px" data-layout-allow-overlap><div class="tl" id="y-t1">storico</div><div class="tl" id="y-t2">avvisi</div><div class="tl" id="y-t3">confronto</div></div>''', '''    tl.fromTo("#y-dm", { y: -900, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.3)" }, 0.0);
    tl.fromTo("#y-doc", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, «strumenti» - 0.2);
    tl.fromTo(".tl", { opacity: 0, y: 40, scale: 0.6 }, { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: "back.out(2.4)", stagger: 0.15 }, «usarli» - 0.4);''', '''
    .tl { padding: 18px 36px; border-radius: 999px; background: #2c2c2e; color: #fff; font: 600 44px/1 "SF Pro Display"; opacity: 0; }''', ground='bf',
    fx=[('notif', 'mando', 0.0, 0.26), ('pop', 'strumenti', -0.2, 0.26), ('pop', 'usarli', -0.4, 0.2), ('pop', 'usarli', -0.25, 0.2), ('pop', 'usarli', -0.1, 0.2)])

# 25. loop: "E prima di pagare, guarda bene. Perché..." -> "Su questo cartellino..." (the bags fall, the tag swings back into its first-frame pose)
D25 = T['END'] - T['prima']
add('f25', 'prima', 'END', f'''      {clip('z-bags', 'bags.mp4', D25, B0 - D25, 0.35)}
      {small('z-a', 'prima di pagare', 380, 76, WHITE)}
      {big('z-b', 'guarda bene.', 470, 150, WHITE)}
      {tag('z', TAGPOSE['left'], TAGPOSE['top'])}''', f'''    tl.fromTo("#z-bags-w", {{ scale: 1.0 }}, {{ scale: 1.1, duration: DUR, ease: "none" }}, 0);
    tl.fromTo("#z-a", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.15 }}, 0.04);
    tl.fromTo("#z-b", {{ opacity: 0, scale: 1.3, filter: "blur(12px)" }}, {{ opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }}, «guarda2» - 0.15);
    tl.to("#z-a, #z-b", {{ opacity: 0, duration: 0.14 }}, DUR - 0.5);
    tl.fromTo("#z-tg", {{ y: -1500, rotation: 18 }}, {{ y: 0, rotation: {TAGPOSE['rot']}, duration: 0.5, ease: "power3.out" }}, DUR - 0.5);''', cam=False, ground='bf',
    fx=[('whoosh', 'guarda2', 0.3, 0.25), ('riser', 'prima', 0.0, 0.12)])
