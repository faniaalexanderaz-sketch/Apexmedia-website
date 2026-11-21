# apex-gta6-lancio: "In 24 ore un videogioco ha incassato più di qualsiasi film nella storia del cinema."
# Structure: hook with object and number in the first frame, promise within 10 s, story with open loops, a one-word comment question,
# the lesson for whoever sells, the keyword (LANCIO) and a loop line that runs into the first sentence.
# Verified facts: GTA VI out 19 Nov 2026, first-day sales about 3.79 billion dollars (Take-Two estimate, 20 Nov 2026; it may include pre-orders);
# 32.5 million pre-order copies (Take-Two); GTA V made more than 800 million dollars on day one (2013); the all-time box office record is
# about 2.92 billion dollars (Avengers: Endgame / Avatar). GTA V 2013 -> GTA VI 2026 = 13 years. "The merit is the wait" is the author's opinion.
# No game artwork or logos: generic neon city footage (generated earlier for apex-gta6) and plain type.
import sys
sys.path.insert(0, '.'); sys.path.insert(0, '../../apex-kit')
from kit import *
from ui import *
from times import T
BED = 0.075; ROOT = '#0b0614'
PINK = '#ff3d8b'; ORNG = '#ff9f43'; CYAN = '#00e5ff'; VIOL = '#8b5cff'; RED = '#ff453a'; GRN = '#30d158'; WHITE = '#f5f5f7'
THEME = f'''
    .st.neon {{ background: {ROOT}; color: #fff; }}
    .neon .bgfx i:nth-child(1) {{ background: radial-gradient(closest-side, rgba(255,61,139,0.34), rgba(255,61,139,0)); }}
    .neon .bgfx i:nth-child(2) {{ background: radial-gradient(closest-side, rgba(0,229,255,0.24), rgba(0,229,255,0)); }}
    .neon .mq {{ -webkit-text-stroke: 4px rgba(255,255,255,0.09); }}
    .ng {{ background: linear-gradient(100deg, {PINK} 0%, {ORNG} 55%, #ffd166 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }}
    .ngc {{ background: linear-gradient(100deg, {CYAN} 0%, {VIOL} 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }}
    .glow {{ filter: drop-shadow(0 0 28px rgba(255,61,139,0.55)); }}
    .grid {{ position: absolute; left: -540px; width: 2160px; top: 1180px; height: 1000px; background-image: linear-gradient(rgba(255,61,139,0.6) 3px, transparent 3px), linear-gradient(90deg, rgba(255,61,139,0.6) 3px, transparent 3px); background-size: 120px 120px; transform: perspective(520px) rotateX(64deg); transform-origin: 50% 0%; -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 35%); mask-image: linear-gradient(to bottom, transparent 0%, #000 35%); }}
    .sun {{ position: absolute; left: 240px; top: 640px; width: 600px; height: 600px; border-radius: 50%; background: linear-gradient(180deg, #ffd166 0%, {ORNG} 35%, {PINK} 70%, {VIOL} 100%); -webkit-mask-image: repeating-linear-gradient(180deg, #000 0px, #000 46px, transparent 46px, transparent 60px); mask-image: repeating-linear-gradient(180deg, #000 0px, #000 46px, transparent 46px, transparent 60px); opacity: 0.85; }}
    .dc {{ position: absolute; border-radius: 44px; background: rgba(28,22,44,0.92); box-shadow: 0 0 0 2px rgba(255,255,255,0.08), 0 40px 120px -30px rgba(0,0,0,0.8); }}
    .nchip {{ position: absolute; padding: 16px 32px; border-radius: 999px; font: 700 44px/1 "SF Pro Display"; letter-spacing: -0.01em; white-space: nowrap; color: #0b0614; background: linear-gradient(100deg, {PINK}, {ORNG}); opacity: 0; }}
    .eb {{ position: absolute; left: 0; right: 0; text-align: center; font: 700 38px/1 "SF Pro Display"; letter-spacing: 0.22em; color: {CYAN}; }}
'''
R = Reel(T, THEME, grounds={'neon': (' dark neon', ROOT)})
add = R.add
mld = 'function (v) { return (v / 1e9).toFixed(2).replace(".", ",") + " mld"; }'
mil = 'function (v) { return String(Math.round(v)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, "."); }'
GRID = '<div class="grid" id="@-grid" data-layout-allow-overlap></div>'
def grid_js(p): return f'    tl.fromTo("#{p}-grid", {{ backgroundPosition: "0px 0px" }}, {{ backgroundPosition: "0px 480px", duration: DUR, ease: "none" }}, 0);\n'
# small line icons
PAD = f'<svg viewBox="0 0 200 130" width="@W" height="@H" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M50 20 H150 C180 20 196 50 196 82 C196 112 176 124 160 116 C146 108 140 96 128 94 H72 C60 96 54 108 40 116 C24 124 4 112 4 82 C4 50 20 20 50 20 Z"/><path d="M50 52 V84 M34 68 H66"/><circle cx="140" cy="58" r="6" fill="#fff"/><circle cx="160" cy="78" r="6" fill="#fff"/></svg>'
PIZZA = f'<svg viewBox="0 0 200 200" width="@W" height="@H" fill="none" stroke-linejoin="round"><path d="M100 190 L20 40 Q100 0 180 40 Z" fill="#ffcf5a" stroke="#c77d17" stroke-width="8"/><path d="M20 40 Q100 0 180 40 L172 56 Q100 20 28 56 Z" fill="#d9822b"/><circle cx="92" cy="80" r="15" fill="#e0453a"/><circle cx="125" cy="112" r="13" fill="#e0453a"/><circle cx="85" cy="135" r="11" fill="#e0453a"/><circle cx="118" cy="70" r="5" fill="#3a7d2c"/></svg>'
CLAP = f'<svg viewBox="0 0 200 170" width="@W" height="@H" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="round"><rect x="12" y="62" width="176" height="100" rx="12"/><path d="M12 62 L22 18 L188 18 L178 62" /><path d="M58 18 L44 62 M104 18 L90 62 M150 18 L136 62"/></svg>'
GLASS = f'<svg viewBox="0 0 160 220" width="@W" height="@H" fill="none" stroke="{CYAN}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10 H140 M20 210 H140"/><path d="M34 10 C34 70 126 90 126 110 C126 130 34 150 34 210"/><path d="M126 10 C126 70 34 90 34 110 C34 130 126 150 126 210"/><path id="@-sand" d="M56 190 H104 L80 150 Z" fill="{ORNG}" stroke="none"/></svg>'
LOCK = f'<svg viewBox="0 0 120 150" width="@W" height="@H" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"><rect x="10" y="62" width="100" height="80" rx="16" fill="rgba(255,255,255,0.08)"/><path d="M30 62 V42 C30 6 90 6 90 42 V62"/><circle cx="60" cy="100" r="9" fill="#fff"/></svg>'
MUTE = f'<svg viewBox="0 0 200 160" width="@W" height="@H" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><path d="M14 56 H50 L96 16 V144 L50 104 H14 Z" fill="rgba(255,255,255,0.08)"/><path id="@-x" d="M128 50 L186 110 M186 50 L128 110" stroke="{RED}"/></svg>'
CHECK = '<svg viewBox="0 0 100 100" width="@W" height="@H"><circle cx="50" cy="50" r="46" fill="#30d158"/><path d="M28 52 L44 68 L74 36" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>'
def icon(svg, i, w, h): return svg.replace('@W', str(w)).replace('@H', str(h)).replace('@-', i + '-')
CAR0 = 1.6          # media time of the car clip on the very first frame; the loop scene plays the seconds just before it
TITLE = '''<div id="@-t" class="glow" style="position:absolute;left:0;right:0;top:300px;text-align:center;font:800 230px/1 'SF Pro Display';letter-spacing:-0.05em;transform-origin:50% 50%" data-layout-allow-overlap><span class="ng">24 ORE</span></div>'''
TS0 = 1.12          # title scale on the first frame (and on the last frame of the loop)

