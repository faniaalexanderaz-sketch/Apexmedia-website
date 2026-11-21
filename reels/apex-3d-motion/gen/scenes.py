# apex-3d-motion: "Questo video non l'ha montato nessuno." One continuous 3D world, a camera that flies through ten stations:
# our reels, a timeline, the code, then a giant number for each of the five rules that keep people watching, a ring of frames the camera
# circles (the loop), the question (are video makers finished?), the opinion, the keyword (MOTION) and the way back to the first frame.
# Everything said about the method is how these reels are made (voice without pauses at ~3.3 words/s, a new picture every 1-2 s, only numbers
# and key words on screen, a sound on every cut, a loop). "Chi sa raccontare vale più di prima" is the author's opinion, said as such.
import sys, math
sys.path.insert(0, '.'); sys.path.insert(0, '../../apex-kit')
from kit import *
from ui import *
from times import T
from wave import WAVE
BED = 0.06; ROOT = '#07070a'
BLUE = '#0a84ff'; CYAN = '#64d2ff'; RED = '#ff453a'; GRN = '#30d158'; YEL = '#ffd60a'; PURP = '#bf5af2'; ORNG = '#ff9f0a'; WHITE = '#f5f5f7'
THEME = WORLDCSS + f'''
    .st.w3 {{ background: radial-gradient(120% 80% at 50% 40%, #15161c 0%, {ROOT} 70%); color: #fff; }}
    .floor {{ background-image: linear-gradient(rgba(100,210,255,0.16) 3px, transparent 3px), linear-gradient(90deg, rgba(100,210,255,0.16) 3px, transparent 3px); background-size: 400px 400px; -webkit-mask-image: radial-gradient(closest-side, #000 35%, transparent 100%); mask-image: radial-gradient(closest-side, #000 35%, transparent 100%); }}
    .fr {{ border-radius: 34px; overflow: hidden; box-shadow: 0 0 0 3px rgba(255,255,255,0.14), 0 60px 120px -20px rgba(0,0,0,0.9); background: #000; }}
    .fr img {{ width: 100%; height: 100%; display: block; }}
    .dk {{ border-radius: 40px; background: #16171e; box-shadow: 0 0 0 3px rgba(255,255,255,0.10), 0 60px 140px -30px rgba(0,0,0,0.9); color: #fff; }}
    .wc {{ border-radius: 40px; background: #fff; color: #1d1d1f; box-shadow: 0 60px 140px -30px rgba(0,0,0,0.9); }}
    .num {{ font: 900 1000px/1 "SF Pro Display"; letter-spacing: -0.06em; text-align: center; background: linear-gradient(180deg, #ffffff 0%, {CYAN} 55%, {BLUE} 100%); -webkit-background-clip: text; background-clip: text; color: transparent; opacity: 0.92; }}
    .ov {{ position: absolute; left: 0; right: 0; text-align: center; z-index: 20; filter: drop-shadow(0 8px 30px rgba(0,0,0,0.85)); opacity: 0; }}
    .ovs {{ font: 600 64px/1.1 "SF Pro Display"; color: #d1d1d6; }}
    .ovb {{ font: 800 112px/1.02 "SF Pro Display"; letter-spacing: -0.045em; }}
    .tag {{ display: inline-block; padding: 14px 30px; border-radius: 999px; font: 700 40px/1 "SF Pro Display"; letter-spacing: 0.14em; color: #000; background: {CYAN}; }}
    .code {{ font: 500 34px/1.55 "SF Mono", "Menlo", monospace; white-space: pre; }}
    .k1 {{ color: #ff7ab2; }} .k2 {{ color: #64d2ff; }} .k3 {{ color: #ffd60a; }} .k4 {{ color: #9a9aa6; }}
'''
R = Reel(T, THEME, grounds={'w3': (' dark w3', ROOT)})
add = R.add
FW, FH = 540, 960
def fr(i, x, y, z, n, ry=0, s=1.0): return panel(i, x, y, z, FW * s, FH * s, f'<img src="assets/img/f{n}.jpg" alt=""/>', ry=ry, cls='fr')
def floor(i, x, z, w=5200, d=5200, y=1300): return panel(i, x, y, z, w, d, '', rx=90, cls='floor')
def bignum(i, x, y, z, n, ry=0): return panel(i, x, y, z, 900, 1000, f'<div class="num">{n}</div>', ry=ry)

