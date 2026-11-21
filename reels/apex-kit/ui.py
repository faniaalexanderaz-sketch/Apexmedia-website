# ui.py: reusable interface pieces for the Apex reels (titles, iOS keyboard, comment bar, DM card, progress bar).
# Every piece is plain HTML with ids, so a scene animates it with the helpers in common.JS.
SF = "'SF Pro Display'"

def big(i, html, top, size, color='#f5f5f7', extra=''):
    return f'<div id="{i}" style="position:absolute;left:0;right:0;top:{top}px;text-align:center;font:700 {size}px/1.05 {SF};letter-spacing:-0.045em;color:{color};{extra}" data-layout-allow-overlap>{html}</div>'

def small(i, html, top, size=66, color='#a1a1a6', extra=''):
    return f'<div id="{i}" style="position:absolute;left:0;right:0;top:{top}px;text-align:center;font:600 {size}px/1.1 {SF};letter-spacing:-0.02em;color:{color};{extra}" data-layout-allow-overlap>{html}</div>'

def clip(i, src, dur, mstart=0.0, shade=0.0, origin='50% 50%', extra=''):
    """a full-frame footage layer; shade darkens it so titles stay readable"""
    sh = f'<div style="position:absolute;inset:0;background:rgba(0,0,0,{shade})"></div>' if shade else ''
    return (f'<div class="vid" id="{i}-w" data-layout-allow-overlap style="transform-origin:{origin};{extra}"><video id="{i}" class="clip" src="assets/video/{src}" data-start="0" '
            f'data-duration="{dur:.2f}" data-media-start="{mstart:.2f}" muted playsinline></video></div>' + sh)

# ---------------------------------------------------------------- iOS keyboard (light or dark), keys addressable as #<p>-k-LETTER
ROWS = ['QWERTYUIOPÈ', 'ASDFGHJKL', 'ZXCVBNM']
def keyboard(p, top=1230, dark=False):
    bg, key, sh, fn, fx = ('#2b2b2d', '#6b6b70', '#1b1b1d', '#fff', '#4a4a4e') if dark else ('#d1d4db', '#fff', '#8a8d93', '#000', '#abb0ba')
    out = []
    for k, r in enumerate(ROWS[:1] + ROWS[1:]):
        letters = r if k else r[:10]
        w, gap = 96, 8
        x0 = (1080 - (len(letters) * w + (len(letters) - 1) * gap)) // 2
        out += [f'<i class="kk" id="{p}-k-{c}" style="left:{x0 + n * (w + gap)}px;top:{24 + k * 128}px;background:{key};box-shadow:0 3px 0 {sh};color:{fn}">{c}</i>' for n, c in enumerate(letters)]
    out.append(f'<i class="kk" style="left:20px;top:408px;width:230px;background:{fx};box-shadow:0 3px 0 {sh};color:{fn};font-size:40px">123</i>'
               f'<i class="kk" style="left:262px;top:408px;width:556px;background:{key};box-shadow:0 3px 0 {sh};color:{fn};font-size:40px">spazio</i>'
               f'<i class="kk" style="left:830px;top:408px;width:230px;background:#0a84ff;box-shadow:0 3px 0 {sh};color:#fff;font-size:40px">invio</i>')
    return f'<div id="{p}-kb" style="position:absolute;left:0;top:{top}px;width:1080px;height:690px;background:{bg}" data-layout-allow-overlap>' + ''.join(out) + '</div>'
KBCSS = '''
    .kk { position: absolute; display: block; width: 96px; height: 108px; border-radius: 14px; font: 400 54px/108px "SF Pro Display"; font-style: normal; text-align: center; }'''
def keys_js(p, word, t, st=0.07):
    """press the keys of a word one after another (JS for a scene); one explicit tween per key"""
    return ''.join(f'    tl.to("#{p}-k-{k}", {{ y: -12, scale: 1.16, filter: "brightness(1.4)", duration: 0.05, yoyo: true, repeat: 1, ease: "power1.out" }}, {t} + {i * st:.2f});\n'
                   for i, k in enumerate(word.upper()))

# ---------------------------------------------------------------- comment bar (Instagram-like, generic): avatar, text, "Pubblica"
def commentbar(p, word, top=850, dark=True):
    bd, tx, ph = ('#3a3a3c', '#fff', '#8e8e93') if dark else ('#d2d2d7', '#000', '#8e8e93')
    return (f'<div id="{p}-bar" style="position:absolute;left:70px;top:{top}px;width:940px;height:140px;border-radius:70px;border:4px solid {bd};display:flex;align-items:center;padding:0 44px 0 24px;gap:26px" data-layout-allow-overlap>'
            f'<div style="width:92px;height:92px;border-radius:50%;background:linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)"></div>'
            f'<div style="flex:1;position:relative;height:60px"><div id="{p}-ph" style="position:absolute;left:0;top:0;font:400 48px/60px {SF};color:{ph}">Aggiungi un commento…</div>'
            f'<div id="{p}-t" class="split" style="position:absolute;left:0;top:0;font:600 54px/60px {SF};letter-spacing:0.02em;color:{tx}">{word}</div></div>'
            f'<div id="{p}-pub" style="font:600 46px/1 {SF};color:#0a84ff">Pubblica</div></div>')
def commentbar_js(p, t, st=0.07):
    return (f'    tl.to("#{p}-ph", {{ opacity: 0, duration: 0.05 }}, {t});\n'
            f'    typeIn(tl, "#{p}-t", {t}, {st});\n')

