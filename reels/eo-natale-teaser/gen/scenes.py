# Essenza d'Oriente, teaser di Natale (v2, loop): "A dicembre sta arrivando qualcosa", senza dire cosa.
# Times written as «key» are named voice moments (see times.py), converted to scene-local seconds.
import sys, math
sys.path.insert(0, '../../eo-kit'); sys.path.insert(0, '.')
from kit import *
from times import T
R = Reel(T)
add = R.add
V0 = 2.0                      # media time of the opening footage; the last scene plays the seconds just before it
RATE = (1.16 - 1.06) / T['eate']  # zoom-out speed of the opening footage, kept in the closing scene

# ---------------------------------------------------------------- overlay: snow + light garland, periodic over the whole reel
N = 44
flakes = ''.join(f'<i class="fl" style="left:{(k * 197.3) % 1080:.0f}px;width:{6 + (k * 7) % 13}px;height:{6 + (k * 7) % 13}px;opacity:{0.5 + ((k * 3) % 5) / 10:.1f};background:{"#fff" if k % 3 else "#EAD9A0"}"></i>' for k in range(N))
wire = ' '.join(f'{"M" if x == 0 else "L"}{x} {96 + 64 * math.sin(math.pi * (x % 540) / 540):.1f}' for x in range(0, 1081, 30)).replace('L540 96.0', 'L540 96.0')
BCOL = ['#F3D27A', '#F4F2EC', '#E0584A', '#D6E6C0']
bulbs = ''.join(f'<i class="bu" style="left:{x - 13}px;top:{96 + 64 * math.sin(math.pi * (x % 540) / 540) + 2:.0f}px;background:{BCOL[k % 4]};box-shadow:0 0 26px 8px {BCOL[k % 4]}88"></i>' for k, x in enumerate(range(45, 1080, 90)))
R.overlay(f'''    <svg viewBox="0 0 1080 260" width="1080" height="260" style="position:absolute;left:0;top:0"><path d="{wire}" fill="none" stroke="#0E1712" stroke-width="5" stroke-linecap="round"/></svg>
    {bulbs}
    {flakes}''', '''    const fl = Array.from(document.querySelectorAll(".fl")), bu = Array.from(document.querySelectorAll(".bu"));
    const o = { p: 0 };
    const upd = () => {
      fl.forEach((el, k) => { const cyc = 3 + (k % 4), ph = (k * 0.618) % 1, q = (o.p * cyc + ph) % 1; const sway = Math.sin(2 * Math.PI * (o.p * (2 + (k % 3)) + ph)) * (18 + (k % 5) * 8); el.style.transform = "translate(" + sway.toFixed(1) + "px," + (q * 2060 - 70).toFixed(1) + "px)"; });
      bu.forEach((el, k) => { const b = 0.62 + 0.38 * Math.sin(2 * Math.PI * (o.p * (7 + (k % 5)) + k * 0.27)); el.style.opacity = b.toFixed(2); el.style.transform = "scale(" + (0.86 + 0.2 * b).toFixed(3) + ")"; });
    };
    tl.to(o, { p: 1, duration: DUR, ease: "none", onUpdate: upd }, 0); upd();''', '''
    .fl { position: absolute; top: 0; border-radius: 50%; filter: blur(0.6px); }
    .bu { position: absolute; width: 26px; height: 34px; border-radius: 50% 50% 50% 50% / 42% 42% 58% 58%; }''')

# ---------------------------------------------------------------- 1. "A Natale pensi a tutti."
add('n1', 'start', 'eate', f'''      {vid('a-v', 'clip1.mp4', T['eate'], V0)}
      {zone(ln('a-l1', 'A Natale', 't-d cream', 'font-size:182px'), ln('a-l2', 'pensi a tutti.', 't-sans cream', 'font-size:90px', mt=-26), top=360)}
      {star('a-s1', 96, 340, 70)}{star('a-s2', 902, 318, 96)}{star('a-s3', 948, 570, 50)}''', starjs('#n1-st .star', '0.06') + '''    tl.fromTo("#a-v-w", { scale: 1.16 }, { scale: 1.06, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#a-l1", { scale: 1.3, transformOrigin: "50% 80%" }, { scale: 1, duration: 0.45, ease: "expo.out" }, 0);
    rise(tl, "#a-l2", «pensi» - 0.12);
    exit(tl, "#n1-st", "U", DUR - 0.18);''', cam=False,
    fx=[('impact-bass-1', 'start', 0.0, 0.2), ('sparkle', 'start', 0.06, 0.16), ('key-press', 'pensi', -0.12, 0.14), ('whoosh', 'eate', -0.2, 0.24)])

