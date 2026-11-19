# Essenza d'Oriente, "5 segnali che il tuo corpo ti sta chiedendo una pausa", loop.
# No medical claims: the five signs are everyday experiences of tension and tiredness, and the screen-time card is marked as an example.
import sys
sys.path.insert(0, '../../eo-kit'); sys.path.insert(0, '.')
from kit import *
from times import T
R = Reel(T)
add = R.add
V0 = 3.2
RATE = (1.16 - 1.06) / T['etu']
NUMPOS = 'left:465px;top:215px'

# ---------------------------------------------------------------- 1. "Il tuo corpo ti sta chiedendo una pausa."
add('s1', 'start', 'etu', f'''      {vid('a-v', 'clip1.mp4', T['etu'], V0)}
      {zone(ln('a-l1', 'il tuo corpo', 't-d cream', 'font-size:150px'), ln('a-l2', 'ti sta chiedendo', 't-sans cream', 'font-size:80px', mt=-24), ln('a-l3', 'una pausa', 't-di split', 'font-size:200px;color:#EAD9A0', mt=-28), top=350)}''', '''    tl.fromTo("#a-v-w", { scale: 1.16 }, { scale: 1.06, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#a-l1", { scale: 1.25, transformOrigin: "50% 80%" }, { scale: 1, duration: 0.4, ease: "expo.out" }, 0);
    rise(tl, "#a-l2", «chiedendo» - 0.3);
    flip(tl, "#a-l3", «pausa» - 0.22, 0.03);
    exit(tl, "#s1-st", "U", DUR - 0.18);''', cam=False,
    fx=[('impact-bass-1', 'start', 0.0, 0.2), ('key-press', 'chiedendo', -0.3, 0.14), ('pop', 'pausa', -0.2, 0.26), ('whoosh', 'etu', -0.2, 0.24)])

# ---------------------------------------------------------------- 2. "E tu non lo ascolti."
def note(i, top, msg):
    return (f'<div class="nt" id="{i}" style="top:{top}px"><i></i><div><small>CORPO · adesso</small>{msg}</div></div>')
add('s2', 'etu', 'cinque', f'''      {zone(ln('b-l1', 'e tu', 't-sans mut', 'font-size:84px'), ln('b-l2', 'non lo ascolti', 't-di', 'font-size:160px', mt=-28), top=340)}
      {note('b-n1', 780, 'Ho bisogno di una pausa.')}{note('b-n2', 1000, 'Il collo è rigido.')}{note('b-n3', 1220, 'Sono stanco.')}''', '''    enter(tl, "#s2-st", "U");
    rise(tl, "#b-l1", 0.03);
    tl.fromTo(".nt", { opacity: 0, y: -160, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.8)", stagger: 0.1 }, 0.04);
    rise(tl, "#b-l2", «nonlo» - 0.08);
    tl.to(".nt", { x: 1200, rotation: 6, opacity: 0, duration: 0.24, ease: "power3.in", stagger: 0.26 }, «nonlo» + 0.02);
    exit(tl, "#s2-st", "Z", DUR - 0.16);''', f'''
    .nt {{ position: absolute; left: 90px; width: 900px; height: 190px; border-radius: 46px; background: #fff; box-shadow: 0 26px 70px -26px rgba(20,32,25,0.45); display: flex; align-items: center; gap: 30px; padding: 0 40px; font: 500 52px/1.15 "Jost"; color: {INK}; }}
    .nt i {{ display: block; flex: none; width: 104px; height: 104px; border-radius: 28px; background: {BOSCO}; box-shadow: inset 0 0 0 26px {BOSCO}, inset 0 0 0 60px {SALVIA}; }}
    .nt small {{ display: block; font: 600 26px/1 "Jost"; letter-spacing: 0.14em; color: {MUT}; margin-bottom: 12px; }}''',
    fx=[('key-press', 'etu', 0.03, 0.14), ('ping', 'etu', 0.06, 0.16), ('ping', 'etu', 0.16, 0.14), ('ping', 'etu', 0.26, 0.14), ('key-press', 'nonlo', -0.08, 0.14),
        ('whoosh-short', 'nonlo', 0.02, 0.2), ('whoosh-short', 'nonlo', 0.28, 0.2), ('whoosh-short', 'nonlo', 0.54, 0.2), ('whoosh', 'cinque', -0.18, 0.22)])

