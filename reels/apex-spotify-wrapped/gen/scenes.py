# apex-spotify-wrapped: "Tra pochi giorni 200 milioni di persone faranno pubblicità gratis a un'azienda."
# Structure: object and number in the first frame, promise within 10 s, the case, the insight, a comment question (your number-one artist),
# the example for whoever sells, the keyword (WRAPPED) and a loop line that runs into the first sentence.
# Verified facts (Spotify, Dec 2025): Wrapped 2025 launched on 3 December; more than 200 million engaged users and more than 500 million
# shares in the first 24 hours (Spotify's own figures). The bar with 140 coffees is an illustrative example, marked "esempio" on screen.
# Look: Spotify-like green and black, recap cards in bold colours; no Spotify logo or Wrapped artwork, only the name in plain type.
import sys
sys.path.insert(0, '.'); sys.path.insert(0, '../../apex-kit')
from kit import *
from ui import *
from times import T
BED = 0.07; ROOT = '#121212'
G = '#1ed760'; GD = '#1db954'; PINK = '#ff6ec7'; VIOL = '#7b61ff'; YEL = '#ffd60a'; ORNG = '#ff8a3d'; WHITE = '#ffffff'; GREY = '#b3b3b3'
THEME = f'''
    .st.sp {{ background: {ROOT}; color: #fff; }}
    .sp .bgfx i:nth-child(1) {{ background: radial-gradient(closest-side, rgba(30,215,96,0.30), rgba(30,215,96,0)); }}
    .sp .bgfx i:nth-child(2) {{ background: radial-gradient(closest-side, rgba(123,97,255,0.22), rgba(123,97,255,0)); }}
    .sp .mq {{ -webkit-text-stroke: 4px rgba(30,215,96,0.14); }}
    .gr {{ color: {G}; }}
    .eb {{ position: absolute; left: 0; right: 0; text-align: center; font: 700 38px/1 "SF Pro Display"; letter-spacing: 0.22em; color: {G}; }}
    .rc {{ position: absolute; border-radius: 48px; overflow: hidden; box-shadow: 0 40px 120px -30px rgba(0,0,0,0.9); }}
    .gchip {{ position: absolute; padding: 18px 36px; border-radius: 999px; font: 700 46px/1 "SF Pro Display"; white-space: nowrap; color: #000; background: {G}; opacity: 0; }}
    .eq {{ display: flex; align-items: flex-end; gap: 14px; height: 160px; }}
    .eq i {{ display: block; width: 34px; height: 160px; border-radius: 17px; background: {G}; transform-origin: 50% 100%; }}
    .phone {{ position: absolute; width: 560px; height: 1100px; border-radius: 80px; background: #000; box-shadow: 0 0 0 14px #2a2a2a, 0 50px 140px -30px rgba(0,0,0,0.9); overflow: hidden; }}
'''
R = Reel(T, THEME, grounds={'sp': (' dark sp', ROOT)})
add = R.add
mil = 'function (v) { return String(Math.round(v)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, "."); }'
def eq(i, n=5): return f'<div class="eq" id="{i}">' + '<i></i>' * n + '</div>'
def eq_js(i, d): return (f'    gsap.utils.toArray("#{i} i").forEach(function (b, k) {{ tl.fromTo(b, {{ scaleY: 0.25 + 0.12 * (k % 3) }}, {{ scaleY: 1 - 0.1 * (k % 2), duration: 0.22 + 0.05 * k, yoyo: true, repeat: Math.floor({d} / (0.22 + 0.05 * k)), ease: "sine.inOut" }}, 0); }});\n')
SHARE = '<svg viewBox="0 0 100 100" width="@W" height="@W" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 48 L90 10 L60 90 L46 56 Z"/><path d="M46 56 L90 10"/></svg>'
CUP = f'<svg viewBox="0 0 200 180" width="@W" height="@H" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><path d="M30 60 H150 V110 C150 145 125 170 90 170 C55 170 30 145 30 110 Z" fill="rgba(255,255,255,0.06)"/><path d="M150 76 C185 76 185 126 150 126"/><path d="M70 40 C70 25 85 25 85 10 M105 40 C105 25 120 25 120 10" stroke="{G}"/></svg>'
def ic(svg, w, h=None): return svg.replace('@W', str(w)).replace('@H', str(h or w))
L0 = 1.5            # media time of the listening clip on the very first frame; the loop scene plays the seconds just before it
HOOKT = '''<div id="@-n" style="position:absolute;left:0;right:0;top:250px;text-align:center;font:800 200px/0.95 'SF Pro Display';letter-spacing:-0.05em;color:#1ed760;filter:drop-shadow(0 0 30px rgba(30,215,96,0.45));transform-origin:50% 50%" data-layout-allow-overlap>200<br>MILIONI</div>'''
HS0 = 1.1

