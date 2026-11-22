# apex-nike-slogan: "Lo slogan più famoso della Nike viene dalle ultime parole di un condannato a morte."
# Classic Apex storytelling reel, black and white with a red accent: the origin of "Just Do It", what makes it work,
# a one-word comment question, the lesson for whoever sells, the keyword (SLOGAN) and a loop line. Brand named in plain text only, no logo.
# Facts: Dan Wieden (Wieden+Kennedy) said the line came from Gary Gilmore's last words "Let's do it" (executed in Utah on 17 January 1977);
# the slogan launched in 1988 with a spot of Walt Stack, 80, running across the Golden Gate Bridge; Nike's sales went from
# $877 million to $9.2 billion between 1988 and 1998.
import sys
sys.path.insert(0, '.'); sys.path.insert(0, '../../apex-kit')
from kit import *
from ui import *
from times import T
BED = 0.07; ROOT = '#000000'
W = '#ffffff'; K = '#000000'; RED = '#ff3b30'; GREY = '#8e8e93'; BR = '#c0362c'
THEME = f'''
    .dark .bgfx i:nth-child(1) {{ background: radial-gradient(closest-side, rgba(255,255,255,0.10), rgba(255,255,255,0)); }}
    .dark .bgfx i:nth-child(2) {{ background: radial-gradient(closest-side, rgba(255,59,48,0.16), rgba(255,59,48,0)); }}
    .nk {{ font-family: "SF Pro Display"; font-weight: 700; text-transform: uppercase; letter-spacing: -0.035em; transform: skewX(-8deg); }}
    .tw {{ font-family: "SF Pro Display"; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }}
'''
R = Reel(T, THEME)
add = R.add
def nk(i, html, top, size, color=W, extra=''):
    return f'<div id="{i}" class="nk" style="position:absolute;left:0;right:0;top:{top}px;text-align:center;font-size:{size}px;line-height:0.9;color:{color};{extra}" data-layout-allow-overlap>{html}</div>'

# ================================================================ HOOK
HOOK = (f'<div id="@-y" class="tw" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:330px;text-align:center;font-size:48px;color:{GREY}">Nike · 1988</div>'
        + nk('@-t', 'Just<br>Do<br>It.', 470, 330, W))
# 1. "Lo slogan più famoso della Nike viene dalle ultime parole di un condannato a morte."
add('n01', 'start', 'tre', f'''      {HOOK.replace('@', 'a')}
      <div id="a-s" class="tw" data-layout-allow-overlap style="position:absolute;left:120px;top:1420px;width:840px;padding:30px 0;border:10px solid {RED};border-radius:20px;text-align:center;font-size:62px;font-weight:700;color:{RED};transform:rotate(-6deg);opacity:0">ultime parole di un<br>condannato a morte</div>''', '''    tl.fromTo("#a-t", { scale: 1.06 }, { scale: 1, duration: 0.5, ease: "expo.out" }, 0);
    tl.fromTo("#a-t", { y: 0 }, { y: -30, duration: DUR, ease: "none" }, 0);
    stamp(tl, "#a-s", «condannato» - 0.1, -6);
    tl.to("#a-t", { color: "#ff3b30", duration: 0.1 }, «morte»);
    tl.to("#a-t", { color: "#ffffff", duration: 0.1 }, «morte» + 0.25);''', ground='dark', cam=False,
    fx=[('whoosh', 'start', 0.0, 0.3), ('thud', 'start', 0.05, 0.3), ('stamp', 'condannato', -0.1, 0.45), ('glitch', 'morte', 0.0, 0.22)])

