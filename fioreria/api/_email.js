/* =============================================================
   ANTICA FIORERIA DEL CENTRO — invio email (SendGrid)
   Un unico punto da cui tutte le funzioni mandano email. Se
   SENDGRID_API_KEY non è configurata, non fa nulla (nessun errore):
   così il sito continua a funzionare anche prima di collegare
   l'email.

   SendGrid richiede solo la verifica di un "Single Sender" (un
   indirizzo email confermato con un click, senza record DNS) —
   niente dominio da verificare. Configurazione su Vercel:
     SENDGRID_API_KEY = la chiave creata in SendGrid (Settings →
       API Keys, permesso "Mail Send")
     SENDGRID_FROM = l'indirizzo verificato in Settings → Sender
       Authentication → Single Sender, es. "info@anticafioreriadelcentro.it"
     SENDGRID_FROM_NOME (opzionale) = nome mittente mostrato,
       es. "Antica Fioreria del Centro" (default se assente)
   ============================================================= */
async function inviaEmail({ to, subject, html }) {
  // le variabili d'ambiente incollate da telefono a volte portano dentro
  // uno spazio o un ritorno a capo di troppo (es. copiando da Note): una
  // chiave con un carattere così dentro manda in errore la richiesta HTTP
  // ("invalid header value") senza che si capisca perché — la ripuliamo qui.
  var apiKey = (process.env.SENDGRID_API_KEY || '').replace(/\s+/g, '');
  var mittente = (process.env.SENDGRID_FROM || '').replace(/[\r\n]+/g, '').trim();
  var nomeMittente = (process.env.SENDGRID_FROM_NOME || 'Antica Fioreria del Centro').replace(/[\r\n]+/g, '').trim();
  if (!apiKey || !mittente || !to) return { inviata: false };

  try {
    var risposta = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: mittente, name: nomeMittente },
        subject: subject,
        content: [{ type: 'text/html', value: html }]
      })
    });
    if (!risposta.ok) {
      var testo = await risposta.text();
      console.error('SendGrid errore:', risposta.status, testo);
      return { inviata: false };
    }
    return { inviata: true };
  } catch (err) {
    console.error('SendGrid errore:', err.message);
    return { inviata: false };
  }
}

module.exports = { inviaEmail };
