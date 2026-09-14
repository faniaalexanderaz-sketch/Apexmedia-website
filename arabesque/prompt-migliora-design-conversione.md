# Prompt: continuare il lavoro su design e conversione — Arabesque Busalla

## Contesto del progetto
Sto lavorando su un e-commerce esistente, **Arabesque Abbigliamento** (Busalla, GE), in HTML/CSS/JS vanilla, deployato su Vercel. Repository: cartella `arabesque/` dentro il progetto Apexmedia-website.

**Leggi prima questi file, nell'ordine, senza saltarli:**
1. `arabesque/README.md` — struttura del progetto, stato di avanzamento, palette, budget di performance
2. `arabesque/PROMPT-V2-CHIARO.md` — il piano originale in 10 interventi su cui il sito è stato costruito. **Fondamentale**: la maggior parte di questi 10 punti risulta già fatta (vedi tabella in README). Non riproporre da capo cose già implementate — verifica prima cosa esiste davvero nel codice, poi valuta se è fatto bene o va rifinito.
3. `arabesque/prodotti.js` — **fonte dati unica** del catalogo: 27 prodotti segnaposto (nomi, prezzi e marchi ancora provvisori, in attesa del listino reale — vedi commento `TODO-CLIENTE` in testa al file)
4. `arabesque/styles.css` — design system "Galleria chiara": palette carta/inchiostro/oro (`--carta #FBFAF7, --inchiostro #16150F, --oro #A8842C`), un blocco scuro `--notte` riservato a solo tre sezioni (manifesto taglie, negozio, footer), 7 famiglie tipografiche ciascuna con un ruolo preciso (Bodoni Moda per titoli, Italiana per moda, Archivo per manifesto, JetBrains Mono per dati/prezzi, ecc. — elenco completo in README). **Non introdurre nuovi colori o font: lavora dentro questo sistema, è già curato.**
5. `arabesque/index.html`, `home.js`, `main.js` — la home attuale e la sua logica

**Non toccare/rompere:** la logica di carrello, checkout (`checkout.js`), le funzioni serverless in `api/*` (Stripe, ordini, email), `config.js` (dati reali del negozio), gli URL dei prodotti esistenti.

## Situazione attuale (importante)
- Il sito **non ha ancora foto reali**: la cartella `foto/` è vuota. Ogni prodotto cerca `foto/<slug>-1.webp` (e `-2`, `-3`); finché il file non esiste, la card mostra un riquadro editoriale di cortesia — **non un'immagine rotta**, ma nemmeno il prodotto vero.
- Il catalogo ha **27 prodotti segnaposto** su un obiettivo dichiarato di 80-120 capi (punto 3 del piano originale, in pausa "in attesa di listino e foto del cliente").
- **Le foto stanno arrivando ora, un pezzo alla volta**, direttamente da me in questa chat. Il tuo compito, mano a mano che te le mando, è:
  1. Salvarle nel formato e nome atteso da `prodotti.js` (`foto/<slug>-1.webp` ecc. — converti in WebP se arrivano in altro formato, rispettando i budget di peso del README: home 411 KB, catalogo 412 KB, scheda capo 336 KB, da NON sforare in modo vistoso man mano che le foto reali entrano)
  2. Aggiornare la riga corrispondente in `prodotti.js` con i dati reali del capo che ti comunico insieme alla foto (nome, prezzo, categoria, taglie disponibili) — non inventare nulla che non ti abbia detto esplicitamente, lascia il segnaposto se non hai ancora un dato
  3. Verificare che il capo compaia correttamente in home (se rientra nelle sezioni "più venduti"/"lookbook" curate a mano — controlla `home.js`) e nel catalogo di categoria (`donna.html`/`uomo.html`/`curvy.html`)
  4. Ogni tanto (non a ogni singola foto) fare un controllo di insieme: le foto caricate finora hanno colori, luce e inquadratura coerenti tra loro? Se una foto è visibilmente più scura, più piccola o tagliata diversamente dalle altre, segnalamelo prima di pubblicarla così com'è — l'incoerenza visiva tra le card è una delle cause più comuni di sito "che non convince" su un e-commerce moda.