# 2. "Tre parole. Just Do It." (white ground, the three words slam in)
add('n02', 'tre', 'resta', f'''      {nk('b-n', '3 parole', 360, 150, K)}
      {nk('b-1', 'Just', 640, 300, K)}
      {nk('b-2', 'Do', 900, 300, K)}
      {nk('b-3', 'It.', 1160, 300, RED)}''', '''    tl.fromTo("#b-n", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.22, ease: "expo.out" }, 0.0);
    tl.fromTo("#b-1", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power4.in" }, «just» - 0.16);
    tl.fromTo("#b-2", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power4.in" }, «just» + 0.23);
    tl.fromTo("#b-3", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power4.in" }, «just» + 0.43);
    shake(tl, "#n02-cam", «just» + 0.6, 16);''', ground='white',
    fx=[('pop', 'tre', 0.0, 0.2), ('thud', 'just', 0.0, 0.3), ('thud', 'just', 0.39, 0.3), ('thud', 'just', 0.59, 0.34)])

# 3. "Resta fino alla fine, perché il motivo per cui funziona lo puoi usare anche tu."
add('n03', 'resta', 'd17', f'''      {small('c-a', 'resta fino', 420, 80, GREY)}
      {big('c-b', 'alla <span style="color:{RED}">fine.</span>', 510, 170, W)}
      {progress('c', 830, RED, dark=True)}
      <div class="chip" id="c-c" style="left:290px;top:1060px;background:{W};color:{K}">lo puoi usare anche tu</div>''', '''    blurIn(tl, "#c-b", 0.05, 0.24);
''' + progress_js('c', 0.15, 3.0) + '''    pop(tl, "#c-c", «funziona» + 0.3);''', ground='dark',
    fx=[('swoosh', 'resta', 0.15, 0.25), ('pop', 'funziona', 0.3, 0.22)])

# ================================================================ THE STORY
# 4. "17 gennaio 1977." (typewriter date)
add('n04', 'd17', 'utah', f'''      <div class="tw" id="d-1" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:560px;text-align:center;font-size:250px;font-weight:700;color:{W}">17</div>
      <div class="tw" id="d-2" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:850px;text-align:center;font-size:120px;color:{W}">gennaio</div>
      <div class="tw" id="d-3" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:1010px;text-align:center;font-size:200px;font-weight:700;color:{RED}">1977</div>''', '''    tl.fromTo("#d-1", { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.0);
    tl.fromTo("#d-2", { opacity: 0 }, { opacity: 1, duration: 0.05 }, «gennaio» - 0.05);
    tl.fromTo("#d-3", { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.12 }, «y1977» - 0.05);''', ground='dark', mq='1977',
    fx=[('key-press', 'd17', 0.0, 0.3), ('key-press', 'gennaio', -0.05, 0.3), ('key-press', 'y1977', -0.05, 0.3), ('thud', 'y1977', 0.0, 0.24)])

# 5. "Utah, Stati Uniti. Gary Gilmore sta per essere giustiziato." (the state on a map, then the case file)
UT = 'M0 0 H300 V110 H430 V560 H0 Z'
add('n05', 'utah', 'ultime2', f'''      <svg viewBox="-40 -40 520 640" width="520" height="640" style="position:absolute;left:280px;top:420px" data-layout-allow-overlap>
        <path id="e-ut" d="{UT}" fill="rgba(255,255,255,0.06)" stroke="{W}" stroke-width="10" stroke-linejoin="round"/>
        <g id="e-pin"><circle cx="200" cy="240" r="34" fill="{RED}"/><path d="M174 258 L200 320 L226 258 Z" fill="{RED}"/><circle cx="200" cy="240" r="12" fill="{K}"/></g>
      </svg>
      <div class="tw" id="e-l" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:1120px;text-align:center;font-size:64px;font-weight:700;color:{W}">Utah · Stati Uniti</div>
      <div class="card" id="e-f" style="left:110px;top:640px;width:860px;height:560px;border-radius:24px;background:#efe6d2" data-layout-allow-overlap>
        <div class="tw" style="position:absolute;left:56px;top:56px;font-size:34px;color:#6b5f48">fascicolo · 1977</div>
        <div class="nk" style="position:absolute;left:56px;top:140px;font-size:120px;line-height:0.95;color:{K};transform:none">Gary<br>Gilmore</div>
        <div id="e-st" class="tw" style="position:absolute;left:56px;top:420px;padding:18px 28px;border:7px solid {RED};border-radius:12px;font-size:44px;font-weight:700;color:{RED};transform:rotate(-4deg)">condannato a morte</div>
      </div>''', '''    draw(tl, "#e-ut", 0.0, 0.45);
    tl.fromTo("#e-pin", { y: -500, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "bounce.out" }, 0.3);
    tl.fromTo("#e-l", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.22 }, 0.35);
    tl.fromTo("#e-f", { y: 1300, rotation: 5 }, { y: 0, rotation: -2, duration: 0.42, ease: "expo.out" }, «gary» - 0.25);
    stamp(tl, "#e-st", «giustiziato» - 0.1, -4);''', ground='dark',
    fx=[('scan', 'utah', 0.0, 0.16), ('thud', 'utah', 0.45, 0.26), ('swipe', 'gary', -0.25, 0.24), ('stamp', 'giustiziato', -0.1, 0.42)])

