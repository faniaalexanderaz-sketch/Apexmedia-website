/* =============================================================
   Generatore del sito — eseguire con:
     node genera-trattamenti.js
   Produce index.html e le 8 pagine in trattamenti/ da un unico
   set di partial (header, sheet di prenotazione, sezione prenota,
   footer). Un solo elenco TRATTAMENTI è la fonte di verità per
   nomi, durate e prezzi: cambia qui, rigenera, ed è ovunque.
   Contenuti verificati forniti dal centro — non inventati.
   ============================================================= */
const fs = require('fs');
const path = require('path');

const TEL = '+393317153533';
const TEL_VISIBILE = '331 715 3533';
const WA = 'https://wa.me/393317153533';
const DOMINIO = 'https://essenzadoriente.it/';
const MAPPA_RECENSIONI = 'https://www.google.com/maps/search/?api=1&query=Essenza+d%27Oriente+Via+San+Lorenzo+46+Alessandria';
const MAPPA_INDICAZIONI = 'https://www.google.com/maps/dir/?api=1&destination=44.9118135,8.6137538';

/* Treatwell, salone 532986: la prenotazione avviene DENTRO il sito, nel
   widget (iframe) della sezione #prenota. Il pannello a 3 passi è solo
   una guida che precompila la scelta e porta l'utente al widget.
   DA FORNIRE: il deep link per ciascuno degli 8 servizi dal pannello
   Treatwell. Quando un servizio ha un link diverso dal menu generico,
   l'iframe lo carica direttamente (vedi script.js). */
const TREATWELL_MENU = 'https://widget.treatwell.it/salone/532986/menu/';
const TREATWELL = {
  'massaggio-oli-essenziali': TREATWELL_MENU,
  'tuina-shiatsu': TREATWELL_MENU,
  'massaggio-spa': TREATWELL_MENU,
  'riflessologia-plantare': TREATWELL_MENU,
  'coppettazione': TREATWELL_MENU,
  'gua-sha': TREATWELL_MENU,
  'pulizia-orecchie': TREATWELL_MENU,
  'pedicure': TREATWELL_MENU
};

