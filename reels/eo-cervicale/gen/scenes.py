# Essenza d'Oriente, "La tua testa pesa 5 chili" (collo e telefono), loop.
# Fact used: a neutral head weighs about 4.5-5.5 kg; bent forward 60 degrees the load on the neck is modelled at about 27 kg
# (15° -> 12 kg, 30° -> 18 kg, 45° -> 22 kg). Source: Hansraj, Surgical Technology International, 2014 (a computer model, not a measurement).
import sys
sys.path.insert(0, '../../eo-kit'); sys.path.insert(0, '.')
from kit import *
from times import T
R = Reel(T)
add = R.add
V0 = 1.6
RATE = (1.16 - 1.06) / T['ma']

def neck(i, top):
    return f'''<svg id="{i}" viewBox="0 0 1080 760" width="1080" height="760" style="position:absolute;left:0;top:{top}px;overflow:hidden" data-layout-allow-overlap>
        <path d="M430 15 A385 385 0 0 1 763.4 207.5" fill="none" stroke="{ORO}" stroke-width="10" stroke-linecap="round" stroke-dasharray="6 20"/>
        <rect x="280" y="380" width="300" height="460" rx="120" fill="{INK}"/>
        <g id="{i}-h"><rect x="395" y="230" width="70" height="200" rx="32" fill="{INK}"/><circle cx="440" cy="165" r="125" fill="{INK}"/><path d="M552 128 L604 176 L552 200 Z" fill="{INK}"/><circle cx="505" cy="148" r="13" fill="{PAPER}"/></g>
        <g id="{i}-ph"><rect x="-42" y="-78" width="84" height="156" rx="18" fill="{ORO}"/><rect x="-30" y="-62" width="60" height="112" rx="8" fill="{PAPER}"/></g>
      </svg>'''
def meter(i, top):
    return (f'<div style="position:absolute;left:190px;top:{top}px;width:700px;height:26px;border-radius:13px;background:{SALVIA}" data-layout-allow-overlap>'
            f'<div id="{i}" style="width:700px;height:26px;border-radius:13px;background:{BOSCO};transform-origin:left center"></div></div>')
NECKJS = '''    const KG = [[0, 5], [15, 12], [30, 18], [45, 22], [60, 27]];
    const kgOf = (a) => { for (let k = 1; k < KG.length; k++) { if (a <= KG[k][0]) { const p = KG[k - 1], q = KG[k]; return p[1] + (q[1] - p[1]) * (a - p[0]) / (q[0] - p[0]); } } return 27; };
    const mix = gsap.utils.interpolate("#2C5138", "#C0392B");
    const setNeck = (id, num, bar, a) => { gsap.set(id + "-h", { svgOrigin: "430 400", rotation: a }); const w = kgOf(a), c = mix((w - 5) / 22); const el = document.querySelector(num); el.textContent = Math.round(w); el.parentNode.style.color = c; gsap.set(bar, { scaleX: w / 27, backgroundColor: c }); };
'''

# ---------------------------------------------------------------- 1. "La tua testa pesa cinque chili."
add('c1', 'start', 'ma', f'''      {vid('a-v', 'phone.mp4', T['ma'], V0)}
      {zone(ln('a-l1', 'la tua testa pesa', 't-sans cream', 'font-size:88px'), top=360)}
      <div id="a-big" style="position:absolute;left:0;right:0;top:470px;text-align:center;font:500 380px/1 Fraunces;letter-spacing:-0.04em;color:{PAPER};opacity:0;text-shadow:0 14px 60px rgba(0,0,0,0.55)">5 <span style="font:italic 500 200px/1 Fraunces">kg</span></div>''', '''    tl.fromTo("#a-v-w", { scale: 1.16 }, { scale: 1.06, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#a-l1", { scale: 1.25, transformOrigin: "50% 80%" }, { scale: 1, duration: 0.4, ease: "expo.out" }, 0);
    tl.fromTo("#a-big", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.34, ease: "expo.out" }, «cinque» - 0.1);
    tl.fromTo("#c1-st", { x: -22 }, { x: 0, duration: 0.3, ease: "elastic.out(1.2, 0.35)", immediateRender: false }, «cinque» - 0.1);
    exit(tl, "#c1-st", "U", DUR - 0.18);''', cam=False,
    fx=[('impact-bass-1', 'start', 0.0, 0.2), ('impact-bass-1', 'cinque', -0.1, 0.22), ('pop', 'cinque', -0.04, 0.26), ('whoosh', 'ma', -0.2, 0.24)])

