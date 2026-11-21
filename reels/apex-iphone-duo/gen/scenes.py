# apex-iphone-duo, version 2: "Apple ha appena fatto uscire un iPhone che si piega in due."
# Built on what the reference reel does well: an object in the first frame, a promise in the first ten seconds, continuous voice,
# a new picture every one to two seconds, and only numbers and key words on screen (no sentences repeated from the voice).
# Verified facts (Apple Italy, November 2026): iPhone Duo from 2.369 € (256 GB); iPhone 18 Pro Max 256 GB Borgogna 1.639 €;
# iPhone 17 Pro Max 256 GB launched at 1.489 € in 2025 (so +150 €). The wine list and the subscription plans are illustrative examples.
# "Apple did not make it to sell it" is the author's opinion and is said as a bet ("scommetto").
import sys
sys.path.insert(0, '.')
from kit import *
from times import T
R = Reel(T)
add = R.add
RED = '#ff453a'; YEL = '#ffd60a'
SF = "'SF Pro Display'"
HT0 = 2.4      # media time of the unfolding clip on the very first frame; the closing scene plays the seconds just before it
HZ0, HRATE = 1.4, 0.10   # zoom of that clip on the first frame, and how fast it eases out

def still(i, src, origin='50% 50%'):
    return f'<div class="vid" id="{i}" data-layout-allow-overlap style="transform-origin:{origin}"><img src="assets/img/{src}" alt="" /></div>'
def big(i, html, top, size, color='#f5f5f7', extra=''):
    return f'<div id="{i}" style="position:absolute;left:0;right:0;top:{top}px;text-align:center;font:700 {size}px/1.05 {SF};letter-spacing:-0.045em;color:{color};{extra}" data-layout-allow-overlap>{html}</div>'
def small(i, html, top, size=66, color='#a1a1a6', extra=''):
    return f'<div id="{i}" style="position:absolute;left:0;right:0;top:{top}px;text-align:center;font:600 {size}px/1.1 {SF};letter-spacing:-0.02em;color:{color};{extra}" data-layout-allow-overlap>{html}</div>'
CUT = '    tl.fromTo("#SID-st", { scale: 1.1 }, { scale: 1, duration: 0.3, ease: "expo.out" }, 0);\n'   # a hard cut that lands with a small push
def cut(sid): return ''   # version 3: every cut gets its transition from the builder

# ================================================================ HOOK
# ---------------------------------------------------------------- 1. "Apple ha appena fatto uscire..."
add('b01', 'start', 'uniphone', f'''      <div class="vid" id="h-w" data-layout-allow-overlap style="transform-origin:50% 52%"><video id="h-v" class="clip" src="assets/video/hero.mp4" data-start="0" data-duration="{T['uniphone']:.2f}" data-media-start="{HT0}" muted playsinline></video></div>
      <div id="h-pill" style="position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:262px;padding:20px 44px;border-radius:999px;background:#ff3b30;color:#fff;font:700 60px/1 {SF};letter-spacing:0.03em" data-layout-allow-overlap>APPENA USCITO</div>
      {big('h-t', '&#xF8FF; iPhone Duo', 384, 138, '#fff', 'text-shadow:0 8px 40px rgba(0,0,0,0.5)')}
      <div class="flash" id="h-fl"></div>''', f'''    tl.fromTo("#h-w", {{ scale: {HZ0} }}, {{ scale: {HZ0 - HRATE * T['uniphone']:.3f}, duration: DUR, ease: "none" }}, 0);
    tl.fromTo("#h-pill", {{ scale: 1.32, rotation: -7 }}, {{ scale: 1, rotation: -3, duration: 0.3, ease: "back.out(2.2)" }}, 0);
    flash(tl, "#h-fl", 0.3, 0.25);
    tl.fromTo("#h-t", {{ opacity: 0, filter: "blur(18px)", scale: 1.25 }}, {{ opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.3, ease: "expo.out" }}, 0.4);
    shake(tl, "#b01-st", 0.3, 16);
''', cam=False,
    fx=[('boom', 'start', 0.0, 0.5), ('whoosh', 'start', 0.0, 0.3), ('pop', 'start', 0.05, 0.3), ('hinge', 'start', 0.5, 0.3), ('thud', 'start', 0.3, 0.34), ('ding', 'start', 0.44, 0.24)], ground='dark')

# ---------------------------------------------------------------- 2. "...un iPhone che si piega in due."
add('b02', 'uniphone', 'costa', f'''      {big('p-c', 'si piega <span class="grad">in due.</span>', 300, 150, INK)}
      {duo('d', -160, 640, None)}''', cut('b02') + '''    gsap.set("#d", { scale: 0.7 }); gsap.set("#d-g", { rotationY: -18, rotationX: 7 }); duoSet("#d", 180);
    fold(tl, "#d", 180, 0, 0.02, 0.4, "power3.out");
    fold(tl, "#d", 0, 180, «sipiega» - 0.06, 0.34, "power3.inOut");
    fold(tl, "#d", 180, 0, «sipiega» + 0.36, 0.42, "power3.out");
    tl.to("#d-g", { rotationY: 14, duration: DUR, ease: "none" }, 0);
    blurIn(tl, "#p-c", «sipiega» - 0.2, 0.24);''',
    fx=[('swipe', 'uniphone', -0.2, 0.26), ('hinge', 'uniphone', 0.3, 0.34), ('whoosh-short', 'sipiega', -0.08, 0.22), ('hinge', 'sipiega', 0.2, 0.36), ('hinge', 'sipiega', 0.7, 0.34), ('pop', 'sipiega', -0.2, 0.18)])

# ---------------------------------------------------------------- 3. "Costa 2.369 euro."
add('b03', 'costa', 'scommetto', f'''      {vid('t-i', 'c-table.mp4', T['scommetto'] - T['costa'], 0.0)}
      {small('t-a', 'costa', 300, 76, '#f5f5f7')}
      <div id="t-p" style="position:absolute;left:0;right:0;top:372px;text-align:center;font:700 244px/1.05 {SF};letter-spacing:-0.05em;color:#fff;text-shadow:0 10px 50px rgba(0,0,0,0.55)" data-layout-allow-overlap><span id="t-n">1.000</span><span style="font-weight:600;font-size:150px"> €</span></div>''', '''    tl.fromTo("#t-i-w", { scale: 1.08 }, { scale: 1.0, duration: DUR, ease: "none" }, 0);
    count(tl, "#t-n", 1000, 2369, «prezzo» - 0.1, 0.95, eur, "power2.out");
    tl.fromTo("#t-p", { scale: 0.8, transformOrigin: "50% 60%" }, { scale: 1, duration: 0.9, ease: "power2.out" }, «prezzo» - 0.1);
    tl.fromTo("#t-p", { scale: 1.16 }, { scale: 1, duration: 0.45, ease: "elastic.out(1.1, 0.4)", immediateRender: false }, «prezzo» + 0.87);
    shake(tl, "#b03-st", «prezzo» + 0.87, 14);''', cam=False,
    fx=[('whoosh-short', 'costa', -0.05, 0.22), ('counter', 'prezzo', -0.1, 0.3), ('whoosh-cinematic', 'prezzo', -0.3, 0.16), ('ding', 'prezzo', 0.87, 0.2), ('impact-bass-1', 'prezzo', 0.87, 0.14)], ground='dark')