# 6. "Le sue ultime parole sono: Let's do it. Facciamolo."
add('n06', 'ultime2', 'undici', f'''      {small('f-a', 'le sue ultime parole', 400, 66, GREY)}
      <div id="f-q" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:560px;text-align:center;font:700 170px/1 {SF};letter-spacing:-0.04em;color:{W}">&ldquo;Let&rsquo;s<br>do it.&rdquo;</div>
      {big('f-b', 'Facciamolo.', 1000, 110, RED)}''', '''    tl.fromTo("#f-a", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.0);
    tl.fromTo("#f-q", { opacity: 0, filter: "blur(20px)", scale: 1.15 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.5, ease: "power2.out" }, «lets» - 0.3);
    tl.fromTo("#f-b", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.24 }, «facciamolo» - 0.1);''', ground='dark',
    fx=[('whoosh-cinematic', 'lets', -0.3, 0.2), ('pop', 'facciamolo', -0.1, 0.2)])

# 7. "Undici anni dopo..." (1977 -> 1988)
add('n07', 'undici', 'dan', f'''      {big('g-v', '<span id="g-y">1977</span>', 640, 260, W)}
      <div class="chip" id="g-c" style="left:370px;top:960px;background:{RED};font-size:56px">+11 anni</div>''', '''    count(tl, "#g-y", 1977, 1988, 0.1, 0.8, function (v) { return String(Math.round(v)); }, "power2.inOut");
    pop(tl, "#g-c", «dopo» - 0.1);
    punch(tl, "#g-v", 0.95, 1.08);''', ground='dark',
    fx=[('counter', 'undici', 0.1, 0.3), ('pop', 'dopo', -0.1, 0.22), ('ding', 'undici', 0.95, 0.2)])

# 8. "...un pubblicitario, Dan Wieden, deve inventare uno slogan per la Nike." (the ad man and an empty page)
add('n08', 'dan', 'ricorda', f'''      <div class="card" id="h-c" style="left:110px;top:330px;width:860px;height:300px;border-radius:40px" data-layout-allow-overlap>
        <div style="position:absolute;left:50px;top:50px;width:200px;height:200px;border-radius:50%;background:{K};color:{W};font:700 80px/200px {SF};text-align:center">DW</div>
        <div style="position:absolute;left:290px;top:78px;font:700 76px/1 {SF};letter-spacing:-0.03em;color:{K}">Dan Wieden</div>
        <div style="position:absolute;left:292px;top:172px;font:600 42px/1 {SF};color:{GREY}">pubblicitario</div>
      </div>
      <div id="h-p" data-layout-allow-overlap style="position:absolute;left:110px;top:720px;width:860px;height:640px;border-radius:30px;background:#f5f5f7;box-shadow:0 40px 100px -30px rgba(0,0,0,0.5)">
        <div class="tw" style="position:absolute;left:56px;top:56px;font-size:34px;color:{GREY}">slogan per Nike</div>
        <div id="h-cur" style="position:absolute;left:56px;top:150px;width:10px;height:120px;background:{K}"></div>
      </div>''', '''    tl.fromTo("#h-c", { y: -700, opacity: 0 }, { y: 0, opacity: 1, duration: 0.36, ease: "expo.out" }, 0.0);
    tl.fromTo("#h-p", { y: 1100 }, { y: 0, duration: 0.42, ease: "expo.out" }, «inventare» - 0.3);
    tl.fromTo("#h-cur", { opacity: 1 }, { opacity: 0, duration: 0.01, repeat: 5, yoyo: true, repeatDelay: 0.25 }, «inventare» + 0.2);''', ground='dark',
    fx=[('swipe', 'dan', 0.0, 0.24), ('swoosh', 'inventare', -0.3, 0.22), ('tick', 'nike2', 0.0, 0.2)])

