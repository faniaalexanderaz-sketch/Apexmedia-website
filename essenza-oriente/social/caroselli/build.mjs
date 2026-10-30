import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const H = path.dirname(new URL(import.meta.url).pathname);
const b64 = p => fs.readFileSync(p.endsWith('.woff2') ? path.join(H,'../../fonts',p) : path.join(H,p)).toString('base64');
let CSS = fs.readFileSync(path.join(H,'css.tpl'),'utf8').replace(/%%/g,'%');
const fonts=[b64('cormorant-garamond-latin-600-normal.woff2'),b64('cormorant-garamond-latin-500-italic.woff2'),b64('jost-latin-wght-normal.woff2')];
let k=0; CSS=CSS.replace(/%s/g,()=>fonts[k++]);
const CHECK='<i><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg></i>';
const CAL='<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="M9 15l2 2 4-4"/></svg>';
const ARR='<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';
const brand=n=>`<div class="brand"><div class="dot">E</div><div><div class="t">Essenza d'Oriente</div><div class="u">Centro olistico · Alessandria</div></div></div><div class="pg">${n}/3</div>`;
const swipe=`<div class="swipe">Scorri ${ARR}</div>`;
const slide=(img,grad,pos,n,inner,last=false,op='center')=>`<div class="s"><img class="bg" style="object-position:${op}" src="data:image/png;base64,${b64('gen/'+img)}"><div class="${grad}"></div><div class="topl"></div><div class="botl"></div>${brand(n)}<div class="block ${pos}">${inner}</div>${last?'':swipe}</div>`;
const CTA=`<div class="cta">${CAL}Prenota sul sito</div><div class="url">essenzadoriente.it</div><div class="addr">Via San Lorenzo 46 · Alessandria · aperti fino alle 22:30</div>`;
const A=[
 slide('a1.png','bot','botb',1,`<div class="eyebrow">Massaggio oli essenziali</div><div class="h">Sciogli la tensione<br><em>di cervicale e schiena</em></div><div class="p">60 minuti di manualità lenta e profonda, con oli essenziali caldi scelti per te.</div>`),
 slide('oli-up.png','top','topb',2,`<div class="eyebrow">Come funziona</div><div class="h">Dalla nuca<br>alle spalle,<br><em>senza fretta</em></div><div class="list"><div class="li">${CHECK}Oli caldi che penetrano in profondità</div><div class="li">${CHECK}Pressioni mirate sui punti di tensione</div><div class="li">${CHECK}Respiro, calore, silenzio</div></div>`),
 slide('room-up.png','bot','botb',3,`<div class="eyebrow">Il tuo momento</div><div class="h">Esci più leggera<br><em>di come sei entrata</em></div>${CTA}`,true,'center 45%'),
];
const B=[
 slide('tuina-up.png','top','topb',1,`<div class="eyebrow">Tuina Shiatsu</div><div class="h">Il massaggio<br>che rimette <em>in moto</em><br>l'energia</div><div class="p">Tecnica orientale a pressioni e mobilizzazioni, 50 minuti, senza oli e con i vestiti addosso.</div>`),
 slide('b2-real.png','top','topb',2,`<div class="eyebrow">Per chi è</div><div class="h">Spalle rigide,<br>schiena bloccata,<br><em>testa pesante</em></div><div class="list"><div class="li">${CHECK}Pressioni sui meridiani e sui punti chiave</div><div class="li">${CHECK}Allungamenti dolci e mobilizzazioni</div><div class="li">${CHECK}Mente più lucida, corpo più libero</div></div>`),
 slide('prenota-up.png','bot','botb',3,`<div class="eyebrow">Riparti da qui</div><div class="h">Ritrova l'energia<br><em>che ti manca</em></div>${CTA}`,true,'22% center'),
];
const br=await chromium.launch(); const pg=await br.newPage({viewport:{width:1080,height:1350}});
for (const [name,slides] of [['oli-essenziali',A],['tuina-shiatsu',B]]) {
  fs.mkdirSync(path.join(H,name),{recursive:true});
  for (let i=0;i<slides.length;i++){
    await pg.setContent(`<html><head><style>${CSS}</style></head><body>${slides[i]}</body></html>`);
    await pg.evaluate(()=>document.fonts.ready); await pg.waitForTimeout(300);
    await pg.screenshot({path:path.join(H,name,`${name}-${i+1}.jpg`),type:'jpeg',quality:92});
  }
}
await br.close(); console.log('done');
