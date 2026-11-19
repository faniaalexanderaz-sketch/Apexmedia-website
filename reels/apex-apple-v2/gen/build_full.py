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
END = 105.25
for s in scenes2.SC:
    hosts.append(f'<div id="{s["id"]}" data-composition-id="{s["id"]}" data-composition-src="compositions/{s["id"]}.html" data-start="{s["start"]}" data-duration="{s["dur"]}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>')
DUR = {'whoosh-short': 0.5, 'whoosh': 0.55, 'whoosh-cinematic': 1.0, 'key-press': 0.4, 'click-soft': 0.35, 'click': 0.36, 'pop': 0.6, 'typing': 0.75, 'sparkle': 1.2, 'impact-bass-1': 1.6, 'ping': 1.3, 'riser': 1.4}
EXTRA = [('click', 0.30, 0.3), ('click', 0.43, 0.3), ('click', 0.56, 0.3), ('click', 0.69, 0.3), ('click', 0.82, 0.3),
         ('pop', 1.0, 0.24), ('pop', 1.06, 0.22), ('pop', 1.12, 0.22), ('pop', 1.18, 0.2), ('pop', 1.24, 0.2), ('sparkle', 1.68, 0.14)]
new = sorted([(t, n, v) for s in scenes2.SC for n, t, v in s['fx']] + [(t, n, v) for n, t, v in EXTRA])
# automatic micro-sounds: every text entrance, pop, letter flip and selection gets a quiet tick unless a sound is already there
import scenes as _old
STARTS = {m.group(1): float(m.group(2)) for m in re.finditer(r'<div id="(s[1-7])"[^>]*data-start="([\d.]+)"', h)}
def _auto(js, start):
    out = []
    for kind, snd, vol in (('rise', 'key-press', 0.13), ('pop', 'pop', 0.2), ('flip', 'typing', 0.14), ('select', 'click-soft', 0.28), ('typeIn', 'typing', 0.16)):
        for m in re.finditer(kind + r'\(tl, [^,]+,(?: [^,]+,)? ([\d.]+(?: [-+] [\d.]+)?)[,)]', js):
            try: out.append((round(start + eval(m.group(1)), 3), snd, vol))
            except Exception: pass
    return out
auto = []
for s in scenes2.SC: auto += _auto(s['js'], s['start'])
for sid, v in _old.S.items():
    if sid in STARTS and sid != 's1': auto += _auto(v[2], STARTS[sid])
old_t = [float(m.group(1)) for m in re.finditer(r'<audio id="fx\d+"[^>]*data-start="([\d.]+)"', '\n'.join(fxs))]
taken = sorted([t for t, n, v in new] + old_t)
added = 0
for t, n, v in sorted(auto):
    if 0 <= t < END - 0.4 and all(abs(t - x) > 0.11 for x in taken):
        new.append((t, n, v)); taken.append(t); added += 1
new.sort()
print('auto micro-sounds added', added)
busy = {k: 0.0 for k in range(12, 30)}
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
