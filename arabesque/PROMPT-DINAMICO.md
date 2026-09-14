# PROMPT — ARABESQUE BUSALLA: sito più dinamico
## Passerella di capi che scorre da sola + testo che si colora all'apertura

> Da incollare in una sessione nuova di Claude Code, nella root del repo `Apexmedia-website`.
> Il sito è in `arabesque/`, online su https://arabesque-busalla.vercel.app (branch `main`).

---

## 0. CONTESTO — LEGGI PRIMA DI TOCCARE CODICE

Il sito ha già un sistema di movimento completo: entrate 3D scaglionate (`.entra`), inclinazione
al mouse (`data-tilt`), parallasse a strati (`data-parallasse`), pulsanti con riflesso (`.btn`,
`.btn-cta`), barra di avanzamento della lettura, transizioni di pagina native. Tutto vive in
`main.js` e `movimento.js`, con le regole in `styles.css`.

**Prima di scrivere una riga** leggi `main.js`, `movimento.js`, `home.js` e le sezioni
`MOVIMENTO PREMIUM`, `HERO A STRATI`, `PULSANTI` in `styles.css` (cerca quei titoli nei
commenti). Non duplicare quello che c'è già: **estendi** il sistema esistente con lo stesso
stile di codice (funzioni piccole, italiano nei commenti e nei nomi, zero librerie esterne,
`prefers-reduced-motion` sempre rispettato).

Appena prima di questo prompt è stato corretto un bug reale: una card nell'hero era
dimensionata sulla larghezza con una proporzione che, su schermi bassi e larghi (telefono),
la rendeva più alta del suo contenitore — e siccome il contenitore non aveva un contenimento,
la card sforava sopra tutto il resto. **Lezione da applicare qui**: ogni nuovo elemento con
dimensioni calcolate in percentuale va sempre verificato sia su schermo alto-e-stretto (telefono
verticale) sia basso-e-largo (telefono in orizzontale, laptop con poca altezza) — non basta
provarlo su un solo formato. Ogni contenitore con figli che potrebbero eccedere ha
`overflow: hidden` o un contenimento equivalente.

---

## 1. LA PASSERELLA — capi che scorrono da soli

**Cosa chiede il cliente:** "un sistema che scorrevano i vestiti, tipo una passerella".

**Cosa c'è già:** `.passerella-pista` in `styles.css` e la logica di trascinamento in
`main.js` (funzione `passerella()`) — ma oggi **si muove solo se l'utente la trascina**. Va
aggiunto lo scorrimento automatico continuo.

**Cosa costruire — "vetrina viva":**
- Una fascia a scorrimento **automatico e infinito** (stile ticker, ma con le card dei capi
  invece che testo): la fila di capi scorre lenta e continua verso sinistra, e quando l'ultima
  card esce dal bordo destro, la sequenza si richiude senza scatti (si duplica la fila una
  volta, esattamente come già fa `.ticker-riga` con `@keyframes scorri` — stesso principio,
  applicato alle card prodotto invece che al testo).
- **Si ferma da sola** quando il puntatore è sopra (`:hover` → `animation-play-state: paused`,
  già presente su `.ticker:hover .ticker-riga`, va replicato) — altrimenti nessuno riesce a
  cliccare un capo mentre scorre.
- **Su telefono lo scorrimento automatico si ferma al primo tocco** e torna trascinabile a mano
  (usa la logica già scritta in `passerella()`): un capo che scorre da solo mentre provi a
  scegliere la taglia è frustrante, non "dinamico".
- **Velocità pensata, non a caso**: 40–70px al secondo. Più lenta di un ticker di testo, perché
  qui l'utente deve poter leggere prezzo e nome.
- Usa questa passerella automatica in **due punti**, non ovunque: la fascia "novità" in home
  (oggi trascinabile a mano — diventa automatica) e una nuova fascia sotto il footer o sopra le
  FAQ con il titolo "Le taglie che raramente si trovano" (curvy in evidenza). **Il catalogo vero
  e proprio (donna.html, uomo.html, curvy.html) resta una griglia statica**: lì l'utente deve
  poter confrontare e fermarsi a pensare, non essere inseguito da capi che si muovono.
