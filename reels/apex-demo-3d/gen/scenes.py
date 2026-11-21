# apex-demo-3d: demo of the 3D-camera style. Every graphic lives in one 3D space and a camera flies through it:
# it orbits the stack of our reels, flies to a timeline, to a code editor, spins around four panels (voice, graphics,
# transitions, sounds), pulls back to show the whole world and dives into the finished video.
# Voice: "Questo video non l'ha montato nessuno. Niente After Effects. Niente montatore. Solo un'intelligenza artificiale,
# e qualche riga di codice. Voce, grafica, transizioni, suoni. Tutto. E adesso ti faccio vedere come."
import sys
sys.path.insert(0, '.'); sys.path.insert(0, '../../apex-kit')
from kit import *
from ui import *
from times import T
from wave import WAVE
BED = 0.06; ROOT = '#07070a'
BLUE = '#0a84ff'; CYAN = '#64d2ff'; RED = '#ff453a'; GRN = '#30d158'; WHITE = '#f5f5f7'
THEME = WORLDCSS + f'''
    .st.w3 {{ background: radial-gradient(120% 80% at 50% 40%, #15161c 0%, {ROOT} 70%); color: #fff; }}
    .floor {{ position: absolute; left: 0; top: 0; width: 16000px; height: 16000px; background-image: linear-gradient(rgba(100,210,255,0.16) 3px, transparent 3px), linear-gradient(90deg, rgba(100,210,255,0.16) 3px, transparent 3px); background-size: 400px 400px; -webkit-mask-image: radial-gradient(closest-side, #000 30%, transparent 100%); mask-image: radial-gradient(closest-side, #000 30%, transparent 100%); }}
    .fr {{ border-radius: 34px; overflow: hidden; box-shadow: 0 0 0 3px rgba(255,255,255,0.14), 0 60px 120px -20px rgba(0,0,0,0.9); background: #000; }}
    .fr img {{ width: 100%; height: 100%; display: block; }}
    .dk {{ border-radius: 40px; background: #16171e; box-shadow: 0 0 0 3px rgba(255,255,255,0.10), 0 60px 140px -30px rgba(0,0,0,0.9); color: #fff; }}
    .lab {{ position: absolute; left: 0; right: 0; text-align: center; font: 800 120px/1 "SF Pro Display"; letter-spacing: -0.04em; }}
    .ov {{ position: absolute; left: 0; right: 0; text-align: center; z-index: 20; filter: drop-shadow(0 8px 30px rgba(0,0,0,0.8)); }}
    .code {{ font: 500 34px/1.55 "SF Mono", "Menlo", monospace; white-space: pre; }}
    .k1 {{ color: #ff7ab2; }} .k2 {{ color: #64d2ff; }} .k3 {{ color: #ffd60a; }} .k4 {{ color: #9a9aa6; }}
'''
R = Reel(T, THEME, grounds={'w3': (' dark w3', ROOT)})
add = R.add

# ---------------------------------------------------------------- the world
FW, FH = 540, 960
deck = ''.join(panel(f'dk{i}', i * 70, 0, -i * 300, FW, FH, f'<img src="assets/img/f{i + 1}.jpg" alt=""/>', ry=-10, cls='fr') for i in range(6))
B = (2100, -80, -900)
timeline = panel('tl', *B, 1000, 640, f'''
      <div style="position:absolute;left:50px;top:44px;font:700 36px/1 {SF};letter-spacing:0.18em;color:#9a9aa6">TIMELINE</div>
      {''.join(f'<i style="position:absolute;left:{x}px;top:{110 + k * 56}px;width:{w}px;height:40px;border-radius:10px;background:{c}"></i>' for k, (x, w, c) in enumerate([(50, 380, '#5e5ce6'), (220, 520, '#30d158'), (90, 300, '#ff9f0a'), (420, 420, '#64d2ff')]))}
      <div style="position:absolute;left:50px;top:360px;font:800 84px/1 {SF};letter-spacing:-0.03em"><span style="position:relative;display:inline-block">After Effects<i id="tl-x1" style="position:absolute;left:-10px;right:-10px;top:52%;height:14px;border-radius:7px;background:{RED};transform-origin:0 50%"></i></span></div>
      <div style="position:absolute;left:50px;top:480px;font:800 84px/1 {SF};letter-spacing:-0.03em"><span style="position:relative;display:inline-block">Montatore<i id="tl-x2" style="position:absolute;left:-10px;right:-10px;top:52%;height:14px;border-radius:7px;background:{RED};transform-origin:0 50%"></i></span></div>''',
                 ry=-30, cls='dk')
