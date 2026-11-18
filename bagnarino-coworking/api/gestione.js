/* =============================================================
   BAGNARINO COWORKING — app di gestione della titolare (/gestione)
   Una sola funzione serve le pagine e le azioni dell'app.

   PAGINE (vercel.json: /gestione → ?pagina=app, /gestione/x → ?pagina=x)
     app        l'app: esce solo con una sessione valida, altrimenti
                il server rimanda all'accesso (non è "nascosta" dal
                browser: senza sessione la pagina non viene servita)
     accedi     accesso con email e password
     password   password dimenticata / nuova password (link via email)
     installa   istruzioni per mettere l'app sulla schermata Home
     risposta   arrivo dai pulsanti dell'email: Conferma / Non disponibile

   AZIONI (?azione=…, in JSON)
     senza sessione: accedi, recupero, nuova-password, risposta (link firmato)
     con sessione:   tutte le altre
   Qui dentro c'è anche tutto quello che prima stava nell'area
   riservata /admin: statistiche ("Come va"), clienti, incassi,
   prenotazioni aggiunte a mano, prezzi e posti. Due ruoli:
   "titolare" e "apex" (Apex Media); solo "apex" salva i numeri di
   social, Google e pubblicità del mese.
   Le azioni che cambiano qualcosa accettano solo POST con
   l'intestazione X-Bgn-App: un altro sito non può farle partire.
   ============================================================= */
const crypto = require('crypto');
const { q, disponibile } = require('./_db');
const { impostazioni } = require('./_impostazioni');
const A = require('./_accesso');
const G = require('./_gestione');
const C = require('./_conti');
const Cre = require('./_crescita');
const cal = require('./_calendario');
const P = require('./_prenotazioni');
const T = require('./_email-template');
const avvisi = require('./_avvisi');
const push = require('./_push');
const token = require('./_token');
const pagine = require('./_gestione-pagine');
const { corpo, ip, json, errore, sitoUrl } = require('./_http');

function html(res, stato, testo) {
  res.statusCode = stato;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.end(testo);
}
function vai(res, dove) {
  res.statusCode = 302;
  res.setHeader('Location', dove);
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}

/* massimo 10 tentativi l'ora per indirizzo su accesso e recupero password */
async function limite(req, cosa, massimo) {
  const imp = cosa + ':' + crypto.createHash('sha256').update(ip(req) + '::' + (process.env.CRON_SECRET || 'bgn')).digest('hex').slice(0, 24);
  const r = await q("SELECT COUNT(*)::int AS n FROM tentativi WHERE impronta = $1 AND creato_il > now() - interval '1 hour'", [imp]);
  if (r[0].n >= massimo) throw P.errore('TROPPI', 'Troppi tentativi. Riprova tra un’ora.');
  await q('INSERT INTO tentativi (impronta) VALUES ($1)', [imp]);
}

/* ---------- risposta dal link dell'email (senza accesso) ---------- */
const PAROLE = {
  confermata: 'è già confermata', in_attesa: 'è ancora in attesa', presente: 'è già confermata', assente: 'è già confermata',
  non_disponibile: 'ha già avuto la risposta “Non disponibile”', cliente: 'è stata ritirata dal cliente', titolare: 'è stata annullata'
};
async function rispostaDaLink(req, t) {
  const dati = token.leggi(t);
  if (!dati || !Number.isInteger(dati.id) || (dati.a !== 'conferma' && dati.a !== 'non_disponibile')) {
    return { ok: false, titolo: 'Questo pulsante non vale più', testo: 'È passato troppo tempo. Apri l’app per rispondere alla richiesta.' };
  }
  const cfg = await impostazioni();
  try {
    const p = await P.rispondi(dati.id, dati.a);
    await avvisi.esito(p, cfg, sitoUrl(req));
    return dati.a === 'conferma'
      ? { ok: true, titolo: 'Fatto', testo: 'Hai confermato ' + p.nome + ' ' + p.cognome + ', ' + T.quando(p) + '. Gli abbiamo mandato l’email di conferma.' }
      : { ok: true, titolo: 'Fatto', testo: 'Hai risposto “Non disponibile” a ' + p.nome + ' ' + p.cognome + ', ' + T.quando(p) + '. Gli abbiamo mandato il link per scegliere un altro momento.' };
  } catch (e) {
    if (e.codice === 'GIA_FATTO') {
      const x = e.extra || {};
      return { ok: false, titolo: 'Avevi già risposto', testo: 'Questa richiesta ' + (PAROLE[x.stato === 'annullata' ? (x.motivo || 'titolare') : x.stato] || 'ha già una risposta') + '. Non devi fare altro.' };
    }
    if (e.codice === 'NON_TROVATA') return { ok: false, titolo: 'Richiesta non trovata', testo: 'Questa richiesta non esiste più.' };
    throw e;
  }
}

