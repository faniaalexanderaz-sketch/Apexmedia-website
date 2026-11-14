/* =============================================================
   Generatore del sito Essenza d'Oriente — eseguire con:
     node genera-sito.js
   Legge i18n/it.json e i18n/zh-CN.json e produce tutte le pagine
   in italiano (URL invariati) e in cinese (prefisso /zh), più la
   sitemap. Header, footer e struttura restano identici ovunque.
   I contenuti (testi, prezzi, SEO) si cambiano SOLO nei file i18n.
   ============================================================= */
const fs = require('fs');
const path = require('path');

const ORIGINE = 'https://essenzadoriente.it';
const LINGUE = ['it.json', 'zh-CN.json'].map((f) => JSON.parse(fs.readFileSync(path.join(__dirname, 'i18n', f), 'utf8')));
const IT = LINGUE[0];
const TEL = '+393317153533';
const TEL_VIS = '331 715 3533';
const WA = 'https://wa.me/393317153533';
const TREATWELL = 'https://widget.treatwell.it/salone/532986/menu/';

/* ---------- pezzi riutilizzabili ---------- */
const ARROW = '<span class="ico"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 13 13 3M5 3h8v8"/></svg></span>';
const WA_PATH = '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.1-.7l.5-.6c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.6-.3Z"/>';
const WA_ICO = `<span class="ico wa"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${WA_PATH}</svg></span>`;
const TEL_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>';
const GOOGLE_G = '<svg class="google-g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C39.9 36.6 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"/></svg>';
const LINEE = '<div class="griglia-linee" aria-hidden="true"><div class="wrap"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const waUrl = (msg) => `${WA}?text=${encodeURIComponent(msg)}`;
const riempi = (s, dati) => s.replace(/\{(\w+)\}/g, (_, k) => dati[k] ?? '');

/* URL di una pagina in una lingua: pagina = '' (home) | 'trattamenti/x.html' | 'privacy.html' */
const url = (t, pagina) => `${t.prefix}/${pagina}`;
const altra = (t) => (t.lang === 'it' ? LINGUE[1] : LINGUE[0]);

function hreflang(pagina) {
  return LINGUE.map((l) => `  <link rel="alternate" hreflang="${l.hreflang}" href="${ORIGINE}${url(l, pagina)}" />`).join('\n') +
    `\n  <link rel="alternate" hreflang="x-default" href="${ORIGINE}${url(IT, pagina)}" />`;
}

