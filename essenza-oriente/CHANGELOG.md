# Essenza d'Oriente — Changelog

## Redesign 2026 (ottobre 2026)

Obiettivo: più prenotazioni, look nuovo con la stessa identità, meno elementi, zero "effetto template".

### Prenotazione
- **Nuovo flusso nativo in 3 passi** (trattamento → giorno e fascia → conferma), in bottom-sheet su mobile e pannello laterale su desktop. Si apre da qualsiasi bottone "Prenota" (header, listino, barra mobile, pagine trattamento).
- Conferma su **Treatwell** (nuova scheda) o su **WhatsApp** con messaggio precompilato (trattamento, prezzo, giorno, fascia). Telefono sempre a portata.
- Il trattamento è **preselezionato** quando si arriva da una card del listino o da una pagina trattamento: si parte dal passo 2.
- "Oggi" e le fasce orarie già passate si disattivano da sole in base all'ora.
- **Rimosso l'iframe Treatwell** dalla pagina (schermo bianco, trattamento da ricercare due volte). Senza JavaScript i bottoni portano comunque a Treatwell.
- Deep link per servizio: campo `treatwell` in `script.js` (array `TRATTAMENTI`), oggi `null` → menu generico + suggerimento "cerca: …". Da compilare con gli URL del pannello Treatwell.

### Look
- **2 font** invece di 6: Fraunces (titoli, prezzi) e Jost (testo, bottoni). Rimossi Cormorant Garamond, Lato, Italiana, Instrument Serif.
- Palette invariata (salvia, bosco, oro) più bianco caldo `#F7F7F2` come superficie principale. Sezioni alternate piatte, niente macchie radiali, gradienti lucidi, bordi oro, loti decorativi, sigilli.
- **Bottoni nuovi**: primario pieno verde bosco, secondario outline, WhatsApp outline con icona verde. Un solo primario per schermata.
- **Meno immagini**: una foto vera nell'hero (sala trattamenti), listino senza foto, una foto per pagina trattamento. Il banner generato con testo dentro resta solo come immagine di anteprima social (`og:image`).
- Firma cinese 东方之心养生馆 in footer come unica decorazione d'identità.

### Movimento
- **Rimossi GSAP, SplitText, ScrollTrigger e `animazioni.js`** (132 KB). Contenuto visibile al 100% anche senza JavaScript.
- Un solo fade di 300 ms al primo ingresso di ogni sezione (IntersectionObserver), hover sulle card, header compatto allo scroll, sheet con easing morbido. Tutto disattivato con `prefers-reduced-motion`.

### Struttura home
Header → Hero → Listino (8 card, un prezzo ciascuna) → Perché noi (3 righe) → Recensioni (3, testo intero) → Dove siamo → FAQ (4) → Prenota → Footer.
Altezza desktop ~4.700 px (prima 7.000+).

### Pagine trattamento
- Template rigenerato (`node genera-trattamenti.js`): breadcrumb, H1 invariato, prezzo e durata in evidenza, CTA con trattamento preselezionato, box prezzo sticky su desktop, trattamenti correlati, sezione prenota.
- **Corretti i link del menu** (puntavano a `../nome.html`, 404). Rimossi slider a una sola foto e testo "[FOTO TRATTAMENTO DA INSERIRE]".

### Pulizia incoerenze
- Rimossa l'offerta "Pulizia Orecchie 20 €" scaduta il 10/10 (restava visibile nel listino con prezzo diverso dall'hero). Prezzo unico: 25 €.
- Pagine Privacy e Cookie allineate al nuovo header/footer, senza menu laterale.

### Invariato (SEO e tracking)
- Title, meta description, H1 di tutte le pagine, schema.org, canonical, sitemap, robots.
- GA4 `G-5XJQW3HMLL`, Google Ads `AW-17997395114`, GTM via consenso, Consent Mode, banner cookie.
- Eventi dataLayer: `click_chiama`, `click_whatsapp` (invariati); nuovi `prenota_apri`, `prenota_passo`, `click_treatwell` (sostituisce `click_widget_prenotazione`, che non ha più senso senza iframe). Da aggiornare l'evento di conversione in Google Ads.

### Performance
- CSS 21 KB (prima 87 KB), JS 17 KB (prima 41 KB + 132 KB GSAP). Nessuna libreria esterna.
- Foto in WebP (25–45 KB) con fallback JPG, hero con `fetchpriority="high"`, font precaricati.

### Da fare quando arrivano le foto reali
- Sostituire `foto/sfondo-prenota.jpg/.webp` (hero) e `foto/tratt-*.jpg/.webp` (pagine trattamento) mantenendo gli stessi nomi: nessuna modifica al codice.
- Rigenerare i WebP (stesso comando usato qui: PIL, qualità 78, larghezza max 1400 px).