# ---------------------------------------------------------------- 3. "Cinque segnali."
add('s3', 'cinque', 'uno', f'''      <div id="c-5" style="position:absolute;left:0;right:0;top:400px;text-align:center;font:500 620px/1 Fraunces;color:{ORO};letter-spacing:-0.04em">5</div>
      {zone(ln('c-l1', 'segnali', 't-di cream split', 'font-size:230px'), top=1020)}''', '''    enter(tl, "#s3-st", "Z");
    tl.fromTo("#c-5", { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "expo.out" }, 0.02);
    flip(tl, "#c-l1", 0.3, 0.03);
    tl.fromTo("#s3-cam", { x: 20 }, { x: 0, duration: 0.3, ease: "elastic.out(1.3, 0.3)", immediateRender: false }, 0.02);
    exit(tl, "#s3-st", "L", DUR - 0.18);''', ink=True,
    fx=[('impact-bass-1', 'cinque', 0.02, 0.26), ('pop', 'cinque', 0.3, 0.24), ('whoosh-short', 'uno', -0.2, 0.2)])

# ---------------------------------------------------------------- 4. "Uno: le spalle vicino alle orecchie."
add('s4', 'uno', 'due', f'''      <div class="num" id="d-n" style="{NUMPOS}">1</div>
      {zone(ln('d-l1', 'le spalle', 't-d', 'font-size:150px'), ln('d-l2', 'vicino alle orecchie', 't-sans mut', 'font-size:66px', mt=-18), top=350)}
      <svg viewBox="0 0 700 760" width="700" height="760" style="position:absolute;left:190px;top:800px;overflow:hidden">
        <g id="d-ar"><path d="M70 420 L70 250" stroke="{ORO}" stroke-width="16" stroke-linecap="round"/><path d="M40 280 L70 232 L100 280 Z" fill="{ORO}"/><path d="M630 420 L630 250" stroke="{ORO}" stroke-width="16" stroke-linecap="round"/><path d="M600 280 L630 232 L660 280 Z" fill="{ORO}"/></g>
        <rect id="d-sh" x="110" y="470" width="480" height="500" rx="150" fill="{INK}"/>
        <rect x="312" y="350" width="76" height="170" rx="34" fill="{INK}"/><circle cx="350" cy="280" r="128" fill="{INK}"/>
        <circle cx="222" cy="290" r="30" fill="{INK}"/><circle cx="478" cy="290" r="30" fill="{INK}"/>
        <circle cx="305" cy="268" r="13" fill="{PAPER}"/><circle cx="395" cy="268" r="13" fill="{PAPER}"/>
      </svg>''', '''    enter(tl, "#s4-st", "L");
    pop(tl, "#d-n", 0.02);
    rise(tl, "#d-l1", «lespalle» - 0.1);
    tl.fromTo("#d-sh", { y: 0 }, { y: -120, duration: 0.5, ease: "power2.inOut" }, «lespalle» + 0.1);
    tl.fromTo("#d-ar", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" }, «lespalle» + 0.1);
    tl.to("#d-ar", { y: -26, duration: 0.24, yoyo: true, repeat: 5, ease: "sine.inOut" }, «lespalle» + 0.4);
    rise(tl, "#d-l2", «orecchie» - 0.3);
    tl.to("#d-sh", { y: -90, duration: 0.2, yoyo: true, repeat: 3, ease: "sine.inOut" }, «orecchie» - 0.2);
    exit(tl, "#s4-st", "U", DUR - 0.18);''',
    fx=[('pop', 'uno', 0.02, 0.28), ('key-press', 'lespalle', -0.1, 0.14), ('whoosh-short', 'lespalle', 0.1, 0.18), ('key-press', 'orecchie', -0.3, 0.14), ('whoosh', 'due', -0.2, 0.22)])