# ================================================================ STATIONS
W = []
# S0: the stack of our reels, the timeline, the code (as in the demo)
W += [fr(f'dk{i}', i * 70, 0, -i * 300, i + 1, ry=-10) for i in range(6)]
B = (2100, -80, -900)
W.append(panel('tl', *B, 1000, 640, f'''
      <div style="position:absolute;left:50px;top:44px;font:700 36px/1 {SF};letter-spacing:0.18em;color:#9a9aa6">TIMELINE</div>
      {''.join(f'<i style="position:absolute;left:{x}px;top:{110 + k * 56}px;width:{w}px;height:40px;border-radius:10px;background:{c}"></i>' for k, (x, w, c) in enumerate([(50, 380, '#5e5ce6'), (220, 520, GRN), (90, 300, ORNG), (420, 420, CYAN)]))}
      <div style="position:absolute;left:50px;top:360px;font:800 84px/1 {SF};letter-spacing:-0.03em"><span style="position:relative;display:inline-block">After Effects<i id="tl-x1" style="position:absolute;left:-10px;right:-10px;top:52%;height:14px;border-radius:7px;background:{RED};transform-origin:0 50%"></i></span></div>
      <div style="position:absolute;left:50px;top:480px;font:800 84px/1 {SF};letter-spacing:-0.03em"><span style="position:relative;display:inline-block">Montatore<i id="tl-x2" style="position:absolute;left:-10px;right:-10px;top:52%;height:14px;border-radius:7px;background:{RED};transform-origin:0 50%"></i></span></div>''', ry=-30, cls='dk'))
C = (3500, 260, 250)
CODE = ['<span class="k4">// ogni scena è codice</span>', '<span class="k1">camPath</span>(tl, <span class="k3">"#world"</span>, [', '  [<span class="k2">0.0</span>, { d: <span class="k2">0</span>, ry: <span class="k2">-28</span> }],',
        '  [<span class="k2">2.2</span>, { x: <span class="k2">2100</span>, ry: <span class="k2">42</span> }],', ']);', '<span class="k1">blurIn</span>(tl, <span class="k3">"#titolo"</span>, <span class="k2">0.2</span>);',
        '<span class="k1">count</span>(tl, <span class="k3">"#prezzo"</span>, <span class="k2">0</span>, <span class="k2">2369</span>);', '<span class="k1">fold</span>(tl, <span class="k3">"#duo"</span>, <span class="k2">180</span>, <span class="k2">0</span>);']
W.append(panel('cd', *C, 920, 720, f'''
      <div style="height:70px;border-radius:40px 40px 0 0;background:rgba(255,255,255,0.06);display:flex;align-items:center;gap:14px;padding-left:34px"><i style="display:block;width:20px;height:20px;border-radius:50%;background:#ff5f57"></i><i style="display:block;width:20px;height:20px;border-radius:50%;background:#febc2e"></i><i style="display:block;width:20px;height:20px;border-radius:50%;background:#28c840"></i><span style="margin-left:20px;font:600 28px/1 {SF};color:#9a9aa6">scenes.py</span></div>
      <div style="position:absolute;left:46px;top:110px">{''.join(f'<div class="code cl" id="cl{k}">{l}</div>' for k, l in enumerate(CODE))}</div>''', ry=-60, cls='dk'))