# ---------------------------------------------------------------- DM card: a chat bubble with a document attachment
def dmcard(p, top, title, sub, dark=True, icon='#0a84ff'):
    bg, tx, mu = ('#1c1c1e', '#fff', '#8e8e93') if dark else ('#fff', '#1d1d1f', '#86868b')
    return (f'<div id="{p}-dm" style="position:absolute;left:90px;top:{top}px;width:900px;border-radius:52px;background:{bg};padding:40px 44px;box-shadow:0 40px 100px -30px rgba(0,0,0,0.5)" data-layout-allow-overlap>'
            f'<div style="display:flex;align-items:center;gap:22px"><div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#1d1d1f,#4a4a4e);color:#fff;font:700 34px/80px {SF};text-align:center">A</div>'
            f'<div><div style="font:600 40px/1.1 {SF};color:{tx}">apexmedia</div><div style="font:500 30px/1.2 {SF};color:{mu}">ti ha inviato un file</div></div></div>'
            f'<div id="{p}-doc" style="margin-top:34px;display:flex;align-items:center;gap:30px;padding:30px;border-radius:34px;background:rgba(127,127,127,0.14)">'
            f'<div style="width:120px;height:150px;border-radius:18px;background:{icon};position:relative"><i style="position:absolute;left:24px;right:24px;top:40px;height:8px;border-radius:4px;background:rgba(255,255,255,0.8)"></i><i style="position:absolute;left:24px;right:40px;top:64px;height:8px;border-radius:4px;background:rgba(255,255,255,0.6)"></i><i style="position:absolute;left:24px;right:30px;top:88px;height:8px;border-radius:4px;background:rgba(255,255,255,0.6)"></i></div>'
            f'<div><div style="font:700 54px/1.1 {SF};letter-spacing:-0.02em;color:{tx}">{title}</div><div style="font:500 36px/1.3 {SF};color:{mu};margin-top:8px">{sub}</div></div></div></div>')

# ---------------------------------------------------------------- "watch till the end" progress bar
def progress(p, top=760, color='#0a84ff', dark=True):
    tr = 'rgba(255,255,255,0.18)' if dark else 'rgba(0,0,0,0.1)'
    mu = '#8e8e93'
    return (f'<div id="{p}-pb" style="position:absolute;left:110px;top:{top}px;width:860px;height:14px;border-radius:7px;background:{tr}" data-layout-allow-overlap>'
            f'<i id="{p}-fill" style="position:absolute;left:0;top:0;bottom:0;width:860px;border-radius:7px;background:{color};transform-origin:0 50%"></i>'
            f'<i id="{p}-dot" style="position:absolute;left:-14px;top:-14px;width:42px;height:42px;border-radius:50%;background:#fff;box-shadow:0 4px 18px rgba(0,0,0,0.4)"></i></div>'
            f'<div style="position:absolute;left:110px;top:{top + 40}px;font:500 34px/1 {SF};color:{mu}" data-layout-allow-overlap>0:{int(0):02d}</div>'
            f'<div style="position:absolute;right:110px;top:{top + 40}px;font:500 34px/1 {SF};color:{mu}" data-layout-allow-overlap>FINE</div>')
def progress_js(p, t, d, a=0.06, b=0.97):
    return (f'    tl.fromTo("#{p}-fill", {{ scaleX: {a} }}, {{ scaleX: {b}, duration: {d}, ease: "power2.inOut" }}, {t});\n'
            f'    tl.fromTo("#{p}-dot", {{ x: {860 * a} }}, {{ x: {860 * b}, duration: {d}, ease: "power2.inOut" }}, {t});\n')

# ---------------------------------------------------------------- 3D world: a perspective view, a world container, panels placed in space
WORLDCSS = '''
    .view { position: absolute; inset: 0; perspective: 1400px; perspective-origin: 50% 50%; overflow: hidden; }
    .world { position: absolute; left: 540px; top: 960px; width: 0; height: 0; transform-style: preserve-3d; }
    .pn { position: absolute; left: 0; top: 0; transform-style: flat; backface-visibility: hidden; }
    .pt { position: absolute; left: 0; top: 0; border-radius: 50%; }'''
def panel(i, x, y, z, w, h, inner, ry=0, rx=0, cls='', style=''):
    """a flat panel of w x h centred on the world point (x, y, z), turned by ry / rx degrees"""
    return (f'<div class="pn {cls}" id="{i}" style="width:{w}px;height:{h}px;transform:translate3d({x - w / 2}px,{y - h / 2}px,{z}px) rotateY({ry}deg) rotateX({rx}deg);{style}">{inner}</div>')
def particles(n, spread=(6000, 3000, 6000), centre=(0, 0, 0), seed=7, color='rgba(255,255,255,0.55)'):
    """deterministic dots scattered in the world, for depth and parallax"""
    import random
    r = random.Random(seed); out = []
    for k in range(n):
        x = centre[0] + r.uniform(-1, 1) * spread[0] / 2; y = centre[1] + r.uniform(-1, 1) * spread[1] / 2; z = centre[2] + r.uniform(-1, 1) * spread[2] / 2
        s = r.choice([6, 8, 10, 14])
        out.append(f'<i class="pt" style="width:{s}px;height:{s}px;background:{color};transform:translate3d({x:.0f}px,{y:.0f}px,{z:.0f}px)"></i>')
    return ''.join(out)
