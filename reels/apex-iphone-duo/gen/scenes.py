# apex-iphone-duo: "Questo iPhone costa 2.369 euro. E ad Apple va benissimo se non lo compri."
# Verified facts (Apple Italy, November 2026): iPhone Duo from 2.369 € (256 GB) up to 3.869 € (2 TB), 5.4" outside and 7.6" inside, grade 5 titanium;
# iPhone 18 Pro Max 256 GB Borgogna 1.639 €; iPhone 17 Pro Max 256 GB launched at 1.489 € in 2025 (so +150 €).
# The reading "it also works as a price anchor" is the author's opinion and is said as such ("secondo me", "scommetto").
import sys
sys.path.insert(0, '.')
from kit import *
from times import T
R = Reel(T)
add = R.add
RED = '#ff453a'
HZ0, HZ1 = 1.36, 1.08     # zoom of the opening footage at the start and at the end of the hook; the closing scene ends on HZ0

# ---------------------------------------------------------------- 1. hook: "Questo iPhone costa 2.369 euro. E ad Apple va benissimo se non lo compri."
add('a1', 'start', 'sichiama', f'''      <div class="vid" id="h-w" data-layout-allow-overlap style="transform-origin:50% 52%"><img src="assets/img/hero-last.jpg" alt="" /><video id="h-v" class="clip" src="assets/video/hero.mp4" data-start="0" data-duration="4.66" data-media-start="0" muted playsinline></video></div>
      <div id="a-top" style="position:absolute;left:0;right:0;top:300px;text-align:center" data-layout-allow-overlap>
        <div id="a-lab" style="font:600 68px/1.1 'SF Pro Display';letter-spacing:-0.02em;color:#a1a1a6">Questo iPhone costa</div>
        <div id="a-pr" style="font:700 236px/1.05 'SF Pro Display';letter-spacing:-0.045em;color:#f5f5f7;margin-top:6px"><span id="a-n">1.000</span><span style="font-weight:600;font-size:150px"> €</span></div>
      </div>
      {zone(ln('a-l1', 'e ad Apple va benissimo', 't', 'font-size:74px;color:#f5f5f7'), ln('a-l2', 'se <span style="color:' + RED + '">non</span> lo compri.', 'tb wsplit', 'font-size:128px;color:#f5f5f7', mt=-14), top=1290)}
      <div class="flash" id="a-fl"></div>''', f'''    tl.fromTo("#h-w", {{ scale: {HZ0} }}, {{ scale: {HZ1}, duration: DUR, ease: "none" }}, 0);
    tl.fromTo("#a-lab", {{ opacity: 0.0, y: 20 }}, {{ opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }}, 0);
    count(tl, "#a-n", 1000, 2369, 0.05, 0.85, eur, "power3.out");
    tl.fromTo("#a-pr", {{ scale: 0.8, transformOrigin: "50% 60%" }}, {{ scale: 1, duration: 0.9, ease: "power3.out" }}, 0);
    tl.fromTo("#a-pr", {{ scale: 1.14 }}, {{ scale: 1, duration: 0.45, ease: "elastic.out(1.1, 0.4)", immediateRender: false }}, 0.92);
    flash(tl, "#a-fl", 0.92, 0.3);
    tl.fromTo("#a-pr", {{ scale: 1 }}, {{ scale: 1.1, duration: 0.16, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }}, «duemila» + 0.02);
    tl.to("#a-top", {{ scale: 0.62, y: -40, transformOrigin: "50% 0%", duration: 0.45, ease: "expo.out" }}, «ea» - 0.12);
    rise(tl, "#a-l1", «ea»);
    wordsIn(tl, "#a-l2", «senon» - 0.14, 0.085);
    shake(tl, "#a1-cam", «senon» + 0.02, 14);
    exit(tl, "#a1-st", "B", DUR - 0.2);''',
    fx=[('boom', 'start', 0.0, 0.5), ('counter', 'start', 0.06, 0.3), ('ding', 'start', 0.92, 0.3), ('impact-bass-1', 'start', 0.92, 0.26), ('tick', 'duemila', 0.02, 0.3),
        ('hinge', 'duemila', 0.3, 0.22), ('whoosh-short', 'ea', -0.14, 0.24), ('key-press', 'ea', 0.0, 0.16), ('pop', 'senon', -0.14, 0.2), ('pop', 'senon', 0.05, 0.22), ('thud', 'senon', 0.05, 0.3),
        ('riser', 'sichiama', -1.0, 0.1), ('swipe', 'sichiama', -0.22, 0.26)], ground='dark')

# ---------------------------------------------------------------- 2. "Si chiama iPhone Duo. È il primo iPhone che si piega. Chiuso, è un telefono. Aperto, è quasi un tablet."
add('a2', 'sichiama', 'titanio', f'''      <div class="eyebrow" id="b-eb" style="top:300px">Novità</div>
      <div style="position:absolute;left:0;right:0;top:340px;text-align:center"><span id="b-t" class="grad" style="font:700 184px/1.12 'SF Pro Display';letter-spacing:-0.045em;display:inline-block">iPhone Duo</span></div>
      <div id="b-s" class="wsplit" style="position:absolute;left:0;right:0;top:560px;text-align:center;font:600 54px/1.1 'SF Pro Display';letter-spacing:-0.02em;color:#86868b">Il primo iPhone che si piega.</div>
      <div id="b-k1" style="position:absolute;left:0;right:0;top:320px;text-align:center;opacity:0"><div style="font:700 170px/1.05 'SF Pro Display';letter-spacing:-0.045em">Chiuso.</div><div id="b-k1s" style="font:600 60px/1.2 'SF Pro Display';letter-spacing:-0.02em;color:#86868b;opacity:0">è un telefono</div></div>
      <div id="b-k2" style="position:absolute;left:0;right:0;top:320px;text-align:center;opacity:0"><div style="font:700 170px/1.05 'SF Pro Display';letter-spacing:-0.045em">Aperto.</div><div id="b-k2s" style="font:600 60px/1.2 'SF Pro Display';letter-spacing:-0.02em;color:#86868b;opacity:0">è quasi un tablet</div></div>
      {duo('d', -160, 800, None)}
      <div class="chip" id="b-c1" style="left:810px;top:1010px">5,4″</div>
      <div class="chip" id="b-c2" style="left:0;right:0;margin:0 auto;width:fit-content;top:1420px;background:{BLUE}">7,6″</div>''', '''    enter(tl, "#a2-st", "B");
    gsap.set("#d", { scale: 0.62 }); gsap.set("#d-g", { rotationY: -16, rotationX: 6 }); duoSet("#d", 180);
    tl.fromTo("#b-eb", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.1);
    fold(tl, "#d", 180, 0, 0.12, 0.85, "power3.out");
    tl.fromTo("#d", { y: 260 }, { y: 0, duration: 0.7, ease: "expo.out" }, 0.05);
    tl.fromTo("#b-t", { opacity: 0, filter: "blur(22px)", scale: 1.22 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.5, ease: "expo.out" }, «duo» - 0.22);
    wordsIn(tl, "#b-s", «primo» - 0.05, 0.08);
    fold(tl, "#d", 0, 180, «sipiega» - 0.08, 0.5, "power3.inOut");
    tl.to("#d-g", { rotationY: -30, duration: 0.5, ease: "power2.inOut" }, «sipiega» - 0.08);
    /* closed */
    blurOut(tl, "#b-eb, #b-t, #b-s", «chiuso» - 0.2);
    tl.to("#d", { scale: 0.98, y: -40, duration: 0.5, ease: "expo.out" }, «chiuso» - 0.16);
    tl.to("#d-g", { rotationY: -20, rotationX: 4, duration: 0.5, ease: "expo.out" }, «chiuso» - 0.16);
    blurIn(tl, "#b-k1", «chiuso» - 0.06, 0.26);
    tl.fromTo("#b-k1s", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, «telefono» - 0.05);
    pop(tl, "#b-c1", «telefono» + 0.14);
    /* open */
    blurOut(tl, "#b-k1, #b-c1", «aperto» - 0.2);
    fold(tl, "#d", 180, 0, «aperto» - 0.12, 0.62, "power3.inOut");
    tl.to("#d", { scale: 0.66, y: 0, duration: 0.62, ease: "power3.inOut" }, «aperto» - 0.12);
    tl.to("#d-g", { rotationY: -8, rotationX: 5, duration: 0.62, ease: "power3.inOut" }, «aperto» - 0.12);
    blurIn(tl, "#b-k2", «aperto» - 0.02, 0.26);
    tl.fromTo("#b-k2s", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, «tablet» - 0.02);
    pop(tl, "#b-c2", «tablet» + 0.32);
    tl.to("#d-g", { rotationY: 6, duration: 1.3, ease: "sine.inOut" }, «tablet» - 0.1);
    exit(tl, "#a2-st", "B", DUR - 0.2);''',
    fx=[('whoosh-short', 'sichiama', 0.1, 0.22), ('hinge', 'sichiama', 0.62, 0.3), ('typing', 'duo', -0.24, 0.18), ('pop', 'duo', 0.1, 0.2), ('key-press', 'primo', -0.05, 0.14), ('key-press', 'primo', 0.2, 0.12), ('key-press', 'primo', 0.45, 0.12),
        ('whoosh-short', 'sipiega', -0.1, 0.24), ('hinge', 'sipiega', 0.34, 0.36), ('thud', 'chiuso', -0.06, 0.3), ('key-press', 'telefono', -0.05, 0.14), ('pop', 'telefono', 0.14, 0.24),
        ('whoosh', 'aperto', -0.14, 0.26), ('hinge', 'aperto', 0.4, 0.36), ('thud', 'aperto', 0.0, 0.26), ('key-press', 'tablet', -0.02, 0.14), ('pop', 'tablet', 0.32, 0.24), ('sparkle', 'tablet', 0.4, 0.14), ('swipe', 'titanio', -0.24, 0.26)])

