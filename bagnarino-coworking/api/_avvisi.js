/* =============================================================
   BAGNARINO COWORKING — chi viene avvisato, quando e come
   Un solo posto per tutti gli avvisi legati a una richiesta:
   li usano il sito, l'app di gestione, i link nelle email, la
   vecchia area riservata e i promemoria automatici.
   - richiesta():  al cliente "richiesta ricevuta"; alla titolare
                   email con i due pulsanti + notifica sul telefono
   - esito():      al cliente la risposta giusta (confermata, non
                   disponibile, annullata con scuse, annullata da lui)
   - solleciti():  alla titolare, per le richieste in attesa da più
                   di due ore (una volta sola per richiesta)
   ============================================================= */
const { q } = require('./_db');
const { inviaEmail } = require('./_email');
const { avvisaTitolare } = require('./_notifiche');
const { creaIcs } = require('./_ics');
const T = require('./_email-template');
const token = require('./_token');
const cal = require('./_calendario');
const P = require('./_prenotazioni');

const GIORNI_LINK = 7;          /* quanto valgono i pulsanti nelle email alla titolare */
const ORE_ATTESA = 2;           /* dopo quante ore parte il promemoria */
const SOLLECITI_DALLE = 8, SOLLECITI_ALLE = 21;   /* di notte il telefono non suona */

function emailVera(e) { return e && !/\.invalid$/.test(e); }

/* i due link firmati della richiesta: valgono finché è in attesa */
function linkRisposta(p, sito, adesso) {
  const durata = GIORNI_LINK * 24 * 60 * 60;
  const si = token.firma({ a: 'conferma', id: p.id }, durata, adesso);
  const no = token.firma({ a: 'non_disponibile', id: p.id }, durata, adesso);
  if (!si || !no) return null;
  return { conferma: sito + '/gestione/risposta?t=' + si, no: sito + '/gestione/risposta?t=' + no };
}
function pushRichiesta(p, titolo) {
  return { titolo, corpo: p.nome + ' ' + p.cognome + ', ' + T.quando(p), url: '/gestione?richiesta=' + p.id, tag: 'richiesta-' + p.id };
}

/* nuova richiesta dal sito */
async function richiesta(p, cfg, sito) {
  const cliente = T.richiestaRicevuta(p, cfg, sito);
  const titolare = T.titolareNuova(p, cfg, sito, linkRisposta(p, sito));
  const [email, avviso] = await Promise.all([
    emailVera(p.email) ? inviaEmail({ to: p.email, subject: cliente.oggetto, html: cliente.html, testo: cliente.testo }) : { inviata: false },
    avvisaTitolare({
      oggetto: titolare.oggetto, html: titolare.html,
      testo: 'Nuova richiesta: ' + p.nome + ' ' + p.cognome + ', ' + T.quando(p) + ', tel ' + p.telefono,
      push: pushRichiesta(p, 'Nuova richiesta')
    })
  ]);
  return { email, avviso };
}

/* p: prenotazione dopo la risposta o l'annullamento (stato e motivo aggiornati) */
async function esito(p, cfg, sito) {
  if (p.stato === 'annullata' && p.motivo_annullamento === 'cliente') {
    const cli = T.annullataCliente(p, cfg, sito), tit = T.titolareAnnullata(p, cfg, sito);
    const r = await Promise.all([
      emailVera(p.email) ? inviaEmail({ to: p.email, subject: cli.oggetto, html: cli.html }) : { inviata: false },
      avvisaTitolare({ oggetto: tit.oggetto, html: tit.html, testo: 'Annullata dal cliente: ' + p.nome + ' ' + p.cognome + ', ' + T.quando(p),
        push: { titolo: 'Annullata dal cliente', corpo: p.nome + ' ' + p.cognome + ', ' + T.quando(p), url: '/gestione#prenotazioni', tag: 'annullata-' + p.id } })
    ]);
    return r[0];
  }
  if (!emailVera(p.email)) return { inviata: false };
  if (p.stato === 'confermata') {
    const m = T.prenotazioneConfermata(p, cfg, sito);
    return inviaEmail({ to: p.email, subject: m.oggetto, html: m.html, testo: m.testo,
      allegati: [{ nome: 'prenotazione-' + p.codice + '.ics', tipo: 'text/calendar', contenuto: creaIcs(p, cfg) }] });
  }
  if (p.stato === 'annullata') {
    const m = p.motivo_annullamento === 'non_disponibile' ? T.nonDisponibile(p, cfg, sito) : T.annullataConScuse(p, cfg, sito);
    return inviaEmail({ to: p.email, subject: m.oggetto, html: m.html, testo: m.testo });
  }
  return { inviata: false };
}

/* Promemoria alla titolare per le richieste ferme da più di due ore.
   Chi lo chiama (un timer esterno) può farlo quante volte vuole:
   ogni richiesta viene sollecitata una volta sola. */
async function solleciti(cfg, sito, adesso) {
  const ora = cal.oraRoma(adesso);
  if (ora.minuti < SOLLECITI_DALLE * 60 || ora.minuti >= SOLLECITI_ALLE * 60) return { fuoriOrario: true, sollecitate: 0 };
  const limite = new Date((adesso ? +adesso : Date.now()) - ORE_ATTESA * 60 * 60 * 1000).toISOString();
  const lista = await q(
    `SELECT id FROM prenotazioni WHERE stato = 'in_attesa' AND NOT sollecito_inviato AND creato_il < $1::timestamptz AND data_fine >= $2
     ORDER BY creato_il LIMIT 20`, [limite, ora.data]);
  let sollecitate = 0;
  for (const r of lista) {
    /* prima si segna, poi si avvisa: due timer insieme non mandano due promemoria */
    const mio = await q("UPDATE prenotazioni SET sollecito_inviato = true WHERE id = $1 AND stato = 'in_attesa' AND NOT sollecito_inviato RETURNING id", [r.id]);
    if (!mio.length) continue;
    const p = P.completa(await P.leggi(r.id), cfg);
    const m = T.titolareSollecito(p, cfg, sito, linkRisposta(p, sito, adesso));
    await avvisaTitolare({
      oggetto: m.oggetto, html: m.html,
      testo: 'Aspetta la tua risposta: ' + p.nome + ' ' + p.cognome + ', ' + T.quando(p),
      push: pushRichiesta(p, 'Una richiesta aspetta la tua risposta')
    });
    sollecitate++;
  }
  return { sollecitate };
}

module.exports = { richiesta, esito, solleciti, linkRisposta, ORE_ATTESA };
