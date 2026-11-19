# Essenza d'Oriente, teaser di Natale: "A dicembre sta arrivando qualcosa" (senza dire cosa).
# Times written as «key» are named voice moments (see times.py), converted to scene-local seconds.
import re, sys
sys.path.insert(0, '.')
from common import scene
from times import T
SC = []
INK = '#142019'; BOSCO = '#2C5138'; SALVIA = '#D6E6C0'; ORO = '#B99A45'; CUORE = '#C0392B'; PAPER = '#F4F2EC'

def ln(i, html, cls='t-sans', style='', mt=None):
    m = f' style="margin-top:{mt}px"' if mt is not None else ''
    st = f' style="{style}"' if style else ''
    return f'<span class="line"{m}><span id="{i}" class="{cls}"{st}>{html}</span></span>'

def zone(*lines, top=330):
    return f'<div class="zone" data-layout-allow-overlap style="top:{top}px">' + ''.join(lines) + '</div>'

def vid(i, src, dur, mstart=0):
    return (f'<div class="vid" id="{i}-w" data-layout-allow-overlap><video id="{i}" class="clip" src="assets/video/{src}" data-start="0" data-duration="{dur:.2f}" data-media-start="{mstart}" muted playsinline></video></div>'
            '<div class="shade"></div>')

def add(sid, k0, k1, body, js, css='', fx=(), ink=False, cam=True):
    start, end = T[k0], T[k1]
    dur = round(end - start, 3)
    f = lambda s: re.sub(r'«(\w+)»', lambda m: '%.2f' % (T[m.group(1)] - start), s)
    inner = f(body)
    if cam:
        inner = f'<div id="{sid}-cam" class="cam" data-layout-allow-overlap>\n' + inner + '\n    </div>'
        js = f'    tl.fromTo("#{sid}-cam", {{ scale: 1 }}, {{ scale: 1.05, duration: DUR, ease: "none" }}, 0);\n' + js
    b = f'    <div id="{sid}-st" class="st{" ink" if ink else ""}" data-layout-allow-overlap>\n' + inner + '\n    </div>'
    SC.append(dict(id=sid, start=start, dur=dur, body=b, js=f(js).replace('DUR', '%.2f' % dur), css=css,
                   fx=[(n, round(T[k] + o, 3), v) for n, k, o, v in fx]))

def star(i, left, top, size):
    return (f'<svg class="star" id="{i}" viewBox="0 0 24 24" width="{size}" height="{size}" style="position:absolute;left:{left}px;top:{top}px;opacity:0" data-layout-allow-overlap>'
            '<path d="M12 0 C12.8 7 17 11.2 24 12 C17 12.8 12.8 17 12 24 C11.2 17 7 12.8 0 12 C7 11.2 11.2 7 12 0 Z" fill="#B99A45"/></svg>')
BRAND = '<div class="label cream" id="{i}" style="top:232px;opacity:0.92">Essenza d\'Oriente <span style="color:#B99A45">·</span> Alessandria</div>'

# ---------------------------------------------------------------- 1. "A Natale pensi a tutti."
add('e1', 'start', 'eate', f'''      {vid('a-v', 'clip1.mp4', T['eate'], 1.0)}
      {zone(ln('a-l1', 'A Natale', 't-d cream', 'font-size:176px'), ln('a-l2', 'pensi a tutti.', 't-sans cream', 'font-size:88px', mt=-26))}
      {star('a-s1', 96, 300, 70)}{star('a-s2', 902, 268, 96)}{star('a-s3', 948, 520, 50)}''', '''    tl.fromTo("#e1-st .star", { opacity: 0, scale: 0, rotation: -90 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.34, ease: "back.out(3)", stagger: 0.08 }, 0.06);
    tl.to("#e1-st .star", { scale: 0.6, duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut", stagger: 0.11 }, 0.06 + 0.42);
    tl.fromTo("#a-v-w", { scale: 1.2 }, { scale: 1.06, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#a-l1", { scale: 1.3, transformOrigin: "50% 80%" }, { scale: 1, duration: 0.45, ease: "expo.out" }, 0);
    rise(tl, "#a-l2", «pensi» - 0.12);
    exit(tl, "#e1-st", "U", DUR - 0.18);''', cam=False,
    fx=[('impact-bass-1', 'start', 0.0, 0.2), ('whoosh-short', 'start', 0.02, 0.16), ('key-press', 'pensi', -0.12, 0.14), ('whoosh', 'eate', -0.2, 0.26)])

