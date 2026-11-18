# apex-gta6: all scenes. Times written as «key» are named voice moments (see times.py), converted to
# scene-local seconds when the scene is registered.
import re, sys
sys.path.insert(0, '.')
from common import scene, CURSOR, SEL
from times import T
OUT = '/home/user/Apexmedia-website/reels/apex-gta6/compositions/'
SC = []
GLOW = '''      <div id="{s}-g1" style="position:absolute;left:-260px;top:120px;width:900px;height:900px;background:radial-gradient(closest-side,rgba(255,45,149,0.34),rgba(255,45,149,0))"></div>
      <div id="{s}-g2" style="position:absolute;right:-300px;top:900px;width:1000px;height:1000px;background:radial-gradient(closest-side,rgba(91,43,214,0.42),rgba(91,43,214,0))"></div>
'''
GLOWJS = '''    tl.fromTo("#{s}-g1", {{ x: -70, y: 50 }}, {{ x: 110, y: -70, duration: DUR, ease: "none" }}, 0);
    tl.fromTo("#{s}-g2", {{ x: 60, y: -40 }}, {{ x: -100, y: 80, duration: DUR, ease: "none" }}, 0);
'''

def ln(i, html, cls='t-sans', style='', mt=None):
    m = f' style="margin-top:{mt}px"' if mt is not None else ''
    st = f' style="{style}"' if style else ''
    return f'<span class="line"{m}><span id="{i}" class="{cls}"{st}>{html}</span></span>'

def zone(*lines, top=340):
    return f'<div class="zone" data-layout-allow-overlap style="top:{top}px">' + ''.join(lines) + '</div>'

def vid(i, src, dur, mstart=0):
    return (f'<div class="vid" id="{i}-w" data-layout-allow-overlap><video id="{i}" class="clip" src="assets/video/{src}" data-start="0" data-duration="{dur:.2f}" data-media-start="{mstart}" muted playsinline></video></div>'
            '<div class="shade"></div>')

def add(sid, k0, k1, body, js, css='', fx=(), glow=True):
    start, end = (T[k0] if isinstance(k0, str) else k0), (T[k1] if isinstance(k1, str) else k1)
    dur = round(end - start, 3)
    def f(s):
        s = s.replace('VDUR', '%.2f' % dur)
        return re.sub(r'«(\w+)»', lambda m: '%.2f' % (T[m.group(1)] - start), s)
    b = f'    <div id="{sid}-st" class="st" data-layout-allow-overlap>\n' + (GLOW.format(s=sid) if glow else '') + f(body) + '\n    </div>'
    j = (GLOWJS.format(s=sid) if glow else '') + f(js)
    SC.append(dict(id=sid, start=start, dur=dur, body=b, js=j.replace('DUR', '%.2f' % dur), css=css,
                   fx=[(n, round((T[k] if isinstance(k, str) else k) + o, 3), v) for n, k, o, v in fx]))

def seg(sid, n):
    return f'<div class="seg" id="{sid}-seg" style="left:330px;width:420px">' + ''.join(
        '<i>' + (f'<b id="{sid}-sg"></b>' if k == n else ('<b></b>' if k < n else '')) + '</i>' for k in range(1, 4)) + '</div>'

def title(sid, k0, k1, n, word, wkey, wsize=118):
    body = f'''      {seg(sid, n)}
      <div class="bignum" id="{sid}-num"><div id="{sid}-col"><div>{n - 1 if n > 1 else ''}</div><div>{n}</div></div></div>
      {zone(ln(sid + '-w', word, 't-it split grad', f'font-size:{wsize}px'), top=1060)}'''
    js = f'''    enter(tl, "#{sid}-st", "U");
    tl.fromTo("#{sid}-col", {{ y: 0 }}, {{ y: -470, duration: 0.42, ease: "expo.out" }}, 0.08);
    tl.fromTo("#{sid}-num", {{ scale: 0.8 }}, {{ scale: 1, duration: 0.5, ease: "back.out(2.2)" }}, 0.08);
    tl.to("#{sid}-num", {{ scale: 1.1, duration: DUR - 0.7, ease: "none" }}, 0.58);
    tl.fromTo("#{sid}-sg", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.4, ease: "power2.out" }}, 0.2);
    flip(tl, "#{sid}-w", «{wkey}» - 0.04, 0.03);
    exit(tl, "#{sid}-st", "Z", DUR - 0.18);'''
    add(sid, k0, k1, body, js, fx=[('whoosh-short', k0, -0.02, 0.3), ('impact-bass-1', k0, 0.1, 0.2), ('key-press', wkey, -0.04, 0.25)])

DOTS = '.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ".")'

