import sys; sys.path.insert(0,'.')
from common import scene, CURSOR, SEL
OUT='/home/user/Apexmedia-website/reels/apex-apple-v2/compositions/'
S={}
# ---------- s1 intro (0 - 2.53) ----------
S['s1']=(2.53,'''
    <div id="s1-stage" style="position:absolute;inset:0;perspective:1600px">
      <div id="s1-shadow" style="position:absolute;left:300px;top:1640px;width:480px;height:70px;border-radius:50%;background:radial-gradient(closest-side,rgba(60,0,12,0.28),rgba(0,0,0,0))"></div>
      <div id="s1-ph" style="position:absolute;left:225px;top:700px;width:630px;transform-style:preserve-3d"><img src="assets/img/ip18-burg-a.png" style="width:100%;display:block" alt="" />
        <div id="s1-glint" style="position:absolute;inset:6% 18% 12% 14%;border-radius:60px;overflow:hidden;mix-blend-mode:screen"><div id="s1-gl" style="position:absolute;top:-20%;left:-60%;width:40%;height:140%;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,0.55),rgba(255,255,255,0));transform:rotate(18deg)"></div></div>
      </div>
      <div class="zone" data-layout-allow-overlap>
        <span class="line"><span id="s1-l1" class="t-sans split">Apple ti fa</span></span>
        <span class="line" style="margin-top:-118px"><span id="s1-l2"><span class="t-it" style="font-size:112px">spendere</span></span></span>
        <span class="line" style="margin-top:-20px"><span id="s1-l3"><span class="t-sans t-mut" id="s1-mig">migliaia di</span><span class="t-sans split acc" id="s1-euro">euro</span></span></span>
      </div>
      <div id="s1-sel" class="sel" style="left:628px;top:486px;width:194px;height:96px">''' + SEL + '''</div>
      <div id="s1-cur" class="cur" style="left:792px;top:556px">''' + CURSOR + '''</div>
    </div>''','''
    tl.set(L("#s1-l1"), { opacity: 1 }, 0);
    tl.fromTo("#s1-ph", { rotationY: -18, rotationX: 6, y: 40, scale: 0.94 }, { rotationY: 14, rotationX: -2, y: -10, scale: 1.0, duration: 2.5, ease: "power2.out" }, 0);
    tl.fromTo("#s1-gl", { x: 0 }, { x: 1100, duration: 1.1, ease: "power2.inOut" }, 0.5);
    tl.fromTo("#s1-shadow", { scaleX: 0.8, opacity: 0.7 }, { scaleX: 1.05, opacity: 1, duration: 2.5, ease: "power2.out" }, 0);
    sink(tl, "#s1-l1", 0.62);
    rise(tl, "#s1-l2", 0.72);
    tl.set("#s1-l3", { yPercent: 115 }, 0);
    rise(tl, "#s1-l3", 1.24);
    tl.set("#s1-euro", { opacity: 1 }, 0);
    tl.set(L("#s1-euro"), { opacity: 0 }, 0);
    flip(tl, "#s1-euro", 1.96, 0.05);
    select(tl, "#s1-sel", "#s1-cur", 2.12);
    tl.to("#s1-stage", { x: -1080, duration: 0.24, ease: "power3.in" }, 2.29);''')
