# mkfilm.py <project>: film.src.js + words.json + caps.txt -> film.js
import json,sys
P=sys.argv[1]; W=json.load(open(P+'/assets/audio/words.json')); T=json.load(open(P+'/assets/audio/transcript.json')); caps=open(P+'/caps.txt').read().strip()
n=sum(1 for l in caps.split('\n') for t in l.split() if t!='/'); assert n==len(W),(n,len(W))
s=open(P+'/assets/vendor/film.src.js').read()
open(P+'/assets/vendor/film.js','w').write(s.replace('__W__',json.dumps(W)).replace('__VOEND__',str(round(T[-1]['end'],2))).replace('__CAPS__',json.dumps(caps,ensure_ascii=False)))