function head(t, pagina, { title, description, ogImage, ogType = 'website', schema, extra = '' }) {
  const canonical = `${ORIGINE}${url(t, pagina)}`;
  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
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
${pagina === '' && t.lang === 'it' ? '  <meta name="google-site-verification" content="KfutwzZXjGKLWeHeEKBz8z3UeP-ZxHV_0jgBZmHRqAw" />\n' : ''}${extra}  <title>${title}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${canonical}" />
${hreflang(pagina)}

  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:locale" content="${t.lang === 'it' ? 'it_IT' : 'zh_CN'}" />
  <meta property="og:locale:alternate" content="${t.lang === 'it' ? 'zh_CN' : 'it_IT'}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${ogImage}" />

  <link rel="preload" href="/fonts/fraunces-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/jost-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/vendor/gsap/gsap-bundle.min.js" as="script" />
  <link rel="stylesheet" href="/styles.css" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="icon" href="/favicon-192.png" type="image/png" sizes="192x192" />
  <link rel="apple-touch-icon" href="/favicon-180.png" />
  <script>
    document.documentElement.classList.add('js');
    if (window.matchMedia && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('anim-attesa');
      setTimeout(function () { document.documentElement.classList.remove('anim-attesa'); }, 1800);
    }
  </script>

  <!-- Google Tag Manager: si carica da cookie.js SOLO dopo il consenso -->
${schema ? `
  <script type="application/ld+json">
  ${JSON.stringify(schema, null, 2).split('\n').join('\n  ')}
  </script>` : ''}
</head>`;
}

function bodyAttrs(t, extra = {}) {
  const a = {
    'data-lang': t.lang,
    'data-prefix': t.prefix,
    'data-stato-aperti': t.stato.aperti,
    'data-stato-chiusi': t.stato.chiusi,
    'data-wa-msg': extra.waMsg || t.prenota.waMsg,
    'data-alt-url': extra.altUrl || '',
    'data-alt-lang': altra(t).lang,
    'data-cookie-testo': t.cookieBanner.testo,
    'data-cookie-dettagli': t.cookieBanner.dettagli,
    'data-cookie-rifiuta': t.cookieBanner.rifiuta,
    'data-cookie-accetta': t.cookieBanner.accetta,
    'data-cookie-aria': t.cookieBanner.aria,
    ...extra.attrs,
  };
  return Object.entries(a).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => `${k}="${esc(v)}"`).join(' ');
}

function nav(t, pagina) {
  const home = url(t, '');
  const alt = altra(t);
  const altUrl = url(alt, pagina);
  const sez = (id) => (pagina === '' ? `#${id}` : `${home}#${id}`);
  const lingua = `<a class="lang" href="${altUrl}" hreflang="${alt.hreflang}" lang="${alt.htmlLang}" data-lang="${alt.lang}" aria-label="${esc(t.nav.lingua)}: ${t.altro_lang_label}">${t.altro_lang_label}</a>`;
  return `  <header class="nav" id="nav">
    <div class="nav-isola">
      <a class="marchio" href="${pagina === '' ? '#inizio' : home}">
        <span class="marchio-nome">${t.brand.nome}</span>
        <span class="marchio-firma" lang="zh">东方之<span class="cuore">心</span>养生馆</span>
      </a>
      <nav class="nav-link" aria-label="${esc(t.nav.sezioni)}">
        <a href="${sez('trattamenti')}">${t.nav.trattamenti}</a>
        <a href="${sez('recensioni')}">${t.nav.recensioni}</a>
        <a href="${sez('dove')}">${t.nav.dove}</a>
      </nav>
      ${lingua}
      <a class="nav-tel" href="tel:${TEL}">${TEL_VIS}</a>
      <a class="btn btn-ink btn-sm nav-prenota" href="#prenota" data-prenota>${t.nav.prenota} ${ARROW}</a>
      <button class="burger" id="burger" aria-label="${esc(t.nav.apriMenu)}" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
    </div>
  </header>
  <div class="menu" id="menu" aria-label="Menu">
    <a class="menu-voce" href="${sez('trattamenti')}">${t.nav.trattamenti} <span class="label nolinea">01</span></a>
    <a class="menu-voce" href="#prenota">${t.nav.prenota} <span class="label nolinea">02</span></a>
    <a class="menu-voce" href="${sez('recensioni')}">${t.nav.recensioni} <span class="label nolinea">03</span></a>
    <a class="menu-voce" href="${sez('dove')}">${t.nav.dove} <span class="label nolinea">04</span></a>
    <div class="menu-piede">
      <a class="btn btn-ghost btn-sm" href="tel:${TEL}">${TEL_VIS}</a>
      <a class="btn btn-ghost btn-sm" href="${WA}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="btn btn-ghost btn-sm" href="${altUrl}" hreflang="${alt.hreflang}" data-lang="${alt.lang}">${t.altro_lang_label}</a>
    </div>
  </div>`;
}

