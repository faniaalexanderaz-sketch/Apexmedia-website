# Essenza d'Oriente — Changelog

## Redesign 2026, versione 2 (ottobre 2026)

Linguaggio visivo Apex Media: carta calda, inchiostro verde profondo, hairline, etichette mono, display Fraunces con reveal a maschera, evidenziatore salvia, cornici doppie, nav a pillola flottante, footer con marchio gigante. Il widget Treatwell resta il canale di prenotazione.

### Prenotazione
- **Widget Treatwell reintegrato** (`widget.treatwell.it/salone/532986/menu/`) in home e nelle 8 pagine trattamento, dentro una cornice doppia, max 760 px, alto 560 px desktop / 520 px mobile. Sezione scura subito dopo il listino.
- Ogni "Prenota" porta al widget. Dalle righe del listino (o dalla pagina trattamento) il nome viaggia fino alla sezione: riga "Stai prenotando: Tuina Shiatsu · 50 min · 50 €" con "cambia trattamento", e messaggio WhatsApp già compilato.
- Il pannello di prenotazione "nativo" della versione 1 è stato **rimosso**: duplicava Treatwell.
- Tracking: `click_widget_prenotazione` ripristinato (blur trick sul primo click nell'iframe), `prenota_click` nuovo, `click_whatsapp` e `click_chiama` invariati.

### Look
- Due font: Fraunces (display, titoli, prezzi, numeri) e Jost (testo). Etichette in monospace di sistema.
- Palette: carta `#F4F2EC`, inchiostro `#142019`, salvia `#D6E6C0` come evidenziatore e superfici, oro `#B99A45` solo per filetti e stelle. Grana di carta al 3,5 %.
- Griglia di 12 hairline nelle sezioni principali, listino editoriale a righe (indice 01–08, nome, durata, prezzo, Prenota), numeri grandi (7 su 7, 5,0, 2 min), recensioni in bento a cornice doppia, mappa in cornice, FAQ con "+" che ruota, footer con marchio a tutta larghezza.
- Bottoni a pillola con icona in cerchio annidato. Nav a isola che si nasconde scendendo e riappare risalendo. Menu mobile a schermo intero con voci che salgono a scalare. Barra mobile a isola.
- Una foto vera nell'hero (sala trattamenti) con card "146 recensioni" e tag indirizzo sovrapposti. Una foto per pagina trattamento. Listino senza foto.

### Movimento (GSAP + SplitText + ScrollTrigger)
- Hero: righe del titolo che salgono da una maschera, evidenziatore che si disegna, foto che si apre dal basso, card che entra dopo; la foto segue il mouse su desktop.
- Titoli di sezione con reveal a maschera, blocchi con fade-up a gruppi, contatore 146, nastro dei trattamenti in loop, marchio del footer che sale.
- Niente lettere che ruotano, niente blur, niente rimbalzi. `prefers-reduced-motion` disattiva tutto; senza GSAP il contenuto è comunque visibile (fallback a 1,8 s e 2,2 s).

### Pagine trattamento
- Template rigenerato (`node genera-trattamenti.js`): breadcrumb, H1 invariato, prezzo grande, CTA, foto in cornice, tre blocchi di testo, box prezzo sticky, widget Treatwell con suggerimento "cerca: …", trattamenti correlati.
- Link del menu corretti (prima 404). Rimossi slider e placeholder "[FOTO DA INSERIRE]".

### Pulizia
- Offerta "Pulizia Orecchie 20 €" scaduta il 10/10 rimossa ovunque. Prezzo unico 25 €.
- Privacy e Cookie allineate a nav e footer nuovi.
- Font inutilizzati rimossi (Cormorant, Lato, Italiana, Instrument Serif).

### Invariato
- Title, meta, H1, schema.org, canonical, sitemap, robots, GA4 `G-5XJQW3HMLL`, Ads `AW-17997395114`, GTM via consenso, Consent Mode, banner cookie.

### Quando arrivano le foto reali
- Sostituire `foto/sfondo-prenota.jpg/.webp` (hero) e `foto/tratt-*.jpg/.webp` mantenendo i nomi. Rigenerare i WebP (PIL, qualità 78, max 1400 px).