# ================================================================ HOOK
# 1. "Tra pochi giorni 200 milioni di persone..." (green light, headphones, 200 MILIONI)
add('s01', 'start', 'persone', f'''      {clip('a-v', 'listen.mp4', T['persone'], L0, 0.15)}
      {HOOKT.replace('@', 'a')}
      <div class="gchip" id="a-c" style="left:330px;top:720px">tra pochi giorni</div>''', '''    tl.fromTo("#a-v-w", { scale: 1.12 }, { scale: 1.0, duration: DUR, ease: "none" }, 0);
    gsap.set("#a-n", { scale: HS0 });
    tl.to("#a-n", { scale: 1, duration: 0.4, ease: "expo.out" }, 0.02);
    pop(tl, "#a-c", 0.3);'''.replace('HS0', str(HS0)), cam=False, ground='sp',
    fx=[('bass-drop', 'start', 0.0, 0.45), ('whoosh', 'start', 0.0, 0.25), ('pop', 'start', 0.3, 0.26)])

# 2. "...faranno pubblicità gratis..." (an ad billboard, price 0 €)
add('s02', 'persone', 'azienda', f'''      <div class="rc" id="b-ad" style="left:110px;top:420px;width:860px;height:760px;background:linear-gradient(150deg,{G},#0f7a35)" data-layout-allow-overlap>
        <div style="position:absolute;left:60px;top:60px;font:700 40px/1 {SF};letter-spacing:0.2em;color:#000">PUBBLICITÀ</div>
        <div style="position:absolute;left:60px;top:150px;font:800 150px/1 {SF};letter-spacing:-0.05em;color:#000">costo</div>
        <div id="b-p" style="position:absolute;left:60px;top:360px;font:800 170px/1 {SF};letter-spacing:-0.05em;color:#000;white-space:nowrap"><span id="b-v">500.000</span> €</div>
      </div>
      <div id="b-st" style="position:absolute;left:250px;top:1220px;padding:18px 60px;border:14px solid {G};border-radius:30px;color:{G};font:900 140px/1 {SF};opacity:0" data-layout-allow-overlap>GRATIS</div>''', '''    tl.fromTo("#b-ad", { rotationY: -80, opacity: 0, transformPerspective: 1600 }, { rotationY: 0, opacity: 1, duration: 0.42, ease: "expo.out" }, 0.0);
    count(tl, "#b-v", 500000, 0, «pubblicita» - 0.1, 0.6, MIL, "power3.in");
    stamp(tl, "#b-st", «gratis» - 0.05, -8);
    shake(tl, "#s02-cam", «gratis» + 0.2, 18);'''.replace('MIL', mil), ground='sp', mq='GRATIS',
    fx=[('swipe', 'persone', -0.1, 0.24), ('counter', 'pubblicita', -0.1, 0.26), ('stamp', 'gratis', -0.05, 0.45)])

# 3. "...a un'azienda, in un giorno solo," (24h clock)
add('s03', 'azienda', 'tu', f'''      {small('c-a', 'a un’azienda', 330, 76, GREY)}
      <svg viewBox="0 0 400 400" width="440" height="440" style="position:absolute;left:320px;top:470px;overflow:visible" data-layout-allow-overlap><circle cx="200" cy="200" r="170" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="26"/><circle id="c-arc" cx="200" cy="200" r="170" fill="none" stroke="{G}" stroke-width="26" stroke-linecap="round" transform="rotate(-90 200 200)"/></svg>
      <div style="position:absolute;left:320px;top:470px;width:440px;height:440px;display:flex;align-items:center;justify-content:center;font:800 130px/1 {SF};letter-spacing:-0.05em" data-layout-allow-overlap>24 h</div>
      {big('c-b', 'in un giorno <span class="gr">solo</span>', 1000, 110, WHITE)}''', '''    draw(tl, "#c-arc", 0.05, DUR - 0.1);
    tl.fromTo("#c-b", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.24, ease: "expo.out" }, «giorno» - 0.3);''', ground='sp',
    fx=[('tick', 'azienda', 0.2, 0.18), ('tick', 'azienda', 0.6, 0.18), ('tick', 'azienda', 1.0, 0.18), ('ding', 'giorno', 0.3, 0.2)])

# 4. "...e tu sarai una di quelle." (the listener, a story is about to be posted)
add('s04', 'tu', 'resta', f'''      {clip('d-v', 'listen.mp4', T['resta'] - T['tu'], 2.5, 0.25)}
      {big('d-a', 'e <span class="gr">tu</span>', 300, 220, WHITE, 'filter:drop-shadow(0 6px 30px rgba(0,0,0,0.6))')}
      {small('d-b', 'sarai una di quelle', 560, 70, WHITE, 'filter:drop-shadow(0 4px 20px rgba(0,0,0,0.7))')}''', '''    tl.fromTo("#d-v-w", { scale: 1.3 }, { scale: 1.1, duration: DUR, ease: "power2.out" }, 0);
    tl.fromTo("#d-a", { scale: 1.8, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, 0.0);
    tl.fromTo("#d-b", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, 0.35);''', cam=False, ground='sp',
    fx=[('whoosh-short', 'tu', -0.05, 0.2), ('thud', 'tu', 0.0, 0.26)])