function footer(t, pagina) {
  const home = url(t, '');
  const sez = (id) => (pagina === '' ? `#${id}` : `${home}#${id}`);
  return `  <footer class="fondo">
    <div class="wrap">
      <div class="fondo-grid">
        <div class="fondo-col">
          <span class="label">${t.brand.nome}</span>
          <p class="fondo-firma" lang="zh">东方之<span class="cuore">心</span>养生馆</p>
          <p>${t.footer.descrizione}</p>
        </div>
        <div class="fondo-col">
          <span class="label">${t.footer.contatti}</span>
          <a href="tel:${TEL}">${TEL_VIS}</a>
          <a href="${WA}" target="_blank" rel="noopener">WhatsApp</a>
          <span>Via San Lorenzo 46<br />15121 Alessandria</span>
        </div>
        <div class="fondo-col">
          <span class="label">${t.footer.pagine}</span>
          <a href="${sez('trattamenti')}">${t.nav.trattamenti}</a>
          <a href="#prenota">${t.nav.prenota}</a>
          <a href="${sez('recensioni')}">${t.nav.recensioni}</a>
          <a href="${sez('dove')}">${t.nav.dove}</a>
          <a href="${sez('lavora')}">${t.lavora.footer}</a>
        </div>
        <div class="fondo-col">
          <span class="label">${t.footer.social}</span>
          <a href="https://www.instagram.com/essenza.oriente?igsh=ZWpoOTBrMDduMW5i&amp;utm_source=qr" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.facebook.com/share/14jFSwS4Ysi/?mibextid=wwXIfr" target="_blank" rel="noopener">Facebook</a>
          <a href="https://www.tiktok.com/@essenzaoriente.al" target="_blank" rel="noopener">TikTok</a>
        </div>
      </div>
      <div class="fondo-marchio" aria-hidden="true"><p class="display">Essenza d'Oriente</p></div>
      <p class="fondo-legale"><span>P.IVA 14409690964</span><a href="${url(t, 'privacy.html')}">${t.footer.privacy}</a><a href="${url(t, 'cookie.html')}">${t.footer.cookie}</a><a href="${url(altra(t), pagina)}" hreflang="${altra(t).hreflang}" data-lang="${altra(t).lang}">${t.altro_lang_label}</a><span>${t.footer.sitoDi} <a href="https://infoapex.eu" target="_blank" rel="noopener">Apex Media</a></span></p>
    </div>
  </footer>

  <div class="barra-mobile" role="navigation" aria-label="${esc(t.nav.azioniRapide)}">
    <a class="btn btn-ink" href="#prenota" data-prenota>${t.nav.prenotaOra} ${ARROW}</a>
    <a class="tondo wa" href="${WA}" target="_blank" rel="noopener" aria-label="${esc(t.nav.scriviWa)}"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${WA_PATH}</svg></a>
    <a class="tondo" href="tel:${TEL}" aria-label="${esc(t.nav.chiama)}">${TEL_SVG}</a>
  </div>`;
}

const scripts = (t) => `  <script src="/cookie.js"></script>
  <script src="/script.js"></script>
  <script src="/vendor/gsap/gsap-bundle.min.js"></script>
  <script src="/animazioni.js"></script>`;

function sezionePrenota(t, tratt) {
  const lede = tratt ? riempi(t.prenota.ledeTratt, { nome: tratt.nome }) : t.prenota.lede;
  const waMsg = tratt ? riempi(t.prenota.waMsgTratt, { nome: tratt.nome }) : t.prenota.waMsg;
  return `    <section class="sez prenota" id="prenota">
      ${LINEE}
      <div class="wrap">
        <div class="testa">
          <div>
            <span class="label" data-reveal>${t.prenota.label}</span>
            <h2 data-split style="margin-top:18px">${t.prenota.h2}</h2>
          </div>
          <p class="lede" data-reveal>${lede}</p>
        </div>
        <div class="scelta-attiva" id="sceltaAttiva" hidden>
          <span>${t.prenota.staiPrenotando} <strong id="sceltaNome"></strong> <span id="sceltaInfo" class="label nolinea"></span></span>
          <button type="button" id="sceltaCambia">${t.prenota.cambia}</button>
        </div>
        <div class="shell" data-reveal>
          <div class="core">
            <iframe
              id="treatwellFrame"
              class="treatwell-frame"
              src="${TREATWELL}"
              title="${esc(t.prenota.widgetTitle)}"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        <div class="prenota-alt" data-reveal>
          <span>${t.prenota.alt}</span>
          <div class="azioni">
            <a class="btn btn-ghost btn-sm" id="prenotaWa" href="${waUrl(waMsg)}" target="_blank" rel="noopener">${t.prenota.wa} ${WA_ICO}</a>
            <a class="btn btn-ghost btn-sm btn-solo" href="tel:${TEL}">${TEL_VIS}</a>
          </div>
        </div>
      </div>
    </section>`;
}

