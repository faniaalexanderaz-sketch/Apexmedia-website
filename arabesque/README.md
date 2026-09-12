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
| `styles.css` | Design system "Editorial Luxury" (nero ↔ panna) |
| `main.js` | Isola di navigazione, sipario, carrello, schede capo, seta WebGL, 3D |
| `home.js` | Contenuti dinamici della home: passerella, lookbook, hero |
| `api/*` | Funzioni serverless (Stripe, ordini, email, admin) |

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

## Foto (TODO-ASSET)

Le foto vanno nella cartella `foto/` in **WebP**, ritagliate **3:4** (consigliato 900 × 1200 px,
sotto i 200 KB). I nomi seguono lo slug del capo:

```
foto/cappotto-milano-1.webp    ← copertina (card e catalogo)
foto/cappotto-milano-2.webp    ← dettaglio
foto/cappotto-milano-3.webp    ← indossato
foto/cat-donna.webp  cat-uomo.webp  cat-curvy.webp
foto/look-1.webp  look-2.webp  look-3.webp
foto/curvy.webp  foto/negozio.webp
```

**Finché un file non esiste il sito non si rompe**: al suo posto compare il riquadro editoriale con
il monogramma. Appena carichi la foto, appare da sola. Nessuna immagine di repertorio è stata
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

Tutti concentrati in `config.js`, tranne dove indicato:

- [ ] Numero di telefono del negozio e **numero WhatsApp**
- [ ] Email di contatto
- [ ] **P. IVA / ragione sociale** (obbligatoria nel footer e nei termini)
- [ ] Orari di apertura reali
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
