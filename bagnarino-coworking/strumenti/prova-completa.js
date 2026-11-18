/* =============================================================
   Prova completa, come la farebbe una persona: il cliente dal sito
   (telefono, 390px) e Marcella dall'app, anche su un Android piccolo
   e non recente (360 e 320px). Il server è quello locale
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
async function leggibile(page, nome, larghezza) {
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
  verifica(nome + ': nessuno scroll orizzontale a ' + (larghezza || 390) + 'px', r.scroll === 0, 'scroll ' + r.scroll);
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
  /* la prenotazione di oggi viene aggiunta a mano dall'app, come per chi telefona o passa di persona */
  await posta(true);
  await vai('prenotazioni');
  await app.locator('a[href="#nuova"]').click();
  await app.waitForSelector('[data-nuova]');
  await leggibile(app, 'Aggiungi una prenotazione');
  const fasciaGiornata = await app.locator('[data-campo-fascia]').isVisible();
  await app.selectOption('[data-nuova] select[name=pacchetto]', 'carnet');
  verifica('"Aggiungi una prenotazione": la fascia si sceglie solo per la giornata; per carnet e mesi si chiede "Da che giorno"', fasciaGiornata && await app.locator('[data-campo-fascia]').isHidden() && (await app.locator('[data-etichetta-giorno]').innerText()) === 'Da che giorno');
  await app.selectOption('[data-nuova] select[name=pacchetto]', 'giornata');
  await app.click('[data-nuova] button[type=submit]');
  verifica('senza nome e telefono non si salva, e dice cosa serve', /Servono nome, cognome, telefono e giorno/.test(await app.locator('[data-nuova] [data-errore]').innerText()));
  await app.fill('[data-nuova] input[name=nome]', 'Anna'); await app.fill('[data-nuova] input[name=cognome]', 'Verdi');
  await app.fill('[data-nuova] input[name=telefono]', '347 999 8877'); await app.fill('[data-nuova] input[name=email]', 'anna.verdi@esempio.it');
  await app.screenshot({ path: path.join(OUT, 'app-aggiungi-prenotazione.png'), fullPage: true });
  await app.click('[data-nuova] button[type=submit]');
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  const dettoNuova = await app.locator('[data-fatto-testo]').innerText();
  await app.waitForFunction(() => /^#prenotazione\/\d+$/.test(location.hash));
  await app.waitForSelector('a[href^="#pagamento/"]');
  const schedaNuova = (await app.locator('#vista').innerText()).replace(/\s+/g, ' ');
  p = await posta();
  verifica('prenotazione aggiunta a mano: è già confermata e al cliente parte l’email di conferma', /email di conferma/.test(dettoNuova) && /Anna Verdi/.test(schedaNuova) && /Confermata/.test(schedaNuova) &&
    p.length === 1 && p[0].a === 'anna.verdi@esempio.it' && /^Prenotazione confermata/.test(p[0].oggetto), dettoNuova + ' | ' + p.map(m => m.a + ' ' + m.oggetto).join(' | '));
  verifica('nella scheda: il posto, da dove arriva ("Aggiunta da te"), la Bagnarino Card, il pagamento', /Posto Postazione \d/.test(schedaNuova) && /Arriva da Aggiunta da te/.test(schedaNuova) && /Bagnarino Card 0 timbri su 10/.test(schedaNuova) && /Da pagare: €25/.test(schedaNuova), schedaNuova);
  await attendi(2800);
  await leggibile(app, 'Prenotazione aggiunta a mano');
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
  await attendi(2000);

  titolo('PROFILO (3.10): Come va, Clienti, Incassi, Impostazioni');
  await app.locator('.g-profilo').click();
  await app.waitForFunction(() => location.hash === '#profilo');
  await app.locator('.g-voce', { hasText: 'Incassi' }).waitFor();
  verifica('dall’icona del profilo in alto: "Come va", "Clienti", "Incassi", "Impostazioni"', JSON.stringify(await app.locator('.g-voce strong').allInnerTexts()) === JSON.stringify(['Come va', 'Clienti', 'Incassi', 'Impostazioni']));
  await leggibile(app, 'Profilo');

  titolo('COME VA (3.9): il mese, i social, Google e le chiamate, la pubblicità, da dove arrivano i clienti');
  /* a questo punto le prenotazioni di prima sono state tutte annullate: ne serve una vera, aggiunta a mano per oggi pomeriggio */
  const pagante = await api('prenotazione-nuova', { pacchetto: 'giornata', data: isoTra(0), fascia: 'pomeriggio', nome: 'Paola', cognome: 'Paganti', telefono: '3475556677' });
  /* Apex Media entra nella stessa app con il suo accesso e scrive i numeri del mese */
  const apexCtx = await browser.newContext(iphone);
  const ax = await apexCtx.newPage();
  ax.on('pageerror', e => errori.push('app (Apex Media): ' + e.message));
  await ax.goto(BASE + '/gestione/accedi');
  await ax.fill('input[name=email]', 'studio@infoapex.eu'); await ax.fill('input[name=password]', 'apex-prova');
  await ax.click('button[type=submit]');
  await ax.waitForURL('**/gestione'); await ax.waitForSelector('.g-saluto');
  verifica('Apex Media entra nella stessa app, con la sua email e la sua password', /Apex Media/.test(await ax.locator('.g-saluto').innerText()));
  await ax.evaluate(() => { location.hash = 'come-va'; });
  await ax.locator('a[href^="#numeri-mese/"]').waitFor();
  await ax.locator('a[href^="#numeri-mese/"]').click();
  await ax.waitForSelector('[data-numeri]');
  await leggibile(ax, 'Numeri del mese (Apex Media)');
  const numeri = { instagram_follower: '-5', instagram_copertura: '5.300', facebook_follower: '310', facebook_copertura: '900', google_visualizzazioni: '2300', google_chiamate: '12', google_indicazioni: '30',
    google_clic_sito: '45', recensioni_numero: '37', recensioni_media: '4,8', visite_sito: '320', contatti_whatsapp: '9', spesa_meta: '80', spesa_google: '40,50' };
  for (const k of Object.keys(numeri)) await ax.fill('[data-numeri] input[name=' + k + ']', numeri[k]);
  await ax.fill('[data-numeri] textarea[name=note]', 'Campagna di questo mese su Instagram.');
  await ax.click('[data-numeri] button[type=submit]');
  await ax.locator('[data-numeri] [data-errore]:not([hidden])').waitFor({ timeout: 8000 });
  verifica('un numero sbagliato non viene salvato, e dice quale', /Follower Instagram/.test(await ax.locator('[data-numeri] [data-errore]').innerText()));
  await ax.fill('[data-numeri] input[name=instagram_follower]', '1.240');
  await ax.screenshot({ path: path.join(OUT, 'app-apex-numeri.png'), fullPage: true });
  await ax.click('[data-numeri] button[type=submit]');
  await ax.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  await ax.waitForFunction(() => /^#come-va\/\d{4}-\d{2}$/.test(location.hash));
  await ax.locator('.g-voce small', { hasText: '1.240 follower su Instagram' }).waitFor();
  verifica('Apex Media salva i numeri del mese e li rivede subito in "Come va"', true);
  await apexCtx.close();

  /* la titolare li legge, senza poterli cambiare */
  await app.locator('.g-voce', { hasText: 'Come va' }).click();
  await app.waitForSelector('.g-numero');
  const cv = (await app.locator('#vista').innerText()).replace(/\s+/g, ' ');
  verifica('Come va: tre numeri grandi (prenotazioni, euro prenotati, clienti nuovi), niente grafici', await app.locator('.g-numero').count() === 3 && await app.locator('#vista canvas, #vista svg:not(.g-ico)').count() === 0 &&
    /Prenotazion[ei] di /.test(cv) && /Prenotati ad? /.test(cv) && /Client[ei] nuov[oi]/.test(cv), cv.slice(0, 300));
  verifica('Come va: "Da vicino" porta a canali, social, Google e chiamate, pubblicità, mese per mese', JSON.stringify(await app.locator('.g-voce strong').allInnerTexts()) === JSON.stringify(['Da dove arrivano i clienti', 'Instagram e Facebook', 'Google e chiamate', 'Pubblicità', 'Mese per mese']) &&
    /1\.240 follower su Instagram/.test(cv) && /12 chiamate da Google/.test(cv) && /Spesi €120,50/.test(cv), cv);
  verifica('Come va: gli altri numeri (clienti che tornano, posti occupati oggi, da incassare) e la nota di Apex Media', /Clienti che tornano/.test(cv) && /Posti occupati oggi 1 su \d+/.test(cv) && /Da incassare €12 · una prenotazione/.test(cv) && /Questa settimana \d+ prenotazion/.test(cv) &&
    /Cosa abbiamo fatto questo mese Campagna di questo mese su Instagram\./.test(cv) && /aggiornati da Apex Media il \d+ /.test(cv), cv);
  verifica('la titolare non ha il pulsante per cambiare i numeri di social e Google', await app.locator('a[href^="#numeri-mese/"]').count() === 0 && (await api('numeri-mese', { mese: isoTra(0).slice(0, 7), dati: { instagram_follower: 1 } })).stato === 403);
  verifica('nel mese in corso la freccia "Mese dopo" è spenta', await app.locator('.g-mese button[aria-label="Mese dopo"]').isDisabled());
  await app.screenshot({ path: path.join(OUT, 'app-come-va.png'), fullPage: true });
  await leggibile(app, 'Come va');
  const daVicino = [
    ['Da dove arrivano i clienti', 'canali', [/Di persona o al telefono \d/, /Negli ultimi 12 mesi/, /Hanno visto i social 6\.200/, /Sono andati sul sito 320/, /Hanno chiesto un posto \d/]],
    ['Instagram e Facebook', 'social', [/Instagram Follower 1\.240/, /Persone raggiunte 5\.300/, /Facebook Follower 310/, /Prenotazioni arrivate da Instagram \d/]],
    ['Google e chiamate', 'google', [/Chiamate 12/, /Richieste di indicazioni stradali 30/, /Clic sul sito 45/, /Recensioni 4,8 su 5 · 37 in tutto/, /Chat su WhatsApp 9/]],
    ['Pubblicità', 'pubblicita', [/€120,50 Spesi ad? /, /Instagram e Facebook €80 · Google €40,50/]],
    ['Mese per mese', 'anno', [/Prenotazioni/, /Valore delle prenotazioni/]]
  ];
  for (const [nomeVoce, file, attese] of daVicino) {
    await app.locator('.g-voce', { hasText: nomeVoce }).click();
    await app.waitForSelector('.g-titolo');
    const t = (await app.locator('#vista').innerText()).replace(/\s+/g, ' ');
    verifica('Come va → ' + nomeVoce + ': numeri in parole semplici, righe con una barra al posto dei grafici', attese.every(r => r.test(t)) && await app.locator('#vista canvas, #vista svg').count() === 0, t.slice(0, 400));
    await leggibile(app, 'Come va · ' + nomeVoce);
    await app.screenshot({ path: path.join(OUT, 'app-come-va-' + file + '.png'), fullPage: true });
    await app.locator('[data-indietro]').click();
    await app.waitForFunction(() => location.hash === '#come-va');
    await app.waitForSelector('.g-numero');
  }
  await app.locator('[data-indietro]').click();
  await app.waitForFunction(() => location.hash === '#profilo');
  await app.waitForSelector('.g-voce');
  verifica('"Indietro" torna alla schermata di prima', /#profilo$/.test(app.url()));
  /* il mese prima: gli stessi numeri, e "in arrivo" dove Apex Media non li ha ancora scritti */
  await vai('come-va');
  await app.waitForSelector('.g-numero');
  await app.locator('.g-mese button[aria-label="Mese prima"]').click();
  await app.locator('.g-voce small', { hasText: 'Numeri in arrivo' }).first().waitFor();
  verifica('con le frecce si guardano i mesi passati; dove i numeri non ci sono ancora: "Numeri in arrivo"', await app.locator('.g-voce small', { hasText: 'Numeri in arrivo' }).count() === 3 &&
    !(await app.locator('.g-mese button[aria-label="Mese dopo"]').isDisabled()) && /Posti occupati oggi/.test(await app.locator('#vista').innerText()) === false);

  titolo('CLIENTI');
  const daTogliere = await api('prenotazione-nuova', { pacchetto: 'giornata', data: isoTra(15), fascia: 'giornata', nome: 'Piero', cognome: 'Provvisorio', telefono: '3470001122' });
  await vai('clienti');
  await app.waitForSelector('[data-cerca]');
  const quantiClienti = await app.locator('[data-elenco] .g-voce').count();
  verifica('Clienti: l’elenco, con quante prenotazioni ha ognuno', daTogliere.stato === 200 && quantiClienti >= 3 && /prenotazion/.test(await app.locator('[data-elenco]').innerText()) && new RegExp('^' + quantiClienti + ' clienti$').test((await app.locator('[data-quanti]').innerText()).trim()));
  await leggibile(app, 'Clienti');
  await app.screenshot({ path: path.join(OUT, 'app-clienti.png'), fullPage: true });
  await app.fill('[data-cerca]', 'verdi');
  await app.waitForFunction(() => document.querySelectorAll('[data-elenco] .g-voce').length === 1);
  verifica('la ricerca trova per nome', /Anna Verdi/.test(await app.locator('[data-elenco]').innerText()) && (await app.locator('[data-quanti]').innerText()).trim() === 'Un cliente');
  await app.locator('[data-elenco] .g-voce').click();
  await app.waitForSelector('[data-elimina-cliente]');
  const schedaCliente = (await app.locator('#vista').innerText()).replace(/\s+/g, ' ');
  verifica('scheda del cliente: Chiama e WhatsApp, quante prenotazioni, Bagnarino Card, tutte le sue prenotazioni', /Anna Verdi/.test(schedaCliente) && /Prenotazioni \d/.test(schedaCliente) && /Bagnarino Card \d+ timbr[oi] su 10/.test(schedaCliente) && /Le sue prenotazioni/.test(schedaCliente) &&
    await app.locator('.g-due a[href^="tel:"]').count() === 1 && await app.locator('.g-due a[href^="https://wa.me/"]').count() === 1 && await app.locator('a[href^="#nuova/c"]').count() === 1, schedaCliente);
  await leggibile(app, 'Cliente');
  await app.screenshot({ path: path.join(OUT, 'app-cliente.png'), fullPage: true });
  /* dalla scheda si aggiunge una prenotazione senza riscrivere i dati */
  await app.locator('a[href^="#nuova/c"]').click();
  await app.waitForSelector('[data-nuova]');
  verifica('"Aggiungi una sua prenotazione": nome, cognome, telefono ed email sono già scritti', await app.inputValue('[data-nuova] input[name=nome]') === 'Anna' && await app.inputValue('[data-nuova] input[name=cognome]') === 'Verdi' &&
    /347/.test(await app.inputValue('[data-nuova] input[name=telefono]')) && await app.inputValue('[data-nuova] input[name=email]') === 'anna.verdi@esempio.it');
  /* eliminare un cliente: mai senza conferma */
  await vai('clienti');
  await app.waitForSelector('[data-cerca]');
  await app.fill('[data-cerca]', 'provvisorio');
  await app.waitForFunction(() => document.querySelectorAll('[data-elenco] .g-voce').length === 1);
  await app.locator('[data-elenco] .g-voce').click();
  await app.waitForSelector('[data-elimina-cliente]');
  await app.locator('[data-elimina-cliente]').click();
  await app.locator('dialog[open]').waitFor();
  const domandaElimina = (await app.locator('dialog[open]').innerText()).replace(/\s+/g, ' ');
  await app.locator('[data-domanda-no]').click();
  await attendi(300);
  const ancoraLi = (await api('clienti&cerca=provvisorio')).dati.clienti.length === 1;
  await app.locator('[data-elimina-cliente]').click();
  await app.locator('[data-domanda-si]').click();
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  await app.waitForFunction(() => location.hash === '#clienti');
  verifica('eliminare un cliente chiede conferma e dice cosa sparisce; con "No" non succede niente, con "Sì" sparisce con la sua prenotazione', /Elimino Piero Provvisorio\?/.test(domandaElimina) && /la sua prenotazione/.test(domandaElimina) && /Non si può tornare indietro/.test(domandaElimina) && ancoraLi &&
    (await api('clienti&cerca=provvisorio')).dati.clienti.length === 0 && (await api('prenotazione&id=' + daTogliere.dati.id)).stato === 404, domandaElimina);
  await attendi(2800);

  titolo('INCASSI');
  await vai('incassi');
  await app.waitForSelector('.g-tre');
  let inc = (await app.locator('#vista').innerText()).replace(/\s+/g, ' ');
  verifica('Incassi: si apre sul mese, con "Incassati", "Da incassare" e l’elenco di chi deve ancora pagare', pagante.stato === 200 && (await app.locator('.g-tre [aria-pressed=true]').innerText()).trim() === 'Mese' && /Incassati/.test(inc) && /Da incassare/.test(inc) && /Paola Paganti/.test(inc) && /€12 · da pagare/.test(inc), inc.slice(0, 300));
  await leggibile(app, 'Incassi');
  await app.screenshot({ path: path.join(OUT, 'app-incassi.png'), fullPage: true });
  await app.locator('.g-tre button', { hasText: 'Giorno' }).click();
  await app.waitForFunction(() => /^#incassi\/giorno\//.test(location.hash));
  await app.locator('.g-tre [aria-pressed=true]', { hasText: 'Giorno' }).waitFor();
  verifica('"Giorno", "Settimana", "Mese": tre pulsanti, e le frecce per andare avanti e indietro', await app.locator('.g-tre button').count() === 3 && await app.locator('.g-mese button').count() === 2 && /Paola Paganti/.test(await app.locator('#vista').innerText()));
  await app.locator('.g-voce', { hasText: 'Paola Paganti' }).click();
  await app.waitForSelector('a[href^="#pagamento/"]');
  await app.locator('a[href^="#pagamento/"]').click();
  await app.waitForSelector('[data-paga]');
  verifica('"Ha pagato": una sola domanda, "Come ha pagato?", con tre pulsanti grandi', /Come ha pagato\?/.test(await app.locator('#vista').innerText()) && JSON.stringify(await app.locator('[data-paga]').allInnerTexts()) === JSON.stringify(['In contanti', 'Con la carta', 'Con bonifico']));
  await leggibile(app, 'Pagamento');
  await app.screenshot({ path: path.join(OUT, 'app-pagamento.png') });
  await app.locator('[data-paga="carta"]').click();
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  await app.waitForSelector('[data-non-pagato]');
  verifica('pagamento segnato: nella scheda "Ha pagato €12 con la carta"', /Ha pagato €12 con la carta, il \d+ /.test((await app.locator('#vista').innerText()).replace(/\s+/g, ' ')), (await app.locator('#vista').innerText()).replace(/\s+/g, ' '));
  await attendi(2800);
  await leggibile(app, 'Prenotazione pagata');
  await vai('incassi/giorno/' + isoTra(0));
  await app.locator('.g-sezione', { hasText: 'Già pagate' }).waitFor();
  inc = (await app.locator('#vista').innerText()).replace(/\s+/g, ' ');
  verifica('negli incassi di oggi risulta pagata con la carta', /€12 Incassati/.test(inc) && /Paola Paganti/.test(inc) && /€12 · pagato con la carta/.test(inc), inc.slice(0, 300));
  const elenco = await app.evaluate(async () => { const a = document.querySelector('#vista a[download]'); const r = await fetch(a.getAttribute('href')); return { tipo: r.headers.get('content-type'), testo: await r.text(), nome: a.getAttribute('download'), scritta: a.textContent.trim() }; });
  verifica('"Scarica l’elenco": un file per Excel con cliente, importo, pagato e metodo', elenco.scritta === 'Scarica l’elenco' && /text\/csv/.test(elenco.tipo) && /Paola Paganti;.*;12,00;sì;carta;/.test(elenco.testo) && /^incassi-bagnarino-.*\.csv$/.test(elenco.nome), elenco.testo.slice(0, 300));
  await vai('prenotazione/' + pagante.dati.id);
  await app.waitForSelector('[data-non-pagato]');
  await app.locator('[data-non-pagato]').click();
  await app.waitForSelector('a[href^="#pagamento/"]');
  verifica('"Ho sbagliato: non ha pagato" rimette la prenotazione tra quelle da incassare', /Da pagare: €12/.test(await app.locator('#vista').innerText()) && (await api('incassi&periodo=giorno&da=' + isoTra(0))).dati.totali.incassato === 0);
  await attendi(1800);

  titolo('PREZZI, POSTI, MESSAGGI DI WHATSAPP (Impostazioni)');
  await vai('impostazioni');
  await app.waitForSelector('[data-notifiche]');
  verifica('Impostazioni → "Il coworking": Prezzi, Quanti posti ci sono, Messaggi di WhatsApp', JSON.stringify(await app.locator('#vista .g-voce strong').allInnerTexts()) === JSON.stringify(['Prezzi', 'Quanti posti ci sono', 'Messaggi di WhatsApp']));
  await app.locator('#vista .g-voce', { hasText: 'Prezzi' }).click();
  await app.waitForSelector('[data-prezzi]');
  await leggibile(app, 'Prezzi');
  await app.fill('[data-prezzi] input[name="p-giornata"]', '28'); await app.fill('[data-prezzi] input[name=mezza]', '14');
  await app.screenshot({ path: path.join(OUT, 'app-prezzi.png'), fullPage: true });
  await app.click('[data-prezzi] button[type=submit]');
  await app.locator('dialog[open]').waitFor();
  const domandaPrezzi = (await app.locator('dialog[open]').innerText()).replace(/\s+/g, ' ');
  await app.locator('[data-domanda-si]').click();
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  await sito.goto('about:blank');
  await sito.goto(BASE + '/prenota?pacchetto=giornata', { waitUntil: 'networkidle' });
  await sito.locator('.giorno:not([disabled])').nth(4).click();
  const fasceNuove = (await sito.locator('.fascia').allInnerTexts()).map(t => t.replace(/\s+/g, ' '));
  await sito.goto(BASE + '/', { waitUntil: 'networkidle' });
  const homeNuova = (await sito.locator('body').innerText()).replace(/\s+/g, ' ');
  verifica('cambiare i prezzi chiede conferma; sul sito si vedono subito: Giornata €28, mezza giornata €14', /Cambio i prezzi\?/.test(domandaPrezzi) && JSON.stringify(fasceNuove) === JSON.stringify(['Mattina €14', 'Pomeriggio €14', 'Giornata intera €28']) && /Mezza giornata a €14/.test(homeNuova), JSON.stringify(fasceNuove));
  const rimessi = await api('coworking', { listino: [{ id: 'giornata', prezzo: 25 }], mezza: 12 });
  verifica('(prezzi rimessi com’erano per il resto della prova)', rimessi.stato === 200 && rimessi.dati.mezza === 12);
  await attendi(2800);
  await vai('imp-posti');
  await app.waitForSelector('[data-posti]');
  const postiPrima = +(await app.locator('[data-posti]').innerText());
  await leggibile(app, 'Quanti posti ci sono');
  await app.locator('[data-meno]').click();
  await app.screenshot({ path: path.join(OUT, 'app-posti.png') });
  await app.locator('[data-salva-posti]').click();
  await app.locator('dialog[open]').waitFor();
  const domandaPosti = (await app.locator('dialog[open]').innerText()).replace(/\s+/g, ' ');
  await app.locator('[data-domanda-si]').click();
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  const postiDopo = (await (await fetch(BASE + '/api/disponibilita?giorni=1')).json()).postazioni;
  verifica('quanti posti: meno e più, una conferma, e il sito offre un posto in meno', new RegExp('I posti diventano ' + (postiPrima - 1) + '\\?').test(domandaPosti) && postiDopo === postiPrima - 1, domandaPosti + ' → ' + postiDopo);
  await api('coworking', { postazioni: postiPrima });
  await attendi(2800);
  await vai('imp-messaggi');
  await app.waitForSelector('[data-messaggi]');
  await leggibile(app, 'Messaggi di WhatsApp');
  await app.fill('[data-messaggi] textarea[name="m-giorno"]', 'Buongiorno, vorrei un posto.');
  await app.click('[data-messaggi] button[type=submit]');
  await app.locator('[data-messaggi] [data-errore]:not([hidden])').waitFor({ timeout: 8000 });
  const erroreMessaggi = await app.locator('[data-messaggi] [data-errore]').innerText();
  await app.fill('[data-messaggi] textarea[name="m-giorno"]', 'Buongiorno, vorrei un posto per {giorno}.');
  await app.click('[data-messaggi] button[type=submit]');
  await app.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 8000 });
  verifica('messaggi di WhatsApp: le parole tra graffe devono restare (lo dice), poi si salva', /deve restare \{giorno\}/.test(erroreMessaggi) && (await api('coworking')).dati.messaggi.find(m => m.id === 'giorno').testo === 'Buongiorno, vorrei un posto per {giorno}.', erroreMessaggi);
  await attendi(2800);

  titolo('LA VECCHIA AREA /admin');
  const vecchiaArea = await fetch(BASE + '/admin', { redirect: 'manual' });
  verifica('/admin non esiste più: rimanda all’app', [302, 307, 308].indexOf(vecchiaArea.status) !== -1 && vecchiaArea.headers.get('location') === '/gestione', vecchiaArea.status + ' ' + vecchiaArea.headers.get('location'));
  verifica('le azioni della vecchia area non rispondono più', (await fetch(BASE + '/api/admin?azione=chi')).status === 404 && (await fetch(BASE + '/admin.js')).status === 404);

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

  /* ====================================================================== */
  titolo('TEST 7 bis — il telefono della titolare: un Android non recente (360 e 320px)');
  const android = { viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce',
    userAgent: 'Mozilla/5.0 (Linux; Android 8.1.0; SM-J530F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36' };
  const entra = async (pagina) => {
    await pagina.goto(BASE + '/gestione/accedi');
    await pagina.fill('input[name=email]', 'info@bagnarino.it'); await pagina.fill('input[name=password]', 'il coworking di corso lamarmora');
    await pagina.click('button[type=submit]');
    await pagina.waitForURL('**/gestione'); await pagina.waitForSelector('.g-saluto');
  };
  const apri = async (pagina, dove) => { await pagina.evaluate(h => { location.hash = h; }, dove); await pagina.waitForTimeout(700); };

  /* la pagina delle istruzioni: su Android si apre la scheda Android */
  const guida = await browser.newContext(android);
  const ga = await guida.newPage();
  ga.on('pageerror', e => errori.push('installa (Android): ' + e.message));
  await ga.goto(BASE + '/gestione/installa', { waitUntil: 'networkidle' });
  verifica('/gestione/installa si apre senza accesso', ga.url().endsWith('/gestione/installa') && /Metti l’app sul telefono/.test(await ga.locator('main').innerText()));
  verifica('si apre sulla scheda Android (quella di iPhone è nascosta)', (await ga.locator('[data-telefono][aria-selected=true]').innerText()).trim() === 'Android' && await ga.locator('[data-pannello="iphone"]').isHidden() && await ga.locator('[data-pannello="android"]').isVisible());
  const passiA = await ga.locator('[data-pannello="android"] ol .g-passo h3').allInnerTexts();
  verifica('Android, passo passo con i disegni: aggiorna Chrome → apri con Chrome → tre puntini → Aggiungi a schermata Home → Installa → icona → notifiche',
    passiA.length === 7 && /Aggiorna Chrome/.test(passiA[0]) && /con Chrome/.test(passiA[1]) && /tre puntini/.test(passiA[2]) && /Aggiungi a schermata Home/.test(passiA[3]) && /Installa/.test(passiA[4]) && /icona/.test(passiA[5]) && /notifiche/.test(passiA[6]) &&
    await ga.locator('[data-pannello="android"] svg.g-disegno').count() === 5, passiA.join(' | '));
  const testoA = (await ga.locator('[data-pannello="android"]').innerText()).replace(/\s+/g, ' ');
  verifica('dice anche gli altri nomi che si trovano sui telefoni ("Installa app", "Aggiungi", "Crea scorciatoia") e di non usare l’app "Internet" dei Samsung',
    /“Installa app”/.test(testoA) && /si chiama “Aggiungi”/.test(testoA) && /Crea scorciatoia/.test(testoA) && /non usare l’app “Internet”/.test(testoA) && /Play Store/.test(testoA));
  const consigli = await ga.locator('#notifiche ~ ul .g-passo h3').allInnerTexts();
  verifica('"Se le notifiche non arrivano": Chrome da aggiornare, notifiche spente, batteria, silenzioso, e l’email che arriva comunque',
    consigli.length === 5 && /Chrome non è aggiornato/.test(consigli[0]) && /spente/.test(consigli[1]) && /ritardo/.test(consigli[2]) && /silenzioso/.test(consigli[3]) && /Senza restrizioni/.test(testoA) && /arriva anche per email/.test(testoA), consigli.join(' | '));
  await ga.screenshot({ path: path.join(OUT, 'installa-android.png'), fullPage: true });
  await leggibile(ga, 'Installa (Android, 360px)', 360);
  /* installazione con un tocco: compare solo quando Chrome la offre */
  verifica('il riquadro "Installa l’app adesso" resta nascosto finché Chrome non offre l’installazione', await ga.locator('[data-installa-subito]').isHidden());
  await ga.evaluate(() => { const ev = new Event('beforeinstallprompt', { cancelable: true }); ev.prompt = () => { window.__chiesto = (window.__chiesto || 0) + 1; }; window.dispatchEvent(ev); });
  verifica('quando Chrome la offre: compare il pulsante grande "Installa l’app adesso"', await ga.locator('[data-installa-subito]').isVisible() && (await ga.locator('[data-installa-ora]').innerText()).trim() === 'Installa l’app adesso');
  await leggibile(ga, 'Installa con un tocco (Android, 360px)', 360);
  await ga.locator('[data-installa-ora]').click();
  verifica('un tocco sul pulsante apre la finestra di installazione di Chrome, una volta sola', await ga.evaluate(() => window.__chiesto) === 1 && await ga.locator('[data-installa-subito]').isHidden());
  /* dal link dell'app si arriva dritti all'aiuto */
  await ga.goto('about:blank');
  await ga.goto(BASE + '/gestione/installa#notifiche', { waitUntil: 'networkidle' });
  await ga.waitForTimeout(300);
  const ancora = await ga.evaluate(() => Math.round(document.getElementById('notifiche').getBoundingClientRect().top));
  verifica('il link dell’app porta dritti a "Se le notifiche non arrivano", sotto la testata e non coperto', ancora >= 60 && ancora <= 200, 'a ' + ancora + 'px');
  await ga.screenshot({ path: path.join(OUT, 'installa-android-notifiche.png') });
  await ga.setViewportSize({ width: 320, height: 568 });
  await ga.goto(BASE + '/gestione/installa', { waitUntil: 'networkidle' });
  await leggibile(ga, 'Installa (Android, 320px)', 320);
  await guida.close();

  /* su un iPhone si apre da sola la scheda iPhone */
  const guidaI = await browser.newContext(iphone);
  const gi = await guidaI.newPage();
  await gi.goto(BASE + '/gestione/installa', { waitUntil: 'networkidle' });
  const passiI = await gi.locator('[data-pannello="iphone"] .g-passo h3').allInnerTexts();
  verifica('su un iPhone si apre la scheda iPhone: Safari → Condividi → Aggiungi alla schermata Home, con i disegni', (await gi.locator('[data-telefono][aria-selected=true]').innerText()).trim() === 'iPhone' && await gi.locator('[data-pannello="android"]').isHidden() &&
    /Safari/.test(passiI[0]) && /Condividi/.test(passiI[1]) && /Aggiungi alla schermata Home/.test(passiI[2]) && await gi.locator('[data-pannello="iphone"] svg.g-disegno').count() === 4, passiI.join(' | '));
  await gi.screenshot({ path: path.join(OUT, 'installa-iphone.png'), fullPage: true });
  await leggibile(gi, 'Installa (iPhone)');
  await gi.locator('[data-telefono="android"]').click();
  verifica('le due schede si scambiano con un tocco', await gi.locator('[data-pannello="iphone"]').isHidden() && await gi.locator('[data-pannello="android"]').isVisible());
  await guidaI.close();

  /* l'app su Android, notifiche spente sul telefono (in questa finestra il permesso è negato) */
  const spente = await browser.newContext(android);
  await spente.addInitScript(() => { window.__BGN_PROVA = f => { window.__bgn = f; }; });
  const as = await spente.newPage();
  as.on('pageerror', e => errori.push('app (Android): ' + e.message));
  await entra(as);
  await as.waitForSelector('[data-notifiche]');
  const oggiSpente = (await as.locator('[data-notifiche]').innerText()).replace(/\s+/g, ' ');
  verifica('Android con le notifiche spente: lo dice con parole semplici e porta all’aiuto con un pulsante', await as.evaluate(() => Notification.permission) === 'denied' && /Le notifiche sono spente/.test(oggiSpente) && /Si riaccendono in un minuto/.test(oggiSpente) &&
    (await as.locator('[data-notifiche] a.g-btn').innerText()).trim() === 'Come riaccenderle' && await as.locator('[data-notifiche] a[href="/gestione/installa#notifiche"]').count() === 1, oggiSpente);
  await as.screenshot({ path: path.join(OUT, 'app-android-notifiche-spente.png'), fullPage: true });
  /* tutte le schermate, sullo schermo piccolo */
  const schermate = [['oggi', 'Oggi'], ['calendario', 'Calendario'], ['chiudi-giorni', 'Chiudi più giorni'], ['prenotazioni', 'Prenotazioni'], ['sito', 'Sito'], ['sito-avviso', 'Avviso'], ['sito-foto', 'Foto'], ['sito-contatti', 'Telefono'], ['profilo', 'Profilo'], ['come-va', 'Come va'], ['come-va-canali', 'Da dove arrivano i clienti'], ['come-va-social', 'Instagram e Facebook'],
    ['come-va-google', 'Google e chiamate'], ['come-va-pubblicita', 'Pubblicità'], ['come-va-anno', 'Mese per mese'], ['clienti', 'Clienti'], ['incassi', 'Incassi'], ['nuova', 'Aggiungi una prenotazione'],
    ['imp-prezzi', 'Prezzi'], ['imp-posti', 'Quanti posti ci sono'], ['imp-messaggi', 'Messaggi di WhatsApp'], ['impostazioni', 'Impostazioni']];
  const barra = pagina => pagina.evaluate(() => { const v = [...document.querySelectorAll('.g-barra a')]; const alto = v.map(a => Math.round(a.getBoundingClientRect().top));
    return { voci: v.length, unaRiga: alto.every(t => t === alto[0]), tagliate: v.filter(a => a.scrollWidth > a.clientWidth + 1).map(a => a.textContent.trim()), dentro: v.every(a => a.getBoundingClientRect().right <= window.innerWidth + 0.5) }; });
  for (const larghezza of [360, 320]) {
    await as.setViewportSize({ width: larghezza, height: larghezza === 360 ? 640 : 568 });
    for (const [dove, nome] of schermate) {
      await apri(as, dove);
      await leggibile(as, 'Android ' + larghezza + 'px · ' + nome, larghezza);
    }
    const b = await barra(as);
    verifica('Android ' + larghezza + 'px: le quattro voci in basso stanno su una riga, intere', b.voci === 4 && b.unaRiga && b.tagliate.length === 0 && b.dentro, JSON.stringify(b));
    await apri(as, 'oggi');
    await as.screenshot({ path: path.join(OUT, 'app-android-' + larghezza + '-oggi.png'), fullPage: true });
    await apri(as, 'calendario');
    await as.screenshot({ path: path.join(OUT, 'app-android-' + larghezza + '-calendario.png'), fullPage: true });
  }
  await as.setViewportSize({ width: 360, height: 640 });
  /* installazione con un tocco anche da dentro l'app */
  await apri(as, 'impostazioni');
  verifica('Impostazioni: "Metti l’app su questo telefono" resta nascosto finché Chrome non offre l’installazione', await as.locator('#vista [data-installa-ora]').isHidden() && await as.locator('#vista a[href="/gestione/installa"]').isVisible());
  await as.evaluate(() => { const ev = new Event('beforeinstallprompt', { cancelable: true }); ev.prompt = () => { window.__chiesto = (window.__chiesto || 0) + 1; }; window.dispatchEvent(ev); });
  verifica('Impostazioni: quando Chrome la offre compare "Metti l’app su questo telefono"', await as.locator('#vista [data-installa-ora]').isVisible() && (await as.locator('#vista [data-installa-ora]').innerText()).trim() === 'Metti l’app su questo telefono');
  await leggibile(as, 'Android 360px · Impostazioni con l’installazione', 360);
  await as.screenshot({ path: path.join(OUT, 'app-android-impostazioni.png'), fullPage: true });
  await as.locator('#vista [data-installa-ora]').click();
  verifica('Impostazioni: un tocco apre la finestra di installazione di Chrome', await as.evaluate(() => window.__chiesto) === 1);

  /* foto scattate in verticale: il file dice "girami", e sui Chrome vecchi lo fa l'app */
  const foto = await as.evaluate(async () => {
    /* una foto "coricata" 40x20 (metà sinistra rossa, metà destra blu) con l'indicazione 6: va girata di un quarto di giro */
    const c = document.createElement('canvas'); c.width = 40; c.height = 20; const x = c.getContext('2d');
    x.fillStyle = '#D00000'; x.fillRect(0, 0, 20, 20); x.fillStyle = '#0000D0'; x.fillRect(20, 0, 20, 20);
    const base = Uint8Array.from(atob(c.toDataURL('image/jpeg', 0.95).split(',')[1]), ch => ch.charCodeAt(0));
    const exif = [0xFF, 0xE1, 0x00, 0x22, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0x4D, 0x4D, 0x00, 0x2A, 0x00, 0x00, 0x00, 0x08, 0x00, 0x01, 0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    const file = new Uint8Array(2 + exif.length + base.length - 2);
    file.set([0xFF, 0xD8]); file.set(exif, 2); file.set(base.subarray(2), 2 + exif.length);
    const letto = window.__bgn.leggiOrientamento(new DataView(file.buffer));
    const senza = window.__bgn.leggiOrientamento(new DataView(base.buffer));
    const rotto = window.__bgn.leggiOrientamento(new DataView(file.buffer.slice(0, 20)));
    /* come su un Chrome vecchio: la foto arriva coricata e la gira l'app */
    const g = window.__bgn.disegna(c, letto, 1440, 0.9), t = g.tela.getContext('2d');
    const su = t.getImageData(10, 5, 1, 1).data, giu = t.getImageData(10, 35, 1, 1).data;
    /* come su questo Chrome: la gira il browser, e l'app non la gira una seconda volta */
    const fatte = await window.__bgn.riduciFoto(new File([file], 'foto.jpg', { type: 'image/jpeg' }));
    return { letto, senza, rotto, girata: [g.larghezza, g.altezza], su: [su[0], su[2]], giu: [giu[0], giu[2]], intera: [fatte[0].larghezza, fatte[0].altezza], piccola: [fatte[1].larghezza, fatte[1].altezza] };
  });
  verifica('foto: l’indicazione "va girata" viene letta dal file (e un file senza indicazione, o tronco, resta com’è)', foto.letto === 6 && foto.senza === 1 && foto.rotto === 1, JSON.stringify(foto));
  verifica('foto in verticale su un Chrome vecchio: l’app la raddrizza (da 40×20 coricata a 20×40 in piedi, il lato giusto in alto)', foto.girata.join('x') === '20x40' && foto.su[0] > 150 && foto.su[1] < 90 && foto.giu[1] > 150 && foto.giu[0] < 90, JSON.stringify(foto));
  verifica('foto in verticale su un Chrome recente: resta in piedi, senza essere girata due volte', foto.intera.join('x') === '20x40' && foto.piccola.join('x') === '20x40', JSON.stringify(foto));
  await spente.close();

  /* notifiche attive su Android. Il permesso viene chiesto alla maniera dei Chrome vecchi:
     la risposta arriva a una funzione, non a una promessa. */
  const accese = await browser.newContext(android);
  await accese.addInitScript(isc => {
    Object.defineProperty(Notification, 'permission', { get: () => 'granted' });
    Notification.requestPermission = function (risposta) { setTimeout(() => risposta('granted'), 20); };
    PushManager.prototype.getSubscription = () => Promise.resolve({ endpoint: isc.endpoint, toJSON: () => isc });
  }, iscrizione);
  const aa = await accese.newPage();
  aa.on('pageerror', e => errori.push('app (Android, notifiche attive): ' + e.message));
  await entra(aa);
  await apri(aa, 'impostazioni');
  await aa.waitForSelector('[data-notifiche]');
  const attive = (await aa.locator('[data-notifiche]').innerText()).replace(/\s+/g, ' ');
  verifica('Android con le notifiche attive: lo dice, con "Manda una notifica di prova" e il link "Non arrivano, o arrivano tardi?"', /Le notifiche sono attive/.test(attive) && (await aa.locator('[data-attiva-notifiche]').innerText()).trim() === 'Manda una notifica di prova' &&
    (await aa.locator('[data-notifiche] a[href="/gestione/installa#notifiche"]').innerText()).trim() === 'Non arrivano, o arrivano tardi?', attive);
  await leggibile(aa, 'Android 360px · Impostazioni con le notifiche attive', 360);
  await aa.screenshot({ path: path.join(OUT, 'app-android-notifiche-attive.png'), fullPage: true });
  notifiche.length = 0;
  await aa.locator('[data-attiva-notifiche]').click();
  await aa.locator('[data-fatto]:not([hidden])').waitFor({ timeout: 10000 });
  const dettoFatto = (await aa.locator('[data-fatto]').innerText()).replace(/\s+/g, ' ');
  for (let i = 0; i < 20 && !notifiche.length; i++) await attendi(250);
  verifica('"Manda una notifica di prova" (permesso chiesto alla maniera dei Chrome vecchi): la notifica arriva al telefono', /Te ne ho mandata una di prova/.test(dettoFatto) && notifiche.length === 1 && !!notifiche[0].titolo && !notifiche[0].errore, dettoFatto + ' ' + JSON.stringify(notifiche));
  await aa.locator('[data-notifiche] a[href="/gestione/installa#notifiche"]').click();
  await aa.waitForURL('**/gestione/installa#notifiche');
  await aa.waitForTimeout(300);
  verifica('il link porta all’aiuto, sulla scheda Android', await aa.locator('[data-pannello="android"]').isVisible() && await aa.evaluate(() => { const t = document.getElementById('notifiche').getBoundingClientRect().top; return t >= 60 && t <= 200; }));
  await accese.close();

  /* Chrome troppo vecchio per le notifiche (o un altro browser): lo dice, e resta l'email */
  const vecchio = await browser.newContext(android);
  await vecchio.addInitScript(() => { delete window.PushManager; try { delete Object.getPrototypeOf(window).PushManager; } catch (e) {} });
  const av = await vecchio.newPage();
  av.on('pageerror', e => errori.push('app (Android vecchio): ' + e.message));
  await entra(av);
  await av.waitForSelector('[data-notifiche]');
  const daAggiornare = (await av.locator('[data-notifiche]').innerText()).replace(/\s+/g, ' ');
  verifica('Android con Chrome troppo vecchio: "serve Chrome aggiornato", il pulsante per l’aiuto, e intanto le richieste arrivano per email', /Per le notifiche serve Chrome aggiornato/.test(daAggiornare) && /Play Store/.test(daAggiornare) && /arrivano per email/.test(daAggiornare) &&
    await av.locator('[data-notifiche] a.g-btn[href="/gestione/installa#notifiche"]').count() === 1, daAggiornare);
  await av.screenshot({ path: path.join(OUT, 'app-android-chrome-vecchio.png'), fullPage: true });
  await leggibile(av, 'Android 360px · Oggi con Chrome da aggiornare', 360);
  await vecchio.close();

  verifica('nessun errore JavaScript durante tutta la prova', errori.length === 0, errori.join(' | '));
  await browser.close(); finto.close();
  const no2 = esiti.filter(x => !x.ok);
  console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - no2.length) + ' ok, ' + no2.length + ' non passati');
  no2.forEach(x => console.log('  NON PASSATO: ' + x.nome));
  process.exit(no2.length ? 1 : 0);
})().catch(e => { console.error('ERRORE DELLA PROVA:', e); process.exit(2); });
