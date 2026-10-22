# Bagnarino Coworking — redesign premium (prompt per una nuova chat)

Sei l'AI operativa di Apex Media. Lavori nel repository `faniaalexanderaz-sketch/apexmedia-website`, cartella `bagnarino-coworking/`. Sviluppa sul branch che ti viene assegnato; `main` è collegato a Vercel e si aggiorna solo con merge esplicito su mia richiesta.

## Il progetto in breve

Sito + prenotazioni + area riservata per **Bagnarino Coworking**, Alessandria, corso Lamarmora 46. È un negozio Olivetti dal 1983 (titolare Marcella Bagnarino) che affitta 6 scrivanie nel negozio. Cliente tipo: freelance, smart worker, studenti. Obiettivo del sito: far prenotare una scrivania in 30 secondi, senza pagamento online (si paga in sede).

Stack: HTML/CSS/JS senza framework, Node serverless su Vercel (`api/`), Postgres Neon, email con Resend, GSAP + ScrollTrigger già in `vendor/gsap/` (caricato al primo gesto da `animazioni.js`). Nessun build step. Test con `npm test` (PGlite in memoria). Server locale con `npm run locale` → http://localhost:3000 (password area riservata `prova`; `apex-prova` per il ruolo Apex Media).

### File che contano
- `config.js` — **tutti i dati del sito in un posto solo**: prezzi, orari, premi della card, vantaggi del mese, contatti, testi WhatsApp. Ogni pagina li legge da qui (`data-cfg`, `data-prezzo`); l'HTML contiene solo i valori di partenza per chi non ha JavaScript. Un dato non confermato resta spento, mai inventato.
- `index.html` + `styles.css` + `main.js` + `animazioni.js` — home.
- `prenota.html` + `prenota.js` — prenotazione in 3 passi (formula, giorno, dati).
- `prenotazione.html` + `gestisci.js` — "La mia prenotazione" (rivedi/disdici con codice).
- `card.html` + `tessera.js` — "La mia Bagnarino Card" (timbri e premi).
- `admin.html` + `admin.css` + `admin.js` — area riservata (gestionale).
- `api/` — `prenota.js`, `disponibilita.js`, `admin.js`, `_prenotazioni.js` (motore), `_crescita.js` (scheda Crescita), `_email-template.js`, `cron.js`.
- `strumenti/versiona.py` — **da lanciare prima di ogni commit**: aggiunge `?v=<impronta>` a CSS/JS nelle pagine, altrimenti i telefoni mostrano lo stile vecchio.
- `GUIDA-TITOLARE.md`, `ADS-GOOGLE.md`, `README.md` (lista foto da scattare).
- `../bagnarino/Bagnarino-Come-funziona-il-sito.pdf` — documento per Marcella (9 pagine) che spiega tutto il sito: se cambi prezzi, premi o flussi, va aggiornato (sorgente in `.html` accanto).