# ---------------------------------------------------------------- 5. "Due: la mascella stretta. Anche adesso."
teeth = ''.join('<i></i>' for _ in range(6))
add('s5', 'due', 'tre', f'''      <div class="num" id="e-n" style="{NUMPOS}">2</div>
      {zone(ln('e-l1', 'la mascella', 't-sans mut', 'font-size:84px'), ln('e-l2', 'stretta', 't-d', 'font-size:210px', mt=-30), top=350)}
      {zone(ln('e-l3', '<span class="hl"><i id="e-hl" style="background:#B99A45;top:50%"></i><span>anche adesso.</span></span>', 't-di', 'font-size:156px'), top=420)}
      <div id="e-mouth" style="position:absolute;left:230px;top:900px;width:620px;height:380px;border-radius:190px;background:{INK};overflow:hidden">
        <div id="e-up" class="teeth" style="top:60px">{teeth}</div><div id="e-dn" class="teeth" style="top:210px">{teeth}</div>
      </div>''', '''    enter(tl, "#s5-st", "U");
    pop(tl, "#e-n", 0.02);
    gsap.set("#e-up", { y: -50 }); gsap.set("#e-dn", { y: 50 });
    rise(tl, "#e-l1", «mascella» - 0.1); rise(tl, "#e-l2", «mascella» + 0.3);
    tl.to("#e-up", { y: 12, duration: 0.16, ease: "power3.in" }, «mascella» + 0.3); tl.to("#e-dn", { y: -12, duration: 0.16, ease: "power3.in" }, «mascella» + 0.3);
    tl.fromTo("#e-mouth", { x: -9 }, { x: 9, duration: 0.05, yoyo: true, repeat: 15, ease: "sine.inOut", immediateRender: false }, «mascella» + 0.46);
    sink(tl, "#e-l1", «anche» - 0.2); sink(tl, "#e-l2", «anche» - 0.2);
    rise(tl, "#e-l3", «anche» - 0.02);
    tl.fromTo("#e-hl", { scaleX: 0 }, { scaleX: 1, duration: 0.28, ease: "power3.out" }, «anche» + 0.3);
    tl.fromTo("#s5-cam", { scale: 1.1 }, { scale: 1, duration: 0.45, ease: "expo.out", immediateRender: false }, «anche» - 0.02);
    tl.to("#e-up", { y: -50, duration: 0.4, ease: "back.out(2)" }, «anche» + 0.55); tl.to("#e-dn", { y: 50, duration: 0.4, ease: "back.out(2)" }, «anche» + 0.55);
    exit(tl, "#s5-st", "Z", DUR - 0.16);''', f'''
    .teeth {{ position: absolute; left: 70px; width: 480px; height: 110px; display: flex; gap: 10px; }}
    .teeth i {{ display: block; flex: 1; border-radius: 20px; background: {PAPER}; }}''',
    fx=[('pop', 'due', 0.02, 0.28), ('key-press', 'mascella', -0.1, 0.14), ('click', 'mascella', 0.44, 0.3), ('typing', 'mascella', 0.5, 0.12), ('impact-bass-1', 'anche', -0.02, 0.22), ('sparkle', 'anche', 0.55, 0.16), ('whoosh', 'tre', -0.2, 0.22)])