C = (3500, 260, 250)
CODE = ['<span class="k4">// la camera vola nello spazio 3D</span>', '<span class="k1">camPath</span>(tl, <span class="k3">"#world"</span>, [', '  [<span class="k2">0.0</span>, { d: <span class="k2">-200</span>, ry: <span class="k2">-25</span> }],',
        '  [<span class="k2">2.3</span>, { x: <span class="k2">2100</span>, ry: <span class="k2">40</span> }],', ']);', '<span class="k1">blurIn</span>(tl, <span class="k3">"#titolo"</span>, <span class="k2">0.2</span>);',
        '<span class="k1">count</span>(tl, <span class="k3">"#prezzo"</span>, <span class="k2">0</span>, <span class="k2">2369</span>);', '<span class="k1">fold</span>(tl, <span class="k3">"#duo"</span>, <span class="k2">180</span>, <span class="k2">0</span>);']
code = panel('cd', *C, 920, 720, f'''
      <div style="height:70px;border-radius:40px 40px 0 0;background:rgba(255,255,255,0.06);display:flex;align-items:center;gap:14px;padding-left:34px"><i style="display:block;width:20px;height:20px;border-radius:50%;background:#ff5f57"></i><i style="display:block;width:20px;height:20px;border-radius:50%;background:#febc2e"></i><i style="display:block;width:20px;height:20px;border-radius:50%;background:#28c840"></i><span style="margin-left:20px;font:600 28px/1 {SF};color:#9a9aa6">scenes.py</span></div>
      <div style="position:absolute;left:46px;top:110px">{''.join(f'<div class="code cl" id="cl{k}">{l}</div>' for k, l in enumerate(CODE))}</div>''', ry=-60, cls='dk')
Q = (5400, 0, -400); RAD = 950
def ring(i, th, w, h, inner, label, col):
    import math
    x = Q[0] + math.sin(math.radians(th)) * RAD; z = Q[2] + math.cos(math.radians(th)) * RAD
    return panel(i, x, Q[1], z, w, h, inner + f'<div class="lab" style="bottom:-160px;color:{col}">{label}</div>', ry=th, cls='dk', style='overflow:visible')
wave = ''.join(f'<i class="wv" style="position:absolute;left:{40 + k * 19}px;top:{280 - v / 2}px;width:11px;height:{v}px;border-radius:6px;background:linear-gradient({CYAN},{BLUE})"></i>' for k, v in enumerate(WAVE))
SFX = ['whoosh', 'pop', 'ding', 'click', 'riser', 'thud', 'swipe', 'tick']
sfx = ''.join(f'<div class="sx" style="left:{40 + (k % 2) * 400}px;top:{50 + (k // 2) * 120}px">♪ {n}</div>' for k, n in enumerate(SFX))
cluster = (ring('r0', 0, 900, 560, wave, 'VOCE', CYAN)
           + ring('r1', 90, 560, 760, f'<div class="fr" style="position:absolute;inset:20px"><img src="assets/img/duo3d.jpg" alt=""/></div>', 'GRAFICA', '#bf5af2')
           + ring('r2', 180, 1000, 560, ''.join(f'<div class="fr" style="position:absolute;left:{30 + k * 330}px;top:40px;width:270px;height:480px"><img src="assets/img/f{k + 2}.jpg" alt=""/></div>' for k in range(3)), 'TRANSIZIONI', '#ff9f0a')
           + ring('r3', 270, 880, 560, sfx, 'SUONI', GRN))
V = (2700, -300, 1500); VA = 320
vpanel = panel('vp', *V, FW * 1.25, FH * 1.25, f'''<img src="assets/img/f1.jpg" style="position:absolute;inset:0;width:100%;height:100%" alt=""/>
      <video id="vv" class="clip" src="assets/video/duo-clip.mp4" data-start="{T['adesso'] - 0.3:.2f}" data-duration="{T['END'] - T['adesso'] + 0.3:.2f}" data-media-start="0.3" muted playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></video>''', ry=VA, cls='fr')
