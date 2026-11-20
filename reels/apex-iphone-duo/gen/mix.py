# mix.py: rebuilds the soundtrack from index.html (voice + music bed + every micro-sound at its time and level) and muxes it onto the
# rendered picture, so sound levels can be tuned without rendering the frames again. Usage: python3 gen/mix.py (from the project folder)
import re, subprocess, sys, numpy as np
sys.path.insert(0, 'gen')
from times import T
SR = 48000; END = T['END']; N = int(END * SR)
def load(p):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)
cache = {}; out = np.zeros((N, 2), dtype=np.float32)
html = open('index.html').read()
for m in re.finditer(r'<audio[^>]*>', html):
    tag = m.group(0); g = lambda k, d=None: (re.search(k + r'="([^"]*)"', tag) or [None, d])[1]
    src, start, dur, vol = g('src'), float(g('data-start')), float(g('data-duration')), float(g('data-volume', '1'))
    a = cache.setdefault(src, load(src))
    seg = a[: int(dur * SR)] * vol
    i0 = int(start * SR); seg = seg[: max(0, N - i0)]
    out[i0:i0 + len(seg)] += seg
peak = np.abs(out).max()
if peak > 0.98: out *= 0.98 / peak
open('renders/_mix.f32', 'wb').write(out.tobytes())
name = 'renders/' + sys.argv[1] if len(sys.argv) > 1 else 'renders/apex-iphone-duo-9x16.mp4'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'renders/_raw.mp4', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', 'renders/_mix.f32',
                '-filter_complex', '[1:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]', '-map', '0:v', '-map', '[a]', '-t', str(END),
                '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', name], check=True)
import os; os.remove('renders/_mix.f32')
# report: how often the mix sits more than 6 dB above the voice while the voice is speaking
vo = cache['assets/audio/vo.mp3'].mean(axis=1)[:N]; mx = out.mean(axis=1); w = SR // 10; n = N // w
db = lambda x: 10 * np.log10(np.mean(x ** 2) + 1e-10)
V = np.array([db(vo[i * w:(i + 1) * w]) for i in range(n)]); M = np.array([db(mx[i * w:(i + 1) * w]) for i in range(n)])
act = V > -32
print('written', name, '| voice-active windows with the mix 6 dB over the voice: %.1f%%' % (100 * np.mean((M - V > 6)[act])),
      [round(i * 0.1, 1) for i in range(n) if act[i] and M[i] - V[i] > 6])
