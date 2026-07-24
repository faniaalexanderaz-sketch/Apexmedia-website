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
    descSeo: 'Tuina e Shiatsu ad Alessandria: pressioni e manipolazioni lungo i meridiani. 50 minuti, 50 €. 5,0★ su Google, 76 recensioni. Aperti tutti i giorni.',
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
    descSeo: 'Coppettazione ad Alessandria: tecnica tradizionale cinese con coppe a effetto ventosa, 25 €. 5,0★ su Google, 76 recensioni. Aperti tutti i giorni.',
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
    descSeo: 'Massaggio spa rilassante di corpo completo ad Alessandria: 90 minuti, 90 €. 5,0★ su Google, 76 recensioni. Aperti tutti i giorni fino alle 22:30.',
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
    titoloSeo: 'Pulizia delle Orecchie con Micro-telecamera ad Alessandria — Essenza d\'Oriente',
    descSeo: 'Pulizia orecchie professionale ad Alessandria con micro-telecamera: vedi tutto in tempo reale. 25 €. 5,0★ su Google. Aperti 7/7 fino alle 22:30.',
    h1: 'Pulizia delle Orecchie ad Alessandria',
    sotto: 'Con micro-telecamera, in tempo reale',
    prezzo: '25 €', durata: 'Seduta breve',
    cosa: 'Un servizio di pulizia auricolare eseguito con strumentazione moderna e visibile: una micro-telecamera (otoscopio) collegata a uno schermo permette all\'operatore — e spesso anche a te — di vedere in tempo reale l\'interno dell\'orecchio durante la pulizia. Si utilizzano bastoncini di legno dedicati per la rimozione manuale del cerume in eccesso e una pompetta ad aria per completare la pulizia in modo delicato. Non si utilizzano in alcun modo fuoco o candele auricolari: è una tecnica diversa e più controllata, diventata popolare anche sui social proprio per la componente visiva e rilassante della seduta.',
    benefici: 'Pulizia visibile e controllata passo dopo passo, sensazione di leggerezza e comfort auricolare, esperienza rilassante grazie alla delicatezza degli strumenti utilizzati.',
    svolgimento: 'Si resta comodamente seduti mentre l\'operatore mostra sullo schermo cosa sta facendo durante tutta la seduta.',
    avviso: 'Questo è un servizio di pulizia e benessere estetico, non un trattamento medico. In caso di problemi specifici alle orecchie (dolore, infezioni, perdita di udito) è bene rivolgersi a un medico otorinolaringoiatra.'
  }
];

const LOTO = '<svg width="34" height="20" viewBox="0 0 34 20" fill="currentColor"><path d="M17 1.5c2.4 3.4 2.4 7.6 0 11.4-2.4-3.8-2.4-8 0-11.4Z"/><path d="M10.6 4.4c3 1.9 4.6 5 4.3 8.7-3.6-1-5.7-4.1-4.3-8.7Z"/><path d="M23.4 4.4c1.4 4.6-.7 7.7-4.3 8.7-.3-3.7 1.3-6.8 4.3-8.7Z"/><path d="M4.4 8.6c3.6.4 7 2.4 8.6 5.6-4 1.1-7.6-1.5-8.6-5.6Z"/><path d="M29.6 8.6c-1 4.1-4.6 6.7-8.6 5.6 1.6-3.2 5-5.2 8.6-5.6Z"/><path d="M9.5 16.2c2.3-.9 5-.9 7.5-.9s5.2 0 7.5.9c-2.3 1.6-4.8 2.3-7.5 2.3s-5.2-.7-7.5-2.3Z" opacity=".55"/></svg>';

const ICONA_TEL = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>';
const ICONA_WA = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.1-.7l.5-.6c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.6-.3Z"/></svg>';
const ICONA_HAMBURGER = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

/* elenco completo dei trattamenti per il menu a scomparsa — durata/prezzo
   brevi, coerenti con la griglia della home. "Pedicure" non ha una pagina
   dedicata, quindi punta alla sezione trattamenti della home. */
