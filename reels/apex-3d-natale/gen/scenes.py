# apex-3d-natale: "Babbo Natale è rosso per colpa della Coca-Cola. Lo pensano in tantissimi. E non è vero."
# One continuous 3D world in Christmas colours; the camera flies from a vintage postcard to a gift box, along a row of postcards,
# to 1915, to 1931, up a spiral of 34 years (1931-1964), to the lesson and the keyword (NATALE), and back to the first frame.
# Verified facts: Coca-Cola's own FAQ says it did not create Santa Claus nor his red coat; red-suited Santas were common in early 1900s
# illustrations (Snopes cites 1906, 1908, 1925); White Rock used Santa in ads from 1915 (mineral water) and 1923; Coca-Cola commissioned
# Haddon Sundblom in 1931 and he painted its Santa every year until 1964. The two vintage pictures are generated, generic, without brands.
import sys, math
sys.path.insert(0, '.'); sys.path.insert(0, '../../apex-kit')
from kit import *
from ui import *
from times import T
BED = 0.07; ROOT = '#0b1020'
RED = '#d4202c'; CREAM = '#fff6e6'; GOLD = '#f2c14e'; GRN = '#1f7a4d'; WHITE = '#ffffff'; BLUE = '#0a84ff'
THEME = WORLDCSS + f'''
    .st.xm {{ background: radial-gradient(120% 80% at 50% 35%, #1a2140 0%, {ROOT} 70%); color: #fff; }}
    .floor {{ background-image: radial-gradient(circle, rgba(255,255,255,0.22) 3px, transparent 4px); background-size: 160px 160px; -webkit-mask-image: radial-gradient(closest-side, #000 35%, transparent 100%); mask-image: radial-gradient(closest-side, #000 35%, transparent 100%); }}
    .pc {{ border-radius: 22px; overflow: hidden; box-shadow: 0 0 0 10px {CREAM}, 0 60px 120px -20px rgba(0,0,0,0.9); background: {CREAM}; }}
    .pc img {{ width: 100%; height: 100%; display: block; }}
    .rd {{ border-radius: 40px; background: {RED}; color: #fff; box-shadow: 0 60px 140px -30px rgba(0,0,0,0.9); }}
    .dk {{ border-radius: 40px; background: #161b2e; box-shadow: 0 0 0 3px rgba(255,255,255,0.10), 0 60px 140px -30px rgba(0,0,0,0.9); color: #fff; }}
    .cr {{ border-radius: 30px; background: {CREAM}; color: #3a1d14; box-shadow: 0 60px 140px -30px rgba(0,0,0,0.9); }}
    .num {{ font: 900 560px/1 "SF Pro Display"; letter-spacing: -0.06em; text-align: center; background: linear-gradient(180deg, #ffffff 0%, {GOLD} 60%, #c9862b 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }}
    .ov {{ position: absolute; left: 0; right: 0; text-align: center; z-index: 20; filter: drop-shadow(0 8px 30px rgba(0,0,0,0.85)); opacity: 0; }}
    .ovs {{ font: 600 64px/1.1 "SF Pro Display"; color: #e5e5ea; }}
    .ovb {{ font: 800 112px/1.02 "SF Pro Display"; letter-spacing: -0.045em; }}
    .tag {{ display: inline-block; padding: 14px 30px; border-radius: 999px; font: 700 40px/1 "SF Pro Display"; letter-spacing: 0.14em; color: #2a0a0a; background: {GOLD}; }}
    .face {{ position: absolute; }}
'''
R = Reel(T, THEME, grounds={'xm': (' dark xm', ROOT)})
add = R.add
def floor(i, x, z, w=5200, d=5200, y=1300): return panel(i, x, y, z, w, d, '', rx=90, cls='floor')
def bignum(i, x, y, z, n, ry=0): return panel(i, x, y, z, 1400, 600, f'<div class="num">{n}</div>', ry=ry)
SANTA = f'''<svg viewBox="0 0 200 220" width="@W" height="@H"><path d="M40 92 C60 20 140 14 170 70 L150 96 Z" fill="{RED}"/><circle cx="174" cy="72" r="16" fill="#fff"/><rect x="30" y="88" width="140" height="26" rx="13" fill="#fff"/>
<circle cx="100" cy="134" r="40" fill="#f6c9a8"/><path d="M48 140 C52 210 148 210 152 140 C140 170 60 170 48 140 Z" fill="#fff"/><circle cx="84" cy="128" r="6" fill="#3a1d14"/><circle cx="116" cy="128" r="6" fill="#3a1d14"/><circle cx="100" cy="144" r="9" fill="#e07a6a"/></svg>'''
def santa(w): return SANTA.replace('@W', str(w)).replace('@H', str(int(w * 1.1)))

