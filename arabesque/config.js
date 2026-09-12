/* =============================================================
   ARABESQUE BUSALLA — dati del negozio in un punto solo.
   Tutto ciò che è marcato TODO-CLIENTE va confermato dal cliente
   prima della pubblicazione: sono dati di contatto e legali, non
   vanno inventati. Ogni pagina li legge tramite gli attributi
   data-cfg="..." (testo) e data-cfg-tel / -wa / -map (link).
   ============================================================= */
var ARB_CONFIG = {
  nome: 'Arabesque',
  insegna: 'Arabesque Abbigliamento',
  indirizzo: 'Via Vittorio Veneto 154',
  cap: '16012',
  citta: 'Busalla',
  provincia: 'GE',
  telefonoVisibile: '010 000 0000',        /* TODO-CLIENTE */
  telefono: '+390100000000',               /* TODO-CLIENTE */
  whatsapp: '393000000000',                /* TODO-CLIENTE — solo cifre, con prefisso 39 */
  email: 'info@arabesque.example',         /* TODO-CLIENTE */
  piva: 'TODO-CLIENTE',                    /* TODO-CLIENTE — obbligatoria in footer */
  instagram: 'https://www.instagram.com/',             /* TODO-CLIENTE */
  facebook: 'https://www.facebook.com/Arabesque.Busalla/',
  mappa: 'https://maps.google.com/?q=Via+Vittorio+Veneto+154+Busalla+GE',
  orari: [
    { giorni: 'Lunedì', ore: 'Chiuso' },                      /* TODO-CLIENTE */
    { giorni: 'Martedì – Sabato', ore: '9:30 – 12:30 · 15:30 – 19:30' }, /* TODO-CLIENTE */
    { giorni: 'Domenica', ore: 'Chiuso' }                     /* TODO-CLIENTE */
  ]
};
