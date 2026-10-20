/* =============================================================
   BAGNARINO COWORKING — avvisi alla titolare
   Sempre via email (NOTIFICHE_EMAIL). Predisposti e SPENTI:
   - Telegram: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
   - WhatsApp Business (Cloud API): NOTIFICHE_WHATSAPP=1 +
     WHATSAPP_TOKEN + WHATSAPP_PHONE_ID + WHATSAPP_TO
   Basta impostare le variabili su Vercel per accenderli.
   ============================================================= */
const { inviaEmail } = require('./_email');

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

async function avvisaTitolare({ oggetto, html, testo }) {
  const destinatario = process.env.NOTIFICHE_EMAIL;
  const esiti = await Promise.allSettled([
    destinatario ? inviaEmail({ to: destinatario, subject: oggetto, html }) : Promise.resolve({ inviata: false }),
    telegram(testo || oggetto),
    whatsapp(testo || oggetto)
  ]);
  return esiti.map(e => e.status === 'fulfilled' ? e.value : null);
}
module.exports = { avvisaTitolare, telegram, whatsapp };
