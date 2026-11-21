# align.py: writes gen/times.py from the word-level transcript. Each key is found as the first word (after the previous key)
# that contains the given token, so the scenes follow the voice exactly. Usage: python3 ../apex-kit/align.py (from the project folder)
import json, re, sys, subprocess
sys.path.insert(0, 'gen')
from keys import KEYS            # list of (key, token) in the order they are spoken
norm = lambda s: re.sub(r"[^0-9a-zàèéìòù']", '', s.lower())
W = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'assets/audio/transcript.json'))
T = {'start': 0.0}; i = 0
for key, tok in KEYS:
    toks = [norm(t) for t in tok.split()]
    while True:
        if i >= len(W): raise SystemExit(f'not found: {key} "{tok}"')
        if all(i + k < len(W) and t in norm(W[i + k]['text']) for k, t in enumerate(toks)): break
        i += 1
    T[key] = round(W[i]['start'], 2); i += 1
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'assets/audio/vo.mp3'], capture_output=True, text=True).stdout)
T['END'] = round(dur - 0.05, 2)
open('gen/times.py', 'w').write('# voice moments (seconds), written by apex-kit/align.py from the transcript\nT = dict(\n' +
                                ''.join(f'    {k}={v},\n' for k, v in T.items()) + ')\n')
print(len(T), 'keys, END', T['END'])