# ---------- s2 "e tu la ringrazi pure" (2.53 - 3.99): dark scene, a sent message with a heart ----------
HEART = '<svg viewBox="0 0 24 24" width="62" height="62"><path d="M12 21s-7.5-4.7-10-9.3C.3 8.4 1.9 4.5 5.6 4c2.2-.3 4.2.8 5.4 2.6h2C14.2 4.8 16.2 3.7 18.4 4c3.7.5 5.3 4.4 3.6 7.7C19.5 16.3 12 21 12 21z" fill="#ff375f"/></svg>'
S['s2']=(1.46,'''
    <div id="s2-w" style="position:absolute;inset:0;overflow:hidden;background:#000">
      <div id="s2-st" style="position:absolute;inset:0">
        <div class="zone" data-layout-allow-overlap>
          <span class="line"><span id="s2-l1" class="t-sans" style="color:#86868b">e tu la</span></span>
          <span class="line" style="margin-top:-18px"><span id="s2-l2" class="t-it" style="font-size:112px;color:#f5f5f7">ringrazi pure</span></span>
        </div>
        <div id="s2-bub" style="position:absolute;right:130px;top:960px">
          <div class="bub"><span>Grazie Apple</span></div>
          <div id="s2-tap" style="position:absolute;left:-56px;top:-62px;width:124px;height:108px;border-radius:54px;background:#3a3a3c;display:flex;align-items:center;justify-content:center"><div id="s2-hr" style="width:62px;height:62px">''' + HEART + '''</div></div>
        </div>
        <div id="s2-del" style="position:absolute;right:134px;top:1196px;font:500 40px/1 Inter;color:#8e8e93">Consegnato</div>
      </div>
    </div>''','''
    tl.fromTo("#s2-w", { x: 1080 }, { x: 0, duration: 0.26, ease: "power3.out" }, 0);
    tl.fromTo("#s2-st", { scale: 1.0 }, { scale: 1.07, duration: 1.46, ease: "none" }, 0);
    rise(tl, "#s2-l1", 0.06);
    rise(tl, "#s2-l2", 0.36);
    tl.fromTo("#s2-bub", { opacity: 0, scale: 0.3, y: 160, transformOrigin: "100% 100%" }, { opacity: 1, scale: 1, y: 0, duration: 0.42, ease: "back.out(1.9)" }, 0.5);
    tl.fromTo("#s2-del", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.84);
    tl.fromTo("#s2-tap", { scale: 0, transformOrigin: "70% 100%" }, { scale: 1, duration: 0.34, ease: "back.out(3)" }, 0.93);
    tl.fromTo("#s2-hr", { scale: 0.6 }, { scale: 1.18, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1 }, 1.02);
    tl.to("#s2-w", { scale: 1.25, opacity: 0, duration: 0.18, ease: "power3.in" }, 1.28);''','''
    .bub { position: relative; padding: 44px 66px 50px; border-radius: 80px; background: #0a84ff; color: #fff; font: 500 104px/1 "Inter Display"; letter-spacing: -0.02em; white-space: nowrap; }
    .bub span { position: relative; z-index: 2; }
    .bub::before { content: ""; position: absolute; z-index: 0; bottom: 0; right: -26px; width: 70px; height: 70px; background: #0a84ff; border-bottom-left-radius: 52px; }
    .bub::after { content: ""; position: absolute; z-index: 1; bottom: 0; right: -36px; width: 36px; height: 72px; background: #000; border-bottom-left-radius: 36px; }''')
# ---------- s3 five tricks (3.99 - 9.12) ----------
S['s3']=(5.13,'''
    <div class="zone" data-layout-allow-overlap>
      <span class="line"><span id="s3-l1" class="t-sans split">Questi sono i</span></span>
      <span class="line" style="margin-top:-118px"><span id="s3-l3"><span class="t-it">l'ultimo</span> <span class="t-sans t-mut">è il più</span></span></span>
    </div>
    <div id="s3-num" data-layout-allow-overlap style="position:absolute;left:340px;top:620px;width:400px;height:470px;overflow:hidden">
      <div id="s3-col" style="position:absolute;left:0;top:0;width:400px;text-align:center;font:600 430px/470px Inter;letter-spacing:-0.06em;color:#1d1d1f"><div>1</div><div>2</div><div>3</div><div>4</div><div id="s3-five">5</div></div>
    </div>
    <div class="zone" data-layout-allow-overlap style="top:1130px">
      <span class="line"><span id="s3-l2"><span class="t-sans t-mut" style="font-size:72px">trucchi che usa</span> <span class="t-it" id="s3-sdt" style="font-size:72px">su di te</span></span></span>
    </div>
    <div id="s3-sel" class="sel" style="left:350px;top:640px;width:380px;height:430px">''' + SEL + '''</div>
    <div id="s3-cur" class="cur" style="left:700px;top:1000px">''' + CURSOR + '''</div>
    <div id="s3-pill" class="pill" style="left:610px;top:560px">geniale</div>''','''
    tl.set("#s3-l3", { yPercent: 115 }, 0);
    flip(tl, "#s3-l1", 0.0, 0.025);
    tl.fromTo("#s3-col", { y: 0 }, { y: -470 * 4, duration: 0.62, ease: "expo.out" }, 0.66);
    rise(tl, "#s3-l2", 1.02);
    tl.fromTo("#s3-sdt", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 1.86);
    sink(tl, "#s3-l1", 2.5);
    sink(tl, "#s3-l2", 2.5);
    rise(tl, "#s3-l3", 2.6);
    tl.to("#s3-five", { color: "#7a0f24", duration: 0.25 }, 3.15);
    select(tl, "#s3-sel", "#s3-cur", 3.2);
    pop(tl, "#s3-pill", 3.63);
    tl.to(["#s3-sel", "#s3-cur", "#s3-pill", "#s3-l3"], { opacity: 0, duration: 0.15 }, 4.6);
    tl.to("#s3-num", { scale: 14, duration: 0.5, ease: "power3.in" }, 4.63);''')