# ---------------------------------------------------------------- 2. "Ma quando guardi il telefono, per il collo può pesarne fino a ventisette."
add('c2', 'ma', 'come', f'''      {zone(ln('b-l1', 'ma quando guardi il telefono', 't-sans mut', 'font-size:60px'), ln('b-l2', '<span id="b-kg">5</span><span style="font:italic 500 130px/1 Fraunces"> kg</span>', 't-d', 'font-size:250px', mt=-24), top=330)}
      {meter('b-bar', 712)}
      <div class="label mut" style="top:756px;font-size:24px;letter-spacing:0.12em">stima da modello · Hansraj, 2014</div>
      {neck('b-n', 800)}
      <div id="b-deg" class="chip" style="left:800px;top:1040px;background:{INK};color:{PAPER}"><span id="b-dn">0</span>°</div>''', NECKJS + '''    enter(tl, "#c2-st", "U");
    rise(tl, "#b-l1", 0.04); rise(tl, "#b-l2", 0.1);
    gsap.set("#b-n-ph", { x: 820, y: 620, rotation: -28 });
    tl.fromTo("#b-n-ph", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2.6)" }, «guardi» - 0.1);
    pop(tl, "#b-deg", «guardi» + 0.2);
    { const o = { a: 0 }; const dn = document.querySelector("#b-dn"); const u = () => { setNeck("#b-n", "#b-kg", "#b-bar", o.a); dn.textContent = Math.round(o.a); };
      tl.to(o, { a: 60, duration: «ventisette» - «guardi» - 0.1, ease: "power1.inOut", onUpdate: u }, «guardi» + 0.15); u(); }
    tl.fromTo("#b-l2", { scale: 1.28 }, { scale: 1, duration: 0.4, ease: "elastic.out(1.2, 0.4)", immediateRender: false }, «ventisette» + 0.05);
    tl.fromTo("#c2-cam", { x: -18 }, { x: 0, duration: 0.3, ease: "elastic.out(1.4, 0.3)", immediateRender: false }, «ventisette» + 0.05);
    exit(tl, "#c2-st", "L", DUR - 0.18);''',
    fx=[('key-press', 'ma', 0.04, 0.14), ('pop', 'guardi', -0.1, 0.24), ('typing', 'guardi', 0.2, 0.12), ('typing', 'perilcollo', 0.1, 0.12), ('typing', 'perilcollo', 0.85, 0.12), ('impact-bass-1', 'ventisette', 0.03, 0.24), ('ping', 'ventisette', 0.05, 0.16), ('whoosh-short', 'come', -0.2, 0.2)])