# 5. "Resta fino alla fine, perché ti faccio vedere come rifarlo con la tua attività," (progress bar)
add('s05', 'resta', 'anche', f'''      {small('e-a', 'resta fino', 420, 80, GREY)}
      {big('e-b', 'alla <span class="gr">fine.</span>', 510, 170, WHITE)}
      {progress('e', 830, G)}
      <div class="gchip" id="e-c" style="left:240px;top:1000px">rifallo con la tua attività</div>''', '''    blurIn(tl, "#e-b", 0.05, 0.24);
''' + progress_js('e', 0.15, 2.2) + '''    pop(tl, "#e-c", «rifarlo» - 0.1);''', ground='sp',
    fx=[('swoosh', 'resta', 0.15, 0.25), ('pop', 'rifarlo', -0.1, 0.26)])

# 6. "...anche se hai un bar." (a coffee cup)
add('s06', 'anche', 'si', f'''      <div id="f-cup" style="position:absolute;left:380px;top:430px" data-layout-allow-overlap>{ic(CUP, 320, 288)}</div>
      {big('f-b', 'anche se hai un <span class="gr">bar</span>', 820, 100, WHITE)}''', '''    tl.fromTo("#f-cup", { y: 300, rotation: -20, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.36, ease: "back.out(1.8)" }, 0.0);
    tl.fromTo("#f-b", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.24, ease: "expo.out" }, 0.15);''', ground='sp',
    fx=[('pop', 'anche', 0.0, 0.26), ('clink', 'bar', -0.05, 0.3)])

# ================================================================ THE CASE
# 7. "Si chiama Spotify Wrapped." (equalizer, the name)
add('s07', 'si', 'lanno', f'''      <div style="position:absolute;left:0;right:0;top:420px;display:flex;justify-content:center" data-layout-allow-overlap>{eq('g-eq', 7)}</div>
      {big('g-a', 'Spotify', 650, 190, WHITE)}
      {big('g-b', 'Wrapped', 850, 190, G, 'filter:drop-shadow(0 0 34px rgba(30,215,96,0.5))')}''', eq_js('g-eq', 1.7) + '''    tl.fromTo("#g-a", { x: -900 }, { x: 0, duration: 0.3, ease: "expo.out" }, «spotify» - 0.25);
    tl.fromTo("#g-b", { x: 900 }, { x: 0, duration: 0.3, ease: "expo.out" }, «wrapped» - 0.25);
    shake(tl, "#s07-cam", «wrapped» + 0.05, 16);''', ground='sp', mq='WRAPPED',
    fx=[('whoosh-short', 'spotify', -0.25, 0.22), ('whoosh-short', 'wrapped', -0.25, 0.22), ('impact-bass-1', 'wrapped', 0.05, 0.36)])

# 8. "L'anno scorso, nelle prime 24 ore," (December 2025 notification)
add('s08', 'lanno', 'aperto', f'''      {big('h-y', '2025', 360, 260, WHITE)}
      <div class="rc" id="h-n" style="left:90px;top:760px;width:900px;height:200px;background:rgba(40,40,40,0.95);border-radius:44px" data-layout-allow-overlap>
        <div style="position:absolute;left:40px;top:44px;width:112px;height:112px;border-radius:28px;background:{G}"></div>
        <div style="position:absolute;left:186px;top:48px;font:700 44px/1.1 {SF}">Il tuo 2025 è pronto</div>
        <div style="position:absolute;left:186px;top:110px;font:500 36px/1.1 {SF};color:{GREY}">3 dicembre · prime 24 ore</div>
      </div>''', '''    tl.fromTo("#h-y", { scale: 1.6, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.28, ease: "expo.out" }, 0.0);
    tl.fromTo("#h-n", { y: -900, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.4)" }, «prime» - 0.4);''', ground='sp',
    fx=[('thud', 'lanno', 0.0, 0.26), ('notif', 'prime', -0.3, 0.3)])

# 9. "...l'hanno aperto 200 milioni di persone." (a crowd of avatar dots, the counter)
cols = [G, PINK, VIOL, YEL, ORNG, '#4fc3f7']
avs = ''.join(f'<i class="av" style="left:{(k % 12) * 74}px;top:{(k // 12) * 74}px;background:{cols[(k * 7) % 6]}"></i>' for k in range(144))
add('s09', 'aperto', 'piu', f'''      <div id="i-n" style="position:absolute;left:0;right:0;top:300px;text-align:center;font:800 150px/1 {SF};letter-spacing:-0.05em;color:{G}" data-layout-allow-overlap><span id="i-v">0</span></div>
      {small('i-a', 'persone in 24 ore', 470, 64, WHITE)}
      <div style="position:absolute;left:110px;top:620px;width:880px;height:900px" data-layout-allow-overlap>{avs}</div>''', '''    count(tl, "#i-v", 0, 200000000, 0.0, 1.3, MIL, "power3.out");
    tl.fromTo(".av", { scale: 0 }, { scale: 1, duration: 0.2, ease: "back.out(2.4)", stagger: { each: 0.008, from: "center" } }, 0.0);'''.replace('MIL', mil), '''
    .av { position: absolute; display: block; width: 58px; height: 58px; border-radius: 50%; }''', ground='sp',
    fx=[('counter', 'aperto', 0.0, 0.26), ('crowd', 'aperto', 0.1, 0.3)])

