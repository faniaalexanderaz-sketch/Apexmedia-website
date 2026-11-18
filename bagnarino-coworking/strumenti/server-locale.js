/* =============================================================
   BAGNARINO COWORKING — server locale per provare tutto
   Avvio:  npm run locale   →  http://localhost:3000
   Serve il sito e le API come su Vercel (stesse regole di
   vercel.json), con un database Postgres in memoria (PGlite):
   niente da installare né da configurare. Si azzera a ogni riavvio.

   Le email NON partono: vengono catturate e si leggono su
   http://localhost:3000/__posta (solo qui, in locale).

   App di gestione: http://localhost:3000/gestione
     titolare:   email info@bagnarino.it, password "prova"
     Apex Media: email studio@infoapex.eu, password "apex-prova"
       (in più aggiorna i numeri di social, Google e pubblicità)
   La vecchia area riservata /admin non esiste più: rimanda all'app.
   ============================================================= */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { PGlite } = require('@electric-sql/pglite');

const RADICE = path.join(__dirname, '..');
const PORTA = +process.env.PORT || 3000;
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'prova';
process.env.APEX_PASSWORD = process.env.APEX_PASSWORD || 'apex-prova';
process.env.CRON_SECRET = process.env.CRON_SECRET || 'locale';
process.env.NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'info@bagnarino.it';
process.env.LINK_SECRET = process.env.LINK_SECRET || 'segreto-solo-locale';
process.env.PUSH_PROVA = '1';
if (!process.env.VAPID_PUBLIC_KEY) {
  const chiavi = require('web-push').generateVAPIDKeys();
  process.env.VAPID_PUBLIC_KEY = chiavi.publicKey;
  process.env.VAPID_PRIVATE_KEY = chiavi.privateKey;
}

const TIPI = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon', '.webp': 'image/webp', '.jpg': 'image/jpeg' };

/* una regola di vercel.json ("/gestione/:pagina") come espressione regolare */
function regola(r) {
  const nomi = [];
  const re = new RegExp('^' + r.source.replace(/[.+*?^${}()|[\]\\]/g, '\\$&').replace(/:(\w+)/g, (_, n) => { nomi.push(n); return '([^/]+)'; }) + '$');
  return { re, nomi, destinazione: r.destination };
}

(async () => {
  const pg = new PGlite();
  require('../api/_db').impostaAdattatore({
    query: (t, v) => pg.query(t, v || []).then(r => r.rows),
    transazione: (lavoro) => pg.transaction(tx => lavoro((t, v) => tx.query(t, v || []).then(r => r.rows)))
  });
  const vercel = JSON.parse(fs.readFileSync(path.join(RADICE, 'vercel.json'), 'utf8'));
  const regole = (vercel.rewrites || []).map(regola);
  const rimandi = (vercel.redirects || []).map(r => Object.assign(regola(r), { fisso: !!r.permanent }));

  /* le email catturate, dalla più recente */
  const posta = [];
  require('../api/_email').impostaTrasporto(m => {
    posta.unshift({ quando: new Date().toISOString(), a: m.to, oggetto: m.subject, rispondiA: m.rispondiA || null,
      allegati: (m.allegati || []).map(a => a.nome), html: m.html, testo: m.testo || null });
  });

  http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let percorso = url.pathname;

    /* solo in locale: le email "inviate" e un aiuto per provare il promemoria */
    if (percorso === '/__posta') {
      if (url.searchParams.get('svuota')) posta.length = 0;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(posta));
      return;
    }
    if (percorso === '/__invecchia') {
      /* fa sembrare arrivate tre ore fa le richieste in attesa */
      await pg.query("UPDATE prenotazioni SET creato_il = now() - interval '3 hours' WHERE stato = 'in_attesa'");
      res.end('ok');
      return;
    }

    /* i rimandi di vercel.json (per esempio /admin → /gestione) vengono prima di tutto */
    const rimando = rimandi.find(r => r.re.test(percorso));
    if (rimando) { res.statusCode = rimando.fisso ? 308 : 307; res.setHeader('Location', rimando.destinazione); res.end(); return; }

    /* file statici con URL "puliti" come su Vercel: vengono prima delle riscritture */
    let f = path.join(RADICE, decodeURIComponent(percorso));
    if (!f.startsWith(RADICE)) { res.statusCode = 403; res.end(); return; }
    const esisteFile = () => fs.existsSync(f) && fs.statSync(f).isFile();
    if (!percorso.startsWith('/api/')) {
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (!esisteFile() && fs.existsSync(f + '.html')) f += '.html';
    }
    const funzione = p => fs.existsSync(path.join(RADICE, 'api', p.slice(5).replace(/[^a-z0-9-]/gi, '') + '.js'));
    if (percorso.startsWith('/api/') ? !funzione(percorso) : !esisteFile()) {
      for (const r of regole) {
        const m = r.re.exec(percorso);
        if (!m) continue;
        let dest = r.destinazione;
        r.nomi.forEach((n, i) => { dest = dest.replace(':' + n, encodeURIComponent(m[i + 1])); });
        const d = new URL(dest, 'http://localhost');
        percorso = d.pathname;
        d.searchParams.forEach((v, k) => url.searchParams.set(k, v));
        break;
      }
    }

    /* API: stessa interfaccia delle funzioni Vercel */
    if (percorso.startsWith('/api/')) {
      const file = path.join(RADICE, 'api', percorso.slice(5).replace(/[^a-z0-9-]/gi, '') + '.js');
      if (!fs.existsSync(file)) { res.statusCode = 404; res.end('{}'); return; }
      let corpo = '';
      for await (const pezzo of req) corpo += pezzo;
      req.query = Object.fromEntries(url.searchParams);
      try { req.body = corpo ? JSON.parse(corpo) : {}; } catch (e) { req.body = corpo; }
      res.status = c => { res.statusCode = c; return res; };
      res.json = o => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
      req.headers['x-forwarded-for'] = req.socket.remoteAddress;
      try { await require(file)(req, res); } catch (e) { console.error(e); res.statusCode = 500; res.end('{}'); }
      return;
    }
    if (!esisteFile()) { res.statusCode = 404; f = path.join(RADICE, '404.html'); }
    const tipo = TIPI[path.extname(f)] || 'application/octet-stream';
    res.setHeader('Content-Type', tipo);
    /* compressione come su Vercel, per misurare le prestazioni in modo realistico */
    if (/text|javascript|json|svg|xml/.test(tipo) && /gzip/.test(req.headers['accept-encoding'] || '')) {
      res.setHeader('Content-Encoding', 'gzip');
      fs.createReadStream(f).pipe(require('zlib').createGzip()).pipe(res);
    } else fs.createReadStream(f).pipe(res);
  }).listen(PORTA, () => console.log('Bagnarino Coworking in locale: http://localhost:' + PORTA +
    '\n  app di gestione: /gestione (email ' + process.env.NOTIFICATION_EMAIL + ', password "' + process.env.ADMIN_PASSWORD + '")' +
    '\n  email catturate: /__posta'));
})();