/* ---------- pagine ---------- */
async function servePagina(req, res, nome) {
  if (nome === 'installa') { html(res, 200, pagine.installa()); return; }
  if (!disponibile()) { html(res, 503, pagine.messaggio('L’app non è ancora collegata', 'Il database non è ancora collegato. Scrivi ad Apex Media.')); return; }
  if (nome === 'risposta') { html(res, 200, pagine.risposta(String(req.query.t || ''))); return; }
  if (nome === 'password') {
    const t = String(req.query.t || '');
    html(res, 200, pagine.password(t, t ? !!(await A.recuperoValido(t)) : false));
    return;
  }
  const utente = await A.sessione(req, res);
  if (nome === 'accedi') {
    if (utente) { vai(res, '/gestione'); return; }
    html(res, 200, pagine.accedi());
    return;
  }
  /* l'app, e qualunque altro indirizzo sotto /gestione */
  if (!utente) {
    const richiesta = /^\d+$/.test(String(req.query.richiesta || '')) ? '?richiesta=' + req.query.richiesta : '';
    vai(res, '/gestione/accedi' + richiesta);
    return;
  }
  html(res, 200, pagine.app({ nome: utente.nome, ruolo: utente.ruolo, chiavePush: push.configurato() ? push.chiavePubblica() : '' }));
}