const TRATTAMENTI = [
  {
    id: 'massaggio-oli-essenziali',
    nome: 'Massaggio Oli Essenziali',
    titoloSeo: 'Massaggio Cervicale e Schiena con Oli Essenziali ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Massaggio decontratturante cervicale e schiena con oli essenziali ad Alessandria. 60 minuti, 60 €. 5,0★ su Google. Aperti 7/7 fino alle 22:30.',
    h1: 'Massaggio Oli Essenziali ad Alessandria',
    sotto: 'Cervicale e schiena, con oli essenziali che sciolgono le tensioni di collo e spalle.',
    prezzo: '60 €', durata: '60 min', nota: null,
    cosa: 'Un massaggio manuale mirato su collo, spalle e schiena, eseguito con oli essenziali che favoriscono il rilassamento muscolare e rendono più scorrevoli le manovre. È il trattamento più indicato per chi soffre di tensioni da postura scorretta, lavoro alla scrivania o stress accumulato nella parte alta della schiena.',
    benefici: 'Aiuta ad allentare le contratture di collo e spalle, può migliorare la sensazione di mobilità del collo e favorisce il rilassamento generale. L\'aromaterapia dell\'olio contribuisce al benessere psicofisico durante la seduta.',
    svolgimento: 'La seduta dura 60 minuti. Si resta generalmente a torso nudo o con abbigliamento comodo, secondo le indicazioni dell\'operatore, in un ambiente raccolto e rilassante.',
    avviso: null,
    correlati: ['tuina-shiatsu', 'massaggio-spa', 'coppettazione']
  },
  {
    id: 'tuina-shiatsu',
    nome: 'Tuina Shiatsu',
    titoloSeo: 'Massaggio Tuina Shiatsu ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Tuina e Shiatsu ad Alessandria: pressioni e manipolazioni lungo i meridiani. 50 minuti, 50 €. 5,0★ su Google, 146 recensioni. Aperti tutti i giorni.',
    h1: 'Tuina Shiatsu ad Alessandria',
    sotto: 'Pressioni e manipolazioni lungo i meridiani, da vestiti: tecniche orientali per sciogliere le tensioni.',
    prezzo: '50 €', durata: '50 min', nota: null,
    cosa: 'Un trattamento che unisce due tecniche di origine orientale: il Tuina, massaggio tradizionale cinese riconosciuto dall\'OMS nel 1998 come pratica terapeutica, e lo Shiatsu, tecnica giapponese a pressione statica di dita e palmi, nata dall\'evoluzione delle stesse radici della medicina orientale. Il Tuina è più dinamico, con manovre di pressione, sfregamento e mobilizzazione; lo Shiatsu è più statico e si concentra sulla pressione mirata lungo i meridiani energetici.',
    benefici: 'Entrambe le tecniche sono tradizionalmente associate all\'alleviamento delle tensioni muscolari, al miglioramento della circolazione, alla riduzione dello stress e al rilassamento generale del sistema nervoso.',
    svolgimento: 'La seduta dura 50 minuti e si svolge generalmente vestiti (a differenza dei massaggi a olio), su tappeto o lettino, con pressioni e manipolazioni su punti specifici del corpo.',
    avviso: null,
    correlati: ['massaggio-oli-essenziali', 'coppettazione', 'riflessologia-plantare']
  },
  {
    id: 'massaggio-spa',
    nome: 'Massaggio Spa',
    titoloSeo: 'Massaggio Spa Corpo Completo ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Massaggio spa rilassante di corpo completo ad Alessandria: 90 minuti, 90 €. 5,0★ su Google, 146 recensioni. Aperti tutti i giorni fino alle 22:30.',
    h1: 'Massaggio Spa ad Alessandria',
    sotto: 'Corpo completo, 90 minuti: il trattamento più lungo del centro, pensato come puro benessere.',
    prezzo: '90 €', durata: '90 min', nota: null,
    cosa: 'Un massaggio rilassante di corpo completo, pensato come momento di puro benessere più che come trattamento mirato a un problema specifico.',
    benefici: 'Rilassamento profondo, riduzione dello stress percepito e un\'ora e mezza dedicata interamente al proprio benessere.',
    svolgimento: 'La seduta dura 90 minuti, la più lunga tra i trattamenti del centro: è indicata per chi desidera un\'esperienza di relax completa, non solo un intervento su una zona specifica.',
    avviso: null,
    correlati: ['massaggio-oli-essenziali', 'tuina-shiatsu', 'riflessologia-plantare']
  },
  {
    id: 'riflessologia-plantare',
    nome: 'Riflessologia Plantare',
    titoloSeo: 'Riflessologia Plantare ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Riflessologia plantare ad Alessandria: 40 o 60 minuti, da 35 €. Stimolazione dei punti riflessi del piede. 5,0★ su Google. Aperti 7/7 fino alle 22:30.',
    h1: 'Riflessologia Plantare ad Alessandria',
    sotto: 'Stimolazione dei punti riflessi della pianta del piede. Si tolgono solo le scarpe.',
    prezzo: '35 €', durata: '40 min', nota: 'Versione da 60 min: 50 €',
    cosa: 'Una pratica che stimola punti specifici della pianta del piede, secondo la mappa della riflessologia plantare, che ha origine sia nella medicina tradizionale cinese sia in studi occidentali del primo Novecento. Ogni zona del piede è tradizionalmente associata a un\'area del corpo.',
    benefici: 'Favorisce il rilassamento generale e può contribuire ad alleviare stress e tensione. Molte persone la trovano utile per il senso di pesantezza alle gambe dopo una giornata in piedi.',
    svolgimento: 'La seduta dura 40 o 60 minuti, a seconda della durata scelta. Si resta comodamente seduti o sdraiati: si tolgono solo le calzature.',
    avviso: null,
    correlati: ['pedicure', 'tuina-shiatsu', 'massaggio-spa']
  },
  {
    id: 'coppettazione',
    nome: 'Coppettazione',
    titoloSeo: 'Coppettazione (Cupping) ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Coppettazione ad Alessandria: tecnica tradizionale cinese con coppe a effetto ventosa, 25 €. 5,0★ su Google, 146 recensioni. Aperti tutti i giorni.',
    h1: 'Coppettazione ad Alessandria',
    sotto: 'Cupping tradizionale cinese: coppe a effetto ventosa per richiamare circolazione sulla schiena.',
    prezzo: '25 €', durata: 'Seduta breve', nota: null,
    cosa: 'Una tecnica di origine antica, propria della medicina tradizionale cinese, che utilizza piccole coppe — in vetro, bambù o silicone — applicate sulla pelle con un effetto ventosa, per richiamare sangue e circolazione verso l\'area trattata.',
    benefici: 'Tradizionalmente associata a un miglioramento della circolazione locale, al rilascio delle tensioni muscolari e a una sensazione di sollievo sulle zone contratte della schiena.',
    svolgimento: 'Le coppette vengono posizionate e lasciate agire per alcuni minuti, oppure mosse delicatamente sulla pelle. È normale che restino sulla pelle segni rotondi rosso-violacei per alcuni giorni dopo il trattamento: non sono pericolosi, sono un effetto noto e temporaneo.',
    avviso: 'La coppettazione è sconsigliata in gravidanza, su pelle lesa o ferite aperte, e in caso di fragilità capillare. In caso di dubbi, chiedici pure informazioni prima di prenotare.',
    correlati: ['gua-sha', 'tuina-shiatsu', 'massaggio-oli-essenziali']
  },
  {
    id: 'gua-sha',
    nome: 'Gua Sha',
    titoloSeo: 'Gua Sha ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Gua sha ad Alessandria: scorrimento di pietra liscia per stimolare la circolazione, 25 €. Centro olistico 5,0★ su Google. Aperti 7/7 fino alle 22:30.',
    h1: 'Gua Sha ad Alessandria',
    sotto: 'Scorrimento di una pietra liscia sulla pelle per stimolare la circolazione superficiale.',
    prezzo: '25 €', durata: 'Seduta breve', nota: null,
    cosa: 'Una tecnica della medicina tradizionale cinese che consiste nello scorrimento di uno strumento liscio — spesso una pietra piatta — sulla pelle, per generare calore e stimolare la circolazione superficiale.',
    benefici: 'Tradizionalmente usato per favorire il rilascio delle tensioni muscolari e connettivali; è molto diffuso anche come trattamento di benessere del viso.',
    svolgimento: 'Movimenti di scorrimento ripetuti sulla zona trattata. Può lasciare arrossamenti temporanei sulla pelle, che scompaiono in pochi giorni.',
    avviso: 'Il gua sha è sconsigliato a chi ha problemi di coagulazione del sangue o fragilità capillare. In caso di dubbi, chiedici pure informazioni prima di prenotare.',
    correlati: ['coppettazione', 'tuina-shiatsu', 'massaggio-oli-essenziali']
  },
  {
    id: 'pulizia-orecchie',
    nome: 'Pulizia delle Orecchie',
    titoloSeo: 'Pulizia delle Orecchie in Stile Tradizionale Cinese ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Pulizia orecchie in stile tradizionale cinese (cǎi ěr) ad Alessandria: strumenti dedicati in bambù e metallo, piuma per la fase finale. 25 €. 5,0★ su Google.',
    h1: 'Pulizia delle Orecchie ad Alessandria',
    sotto: 'Cǎi ěr, la pulizia auricolare tradizionale cinese: strumenti in bambù e metallo, piumino finale.',
    prezzo: '25 €', durata: 'Seduta breve', nota: null,
    cosa: 'Un servizio di pulizia auricolare eseguito secondo la tecnica tradizionale cinese nota come cǎi ěr (采耳, letteralmente "raccogliere l\'orecchio"), una pratica diffusa da secoli in Cina — celebre in particolare nella tradizione delle case da tè di Chengdu, nel Sichuan. Non si utilizza alcuna micro-telecamera: l\'operatore lavora con un piccolo set di strumenti dedicati, tra cui cucchiaini e bastoncini in bambù o metallo di forme e lunghezze diverse per la rimozione delicata del cerume, piccole pinzette per i residui più visibili e, nella fase finale, un morbido piumino che sfiora e vibra leggermente all\'interno dell\'orecchio, regalando una tipica sensazione di leggerezza e relax.',
    benefici: 'Pulizia delicata e accurata, sensazione di leggerezza e comfort auricolare, momento di profondo relax grazie al tocco calibrato degli strumenti tradizionali e alla fase finale con il piumino.',
    svolgimento: 'Si resta comodamente seduti mentre l\'operatore lavora con calma, alternando gli strumenti secondo necessità, fino alla fase finale di stimolazione con il piumino.',
    avviso: 'Questo è un servizio di pulizia e benessere estetico, non un trattamento medico. In caso di problemi specifici alle orecchie (dolore, infezioni, perdita di udito) è bene rivolgersi a un medico otorinolaringoiatra.',
    correlati: ['pedicure', 'gua-sha', 'riflessologia-plantare']
  },
  {
    id: 'pedicure',
    nome: 'Pedicure',
    titoloSeo: 'Pedicure in Stile Tradizionale Cinese ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Pedicure in stile tradizionale cinese (xiūjiǎo) ad Alessandria: ammollo, cura di calli e duroni con strumenti dedicati, rifinitura delle unghie. 35 €.',
    h1: 'Pedicure ad Alessandria',
    sotto: 'Xiūjiǎo, la cura del piede tradizionale cinese: ammollo, calli, duroni e unghie rifinite con precisione.',
    prezzo: '35 €', durata: 'Seduta breve', nota: null,
    cosa: 'Un servizio di cura del piede ispirato alla tradizione cinese dello xiūjiǎo (修脚, letteralmente "rifinire il piede"), un\'arte antica e molto radicata in Cina — storicamente celebre a Pechino, dove è riconosciuta come patrimonio culturale — incentrata più sulla cura precisa del piede che sulla sola estetica dello smalto. Il piede viene prima ammorbidito con un ammollo caldo, poi l\'operatore lavora con piccoli strumenti dedicati e ben affilati per rifinire con precisione calli, duroni e unghie, prestando particolare attenzione ai bordi e agli angoli più delicati.',
    benefici: 'Piedi visibilmente più lisci e curati, sensazione di leggerezza dopo la rimozione di calli e pelle indurita, unghie rifinite con precisione.',
    svolgimento: 'Si comincia con un ammollo rilassante, seguito dalla cura vera e propria di calli, duroni e unghie con gli strumenti dedicati, fino alla rifinitura finale.',
    avviso: 'Questo è un servizio di cura estetica del piede, non un trattamento medico podologico. In caso di condizioni specifiche (diabete, infezioni, problemi circolatori) è bene consultare prima un podologo o un medico.',
    correlati: ['riflessologia-plantare', 'pulizia-orecchie', 'massaggio-spa']
  }
];