# ---------------------------------------------------------------- 3. "Come un bambino di otto anni seduto sulle spalle."
add('c3', 'come', 'perore', f'''      {zone(ln('k-l1', 'come un bambino', 't-d', 'font-size:124px'), ln('k-l2', 'di 8 anni', 't-di', 'font-size:150px;color:#B99A45', mt=-26), ln('k-l3', 'seduto sulle spalle', 't-sans mut', 'font-size:64px', mt=-14), top=330)}
      <div id="k-ad" style="position:absolute;left:340px;top:1010px;width:400px;height:700px;z-index:2">
        <div id="k-adh" style="position:absolute;left:125px;top:0;width:150px;height:150px;border-radius:50%;background:{INK}"></div>
        <div style="position:absolute;left:60px;top:170px;width:280px;height:560px;border-radius:110px 110px 0 0;background:{INK}"></div>
      </div>
      <div id="k-ch" style="position:absolute;left:340px;top:780px;width:400px;height:420px">
        <div style="position:absolute;left:150px;top:0;width:100px;height:100px;border-radius:50%;background:{ORO}"></div>
        <div style="position:absolute;left:135px;top:110px;width:130px;height:170px;border-radius:50px;background:{ORO}"></div>
        <div style="position:absolute;left:84px;top:230px;width:46px;height:170px;border-radius:23px;background:{ORO}"></div>
        <div style="position:absolute;left:270px;top:230px;width:46px;height:170px;border-radius:23px;background:{ORO}"></div>
      </div>
      <div id="k-tag" class="chip" style="left:720px;top:900px;background:{CUORE};color:{PAPER};font-size:60px">27 kg</div>''', '''    enter(tl, "#c3-st", "L");
    rise(tl, "#k-l1", 0.03);
    tl.fromTo("#k-ad", { y: 900 }, { y: 0, duration: 0.4, ease: "back.out(1.4)" }, 0.02);
    rise(tl, "#k-l2", «otto» - 0.12);
    tl.fromTo("#k-ch", { y: -1500, rotation: -14 }, { y: 0, rotation: 0, duration: 0.42, ease: "power3.in" }, «bambino» + 0.1);
    tl.fromTo("#k-ad", { scaleY: 1, transformOrigin: "50% 100%" }, { scaleY: 0.86, duration: 0.1, ease: "power2.out", immediateRender: false }, «bambino» + 0.52);
    tl.to("#k-ad", { scaleY: 0.93, duration: 0.5, ease: "elastic.out(1.2, 0.35)" }, «bambino» + 0.62);
    tl.fromTo("#k-ch", { y: 0 }, { y: 92, duration: 0.1, ease: "power2.out", immediateRender: false }, «bambino» + 0.52);
    tl.to("#k-ch", { y: 46, duration: 0.5, ease: "elastic.out(1.2, 0.35)" }, «bambino» + 0.62);
    tl.fromTo("#k-adh", { x: 0, y: 0 }, { x: 34, y: 30, duration: 0.3, ease: "power2.out", immediateRender: false }, «bambino» + 0.55);
    pop(tl, "#k-tag", «otto» + 0.1);
    rise(tl, "#k-l3", «seduto» - 0.1);
    tl.fromTo("#k-ch", { rotation: 0 }, { rotation: 5, duration: 0.2, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, «seduto» + 0.1);
    exit(tl, "#c3-st", "Z", DUR - 0.16);''',
    fx=[('key-press', 'come', 0.03, 0.14), ('whoosh-short', 'bambino', 0.1, 0.2), ('impact-bass-1', 'bambino', 0.5, 0.24), ('pop', 'otto', 0.1, 0.26), ('key-press', 'seduto', -0.1, 0.14), ('whoosh', 'perore', -0.2, 0.22)])

