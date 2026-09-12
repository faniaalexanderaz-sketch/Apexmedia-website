/* =============================================================
   ARABESQUE BUSALLA — invio email (SendGrid)
   Se SENDGRID_API_KEY non è configurata non fa nulla e non genera
   errori: il sito funziona anche prima di collegare l'email.
   Variabili su Vercel:
     SENDGRID_API_KEY, SENDGRID_FROM (mittente verificato),
     SENDGRID_FROM_NOME (facoltativo)
   ============================================================= */
async function inviaEmail({ to, subject, html }) {
  var apiKey = (process.env.SENDGRID_API_KEY || '').replace(/\s+/g, '');
  var mittente = (process.env.SENDGRID_FROM || '').replace(/[\r\n]+/g, '').trim();
  var nome = (process.env.SENDGRID_FROM_NOME || 'Arabesque Busalla').replace(/[\r\n]+/g, '').trim();
  if (!apiKey || !mittente || !to) return { inviata: false };
  try {
    var r = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: mittente, name: nome },
        subject: subject,
        content: [{ type: 'text/html', value: html }]
      })
    });
    if (!r.ok) { console.error('SendGrid', r.status, await r.text()); return { inviata: false }; }
    return { inviata: true };
  } catch (e) {
    console.error('SendGrid', e.message);
    return { inviata: false };
  }
}
module.exports = { inviaEmail };
