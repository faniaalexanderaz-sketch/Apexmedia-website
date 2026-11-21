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
HOOK = dict(scale=0.8, ry=-30, rx=8, ang=105, y=70, ts=1.1)
HOOKTITLE = f'''<div id="@-eb" style="position:absolute;left:0;right:0;top:268px;text-align:center;font:600 46px/1 {SF};color:#b64400" data-layout-allow-overlap>Novità · appena uscito</div>
      <div id="@-t" style="position:absolute;left:0;right:0;top:334px;text-align:center;font:700 152px/1.05 {SF};letter-spacing:-0.045em;color:{INK};transform-origin:50% 50%" data-layout-allow-overlap>&#xF8FF; <span class="grad">iPhone Duo</span></div>'''
# ---------------------------------------------------------------- 1. "Apple ha appena fatto uscire..." (white, the 3D phone unfolding towards the camera, product-page title)
add('b01', 'start', 'uniphone', f'''      {HOOKTITLE.replace('@', 'h')}
      {duo('h-d', -160, 520, None)}''', f'''    gsap.set("#h-d", {{ scale: {HOOK['scale']}, y: {HOOK['y']} }}); gsap.set("#h-d-g", {{ rotationY: {HOOK['ry']}, rotationX: {HOOK['rx']} }}); duoSet("#h-d", {HOOK['ang']});
    gsap.set("#h-t", {{ scale: {HOOK['ts']} }});
    fold(tl, "#h-d", {HOOK['ang']}, 0, 0.04, 0.6, "power3.out");
    tl.to("#h-d", {{ scale: 0.7, y: 0, duration: 0.6, ease: "power3.out" }}, 0.04);
    tl.to("#h-d", {{ scale: 0.76, duration: DUR - 0.64, ease: "none" }}, 0.64);
    tl.to("#h-d-g", {{ rotationY: 14, rotationX: 3, duration: DUR, ease: "power2.out" }}, 0);
    tl.to("#h-t", {{ scale: 1, duration: 0.34, ease: "expo.out" }}, 0);
    tl.fromTo("#h-eb", {{ y: -14 }}, {{ y: 0, duration: 0.3, ease: "back.out(3)" }}, 0);
    shake(tl, "#b01-st", 0.3, 10);''', cam=False,
    fx=[('boom', 'start', 0.0, 0.5), ('whoosh', 'start', 0.0, 0.3), ('pop', 'start', 0.05, 0.3), ('hinge', 'start', 0.1, 0.4), ('ding', 'start', 0.5, 0.24)])

# ---------------------------------------------------------------- 2. "...un iPhone che si piega in due."
add('b02', 'uniphone', 'costa', f'''      {big('p-c', 'si piega <span class="grad">in due.</span>', 300, 150, INK)}
      {duo('d', -160, 640, None)}''', cut('b02') + '''    gsap.set("#d", { scale: 0.7 }); gsap.set("#d-g", { rotationY: -18, rotationX: 7 }); duoSet("#d", 180);
    fold(tl, "#d", 180, 0, 0.02, 0.4, "power3.out");
    fold(tl, "#d", 0, 180, «sipiega» - 0.06, 0.34, "power3.inOut");
    fold(tl, "#d", 180, 0, «sipiega» + 0.36, 0.42, "power3.out");
    tl.to("#d-g", { rotationY: 14, duration: DUR, ease: "none" }, 0);
    blurIn(tl, "#p-c", «sipiega» - 0.2, 0.24);''',
    fx=[('swipe', 'uniphone', -0.2, 0.26), ('hinge', 'uniphone', 0.3, 0.34), ('whoosh-short', 'sipiega', -0.08, 0.22), ('hinge', 'sipiega', 0.2, 0.36), ('hinge', 'sipiega', 0.7, 0.34), ('pop', 'sipiega', -0.2, 0.18)])

# ---------------------------------------------------------------- 3. "Costa 2.369 euro." (the Store buy page: price and storage options, all real prices)
BAG = '<svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="#1d1d1f" stroke-width="1.6" stroke-linejoin="round"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>'
STOREBAR = f'<div style="position:absolute;left:0;right:0;top:232px;height:86px;border-bottom:2px solid #e8e8ed"><div style="position:absolute;left:70px;top:14px;font:600 42px/1.2 {SF};letter-spacing:-0.01em">&#xF8FF; Store</div><div style="position:absolute;right:70px;top:14px">{BAG}</div></div>'
def opt(k, gb, price):
    return f'<div class="opt" style="top:{k * 132}px"><b>{gb}</b><span>Da {price} €</span></div>'
add('b03', 'costa', 'scommetto', f'''      {STOREBAR}
      <div id="s-h" class="wsplit" style="position:absolute;left:70px;top:350px;font:700 84px/1.05 {SF};letter-spacing:-0.03em">Acquista iPhone Duo</div>
      <div id="s-p" style="position:absolute;left:70px;top:452px;font:700 196px/1.05 {SF};letter-spacing:-0.045em;transform-origin:0 60%;white-space:nowrap" data-layout-allow-overlap><span style="font:600 56px/1 {SF};color:#86868b;letter-spacing:0">Da </span><span id="s-n">1.000</span> €</div>
      <div id="s-q" style="position:absolute;left:70px;right:70px;top:706px;font:600 42px/1.25 {SF};letter-spacing:-0.015em">Spazio di archiviazione. <span style="color:#86868b">Di quanto spazio hai bisogno?</span></div>
      <div style="position:absolute;left:70px;top:852px;width:940px;height:520px" data-layout-allow-overlap>
        {opt(0, '256 GB', '2.369')}{opt(1, '512 GB', '2.619')}{opt(2, '1 TB', '3.119')}{opt(3, '2 TB', '3.869')}
        <i id="s-sel" style="position:absolute;left:-3px;top:-3px;width:946px;height:124px;border-radius:29px;border:5px solid {BLUE};pointer-events:none"></i>
      </div>
      <div id="s-btn" style="position:absolute;left:70px;top:1400px;width:940px;height:110px;border-radius:55px;background:{BLUE};color:#fff;font:600 46px/110px {SF};text-align:center">Aggiungi al sacchetto</div>''', '''    wordsIn(tl, "#s-h", 0.04, 0.07);
    count(tl, "#s-n", 1000, 2369, «prezzo» - 0.1, 0.95, eur, "power2.out");
    tl.fromTo("#s-p", { scale: 0.86 }, { scale: 1, duration: 0.9, ease: "power2.out" }, «prezzo» - 0.1);
    tl.fromTo("#s-p", { scale: 1.14 }, { scale: 1, duration: 0.45, ease: "elastic.out(1.1, 0.4)", immediateRender: false }, «prezzo» + 0.87);
    shake(tl, "#b03-cam", «prezzo» + 0.87, 14);
    tl.fromTo("#s-q", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.2);
    tl.fromTo(".opt", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(1.6)", stagger: 0.07 }, 0.3);
    tl.fromTo("#s-sel", { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.2 }, 0.62);
    tl.fromTo("#s-btn", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(1.8)" }, 0.7);
    tl.fromTo("#s-btn", { scale: 1 }, { scale: 1.05, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, «prezzo» + 1.2);''', f'''
    .opt {{ position: absolute; left: 0; width: 940px; height: 118px; border-radius: 26px; border: 2px solid #d2d2d7; display: flex; align-items: center; justify-content: space-between; padding: 0 44px; background: #fff; opacity: 0; }}
    .opt b {{ font: 600 50px/1 "SF Pro Display"; letter-spacing: -0.02em; }}
    .opt span {{ font: 400 40px/1 "SF Pro Display"; color: #1d1d1f; }}''',
    fx=[('key-press', 'costa', 0.04, 0.14), ('key-press', 'costa', 0.18, 0.12), ('pop', 'costa', 0.3, 0.16), ('pop', 'costa', 0.37, 0.16), ('pop', 'costa', 0.44, 0.16), ('pop', 'costa', 0.51, 0.16), ('click-soft', 'costa', 0.62, 0.3),
        ('counter', 'prezzo', -0.1, 0.3), ('ding', 'prezzo', 0.87, 0.22), ('impact-bass-1', 'prezzo', 0.87, 0.14), ('click-soft', 'prezzo', 1.2, 0.3)])

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