# ---------------------------------------------------------------- 4. "Per ore. Ogni giorno."
days = ''.join(f'<i class="wk"><b>{d}</b></i>' for d in 'LMMGVSD')
add('c4', 'perore', 'ecco', f'''      {zone(ln('o-l1', 'per ore', 't-di cream', 'font-size:230px'), top=380)}
      {zone(ln('o-l2', 'ogni giorno', 't-di cream', 'font-size:190px'), top=400)}
      <div id="o-clock" style="position:absolute;left:350px;top:830px;width:380px;height:380px;border-radius:50%;border:18px solid {PAPER}">
        <i id="o-hm" style="position:absolute;left:163px;top:28px;width:18px;height:150px;border-radius:9px;background:{ORO};transform-origin:50% 100%"></i>
        <i id="o-hh" style="position:absolute;left:163px;top:78px;width:18px;height:100px;border-radius:9px;background:{PAPER};transform-origin:50% 100%"></i>
      </div>
      <div id="o-week" style="position:absolute;left:0;right:0;top:900px;display:flex;justify-content:center;gap:18px">{days}</div>''', '''    enter(tl, "#c4-st", "Z");
    flip(tl, "#o-l1", 0.02, 0.03);
    pop(tl, "#o-clock", 0.06);
    tl.fromTo("#o-hm", { rotation: 0 }, { rotation: 360 * 5, duration: «ognigiorno» - 0.1, ease: "power1.in" }, 0.06);
    tl.fromTo("#o-hh", { rotation: 40 }, { rotation: 40 + 150, duration: «ognigiorno» - 0.1, ease: "power1.in" }, 0.06);
    sink(tl, "#o-l1", «ognigiorno» - 0.18);
    tl.to("#o-clock", { scale: 0, opacity: 0, duration: 0.18, ease: "power3.in" }, «ognigiorno» - 0.18);
    rise(tl, "#o-l2", «ognigiorno»);
    tl.fromTo(".wk", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(3)", stagger: 0.07 }, «ognigiorno» + 0.02);
    tl.to(".wk", { backgroundColor: "#B99A45", color: "#142019", duration: 0.1, stagger: 0.07 }, «ognigiorno» + 0.18);
    exit(tl, "#c4-st", "U", DUR - 0.18);''', '''
    .wk { display: block; width: 122px; height: 122px; border-radius: 50%; border: 5px solid #B99A45; color: #F4F2EC; font: 600 54px/112px "Jost"; text-align: center; }
    .wk b { font-weight: 600; }''', ink=True,
    fx=[('pop', 'perore', 0.04, 0.26), ('typing', 'perore', 0.1, 0.14), ('whoosh-short', 'ognigiorno', -0.2, 0.2)] + [('click-soft', 'ognigiorno', 0.18 + 0.07 * k, 0.24) for k in range(7)] + [('whoosh', 'ecco', -0.2, 0.24)])

# ---------------------------------------------------------------- 5. "Ecco perché la sera hai il collo duro e le spalle alte."
add('c5', 'ecco', 'trecose', f'''      {vid('e-v', 'desk.mp4', T['trecose'] - T['ecco'], 0.5)}
      {zone(ln('e-l1', 'ecco perché', 't-sans cream', 'font-size:80px'), ln('e-l2', 'la sera hai…', 't-di cream', 'font-size:150px', mt=-26), top=360)}
      <div id="e-c1" class="chip" style="left:90px;top:820px;font-size:60px;padding:26px 44px">collo duro</div>
      <i id="e-d1" class="dot" style="left:600px;top:960px"></i>
      <div id="e-c2" class="chip" style="left:520px;top:1190px;font-size:60px;padding:26px 44px">spalle alte</div>
      <i id="e-d2" class="dot" style="left:360px;top:1150px"></i>''', '''    enter(tl, "#c5-st", "U");
    tl.fromTo("#e-v-w", { scale: 1.2 }, { scale: 1.06, duration: DUR, ease: "none" }, 0);
    rise(tl, "#e-l1", 0.03); rise(tl, "#e-l2", 0.5);
    [["#e-c1", "#e-d1", «collo» - 0.08], ["#e-c2", "#e-d2", «spalle» - 0.08]].forEach(([c, d, t]) => {
      tl.fromTo(d, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(3)" }, t);
      tl.fromTo(d, { boxShadow: "0 0 0 0px rgba(192,57,43,0.7)" }, { boxShadow: "0 0 0 46px rgba(192,57,43,0)", duration: 0.5, repeat: 2, ease: "power1.out", immediateRender: false }, t + 0.1);
      pop(tl, c, t + 0.06);
    });
    exit(tl, "#c5-st", "Z", DUR - 0.16);''', '''
    .dot { position: absolute; display: block; width: 44px; height: 44px; border-radius: 50%; background: #C0392B; border: 6px solid #F4F2EC; opacity: 0; }''', cam=False,
    fx=[('key-press', 'ecco', 0.03, 0.14), ('key-press', 'ecco', 0.5, 0.14), ('pop', 'collo', -0.04, 0.28), ('ping', 'collo', 0.0, 0.14), ('pop', 'spalle', -0.04, 0.28), ('ping', 'spalle', 0.0, 0.14), ('whoosh', 'trecose', -0.2, 0.24)])

