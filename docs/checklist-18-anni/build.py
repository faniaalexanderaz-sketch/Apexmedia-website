import html, json, sys

# (titolo, sottotitolo, [(voce, dettaglio)])
sys.path.insert(0, __import__("os").path.dirname(__file__))
from dati import SEZIONI, PRIME_MOSSE, SCRUTATORE
e = html.escape
totale = sum(len(s[2]) for s in SEZIONI)
print("voci:", totale, file=sys.stderr)

parti = []
n = 0
for i, (tit, sub, voci) in enumerate(SEZIONI, 1):
    righe = []
    for v, d in voci:
        n += 1
        if d == "SPIEGAZIONE":
            d = "Lavoro pagato al seggio durante elezioni e referendum: 119,60 euro esentasse. Domanda in Comune entro il 30 novembre."
            righe.append(f'<li><span class="box"></span><div><span class="num">{n:03d}</span><b>{e(v)}</b><p>{e(d)}</p></div></li>')
            righe.append('<li class="riq"><div><h3>' + e(SCRUTATORE[0]) + '</h3>' + ''.join(f'<p>{x}</p>' for x in SCRUTATORE[1]) + '</div></li>')
            continue
        righe.append(f'<li><span class="box"></span><div><span class="num">{n:03d}</span><b>{e(v)}</b><p>{e(d)}</p></div></li>')
    parti.append(f'''<section><header><span class="sez">{i:02d}</span><div><h2>{e(tit)}</h2><p class="sub">{e(sub)}</p></div><span class="cnt">{len(voci)} voci</span></header><ul>{"".join(righe)}</ul></section>''')

mosse = "".join(
    f'<div class="mossa"><span class="sett">{e(s)}</span><h3>{e(t)}</h3><ul>' + "".join(f'<li><span class="box sm"></span>{e(x)}</li>' for x in xs) + '</ul></div>'
    for s, t, xs in PRIME_MOSSE)

indice = "".join(f'<li><span>{i:02d}</span>{e(t)}<em>{len(v)}</em></li>' for i, (t, _, v) in enumerate(SEZIONI, 1))

