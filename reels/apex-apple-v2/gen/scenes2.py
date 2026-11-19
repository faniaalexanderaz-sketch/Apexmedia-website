# scenes 8..24 of apex-apple-v2 (19.47 s -> end). Times written as «abs» are absolute voice times,
# converted to scene-local seconds when the scene is registered.
import re, sys
sys.path.insert(0, '.')
from common import scene, CURSOR, SEL
OUT = '/home/user/Apexmedia-website/reels/apex-apple-v2/compositions/'
SC = []
SHIFT_FROM, DELTA = 35.0, 0.81   # the trick-2 passage was re-recorded 0.81 s longer: later scenes move as a block
SHIFT2_FROM, DELTA2 = 52.5, 5.608   # trick 3 was rewritten (5.61 s longer): everything after it moves again
BURG = '#7a0f24'; GREEN = '#30d158'; GOLD = '#c9a227'

def ln(i, html, cls='t-sans', style='', mt=None):
    m = f' style="margin-top:{mt}px"' if mt is not None else ''
    st = f' style="{style}"' if style else ''
    return f'<span class="line"{m}><span id="{i}" class="{cls}"{st}>{html}</span></span>'

def zone(*lines, top=372):
    return f'<div class="zone" data-layout-allow-overlap style="top:{top}px">' + ''.join(lines) + '</div>'

def add(sid, start, end, body, js, css='', fx=(), dark=False, fixed=False):
    f = lambda s: re.sub(r'«([\d.]+)»', lambda m: '%.2f' % (float(m.group(1)) - start), s)
    dur = round(end - start, 3)
    body = (f'    <div id="{sid}-st" class="st{" dark" if dark else ""}" data-layout-allow-overlap><div id="{sid}-cam" class="cam" data-layout-allow-overlap>\n'
            + f(body) + '\n    </div></div>')
    js = f'    tl.fromTo("#{sid}-cam", {{ scale: 1 }}, {{ scale: 1.045, duration: DUR, ease: "none" }}, 0);\n' + js
    sh = 0 if (fixed or start < SHIFT_FROM) else (DELTA if start < SHIFT2_FROM else DELTA + DELTA2)
    SC.append(dict(id=sid, start=round(start + sh, 3), dur=dur, body=body, js=f(js).replace('DUR', '%.2f' % dur), css=css,
                   fx=[(n, round(t + sh, 3), v) for n, t, v in fx]))

def seg(sid, n):
    return f'<div class="seg" id="{sid}-seg">' + ''.join(
        '<i>' + (f'<b id="{sid}-sg"></b>' if k == n else ('<b></b>' if k < n else '')) + '</i>' for k in range(1, 6)) + '</div>'

def title(sid, start, end, n, word, wabs, color, dark=False, wsize=112, fixed=False):
    numc = '#f5f5f7' if dark else '#1d1d1f'
    body = f'''      {seg(sid, n)}
      <div class="bignum" id="{sid}-num"><div id="{sid}-col" style="color:{numc}"><div>{n - 1}</div><div>{n}</div></div></div>
      {zone(ln(sid + '-w', word, 't-it split', f'font-size:{wsize}px;color:{color}'), top=1080)}'''
    js = f'''    enter(tl, "#{sid}-st", "U");
    tl.fromTo("#{sid}-col", {{ y: 0 }}, {{ y: -470, duration: 0.45, ease: "expo.out" }}, 0.1);
    tl.fromTo("#{sid}-num", {{ scale: 0.8 }}, {{ scale: 1, duration: 0.5, ease: "back.out(2.2)" }}, 0.1);
    tl.to("#{sid}-num", {{ scale: 1.1, duration: DUR - 0.8, ease: "none" }}, 0.6);
    tl.fromTo("#{sid}-sg", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.4, ease: "power2.out" }}, 0.2);
    flip(tl, "#{sid}-w", «{wabs}» - 0.04, 0.03);
    exit(tl, "#{sid}-st", "Z", DUR - 0.18);'''
    add(sid, start, end, body, js, dark=dark, fixed=fixed,
        fx=[('whoosh-short', start - 0.02, 0.3), ('pop', start + 0.12, 0.3), ('key-press', wabs - 0.04, 0.25)])

CLOUD = '<svg viewBox="0 0 24 24" width="92" height="92"><path d="M18.6 18H7.2a4.7 4.7 0 0 1-.7-9.35A6.2 6.2 0 0 1 18.4 9.6 4.25 4.25 0 0 1 18.6 18z" fill="#2f9bff"/></svg>'
NOTE = '<svg viewBox="0 0 24 24" width="88" height="88"><path d="M9.2 18.3a2.6 2.6 0 1 1-1.6-2.4V6.1l10.2-2.2v10.6a2.6 2.6 0 1 1-1.6-2.4V7.1L9.2 8.6z" fill="#fff"/></svg>'
LOCK = '<svg viewBox="0 0 24 24" width="74" height="74"><rect x="5" y="10.5" width="14" height="10" rx="2.6" fill="#fff"/><path d="M8.2 10.5V7.6a3.8 3.8 0 0 1 7.6 0v2.9" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>'
BELL = '<svg viewBox="0 0 24 24" width="84" height="84"><path d="M12 3.2a5 5 0 0 0-5 5v3.4l-1.9 3.2v1h13.8v-1L17 11.6V8.2a5 5 0 0 0-5-5zm-2 14.6a2 2 0 0 0 4 0z" fill="#fff"/><path d="M4 3.5l16.5 17" stroke="#ff453a" stroke-width="2.4" stroke-linecap="round"/></svg>'
ICO_CSS = '''
    .ico { width: 140px; height: 140px; border-radius: 34px; display: flex; align-items: center; justify-content: center; }
    .ico-c { background: #fff; box-shadow: 0 0 0 3px #e5e5ea inset; }
    .ico-m { background: linear-gradient(180deg, #fb5c74, #fa233b); }
    .ico-t { background: #000; color: #fff; font: 600 64px/1 "Inter Display"; letter-spacing: -0.04em; }'''
ALERT_CSS = '''
    .al { position: absolute; width: 700px; border-radius: 36px; background: #fff; box-shadow: 0 30px 90px rgba(0,0,0,0.24); text-align: center; overflow: hidden; color: #1d1d1f; }
    .al-t { padding: 46px 40px 38px; }
    .al-t b { display: block; font: 600 46px/1.15 "Inter Display"; }
    .al-t span { display: block; font: 400 33px/1.25 "Inter Display"; color: #3c3c43; margin-top: 12px; }
    .al-b { display: flex; border-top: 2px solid #e5e5ea; font: 400 42px/1 "Inter Display"; color: #007aff; }
    .al-b span { flex: 1; padding: 30px 0; }
    .al-b span + span { border-left: 2px solid #e5e5ea; font-weight: 600; }'''

# ---------------------------------------------------------------- trick 2: la memoria
title('s8', 19.47, 21.09, 2, 'la memoria', 19.91, BURG)

