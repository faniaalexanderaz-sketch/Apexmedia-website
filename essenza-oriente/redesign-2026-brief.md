# Essenza d'Oriente — Audit CRO + Brief di redesign (ottobre 2026)

Documento operativo Apex Media. Parte 1: cosa non funziona oggi e perché.
Parte 2: il prompt pronto da incollare per far rifare il sito.

---

## PARTE 1 — AUDIT: perché il sito oggi "sembra fatto dall'AI" e frena le prenotazioni

### 1. Il flusso di prenotazione è a doppio lavoro (frizione n.1)
- L'utente sceglie il trattamento nella hero (chip "1 · Scegli il trattamento"), poi atterra su un **iframe Treatwell generico** (`/salone/532986/menu/`) dove deve **ricercare da capo lo stesso trattamento**. La scelta fatta in hero non viene passata al widget (è cross-origin, il codice stesso lo ammette).
- L'iframe è un rettangolo bianco alto 900px che si carica lazy: sul mobile si vede uno schermo intero vuoto prima che compaia qualcosa.
- Le pagine trattamento ripetono lo stesso iframe generico: anche chi arriva da Ads su "Tuina Shiatsu" deve ricercare "Tuina Shiatsu" dentro il widget.
- Sui trattamenti brevi (coppettazione, gua sha, pulizia orecchie) la CTA è WhatsApp invece di "Prenota": tre percorsi diversi per la stessa azione.

**Effetto:** ogni prenotazione costa 2 scelte + 1 attesa. È qui che si perde la conversione.

### 2. La hero è sovraccarica, soprattutto su mobile
Nel primo schermo (390×844) ci sono 11 elementi in colonna: eyebrow, H1 su 4 righe, sottotitolo corsivo di 3 righe, pillola rating, step "1", 5 chip, link "altri 3", CTA grande, link telefono, nota "aperti ora". Il bottone "Prenota ora" arriva al bordo inferiore dello schermo. Troppe decisioni prima della prima azione.

### 3. Segnali visivi "AI-generated" (quelli che fanno dire "sembra un template")
- **Immagine hero generata**: banner con candele/bambù/fiori e testo bruciato dentro (telefono, orari, indirizzo). È il singolo elemento che più grida "AI". Zero foto vere del centro, delle mani, delle persone.
- **6 famiglie tipografiche** caricate (Cormorant Garamond, Lato, Fraunces, Italiana, Jost, Instrument Serif). Un sito curato ne usa 2.
- Decorazioni ovunque: macchie radiali di luce sullo sfondo, bottoni con gradiente lucido + riflesso che passa ("luce" animata), bordi oro, pillole/badge/eyebrow su ogni sezione, divisori a loto ripetuti, sigillo "offerta" rotante.
- **Animazioni GSAP eccessive**: lettere che entrano ruotate (`rotate:-90`, `back.out(3)`), blur in/out, SplitText parola per parola, contatore stelle. Pesano 132 KB e fanno "effetto PowerPoint".
- Contenuti **nascosti finché non scorri** (`data-reveal`): lo screenshot a pagina intera del sito è per metà vuoto. Se GSAP tarda o fallisce, la pagina è bianca.

### 4. Incoerenze che minano la fiducia
- Offerta "Pulizia Orecchie 20 €" scaduta il 10/10: la sezione countdown si nasconde da sola, ma **la card nel listino mostra ancora "OFFERTA -33% · 20 €"** mentre il chip in hero dice 25 €. Due prezzi diversi per lo stesso trattamento nella stessa pagina.
- Pagine trattamento: nel menu laterale i link puntano a `../tuina-shiatsu.html` (cartella sbagliata → 404). Tutti e 8 i link del drawer sono rotti.
- Pagine trattamento: se la foto non carica appare il testo "[FOTO TRATTAMENTO DA INSERIRE]".
- Solo 1 trattamento su 8 ha la seconda foto per lo slider: gli altri 7 slider mostrano una sola immagine.

### 5. Struttura lunga e ridondante
Pagina desktop di 7.000px, 10 sezioni. Rating 5,0 ripetuto 3 volte (hero, striscia fiducia, sezione recensioni). "Dove siamo" ripete copy della hero. FAQ con 7 voci. La prenotazione è giustamente alta ma è un buco bianco.

### Cosa funziona e va tenuto
- Palette brand: salvia chiara, verde bosco, oro. Riconoscibile, coerente col logo e la vetrina.
- Prezzi e durate sempre in chiaro.
- Barra mobile fissa con "Prenota ora" + WhatsApp + Chiama.
- Indicatore dinamico "Aperti ora fino alle 22:30".
- SEO tecnico: H1 per città, schema LocalBusiness, GA4 + Ads con Consent Mode, sitemap, canonical, pagine trattamento indicizzabili.
- Recensioni Google vere, con nomi.

---

## PARTE 2 — COSA FARE (ordine di impatto)