# ---------- s4 calendar, continuous scroll (9.12 - 13.45) ----------
def month(name, start_dow, days, hot=None, yearbox=False):
    cells=['<div></div>']*start_dow
    for d in range(1,days+1):
        we=(start_dow+d-1)%7>=5
        if d==hot:
            cells.append(f'<div class="dd" style="position:relative"><svg id="s4-ring" viewBox="0 0 100 100" style="position:absolute;left:50%;top:50%;width:104px;height:104px;margin:-52px 0 0 -52px"><circle cx="50" cy="50" r="44" fill="#ff3b30"/></svg><span style="position:relative;color:#fff;font-weight:600">{d}</span><div id="s4-ev" style="position:absolute;left:-30px;top:78px;white-space:nowrap;font:600 24px/1 Inter;color:#c81e15;padding:7px 12px;border-left:5px solid #ff3b30;border-radius:6px;background:rgba(255,59,48,0.12)">Evento Apple</div></div>')
        else:
            cells.append(f'<div class="dd"{" style=\"color:#8e8e93\"" if we else ""}>{d}</div>')
    yb = '<span id="s4-yb" style="display:inline-block;height:96px;overflow:hidden;vertical-align:bottom"><span id="s4-ys" style="display:block"><span style="display:block">2023</span><span style="display:block">2024</span><span style="display:block">2025</span><span style="display:block">2026</span></span></span>' if yearbox else '<span>2023</span>'
    return f'<div class="mo"><div class="mh">{name} {yb}</div><div class="wd"><div>L</div><div>M</div><div>M</div><div>G</div><div>V</div><div>S</div><div>D</div></div><div class="gr">{"".join(cells)}</div></div>'