# ---------------------------------------------------------------- 4. "E scommetto che NON l'ha fatto per vendertelo."
add('b04', 'scommetto', 'resta', f'''      <div id="w-a" class="wsplit" style="position:absolute;left:0;right:0;top:300px;text-align:center;font:600 76px/1.1 {SF};letter-spacing:-0.02em;color:#86868b">e scommetto che</div>
      <div id="w-n" style="position:absolute;left:0;right:0;top:372px;text-align:center;font:700 340px/1 {SF};letter-spacing:-0.05em;color:#d70015;opacity:0" data-layout-allow-overlap>NON</div>
      <div id="w-c" style="position:absolute;left:0;right:0;top:706px;text-align:center;opacity:0" data-layout-allow-overlap><span style="position:relative;display:inline-block;font:700 92px/1.05 {SF};letter-spacing:-0.04em;color:{INK}">l’ha fatto per vendertelo.<svg viewBox="0 0 800 30" width="52%" height="30" preserveAspectRatio="none" style="position:absolute;right:0;top:54%;overflow:visible"><path id="w-x" d="M0 15 H800" stroke="#d70015" stroke-width="16" stroke-linecap="round" fill="none"/></svg></span></div>
      {duo('d2', -160, 800, None)}''', '''    gsap.set("#d2", { scale: 0.52 }); gsap.set("#d2-g", { rotationX: 8 }); duoSet("#d2", 0);
    tl.fromTo("#d2-g", { rotationY: -34 }, { rotationY: 34, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#d2", { y: 500 }, { y: 0, duration: 0.4, ease: "back.out(1.5)" }, 0);
    wordsIn(tl, "#w-a", 0.02, 0.07);
    tl.fromTo("#w-n", { opacity: 0, scale: 3.2 }, { opacity: 1, scale: 1, duration: 0.18, ease: "expo.out" }, «non» - 0.05);
    shake(tl, "#b04-cam", «non» + 0.02, 28);
    fold(tl, "#d2", 0, 180, «non» - 0.04, 0.3, "power3.in");
    tl.to("#d2", { scale: 0.6, duration: 0.3, ease: "back.out(2)" }, «non» + 0.26);
    tl.fromTo("#w-c", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, «lhafatto» - 0.06);
    draw(tl, "#w-x", «vendertelo» + 0.14, 0.22);''', mq='non in vendita',
    fx=[('key-press', 'scommetto', 0.02, 0.14), ('key-press', 'scommetto', 0.16, 0.12), ('thud', 'non', -0.05, 0.42), ('hinge', 'non', 0.2, 0.4), ('whoosh-short', 'non', -0.1, 0.22), ('key-press', 'lhafatto', -0.06, 0.14), ('swoosh', 'vendertelo', 0.14, 0.3)])

# ---------------------------------------------------------------- 7. the promise: "Resta fino alla fine, perché questo trucco..."
add('b07', 'resta', 'trucco', f'''      {small('r-a', 'resta', 520, 84, '#86868b')}
      {big('r-b', 'fino alla fine', 610, 150, INK)}
      <div style="position:absolute;left:120px;top:900px;width:840px;height:18px;border-radius:9px;background:#e5e5ea" data-layout-allow-overlap><div id="r-f" style="width:840px;height:18px;border-radius:9px;background:{BLUE};transform-origin:left center"></div><i id="r-k" style="position:absolute;left:-23px;top:-14px;width:46px;height:46px;border-radius:50%;background:{BLUE};box-shadow:0 6px 20px rgba(0,113,227,0.5)"></i></div>
      <div style="position:absolute;left:120px;top:950px;font:600 40px/1 {SF};color:#86868b">0:07</div><div style="position:absolute;right:120px;top:950px;font:600 40px/1 {SF};color:#86868b">1:00</div>
      <div class="chip" id="r-c" style="left:0;right:0;margin:0 auto;width:fit-content;top:1080px;background:{INK};font-size:56px;padding:22px 44px">c’è un trucco</div>''', cut('b07') + '''    tl.fromTo("#r-f", { scaleX: 0.11 }, { scaleX: 1, duration: DUR - 0.25, ease: "power2.in" }, 0.05);
    tl.fromTo("#r-k", { x: 92 }, { x: 840, duration: DUR - 0.25, ease: "power2.in" }, 0.05);
    tl.fromTo("#r-b", { scale: 1.2, filter: "blur(10px)" }, { scale: 1, filter: "blur(0px)", duration: 0.22, ease: "expo.out" }, 0.22);
    pop(tl, "#r-c", «perche» + 0.1);''',
    fx=[('swipe', 'resta', -0.2, 0.24), ('key-press', 'resta', 0.02, 0.14), ('riser', 'resta', 0.1, 0.1), ('pop', 'perche', 0.1, 0.26), ('ping', 'perche', 0.5, 0.16)], mq='fino alla fine')

# ---------------------------------------------------------------- 8. "...lo stai subendo anche tu."
add('b08', 'trucco', 'puoi', f'''      {small('u-a', 'questo trucco', 470, 76)}
      {big('u-b', 'lo stai subendo', 560, 118)}
      <div id="u-c" style="position:absolute;left:0;right:0;top:720px;text-align:center" data-layout-allow-overlap><span style="position:relative;display:inline-block;font:700 224px/1.05 {SF};letter-spacing:-0.05em;color:{YEL}">anche tu.<i id="u-box" style="position:absolute;left:-24px;right:-24px;top:10px;bottom:0;border:6px dashed {YEL};border-radius:20px;opacity:0"></i></span></div>
      <div id="u-cur" class="cur" style="left:880px;top:960px">{CURSOR.replace('#1d1d1f', '#f5f5f7').replace('#fff', '#000')}</div>''', cut('b08') + '''    tl.fromTo("#u-b", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, «subendo» - 0.12);
    tl.fromTo("#u-c", { opacity: 0, scale: 1.6, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }, «anchetu» - 0.06);
    shake(tl, "#b08-cam", «anchetu» + 0.02, 18);
    tl.fromTo("#u-box", { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 0.18 }, «anchetu» + 0.2);
    tl.fromTo("#u-cur", { opacity: 0, x: 140, y: 160 }, { opacity: 1, x: 0, y: 0, duration: 0.24, ease: "power3.out" }, «anchetu» + 0.14);''',
    fx=[('whoosh-short', 'trucco', -0.04, 0.2), ('key-press', 'subendo', -0.12, 0.14), ('thud', 'anchetu', -0.06, 0.34), ('click', 'anchetu', 0.3, 0.36)], ground='dark', mq='anche tu')

# ---------------------------------------------------------------- 9. "E puoi usarlo per vendere di più."
bars = ''.join(f'<i class="vb" style="height:{h}px"></i>' for h in (130, 210, 300, 420, 560))
add('b09', 'puoi', 'domanda', f'''      {small('g-a', 'e puoi usarlo per', 330, 70, '#86868b')}
      {big('g-b', 'vendere di più.', 420, 150, GREEN)}
      <div style="position:absolute;left:150px;right:150px;top:760px;height:620px;display:flex;align-items:flex-end;gap:28px;border-bottom:5px solid #d2d2d7" data-layout-allow-overlap>{bars}</div>
      <svg viewBox="0 0 780 620" width="780" height="620" style="position:absolute;left:150px;top:700px;overflow:visible" data-layout-allow-overlap><path id="g-l" d="M40 520 L210 430 L370 340 L530 210 L720 40" fill="none" stroke="{INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path id="g-h" d="M660 40 H724 V104" fill="none" stroke="{INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>''', cut('b09') + '''    tl.fromTo(".vb", { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: "back.out(1.6)", stagger: 0.07 }, 0.1);
    tl.fromTo("#g-b", { opacity: 0, scale: 1.3, filter: "blur(12px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }, «vendere» - 0.1);
    draw(tl, "#g-l", «vendere» - 0.05, 0.5); draw(tl, "#g-h", «dipiu» - 0.05, 0.2);''', f'''
    .vb {{ display: block; flex: 1; border-radius: 18px 18px 0 0; background: linear-gradient(180deg, #34c759, {GREEN}); transform-origin: 50% 100%; }}''',
    fx=[('swipe', 'puoi', -0.18, 0.22), ('pop', 'puoi', 0.1, 0.18), ('pop', 'puoi', 0.24, 0.18), ('pop', 'puoi', 0.38, 0.18), ('thud', 'vendere', -0.1, 0.26), ('swoosh', 'vendere', 0.0, 0.26), ('register', 'dipiu', 0.05, 0.34)])

# ================================================================ THE DEMONSTRATION
# ---------------------------------------------------------------- 10. "Ti faccio una domanda."
add('b10', 'domanda', 'mille', f'''      <div id="q-m" style="position:absolute;left:0;right:0;top:300px;text-align:center;font:700 700px/1 {SF};color:{YEL};opacity:0.95" data-layout-allow-overlap>?</div>
      {small('q-a', 'ti faccio una', 1080, 80, '#f5f5f7')}
      {big('q-b', 'domanda.', 1170, 200)}''', cut('b10') + '''    tl.fromTo("#q-m", { scale: 0.2, rotation: -30, opacity: 0 }, { scale: 1, rotation: 8, opacity: 0.9, duration: 0.4, ease: "back.out(2)" }, 0.02);
    tl.to("#q-m", { rotation: -4, duration: DUR - 0.4, ease: "sine.inOut" }, 0.42);''',
    fx=[('whoosh', 'domanda', -0.1, 0.26), ('pop', 'domanda', 0.04, 0.3), ('ping', 'domanda', 0.3, 0.16)], ground='dark')

