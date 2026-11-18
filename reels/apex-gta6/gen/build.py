# builds apex-gta6: writes every scene and index.html (root timeline, voice, music bed, micro-sounds)
import sys
sys.path.insert(0, '.')
import scenes
from common import scene, CSS
from times import T
P = '/home/user/Apexmedia-website/reels/apex-gta6/'
for s in scenes.SC:
    open(P + 'compositions/' + s['id'] + '.html', 'w').write(scene(s['id'], s['dur'], s['body'], s['js'], s['css']))
END = T['END']
FF = '\n'.join('      ' + l.strip() for l in CSS.split('\n') if '@font-face' in l)
hosts = [f'<div id="{s["id"]}" data-composition-id="{s["id"]}" data-composition-src="compositions/{s["id"]}.html" data-start="{s["start"]}" data-duration="{s["dur"]}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>' for s in scenes.SC]
DUR = {'whoosh-short': 0.5, 'whoosh': 0.55, 'whoosh-cinematic': 1.0, 'key-press': 0.4, 'click-soft': 0.35, 'click': 0.36, 'pop': 0.6, 'typing': 0.75, 'sparkle': 1.2, 'impact-bass-1': 1.6, 'ping': 1.3, 'riser': 1.4}
new = sorted((max(0.0, t), n, v) for s in scenes.SC for n, t, v in s['fx'])
busy = {k: 0.0 for k in range(12, 22)}; fxs = []
for k, (t, n, v) in enumerate(new):
    d = min(DUR[n], END - t)
    if d <= 0.05: continue
    tr = next(x for x in busy if busy[x] <= t); busy[tr] = t + d + 0.02
    fxs.append(f'<audio id="fx{k}" src="assets/sfx/{n}.mp3" data-start="{t}" data-duration="{d:.2f}" data-volume="{v}" data-track-index="{tr}"></audio>')
html = f'''<!doctype html>
<html lang="it" data-composition-variables='[
  {{"id":"color-ground","type":"color","label":"Sfondo","default":"#07040d"}},
  {{"id":"color-accent","type":"color","label":"Accento","default":"#ff2d95"}}
]'>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
{FF}
      :root {{ --color-ground: #07040d; --color-accent: #ff2d95; --sans: "SF Pro Display"; }}
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: var(--color-ground); }}
      #root {{ position: relative; width: 1080px; height: 1920px; overflow: hidden; background: var(--color-ground); font-family: var(--sans); color: #fff; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{END}" data-width="1080" data-height="1920" data-motion-blur="on">
      ''' + '\n      '.join(hosts) + f'''
      <audio id="vo" src="assets/audio/vo.mp3" data-start="0" data-duration="{END - 0.02:.2f}" data-volume="1" data-track-index="10"></audio>
      <audio id="bed" src="assets/audio/bed.mp3" data-start="0" data-duration="{END - 0.02:.2f}" data-volume="0.085" data-fade-out="1.5" data-track-index="11"></audio>
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
