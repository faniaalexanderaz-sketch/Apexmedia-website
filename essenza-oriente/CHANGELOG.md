# Essenza d'Oriente — sito nuovo (30 ottobre 2026)

Obiettivo unico: più prenotazioni. Sito ricostruito da zero nella stessa cartella, stessa anima del brand, zero librerie.

## Cosa è cambiato

### Prenotazione (il cuore del progetto)
- **Via l'iframe Treatwell**, dentro un flusso nativo in 3 passi: trattamento → quando (Oggi / Domani / Scelgo io la data + fascia mattina / pomeriggio / sera) → conferma su Treatwell o su WhatsApp, con "oppure chiama 331 715 3533" sotto.
- Si apre da **qualsiasi** bottone "Prenota" (header, hero, card del listino, box prezzo sticky, sezione scura, barra mobile): bottom-sheet su mobile, pannello laterale su desktop.
- Se si arriva da una card o da una pagina trattamento, il passo 1 è già compilato e si parte dal 2.
- "Oggi" e le fasce già passate si disattivano in base all'ora; "Aperti oggi fino alle 22:30" calcolato in tempo reale in hero e nello sheet (si aggiorna ogni minuto).
- **Senza JavaScript** lo sheet non esiste e ogni "Prenota" è un link diretto al menu Treatwell (verificato con JS disattivato).
- Nessun form nostro, nessun campo nome/telefono: li raccoglie Treatwell o WhatsApp.
- Il messaggio WhatsApp è precompilato con trattamento, durata, prezzo, giorno e fascia.
- **Deep link Treatwell per servizio: DA FORNIRE.** Finché manca, lo sheet apre `https://widget.treatwell.it/salone/532986/menu/` e mostra sopra il bottone "Su Treatwell cerca: Tuina Shiatsu · 50 min". Gli URL si inseriscono nella mappa `TREATWELL` in `genera-trattamenti.js` e si rigenera.

### Tracciamento (GA4 G-5XJQW3HMLL, Ads AW-17997395114, Consent Mode invariati)
- Nuovi eventi: `prenota_apri` (trattamento, origine), `prenota_passo` (1, 2, 3), `click_treatwell`.
- Mantenuti `click_whatsapp` e `click_chiama`.
- Gli eventi vanno a GA4 via `gtag` (in Consent Mode) e, dopo il consenso, anche nel dataLayer per GTM. Le etichette di conversione Ads si compilano in `script.js` (`AW_ETICHETTE`) quando esistono le azioni in Google Ads.
- **gtag.js parte alla prima interazione o 2,5 s dopo il load** (ID e comandi invariati, restano in coda nel dataLayer). È ciò che porta il TBT da ~600 ms a ~0 e la performance mobile da 84 a 97–100. Chi rimbalza in meno di 2,5 s senza toccare la pagina non viene conteggiato: non era un lead.

### Struttura home (altezza desktop 4.221 px, target < 4.800)
1. Header compatto: logo testuale, firma 东方之心养生馆, 3 link, telefono, "Prenota". Su mobile solo logo + Prenota, niente hamburger. Diventa più basso allo scroll.
2. Hero: foto vera del centro (60/40 desktop, sopra il testo su mobile), H1 invariato, frase di 15 parole, "5,0 ★ · 146 recensioni Google", un solo "Prenota ora" + link "Vedi trattamenti e prezzi", stato apertura.
3. Trattamenti: 8 card senza foto (2 colonne mobile / 4 desktop), un solo prezzo per card, "Prenota" outline + "Dettagli".
4. Perché noi: 3 righe con icona lineare.
5. Recensioni: 3 recensioni Google per intero (Ella Grace, Roberta Massobrio, Lily Lily: le tre di cui avevamo il testo completo), link "Tutte le recensioni".
6. Dove siamo: mappa embed (lazy), indirizzo, orari, telefono, "Come arrivare", WhatsApp.
7. FAQ: 4 (prima volta, cosa indosso, gravidanza, cancellazione).
8. Prenota (sezione scura, `#prenota`): 2 bottoni + telefono.
9. Footer: nome, firma cinese, contatti, social, P.IVA, privacy, cookie.
- Rimosso: offerta "Pulizia Orecchie 20 €" (scaduta il 10/10), countdown, sigillo, striscia fiducia, divisori a loto, chip nella hero, carosello recensioni, menu a scomparsa.

### Pagine trattamento (8, generate da `genera-trattamenti.js`)
- Hero con breadcrumb, H1 invariato, sottotitolo, prezzo grande + durata, riga fiducia, "Prenota questo trattamento" (sheet al passo 2 con trattamento preselezionato), "Chiedi su WhatsApp", foto a destra.
- "Che cos'è", "Benefici", "Come si svolge" come prima; avviso con filetto oro dove c'era; box prezzo sticky su desktop con Prenota + WhatsApp; 3 trattamenti correlati; sezione Prenota.
- Corretti i link tra pagine (ora `nome.html`, non `../nome.html`). Rimossi il testo "[FOTO TRATTAMENTO DA INSERIRE]" e lo slider: una foto sola.
- Riflessologia: nel listino e nello sheet un solo prezzo (40 min · 35 €); la versione da 60 min a 50 € resta nel box prezzo e nel testo della pagina.
- Aggiunta `pedicure.html` alla sitemap (mancava).
- Il generatore ora produce anche `index.html`, `privacy.html` e `cookie.html`: header, footer, sheet e sezione prenota sono identici ovunque e i prezzi vivono in un solo elenco. **Per modificare la home si edita `genera-trattamenti.js` e si rilancia `node genera-trattamenti.js`.**