# ---------------------------------------------------------------- 11. "1.639 euro per un telefono, sono tanti?"
add('b11', 'mille', 'tantissimi', f'''      {vid('m-i', 'c-hand.mp4', T['tantissimi'] - T['mille'], 0.1)}
      <div id="m-p" style="position:absolute;left:0;right:0;top:300px;text-align:center;font:700 230px/1.05 {SF};letter-spacing:-0.05em;color:#fff;text-shadow:0 10px 50px rgba(0,0,0,0.5)" data-layout-allow-overlap><span id="m-n">900</span><span style="font-weight:600;font-size:140px"> €</span></div>
      <div class="chip" id="m-q" style="left:0;right:0;margin:0 auto;width:fit-content;top:1310px;background:#fff;color:{INK};font-size:92px;padding:30px 60px;box-shadow:0 30px 80px -20px rgba(0,0,0,0.5)">sono tanti?</div>''', '''    tl.fromTo("#m-i-w", { scale: 1.3 }, { scale: 1.02, duration: 0.4, ease: "expo.out" }, 0);
    tl.fromTo("#m-i-w", { scale: 1.28 }, { scale: 1.14, duration: DUR - «telefono», ease: "power1.out", immediateRender: false }, «telefono»);
    count(tl, "#m-n", 900, 1639, 0.0, 0.8, eur, "power2.out");
    punch(tl, "#m-p", 0.8, 1.14);
    tl.fromTo("#m-q", { opacity: 0, scale: 0.4, rotation: -8 }, { opacity: 1, scale: 1, rotation: -3, duration: 0.3, ease: "back.out(2.6)" }, «tanti» - 0.1);''', cam=False,
    fx=[('whoosh', 'mille', -0.1, 0.28), ('counter', 'mille', 0.0, 0.3), ('ding', 'mille', 0.8, 0.28), ('thud', 'telefono', 0.0, 0.3), ('pop', 'tanti', -0.1, 0.3)], ground='dark')

# ---------------------------------------------------------------- 12. "Tantissimi."
add('b12', 'tantissimi', 'promax', f'''      <div style="position:absolute;left:0;right:0;top:700px;text-align:center" data-layout-allow-overlap><span id="s-b" style="position:relative;display:inline-block;font:700 196px/1.05 {SF};letter-spacing:-0.05em;color:#d70015">Tantissimi.</span></div>''', '''    tl.fromTo("#s-b", { scale: 1.8, filter: "blur(14px)" }, { scale: 1, filter: "blur(0px)", duration: 0.2, ease: "expo.out" }, 0);
    shake(tl, "#b12-cam", 0.08, 24);
    tl.to("#s-b", { scale: 1.06, duration: DUR - 0.2, ease: "none" }, 0.2);''',
    fx=[('boom', 'tantissimi', 0.0, 0.36), ('thud', 'tantissimi', 0.02, 0.34)], mq='1.639 €')

# ---------------------------------------------------------------- 13. "È il nuovo Pro Max..."
add('b13', 'promax', 'centocinq', f'''      {still('x-i', 'table-pro.jpg', '74% 78%')}
      <div class="shade"></div>
      {small('x-a', 'il nuovo', 300, 70, '#f5f5f7')}
      {big('x-b', 'iPhone 18 Pro Max', 384, 112, '#fff', 'text-shadow:0 8px 40px rgba(0,0,0,0.5)')}''', '''    tl.fromTo("#x-i", { scale: 1.25 }, { scale: 1.0, duration: 0.4, ease: "expo.out" }, 0);
    tl.to("#x-i", { scale: 1.9, duration: DUR - 0.4, ease: "power2.in" }, 0.4);
    tl.fromTo("#x-b", { opacity: 0, filter: "blur(14px)", scale: 1.15 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.24, ease: "expo.out" }, 0.1);''', cam=False,
    fx=[('swipe', 'promax', -0.2, 0.24), ('key-press', 'promax', 0.1, 0.16), ('whoosh-short', 'centocinq', -0.3, 0.2)], ground='dark')

# ---------------------------------------------------------------- 14. "...e costa 150 euro più dell'anno scorso."
add('b14', 'centocinq', 'adesso', f'''      <div class="yr" id="y-1" style="left:70px"><small>2025 · iPhone 17 Pro Max</small><b style="color:#86868b">1.489 €</b></div>
      <div class="yr" id="y-2" style="left:560px"><small>2026 · iPhone 18 Pro Max</small><b>1.639 €</b></div>
      <svg viewBox="0 0 120 60" width="120" height="60" style="position:absolute;left:480px;top:560px;overflow:visible" data-layout-allow-overlap><path id="y-ar" d="M10 30 H104 M80 8 L106 30 L80 52" fill="none" stroke="{INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <div class="chip" id="y-up" style="left:0;right:0;margin:0 auto;width:fit-content;top:940px;background:#d70015;font-size:200px;padding:36px 70px;border-radius:60px;letter-spacing:-0.04em">+150 €</div>
      {small('y-s', 'in un anno', 1280, 70, '#86868b')}''', cut('b14') + '''    tl.fromTo("#y-1", { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 0.26, ease: "expo.out" }, 0.02);
    draw(tl, "#y-ar", 0.26, 0.2);
    tl.fromTo("#y-2", { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.26, ease: "expo.out" }, 0.34);
    tl.fromTo("#y-up", { opacity: 0, scale: 0.3, rotation: -12 }, { opacity: 1, scale: 1, rotation: -4, duration: 0.36, ease: "back.out(2.4)" }, 0.62);
    shake(tl, "#b14-cam", 0.66, 16);
    tl.fromTo("#y-s", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «annoscorso» - 0.1);''', f'''
    .yr {{ position: absolute; top: 500px; width: 450px; height: 220px; border-radius: 36px; background: #f5f5f7; padding: 38px 40px; opacity: 0; }}
    .yr small {{ display: block; font: 600 32px/1 "SF Pro Display"; color: #86868b; }}
    .yr b {{ display: block; font: 700 100px/1 "SF Pro Display"; letter-spacing: -0.04em; margin-top: 24px; }}''',
    fx=[('key-press', 'centocinq', 0.02, 0.16), ('swoosh', 'centocinq', 0.26, 0.22), ('key-press', 'centocinq', 0.34, 0.16), ('pop', 'centocinq', 0.62, 0.32), ('thud', 'centocinq', 0.66, 0.34), ('ping', 'annoscorso', -0.1, 0.14)])

# ---------------------------------------------------------------- 15. "Adesso guarda."
add('b15', 'adesso', 'glimetto', f'''      {small('o-a', 'adesso', 700, 84)}
      {big('o-b', 'guarda.', 790, 250)}''', cut('b15') + '''    tl.fromTo("#o-b", { scale: 1.4, filter: "blur(12px)" }, { scale: 1, filter: "blur(0px)", duration: 0.2, ease: "expo.out" }, «adesso» * 0 + 0.3);''',
    fx=[('whoosh', 'adesso', -0.12, 0.26), ('thud', 'adesso', 0.3, 0.3)], ground='dark', mq='guarda')