# ---------------------------------------------------------------- 2. "E a te?"
add('n2', 'eate', 'corri', f'''      <div style="position:absolute;left:0;right:0;top:640px;text-align:center">
        <span class="hl"><i id="b-hl" style="top:54%;bottom:2%;background:{ORO}"></i><span id="b-t" class="split cream" style="font:italic 500 310px/1.1 Fraunces;letter-spacing:-0.035em;display:inline-block">E a te?</span></span>
      </div>
      {star('b-s1', 120, 560, 84)}{star('b-s2', 880, 1010, 70)}''', starjs('#n2-st .star', '0.1') + '''    enter(tl, "#n2-st", "U");
    flip(tl, "#b-t", 0.0, 0.018);
    tl.fromTo("#b-hl", { scaleX: 0 }, { scaleX: 1, duration: 0.26, ease: "power3.out" }, 0.14);
    exit(tl, "#n2-st", "L", DUR - 0.16);''', ink=True,
    fx=[('pop', 'eate', 0.02, 0.3), ('whoosh-short', 'corri', -0.18, 0.2)])

# ---------------------------------------------------------------- 3. "Corri per i regali. Le cene. I parenti."
def word(i, w):
    return f'<div class="wd" id="{i}"><span class="split">{w}</span></div>'
add('n3', 'corri', 'earrivi', f'''      {vid('c-v', 'xstreet.mp4', T['earrivi'] - T['corri'], 0.4, 'low')}
      {zone(ln('c-l1', 'corri per', 't-sans cream', 'font-size:92px'), top=380)}
      {word('c-w1', 'i regali')}{word('c-w2', 'le cene')}{word('c-w3', 'i parenti')}
      <div id="c-ticks" style="position:absolute;left:0;right:0;top:890px;display:flex;justify-content:center;gap:26px">
        <i class="tk" id="c-t1"></i><i class="tk" id="c-t2"></i><i class="tk" id="c-t3"></i>
      </div>''', '''    enter(tl, "#n3-st", "L");
    tl.fromTo("#c-v-w", { scale: 1.3 }, { scale: 1.12, duration: 0.5, ease: "expo.out" }, 0);
    rise(tl, "#c-l1", 0.04);
    [["#c-w1", «regali» - 0.12, "#c-t1"], ["#c-w2", «cene» - 0.04, "#c-t2"], ["#c-w3", «parenti» - 0.04, "#c-t3"]].forEach(([w, t, k], n) => {
      tl.fromTo(w, { opacity: 0, scale: 1.9, rotation: n % 2 ? 5 : -5 }, { opacity: 1, scale: 1, rotation: n % 2 ? -2 : 2, duration: 0.28, ease: "expo.out" }, t);
      tl.fromTo("#c-v-w", { scale: 1.28 }, { scale: 1.1, duration: 0.5, ease: "expo.out", immediateRender: false }, t);
      tl.fromTo("#n3-st", { x: n % 2 ? 26 : -26 }, { x: 0, duration: 0.3, ease: "elastic.out(1.2, 0.35)", immediateRender: false }, t);
      tl.fromTo(k, { backgroundColor: "rgba(244,242,236,0.25)", scale: 1 }, { backgroundColor: "#B99A45", scale: 1.5, duration: 0.14, yoyo: false }, t + 0.1);
      tl.to(k, { scale: 1, duration: 0.2 }, t + 0.24);
      if (n < 2) tl.to(w, { opacity: 0, y: -160, scale: 0.7, duration: 0.16, ease: "power3.in" }, [«cene», «parenti»][n] - 0.2);
    });
    exit(tl, "#n3-st", "U", DUR - 0.18);''', '''
    .wd { position: absolute; left: 0; right: 0; top: 560px; text-align: center; font: italic 500 232px/1.1 "Fraunces"; letter-spacing: -0.03em; color: #F4F2EC; opacity: 0; text-shadow: 0 10px 50px rgba(0,0,0,0.5); }
    .tk { display: block; width: 34px; height: 34px; border-radius: 50%; background: rgba(244,242,236,0.25); }''', cam=False,
    fx=[('key-press', 'corri', 0.04, 0.14), ('impact-bass-1', 'regali', -0.12, 0.16), ('pop', 'regali', -0.02, 0.24), ('whoosh-short', 'cene', -0.2, 0.2), ('impact-bass-1', 'cene', -0.04, 0.16), ('pop', 'cene', 0.06, 0.24),
        ('whoosh-short', 'parenti', -0.2, 0.2), ('impact-bass-1', 'parenti', -0.04, 0.16), ('pop', 'parenti', 0.06, 0.24), ('whoosh', 'earrivi', -0.2, 0.24)])