# ================================================================ HOOK
# 1. "In 24 ore un videogioco" (the car at sunset, 24 ORE in neon, a clock ring closing)
add('g01', 'start', 'incassato', f'''      {clip('a-car', 'car.mp4', T['incassato'], CAR0, 0.25, '50% 60%')}
      {TITLE.replace('@', 'a')}
      <svg id="a-ring" viewBox="0 0 400 400" width="300" height="300" style="position:absolute;left:390px;top:560px;overflow:visible;opacity:0" data-layout-allow-overlap><circle cx="200" cy="200" r="170" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="22"/><circle id="a-arc" cx="200" cy="200" r="170" fill="none" stroke="{CYAN}" stroke-width="22" stroke-linecap="round" transform="rotate(-90 200 200)"/></svg>
      <div id="a-pad" style="position:absolute;left:430px;top:650px;opacity:0" data-layout-allow-overlap>{icon(PAD, 'a', 220, 143)}</div>''', '''    tl.fromTo("#a-car-w", { scale: 1.15 }, { scale: 1.0, duration: DUR, ease: "none" }, 0);
    gsap.set("#a-t", { scale: TS0 });
    tl.to("#a-t", { scale: 1, duration: 0.4, ease: "expo.out" }, 0.02);
    tl.to("#a-ring", { opacity: 1, duration: 0.08 }, 0.04);
    draw(tl, "#a-arc", 0.05, 0.75);
    tl.to("#a-ring", { opacity: 0, scale: 0.6, duration: 0.14 }, «videogioco» - 0.04);
    pop(tl, "#a-pad", «videogioco»);
    shake(tl, "#g01-st", 0.06, 12);'''.replace('TS0', str(TS0)), cam=False, ground='neon',
    fx=[('rev', 'start', 0.0, 0.5), ('bass-drop', 'start', 0.0, 0.45), ('tick', 'start', 0.3, 0.2), ('pop', 'videogioco', 0.0, 0.3)])

# 2. "...ha incassato" (synthwave grid, the money counter runs)
add('g02', 'incassato', 'film', f'''      <div class="sun" id="b-sun" data-layout-allow-overlap></div>{GRID.replace('@', 'b')}
      <div class="eb" style="top:330px">INCASSATO</div>
      <div id="b-n" class="glow" style="position:absolute;left:0;right:0;top:400px;text-align:center;font:800 170px/1 'SF Pro Display';letter-spacing:-0.05em" data-layout-allow-overlap><span class="ng">$ <span id="b-v">0</span></span></div>''',
    grid_js('b') + '''    tl.fromTo("#b-sun", { y: 140 }, { y: 0, duration: DUR, ease: "power2.out" }, 0);
    count(tl, "#b-v", 0, 3790000000, 0.0, 1.2, MLD, "power2.out");
    punch(tl, "#b-n", 1.2, 1.12);'''.replace('MLD', mld), cam=False, ground='neon',
    fx=[('counter', 'incassato', 0.0, 0.32), ('cash', 'incassato', 1.2, 0.4)])

# 3. "...più di qualsiasi film nella storia del cinema" (the clapperboard gets crossed out)
add('g03', 'film', 'intutta', f'''      {small('c-a', 'più di', 330, 80, '#a1a1a6')}
      {big('c-b', 'qualsiasi <span class="ngc">film</span>', 420, 150, WHITE)}
      <div id="c-cl" style="position:absolute;left:390px;top:740px" data-layout-allow-overlap>{icon(CLAP, 'c', 300, 255)}</div>
      <svg id="c-x" viewBox="0 0 400 400" width="420" height="420" style="position:absolute;left:330px;top:660px" data-layout-allow-overlap><path id="c-x1" d="M40 40 L360 360" stroke="{RED}" stroke-width="30" stroke-linecap="round"/><path id="c-x2" d="M360 40 L40 360" stroke="{RED}" stroke-width="30" stroke-linecap="round"/></svg>
      {small('c-c', 'nella storia del cinema', 1220, 60, '#a1a1a6')}''', '''    blurIn(tl, "#c-b", 0.05, 0.24);
    tl.fromTo("#c-cl", { y: 300, rotation: 14, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.36, ease: "back.out(1.8)" }, 0.12);
    draw(tl, "#c-x1", «storia» - 0.12, 0.16); draw(tl, "#c-x2", «storia» + 0.02, 0.16);
    shake(tl, "#c-cl", «storia» + 0.1, 20);
    tl.fromTo("#c-c", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, «storia» - 0.1);''', ground='neon', mq='CINEMA',
    fx=[('pop', 'film', 0.12, 0.26), ('stamp', 'storia', -0.12, 0.4), ('glitch', 'storia', 0.05, 0.3)])