# ---------------------------------------------------------------- 16. "Gli metto vicino il Duo. E quei 1.600, di colpo, sembrano quasi un affare."
add('b16', 'glimetto', 'settecento', f'''      <div class="pc" id="c-l" style="left:40px">
        <div class="pi"><img class="mul" src="assets/img/ip18-burg-a.png" style="height:640px;margin-top:-10px;filter:brightness(1.06) contrast(1.03)" alt="" /></div>
        <div class="pn">iPhone 18 Pro Max</div>
        <div class="pp" id="c-lp">1.639 €</div>
        <div id="c-st">affare?</div>
      </div>
      <div class="pc" id="c-r" style="left:560px">
        <div class="pi"><img src="assets/img/duo-vee.png" style="height:570px;margin-top:30px" alt="" /></div>
        <div class="pn">iPhone Duo</div>
        <div class="pp" id="c-rp"><span id="c-rn">1.639</span> €</div>
      </div>''', cut('b16') + '''    gsap.set("#c-l", { x: 260 });
    tl.to("#c-l", { x: 0, duration: 0.4, ease: "expo.out" }, «ilduo» - 0.62);
    tl.fromTo("#c-r", { x: 900, rotation: 10 }, { x: 0, rotation: 0, duration: 0.42, ease: "back.out(1.3)" }, «ilduo» - 0.55);
    shake(tl, "#b16-cam", «ilduo» - 0.2, 22);
    count(tl, "#c-rn", 1639, 2369, «ilduo» - 0.18, 0.5, eur, "power2.out");
    punch(tl, "#c-rp", «ilduo» + 0.32, 1.2);
    tl.fromTo("#c-lp", { scale: 1 }, { scale: 1.22, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, «quei» + 0.2);
    tl.to("#c-r", { scale: 1.07, transformOrigin: "50% 60%", duration: 0.4, ease: "back.out(2)" }, «dicolpo» - 0.05);
    tl.to("#c-l", { scale: 0.93, transformOrigin: "50% 60%", duration: 0.4, ease: "back.out(2)" }, «dicolpo» - 0.05);
    tl.to("#c-lp", { color: "#1d8a3c", duration: 0.2 }, «dicolpo» + 0.1);
    tl.to("#c-l", { boxShadow: "0 40px 100px -30px rgba(29,138,60,0.5), 0 0 0 6px #1d8a3c", duration: 0.25 }, «dicolpo» + 0.1);
    tl.fromTo("#c-st", { opacity: 0, scale: 2.8, rotation: -30 }, { opacity: 1, scale: 1, rotation: -12, duration: 0.26, ease: "power4.in" }, «affare» + 0.1);
    shake(tl, "#b16-cam", «affare» + 0.36, 16);''', f'''
    .mul {{ mix-blend-mode: multiply; }}
    .pc {{ position: absolute; top: 470px; width: 480px; height: 900px; border-radius: 48px; background: #fff; box-shadow: 0 40px 100px -30px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.04); text-align: center; }}
    .pi {{ height: 630px; overflow: hidden; border-radius: 48px 48px 0 0; }}
    .pn {{ font: 600 42px/1.2 "SF Pro Display"; letter-spacing: -0.015em; color: #86868b; margin-top: 22px; }}
    .pp {{ font: 700 108px/1.1 "SF Pro Display"; letter-spacing: -0.04em; display: inline-block; }}
    #c-st {{ position: absolute; left: 50px; top: 230px; padding: 14px 34px; border: 10px solid {GREEN}; border-radius: 24px; color: {GREEN}; font: 700 92px/1 "SF Pro Display"; letter-spacing: -0.02em; text-transform: uppercase; background: rgba(255,255,255,0.92); opacity: 0; }}''',
    fx=[('swipe', 'glimetto', -0.2, 0.24), ('whoosh', 'ilduo', -0.55, 0.3), ('thud', 'ilduo', -0.2, 0.4), ('impact-bass-1', 'ilduo', -0.2, 0.26), ('counter', 'ilduo', -0.18, 0.28), ('ding', 'ilduo', 0.32, 0.28), ('pop', 'quei', 0.2, 0.24),
        ('whoosh-short', 'dicolpo', -0.08, 0.22), ('sparkle', 'dicolpo', 0.1, 0.18), ('thud', 'affare', 0.34, 0.4), ('register', 'affare', 0.38, 0.36)], ground='grey', mq='accanto')

# ---------------------------------------------------------------- 17. "730 euro in meno."
add('b17', 'settecento', 'stesso', f'''      <div id="d-p" style="position:absolute;left:0;right:0;top:620px;text-align:center;font:700 330px/1.05 {SF};letter-spacing:-0.05em;color:#30d158" data-layout-allow-overlap>−<span id="d-n">0</span><span style="font-weight:600;font-size:200px"> €</span></div>
      {small('d-s', 'in meno', 990, 90, '#f5f5f7')}''', cut('b17') + '''    count(tl, "#d-n", 0, 730, 0.0, 0.6, eur, "power2.out");
    punch(tl, "#d-p", 0.6, 1.16);
    tl.fromTo("#d-s", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, «inmeno» - 0.1);''',
    fx=[('whoosh', 'settecento', -0.1, 0.26), ('counter', 'settecento', 0.0, 0.3), ('ding', 'settecento', 0.6, 0.3), ('key-press', 'inmeno', -0.1, 0.14)], ground='dark', mq='−730 €')

# ---------------------------------------------------------------- 18. "Il telefono è lo stesso."
add('b18', 'stesso', 'cambiato', f'''      {big('e-t', 'lo stesso.', 300, 160, INK)}
      <img id="e-a" class="mul" src="assets/img/ip18-burg-a.png" style="position:absolute;left:30px;top:600px;height:860px;filter:brightness(1.06) contrast(1.03)" alt="" />
      <img id="e-b" class="mul" src="assets/img/ip18-burg-a.png" style="position:absolute;left:568px;top:600px;height:860px;filter:brightness(1.06) contrast(1.03)" alt="" />
      <div id="e-eq" style="position:absolute;left:0;right:0;top:880px;text-align:center;font:700 220px/1 {SF};color:{INK}" data-layout-allow-overlap>=</div>''', cut('b18') + '''    tl.fromTo("#e-a", { x: -400 }, { x: 0, duration: 0.3, ease: "expo.out" }, 0);
    tl.fromTo("#e-b", { x: 400 }, { x: 0, duration: 0.3, ease: "expo.out" }, 0.1);
    pop(tl, "#e-eq", 0.3);''', '''
    .mul { mix-blend-mode: multiply; }''',
    fx=[('whoosh-short', 'stesso', -0.05, 0.22), ('pop', 'stesso', 0.3, 0.3), ('thud', 'stesso', 0.32, 0.24)])

# ---------------------------------------------------------------- 19. "È cambiato solo quello che ha accanto."
add('b19', 'cambiato', 'sichiama', f'''      {small('f-a', 'è cambiato solo', 300, 76, '#86868b')}
      {big('f-b', 'quello accanto.', 392, 132, INK)}
      <img id="f-p" class="mul" src="assets/img/ip18-burg-a.png" style="position:absolute;left:40px;top:650px;height:820px;filter:brightness(1.06) contrast(1.03)" alt="" />
      <div id="f-slot" style="position:absolute;left:560px;top:690px;width:470px;height:740px;border:7px dashed {BLUE};border-radius:44px" data-layout-allow-overlap>
        <div id="f-q" style="position:absolute;left:0;right:0;top:230px;text-align:center;font:700 260px/1 {SF};color:#c7c7cc">?</div>
        <img id="f-d" src="assets/img/duo-vee.png" style="position:absolute;left:10px;top:90px;width:450px;height:573px;opacity:0" alt="" />
      </div>''', cut('b19') + '''    tl.fromTo("#f-b", { opacity: 0, filter: "blur(12px)", scale: 1.15 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.24, ease: "expo.out" }, «accanto» - 0.9);
    tl.to("#f-q", { opacity: 0, scale: 0.4, duration: 0.14 }, «accanto» - 0.5);
    tl.fromTo("#f-d", { opacity: 0, scale: 0.4, rotation: 10 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.36, ease: "back.out(2.2)" }, «accanto» - 0.46);
    tl.to("#f-slot", { borderColor: "#c9a227", boxShadow: "0 0 80px 10px rgba(201,162,39,0.45)", duration: 0.3 }, «accanto» - 0.4);
    tl.fromTo("#f-slot", { scale: 1 }, { scale: 1.06, duration: 0.16, yoyo: true, repeat: 1, immediateRender: false }, «accanto» - 0.1);''', '''
    .mul { mix-blend-mode: multiply; }''',
    fx=[('swipe', 'cambiato', -0.2, 0.24), ('key-press', 'cambiato', 0.02, 0.14), ('pop', 'accanto', -0.46, 0.32), ('sparkle', 'accanto', -0.36, 0.18), ('ping', 'accanto', -0.1, 0.16)])