# ---------------------------------------------------------------- 2. "E a te?"
add('e2', 'eate', 'unora', f'''      <div style="position:absolute;left:0;right:0;top:640px;text-align:center">
        <span class="hl"><i id="b-hl" style="top:52%;bottom:2%"></i><span id="b-t" class="split" style="font:italic 500 310px/1.1 Fraunces;letter-spacing:-0.035em;display:inline-block">E a te?</span></span>
      </div>''', '''    enter(tl, "#e2-st", "U");
    flip(tl, "#b-t", 0.0, 0.018);
    tl.fromTo("#b-hl", { scaleX: 0 }, { scaleX: 1, duration: 0.26, ease: "power3.out" }, 0.14);
    exit(tl, "#e2-st", "Z", DUR - 0.16);''',
    fx=[('pop', 'eate', 0.02, 0.3), ('sparkle', 'eate', 0.2, 0.14)])

# ---------------------------------------------------------------- 3. "Un'ora di silenzio. Solo per te."
add('e3', 'unora', 'solo', f'''      {vid('c-v', 'clip2.mp4', T['solo'] - T['unora'], 2.6)}
      {zone(ln('c-l1', "un’ora", 't-d cream', 'font-size:170px'), ln('c-l2', 'di silenzio', 't-di cream', 'font-size:132px', mt=-30))}''', '''    enter(tl, "#e3-st", "Z");
    tl.fromTo("#c-v-w", { scale: 1.18 }, { scale: 1.05, duration: DUR, ease: "none" }, 0);
    rise(tl, "#c-l1", 0.03);
    rise(tl, "#c-l2", «silenzio» - 0.16);
    exit(tl, "#e3-st", "L", DUR - 0.18);''', cam=False,
    fx=[('whoosh-short', 'unora', -0.04, 0.2), ('key-press', 'unora', 0.03, 0.14), ('ping', 'silenzio', -0.1, 0.14), ('whoosh-short', 'solo', -0.2, 0.2)])

add('e4', 'solo', 'adicembre', f'''      {vid('d-v', 'clip3.mp4', T['adicembre'] - T['solo'], 0.6)}
      {zone(ln('d-l1', 'solo', 't-sans cream', 'font-size:92px'), ln('d-l2', 'per te', 't-di cream split', 'font-size:210px', mt=-34))}''', '''    enter(tl, "#e4-st", "L");
    tl.fromTo("#d-v-w", { scale: 1.16 }, { scale: 1.04, duration: DUR, ease: "none" }, 0);
    rise(tl, "#d-l1", 0.03);
    flip(tl, "#d-l2", «perte» - 0.1, 0.04);
    exit(tl, "#e4-st", "U", DUR - 0.18);''', cam=False,
    fx=[('key-press', 'solo', 0.03, 0.14), ('pop', 'perte', -0.08, 0.22), ('whoosh', 'adicembre', -0.2, 0.24)])

# ---------------------------------------------------------------- 4. "A dicembre... sta arrivando qualcosa. Non possiamo ancora dirti cosa."
def gift(i, left, top, rot):
    return (f'<div class="gift" id="g-{i}" style="left:{left}px;top:{top}px"><div class="gift-in" style="transform:rotate({rot}deg)">'
            '<b></b><u></u><s></s><em>?</em></div></div>')