const daId = (id) => TRATTAMENTI.find((t) => t.id === id);

/* ---------- icone lineari (una sola famiglia, stroke 1.6) ---------- */
const I = {
  tel: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>',
  wa: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.1-.7l.5-.6c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.6-.3Z"/></svg>',
  orologio: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.3 2"/></svg>',
  pin: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.4"/></svg>',
  mani: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.4 13V6.6a1.25 1.25 0 1 1 2.5 0v4.9"/><path d="M10.9 11.4V5.4a1.25 1.25 0 1 1 2.5 0v6.1"/><path d="M13.4 11.6V6.6a1.25 1.25 0 1 1 2.5 0v6.5"/><path d="M15.9 12.7V9a1.25 1.25 0 1 1 2.5 0v6.9c0 3.2-2.1 5.7-5.5 5.7-2 0-3.2-.7-4.4-2.2l-2-2.6c-.5-.7-.3-1.5.4-1.9.6-.4 1.4-.2 1.9.4l1.3 1.5"/></svg>',
  freccia: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  chiudi: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  ig: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/></svg>',
  fb: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M15 8.5h-2c-.8 0-1.5.7-1.5 1.5v2h3.3l-.4 3H11.5V21h-3v-6H6.5v-3h2V9.8C8.5 7.1 10 5.5 12.5 5.5H15v3Z"/></svg>',
  tt: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M14.5 3.5c.4 2.3 2 3.8 4.3 4v2.9c-1.5 0-2.9-.4-4.3-1.3v6.4a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3a2.7 2.7 0 1 0 1.9 2.6V3.5h2.9Z"/></svg>'
};

const FIRMA = '<span class="firma" lang="zh" aria-label="Firma cinese del centro">东方之<span class="cuore">心</span>养生馆</span>';

const GTAG = `  <!-- Google tag (gtag.js) — Consent Mode: nessun cookie di misurazione
       finché l'utente non accetta dal banner -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied'
    });
  </script>
  <script>
    gtag('js', new Date());
    gtag('config', 'G-5XJQW3HMLL');
    gtag('config', 'AW-17997395114');
    /* gtag.js parte alla prima interazione o 2,5 s dopo il load: i comandi
       qui sopra restano in coda nel dataLayer e vengono eseguiti al
       caricamento, così la pagina resta reattiva mentre si apre. */
    (function () {
      var fatto = false;
      function carica() {
        if (fatto) return; fatto = true;
        var s = document.createElement('script'); s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=G-5XJQW3HMLL';
        document.head.appendChild(s);
      }
      ['pointerdown','keydown','scroll','touchstart'].forEach(function (ev) {
        addEventListener(ev, carica, { once: true, passive: true });
      });
      addEventListener('load', function () { setTimeout(carica, 2500); });
    })();
  </script>`;

function waLink(testo) {
  return WA + '?text=' + encodeURIComponent(testo);
}