# ================================================================ THE NAME
# ---------------------------------------------------------------- 20. "Si chiama effetto àncora."
add('b20', 'sichiama', 'ilprimo', f'''      {small('k-a', 'si chiama', 330, 62)}
      {big('k-b', 'Effetto', 410, 150)}
      <div id="k-c" style="position:absolute;left:0;right:0;top:560px;text-align:center"><span class="split" id="k-cw" style="font:700 216px/1.05 {SF};letter-spacing:-0.045em;color:#2997ff;display:inline-block">àncora.</span></div>
      <div style="position:absolute;left:0;top:830px;width:1080px;height:1090px;overflow:hidden" data-layout-allow-overlap><svg id="k-an" viewBox="0 0 200 1200" width="330" height="1980" style="position:absolute;left:375px;top:-1390px;overflow:visible" fill="none" stroke="#f5f5f7" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">
        <path d="M100 0 V962" stroke-dasharray="4 26" stroke="#6e6e73"/>
        <circle cx="100" cy="986" r="22"/><path d="M100 1008 V1180"/><path d="M62 1050 H138"/>
        <path d="M26 1100 C26 1158 68 1184 100 1184 C132 1184 174 1158 174 1100"/><path d="M26 1100 L10 1128 M26 1100 L52 1116 M174 1100 L190 1128 M174 1100 L148 1116"/>
      </svg></div>
      <i class="rp" id="k-r1"></i><i class="rp" id="k-r2"></i>
      {small('k-src', 'Tversky e Kahneman, 1974', 1450, 34, '#86868b')}''', cut('b20') + '''    tl.fromTo("#k-b", { opacity: 0, filter: "blur(14px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power2.out" }, «effetto» - 0.2);
    flip(tl, "#k-cw", «ancora» - 0.14, 0.03);
    tl.fromTo("#k-an", { y: -1500 }, { y: 0, duration: 0.42, ease: "power3.in" }, «ancora» - 0.36);
    tl.to("#k-an", { y: -46, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 }, «ancora» + 0.06);
    shake(tl, "#b20-cam", «ancora» + 0.06, 22);
    ["#k-r1", "#k-r2"].forEach((r, k) => tl.fromTo(r, { opacity: 0.8, scale: 0.2 }, { opacity: 0, scale: 3.2, duration: 0.6, ease: "power2.out" }, «ancora» + 0.08 + k * 0.14));
    tl.fromTo("#k-src", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «ancora» + 0.1);''', '''
    .rp { position: absolute; left: 390px; top: 1300px; display: block; width: 300px; height: 90px; border-radius: 50%; border: 6px solid #2997ff; opacity: 0; }''',
    fx=[('swipe', 'sichiama', -0.2, 0.24), ('thud', 'effetto', -0.2, 0.28), ('anchor', 'ancora', -0.44, 0.5), ('typing', 'ancora', -0.14, 0.16), ('boom', 'ancora', 0.06, 0.45)], ground='dark')

# ---------------------------------------------------------------- 21. "Il primo prezzo che vedi diventa il tuo metro."
ticks = ''.join(f'<i style="top:{k * 64}px;width:{44 if k % 5 == 0 else 24}px"></i>' for k in range(11))
add('b21', 'ilprimo', 'perquesto', f'''      {small('m-a', 'il primo prezzo che vedi', 300, 66, '#86868b')}
      {big('m-b', 'diventa il tuo metro.', 380, 106, INK)}
      <div style="position:absolute;left:0;top:640px;width:1080px;height:860px" data-layout-allow-overlap>
        <div style="position:absolute;left:110px;right:110px;top:810px;height:4px;background:#d2d2d7;border-radius:2px"></div>
        <div class="rul" id="m-rul">{ticks}</div>
        <div class="bar" id="m-b1" style="left:250px;height:640px;background:linear-gradient(180deg,#31407a,#1d2a57)"></div>
        <div class="bl" id="m-l1" style="left:250px;top:50px">2.369 €<small>il primo</small></div>
        <div class="bar" id="m-b2" style="left:610px;height:443px;background:linear-gradient(180deg,#a11a35,#7a0f24)"></div>
        <div class="bl" id="m-l2" style="left:610px;top:247px">1.639 €<small>sembra poco</small></div>
        <div id="m-dash" style="position:absolute;left:250px;top:168px;width:650px;height:0;border-top:5px dashed #86868b;transform-origin:left center"></div>
      </div>''', cut('b21') + '''    tl.fromTo("#m-b1", { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "expo.out" }, 0.05);
    tl.fromTo("#m-l1", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25, ease: "back.out(2)" }, 0.42);
    tl.fromTo("#m-b", { opacity: 0, filter: "blur(12px)", scale: 1.12 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.24, ease: "expo.out" }, «diventa» - 0.08);
    tl.fromTo("#m-rul i", { scaleX: 0 }, { scaleX: 1, duration: 0.14, ease: "power2.out", stagger: { each: 0.03, from: "end" } }, «diventa»);
    tl.fromTo("#m-dash", { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: "power2.out" }, «metro» - 0.1);
    tl.fromTo("#m-b2", { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: "expo.out" }, «metro»);
    tl.fromTo("#m-l2", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.22, ease: "back.out(2)" }, «metro» + 0.26);''', f'''
    .bar {{ position: absolute; bottom: 50px; width: 220px; border-radius: 26px 26px 0 0; transform-origin: 50% 100%; }}
    .bl {{ position: absolute; width: 220px; text-align: center; font: 700 62px/1 "SF Pro Display"; letter-spacing: -0.035em; opacity: 0; white-space: nowrap; }}
    .bl small {{ display: block; font: 600 30px/1 "SF Pro Display"; color: #86868b; margin-top: 8px; letter-spacing: 0; }}
    .rul {{ position: absolute; left: 150px; top: 170px; width: 60px; height: 644px; border-right: 6px solid {INK}; }}
    .rul i {{ position: absolute; right: 0; height: 6px; margin-top: -3px; background: {INK}; border-radius: 3px; transform-origin: right center; }}''',
    fx=[('whoosh-short', 'ilprimo', -0.05, 0.22), ('swoosh', 'ilprimo', 0.05, 0.22), ('pop', 'ilprimo', 0.42, 0.22), ('thud', 'diventa', -0.08, 0.28), ('typing', 'diventa', 0.0, 0.2), ('swoosh', 'metro', 0.0, 0.22), ('ping', 'metro', 0.26, 0.16)])

# ---------------------------------------------------------------- 22. "Per questo il Duo non deve vendere."
add('b22', 'perquesto', 'devesolo', f'''      {vid('w-i', 'c-window.mp4', T['devesolo'] - T['perquesto'], 0.2)}
      {small('w-a', 'il Duo', 300, 80, '#f5f5f7')}
      {big('w-b', '<span style="color:' + RED + '">non</span> deve vendere.', 390, 122, '#fff', 'text-shadow:0 8px 40px rgba(0,0,0,0.6)')}''', '''    tl.fromTo("#w-i-w", { scale: 1.25 }, { scale: 1.0, duration: 0.45, ease: "expo.out" }, 0);
    tl.fromTo("#w-b", { opacity: 0, filter: "blur(12px)", scale: 1.15 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.24, ease: "expo.out" }, «nondeve» - 0.12);''', cam=False,
    fx=[('whoosh-cinematic', 'perquesto', -0.2, 0.2), ('key-press', 'perquesto', 0.05, 0.14), ('thud', 'nondeve', -0.12, 0.3)], ground='dark')

# ---------------------------------------------------------------- 23. "Deve solo stare lì..."
add('b23', 'devesolo', 'normale0', f'''      <div class="vid" id="x2-i" data-layout-allow-overlap style="transform-origin:52% 44%"><video id="x2-v" class="clip" src="assets/video/c-window.mp4" data-start="0" data-duration="{T['normale0'] - T['devesolo']:.2f}" data-media-start="{0.2 + T['devesolo'] - T['perquesto']:.2f}" muted playsinline></video></div>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)"></div>
      {big('x2-b', 'deve solo stare lì.', 1220, 110, '#fff', 'text-shadow:0 8px 40px rgba(0,0,0,0.6)')}''', '''    tl.fromTo("#x2-i", { scale: 1.9 }, { scale: 1.6, duration: DUR, ease: "power1.out" }, 0);
    tl.fromTo("#x2-b", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }, 0.1);''', cam=False,
    fx=[('thud', 'devesolo', 0.0, 0.28), ('sparkle', 'devesolo', 0.2, 0.16)], ground='dark', tin='N')