### Direzione visiva: "spa editoriale"
- 2 font: Fraunces (titoli, 500–600) e Jost. Eliminati Cormorant, Lato, Italiana, Instrument Serif e il corsivo di Fraunces. I due file sono stati ridotti ai soli pesi usati e ai glifi latini (Fraunces 65 → 27 KB, Jost 25 → 17 KB) e sono precaricati.
- Palette invariata + bianco caldo #F7F7F2 per le superfici: le sezioni alternano salvia e bianco caldo, così la pagina respira.
- Superfici piatte, una sola ombra (0 8px 24px rgba(44,81,56,.10)), angoli card 14 px, bottoni 10 px. Un solo bottone primario per schermata: la barra mobile fissa compare solo quando il "Prenota ora" della hero esce dallo schermo.
- Oro solo come filetto (avviso, sezione scura) e stella della valutazione: come testo su chiaro non passerebbe il contrasto AA.
- Unica decorazione d'identità: la firma 东方之心养生馆 piccola in header e footer, con il 心 in rosso #C0392B (prima c'era un ♥).
- Il banner con testo dentro (`foto/brand-banner.jpg`) resta solo come og:image e immagine schema.org.

### Movimento
- Rimossi GSAP, SplitText, ScrollTrigger, animazioni carattere-per-carattere, parallax, tilt 3D, marquee, contatori.
- Restano: fade + translateY 12 px di 300 ms al primo ingresso di una sezione (IntersectionObserver, threshold 0,15, una volta sola), lift 2 px sulle card, transizioni 200 ms su bottoni e chip, sheet con cubic-bezier(.2,.8,.2,1) in 260 ms, header compatto allo scroll.
- Con `prefers-reduced-motion` tutto è disattivato. Senza JS il contenuto è visibile al 100 % (la classe `js` sull'`html` è l'unico interruttore).

### Performance e qualità
- Zero librerie. CSS 24,4 KB, JS 16,2 KB (script.js 13,0 + cookie.js 3,1), tutto non minificato e leggibile.
- Foto in WebP con fallback JPG (hero desktop 25 KB, hero mobile 22 KB, trattamenti 27–44 KB), `fetchpriority="high"` e preload sulla hero, lazy sul resto, `width`/`height` ovunque.
- Target touch ≥ 44 px, contrasto AA verificato da Lighthouse (accessibilità 100).
- Script `prepara-foto.py`: quando arrivano le nuove foto si sostituiscono i JPG **mantenendo gli stessi nomi** e si rilancia; rigenera i WebP e il ritaglio 4:3 della hero per mobile (`sfondo-prenota-mobile.*`, derivato da `sfondo-prenota-verticale.jpg`).

## Lighthouse mobile (simulato 4G, 3 esecuzioni per pagina, report in `qa/lighthouse/`)

| Pagina | Performance | Accessibilità | Best practices | SEO | FCP | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| Home | 97–100 | 100 | 100 | 100 | 0,9–1,2 s | 1,7–1,8 s | 0 | 0–180 ms |
| Tuina Shiatsu | 99–100 | 100 | 100 | 100 | 0,9–1,1 s | 1,7–1,8 s | 0 | 0 ms |

Misurato su server locale senza compressione gzip: in produzione CSS/JS/HTML compressi arrivano a circa un quarto del peso.

## Screenshot (`qa/screenshot/`)
- `home-390.png`, `home-768.png`, `home-1440.png`: home intera.
- `tratt-390.png`, `tratt-768.png`, `tratt-1440.png`: pagina Tuina Shiatsu intera.
- `*-sheet-passo2.png` e `*-sheet-passo3.png`: sheet aperto al passo 2 e al passo 3, da home e da pagina trattamento, alle tre larghezze.

## Scelte da segnalare
- **H1 della home**: 2 righe da 768 px in su; a 390 px sono 3, perché il testo (63 caratteri, invariato per SEO) non sta in 2 righe a una dimensione leggibile.
- **Bottone WhatsApp**: bianco caldo con bordo e icona #1FA855 e testo verde bosco, non verde pieno con testo bianco: quella combinazione ha contrasto 3,1:1 e non passa l'AA richiesto.
- **Durate "Seduta breve"** per coppettazione, gua sha, pulizia orecchie e pedicure: come nel sito precedente, non avendo durate ufficiali.
- **Privacy e cookie**: aggiornato il testo su Treatwell (ora si apre in una nuova scheda, non è più incorporato) e la data "Ultimo aggiornamento", che prima era un segnaposto visibile.
- **Asset rimossi** perché non più usati: `vendor/gsap`, `animazioni.js`, 10 file font, `brand-banner-verticale.jpg`, `sfondo-chi-siamo*.jpg`, `tratt-riflessologia-plantare-2.jpg`, `brand-banner.webp`.

## Da fornire
- 8 deep link Treatwell (uno per servizio) → mappa `TREATWELL` in `genera-trattamenti.js`.
- 6–10 foto del centro (mani che lavorano, lettino, dettagli, titolari) con gli stessi nomi file di `foto/`, poi `python3 prepara-foto.py` e `node genera-trattamenti.js`.
- Etichette di conversione Google Ads per `click_treatwell`, `click_whatsapp`, `click_chiama` → `AW_ETICHETTE` in `script.js`.
