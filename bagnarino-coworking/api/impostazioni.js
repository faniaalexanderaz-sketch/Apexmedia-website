/* GET /api/impostazioni — le modifiche fatte dall'area riservata e
   dall'app di gestione (prezzi, avviso, foto, telefono), come piccolo script che aggiorna
   BGN_CONFIG prima che main.js disegni la pagina.
   Senza database o senza modifiche: script vuoto.
   In cache 30 secondi sulla rete di Vercel e mai nel browser: ciò che
   la titolare cambia dall'app (avviso, foto, telefono) è sul sito in
   meno di un minuto, senza pubblicare di nuovo. */
const { modifiche, fondi } = require('./_impostazioni');

module.exports = async (req, res) => {
  let m = {};
  try { m = await modifiche(); } catch (e) { m = {}; }
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30');
  if (!m || !Object.keys(m).length) { res.end('/* nessuna modifica */\n'); return; }
  /* lo stesso algoritmo di fusione del server, eseguito nel browser */
  res.end('(function(){if(!window.BGN_CONFIG)return;var fondi=' + fondi.toString() + ';fondi(window.BGN_CONFIG,' +
    JSON.stringify(m).replace(/</g, '\\u003c') + ');})();\n');
};