/* ---------- HOME ---------- */
function home(t) {
  const pagina = '';
  const schema = {
    '@context': 'https://schema.org', '@type': 'HealthAndBeautyBusiness', name: "Essenza d'Oriente",
    description: t.meta.schemaDescription, image: `${ORIGINE}/foto/brand-banner.jpg`, url: `${ORIGINE}${url(t, '')}`,
    address: { '@type': 'PostalAddress', streetAddress: 'Via San Lorenzo 46', postalCode: '15121', addressLocality: 'Alessandria', addressRegion: 'AL', addressCountry: 'IT' },
    geo: { '@type': 'GeoCoordinates', latitude: 44.9118135, longitude: 8.6137538 }, telephone: TEL,
    openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '09:30', closes: '22:30' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '5.0', reviewCount: '146' }, priceRange: '€€',
  };
  const extra = `  <!-- HEADLINE MODIFICABILE PER LE CAMPAGNE ADS: se valorizzata,
       sostituisce il testo dell'H1 al caricamento (senza evidenziatore). -->
  <script>var LANDING_HEADLINE = null;</script>
`;
  const righe = t.trattamenti.map((x, i) => `          <article class="riga" data-reveal data-tratt="${esc(x.nome)}" data-info="${esc(x.info)}">
            <span class="riga-idx">0${i + 1}</span>
            <div class="riga-nome"><h3><a href="${url(t, `trattamenti/${x.slug}.html`)}">${x.nome}</a></h3><span class="riga-meta">${x.descr}</span></div>
            <span class="riga-meta riga-durata">${x.durata}</span>
            <span class="riga-prezzo">${x.prezzo}${x.prezzoNota ? `<small>${x.prezzoNota}</small>` : ''}</span>
            <div class="riga-azioni"><a class="btn btn-ghost btn-sm" href="#prenota" data-prenota>${t.listino.prenota} ${ARROW}</a></div>
          </article>`).join('\n');
  const rec = t.recensioni.items.map((r, i) => `          <figure class="recensione shell ${i === 0 || i === 3 ? 'rec-grande' : 'rec-piccola'}${i === 2 ? ' seconda' : ''}" data-reveal>
            <div class="core">
              <blockquote>${r.testo}</blockquote>
              <figcaption><span class="label nolinea">${r.autore}</span><span class="stelle" aria-hidden="true">★★★★★</span></figcaption>
            </div>
          </figure>`).join('\n');
  return `${head(t, pagina, { title: t.meta.title, description: t.meta.description, ogImage: `${ORIGINE}/foto/brand-banner.jpg`, ogType: 'business.business', schema, extra })}
<body ${bodyAttrs(t, { altUrl: url(altra(t), pagina) })}>
${nav(t, pagina)}

  <main id="inizio">

    <!-- ============ HERO ============ -->
    <section class="hero">
      ${LINEE}
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <p class="label hero-stato" id="statoApertura"><span class="pallino" aria-hidden="true"></span><span class="solo-desktop">${t.stato.prefisso} · </span><span id="statoTesto">${t.stato.aperti}</span></p>
          <h1 id="headline">${t.hero.h1}</h1>
          <p class="lede">${t.hero.lede}</p>
          <div class="hero-cta">
            <a class="btn btn-ink" href="#prenota" data-prenota>${t.hero.cta} ${ARROW}</a>
            <a class="link" href="#trattamenti">${t.hero.link}</a>
          </div>
          <div class="hero-prova">
            <span class="prova-voto"><span class="num">${t.hero.voto}</span><span class="stelle" aria-hidden="true">★★★★★</span></span>
            <span class="label nolinea">${t.hero.recensioni}</span>
            <span class="label nolinea">${t.hero.orari}</span>
          </div>
        </div>
        <div class="hero-visual">
          <span class="hero-tag">${t.hero.tag}</span>
          <figure class="hero-foto shell">
            <div class="core">
              <picture>
                <source srcset="/foto/sfondo-prenota.webp" type="image/webp" />
                <img id="heroFoto" src="/foto/sfondo-prenota.jpg" alt="${esc(t.hero.fotoAlt)}" width="1376" height="768" fetchpriority="high" />
              </picture>
            </div>
          </figure>
          <div class="hero-card" aria-label="Google">
            <span class="num"><span data-conta="146">146</span></span>
            <span class="stelle" aria-hidden="true">★★★★★</span>
            <span class="label nolinea">${t.hero.cardLabel}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ NASTRO ============ -->
    <div class="nastro" aria-hidden="true">
      <div class="nastro-track" id="nastro">
        ${t.trattamenti.map((x) => `<span>${x.nome}</span>`).join('')}
      </div>
    </div>

    <!-- ============ LISTINO ============ -->
    <section class="sez" id="trattamenti">
      ${LINEE}
      <div class="wrap">
        <div class="testa">
          <div>
            <span class="label" data-reveal>${t.listino.label}</span>
            <h2 data-split style="margin-top:18px">${t.listino.h2}</h2>
          </div>
          <p class="lede" data-reveal>${t.listino.lede}</p>
        </div>
        <div class="listino" id="listino">
${righe}
        </div>
        <div class="listino-nota" data-reveal>
          ${t.listino.note.map((n) => `<span class="label nolinea">${n}</span>`).join('\n          ')}
        </div>
      </div>
    </section>

    <!-- ============ PRENOTA: WIDGET TREATWELL ============ -->
${sezionePrenota(t, null)}

    <!-- ============ NUMERI ============ -->
    <section class="sez sez-tight">
      <div class="wrap">
        <div class="numeri">
${t.numeri.map((n) => `          <div class="numero" data-reveal>
            <span class="label">${n.label}</span>
            <span class="big">${n.big}<small>${n.small}</small></span>
            <p>${n.testo}</p>
          </div>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- ============ RECENSIONI ============ -->
    <section class="sez" id="recensioni">
      <div class="wrap">
        <div class="testa">
          <div>
            <span class="label" data-reveal>${t.recensioni.label}</span>
            <h2 data-split style="margin-top:18px">${t.recensioni.h2}</h2>
          </div>
          <p class="lede" data-reveal>${t.recensioni.lede}</p>
        </div>
        <div class="recensioni">
