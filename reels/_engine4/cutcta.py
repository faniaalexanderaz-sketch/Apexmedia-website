# cutcta.py <project>: remove the mid-video call to action ("... scrivi MOTION nei commenti.") from voice, timings, captions and script.
# The closing one stays. Keeps the original voice as vo_with_cta.mp3. Prints the word range removed (later word indices shift down).
import json,sys,subprocess,os
P=sys.argv[1]; A=P+'/assets/audio/'; W=json.load(open(A+'words.json')); T=json.load(open(A+'transcript.json')); caps=open(P+'/caps.txt').read().strip().split('\n')
i=0; rng=None
for k,l in enumerate(caps):
    n=sum(1 for t in l.split() if t!='/')
    if 'nei commenti' in l.lower(): rng=(i,i+n,k); break
    i+=n
assert rng,'no mid CTA line'
a,b,k=rng; c0=W[a]-0.10; c1=W[b]-0.10; cut=c1-c0
if not os.path.exists(A+'vo_with_cta.mp3'): subprocess.run(['cp',A+'vo.mp3',A+'vo_with_cta.mp3'],check=True)
subprocess.run(['ffmpeg','-nostdin','-v','error','-y','-i',A+'vo_with_cta.mp3','-filter_complex',f"[0:a]atrim=0:{c0},asetpts=PTS-STARTPTS[a];[0:a]atrim={c1},asetpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=0:a=1",'-c:a','libmp3lame','-q:a','2',A+'vo.mp3'],check=True)
json.dump(W[:a]+[round(x-cut,3) for x in W[b:]],open(A+'words.json','w'))
json.dump([t for t in T if t['end']<=c0+0.05]+[dict(t,start=round(t['start']-cut,3),end=round(t['end']-cut,3)) for t in T if t['start']>=c1-0.05],open(A+'transcript.json','w'),ensure_ascii=False)
open(P+'/caps.txt','w').write('\n'.join(caps[:k]+caps[k+1:])+'\n')
s=open(P+'/script.txt').read()
for q in [" Se vuoi sapere come creo questi video, scrivi MOTION nei commenti."]: s=s.replace(q,"",1)
open(P+'/script.txt','w').write(s); print('removed words',a,'..',b-1,'cut',round(cut,2),'s')