# ---------------------------------------------------------------- 3. "Titanio. Due schermi."
add('a3', 'titanio', 'siarriva', f'''      <div id="t-img" style="position:absolute;left:90px;top:640px;width:900px;height:1146px" data-layout-allow-overlap>
        <img src="assets/img/duo-vee.png" style="position:absolute;inset:0;width:900px;height:1146px" alt="" />
        <div id="t-sw" style="position:absolute;inset:0;-webkit-mask:url(assets/img/duo-vee.png) center/100% 100% no-repeat;mask:url(assets/img/duo-vee.png) center/100% 100% no-repeat;overflow:hidden"><i id="t-band" style="position:absolute;top:-20%;left:0;width:240px;height:140%;background:linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%);transform:skewX(-18deg)"></i></div>
      </div>
      <div id="t-k1" style="position:absolute;left:0;right:0;top:320px;text-align:center"><span class="metal" style="font:700 200px/1.1 'SF Pro Display';letter-spacing:-0.045em">Titanio.</span></div>
      <div id="t-k2" style="position:absolute;left:0;right:0;top:330px;text-align:center;opacity:0"><span style="font:700 168px/1.1 'SF Pro Display';letter-spacing:-0.045em;color:#f5f5f7">Due schermi.</span></div>
      <div class="chip" id="t-c1" style="left:120px;top:1430px;background:#f5f5f7;color:#1d1d1f">fuori · 5,4″</div>
      <div class="chip" id="t-c2" style="left:590px;top:1430px;background:#f5f5f7;color:#1d1d1f">dentro · 7,6″</div>''', '''    enter(tl, "#a3-st", "B");
    blurIn(tl, "#t-k1", 0.02, 0.24);
    tl.fromTo("#t-img", { scale: 1.3, y: 80 }, { scale: 1, y: 0, duration: 0.6, ease: "expo.out" }, 0);
    tl.fromTo("#t-band", { x: -300 }, { x: 1000, duration: 0.7, ease: "power2.inOut" }, 0.12);
    blurOut(tl, "#t-k1", «dueschermi» - 0.18, 0.14);
    blurIn(tl, "#t-k2", «dueschermi» - 0.04, 0.24);
    tl.fromTo("#t-img", { scale: 1 }, { scale: 1.08, duration: 0.16, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, «dueschermi» - 0.04);
    pop(tl, "#t-c1", «dueschermi» + 0.12); pop(tl, "#t-c2", «dueschermi» + 0.26);
    exit(tl, "#a3-st", "U", DUR - 0.18);''', '''
    .metal { background: linear-gradient(180deg, #ffffff 0%, #c9ccd4 38%, #6f7480 62%, #e8eaef 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }''',
    fx=[('impact-bass-1', 'titanio', 0.02, 0.3), ('sparkle', 'titanio', 0.16, 0.18), ('whoosh-short', 'dueschermi', -0.18, 0.22), ('thud', 'dueschermi', -0.04, 0.3), ('pop', 'dueschermi', 0.12, 0.24), ('pop', 'dueschermi', 0.26, 0.24), ('whoosh', 'siarriva', -0.2, 0.26)], ground='dark')

# ---------------------------------------------------------------- 4. the Store page: "E si arriva a quasi quattromila euro."
def opt(k, gb, price):
    return (f'<div class="opt" style="top:{k * 172}px"><b>{gb}</b><span>Da {price} €</span></div>')
BAG = '<svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="#1d1d1f" stroke-width="1.6" stroke-linejoin="round"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>'
add('a4', 'siarriva', 'ma', f'''      <div id="c-zoom" style="position:absolute;inset:0" data-layout-allow-overlap>
      <div style="position:absolute;left:0;right:0;top:232px;height:86px;border-bottom:2px solid #e8e8ed"><div style="position:absolute;left:70px;top:14px;font:600 42px/1.2 'SF Pro Display';letter-spacing:-0.01em">&#xF8FF; Store</div><div style="position:absolute;right:70px;top:14px">{BAG}</div></div>
      <div style="position:absolute;left:70px;top:360px;font:700 80px/1.05 'SF Pro Display';letter-spacing:-0.03em">Acquista iPhone Duo</div>
      <div style="position:absolute;left:70px;right:70px;top:476px;font:600 42px/1.25 'SF Pro Display';letter-spacing:-0.015em">Spazio di archiviazione. <span style="color:#86868b">Di quanto spazio hai bisogno?</span></div>
      <div id="c-list" style="position:absolute;left:70px;top:640px;width:940px;height:670px">
        {opt(0, '256 GB', '2.369')}{opt(1, '512 GB', '2.619')}{opt(2, '1 TB', '3.119')}{opt(3, '2 TB', '3.869')}
        <i id="c-sel" style="position:absolute;left:-3px;top:-3px;width:946px;height:156px;border-radius:31px;border:5px solid {BLUE};pointer-events:none"></i>
      </div>
      <div id="c-tot" style="position:absolute;left:70px;right:70px;top:1340px;display:flex;align-items:baseline;justify-content:space-between"><span style="font:600 44px/1 'SF Pro Display';color:#86868b">Totale</span><span style="font:700 120px/1 'SF Pro Display';letter-spacing:-0.04em"><span id="c-n">2.369</span> €</span></div>
      <div class="chip" id="c-chip" style="right:70px;top:1476px;background:#d70015;font-size:50px">quasi 4.000 €</div>
      <div id="c-cur" class="cur" style="left:820px;top:760px">{CURSOR}</div>
      </div>''', '''    enter(tl, "#a4-st", "U");
    tl.fromTo(".opt", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out", stagger: 0.045 }, 0.06);
    tl.fromTo("#c-cur", { opacity: 0, x: 200, y: 260 }, { opacity: 1, x: 0, y: 0, duration: 0.3, ease: "power3.out" }, 0.1);
    [[1, 2619, 0.42], [2, 3119, 0.64], [3, 3869, 0.86]].forEach(([k, v, t], n) => {
      tl.to("#c-cur", { y: k * 172, duration: 0.16, ease: "power3.inOut" }, t - 0.14);
      tl.to("#c-cur", { scale: 0.8, duration: 0.05, yoyo: true, repeat: 1 }, t);
      tl.to("#c-sel", { y: k * 172, duration: 0.14, ease: "back.out(2)" }, t);
      count(tl, "#c-n", [2369, 2619, 3119][n], v, t, 0.18);
    });
    tl.fromTo("#c-tot", { scale: 1, transformOrigin: "100% 60%" }, { scale: 1.12, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, 1.04);
    tl.fromTo("#c-zoom", { scale: 1 }, { scale: 1.07, transformOrigin: "50% 78%", duration: 0.9, ease: "power2.inOut" }, 1.0);
    pop(tl, "#c-chip", «quattromila» + 0.3);
    tl.to("#c-cur", { opacity: 0, duration: 0.15 }, 1.1);
    exit(tl, "#a4-st", "Z", DUR - 0.18);''', f'''
    .opt {{ position: absolute; left: 0; width: 940px; height: 150px; border-radius: 28px; border: 2px solid #d2d2d7; display: flex; align-items: center; justify-content: space-between; padding: 0 44px; background: #fff; }}
    .opt b {{ font: 600 52px/1 "SF Pro Display"; letter-spacing: -0.02em; }}
    .opt span {{ font: 400 40px/1 "SF Pro Display"; color: #1d1d1f; }}''', cam=True,
    fx=[('key-press', 'siarriva', 0.08, 0.14), ('click-soft', 'siarriva', 0.42, 0.34), ('tick', 'siarriva', 0.44, 0.3), ('click-soft', 'siarriva', 0.64, 0.34), ('tick', 'siarriva', 0.66, 0.3), ('click-soft', 'siarriva', 0.86, 0.34), ('tick', 'siarriva', 0.88, 0.3),
        ('register', 'siarriva', 1.04, 0.3), ('whoosh-short', 'siarriva', 1.0, 0.16), ('pop', 'quattromila', 0.3, 0.26), ('whoosh', 'ma', -0.2, 0.26)])