${rec}
        </div>
        <div class="rec-piede" data-reveal>
          <span class="label nolinea">${GOOGLE_G} ${t.recensioni.piede}</span>
          <a class="link" href="https://www.google.com/maps/search/?api=1&query=Essenza+d%27Oriente+Via+San+Lorenzo+46+Alessandria" target="_blank" rel="noopener">${t.recensioni.link}</a>
        </div>
      </div>
    </section>

    <!-- ============ DOVE ============ -->
    <section class="sez" id="dove">
      ${LINEE}
      <div class="wrap">
        <div class="testa">
          <div>
            <span class="label" data-reveal>${t.dove.label}</span>
            <h2 data-split style="margin-top:18px">${t.dove.h2}</h2>
          </div>
        </div>
        <div class="dove">
          <div class="mappa shell" data-reveal>
            <div class="core">
              <iframe
                src="https://www.google.com/maps?q=Via+San+Lorenzo+46,+15121+Alessandria&output=embed&hl=${t.lang === 'zh' ? 'zh-CN' : 'it'}"
                title="${esc(t.dove.mappaTitle)}"
                loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
          <div data-reveal>
            <div class="dati">
              <div class="dato"><span class="label nolinea">${t.dove.indirizzo}</span><strong>${t.dove.indirizzoVal}</strong></div>
              <div class="dato"><span class="label nolinea">${t.dove.orari}</span><strong>${t.dove.orariVal}</strong></div>
              <div class="dato"><span class="label nolinea">${t.dove.telefono}</span><strong><a href="tel:${TEL}">${TEL_VIS}</a></strong></div>
              <div class="dato"><span class="label nolinea">${t.dove.whatsapp}</span><strong><a href="${WA}" target="_blank" rel="noopener">${t.dove.whatsappVal}</a></strong></div>
            </div>
            <div class="dove-azioni">
              <a class="btn btn-ink btn-sm" href="https://www.google.com/maps/dir/?api=1&destination=44.9118135,8.6137538" target="_blank" rel="noopener">${t.dove.comeArrivare} ${ARROW}</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ FAQ ============ -->
    <section class="sez" id="faq">
      <div class="wrap">
        <div class="testa">
          <div>
            <span class="label" data-reveal>${t.faq.label}</span>
            <h2 data-split style="margin-top:18px">${t.faq.h2}</h2>
          </div>
        </div>
        <div class="faq" data-reveal>