1. **Prenotazione nativa in 3 tap** (impatto massimo): trattamento → giorno/fascia → nome+telefono. Si conclude con deep link Treatwell con servizio già selezionato, oppure con messaggio WhatsApp precompilato. Niente iframe in pagina. Su mobile è un bottom-sheet che si apre da qualunque "Prenota".
2. **Hero essenziale**: titolo 2 righe, una frase, rating, un solo bottone. Foto vera a tutto schermo. Il resto sotto.
3. **Look nuovo, stesso brand**: 2 font (un serif elegante + un sans pulito), molto bianco/salvia piatto, fotografia reale protagonista, zero gradienti lucidi, zero loti decorativi, una sola decorazione d'identità (i caratteri cinesi 东方之心养生馆 usati come firma).
4. **Movimento vero, non animazione**: micro-transizioni di 200–300 ms, fade semplice al primo scroll, hover sulle card, bottom-sheet fluido. Niente SplitText, niente rotazioni, niente blur. Contenuto sempre visibile senza JS.
5. **Pulizia incoerenze**: un prezzo per trattamento, link drawer corretti, foto vere o nessuno slider, offerta solo quando è attiva (e visibile ovunque o da nessuna parte).

---

## PARTE 3 — PROMPT PRONTO DA INCOLLARE

> Da incollare così com'è in Claude Code / Lovable / al developer. Sostituire solo le righe segnate `[DA FORNIRE]`.