# S1: the giant 5 and five closed rule cards
M1 = (5200, -150, -1300)
W.append(bignum('n5a', *M1, 5))
W += [panel(f'rc{k}', 4600 + k * 300, 560, -800, 240, 330, f'<div style="font:900 150px/330px {SF};text-align:center;color:{CYAN}">{k + 1}</div>', ry=(k - 2) * -8, cls='dk rcard') for k in range(5)]
W.append(panel('pb', 5200, 860, -800, 1300, 60, f'<div style="position:absolute;inset:0;border-radius:30px;background:rgba(255,255,255,0.14)"></div><i id="pbf" style="position:absolute;left:0;top:0;bottom:0;width:1300px;border-radius:30px;background:linear-gradient(90deg,{CYAN},{BLUE});transform-origin:0 50%"></i>'))
# S2: rule 1 - the voice never stops (giant 1, the real waveform, a feed that scrolls away)
G1 = (6800, -100, -800); WV = (7400, 0, -200); PH = (8200, 0, 250)
W.append(bignum('n1', *G1, 1, ry=20))
wave = ''.join(f'<i class="wv" style="position:absolute;left:{40 + k * 21}px;top:{300 - v / 2}px;width:12px;height:{v}px;border-radius:6px;background:linear-gradient({CYAN},{BLUE})"></i>' for k, v in enumerate(WAVE))
W.append(panel('wvp', *WV, 1420, 600, wave + f'<div id="wps" style="position:absolute;right:40px;top:36px;font:800 64px/1 {SF};color:{YEL};opacity:0">3+ parole / s</div>', ry=-15, cls='dk'))
feed = ''.join(f'<div class="fd" id="fd{k}" style="position:absolute;left:30px;top:{40 + k * 0}px;width:460px;height:820px;border-radius:30px;overflow:hidden"><img src="assets/img/f{k + 7}.jpg" style="width:100%;height:100%" alt=""/></div>' for k in range(3))
W.append(panel('ph', *PH, 520, 900, feed[::-1] if False else feed, ry=-40, cls='dk', style='overflow:hidden'))
# S3: rule 2 - a new picture every 1-2 seconds (giant 2, a long row of frames)
G2 = (9100, -100, -1100)
W.append(bignum('n2', *G2, 2))
ROW = [(9600 + k * 520, k % 16 + 1) for k in range(10)]
W += [fr(f'rw{k}', x, 0, -500, n) for k, (x, n) in enumerate(ROW)]
# S4: rule 3 - only numbers and key words (giant 3, the sentence crossed out, the number)
G3 = (15350, -100, -1400); XP = (14750, 0, -200); YP = (15950, 0, -250)
W.append(bignum('n3', *G3, 3))
W.append(panel('xp', *XP, 860, 380, f'''<div style="position:absolute;left:50px;right:50px;top:70px;font:600 50px/1.3 {SF};color:#1d1d1f;word-break:break-all">Il nuovo iPhone che si piega in due costa duemila&shy;trecento&shy;sessanta&shy;nove euro</div>
      {''.join(f'<i class="xs" style="position:absolute;left:40px;right:40px;top:{104 + k * 65}px;height:10px;border-radius:5px;background:{RED};transform-origin:0 50%"></i>' for k in range(3))}''', ry=20, cls='wc'))
W.append(panel('yp', *YP, 700, 620, f'''<div style="position:absolute;left:0;right:0;top:150px;text-align:center;font:900 210px/1 {SF};letter-spacing:-0.05em">2.369 €</div>
      <svg id="ych" viewBox="0 0 100 100" width="140" height="140" style="position:absolute;left:280px;top:420px"><circle cx="50" cy="50" r="46" fill="{GRN}"/><path d="M28 52 L44 68 L74 36" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>''', ry=-20, cls='dk'))
# S5: rule 4 - a sound on every cut (giant 4, an audio track with markers)
G4 = (17500, -100, -1100); AP = (18000, 0, -300)
W.append(bignum('n4', *G4, 4))
track = ''.join(f'<i style="position:absolute;left:{60 + k * 22}px;top:{260 - h / 2}px;width:12px;height:{h}px;border-radius:6px;background:rgba(255,255,255,0.28)"></i>' for k, h in enumerate([abs(int(60 * math.sin(k * 0.7)) + int(40 * math.sin(k * 0.23))) + 20 for k in range(62)]))
marks = ''.join(f'<div class="mk" id="mk{k}" style="left:{x}px;border-color:{c}"><b style="background:{c}">{n}</b></div>' for k, (x, n, c) in enumerate([(220, 'click', CYAN), (700, 'colpo', ORNG), (1180, 'fruscio', PURP)]))
W.append(panel('ap', *AP, 1500, 560, track + marks, cls='dk'))
# S6: rule 5 - the ending goes back to the start (a ring of frames the camera circles)
RC = (20900, 0, -700); RR = 1150
for k in range(10):
    th = k * 36; x = RC[0] + math.sin(math.radians(th)) * RR; z = RC[2] + math.cos(math.radians(th)) * RR
    W.append(fr(f'rg{k}', x, 0, z, k + 1, ry=th, s=0.8))