# ---------------------------------------------------------------- 5. "Ma secondo me non l'hanno fatto solo per venderlo."
add('a5', 'ma', 'guarda', f'''      <div id="e-dw" style="position:absolute;inset:0;opacity:0.42" data-layout-allow-overlap>{duo('e', -160, 900, 0.9, shadow=False)}</div>
      <div style="position:absolute;inset:0;background:radial-gradient(closest-side at 50% 42%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%)"></div>
      <div id="e-a" class="wsplit" style="position:absolute;left:0;right:0;top:420px;text-align:center;font:600 66px/1.1 'SF Pro Display';letter-spacing:-0.02em;color:#a1a1a6">Ma secondo me</div>
      {zone(ln('e-b', 'non l’hanno fatto', 't', 'font-size:104px;color:#f5f5f7'), ln('e-c', '<span style="position:relative;display:inline-block">solo<svg viewBox="0 0 300 30" width="300" height="30" style="position:absolute;left:-10px;bottom:-14px;overflow:visible"><path id="e-u" d="M4 16 Q150 0 296 14" fill="none" stroke="' + RED + '" stroke-width="12" stroke-linecap="round"/></svg></span> per venderlo.', 'tb', 'font-size:120px;color:#f5f5f7', mt=-10), top=520)}''', '''    enter(tl, "#a5-st", "Z");
    gsap.set("#e-g", { rotationX: 8 }); duoSet("#e", 180);
    tl.fromTo("#e-g", { rotationY: -60 }, { rotationY: 60, duration: DUR, ease: "none" }, 0);
    wordsIn(tl, "#e-a", 0.05, 0.09);
    rise(tl, "#e-b", «nonlhanno» - 0.1);
    rise(tl, "#e-c", «solo» - 0.14);
    draw(tl, "#e-u", «solo» + 0.02, 0.28);
    shake(tl, "#a5-cam", «solo» - 0.1, 12);
    exit(tl, "#a5-st", "B", DUR - 0.2);''',
    fx=[('key-press', 'ma', 0.05, 0.14), ('key-press', 'ma', 0.23, 0.12), ('whoosh-short', 'nonlhanno', -0.12, 0.2), ('key-press', 'nonlhanno', -0.1, 0.16), ('impact-bass-1', 'solo', -0.12, 0.28), ('swoosh', 'solo', 0.02, 0.26), ('swipe', 'guarda', -0.24, 0.26)], ground='dark')

# ---------------------------------------------------------------- 6. "Guarda cosa succede nell'Apple Store."
add('a6', 'guarda', 'diciotto', f'''      {vid('s-v', 'store.mp4', T['diciotto'] - T['guarda'], 2.0)}
      <div id="s-a" class="wsplit" style="position:absolute;left:0;right:0;top:330px;text-align:center;font:600 60px/1.1 'SF Pro Display';letter-spacing:-0.02em;color:#f5f5f7">guarda cosa succede nell’</div>
      <div id="s-b" style="position:absolute;left:0;right:0;top:410px;text-align:center;font:700 176px/1.1 'SF Pro Display';letter-spacing:-0.04em;color:#fff;text-shadow:0 10px 60px rgba(0,0,0,0.45)">&#xF8FF; Store</div>
      <div class="flash" id="s-fl"></div>''', '''    enter(tl, "#a6-st", "B");
    tl.fromTo("#s-v-w", { scale: 1.12 }, { scale: 1.0, duration: DUR - 0.3, ease: "power1.out" }, 0);
    wordsIn(tl, "#s-a", 0.06, 0.07);
    tl.fromTo("#s-b", { opacity: 0, filter: "blur(20px)", scale: 1.2 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.4, ease: "expo.out" }, «store» - 0.5);
    tl.to("#s-v-w", { scale: 2.3, transformOrigin: "62% 60%", duration: 0.3, ease: "power3.in" }, DUR - 0.3);
    tl.to("#s-a, #s-b", { opacity: 0, scale: 1.4, duration: 0.2, ease: "power3.in" }, DUR - 0.28);
    tl.fromTo("#s-fl", { opacity: 0 }, { opacity: 1, duration: 0.14, ease: "power2.in" }, DUR - 0.14);''', cam=False,
    fx=[('key-press', 'guarda', 0.06, 0.14), ('key-press', 'guarda', 0.2, 0.12), ('impact-bass-1', 'store', -0.5, 0.24), ('sparkle', 'store', -0.4, 0.14), ('whoosh-cinematic', 'diciotto', -0.55, 0.3), ('swipe', 'diciotto', -0.3, 0.28)], ground='dark')