W = []
# S0: the vintage postcard and the FALSO stamp
W.append(panel('p0', 0, 0, 0, 620, 1100, '<img src="assets/img/postcard.jpg" alt=""/>', ry=-10, cls='pc'))
W.append(panel('p0b', -380, 40, -500, 560, 1000, f'<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">{santa(380)}</div>', ry=8, cls='cr'))
W.append(panel('stamp', 40, 300, 160, 760, 240, f'<div id="stp" style="position:absolute;inset:0;border:18px solid {RED};border-radius:34px;color:{RED};font:900 170px/204px {SF};text-align:center;background:rgba(255,246,230,0.92);opacity:0">FALSO</div>', ry=-10, rx=0))
# S1: a gift box (a real 3D cube) with a gold ribbon
G = (2500, 100, -700); S = 620
band = f'<i style="position:absolute;left:{S / 2 - 50}px;top:0;width:100px;height:{S}px;background:{GOLD}"></i>'
band2 = f'<i style="position:absolute;top:{S / 2 - 50}px;left:0;height:100px;width:{S}px;background:{GOLD}"></i>'
for k, (dx, dy, dz, ry, rx) in enumerate([(0, 0, S / 2, 0, 0), (S / 2, 0, 0, 90, 0), (0, 0, -S / 2, 180, 0), (-S / 2, 0, 0, -90, 0), (0, -S / 2, 0, 0, 90)]):
    W.append(panel(f'gb{k}', G[0] + dx, G[1] + dy, G[2] + dz, S, S, band + (band2 if k == 4 else ''), ry=ry, rx=rx, style=f'background:linear-gradient(135deg,{RED},#9e1220);border-radius:8px;backface-visibility:hidden'))
W.append(panel('gbt', G[0], G[1] - 520, G[2], 1100, 260, f'<div style="font:900 150px/260px {SF};text-align:center;color:{GOLD};letter-spacing:-0.04em">il trucco</div>'))
# S2: a row of early-1900s red Santas
ROW = []
for k in range(4):
    x = 4700 + k * 620
    inner = ('<img src="assets/img/postcard.jpg" alt=""/>' if k == 1 else
             f'<div style="position:absolute;inset:0;background:{CREAM}"></div><div style="position:absolute;left:0;right:0;top:120px;display:flex;justify-content:center">{santa(330)}</div>'
             f'<div style="position:absolute;left:0;right:0;bottom:60px;text-align:center;font:700 44px/1 Georgia,serif;font-style:italic;color:#7a2a1a">Buon Natale</div>')
    W.append(panel(f'rw{k}', x, 0, -400, 480, 820, inner, ry=(k - 1.5) * -6, cls='pc'))
