# scene registry and index writer for apex-iphone-duo. Times written as «key» are named voice moments (times.py),
# converted to scene-local seconds when a scene is registered.
import re, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import scene, CSS, CURSOR
INK = '#1d1d1f'; GREY = '#86868b'; BLUE = '#0071e3'; BURG = '#7a0f24'; NAVY = '#1d2a57'; GREEN = '#1d8a3c'; PAPER = '#f5f5f7'

def ln(i, html, cls='t', style='', mt=None):
    m = f' style="margin-top:{mt}px"' if mt is not None else ''
    st = f' style="{style}"' if style else ''
    return f'<span class="line"{m}><span id="{i}" class="{cls}"{st}>{html}</span></span>'

def zone(*lines, top=360):
    return f'<div class="zone" data-layout-allow-overlap style="top:{top}px">' + ''.join(lines) + '</div>'

def vid(i, src, dur, mstart=0, shade=True):
    return (f'<div class="vid" id="{i}-w" data-layout-allow-overlap><video id="{i}" class="clip" src="assets/video/{src}" data-start="0" data-duration="{dur:.2f}" data-media-start="{mstart}" muted playsinline></video></div>'
            + ('<div class="shade"></div>' if shade else ''))

def duo(i, left, top, scale=1.0, shadow=True):
    """the 3D foldable: 1400x1037 when open; drive it with duoSet("#id", angle) / fold(tl, "#id", a0, a1, t, d)"""
    return (f'<div class="duo" id="{i}" data-motion-blur="off" data-layout-allow-overlap style="left:{left}px;top:{top}px{'' if scale is None else ';transform:scale(%s)' % scale}">'
            + (f'<div class="duo-sh" id="{i}-sh"></div>' if shadow else '')
            + f'<div class="duo-g" id="{i}-g">'
            f'<div class="duo-h duo-r"><div class="f in" style="background-image:url(assets/img/duo-inner-r.png)"></div><div class="f out" style="background-image:url(assets/img/duo-back.png)"></div></div>'
            f'<div class="duo-h duo-l" id="{i}-l"><div class="f in" id="{i}-li" style="background-image:url(assets/img/duo-inner-l.png)"></div><div class="f out" id="{i}-lo" style="background-image:url(assets/img/duo-outer.png)"></div></div>'
            '</div></div>')

class Reel:
    def __init__(self, T):
        self.T = T; self.SC = []
    def add(self, sid, k0, k1, body, js, css='', fx=(), ground='white', cam=True):
        T = self.T; start, end = T[k0], T[k1]
        dur = round(end - start, 3)
        f = lambda s: re.sub(r'«(\w+)»', lambda m: '%.2f' % (T[m.group(1)] - start), s)
        inner = f(body)
        if cam:
            inner = f'<div id="{sid}-cam" class="cam" data-layout-allow-overlap>\n' + inner + '\n    </div>'
            js = f'    tl.fromTo("#{sid}-cam", {{ scale: 1 }}, {{ scale: 1.045, duration: DUR, ease: "none" }}, 0);\n' + js
        cls = {'white': '', 'grey': ' grey', 'dark': ' dark'}[ground]
        col = {'white': '#fff', 'grey': '#f5f5f7', 'dark': '#000'}[ground]
        b = f'    <div id="{sid}-st" class="st{cls}" data-layout-allow-overlap>\n' + inner + '\n    </div>'
        css = f'    #root {{ background: {col} !important; }}\n' + css
        self.SC.append(dict(id=sid, start=start, dur=dur, body=b, js=f(js).replace('DUR', '%.2f' % dur), css=css,
                            fx=[(n, round(T[k] + o, 3), v) for n, k, o, v in fx]))
    def build(self, P, bed=0.07):
        T = self.T; END = T['END']
        for s in self.SC:
            open(P + 'compositions/' + s['id'] + '.html', 'w').write(scene(s['id'], s['dur'], s['body'], s['js'], s['css']))
        hosts = [f'<div id="{s["id"]}" data-composition-id="{s["id"]}" data-composition-src="compositions/{s["id"]}.html" data-start="{s["start"]}" data-duration="{s["dur"]}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>' for s in self.SC]
        FF = '\n'.join('      ' + l.strip() for l in CSS.split('\n') if '@font-face' in l)
        DUR = {'whoosh-short': 0.5, 'whoosh': 0.55, 'whoosh-cinematic': 1.0, 'key-press': 0.4, 'click-soft': 0.35, 'click': 0.36, 'pop': 0.6, 'typing': 0.75, 'sparkle': 1.2,
               'impact-bass-1': 1.6, 'ping': 1.3, 'riser': 1.4, 'hinge': 0.6, 'boom': 1.6, 'anchor': 1.6, 'clink': 1.6, 'register': 0.9, 'swipe': 1.5, 'counter': 1.2,
               'cash': 0.9, 'ding': 0.9, 'swoosh': 0.55, 'thud': 0.5, 'tick': 0.2}
        # heavy hits sit under the voice: they are scaled down here so that no effect is louder than the narration
        GAIN = {'boom': 0.34, 'impact-bass-1': 0.45, 'thud': 0.6, 'anchor': 0.55, 'register': 0.55, 'whoosh-cinematic': 0.6, 'ding': 0.7, 'counter': 0.6, 'whoosh': 0.8, 'swipe': 0.8, 'pop': 0.85}
        new = sorted((max(0.0, t), n, round(v * GAIN.get(n, 1.0), 3)) for s in self.SC for n, t, v in s['fx'])
        busy = {k: 0.0 for k in range(12, 30)}; fxs = []
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
      html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: #000; }}
      #root {{ position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #000; font-family: "SF Pro Display"; color: #1d1d1f; }}
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
