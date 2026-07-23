/* =============================================================
   ANTICA FIORERIA — area clienti (dati condivisi, localStorage)
   NOTA ONESTA: è un sistema completo lato dispositivo, perfetto
   per demo e per un negozio a gestione diretta. Per account
   sincronizzati tra dispositivi servirà un backend (es. Supabase);
   l'API qui sotto è già pronta per quel passaggio.
   ============================================================= */
var AFC = (function () {
  'use strict';

  var K_USERS = 'afc-users';
  var K_SESSION = 'afc-session';
  var K_NEWS = 'afc-newsletter';

  function leggi(k, fallback) {
    try { return JSON.parse(localStorage.getItem(k)) || fallback; }
    catch (e) { return fallback; }
  }
  function scrivi(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  /* hash non crittografico (demo): mai salvare password in chiaro.
     In produzione: bcrypt lato server. */
  function hash(str) {
    var h = 5381, i = str.length;
    while (i) h = (h * 33) ^ str.charCodeAt(--i);
    return 'h' + (h >>> 0).toString(36) + str.length;
  }

  function utenti() { return leggi(K_USERS, {}); }
  function salvaUtenti(u) { scrivi(K_USERS, u); }

  function normalizza(email) { return String(email || '').trim().toLowerCase(); }
  function emailValida(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }

  /* ---------- sessione ---------- */
  function utenteCorrente() {
    var email = leggi(K_SESSION, null);
    if (!email) return null;
    return utenti()[email] || null;
  }
  function aggiorna(user) {
    var u = utenti();
    u[user.email] = user;
    salvaUtenti(u);
  }

  /* ---------- registrazione / login ---------- */
  function registra(nome, email, password, consensi) {
    email = normalizza(email);
    if (!nome.trim()) return { errore: 'Inserisci il tuo nome.' };
    if (!emailValida(email)) return { errore: 'Controlla l’indirizzo email: manca qualcosa.' };
    if (password.length < 8) return { errore: 'La password deve avere almeno 8 caratteri.' };
    var u = utenti();
    if (u[email]) return { errore: 'Esiste già un account con questa email. Prova ad accedere.' };
    var user = {
      nome: nome.trim(),
      email: email,
      telefono: '',
      pass: hash(password),
      indirizzi: [],
      ordini: [],
      wishlist: [],
      coupon: [{ codice: 'BENVENUTO10', descrizione: '10% di benvenuto sul primo ordine', pct: 10, usato: false }],
      newsletter: !!consensi.newsletter,
      privacyMarketing: !!consensi.marketing,
      creato: new Date().toISOString()
    };
    u[email] = user;
    salvaUtenti(u);
    scrivi(K_SESSION, email);
    if (consensi.newsletter) iscriviNewsletter(email);
    return { user: user };
  }

  function accedi(email, password) {
    email = normalizza(email);
    var user = utenti()[email];
    if (!user || user.pass !== hash(password)) {
      return { errore: 'Email o password non corrette. Puoi recuperare la password qui sotto.' };
    }
    scrivi(K_SESSION, email);
    return { user: user };
  }

  function esci() { localStorage.removeItem(K_SESSION); }

  /* ---------- recupero password (demo: codice mostrato a schermo;
     in produzione il codice viaggia via email) ---------- */
  function generaReset(email) {
    email = normalizza(email);
    var user = utenti()[email];
    if (!user) return { errore: 'Nessun account trovato con questa email.' };
    var codice = String(Math.floor(100000 + Math.random() * 900000));
    user._reset = hash(codice);
    aggiorna(user);
    return { codice: codice };
  }
  function resetPassword(email, codice, nuova) {
    email = normalizza(email);
    var user = utenti()[email];
    if (!user || !user._reset || user._reset !== hash(codice)) {
      return { errore: 'Codice non valido. Controlla e riprova.' };
    }
    if (nuova.length < 8) return { errore: 'La nuova password deve avere almeno 8 caratteri.' };
    user.pass = hash(nuova);
    delete user._reset;
    aggiorna(user);
    scrivi(K_SESSION, email);
    return { user: user };
  }

  /* ---------- wishlist ---------- */
  function inWishlist(nome) {
    var u = utenteCorrente();
    return !!(u && u.wishlist.indexOf(nome) !== -1);
  }
  function toggleWishlist(nome) {
    var u = utenteCorrente();
    if (!u) return { richiedeLogin: true };
    var i = u.wishlist.indexOf(nome);
    if (i === -1) u.wishlist.push(nome); else u.wishlist.splice(i, 1);
    aggiorna(u);
    return { salvato: i === -1 };
  }

  /* ---------- coupon ---------- */
  function couponValido(codice) {
    var u = utenteCorrente();
    if (!u) return null;
    codice = String(codice || '').trim().toUpperCase();
    for (var i = 0; i < u.coupon.length; i++) {
      if (u.coupon[i].codice === codice && !u.coupon[i].usato) return u.coupon[i];
    }
    return null;
  }
  function segnaCouponUsato(codice) {
    var u = utenteCorrente();
    if (!u) return;
    u.coupon.forEach(function (c) { if (c.codice === codice) c.usato = true; });
    aggiorna(u);
  }

  /* ---------- ordini ---------- */
  function registraOrdine(ordine) {
    var u = utenteCorrente();
    if (!u) return false;
    u.ordini.unshift(ordine);
    aggiorna(u);
    return true;
  }

  /* ---------- newsletter (anche senza account) ---------- */
  function iscriviNewsletter(email) {
    email = normalizza(email);
    if (!emailValida(email)) return { errore: 'Controlla l’indirizzo email.' };
    var lista = leggi(K_NEWS, []);
    if (lista.indexOf(email) === -1) { lista.push(email); scrivi(K_NEWS, lista); }
    var all = utenti();
    if (all[email]) { all[email].newsletter = true; salvaUtenti(all); }
    return { ok: true };
  }
  function disiscriviNewsletter(email) {
    email = normalizza(email);
    var lista = leggi(K_NEWS, []).filter(function (e) { return e !== email; });
    scrivi(K_NEWS, lista);
    var all = utenti();
    if (all[email]) { all[email].newsletter = false; salvaUtenti(all); }
  }
  function newsletterIscritto(email) {
    return leggi(K_NEWS, []).indexOf(normalizza(email)) !== -1;
  }

  return {
    utenteCorrente: utenteCorrente,
    aggiorna: aggiorna,
    registra: registra,
    accedi: accedi,
    esci: esci,
    generaReset: generaReset,
    resetPassword: resetPassword,
    inWishlist: inWishlist,
    toggleWishlist: toggleWishlist,
    couponValido: couponValido,
    segnaCouponUsato: segnaCouponUsato,
    registraOrdine: registraOrdine,
    iscriviNewsletter: iscriviNewsletter,
    disiscriviNewsletter: disiscriviNewsletter,
    newsletterIscritto: newsletterIscritto,
    emailValida: emailValida
  };
})();
