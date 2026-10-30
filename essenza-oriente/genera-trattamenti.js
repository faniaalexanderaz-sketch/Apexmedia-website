/* =============================================================
   Generatore delle pagine trattamento — eseguire con:
     node genera-trattamenti.js
   Produce i file in trattamenti/ a partire da un unico template,
   così header, footer e struttura restano identici ovunque.
   I contenuti (che cos'è / benefici / come si svolge) sono quelli
   verificati forniti nel brief — non inventati.
   ============================================================= */
const fs = require('fs');
const path = require('path');

const TRATTAMENTI = [
  {
    file: 'massaggio-oli-essenziali.html',
    nome: 'Massaggio Oli Essenziali',
    titoloSeo: 'Massaggio Cervicale e Schiena con Oli Essenziali ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Massaggio decontratturante cervicale e schiena con oli essenziali ad Alessandria. 60 minuti, 60 €. 5,0★ su Google. Aperti 7/7 fino alle 22:30.',
    h1: 'Massaggio Oli Essenziali ad Alessandria',
    sotto: 'Cervicale e schiena · 60 minuti',
    prezzo: '60 €', durata: '60 min',
    cosa: 'Un massaggio manuale mirato su collo, spalle e schiena, eseguito con oli essenziali che favoriscono il rilassamento muscolare e rendono più scorrevoli le manovre. È il trattamento più indicato per chi soffre di tensioni da postura scorretta, lavoro alla scrivania o stress accumulato nella parte alta della schiena.',
    benefici: 'Aiuta ad allentare le contratture di collo e spalle, può migliorare la sensazione di mobilità del collo e favorisce il rilassamento generale. L\'aromaterapia dell\'olio contribuisce al benessere psicofisico durante la seduta.',
    svolgimento: 'La seduta dura 60 minuti. Si resta generalmente a torso nudo o con abbigliamento comodo, secondo le indicazioni dell\'operatore, in un ambiente raccolto e rilassante.',
    avviso: null
  },
  {
    file: 'tuina-shiatsu.html',
    nome: 'Tuina Shiatsu',
    titoloSeo: 'Massaggio Tuina Shiatsu ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Tuina e Shiatsu ad Alessandria: pressioni e manipolazioni lungo i meridiani. 50 minuti, 50 €. 5,0★ su Google, 146 recensioni. Aperti tutti i giorni.',
    h1: 'Tuina Shiatsu ad Alessandria',
    sotto: 'Tecniche orientali · 50 minuti',
    prezzo: '50 €', durata: '50 min',
    cosa: 'Un trattamento che unisce due tecniche di origine orientale: il Tuina, massaggio tradizionale cinese riconosciuto dall\'OMS nel 1998 come pratica terapeutica, e lo Shiatsu, tecnica giapponese a pressione statica di dita e palmi, nata dall\'evoluzione delle stesse radici della medicina orientale. Il Tuina è più dinamico, con manovre di pressione, sfregamento e mobilizzazione; lo Shiatsu è più statico e si concentra sulla pressione mirata lungo i meridiani energetici.',
    benefici: 'Entrambe le tecniche sono tradizionalmente associate all\'alleviamento delle tensioni muscolari, al miglioramento della circolazione, alla riduzione dello stress e al rilassamento generale del sistema nervoso.',
    svolgimento: 'La seduta dura 50 minuti e si svolge generalmente vestiti (a differenza dei massaggi a olio), su tappeto o lettino, con pressioni e manipolazioni su punti specifici del corpo.',
    avviso: null
  },
  {
    file: 'riflessologia-plantare.html',
    nome: 'Riflessologia Plantare',
    titoloSeo: 'Riflessologia Plantare ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Riflessologia plantare ad Alessandria: 40 o 60 minuti, da 35 €. Stimolazione dei punti riflessi del piede. 5,0★ su Google. Aperti 7/7 fino alle 22:30.',
    h1: 'Riflessologia Plantare ad Alessandria',
    sotto: '40 o 60 minuti',
    prezzo: '35 € / 50 €', durata: '40 min / 60 min',
    cosa: 'Una pratica che stimola punti specifici della pianta del piede, secondo la mappa della riflessologia plantare, che ha origine sia nella medicina tradizionale cinese sia in studi occidentali del primo Novecento. Ogni zona del piede è tradizionalmente associata a un\'area del corpo.',
    benefici: 'Favorisce il rilassamento generale e può contribuire ad alleviare stress e tensione. Molte persone la trovano utile per il senso di pesantezza alle gambe dopo una giornata in piedi.',
    svolgimento: 'La seduta dura 40 o 60 minuti, a seconda della durata scelta. Si resta comodamente seduti o sdraiati: si tolgono solo le calzature.',
    avviso: null
  },
  {
    file: 'coppettazione.html',
    nome: 'Coppettazione',
    titoloSeo: 'Coppettazione (Cupping) ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Coppettazione ad Alessandria: tecnica tradizionale cinese con coppe a effetto ventosa, 25 €. 5,0★ su Google, 146 recensioni. Aperti tutti i giorni.',
    h1: 'Coppettazione ad Alessandria',
    sotto: 'Cupping — tecnica tradizionale cinese',
    prezzo: '25 €', durata: 'Seduta breve',
    cosa: 'Una tecnica di origine antica, propria della medicina tradizionale cinese, che utilizza piccole coppe — in vetro, bambù o silicone — applicate sulla pelle con un effetto ventosa, per richiamare sangue e circolazione verso l\'area trattata.',
    benefici: 'Tradizionalmente associata a un miglioramento della circolazione locale, al rilascio delle tensioni muscolari e a una sensazione di sollievo sulle zone contratte della schiena.',
    svolgimento: 'Le coppette vengono posizionate e lasciate agire per alcuni minuti, oppure mosse delicatamente sulla pelle. È normale che restino sulla pelle segni rotondi rosso-violacei per alcuni giorni dopo il trattamento: non sono pericolosi, sono un effetto noto e temporaneo.',
    avviso: 'La coppettazione è sconsigliata in gravidanza, su pelle lesa o ferite aperte, e in caso di fragilità capillare. In caso di dubbi, chiedici pure informazioni prima di prenotare.'
  },
  {
    file: 'gua-sha.html',
    nome: 'Gua Sha',
    titoloSeo: 'Gua Sha ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Gua sha ad Alessandria: scorrimento di pietra liscia per stimolare la circolazione, 25 €. Centro olistico 5,0★ su Google. Aperti 7/7 fino alle 22:30.',
    h1: 'Gua Sha ad Alessandria',
    sotto: 'Tecnica tradizionale cinese',
    prezzo: '25 €', durata: 'Seduta breve',
    cosa: 'Una tecnica della medicina tradizionale cinese che consiste nello scorrimento di uno strumento liscio — spesso una pietra piatta — sulla pelle, per generare calore e stimolare la circolazione superficiale.',
    benefici: 'Tradizionalmente usato per favorire il rilascio delle tensioni muscolari e connettivali; è molto diffuso anche come trattamento di benessere del viso.',
    svolgimento: 'Movimenti di scorrimento ripetuti sulla zona trattata. Può lasciare arrossamenti temporanei sulla pelle, che scompaiono in pochi giorni.',
    avviso: 'Il gua sha è sconsigliato a chi ha problemi di coagulazione del sangue o fragilità capillare. In caso di dubbi, chiedici pure informazioni prima di prenotare.'
  },
  {
    file: 'massaggio-spa.html',
    nome: 'Massaggio Spa',
    titoloSeo: 'Massaggio Spa Corpo Completo ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Massaggio spa rilassante di corpo completo ad Alessandria: 90 minuti, 90 €. 5,0★ su Google, 146 recensioni. Aperti tutti i giorni fino alle 22:30.',
    h1: 'Massaggio Spa ad Alessandria',
    sotto: 'Corpo completo · 90 minuti',
    prezzo: '90 €', durata: '90 min',
    cosa: 'Un massaggio rilassante di corpo completo, pensato come momento di puro benessere più che come trattamento mirato a un problema specifico.',
    benefici: 'Rilassamento profondo, riduzione dello stress percepito e un\'ora e mezza dedicata interamente al proprio benessere.',
    svolgimento: 'La seduta dura 90 minuti, la più lunga tra i trattamenti del centro: è indicata per chi desidera un\'esperienza di relax completa, non solo un intervento su una zona specifica.',
    avviso: null
  },
  {
    file: 'pulizia-orecchie.html',
    nome: 'Pulizia delle Orecchie',
    titoloSeo: 'Pulizia delle Orecchie in Stile Tradizionale Cinese ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Pulizia orecchie in stile tradizionale cinese (cǎi ěr) ad Alessandria: strumenti dedicati in bambù e metallo, piuma per la fase finale. 25 €. 5,0★ su Google.',
    h1: 'Pulizia delle Orecchie ad Alessandria',
    sotto: 'Tecnica tradizionale cinese',
    prezzo: '25 €', durata: 'Seduta breve',
    cosa: 'Un servizio di pulizia auricolare eseguito secondo la tecnica tradizionale cinese nota come cǎi ěr (采耳, letteralmente "raccogliere l\'orecchio"), una pratica diffusa da secoli in Cina — celebre in particolare nella tradizione delle case da tè di Chengdu, nel Sichuan. Non si utilizza alcuna micro-telecamera: l\'operatore lavora con un piccolo set di strumenti dedicati, tra cui cucchiaini e bastoncini in bambù o metallo di forme e lunghezze diverse per la rimozione delicata del cerume, piccole pinzette per i residui più visibili e, nella fase finale, un morbido piumino che sfiora e vibra leggermente all\'interno dell\'orecchio, regalando una tipica sensazione di leggerezza e relax.',
    benefici: 'Pulizia delicata e accurata, sensazione di leggerezza e comfort auricolare, momento di profondo relax grazie al tocco calibrato degli strumenti tradizionali e alla fase finale con il piumino.',
    svolgimento: 'Si resta comodamente seduti mentre l\'operatore lavora con calma, alternando gli strumenti secondo necessità, fino alla fase finale di stimolazione con il piumino.',
    avviso: 'Questo è un servizio di pulizia e benessere estetico, non un trattamento medico. In caso di problemi specifici alle orecchie (dolore, infezioni, perdita di udito) è bene rivolgersi a un medico otorinolaringoiatra.'
  },
  {
    file: 'pedicure.html',
    nome: 'Pedicure',
    titoloSeo: 'Pedicure in Stile Tradizionale Cinese ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Pedicure in stile tradizionale cinese (xiūjiǎo) ad Alessandria: ammollo, cura di calli e duroni con strumenti dedicati, rifinitura delle unghie. 35 €.',
    h1: 'Pedicure ad Alessandria',
    sotto: 'Cura del piede in stile tradizionale cinese',
    prezzo: '35 €', durata: 'Seduta breve',
    cosa: 'Un servizio di cura del piede ispirato alla tradizione cinese dello xiūjiǎo (修脚, letteralmente "rifinire il piede"), un\'arte antica e molto radicata in Cina — storicamente celebre a Pechino, dove è riconosciuta come patrimonio culturale — incentrata più sulla cura precisa del piede che sulla sola estetica dello smalto. Il piede viene prima ammorbidito con un ammollo caldo, poi l\'operatore lavora con piccoli strumenti dedicati e ben affilati per rifinire con precisione calli, duroni e unghie, prestando particolare attenzione ai bordi e agli angoli più delicati.',
    benefici: 'Piedi visibilmente più lisci e curati, sensazione di leggerezza dopo la rimozione di calli e pelle indurita, unghie rifinite con precisione.',
    svolgimento: 'Si comincia con un ammollo rilassante, seguito dalla cura vera e propria di calli, duroni e unghie con gli strumenti dedicati, fino alla rifinitura finale.',
    avviso: 'Questo è un servizio di cura estetica del piede, non un trattamento medico podologico. In caso di condizioni specifiche (diabete, infezioni, problemi circolatori) è bene consultare prima un podologo o un medico.'
  }
];

