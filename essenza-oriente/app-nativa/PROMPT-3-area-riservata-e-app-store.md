# PROMPT 3 di 3 — Area riservata, rifinitura e App Store

Copia da qui in giù e incollalo in Claude Code, dopo che il prompt 2 funziona nel simulatore.

---

Prompt 3 di 3. App cliente completa e collegata a Supabase. Ora costruisci: **(A) l'area riservata** per titolari e terapisti, **(B) il pannello web** per usarla dal computer, **(C) la rifinitura finale e tutto ciò che serve per pubblicare** su App Store e Google Play. Riusa schema, RPC, design system e motore animazioni esistenti. Le firme delle funzioni staff esistono già dal prompt 1: completale e testale.

## A. Area riservata (dentro la stessa app, rotte `app/gestione/`)

### Accesso
- Ingresso: link discreto "Area riservata" in fondo al Profilo e al menu, oppure deep link `essenzadoriente://gestione`.
- Login proprio, diverso da quello dei clienti: logo, "Area riservata", Email + Password (`signInWithPassword`), mostra password, "Password dimenticata?" (email di reset con codice a 6 cifre, stesso stile delle altre email) e **"Cambia password"** dentro l'area.
- **Face ID / Touch ID** (expo-local-authentication) per riaprire l'area dopo il primo accesso; sessione persistente, ma password richiesta di nuovo ogni 30 giorni.
- Accesso solo con ruolo `admin` (titolari) o `staff` (terapisti), verificato **nel database** con `has_role`/`is_staff`; chi non ha il ruolo vede "Accesso riservato ai titolari" e torna all'app.
- **Primo titolare**: script `npm run crea-titolare -- --email essenzadorientebs@gmail.com` (usa la service role key in locale, mai nell'app) che crea l'utente, assegna `admin` e invia l'email per impostare la password. Dopo, gli altri si invitano dall'app.
- Permessi:
  - **admin (titolari)**: tutto, compresi incassi, prezzi, premi, regole punti, rettifiche punti, staff, esportazioni.
  - **staff (terapisti)**: agenda, completare visite, no-show, scanner, schede clienti e note; niente incassi totali, impostazioni, esportazioni, rettifiche.

### Navigazione dell'area
Telefono: tab bar propria **Oggi · Agenda · Clienti · Scanner · Altro**. iPad e computer: menu laterale a sinistra. Stile: stesso brand ma più sobrio e denso di informazioni, da strumento di lavoro; transizioni rapide 150–250 ms, contatori animati, niente effetti lunghi.

### Oggi (pannello)
- "Buongiorno, [nome]" + data.
- 4 numeri grandi con freccia e confronto col periodo precedente: prenotazioni di oggi, della settimana, clienti nuovi del mese, **incasso del mese (solo admin)**.
- Lista cronologica di oggi: ora, cliente, trattamento, terapista, stato; azioni rapide con swipe: **Completata** (inserisci l'importo pagato, precompilato col prezzo → accredita punti), **No-show**, Chiama, WhatsApp.
- **Da tenere d'occhio**: clienti che non tornano da 45+ giorni (WhatsApp precompilato "Ciao [nome], ci manchi! Questa settimana abbiamo posto per te…"), premi da validare, buoni regalo richiesti/da incassare, compleanni della settimana.
- Grafici (victory-native o Skia): prenotazioni ultimi 30 giorni, trattamenti più richiesti, provenienza (app / inserite a mano), tasso di ritorno a 30/60/90 giorni.

### Agenda
- Vista giorno / settimana / mese, colonne Jenny e Luca, blocchi colorati per stato, linea "adesso" che scorre.
- Trascina una prenotazione per spostarla (con conferma e controllo disponibilità), pinch per lo zoom orario.
- Tocco → dettaglio: cliente con contatti, trattamento, extra, nota, gravidanza, premio applicato, storico; azioni: completa, no-show, sposta, annulla con motivo.
- **+ Nuova prenotazione** per chi chiama o scrive: cerca cliente (nome, telefono, email) o crealo al volo con solo nome e telefono; trattamento, terapista, orario libero.
- Blocca orari, chiusure straordinarie, ferie per terapista.
- **Tempo reale**: nuova prenotazione dall'app → compare subito, suono leggero, banner "Nuova prenotazione: [nome], [trattamento], [giorno ora]" + push ai titolari.
- Elenco cercabile e filtrabile di tutte le prenotazioni; esportazione CSV (solo admin, share sheet).

### Clienti e tessere
- Elenco con ricerca e filtri: livello, ultima visita, compleanno, consenso marketing, spesa.
- Scheda cliente: contatti (Chiama/WhatsApp/Email), tessera con saldo e livello, **storico movimenti punti** (data, motivo, chi), visite e spesa totale, premi attivi/usati, buoni, preferenze, **note interne** (solo staff), amiche invitate.
- Azioni: accredita visita senza prenotazione (`staff_walkin_visit`), valida premio, **rettifica punti** (solo admin, motivo obbligatorio), messaggio WhatsApp.

### Scanner
- Fotocamera a tutto schermo (expo-camera) con mirino animato; riconosce QR tessera (`staff_resolve_qr`) o codice premio/buono → apre la scheda con l'azione giusta già pronta; haptic e suono di conferma.
- Campo "Inserisci codice a mano" (serve anche nel simulatore).

### Altro → Impostazioni (solo admin)
- Trattamenti: testi, durata/varianti, prezzo, foto (upload su Supabase Storage), attivo, ordine.
- Premi: nome, punti, attivo.
- Regole punti (`app_settings`): punti per euro, soglie e moltiplicatori dei livelli, punti benvenuto/amica/compleanno.
- Orari di apertura, terapisti, offerta della settimana mostrata in Home ai clienti.
- **Staff**: invita (nome, email, ruolo) → email per impostare la password; cambia ruolo, disattiva.
- **Registro attività** (`staff_audit`): chi ha completato, accreditato, rettificato, quando.
- Push manuale a segmenti (es. "non vengono da 45 giorni", "livello Loto", "compleanno questo mese") con anteprima e limite anti-spam.

### Sicurezza
- Tutto passa da RLS e RPC con controllo ruolo; test che dimostrano che un cliente non può leggere altri clienti né chiamare funzioni staff, e che un terapista non vede incassi né impostazioni.
- Nessuna service role key nell'app; le operazioni amministrative sensibili passano da edge functions con verifica del JWT e del ruolo.

## B. Pannello web per il computer dei titolari

- Esporta la stessa area con **Expo Router per il web** (`npx expo export -p web`) come sito separato, layout desktop con menu laterale, tabelle larghe, scorciatoie da tastiera (N = nuova prenotazione, / = cerca).
- Sul web puoi usare **GSAP vero** (solo nei componenti `.web.tsx`) per le micro-animazioni del pannello: contatori, ingresso delle card, grafici che si disegnano.
- Pubblicazione su **Vercel** al sottodominio `gestione.essenzadoriente.it` (il dominio è già gestito su Vercel): dammi i passaggi.

## C. Rifinitura finale

- Revisione completa di tutte le schermate in 4 temi (alba, giorno, tramonto, notte), su iPhone SE, iPhone 16 Pro, iPhone 16 Pro Max, iPad, con Dynamic Type grande e VoiceOver: correggi ogni testo tagliato, sovrapposizione, contrasto insufficiente, fascia vuota in basso.
- Performance: avvio a freddo < 2 s su iPhone 12, 60 fps nelle animazioni principali (misura e riporta i numeri), immagini ottimizzate (expo-image con cache), bundle snello.
- Stati vuoti, errori e offline progettati ovunque.
- **Sentry** (o simile) per i crash, con dati personali mascherati.
- Analytics rispettosi della privacy (solo con consenso): app_open, booking_started, booking_step, booking_completed, reward_redeemed, referral_sent, gift_requested, push_opened.
- Test: unità, componenti, SQL, e flussi **Maestro** completi per cliente e staff; tutto verde.

## D. Preparazione App Store e Google Play

- `app.config.ts`: nome "Essenza d'Oriente", bundle id `it.essenzadoriente.app`, versione 1.0.0, icone (inclusa versione dark/tinted iOS 18), splash, schema deep link, orientamento verticale (iPad anche orizzontale per l'area riservata).
- Testi dei permessi in italiano chiari: fotocamera ("per leggere la tessera dei clienti in cassa"), notifiche, calendario, posizione (solo se usata), Face ID.
- **PrivacyInfo.xcprivacy** (privacy manifest) e risposte per le "etichette privacy" di App Store Connect: elenco esatto dei dati raccolti e perché.
- Requisiti Apple da verificare uno per uno e confermare: Accedi con Apple presente perché c'è Google; eliminazione account dentro l'app; nessun contenuto "demo" o segnaposto; link a Privacy policy; account di revisione funzionante con dati di esempio e istruzioni per il revisore.
- **EAS**: `eas.json` con profili development, preview (TestFlight interno) e production; comandi `eas build -p ios`, `eas submit -p ios`, e gli equivalenti Android.
- Testi per lo store in italiano: nome, sottotitolo (30 caratteri), descrizione persuasiva, parole chiave, novità della versione; elenco di 6 screenshot da fare (Home, Prenota, Tessera, Premi, Quiz, Buono regalo) e script Maestro che li genera automaticamente dal simulatore nelle misure richieste.
- **Checklist finale** in `RELEASE.md`: cosa ho fatto, cosa deve fare il titolare (account Apple Developer, accettare gli accordi, dati fiscali e bancari, compilare le etichette privacy), ordine dei passaggi da TestFlight alla pubblicazione.

## Consegna

Al termine dimmi in parole semplici: come entra il titolare la prima volta, come invita Jenny e Luca, come provare l'app su TestFlight sul mio iPhone, e quali passaggi mancano per la pubblicazione ufficiale.