# ---------------------------------------------------------------- 6. "Tre cose da fare subito."
add('c6', 'trecose', 'uno', f'''      <div id="t-3" style="position:absolute;left:0;right:0;top:400px;text-align:center;font:500 620px/1 Fraunces;color:{ORO};letter-spacing:-0.04em">3</div>
      {zone(ln('t-l1', 'cose da fare', 't-sans cream', 'font-size:96px'), ln('t-l2', 'subito', 't-di cream split', 'font-size:220px', mt=-30), top=1010)}''', '''    enter(tl, "#c6-st", "Z");
    tl.fromTo("#t-3", { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.32, ease: "expo.out" }, 0.02);
    rise(tl, "#t-l1", 0.22);
    flip(tl, "#t-l2", 0.7, 0.035);
    tl.fromTo("#c6-cam", { x: 20 }, { x: 0, duration: 0.3, ease: "elastic.out(1.3, 0.3)", immediateRender: false }, 0.02);
    exit(tl, "#c6-st", "L", DUR - 0.18);''', ink=True,
    fx=[('impact-bass-1', 'trecose', 0.02, 0.26), ('key-press', 'trecose', 0.22, 0.14), ('pop', 'trecose', 0.7, 0.24), ('whoosh-short', 'uno', -0.2, 0.2)])

# ---------------------------------------------------------------- 7. "Uno: alza il telefono all'altezza degli occhi."
add('c7', 'uno', 'due', f'''      <div class="num" id="u-n">1</div>
      {zone(ln('u-l1', 'alza il telefono', 't-d', 'font-size:112px'), ln('u-l2', 'all’altezza degli occhi', 't-sans mut', 'font-size:60px', mt=-16), top=330)}
      <div id="u-kgw" style="position:absolute;left:640px;top:640px;width:400px;text-align:center;font:500 150px/1 Fraunces;letter-spacing:-0.03em"><span id="u-kg">27</span><span style="font:italic 500 80px/1 Fraunces"> kg</span></div>
      {meter('u-bar', 610)}
      {neck('u-n2', 790)}''', NECKJS + '''    enter(tl, "#c7-st", "L");
    pop(tl, "#u-n", 0.02);
    gsap.set("#u-n", { left: 465, top: 200 });
    gsap.set("#u-n2-ph", { x: 820, y: 620, rotation: -28 });
    rise(tl, "#u-l1", «alza» - 0.1);
    { const o = { a: 60 }; const u = () => setNeck("#u-n2", "#u-kg", "#u-bar", o.a);
      tl.to(o, { a: 0, duration: 0.9, ease: "power2.inOut", onUpdate: u }, «alza» + 0.1); u(); }
    tl.to("#u-n2-ph", { x: 800, y: 170, rotation: 0, duration: 0.9, ease: "power2.inOut" }, «alza» + 0.1);
    rise(tl, "#u-l2", «altezza» - 0.1);
    tl.fromTo("#u-kgw", { scale: 1.3 }, { scale: 1, duration: 0.4, ease: "elastic.out(1.2, 0.4)", immediateRender: false }, «alza» + 1.0);
    exit(tl, "#c7-st", "U", DUR - 0.18);''',
    fx=[('pop', 'uno', 0.02, 0.28), ('key-press', 'alza', -0.1, 0.14), ('whoosh-short', 'alza', 0.1, 0.2), ('sparkle', 'alza', 1.0, 0.16), ('key-press', 'altezza', -0.1, 0.14), ('whoosh', 'due', -0.2, 0.22)])

