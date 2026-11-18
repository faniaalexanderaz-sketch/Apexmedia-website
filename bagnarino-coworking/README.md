# Bagnarino Coworking

Web app del coworking di Bagnarino S.r.l., corso Lamarmora 46, Alessandria:
sito pubblico, prenotazione su richiesta con conferma, Bagnarino Card, app di gestione
installabile per la titolare, misurazione per le campagne.

HTML + CSS + JavaScript vanilla, **nessun framework e nessun build step**.
Funzioni serverless Vercel in `api/`, database Neon Postgres, email Resend, notifiche Web Push.

**Come funziona il coworking:** non ha orari fissi. È aperto tutti i giorni, sabato e domenica
compresi, **solo su prenotazione**. Dal sito il cliente manda una *richiesta* (giorno + fascia:
mattina, pomeriggio o giornata intera). La titolare, Marcella, risponde *Conferma* o
*Non disponibile*: il posto è del cliente solo dopo la conferma. I giorni e le mezze giornate
in cui deve chiudere li segna lei dall'app.

**Regola d'oro:** se manca una variabile d'ambiente il sito non si rompe. Senza database
torna da solo in modalità dimostrativa (le richieste si inviano su WhatsApp), senza chiave
email salva tutto ma non manda email, senza chiavi VAPID non partono le notifiche push
(restano le email).

## Design

Direzione "carta e inchiostro, Olivetti 1983": il sito deve sembrare stampato, non generato. Carta avorio, inchiostro blu,
un solo accento ocra (quello del logo) e un rosso da timbro usato soltanto sui timbri della Bagnarino Card.

- **Font** (ospitati in `fonts/`, nessun servizio esterno): *Fraunces* per titoli e numeri grandi (asse ottico alto, corsivo come accento);
  *Hanken Grotesk* per testi e interfaccia (la grotesk della grafica Olivetti); *IBM Plex Mono* per etichette, numeri di sezione e codici
  (la macchina per scrivere).
- **Colori**: notte `#111922`, inchiostro `#1B2A3A`, ocra `#C9973B`, timbro `#B4302A` (solo Card), carta `#F1EBE0`, avorio `#FAF6EE`.
  Filetti sottili al posto dei bordi delle card, angoli da 4 px, niente ombre 3D né gradienti di sfondo.
- **Foto** in `img/foto/`: `esterno-*.webp` è l'ingresso vero; `sala-coworking-*.webp` e `sala-stampa-*.webp` sono la sala vera
  ritoccata per mostrare le scrivanie. Sono le uniche tre foto del sito (apertura, negozio, spazio) e lo dice la nota in fondo alla pagina.
  Quando arriva il servizio fotografico si sostituiscono con gli stessi nomi e misure: vedi la lista qui sotto.
- **Animazioni**: l'apertura è in CSS e parte subito. GSAP + ScrollTrigger (`vendor/gsap/`) si caricano al primo gesto e fanno quattro cose:
  il filo della storia che si traccia scorrendo (la firma), le foto che si scoprono a tendina, i timbri che si pressano sulla card,
  una comparsa quasi impercettibile delle sezioni. Con "riduci movimento" tutto resta fermo e leggibile.

### Foto da scattare (per il nuovo layout)

Tutte orizzontali 4:3 salvo dove indicato, luce naturale, nessuna persona riconoscibile (o con liberatoria). Esportare in WebP
con gli stessi nomi dei file attuali, alle larghezze indicate.

| File | Inquadratura | Dove compare |
|---|---|---|
| `sala-coworking-720/1280.webp` | La sala dall'ingresso: scrivanie in primo piano, finestra sul fondo, stampanti a destra. Sul telefono viene ritagliata 4:3, sul computer 4:5 (tenere il soggetto al centro) | Apertura (foto principale) e sezione "Lo spazio" |
| `sala-stampa-720/1280.webp` | Dal fondo della sala verso l'angolo stampa: postazioni vicino alla finestra e le multifunzione Olivetti | "Lo spazio" (foto grande) |
| `esterno-560/960.webp` | L'ingresso di corso Lamarmora 46, quadrata 1:1, con le insegne e i vasi rossi; scattare di giorno con la porta aperta | "Il negozio" |
| `email-testata.jpg` | Ritaglio orizzontale 1120×470 della foto della sala (si genera dalla prima) | Testa delle email |
| `og-bagnarino-coworking.jpg` | 1200×630: la sala con il logo in sovraimpressione | Anteprima sui social e su WhatsApp |