# ------------------------------------------------------------------ hook
add('g1', 0, 'prima', f'''      {vid('h-v', 'car.mp4', T['prima'])}
      <div id="h-t" style="position:absolute;left:0;right:0;top:230px;text-align:center;font:italic 900 300px/1 Inter;letter-spacing:-0.04em;white-space:nowrap"><span>GTA</span> <span class="grad" style="padding:0 0.1em 0 0.02em">6</span></div>
      {zone(ln('h-l1', 'ha già incassato più di', 't-sans'), top=560)}
      <div id="h-n" style="position:absolute;left:0;right:0;top:690px;text-align:center;font:italic 800 124px/1.1 Inter;letter-spacing:-0.03em;white-space:nowrap;color:#fff;text-shadow:0 6px 40px rgba(0,0,0,0.7)"><span id="h-nv">0</span> $</div>
      <div id="h-sel" class="sel" style="left:50px;top:680px;width:980px;height:160px">{SEL}</div>''', f'''    tl.fromTo("#h-v-w", {{ scale: 1.22 }}, {{ scale: 1.04, duration: DUR, ease: "none" }}, 0);
    tl.fromTo("#h-t", {{ scale: 1.5 }}, {{ scale: 1, duration: 0.38, ease: "expo.out" }}, 0);
    tl.fromTo("#h-t", {{ rotation: -3 }}, {{ rotation: 0, duration: 0.38, ease: "expo.out" }}, 0);
    rise(tl, "#h-l1", «incassato» - 0.08);
    tl.fromTo("#h-n", {{ opacity: 0, scale: 0.6 }}, {{ opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }}, «miliardo» - 0.22);
    count(tl, "#h-nv", 0, 1000000000, «miliardo» - 0.18, 0.75, (v) => String(Math.round(v)){DOTS});
    tl.fromTo("#h-n", {{ scale: 1.2 }}, {{ scale: 1, duration: 0.34, ease: "back.out(3)", immediateRender: false }}, «dollari»);
    select(tl, "#h-sel", null, «dollari»);
    tl.fromTo("#h-t", {{ scale: 1 }}, {{ scale: 1.08, duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }}, «miliardo» - 0.2);
    exit(tl, "#g1-st", "L", DUR - 0.2);''', glow=False,
    fx=[('impact-bass-1', 0, 0.0, 0.3), ('whoosh-short', 0, 0.02, 0.25), ('typing', 'miliardo', -0.18, 0.22), ('pop', 'dollari', 0.0, 0.34), ('whoosh', 'prima', -0.2, 0.32)])

add('g2', 'prima', 'enon', f'''      {vid('p-v', 'city.mp4', T['enon'] - T['prima'])}
      {zone(ln('p-l1', 'prima ancora', 't-sans'), ln('p-l2', 'di uscire', 't-it grad', 'font-size:136px', mt=-22))}
      {zone(ln('p-l3', 'secondo le stime', 't-sans t-mut'), ln('p-l4', 'sui preordini', 't-it', 'font-size:104px', mt=-22))}
      <div id="p-chip" style="position:absolute;left:300px;top:780px;width:480px;border-radius:44px;background:#fff;color:#07040d;text-align:center;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,0.55)">
        <div style="background:linear-gradient(92deg,#ff2d95,#ff8a3c);color:#fff;font:700 40px/1 Inter;padding:24px 0;letter-spacing:0.08em">NOVEMBRE 2026</div>
        <div style="font:800 240px/1.08 Inter;letter-spacing:-0.04em">19</div>
        <div style="font:600 36px/1 Inter;color:#6b6480;padding:0 0 34px">data di uscita</div>
      </div>
      <div class="tag" id="p-tag" style="top:1330px;color:#d9d4ea">Stima Sensor Tower sui preordini digitali</div>''', '''    enter(tl, "#g2-st", "L");
    tl.fromTo("#p-v-w", { scale: 1.2 }, { scale: 1.04, duration: DUR, ease: "none" }, 0);
    rise(tl, "#p-l1", 0.05);
    rise(tl, "#p-l2", «uscire» - 0.28);
    tl.fromTo("#p-chip", { opacity: 0, scale: 0.5, rotation: -8 }, { opacity: 1, scale: 1, rotation: -3, duration: 0.4, ease: "back.out(2)" }, «uscire» - 0.1);
    sink(tl, "#p-l1", «almeno» - 0.16); sink(tl, "#p-l2", «almeno» - 0.16);
    rise(tl, "#p-l3", «almeno»);
    rise(tl, "#p-l4", «stime» + 0.25);
    tl.to("#p-chip", { scale: 0.86, rotation: 2, duration: 0.4, ease: "expo.out" }, «almeno»);
    tl.fromTo("#p-tag", { opacity: 0 }, { opacity: 1, duration: 0.25 }, «stime»);
    exit(tl, "#g2-st", "Z", DUR - 0.18);''', glow=False,
    fx=[('pop', 'uscire', -0.1, 0.32), ('whoosh-short', 'almeno', -0.16, 0.22), ('key-press', 'stime', 0.2, 0.2)])

PLAY = '<svg viewBox="0 0 100 100" width="118" height="118"><circle cx="50" cy="50" r="48" fill="url(#gp)"/><path d="M41 31v38l31-19z" fill="#fff"/><defs><linearGradient id="gp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff2d95"/><stop offset="1" stop-color="#ff8a3c"/></linearGradient></defs></svg>'
# ------------------------------------------------------------------ "non è fortuna: tre trucchi"
add('g3', 'enon', 'uno', f'''      {zone(ln('t-l1', 'non è fortuna', 't-sans split'))}
      {zone(ln('t-l3', '<span class="t-it grad" style="padding:0 0.1em">il terzo</span> <span class="t-sans">lo puoi</span>', ''), ln('t-l4', 'copiare anche tu', 't-sans', mt=-22))}
      <div class="bignum" id="t-num" style="top:600px"><div id="t-col"><div>1</div><div>2</div><div id="t-three">3</div></div></div>
      {zone(ln('t-l2', 'trucchi di marketing', 't-sans t-mut'), top=1110)}
      <div id="t-sel" class="sel" style="left:360px;top:630px;width:360px;height:420px">{SEL}</div>
      <div id="t-cur" class="cur" style="left:700px;top:990px">{CURSOR}</div>
      <div id="t-pill" class="pill" style="left:700px;top:640px;transform:rotate(5deg)">copialo</div>''', '''    enter(tl, "#g3-st", "Z");
    flip(tl, "#t-l1", 0.03, 0.025);
    tl.fromTo("#t-col", { y: 0 }, { y: -470 * 2, duration: 0.55, ease: "expo.out" }, «tre» - 0.14);
    tl.fromTo("#t-num", { scale: 0.86, rotation: -5 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2)" }, «tre» - 0.14);
    rise(tl, "#t-l2", «tre» + 0.12);
    tl.to("#t-num", { scale: 1.08, duration: 1.0, ease: "none" }, «tre» + 0.4);
    sink(tl, "#t-l1", «eil» - 0.18); sink(tl, "#t-l2", «eil» - 0.18);
    rise(tl, "#t-l3", «eil»);
    tl.to("#t-num", { scale: 1, duration: 0.3, ease: "back.out(3)" }, «terzo»);
    select(tl, "#t-sel", "#t-cur", «terzo» + 0.1);
    rise(tl, "#t-l4", «copiare» - 0.08);
    pop(tl, "#t-pill", «copiare» + 0.1);
    tl.to(["#t-sel", "#t-cur", "#t-pill"], { opacity: 0, duration: 0.12 }, DUR - 0.5);
    tl.to("#t-num", { scale: 14, duration: 0.42, ease: "power3.in" }, DUR - 0.44);''',
    fx=[('whoosh-cinematic', 'enon', -0.06, 0.22), ('typing', 'enon', 0.03, 0.18), ('pop', 'tre', -0.12, 0.3), ('click-soft', 'terzo', 0.36, 0.4), ('pop', 'copiare', 0.1, 0.3), ('whoosh-cinematic', 'uno', -0.5, 0.3)])

