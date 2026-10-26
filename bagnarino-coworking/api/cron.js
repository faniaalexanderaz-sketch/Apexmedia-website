/* =============================================================
   GET /api/cron?compito=promemoria|riepilogo|report
   Avviato da Vercel Cron (vercel.json). Protetto da CRON_SECRET:
   Vercel lo manda da solo nell'intestazione Authorization.
   - promemoria: email ai clienti che arrivano domani (sera prima),
                 più le email per farli tornare (_fidelizzazione.js)
   - riepilogo:  alla titolare, chi arriva domani
   - report:     report mensile (giorno 1) — vedi _report.js
   ============================================================= */
const { q, disponibile } = require('./_db');
const { impostazioni, pacchetto } = require('./_impostazioni');
const { inviaEmail } = require('./_email');
const { avvisaTitolare } = require('./_notifiche');
const cal = require('./_calendario');
const T = require('./_email-template');
const { json, errore, sitoUrl } = require('./_http');
const { euro } = require('./_prenotazioni');

async function arriviDel(data, cfg) {
  const r = await q(
    `SELECT DISTINCT p.id, p.codice, p.pacchetto, to_char(p.data_inizio, 'YYYY-MM-DD') AS data_inizio,
            to_char(p.data_fine, 'YYYY-MM-DD') AS data_fine, p.prezzo_centesimi, p.promemoria_inviato,
            c.nome, c.cognome, c.email, c.telefono
     FROM occupazioni o JOIN prenotazioni p ON p.id = o.prenotazione_id JOIN clienti c ON c.id = p.cliente_id
     WHERE o.data = $1 AND p.stato IN ('confermata','presente') ORDER BY c.cognome`, [data]);
  return r.map(p => {
    const pk = pacchetto(cfg, p.pacchetto);
    return Object.assign(p, { nomePacchetto: pk ? pk.nome : p.pacchetto, prezzo: p.prezzo_centesimi,
      prezzoTesto: euro(p.prezzo_centesimi), scadenzaDisdetta: cal.scadenzaDisdetta(p.data_inizio, cfg) });
  });
}

module.exports = async (req, res) => {
  if (!process.env.CRON_SECRET) { json(res, 501, { errore: 'CRON_SPENTO' }); return; }
  if (req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) { json(res, 401, { errore: 'NON_AUTORIZZATO' }); return; }
  if (!disponibile()) { json(res, 501, { errore: 'DB_ASSENTE' }); return; }
  try {
    const cfg = await impostazioni(), sito = sitoUrl(req);
    const domani = cal.aggiungiGiorni(cal.oraRoma().data, 1);
    const compito = req.query.compito;

    if (compito === 'promemoria') {
      /* solo a chi inizia domani (non ogni giorno agli abbonati del mese) */
      const lista = (await arriviDel(domani, cfg)).filter(p => p.data_inizio === domani && !p.promemoria_inviato);
      let inviate = 0;
      for (const p of lista) {
        const m = T.promemoria(p, cfg, sito);
        const e = await inviaEmail({ to: p.email, subject: m.oggetto, html: m.html, rispondiA: cfg.azienda.email });
        if (e.inviata) { inviate++; await q('UPDATE prenotazioni SET promemoria_inviato = true WHERE id = $1', [p.id]); }
      }
      /* nello stesso giro serale: grazie, ci manchi, carnet e mese in scadenza */
      const { inviaFidelizzazione } = require('./_fidelizzazione');
      const fid = await inviaFidelizzazione(cfg, sito, m => inviaEmail(Object.assign({ rispondiA: cfg.azienda.email }, m)));
      json(res, 200, { compito, domani, trovate: lista.length, inviate, fidelizzazione: fid });
      return;
    }
    if (compito === 'riepilogo') {
      if (!cal.aperto(domani, cfg, cfg.chiusureTutte)) { json(res, 200, { compito, domani, chiuso: true }); return; }
      const lista = await arriviDel(domani, cfg);
      const m = T.riepilogoSerale(lista, domani, cfg, sito);
      await avvisaTitolare({ oggetto: m.oggetto, html: m.html,
        testo: 'Domani: ' + (lista.map(p => p.nome + ' ' + p.cognome + ' (' + p.nomePacchetto + ')').join(', ') || 'nessuna prenotazione') });
      json(res, 200, { compito, domani, arrivi: lista.length });
      return;
    }
    if (compito === 'report') {
      const { inviaReportMensile } = require('./_report');
      json(res, 200, Object.assign({ compito }, await inviaReportMensile(cfg, sito)));
      return;
    }
    json(res, 400, { errore: 'COMPITO', messaggio: 'compito sconosciuto' });
  } catch (err) { errore(res, err); }
};
