# PROMPT — ARABESQUE BUSALLA v2 "GALLERIA CHIARA"
## Dieci interventi per trasformare un bel sito in un sito che vende

> Da incollare in una sessione nuova di Claude Code, nella root del repo `Apexmedia-website`.
> Il sito attuale è in `arabesque/` ed è online su https://arabesque-busalla.vercel.app

---

## 0. CONTESTO E MANDATO

Il sito v1 esiste, funziona ed è tecnicamente solido: HTML/CSS/JS senza framework, funzioni
serverless su Vercel per pagamenti e ordini, catalogo in `prodotti.js`, cassa in tre passaggi,
pannello interno. **Non si butta niente di quell'impianto.** Si ribalta la pelle e si alza il
tasso di conversione.

Il committente ha un'obiezione precisa e fondata: *"è troppo scuro"*. Ha ragione, e la ragione è
commerciale prima che estetica:

- su fondo scuro i **prezzi si leggono peggio** e la fiducia al momento del pagamento cala;
- le **foto dei capi** — che sono il prodotto — rendono molto meglio su fondo chiaro;
- il pubblico reale della boutique (35-65 anni, anche non nativo digitale) legge più
  velocemente su chiaro, specie da telefono alla luce del sole.

**Mandato:** il sito diventa **chiaro, luminoso, da galleria d'arte**, tenendo il nero solo come
accento editoriale in 2-3 blocchi. Deve restare bellissimo, ma ogni scelta estetica passa da una
domanda sola: *questo aiuta a vendere?*

### Il principio che regge tutto: "complesso dentro, semplice fuori"

Il committente chiede un sito "molto complicato ma semplice da usare". Tradotto correttamente:

> **Ricchezza di funzioni, povertà di decisioni.**
> Il sito può fare moltissimo (filtri, varianti, ritiro, express checkout, ricerca istantanea,
> consigli taglia), ma in ogni singola schermata l'utente deve avere **una sola cosa ovvia da
> fare**. Ogni volta che aggiungi una funzione, devi togliere un bivio.

Se un intervento rende il sito più ricco ma la pagina più affollata, è sbagliato: rifallo.

---

## 1. RIBALTAMENTO CROMATICO — "Galleria chiara"

**Obiettivo:** far sembrare il sito una galleria luminosa, non una boutique al buio, senza
perdere il carattere di lusso.

**Palette (sostituire i token in `styles.css`):**

```css
:root{
  --carta:      #FBFAF7;  /* fondo principale: bianco caldo, mai #FFF puro */
  --carta-2:    #F4F1EA;  /* sezioni alternate, superfici */
  --carta-3:    #EAE5DA;  /* bordi pieni, stati hover */
  --inchiostro: #16150F;  /* testo principale */
  --grafite:    #5C5850;  /* testo secondario */
  --fumo:       #8C8780;  /* testo terziario, didascalie */
  --oro:        #A8842C;  /* accento: oro scuro, leggibile su chiaro (AA) */
  --oro-luce:   #D9BE7E;  /* solo su fondi scuri */
  --notte:      #14131A;  /* i blocchi editoriali scuri */
  --successo:   #2F6B4F;
  --allerta:    #B4442F;
  --filo:       rgba(22,21,15,.10);
  --filo-2:     rgba(22,21,15,.18);
}
```

**Regole non negoziabili:**
- Fondo **mai bianco puro**: il bianco caldo toglie l'effetto "foglio Word".
- L'oro su chiaro va **scurito** (`#A8842C`): l'oro chiaro su bianco è illeggibile e sembra
  scaduto. Rapporto di contrasto minimo 4.5:1 su ogni testo.
- **Ombre morbide e diffuse**, mai nere dure: `0 1px 2px rgba(22,21,15,.04), 0 12px 32px rgba(22,21,15,.06)`.
- I bordi sono **capelli di trasparenza**, mai grigio pieno.
- **Tre blocchi scuri in tutto il sito** come respiro editoriale: il manifesto taglie, la fascia
  del negozio, il piè di pagina. Nient'altro.
- Le foto prodotto su fondo chiaro vanno su `--carta-2`, non su bianco: il capo bianco deve
  staccarsi.