# ---------------------------------------------------------------- 4. "E arrivi al venticinque più stanco di prima."
add('n4', 'earrivi', 'questanno', f'''      {zone(ln('d-l1', 'e arrivi al', 't-sans mut', 'font-size:84px'), top=380)}
      {zone(ln('d-l2', 'più stanco', 't-di', 'font-size:170px'), ln('d-l3', 'di prima', 't-sans mut', 'font-size:84px', mt=-22), top=380)}
      <div id="d-cal" class="card" style="left:270px;top:620px;width:540px;text-align:center;overflow:hidden">
        <div style="background:{CUORE};color:{PAPER};font:600 42px/1 Jost;padding:30px 0;letter-spacing:0.16em">DICEMBRE</div>
        <div id="d-day" style="font:500 330px/1.12 Fraunces;letter-spacing:-0.04em;color:{INK}">20</div>
      </div>
      <div id="d-bat" style="position:absolute;left:190px;top:880px;width:700px;height:300px;opacity:0">
        <div style="position:absolute;left:0;top:0;width:640px;height:300px;border:14px solid {INK};border-radius:56px"></div>
        <div style="position:absolute;right:0;top:95px;width:44px;height:110px;border-radius:0 26px 26px 0;background:{INK}"></div>
        <div id="d-fill" style="position:absolute;left:34px;top:34px;width:572px;height:232px;border-radius:30px;background:{BOSCO};transform-origin:left center"></div>
        <div id="d-pct" style="position:absolute;left:0;top:330px;width:640px;text-align:center;font:500 110px/1 Fraunces;color:{CUORE}">100%</div>
      </div>''', '''    enter(tl, "#n4-st", "U");
    rise(tl, "#d-l1", 0.04);
    tl.fromTo("#d-cal", { opacity: 0, scale: 0.5, rotation: -8 }, { opacity: 1, scale: 1, rotation: -3, duration: 0.4, ease: "back.out(2)" }, 0.08);
    { const days = ["20", "21", "22", "23", "24", "25"]; const o = { v: 0 }; const el = document.querySelector("#d-day");
      tl.to(o, { v: 5.99, duration: «venticinque» - 0.16, ease: "none", onUpdate: () => { el.textContent = days[Math.min(5, Math.floor(o.v))]; } }, 0.2); }
    tl.fromTo("#d-cal", { scale: 1 }, { scale: 1.14, rotation: 2, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, «venticinque» + 0.04);
    sink(tl, "#d-l1", «piustanco» - 0.2);
    tl.to("#d-cal", { y: -1500, rotation: 14, duration: 0.3, ease: "power3.in" }, «piustanco» - 0.22);
    rise(tl, "#d-l2", «piustanco»);
    rise(tl, "#d-l3", «piustanco» + 0.42);
    tl.fromTo("#d-bat", { opacity: 0, y: 500 }, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" }, «piustanco» - 0.04);
    tl.fromTo("#d-fill", { scaleX: 1, backgroundColor: "#2C5138" }, { scaleX: 0.07, backgroundColor: "#C0392B", duration: 0.85, ease: "power2.in" }, «piustanco» + 0.1);
    { const o = { v: 100 }; const el = document.querySelector("#d-pct"); tl.to(o, { v: 7, duration: 0.85, ease: "power2.in", onUpdate: () => { el.textContent = Math.round(o.v) + "%"; } }, «piustanco» + 0.1); }
    tl.fromTo("#d-bat", { x: -14 }, { x: 14, duration: 0.06, yoyo: true, repeat: 5, ease: "sine.inOut", immediateRender: false }, «piustanco» + 0.95);
    exit(tl, "#n4-st", "Z", DUR - 0.16);''',
    fx=[('pop', 'earrivi', 0.08, 0.24), ('click-soft', 'earrivi', 0.2, 0.24), ('click-soft', 'earrivi', 0.3, 0.24), ('click-soft', 'earrivi', 0.4, 0.24), ('click-soft', 'earrivi', 0.5, 0.24), ('ping', 'venticinque', 0.02, 0.16),
        ('whoosh-short', 'piustanco', -0.22, 0.2), ('key-press', 'piustanco', 0.0, 0.14), ('typing', 'piustanco', 0.2, 0.12), ('click', 'piustanco', 0.95, 0.26)])

