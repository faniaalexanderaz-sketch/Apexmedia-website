# fixend.py <project>: whisper sometimes drops the closing sentence. If so, spread its words over the remaining audio
# (by word length, starting after the last pause) and append them to transcript.json, so align2 can time them.
import json,sys,subprocess
P=sys.argv[1]; A=P+'/assets/audio/'; T=json.load(open(A+'transcript.json')); sc=open(P+'/script.txt').read().split()
dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',A+'vo.mp3']))
if dur-T[-1]['end']<2 or any('spiego' in t['text'].lower() for t in T): print('ok, nothing to fix'); sys.exit()
i=max(k for k in range(len(sc)-2) if sc[k]=='Se' and sc[k+1]=='vuoi'); tail=sc[i:]
sil=list(map(float,open(A+'sil.txt').read().split())); ends=[e for e in sil[1::2] if e>=T[-1]['end']-0.25]
t0=ends[0] if ends else T[-1]['end']+0.3; t1=dur-0.25; L=[len(w)+1.5 for w in tail]; s=0
for w,l in zip(tail,L):
    a=t0+(t1-t0)*s/sum(L); s+=l; T.append({'text':w,'start':round(a,3),'end':round(t0+(t1-t0)*s/sum(L),3)})
json.dump(T,open(A+'transcript.json','w'),ensure_ascii=False); print('appended',len(tail),'words from',round(t0,2),'to',round(t1,2))