Scatti utili in più (facoltativi, per aggiornamenti futuri): un dettaglio di una scrivania con il computer e la lampada;
la Bagnarino Card vera stampata, con un timbro; Marcella al banco del negozio (serve il suo ok).

## Provarlo in locale

```bash
cd bagnarino-coworking
npm install
npm run locale      # sito + API + database in memoria → http://localhost:3000
npm test            # test del motore di prenotazione
```

`npm run locale` usa un Postgres in memoria (PGlite): niente da configurare, si azzera a
ogni riavvio. Le email non partono: vengono catturate e si leggono su http://localhost:3000/__posta.
App di gestione: http://localhost:3000/gestione. Titolare: email `info@bagnarino.it`, password `prova`. Apex Media: email `studio@infoapex.eu`, password `apex-prova`.

Prova completa da telefono simulato (serve Playwright): con il server acceso su `PORT=3311`,
`xvfb-run -a node strumenti/prova-completa.js`.
Solo il sito statico, in modalità dimostrativa: `npx serve bagnarino-coworking`.

## Struttura

| File | A cosa serve |
|---|---|
| `config.js` | **Valori di partenza**: azienda, contatti, fasce, prezzo della mezza giornata, postazioni, listino, fidelity, avviso, foto, testi WhatsApp, codici GA4/Meta. Lo leggono sia il sito sia le API |
| `index.html` | Home: apertura, prenota, negozio, listino, **come funziona** (aperto tutti i giorni su prenotazione), spazio, Bagnarino Card, per chi è, dove siamo, FAQ, chiusura |
| `prenota.html` + `prenota.js` | Richiesta in 3 passi: formula → giorno e fascia → dati. Schermata finale "Richiesta ricevuta" |
| `prenotazione.html` + `gestisci.js` | "La mia prenotazione": stato (in attesa, confermata…) e annullamento con codice + email |
| `card.html` + `tessera.js` | "La mia Bagnarino Card": timbri, omaggi, carnet |
| `gestione-app.js` + `gestione-app.css` + `sw-gestione.js` + `gestione.webmanifest` | **App di gestione** (`/gestione`), installabile: richieste, calendario, sito, "Come va" (clienti, social, Google, pubblicità), clienti, incassi, prezzi. Le pagine le serve `api/gestione.js` dopo aver controllato la sessione. La vecchia area `/admin` non esiste più: rimanda qui |
| `main.js` | Script comune: config, posti liberi, avviso, foto, WhatsApp, eventi di misurazione, dati strutturati |
| `cookie.js` | Banner cookie (solo se ci sono codici GA4/Meta), Consent Mode v2 |
| `api/` | Funzioni serverless (vedi sotto). I file che iniziano con `_` sono moduli interni |
| `test/` | Test `node:test` su Postgres in memoria |
| `strumenti/server-locale.js` | Server di prova locale |
| `strumenti/prova-completa.js` | Prova completa dal sito e dall'app, a 390px e su un Android piccolo (360 e 320px) |
| `GUIDA-TITOLARE.md` | Guida di una pagina per Marcella |

### API

