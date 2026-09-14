# Prompt: redesign CRO-first della home e riorganizzazione per intento d'acquisto — Antica Fioreria del Centro

## Contesto del progetto
Sto lavorando su un e-commerce esistente, **Antica Fioreria del Centro** (bottega di Alessandria dal 1953, ora venduta online in tutta Italia), realizzato in HTML/CSS/JS vanilla, deployato su Vercel, dominio `anticafioreriadelcentro.it`. Repository: cartella `fioreria/` dentro il progetto Apexmedia-website.

**File principali da conoscere prima di toccare qualunque cosa:**
- `index.html` — home
- `collezione.html` + `collezione.js` — pagina catalogo con filtro categorie
- `prodotto.html` + `prodotto.js` — scheda prodotto singola
- `prodotti.js` — **fonte unica dei dati**: 39 prodotti, ognuno con `slug, nome, prezzo, taglie, cat[], foto, galleria, rating, avail, desc, descLunga, sconto`. Contiene anche `AFC_CATEGORIE` (12 categorie), `AFC_TAGLIE`, logica prezzi/spedizione. **Leggi questo file per intero prima di proporre qualunque nuova struttura**: ogni categoria e ogni prodotto esistente deve restare compatibile.
- `styles.css` — design system esistente: font `Fraunces` (titoli) + `Figtree` (corpo), palette verde salvia/bosco/oro (`--paper #F2F6EC, --bosco #2E4B3A, --gold #C2A45C, --ink #24352B`), card radius 24px, ombre soft/lift già definite come variabili CSS. **Non introdurre un nuovo sistema di colori o font: lavora dentro questo.**
- `main.js` — logica home (rendering griglie prodotto, animazioni reveal)

**Non toccare/rompere:**
- La logica di carrello, checkout, `AFC_PRODOTTI`/`AFC_CATEGORIE` come struttura dati, l'integrazione Stripe/contrassegno, il tracciamento conversioni (se presente).
- Gli URL esistenti (`collezione.html?cat=XXX`, `prodotto.html?p=SLUG`): sono già usati come landing page in una campagna Google Ads attiva. Non cambiare gli slug né i parametri query.

## Diagnosi (il problema da risolvere)
1. La home oggi mostra solo **4 prodotti fissi** su un catalogo di 39 (sezione `#piuScelte`, slug hardcoded). Chi arriva non percepisce la profondità dell'offerta.
2. Le 12 categorie (`novita, stagione, regali, anniversario, matrimonio, mamma, bouquet, primavera, estate, autunno, inverno, decorazioni`) mescolano "occasione", "stagione" e "uso" tutte sullo stesso piano, senza guidare due pubblici molto diversi:
   - **Chi cerca per la casa** (decorazioni, centrotavola, arredo) → decide su estetica, ambiente, dove va messo il pezzo.
   - **Chi cerca un regalo** (anniversario, mamma, matrimonio, compleanno) → decide su emozione, destinatario, occasione.
   Oggi entrambi vedono la stessa griglia di icone-categoria senza nessun percorso dedicato.
3. Le prove sociali (recensioni) sono a metà pagina in un nastro scorrevole, non subito visibili.
4. I differenzianti forti — **dal 1953, fatto a mano in bottega, zero acqua/zero cure, spedizione assicurata 48/72h, reso gratuito 14 giorni, anche pagamento alla consegna** — sono sparsi in sezioni diverse invece che in un blocco unico ad alto impatto.
5. Nessun segnale di popolarità reale (bestseller, "scelto da X clienti") sulle card prodotto, solo stelline.

## Obiettivo
Ridisegnare **home e navigazione per categorie** (eventualmente toccando anche `collezione.html` se la segmentazione lo richiede) per massimizzare:
1. **Tasso di conversione** (acquisto)
2. **Chiarezza del percorso**: in ≤10 secondi un visitatore deve capire "sono nel posto giusto per quello che cerco"
3. **Copertura del catalogo**: nessuno dei 39 prodotti deve essere invisibile dalla home

## Cosa deve fare il redesign, nello specifico

### 1. Segmentazione per intento in home (la priorità numero 1)
Introduci nella parte alta della home (subito dopo l'hero) **due percorsi visivamente distinti**, non solo due tile uguali tra tante:
- **"Per la tua casa"** → decorazioni, centrotavola, arredo → porta a `collezione.html?cat=decorazioni` (o a una vista che aggrega le categorie d'ambiente)
- **"Per un regalo"** → anniversario, mamma, matrimonio, compleanno → porta a `collezione.html?cat=regali` (o vista aggregata)

Ogni percorso deve avere: un'immagine rappresentativa reale del catalogo (non stock), una frase di beneficio (non solo il nome categoria), un pulsante d'azione chiaro. Valuta se questo richiede una piccola estensione della logica filtri in `collezione.js` (es. un meta-filtro "ambiente" vs "regalo" che raggruppa le categorie esistenti) — se sì, proponimela prima di implementarla, spiegando l'impatto sui link già usati in campagna Ads.

### 2. Griglia prodotti dinamica, non più 4 fissi
Sostituisci (o affianca) la sezione "Le più scelte" con una vista che copra realisticamente il catalogo: per categoria/collezione con "vedi tutti", o a rotazione, così i 39 prodotti non restano nascosti dietro un solo click su "Tutte le composizioni".

### 3. Blocco fiducia unico e ad alto impatto, sopra la piega
Un'unica sezione (non sparsa) con: dal 1953 · fatto a mano in bottega · zero acqua zero cure · spedizione assicurata 48/72h · reso gratuito 14 giorni · anche a rate/alla consegna. Deve comparire prima dello scroll medio, non dopo le sezioni prodotto.

### 4. Prova sociale anticipata
Porta 2-3 recensioni reali (non l'intero nastro) più in alto, vicino al primo blocco prodotti o al blocco fiducia — non solo a metà pagina.

### 5. Segnali di popolarità sulle card prodotto
Dove pertinente (dato disponibile in `prodotti.js`, es. `rating`), aggiungi badge tipo "Più scelto" / "Nuovo" in coerenza con `cat` già presente (es. `novita`).

## Vincoli tecnici e di metodo
- Mobile-first: il sito è navigato in larga parte da smartphone, verifica la resa da 360px in su.
- Performance: non aggiungere librerie esterne pesanti; resta in HTML/CSS/JS vanilla coerente col resto del progetto.
- Accessibilità: mantieni gli `aria-label` e la struttura semantica già presente (`<section aria-label="...">`).
- SEO: non rompere i meta tag, il canonical, i dati strutturati `Florist` già presenti in `index.html`.
- **Prima di scrivere codice**, presentami: (a) la nuova struttura/wireframe testuale della home sezione per sezione, (b) l'eventuale modifica alla logica categorie/filtri con impatto sugli URL esistenti, (c) massimo 3 opzioni per l'approccio alla segmentazione "casa vs regalo" con la tua raccomandazione — poi procedi con l'opzione scelta.

## Come giudicare se hai fatto un buon lavoro
Ogni sezione che proponi deve rispondere a: *"Questo aiuta un visitatore a capire più in fretta se questo prodotto/questa categoria fa per lui, o lo aiuta a fidarsi abbastanza da comprare?"* Se la risposta è no, va tolto o semplificato. Preferisci sempre concretezza (foto vere, numeri veri dal catalogo, differenzianti reali dell'attività) a elementi decorativi senza scopo di conversione.
