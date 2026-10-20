/* =============================================================
   BAGNARINO COWORKING — Meta Conversions API (lato server)
   Manda a Meta la prenotazione vera, così le sponsorizzate
   imparano dalle conversioni reali anche quando il browser blocca
   il Pixel. Deduplicata con il Pixel tramite event_id.
   Parte SOLO se: META_PIXEL_ID e META_CAPI_TOKEN sono impostati,
   e il cliente ha accettato i cookie di misurazione sul sito.
   I dati personali partono solo cifrati (SHA-256), come chiede Meta.
   ============================================================= */
const crypto = require('crypto');
const sha = v => crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex');

function cookie(req, nome) {
  const m = String(req.headers.cookie || '').match(new RegExp('(?:^|; )' + nome + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}

async function inviaConversione(req, p, eventId) {
  const pixel = process.env.META_PIXEL_ID, token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token || !p || p.finto) return false;
  if (!(req.body && (req.body.consenso_misurazione === true || (typeof req.body === 'string' && /"consenso_misurazione":true/.test(req.body))))) return false;
  const tel = String(p.telefono || '').replace(/\D/g, '').replace(/^(?!39)(3\d{8,9})$/, '39$1');
  const evento = {
    event_name: 'Schedule',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId || p.codice,
    action_source: 'website',
    event_source_url: req.headers.referer || undefined,
    user_data: {
      em: [sha(p.email)], ph: [sha(tel)], fn: [sha(p.nome)], ln: [sha(p.cognome)],
      ct: [sha('alessandria')], country: [sha('it')],
      client_ip_address: String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || undefined,
      client_user_agent: req.headers['user-agent'],
      fbp: cookie(req, '_fbp'), fbc: cookie(req, '_fbc')
    },
    custom_data: { currency: 'EUR', value: p.prezzo / 100, content_name: p.nomePacchetto, content_ids: [p.pacchetto] }
  };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch('https://graph.facebook.com/v21.0/' + pixel + '/events?access_token=' + encodeURIComponent(token), {
      method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [evento], test_event_code: process.env.META_TEST_CODE || undefined })
    });
    clearTimeout(t);
    if (!r.ok) console.error('[bagnarino] Meta CAPI', r.status);
    return r.ok;
  } catch (e) { console.error('[bagnarino] Meta CAPI', e.message); return false; }
}
module.exports = { inviaConversione };