${t.faq.items.map((f) => `          <details>
            <summary>${f.q} <span class="plus" aria-hidden="true"></span></summary>
            <p>${f.a}</p>
          </details>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- ============ LAVORA CON NOI ============ -->
    <section class="sez sez-tight lavora" id="lavora">
      <div class="wrap">
        <div class="lavora-card" data-reveal>
          <div class="lavora-testo">
            <span class="label">${t.lavora.label}</span>
            <h2 style="margin-top:18px">${t.lavora.h2}</h2>
            <p class="lede">${t.lavora.testo}</p>
          </div>
          <div class="lavora-azione">
            <ul class="lavora-punti">
${t.lavora.punti.map((p) => `              <li>${p}</li>`).join('\n')}
            </ul>
            <a class="btn btn-ink" data-candidatura href="${waUrl(t.lavora.msg)}" target="_blank" rel="noopener">${t.lavora.cta} ${WA_ICO}</a>
            <p class="lavora-nota">${t.lavora.nota} <a data-candidatura href="tel:${TEL}">${TEL_VIS}</a></p>
          </div>
        </div>
      </div>
    </section>
  </main>

${footer(t, pagina)}

  <script src="/cookie.js"></script>
  <script src="/script.js"></script>
  <script>
    if (typeof LANDING_HEADLINE === 'string' && LANDING_HEADLINE) {
      document.getElementById('headline').textContent = LANDING_HEADLINE;
    }
  </script>
  <script src="/vendor/gsap/gsap-bundle.min.js"></script>
  <script src="/animazioni.js"></script>
</body>
</html>
`;
}

/* ---------- PAGINA TRATTAMENTO ---------- */
function trattamento(t, x) {
  const pagina = `trattamenti/${x.slug}.html`;
  const foto = `${ORIGINE}/foto/tratt-${x.slug}.jpg`;
  const schema = {
    '@context': 'https://schema.org', '@type': 'Service', name: x.nome, serviceType: IT.trattamenti.find((y) => y.slug === x.slug).nome,
    areaServed: 'Alessandria', image: foto, url: `${ORIGINE}${url(t, pagina)}`,
    provider: { '@type': 'HealthAndBeautyBusiness', name: "Essenza d'Oriente", telephone: TEL, address: { '@type': 'PostalAddress', streetAddress: 'Via San Lorenzo 46', postalCode: '15121', addressLocality: 'Alessandria', addressRegion: 'AL', addressCountry: 'IT' } },
  };
  const waMsg = riempi(t.prenota.waMsgTratt, { nome: x.nome });
  const altri = t.trattamenti.filter((y) => y.slug !== x.slug).map((y) => `<a href="${url(t, `trattamenti/${y.slug}.html`)}">${y.nome}</a>`).join('\n          ');
  const prezzo = x.prezzoLungo || x.prezzo;
  return `${head(t, pagina, { title: x.titoloSeo, description: x.descSeo, ogImage: foto, schema })}
<body class="pagina-tratt" ${bodyAttrs(t, { waMsg, altUrl: url(altra(t), pagina), attrs: { 'data-tratt-nome': x.nome, 'data-tratt-info': x.info } })}>
${nav(t, pagina)}

  <main>
    <section class="hero tratt-hero">
      ${LINEE}
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <p class="briciole label nolinea"><a href="${url(t, '')}">${t.tratt.briciole.home}</a> / <a href="${url(t, '')}#trattamenti">${t.tratt.briciole.trattamenti}</a> / <span>${x.nome}</span></p>
          <p class="label hero-stato" id="statoApertura"><span class="pallino" aria-hidden="true"></span><span class="solo-desktop">${t.stato.prefissoTratt} · </span><span id="statoTesto">${t.stato.aperti}</span></p>
          <h1>${x.h1}</h1>
          <p class="lede">${x.sotto}${t.lang === 'zh' ? '。' : '. '}${x.benefici}</p>
          <p class="tratt-prezzo"><span class="num">${prezzo}</span><span class="durata">${x.durataLunga}</span></p>
          <div class="hero-cta">
            <a class="btn btn-ink" href="#prenota" data-prenota>${t.tratt.cta} ${ARROW}</a>
            <a class="link" href="${waUrl(waMsg)}" target="_blank" rel="noopener">${t.tratt.chiediWa}</a>
          </div>
          <div class="hero-prova">
            <span class="prova-voto"><span class="num">${t.hero.voto}</span><span class="stelle" aria-hidden="true">★★★★★</span></span>
            <span class="label nolinea">${t.hero.recensioni}</span>
            <span class="label nolinea">${t.hero.orari}</span>
          </div>
        </div>
        <div class="hero-visual">
          <figure class="hero-foto shell">
            <div class="core">
              <picture>
                <source srcset="/foto/tratt-${x.slug}.webp" type="image/webp" />
                <img src="/foto/tratt-${x.slug}.jpg" alt="${esc(riempi(t.tratt.fotoAlt, { nome: x.nome }))}" width="1200" height="669" fetchpriority="high" />
              </picture>
            </div>
          </figure>
        </div>
      </div>
    </section>

    <section class="sez sez-tight">
      <div class="wrap tratt-corpo">
        <div class="tratt-testo">
          <div class="tratt-blocco" data-reveal><span class="label">${t.tratt.cosa}</span><h2>${t.tratt.cosa}</h2><p>${x.cosa}</p></div>
          <div class="tratt-blocco" data-reveal><span class="label">${t.tratt.benefici}</span><h2>${t.tratt.benefici}</h2><p>${x.benefici}</p></div>
          <div class="tratt-blocco" data-reveal><span class="label">${t.tratt.svolgimento}</span><h2>${t.tratt.svolgimento}</h2><p>${x.svolgimento}</p>${x.avviso ? `<p class="avviso">${x.avviso}</p>` : ''}</div>
        </div>
        <aside class="box-prezzo shell" data-reveal>
          <div class="core">
            <span class="label">${x.durataLunga} · ${t.tratt.pagamento}</span>
            <span class="num">${prezzo}</span>
            <a class="btn btn-ink" href="#prenota" data-prenota>${t.nav.prenota} ${ARROW}</a>
            <a class="btn btn-ghost" href="${waUrl(waMsg)}" target="_blank" rel="noopener">WhatsApp ${WA_ICO}</a>
            <p class="nota">${t.tratt.orariBox} · <a href="tel:${TEL}">${TEL_VIS}</a></p>
          </div>
        </aside>
      </div>
    </section>

${sezionePrenota(t, x)}

    <section class="sez sez-tight">
      <div class="wrap">
        <div class="testa">
          <div>
            <span class="label" data-reveal>${t.tratt.altriLabel}</span>
            <h2 data-split style="margin-top:18px">${t.tratt.altriH2}</h2>
          </div>
        </div>
        <div class="altri" data-reveal>
          ${altri}
        </div>
      </div>
    </section>
  </main>

${footer(t, pagina)}

${scripts(t)}
</body>
</html>
`;
}

/* ---------- PAGINE LEGALI ---------- */
function legale(t, tipo) {
  const pagina = `${tipo}.html`;
  const d = t.legale[tipo];
  return `${head(t, pagina, { title: d.title, description: d.description, ogImage: `${ORIGINE}/foto/brand-banner.jpg` })}
<body ${bodyAttrs(t, { altUrl: url(altra(t), pagina) })}>
${nav(t, pagina)}
  <main class="sez">
    <div class="wrap legale">
      <span class="label">${t.legale.label}</span>
      <h1>${d.h1}</h1>
      <p><em>${t.legale.aggiornato}</em></p>
${d.sezioni.map((s) => `      <h2>${s.h2}</h2>
      <p>${riempi(s.p, { prefix: t.prefix })}</p>`).join('\n')}
    </div>
  </main>
${footer(t, pagina)}

${scripts(t)}
</body>
</html>
`;
}

/* ---------- SITEMAP ---------- */
function sitemap() {
  const pagine = [{ p: '', f: 'weekly', pr: '1.0' }, ...IT.trattamenti.map((x) => ({ p: `trattamenti/${x.slug}.html`, f: 'monthly', pr: '0.8' })), { p: 'privacy.html', f: 'yearly', pr: '0.2' }, { p: 'cookie.html', f: 'yearly', pr: '0.2' }];
  const voci = [];
  for (const pg of pagine) for (const l of LINGUE) {
    const alt = LINGUE.map((m) => `    <xhtml:link rel="alternate" hreflang="${m.hreflang}" href="${ORIGINE}${url(m, pg.p)}" />`).join('\n');
    voci.push(`  <url>\n    <loc>${ORIGINE}${url(l, pg.p)}</loc>\n${alt}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGINE}${url(IT, pg.p)}" />\n    <changefreq>${pg.f}</changefreq>\n    <priority>${l.lang === 'it' ? pg.pr : (pg.pr * 0.9).toFixed(1)}</priority>\n  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${voci.join('\n')}\n</urlset>\n`;
}

/* ---------- scrittura ---------- */
function scrivi(rel, contenuto) {
  const f = path.join(__dirname, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, contenuto, 'utf8');
  console.log('scritto', rel);
}
for (const t of LINGUE) {
  const base = t.prefix ? t.prefix.slice(1) + '/' : '';
  scrivi(`${base}index.html`, home(t));
  for (const x of t.trattamenti) scrivi(`${base}trattamenti/${x.slug}.html`, trattamento(t, x));
  scrivi(`${base}privacy.html`, legale(t, 'privacy'));
  scrivi(`${base}cookie.html`, legale(t, 'cookie'));
}
scrivi('sitemap.xml', sitemap());