add('e5', 'adicembre', 'seguici', f'''      <div id="g-orb" style="position:absolute;left:90px;top:640px;width:900px;height:900px;border-radius:50%;background:{SALVIA};opacity:0.55"></div>
      {zone(ln('g-l1', 'a dicembre', 't-d', 'font-size:168px'), ln('g-l2', "da Essenza d’Oriente", 't-sans mut', 'font-size:62px', mt=-22), top=380)}
      {zone(ln('g-l3', 'sta arrivando', 't-sans mut', 'font-size:80px'), ln('g-l4', '<span class="hl"><i id="g-hl"></i><span>qualcosa</span></span>', 't-di', 'font-size:190px', mt=-30), top=380)}
      {zone(ln('g-l5', 'non possiamo ancora', 't-sans mut', 'font-size:70px'), ln('g-l6', 'dirti cosa', 't-di', 'font-size:176px', mt=-28), top=380)}
      <div id="g-cal" style="position:absolute;left:300px;top:860px;width:480px;border-radius:44px;background:#fff;text-align:center;overflow:hidden;box-shadow:0 34px 90px -24px rgba(20,32,25,0.4)">
        <div style="background:{BOSCO};color:{PAPER};font:600 38px/1 Jost;padding:26px 0;letter-spacing:0.16em">DICEMBRE</div>
        <div id="g-day" style="font:500 250px/1.1 Fraunces;letter-spacing:-0.04em;color:{INK}">1</div>
        <div style="font:500 34px/1 Jost;color:#71796F;padding:0 0 34px;letter-spacing:0.04em">data in arrivo</div>
      </div>
      {gift(1, 60, 930, -7)}{gift(2, 390, 870, 3)}{gift(3, 720, 940, 8)}
      {star('g-s1', 70, 800, 80)}{star('g-s2', 930, 790, 60)}{star('g-s3', 500, 1330, 54)}{star('g-s4', 960, 1340, 84)}
      <div id="g-bars" style="position:absolute;left:0;right:0;top:1420px;display:flex;justify-content:center;gap:22px">
        <i class="g-bar" style="width:210px"></i><i class="g-bar" style="width:120px"></i><i class="g-bar" style="width:280px"></i>
      </div>''', '''    enter(tl, "#e5-st", "U");
    tl.fromTo("#g-orb", { scale: 0.3 }, { scale: 1, duration: 0.7, ease: "expo.out" }, 0.05);
    tl.to("#g-orb", { scale: 1.18, y: -30, duration: DUR - 0.75, ease: "none" }, 0.75);
    rise(tl, "#g-l1", 0.04);
    tl.fromTo("#g-cal", { opacity: 0, scale: 0.5, rotation: -8 }, { opacity: 1, scale: 1, rotation: -3, duration: 0.42, ease: "back.out(2)" }, 0.12);
    { const days = ["1", "8", "15", "24", "?"]; const o = { v: 0 }; const el = document.querySelector("#g-day");
      tl.to(o, { v: 4.99, duration: 0.62, ease: "none", onUpdate: () => { el.textContent = days[Math.floor(o.v)]; } }, 0.34); }
    tl.fromTo("#g-day", { scale: 1.35 }, { scale: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, 0.84);
    rise(tl, "#g-l2", «daessenza» - 0.1);
    tl.fromTo("#g-day", { rotation: 0 }, { rotation: 10, duration: 0.12, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, «daessenza» + 0.5);
    tl.to("#g-cal", { rotation: 2, scale: 1.04, duration: 1.2, ease: "none" }, «daessenza» - 0.1);
    sink(tl, "#g-l1", «staarrivando» - 0.2); sink(tl, "#g-l2", «staarrivando» - 0.2);
    tl.to("#g-cal", { y: -1500, rotation: 12, duration: 0.3, ease: "power3.in" }, «staarrivando» - 0.22);
    rise(tl, "#g-l3", «staarrivando»);
    tl.fromTo(".gift", { opacity: 0, y: 900, rotation: 14 }, { opacity: 1, y: 0, rotation: 0, duration: 0.55, ease: "back.out(1.5)", stagger: 0.11 }, «staarrivando» + 0.05);
    rise(tl, "#g-l4", «qualcosa» - 0.16);
    tl.fromTo("#g-hl", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power3.out" }, «qualcosa» + 0.12);
    tl.fromTo(".gift", { scale: 1 }, { scale: 1.1, duration: 0.14, yoyo: true, repeat: 1, stagger: 0.06, immediateRender: false }, «qualcosa» + 0.1);
    tl.fromTo("#e5-st .star", { opacity: 0, scale: 0, rotation: -90 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.34, ease: "back.out(3)", stagger: 0.08 }, «qualcosa» + 0.08);
    tl.to("#e5-st .star", { scale: 0.6, duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut", stagger: 0.11 }, «qualcosa» + 0.08 + 0.42);
    sink(tl, "#g-l3", «nonpossiamo» - 0.2); sink(tl, "#g-l4", «nonpossiamo» - 0.2);
    rise(tl, "#g-l5", «nonpossiamo»);
    tl.fromTo("#g-2 .gift-in", { rotation: 3 }, { rotation: -6, duration: 0.09, yoyo: true, repeat: 5, ease: "sine.inOut", immediateRender: false }, «nonpossiamo» + 0.1);
    tl.to("#g-2", { y: -40, scale: 1.08, duration: 0.3, ease: "back.out(2)" }, «nonpossiamo» + 0.1);
    rise(tl, "#g-l6", «dirti» - 0.1);
    tl.fromTo(".g-bar", { scaleX: 0 }, { scaleX: 1, duration: 0.2, ease: "power3.out", stagger: 0.1 }, «dirti» - 0.05);
    tl.to("#g-2", { y: 0, scale: 1, duration: 0.3, ease: "power2.out" }, «cosa»);
    exit(tl, "#e5-st", "Z", DUR - 0.16);''', f'''
    .gift {{ position: absolute; width: 300px; height: 390px; }}
    .gift-in {{ position: absolute; inset: 0; border-radius: 30px; background: #fff; overflow: hidden; box-shadow: 0 34px 80px -22px rgba(20,32,25,0.42); }}
    .gift-in b {{ position: absolute; left: 0; right: 0; top: 0; height: 150px; background: {SALVIA}; }}
    .gift-in u {{ position: absolute; left: 50%; top: 0; bottom: 0; width: 46px; margin-left: -23px; background: {ORO}; }}
    .gift-in s {{ position: absolute; left: 0; right: 0; top: 127px; height: 46px; background: {ORO}; }}
    .gift-in em {{ position: absolute; left: 50%; top: 200px; width: 150px; height: 150px; margin-left: -75px; border-radius: 50%; background: {INK}; color: {ORO}; font: 500 110px/150px "Fraunces"; font-style: normal; text-align: center; }}
    .g-bar {{ display: block; height: 30px; border-radius: 15px; background: {ORO}; transform-origin: left center; }}''',
    fx=[('pop', 'adicembre', 0.12, 0.26), ('click-soft', 'adicembre', 0.34, 0.24), ('click-soft', 'adicembre', 0.47, 0.24), ('click-soft', 'adicembre', 0.6, 0.24), ('click-soft', 'adicembre', 0.72, 0.24), ('ping', 'adicembre', 0.84, 0.16), ('key-press', 'daessenza', -0.1, 0.12), ('whoosh-short', 'staarrivando', -0.22, 0.2), ('pop', 'staarrivando', 0.1, 0.22), ('pop', 'staarrivando', 0.21, 0.22),
        ('pop', 'staarrivando', 0.32, 0.22), ('sparkle', 'qualcosa', 0.1, 0.16), ('whoosh-short', 'nonpossiamo', -0.2, 0.18), ('typing', 'nonpossiamo', 0.1, 0.14),
        ('click-soft', 'dirti', -0.05, 0.28), ('click-soft', 'dirti', 0.05, 0.28), ('click-soft', 'dirti', 0.15, 0.28), ('whoosh', 'seguici', -0.2, 0.24)])