W.append(panel('rwl', 5630, -620, -400, 1400, 200, f'<div style="font:800 130px/200px {SF};text-align:center;letter-spacing:-0.04em">inizio <span style="color:{GOLD}">’900</span></div>'))
# S3: 1915, mineral water
Y15 = (8400, -700, -1300); AD = (8500, 160, -300)
W.append(bignum('y15', *Y15, 1915))
W.append(panel('ad', *AD, 620, 1100, '<img src="assets/img/ad1915.jpg" alt=""/>', ry=-12, cls='pc'))
W.append(panel('adl', AD[0] + 560, 280, AD[2] + 200, 560, 260, f'<div style="position:absolute;left:40px;top:50px;font:800 64px/1 {SF}">White Rock</div><div style="position:absolute;left:40px;top:140px;font:600 44px/1 {SF};color:#9aa0b8">acqua minerale</div>', ry=-20, cls='dk'))
# S4: 1931, the painter
Y31 = (11000, -700, -1300); EA = (11000, 160, -300)
W.append(bignum('y31', *Y31, 1931))
strokes = ''.join(f'<i class="brs" style="position:absolute;left:{60 + (k % 3) * 150}px;top:{120 + (k // 3) * 150}px;width:200px;height:120px;border-radius:60px;background:{c};transform:rotate({-20 + k * 9}deg);transform-origin:0 50%"></i>' for k, c in enumerate([RED, RED, '#fff', RED, '#f6c9a8', RED, '#fff', '#fff', RED]))
W.append(panel('ea', *EA, 700, 900, f'<div style="position:absolute;inset:30px;background:#fbf4e6;border-radius:12px;overflow:hidden">{strokes}<div id="eaS" style="position:absolute;left:0;right:0;top:140px;display:flex;justify-content:center;opacity:0">{santa(520)}</div></div>', ry=-8, cls='dk'))
W.append(panel('eal', EA[0] + 620, 260, EA[2] + 200, 640, 300, f'<div style="position:absolute;left:44px;top:50px;font:600 40px/1 {SF};color:#9aa0b8">illustratore</div><div style="position:absolute;left:44px;top:110px;font:800 70px/1.05 {SF}">Haddon<br>Sundblom</div>', ry=-20, cls='dk'))
W.append(panel('eac', EA[0] - 260, -330, EA[2] + 150, 520, 200, f'<div style="font:800 80px/200px {SF};text-align:center">Coca-Cola</div>', ry=15, cls='rd'))
# S5: the spiral of years, 1931 to 1964
H = (14400, 0, -700); HR = 950
for k in range(34):
    a = k * 24; x = H[0] + math.sin(math.radians(a)) * HR; z = H[2] + math.cos(math.radians(a)) * HR; y = 700 - k * 62
    W.append(panel(f'hx{k}', x, y, z, 300, 380, f'<div style="position:absolute;left:0;right:0;top:40px;display:flex;justify-content:center">{santa(180)}</div><div style="position:absolute;left:0;right:0;bottom:30px;text-align:center;font:800 64px/1 {SF}">{1931 + k}</div>', ry=a, cls='rd'))
# S6: same face, same colours, same time of the year; then it lives in people's heads
S6 = 17800
W.append(panel('s6a', S6 - 640, 0, -300, 520, 600, f'<div style="position:absolute;left:0;right:0;top:50px;display:flex;justify-content:center">{santa(320)}</div><div style="position:absolute;left:0;right:0;bottom:40px;text-align:center;font:700 52px/1 {SF}">stesso viso</div>', ry=12, cls='dk'))
W.append(panel('s6b', S6, 0, -300, 520, 600, f'<div style="position:absolute;left:80px;top:60px;width:160px;height:330px;border-radius:24px;background:{RED}"></div><div style="position:absolute;left:280px;top:60px;width:160px;height:330px;border-radius:24px;background:#fff"></div><div style="position:absolute;left:0;right:0;bottom:40px;text-align:center;font:700 52px/1 {SF}">stessi colori</div>', cls='dk'))
W.append(panel('s6c', S6 + 640, 0, -300, 520, 600, f'<div style="position:absolute;left:110px;top:60px;width:300px;height:330px;border-radius:28px;background:#fff;overflow:hidden"><div style="height:90px;background:{RED};color:#fff;font:800 56px/90px {SF};text-align:center">DIC</div><div style="font:900 170px/230px {SF};text-align:center;color:#1d1d1f">25</div></div><div style="position:absolute;left:0;right:0;bottom:40px;text-align:center;font:700 52px/1 {SF}">stesso momento</div>', ry=-12, cls='dk'))
HD = (19700, -100, -400)
W.append(panel('hd', *HD, 900, 1000, f'''<svg viewBox="0 0 300 340" width="760" height="860" style="position:absolute;left:70px;top:70px"><path d="M150 20 C230 20 280 80 280 150 C280 200 262 220 262 240 L280 300 L220 300 L210 330 L120 330 C120 300 60 290 40 240 C20 190 30 120 60 80 C85 40 110 20 150 20 Z" fill="#20263f" stroke="{GOLD}" stroke-width="6"/></svg>
      <div style="position:absolute;left:0;right:0;top:330px;text-align:center;font:700 60px/1.1 {SF};color:#9aa0b8">Babbo Natale =</div>
      <div id="hdc" style="position:absolute;left:250px;top:420px;width:400px;height:150px;border-radius:30px;background:{RED};font:800 64px/150px {SF};text-align:center;opacity:0">Coca-Cola</div>''', cls='dk', style='background:transparent;box-shadow:none'))