W += [panel(f'n5r{k}', RC[0], -100, RC[2], 900, 1000, f'<div class="num">5</div>', ry=a) for k, a in enumerate([0, 90, 180, 270])]
# S7: the question
Q = (23500, -150, -300)
W.append(panel('qp', *Q, 1000, 1000, f'''<div style="position:absolute;left:0;right:0;top:90px;text-align:center;font:600 72px/1.1 {SF};color:#d1d1d6">i videomaker</div>
      <div style="position:absolute;left:0;right:0;top:190px;text-align:center;font:900 150px/1 {SF};letter-spacing:-0.05em">sono finiti?</div>
      <div id="qy" style="position:absolute;left:80px;top:560px;width:390px;height:260px;border-radius:50px;background:{GRN};color:#04210d;font:900 150px/260px {SF};text-align:center">SÌ</div>
      <div id="qn" style="position:absolute;right:80px;top:560px;width:390px;height:260px;border-radius:50px;background:{RED};color:#fff;font:900 150px/260px {SF};text-align:center">NO</div>''', cls='dk'))
# S8: the opinion - NO, only the tool changes
N = (25000, -150, -600); TC = (25900, 0, -200); TK = (26600, 0, -200)
W.append(panel('np', *N, 1000, 700, f'<div style="font:900 520px/700px {SF};letter-spacing:-0.06em;text-align:center;color:{RED}">NO.</div>', ry=-20))
CAMSVG = f'<svg viewBox="0 0 200 140" width="300" height="210" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="round"><rect x="10" y="30" width="130" height="90" rx="16"/><path d="M140 60 L190 34 V116 L140 90 Z"/><circle cx="50" cy="20" r="14"/><circle cx="96" cy="20" r="14"/></svg>'
CODESVG = f'<svg viewBox="0 0 200 140" width="300" height="210" fill="none" stroke="{CYAN}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M60 30 L16 70 L60 110 M140 30 L184 70 L140 110 M116 18 L84 122"/></svg>'
W.append(panel('tc', *TC, 560, 560, f'<div style="position:absolute;left:130px;top:110px">{CAMSVG}</div><div style="position:absolute;left:0;right:0;top:390px;text-align:center;font:700 54px/1 {SF};color:#9a9aa6">ieri</div>', ry=-30, cls='dk'))
W.append(panel('tk', *TK, 560, 560, f'<div style="position:absolute;left:130px;top:110px">{CODESVG}</div><div style="position:absolute;left:0;right:0;top:390px;text-align:center;font:700 54px/1 {SF};color:{CYAN}">oggi</div>', ry=-40, cls='dk'))
# S9: the keyword - a phone with the comment bar and the keyboard, then the DM
PC = (28300, 0, 0)
W.append(panel('pc', *PC, 760, 1400, f'''<div style="position:absolute;inset:0;border-radius:70px;background:#000;box-shadow:0 0 0 14px #2a2a2a"></div>
      <div style="position:absolute;left:0;right:0;top:120px;text-align:center;font:600 50px/1 {SF};color:#d1d1d6">scrivi nei commenti</div>
      <div style="position:absolute;left:0;right:0;top:200px;text-align:center;font:900 150px/1 {SF};letter-spacing:-0.05em;color:{CYAN}">MOTION</div>
      <div style="position:absolute;left:-160px;top:430px;width:1080px;transform:scale(0.7);transform-origin:50% 0">{commentbar('pk', 'MOTION', 0)}</div>
      <div style="position:absolute;left:-160px;top:760px;width:1080px;height:690px;transform:scale(0.7);transform-origin:50% 0">{keyboard('pk', 0, dark=True)}</div>''', style='overflow:visible'))
