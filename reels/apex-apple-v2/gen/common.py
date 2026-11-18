# shared style + motion helpers injected into every scene of apex-apple-v2
CSS = r'''
    #root { position: absolute; inset: 0; background: #fff; overflow: hidden; font-family: "Inter"; color: #1d1d1f; }
    .zone { z-index: 5; position: absolute; left: 80px; right: 80px; top: 372px; text-align: center; }
    .line { display: block; overflow: hidden; padding: 6px 0 14px; font: 500 82px/1.06 "Inter"; }
    .line > span > span:not(.ch) + span:not(.ch) { margin-left: 0.22em; }
    .line > span { display: inline-block; }
    .t-sans { font: 500 82px/1.06 "Inter"; letter-spacing: -0.035em; }
    .t-it { font: italic 400 92px/1.0 "Playfair Display"; letter-spacing: -0.01em; }
    .t-big { font: 600 96px/1.0 "Inter"; letter-spacing: -0.045em; }
    .acc { color: #7a0f24; }
    .ch { display: inline-block; white-space: pre; }
    .sel { position: absolute; border: 3px dashed #ff3b30; pointer-events: none; opacity: 0; }
    .sel i { position: absolute; width: 16px; height: 16px; background: #fff; border: 3px solid #ff3b30; }
    .sel i:nth-child(1) { left: -10px; top: -10px; } .sel i:nth-child(2) { right: -10px; top: -10px; }
    .sel i:nth-child(3) { left: -10px; bottom: -10px; } .sel i:nth-child(4) { right: -10px; bottom: -10px; }
    .cur { position: absolute; width: 54px; height: 54px; opacity: 0; }
    .pill { position: absolute; padding: 14px 26px; border-radius: 999px; background: #7a0f24; color: #fff; font: 600 44px/1 "Inter"; letter-spacing: -0.02em; opacity: 0; white-space: nowrap; }
'''
CURSOR = '<svg viewBox="0 0 24 24" width="54" height="54"><path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.7 L11.6 14 L17.5 14 Z" fill="#1d1d1f" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>'
SEL = '<i></i><i></i><i></i><i></i>'
JS = r'''
    /* split every .split element into letter spans once, before the timeline is built */
    document.querySelectorAll(".split:not([data-done])").forEach((el) => { el.setAttribute("data-done", "1"); const txt = el.textContent; el.textContent = ""; for (const c of txt) { const s = document.createElement("span"); s.className = "ch"; s.textContent = c; el.appendChild(s); } });
    const L = (sel) => document.querySelectorAll(sel + " .ch");
    /* letters flip up into place one by one (the reference's per-letter entrance) */
    const flip = (tl, sel, t, st) => tl.fromTo(L(sel), { opacity: 0, y: 46, rotation: -24, scale: 0.55, transformOrigin: "50% 100%" }, { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.42, ease: "back.out(2.2)", stagger: st || 0.03 }, t);
    /* a whole line rises from behind its own baseline mask */
    const rise = (tl, sel, t) => tl.fromTo(sel, { yPercent: 115 }, { yPercent: 0, duration: 0.55, ease: "expo.out" }, t);
    const sink = (tl, sel, t) => tl.to(sel, { yPercent: -115, duration: 0.3, ease: "power3.in" }, t);
    /* dashed selection box with handles, then a cursor that clicks it */
    const select = (tl, box, cur, t) => { tl.fromTo(box, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.22, ease: "power3.out" }, t); if (cur) { tl.fromTo(cur, { opacity: 0, x: 160, y: 140 }, { opacity: 1, x: 0, y: 0, duration: 0.38, ease: "power3.out" }, t - 0.12); tl.to(cur, { scale: 0.82, duration: 0.07, yoyo: true, repeat: 1 }, t + 0.28); } };
    const pop = (tl, sel, t) => tl.fromTo(sel, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.36, ease: "back.out(2.4)" }, t);
'''
def scene(sid, dur, body, script, css=''):
    return f'''<template>
  <style>
{CSS.replace('#root', '#root')}
{css}
  </style>
  <div id="root" data-composition-id="{sid}" data-width="1080" data-height="1920">
{body}
  </div>
  <script>
{JS.replace('ROOTID', 'root')}
    const tl = gsap.timeline({{ paused: true }});
{script}
    window.__timelines["{sid}"] = tl;
  </script>
</template>
'''