floor = panel('fl', 2600, 1300, -400, 16000, 16000, '', rx=90, cls='floor')
WORLD = floor + particles(160, spread=(11000, 3600, 9000), centre=(2700, -100, -300)) + deck + timeline + code + cluster + vpanel

# camera keyframes: [time, camera, ease of the move that ends there]; contiguous from 0 to the end
K = [[0.0, dict(x=0, y=-440, z=0, d=0, ry=-28, rx=4)],
     [T['niente'] - 0.1, dict(x=200, y=-160, z=-700, d=900, ry=58, rx=-10), 'sine.inOut'],
     [T['effects'] - 0.15, dict(x=B[0], y=B[1], z=B[2], d=250, ry=42, rx=-5), 'power3.inOut'],
     [T['solo'] - 0.15, dict(x=B[0], y=B[1], z=B[2], d=60, ry=20, rx=-2), 'sine.inOut'],
     [T['intelligenza'] + 0.1, dict(x=C[0], y=C[1], z=C[2], d=200, ry=74, rx=8), 'power3.inOut'],
     [T['voce'] - 0.25, dict(x=C[0], y=C[1], z=C[2], d=-40, ry=50, rx=-3), 'sine.inOut'],
     [T['voce'] + 0.05, dict(x=Q[0], y=Q[1], z=Q[2], d=RAD + 60, ry=0, rx=-6), 'power3.inOut'],
     [T['grafica'] - 0.2, dict(x=Q[0], y=Q[1], z=Q[2], d=RAD + 40, ry=-8, rx=-6), 'sine.inOut'],
     [T['grafica'] + 0.12, dict(x=Q[0], y=Q[1], z=Q[2], d=RAD + 40, ry=-90, rx=-4), 'power3.inOut'],
     [T['transizioni'] - 0.2, dict(x=Q[0], y=Q[1], z=Q[2], d=RAD + 20, ry=-98, rx=-4), 'sine.inOut'],
     [T['transizioni'] + 0.12, dict(x=Q[0], y=Q[1], z=Q[2], d=RAD + 160, ry=-180, rx=-6), 'power3.inOut'],
     [T['suoni'] - 0.25, dict(x=Q[0], y=Q[1], z=Q[2], d=RAD + 140, ry=-190, rx=-6), 'sine.inOut'],
     [T['suoni'] + 0.12, dict(x=Q[0], y=Q[1], z=Q[2], d=RAD + 60, ry=-270, rx=-4), 'power3.inOut'],
     [T['tutto'] - 0.05, dict(x=Q[0], y=Q[1], z=Q[2], d=RAD + 30, ry=-280, rx=-4), 'sine.inOut'],
     [T['tutto'] + 0.6, dict(x=2900, y=0, z=-300, d=5200, ry=-322, rx=-26), 'power3.out'],
     [T['vedere'] - 0.2, dict(x=2900, y=0, z=-300, d=4700, ry=-330, rx=-22), 'sine.inOut'],
     [T['END'] - 0.25, dict(x=V[0], y=V[1], z=V[2], d=380, ry=-VA, rx=0), 'power3.inOut'],
     [T['END'], dict(x=V[0], y=V[1], z=V[2], d=330, ry=-VA, rx=0), 'none']]
KJS = '[' + ', '.join('[%.2f, {%s}%s]' % (k[0], ', '.join(f'{a}: {b}' for a, b in k[1].items()), (', "%s"' % k[2]) if len(k) > 2 else '') for k in K) + ']'