# 4. "In tutta la sua vita." (years flip by on a counter)
add('g04', 'intutta', 'gta', f'''      {small('d-a', 'in tutta la sua', 360, 80, '#a1a1a6')}
      {big('d-b', '<span class="ng">vita.</span>', 450, 230, WHITE, 'filter:drop-shadow(0 0 28px rgba(255,61,139,0.5))')}
      <div id="d-y" style="position:absolute;left:0;right:0;top:820px;text-align:center;font:700 150px/1 'SF Pro Display';letter-spacing:-0.04em;color:rgba(255,255,255,0.9)" data-layout-allow-overlap><span id="d-v">2009</span></div>
      {small('d-c', 'anni al cinema', 990, 50, CYAN)}''', '''    tl.fromTo("#d-b", { scale: 1.5, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, «vita» - 0.12);
    count(tl, "#d-v", 2009, 2026, 0.05, DUR - 0.1, function (v) { return String(Math.round(v)); }, "none");''', ground='neon',
    fx=[('tick', 'intutta', 0.1, 0.18), ('tick', 'intutta', 0.35, 0.18), ('tick', 'intutta', 0.6, 0.18), ('thud', 'vita', -0.12, 0.3)])

# 5. "GTA 6:" (city at night, the title)
add('g05', 'gta', 'tremiliardi', f'''      {clip('e-city', 'city.mp4', T['tremiliardi'] - T['gta'], 2.0, 0.35)}
      <div id="e-t" class="glow" style="position:absolute;left:0;right:0;top:620px;text-align:center;font:800 300px/1 'SF Pro Display';letter-spacing:-0.06em" data-layout-allow-overlap><span class="ng">GTA 6</span></div>
      <div class="nchip" id="e-c" style="left:300px;top:960px">uscito il 19 novembre</div>''', '''    tl.fromTo("#e-city-w", { scale: 1.25 }, { scale: 1.05, duration: DUR, ease: "power2.out" }, 0);
    tl.fromTo("#e-t", { scale: 2.2, opacity: 0, filter: "blur(20px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.3, ease: "expo.out" }, 0.0);
    glitch(tl, "#e-t", 0.34);
    pop(tl, "#e-c", 0.42);''', cam=False, ground='neon',
    fx=[('whoosh-cinematic', 'gta', -0.1, 0.4), ('impact-bass-1', 'gta', 0.02, 0.4), ('glitch', 'gta', 0.34, 0.3)])

# 6. "3,8 miliardi di dollari, il primo giorno." (a sales line shoots up)
add('g06', 'tremiliardi', 'scommetto', f'''      <div class="eb" style="top:300px">PRIMO GIORNO</div>
      <div id="f-n" class="glow" style="position:absolute;left:0;right:0;top:370px;text-align:center;font:800 190px/1 'SF Pro Display';letter-spacing:-0.05em" data-layout-allow-overlap><span class="ng">$ <span id="f-v">0</span></span></div>
      <div class="dc" id="f-card" style="left:90px;top:700px;width:900px;height:640px" data-layout-allow-overlap>
        <svg viewBox="0 0 900 640" width="900" height="640" style="position:absolute;left:0;top:0">
          <path d="M60 560 H840" stroke="rgba(255,255,255,0.18)" stroke-width="3"/><path d="M60 420 H840 M60 280 H840 M60 140 H840" stroke="rgba(255,255,255,0.07)" stroke-width="3"/>
          <defs><linearGradient id="f-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{PINK}" stop-opacity="0.45"/><stop offset="1" stop-color="{PINK}" stop-opacity="0"/></linearGradient><clipPath id="f-cp"><rect id="f-clip" x="0" y="0" width="900" height="640"/></clipPath></defs>
          <g clip-path="url(#f-cp)"><path d="M60 550 L300 545 L560 538 L700 520 L780 110 L840 70 V560 H60 Z" fill="url(#f-g)"/><path id="f-line" d="M60 550 L300 545 L560 538 L700 520 L780 110 L840 70" fill="none" stroke="{PINK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></g>
          <circle id="f-dot" cx="840" cy="70" r="16" fill="#fff"/>
        </svg>
        <div style="position:absolute;left:60px;top:584px;font:500 30px/1 'SF Pro Display';color:#8e8e93">preordini</div>
        <div style="position:absolute;right:60px;top:584px;font:700 30px/1 'SF Pro Display';color:{PINK}">19 nov</div>
      </div>''', '''    count(tl, "#f-v", 0, 3790000000, 0.0, 1.3, MLD, "power3.out");
    tl.fromTo("#f-card", { y: 700, rotation: 5 }, { y: 0, rotation: 0, duration: 0.4, ease: "back.out(1.4)" }, 0.05);
    tl.fromTo("#f-clip", { attr: { width: 0 } }, { attr: { width: 900 }, duration: 1.2, ease: "power2.in" }, 0.35);
    tl.fromTo("#f-dot", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 1.5);
    punch(tl, "#f-n", 1.3, 1.14);
    shake(tl, "#g06-cam", 1.5, 16);'''.replace('MLD', mld), ground='neon',
    fx=[('counter', 'tremiliardi', 0.0, 0.3), ('riser', 'tremiliardi', 0.3, 0.2), ('impact-bass-1', 'tremiliardi', 1.5, 0.4), ('cash', 'primo', 0.1, 0.4)])

# 7. "E scommetto che il merito non è del gioco." (the controller gets a red NON)
add('g07', 'scommetto', 'resta', f'''      {small('h-a', 'scommetto che il merito', 330, 70, '#a1a1a6')}
      <div id="h-pad" style="position:absolute;left:340px;top:720px" data-layout-allow-overlap>{icon(PAD, 'h', 400, 260)}</div>
      {big('h-non', 'NON', 420, 260, RED, 'filter:drop-shadow(0 0 30px rgba(255,69,58,0.6))')}
      {small('h-b', 'è del gioco.', 1090, 90, WHITE)}''', '''    tl.fromTo("#h-pad", { y: 200, opacity: 0, rotation: -10 }, { y: 0, opacity: 1, rotation: 0, duration: 0.34, ease: "back.out(1.8)" }, 0.05);
    stamp(tl, "#h-non", «merito» + 0.25, -6);
    glitch(tl, "#h-non", «merito» + 0.55);
    tl.to("#h-pad", { opacity: 0.25, scale: 0.9, duration: 0.25 }, «merito» + 0.3);
    tl.fromTo("#h-b", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.22 }, «gioco» - 0.2);
    shake(tl, "#g07-cam", «merito» + 0.5, 22);''', ground='neon', mq='NON',
    fx=[('pop', 'scommetto', 0.05, 0.24), ('stamp', 'merito', 0.25, 0.45), ('glitch', 'merito', 0.55, 0.3)])