# ---------------------------------------------------------------- 5. "Quest'anno, fermati."
add('n5', 'questanno', 'unora', f'''      {zone(ln('e-l1', 'quest’anno', 't-sans', 'font-size:92px;color:#D6E6C0'), top=420)}
      <div style="position:absolute;left:0;right:0;top:590px;text-align:center"><span id="e-t" class="split cream" style="font:italic 500 250px/1.1 Fraunces;letter-spacing:-0.035em;display:inline-block">fermati.</span></div>
      <div id="e-pause" style="position:absolute;left:440px;top:1010px;width:200px;height:230px;display:flex;justify-content:space-between;opacity:0">
        <i style="display:block;width:70px;height:230px;border-radius:22px;background:{ORO}"></i><i style="display:block;width:70px;height:230px;border-radius:22px;background:{ORO}"></i>
      </div>''', '''    enter(tl, "#n5-st", "Z");
    rise(tl, "#e-l1", 0.04);
    flip(tl, "#e-t", «fermati» - 0.06, 0.03);
    pop(tl, "#e-pause", «fermati» + 0.26);
    tl.fromTo("#n5-cam", { scale: 1.12 }, { scale: 1, duration: 0.5, ease: "expo.out", immediateRender: false }, «fermati» - 0.06);
    exit(tl, "#n5-st", "Z", DUR - 0.16);''', ink=True, cam=True,
    fx=[('key-press', 'questanno', 0.04, 0.14), ('impact-bass-1', 'fermati', -0.06, 0.24), ('click', 'fermati', 0.26, 0.28)])

# ---------------------------------------------------------------- 6-7. "Un'ora di silenzio. Solo per te."
add('n6', 'unora', 'solo', f'''      {vid('f-v', 'clip2.mp4', T['solo'] - T['unora'], 2.6)}
      {zone(ln('f-l1', 'un’ora', 't-d cream', 'font-size:176px'), ln('f-l2', 'di silenzio', 't-di cream', 'font-size:136px', mt=-30), top=360)}''', '''    enter(tl, "#n6-st", "Z");
    tl.fromTo("#f-v-w", { scale: 1.18 }, { scale: 1.05, duration: DUR, ease: "none" }, 0);
    rise(tl, "#f-l1", 0.03);
    rise(tl, "#f-l2", «silenzio» - 0.16);
    exit(tl, "#n6-st", "L", DUR - 0.18);''', cam=False,
    fx=[('whoosh-short', 'unora', -0.04, 0.18), ('key-press', 'unora', 0.03, 0.14), ('ping', 'silenzio', -0.1, 0.14), ('whoosh-short', 'solo', -0.2, 0.18)])

add('n7', 'solo', 'adicembre', f'''      {vid('g-v', 'clip3.mp4', T['adicembre'] - T['solo'], 0.6)}
      {zone(ln('g-l1', 'solo', 't-sans cream', 'font-size:96px'), ln('g-l2', 'per te', 't-di cream split', 'font-size:216px', mt=-34), top=360)}''', '''    enter(tl, "#n7-st", "L");
    tl.fromTo("#g-v-w", { scale: 1.16 }, { scale: 1.04, duration: DUR, ease: "none" }, 0);
    rise(tl, "#g-l1", 0.03);
    flip(tl, "#g-l2", «perte» - 0.1, 0.04);
    exit(tl, "#n7-st", "U", DUR - 0.18);''', cam=False,
    fx=[('key-press', 'solo', 0.03, 0.14), ('pop', 'perte', -0.08, 0.22), ('whoosh', 'adicembre', -0.2, 0.24)])