```
Rifai il sito di Essenza d'Oriente (centro olistico, Via San Lorenzo 46, Alessandria) partendo dal codice esistente nella cartella essenza-oriente/. Obiettivo unico: più prenotazioni, con un look nuovo, moderno e "fatto a mano", mantenendo l'identità del brand. Non è un restyling dei colori: è un sito nuovo con la stessa anima.

== IDENTITÀ DA MANTENERE ==
- Nome: Essenza d'Oriente · Centro Olistico. Firma cinese: 东方之心养生馆 (il cuore 心 in rosso #C0392B, unico uso del rosso).
- Palette: salvia chiara #D6E6C0 (sfondi), verde bosco #2C5138 e #22402C (testi, CTA primaria), oro #B99A45 (solo accenti sottili, mai bordi grossi), verde WhatsApp #1FA855 solo per il bottone WhatsApp. Aggiungi un bianco caldo #F7F7F2 per le superfici: oggi tutto è verde chiaro uniforme e stanca.
- Contenuti, prezzi, orari, telefono (+39 331 715 3533), indirizzo, 8 trattamenti e le loro pagine, recensioni Google (5,0 · 146), schema.org, GA4 G-5XJQW3HMLL, Google Ads AW-17997395114 con Consent Mode, banner cookie, sitemap, canonical, robots: tutto resta. Non cambiare H1, title e meta description delle pagine (SEO già posizionato).
- Treatwell salone 532986 resta il sistema di prenotazione a monte.

== DIREZIONE VISIVA: "spa editoriale", non "template spa" ==
- Solo 2 font: Fraunces (titoli, peso 500–600, mai più di 2 righe in hero) e Jost (tutto il resto). Elimina Cormorant, Lato, Italiana, Instrument Serif.
- Fotografia reale protagonista. Rimuovi il banner generato con testo dentro (foto/brand-banner.jpg). Usa foto vere: [DA FORNIRE: 6–10 foto del centro, mani che lavorano, lettino, dettagli oli/coppette, titolari]. Finché non arrivano, usa placeholder neutri a tinta piatta con rapporto 4:5, mai immagini generate e mai testo "da inserire" visibile.
- Superfici piatte, spazi bianchi generosi, griglia pulita. Vietati: gradienti lucidi sui bottoni, riflessi animati, macchie radiali di luce sullo sfondo, bordi oro spessi, sigilli rotanti, divisori a loto ripetuti, pillole/eyebrow su ogni titolo. Un'unica decorazione d'identità: la firma 东方之心养生馆 piccola in header e footer.
- Bottoni: primario pieno verde bosco con angoli 10px, secondario outline. Un solo bottone primario per schermata.
- Ombre: una sola, morbida (0 8px 24px rgba(44,81,56,.10)). Angoli card 14px.

== MOVIMENTO: dinamico ma sobrio ==
- Rimuovi GSAP, SplitText, ScrollTrigger e tutte le animazioni carattere-per-carattere, rotazioni, blur, contatori. Il contenuto deve essere visibile al 100% anche senza JavaScript.
- Consentito, in CSS puro o 5 righe di IntersectionObserver: fade+translateY 12px di 300 ms al primo ingresso di una sezione (una volta sola, threshold 0.15); hover su card con lift di 2px; transizioni 200 ms su bottoni e chip; bottom-sheet che sale con cubic-bezier(.2,.8,.2,1) in 260 ms; header che diventa compatto allo scroll.
- Rispetta prefers-reduced-motion disattivando tutto.

== PRENOTAZIONE: il cuore del progetto ==
Sostituisci l'iframe Treatwell in pagina con un flusso nativo in 3 passi, identico su home e pagine trattamento, che si apre come bottom-sheet su mobile e come pannello laterale su desktop da QUALSIASI bottone "Prenota":
1. Trattamento: 8 card compatte (nome, durata, prezzo). Se l'utente arriva da una pagina trattamento o ha cliccato una card, il passo è già compilato e si parte dal 2.
2. Quando: scelta tra "Oggi", "Domani", "Questa settimana", "Scelgo io la data" + fascia (mattina / pomeriggio / sera fino alle 22:30). Mostra "Aperti oggi fino alle 22:30" calcolato in tempo reale (riusa la logica esistente).
3. Conferma: due bottoni, nell'ordine. (a) "Conferma su Treatwell" → apre in nuova scheda il deep link Treatwell del servizio scelto [DA FORNIRE: URL per ciascuno degli 8 servizi dal pannello Treatwell; se non esiste un deep link per servizio, usa https://widget.treatwell.it/salone/532986/menu/ e mostra sopra il bottone il riepilogo "Cerca: Tuina Shiatsu 50 min" così l'utente sa cosa cliccare]. (b) "Conferma su WhatsApp" → messaggio precompilato con trattamento, giorno, fascia. Sotto, piccolo: "oppure chiama 331 715 3533".
- Niente account, niente carta, niente campi oltre a quelli richiesti da Treatwell. Nessun campo nome/telefono nostro: lo raccoglie Treatwell o WhatsApp.
- Traccia in GA4: apertura sheet, passo completato (1,2,3), click Treatwell, click WhatsApp, click telefono. Mantieni gli eventi già esistenti in script.js (prenota_click, whatsapp_click, chiamata_click) come nomi.
- Il bottone della barra mobile fissa apre lo stesso sheet.

== STRUTTURA HOME (in quest'ordine, nient'altro) ==
1. Header compatto: logo testuale + firma cinese, 3 link (Trattamenti, Recensioni, Dove siamo), bottone "Prenota". Su mobile solo logo + "Prenota".
2. Hero: foto vera a tutta larghezza (o 60/40 su desktop). H1 esistente su max 2 righe. Una frase di 12 parole. Riga fiducia: "5,0 ★ · 146 recensioni Google · Aperti 7/7 fino alle 22:30". Un solo bottone "Prenota ora". Nessun chip, nessun step, nessuna nota aggiuntiva.
3. Trattamenti: griglia 2 colonne mobile / 4 desktop. Ogni card: foto 4:5, nome, durata · prezzo, bottone "Prenota" (apre sheet al passo 2 con trattamento già scelto), link testuale "Dettagli". Un solo prezzo per trattamento. Nessuna offerta visibile a meno che non sia attiva per data; se attiva, deve apparire coerentemente in card, sheet e messaggio WhatsApp.
4. Perché noi: 3 righe secche con icona lineare (Aperti 7/7 fino alle 22:30 · Centro storico, 2 min dal Duomo · Tecniche tradizionali cinesi). Nient'altro.
5. Recensioni: 3 recensioni Google vere, testo intero, nome, link "Tutte le recensioni". Senza carosello automatico.
6. Dove siamo: mappa embed + indirizzo + orari + "Come arrivare". Niente copy introduttivo.
7. FAQ: massimo 4 (prima volta, cosa indosso, gravidanza, cancellazione).
8. Footer: nome, firma cinese, indirizzo, telefono, social, P.IVA, privacy, cookie.
Lunghezza target desktop: sotto i 4.500px.

== PAGINE TRATTAMENTO (8, generate da genera-trattamenti.js) ==
Hero: foto, H1 esistente, durata · prezzo, bottone "Prenota" (sheet al passo 2, trattamento preselezionato). Poi: "Che cos'è", "Benefici", "Come si svolge" come oggi, box prezzo sticky su desktop, 3 recensioni, link ai trattamenti correlati. Correggi i link del menu laterale (oggi puntano a ../nome.html invece di nome.html). Rimuovi il testo "[FOTO TRATTAMENTO DA INSERIRE]" e lo slider: una foto sola.

== PERFORMANCE E QUALITÀ ==
- Zero librerie JS esterne. CSS sotto i 40 KB, JS sotto i 15 KB.
- Immagini in WebP con srcset, hero con fetchpriority="high", tutto il resto lazy.
- LCP sotto 2,0 s su 4G, CLS 0. Verifica con Lighthouse mobile e riporta i punteggi.
- Target touch minimo 44px. Contrasto AA su tutti i testi (attenzione all'oro su salvia: usalo solo su sfondi scuri).
- Testa su 390px, 768px, 1440px e allega screenshot di home e di una pagina trattamento con lo sheet aperto al passo 2.

== COSA NON FARE ==
- Non aggiungere sezioni "Chi siamo", "La nostra filosofia", valori, storytelling lungo, blog, newsletter, popup.
- Non usare immagini generate, icone 3D, emoji, stelle animate, contatori.
- Non cambiare prezzi, orari, testi SEO, ID di tracciamento.
- Non inserire un form nostro che duplichi Treatwell.

Consegna: codice nella stessa cartella, un file CHANGELOG.md con le scelte fatte, gli screenshot richiesti e i punteggi Lighthouse.
```