# 8. "Resta fino alla fine," (progress bar)
add('g08', 'resta', 'trucco', f'''      {small('i-a', 'resta fino', 420, 80, '#a1a1a6')}
      {big('i-b', 'alla <span class="ng">fine.</span>', 510, 170, WHITE)}
      {progress('i', 830, PINK)}''', '''    blurIn(tl, "#i-b", 0.05, 0.24);
''' + progress_js('i', 0.15, 1.3), ground='neon',
    fx=[('swoosh', 'resta', 0.15, 0.25)])

# 9. "...questo trucco lo puoi usare anche se hai una pizzeria." (a pizza slice spins in)
add('g09', 'trucco', 'ilfilm', f'''      {small('j-a', 'questo trucco funziona', 330, 70, '#a1a1a6')}
      {big('j-b', 'anche per te', 420, 140, WHITE)}
      <div id="j-p" style="position:absolute;left:390px;top:700px" data-layout-allow-overlap>{icon(PIZZA, 'j', 300, 300)}</div>
      <div class="nchip" id="j-c" style="left:330px;top:1080px">anche in pizzeria</div>''', '''    blurIn(tl, "#j-b", «anche» - 0.2, 0.24);
    tl.fromTo("#j-p", { scale: 0, rotation: -200 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.6)" }, «pizzeria» - 0.45);
    pop(tl, "#j-c", «pizzeria» - 0.05);''', ground='neon',
    fx=[('key-press', 'trucco', 0.02, 0.14), ('whoosh-short', 'pizzeria', -0.45, 0.24), ('pop', 'pizzeria', -0.05, 0.3)])

# ================================================================ THE RECORD
# 10. "Il film che ha incassato di più al mondo..." (box-office card)
add('g10', 'ilfilm', 'circa', f'''      <div class="dc" id="k-card" style="left:120px;top:360px;width:840px;height:900px" data-layout-allow-overlap>
        <div style="position:absolute;left:60px;top:56px;font:700 34px/1 'SF Pro Display';letter-spacing:0.2em;color:{CYAN}">BOX OFFICE MONDIALE</div>
        <div style="position:absolute;left:60px;top:120px;font:700 70px/1.1 'SF Pro Display';letter-spacing:-0.03em">Il film più ricco<br>della storia</div>
        <div id="k-post" style="position:absolute;left:60px;top:330px;width:720px;height:420px;border-radius:30px;background:linear-gradient(160deg,#2a1f4a,#120c22);overflow:hidden">
          <div style="position:absolute;left:290px;top:110px" >{icon(CLAP, 'k', 150, 128)}</div>
          <div id="k-shine" style="position:absolute;top:0;bottom:0;width:200px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.18),rgba(255,255,255,0));transform:skewX(-20deg)"></div>
        </div>
        <div style="position:absolute;left:60px;top:790px;font:800 60px/1 'SF Pro Display';color:#ffd166">N. 1</div>
        <div style="position:absolute;right:60px;top:800px;font:500 40px/1 'SF Pro Display';color:#8e8e93">di sempre</div>
      </div>''', '''    tl.fromTo("#k-card", { rotationY: -70, opacity: 0, transformPerspective: 1600 }, { rotationY: 0, opacity: 1, duration: 0.5, ease: "expo.out" }, 0.0);
    tl.fromTo("#k-shine", { x: -300 }, { x: 900, duration: 0.9, ease: "power2.inOut" }, 0.5);''', ground='neon', mq='BOX OFFICE',
    fx=[('swipe', 'ilfilm', -0.1, 0.25), ('sparkle', 'mondo', -0.2, 0.2)])

# 11. "...è arrivato a circa 2,9 miliardi. In anni." (slow counter, years)
add('g11', 'circa', 'gta6b', f'''      {small('l-a', 'circa', 330, 70, '#a1a1a6')}
      <div id="l-n" style="position:absolute;left:0;right:0;top:410px;text-align:center;font:800 200px/1 'SF Pro Display';letter-spacing:-0.05em;color:{WHITE}" data-layout-allow-overlap>$ <span id="l-v">0</span></div>
      <div id="l-yrs" style="position:absolute;left:0;right:0;top:760px;text-align:center" data-layout-allow-overlap>{icon(GLASS, 'l', 180, 248)}</div>
      {big('l-b', 'in <span class="ngc">anni.</span>', 1080, 150, WHITE)}''', '''    count(tl, "#l-v", 0, 2920000000, 0.0, «inanni» - 0.1, MLD, "power1.inOut");
    tl.fromTo("#l-yrs svg", { rotation: 0 }, { rotation: 180, duration: 0.5, ease: "back.inOut(1.6)" }, «inanni» - 0.4);
    tl.fromTo("#l-b", { opacity: 0, scale: 1.4, filter: "blur(12px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }, «inanni» - 0.08);'''.replace('MLD', mld), ground='neon',
    fx=[('counter', 'circa', 0.0, 0.26), ('thud', 'inanni', -0.08, 0.3)])

# 12. "GTA 6 l'ha superato in un giorno." (race bars: the game passes the film)
add('g12', 'gta6b', 'gta5', f'''      <div class="dc" id="m-card" style="left:70px;top:420px;width:940px;height:760px" data-layout-allow-overlap>
        <div style="position:absolute;left:60px;top:70px;font:600 44px/1 'SF Pro Display';color:#a1a1a6">Il film più ricco</div>
        <div style="position:absolute;left:60px;top:140px;width:820px;height:90px;border-radius:20px;background:rgba(255,255,255,0.08)"><i id="m-b1" style="position:absolute;left:0;top:0;bottom:0;width:820px;border-radius:20px;background:linear-gradient(90deg,#5b5f7a,#9aa0c2);transform-origin:0 50%"></i></div>
        <div style="position:absolute;left:60px;top:250px;font:700 44px/1 'SF Pro Display'">2,92 mld $ · <span style="color:#a1a1a6">in anni</span></div>
        <div style="position:absolute;left:60px;top:380px;font:600 44px/1 'SF Pro Display'" class="ng">GTA 6</div>
        <div style="position:absolute;left:60px;top:450px;width:820px;height:90px;border-radius:20px;background:rgba(255,255,255,0.08)"><i id="m-b2" style="position:absolute;left:0;top:0;bottom:0;width:820px;border-radius:20px;background:linear-gradient(90deg,{PINK},{ORNG});transform-origin:0 50%;box-shadow:0 0 40px rgba(255,61,139,0.6)"></i></div>
        <div style="position:absolute;left:60px;top:560px;font:700 44px/1 'SF Pro Display'">3,79 mld $ · <span style="color:{PINK}">in 1 giorno</span></div>
      </div>
      <div class="nchip" id="m-c" style="left:360px;top:1240px">superato</div>''', '''    tl.fromTo("#m-card", { y: 900 }, { y: 0, duration: 0.36, ease: "expo.out" }, 0);
    tl.fromTo("#m-b1", { scaleX: 0 }, { scaleX: 0.77, duration: 1.4, ease: "power1.inOut" }, 0.15);
    tl.fromTo("#m-b2", { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "expo.out" }, «superato» - 0.1);
    pop(tl, "#m-c", «superato» + 0.25);
    shake(tl, "#g12-cam", «superato» + 0.2, 18);''', ground='neon',
    fx=[('rev', 'superato', -0.2, 0.55), ('impact-bass-1', 'superato', 0.2, 0.36), ('pop', 'superato', 0.25, 0.26)])

