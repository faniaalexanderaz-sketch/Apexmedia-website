# PROMPT — App "Essenza d'Oriente" (fidelity + prenotazione)

Copia tutto quello che sta sotto la riga e incollalo nel tool (Lovable, Claude Code, Bolt, Cursor). Allega il logo (PNG/SVG trasparente) e le foto dalla cartella `essenza-oriente/foto/`.

---

Sei un team senior (product designer + iOS/Android engineer + growth marketer) che costruisce un'app premium per un centro benessere. Livello atteso: un'app da agenzia da 10.000 €, pronta da mostrare al cliente e da pubblicare. Niente template generici, niente placeholder "Lorem ipsum", niente look da gestionale.

## 1. Il cliente

**Essenza d'Oriente — Centro Olistico**
- Via San Lorenzo 46, 15121 Alessandria (AL), a due passi dal Duomo
- Tel/WhatsApp: +39 331 715 3533
- Aperto tutti i giorni, 09:30–22:30
- 5,0 ★ su Google, 146 recensioni (usalo come riprova sociale)
- Prenotazioni oggi: telefono, WhatsApp, Treatwell (salone 532986)
- Aperto 7 giorni su 7, anche domeniche, festivi e Natale (usalo come vantaggio: "Prenota anche stasera alle 21")
- Pagamento in sede: contanti, carta di credito o bancomat. Nessuna carta richiesta per prenotare.
- Nome cinese del centro: 东方之♥养生馆 (fa parte del marchio, va sotto il logotipo)
- Terapisti citati nelle recensioni: Jenny e Luca (Luca è il più citato per la riflessologia plantare)
- Social: instagram.com/essenza.oriente · tiktok.com/@essenzaoriente.al · Facebook
- P.IVA 14409690964 (da mostrare nel Profilo, sezione Info legali)

**Claim reali del brand (usali nei testi):**
- "Un piccolo rifugio d'Oriente nel cuore di Alessandria"
- "Il centro olistico più recensito di Alessandria"
- "Vieni come sei: al resto pensiamo noi"
- "Durata e prezzo sempre in chiaro"

**Recensioni Google reali (per la striscia in Home, non inventarne altre):**
- Ella Grace (Local Guide): visitatrice dall'Australia, ringrazia Jenny e il team
- Lily Lily: gentilezza, pulizia, personale efficiente
- Roberta Massobrio: accoglienza cordiale e professionale, riflessologia plantare con Luca "molto bravo"
- Mirko: riflessologia plantare professionale e precisa, rilassamento immediato

**FAQ (da mettere in una sezione "Prima volta?" e nella conferma prenotazione):**
- Alla prima visita ti accogliamo, ti chiediamo preferenze e zone da evitare e ti spieghiamo il trattamento. Non serve nessuna preparazione.
- Asciugamani, teli e ciabattine li fornisce il centro.
- Abbigliamento: torso nudo o intimo per i massaggi con olio, abiti comodi per gli altri trattamenti.
- Arriva 5-10 minuti prima.
- Gravidanza: va segnalata quando prenoti. Alcuni trattamenti, come la coppettazione, sono sconsigliati e ti proponiamo un'alternativa. Nel flusso di prenotazione aggiungi la domanda "Sei in gravidanza?" e, se la risposta è sì, nascondi la Coppettazione e proponi un'alternativa.
- Le sedute durano da 25 minuti (trattamenti brevi) a 90 minuti (Massaggio Spa).

**Listino reale (usa questi dati, non inventarne altri):**
| Trattamento | Durata | Prezzo |
|---|---|---|
| Massaggio Oli Essenziali (cervicale e schiena) | 60 min | 60 € |
| Tuina Shiatsu | 50 min | 50 € |
| Massaggio Spa (corpo completo) | 90 min | 90 € |
| Riflessologia Plantare | 40 / 60 min | 35 € / 50 € |
| Coppettazione (cupping) | — | 25 € |
| Gua Sha | — | 25 € |
| Pulizia delle Orecchie (tecnica tradizionale cinese) | — | 25 € |
| Pedicure (stile tradizionale cinese) | — | 35 € |

## 2. Obiettivo di business (guida ogni scelta)

1. Aumentare la frequenza di ritorno dei clienti (da 1 visita ogni 2-3 mesi a 1 al mese).
2. Spostare le prenotazioni da Treatwell (commissioni) all'app (canale diretto, 0 %).
3. Far crescere il valore medio (upsell: 40 → 60 min, aggiunta Gua Sha / Coppettazione).
4. Raccogliere contatti e consenso marketing per push e promo.

Ogni schermata deve servire almeno uno di questi 4 obiettivi. Se un elemento non serve, toglilo.

## 3. Stack