# ---------------------------------------------------------------- 6. "Tre: ti svegli già stanco."
add('s6', 'tre', 'quattro', f'''      <div class="num" id="f-n" style="{NUMPOS}">3</div>
      {zone(ln('f-l1', 'ti svegli', 't-sans mut', 'font-size:84px'), ln('f-l2', 'già stanco', 't-di', 'font-size:190px', mt=-30), top=350)}
      <div id="f-card" class="card" style="left:200px;top:860px;width:680px;height:520px;text-align:center">
        <div style="font:600 34px/1 Jost;letter-spacing:0.16em;color:{MUT};padding-top:54px">SVEGLIA</div>
        <div style="font:500 220px/1.1 Fraunces;letter-spacing:-0.03em;color:{INK}">07:00</div>
        <div style="position:absolute;left:150px;bottom:64px;width:300px;height:70px;border:8px solid {INK};border-radius:22px"><div id="f-fill" style="position:absolute;left:8px;top:8px;width:268px;height:38px;border-radius:9px;background:{CUORE};transform-origin:left center"></div></div>
        <div id="f-pct" style="position:absolute;left:472px;bottom:70px;font:600 50px/1 Jost;color:{CUORE}">12%</div>
      </div>''', '''    enter(tl, "#s6-st", "Z");
    pop(tl, "#f-n", 0.02);
    tl.fromTo("#f-card", { opacity: 0, y: 500 }, { opacity: 1, y: 0, duration: 0.36, ease: "back.out(1.5)" }, 0.06);
    tl.fromTo("#f-card", { rotation: -4 }, { rotation: 4, duration: 0.06, yoyo: true, repeat: 11, ease: "sine.inOut", immediateRender: false }, 0.44);
    rise(tl, "#f-l1", «tisvegli» - 0.1); rise(tl, "#f-l2", «stanco» - 0.3);
    tl.fromTo("#f-fill", { scaleX: 0.9, backgroundColor: "#2C5138" }, { scaleX: 0.12, backgroundColor: "#C0392B", duration: 0.5, ease: "power2.in" }, «stanco» - 0.3);
    { const o = { v: 90 }; const el = document.querySelector("#f-pct"); const u = () => { el.textContent = Math.round(o.v) + "%"; }; tl.to(o, { v: 12, duration: 0.5, ease: "power2.in", onUpdate: u }, «stanco» - 0.3); u(); }
    exit(tl, "#s6-st", "L", DUR - 0.18);''',
    fx=[('pop', 'tre', 0.02, 0.28), ('typing', 'tre', 0.44, 0.16), ('key-press', 'tisvegli', -0.1, 0.14), ('key-press', 'stanco', -0.3, 0.14), ('click', 'stanco', 0.2, 0.26), ('whoosh', 'quattro', -0.2, 0.22)])

# ---------------------------------------------------------------- 7. "Quattro: il mal di testa a fine giornata."
add('s7', 'quattro', 'cinque5', f'''      {vid('g-v', 'desk.mp4', T['cinque5'] - T['quattro'], 0.9, 'low')}
      <div class="num" id="g-n" style="left:90px;top:230px">4</div>
      <i class="ring" id="g-r1" style="left:560px;top:420px"></i><i class="ring" id="g-r2" style="left:560px;top:420px"></i><i class="ring" id="g-r3" style="left:560px;top:420px"></i>
      {zone(ln('g-l1', 'il mal di testa', 't-di cream', 'font-size:150px'), ln('g-l2', 'a fine giornata', 't-sans', 'font-size:72px;color:#EAD9A0', mt=-20), top=1010)}''', '''    enter(tl, "#s7-st", "L");
    tl.fromTo("#g-v-w", { scale: 1.2 }, { scale: 1.06, duration: DUR, ease: "none" }, 0);
    pop(tl, "#g-n", 0.02);
    rise(tl, "#g-l1", «mal» - 0.1); rise(tl, "#g-l2", «finegiornata» - 0.1);
    ["#g-r1", "#g-r2", "#g-r3"].forEach((r, k) => tl.fromTo(r, { opacity: 0.9, scale: 0.2 }, { opacity: 0, scale: 2.6, duration: 0.7, repeat: 2, ease: "power1.out" }, «mal» - 0.1 + k * 0.23));
    exit(tl, "#s7-st", "U", DUR - 0.18);''', f'''
    .ring {{ position: absolute; display: block; width: 160px; height: 160px; border-radius: 50%; border: 10px solid {CUORE}; opacity: 0; }}''', cam=False,
    fx=[('pop', 'quattro', 0.02, 0.28), ('key-press', 'mal', -0.1, 0.14), ('ping', 'mal', 0.0, 0.14), ('ping', 'mal', 0.7, 0.12), ('key-press', 'finegiornata', -0.1, 0.14), ('whoosh', 'cinque5', -0.2, 0.22)])