# 9. "Si ricorda quella frase. La cambia appena: Just Do It." (Let's -> Just)
add('n09', 'ricorda', 'fallo', f'''      {small('i-a', 'si ricorda quella frase', 380, 64, GREY)}
      <div id="i-p" data-layout-allow-overlap style="position:absolute;left:110px;top:560px;width:860px;height:720px;border-radius:30px;background:#f5f5f7">
        <div id="i-old" style="position:absolute;left:0;right:0;top:330px;text-align:center;font:700 150px/1 {SF};letter-spacing:-0.04em;color:{K}"><span id="i-l" style="position:relative;display:inline-block">Let&rsquo;s<i id="i-x" style="position:absolute;left:-10px;right:-10px;top:52%;height:16px;background:{RED};display:block;transform-origin:0 50%"></i></span> do it.</div>
        <div id="i-new" class="nk" style="position:absolute;left:60px;top:130px;font-size:170px;color:{RED};transform:skewX(-8deg) rotate(-4deg)">Just</div>
      </div>''', '''    tl.fromTo("#i-p", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "expo.out" }, 0.0);
    tl.fromTo("#i-x", { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: "power2.out" }, «cambia» - 0.05);
    tl.to("#i-l", { opacity: 0.35, duration: 0.2 }, «cambia» + 0.2);
    tl.fromTo("#i-new", { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.18, ease: "power4.in" }, «just2» - 0.18);''', ground='dark',
    fx=[('typing', 'ricorda', 0.1, 0.2), ('tear', 'cambia', -0.05, 0.3), ('thud', 'just2', 0.0, 0.32)])

# 10. "Fallo e basta."
add('n10', 'fallo', 'primo', f'''      {nk('j-a', 'Fallo', 560, 260, K)}
      {nk('j-b', 'e basta.', 820, 200, RED)}''', '''    tl.fromTo("#j-a", { opacity: 0, scale: 2 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power4.in" }, 0.0);
    tl.fromTo("#j-b", { opacity: 0, scale: 2 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power4.in" }, «fallo» + 0.2);''', ground='white',
    fx=[('thud', 'fallo', 0.0, 0.3), ('thud', 'fallo', 0.36, 0.26)])

# 11. "Il primo spot? Un uomo di 80 anni..."
RUN = (f'<svg viewBox="0 0 200 260" width="200" height="260"><circle cx="118" cy="30" r="26" fill="{W}"/>'
       f'<path d="M110 66 L84 150 L40 200 M84 150 L130 186 L120 250 M104 84 L60 110 L30 96 M104 84 L150 112 L180 96" fill="none" stroke="{W}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/></svg>')
add('n11', 'primo', 'golden', f'''      <div class="chip" id="k-c" style="left:330px;top:360px;background:{W};color:{K}">il primo spot · 1988</div>
      {big('k-n', '<span id="k-v">0</span>', 560, 380, W)}
      {small('k-a', 'anni', 940, 90, GREY)}
      <div id="k-r" data-layout-allow-overlap style="position:absolute;left:440px;top:1110px">{RUN}</div>''', '''    pop(tl, "#k-c", 0.0);
    count(tl, "#k-v", 0, 80, «uomo» - 0.3, «ottanta» - «uomo» + 0.4, function (v) { return String(Math.round(v)); }, "power2.out");
    tl.fromTo("#k-a", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «ottanta» + 0.2);
    tl.fromTo("#k-r", { x: -700 }, { x: 0, duration: 0.5, ease: "power2.out" }, «ottanta» + 0.4);
    tl.fromTo("#k-r", { y: 0 }, { y: -18, duration: 0.14, yoyo: true, repeat: 5, ease: "sine.inOut" }, «ottanta» + 0.4);''', ground='dark',
    fx=[('pop', 'primo', 0.0, 0.2), ('counter', 'uomo', -0.3, 0.3), ('ding', 'ottanta', 0.1, 0.22), ('whoosh-short', 'ottanta', 0.4, 0.2)])

