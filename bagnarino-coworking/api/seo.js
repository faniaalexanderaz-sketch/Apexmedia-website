/* =============================================================
   BAGNARINO COWORKING — sitemap.xml e robots.txt
   Il dominio non è scritto da nessuna parte: si legge da SITO_URL
   (variabile d'ambiente su Vercel). Finché manca si usa l'indirizzo
   di produzione che Vercel assegna al progetto.
   ============================================================= */
const PAGINE = [
  { percorso: '/', priorita: '1.0', frequenza: 'weekly' },
  { percorso: '/prenota', priorita: '0.9', frequenza: 'weekly' },
  { percorso: '/privacy', priorita: '0.2', frequenza: 'yearly' },
  { percorso: '/cookie', priorita: '0.2', frequenza: 'yearly' }
];

function sitoUrl(req) {
  if (process.env.SITO_URL) return process.env.SITO_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return 'https://' + (req.headers['x-forwarded-host'] || req.headers.host);
}

module.exports = (req, res) => {
  const base = sitoUrl(req);
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');

  if (req.query.file === 'robots') {
    /* le anteprime di Vercel non devono finire su Google */
    const produzione = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production';
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(produzione
      ? 'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nDisallow: /prenotazione\nDisallow: /card\n\nSitemap: ' + base + '/sitemap.xml\n'
      : 'User-agent: *\nDisallow: /\n');
    return;
  }

  const oggi = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.end('<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    PAGINE.map(p => '  <url><loc>' + base + p.percorso + '</loc><lastmod>' + oggi +
      '</lastmod><changefreq>' + p.frequenza + '</changefreq><priority>' + p.priorita + '</priority></url>').join('\n') +
    '\n</urlset>\n');
};
