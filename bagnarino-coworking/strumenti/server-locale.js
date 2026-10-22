/* =============================================================
   BAGNARINO COWORKING — server locale per provare tutto
   Avvio:  npm run locale   →  http://localhost:3000
   Serve il sito e le API come su Vercel, con un database
   Postgres in memoria (PGlite): niente da installare né da
   configurare. Si azzera a ogni riavvio. Le email non partono.
   Password dell'area riservata in locale: "prova" (titolare) e
   "apex-prova" (Apex Media), oppure ADMIN_PASSWORD / APEX_PASSWORD.
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

const TIPI = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain' };

(async () => {
  const pg = new PGlite();
  require('../api/_db').impostaAdattatore({
    query: (t, v) => pg.query(t, v || []).then(r => r.rows),
    transazione: (lavoro) => pg.transaction(tx => lavoro((t, v) => tx.query(t, v || []).then(r => r.rows)))
  });
  const vercel = JSON.parse(fs.readFileSync(path.join(RADICE, 'vercel.json'), 'utf8'));

  http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let percorso = url.pathname;
    (vercel.rewrites || []).forEach(r => { if (r.source === percorso) { const d = new URL(r.destination, 'http://localhost'); percorso = d.pathname; d.searchParams.forEach((v, k) => url.searchParams.set(k, v)); } });

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
    /* file statici con URL "puliti" come su Vercel */
    let f = path.join(RADICE, decodeURIComponent(percorso));
    if (!f.startsWith(RADICE)) { res.statusCode = 403; res.end(); return; }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
    if (!fs.existsSync(f)) { res.statusCode = 404; f = path.join(RADICE, '404.html'); }
    const tipo = TIPI[path.extname(f)] || 'application/octet-stream';
    res.setHeader('Content-Type', tipo);
    /* compressione come su Vercel, per misurare le prestazioni in modo realistico */
    if (/text|javascript|json|svg|xml/.test(tipo) && /gzip/.test(req.headers['accept-encoding'] || '')) {
      res.setHeader('Content-Encoding', 'gzip');
      fs.createReadStream(f).pipe(require('zlib').createGzip()).pipe(res);
    } else fs.createReadStream(f).pipe(res);
  }).listen(PORTA, () => console.log('Bagnarino Coworking in locale: http://localhost:' + PORTA + '  (area riservata: password "' + process.env.ADMIN_PASSWORD + '")'));
})();