# 12. "...che corre sul Golden Gate Bridge." (the bridge, the runner crossing it)
BRIDGE = (f'<svg viewBox="0 0 1080 700" width="1080" height="700" style="position:absolute;left:0;top:640px" data-layout-allow-overlap>'
          f'<rect x="250" y="60" width="44" height="520" fill="{BR}"/><rect x="786" y="60" width="44" height="520" fill="{BR}"/>'
          f'<rect x="240" y="130" width="64" height="20" fill="{BR}"/><rect x="776" y="130" width="64" height="20" fill="{BR}"/>'
          f'<path id="l-c" d="M-20 380 Q140 400 272 70 Q540 470 808 70 Q940 400 1100 380" fill="none" stroke="{BR}" stroke-width="12"/>'
          f'<rect x="-20" y="440" width="1120" height="34" fill="{BR}"/>'
          + ''.join(f'<line x1="{x}" y1="440" x2="{x}" y2="{0}" stroke="{BR}" stroke-width="4"/>' for x in []) + '</svg>')
add('n12', 'golden', 'campione', f'''      {big('l-t', 'Golden Gate', 330, 140, W)}
      {BRIDGE}
      <div id="l-r" data-layout-allow-overlap style="position:absolute;left:-120px;top:950px;transform:scale(0.5);transform-origin:50% 100%">{RUN}</div>''', '''    tl.fromTo("#l-t", { opacity: 0, filter: "blur(14px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.24 }, 0.0);
    draw(tl, "#l-c", 0.05, 0.6);
    tl.fromTo("#l-r", { x: 0 }, { x: 1300, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#l-r", { y: 0 }, { y: -12, duration: 0.13, yoyo: true, repeat: 9, ease: "sine.inOut" }, 0);''', ground='dark',
    fx=[('whoosh-cinematic', 'golden', -0.1, 0.18), ('tick', 'golden', 0.5, 0.16), ('tick', 'golden', 0.76, 0.16), ('tick', 'golden', 1.02, 0.16)])

# 13. "Non un campione. Uno qualsiasi." (the trophy crossed out)
TROPHY = (f'<svg viewBox="0 0 300 340" width="300" height="340"><path d="M70 20 H230 V110 Q230 200 150 210 Q70 200 70 110 Z" fill="#d4a017"/>'
          f'<path d="M70 50 H20 Q20 140 80 150 M230 50 H280 Q280 140 220 150" fill="none" stroke="#d4a017" stroke-width="18"/>'
          f'<rect x="130" y="205" width="40" height="70" fill="#d4a017"/><rect x="80" y="275" width="140" height="44" rx="8" fill="#b8860b"/></svg>')
add('n13', 'campione', 'trucco', f'''      <div id="m-tr" data-layout-allow-overlap style="position:absolute;left:390px;top:420px">{TROPHY}</div>
      <svg viewBox="0 0 400 400" width="400" height="400" style="position:absolute;left:340px;top:390px" data-layout-allow-overlap><path id="m-x" d="M40 40 L360 360 M360 40 L40 360" fill="none" stroke="{RED}" stroke-width="30" stroke-linecap="round"/></svg>
      {big('m-a', 'non un campione', 880, 100, GREY)}
      {nk('m-b', 'uno qualsiasi', 1040, 116, W)}''', '''    tl.fromTo("#m-tr", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.24, ease: "back.out(2)" }, 0.0);
    draw(tl, "#m-x", 0.2, 0.25);
    tl.fromTo("#m-a", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.1);
    tl.fromTo("#m-b", { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.18, ease: "power4.in" }, «qualsiasi» - 0.2);''', ground='dark',
    fx=[('glitch', 'campione', 0.2, 0.22), ('thud', 'qualsiasi', -0.02, 0.3)])