## Perché stiamo tornando su questo sito
Il sito, tecnicamente, segue già un piano di conversione solido (i 10 punti). **Nonostante questo, a un primo colpo d'occhio non convince ancora abbastanza** — il giudizio è "non mi piace" più che un problema tecnico puntuale. Il tuo compito non è ripetere il piano già fatto, ma fare una **revisione critica di secondo livello**, quella che emerge solo quando il sito è quasi finito e i difetti che restano sono di dettaglio e di sensazione complessiva, non di struttura. Nello specifico:

1. **Verifica reale, non sulla carta.** Apri il sito (usa la skill/il workflow di questo progetto per lanciarlo in locale, o uno screenshot reale a più larghezze: 390px, 768px, 1440px) e guardalo come lo guarderebbe un cliente che non sa nulla del piano dei 10 punti. Annota cosa stona, cosa sembra ancora un segnaposto, cosa è tecnicamente corretto ma esteticamente piatto.
2. **Il vuoto lasciato dalle foto mancanti.** Con 0 foto reali su 27 prodotti, oggi la home e il catalogo mostrano quasi solo riquadri editoriali di cortesia. Anche il miglior impianto di conversione non regge se il visitatore vede "segnaposto" invece di "capo che voglio comprare". Valuta se i riquadri di cortesia attuali comunicano abbastanza bene "arriviamo presto" oppure sembrano un sito abbandonato a metà — e se serve, proponi un modo migliore di gestire questo stato transitorio finché le foto reali non sono tutte caricate.
3. **Coerenza tra le pagine.** Con 7 famiglie tipografiche e un sistema a più livelli (carta/notte), il rischio concreto è che qualche pagina o sezione derivi dal sistema — un font usato nel posto sbagliato, un contrasto insufficiente, uno spazio bianco squilibrato. Fai un passaggio pagina per pagina (home, catalogo donna/uomo/curvy, scheda prodotto, checkout) cercando queste derive.
4. **La sensazione di "boutique vera", non di "sito e-commerce generico".** Arabesque è un negozio fisico a Busalla con una sua identità (Via Vittorio Veneto 154). Valuta se il sito comunica abbastanza questa specificità — persone reali, negozio reale, quartiere reale — o se invece potrebbe essere il sito di qualunque boutique. Guarda in particolare la sezione "negozio" e il footer.
5. **Priorità decisionale, come sempre:** impatto su conversione/ROI prima, chiarezza del messaggio poi, semplicità del percorso utente poi, estetica per ultima (e solo a supporto dei primi tre). Non proporre modifiche "belle ma inutili": ogni cambiamento deve avere uno scopo di conversione o di chiarezza dichiarato.

## Come lavorare
- Prima di scrivere codice per la revisione di design, presenta un elenco delle criticità trovate (con screenshot/riferimento a file e riga), ordinate per impatto, **massimo 3 raggruppamenti tematici** con una raccomandazione chiara su quale affrontare per primo.
- Per il flusso "carica foto → aggiorna prodotto", invece, procedi diretto man mano che ricevi materiale: non serve chiedere conferma per ogni singola foto, ma riepiloga periodicamente cosa hai aggiornato.
- Rispetta i budget di performance del README (LCP < 2,0s, CLS < 0,05, CSS < 110KB, JS < 90KB): se le foto reali iniziano a farli sforare, dillo subito e proponi la correzione (compressione, `srcset`, lazy loading) invece di lasciarlo peggiorare in silenzio.
- Mobile-first: la maggior parte del traffico di un negozio di paese arriva da telefono. Ogni modifica va verificata da 360px in su prima di essere considerata finita.