# ---------------------------------------------------------------- 8. "Cinque: non ricordi l'ultima ora senza telefono."
bars = ''.join(f'<i class="sb" style="height:{h}px"></i>' for h in (120, 170, 140, 210, 190, 250, 230))
add('s8', 'cinque5', 'nehai', f'''      <div class="num" id="h-n" style="{NUMPOS}">5</div>
      {zone(ln('h-l1', 'non ricordi l’ultima ora', 't-sans', 'font-size:66px;color:#D6E6C0'), ln('h-l2', 'senza telefono', 't-di cream', 'font-size:150px', mt=-22), top=360)}
      <div id="h-card" class="card" style="left:150px;top:800px;width:780px;height:640px;padding:50px 56px">
        <div style="font:600 32px/1 Jost;letter-spacing:0.14em;color:{MUT}">TEMPO DI UTILIZZO · OGGI</div>
        <div style="font:500 150px/1.15 Fraunces;letter-spacing:-0.03em;color:{INK}"><span id="h-h">0</span><span style="font:italic 500 80px/1 Fraunces"> h </span><span id="h-m">00</span><span style="font:italic 500 80px/1 Fraunces"> min</span></div>
        <div style="position:absolute;left:56px;right:56px;bottom:86px;height:260px;display:flex;align-items:flex-end;gap:22px;border-bottom:5px solid {SALVIA}">{bars}</div>
        <div style="position:absolute;left:56px;bottom:34px;font:500 28px/1 Jost;color:{MUT}">esempio</div>
      </div>''', '''    enter(tl, "#s8-st", "U");
    pop(tl, "#h-n", 0.02);
    rise(tl, "#h-l1", «nonricordi» - 0.1);
    tl.fromTo("#h-card", { opacity: 0, y: 600 }, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.4)" }, 0.1);
    tl.fromTo(".sb", { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "back.out(1.6)", stagger: 0.07 }, «nonricordi»);
    { const o = { v: 0 }; const hh = document.querySelector("#h-h"), mm = document.querySelector("#h-m"); const u = () => { const t = Math.round(o.v); hh.textContent = Math.floor(t / 60); mm.textContent = String(t % 60).padStart(2, "0"); };
      tl.to(o, { v: 402, duration: 1.2, ease: "power2.out", onUpdate: u }, «nonricordi»); u(); }
    rise(tl, "#h-l2", «senza» - 0.12);
    tl.fromTo("#h-card", { scale: 1 }, { scale: 1.05, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, «senza» + 0.1);
    exit(tl, "#s8-st", "Z", DUR - 0.16);''', f'''
    .sb {{ display: block; flex: 1; border-radius: 14px 14px 0 0; background: {BOSCO}; transform-origin: 50% 100%; }}
    .sb:nth-child(n+6) {{ background: {CUORE}; }}''', ink=True,
    fx=[('pop', 'cinque5', 0.02, 0.28), ('key-press', 'nonricordi', -0.1, 0.14), ('typing', 'nonricordi', 0.05, 0.14), ('typing', 'nonricordi', 0.7, 0.12), ('key-press', 'senza', -0.12, 0.14), ('ping', 'senza', 0.1, 0.14), ('whoosh', 'nehai', -0.2, 0.22)])

# ---------------------------------------------------------------- 9. "Ne hai almeno tre?"
ck = ''.join(f'<i class="ck" id="i-c{k}"><svg viewBox="0 0 24 24" width="84" height="84"><path d="M5 12.5 L10 17.5 L19 7.5" fill="none" stroke="{INK}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></i>' for k in range(1, 6))
add('s9', 'nehai', 'allora', f'''      {zone(ln('i-l1', 'ne hai', 't-sans mut', 'font-size:92px'), ln('i-l2', 'almeno 3?', 't-di split', 'font-size:230px', mt=-30), top=420)}
      <div style="position:absolute;left:0;right:0;top:980px;display:flex;justify-content:center;gap:22px">{ck}</div>''', '''    enter(tl, "#s9-st", "Z");
    rise(tl, "#i-l1", 0.02);
    flip(tl, "#i-l2", «almenotre» - 0.3, 0.03);
    tl.fromTo(".ck", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(3)", stagger: 0.05 }, 0.04);
    ["#i-c1", "#i-c3", "#i-c4"].forEach((c, k) => { tl.to(c, { backgroundColor: "#B99A45", borderColor: "#B99A45", scale: 1.2, duration: 0.12 }, «almenotre» - 0.2 + k * 0.14); tl.to(c + " svg", { opacity: 1, duration: 0.05 }, «almenotre» - 0.2 + k * 0.14); tl.to(c, { scale: 1, duration: 0.16 }, «almenotre» - 0.08 + k * 0.14); });
    exit(tl, "#s9-st", "U", DUR - 0.18);''', f'''
    .ck {{ display: flex; align-items: center; justify-content: center; width: 160px; height: 160px; border-radius: 50%; border: 8px solid {INK}; }}
    .ck svg {{ opacity: 0; }}''',
    fx=[('key-press', 'nehai', 0.02, 0.14), ('click-soft', 'almenotre', -0.2, 0.3), ('click-soft', 'almenotre', -0.06, 0.3), ('click-soft', 'almenotre', 0.08, 0.3), ('pop', 'almenotre', -0.3, 0.22), ('whoosh', 'allora', -0.2, 0.24)])