/* ---------- partial condivisi (base = '' in radice, '../' in trattamenti/) ---------- */
function head(o) {
  const b = o.base;
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script>document.documentElement.className='js';</script>
${GTAG}
${o.extraHead || ''}
  <title>${o.title}</title>
  <meta name="description" content="${o.desc}" />
  <link rel="canonical" href="${o.canonical}" />
${o.robots ? `  <meta name="robots" content="${o.robots}" />\n` : ''}
  <meta property="og:type" content="${o.ogType || 'website'}" />
  <meta property="og:url" content="${o.canonical}" />
  <meta property="og:title" content="${o.ogTitle || o.title}" />
  <meta property="og:description" content="${o.desc}" />
  <meta property="og:image" content="${o.ogImage}" />
  <meta property="og:locale" content="it_IT" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${o.ogTitle || o.title}" />
  <meta name="twitter:description" content="${o.desc}" />
  <meta name="twitter:image" content="${o.ogImage}" />

  <link rel="preload" href="${b}fonts/fraunces-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="${b}fonts/jost-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="${b}styles.css" />
  <link rel="icon" href="${b}favicon.ico" sizes="any" />
  <link rel="icon" href="${b}favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="icon" href="${b}favicon-192.png" type="image/png" sizes="192x192" />
  <link rel="apple-touch-icon" href="${b}favicon-180.png" />
${o.ldjson ? `  <script type="application/ld+json">\n${o.ldjson}\n  </script>\n` : ''}</head>`;
}

function header(base, prenotaHref) {
  const home = base ? base + 'index.html' : '';
  prenotaHref = prenotaHref || '#prenota';
  return `  <header class="top" id="top">
    <div class="top-inner">
      <a class="marchio" href="${home || '#inizio'}" aria-label="Essenza d'Oriente, torna all'inizio">
        <span class="marchio-nome">Essenza d'Oriente</span>
        <span class="marchio-sotto">Centro Olistico</span>
      </a>
      ${FIRMA}
      <nav class="top-nav" aria-label="Sezioni">
        <a href="${home}#trattamenti">Trattamenti</a>
        <a href="${home}#recensioni">Recensioni</a>
        <a href="${home}#dove">Dove siamo</a>
      </nav>
      <a class="top-tel" href="tel:${TEL}">${I.tel} ${TEL_VISIBILE}</a>
      <a class="btn btn-primario" href="${prenotaHref}" data-prenota data-origine="header">Prenota</a>
    </div>
  </header>`;
}

function barraMobile(tratt, prenotaHref) {
  return `  <div class="barra-mobile" id="barraMobile" role="navigation" aria-label="Azioni rapide">
    <a class="btn btn-primario" href="${prenotaHref || '#prenota'}" data-prenota${tratt ? ` data-tratt="${tratt.id}"` : ''} data-origine="barra">Prenota ora</a>
    <a class="barra-icona wa" href="${WA}" target="_blank" rel="noopener" aria-label="Scrivici su WhatsApp">${I.wa}</a>
    <a class="barra-icona" href="tel:${TEL}" aria-label="Chiama ${TEL_VISIBILE}">${I.tel}</a>
  </div>`;
}

function sheet() {
  const lista = TRATTAMENTI.map((t) =>
    `        <button type="button" class="sheet-tratt" data-id="${t.id}" data-nome="${t.nome}" data-durata="${t.durata}" data-prezzo="${t.prezzo}" data-tw="${TREATWELL[t.id]}" aria-pressed="false">
          <span class="sheet-tratt-nome">${t.nome}</span><span class="sheet-tratt-info">${t.durata} · ${t.prezzo}</span>
        </button>`).join('\n');
  return `  <!-- Guida in 3 passi: precompila la scelta e porta al widget Treatwell
       in #prenota. Senza JavaScript resta nascosta e ogni "Prenota" è
       un'àncora a #prenota. -->
  <div class="scrim" id="sheetScrim" hidden></div>
  <aside class="sheet" id="sheet" hidden role="dialog" aria-modal="true" aria-labelledby="sheetTitolo">
    <div class="sheet-testa">
      <div>
        <p class="sheet-passi" id="sheetPassi" aria-hidden="true"><span class="is-on">1</span><span>2</span><span>3</span></p>
        <h2 class="sheet-titolo" id="sheetTitolo">Scegli il trattamento</h2>
      </div>
      <button type="button" class="sheet-chiudi" id="sheetChiudi" aria-label="Chiudi">${I.chiudi}</button>
    </div>
    <div class="sheet-corpo">
      <section class="passo" data-passo="1">
        <div class="sheet-lista" id="sheetLista">
${lista}
        </div>
      </section>
      <section class="passo" data-passo="2" hidden>
        <p class="sheet-scelta"><span id="sheetScelta"></span><button type="button" class="sheet-cambia" data-vai="1">Cambia</button></p>
        <p class="sheet-stato" id="sheetStato">Aperti oggi fino alle 22:30</p>
        <p class="sheet-label">Giorno</p>
        <div class="chips" id="sheetGiorni" role="group" aria-label="Giorno">
          <button type="button" class="chip" data-giorno="oggi" aria-pressed="false">Oggi</button>
          <button type="button" class="chip" data-giorno="domani" aria-pressed="false">Domani</button>
          <button type="button" class="chip" data-giorno="data" aria-pressed="false">Scelgo io la data</button>
        </div>
        <label class="sheet-data" id="sheetDataWrap" hidden><span>Data</span><input type="date" id="sheetData" /></label>
        <p class="sheet-label">Fascia oraria</p>
        <div class="chips" id="sheetFasce" role="group" aria-label="Fascia oraria">
          <button type="button" class="chip" data-fascia="mattina" data-inizio="570" data-fine="780" aria-pressed="false">Mattina<small>9:30–13:00</small></button>
          <button type="button" class="chip" data-fascia="pomeriggio" data-inizio="780" data-fine="1080" aria-pressed="false">Pomeriggio<small>13:00–18:00</small></button>
          <button type="button" class="chip" data-fascia="sera" data-inizio="1080" data-fine="1350" aria-pressed="false">Sera<small>18:00–22:30</small></button>
        </div>
        <button type="button" class="btn btn-primario btn-pieno" id="sheetAvanti" disabled>Continua</button>
      </section>
      <section class="passo" data-passo="3" hidden>
        <dl class="riepilogo">
          <dt>Trattamento</dt><dd id="riepTratt"></dd>
          <dt>Prezzo</dt><dd id="riepPrezzo"></dd>
          <dt>Giorno</dt><dd id="riepGiorno"></dd>
          <dt>Fascia</dt><dd id="riepFascia"></dd>
        </dl>
        <p class="sheet-nota">Nel calendario Treatwell qui sotto scegli questo trattamento e l'orario: la conferma è immediata.</p>
        <button type="button" class="btn btn-primario btn-pieno" id="sheetVai">Vai al calendario Treatwell</button>
        <a class="btn btn-secondario btn-pieno" id="sheetWa" href="${WA}" target="_blank" rel="noopener">Preferisci WhatsApp?</a>
        <p class="sheet-tel">oppure chiama <a href="tel:${TEL}">${TEL_VISIBILE}</a></p>
        <p class="sheet-piede"><button type="button" class="sheet-indietro" data-vai="2">← Indietro</button></p>
      </section>
    </div>
  </aside>`;
}

function sezionePrenota(tratt) {
  const src = tratt ? TREATWELL[tratt.id] : TREATWELL_MENU;
  const wa = tratt ? waLink(`Ciao! Vorrei prenotare: ${tratt.nome} (${tratt.durata}, ${tratt.prezzo}). Quando avete disponibilità?`) : WA;
  return `    <section class="sez prenota" id="prenota" aria-labelledby="prenotaTitolo">
      <div class="prenota-inner">
        <div class="filetto" aria-hidden="true"></div>
        <h2 id="prenotaTitolo">Prenota online</h2>
        <p>Scegli trattamento, data e ora. Conferma immediata, nessuna carta richiesta.</p>
        <p class="prenota-scelta" id="prenotaScelta" hidden><span><strong>Stai prenotando:</strong> <span id="prenotaSceltaTesto"></span></span><a class="prenota-cambia" href="#prenota" data-prenota data-origine="cambia">cambia</a></p>
        <div class="prenota-card">
          <iframe id="treatwellFrame" class="treatwell-frame" src="${src}" title="Prenota il tuo trattamento — calendario Treatwell" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <p class="prenota-alt">Non trovi l'orario? <a href="${wa}" target="_blank" rel="noopener">Scrivici su WhatsApp</a> o chiama il <a href="tel:${TEL}">${TEL_VISIBILE}</a></p>
      </div>
    </section>`;
}

function footer(base) {
  return `  <footer class="fondo">
    <div class="fondo-inner">
      <div>
        <p class="fondo-nome">Essenza d'Oriente · Centro Olistico</p>
        ${FIRMA}
      </div>
      <div class="fondo-contatti">
        <span>Via San Lorenzo 46, 15121 Alessandria (AL)</span>
        <a href="tel:${TEL}">${TEL_VISIBILE}</a>
        <a href="${WA}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
      <div class="fondo-social" aria-label="Seguici sui social">
        <a href="https://www.instagram.com/essenza.oriente?igsh=ZWpoOTBrMDduMW5i&amp;utm_source=qr" target="_blank" rel="noopener" aria-label="Instagram di Essenza d'Oriente">${I.ig}</a>
        <a href="https://www.facebook.com/share/14jFSwS4Ysi/?mibextid=wwXIfr" target="_blank" rel="noopener" aria-label="Facebook di Essenza d'Oriente">${I.fb}</a>
        <a href="https://www.tiktok.com/@essenzaoriente.al" target="_blank" rel="noopener" aria-label="TikTok di Essenza d'Oriente">${I.tt}</a>
      </div>
      <p class="fondo-legale">P.IVA 14409690964 · <a href="${base}privacy.html">Privacy</a> · <a href="${base}cookie.html">Cookie</a></p>
    </div>
  </footer>`;
}

function scripts(base) {
  return `  <script src="${base}cookie.js" defer></script>
  <script src="${base}script.js" defer></script>`;
}

/* ---------- HOME ---------- */
function home() {
  const ldjson = `  {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "name": "Essenza d'Oriente",
    "description": "Centro olistico ad Alessandria: riflessologia plantare, massaggio decontratturante, tuina shiatsu, coppettazione, gua sha.",
    "image": "${DOMINIO}foto/brand-banner.jpg",
    "url": "${DOMINIO}",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Via San Lorenzo 46",
      "postalCode": "15121",
      "addressLocality": "Alessandria",
      "addressRegion": "AL",
      "addressCountry": "IT"
    },
    "geo": { "@type": "GeoCoordinates", "latitude": 44.9118135, "longitude": 8.6137538 },
    "telephone": "${TEL}",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "opens": "09:30",
      "closes": "22:30"
    },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": "146" },
    "priceRange": "€€"
  }`;

  const griglia = TRATTAMENTI.map((t) => `        <article class="tratt" data-reveal>
          <h3>${t.nome}</h3>
          <p class="tratt-info">${t.durata} · <strong>${t.prezzo}</strong></p>
          <div class="tratt-azioni">
            <a class="btn btn-secondario btn-compatto" href="#prenota" data-prenota data-tratt="${t.id}" data-origine="card">Prenota</a>
            <a class="tratt-dettagli" href="trattamenti/${t.id}.html" aria-label="Dettagli: ${t.nome}">Dettagli</a>
          </div>
        </article>`).join('\n');

  return `${head({
    base: '',
    title: 'Riflessologia Plantare e Massaggio Decontratturante ad Alessandria | Essenza d\'Oriente',
    desc: 'Centro olistico ad Alessandria: riflessologia plantare, massaggio decontratturante, tuina shiatsu, coppettazione. 5,0★ su Google con 146 recensioni. Aperti 7/7 fino alle 22:30. Prenota online.',
    canonical: DOMINIO,
    ogType: 'business.business',
    ogTitle: 'Essenza d\'Oriente — Centro Olistico ad Alessandria',
    ogImage: DOMINIO + 'foto/brand-banner.jpg',
    extraHead: `  <meta name="google-site-verification" content="KfutwzZXjGKLWeHeEKBz8z3UeP-ZxHV_0jgBZmHRqAw" />
  <!-- HEADLINE MODIFICABILE PER LE CAMPAGNE ADS: se valorizzata sostituisce
       il testo dell'H1 al caricamento. Lasciare null per usare l'HTML. -->
  <script>var LANDING_HEADLINE = null;</script>
  <link rel="preload" as="image" href="foto/sfondo-prenota.webp" media="(min-width: 821px)" fetchpriority="high" />
  <link rel="preload" as="image" href="foto/sfondo-prenota-mobile.webp" media="(max-width: 820px)" fetchpriority="high" />`,
    ldjson
  })}
