/* =============================================================
   BAGNARINO COWORKING — invio email (SendGrid)
   Senza SENDGRID_API_KEY / SENDGRID_FROM non invia nulla e non
   genera errori: la prenotazione viene salvata lo stesso.
   Variabili: SENDGRID_API_KEY, SENDGRID_FROM (mittente verificato),
   SENDGRID_FROM_NOME (facoltativo, default "Bagnarino Coworking").
   ============================================================= */
async function inviaEmail({ to, subject, html, testo, allegati, rispondiA }) {
  const chiave = (process.env.SENDGRID_API_KEY || '').replace(/\s+/g, '');
  const mittente = (process.env.SENDGRID_FROM || '').replace(/[\r\n]+/g, '').trim();
  const nome = (process.env.SENDGRID_FROM_NOME || 'Bagnarino Coworking').replace(/[\r\n]+/g, '').trim();
  if (!chiave || !mittente || !to || /\.invalid$/.test(to)) return { inviata: false };
  const messaggio = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: mittente, name: nome },
    subject: subject,
    content: [].concat(testo ? [{ type: 'text/plain', value: testo }] : [], [{ type: 'text/html', value: html }])
  };
  if (rispondiA) messaggio.reply_to = { email: rispondiA };
  if (allegati && allegati.length) {
    messaggio.attachments = allegati.map(a => ({
      content: Buffer.from(a.contenuto).toString('base64'), filename: a.nome, type: a.tipo, disposition: 'attachment'
    }));
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST', signal: ctrl.signal,
      headers: { Authorization: 'Bearer ' + chiave, 'Content-Type': 'application/json' },
      body: JSON.stringify(messaggio)
    });
    clearTimeout(t);
    if (!r.ok) { console.error('[bagnarino] SendGrid', r.status); return { inviata: false }; }
    return { inviata: true };
  } catch (e) {
    console.error('[bagnarino] SendGrid', e.message);
    return { inviata: false };
  }
}
module.exports = { inviaEmail };