# ---------------------------------------------------------------- 8. "...lo stai subendo anche tu." (a Face ID scan that recognises the viewer)
FACE = ('<svg id="u-face" viewBox="0 0 200 200" width="330" height="330" style="position:absolute;left:375px;top:560px;overflow:visible" fill="none" stroke="#0071e3" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" data-layout-allow-overlap>'
        '<path d="M10 60 V32 Q10 10 32 10 H60"/><path d="M140 10 H168 Q190 10 190 32 V60"/><path d="M190 140 V168 Q190 190 168 190 H140"/><path d="M60 190 H32 Q10 190 10 168 V140"/>'
        '<path d="M66 72 V92"/><path d="M134 72 V92"/><path d="M102 72 V108 Q102 118 90 118"/><path d="M66 138 Q100 164 134 138"/></svg>')
add('b08', 'trucco', 'puoi', f'''      {small('u-a', 'questo trucco', 300, 76, '#86868b')}
      {big('u-b', 'lo stai subendo', 386, 118, INK)}
      {FACE}
      <i id="u-scan" style="position:absolute;left:345px;top:560px;width:390px;height:12px;border-radius:6px;background:linear-gradient(90deg, rgba(0,113,227,0), #0071e3, rgba(0,113,227,0));opacity:0" data-layout-allow-overlap></i>
      {big('u-c', 'anche tu.', 990, 236, INK)}
      {small('u-d', 'Face ID · riconosciuto', 1270, 44, GREEN)}''', '''    tl.fromTo("#u-face", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2.2)" }, 0.04);
    tl.fromTo("#u-scan", { opacity: 0, y: 0 }, { opacity: 1, y: 330, duration: 0.42, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0.3);
    tl.to("#u-scan", { opacity: 0, duration: 0.1 }, 1.14);
    tl.fromTo("#u-b", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, «subendo» - 0.12);
    tl.fromTo("#u-c", { opacity: 0, scale: 1.6, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }, «anchetu» - 0.06);
    tl.to("#u-face", { stroke: "#1d8a3c", scale: 1.12, duration: 0.16, ease: "back.out(3)" }, «anchetu» - 0.02);
    tl.fromTo("#u-d", { opacity: 0 }, { opacity: 1, duration: 0.15 }, «anchetu» + 0.1);
    shake(tl, "#b08-cam", «anchetu» + 0.02, 16);''', mq='anche tu',
    fx=[('pop', 'trucco', 0.04, 0.22), ('typing', 'trucco', 0.3, 0.18), ('key-press', 'subendo', -0.12, 0.14), ('thud', 'anchetu', -0.06, 0.34), ('ding', 'anchetu', 0.0, 0.26)])

# ---------------------------------------------------------------- 9. "E puoi usarlo per vendere di più." (a dark home-screen widget with a rising line)
LINE = 'M0 380 L90 360 L170 372 L260 320 L340 332 L430 262 L520 276 L610 190 L700 204 L790 110 L900 60'
add('b09', 'puoi', 'domanda', f'''      {small('g-a', 'e puoi usarlo per', 300, 70, '#86868b')}
      {big('g-b', 'vendere di più.', 386, 150, GREEN)}
      <div id="g-w" style="position:absolute;left:90px;top:690px;width:900px;height:700px;border-radius:64px;background:#1c1c1e;overflow:hidden;box-shadow:0 50px 120px -30px rgba(0,0,0,0.5)" data-layout-allow-overlap>
        <div style="position:absolute;left:56px;top:52px;font:700 56px/1 {SF};color:#fff">Vendite</div>
        <div style="position:absolute;left:56px;top:122px;font:500 38px/1 {SF};color:#8e8e93">questo mese</div>
        <div id="g-up" style="position:absolute;right:56px;top:56px;padding:12px 26px;border-radius:14px;background:#30d158;color:#fff;font:700 44px/1 {SF};opacity:0">in salita</div>
        <svg viewBox="0 0 900 460" width="900" height="460" style="position:absolute;left:0;top:240px"><defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#30d158" stop-opacity="0.45"/><stop offset="1" stop-color="#30d158" stop-opacity="0"/></linearGradient><clipPath id="gc"><rect id="g-clip" x="0" y="0" width="900" height="460"/></clipPath></defs>
          <g clip-path="url(#gc)"><path d="{LINE} V460 H0 Z" fill="url(#gg)"/><path d="{LINE}" fill="none" stroke="#30d158" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></g></svg>
      </div>''', '''    tl.fromTo("#g-w", { y: 900, rotation: 6 }, { y: 0, rotation: 0, duration: 0.42, ease: "back.out(1.4)" }, 0.02);
    tl.fromTo("#g-clip", { attr: { width: 0 } }, { attr: { width: 900 }, duration: 0.95, ease: "power2.inOut" }, 0.25);
    tl.fromTo("#g-b", { opacity: 0, scale: 1.3, filter: "blur(12px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }, «vendere» - 0.1);
    tl.fromTo("#g-up", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2.6)" }, «dipiu» - 0.02);''',
    fx=[('pop', 'puoi', 0.04, 0.2), ('swoosh', 'puoi', 0.25, 0.24), ('thud', 'vendere', -0.1, 0.26), ('register', 'dipiu', 0.0, 0.34)])