# 10. "Più di 500 milioni di condivisioni," (share arrows fly out)
shares = ''.join(f'<div class="shr" style="left:{x}px;top:{y}px">{ic(SHARE, 90)}</div>' for x, y in [(120, 700), (820, 760), (260, 1100), (700, 1180), (470, 860), (150, 1350), (840, 1400)])
add('s10', 'piu', 'storie', f'''      {small('j-a', 'più di', 330, 70, GREY)}
      <div id="j-n" style="position:absolute;left:0;right:0;top:410px;text-align:center;font:800 150px/1 {SF};letter-spacing:-0.05em" data-layout-allow-overlap><span id="j-v">0</span></div>
      {small('j-b', 'condivisioni', 580, 76, G)}
      {shares}''', '''    count(tl, "#j-v", 0, 500000000, 0.1, 1.2, MIL, "power3.out");
    tl.fromTo(".shr", { x: 0, y: 300, scale: 0, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.8)", stagger: 0.12 }, «condivisioni» - 0.3);'''.replace('MIL', mil), '''
    .shr { position: absolute; width: 140px; height: 140px; border-radius: 50%; background: rgba(30,215,96,0.22); display: flex; align-items: center; justify-content: center; opacity: 0; }''', ground='sp',
    fx=[('counter', 'piu', 0.1, 0.26), ('whoosh-short', 'condivisioni', -0.3, 0.2), ('pop', 'condivisioni', 0.0, 0.2)])

# 11. "Storie, screenshot, gruppi WhatsApp." (three ways it travels)
add('s11', 'storie', 'gratis2', f'''      <div class="rc" id="k-1" style="left:70px;top:480px;width:300px;height:540px;background:linear-gradient(160deg,{PINK},{VIOL})" data-layout-allow-overlap><div style="position:absolute;left:24px;top:24px;right:24px;height:8px;border-radius:4px;background:rgba(255,255,255,0.6)"></div><div style="position:absolute;left:0;right:0;bottom:40px;text-align:center;font:800 54px/1 {SF}">Storie</div></div>
      <div class="rc" id="k-2" style="left:390px;top:480px;width:300px;height:540px;background:#2a2a2a" data-layout-allow-overlap><div id="k-fl" style="position:absolute;inset:0;background:#fff;opacity:0"></div><div style="position:absolute;left:0;right:0;bottom:40px;text-align:center;font:800 46px/1 {SF}">Screenshot</div></div>
      <div class="rc" id="k-3" style="left:710px;top:480px;width:300px;height:540px;background:#0b3d2a" data-layout-allow-overlap><div style="position:absolute;left:24px;top:60px;padding:16px 22px;border-radius:24px;background:#1f5c43;font:600 30px/1.1 {SF}">il mio n.1!</div><div style="position:absolute;right:24px;top:170px;padding:16px 22px;border-radius:24px;background:{GD};color:#000;font:600 30px/1.1 {SF}">ahah uguale</div><div style="position:absolute;left:0;right:0;bottom:40px;text-align:center;font:800 54px/1 {SF}">Gruppi</div></div>''', '''    tl.fromTo("#k-1", { y: 900, rotation: -8 }, { y: 0, rotation: -3, duration: 0.3, ease: "back.out(1.4)" }, 0.0);
    tl.fromTo("#k-2", { y: 900 }, { y: 0, duration: 0.3, ease: "back.out(1.4)" }, «screenshot» - 0.2);
    flash(tl, "#k-fl", «screenshot» + 0.15, 1);
    tl.fromTo("#k-3", { y: 900, rotation: 8 }, { y: 0, rotation: 3, duration: 0.3, ease: "back.out(1.4)" }, «gruppi» - 0.2);''', ground='sp',
    fx=[('swipe', 'storie', 0.0, 0.2), ('click', 'screenshot', 0.15, 0.4), ('notif', 'gruppi', 0.0, 0.24)])

# 12. "Gratis." (short hit)
add('s12', 'gratis2', 'ma', f'''      {big('l-b', 'GRATIS.', 760, 230, G, 'filter:drop-shadow(0 0 40px rgba(30,215,96,0.6))')}''', '''    tl.fromTo("#l-b", { scale: 2.4, opacity: 0, filter: "blur(18px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }, 0.0);''', ground='sp',
    fx=[('impact-bass-1', 'gratis2', 0.0, 0.36)])