# 14. "Ed è questo il trucco: lo slogan non parla delle scarpe." (a plain sneaker, crossed out)
SHOE = (f'<svg viewBox="0 0 700 330" width="700" height="330"><path d="M30 230 Q40 120 120 90 L250 40 Q290 120 370 130 Q520 150 640 210 Q690 235 670 270 H50 Q20 265 30 230 Z" fill="{W}"/>'
        f'<path d="M40 270 H670 Q680 300 650 310 H60 Q30 305 40 270 Z" fill="#d1d1d6"/><path d="M250 40 L300 120 M280 60 L330 130" stroke="{K}" stroke-width="10" stroke-linecap="round"/></svg>')
add('n14', 'trucco', 'parla', f'''      {small('o-a', 'ed è questo il trucco', 360, 70, GREY)}
      <div id="o-s" data-layout-allow-overlap style="position:absolute;left:190px;top:660px">{SHOE}</div>
      <svg viewBox="0 0 800 400" width="800" height="400" style="position:absolute;left:140px;top:620px" data-layout-allow-overlap><path id="o-x" d="M40 360 L760 40" fill="none" stroke="{RED}" stroke-width="30" stroke-linecap="round"/></svg>
      {big('o-b', 'non parla delle scarpe', 1140, 84, W)}''', '''    tl.fromTo("#o-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.22 }, 0.0);
    tl.fromTo("#o-s", { x: 1100 }, { x: 0, duration: 0.36, ease: "expo.out" }, 0.5);
    tl.fromTo("#o-b", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «scarpe» - 0.6);
    draw(tl, "#o-x", «scarpe» - 0.05, 0.25);''', ground='dark',
    fx=[('swoosh', 'trucco', 0.5, 0.22), ('glitch', 'scarpe', -0.05, 0.24)])

# 15. "Parla di te."
add('n15', 'parla', 'inn', f'''      {nk('p-a', 'di te.', 680, 320, K)}''', '''    tl.fromTo("#p-a", { opacity: 0, scale: 2 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power4.in" }, 0.0);''', ground='white',
    fx=[('thud', 'parla', 0.0, 0.34)])

# 16. "In 10 anni la Nike passa da 877 milioni a 9 miliardi di dollari di vendite." (two bars, 1988 and 1998)
add('n16', 'inn', 'qual', f'''      <div class="chip" id="q-c" style="left:400px;top:330px;background:{RED};font-size:56px">10 anni</div>
      <div style="position:absolute;left:150px;top:1400px;width:780px;height:4px;background:#3a3a3c" data-layout-allow-overlap></div>
      <div id="q-b1" style="position:absolute;left:220px;top:1352px;width:260px;height:48px;border-radius:14px 14px 0 0;background:#8e8e93;transform-origin:50% 100%" data-layout-allow-overlap></div>
      <div id="q-b2" style="position:absolute;left:600px;top:900px;width:260px;height:500px;border-radius:22px 22px 0 0;background:{W};transform-origin:50% 100%" data-layout-allow-overlap></div>
      <div id="q-l1" style="position:absolute;left:150px;top:1210px;width:400px;text-align:center;font:700 64px/1 {SF};color:{GREY}" data-layout-allow-overlap>877 mln $</div>
      <div id="q-l2" style="position:absolute;left:530px;top:760px;width:400px;text-align:center;font:700 96px/1 {SF};letter-spacing:-0.03em;color:{W}" data-layout-allow-overlap><span id="q-v">0,9</span> mld $</div>
      <div style="position:absolute;left:150px;top:1430px;width:400px;text-align:center;font:600 46px/1 {SF};color:{GREY}" data-layout-allow-overlap>1988</div>
      <div style="position:absolute;left:530px;top:1430px;width:400px;text-align:center;font:600 46px/1 {SF};color:{W}" data-layout-allow-overlap>1998</div>
      {small('q-a', 'di vendite', 560, 70, GREY)}''', '''    pop(tl, "#q-c", «dieci» - 0.1);
    tl.fromTo("#q-b1", { scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: "expo.out" }, «y877» - 0.3);
    tl.fromTo("#q-l1", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.22 }, «y877» - 0.2);
    tl.fromTo("#q-b2", { scaleY: 0.1 }, { scaleY: 1, duration: 0.9, ease: "expo.out" }, «nove» - 0.3);
    tl.fromTo("#q-l2", { opacity: 0 }, { opacity: 1, duration: 0.15 }, «nove» - 0.3);
    count(tl, "#q-v", 0.9, 9.2, «nove» - 0.3, 0.9, function (v) { return v.toFixed(1).replace(".", ","); }, "expo.out");
    tl.fromTo("#q-a", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «vendite» - 0.2);''', ground='dark', mq='× 10',
    fx=[('pop', 'dieci', -0.1, 0.22), ('pop', 'y877', -0.3, 0.2), ('riser', 'nove', -0.5, 0.12), ('cash', 'nove', 0.2, 0.3)])