# ------------------------------------------------------------------ 1: la brutta notizia
title('g5', 'uno', 'maggio', 1, 'la brutta notizia', 'brutta', wsize=92)

SAD = '<svg viewBox="0 0 100 100" width="130" height="130"><circle cx="50" cy="50" r="46" fill="#2a2140" stroke="#ff3b30" stroke-width="5"/><circle cx="34" cy="42" r="6" fill="#fff"/><circle cx="66" cy="42" r="6" fill="#fff"/><path d="M30 72 Q50 54 70 72" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>'
def chip(i, month, day, sub, style):
    return (f'<div id="{i}" style="position:absolute;width:480px;border-radius:44px;background:#fff;color:#07040d;text-align:center;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,0.55);{style}">'
            f'<div style="background:linear-gradient(92deg,#ff2d95,#ff8a3c);color:#fff;font:700 40px/1 Inter;padding:24px 0;letter-spacing:0.08em">{month}</div>'
            f'<div style="font:800 240px/1.08 Inter;letter-spacing:-0.04em">{day}</div><div style="font:600 36px/1 Inter;color:#6b6480;padding:0 0 34px">{sub}</div></div>')
add('g6', 'maggio', 'quattro', f'''      {zone(ln('b-l1', 'maggio 2025', 't-sans t-mut'), ln('b-l2', 'il rinvio', 't-it', 'font-size:150px', mt=-22))}
      {zone(ln('b-l3', 'i fan', 't-sans t-mut'), ln('b-l4', 'ci restano male', 't-it', 'font-size:104px', mt=-22))}
      {chip('b-chip', 'MAGGIO 2025', '2', 'annuncio ufficiale', 'left:300px;top:780px')}
      <div id="b-st" class="pill" style="left:230px;top:960px;font-size:110px;padding:26px 54px;background:#ff3b30;transform:rotate(-9deg)">rinviato</div>
      <div class="b-s" id="b-s1" style="left:90px;top:760px">{SAD}</div><div class="b-s" id="b-s2" style="left:850px;top:880px">{SAD}</div><div class="b-s" id="b-s3" style="left:130px;top:1150px">{SAD}</div>''', '''    enter(tl, "#g6-st", "L");
    rise(tl, "#b-l1", 0.05);
    tl.fromTo("#b-chip", { opacity: 0, scale: 0.5, rotation: 6 }, { opacity: 1, scale: 1, rotation: 2, duration: 0.4, ease: "back.out(2)" }, 0.1);
    rise(tl, "#b-l2", «rinvio» - 0.25);
    tl.fromTo("#b-st", { opacity: 0, scale: 2.6 }, { opacity: 1, scale: 1, duration: 0.18, ease: "power3.in" }, «rinvio»);
    tl.fromTo("#b-chip", { x: 0 }, { x: 14, duration: 0.05, yoyo: true, repeat: 5, immediateRender: false }, «rinvio» + 0.18);
    sink(tl, "#b-l1", «ifan» - 0.16); sink(tl, "#b-l2", «ifan» - 0.16);
    rise(tl, "#b-l3", «ifan»);
    rise(tl, "#b-l4", «ifan» + 0.28);
    tl.fromTo(".b-s", { opacity: 0, scale: 0.2, y: 80 }, { opacity: 1, scale: 1, y: 0, duration: 0.36, ease: "back.out(2.6)", stagger: 0.12 }, «ifan» + 0.1);
    exit(tl, "#g6-st", "U", DUR - 0.2);''', '''
    .b-s { position: absolute; width: 130px; height: 130px; }''',
    fx=[('whoosh', 'maggio', -0.04, 0.3), ('pop', 'maggio', 0.1, 0.28), ('impact-bass-1', 'rinvio', 0.14, 0.3), ('whoosh-short', 'ifan', -0.16, 0.22), ('pop', 'ifan', 0.1, 0.26), ('pop', 'ifan', 0.22, 0.26), ('pop', 'ifan', 0.34, 0.26)])

def day(k, d):
    return f'<div class="d-c" id="d-c{k}" style="left:{70 + k * 190}px"><b>{d}</b><small>mag</small></div>'
