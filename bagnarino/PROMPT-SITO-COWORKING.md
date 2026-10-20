# Bagnarino Coworking — prompt per costruire la web app

Tre prompt da incollare **in ordine** in una nuova chat Claude Code, sul repository `apexmedia-website`.
Ogni prompt è una fase: si passa alla successiva solo quando la precedente è online e approvata.

| # | Fase | Risultato |
|---|---|---|
| 1 | Sito pubblico | Web app vetrina, mobile-first, che spinge alla prenotazione (in modalità dimostrativa) |
| 2 | Motore di prenotazione | Prenotazioni vere, posti liberi in tempo reale, avvisi email, WhatsApp, fidelity card |
| 3 | Area riservata + misurazione | Dashboard per la titolare (incassi, prenotazioni, occupazione) + tracciamento GA4/Meta + collaudo |

Logo scelto: `bagnarino/logo/logo-v3.png` (alternativa: `logo-v2.png`).
I punti segnati **[DA CONFERMARE]** vanno chiesti a Marcella Bagnarino prima del lancio.

---

## PROMPT 1 — Contesto, brand e sito pubblico

```
Sei un senior product designer + front-end developer + conversion rate optimizer.
Devi costruire la web app di un nuovo coworking per un cliente reale di Apex Media
(agenzia di performance marketing di Alessandria). Lavora nella cartella
`bagnarino-coworking/` di questo repository.

## 1. Il cliente e il progetto (leggi tutto prima di scrivere codice)

- Azienda: Bagnarino S.r.l. — Corso Lamarmora 46, 15121 Alessandria (AL)
  Tel. 0131 444845 · info@bagnarino.it · P. IVA 01588170066
- Storia: attiva dal 1983 ad Alessandria (da circa 20 anni in corso Lamarmora), concessionario Olivetti (registratori di cassa,
  multifunzione, forniture per ufficio). Titolare: Sig.ra Marcella Bagnarino.
- Il nuovo business: la titolare NON vuole spingere l'assistenza tecnica. Vuole trasformare
  lo spazio del negozio in un COWORKING: divisori in plexiglass tra le postazioni,
  scrivanie attrezzate, wi-fi, stampanti multifunzione Olivetti incluse, e vendere
  le scrivanie in affitto (giornata, carnet, mese).
- Nome del brand: "Bagnarino Coworking" (Bagnarino resta il nome principale).
- Target: liberi professionisti, chi lavora da remoto e non vuole stare a casa,
  studenti universitari e praticanti, piccoli team che cercano una sala per riunioni.
  Età 22-55, zona Alessandria centro. Arrivano soprattutto dal telefono
  (Google Maps, Instagram/Facebook sponsorizzate).
- Concorrenza in città (ottobre 2026, prezzi da portali pubblici):
  1. CoWorking Alessandria P.za Garibaldi — Corso Cento Cannoni 2 — €30/giorno, €180/mese,
     gestito da un'associazione (APS), visite su appuntamento.
  2. LAb121 — Via Verona 95 — €30/giorno, da €210/mese, associazione, accesso per soci,
     reception solo al mattino.
  3. Equilibri Studio — Via San Lorenzo 99 — studi professionali legati al benessere,
     prezzi su richiesta.
  Posizionamento di Bagnarino (da usare nei testi): l'unico coworking gestito da
  un'azienda d'ufficio con 43 anni di storia; stampanti Olivetti professionali incluse;
  assistenza tecnica in sede; niente tessera da socio; prenotazione online 24/7;
  prezzo più accessibile.
- Listino proposto (mettilo in UN SOLO file di configurazione, perché cambierà):
  - Giornata: €25
  - Carnet 10 ingressi: €200 (€20 a ingresso)
  - Mese, postazione flessibile: €160
  - Mese, postazione fissa con cassettiera: €190
  - Sala riunioni: [DA CONFERMARE se esiste e a che prezzo]
  - Fidelity card: ogni 10 giornate, la successiva è in omaggio
- Postazioni iniziali: 6 (nel file di config, perché aumenteranno).
- Orari: dal lunedì al venerdì, 9:30-18:30. Sabato e domenica chiuso.
- Telefono e WhatsApp della titolare: +39 347 224 9457 (link wa.me/393472249457,
  tel:+393472249457). Il fisso del negozio 0131 444845 resta nel footer.
- Carnet: 10 ingressi pagati in anticipo, validi 3 mesi dal primo ingresso
  (valore nel file di config, la titolare può cambiarlo).
- Dominio: NON ancora deciso. Nessun dominio scritto nel codice: usa una variabile
  SITO_URL e, finché manca, l'indirizzo provvisorio di Vercel.

## 2. Brand e design

- Logo: `bagnarino/logo/logo-v3.png` = monogramma "B" composto da due blocchi
  (due scrivanie) separati da una linea orizzontale ocra (il divisorio), wordmark
  "Bagnarino" e sottotitolo "COWORKING · DAL 1983". Ricrealo FEDELMENTE come SVG
  (`logo.svg`, `logo-mark.svg` solo monogramma per favicon, versione chiara e scura).
  Genera anche favicon 32/180/192/512 e un'immagine di condivisione 1200x630.
- Palette: inchiostro #1B2A3A (testi e superfici scure), ocra #C9973B (UN solo accento:
  CTA secondarie, dettagli, il "divisorio"), carta #F7F5F0 (sfondo), bianco #FFFFFF
  (card), verde disponibilità #16A34A, rosso solo per errori. Contrasto AA ovunque.
- Font: Manrope (titoli, 600-800) + Inter (testo), self-hosted in `fonts/` (woff2,
  font-display: swap). Niente Google Fonts esterni.
- Stile: caldo, luminoso, ordinato, "ufficio di qualità" — non startup fredda, non
  co-living giovanilistico. Foto vere degli spazi appena disponibili; finché non ci sono
  usa segnaposto eleganti (blocchi colore con etichetta "Foto in arrivo"), MAI stock
  generiche spacciate per lo spazio reale.
- Icone: Lucide (SVG inline). Animazioni leggere con GSAP + ScrollTrigger da file locale,
  rispettando prefers-reduced-motion. Nessuna animazione che ritardi la lettura del prezzo.

## 3. Stack e vincoli tecnici (stesso standard degli altri siti Apex Media nel repo)

- HTML + CSS + JavaScript vanilla, NESSUN framework e NESSUN build step: quello che c'è
  nella cartella è quello che va online. Guarda `arabesque/` e `fioreria/` come riferimento
  di struttura, stile del codice e commenti in italiano.
- Deploy su Vercel: `vercel.json` con cleanUrls, rewrites, header di sicurezza e cache.
- In questa fase NIENTE backend: la prenotazione funziona in MODALITÀ DIMOSTRATIVA
  (calendario e posti finti ma realistici, la conferma mostra la schermata di successo
  senza salvare nulla). Prepara però il codice perché in fase 2 basti collegare `/api/*`.
- File di configurazione unico `config.js`: dati azienda, contatti, WhatsApp,
  orari, numero postazioni, listino, testi della fidelity. Tutto il sito legge da lì.
- Performance: LCP < 2s su 4G, peso pagina home < 500 KB esclusi i font, immagini
  WebP/AVIF con width/height, lazy loading sotto la piega.
- Accessibilità: semantica corretta, focus visibile, aria-label sui pulsanti icona,
  tap target min 44px, testo minimo 16px su mobile.

## 4. Pagine e sezioni

Home (`index.html`), in quest'ordine — ogni sezione deve avere uno scopo di conversione:
1. Header: logo + "Prenota" (pulsante pieno) + icona WhatsApp. Su mobile barra in basso
   fissa con due pulsanti: "Prenota una postazione" e "WhatsApp".
2. Hero: titolo "La tua scrivania in centro ad Alessandria, da €25 al giorno."
   Sottotitolo con i 3 vantaggi (wi-fi veloce, stampanti Olivetti incluse, spazi divisi
   e silenziosi). Badge "Oggi: X posti liberi" (dato da config in fase 1, reale in fase 2).
   CTA primaria "Prenota ora", secondaria "Scrivici su WhatsApp".
3. Striscia di fiducia: "Dal 1983 ad Alessandria" · "Concessionario Olivetti" ·
   "Niente tessera, niente vincoli" · "Prenoti in 30 secondi".
4. Prezzi (sezione più importante): 4 card (Giornata, Carnet 10, Mese flessibile, Mese
   fisso), la card "Mese flessibile" evidenziata come "La più scelta". Ogni card: prezzo
   grande, cosa include, pulsante "Prenota" che apre il flusso con il pacchetto già
   selezionato. Sotto: riga "Confronta: altri coworking in città €30/giorno — da noi €25".
5. Come funziona: 3 passi (Scegli il giorno → Prenoti online o su WhatsApp → Arrivi e lavori).
6. Lo spazio: galleria (segnaposti finché non ci sono foto) + elenco servizi con icone
   (wi-fi fibra, stampanti/scanner Olivetti, divisori, prese a ogni postazione, caffè
   [DA CONFERMARE], climatizzazione [DA CONFERMARE], assistenza tecnica in sede).
7. Fidelity card: mockup della "Bagnarino Card" a timbri (10 timbri, l'11° omaggio).
8. Per chi è: 4 profili (freelance, smart worker, studenti, piccoli team) con il beneficio
   specifico di ognuno.
9. Dove siamo: mappa (iframe Google Maps lazy, con facciata cliccabile per non
   rallentare), indirizzo, orari, "a due passi dall'ospedale e da Piazza Libertà",
   pulsanti "Indicazioni" e "Chiama".
10. FAQ (6-8 domande vere: serve la tessera? posso disdire? come pago? c'è parcheggio?
    posso stampare? fattura per partita IVA?) con schema FAQPage.
11. CTA finale + footer con dati societari completi, privacy, cookie.

Altre pagine: `prenota.html` (flusso di prenotazione), `prezzi.html` (opzionale, se la home
diventa troppo lunga), `privacy.html`, `cookie.html`, `404.html`.

## 5. Flusso di prenotazione (`prenota.html`) — massimo 3 passaggi, zero frizioni

1. Scegli il pacchetto (preselezionato se arrivi da una card prezzo).
2. Scegli il giorno su un calendario a settimana (mobile: scroll orizzontale dei giorni)
   con posti liberi per giorno ("4 liberi" verde, "Ultimi 2" ocra, "Pieno" grigio).
   Per il mese: scegli il giorno di inizio. Sabato e domenica non selezionabili.
3. Dati: nome, cognome, email, telefono, P. IVA/codice fiscale facoltativo per fattura,
   note. Consenso privacy obbligatorio, marketing facoltativo.
   Riepilogo con prezzo e "Pagamento in sede il primo giorno" (pagamento online in futuro).
Conferma: schermata di successo con codice prenotazione, "Aggiungi al calendario" (.ics),
pulsante WhatsApp "Ho una domanda sulla mia prenotazione", indicazioni per arrivare.
Validazione inline, errori in italiano chiaro, nessun campo inutile.

## 6. WhatsApp

Link wa.me al numero +39 347 224 9457 (wa.me/393472249457) con
messaggio precompilato diverso per contesto (es. "Ciao, vorrei prenotare una postazione
per il [giorno]" / "Ciao, vorrei informazioni sul pacchetto mensile").

## 7. Testi

Scrivi tu tutti i testi in italiano, dando del "tu", tono caldo e professionale, frasi
corte, benefici prima delle caratteristiche, prezzi sempre visibili. Nessun termine
inglese non necessario (ok "coworking", "wi-fi"). Niente recensioni inventate: lascia
il blocco recensioni pronto ma nascosto finché non ci sono recensioni Google vere.

## 8. SEO locale

Title/description per pagina, Open Graph, schema.org `LocalBusiness` + `CoworkingSpace`
(nome, indirizzo, geo 44.9112,8.6215, orari, prezzi in `makesOffer`), `sitemap.xml`,
`robots.txt`, canonical. Parole chiave: "coworking Alessandria", "affitto scrivania
Alessandria", "postazione lavoro Alessandria", "ufficio a giornata Alessandria".

## 9. Consegna di questa fase

- Sito funzionante in locale con `npx serve bagnarino-coworking`.
- README.md nella cartella (struttura file, come cambiare prezzi e testi, cosa manca).
- Prima di finire: controlla tutto a 375px, 768px e 1440px con Playwright e fai gli
  screenshot; verifica che non ci sia scroll orizzontale e che i CTA siano sempre visibili.
- Elenca in fondo tutti i [DA CONFERMARE] rimasti aperti.
```

---

## PROMPT 2 — Motore di prenotazione, avvisi, WhatsApp, fidelity card

```
Continuiamo il progetto `bagnarino-coworking/` costruito nella fase 1 (leggi prima il
README e config.js). Ora la prenotazione deve diventare VERA. Stesso stack e stesse
convenzioni di `arabesque/api` e `fioreria/api`: funzioni serverless Vercel in `/api`,
database Neon Postgres via `@neondatabase/serverless`, email con SendGrid, tabelle che
si creano da sole al primo utilizzo, tutto commentato in italiano.

## Regola d'oro
Se una variabile d'ambiente manca, il sito NON si rompe: torna alla modalità dimostrativa
e lo dice in console. Variabili: DATABASE_URL, SENDGRID_API_KEY, SENDGRID_FROM,
NOTIFICHE_EMAIL (email della titolare), ADMIN_PASSWORD, CRON_SECRET, SITO_URL.

## 1. Modello dati (Postgres)
- `postazioni` (id, nome, tipo 'flessibile'|'fissa', attiva)
- `clienti` (id, nome, cognome, email unica, telefono, piva_cf, consenso_marketing,
  creato_il)
- `prenotazioni` (id, codice leggibile tipo BGN-4K7Q, cliente_id, pacchetto
  'giornata'|'carnet'|'mese_flessibile'|'mese_fisso'|'sala', data_inizio, data_fine,
  postazione_id nullable, prezzo_centesimi, stato 'confermata'|'annullata'|'presente'|
  'assente', pagato bool, metodo_pagamento, note, origine (utm/fonte), creato_il)
- `carnet` (id, cliente_id, ingressi_totali 10, ingressi_usati, scadenza)
- `fidelity` (cliente_id, timbri, omaggi_disponibili, omaggi_usati)
- `chiusure` (data, motivo) per festivi e chiusure straordinarie
- `eventi` (tipo, dati json, creato_il) per il tracciamento interno

## 2. API
- `GET /api/disponibilita?da=YYYY-MM-DD&giorni=14` → posti liberi per giorno
  (postazioni attive − prenotazioni confermate − giorni chiusi/orari da config).
- `POST /api/prenota` → valida, ricontrolla la disponibilità DENTRO una transazione
  (niente doppie prenotazioni sullo stesso posto), crea cliente se nuovo, crea
  prenotazione, assegna la prima postazione libera, aggiorna carnet/fidelity se
  applicabile, invia gli avvisi, risponde con codice e riepilogo.
  Protezione anti-spam: honeypot + limite per IP + controllo formato email/telefono.
- `POST /api/annulla` → annullamento con codice + email, fino alle 20:00 del giorno prima.
- `GET /api/prenotazione?codice=&email=` → stato prenotazione per il cliente.
- Il front-end della fase 1 passa da dimostrativo a reale in automatico quando le API
  rispondono.

## 3. Avvisi automatici (email HTML con il brand, layout tabellare compatibile Outlook)
- Al cliente, subito: conferma con codice, giorno, pacchetto, prezzo, indirizzo, link
  Google Maps, file .ics allegato, link per annullare, pulsante WhatsApp.
- Al cliente, promemoria il giorno prima alle 18:00 (Vercel Cron → `/api/promemoria`,
  protetto da CRON_SECRET).
- Alla titolare, a ogni nuova prenotazione e annullamento: email breve e leggibile dal
  telefono (chi, quando, cosa, quanto, telefono cliccabile).
- Riepilogo serale alla titolare alle 19:30: chi arriva domani.
- Predisponi (spento) l'invio di notifiche anche via Telegram bot o WhatsApp Business
  API, attivabile in futuro con una variabile d'ambiente.

## 4. WhatsApp
Ogni prenotazione confermata mostra un pulsante wa.me con messaggio precompilato che
contiene il codice prenotazione. Il numero e i testi stanno in config.js.

## 5. Fidelity card digitale "Bagnarino Card"
- Ogni giornata con stato 'presente' = 1 timbro. A 10 timbri si sblocca 1 giornata omaggio.
- Pagina `card.html`: il cliente inserisce email + codice dell'ultima prenotazione e vede
  la sua card (stessa grafica del mockup della fase 1, timbri pieni ocra).
- In fase di prenotazione, se il cliente ha un omaggio disponibile, glielo propone
  ("Hai una giornata in omaggio: vuoi usarla?").

## 6. Carnet
Acquisto del carnet = 10 ingressi utilizzabili entro 3 mesi dal primo ingresso
(valore in config/impostazioni).
Ogni prenotazione "giornata" di un cliente con carnet attivo scala un ingresso e mostra
"Ti restano X ingressi".

## 7. Pagamenti
V1: pagamento in sede (contanti/POS). Prepara però il punto di aggancio per Stripe
Checkout (come in `arabesque/api/create-checkout-session.js`), disattivato finché
non c'è STRIPE_SECRET_KEY.

## 8. Privacy
Testi privacy/cookie aggiornati con i nuovi trattamenti (prenotazioni, email, fidelity).
Dati conservati solo il necessario. Nessun dato personale nei log.

## 9. Consegna
- Test: script `npm test` (node:test) che verifica disponibilità, doppia prenotazione
  bloccata, carnet, fidelity, annullamento fuori orario rifiutato.
- README aggiornato: variabili da impostare su Vercel, come aggiungere un giorno di
  chiusura, come cambiare il numero di postazioni.
- Prova end-to-end con Playwright in modalità dimostrativa e, se DATABASE_URL è
  disponibile, anche in modalità reale.
```

---

## PROMPT 3 — Area riservata per la titolare + misurazione + collaudo finale

```
Ultima fase del progetto `bagnarino-coworking/` (leggi README, config.js e /api).
Costruisci l'AREA RISERVATA per la titolare, Marcella Bagnarino, 60 anni: deve essere
semplicissima, leggibile dal telefono, caratteri grandi, zero gergo tecnico.
Prendi come base `arabesque/admin.html` e `arabesque/api/_admin.js` (accesso con una
password in ADMIN_PASSWORD, cookie HttpOnly con impronta).

## 1. `admin.html` — schermata principale "Oggi"
In alto 3 numeri grandi:
- Incasso del mese (e differenza in % sul mese precedente)
- Prenotazioni di questa settimana (e differenza sulla precedente)
- Scrivanie occupate oggi (es. "4 su 6") con barra
Sotto:
- "Chi arriva oggi" e "Chi arriva domani": nome, pacchetto, telefono cliccabile,
  pulsanti grandi "È arrivato" (segna presente → timbro fidelity) e "Non è venuto".
- Grafico a barre semplice: prenotazioni per settimana delle ultime 8 settimane.
- Grafico incassi per mese degli ultimi 6 mesi (SVG fatto a mano, niente librerie pesanti).

## 2. Altre schede (navigazione a schede in basso su mobile)
- **Calendario**: vista settimana, per ogni giorno le postazioni occupate e da chi.
  Può aggiungere una prenotazione a mano (cliente arrivato in negozio o al telefono)
  e segnare un giorno come chiuso.
- **Clienti**: elenco con ricerca, per ognuno: prenotazioni, totale speso, carnet
  residuo, timbri fidelity, ultimo ingresso. Evidenzia i "clienti abituali" (≥4 ingressi
  al mese) e quelli "da richiamare" (non vengono da 30 giorni).
- **Incassi**: tabella per giorno/settimana/mese, segna "pagato" e metodo; esporta CSV
  per il commercialista.
- **Impostazioni**: listino prezzi, numero postazioni, orari, giorni di chiusura,
  testi dei messaggi WhatsApp — modificabili senza toccare il codice (salvati a
  database, con config.js come valore di partenza).

## 3. Misurazione (serve ad Apex Media per le campagne Meta e Google)
- GA4 e Meta Pixel caricati SOLO dopo il consenso cookie (banner conforme, come in
  `arabesque/cookie.js`). ID in config.js (vuoti = disattivati).
- Eventi: `view_item` (vista prezzi), `begin_checkout` (apre la prenotazione),
  `generate_lead` (click WhatsApp / chiamata), `purchase` con valore (prenotazione
  confermata). Meta: ViewContent, InitiateCheckout, Contact, Schedule/Purchase con valore.
- Meta Conversions API lato server da `/api/prenota` (variabili META_PIXEL_ID e
  META_CAPI_TOKEN, deduplicata con event_id), così le sponsorizzate si ottimizzano sulle
  prenotazioni vere.
- Salva sempre utm_source/utm_campaign sulla prenotazione: nella dashboard mostra
  "Da dove arrivano le prenotazioni" (Instagram, Facebook, Google, Maps, diretto).
- Report mensile automatico via email alla titolare e ad Apex Media il giorno 1:
  prenotazioni, incasso, occupazione media, nuovi clienti, canali.

## 4. Collaudo finale (obbligatorio prima di dire "fatto")
- Lighthouse mobile ≥ 90 su Performance, Accessibilità, SEO, Best Practices.
- Playwright: prenotazione completa da mobile, annullamento, accesso admin, segna
  presente, verifica timbro fidelity, esportazione CSV.
- Controlla schema.org con il validatore, sitemap, robots, 404, redirect.
- Checklist di lancio nel README: dominio (quando verrà scelto) collegato a Vercel, variabili
  d'ambiente, email mittente verificata su SendGrid, scheda Google Business aggiornata
  con il link di prenotazione, ID GA4/Meta inseriti, prima prenotazione di prova.
- Scrivi una mini guida per la titolare (`GUIDA-TITOLARE.md`, max 1 pagina, parole
  semplici): come entrare, come segnare un cliente arrivato, come chiudere un giorno,
  come cambiare un prezzo.
```

---

## Prossimi miglioramenti (da valutare dopo il lancio)

- Foto professionali degli spazi (shooting Apex Media) e video verticali per le sponsorizzate.
- Pagamento online con Stripe per carnet e mensili (riduce i "non è venuto").
- Landing dedicate per ogni campagna (es. "studenti in sessione d'esame", "smart worker").
- Pagine SEO locali: "coworking vicino ospedale Alessandria", "ufficio a giornata Alessandria".