# ---------------------------------------------------------------- 7. "iPhone 18 Pro Max, color borgogna. 1.639 euro. 150 in più dell'anno scorso. Da solo, è un'enormità."
SW = [('Nero', '#2b2b2d'), ('Argento', '#e3e4e5'), ('Ghiacciaio', '#c8dbe6'), ('Borgogna', '#7a0f24')]
sw = ''.join(f'<i class="sw" style="background:{c}"></i>' for n, c in SW)
add('a7', 'diciotto', 'poi', f'''      <div id="p-t" class="wsplit" style="position:absolute;left:0;right:0;top:296px;text-align:center;font:700 104px/1.05 'SF Pro Display';letter-spacing:-0.035em">iPhone 18 Pro Max</div>
      <div id="p-sw" style="position:absolute;left:0;right:0;top:442px;display:flex;justify-content:center;align-items:center;gap:26px">{sw}<i id="p-ring"></i><span id="p-col" style="font:600 44px/1 'SF Pro Display';color:{BURG};margin-left:14px;opacity:0">Borgogna</span></div>
      <img id="p-img" class="mul" src="assets/img/ip18-burg-pair.png" style="position:absolute;left:260px;top:560px;width:560px;height:1001px;transform-origin:0 0;filter:brightness(1.06) contrast(1.03)" alt="" />
      <div id="p-pb" style="position:absolute;left:400px;top:640px;width:640px;opacity:0">
        <div style="font:500 46px/1 'SF Pro Display';color:#86868b">Da</div>
        <div style="font:700 170px/1.05 'SF Pro Display';letter-spacing:-0.045em"><span id="p-n">0</span> €</div>
        <div style="font:500 40px/1.2 'SF Pro Display';color:#86868b">256 GB · Borgogna</div>
      </div>
      <div id="p-cmp" style="position:absolute;left:70px;top:1090px;width:940px;height:420px">
        <div class="yr" id="p-y1" style="left:0"><small>2025 · iPhone 17 Pro Max</small><b style="color:#86868b">1.489 €</b></div>
        <div class="yr" id="p-y2" style="left:490px"><small>2026 · iPhone 18 Pro Max</small><b>1.639 €</b></div>
        <div class="chip" id="p-up" style="left:0;right:0;margin:0 auto;width:fit-content;top:250px;background:#d70015;font-size:96px;padding:26px 52px">+150 €</div>
      </div>
      <div id="p-big" style="position:absolute;left:0;right:0;top:500px;text-align:center;opacity:0">
        <div id="p-ds" style="font:600 64px/1.1 'SF Pro Display';letter-spacing:-0.02em;color:#86868b">da solo</div>
        <div id="p-bn" style="font:700 270px/1.05 'SF Pro Display';letter-spacing:-0.05em">1.639 €</div>
        <div id="p-en" style="font:700 124px/1.1 'SF Pro Display';letter-spacing:-0.035em;color:{BURG};opacity:0">è un’enormità.</div>
      </div>''', '''    tl.fromTo("#a7-st", { scale: 1.25, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 0.35, ease: "expo.out" }, 0);
    wordsIn(tl, "#p-t", 0.04, 0.09);
    tl.fromTo("#p-img", { opacity: 0, y: 200, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out" }, 0.08);
    tl.fromTo(".sw", { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.24, ease: "back.out(3)", stagger: 0.06 }, 0.5);
    tl.fromTo("#p-ring", { opacity: 0, x: -3 * 86 }, { opacity: 1, x: -3 * 86, duration: 0.12 }, 0.8);
    tl.to("#p-ring", { x: 0, duration: 0.3, ease: "back.out(1.6)" }, «borgogna» - 0.1);
    tl.fromTo("#p-col", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" }, «borgogna» + 0.1);
    tl.fromTo("#p-img", { rotation: 0 }, { rotation: -3, duration: 0.18, yoyo: true, repeat: 1, ease: "sine.inOut", immediateRender: false }, «borgogna» + 0.05);
    /* price */
    tl.to("#p-img", { x: -230, y: 0, scale: 0.52, duration: 0.5, ease: "expo.out" }, «mille» - 0.2);
    tl.fromTo("#p-pb", { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.4, ease: "expo.out" }, «mille» - 0.12);
    count(tl, "#p-n", 900, 1639, «mille» - 0.1, 0.9, eur, "power3.out");
    punch(tl, "#p-pb", «mille» + 0.82, 1.08);
    /* +150 */
    tl.fromTo("#p-y1", { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.3, ease: "expo.out" }, «centocinq» - 0.1);
    tl.fromTo("#p-y2", { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.3, ease: "expo.out" }, «centocinq» + 0.1);
    tl.fromTo("#p-up", { opacity: 0, scale: 0.4, rotation: -10 }, { opacity: 1, scale: 1, rotation: -3, duration: 0.4, ease: "back.out(2.6)" }, «centocinq» + 0.3);
    shake(tl, "#a7-cam", «centocinq» + 0.32, 12);
    /* alone, it is huge */
    blurOut(tl, "#p-t, #p-sw, #p-img, #p-pb, #p-cmp", «dasolo» - 0.2, 0.18);
    tl.fromTo("#p-big", { opacity: 0, scale: 0.7, filter: "blur(16px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, «dasolo» - 0.08);
    tl.to("#p-bn", { scale: 1.16, duration: 1.4, ease: "power1.out" }, «dasolo» + 0.3);
    tl.fromTo("#p-en", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" }, «enormita» + 0.1);
    shake(tl, "#a7-cam", «enormita» + 0.12, 20);
    exit(tl, "#a7-st", "L", DUR - 0.2);''', f'''
    .mul {{ mix-blend-mode: multiply; }}
    .sw {{ display: block; width: 60px; height: 60px; border-radius: 50%; box-shadow: inset 0 0 0 2px rgba(0,0,0,0.12); }}
    #p-ring {{ display: block; width: 82px; height: 82px; border-radius: 50%; border: 5px solid {BLUE}; margin-left: -97px; opacity: 0; }}
    .yr {{ position: absolute; top: 0; width: 450px; height: 210px; border-radius: 34px; background: #f5f5f7; padding: 36px 40px; opacity: 0; }}
    .yr small {{ display: block; font: 600 32px/1 "SF Pro Display"; color: #86868b; }}
    .yr b {{ display: block; font: 700 96px/1 "SF Pro Display"; letter-spacing: -0.04em; margin-top: 22px; }}''',
    fx=[('thud', 'diciotto', 0.0, 0.3), ('key-press', 'diciotto', 0.04, 0.14), ('key-press', 'diciotto', 0.22, 0.12), ('key-press', 'diciotto', 0.4, 0.12), ('pop', 'diciotto', 0.5, 0.16), ('pop', 'diciotto', 0.62, 0.16),
        ('click-soft', 'borgogna', -0.08, 0.34), ('sparkle', 'borgogna', 0.1, 0.14), ('whoosh-short', 'mille', -0.2, 0.22), ('counter', 'mille', -0.1, 0.3), ('ding', 'mille', 0.82, 0.3), ('register', 'mille', 0.82, 0.22),
        ('key-press', 'centocinq', -0.1, 0.14), ('key-press', 'centocinq', 0.1, 0.14), ('pop', 'centocinq', 0.3, 0.3), ('thud', 'centocinq', 0.32, 0.3),
        ('whoosh', 'dasolo', -0.2, 0.26), ('impact-bass-1', 'dasolo', -0.06, 0.26), ('riser', 'dasolo', 0.2, 0.1), ('boom', 'enormita', 0.1, 0.4), ('swoosh', 'poi', -0.2, 0.28)])