| Indirizzo | Cosa fa |
|---|---|
| `GET /api/disponibilita?da=&giorni=&pacchetto=` | Posti liberi per giorno e per fascia; `nd` elenca le fasce non disponibili (chiuse o non più richiedibili per oggi) |
| `POST /api/prenota` | Valida, tiene da parte la postazione in una transazione, salva la richiesta **in attesa**, manda email al cliente, email e notifica alla titolare, Meta CAPI |
| `GET /api/prenotazione`, `POST /api/annulla`, `/api/vantaggi`, `/api/card` | Area cliente (un'unica funzione `api/cliente.js`) |
| `GET /api/impostazioni` | Le modifiche fatte dall'app, applicate al sito (in cache 30 s) |
| `/gestione`, `/gestione/accedi`, `/gestione/password`, `/gestione/installa`, `/gestione/risposta` | Pagine dell'app, servite da `api/gestione.js` |
| `/api/gestione?azione=…` | Azioni dell'app: accesso, risposta alle richieste, chiusure, sito, notifiche, e quello che prima stava in `/api/admin` (`come-va`, `clienti`, `cliente`, `incassi`, `elenco` = CSV, `pagato`, `prenotazione-nuova`, `coworking` = prezzi/posti/messaggi, `numeri-mese` solo per Apex Media). Senza sessione rispondono 401 |
| `GET /api/foto?id=&t=p\|g` | Le foto caricate dall'app |
| `/api/cron?compito=promemoria\|riepilogo\|report\|attese` | Lanciati da Vercel Cron |
| `POST /api/pagamento` | Stripe Checkout, **spento** finché manca `STRIPE_SECRET_KEY` |
| `/sitemap.xml`, `/robots.txt` | Generati da `api/seo.js` con il dominio di `SITO_URL` |

Le funzioni sono 10: il piano gratuito di Vercel ne ammette 12 per progetto.

### Database (si crea e si aggiorna da solo al primo utilizzo)

`postazioni`, `clienti`, `prenotazioni`, `carnet`, `fidelity`, `chiusure`, `eventi`, più:
`occupazioni` (una riga per scrivania, giorno e mezza giornata, con chiave unica: due persone sullo
stesso posto nello stesso momento sono impossibili anche con richieste simultanee), `tentativi`
(anti-spam, solo impronte cifrate degli IP), `impostazioni` (modifiche fatte dall'app),
`utenti`, `sessioni`, `recuperi` (accesso all'app), `push_iscrizioni` (telefoni che ricevono le
notifiche), `foto` (galleria caricata dall'app).

Lo schema ha una versione (`VERSIONE_SCHEMA` in `api/_db.js`): quando cambia, al primo avvio girano
i comandi e i passaggi di `migra()`, che controllano da soli se sono già stati fatti.

### Regole del motore

- **Richiesta e conferma**: ogni prenotazione dal sito nasce `in_attesa`. Il posto viene tenuto da parte subito (niente doppie richieste sullo stesso posto) ma è del cliente solo quando la titolare conferma. "Non disponibile" libera il posto e restituisce l'eventuale ingresso del carnet. Le prenotazioni inserite a mano dalla titolare nascono già confermate.
- **Fasce**: mattina, pomeriggio, giornata intera. La stessa scrivania può servire una persona la mattina e un'altra il pomeriggio. Mezza giornata: `prezzoMezzaGiornata` in `config.js` (€12).
- **Aperto tutti i giorni**: sabato, domenica e festivi compresi. Un giorno o una mezza giornata non sono richiedibili solo se la titolare li ha chiusi dall'app (sul sito: "Non disponibile"). Per il giorno stesso ogni fascia smette di essere richiedibile a una certa ora (`fasce[].ultimaRichiestaOggi` in `config.js`), che sul sito non compare.
- **Giornata**: un posto per un giorno (o mezza giornata). **Carnet**: 10 ingressi, il primo nel giorno scelto, validi 3 mesi dal primo ingresso; ogni giornata intera successiva prenotata con la stessa email + cellulare scala un ingresso (costo €0).
- **Mese flessibile**: un posto ogni giorno non chiuso per un mese (preferibilmente lo stesso). **Mese fisso**: la stessa scrivania per tutto il mese.
- **Bagnarino Card**: ogni giornata intera pagata (singola o da carnet) segnata "È arrivata/o" vale un timbro; al 10° timbro una giornata in omaggio. Mezze giornate e abbonamenti mensili non raccolgono timbri.
- **Annullamento**: una richiesta in attesa si ritira quando si vuole; una prenotazione confermata fino alle 20:00 del giorno prima (`config.js` → `disdetta.ora`). Dopo, solo la titolare.
- La stessa persona non può occupare due scrivanie lo stesso giorno.
- **Anti-spam**: campo trappola, massimo 8 tentativi l'ora per IP, controllo email/telefono lato server.

### Email e notifiche

| Quando | A chi | Cosa |
|---|---|---|
| Richiesta inviata | cliente | "Abbiamo ricevuto la tua richiesta, ti confermiamo a breve" con il riepilogo |
| Richiesta inviata | titolare | Email semplicissima con due pulsanti (*Conferma*, *Non disponibile*) + notifica push |
| In attesa da più di 2 ore | titolare | Promemoria (email + push), una volta sola, mai di notte |
| Confermata | cliente | "Prenotazione confermata, ti aspettiamo [giorno] [fascia]", indirizzo, come arrivare, appuntamento allegato |
| Non disponibile | cliente | "Purtroppo in quella fascia lo spazio non è disponibile…" con il link diretto al calendario |
| Annullata dalla titolare dopo la conferma | cliente | Scuse e link per riprenotare |

I pulsanti nell'email della titolare funzionano senza accesso: sono link firmati (HMAC, `LINK_SECRET`),
valgono 7 giorni e solo finché la richiesta è in attesa. Tutte le email al cliente hanno il
reply-to sull'indirizzo della titolare.

## Prima di pubblicare

Lancia `python3 strumenti/versiona.py`: aggiunge `?v=<impronta>` a CSS e JS nelle pagine, così i telefoni non usano lo stile vecchio dalla memoria (prima capitava di vedere la pagina nuova con lo stile vecchio).

## Web app (telefono)

- Barra a schede in basso su tutte le pagine pubbliche: **Home · Prezzi · Richiedi · Le mie · Contatti**. Nel flusso di richiesta resta solo la barra con il prezzo e il pulsante.
- Menu (☰) in alto a destra con tutte le sezioni e i contatti. Su computer il menu è in testata.
- "Le mie": il telefono ricorda l'ultima richiesta fatta (localStorage `bgn-ultima`) e la mostra subito, con il pulsante della **Bagnarino Card**.
- Codice ed email arrivati dal link nell'email vengono tolti dall'indirizzo, così non finiscono nelle statistiche.
- Installabile come app: `site.webmanifest` (clienti).

## App di gestione della titolare (`/gestione`)

Pensata per una persona poco pratica di tecnologia: testo da 18px in su, pulsanti alti almeno 56px,
una cosa importante per schermata, parole semplici.

- **Installabile** (PWA): `gestione.webmanifest` (nome "Bagnarino", `display: standalone`), icone in `img/app/`, service worker `sw-gestione.js`. Istruzioni illustrate su **`/gestione/installa`**: Android per primo (è il telefono della titolare), iPhone come seconda scheda. Su Android, quando Chrome lo permette, compare anche il pulsante "Installa l'app adesso" (`beforeinstallprompt`).
- **Accesso**: email + password una volta, sessione di 90 giorni (cookie HttpOnly, nel database solo l'impronta). Recupero password via email. Gli accessi nascono da soli: la **titolare** con l'email di `NOTIFICATION_EMAIL` e la password di `ADMIN_PASSWORD`; **Apex Media** (ruolo `apex`) con l'email di `APEX_EMAIL` (se manca, `studio@infoapex.eu`) e la password di `APEX_PASSWORD`. Fanno le stesse cose; solo Apex Media aggiorna i numeri di social, Google e pubblicità.
- **Protetta lato server**: le pagine le serve `api/gestione.js` solo con una sessione valida, le azioni rispondono 401 senza sessione e accettano solo POST con l'intestazione `X-Bgn-App`.
- **Notifiche push** (Web Push, chiavi VAPID). In Impostazioni c'è il pulsante "Attiva le notifiche". Su Android funzionano con Chrome (servono i servizi Google sul telefono); se sono spente o Chrome è troppo vecchio l'app lo dice e rimanda a `/gestione/installa#notifiche` ("Se le notifiche non arrivano": Chrome da aggiornare, notifiche spente, risparmio batteria). Su iPhone funzionano solo con l'app sulla schermata Home (iOS 16.4+). L'email con i due pulsanti arriva sempre, anche senza notifiche.
- **Telefoni Android non recenti**: `gestione-app.css`, `gestione-app.js` e `sw-gestione.js` sono scritti per girare anche su Chrome di qualche anno fa. Regole da rispettare quando si modificano: JavaScript ES5 (niente frecce, `const`, `let`), niente `gap` nei contenitori flex (margini sui figli), `grid-gap` accanto a `gap`, niente `inset`, `min()` o `place-items`, un valore semplice prima di ogni `env()`. Le foto scattate in verticale vengono raddrizzate a mano dove il browser non lo fa da solo.
- **Schermate**: *Oggi* (richieste da confermare, chi arriva oggi e domani, "Oggi sono chiusa"), *Calendario* (mese, chiusure per giorno o mezza giornata, "Chiudi più giorni"), *Prenotazioni* (da confermare, confermate, passate; "Aggiungi una prenotazione" per chi telefona; Chiama e WhatsApp; "Ha pagato"), *Sito* (avviso in home, foto, telefono e WhatsApp). Dall'omino in alto: *Come va*, *Clienti*, *Incassi*, *Impostazioni* (notifiche, prezzi, quanti posti, messaggi di WhatsApp, password).
- Del sito si cambiano solo i contenuti (avviso, foto, telefono) e i prezzi: mai layout, colori o sezioni. Prezzi e numero di posti chiedono una conferma. Le foto vengono ridotte sul telefono (1440 e 720 px) prima del caricamento.

## Come va (statistiche nell'app)

Schermata **Come va** dell'app (omino in alto a destra): come sta andando il coworking, un mese alla volta e negli ultimi 12 mesi. Prima era la scheda "Crescita" di `/admin`.

- **Numeri automatici** dal database: prenotazioni, incassato e prenotato, nuovi clienti, clienti che tornano, arrivati / non venuti, prenotazioni per canale (stessa classificazione di "Da dove arrivano le prenotazioni").
- **Numeri a mano** (tabella `marketing_mesi`, uno per mese): follower e persone raggiunte su Instagram/Facebook, visualizzazioni, chiamate, indicazioni e clic dal profilo Google, recensioni (numero e media), visite al sito, contatti WhatsApp, spesa Meta e Google, nota "Cosa abbiamo fatto questo mese". **Nessuna chiave API**: li inserisce Apex Media.
- In cima una frase in italiano semplice generata dai numeri e tre numeri grandi (prenotazioni, euro prenotati, clienti nuovi) con il confronto in parole sul mese prima. Sotto, "Da vicino": *Da dove arrivano i clienti* (canali e percorso social → sito → richiesta → arrivo), *Instagram e Facebook*, *Google e chiamate*, *Pubblicità*, *Mese per mese*. Niente grafici: righe con una barra, leggibili anche su un telefono vecchio.
- **Costo per prenotazione** = spesa pubblicitaria del mese ÷ tutte le prenotazioni del mese. **Ritorno della pubblicità** = valore delle prenotazioni arrivate da Instagram, Facebook e Google Ads ÷ spesa.
- **Due accessi alla stessa app**: la titolare vede tutto in sola lettura; Apex Media in più ha il pulsante "Aggiorna i numeri di <mese>" (azione `numeri-mese`, 403 per la titolare).
- Come aggiornare i numeri: entra in `/gestione` con l'accesso di Apex Media → omino → Come va → scegli il mese con le frecce → "Aggiorna i numeri di <mese>" (si possono lasciare campi vuoti; numeri all'italiana, es. 1.234 o 4,6; "Riprendi i numeri di <mese prima>" per partire da quelli).

## Variabili d'ambiente su Vercel

| Variabile | Obbligatoria | A cosa serve |
|---|---|---|
| `DATABASE_URL` | sì, per le prenotazioni vere | Neon Postgres (Vercel → Storage → Neon la imposta da sola) |
| `NOTIFICATION_EMAIL` | sì | **L'unico punto in cui è scritto l'indirizzo della titolare** (`info@bagnarino.it`): riceve richieste, promemoria, annullamenti, riepilogo serale e report; è il reply-to delle email al cliente e l'email di accesso all'app |
| `ADMIN_PASSWORD` | sì | Password iniziale della titolare nell'app di gestione (poi la cambia lei da "Password dimenticata") |
| `LINK_SECRET` | sì, per i pulsanti nelle email | Firma i link *Conferma* / *Non disponibile* (in mancanza si usa `CRON_SECRET`) |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | per le notifiche push | Chiavi Web Push. Si generano con `npx web-push generate-vapid-keys` |
| `APEX_PASSWORD` | per i numeri di "Come va" | Password iniziale di Apex Media nell'app di gestione. `APEX_EMAIL` (facoltativa) è l'email con cui entra: se manca, `studio@infoapex.eu` |
| `CRON_SECRET` | sì, per i promemoria | Protegge `/api/cron` (Vercel la invia da solo) |
| `RESEND_API_KEY`, `EMAIL_FROM` | per le email | Chiave Resend e mittente su dominio verificato (oggi `bagnarinocoworking.it`). `EMAIL_FROM_NOME` facoltativa |
| `SENDGRID_API_KEY` | alternativa a Resend | Funziona ancora |
| `REPORT_EMAIL` | facoltativa | Altri destinatari del report mensile (es. Apex Media), separati da virgola |
| `SITO_URL` | sì | `https://bagnarinocoworking.it`, senza barra finale |
| `META_PIXEL_ID`, `META_CAPI_TOKEN` | per le campagne | Conversions API lato server. `META_TEST_CODE` per i test in Gestione eventi |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | facoltative | Avvisi anche su Telegram |
| `NOTIFICHE_WHATSAPP=1`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_TO` | facoltative | Avvisi via WhatsApp Business Cloud API |
| `STRIPE_SECRET_KEY` | facoltativa | Accende il pagamento online (manca ancora il webhook "pagato") |

Codici **GA4** e **Meta Pixel** lato browser: in `config.js` (`ga4`, `metaPixel`). Partono solo dopo il consenso cookie.

## Operazioni comuni

- **Chiudere un giorno o una mezza giornata**: app di gestione → Calendario (o "Oggi sono chiusa"). I festivi **non** si chiudono da soli: nel calendario dell'app sono segnati, li chiude la titolare.
- **Avviso in home, foto dello spazio, telefono e WhatsApp**: app di gestione → Sito. Sul sito entro un minuto.
- **Cambiare prezzi, numero di posti, messaggi WhatsApp**: app di gestione → omino → Impostazioni → "Il coworking". `config.js` resta il valore di partenza.
- **Accendere sala riunioni, caffè, climatizzazione, recensioni**: `config.js` (`sala.attiva`, `servizi`, `recensioniAttive`).

## Compiti automatici (Vercel Cron, in UTC)

| Quando | Cosa |
|---|---|
| ogni ora dalle 7 alle 20 UTC | Promemoria alla titolare per le richieste in attesa da più di 2 ore (`compito=attese`). Sono 14 voci giornaliere, una per ora: così funzionano anche sul piano gratuito |
| ogni giorno 16:00 UTC | Promemoria ai clienti con prenotazione confermata per domani |
| ogni giorno 17:30 UTC | Riepilogo "chi arriva domani" alla titolare |
| giorno 1 del mese, 7:00 UTC | Report mensile alla titolare e a `REPORT_EMAIL` |

Sul piano gratuito Vercel esegue i cron entro l'ora indicata, non al minuto: il promemoria
arriva quindi tra 2 e 4 ore dopo la richiesta. `compito=attese` si può chiamare anche da un
timer esterno, senza segreto: ogni richiesta viene sollecitata una volta sola.

## Misurazione

Eventi (GA4 / Meta): `view_item` / ViewContent (vista prezzi), `begin_checkout` / InitiateCheckout (apre la prenotazione),
`generate_lead` / Contact (tocco su WhatsApp o Chiama), `purchase` / Schedule con valore (prenotazione confermata).
La stessa conversione parte anche dal server (Meta Conversions API) con lo stesso `event_id`, così Meta non la conta due volte;
parte solo se il cliente ha accettato i cookie. Ogni prenotazione salva `utm_source`, `utm_campaign` e la provenienza:
la dashboard mostra "Da dove arrivano le prenotazioni" (Instagram, Facebook, Google, Google Maps, diretto, in sede).
In modalità dimostrativa l'evento è `prenotazione_demo`, per non falsare le campagne.

Link da usare nelle campagne: `?utm_source=instagram&utm_campaign=nome`, `?utm_source=facebook…`,
nella scheda Google Business `?utm_source=gmb`.

## Collaudo fatto

- `npm test`: 45 test (disponibilità per fascia, doppia prenotazione anche simultanea, chiusure, richiesta → conferma / non disponibile, email e reply-to, link firmati, promemoria dopo 2 ore, notifica push cifrata e firmata VAPID, passaggio dal database precedente, accesso e ruoli dell'app, clienti, incassi, prezzi, prenotazioni a mano, numeri di "Come va").
- `strumenti/prova-completa.js` (Playwright): 411 controlli dal sito e dall'app a 390px, più tutte le schermate dell'app su un Android piccolo (360 e 320px); compresi testo ≥ 18px e pulsanti ≥ 56px su ogni schermata.
- Dati strutturati LocalBusiness + CoworkingSpace + FAQPage generati da `config.js`, senza orari di apertura (verificarli con il Rich Results Test di Google, che esegue JavaScript).

## Checklist di lancio

- [x] Vercel → progetto `bagnarino-coworking` → Storage → **database Neon collegato** (`neon-crimson-castle`, crea `DATABASE_URL`)
- [x] Variabili `ADMIN_PASSWORD`, `CRON_SECRET`, `NOTIFICATION_EMAIL`, `LINK_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` impostate
- [x] Resend: dominio `bagnarinocoworking.it` verificato, `RESEND_API_KEY` e `EMAIL_FROM` impostate
- [ ] Resend: verificare anche `bagnarino.it` (record DNS su Register.it) per inviare da `noreply@bagnarino.it`
- [ ] Prima richiesta di prova dal telefono → arrivano email al cliente e alla titolare → Conferma → arriva l'email di conferma
- [ ] App installata sul telefono di Marcella (`/gestione/installa`) e notifiche attivate
- [x] Dominio `bagnarinocoworking.it` collegato al progetto Vercel, `SITO_URL` impostato
- [ ] Scheda **Google Business** aggiornata con il link di prenotazione (`/prenota?utm_source=gmb`) e la categoria "Spazio di coworking"
- [ ] Codici GA4 e Meta Pixel in `config.js`; `META_PIXEL_ID` e `META_CAPI_TOKEN` su Vercel; verifica in Gestione eventi di Meta
- [ ] Servizio fotografico definitivo (`img/foto/`, lista sopra in "Foto da scattare")
- [ ] Punti [DA CONFERMARE] chiusi (sotto)
- [ ] Guida consegnata a Marcella (`GUIDA-TITOLARE.md`) e password comunicata a voce

## [DA CONFERMARE] con Marcella Bagnarino prima del lancio

1. **Sala riunioni**: esiste? Quante persone, a che prezzo? (ora nascosta)
2. **Caffè/acqua** a disposizione? (ora nascosto)
3. **Climatizzazione** estiva e riscaldamento? (ora nascosto)
4. **Prezzi IVA inclusa?** Serve dirlo chiaramente, soprattutto a chi ha partita IVA.
5. **Stampe incluse**: c'è un limite di pagine al giorno/mese?
6. **Pagamento con carta (POS)** in sede: confermato? Carnet e mensili si pagano tutti il primo giorno?
7. **Postazione fissa**: quante delle 8 scrivanie sono fisse? La cassettiera ha la chiave?
8. **Disdetta gratis entro le 20:00 del giorno prima**: va bene come regola?
9. **Timbri della Card per la mezza giornata**: oggi no (solo giornata intera).
10. **Parcheggio**: ci sono convenzioni o parcheggi vicini da indicare?
11. **Punti di riferimento vicini al negozio** (parcheggi, piazze): da chiedere a Marcella; per ora il sito dice solo "in pieno centro".
12. **Videochiamate**: sono ammesse alle postazioni? (il testo del wi-fi le cita)
13. **Etichetta della card in evidenza**: oggi "La più conveniente". "La più scelta" solo con dati veri.
14. **Nome "Marcella"** nella schermata di conferma e nell'app di gestione: va bene?
15. **Gli abbonati mensili raccolgono timbri?** Oggi no (solo giornate e carnet).
16. **Foto vere** degli spazi (shooting Apex Media, lista in "Foto da scattare").
17. **Dominio** del sito.

18. **Testo "Ti accoglie Marcella"** (home, sezione Il negozio): va bene come descrive l'accoglienza? Una **foto vera** di Marcella al banco si può aggiungere accanto, con il suo ok.
19. **Offerta prima volta** (`config.js` → `offertaPrimaVolta`, oggi spenta): "se torni entro 7 giorni la seconda giornata costa €20". Accenderla solo con l'ok di Marcella.

## Prossimi miglioramenti

- Pagamento online con Stripe per carnet e mensili (aggancio pronto in `api/pagamento.js`, manca il webhook).
- Landing dedicate per campagna (studenti in sessione, smart worker) e pagine SEO locali.
- Foto professionali e video verticali per le sponsorizzate.
