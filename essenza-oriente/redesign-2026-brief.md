# Essenza d'Oriente — Audit CRO + Brief di redesign (ottobre 2026)

> Stato: il redesign descritto nella Parte 3 è stato realizzato in questa cartella (vedi CHANGELOG.md). Il prompt resta valido per una nuova chat o per iterazioni successive.

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

## PARTE 3 — PROMPT (versione definitiva, già realizzata)

> Correzione rispetto alla prima stesura: il widget Treatwell NON si toglie (abbonamento pagato), e il look non deve essere "piatto": è il linguaggio editoriale minimale di Apex Media.

```
Rifai il sito di Essenza d'Oriente (centro olistico, Via San Lorenzo 46, Alessandria) nella cartella essenza-oriente/ con il linguaggio visivo Apex Media: minimalismo editoriale, non "template spa" e non piatto.

== IDENTITÀ ==
Nome, firma cinese 东方之心养生馆 (心 rosso #C0392B), prezzi, orari, telefono 331 715 3533, 8 trattamenti e pagine, recensioni Google 5,0 · 146, H1/title/meta invariati, schema.org, GA4 G-5XJQW3HMLL, Ads AW-17997395114, Consent Mode, banner cookie, sitemap.

== LOOK ==
- Carta calda #F4F2EC, inchiostro verde profondo #142019, salvia #D6E6C0 come evidenziatore a pennello e superfici, oro #B99A45 solo filetti e stelle. Grana di carta fissa al 3,5 %.
- Font: Fraunces (display, tracking -0.025em, line-height .98) e Jost (testo 17px). Etichette mono 11px uppercase tracking .14em con filetto oro.
- Griglia di 12 hairline all'8 % dietro hero, listino, prenota, dove.
- Cornice doppia per foto, widget, recensioni, mappa: shell con bordo hairline e padding 8px, core bianco con raggio concentrico.
- Bottoni a pillola, icona freccia in cerchio annidato a destra. Primario inchiostro, ghost con bordo.
- Nav a isola flottante (glass), si nasconde scendendo e riappare salendo. Mobile: logo + hamburger che diventa X, menu a schermo intero con voci display grandi numerate 01–04 che salgono a scalare. Barra mobile a isola con Prenota, WhatsApp, telefono.
- Footer scuro con marchio "Essenza d'Oriente" a tutta larghezza.

== STRUTTURA HOME ==
1. Hero split: etichetta stato live (aperti/chiusi), H1 con "Oli Essenziali" evidenziato, lede, Prenota ora + link Listino, riga 5,0 ★ 146 recensioni. A destra foto vera in cornice con card "146 recensioni" sovrapposta e tag indirizzo.
2. Nastro in loop con i nomi degli 8 trattamenti.
3. Listino editoriale: righe hairline con indice, nome, descrizione breve, durata, prezzo grande, Prenota. Hover: fondo salvia.
4. PRENOTA (sezione scura): widget Treatwell https://widget.treatwell.it/salone/532986/menu/ in cornice doppia, max 760px, 560px desktop / 520 mobile. Sopra, riga "Stai prenotando: X" quando si arriva da una riga del listino, con "cambia trattamento". Sotto, piccoli: WhatsApp precompilato e telefono.
5. Numeri: 7 su 7 · 5,0 su 5 · 2 min dal Duomo.
6. Recensioni in bento (4 card, cornice doppia, citazione in Fraunces).
7. Dove: mappa in cornice + dati con etichette mono + Come arrivare.
8. FAQ (4) con "+" che ruota.
9. Footer.

== MOVIMENTO (GSAP + SplitText + ScrollTrigger) ==
Righe dei titoli che salgono da maschera, evidenziatore che si disegna, foto hero che si apre dal basso e segue il mouse, fade-up a gruppi per i blocchi, contatore 146, nastro in loop, marchio footer che sale. Vietati: lettere che ruotano, blur, rimbalzi, gradienti animati. prefers-reduced-motion disattiva tutto; senza JS il contenuto resta visibile.

== PAGINE TRATTAMENTO ==
Stesso linguaggio: breadcrumb, H1, prezzo grande, CTA, foto in cornice, tre blocchi (cos'è, benefici, come si svolge), box prezzo sticky, widget Treatwell con "cerca: nome", trattamenti correlati. Link menu corretti.

== TRACKING ==
click_chiama, click_whatsapp, prenota_click, click_widget_prenotazione (blur trick sull'iframe).

== NON FARE ==
Niente prenotazione "nativa" alternativa al widget. Niente sezioni storytelling, popup, newsletter. Niente immagini generate.
```
