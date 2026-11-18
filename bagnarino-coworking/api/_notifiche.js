/* =============================================================
   BAGNARINO COWORKING — avvisi alla titolare
   - email: sempre, all'indirizzo NOTIFICATION_EMAIL
   - notifica sul telefono (Web Push): se l'avviso ha la parte "push"
     e la titolare ha attivato le notifiche nell'app di gestione
   Predisposti e SPENTI:
   - Telegram: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
   - WhatsApp Business (Cloud API): NOTIFICHE_WHATSAPP=1 +
     WHATSAPP_TOKEN + WHATSAPP_PHONE_ID + WHATSAPP_TO
   Basta impostare le variabili su Vercel per accenderli.
   ============================================================= */
const { inviaEmail, emailTitolare } = require('./_email');
const { inviaPush } = require('./_push');

async function conTimeout(promessa, ms) {
  return Promise.race([promessa, new Promise(r => setTimeout(() => r(null), ms))]);
}

async function telegram(testo) {
  const tok = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!tok || !chat) return false;
  try {
    const r = await conTimeout(fetch('https://api.telegram.org/bot' + tok + '/sendMessage', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: testo, disable_web_page_preview: true })
    }), 5000);
    return !!(r && r.ok);
  } catch (e) { return false; }
}
async function whatsapp(testo) {
  if (process.env.NOTIFICHE_WHATSAPP !== '1') return false;
  const tok = process.env.WHATSAPP_TOKEN, id = process.env.WHATSAPP_PHONE_ID, a = process.env.WHATSAPP_TO;
  if (!tok || !id || !a) return false;
  try {
    const r = await conTimeout(fetch('https://graph.facebook.com/v21.0/' + id + '/messages', {
      method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: a, type: 'text', text: { body: testo } })
    }), 5000);
    return !!(r && r.ok);
  } catch (e) { return false; }
}

/* push: { titolo, corpo, url, tag } (facoltativo) */
async function avvisaTitolare({ oggetto, html, testo, push }) {
  const destinatario = emailTitolare();
  const esiti = await Promise.allSettled([
    destinatario ? inviaEmail({ to: destinatario, subject: oggetto, html, testo }) : Promise.resolve({ inviata: false }),
    telegram(testo || oggetto),
    whatsapp(testo || oggetto),
    push ? inviaPush(push) : Promise.resolve({ telefoni: 0, inviate: 0 })
  ]);
  const v = esiti.map(e => e.status === 'fulfilled' ? e.value : null);
  return { email: v[0], telegram: v[1], whatsapp: v[2], push: v[3] };
}
module.exports = { avvisaTitolare, telegram, whatsapp };