add('g7', 'quattro', 'q475', f'''      {zone(ln('d-l1', 'quattro giorni dopo', 't-sans'), ln('d-l2', 'senza avvisare', 't-it grad', 'font-size:112px', mt=-22))}
      {zone(ln('d-l3', 'esce', 't-sans t-mut'), ln('d-l4', 'il secondo trailer', 't-it', 'font-size:92px', mt=-22))}
      {''.join(day(k, d) for k, d in enumerate((2, 3, 4, 5, 6)))}
      <div id="d-hl" style="position:absolute;left:62px;top:792px;width:186px;height:236px;border-radius:38px;border:6px solid #ff2d95;box-shadow:0 0 50px rgba(255,45,149,0.6)"></div>
      <div id="d-tag" style="position:absolute;left:70px;top:1050px;width:170px;text-align:center;font:700 30px/1 Inter;color:#ff3b30;letter-spacing:0.04em">RINVIO</div>
      <div id="d-play" style="position:absolute;left:856px;top:1050px;width:118px">{PLAY}</div>
      <div id="d-pill" class="pill" style="left:650px;top:1200px;font-size:60px;padding:18px 36px">trailer 2</div>''', '''    enter(tl, "#g7-st", "U");
    rise(tl, "#d-l1", 0.05);
    tl.fromTo(".d-c", { opacity: 0, y: 140 }, { opacity: 1, y: 0, duration: 0.34, ease: "back.out(2)", stagger: 0.05 }, 0.05);
    tl.fromTo("#d-hl", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.2);
    tl.fromTo("#d-tag", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.25);
    for (let k = 1; k <= 4; k++) tl.to("#d-hl", { x: 190 * k, duration: 0.12, ease: "power3.inOut" }, 0.35 + k * 0.17);
    rise(tl, "#d-l2", «senza» - 0.08);
    sink(tl, "#d-l1", «esce» - 0.16); sink(tl, "#d-l2", «esce» - 0.16);
    rise(tl, "#d-l3", «esce»);
    rise(tl, "#d-l4", «esce» + 0.25);
    tl.fromTo("#d-play", { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.36, ease: "back.out(2.8)" }, «esce» + 0.1);
    pop(tl, "#d-pill", «esce» + 0.3);
    tl.fromTo("#d-c4", { scale: 1 }, { scale: 1.12, duration: 0.3, ease: "back.out(3)", immediateRender: false }, «esce» + 0.1);
    exit(tl, "#g7-st", "L", DUR - 0.2);''', '''
    .d-c { position: absolute; top: 800px; width: 170px; height: 220px; border-radius: 32px; border: 3px solid #3a2f55; background: #120b22; text-align: center; }
    .d-c b { display: block; font: 800 110px/1 "Inter Display"; margin-top: 34px; }
    .d-c small { display: block; font: 600 32px/1 "Inter Display"; color: #8f88a6; margin-top: 8px; }''',
    fx=[('whoosh-short', 'quattro', -0.04, 0.3), ('key-press', 'quattro', 0.52, 0.24), ('key-press', 'quattro', 0.69, 0.24), ('key-press', 'quattro', 0.86, 0.24), ('key-press', 'quattro', 1.03, 0.24),
        ('whoosh-short', 'esce', -0.16, 0.22), ('pop', 'esce', 0.1, 0.34), ('sparkle', 'esce', 0.3, 0.14)])

add('g8', 'q475', 'edel', f'''      {zone(ln('v-l1', 'il secondo trailer', 't-sans t-mut'))}
      <div id="v-card" data-layout-allow-overlap style="position:absolute;left:110px;top:520px;width:860px;height:484px;border-radius:40px;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,0.6);background:#000">
        <video id="v-vid" class="clip" src="assets/video/city.mp4" data-start="0" data-duration="VDUR" data-media-start="0.3" muted playsinline style="position:absolute;left:0;top:-520px;width:860px;height:1529px;object-fit:cover"></video>
        <div style="position:absolute;left:0;right:0;bottom:0;height:160px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.75))"></div>
        <div style="position:absolute;left:36px;right:36px;bottom:34px;height:10px;border-radius:5px;background:rgba(255,255,255,0.3)"><div id="v-bar" style="height:100%;border-radius:5px;background:#ff2d95;transform-origin:left center"></div></div>
      </div>
      <div id="v-n" class="grad" style="position:absolute;left:0;right:0;top:1070px;text-align:center;font:italic 800 140px/1.1 Inter;letter-spacing:-0.03em;white-space:nowrap"><span id="v-nv">0</span></div>
      {zone(ln('v-l2', 'visualizzazioni', 't-sans'), top=1230)}
      <div id="v-pill" class="pill" style="left:690px;top:1010px;transform:rotate(4deg)">in un giorno</div>
      <div class="tag" id="v-tag" style="top:1400px">Dato dichiarato da Rockstar, su tutte le piattaforme</div>''', f'''    enter(tl, "#g8-st", "Z");
    rise(tl, "#v-l1", 0.03);
    tl.fromTo("#v-card", {{ y: 300, opacity: 0, rotation: 5 }}, {{ y: 0, opacity: 1, rotation: 0, duration: 0.4, ease: "expo.out" }}, 0.02);
    tl.fromTo("#v-bar", {{ scaleX: 0.05 }}, {{ scaleX: 0.9, duration: DUR, ease: "none" }}, 0);
    tl.fromTo("#v-n", {{ opacity: 0, y: 80 }}, {{ opacity: 1, y: 0, duration: 0.25, ease: "expo.out" }}, 0.04);
    count(tl, "#v-nv", 0, 475000000, 0.06, 1.1, (v) => String(Math.round(v)){DOTS});
    tl.fromTo("#v-n", {{ scale: 1.16 }}, {{ scale: 1, duration: 0.34, ease: "back.out(3)", immediateRender: false }}, «milioni» + 0.1);
    rise(tl, "#v-l2", «visual» - 0.08);
    tl.fromTo("#v-tag", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.25 }}, «visual» + 0.2);
    pop(tl, "#v-pill", «ingiorno» + 0.05);
    exit(tl, "#g8-st", "L", DUR - 0.2);''',
    fx=[('whoosh', 'q475', -0.04, 0.3), ('typing', 'q475', 0.06, 0.22), ('typing', 'q475', 0.7, 0.2), ('impact-bass-1', 'milioni', 0.08, 0.24), ('pop', 'ingiorno', 0.05, 0.32)])