# ================================================================ THE INSIGHT
# 13. "Ma la gente non sta condividendo Spotify," (the name gets struck out on a story card)
add('s13', 'ma', 'sta2', f'''      {small('m-a', 'la gente non condivide', 330, 70, GREY)}
      <div class="rc" id="m-c" style="left:240px;top:470px;width:600px;height:900px;background:linear-gradient(170deg,#1f1f1f,#0c0c0c);box-shadow:0 0 0 4px rgba(255,255,255,0.08)" data-layout-allow-overlap>
        <div style="position:absolute;left:0;right:0;top:330px;text-align:center;font:800 130px/1 {SF};letter-spacing:-0.04em;color:{G}"><span style="position:relative;display:inline-block">Spotify<i id="m-x" style="position:absolute;left:-16px;right:-16px;top:52%;height:18px;border-radius:9px;background:#ff3b30;transform-origin:0 50%"></i></span></div>
      </div>''', '''    tl.fromTo("#m-c", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.6)" }, 0.0);
    tl.fromTo("#m-x", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power2.out" }, «spotify2» - 0.05);
    shake(tl, "#m-c", «spotify2» + 0.15, 16);''', ground='sp',
    fx=[('pop', 'ma', 0.0, 0.22), ('tear', 'spotify2', -0.05, 0.35)])

# 14. "...sta condividendo se stessa." (a mirror: the viewer)
add('s14', 'sta2', 'guarda', f'''      <div class="rc" id="n-m" style="left:240px;top:420px;width:600px;height:820px;border-radius:300px 300px 48px 48px;background:linear-gradient(170deg,#2b2b2b,#141414);box-shadow:0 0 0 14px {G}, 0 40px 120px -30px rgba(0,0,0,0.9)" data-layout-allow-overlap>
        <svg viewBox="0 0 200 240" width="420" height="504" style="position:absolute;left:90px;top:220px" fill="{G}"><circle cx="100" cy="70" r="50"/><path d="M10 240 C10 160 50 130 100 130 C150 130 190 160 190 240 Z"/></svg>
        <div id="n-sh" style="position:absolute;top:0;bottom:0;width:180px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.22),rgba(255,255,255,0));transform:skewX(-20deg)"></div>
      </div>
      {big('n-b', 'se <span class="gr">stessa.</span>', 1290, 130, WHITE)}''', '''    tl.fromTo("#n-m", { scale: 0.7, opacity: 0, rotationY: 60, transformPerspective: 1600 }, { scale: 1, opacity: 1, rotationY: 0, duration: 0.4, ease: "expo.out" }, 0.0);
    tl.fromTo("#n-sh", { x: -300 }, { x: 800, duration: 0.8, ease: "power2.inOut" }, 0.3);
    tl.fromTo("#n-b", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.26, ease: "expo.out" }, «stessa» - 0.15);''', ground='sp', mq='TE STESSO',
    fx=[('sparkle', 'sta2', 0.3, 0.22), ('thud', 'stessa', -0.15, 0.3)])

# 15. "Guarda che gusti ho. Spotify ti dà solo lo specchio," (a recap card in bold colours)
add('s15', 'guarda', 'logo', f'''      <div class="rc" id="o-c" style="left:170px;top:330px;width:740px;height:1180px;background:linear-gradient(165deg,{VIOL} 0%,{PINK} 55%,{ORNG} 100%)" data-layout-allow-overlap>
        <div style="position:absolute;left:50px;top:60px;font:700 40px/1 {SF};letter-spacing:0.16em">IL MIO ANNO</div>
        <div class="rr" id="o-r1" style="top:170px"><b>41.237</b><small>minuti ascoltati</small></div>
        <div class="rr" id="o-r2" style="top:420px"><b>top 1%</b><small>degli ascoltatori</small></div>
        <div class="rr" id="o-r3" style="top:670px"><b>indie</b><small>il mio genere</small></div>
        <div id="o-logo" style="position:absolute;left:50px;bottom:56px;font:800 40px/1 {SF};color:#000;transform-origin:0 100%">● Spotify</div>
        <div style="position:absolute;right:50px;bottom:56px;font:600 30px/1 {SF};color:rgba(0,0,0,0.55)">esempio</div>
      </div>''', '''    tl.fromTo("#o-c", { y: 1300, rotation: 6 }, { y: 0, rotation: 0, duration: 0.4, ease: "back.out(1.3)" }, 0.0);
    tl.fromTo(".rr", { opacity: 0, x: -200 }, { opacity: 1, x: 0, duration: 0.3, ease: "back.out(1.6)", stagger: 0.18 }, «gusti» - 0.2);
    tl.fromTo("#o-c", { scale: 1 }, { scale: 1.04, duration: 0.16, yoyo: true, repeat: 1, immediateRender: false }, «specchio»);''', '''
    .rr { position: absolute; left: 50px; right: 50px; opacity: 0; }
    .rr b { display: block; font: 800 150px/1 "SF Pro Display"; letter-spacing: -0.05em; }
    .rr small { display: block; font: 600 44px/1.2 "SF Pro Display"; color: rgba(255,255,255,0.85); margin-top: 6px; }''', ground='sp',
    fx=[('swipe', 'guarda', -0.1, 0.24), ('pop', 'gusti', -0.2, 0.22), ('pop', 'gusti', 0.0, 0.2), ('pop', 'gusti', 0.2, 0.2), ('sparkle', 'specchio', 0.0, 0.2)])