<body id="inizio">
${header('')}
${barraMobile(null)}

  <main>
    <section class="hero" aria-labelledby="headline">
      <div class="hero-inner">
        <div>
          <h1 id="headline">Massaggio con Oli Essenziali e Trattamenti Olistici ad Alessandria</h1>
          <p class="hero-sub">Massaggi e tecniche tradizionali cinesi nel centro di Alessandria, tutti i giorni fino alle 22:30.</p>
          <p class="hero-fiducia"><span>5,0</span><span class="stella" aria-hidden="true">★</span><span>· 146 recensioni Google</span></p>
          <div class="hero-azioni">
            <a class="btn btn-primario" id="heroCta" href="#prenota" data-prenota data-origine="hero">Prenota ora</a>
            <a class="link-testo" href="#trattamenti">Vedi trattamenti e prezzi</a>
          </div>
          <p class="hero-stato" id="statoApertura">Aperti oggi fino alle 22:30</p>
        </div>
        <figure class="hero-foto">
          <picture>
            <source media="(max-width: 820px)" srcset="foto/sfondo-prenota-mobile.webp" type="image/webp" />
            <source media="(max-width: 820px)" srcset="foto/sfondo-prenota-mobile.jpg" />
            <source srcset="foto/sfondo-prenota.webp" type="image/webp" />
            <img src="foto/sfondo-prenota.jpg" alt="Lettino del centro Essenza d'Oriente ad Alessandria, con asciugamani, candela e orchidea" width="1376" height="768" fetchpriority="high" decoding="async" />
          </picture>
        </figure>
      </div>
    </section>

    <section class="sez" id="trattamenti" aria-labelledby="trattTitolo">
      <div class="sez-inner">
        <div class="sez-testa" data-reveal>
          <h2 id="trattTitolo">Trattamenti e prezzi</h2>
          <p>Durata e prezzo sempre in chiaro. Scegli e prenota in meno di un minuto.</p>
        </div>
        <div class="tratt-griglia">
