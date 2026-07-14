/* =============================================================
   ANTICA FIORERIA DEL CENTRO — accesso al pannello interno
   ============================================================= */
const { impostaCookieSessione } = require('./_admin');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo non consentito' });
    return;
  }
  if (!process.env.ADMIN_PASSWORD) {
    res.status(501).json({ error: 'Pannello non ancora configurato' });
    return;
  }

  var body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  if (String(body.password || '') !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Password errata' });
    return;
  }

  impostaCookieSessione(res);
  res.status(200).json({ ok: true });
};