# 16. "...il logo ci finisce dentro da solo," (zoom onto the small name in the corner of the card)
add('s16', 'logo', 'nessuno', f'''      <div class="rc" id="p-c" style="left:170px;top:330px;width:740px;height:1180px;background:linear-gradient(165deg,{VIOL} 0%,{PINK} 55%,{ORNG} 100%);transform-origin:12% 95%" data-layout-allow-overlap>
        <div style="position:absolute;left:50px;top:60px;font:700 40px/1 {SF};letter-spacing:0.16em">IL MIO ANNO</div>
        <div style="position:absolute;left:50px;top:170px;font:800 150px/1 {SF};letter-spacing:-0.05em">41.237</div>
        <div id="p-logo" style="position:absolute;left:50px;bottom:56px;font:800 40px/1 {SF};color:#000;padding:10px 18px;border-radius:16px">● Spotify</div>
      </div>
      <div class="gchip" id="p-chip" style="left:320px;top:1560px">dentro, da solo</div>''', '''    tl.fromTo("#p-c", { scale: 1 }, { scale: 2.1, x: 80, y: -560, duration: 0.7, ease: "power3.inOut" }, 0.05);
    tl.to("#p-logo", { backgroundColor: "#1ed760", duration: 0.2 }, «dentro» - 0.1);
    pop(tl, "#p-chip", «dentro» - 0.05);''', ground='sp',
    fx=[('whoosh', 'logo', 0.05, 0.25), ('ding', 'dentro', -0.05, 0.24)])

# 17. "...e nessuno la chiama pubblicità." (the word, struck out)
add('s17', 'nessuno', 'chi', f'''      {small('q-a', 'e nessuno la chiama', 560, 80, GREY)}
      {big('q-b', '<span style="position:relative;display:inline-block">pubblicità<i id="q-x" style="position:absolute;left:-12px;right:-12px;top:52%;height:18px;border-radius:9px;background:#ff3b30;transform-origin:0 50%"></i></span>', 660, 150, WHITE)}''', '''    tl.fromTo("#q-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, 0.0);
    blurIn(tl, "#q-b", «pubblicita2» - 0.3, 0.24);
    tl.fromTo("#q-x", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power2.out" }, «pubblicita2» + 0.3);''', ground='sp', mq='PUBBLICITÀ',
    fx=[('key-press', 'nessuno', 0.0, 0.14), ('tear', 'pubblicita2', 0.3, 0.35)])

# ================================================================ THE QUESTION
# 18. "Chi sarà il tuo artista numero uno quest'anno?" (the big question)
add('s18', 'chi', 'scrivilo', f'''      <div class="eb" style="top:420px">IL TUO 2026</div>
      {big('r-a', 'il tuo artista', 500, 110, WHITE)}
      {big('r-b', 'n.1', 640, 330, G, 'filter:drop-shadow(0 0 40px rgba(30,215,96,0.55))')}
      {big('r-q', '?', 1000, 200, WHITE)}''', '''    blurIn(tl, "#r-a", «artista» - 0.3, 0.24);
    tl.fromTo("#r-b", { scale: 2.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "expo.out" }, «uno» - 0.2);
    tl.fromTo("#r-q", { rotation: -40, scale: 0 }, { rotation: 0, scale: 1, duration: 0.36, ease: "back.out(2.4)" }, «uno» + 0.2);''', ground='sp',
    fx=[('whoosh-short', 'artista', -0.3, 0.2), ('impact-bass-1', 'uno', -0.2, 0.34), ('pop', 'uno', 0.2, 0.24)])

# 19. "Scrivilo nei commenti, vediamo chi vince." (comment bar, then a podium of question marks)
add('s19', 'scrivilo', 'ora', f'''      {commentbar('s', 'il mio n.1 è…', 360)}
      <div id="s-p1" class="pd" style="left:400px;top:820px;height:560px;background:{G}"><b>?</b><small>1</small></div>
      <div id="s-p2" class="pd" style="left:150px;top:980px;height:400px;background:{VIOL}"><b>?</b><small>2</small></div>
      <div id="s-p3" class="pd" style="left:650px;top:1080px;height:300px;background:{PINK}"><b>?</b><small>3</small></div>''', '''    tl.fromTo("#s-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, 0.0);
''' + commentbar_js('s', '0.2', 0.04) + '''    tl.fromTo(".pd", { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: "back.out(1.4)", stagger: 0.12 }, «vediamo» - 0.2);
    punch(tl, "#s-p1", «vince» + 0.1, 1.08);''', '''
    .pd { position: absolute; width: 280px; border-radius: 30px 30px 0 0; transform-origin: 50% 100%; text-align: center; color: #000; }
    .pd b { display: block; font: 800 150px/1 "SF Pro Display"; margin-top: 50px; }
    .pd small { display: block; font: 800 60px/1 "SF Pro Display"; margin-top: 20px; opacity: 0.6; }''', ground='sp',
    fx=[('typing', 'scrivilo', 0.2, 0.22), ('pop', 'vediamo', -0.2, 0.22), ('pop', 'vediamo', -0.08, 0.2), ('pop', 'vediamo', 0.04, 0.2), ('crowd', 'vince', 0.0, 0.25)])