# ================================================================ THE DEMONSTRATION
# ---------------------------------------------------------------- 10. "Ti faccio una domanda." (a Messages conversation)
MSGHEAD = (f'<div class="imh" data-layout-allow-overlap><div style="position:absolute;left:44px;top:34px;font:500 76px/1 {SF};color:#0a84ff">‹</div>'
           f'<div style="display:inline-block;margin-top:14px;width:84px;height:84px;border-radius:50%;background:linear-gradient(#c7c7cc,#8e8e93);color:#fff;font:600 40px/84px {SF}">A</div>'
           f'<div style="font:500 30px/1.2 {SF};color:#1d1d1f;margin-top:6px">Apex Media ›</div></div>'
           f'<div style="position:absolute;left:56px;top:1470px;width:84px;height:84px;border-radius:50%;background:#e9e9eb;color:#8e8e93;font:400 70px/78px {SF};text-align:center" data-layout-allow-overlap>+</div>'
           f'<div style="position:absolute;left:164px;top:1470px;width:860px;height:84px;border-radius:42px;border:2px solid #d1d1d6;font:400 40px/80px {SF};color:#c7c7cc;padding-left:34px;box-sizing:border-box" data-layout-allow-overlap>iMessage</div>')
MSGCSS = '''
    .imh { position: absolute; left: 0; right: 0; top: 232px; height: 172px; border-bottom: 2px solid #e8e8ed; text-align: center; }
    .bub { position: absolute; max-width: 800px; padding: 32px 46px; border-radius: 58px; font: 500 64px/1.2 "SF Pro Display"; letter-spacing: -0.012em; opacity: 0; }
    .bub.in { left: 56px; background: #e9e9eb; color: #000; border-bottom-left-radius: 16px; transform-origin: 0% 100%; }
    .bub.me { right: 56px; background: #0a84ff; color: #fff; border-bottom-right-radius: 16px; transform-origin: 100% 100%; }
    .dots i { display: inline-block; width: 30px; height: 30px; border-radius: 50%; background: #8e8e93; margin: 0 7px; }'''
add('b10', 'domanda', 'mille', f'''      {MSGHEAD}
      <div class="bub in" id="q-1" style="top:520px;font-size:112px;font-weight:600;max-width:900px;padding:44px 56px;border-radius:72px;border-bottom-left-radius:18px">Ti faccio una domanda.</div>
      <div class="bub in dots" id="q-2" style="top:900px;padding:42px 46px"><i></i><i></i><i></i></div>''', '''    tl.fromTo("#q-1", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, 0.03);
    tl.fromTo("#q-2", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.26, ease: "back.out(2)" }, 0.5);
    tl.fromTo("#q-2 i", { y: 0, opacity: 0.4 }, { y: -14, opacity: 1, duration: 0.16, yoyo: true, repeat: 3, stagger: 0.09, ease: "sine.inOut" }, 0.56);''', MSGCSS,
    fx=[('pop', 'domanda', 0.03, 0.3), ('ping', 'domanda', 0.05, 0.16), ('typing', 'domanda', 0.56, 0.2)])

# ---------------------------------------------------------------- 11. "1.639 euro per un telefono, sono tanti?" (the Pro Max turning on white, the question as a message)
add('b11', 'mille', 'tantissimi', f'''      <div class="vid" id="m-w" data-layout-allow-overlap style="transform-origin:50% 60%;-webkit-mask-image:linear-gradient(to bottom, transparent 0, #000 9%);mask-image:linear-gradient(to bottom, transparent 0, #000 9%)"><video id="m-v" class="clip" src="assets/video/w-pro.mp4" data-start="0" data-duration="{T['tantissimi'] - T['mille']:.2f}" data-media-start="0" muted playsinline></video></div>
      <div id="m-p" style="position:absolute;left:0;right:0;top:250px;text-align:center;font:700 210px/1.05 {SF};letter-spacing:-0.05em;color:{INK}" data-layout-allow-overlap><span id="m-n">900</span><span style="font-weight:600;font-size:140px"> €</span></div>
      <div class="bub in" id="m-q" style="top:1400px;font-size:96px;font-weight:600">Sono tanti?</div>''', '''    tl.fromTo("#m-w", { scale: 1.1, y: 170 }, { scale: 1.0, y: 170, duration: DUR, ease: "none" }, 0);
    count(tl, "#m-n", 900, 1639, 0.0, 0.8, eur, "power2.out");
    punch(tl, "#m-p", 0.8, 1.14);
    tl.fromTo("#m-q", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2.2)" }, «tanti» - 0.12);''', MSGCSS, cam=False,
    fx=[('counter', 'mille', 0.0, 0.3), ('ding', 'mille', 0.8, 0.26), ('pop', 'tanti', -0.12, 0.3), ('ping', 'tanti', -0.1, 0.16)])

# ---------------------------------------------------------------- 12. "Tantissimi." (the answer as a blue bubble)
add('b12', 'tantissimi', 'promax', f'''      {MSGHEAD}
      <div class="bub in" style="top:470px;opacity:1;font-size:60px">Sono tanti?</div>
      <div class="bub me" id="s-b" style="top:690px;font:700 150px/1.1 {SF};letter-spacing:-0.04em;padding:40px 60px;border-radius:80px;border-bottom-right-radius:20px">Tantissimi.</div>
      <div id="s-c" style="position:absolute;right:70px;top:960px;font:500 34px/1 {SF};color:#8e8e93;opacity:0">Consegnato</div>''', '''    tl.fromTo("#s-b", { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.26, ease: "back.out(2.2)" }, 0.0);
    shake(tl, "#b12-cam", 0.1, 22);
    tl.fromTo("#s-c", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.36);''', MSGCSS, mq='1.639 €',
    fx=[('thud', 'tantissimi', 0.02, 0.36), ('pop', 'tantissimi', 0.0, 0.3), ('swoosh', 'tantissimi', 0.0, 0.22)])