# S7: the question
Q = (22000, -150, -300)
W.append(panel('qp', *Q, 1000, 900, f'''<div style="position:absolute;left:0;right:0;top:110px;text-align:center;font:900 140px/1 {SF};letter-spacing:-0.05em">lo sapevi?</div>
      <div id="qy" style="position:absolute;left:80px;top:470px;width:390px;height:260px;border-radius:50px;background:{GRN};color:#fff;font:900 150px/260px {SF};text-align:center">SÌ</div>
      <div id="qn" style="position:absolute;right:80px;top:470px;width:390px;height:260px;border-radius:50px;background:{RED};color:#fff;font:900 150px/260px {SF};text-align:center">NO</div>''', cls='dk'))
# S8: the lesson - do not invent, be there every year the same way
IV = (23700, -200, -600)
W.append(panel('iv', *IV, 1100, 360, f'<div style="font:900 190px/360px {SF};letter-spacing:-0.05em;text-align:center;color:#9aa0b8"><span style="position:relative;display:inline-block">inventare<i id="ivx" style="position:absolute;left:-14px;right:-14px;top:52%;height:22px;border-radius:11px;background:{RED};transform-origin:0 50%"></i></span></div>', ry=-10))
CAL = [(24800 + k * 420, 2026 + k) for k in range(5)]
for k, (x, yr) in enumerate(CAL):
    W.append(panel(f'cl{k}', x, 40, -300, 360, 440, f'<div style="height:110px;background:{RED};color:#fff;font:800 60px/110px {SF};text-align:center;border-radius:30px 30px 0 0">DIC</div><div style="font:900 190px/240px {SF};text-align:center;color:#1d1d1f">25</div><div style="text-align:center;font:600 40px/1 {SF};color:#86868b">{yr}</div>', cls='cal', style='background:#fff;border-radius:30px;box-shadow:0 40px 100px -30px rgba(0,0,0,0.9)'))
W.append(panel('tuo', 25240, -560, -200, 1000, 340, f'<div id="tuoS" style="font:900 260px/340px {SF};letter-spacing:-0.05em;text-align:center;color:{GOLD};opacity:0">TUO.</div>'))
# S9: the keyword
PC = (28000, 0, 0)
W.append(panel('pc', *PC, 760, 1400, f'''<div style="position:absolute;inset:0;border-radius:70px;background:#000;box-shadow:0 0 0 14px #2a2a2a"></div>
      <div style="position:absolute;left:0;right:0;top:120px;text-align:center;font:600 50px/1 {SF};color:#d1d1d6">scrivi nei commenti</div>
      <div style="position:absolute;left:0;right:0;top:200px;text-align:center;font:900 150px/1 {SF};letter-spacing:-0.05em;color:{GOLD}">NATALE</div>
      <div style="position:absolute;left:-160px;top:430px;width:1080px;transform:scale(0.7);transform-origin:50% 0">{commentbar('pk', 'NATALE', 0)}</div>
      <div style="position:absolute;left:-160px;top:760px;width:1080px;height:690px;transform:scale(0.7);transform-origin:50% 0">{keyboard('pk', 0, dark=True)}</div>''', style='overflow:visible'))
W.append(panel('dmp', PC[0] + 40, 330, 220, 900, 420, dmcard('dmc', 0, '3 idee per Natale', 'da ripetere ogni anno', icon=RED), style='overflow:visible'))
for k, (x, z) in enumerate([(800, -300), (2500, -700), (5600, -400), (8500, -500), (11000, -500), (14400, -700), (18600, -300), (22000, -300), (24800, -400), (28000, 0)]):
    W.append(floor(f'fl{k}', x, z))
W.append(particles(360, spread=(31000, 4200, 5000), centre=(14000, -300, -400), color='rgba(255,255,255,0.75)'))
WORLD = ''.join(W)