const MENU_TRATTAMENTI = [
  { file: 'massaggio-oli-essenziali.html', nome: 'Massaggio Oli Essenziali', info: 'Cervicale e schiena · 60 min · 60 €' },
  { file: 'tuina-shiatsu.html', nome: 'Tuina Shiatsu', info: '50 min · 50 €' },
  { file: 'massaggio-spa.html', nome: 'Massaggio Spa', info: 'Corpo completo · 90 min · 90 €' },
  { file: 'riflessologia-plantare.html', nome: 'Riflessologia Plantare', info: '40 min 35 € · 60 min 50 €' },
  { file: 'coppettazione.html', nome: 'Coppettazione', info: 'Cupping · 25 €' },
  { file: 'gua-sha.html', nome: 'Gua Sha', info: '25 €' },
  { file: 'pulizia-orecchie.html', nome: 'Pulizia delle Orecchie', info: 'Con micro-telecamera · 25 €' },
  { file: null, nome: 'Pedicure', info: '35 €' }
];

/* drawer del menu: "base" è il prefisso per raggiungere la home e le
   pagine sorelle — '../' dentro trattamenti/, '' in radice. */
function menuDrawer(base) {
  const voci = MENU_TRATTAMENTI.map((t) => {
    const href = t.file ? base + t.file : base + 'index.html#trattamenti';
    return `      <li><a href="${href}"><span class="menu-tratt-nome">${t.nome}</span><span class="menu-tratt-info">${t.info}</span></a></li>`;
  }).join('\n');
  return `<div class="menu-scrim" id="menuScrim" hidden></div>
  <aside class="menu-drawer" id="menuDrawer" hidden aria-label="Menu del sito">
    <div class="menu-drawer-testa">
      <span class="marchio-nome">Essenza d'Oriente</span>
      <button class="menu-chiudi" id="menuChiudi" aria-label="Chiudi il menu">×</button>
    </div>
    <nav class="menu-sezioni">
      <a href="${base}index.html#trattamenti">Trattamenti</a>
      <a href="${base}index.html#prenota">Prenota</a>
      <a href="${base}index.html#dove">Dove siamo</a>
    </nav>
    <p class="menu-titolo">I nostri trattamenti</p>
    <ul class="menu-tratt-lista">
${voci}
    </ul>
    <div class="menu-drawer-cta">
      <a class="btn btn-prenota" href="${base}index.html#prenota">Prenota ora</a>
      <a class="btn btn-wa" href="https://wa.me/393317153533" target="_blank" rel="noopener">WhatsApp</a>
    </div>
  </aside>`;
}