### Stato attuale (ottobre 2026)
- **Listino:** giornata €25 · carnet 10 ingressi €200 (€20/giorno, valido 3 mesi) · mese flessibile €270 (circa €13/giorno, "la più conveniente", in evidenza) · mese postazione fissa €320. Disdetta gratis entro le 20:00 del giorno prima. Fattura a P. IVA/CF. Niente iscrizione né quote.
- **Bagnarino Card** (gratis, digitale): un timbro per ogni giornata o ingresso carnet. Premi: 3° timbro 25 stampe a colori · 5° "porta un amico" (sua prima giornata gratis) · 7° −10% in negozio · 10° giornata in regalo (l'undicesima è **in regalo**, mai "nostra" o "omaggio"). Gli abbonati mensili non raccolgono timbri: hanno i vantaggi ogni mese (100 stampe a colori, un amico gratis, −10% in negozio, −€20/mese dal 4° mese di fila). Offerta "prima volta" (seconda giornata €20 entro 7 giorni) esiste ma è spenta.
- **Home, sezioni in ordine:** apertura (foto, "Coworking in centro ad Alessandria, da €25 al giorno") → posti liberi in tempo reale (6 scrivanie, giorno per giorno) → il negozio (foto dell'ingresso + "Ti accoglie Marcella") → la nostra storia (timeline GSAP, l'unica animazione "firma") → prezzi (4 card con "per chi è" e costo al giorno; sotto: paghi quando arrivi, disdici gratis, fattura, card) → una giornata da noi → lo spazio (2 foto sala + cosa trovi / cosa non c'è) → Bagnarino Card (scala premi + riquadro abbonati) → per chi è → dove siamo → FAQ → chiusura.
- **Foto:** `img/foto/esterno-*.webp` (ingresso vero, ritoccato) e `sala-coworking-*.webp`, `sala-stampa-*.webp` (sala vera trasformata in coworking con AI). Le altre sono illustrative; in fondo al sito c'è la nota "immagini illustrative". Il servizio fotografico vero arriverà: le foto vanno sostituite senza toccare il layout.
- **Area riservata** (rifatta da poco, da gestionale): Oggi ("Da fare adesso", nuove richieste da accettare, chi arriva con 3 passi Accettata → È arrivato → Pagato, un solo pulsante per riga), scheda prenotazione con tutte le azioni, Calendario a griglia scrivanie × giorni (desktop) / giorno per giorno (telefono), Clienti, Incassi (CSV commercialista), Crescita (KPI, "In breve", imbuto, grafici; i numeri social/Google li inserisce solo Apex), Impostazioni. Le prenotazioni dal sito nascono "da accettare" (colonna `accettata`); il cliente riceve comunque subito la conferma.
- **Stile attuale:** palette blu notte `#1F2B3A` / ocra `#B98A45` / avorio `#FAF7F1`; titoli Fraunces (serif), testo Plus Jakarta Sans (font locali in `fonts/`). Pulsanti in rilievo con ombra 3D, card bianche con bordo, etichette pill.

## Cosa voglio adesso

Una **trasformazione grossa di UI e di esperienza**: il sito oggi è pulito ma semplice, e "sa di fatto con l'AI". Lo voglio **premium**, da studio di design, con un'identità che si ricorda. Pensa a come lo farebbe un'agenzia da 20k€ per un cliente di nicchia: un coworking dentro un negozio storico Olivetti del 1983, in un palazzo del centro, con scrivanie di legno e macchine per ufficio vere.

### Direzione
- Parti dall'identità vera: **Olivetti, 1983, carta, macchina per scrivere, negozio di quartiere, Alessandria**. Non "coworking generico da startup". Il lusso qui è la calma, la cura, il dettaglio: non il vetro e il neon.
- Elimina tutto ciò che fa "template AI": card tutte uguali con bordino, pulsanti 3D con ombra gialla, pill arrotondate ovunque, etichette "LA PIÙ CONVENIENTE" in maiuscoletto, icone check verdi in fila, gradienti radiali di sfondo, sezioni che ripetono lo stesso schema "occhiello + titolo con corsivo ocra + griglia di card".
- Costruisci un vero **sistema tipografico** (scala, ritmo verticale, grandi contrasti di corpo, numeri trattati come elementi grafici), una **griglia editoriale** con asimmetrie e spazi bianchi generosi, **foto grandi e protagoniste**, texture e dettagli fisici (carta, inchiostro, timbro, scontrino, etichetta Olivetti) usati con misura.
- Fai scelte forti e poche, non tante decorazioni. Puoi cambiare palette e caratteri se la proposta è migliore, ma motiva ogni scelta e tieni leggibilità e contrasto (WCAG AA).
- La **Bagnarino Card** deve diventare un oggetto desiderabile: una tessera fisica credibile, con i timbri che sembrano timbri.
- Le **animazioni GSAP** devono sembrare "di mestiere": poche, coerenti, legate allo scorrimento, mai gratuite. Rispetta `prefers-reduced-motion`. Senza GSAP la pagina deve essere già completa.
- Mobile first: oltre l'80% del traffico è da telefono (arriva da Google e Instagram). Barra inferiore con "Prenota" sempre a portata di pollice.

### Vincoli non negoziabili
1. **La conversione viene prima dell'estetica.** Ogni sezione deve avere uno scopo: far prenotare o togliere un dubbio. Il percorso "vedo i posti liberi → scelgo la formula → prenoto in 30 secondi" deve restare evidente e più corto, non più lungo. Pulsante primario sempre visibile.
2. **Niente dati inventati:** recensioni, numeri, nomi, foto di persone. Un dato non confermato resta spento, come già fa `config.js`. Le foto nuove sono benvenute solo se generate dagli spazi veri o segnaposto chiaramente indicati nel README.
3. **Non rompere il motore:** `prenota.js`, `api/`, `admin.js`, i selettori `data-*` usati da `main.js`/`prenota.js`/`tessera.js`, il flusso di prenotazione, i test. Esegui `npm test` e deve restare verde. Esegui `python3 strumenti/versiona.py` prima del commit.
4. **I prezzi e i testi commerciali** li cambi solo in `config.js`, mai sparsi nell'HTML (salvo i valori di partenza).
5. **Prestazioni:** niente librerie pesanti nuove, niente web font esterni (usa `fonts/` o aggiungi file woff2 locali), immagini in webp con srcset, LCP sotto i 2,5 s su 4G.
6. **Accessibilità:** contrasto AA, focus visibile, HTML semantico, tocchi da 44 px.
7. L'**area riservata** non va ridisegnata in questo giro: solo coerenza di colori/caratteri se cambi il sistema.

### Come lavorare
1. Prima leggi `index.html`, `styles.css`, `main.js`, `animazioni.js`, `config.js`, `prenota.html` e guarda il sito vero: avvia `npm run locale` e fai screenshot con Playwright (Chromium è già installato) a 390 px e 1440 px.
2. Proponi **una direzione sola, scritta e motivata** (identità, tipografia, palette, griglia, 3 sezioni chiave disegnate a parole), poi realizzala. Niente 3 varianti: scegli tu la migliore e dimmi perché.
3. Procedi per sezioni, dalla più importante per la conversione: apertura + posti liberi → prezzi → lo spazio/foto → card → resto. Dopo ogni blocco, screenshot mobile e desktop e un messaggio breve con cosa hai cambiato e cosa viene dopo.
4. Applica lo stesso sistema anche a `prenota.html`, `prenotazione.html`, `card.html`, `404.html`, `privacy.html`, `cookie.html` e alle email (`api/_email-template.js`), così il brand è uno solo dall'inizio alla fine.
5. Alla fine aggiorna `README.md` (lista foto da scattare con inquadrature precise per il nuovo layout) e, se cambia qualcosa che Marcella vede, il documento in `../bagnarino/`.
6. Commit piccoli con messaggi in italiano semplice (come i precedenti nel log). Push sul branch. **Non fare merge su `main` senza che te lo chieda.**

Criterio con cui giudicherò il risultato: lo mostro a Marcella e a un cliente freelance di Alessandria, e tutti e due devono dire "questo è un posto serio, prenoto". Se una cosa è bella ma non aiuta a prenotare, toglila.