# ================================================================ CAMERA
P0 = dict(x=0, y=-330, z=0, d=0, ry=-20, rx=3)
def at(p, **kw): return dict(x=p[0], y=p[1], z=p[2], **kw)
HX0 = dict(x=H[0], y=700, z=H[2], d=2300, ry=0, rx=-6)
K = [[0.0, P0],
     [T['nonvero'] - 0.25, dict(x=-60, y=-150, z=-150, d=700, ry=20, rx=-4), 'sine.inOut'],
     [T['nonvero'] + 0.15, dict(x=40, y=-120, z=100, d=520, ry=-6, rx=0), 'power3.out'],
     [T['resta'] + 0.3, at(G, d=1350, ry=-30, rx=-18), 'power3.inOut'],
     [T['anche'] + 0.3, at(G, d=1150, ry=-150, rx=-22), 'sine.inOut'],
     [T['ilrosso'] + 0.2, dict(x=4700, y=0, z=-400, d=900, ry=-35, rx=-3), 'power3.inOut'],
     [T['y1915'] - 0.3, dict(x=4700 + 3 * 620, y=0, z=-400, d=900, ry=-35, rx=-3), 'power1.inOut'],
     [T['y1915'] + 0.15, at(Y15, d=1500, ry=-8, rx=-4), 'power3.inOut'],
     [T['acqua'], at(AD, d=520, ry=14, rx=-2), 'power3.inOut'],
     [T['poi'] - 0.1, dict(x=AD[0] + 300, y=100, z=AD[2], d=480, ry=26, rx=-2), 'sine.inOut'],
     [T['y1931'] + 0.15, at(Y31, d=1500, ry=-8, rx=-4), 'power3.inOut'],
     [T['illustratore'], at(EA, d=650, ry=10, rx=-2), 'power3.inOut'],
     [T['dipingere'], dict(x=EA[0] + 300, y=60, z=EA[2], d=600, ry=24, rx=-2), 'sine.inOut'],
     [T['pubblicita'] + 0.4, dict(x=EA[0] - 150, y=0, z=EA[2], d=480, ry=-6, rx=-2), 'sine.inOut'],
     [T['epoi'] + 0.2, HX0, 'power3.inOut'],
     [T['trent'] + 0.4, dict(HX0, y=700 - 33 * 62, ry=-792, d=2000, rx=-4), 'power1.inOut'],
     [T['stesso'] + 0.05, dict(x=S6, y=0, z=-300, d=1050, ry=-720 - 4, rx=-4), 'power3.inOut'],
     [T['allafine'] - 0.1, dict(x=S6, y=0, z=-300, d=950, ry=-720 + 4, rx=-3), 'sine.inOut'],
     [T['testa'], at(HD, d=700, ry=-720, rx=-3), 'power3.inOut'],
     [T['tu'] - 0.1, at(HD, d=540, ry=-724, rx=-2), 'sine.inOut'],
     [T['sapevi'] + 0.1, at(Q, d=650, ry=-714, rx=-2), 'power3.inOut'],
     [T['no'] + 0.2, at(Q, d=440, ry=-718, rx=-1), 'sine.inOut'],
     [T['inventare'] - 0.1, at(IV, d=700, ry=-710, rx=-2), 'power3.inOut'],
     [T['devi'] - 0.1, at(IV, d=540, ry=-714, rx=-2), 'sine.inOut'],
     [T['sempre'] + 0.1, dict(x=CAL[0][0], y=40, z=-300, d=760, ry=-735, rx=-3), 'power3.inOut'],
     [T['diventa'], dict(x=25600, y=-160, z=-300, d=1350, ry=-716, rx=-6), 'sine.inOut'],
     [T['cta'] - 0.2, dict(x=25560, y=-180, z=-300, d=1250, ry=-718, rx=-6), 'sine.inOut'],
     [T['cta'] + 0.1, at(PC, d=420, ry=-726, rx=0), 'power3.inOut'],
     [T['mando'] + 0.2, at(PC, d=300, ry=-720, rx=0), 'sine.inOut'],
     [T['eppure'] - 0.1, at(PC, d=240, ry=-719, rx=0), 'sine.inOut'],
     [T['eppure'] + 0.1, dict(x=14000, y=-1800, z=-500, d=13000, ry=-752, rx=-30), 'power2.in'],
     [T['END'], dict(P0, ry=-740), 'power3.out']]