# 13. "E GTA 5, nel 2013," (a faded retro card)
add('g13', 'gta5', 'primo5', f'''      <div id="n-card" class="dc" style="left:140px;top:420px;width:800px;height:780px;background:rgba(40,40,46,0.9);filter:sepia(0.35) saturate(0.7)" data-layout-allow-overlap>
        <div style="position:absolute;left:0;right:0;top:110px;text-align:center;font:800 210px/1 'SF Pro Display';letter-spacing:-0.05em;color:#d9d4c7">GTA 5</div>
        <div id="n-cal" style="position:absolute;left:210px;top:400px;width:380px;height:260px;border-radius:30px;background:#f2efe6;overflow:hidden">
          <div style="height:70px;background:#c9482f"></div>
          <div id="n-y" style="position:absolute;left:0;right:0;top:100px;text-align:center;font:800 120px/1 'SF Pro Display';color:#2b2620">2026</div>
        </div>
      </div>''', '''    tl.fromTo("#n-card", { scale: 0.6, opacity: 0, rotation: -6 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.36, ease: "back.out(1.6)" }, 0);
    count(tl, "#n-y", 2026, 2013, 0.3, «nel2013» - 0.25, function (v) { return String(Math.round(v)); }, "power2.out");
    punch(tl, "#n-cal", «nel2013» + 0.1, 1.12);''', ground='neon', mq='2013',
    fx=[('whoosh-short', 'gta5', 0.0, 0.2), ('tick', 'gta5', 0.4, 0.16), ('tick', 'gta5', 0.6, 0.16), ('thud', 'nel2013', 0.1, 0.28)])

# 14. "...il primo giorno aveva fatto 800 milioni," (bars: 0,8 against 3,79)
add('g14', 'primo5', 'quasi', f'''      <div class="eb" style="top:330px">PRIMO GIORNO</div>
      <div style="position:absolute;left:150px;top:1300px;width:780px;height:4px;background:rgba(255,255,255,0.3)" data-layout-allow-overlap></div>
      <div id="o-b1" style="position:absolute;left:230px;top:1180px;width:220px;height:120px;border-radius:24px 24px 0 0;background:#8a8f9e;transform-origin:50% 100%" data-layout-allow-overlap></div>
      <div id="o-b2" style="position:absolute;left:630px;top:560px;width:220px;height:740px;border-radius:24px 24px 0 0;background:linear-gradient(180deg,{PINK},{ORNG});transform-origin:50% 100%;box-shadow:0 0 50px rgba(255,61,139,0.5)" data-layout-allow-overlap></div>
      <div id="o-l1" style="position:absolute;left:180px;top:1080px;width:320px;text-align:center;font:800 70px/1 'SF Pro Display'" data-layout-allow-overlap>0,8 mld</div>
      <div id="o-l2" style="position:absolute;left:580px;top:460px;width:320px;text-align:center;font:800 70px/1 'SF Pro Display'" data-layout-allow-overlap><span class="ng">3,79 mld</span></div>
      <div style="position:absolute;left:180px;top:1330px;width:320px;text-align:center;font:600 46px/1 'SF Pro Display';color:#a1a1a6" data-layout-allow-overlap>GTA 5 · 2013</div>
      <div style="position:absolute;left:580px;top:1330px;width:320px;text-align:center;font:600 46px/1 'SF Pro Display';color:#a1a1a6" data-layout-allow-overlap>GTA 6 · 2026</div>''', '''    tl.fromTo("#o-b1", { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: "expo.out" }, 0.05);
    tl.fromTo("#o-l1", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, 0.3);
    tl.fromTo("#o-b2", { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "expo.out" }, «ottocento» - 0.3);
    tl.fromTo("#o-l2", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, «ottocento»);''', ground='neon',
    fx=[('pop', 'primo5', 0.05, 0.22), ('riser', 'ottocento', -0.6, 0.15), ('impact-bass-1', 'ottocento', -0.05, 0.3)])

# 15. "...quasi cinque volte meno." (x4,7)
add('g15', 'quasi', 'cosa', f'''      {small('p-a', 'quasi', 450, 80, '#a1a1a6')}
      {big('p-b', '<span class="ng">×4,7</span>', 560, 330, WHITE, 'filter:drop-shadow(0 0 40px rgba(255,61,139,0.55))')}
      {small('p-c', 'in un giorno solo', 960, 66, WHITE)}''', '''    tl.fromTo("#p-b", { scale: 3, opacity: 0, filter: "blur(20px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.3, ease: "expo.out" }, «cinque» - 0.2);
    tl.fromTo("#p-c", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, «cinque» + 0.2);
    shake(tl, "#g15-cam", «cinque» + 0.1, 24);''', ground='neon', mq='×4,7',
    fx=[('bass-drop', 'cinque', -0.2, 0.4), ('whoosh-short', 'cinque', -0.3, 0.2)])

# ================================================================ THE WAIT
# 16. "Cosa è cambiato?"
add('g16', 'cosa', 'attesa', f'''      {big('q-a', 'cosa è', 520, 150, WHITE)}
      {big('q-b', '<span class="ngc">cambiato?</span>', 690, 170, WHITE)}''', '''    tl.fromTo("#q-a", { x: -400, opacity: 0 }, { x: 0, opacity: 1, duration: 0.24, ease: "expo.out" }, 0.02);
    tl.fromTo("#q-b", { x: 400, opacity: 0 }, { x: 0, opacity: 1, duration: 0.24, ease: "expo.out" }, 0.18);
    glitch(tl, "#q-b", 0.55);''', ground='neon',
    fx=[('whoosh-short', 'cosa', 0.0, 0.2), ('glitch', 'cosa', 0.55, 0.3)])