# ---------------------------------------------------------------- 8. "Due: ogni mezz'ora, muovi il collo."
add('c8', 'due', 'tre', f'''      <div class="num" id="w-n" style="left:465px;top:200px">2</div>
      {zone(ln('w-l1', 'ogni mezz’ora', 't-d', 'font-size:120px'), top=340)}
      {zone(ln('w-l2', 'muovi il collo', 't-di', 'font-size:140px'), top=340)}
      <div id="w-tm" style="position:absolute;left:290px;top:720px;width:500px;height:500px">
        <svg viewBox="0 0 500 500" width="500" height="500" style="position:absolute;left:0;top:0"><circle cx="250" cy="250" r="220" fill="none" stroke="{SALVIA}" stroke-width="26"/><circle id="w-ring" cx="250" cy="250" r="220" fill="none" stroke="{ORO}" stroke-width="26" stroke-linecap="round" transform="rotate(-90 250 250)"/></svg>
        <div id="w-clk" style="position:absolute;left:0;right:0;top:186px;text-align:center;font:500 120px/1 Fraunces;letter-spacing:-0.02em">30:00</div>
      </div>
      <svg id="w-fr" viewBox="0 0 700 760" width="700" height="760" style="position:absolute;left:190px;top:760px;opacity:0;overflow:hidden">
        <path d="M130 250 A230 230 0 0 1 250 130" fill="none" stroke="{ORO}" stroke-width="14" stroke-linecap="round"/><path d="M570 250 A230 230 0 0 0 450 130" fill="none" stroke="{ORO}" stroke-width="14" stroke-linecap="round"/>
        <path d="M106 220 L130 262 L160 226 Z" fill="{ORO}"/><path d="M594 220 L570 262 L540 226 Z" fill="{ORO}"/>
        <rect x="110" y="470" width="480" height="400" rx="150" fill="{INK}"/>
        <g id="w-hd"><rect x="312" y="350" width="76" height="170" rx="34" fill="{INK}"/><circle cx="350" cy="280" r="128" fill="{INK}"/><circle cx="305" cy="268" r="13" fill="{PAPER}"/><circle cx="395" cy="268" r="13" fill="{PAPER}"/></g>
      </svg>''', '''    enter(tl, "#c8-st", "U");
    pop(tl, "#w-n", 0.02);
    rise(tl, "#w-l1", «mezzora» - 0.1);
    pop(tl, "#w-tm", «mezzora» - 0.06);
    { const ring = document.querySelector("#w-ring"); const n = 2 * Math.PI * 220; ring.style.strokeDasharray = n + " " + n; const clk = document.querySelector("#w-clk"); const o = { v: 1800 };
      const u = () => { ring.style.strokeDashoffset = (n * (1 - o.v / 1800)).toFixed(1); const s = Math.round(o.v); clk.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
      tl.to(o, { v: 0, duration: «muovi» - «mezzora» - 0.2, ease: "power1.in", onUpdate: u }, «mezzora» + 0.05); u(); }
    sink(tl, "#w-l1", «muovi» - 0.18);
    tl.to("#w-tm", { scale: 0, opacity: 0, duration: 0.18, ease: "power3.in" }, «muovi» - 0.18);
    rise(tl, "#w-l2", «muovi»);
    tl.fromTo("#w-fr", { opacity: 0, y: 300 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(1.6)" }, «muovi» - 0.04);
    tl.fromTo("#w-hd", { svgOrigin: "350 500", rotation: 0 }, { rotation: 24, duration: 0.22, ease: "sine.inOut" }, «muovi» + 0.22);
    tl.to("#w-hd", { rotation: -24, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 1 }, «muovi» + 0.44);
    tl.to("#w-hd", { rotation: 0, duration: 0.14, ease: "sine.out" }, «muovi» + 1.04);
    exit(tl, "#c8-st", "Z", DUR - 0.16);''',
    fx=[('pop', 'due', 0.02, 0.28), ('key-press', 'mezzora', -0.1, 0.14), ('typing', 'mezzora', 0.1, 0.14), ('ping', 'muovi', -0.16, 0.16), ('whoosh-short', 'muovi', 0.22, 0.16), ('whoosh-short', 'muovi', 0.5, 0.16), ('whoosh', 'tre', -0.2, 0.22)])

