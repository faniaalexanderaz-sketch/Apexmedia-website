/* =============================================================
   ARABESQUE BUSALLA — iscrizione newsletter + codice benvenuto
   ============================================================= */
const { sql, assicuraSchema } = require('./_db');
const { inviaEmail } = require('./_email');

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Metodo non consentito' }); return; }
  var body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  var email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_OK.test(email)) { res.status(400).json({ error: 'Email non valida' }); return; }

  try {
    await assicuraSchema();
    await sql`INSERT INTO iscritti (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING`;
  } catch (err) { console.error('newsletter', err.message); }

  inviaEmail({
    to: email,
    subject: 'Il tuo −10% da Arabesque',
    html: '<div style="background:#0B0B0C;padding:30px;font-family:Arial,sans-serif">' +
      '<div style="max-width:520px;margin:auto;background:#F3EFE7;border-radius:14px;padding:30px;text-align:center">' +
      '<div style="font:500 22px Georgia,serif;letter-spacing:6px;color:#15151A">ARABESQUE</div>' +
      '<p style="font:15px Arial;color:#4A4A52;margin:20px 0">Ecco il tuo sconto di benvenuto sul primo ordine:</p>' +
      '<p style="font:600 26px Georgia,serif;color:#15151A;letter-spacing:4px;border:1px dashed #C8A96A;border-radius:8px;padding:14px">BENVENUTO10</p>' +
      '<p style="font:13px Arial;color:#7A7A80;margin-top:18px">Inseriscilo nel carrello. Ti scriviamo solo per arrivi e saldi.</p>' +
      '</div></div>'
  }).catch(function () {});

  res.status(200).json({ ok: true });
};