# 17. "L'attesa." (the hourglass turns, the word lands)
add('g17', 'attesa', 'tredici', f'''      <div id="r-g" style="position:absolute;left:450px;top:340px" data-layout-allow-overlap>{icon(GLASS, 'r', 180, 248)}</div>
      {big('r-b', "<span class='ng'>L&#39;attesa.</span>", 680, 230, WHITE, 'filter:drop-shadow(0 0 40px rgba(255,61,139,0.55))')}''', '''    tl.fromTo("#r-g svg", { rotation: -180 }, { rotation: 0, duration: 0.5, ease: "back.out(1.6)" }, 0.0);
    tl.fromTo("#r-b", { scale: 1.8, opacity: 0, filter: "blur(18px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.3, ease: "expo.out" }, 0.05);
    shake(tl, "#g17-cam", 0.3, 20);''', ground='neon', mq='ATTESA',
    fx=[('impact-bass-1', 'attesa', 0.05, 0.4), ('whoosh-cinematic', 'attesa', -0.2, 0.3)])

# 18. "13 anni tra un capitolo e l'altro." (timeline 2013 - 2026)
add('g18', 'tredici', 'trentadue', f'''      {big('s-n', '<span id="s-v">0</span> anni', 430, 200, WHITE)}
      <div style="position:absolute;left:140px;top:860px;width:800px;height:8px;border-radius:4px;background:rgba(255,255,255,0.15)" data-layout-allow-overlap><i id="s-fill" style="position:absolute;left:0;top:0;bottom:0;width:800px;border-radius:4px;background:linear-gradient(90deg,{CYAN},{PINK});transform-origin:0 50%"></i></div>
      <div id="s-d1" style="position:absolute;left:116px;top:840px;width:48px;height:48px;border-radius:50%;background:{CYAN}" data-layout-allow-overlap></div>
      <div id="s-d2" style="position:absolute;left:916px;top:840px;width:48px;height:48px;border-radius:50%;background:{PINK};box-shadow:0 0 30px {PINK}" data-layout-allow-overlap></div>
      <div style="position:absolute;left:60px;top:930px;width:200px;text-align:center;font:700 54px/1 'SF Pro Display';color:#a1a1a6" data-layout-allow-overlap>2013</div>
      <div style="position:absolute;left:820px;top:930px;width:240px;text-align:center;font:700 54px/1 'SF Pro Display';color:#fff" data-layout-allow-overlap>2026</div>''', '''    count(tl, "#s-v", 0, 13, 0.0, 0.9, function (v) { return String(Math.round(v)); }, "power2.out");
    tl.fromTo("#s-fill", { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power2.out" }, 0.0);
    tl.fromTo("#s-d2", { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 0.85);''', ground='neon',
    fx=[('tick', 'tredici', 0.1, 0.16), ('tick', 'tredici', 0.3, 0.16), ('tick', 'tredici', 0.5, 0.16), ('ding', 'tredici', 0.85, 0.24)])

# 19. "E 32 milioni e mezzo di persone..." (the crowd with phones up, the counter)
add('g19', 'trentadue', 'pagato', f'''      {clip('t-crowd', 'crowd.mp4', T['pagato'] - T['trentadue'], 1.0, 0.35)}
      <div id="t-n" class="glow" style="position:absolute;left:0;right:0;top:430px;text-align:center;font:800 170px/1 'SF Pro Display';letter-spacing:-0.05em" data-layout-allow-overlap><span class="ng" id="t-v">0</span></div>
      {small('t-a', 'persone', 620, 80, WHITE)}''', '''    tl.fromTo("#t-crowd-w", { scale: 1.3 }, { scale: 1.08, duration: DUR, ease: "power2.out" }, 0);
    count(tl, "#t-v", 0, 32500000, 0.0, 1.0, MIL, "power3.out");
    tl.fromTo("#t-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.24 }, «persone» - 0.1);'''.replace('MIL', mil), cam=False, ground='neon',
    fx=[('crowd', 'trentadue', 0.0, 0.35), ('counter', 'trentadue', 0.0, 0.26)])

# 20. "...l'hanno pagato prima ancora di poterci giocare." (pre-order confirmation sheet with a lock)
add('g20', 'pagato', 'tu', f'''      <div class="dc" id="u-sheet" style="left:90px;top:400px;width:900px;height:860px;background:#1c1c1e" data-layout-allow-overlap>
        <div style="position:absolute;left:0;right:0;top:70px;text-align:center" id="u-ok">{icon(CHECK, 'u', 150, 150)}</div>
        <div style="position:absolute;left:0;right:0;top:260px;text-align:center;font:700 64px/1.1 'SF Pro Display'">Preordine confermato</div>
        <div style="position:absolute;left:70px;right:70px;top:380px;height:2px;background:rgba(255,255,255,0.12)"></div>
        <div style="position:absolute;left:70px;top:430px;font:500 44px/1 'SF Pro Display';color:#8e8e93">Pagato</div><div style="position:absolute;right:70px;top:430px;font:700 44px/1 'SF Pro Display'">oggi</div>
        <div style="position:absolute;left:70px;top:520px;font:500 44px/1 'SF Pro Display';color:#8e8e93">Puoi giocare</div><div style="position:absolute;right:70px;top:520px;font:700 44px/1 'SF Pro Display';color:{PINK}">tra mesi</div>
        <div id="u-lock" style="position:absolute;left:390px;top:630px">{icon(LOCK, 'u2', 110, 138)}</div>
      </div>''', '''    tl.fromTo("#u-sheet", { y: 1300 }, { y: 0, duration: 0.42, ease: "expo.out" }, 0.0);
    tl.fromTo("#u-ok", { scale: 0 }, { scale: 1, duration: 0.36, ease: "back.out(3)" }, 0.3);
    tl.fromTo("#u-lock", { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.36, ease: "back.out(2.6)" }, «giocare» - 0.3);
    shake(tl, "#u-lock", «giocare», 16);''', ground='neon',
    fx=[('swipe', 'pagato', -0.1, 0.24), ('ding', 'pagato', 0.3, 0.28), ('click', 'giocare', -0.3, 0.4)])

