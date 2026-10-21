# Bagnarino Coworking

Web app del coworking di Bagnarino S.r.l., corso Lamarmora 46, Alessandria:
sito pubblico, prenotazioni online vere, Bagnarino Card, area riservata per la titolare,
misurazione per le campagne.

HTML + CSS + JavaScript vanilla, **nessun framework e nessun build step**.
Funzioni serverless Vercel in `api/`, database Neon Postgres, email SendGrid.

**Regola d'oro:** se manca una variabile d'ambiente il sito non si rompe. Senza database
torna da solo in modalità dimostrativa (le prenotazioni si inviano su WhatsApp), senza
SendGrid salva tutto ma non manda email, senza `ADMIN_PASSWORD` l'area riservata resta chiusa.

## Design

Direzione editoriale italiana, ispirata alla grafica storica Olivetti (il negozio ne è concessionario dal 1983).

- **Font** (ospitati in `fonts/`, nessun servizio esterno): *Newsreader* per i titoli, con il corsivo come accento;
  *Hanken Grotesk* per testi e interfaccia; *IBM Plex Mono* per etichette e numeri di sezione (richiamo alla macchina da scrivere).
- **Colori**: notte `#0F1A26`, inchiostro `#1B2A3A`, ocra `#C9973B` (unico accento, il "divisorio" del logo), carta `#F4EFE6`, avorio `#FBF8F2`.
- **Foto** in `img/foto/`: immagini **illustrative generate su misura** (nessun monumento riconoscibile, nessuna foto di repertorio
  spacciata per lo spazio). Sul sito sono dichiarate come illustrative: vanno sostituite con le foto vere dello spazio
  mantenendo gli stessi nomi file e misure (WebP, versioni da 560/768 e 896/1344 px; per il telefono `spazio-verticale-*`).
- **Animazioni**: l'apertura (foto, righe del titolo, pianta dei posti liberi) è in CSS e parte subito; GSAP + ScrollTrigger
  (`vendor/gsap/`) si caricano dopo la pagina e animano solo ciò che è sotto la piega: frase manifesto che si accende parola
  per parola, foto che si scoprono, parallasse leggera, cifre che contano, filo ocra dei passi, timbri della card, tessera che
  si inclina col mouse. Con "riduci movimento" tutto resta fermo e leggibile.

## Provarlo in locale

```bash
cd bagnarino-coworking
npm install
npm run locale      # sito + API + database in memoria → http://localhost:3000
npm test            # test del motore di prenotazione
```

`npm run locale` usa un Postgres in memoria (PGlite): niente da configurare, si azzera a
ogni riavvio, le email non partono. Area riservata: http://localhost:3000/admin, password `prova`.
Solo il sito statico, in modalità dimostrativa: `npx serve bagnarino-coworking`.

## Struttura

| File | A cosa serve |
|---|---|
| `config.js` | **Valori di partenza**: azienda, contatti, orari, postazioni, listino, fidelity, testi WhatsApp, codici GA4/Meta. Lo leggono sia il sito sia le API |
| `index.html` | Home: hero con la "pianta di oggi" (posti liberi veri), prezzi, come funziona, spazio, Bagnarino Card, per chi è, dove siamo, FAQ |
| `prenota.html` + `prenota.js` | Prenotazione in 3 passi; giornate omaggio e carnet riconosciuti da email + cellulare |
| `prenotazione.html` + `gestisci.js` | "La mia prenotazione": stato e annullamento con codice + email |
| `card.html` + `tessera.js` | "La mia Bagnarino Card": timbri, omaggi, carnet |
| `admin.html` + `admin.js` + `admin.css` | Area riservata della titolare |
| `main.js` | Script comune: config, festivi, posti liberi, WhatsApp, eventi di misurazione, dati strutturati |
| `cookie.js` | Banner cookie (solo se ci sono codici GA4/Meta), Consent Mode v2 |
| `api/` | Funzioni serverless (vedi sotto). I file che iniziano con `_` sono moduli interni |
| `test/` | Test `node:test` su Postgres in memoria |
| `strumenti/server-locale.js` | Server di prova locale |
| `GUIDA-TITOLARE.md` | Guida di una pagina per Marcella |

### API

