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
      {zone(ln('h-l1', 'ha già incassato', 't-sans'), top=560)}
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

add('g2', 'prima', 'eper', f'''      {vid('p-v', 'city.mp4', T['eper'] - T['prima'])}
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

def adcard(i, left, label, shape):
    return (f'<div class="r-ad" id="r-ad{i}" style="left:{left}px"><div class="r-sh">{shape}</div><b>{label}</b>'
            f'<i id="r-x{i}" class="r-x"></i></div>')
add('g3', 'eper', 'questi', f'''      {zone(ln('r-l1', 'per anni, Rockstar', 't-sans'))}
      {zone(ln('r-l2', 'quasi nessuna', 't-sans t-mut'), ln('r-l3', 'pubblicità', 't-it split grad', 'font-size:128px', mt=-22))}
      {adcard(1, 70, 'SPOT TV', '<svg viewBox="0 0 100 70" width="170"><rect x="6" y="4" width="88" height="52" rx="6" fill="none" stroke="#a59fb8" stroke-width="4"/><path d="M34 66h32" stroke="#a59fb8" stroke-width="4" stroke-linecap="round"/><path d="M44 20v20l16-10z" fill="#a59fb8"/></svg>')}
      {adcard(2, 390, 'CARTELLONI', '<svg viewBox="0 0 100 70" width="170"><rect x="6" y="4" width="88" height="40" rx="5" fill="none" stroke="#a59fb8" stroke-width="4"/><path d="M26 44v22M74 44v22" stroke="#a59fb8" stroke-width="4" stroke-linecap="round"/><path d="M20 18h40M20 30h26" stroke="#a59fb8" stroke-width="4" stroke-linecap="round"/></svg>')}
      {adcard(3, 710, 'BANNER', '<svg viewBox="0 0 100 70" width="170"><rect x="6" y="14" width="88" height="42" rx="5" fill="none" stroke="#a59fb8" stroke-width="4"/><rect x="16" y="24" width="24" height="22" rx="3" fill="#a59fb8"/><path d="M50 28h34M50 40h22" stroke="#a59fb8" stroke-width="4" stroke-linecap="round"/></svg>')}''', '''    enter(tl, "#g3-st", "Z");
    rise(tl, "#r-l1", 0.05);
    tl.fromTo(".r-ad", { opacity: 0, y: 220, rotation: 6 }, { opacity: 1, y: 0, rotation: 0, duration: 0.42, ease: "back.out(1.8)", stagger: 0.09 }, 0.12);
    sink(tl, "#r-l1", «quasi» - 0.2);
    rise(tl, "#r-l2", «quasi» - 0.04);
    for (let k = 1; k <= 3; k++) { tl.fromTo("#r-x" + k, { scaleX: 0 }, { scaleX: 1, duration: 0.16, ease: "power2.out" }, «quasi» + (k - 1) * 0.16); tl.to("#r-ad" + k, { opacity: 0.35, scale: 0.94, duration: 0.2 }, «quasi» + 0.1 + (k - 1) * 0.16); }
    flip(tl, "#r-l3", «pubblicita» - 0.06, 0.03);
    exit(tl, "#g3-st", "L", DUR - 0.2);''', '''
    .r-ad { position: absolute; top: 800px; width: 300px; height: 380px; border-radius: 34px; border: 3px solid #3a2f55; background: #120b22; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 34px; }
    .r-ad b { font: 700 36px/1 "Inter Display"; letter-spacing: 0.06em; color: #d9d4ea; }
    .r-sh { height: 120px; display: flex; align-items: center; }
    .r-x { position: absolute; left: -20px; right: -20px; top: 50%; height: 12px; margin-top: -6px; border-radius: 6px; background: #ff3b30; transform: rotate(-24deg); transform-origin: left center; }''',
    fx=[('whoosh-cinematic', 'eper', -0.06, 0.22), ('pop', 'eper', 0.2, 0.24), ('click-soft', 'quasi', 0.0, 0.36), ('click-soft', 'quasi', 0.16, 0.36), ('click-soft', 'quasi', 0.32, 0.36), ('key-press', 'pubblicita', -0.06, 0.24)])

add('g4', 'questi', 'uno', f'''      {zone(ln('t-l1', 'questi sono i', 't-sans split'))}
      {zone(ln('t-l3', '<span class="t-it grad" style="padding:0 0.1em">il terzo</span> <span class="t-sans">lo puoi</span>', ''), ln('t-l4', 'copiare anche tu', 't-sans', mt=-22))}
      <div class="bignum" id="t-num" style="top:600px"><div id="t-col"><div>1</div><div>2</div><div id="t-three">3</div></div></div>
      {zone(ln('t-l2', 'trucchi che ha usato', 't-sans t-mut'), top=1110)}
      <div id="t-sel" class="sel" style="left:360px;top:630px;width:360px;height:420px">{SEL}</div>
      <div id="t-cur" class="cur" style="left:700px;top:990px">{CURSOR}</div>
      <div id="t-pill" class="pill" style="left:700px;top:640px;transform:rotate(5deg)">copialo</div>''', '''    enter(tl, "#g4-st", "U");
    flip(tl, "#t-l1", 0.02, 0.022);
    tl.fromTo("#t-col", { y: 0 }, { y: -470 * 2, duration: 0.55, ease: "expo.out" }, «tre» - 0.12);
    tl.fromTo("#t-num", { scale: 0.86, rotation: -5 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2)" }, «tre» - 0.12);
    rise(tl, "#t-l2", «trucchi» - 0.06);
    tl.to("#t-num", { scale: 1.08, duration: 1.0, ease: "none" }, «trucchi»);
    sink(tl, "#t-l1", «eil» - 0.18); sink(tl, "#t-l2", «eil» - 0.18);
    rise(tl, "#t-l3", «eil»);
    tl.to("#t-num", { scale: 1, duration: 0.3, ease: "back.out(3)" }, «terzo»);
    select(tl, "#t-sel", "#t-cur", «terzo» + 0.1);
    rise(tl, "#t-l4", «copiare» - 0.08);
    pop(tl, "#t-pill", «copiare» + 0.1);
    tl.to(["#t-sel", "#t-cur", "#t-pill"], { opacity: 0, duration: 0.12 }, DUR - 0.5);
    tl.to("#t-num", { scale: 14, duration: 0.42, ease: "power3.in" }, DUR - 0.44);''',
    fx=[('whoosh-short', 'questi', -0.04, 0.3), ('typing', 'questi', 0.0, 0.18), ('pop', 'tre', -0.1, 0.3), ('click-soft', 'terzo', 0.36, 0.4), ('pop', 'copiare', 0.1, 0.3), ('whoosh-cinematic', 'uno', -0.5, 0.3)])

# ------------------------------------------------------------------ 1: il silenzio
title('g5', 'uno', 'per', 1, 'il silenzio', 'silenzio')

PLAY = '<svg viewBox="0 0 100 100" width="118" height="118"><circle cx="50" cy="50" r="48" fill="url(#gp)"/><path d="M41 31v38l31-19z" fill="#fff"/><defs><linearGradient id="gp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff2d95"/><stop offset="1" stop-color="#ff8a3c"/></linearGradient></defs></svg>'
add('g6', 'per', 'cosi', f'''      {zone(ln('s-l1', 'per quasi tre anni', 't-sans t-mut'), ln('s-l2', 'due trailer', 't-it grad', 'font-size:128px', mt=-22))}
      {zone(ln('s-l3', 'e in mezzo', 't-sans t-mut'), ln('s-l4', 'niente', 't-it split', 'font-size:170px', mt=-22))}
      <svg style="position:absolute;left:0;top:0" width="1080" height="1920"><line id="s-line" x1="90" y1="1000" x2="990" y2="1000" stroke="#4a3d6b" stroke-width="8" stroke-linecap="round"/><rect id="s-gap" x="236" y="900" width="372" height="200" rx="26" fill="rgba(255,45,149,0.1)" stroke="#ff2d95" stroke-width="4" stroke-dasharray="14 12"/></svg>
      <div class="s-p" id="s-p1" style="left:101px">{PLAY}<b>Trailer 1</b><small>dic 2023</small></div>
      <div class="s-p" id="s-p2" style="left:623px">{PLAY}<b>Trailer 2</b><small>mag 2025</small></div>
      <div id="s-end" style="position:absolute;left:890px;top:1080px;width:160px;text-align:center;font:600 34px/1 Inter;color:#8f88a6">2026</div>
      <div id="s-mid" class="pill" style="left:236px;top:1200px">17 mesi di silenzio</div>''', '''    enter(tl, "#g6-st", "L");
    rise(tl, "#s-l1", 0.05);
    draw(tl, "#s-line", 0.1, 0.6);
    tl.fromTo("#s-end", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.6);
    rise(tl, "#s-l2", «due» - 0.08);
    tl.fromTo("#s-p1", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.36, ease: "back.out(2.6)" }, «due» - 0.02);
    tl.fromTo("#s-p2", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.36, ease: "back.out(2.6)" }, «trailer» - 0.02);
    sink(tl, "#s-l1", «emezzo» - 0.16); sink(tl, "#s-l2", «emezzo» - 0.16);
    rise(tl, "#s-l3", «emezzo»);
    tl.fromTo("#s-gap", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «emezzo» + 0.05);
    flip(tl, "#s-l4", «niente» - 0.06, 0.04);
    pop(tl, "#s-mid", «niente» + 0.12);
    exit(tl, "#g6-st", "U", DUR - 0.2);''', '''
    .s-p { position: absolute; top: 941px; width: 118px; text-align: center; }
    .s-p svg { display: block; }
    .s-p b { display: block; margin: 24px -70px 0; font: 700 40px/1 "Inter Display"; white-space: nowrap; }
    .s-p small { display: block; margin: 10px -70px 0; font: 500 32px/1 "Inter Display"; color: #8f88a6; white-space: nowrap; }''',
    fx=[('whoosh', 'per', -0.04, 0.3), ('pop', 'due', 0.0, 0.32), ('pop', 'trailer', 0.0, 0.32), ('whoosh-short', 'emezzo', -0.16, 0.22), ('impact-bass-1', 'niente', -0.04, 0.24), ('pop', 'niente', 0.12, 0.26)])

def news(i, top, rot, w1, w2):
    return (f'<div class="n-c" id="n-c{i}" style="top:{top}px;transform:rotate({rot}deg)"><span>ULTIM\'ORA</span>'
            f'<i style="width:{w1}%"></i><i style="width:{w2}%"></i></div>')
add('g7', 'cosi', 'ilsecondo', f'''      {zone(ln('n-l1', 'ogni loro mossa', 't-sans'), ln('n-l2', 'una notizia', 't-it grad', 'font-size:128px', mt=-22))}
      {news(1, 760, -4, 92, 64)}{news(2, 980, 3, 80, 88)}{news(3, 1200, -2, 96, 52)}''', '''    enter(tl, "#g7-st", "U");
    rise(tl, "#n-l1", 0.15);
    tl.fromTo(".n-c", { opacity: 0, x: 900 }, { opacity: 1, x: 0, duration: 0.42, ease: "expo.out", stagger: 0.14 }, «mossa» - 0.1);
    rise(tl, "#n-l2", «notizia» - 0.3);
    tl.fromTo(".n-c", { scale: 1 }, { scale: 1.05, duration: 0.14, yoyo: true, repeat: 1, stagger: 0.05, immediateRender: false }, «notizia»);
    exit(tl, "#g7-st", "L", DUR - 0.2);''', '''
    .n-c { position: absolute; left: 130px; width: 820px; height: 190px; border-radius: 30px; background: #fff; padding: 30px 38px; box-shadow: 0 30px 90px rgba(0,0,0,0.5); }
    .n-c span { display: inline-block; padding: 8px 18px; border-radius: 10px; background: linear-gradient(92deg, #ff2d95, #ff8a3c); color: #fff; font: 800 28px/1 "Inter Display"; letter-spacing: 0.06em; }
    .n-c i { display: block; height: 22px; border-radius: 11px; background: #1b1430; margin-top: 20px; }
    .n-c i + i { background: #b9b3cc; height: 16px; margin-top: 16px; }''',
    fx=[('whoosh-short', 'cosi', -0.04, 0.3), ('pop', 'mossa', -0.1, 0.26), ('pop', 'mossa', 0.04, 0.26), ('pop', 'mossa', 0.18, 0.26), ('ping', 'notizia', -0.1, 0.2)])

add('g8', 'ilsecondo', 'due2', f'''      {zone(ln('v-l1', 'il secondo trailer', 't-sans'))}
      <div id="v-card" data-layout-allow-overlap style="position:absolute;left:110px;top:520px;width:860px;height:484px;border-radius:40px;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,0.6);background:#000">
        <video id="v-vid" class="clip" src="assets/video/city.mp4" data-start="0" data-duration="VDUR" data-media-start="0.3" muted playsinline style="position:absolute;left:0;top:-520px;width:860px;height:1529px;object-fit:cover"></video>
        <div style="position:absolute;left:0;right:0;bottom:0;height:160px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.75))"></div>
        <div style="position:absolute;left:36px;right:36px;bottom:34px;height:10px;border-radius:5px;background:rgba(255,255,255,0.3)"><div id="v-bar" style="height:100%;border-radius:5px;background:#ff2d95;transform-origin:left center"></div></div>
      </div>
      <div id="v-n" class="grad" style="position:absolute;left:0;right:0;top:1070px;text-align:center;font:italic 800 140px/1.1 Inter;letter-spacing:-0.03em;white-space:nowrap"><span id="v-nv">0</span></div>
      {zone(ln('v-l2', 'visualizzazioni', 't-sans'), top=1230)}
      <div id="v-pill" class="pill" style="left:690px;top:1010px;transform:rotate(4deg)">in un giorno</div>
      <div class="tag" id="v-tag" style="top:1400px">Dato dichiarato da Rockstar, su tutte le piattaforme</div>''', f'''    enter(tl, "#g8-st", "Z");
    rise(tl, "#v-l1", 0.05);
    tl.fromTo("#v-card", {{ y: 300, opacity: 0, rotation: 5 }}, {{ y: 0, opacity: 1, rotation: 0, duration: 0.45, ease: "expo.out" }}, 0.08);
    tl.fromTo("#v-bar", {{ scaleX: 0.05 }}, {{ scaleX: 0.9, duration: DUR, ease: "none" }}, 0);
    tl.fromTo("#v-n", {{ opacity: 0, y: 80 }}, {{ opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }}, «q475» - 0.2);
    count(tl, "#v-nv", 0, 475000000, «q475» - 0.15, 1.1, (v) => String(Math.round(v)){DOTS});
    tl.fromTo("#v-n", {{ scale: 1.16 }}, {{ scale: 1, duration: 0.34, ease: "back.out(3)", immediateRender: false }}, «milioni» + 0.1);
    rise(tl, "#v-l2", «visual» - 0.08);
    tl.fromTo("#v-tag", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.25 }}, «visual» + 0.2);
    pop(tl, "#v-pill", «ingiorno» + 0.1);
    exit(tl, "#g8-st", "L", DUR - 0.2);''',
    fx=[('whoosh', 'ilsecondo', -0.04, 0.3), ('typing', 'q475', -0.15, 0.22), ('typing', 'q475', 0.5, 0.2), ('impact-bass-1', 'milioni', 0.08, 0.24), ('pop', 'ingiorno', 0.1, 0.32)])

# ------------------------------------------------------------------ 2: l'attesa
title('g9', 'due2', 'tredici', 2, "l'attesa", 'attesa')

YRS = ''.join(f'<span style="display:block">{y}</span>' for y in range(2013, 2027))
add('g10', 'tredici', 'eogni', f'''      {zone(ln('a-l1', 'tredici anni', 't-it grad', 'font-size:124px'), ln('a-l2', "dall'ultimo capitolo", 't-sans t-mut', mt=-22))}
      {zone(ln('a-l3', 'due rinvii', 't-it', 'font-size:150px'))}
      <div id="a-yr" style="position:absolute;left:0;right:0;top:640px;height:260px;overflow:hidden;text-align:center;font:italic 800 250px/260px Inter;letter-spacing:-0.04em"><div id="a-ys">{YRS}</div></div>
      <div class="a-d" id="a-d1" style="left:70px;top:1010px"><b>2025</b><i class="a-x"></i></div>
      <div class="a-d" id="a-d2" style="left:340px;top:1010px;width:330px"><b>26 MAG 2026</b><i class="a-x"></i></div>
      <div class="a-d a-ok" id="a-d3" style="left:700px;top:1010px;width:310px"><b>19 NOV 2026</b></div>
      <div id="a-s1" class="pill" style="left:60px;top:960px;transform:rotate(-8deg);background:#ff3b30">rinviato</div>
      <div id="a-s2" class="pill" style="left:400px;top:960px;transform:rotate(6deg);background:#ff3b30">rinviato</div>''', '''    enter(tl, "#g10-st", "U");
    rise(tl, "#a-l1", 0.05);
    tl.fromTo("#a-ys", { y: 0 }, { y: -260 * 13, duration: 1.0, ease: "power3.inOut" }, 0.1);
    tl.fromTo("#a-yr", { scale: 0.85 }, { scale: 1, duration: 0.5, ease: "back.out(2)" }, 0.08);
    rise(tl, "#a-l2", «ultimo» - 0.1);
    sink(tl, "#a-l1", «duerinvii» - 0.18); sink(tl, "#a-l2", «duerinvii» - 0.18);
    tl.to("#a-yr", { scale: 0.62, y: -30, opacity: 0.5, duration: 0.3, ease: "expo.out" }, «duerinvii» - 0.15);
    rise(tl, "#a-l3", «duerinvii» - 0.04);
    tl.fromTo(".a-d", { opacity: 0, y: 160 }, { opacity: 1, y: 0, duration: 0.36, ease: "back.out(2)", stagger: 0.08 }, «duerinvii» - 0.1);
    tl.fromTo("#a-s1", { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: "power3.in" }, «duerinvii» + 0.28);
    tl.fromTo("#a-s2", { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: "power3.in" }, «duerinvii» + 0.5);
    tl.fromTo("#a-d1 .a-x", { scaleX: 0 }, { scaleX: 1, duration: 0.14 }, «duerinvii» + 0.3);
    tl.fromTo("#a-d2 .a-x", { scaleX: 0 }, { scaleX: 1, duration: 0.14 }, «duerinvii» + 0.52);
    tl.fromTo("#a-d3", { scale: 1 }, { scale: 1.1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, «duerinvii» + 0.72);
    exit(tl, "#g10-st", "L", DUR - 0.2);''', '''
    .a-d { position: absolute; width: 240px; height: 130px; border-radius: 30px; border: 4px solid #3a2f55; background: #120b22; display: flex; align-items: center; justify-content: center; }
    .a-d b { font: 700 42px/1 "Inter Display"; color: #a59fb8; white-space: nowrap; }
    .a-ok { border-color: #ff2d95; background: rgba(255,45,149,0.14); }
    .a-ok b { color: #fff; }
    .a-x { position: absolute; left: 14px; right: 14px; top: 50%; height: 8px; margin-top: -4px; border-radius: 4px; background: #ff3b30; transform-origin: left center; }''',
    fx=[('whoosh', 'tredici', -0.04, 0.3), ('typing', 'tredici', 0.1, 0.22), ('typing', 'tredici', 0.6, 0.2), ('whoosh-short', 'duerinvii', -0.18, 0.24), ('impact-bass-1', 'duerinvii', 0.3, 0.24), ('impact-bass-1', 'duerinvii', 0.52, 0.24), ('pop', 'duerinvii', 0.72, 0.3)])

add('g11', 'eogni', 'tre3', f'''      {zone(ln('w-l1', 'ogni rinvio', 't-sans t-mut'), ln('w-l2', 'il giro del mondo', 't-it grad', 'font-size:84px', mt=-22))}
      {zone(ln('w-l3', 'più aspetti una cosa', 't-sans'), ln('w-l4', 'più la vuoi', 't-it split grad', 'font-size:140px', mt=-22))}
      <div id="w-globe" style="position:absolute;left:260px;top:790px;width:560px;height:560px">
        <svg viewBox="0 0 560 560" width="560" height="560"><g fill="none" stroke="#7b5cff" stroke-width="5"><circle cx="280" cy="280" r="270"/><ellipse cx="280" cy="280" rx="270" ry="100"/><ellipse cx="280" cy="280" rx="270" ry="200"/><ellipse id="w-m1" cx="280" cy="280" rx="110" ry="270"/><ellipse id="w-m2" cx="280" cy="280" rx="210" ry="270"/><line x1="280" y1="10" x2="280" y2="550"/></g></svg>
        <i class="w-ring" style="border-color:#ff2d95"></i><i class="w-ring" style="border-color:#ff8a3c"></i><i class="w-ring" style="border-color:#ff2d95"></i>
      </div>
      <svg style="position:absolute;left:0;top:0" width="1080" height="1920"><path id="w-ax" d="M150 760 V1420 H950" fill="none" stroke="#4a3d6b" stroke-width="6" stroke-linecap="round"/><path id="w-curve" d="M150 1400 C 480 1390, 720 1250, 930 800" fill="none" stroke="url(#wg)" stroke-width="14" stroke-linecap="round"/><defs><linearGradient id="wg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ff2d95"/><stop offset="1" stop-color="#ff8a3c"/></linearGradient></defs></svg>
      <div id="w-dot" style="position:absolute;left:902px;top:772px;width:56px;height:56px;border-radius:50%;background:#ff8a3c;box-shadow:0 0 50px #ff8a3c"></div>
      <div id="w-lx" style="position:absolute;left:800px;top:1440px;font:600 34px/1 Inter;color:#8f88a6">attesa</div>
      <div id="w-ly" style="position:absolute;left:170px;top:770px;font:600 34px/1 Inter;color:#8f88a6">desiderio</div>''', '''    enter(tl, "#g11-st", "Z");
    rise(tl, "#w-l1", 0.05);
    tl.fromTo("#w-globe", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.8)" }, 0.1);
    tl.fromTo("#w-m1", { attr: { rx: 110 } }, { attr: { rx: 270 }, duration: 2.4, ease: "none" }, 0.1);
    tl.fromTo("#w-m2", { attr: { rx: 210 } }, { attr: { rx: 40 }, duration: 2.4, ease: "none" }, 0.1);
    rise(tl, "#w-l2", «giro» - 0.08);
    tl.fromTo(".w-ring", { scale: 1, opacity: 0.9 }, { scale: 1.9, opacity: 0, duration: 0.9, ease: "power2.out", stagger: 0.22 }, «giro»);
    sink(tl, "#w-l1", «piuaspetti» - 0.18); sink(tl, "#w-l2", «piuaspetti» - 0.18);
    tl.to("#w-globe", { opacity: 0, scale: 0.6, duration: 0.25, ease: "power3.in" }, «piuaspetti» - 0.22);
    rise(tl, "#w-l3", «piuaspetti»);
    draw(tl, "#w-ax", «piuaspetti» - 0.05, 0.4);
    tl.fromTo(["#w-lx", "#w-ly"], { opacity: 0 }, { opacity: 1, duration: 0.2 }, «piuaspetti» + 0.3);
    draw(tl, "#w-curve", «piuaspetti» + 0.2, 1.3);
    flip(tl, "#w-l4", «piuvuoi» - 0.06, 0.035);
    pop(tl, "#w-dot", «piuvuoi» + 0.3);
    exit(tl, "#g11-st", "U", DUR - 0.2);''', '''
    .w-ring { position: absolute; inset: 0; border-radius: 50%; border: 6px solid; opacity: 0; }''',
    fx=[('whoosh-cinematic', 'eogni', -0.06, 0.24), ('ping', 'giro', 0.0, 0.22), ('whoosh-short', 'piuaspetti', -0.2, 0.24), ('riser', 'piuaspetti', 0.2, 0.12), ('pop', 'piuvuoi', 0.3, 0.32)])

# ------------------------------------------------------------------ 3: far lavorare gli altri
title('g12', 'tre3', 'ognifoto', 3, 'far lavorare gli altri', 'lavorare', wsize=66)

add('g13', 'ognifoto', 'pubgratis', f'''      {vid('f-v', 'crowd.mp4', T['pubgratis'] - T['ognifoto'])}
      {zone(ln('f-l1', 'ogni fotogramma', 't-sans'), ln('f-l2', 'analizzato', 't-it grad', 'font-size:132px', mt=-22))}
      {zone(ln('f-l3', 'da milioni', 't-sans'), ln('f-l4', 'di fan', 't-it grad', 'font-size:150px', mt=-22))}
      <div id="f-p1" class="pill f-p" style="left:110px;top:900px;transform:rotate(-6deg)">teorie</div>
      <div id="f-p2" class="pill f-p" style="left:560px;top:1060px;transform:rotate(5deg)">video</div>
      <div id="f-p3" class="pill f-p" style="left:280px;top:1230px;transform:rotate(-3deg)">meme</div>''', '''    enter(tl, "#g13-st", "L");
    tl.fromTo("#f-v-w", { scale: 1.18 }, { scale: 1.02, duration: DUR, ease: "none" }, 0);
    rise(tl, "#f-l1", 0.05);
    rise(tl, "#f-l2", «analizzato» - 0.08);
    sink(tl, "#f-l1", «milionifan» - 0.18); sink(tl, "#f-l2", «milionifan» - 0.18);
    rise(tl, "#f-l3", «milionifan» - 0.02);
    rise(tl, "#f-l4", «milionifan» + 0.3);
    pop(tl, "#f-p1", «teorie»);
    pop(tl, "#f-p2", «video»);
    pop(tl, "#f-p3", «meme»);
    exit(tl, "#g13-st", "Z", DUR - 0.18);''', '''
    .f-p { font-size: 84px; padding: 22px 46px; box-shadow: 0 20px 70px rgba(0,0,0,0.5); }''', glow=False,
    fx=[('whoosh', 'ognifoto', -0.04, 0.3), ('key-press', 'analizzato', -0.08, 0.22), ('whoosh-short', 'milionifan', -0.18, 0.22), ('pop', 'teorie', 0.0, 0.34), ('pop', 'video', 0.0, 0.34), ('pop', 'meme', 0.0, 0.34)])

add('g14', 'pubgratis', 'eilloro', f'''      {zone(ln('z-l1', 'pubblicità', 't-sans'), ln('z-l2', 'gratis', 't-it split grad', 'font-size:170px', mt=-22))}
      <div id="z-n" style="position:absolute;left:0;right:0;top:800px;text-align:center;font:italic 800 330px/1.05 Inter;letter-spacing:-0.04em;white-space:nowrap"><span id="z-nv">900.000</span> €</div>
      {zone(ln('z-l3', 'fatta dal pubblico', 't-sans t-mut'), top=1220)}''', f'''    enter(tl, "#g14-st", "U");
    rise(tl, "#z-l1", 0.05);
    flip(tl, "#z-l2", «gratis» - 0.06, 0.04);
    tl.fromTo("#z-n", {{ opacity: 0, scale: 0.34 }}, {{ opacity: 1, scale: 0.42, duration: 0.25, ease: "expo.out" }}, 0.1);
    count(tl, "#z-nv", 900000, 0, «gratis» - 0.1, 0.6, (v) => String(Math.round(v)){DOTS});
    tl.to("#z-n", {{ scale: 1, duration: 0.4, ease: "back.out(2)" }}, «gratis» + 0.42);
    rise(tl, "#z-l3", «fatta» - 0.08);
    exit(tl, "#g14-st", "L", DUR - 0.2);''',
    fx=[('whoosh-short', 'pubgratis', -0.04, 0.3), ('typing', 'gratis', -0.1, 0.22), ('impact-bass-1', 'gratis', 0.42, 0.26), ('key-press', 'fatta', -0.08, 0.2)])

add('g15', 'eilloro', 'lezione', f'''      {zone(ln('c-l1', 'il loro capo', 't-sans t-mut'), ln('c-l2', "l'ha detto chiaro", 't-it', 'font-size:96px', mt=-22))}
      <div id="c-card" style="position:absolute;left:80px;top:700px;width:920px;border-radius:44px;background:#120b22;border:3px solid #3a2f55;padding:40px 56px 54px">
        <div class="grad" style="font:italic 900 200px/0.8 Inter;height:110px">“</div>
        <div style="font:italic 700 74px/1.2 Inter;letter-spacing:-0.02em">
          <div id="c-q1" class="split">Non spendiamo</div>
          <div><span class="hl"><i id="c-hl"></i><span id="c-q2" class="split">in marketing</span></span></div>
          <div id="c-q3" class="split">finché non siamo</div>
          <div id="c-q4" class="split">vicini all'uscita.</div>
        </div>
      </div>
      <div class="tag" id="c-tag" style="top:1330px;color:#d9d4ea">Strauss Zelnick, CEO di Take-Two Interactive</div>''', '''    enter(tl, "#g15-st", "Z");
    rise(tl, "#c-l1", 0.05);
    rise(tl, "#c-l2", «chiaro» - 0.4);
    tl.fromTo("#c-card", { opacity: 0, y: 260, rotation: 3 }, { opacity: 1, y: 0, rotation: 0, duration: 0.45, ease: "expo.out" }, «chiaro» - 0.3);
    typeIn(tl, "#c-q1", «nonspendiamo», 0.04);
    typeIn(tl, "#c-q2", «inmarketing», 0.04);
    tl.fromTo("#c-hl", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.out" }, «inmarketing» + 0.45);
    typeIn(tl, "#c-q3", «finche», 0.035);
    typeIn(tl, "#c-q4", «vicini», 0.035);
    tl.fromTo("#c-tag", { opacity: 0 }, { opacity: 1, duration: 0.25 }, «nonspendiamo» + 0.3);
    tl.to("#c-card", { scale: 1.04, duration: 3.0, ease: "none" }, «nonspendiamo»);
    exit(tl, "#g15-st", "U", DUR - 0.2);''',
    fx=[('whoosh-cinematic', 'eilloro', -0.06, 0.24), ('pop', 'chiaro', -0.3, 0.26), ('typing', 'nonspendiamo', 0.0, 0.22), ('typing', 'inmarketing', 0.0, 0.22), ('sparkle', 'inmarketing', 0.45, 0.14), ('typing', 'finche', 0.0, 0.22), ('typing', 'vicini', 0.0, 0.22)])

# ------------------------------------------------------------------ lesson + CTA
add('g16', 'lezione', 'sevuoi', f'''      {vid('l-v', 'car.mp4', T['sevuoi'] - T['lezione'], 0.2)}
      <div style="position:absolute;inset:0;background:rgba(7,4,13,0.28)"></div>
      {zone(ln('l-l1', 'la lezione è questa', 't-sans'))}
      {zone(ln('l-l2', 'non devi parlare di più<i id="l-x" style="position:absolute;left:-6px;right:-6px;top:54%;height:9px;border-radius:5px;background:#ff3b30;transform-origin:left center"></i>', 't-sans', 'position:relative;font-size:74px'))}
      <div style="position:absolute;left:0;right:0;top:640px;text-align:center">
        <div id="l-b1" class="split" style="font:italic 900 168px/1 Inter;letter-spacing:-0.03em">DEVI FARTI</div>
        <div id="l-b2" class="split grad" style="font:italic 900 150px/1.1 Inter;letter-spacing:-0.03em">ASPETTARE</div>
      </div>''', '''    enter(tl, "#g16-st", "L");
    tl.fromTo("#l-v-w", { scale: 1.2 }, { scale: 1.04, duration: DUR, ease: "none" }, 0);
    rise(tl, "#l-l1", 0.05);
    sink(tl, "#l-l1", «nondevi» - 0.18);
    rise(tl, "#l-l2", «nondevi»);
    tl.fromTo("#l-x", { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: "power2.out" }, «dipiu» + 0.15);
    flip(tl, "#l-b1", «devifarti» - 0.06, 0.03);
    flip(tl, "#l-b2", «aspettare» - 0.08, 0.035);
    tl.fromTo("#l-b2", { scale: 1.25 }, { scale: 1, duration: 0.4, ease: "back.out(2.6)", immediateRender: false }, «aspettare» + 0.2);
    exit(tl, "#g16-st", "Z", DUR - 0.18);''', glow=False,
    fx=[('whoosh', 'lezione', -0.04, 0.3), ('whoosh-short', 'nondevi', -0.18, 0.22), ('click-soft', 'dipiu', 0.15, 0.36), ('key-press', 'devifarti', -0.06, 0.26), ('impact-bass-1', 'aspettare', 0.1, 0.3), ('sparkle', 'aspettare', 0.1, 0.16)])

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