cal = month('Luglio',5,31) + month('Agosto',1,31) + month('Settembre',4,30,hot=9,yearbox=True)
S['s4']=(4.33,'''
    <div id="s4-cam" data-layout-allow-overlap data-layout-allow-overflow style="position:absolute;inset:0;transform-origin:50% 52%">
      <div id="s4-strip" style="position:absolute;left:70px;right:70px;top:0">''' + cal + '''</div>
    </div>
    <div id="s4-mask" data-layout-allow-overlap style="position:absolute;left:0;right:0;top:0;height:640px;background:linear-gradient(#fff 82%,rgba(255,255,255,0))"></div>
    <div class="zone" data-layout-allow-overlap>
      <span class="line"><span id="s4-l1"><span class="t-sans" style="color:#ff3b30">01</span> <span class="t-it">settembre.</span></span></span>
      <span class="line" style="margin-top:-118px"><span id="s4-l2"><span class="t-sans">nuovo</span> <span class="t-sans split acc" id="s4-iph">iPhone</span></span></span>
    </div>
    <div id="s4-ph" data-layout-allow-overlap style="position:absolute;left:0;top:250px;width:1080px;height:1920px;mix-blend-mode:multiply;z-index:2"><video id="s4-phi" class="clip" src="assets/video/ip18-spin-reveal.mp4" data-start="3.1" data-duration="1.23" muted playsinline style="position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover"></video></div>''','''
    tl.set("#s4-l2", { yPercent: 115 }, 0);
    tl.set("#s4-ph", { opacity: 0 }, 0);
    /* the camera scrolls down through the calendar app and lands on September */
    tl.fromTo("#s4-strip", { y: 560 }, { y: -1640, duration: 0.85, ease: "power3.inOut" }, 0.0);
    rise(tl, "#s4-l1", 0.55);
    tl.fromTo("#s4-ring", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.42, ease: "back.out(2.4)" }, 0.66);
    tl.fromTo("#s4-ev", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3, ease: "expo.out" }, 0.82);
    tl.fromTo("#s4-cam", { scale: 1 }, { scale: 1.16, duration: 1.9, ease: "power2.inOut" }, 1.0);
    [1.94, 2.71, 3.2].forEach((t, k) => { tl.to("#s4-ys", { y: -96 * (k + 1), duration: 0.26, ease: "power3.inOut" }, t); tl.fromTo("#s4-ring", { scale: 0.7 }, { scale: 1, duration: 0.32, ease: "back.out(2.6)" }, t + 0.04); });
    /* "nuovo iPhone": the calendar drops away and the 18 Pro rises in, turning */
    sink(tl, "#s4-l1", 3.08);
    rise(tl, "#s4-l2", 3.14);
    tl.set(L("#s4-iph"), { opacity: 0 }, 0);
    flip(tl, "#s4-iph", 3.62, 0.04);
    tl.to("#s4-cam", { y: 900, opacity: 0, duration: 0.45, ease: "power3.in" }, 3.12);
    tl.fromTo("#s4-ph", { opacity: 1, y: 1100, scale: 0.9 }, { opacity: 1, y: 0, scale: 1.08, duration: 0.7, ease: "expo.out", immediateRender: false }, 3.22);
    tl.to("#s4-ph", { y: -1900, duration: 0.26, ease: "power3.in" }, 4.06);
    tl.to("#s4-l2", { y: -1500, duration: 0.26, ease: "power3.in" }, 4.06);''','''
    .mo { padding: 40px 0 70px; }
    .mh { font: 700 92px/96px "Inter"; letter-spacing: -0.035em; color: #ff3b30; }
    .wd { margin-top: 30px; display: grid; grid-template-columns: repeat(7,1fr); font: 600 30px/1 "Inter"; color: #8e8e93; text-align: center; padding-bottom: 16px; border-bottom: 2px solid #e5e5ea; }
    .gr { display: grid; grid-template-columns: repeat(7,1fr); font: 400 54px/1 "Inter"; text-align: center; }
    .gr > div { height: 150px; padding-top: 34px; border-bottom: 2px solid #f2f2f4; }''')
# ---------- s5 lineup (13.45 - 15.39) ----------
S['s5']=(1.94,'''
    <div class="zone" data-layout-allow-overlap>
      <span class="line"><span id="s5-l1"><span class="t-sans">ogni anno, un colore</span></span></span>
      <span class="line" style="margin-top:-24px"><span id="s5-l2" class="t-it split acc" style="font-size:110px">nuovo</span></span>
    </div>
    <div id="s5-row" style="position:absolute;left:0;right:0;top:760px;height:720px;perspective:1800px">
      <div class="p5" id="s5-p1" style="left:10px"><img src="assets/img/ip14-purple.png" alt="" /><b>2022</b></div>
      <div class="p5" id="s5-p2" style="left:205px"><img src="assets/img/ip15-natural.png" alt="" /><b>2023</b></div>
      <div class="p5" id="s5-p3" style="left:400px"><img src="assets/img/ip16-desert.png" alt="" /><b>2024</b></div>
      <div class="p5" id="s5-p4" style="left:595px"><img src="assets/img/ip17-orange-v2.png" alt="" /><b>2025</b></div>
      <div class="p5" id="s5-p5" style="left:770px"><img src="assets/img/ip18-burg-a.png" alt="" /><b style="color:#7a0f24">2026</b></div>
    </div>
    <div id="s5-sel" class="sel" style="left:772px;top:770px;width:296px;height:560px">''' + SEL + '''</div>''','''
    tl.set(L("#s5-l2"), { opacity: 0 }, 0);
    rise(tl, "#s5-l1", 0.04);
    for (let k = 1; k <= 5; k++) tl.fromTo("#s5-p" + k, { x: 900, rotationY: -55, opacity: 0 }, { x: 0, rotationY: 0, opacity: 1, duration: 0.55, ease: "expo.out" }, 0.05 + (k - 1) * 0.13);
    flip(tl, "#s5-l2", 1.3, 0.05);
    tl.to(["#s5-p1", "#s5-p2", "#s5-p3", "#s5-p4"], { opacity: 0.35, duration: 0.25 }, 1.25);
    select(tl, "#s5-sel", null, 1.42);''','''
    .p5 { position: absolute; top: 0; width: 300px; }
    .p5 img { width: 100%; display: block; }
    .p5 b { position: absolute; left: 0; right: 0; top: 590px; text-align: center; font: 600 40px/1 "Inter"; color: #8e8e93; }''')