**Tipografia:** si tengono le sette famiglie già installate e i loro ruoli (Bodoni Moda display,
Instrument Serif corsivi, Geist interfaccia, Archivo manifesti, Oswald etichette, JetBrains Mono
dati, Italiana occhielli), ma sul chiaro vanno **ricalibrati i pesi**: il Bodoni in chiaro va
appesantito (500→600) perché il contrasto estremo si assottiglia otticamente su bianco.

**Fatto quando:** ogni pagina passa il controllo contrasto AA, nessun testo grigio chiaro su
bianco, e uno screenshot affiancato v1/v2 mostra lo stesso carattere di lusso con il doppio della
leggibilità.

---

## 2. HOME RIFATTA PER CONVERTIRE, NON PER STUPIRE

**Obiettivo:** oggi la home è uno spettacolo tipografico; deve diventare una **vetrina che
vende**. La regola d'oro dell'e-commerce: *il primo prodotto acquistabile deve essere visibile
entro il primo scroll.*

**Nuovo ordine delle sezioni:**

1. **Barra annuncio** — spedizione gratuita sopra soglia + codice benvenuto (chiudibile).
2. **Header** — logo, menu, ricerca, account, carrello. Sempre visibile, compatto allo scroll.
3. **Hero commerciale (non tipografico)**: mezzo schermo, non a tutta altezza.
   - a sinistra: titolo breve + una riga di sottotitolo + **una sola CTA primaria** + 3 micro-prove
     ("spedizione 24/48h · reso 14 giorni · ritiro gratis a Busalla");
   - a destra: **foto reale di un capo indossato**, non un riquadro astratto;
   - sotto, subito visibile: **una riga di 4 prodotti** con prezzo e pulsante taglia.
4. **Fascia fiducia** con 4 icone sottili.
5. **Categorie** (Donna / Uomo / Curvy) — tre riquadri fotografici.
6. **Più venduti** — 8 prodotti in griglia, aggiunta rapida al carrello.
7. **Blocco Curvy XS-6XL** — scuro, editoriale (il differenziatore del negozio).
8. **Novità della settimana** — 4 prodotti, con badge data.
9. **Lookbook** — 3 outfit completi, "compra il look".
10. **Il negozio a Busalla** — foto reale, mappa, orari, ritiro gratuito.
11. **Recensioni Google reali** (vedi punto 7).
12. **Newsletter** con incentivo chiaro.
13. **FAQ** brevi + **piè di pagina** completo.

**Cosa sparisce:** l'hero a tutta altezza puramente tipografico, il ticker se resta solo
decorativo, qualunque sezione che non porti a un prodotto o a un contatto.

**Fatto quando:** con una finestra 1440×900 e senza scrollare si vedono: proposta di valore, CTA,
prezzi reali. Su telefono, entro un pollice di scroll.

---

## 3. CATALOGO COMPLETO E PROFONDO

**Obiettivo:** oggi ci sono 27 capi di prova. Un negozio vero ne ha centinaia, e un catalogo magro
uccide la credibilità e il tempo di permanenza.

**Cosa fare:**
- Portare il catalogo a **80-120 articoli**, coprendo per davvero: donna (capispalla, abiti,
  maglieria, camicie, pantaloni, gonne, jeans, tute), uomo (capispalla, giacche, camicie,
  maglieria, pantaloni, jeans, polo), curvy (tutte le categorie donna in taglie calibrate),
  accessori (borse, sciarpe, cinture, cappelli, bigiotteria).
- Struttura dati arricchita in `prodotti.js`: `stagione`, `composizione`, `codice` (SKU),
  `pesoSpedizione`, `dataArrivo`, `varianti[]` con foto per colore, `recensioni[]`.
- **Pagina categoria per ogni sottocategoria** (`/donna/capispalla`), ognuna con testo
  introduttivo unico di 60-80 parole per la ricerca locale.
- **Paginazione a "carica altri"** a blocchi di 24, con URL che tiene la posizione.
- **Prodotti visti di recente** in coda a catalogo e scheda.
- **Stato scorte reale**: disponibile / ultimi pezzi / esaurito con avviso di riassortimento.

**Fatto quando:** ogni filtro incrociato (es. donna + 3XL + capispalla + saldi) restituisce almeno
un risultato sensato, e nessuna categoria del menu porta a una pagina con meno di 6 capi.