W.append(panel('dmp', PC[0] + 40, 330, 220, 900, 420, dmcard('dmc', 0, 'Il metodo completo', 'come creo questi video', icon=BLUE), style='overflow:visible'))
# floors under each station, particles along the whole path
for k, (x, z) in enumerate([(1500, -500), (5200, -800), (7600, -200), (11800, -500), (15500, -400), (17900, -500), (20900, -700), (23600, -300), (25900, -300), (28300, 0)]):
    W.append(floor(f'fl{k}', x, z))
W.append(particles(320, spread=(31000, 3400, 5000), centre=(14000, -200, -400)))
WORLD = ''.join(W)

# ================================================================ CAMERA
P0 = dict(x=0, y=-440, z=0, d=0, ry=-28, rx=4)
def at(p, **kw): return dict(x=p[0], y=p[1], z=p[2], **kw)
K = [[0.0, P0],
     [T['niente'] - 0.1, dict(x=200, y=-160, z=-700, d=900, ry=58, rx=-10), 'sine.inOut'],
     [T['effects'] - 0.15, at(B, d=250, ry=42, rx=-5), 'power3.inOut'],
     [T['solo'] - 0.15, at(B, d=60, ry=20, rx=-2), 'sine.inOut'],
     [T['intelligenza'] + 0.1, at(C, d=200, ry=74, rx=8), 'power3.inOut'],
     [T['resta'] - 0.1, at(C, d=-40, ry=50, rx=-3), 'sine.inOut'],
     [T['resta'] + 0.4, dict(x=M1[0], y=0, z=-1000, d=1700, ry=-22, rx=-8), 'power3.inOut'],
     [T['cinque'], dict(x=M1[0], y=0, z=-1000, d=1250, ry=8, rx=-5), 'sine.inOut'],
     [T['uno'] - 0.25, dict(x=M1[0], y=100, z=-900, d=950, ry=-10, rx=-3), 'sine.inOut'],
     [T['uno'] + 0.15, at(G1, d=900, ry=-28, rx=-4), 'power3.inOut'],
     [T['voce'], at(WV, d=420, ry=25, rx=-3), 'power3.inOut'],
     [T['pause'], dict(x=WV[0] + 250, y=0, z=WV[2], d=260, ry=8, rx=-2), 'sine.inOut'],
     [T['respiri'] - 0.2, at(PH, d=380, ry=50, rx=4), 'power3.inOut'],
     [T['due'] - 0.25, at(PH, d=260, ry=36, rx=2), 'sine.inOut'],
     [T['due'] + 0.15, at(G2, d=1000, ry=-25, rx=-4), 'power3.inOut'],
     [T['immagine'] + 0.1, dict(x=ROW[0][0], y=0, z=-500, d=700, ry=-38, rx=-2), 'power3.inOut'],
     [T['annoiarsi'] + 0.3, dict(x=ROW[-1][0], y=0, z=-500, d=700, ry=-38, rx=-2), 'power1.inOut'],
     [T['tre3'] - 0.2, dict(x=ROW[-1][0], y=0, z=-500, d=560, ry=-22, rx=-2), 'sine.inOut'],
     [T['tre3'] + 0.2, at(G3, d=1000, ry=-10, rx=-4), 'power3.inOut'],
     [T['numeri'] - 0.2, at(YP, d=330, ry=20, rx=-2), 'power3.inOut'],
     [T['frase'] - 0.15, at(XP, d=330, ry=-20, rx=-2), 'power3.inOut'],
     [T['quattro'] - 0.25, at(XP, d=200, ry=-10, rx=-1), 'sine.inOut'],
     [T['quattro'] + 0.15, at(G4, d=1000, ry=15, rx=-4), 'power3.inOut'],
     [T['suono'] - 0.3, dict(x=AP[0] - 420, y=0, z=AP[2], d=380, ry=-15, rx=-3), 'power3.inOut'],
     [T['dentro'], dict(x=AP[0] + 420, y=0, z=AP[2], d=300, ry=12, rx=-3), 'sine.inOut'],
     [T['cinque5'] + 0.2, at(RC, d=2500, ry=0, rx=-12), 'power3.inOut'],
     [T['accorgertene'] + 0.5, at(RC, d=2000, ry=-360, rx=-8), 'power1.inOut'],
     [T['adesso'] + 0.2, at(Q, d=650, ry=-372, rx=-2), 'power3.inOut'],
     [T['si'], at(Q, d=420, ry=-364, rx=-1), 'sine.inOut'],
     [T['no2'] - 0.15, at(N, d=500, ry=-340, rx=-2), 'power3.inOut'],
     [T['cambia'] - 0.1, at(N, d=320, ry=-344, rx=-1), 'sine.inOut'],
     [T['strumento'], dict(x=(TC[0] + TK[0]) / 2, y=-60, z=-200, d=520, ry=-354, rx=-3), 'power3.inOut'],
     [T['se'] + 0.15, at(PC, d=420, ry=-366, rx=0), 'power3.inOut'],
     [T['mando'], at(PC, d=300, ry=-360, rx=0), 'sine.inOut'],
     [T['ricordati'] + 0.05, dict(x=14000, y=-1800, z=-500, d=13000, ry=-392, rx=-30), 'power2.in'],
     [T['END'], dict(P0, ry=-388), 'power3.out']]