function pagina(t, altri) {
  const altriLink = altri.map(a => `<a href="${a.file}">${a.nome}</a>`).join('\n        ');
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${t.titoloSeo}</title>
  <meta name="description" content="${t.descSeo}" />
  <link rel="stylesheet" href="../styles.css" />

  <!-- Google Tag Manager — sostituire GTM-XXXXXXX con l'ID reale -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
  <!-- End Google Tag Manager -->

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "${t.nome}",
    "serviceType": "${t.nome}",
    "areaServed": "Alessandria",
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
<body class="pagina-tratt">
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->

  <header class="top">
    <div class="top-inizio">
      <button class="menu-btn" id="menuBtn" aria-label="Apri il menu dei trattamenti" aria-expanded="false" aria-controls="menuDrawer">${ICONA_HAMBURGER}</button>
      <a class="marchio" href="../index.html">
        <span class="marchio-nome">Essenza d'Oriente</span>
        <span class="marchio-sotto">Centro Olistico</span>
      </a>
    </div>
    <nav class="top-nav" aria-label="Sezioni">
      <a href="../index.html#trattamenti">Trattamenti</a>
      <a href="#prenota">Prenota</a>
      <a href="../index.html#dove">Dove siamo</a>
    </nav>
    <div class="top-azioni">
      <a class="btn btn-chiama" href="tel:+393317153533">${ICONA_TEL} Chiama</a>
      <a class="btn btn-wa" href="https://wa.me/393317153533" target="_blank" rel="noopener">${ICONA_WA} WhatsApp</a>
    </div>
  </header>

  ${menuDrawer('../')}

  <div class="barra-mobile" role="navigation" aria-label="Contatti rapidi">
    <a class="btn btn-chiama" href="tel:+393317153533">${ICONA_TEL} Chiama</a>
    <a class="btn btn-wa" href="https://wa.me/393317153533" target="_blank" rel="noopener">${ICONA_WA} WhatsApp</a>
  </div>

  <main>
    <section class="hero-tratt">
      <span class="etichetta">Essenza d'Oriente · Alessandria</span>
      <h1>${t.h1}</h1>
      <p class="hero-sub">${t.sotto} · <span class="stelle" aria-hidden="true">★★★★★</span> 5,0 su Google</p>
      <p><a class="btn btn-prenota" href="#prenota">Prenota questo trattamento</a></p>
    </section>

    <div class="foto-tratt">
      <div class="foto-segnaposto" role="img" aria-label="Foto del trattamento ${t.nome} in arrivo">[FOTO TRATTAMENTO DA INSERIRE]</div>
    </div>

    <section class="sez">
      <div class="corpo-tratt">
        <h2>Che cos'è</h2>
        <p>${t.cosa}</p>
        <h2>Benefici</h2>
        <p>${t.benefici}</p>
        <h2>Come si svolge</h2>
        <p>${t.svolgimento}</p>
        ${t.avviso ? `<p class="avviso">${t.avviso}</p>` : ''}
      </div>
      <div class="box-prezzo">
        <span><strong>${t.prezzo}</strong></span>
        <span>${t.durata} · Essenza d'Oriente, Alessandria</span>
        <a class="btn btn-prenota" href="#prenota">Prenota</a>
      </div>
    </section>

    <div class="loto-divisore" aria-hidden="true">${LOTO}</div>

    <section class="sez" id="prenota">
      <div class="sez-testa">
        <span class="etichetta">Prenotazione online</span>
        <h2>Prenota il tuo trattamento</h2>
        <p>Scegli data e ora, ricevi conferma immediata.</p>
      </div>
      <div class="prenota-cornice">
        <iframe
          id="treatwellFrame"
          class="treatwell-frame"
          src="https://widget.treatwell.it/salone/532986/menu/"
          title="Prenota il tuo trattamento — calendario Treatwell"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      <div class="prenota-alt">
        <p>Preferisci prenotare al telefono o su WhatsApp?</p>
        <a class="btn btn-chiama" href="tel:+393317153533">Chiama: 331 715 3533</a>
        <a class="btn btn-wa" href="https://wa.me/393317153533" target="_blank" rel="noopener">Scrivici su WhatsApp</a>
      </div>
    </section>

    <section class="sez">
      <div class="sez-testa">
        <span class="etichetta">Indecisa/o tra due opzioni?</span>
        <h2>Altri trattamenti</h2>
      </div>
      <div class="altri-tratt">
        ${altriLink}
      </div>
    </section>
  </main>

  <footer class="fondo">
    <p class="fondo-nome">Essenza d'Oriente</p>
    <p class="fondo-cinese" lang="zh">东方之<span class="cuore">♥</span>养生馆</p>
    <p>Via San Lorenzo 46, 15121 Alessandria · <a href="tel:+393317153533">331 715 3533</a></p>
    <p class="fondo-legale">P.IVA [DA FORNIRE] · <a href="../privacy.html">Privacy</a> · <a href="../cookie.html">Cookie</a></p>
  </footer>

  <script src="../script.js"></script>
</body>
</html>
`;
}

TRATTAMENTI.forEach((t) => {
  const altri = TRATTAMENTI.filter((x) => x.file !== t.file);
  fs.writeFileSync(path.join(__dirname, 'trattamenti', t.file), pagina(t, altri));
  console.log('scritto trattamenti/' + t.file);
});