# ---------------------------------------------------------------- 9. "Tre: sciogli la tensione, prima che diventi un'abitudine."
add('c9', 'tre', 'da', f'''      {vid('x-v', 'clip3.mp4', T['da'] - T['tre'], 0.3)}
      <div class="num" id="x-n" style="left:465px;top:230px">3</div>
      {zone(ln('x-l1', 'sciogli', 't-sans cream', 'font-size:96px'), ln('x-l2', 'la tensione', 't-di cream split', 'font-size:190px', mt=-30), ln('x-l3', 'prima che diventi un’abitudine', 't-sans', 'font-size:56px;color:#EAD9A0', mt=-12), top=400)}''', '''    enter(tl, "#c9-st", "Z");
    tl.fromTo("#x-v-w", { scale: 1.2 }, { scale: 1.04, duration: DUR, ease: "none" }, 0);
    pop(tl, "#x-n", 0.02);
    rise(tl, "#x-l1", «sciogli» - 0.1);
    flip(tl, "#x-l2", «sciogli» + 0.28, 0.03);
    rise(tl, "#x-l3", «prima» - 0.1);
    exit(tl, "#c9-st", "L", DUR - 0.18);''', cam=False,
    fx=[('pop', 'tre', 0.02, 0.28), ('key-press', 'sciogli', -0.1, 0.14), ('pop', 'sciogli', 0.28, 0.22), ('key-press', 'prima', -0.1, 0.14), ('whoosh', 'da', -0.2, 0.24)])

# ---------------------------------------------------------------- 10. "Da Essenza d'Oriente, ad Alessandria,"
add('c10', 'da', 'lavoriamo', f'''      {vid('y-v', 'clip1.mp4', T['lavoriamo'] - T['da'], 5.0, 'full')}
      {lockup('y-lock', 470, full=False)}
      <div id="y-pin" class="chip" style="left:0;right:0;margin:0 auto;width:fit-content;top:800px;background:{ORO};font-size:56px;padding:26px 48px">📍 Alessandria · Via San Lorenzo 46</div>
      {wa('y-wa', 1260)}''', '''    enter(tl, "#c10-st", "L");
    tl.fromTo("#y-v-w", { scale: 1.2 }, { scale: 1.06, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#y-lock", { opacity: 0, y: 90, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "expo.out" }, 0.04);
    pop(tl, "#y-pin", «alessandria» - 0.1);
    tl.fromTo("#y-wa", { opacity: 0, y: 200 }, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.6)" }, 0.5);
    exit(tl, "#c10-st", "U", DUR - 0.18);''', cam=False,
    fx=[('impact-bass-1', 'da', 0.04, 0.2), ('sparkle', 'da', 0.1, 0.16), ('pop', 'da', 0.5, 0.22), ('pop', 'alessandria', -0.1, 0.26), ('whoosh', 'lavoriamo', -0.2, 0.22)])