/* id usati da script.js per preselezionare il trattamento nel pannello */
const ID_SHEET = {
  'massaggio-oli-essenziali.html': 'oli',
  'tuina-shiatsu.html': 'tuina',
  'riflessologia-plantare.html': 'riflessologia',
  'massaggio-spa.html': 'spa',
  'coppettazione.html': 'coppettazione',
  'gua-sha.html': 'guasha',
  'pulizia-orecchie.html': 'orecchie',
  'pedicure.html': 'pedicure'
};

const WA_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.1-.7l.5-.6c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.6-.3Z"/></svg>';
const TEL_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>';
const WA_MSG = (nome) => encodeURIComponent(`Ciao! Vorrei prenotare: ${nome}. Quando avete disponibilità?`);

function header() {
  return `  <header class="top" id="top">
    <a class="marchio" href="../index.html">
      <span class="marchio-nome">Essenza d'Oriente</span>
      <span class="marchio-sotto">Centro Olistico · Alessandria</span>
    </a>
    <nav class="top-nav" aria-label="Sezioni">
      <a href="../index.html#trattamenti">Trattamenti</a>
      <a href="../index.html#recensioni">Recensioni</a>
      <a href="../index.html#dove">Dove siamo</a>
    </nav>
    <div class="top-azioni">
      <a class="top-tel" href="tel:+393317153533">331 715 3533</a>
      <a class="btn btn-primario btn-piccolo" href="#prenota" data-prenota>Prenota</a>
    </div>
  </header>`;
}

