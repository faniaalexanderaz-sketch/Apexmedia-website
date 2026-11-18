/* =============================================================
   Prova completa, come la farebbe una persona: il cliente dal sito
   (telefono, 390px) e Marcella dall'app. Il server è quello locale
   (database in memoria, email catturate su /__posta, nessuna email
   vera). Le notifiche partono verso un finto "telefono" in ascolto
   qui, che le decifra come farebbe un telefono vero.
   Serve Playwright con Chromium (non è tra le dipendenze del sito).
   Avvio, con il server locale già acceso su un'altra finestra:
     PORT=3311 npm run locale
     xvfb-run -a node strumenti/prova-completa.js
   Le schermate finiscono in strumenti/schermate/ (non pubblicate).
   ============================================================= */
const { chromium, devices } = require('playwright');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const PROGETTO = process.env.PROGETTO || path.join(__dirname, '..');
const ece = require(path.join(PROGETTO, 'node_modules/http_ece'));
const BASE = process.env.BASE || 'http://localhost:3311';
const OUT = path.join(__dirname, 'schermate');
fs.mkdirSync(OUT, { recursive: true });

const esiti = [];
function verifica(nome, ok, dettaglio) {
  esiti.push({ nome, ok: !!ok });
  console.log((ok ? '  ok  ' : '  NO  ') + nome + (dettaglio && !ok ? '  →  ' + dettaglio : ''));
}
function titolo(t) { console.log('\n' + t); }
const attendi = ms => new Promise(r => setTimeout(r, ms));
async function posta(svuota) { return (await fetch(BASE + '/__posta' + (svuota ? '?svuota=1' : ''))).json(); }
function isoTra(giorni) { const d = new Date(Date.now() + giorni * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function dataLunga(iso) { const p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }); }