# ---------------------------------------------------------------- 13. "È il nuovo Pro Max..." (product-page hero with the colour picker)
SW = [('#2b2b2d', 'Nero'), ('#e3e4e5', 'Argento'), ('#c8dbe6', 'Ghiacciaio'), ('#7a0f24', 'Borgogna')]
swatches = ''.join(f'<i class="sw" style="background:{c}"></i>' for c, n in SW)
add('b13', 'promax', 'centocinq', f'''      <div class="eyebrow" id="x-e" style="top:284px;opacity:1">Novità</div>
      {big('x-b', 'iPhone 18 Pro Max', 334, 108, INK)}
      <img id="x-i" class="mul" src="assets/img/ip18-burg-pair.png" style="position:absolute;left:240px;top:452px;width:600px;height:1072px;transform-origin:50% 30%;filter:brightness(1.06) contrast(1.03)" alt="" />
      <div id="x-sw" style="position:absolute;left:0;right:0;top:1580px;display:flex;justify-content:center;align-items:center;gap:26px" data-layout-allow-overlap>{swatches}<i id="x-ring"></i><span style="font:600 44px/1 {SF};color:{BURG};margin-left:14px">Borgogna</span></div>''', '''    tl.fromTo("#x-b", { opacity: 0, filter: "blur(14px)", scale: 1.15 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.24, ease: "expo.out" }, 0.04);
    tl.fromTo("#x-i", { y: 260, scale: 0.86, rotation: 4 }, { y: 0, scale: 1, rotation: 0, duration: 0.5, ease: "expo.out" }, 0.02);
    tl.to("#x-i", { scale: 1.05, duration: DUR - 0.5, ease: "none" }, 0.5);
    tl.fromTo(".sw", { scale: 0 }, { scale: 1, duration: 0.2, ease: "back.out(3)", stagger: 0.05 }, 0.2);
    tl.fromTo("#x-ring", { opacity: 0, x: -3 * 86 }, { opacity: 1, x: 0, duration: 0.3, ease: "back.out(1.6)" }, 0.5);''', f'''
    .mul {{ mix-blend-mode: multiply; }}
    .sw {{ display: block; width: 60px; height: 60px; border-radius: 50%; box-shadow: inset 0 0 0 2px rgba(0,0,0,0.12); }}
    #x-ring {{ display: block; width: 82px; height: 82px; border-radius: 50%; border: 5px solid {BLUE}; margin-left: -102px; opacity: 0; flex: none; }}''',
    fx=[('key-press', 'promax', 0.04, 0.16), ('pop', 'promax', 0.2, 0.16), ('pop', 'promax', 0.3, 0.16), ('click-soft', 'promax', 0.5, 0.3)])

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
add('b15', 'adesso', 'glimetto', f'''      {small('o-a', 'adesso', 640, 84, '#86868b')}
      {big('o-b', 'guarda.', 730, 270, INK)}''', '''    tl.fromTo("#o-b", { scale: 1.5, filter: "blur(12px)" }, { scale: 1, filter: "blur(0px)", duration: 0.2, ease: "expo.out" }, 0.28);''', mq='guarda',
    fx=[('thud', 'adesso', 0.28, 0.3)])

