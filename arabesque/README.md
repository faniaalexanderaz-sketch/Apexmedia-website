# Arabesque Busalla — e-commerce (base v1)

Sito e-commerce completo per **Arabesque Abbigliamento**, Via Vittorio Veneto 154, Busalla (GE).
HTML + CSS + JavaScript, **nessun framework e nessun build step**: quello che vedi nella cartella è
esattamente quello che va online. Funzioni serverless su Vercel per pagamenti, ordini ed email.

## Avvio in locale

```bash
cd arabesque
npx serve .          # oppure: python3 -m http.server 8099
```

Le funzioni `/api/*` non girano con un server statico: in quel caso la cassa passa da sola in
**modalità dimostrativa** (l'ordine si conclude, nessun addebito viene tentato). È voluto: il sito
si può mostrare al cliente prima di collegare Stripe.

## Struttura

| File | A cosa serve |
|---|---|
| `index.html` | Home: hero, categorie, più venduti, curvy, lookbook, negozio, FAQ |
| `donna.html` `uomo.html` `curvy.html` | Cataloghi con filtri (taglia, tipo, saldi, ordinamento) |
| `prodotto.html` + `prodotto.js` | Scheda capo: taglie, colori, guida taglie, correlati |
| `checkout.html` + `checkout.js` | Cassa in 3 passaggi, corriere o ritiro in negozio |
| `traccia-ordine.html` | Stato ordine con numero + email |
| `negozio.html` | Pagina del punto vendita |
| `admin.html` | Pannello interno: ordini, incasso, visite, stato ordine |
| `prodotti.js` | **Il catalogo**: unica fonte dati di tutto il sito |
| `config.js` | Dati del negozio (telefono, WhatsApp, orari, P. IVA) |
| `styles.css` | Design system "Galleria chiara" (carta, inchiostro, oro) |
| `main.js` | Isola di navigazione, sipario, carrello, schede capo, seta WebGL, 3D |
| `home.js` | Contenuti dinamici della home: passerella, lookbook, hero |
| `api/*` | Funzioni serverless (Stripe, ordini, email, admin) |

## Stato dei dieci interventi (piano in `PROMPT-V2-CHIARO.md`)

| # | Intervento | Stato |
|---|---|---|
| 1 | Ribaltamento cromatico verso il chiaro | ✅ fatto |
| 2 | Home riordinata per la conversione | ✅ fatto |
| 3 | Catalogo completo (80-120 capi) | ⏸ attende listino e foto del cliente |
| 4 | Scheda prodotto che chiude la vendita | ✅ fatto |
| 5 | Cassa a pagina unica con pagamenti espressi | ✅ fatto |
| 6 | Ricerca istantanea e navigazione | ✅ fatto |
| 7 | Prova sociale onesta | ✅ fatto (recensioni nascoste finché non sono vere) |
| 8 | Velocità e mobile | ✅ fatto e misurato |
| 9 | Misurazione e imbuto | ✅ fatto (mancano gli ID di GA4 e Meta) |
| 10 | Contenuti veri e SEO locale | ⏸ attende foto e dati del cliente |

## Palette

```
--carta #FBFAF7 · --carta-2 #F4F1EA · --carta-3 #EAE5DA · --bianco #FFFFFF
--inchiostro #16150F · --grafite #5C5850 · --fumo #8C8780
--oro #A8842C (leggibile su chiaro) · --oro-luce #D9BE7E (solo su scuro)
--notte #14131A (tre soli blocchi: manifesto taglie, negozio, piè di pagina)
```

## Prestazioni misurate

Misurate con Chromium a 390 px su rete 4G simulata (1,6 Mbps, 150 ms) e processore rallentato
4×, **senza foto reali** (caricando le foto il peso cresce: usare AVIF/WebP e `srcset` come
indicato sotto).

| Pagina | LCP | CLS | Peso |
|---|---|---|---|
| Home | 1.960 ms | 0,017 | 453 KB |
| Catalogo | 1.852 ms | 0,003 | 437 KB |
| Scheda capo | 2.060 ms | 0 | 360 KB |

Budget da non superare: LCP < 2,0 s · CLS < 0,05 · CSS < 110 KB · JS < 90 KB.
Oggi: CSS 95 KB, JS della home ~82 KB. **La scheda capo sta 60 ms sopra il budget LCP**: il
prossimo intervento è ridurre Oswald (27,8 KB per sole etichette maiuscole: un sottoinsieme
pesa 18 KB).

> I valori indicati in precedenza in questa tabella (856/704/900 ms, CLS 0) non erano
> riproducibili. La misura reale prima degli interventi del 15/09 era LCP 1.832/1.728/1.936 ms
> e **CLS 0,112 / 0,557 / 0,919**: catalogo e scheda capo nascevano come contenitori vuoti e
> il piè di pagina veniva spinto giù di quasi una videata quando il JS riempiva. Sistemato
> prenotando lo spazio (`#pdp:empty`, `#griglia:empty`, `#filtri:empty` in `styles.css`) e
> precaricando i due caratteri che riflavano il testo sopra la piega (Italiana e Oswald).

## Sistema tipografico

Sette famiglie, ognuna con un mestiere preciso — servite dal sito, nessuna chiamata esterna
(velocità e conformità GDPR):

| Carattere | Dove vive |
|---|---|
| Bodoni Moda | titoli, nomi dei capi, voci del menu |
| Instrument Serif | corsivi editoriali e accenti nei titoli |
| Geist | interfaccia, testo corrente, bottoni |
| Archivo (asse width) | manifesti e numeri giganti (scala XS→6XL) |
| Oswald | ticker, etichette, badge, micro-navigazione |
| JetBrains Mono | dati: prezzi, taglie, numeri d'ordine, riferimenti |
| Italiana | occhielli di sezione e logotipo |

La regola: **un ruolo per carattere**. Se un testo nuovo non rientra in nessuno di questi ruoli,
va in Geist. Mescolarli fuori dai ruoli è l'unico modo per rovinare il sistema.

## Aggiungere o modificare un capo

Tutto avviene in `prodotti.js`. Un capo è un oggetto:

```js
{
  slug: 'cappotto-milano',              // usato nell'URL e nei nomi delle foto
  nome: 'Cappotto doppiopetto Milano',
  categoria: 'donna',                   // donna | uomo | accessori
  sottocategoria: 'capispalla',
  linea: ['curvy','novita','cerimonia'],// etichette, tutte facoltative
  prezzo: 189,
  sconto: 20,                           // facoltativo, in percentuale
  colori: [{ nome: 'Nero', hex: '#0B0B0C' }],
  taglie: T([['XS',2],['S',4],['M',5]]),// taglia e pezzi disponibili
  materiali: '...', vestibilita: '...', descrizione: '...'
}
```

Una taglia con `0` pezzi appare barrata e non si può comprare. Il capo con tutte le taglie a zero
mostra "Esaurito" e il pulsante "Avvisami quando torna".

## Il sistema di movimento e le dieci aggiunte di design

| # | Aggiunta | Dove vive |
|---|---|---|
| 1 | Griglia editoriale a 12 colonne con rotture e sfori | `.griglia12`, `.sfora-destra` — home, sezione categorie |
| 2 | Scala tipografica modulare (1.25) e ritmo su 8px | `--t-1…--t-9`, `--s-1…--s-8` |
| 3 | Hero a tre strati con parallasse | `.hero-strati`, `movimento.js` → `parallasse()` |
| 4 | Transizioni di pagina native (View Transitions) | `@view-transition`, `movimento.js` → `transizioni()` |
| 5 | Racconto del capo a scorrimento agganciato | `prodotto.js` → sezione `.racconto`, sagome generate |
| 6 | Inserti editoriali nella griglia prodotti | `catalogo.js` → `INSERTI` |
| 7 | Nota cromatica per sezione | `body[data-sezione]` → `--accento` |
| 8 | Scheletri, stato vuoto curato, miniatura che vola | `.scheletro`, `.vuoto-curato`, `movimento.js` → `vola()` |
| 9 | Anteprima rapida dal catalogo | `movimento.js` → `apriSbircia()` |
| 10 | Direzione artistica dei segnaposto per categoria | `main.js` → `SEGNI`, `.foto-vuota.v-*` |

**Movimento:** entrate 3D scaglionate (il ritardo lo calcola la posizione nella griglia, non una
classe scritta a mano), inclinazione al mouse sulle schede, barra di avanzamento della lettura,
CTA che respira una volta quando entra in vista. Tutto su `transform` e `opacity`: CLS resta 0.
`prefers-reduced-motion` spegne ogni animazione.

**Pulsanti:** pillola con icona annidata, riflesso che attraversa al passaggio, sollevamento e
pressione. La classe `.btn-cta` è la chiamata all'azione principale — una sola per schermata.

## Cosa fa il sito, in concreto

- **Ricerca istantanea** (icona in alto, o `/` da tastiera): cerca per nome, categoria, colore e taglia.
- **Stima di consegna vera**: calcolata dal giorno e dall'ora, esclusi weekend e festivi italiani.
  "Ordina entro le 15:00 e parte oggi" compare solo quando è vero.
- **Cassa a pagina unica**: pagamenti espressi in cima, tre blocchi in sequenza, riepilogo sempre
  visibile, provincia compilata dal CAP, errori che spiegano come si risolvono.
- **Carrello abbandonato**: email e contenuto salvati appena il cliente inserisce l'indirizzo
  (tabella `carrelli_aperti`: da lì parte il recupero).
- **Prenota in negozio**: il cliente fa mettere da parte un capo per 48 ore; arriva una mail al
  negozio e una a lui.
- **Pannello interno con imbuto**: visite → carrello → cassa → acquisti, abbandono cassa,
  scontrino medio, richieste "avvisami quando torna" (la lista della spesa per il riordino).

## Foto (TODO-ASSET)

Le foto vanno nella cartella `foto/` in **WebP** (o AVIF), ritagliate **3:4** (consigliato
900 × 1200 px, sotto i 200 KB). I nomi seguono lo slug del capo — la scheda prodotto ne usa
fino a quattro:

```
foto/cappotto-milano-1.webp    ← copertina (card e catalogo)
foto/cappotto-milano-2.webp    ← dettaglio
foto/cappotto-milano-3.webp    ← indossato
foto/cat-donna.webp  cat-uomo.webp  cat-curvy.webp
foto/look-1.webp  look-2.webp  look-3.webp
foto/curvy.webp  foto/negozio.webp
```

**Finché un file non esiste il sito non si rompe**: al suo posto compare il riquadro editoriale con
il monogramma e la dicitura **"Foto in arrivo"** — un rettangolo muto si legge come "sito
abbandonato", la stessa superficie con una riga che spiega si legge come "collezione in
caricamento". La dicitura non compare sulle tessere di navigazione, sulle miniature e sul
fondale dell'hero, dove il riquadro è una superficie e non un prodotto assente. Appena carichi
la foto, appare da sola. Nessuna immagine di repertorio è stata
inserita: le foto devono essere quelle reali dei capi del negozio.

## Messa online (Vercel)

1. Collega la cartella a un progetto Vercel.
2. Imposta le variabili d'ambiente:

| Variabile | Serve per |
|---|---|
| `STRIPE_SECRET_KEY` | Pagamenti con carta, PayPal, Apple/Google Pay |
| `STRIPE_WEBHOOK_SECRET` | Registrazione ordine dopo il pagamento |
| `DATABASE_URL` | Database Neon/Postgres (ordini, iscritti, visite) |
| `SENDGRID_API_KEY` + `SENDGRID_FROM` | Email di conferma ordine e codice sconto |
| `ADMIN_PASSWORD` | Accesso a `/admin.html` |

3. In Stripe aggiungi il webhook su `https://<dominio>/api/stripe-webhook`, evento
   `checkout.session.completed`.

Le tabelle del database si creano da sole al primo utilizzo: nessuna migrazione manuale.

## TODO-CLIENTE — dati da farsi confermare prima della pubblicazione

**Come funziona adesso:** in `config.js` un campo non confermato resta **vuoto** (`''`). Il
sito non scrive mai un valore di comodo: `config.js` sta nella testa del documento e marca
`<html>` con `senza-telefono`, `senza-whatsapp`, `senza-email`, `senza-piva`,
`senza-instagram`; gli elementi che conterrebbero quel dato non vengono proprio disegnati
(niente numero finto, niente salto di layout). I link "Chiedi su WhatsApp" non spariscono:
diventano "Contatta il negozio" e portano a `negozio.html`. **Appena scrivi il dato vero in
`config.js` tutto ricompare da solo**: nessun'altra modifica da fare.

Finché mancano, al cliente non appaiono: il numero di telefono e il bottone "Chiama il
negozio", il bollino fisso WhatsApp, l'icona Instagram, la riga della P. IVA nel piè di pagina.

Tutti concentrati in `config.js`, tranne dove indicato:

- [ ] Numero di telefono del negozio e **numero WhatsApp**
- [ ] Email di contatto
- [ ] **P. IVA / ragione sociale** (obbligatoria nel footer e nei termini)
- [ ] Orari di apertura reali — *gli orari attuali sono plausibili ma non confermati e sono
      visibili*: è l'unico dato non verificato che il sito mostra, va confermato per primo
- [ ] Link Instagram
- [ ] Marchi trattati → funzione `arbBrand()` in `prodotti.js` (ora: "Selezione Arabesque")
- [ ] Listino, nomi e disponibilità reali dei capi → `prodotti.js`
- [ ] Recensioni Google reali → sezione "Dicono di noi" in `index.html` (ora sono segnaposto)
- [ ] Tabella taglie reale dei capi trattati → `curvy.html` e guida taglie in `prodotto.js`
- [ ] Corriere, tempi e costi di spedizione effettivi → `resi-spedizioni.html`
- [ ] Verifica legale di `privacy.html`, `cookie-policy.html`, `termini.html`

## Misurazione (da attivare dopo il consenso cookie)

`cookie.js` espone `window.ARB_CONSENSO`. GA4 e Meta Pixel vanno caricati **solo** quando è `true`.
Eventi da mandare: `view_item`, `select_size`, `add_to_cart`, `begin_checkout`, `purchase`,
`whatsapp_click`, `pickup_selected`, `newsletter_signup`.

## I 5 test da fare dopo il lancio

1. **Headline della home**: "Stile che veste ogni corporatura" vs "Dalla XS alla 6XL, a Busalla".
2. **Ritiro in negozio in evidenza** nella scheda prodotto (ora è il secondo pulsante) vs nascosto in cassa.
3. **Soglia spedizione gratuita** a 79 € vs 59 €: incide su conversione e scontrino medio.
4. **WhatsApp fisso** su mobile: misurare quanti contatti porta e quanti ordini chiude.
5. **Popup newsletter** ritardato a 20 secondi vs blocco fisso a fine pagina (oggi: blocco fisso).