- **App:** React Native + Expo (iOS + Android da un solo codice), TypeScript, Expo Router.
  In alternativa, se il tool genera solo web: PWA installabile (React + Vite + Tailwind), mobile-first, con "Aggiungi alla schermata Home".
- **Backend:** Supabase (Auth, Postgres, Row Level Security, Edge Functions, Realtime).
- **Login:** numero di telefono con OTP via SMS + Apple/Google Sign-In. Niente password.
- **Notifiche:** Expo Push (o Web Push per la PWA).
- **Tessera nel Wallet:** pass Apple Wallet / Google Wallet con QR del cliente (fase 2 se serve).

## 4. Design system (obbligatorio, è il brand reale)

### Colori (token)
```
--pergamena:        #D6E6C0   sfondo principale (verde salvia chiaro dal logo)
--pergamena-scura:  #C6DBA9   sfondi secondari, separatori morbidi
--salvia:           #DCE9D5   card, superfici
--salvia-scura:     #9FB894   bordi, stati disattivi, icone secondarie
--bosco:            #2C5138   colore primario: titoli, bottoni principali, tab bar attiva
--bosco-scuro:      #22402C   pressed state, header scuri, sfondo della tessera
--ink:              #2A3A2E   testo forte
--testo:            #4C5A4E   testo corrente
--oro:              #B99A45   accento premium: punti, sigilli, premi, livelli
--oro-chiaro:       #D9C68C   bagliori, progress bar, dettagli
--cuore:            #C0392B   SOLO per l'ideogramma 心 (firma del brand), mai per errori
--whatsapp:         #1FA855   solo bottone WhatsApp
linea:              rgba(44,81,56,.16)
```
Escluso: il verde lime della vetrina fisica. Niente nero puro, niente bianco puro come sfondo.
Dark mode: sfondo `#1A2A1F`, superfici `#22402C`, testo `#E8EFE0`, oro invariato.

### Tipografia
- **Display / titoli hero:** Fraunces (variabile, optical sizing attivo), anche in corsivo per i claim.
- **Titoli di sezione e nomi trattamenti:** Cormorant Garamond 600–700.
- **Testo e UI:** Lato 400/700 (in alternativa Jost per numeri e label).
- Numeri dei punti: Fraunces grande, cifre tabellari.
- Scala: 34 / 28 / 22 / 18 / 16 / 14 / 12. Altezza riga 1.15 sui titoli, 1.6 sul testo.

### Forma e materia
- Raggio: 14 px card, 999 px bottoni a pillola, 22 px bottom sheet.
- Ombre morbide e verdi, mai grigie: `0 8px 24px rgba(34,64,44,.12)`.
- Texture: grana leggera tipo carta di riso + macchie di luce sfumate oro/salvia dietro le sezioni.
- Motivi: sigillo rosso/oro in stile timbro cinese per premi e offerte, linee sottili di bambù come divisori, 心 rosso piccolo come firma nel footer e nella schermata di completamento.
- Icone: lineari, tratto 1.5 px, angoli arrotondati (stile Lucide), colore bosco.
- Foto: reali del centro (candele, bambù, pietre, oli). Mai stock con persone sorridenti in accappatoio bianco.

### Logo
Logo ufficiale dell'app: `essenza-oriente/logo-app/logo-app-scelto.png` (creato apposta per l'app; il vecchio volantino `foto/volantino-logo.jpg` è solo storico). Ricostruiscilo identico come componente SVG vettoriale (serve per animarlo e per le icone). Dall'alto in basso:
1. ornamento di loto oro stilizzato (5 petali a linea sottile) con due linee orizzontali sottili che si allungano ai lati;
2. "ESSENZA D'ORIENTE" tutto maiuscolo, serif classico romano (font Cinzel 600/700, simile al Trajan), colore --bosco;
3. "CENTRO OLISTICO" maiuscolo spaziato, Cinzel, colore --oro, tra due trattini oro;
4. "东方之心养生馆" (Noto Serif SC), colore --bosco, con il 心 bianco dentro un cuore rosso --cuore.
Varianti: completa (splash, onboarding), compatta orizzontale (loto + nome, per gli header), monogramma (solo loto, per l'icona dell'app e il QR). Versione oro su bosco-scuro per la tessera. Area di rispetto pari all'altezza della "E".
Cornice ovale a doppia linea verde/oro del volantino: usala come motivo decorativo (splash, tessera, schermata di successo). Area di rispetto pari all'altezza della "E". Versione chiara su bosco-scuro per la tessera e lo splash.

