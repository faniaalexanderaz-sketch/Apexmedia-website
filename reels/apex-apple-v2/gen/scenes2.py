# scenes 8..24 of apex-apple-v2 (19.47 s -> end). Times written as «abs» are absolute voice times,
# converted to scene-local seconds when the scene is registered.
import re, sys
sys.path.insert(0, '.')
from common import scene, CURSOR, SEL
OUT = '/home/user/Apexmedia-website/reels/apex-apple-v2/compositions/'
SC = []
BURG = '#7a0f24'; GREEN = '#30d158'; GOLD = '#c9a227'

def ln(i, html, cls='t-sans', style='', mt=None):
    m = f' style="margin-top:{mt}px"' if mt is not None else ''
    st = f' style="{style}"' if style else ''
    return f'<span class="line"{m}><span id="{i}" class="{cls}"{st}>{html}</span></span>'

def zone(*lines, top=372):
    return f'<div class="zone" data-layout-allow-overlap style="top:{top}px">' + ''.join(lines) + '</div>'

def add(sid, start, end, body, js, css='', fx=(), dark=False):
    f = lambda s: re.sub(r'«([\d.]+)»', lambda m: '%.2f' % (float(m.group(1)) - start), s)
    dur = round(end - start, 3)
    body = f'    <div id="{sid}-st" class="st{" dark" if dark else ""}" data-layout-allow-overlap>\n' + f(body) + '\n    </div>'
    SC.append(dict(id=sid, start=start, dur=dur, body=body, js=f(js).replace('DUR', '%.2f' % dur), css=css,
                   fx=[(n, round(t, 3), v) for n, t, v in fx]))

def seg(sid, n):
    return f'<div class="seg" id="{sid}-seg">' + ''.join(
        '<i>' + (f'<b id="{sid}-sg"></b>' if k == n else ('<b></b>' if k < n else '')) + '</i>' for k in range(1, 6)) + '</div>'

