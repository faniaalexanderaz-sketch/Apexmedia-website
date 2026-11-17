# gencaps.py <project> [hot words...] : script.txt -> caps.txt (groups of short rows; numbers and the given words are accented)
import sys,re
P=sys.argv[1]; hot=set(w.lower() for w in sys.argv[2:]); words=open(P+'/script.txt').read().split()
NUM=re.compile(r'^(zero|uno|due|tre|quattro|cinque|sei|sette|otto|nove|dieci|venti|trenta|quaranta|cinquanta|cento|mille|.*(anta|cento|mila|dici|venti|trenta)(due|tre|sei|nove|quattro|cinque|sette|otto|uno)?|trentatr[eé]|primo|secondo|terzo|quarto|gratis|motion)$',re.I)
cl=lambda w: re.sub(r'[^\wàèéìòù\']','',w.lower())
out=[]; g=[]; closing=None
for i,w in enumerate(words):
    if w=='Se' and ' '.join(words[i:i+3])=='Se vuoi sapere': closing=i; break
    g.append(w)
    if re.search(r'[.?!:]$',w):
        # one sentence -> balanced groups of at most 5 words, never a one-word leftover; prefer breaking after a comma
        n=-(-len(g)//5); size=-(-len(g)//n); k=0
        while k<len(g):
            e=min(len(g),k+size)
            for c in range(e,k+1,-1):
                if c<len(g) and g[c-1].endswith(',') and len(g)-c>=2 and c-k>=2: e=c; break
            if len(g)-e==1: e=len(g)
            out.append(g[k:e]); k=e
        g=[]
if g: out.append(g)
lines=[]
for g in out:
    rows=[]; r=[]
    for w in g:
        c=cl(w); tok=('*' if (NUM.match(c) and len(c)>2) or c in hot else '')+w
        if r and (len(r)>=2 or sum(len(x) for x in r)+len(w)>13): rows.append(r); r=[]
        r.append(tok)
    if r: rows.append(r)
    lines.append(' / '.join(' '.join(r) for r in rows))
lines.append(' '.join(words[closing:]))
open(P+'/caps.txt','w').write('\n'.join(lines)+'\n'); print(len(words),'words',len(lines),'groups, closing at',closing)