/* controlli di leggibilità su una schermata dell'app: niente testo sotto 18px, pulsanti alti almeno 56px, nessuno scroll orizzontale */
async function leggibile(page, nome) {
  const r = await page.evaluate(() => {
    const visibile = el => { const s = getComputedStyle(el), b = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0; };
    const piccoli = [], bassi = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const n = w.currentNode, el = n.parentElement;
      if (!n.textContent.trim() || !el || !visibile(el) || el.closest('svg, script, style, [hidden]')) continue;
      const px = parseFloat(getComputedStyle(el).fontSize);
      if (px < 18) piccoli.push(n.textContent.trim().slice(0, 30) + ' (' + px + 'px)');
    }
    document.querySelectorAll('.g-btn, .g-barra a, .g-voce, .g-indietro, .g-mese button, .g-giorno, .g-interruttore, .g-campo input, .g-campo textarea').forEach(el => {
      if (!visibile(el)) return;
      const h = el.getBoundingClientRect().height;
      if (h < 56 && !(el.matches('.g-indietro') && h >= 48)) bassi.push((el.textContent.trim().slice(0, 24) || el.className) + ' (' + Math.round(h) + 'px)');
    });
    return { piccoli: [...new Set(piccoli)], bassi: [...new Set(bassi)], scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  verifica(nome + ': testo da 18px in su', r.piccoli.length === 0, r.piccoli.join(' | '));
  verifica(nome + ': pulsanti alti almeno 56px', r.bassi.length === 0, r.bassi.join(' | '));
  verifica(nome + ': nessuno scroll orizzontale a 390px', r.scroll === 0, 'scroll ' + r.scroll);
}

(async () => {
  /* ---------- il finto telefono che riceve le notifiche ---------- */
  const telefono = crypto.createECDH('prime256v1'); telefono.generateKeys();
  const auth = crypto.randomBytes(16).toString('base64url');
  const notifiche = [];
  const finto = http.createServer((req, res) => {
    const pezzi = [];
    req.on('data', p => pezzi.push(p));
    req.on('end', () => {
      try { notifiche.push(JSON.parse(ece.decrypt(Buffer.concat(pezzi), { version: 'aes128gcm', privateKey: telefono, authSecret: auth }).toString('utf8'))); } catch (e) { notifiche.push({ errore: e.message }); }
      res.statusCode = 201; res.end();
    });
  });
  await new Promise(ok => finto.listen(0, '127.0.0.1', ok));
  const iscrizione = { endpoint: 'http://127.0.0.1:' + finto.address().port + '/push', keys: { p256dh: telefono.getPublicKey().toString('base64url'), auth } };

  const browser = await chromium.launch();
  const iphone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' };
  const errori = [];

  /* ---------- il cliente ---------- */
  const cliente = await browser.newContext(iphone);
  const sito = await cliente.newPage();
  sito.on('pageerror', e => errori.push('sito: ' + e.message));
  async function richiesta(nome, cognome, email, giorno, fascia) {
    await sito.goto('about:blank');
    await sito.goto(BASE + '/prenota?pacchetto=giornata', { waitUntil: 'networkidle' });
    await sito.locator('.giorno[data-data="' + giorno + '"]').click();
    await sito.locator('.fascia[data-fascia="' + fascia + '"]').click();
    await sito.fill('#nome', nome); await sito.fill('#cognome', cognome); await sito.fill('#email', email); await sito.fill('#telefono', '347 123 4567');
    await sito.check('#privacy');
    await sito.locator('[data-invia]').click();
    await sito.locator('[data-successo]:not([hidden])').waitFor({ timeout: 15000 });
    return (await sito.locator('[data-codice]').innerText()).trim();
  }

  /* ---------- Marcella: una finestra vera (non in incognito), così il permesso delle notifiche esiste ---------- */
  const cartella = fs.mkdtempSync(path.join(__dirname, 'profilo-'));
  const marcellaCtx = await chromium.launchPersistentContext(cartella, { ...iphone, headless: false, userAgent: undefined, ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', args: ['--window-size=420,900'] });
  await marcellaCtx.grantPermissions(['notifications'], { origin: BASE });
  const app = marcellaCtx.pages()[0] || await marcellaCtx.newPage();
  app.on('pageerror', e => errori.push('app: ' + e.message));
  const api = (azione, dati) => app.evaluate(async ([a, d]) => {
    const r = await fetch('/api/gestione?azione=' + a, d === undefined ? { headers: { 'X-Bgn-App': '1' } } : { method: 'POST', headers: { 'X-Bgn-App': '1', 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
    return { stato: r.status, dati: await r.json().catch(() => ({})) };
  }, [azione, dati]);
  const vai = async (dove) => { await app.evaluate(h => { location.hash = h; }, dove); await app.waitForTimeout(700); };

  /* ====================================================================== */
  titolo('ACCESSO (3.2)');
  await app.goto(BASE + '/gestione');
  verifica('senza accesso /gestione rimanda alla pagina di accesso', /\/gestione\/accedi$/.test(app.url()), app.url());
  await leggibile(app, 'Accesso');
  await app.screenshot({ path: path.join(OUT, 'app-accesso.png') });
  await app.fill('input[name=email]', 'info@bagnarino.it'); await app.fill('input[name=password]', 'sbagliata');
  await app.click('button[type=submit]');
  await app.locator('[data-errore]:not([hidden])').waitFor();
  verifica('password sbagliata: messaggio chiaro, non si entra', /non corrette/.test(await app.locator('[data-errore]').innerText()));
  await app.fill('input[name=password]', 'Prova ');   /* maiuscola e spazio messi dalla tastiera del telefono */
  await app.click('button[type=submit]');
  await app.waitForURL('**/gestione');
  await app.waitForSelector('.g-saluto');
  verifica('con email e password si entra nell’app', true);
  const cookie = (await marcellaCtx.cookies(BASE)).find(c => c.name === 'bgn_gestione');
  const giorniSessione = Math.round((cookie.expires - Date.now() / 1000) / 86400);
  verifica('sessione di 90 giorni, cookie HttpOnly non leggibile dalla pagina', giorniSessione === 90 && cookie.httpOnly && cookie.sameSite === 'Lax', JSON.stringify({ giorniSessione, httpOnly: cookie.httpOnly, sameSite: cookie.sameSite }));

  titolo('SCHERMATA OGGI (3.4)');
  const saluto = await app.locator('.g-saluto').innerText();
  verifica('saluto e data in alto', /^(Buongiorno|Buonasera) Marcella$/.test(saluto) && (await app.locator('.g-data').innerText()).toLowerCase() === dataLunga(isoTra(0)), saluto);
  verifica('barra in basso: Oggi, Calendario, Prenotazioni, Sito (icona e parola)', JSON.stringify(await app.locator('.g-barra a span').allInnerTexts()) === JSON.stringify(['Oggi', 'Calendario', 'Prenotazioni', 'Sito']) && await app.locator('.g-barra a svg').count() === 4);
  await leggibile(app, 'Oggi (vuota)');

  /* il finto telefono si iscrive alle notifiche, come farebbe "Attiva le notifiche" su un telefono vero */
  const isc = await api('push-iscrivi', { iscrizione });
  verifica('iscrizione alle notifiche accettata, notifica di prova ricevuta e decifrata', isc.stato === 200 && isc.dati.prova === true && notifiche.length === 1 && notifiche[0].titolo === 'Le notifiche funzionano', JSON.stringify(isc) + JSON.stringify(notifiche));

  /* ====================================================================== */
  titolo('TEST 2 — richiesta dal sito → email al cliente → notifica ed email a info@bagnarino.it → conferma → email di conferma');
  await posta(true); notifiche.length = 0;
  const g1 = isoTra(6), g2 = isoTra(7), gChiuso = isoTra(9), gMezza = isoTra(10);
  const codice1 = await richiesta('Giulia', 'Rossi', 'giulia.rossi@esempio.it', g1, 'mattina');
  const finale = (await sito.locator('[data-successo]').innerText()).replace(/\s+/g, ' ');
  verifica('schermata: "Richiesta ricevuta. Ti confermiamo la disponibilità a breve via email. Il posto sarà tuo appena ricevi la conferma."',
    finale.includes('Richiesta ricevuta. Ti confermiamo la disponibilità a breve via email. Il posto sarà tuo appena ricevi la conferma.'), finale.slice(0, 160));
  verifica('mai "Prenotazione confermata" a questo punto', !/prenotazione confermata/i.test(await sito.locator('body').innerText()));
  await sito.screenshot({ path: path.join(OUT, 'sito-richiesta-ricevuta.png'), fullPage: true });
  let p = await posta();
  const ricevuta = p.find(m => m.a === 'giulia.rossi@esempio.it');
  verifica('email al cliente: "Abbiamo ricevuto la tua richiesta, ti confermiamo a breve", con il riepilogo', !!ricevuta && ricevuta.html.includes('Abbiamo ricevuto la tua richiesta, ti confermiamo a breve') && ricevuta.html.includes(codice1) && ricevuta.html.includes('Mattina'), ricevuta && ricevuta.oggetto);
  verifica('email al cliente: se risponde, scrive a info@bagnarino.it (reply-to)', ricevuta && ricevuta.rispondiA === 'info@bagnarino.it');
  const avviso = p.find(m => m.a === 'info@bagnarino.it');
  verifica('email a info@bagnarino.it: "Nuova richiesta: Giulia Rossi, ' + dataLunga(g1) + ', mattina"', !!avviso && avviso.oggetto === 'Nuova richiesta: Giulia Rossi, ' + dataLunga(g1) + ', mattina', avviso && avviso.oggetto);
  const link = avviso ? [...avviso.html.matchAll(/href="([^"]*\/gestione\/risposta\?t=[^"]+)"/g)].map(x => x[1].replace(/&amp;/g, '&')) : [];
  verifica('email a info@bagnarino.it: due pulsanti, Conferma e Non disponibile', link.length === 2 && />Conferma</.test(avviso.html) && />Non disponibile</.test(avviso.html));
  fs.writeFileSync(path.join(OUT, 'email-titolare.html'), avviso ? avviso.html : '');
  fs.writeFileSync(path.join(OUT, 'email-cliente-ricevuta.html'), ricevuta ? ricevuta.html : '');
  verifica('notifica push: "Nuova richiesta" · "Giulia Rossi, ' + dataLunga(g1) + ', mattina"', notifiche.length === 1 && notifiche[0].titolo === 'Nuova richiesta' && notifiche[0].corpo === 'Giulia Rossi, ' + dataLunga(g1) + ', mattina', JSON.stringify(notifiche));
  const idRichiesta = notifiche[0] ? +(/richiesta=(\d+)/.exec(notifiche[0].url) || [])[1] : 0;

  /* la notifica arriva al service worker dell'app: viene mostrata, e porta alla richiesta */
  const cdp = await marcellaCtx.newCDPSession(app);
  let registrazione = null;
  cdp.on('ServiceWorker.workerRegistrationUpdated', ev => { const r = ev.registrations.find(x => /\/gestione$/.test(x.scopeURL)); if (r) registrazione = r.registrationId; });
  await cdp.send('ServiceWorker.enable');
  await attendi(500);
  if (registrazione && notifiche[0]) await cdp.send('ServiceWorker.deliverPushMessage', { origin: BASE, registrationId: registrazione, data: JSON.stringify(notifiche[0]) });
  await attendi(800);
  const mostrate = await app.evaluate(async () => (await (await navigator.serviceWorker.ready).getNotifications()).map(n => ({ titolo: n.title, corpo: n.body, url: n.data && n.data.url })));
  verifica('il telefono mostra la notifica (service worker dell’app)', mostrate.length === 1 && mostrate[0].titolo === 'Nuova richiesta' && /Giulia Rossi/.test(mostrate[0].corpo), JSON.stringify(mostrate) + ' permesso=' + await app.evaluate(() => Notification.permission));
  await app.goto(BASE + (mostrate[0] ? mostrate[0].url : '/gestione?richiesta=' + idRichiesta));
  await app.waitForSelector('[data-rispondi="conferma"]');
  verifica('toccando la notifica si apre direttamente la richiesta, con Conferma e Non disponibile', (await app.locator('.g-titolo').innerText()) === 'Giulia Rossi' && await app.locator('[data-rispondi]').count() === 2 && /#prenotazione\/\d+$/.test(app.url()), app.url());
  await app.screenshot({ path: path.join(OUT, 'app-richiesta.png') });
  await leggibile(app, 'Richiesta');
  verifica('pulsante "Indietro" visibile nella schermata interna', await app.locator('[data-indietro]').isVisible() && /Indietro/.test(await app.locator('[data-indietro]').innerText()));

  /* la stessa richiesta è in cima a "Oggi", con i due pulsanti grandi */
  await vai('oggi');
  await app.waitForSelector('[data-richiesta]');
  await app.screenshot({ path: path.join(OUT, 'app-oggi-richiesta.png') });
  const colori = await app.evaluate(() => ['conferma', 'non_disponibile'].map(e => getComputedStyle(document.querySelector('[data-rispondi="' + e + '"]')).backgroundColor));
  verifica('Oggi: richiesta con "Conferma" verde e "Non disponibile" grigio', colori[0] === 'rgb(30, 122, 70)' && colori[1] === 'rgb(227, 229, 232)', colori.join(' / '));
  await leggibile(app, 'Oggi (con richiesta)');
  await posta(true);
  await app.locator('[data-rispondi="conferma"]').click();
  verifica('dopo il tocco c’è "Annulla" per qualche secondo', await app.locator('[data-ripensa]').isVisible() && /Hai 6 secondi per annullare/.test(await app.locator('[data-ripensa-testo]').innerText()));
  await app.locator('[data-ripensa-annulla]').click();
  await attendi(300);
  verifica('"Annulla" rimette tutto com’era: nessuna email partita', await app.locator('[data-rispondi]').count() === 2 && (await posta()).length === 0);
  await app.locator('[data-rispondi="conferma"]').click();     /* secondo tocco: questa volta si lascia passare il tempo */
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 12000 });
  verifica('messaggio grande "Fatto" dopo il salvataggio', (await app.locator('[data-fatto-titolo]').innerText()) === 'Fatto');
  await app.screenshot({ path: path.join(OUT, 'app-fatto.png') });
  await attendi(400);
  p = await posta();
  const conferma = p.find(m => m.a === 'giulia.rossi@esempio.it');
  verifica('email di conferma al cliente: "Prenotazione confermata, ti aspettiamo ' + dataLunga(g1) + ', mattina."', !!conferma && conferma.html.includes('Prenotazione confermata, ti aspettiamo ' + dataLunga(g1) + ', mattina.'), conferma && conferma.oggetto);
  verifica('email di conferma: indirizzo, come arrivare, appuntamento allegato, reply-to info@bagnarino.it', !!conferma && conferma.html.includes('Corso Lamarmora 46') && conferma.html.includes('Come arrivare') && conferma.html.includes('google.com/maps') && conferma.allegati.length === 1 && conferma.rispondiA === 'info@bagnarino.it');
  fs.writeFileSync(path.join(OUT, 'email-cliente-conferma.html'), conferma ? conferma.html : '');
  await sito.goto(BASE + '/prenotazione', { waitUntil: 'networkidle' });
  await sito.waitForTimeout(500);
  verifica('il cliente vede la prenotazione "Confermata"', await sito.locator('[data-scheda]').isVisible() && /^CONFERMATA$/i.test((await sito.locator('[data-s-stato]').innerText()).trim()) && /Giulia/.test(await sito.locator('[data-s-titolo]').innerText()));

  /* ====================================================================== */
  titolo('TEST 3 — seconda richiesta, risposta "Non disponibile" dal pulsante dell’email (senza accesso)');
  await posta(true); notifiche.length = 0;
  const codice2 = await richiesta('Marco', 'Bianchi', 'marco.bianchi@esempio.it', g2, 'pomeriggio');
  p = await posta();
  const avviso2 = p.find(m => m.a === 'info@bagnarino.it');
  const link2 = [...avviso2.html.matchAll(/href="([^"]*\/gestione\/risposta\?t=[^"]+)"/g)].map(x => x[1].replace(/&amp;/g, '&'));
  await posta(true);
  const sconosciuto = await browser.newContext(iphone);      /* nessun cookie: come aprire il link dalla posta */
  const dallaPosta = await sconosciuto.newPage();
  await dallaPosta.goto(link2[1].replace(/^https?:\/\/[^/]+/, BASE));
  await dallaPosta.locator('[data-risposta-app]:not([hidden])').waitFor({ timeout: 10000 });
  const esitoLink = (await dallaPosta.locator('main').innerText()).replace(/\s+/g, ' ');
  verifica('un tocco sul pulsante dell’email, senza accesso: "Fatto"', /^Fatto Hai risposto “Non disponibile” a Marco Bianchi/.test(esitoLink), esitoLink.slice(0, 140));
  await dallaPosta.screenshot({ path: path.join(OUT, 'email-risposta-fatta.png') });
  await leggibile(dallaPosta, 'Risposta dall’email');
  p = await posta();
  const no = p.find(m => m.a === 'marco.bianchi@esempio.it');
  verifica('email al cliente: "Purtroppo in quella fascia lo spazio non è disponibile. Scegli un altro momento, ti confermiamo subito:"', !!no && no.html.includes('Purtroppo in quella fascia lo spazio non è disponibile. Scegli un altro momento, ti confermiamo subito:'), no && no.oggetto);
  const linkCalendario = no ? (/href="([^"]*\/prenota\?pacchetto=giornata#giorno)"/.exec(no.html) || [])[1] : '';
  verifica('email al cliente: link diretto al calendario', !!linkCalendario, linkCalendario);
  fs.writeFileSync(path.join(OUT, 'email-cliente-non-disponibile.html'), no ? no.html : '');
  await sito.goto((linkCalendario || '').replace(/^https?:\/\/[^/]+/, BASE), { waitUntil: 'networkidle' });
  await sito.waitForTimeout(500);
  verifica('il link apre il calendario, con il giorno liberato di nuovo richiedibile', await sito.locator('.giorno[data-data="' + g2 + '"]:not([disabled])').count() === 1 && await sito.locator('[data-blocco="1"].completo').count() === 1);
  await dallaPosta.goto(link2[0].replace(/^https?:\/\/[^/]+/, BASE));
  await dallaPosta.locator('[data-risposta-app]:not([hidden])').waitFor({ timeout: 10000 });
  verifica('il secondo pulsante della stessa email non cambia più nulla: "Avevi già risposto"', /Avevi già risposto/.test(await dallaPosta.locator('main').innerText()) && (await posta()).length === 1);
  await dallaPosta.goto(BASE + '/gestione/risposta?t=' + link2[0].split('t=')[1].slice(0, -3) + 'abc');
  await dallaPosta.locator('[data-risposta-app]:not([hidden])').waitFor({ timeout: 10000 });
  verifica('un link ritoccato non vale', /non vale più/.test(await dallaPosta.locator('main').innerText()));
  await sconosciuto.close();

  /* ====================================================================== */
  titolo('TEST 4 — chiudere un giorno dall’app: sul sito non è prenotabile');
  await vai('calendario');
  await app.waitForSelector('.g-griglia');
  await app.screenshot({ path: path.join(OUT, 'app-calendario.png') });
  await leggibile(app, 'Calendario');
  verifica('calendario del mese: legenda con Aperto, Con prenotazioni, Chiuso', /Aperto/.test(await app.locator('.g-legenda').innerText()) && /Con prenotazioni/.test(await app.locator('.g-legenda').innerText()) && /Chiuso/.test(await app.locator('.g-legenda').innerText()));
  const coloreGiorno = async (iso, vistaMese) => { await vai('calendario/' + iso.slice(0, 7)); return app.locator('.g-giorno[data-vai="giorno/' + iso + '"]').getAttribute('class'); };
  verifica('il giorno con la prenotazione confermata è segnato', /con-prenotazioni/.test(await coloreGiorno(g1)));
  await vai('giorno/' + gChiuso);
  await app.waitForSelector('[data-chiusura="giorno"]');
  verifica('toccando un giorno: "Chiuso tutto il giorno", "Chiuso la mattina", "Chiuso il pomeriggio"', JSON.stringify(await app.locator('[data-chiusura]').allInnerTexts()) === JSON.stringify(['Chiuso tutto il giorno', 'Chiuso la mattina', 'Chiuso il pomeriggio']));
  await leggibile(app, 'Giorno');
  await app.locator('[data-chiusura="giorno"]').click();
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  await attendi(1800);
  await app.screenshot({ path: path.join(OUT, 'app-giorno-chiuso.png') });
  verifica('il giorno risulta chiuso nell’app', /chiuso/.test(await coloreGiorno(gChiuso)));
  await vai('giorno/' + gMezza);
  await app.waitForSelector('[data-chiusura="mattina"]');
  await app.locator('[data-chiusura="mattina"]').click();
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  await attendi(1800);
  await sito.goto('about:blank');   /* la pagina era già /prenota…#giorno: si riparte da capo */
  await sito.goto(BASE + '/prenota?pacchetto=giornata', { waitUntil: 'networkidle' });
  const chiuso = sito.locator('.giorno[data-data="' + gChiuso + '"]');
  verifica('sul sito il giorno chiuso non si può scegliere e dice "Non disponibile"', await chiuso.isDisabled() && /non disponibile/i.test(await chiuso.getAttribute('aria-label')) && (await chiuso.locator('.giorno-stato').innerText()) === 'Non disponibile');
  await sito.locator('.giorno[data-data="' + gMezza + '"]').click();
  const fasce = await sito.locator('.fascia').evaluateAll(l => l.map(b => [b.dataset.fascia, b.disabled, b.querySelector('.fascia-nota').textContent]));
  verifica('mezza giornata chiusa: Mattina e Giornata intera "Non disponibile", Pomeriggio richiedibile', JSON.stringify(fasce) === JSON.stringify([['mattina', true, 'Non disponibile'], ['pomeriggio', false, '€12'], ['giornata', true, 'Non disponibile']]), JSON.stringify(fasce));
  await sito.locator('.flusso-form').screenshot({ path: path.join(OUT, 'sito-mezza-giornata-chiusa.png') });
  const forzata = await sito.evaluate(async (d) => (await fetch('/api/prenota', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pacchetto: 'giornata', data: d, fascia: 'giornata', nome: 'Furbo', cognome: 'Prova', email: 'furbo@esempio.it', telefono: '3471112233', consenso_privacy: true }) })).status, gChiuso);
  verifica('anche saltando il sito, il server rifiuta una richiesta per il giorno chiuso', forzata === 400, 'stato ' + forzata);
  /* chiudi dal ... al ... */
  await vai('chiudi-giorni');
  await app.waitForSelector('[data-periodo]');
  await app.fill('input[name=da]', isoTra(20)); await app.fill('input[name=a]', isoTra(22));
  await leggibile(app, 'Chiudi più giorni');
  await app.click('[data-periodo] button[type=submit]');
  await app.locator('dialog[open]').waitFor();
  verifica('"Chiudi dal ... al ...": una sola domanda prima di chiudere', /^Chiudo dal /.test(await app.locator('[data-domanda-titolo]').innerText()));
  await app.screenshot({ path: path.join(OUT, 'app-domanda.png') });
  await app.locator('[data-domanda-si]').click();
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  const disp = await (await fetch(BASE + '/api/disponibilita?da=' + isoTra(20) + '&giorni=4')).json();
  verifica('tre giorni di fila chiusi, il quarto aperto', [0, 1, 2].every(i => disp.fasce[isoTra(20 + i)].nd.length === 3) && disp.fasce[isoTra(23)].nd.length === 0);
  await attendi(1800);

  /* "Oggi sono chiusa" con una prenotazione già confermata per oggi */
  titolo('OGGI SONO CHIUSA (3.4) e ANNULLAMENTO (3.6)');
  const adminCtx = await browser.newContext();
  const admin = await adminCtx.newPage();
  await admin.goto(BASE + '/admin');
  const manuale = await admin.evaluate(async (oggi) => {
    await fetch('/api/admin?azione=login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'prova' }) });
    const r = await fetch('/api/admin?azione=prenotazione', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pacchetto: 'giornata', data: oggi, nome: 'Anna', cognome: 'Verdi', email: 'anna.verdi@esempio.it', telefono: '3479998877' }) });
    return { stato: r.status, dati: await r.json() };
  }, isoTra(0));
  verifica('(vecchia area riservata ancora funzionante: prenotazione inserita a mano per oggi)', manuale.stato === 200, JSON.stringify(manuale));
  await adminCtx.close();
  await vai('oggi');
  await app.waitForSelector('[data-arrivo]');
  verifica('"Chi arriva oggi" mostra Anna Verdi con il pulsante "È arrivata/o"', /Anna Verdi/.test(await app.locator('#vista').innerText()) && (await app.locator('[data-arrivo]').innerText()) === 'È arrivata/o');
  await app.screenshot({ path: path.join(OUT, 'app-oggi-arrivi.png'), fullPage: true });
  await app.locator('[data-arrivo]').click();
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  verifica('"È arrivata/o": Fatto, con il timbro sulla Bagnarino Card', /Timbro aggiunto/.test(await app.locator('[data-fatto-testo]').innerText()), await app.locator('[data-fatto-testo]').innerText());
  await attendi(2800);
  /* si rimette com'era, per provare la chiusura con una prenotazione confermata */
  const idAnna = (await api('oggi')).dati.arrivi[0].id;
  await api('arrivo', { id: idAnna, arrivato: false });
  await posta(true);
  await vai('oggi');
  await app.locator('[data-chiudi-oggi]').click();
  await app.locator('dialog[open]').waitFor();
  const domanda = (await app.locator('dialog[open]').innerText()).replace(/\s+/g, ' ');
  verifica('"Oggi sono chiusa": un’unica conferma, "Sicura? Le persone non potranno prenotare oggi"', /^Sicura\? Le persone non potranno prenotare oggi\./.test(domanda), domanda);
  await app.locator('[data-domanda-si]').click();
  await app.locator('[data-scuse]').waitFor({ timeout: 8000 });
  await attendi(1800);
  const propone = (await app.locator('#vista').innerText()).replace(/\s+/g, ' ');
  verifica('c’era una prenotazione confermata: avvisa e propone il messaggio di scuse', /C’era già una persona/.test(propone) && /Anna Verdi/.test(propone) && /messaggio di scuse con il link/.test(propone), propone.slice(0, 200));
  await app.screenshot({ path: path.join(OUT, 'app-scuse.png'), fullPage: true });
  await leggibile(app, 'Proposta di scuse');
  await app.locator('[data-scuse]').click();
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  await attendi(400);
  p = await posta();
  const scuse = p.find(m => m.a === 'anna.verdi@esempio.it');
  verifica('il cliente riceve le scuse con il link per riprenotare', !!scuse && /^Ci scusiamo/.test(scuse.oggetto) && /\/prenota\?pacchetto=giornata#giorno/.test(scuse.html) && scuse.rispondiA === 'info@bagnarino.it', scuse && scuse.oggetto);
  fs.writeFileSync(path.join(OUT, 'email-cliente-scuse.html'), scuse ? scuse.html : '');
  await attendi(2800);
  await vai('oggi');
  await app.waitForSelector('[data-riapri-oggi]');
  verifica('Oggi risulta chiusa, con "Riapri oggi"', /Oggi sei chiusa/.test(await app.locator('#vista').innerText()));
  const oggiSito = await (await fetch(BASE + '/api/disponibilita?giorni=1')).json();
  verifica('sul sito oggi non si può più prenotare', Object.values(oggiSito.fasce)[0].nd.length === 3);
  await app.locator('[data-riapri-oggi]').click();
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  await attendi(1800);

  /* annullare una prenotazione confermata dall'elenco */
  await posta(true);
  await vai('prenotazioni');
  await app.waitForSelector('.g-voce');
  await app.screenshot({ path: path.join(OUT, 'app-prenotazioni.png'), fullPage: true });
  const sezioni = await app.locator('.g-sezione').allInnerTexts();
  verifica('elenco diviso in "Da confermare", "Confermate", "Passate"', JSON.stringify(sezioni) === JSON.stringify(['Da confermare', 'Confermate', 'Passate']), JSON.stringify(sezioni));
  await leggibile(app, 'Prenotazioni');
  await app.locator('.g-voce', { hasText: 'Giulia Rossi' }).first().click();
  await app.waitForSelector('[data-annulla-prenotazione]');
  const scheda = (await app.locator('#vista').innerText()).replace(/\s+/g, ' ');
  verifica('scheda con nome, telefono ed email', /Giulia Rossi/.test(scheda) && /347 123 4567/.test(scheda) && /giulia\.rossi@esempio\.it/.test(scheda));
  const collegamenti = await app.locator('.g-due a.g-btn').evaluateAll(l => l.map(a => [a.textContent.trim(), a.getAttribute('href')]));
  verifica('"Chiama" apre il telefono e "Scrivi su WhatsApp" apre WhatsApp, con il numero già inserito', JSON.stringify(collegamenti) === JSON.stringify([['Chiama', 'tel:+393471234567'], ['Scrivi su WhatsApp', 'https://wa.me/393471234567']]), JSON.stringify(collegamenti));
  await app.screenshot({ path: path.join(OUT, 'app-prenotazione.png'), fullPage: true });
  await leggibile(app, 'Prenotazione');
  await app.locator('[data-annulla-prenotazione]').click();
  await app.locator('dialog[open]').waitFor();
  verifica('annullare chiede conferma (mai cancellare senza conferma)', /Annullo la prenotazione di Giulia Rossi\?/.test(await app.locator('[data-domanda-titolo]').innerText()));
  await app.locator('[data-domanda-no]').click();
  await attendi(300);
  verifica('"No, torna indietro" non annulla niente', (await posta()).length === 0 && await app.locator('[data-annulla-prenotazione]').count() === 1);
  await app.locator('[data-annulla-prenotazione]').click();
  await app.locator('[data-domanda-si]').click();
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  await attendi(400);
  p = await posta();
  verifica('prenotazione confermata annullata: al cliente il messaggio gentile di scuse con il link', p.length === 1 && p[0].a === 'giulia.rossi@esempio.it' && /^Ci scusiamo/.test(p[0].oggetto) && /Scegli un altro momento/.test(p[0].html));
  await attendi(2800);

  /* ====================================================================== */
  titolo('TEST 6 — avviso in home dall’app → sul sito (3.8)');
  await vai('sito');
  await app.waitForSelector('.g-voce');
  await app.screenshot({ path: path.join(OUT, 'app-sito.png') });
  await leggibile(app, 'Sito');
  await sito.goto(BASE + '/', { waitUntil: 'networkidle' });
  verifica('prima: sul sito nessun avviso', await sito.locator('[data-avviso]').isHidden());
  await vai('sito-avviso');
  await app.waitForSelector('[data-avviso]');
  await app.fill('textarea[name=testo]', 'Da lunedì nuova sala riunioni: chiedici la disponibilità.');
  await app.locator('[data-leva]').click();
  await leggibile(app, 'Avviso');
  await app.screenshot({ path: path.join(OUT, 'app-avviso.png') });
  await app.click('[data-avviso] button[type=submit]');
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  await sito.goto(BASE + '/', { waitUntil: 'networkidle' });
  verifica('dopo: l’avviso è in cima alla home', await sito.locator('[data-avviso]').isVisible() && (await sito.locator('[data-avviso-testo]').innerText()) === 'Da lunedì nuova sala riunioni: chiedici la disponibilità.');
  await sito.screenshot({ path: path.join(OUT, 'sito-avviso.png') });
  const cache = (await fetch(BASE + '/api/impostazioni')).headers.get('cache-control');
  verifica('il sito rilegge le modifiche entro un minuto (30 secondi sulla rete, mai nel browser)', cache === 'public, max-age=0, s-maxage=30', cache);
  const maligno = await api('avviso', { attivo: true, testo: '<img src=x onerror=alert(1)><b>grassetto</b>' });
  await sito.goto(BASE + '/', { waitUntil: 'networkidle' });
  verifica('impossibile cambiare il disegno: l’avviso è solo testo, il codice non viene eseguito', await sito.locator('[data-avviso] img, [data-avviso] b').count() === 0 && /<b>grassetto<\/b>/.test(await sito.locator('[data-avviso-testo]').innerText()), JSON.stringify(maligno));
  await attendi(2000);
  await vai('sito-avviso');
  await app.waitForSelector('[data-avviso]');
  await app.locator('[data-leva]').click();
  await app.click('[data-avviso] button[type=submit]');
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  await sito.goto(BASE + '/', { waitUntil: 'networkidle' });
  verifica('con l’interruttore su "nascosto" l’avviso sparisce dal sito', await sito.locator('[data-avviso]').isHidden());
  await attendi(2000);

  titolo('FOTO DELLA GALLERIA (3.8): aggiungere, riordinare, togliere');
  /* una foto grande, come quelle del telefono: 4000x3000 */
  const fotoGrande = path.join(__dirname, 'foto-telefono.jpg');
  const dati = await app.evaluate(() => { const c = document.createElement('canvas'); c.width = 4000; c.height = 3000; const x = c.getContext('2d');
    for (let i = 0; i < 400; i++) { x.fillStyle = 'hsl(' + (i * 37 % 360) + ',55%,' + (30 + i % 40) + '%)'; x.fillRect((i * 613) % 4000, (i * 431) % 3000, 700, 500); }
    return c.toDataURL('image/jpeg', 0.95).split(',')[1]; });
  fs.writeFileSync(fotoGrande, Buffer.from(dati, 'base64'));
  await vai('sito-foto');
  await app.waitForSelector('[data-nuova-foto]');
  verifica('si parte dalle due foto del sito', await app.locator('.g-foto').count() === 2);
  await app.locator('[data-nuova-foto]').setInputFiles(fotoGrande);
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 20000 });
  await attendi(2800);
  await app.waitForSelector('.g-foto:nth-child(3)');
  await app.screenshot({ path: path.join(OUT, 'app-foto.png'), fullPage: true });
  await leggibile(app, 'Foto');
  const sitoFoto = (await api('sito')).dati.foto;
  const nuova = sitoFoto[2];
  const grande = await fetch(BASE + nuova.src.replace('t=p', 't=g')), piccola = await fetch(BASE + nuova.src);
  const bG = Buffer.from(await grande.arrayBuffer()), bP = Buffer.from(await piccola.arrayBuffer());
  const misura = b => { for (let i = 2; i < b.length;) { if (b[i] !== 0xFF) break; const m = b[i + 1]; if (m >= 0xC0 && m <= 0xC3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + b.readUInt16BE(i + 2); } return null; };
  verifica('foto compressa e ridimensionata prima del caricamento: da ' + Math.round(fs.statSync(fotoGrande).size / 1024) + ' KB (4000×3000) a ' + Math.round(bG.length / 1024) + ' KB (' + (misura(bG) || []).join('×') + ') e ' + Math.round(bP.length / 1024) + ' KB (' + (misura(bP) || []).join('×') + ')',
    grande.status === 200 && grande.headers.get('content-type') === 'image/jpeg' && JSON.stringify(misura(bG)) === '[1440,1080]' && JSON.stringify(misura(bP)) === '[720,540]' && bG.length < fs.statSync(fotoGrande).size / 3);
  verifica('le foto restano in memoria un anno (indirizzo che non cambia)', /immutable/.test(grande.headers.get('cache-control')));
  await sito.goto(BASE + '/', { waitUntil: 'networkidle' });
  verifica('la foto nuova compare sul sito, nella sezione "Lo spazio"', await sito.locator('[data-galleria] figure').count() === 3 && (await sito.locator('[data-galleria] figure').nth(2).locator('img').getAttribute('src')) === nuova.src);
  await sito.locator('[data-galleria]').scrollIntoViewIfNeeded();
  await sito.waitForTimeout(600);
  await sito.locator('[data-galleria]').screenshot({ path: path.join(OUT, 'sito-galleria.png') });
  await app.locator('.g-foto').nth(2).locator('[data-sposta="-1"]').click();
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  await attendi(1700);
  verifica('riordinare: la foto nuova sale al secondo posto', (await api('sito')).dati.foto[1].id === nuova.id);
  await app.locator('.g-foto').nth(0).locator('[data-togli-foto]').click();
  await app.locator('dialog[open]').waitFor();
  verifica('togliere una foto chiede conferma', /Tolgo questa foto dal sito\?/.test(await app.locator('[data-domanda-titolo]').innerText()));
  await app.locator('[data-domanda-si]').click();
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  await attendi(2800);
  await sito.goto(BASE + '/', { waitUntil: 'networkidle' });
  verifica('tolta la prima foto: sul sito ne restano due, nel nuovo ordine', await sito.locator('[data-galleria] figure').count() === 2 && (await sito.locator('[data-galleria] figure').first().getAttribute('data-foto-id')) === nuova.id);
  const troppo = await api('foto-aggiungi', { grande: 'PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==', piccola: 'PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==' });
  verifica('un file che non è una foto viene rifiutato', troppo.stato === 400, JSON.stringify(troppo));

  titolo('TELEFONO E WHATSAPP (3.8)');
  await vai('sito-contatti');
  await app.waitForSelector('[data-contatti]');
  await leggibile(app, 'Telefono e WhatsApp');
  await app.fill('input[name=telefono]', '333 111 2233'); await app.fill('input[name=whatsapp]', '333 111 2233');
  await app.click('[data-contatti] button[type=submit]');
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  await sito.goto(BASE + '/', { waitUntil: 'networkidle' });
  verifica('sul sito i pulsanti Chiama e WhatsApp usano i numeri nuovi', (await sito.locator('.piede [data-tel]:not([data-tel="fisso"])').first().getAttribute('href')) === 'tel:+393331112233' && /wa\.me\/393331112233/.test(await sito.locator('[data-wa]').first().getAttribute('href')) && /333 111 2233/.test(await sito.locator('.piede').innerText()));
  const male = await api('contatti', { telefono: 'abc', whatsapp: '12' });
  verifica('un numero scritto male non viene salvato', male.stato === 400);
  const proibito = await api('impostazioni', { listino: [{ id: 'giornata', prezzo: 1 }] });
  verifica('dall’app non si toccano prezzi, layout o sezioni: l’azione non esiste', proibito.stato === 404, JSON.stringify(proibito));
  await attendi(2000);

  titolo('COME VA (3.9) e PROFILO (3.10)');
  await app.locator('.g-profilo').click();
  await app.waitForSelector('.g-voce');
  verifica('dall’icona del profilo in alto: "Come va" e "Impostazioni"', JSON.stringify(await app.locator('.g-voce strong').allInnerTexts()) === JSON.stringify(['Come va', 'Impostazioni']));
  await leggibile(app, 'Profilo');
  await app.locator('.g-voce', { hasText: 'Come va' }).click();
  await app.waitForSelector('.g-numero');
  await app.screenshot({ path: path.join(OUT, 'app-come-va.png') });
  verifica('tre numeri grandi e basta, niente grafici', await app.locator('.g-numero').count() === 3 && await app.locator('#vista svg, #vista canvas').count() === 0, (await app.locator('#vista').innerText()).replace(/\s+/g, ' '));
  await leggibile(app, 'Come va');
  await app.locator('[data-indietro]').click();
  await app.waitForSelector('.g-voce');
  verifica('"Indietro" torna alla schermata di prima', /#profilo$/.test(app.url()));
  await vai('impostazioni');
  await app.waitForSelector('[data-notifiche]');
  await app.screenshot({ path: path.join(OUT, 'app-impostazioni.png'), fullPage: true });
  verifica('Impostazioni: pulsante grande "Attiva le notifiche"', (await app.locator('[data-attiva-notifiche]').innerText()) === 'Attiva le notifiche');
  await leggibile(app, 'Impostazioni');

  /* ====================================================================== */
  titolo('PROMEMORIA DOPO 2 ORE (2.3)');
  await posta(true); notifiche.length = 0;
  await richiesta('Sara', 'Neri', 'sara.neri@esempio.it', isoTra(12), 'giornata');
  await posta(true); notifiche.length = 0;
  let cron = await (await fetch(BASE + '/api/cron?compito=attese')).json();
  verifica('richiesta appena arrivata: nessun promemoria', cron.sollecitate === 0 || cron.fuoriOrario === true, JSON.stringify(cron));
  await fetch(BASE + '/__invecchia');
  cron = await (await fetch(BASE + '/api/cron?compito=attese')).json();
  p = await posta();
  if (cron.fuoriOrario) {
    verifica('(adesso è notte a Roma: il promemoria aspetta la mattina, come previsto — il resto è coperto dai test automatici)', p.length === 0 && notifiche.length === 0, JSON.stringify(cron));
  } else {
    verifica('in attesa da più di 2 ore: parte il promemoria per email a info@bagnarino.it, con i due pulsanti', cron.sollecitate === 1 && p.length === 1 && p[0].a === 'info@bagnarino.it' && /^Aspetta la tua risposta: Sara Neri/.test(p[0].oggetto) && />Conferma</.test(p[0].html), JSON.stringify(cron) + ' ' + p.map(m => m.oggetto));
    verifica('…e come notifica push', notifiche.length === 1 && notifiche[0].titolo === 'Una richiesta aspetta la tua risposta' && /Sara Neri/.test(notifiche[0].corpo), JSON.stringify(notifiche));
    cron = await (await fetch(BASE + '/api/cron?compito=attese')).json();
    verifica('il promemoria parte una volta sola', cron.sollecitate === 0 && (await posta()).length === 1);
  }
  const altri = await fetch(BASE + '/api/cron?compito=report');
  verifica('gli altri compiti automatici restano protetti dal segreto', altri.status === 401);

  /* ====================================================================== */
  titolo('TEST 8 — nessuna email a indirizzi diversi dal cliente e da info@bagnarino.it');
  const dest = new Set();
  /* tutto il giro di oggi */
  await posta(true);
  const cod = await richiesta('Luca', 'Gialli', 'luca.gialli@esempio.it', isoTra(13), 'pomeriggio');
  await sito.goto(BASE + '/prenotazione', { waitUntil: 'networkidle' });
  await sito.waitForTimeout(400);
  await sito.locator('[data-annulla]').click(); await sito.locator('[data-conferma-si]').click();
  await sito.waitForTimeout(900);
  (await posta()).forEach(m => dest.add(m.a));
  verifica('richiesta + ritiro da parte del cliente: destinatari solo cliente e info@bagnarino.it', JSON.stringify([...dest].sort()) === JSON.stringify(['info@bagnarino.it', 'luca.gialli@esempio.it']), [...dest].join(', '));
  verifica('ogni email al cliente ha reply-to info@bagnarino.it', (await posta()).filter(m => m.a !== 'info@bagnarino.it').every(m => m.rispondiA === 'info@bagnarino.it'));

  /* ====================================================================== */
  titolo('RECUPERO PASSWORD (3.2)');
  await posta(true);
  const fuori = await browser.newContext(iphone);
  const rec = await fuori.newPage();
  await rec.goto(BASE + '/gestione/accedi');
  await rec.click('a[href="/gestione/password"]');
  await rec.waitForSelector('[data-recupero]');
  await leggibile(rec, 'Password dimenticata');
  await rec.fill('input[name=email]', 'info@bagnarino.it');
  await rec.click('button[type=submit]');
  await rec.locator('[data-esito]:not([hidden])').waitFor();
  p = await posta();
  const linkPw = p.length ? (/href="([^"]*\/gestione\/password\?t=[^"]+)"/.exec(p[0].html) || [])[1] : '';
  verifica('arriva l’email con il pulsante, a info@bagnarino.it', p.length === 1 && p[0].a === 'info@bagnarino.it' && !!linkPw, p.map(m => m.a + ' ' + m.oggetto).join());
  await rec.goto(linkPw.replace(/^https?:\/\/[^/]+/, BASE));
  await rec.waitForSelector('[data-nuova-password]');
  await rec.fill('input[name=password]', 'corta');
  await rec.click('button[type=submit]');
  await rec.locator('[data-errore]:not([hidden])').waitFor();
  verifica('una password troppo corta non passa', /almeno 8/.test(await rec.locator('[data-errore]').innerText()));
  await rec.fill('input[name=password]', 'il coworking di corso lamarmora');
  await rec.click('button[type=submit]');
  await rec.waitForURL('**/gestione');
  await rec.waitForSelector('.g-saluto');
  verifica('con la password nuova si entra subito', true);
  await rec.goto(linkPw.replace(/^https?:\/\/[^/]+/, BASE));
  verifica('lo stesso link non vale una seconda volta', /non vale più/.test(await rec.locator('main').innerText()));
  const vecchia = await api('oggi');
  verifica('cambiata la password, gli altri telefoni devono rientrare', vecchia.stato === 401, 'stato ' + vecchia.stato);
  await fuori.close();

  /* ====================================================================== */
  titolo('TEST 7 — app installabile: Android e iPhone simulati');
  await app.goto(BASE + '/gestione/accedi');
  await app.fill('input[name=email]', 'info@bagnarino.it'); await app.fill('input[name=password]', 'il coworking di corso lamarmora');
  await app.click('button[type=submit]');
  await app.waitForURL('**/gestione'); await app.waitForSelector('.g-saluto');
  const manifest = await (await fetch(BASE + '/gestione.webmanifest')).json();
  verifica('manifest: nome "Bagnarino", schermo intero (standalone), colore del brand', manifest.name === 'Bagnarino' && manifest.short_name === 'Bagnarino' && manifest.display === 'standalone' && manifest.theme_color === '#1B2A3A' && manifest.start_url === '/gestione' && manifest.scope === '/gestione');
  const png = b => [b.readUInt32BE(16), b.readUInt32BE(20)];
  let icone = true; const dettagli = [];
  for (const i of manifest.icons) { const r = await fetch(BASE + i.src); const b = Buffer.from(await r.arrayBuffer()); const m = png(b).join('x'); if (r.status !== 200 || m !== i.sizes) { icone = false; dettagli.push(i.src + ' ' + r.status + ' ' + m); } }
  verifica('icone del logo in tutte le misure (' + manifest.icons.map(i => i.sizes.split('x')[0]).join(', ') + '), ognuna della misura dichiarata', icone && manifest.icons.some(i => i.purpose === 'maskable') && manifest.icons.some(i => i.sizes === '512x512') && manifest.icons.some(i => i.sizes === '192x192'), dettagli.join());
  const testa = await app.evaluate(() => ({ manifest: document.querySelector('link[rel=manifest]').getAttribute('href'), apple: [...document.querySelectorAll('link[rel=apple-touch-icon]')].map(l => l.getAttribute('href')),
    capace: document.querySelector('meta[name=apple-mobile-web-app-capable]').content, titolo: document.querySelector('meta[name=apple-mobile-web-app-title]').content, tema: document.querySelector('meta[name=theme-color]').content }));
  const apple = await fetch(BASE + '/img/app/icona-180.png');
  verifica('iPhone: apple-touch-icon 180×180, schermo intero, nome "Bagnarino"', testa.apple.includes('/img/app/icona-180.png') && png(Buffer.from(await apple.arrayBuffer())).join('x') === '180x180' && testa.capace === 'yes' && testa.titolo === 'Bagnarino', JSON.stringify(testa));
  const sw = await app.evaluate(async () => { const r = await navigator.serviceWorker.ready; return { scope: r.scope, attivo: r.active && r.active.state, controlla: !!navigator.serviceWorker.controller }; });
  verifica('service worker attivo sull’area /gestione', /\/gestione$/.test(sw.scope) && sw.attivo === 'activated', JSON.stringify(sw));
  const install = await cdp.send('Page.getInstallabilityErrors');
  const mf = await cdp.send('Page.getAppManifest');
  verifica('Android (Chrome): l’app risulta installabile, nessun errore', install.installabilityErrors.length === 0 && mf.errors.length === 0, JSON.stringify(install.installabilityErrors) + JSON.stringify(mf.errors));
  /* senza rete: messaggio chiaro */
  await marcellaCtx.setOffline(true);
  await app.goto(BASE + '/gestione').catch(() => null);
  verifica('senza rete: messaggio chiaro al posto dell’errore del browser', /Non c’è connessione/.test(await app.locator('body').innerText().catch(() => '')));
  await marcellaCtx.setOffline(false);
  await marcellaCtx.close();

  /* aperta dall'icona: Chromium la apre come finestra-app, senza barra del browser.
     Stesso profilo di prima: è lo stesso "telefono", chiuso e riaperto. */
  const installata = await chromium.launchPersistentContext(cartella, { headless: false, viewport: null, reducedMotion: 'reduce', args: ['--app=' + BASE + '/gestione', '--window-size=390,844'] });
  const finestra = installata.pages()[0] || await installata.waitForEvent('page');
  finestra.on('pageerror', e => errori.push('app installata: ' + e.message));
  await finestra.waitForSelector('.g-saluto', { timeout: 15000 });
  verifica('chiusa e riaperta dall’icona: è ancora dentro, senza riscrivere la password', /Marcella/.test(await finestra.locator('.g-saluto').innerText()));
  await finestra.evaluate(() => { location.hash = 'impostazioni'; });
  await finestra.waitForSelector('[data-notifiche]');
  const interno = await finestra.evaluate(() => ({ standalone: matchMedia('(display-mode: standalone)').matches, browser: matchMedia('(display-mode: browser)').matches, installa: !!document.querySelector('#vista a[href="/gestione/installa"]') }));
  verifica('aperta dall’icona: a tutto schermo (niente barra del browser), e non propone più di installarla', interno.standalone && !interno.browser && !interno.installa, JSON.stringify(interno));
  await finestra.screenshot({ path: path.join(OUT, 'app-android-installata.png') });
  /* uscita */
  await finestra.locator('[data-esci]').click();
  await finestra.locator('[data-domanda-si]').click();
  await finestra.waitForURL('**/gestione/accedi');
  await finestra.goto(BASE + '/gestione');
  verifica('dopo "Esci" l’app chiede di nuovo l’accesso', /\/gestione\/accedi$/.test(finestra.url()));
  await installata.close();

  /* iPhone: in Safari (non installata) le notifiche non esistono; dall'icona sì */
  const safari = await browser.newContext(iphone);
  await safari.addInitScript(() => { delete window.PushManager; try { delete Object.getPrototypeOf(window).PushManager; } catch (e) {} });
  const ip = await safari.newPage();
  await ip.goto(BASE + '/gestione/accedi');
  await ip.fill('input[name=email]', 'info@bagnarino.it'); await ip.fill('input[name=password]', 'il coworking di corso lamarmora');
  await ip.click('button[type=submit]');
  await ip.waitForURL('**/gestione'); await ip.waitForSelector('.g-saluto');
  await ip.waitForSelector('[data-notifiche]');
  const inSafari = (await ip.locator('[data-notifiche]').innerText()).replace(/\s+/g, ' ');
  verifica('iPhone in Safari: spiega che prima va messa l’app sulla schermata Home, con il pulsante per le istruzioni', /Prima metti l’app sul telefono/.test(inSafari) && /solo dall’app sulla schermata Home/.test(inSafari) && await ip.locator('[data-notifiche] a[href="/gestione/installa"]').count() === 1, inSafari);
  await ip.screenshot({ path: path.join(OUT, 'app-iphone-safari.png'), fullPage: true });
  await safari.close();
  const casa = await browser.newContext(iphone);
  await casa.addInitScript(() => { Object.defineProperty(navigator, 'standalone', { get: () => true }); });
  const ih = await casa.newPage();
  await ih.goto(BASE + '/gestione/accedi');
  await ih.fill('input[name=email]', 'info@bagnarino.it'); await ih.fill('input[name=password]', 'il coworking di corso lamarmora');
  await ih.click('button[type=submit]');
  await ih.waitForURL('**/gestione'); await ih.waitForSelector('.g-saluto');
  await ih.evaluate(() => { location.hash = 'impostazioni'; });
  await ih.waitForSelector('[data-notifiche]');
  const dallIcona = (await ih.locator('#vista').innerText()).replace(/\s+/g, ' ');
  verifica('iPhone dall’icona sulla schermata Home: non chiede più di installare l’app', !/Come mettere l’app sul telefono/.test(dallIcona), dallIcona.slice(0, 160));
  await ih.screenshot({ path: path.join(OUT, 'app-iphone-installata.png'), fullPage: true });
  await casa.close();

  /* la pagina delle istruzioni */
  const guida = await browser.newContext(iphone);
  const gi = await guida.newPage();
  await gi.goto(BASE + '/gestione/installa');
  verifica('/gestione/installa si apre senza accesso', gi.url().endsWith('/gestione/installa') && /Metti l’app sul telefono/.test(await gi.locator('main').innerText()));
  const passiI = await gi.locator('[data-pannello="iphone"] .g-passo h3').allInnerTexts();
  verifica('iPhone: Safari → Condividi → Aggiungi alla schermata Home, passo passo con i disegni', /Safari/.test(passiI[0]) && /Condividi/.test(passiI[1]) && /Aggiungi alla schermata Home/.test(passiI[2]) && await gi.locator('[data-pannello="iphone"] svg.g-disegno').count() >= 4, passiI.join(' | '));
  await gi.screenshot({ path: path.join(OUT, 'installa-iphone.png'), fullPage: true });
  await leggibile(gi, 'Installa (iPhone)');
  await gi.locator('[data-telefono="android"]').click();
  const passiA = await gi.locator('[data-pannello="android"] .g-passo h3').allInnerTexts();
  verifica('Android: Chrome → Installa app, passo passo con i disegni', /Chrome/.test(passiA[0]) && /tre puntini/.test(passiA[1]) && /Installa app/.test(passiA[2]) && await gi.locator('[data-pannello="android"] svg.g-disegno').count() >= 4 && await gi.locator('[data-pannello="iphone"]').isHidden(), passiA.join(' | '));
  await gi.screenshot({ path: path.join(OUT, 'installa-android.png'), fullPage: true });
  await leggibile(gi, 'Installa (Android)');
  await guida.close();

  verifica('nessun errore JavaScript durante tutta la prova', errori.length === 0, errori.join(' | '));
  await browser.close(); finto.close();
  const no2 = esiti.filter(x => !x.ok);
  console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - no2.length) + ' ok, ' + no2.length + ' non passati');
  no2.forEach(x => console.log('  NON PASSATO: ' + x.nome));
  process.exit(no2.length ? 1 : 0);
})().catch(e => { console.error('ERRORE DELLA PROVA:', e); process.exit(2); });
