/* =============================================================
   ANTICA FIORERIA DEL CENTRO — invio email (Resend)
   Un unico punto da cui tutte le funzioni mandano email. Se
   RESEND_API_KEY non è configurata, non fa nulla (nessun errore):
   così il sito continua a funzionare anche prima di collegare
   l'email. RESEND_FROM è l'indirizzo mittente, es.
   "Antica Fioreria del Centro <info@anticafioreriadelcentro.it>"
   — finché il dominio non è verificato su Resend, usa il loro
   indirizzo di prova (onboarding@resend.dev).
   ============================================================= */
async function inviaEmail({ to, subject, html }) {
  var apiKey = process.env.RESEND_API_KEY;
  var mittente = process.env.RESEND_FROM || 'Antica Fioreria del Centro <onboarding@resend.dev>';
  if (!apiKey || !to) return { inviata: false };

  try {
    var risposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: mittente, to: [to], subject: subject, html: html })
    });
    if (!risposta.ok) {
      var testo = await risposta.text();
      console.error('Resend errore:', risposta.status, testo);
      return { inviata: false };
    }
    return { inviata: true };
  } catch (err) {
    console.error('Resend errore:', err.message);
    return { inviata: false };
  }
}

module.exports = { inviaEmail };