# ---------------------------------------------------------------- 11. "lavoriamo proprio lì: collo, spalle e schiena."
add('c11', 'lavoriamo', 'scrivici', f'''      {vid('l-v', 'clip2.mp4', T['scrivici'] - T['lavoriamo'], 4.0, 'low')}
      {zone(ln('l-l1', 'lavoriamo', 't-sans cream', 'font-size:92px'), ln('l-l2', 'proprio lì', 't-di cream', 'font-size:190px', mt=-30), top=360)}
      <div style="position:absolute;left:0;right:0;top:820px;display:flex;justify-content:center;gap:22px">
        <div id="l-c1" class="chip" style="position:relative;font-size:62px;padding:26px 44px">collo</div><div id="l-c2" class="chip" style="position:relative;font-size:62px;padding:26px 44px">spalle</div><div id="l-c3" class="chip" style="position:relative;font-size:62px;padding:26px 44px">schiena</div>
      </div>
      {wa('l-wa', 1260)}''', '''    enter(tl, "#c11-st", "U");
    gsap.set("#l-wa", { opacity: 1 });
    tl.fromTo("#l-v-w", { scale: 1.18 }, { scale: 1.04, duration: DUR, ease: "none" }, 0);
    rise(tl, "#l-l1", 0.03); rise(tl, "#l-l2", 0.4);
    pop(tl, "#l-c1", «ccollo» - 0.06); pop(tl, "#l-c2", «cspalle» - 0.06); pop(tl, "#l-c3", «cschiena» - 0.06);
    exit(tl, "#c11-st", "Z", DUR - 0.16);''', cam=False,
    fx=[('key-press', 'lavoriamo', 0.03, 0.14), ('key-press', 'lavoriamo', 0.4, 0.14), ('pop', 'ccollo', -0.06, 0.28), ('pop', 'cspalle', -0.06, 0.28), ('pop', 'cschiena', -0.06, 0.28), ('whoosh', 'scrivici', -0.2, 0.22)])

# ---------------------------------------------------------------- 12. "Scrivici su WhatsApp."
add('c12', 'scrivici', 'enon', f'''      {zone(ln('m-l1', 'Scrivici', 't-di cream split', 'font-size:230px'), top=380)}
      {wa('m-wa', 800)}
      <div id="m-info" style="position:absolute;left:0;right:0;top:1010px;text-align:center;color:{PAPER}">
        <div style="font:500 46px/1.3 Jost">tutti i giorni · 9:30 – 22:30</div>
        <div style="font:500 40px/1.3 Jost;opacity:0.75;margin-top:8px">5,0 <span style="color:{ORO}">★</span> · 146 recensioni Google</div>
        <div style="font:400 30px/1.3 Jost;opacity:0.6;margin-top:60px">Trattamenti olistici per il benessere, non prestazioni sanitarie.</div>
      </div>''', '''    enter(tl, "#c12-st", "Z");
    flip(tl, "#m-l1", 0.02, 0.03);
    tl.fromTo("#m-wa", { opacity: 1, y: 460, scale: 1 }, { y: 0, scale: 1.16, duration: 0.4, ease: "back.out(1.6)" }, 0);
    tl.fromTo("#m-info", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.35, ease: "expo.out" }, 0.3);
    tl.fromTo("#m-wa", { scale: 1.16 }, { scale: 1.26, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, 0.75);
    exit(tl, "#c12-st", "U", DUR - 0.18);''', ink=True,
    fx=[('impact-bass-1', 'scrivici', 0.02, 0.2), ('pop', 'scrivici', 0.1, 0.26), ('ping', 'scrivici', 0.75, 0.16), ('whoosh', 'enon', -0.2, 0.22)])

# ---------------------------------------------------------------- 13. loop: "E non dimenticare che..." -> "La tua testa pesa cinque chili."
D13 = T['END'] - T['enon']
add('c13', 'enon', 'END', f'''      {vid('z-v', 'phone.mp4', D13, round(V0 - D13, 3))}
      {zone(ln('z-l1', 'e non dimenticare', 't-sans cream', 'font-size:84px'), ln('z-l2', 'che…', 't-di cream', 'font-size:230px', mt=-30), top=360)}''', f'''    enter(tl, "#c13-st", "U");
    tl.fromTo("#z-v-w", {{ scale: {1.16 + RATE * D13:.4f} }}, {{ scale: 1.16, duration: DUR, ease: "none" }}, 0);
    rise(tl, "#z-l1", 0.03);
    rise(tl, "#z-l2", 0.7);''', cam=False,
    fx=[('key-press', 'enon', 0.03, 0.14), ('key-press', 'enon', 0.7, 0.14)])