# ---------------------------------------------------------------- 24. "...a far sembrare normale tutto il resto."
add('b24', 'normale0', 'euna', f'''      {small('z-a', 'e tutto il resto sembra', 300, 70, '#86868b')}
      {big('z-b', 'normale.', 384, 190, GREEN)}
      <div class="pc" id="z-c" style="left:290px;top:700px;width:500px;height:800px">
        <div class="pi" style="height:540px"><img class="mul" src="assets/img/ip18-burg-a.png" style="height:560px;margin-top:-10px;filter:brightness(1.06) contrast(1.03)" alt="" /></div>
        <div class="pn">iPhone 18 Pro Max</div>
        <div class="pp" style="color:{GREEN}">1.639 €</div>
      </div>
      <div class="chip" id="z-ok" style="left:650px;top:660px;background:{GREEN};font-size:56px;padding:20px 38px">normale ✓</div>''', cut('b24') + '''    tl.fromTo("#z-c", { y: 500 }, { y: 0, duration: 0.4, ease: "back.out(1.4)" }, 0);
    tl.fromTo("#z-ok", { opacity: 0, scale: 0.4, rotation: 10 }, { opacity: 1, scale: 1, rotation: 5, duration: 0.3, ease: "back.out(2.6)" }, «normale» - «normale0» + 0.3);''', f'''
    .mul {{ mix-blend-mode: multiply; }}
    .pc {{ position: absolute; border-radius: 48px; background: #fff; box-shadow: 0 40px 100px -30px rgba(0,0,0,0.28), 0 0 0 5px {GREEN}; text-align: center; }}
    .pi {{ overflow: hidden; border-radius: 48px 48px 0 0; }}
    .pn {{ font: 600 42px/1.2 "SF Pro Display"; letter-spacing: -0.015em; color: #86868b; margin-top: 22px; }}
    .pp {{ font: 700 108px/1.1 "SF Pro Display"; letter-spacing: -0.04em; display: inline-block; }}''',
    fx=[('swipe', 'normale0', -0.18, 0.24), ('thud', 'normale0', 0.04, 0.3), ('pop', 'normale', 0.2, 0.3), ('ding', 'normale', 0.24, 0.26)], ground='grey')

# ================================================================ IT IS EVERYWHERE
# ---------------------------------------------------------------- 25. "E una volta che lo noti, lo vedi ovunque."
add('b25', 'euna', 'ristorante', f'''      {still('o-1', 'wine.jpg')}{still('o-2', 'table-pro.jpg')}{still('o-3', 'window.jpg')}{still('o-4', 'table-duo.jpg')}
      <div id="o-w" style="position:absolute;inset:0;background:#000" data-layout-allow-overlap>{big('o-t', 'ovunque.', 770, 230)}</div>''', '''    ["#o-1", "#o-2", "#o-3", "#o-4"].forEach((s, k) => { tl.set(s, { autoAlpha: 1 }, k * 0.24); tl.fromTo(s, { scale: 1.25 }, { scale: 1.05, duration: 0.24, ease: "power2.out" }, k * 0.24); if (k) tl.set(["#o-1", "#o-2", "#o-3", "#o-4"][k - 1], { autoAlpha: 0 }, k * 0.24); });
    gsap.set(["#o-2", "#o-3", "#o-4", "#o-w"], { autoAlpha: 0 });
    tl.set("#o-w", { autoAlpha: 1 }, «ovunque» - 0.05);
    tl.fromTo("#o-t", { scale: 1.6, filter: "blur(14px)" }, { scale: 1, filter: "blur(0px)", duration: 0.22, ease: "expo.out" }, «ovunque» - 0.05);''', cam=False,
    fx=[('click', 'euna', 0.0, 0.4), ('click', 'euna', 0.24, 0.4), ('click', 'euna', 0.48, 0.4), ('click', 'euna', 0.72, 0.4), ('whoosh-short', 'ovunque', -0.15, 0.16), ('thud', 'ovunque', -0.05, 0.3)], ground='dark')

# ---------------------------------------------------------------- 26. "Al ristorante..."
add('b26', 'ristorante', 'bottiglia', f'''      {still('r2-i', 'wine.jpg', '50% 60%')}
      <div class="shade"></div>
      {big('r2-b', 'al ristorante', 330, 130, '#fff', 'text-shadow:0 8px 40px rgba(0,0,0,0.6)')}''', '''    tl.fromTo("#r2-i", { scale: 1.25 }, { scale: 1.45, duration: DUR, ease: "power1.in" }, 0);
    tl.fromTo("#r2-b", { opacity: 0, filter: "blur(12px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.18, ease: "power2.out" }, 0.02);''', cam=False,
    fx=[('clink', 'ristorante', 0.0, 0.34), ('key-press', 'ristorante', 0.02, 0.14)], ground='dark')

# ---------------------------------------------------------------- 27. "...la bottiglia da 300 euro serve a vendere quella da sessanta."
def wrow(k, name, desc, price):
    return f'<div class="wr" id="v-r{k}" style="top:{150 + (k - 1) * 158}px"><div><b>{name}</b><small>{desc}</small></div><span id="v-p{k}">{price} €</span></div>'
add('b27', 'bottiglia', 'abbonamenti', f'''      <div id="v-pv" style="position:absolute;left:90px;top:440px;width:900px;height:880px;perspective:2200px" data-layout-allow-overlap>
        <div id="v-card" style="position:absolute;inset:0;border-radius:38px;background:#f7f1e6;color:#2a211a;box-shadow:0 60px 120px -30px rgba(0,0,0,0.7);transform-origin:50% 30%">
          <div style="position:absolute;left:0;right:0;top:46px;text-align:center;font:600 32px/1 {SF};letter-spacing:0.28em;color:#8a6f4d">CARTA DEI VINI</div>
          <div style="position:absolute;left:60px;right:60px;top:112px;height:2px;background:#d9c9ac"></div>
          <i id="v-hl" style="position:absolute;left:24px;top:136px;width:852px;height:150px;border-radius:26px;border:5px solid #c9a227;background:rgba(201,162,39,0.12)"></i>
          {wrow(1, 'Barolo Riserva 2010', 'in cima alla carta', '300')}{wrow(2, 'Barbaresco 2019', 'rosso, 75 cl', '60')}{wrow(3, 'Nebbiolo 2021', 'rosso, 75 cl', '38')}{wrow(4, 'Dolcetto 2022', 'rosso, 75 cl', '24')}
          <svg viewBox="0 0 852 20" width="852" height="20" style="position:absolute;left:24px;top:196px;overflow:visible"><path id="v-xx" d="M30 10 H822" stroke="#8a6f4d" stroke-width="7" stroke-linecap="round" fill="none"/></svg>
          <div class="chip" id="v-no" style="left:520px;top:176px;background:#2a211a;font-size:32px;padding:12px 22px">non si vende</div>
          <div class="chip" id="v-ok" style="left:486px;top:330px;width:80px;height:80px;padding:0;background:{GREEN};font-size:46px;line-height:80px;text-align:center">✓</div>
        </div>
      </div>
      <div id="v-cur" class="cur" style="left:820px;top:920px">{CURSOR}</div>''', '''    tl.fromTo("#v-card", { y: 900, rotationX: 40 }, { y: 0, rotationX: 6, scale: 1.08, duration: 0.42, ease: "expo.out" }, 0);
    tl.fromTo("#v-p1", { scale: 1 }, { scale: 1.55, color: "#b8860b", duration: 0.18, ease: "back.out(3)" }, «trecento» - 0.02);
    tl.to("#v-p1", { scale: 1.15, duration: 0.25 }, «trecento» + 0.35);
    draw(tl, "#v-xx", «serve» - 0.3, 0.28);
    pop(tl, "#v-no", «serve» - 0.1);
    tl.to("#v-r1", { opacity: 0.45, duration: 0.25 }, «serve» - 0.1);
    tl.to("#v-hl", { y: 158, borderColor: "#1d8a3c", backgroundColor: "rgba(29,138,60,0.12)", duration: 0.28, ease: "back.out(1.6)" }, «serve» + 0.3);
    tl.to("#v-no", { opacity: 0, duration: 0.15 }, «serve» + 0.3);
    tl.to("#v-card", { rotationX: 0, y: -20, scale: 1.14, duration: 0.45, ease: "power2.out" }, «serve» + 0.3);
    tl.fromTo("#v-cur", { opacity: 0, x: 200, y: 300 }, { opacity: 1, x: 0, y: 0, duration: 0.3, ease: "power3.out" }, «sessanta» - 0.4);
    tl.to("#v-cur", { scale: 0.8, duration: 0.06, yoyo: true, repeat: 1 }, «sessanta» - 0.02);
    tl.fromTo("#v-p2", { scale: 1 }, { scale: 1.5, color: "#1d8a3c", duration: 0.18, ease: "back.out(3)" }, «sessanta»);
    pop(tl, "#v-ok", «sessanta» + 0.18);
    shake(tl, "#b27-cam", «sessanta» + 0.02, 10);''', '''
    #root { background: #14100d !important; }
    .st.dark { background: radial-gradient(closest-side at 50% 45%, #3a2a20 0%, #14100d 100%); }
    .wr { position: absolute; left: 60px; right: 60px; height: 122px; display: flex; align-items: center; justify-content: space-between; }
    .wr b { display: block; font: 600 50px/1.1 "SF Pro Display"; letter-spacing: -0.02em; }
    .wr small { display: block; font: 500 30px/1.2 "SF Pro Display"; color: #8a6f4d; margin-top: 6px; }
    .wr span { font: 700 60px/1 "SF Pro Display"; letter-spacing: -0.03em; display: inline-block; transform-origin: 100% 50%; }''',
    fx=[('swoosh', 'bottiglia', 0.0, 0.28), ('ding', 'trecento', -0.02, 0.3), ('thud', 'trecento', -0.02, 0.26), ('swoosh', 'serve', -0.3, 0.26), ('pop', 'serve', -0.1, 0.24), ('whoosh-short', 'serve', 0.3, 0.2), ('click', 'sessanta', -0.02, 0.4), ('register', 'sessanta', 0.02, 0.32), ('clink', 'sessanta', 0.18, 0.4), ('pop', 'sessanta', 0.18, 0.24)], ground='dark')