add('s9', 21.09, 27.20, f'''      {zone(ln('m-a1', 'il modello base', 't-sans t-mut'), ln('m-a2', 'ha poco spazio', 't-it', mt=-24))}
      {zone(ln('m-b1', 'dopo un anno di foto', 't-sans t-mut'), ln('m-b2', 'è pieno', 't-it', 'font-size:118px;color:#ff3b30', mt=-24))}
      {zone(ln('m-c1', 'e quello', 't-sans t-mut'), ln('m-c2', 'più grande', 't-it', mt=-24))}
      <div id="m-card" style="position:absolute;left:90px;top:720px;width:900px;border-radius:44px;background:#f2f2f7;padding:50px 54px 46px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;font:600 58px/1 Inter;letter-spacing:-0.02em"><span>iPhone</span><span>128 GB</span></div>
        <div style="font:400 34px/1 Inter;color:#86868b;margin-top:16px"><span id="m-used">62</span> GB su 128 GB utilizzati</div>
        <div style="position:relative;margin-top:36px;height:48px;border-radius:13px;overflow:hidden;background:#e5e5ea">
          <div style="position:absolute;inset:0;display:flex"><i style="width:17%;background:#ff3b30"></i><i style="width:9%;background:#34c759"></i><i style="width:13%;background:#8e8e93"></i><i style="flex:1;background:#ffcc00"></i></div>
          <div id="m-cov" style="position:absolute;inset:0;background:#e5e5ea;transform-origin:right center"></div>
        </div>
        <div style="display:flex;gap:34px;margin-top:26px;font:500 30px/1 Inter;color:#3c3c43">
          <span><i class="m-dot" style="background:#ff3b30"></i>App</span><span><i class="m-dot" style="background:#34c759"></i>Messaggi</span><span><i class="m-dot" style="background:#8e8e93"></i>iOS</span><span><i class="m-dot" style="background:#ffcc00"></i>Foto</span>
        </div>
      </div>
      <div id="m-sel" class="sel" style="left:706px;top:754px;width:246px;height:88px">{SEL}</div>
      <div id="m-pill" class="pill" style="left:742px;top:660px">apposta</div>
      <div id="m-alert" class="al" style="left:190px;top:1150px"><div class="al-t"><b>Spazio quasi esaurito</b><span>Puoi gestire lo spazio in Impostazioni.</span></div><div class="al-b"><span>Chiudi</span><span>Impostazioni</span></div></div>
      <div id="m-pick" style="position:absolute;left:140px;top:700px;width:800px">
        <div class="m-opt" id="m-o1" style="border-color:#0071e3"><span>128 GB</span><small>quello di adesso</small></div>
        <div class="m-opt" id="m-o2"><span>256 GB</span></div>
        <div class="m-opt" id="m-o3"><span>512 GB</span></div>
      </div>
      <div id="m-cur" class="cur" style="left:790px;top:965px">{CURSOR}</div>''', '''    enter(tl, "#s9-st", "L");
    rise(tl, "#m-a1", 0.06);
    rise(tl, "#m-a2", «22.07» - 0.1);
    tl.fromTo("#m-card", { y: 200, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "expo.out" }, 0.15);
    tl.fromTo("#m-cov", { scaleX: 0.52 }, { scaleX: 0.2, duration: 1.0, ease: "power2.out" }, 0.4);
    count(tl, "#m-used", 62, 102, 0.4, 1.0);
    select(tl, "#m-sel", null, «23.045» - 0.05);
    pop(tl, "#m-pill", «23.045»);
    sink(tl, "#m-a1", «23.90» - 0.2); sink(tl, "#m-a2", «23.90» - 0.2);
    tl.to(["#m-pill", "#m-sel"], { opacity: 0, duration: 0.15 }, «23.90» - 0.15);
    rise(tl, "#m-b1", «23.90»);
    tl.to("#m-cov", { scaleX: 0, duration: 0.9, ease: "power1.in" }, «23.90» + 0.1);
    count(tl, "#m-used", 102, 128, «23.90» + 0.1, 0.9);
    rise(tl, "#m-b2", «25.43» - 0.08);
    tl.fromTo("#m-card", { scale: 1 }, { scale: 1.04, duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }, «25.43»);
    tl.fromTo("#m-alert", { opacity: 0, scale: 1.18 }, { opacity: 1, scale: 1, duration: 0.28, ease: "back.out(2)" }, «25.43»);
    tl.to(["#m-card", "#m-alert"], { y: 1500, duration: 0.3, ease: "power3.in" }, «25.98» - 0.14);
    sink(tl, "#m-b1", «25.98» - 0.15); sink(tl, "#m-b2", «25.98» - 0.15);
    rise(tl, "#m-c1", «25.98» + 0.05);
    tl.fromTo(".m-opt", { y: 300, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "expo.out", stagger: 0.08 }, «25.98» + 0.1);
    rise(tl, "#m-c2", «26.42» - 0.08);
    tl.fromTo("#m-cur", { opacity: 0, x: 220, y: 300 }, { opacity: 1, x: 0, y: 0, duration: 0.4, ease: "power3.out" }, «26.42» - 0.15);
    tl.to("#m-cur", { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1 }, «26.78» - 0.1);
    tl.to("#m-o1", { borderColor: "#d2d2d7", duration: 0.12 }, «26.78» - 0.04);
    tl.to("#m-o2", { borderColor: "#0071e3", duration: 0.12 }, «26.78» - 0.04);
    tl.fromTo("#m-o2", { scale: 1 }, { scale: 1.05, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, «26.78» - 0.02);
    exit(tl, "#s9-st", "U", DUR - 0.2);''', ALERT_CSS + '''
    .m-dot { display: inline-block; width: 18px; height: 18px; border-radius: 50%; margin-right: 10px; }
    .m-opt { border: 5px solid #d2d2d7; border-radius: 30px; padding: 46px 52px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; font: 600 62px/1 "Inter Display"; letter-spacing: -0.02em; background: #fff; }
    .m-opt small { font: 400 34px/1 "Inter Display"; color: #86868b; }''',
    fx=[('whoosh', 21.07, 0.3), ('typing', 21.5, 0.14), ('pop', 23.045, 0.3), ('whoosh-short', 23.75, 0.22), ('ping', 25.43, 0.2),
        ('whoosh', 25.84, 0.28), ('click-soft', 26.70, 0.4), ('pop', 26.74, 0.25)])

add('s10', 27.20, 29.13, f'''      <div id="k-n" style="position:absolute;left:0;right:0;top:640px;display:flex;justify-content:center;align-items:center;font:700 290px/300px Inter;letter-spacing:-0.045em;color:{BURG}"><span>+</span><span style="display:inline-block;height:300px;overflow:hidden"><span id="k-col" style="display:block"><span style="display:block">100</span><span style="display:block">200</span></span></span><span style="margin-left:0.12em">€</span></div>
      {zone(ln('k-c', 'costa', 't-sans t-mut'))}
      {zone(ln('k-l', 'in più', 't-it', 'font-size:118px'), top=1000)}''', '''    enter(tl, "#k-st", "U");
    rise(tl, "#k-c", 0.03);
    tl.fromTo("#k-n", { scale: 1.35 }, { scale: 1, duration: 0.35, ease: "expo.out" }, 0.04);
    tl.fromTo("#k-col", { y: 0 }, { y: -300, duration: 0.3, ease: "expo.out" }, «27.82» - 0.06);
    punch(tl, "#k-n", «27.82» - 0.04, 1.2);
    rise(tl, "#k-l", «28.67» - 0.1);
    tl.to("#k-n", { scale: 1.07, duration: 0.5, ease: "none" }, «28.67»);
    exit(tl, "#k-st", "L", DUR - 0.2);'''.replace('k-st', 's10-st'),
    fx=[('whoosh-short', 27.18, 0.3), ('pop', 27.26, 0.32), ('pop', 27.8, 0.36), ('key-press', 28.6, 0.22)])

