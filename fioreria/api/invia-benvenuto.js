/* =============================================================
   ANTICA FIORERIA DEL CENTRO — email di benvenuto con BENVENUTO10
   Chiamata dal sito quando qualcuno si iscrive dal popup newsletter
   o crea un account. Non blocca mai il flusso del sito: se manca
   SENDGRID_API_KEY o qualcosa va storto, risponde comunque 200.
   ============================================================= */
const { inviaEmail } = require('./_email');

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo non consentito' });
    return;
  }

  var body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  var email = String(body.email || '').trim();
  if (!EMAIL_OK.test(email)) {
    res.status(400).json({ error: 'Email non valida' });
    return;
  }

  try {
    await inviaEmail({
      to: email,
      subject: 'Il tuo 10% di benvenuto — Antica Fioreria del Centro',
      html: emailBenvenuto()
    });
  } catch (err) {
    console.error('Invio email benvenuto fallito:', err.message);
  }

  res.status(200).json({ ok: true });
};

function emailBenvenuto() {
  return '' +
    '<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#FAFAF7;">' +
    '  <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#9CAF94;margin:0 0 6px;">Benvenuta in bottega</p>' +
    '  <h1 style="font-size:26px;color:#24352B;margin:0 0 18px;">Il tuo 10% è pronto</h1>' +
    '  <p style="font-size:15px;line-height:1.6;color:#5A6B5E;margin:0 0 24px;">Grazie per esserti iscritta alla newsletter della bottega. Usa questo codice sul tuo primo ordine, quando vuoi:</p>' +
    '  <p style="text-align:center;margin:0 0 26px;">' +
    '    <span style="display:inline-block;background:#2E4B3A;color:#FAFAF7;font-size:20px;font-weight:bold;letter-spacing:.06em;padding:14px 28px;border-radius:999px;">BENVENUTO10</span>' +
    '  </p>' +
    '  <p style="font-size:14px;line-height:1.6;color:#5A6B5E;margin:0 0 26px;">Applicalo nel carrello prima di pagare (serve un account gratuito, che puoi creare in un minuto).</p>' +
    '  <p style="font-size:13px;line-height:1.6;color:#5A6B5E;margin:0;"><a href="https://anticafioreria.vercel.app/collezione.html" style="color:#2E4B3A;">Sfoglia la collezione →</a></p>' +
    '  <p style="font-size:13px;color:#9CAF94;margin:26px 0 0;">Antica Fioreria del Centro · dal 1953</p>' +
    '</div>';
}