# ================================================================ THE EXAMPLE
# 20. "Ora pensa a un bar che a dicembre scrive a ogni cliente:" (a phone gets a message from the bar)
add('s20', 'ora', 'quest', f'''      <div id="t-cup" style="position:absolute;left:420px;top:330px" data-layout-allow-overlap>{ic(CUP, 240, 216)}</div>
      {small('t-a', 'un bar, a dicembre', 590, 66, GREY)}
      <div class="rc" id="t-n" style="left:90px;top:760px;width:900px;height:220px;background:rgba(44,44,46,0.97);border-radius:46px" data-layout-allow-overlap>
        <div style="position:absolute;left:40px;top:50px;width:120px;height:120px;border-radius:30px;background:#6f4e37;display:flex;align-items:center;justify-content:center">{ic(CUP, 80, 72)}</div>
        <div style="position:absolute;left:190px;top:52px;font:700 46px/1.1 {SF}">Il tuo bar</div>
        <div style="position:absolute;left:190px;top:118px;font:500 38px/1.1 {SF};color:{GREY}">Il tuo 2026 da noi è pronto ☕</div>
        <div style="position:absolute;right:40px;top:56px;font:500 32px/1 {SF};color:{GREY}">ora</div>
      </div>''', '''    tl.fromTo("#t-cup", { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.36, ease: "back.out(2)" }, 0.0);
    tl.fromTo("#t-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, «bar2» - 0.2);
    tl.fromTo("#t-n", { y: -1000, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.4)" }, «scrive» - 0.2);''', ground='sp',
    fx=[('pop', 'ora', 0.0, 0.22), ('notif', 'scrive', -0.1, 0.3)])

# 21. "Quest'anno hai preso 140 caffè da noi. Sei tra i nostri clienti più fedeli." (the bar's own recap card)
add('s21', 'quest', 'quanti', f'''      <div class="rc" id="u-c" style="left:170px;top:300px;width:740px;height:1200px;background:linear-gradient(165deg,{G} 0%,#0f7a35 100%);color:#000" data-layout-allow-overlap>
        <div style="position:absolute;left:50px;top:60px;font:700 40px/1 {SF};letter-spacing:0.16em">IL TUO 2026 DA NOI</div>
        <div style="position:absolute;left:50px;top:150px;font:600 54px/1 {SF}">hai preso</div>
        <div style="position:absolute;left:46px;top:220px;font:900 330px/1 {SF};letter-spacing:-0.06em"><span id="u-v">0</span></div>
        <div style="position:absolute;left:50px;top:560px;font:800 90px/1 {SF};letter-spacing:-0.03em">caffè ☕</div>
        <div id="u-f" style="position:absolute;left:50px;right:50px;top:740px;padding:34px 40px;border-radius:36px;background:#000;color:#fff;font:700 54px/1.15 {SF};opacity:0">Sei tra i nostri clienti più fedeli</div>
        <div style="position:absolute;right:50px;bottom:56px;font:600 30px/1 {SF};color:rgba(0,0,0,0.55)">esempio</div>
      </div>''', '''    tl.fromTo("#u-c", { rotationY: -90, opacity: 0, transformPerspective: 1600 }, { rotationY: 0, opacity: 1, duration: 0.45, ease: "expo.out" }, 0.0);
    count(tl, "#u-v", 0, 140, «centoquaranta» - 0.5, 0.8, function (v) { return String(Math.round(v)); }, "power3.out");
    tl.fromTo("#u-f", { opacity: 0, y: 60, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "back.out(1.8)" }, «sei» - 0.1);
    shake(tl, "#s21-cam", «fedeli» + 0.1, 14);''', ground='sp', mq='140 CAFFÈ',
    fx=[('swipe', 'quest', -0.1, 0.24), ('counter', 'centoquaranta', -0.5, 0.26), ('cash', 'caffe', 0.0, 0.26), ('ding', 'sei', 0.0, 0.24)])