def news(i, top, rot, w1, w2):
    return (f'<div class="n-c" id="n-c{i}" style="top:{top}px;transform:rotate({rot}deg)"><span>TRAILER 2</span>'
            f'<i style="width:{w1}%"></i><i style="width:{w2}%"></i></div>')
add('g8b', 'edel', 'due2', f'''      {zone(ln('n-l1', 'e del rinvio', 't-sans t-mut'), ln('n-l2', 'non parla più nessuno', 't-it grad', 'font-size:66px', mt=-18))}
      <div id="n-st" class="pill" style="left:230px;top:900px;font-size:110px;padding:26px 54px;background:#ff3b30;transform:rotate(-9deg);opacity:1">rinviato</div>
      {news(1, 760, -4, 92, 64)}{news(2, 980, 3, 80, 88)}{news(3, 1200, -2, 96, 52)}''', '''    enter(tl, "#g8b-st", "U");
    rise(tl, "#n-l1", 0.05);
    tl.fromTo("#n-st", { scale: 1.1 }, { scale: 1, duration: 0.3, ease: "expo.out" }, 0.05);
    tl.fromTo(".n-c", { opacity: 0, x: 1000 }, { opacity: 1, x: 0, duration: 0.42, ease: "expo.out", stagger: 0.13 }, «nonparla» - 0.25);
    tl.to("#n-st", { opacity: 0.12, scale: 0.8, duration: 0.5, ease: "power2.out" }, «nonparla» - 0.2);
    rise(tl, "#n-l2", «nonparla» - 0.08);
    exit(tl, "#g8b-st", "L", DUR - 0.2);''', '''
    .n-c { position: absolute; left: 130px; width: 820px; height: 190px; border-radius: 30px; background: #fff; padding: 30px 38px; box-shadow: 0 30px 90px rgba(0,0,0,0.5); }
    .n-c span { display: inline-block; padding: 8px 18px; border-radius: 10px; background: linear-gradient(92deg, #ff2d95, #ff8a3c); color: #fff; font: 800 28px/1 "Inter Display"; letter-spacing: 0.06em; }
    .n-c i { display: block; height: 22px; border-radius: 11px; background: #1b1430; margin-top: 20px; }
    .n-c i + i { background: #b9b3cc; height: 16px; margin-top: 16px; }''',
    fx=[('whoosh-short', 'edel', -0.04, 0.3), ('pop', 'nonparla', -0.25, 0.26), ('pop', 'nonparla', -0.12, 0.26), ('pop', 'nonparla', 0.01, 0.26)])

# ------------------------------------------------------------------ 2: lo spot su Netflix
title('g9', 'due2', 'unvideo', 2, 'lo spot su Netflix', 'spot', wsize=84)

add('g10', 'unvideo', 'primo', f'''      {zone(ln('x-l1', 'un video di', 't-sans t-mut'), ln('x-l2', "quasi mezz'ora", 't-it grad', 'font-size:112px', mt=-22))}
      {zone(ln('x-l3', 'in anteprima su', 't-sans t-mut'), ln('x-l4', 'NETFLIX', 'split', 'font:900 150px/1.06 Inter;letter-spacing:0.02em;color:#e50914', mt=-10))}
      <div id="x-card" data-layout-allow-overlap style="position:absolute;left:110px;top:740px;width:860px;height:484px;border-radius:40px;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,0.6);background:#000">
        <video id="x-vid" class="clip" src="assets/video/city.mp4" data-start="0" data-duration="VDUR" data-media-start="2.0" muted playsinline style="position:absolute;left:0;top:-520px;width:860px;height:1529px;object-fit:cover"></video>
        <div style="position:absolute;left:0;right:0;bottom:0;height:160px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.75))"></div>
        <div style="position:absolute;left:36px;right:190px;bottom:40px;height:10px;border-radius:5px;background:rgba(255,255,255,0.3)"><div id="x-bar" style="height:100%;border-radius:5px;background:#e50914;transform-origin:left center"></div></div>
        <div style="position:absolute;right:36px;bottom:26px;font:700 38px/1 Inter;color:#fff">26:59</div>
      </div>
      <div id="x-pill" class="pill" style="left:120px;top:690px;background:#e50914;transform:rotate(-4deg)">anteprima</div>''', '''    enter(tl, "#g10-st", "L");
    rise(tl, "#x-l1", 0.05);
    tl.fromTo("#x-card", { y: 300, opacity: 0, rotation: -5 }, { y: 0, opacity: 1, rotation: 0, duration: 0.45, ease: "expo.out" }, 0.08);
    tl.fromTo("#x-bar", { scaleX: 0.02 }, { scaleX: 1, duration: DUR, ease: "none" }, 0);
    rise(tl, "#x-l2", «mezzora» - 0.3);
    tl.fromTo("#x-card", { scale: 1 }, { scale: 1.05, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, «mezzora»);
    sink(tl, "#x-l1", «anteprima» - 0.16); sink(tl, "#x-l2", «anteprima» - 0.16);
    rise(tl, "#x-l3", «anteprima»);
    pop(tl, "#x-pill", «anteprima» + 0.1);
    flip(tl, "#x-l4", «netflix» - 0.06, 0.04);
    exit(tl, "#g10-st", "Z", DUR - 0.18);''',
    fx=[('whoosh', 'unvideo', -0.04, 0.3), ('pop', 'mezzora', 0.0, 0.26), ('whoosh-short', 'anteprima', -0.16, 0.22), ('pop', 'anteprima', 0.1, 0.28), ('impact-bass-1', 'netflix', -0.04, 0.28)])