- **`prefers-reduced-motion: reduce` ferma tutto**, mostrando la fila statica.
- **Attenzione alle prestazioni**: anima solo `transform` (mai `left`/`margin`), usa
  `will-change: transform` solo mentre l'animazione è attiva, e **metti in pausa l'animazione
  quando la fascia non è visibile** (`IntersectionObserver`, stesso pattern già usato per la
  seta dell'hero nella versione precedente del sito) — altrimenti su un catalogo con molte
  fasce il telefono scalda inutilmente.

**Verifica richiesta:** registra un breve video o controlla a occhio che lo scorrimento sia
fluido a 60fps su un telefono di fascia media (emulazione DevTools 4×), che si fermi al passaggio
del mouse e alla prima interazione su touch, e che i clic sui capi funzionino sempre.

---

## 2. IL TESTO CHE SI COLORA ALL'APERTURA

**Cosa chiede il cliente:** "una scritta si coloriva appena uno apre il sito".

**Interpretazione corretta (non letterale):** non tingere il testo a caso — usa il colore per
**guidare l'occhio verso la parola che vende**, nell'istante in cui la pagina appare. È una
tecnica editoriale: il titolo entra in inchiostro neutro, e **una sola parola o frase chiave si
accende in oro** un momento dopo, come una firma.

**Dove:** il titolo dell'hero (`<h1>Stile che veste <em>ogni</em> corporatura. Dalla XS alla
6XL.</h1>`) è il posto naturale — "ogni" è già in corsivo/oro fisso; ora la frase **"Dalla XS
alla 6XL"** (il vero differenziatore commerciale) diventa quella che si "accende":

1. Il titolo entra come già fa oggi (riga per riga, se questo pattern esiste — altrimenti in
   dissolvenza).
2. **Con un ritardo breve dopo l'entrata** (600–900ms), lo span che contiene "Dalla XS alla 6XL"
   passa da `color: var(--inchiostro)` a `color: var(--oro)` con una transizione di
   400–600ms — non un lampo, un'accensione morbida.
3. Contemporaneamente (o con un ritardo di 100ms) uno **sottile sottolineato dorato si disegna**
   sotto la stessa frase, da sinistra a destra (`background-size` animato o `clip-path`), a
   confermare "questa è la cosa importante".
4. **Succede una sola volta per visita** (non ogni volta che si torna in cima alla pagina con lo
   scroll) — un `sessionStorage` flag, stesso pattern già usato per l'annuncio in cima al sito.
5. Ripeti la stessa tecnica, con moderazione, in **massimo altri due punti**: l'occhiello
   "Boutique multimarca · Busalla" nell'hero (si accende il nome "Arabesque" se compare nel
   testo, altrimenti salta questo punto), e il manifesto curvy dove "5XL costa quanto la M" può
   accendersi allo scroll (lì già esiste `IntersectionObserver` sulla scala taglie — aggancia
   l'accensione allo stesso osservatore, non ne creare un secondo).

**Regola di disciplina, non negoziabile:** l'accensione cromatica è un evento **raro e
mirato** — se ogni titolo del sito si accende, l'occhio non sa più dove guardare e l'effetto
"premium" si rovescia in "esagerato". Massimo 3 punti in tutto il sito. Il resto del testo
resta fermo.

**Implementazione:** avvolgi la frase target in `<span class="si-accende">Dalla XS alla 6XL</span>`,
CSS con transizione su `color` e un pseudo-elemento `::after` per la linea, classe `.acceso`
aggiunta da JS con un `setTimeout` dopo che `.hero.entrato` (o equivalente) è già attivo.
`prefers-reduced-motion` → il testo è già oro fin da subito, senza transizione.

---

## 3. "SITO DINAMICO" — altri quattro innesti coerenti con quanto già costruito

Il cliente vuole più dinamismo in generale. Non aggiungere effetti a caso: questi quattro si
aggangiano a meccanismi **che esistono già** nel codice, quindi costano poco e restano coerenti.

1. **Il numero del prezzo conta verso l'alto** quando una card entra in vista (da 0 al prezzo
   vero, 500ms, easing già definito in `--e-soft`) — si aggancia allo stesso
   `IntersectionObserver` di `.entra`, non un secondo osservatore.
2. **Il monogramma nei riquadri segnaposto (`foto-vuota-m`) pulsa lievissimamente** una volta
   quando entra in vista — un microsegnale di vita nei placeholder, che oggi sono statici e
   "morti" finché non arrivano le foto vere.
3. **Lo scroll orizzontale della passerella lascia una scia**: mentre l'utente trascina a mano
   (touch), la card sotto il dito si solleva leggermente (`translateY(-4px) scale(1.02)`) — lo
   stesso linguaggio del `:hover` desktop, portato al tocco.
4. **La barra di avanzamento in alto** (`.avanzamento`, già esiste) guadagna un piccolo bagliore
   dorato in coda mentre si allunga, invece di restare un filo piatto — due righe di CSS
   (`box-shadow` che segue `scaleX`).

**Cosa NON fare:** non toccare la cassa (`checkout.html`) con nessuno di questi effetti — è la
pagina dove l'utente deve sentirsi al sicuro e concentrato, non intrattenuto. Non aggiungere
suoni. Non animare più di un elemento per volta nello stesso punto dello schermo.

---

## COME PROCEDERE

1. Leggi il codice esistente (sezione 0) prima di scrivere.
2. Punto 1 (passerella automatica) — è la richiesta esplicita più visibile, falla per prima.
3. Punto 2 (testo che si accende) — seconda richiesta esplicita.
4. Punto 3 — solo se il tempo lo consente, con la disciplina indicata (max 4 innesti, elencati).
5. Dopo ogni punto: prova nel browser **sia a 1440px sia a 390px di larghezza**, screenshot
   di entrambi, poi commit con messaggio che spiega il perché, non solo il cosa.
6. Fai girare la suite di controllo prima di pubblicare: nessuna sovrapposizione, nessuno
   scorrimento orizzontale involontario, `prefers-reduced-motion` verificato spegnendo tutto.

## REGOLE PERMANENTI DEL PROGETTO (non cambiano)

- Nessun framework, nessun build step, nessuna dipendenza esterna a runtime.
- Fondo chiaro (`--carta`), il nero (`--notte`) resta un accento in pochi blocchi.
- Ogni funzione nuova toglie un bivio all'utente, non ne aggiunge uno.
- `prefers-reduced-motion` sempre rispettato, contrasto AA sempre verificato.
- Se un effetto è bello ma non aiuta a capire o a comprare, non entra.

## OUTPUT ATTESO

1. Passerella con scorrimento automatico in almeno due punti della home, che si ferma su hover
   e al primo tocco.
2. La frase "Dalla XS alla 6XL" (o equivalente) che si accende in oro all'apertura della home,
   una sola volta a sessione.
3. Screenshot desktop e mobile di prima/dopo.
4. Riassunto finale di cosa è stato aggiunto e cosa eventualmente resta per una sessione futura.

**Procedi in autonomia. Non fermarti a chiedere conferme estetiche: decidi con lo stesso
criterio già usato nel resto del sito (chiaro, misurato, ogni animazione ha uno scopo) e
consegna lavoro finito.**