KJS = '[' + ', '.join('[%.2f, {%s}%s]' % (k[0], ', '.join(f'{a}: {b}' for a, b in k[1].items()), (', "%s"' % k[2]) if len(k) > 2 else '') for k in K) + ']'

def ov(i, top, html): return f'<div class="ov" id="{i}" style="top:{top}px" data-layout-allow-overlap>{html}</div>'
HOOK = f'<div class="ovb">Babbo Natale<br>è <span style="color:{RED};filter:brightness(1.3)">rosso</span></div><div class="ovs" style="margin-top:14px">per colpa della Coca-Cola?</div>'
OVS = (ov('o1', 160, HOOK)
       + ov('o2', 200, f'<div class="ovs">la storia vera è</div><div class="ovb">un trucco di marketing</div>')
       + ov('o3', 1480, '<div class="ovb" style="font-size:80px">e lo puoi usare anche tu</div>')
       + ov('o4', 200, f'<div class="ovs">il rosso</div><div class="ovb" style="color:{GOLD}">c’era già</div>')
       + ov('o5', 200, f'<span class="tag">1931 → <span id="yr">1931</span></span>')
       + ov('o6', 1460, f'<div class="ovb" style="font-size:110px"><span style="color:{GOLD}">33</span> anni di fila</div>')
       + ov('o7', 200, '<div class="ovs">nella testa della gente</div><div class="ovb">è diventato suo</div>')
       + ov('o8', 200, '<span class="tag">LA LEZIONE</span><div class="ovs" style="margin-top:24px">non devi inventare</div>')
       + ov('o9', 200, f'<div class="ovs">devi esserci sempre</div><div class="ovb">allo stesso modo</div>')
       + ov('o10', 380, '<div class="ovs" style="font-size:72px">eppure, ancora oggi,<br>tutti pensano che…</div>')
       + ov('oz', 160, HOOK))
def show(i, t, t_out=None, kind='blur'):
    s = (f'    tl.fromTo("#{i}", {{ opacity: 0, scale: 1.35, filter: "blur(16px)" }}, {{ opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }}, {t});\n' if kind == 'blur'
         else f'    tl.fromTo("#{i}", {{ opacity: 0, y: 50 }}, {{ opacity: 1, y: 0, duration: 0.26, ease: "expo.out" }}, {t});\n')
    if t_out: s += f'    tl.to("#{i}", {{ opacity: 0, y: -40, filter: "blur(12px)", duration: 0.18 }}, {t_out});\n'
    return s