add('g11', 'primo', 'erauno', f'''      {zone(ln('k-l1', 'primo in classifica', 't-sans'))}
      <div id="k-one" class="grad" style="position:absolute;left:0;right:0;top:500px;text-align:center;font:italic 900 430px/1.1 Inter;letter-spacing:-0.05em">#1</div>
      <div id="k-in" style="position:absolute;left:0;right:0;top:1030px;text-align:center;font:italic 800 120px/1.1 Inter;letter-spacing:-0.02em;white-space:nowrap">IN <span id="k-nv">0</span> PAESI</div>
      <div class="tag" id="k-tag" style="top:1220px">Dati Netflix: 31,1 milioni di visualizzazioni in quattro giorni</div>''', '''    enter(tl, "#g11-st", "U");
    rise(tl, "#k-l1", 0.05);
    tl.fromTo("#k-one", { opacity: 0, scale: 0.4, rotation: -8 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.42, ease: "back.out(2.2)" }, 0.08);
    tl.fromTo("#k-in", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, «ottantasette» - 0.3);
    count(tl, "#k-nv", 0, 87, «ottantasette» - 0.25, 0.6);
    tl.fromTo("#k-in", { scale: 1.16 }, { scale: 1, duration: 0.34, ease: "back.out(3)", immediateRender: false }, «paesi»);
    tl.fromTo("#k-tag", { opacity: 0 }, { opacity: 1, duration: 0.25 }, «paesi» + 0.1);
    tl.to("#k-one", { scale: 1.07, duration: 1.2, ease: "none" }, 0.5);
    exit(tl, "#g11-st", "L", DUR - 0.2);''',
    fx=[('whoosh-short', 'primo', -0.04, 0.3), ('impact-bass-1', 'primo', 0.1, 0.26), ('typing', 'ottantasette', -0.25, 0.22), ('pop', 'paesi', 0.0, 0.3)])

add('g11b', 'erauno', 'tre3', f'''      {vid('f-v', 'crowd.mp4', T['tre3'] - T['erauno'])}
      {zone(ln('f-l1', 'era uno', 't-sans'), ln('f-l2', 'spot', 't-it split', 'font-size:210px', mt=-30))}
      {zone(ln('f-l3', "la gente l'ha scelto", 't-sans'), ln('f-l4', 'come un film', 't-it grad', 'font-size:126px', mt=-22))}''', '''    enter(tl, "#g11b-st", "L");
    tl.fromTo("#f-v-w", { scale: 1.18 }, { scale: 1.02, duration: DUR, ease: "none" }, 0);
    rise(tl, "#f-l1", 0.05);
    flip(tl, "#f-l2", «spot2» - 0.06, 0.05);
    sink(tl, "#f-l1", «elagente» - 0.16); sink(tl, "#f-l2", «elagente» - 0.16);
    rise(tl, "#f-l3", «elagente»);
    rise(tl, "#f-l4", «film» - 0.4);
    exit(tl, "#g11b-st", "Z", DUR - 0.18);''', glow=False,
    fx=[('whoosh', 'erauno', -0.04, 0.3), ('impact-bass-1', 'spot2', -0.04, 0.26), ('whoosh-short', 'elagente', -0.16, 0.22), ('sparkle', 'film', -0.3, 0.16)])

# ------------------------------------------------------------------ 3: l'esca
title('g12', 'tre3', 'versione', 3, "l'esca", 'esca', wsize=150)