KJS = '[' + ', '.join('[%.2f, {%s}%s]' % (k[0], ', '.join(f'{a}: {b}' for a, b in k[1].items()), (', "%s"' % k[2]) if len(k) > 2 else '') for k in K) + ']'

# ================================================================ SCREEN TITLES (2D, over the world)
def ov(i, top, html): return f'<div class="ov" id="{i}" style="top:{top}px" data-layout-allow-overlap>{html}</div>'
HOOK = f'<div class="ovs">questo video</div><div class="ovb">non l’ha montato<br><span style="color:{CYAN}">nessuno.</span></div>'
OVS = (ov('o1', 170, HOOK)
       + ov('o2', 220, f'<div class="ovs">solo</div><div class="ovb" style="font-size:150px;color:{CYAN}">un’AI</div>')
       + ov('o3', 1450, '<div class="ovb" style="font-size:74px">e qualche riga di codice</div>')
       + ov('o4', 200, f'<div class="ovs">resta fino alla fine</div><div class="ovb"><span style="color:{CYAN}">5 regole</span></div>')
       + ov('o5', 1500, '<div class="ovb" style="font-size:70px">fino all’ultimo secondo</div>')
       + ov('r1', 200, f'<span class="tag">REGOLA 1</span><div class="ovb" style="margin-top:24px">la voce non si ferma</div>')
       + ov('r2', 200, f'<span class="tag">REGOLA 2</span><div class="ovb" style="margin-top:24px">un’immagine nuova<br>ogni <span style="color:{CYAN}">1–2 s</span></div>')
       + ov('r3', 200, f'<span class="tag">REGOLA 3</span><div class="ovb" style="margin-top:24px">solo numeri<br>e parole chiave</div>')
       + ov('r4', 200, f'<span class="tag">REGOLA 4</span><div class="ovb" style="margin-top:24px">ogni stacco<br>ha un suono</div>')
       + ov('r5', 200, f'<span class="tag">REGOLA 5</span><div class="ovb" style="margin-top:24px">il finale torna<br>all’inizio</div>')
       + ov('o6', 180, f'<div class="ovs">secondo me</div><div class="ovb" style="font-size:96px">chi sa raccontare<br>vale <span style="color:{CYAN}">più di prima</span></div>')
       + ov('o7', 1480, '<div class="ovb" style="font-size:78px">cambia solo lo strumento</div>')
       + ov('o8', 200, f'<div class="ovs">ti mando</div><div class="ovb" style="font-size:100px">il metodo completo</div>')
       + ov('o9', 380, '<div class="ovs" style="font-size:76px">e ricordati che…</div>')
       + ov('oz', 170, HOOK))