# ---------------------------------------------------------------- 8. "Poi gli metti accanto il Duo. E di colpo, 1.639 euro ti sembrano pochi. 730 in meno. Quasi un affare."
add('a8', 'poi', 'sichiama2', f'''      <div class="pc" id="q-l" style="left:50px">
        <div class="pi"><img class="mul" src="assets/img/ip18-burg-a.png" style="height:560px;margin-top:-10px" alt="" /></div>
        <div class="pn">iPhone 18 Pro Max</div>
        <div class="pp" id="q-lp">1.639 €</div>
        <div id="q-st">affare?</div>
      </div>
      <div class="pc" id="q-r" style="left:560px">
        <div class="pi"><img src="assets/img/duo-vee.png" style="height:500px;margin-top:20px" alt="" /></div>
        <div class="pn">iPhone Duo</div>
        <div class="pp" id="q-rp"><span id="q-rn">1.639</span> €</div>
      </div>
      <div id="q-top" style="position:absolute;left:0;right:0;top:290px;text-align:center">
        <div id="q-t1" class="wsplit" style="font:700 78px/1.08 'SF Pro Display';letter-spacing:-0.035em">Poi gli metti accanto il Duo.</div>
        <div id="q-t2" class="wsplit" style="position:absolute;left:0;right:0;top:0;font:700 92px/1.08 'SF Pro Display';letter-spacing:-0.035em">E di colpo ti sembrano <span style="color:{GREEN}">pochi.</span></div>
      </div>
      <svg id="q-br" viewBox="0 0 980 120" width="980" height="120" style="position:absolute;left:50px;top:1330px;overflow:visible"><path id="q-bp" d="M235 0 V50 Q235 70 255 70 H725 Q745 70 745 50 V0" fill="none" stroke="{GREEN}" stroke-width="8" stroke-linecap="round"/></svg>
      <div id="q-df" style="position:absolute;left:0;right:0;top:1410px;text-align:center;font:700 150px/1 'SF Pro Display';letter-spacing:-0.045em;color:{GREEN};opacity:0">−<span id="q-dn">0</span> €</div>''', '''    enter(tl, "#a8-st", "L");
    gsap.set("#q-l", { x: 255 });
    tl.fromTo("#q-l", { scale: 1.08 }, { scale: 1.08, duration: 0.01 }, 0);
    wordsIn(tl, "#q-t1", 0.06, 0.075);
    tl.to("#q-l", { x: 0, scale: 1, duration: 0.5, ease: "expo.out" }, «ilduo» - 0.75);
    tl.fromTo("#q-r", { x: 900, rotation: 8 }, { x: 0, rotation: 0, duration: 0.5, ease: "back.out(1.3)" }, «ilduo» - 0.62);
    shake(tl, "#a8-cam", «ilduo» - 0.24, 18);
    count(tl, "#q-rn", 1639, 2369, «ilduo» - 0.2, 0.55, eur, "power2.out");
    punch(tl, "#q-rp", «ilduo» + 0.36, 1.18);
    /* suddenly it looks small */
    blurOut(tl, "#q-t1", «dicolpo» - 0.14, 0.14);
    wordsIn(tl, "#q-t2", «dicolpo» - 0.02, 0.085);
    tl.to("#q-r", { scale: 1.06, transformOrigin: "50% 60%", duration: 0.5, ease: "power2.out" }, «mille2» - 0.1);
    tl.to("#q-l", { scale: 0.94, transformOrigin: "50% 60%", duration: 0.5, ease: "power2.out" }, «mille2» - 0.1);
    tl.to("#q-lp", { color: "#1d8a3c", scale: 1.16, duration: 0.2, ease: "back.out(3)" }, «mille2» + 0.1);
    tl.to("#q-l", { boxShadow: "0 40px 100px -30px rgba(29,138,60,0.45), 0 0 0 5px #1d8a3c", duration: 0.25 }, «pochi» - 0.1);
    /* 730 less */
    draw(tl, "#q-bp", «settecento» - 0.1, 0.4);
    tl.fromTo("#q-df", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, «settecento» - 0.02);
    count(tl, "#q-dn", 0, 730, «settecento» - 0.02, 0.7, eur, "power2.out");
    punch(tl, "#q-df", «settecento» + 0.7, 1.14);
    /* almost a bargain */
    tl.fromTo("#q-st", { opacity: 0, scale: 2.6, rotation: -30 }, { opacity: 1, scale: 1, rotation: -12, duration: 0.3, ease: "power4.in" }, «quasi» + 0.02);
    shake(tl, "#a8-cam", «quasi» + 0.32, 14);
    exit(tl, "#a8-st", "B", DUR - 0.2);''', f'''
    .mul {{ mix-blend-mode: multiply; }}
    .pc {{ position: absolute; top: 560px; width: 470px; height: 760px; border-radius: 44px; background: #fff; box-shadow: 0 40px 100px -30px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.04); text-align: center; }}
    .pi {{ height: 540px; overflow: hidden; border-radius: 44px 44px 0 0; }}
    .pn {{ font: 600 40px/1.2 "SF Pro Display"; letter-spacing: -0.015em; color: #86868b; margin-top: 16px; }}
    .pp {{ font: 700 96px/1.1 "SF Pro Display"; letter-spacing: -0.04em; display: inline-block; }}
    #q-st {{ position: absolute; left: 60px; top: 190px; padding: 14px 34px; border: 9px solid {GREEN}; border-radius: 22px; color: {GREEN}; font: 700 84px/1 "SF Pro Display"; letter-spacing: -0.02em; text-transform: uppercase; background: rgba(255,255,255,0.9); opacity: 0; }}''',
    fx=[('key-press', 'poi', 0.06, 0.14), ('key-press', 'poi', 0.21, 0.12), ('key-press', 'poi', 0.36, 0.12), ('whoosh', 'ilduo', -0.62, 0.28), ('thud', 'ilduo', -0.24, 0.4), ('impact-bass-1', 'ilduo', -0.24, 0.24), ('counter', 'ilduo', -0.2, 0.28), ('ding', 'ilduo', 0.36, 0.28),
        ('whoosh-short', 'dicolpo', -0.14, 0.2), ('key-press', 'dicolpo', -0.02, 0.14), ('key-press', 'dicolpo', 0.24, 0.12), ('pop', 'mille2', 0.1, 0.24), ('sparkle', 'pochi', -0.1, 0.16), ('ping', 'pochi', -0.1, 0.16),
        ('swoosh', 'settecento', -0.1, 0.24), ('counter', 'settecento', -0.02, 0.28), ('ding', 'settecento', 0.7, 0.28), ('thud', 'quasi', 0.3, 0.4), ('register', 'quasi', 0.34, 0.34), ('swipe', 'sichiama2', -0.24, 0.26)], ground='grey')

# ---------------------------------------------------------------- 9. "Si chiama effetto àncora."
add('a9', 'sichiama2', 'ilprimo', f'''      <div id="k-a" style="position:absolute;left:0;right:0;top:330px;text-align:center;font:600 60px/1 'SF Pro Display';color:#a1a1a6">si chiama</div>
      <div id="k-b" style="position:absolute;left:0;right:0;top:410px;text-align:center;font:700 150px/1.05 'SF Pro Display';letter-spacing:-0.045em;color:#f5f5f7">Effetto</div>
      <div id="k-c" style="position:absolute;left:0;right:0;top:560px;text-align:center"><span class="split" id="k-cw" style="font:700 216px/1.05 'SF Pro Display';letter-spacing:-0.045em;color:#2997ff;display:inline-block">àncora.</span></div>
      <div style="position:absolute;left:0;top:830px;width:1080px;height:1090px;overflow:hidden" data-layout-allow-overlap><svg id="k-an" viewBox="0 0 200 1200" width="330" height="1980" style="position:absolute;left:375px;top:-1390px;overflow:visible" fill="none" stroke="#f5f5f7" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">
        <path d="M100 0 V962" stroke-dasharray="4 26" stroke="#6e6e73"/>
        <circle cx="100" cy="986" r="22"/><path d="M100 1008 V1180"/><path d="M62 1050 H138"/>
        <path d="M26 1100 C26 1158 68 1184 100 1184 C132 1184 174 1158 174 1100"/><path d="M26 1100 L10 1128 M26 1100 L52 1116 M174 1100 L190 1128 M174 1100 L148 1116"/>
      </svg></div>
      <i class="rp" id="k-r1"></i><i class="rp" id="k-r2"></i>
      <div id="k-src" style="position:absolute;left:0;right:0;top:1450px;text-align:center;font:500 34px/1 'SF Pro Display';color:#86868b;opacity:0">Tversky e Kahneman, 1974</div>''', '''    enter(tl, "#a9-st", "B");
    tl.fromTo("#k-a", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.04);
    blurIn(tl, "#k-b", «effetto» - 0.2, 0.24);
    flip(tl, "#k-cw", «ancora» - 0.14, 0.03);
    tl.fromTo("#k-an", { y: -1500 }, { y: 0, duration: 0.5, ease: "power3.in" }, «ancora» - 0.42);
    tl.to("#k-an", { y: -46, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1 }, «ancora» + 0.08);
    shake(tl, "#a9-cam", «ancora» + 0.08, 22);
    ["#k-r1", "#k-r2"].forEach((r, k) => tl.fromTo(r, { opacity: 0.8, scale: 0.2 }, { opacity: 0, scale: 3.2, duration: 0.7, ease: "power2.out" }, «ancora» + 0.1 + k * 0.16));
    tl.fromTo("#k-src", { opacity: 0 }, { opacity: 1, duration: 0.3 }, «ancora» + 0.3);
    exit(tl, "#a9-st", "U", DUR - 0.18);''', '''
    .rp { position: absolute; left: 390px; top: 1300px; display: block; width: 300px; height: 90px; border-radius: 50%; border: 6px solid #2997ff; opacity: 0; }''',
    fx=[('key-press', 'sichiama2', 0.04, 0.14), ('thud', 'effetto', -0.2, 0.28), ('anchor', 'ancora', -0.5, 0.5), ('typing', 'ancora', -0.14, 0.16), ('boom', 'ancora', 0.08, 0.45), ('whoosh', 'ilprimo', -0.2, 0.26)], ground='dark')

