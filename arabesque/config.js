/* =============================================================
   ARABESQUE BUSALLA — dati del negozio in un punto solo.

   REGOLA: un campo che il cliente non ha ancora confermato resta
   VUOTO ('').  Il sito non mostra mai un dato inventato: nasconde
   l'elemento che lo conterrebbe (numero, bottone "Chiama", icona
   Instagram, riga della P. IVA nel piè di pagina).  Appena scrivi
   il dato vero, l'elemento ricompare da solo — nessun'altra
   modifica da fare.

   Ogni pagina li legge tramite gli attributi data-cfg="..." (testo),
   data-cfg-tel / -wa / -map / -ig / -fb (link) e data-cfg-blocco
   (il pezzo di pagina che sparisce se il dato manca).
   ============================================================= */
var ARB_CONFIG = {
  nome: 'Arabesque',
  insegna: 'Arabesque Abbigliamento',
  indirizzo: 'Via Vittorio Veneto 154',
  cap: '16012',
  citta: 'Busalla',
  provincia: 'GE',

  /* --- TODO-CLIENTE: da compilare, finché sono vuoti non si vedono --- */
  telefonoVisibile: '010 964 0827',
  telefono: '+390109640827',
  whatsapp: '',            /* TODO-CLIENTE: numero WhatsApp del negozio, es. '393401234567' */
  email: 'arabesque@arabesqueabbigliamento.it',
  piva: '03095960104',
  instagram: 'https://www.instagram.com/arabesque.busalla',
  /* ------------------------------------------------------------------ */

  facebook: 'https://www.facebook.com/Arabesque.Busalla/',
  mappa: 'https://maps.google.com/?q=Via+Vittorio+Veneto+154+Busalla+GE',

  /* le recensioni compaiono sul sito solo quando ce ne sono di vere:
     metti true dopo aver inserito i testi reali nella home (TODO-CLIENTE) */
  recensioniAttive: false,

  /* misurazione: si attivano da sole quando i codici sono inseriti
     e solo dopo il consenso ai cookie di statistica (TODO-CLIENTE) */
  ga4: '',            /* es. 'G-XXXXXXXXXX' */
  metaPixel: '',      /* es. '123456789012345' */

  orari: [
    { giorni: 'Lunedì', ore: 'Chiuso' },
    { giorni: 'Martedì – Sabato', ore: '9:00 – 12:30 · 15:30 – 19:30' },
    { giorni: 'Domenica', ore: 'Chiuso' }
  ]
};

/* Marcatura immediata, prima del primo disegno (questo file sta nella
   testa del documento apposta): un elemento legato a un dato mancante
   non viene mai disegnato, invece di comparire e sparire un istante
   dopo. È la differenza tra CLS 0 e una pagina che "balla" al
   caricamento. Quando il dato arriva, la classe non si applica e
   l'elemento c'è dal primo fotogramma. */
(function () {
  var d = document.documentElement;
  ['telefono', 'whatsapp', 'email', 'piva', 'instagram'].forEach(function (campo) {
    if (!ARB_CONFIG[campo]) d.classList.add('senza-' + campo);
  });
})();