add('w01', 'start', 'END', f'''      <div class="view" id="vw" data-layout-allow-overlap><div class="world" id="world" data-motion-blur="on">{WORLD}</div></div>
      <div class="ov" id="o1" style="top:170px" data-layout-allow-overlap><div style="font:600 70px/1.1 {SF};color:#d1d1d6">questo video</div><div id="o1b" style="font:800 118px/1.02 {SF};letter-spacing:-0.045em">non l’ha montato<br><span style="color:{CYAN}">nessuno.</span></div></div>
      <div class="ov" id="o2" style="top:260px;opacity:0" data-layout-allow-overlap><div style="font:600 70px/1.1 {SF};color:#d1d1d6">solo</div><div style="font:800 150px/1 {SF};letter-spacing:-0.05em;color:{CYAN}">un’AI</div></div>
      <div class="ov" id="o3" style="top:1420px;opacity:0" data-layout-allow-overlap><div style="font:700 74px/1.1 {SF}">e qualche riga di codice</div></div>
      <div class="ov" id="o4" style="top:700px;opacity:0" data-layout-allow-overlap><div style="font:900 300px/1 {SF};letter-spacing:-0.06em">TUTTO.</div></div>
      <div class="ov" id="o5" style="top:250px;opacity:0" data-layout-allow-overlap><div style="font:600 70px/1.1 {SF};color:#d1d1d6">e adesso</div><div style="font:800 116px/1.02 {SF};letter-spacing:-0.045em">ti faccio vedere <span style="color:{CYAN}">come</span></div></div>''',
    f'''    camPath(tl, "#world", {KJS});
    tl.fromTo("#o1b", {{ scale: 1.06 }}, {{ scale: 1, duration: 0.5, ease: "expo.out" }}, 0);
    tl.to("#o1", {{ opacity: 0, y: -60, filter: "blur(12px)", duration: 0.2 }}, «niente» - 0.25);
    tl.fromTo("#tl-x1", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.22, ease: "power2.out" }}, «effects» + 0.15);
    tl.fromTo("#tl-x2", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.22, ease: "power2.out" }}, «montatore» + 0.2);
    tl.fromTo("#o2", {{ opacity: 0, scale: 1.4, filter: "blur(16px)" }}, {{ opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }}, «intelligenza»);
    tl.fromTo(".cl", {{ opacity: 0, x: -40 }}, {{ opacity: 1, x: 0, duration: 0.18, stagger: 0.16 }}, «intelligenza» + 0.2);
    tl.fromTo("#o3", {{ opacity: 0, y: 40 }}, {{ opacity: 1, y: 0, duration: 0.24, ease: "expo.out" }}, «riga» - 0.2);
    tl.to("#o2, #o3", {{ opacity: 0, filter: "blur(12px)", duration: 0.16 }}, «voce» - 0.3);
    tl.fromTo(".wv", {{ scaleY: 0.1 }}, {{ scaleY: 1, duration: 0.3, ease: "back.out(2)", stagger: 0.008 }}, «voce» - 0.2);
    tl.fromTo(".sx", {{ opacity: 0, scale: 0.4 }}, {{ opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2.4)", stagger: 0.05 }}, «suoni» - 0.2);
    tl.fromTo("#o4", {{ opacity: 0, scale: 2.2, filter: "blur(20px)" }}, {{ opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.24, ease: "expo.out" }}, «tutto» - 0.05);
    tl.to("#o4", {{ opacity: 0, scale: 0.8, duration: 0.2 }}, «adesso» - 0.15);
    tl.fromTo("#o5", {{ opacity: 0, y: 40, filter: "blur(12px)" }}, {{ opacity: 1, y: 0, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }}, «adesso»);''', '''
    .sx { position: absolute; width: 380px; height: 96px; border-radius: 48px; background: rgba(48,209,88,0.16); color: #fff; font: 700 46px/96px "SF Pro Display"; padding-left: 36px; }''',
    cam=False, ground='w3',
    fx=[('whoosh-cinematic', 'start', 0.0, 0.4), ('bass-drop', 'start', 0.0, 0.4), ('whoosh', 'niente', -0.5, 0.3), ('tear', 'effects', 0.15, 0.3), ('tear', 'montatore', 0.2, 0.3),
        ('whoosh-cinematic', 'solo', -0.1, 0.32), ('typing', 'intelligenza', 0.2, 0.22), ('typing', 'artificiale', 0.3, 0.2), ('swipe', 'voce', -0.25, 0.28),
        ('whoosh-short', 'grafica', -0.15, 0.24), ('whoosh-short', 'transizioni', -0.15, 0.24), ('whoosh-short', 'suoni', -0.15, 0.24), ('pop', 'suoni', 0.0, 0.2),
        ('impact-bass-1', 'tutto', -0.05, 0.4), ('whoosh-cinematic', 'tutto', -0.05, 0.3), ('whoosh', 'vedere', -0.3, 0.3), ('riser', 'adesso', 0.0, 0.14)])