# ================================================================ QUESTION + LESSON
SL = ['Think different.', 'I&rsquo;m lovin&rsquo; it', 'Impossible is nothing']
add('n17', 'qual', 'lezione', f'''      {small('r-a', 'qual è lo slogan', 330, 76, GREY)}
      {big('r-b', 'che ti ricordi?', 430, 130, W)}
      {''.join(f'<div class="chip" id="r-s{k}" style="left:{[110, 520, 210][k]}px;top:{[720, 860, 1000][k]}px;background:#1c1c1e;color:#fff;font-size:50px">{t}</div>' for k, t in enumerate(SL))}
      <div id="r-c" data-layout-allow-overlap style="position:absolute;left:150px;top:1220px;width:780px;height:150px;border-radius:75px;background:{W};color:{K};font:700 54px/150px {SF};text-align:center">scrivilo nei commenti</div>''', '''    tl.fromTo("#r-b", { opacity: 0, filter: "blur(14px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.24 }, «ricordi» - 0.3);
    tl.fromTo("#r-s0, #r-s1, #r-s2", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.26, ease: "back.out(1.8)", stagger: 0.14 }, 0.15);
    tl.fromTo("#r-c", { y: 700, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: "back.out(1.4)" }, «scrivilo» - 0.15);''', ground='dark',
    fx=[('pop', 'qual', 0.15, 0.18), ('pop', 'qual', 0.29, 0.18), ('pop', 'qual', 0.43, 0.18), ('notif', 'scrivilo', -0.15, 0.24)])

# 18. "La lezione: il tuo slogan non deve descrivere cosa vendi." (a describing slogan, crossed out)
add('n18', 'lezione', 'deve', f'''      <div class="eyebrow" id="s-e" style="top:330px;opacity:1;color:{RED};font-size:40px;letter-spacing:0.2em">LA LEZIONE</div>
      {big('s-a', 'non descrivere', 400, 110, W)}
      <div class="card" id="s-c" style="left:110px;top:700px;width:860px;height:420px;border-radius:36px" data-layout-allow-overlap>
        <div class="tw" style="position:absolute;left:56px;top:56px;font-size:34px;color:{GREY}">il tuo slogan</div>
        <div style="position:absolute;left:56px;right:56px;top:140px;font:700 86px/1.05 {SF};letter-spacing:-0.03em;color:{K}"><span id="s-t" style="position:relative;display:inline-block">Scarpe di qualità.<i id="s-x" style="position:absolute;left:-8px;right:-8px;top:46%;height:14px;background:{RED};display:block;transform-origin:0 50%"></i></span></div>
      </div>''', '''    tl.fromTo("#s-a", { opacity: 0, filter: "blur(14px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.24 }, «descrivere» - 0.3);
    tl.fromTo("#s-c", { y: 1000 }, { y: 0, duration: 0.4, ease: "expo.out" }, 0.2);
    tl.fromTo("#s-x", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.out" }, «vendi» - 0.1);''', ground='dark',
    fx=[('key-press', 'lezione', 0.0, 0.16), ('swoosh', 'lezione', 0.2, 0.2), ('tear', 'vendi', -0.1, 0.3)])