# ---------------------------------------------------------------- 28. "Negli abbonamenti, il piano Premium serve a vendere quello medio."
def plan(i, name, price, left):
    return f'<div class="pl" id="{i}" style="left:{left}px"><b>{name}</b><span>{price}<small> €</small></span><small>al mese</small></div>'
add('b28', 'abbonamenti', 'quindi', f'''      {small('a-a', 'negli', 300, 70, '#86868b')}
      {big('a-b', 'abbonamenti', 380, 140, INK)}
      {plan('a-1', 'Base', '9', 40)}{plan('a-2', 'Medio', '19', 374)}{plan('a-3', 'Premium', '49', 708)}
      <div class="chip" id="a-top" style="left:374px;top:720px;width:332px;text-align:center;background:{BLUE};font-size:44px;padding:16px 0">il più scelto</div>
      <svg viewBox="0 0 400 160" width="400" height="160" style="position:absolute;left:480px;top:1370px;overflow:visible" data-layout-allow-overlap><path id="a-ar" d="M380 10 C380 130 120 150 40 60 M40 60 l56 -6 M40 60 l8 56" fill="none" stroke="{INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>
      {small('a-e', 'esempio', 1520, 30, '#86868b')}''', cut('b28') + '''    tl.fromTo(".pl", { opacity: 0, y: 200 }, { opacity: 1, y: 0, duration: 0.34, ease: "back.out(1.5)", stagger: 0.08 }, 0.05);
    tl.to("#a-3", { y: -50, boxShadow: "0 40px 100px -30px rgba(201,162,39,0.6), 0 0 0 6px #c9a227", duration: 0.3, ease: "back.out(2)" }, «premium» - 0.08);
    draw(tl, "#a-ar", «premium» + 0.45, 0.4);
    tl.to("#a-3", { y: 0, opacity: 0.45, duration: 0.3 }, «medio» - 0.25);
    tl.to("#a-2", { y: -40, scale: 1.1, boxShadow: "0 40px 100px -30px rgba(0,113,227,0.5), 0 0 0 6px #0071e3", duration: 0.32, ease: "back.out(2.4)" }, «medio» - 0.2);
    pop(tl, "#a-top", «medio» - 0.02);''', f'''
    .pl {{ position: absolute; top: 800px; width: 332px; height: 540px; border-radius: 40px; background: #fff; box-shadow: 0 40px 100px -30px rgba(0,0,0,0.25), 0 0 0 2px #d2d2d7; text-align: center; padding-top: 70px; opacity: 0; }}
    .pl b {{ display: block; font: 600 50px/1 "SF Pro Display"; letter-spacing: -0.02em; color: #86868b; }}
    .pl span {{ display: block; font: 700 170px/1 "SF Pro Display"; letter-spacing: -0.05em; margin-top: 60px; }}
    .pl span small {{ font: 600 70px/1 "SF Pro Display"; }}
    .pl > small {{ display: block; font: 500 34px/1 "SF Pro Display"; color: #86868b; margin-top: 18px; }}''',
    fx=[('swipe', 'abbonamenti', -0.2, 0.24), ('pop', 'abbonamenti', 0.08, 0.18), ('pop', 'abbonamenti', 0.16, 0.18), ('pop', 'abbonamenti', 0.24, 0.18), ('sparkle', 'premium', -0.08, 0.18), ('swoosh', 'premium', 0.45, 0.26), ('thud', 'medio', -0.2, 0.3), ('ding', 'medio', 0.0, 0.28)], ground='grey')

# ================================================================ THE LESSON
# ---------------------------------------------------------------- 29. "Quindi, se vendi qualcosa, non abbassare il prezzo."
add('b29', 'quindi', 'mettigli', f'''      {small('l-a', 'se vendi qualcosa', 420, 80)}
      <div class="tagp" id="l-t" style="left:210px;top:620px"><i></i><b>il tuo prezzo</b></div>
      <svg viewBox="0 0 200 360" width="200" height="360" style="position:absolute;left:440px;top:860px;overflow:visible" data-layout-allow-overlap><path id="l-ar" d="M100 10 V330 M30 250 L100 336 L170 250" fill="none" stroke="{RED}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <svg viewBox="0 0 400 400" width="400" height="400" style="position:absolute;left:340px;top:840px;overflow:visible" data-layout-allow-overlap><path class="l-x" d="M30 30 L370 370" stroke="#fff" stroke-width="40" stroke-linecap="round" fill="none"/><path class="l-x" d="M370 30 L30 370" stroke="#fff" stroke-width="40" stroke-linecap="round" fill="none"/></svg>
      {big('l-b', 'non abbassarlo.', 1290, 132)}''', cut('b29') + '''    tl.fromTo("#l-t", { opacity: 0, scale: 0.5, rotation: -10 }, { opacity: 1, scale: 1, rotation: -3, duration: 0.32, ease: "back.out(2.2)" }, 0.3);
    draw(tl, "#l-ar", 0.9, 0.4);
    draw(tl, ".l-x", «nonabbassare» - 0.05, 0.2);
    tl.to("#l-ar", { opacity: 0.4, duration: 0.2 }, «nonabbassare»);
    shake(tl, "#b29-cam", «nonabbassare» + 0.02, 20);
    tl.fromTo("#l-b", { opacity: 0, filter: "blur(12px)", scale: 1.2 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.22, ease: "expo.out" }, «nonabbassare» + 0.1);''', f'''
    .tagp {{ position: absolute; display: flex; align-items: center; gap: 30px; padding: 34px 60px 34px 40px; border-radius: 36px; background: #f5f5f7; color: {INK}; opacity: 0; box-shadow: 0 40px 100px -30px rgba(0,0,0,0.8); white-space: nowrap; }}
    .tagp i {{ display: block; width: 44px; height: 44px; border-radius: 50%; background: #000; flex: none; }}
    .tagp b {{ font: 700 92px/1 "SF Pro Display"; letter-spacing: -0.04em; }}''',
    fx=[('swipe', 'quindi', -0.2, 0.24), ('key-press', 'quindi', 0.02, 0.14), ('pop', 'quindi', 0.3, 0.28), ('swoosh', 'quindi', 0.9, 0.26), ('thud', 'nonabbassare', 0.0, 0.4)], ground='dark')