function footer() {
  return `  <footer class="fondo">
    <div class="fondo-inner">
      <div class="fondo-col">
        <p class="fondo-nome">Essenza d'Oriente</p>
        <p class="firma" lang="zh">东方之<span class="cuore">心</span>养生馆</p>
        <p>Centro olistico ad Alessandria. Tecniche tradizionali orientali, tutti i giorni fino alle 22:30.</p>
      </div>
      <div class="fondo-col">
        <strong>Contatti</strong>
        <a href="tel:+393317153533">331 715 3533</a>
        <a href="https://wa.me/393317153533" target="_blank" rel="noopener">WhatsApp</a>
        <span>Via San Lorenzo 46, 15121 Alessandria</span>
        <span>Tutti i giorni 9:30 – 22:30</span>
      </div>
      <div class="fondo-col">
        <strong>Seguici</strong>
        <a href="https://www.instagram.com/essenza.oriente?igsh=ZWpoOTBrMDduMW5i&amp;utm_source=qr" target="_blank" rel="noopener">Instagram</a>
        <a href="https://www.facebook.com/share/14jFSwS4Ysi/?mibextid=wwXIfr" target="_blank" rel="noopener">Facebook</a>
        <a href="https://www.tiktok.com/@essenzaoriente.al" target="_blank" rel="noopener">TikTok</a>
      </div>
    </div>
    <div class="fondo-inner">
      <p class="fondo-legale">P.IVA 14409690964 · <a href="../privacy.html">Privacy</a> · <a href="../cookie.html">Cookie</a></p>
    </div>
  </footer>

  <div class="barra-mobile" role="navigation" aria-label="Azioni rapide">
    <a class="btn btn-primario" href="#prenota" data-prenota>Prenota ora</a>
    <a class="btn btn-wa btn-icona" href="https://wa.me/393317153533" target="_blank" rel="noopener" aria-label="Scrivici su WhatsApp">${WA_SVG.replace('width="16" height="16"', 'width="20" height="20"')}</a>
    <a class="btn btn-secondario btn-icona" href="tel:+393317153533" aria-label="Chiama 331 715 3533">${TEL_SVG}</a>
  </div>`;
}