def show(i, t, t_out=None, kind='blur'):
    s = (f'    tl.fromTo("#{i}", {{ opacity: 0, scale: 1.35, filter: "blur(16px)" }}, {{ opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }}, {t});\n' if kind == 'blur'
         else f'    tl.fromTo("#{i}", {{ opacity: 0, y: 50 }}, {{ opacity: 1, y: 0, duration: 0.26, ease: "expo.out" }}, {t});\n')
    if t_out: s += f'    tl.to("#{i}", {{ opacity: 0, y: -40, filter: "blur(12px)", duration: 0.18 }}, {t_out});\n'
    return s
JS = (f'    camPath(tl, "#world", {KJS});\n'
      '    gsap.set("#o1", { opacity: 1 });\n'
      '    tl.fromTo("#o1 .ovb", { scale: 1.06 }, { scale: 1, duration: 0.5, ease: "expo.out" }, 0);\n'
      '    tl.to("#o1", { opacity: 0, y: -60, filter: "blur(12px)", duration: 0.2 }, «niente» - 0.25);\n'
      '    tl.fromTo("#tl-x1", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power2.out" }, «effects» + 0.15);\n'
      '    tl.fromTo("#tl-x2", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power2.out" }, «montatore» + 0.2);\n'
      + show('o2', '«intelligenza»', '«resta» - 0.25')
      + '    tl.fromTo(".cl", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.18, stagger: 0.14 }, «intelligenza» + 0.2);\n'
      + show('o3', '«riga» - 0.2', '«resta» - 0.25', 'up')
      + show('o4', '«resta» + 0.1', '«uno» - 0.3')
      + '    tl.fromTo(".rcard", { opacity: 0, y: 200 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(1.8)", stagger: 0.1 }, «cinque»);\n'
      + '    tl.fromTo("#pbf", { scaleX: 0.04 }, { scaleX: 1, duration: «secondo» - «guardare» + 0.4, ease: "power2.inOut" }, «guardare»);\n'
      + show('o5', '«ultimo» - 0.2', '«uno» - 0.3', 'up')
      + show('r1', '«uno» + 0.1', '«due» - 0.25')
      + '    tl.fromTo(".wv", { scaleY: 0.08 }, { scaleY: 1, duration: 0.3, ease: "back.out(2)", stagger: 0.012 }, «voce» - 0.2);\n'
      + '    tl.fromTo("#wps", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2.4)" }, «tre» - 0.1);\n'
      + '    tl.to("#fd2", { y: -1100, duration: 0.3, ease: "power3.in" }, «scorrono» - 0.1);\n'
      + '    tl.to("#fd1", { y: -1100, duration: 0.3, ease: "power3.in" }, «scorrono» + 0.15);\n'
      + show('r2', '«due» + 0.1', '«tre3» - 0.25')
      + show('r3', '«tre3» + 0.1', '«quattro» - 0.25')
      + '    tl.fromTo("#ych", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.3, ease: "back.out(3)" }, «chiave» - 0.1);\n'
      + '    tl.fromTo(".xs", { scaleX: 0 }, { scaleX: 1, duration: 0.18, ease: "power2.out", stagger: 0.07 }, «intera» - 0.1);\n'
      + show('r4', '«quattro» + 0.1', '«cinque5» - 0.25')
      + '    tl.fromTo("#mk0", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.24, ease: "back.out(2.4)" }, «click» - 0.05);\n'
      + '    tl.fromTo("#mk1", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.24, ease: "back.out(2.4)" }, «colpo» - 0.05);\n'
      + '    tl.fromTo("#mk2", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.24, ease: "back.out(2.4)" }, «fruscio» - 0.05);\n'
      + show('r5', '«cinque5» + 0.1', '«adesso» - 0.2')
      + '    tl.fromTo("#qy", { scale: 1 }, { scale: 1.1, duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }, «si»);\n'
      + '    tl.fromTo("#qn", { scale: 1 }, { scale: 1.1, duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }, «no»);\n'
      + show('o6', '«raccontare» - 0.2', '«strumento» - 0.1')
      + show('o7', '«strumento»', '«se» + 0.05', 'up')
      + commentbar_js('pk', '«motion»', 0.08) + keys_js('pk', 'MOTION', '«motion»', 0.08)
      + '    tl.fromTo("#dmc-dm", { opacity: 0, y: -400, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.4)" }, «mando» - 0.3);\n'
      + show('o9', '«ricordati» + 0.02', 'DUR - 0.36', 'up')
      + '    gsap.set("#oz", { opacity: 0 });\n'
      + '    tl.fromTo("#oz", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.in" }, DUR - 0.3);\n')