# 19. "Deve dire al cliente cosa può diventare." (from what you sell to who they become)
add('n19', 'deve', 'cta', f'''      {small('t-a', 'dì al cliente', 420, 76, GREY)}
      {big('t-b', 'cosa può', 520, 130, W)}
      {nk('t-c', 'diventare.', 700, 160, RED)}
      <svg viewBox="0 0 200 300" width="160" height="240" style="position:absolute;left:460px;top:1020px" data-layout-allow-overlap><path id="t-ar" d="M100 280 V30 M30 100 L100 30 L170 100" fill="none" stroke="{W}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/></svg>''', '''    tl.fromTo("#t-a", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.0);
    tl.fromTo("#t-b", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.24 }, «cliente» - 0.1);
    tl.fromTo("#t-c", { opacity: 0, scale: 1.9 }, { opacity: 1, scale: 1, duration: 0.18, ease: "power4.in" }, «diventare» - 0.18);
    draw(tl, "#t-ar", «diventare», 0.35);''', ground='dark', mq='DIVENTARE',
    fx=[('pop', 'cliente', -0.1, 0.2), ('thud', 'diventare', 0.0, 0.32), ('riser', 'deve', 0.0, 0.1)])

# ================================================================ KEYWORD + LOOP
# 20. "Scrivi SLOGAN" (comment bar + dark iOS keyboard)
add('n20', 'cta', 'mando', f'''      {small('u-a', 'scrivi nei commenti', 330, 66, GREY)}
      {big('u-w', 'SLOGAN', 420, 200, W)}
      {commentbar('u', 'SLOGAN', 780, dark=True)}
      {keyboard('u', 1230, dark=True)}''', '''    tl.fromTo("#u-kb", { y: 700 }, { y: 0, duration: 0.3, ease: "expo.out" }, 0.0);
    tl.fromTo("#u-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.26, ease: "expo.out" }, 0.0);
    tl.fromTo("#u-w", { scale: 1.5, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, «sloganK» - 0.2);
''' + commentbar_js('u', '«sloganK» - 0.2', 0.07) + keys_js('u', 'SLOGAN', '«sloganK» - 0.2', 0.07) + '''    tl.fromTo("#u-pub", { scale: 1 }, { scale: 1.25, duration: 0.08, yoyo: true, repeat: 1 }, «sloganK» + 0.3);''', KBCSS, ground='dark',
    fx=[('swipe', 'cta', -0.15, 0.24), ('typing', 'sloganK', -0.2, 0.24), ('click', 'sloganK', 0.3, 0.4)])

# 21. "...e ti mando come scrivere il tuo in tre parole." (the DM)
add('n21', 'mando', 'epensa', f'''      {small('v-a', 'ti arriva in DM', 330, 66, GREY)}
      {dmcard('v', 470, 'Il tuo slogan in 3 parole', 'il metodo, passo per passo', dark=True, icon=RED)}''', '''    tl.fromTo("#v-dm", { y: -900, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.3)" }, 0.0);
    tl.fromTo("#v-doc", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, «tre2» - 0.6);''', ground='dark',
    fx=[('notif', 'mando', 0.0, 0.26), ('pop', 'tre2', -0.6, 0.24)])

# 22. loop: "E pensa che..." -> "Lo slogan più famoso della Nike..." (back to the first frame)
add('n22', 'epensa', 'END', f'''      {HOOK.replace('@', 'z')}''', '''    tl.fromTo("#z-t", { scale: 1.5, opacity: 0, y: 30 }, { scale: 1.06, opacity: 1, y: 0, duration: DUR, ease: "power2.in" }, 0);
    tl.fromTo("#z-y", { opacity: 0 }, { opacity: 1, duration: 0.3 }, DUR - 0.4);''', ground='dark', cam=False,
    fx=[('riser', 'epensa', 0.0, 0.12)])