function pagina(t, altri) {
  const slug = t.file.replace('.html', '');
  const altriLink = altri.map(a => `<a href="${a.file}">${a.nome}</a>`).join('\n          ');
  const id = ID_SHEET[t.file];
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <!-- Google tag (gtag.js) — Consent Mode: nessun dato pubblicitario finché
       l'utente non accetta i cookie di misurazione dal banner -->
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
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-5XJQW3HMLL"></script>
  <script>
    gtag('js', new Date());
    gtag('config', 'G-5XJQW3HMLL');
    gtag('config', 'AW-17997395114');
  </script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${t.titoloSeo}</title>
  <meta name="description" content="${t.descSeo}" />
  <link rel="canonical" href="https://essenzadoriente.it/trattamenti/${t.file}" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://essenzadoriente.it/trattamenti/${t.file}" />
  <meta property="og:title" content="${t.h1} — Essenza d'Oriente" />
  <meta property="og:description" content="${t.descSeo}" />
  <meta property="og:image" content="https://essenzadoriente.it/foto/tratt-${slug}.jpg" />
  <meta property="og:locale" content="it_IT" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${t.h1} — Essenza d'Oriente" />
  <meta name="twitter:description" content="${t.descSeo}" />
  <meta name="twitter:image" content="https://essenzadoriente.it/foto/tratt-${slug}.jpg" />

  <link rel="preload" href="../fonts/fraunces-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="../fonts/jost-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="../styles.css" />
  <link rel="icon" href="../favicon.ico" sizes="any" />
  <link rel="icon" href="../favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="icon" href="../favicon-192.png" type="image/png" sizes="192x192" />
  <link rel="apple-touch-icon" href="../favicon-180.png" />
  <script>document.documentElement.classList.add('js');</script>

  <!-- Google Tag Manager: si carica da cookie.js SOLO dopo il consenso -->

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "${t.nome}",
    "serviceType": "${t.nome}",
    "areaServed": "Alessandria",
    "image": "https://essenzadoriente.it/foto/tratt-${slug}.jpg",
    "url": "https://essenzadoriente.it/trattamenti/${t.file}",
    "provider": {
      "@type": "HealthAndBeautyBusiness",
      "name": "Essenza d'Oriente",
      "telephone": "+393317153533",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Via San Lorenzo 46",
        "postalCode": "15121",
        "addressLocality": "Alessandria",
        "addressRegion": "AL",
        "addressCountry": "IT"
      }
    }
  }
  </script>