CK = '<svg viewBox="0 0 24 24" width="34" height="34"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#ff8a3c" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
add('g13', 'versione', 'risultato', f'''      {zone(ln('e-l1', 'la versione base', 't-sans t-mut'))}
      {zone(ln('e-l2', 'quella speciale', 't-sans'))}
      {zone(ln('e-l3', 'solo venti euro', 't-sans'), ln('e-l4', 'in più', 't-it grad', 'font-size:140px', mt=-22))}
      <div class="e-c" id="e-c1" style="left:70px;top:760px;height:480px"><small>BASE</small><b id="e-p1">79,99 €</b><i style="width:78%"></i><i style="width:56%"></i></div>
      <div class="e-c e-u" id="e-c2" style="left:560px;top:700px;height:600px"><small>ULTIMATE</small><b id="e-p2" class="grad">99,99 €</b>
        <span>{CK}<i style="width:230px"></i></span><span>{CK}<i style="width:270px"></i></span><span>{CK}<i style="width:200px"></i></span><span>{CK}<i style="width:250px"></i></span></div>
      <div id="e-plus" class="pill" style="left:356px;top:1310px;font-size:96px;padding:22px 50px">+20 €</div>''', '''    enter(tl, "#g13-st", "L");
    rise(tl, "#e-l1", 0.05);
    tl.fromTo("#e-c1", { opacity: 0, y: 260, rotation: -5 }, { opacity: 1, y: 0, rotation: 0, duration: 0.42, ease: "back.out(1.8)" }, 0.1);
    tl.fromTo("#e-p1", { scale: 1.4 }, { scale: 1, duration: 0.34, ease: "back.out(3)", immediateRender: false }, «ottanta»);
    sink(tl, "#e-l1", «quella» - 0.16);
    rise(tl, "#e-l2", «quella»);
    tl.fromTo("#e-c2", { opacity: 0, y: 300, rotation: 6 }, { opacity: 1, y: 0, rotation: 0, duration: 0.42, ease: "back.out(1.8)" }, «quella» + 0.05);
    tl.fromTo("#e-p2", { scale: 1.4 }, { scale: 1, duration: 0.34, ease: "back.out(3)", immediateRender: false }, «cento»);
    tl.to("#e-c1", { opacity: 0.55, scale: 0.95, duration: 0.3 }, «cento»);
    sink(tl, "#e-l2", «soloventi» - 0.16);
    rise(tl, "#e-l3", «soloventi»);
    rise(tl, "#e-l4", «inpiu» - 0.08);
    pop(tl, "#e-plus", «soloventi» + 0.25);
    tl.fromTo("#e-c2", { scale: 1 }, { scale: 1.06, duration: 0.3, ease: "back.out(3)", immediateRender: false }, «inpiu»);
    exit(tl, "#g13-st", "Z", DUR - 0.18);''', '''
    .e-c { position: absolute; width: 450px; border-radius: 40px; border: 3px solid #3a2f55; background: #120b22; padding: 44px 40px; }
    .e-c small { display: block; font: 700 34px/1 "Inter Display"; letter-spacing: 0.1em; color: #a59fb8; }
    .e-c b { display: block; font: italic 800 92px/1.1 "Inter Display"; letter-spacing: -0.03em; margin: 22px 0 34px; white-space: nowrap; transform-origin: left center; }
    .e-c > i { display: block; height: 18px; border-radius: 9px; background: #3a2f55; margin-top: 22px; }
    .e-c span { display: flex; align-items: center; gap: 16px; margin-top: 22px; }
    .e-c span i { display: block; height: 18px; border-radius: 9px; background: #5a4a80; }
    .e-u { border: 4px solid #ff2d95; background: linear-gradient(180deg, rgba(255,45,149,0.16), rgba(255,138,60,0.06)); box-shadow: 0 0 80px rgba(255,45,149,0.3); }
    .e-u small { color: #ff8a3c; }''',
    fx=[('whoosh', 'versione', -0.04, 0.3), ('pop', 'versione', 0.12, 0.26), ('key-press', 'ottanta', 0.0, 0.26), ('pop', 'quella', 0.07, 0.28), ('key-press', 'cento', 0.0, 0.26), ('whoosh-short', 'soloventi', -0.16, 0.22), ('pop', 'soloventi', 0.25, 0.34), ('sparkle', 'inpiu', 0.0, 0.14)])

DOTSROW = lambda p: ''.join(f'<i class="o-d {p}" id="{p}{k}"></i>' for k in range(10))
add('g14', 'risultato', 'lezione', f'''      {zone(ln('o-l1', 'risultato?', 't-it split', 'font-size:120px'))}
      {zone(ln('o-l2', 'quasi nove su dieci', 't-sans'), ln('o-l3', 'la più cara', 't-it grad', 'font-size:126px', mt=-22))}
      {zone(ln('o-l4', 'di solito', 't-sans t-mut'), ln('o-l5', 'uno o due', 't-it', 'font-size:136px', mt=-22))}
      <div id="o-ta" class="o-t" style="top:770px">GTA 6</div>
      <div class="o-r" id="o-ra" style="top:830px">{DOTSROW('oa')}</div>
      <div id="o-tb" class="o-t" style="top:1040px">di solito</div>
      <div class="o-r" id="o-rb" style="top:1100px">{DOTSROW('ob')}</div>
      <div class="tag" id="o-tag" style="top:1270px">Stima Sensor Tower sui preordini (quota dell'edizione più cara)</div>''', '''    enter(tl, "#g14-st", "U");
    flip(tl, "#o-l1", 0.03, 0.03);
    sink(tl, "#o-l1", «secondo2» - 0.16);
    tl.fromTo(["#o-ta", "#o-ra"], { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, «secondo2» - 0.1);
    tl.fromTo("#o-tag", { opacity: 0 }, { opacity: 1, duration: 0.25 }, «secondo2» + 0.1);
    rise(tl, "#o-l2", «nove» - 0.3);
    for (let k = 0; k < 9; k++) tl.to("#oa" + k, { backgroundImage: "linear-gradient(135deg,#ff2d95,#ff8a3c)", scale: 1.12, duration: 0.1, yoyo: false }, «nove» - 0.25 + k * 0.055);
    for (let k = 0; k < 9; k++) tl.to("#oa" + k, { scale: 1, duration: 0.12 }, «nove» - 0.13 + k * 0.055);
    rise(tl, "#o-l3", «cara» - 0.35);
    sink(tl, "#o-l2", «disolito» - 0.16); sink(tl, "#o-l3", «disolito» - 0.16);
    rise(tl, "#o-l4", «disolito»);
    tl.fromTo(["#o-tb", "#o-rb"], { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, «disolito»);
    rise(tl, "#o-l5", «unodue» - 0.06);
    for (let k = 0; k < 2; k++) { tl.to("#ob" + k, { backgroundColor: "#ffffff", duration: 0.1 }, «unodue» + k * 0.25); tl.fromTo("#ob" + k, { scale: 1.3 }, { scale: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, «unodue» + k * 0.25); }
    exit(tl, "#g14-st", "L", DUR - 0.2);''', '''
    .o-r { position: absolute; left: 81px; width: 918px; display: flex; justify-content: space-between; }
    .o-d { display: block; width: 72px; height: 72px; border-radius: 50%; background-color: #2a2140; }
    .o-t { position: absolute; left: 81px; font: 700 34px/1 "Inter Display"; color: #a59fb8; letter-spacing: 0.04em; }''',
    fx=[('whoosh-short', 'risultato', -0.04, 0.3), ('key-press', 'risultato', 0.03, 0.24), ('whoosh-short', 'secondo2', -0.16, 0.2), ('typing', 'nove', -0.25, 0.24), ('impact-bass-1', 'cara', -0.1, 0.24),
        ('whoosh-short', 'disolito', -0.16, 0.22), ('pop', 'unodue', 0.0, 0.3), ('pop', 'unodue', 0.25, 0.3)])