# ================================================================ THE QUESTION
# 21. "Tu ci hai già giocato? O aspetti che cali di prezzo?" (two big answer buttons)
add('g21', 'tu', 'scrivi', f'''      {small('v-a', 'e tu?', 330, 80, '#a1a1a6')}
      <div id="v-y" style="position:absolute;left:110px;top:520px;width:860px;height:260px;border-radius:60px;background:linear-gradient(100deg,{PINK},{ORNG});color:#0b0614;font:800 140px/260px 'SF Pro Display';letter-spacing:-0.04em;text-align:center" data-layout-allow-overlap>GIÀ</div>
      <div id="v-n" style="position:absolute;left:110px;top:840px;width:860px;height:260px;border-radius:60px;background:rgba(255,255,255,0.08);box-shadow:inset 0 0 0 5px {CYAN};color:{CYAN};font:800 130px/260px 'SF Pro Display';letter-spacing:-0.04em;text-align:center" data-layout-allow-overlap>ASPETTO</div>''', '''    tl.fromTo("#v-y", { x: -1100 }, { x: 0, duration: 0.34, ease: "expo.out" }, «giocato» - 0.3);
    tl.fromTo("#v-n", { x: 1100 }, { x: 0, duration: 0.34, ease: "expo.out" }, «aspetti» - 0.3);
    tl.fromTo("#v-y", { scale: 1 }, { scale: 1.06, duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }, «giocato»);
    tl.fromTo("#v-n", { scale: 1 }, { scale: 1.06, duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }, «aspetti» + 0.3);''', ground='neon',
    fx=[('whoosh-short', 'giocato', -0.3, 0.22), ('pop', 'giocato', 0.0, 0.26), ('whoosh-short', 'aspetti', -0.3, 0.22), ('pop', 'aspetti', 0.3, 0.26)])

# 22. "Scrivi GIÀ o ASPETTO." (comments pour in)
def cm(k, word, col): return (f'<div class="cm" id="w-c{k}" style="top:{460 + k * 150}px"><i style="background:linear-gradient(135deg,{["#feda75","#4f5bd5","#d62976","#30d158","#0a84ff","#ff9f43"][k % 6]},#2b2b2d)"></i>'
                              f'<div><small>utente_{k + 1}</small><b style="color:{col}">{word}</b></div></div>')
COMMENTS = ''.join(cm(k, w, PINK if w == 'GIÀ' else CYAN) for k, w in enumerate(['GIÀ', 'ASPETTO', 'GIÀ', 'GIÀ', 'ASPETTO', 'GIÀ']))
add('g22', 'scrivi', 'lezione', f'''      {small('w-a', 'scrivi nei commenti', 300, 66, '#a1a1a6')}
      {COMMENTS}''', '''    tl.fromTo(".cm", { opacity: 0, x: 120 }, { opacity: 1, x: 0, duration: 0.24, ease: "back.out(1.6)", stagger: 0.2 }, 0.1);''', '''
    .cm { position: absolute; left: 110px; width: 860px; height: 124px; display: flex; align-items: center; gap: 28px; opacity: 0; }
    .cm i { display: block; width: 96px; height: 96px; border-radius: 50%; flex: none; }
    .cm small { display: block; font: 600 32px/1 "SF Pro Display"; color: #8e8e93; }
    .cm b { display: block; font: 800 62px/1.1 "SF Pro Display"; letter-spacing: -0.02em; margin-top: 6px; }''', ground='neon',
    fx=[('notif', 'scrivi', 0.1, 0.18), ('notif', 'scrivi', 0.5, 0.16), ('notif', 'scrivi', 0.9, 0.16), ('notif', 'scrivi', 1.3, 0.16)])

# ================================================================ THE LESSON
# 23. "La lezione. La gente non compra quello che vede subito."
add('g23', 'lezione', 'compra', f'''      <div class="eb" id="x-e" style="top:360px">LA LEZIONE</div>
      {small('x-a', 'la gente non compra', 470, 80, '#a1a1a6')}
      {big('x-b', 'quello che vede <span style="position:relative;display:inline-block">subito<i id="x-s" style="position:absolute;left:-8px;right:-8px;top:52%;height:16px;border-radius:8px;background:{RED};transform-origin:0 50%"></i></span>', 590, 98, WHITE)}''', '''    tl.fromTo("#x-e", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out" }, 0.0);
    tl.fromTo("#x-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.22 }, «gente» - 0.1);
    blurIn(tl, "#x-b", «gente» + 0.25, 0.26);
    tl.fromTo("#x-s", { scaleX: 0 }, { scaleX: 1, duration: 0.2, ease: "power2.out" }, «subito» + 0.1);''', ground='neon',
    fx=[('key-press', 'lezione', 0.0, 0.16), ('swoosh', 'subito', 0.05, 0.22)])

# 24. "Compra quello che ha aspettato."
add('g24', 'compra', 'annuncia', f'''      {small('y-a', 'compra quello che ha', 470, 80, '#a1a1a6')}
      {big('y-b', '<span class="ng">aspettato.</span>', 570, 190, WHITE, 'filter:drop-shadow(0 0 36px rgba(255,61,139,0.55))')}''', '''    tl.fromTo("#y-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.22 }, 0.02);
    tl.fromTo("#y-b", { scale: 1.6, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.3, ease: "expo.out" }, «aspettato» - 0.12);
    shake(tl, "#g24-cam", «aspettato» + 0.1, 16);''', ground='neon', mq='ATTESA',
    fx=[('impact-bass-1', 'aspettato', -0.1, 0.36)])

# 25. "Annuncia prima di vendere. Dai una data. Fai vedere un pezzo." (a three-week calendar fills in)
def wk(k, n, title, sub): return (f'<div class="wk" id="z-w{k}" style="top:{560 + k * 230}px"><div class="wn">{n}</div><div><b>{title}</b><small>{sub}</small></div></div>')
add('g25', 'annuncia', 'zitto', f'''      <div class="eb" style="top:330px">IL TUO LANCIO</div>
      {big('z-h', 'in 3 settimane', 390, 100, WHITE)}
      {wk(0, '1', 'Annuncia', 'prima di vendere')}{wk(1, '2', 'Dai una data', 'il giorno in cui esce')}{wk(2, '3', 'Fai vedere un pezzo', 'non tutto')}''', '''    blurIn(tl, "#z-h", 0.02, 0.24);
    tl.fromTo("#z-w0", { opacity: 0, x: -300 }, { opacity: 1, x: 0, duration: 0.3, ease: "back.out(1.6)" }, 0.1);
    tl.fromTo("#z-w1", { opacity: 0, x: -300 }, { opacity: 1, x: 0, duration: 0.3, ease: "back.out(1.6)" }, «data» - 0.4);
    tl.fromTo("#z-w2", { opacity: 0, x: -300 }, { opacity: 1, x: 0, duration: 0.3, ease: "back.out(1.6)" }, «pezzo» - 0.5);''', '''
    .wk { position: absolute; left: 100px; width: 880px; height: 200px; border-radius: 40px; background: rgba(28,22,44,0.92); box-shadow: 0 0 0 2px rgba(255,255,255,0.08); display: flex; align-items: center; gap: 36px; padding: 0 44px; opacity: 0; }
    .wn { width: 110px; height: 110px; border-radius: 30px; background: linear-gradient(135deg,#ff3d8b,#ff9f43); color: #0b0614; font: 800 64px/110px "SF Pro Display"; text-align: center; flex: none; }
    .wk b { display: block; font: 700 58px/1.1 "SF Pro Display"; letter-spacing: -0.02em; }
    .wk small { display: block; font: 500 36px/1.2 "SF Pro Display"; color: #a1a1a6; margin-top: 6px; }''', ground='neon',
    fx=[('pop', 'annuncia', 0.1, 0.26), ('pop', 'data', -0.4, 0.26), ('pop', 'pezzo', -0.5, 0.26), ('ding', 'pezzo', -0.2, 0.2)])