def title(sid, start, end, n, word, wabs, color, dark=False, wsize=112):
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
    add(sid, start, end, body, js, dark=dark,
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

add('s9', 21.09, 27.64, f'''      {zone(ln('m-a1', 'il modello base', 't-sans t-mut'), ln('m-a2', 'ha poco spazio', 't-it', mt=-24))}
      {zone(ln('m-b1', 'dopo un anno di foto', 't-sans t-mut'), ln('m-b2', 'è pieno', 't-it', 'font-size:118px;color:#ff3b30', mt=-24))}
      {zone(ln('m-c1', 'la volta dopo prendi', 't-sans t-mut'), ln('m-c2', 'quello più grande', 't-it', mt=-24))}
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
    rise(tl, "#m-b2", «25.08» - 0.08);
    tl.fromTo("#m-card", { scale: 1 }, { scale: 1.04, duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }, «25.08»);
    tl.fromTo("#m-alert", { opacity: 0, scale: 1.18 }, { opacity: 1, scale: 1, duration: 0.28, ease: "back.out(2)" }, «25.08»);
    tl.to(["#m-card", "#m-alert"], { y: 1500, duration: 0.3, ease: "power3.in" }, «25.50» - 0.14);
    sink(tl, "#m-b1", «25.50» - 0.15); sink(tl, "#m-b2", «25.50» - 0.15);
    rise(tl, "#m-c1", «25.50» + 0.05);
    tl.fromTo(".m-opt", { y: 300, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "expo.out", stagger: 0.08 }, «25.50» + 0.1);
    rise(tl, "#m-c2", «26.49» - 0.08);
    tl.fromTo("#m-cur", { opacity: 0, x: 220, y: 300 }, { opacity: 1, x: 0, y: 0, duration: 0.4, ease: "power3.out" }, «26.49»);
    tl.to("#m-cur", { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1 }, «27.02» - 0.1);
    tl.to("#m-o1", { borderColor: "#d2d2d7", duration: 0.12 }, «27.02» - 0.04);
    tl.to("#m-o2", { borderColor: "#0071e3", duration: 0.12 }, «27.02» - 0.04);
    tl.fromTo("#m-o2", { scale: 1 }, { scale: 1.05, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, «27.02» - 0.02);
    exit(tl, "#s9-st", "U", DUR - 0.2);''', ALERT_CSS + '''
    .m-dot { display: inline-block; width: 18px; height: 18px; border-radius: 50%; margin-right: 10px; }
    .m-opt { border: 5px solid #d2d2d7; border-radius: 30px; padding: 46px 52px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; font: 600 62px/1 "Inter Display"; letter-spacing: -0.02em; background: #fff; }
    .m-opt small { font: 400 34px/1 "Inter Display"; color: #86868b; }''',
    fx=[('whoosh', 21.07, 0.3), ('typing', 21.5, 0.14), ('pop', 23.045, 0.3), ('whoosh-short', 23.75, 0.22), ('ping', 25.08, 0.2),
        ('whoosh', 25.36, 0.28), ('click-soft', 26.94, 0.4), ('pop', 26.98, 0.25)])

add('s10', 27.64, 29.61, f'''      <div id="k-n" style="position:absolute;left:0;right:0;top:640px;display:flex;justify-content:center;align-items:center;font:700 290px/300px Inter;letter-spacing:-0.045em;color:{BURG}"><span>+</span><span style="display:inline-block;height:300px;overflow:hidden"><span id="k-col" style="display:block"><span style="display:block">100</span><span style="display:block">200</span></span></span><span style="margin-left:0.12em">€</span></div>
      {zone(ln('k-l', 'in più', 't-it', 'font-size:118px'), top=1000)}''', '''    enter(tl, "#k-st", "U");
    tl.fromTo("#k-n", { scale: 1.35 }, { scale: 1, duration: 0.35, ease: "expo.out" }, 0.04);
    tl.fromTo("#k-col", { y: 0 }, { y: -300, duration: 0.3, ease: "expo.out" }, «28.28» - 0.06);
    punch(tl, "#k-n", «28.28» - 0.04, 1.2);
    rise(tl, "#k-l", «29.09» - 0.1);
    tl.to("#k-n", { scale: 1.07, duration: 0.5, ease: "none" }, «29.09»);
    exit(tl, "#k-st", "L", DUR - 0.2);'''.replace('k-st', 's10-st'),
    fx=[('whoosh-short', 27.62, 0.3), ('pop', 27.68, 0.32), ('pop', 28.26, 0.36), ('key-press', 29.0, 0.22)])

add('s11', 29.61, 35.38, f'''      {zone(ln('w-a1', "secondo un'analisi del", 't-sans t-mut'), ln('w-a2', 'Wall Street Journal', 't-it', mt=-24))}
      {zone(ln('w-b1', 'a loro costa', 't-sans t-mut'), ln('w-b2', 'circa un terzo', 't-it acc', 'font-size:112px', mt=-24))}
      <div id="w-bL" style="position:absolute;left:230px;top:760px;width:250px;height:640px;border-radius:28px;background:#1d1d1f;transform-origin:50% 100%"></div>
      <div id="w-bR" style="position:absolute;left:600px;top:1187px;width:250px;height:213px;border-radius:28px;background:{BURG};transform-origin:50% 100%"></div>
      <div id="w-dash" style="position:absolute;left:230px;top:1183px;width:620px;border-top:5px dashed #c7c7cc;transform-origin:left center"></div>
      <div id="w-third" style="position:absolute;left:560px;width:330px;top:1030px;text-align:center;font:700 124px/1 Inter;letter-spacing:-0.04em;color:{BURG}">1/3</div>
      <div id="w-lL" style="position:absolute;left:180px;width:350px;top:1430px;text-align:center;font:600 46px/1 Inter">paghi tu</div>
      <div id="w-lR" style="position:absolute;left:550px;width:350px;top:1430px;text-align:center;font:600 46px/1 Inter;color:{BURG}">costa a loro</div>
      <div id="w-sel" class="sel" style="left:226px;top:1412px;width:258px;height:82px">{SEL}</div>
      <div class="tag" id="w-tag" style="top:1570px">Fonte: The Wall Street Journal</div>''', '''    enter(tl, "#s11-st", "L");
    rise(tl, "#w-a1", 0.06);
    rise(tl, "#w-a2", «30.80» - 0.1);
    tl.fromTo("#w-tag", { opacity: 0 }, { opacity: 1, duration: 0.3 }, «30.80»);
    sink(tl, "#w-a1", «31.84» - 0.18); sink(tl, "#w-a2", «31.84» - 0.18);
    tl.fromTo("#w-bL", { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: "expo.out" }, «31.84»);
    tl.fromTo("#w-lL", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, «31.84» + 0.2);
    rise(tl, "#w-b1", «32.58» - 0.06);
    tl.fromTo("#w-bR", { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "expo.out" }, «32.89»);
    tl.fromTo("#w-lR", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, «32.89» + 0.2);
    rise(tl, "#w-b2", «33.20»);
    tl.fromTo("#w-dash", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out" }, «33.56»);
    pop(tl, "#w-third", «33.71»);
    select(tl, "#w-sel", null, «34.73» - 0.1);
    punch(tl, "#w-bL", «34.73», 1.07);
    exit(tl, "#s11-st", "Z", DUR - 0.18);''',
    fx=[('whoosh', 29.59, 0.3), ('key-press', 30.72, 0.22), ('whoosh-short', 31.7, 0.24), ('pop', 31.86, 0.26), ('pop', 32.9, 0.28),
        ('ping', 33.7, 0.2), ('click-soft', 34.72, 0.36)])

# ---------------------------------------------------------------- trick 3: le bolle verdi (dark)
title('s12', 35.38, 37.13, 3, 'le bolle verdi', 35.76, GREEN, dark=True)

BUB = '''
    .c-bub { position: relative; padding: 40px 58px 46px; border-radius: 76px; background: #0a84ff; color: #fff; font: 500 86px/1 "Inter Display"; letter-spacing: -0.02em; white-space: nowrap; }
    .c-bub span { position: relative; z-index: 2; }
    .c-bub::before { content: ""; position: absolute; z-index: 0; bottom: 0; right: -26px; width: 70px; height: 70px; background: inherit; border-bottom-left-radius: 52px; }
    .c-bub::after { content: ""; position: absolute; z-index: 1; bottom: 0; right: -36px; width: 36px; height: 72px; background: #000; border-bottom-left-radius: 36px; }
    .c-in { background: #26252a; }
    .c-in::before { right: auto; left: -26px; border-bottom-left-radius: 0; border-bottom-right-radius: 52px; }
    .c-in::after { right: auto; left: -36px; border-bottom-left-radius: 0; border-bottom-right-radius: 36px; }'''
add('s13', 37.13, 40.15, f'''      {zone(ln('c-a1', 'scrivi da un Android', 't-sans', 'color:#86868b'), ln('c-a2', 'diventa verde', 't-it', f'font-size:118px;color:{GREEN}', mt=-24))}
      <div id="c-in" style="position:absolute;left:120px;top:790px"><div class="c-bub c-in"><span>Stasera ci siete?</span></div></div>
      <div id="c-out" style="position:absolute;right:130px;top:1030px"><div class="c-bub" id="c-b"><span>Ci sono anch'io</span></div></div>
      <div id="c-sms" style="position:absolute;right:134px;top:1262px;font:500 38px/1 Inter;color:#8e8e93">Messaggio di testo · SMS</div>''', '''    enter(tl, "#s13-st", "L");
    rise(tl, "#c-a1", 0.06);
    tl.fromTo("#c-in", { opacity: 0, scale: 0.3, y: 140, transformOrigin: "0% 100%" }, { opacity: 1, scale: 1, y: 0, duration: 0.42, ease: "back.out(1.9)" }, 0.25);
    tl.fromTo("#c-out", { opacity: 0, scale: 0.3, y: 160, transformOrigin: "100% 100%" }, { opacity: 1, scale: 1, y: 0, duration: 0.42, ease: "back.out(1.9)" }, «38.23» - 0.05);
    rise(tl, "#c-a2", «39.09» - 0.08);
    tl.to("#c-b", { backgroundColor: "#30d158", duration: 0.22 }, «39.54» - 0.12);
    tl.fromTo("#c-out", { scale: 1.12 }, { scale: 1, duration: 0.34, ease: "back.out(3)", immediateRender: false }, «39.54» - 0.1);
    tl.fromTo("#c-sms", { opacity: 0 }, { opacity: 1, duration: 0.2 }, «39.54» + 0.08);
    exit(tl, "#s13-st", "L", DUR - 0.2);''', BUB, dark=True,
    fx=[('whoosh', 37.11, 0.3), ('pop', 37.4, 0.26), ('pop', 38.2, 0.32), ('sparkle', 39.4, 0.14), ('click-soft', 39.44, 0.36)])

def gb(i, left, top, w, cls='', bg='#0a84ff'):
    return f'<div class="g-b {cls}" id="g-{i}" style="left:{left}px;top:{top}px;width:{w}px;background:{bg}"><i style="width:{w - 190}px"></i></div>'
add('s14', 40.15, 43.50, f'''      {zone(ln('g-a1', 'tra i ragazzi', 't-sans', 'color:#86868b'), ln('g-a2', f'<span>chi ha la bolla</span> <span style="color:{GREEN}">verde</span>', 't-sans', mt=-24))}
      {zone(ln('g-b1', 'resta fuori', 't-it', 'font-size:126px'), ln('g-b2', 'dai gruppi', 't-sans', 'color:#86868b', mt=-24))}
      {gb(1, 110, 740, 520)}{gb(2, 460, 900, 510)}{gb('green', 150, 1060, 470, '', GREEN)}{gb(4, 430, 1220, 540, 'g-lo')}{gb(5, 110, 1380, 480, 'g-lo')}''', '''    enter(tl, "#s14-st", "U");
    rise(tl, "#g-a1", 0.06);
    tl.fromTo(".g-b", { opacity: 0, scale: 0.5, y: 80 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(2)", stagger: 0.09 }, 0.15);
    rise(tl, "#g-a2", «40.96» - 0.08);
    tl.fromTo("#g-green", { scale: 1.16 }, { scale: 1, duration: 0.34, ease: "back.out(3)", immediateRender: false }, «41.61»);
    sink(tl, "#g-a1", «41.91» - 0.18); sink(tl, "#g-a2", «41.91» - 0.18);
    rise(tl, "#g-b1", «41.91» - 0.03);
    tl.to("#g-green", { y: 1000, x: -90, rotation: -24, opacity: 0, duration: 0.7, ease: "power2.in" }, «41.91» + 0.05);
    tl.to(".g-lo", { y: -160, duration: 0.45, ease: "expo.out" }, «41.91» + 0.5);
    rise(tl, "#g-b2", «42.75» - 0.1);
    exit(tl, "#s14-st", "Z", DUR - 0.18);''', '''
    .g-b { position: absolute; height: 124px; border-radius: 62px; }
    .g-b i { position: absolute; left: 52px; top: 52px; height: 20px; border-radius: 10px; background: rgba(255,255,255,0.6); }''', dark=True,
    fx=[('whoosh-short', 40.13, 0.3), ('typing', 40.3, 0.14), ('pop', 41.6, 0.28), ('whoosh', 41.95, 0.3), ('impact-bass-1', 42.6, 0.16)])

add('s15', 43.50, 52.56, f'''      {zone(ln('e-a1', 'in una causa del', 't-sans', 'color:#86868b'), ln('e-a2', 'governo americano', 't-it', mt=-24))}
      {zone(ln('e-b1', 'è finita', 't-sans', 'color:#86868b'), ln('e-b2', "un'email interna", 't-it', mt=-24))}
      <div id="e-doc" style="position:absolute;left:170px;top:720px;width:740px;height:900px;border-radius:14px;background:#fbfbf8;color:#1d1d1f;padding:70px 64px;text-align:center;transform-origin:50% 60%">
        <div style="font:600 24px/1.4 Inter;letter-spacing:0.08em">UNITED STATES DISTRICT COURT</div>
        <div style="font:700 40px/1.25 Inter;margin-top:60px">UNITED STATES OF AMERICA et al.<br><span style="font-weight:400;font-size:30px">v.</span><br>APPLE INC.</div>
        <div style="font:600 30px/1 Inter;letter-spacing:0.12em;margin-top:56px">COMPLAINT</div>
        <i class="e-sk" style="width:100%"></i><i class="e-sk" style="width:94%"></i><i class="e-sk" style="width:98%"></i><i class="e-sk" style="width:70%"></i><i class="e-sk" style="width:96%"></i><i class="e-sk" style="width:88%"></i>
      </div>
      <div id="e-mail" style="position:absolute;left:80px;top:700px;width:920px;height:800px;border-radius:44px;background:#1c1c1e;padding:46px 56px;box-shadow:0 40px 120px rgba(0,0,0,0.6)">
        <div class="e-row"><span>Da:</span><i style="width:300px"></i></div>
        <div class="e-row"><span>A:</span><i style="width:220px"></i></div>
        <div class="e-row"><span>Oggetto:</span><b>iMessage su Android</b></div>
        <div style="margin-top:44px;font:600 58px/1.24 Inter;letter-spacing:-0.02em;color:#f5f5f7">
          <div id="e-q1" class="split">Aprire iMessage ad Android</div>
          <div><span id="e-q2a" class="split">avrebbe tolto </span><span class="hl"><i id="e-hl"></i><span id="e-q2b" class="split">un ostacolo</span></span></div>
          <div id="e-q3" class="split">alle famiglie che comprano</div>
          <div id="e-q4" class="split">l'iPhone ai figli.</div>
        </div>
      </div>
      <div class="tag" id="e-tag" style="top:1570px">Email del 2013, citata nella causa<br>Stati Uniti contro Apple (2024)</div>''', '''    enter(tl, "#s15-st", "L");
    rise(tl, "#e-a1", 0.06);
    rise(tl, "#e-a2", «44.26» - 0.08);
    tl.fromTo("#e-doc", { y: 1300, rotation: 9 }, { y: 0, rotation: -4, duration: 0.6, ease: "expo.out" }, 0.15);
    tl.to("#e-doc", { rotation: -2, scale: 1.04, duration: 1.4, ease: "none" }, 0.75);
    sink(tl, "#e-a1", «45.20» - 0.18); sink(tl, "#e-a2", «45.20» - 0.18);
    rise(tl, "#e-b1", «45.20»);
    rise(tl, "#e-b2", «45.58» - 0.05);
    tl.fromTo("#e-mail", { x: 1100, rotation: 6 }, { x: 0, rotation: 0, duration: 0.5, ease: "expo.out" }, «45.58»);
    tl.to("#e-doc", { opacity: 0, duration: 0.3 }, «46.92» - 0.3);
    typeIn(tl, "#e-q1", «46.92», 0.04);
    typeIn(tl, "#e-q2a", «48.76», 0.035);
    typeIn(tl, "#e-q2b", «49.42», 0.035);
    tl.fromTo("#e-hl", { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power2.out" }, «49.53» + 0.36);
    typeIn(tl, "#e-q3", «49.96», 0.04);
    typeIn(tl, "#e-q4", «51.39», 0.035);
    tl.fromTo("#e-tag", { opacity: 0 }, { opacity: 1, duration: 0.3 }, «46.92» + 0.5);
    tl.to("#e-mail", { scale: 1.05, duration: 5.4, ease: "none" }, «46.92»);
    exit(tl, "#s15-st", "U", DUR - 0.2);''', '''
    .e-sk { display: block; height: 14px; border-radius: 7px; background: #d9d9d4; margin: 28px auto 0; }
    .e-row { display: flex; align-items: center; gap: 20px; font: 400 36px/1 "Inter Display"; color: #8e8e93; padding: 18px 0; border-bottom: 2px solid #2c2c2e; }
    .e-row i { height: 30px; border-radius: 6px; background: #48484a; }
    .e-row b { font-weight: 500; color: #f5f5f7; }''', dark=True,
    fx=[('whoosh', 43.48, 0.3), ('whoosh-short', 43.66, 0.2), ('whoosh', 45.5, 0.3), ('pop', 45.9, 0.2), ('typing', 46.92, 0.2), ('typing', 47.6, 0.2),
        ('typing', 48.76, 0.2), ('typing', 49.5, 0.18), ('sparkle', 49.85, 0.12), ('typing', 50.0, 0.2), ('typing', 51.39, 0.2)])

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
        <div id="x-icl" class="ico ico-c x-it" style="position:absolute;left:135px;top:1220px">{CLOUD}</div>
        <div id="x-mus" class="ico ico-m x-it" style="position:absolute;left:805px;top:1220px">{NOTE}</div>
        <div id="x-tv" class="ico ico-t x-it" style="position:absolute;left:470px;top:690px">tv</div>
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
        <div class="ico ico-c v-i">{CLOUD}</div><div class="ico ico-m v-i">{NOTE}</div><div class="ico ico-t v-i">tv</div>
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