${griglia}
        </div>
      </div>
    </section>

    <section class="sez sez-bianca" aria-label="Perché sceglierci">
      <div class="motivi" data-reveal>
        <div class="motivo">${I.orologio}<div><strong>Aperti 7/7 fino alle 22:30</strong><span>Anche la domenica e nei festivi.</span></div></div>
        <div class="motivo">${I.pin}<div><strong>Centro storico, 2 min dal Duomo</strong><span>Via San Lorenzo 46, Alessandria.</span></div></div>
        <div class="motivo">${I.mani}<div><strong>Tecniche tradizionali cinesi</strong><span>Tuina, coppettazione, gua sha, riflessologia.</span></div></div>
      </div>
    </section>

    <section class="sez" id="recensioni" aria-labelledby="recTitolo">
      <div class="sez-inner">
        <div class="sez-testa" data-reveal>
          <h2 id="recTitolo">Cosa dicono di noi</h2>
          <p>5,0 su Google con 146 recensioni. Tre, per intero.</p>
        </div>
        <div class="recensioni">
          <figure class="recensione" data-reveal>
            <span class="stelle" aria-label="5 stelle su 5">★★★★★</span>
            <blockquote>Stamattina ho visitato Essenza d'Oriente e ho avuto un'esperienza fantastica. Sono in vacanza dall'Australia e cercavo un buon posto per massaggi e coppettazione. Sono felice di averlo finalmente trovato! Grazie a Jenny e a tutto il team.</blockquote>
            <figcaption><strong>Ella Grace</strong> · Local Guide, Google</figcaption>
          </figure>
          <figure class="recensione" data-reveal>
            <span class="stelle" aria-label="5 stelle su 5">★★★★★</span>
            <blockquote>L'accoglienza è stata cordiale e professionale. Ho ricevuto un trattamento di riflessologia plantare che sicuramente ripeterò. Con questo caldo prendersi cura dei piedi dà un grande giovamento e Luca è molto bravo.</blockquote>
            <figcaption><strong>Roberta Massobrio</strong> · Recensione Google</figcaption>
          </figure>
          <figure class="recensione" data-reveal>
            <span class="stelle" aria-label="5 stelle su 5">★★★★★</span>
            <blockquote>Persone molto gentili, e accoglienti ti fanno sentire come a casa, posto molto pulito personale efficente. Ottimo lavoro.</blockquote>
            <figcaption><strong>Lily Lily</strong> · Recensione Google</figcaption>
          </figure>
        </div>
        <p class="recensioni-link"><a class="link-testo" href="${MAPPA_RECENSIONI}" target="_blank" rel="noopener">Tutte le recensioni su Google</a></p>
      </div>
    </section>

    <section class="sez sez-bianca" id="dove" aria-labelledby="doveTitolo">
      <div class="sez-inner">
        <div class="sez-testa" data-reveal>
          <h2 id="doveTitolo">Dove siamo</h2>
          <p>Nel centro storico di Alessandria, a due passi dal Duomo.</p>
        </div>
        <div class="dove">
          <div class="mappa">
            <iframe src="https://www.google.com/maps?q=Via+San+Lorenzo+46,+15121+Alessandria&output=embed" title="Mappa: Essenza d'Oriente, Via San Lorenzo 46, Alessandria" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
          <div class="dove-info" data-reveal>
            <div class="dove-voce">${I.pin}<div><strong>Indirizzo</strong><span>Via San Lorenzo 46, 15121 Alessandria (AL)</span></div></div>
            <div class="dove-voce">${I.orologio}<div><strong>Orari</strong><span>Tutti i giorni, 9:30 – 22:30</span></div></div>
            <div class="dove-voce">${I.tel}<div><strong>Telefono</strong><a href="tel:${TEL}">${TEL_VISIBILE}</a></div></div>
            <div class="dove-azioni">
              <a class="btn btn-secondario" href="${MAPPA_INDICAZIONI}" target="_blank" rel="noopener">Come arrivare</a>
              <a class="btn btn-wa" href="${WA}" target="_blank" rel="noopener">${I.wa} WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="sez" id="faq" aria-labelledby="faqTitolo">
      <div class="sez-inner">
        <div class="sez-testa" data-reveal>
          <h2 id="faqTitolo">Domande frequenti</h2>
        </div>
        <div class="faq" data-reveal>
          <details>
            <summary>È la mia prima volta: cosa devo aspettarmi?</summary>
            <p>Ti accogliamo con calma, ti chiediamo se hai zone da evitare o preferenze, e ti spieghiamo brevemente come si svolge il trattamento scelto. Non serve nessuna preparazione particolare: vieni come sei, al resto pensiamo noi.</p>
          </details>
          <details>
            <summary>Cosa indosso durante il trattamento?</summary>
            <p>Dipende dal tipo scelto: per i massaggi con olio si resta a torso nudo o in intimo, sempre coperti da un telo dove serve; per tuina, shiatsu, riflessologia, coppettazione e gua sha si resta vestiti comodi. Asciugamani, teli e ciabattine sono già a disposizione.</p>
          </details>
          <details>
            <summary>Posso venire se sono incinta?</summary>
            <p>Sì, ma avvisaci al momento della prenotazione: alcuni trattamenti (come la coppettazione) sono sconsigliati in gravidanza, ma possiamo proporti un'alternativa adatta a te.</p>
          </details>
          <details>
            <summary>Come cancello o sposto una prenotazione?</summary>
            <p>Chiamaci o scrivici su WhatsApp con un po' di anticipo: siamo sempre disponibili a trovare un altro orario. Si può pagare sia in contanti che con carta di credito o debito.</p>
          </details>
        </div>
      </div>
    </section>

