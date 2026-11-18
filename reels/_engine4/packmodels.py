# packmodels.py <project>: assets/models/*.glb -> assets/vendor/models.js (base64, loadable from file://)
import sys,os,base64,json
P=sys.argv[1]; d=P+'/assets/models'; out={}
for f in sorted(os.listdir(d)) if os.path.isdir(d) else []:
    if f.endswith('.glb'): out[f[:-4]]=base64.b64encode(open(d+'/'+f,'rb').read()).decode()
open(P+'/assets/vendor/models.js','w').write('window.C4_MODELS='+json.dumps(out)+';\n'); print('packed',list(out),round(os.path.getsize(P+'/assets/vendor/models.js')/1e6,1),'MB')