| Indirizzo | Cosa fa |
|---|---|
| `GET /api/disponibilita?da=&giorni=&pacchetto=` | Posti liberi per giorno (per i mesi: liberi per tutto il periodo) |
| `POST /api/prenota` | Valida, assegna la postazione in una transazione, aggiorna carnet/fidelity, manda email e avvisi, Meta CAPI |
| `GET /api/prenotazione`, `POST /api/annulla`, `/api/vantaggi`, `/api/card` | Area cliente (un'unica funzione `api/cliente.js`) |
| `GET /api/impostazioni` | Le modifiche fatte in area riservata, applicate al sito |
| `/api/admin?azione=…` | Area riservata (accesso, dashboard, presenze, incassi, CSV, impostazioni) |
| `/api/cron?compito=promemoria\|riepilogo\|report` | Lanciati da Vercel Cron |
| `POST /api/pagamento` | Stripe Checkout, **spento** finché manca `STRIPE_SECRET_KEY` |
| `/sitemap.xml`, `/robots.txt` | Generati da `api/seo.js` con il dominio di `SITO_URL` |

Le funzioni sono 8: il piano gratuito di Vercel ne ammette 12 per progetto.

### Database (si crea da solo al primo utilizzo)

`postazioni`, `clienti`, `prenotazioni`, `carnet`, `fidelity`, `chiusure`, `eventi`, più:
`occupazioni` (una riga per scrivania per giorno, con chiave unica: due persone sullo stesso
posto lo stesso giorno sono impossibili anche con richieste simultanee), `tentativi`
(anti-spam, solo impronte cifrate degli IP), `impostazioni` (modifiche dall'area riservata).

### Regole del motore

- **Giornata**: un posto per un giorno. **Carnet**: 10 ingressi, il primo nel giorno scelto, validi 3 mesi dal primo ingresso; ogni giornata successiva prenotata con la stessa email + cellulare scala un ingresso (costo €0).
- **Mese flessibile**: un posto ogni giorno di apertura per un mese (preferibilmente lo stesso). **Mese fisso**: la stessa scrivania per tutto il mese.
- **Bagnarino Card**: ogni giornata pagata (singola o da carnet) segnata "È arrivato" vale un timbro; al 10° timbro una giornata in omaggio, proposta al cliente nella prenotazione successiva. Gli abbonamenti mensili non raccolgono timbri.
- **Annullamento** gratuito fino alle 20:00 del giorno prima (`config.js` → `disdetta.ora`). Dopo, solo la titolare dall'area riservata.
- La stessa persona non può occupare due scrivanie lo stesso giorno.
- **Anti-spam**: campo trappola, massimo 8 tentativi l'ora per IP, controllo email/telefono lato server.

## Web app (telefono)

- Barra a schede in basso su tutte le pagine pubbliche: **Home · Prezzi · Prenota · Le mie · Contatti**. Nel flusso di prenotazione resta solo la barra con il prezzo e il pulsante.
- Menu (☰) in alto a destra con tutte le sezioni e i contatti. Su computer il menu è in testata.
- "Le mie": il telefono ricorda l'ultima prenotazione fatta (localStorage `bgn-ultima`) e la mostra subito, con il pulsante della **Bagnarino Card** (la card non è più nel menu: la vede solo chi ha prenotato).
- Codice ed email arrivati dal link nell'email vengono tolti dall'indirizzo, così non finiscono nelle statistiche.
- Installabile come app: `site.webmanifest` (clienti) e `admin.webmanifest` (titolare, icona "Gestione").
- Area riservata: `/admin`, link "Area riservata" nel piè di pagina.

## Crescita (area riservata)

Scheda **Crescita** in `/admin` (icona ↗ in basso): come sta andando il coworking mese per mese, ultimi 12 mesi.

- **Numeri automatici** dal database: prenotazioni, incassato e prenotato, nuovi clienti, clienti che tornano, arrivati / non venuti, prenotazioni per canale (stessa classificazione di "Da dove arrivano le prenotazioni").
- **Numeri a mano** (tabella `marketing_mesi`, uno per mese): follower e persone raggiunte su Instagram/Facebook, visualizzazioni, chiamate, indicazioni e clic dal profilo Google, recensioni (numero e media), visite al sito, contatti WhatsApp, spesa Meta e Google, nota "Cosa abbiamo fatto questo mese". **Nessuna chiave API**: li inserisce Apex Media.
- In cima una frase in italiano semplice generata dai numeri; carte con confronto sul mese prima (freccia + parole); imbuto *persone raggiunte → visite al sito → prenotazioni → arrivati*; grafici SVG animati (prenotazioni, incassi, canali, follower, azioni Google).
- **Costo per prenotazione** = spesa pubblicitaria del mese ÷ tutte le prenotazioni del mese. **Ritorno della pubblicità** = valore delle prenotazioni arrivate da Instagram, Facebook e Google Ads ÷ spesa.
- **Due accessi**: `ADMIN_PASSWORD` (Marcella, ruolo *titolare*: vede tutto, Crescita in sola lettura) e `APEX_PASSWORD` (Apex Media, ruolo *apex*: in più il pulsante "Aggiorna i dati del mese"). Il cookie contiene un'impronta diversa per ruolo; senza `APEX_PASSWORD` l'accesso Apex non esiste. Le Impostazioni sono nell'ingranaggio in alto.
- Come aggiornarla: entra con la password Apex → Crescita → scegli il mese con le frecce → "Aggiorna i dati del mese" (si possono lasciare campi vuoti; numeri all'italiana, es. 1.234 o 4,6).

## Variabili d'ambiente su Vercel

| Variabile | Obbligatoria | A cosa serve |
|---|---|---|
| `DATABASE_URL` | sì, per le prenotazioni vere | Neon Postgres (Vercel → Storage → Neon la imposta da sola) |
| `ADMIN_PASSWORD` | sì, per l'area riservata | Password della titolare |
| `APEX_PASSWORD` | per la scheda Crescita | Password di Apex Media: aggiorna i numeri di social, Google e pubblicità |
| `CRON_SECRET` | sì, per i promemoria | Protegge `/api/cron` (Vercel la invia da solo) |
| `RESEND_API_KEY`, `EMAIL_FROM` | per le email | Chiave Resend (gratis fino a 3.000 email/mese) e mittente su dominio verificato, es. `prenotazioni@dominio.it`. `EMAIL_FROM_NOME` facoltativa |
| `SENDGRID_API_KEY` | alternativa a Resend | Funziona ancora; SendGrid non ha più il piano gratuito (circa 20 $/mese dopo 60 giorni) |
| `NOTIFICHE_EMAIL` | per gli avvisi | Email della titolare (nuove prenotazioni, annullamenti, riepilogo serale, report) |
| `REPORT_EMAIL` | facoltativa | Altri destinatari del report mensile (es. Apex Media), separati da virgola |
| `SITO_URL` | quando c'è il dominio | Es. `https://www.dominio.it`, senza barra finale |
| `META_PIXEL_ID`, `META_CAPI_TOKEN` | per le campagne | Conversions API lato server. `META_TEST_CODE` per i test in Gestione eventi |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | facoltative | Avvisi anche su Telegram |
| `NOTIFICHE_WHATSAPP=1`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_TO` | facoltative | Avvisi via WhatsApp Business Cloud API |
| `STRIPE_SECRET_KEY` | facoltativa | Accende il pagamento online (manca ancora il webhook "pagato") |

Codici **GA4** e **Meta Pixel** lato browser: in `config.js` (`ga4`, `metaPixel`). Partono solo dopo il consenso cookie.

## Operazioni comuni

- **Cambiare prezzi, orari, numero di postazioni, messaggi WhatsApp**: area riservata → Impostazioni (salvato nel database, il sito si aggiorna entro un minuto). `config.js` resta il valore di partenza.
- **Aggiungere un giorno di chiusura**: area riservata → Calendario o Impostazioni → "Chiudi questo giorno". In alternativa, permanente: `config.js` → `chiusure: ['2026-12-24']`. I festivi nazionali, Pasquetta compresa, sono automatici.
- **Cambiare il numero di postazioni**: area riservata → Impostazioni → Scrivanie (le prenotazioni già fatte restano valide). Per lo schema dell'hero, oltre le 6 scrivanie va ridisegnata la pianta in `index.html`.
- **Accendere sala riunioni, caffè, climatizzazione, recensioni**: `config.js` (`sala.attiva`, `servizi`, `recensioniAttive`).

## Promemoria automatici (Vercel Cron, orari UTC)

| Quando | Cosa |
|---|---|
| ogni giorno 16:00 UTC (18:00 d'estate, 17:00 d'inverno) | Promemoria ai clienti che arrivano domani |
| ogni giorno 17:30 UTC (19:30 d'estate, 18:30 d'inverno) | Riepilogo "chi arriva domani" alla titolare |
| giorno 1 del mese, 7:00 UTC | Report mensile alla titolare e a `REPORT_EMAIL` |

Sul piano gratuito Vercel esegue i cron entro l'ora indicata, non al minuto.

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

- `npm test`: 11 test (disponibilità, doppia prenotazione anche simultanea, stessa persona due volte, mese fisso, carnet, fidelity, annullamento fuori orario, anti-spam).
- Playwright da mobile (iPhone 13), modalità reale con database: prenotazione completa, gestione e annullamento, carnet usato in prenotazione, card, mese fisso; area riservata: accesso (anche password errata), prenotazione a mano, "È arrivato" con timbro, incasso, clienti, CSV, cambio prezzo che si riflette sul sito, uscita.
- Playwright a 375 / 768 / 1440 px: nessuno scroll orizzontale, CTA sempre visibili, nessun errore JavaScript.
- Lighthouse mobile (server locale con compressione): home 96 / 100 / 100 / 100 con le foto, prenota 99 / 100 / 100 / 100 (Prestazioni, Accessibilità, Best Practices, SEO). L'area riservata non è indicizzata di proposito.
- Animazioni GSAP verificate: 37 animazioni attive, nessun elemento lasciato nascosto, nessun errore.
- Dati strutturati LocalBusiness + CoworkingSpace + FAQPage generati da `config.js` (verificarli con il Rich Results Test di Google, che esegue JavaScript).

## Checklist di lancio

- [x] Vercel → progetto `bagnarino-coworking` → Storage → **database Neon collegato** (`neon-crimson-castle`, crea `DATABASE_URL`)
- [x] Variabili `ADMIN_PASSWORD`, `CRON_SECRET`, `NOTIFICHE_EMAIL` impostate
- [ ] Resend: **dominio verificato** (record DNS), poi `RESEND_API_KEY` e `EMAIL_FROM`
- [ ] Prima prenotazione di prova dal telefono → arrivano email al cliente e alla titolare → annullala dal link nell'email
- [ ] Dominio scelto e collegato al progetto Vercel → `SITO_URL` impostato
- [ ] Scheda **Google Business** aggiornata con il link di prenotazione (`/prenota?utm_source=gmb`) e la categoria "Spazio di coworking"
- [ ] Codici GA4 e Meta Pixel in `config.js`; `META_PIXEL_ID` e `META_CAPI_TOKEN` su Vercel; verifica in Gestione eventi di Meta
- [ ] Foto vere dello spazio al posto delle immagini illustrative (`img/foto/`)
- [ ] Punti [DA CONFERMARE] chiusi (sotto)
- [ ] Guida consegnata a Marcella (`GUIDA-TITOLARE.md`) e password comunicata a voce

## [DA CONFERMARE] con Marcella Bagnarino prima del lancio

1. **Sala riunioni**: esiste? Quante persone, a che prezzo? (ora nascosta)
2. **Caffè/acqua** a disposizione? (ora nascosto)
3. **Climatizzazione** estiva e riscaldamento? (ora nascosto)
4. **Prezzi IVA inclusa?** Serve dirlo chiaramente, soprattutto a chi ha partita IVA.
5. **Stampe incluse**: c'è un limite di pagine al giorno/mese?
6. **Pagamento con carta (POS)** in sede: confermato? Carnet e mensili si pagano tutti il primo giorno?
7. **Postazione fissa**: quante delle 6 scrivanie sono fisse? La cassettiera ha la chiave?
8. **Disdetta gratis entro le 20:00 del giorno prima**: va bene come regola?
9. **Chiusure**: San Baudolino (10 novembre), ferie estive, ponti.
10. **Parcheggio**: ci sono convenzioni o parcheggi vicini da indicare?
11. **"A due passi dall'ospedale e da Piazza Libertà"**: confermare la descrizione.
12. **Videochiamate**: sono ammesse alle postazioni? (il testo del wi-fi le cita)
13. **Etichetta della card in evidenza**: oggi "La più conveniente". "La più scelta" solo con dati veri.
14. **Nome "Marcella"** nella schermata di conferma e nell'area riservata: va bene?
15. **Gli abbonati mensili raccolgono timbri?** Oggi no (solo giornate e carnet).
16. **Foto vere** degli spazi (shooting Apex Media).
17. **Dominio** del sito.

## Prossimi miglioramenti

- Pagamento online con Stripe per carnet e mensili (aggancio pronto in `api/pagamento.js`, manca il webhook).
- Landing dedicate per campagna (studenti in sessione, smart worker) e pagine SEO locali.
- Foto professionali e video verticali per le sponsorizzate.