${sezionePrenota(null)}
  </main>

${footer('')}
${sheet()}
${scripts('')}
  <script>
    if (typeof LANDING_HEADLINE === 'string' && LANDING_HEADLINE) {
      document.getElementById('headline').textContent = LANDING_HEADLINE;
    }
  </script>
</body>
</html>
`;
}

/* ---------- PAGINA TRATTAMENTO ---------- */
function paginaTratt(t) {
  const foto = `foto/tratt-${t.id}`;
  const ldjson = `  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "${t.nome}",
    "serviceType": "${t.nome}",
    "areaServed": "Alessandria",
    "image": "${DOMINIO}${foto}.jpg",
    "url": "${DOMINIO}trattamenti/${t.id}.html",
    "provider": {
      "@type": "HealthAndBeautyBusiness",
      "name": "Essenza d'Oriente",
      "telephone": "${TEL}",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Via San Lorenzo 46",
        "postalCode": "15121",
        "addressLocality": "Alessandria",
        "addressRegion": "AL",
        "addressCountry": "IT"
      }
    }
  }`;
  const wa = waLink(`Ciao! Vorrei informazioni su: ${t.nome} (${t.durata}, ${t.prezzo}).`);
  const correlati = t.correlati.map(daId).map((c) => `          <a class="correlato" href="${c.id}.html">
            <div><strong>${c.nome}</strong><span>${c.durata} · ${c.prezzo}</span></div>
            ${I.freccia}
          </a>`).join('\n');

  return `${head({
    base: '../',
    title: t.titoloSeo,
    desc: t.descSeo,
    canonical: `${DOMINIO}trattamenti/${t.id}.html`,
    ogTitle: `${t.h1} — Essenza d'Oriente`,
    ogImage: `${DOMINIO}${foto}.jpg`,
    extraHead: `  <link rel="preload" as="image" href="../${foto}.webp" fetchpriority="high" />`,
    ldjson
  })}
<body class="pagina-tratt" data-tratt="${t.id}">
${header('../')}
${barraMobile(t)}

  <main>
    <section class="hero hero-tratt" aria-labelledby="h1">
      <div class="hero-inner">
        <div>
          <nav class="briciole" aria-label="Percorso">
            <a href="../index.html">Home</a><span aria-hidden="true">›</span>
            <a href="../index.html#trattamenti">Trattamenti</a><span aria-hidden="true">›</span>
            <span aria-current="page">${t.nome}</span>
          </nav>
          <h1 id="h1">${t.h1}</h1>
          <p class="hero-sub">${t.sotto}</p>
          <p class="hero-prezzo"><strong>${t.prezzo}</strong><span>${t.durata}${t.nota ? ' · ' + t.nota.toLowerCase() : ''}</span></p>
          <p class="hero-fiducia"><span>5,0</span><span class="stella" aria-hidden="true">★</span><span>· 146 recensioni Google</span></p>
          <div class="hero-azioni">
            <a class="btn btn-primario" id="heroCta" href="#prenota" data-prenota data-tratt="${t.id}" data-origine="hero">Prenota questo trattamento</a>
            <a class="link-testo" href="${wa}" target="_blank" rel="noopener">Chiedi su WhatsApp</a>
          </div>
          <p class="hero-stato" id="statoApertura">Aperti oggi fino alle 22:30</p>
        </div>
        <figure class="hero-foto">
          <picture>
            <source srcset="../${foto}.webp" type="image/webp" />
            <img src="../${foto}.jpg" alt="${t.nome} da Essenza d'Oriente, Alessandria" width="1200" height="669" fetchpriority="high" decoding="async" />
          </picture>
        </figure>
      </div>
    </section>

    <section class="sez">
      <div class="sez-inner corpo">
        <div class="corpo-testo" data-reveal>
          <h2>Che cos'è</h2>
          <p>${t.cosa}</p>
          <h2>Benefici</h2>
          <p>${t.benefici}</p>
          <h2>Come si svolge</h2>
          <p>${t.svolgimento}</p>
          ${t.avviso ? `<p class="avviso">${t.avviso}</p>` : ''}
        </div>
        <aside class="box-prezzo" aria-label="Prezzo e prenotazione">
          <span class="box-prezzo-cifra">${t.prezzo}</span>
          <span class="box-prezzo-info">${t.nome} · ${t.durata}${t.nota ? '<br />' + t.nota : ''}</span>
          <a class="btn btn-primario btn-pieno" href="#prenota" data-prenota data-tratt="${t.id}" data-origine="box">Prenota</a>
          <a class="btn btn-wa btn-pieno" href="${wa}" target="_blank" rel="noopener">${I.wa} WhatsApp</a>
          <span class="box-prezzo-nota">oppure chiama <a href="tel:${TEL}">${TEL_VISIBILE}</a></span>
        </aside>
      </div>
    </section>

    <section class="sez sez-bianca" aria-labelledby="corrTitolo">
      <div class="sez-inner">
        <div class="sez-testa" data-reveal>
          <h2 id="corrTitolo">Potrebbe interessarti anche</h2>
        </div>
        <div class="correlati" data-reveal>
