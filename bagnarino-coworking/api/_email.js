/* =============================================================
   BAGNARINO COWORKING — invio email (Resend oppure SendGrid)
   Senza chiave o mittente non invia nulla e non genera errori:
   la prenotazione viene salvata lo stesso.
   Variabili:
   - RESEND_API_KEY  → usa Resend (gratis fino a 3.000 email/mese)
   - SENDGRID_API_KEY → in alternativa usa SendGrid
   - EMAIL_FROM: indirizzo mittente su un dominio verificato
     (accetta anche il vecchio nome SENDGRID_FROM)
   - EMAIL_FROM_NOME: facoltativo, default "Bagnarino Coworking"
   ============================================================= */
function pulisci(v) { return (v || '').replace(/[\r\n]+/g, '').trim(); }

function corpoResend({ to, subject, html, testo, allegati, rispondiA }, mittente, nome) {
  const m = { from: nome + ' <' + mittente + '>', to: [to], subject: subject, html: html };
  if (testo) m.text = testo;
  if (rispondiA) m.reply_to = rispondiA;
  if (allegati && allegati.length) {
    m.attachments = allegati.map(a => ({
      filename: a.nome, content: Buffer.from(a.contenuto).toString('base64'), content_type: a.tipo
    }));
  }
  return m;
}

function corpoSendgrid({ to, subject, html, testo, allegati, rispondiA }, mittente, nome) {
  const m = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: mittente, name: nome },
    subject: subject,
    content: [].concat(testo ? [{ type: 'text/plain', value: testo }] : [], [{ type: 'text/html', value: html }])
  };
  if (rispondiA) m.reply_to = { email: rispondiA };
  if (allegati && allegati.length) {
    m.attachments = allegati.map(a => ({
      content: Buffer.from(a.contenuto).toString('base64'), filename: a.nome, type: a.tipo, disposition: 'attachment'
    }));
  }
  return m;
}

async function inviaEmail(email) {
  const resend = (process.env.RESEND_API_KEY || '').replace(/\s+/g, '');
  const sendgrid = (process.env.SENDGRID_API_KEY || '').replace(/\s+/g, '');
  const mittente = pulisci(process.env.EMAIL_FROM || process.env.SENDGRID_FROM);
  const nome = pulisci(process.env.EMAIL_FROM_NOME || process.env.SENDGRID_FROM_NOME) || 'Bagnarino Coworking';
  const chiave = resend || sendgrid;
  if (!chiave || !mittente || !email.to || /\.invalid$/.test(email.to)) return { inviata: false };

  const servizio = resend ? 'Resend' : 'SendGrid';
  const url = resend ? 'https://api.resend.com/emails' : 'https://api.sendgrid.com/v3/mail/send';
  const corpo = resend ? corpoResend(email, mittente, nome) : corpoSendgrid(email, mittente, nome);
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(url, {
      method: 'POST', signal: ctrl.signal,
      headers: { Authorization: 'Bearer ' + chiave, 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo)
    });
    clearTimeout(t);
    if (!r.ok) { console.error('[bagnarino] ' + servizio, r.status); return { inviata: false }; }
    return { inviata: true };
  } catch (e) {
    console.error('[bagnarino] ' + servizio, e.message);
    return { inviata: false };
  }
}
module.exports = { inviaEmail };