# ---------------------------------------------------------------- 5. "Seguici. Te lo sveliamo presto."
add('e6', 'seguici', 'END', f'''      {vid('s-v', 'clip2.mp4', T['END'] - T['seguici'], 5.6)}
      <div style="position:absolute;inset:0;background:{INK};opacity:0.86"></div>
      {zone(ln('s-l1', 'Seguici.', 't-di cream split', 'font-size:220px'), ln('s-l2', 'te lo sveliamo presto', 't-sans', 'font-size:70px;color:#D6E6C0', mt=-20), top=360)}
      <div id="s-ig" class="pill" style="left:0;right:0;top:850px;width:fit-content;margin:0 auto;background:{SALVIA};color:{INK};font-size:44px;letter-spacing:0.02em;text-transform:none;padding:22px 44px">@essenza.oriente</div>
      <div id="s-lock" style="position:absolute;left:0;right:0;top:1070px;text-align:center">
        <div style="font:500 96px/1.05 Fraunces;letter-spacing:-0.025em;color:{PAPER}">Essenza d’Oriente</div>
        <div style="font:400 54px/1.3 'EO Han';letter-spacing:0.14em;margin-top:18px;color:{PAPER}">东方之<span style="color:{CUORE}">心</span>养生馆</div>
        <div id="s-rule" style="width:420px;height:3px;background:{ORO};margin:34px auto 30px;transform-origin:center"></div>
        <div style="font:500 40px/1.3 Jost;color:{PAPER}">Via San Lorenzo 46 · Alessandria</div>
        <div style="font:500 38px/1.3 Jost;color:#B9C4B0;margin-top:10px">5,0 <span style="color:{ORO}">★</span> · 146 recensioni Google</div>
      </div>''', '''    enter(tl, "#e6-st", "Z");
    tl.fromTo("#s-v-w", { scale: 1.2 }, { scale: 1.04, duration: DUR, ease: "none" }, 0);
    flip(tl, "#s-l1", 0.03, 0.035);
    pop(tl, "#s-ig", «seguici» + 0.5);
    rise(tl, "#s-l2", «telosveliamo» - 0.06);
    tl.fromTo("#s-lock", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, «presto» + 0.1);
    tl.fromTo("#s-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power3.out" }, «presto» + 0.3);
    tl.fromTo("#s-ig", { scale: 1 }, { scale: 1.08, duration: 0.16, yoyo: true, repeat: 1, immediateRender: false }, «presto» + 0.9);''', ink=True,
    fx=[('impact-bass-1', 'seguici', 0.02, 0.2), ('pop', 'seguici', 0.5, 0.26), ('key-press', 'telosveliamo', -0.06, 0.14), ('sparkle', 'presto', 0.3, 0.16), ('ping', 'presto', 0.9, 0.14)])