# ------------------------------------------------------------------ lesson + CTA
add('g16', 'lezione', 'sevuoi', f'''      {vid('l-v', 'car.mp4', T['sevuoi'] - T['lezione'], 0.0)}
      <div style="position:absolute;inset:0;background:rgba(7,4,13,0.28)"></div>
      {zone(ln('l-l1', 'la lezione?', 't-sans'))}
      {zone(ln('l-l2', 'non abbassare il prezzo', 't-sans', 'font-size:76px'))}
      {zone(ln('l-l3', "mettici accanto un'offerta", 't-sans', 'font-size:70px'))}
      <div style="position:absolute;left:0;right:0;top:620px;text-align:center">
        <div id="l-b1" class="split" style="font:italic 900 76px/1.1 Inter;letter-spacing:-0.02em">CHE LO FA SEMBRARE</div>
        <div id="l-b2" class="split grad" style="font:italic 900 158px/1.1 Inter;letter-spacing:-0.03em">UN AFFARE</div>
      </div>''', '''    enter(tl, "#g16-st", "L");
    tl.fromTo("#l-v-w", { scale: 1.2 }, { scale: 1.04, duration: DUR, ease: "none" }, 0);
    rise(tl, "#l-l1", 0.05);
    sink(tl, "#l-l1", «nonabb» - 0.18);
    rise(tl, "#l-l2", «nonabb»);
    sink(tl, "#l-l2", «mettici» - 0.18);
    rise(tl, "#l-l3", «mettici»);
    flip(tl, "#l-b1", «chelofa» - 0.06, 0.02);
    flip(tl, "#l-b2", «affare» - 0.12, 0.035);
    tl.fromTo("#l-b2", { scale: 1.25 }, { scale: 1, duration: 0.4, ease: "back.out(2.6)", immediateRender: false }, «affare» + 0.15);
    exit(tl, "#g16-st", "Z", DUR - 0.18);''', glow=False,
    fx=[('whoosh', 'lezione', -0.04, 0.3), ('whoosh-short', 'nonabb', -0.18, 0.22), ('whoosh-short', 'mettici', -0.18, 0.2), ('key-press', 'chelofa', -0.06, 0.24), ('impact-bass-1', 'affare', 0.05, 0.3), ('sparkle', 'affare', 0.05, 0.16)])

add('g17', 'sevuoi', 'END', f'''      {zone(ln('m-a1', 'vuoi sapere come', 't-sans t-mut'), ln('m-a2', 'creo questi video?', 't-sans', mt=-22))}
      {zone(ln('m-b1', 'scrivi', 't-sans t-mut'))}
      <div id="m-m" class="split grad" style="position:absolute;left:0;right:0;top:470px;text-align:center;font:italic 900 214px/1.1 Inter;letter-spacing:-0.04em">MOTION</div>
      <div id="m-bar" style="position:absolute;left:90px;top:830px;width:900px;height:140px;border-radius:70px;border:4px solid #3a2f55;background:#120b22;display:flex;align-items:center;padding:0 44px 0 24px;gap:26px">
        <div style="width:92px;height:92px;border-radius:50%;background:linear-gradient(135deg,#ff2d95,#5b2bd6)"></div>
        <div id="m-t" class="split" style="flex:1;font:600 52px/1 Inter;letter-spacing:0.01em">MOTION</div>
        <div id="m-pub" style="font:700 46px/1 Inter;color:#2de2e6">Pubblica</div>
      </div>
      <div id="m-cur" class="cur" style="left:880px;top:920px">{CURSOR}</div>
      {zone(ln('m-c1', 'e ti spiego tutto', 't-sans'), top=1070)}''', '''    enter(tl, "#g17-st", "U");
    rise(tl, "#m-a1", 0.05);
    rise(tl, "#m-a2", «creo» - 0.1);
    sink(tl, "#m-a1", «scrivi» - 0.2); sink(tl, "#m-a2", «scrivi» - 0.2);
    rise(tl, "#m-b1", «scrivi» - 0.05);
    tl.fromTo("#m-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.35, ease: "expo.out" }, «scrivi»);
    flip(tl, "#m-m", «motion» - 0.08, 0.05);
    typeIn(tl, "#m-t", «motion», 0.07);
    rise(tl, "#m-c1", «etispiego»);
    tl.fromTo("#m-cur", { opacity: 0, x: 160, y: 200 }, { opacity: 1, x: 0, y: 0, duration: 0.36, ease: "power3.out" }, «etispiego» + 0.15);
    tl.to("#m-cur", { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1 }, «tutto» - 0.1);
    tl.fromTo("#m-pub", { scale: 1 }, { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 }, «tutto» - 0.08);''',
    fx=[('whoosh-short', 'sevuoi', -0.04, 0.3), ('whoosh-short', 'scrivi', -0.2, 0.22), ('key-press', 'motion', -0.08, 0.28), ('typing', 'motion', 0.0, 0.22), ('click-soft', 'tutto', -0.1, 0.42), ('pop', 'tutto', -0.06, 0.26)])

if __name__ == '__main__':
    for s in SC:
        open(OUT + s['id'] + '.html', 'w').write(scene(s['id'], s['dur'], s['body'], s['js'], s['css']))
    print('written', [s['id'] for s in SC])
