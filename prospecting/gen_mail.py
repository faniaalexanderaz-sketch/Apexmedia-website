import html,json,urllib.parse
from data import M
SANS="Helvetica,Arial,sans-serif"; SERIF="'Playfair Display',Georgia,'Times New Roman',serif"
e=lambda s: html.escape(s,quote=False)
CL={False:'Qualora lo ritenga utile, sarà un piacere illustrarLe in una breve telefonata di dieci minuti come imposterei il lavoro. In alternativa, se preferisce valutare direttamente il risultato, può rispondere a questa email con la parola "demo": Le preparerò gratuitamente, entro 24 ore, una bozza del nuovo sito.',
    True:'Se ti va, facciamo una chiamata di 10 minuti e ti spiego come lo farei. Se invece preferisci vedere subito il risultato, rispondimi "demo" e ti preparo gratis una bozza del nuovo sito in 24 ore.'}
NO={False:'Qualora la proposta non fosse di Suo interesse, è sufficiente rispondere "no grazie" e non La disturberò ulteriormente.',True:'Se non ti interessa basta un "no grazie" e non ti ricontatto.'}
LOC={False:'Siamo un\'agenzia di Alessandria: se preferisce un incontro di persona, sarà un piacere venire a trovarLa presso la Sua attività. È sufficiente un messaggio su WhatsApp o una risposta a questa email.',
     True:'Siamo un\'agenzia di Alessandria, quindi se preferisci parlarne di persona passo volentieri da te in negozio: mi basta un messaggio su WhatsApp o una risposta a questa mail.'}
WA={False:'Può scrivermi su WhatsApp al numero 351 594 0685.',True:'Scrivimi su WhatsApp: 351 594 0685'}
BTN={False:'Mi scriva su WhatsApp',True:'Scrivimi su WhatsApp'}
SAL={False:'Cordiali saluti,',True:''}
btn='display:block;text-align:center;font-family:'+SANS+';font-weight:bold;font-size:16px;padding:15px 20px;border-radius:10px;text-decoration:none;'
out=[]
for (i,nome,email,tu,subj,title,greet,opener,pers,scene,three) in M:
    mail="mailto:apex.info.studio@gmail.com?subject="+urllib.parse.quote(f"Demo gratuita - {nome}")+"&amp;body="+urllib.parse.quote("Ciao Alex, vorrei vedere la demo del nuovo sito.")
    P=lambda s: f'<p style="margin:0 0 16px">{e(s)}</p>'
    doc=(f'<div style="max-width:600px;margin:0 auto;font-family:{SANS};font-size:16px;line-height:1.65;color:#1f2330">'
      f'<div style="background-color:#081536;padding:18px 28px;border-radius:14px 14px 0 0"><span style="font-family:{SERIF};font-size:14px;letter-spacing:5px;color:#e7c568;font-weight:bold">APEX MEDIA</span><span style="font-size:12px;letter-spacing:2px;color:#8f9bbf"> &nbsp;·&nbsp; ALESSANDRIA</span></div>'
      f'<div style="border:1px solid #e6e7ec;border-top:0;border-radius:0 0 14px 14px;padding:26px 28px 24px">'
      f'<p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;color:#c39b3f;font-weight:bold">ANALISI RAPIDA DEL SITO · {e(nome.upper())}</p>'
      f'<p style="margin:0 0 22px;font-family:{SERIF};font-size:25px;line-height:1.25;color:#081536;font-weight:bold">{e(title)}</p>'
      +P(greet)+P(opener)+P(pers)+P(scene)+
      f'<div style="background-color:#faf6ea;border-left:4px solid #e7c568;border-radius:8px;padding:16px 18px;margin:0 0 22px"><p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;color:#c39b3f;font-weight:bold">COSA STANNO FACENDO I MIGLIORI IN CITTÀ</p><p style="margin:0">{e(three)}</p></div>'
      +P(CL[tu])+P(LOC[tu])+
      f'<a href="https://wa.me/393515940685?text=Ciao%20Alex%2C%20vorrei%20la%20demo" style="{btn}background-color:#25d366;color:#ffffff;margin:0 0 10px">{BTN[tu]}</a>'
      f'<a href="{mail}" style="{btn}background-color:#081536;color:#ffffff;margin:0 0 18px">Voglio la demo gratuita in 24 ore</a>'
      f'<p style="margin:0 0 22px;font-size:14px;color:#6b7080;text-align:center">{e(NO[tu])}</p>'
      +(f'<p style="margin:0 0 14px">{e(SAL[tu])}</p>' if SAL[tu] else '')+
      f'<div style="border-top:1px solid #eceef2;padding-top:18px"><p style="margin:0;font-family:{SERIF};font-size:18px;color:#081536;font-weight:bold">Alex Fania</p><p style="margin:0;font-size:14px;color:#4a4f60">Apex Media · Alessandria</p><p style="margin:4px 0 0;font-size:14px;color:#5a2ee6">351 594 0685 · studio@infoapex.eu</p></div>'
      f'</div></div>')
    plain='\n\n'.join([greet,opener,pers,scene,three,CL[tu],LOC[tu],WA[tu],NO[tu]]+([SAL[tu]] if SAL[tu] else []))+"\n\nAlex Fania\nApex Media · Alessandria\n351 594 0685 · studio@infoapex.eu"
    pass
    out.append({'i':i,'to':email,'subject':subj,'html':doc,'plain':plain})
    open(f'h{i}.html','w').write('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;padding:20px 12px;background:#fff">'+doc)
json.dump(out,open('out.json','w'),ensure_ascii=False)
print(len(out))