# 26. "Poi stai zitto. E lascia parlare loro." (mute icon, then a flood of chat bubbles)
BUB = [('quando esce?', 120, 520, '#2c2c2e'), ('l\'hai visto?? 😱'.replace(' 😱', ''), 520, 640, '#0a84ff'), ('io lo prendo subito', 160, 780, '#2c2c2e'), ('mi mandi il link?', 470, 920, '#0a84ff'), ('non vedo l\'ora', 140, 1060, '#2c2c2e'), ('ci vediamo lì', 520, 1200, '#0a84ff')]
bubbles = ''.join(f'<div class="bb" style="left:{x}px;top:{y}px;background:{c}">{t}</div>' for t, x, y, c in BUB)
add('g26', 'zitto', 'cta', f'''      <div id="aa-m" style="position:absolute;left:390px;top:620px" data-layout-allow-overlap>{icon(MUTE, 'aa', 300, 240)}</div>
      {big('aa-a', 'stai zitto.', 340, 120, WHITE)}
      {bubbles}''', '''    tl.fromTo("#aa-m", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2.4)" }, 0.0);
    draw(tl, "#aa-x", 0.25, 0.2);
    blurIn(tl, "#aa-a", 0.02, 0.22);
    tl.to("#aa-m, #aa-a", { opacity: 0, scale: 0.8, duration: 0.15 }, «lascia» - 0.05);
    tl.fromTo(".bb", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.24, ease: "back.out(2.2)", stagger: 0.1 }, «lascia»);''', '''
    .bb { position: absolute; padding: 26px 40px; border-radius: 48px; font: 600 50px/1.1 "SF Pro Display"; color: #fff; white-space: nowrap; opacity: 0; transform-origin: 50% 100%; }''', ground='neon',
    fx=[('click', 'zitto', 0.25, 0.4), ('notif', 'lascia', 0.0, 0.2), ('notif', 'lascia', 0.2, 0.16), ('notif', 'lascia', 0.4, 0.16)])

# ================================================================ KEYWORD + LOOP
# 27. "Scrivi LANCIO nei commenti" (comment bar + dark iOS keyboard)
add('g27', 'cta', 'mando', f'''      {small('bb-a', 'scrivi nei commenti', 330, 66, '#a1a1a6')}
      {big('bb-w', '<span class="ng">LANCIO</span>', 420, 200, WHITE, 'filter:drop-shadow(0 0 36px rgba(255,61,139,0.55))')}
      {commentbar('bb', 'LANCIO', 760)}
      {keyboard('bb', 1230, dark=True)}''', '''    tl.fromTo("#bb-kb", { y: 700 }, { y: 0, duration: 0.34, ease: "expo.out" }, 0.0);
    tl.fromTo("#bb-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, 0.05);
    tl.fromTo("#bb-w", { scale: 1.5, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.28, ease: "expo.out" }, «lancio» - 0.1);
''' + commentbar_js('bb', '«lancio»', 0.08) + keys_js('bb', 'LANCIO', '«lancio»', 0.08) + '''    tl.fromTo("#bb-pub", { scale: 1 }, { scale: 1.25, duration: 0.1, yoyo: true, repeat: 1 }, «lancio» + 0.75);''', KBCSS, ground='neon',
    fx=[('swipe', 'cta', -0.15, 0.24), ('typing', 'lancio', -0.05, 0.24), ('typing', 'lancio', 0.25, 0.2), ('click', 'lancio', 0.75, 0.4)])

# 28. "...e ti mando il piano di lancio in tre settimane, pronto da copiare." (the DM arrives)
add('g28', 'mando', 'perchefine', f'''      {small('cc-a', 'ti arriva in DM', 330, 66, '#a1a1a6')}
      {dmcard('cc', 470, 'Piano di lancio', '3 settimane · pronto da copiare', icon=PINK)}
      <div class="nchip" id="cc-c" style="left:370px;top:1120px">gratis</div>''', '''    tl.fromTo("#cc-dm", { y: -900, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.3)" }, 0.0);
    tl.fromTo("#cc-doc", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, «piano» - 0.1);
    pop(tl, "#cc-c", «pronto»);''', ground='neon',
    fx=[('notif', 'mando', 0.0, 0.26), ('pop', 'piano', -0.1, 0.26), ('sparkle', 'pronto', 0.0, 0.2)])

# 29. loop: "Perché è così che..." -> "In 24 ore un videogioco..." (the car seconds just before the first frame, the title lands in its first-frame pose)
D29 = T['END'] - T['perchefine']
add('g29', 'perchefine', 'END', f'''      {clip('dd-car', 'car.mp4', D29, CAR0 - D29, 0.25, '50% 60%')}
      {small('dd-a', 'perché è così che…', 420, 80, WHITE)}
      {TITLE.replace('@', 'dd')}''', '''    tl.fromTo("#dd-car-w", { scale: 1.05 }, { scale: 1.15, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#dd-a", { opacity: 0, filter: "blur(10px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2 }, 0.04);
    gsap.set("#dd-t", { opacity: 0, scale: 1.6 });
    tl.to("#dd-a", { opacity: 0, duration: 0.12 }, DUR - 0.32);
    tl.to("#dd-t", { opacity: 1, scale: TS0, duration: 0.26, ease: "power2.in" }, DUR - 0.28);'''.replace('TS0', str(TS0)), cam=False, ground='neon',
    fx=[('riser', 'perchefine', -0.2, 0.14), ('whoosh-short', 'perchefine', 0.6, 0.2)])