add('m01', 'start', 'END', f'''      <div class="view" id="vw" data-layout-allow-overlap><div class="world" id="world">{WORLD}</div></div>
{OVS}''', JS, KBCSS + '''
    .mk { position: absolute; top: 60px; width: 8px; height: 420px; border-left: 8px solid; opacity: 0; }
    .mk b { position: absolute; left: -10px; top: -10px; padding: 12px 26px; border-radius: 999px; color: #000; font: 800 46px/1 "SF Pro Display"; white-space: nowrap; }''',
    cam=False, ground='w3',
    fx=[('whoosh-cinematic', 'start', 0.0, 0.4), ('bass-drop', 'start', 0.0, 0.4), ('whoosh', 'niente', -0.5, 0.3), ('tear', 'effects', 0.15, 0.3), ('tear', 'montatore', 0.2, 0.3),
        ('whoosh-cinematic', 'solo', -0.1, 0.3), ('typing', 'intelligenza', 0.2, 0.2), ('typing', 'artificiale', 0.3, 0.18),
        ('whoosh-cinematic', 'resta', -0.1, 0.32), ('pop', 'cinque', 0.0, 0.2), ('pop', 'cinque', 0.2, 0.18), ('pop', 'cinque', 0.4, 0.18), ('riser', 'guardare', 0.0, 0.12),
        ('whoosh', 'uno', -0.15, 0.3), ('impact-bass-1', 'uno', 0.15, 0.36), ('swipe', 'voce', -0.3, 0.26), ('ding', 'tre', -0.1, 0.22), ('whoosh-short', 'scorrono', -0.1, 0.24), ('whoosh-short', 'scorrono', 0.15, 0.2),
        ('whoosh', 'due', -0.15, 0.3), ('impact-bass-1', 'due', 0.15, 0.36), ('tick', 'nuova', 0.0, 0.18), ('tick', 'ogni', 0.2, 0.18), ('tick', 'secondi', 0.0, 0.18), ('tick', 'cervello', 0.0, 0.18), ('tick', 'annoiarsi', 0.0, 0.18),
        ('whoosh', 'tre3', -0.15, 0.3), ('impact-bass-1', 'tre3', 0.15, 0.36), ('ding', 'chiave', -0.1, 0.24), ('tear', 'intera', -0.1, 0.3),
        ('whoosh', 'quattro', -0.15, 0.3), ('impact-bass-1', 'quattro', 0.15, 0.36), ('click', 'click', 0.0, 0.5), ('thud', 'colpo', 0.0, 0.5), ('swoosh', 'fruscio', 0.0, 0.45),
        ('whoosh', 'cinque5', -0.15, 0.3), ('impact-bass-1', 'cinque5', 0.15, 0.36), ('whoosh-cinematic', 'finale', 0.5, 0.3), ('whoosh-cinematic', 'prima', 0.0, 0.3),
        ('whoosh', 'adesso', -0.1, 0.3), ('pop', 'si', 0.0, 0.26), ('pop', 'no', 0.0, 0.26), ('stamp', 'no2', -0.1, 0.4), ('whoosh', 'strumento', -0.3, 0.26),
        ('whoosh', 'se', -0.1, 0.26), ('typing', 'motion', -0.05, 0.24), ('typing', 'motion', 0.25, 0.2), ('notif', 'mando', -0.3, 0.28),
        ('whoosh-cinematic', 'ricordati', 0.0, 0.36), ('riser', 'ricordati', 0.2, 0.14)])