JS = (f'    camPath(tl, "#world", {KJS});\n'
      '    gsap.set("#o1", { opacity: 1 });\n'
      '    tl.fromTo("#o1 .ovb", { scale: 1.06 }, { scale: 1, duration: 0.5, ease: "expo.out" }, 0);\n'
      '    tl.to("#o1", { opacity: 0, y: -60, filter: "blur(12px)", duration: 0.2 }, «resta» - 0.2);\n'
      '    tl.fromTo("#stp", { opacity: 0, scale: 2.6, rotation: -26 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.24, ease: "power4.in" }, «nonvero» - 0.1);\n'
      + '    tl.to("#stp", { opacity: 0, duration: 0.2 }, «storia»);\n'
      + show('o2', '«storia»', '«ilrosso» - 0.2')
      + show('o3', '«puoi» - 0.1', '«ilrosso» - 0.2', 'up')
      + show('o4', '«ilrosso»', '«y1915» - 0.3')
      + '    tl.fromTo(".brs", { scaleX: 0 }, { scaleX: 1, duration: 0.2, ease: "power2.out", stagger: 0.12 }, «illustratore» - 0.2);\n'
      + '    tl.fromTo("#eaS", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.6)" }, «pubblicita» - 0.2);\n'
      + show('o5', '«epoi» + 0.1', '«stesso» - 0.2')
      + '    count(tl, "#yr", 1931, 1964, «epoi» + 0.2, «y1964» - «epoi» + 0.1, function (v) { return String(Math.round(v)); }, "power1.inOut");\n'
      + show('o6', '«trent» - 0.15', '«stesso» - 0.2', 'up')
      + '    tl.fromTo("#s6a, #s6b, #s6c", { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0);\n'
      + '    tl.fromTo("#hdc", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2.4)" }, «suo» - 0.25);\n'
      + show('o7', '«testa» - 0.1', '«tu» - 0.2')
      + '    tl.fromTo("#qy", { scale: 1 }, { scale: 1.1, duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }, «si»);\n'
      + '    tl.fromTo("#qn", { scale: 1 }, { scale: 1.1, duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }, «no»);\n'
      + show('o8', '«lezione» - 0.05', '«devi» - 0.15')
      + '    tl.fromTo("#ivx", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power2.out" }, «inventare» + 0.2);\n'
      + show('o9', '«devi»', '«cta» - 0.2')
      + '    tl.fromTo(".cal", { opacity: 0, y: 200 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(1.6)", stagger: 0.16 }, «sempre» - 0.2);\n'
      + '    tl.fromTo("#tuoS", { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.26, ease: "power4.in" }, «diventa» + 0.05);\n'
      + commentbar_js('pk', '«nataleK»', 0.08) + keys_js('pk', 'NATALE', '«nataleK»', 0.08)
      + '    tl.fromTo("#dmc-dm", { opacity: 0, y: -400, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.4)" }, «mando» - 0.3);\n'
      + show('o10', '«eppure» + 0.02', 'DUR - 0.36', 'up')
      + '    gsap.set("#oz", { opacity: 0 });\n'
      + '    tl.fromTo("#oz", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.in" }, DUR - 0.3);\n')

add('x01', 'start', 'END', f'''      <div class="view" id="vw" data-layout-allow-overlap><div class="world" id="world">{WORLD}</div></div>
{OVS}''', JS, KBCSS, cam=False, ground='xm',
    fx=[('whoosh-cinematic', 'start', 0.0, 0.4), ('bass-drop', 'start', 0.0, 0.36), ('stamp', 'nonvero', -0.1, 0.5),
        ('whoosh-cinematic', 'resta', 0.0, 0.32), ('sparkle', 'trucco', 0.0, 0.22), ('whoosh', 'ilrosso', -0.2, 0.3),
        ('whoosh', 'y1915', -0.15, 0.3), ('impact-bass-1', 'y1915', 0.15, 0.36), ('pop', 'acqua', -0.2, 0.22),
        ('whoosh', 'y1931', -0.15, 0.3), ('impact-bass-1', 'y1931', 0.15, 0.36), ('swoosh', 'dipingere', -0.3, 0.26), ('sparkle', 'pubblicita', -0.2, 0.22),
        ('whoosh-cinematic', 'epoi', 0.0, 0.3), ('tick', 'anno', 0.0, 0.18), ('tick', 'quello', 0.0, 0.18), ('tick', 'ancora', 0.0, 0.18), ('ding', 'y1964', 0.0, 0.26), ('impact-bass-1', 'trent', 0.0, 0.32),
        ('whoosh', 'stesso', -0.2, 0.28), ('pop', 'stesso', 0.0, 0.2), ('pop', 'colori', 0.0, 0.2), ('pop', 'momento', 0.0, 0.2), ('whoosh', 'testa', -0.2, 0.26), ('ding', 'suo', -0.2, 0.26),
        ('whoosh', 'sapevi', -0.2, 0.26), ('pop', 'si', 0.0, 0.26), ('pop', 'no', 0.0, 0.26), ('tear', 'inventare', 0.2, 0.3), ('whoosh', 'sempre', -0.2, 0.26),
        ('pop', 'sempre', 0.0, 0.18), ('pop', 'sempre', 0.16, 0.16), ('pop', 'sempre', 0.32, 0.16), ('stamp', 'diventa', 0.2, 0.45),
        ('whoosh', 'cta', -0.1, 0.26), ('typing', 'nataleK', -0.05, 0.24), ('notif', 'mando', -0.3, 0.28), ('whoosh-cinematic', 'eppure', 0.0, 0.36), ('riser', 'eppure', 0.2, 0.14)])