# ---------------------------------------------------------------- 10. "Il primo prezzo che vedi diventa il tuo metro. E tutto quello che viene dopo, ti sembra poco."
ticks = ''.join(f'<i style="top:{k * 64}px;width:{44 if k % 5 == 0 else 24}px"></i>' for k in range(11))
add('a10', 'ilprimo', 'lofanno', f'''      <div id="m-ta" style="position:absolute;left:0;right:0;top:296px;text-align:center">
        <div id="m-t1" class="wsplit" style="font:600 62px/1.1 'SF Pro Display';letter-spacing:-0.02em;color:#86868b">Il primo prezzo che vedi</div>
        <div id="m-t2" style="font:700 110px/1.1 'SF Pro Display';letter-spacing:-0.04em;opacity:0">diventa il tuo metro.</div>
      </div>
      <div id="m-tb" style="position:absolute;left:0;right:0;top:296px;text-align:center">
        <div id="m-t3" class="wsplit" style="font:600 62px/1.1 'SF Pro Display';letter-spacing:-0.02em;color:#86868b">e tutto quello che viene dopo</div>
        <div id="m-t4" style="font:700 110px/1.1 'SF Pro Display';letter-spacing:-0.04em;opacity:0">ti sembra <span style="color:{GREEN}">poco.</span></div>
      </div>
      <div id="m-g" style="position:absolute;left:0;top:640px;width:1080px;height:860px">
        <div style="position:absolute;left:110px;right:110px;top:810px;height:4px;background:#d2d2d7;border-radius:2px"></div>
        <div class="rul" id="m-rul">{ticks}</div>
        <div class="bar" id="m-b1" style="left:250px;height:640px;background:linear-gradient(180deg,#31407a,#1d2a57)"></div>
        <div class="bl" id="m-l1" style="left:250px;top:50px">2.369 €<small>il primo</small></div>
        <div class="bar" id="m-b2" style="left:610px;height:443px;background:linear-gradient(180deg,#a11a35,#7a0f24)"></div>
        <div class="bl" id="m-l2" style="left:610px;top:247px">1.639 €<small>dopo</small></div>
        <div id="m-dash" style="position:absolute;left:250px;top:168px;width:650px;height:0;border-top:5px dashed #86868b;transform-origin:left center"></div>
        <svg viewBox="0 0 80 200" width="80" height="200" style="position:absolute;left:880px;top:170px;overflow:visible"><path id="m-gap" d="M10 4 H34 V195 H10" fill="none" stroke="{GREEN}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>''', '''    enter(tl, "#a10-st", "U");
    wordsIn(tl, "#m-t1", 0.06, 0.075);
    tl.fromTo("#m-b1", { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: "expo.out" }, 0.16);
    tl.fromTo("#m-l1", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" }, 0.6);
    blurIn(tl, "#m-t2", «diventa» - 0.06, 0.26);
    tl.fromTo("#m-rul i", { scaleX: 0 }, { scaleX: 1, duration: 0.16, ease: "power2.out", stagger: { each: 0.035, from: "end" } }, «diventa» + 0.02);
    tl.fromTo("#m-b1", { scaleX: 1 }, { scaleX: 1.08, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, «diventa» + 0.45);
    blurOut(tl, "#m-ta", «etutto» - 0.16, 0.14);
    wordsIn(tl, "#m-t3", «etutto» + 0.02, 0.07);
    tl.fromTo("#m-b2", { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: "expo.out" }, «tutto» + 0.3);
    tl.fromTo("#m-l2", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" }, «tutto» + 0.7);
    blurIn(tl, "#m-t4", «tisembra» - 0.06, 0.26);
    tl.fromTo("#m-dash", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.out" }, «tisembra»);
    draw(tl, "#m-gap", «poco» - 0.1, 0.3);
    tl.to("#m-b2", { filter: "brightness(1.25)", duration: 0.14, yoyo: true, repeat: 1 }, «poco» + 0.05);
    exit(tl, "#a10-st", "B", DUR - 0.2);''', f'''
    .bar {{ position: absolute; bottom: 50px; width: 220px; border-radius: 26px 26px 0 0; transform-origin: 50% 100%; }}
    .bl {{ position: absolute; width: 220px; margin-left: 0; text-align: center; font: 700 62px/1 "SF Pro Display"; letter-spacing: -0.035em; opacity: 0; white-space: nowrap; }}
    .bl small {{ display: block; font: 600 30px/1 "SF Pro Display"; color: #86868b; margin-top: 8px; letter-spacing: 0; }}
    .rul {{ position: absolute; left: 150px; top: 170px; width: 60px; height: 644px; border-right: 6px solid {INK}; }}
    .rul i {{ position: absolute; right: 0; height: 6px; margin-top: -3px; background: {INK}; border-radius: 3px; transform-origin: right center; }}''',
    fx=[('key-press', 'ilprimo', 0.06, 0.14), ('key-press', 'ilprimo', 0.22, 0.12), ('swoosh', 'ilprimo', 0.16, 0.22), ('pop', 'ilprimo', 0.6, 0.22), ('thud', 'diventa', -0.06, 0.28), ('typing', 'diventa', 0.02, 0.2), ('ping', 'diventa', 0.45, 0.16),
        ('whoosh-short', 'etutto', -0.16, 0.2), ('key-press', 'etutto', 0.02, 0.14), ('key-press', 'tutto', 0.1, 0.12), ('swoosh', 'tutto', 0.3, 0.22), ('pop', 'tutto', 0.7, 0.22), ('thud', 'tisembra', -0.06, 0.26), ('click-soft', 'tisembra', 0.02, 0.3), ('sparkle', 'poco', -0.05, 0.16), ('swipe', 'lofanno', -0.24, 0.26)])

# ---------------------------------------------------------------- 11. the wine list
def wrow(k, name, desc, price):
    return f'<div class="wr" id="w-r{k}" style="top:{150 + (k - 1) * 158}px"><div><b>{name}</b><small>{desc}</small></div><span id="w-p{k}">{price} €</span></div>'
add('a11', 'lofanno', 'scommetto', f'''      <div id="w-t" class="wsplit" style="position:absolute;left:0;right:0;top:300px;text-align:center;font:700 84px/1.08 'SF Pro Display';letter-spacing:-0.035em;color:#f3e9d6">Lo fanno anche i ristoranti.</div>
      <div id="w-pv" style="position:absolute;left:90px;top:520px;width:900px;height:880px;perspective:2200px" data-layout-allow-overlap>
        <div id="w-card" style="position:absolute;inset:0;border-radius:38px;background:#f7f1e6;color:#2a211a;box-shadow:0 60px 120px -30px rgba(0,0,0,0.7);transform-origin:50% 30%">
          <div style="position:absolute;left:0;right:0;top:46px;text-align:center;font:600 32px/1 'SF Pro Display';letter-spacing:0.28em;color:#8a6f4d">CARTA DEI VINI</div>
          <div style="position:absolute;left:60px;right:60px;top:112px;height:2px;background:#d9c9ac"></div>
          <i id="w-hl" style="position:absolute;left:24px;top:136px;width:852px;height:150px;border-radius:26px;border:5px solid #c9a227;background:rgba(201,162,39,0.12);opacity:0"></i>
          {wrow(1, 'Barolo Riserva 2010', 'la bottiglia in cima alla carta', '300')}{wrow(2, 'Barbaresco 2019', 'rosso, 75 cl', '60')}{wrow(3, 'Nebbiolo 2021', 'rosso, 75 cl', '38')}{wrow(4, 'Dolcetto 2022', 'rosso, 75 cl', '24')}
          <svg viewBox="0 0 852 20" width="852" height="20" style="position:absolute;left:24px;top:196px;overflow:visible"><path id="w-x" d="M30 10 H822" stroke="#8a6f4d" stroke-width="7" stroke-linecap="round" fill="none"/></svg>
          <div class="chip" id="w-no" style="left:520px;top:176px;background:#2a211a;font-size:32px;padding:12px 22px">non si vende</div>
          <div class="chip" id="w-ok" style="left:486px;top:330px;width:80px;height:80px;padding:0;background:{GREEN};font-size:46px;line-height:80px;text-align:center">✓</div>
        </div>
      </div>
      <div id="w-cur" class="cur" style="left:820px;top:1000px">{CURSOR}</div>''', '''    enter(tl, "#a11-st", "B");
    wordsIn(tl, "#w-t", 0.06, 0.08);
    tl.fromTo("#w-card", { y: 1200, rotationX: 40 }, { y: 0, rotationX: 0, duration: 0.6, ease: "expo.out" }, 0.1);
    tl.fromTo(".wr", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.25, ease: "power2.out", stagger: 0.06 }, 0.4);
    /* the 300 € bottle on top */
    tl.fromTo("#w-hl", { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power3.out" }, «bottiglia» - 0.05);
    tl.to("#w-card", { scale: 1.1, rotationX: 6, y: 30, duration: 0.6, ease: "power2.out" }, «bottiglia» - 0.05);
    tl.fromTo("#w-p1", { scale: 1 }, { scale: 1.55, color: "#b8860b", duration: 0.2, ease: "back.out(3)" }, «trecento» - 0.02);
    tl.to("#w-p1", { scale: 1.15, duration: 0.3 }, «trecento» + 0.4);
    draw(tl, "#w-x", «nonserve» + 0.1, 0.35);
    pop(tl, "#w-no", «nonserve» + 0.4);
    tl.to("#w-r1", { opacity: 0.45, duration: 0.3 }, «nonserve» + 0.4);
    /* it sells the 60 € one */
    tl.to("#w-hl", { y: 158, borderColor: "#1d8a3c", backgroundColor: "rgba(29,138,60,0.12)", duration: 0.3, ease: "back.out(1.6)" }, «serve» - 0.05);
    tl.to("#w-no", { opacity: 0, duration: 0.2 }, «serve» - 0.05);
    tl.to("#w-card", { rotationX: 0, y: -20, scale: 1.14, duration: 0.5, ease: "power2.out" }, «serve» - 0.05);
    tl.fromTo("#w-cur", { opacity: 0, x: 200, y: 300 }, { opacity: 1, x: 0, y: 0, duration: 0.35, ease: "power3.out" }, «sessanta» - 0.5);
    tl.to("#w-cur", { scale: 0.8, duration: 0.06, yoyo: true, repeat: 1 }, «sessanta» - 0.02);
    tl.fromTo("#w-p2", { scale: 1 }, { scale: 1.5, color: "#1d8a3c", duration: 0.2, ease: "back.out(3)" }, «sessanta»);
    pop(tl, "#w-ok", «sessanta» + 0.22);
    shake(tl, "#a11-cam", «sessanta» + 0.02, 10);
    exit(tl, "#a11-st", "U", DUR - 0.18);''', '''
    #root { background: #14100d !important; }
    .st.dark { background: radial-gradient(closest-side at 50% 45%, #3a2a20 0%, #14100d 100%); }
    .wr { position: absolute; left: 60px; right: 60px; height: 122px; display: flex; align-items: center; justify-content: space-between; opacity: 0; }
    .wr b { display: block; font: 600 50px/1.1 "SF Pro Display"; letter-spacing: -0.02em; }
    .wr small { display: block; font: 500 30px/1.2 "SF Pro Display"; color: #8a6f4d; margin-top: 6px; }
    .wr span { font: 700 60px/1 "SF Pro Display"; letter-spacing: -0.03em; display: inline-block; transform-origin: 100% 50%; }''',
    fx=[('key-press', 'lofanno', 0.06, 0.14), ('key-press', 'lofanno', 0.22, 0.12), ('swoosh', 'lofanno', 0.1, 0.26), ('clink', 'lofanno', 0.55, 0.3), ('click-soft', 'bottiglia', -0.05, 0.3), ('whoosh-short', 'bottiglia', -0.05, 0.16), ('ding', 'trecento', -0.02, 0.3), ('thud', 'trecento', -0.02, 0.26),
        ('swoosh', 'nonserve', 0.1, 0.26), ('pop', 'nonserve', 0.4, 0.24), ('whoosh-short', 'serve', -0.05, 0.2), ('click-soft', 'serve', 0.0, 0.3), ('click', 'sessanta', -0.02, 0.4), ('register', 'sessanta', 0.02, 0.32), ('clink', 'sessanta', 0.22, 0.4), ('pop', 'sessanta', 0.22, 0.24), ('whoosh', 'scommetto', -0.2, 0.26)], ground='dark')

