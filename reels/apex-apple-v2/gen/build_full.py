# builds the full video: writes scenes 8..24 and regenerates index.html (root timeline, audio, micro-sounds)
import re, sys
sys.path.insert(0, '.')
import scenes2
from common import scene
P = '/home/user/Apexmedia-website/reels/apex-apple-v2/'
for s in scenes2.SC:
    open(P + 'compositions/' + s['id'] + '.html', 'w').write(scene(s['id'], s['dur'], s['body'], s['js'], s['css']))
h = open(P + 'index.html').read()
head = h[:h.index('<body>')]
old = re.findall(r'<(?:div|audio) id="(s[1-7]|fx\d+)"[^>]*>', h)
lines = [m.group(0) + ('</div>' if m.group(0).startswith('<div') else '</audio>') for m in re.finditer(r'<(?:div|audio) id="(?:s[1-7]|fx\d+)"[^>]*>', h) if int(re.search(r'fx(\d+)', m.group(0)).group(1)) < 100 if 'fx' in m.group(0)] if False else []
hosts, fxs = [], []
for m in re.finditer(r'<(div|audio) id="((?:s[1-7])|(?:fx\d+))"[^>]*>', h):
    tag, i = m.group(0), m.group(2)
    if i.startswith('s'):
        if i == 's7': tag = re.sub(r'data-duration="[\d.]+"', 'data-duration="2.334"', tag)
        hosts.append(tag + '</div>')
    elif int(i[2:]) < 100:
        fxs.append(tag + '</audio>')
END = 98.85
for s in scenes2.SC:
    hosts.append(f'<div id="{s["id"]}" data-composition-id="{s["id"]}" data-composition-src="compositions/{s["id"]}.html" data-start="{s["start"]}" data-duration="{s["dur"]}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>')
DUR = {'whoosh-short': 0.5, 'whoosh': 0.55, 'whoosh-cinematic': 1.0, 'key-press': 0.4, 'click-soft': 0.35, 'click': 0.36, 'pop': 0.6, 'typing': 0.75, 'sparkle': 1.2, 'impact-bass-1': 1.6, 'ping': 1.3, 'riser': 1.4}
new = sorted((t, n, v) for s in scenes2.SC for n, t, v in s['fx'])
busy = {k: 0.0 for k in range(12, 20)}
for k, (t, n, v) in enumerate(new):
    d = min(DUR[n], END - t)
    tr = next(x for x in busy if busy[x] <= t)
    busy[tr] = t + d + 0.02
    fxs.append(f'<audio id="fx{100 + k}" src="assets/sfx/{n}.mp3" data-start="{t}" data-duration="{d:.2f}" data-volume="{v}" data-track-index="{tr}"></audio>')
body = f'''<body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{END}" data-width="1080" data-height="1920" data-motion-blur="on">
      ''' + '\n      '.join(hosts) + f'''
      <audio id="vo" src="assets/audio/vo.mp3" data-start="0" data-duration="{END - 0.02:.2f}" data-volume="1" data-track-index="10"></audio>
      <audio id="bed" src="assets/audio/bed.mp3" data-start="0" data-duration="{END - 0.02:.2f}" data-volume="0.075" data-fade-out="1.5" data-track-index="11"></audio>
      ''' + '\n      '.join(fxs) + '''
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
'''
open(P + 'index.html', 'w').write(head + body)
print('scenes', len(hosts), 'fx', len(fxs))