# 22. "Quanti lo metterebbero in storia?" (the card shrinks into a story and the shares multiply)
add('s22', 'quanti', 'cta', f'''      <div class="phone" id="v-ph" style="left:260px;top:330px" data-layout-allow-overlap>
        <div style="position:absolute;left:30px;right:30px;top:40px;height:8px;border-radius:4px;background:rgba(255,255,255,0.5)"></div>
        <div style="position:absolute;left:40px;top:120px;width:480px;height:760px;border-radius:40px;background:linear-gradient(165deg,{G},#0f7a35);color:#000">
          <div style="position:absolute;left:30px;top:40px;font:700 26px/1 {SF};letter-spacing:0.14em">IL TUO 2026 DA NOI</div>
          <div style="position:absolute;left:28px;top:100px;font:900 200px/1 {SF};letter-spacing:-0.06em">140</div>
          <div style="position:absolute;left:30px;top:320px;font:800 56px/1 {SF}">caffè ☕</div>
        </div>
        <div id="v-btn" style="position:absolute;left:40px;right:40px;top:930px;height:100px;border-radius:50px;background:#fff;color:#000;font:700 42px/100px {SF};text-align:center">Condividi</div>
      </div>
      <div class="gchip" id="v-c" style="left:420px;top:1520px">×<span id="v-v">1</span></div>''', '''    tl.fromTo("#v-ph", { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.36, ease: "expo.out" }, 0.0);
    tl.fromTo("#v-btn", { scale: 1 }, { scale: 0.92, duration: 0.08, yoyo: true, repeat: 1, immediateRender: false }, «storia» - 0.3);
    pop(tl, "#v-c", «storia» - 0.2);
    count(tl, "#v-v", 1, 140, «storia» - 0.2, 0.6, function (v) { return String(Math.round(v)); }, "power2.in");''', ground='sp',
    fx=[('pop', 'quanti', 0.0, 0.22), ('click', 'storia', -0.3, 0.4), ('notif', 'storia', 0.0, 0.2)])

# ================================================================ KEYWORD + LOOP
# 23. "Scrivi WRAPPED," (comment bar + keyboard)
add('s23', 'cta', 'modello', f'''      {small('w-a', 'scrivi nei commenti', 330, 66, GREY)}
      {big('w-w', 'WRAPPED', 420, 190, G, 'filter:drop-shadow(0 0 36px rgba(30,215,96,0.55))')}
      {commentbar('w', 'WRAPPED', 760)}
      {keyboard('w', 1230, dark=True)}''', '''    tl.fromTo("#w-kb", { y: 700 }, { y: 0, duration: 0.34, ease: "expo.out" }, 0.0);
    tl.fromTo("#w-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, 0.05);
    tl.fromTo("#w-w", { scale: 1.5, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.28, ease: "expo.out" }, «wrapped2» - 0.15);
''' + commentbar_js('w', '«wrapped2» - 0.1', 0.1) + keys_js('w', 'WRAPPED', '«wrapped2» - 0.1', 0.1) + '''    tl.fromTo("#w-pub", { scale: 1 }, { scale: 1.25, duration: 0.1, yoyo: true, repeat: 1 }, «wrapped2» + 0.5);''', KBCSS, ground='sp',
    fx=[('swipe', 'cta', -0.15, 0.24), ('typing', 'wrapped2', -0.1, 0.24), ('click', 'wrapped2', 0.5, 0.4)])

# 24. "...e ti mando il modello per fare il Wrapped della tua attività." (the DM arrives)
add('s24', 'modello', 'ed', f'''      {small('x-a', 'ti arriva in DM', 330, 66, GREY)}
      {dmcard('x', 470, 'Il Wrapped della tua attività', 'modello pronto da usare', icon=GD)}''', '''    tl.fromTo("#x-dm", { y: -900, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.3)" }, 0.0);
    tl.fromTo("#x-doc", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, «wrapped3» - 0.2);''', ground='sp',
    fx=[('notif', 'modello', -0.1, 0.26), ('pop', 'wrapped3', -0.2, 0.26)])

# 25. loop: "Ed è per questo che..." -> "tra pochi giorni 200 milioni di persone..." (the listening clip just before the first frame, the title lands in its first-frame pose)
D25 = T['END'] - T['ed']
add('s25', 'ed', 'END', f'''      {clip('z-v', 'listen.mp4', D25, L0 - D25, 0.15)}
      {small('z-a', 'ed è per questo che…', 420, 76, WHITE, 'filter:drop-shadow(0 4px 20px rgba(0,0,0,0.7))')}
      {HOOKT.replace('@', 'z')}''', '''    tl.fromTo("#z-v-w", { scale: 1.0 }, { scale: 1.12, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#z-a", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.03);
    gsap.set("#z-n", { opacity: 0, scale: 1.7 });
    tl.to("#z-a", { opacity: 0, duration: 0.12 }, DUR - 0.36);
    tl.to("#z-n", { opacity: 1, scale: HS0, duration: 0.3, ease: "power2.in" }, DUR - 0.3);'''.replace('HS0', str(HS0)), cam=False, ground='sp',
    fx=[('riser', 'ed', -0.1, 0.12)])