# ---------------------------------------------------------------- 12. "Scommetto che il più venduto non sarà il Duo. Sarà quello che sembra conveniente accanto al Duo."
add('a12', 'scommetto', 'lezione', f'''      <div class="eyebrow" id="b2-eb" style="top:300px">La mia scommessa</div>
      <div id="b2-t" class="wsplit" style="position:absolute;left:0;right:0;top:350px;text-align:center;font:700 120px/1.08 'SF Pro Display';letter-spacing:-0.04em">Il più venduto?</div>
      <div id="b2-glow" style="position:absolute;left:520px;top:640px;width:520px;height:760px;border-radius:50%;background:radial-gradient(closest-side, rgba(0,113,227,0.28), rgba(0,113,227,0));opacity:0"></div>
      <div id="b2-l" style="position:absolute;left:60px;top:700px;width:460px;text-align:center" data-layout-allow-overlap>
        <img src="assets/img/duo-vee.png" style="width:420px;height:535px" alt="" />
        <div style="font:600 44px/1.2 'SF Pro Display';letter-spacing:-0.02em;margin-top:18px">iPhone Duo</div><div style="font:600 40px/1.2 'SF Pro Display';color:#86868b">2.369 €</div>
      </div>
      <svg viewBox="0 0 300 300" width="300" height="300" style="position:absolute;left:140px;top:810px;overflow:visible" data-layout-allow-overlap><path class="b2-x" d="M20 20 L280 280" stroke="#d70015" stroke-width="26" stroke-linecap="round" fill="none"/><path class="b2-x" d="M280 20 L20 280" stroke="#d70015" stroke-width="26" stroke-linecap="round" fill="none"/></svg>
      <div id="b2-r" style="position:absolute;left:560px;top:680px;width:460px;text-align:center" data-layout-allow-overlap>
        <img class="mul" src="assets/img/ip18-burg-a.png" style="height:560px;filter:brightness(1.06) contrast(1.03)" alt="" />
        <div style="font:600 44px/1.2 'SF Pro Display';letter-spacing:-0.02em;margin-top:-6px">iPhone 18 Pro Max</div><div style="font:600 40px/1.2 'SF Pro Display';color:#86868b">1.639 €</div>
      </div>
      <div class="chip" id="b2-n1" style="left:620px;top:640px;background:{BLUE};font-size:52px;padding:20px 38px">il più venduto</div>
      <div id="b2-s" class="wsplit" style="position:absolute;left:60px;right:60px;top:1420px;text-align:center;font:600 50px/1.15 'SF Pro Display';letter-spacing:-0.02em;color:#1d1d1f">quello che sembra conveniente accanto al Duo</div>''', '''    enter(tl, "#a12-st", "U");
    tl.fromTo("#b2-eb", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.06);
    wordsIn(tl, "#b2-t", «scommetto» * 0 + 0.4, 0.09);
    tl.fromTo("#b2-l", { opacity: 0, y: 200 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, 0.14);
    tl.fromTo("#b2-r", { opacity: 0, y: 200 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, 0.24);
    draw(tl, ".b2-x", «nonsara» + 0.02, 0.22);
    tl.to("#b2-l", { filter: "grayscale(1)", opacity: 0.4, scale: 0.86, transformOrigin: "50% 40%", duration: 0.4, ease: "power2.out" }, «nonsara» + 0.2);
    shake(tl, "#a12-cam", «nonsara» + 0.04, 14);
    tl.to("#b2-r", { scale: 1.1, x: -50, transformOrigin: "50% 40%", duration: 0.5, ease: "back.out(1.6)" }, «sara» - 0.05);
    tl.to(".b2-x", { opacity: 0.55, duration: 0.3 }, «sara» - 0.05);
    tl.fromTo("#b2-glow", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.2, duration: 0.5, ease: "power2.out" }, «sara» - 0.05);
    tl.fromTo("#b2-n1", { opacity: 0, scale: 0.4, rotation: -8 }, { opacity: 1, scale: 1, rotation: -4, duration: 0.36, ease: "back.out(2.6)" }, «sara» + 0.25);
    wordsIn(tl, "#b2-s", «conveniente» - 0.3, 0.075);
    exit(tl, "#a12-st", "B", DUR - 0.2);''', '''
    .mul { mix-blend-mode: multiply; }''',
    fx=[('key-press', 'scommetto', 0.06, 0.14), ('pop', 'scommetto', 0.18, 0.18), ('pop', 'scommetto', 0.28, 0.18), ('key-press', 'scommetto', 0.4, 0.14), ('key-press', 'scommetto', 0.58, 0.12),
        ('swoosh', 'nonsara', 0.02, 0.3), ('thud', 'nonsara', 0.2, 0.34), ('whoosh-short', 'sara', -0.08, 0.2), ('sparkle', 'sara', 0.0, 0.2), ('pop', 'sara', 0.25, 0.28), ('ding', 'sara', 0.3, 0.26),
        ('key-press', 'conveniente', -0.3, 0.14), ('key-press', 'conveniente', 0.0, 0.12), ('key-press', 'accanto', 0.0, 0.12), ('swipe', 'lezione', -0.24, 0.26)])