HTML = f'''<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Checklist 18 anni</title>
<style>
@page {{ size: A4; margin: 16mm 16mm 18mm 16mm; }}
:root {{ --ink:#1d2329; --soft:#5b6670; --line:#dfe3e6; --acc:#2f5d62; --bg:#f4f6f5; }}
* {{ box-sizing:border-box; margin:0; padding:0; }}
body {{ font-family:'Inter',sans-serif; color:var(--ink); font-size:9.4pt; line-height:1.45; background:#fff; }}
.cover {{ height:257mm; display:flex; flex-direction:column; page-break-after:always; }}
.cover .top {{ font-size:8.5pt; letter-spacing:.18em; text-transform:uppercase; color:var(--soft); }}
.cover h1 {{ font-family:'Inter Display','Inter',sans-serif; font-size:64pt; line-height:.95; font-weight:700; letter-spacing:-.03em; margin-top:44mm; }}
.cover h1 span {{ color:var(--acc); }}
.cover .lead {{ font-size:13pt; color:var(--soft); max-width:125mm; margin-top:8mm; line-height:1.4; }}
.stats {{ display:flex; gap:10mm; margin-top:14mm; }}
.stats div b {{ display:block; font-family:'Inter Display','Inter'; font-size:24pt; font-weight:700; color:var(--acc); }}
.stats div {{ font-size:8.5pt; color:var(--soft); }}
.toc {{ margin-top:auto; columns:2; column-gap:10mm; list-style:none; border-top:1px solid var(--line); padding-top:6mm; }}
.toc li {{ display:flex; gap:3mm; padding:1.6mm 0; border-bottom:1px solid var(--line); break-inside:avoid; font-size:9pt; }}
.toc li span {{ color:var(--acc); font-weight:600; width:7mm; }}
.toc li em {{ margin-left:auto; font-style:normal; color:var(--soft); }}
.cover .nota {{ font-size:7.8pt; color:var(--soft); margin-top:5mm; }}
.intro h2 {{ font-family:'Inter Display','Inter'; font-size:22pt; letter-spacing:-.02em; }}
.intro p.sub {{ color:var(--soft); margin:2mm 0 6mm; font-size:10pt; }}
.mosse {{ display:grid; grid-template-columns:1fr 1fr; gap:4mm; margin-bottom:8mm; }}
.mossa {{ background:var(--bg); border-radius:3mm; padding:5mm; }}
.mossa .sett {{ font-size:7.5pt; letter-spacing:.14em; text-transform:uppercase; color:var(--acc); font-weight:600; }}
.mossa h3 {{ font-size:12pt; margin:1mm 0 3mm; }}
.mossa ul {{ list-style:none; }}
.mossa li {{ display:flex; gap:2.5mm; align-items:flex-start; padding:1mm 0; }}
.come {{ border:1px solid var(--line); border-radius:3mm; padding:5mm; font-size:9pt; color:var(--soft); margin-bottom:8mm; }}
.come b {{ color:var(--ink); }}
section {{ margin-bottom:7mm; }}
section header {{ display:flex; align-items:flex-end; gap:4mm; border-bottom:2px solid var(--ink); padding-bottom:2.5mm; margin-bottom:1mm; break-after:avoid; }}
.sez {{ font-family:'Inter Display','Inter'; font-size:22pt; font-weight:700; color:var(--acc); line-height:1; }}
section h2 {{ font-size:14pt; letter-spacing:-.01em; line-height:1.15; }}
.sub {{ color:var(--soft); font-size:8.8pt; }}
.cnt {{ margin-left:auto; font-size:7.8pt; color:var(--soft); white-space:nowrap; }}
section ul {{ list-style:none; }}
section li {{ display:flex; gap:3.5mm; padding:2.4mm 0; border-bottom:1px solid var(--line); break-inside:avoid; }}
.box {{ flex:0 0 auto; width:4mm; height:4mm; border:1.3px solid var(--ink); border-radius:1mm; margin-top:.6mm; }}
.box.sm {{ width:3.3mm; height:3.3mm; margin-top:.8mm; }}
.num {{ font-size:7pt; color:var(--acc); font-weight:600; margin-right:2mm; letter-spacing:.05em; }}
section li b {{ font-weight:600; font-size:9.8pt; }}
section li.riq {{ display:block; background:var(--bg); border:none; border-left:3px solid var(--acc); border-radius:2mm; padding:4mm 5mm; margin:2mm 0; }}
section li.riq h3 {{ font-size:11pt; margin-bottom:2mm; }}
section li.riq p {{ color:var(--ink); margin-top:1.6mm; }}
section li p {{ color:var(--soft); margin-top:.6mm; }}
.fine {{ margin-top:6mm; background:var(--bg); border-radius:3mm; padding:5mm; font-size:8.4pt; color:var(--soft); break-inside:avoid; }}
.fine b {{ color:var(--ink); }}
</style></head><body>
<div class="cover">
 <div class="top">Checklist · Edizione novembre 2026</div>
 <h1>18 anni.<br><span>Le mosse</span><br>che contano.</h1>
 <p class="lead">Le cose semplici e importanti da fare a 18 anni: documenti, conto, risparmio, investimenti, bonus, patente, viaggi e voto.</p>
 <div class="stats"><div><b>{totale}</b>voci da spuntare</div><div><b>{len(SEZIONI)}</b>sezioni</div><div><b>4</b>passi per partire</div></div>
 <ul class="toc">{indice}</ul>
 <p class="nota">Informazioni aggiornate a novembre 2026. Bonus, importi e scadenze cambiano con le leggi di bilancio: prima di fare domanda controlla sempre il sito ufficiale.</p>
</div>
<div class="intro">
 <h2>Le prime mosse</h2>
 <p class="sub">Se vuoi partire subito, inizia da qui.</p>
 <div class="mosse">{mosse}</div>
 <div class="come"><b>Come usarla.</b> Spunta ogni voce quando l'hai fatta. Qui sotto trovi tutte le {totale} voci divise per argomento.</div>
</div>
{"".join(parti)}
<div class="fine"><b>Nota.</b> Questa checklist è una guida pratica, non una consulenza legale, fiscale o finanziaria. Per investimenti e fondo pensione leggi sempre i documenti ufficiali del prodotto. Per bonus e agevolazioni fanno fede i siti ufficiali: cultura.gov.it, youth.europa.eu, inps.it, agenziaentrate.gov.it, politichegiovanili.gov.it, covip.it, consob.it.</div>
</body></html>'''
open(sys.argv[1], "w").write(HTML)