# ---------------------------------------------------------------- 16. "Gli metto vicino il Duo. E quei 1.600, di colpo, sembrano quasi un affare."
add('b16', 'glimetto', 'settecento', f'''      <div class="pc" id="c-l" style="left:40px">
        <div class="pi"><img class="mul" src="assets/img/ip18-burg-a.png" style="height:640px;margin-top:-10px;filter:brightness(1.06) contrast(1.03)" alt="" /></div>
        <div class="pn">iPhone 18 Pro Max</div>
        <div class="pp" id="c-lp">1.639 €</div>
        <div id="c-st">affare?</div>
      </div>
      <div class="pc" id="c-r" style="left:560px">
        <div class="pi" style="position:relative">{duo('c-d', -460, -203, None, shadow=False)}</div>
        <div class="pn">iPhone Duo</div>
        <div class="pp" id="c-rp"><span id="c-rn">1.639</span> €</div>
      </div>''', cut('b16') + '''    gsap.set("#c-l", { x: 260 });
    gsap.set("#c-d", { scale: 0.34 }); gsap.set("#c-d-g", { rotationY: -26, rotationX: 6 }); duoSet("#c-d", 74);
    tl.to("#c-d-g", { rotationY: 22, duration: DUR, ease: "none" }, 0);
    fold(tl, "#c-d", 74, 36, «dicolpo» - 0.05, 0.5, "back.out(2)");
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

# ---------------------------------------------------------------- 17. "730 euro in meno." (the Calculator app does the subtraction)
KEYS = [('7', 'n'), ('8', 'n'), ('9', 'n'), ('×', 'o'), ('4', 'n'), ('5', 'n'), ('6', 'n'), ('−', 'o'), ('1', 'n'), ('2', 'n'), ('3', 'n'), ('+', 'o'), ('0', 'n w'), (',', 'n'), ('=', 'o')]
keys = ''.join(f'<i class="ck {c}"' + (' id="d-minus"' if t == '−' else ' id="d-eq"' if t == '=' else '') + f'>{t}</i>' for t, c in KEYS)
add('b17', 'settecento', 'stesso', f'''      <div id="d-ex" class="split" style="position:absolute;right:88px;top:330px;font:400 76px/1 {SF};color:#8e8e93">2.369 − 1.639</div>
      <div id="d-p" style="position:absolute;right:76px;top:410px;font:400 320px/1 {SF};letter-spacing:-0.04em;color:#fff;transform-origin:100% 60%"><span id="d-n">2.369</span></div>
      <div class="chip" id="d-s" style="left:88px;top:560px;background:#30d158;color:#fff;font-size:60px;padding:22px 44px">in meno</div>
      <div id="d-k" style="position:absolute;left:88px;top:800px;width:904px;display:grid;grid-template-columns:repeat(4, 205px);gap:28px" data-layout-allow-overlap>{keys}</div>''', '''    typeIn(tl, "#d-ex", 0.02, 0.025);
    tl.fromTo("#d-k", { y: 300, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "expo.out" }, 0);
    tl.to("#d-minus", { backgroundColor: "#fff", color: "#ff9f0a", scale: 0.9, duration: 0.07, yoyo: true, repeat: 1 }, 0.14);
    tl.to("#d-eq", { backgroundColor: "#fff", color: "#ff9f0a", scale: 0.9, duration: 0.07, yoyo: true, repeat: 1 }, 0.4);
    count(tl, "#d-n", 2369, 730, 0.44, 0.4, eur, "power3.out");
    tl.to("#d-n", { color: "#30d158", duration: 0.15 }, 0.8);
    punch(tl, "#d-p", 0.84, 1.14);
    tl.fromTo("#d-s", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2.4)" }, «inmeno» - 0.1);''', '''
    .ck { display: block; height: 205px; border-radius: 103px; background: #333; color: #fff; font: 400 96px/205px "SF Pro Display"; text-align: center; font-style: normal; }
    .ck.o { background: #ff9f0a; font-size: 110px; }
    .ck.w { grid-column: span 2; text-align: left; padding-left: 78px; }''',
    fx=[('typing', 'settecento', 0.02, 0.18), ('click', 'settecento', 0.14, 0.4), ('click', 'settecento', 0.4, 0.4), ('counter', 'settecento', 0.44, 0.26), ('ding', 'settecento', 0.84, 0.3), ('pop', 'inmeno', -0.1, 0.26)], ground='dark')

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
        {duo('f-d', -465, -148, None, shadow=False)}
      </div>''', cut('b19') + '''    tl.fromTo("#f-b", { opacity: 0, filter: "blur(12px)", scale: 1.15 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.24, ease: "expo.out" }, «accanto» - 0.9);
    tl.to("#f-q", { opacity: 0, scale: 0.4, duration: 0.14 }, «accanto» - 0.5);
    gsap.set("#f-d-g", { rotationY: -24, rotationX: 6 }); duoSet("#f-d", 70);
    tl.fromTo("#f-d", { opacity: 0, scale: 0.15, rotation: 10 }, { opacity: 1, scale: 0.32, rotation: 0, duration: 0.36, ease: "back.out(2.2)" }, «accanto» - 0.46);
    tl.to("#f-d-g", { rotationY: 20, duration: DUR, ease: "none" }, 0);
    fold(tl, "#f-d", 70, 30, «accanto» - 0.1, 0.4, "back.out(2)");
    tl.to("#f-slot", { borderColor: "#c9a227", boxShadow: "0 0 80px 10px rgba(201,162,39,0.45)", duration: 0.3 }, «accanto» - 0.4);
    tl.fromTo("#f-slot", { scale: 1 }, { scale: 1.06, duration: 0.16, yoyo: true, repeat: 1, immediateRender: false }, «accanto» - 0.1);''', '''
    .mul { mix-blend-mode: multiply; }''',
    fx=[('swipe', 'cambiato', -0.2, 0.24), ('key-press', 'cambiato', 0.02, 0.14), ('pop', 'accanto', -0.46, 0.32), ('sparkle', 'accanto', -0.36, 0.18), ('ping', 'accanto', -0.1, 0.16)])

# ================================================================ THE NAME
# ---------------------------------------------------------------- 20. "Si chiama effetto àncora." (a Dictionary look-up card)
add('b20', 'sichiama', 'ilprimo', f'''      {small('k-a', 'si chiama', 300, 70, '#86868b')}
      <div id="k-card" class="card" style="left:80px;top:420px;width:920px;height:760px;border-radius:56px;padding:60px 64px" data-layout-allow-overlap>
        <div style="font:600 30px/1 {SF};letter-spacing:0.16em;color:#86868b">DIZIONARIO</div>
        <div style="margin-top:34px"><span class="split" id="k-cw" style="font:700 118px/1.05 {SF};letter-spacing:-0.04em;display:inline-block">effetto àncora</span></div>
        <div style="font:500 40px/1.2 {SF};color:#86868b;margin-top:14px">ef·fèt·to àn·co·ra · s. m. · psicologia</div>
        <div style="height:2px;background:#e5e5ea;margin:36px 0"></div>
        <div id="k-def" class="wsplit" style="font:500 54px/1.3 {SF};letter-spacing:-0.015em">Il primo prezzo che vedi diventa il metro con cui giudichi tutti gli altri.</div>
        <div style="position:absolute;left:64px;bottom:50px;font:500 30px/1 {SF};color:#86868b">Tversky e Kahneman, 1974</div>
      </div>
      <svg id="k-an" viewBox="0 0 200 260" width="230" height="300" style="position:absolute;left:425px;top:1210px;overflow:visible" fill="none" stroke="{BLUE}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" data-layout-allow-overlap>
        <circle cx="100" cy="34" r="22"/><path d="M100 56 V230"/><path d="M62 98 H138"/><path d="M26 150 C26 208 68 234 100 234 C132 234 174 208 174 150"/><path d="M26 150 L10 178 M26 150 L52 166 M174 150 L190 178 M174 150 L148 166"/></svg>''', '''    tl.fromTo("#k-card", { y: 900, rotation: -4 }, { y: 0, rotation: 0, duration: 0.42, ease: "back.out(1.3)" }, 0);
    flip(tl, "#k-cw", «effetto» - 0.22, 0.028);
    wordsIn(tl, "#k-def", «effetto» + 0.02, 0.04);
    tl.fromTo("#k-an", { y: -1700, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.in" }, «ancora» - 0.34);
    tl.to("#k-an", { y: -40, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 }, «ancora» + 0.06);
    shake(tl, "#b20-cam", «ancora» + 0.06, 20);''',
    fx=[('swoosh', 'sichiama', 0.0, 0.24), ('typing', 'effetto', -0.22, 0.2), ('anchor', 'ancora', -0.42, 0.5), ('thud', 'ancora', 0.06, 0.4), ('key-press', 'effetto', 0.02, 0.12)], ground='grey')

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

# ---------------------------------------------------------------- 22-23. "Per questo il Duo non deve vendere. Deve solo stare lì..." (the 3D phone turning on a white pedestal)
add('b22', 'perquesto', 'normale0', f'''      {small('w-a', 'per questo il Duo', 300, 76, '#86868b')}
      {big('w-b', '<span style="color:#d70015">non</span> deve vendere.', 386, 110, INK)}
      {big('w-c', 'deve solo stare lì.', 340, 128, INK, 'opacity:0')}
      <div id="w-spot" style="position:absolute;left:140px;top:520px;width:800px;height:900px;background:linear-gradient(180deg, rgba(255,204,0,0), rgba(255,204,0,0.2));clip-path:polygon(44% 0, 56% 0, 100% 100%, 0 100%);filter:blur(8px);opacity:0" data-layout-allow-overlap></div>
      <div id="w-ped" style="position:absolute;left:240px;top:1300px;width:600px;height:360px;-webkit-mask-image:linear-gradient(to bottom, #000 45%, transparent 100%);mask-image:linear-gradient(to bottom, #000 45%, transparent 100%)" data-layout-allow-overlap>
        <i style="position:absolute;left:0;top:60px;width:600px;height:300px;background:linear-gradient(90deg,#d6d6db,#f8f8fa 42%,#dfdfe4)"></i>
        <i style="position:absolute;left:0;top:0;width:600px;height:120px;border-radius:50%;background:#f4f4f6;box-shadow:inset 0 0 0 2px #d2d2d7"></i>
      </div>
      {duo('d3', -160, 560, None, shadow=False)}''', '''    gsap.set("#d3", { scale: 0.5 }); gsap.set("#d3-g", { rotationX: 6 }); duoSet("#d3", 78);
    tl.fromTo("#d3-g", { rotationY: -50 }, { rotationY: 50, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#d3", { y: -900 }, { y: 0, duration: 0.5, ease: "bounce.out" }, 0.05);
    tl.fromTo("#w-ped", { y: 500 }, { y: 0, duration: 0.4, ease: "expo.out" }, 0);
    tl.fromTo("#w-b", { opacity: 0, filter: "blur(12px)", scale: 1.15 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.24, ease: "expo.out" }, «nondeve» - 0.12);
    blurOut(tl, "#w-a, #w-b", «devesolo» - 0.16, 0.14);
    tl.fromTo("#w-c", { opacity: 0, filter: "blur(12px)", scale: 1.15 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.24, ease: "expo.out" }, «devesolo» - 0.02);
    tl.fromTo("#w-spot", { opacity: 0 }, { opacity: 1, duration: 0.3 }, «devesolo»);
    fold(tl, "#d3", 78, 30, «devesolo», 0.5, "back.out(2)");''', mq='in vetrina',
    fx=[('thud', 'perquesto', 0.42, 0.34), ('key-press', 'perquesto', 0.05, 0.14), ('thud', 'nondeve', -0.12, 0.3), ('whoosh-short', 'devesolo', -0.16, 0.2), ('sparkle', 'devesolo', 0.0, 0.2), ('hinge', 'devesolo', 0.3, 0.3)])

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
# ---------------------------------------------------------------- 25. "E una volta che lo noti, lo vedi ovunque." (notification banners piling up)
def banner(i, top, where):
    return f'<div class="nb" id="{i}" style="top:{top}px"><small>prezzo àncora · adesso</small><b>{where}</b></div>'
add('b25', 'euna', 'ristorante', f'''      {banner('o-1', 330, 'Al ristorante')}{banner('o-2', 530, 'Negli abbonamenti')}{banner('o-3', 730, 'In negozio')}
      {big('o-t', 'ovunque.', 1010, 240, INK)}''', '''    tl.fromTo(".nb", { opacity: 0, y: -260, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.6)", stagger: 0.16 }, 0.02);
    tl.fromTo("#o-t", { opacity: 0, scale: 1.6, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.22, ease: "expo.out" }, «ovunque» - 0.05);
    shake(tl, "#b25-cam", «ovunque» + 0.02, 16);''', '''
    .nb { position: absolute; left: 70px; width: 940px; height: 170px; border-radius: 46px; background: rgba(255,255,255,0.92); box-shadow: 0 30px 80px -30px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.04); padding: 32px 46px; opacity: 0; }
    .nb small { display: block; font: 600 28px/1 "SF Pro Display"; letter-spacing: 0.08em; text-transform: uppercase; color: #86868b; }
    .nb b { display: block; font: 600 58px/1.1 "SF Pro Display"; letter-spacing: -0.02em; margin-top: 12px; }''',
    fx=[('ping', 'euna', 0.02, 0.2), ('ping', 'euna', 0.18, 0.18), ('ping', 'euna', 0.34, 0.18), ('thud', 'ovunque', -0.05, 0.32)], ground='grey')

# ---------------------------------------------------------------- 26-27. "Al ristorante, la bottiglia da 300 euro serve a vendere quella da sessanta." (the wine list as a Notes page)
def wrow(k, name, desc, price):
    return f'<div class="wr" id="v-r{k}" style="top:{(k - 1) * 158}px"><div><b>{name}</b><small>{desc}</small></div><span id="v-p{k}">{price} €</span></div>'
add('b27', 'ristorante', 'abbonamenti', f'''      <div style="position:absolute;left:56px;top:246px;font:500 50px/1 {SF};color:#d39b00">‹ Note</div>
      <div style="position:absolute;right:60px;top:240px;display:flex;gap:22px"><i style="display:block;width:64px;height:64px;border-radius:50%;border:4px solid #d39b00"></i><i style="display:block;width:64px;height:64px;border-radius:50%;border:4px solid #d39b00"></i></div>
      <div id="v-t" style="position:absolute;left:70px;top:340px;font:700 108px/1.05 {SF};letter-spacing:-0.035em">Carta dei vini</div>
      <div style="position:absolute;left:70px;top:468px;font:500 40px/1 {SF};color:#86868b">al ristorante · esempio</div>
      <div id="v-list" style="position:absolute;left:70px;top:590px;width:940px;height:640px" data-layout-allow-overlap>
        <i id="v-hl" style="position:absolute;left:-30px;top:-10px;width:1000px;height:150px;border-radius:30px;border:5px solid #d39b00;background:rgba(255,204,0,0.16);opacity:0"></i>
        {wrow(1, 'Barolo Riserva 2010', 'in cima alla carta', '300')}{wrow(2, 'Barbaresco 2019', 'rosso, 75 cl', '60')}{wrow(3, 'Nebbiolo 2021', 'rosso, 75 cl', '38')}{wrow(4, 'Dolcetto 2022', 'rosso, 75 cl', '24')}
        <svg viewBox="0 0 940 20" width="940" height="20" style="position:absolute;left:0;top:50px;overflow:visible"><path id="v-xx" d="M0 10 H940" stroke="#86868b" stroke-width="7" stroke-linecap="round" fill="none"/></svg>
        <div class="chip" id="v-no" style="left:560px;top:34px;font-size:34px;padding:12px 24px">non si vende</div>
        <div class="chip" id="v-ok" style="left:560px;top:182px;width:84px;height:84px;padding:0;background:{GREEN};font-size:48px;line-height:84px;text-align:center">✓</div>
      </div>
      <div id="v-cur" class="cur" style="left:790px;top:820px">{CURSOR}</div>''', '''    tl.fromTo("#v-t", { opacity: 0, filter: "blur(12px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2 }, 0.03);
    tl.fromTo(".wr", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.24, ease: "power2.out", stagger: 0.05 }, 0.12);
    tl.fromTo("#v-hl", { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.2 }, «bottiglia» - 0.05);
    tl.fromTo("#v-p1", { scale: 1 }, { scale: 1.6, color: "#b8860b", duration: 0.18, ease: "back.out(3)" }, «trecento» - 0.02);
    tl.to("#v-p1", { scale: 1.15, duration: 0.25 }, «trecento» + 0.35);
    draw(tl, "#v-xx", «serve» - 0.3, 0.28);
    pop(tl, "#v-no", «serve» - 0.1);
    tl.to("#v-r1", { opacity: 0.45, duration: 0.25 }, «serve» - 0.1);
    tl.to("#v-hl", { y: 158, borderColor: "#1d8a3c", backgroundColor: "rgba(29,138,60,0.12)", duration: 0.28, ease: "back.out(1.6)" }, «serve» + 0.3);
    tl.to("#v-no", { opacity: 0, duration: 0.15 }, «serve» + 0.3);
    tl.fromTo("#v-cur", { opacity: 0, x: 200, y: 300 }, { opacity: 1, x: 0, y: 0, duration: 0.3, ease: "power3.out" }, «sessanta» - 0.4);
    tl.to("#v-cur", { scale: 0.8, duration: 0.06, yoyo: true, repeat: 1 }, «sessanta» - 0.02);
    tl.fromTo("#v-p2", { scale: 1 }, { scale: 1.55, color: "#1d8a3c", duration: 0.18, ease: "back.out(3)" }, «sessanta»);
    pop(tl, "#v-ok", «sessanta» + 0.18);
    shake(tl, "#b27-cam", «sessanta» + 0.02, 10);''', '''
    .wr { position: absolute; left: 0; right: 0; height: 130px; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e5e5ea; opacity: 0; }
    .wr b { display: block; font: 600 54px/1.1 "SF Pro Display"; letter-spacing: -0.02em; }
    .wr small { display: block; font: 500 32px/1.2 "SF Pro Display"; color: #86868b; margin-top: 6px; }
    .wr span { font: 700 66px/1 "SF Pro Display"; letter-spacing: -0.03em; display: inline-block; transform-origin: 100% 50%; }''',
    fx=[('clink', 'ristorante', 0.0, 0.34), ('key-press', 'ristorante', 0.03, 0.14), ('click-soft', 'bottiglia', -0.05, 0.3), ('ding', 'trecento', -0.02, 0.3), ('thud', 'trecento', -0.02, 0.26), ('swoosh', 'serve', -0.3, 0.26), ('pop', 'serve', -0.1, 0.24),
        ('whoosh-short', 'serve', 0.3, 0.2), ('click', 'sessanta', -0.02, 0.4), ('register', 'sessanta', 0.02, 0.32), ('clink', 'sessanta', 0.18, 0.4), ('pop', 'sessanta', 0.18, 0.24)])

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
add('b29', 'quindi', 'mettigli', f'''      {small('l-a', 'se vendi qualcosa', 420, 80, '#86868b')}
      <div class="tagp" id="l-t" style="left:210px;top:620px"><i></i><b>il tuo prezzo</b></div>
      <svg viewBox="0 0 200 360" width="200" height="360" style="position:absolute;left:440px;top:860px;overflow:visible" data-layout-allow-overlap><path id="l-ar" d="M100 10 V330 M30 250 L100 336 L170 250" fill="none" stroke="{RED}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <svg viewBox="0 0 400 400" width="400" height="400" style="position:absolute;left:340px;top:840px;overflow:visible" data-layout-allow-overlap><path class="l-x" d="M30 30 L370 370" stroke="#1d1d1f" stroke-width="40" stroke-linecap="round" fill="none"/><path class="l-x" d="M370 30 L30 370" stroke="#1d1d1f" stroke-width="40" stroke-linecap="round" fill="none"/></svg>
      {big('l-b', 'non abbassarlo.', 1290, 132, INK)}''', cut('b29') + '''    tl.fromTo("#l-t", { opacity: 0, scale: 0.5, rotation: -10 }, { opacity: 1, scale: 1, rotation: -3, duration: 0.32, ease: "back.out(2.2)" }, 0.3);
    draw(tl, "#l-ar", 0.9, 0.4);
    draw(tl, ".l-x", «nonabbassare» - 0.05, 0.2);
    tl.to("#l-ar", { opacity: 0.4, duration: 0.2 }, «nonabbassare»);
    shake(tl, "#b29-cam", «nonabbassare» + 0.02, 20);
    tl.fromTo("#l-b", { opacity: 0, filter: "blur(12px)", scale: 1.2 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.22, ease: "expo.out" }, «nonabbassare» + 0.1);''', f'''
    .tagp {{ position: absolute; display: flex; align-items: center; gap: 30px; padding: 34px 60px 34px 40px; border-radius: 36px; background: #fff; color: {INK}; opacity: 0; box-shadow: 0 40px 100px -30px rgba(0,0,0,0.3), 0 0 0 2px #d2d2d7; white-space: nowrap; }}
    .tagp i {{ display: block; width: 44px; height: 44px; border-radius: 50%; background: #d2d2d7; flex: none; }}
    .tagp b {{ font: 700 92px/1 "SF Pro Display"; letter-spacing: -0.04em; }}''',
    fx=[('swipe', 'quindi', -0.2, 0.24), ('key-press', 'quindi', 0.02, 0.14), ('pop', 'quindi', 0.3, 0.28), ('swoosh', 'quindi', 0.9, 0.26), ('thud', 'nonabbassare', 0.0, 0.4)], ground='white')

# ---------------------------------------------------------------- 30. "Mettigli accanto un'opzione più cara."
add('b30', 'mettigli', 'nonserve', f'''      {small('j-a', 'mettigli accanto', 420, 80, '#86868b')}
      <div class="tagp" id="j-1" style="left:160px;top:640px"><i></i><b>il tuo prezzo</b></div>
      <div class="tagp big" id="j-2" style="left:90px;top:900px"><i></i><b>uno più caro</b></div>''', cut('b30') + '''    gsap.set("#j-1", { opacity: 1, rotation: -3 });
    tl.fromTo("#j-2", { opacity: 0, x: 1000, rotation: 14 }, { opacity: 1, x: 0, rotation: 4, duration: 0.4, ease: "back.out(1.4)" }, «cara» - 0.75);
    shake(tl, "#b30-cam", «cara» - 0.4, 20);
    tl.to("#j-1", { scale: 0.8, duration: 0.35, ease: "power2.out" }, «cara» - 0.35);
    tl.fromTo("#j-2", { scale: 1 }, { scale: 1.08, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, «cara» + 0.02);''', f'''
    .tagp {{ position: absolute; display: flex; align-items: center; gap: 30px; padding: 34px 60px 34px 40px; border-radius: 36px; background: #fff; color: {INK}; opacity: 0; box-shadow: 0 40px 100px -30px rgba(0,0,0,0.3), 0 0 0 2px #d2d2d7; white-space: nowrap; }}
    .tagp i {{ display: block; width: 44px; height: 44px; border-radius: 50%; background: #d2d2d7; flex: none; }}
    .tagp b {{ font: 700 92px/1 "SF Pro Display"; letter-spacing: -0.04em; }}
    .tagp.big {{ background: linear-gradient(135deg, #f6dc8c, #c9a227); padding: 46px 70px 46px 46px; }}
    .tagp.big b {{ font-size: 122px; }}''',
    fx=[('key-press', 'mettigli', 0.02, 0.14), ('whoosh', 'cara', -0.78, 0.28), ('boom', 'cara', -0.4, 0.4), ('register', 'cara', -0.34, 0.3), ('sparkle', 'cara', 0.02, 0.16)], ground='white')

# ---------------------------------------------------------------- 31. "Non serve che la comprino. Serve che la vedano."
add('b31', 'nonserve', 'cta', f'''      {small('i-a', 'non serve che la', 470, 76, '#86868b')}
      <div id="i-b" style="position:absolute;left:0;right:0;top:560px;text-align:center" data-layout-allow-overlap><span style="position:relative;display:inline-block;font:700 170px/1.05 {SF};letter-spacing:-0.045em;color:#a1a1a6">comprino<svg viewBox="0 0 800 30" width="100%" height="30" preserveAspectRatio="none" style="position:absolute;left:0;top:54%;overflow:visible"><path id="i-x" d="M0 15 H800" stroke="{RED}" stroke-width="16" stroke-linecap="round" fill="none"/></svg></span></div>
      {small('i-c', 'serve che la', 880, 76, '#86868b')}
      {big('i-d', 'vedano.', 960, 260, BLUE)}
      <svg id="i-eye" viewBox="0 0 300 160" width="360" height="192" style="position:absolute;left:360px;top:1290px;overflow:visible" data-layout-allow-overlap><path d="M10 80 Q150 -40 290 80 Q150 200 10 80 Z" fill="none" stroke="{BLUE}" stroke-width="14" stroke-linejoin="round"/><circle cx="150" cy="80" r="40" fill="{BLUE}"/></svg>''', cut('b31') + '''    draw(tl, "#i-x", 0.62, 0.22);
    tl.fromTo("#i-c", { opacity: 0 }, { opacity: 1, duration: 0.15 }, «serveche» - 0.06);
    tl.fromTo("#i-d", { opacity: 0, scale: 1.6, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }, «vedano» - 0.14);
    tl.fromTo("#i-eye", { opacity: 0, scaleY: 0, transformOrigin: "50% 50%" }, { opacity: 1, scaleY: 1, duration: 0.2, ease: "back.out(2)" }, «vedano» + 0.05);
    tl.to("#i-eye", { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1 }, «vedano» + 0.38);
    shake(tl, "#b31-cam", «vedano» - 0.1, 16);''',
    fx=[('key-press', 'nonserve', 0.02, 0.14), ('swoosh', 'nonserve', 0.62, 0.28), ('thud', 'nonserve', 0.8, 0.24), ('key-press', 'serveche', -0.06, 0.14), ('thud', 'vedano', -0.14, 0.34), ('pop', 'vedano', 0.05, 0.18), ('click-soft', 'vedano', 0.38, 0.3)], ground='white', mq='vedano')

# ================================================================ CALL TO ACTION + LOOP
ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']
def _row(k, letters):
    w = 96; gap = 8; x0 = (1080 - (len(letters) * w + (len(letters) - 1) * gap)) // 2
    return ''.join(f'<i class="kk" id="kk-{c}" style="left:{x0 + n * (w + gap)}px;top:{24 + k * 128}px">{c}</i>' for n, c in enumerate(letters))
KBD = (f'<div id="y-kb" style="position:absolute;left:0;top:1230px;width:1080px;height:690px;background:#d1d4db" data-layout-allow-overlap>'
       + ''.join(_row(k, r) for k, r in enumerate(ROWS))
       + f'<i class="kk" style="left:20px;top:408px;width:230px;background:#abb0ba;font-size:40px">123</i><i class="kk" style="left:262px;top:408px;width:556px;font-size:40px">spazio</i><i class="kk" style="left:830px;top:408px;width:230px;background:#0a84ff;color:#fff;font-size:40px">invio</i></div>')
KBDCSS = '''
    .kk { position: absolute; display: block; width: 96px; height: 108px; border-radius: 14px; background: #fff; box-shadow: 0 3px 0 #8a8d93; font: 400 54px/108px "SF Pro Display"; font-style: normal; text-align: center; color: #000; }'''
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
      {zone(ln('y-c1', 'e ti spiego tutto', 'tb', 'font-size:100px'), top=1040)}
      {KBD}''', cut('b32') + '''    rise(tl, "#y-a1", 0.03);
    rise(tl, "#y-a2", 0.42);
    sink(tl, "#y-a1", «scrivi» - 0.2); sink(tl, "#y-a2", «scrivi» - 0.2);
    rise(tl, "#y-b1", «scrivi» - 0.04);
    tl.fromTo("#y-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, «scrivi»);
    tl.fromTo("#y-kb", { y: 760 }, { y: 0, duration: 0.36, ease: "expo.out" }, «scrivi» - 0.04);
    ["M", "O", "T", "I", "O", "N"].forEach(function (k, i) {
      tl.to("#kk-" + k, { backgroundColor: "#a9adb6", y: -10, scale: 1.14, duration: 0.05, yoyo: true, repeat: 1, ease: "power1.out" }, «motion» + i * 0.06);
    });
    flip(tl, "#y-m", «motion» - 0.1, 0.045);
    typeIn(tl, "#y-t", «motion», 0.06);
    rise(tl, "#y-c1", «etispiego» - 0.04);
    tl.fromTo("#y-cur", { opacity: 0, x: 160, y: 200 }, { opacity: 1, x: 0, y: 0, duration: 0.3, ease: "power3.out" }, «etispiego» + 0.08);
    tl.to("#y-cur", { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1 }, «etispiego» + 0.46);
    tl.fromTo("#y-pub", { scale: 1 }, { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 }, «etispiego» + 0.48);''', KBDCSS,
    fx=[('swipe', 'cta', -0.2, 0.24), ('key-press', 'cta', 0.03, 0.14), ('key-press', 'cta', 0.42, 0.14), ('whoosh-short', 'scrivi', -0.2, 0.22), ('pop', 'scrivi', 0.0, 0.2), ('typing', 'motion', -0.1, 0.22), ('typing', 'motion', 0.2, 0.2),
        ('key-press', 'etispiego', -0.04, 0.16), ('click', 'etispiego', 0.46, 0.42), ('pop', 'etispiego', 0.5, 0.26)])

# ---------------------------------------------------------------- 33. loop: "E tutto questo, solo perché..." -> "Apple ha appena fatto uscire..." (the 3D phone folds back to the exact pose of the first frame)
add('b33', 'etutto', 'END', f'''      {small('e2-a', 'e tutto questo', 290, 80, '#86868b')}
      {big('e2-b', 'solo perché…', 376, 150, INK)}
      {HOOKTITLE.replace('@', 'e2')}
      {duo('e2-d', -160, 520, None)}''', f'''    gsap.set("#e2-d", {{ scale: 0.62 }}); gsap.set("#e2-d-g", {{ rotationY: 16, rotationX: 3 }}); duoSet("#e2-d", 0);
    gsap.set("#e2-eb, #e2-t", {{ opacity: 0 }}); gsap.set("#e2-t", {{ scale: 1.4 }});
    tl.to("#e2-d", {{ scale: {HOOK['scale']}, y: {HOOK['y']}, duration: DUR, ease: "power2.inOut" }}, 0);
    tl.to("#e2-d-g", {{ rotationY: {HOOK['ry']}, rotationX: {HOOK['rx']}, duration: DUR, ease: "power2.inOut" }}, 0);
    fold(tl, "#e2-d", 0, 40, 0.1, 0.5, "power2.inOut");
    fold(tl, "#e2-d", 40, {HOOK['ang']}, DUR - 0.9, 0.9, "power2.inOut");
    tl.fromTo("#e2-a", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.15 }}, 0.04);
    tl.fromTo("#e2-b", {{ opacity: 0, filter: "blur(12px)", scale: 1.15 }}, {{ opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.24, ease: "expo.out" }}, «soloperche» - 0.14);
    tl.to("#e2-a, #e2-b", {{ opacity: 0, duration: 0.14 }}, DUR - 0.4);
    tl.to("#e2-eb", {{ opacity: 1, duration: 0.2 }}, DUR - 0.26);
    tl.to("#e2-t", {{ opacity: 1, scale: {HOOK['ts']}, duration: 0.26, ease: "power2.in" }}, DUR - 0.26);''', cam=False,
    fx=[('key-press', 'etutto', 0.04, 0.14), ('thud', 'soloperche', -0.14, 0.28), ('hinge', 'etutto', 0.9, 0.26), ('riser', 'soloperche', -0.4, 0.12)])