# ---------------------------------------------------------------- 13. "La lezione? Se vuoi vendere una cosa cara, mettile vicino una cosa carissima."
add('a13', 'lezione', 'cta', f'''      <div id="z-q" style="position:absolute;left:0;right:0;top:520px;text-align:center;font:700 170px/1.05 'SF Pro Display';letter-spacing:-0.045em;color:#f5f5f7">La lezione?</div>
      <div id="z-a" class="wsplit" style="position:absolute;left:0;right:0;top:560px;text-align:center;font:600 68px/1.1 'SF Pro Display';letter-spacing:-0.02em;color:#a1a1a6">Se vuoi vendere una cosa</div>
      <div id="z-b" class="wsplit" style="position:absolute;left:0;right:0;top:1090px;text-align:center;font:600 68px/1.1 'SF Pro Display';letter-spacing:-0.02em;color:#a1a1a6">mettile vicino una cosa</div>
      <div class="tagp" id="z-t1" style="left:290px;top:690px"><i></i><b>cara</b><small>€€</small></div>
      <div class="tagp big" id="z-t2" style="left:140px;top:1210px"><i></i><b>carissima</b><small>€€€€</small></div>''', '''    enter(tl, "#a13-st", "B");
    blurIn(tl, "#z-q", 0.02, 0.26);
    tl.to("#z-q", { scale: 0.42, y: -230, color: "#86868b", duration: 0.45, ease: "expo.out" }, «sevuoi» - 0.14);
    wordsIn(tl, "#z-a", «sevuoi», 0.07);
    tl.fromTo("#z-t1", { opacity: 0, scale: 0.4, rotation: -14 }, { opacity: 1, scale: 1, rotation: -4, duration: 0.4, ease: "back.out(2.4)" }, «cara» - 0.12);
    wordsIn(tl, "#z-b", «mettile», 0.07);
    tl.fromTo("#z-t2", { opacity: 0, x: 900, rotation: 12 }, { opacity: 1, x: 0, rotation: 3, duration: 0.45, ease: "back.out(1.4)" }, «carissima» - 0.3);
    shake(tl, "#a13-cam", «carissima» + 0.08, 20);
    tl.to("#z-t1", { scale: 0.78, duration: 0.4, ease: "power2.out" }, «carissima» + 0.1);
    exit(tl, "#a13-st", "L", DUR - 0.2);''', f'''
    .tagp {{ position: absolute; display: flex; align-items: center; gap: 30px; padding: 34px 60px 34px 40px; border-radius: 36px; background: #f5f5f7; color: {INK}; opacity: 0; box-shadow: 0 40px 100px -30px rgba(0,0,0,0.8); }}
    .tagp i {{ display: block; width: 44px; height: 44px; border-radius: 50%; background: #000; flex: none; }}
    .tagp b {{ font: 700 120px/1 "SF Pro Display"; letter-spacing: -0.04em; }}
    .tagp small {{ font: 600 54px/1 "SF Pro Display"; color: #86868b; }}
    .tagp.big {{ background: linear-gradient(135deg, #f6dc8c, #c9a227); }}
    .tagp.big b {{ font-size: 138px; }} .tagp.big small {{ color: #6b5210; }}''',
    fx=[('thud', 'lezione', 0.02, 0.3), ('whoosh-short', 'sevuoi', -0.16, 0.22), ('key-press', 'sevuoi', 0.0, 0.14), ('key-press', 'sevuoi', 0.28, 0.12), ('pop', 'cara', -0.12, 0.28), ('key-press', 'mettile', 0.0, 0.14), ('key-press', 'mettile', 0.28, 0.12),
        ('whoosh', 'carissima', -0.32, 0.28), ('boom', 'carissima', 0.06, 0.42), ('register', 'carissima', 0.1, 0.3), ('swoosh', 'cta', -0.22, 0.28)], ground='dark')

# ---------------------------------------------------------------- 14. call to action: "Se vuoi sapere come creo questi video, scrivi MOTION nei commenti e ti spiego tutto."
add('a14', 'cta', 'ah', f'''      {zone(ln('y-a1', 'vuoi sapere come', 't mut'), ln('y-a2', 'creo questi video?', 'tb', 'font-size:104px', mt=-18))}
      {zone(ln('y-b1', 'scrivi', 't mut'))}
      <div id="y-m" class="split acc" style="position:absolute;left:0;right:0;top:486px;text-align:center;font:700 220px/1 'SF Pro Display';letter-spacing:-0.045em">MOTION</div>
      <div id="y-bar" style="position:absolute;left:90px;top:850px;width:900px;height:140px;border-radius:70px;border:4px solid #d2d2d7;display:flex;align-items:center;padding:0 44px 0 24px;gap:26px">
        <div style="width:92px;height:92px;border-radius:50%;background:linear-gradient(#d1d1d6,#aeaeb2)"></div>
        <div id="y-t" class="split" style="flex:1;font:500 52px/1 'SF Pro Display';letter-spacing:0.01em">MOTION</div>
        <div id="y-pub" style="font:600 46px/1 'SF Pro Display';color:#0a84ff">Pubblica</div>
      </div>
      <div id="y-cur" class="cur" style="left:880px;top:940px">{CURSOR}</div>
      {zone(ln('y-c1', 'e ti spiego tutto', 'tb', 'font-size:100px'), top=1080)}''', '''    enter(tl, "#a14-st", "L");
    rise(tl, "#y-a1", 0.05);
    rise(tl, "#y-a2", 0.62);
    sink(tl, "#y-a1", «scrivi» - 0.22); sink(tl, "#y-a2", «scrivi» - 0.22);
    rise(tl, "#y-b1", «scrivi» - 0.06);
    tl.fromTo("#y-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.35, ease: "expo.out" }, «scrivi» - 0.02);
    flip(tl, "#y-m", «motion» - 0.1, 0.05);
    typeIn(tl, "#y-t", «motion», 0.07);
    rise(tl, "#y-c1", «etispiego» - 0.04);
    tl.fromTo("#y-cur", { opacity: 0, x: 160, y: 200 }, { opacity: 1, x: 0, y: 0, duration: 0.36, ease: "power3.out" }, «etispiego» + 0.1);
    tl.to("#y-cur", { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1 }, «etispiego» + 0.56);
    tl.fromTo("#y-pub", { scale: 1 }, { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 }, «etispiego» + 0.58);
    exit(tl, "#a14-st", "B", DUR - 0.2);''',
    fx=[('key-press', 'cta', 0.05, 0.14), ('key-press', 'cta', 0.62, 0.14), ('whoosh-short', 'scrivi', -0.22, 0.22), ('key-press', 'scrivi', -0.06, 0.16), ('pop', 'scrivi', -0.02, 0.2), ('typing', 'motion', -0.1, 0.22), ('typing', 'motion', 0.25, 0.2),
        ('key-press', 'etispiego', -0.04, 0.16), ('click', 'etispiego', 0.56, 0.42), ('pop', 'etispiego', 0.6, 0.26), ('swipe', 'ah', -0.24, 0.26)])

# ---------------------------------------------------------------- 15. loop: "Ah, e ricordati..." -> "Questo iPhone costa 2.369 euro."
D15 = T['END'] - T['ah']
add('a15', 'ah', 'END', f'''      <div class="vid" id="l-w" data-layout-allow-overlap style="transform-origin:50% 52%"><img src="assets/img/hero-first.jpg" alt="" /></div>
      <div id="l-t" class="wsplit" style="position:absolute;left:0;right:0;top:330px;text-align:center;font:700 120px/1.08 'SF Pro Display';letter-spacing:-0.04em;color:#f5f5f7">Ah, e ricordati…</div>''', f'''    enter(tl, "#a15-st", "B");
    tl.fromTo("#l-w", {{ scale: {HZ0 + 0.06:.3f} }}, {{ scale: {HZ0}, duration: DUR, ease: "none" }}, 0);
    wordsIn(tl, "#l-t", 0.08, 0.2);
    tl.to("#l-t", {{ opacity: 0, filter: "blur(12px)", duration: 0.14, ease: "power2.in" }}, DUR - 0.14);''', cam=False,
    fx=[('key-press', 'ah', 0.08, 0.16), ('key-press', 'ericordati', 0.0, 0.14), ('riser', 'ericordati', -0.3, 0.12)], ground='dark')