### Movimento (firma dell'app: deve stupire al primo tocco)
Libreria: GSAP (+ @gsap/react `useGSAP`, Flip, SplitText, DrawSVG, MorphSVG, Draggable, InertiaPlugin, CustomEase, ScrollTrigger). In React Native: Reanimated 3 + Moti + Skia con le stesse coreografie.
- **Transizioni che partono dal dito:** ogni cambio schermata nasce dal punto toccato (clip-path circolare che si espande dalle coordinate del tap). Card trattamento → si espande in scheda dettaglio come elemento condiviso (Flip): la foto vola e diventa l'header.
- **Tab bar viva:** indicatore oro che scivola con easing elastico, icona che si disegna (DrawSVG) quando diventa attiva, tab Tessera centrale che "respira".
- **Bottoni che luccicano:** CTA principale con riflesso oro che attraversa il bottone ogni 4 s; alla pressione scala 0.96 con molla, onda d'inchiostro dal punto toccato, vibrazione leggera; bottoni magnetici che seguono leggermente il dito.
- **Tessera olografica:** si inclina in 3D seguendo dito/giroscopio, riflesso oro che scorre con l'inclinazione; punti che contano in su; flip 3D con molla.
- **Sigillo:** quando arrivano i punti scende, si schiaccia ("timbro"), polvere d'oro, barra di avanzamento che si riempie con bagliore.
- **Premio sbloccato:** fiore di loto che si apre + petali d'oro che esplodono dal centro.
- **Splash:** logo che si disegna tratto per tratto, lettere che salgono una a una (SplitText), 心 che pulsa una volta.
- **Liste e scroll:** ingresso a cascata (stagger), parallasse sulla foto dell'header, header che si comprime, pull-to-refresh con loto che si apre.
- **Prenotazione:** passaggi che scorrono con profondità; slot orario che si trasforma (morph) quando lo scegli; bottone "Conferma" che diventa una spunta e poi un'onda che apre la schermata di successo.
- **Bottom sheet:** trascinabili con inerzia e rimbalzo.
Regole: solo transform/opacity (60 fps), micro-interazioni 150–250 ms, momenti "wow" 500–900 ms, easing personalizzato morbido; con "riduci movimento" attivo tutto diventa dissolvenza semplice. Le animazioni guidano verso le azioni che fanno guadagnare (Prenota, Riscatta), non distraggono.

## 5. Programma fedeltà "Il Cammino del Loto"