# ---------------------------------------------------------------- 10. "Allora ti serve un'ora tutta tua."
add('s10', 'allora', 'da', f'''      {vid('j-v', 'clip2.mp4', T['da'] - T['allora'], 1.0)}
      {zone(ln('j-l1', 'allora ti serve', 't-sans cream', 'font-size:84px'), ln('j-l2', 'un’ora', 't-d cream', 'font-size:210px', mt=-30), ln('j-l3', 'tutta tua', 't-di split', 'font-size:170px;color:#EAD9A0', mt=-34), top=350)}''', '''    enter(tl, "#s10-st", "U");
    tl.fromTo("#j-v-w", { scale: 1.2 }, { scale: 1.05, duration: DUR, ease: "none" }, 0);
    rise(tl, "#j-l1", 0.03);
    rise(tl, "#j-l2", «unora» - 0.14);
    flip(tl, "#j-l3", «unora» + 0.3, 0.03);
    exit(tl, "#s10-st", "L", DUR - 0.18);''', cam=False,
    fx=[('impact-bass-1', 'allora', 0.02, 0.18), ('key-press', 'allora', 0.03, 0.14), ('key-press', 'unora', -0.14, 0.14), ('pop', 'unora', 0.3, 0.24), ('whoosh', 'da', -0.2, 0.24)])

# ---------------------------------------------------------------- 11. "Da Essenza d'Oriente, ad Alessandria."
add('s11', 'da', 'aperti', f'''      {vid('k-v', 'clip3.mp4', T['aperti'] - T['da'], 2.2, 'full')}
      {lockup('k-lock', 470, full=False)}
      <div id="k-pin" class="chip" style="left:0;right:0;margin:0 auto;width:fit-content;top:800px;background:{ORO};font-size:56px;padding:26px 48px">📍 Alessandria · Via San Lorenzo 46</div>
      {wa('k-wa', 1260)}''', '''    enter(tl, "#s11-st", "L");
    tl.fromTo("#k-v-w", { scale: 1.2 }, { scale: 1.06, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#k-lock", { opacity: 0, y: 90, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "expo.out" }, 0.04);
    pop(tl, "#k-pin", «alessandria» - 0.1);
    tl.fromTo("#k-wa", { opacity: 0, y: 200 }, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.6)" }, 0.5);
    exit(tl, "#s11-st", "U", DUR - 0.18);''', cam=False,
    fx=[('impact-bass-1', 'da', 0.04, 0.2), ('sparkle', 'da', 0.1, 0.16), ('pop', 'da', 0.5, 0.22), ('pop', 'alessandria', -0.1, 0.26), ('whoosh', 'aperti', -0.2, 0.22)])