---

## 4. SCHEDA PRODOTTO CHE CHIUDE LA VENDITA

**Obiettivo:** è la pagina dove si decide. Ogni elemento deve togliere un dubbio.

**Cosa aggiungere (in ordine di impatto):**
1. **Data di consegna stimata, calcolata**: "Ordina entro le 15:00 di oggi → a casa **martedì 17**"
   oppure "**Ritiralo domani** in negozio". Il calcolo esclude weekend e festivi.
2. **Galleria seria**: 4-6 foto, miniature verticali, zoom al passaggio, swipe su telefono,
   cambio foto al cambio colore.
3. **Selettore taglia con scorte**: taglia esaurita barrata + "avvisami", taglia con 1-2 pezzi
   marcata "ultimi 2".
4. **Guida taglie contestuale**: si apre di lato, con la tabella **del capo**, non generica, e il
   pulsante WhatsApp "chiedi a noi" precompilato con nome del capo.
5. **Riquadro fiducia sotto il pulsante**: reso 14 giorni · cambio taglia in negozio · pagamento
   sicuro · spedizione gratuita sopra soglia.
6. **Disponibilità in negozio**: "Disponibile a Busalla — te lo teniamo da parte 48h" con pulsante
   di prenotazione (email al negozio).
7. **Recensioni del capo** con voto medio e dato sulla vestibilità ("veste piccolo / regolare /
   abbondante" in percentuale).
8. **Completa il look**: 3 capi abbinati con aggiunta in blocco.
9. **Barra fissa su telefono**: foto mini + prezzo + taglia + "Aggiungi", sempre visibile.
10. **Dati strutturati Product completi** (prezzo, disponibilità, voto, spedizione, reso).

**Fatto quando:** un utente che arriva sulla scheda da Google può, senza scrollare oltre il primo
schermo, capire prezzo, taglie disponibili, quando arriva e come si rende.

---

## 5. CASSA INTEGRATA, UNA PAGINA, ZERO ATTRITO

**Obiettivo:** il checkout è dove si perdono i soldi già guadagnati. Oggi funziona ma è "un
modulo". Deve diventare **un percorso in una sola schermata**.

**Cosa fare:**
- **Pagamenti espressi in cima**: Apple Pay / Google Pay / PayPal **prima** del modulo — chi li usa
  compra in 8 secondi e non compila niente.
- **Una sola pagina**, tre blocchi che si aprono in sequenza (contatti → consegna → pagamento) con
  riepilogo **sempre visibile** a destra (sopra il modulo su telefono).
- **Acquisto come ospite predefinito**; la registrazione viene proposta *dopo* l'acquisto, con un
  clic ("crea la password per seguire l'ordine").
- **Completamento automatico** di città e provincia dal CAP.
- **Validazione gentile**: l'errore appare quando esci dal campo, mai al primo carattere, e dice
  come si risolve.
- **Nessun costo a sorpresa**: spedizione e contrassegno visibili dal primo blocco.
- **Ritiro in negozio in evidenza** come opzione gratuita, con orari e indirizzo.
- **Codice sconto già applicato** se arriva dalla newsletter: mai un campo vuoto che invita ad
  andare a cercare un codice altrove.
- **Recupero carrello abbandonato**: se l'utente inserisce l'email e non completa, una mail dopo
  un'ora e una dopo 24 ore (richiede il consenso e un endpoint in `api/`).
- **Pagina di conferma che vende ancora**: numero ordine, data di consegna, pulsante "aggiungi al
  calendario", 3 prodotti correlati, invito a seguire i social.

**Fatto quando:** dal carrello alla conferma servono **massimo 6 interazioni** con pagamento
espresso e **massimo 14 campi** con carta e spedizione.

---

## 6. RICERCA E NAVIGAZIONE CHE NON FANNO PENSARE

**Obiettivo:** chi cerca un capo preciso converte 3-4 volte più di chi naviga. Oggi la ricerca non
esiste.

**Cosa fare:**
- **Ricerca istantanea**: icona in header, overlay a tutta larghezza, risultati mentre digiti
  (nome, categoria, colore, taglia), con foto e prezzo. Nessun tasto "cerca" da premere.
- **Ricerche suggerite** a overlay vuoto: "cappotti", "taglie curvy", "cerimonia", "saldi".
- **Mega menu** su desktop: colonne per sottocategoria + due foto di richiamo.
- **Menu a schermo intero su telefono** con accordion per categoria.
- **Barra di navigazione in basso su telefono** (home, cerca, preferiti, carrello, negozio):
  raddoppia le pagine per sessione su mobile.
- **Briciole di pane** su ogni pagina interna, anche per la ricerca Google.
- **Filtri che restano** tornando indietro dalla scheda prodotto (è il difetto più odiato degli
  e-commerce).

**Fatto quando:** trovare "un cappotto nero 3XL" richiede al massimo 3 tocchi da qualunque pagina.

---

## 7. PROVA SOCIALE E URGENZA, MA ONESTE

**Obiettivo:** alzare la fiducia senza inventare niente. Ogni numero mostrato deve essere vero.

**Cosa fare:**
- **Recensioni Google reali** (da chiedere al cliente): testo, nome, data, voto, con dati
  strutturati `AggregateRating`. Se non ci sono ancora, la sezione **resta nascosta** finché non
  arrivano: meglio niente che finto.
- **Recensioni di prodotto** raccolte con una mail automatica 7 giorni dopo la consegna.
- **Foto dei clienti** (con consenso scritto) in una fascia "come lo indossano".
- **Scorte vere**: "ultimi 2 pezzi" solo se il magazzino dice 2.
- **Attività reale**: "12 persone hanno comprato questo capo questo mese" solo se calcolato dagli
  ordini veri; altrimenti si omette.
- **Fascia garanzie** prima del piè di pagina: reso, pagamenti sicuri, negozio fisico dal [anno],
  P. IVA visibile. Il negozio fisico è la prova sociale più forte che ha questo cliente: va
  ripetuta ovunque.
- **VIETATO**: conto alla rovescia finti, "solo oggi" perpetui, recensioni inventate, contatori
  gonfiati. Bruciano la fiducia e sono contestabili per legge.

**Fatto quando:** ogni affermazione numerica del sito può essere dimostrata con un dato del
gestionale o uno screenshot di Google.

---

## 8. VELOCITÀ E TELEFONO PRIMA DI TUTTO

**Obiettivo:** il 70-80% del traffico sarà da telefono, spesso in 4G in valle. Un secondo di
ritardo costa circa il 7% delle conversioni.

**Budget (bloccante):**
- LCP < **2,0 s** su mobile 4G · CLS < **0,05** · INP < **200 ms**
- CSS < 110 KB, JS < 90 KB non minificati, zero librerie esterne
- Immagini **AVIF + WebP** con `srcset` a 3 larghezze, dimensioni sempre dichiarate,
  `fetchpriority="high"` solo sulla prima immagine dell'hero
- Font: i sette restano, ma **precaricati solo i due usati sopra la piega**; gli altri in
  `font-display: swap`
- Lighthouse mobile: Prestazioni ≥ 92, Accessibilità ≥ 98, SEO 100

**Mobile:**
- Aree toccabili ≥ 44 px, niente hover come unico modo per fare qualcosa
- Griglia prodotti a 2 colonne, filtri in un pannello che sale dal basso
- Tastiera giusta per ogni campo (`inputmode`, `autocomplete`)
- Test reale a 360 px di larghezza: nessuno scorrimento orizzontale, mai

**Fatto quando:** i numeri sopra sono verificati e riportati nel README con data.

---

## 9. MISURARE, ALTRIMENTI È SOLO ESTETICA

**Obiettivo:** senza dati non si ottimizza, si tira a indovinare. E senza dati non si giustifica
al cliente il valore del lavoro.

**Cosa fare:**
- **GA4 con e-commerce completo**: `view_item_list`, `view_item`, `select_item`, `add_to_cart`,
  `view_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase` — con valore,
  valuta, id articolo, taglia e colore come parametri.
- **Meta Pixel + Conversions API** lato server (dal webhook Stripe): recupera il 20-30% di eventi
  persi dai blocca-traccianti.
- **Consent Mode v2**: niente parte prima del consenso; i cookie tecnici restano.
- **Eventi personalizzati**: `size_guide_open`, `whatsapp_click`, `pickup_selected`,
  `back_in_stock_request`, `search_performed`, `filter_applied`.
- **Pannello interno** esteso: conversione, valore medio ordine, abbandono cassa, capi più visti
  senza acquisto (= problema di prezzo o foto), taglie più richieste da esaurite (= cosa
  riordinare). Questo secondo dato vale, per il negozio, più del sito stesso.

**I 5 test da fare, in ordine:**
1. Hero con foto di prodotto vs hero tipografico
2. Spedizione gratuita a 79 € vs 59 €
3. Pagamenti espressi in cima alla cassa vs in fondo
4. "Ritiro gratuito in negozio" in scheda prodotto vs solo in cassa
5. Prezzo pieno barrato accanto allo sconto vs solo prezzo scontato

**Fatto quando:** dal pannello si legge, senza aprire GA4, quanto ha incassato il sito questa
settimana e dove si perdono gli utenti.

---

## 10. CONTENUTI VERI, FIDUCIA E RICERCA LOCALE

**Obiettivo:** chiudere il divario tra "bel sito" e "negozio che esiste davvero".

**Cosa fare:**
- **Foto reali** al posto di ogni riquadro segnaposto: 4-6 per capo (fronte, retro, dettaglio
  tessuto, indossato), fondo uniforme, luce naturale. Priorità: i 20 capi in vetrina.
- **Pagina "Chi siamo"** con la storia vera del negozio, la foto dei titolari e l'anno di
  apertura: su un multimarca di provincia è la pagina più letta dopo i prodotti.
- **Pagina "Taglie calibrate XS-6XL"** curata come una landing di ricerca: è la keyword su cui
  questo negozio può davvero posizionarsi in Liguria.
- **Scheda Google Business** allineata al sito (orari, foto, link), e recensioni richieste ai
  clienti in cassa con un QR.
- **SEO locale**: title e descrizioni uniche per ogni pagina, `LocalBusiness` + `ClothingStore` +
  `Product` + `BreadcrumbList` + `FAQPage`, sitemap aggiornata, testi di categoria che nominano
  Busalla, Valle Scrivia e Genova senza forzature.
- **Email transazionali curate**: conferma ordine, spedizione, consegna, richiesta recensione.
  Sono le email con il tasso di apertura più alto che il negozio avrà mai.
- **Tutti i `TODO-CLIENTE` chiusi**: P. IVA, telefono, WhatsApp, orari, email. Un sito con
  "TODO-CLIENTE" nel piè di pagina non si può mostrare a nessuno.

**Fatto quando:** cercando "abbigliamento taglie forti Busalla" il sito è pertinente, e nessuna
pagina contiene più un segnaposto.

---

## COME PROCEDERE (ordine di lavoro)

1. Punti **1 e 2** insieme: palette e home. È il cambio che il cliente vede subito.
2. Punto **3**: catalogo pieno (senza prodotti veri gli altri punti non si possono testare).
3. Punti **4 e 5**: scheda prodotto e cassa. Qui si guadagna il tasso di conversione.
4. Punti **6, 7, 8**: ricerca, fiducia, velocità.
5. Punti **9 e 10**: misurazione e contenuti reali.

Dopo ogni punto: verifica nel browser, screenshot desktop e mobile, commit separato con messaggio
che spiega **perché**, non solo cosa.

## REGOLE PERMANENTI

- Nessun framework, nessun build step, nessuna dipendenza esterna a runtime.
- Niente dati inventati: recensioni, P. IVA, numeri, disponibilità.
- Ogni funzione nuova deve togliere un bivio all'utente, non aggiungerlo.
- `prefers-reduced-motion` sempre rispettato, contrasto AA sempre verificato.
- Se un'idea è bella ma non aiuta a vendere, non entra.

## OUTPUT ATTESO

1. Sito aggiornato in `arabesque/`, navigabile in locale e in produzione.
2. README aggiornato con palette, budget prestazioni misurati e lista dei test attivi.
3. Un riassunto finale con: cosa è cambiato, numeri prima/dopo, cosa manca ancora dal cliente.

**Procedi in autonomia, un punto alla volta. Non chiedere conferme estetiche: decidi con criterio
commerciale, documenta le scelte e consegna lavoro finito.**