# ---------------------------------------------------------------- 8. "A dicembre, da Essenza d'Oriente"
add('n8', 'adicembre', 'staarrivando', f'''      {vid('h-v', 'xstill.mp4', T['staarrivando'] - T['adicembre'], 0.6, 'low')}
      {zone(ln('h-l1', 'a dicembre', 't-d cream', 'font-size:176px'), ln('h-l2', 'da Essenza d’Oriente', 't-sans', 'font-size:66px;color:#EAD9A0', mt=-22), top=360)}
      {star('h-s1', 80, 330, 76)}{star('h-s2', 926, 350, 60)}{star('h-s3', 150, 660, 46)}{star('h-s4', 900, 640, 70)}''', starjs('#n8-st .star', '0.2') + '''    enter(tl, "#n8-st", "U");
    tl.fromTo("#h-v-w", { scale: 1.2 }, { scale: 1.04, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#h-l1", { yPercent: 135, scale: 1.2 }, { yPercent: 0, scale: 1, duration: 0.45, ease: "expo.out" }, 0.04);
    rise(tl, "#h-l2", «daessenza» - 0.1);
    exit(tl, "#n8-st", "Z", DUR - 0.16);''', cam=False,
    fx=[('impact-bass-1', 'adicembre', 0.02, 0.18), ('sparkle', 'adicembre', 0.2, 0.18), ('key-press', 'daessenza', -0.1, 0.14), ('whoosh-short', 'staarrivando', -0.2, 0.2)])

# ---------------------------------------------------------------- 9. "sta arrivando qualcosa"
def gift(i, left, top, rot):
    return (f'<div class="gift" id="p-{i}" style="left:{left}px;top:{top}px"><div class="gift-in" style="transform:rotate({rot}deg)">'
            '<b></b><u></u><s></s><em>?</em></div></div>')
add('n9', 'staarrivando', 'nonpossiamo', f'''      <div id="p-orb" style="position:absolute;left:90px;top:660px;width:900px;height:900px;border-radius:50%;background:{SALVIA};opacity:0.6"></div>
      {zone(ln('p-l1', 'sta arrivando', 't-sans mut', 'font-size:84px'), ln('p-l2', '<span class="hl"><i id="p-hl"></i><span>qualcosa</span></span>', 't-di', 'font-size:196px', mt=-30), top=380)}
      {gift(1, 60, 950, -7)}{gift(2, 390, 890, 3)}{gift(3, 720, 960, 8)}
      {star('p-s1', 70, 820, 80)}{star('p-s2', 930, 810, 60)}{star('p-s3', 500, 1350, 54)}{star('p-s4', 960, 1360, 84)}''', '''    enter(tl, "#n9-st", "Z");
    tl.fromTo("#p-orb", { scale: 0.3 }, { scale: 1.1, duration: 0.7, ease: "expo.out" }, 0);
    rise(tl, "#p-l1", 0.02);
    tl.fromTo(".gift", { opacity: 0, y: 900, rotation: 14 }, { opacity: 1, y: 0, rotation: 0, duration: 0.5, ease: "back.out(1.5)", stagger: 0.1 }, 0.05);
    rise(tl, "#p-l2", «qualcosa» - 0.16);
    tl.fromTo("#p-hl", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power3.out" }, «qualcosa» + 0.1);
    tl.fromTo(".gift", { scale: 1 }, { scale: 1.12, duration: 0.14, yoyo: true, repeat: 1, stagger: 0.06, immediateRender: false }, «qualcosa» + 0.06);
''' + starjs('#n9-st .star', '«qualcosa» + 0.04') + '''    exit(tl, "#n9-st", "U", DUR - 0.18);''', f'''
    .gift {{ position: absolute; width: 300px; height: 390px; }}
    .gift-in {{ position: absolute; inset: 0; border-radius: 30px; background: #fff; overflow: hidden; box-shadow: 0 34px 80px -22px rgba(20,32,25,0.42); }}
    .gift-in b {{ position: absolute; left: 0; right: 0; top: 0; height: 150px; background: {BOSCO}; }}
    .gift-in u {{ position: absolute; left: 50%; top: 0; bottom: 0; width: 46px; margin-left: -23px; background: {ORO}; }}
    .gift-in s {{ position: absolute; left: 0; right: 0; top: 127px; height: 46px; background: {ORO}; }}
    .gift-in em {{ position: absolute; left: 50%; top: 200px; width: 150px; height: 150px; margin-left: -75px; border-radius: 50%; background: {CUORE}; color: {PAPER}; font: 500 110px/150px "Fraunces"; font-style: normal; text-align: center; }}''',
    fx=[('pop', 'staarrivando', 0.08, 0.22), ('pop', 'staarrivando', 0.18, 0.22), ('pop', 'staarrivando', 0.28, 0.22), ('sparkle', 'qualcosa', 0.04, 0.18), ('whoosh', 'nonpossiamo', -0.2, 0.24)])