# ---------- s6 presenter, then the battery card (15.39 - 17.26) ----------
S['s6']=(1.87,'''
    <video id="s6-vid" class="clip" src="assets/video/presenter-white.mp4" data-start="0" data-duration="1.87" data-media-start="0.4" muted playsinline style="position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover"></video>
    <div id="s6-sheet" style="position:absolute;inset:0;background:#fff">
      <div class="zone" data-layout-allow-overlap><span class="line"><span id="s6-l1"><span class="t-sans t-mut">funziona</span> <span class="t-it">benissimo</span></span></span></div>
      <div id="s6-bat" style="position:absolute;left:250px;top:820px;width:520px;height:250px">
        <div style="position:absolute;left:0;top:0;width:470px;height:250px;border:14px solid #1d1d1f;border-radius:64px;padding:16px"><div id="s6-fill" style="width:100%;height:100%;border-radius:40px;background:#34c759;transform-origin:left center"></div></div>
        <div style="position:absolute;left:482px;top:80px;width:30px;height:90px;border-radius:0 18px 18px 0;background:#1d1d1f"></div>
      </div>
      <div id="s6-pct" style="position:absolute;left:0;right:0;top:1140px;text-align:center;font:600 120px/1 Inter;letter-spacing:-0.04em"><span id="s6-n">100</span>%</div>
    </div>''','''
    tl.fromTo("#s6-sheet", { yPercent: 100 }, { yPercent: 0, duration: 0.45, ease: "expo.out" }, 0.78);
    tl.set("#s6-l1", { yPercent: 115 }, 0);
    rise(tl, "#s6-l1", 1.02);
    tl.fromTo("#s6-fill", { scaleX: 0.15 }, { scaleX: 1, duration: 0.8, ease: "power2.out" }, 0.95);''')
# ---------- s7 last year's phone (17.26 - 19.66) ----------
S['s7']=(2.40,'''
    <div class="zone" data-layout-allow-overlap>
      <span class="line"><span id="s7-l1" class="t-sans">ma adesso si vede</span></span>
      <span class="line" style="margin-top:-24px"><span id="s7-l1b" class="t-sans">che è quello</span></span>
      <span class="line" style="margin-top:-24px"><span id="s7-l2" class="t-it" style="font-size:88px;color:#86868b">dell'anno scorso</span></span>
    </div>
    <div id="s7-ph" style="position:absolute;left:290px;top:800px;width:540px;perspective:1600px"><div id="s7-in" style="position:relative"><img src="assets/img/ip17-orange-v2.png" style="width:100%;display:block" alt="" /><img id="s7-g" src="assets/img/ip17-orange-grey.png" style="position:absolute;inset:0;width:100%;display:block" alt="" /></div></div>
    <div id="s7-sel" class="sel" style="left:315px;top:810px;width:450px;height:830px">''' + SEL + '''</div>
    <div id="s7-pill" class="pill" style="left:640px;top:760px;background:#1d1d1f">2025</div>''','''
    rise(tl, "#s7-l1", 0.0);
    rise(tl, "#s7-l1b", 0.75);
    rise(tl, "#s7-l2", 1.26);
    tl.fromTo("#s7-in", { rotationY: -22, scale: 1.06 }, { rotationY: 8, scale: 0.98, duration: 2.4, ease: "power2.out" }, 0);
    tl.fromTo("#s7-g", { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power2.inOut" }, 0.5);
    select(tl, "#s7-sel", null, 1.2);
    pop(tl, "#s7-pill", 1.3);''')
for sid,v in S.items():
    dur,body,script=v[0],v[1],v[2]; css=v[3] if len(v)>3 else ''
    open(OUT+sid+'.html','w').write(scene(sid,dur,body,script,css))
print('written', list(S))