${correlati}
        </div>
      </div>
    </section>

${sezionePrenota(t)}
  </main>

${footer('../')}
${sheet()}
${scripts('../')}
</body>
</html>
`;
}


/* ---------- PAGINE LEGALI ---------- */
function paginaLegale(o) {
  return `${head({
    base: '', title: o.title, desc: o.desc, canonical: DOMINIO + o.file, robots: 'noindex',
    ogImage: DOMINIO + 'foto/brand-banner.jpg'
  })}
<body>
${header('', 'index.html#prenota')}
${barraMobile(null, 'index.html#prenota')}
  <main>
    <section class="sez">
      <div class="sez-inner legale" data-reveal>
        <h1>${o.h1}</h1>
        <p><em>Ultimo aggiornamento: 30 ottobre 2026</em></p>
${o.corpo}
      </div>
    </section>
  </main>
${footer('')}
${scripts('')}
</body>
</html>
`;
}

const PRIVACY = {
  file: 'privacy.html', h1: 'Privacy',
  title: 'Informativa Privacy — Essenza d\'Oriente',
  desc: 'Informativa privacy di Essenza d\'Oriente, centro olistico ad Alessandria.',
  corpo: `        <h2>Titolare del trattamento</h2>
        <p>Essenza d'Oriente — Via San Lorenzo 46, 15121 Alessandria (AL). P.IVA 14409690964. Contatti: <a href="tel:${TEL}">${TEL_VISIBILE}</a>.</p>
        <h2>Quali dati trattiamo</h2>
        <p>Questo sito non richiede registrazione e non raccoglie direttamente dati personali tramite moduli propri. I dati che ci fornisci telefonando, scrivendo su WhatsApp o prenotando tramite il widget Treatwell sono trattati al solo scopo di gestire la tua prenotazione.</p>
        <h2>Prenotazione online (Treatwell)</h2>
        <p>La prenotazione online è gestita da Treatwell (Hotspring Ventures Ltd) tramite il widget incorporato nel sito; Treatwell agisce come autonomo titolare per i dati inseriti nel modulo di prenotazione. Consulta l'informativa privacy di Treatwell sul loro sito per i dettagli.</p>
        <h2>Statistiche e misurazione</h2>
        <p>Il sito utilizza Google Analytics, Google Ads e Google Tag Manager per capire quante persone visitano la pagina e misurare l'efficacia delle campagne. I cookie di misurazione si attivano solo se accetti dal banner. Per i dettagli, consulta la <a href="cookie.html">cookie policy</a>.</p>
        <h2>I tuoi diritti</h2>
        <p>Puoi richiedere in ogni momento l'accesso, la rettifica o la cancellazione dei tuoi dati contattandoci ai recapiti sopra indicati. Hai inoltre diritto di proporre reclamo al Garante per la protezione dei dati personali.</p>`
};
const COOKIE = {
  file: 'cookie.html', h1: 'Cookie',
  title: 'Cookie Policy — Essenza d\'Oriente',
  desc: 'Cookie policy di Essenza d\'Oriente, centro olistico ad Alessandria.',
  corpo: `        <h2>Cosa sono i cookie</h2>
        <p>I cookie sono piccoli file salvati dal browser durante la navigazione. Questo sito ne fa un uso minimo: un cookie tecnico per ricordare la tua scelta sul banner e, solo se accetti, i cookie di misurazione di Google.</p>
        <h2>Widget di prenotazione (Treatwell)</h2>
        <p>Il calendario di prenotazione online è fornito da Treatwell e può impostare cookie tecnici necessari al funzionamento della prenotazione. Titolare: Hotspring Ventures Ltd.</p>
        <h2>Mappa (Google Maps)</h2>
        <p>La mappa nella sezione "Dove siamo" è fornita da Google e può impostare cookie di Google LLC.</p>
        <h2>Misurazione (Google Analytics, Google Ads, Tag Manager)</h2>
        <p>Il Google tag è caricato in modalità consenso: finché non scegli "Accetta" nel banner, non viene salvato alcun cookie di misurazione o pubblicitario. Se scegli "Rifiuta", Google Tag Manager non viene caricato. Puoi cambiare scelta in qualsiasi momento cancellando i dati di navigazione del browser per questo sito.</p>
        <h2>Come gestire i cookie</h2>
        <p>Puoi bloccare o cancellare i cookie in qualsiasi momento dalle impostazioni del tuo browser. Il sito resta consultabile anche senza cookie: potrebbero non funzionare solo la prenotazione online e la mappa.</p>`
};

/* ---------- scrittura ---------- */
fs.writeFileSync(path.join(__dirname, 'index.html'), home());
console.log('scritto index.html');
[PRIVACY, COOKIE].forEach((o) => {
  fs.writeFileSync(path.join(__dirname, o.file), paginaLegale(o));
  console.log('scritto ' + o.file);
});
TRATTAMENTI.forEach((t) => {
  fs.writeFileSync(path.join(__dirname, 'trattamenti', t.id + '.html'), paginaTratt(t));
  console.log('scritto trattamenti/' + t.id + '.html');
});