module.exports = async (req, res) => {
  const azione = req.query.azione;
  try {
    if (req.query.pagina && !azione) { await servePagina(req, res, String(req.query.pagina)); return; }
    if (!disponibile()) { json(res, 501, { errore: 'DB_ASSENTE', messaggio: 'Il database non è ancora collegato.' }); return; }

    const scrive = req.method === 'POST';
    if (req.method !== 'GET' && !scrive) { json(res, 405, { errore: 'METODO', messaggio: 'Metodo non consentito' }); return; }
    if (scrive && req.headers['x-bgn-app'] !== '1') { json(res, 403, { errore: 'ORIGINE', messaggio: 'Richiesta non valida.' }); return; }
    const b = scrive ? corpo(req) : {};

    /* ---- senza sessione ---- */
    if (scrive && azione === 'accedi') {
      await limite(req, 'gest', 10);
      await A.accedi(req, res, b.email, b.password);
      json(res, 200, { ok: true }); return;
    }
    if (scrive && azione === 'recupero') {
      await limite(req, 'recu', 5);
      await A.chiediRecupero(b.email, sitoUrl(req));
      json(res, 200, { ok: true }); return;
    }
    if (scrive && azione === 'nuova-password') {
      await limite(req, 'recu', 10);
      await A.nuovaPassword(req, res, b.token, b.password);
      json(res, 200, { ok: true }); return;
    }
    if (scrive && azione === 'risposta') { json(res, 200, await rispostaDaLink(req, b.t)); return; }

    /* ---- da qui in poi serve la sessione ---- */
    const utente = await A.sessione(req, res);
    if (!utente) { json(res, 401, { errore: 'NON_AUTORIZZATO', messaggio: 'Devi entrare di nuovo con email e password.' }); return; }
    if (scrive && azione === 'esci') { await A.chiudiSessione(req, res); json(res, 200, { ok: true }); return; }

    const cfg = await impostazioni(), sito = sitoUrl(req);
    if (!scrive) {
      if (azione === 'oggi') { json(res, 200, Object.assign(await G.oggi(cfg), { nome: utente.nome, ruolo: utente.ruolo, numeri: await C.numeriAdesso() })); return; }
      if (azione === 'chiusure') { json(res, 200, await G.chiusureInProgramma()); return; }
      if (azione === 'calendario') { json(res, 200, await G.calendario(req.query.mese, cfg)); return; }
      if (azione === 'giorno') { json(res, 200, await G.giorno(req.query.data, cfg)); return; }
      if (azione === 'prenotazioni') { json(res, 200, await G.prenotazioni(cfg)); return; }
      if (azione === 'prenotazione') { json(res, 200, await G.prenotazione(parseInt(req.query.id, 10), cfg)); return; }
      if (azione === 'sito') { json(res, 200, G.sito(cfg)); return; }
      /* Come va: il mese scelto (prenotazioni, incassi, clienti, canali, social, Google,
         pubblicità, ultimi 12 mesi) più i numeri di questo momento */
      if (azione === 'come-va') {
        json(res, 200, Object.assign(await Cre.crescita(req.query.mese), { adesso: await G.comeVa(), numeri: await C.numeriAdesso(), ruolo: utente.ruolo }));
        return;
      }
      if (azione === 'clienti') { json(res, 200, await C.clienti(req.query.cerca)); return; }
      if (azione === 'cliente') { json(res, 200, await C.cliente(parseInt(req.query.id, 10), cfg)); return; }
      if (azione === 'incassi') { json(res, 200, await C.incassi(req.query.periodo, req.query.da, cfg)); return; }
      if (azione === 'coworking') { json(res, 200, await C.coworking(cfg)); return; }
      /* l'elenco degli incassi da scaricare (si apre con Excel) */
      if (azione === 'elenco') {
        const da = cal.isoValida(req.query.da) ? req.query.da : C.primoDelMese(cal.oraRoma().data);
        const a = cal.isoValida(req.query.a) && req.query.a >= da ? req.query.a : cal.aggiungiGiorni(cal.aggiungiMesi(da, 1), -1);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="incassi-bagnarino-' + da + '_' + a + '.csv"');
        res.setHeader('Cache-Control', 'no-store');
        res.end(C.csv(await C.righeIncassi(da, a, cfg)));
        return;
      }
      json(res, 404, { errore: 'AZIONE', messaggio: 'Azione sconosciuta' }); return;
    }

    /* i numeri di social, Google e pubblicità li aggiorna solo Apex Media */
    if (azione === 'numeri-mese') {
      if (utente.ruolo !== 'apex') { json(res, 403, { errore: 'SOLO_APEX', messaggio: 'Questi numeri li aggiorna Apex Media.' }); return; }
      json(res, 200, await Cre.salvaMarketing(b)); return;
    }
    /* pagamento in sede: contanti, carta o bonifico */
    if (azione === 'pagato') { json(res, 200, await C.segnaPagato(parseInt(b.id, 10), b.pagato, b.metodo)); return; }
    /* prenotazione aggiunta a mano (chi telefona o passa di persona): è già confermata */
    if (azione === 'prenotazione-nuova') {
      const p = await P.prenota(b, { manuale: true });
      const conEmail = !!G.emailVera(p.email);
      if (conEmail) await avvisi.esito(p, cfg, sito);
      json(res, 200, { id: p.id, codice: p.codice, conEmail }); return;
    }
    if (azione === 'cliente-elimina') { json(res, 200, await P.eliminaCliente(parseInt(b.id, 10))); return; }
    /* prezzi, numero di posti, messaggi WhatsApp del sito */
    if (azione === 'coworking') { json(res, 200, await C.salvaCoworking(b, cfg)); return; }

    /* richieste: Conferma / Non disponibile */
    if (azione === 'rispondi') {
      const p = await P.rispondi(parseInt(b.id, 10), b.esito);
      await avvisi.esito(p, cfg, sito);
      json(res, 200, { id: p.id, stato: p.stato }); return;
    }
    /* annullare una prenotazione confermata: al cliente le scuse con il link */
    if (azione === 'annulla') {
      const p = await P.annullaDaAdmin(parseInt(b.id, 10));
      await avvisi.esito(p, cfg, sito);
      json(res, 200, { id: p.id, stato: 'annullata' }); return;
    }
    /* "È arrivata/o": vale il timbro della Bagnarino Card */
    if (azione === 'arrivo') {
      /* arrivato: true → è venuta/o; assente: true → non è venuta/o; arrivato: false → si rimette com'era */
      const r = await P.segnaPresenza(parseInt(b.id, 10), b.assente === true ? 'assente' : b.arrivato === false ? 'confermata' : 'presente');
      json(res, 200, { id: r.id, stato: r.stato, timbro: r.timbro, timbri: r.timbri, premio: r.premio, premioSbloccato: r.premioSbloccato }); return;
    }
    if (azione === 'chiudi') { json(res, 200, await G.chiudi(b.da, b.a, b.valore, cfg)); return; }
    if (azione === 'scuse') { json(res, 200, await G.mandaScuse(b.ids, cfg, sito)); return; }

    if (azione === 'avviso') { json(res, 200, await G.salvaAvviso(b)); return; }
    if (azione === 'contatti') { json(res, 200, await G.salvaContatti(b)); return; }
    if (azione === 'foto-aggiungi') { json(res, 200, await G.aggiungiFoto(b)); return; }
    if (azione === 'foto-togli') { json(res, 200, await G.togliFoto(b.id)); return; }
    if (azione === 'foto-ordine') { json(res, 200, await G.ordinaFoto(b.ids)); return; }

    if (azione === 'push-iscrivi') {
      if (!push.configurato()) { json(res, 501, { errore: 'PUSH_SPENTE', messaggio: 'Le notifiche non sono ancora configurate.' }); return; }
      const ok = await push.iscrivi(utente.id, b.iscrizione);
      if (!ok) throw P.errore('DATI', 'Non sono riuscita ad attivare le notifiche su questo telefono.');
      /* subito una notifica di prova, solo a questo telefono */
      const prova = b.prova === false ? null : await push.inviaPush(
        { titolo: 'Le notifiche funzionano', corpo: 'Da ora ti avviso qui a ogni nuova richiesta.', url: '/gestione', tag: 'prova' }, b.iscrizione.endpoint);
      json(res, 200, { ok: true, prova: prova ? prova.inviate === 1 : null }); return;
    }
    if (azione === 'push-togli') { await push.disiscrivi(b.endpoint); json(res, 200, { ok: true }); return; }

    json(res, 404, { errore: 'AZIONE', messaggio: 'Azione sconosciuta' });
  } catch (err) {
    if (err && (err.codice === 'PASSWORD' || err.codice === 'LINK_SCADUTO')) {
      json(res, err.codice === 'PASSWORD' ? 401 : 410, { errore: err.codice, messaggio: err.message }); return;
    }
    errore(res, err);
  }
};