### Regole
- **1 punto ogni 1 € speso.** I punti si accreditano solo a trattamento completato (confermato dallo staff), non alla prenotazione.
- **Benvenuto:** 50 punti all'iscrizione + Gua Sha in omaggio alla prima prenotazione fatta dall'app (motivo per scaricare l'app e lasciare Treatwell).
- **Premi (catalogo):**
  - 250 punti → un trattamento da 25 € in omaggio (Gua Sha, Coppettazione o Pulizia Orecchie)
  - 400 punti → upgrade gratuito 40 → 60 min sulla Riflessologia
  - 600 punti → Massaggio Oli Essenziali 60 min in omaggio
  - 900 punti → Massaggio Spa 90 min in omaggio
- **Livelli** (calcolati sugli ultimi 12 mesi):
  - Germoglio (0–299) — base
  - Bambù (300–799) — punti x1,25, priorità sugli orari serali
  - Loto (800+) — punti x1,5, regalo di compleanno (trattamento 25 €), accesso anticipato alle promo
- **Porta un'amica:** codice personale; 100 punti a entrambe quando l'amica completa il primo trattamento.
- **Compleanno:** 50 punti + push dedicata per tutti i livelli.
- **Scadenza:** i punti scadono dopo 12 mesi senza visite (avviso push a 30 giorni dalla scadenza: è un motivo per tornare).

### Tessera digitale (schermata principale)
- Card verticale verde bosco-scuro con texture, logo in oro, nome del cliente, livello con icona, saldo punti grande.
- Barra di avanzamento oro verso il prossimo premio: "Ti mancano 40 punti per un Gua Sha in omaggio".
- QR dinamico (si rigenera ogni 30 s) che lo staff scansiona alla cassa: anti-frode e accredito punti anche per chi ha prenotato al telefono o su Treatwell.
- Tocco sulla card → si gira (flip 3D) e mostra lo storico visite.

## 6. Prenotazione integrata

Flusso in massimo 4 tap, con barra di avanzamento:
1. **Trattamento** — card con foto, durata, prezzo e "+X punti". Tag "Più scelto" sul Massaggio Oli Essenziali.
2. **Data e ora** — calendario orizzontale a 14 giorni + griglia orari liberi (slot reali da database, aggiornati in tempo reale). Mostra "Ultimi 2 posti stasera" quando è vero.
3. **Extra (upsell)** — "Aggiungi Gua Sha +25 € (+25 punti)" / "Passa a 60 min +15 €". Un solo schermo, saltabile.
4. **Conferma** — riepilogo, punti che guadagnerà, applica un premio se disponibile, nota per la terapista, bottone "Conferma prenotazione".

Dopo la conferma: schermata con 心, aggiunta al calendario del telefono, indicazioni Maps, promemoria push 24 h e 2 h prima.
Gestione: sposta o annulla fino a 12 h prima (oltre: solo telefonata). Lista d'attesa automatica sugli slot pieni con push quando si libera.
Pagamento in sede. Fase 2: caparra con Stripe solo per gli slot del sabato sera.
Sempre visibile un'uscita rapida: "Preferisci scriverci? WhatsApp" (molti clienti prenotano così, non perderli).

## 7. Schermate

**Cliente**
1. Splash con logo su bosco-scuro + onboarding in 3 schermate (cosa guadagni, come funziona, attiva le notifiche) → login OTP.
2. **Home:** saluto per nome e momento della giornata, mini-tessera con punti e progresso, CTA principale "Prenota", "Il tuo prossimo appuntamento", offerta della settimana (sigillo), trattamenti consigliati in base allo storico, recensioni 5,0 ★.
3. **Prenota** (flusso sopra).
4. **Tessera** (QR, livello, progresso, storico).
5. **Premi:** catalogo con stato bloccato/sbloccato, "Riscatta" → genera un codice valido 30 giorni.
6. **Trattamenti:** schede con foto, benefici, per chi è indicato, durata, prezzo, CTA "Prenota questo".
7. **Profilo:** dati, preferenze (terapista, pressione del massaggio, allergie agli oli), codice amica, consensi privacy/marketing (GDPR), elimina account.

Tab bar: Home · Prenota · Tessera (al centro, in evidenza, oro) · Premi · Profilo.

**Staff / titolare (area admin, anche da tablet o web)**
- Agenda del giorno e della settimana, blocco orari, ferie.
- Scanner QR → accredita punti sull'importo reale o valida un premio.
- Scheda cliente: visite, spesa, punti, preferenze, note.
- Invio push segmentate (es. "clienti che non vengono da 45 giorni", "livello Loto", "compleanno questo mese").
- Gestione listino, premi e offerte senza toccare il codice.
- Dashboard: prenotazioni dall'app vs altri canali, clienti attivi, tasso di ritorno a 30/60/90 giorni, premi riscattati, valore medio per visita.

## 8. Automazioni di retention (le push che riportano clienti)
- 24 h dopo la visita: "Com'è andata?" → se 5 stelle, invito a lasciare la recensione su Google.
- 30 giorni senza visite: "Le tue spalle ti ringrazieranno" + slot liberi della settimana.
- A 20 punti da un premio: "Sei a un passo dal tuo omaggio".
- Punti in scadenza (30 giorni prima).
- Slot vuoti dell'ultimo minuto (oggi, fascia serale): promo flash solo ai livelli Bambù e Loto.
- Massimo 2 push a settimana per cliente.

## 9. Dati (Supabase)
Tabelle: `profiles`, `treatments`, `staff`, `availability`, `bookings`, `points_ledger` (ogni movimento, mai solo un saldo), `rewards`, `redemptions`, `referrals`, `tiers`, `push_campaigns`, `events` (analytics).
RLS: ogni cliente vede solo i propri dati; lo staff ha un ruolo dedicato. Accredito punti solo da Edge Function chiamata dallo staff (mai lato client).

## 10. Qualità (criteri di accettazione)
- Prenotazione completata in meno di 60 secondi da un nuovo utente.
- Avvio app sotto 2 s, scroll fluido a 60 fps.
- Accessibilità: contrasto WCAG AA, target tap da 44 px, Dynamic Type, VoiceOver/TalkBack.
- Tutti i testi in italiano, tono caldo e calmo, dai del "tu". Niente gergo tecnico.
- Stati vuoti, errori e caricamenti progettati (skeleton in salvia, non spinner grigi).
- Tracciamento eventi: `app_open`, `booking_started`, `booking_step`, `booking_completed`, `reward_redeemed`, `referral_sent`, `push_opened`.

## 11. Ordine di consegna
1. Design system in codice (token, componenti: Button, Card, LoyaltyCard, TreatmentCard, TimeSlot, Sigillo, BottomSheet, TabBar).
2. Home + Tessera + Prenotazione con dati finti realistici (quelli del listino sopra) → mostrami le schermate.
3. Backend Supabase, auth, logica punti.
4. Area staff + scanner QR.
5. Push e automazioni.
6. Build per TestFlight / Google Play interno.

Prima di scrivere codice, mostrami in breve: la mappa delle schermate e il componente LoyaltyCard. Poi procedi.
