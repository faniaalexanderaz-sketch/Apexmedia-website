/* =============================================================
   BAGNARINO COWORKING — email per far tornare i clienti
   Partono dal giro serale di /api/cron (compito=promemoria),
   una volta sola ciascuna:
   1. grazie:   la sera della PRIMA visita (arrivo segnato), con la Card
   2. ciManchi: 21 giorni dopo l'ultima visita, senza prenotazioni
                future; SOLO a chi ha dato il consenso alle email
                promozionali, con il link per disiscriversi
   3. carnet:   ingressi ancora da usare e scadenza entro 14 giorni
   4. rinnovo:  abbonamento mensile che finisce entro 5 giorni,
                senza un mese successivo già prenotato
   ============================================================= */
const crypto = require('crypto');
const { q } = require('./_db');
const cal = require('./_calendario');
const T = require('./_email-template');
const { pacchetto } = require('./_impostazioni');

const GIORNI_ASSENZA = 21, GIORNI_CARNET = 14, GIORNI_RINNOVO = 5;

function firma(id) {
  return crypto.createHmac('sha256', process.env.CRON_SECRET || 'bagnarino').update('disiscrivi:' + id).digest('hex').slice(0, 24);
}
function linkDisiscrivi(sito, id) { return sito + '/api/cliente?azione=disiscrivi&id=' + id + '&t=' + firma(id); }
function firmaValida(id, t) {
  const a = Buffer.from(firma(id)), b = Buffer.from(String(t || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* invia: function({ to, subject, html }) → { inviata } */
async function inviaFidelizzazione(cfg, sito, invia, adesso) {
  const oggi = cal.oraRoma(adesso).data;
  const esito = { grazie: 0, ciManchi: 0, carnet: 0, rinnovo: 0 };

  /* 1. grazie dopo la prima visita (solo visite degli ultimi 2 giorni) */
  const prime = await q(
    `SELECT p.id, p.codice, c.id AS cliente_id, c.nome, c.email, COALESCE(f.timbri, 0) AS timbri
     FROM prenotazioni p JOIN clienti c ON c.id = p.cliente_id LEFT JOIN fidelity f ON f.cliente_id = c.id
     WHERE p.stato = 'presente' AND NOT p.grazie_inviato AND p.pacchetto IN ('giornata', 'carnet')
       AND p.data_inizio BETWEEN $1::date - 2 AND $1::date
       AND NOT EXISTS (SELECT 1 FROM prenotazioni p2 WHERE p2.cliente_id = p.cliente_id AND p2.stato = 'presente'
                       AND (p2.data_inizio < p.data_inizio OR (p2.data_inizio = p.data_inizio AND p2.id < p.id)))`, [oggi]);
  for (const c of prime) {
    const m = T.grazieVisita(c, cfg, sito);
    const e = await invia({ to: c.email, subject: m.oggetto, html: m.html });
    if (e.inviata) { esito.grazie++; await q('UPDATE prenotazioni SET grazie_inviato = true WHERE id = $1', [c.id]); }
  }

  /* 2. ci manchi: ultima visita tra 21 e 60 giorni fa, nessuna prenotazione da oggi in poi */
  const assenti = await q(
    `SELECT c.id, c.nome, c.email, COALESCE(f.timbri, 0) AS timbri, MAX(o.data) AS ultima
     FROM clienti c JOIN prenotazioni p ON p.cliente_id = c.id AND p.stato = 'presente'
     JOIN occupazioni o ON o.prenotazione_id = p.id LEFT JOIN fidelity f ON f.cliente_id = c.id
     WHERE c.consenso_marketing
       AND NOT EXISTS (SELECT 1 FROM prenotazioni p3 WHERE p3.cliente_id = c.id AND p3.stato <> 'annullata' AND p3.data_fine >= $1)
     GROUP BY c.id, c.nome, c.email, f.timbri, c.ultimo_richiamo
     HAVING MAX(o.data) BETWEEN $1::date - 60 AND $1::date - ${GIORNI_ASSENZA}
        AND (c.ultimo_richiamo IS NULL OR c.ultimo_richiamo < MAX(o.data))`, [oggi]);
  for (const c of assenti) {
    const m = T.ciManchi(c, cfg, sito, linkDisiscrivi(sito, c.id));
    const e = await invia({ to: c.email, subject: m.oggetto, html: m.html });
    if (e.inviata) { esito.ciManchi++; await q('UPDATE clienti SET ultimo_richiamo = $2 WHERE id = $1', [c.id, oggi]); }
  }

  /* 3. carnet con ingressi da usare che scade entro 14 giorni */
  const carnet = await q(
    `SELECT k.id, to_char(k.scadenza, 'YYYY-MM-DD') AS scadenza, (k.ingressi_totali - k.ingressi_usati) AS residui, c.nome, c.email
     FROM carnet k JOIN clienti c ON c.id = k.cliente_id
     WHERE NOT k.avviso_scadenza AND k.ingressi_totali - k.ingressi_usati > 0
       AND k.scadenza BETWEEN $1::date AND $1::date + ${GIORNI_CARNET}`, [oggi]);
  for (const k of carnet) {
    const m = T.carnetInScadenza(k, cfg, sito);
    const e = await invia({ to: k.email, subject: m.oggetto, html: m.html });
    if (e.inviata) { esito.carnet++; await q('UPDATE carnet SET avviso_scadenza = true WHERE id = $1', [k.id]); }
  }

  /* 4. mese che finisce entro 5 giorni, senza un mese dopo già prenotato */
  const mesi = await q(
    `SELECT p.id, p.pacchetto, to_char(p.data_fine, 'YYYY-MM-DD') AS data_fine, c.nome, c.email
     FROM prenotazioni p JOIN clienti c ON c.id = p.cliente_id
     WHERE p.pacchetto LIKE 'mese%' AND p.stato <> 'annullata' AND NOT p.avviso_rinnovo
       AND p.data_fine BETWEEN $1::date AND $1::date + ${GIORNI_RINNOVO}
       AND NOT EXISTS (SELECT 1 FROM prenotazioni p2 WHERE p2.cliente_id = p.cliente_id AND p2.id <> p.id
                       AND p2.pacchetto LIKE 'mese%' AND p2.stato <> 'annullata' AND p2.data_inizio > p.data_fine)`, [oggi]);
  for (const p of mesi) {
    const pk = pacchetto(cfg, p.pacchetto);
    p.nomePacchetto = pk ? pk.nome : p.pacchetto;
    p.rinnovoDa = cal.aggiungiGiorni(p.data_fine, 1);
    const m = T.rinnovoMese(p, cfg, sito);
    const e = await invia({ to: p.email, subject: m.oggetto, html: m.html });
    if (e.inviata) { esito.rinnovo++; await q('UPDATE prenotazioni SET avviso_rinnovo = true WHERE id = $1', [p.id]); }
  }
  return esito;
}

/* link "non voglio più ricevere queste email" */
async function disiscrivi(id, t) {
  id = parseInt(id, 10);
  if (!Number.isInteger(id) || !firmaValida(id, t)) return false;
  await q('UPDATE clienti SET consenso_marketing = false WHERE id = $1', [id]);
  return true;
}

module.exports = { inviaFidelizzazione, disiscrivi, linkDisiscrivi, GIORNI_ASSENZA };
