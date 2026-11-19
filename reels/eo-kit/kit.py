# shared builder for the Essenza d'Oriente reels: layout helpers, scene registry, index writer.
# Every reel is a loop: the last scene continues the footage that opens the first one, and the last spoken line leads into the first.
import re, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import scene, CSS
INK = '#142019'; BOSCO = '#2C5138'; SALVIA = '#D6E6C0'; ORO = '#B99A45'; CUORE = '#C0392B'; PAPER = '#F4F2EC'; MUT = '#71796F'

def ln(i, html, cls='t-sans', style='', mt=None):
    m = f' style="margin-top:{mt}px"' if mt is not None else ''
    st = f' style="{style}"' if style else ''
    return f'<span class="line"{m}><span id="{i}" class="{cls}"{st}>{html}</span></span>'

def zone(*lines, top=330):
    return f'<div class="zone" data-layout-allow-overlap style="top:{top}px">' + ''.join(lines) + '</div>'

def vid(i, src, dur, mstart=0, shade=''):
    return (f'<div class="vid" id="{i}-w" data-layout-allow-overlap><video id="{i}" class="clip" src="assets/video/{src}" data-start="0" data-duration="{dur:.2f}" data-media-start="{mstart}" muted playsinline></video></div>'
            + ('' if shade == 'none' else f'<div class="shade {shade}"></div>'))

def star(i, left, top, size, color=ORO):
    return (f'<svg class="star" id="{i}" viewBox="0 0 24 24" width="{size}" height="{size}" style="position:absolute;left:{left}px;top:{top}px;opacity:0" data-layout-allow-overlap>'
            f'<path d="M12 0 C12.8 7 17 11.2 24 12 C17 12.8 12.8 17 12 24 C11.2 17 7 12.8 0 12 C7 11.2 11.2 7 12 0 Z" fill="{color}"/></svg>')

def starjs(sel, t):
    return (f'    tl.fromTo("{sel}", {{ opacity: 0, scale: 0, rotation: -90 }}, {{ opacity: 1, scale: 1, rotation: 0, duration: 0.34, ease: "back.out(3)", stagger: 0.08 }}, {t});\n'
            f'    tl.to("{sel}", {{ scale: 0.6, duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut", stagger: 0.11 }}, {t} + 0.42);\n')

WA_ICON = ('<svg viewBox="0 0 64 64" width="84" height="84"><circle cx="32" cy="32" r="30" fill="#0B2A17"/>'
           '<path d="M32 15 a17 16.500 0 1 1 -8.200 31 L15 48.500 l2.600 -8.300 A16.500 16.500 0 0 1 32 15 Z" fill="#25D366"/>'
           '<path d="M25.500 25.500 q0.500 12.500 13.500 13.500" stroke="#0B2A17" stroke-width="5.500" stroke-linecap="round" fill="none"/></svg>')

def wa(i, top):
    return f'<div class="wa" id="{i}" style="top:{top}px" data-layout-allow-overlap>{WA_ICON}<span><small>Scrivici su WhatsApp</small>331 715 3533</span></div>'

def lockup(i, top, full=True, color=PAPER):
    extra = (f'<div id="{i}-rule" style="width:420px;height:3px;background:{ORO};margin:30px auto 26px;transform-origin:center"></div>'
             f'<div style="font:500 40px/1.3 Jost;color:{color}">Via San Lorenzo 46 · Alessandria</div>'
             f'<div style="font:500 36px/1.3 Jost;color:{color};opacity:0.72;margin-top:8px">5,0 <span style="color:{ORO}">★</span> · 146 recensioni Google</div>') if full else ''
    return (f'<div id="{i}" style="position:absolute;left:0;right:0;top:{top}px;text-align:center" data-layout-allow-overlap>'
            f'<div style="font:500 96px/1.05 Fraunces;letter-spacing:-0.025em;color:{color}">Essenza d’Oriente</div>'
            f'<div style="font:400 50px/1.3 \'EO Han\';letter-spacing:0.14em;margin-top:14px;color:{color}">东方之<span style="color:{CUORE}">心</span>养生馆</div>{extra}</div>')

