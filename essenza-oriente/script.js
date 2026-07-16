/* =============================================================
   ESSENZA D'ORIENTE — interazioni e tracciamento conversioni
   =============================================================

   EVENTI DATALAYER (da importare in GA4 e poi in Google Ads
   come conversioni):

   | Evento                    | Significato                                | Uso                          |
   |---------------------------|--------------------------------------------|------------------------------|
   | click_chiama              | Click su un bottone/link tel:              | GA4 -> Google Ads conversione |
   | click_whatsapp            | Click su un bottone/link wa.me             | GA4 -> Google Ads conversione |
   | click_widget_prenotazione | Click DENTRO il widget Treatwell (proxy)   | GA4 -> Google Ads conversione |

   Il terzo evento è un "proxy di intenzione": Treatwell non
   comunica al sito le prenotazioni completate, quindi tracciamo
   il primo click dentro l'iframe come segnale forte di interesse.
   ============================================================= */
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];

  /* ---------- click_chiama + click_whatsapp ----------
     Delegato sul documento: copre anche bottoni ripetuti
     (header, barra mobile, sezione prenotazione, contatti). */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) {
      window.dataLayer.push({ event: 'click_chiama' });
    } else if (href.indexOf('https://wa.me/') === 0 || href.indexOf('wa.me/') === 0) {
      window.dataLayer.push({ event: 'click_whatsapp' });
    }
  });

  /* ---------- click_widget_prenotazione: il "blur trick" ----------
     PERCHÉ ESISTE QUESTO WORKAROUND: il widget Treatwell è un
     iframe cross-origin — il browser NON ci lascia ascoltare i
     click al suo interno. Però, quando l'utente clicca dentro un
     iframe, la finestra principale perde il focus (evento "blur")
     e document.activeElement diventa l'iframe stesso. Combinando
     le due cose otteniamo un segnale affidabile di "ha interagito
     col widget di prenotazione". Non è un tracciamento perfetto
     (non sappiamo se ha COMPLETATO la prenotazione), è un proxy
     di intenzione forte — documentato anche nella tabella sopra.
     Il flag `widgetGiaTracciato` evita eventi duplicati nella
     stessa sessione di pagina. */
  var widgetGiaTracciato = false;
  window.addEventListener('blur', function () {
    if (widgetGiaTracciato) return;
    var attivo = document.activeElement;
    if (attivo && attivo.tagName === 'IFRAME' &&
        (attivo.closest('#wahanda-online-booking-widget-iframe') ||
         (attivo.src || '').indexOf('treatwell') !== -1)) {
      widgetGiaTracciato = true;
      window.dataLayer.push({ event: 'click_widget_prenotazione' });
    }
  });
})();