</head>
<body class="pagina-tratt" data-base="../" data-tratt="${id}">
${header()}

  <main>
    <section class="hero tratt-hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <p class="briciole"><a href="../index.html">Home</a> › <a href="../index.html#trattamenti">Trattamenti</a> › ${t.nome}</p>
          <h1>${t.h1}</h1>
          <p class="hero-sub">${t.sotto}</p>
          <p class="tratt-prezzo-riga"><span class="prezzo">${t.prezzo}</span><span class="durata">${t.durata}</span></p>
          <p class="hero-fiducia"><strong>5,0</strong> <span class="stelle" aria-hidden="true">★★★★★</span> <span>146 recensioni Google</span><span class="punto" aria-hidden="true"></span><span>Aperti 7/7 fino alle 22:30</span></p>
          <div class="hero-cta">
            <a class="btn btn-primario" href="#prenota" data-prenota="${id}">Prenota questo trattamento</a>
            <a class="link" href="https://wa.me/393317153533?text=${WA_MSG(t.nome)}" target="_blank" rel="noopener">Chiedi su WhatsApp</a>
          </div>
        </div>
        <figure class="hero-foto">
          <picture>
            <source srcset="../foto/tratt-${slug}.webp" type="image/webp" />
            <img src="../foto/tratt-${slug}.jpg" alt="${t.nome} da Essenza d'Oriente, Alessandria" width="1200" height="669" fetchpriority="high" />
          </picture>
        </figure>
      </div>
    </section>

    <section class="sez">
      <div class="sez-inner tratt-corpo">
        <div class="tratt-testo">
          <h2>Che cos'è</h2>
          <p>${t.cosa}</p>
          <h2>Benefici</h2>
          <p>${t.benefici}</p>
          <h2>Come si svolge</h2>
          <p>${t.svolgimento}</p>${t.avviso ? `
          <p class="avviso">${t.avviso}</p>` : ''}
        </div>
        <aside class="box-prezzo">
          <span class="prezzo">${t.prezzo}</span>
          <span class="durata">${t.durata} · si paga in sede</span>
          <a class="btn btn-primario btn-pieno" href="#prenota" data-prenota="${id}">Prenota</a>
          <a class="btn btn-wa btn-pieno" href="https://wa.me/393317153533?text=${WA_MSG(t.nome)}" target="_blank" rel="noopener">${WA_SVG} WhatsApp</a>
          <p class="orari">Tutti i giorni 9:30 – 22:30 · <a class="link" href="tel:+393317153533">331 715 3533</a></p>
        </aside>
      </div>
    </section>

    <section class="sez sez-salvia-2">
      <div class="sez-inner">
        <div class="sez-testa">
          <span class="etichetta">Altri trattamenti</span>
          <h2>Indecisa/o tra due opzioni?</h2>
        </div>
        <div class="altri">
          ${altriLink}
        </div>
      </div>
    </section>

    <section class="sez sez-bosco" id="prenota">
      <div class="sez-inner prenota-box">
        <span class="etichetta">Prenotazione</span>
        <h2>Prenota in tre passaggi</h2>
        <p>Scegli il giorno e la fascia oraria. Confermi su Treatwell o su WhatsApp, senza carta e senza registrazione.</p>
        <div class="prenota-azioni">
          <a class="btn btn-chiaro" href="https://widget.treatwell.it/salone/532986/menu/" target="_blank" rel="noopener" data-prenota="${id}">Prenota online</a>
          <a class="btn btn-wa" href="https://wa.me/393317153533?text=${WA_MSG(t.nome)}" target="_blank" rel="noopener">${WA_SVG} Scrivici su WhatsApp</a>
        </div>
        <p class="prenota-nota">Oppure chiama il <a class="link" href="tel:+393317153533">331 715 3533</a>, tutti i giorni dalle 9:30 alle 22:30.</p>
      </div>
    </section>
  </main>

${footer()}

  <script src="../cookie.js"></script>
  <script src="../script.js"></script>
</body>
</html>
`;
}

const dir = path.join(__dirname, 'trattamenti');
fs.mkdirSync(dir, { recursive: true });
TRATTAMENTI.forEach(t => {
  const altri = TRATTAMENTI.filter(a => a.file !== t.file);
  fs.writeFileSync(path.join(dir, t.file), pagina(t, altri), 'utf8');
  console.log('scritto', t.file);
});