class Reel:
    def __init__(self, T):
        self.T = T; self.SC = []; self.over = None
    def add(self, sid, k0, k1, body, js, css='', fx=(), ink=False, cam=True):
        T = self.T; start, end = T[k0], T[k1]
        dur = round(end - start, 3)
        f = lambda s: re.sub(r'«(\w+)»', lambda m: '%.2f' % (T[m.group(1)] - start), s)
        inner = f(body)
        if cam:
            inner = f'<div id="{sid}-cam" class="cam" data-layout-allow-overlap>\n' + inner + '\n    </div>'
            js = f'    tl.fromTo("#{sid}-cam", {{ scale: 1 }}, {{ scale: 1.05, duration: DUR, ease: "none" }}, 0);\n' + js
        b = f'    <div id="{sid}-st" class="st{" ink" if ink else ""}" data-layout-allow-overlap>\n' + inner + '\n    </div>'
        # behind a moving scene show the scene's own ground, so a transition never flashes the other colour
        css = ('    #root { background: %s !important; }\n' % (INK if (ink or 'class="vid"' in body) else PAPER)) + css
        self.SC.append(dict(id=sid, start=start, dur=dur, body=b, js=f(js).replace('DUR', '%.2f' % dur), css=css,
                            fx=[(n, round(T[k] + o, 3), v) for n, k, o, v in fx]))
    def overlay(self, body, js, css=''):
        """one transparent layer above every scene for the whole reel (snow, lights); must be periodic over the reel so the loop is seamless"""
        self.over = dict(body=body, js=js, css='    #root { background: transparent !important; }\n' + css)
    def build(self, P, bed=0.2):
        T = self.T; END = T['END']
        for s in self.SC:
            open(P + 'compositions/' + s['id'] + '.html', 'w').write(scene(s['id'], s['dur'], s['body'], s['js'], s['css']))
        hosts = [f'<div id="{s["id"]}" data-composition-id="{s["id"]}" data-composition-src="compositions/{s["id"]}.html" data-start="{s["start"]}" data-duration="{s["dur"]}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>' for s in self.SC]
        if self.over:
            o = self.over
            open(P + 'compositions/over.html', 'w').write(scene('over', END, o['body'], o['js'].replace('DUR', '%.2f' % END), o['css']))
            hosts.append(f'<div id="over" data-composition-id="over" data-composition-src="compositions/over.html" data-start="0" data-duration="{END}" data-track-index="2" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:50;pointer-events:none"></div>')
        FF = '\n'.join('      ' + l.strip() for l in CSS.split('\n') if '@font-face' in l)
        DUR = {'whoosh-short': 0.5, 'whoosh': 0.55, 'whoosh-cinematic': 1.0, 'key-press': 0.4, 'click-soft': 0.35, 'click': 0.36, 'pop': 0.6, 'typing': 0.75, 'sparkle': 1.2, 'impact-bass-1': 1.6, 'ping': 1.3, 'riser': 1.4}
        new = sorted((max(0.0, t), n, v) for s in self.SC for n, t, v in s['fx'])
        busy = {k: 0.0 for k in range(12, 26)}; fxs = []
        for k, (t, n, v) in enumerate(new):
            d = min(DUR[n], END - t)
            if d <= 0.05: continue
            tr = next(x for x in busy if busy[x] <= t); busy[tr] = t + d + 0.02
            fxs.append(f'<audio id="fx{k}" src="assets/sfx/{n}.mp3" data-start="{t}" data-duration="{d:.2f}" data-volume="{v}" data-track-index="{tr}"></audio>')
        html = f'''<!doctype html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
{FF}
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: {INK}; }}
      #root {{ position: relative; width: 1080px; height: 1920px; overflow: hidden; background: {INK}; font-family: "Jost"; color: {INK}; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{END}" data-width="1080" data-height="1920" data-motion-blur="on">
      ''' + '\n      '.join(hosts) + f'''
      <audio id="vo" src="assets/audio/vo.mp3" data-start="0" data-duration="{END - 0.02:.2f}" data-volume="1" data-track-index="10"></audio>
      <audio id="bed" src="assets/audio/bed.mp3" data-start="0" data-duration="{END - 0.02:.2f}" data-volume="{bed}" data-track-index="11"></audio>
      ''' + '\n      '.join(fxs) + '''
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
'''
        open(P + 'index.html', 'w').write(html)
        print('scenes', len(hosts), 'fx', len(fxs), 'dur', END)
