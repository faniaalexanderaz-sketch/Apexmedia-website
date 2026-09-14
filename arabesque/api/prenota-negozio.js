/* =============================================================
   ARABESQUE BUSALLA — "te lo teniamo da parte"
   Il cliente prenota un capo per provarlo in negozio: registriamo
   la richiesta e avvisiamo il negozio via email.
   ============================================================= */
const { sql, assicuraSchema } = require('./_db');
const { inviaEmail } = require('./_email');
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Metodo non consentito' }); return; }
  var body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }

  var email = String(body.email || '').trim().toLowerCase();
  var slug = String(body.slug || '').slice(0, 40);
  if (!EMAIL_OK.test(email) || !slug) { res.status(400).json({ error: 'Dati non validi' }); return; }

  var dettaglio = [String(body.nome || slug).slice(0, 120), 'taglia ' + String(body.taglia || '').slice(0, 10), String(body.colore || '').slice(0, 40)]
    .filter(Boolean).join(' · ');

  try {
    await assicuraSchema();
    await sql`INSERT INTO prenotazioni (email, slug, dettaglio) VALUES (${email}, ${slug}, ${dettaglio})`;
  } catch (err) {
    if (err.codice === 'DB_ASSENTE') { res.status(501).json({ error: 'Prenotazioni non ancora attive' }); return; }
    console.error('prenota', err.message);
  }

  /* avviso al negozio, se l'email è configurata */
  if (process.env.SENDGRID_FROM) {
    inviaEmail({
      to: process.env.EMAIL_NEGOZIO || process.env.SENDGRID_FROM,
      subject: 'Nuova prenotazione in negozio — ' + dettaglio,
      html: '<p>Un cliente vuole provare in negozio:</p><p><b>' + dettaglio + '</b></p>' +
            '<p>Contatto: ' + email + '</p><p>Da tenere da parte 48 ore.</p>'
    }).catch(function () {});
  }
  inviaEmail({
    to: email,
    subject: 'Te lo teniamo da parte — Arabesque Busalla',
    html: '<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px">' +
      '<p style="font:500 20px Georgia,serif;letter-spacing:4px">ARABESQUE</p>' +
      '<p>Abbiamo messo da parte per te:</p><p><b>' + dettaglio + '</b></p>' +
      '<p>Ti aspettiamo in Via Vittorio Veneto 154 a Busalla. Lo teniamo 48 ore.</p></div>'
  }).catch(function () {});

  res.status(200).json({ ok: true });
};