# ---------------------------------------------------------------- 30. "Mettigli accanto un'opzione più cara."
add('b30', 'mettigli', 'nonserve', f'''      {small('j-a', 'mettigli accanto', 420, 80)}
      <div class="tagp" id="j-1" style="left:160px;top:640px"><i></i><b>il tuo prezzo</b></div>
      <div class="tagp big" id="j-2" style="left:90px;top:900px"><i></i><b>uno più caro</b></div>''', cut('b30') + '''    gsap.set("#j-1", { opacity: 1, rotation: -3 });
    tl.fromTo("#j-2", { opacity: 0, x: 1000, rotation: 14 }, { opacity: 1, x: 0, rotation: 4, duration: 0.4, ease: "back.out(1.4)" }, «cara» - 0.75);
    shake(tl, "#b30-cam", «cara» - 0.4, 20);
    tl.to("#j-1", { scale: 0.8, duration: 0.35, ease: "power2.out" }, «cara» - 0.35);
    tl.fromTo("#j-2", { scale: 1 }, { scale: 1.08, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, «cara» + 0.02);''', f'''
    .tagp {{ position: absolute; display: flex; align-items: center; gap: 30px; padding: 34px 60px 34px 40px; border-radius: 36px; background: #f5f5f7; color: {INK}; opacity: 0; box-shadow: 0 40px 100px -30px rgba(0,0,0,0.8); white-space: nowrap; }}
    .tagp i {{ display: block; width: 44px; height: 44px; border-radius: 50%; background: #000; flex: none; }}
    .tagp b {{ font: 700 92px/1 "SF Pro Display"; letter-spacing: -0.04em; }}
    .tagp.big {{ background: linear-gradient(135deg, #f6dc8c, #c9a227); padding: 46px 70px 46px 46px; }}
    .tagp.big b {{ font-size: 122px; }}''',
    fx=[('key-press', 'mettigli', 0.02, 0.14), ('whoosh', 'cara', -0.78, 0.28), ('boom', 'cara', -0.4, 0.4), ('register', 'cara', -0.34, 0.3), ('sparkle', 'cara', 0.02, 0.16)], ground='dark')

# ---------------------------------------------------------------- 31. "Non serve che la comprino. Serve che la vedano."
add('b31', 'nonserve', 'cta', f'''      {small('i-a', 'non serve che la', 470, 76)}
      <div id="i-b" style="position:absolute;left:0;right:0;top:560px;text-align:center" data-layout-allow-overlap><span style="position:relative;display:inline-block;font:700 170px/1.05 {SF};letter-spacing:-0.045em;color:#a1a1a6">comprino<svg viewBox="0 0 800 30" width="100%" height="30" preserveAspectRatio="none" style="position:absolute;left:0;top:54%;overflow:visible"><path id="i-x" d="M0 15 H800" stroke="{RED}" stroke-width="16" stroke-linecap="round" fill="none"/></svg></span></div>
      {small('i-c', 'serve che la', 880, 76)}
      {big('i-d', 'vedano.', 960, 260, YEL)}
      <svg id="i-eye" viewBox="0 0 300 160" width="360" height="192" style="position:absolute;left:360px;top:1290px;overflow:visible" data-layout-allow-overlap><path d="M10 80 Q150 -40 290 80 Q150 200 10 80 Z" fill="none" stroke="{YEL}" stroke-width="14" stroke-linejoin="round"/><circle cx="150" cy="80" r="40" fill="{YEL}"/></svg>''', cut('b31') + '''    draw(tl, "#i-x", 0.62, 0.22);
    tl.fromTo("#i-c", { opacity: 0 }, { opacity: 1, duration: 0.15 }, «serveche» - 0.06);
    tl.fromTo("#i-d", { opacity: 0, scale: 1.6, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }, «vedano» - 0.14);
    tl.fromTo("#i-eye", { opacity: 0, scaleY: 0, transformOrigin: "50% 50%" }, { opacity: 1, scaleY: 1, duration: 0.2, ease: "back.out(2)" }, «vedano» + 0.05);
    tl.to("#i-eye", { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1 }, «vedano» + 0.38);
    shake(tl, "#b31-cam", «vedano» - 0.1, 16);''',
    fx=[('key-press', 'nonserve', 0.02, 0.14), ('swoosh', 'nonserve', 0.62, 0.28), ('thud', 'nonserve', 0.8, 0.24), ('key-press', 'serveche', -0.06, 0.14), ('thud', 'vedano', -0.14, 0.34), ('pop', 'vedano', 0.05, 0.18), ('click-soft', 'vedano', 0.38, 0.3)], ground='dark', mq='vedano')

# ================================================================ CALL TO ACTION + LOOP
# ---------------------------------------------------------------- 32. "Se vuoi sapere come creo questi video, scrivi MOTION nei commenti e ti spiego tutto."
add('b32', 'cta', 'etutto', f'''      {zone(ln('y-a1', 'vuoi sapere come', 't mut'), ln('y-a2', 'creo questi video?', 'tb', 'font-size:104px', mt=-18))}
      {zone(ln('y-b1', 'scrivi', 't mut'))}
      <div id="y-m" class="split acc" style="position:absolute;left:0;right:0;top:486px;text-align:center;font:700 220px/1 {SF};letter-spacing:-0.045em">MOTION</div>
      <div id="y-bar" style="position:absolute;left:90px;top:850px;width:900px;height:140px;border-radius:70px;border:4px solid #d2d2d7;display:flex;align-items:center;padding:0 44px 0 24px;gap:26px">
        <div style="width:92px;height:92px;border-radius:50%;background:linear-gradient(#d1d1d6,#aeaeb2)"></div>
        <div id="y-t" class="split" style="flex:1;font:500 52px/1 {SF};letter-spacing:0.01em">MOTION</div>
        <div id="y-pub" style="font:600 46px/1 {SF};color:#0a84ff">Pubblica</div>
      </div>
      <div id="y-cur" class="cur" style="left:880px;top:940px">{CURSOR}</div>
      {zone(ln('y-c1', 'e ti spiego tutto', 'tb', 'font-size:100px'), top=1080)}''', cut('b32') + '''    rise(tl, "#y-a1", 0.03);
    rise(tl, "#y-a2", 0.42);
    sink(tl, "#y-a1", «scrivi» - 0.2); sink(tl, "#y-a2", «scrivi» - 0.2);
    rise(tl, "#y-b1", «scrivi» - 0.04);
    tl.fromTo("#y-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, «scrivi»);
    flip(tl, "#y-m", «motion» - 0.1, 0.045);
    typeIn(tl, "#y-t", «motion», 0.06);
    rise(tl, "#y-c1", «etispiego» - 0.04);
    tl.fromTo("#y-cur", { opacity: 0, x: 160, y: 200 }, { opacity: 1, x: 0, y: 0, duration: 0.3, ease: "power3.out" }, «etispiego» + 0.08);
    tl.to("#y-cur", { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1 }, «etispiego» + 0.46);
    tl.fromTo("#y-pub", { scale: 1 }, { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 }, «etispiego» + 0.48);''',
    fx=[('swipe', 'cta', -0.2, 0.24), ('key-press', 'cta', 0.03, 0.14), ('key-press', 'cta', 0.42, 0.14), ('whoosh-short', 'scrivi', -0.2, 0.22), ('pop', 'scrivi', 0.0, 0.2), ('typing', 'motion', -0.1, 0.22), ('typing', 'motion', 0.2, 0.2),
        ('key-press', 'etispiego', -0.04, 0.16), ('click', 'etispiego', 0.46, 0.42), ('pop', 'etispiego', 0.5, 0.26)])

# ---------------------------------------------------------------- 33. loop: "E tutto questo, solo perché..." -> "Apple ha appena fatto uscire..."
D33 = T['END'] - T['etutto']
add('b33', 'etutto', 'END', f'''      <div class="vid" id="e2-w" data-layout-allow-overlap style="transform-origin:50% 52%"><video id="e2-v" class="clip" src="assets/video/hero.mp4" data-start="0" data-duration="{D33:.2f}" data-media-start="{HT0 - D33:.3f}" muted playsinline></video></div>
      {small('e2-a', 'e tutto questo', 300, 80, '#f5f5f7')}
      {big('e2-b', 'solo perché…', 384, 150, '#fff', 'text-shadow:0 8px 40px rgba(0,0,0,0.5)')}''', f'''    tl.fromTo("#e2-w", {{ scale: {HZ0 + HRATE * D33:.3f} }}, {{ scale: {HZ0}, duration: DUR, ease: "none" }}, 0);
    tl.fromTo("#e2-a", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.15 }}, 0.04);
    tl.fromTo("#e2-b", {{ opacity: 0, filter: "blur(12px)", scale: 1.15 }}, {{ opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.24, ease: "expo.out" }}, «soloperche» - 0.14);
    tl.to("#e2-a, #e2-b", {{ opacity: 0, duration: 0.12 }}, DUR - 0.12);''', cam=False,
    fx=[('key-press', 'etutto', 0.04, 0.14), ('thud', 'soloperche', -0.14, 0.28), ('riser', 'soloperche', -0.4, 0.12)], ground='dark')