MESI = ''.join(f'<i class="cl-m">{m}</i>' for m in ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'])
CLB = ''.join(f'<line id="cl-b-{k}" class="cl-bar" x1="{290 + k * 100}" y1="690" x2="{290 + k * 100}" y2="1100"/>' for k in range(6))
CLY = ''.join(f'<span style="display:block">{y}</span>' for y in (2026, 2027, 2028, 2029, 2030))
add('s11', 29.13, 36.17, f'''      {zone(ln('cl-a1', 'non lo compri?', 't-it', 'font-size:108px'))}
      {zone(ln('cl-b1', 'allora paghi', 't-sans t-mut'))}
      {zone(ln('cl-c1', 'pochi euro al mese', 't-it'))}
      {zone(ln('cl-d1', 'ogni mese', 't-it', 'font-size:120px'))}
      {zone(ln('cl-e1', 'per sempre', 't-it acc', 'font-size:128px'))}
      {zone(ln('cl-f1', 'ed è solo', 't-sans t-mut'), ln('cl-f2', 'la prima gabbia', 't-it split gold', 'font-size:108px', mt=-24))}
      <div id="cl-opt" style="position:absolute;left:140px;top:820px;width:800px;border:5px solid #d2d2d7;border-radius:30px;padding:46px 52px;display:flex;justify-content:space-between;align-items:center;font:600 62px/1 Inter;letter-spacing:-0.02em;background:#fff"><span>256 GB</span><span style="color:{BURG}">+200 €</span><i id="cl-x" style="position:absolute;left:30px;right:30px;top:50%;height:9px;margin-top:-4px;border-radius:5px;background:#ff3b30;transform-origin:left center"></i></div>
      <img id="cl-logo" class="mul" src="assets/img/logo-icloud.png" style="position:absolute;left:230px;top:770px;width:620px;display:block" alt="" />
      <div id="cl-row" style="position:absolute;left:110px;top:1130px;width:860px;border-radius:34px;background:#f2f2f7;padding:34px 44px;display:flex;justify-content:space-between;align-items:center">
        <div><div style="font:600 50px/1 Inter;letter-spacing:-0.02em">iCloud+</div><div style="font:400 32px/1 Inter;color:#86868b;margin-top:12px">Si rinnova ogni mese</div></div>
        <div style="height:60px;overflow:hidden;font:600 52px/60px Inter;color:#86868b"><span id="cl-ys" style="display:block">{CLY}</span></div>
      </div>
      <div id="cl-grid" style="position:absolute;left:110px;top:1300px;width:860px;display:grid;grid-template-columns:repeat(4,1fr);gap:20px">{MESI}</div>
      <svg style="position:absolute;left:0;top:0" width="1080" height="1920"><rect id="cl-cage" x="190" y="690" width="700" height="410" rx="64" fill="none" stroke="{GOLD}" stroke-width="11"/>{CLB}</svg>
      <div id="cl-lock" style="position:absolute;left:470px;top:1030px;width:140px;height:140px;border-radius:50%;background:{GOLD};display:flex;align-items:center;justify-content:center">{LOCK}</div>''', '''    enter(tl, "#s11-st", "L");
    rise(tl, "#cl-a1", 0.03);
    tl.fromTo("#cl-opt", { y: 220, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "expo.out" }, 0.05);
    tl.fromTo("#cl-x", { scaleX: 0 }, { scaleX: 1, duration: 0.2, ease: "power2.out" }, 0.42);
    tl.to("#cl-opt", { y: 1300, rotation: 9, duration: 0.3, ease: "power3.in" }, «30.02» - 0.2);
    sink(tl, "#cl-a1", «30.02» - 0.18);
    rise(tl, "#cl-b1", «30.02»);
    tl.fromTo("#cl-logo", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, «30.48»);
    tl.fromTo("#cl-logo", { scale: 1.14 }, { scale: 1, duration: 0.34, ease: "back.out(3)", immediateRender: false }, «30.92»);
    sink(tl, "#cl-b1", «31.45» - 0.16);
    rise(tl, "#cl-c1", «31.45»);
    tl.fromTo("#cl-row", { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "expo.out" }, «31.45» + 0.05);
    sink(tl, "#cl-c1", «32.67» - 0.16);
    rise(tl, "#cl-d1", «32.67»);
    tl.fromTo(".cl-m", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(2.4)", stagger: 0.035 }, «32.67» - 0.25);
    tl.to(".cl-m", { backgroundColor: "#7a0f24", color: "#ffffff", duration: 0.08, stagger: 0.05 }, «32.67» + 0.12);
    sink(tl, "#cl-d1", «33.69» - 0.16);
    rise(tl, "#cl-e1", «33.69»);
    for (let k = 1; k <= 4; k++) { tl.to("#cl-ys", { y: -60 * k, duration: 0.14, ease: "power3.inOut" }, «33.69» + (k - 1) * 0.17); tl.fromTo("#cl-grid", { scale: 1.05 }, { scale: 1, duration: 0.15, ease: "power2.out", immediateRender: false }, «33.69» + (k - 1) * 0.17); }
    sink(tl, "#cl-e1", «34.61» - 0.16);
    rise(tl, "#cl-f1", «34.61»);
    tl.to(["#cl-row", "#cl-grid"], { y: 900, opacity: 0, duration: 0.35, ease: "power3.in" }, «34.61» - 0.1);
    tl.to("#cl-logo", { scale: 0.86, duration: 0.5, ease: "expo.out" }, «34.61»);
    draw(tl, "#cl-cage", «34.61» + 0.05, 0.7);
    flip(tl, "#cl-f2", «35.26» - 0.1, 0.03);
    for (let k = 0; k < 6; k++) draw(tl, "#cl-b-" + k, «35.26» + k * 0.05, 0.28);
    pop(tl, "#cl-lock", «35.44» + 0.14);
    exit(tl, "#s11-st", "Z", DUR - 0.18);''', f'''
    .cl-m {{ display: block; height: 78px; border-radius: 39px; background: #f2f2f7; color: #3c3c43; font: 600 36px/78px "Inter Display"; font-style: normal; text-align: center; }}
    .cl-bar {{ stroke: {GOLD}; stroke-width: 9; stroke-linecap: round; }}''',
    fx=[('whoosh', 29.11, 0.3), ('click-soft', 29.55, 0.36), ('whoosh-short', 29.84, 0.24), ('pop', 30.48, 0.32), ('ping', 30.92, 0.18), ('whoosh-short', 31.3, 0.2), ('pop', 31.52, 0.24),
        ('typing', 32.5, 0.22), ('typing', 33.1, 0.2), ('key-press', 33.69, 0.24), ('key-press', 33.86, 0.24), ('key-press', 34.03, 0.24), ('key-press', 34.2, 0.24),
        ('whoosh-cinematic', 34.5, 0.22), ('sparkle', 35.2, 0.18), ('click', 35.6, 0.42), ('impact-bass-1', 35.58, 0.22)])

# ---------------------------------------------------------------- trick 3: il pezzo mancante (times already final: fixed=True)
title('s12', 36.17, 38.14, 3, 'il pezzo mancante', 36.69, BURG, wsize=96, fixed=True)

def cal(i, month, day, style):
    return (f'<div id="{i}" style="position:absolute;width:400px;border-radius:40px;background:#fff;text-align:center;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,0.2);{style}">'
            f'<div style="background:#ff3b30;color:#fff;font:700 36px/1 Inter;padding:22px 0;letter-spacing:0.08em">{month}</div>'
            f'<div style="font:700 210px/1.1 Inter;letter-spacing:-0.04em">{day}</div><div style="font:600 32px/1 Inter;color:#86868b;padding:0 0 30px">stesso evento</div></div>')
X = '<svg viewBox="0 0 100 100" width="{w}" height="{w}"><path d="M22 22 L78 78 M78 22 L22 78" stroke="#ff3b30" stroke-width="14" stroke-linecap="round"/></svg>'

add('s13', 38.14, 41.45, f'''      {zone(ln('j-l0', '2016', 't-it', 'font-size:170px'))}
      {zone(ln('j-l1', 'Apple toglie', 't-sans t-mut'), ln('j-l2', "l'ingresso delle cuffie", 't-it', 'font-size:76px', mt=-20))}
      <div id="j-ph" style="position:absolute;left:120px;top:800px;width:840px;height:420px;border:12px solid #1d1d1f;border-top:none;border-radius:0 0 150px 150px;background:linear-gradient(180deg,#fff,#f2f2f7)">
        <div style="position:absolute;left:50%;bottom:54px;width:150px;height:36px;margin-left:-75px;border-radius:18px;background:#1d1d1f"></div>
        <div class="j-dots" style="right:150px"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="j-dots" style="left:290px"><i></i><i></i><i></i></div>
        <div id="j-jack" style="position:absolute;left:120px;bottom:38px;width:68px;height:68px;border-radius:50%;background:#1d1d1f;box-shadow:inset 0 0 0 10px #48484a"></div>
        <div id="j-x" style="position:absolute;left:84px;bottom:2px;width:140px;height:140px">{X.format(w=140)}</div>
      </div>
      <div id="j-sel" class="sel" style="left:200px;top:1060px;width:160px;height:160px">{SEL}</div>
      <div id="j-pill" class="pill" style="left:150px;top:960px;background:#1d1d1f">ingresso cuffie</div>''', '''    enter(tl, "#s13-st", "L");
    rise(tl, "#j-l0", 0.04);
    tl.fromTo("#j-ph", { y: -500, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out" }, 0.1);
    sink(tl, "#j-l0", «39.35» - 0.16);
    rise(tl, "#j-l1", «39.35»);
    rise(tl, "#j-l2", «40.01» - 0.1);
    select(tl, "#j-sel", null, «40.01»);
    pop(tl, "#j-pill", «40.01» + 0.1);
    tl.fromTo("#j-x", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.18, ease: "power3.in" }, «40.89»);
    tl.to("#j-jack", { scale: 0, duration: 0.25, ease: "power3.in" }, «40.89» + 0.12);
    tl.fromTo("#j-ph", { x: 0 }, { x: 12, duration: 0.05, yoyo: true, repeat: 5, immediateRender: false }, «40.89» + 0.16);
    exit(tl, "#s13-st", "U", DUR - 0.2);''', '''
    .j-dots { position: absolute; bottom: 60px; display: flex; gap: 18px; }
    .j-dots i { display: block; width: 22px; height: 22px; border-radius: 50%; background: #1d1d1f; }''', fixed=True,
    fx=[('whoosh', 38.12, 0.3), ('impact-bass-1', 38.2, 0.18), ('whoosh-short', 39.2, 0.2), ('click-soft', 40.01, 0.36), ('pop', 40.11, 0.26), ('impact-bass-1', 41.0, 0.26), ('click', 40.9, 0.4)])

add('s14', 41.45, 44.64, f'''      {zone(ln('y-l1', 'lo stesso giorno', 't-it', 'font-size:104px'), ln('y-l2', 'presenta le sue cuffie senza fili', 't-sans t-mut', 'font-size:58px', mt=-16))}
      {cal('y-cal', 'SETTEMBRE 2016', '7', 'left:70px;top:800px')}
      <img id="y-air" class="mul" src="assets/img/airpods.png" style="position:absolute;left:500px;top:740px;width:540px;display:block" alt="" />
      <div id="y-pill" class="pill" style="left:650px;top:1250px;font-size:62px;padding:18px 36px">AirPods</div>
      <div id="y-tag" class="pill" style="left:560px;top:720px;background:#1d1d1f;transform:rotate(-5deg)">vendute a parte</div>''', '''    enter(tl, "#s14-st", "U");
    rise(tl, "#y-l1", 0.04);
    tl.fromTo("#y-cal", { opacity: 0, scale: 0.5, rotation: -8 }, { opacity: 1, scale: 1, rotation: -3, duration: 0.4, ease: "back.out(2)" }, 0.1);
    rise(tl, "#y-l2", «42.31» - 0.1);
    tl.fromTo("#y-air", { opacity: 0, scale: 0.3, x: 300 }, { opacity: 1, scale: 1, x: 0, duration: 0.45, ease: "back.out(1.8)" }, «42.31»);
    pop(tl, "#y-pill", «43.13»);
    tl.fromTo("#y-air", { scale: 1.12 }, { scale: 1, duration: 0.34, ease: "back.out(3)", immediateRender: false }, «43.13»);
    pop(tl, "#y-tag", «43.49» + 0.1);
    exit(tl, "#s14-st", "L", DUR - 0.2);''', fixed=True,
    fx=[('whoosh-short', 41.43, 0.3), ('pop', 41.55, 0.28), ('whoosh', 42.25, 0.26), ('pop', 42.4, 0.3), ('sparkle', 43.1, 0.16), ('pop', 43.6, 0.28)])

add('s15', 44.64, 47.73, f'''      {zone(ln('b-l0', '2020', 't-it', 'font-size:170px'))}
      {zone(ln('b-l1', 'toglie il caricatore', 't-it', 'font-size:86px'), ln('b-l2', 'dalla scatola', 't-sans t-mut', mt=-20))}
      <div id="b-box" style="position:absolute;left:130px;top:790px;width:820px;height:560px;border-radius:44px;background:#f5f5f7;border:8px solid #1d1d1f">
        <div style="position:absolute;left:60px;top:70px;width:230px;height:420px;border-radius:38px;background:#1d1d1f"><i style="position:absolute;left:24px;top:24px;width:74px;height:74px;border-radius:22px;background:#3a3a3c"></i></div>
        <div style="position:absolute;left:340px;top:190px;width:180px;height:180px;border-radius:50%;border:16px solid #d1d1d6"></div>
        <div id="b-slot" style="position:absolute;left:570px;top:170px;width:190px;height:220px;border-radius:30px;border:5px dashed #c7c7cc"></div>
        <div id="b-brick" style="position:absolute;left:580px;top:180px;width:170px;height:200px;border-radius:28px;background:#fff;box-shadow:0 10px 40px rgba(0,0,0,0.18), inset 0 0 0 3px #e5e5ea"><i style="position:absolute;left:42px;top:-30px;width:18px;height:36px;border-radius:5px;background:#aeaeb2"></i><i style="position:absolute;right:42px;top:-30px;width:18px;height:36px;border-radius:5px;background:#aeaeb2"></i></div>
      </div>
      <div id="b-sel" class="sel" style="left:690px;top:940px;width:210px;height:250px">{SEL}</div>
      <div id="b-x" style="position:absolute;left:720px;top:980px;width:150px;height:150px">{X.format(w=150)}</div>
      <div id="b-pill" class="pill" style="left:650px;top:860px;background:#1d1d1f">caricatore</div>''', '''    enter(tl, "#s15-st", "L");
    rise(tl, "#b-l0", 0.04);
    tl.fromTo("#b-box", { y: 500, opacity: 0, rotation: 4 }, { y: 0, opacity: 1, rotation: 0, duration: 0.5, ease: "expo.out" }, 0.1);
    sink(tl, "#b-l0", «45.80» - 0.16);
    rise(tl, "#b-l1", «45.80»);
    select(tl, "#b-sel", null, «46.21»);
    pop(tl, "#b-pill", «46.21» + 0.08);
    rise(tl, "#b-l2", «47.16» - 0.3);
    tl.to(["#b-sel", "#b-pill"], { opacity: 0, duration: 0.12 }, «47.16» - 0.1);
    tl.to("#b-brick", { x: 520, y: -260, rotation: 40, opacity: 0, duration: 0.42, ease: "power3.in" }, «47.16» - 0.08);
    tl.fromTo("#b-x", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.18, ease: "power3.in" }, «47.16» + 0.2);
    exit(tl, "#s15-st", "U", DUR - 0.2);''', fixed=True,
    fx=[('whoosh', 44.62, 0.3), ('impact-bass-1', 44.7, 0.18), ('whoosh-short', 45.66, 0.2), ('click-soft', 46.21, 0.36), ('pop', 46.3, 0.26), ('whoosh', 47.06, 0.3), ('click', 47.38, 0.4)])

add('s15b', 47.73, 50.70, f'''      {zone(ln('z3-l1', 'lo stesso giorno', 't-it', 'font-size:104px'), ln('z3-l2', 'lancia un caricatore magnetico', 't-sans t-mut', 'font-size:60px', mt=-16))}
      {cal('z3-cal', 'OTTOBRE 2020', '13', 'left:70px;top:800px')}
      <img id="z3-mag" class="mul" src="assets/img/magsafe.png" style="position:absolute;left:480px;top:740px;width:580px;display:block" alt="" />
      <div id="z3-pill" class="pill" style="left:650px;top:1290px;font-size:62px;padding:18px 36px">MagSafe</div>''', '''    enter(tl, "#s15b-st", "U");
    rise(tl, "#z3-l1", 0.04);
    tl.fromTo("#z3-cal", { opacity: 0, scale: 0.5, rotation: 8 }, { opacity: 1, scale: 1, rotation: 3, duration: 0.4, ease: "back.out(2)" }, 0.1);
    rise(tl, "#z3-l2", «48.75» - 0.1);
    tl.fromTo("#z3-mag", { opacity: 0, scale: 0.3, x: 300, rotation: 30 }, { opacity: 1, scale: 1, x: 0, rotation: 0, duration: 0.5, ease: "back.out(1.6)" }, «48.75»);
    pop(tl, "#z3-pill", «50.00» - 0.1);
    tl.fromTo("#z3-mag", { scale: 1.12 }, { scale: 1, duration: 0.34, ease: "back.out(3)", immediateRender: false }, «50.00» - 0.1);
    exit(tl, "#s15b-st", "L", DUR - 0.2);''', fixed=True,
    fx=[('whoosh-short', 47.71, 0.3), ('pop', 47.83, 0.28), ('whoosh', 48.7, 0.26), ('pop', 48.86, 0.3), ('sparkle', 49.9, 0.16)])

add('s15c', 50.70, 55.67, f'''      {zone(ln('p3-l1', 'venduto a parte', 't-it acc', 'font-size:112px'))}
      {zone(ln('p3-l2', 'per usarlo ti serve', 't-sans t-mut'), ln('p3-l3', 'un altro pezzo', 't-it', 'font-size:108px', mt=-22))}
      {zone(ln('p3-l4', 'venduto a parte', 't-it acc', 'font-size:100px'), ln('p3-l5', 'anche quello', 't-sans', mt=-20))}
      <img id="p3-mag" class="mul" src="assets/img/magsafe.png" style="position:absolute;left:40px;top:760px;width:520px;display:block" alt="" />
      <div id="p3-t1" class="pill" style="left:150px;top:1260px;font-size:70px;padding:18px 40px">+39 $</div>
      <svg style="position:absolute;left:0;top:0" width="1080" height="1920"><path id="p3-ln" d="M520 1030 C 600 1030, 620 1000, 700 1000" fill="none" stroke="#c7c7cc" stroke-width="6" stroke-linecap="round" stroke-dasharray="4 16"/></svg>
      <div id="p3-ad" style="position:absolute;left:690px;top:860px;width:260px;height:290px;border-radius:44px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,0.18), inset 0 0 0 3px #e5e5ea"><i style="position:absolute;left:66px;top:-44px;width:26px;height:54px;border-radius:7px;background:#aeaeb2"></i><i style="position:absolute;right:66px;top:-44px;width:26px;height:54px;border-radius:7px;background:#aeaeb2"></i><i style="position:absolute;left:90px;bottom:26px;width:80px;height:26px;border-radius:13px;background:#d1d1d6"></i></div>
      <div id="p3-t2" class="pill" style="left:700px;top:1260px;font-size:70px;padding:18px 40px">+19 $</div>
      <div class="tag" id="p3-tag" style="top:1420px">Prezzi di lancio negli Stati Uniti, ottobre 2020</div>''', '''    enter(tl, "#s15c-st", "Z");
    rise(tl, "#p3-l1", 0.04);
    tl.fromTo("#p3-mag", { opacity: 0, x: -400 }, { opacity: 1, x: 0, duration: 0.42, ease: "expo.out" }, 0.05);
    pop(tl, "#p3-t1", 0.3);
    tl.fromTo("#p3-tag", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.5);
    sink(tl, "#p3-l1", «51.87» - 0.16);
    rise(tl, "#p3-l2", «51.87»);
    rise(tl, "#p3-l3", «53.04» - 0.1);
    tl.fromTo("#p3-ln", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «53.04» - 0.1);
    tl.fromTo("#p3-ad", { opacity: 0, scale: 0.3, y: 200 }, { opacity: 1, scale: 1, y: 0, duration: 0.42, ease: "back.out(2)" }, «53.04»);
    sink(tl, "#p3-l2", «54.12» - 0.16); sink(tl, "#p3-l3", «54.12» - 0.16);
    rise(tl, "#p3-l4", «54.12»);
    pop(tl, "#p3-t2", «54.12» + 0.15);
    rise(tl, "#p3-l5", «54.80» - 0.08);
    tl.fromTo(["#p3-t1", "#p3-t2"], { scale: 1 }, { scale: 1.18, duration: 0.14, yoyo: true, repeat: 1, stagger: 0.1, immediateRender: false }, «54.80»);
    exit(tl, "#s15c-st", "L", DUR - 0.2);''', fixed=True,
    fx=[('whoosh-cinematic', 50.64, 0.22), ('pop', 51.0, 0.3), ('whoosh-short', 51.72, 0.2), ('pop', 53.06, 0.3), ('whoosh-short', 53.98, 0.2), ('pop', 54.27, 0.32), ('ping', 54.8, 0.18)])

add('s15d', 55.67, 58.97, f'''      {zone(ln('k3-l1', 'prima crea', 't-sans t-mut'), ln('k3-l2', 'il problema', 't-it split', 'font-size:150px;color:#ff3b30', mt=-22))}
      {zone(ln('k3-l3', 'poi ti vende', 't-sans t-mut'), ln('k3-l4', 'la soluzione', 't-it split acc', 'font-size:150px', mt=-22))}
      <div id="k3-a" style="position:absolute;left:340px;top:820px;width:400px;height:400px;border-radius:50%;background:#ff3b30;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 100 100" width="220" height="220"><path d="M22 22 L78 78 M78 22 L22 78" stroke="#fff" stroke-width="14" stroke-linecap="round"/></svg></div>
      <div id="k3-b" style="position:absolute;left:340px;top:820px;width:400px;height:400px;border-radius:50%;background:{BURG};display:flex;align-items:center;justify-content:center;font:700 250px/1 Inter;color:#fff">€</div>''', '''    enter(tl, "#s15d-st", "U");
    rise(tl, "#k3-l1", 0.04);
    flip(tl, "#k3-l2", «56.27» - 0.08, 0.035);
    tl.fromTo("#k3-a", { opacity: 0, scale: 0.2, rotation: -40 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.4, ease: "back.out(2.4)" }, «56.27» - 0.05);
    sink(tl, "#k3-l1", «57.34» - 0.16); sink(tl, "#k3-l2", «57.34» - 0.16);
    rise(tl, "#k3-l3", «57.34»);
    tl.to("#k3-a", { scale: 0, rotation: 90, duration: 0.22, ease: "power3.in" }, «57.34» - 0.05);
    tl.fromTo("#k3-b", { opacity: 0, scale: 0.2, rotation: -90 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.42, ease: "back.out(2.4)" }, «57.34» + 0.15);
    flip(tl, "#k3-l4", «58.05» - 0.1, 0.035);
    tl.fromTo("#k3-b", { scale: 1 }, { scale: 1.14, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, «58.05»);
    exit(tl, "#s15d-st", "Z", DUR - 0.18);''', fixed=True,
    fx=[('whoosh-short', 55.65, 0.3), ('impact-bass-1', 56.22, 0.26), ('whoosh', 57.2, 0.28), ('pop', 57.5, 0.32), ('sparkle', 58.0, 0.18)])

# ---------------------------------------------------------------- trick 4: i rallentamenti
title('s16', 52.56, 54.47, 4, 'i rallentamenti', 53.17, BURG, wsize=98)

YEARS = '<span style="display:inline-block;height:87px;overflow:hidden;vertical-align:bottom"><span id="f-ys" style="display:block;line-height:87px"><span style="display:block">2015</span><span style="display:block">2016</span><span style="display:block">2017</span><span style="display:block">2018</span></span></span>'
add('s17', 54.47, 59.95, f'''      {zone(ln('f-a1', '<span>nel</span> ' + YEARS, 't-sans'), ln('f-a2', "l'Antitrust italiano", 't-it', mt=-24))}
      {zone(ln('f-b1', 'ha multato Apple', 't-it'))}
      <div id="f-badge" style="position:absolute;left:270px;top:700px;width:540px;border:8px solid #1d1d1f;border-radius:40px;padding:44px 30px 40px;text-align:center">
        <div style="font:700 130px/1 Inter;letter-spacing:0.02em">AGCM</div>
        <div style="font:500 27px/1.3 Inter;color:#3c3c43;margin-top:14px">Autorità Garante della Concorrenza<br>e del Mercato</div>
      </div>
      <div id="f-num" style="position:absolute;left:0;right:0;top:1130px;text-align:center;font:700 138px/1 Inter;letter-spacing:-0.04em;color:{BURG};white-space:nowrap"><span id="f-v">0</span> €</div>
      <div id="f-sel" class="sel" style="left:70px;top:1100px;width:940px;height:190px">{SEL}</div>
      <div id="f-pill" class="pill" style="left:810px;top:1050px">multa</div>
      <div class="tag" id="f-tag" style="top:1330px">Sanzione AGCM, ottobre 2018</div>''', '''    enter(tl, "#s17-st", "U");
    rise(tl, "#f-a1", 0.05);
    tl.fromTo("#f-ys", { y: 0 }, { y: -87 * 3, duration: 0.5, ease: "expo.out" }, «54.65» - 0.08);
    rise(tl, "#f-a2", «55.64» - 0.08);
    tl.fromTo("#f-badge", { opacity: 0, scale: 1.5, rotation: -10 }, { opacity: 1, scale: 1, rotation: -3, duration: 0.3, ease: "power3.in" }, «55.64» + 0.1);
    tl.to("#f-badge", { scale: 1.05, duration: 1.2, ease: "none" }, «55.64» + 0.4);
    sink(tl, "#f-a1", «57.07» - 0.2); sink(tl, "#f-a2", «57.07» - 0.2);
    rise(tl, "#f-b1", «57.19» - 0.1);
    tl.to("#f-badge", { scale: 0.86, y: -6, duration: 0.3, ease: "expo.out" }, «57.19» - 0.1);
    tl.fromTo("#f-num", { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, «58.29» - 0.25);
    count(tl, "#f-v", 0, 10000000, «58.29» - 0.1, 1.0, (v) => String(Math.round(v)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, "."));
    tl.fromTo("#f-num", { scale: 1.14 }, { scale: 1, duration: 0.34, ease: "expo.out", immediateRender: false }, «59.34» - 0.14);
    tl.fromTo("#f-tag", { opacity: 0 }, { opacity: 1, duration: 0.3 }, «59.15»);
    select(tl, "#f-sel", null, «59.34»);
    pop(tl, "#f-pill", «59.34» + 0.08);
    exit(tl, "#s17-st", "L", DUR - 0.2);''',
    fx=[('whoosh-short', 54.45, 0.3), ('key-press', 54.6, 0.24), ('impact-bass-1', 55.98, 0.22), ('whoosh-short', 56.9, 0.22),
        ('typing', 58.2, 0.2), ('impact-bass-1', 59.2, 0.2), ('pop', 59.42, 0.3)])

add('s18', 59.95, 65.51, f'''      {zone(ln('u-a1', 'tra le accuse:', 't-sans t-mut'), ln('u-a2', 'aggiornamenti spinti', 't-it', mt=-24))}
      {zone(ln('u-b1', 'sugli iPhone vecchi', 't-sans t-mut'), ln('u-b2', 'che li rallentavano', 't-it', mt=-24))}
      {zone(ln('u-c1', 'senza avvisare', 't-it', 'font-size:120px'))}
      <img id="u-ph" class="mul" src="assets/img/ip6-gray.png" style="position:absolute;left:320px;top:700px;width:440px;display:block" alt="" />
      <div id="u-alert" class="al" style="left:190px;top:1010px"><div class="al-t"><b>Aggiornamento software</b><span>È disponibile una nuova versione di iOS.</span></div><div class="al-b"><span>Più tardi</span><span id="u-btn">Installa ora</span></div></div>
      <div id="u-cur" class="cur" style="left:720px;top:1262px">{CURSOR}</div>
      <div id="u-pill" class="pill" style="left:660px;top:690px;background:#1d1d1f">iPhone 6</div>
      <div id="u-bar" style="position:absolute;left:190px;top:1370px;width:700px">
        <div style="font:600 40px/1 Inter;color:#3c3c43;margin-bottom:18px">velocità</div>
        <div style="height:44px;border-radius:22px;background:#e5e5ea;overflow:hidden"><div id="u-fill" style="height:100%;border-radius:22px;background:#34c759;transform-origin:left center"></div></div>
      </div>
      <div id="u-bell" style="position:absolute;left:230px;top:820px;width:160px;height:160px;border-radius:50%;background:#1d1d1f;display:flex;align-items:center;justify-content:center">{BELL}</div>''', '''    enter(tl, "#s18-st", "L");
    rise(tl, "#u-a1", 0.06);
    tl.fromTo("#u-ph", { y: 260, opacity: 0, rotation: 6 }, { y: 0, opacity: 1, rotation: 0, duration: 0.5, ease: "expo.out" }, 0.12);
    rise(tl, "#u-a2", «60.87» - 0.08);
    tl.fromTo("#u-alert", { opacity: 0, scale: 1.18 }, { opacity: 1, scale: 1, duration: 0.28, ease: "back.out(2)" }, «60.87» + 0.08);
    tl.fromTo("#u-cur", { opacity: 0, x: 200, y: 240 }, { opacity: 1, x: 0, y: 0, duration: 0.38, ease: "power3.out" }, «61.68» - 0.3);
    tl.to("#u-cur", { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1 }, «61.68» + 0.1);
    tl.fromTo("#u-btn", { backgroundColor: "rgba(0,122,255,0)" }, { backgroundColor: "rgba(0,122,255,0.16)", duration: 0.1, yoyo: true, repeat: 1 }, «61.68» + 0.12);
    tl.to(["#u-alert", "#u-cur"], { opacity: 0, scale: 0.9, duration: 0.2 }, «62.23» - 0.08);
    sink(tl, "#u-a1", «62.23» - 0.18); sink(tl, "#u-a2", «62.23» - 0.18);
    rise(tl, "#u-b1", «62.23»);
    pop(tl, "#u-pill", «62.36» + 0.12);
    tl.fromTo("#u-ph", { scale: 1.08 }, { scale: 1, duration: 0.34, ease: "back.out(3)", immediateRender: false }, «62.36» + 0.1);
    tl.fromTo("#u-bar", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, «63.20»);
    rise(tl, "#u-b2", «63.37» - 0.12);
    tl.fromTo("#u-fill", { scaleX: 1 }, { scaleX: 0.28, duration: 1.0, ease: "power2.out" }, «63.53»);
    tl.to("#u-fill", { backgroundColor: "#ff3b30", duration: 0.8 }, «63.53» + 0.1);
    sink(tl, "#u-b1", «64.32» - 0.18); sink(tl, "#u-b2", «64.32» - 0.18);
    rise(tl, "#u-c1", «64.32» - 0.05);
    pop(tl, "#u-bell", «64.67» - 0.12);
    exit(tl, "#s18-st", "Z", DUR - 0.18);''', ALERT_CSS,
    fx=[('whoosh', 59.93, 0.3), ('ping', 60.95, 0.2), ('click-soft', 61.78, 0.4), ('whoosh-short', 62.1, 0.22), ('pop', 62.48, 0.28),
        ('whoosh-cinematic', 63.4, 0.22), ('whoosh-short', 64.16, 0.22), ('pop', 64.56, 0.3)])

# ---------------------------------------------------------------- trick 5: la gabbia dorata
add('s19', 65.51, 69.19, f'''      {seg('q', 5)}
      <div class="bignum" id="q-num"><div id="q-col" style="color:{BURG}"><div>4</div><div>5</div></div></div>
      {zone(ln('q-a1', 'e il quinto', 't-sans t-mut'), ln('q-a2', 'il più geniale', 't-it', mt=-24))}
      <div id="q-sel" class="sel" style="left:380px;top:590px;width:320px;height:420px">{SEL}</div>
      <svg style="position:absolute;left:0;top:0" width="1080" height="1920"><rect id="q-rect" x="70" y="690" width="940" height="540" rx="76" fill="none" stroke="{GOLD}" stroke-width="10"/></svg>
      <div style="position:absolute;left:0;right:0;top:760px;text-align:center">
        <div id="q-g1" class="split gold" style="font:700 170px/1.04 Inter;letter-spacing:-0.035em">la gabbia</div>
        <div id="q-g2" class="split gold" style="font:700 206px/1.04 Inter;letter-spacing:-0.035em">dorata</div>
      </div>''', '''    enter(tl, "#s19-st", "U");
    tl.fromTo("#q-col", { y: 0 }, { y: -470, duration: 0.45, ease: "expo.out" }, «65.77» - 0.1);
    tl.fromTo("#q-num", { scale: 0.8 }, { scale: 1, duration: 0.5, ease: "back.out(2.2)" }, 0.1);
    tl.fromTo("#q-sg", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out" }, «65.77»);
    rise(tl, "#q-a1", 0.05);
    rise(tl, "#q-a2", «66.43»);
    select(tl, "#q-sel", null, «66.90»);
    tl.fromTo("#q-num", { scale: 1.14 }, { scale: 1, duration: 0.34, ease: "back.out(3)", immediateRender: false }, «66.90»);
    sink(tl, "#q-a1", «67.82» - 0.22); sink(tl, "#q-a2", «67.82» - 0.22);
    tl.to(["#q-num", "#q-sel", "#q-seg"], { opacity: 0, scale: 0.6, duration: 0.2, ease: "power3.in" }, «67.82» - 0.22);
    draw(tl, "#q-rect", «67.82» - 0.05, 1.0);
    flip(tl, "#q-g1", «67.82» - 0.05, 0.035);
    flip(tl, "#q-g2", «68.37» - 0.08, 0.04);
    exit(tl, "#s19-st", "Z", DUR - 0.18);''',
    fx=[('whoosh-short', 65.49, 0.3), ('pop', 65.7, 0.3), ('click-soft', 66.95, 0.36), ('riser', 66.9, 0.1), ('whoosh', 67.6, 0.3), ('sparkle', 67.85, 0.22), ('impact-bass-1', 68.37, 0.22)])

# ecosystem: phone in the middle, each device joins and a spoke connects it
import math
Pc = (540, 1100)
ITEMS = {'air': (205, 900, 175, 135), 'wat': (875, 900, 175, 125), 'mac': (540, 1540, 205, 172), 'icl': (205, 1290, 175, 92), 'mus': (875, 1290, 175, 92), 'tv': (540, 760, 205, 82)}
def spoke(k):
    x, y, sd, ed = ITEMS[k]; dx, dy = x - Pc[0], y - Pc[1]; d = math.hypot(dx, dy); ux, uy = dx / d, dy / d
    return f'<line id="x-l-{k}" class="x-ln" x1="{Pc[0] + ux * sd:.0f}" y1="{Pc[1] + uy * sd:.0f}" x2="{x - ux * ed:.0f}" y2="{y - uy * ed:.0f}"/>'
RING = ['tv', 'wat', 'mus', 'mac', 'icl', 'air', 'tv']
def ring(i):
    a, b = ITEMS[RING[i]], ITEMS[RING[i + 1]]; dx, dy = b[0] - a[0], b[1] - a[1]; d = math.hypot(dx, dy); ux, uy = dx / d, dy / d
    sa = 190 if RING[i] == 'mac' else (140 if RING[i] in ('air', 'wat') else 100); sb = 190 if RING[i + 1] == 'mac' else (140 if RING[i + 1] in ('air', 'wat') else 100)
    return f'<line id="x-r-{i}" class="x-ln x-rg" x1="{a[0] + ux * sa:.0f}" y1="{a[1] + uy * sa:.0f}" x2="{b[0] - ux * sb:.0f}" y2="{b[1] - uy * sb:.0f}"/>'
BARS = ''.join(f'<line id="x-b-{k}" class="x-bar" x1="{190 + k * 140}" y1="640" x2="{190 + k * 140}" y2="1750"/>' for k in range(6))
add('s20', 69.19, 82.42, f'''      {zone(ln('x-t0', '<span class="t-sans t-mut">prima</span> <span class="t-it">l\'iPhone</span>', ''))}
      {zone(ln('x-t1', 'poi le cuffie', 't-it'), ln('x-t1b', 'che si collegano da sole', 't-sans t-mut', 'font-size:62px', mt=-20))}
      {zone(ln('x-t2', "poi l'orologio", 't-it'))}
      {zone(ln('x-t3', 'poi il Mac', 't-it'))}
      {zone(ln('x-t4', '<span class="t-it" id="x-w1">poi iCloud,</span> <span class="t-it" id="x-w2">musica,</span> <span class="t-it" id="x-w3">TV</span>', '', 'font-size:72px'))}
      {zone(ln('x-t5', 'ogni pezzo funziona meglio', 't-sans t-mut', 'font-size:70px'), ln('x-t5b', 'con gli altri', 't-it', 'font-size:104px', mt=-20))}
      {zone(ln('x-t6', 'e rende più difficile', 't-sans t-mut'), ln('x-t6b', 'uscire', 't-it split acc', 'font-size:128px', mt=-24))}
      <div id="x-cam" style="position:absolute;inset:0;background:#fff;transform-origin:50% 58%">
        <svg style="position:absolute;left:0;top:0" width="1080" height="1920">{''.join(spoke(k) for k in ITEMS)}{''.join(ring(i) for i in range(6))}</svg>
        <img id="x-ph" class="mul x-it" src="assets/img/ip18-burg-a.png" style="position:absolute;left:430px;top:904px;width:220px" alt="" />
        <img id="x-air" class="mul x-it" src="assets/img/airpods.png" style="position:absolute;left:85px;top:780px;width:240px" alt="" />
        <img id="x-wat" class="mul x-it" src="assets/img/watch.png" style="position:absolute;left:775px;top:767px;width:200px" alt="" />
        <img id="x-mac" class="mul x-it" src="assets/img/macbook.png" style="position:absolute;left:320px;top:1375px;width:440px" alt="" />
        <img id="x-icl" class="x-it" src="assets/img/logo-icloud-icon.png" style="position:absolute;left:135px;top:1220px;width:140px" alt="" />
        <img id="x-mus" class="x-it" src="assets/img/logo-music.png" style="position:absolute;left:805px;top:1220px;width:140px" alt="" />
        <img id="x-tv" class="x-it" src="assets/img/logo-tv.png" style="position:absolute;left:470px;top:690px;width:140px" alt="" />
        <svg style="position:absolute;left:0;top:0" width="1080" height="1920"><rect id="x-cage" x="50" y="640" width="980" height="1110" rx="84" fill="none" stroke="{GOLD}" stroke-width="12"/>{BARS}</svg>
        <div id="x-lock" style="position:absolute;left:470px;top:1680px;width:140px;height:140px;border-radius:50%;background:{GOLD};display:flex;align-items:center;justify-content:center">{LOCK}</div>
      </div>''', '''    enter(tl, "#s20-st", "L");
    const pi = (s, t) => tl.fromTo(s, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.2)" }, t);
    tl.fromTo("#x-cam", { scale: 1.3 }, { scale: 1, duration: 8.2, ease: "power1.out" }, 0);
    pi("#x-ph", 0.1); rise(tl, "#x-t0", 0.05);
    sink(tl, "#x-t0", «70.36» - 0.16); rise(tl, "#x-t1", «70.36»); pi("#x-air", «70.54»);
    rise(tl, "#x-t1b", «71.14» - 0.05); draw(tl, "#x-l-air", «71.44» - 0.1, 0.5);
    sink(tl, "#x-t1", «72.60» - 0.16); sink(tl, "#x-t1b", «72.60» - 0.16); rise(tl, "#x-t2", «72.60»); pi("#x-wat", «72.76»); draw(tl, "#x-l-wat", «72.76» + 0.2, 0.4);
    sink(tl, "#x-t2", «73.64» - 0.16); rise(tl, "#x-t3", «73.64»); pi("#x-mac", «73.96»); draw(tl, "#x-l-mac", «73.96» + 0.2, 0.3);
    sink(tl, "#x-t3", «74.80» - 0.16); rise(tl, "#x-t4", «74.80»);
    tl.fromTo("#x-w2", { opacity: 0.22 }, { opacity: 1, duration: 0.15 }, «75.83»); tl.fromTo("#x-w3", { opacity: 0.22 }, { opacity: 1, duration: 0.15 }, «76.77»);
    pi("#x-icl", «75.13»); draw(tl, "#x-l-icl", «75.13» + 0.2, 0.4);
    pi("#x-mus", «75.83» + 0.1); draw(tl, "#x-l-mus", «75.83» + 0.3, 0.4);
    pi("#x-tv", «76.77» + 0.05); draw(tl, "#x-l-tv", «76.77» + 0.2, 0.3);
    sink(tl, "#x-t4", «77.48» - 0.16); rise(tl, "#x-t5", «77.48»);
    for (let i = 0; i < 6; i++) draw(tl, "#x-r-" + i, «77.81» + i * 0.16, 0.4);
    rise(tl, "#x-t5b", «79.01» - 0.08);
    tl.fromTo(".x-it", { scale: 1 }, { scale: 1.12, duration: 0.16, yoyo: true, repeat: 1, stagger: 0.04, immediateRender: false }, «79.01»);
    sink(tl, "#x-t5", «79.80» - 0.16); sink(tl, "#x-t5b", «79.80» - 0.16); rise(tl, "#x-t6", «79.80»);
    draw(tl, "#x-cage", «79.80», 1.2);
    tl.to("#x-cam", { scale: 0.92, duration: 2.4, ease: "power2.inOut" }, «79.80»);
    for (let k = 0; k < 6; k++) draw(tl, "#x-b-" + k, «81.06» - 0.25 + k * 0.07, 0.35);
    flip(tl, "#x-t6b", «81.68» - 0.06, 0.04);
    pop(tl, "#x-lock", «81.68» + 0.06);
    exit(tl, "#s20-st", "Z", DUR - 0.18);''', ICO_CSS + f'''
    .x-ln {{ stroke: #c7c7cc; stroke-width: 5; stroke-linecap: round; fill: none; }}
    .x-rg {{ stroke: {BURG}; stroke-width: 4; opacity: 0.55; }}
    .x-bar {{ stroke: {GOLD}; stroke-width: 9; stroke-linecap: round; opacity: 0.92; }}''',
    fx=[('whoosh', 69.17, 0.3), ('pop', 69.3, 0.3), ('pop', 70.54, 0.3), ('ping', 71.4, 0.2), ('pop', 72.76, 0.3), ('pop', 73.96, 0.3), ('pop', 75.13, 0.26),
        ('pop', 75.93, 0.26), ('pop', 76.82, 0.26), ('whoosh-cinematic', 77.75, 0.22), ('sparkle', 79.0, 0.16), ('riser', 79.8, 0.12), ('typing', 80.85, 0.2),
        ('impact-bass-1', 81.7, 0.26), ('click', 81.74, 0.4)])

add('s21', 82.42, 87.31, f'''      {zone(ln('v-a1', 'solo i servizi', 't-it'))}
      <div id="v-ic" style="position:absolute;left:290px;top:560px;width:500px;display:flex;justify-content:space-between">
        <img class="v-i" src="assets/img/logo-icloud-icon.png" style="width:150px;display:block" alt="" /><img class="v-i" src="assets/img/logo-music.png" style="width:150px;display:block" alt="" /><img class="v-i" src="assets/img/logo-tv.png" style="width:150px;display:block" alt="" />
      </div>
      {zone(ln('v-p', 'più di', 't-sans t-mut'), top=770)}
      <div id="v-n" style="position:absolute;left:0;right:0;top:870px;text-align:center;font:700 380px/1 Inter;letter-spacing:-0.05em;color:{BURG}"><span id="v-v">0</span></div>
      {zone(ln('v-m', 'miliardi di dollari', 't-it'), ln('v-y', "l'anno", 't-sans t-mut', mt=-20), top=1270)}
      <div class="tag" id="v-tag" style="top:1570px">Ricavi dai servizi, anno fiscale 2025</div>''', '''    enter(tl, "#s21-st", "U");
    rise(tl, "#v-a1", 0.05);
    tl.fromTo(".v-i", { opacity: 0, scale: 0.4, y: 60 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(2.2)", stagger: 0.1 }, 0.18);
    rise(tl, "#v-p", «84.37» - 0.08);
    tl.fromTo("#v-n", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.3, ease: "expo.out" }, «84.75» - 0.16);
    count(tl, "#v-v", 0, 100, «84.75» - 0.12, 0.6);
    tl.fromTo("#v-n", { scale: 1.16 }, { scale: 1, duration: 0.34, ease: "back.out(3)", immediateRender: false }, «85.32» - 0.06);
    rise(tl, "#v-m", «85.32» - 0.08);
    tl.fromTo("#v-tag", { opacity: 0 }, { opacity: 1, duration: 0.3 }, «85.84»);
    rise(tl, "#v-y", «86.45» - 0.1);
    tl.to("#v-n", { scale: 1.06, duration: 1.6, ease: "none" }, «85.32» + 0.3);
    exit(tl, "#s21-st", "L", DUR - 0.2);''', ICO_CSS,
    fx=[('whoosh-short', 82.4, 0.3), ('pop', 82.62, 0.24), ('pop', 82.72, 0.22), ('pop', 82.82, 0.2), ('typing', 84.6, 0.2), ('impact-bass-1', 85.26, 0.28), ('key-press', 86.38, 0.22)])

HB = ''.join(f'<line id="h-b-{k}" class="h-bar" x1="{350 + k * 95}" y1="772" x2="{350 + k * 95}" y2="1400"/>' for k in range(5))
add('s22', 87.31, 91.56, f'''      {zone(ln('h-a1', 'non stai comprando', 't-sans t-mut'), ln('h-a2', 'un telefono<i id="h-strike" style="position:absolute;left:-12px;right:-12px;top:54%;height:9px;border-radius:5px;background:#ff3b30;transform-origin:left center"></i>', 't-it', 'position:relative', mt=-24))}
      {zone(ln('h-b1', 'stai entrando in una casa', 't-sans', 'font-size:70px;color:#86868b'), ln('h-b2', 'da cui non esci più', 't-it', 'font-size:98px', mt=-18))}
      <img id="h-ph" class="mul" src="assets/img/ip18-burg-a.png" style="position:absolute;left:400px;top:830px;width:280px" alt="" />
      <svg style="position:absolute;left:0;top:0" width="1080" height="1920"><path id="h-roof" d="M252 776 L540 640 L828 776" fill="none" stroke="{GOLD}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><rect id="h-rect" x="280" y="772" width="520" height="628" rx="40" fill="none" stroke="{GOLD}" stroke-width="12"/>{HB}</svg>
      <div id="h-lock" style="position:absolute;left:470px;top:1330px;width:140px;height:140px;border-radius:50%;background:{GOLD};display:flex;align-items:center;justify-content:center">{LOCK}</div>''', '''    enter(tl, "#s22-st", "L");
    rise(tl, "#h-a1", 0.05);
    tl.fromTo("#h-ph", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 0.1);
    rise(tl, "#h-a2", «88.11» - 0.08);
    tl.fromTo("#h-strike", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power2.out" }, «88.22» + 0.2);
    sink(tl, "#h-a1", «88.84» - 0.18); sink(tl, "#h-a2", «88.84» - 0.18);
    rise(tl, "#h-b1", «88.84»);
    draw(tl, "#h-roof", «89.17», 0.45);
    draw(tl, "#h-rect", «89.17» + 0.25, 0.8);
    rise(tl, "#h-b2", «90.32» - 0.08);
    for (let k = 0; k < 5; k++) draw(tl, "#h-b-" + k, «90.46» + k * 0.08, 0.32);
    tl.to("#h-ph", { scale: 0.9, duration: 0.7, ease: "power2.out" }, «90.46»);
    pop(tl, "#h-lock", «91.22» - 0.12);
    exit(tl, "#s22-st", "Z", DUR - 0.18);''', f'''
    .h-bar {{ stroke: {GOLD}; stroke-width: 10; stroke-linecap: round; }}''',
    fx=[('whoosh', 87.29, 0.3), ('pop', 87.45, 0.26), ('whoosh-short', 88.4, 0.26), ('whoosh-short', 88.7, 0.2), ('whoosh-cinematic', 89.15, 0.22),
        ('typing', 90.46, 0.2), ('click', 91.12, 0.42), ('impact-bass-1', 91.1, 0.22)])

add('s23', 91.56, 94.52, f'''      <div id="o-B" data-layout-allow-overlap style="position:absolute;left:0;top:335px;width:1080px;height:1920px;mix-blend-mode:multiply;transform-origin:50% 19%">
        <video id="o-vid" class="clip" src="assets/video/ip18-spin-loop.mp4" data-start="0.04" data-duration="2.9" muted playsinline style="position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover"></video>
      </div>
      {zone(ln('o-a1', 'e ogni anno', 't-sans t-mut'), ln('o-a2', 'ti fa spendere', 't-it', 'font-size:112px', mt=-24))}
      {zone(ln('o-b1', '<span class="t-sans t-mut" style="font-size:104px">migliaia di</span><span class="t-sans split acc" id="o-euro" style="font-size:104px;font-weight:700">euro</span>', ''))}''', '''    enter(tl, "#s23-st", "Z");
    tl.fromTo("#o-B", { scale: 0.9 }, { scale: 1.0, duration: 2.3, ease: "none" }, 0);
    rise(tl, "#o-a1", 0.05);
    rise(tl, "#o-a2", «92.17» - 0.1);
    sink(tl, "#o-a1", «93.08» - 0.2); sink(tl, "#o-a2", «93.08» - 0.2);
    rise(tl, "#o-b1", «93.08» - 0.05);
    flip(tl, "#o-euro", «93.86» - 0.1, 0.05);
    tl.to("#o-B", { scale: 1.12, duration: 0.3, ease: "back.out(2.6)" }, «93.86» - 0.06);
    exit(tl, "#s23-st", "U", DUR - 0.2);''',
    fx=[('whoosh-cinematic', 91.5, 0.24), ('whoosh-short', 92.9, 0.22), ('key-press', 93.76, 0.26), ('pop', 93.82, 0.26)])

add('s24', 94.52, 98.85, f'''      {zone(ln('z-a1', 'vuoi sapere come', 't-sans t-mut'), ln('z-a2', 'creo questi video?', 't-it', mt=-24))}
      {zone(ln('z-b1', 'scrivi', 't-sans t-mut'))}
      <div id="z-m" class="split acc" style="position:absolute;left:0;right:0;top:500px;text-align:center;font:700 214px/1 Inter;letter-spacing:-0.04em">MOTION</div>
      <div id="z-bar" style="position:absolute;left:90px;top:850px;width:900px;height:140px;border-radius:70px;border:4px solid #d2d2d7;display:flex;align-items:center;padding:0 44px 0 24px;gap:26px">
        <div style="width:92px;height:92px;border-radius:50%;background:linear-gradient(#d1d1d6,#aeaeb2)"></div>
        <div id="z-t" class="split" style="flex:1;font:500 52px/1 Inter;letter-spacing:0.01em">MOTION</div>
        <div id="z-pub" style="font:600 46px/1 Inter;color:#0a84ff">Pubblica</div>
      </div>
      <div id="z-cur" class="cur" style="left:880px;top:940px">{CURSOR}</div>
      {zone(ln('z-c1', 'e ti spiego tutto', 't-it'), top=1090)}''', '''    enter(tl, "#s24-st", "L");
    tl.fromTo("#s24-st", { scale: 1 }, { scale: 1.035, duration: 4.0, ease: "none", immediateRender: false }, 0.3);
    rise(tl, "#z-a1", 0.05);
    rise(tl, "#z-a2", «95.40» - 0.1);
    sink(tl, "#z-a1", «96.50» - 0.2); sink(tl, "#z-a2", «96.50» - 0.2);
    rise(tl, "#z-b1", «96.50» - 0.05);
    tl.fromTo("#z-bar", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.35, ease: "expo.out" }, «96.50»);
    flip(tl, "#z-m", «97.07» - 0.08, 0.05);
    typeIn(tl, "#z-t", «97.07», 0.07);
    rise(tl, "#z-c1", «97.60»);
    tl.fromTo("#z-cur", { opacity: 0, x: 160, y: 200 }, { opacity: 1, x: 0, y: 0, duration: 0.36, ease: "power3.out" }, «97.78»);
    tl.to("#z-cur", { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1 }, «98.29» - 0.1);
    tl.fromTo("#z-pub", { scale: 1 }, { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 }, «98.29» - 0.08);''',
    fx=[('whoosh', 94.5, 0.3), ('whoosh-short', 96.3, 0.22), ('key-press', 97.0, 0.28), ('typing', 97.07, 0.22), ('click-soft', 98.2, 0.42), ('pop', 98.24, 0.26)])

if __name__ == '__main__':
    for s in SC:
        open(OUT + s['id'] + '.html', 'w').write(scene(s['id'], s['dur'], s['body'], s['js'], s['css']))
    print('written', [s['id'] for s in SC])