# ---------------------------------------------------------------- 12. "Aperti tutti i giorni, fino alle ventidue e trenta."
days = ''.join(f'<i class="wk">{d}</i>' for d in 'LMMGVSD')
add('s12', 'aperti', 'prenota', f'''      {vid('l-v', 'clip1.mp4', T['prenota'] - T['aperti'], 7.0, 'low')}
      {zone(ln('l-l1', 'aperti', 't-sans cream', 'font-size:88px'), ln('l-l2', 'tutti i giorni', 't-di cream', 'font-size:170px', mt=-30), top=350)}
      <div style="position:absolute;left:0;right:0;top:770px;display:flex;justify-content:center;gap:16px">{days}</div>
      <div id="l-h" class="chip" style="left:0;right:0;margin:0 auto;width:fit-content;top:960px;font-size:72px;padding:30px 56px">fino alle <b style="font-weight:600;color:{CUORE}">22:30</b></div>
      {wa('l-wa', 1260)}''', '''    enter(tl, "#s12-st", "U");
    gsap.set("#l-wa", { opacity: 1 });
    tl.fromTo("#l-v-w", { scale: 1.18 }, { scale: 1.04, duration: DUR, ease: "none" }, 0);
    rise(tl, "#l-l1", 0.03); rise(tl, "#l-l2", 0.34);
    tl.fromTo(".wk", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(3)", stagger: 0.06 }, 0.4);
    tl.fromTo("#l-h", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.36, ease: "back.out(2.4)" }, «fino» - 0.06);
    tl.fromTo("#l-h", { scale: 1 }, { scale: 1.1, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, «fino» + 0.75);
    exit(tl, "#s12-st", "Z", DUR - 0.16);''', '''
    .wk { display: block; width: 122px; height: 122px; border-radius: 50%; background: #B99A45; color: #142019; font: 600 54px/122px "Jost"; text-align: center; font-style: normal; }''', cam=False,
    fx=[('key-press', 'aperti', 0.03, 0.14), ('key-press', 'aperti', 0.34, 0.14)] + [('click-soft', 'aperti', 0.4 + 0.06 * k, 0.22) for k in range(7)] + [('pop', 'fino', -0.06, 0.28), ('ping', 'fino', 0.75, 0.14), ('whoosh', 'prenota', -0.2, 0.22)])

# ---------------------------------------------------------------- 13. "Prenota su WhatsApp."
add('s13', 'prenota', 'perche', f'''      {zone(ln('m-l1', 'Prenota', 't-di cream split', 'font-size:230px'), top=380)}
      {wa('m-wa', 800)}
      <div id="m-info" style="position:absolute;left:0;right:0;top:1010px;text-align:center;color:{PAPER}">
        <div style="font:500 46px/1.3 Jost">tutti i giorni · 9:30 – 22:30</div>
        <div style="font:500 40px/1.3 Jost;opacity:0.75;margin-top:8px">5,0 <span style="color:{ORO}">★</span> · 146 recensioni Google</div>
        <div style="font:400 30px/1.3 Jost;opacity:0.6;margin-top:60px">Trattamenti olistici per il benessere, non prestazioni sanitarie.</div>
      </div>''', '''    enter(tl, "#s13-st", "Z");
    flip(tl, "#m-l1", 0.02, 0.03);
    tl.fromTo("#m-wa", { opacity: 1, y: 460, scale: 1 }, { y: 0, scale: 1.16, duration: 0.4, ease: "back.out(1.6)" }, 0);
    tl.fromTo("#m-info", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.35, ease: "expo.out" }, 0.3);
    tl.fromTo("#m-wa", { scale: 1.16 }, { scale: 1.26, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, 0.7);
    exit(tl, "#s13-st", "U", DUR - 0.18);''', ink=True,
    fx=[('impact-bass-1', 'prenota', 0.02, 0.2), ('pop', 'prenota', 0.1, 0.26), ('ping', 'prenota', 0.7, 0.16), ('whoosh', 'perche', -0.2, 0.22)])

# ---------------------------------------------------------------- 14. loop: "Perché forse non te ne sei accorto, ma..." -> "Il tuo corpo ti sta chiedendo una pausa."
D14 = T['END'] - T['perche']
add('s14', 'perche', 'END', f'''      {vid('z-v', 'clip1.mp4', D14, round(V0 - D14, 3))}
      {zone(ln('z-l1', 'perché forse', 't-sans cream', 'font-size:84px'), ln('z-l2', 'non te ne sei accorto,', 't-di cream', 'font-size:104px', mt=-18), ln('z-l3', 'ma…', 't-di', 'font-size:230px;color:#EAD9A0', mt=-30), top=350)}''', f'''    enter(tl, "#s14-st", "U");
    tl.fromTo("#z-v-w", {{ scale: {1.16 + RATE * D14:.4f} }}, {{ scale: 1.16, duration: DUR, ease: "none" }}, 0);
    rise(tl, "#z-l1", 0.03);
    rise(tl, "#z-l2", «nonte» - 0.5);
    rise(tl, "#z-l3", «ma» - 0.12);''', cam=False,
    fx=[('key-press', 'perche', 0.03, 0.14), ('key-press', 'nonte', -0.5, 0.14), ('pop', 'ma', -0.12, 0.22)])