# ---------------------------------------------------------------- 10. "Non possiamo ancora dirti cosa."
add('n10', 'nonpossiamo', 'seguici', f'''      {vid('q-v', 'xbox.mp4', T['seguici'] - T['nonpossiamo'], 2.2, 'low')}
      {zone(ln('q-l1', 'non possiamo ancora', 't-sans cream', 'font-size:74px'), ln('q-l2', 'dirti cosa', 't-di cream', 'font-size:184px', mt=-28), top=360)}
      <div style="position:absolute;left:0;right:0;top:740px;display:flex;justify-content:center;gap:22px">
        <i class="q-bar" style="width:210px"></i><i class="q-bar" style="width:120px"></i><i class="q-bar" style="width:280px"></i>
      </div>''', '''    enter(tl, "#n10-st", "U");
    tl.fromTo("#q-v-w", { scale: 1.04 }, { scale: 1.22, duration: DUR, ease: "power1.in" }, 0);
    rise(tl, "#q-l1", 0.03);
    rise(tl, "#q-l2", «dirti» - 0.14);
    tl.fromTo(".q-bar", { scaleX: 0 }, { scaleX: 1, duration: 0.2, ease: "power3.out", stagger: 0.09 }, «dirti» - 0.02);
    exit(tl, "#n10-st", "Z", DUR - 0.16);''', f'''
    .q-bar {{ display: block; height: 30px; border-radius: 15px; background: {ORO}; transform-origin: left center; }}''', cam=False,
    fx=[('key-press', 'nonpossiamo', 0.03, 0.14), ('riser', 'nonpossiamo', 0.2, 0.1), ('click-soft', 'dirti', -0.02, 0.28), ('click-soft', 'dirti', 0.07, 0.28), ('click-soft', 'dirti', 0.16, 0.28), ('whoosh', 'seguici', -0.2, 0.24)])

# ---------------------------------------------------------------- 11. "Seguici, te lo sveliamo presto."
add('n11', 'seguici', 'perche', f'''      {zone(ln('s-l1', 'Seguici.', 't-di cream split', 'font-size:230px'), ln('s-l2', 'te lo sveliamo presto', 't-sans', 'font-size:72px;color:#D6E6C0', mt=-20), top=400)}
      <div id="s-ig" class="pill" style="left:0;right:0;top:900px;width:fit-content;margin:0 auto;background:{ORO};color:{INK};font-size:50px;letter-spacing:0.02em;text-transform:none;padding:26px 52px">@essenza.oriente</div>
      {lockup('s-lock', 1110, full=False)}
      {star('s-s1', 110, 380, 80)}{star('s-s2', 900, 420, 64)}{star('s-s3', 130, 1010, 56)}{star('s-s4', 890, 1060, 86)}''', starjs('#n11-st .star', '0.12') + '''    enter(tl, "#n11-st", "Z");
    flip(tl, "#s-l1", 0.03, 0.03);
    pop(tl, "#s-ig", 0.36);
    rise(tl, "#s-l2", «telosveliamo» - 0.06);
    tl.fromTo("#s-lock", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.45, ease: "expo.out" }, «telosveliamo» + 0.2);
    tl.fromTo("#s-ig", { scale: 1 }, { scale: 1.1, duration: 0.15, yoyo: true, repeat: 1, immediateRender: false }, «presto» + 0.1);
    exit(tl, "#n11-st", "U", DUR - 0.18);''', ink=True,
    fx=[('impact-bass-1', 'seguici', 0.02, 0.2), ('pop', 'seguici', 0.36, 0.26), ('sparkle', 'seguici', 0.12, 0.16), ('key-press', 'telosveliamo', -0.06, 0.14), ('ping', 'presto', 0.1, 0.14), ('whoosh', 'perche', -0.2, 0.22)])

# ---------------------------------------------------------------- 12. loop: "Perché lo sappiamo..." -> "A Natale pensi a tutti."
D12 = T['END'] - T['perche']
add('n12', 'perche', 'END', f'''      {vid('z-v', 'clip1.mp4', D12, round(V0 - D12, 3))}
      {zone(ln('z-l1', 'perché', 't-sans cream', 'font-size:96px'), ln('z-l2', 'lo sappiamo…', 't-di cream', 'font-size:168px', mt=-28), top=360)}''', f'''    enter(tl, "#n12-st", "U");
    tl.fromTo("#z-v-w", {{ scale: {1.16 + RATE * D12:.4f} }}, {{ scale: 1.16, duration: DUR, ease: "none" }}, 0);
    rise(tl, "#z-l1", 0.03);
    rise(tl, "#z-l2", 0.28);''', cam=False,
    fx=[('key-press', 'perche', 0.03, 0.14), ('key-press', 'perche', 0.28, 0.14)])
